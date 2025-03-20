# Webhook API Entegrasyonu

Webhook'lar, bir olay meydana geldiğinde veya gelirken belirtilen URL'e istek atmak için kullanılır. InsurUp'da iki çeşit event vardır.

- **Async**: event'ler bir olay gerçekleştiğinde atılır ve belirtilen API'ın sonucunu yapılan işleme etki etmez.
- **Sync**: event'ler bir olay gerçekleşmeden önce atılır ve belirtilen API'ın sonucuna göre yapılan işleme etki edebilir. Ödeme validasyonu güzel bir örnektir.

Webhook event'leri, belirli bir URL'ye HTTP POST isteği göndererek tetiklenir. Bu istek, bir JSON nesnesi içerir. JSON nesnesi, event'e ait detayları içerir.

## Header'lar

- **`x-webhook-event`**: Tetiklenen event'in ismidir.
- **`x-webhook-id`**: Acente panelindeki oluşturulan webhook'un tekil numarasıdır.
- **`x-webhook-delivery`**: Tekil gönderim numarasıdır.
- **`x-webhook-signature`**: Bu header eğer `secret` alanı doluysa gönderilir. Belirtilen `secret` ile payload SHA-256 ile şifrelenir.

## Event'ler

### `proposal_premium.received` *async*

Bir teklif primi InsurUp'a iletildiği zaman tetiklenir.

**Örnek Payload**

```json
{
  "$event": "proposal_premium.received",
  "proposalId": "673afd15f11de64fe1f2bjdb",
  "productId": 40235,
  "premiums": [
    {
      "installmentNumber": 1,
      "netPremium": 1243,
      "grossPremium": 1243,
      "commission": 0,
      "exchangeRate": 1,
      "currency": "TurkishLira",
      "insuranceCompanyProposalNumber": "142534209"
    },
    {
      "installmentNumber": 2,
      "netPremium": 1243,
      "grossPremium": 1243,
      "commission": 0,
      "exchangeRate": 1,
      "currency": "TurkishLira",
      "insuranceCompanyProposalNumber": "142534209"
    },
    {
      "installmentNumber": 3,
      "netPremium": 1243,
      "grossPremium": 1243,
      "commission": 0,
      "exchangeRate": 1,
      "currency": "TurkishLira",
      "insuranceCompanyProposalNumber": "142534209"
    }
  ],
  "insuredCustomer": {
    "$type": "individual",
    "identityNumber": "12345678910",
    "birthDate": "1994-01-01",
    "fullName": "Müşteri ismi",
    "phoneNumber": {
      "number": "5432222222",
      "countryCode": 90,
      "areaCode": "543",
      "numberWithoutAreaCode": "2222222"
    },
    "email": {
      "value": "customer@insurup.com"
    },
    "city": {
      "value": "34",
      "text": "İSTANBUL"
    },
    "district": {
      "value": "1823",
      "text": "KÜÇÜKÇEKMECE"
    }
  },
  "event": 1,
  "tempProposalDocumentUrl": null,
  "tempPreInfoDocumentUrl": null,
  "proposalProductId": "67d137b88b415bffb04f9f22",
  "productBranch": 4
}
```

**Örnek Sigortalı Tüzel Müşteri Payload**

```json
{
  "insuredCustomer": {
    "$type": "company",
    "title": "Şirket ismi",
    "taxNumber": "6130782524",
    "phoneNumber": {
      "number": "5432222222",
      "countryCode": 90,
      "areaCode": "543",
      "numberWithoutAreaCode": "2222222"
    },
    "email": {
      "value": "customer@insurup.com"
    },
    "city": {
      "value": "34",
      "text": "İSTANBUL"
    },
    "district": {
      "value": "1823",
      "text": "KÜÇÜKÇEKMECE"
    }
  }
}
```

### `proposal_premium.purchasing` *sync*

Bir teklif primini satın alınmadan önce tetiklenir. Bu event'i satın alma validasyonu olarak kullanabilirsiniz.

**Örnek Payload**

```json
{
  "proposalId": "673afd15f11de64fe1f2bjdb",
  "productId": 40235,
  "installmentNumber": 1,
  "paymentType": "CreditCard"
}
```

### `proposal_premium.purchase_failed` *async*

Bir teklif primini satın alma isteği **başarısız** olunca tetiklenir.

**Örnek Payload**

```json
{
  "proposalId": "673afd15f11de64fe1f2bjdb",
  "productId": 40235,
  "installmentNumber": 1,
  "paymentType": "CreditCard",
  "failureReason": "X sigorta şirketi bilinmeyen bir nedenden dolayı poliçeleştirme isteğini reddetti"
}
```

### `proposal_premium.purchased` *async*

Bir teklif primini satın alma isteği **başarılı** olunca tetiklenir.

**Örnek Payload**

```json
{
  "proposalId": "673afd15f11de64fe1f2bjdb",
  "policyId": "673b4cb4524a0a5187ddbeae",
  "productId": 40235,
  "installmentNumber": 1,
  "paymentType": "CreditCard",
  "policyStartDate": "2024-11-20",
  "policyEndDate": "2025-11-20",
  "tempDocumentUrl": null
}
```

