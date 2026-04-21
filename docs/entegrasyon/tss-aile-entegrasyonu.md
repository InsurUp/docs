---
title: "Tamamlayıcı Sağlık'ta Aile Kurgusu ve Entegrasyonu"
sidebar_position: 9
slug: /entegrasyon/tss-aile-entegrasyonu
---

# Tamamlayıcı Sağlık'ta Aile Kurgusu ve Entegrasyonu

Bu rehber, InsurUp Web Satış Platformu üzerinden Tamamlayıcı Sağlık Sigortası (TSS) teklifi alırken **aile üyelerini (eş, çocuk, ebeveyn, kardeş)** aynı teklif ve poliçe altında sigortalı olarak ekleme sürecini açıklar. Aile kurgusu sayesinde ana sigortalı ile birlikte eşi ve çocukları **tek bir TSS teklifinde** teminat altına alınır, **tek bir poliçe** olarak satın alınır.

Temel TSS akışı için [TSS Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-tss-entegrasyon-rehberi), genel entegrasyon akışı için [Self-servis Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-entegrasyon-rehberi) dökümanlarını incelemeniz önerilir.

**API Referansı:** Tüm endpoint'lerin detaylı teknik dokümantasyonu için [api.insurup.com/scalar](https://api.insurup.com/scalar) adresini ziyaret edin.

:::tip Yeni aile modülü
Eski modelde her aile üyesi için ayrı bir teklif oluşturuluyordu. Yeni aile modülünde **tek bir TSS teklifi** ana sigortalı ile birlikte en fazla 4 ek sigortalıyı (toplam 5 kişi) aynı poliçede kapsar. Yeni akış, `POST /api/proposals` isteğinin `additionalInsuredCustomers` alanı üzerinden yönetilir.
:::

## 1. Aile kurgusu nedir?

Standart TSS akışında sigorta ettiren ve sigortalı aynı kişidir. Aile kurgusunda ise **sigorta ettiren** (poliçeyi satın alan kişi) kendisi dışındaki aile üyelerini de aynı poliçede ana sigortalının yanına **ek sigortalı** olarak ekleyebilir. Örneğin bir anne, kendisi, eşi ve çocukları için tek bir TSS poliçesi alabilir.

Bu yapı şu şekilde çalışır:

1. Müşterinin aile üyeleri önceden CRM'de **müşteri ilişkisi (relationship)** olarak kaydedilir.
2. TSS teklifi oluşturulurken, ana sigortalının `insuredCustomerId` değeriyle birlikte ek sigortalıların ID listesi `additionalInsuredCustomers` alanında gönderilir.
3. InsurUp, ana sigortalı ile her ek sigortalı arasındaki yakınlık derecesini CRM kaydından **otomatik olarak** tespit eder ve sigorta şirketine doğru yakınlık koduyla iletir.
4. Tek bir teklif, tek bir prim ve tek bir poliçe oluşturulur.

### 1.1 Desteklenen yakınlık tipleri

CRM tarafında müşteri ilişkisi tanımlanırken yalnızca `SPOUSE` ve `CHILD` manuel olarak oluşturulur. Teklif oluşturulurken ise sistem, ana sigortalı açısından kayıtlı yakınlığı otomatik olarak okur ve ilgili koda dönüştürür.

| Tip | JSON değeri | Açıklama | Manuel eklenebilir mi? |
| --- | --- | --- | --- |
| Eş | `SPOUSE` | Sigorta ettirenin eşi | Evet |
| Çocuk | `CHILD` | Sigorta ettirenin çocuğu | Evet |
| Ebeveyn | `PARENT` | Sigorta ettirenin ebeveyni | Hayır — çocuk eklendiğinde otomatik oluşturulur |
| Kardeş | `SIBLING` | Sigorta ettirenin kardeşi | Hayır — çocuk eklendiğinde otomatik oluşturulur |

