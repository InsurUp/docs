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

Müşteri, teklif edilen ürünlerden birini satın almak istediğinde `purchase` akışı çağrılır. InsurUp üç ödeme tipi tanımlar:

- 3D Secure: Kart bilgileri sizde toplanır, SMS doğrulaması bankada yapılır. `type = 3DSecure` ve kart bilgileri payload’da gönderilir.
- Insurance Company Redirect: Kart bilgileri ve 3D doğrulama sigorta şirketi sayfasında toplanır. `type = InsuranceCompanyRedirect` gönderilir, kart bilgisi payload’da gönderilmez; kullanıcı yönlendirilir.
- Sync Payment: Bazı şirketlerin anlık (synchronous) ödeme sistemleri için.

Satın alma endpoint’i:

`POST /proposals/{proposalId}/products/{proposalProductId}/purchase/async`

Gönderilecek alanlar:

| Alan | Açıklama |
| --- | --- |
| `type` | Ödeme tipi: `3DSecure`, `InsuranceCompanyRedirect` veya `Sync`. |
| `installmentNumber` | Taksit sayısı (1, 3, 6 vb.). |
| `cardHolderName` | Kart sahibi adı (3D Secure tipinde). |
| `cardNumber` | Kart numarası (3D Secure tipinde). |
| `expirationMonth`/`expirationYear` | Son kullanma tarihi (3D Secure tipinde). |
| `cvc` | Kart güvenlik kodu (3D Secure tipinde). |
| `callbackUrl` | Ödemenin sonucu için InsurUp’un çağıracağı URL. |

API çağrısı sonucunda ödeme sağlayıcısına yönlendirilirsiniz. İşlemden sonra InsurUp, `callbackUrl` adresinize başarılı veya başarısız yanıt gönderir. Yanıt geldiğinde, yine de teklif ürününü sorgulayarak (`GET /proposals/{proposalId}/products/{proposalProductId}`) ödeme durumunu doğrulamanız önerilir; callback’e yapılan manuel istekler hatalı olabilir. Daha gerçek zamanlı bildirim için InsurUp’un SignalR üzerinden sunduğu canlı bildirim servisi kullanılabilir.

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
3. Varlık listesi/ekleme: Müşterinin mevcut araç ve konutları `customers/me/vehicles` ve `customers/me/properties` ile listelenir. Yeni araç veya konut için ilgili POST endpoint’leri kullanılır. Araç için `external-lookup`, konut için `query-address-by-property-number` veya adres seçim akışı uygulanır.
4. Teklif alma: Araç veya konut hazır olduğunda `POST /proposals` ile teklif alınır. Zorunlu alanlar `type`, `customerId`, `vehicleId`/`propertyId`, `insuredCustomerId`, `channel` (website) ve `coverageGroupIds`’tir. Cevapta `proposalId` döner.
5. Teklif detaylarını listeleme: `GET /proposals/{proposalId}/products` ve ilgili alt endpoint’lerle ürünler, teminatlar ve taksit seçenekleri görüntülenir.
6. Satın alma: `POST /proposals/{proposalId}/products/{proposalProductId}/purchase/async` ile ödeme başlatılır. 3D Secure veya Insurance Company Redirect seçilir; kart bilgileri ve `callbackUrl` parametre olarak gönderilir.
7. Ödeme sonrası doğrulama: `GET /proposals/{proposalId}/products/{proposalProductId}` ile ürün durumu kontrol edilir. Ayrıca SignalR ile anlık bildirim alınabilir.
8. Poliçe oluşturma ve belge indirme: Ödeme başarılı ise `policyId` üretilir. Poliçe bilgisi ve belgeleri `GET /policies/{policyId}` ve ilgili doküman endpoint’lerinden alınır.

---

Bu rehber, InsurUp Web Satış Platformu’nun API entegrasyonunu uçtan uca açıklar. Entegrasyon sırasında oluşacak sorular için InsurUp teknik ekibiyle iletişime geçebilir ve API değişikliklerini takip etmek için InsurUp’ın resmi dokümantasyon sitesini (api.insurup.com/scalar) kullanabilirsiniz.

