---
title: "Web Satış Platformunda Şubeli Yapı Kullanımları"
sidebar_position: 8
slug: /entegrasyon/web-satis-platformunda-subeli-yapi-kullanimlari
---

# Web Satış Platformunda Şubeli Yapı Kullanımları

Bu doküman, InsurUp Web Satış Platformu'nu kullanan acentelerin **şube (branch) yapısını** nasıl entegre edebileceğini açıklar. Şubeli yapı, aynı acentenin farklı satış kanallarından (partner siteler, alt acenteler, beyaz etiket platformlar vb.) gelen satışları ayrı ayrı takip edebilmesini sağlar. Bu rehber, şube kavramını, teknik implementasyonu ve yaygın kullanım senaryolarını kapsar.

Temel API akışları için [InsurUp Web Satış Platformu Self-servis Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-entegrasyon-rehberi), ürün bazlı detaylar için [Kasko Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-kasko-entegrasyon-rehberi) ve [TSS Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-tss-entegrasyon-rehberi) dökümanlarını incelemeniz önerilir.

**API Referansı:** Tüm endpoint'lerin detaylı teknik dokümantasyonu için [api.insurup.com/scalar](https://api.insurup.com/scalar) adresini ziyaret edin.

## 1. Şubeli yapı nedir?

InsurUp'ta her acente bir **organizasyon** olarak tanımlanır ve benzersiz bir `agentId` değerine sahiptir. Acente tek bir satış kanalı üzerinden çalışıyorsa yalnızca `agentId` yeterlidir. Ancak acentenin birden fazla satış noktası, partner sitesi veya alt acentesi varsa her biri için ayrı bir **şube (branch)** tanımlanır.

Şubeler InsurUp CRM'de [Şubeler](https://app.insurup.com/branches) sayfasından veya API üzerinden oluşturulur ve her şubeye benzersiz bir `agentBranchId` atanır. Bu ID, tüm API çağrılarında kullanılarak ilgili satışın hangi kanaldan geldiğini belirler.

### 1.1 Şube ile acente arasındaki ilişki

```
Acente Organizasyonu (agentId)
├── Şube A (agentBranchId: "aaa...")  →  orneksigorta.com (ana site)
├── Şube B (agentBranchId: "bbb...")  →  guvenlipolice.orneksigorta.com (partner site)
├── Şube C (agentBranchId: "ccc...")  →  Mobil uygulama kanalı
└── Şube D (agentBranchId: "ddd...")  →  Alt acente satış noktası
```

Her şube aynı acentenin poliçe üretim yetkisi altında çalışır; ancak satış kaynağı, komisyon takibi ve raporlama açısından birbirinden bağımsız olarak izlenir.

## 2. Ne zaman şubeli yapı kullanılır?

| Senaryo | Açıklama |
| --- | --- |
| **Partner site** | Acentenin bir iş ortağı kendi alan adı veya alt alan adı üzerinden sigorta satışı yapıyorsa |
| **Beyaz etiket (white-label) platform** | Aynı B2C altyapısı farklı markalar/kurumlar için özelleştirilerek deploy ediliyorsa |
| **Alt acente veya franchise** | Ana acenteye bağlı alt acenteler kendi müşterilerini yönlendiriyorsa |
| **Çoklu alan adı** | Aynı acente birden fazla web sitesi işletiyorsa (örn. ürün bazlı veya bölge bazlı siteler) |
| **Kanal bazlı takip** | Web, mobil uygulama, çağrı merkezi gibi farklı kanalların satışlarını ayrı raporlamak isteniyorsa |

:::info
Tek bir web satış platformu işleten ve şube/partner ayrımı yapmayan acenteler için `agentBranchId` gönderilmesine gerek yoktur. Yalnızca `agentId` yeterlidir.
:::

## 3. Şube oluşturma

Şubeler, InsurUp CRM'de [Şubeler](https://app.insurup.com/branches) sayfasından oluşturulur ve yönetilir. Şube oluşturma adımları:

