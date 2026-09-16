---
title: "Dış Poliçe (External Policy) Entegrasyonu"
sidebar_position: 12
slug: /entegrasyon/dis-police-entegrasyonu
---
# Dış Poliçe (External Policy) Entegrasyonu

Bu döküman, InsurUp platformuna **acenteniz dışında düzenlenmiş poliçelerin** kaydedilmesi için kullanılan Dış Poliçe API'sinin nasıl çağrılacağını açıklar. Hedef kitle, entegrasyon gerçekleştirecek partner yazılım ekipleridir.

**API Referansı:** Tüm endpoint'lerin detaylı teknik dokümantasyonu için [api.insurup.com/scalar](https://api.insurup.com/scalar) adresini ziyaret edin.

## 1. Dış Poliçe Nedir?

InsurUp'ta bir poliçe iki kaynaktan gelir:

| Sahiplik | Anlamı |
| --- | --- |
| `OWN` | Acentenin ürettiği poliçe — teklif veya manuel kayıt yoluyla açılır, acente üretimine dahildir. |
| `EXTERNAL` | Acente dışında düzenlenmiş poliçe — Sigorta Hizmetleri mutabakat dosyaları üzerinden acenteye aktarılır. Bu API ile doğrudan da kaydedilebilir. |

:::note Not
Bu API ile kaydedilen bir poliçe, sigorta şirketi mutabakatında *zaten acentede kayıtlı* göründüğünde çakışma yaratmaz — sistem aktarım sırasında eşleşen External kaydı tespit edip kendi içinde birleştirir.
:::

## 2. Genel Bilgiler

| Özellik | Değer |
| --- | --- |
| Endpoint | `POST /policies/external` |
| Yetkilendirme | OAuth 2.0 bearer token — `AgentUserPolicy` policy'si + `policy:write` (veya `core-api`) scope'u. İstek başında `Authorization: Bearer <token>`. |
| Kimlik doğrulama sunucusu | InsurUp AuthServer (OpenIddict) |
| İçerik türü | `application/json` |
| Başarı yanıtı | `201 Created` — gövde: `{ "policyId": "<GUID>" }` |
| Poliçe PDF'i | Bu endpoint PDF yüklemez. PDF, ayrı bir dosya yükleme endpoint'i ile eklenir (bkz. Bölüm 6). |

## 3. İstek Gövdesi (Request Body)

| Alan | Tip | Zorunlu | Açıklama |
| --- | --- | --- | --- |
| `policyNumber` | string (max 50) | Evet | Sigorta şirketinin/acentenin atadığı poliçe numarası. |
| `insuranceCompanyId` | int? | Hayır | Sigorta şirketi ID'si. Verilmezse poliçe "şirketsiz" kaydedilir. |
| `productId` | int? | Hayır | Şirket kataloğundaki ürün ID'si. `insuranceCompanyId` verilmişse anlamlıdır. |
| `productBranch` | enum | Evet | Ürün branşı: `Kasko`, `Trafik`, `Dask`, `Konut`, `Tss`, `Imm`, `YesilKart`, `FerdiKaza`, `Saglik`, ... (tam liste API şemasında) |
| `insuredCustomerId` | GUID | Evet | Sigortalı müşteri ID'si (InsurUp'ta önceden oluşturulmuş olmalı). |
| `insurerCustomerId` | GUID | Evet | Sigorta ettiren müşteri ID'si. |
| `coverage` | object? | Hayır | Branşa özgü teminat detayları (branş şemasına göre). |
| `startDate` | DateOnly? | Hayır | Başlangıç tarihi (YYYY-MM-DD). Verilmezse `endDate − 1 yıl` kabul edilir. |
| `endDate` | DateOnly | Evet | Bitiş tarihi (YYYY-MM-DD). |
| `arrangementDate` | DateOnly? | Hayır | Düzenleme tarihi. Verilmezse bugün kullanılır. `startDate`'ten sonra olamaz. |
| `netPremium` / `grossPremium` / `commission` | decimal? | Hayır | Prim bilgileri. `grossPremium ≥ netPremium` olmalı; hepsi ≥ 0. |
| `renewalNumber` | byte | Hayır | Yenileme numarası. Gönderilmezse `0` kabul edilir (ilk poliçe). |
| `daskPolicyNumber` | string? (max 20) | Hayır | İlgili DASK poliçe numarası (Zorunlu Deprem Sigortası). |
| `currency` | enum | Hayır | `TurkishLira` (varsayılan), `UnitedStatesDollar`, `Euro`. |
| `paymentType` | enum | Hayır | `SyncCreditCard`, `SyncOpenAccount`, `Async3DSecure`, `AsyncInsuranceCompanyRedirect`, `AsyncThirdParty3DSecure`. Gönderilmezse `Unknown` kabul edilir. |
| `assetId` / `assetType` | GUID? / enum? | Hayır | Sigortalı varlık (Vehicle / Property / Pet). `assetId` verilirse `assetType` zorunludur. |
| `metadata` | object? | Hayır | Serbest anahtar/değer meta verisi. |
| `agentBranchId` | string? | Hayır | Acente şube ID'si. |

