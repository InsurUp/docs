---
title: "Mobil Projeler İçin Web Satış Platformu Entegrasyonu"
sidebar_position: 5
slug: /entegrasyon/mobil-projeler-icin-web-satis-platformu-entegrasyonu
---

# Mobil Projeler İçin Web Satış Platformu Entegrasyonu

Bu rehber, InsurUp Web Satış Platformu'nu mobil uygulamalarına (iOS, Android veya cross-platform) entegre etmek isteyen partnerler için hazırlanmıştır. Döküman, mobil ortamın kendine özgü gereksinimlerini ele alarak standart web entegrasyonundan farklılaşan noktaları açıklar.

Temel API akışları için [InsurUp Web Satış Platformu Self-servis Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-entegrasyon-rehberi) ve ürün bazlı detaylar için [Kasko Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-kasko-entegrasyon-rehberi) dökümanlarını incelemeniz önerilir. Bu rehber, söz konusu dökümanların mobil uygulamalar için tamamlayıcısı niteliğindedir.

**API Referansı:** Tüm endpoint'lerin detaylı teknik dokümantasyonu için [api.insurup.com/scalar](https://api.insurup.com/scalar) adresini ziyaret edin.

## 1. Entegrasyon yaklaşımları

Mobil uygulamalarda InsurUp entegrasyonu için iki temel yaklaşım mevcuttur.

### 1.1 Native HTTP client (Önerilen)

Uygulamanız doğrudan InsurUp REST API'lerini çağırır ve kendi kullanıcı arayüzünüzü kullanırsınız.

| Avantaj | Dezavantaj |
| --- | --- |
| Tam UI kontrolü ve native deneyim | Daha fazla geliştirme efortu |
| Daha iyi performans | Ödeme akışları için WebView gerekli |
| Offline-first senaryolar için uygun | API değişikliklerinde güncelleme gerekli |

### 1.2 WebView/Hybrid yaklaşım

Mevcut web satış platformunuzu WebView içinde gösterir ve native uygulama ile köprü kurarsınız.

| Avantaj | Dezavantaj |
| --- | --- |
| Hızlı entegrasyon | Sınırlı native deneyim |
| Web güncellemeleri otomatik yansır | WebView performans kısıtlamaları |
| Ödeme akışları doğal çalışır | Platform farklılıkları (iOS/Android WebView davranışları) |

Her iki yaklaşımda da 3D Secure ve Insurance Company Redirect ödeme yöntemleri için WebView kullanımı zorunludur.

## 2. Acente ve şube tanımlayıcıları

InsurUp entegrasyonunda doğru acente/şube tanımlaması kritik öneme sahiptir. Üretim yapısına göre farklı parametreler gereklidir.

### 2.1 Doğrudan acenteye üretim

Eğer poliçe doğrudan ana acenteye üretilecekse, yalnızca `agentId` parametresi yeterlidir.

| Parametre | Tip | Zorunlu | Açıklama |
| --- | --- | --- | --- |
| `agentId` | Guid | Evet | InsurUp tarafından sağlanan acente organizasyon kimliği |

### 2.2 Şube veya partner üzerinden üretim

Eğer poliçe bir şube, alt acente veya partner üzerinden üretilecekse, `agentId`'ye ek olarak `agentBranchId` parametresi de gönderilmelidir.

| Parametre | Tip | Zorunlu | Açıklama |
| --- | --- | --- | --- |
| `agentId` | Guid | Evet | Ana acente organizasyon kimliği |
| `agentBranchId` | String | Evet* | Şube veya partner kimliği |

*Şube/partner yapısı kullanılıyorsa zorunludur.

### 2.3 Ne zaman hangisi kullanılır?

| Senaryo | agentId | agentBranchId |
| --- | --- | --- |
| Tek acenteli yapı, şube yok | Gerekli | Gerekli değil |
| Ana acente adına üretim | Gerekli | Gerekli değil |
| Şube adına üretim | Gerekli | Gerekli |
| Partner/alt acente adına üretim | Gerekli | Gerekli |
| UTM takipli partner linkleri | Gerekli | Gerekli |

Bu parametreler; müşteri kaydı (`login-or-register`), müşteri oluşturma ve teklif oluşturma (`proposals`) endpoint'lerinde kullanılır. Detaylar için [api.insurup.com/scalar](https://api.insurup.com/scalar) adresindeki ilgili endpoint açıklamalarına bakın.

## 3. Kanal (channel) parametresi

Mobil uygulamadan yapılan tüm API çağrılarında `channel` parametresi `MOBILE_APP` olarak gönderilmelidir. Bu parametre, InsurUp CRM'de satış kaynağının doğru raporlanmasını sağlar.

Kullanılan yerler:

- Case oluşturma: `POST /api/cases:new-sale-opportunity`
- Teklif oluşturma: `POST /api/proposals`

## 4. Token yönetimi

Mobil uygulamalarda token yönetimi, web uygulamalarına göre daha kritik öneme sahiptir. Kullanıcılar uygulamayı arka plana atabilir, ağ bağlantısı kesintiye uğrayabilir veya uygulama uzun süre açık kalabilir.

