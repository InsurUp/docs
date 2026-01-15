---
title: "B2B / CRM Entegrasyonu"
sidebar_position: 7
slug: /entegrasyon/b2b-crm-entegrasyonu
---

# B2B / CRM Entegrasyonu

Bu döküman, InsurUp API'lerini kendi CRM veya B2B sistemlerine entegre etmek isteyen partnerler için hazırlanmıştır. Web Satış Platformu kullanmadan, doğrudan API üzerinden teklif alma ve poliçeleştirme işlemleri yapılabilir.

Temel API akışları için [InsurUp Web Satış Platformu Self-servis Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-entegrasyon-rehberi) ve ürün bazlı detaylar için [Kasko Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-kasko-entegrasyon-rehberi) dökümanlarını incelemeniz önerilir. Bu döküman, söz konusu dökümanlardan farklılaşan B2B-spesifik konuları kapsar.

**API Referansı:** Tüm endpoint'lerin detaylı teknik dokümantasyonu için [api.insurup.com/scalar](https://api.insurup.com/scalar) adresini ziyaret edin.

## 1. Web Satış Platformu ile B2B entegrasyon farkları

| Özellik | Web Satış Platformu | B2B / CRM Entegrasyonu |
| --- | --- | --- |
| Kimlik doğrulama | Müşteri login (OTP) | Agent User login (email/password) |
| Kullanıcı etkileşimi | Müşteri web arayüzü kullanır | Partner backend sistemi API çağrısı yapar |
| Ödeme yöntemi | 3D Secure veya Sigorta Şirketi Redirect | Doğrudan kredi kartı (sync) |
| Müşteri verisi | InsurUp müşteri portalı | Partner kendi CRM'inde tutar |
| Teklif/Poliçe görüntüleme | Web arayüzü | GraphQL veya REST API |

## 2. Kimlik doğrulama (Authentication)

B2B entegrasyonlarında müşteri login akışı yerine **Agent User** kimlik doğrulaması kullanılır. Partner sisteminiz, InsurUp tarafından oluşturulan agent user hesabı ile API'ye erişir.

### 2.1 Login

Partner sisteminiz aşağıdaki endpoint ile access token alır:

**Endpoint:** `POST /api/authentication:agent-user/login`

**İstek gövdesi:**

| Alan | Tip | Zorunlu | Açıklama |
| --- | --- | --- | --- |
| `email` | String | Evet | Agent user e-posta adresi |
| `password` | String | Evet | Agent user şifresi |

**Yanıt:**

| Alan | Tip | Açıklama |
| --- | --- | --- |
| `accessToken` | String | API çağrılarında kullanılacak JWT token |
| `refreshToken` | String | Token yenilemek için kullanılacak token |
| `expiresIn` | Integer | Access token geçerlilik süresi (saniye) |
| `requiresTwoFactor` | Boolean | 2FA gerekli ise `true` döner |
| `userId` | String | Kimliği doğrulanan kullanıcı ID'si |

### 2.2 Token kullanımı

Alınan `accessToken`, tüm API çağrılarında `Authorization` header'ında kullanılır:

```
Authorization: Bearer {accessToken}
```

### 2.3 Token yenileme

Access token süresi dolmadan önce refresh token ile yenileme yapılabilir:

**Endpoint:** `POST /api/authentication:agent-user/refresh`

**İstek gövdesi:**

| Alan | Tip | Zorunlu | Açıklama |
| --- | --- | --- | --- |
| `refreshToken` | String | Evet | Login yanıtından alınan refresh token |

Token süresinin %80'i dolduğunda yenileme yapmanız önerilir.

### 2.4 Agent User hesabı temini

B2B entegrasyonu için agent user hesabı InsurUp tarafından oluşturulur. Hesap bilgilerinizi almak için InsurUp teknik ekibiyle iletişime geçin.

## 3. Temel API akışları

B2B entegrasyonunda teklif alma ve poliçeleştirme akışları Web Satış Platformu ile aynıdır. Detaylar için ilgili dökümanları inceleyin:

- [Self-servis Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-entegrasyon-rehberi) - Genel akış
- [Kasko Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-kasko-entegrasyon-rehberi) - Kasko/Trafik spesifik
- [TSS Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-tss-entegrasyon-rehberi) - Tamamlayıcı Sağlık spesifik

Temel akış özeti:

1. **Müşteri oluşturma/güncelleme:** `POST /api/customers`
2. **Araç/varlık ekleme:** `POST /api/customers/{CustomerId}/vehicles`
3. **Teklif oluşturma:** `POST /api/proposals`
4. **Teklif detayı alma:** `GET /api/proposals/{ProposalId}`
5. **Poliçeleştirme:** `POST /api/proposals/{ProposalId}/products/{ProposalProductId}/purchase/sync`

## 4. Poliçeleştirme (Sync vs Async)

