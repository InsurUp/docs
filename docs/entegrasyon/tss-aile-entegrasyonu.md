---
title: "Tamamlayıcı Sağlık'ta Aile Kurgusu ve Entegrasyonu"
sidebar_position: 9
slug: /entegrasyon/tss-aile-entegrasyonu
---

# Tamamlayıcı Sağlık'ta Aile Kurgusu ve Entegrasyonu

Bu rehber, InsurUp Web Satış Platformu üzerinden Tamamlayıcı Sağlık Sigortası (TSS) teklifi alırken **aile üyelerini (eş, çocuk)** sigortalı olarak ekleme sürecini açıklar. Aile kurgusu sayesinde sigorta ettiren müşteri, kendisi dışındaki aile üyeleri için de TSS teklifi alabilir ve poliçe satın alabilir.

Temel TSS akışı için [TSS Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-tss-entegrasyon-rehberi), genel entegrasyon akışı için [Self-servis Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-entegrasyon-rehberi) dökümanlarını incelemeniz önerilir.

**API Referansı:** Tüm endpoint'lerin detaylı teknik dokümantasyonu için [api.insurup.com/scalar](https://api.insurup.com/scalar) adresini ziyaret edin.

## 1. Aile kurgusu nedir?

Standart TSS akışında sigorta ettiren ve sigortalı aynı kişidir. Aile kurgusunda ise **sigorta ettiren** (poliçeyi satın alan kişi) ile **sigortalı** (poliçeden faydalanacak kişi) farklı olabilir. Örneğin bir anne, eşi ve çocukları için ayrı ayrı TSS teklifleri alabilir.

Bu yapı şu şekilde çalışır:

1. Müşterinin aile üyeleri sisteme **müşteri ilişkisi (relationship)** olarak kaydedilir.
2. Teklif oluştururken `insuredCustomerId` alanına aile üyesinin ID'si gönderilir.
3. InsurUp, sigorta ettiren ile sigortalı arasındaki yakınlık derecesini otomatik olarak tespit eder ve sigorta şirketine iletir.

### 1.1 Desteklenen yakınlık tipleri

| Tip | JSON Değeri | Açıklama |
| --- | --- | --- |
| Eş | `SPOUSE` | Sigorta ettirenin eşi |
| Çocuk | `CHILD` | Sigorta ettirenin çocuğu |
| Ebeveyn | `PARENT` | Sigorta ettirenin ebeveyni (otomatik oluşturulur) |
| Kardeş | `SIBLING` | Sigorta ettirenin kardeşi (otomatik oluşturulur) |

