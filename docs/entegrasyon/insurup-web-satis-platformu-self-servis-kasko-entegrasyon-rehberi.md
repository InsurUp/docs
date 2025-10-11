---
title: "InsurUp Web Satış Platformu Self-servis Kasko Entegrasyon Rehberi"
sidebar_position: 3
slug: /entegrasyon/insurup-web-satis-platformu-self-servis-kasko-entegrasyon-rehberi
---

# InsurUp Web Satış Platformu Self-servis Kasko Entegrasyon Rehberi

Bu rehber, InsurUp Web Satış Platformu (B2C) üzerinde kasko branşı için uçtan uca entegrasyonu açıklar. Acentelerin kendi web sitelerinden InsurUp'a bağlanarak müşterinin oturum açması, aracın sisteme tanıtılması, teklif alınması ve ödeme/poliçeleştirme işlemlerini nasıl yürüteceğini adım adım gösterir. Tüm örnekler `api.insurup.com` üzerindeki REST servislerini temel alır.

## 1. Kimlik doğrulama ve oturum yönetimi

### 1.1 Müşteri giriş/kayıt

Müşteri TC/VKN ve telefon bilgisiyle sisteme giriş yapar veya kayıt olur.

#### İstek

```http
POST /api/auth/customer/login-or-register
Content-Type: application/json

{
  "identityNumber": "11111111110",
  "birthday": "01.01.1990",
  "phoneNumber": "+905321234567",
  "agentId": "AGENT-001",
  "type": "individual"
}
```

#### Yanıt

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "02f5569b-...",
  "expiresIn": 600
}
```

Eğer InsurUp tarafından çok faktörlü doğrulama (MFA) zorunlu tutuluyorsa, SMS ile gönderilen kodu `auth/customer/verify-mfa` endpoint'i üzerinden doğrulayın.

### 1.2 Refresh token

Access token yaklaşık 10 dakika geçerlidir. Oturumu uzatmak için refresh token ile yeni erişim token'ı alın.

```http
POST /api/auth/customer/refresh
Authorization: Bearer <expired accessToken>

{
  "refreshToken": "02f5569b-..."
}
```

## 2. Müşteri ve varlık yönetimi

### 2.1 Müşteri bilgilerini görüntüleme

`GET /api/customers/me` çağrısı ile müşteri bilgilerini alın. Yanıt içindeki `id` alanı, sonraki adımlarda kullanılacak müşteri kimliğidir.

### 2.2 Araç listesi ve araç ekleme

#### Mevcut araçları görüntüleme

`GET /api/customers/me/vehicles` çağrısı, müşterinin daha önce kaydettiği araçları listeler.

#### Yeni araç ekleme

Kasko teklifi almak için aracın sisteme kaydedilmesi gerekir.

```http
POST /api/customers/{customerId}/vehicles
Authorization: Bearer <accessToken>

{
  "plate": "34ABC123",
  "documentSerialCode": "A",
  "documentSerialNumber": "1234567",
  "brandCode": "RENAULT",
  "modelCode": "CLIO",
  "year": 2021
}
```

#### Plaka ve ruhsatla otomatik araç bilgisi alma

Plaka ve ruhsat bilgilerini gönderdikten sonra `POST /api/customers/{customerId}/vehicles/external-lookup` servisi ile araç marka/model bilgilerini otomatik doldurabilirsiniz. Dönen değerleri kullanarak aracı oluşturmanız önerilir.

## 3. Kasko teklif akışı

### 3.1 Teminat grupları (coverage group)

Kasko teklifleri, InsurUp CRM'de tanımlanan teminat gruplarıyla alınır. `coverageGroupId` değeri teklif kapsamını belirler; birden fazla ID göndererek alternatif fiyatlar üretebilirsiniz. Henüz grubunuz yoksa InsurUp ekibiyle çalışarak ihtiyaca uygun kasko paketleri oluşturun.

Teminat seçimlerini görmek için `GET /api/coverage-choices:kasko?insuranceCompanyId={id}` servisini kullanın. Bu uç nokta, CRM'de paket oluştururken kullanılacak teminat seçeneklerini döner.

### 3.2 Teklif oluşturma

Müşteri ve araç kaydı tamamlandıktan sonra teklif oluşturun.

```http
POST /api/proposals
Authorization: Bearer <accessToken>