1. InsurUp CRM'de [Şubeler](https://app.insurup.com/branches) sayfasına gidin.
2. Yeni şube ekleyin ve şubeye bir ad verin (örn. "Güvenli Poliçe Ortaklığı", "Mobil Kanal").
3. Oluşturulan şubenin `agentBranchId` değerini not edin; bu değer API çağrılarında kullanılacaktır.

Her şubeye ait temsilci (representative) ataması da CRM'den yapılabilir. Böylece ilgili şubeden gelen satış fırsatları otomatik olarak doğru temsilciye yönlendirilir.

## 4. Teknik implementasyon

Şubeli yapıda `agentBranchId` parametresi, B2C akışının birçok noktasında kullanılır. Aşağıda bu parametrenin gönderilmesi gereken tüm endpoint'ler ve kullanım örnekleri yer almaktadır.

### 4.1 Konfigürasyon yapısı

Web satış platformunuzun konfigürasyon dosyasında veya ortam değişkenlerinde hem `agentId` hem de `agentBranchId` değerlerini tanımlayın.

```json
{
  "agency": {
    "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "agentBranchId": "yyyyyyyyyyyyyyyyyyyyyyyy"
  }
}
```

:::tip
`agentBranchId` değerini kaynak koduna sabit (hardcoded) olarak yazmak yerine, konfigürasyon dosyasından veya ortam değişkeninden okumak daha doğru bir yaklaşımdır. Bu sayede aynı kod tabanını farklı şubeler için deploy edebilirsiniz.
:::

### 4.2 Müşteri giriş veya kayıt (LoginOrRegister)

Müşteri girişi veya kaydı sırasında `agentBranchId` gönderilmelidir. Bu sayede müşteri kaydı ilgili şubeye bağlanır.

```http
POST /api/auth/customer/login-or-register
Content-Type: application/json

{
  "identityNumber": 12345678901,
  "phoneNumber": {
    "number": "5321234567",
    "countryCode": 90
  },
  "birthDate": "1990-01-15",
  "agentId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "agentBranchId": "yyyyyyyyyyyyyyyyyyyyyyyy",
  "approvedConsentTypes": ["KVKK"]
}
```

| Parametre | Tip | Zorunlu | Açıklama |
| --- | --- | --- | --- |
| `agentId` | Guid | Evet | Ana acente organizasyon kimliği |
| `agentBranchId` | String | Evet* | Şube veya partner kimliği |

*Şubeli yapı kullanılıyorsa zorunludur.

### 4.3 Müşteri güncelleme

Mevcut müşteri bilgileri güncellenirken de `agentBranchId` gönderilmelidir.

```http
PUT /api/customers/{customerId}
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "$type": "individual",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "agentBranchId": "yyyyyyyyyyyyyyyyyyyyyyyy",
  "firstName": "Ali",
  "lastName": "Yılmaz",
  "email": "ali@example.com"
}
```

### 4.4 Satış fırsatı talebi (Case) oluşturma

Case oluşturma isteğinde `agentBranchId` parametresi gönderilerek, satış fırsatının hangi şubeden geldiği kayıt altına alınır.

```http
POST /api/cases:new-sale-opportunity
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "assetType": null,
  "assetId": null,
  "productBranch": "KASKO",
  "channel": "WEBSITE",
  "agentBranchId": "yyyyyyyyyyyyyyyyyyyyyyyy"
}
```

### 4.5 Teklif oluşturma (Proposal)

Teklif oluşturma isteğinde `agentBranchId` gönderilmesi, teklifin ve sonrasında oluşacak poliçenin doğru şubeye atanmasını sağlar.

```http
POST /api/proposals
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "$type": "kasko",
  "insurerCustomerId": "550e8400-e29b-41d4-a716-446655440000",
  "insuredCustomerId": "550e8400-e29b-41d4-a716-446655440000",
  "vehicleId": "660e8400-e29b-41d4-a716-446655440000",
  "coverageGroupIds": ["687a0b64de0417b007525aac"],
  "channel": "WEBSITE",
  "agentBranchId": "yyyyyyyyyyyyyyyyyyyyyyyy"
}
```

### 4.6 Parametrelerin kullanım yerleri özeti