### 4.1 Token bilgileri

Login başarılı olduğunda dönen yanıtta:

| Alan | Açıklama |
| --- | --- |
| `accessToken` | API çağrılarında `Authorization: Bearer` header'ında kullanılır |
| `refreshToken` | Access token süresi dolduğunda yeni token almak için kullanılır |
| `expiresIn` | Access token'ın saniye cinsinden geçerlilik süresi (yaklaşık 10 dakika) |
| `requiresTwoFactor` | `true` ise MFA doğrulaması gereklidir |

### 4.2 Güvenli token saklama

Tokenlar, platforma özgü güvenli depolama mekanizmalarında saklanmalıdır:

| Platform | Önerilen Yöntem |
| --- | --- |
| iOS | Keychain Services |
| Android | EncryptedSharedPreferences veya Android Keystore |
| Flutter | `flutter_secure_storage` paketi |
| React Native | `react-native-keychain` veya `expo-secure-store` |

Tokenları şifrelenmemiş alanlarda (UserDefaults, SharedPreferences, AsyncStorage) saklamayın.

### 4.3 Token yenileme stratejisi

Access token süresinin dolmasını beklemeden, proaktif olarak yenileme yapmanız önerilir:

- Token süresinin %80'i dolduğunda yenileme başlatın
- Her API çağrısından önce kalan süreyi kontrol edin
- Uygulama arka plandan ön plana geldiğinde token süresini kontrol edin
- Refresh token ile yenileme yapıldığında, eski refresh token geçersiz olur; yeni değeri saklayın

Refresh token da geçersiz olduğunda kullanıcıyı login ekranına yönlendirin.

## 5. Ödeme akışları ve WebView yönetimi

Mobil uygulamalarda 3D Secure ve Insurance Company Redirect ödeme yöntemleri, kullanıcının harici bir sayfaya yönlendirilmesini gerektirir. Bu akış, in-app WebView ile yönetilmelidir.

### 5.1 Callback URL yapılandırması

Ödeme başlatırken gönderilen `callbackUrl` parametresi, mobil uygulamalarda deep link veya universal link formatında olmalıdır.

| Platform | Callback URL Formatı | Yapılandırma |
| --- | --- | --- |
| iOS | `myapp://payment-result` veya `https://myapp.com/payment` | URL Schemes veya Universal Links |
| Android | `myapp://payment-result` veya `https://myapp.com/payment` | Intent Filters veya App Links |

Universal Links / App Links kullanımı güvenlik açısından önerilir.

### 5.2 WebView akış adımları

1. Ödeme isteği gönderin; yanıtta `redirectUrl` döner.
2. `redirectUrl` adresini in-app WebView'da açın.
3. WebView'ın URL değişikliklerini dinleyin.
4. URL, tanımladığınız `callbackUrl` ile başladığında WebView'ı kapatın.
5. URL parametrelerinden ödeme sonucunu okuyun.
6. Sonucu API üzerinden doğrulayın (`GET /api/proposals/{proposalId}/products/{proposalProductId}`).

### 5.3 Ödeme sonrası doğrulama

Callback URL'den gelen bilgilere güvenmek yerine, her zaman API üzerinden durumu doğrulayın. Yanıttaki `status` alanı:

| Değer | Açıklama |
| --- | --- |
| `PURCHASED` | Ödeme başarılı, poliçe oluşturuldu |
| `PURCHASE_FAILED` | Ödeme başarısız |
| `PURCHASING` | Ödeme işleniyor |

## 6. Gerçek zamanlı bildirimler (SignalR)

InsurUp, teklif ve ödeme süreçlerinde gerçek zamanlı güncellemeler için SignalR kullanır. Mobil uygulamalarda SignalR entegrasyonu, kullanıcıya anlık geri bildirim sağlar.

### 6.1 Kullanılabilecek kütüphaneler

| Platform | Kütüphane |
| --- | --- |
| iOS (Swift) | SignalR-Client-Swift |
| Android (Kotlin) | Microsoft SignalR |
| Flutter | signalr_netcore veya signalr_core |
| React Native | @microsoft/signalr |

### 6.2 Dinlenebilecek olaylar

| Olay | Açıklama |
| --- | --- |
| `ReceiveProposalProductSuccess` | Sigorta şirketinden teklif başarıyla alındı |
| `ReceiveProposalProductFailed` | Teklif alınamadı |
| `ReceiveProposalProductPurchased` | Satın alma başarılı |
| `ReceiveProposalProductPurchaseFailed` | Satın alma başarısız |

### 6.3 Bağlantı yönetimi

Mobil uygulamalarda SignalR bağlantısı şu durumlarda yönetilmelidir:

- Uygulama arka plana geçtiğinde bağlantıyı kapatın (pil tasarrufu)
- Uygulama ön plana döndüğünde bağlantıyı yeniden kurun
- Ağ değişikliklerinde (Wi-Fi/mobil veri) yeniden bağlanın
- Token yenilendiğinde bağlantıyı yeni token ile kurun

