---
title: Webhook API Entegrasyonu
sidebar_position: 3
slug: /entegrasyon/webhook-api-entegrasyonu
---

# Webhook API Entegrasyonu

Webhook'lar, bir olay meydana geldiğinde veya gelirken belirtilen URL'e otomatik HTTP POST isteği göndermek için kullanılır. InsurUp platformunda **18 adet webhook aktivitesi** tanımlanmış durumda olup iki çeşit event tipi bulunmaktadır:

- **Async**: Event'ler bir olay gerçekleştiğinde atılır ve belirtilen API'ın sonucunu yapılan işleme etki etmez. Harici sistemlere açıktır.
- **Sync**: Event'ler bir olay gerçekleşmeden önce atılır ve belirtilen API'ın sonucuna göre yapılan işleme etki edebilir. Dahili kullanım içindir. Ödeme validasyonu güzel bir örnektir.

:::info Webhook Entity Yapısı
Her webhook bir **URL**, **secret** (opsiyonel) ve **dinlenecek event listesi** içerir.
:::

## Header'lar

Webhook isteklerinde aşağıdaki header'lar gönderilir:

| Header | Açıklama |
|--------|----------|
| `x-webhook-event` | Tetiklenen event'in ismidir |
| `x-webhook-id` | Acente panelindeki oluşturulan webhook'un tekil numarasıdır |
| `x-webhook-delivery` | Tekil gönderim numarasıdır |
| `x-webhook-signature` | Bu header eğer `secret` alanı doluysa gönderilir. Belirtilen `secret` ile payload SHA-256 ile şifrelenir |

## Event Özeti

### 📋 Teklif Primi (Proposal Premium) Olayları

| Event | Tanımlayıcı | Tip | Açıklama |
|-------|-------------|-----|----------|
| **ProposalPremiumReceived** | `proposal_premium.received` | Async | Teklif prim hesaplaması alındığında ve başarıyla işlendiğinde tetiklenir |
| **ProposalPremiumPurchasing** | `proposal_premium.purchasing` | Sync | Teklif prim satın alma süreci başlatıldığında tetiklenir (sadece dahili kullanım) |
| **ProposalPremiumPurchased** | `proposal_premium.purchased` | Async | Teklif prim satın alımı başarıyla tamamlandığında tetiklenir |
| **ProposalPremiumPurchaseFailed** | `proposal_premium.purchase_failed` | Async | Teklif prim satın alma girişimi başarısız olduğunda tetiklenir |

### 📄 Poliçe (Policy) Olayları

| Event | Tanımlayıcı | Tip | Açıklama |
|-------|-------------|-----|----------|
| **PolicyCreated** | `policy.created` | Async | Yeni bir sigorta poliçesi oluşturulup düzenlendiğinde tetiklenir |
| **PolicyUpdated** | `policy.updated` | Async | Mevcut bir sigorta poliçesi güncellendiğinde veya değiştirildiğinde tetiklenir |

### 👤 Müşteri (Customer) Olayları

| Event | Tanımlayıcı | Tip | Açıklama |
|-------|-------------|-----|----------|
| **CustomerCreated** | `customer.created` | Async | Yeni bir müşteri oluşturulduğunda tetiklenir |
| **CustomerUpdated** | `customer.updated` | Async | Mevcut bir müşteri güncellendiğinde tetiklenir |
| **CustomerKvkkConsentGiven** | `customer.kvkk_consent_given` | Async | Müşteri KVKK açık rıza onayı verdiğinde tetiklenir |
| **CustomerKvkkConsentRevoked** | `customer.kvkk_consent_revoked` | Async | Müşteri KVKK açık rıza onayını geri çektiğinde tetiklenir |
| **CustomerEtkConsentGiven** | `customer.etk_consent_given` | Async | Müşteri ETK (Ticari Elektronik İleti) onayı verdiğinde tetiklenir |
| **CustomerEtkConsentRevoked** | `customer.etk_consent_revoked` | Async | Müşteri ETK onayını geri çektiğinde tetiklenir |

### 🚗 Araç (Vehicle) Olayları

| Event | Tanımlayıcı | Tip | Açıklama |
|-------|-------------|-----|----------|
| **VehicleCreated** | `vehicle.created` | Async | Bir müşteriye yeni araç kaydı oluşturulduğunda tetiklenir |
| **VehicleUpdated** | `vehicle.updated` | Async | Mevcut bir araç kaydı güncellendiğinde tetiklenir |

### 🏠 Gayrimenkul (Property) Olayları

| Event | Tanımlayıcı | Tip | Açıklama |
|-------|-------------|-----|----------|
| **PropertyCreated** | `property.created` | Async | Bir müşteriye yeni gayrimenkul kaydı oluşturulduğunda tetiklenir |
| **PropertyUpdated** | `property.updated` | Async | Mevcut bir gayrimenkul kaydı güncellendiğinde tetiklenir |

### 📁 Talep (Case) Olayları

| Event | Tanımlayıcı | Tip | Açıklama |
|-------|-------------|-----|----------|
| **CaseCreated** | `case.created` | Async | Yeni bir talep (satış fırsatı, zeyilname, iptal veya şikayet) oluşturulduğunda tetiklenir |
| **CaseStateChanged** | `case.state_changed` | Async | Bir talebin durumu (ana durum veya alt durum) değiştiğinde tetiklenir |

:::tip JSON Polimorfizm
Her event `$event` discriminator'ı ile JSON'da ayırt edilir. Örnek: `"$event": "proposal_premium.received"`
:::

---

## Event Detayları ve Payload Formatları

### `proposal_premium.received` *async*

Bir teklif primi InsurUp'a iletildiği zaman tetiklenir.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`proposal_premium.received`) |
| `proposalId` | `string` | ✅ | Teklif ID'si |
| `productId` | `int` | ✅ | Ürün ID'si |
| `proposalProductId` | `string` | ✅ | Teklif Ürün ID'si |
| `productBranch` | `ProductBranch` | ✅ | Ürün dalı (enum) |
| `premiums` | `PremiumModel[]` | ✅ | Prim detayları listesi |
| `insuredCustomer` | `CustomerModel` | ✅ | Sigortalı müşteri bilgileri |
| `tempProposalDocumentUrl` | `string?` | ❌ | Geçici teklif doküman URL'i |
| `tempPreInfoDocumentUrl` | `string?` | ❌ | Geçici ön bilgi doküman URL'i |

#### Örnek Payload

