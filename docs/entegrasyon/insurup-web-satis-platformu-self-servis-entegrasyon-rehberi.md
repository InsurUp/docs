---
title: "InsurUp Web Satış Platformu Self‑servis Entegrasyon Rehberi"
sidebar_position: 2
slug: /entegrasyon/insurup-web-satis-platformu-self-servis-entegrasyon-rehberi
---

# InsurUp Web Satış Platformu Self‑servis Entegrasyon Rehberi

Bu doküman, sigorta acenteleri ve brokerlarının kendi web satış platformlarını InsurUp sistemine entegre edebilmeleri için hazırlanmıştır. Aşağıdaki adımlar, müşteri (B2C) akışlarını kullanarak müşterinin giriş yapmasından poliçe satın almasına kadar olan süreci açıklar. Her endpoint adı ve zorunlu parametreleri belirtmek için InsurUp’un API sözleşmesindeki tanımlara ve kod örneklerine başvurulmuştur. Doküman, API’ye doğrudan erişim yerine açıklayıcı örnekler sunar; uygulama geliştirirken gerçek endpoint’lere POST/GET/DELETE istekleri gönderilmelidir.

Önemli: Her entegrasyon için InsurUp’tan bir Agent ID edinmeniz gerekir. Entegrasyonda kullanacağınız Agent ID, gönderilen her API çağrısında acenteyi tanımlamak için gönderilir. Ayrıca, “coverage group” (teminat paketi) ID’lerinin oluşturulması konusunda InsurUp ile çalışmanız gerekir.

## 1. Kimlik doğrulama (Auth) ve oturum yönetimi

### 1.1 Müşteri giriş veya kayıt (LoginOrRegister)

Müşterinin sisteme giriş yapabilmesi veya ilk kez kayıt olabilmesi için `auth/customer/login-or-register` endpoint’i kullanılır.

Gönderilmesi gereken temel alanlar:

| Alan | Tip | Açıklama |
| --- | --- | --- |
| `identityNumber` | string | Müşterinin TC kimlik numarası veya vergi kimlik numarası (yabancı müşteriler için pasaport/VKN). |
| `birthday` | string | Müşteri kayıtlı değilse doğum tarihi (gg.aa.yyyy). |
| `phoneNumber` | string | Cep telefonu numarası. |
| `agentId` | string | InsurUp tarafından verilen Agent ID. |
| `type` | enum | Müşteri tipi. Bireysel, Kurumsal veya Yabancı müşteriler için doğru tipi gönderin. |

Bu çağrı, müşteriyi kimlik doğrulaması için doğrulama kodu (MFA) aşamasına yönlendirir. MFA zorunluysa, `auth/customer/verify-mfa` endpoint’i kullanılarak SMS doğrulaması yapılır (InsurUp’un SMS servisleri Teknomart, Artı Kurumsal veya Verimor üzerinden gönderilir). MFA gerekmiyorsa, kendi SMS sağlayıcınızı kullanmak için MFA göndermeyebilirsiniz; bu durumda kendi doğrulama sürecinizi uygulamak gerekir.

#### 1.1.1 Refresh token

Access token’lar kısa ömürlüdür (yaklaşık 10 dakika). Oturum süresini uzatmak için `auth/customer/refresh` endpoint’ine `refreshToken` gönderilir ve yeni bir access token döndürülür.

### 1.2 Agent kimliği kullanımı

Her çağrıda `agentId` parametresinin doğru gönderilmesi gerekir. Agent ID, InsurUp tarafından sağlanır ve API çağrılarını acenteye bağlar. Bu ID olmadan sistem çağrıyı yetkilendirmez.

## 2. Müşteri bilgileri ve varlık yönetimi

### 2.1 Müşteri bilgilerini görüntüleme

