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
  "proposalId": "673afd15f11de64fe1f2bjdb",
  "productId": 40235,
  "premiums": [
    {
      "installmentNumber": 1,
      "netPremium": 1243,
      "grossPremium": 1243,
      "commission": 0,
      "exchangeRate": 1,
      "paymentType": "All",
      "currency": "TurkishLira",
      "insuranceCompanyProposalNumber": "142534209"
    },
    {
      "installmentNumber": 2,
      "netPremium": 1243,
      "grossPremium": 1243,
      "commission": 0,
      "exchangeRate": 1,
      "paymentType": "All",
      "currency": "TurkishLira",
      "insuranceCompanyProposalNumber": "142534209"
    },
    {
      "installmentNumber": 3,
      "netPremium": 1243,
      "grossPremium": 1243,
      "commission": 0,
      "exchangeRate": 1,
      "paymentType": "All",
      "currency": "TurkishLira",
      "insuranceCompanyProposalNumber": "142534209"
    }
  ],
  "insuredCustomer": {
    "name": "Müşteri ismi",
    "phoneNumber": {
      "number": "5334180719",
      "countryCode": 90
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
  "policyEndDate": "2025-11-20"
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