```json
{
  "$event": "proposal_premium.received",
  "proposalId": "673afd15f11de64fe1f2bjdb",
  "productId": 40235,
  "proposalProductId": "67452b1a022dec6666bf06d8",
  "productBranch": "KASKO",
  "premiums": [
    {
      "installmentNumber": 1,
      "netPremium": 1243,
      "grossPremium": 1243,
      "commission": 0,
      "exchangeRate": 1,
      "currency": "TURKISH_LIRA",
      "insuranceCompanyProposalNumber": "142534209"
    },
    {
      "installmentNumber": 2,
      "netPremium": 1243,
      "grossPremium": 1243,
      "commission": 0,
      "exchangeRate": 1,
      "currency": "TURKISH_LIRA",
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
  "tempProposalDocumentUrl": null,
  "tempPreInfoDocumentUrl": null
}
```

#### Örnek Tüzel Müşteri (Company) Payload

```json
{
  "$event": "proposal_premium.received",
  "proposalId": "673afd15f11de64fe1f2bjdb",
  "productId": 40235,
  "proposalProductId": "67452b1a022dec6666bf06d8",
  "productBranch": "KASKO",
  "premiums": [...],
  "insuredCustomer": {
    "$type": "company",
    "title": "Şirket İsmi A.Ş.",
    "taxNumber": "6130782524",
    "phoneNumber": {
      "number": "5432222222",
      "countryCode": 90,
      "areaCode": "543",
      "numberWithoutAreaCode": "2222222"
    },
    "email": {
      "value": "info@sirket.com"
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
  "tempProposalDocumentUrl": null,
  "tempPreInfoDocumentUrl": null
}
```

---

### `proposal_premium.purchasing` *sync*

Bir teklif primini satın alınmadan önce tetiklenir. Bu event'i satın alma validasyonu olarak kullanabilirsiniz.

:::warning Dahili Kullanım
Bu event sadece dahili kullanım içindir ve harici webhook'lara gönderilmez.
:::

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`proposal_premium.purchasing`) |
| `proposalId` | `string` | ✅ | Teklif ID'si |
| `productId` | `int` | ✅ | Ürün ID'si |
| `installmentNumber` | `int` | ✅ | Taksit sayısı |
| `paymentType` | `PaymentOption` | ✅ | Ödeme tipi (enum) |

#### Örnek Payload

```json
{
  "$event": "proposal_premium.purchasing",
  "proposalId": "673afd15f11de64fe1f2bjdb",
  "productId": 40235,
  "installmentNumber": 1,
  "paymentType": "SYNC_CREDIT_CARD"
}
```

---

### `proposal_premium.purchased` *async*

Bir teklif primini satın alma isteği **başarılı** olunca tetiklenir.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`proposal_premium.purchased`) |
| `proposalId` | `string` | ✅ | Teklif ID'si |
| `policyId` | `string` | ✅ | Oluşturulan poliçe ID'si |
| `productId` | `int` | ✅ | Ürün ID'si |
| `installmentNumber` | `int` | ✅ | Taksit sayısı |
| `paymentType` | `PaymentOption` | ✅ | Ödeme tipi (enum) |
| `policyStartDate` | `DateOnly` | ✅ | Poliçe başlangıç tarihi (YYYY-MM-DD) |
| `policyEndDate` | `DateOnly` | ✅ | Poliçe bitiş tarihi (YYYY-MM-DD) |

#### Örnek Payload

```json
{
  "$event": "proposal_premium.purchased",
  "proposalId": "673afd15f11de64fe1f2bjdb",
  "policyId": "673b4cb4524a0a5187ddbeae",
  "productId": 40235,
  "installmentNumber": 1,
  "paymentType": "SYNC_CREDIT_CARD",
  "policyStartDate": "2024-11-20",
  "policyEndDate": "2025-11-20"
}
```

---

### `proposal_premium.purchase_failed` *async*

Bir teklif primini satın alma isteği **başarısız** olunca tetiklenir.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`proposal_premium.purchase_failed`) |
| `proposalId` | `string` | ✅ | Teklif ID'si |
| `productId` | `int` | ✅ | Ürün ID'si |
| `installmentNumber` | `int` | ✅ | Taksit sayısı |
| `paymentType` | `PaymentOption` | ✅ | Ödeme tipi (enum) |
| `failureReason` | `string?` | ❌ | Başarısızlık nedeni |

#### Örnek Payload

```json
{
  "$event": "proposal_premium.purchase_failed",
  "proposalId": "673afd15f11de64fe1f2bjdb",
  "productId": 40235,
  "installmentNumber": 1,
  "paymentType": "SYNC_CREDIT_CARD",
  "failureReason": "X sigorta şirketi bilinmeyen bir nedenden dolayı poliçeleştirme isteğini reddetti"
}
```

---

### `policy.created` *async*

Yeni bir sigorta poliçesi oluşturulduğunda tetiklenir. Dosya poliçe transfer, online poliçe transfer ve proje üzerinden poliçe oluşturma durumlarında çalışır.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`policy.created`) |
| `policyId` | `string` | ✅ | Poliçe ID'si |
| `proposalId` | `string?` | ❌ | Teklif ID'si |
| `productId` | `int?` | ❌ | Ürün ID'si |
| `installmentNumber` | `int?` | ✅ | Taksit sayısı |
| `paymentType` | `PaymentOption` | ✅ | Ödeme tipi (enum) |
| `insuranceCompany` | `InsuranceCompanyModel` | ✅ | Sigorta şirketi bilgileri |
| `startDate` | `DateOnly` | ✅ | Poliçe başlangıç tarihi (YYYY-MM-DD) |
| `endDate` | `DateOnly` | ✅ | Poliçe bitiş tarihi (YYYY-MM-DD) |
| `renewalNumber` | `byte` | ✅ | Yenileme numarası |
| `productBranch` | `ProductBranch` | ❌ | Ürün dalı (enum) |
| `insurerCustomerId` | `Guid` | ✅ | Sigorta ettiren müşteri ID'si |
| `insuredCustomerId` | `Guid` | ✅ | Sigortalı müşteri ID'si |
| `insurerIdentityNumber` | `string?` | ✅ | 🔒 Sigorta ettiren TC/VKN |
| `insuredIdentityNumber` | `string?` | ✅ | 🔒 Sigortalı TC/VKN |
| `insuredCustomerEmail` | `string?` | ✅ | 🔒 Sigortalı email |
| `insurerCustomerEmail` | `string?` | ✅ | 🔒 Sigorta ettiren email |
| `fromPolicyTransfer` | `bool` | ✅ | Poliçe transferi mi? |
| `netPremium` | `decimal?` | ✅ | Net prim tutarı |
| `grossPremium` | `decimal?` | ✅ | Brüt prim tutarı |
| `channel` | `Channel` | ✅ | Satış kanalı (enum) |
| `insuranceCompanyPolicyNo` | `string` | ✅ | Sigorta şirketi poliçe numarası |