Müşteri oturum açtıktan sonra `customers/me` endpoint’i çağrılarak müşteriye ait bilgiler çekilir. Dönen cevapta TC/VKN, ad soyad, doğum tarihi, cep telefonu, e‑posta adresi, cinsiyet, meslek ve adres bilgileri gibi alanlar yer alır. Sağlık detayları için `customers/{customerId}/health-info` endpoint’i kullanılabilir. TSS ürününde teklif çıkarılırken boy ve kilo zorunlu olduğu için bu alanların doldurulması gerekir.

### 2.2 Müşteri araçları (vehicle) ve konutları (property)

Müşterinin mevcut araç ve konut varlıkları listelenebilir ve yeni varlık eklenebilir.

#### 2.2.1 Araçları listeleme

Müşterinin araçlarını listelemek için `customers/me/vehicles` endpoint’i kullanılır. Bu çağrı, kullanıcıya ait tüm araçların listesini döner.

#### 2.2.2 Yeni araç ekleme

Yeni bir araç eklemek için `POST customers/{customerId}/vehicles` endpoint’i kullanılır. Zorunlu alanlar:

| Alan | Açıklama |
| --- | --- |
| `plate` | Araç plakası (ör. 34ABC123). |
| `documentSerialCode` | Ruhsat seri kodu. |
| `documentSerialNumber` | Ruhsat seri numarası. |
| `brandCode`, `modelCode` | Markayı ve modeli belirten kodlar (gerekiyorsa `vehicle-parameters/brands` ve `vehicle-parameters/models` servislerinden alınabilir). |
| `year` | Araç modeli yılı. |

External lookup: Aracın plakasını ve ruhsat seri bilgilerini gönderdikten sonra tramer’den araç bilgilerini otomatik doldurmak için `customers/{customerId}/vehicles/external-lookup` endpoint’i vardır. Bu servis `customerId`, `plate` ve ruhsat bilgilerini alır; araç markası/modeli ve diğer detayları döner. Dönüş bilgileriyle aracı oluşturmanız tavsiye edilir.

#### 2.2.3 Konut listeleme ve ekleme

Müşterinin konut varlıkları `customers/me/properties` endpoint’i ile listelenir. Yeni bir konut eklemek için `POST customers/{customerId}/properties` endpoint’i kullanılır.

Konut eklerken:

- Adres bilgisi: `properties/query-address-by-property-number` servisinde UAVT (adres kodu) gönderilerek adres bilgileri (il, ilçe, mahalle, sokak, bina, daire) alınabilir. Bu servis GET tipindedir ve yalnızca adresi döner; metrekare veya yapı yılı gibi bilgileri manuel olarak göndermeniz gerekir.
- UAVT kodu üretimi: Konuta ait UAVT kodu olmayan durumlarda, önce şehir → ilçe → mahalle → sokak şeklinde aşamalı listeler alınarak adres seçimi yapılır. Her seçim sonucunda API bir sonrakini listeler ve en sonunda UAVT kodu döner. Bu işlem, InsurUp CRM ekranı ile eşleştirilmiştir; ekran kaydında şehir, ilçe, mahalle, sokak seçilip daire girildiğinde UAVT kodunun oluştuğu gösterilmiştir.

### 2.3 Satış fırsatı talebi (Case) oluşturma

Müşteri kimlik doğrulamasını tamamladıktan ve `accessToken` aldıktan sonra, varlık bilgilerini girmeden önce InsurUp CRM'de otomatik olarak bir satış fırsatı talebi (Case) oluşturulmalıdır. Bu adım, müşterinin varlık bilgilerini doldurmadan veya teklif almadan sayfadan ayrılması durumunda bile potansiyel satış fırsatının CRM'de kayıt altına alınmasını sağlar.

#### 2.3.1 Mevcut case kontrolü

Öncelikle müşterinin ilgili branşta aktif bir satış fırsatı talebinin olup olmadığını kontrol edin. Bu kontrol GraphQL endpoint'i üzerinden yapılır.

##### İstek

