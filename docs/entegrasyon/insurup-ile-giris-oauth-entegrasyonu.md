---
title: InsurUp ile Giriş (OAuth 2.0 / OpenID Connect) Entegrasyon Rehberi
sidebar_position: 8
slug: /entegrasyon/insurup-ile-giris-oauth-entegrasyonu
---

# InsurUp ile Giriş (OAuth 2.0 / OpenID Connect) Entegrasyon Rehberi

Bu rehber, **kendi uygulamanıza "InsurUp ile Giriş" özelliğini eklemek** isteyen ekipler içindir. Kullanıcılar, InsurUp hesaplarıyla (acente kullanıcısı kimlikleriyle) sizin uygulamanıza giriş yapar; uygulamanız da bu kimlikle InsurUp API'sine erişebilir.

İnsan kullanıcı girişi için **OAuth 2.0 Authorization Code + PKCE** akışı kullanılır. Bu, otomasyonlar için kullanılan [Servis Hesabı (M2M)](/entegrasyon/servis-hesabi-olusturma) akışından farklıdır.

| | İnsan Kullanıcı Girişi (bu rehber) | Servis Hesabı (M2M) |
|---|---|---|
| **Amaç** | Kullanıcının InsurUp hesabıyla uygulamaya girişi | Sunucu‑sunucu otomasyon |
| **OAuth akışı** | `authorization_code` + PKCE | `client_credentials` |
| **Kullanıcı etkileşimi** | Var (tarayıcıda giriş + 2FA) | Yok |
| **Token kimi temsil eder?** | Giriş yapan gerçek kullanıcıyı | Servis hesabını |

---

## 1. Mimari: İki ayrı sunucu

InsurUp'ta kimlik doğrulama ile API erişimi **iki farklı sunucuda** yaşar. Entegrasyonun temeli budur:

| Sunucu | Adres | Görevi |
|--------|-------|--------|
| **Kimlik Sunucusu (Auth Server)** | `https://auth.insurup.com` | Giriş, 2FA, OAuth/OIDC token üretimi |
| **Core API** | `https://api.insurup.com` | İş verisi (müşteri, teklif, poliçe…) |

Akış kısaca şöyledir: Kullanıcıyı **auth.insurup.com**'a yönlendirip giriş yaptırırsınız → bir **access token** alırsınız → bu token ile **api.insurup.com**'a istek atarsınız.

:::info Discovery (keşif) ucu
Tüm OIDC uçlarını ve yeteneklerini şu adresten programatik olarak alabilirsiniz:
`https://auth.insurup.com/.well-known/openid-configuration`
:::

### OIDC uçları

| Uç | Adres |
|----|-------|
| Authorization | `https://auth.insurup.com/connect/authorize` |
| Token | `https://auth.insurup.com/connect/token` |
| UserInfo | `https://auth.insurup.com/connect/userinfo` |
| Logout (end session) | `https://auth.insurup.com/connect/logout` |
| Logout (alias) | `https://auth.insurup.com/connect/end-session` |
| Introspection | `https://auth.insurup.com/connect/introspect` |
| Revocation | `https://auth.insurup.com/connect/revoke` |
| PAR (Pushed Authorization) | `https://auth.insurup.com/connect/par` |
| Discovery | `https://auth.insurup.com/.well-known/openid-configuration` |

:::tip JWKS (JSON Web Key Set)
JWKS ayrı bir sabit uçta sunulmaz. JWKS URI'sini discovery belgesi (`/.well-known/openid-configuration`) içindeki `jwks_uri` alanından alın.
:::