#### Örnek Payload

```json
{
  "$event": "policy.created",
  "policyId": "67c94017db57fa44cf64db94",
  "proposalId": "67c93f2fdb57fa44cf64db6a",
  "productId": 1595,
  "installmentNumber": 1,
  "paymentType": "SYNC_CREDIT_CARD",
  "insuranceCompany": {
    "id": 12,
    "name": "Anadolu Sigorta",
    "logo": "https://cdn.insurup.com/logos/anadolu.png",
    "enabled": true,
    "supportedPaymentOptions": ["SYNC_CREDIT_CARD", "SYNC_OPEN_ACCOUNT"]
  },
  "startDate": "2025-03-06",
  "endDate": "2026-03-06",
  "renewalNumber": 0,
  "productBranch": "DASK",
  "insurerCustomerId": "256e55a5-e1c5-483e-97df-4156d352fb63",
  "insuredCustomerId": "256e55a5-e1c5-483e-97df-4156d352fb63",
  "insurerIdentityNumber": "12345678910",
  "insuredIdentityNumber": "12345678910",
  "insuredCustomerEmail": "customer@insurup.com",
  "insurerCustomerEmail": "customer@insurup.com",
  "fromPolicyTransfer": false,
  "netPremium": 1500.00,
  "grossPremium": 1650.00,
  "channel": "WEBSITE",
  "insuranceCompanyPolicyNo": "POL-2025-123456"
}
```

---

### `policy.updated` *async*

Mevcut bir sigorta poliçesi güncellendiğinde veya değiştirildiğinde tetiklenir. Zeyilname işlemleri ve iptal durumlarında çalışır.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`policy.updated`) |
| `policyId` | `string` | ✅ | Poliçe ID'si |
| `installmentNumber` | `int?` | ✅ | Taksit sayısı |
| `paymentType` | `PaymentOption` | ✅ | Ödeme tipi (enum) |
| `endorsementNumber` | `byte` | ✅ | Zeyilname numarası |
| `isCancel` | `bool` | ✅ | İptal işlemi mi? |
| `netPremium` | `decimal` | ✅ | Net prim tutarı |
| `grossPremium` | `decimal` | ✅ | Brüt prim tutarı |
| `insurerIdentityNumber` | `string?` | ✅ | 🔒 Sigorta ettiren TC/VKN |
| `insuredIdentityNumber` | `string?` | ✅ | 🔒 Sigortalı TC/VKN |
| `insuranceCompanyPolicyNo` | `string` | ✅ | Sigorta şirketi poliçe numarası |

#### Örnek Payload

```json
{
  "$event": "policy.updated",
  "policyId": "67c930b9db57fa44cf64daf6",
  "installmentNumber": 1,
  "paymentType": "SYNC_CREDIT_CARD",
  "endorsementNumber": 1,
  "isCancel": false,
  "netPremium": 250.00,
  "grossPremium": 275.00,
  "insurerIdentityNumber": "12345678910",
  "insuredIdentityNumber": "12345678910",
  "insuranceCompanyPolicyNo": "POL-2025-123456"
}
```

#### Örnek İptal Payload'ı

```json
{
  "$event": "policy.updated",
  "policyId": "67c930b9db57fa44cf64daf6",
  "installmentNumber": 1,
  "paymentType": "SYNC_CREDIT_CARD",
  "endorsementNumber": 2,
  "isCancel": true,
  "netPremium": -1500.00,
  "grossPremium": -1650.00,
  "insurerIdentityNumber": "12345678910",
  "insuredIdentityNumber": "12345678910",
  "insuranceCompanyPolicyNo": "POL-2025-123456"
}
```

---

### `customer.created` *async*

Yeni bir müşteri oluşturulduğunda tetiklenir. Bireysel, tüzel ve yabancı uyruklu müşteri tipleri için geçerlidir.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`customer.created`) |
| `customerId` | `Guid` | ✅ | Müşteri ID'si |
| `customerType` | `CustomerType` | ✅ | Müşteri tipi (enum) |
| `identityNumber` | `string?` | ❌ | 🔒 TC Kimlik / Yabancı kimlik numarası |
| `firstName` | `string?` | ❌ | Ad (bireysel/yabancı müşteriler için) |
| `lastName` | `string?` | ❌ | Soyad (bireysel/yabancı müşteriler için) |
| `companyTitle` | `string?` | ❌ | Şirket unvanı (tüzel müşteriler için) |
| `taxNumber` | `string?` | ❌ | 🔒 Vergi numarası (tüzel müşteriler için) |
| `birthDate` | `DateOnly?` | ❌ | Doğum tarihi (YYYY-MM-DD) |
| `gender` | `Gender?` | ❌ | Cinsiyet (enum) |
| `maritalStatus` | `MaritalStatus?` | ❌ | Medeni durum (enum) |
| `province` | `string?` | ❌ | İl |
| `district` | `string?` | ❌ | İlçe |
| `email` | `string?` | ❌ | 🔒 E-posta adresi |
| `phoneNumber` | `string?` | ❌ | 🔒 Telefon numarası |
| `createdAt` | `DateTime` | ✅ | Oluşturulma tarihi (ISO 8601) |
| `branch` | `string?` | ❌ | Şube bilgisi |
| `creationChannel` | `Channel` | ✅ | Oluşturulma kanalı (enum) |

#### Örnek Bireysel Müşteri Payload

```json
{
  "$event": "customer.created",
  "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "customerType": "INDIVIDUAL",
  "identityNumber": "12345678910",
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "companyTitle": null,
  "taxNumber": null,
  "birthDate": "1990-05-15",
  "gender": "MALE",
  "maritalStatus": "MARRIED",
  "province": "İstanbul",
  "district": "Kadıköy",
  "email": "ahmet@example.com",
  "phoneNumber": "5321234567",
  "createdAt": "2026-03-10T14:30:00Z",
  "branch": null,
  "creationChannel": "WEBSITE"
}
```

#### Örnek Tüzel Müşteri Payload