```graphql
POST /graphql

Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "query": "query GetCustomerCases($customerId: UUID!, $type: CaseType!) { cases(customerId: $customerId, type: $type, status: [OPEN, IN_PROGRESS]) { id status type createdAt } }",
  "variables": {
    "customerId": "8f89a1b6-4e3c-4e5a-9...",
    "type": "NEW_SALE_OPPORTUNITY"
  }
}
```

**Parametreler:**

- `customerId`: `GET /api/customers/me` çağrısından elde edilen müşteri ID'si
- `type`: Talep tipi; kasko için `NEW_SALE_OPPORTUNITY` kullanılır (diğer branşlar için ilgili CaseType değeri)
- `status`: Kontrol edilecek durum listesi (`OPEN`, `IN_PROGRESS`)

##### Yanıt

Eğer aktif bir case varsa:

```json
{
  "data": {
    "cases": [
      {
        "id": "CASE-SO-abc123",
        "status": "OPEN",
        "type": "NEW_SALE_OPPORTUNITY",
        "createdAt": "2024-12-05T10:30:00Z"
      }
    ]
  }
}
```

Eğer aktif case yoksa:

```json
{
  "data": {
    "cases": []
  }
}
```

#### 2.3.2 Yeni case oluşturma

Aktif case bulunamadıysa, müşteri için yeni bir satış fırsatı talebi oluşturun.

##### İstek

```http
POST /api/cases:new-sale-opportunity
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "customerId": "8f89a1b6-4e3c-4e5a-9...",
  "type": "kasko",
  "channel": "website",
  "source": "web_sales_platform"
}
```

**Parametreler:**

- `customerId`: Müşteri kimliği
- `type`: Branş tipi (`kasko`, `trafik`, `tss` vb.)
- `channel`: Satış kanalı (`website`, `mobile`, `call_center` vb.)
- `source`: Kaynağı belirtir (ör. `web_sales_platform`, `b2c_website`)

##### Yanıt

```json
{
  "id": "CASE-SO-vCWz0",
  "customerId": "8f89a1b6-4e3c-4e5a-9...",
  "type": "NEW_SALE_OPPORTUNITY",
  "productType": "kasko",
  "status": "OPEN",
  "channel": "website",
  "source": "web_sales_platform",
  "createdAt": "2024-12-05T10:35:00Z",
  "updatedAt": "2024-12-05T10:35:00Z"
}
```

#### 2.3.3 Case durumları ve otomatik güncelleme

Oluşturulan case, müşteri akışında ilerledikçe InsurUp CRM tarafından otomatik olarak güncellenir:

- **OPEN**: Müşteri kimlik doğrulamasını tamamladı, henüz teklif almadı
- **IN_PROGRESS**: Müşteri teklif aldı, henüz poliçeleştirmedi
- **CLOSED_WON**: Poliçe başarıyla oluşturuldu
- **CLOSED_LOST**: Müşteri akışı tamamlamadan ayrıldı veya teklif almadı

Case oluşturulduktan sonra, müşteri teklif oluşturduğunda (`POST /api/proposals`) InsurUp CRM otomatik olarak case'i `IN_PROGRESS` durumuna getirir ve teklif bilgilerini case'e bağlar.

#### 2.3.4 Önemli notlar

- Case oluşturma işlemi müşteri oturumunda **yalnızca bir kez** yapılmalıdır. Sonraki sayfa yüklemelerinde veya sayfalar arası geçişlerde tekrar case oluşturmayın.
- Case kontrolü ve oluşturma, müşteri varlık bilgilerini girmeden **önce** tamamlanmalıdır.
- Aynı müşteri için aynı branşta birden fazla aktif case oluşturmaktan kaçının; önce mevcut case'leri kontrol edin.
- Case ID'sini (`caseId`) yerel olarak saklayarak, gerektiğinde case'e referans verebilirsiniz.
- Case yönetimi, acente ve broker yöneticilerinin CRM dashboard'unda satış fırsatlarını takip etmesini sağlar.