## 7. Ağ yönetimi ve hata işleme

### 7.1 Retry stratejisi

Mobil ağlar güvenilmez olabilir. Geçici hatalarda otomatik retry uygulanması önerilir:

| Hata Türü | Önerilen Davranış |
| --- | --- |
| Timeout, 5xx hataları | Exponential backoff ile retry (max 3 deneme) |
| `429 Too Many Requests` | `Retry-After` header'ına göre bekleyin |
| Ağ bağlantısı yok | Bağlantı geldiğinde retry |

### 7.2 Retry yapılmaması gereken durumlar

| Hata Kodu | Açıklama | Aksiyon |
| --- | --- | --- |
| `400 Bad Request` | İstek formatı hatalı | Kullanıcı girdisini düzeltin |
| `401 Unauthorized` | Token geçersiz | Login ekranına yönlendirin |
| `403 Forbidden` | Yetki yok | Kullanıcıyı bilgilendirin |
| `404 Not Found` | Kaynak bulunamadı | Kullanıcıyı bilgilendirin |
| `422 Unprocessable Entity` | İş kuralı hatası | Hata mesajını gösterin |

### 7.3 Hata yanıtları

API hata yanıtlarındaki `detail` ve `suggestions` alanları kullanıcıya gösterilebilir niteliktedir.

## 8. HTTP header yapılandırması

### 8.1 Zorunlu header'lar

| Header | Değer |
| --- | --- |
| `Authorization` | `Bearer <accessToken>` |
| `Content-Type` | `application/json` |

### 8.2 Önerilen header'lar

| Header | Açıklama |
| --- | --- |
| `User-Agent` | Uygulama adı, versiyon ve platform bilgisi |
| `Accept-Language` | Tercih edilen dil (örn. `tr-TR`) |
| `X-Request-ID` | İstek takibi için benzersiz ID |

`User-Agent` header'ı, InsurUp tarafında hata ayıklama ve analitik için kullanılır.

## 9. Güvenlik önerileri

- Tüm API çağrıları HTTPS üzerinden yapılmalıdır
- Minimum TLS 1.2 desteklenmelidir
- Kart bilgileri cihazda saklanmamalı ve loglara yazılmamalıdır
- TC kimlik numarası ve diğer kişisel veriler şifrelenmiş storage'da tutulmalıdır
- Debug build'lerde açık olan API logları, release build'lerde kapatılmalıdır

## 10. Test ortamı

Test entegrasyonu için aşağıdaki örnek veriler kullanılabilir:

| Alan | Test Değeri |
| --- | --- |
| TCKN | `11111111110` |
| Doğum tarihi | `01.01.1990` |
| Telefon | `+905321234567` |
| Plaka | `34ABC123` |
| Ruhsat seri | `A` / `1234567` |
| Kart numarası | `4242424242424242` |
| Kart son kullanma | `12/25` |
| Kart CVC | `123` |

## 11. Kasko/Trafik entegrasyon akış özeti

Mobil uygulama için kasko veya trafik entegrasyon akışı:

1. **Login/Register:** Müşteri girişi; MFA gerekiyorsa doğrulama. `agentId` zorunlu, şube yapısı varsa `agentBranchId` de gönderin.
2. **Token saklama:** `accessToken` ve `refreshToken` değerlerini güvenli storage'a kaydedin.
3. **Müşteri bilgisi:** Müşteri ID'sini alın.
4. **Case oluşturma:** Mevcut case kontrolü yapın; yoksa `channel: "MOBILE_APP"` ile yeni case oluşturun.
5. **Araç ekleme:** Plaka/ruhsat bilgilerini doğrulayın ve aracı kaydedin.
6. **Teklif oluşturma:** Kasko veya trafik teklifi oluşturun; `channel: "MOBILE_APP"` gönderin.
7. **SignalR bağlantısı:** (Opsiyonel) Gerçek zamanlı güncellemeler için bağlanın.
8. **Teklifleri listeleme:** Sigorta şirketi tekliflerini alın ve kullanıcıya gösterin.
9. **Ödeme başlatma:** Kullanıcı seçiminden sonra ödeme isteği gönderin; `callbackUrl` olarak deep link verin.
10. **WebView açma:** Dönen `redirectUrl`'i in-app WebView'da açın.
11. **Callback yakalama:** URL eşleştiğinde WebView'ı kapatın.
12. **Sonuç doğrulama:** API üzerinden ödeme durumunu doğrulayın.
13. **Poliçe gösterme:** Başarılı ise poliçe bilgisi ve PDF'ini alın.

---

Bu rehber, mobil uygulama entegrasyonunun temel adımlarını ve mobil ortama özgü gereksinimleri kapsar. API endpoint detayları için [api.insurup.com/scalar](https://api.insurup.com/scalar) adresini kullanın. Entegrasyon sırasında oluşacak sorular için InsurUp teknik ekibiyle iletişime geçebilirsiniz.