```json
{
  "$event": "customer.created",
  "customerId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "customerType": "COMPANY",
  "identityNumber": null,
  "firstName": null,
  "lastName": null,
  "companyTitle": "ABC Sigorta Ltd. Şti.",
  "taxNumber": "6130782524",
  "birthDate": null,
  "gender": null,
  "maritalStatus": null,
  "province": "Ankara",
  "district": "Çankaya",
  "email": "info@abcsigorta.com",
  "phoneNumber": "3121234567",
  "createdAt": "2026-03-10T14:30:00Z",
  "branch": null,
  "creationChannel": "MANUAL"
}
```

---

### `customer.updated` *async*

Mevcut bir müşteri güncellendiğinde tetiklenir.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`customer.updated`) |
| `customerId` | `Guid` | ✅ | Müşteri ID'si |
| `customerType` | `CustomerType` | ✅ | Müşteri tipi (enum) |
| `identityNumber` | `string?` | ❌ | 🔒 TC Kimlik / Yabancı kimlik numarası |
| `firstName` | `string?` | ❌ | Ad |
| `lastName` | `string?` | ❌ | Soyad |
| `companyTitle` | `string?` | ❌ | Şirket unvanı |
| `taxNumber` | `string?` | ❌ | 🔒 Vergi numarası |
| `birthDate` | `DateOnly?` | ❌ | Doğum tarihi (YYYY-MM-DD) |
| `gender` | `Gender?` | ❌ | Cinsiyet (enum) |
| `maritalStatus` | `MaritalStatus?` | ❌ | Medeni durum (enum) |
| `province` | `string?` | ❌ | İl |
| `district` | `string?` | ❌ | İlçe |
| `email` | `string?` | ❌ | 🔒 E-posta adresi |
| `phoneNumber` | `string?` | ❌ | 🔒 Telefon numarası |
| `updatedAt` | `DateTime` | ✅ | Güncellenme tarihi (ISO 8601) |
| `updatedBy` | `UserReference?` | ❌ | Güncellemeyi yapan kullanıcı |
| `branch` | `string?` | ❌ | Şube bilgisi |

#### Örnek Payload

```json
{
  "$event": "customer.updated",
  "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "customerType": "INDIVIDUAL",
  "identityNumber": "12345678910",
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "companyTitle": null,
  "taxNumber": null,
  "birthDate": "1990-05-15",
  "gender": "MALE",
  "maritalStatus": "MARRIED",
  "province": "İstanbul",
  "district": "Beşiktaş",
  "email": "ahmet.yeni@example.com",
  "phoneNumber": "5321234567",
  "updatedAt": "2026-03-10T16:45:00Z",
  "updatedBy": {
    "id": "d4e5f6a7-b8c9-0123-def4-567890abcdef",
    "name": "Operatör Adı",
    "email": "operator@acente.com",
    "userType": "AGENT"
  },
  "branch": null
}
```

---

### `customer.kvkk_consent_given` *async*

Müşteri KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında açık rıza onayı verdiğinde tetiklenir.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`customer.kvkk_consent_given`) |
| `customerId` | `Guid` | ✅ | Müşteri ID'si |
| `customerType` | `CustomerType` | ✅ | Müşteri tipi (enum) |
| `channel` | `ConsentChannel` | ✅ | Onayın alındığı kanal (enum) |
| `givenAt` | `DateTimeOffset` | ✅ | Onay verilme tarihi (ISO 8601) |

#### Örnek Payload

```json
{
  "$event": "customer.kvkk_consent_given",
  "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "customerType": "INDIVIDUAL",
  "channel": "WEB",
  "givenAt": "2026-03-10T14:30:00+03:00"
}
```

---

### `customer.kvkk_consent_revoked` *async*

Müşteri KVKK açık rıza onayını geri çektiğinde tetiklenir.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`customer.kvkk_consent_revoked`) |
| `customerId` | `Guid` | ✅ | Müşteri ID'si |
| `customerType` | `CustomerType` | ✅ | Müşteri tipi (enum) |
| `channel` | `ConsentChannel` | ✅ | Geri çekme kanalı (enum) |
| `revokedAt` | `DateTimeOffset` | ✅ | Geri çekme tarihi (ISO 8601) |

#### Örnek Payload

```json
{
  "$event": "customer.kvkk_consent_revoked",
  "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "customerType": "INDIVIDUAL",
  "channel": "MANUAL",
  "revokedAt": "2026-03-10T16:00:00+03:00"
}
```

---

### `customer.etk_consent_given` *async*

Müşteri ETK (Ticari Elektronik İleti) onayı verdiğinde tetiklenir.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`customer.etk_consent_given`) |
| `customerId` | `Guid` | ✅ | Müşteri ID'si |
| `customerType` | `CustomerType` | ✅ | Müşteri tipi (enum) |
| `channel` | `ConsentChannel` | ✅ | Onayın alındığı kanal (enum) |
| `givenAt` | `DateTimeOffset` | ✅ | Onay verilme tarihi (ISO 8601) |

#### Örnek Payload

```json
{
  "$event": "customer.etk_consent_given",
  "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "customerType": "INDIVIDUAL",
  "channel": "WEB",
  "givenAt": "2026-03-10T14:30:00+03:00"
}
```

---

### `customer.etk_consent_revoked` *async*

Müşteri ETK onayını geri çektiğinde tetiklenir.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`customer.etk_consent_revoked`) |
| `customerId` | `Guid` | ✅ | Müşteri ID'si |
| `customerType` | `CustomerType` | ✅ | Müşteri tipi (enum) |
| `channel` | `ConsentChannel` | ✅ | Geri çekme kanalı (enum) |
| `revokedAt` | `DateTimeOffset` | ✅ | Geri çekme tarihi (ISO 8601) |

#### Örnek Payload

```json
{
  "$event": "customer.etk_consent_revoked",
  "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "customerType": "INDIVIDUAL",
  "channel": "MANUAL",
  "revokedAt": "2026-03-10T16:00:00+03:00"
}
```

---

### `vehicle.created` *async*

Bir müşteriye yeni araç kaydı oluşturulduğunda tetiklenir.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`vehicle.created`) |
| `customerId` | `Guid` | ✅ | Araç sahibi müşteri ID'si |
| `vehicleId` | `Guid` | ✅ | Araç ID'si |
| `plate` | `string?` | ❌ | 🔒 Plaka numarası |
| `brandName` | `string?` | ❌ | Marka adı |
| `modelName` | `string?` | ❌ | Model adı |
| `modelYear` | `int?` | ❌ | Model yılı |
| `utilizationStyle` | `VehicleUtilizationStyle?` | ❌ | Kullanım tarzı (enum) |
| `fuel` | `VehicleFuel?` | ❌ | Yakıt tipi (enum) |
| `chassis` | `string?` | ❌ | 🔒 Şasi numarası |
| `engine` | `string?` | ❌ | 🔒 Motor numarası |
| `registrationDate` | `DateOnly?` | ❌ | Tescil tarihi (YYYY-MM-DD) |
| `createdAt` | `DateTime` | ✅ | Oluşturulma tarihi (ISO 8601) |