## 3. Teklif (proposal) alma süreci

### 3.1 Teklif yaratma

Teklif almak için `POST /proposals` endpoint’ine istek gönderilir. Gönderilecek temel alanlar:

| Alan | Açıklama |
| --- | --- |
| `type` | Teklifin branşı: `traffic`, `kasko`, `imm` (İMM), `konut`, `tss` (Tamamlayıcı Sağlık). |
| `customerId` | Teklifi isteyen müşterinin ID’si. |
| `vehicleId` | Trafik, kasko veya İMM teklifinde ilgili aracın ID’si (konut için gönderilmez). |
| `propertyId` | Konut teklifinde ilgili konutun ID’si (araba için gönderilmez). |
| `insuredCustomerId` | Sigorta ettiren ile sigortalı farklıysa ayrı ID gönderilir (genellikle eşittir). |
| `channel` | Çağrının yapıldığı kanal. Web satış platformu için `website` gönderilmelidir. |
| `coverageGroupIds` | Teminat grubu ID’lerinin listesi (1–3 adet). |

Not: `coverage` alanları tek tek doldurulabilir; iş yükünü azaltmak için yalnızca `coverageGroupIds` gönderilebilir. InsurUp CRM’de “Teminat Grupları” kısmında kasko, trafik, konut veya TSS için teminat paketleri oluşturup ID’leri burada kullanın. Böylece her paket için farklı teminat alternatifleriyle teklif alınır.

### 3.2 Teklif bilgileri ve ürünler

Teklif oluşturulduğunda cevap içinde `proposalId` döner. Sonrasında kullanılabilecek bazı servisler:

| İşlem | Endpoint |
| --- | --- |
| Teklif detayını alma | `GET /proposals/{proposalId}` |
| Teklifin bütün ürünlerini listeleme | `GET /proposals/{proposalId}/products` |
| Belirli bir ürünün taksit/premium detayını alma | `GET /proposals/{proposalId}/products/{proposalProductId}/premiums/{installmentNumber}` |
| Ürünün teminatlarını listeleme | `GET /proposals/{proposalId}/products/{proposalProductId}/coverage` |
| Ürünün belge ve bilgi formu dokümanı | `GET /proposals/{proposalId}/products/{proposalProductId}/document` ve `.../information-form-document` |
| Teklif ürünlerini karşılaştırma PDF’i | `GET /proposals/{proposalId}/products/compare-pdf` |
| Ürünü yeniden deneme (hata alındığında) | `POST /proposals/{proposalId}/products/{proposalProductId}/retry` |

Teklif ve poliçe listeleri: Web satış portalında geçmiş teklif ve poliçeleri listelemek için InsurUp’un GraphQL API’si kullanılabilir. GraphQL sorguları ile teklifleri ve poliçeleri filtreleyip sıralayabilirsiniz.

## 4. Satın alma ve ödeme süreci

### 4.1 Ödeme tipleri

**Önemli Not:** Robot ürünlerde satın alma isteği bulunmamaktadır. Satın alma işlemi yalnızca web servis ürünlerinde mevcuttur.

Müşteri, teklif edilen ürünlerden birini satın almak istediğinde `purchase` akışı çağrılır. InsurUp birçok ödeme tipini destekler:

**Async:**

1. **3D Secure** (`$type = 3d-secure`): Kart bilgileri acentenin web sitesinde toplanır; ödeme bankanın 3D Secure sayfasında doğrulanır.

2. **Insurance Company Redirect** (`$type = insurance-company-redirect`): Kart bilgileri ve doğrulama, sigorta şirketinin ödeme sayfasında tamamlanır.