{
  "type": "kasko",
  "customerId": "8f89a1b6-4e3c-4e5a-9...",
  "vehicleId": "acb55b22-...",
  "insuredCustomerId": "8f89a1b6-4e3c-4e5a-9...",
  "channel": "website",
  "coverageGroupIds": [123, 124]
}
```

Yanıtta dönen `proposalId`, teklif sonuçlarına erişmek için kullanılır.

### 3.3 Teklif bilgisi ve ürünler

- `GET /api/proposals/{proposalId}`: Teklifin genel durumunu döner.
- `GET /api/proposals/{proposalId}/products`: Sigorta şirketlerinden gelen ürün tekliflerini listeler.
- `GET /api/proposals/{proposalId}/products/{proposalProductId}/premiums/{installmentNumber}`: Belirli taksit planının prim detayını getirir.
- `GET /api/proposals/{proposalId}/products/{proposalProductId}/coverage`: Ürünün teminat ve muafiyet detaylarını listeler.

### 3.4 Kullanıcıya teklif sunma ve seçim

B2C arayüzünde ürünleri karşılaştırmalı gösterin. Kullanıcının seçtiği ürün için `proposalProductId` ve `installmentNumber` değerlerini saklayın.

```json
{
  "id": "INS-001",
  "company": "Anadolu Sigorta",
  "premiums": [
    {
      "installmentNumber": 1,
      "netPremium": 8500.0,
      "grossPremium": 9000.0,
      "commission": 500.0,
      "currency": "TRY"
    },
    {
      "installmentNumber": 3,
      "netPremium": 8700.0,
      "grossPremium": 9200.0,
      "commission": 500.0,
      "currency": "TRY"
    }
  ],
  "selectedInstallmentNumber": 3,
  "proposalProductId": "bb60d9a0-...",
  "proposalId": "a7795c20-..."
}
```

Bu bilgiler ödeme adımında kullanılacaktır.

## 4. Ödeme ve poliçeleştirme

### 4.1 Ödeme tipleri

InsurUp üç farklı ödeme modelini destekler:

- **3D Secure (`type = 3DSecure`)**: Kart bilgileri acentenin web sitesinde toplanır; ödeme bankanın 3D Secure sayfasında doğrulanır.
- **Insurance Company Redirect (`type = InsuranceCompanyRedirect`)**: Kart bilgileri ve doğrulama, sigorta şirketinin ödeme sayfasında tamamlanır.
- **Sync (`type = Sync`)**: Bazı şirketlerin anlık ödeme sistemleri için kullanılır.

### 4.2 Ödeme servisi çağrısı

Seçilen ürün ve taksit için ödeme başlatmak üzere aşağıdaki endpoint'i çağırın.

```http
POST /api/proposals/{proposalId}/products/{proposalProductId}/purchase/async
Authorization: Bearer <accessToken>

{
  "type": "3DSecure",
  "installmentNumber": 3,
  "cardHolderName": "YUSUF YILMAZ",
  "cardNumber": "4242424242424242",
  "expirationMonth": "11",
  "expirationYear": "26",
  "cvc": "123",
  "callbackUrl": "https://acente.example.com/kasko/odeme-sonuc"
}
```

Yanıtta dönen `redirectUrl`, kullanıcıyı ödeme sağlayıcısına iletir. Ödeme tamamlandığında InsurUp, `callbackUrl` adresinize sonuç bildirir. İşlem sonrasında `GET /api/proposals/{proposalId}/products/{proposalProductId}` çağrısıyla durum doğrulaması yapmanız önerilir.

### 4.3 Poliçeleştirme ve belge alma

Ödeme başarılı olduğunda InsurUp bir `policyId` üretir.

- `GET /api/policies/{policyId}`: Poliçe bilgilerini döner.
- `GET /api/policies/{policyId}/document`: Poliçe PDF'ini indirir.
- `POST /api/policies/{policyId}/document/send`: Poliçe belgesini müşteriye e-posta ile gönderir.

## 5. Özet akış

1. **Kimlik doğrulama**: Müşteri `auth/customer/login-or-register` ile giriş yapar, gerekirse MFA doğrulanır.
2. **Müşteri bilgisi**: `customers/me` ile müşteri ID'si ve temel bilgiler alınır.
3. **Araç ekleme**: `customers/me/vehicles` ile araçlar listelenir, gerekirse `external-lookup` ile plaka/ruhsat bilgileri doğrulanır ve yeni araç kaydedilir.
4. **Teklif oluşturma**: `POST /api/proposals` ile kasko teklifi oluşturulur ve `proposalId` alınır.
5. **Teklifleri listeleme**: `proposals/{proposalId}/products` ile şirket teklifleri ve primleri gösterilir; kullanıcı bir ürün ve taksit seçer.
6. **Ödeme**: Seçilen `proposalProductId` ve `installmentNumber` ile `purchase/async` endpoint'i çağrılır.
7. **Poliçeleştirme**: Ödeme sonrası oluşan `policyId` ile poliçe bilgisi ve belge servisine erişilir.

## 6. Test verileri ve ipuçları

- Test ortamında gerçek TCKN, plaka ve kart bilgileri yerine örnek değerler kullanın (ör. TCKN `11111111110`, plaka `34ABC123`, ruhsat `A/1234567`, kart `4242 4242 4242 4242`).
- Hata durumlarında `GET /api/proposals/{proposalId}/products/{proposalProductId}/retry` ile ürün teklifini yeniden deneyebilirsiniz.
- Teklif ve ödeme süreçlerinde gerçek zamanlı durum takibi için InsurUp'un SignalR servislerini entegre edin.
- Entegrasyon boyunca güncel API sözleşmesi ve değişiklikleri takip etmek için [docs.insurup.com](https://docs.insurup.com) ve InsurUp destek ekibiyle iletişimde kalın.