| Endpoint | `agentId` | `agentBranchId` |
| --- | --- | --- |
| `auth/customer/login-or-register` | Evet | Evet |
| `PUT /api/customers/{id}` | — | Evet |
| `POST /api/cases:new-sale-opportunity` | — | Evet |
| `POST /api/proposals` | — | Evet |

:::info
`agentId` yalnızca kimlik doğrulama (login/register) aşamasında gönderilir. Sonraki çağrılarda müşteri zaten acenteye bağlı olduğundan, yalnızca `agentBranchId` ile şube bilgisi iletilir.
:::

## 5. Çok siteli (multi-domain) şube yapısı

Şubeli yapının en yaygın kullanım senaryolarından biri, aynı B2C altyapısının birden fazla alan adı veya alt alan adı üzerinde çalışmasıdır.

### 5.1 Mimari örnek

Bir acentenin kendi web satış platformu ve bir iş ortağının beyaz etiket sitesi olduğunu düşünelim:

| Site | Alan Adı | `agentId` | `agentBranchId` | Açıklama |
| --- | --- | --- | --- | --- |
| Ana site | `orneksigorta.com` | `agent-001` | `branch-ana` | Acentenin kendi B2C platformu |
| Partner sitesi | `teklifal.partnerfinans.com` | `agent-001` | `branch-partner` | Partner kurumun beyaz etiket sitesi |

Her iki site de aynı acentenin üretim yetkisi altında çalışır; ancak farklı `agentBranchId` değerleri sayesinde satışlar ayrı ayrı raporlanır.

### 5.2 Konfigürasyon dosyası ayrımı

Her deploy için ayrı bir konfigürasyon dosyası oluşturulur. Bu dosyada site markası, tema renkleri, ürün seçenekleri ve şube bilgisi farklılaşır:

**Ana site konfigürasyonu (`orneksigorta.com`):**

```json
{
  "agency": {
    "id": "agent-001",
    "name": "Örnek Sigorta",
    "agentBranchId": "branch-ana"
  },
  "theme": {
    "primaryColor": "#1a56db"
  },
  "coverageGroupIds": {
    "kasko": ["cg-001", "cg-002", "cg-003"],
    "trafik": ["cg-004"]
  }
}
```

**Partner site konfigürasyonu (`teklifal.partnerfinans.com`):**

```json
{
  "agency": {
    "id": "agent-001",
    "name": "Partner Finans Sigorta",
    "agentBranchId": "branch-partner"
  },
  "theme": {
    "primaryColor": "#16a34a"
  },
  "coverageGroupIds": {
    "kasko": ["cg-001", "cg-002"],
    "tss": ["cg-010", "cg-011"]
  }
}
```

Bu yapıda dikkat edilmesi gereken noktalar:

- **`agentId` aynıdır**: Her iki site de aynı acentenin üretim yetkisini kullanır.
- **`agentBranchId` farklıdır**: Satışların hangi kanaldan geldiğini ayırt eder.
- **Ürün yelpazesi farklılaşabilir**: Partner siteye yalnızca belirli branşlar veya sigorta şirketleri sunulabilir.
- **Tema ve marka**: Her site kendi logosunu, renklerini ve iletişim bilgilerini kullanır.
- **Teminat grupları farklı olabilir**: Partner için farklı teminat paketleri tanımlanabilir.

### 5.3 Temsilci (representative) atama

Her şube için varsayılan bir temsilci (representative) tanımlanabilir. Bu temsilci, ilgili şubeden gelen tüm satış fırsatlarına ve tekliflere otomatik olarak atanır.

```json
{
  "representatives": {
    "defaultRepresentativeAgentUserId": "rep-user-001"
  }
}
```

Ana site ve partner site için farklı temsilciler atanarak, satış ekibinin kendi kanallarındaki müşterilere odaklanması sağlanır.

## 6. CRM'de şube takibi

Şubeli yapı, InsurUp CRM'de aşağıdaki alanlarda görünürlük sağlar:

### 6.1 Müşteri listesinde

CRM'de müşteri listesinde `agentBranch` bilgisi görüntülenir. Müşteriler hangi şubeden kaydolduysa, o şubeye ait olarak listelenir.

### 6.2 Teklif ve poliçe listelerinde

GraphQL API ile teklif ve poliçe sorgularında `agentBranch` alanı döner:

```graphql
query {
  proposals(
    where: { agentBranch: { id: { eq: "branch-partner" } } }
    order: { createdAt: DESC }
  ) {
    items {
      id
      productBranch
      status
      agentBranch {
        id
        name
      }
    }
  }
}
```

Bu sorgu ile belirli bir şubeden gelen tüm teklifler filtrelenebilir.

### 6.3 Poliçe sorgusunda

Poliçe listesinde de `agentBranch` bilgisi yer alır:

```graphql
query {
  policies(
    where: { agentBranch: { id: { eq: "branch-partner" } } }
  ) {
    items {
      id
      policyNumber
      agentBranch {
        id
        name
      }
    }
  }
}
```

### 6.4 Webhook payload'larında

Webhook event'lerinde de şube bilgisi yer alır. Poliçe oluşturulduğunda veya teklif durumu değiştiğinde gelen webhook payload'ında `agentBranch` objesi bulunur:

```json
{
  "event": "proposal.product.purchased",
  "data": {
    "proposalId": "prop-123",
    "agentBranch": {
      "id": "branch-partner",
      "name": "Partner Finans"
    }
  }
}
```

Detaylı webhook yapısı için [Webhook API Entegrasyonu](/entegrasyon/webhook-api-entegrasyonu) dökümanına bakın.

## 7. Şubeli yapı entegrasyon akış özeti

Aşağıdaki akış, şubeli yapıda bir B2C satış sürecinin uçtan uca adımlarını gösterir:

1. **Konfigürasyon hazırlığı:** CRM'de şube oluşturun ve `agentBranchId` değerini edinin. Web satış platformunuzun konfigürasyon dosyasında bu değeri tanımlayın.
2. **Müşteri girişi:** `auth/customer/login-or-register` çağrısında hem `agentId` hem `agentBranchId` gönderin.
3. **MFA doğrulama:** Gerekiyorsa `auth/customer/verify-mfa` ile doğrulama yapın.
4. **Müşteri bilgisi:** `customers/me` ile müşteri bilgilerini çekin.
5. **Müşteri güncelleme:** Müşteri bilgileri güncellenirken `agentBranchId` gönderin.
6. **Case oluşturma:** `POST /api/cases:new-sale-opportunity` ile satış fırsatı oluşturun; `agentBranchId` ekleyin.
7. **Varlık ekleme:** Araç veya konut bilgilerini kaydedin.
8. **Teklif oluşturma:** `POST /api/proposals` ile teklif alın; `agentBranchId` ekleyin.
9. **Teklif karşılaştırma:** Gelen teklifleri müşteriye sunun.
10. **Satın alma:** Seçilen ürün için ödeme akışını başlatın.
11. **CRM takibi:** Tüm işlemler, CRM'de ilgili şube altında raporlanır.

## 8. Sık yapılan hatalar

| Hata | Sonucu | Çözüm |
| --- | --- | --- |
| `agentBranchId` gönderilmemesi | Satış ana acenteye kaydedilir; şube bazlı takip yapılamaz | Tüm ilgili endpoint'lerde `agentBranchId` gönderin |
| Farklı endpoint'lerde farklı `agentBranchId` gönderilmesi | Müşteri, case ve teklif farklı şubelere atanır; tutarsız veri oluşur | `agentBranchId` değerini merkezi bir yerden (config) okuyun |
| Login'de `agentBranchId` gönderilip proposal'da unutulması | Müşteri doğru şubeye bağlanır ama poliçe yanlış şubeye atanır | Tüm API çağrılarında tutarlı olun |
| Aynı `agentBranchId` değerinin birden fazla site için kullanılması | Farklı kanallardan gelen satışlar ayırt edilemez | Her site/kanal için ayrı şube tanımlayın |

---

Bu rehber, InsurUp Web Satış Platformu'nda şubeli yapı kullanımının teknik detaylarını ve en iyi uygulamalarını kapsar. Entegrasyon sırasında oluşacak sorular için InsurUp teknik ekibiyle iletişime geçebilir ve endpoint detayları için [api.insurup.com/scalar](https://api.insurup.com/scalar) adresini kullanabilirsiniz.