#### Örnek Payload

```json
{
  "$event": "vehicle.created",
  "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "vehicleId": "c3d4e5f6-a7b8-9012-cdef-345678901234",
  "plate": "34ABC123",
  "brandName": "Toyota",
  "modelName": "Corolla",
  "modelYear": 2024,
  "utilizationStyle": "PRIVATE_CAR",
  "fuel": "HYBRID",
  "chassis": "JTDKN3DU5A0123456",
  "engine": "1NZ-FXE",
  "registrationDate": "2024-06-15",
  "createdAt": "2026-03-10T14:30:00Z"
}
```

---

### `vehicle.updated` *async*

Mevcut bir araç kaydı güncellendiğinde tetiklenir.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`vehicle.updated`) |
| `customerId` | `Guid` | ✅ | Araç sahibi müşteri ID'si |
| `vehicleId` | `Guid` | ✅ | Araç ID'si |
| `plate` | `string?` | ❌ | 🔒 Plaka numarası |
| `brandName` | `string?` | ❌ | Marka adı |
| `modelName` | `string?` | ❌ | Model adı |
| `modelYear` | `int?` | ❌ | Model yılı |
| `utilizationStyle` | `VehicleUtilizationStyle?` | ❌ | Kullanım tarzı (enum) |
| `fuel` | `VehicleFuel?` | ❌ | Yakıt tipi (enum) |
| `chassis` | `string?` | ❌ | 🔒 Şasi numarası |
| `engine` | `string?` | ❌ | 🔒 Motor numarası |
| `registrationDate` | `DateOnly?` | ❌ | Tescil tarihi (YYYY-MM-DD) |
| `updatedAt` | `DateTime` | ✅ | Güncellenme tarihi (ISO 8601) |
| `updatedBy` | `UserReference?` | ❌ | Güncellemeyi yapan kullanıcı |

#### Örnek Payload

```json
{
  "$event": "vehicle.updated",
  "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "vehicleId": "c3d4e5f6-a7b8-9012-cdef-345678901234",
  "plate": "34ABC123",
  "brandName": "Toyota",
  "modelName": "Corolla",
  "modelYear": 2024,
  "utilizationStyle": "PRIVATE_CAR",
  "fuel": "HYBRID",
  "chassis": "JTDKN3DU5A0123456",
  "engine": "1NZ-FXE",
  "registrationDate": "2024-06-15",
  "updatedAt": "2026-03-10T16:45:00Z",
  "updatedBy": {
    "id": "d4e5f6a7-b8c9-0123-def4-567890abcdef",
    "name": "Operatör Adı",
    "email": "operator@acente.com",
    "userType": "AGENT"
  }
}
```

---

### `property.created` *async*

Bir müşteriye yeni gayrimenkul kaydı oluşturulduğunda tetiklenir.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`property.created`) |
| `customerId` | `Guid` | ✅ | Gayrimenkul sahibi müşteri ID'si |
| `propertyId` | `Guid` | ✅ | Gayrimenkul ID'si |
| `propertyNumber` | `long?` | ❌ | Bina/bağımsız bölüm numarası |
| `address` | `string?` | ❌ | 🔒 Adres |
| `squareMeter` | `int?` | ❌ | Metrekare |
| `constructionYear` | `int?` | ❌ | İnşaat yılı |
| `utilizationStyle` | `PropertyUtilizationStyle?` | ❌ | Kullanım tarzı (enum) |
| `ownershipType` | `PropertyOwnershipType?` | ❌ | Mülkiyet tipi (enum) |
| `createdAt` | `DateTime` | ✅ | Oluşturulma tarihi (ISO 8601) |

#### Örnek Payload

```json
{
  "$event": "property.created",
  "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "propertyId": "e5f6a7b8-c9d0-1234-ef56-789012345678",
  "propertyNumber": 12345678,
  "address": "Kadıköy Mah. Bağdat Cad. No:123 Daire:5",
  "squareMeter": 120,
  "constructionYear": 2015,
  "utilizationStyle": "HOUSE",
  "ownershipType": "PROPRIETOR",
  "createdAt": "2026-03-10T14:30:00Z"
}
```

---

### `property.updated` *async*

Mevcut bir gayrimenkul kaydı güncellendiğinde tetiklenir.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`property.updated`) |
| `customerId` | `Guid` | ✅ | Gayrimenkul sahibi müşteri ID'si |
| `propertyId` | `Guid` | ✅ | Gayrimenkul ID'si |
| `propertyNumber` | `long?` | ❌ | Bina/bağımsız bölüm numarası |
| `address` | `string?` | ❌ | 🔒 Adres |
| `squareMeter` | `int?` | ❌ | Metrekare |
| `constructionYear` | `int?` | ❌ | İnşaat yılı |
| `utilizationStyle` | `PropertyUtilizationStyle?` | ❌ | Kullanım tarzı (enum) |
| `ownershipType` | `PropertyOwnershipType?` | ❌ | Mülkiyet tipi (enum) |
| `updatedAt` | `DateTime` | ✅ | Güncellenme tarihi (ISO 8601) |
| `updatedBy` | `UserReference?` | ❌ | Güncellemeyi yapan kullanıcı |

#### Örnek Payload

```json
{
  "$event": "property.updated",
  "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "propertyId": "e5f6a7b8-c9d0-1234-ef56-789012345678",
  "propertyNumber": 12345678,
  "address": "Kadıköy Mah. Bağdat Cad. No:123 Daire:5",
  "squareMeter": 120,
  "constructionYear": 2015,
  "utilizationStyle": "HOUSE",
  "ownershipType": "TENANT",
  "updatedAt": "2026-03-10T16:45:00Z",
  "updatedBy": {
    "id": "d4e5f6a7-b8c9-0123-def4-567890abcdef",
    "name": "Operatör Adı",
    "email": "operator@acente.com",
    "userType": "AGENT"
  }
}
```

---

### `case.created` *async*

