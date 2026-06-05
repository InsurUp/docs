---
title: "InsurUp ile Giriş: Uygulama Desenleri ve Sorun Giderme"
sidebar_position: 9
slug: /entegrasyon/insurup-ile-giris-uygulama-desenleri-ve-sorun-giderme
---

# InsurUp ile Giriş: Uygulama Desenleri ve Sorun Giderme

Bu rehber, [InsurUp ile Giriş (OAuth 2.0 / OIDC)](/entegrasyon/insurup-ile-giris-oauth-entegrasyonu) akışını **kendi uygulamanızda nasıl kuracağınızı** desenlerle anlatır ve gerçek entegrasyonlarda en sık karşılaşılan sorunların çözümlerini içerir.

---

## 1. Hangi deseni seçmeliyim?

| | **Desen A — Public SPA** | **Desen B — Confidential BFF** |
|---|---|---|
| **İstemci Türü** | Public (PKCE, secret yok) | Confidential (secret sunucuda) |
| **Uygun olduğu yer** | Saf tarayıcı uygulaması (React/Vue, statik host) | Sunucusu olan uygulama (Next.js, .NET, Node API…) |
| **Token nerede?** | Tarayıcıda (bellek/storage) | Refresh token **sunucuda httpOnly cookie**; access token kısa ömürlü |
| **Güvenlik** | Orta | Daha yüksek (secret ve refresh token tarayıcıya inmez) |
| **Kurulum eforu** | Düşük | Orta |

:::tip
Uygulamanızın bir backend'i varsa (örn. Next.js), **Desen B (BFF)** önerilir. `client_secret` ve `refresh_token` tarayıcıya hiç inmez.
:::

---

## 2. Desen A — Public SPA (Authorization Code + PKCE)

OAuth istemcisini **Public / Web** olarak oluşturun (secret yok). Tarayıcıda hazır bir OIDC kütüphanesi (örn. `react-oauth2-code-pkce`) kullanmak en kolayıdır:

```typescript
import type { TAuthConfig } from 'react-oauth2-code-pkce';

const authServer = 'https://auth.insurup.com';

export const authConfig: TAuthConfig = {
  clientId: '<CLIENT_ID>',
  authorizationEndpoint: `${authServer}/connect/authorize`,
  tokenEndpoint: `${authServer}/connect/token`,
  redirectUri: `${window.location.origin}/callback`,
  scope: 'openid profile offline_access core-api',
  autoLogin: false,
  decodeToken: false,
};
```

Token'ı alıp API çağrılarında `Authorization` header'ına ekleyin:

```typescript
const apiBaseUrl = 'https://api.insurup.com';

async function getMyProfile(accessToken: string) {
  const response = await fetch(`${apiBaseUrl}/agent-users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.json();
}
```

Kütüphane PKCE'yi, code değişimini ve refresh'i sizin için yönetir.

:::info .NET SDK
Sunucu tarafında .NET kullanıyorsanız, `InsurUp.Sdk` paketini DI ile kaydedip `IInsurUpClient` üzerinden API çağrıları yapabilirsiniz. Detaylar için [OAuth Entegrasyon Rehberi](/entegrasyon/insurup-ile-giris-oauth-entegrasyonu) sayfasındaki SDK bölümüne bakın.
:::

---

## 3. Desen B — Confidential BFF (sunucu aracılı)

`client_secret` sunucuda kalır; tarayıcı yalnızca kendi sunucunuzla konuşur. Tipik olarak 4 uç tanımlarsınız (örnekler Next.js Route Handler mantığındadır, dile/çatıya uyarlanabilir):

| Uç | Görevi |
|----|--------|
| `GET /api/auth/login` | PKCE + `state` üretir (geçici httpOnly cookie'lere yazar), kullanıcıyı `/connect/authorize`'a yönlendirir |
| `GET /api/auth/callback` | `code`'u sunucuda `/connect/token` ile token'a çevirir, **refresh token'ı httpOnly cookie'ye** yazar, kullanıcıyı hedef sayfaya yönlendirir |
| `POST /api/auth/session` | httpOnly refresh cookie'siyle taze bir **access token** üretir (refresh token tarayıcıya inmez) |
| `POST /api/auth/logout` | Sunucudaki refresh cookie'sini temizler |

Akış:

1. Kullanıcı **"InsurUp ile Giriş"** butonuna basar → `GET /api/auth/login` → auth.insurup.com'a yönlenir.
2. Giriş + 2FA auth sayfasında tamamlanır → `callback`'e döner → sunucu token alır, refresh cookie'yi yazar, uygulamaya yönlendirir.
3. Uygulama açılışta `POST /api/auth/session` ile access token'ı alır (sayfa yüklendiğinde "oturum geri yükleme").
4. Access token süresi dolunca yine `/api/auth/session` ile yenilenir.

:::tip Token endpoint çağrısı
Confidential istemcide `/connect/token` isteğine `client_id` **ve** `client_secret` ekleyin; içerik tipi `application/x-www-form-urlencoded` olmalı.
:::

---

## 4. Onay ekranı (Consent)

Agent Panel üzerinden oluşturduğunuz üçüncü parti OAuth istemcileri **açık onay (explicit consent)** gerektirir. Kullanıcı uygulamanıza ilk kez giriş yaptığında, auth.insurup.com üzerinde hangi bilgi ve yetkilere erişim verdiğini gösteren bir **onay ekranı** görür.

- Kullanıcı onayladıktan sonra kalıcı bir yetkilendirme oluşturulur — aynı kapsamlarla tekrar giriş yaparken onay ekranı **tekrar gösterilmez.**
- Kullanıcı "Reddet" seçerse, uygulamanıza `access_denied` hatası döner.

---

## 5. Sorun Giderme (sık karşılaşılan tuzaklar)

Aşağıdakiler gerçek entegrasyonlarda en çok zaman kaybettiren noktalardır.

### 5.1 `authorize` isteği `400 Bad Request` dönüyor

**En olası sebepler (öncelik sırasıyla):**

1. **İstemciye tanımlanmamış scope isteniyor.** İstemci oluştururken seçmediğiniz bir kapsamı `scope` parametresinde isterseniz Auth Server isteği reddeder.
   - Test: `scope`'u sadece `openid profile` yaparak deneyin. Geçiyorsa, sorun scope eşleşmesidir → istemcinizi düzenleyip eksik kapsamları ekleyin. Tam API erişimi için istemci formunda **"Tam Erişim"** modunu seçin.
2. **`redirect_uri` eşleşmiyor** — istemcide kayıtlı adresle birebir aynı olmalı (şema, host, port, path).
3. **`client_id` hatalı / istemci yok.**

:::note
Scope hatası `400` ile gelirken, kimliği doğrulanmamış kullanıcı `302` ile `/login`'e yönlenir. `400` görüyorsanız sorun kullanıcıda değil, **istek/istemci yapılandırmasındadır.**
:::

### 5.2 Ters proxy arkasında callback `localhost:8080` gibi bir adrese gidiyor

Railway, Heroku, Nginx gibi ortamlarda uygulamanız içeride bir adreste (ör. `localhost:8080`) çalışır. Callback sonrası yönlendirmeyi **gelen isteğin URL'inden (`req.url`) türetirseniz**, kullanıcı erişemediği iç adrese yönlendirilir (`ERR_CONNECTION_REFUSED`).

**Çözüm:** Yönlendirmeleri **public origin'den** üretin — örn. kayıtlı `redirect_uri`'nin origin'inden ya da `X-Forwarded-Host`/`X-Forwarded-Proto` başlıklarından. `req.url`'e güvenmeyin.

### 5.3 "Çıkış yaptım ama oturum geri geliyor"

Çıkışta yalnızca tarayıcı tarafındaki durumu (store/localStorage) temizlerseniz, **sunucudaki httpOnly refresh cookie'si** yerinde kalır. Sonraki sayfa yüklemesinde `POST /api/auth/session` cookie'yi bulup oturumu **yeniden açar.**

**Çözüm:** Çıkışta hem istemci durumunu temizleyin **hem de** `POST /api/auth/logout` ile sunucu cookie'sini silin. İstek hemen bir yönlendirmeyle birlikte yapılıyorsa, navigasyon isteği iptal etmesin diye `fetch(..., { keepalive: true })` veya `navigator.sendBeacon` kullanın.

### 5.4 Giriş başarılı ama kullanıcı login sayfasına geri atılıyor

Callback'ten sonra access token henüz istemcide olmayabilir (BFF deseninde `/api/auth/session` ile asenkron alınır). Korumalı sayfanız bu kısa "oturum geri yükleme" anında `isAuthenticated === false` görüp kullanıcıyı login'e atarsa, kullanıcı **giriş yapmış olmasına rağmen** (header'da adı görünür) login sayfasında kalır.

**Çözüm:** Korumalı sayfa yönlendirme guard'larını, oturum geri yükleme tamamlanana kadar bekletin. Bir `isHydrating` bayrağı tutun ve `if (!isHydrating && !isAuthenticated) redirectToLogin()` mantığını kullanın.

### 5.5 "Arka planda şifreyle giriş yapamıyorum"

Auth Server'da `password` grant'i **yoktur**. Kullanıcı adı/şifreyi kendi formunuzda toplayıp arka planda token alamazsınız. Giriş, auth.insurup.com'a **yönlendirme** ile yapılır; 2FA da orada işlenir. Bu bilinçli bir güvenlik tercihidir.

### 5.6 2FA / SMS kodu

2FA etkin kullanıcılarda kod, auth.insurup.com'un kendi sayfasında istenir (ör. SMS). Bu adımı uygulamanız yönetmez; kullanıcı doğrudan auth sayfasında tamamlar.

---

## 6. Güvenlik kontrol listesi

- [ ] `client_secret` yalnızca sunucuda; tarayıcıya/asla repoya konmadı.
- [ ] PKCE (`S256`) ve `state` her giriş isteğinde üretiliyor ve callback'te `state` doğrulanıyor.
- [ ] `redirect_uri`'ler istemcide birebir whitelist'li (prod + geliştirme).
- [ ] Refresh token tercihen sunucuda **httpOnly** cookie'de (BFF); tarayıcıda tutuluyorsa riski kabul edildi.
- [ ] Yönlendirmeler public origin'den üretiliyor (`req.url`'e güvenilmiyor).
- [ ] Çıkış hem istemci durumunu hem sunucu cookie'sini temizliyor.
- [ ] Korumalı sayfalar oturum geri yüklenene (hydration) kadar yönlendirme yapmıyor.

---

## 7. İlgili rehberler

- [InsurUp ile Giriş (OAuth 2.0 / OIDC) Entegrasyon Rehberi](/entegrasyon/insurup-ile-giris-oauth-entegrasyonu) — kavramlar, istemci oluşturma, akış.
- [Servis Hesabı Oluşturma ve Kullanım Kılavuzu](/entegrasyon/servis-hesabi-olusturma) — insan kullanıcı yerine otomasyon (M2M) erişimi.