## 4. Örnek İstek

```http
POST /policies/external HTTP/1.1
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "policyNumber": "86451239/001",
  "insuranceCompanyId": 3,
  "productId": 17,
  "productBranch": "Kasko",
  "insuredCustomerId": "0192f3c1-...-a1b2c3d4e5f6",
  "insurerCustomerId": "0192f3c1-...-a1b2c3d4e5f6",
  "startDate": "2026-09-01",
  "endDate": "2027-09-01",
  "arrangementDate": "2026-09-01",
  "netPremium": 12500.00,
  "grossPremium": 14900.00,
  "commission": 1750.00,
  "renewalNumber": 0,
  "currency": "TurkishLira",
  "paymentType": "SyncCreditCard",
  "assetId": "0192f4aa-...-9f8e7d6c5b4a",
  "assetType": "Vehicle"
}
```

### Başarılı Yanıt (201)

```json
{
  "policyId": "0192f5b7-3c2a-7b1e-9d4f-6a5b4c3d2e1f"
}
```

## 5. Hata Durumları ve Doğrulama Kuralları

| Durum | HTTP | Açıklama |
| --- | --- | --- |
| Doğrulama hatası (eksik/geçersiz alan) | 400 | Örn. `grossPremium < netPremium`, `startDate ≥ endDate`, negatif prim, geçersiz enum. |
| Aynı poliçe zaten kayıtlı | 400 | `policyNumber + insuranceCompanyId + renewalNumber` üçlüsü mevcut bir poliçeyle çakışıyorsa istek reddedilir. Şirket belirtilmediyse bu kontrol uygulanmaz. |
| Müşteri rıza (consent) eksik | 400 | Acente ayarlarında ilgili işlemler için rıza zorunlu kılınmışsa, müşterinin aktif rıza kaydı yoksa istek reddedilir. |
| Yetkisiz / token geçersiz | 401/403 | Scope veya policy yetersiz. |

:::note Çakışma kontrolü kapsamı
Çakışma kontrolü yalnızca `insuranceCompanyId` gönderildiğinde yapılır. Aynı numarayla birden fazla "şirketsiz" dış poliçe kaydedilebilir; bu bilinçli bir tasarımdır.
:::

## 6. Poliçe PDF'i Ekleme (Ayrı Adım)

PDF, poliçe oluşturma isteğinin parçası değildir. Oluşturulan poliçenin `policyId`'si ile ayrı bir yükleme isteği gönderilir:

```http
POST /policies/{policyId}/manual-document
Content-Type: multipart/form-data
```

Form alan adı: `file`. Her poliçeye yalnızca **bir** PDF yüklenebilir (ilk yükleme kalıcıdır; üzerine yazma yoktur).

## 7. Önemli Davranış Kuralları

| Kural | Açıklama |
| --- | --- |
| Poliçe numarası zorunlu | Dış poliçe numarası olmadan kayıt yapılamaz. |
| Şirket + numara + yenileme = kimlik | Mutabakat aktarımı bu üçlüye göre poliçeyi eşleştirir; aynı üçlüye sahip kayıtlar birleştirilir. |
| Tekrar kayıt (idempotency) | Aynı üçlüyle ikinci bir oluşturma isteği **hata alır**; mevcut poliçenin üzerine yazmaz. Güncelleme için özel akışlar kullanılır. |
| Müşteri eşleştirme | `insuredCustomerId` / `insurerCustomerId`, InsurUp müşteri kayıtlarının GUID'leridir; mutabakat dosyalarındaki TCKN eşleştirmesi sistem tarafından otomatik yapılır. |
| Webhook yok | Bu endpoint bir `policy.created` webhook'u tetiklemez; partner tarafında ek işlem gerektirmez. |