Yeni bir talep oluşturulduğunda tetiklenir. Satış fırsatı, zeyilname, iptal ve şikayet tipleri için geçerlidir.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`case.created`) |
| `caseId` | `string` | ✅ | Talep ID'si |
| `caseRef` | `string` | ✅ | Talep referans numarası |
| `caseType` | `CaseType` | ✅ | Talep tipi (enum) |
| `customerId` | `Guid` | ✅ | Müşteri ID'si |
| `productBranch` | `ProductBranch?` | ❌ | Ürün dalı (enum) |

#### Örnek Payload

```json
{
  "$event": "case.created",
  "caseId": "67cf1a2b3c4d5e6f7a8b9c0d",
  "caseRef": "SF-2026-001234",
  "caseType": "SALE_OPPORTUNITY",
  "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "productBranch": "KASKO"
}
```

---

### `case.state_changed` *async*

Bir talebin ana durumu veya alt durumu değiştiğinde tetiklenir.

#### Alan Referansı

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$event` | `string` | ✅ | Event tanımlayıcısı (`case.state_changed`) |
| `caseId` | `string` | ✅ | Talep ID'si |
| `caseRef` | `string` | ✅ | Talep referans numarası |
| `customerId` | `Guid` | ✅ | Müşteri ID'si |
| `newMainState` | `CaseMainState` | ✅ | Yeni ana durum (enum) |
| `newSubState` | `CaseSubState` | ✅ | Yeni alt durum (enum) |

#### Örnek Payload

```json
{
  "$event": "case.state_changed",
  "caseId": "67cf1a2b3c4d5e6f7a8b9c0d",
  "caseRef": "SF-2026-001234",
  "customerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "newMainState": "IN_PROGRESS",
  "newSubState": "IN_PROGRESS_UNDER_ANALYSIS"
}
```

---

## Model Referansları

### PremiumModel

Prim detaylarını içeren model.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `installmentNumber` | `int` | ✅ | Taksit numarası |
| `netPremium` | `decimal` | ✅ | Net prim tutarı |
| `grossPremium` | `decimal` | ✅ | Brüt prim tutarı |
| `commission` | `decimal` | ✅ | Komisyon tutarı |
| `exchangeRate` | `decimal` | ✅ | Döviz kuru |
| `currency` | `Currency` | ✅ | Para birimi (enum) |
| `insuranceCompanyProposalNumber` | `string?` | ❌ | Sigorta şirketi teklif numarası |

### CustomerModel (Polimorfik)

Müşteri bilgilerini içeren polimorfik model. `$type` alanına göre 3 farklı tip olabilir.

#### IndividualCustomerModel (`$type: "individual"`)

Bireysel müşteri modeli.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$type` | `string` | ✅ | `"individual"` sabit değer |
| `identityNumber` | `string` | ✅ | 🔒 TC Kimlik numarası |
| `birthDate` | `DateOnly` | ✅ | Doğum tarihi (YYYY-MM-DD) |
| `fullName` | `string` | ✅ | 🔒 Ad soyad |
| `phoneNumber` | `CustomerPhoneNumber?` | ❌ | 🔒 Telefon numarası |
| `email` | `CustomerEmail?` | ❌ | 🔒 E-posta adresi |
| `city` | `InsuranceParameter?` | ❌ | İl bilgisi |
| `district` | `InsuranceParameter?` | ❌ | İlçe bilgisi |

#### ForeignCustomerModel (`$type: "foreign"`)