### `policy.created` *async*

Dosya poliçe transfer, online poliçe transfer, proje üzerinden poliçe oluşturma durumlarında tetiklenir.

**Örnek Payload**

```json
{
  "$event": "policy.created",
  "proposalId": "67c93f2fdb57fa44cf64db6a",
  "policyId": "67c94017db57fa44cf64db94",
  "productId": 1595,
  "installmentNumber": 1,
  "paymentType": "CreditCard",
  "startDate": "2025-03-06",
  "endDate": "2026-03-06",
  "renewalNumber": 0,
  "productBranch": "Dask",
  "insurerCustomerId": "256e55a5-e1c5-483e-97df-4156d352fb63",
  "insuredCustomerId": "256e55a5-e1c5-483e-97df-4156d352fb63",
  "insuredCustomerEmail": "tes1t@gmail.com",
  "insurerCustomerEmail": "test2@gmail.com",
  "fromPolicyTransfer": false,
  "channel": "UNKNOWN",
  "netPremium": 7340.47,
  "grossPremium": 8171.8,
  "event": 1000
}
```

### `policy.updated` *async*

Dosya poliçe transfer, online poliçe transfer durumunda zeyil poliçe iletimini tetikler.

**Örnek Payload**

```json
{
  "$event": "policy.updated",
  "policyId": "67c930b9db57fa44cf64daf6",
  "installmentNumber": 1,
  "paymentType": "CreditCard",
  "endorsementNumber": 1,
  "isCancel": false,
  "event": 1001
}
```

## Signature Validasyonu

Webhook'larınızın güvenliğini sağlamak için, gelen isteklerin gerçekten sizin tarafınızdan gönderildiğini doğrulamak amacıyla imza doğrulaması yapmanız önemlidir. Aşağıda, imza doğrulaması için çeşitli dillerde örnek kodlar bulunmaktadır.

### Python

```python
import hmac
import hashlib

def validate_signature(secret, payload, signature):
    computed_signature = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed_signature, signature)
```

### Javascript

```javascript
const crypto = require('crypto');

function validateSignature(secret, payload, signature) {
    const computedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(computedSignature, 'hex'), Buffer.from(signature, 'hex'));
}
```

### C#

```csharp
bool ValidateSignature(string secret, string payload, string signature)
{
    using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret))

    var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
    var computedSignature = BitConverter.ToString(computedHash).Replace("-", "").ToLower();

    return computedSignature == signature.ToLower();
}
```

### PHP

```php
function validate_signature($secret, $payload, $signature) {
    $computed_signature = hash_hmac('sha256', $payload, $secret);
    return hash_equals($computed_signature, $signature);
```

### Java

```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class SignatureValidator {
    public static boolean validateSignature(String secret, String payload, String signature) throws Exception {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
        sha256_HMAC.init(secret_key);

        String computedSignature = Base64.getEncoder().encodeToString(sha256_HMAC.doFinal(payload.getBytes()));
        return computedSignature.equals(signature);
    }
}
```

### PaymentType Değerleri

PaymentType alanında kullanılabilecek değerler aşağıdaki gibidir:

| Değer | Açıklama |
|-------|----------|
| CreditCard | Kredi kartı ile ödeme |
| OpenAccount | Açık hesap ile ödeme |
| Secure3d | 3D Secure ile ödeme |

### ProductBranch Değerleri

`productBranch` alanında kullanılabilecek değerler aşağıdaki gibidir:

| Değer | Kod | Açıklama |
|-------|-----|----------|
| Kasko | 1 | Kasko Sigortası |
| Dask | 2 | Doğal Afet Sigortaları |
| Konut | 3 | Konut Sigortası |
| Trafik | 4 | Trafik Sigortası |
| Tss | 5 | Tamamlayıcı Sağlık Sigortası |
| Imm | 6 | İşyeri Mali Mesuliyet Sigortası |

### Channel Değerleri

`channel` alanında kullanılabilecek değerler aşağıdaki gibidir:

| Değer | JSON Değeri | Açıklama |
|-------|-------------|-----------|
| Unknown | UNKNOWN | Bilinmeyen kanal |
| Manual | MANUAL | Manuel giriş |
| Website | WEBSITE | Web sitesi üzerinden |
| GoogleAds | GOOGLE_ADS | Google Ads üzerinden |
| CallCenter | CALL_CENTER | Çağrı merkezi üzerinden |
| SocialMedia | SOCIAL_MEDIA | Sosyal medya üzerinden |
| MobileApp | MOBILE_APP | Mobil uygulama üzerinden |
| OfflineProposalForm | OFFLINE_PROPOSAL_FORM | Çevrimdışı teklif formu |
| Field | FIELD | Saha satışı |
| PrintMedia | PRINT_MEDIA | Basılı medya |
| FairEvent | FAIR_EVENT | Fuar ve etkinlikler |
| BusinessPartner | BUSINESS_PARTNER | İş ortağı |
| Chatbot | CHATBOT | Chatbot üzerinden |
