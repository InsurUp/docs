---
title: "InsurUp Web Satış Platformu Self-servis Tamamlayıcı Sağlık (TSS) Entegrasyon Rehberi"
sidebar_position: 4
slug: /entegrasyon/insurup-web-satis-platformu-self-servis-tss-entegrasyon-rehberi
---

# InsurUp Web Satış Platformu Self‑servis Tamamlayıcı Sağlık (TSS) Entegrasyon Rehberi

Bu rehber, web satış platformunuzdan Tamamlayıcı Sağlık Sigortası (TSS) teklifi alıp poliçe satışı yapmak için InsurUp API'lerini nasıl kullanabileceğinizi açıklar. Akış, müşterinin giriş yapmasından sağlık bilgisi girilmesine, teklif oluşturulmasından ödemeye ve poliçe dokümanlarının teslimine kadar tüm adımları kapsar.

InsurUp'ın kasko entegrasyonuna benzer bir yapı vardır: önce müşteri kaydı/girişi yapılır, ardından coverage group (teminat paketi) seçilir ve teklif oluşturulur. TSS için ek olarak müşterinin boy/kilo gibi sağlık bilgilerinin gönderilmesi gerekir. Bu dokümandaki örnekler açıklayıcıdır; gerçek çağrılar yapılırken kendi accessToken, customerId ve coverageGroupId değerlerinizi kullanın.

## 1. Kimlik doğrulama ve oturum yönetimi

### 1.1 Müşteri giriş / kayıt (LoginOrRegister)

Müşterinin sisteme giriş yapması veya kayıt olması için `auth/customer/login-or-register` endpoint'ine POST isteği gönderilir. Gönderilmesi gereken temel alanlar; TC/VKN numarası, doğum tarihi, cep telefonu ve InsurUp'tan aldığınız Agent ID'dir ([docs.insurup.com](https://docs.insurup.com)). Yanıtta gelen accessToken ve refreshToken bir sonraki çağrılarda kullanılacaktır.

**URL:** `POST /api/auth/customer/login-or-register`

**Giriş verileri:**

- `identityNumber`: müşterinin TC/VKN veya pasaport numarası
- `birthday`: gg.aa.yyyy formatında doğum tarihi (yeni kayıt için)
- `phoneNumber`: cep telefonu ("+90" ile başlayabilir)
- `agentId`: InsurUp'tan aldığınız Agent ID
- `type`: individual, corporate veya foreign

**Yanıt:** accessToken, refreshToken ve token'ın geçerlilik süresi.

### 1.2 Refresh token