:::info Otomatik ilişkiler
**Ebeveyn** ve **Kardeş** ilişkileri doğrudan oluşturulamaz. Çocuk ilişkisi eklendiğinde sistem otomatik olarak ters yöndeki ebeveyn ilişkisini ve varsa kardeş ilişkilerini oluşturur. Detaylar için [İlişki kuralları](#24-i̇lişki-kuralları-ve-kısıtlar) bölümüne bakın.
:::

### 1.2 Tipik kullanım senaryosu

Tek bir TSS teklifiyle tüm aileyi kapsayan akış:

```
Müşteri (Sigorta Ettiren + Ana Sigortalı)
├── Kendisi                    → insuredCustomerId = kendisi
├── Eşi                        → additionalInsuredCustomers[0] = eşId
├── 1. Çocuğu                  → additionalInsuredCustomers[1] = çocuk-1 Id
└── 2. Çocuğu                  → additionalInsuredCustomers[2] = çocuk-2 Id
```

Tek bir `POST /api/proposals` çağrısıyla 4 kişilik ailenin TSS teklifi oluşturulur. Sigorta şirketine iletilen teklifte her ek sigortalı için yakınlık bilgisi (eşi, kızı/oğlu, ebeveyni, kardeşi) otomatik olarak eklenir.

### 1.3 Aile kurgusu kuralları

Yeni aile modülü, uçtan uca tutarlılığı korumak için aşağıdaki iş kurallarını uygular:

| Kural | Açıklama |
| --- | --- |
| Toplam 5 kişi sınırı | Ana sigortalı dahil en fazla **5 kişi** tek bir teklifte yer alabilir (1 ana + en fazla 4 ek). |
| En az bir yetişkin zorunlu | Ek sigortalı varsa sigortalılar arasında (ana sigortalı ya da ek sigortalılardan en az biri) en az bir **yetişkin** (20 yaş ve üzeri) bulunmalıdır. |
| Sigorta ettiren yetişkin olmalı | `insurerCustomerId` ile belirtilen kişi **çocuk olamaz** (20 yaş altı kabul edilmez). |
| Çocuk yaş sınırı | `CHILD` yakınlığıyla eklenen ek sigortalı **20 yaşından küçük** olmalıdır. Diğer yakınlık tiplerinde (eş, ebeveyn, kardeş) yaş sınırı uygulanmaz. |
| Her sigortalı için boy/kilo zorunlu | Ana sigortalı ve tüm ek sigortalılar için CRM'de `height` ve `weight` bilgisinin dolu olması gerekir. |
| Ek sigortalı, ana sigortalının yakını olmalı | `additionalInsuredCustomers` listesinde belirtilen her ID, `insuredCustomerId` için CRM'de kayıtlı bir aile ilişkisine sahip olmalıdır. |
| Tekrar yasaktır | Aynı müşteri `additionalInsuredCustomers` içinde iki kez veya ana sigortalı ile aynı ID ile gönderilemez. |

Kural ihlalleri `POST /api/proposals` yanıtında ilgili hata koduyla birlikte döner; detay için [Hata kodları](#46-hata-kodları) bölümüne bakın.

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

| Hata kodu | Açıklama |
| --- | --- |
| `CUSTOMER_RELATIONSHIP_SELF` | Müşteri kendisiyle ilişki kuramaz |
| `CUSTOMER_RELATIONSHIP_DUPLICATE` | Bu ilişki zaten mevcut |
| `CUSTOMER_RELATIONSHIP_SPOUSE_EXISTS` | Müşterinin zaten bir eşi var |
| `CUSTOMER_RELATIONSHIP_CHILD_OTHER_FAMILY` | Çocuk başka bir aileye kayıtlı |
| `CUSTOMER_RELATIONSHIP_PARENT_MANUAL` | Ebeveyn ilişkisi manuel oluşturulamaz |

## 3. Aile üyesi için sağlık bilgisi güncelleme

TSS teklifi alabilmek için **her sigortalının** (ana sigortalı dahil her bir ek sigortalının) `height` ve `weight` bilgisi CRM'de dolu olmalıdır. Sağlık bilgileri her müşteri için ayrı ayrı, standart sağlık bilgisi endpoint'i üzerinden güncellenir.

```http
PUT /api/customers/{customerId}/health-info
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

:::warning Eksik sağlık bilgisi
Ek sigortalılardan herhangi birinin boy veya kilo bilgisi eksikse teklif `PROPOSAL_HEIGHT_REQUIRED` veya `PROPOSAL_WEIGHT_REQUIRED` hatasıyla reddedilir. Tüm aile üyeleri için sağlık bilgilerini tamamladıktan sonra teklif çağrısını yapın.
:::

Sağlık bilgisini okumak için:

```http
GET /api/customers/{customerId}/health-info
Authorization: Bearer <accessToken>
```

## 4. Aile poliçesi TSS teklifi oluşturma

Aile teklifi, standart TSS teklif akışından yalnızca yeni eklenen `additionalInsuredCustomers` alanı ile ayrılır. Ana sigortalı her zaman `insuredCustomerId` ile belirtilir; aynı poliçede teminat altına alınacak ek aile üyeleri (eş, çocuk, ebeveyn, kardeş) ise `additionalInsuredCustomers` listesinde ID'leri ile gönderilir.

### 4.1 Teklif isteği

```http
POST /api/proposals
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "$type": "tss",
  "insurerCustomerId": "{insurerCustomerId}",
  "insuredCustomerId": "{mainInsuredCustomerId}",
  "additionalInsuredCustomers": [
    "{spouseCustomerId}",
    "{childCustomerId}"
  ],
  "coverageGroupIds": ["{coverageGroupId}"],
  "channel": "WEBSITE"
}
```

**İstek parametreleri:**

| Alan | Tip | Zorunlu | Açıklama |
| --- | --- | --- | --- |
| `$type` | String | Evet | Branş türü: `tss` |
| `insurerCustomerId` | Guid | Evet | Sigorta ettiren (poliçeyi satın alan) müşteri ID'si. Yetişkin olmalı. |
| `insuredCustomerId` | Guid | Evet | Ana sigortalı müşteri ID'si. Genellikle `insurerCustomerId` ile aynıdır. |
| `additionalInsuredCustomers` | Guid[] | Hayır | Ana sigortalıyla aynı TSS poliçesinde sigortalanacak ek aile üyelerinin ID listesi. Boş/eksik gönderilirse klasik tekil TSS teklifi oluşturulur. |
| `coverageGroupIds` | String[] | Evet | CRM'de tanımlı teminat paketi ID'leri |
| `channel` | String | Evet | Satış kanalı: `WEBSITE` |

:::info Yakınlık tespiti otomatiktir
`additionalInsuredCustomers` listesinde gönderilen **her ID**, `insuredCustomerId` açısından CRM'de kayıtlı bir aile ilişkisine sahip olmalıdır. Yakınlık tipi (eş / çocuk / ebeveyn / kardeş) istekte yer almaz; sunucu tarafında CRM kaydından okunup sigorta şirketine iletilir. İlişki tanımlı değilse teklif `PROPOSAL_ADDITIONAL_INSURED_NOT_RELATIVE` hatasıyla reddedilir.
:::

### 4.2 Aile doğrulama kuralları

Teklif oluşturulduğunda sunucu aşağıdaki kuralları sırasıyla uygular. İhlal durumunda teklif oluşturulmaz ve `400 Bad Request` yanıtı ilgili hata kodu ile döner.

1. **Sigorta ettiren yetişkin olmalı.** `insurerCustomerId` için CRM'deki doğum tarihi 20 yaş altıysa istek reddedilir.
2. **Ana sigortalının sağlık bilgileri tam olmalı.** `insuredCustomerId` için `height` ve `weight` dolu olmalıdır.
3. **Aile boyu üst sınırı.** `1 + additionalInsuredCustomers.Length` değeri **5**'i aşmamalıdır.
4. **Tekrar yasak.** `additionalInsuredCustomers` içinde aynı ID birden fazla kez yer alamaz ve `insuredCustomerId` ile aynı olamaz.
5. **Her ek sigortalı, ana sigortalının yakını olmalı.** CRM'de ilişki kaydı bulunmalıdır; ilişki tipi sunucu tarafından otomatik çözülür.
6. **`CHILD` yakınlığındaki ek sigortalılar 20 yaşından küçük olmalı.** Eş, ebeveyn, kardeş yakınlığında yaş sınırı yoktur.
7. **Her ek sigortalının sağlık bilgileri tam olmalı.** `height` ve `weight` dolu olmalıdır.
8. **En az bir yetişkin zorunlu.** Ek sigortalı varsa, ana sigortalı ya da ek sigortalılardan en az biri 20 yaş ve üzeri olmalıdır. (Sigorta ettiren yetişkin olsa bile, eğer sigortalılar arasında yer almıyorsa bu kural için geçerli sayılmaz — çünkü sigorta ettiren mutlaka bir aile ferdi olmak zorunda değildir.)

### 4.3 Sigorta şirketine iletilen veri

Kabul edilen teklifte sunucu, her sigortalı için yakınlık bilgisini otomatik olarak aşağıdaki değerlere çevirir:

| Yakınlık | `PersonRelationType` | `yakinlikBilgisi` | `yakinlikKodu` |
| --- | --- | --- | --- |
| Ana sigortalı (kendisi) | `1` | `Kendisi` | `1437` |
| Eş | `2` | `Eşi` | `1438` |
| Çocuk (kız) | `3` | `Kızı` | `1439` |
| Çocuk (oğul) | `3` | `Oğlu` | `1439` |
| Ebeveyn | `4` | `Ebeveyni` | `1440` |
| Kardeş | `5` | `Kardeşi` | `1441` |

Bu dönüşüm InsurUp tarafında yapılır; entegrasyon tarafında yalnızca `additionalInsuredCustomers` listesinin gönderilmesi yeterlidir.

### 4.4 Teklif yanıtı ve ürün listeleme

Teklif oluşturulduktan sonra tüm sorgu akışı standart TSS akışıyla aynıdır; aile için tek bir `proposalId` ve her sigorta şirketinden tek bir prim teklifi döner:

| İşlem | Endpoint |
| --- | --- |
| Teklif detayı | `GET /api/proposals/{proposalId}` |
| Ürün listesi | `GET /api/proposals/{proposalId}/products` |
| Taksit detayı | `GET /api/proposals/{proposalId}/products/{proposalProductId}/premiums/{installmentNumber}` |
| Teminat detayı | `GET /api/proposals/{proposalId}/products/{proposalProductId}/coverage` |

Ürün teklifleri ailenin tamamı için birim bazında değil, **aile primine dönüştürülmüş hâlde** gelir. Sigorta şirketi, her aile üyesini ayrı risk olarak değerlendirse de prim tek satır olarak konsolide edilir.

### 4.5 Satın alma

Ödeme akışı standart TSS akışıyla aynıdır. Aile için oluşturulan teklifteki ürün, aynı `purchase/async` endpoint'i ile satın alınır:

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

Başarılı ödemenin ardından **tek bir TSS poliçesi** oluşturulur. Poliçe üzerinde ana sigortalı ve tüm ek sigortalılar ayrı satırlar olarak görünür; poliçe numarası, prim ve belge tektir.

### 4.6 Hata kodları

Aile kurgusuna özgü doğrulama hataları:

| Hata kodu | Açıklama | Çözüm |
| --- | --- | --- |
| `PROPOSAL_INSURER_MUST_BE_ADULT` | Sigorta ettiren (`insurerCustomerId`) 20 yaş altı. | Yetişkin bir sigorta ettiren seçin. |
| `PROPOSAL_MAX_FAMILY_MEMBERS_EXCEEDED` | Ana sigortalı dahil toplam kişi sayısı 5'i aştı. | Listeden en az bir ek sigortalı çıkarın. |
| `PROPOSAL_ADDITIONAL_INSURED_DUPLICATE` | Aynı müşteri ID'si `additionalInsuredCustomers` içinde tekrarlandı veya `insuredCustomerId` ile aynı gönderildi. | Listede her ID'nin tekil olduğundan ve ana sigortalıyla çakışmadığından emin olun. |
| `PROPOSAL_ADDITIONAL_INSURED_NOT_RELATIVE` | Ek sigortalılardan biri ana sigortalının kayıtlı bir aile yakını değil. | Önce ilgili müşteriyi [aile üyesi olarak ekleyin](#22-aile-üyesi-ekleme), ardından tekrar deneyin. |
| `PROPOSAL_ADDITIONAL_INSURED_CHILD_TOO_OLD` | `CHILD` yakınlığıyla eklenen ek sigortalı 20 yaş veya üzeri. | 20 yaş altı olan çocukları listede bırakın; 20 yaş ve üzeri çocuklar aile poliçesine ek sigortalı olarak eklenemez. |
| `PROPOSAL_FAMILY_REQUIRES_ADULT` | Sigortalılar arasında (ana + ek) yetişkin bulunmuyor. | Listeye en az bir ebeveyn/eş ekleyin ya da ana sigortalıyı yetişkin bir kişiyle değiştirin. |
| `PROPOSAL_HEIGHT_REQUIRED` / `PROPOSAL_WEIGHT_REQUIRED` | Sigortalılardan birinin sağlık bilgisi eksik. | [Sağlık bilgilerini](#3-aile-üyesi-için-sağlık-bilgisi-güncelleme) tamamlayın. |

## 5. Uçtan uca entegrasyon akışı

Aşağıdaki akış, bir ailenin tamamı için tek bir TSS poliçesi satın alma sürecini özetler.

### 5.1 Hazırlık aşaması (bir kez yapılır)

1. **Ana müşteri girişi:** `POST /api/auth/customer/login-or-register` ile ana müşteri giriş yapar ve `accessToken` alır.
2. **Müşteri bilgisi:** `GET /api/customers/me` ile ana müşteri ID'si (`insurerCustomerId` ve `insuredCustomerId`) alınır.
3. **Aile üyelerini kaydetme:** Her aile üyesi için:
   - Aile üyesi kayıtlı değilse `POST /api/auth/customer/login-or-register` ile kayıt oluşturulur.
   - `POST /api/customers/{customerId}/relationships` ile ilişki (`SPOUSE` veya `CHILD`) tanımlanır.
4. **Sağlık bilgilerini güncelleme:** Ana sigortalı ve her ek sigortalı için `PUT /api/customers/{id}/health-info` ile boy/kilo bilgisi girilir.

### 5.2 Tek seferlik aile teklifi ve satın alma

5. **Teklif oluşturma:** `POST /api/proposals` çağrısı **bir kez** yapılır. `additionalInsuredCustomers` alanında eş ve çocukların ID'leri listelenir.
6. **Ürünleri listeleme:** `GET /api/proposals/{proposalId}/products` ile sigorta şirketi teklifleri alınır.
7. **Ürün seçimi:** Müşteri uygun ürünü ve taksit seçeneğini seçer.
8. **Ödeme:** `POST /api/proposals/{proposalId}/products/{proposalProductId}/purchase/async` ile ödeme başlatılır.
9. **Ödeme doğrulama:** Callback sonrası `GET /api/proposals/{proposalId}/products/{proposalProductId}` ile durum doğrulanır.
10. **Poliçe:** Başarılı ödeme sonrası `GET /api/policies/{policyId}` ve `GET /api/policies/{policyId}/document` ile aile poliçesi ve belgesi alınır.

### 5.3 Örnek aile akışı

```
1. Anne (Sigorta Ettiren + Ana Sigortalı) giriş yapar

2. Aile üyelerini CRM'e ekler:
   ├── Eşi     → POST /customers/{anneId}/relationships  { relationType: "SPOUSE" }
   ├── Çocuk 1 → POST /customers/{anneId}/relationships  { relationType: "CHILD" }
   └── Çocuk 2 → POST /customers/{anneId}/relationships  { relationType: "CHILD" }

3. Sağlık bilgilerini günceller (anne + eş + 2 çocuk)
   └── PUT /customers/{id}/health-info (her bir müşteri için ayrı çağrı)

4. Tek bir aile teklifi oluşturur:
   POST /proposals
   {
     "$type": "tss",
     "insurerCustomerId": anneId,
     "insuredCustomerId":  anneId,
     "additionalInsuredCustomers": [eşId, çocuk1Id, çocuk2Id],
     "coverageGroupIds": [coverageGroupId],
     "channel": "WEBSITE"
   }

5. Tek ürün, tek ödeme, tek poliçe:
   GET  /proposals/{proposalId}/products
   POST /proposals/{proposalId}/products/{productId}/purchase/async
   GET  /policies/{policyId}
```

## 6. Sık sorulan sorular

### 6.1 Aile üyesi eklemeden teklif alınabilir mi?

Evet. `additionalInsuredCustomers` alanı boş bırakıldığında veya gönderilmediğinde, standart bireysel TSS teklifi oluşturulur. Bu durumda sigortalı yalnızca ana sigortalıdır ve sigorta şirketine yalnızca `Kendisi` yakınlık bilgisi iletilir.

### 6.2 Bir ailenin birden fazla teklifi ayrı ayrı alınabilir mi?

Evet, geriye dönük uyumluluk için her aile üyesi için ayrı `POST /api/proposals` çağrısı yaparak bireysel TSS teklifleri oluşturmak hâlâ mümkündür. Ancak tek poliçeyle tüm aileyi kapsamak isteyen entegrasyonlarda tek aile teklifi akışı önerilir; böylece prim, belge ve poliçe yönetimi sadeleşir.

### 6.3 Aile üyesinin InsurUp'ta müşteri kaydı olması zorunlu mu?

Evet. `additionalInsuredCustomers` içindeki her ID'nin InsurUp'ta kayıtlı bir müşteri olması ve ana sigortalı için CRM'de bir aile ilişkisinin tanımlı olması gerekir. Kayıt için `auth/customer/login-or-register` endpoint'ini kullanın.

### 6.4 Çocuğun yaş sınırı var mı?

Evet. `CHILD` yakınlığıyla ek sigortalı olarak eklenen kişi **20 yaşından küçük** olmalıdır. 20 yaş ve üzeri çocuklar için müşteri bağımsız bir sigortalı olarak ayrı bir TSS teklifiyle poliçelenmelidir. Diğer yakınlık tiplerinde (eş, ebeveyn, kardeş) yaş sınırı uygulanmaz.

### 6.5 En fazla kaç kişi tek poliçede yer alabilir?

Ana sigortalı dahil toplam **5 kişi** (1 ana + 4 ek sigortalı). Daha büyük aileler için birden fazla teklif oluşturulabilir.

### 6.6 Sigorta ettiren ile ana sigortalı aynı olmak zorunda mı?

Hayır. `insurerCustomerId` ve `insuredCustomerId` farklı müşteriler olabilir; örneğin bir baba (`insurerCustomerId`) çocukları için (`insuredCustomerId` = çocuk) ödeme yapabilir. Ancak aile doğrulamasında ek sigortalılar **ana sigortalının** yakınları olarak kontrol edilir; sigorta ettirenin yakınları olması gerekmez.

### 6.7 Sigortalılardan biri kabul edilmezse ne olur?

Sigorta şirketi, teklif yanıtında ya da poliçeleştirme anında bir sigortalıyı reddedebilir (yaş, meslek, sağlık beyanı vb. nedenlerle). Bu durumda reddedilen kişi listeden çıkarılarak teklif yeniden oluşturulmalıdır; tek kişinin reddedilmesi, aile teklifinin tamamının iptali anlamına gelmeyebilir ancak prim ve teminat koşulları yeniden hesaplanır.

### 6.8 Bir aile üyesi silinirse mevcut poliçeler etkilenir mi?

Hayır. İlişki silme işlemi yalnızca CRM'deki müşteri ilişki kaydını kaldırır. Daha önce oluşturulmuş teklifler ve poliçeler, ilişki silinse dahi etkilenmez; poliçe içeriği teklif anındaki snapshot'a göre saklanır.

---

Bu rehber, InsurUp Web Satış Platformu'nda TSS ürünü için yeni aile modülünün uçtan uca entegrasyonunu açıklar. Temel TSS akışı için [TSS Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-tss-entegrasyon-rehberi) dökümanına, API endpoint detayları için [api.insurup.com/scalar](https://api.insurup.com/scalar) adresine bakabilirsiniz. Entegrasyon sırasında oluşacak sorular için InsurUp teknik ekibiyle iletişime geçebilirsiniz.