B2B entegrasyonlarında poliçeleştirme için **sync** endpoint kullanılır. Bu endpoint, 3D Secure gerektirmeden doğrudan kredi kartı ile ödeme yapılmasına olanak tanır.

### 4.1 Sync poliçeleştirme (B2B için önerilen)

**Endpoint:** `POST /api/proposals/{ProposalId}/products/{ProposalProductId}/purchase/sync`

Bu yöntemde:

- 3D Secure doğrulaması gerekmez
- Ödeme anında işlenir
- Poliçe bilgisi yanıtta döner
- Kullanıcı yönlendirmesi yoktur

**Desteklenen ödeme yöntemleri:**

| Yöntem | Açıklama |
| --- | --- |
| `CreditCard` | Doğrudan kredi kartı ile ödeme |
| `OpenAccount` | Açık hesap (kurumsal müşteriler için) |

**Kredi kartı ile ödeme isteği:**

| Alan | Tip | Zorunlu | Açıklama |
| --- | --- | --- | --- |
| `installmentNumber` | Integer | Evet | Taksit sayısı (1 = peşin) |
| `card.number` | String | Evet | Kart numarası |
| `card.cvc` | String | Evet | Güvenlik kodu |
| `card.expiryMonth` | String | Evet | Son kullanma ayı (MM) |
| `card.expiryYear` | String | Evet | Son kullanma yılı (YYYY) |
| `card.holderName` | String | Evet | Kart sahibi adı |
| `metadata` | Object | Hayır | Kampanya bilgisi, özel etiketler |

### 4.2 Async poliçeleştirme (Web Satış için)

**Endpoint:** `POST /api/proposals/{ProposalId}/products/{ProposalProductId}/purchase/async`

Bu yöntem Web Satış Platformu için tasarlanmıştır ve kullanıcı yönlendirmesi gerektirir:

- 3D Secure doğrulaması
- Sigorta şirketi ödeme sayfasına yönlendirme

B2B entegrasyonlarında async endpoint kullanımı önerilmez.

### 4.3 Poliçeleştirme yanıtı

Başarılı bir sync poliçeleştirme sonucunda:

| Alan | Açıklama |
| --- | --- |
| `policyId` | Oluşturulan poliçe ID'si |
| `policyNumber` | Sigorta şirketi poliçe numarası |
| `status` | `PURCHASED` |

## 5. GraphQL ile veri sorgulama

Partner sistemler, müşteri, teklif ve poliçe verilerini GraphQL API üzerinden sorgulayabilir. GraphQL, karmaşık sorguları tek bir istekte yapmanıza ve sadece ihtiyacınız olan alanları almanıza olanak tanır.

**GraphQL Endpoint:** `POST /graphql`

**GraphQL Schema:** `GET /graphql/schema` (public, authentication gerektirmez)

### 5.1 Müşteri sorgulama

Acentenize ait müşterileri listelemek için `getCustomersNew` sorgusu kullanılır.

```graphql
query GetCustomers($first: Int, $after: String) {
  getCustomersNew(first: $first, after: $after) {
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        name
        identityNumber
        primaryEmail
        primaryPhoneNumber
        city
        district
        birthDate
        type
        agentBranch {
          id
          name
        }
      }
    }
  }
}
```

**Örnek Koddur:** Bu sorgu örnek amaçlıdır. Entegrasyon aşamasında güncel GraphQL şeması için InsurUp teknik ekibiyle iletişime geçin veya `/graphql/schema` endpoint'inden şemayı alın.

### 5.2 Teklif sorgulama

Oluşturulan teklifleri listelemek için `getProposalsNew` sorgusu kullanılır.

```graphql
query GetProposals($first: Int, $filter: ProposalFilterInput) {
  getProposalsNew(first: $first, filter: $filter) {
    totalCount
    edges {
      node {
        id
        state
        productBranch
        channel
        createdAt
        insuredCustomerName
        insuredCustomerIdentityNumber
        lowestPremium
        highestPremium
        successRate
        productsCount
        succeedProductsCount
        vehiclePlate
        vehicleModelName
        agentBranch {
          id
          name
        }
      }
    }
  }
}
```

**Örnek Koddur:** Sorgu alanları ve filtre seçenekleri değişiklik gösterebilir. Güncel şema için `/graphql/schema` endpoint'ini kontrol edin.

### 5.3 Poliçe sorgulama

Kesilmiş poliçeleri listelemek için `getPoliciesNew` sorgusu kullanılır.

```graphql
query GetPolicies($first: Int, $filter: PolicyFilterInput) {
  getPoliciesNew(first: $first, filter: $filter) {
    totalCount
    edges {
      node {
        id
        state
        productBranch
        insuranceCompanyName
        insuranceCompanyPolicyNumber
        productName
        grossPremium
        netPremium
        commission
        startDate
        endDate
        arrangementDate
        insuredCustomerName
        insuredCustomerIdentityNumber
        vehiclePlate
        agentBranch {
          id
          name
        }
      }
    }
  }
}
```