:::warning ROPC (şifre grant'i) desteklenmez
Auth Server yalnızca `authorization_code`, `refresh_token` ve `client_credentials` grant türlerini destekler. **`password` grant'i yoktur.** Yani "kullanıcı adı + şifreyi arka planda API'ye gönderip token al" şeklinde, ekran değiştirmeden sessiz bir giriş **mümkün değildir.** Kullanıcı girişi her zaman auth.insurup.com'a yönlendirme (redirect) ile yapılır; 2FA da o sayfada işlenir.
:::

---

## 2. Adım 1 — OAuth İstemcisi (Client) Oluşturma

Entegrasyona başlamadan önce uygulamanız için bir **OAuth istemcisi** tanımlamanız gerekir. Bunu CRM (Agent Panel) üzerinden self‑servis yaparsınız.

:::info OAuth istemcisi globaldir
İstemciyi herhangi bir acentenin paneli üzerinden oluşturursunuz, ancak istemci **acente bazlı değil, globaldir.** Yani **tek bir istemci** ile **farklı acentelerin** InsurUp kullanıcıları uygulamanıza giriş yapabilir. Her acente/uygulama için ayrı ayrı istemci oluşturmanız gerekmez — uygulamanız için bir istemci yeterlidir.
:::

Sol menüden **OAuth İstemcileri** (OAuth Clients) sayfasını açın. Sağ üstteki **mavi `+` butonuna** tıklayın.

![OAuth İstemcileri sayfası](./insurup-ile-giris-images/oauth-clients-tablosu.png)

Açılan **"OAuth İstemcisi Oluştur"** formunu doldurun:

![OAuth İstemcisi oluşturma formu](./insurup-ile-giris-images/oauth-client-olustur-form.png)

| Alan | Açıklama | Öneri |
|------|----------|-------|
| **İstemci Kimliği (Client Id)** | İstemcinin benzersiz kimliği | `firma-portal` gibi anlamlı bir değer |
| **Görünen Ad** | Listede görünen ad | `Firma Portalı` |
| **İstemci Türü** | `Public` veya `Confidential` | SPA için **Public**; sunucu/BFF için **Confidential** (bkz. [Uygulama Desenleri](/entegrasyon/insurup-ile-giris-uygulama-desenleri-ve-sorun-giderme)) |
| **Uygulama Türü** | `Web` veya `Native` | Tarayıcı uygulamaları için **Web** |
| **İstemci Gizli Anahtarı (Secret)** | Yalnızca Confidential için | Boş bırakırsanız üretilir; **sadece sunucuda** saklayın |
| **Yetkilendirme Türleri** | `Yetkilendirme Kodu` + `Yenileme Jetonu` | İkisini de işaretleyin (oturum yenileme için Refresh Token gerekir) |
| **Kapsamlar (Scopes)** | İstemcinin erişebileceği API alanları | **En az bir tane zorunlu** (aşağıya bakın) |
| **Yönlendirme URI'leri (Redirect URIs)** | Giriş sonrası dönülecek callback adres(ler)iniz | Hem prod hem geliştirme adreslerini ekleyin |
| **Çıkış Sonrası URI'leri** | `/connect/logout` sonrası dönüş | İsteğe bağlı |
| **PAR Zorunlu Kıl** | Pushed Authorization Requests | Genelde kapalı bırakın |

:::tip Redirect URI'leri
Callback adresinizi tam ve birebir ekleyin (ör. `https://app.firmaniz.com/api/auth/callback`). Geliştirme için `http://localhost:3000/api/auth/callback` gibi adresleri de ekleyin. Eşleşmeyen bir `redirect_uri` ile authorize isteği **400** ile reddedilir.
:::

Kaydettiğinizde `client_id` (ve Confidential ise `client_secret`) elde edersiniz.

:::danger Client Secret bir kez gösterilir
Confidential istemcide secret yalnızca bir kez görünür/üretilir. **Tarayıcıya (SPA'ya) asla koymayın** — yalnızca kendi sunucunuzda saklayın.
:::

---

## 3. Kapsamlar (Scopes)

`scope`, alacağınız token'ın hangi API alanlarına erişebileceğini belirler. Giriş akışında en azından şunları istersiniz: `openid profile offline_access` + erişmek istediğiniz API kapsamları.

| Kapsam | Anlamı |
|--------|--------|
| `openid` | OIDC kimlik token'ı |
| `profile`, `email` | Kullanıcı profil/e‑posta bilgileri |
| `offline_access` | **Refresh token** alabilmek için (oturum yenileme) |
| `core-api` | Core API'ye **tam erişim** |
| `customer:read` / `customer:write` | Müşteri okuma/yönetimi |
| `proposal:read` / `proposal:write` | Teklif okuma/yönetimi |
| `policy:read` / `policy:write` | Poliçe okuma/yönetimi |
| `case:read` / `case:write` | Talep okuma/yönetimi |
| `webhook:read` / `webhook:write` | Webhook okuma/yönetimi |
| `me:read` / `me:write` | Kendi profil bilgisi |

:::info Kapsam seçim modları
Oluşturma formunda iki mod bulunur:
- **Granüler (İnce Taneli):** Yukarıdaki `resource:action` kapsamlarını teker teker seçersiniz.
- **Tam Erişim:** `core-api` kapsamını otomatik olarak atar ve tüm API'ye erişim sağlar.

`core-api` ile granüler kapsamlar birlikte kullanılamaz — ikisinden birini seçin.
:::

---

## 4. Adım 2 — Authorization Code + PKCE Akışı

1. **PKCE üretin:** Rastgele bir `code_verifier` oluşturun, SHA‑256 ile `code_challenge` türetin (`code_challenge_method=S256`). Ayrıca CSRF için bir `state` üretin.
2. **Kullanıcıyı authorize ucuna yönlendirin:**

```
https://auth.insurup.com/connect/authorize
  ?response_type=code
  &client_id=<CLIENT_ID>
  &redirect_uri=<KAYITLI_CALLBACK_ADRESINIZ>
  &scope=openid profile offline_access core-api
  &state=<STATE>
  &code_challenge=<CHALLENGE>
  &code_challenge_method=S256
```

3. Kullanıcı **auth.insurup.com** üzerinde giriş yapar (gerekirse 2FA/SMS burada işlenir).
4. Auth Server, kullanıcıyı `redirect_uri`'nize `?code=...&state=...` ile geri yönlendirir. `state`'i doğrulayın.
5. **Code'u token'a çevirin** (`/connect/token`, `application/x-www-form-urlencoded`):

```
grant_type=authorization_code
code=<CODE>
redirect_uri=<AYNI_CALLBACK_ADRESI>
client_id=<CLIENT_ID>
code_verifier=<VERIFIER>
# Confidential istemcide ek olarak:
client_secret=<SECRET>
```

6. Yanıt:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "...",
  "expires_in": 1800,
  "token_type": "Bearer"
}
```

:::tip Oturum yenileme
`access_token` kısa ömürlüdür (30 dakika). `offline_access` ile aldığınız `refresh_token`'ı kullanarak `grant_type=refresh_token` ile yeni access token alın. Refresh token 14 gün geçerlidir. Refresh token'ı **güvenli** saklayın (tercihen sunucuda; bkz. BFF deseni).
:::

---

## 5. Adım 3 — Token ile API Çağrısı

Aldığınız `access_token` ile `https://api.insurup.com` üzerindeki uçlara `Authorization: Bearer <token>` başlığıyla istek atın. API, token içindeki kullanıcıyı çözüp ilgili acente/kullanıcı bağlamında yanıt verir.

### 5.1 TypeScript SDK ile (`@insurup/sdk` — önerilen)

Resmi TypeScript SDK, OAuth akışlarını (PKCE, client credentials, token yenileme) ve API çağrılarını yerleşik olarak yönetir:

```bash
npm install @insurup/sdk
```

**Auth modülü kurulumu ve SDK istemcisi oluşturma:**

```typescript
import { createInsurUpAuth, DefaultInsurUpClient } from '@insurup/sdk';

// 1. Auth modülünü oluşturun
const auth = createInsurUpAuth({
  clientId: '<CLIENT_ID>',
  // clientSecret: '<SECRET>',  // Yalnızca Confidential istemcilerde — SPA'larda KULLANMAYIN
  scopes: ['openid', 'profile', 'offline_access', 'core-api'],
});

// 2. SDK istemcisini auth ile bağlayın — token injection ve refresh otomatik yapılır
const client = new DefaultInsurUpClient({ auth });
```

**Authorization Code + PKCE giriş akışı (tarayıcı SPA):**

```typescript
// Giriş başlat — kullanıcıyı auth.insurup.com'a yönlendirir
const { url, codeVerifier, state } = await auth.getAuthorizeUrl({
  redirectUri: 'https://app.firmaniz.com/callback',
});

// codeVerifier ve state'i sessionStorage'a kaydedin
sessionStorage.setItem('pkce', JSON.stringify({ codeVerifier, state }));

// Kullanıcıyı yönlendirin
location.assign(url);
```

```typescript
// Callback sayfasında — code'u token'a çevirin
const { codeVerifier, state } = JSON.parse(sessionStorage.getItem('pkce')!);
sessionStorage.removeItem('pkce');

const result = await auth.exchangeCode({
  callbackUrl: location.href,
  redirectUri: 'https://app.firmaniz.com/callback',
  codeVerifier,
  state,
});

if (!result.isSuccess) {
  console.error('Giriş başarısız:', result.error);
} else {
  console.log('Giriş başarılı, token alındı');
}
```

**Client Credentials akışı (sunucu-sunucu / M2M):**

```typescript
const auth = createInsurUpAuth({
  clientId: '<CLIENT_ID>',
  clientSecret: '<CLIENT_SECRET>',
});

const login = await auth.loginWithClientCredentials({
  scopes: ['core-api'],
});

if (!login.isSuccess) throw login.error;

const client = new DefaultInsurUpClient({ auth });
```

**API çağrıları (token otomatik enjekte edilir):**

```typescript
// REST API — müşteri listesi
const customers = await client.customers.getCustomers({ first: 10 });
if (customers.isSuccess) {
  console.log(customers.data);
}

// REST API — giriş yapan kullanıcının profili
const me = await client.agentUsers.getMyAgentUser();
if (me.isSuccess) {
  console.log(me.data.email);
}

// GraphQL — tip-güvenli alan seçimi ile
const policies = await client.policies.getPolicies({
  first: 5,
  select: ['id', 'policyNumber', 'state', 'startDate'] as const,
});
```

:::tip Token yönetimi otomatiktir
`auth` nesnesi SDK istemcisine bağlandığında, her API çağrısında geçerli access token otomatik enjekte edilir. Token süresi dolduğunda refresh token ile otomatik yenilenir — manuel `setToken` çağrısı gerekmez.
:::

:::info Daha fazla bilgi
SDK kaynak kodu, demo uygulamalar ve API referansı: [github.com/InsurUp/ts-toolkit](https://github.com/InsurUp/ts-toolkit)
:::

### 5.2 .NET SDK ile (`InsurUp.Sdk`)

.NET SDK, `IServiceCollection` üzerinden DI ile kaydedilir. OAuth akışını (token alma, yenileme) siz yönetirsiniz; aldığınız `access_token`'ı SDK'ya verirsiniz.

```bash
dotnet add package InsurUp.Sdk
```

#### Kurulum (DI kaydı)

`AddInsurUp` extension metodu, `IInsurUpClient` / `DefaultInsurUpClient`'ı typed `HttpClient` ile DI'a kaydeder. Ayrıca `Microsoft.Extensions.Http.Resilience` ile **retry**, **circuit breaker**, **rate limiter** ve **timeout** stratejilerini otomatik olarak ekler.

```csharp
// Program.cs veya Startup.cs
services.AddInsurUp(options =>
{
    options.BaseUrl = "https://api.insurup.com/api/";
});
```

`InsurUpClientOptions` önemli ayarları:

| Ayar | Varsayılan | Açıklama |
|------|-----------|----------|
| `BaseUrl` | `https://api.insurup.com/api/` | API temel adresi |
| `TotalRequestTimeout` | 5 dakika | Toplam istek zaman aşımı |
| `AttemptTimeout` | 30 saniye | Deneme başına zaman aşımı |
| `Retry` | 3 deneme, exponential backoff | Yeniden deneme stratejisi |
| `CircuitBreaker` | 2 dakika örnekleme | Devre kesici ayarları |

Kaydedildikten sonra `IInsurUpClient` arayüzünü DI ile herhangi bir sınıfa inject edebilirsiniz.

#### Token yönetimi

.NET SDK'da token enjeksiyonu iki yöntemle yapılabilir:

**Yöntem 1 — `SetToken` (basit):** Access token'ı her istek grubundan önce manuel olarak ayarlarsınız:

```csharp
_client.SetToken(accessToken);
var result = await _client.GetMyAgentUser();
```

**Yöntem 2 — `DelegatingHandler` (önerilen):** HttpClient pipeline'ına bir handler ekleyerek token'ı her istekte otomatik enjekte edersiniz. Böylece her çağrıdan önce `SetToken` çağırmanıza gerek kalmaz:

```csharp
public class AccessTokenHandler(ITokenProvider tokenProvider) : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        var accessToken = await tokenProvider.GetAccessTokenAsync();
        if (!string.IsNullOrEmpty(accessToken))
        {
            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", accessToken);
        }
        return await base.SendAsync(request, cancellationToken);
    }
}

// Program.cs — handler'ı HttpClient pipeline'ına ekleyin
services.AddTransient<AccessTokenHandler>();
services.AddInsurUp(options => { options.BaseUrl = "https://api.insurup.com/api/"; })
    .AddHttpMessageHandler<AccessTokenHandler>();
```

`ITokenProvider` kendi token alma/yenileme mantığınızı barındırır (ör. `HttpContext`'ten okuma, refresh token ile yenileme).

#### Result pattern (sonuç tipi)

Her SDK metodu `InsurUpResult<T>` döndürür. Bu, [Dunet](https://github.com/domn1995/dunet) discriminated union'dır ve üç varyantı vardır:

| Varyant | `IsSuccess` | Açıklama |
|---------|-------------|----------|
| `Success(T Data)` | `true` | Başarılı yanıt, `Data` ile veriye erişilir |
| `ServerError(...)` | `false` | Sunucu hatası (4xx/5xx) — `Type`, `Detail`, `Status`, `TraceId`, `Codes`, `ValidationErrors` alanları |
| `ClientError(...)` | `false` | İstemci hatası — `Type` (Timeout, JsonSerialization, HttpRequestFailed vb.), `Exception` |

**Başarılı sonucu okuma:**

```csharp
var result = await _client.GetMyAgentUser();

if (result.IsSuccess)
{
    var userData = result.UnwrapSuccess().Data;
    Console.WriteLine($"E-posta: {userData.Email}");
    Console.WriteLine($"Acente ID: {userData.AgentId}");
}
```

**Hata kontrolü:**

```csharp
var result = await _client.GetCustomer(customerId);

if (!result.IsSuccess)
{
    switch (result)
    {
        case InsurUpResult<GetCustomerEndpointResponse>.ServerError serverError:
            // serverError.Type → ResourceNotFound, AccessDenied, InputValidation vb.
            // serverError.Detail → insan okunur hata açıklaması
            // serverError.Status → HTTP durum kodu (404, 403, 422 vb.)
            // serverError.TraceId → destek için sunucu izleme kimliği
            // serverError.Codes → hata kodları dizisi (["CUSTOMER_NOT_FOUND"] gibi)
            // serverError.ValidationErrors → doğrulama hataları (InputValidation için)
            Console.WriteLine($"Sunucu hatası [{serverError.Status}]: {serverError.Detail}");
            Console.WriteLine($"TraceId: {serverError.TraceId}");
            break;

        case InsurUpResult<GetCustomerEndpointResponse>.ClientError clientError:
            // clientError.Type → Timeout, HttpRequestFailed, JsonDeserialization vb.
            // clientError.Exception → varsa alt düzey exception
            Console.WriteLine($"İstemci hatası: {clientError.Type}");
            break;
    }
    return;
}

var customer = result.UnwrapSuccess().Data;
```

**Sunucu hata tipleri (`InsurUpServerErrorType`):**

| Tip | HTTP | Açıklama |
|-----|------|----------|
| `ResourceNotFound` | 404 | Kaynak bulunamadı |
| `AccessDenied` | 403 | Yetki yetersiz |
| `Unauthorized` | 401 | Token geçersiz/eksik |
| `InputValidation` | 422 | Giriş doğrulama hatası (`ValidationErrors` dolu) |
| `BusinessValidation` | 422 | İş kuralı ihlali |
| `ResourceDuplicate` | 409 | Zaten var |
| `Upstream` | 502 | Sigorta şirketi servisi hatası |

#### Tam kullanım örneği

Aşağıdaki örnek, tipik bir entegrasyon senaryosunu gösterir: kullanıcı doğrulama, müşteri sorgulama ve hata yönetimi.

```csharp
public class InsurUpIntegrationService
{
    private readonly IInsurUpClient _client;
    private readonly ILogger<InsurUpIntegrationService> _logger;

    public InsurUpIntegrationService(IInsurUpClient client, ILogger<InsurUpIntegrationService> logger)
    {
        _client = client;
        _logger = logger;
    }

    /// <summary>
    /// OAuth callback sonrası: token'ı doğrulayın ve kullanıcı bilgilerini alın.
    /// </summary>
    public async Task<AgentUserInfo?> ValidateAndGetUser(string accessToken)
    {
        _client.SetToken(accessToken);

        var result = await _client.GetMyAgentUser();
        if (!result.IsSuccess)
        {
            _logger.LogWarning("Kullanıcı doğrulaması başarısız: {Message}", result.Message);
            return null;
        }

        var user = result.UnwrapSuccess().Data;
        return new AgentUserInfo(user.Id, user.Email, user.AgentId);
    }

    /// <summary>
    /// Müşteri TCKN ile arama (esnek tanımlayıcı: UUID, TCKN, VKN veya Yabancı Kimlik No).
    /// </summary>
    public async Task<CustomerInfo?> FindCustomer(string accessToken, string tckn)
    {
        _client.SetToken(accessToken);

        var result = await _client.GetCustomer(tckn);

        switch (result)
        {
            case InsurUpResult<GetCustomerEndpointResponse>.Success success:
                var c = success.Data;
                return new CustomerInfo(c.Id, c.Name, c.IdentityNumber);

            case InsurUpResult<GetCustomerEndpointResponse>.ServerError { Type: InsurUpServerErrorType.ResourceNotFound }:
                return null;

            case InsurUpResult<GetCustomerEndpointResponse>.ServerError serverError:
                _logger.LogError(
                    "Müşteri sorgusu başarısız. Tip: {Type}, Detay: {Detail}, TraceId: {TraceId}",
                    serverError.Type, serverError.Detail, serverError.TraceId);
                throw new InvalidOperationException(serverError.Detail);

            case InsurUpResult<GetCustomerEndpointResponse>.ClientError clientError:
                _logger.LogError(clientError.Exception,
                    "Müşteri sorgusu istemci hatası: {Type}", clientError.Type);
                throw new InvalidOperationException($"API erişim hatası: {clientError.Type}");

            default:
                throw new InvalidOperationException("Beklenmeyen sonuç tipi");
        }
    }

    /// <summary>
    /// Poliçe detayını getir ve belgeyi müşteriye gönder.
    /// </summary>
    public async Task SendPolicyDocument(string accessToken, string policyId, string customerEmail)
    {
        _client.SetToken(accessToken);

        var policyResult = await _client.GetPolicyDetail(policyId);
        if (!policyResult.IsSuccess)
        {
            _logger.LogWarning("Poliçe bulunamadı: {PolicyId}", policyId);
            return;
        }

        var sendResult = await _client.SendPolicyDocumentToCustomer(
            new SendPolicyDocumentEndpointRequest
            {
                PolicyId = policyId,
                Email = customerEmail
            });

        if (!sendResult.IsSuccess)
        {
            _logger.LogError("Poliçe belgesi gönderilemedi: {Message}", sendResult.Message);
        }
    }
}
```

#### Mevcut API istemcileri

`IInsurUpClient`, aşağıdaki tüm alt istemci arayüzlerini tek bir birleşik arayüzde toplar:

| İstemci | Açıklama | Örnek metotlar |
|---------|----------|----------------|
| **AgentUser** | Kullanıcı yönetimi | `GetMyAgentUser()`, `InviteAgentUser(...)` |
| **Customer** | Müşteri CRUD, adres, e-posta, telefon | `GetCustomer(id)`, `CreateCustomer(...)`, `GetCustomerAssets(id)` |
| **Proposal** | Teklif oluşturma ve satın alma | `CreateProposal(...)`, `PurchaseProposalProductSync(...)` |
| **Policy** | Poliçe yönetimi ve belge | `GetPolicyDetail(id)`, `FetchPolicyDocument(id)` |
| **Case** | Talep/şikayet yönetimi | `GetCaseDetail(id)` |
| **Vehicle** | Araç bilgileri | `GetVehicle(id)` |
| **Property** | Konut bilgileri | `GetProperty(id)` |
| **Webhook** | Webhook yönetimi | `CreateWebhook(...)` |
| **Coverage** | Teminat yapılandırması | `GetCoverages(...)` |
| **Insurance** | Sigorta şirketi/ürün bilgileri | `GetInsuranceCompaniesAsync()` |
| **OAuthClient** | OAuth istemci yönetimi | CRUD işlemleri |
| **File** | Dosya yükleme | `UploadFile(...)` |

:::warning .NET SDK'da OAuth akışı manueldir
TypeScript SDK'nın aksine, .NET SDK OAuth akışını (PKCE, token alma, yenileme) yönetmez. Token'ı kendiniz alıp istemciye vermeniz gerekir (yukarıdaki iki yöntemden biriyle). Token süresini takip etmek ve `refresh_token` ile yenilemek sizin sorumluluğunuzdadır.
:::

### 5.3 Doğrulama uçları

Entegrasyonunuzu test etmek için aşağıdaki uçları kullanabilirsiniz:

| Method | Endpoint | Beklenen |
|--------|----------|----------|
| `GET` | `https://auth.insurup.com/connect/userinfo` | Kullanıcı bilgileri (OIDC standart) |
| `GET` | `https://api.insurup.com/agent-users/me` | Giriş yapan kullanıcının profili |

```typescript
// TypeScript SDK ile
const me = await client.agentUsers.getMyAgentUser();
```

```csharp
// .NET SDK ile
_client.SetToken(accessToken);
var me = await _client.GetMyAgentUser();
```

---

## 6. Sonraki adım

Uygulama tipinize göre (tarayıcı SPA mı, sunucu/BFF mi) hazır deseni, örnek kodu ve en sık karşılaşılan sorunların çözümünü şu rehberde bulabilirsiniz:

➡️ [**InsurUp ile Giriş: Uygulama Desenleri ve Sorun Giderme**](/entegrasyon/insurup-ile-giris-uygulama-desenleri-ve-sorun-giderme)