accessToken'lar kısa ömürlüdür. Oturum süresini uzatmak için `auth/customer/refresh` endpoint'ine refreshToken gönderilir ve yeni bir access token alınır ([docs.insurup.com](https://docs.insurup.com)).

### 1.3 MFA doğrulaması

InsurUp, güvenlik için çok faktörlü doğrulama (MFA) isteyebilir. Yanıtta gelen `mfaRequired` true olduğunda, müşteriye SMS ile gönderilen doğrulama kodu `auth/customer/verify-mfa` endpoint'iyle doğrulanır. MFA gerekmiyorsa kendi SMS hizmetinizi kullanabilirsiniz.

## 2. Müşteri bilgileri ve sağlık bilgileri

### 2.1 Müşteri bilgilerini görüntüleme

Giriş yapan müşteriye ait temel bilgileri almak için `GET /api/customers/me` endpoint'i çağrılır. Dönen cevapta TC/VKN, ad‑soyad, doğum tarihi, cep telefonu, e‑posta adresi, cinsiyet ve adres bilgileri bulunur ([docs.insurup.com](https://docs.insurup.com)).

### 2.2 Sağlık bilgilerini (boy/kilo) güncelleme

Tamamlayıcı Sağlık teklifinde boy ve kilo bilgileri zorunludur. Bu bilgiler müşterinin sağlık profilinde saklanır. Sağlık verilerini okumak için `GET /api/customers/{customerId}/health-info`, güncellemek için ise `PUT /api/customers/{customerId}/health-info` kullanılır ([docs.insurup.com](https://docs.insurup.com)). Örnek çağrı:

```http
PUT /api/customers/{customerId}/health-info
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "height": 175,      // boy (cm)
  "weight": 75,       // kilo (kg)
  "surgeries": null,  // ameliyat kodları (null gönderilmesi yeterlidir)
  "diseases": null    // kronik hastalık kodları (null gönderilmesi yeterlidir)
}
```

Yanıtta güncellenen sağlık bilgisi döner. Sadece boy ve kilo zorunludur; `surgeries` ve `diseases` alanları için null gönderilmesi yeterlidir. Sağlık verisi gönderdikten sonra KVKK ve E‑Ticaret aydınlatma/onaylarını CRM üzerinden almayı unutmayın.

## 3. Teminat grubu

TSS teklifi oluştururken InsurUp CRM'de oluşturduğunuz teminat paketinin `coverageGroupId` değerini göndermeniz yeterlidir. Teminatları tek tek doldurmanıza gerek yoktur; CRM'de tanımlanan paket otomatik olarak kullanılır ([docs.insurup.com](https://docs.insurup.com)).

## 4. TSS teklif akışı

### 4.1 Teklif oluşturma

Müşteri giriş yaptıktan ve sağlık bilgileri güncellendikten sonra TSS teklifi oluşturabilirsiniz. `POST /api/proposals` endpoint'ine aşağıdaki alanlarla bir istek gönderin ([docs.insurup.com](https://docs.insurup.com)):

- `type`: tss (branş türü). Kasko için kasko, trafik için traffic vb. kullanılır.
- `customerId`: teklifi isteyen müşterinin ID'si.
- `insuredCustomerId`: sigortalı kişi farklıysa bu alan farklı bir müşteri ID'si olabilir (genellikle customerId ile aynıdır).
- `channel`: çağrının yapıldığı kanal. Web satış platformu için website kullanın.
- `coverageGroupIds`: CRM'de oluşturulan TSS teminat paketi ID'lerinin listesi.

Çağrının cevabında `proposalId` döner. Bu ID ile teklif detaylarını ve ürünleri sorgulayabilirsiniz.

### 4.2 Teklif bilgileri ve ürünleri

Teklif oluşturulduktan sonra aşağıdaki endpoint'leri kullanarak ürün ve prim detaylarını alın ([docs.insurup.com](https://docs.insurup.com)):

- **Teklif detayını alma:** `GET /api/proposals/{proposalId}` – teklifin durumunu ve oluşturma tarihini döner.
- **Ürünleri listeleme:** `GET /api/proposals/{proposalId}/products` – sigorta şirketlerinden gelen ürün tekliflerini listeler.
- **Taksit detayları:** `GET /api/proposals/{proposalId}/products/{proposalProductId}/premiums/{installmentNumber}` – seçilen bir taksit planının prim detayını getirir.
- **Ürünün teminat/muafiyet bilgileri:** `GET /api/proposals/{proposalId}/products/{proposalProductId}/coverage` – paketteki teminatları ve muafiyetleri listeler.

### 4.3 Teklifi kullanıcıya sunma

B2C arayüzünüzde ürünleri yan yana karşılaştırabilir ve müşterinin seçtiği ürün ile taksit sayısını saklayabilirsiniz. Cevapta dönen `proposalProductId` ve `installmentNumber` ödeme adımında kullanılacaktır.

## 5. Ödeme ve poliçe oluşturma

### 5.1 Ödeme tipi seçimi

InsurUp, kasko dokümanında olduğu gibi çeşitli ödeme yöntemlerini destekler:

- **3D Secure:** kart bilgileri sizde toplanır, doğrulama bankanın 3D secure sayfasında yapılır.
- **Insurance Company Redirect:** kart bilgileri ve doğrulama sigorta şirketinin sayfasında tamamlanır.
- **Sync Payment:** bazı şirketlerin senkron ödeme sistemleri için kullanılır.

### 5.2 Ödeme servis çağrısı

Müşteri bir ürün seçip taksit sayısını belirlediğinde `POST /api/proposals/{proposalId}/products/{proposalProductId}/purchase/async` endpoint'i çağrılır ([docs.insurup.com](https://docs.insurup.com)). Ödeme tipine göre `type` alanı (`3DSecure`, `InsuranceCompanyRedirect` veya `Sync`) ve gerekli kart bilgileri gönderilir. 3D Secure ve InsuranceCompanyRedirect tipinde yanıt olarak bir `redirectUrl` gelir; kullanıcı bu URL'ye yönlendirilip ödeme tamamlandığında sisteme `callbackUrl` ile geri dönülür. Sync tipinde ödeme anlık olarak gerçekleştirilir ve doğrudan poliçe üretilebilir.

### 5.3 Poliçe oluşturma ve belge alma

Ödeme başarıyla sonuçlandığında InsurUp poliçeyi oluşturur. Poliçe bilgilerine ve dokümanlarına erişmek için şu endpoint'ler kullanılır ([docs.insurup.com](https://docs.insurup.com)):

- `GET /api/policies/{policyId}` – poliçe detayını döner.
- `GET /api/policies/{policyId}/document` – poliçe PDF'ini indirir.
- `POST /api/policies/{policyId}/document/send` – poliçe dokümanını müşterinin e‑posta adresine gönderir.

Poliçe oluşturulduktan sonra müşterinin CRM'deki profilinde poliçe bilgisi otomatik olarak görünür.

## 6. Akışın özeti

Aşağıdaki liste TSS entegrasyonunun genel akışını özetler ([docs.insurup.com](https://docs.insurup.com)):

1. **Giriş / Kayıt:** Müşteri, TC/VKN, telefon ve doğum tarihi ile `auth/customer/login-or-register` çağrısı yapar; gerekirse MFA doğrulaması gerçekleştirilir.
2. **Müşteri bilgilerini çekme:** Token ile `customers/me` ve `customers/{id}/health-info` endpoint'leri çağrılarak müşteri ve sağlık bilgileri alınır ([docs.insurup.com](https://docs.insurup.com)).
3. **Varlık listesi / ekleme:** Müşterinin araç ve konut varlıkları listelenebilir; TSS teklifinde varlık gerekmediği için bu adım atlanabilir.
4. **Coverage group seçimi:** CRM'de oluşturduğunuz TSS teminat paketinin `coverageGroupId` değerini teklif oluşturma adımında kullanın.
5. **Teklif oluşturma:** `POST /proposals` çağrısı ile `type="tss"` ve `coverageGroupIds` alanları gönderilerek teklif alınır ([docs.insurup.com](https://docs.insurup.com)).
6. **Ürünleri listeleme:** `GET /proposals/{proposalId}/products` ve alt endpoint'lerle ürün tekliflerini, primleri ve teminatları görüntüleyin ([docs.insurup.com](https://docs.insurup.com)).
7. **Ödeme:** Seçilen ürün ve taksit için `purchase/async` endpoint'i çağrılarak ödeme başlatılır ([docs.insurup.com](https://docs.insurup.com)).
8. **Poliçe:** Ödeme başarılıysa `policyId` üretilir; poliçe bilgisi ve PDF dokümanları `GET /policies/{policyId}` ve ilgili belge endpoint'leriyle alınır ([docs.insurup.com](https://docs.insurup.com)).

Bu rehber, web satış platformunuzun Tamamlayıcı Sağlık ürünleri için InsurUp API entegrasyonunu uçtan uca özetler. Sorularınız veya ek ihtiyaçlarınız için InsurUp'ın teknik ekibi ile iletişime geçebilirsiniz.