**Örnek Koddur:** Poliçe alanları sigorta branşına göre farklılık gösterebilir. Entegrasyon öncesi şema doğrulaması yapın.

### 5.4 GraphQL kullanım notları

- **Pagination:** Cursor-based pagination desteklenir (`first`, `after`, `last`, `before`)
- **Filtering:** Her sorgu için `filter` parametresi ile filtreleme yapılabilir
- **Sorting:** `orderBy` parametresi ile sıralama yapılabilir
- **Authentication:** GraphQL endpoint'i Bearer token ile korunur

## 6. Acente ve şube tanımlayıcıları

Teklif ve poliçe işlemlerinde doğru acente/şube atanması kritik öneme sahiptir. Üretim yapısına göre farklı parametreler gereklidir.

### 6.1 Doğrudan acenteye üretim

Eğer poliçe doğrudan ana acenteye üretilecekse, yalnızca `agentId` parametresi yeterlidir.

| Parametre | Tip | Zorunlu | Açıklama |
| --- | --- | --- | --- |
| `agentId` | Guid | Evet | InsurUp tarafından sağlanan acente organizasyon kimliği |

### 6.2 Şube veya partner üzerinden üretim

Eğer poliçe bir şube, alt acente veya partner üzerinden üretilecekse, `agentId`'ye ek olarak `agentBranchId` parametresi de gönderilmelidir.

| Parametre | Tip | Zorunlu | Açıklama |
| --- | --- | --- | --- |
| `agentId` | Guid | Evet | Ana acente organizasyon kimliği |
| `agentBranchId` | String | Evet* | Şube veya partner kimliği |

*Şube/partner yapısı kullanılıyorsa zorunludur.

### 6.3 Ne zaman hangisi kullanılır?

| Senaryo | agentId | agentBranchId |
| --- | --- | --- |
| Tek acenteli yapı, şube yok | Gerekli | Gerekli değil |
| Ana acente adına üretim | Gerekli | Gerekli değil |
| Şube adına üretim | Gerekli | Gerekli |
| Partner/alt acente adına üretim | Gerekli | Gerekli |

Bu parametreler; müşteri oluşturma (`/api/customers`) ve teklif oluşturma (`/api/proposals`) endpoint'lerinde kullanılır.

## 7. Webhook entegrasyonu

Poliçe durumu değişikliklerinden haberdar olmak için webhook entegrasyonu yapabilirsiniz. Detaylar için [Webhook API Entegrasyonu](/entegrasyon/webhook-api-entegrasyonu) dökümanına bakın.

## 8. Gerçek zamanlı bildirimler (SignalR)

Teklif sonuçlarını gerçek zamanlı almak için SignalR bağlantısı kurabilirsiniz. Ancak B2B entegrasyonlarında genellikle polling veya webhook yöntemi tercih edilir.

## 9. Hata yönetimi

API hata yanıtları standart HTTP durum kodları ile döner. `detail` ve `suggestions` alanları kullanıcıya gösterilebilir niteliktedir.

| HTTP Kodu | Açıklama | Önerilen Aksiyon |
| --- | --- | --- |
| `400` | İstek formatı hatalı | İstek parametrelerini kontrol edin |
| `401` | Token geçersiz veya süresi dolmuş | Yeni token alın |
| `403` | Yetki yok | İzinlerinizi kontrol edin |
| `404` | Kaynak bulunamadı | ID'leri kontrol edin |
| `422` | İş kuralı hatası | Hata mesajını inceleyin |
| `429` | Rate limit aşıldı | `Retry-After` header'ına göre bekleyin |
| `5xx` | Sunucu hatası | Exponential backoff ile retry |

## 10. Güvenlik önerileri

- Client secret değerini güvenli ortamda saklayın (environment variable, secret manager)
- Client secret'ı kaynak kodunda veya log dosyalarında tutmayın
- Tüm API çağrıları HTTPS üzerinden yapılmalıdır
- Token'ları güvenli şekilde saklayın ve yönetin
- Kart bilgilerini sisteminizde saklamayın

## 11. Test ortamı

Test entegrasyonu için [Mobil Entegrasyon Rehberi - Test Ortamı](/entegrasyon/mobil-projeler-icin-web-satis-platformu-entegrasyonu#10-test-ortamı) bölümündeki test verilerini kullanabilirsiniz.

---

Bu döküman B2B entegrasyonunun temel farklılıklarını kapsar. Ortak API akışları için ilgili entegrasyon rehberlerine başvurun. API endpoint detayları için [api.insurup.com/scalar](https://api.insurup.com/scalar) adresini kullanın. Entegrasyon sırasında oluşacak sorular için InsurUp teknik ekibiyle iletişime geçebilirsiniz.