Yabancı uyruklu müşteri modeli.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$type` | `string` | ✅ | `"foreign"` sabit değer |
| `identityNumber` | `string` | ✅ | 🔒 Yabancı kimlik numarası |
| `birthDate` | `DateOnly` | ✅ | Doğum tarihi (YYYY-MM-DD) |
| `fullName` | `string` | ✅ | 🔒 Ad soyad |
| `phoneNumber` | `CustomerPhoneNumber?` | ❌ | 🔒 Telefon numarası |
| `email` | `CustomerEmail?` | ❌ | 🔒 E-posta adresi |
| `city` | `InsuranceParameter?` | ❌ | İl bilgisi |
| `district` | `InsuranceParameter?` | ❌ | İlçe bilgisi |

#### CompanyCustomerModel (`$type: "company"`)

Tüzel müşteri (şirket) modeli.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `$type` | `string` | ✅ | `"company"` sabit değer |
| `title` | `string` | ✅ | 🔒 Şirket unvanı |
| `taxNumber` | `string` | ✅ | 🔒 Vergi numarası |
| `phoneNumber` | `CustomerPhoneNumber?` | ❌ | 🔒 Telefon numarası |
| `email` | `CustomerEmail?` | ❌ | 🔒 E-posta adresi |
| `city` | `InsuranceParameter?` | ❌ | İl bilgisi |
| `district` | `InsuranceParameter?` | ❌ | İlçe bilgisi |

### CustomerPhoneNumber

Telefon numarası detaylarını içeren model.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `number` | `string` | ✅ | Tam telefon numarası |
| `countryCode` | `int` | ✅ | Ülke kodu (örn: 90) |
| `areaCode` | `string` | ✅ | Alan kodu (örn: 543) |
| `numberWithoutAreaCode` | `string` | ✅ | Alan kodu hariç numara |

### CustomerEmail

E-posta adresini içeren model.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `value` | `string` | ✅ | E-posta adresi |

### InsuranceParameter

Sigorta parametresi modeli (il, ilçe vb. için kullanılır).

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `value` | `string` | ✅ | Parametre değeri/kodu |
| `text` | `string` | ✅ | Parametre açıklaması |

### InsuranceCompanyModel

Sigorta şirketi bilgilerini içeren model.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `id` | `int` | ✅ | Sigorta şirketi ID'si |
| `name` | `string` | ✅ | Sigorta şirketi adı |
| `logo` | `string?` | ❌ | Logo URL'i |
| `enabled` | `bool` | ❌ | Aktif mi? |
| `supportedPaymentOptions` | `PaymentOption[]` | ❌ | Desteklenen ödeme seçenekleri |

### UserReference

Güncelleme yapan kullanıcıyı temsil eden hafif referans modeli. `customer.updated`, `vehicle.updated` ve `property.updated` event'lerinde kullanılır.

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|:-------:|----------|
| `id` | `Guid` | ✅ | Kullanıcı ID'si |
| `name` | `string` | ✅ | Kullanıcı görünen adı |
| `email` | `string?` | ❌ | Kullanıcı e-posta adresi |
| `userType` | `UserType?` | ❌ | Kullanıcı tipi (`ADMIN_PANEL`, `AGENT`, `CUSTOMER`) |

---

## Enum Değerleri

### PaymentOption

Ödeme seçenekleri.

| Değer | JSON Değeri | Açıklama |
|-------|-------------|----------|
| `Unknown` | `UNKNOWN` | Bilinmeyen |
| `SyncCreditCard` | `SYNC_CREDIT_CARD` | Senkron kredi kartı ödemesi |
| `SyncOpenAccount` | `SYNC_OPEN_ACCOUNT` | Senkron açık hesap ödemesi |
| `Async3DSecure` | `ASYNC_3D_SECURE` | Asenkron 3D Secure ödemesi |
| `AsyncInsuranceCompanyRedirect` | `ASYNC_INSURANCE_COMPANY_REDIRECT` | Sigorta şirketi yönlendirmeli ödeme |
| `AsyncThirdParty3DSecure` | `ASYNC_THIRD_PARTY_3D_SECURE` | Üçüncü parti 3D Secure ödemesi |

### Currency

Para birimi.

| Değer | JSON Değeri | Açıklama |
|-------|-------------|----------|
| `Unknown` | `UNKNOWN` | Bilinmeyen |
| `TurkishLira` | `TURKISH_LIRA` | Türk Lirası (TRY) |
| `UnitedStatesDollar` | `UNITED_STATES_DOLLAR` | Amerikan Doları (USD) |
| `Euro` | `EURO` | Euro (EUR) |

### ProductBranch

Ürün dalları.

| Değer | JSON Değeri | Açıklama |
|-------|-------------|----------|
| `Kasko` | `KASKO` | Kasko sigortası |
| `Trafik` | `TRAFIK` | Zorunlu trafik sigortası |
| `Dask` | `DASK` | DASK (Zorunlu deprem sigortası) |
| `Konut` | `KONUT` | Konut sigortası |
| `Tss` | `TSS` | Tamamlayıcı sağlık sigortası |
| `Imm` | `IMM` | İhtiyari mali mesuliyet |
| `YesilKart` | `YESIL_KART` | Yeşil kart sigortası |
| `Saglik` | `SAGLIK` | Sağlık sigortası |
| `Seyahat` | `SEYAHAT` | Seyahat sigortası |
| `Ferdi` | `FERDI` | Ferdi kaza sigortası |
| `Isyeri` | `ISYERI` | İşyeri sigortası |

### Channel

Satış kanalları.

| Değer | JSON Değeri | Açıklama |
|-------|-------------|----------|
| `Unknown` | `UNKNOWN` | Bilinmeyen |
| `Manual` | `MANUAL` | Manuel giriş |
| `Website` | `WEBSITE` | Web sitesi |
| `GoogleAds` | `GOOGLE_ADS` | Google Ads |
| `CallCenter` | `CALL_CENTER` | Çağrı merkezi |
| `MobileApp` | `MOBILE_APP` | Mobil uygulama |
| `Api` | `API` | API entegrasyonu |
| `Partner` | `PARTNER` | İş ortağı |

### CustomerType

Müşteri tipleri.

| Değer | JSON Değeri | Açıklama |
|-------|-------------|----------|
| `Individual` | `INDIVIDUAL` | Bireysel müşteri |
| `Company` | `COMPANY` | Tüzel müşteri (şirket) |
| `Foreign` | `FOREIGN` | Yabancı uyruklu müşteri |

### Gender

Cinsiyet.

| Değer | JSON Değeri | Açıklama |
|-------|-------------|----------|
| `Unknown` | `UNKNOWN` | Bilinmeyen |
| `Male` | `MALE` | Erkek |
| `Female` | `FEMALE` | Kadın |
| `Other` | `OTHER` | Diğer |

### MaritalStatus

Medeni durum.

| Değer | JSON Değeri | Açıklama |
|-------|-------------|----------|
| `Unknown` | `UNKNOWN` | Bilinmeyen |
| `Single` | `SINGLE` | Bekar |
| `Married` | `MARRIED` | Evli |

### ConsentChannel

Onay kanalları. KVKK ve ETK onay event'lerinde kullanılır.

| Değer | JSON Değeri | Açıklama |
|-------|-------------|----------|
| `Manual` | `MANUAL` | Manuel giriş |
| `Web` | `WEB` | Web sitesi |
| `Chatbot` | `CHATBOT` | Chatbot |
| `SMS` | `SMS` | SMS |
| `Email` | `EMAIL` | E-posta |
| `External` | `EXTERNAL` | Harici sistem |

### VehicleFuel

Araç yakıt tipleri.

| Değer | JSON Değeri | Açıklama |
|-------|-------------|----------|
| `Gasoline` | `GASOLINE` | Benzin |
| `Diesel` | `DIESEL` | Dizel |
| `Lpg` | `LPG` | LPG |
| `Electric` | `ELECTRIC` | Elektrik |
| `LpgGasoline` | `LPG_GASOLINE` | LPG + Benzin |
| `Hybrid` | `HYBRID` | Hibrit |

### VehicleUtilizationStyle

Araç kullanım tarzları. Sık kullanılan değerler aşağıda listelenmiştir.

| Değer | JSON Değeri | Açıklama |
|-------|-------------|----------|
| `Unknown` | `UNKNOWN` | Bilinmeyen |
| `PrivateCar` | `PRIVATE_CAR` | Hususi otomobil |
| `Taxi` | `TAXI` | Taksi |
| `Motorcycle` | `MOTORCYCLE` | Motosiklet |
| `Truck` | `TRUCK` | Kamyon |
| `PickupTruck` | `PICKUP_TRUCK` | Kamyonet (açık kasa) |
| `ClosedBedPickup` | `CLOSED_BED_PICKUP` | Kamyonet (kapalı kasa) |
| `RentalCar` | `RENTAL_CAR` | Kiralık araç |
| `Jeep` | `JEEP` | Jeep |
| `JeepSUV` | `JEEP_SUV` | Jeep SUV |
| `MinibusSharedTaxi` | `MINIBUS_SHARED_TAXI` | Minibüs / Dolmuş |
| `MediumBus` | `MEDIUM_BUS` | Orta boy otobüs |
| `LargeBus` | `LARGE_BUS` | Büyük otobüs |
| `Tractor` | `TRACTOR` | Traktör |
| `Trailer` | `TRAILER` | Römork |
| `Tanker` | `TANKER` | Tanker |
| `ConstructionMachinery` | `CONSTRUCTION_MACHINERY` | İş makinesi |
| `Ambulance` | `AMBULANCE` | Ambulans |
| `Hearse` | `HEARSE` | Cenaze aracı |

:::info Tam Liste
Yukarıdaki tablo sık kullanılan değerleri içerir. Toplam 60'ın üzerinde kullanım tarzı mevcuttur. Tam liste için API referansını inceleyiniz.
:::

### PropertyUtilizationStyle

Gayrimenkul kullanım tarzları.

| Değer | JSON Değeri | Açıklama |
|-------|-------------|----------|
| `Unknown` | `UNKNOWN` | Bilinmeyen |
| `House` | `HOUSE` | Konut |
| `Business` | `BUSINESS` | İşyeri |
| `Other` | `OTHER` | Diğer |

### PropertyOwnershipType

Gayrimenkul mülkiyet tipleri.

| Değer | JSON Değeri | Açıklama |
|-------|-------------|----------|
| `Unknown` | `UNKNOWN` | Bilinmeyen |
| `Proprietor` | `PROPRIETOR` | Mülk sahibi |
| `Tenant` | `TENANT` | Kiracı |

### CaseType

Talep tipleri.

| Değer | JSON Değeri | Açıklama |
|-------|-------------|----------|
| `SaleOpportunity` | `SALE_OPPORTUNITY` | Satış fırsatı |
| `Endorsement` | `ENDORSEMENT` | Zeyilname |
| `Cancel` | `CANCEL` | İptal |
| `Complaint` | `COMPLAINT` | Şikayet |

### CaseMainState

Talep ana durumları.

| Değer | JSON Değeri | Açıklama |
|-------|-------------|----------|
| `Fail` | `FAIL` | Başarısız |
| `Open` | `OPEN` | Açık |
| `InProgress` | `IN_PROGRESS` | Süreçte |
| `Success` | `SUCCESS` | Başarılı |

### CaseSubState

Talep alt durumları. Ana duruma göre gruplandırılmıştır.

**Fail (Başarısız) Durumları:**

| JSON Değeri | Açıklama |
|-------------|----------|
| `FAIL_NO_RESPONSE` | Yanıt alınamadı |
| `FAIL_INVALID_CASE` | Geçersiz talep |
| `FAIL_CUSTOMER_WITHDRAWN` | Müşteri çekildi |
| `FAIL_PAYMENT_ERROR` | Ödeme hatası |
| `FAIL_DECLINED_CARD_INFORMATION` | Kart bilgisi reddedildi |
| `FAIL_FOREIGN_USER` | Yabancı kullanıcı kısıtlaması |
| `FAIL_TAKEN_ELSEWHERE` | Rakipten alındı (satış fırsatı) |
| `FAIL_PRICE_TOO_HIGH` | Fiyat çok yüksek (satış fırsatı) |
| `FAIL_ASSET_ACQUISITION` | Varlık edinilmedi (satış fırsatı) |
| `FAIL_ASSET_SOLD` | Varlık satıldı (satış fırsatı) |
| `FAIL_UNRESOLVED` | Çözülemedi (şikayet) |
| `FAIL_REFERRED_TO_LEGAL` | Hukuka sevk edildi (şikayet) |
| `FAIL_CUSTOMER_UNSATISFIED` | Müşteri memnun kalmadı (şikayet) |
| `FAIL_MISSING_DOCUMENTS` | Eksik belge (zeyilname/iptal) |
| `FAIL_INSURER_DENIED` | Sigortacı reddetti (zeyilname/iptal) |
| `FAIL_CONDITIONS_NOT_MET` | Koşullar karşılanmadı (zeyilname/iptal) |

**Open (Açık) Durumları:**

| JSON Değeri | Açıklama |
|-------------|----------|
| `OPEN_INITIAL` | Yeni oluşturuldu |
| `OPEN_COLLECTING_INFORMATION` | Bilgi toplanıyor |
| `OPEN_DELAYED` | Gecikmiş |
| `OPEN_WAITING` | Dış yanıt bekleniyor |

**InProgress (Süreçte) Durumları:**

| JSON Değeri | Açıklama |
|-------------|----------|
| `IN_PROGRESS_UNDER_ANALYSIS` | Analiz altında |
| `IN_PROGRESS_PROPOSAL_PREPARED` | Teklif hazırlandı |
| `IN_PROGRESS_AWAITING_APPROVAL` | Onay bekleniyor |
| `IN_PROGRESS_TO_BE_RECONTACTED` | Yeniden iletişime geçilecek |

**Success (Başarılı) Durumları:**

| JSON Değeri | Açıklama |
|-------------|----------|
| `SUCCESS_COMPLETED` | Başarıyla tamamlandı |

---

## 🔒 Veri Güvenliği

:::caution Maskelenmiş Alanlar
Tablolarda 🔒 simgesiyle işaretlenmiş alanlar (TC kimlik, email, telefon, vergi numarası, plaka, şasi, motor numarası, adres vb.) hassas kişisel veri içerir. Bu alanlar:

- Loglarda maskelenerek gösterilir
- KVKK ve GDPR uyumluluğu kapsamında korunur
- Güvenli bir şekilde iletilir ancak loglama sistemlerinde tam değerleri gösterilmez
:::

---

## Signature Validasyonu

Webhook'larınızın güvenliğini sağlamak için, gelen isteklerin gerçekten InsurUp tarafından gönderildiğini doğrulamak amacıyla imza doğrulaması yapmanız önemlidir.

İmza, `x-webhook-signature` header'ında gönderilir ve payload'ın `secret` ile SHA-256 algoritması kullanılarak şifrelenmesiyle oluşturulur.

### Python

```python
import hmac
import hashlib

def validate_signature(secret, payload, signature):
    computed_signature = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed_signature, signature)
```

### JavaScript

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
    using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));

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
}
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

        byte[] hash = sha256_HMAC.doFinal(payload.getBytes());
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString().equals(signature.toLowerCase());
    }
}
```

---

## Hata Yönetimi ve Yeniden Deneme

Webhook endpoint'iniz başarılı bir yanıt (HTTP 2xx) döndürmezse, InsurUp sistemi otomatik olarak yeniden deneme yapar:

- **Maksimum deneme sayısı**: 3
- **Deneme aralığı**: Üstel geri çekilme (exponential backoff)
- **Timeout**: Her istek için 30 saniye

:::tip En İyi Uygulamalar
1. Webhook endpoint'iniz her zaman hızlı yanıt vermelidir (< 5 saniye)
2. Uzun süren işlemleri asenkron olarak kuyruğa alın
3. İdempotent işlem yapın - aynı webhook birden fazla kez gelebilir
4. `x-webhook-delivery` header'ını kullanarak tekrarlayan istekleri tespit edin
:::