3. **3rd Party 3D Secure** (`$type = third-party-3d-secure`): Sync yöntemdeki credit-card yöntemine sahip olup 3D Secure veya InsuranceCompanyRedirect olmayan sigorta şirketlerinde InsurUp'ın geliştirdiği ek bir yöntem. Müşteriden kart bilgilerinin alınması sonrasında 3. parti (Papara, QPay, Paratika) bir şirket ile kartı doğrular. Bu yöntemin kullanılabilmesi için acente/brokerın ilgili ödeme şirketiyle anlaşması olması gerekmektedir.

**Sync:**

4. **Credit Card** (`$type = credit-card`): Doğrudan kart bilgileri girilerek poliçeleştirilir ama sync yöntemde.

5. **Open Account** (`$type = open-account`): Sigorta şirketleriyle açık hesap anlaşması olan acente/brokerlar için geçerlidir. Direkt satın alma isteği gerçekleştirilir.

Eğer bir web satış projesi yapılacaksa kullanılabilecek yöntemler async yöntemlerdir (1-2-3. yöntemler). Fakat bazı şirketler bazı ödeme tiplerini destekler. Hangi şirketin hangi ödeme yöntemini desteklediğini görmek için [Ödeme Yöntemleri Listesi](/entegre-sigorta-urunleri/odeme-yontemleri-listesi) sayfasına bakabilirsiniz. En güncel bilgi için InsurUp'dan bilgi alın.

Satın alma endpoint'i:

`POST /proposals/{proposalId}/products/{proposalProductId}/purchase/async`

#### 3D Secure Örneği

```http
POST /api/proposals/{proposalId}/products/{proposalProductId}/purchase/async
Authorization: Bearer <accessToken>

{
  "$type": "3d-secure",
  "card": {
    "identityNumber": null,
    "number": "",
    "cvc": "",
    "expiryMonth": "",
    "expiryYear": "",
    "holderName": ""
  },
  "proposalId": "",
  "proposalProductId": "",
  "installmentNumber": 1,
  "callbackUrl": ""
}
```

#### Insurance Company Redirect Örneği

```http
POST /api/proposals/{proposalId}/products/{proposalProductId}/purchase/async
Authorization: Bearer <accessToken>

{
  "$type": "insurance-company-redirect",
  "callbackUrl": "",
  "installmentNumber": 1,
  "proposalId": "",
  "proposalProductId": "6911d24a134c60468e941886"
}
```

#### 3rd Party 3D Secure Örneği

```http
POST /api/proposals/{proposalId}/products/{proposalProductId}/purchase/async
Authorization: Bearer <accessToken>

{
  "$type": "third-party-3d-secure",
  "card": {
    "identityNumber": null,
    "number": "",
    "cvc": "",
    "expiryMonth": "",
    "expiryYear": "",
    "holderName": ""
  },
  "proposalId": "",
  "proposalProductId": "",
  "installmentNumber": 1,
  "callbackUrl": ""
}
```

API çağrısı sonucunda ödeme sağlayıcısına yönlendirilirsiniz. İşlemden sonra InsurUp, `callbackUrl` adresinize başarılı veya başarısız yanıt gönderir. Yanıt geldiğinde, yine de teklif ürününü sorgulayarak (`GET /proposals/{proposalId}/products/{proposalProductId}`) ödeme durumunu doğrulamanız önerilir; callback'e yapılan manuel istekler hatalı olabilir. Daha gerçek zamanlı bildirim için InsurUp'un SignalR üzerinden sunduğu canlı bildirim servisi kullanılabilir.

### 4.2 Poliçe bilgileri

Satın alma işlemi başarılı olduğunda InsurUp tarafından bir `policyId` üretilir. Poliçe bilgilerine erişmek için aşağıdaki endpoint’ler kullanılabilir:

| İşlem | Endpoint |
| --- | --- |
| Poliçe detayını görüntüleme | `GET /policies/{policyId}` |
| Poliçe belgesi (PDF) indirme | `GET /policies/{policyId}/document` |
| Poliçe belgesini e‑posta ile gönderme | `POST /policies/{policyId}/document/send` |

## 5. Ek servisler