:::info Otomatik ilişkiler
**Ebeveyn** ve **Kardeş** ilişkileri doğrudan oluşturulamaz. Çocuk ilişkisi eklendiğinde sistem otomatik olarak ters yöndeki ebeveyn ilişkisini ve varsa kardeş ilişkilerini oluşturur. Detaylar için [İlişki kuralları](#24-i̇lişki-kuralları-ve-kısıtlar) bölümüne bakın.
:::

### 1.2 Tipik kullanım senaryosu

Bir ailenin TSS teklifi alma akışı:

```
Müşteri (Sigorta Ettiren)
├── Kendisi için TSS teklifi          → insuredCustomerId = kendisi
├── Eşi için TSS teklifi              → insuredCustomerId = eşi
├── 1. Çocuğu için TSS teklifi        → insuredCustomerId = çocuk-1
└── 2. Çocuğu için TSS teklifi        → insuredCustomerId = çocuk-2
```

Her aile üyesi için ayrı bir teklif oluşturulur. Sigorta şirketine gönderilen teklifte yakınlık bilgisi (eş, çocuk vb.) otomatik olarak eklenir.

## 2. Aile üyesi yönetimi API'leri

Aile üyeleri, müşteri ilişkileri (customer relationships) API'leri üzerinden yönetilir. Bu API'ler, aile üyelerinin sisteme eklenmesini, listelenmesini ve silinmesini sağlar.

:::info Ön koşul
Aile üyesi olarak eklenecek kişinin önce InsurUp'ta müşteri olarak kayıtlı olması gerekir. Kayıtlı değilse önce `auth/customer/login-or-register` endpoint'i ile kayıt oluşturulmalıdır.
:::

### 2.1 Aile üyelerini listeleme

Müşterinin mevcut aile üyelerini görüntülemek için:

```http
GET /api/customers/{customerId}/relationships
Authorization: Bearer <accessToken>
```

**Yanıt:**

```json
[
  {
    "id": "{relationshipId}",
    "customerId": "{customerId}",
    "relatedCustomerId": "{relatedCustomerId}",
    "relatedCustomerType": "Individual",
    "relationType": "SPOUSE",
    "relatedCustomerName": "Ad Soyad",
    "relatedCustomerEmail": "email@example.com",
    "relatedCustomerPhoneNumber": "+905xxxxxxxxx",
    "createdAt": "2026-03-15T10:30:00Z"
  }
]
```

| Alan | Tip | Açıklama |
| --- | --- | --- |
| `id` | Guid | İlişki kaydının tekil ID'si |
| `customerId` | Guid | Ana müşteri (sigorta ettiren) ID'si |
| `relatedCustomerId` | Guid | İlişkili müşteri (aile üyesi) ID'si |
| `relatedCustomerType` | String | Müşteri tipi (`Individual`) |
| `relationType` | String | Yakınlık tipi (`SPOUSE`, `CHILD`, `PARENT`, `SIBLING`) |
| `relatedCustomerName` | String | Aile üyesinin ad soyadı |
| `relatedCustomerEmail` | String? | Aile üyesinin e-posta adresi (opsiyonel) |
| `relatedCustomerPhoneNumber` | String? | Aile üyesinin telefon numarası (opsiyonel) |
| `createdAt` | DateTime | İlişki oluşturulma tarihi |

### 2.2 Aile üyesi ekleme

Yeni bir aile üyesi eklemek için:

```http
POST /api/customers/{customerId}/relationships
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "relatedCustomerId": "{relatedCustomerId}",
  "relationType": "SPOUSE"
}
```

**İstek parametreleri:**

| Alan | Tip | Zorunlu | Açıklama |
| --- | --- | --- | --- |
| `relatedCustomerId` | Guid | Evet | Aile üyesi olarak eklenecek müşterinin ID'si |
| `relationType` | String | Evet | Yakınlık tipi: `SPOUSE` veya `CHILD` |

**Yanıt:**

```json
{
  "id": "{relationshipId}"
}
```

#### Eş ekleme örneği

```http
POST /api/customers/{customerId}/relationships
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "relatedCustomerId": "{spouseCustomerId}",
  "relationType": "SPOUSE"
}
```

Eş ilişkisi çift yönlüdür. Sistem otomatik olarak hem `müşteri → eş` hem `eş → müşteri` ilişkilerini oluşturur.

#### Çocuk ekleme örneği

```http
POST /api/customers/{customerId}/relationships
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "relatedCustomerId": "{childCustomerId}",
  "relationType": "CHILD"
}
```

Çocuk eklendiğinde sistem otomatik olarak:
- `müşteri → çocuk` (Child) ilişkisini oluşturur
- `çocuk → müşteri` (Parent) ilişkisini oluşturur
- Müşterinin eşi varsa `eş → çocuk` (Child) ve `çocuk → eş` (Parent) ilişkilerini de oluşturur
- Müşterinin başka çocukları varsa çocuklar arasında `Sibling` ilişkisini oluşturur

### 2.3 Aile üyesi silme

Bir aile üyesi ilişkisini kaldırmak için:

```http
DELETE /api/customers/{customerId}/relationships/{relationshipId}
Authorization: Bearer <accessToken>
```

`relationshipId` değeri, listeleme yanıtındaki `id` alanından alınır.

### 2.4 İlişki kuralları ve kısıtlar

| Kural | Açıklama |
| --- | --- |
| Her müşterinin en fazla 1 eşi olabilir | İkinci bir eş eklenmeye çalışıldığında hata döner |
| Eşin de eşi olmamalıdır | İlişkilendirilecek kişinin zaten bir eşi varsa hata döner |
| Çocuk en fazla 2 ebeveyne sahip olabilir | Farklı bir ailede ebeveyn ilişkisi bulunan çocuk eklenemez |
| Ebeveyn ilişkisi manuel oluşturulamaz | `PARENT` tipi yalnızca çocuk ekleme sırasında otomatik oluşturulur |
| Kardeş ilişkisi manuel oluşturulamaz | `SIBLING` tipi yalnızca çocuk ekleme sırasında otomatik oluşturulur |
| Kendisiyle ilişki kurulamaz | `customerId` ve `relatedCustomerId` aynı olamaz |
| Tekrar eden ilişki kurulamaz | Aynı iki müşteri arasında birden fazla ilişki oluşturulamaz |

**Hata kodları:**

| Hata Kodu | Açıklama |
| --- | --- |
| `CUSTOMER_RELATIONSHIP_SELF` | Müşteri kendisiyle ilişki kuramaz |
| `CUSTOMER_RELATIONSHIP_DUPLICATE` | Bu ilişki zaten mevcut |
| `CUSTOMER_RELATIONSHIP_SPOUSE_EXISTS` | Müşterinin zaten bir eşi var |
| `CUSTOMER_RELATIONSHIP_CHILD_OTHER_FAMILY` | Çocuk başka bir aileye kayıtlı |
| `CUSTOMER_RELATIONSHIP_PARENT_MANUAL` | Ebeveyn ilişkisi manuel oluşturulamaz |

## 3. Aile üyesi için sağlık bilgisi güncelleme

TSS teklifi alabilmek için her aile üyesinin **boy** ve **kilo** bilgisi zorunludur. Aile üyesinin sağlık bilgilerini güncellemek için:

```http
PUT /api/customers/{relatedCustomerId}/health-info
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "height": 170,
  "weight": 65,
  "surgeries": [],
  "diseases": []
}
```

| Alan | Tip | Zorunlu | Açıklama |
| --- | --- | --- | --- |
| `height` | Integer | Evet | Boy (cm) |
| `weight` | Integer | Evet | Kilo (kg) |
| `surgeries` | Array | Evet | Ameliyat kodları (boş array gönderilebilir) |
| `diseases` | Array | Evet | Kronik hastalık kodları (boş array gönderilebilir) |

:::warning Önemli
Her aile üyesi için ayrı ayrı sağlık bilgisi güncellenmelidir. Boy ve kilo bilgisi olmayan bir aile üyesi için teklif oluşturulmaya çalışıldığında hata alınır.
:::

Sağlık bilgisini okumak için:

```http
GET /api/customers/{relatedCustomerId}/health-info
Authorization: Bearer <accessToken>
```

## 4. Aile üyesi için TSS teklif oluşturma

Aile üyesi için teklif oluşturma, standart TSS teklif akışından yalnızca `insuredCustomerId` alanı ile ayrılır. Sigorta ettiren (`insurerCustomerId`) ana müşteri, sigortalı (`insuredCustomerId`) ise aile üyesidir.

### 4.1 Teklif isteği

```http
POST /api/proposals
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "$type": "tss",
  "insurerCustomerId": "{customerId}",
  "insuredCustomerId": "{relatedCustomerId}",
  "coverageGroupIds": ["{coverageGroupId}"],
  "channel": "WEBSITE"
}
```

| Alan | Tip | Zorunlu | Açıklama |
| --- | --- | --- | --- |
| `$type` | String | Evet | Branş türü: `tss` |
| `insurerCustomerId` | Guid | Evet | Sigorta ettiren (poliçeyi satın alan) müşteri ID'si |
| `insuredCustomerId` | Guid | Evet | Sigortalı (aile üyesi) müşteri ID'si |
| `coverageGroupIds` | String[] | Evet | Teminat grubu ID'leri |
| `channel` | String | Evet | Satış kanalı: `WEBSITE` |

:::info Yakınlık tespiti
`insurerCustomerId` ve `insuredCustomerId` farklı olduğunda, InsurUp otomatik olarak iki müşteri arasındaki ilişkiyi (eş, çocuk vb.) tespit eder ve sigorta şirketine doğru yakınlık koduyla iletir. Bunun için aile üyesinin önceden ilişki olarak eklenmiş olması gerekir.
:::

### 4.2 Teklif yanıtı ve ürün listeleme

Teklif oluşturulduktan sonra standart TSS akışıyla aynıdır:

```http
GET /api/proposals/{proposalId}/products
Authorization: Bearer <accessToken>
```

Dönen ürün listesinde her sigorta şirketinin prim teklifleri yer alır. Ürün detayları, teminatlar ve taksit seçenekleri standart endpoint'lerle sorgulanır:

| İşlem | Endpoint |
| --- | --- |
| Teklif detayı | `GET /api/proposals/{proposalId}` |
| Ürün listesi | `GET /api/proposals/{proposalId}/products` |
| Taksit detayı | `GET /api/proposals/{proposalId}/products/{proposalProductId}/premiums/{installmentNumber}` |
| Teminat detayı | `GET /api/proposals/{proposalId}/products/{proposalProductId}/coverage` |

### 4.3 Satın alma

Ödeme akışı standart TSS akışıyla aynıdır. Aile üyesi için oluşturulan teklifteki ürün, aynı `purchase/async` endpoint'i ile satın alınır:

```http
POST /api/proposals/{proposalId}/products/{proposalProductId}/purchase/async
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "$type": "3d-secure",
  "card": {
    "number": "{cardNumber}",
    "cvc": "{cvc}",
    "expiryMonth": "{MM}",
    "expiryYear": "{YYYY}",
    "holderName": "{cardHolderName}"
  },
  "installmentNumber": 1,
  "callbackUrl": "{callbackUrl}"
}
```

Ödeme başarıyla tamamlandığında poliçe oluşturulur. Poliçe bilgileri ve belgeleri standart endpoint'lerle alınır.

## 5. Uçtan uca entegrasyon akışı

Aşağıdaki akış, bir ailenin tüm üyeleri için TSS teklifi alma ve poliçe satın alma sürecini özetler:

### 5.1 Hazırlık aşaması (bir kez yapılır)

1. **Ana müşteri girişi:** `POST /api/auth/customer/login-or-register` ile müşteri giriş yapar ve `accessToken` alır.
2. **Müşteri bilgisi:** `GET /api/customers/me` ile müşteri ID'si alınır.
3. **Aile üyelerini kaydetme:** Her aile üyesi için:
   - Aile üyesi kayıtlı değilse `POST /api/auth/customer/login-or-register` ile kayıt oluşturulur.
   - `POST /api/customers/{customerId}/relationships` ile ilişki tanımlanır.
4. **Sağlık bilgilerini güncelleme:** Kendisi dahil her aile üyesi için `PUT /api/customers/{id}/health-info` ile boy/kilo bilgisi girilir.

### 5.2 Teklif alma (her aile üyesi için tekrarlanır)

5. **Teklif oluşturma:** `POST /api/proposals` ile teklif oluşturulur. `insurerCustomerId` ana müşteri, `insuredCustomerId` ise ilgili aile üyesidir.
6. **Ürünleri listeleme:** `GET /api/proposals/{proposalId}/products` ile sigorta şirketi teklifleri alınır.
7. **Ürün seçimi:** Müşteri uygun ürünü ve taksit seçeneğini seçer.
8. **Ödeme:** `POST /api/proposals/{proposalId}/products/{proposalProductId}/purchase/async` ile ödeme başlatılır.
9. **Ödeme doğrulama:** Callback sonrası `GET /api/proposals/{proposalId}/products/{proposalProductId}` ile durum doğrulanır.
10. **Poliçe:** Başarılı ödeme sonrası `GET /api/policies/{policyId}` ve `GET /api/policies/{policyId}/document` ile poliçe bilgileri ve belge alınır.

### 5.3 Örnek aile akışı

```
1. Anne (Sigorta Ettiren) giriş yapar
2. Aile üyelerini ekler:
   ├── Eşi     → POST /customers/{anneId}/relationships  { relationType: "SPOUSE" }
   ├── Çocuk 1 → POST /customers/{anneId}/relationships  { relationType: "CHILD" }
   └── Çocuk 2 → POST /customers/{anneId}/relationships  { relationType: "CHILD" }

3. Sağlık bilgilerini günceller (kendisi + 3 aile üyesi)

4. Her üye için ayrı teklif oluşturur:
   ├── Kendisi  → POST /proposals { insuredCustomerId: anneId }
   ├── Eşi      → POST /proposals { insuredCustomerId: eşId }
   ├── Çocuk 1  → POST /proposals { insuredCustomerId: çocuk1Id }
   └── Çocuk 2  → POST /proposals { insuredCustomerId: çocuk2Id }

5. Her teklif için ayrı ödeme ve poliçe oluşturulur
```

## 6. Sık sorulan sorular

### 6.1 Aile üyesi eklemeden teklif alınabilir mi?

Evet. `insuredCustomerId` farklı bir müşteri ID'si olarak gönderildiğinde, iki müşteri arasında ilişki tanımlı değilse de teklif oluşturulabilir. Ancak bu durumda sigorta şirketine yakınlık bilgisi gönderilemez ve teklif "kendisi" olarak işlenir. Doğru yakınlık bilgisi için ilişkinin önceden tanımlanması önerilir.

### 6.2 Her aile üyesi için ayrı teklif mi oluşturulur?

Evet. Her aile üyesi için ayrı bir `POST /api/proposals` çağrısı yapılır. Toplu aile teklifi desteği bulunmamaktadır; her sigortalı için bağımsız teklif ve ödeme süreci işletilir.

### 6.3 Aile üyesinin InsurUp'ta müşteri kaydı olması zorunlu mu?

Evet. Aile üyesi olarak eklenecek kişinin önce `auth/customer/login-or-register` endpoint'i ile sisteme kaydedilmiş olması gerekir. Kayıt için TC kimlik numarası, doğum tarihi ve telefon numarası gereklidir.

### 6.4 Çocuğun yaş sınırı var mı?

TSS ürünlerinde çocuk yaş sınırı sigorta şirketinin kurallarına bağlıdır. InsurUp API'si yaş kısıtlaması uygulamaz; ancak sigorta şirketi yaş sınırını aşan teklifleri reddedebilir.

### 6.5 Bir aile üyesi silinirse mevcut poliçeler etkilenir mi?

Hayır. İlişki silme işlemi yalnızca müşteri ilişki kaydını kaldırır. Mevcut poliçeler ve teklifler etkilenmez.

---

Bu rehber, InsurUp Web Satış Platformu'nda TSS ürünü için aile kurgusu entegrasyonunu uçtan uca açıklar. Temel TSS akışı için [TSS Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-tss-entegrasyon-rehberi) dökümanına, API endpoint detayları için [api.insurup.com/scalar](https://api.insurup.com/scalar) adresine bakabilirsiniz. Entegrasyon sırasında oluşacak sorular için InsurUp teknik ekibiyle iletişime geçebilirsiniz.