### 5.1 Marka ve model sorguları

Araç markası ve modelleri için aşağıdaki servisler kullanılabilir:

| Servis | Kullanımı |
| --- | --- |
| `GET /vehicle-parameters/brands` | Tüm marka listesini döner. |
| `GET /vehicle-parameters/models?brandReference={id}&year={year}` | Seçili markanın belirli yıla göre modellerini listeler. |

### 5.2 Teminat seçimleri

Teminat paketleri oluşturmak için InsurUp CRM’de “Teminat Grupları” bölümünden paketler oluşturulur. API üzerinden sigorta şirketi bazında teminat seçimlerini almak için coverage-choices uç noktaları kullanılabilir (kasko, konut, imm veya tss):

- `GET /coverage-choices:kasko?insuranceCompanyId={id}` – Kasko branşı için teminat seçeneklerini getirir.
- `GET /coverage-choices:tss` – TSS ürününde kullanılabilecek teminat seçeneklerini getirir.

Bu listeler, business ekibinizin teminat gruplarını oluşturmasına yardımcı olur.

## 6. Uygulama akışının özeti

Aşağıdaki özet, self‑servis entegrasyonun genel akışını gösterir:

1. Giriş/Kayıt: Müşteri TC/VKN, telefon numarası ve doğum tarihi ile `auth/customer/login-or-register` endpoint’ine istek yapar. Sistem login veya kayıt işlemini yapar ve access token döner. Gerekiyorsa MFA doğrulaması yapılır.
2. Müşteri bilgilerini çekme: Token ile `customers/me` ve `customers/{id}/health-info` endpoint’leri çağrılarak müşteri bilgileri okunur.
3. Case oluşturma: OTP doğrulamasından sonra, `graphql` ile müşterinin aktif case'leri kontrol edilir. Eğer yoksa `POST /api/cases:new-sale-opportunity` ile yeni bir satış fırsatı talebi oluşturulur ve `caseId` alınır.
4. Varlık listesi/ekleme: Müşterinin mevcut araç ve konutları `customers/me/vehicles` ve `customers/me/properties` ile listelenir. Yeni araç veya konut için ilgili POST endpoint’leri kullanılır. Araç için `external-lookup`, konut için `query-address-by-property-number` veya adres seçim akışı uygulanır.
5. Teklif alma: Araç veya konut hazır olduğunda `POST /proposals` ile teklif alınır. Zorunlu alanlar `type`, `customerId`, `vehicleId`/`propertyId`, `insuredCustomerId`, `channel` (website) ve `coverageGroupIds`’tir. Cevapta `proposalId` döner.
6. Teklif detaylarını listeleme: `GET /proposals/{proposalId}/products` ve ilgili alt endpoint’lerle ürünler, teminatlar ve taksit seçenekleri görüntülenir.
7. Satın alma: `POST /proposals/{proposalId}/products/{proposalProductId}/purchase/async` ile ödeme başlatılır. 3D Secure veya Insurance Company Redirect seçilir; kart bilgileri ve `callbackUrl` parametre olarak gönderilir.
8. Ödeme sonrası doğrulama: `GET /proposals/{proposalId}/products/{proposalProductId}` ile ürün durumu kontrol edilir. Ayrıca SignalR ile anlık bildirim alınabilir.
9. Poliçe oluşturma ve belge indirme: Ödeme başarılı ise `policyId` üretilir. Poliçe bilgisi ve belgeleri `GET /policies/{policyId}` ve ilgili doküman endpoint’lerinden alınır.

---

Bu rehber, InsurUp Web Satış Platformu’nun API entegrasyonunu uçtan uca açıklar. Entegrasyon sırasında oluşacak sorular için InsurUp teknik ekibiyle iletişime geçebilir ve API değişikliklerini takip etmek için InsurUp’ın resmi dokümantasyon sitesini (api.insurup.com/scalar) kullanabilirsiniz.

