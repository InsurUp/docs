---
title: "InsurUp CRM Liste Ekranları — GraphQL Entegrasyon Rehberi"
sidebar_position: 10
slug: /entegrasyon/graphql-crm-liste-entegrasyonu
---

# InsurUp CRM Liste Ekranları — GraphQL Entegrasyon Rehberi

Bu doküman, InsurUp Agent Panel’deki aşağıdaki liste ekranlarına karşılık gelen GraphQL API’sini harici CRM sistemlerine entegre etmek için hazırlanmıştır:

| Agent Panel ekranı | URL |
|--------------------|-----|
| Müşteriler | `https://app.insurup.com/customers` |
| Vakalar | `https://app.insurup.com/cases` |
| Teklifler | `https://app.insurup.com/proposals` |
| Poliçeler | `https://app.insurup.com/policies` |

**İlgili dokümanlar:**

- HTML sürüm (tarayıcı): `graphql-crm-list-integration.html`
- Kimlik doğrulama ve OAuth: `login-with-insurup-integration.md`
- Güvenlik ve izinler: `standards/12-security-and-secrets.md`

---

## 1. Genel bakış

InsurUp’da **liste ve arama** işlemleri REST ile değil **GraphQL** üzerinden yapılır. Agent Panel (`app.insurup.com`) bu sorguları doğrudan Web API’ye gönderir.

| Kaynak | URL | Açıklama |
|--------|-----|----------|
| GraphQL endpoint | `POST https://api.insurup.com/graphql` | Liste, filtre, arama, sayfalama |
| GraphQL şema (SDL) | `GET https://api.insurup.com/graphql/schema` | Anonim erişilebilir şema dosyası |
| Tek kayıt detayı | REST | Örn. `GET /customers/{id}`, `GET /proposals/{id}` |

```http
POST https://api.insurup.com/graphql
Authorization: Bearer {access_token}
Content-Type: application/json
```

```json
{
  "query": "...",
  "variables": { }
}
```

---

## 2. Kimlik doğrulama ve yetkilendirme

### 2.1 Token

- Her istekte **giriş yapmış agent kullanıcısının** `access_token` değeri kullanılmalıdır.
- Tek bir servis hesabı token’ı ile tüm personel adına istek atılmamalıdır (audit ve yetki kaybı).
- Detay: `login-with-insurup-integration.md`

### 2.2 OAuth scope (token seviyesi)

Harici OAuth client için granular scope’lar:

| Ekran / veri | Okuma scope’u |
|--------------|---------------|
| Müşteriler | `customer:read` |
| Teklifler | `proposal:read` |
| Poliçeler | `policy:read` |
| Vakalar | `case:read` |
| Profil | `me:read` |

Tam CRM senkronu için InsurUp’un Agent Panel ile aynı **`core-api`** scope’unu client’a tanımlaması gerekebilir.

**Örnek granular scope listesi (authorize / token):**

```text
openid profile email offline_access customer:read proposal:read policy:read case:read me:read
```

**Örnek tam erişim:**

```text
openid profile email offline_access core-api
```

Kaynak: `InsurUpApiScopes` (`src/Packages/InsurUp.Api.Contracts/src/InsurUpApiScopes.cs`)

### 2.3 Agent rol izinleri (veri seviyesi)

GraphQL yalnızca kimlik doğrulama yapmaz; MongoDB sorguları **agent rol izinleri** ve **permission scope** ile filtrelenir:

| Permission | Açıklama |
|------------|----------|
| `customers:read` | Müşteri listesi |
| `cases:read` | Vaka listesi |
| `proposals:read` | Teklif listesi |
| `policies:read` | Poliçe listesi |

Her izin şu kapsamlardan birine bağlanabilir:

- **All** — acentedeki tüm kayıtlar
- **Own** — yalnızca kullanıcının oluşturduğu / temsil ettiği kayıtlar
- **Branch** — şube kapsamındaki kayıtlar

Agent **owner** ise tüm veriye erişir.

Kaynak: `AgentUserPermissions` (`src/Common/Permissions/.../AgentUserPermissions.cs`)

### 2.4 PII maskeleme

Kimlik numarası, e-posta, telefon, plaka, poliçe numarası gibi alanlar acente **mask** ayarına göre kısmen gizlenebilir (`AgentBasedMask`, `MaskedRedact`). Entegrasyonda ham değer bekleniyorsa acente mask konfigürasyonunu kontrol edin.

### 2.5 Hata kodları

| HTTP | Anlam |
|------|-------|
| `401` | Token geçersiz veya süresi dolmuş |
| `403` | Scope veya rol izni yetersiz |
| `404` | Kayıt yok veya kullanıcının scope’u dışında (filtrelenmiş) |

---

## 3. Sorgu adları ve kod eşlemesi

HotChocolate, C# metot adlarını camelCase GraphQL alanına çevirir. Agent Panel **yeni (`*New`)** sorguları kullanır.

| Agent Panel `GraphQLResource` | C# metot | GraphQL root field | Model tipi |
|-------------------------------|----------|-------------------|------------|
| `customersNew` | `GetCustomersNew` | `customersNew` | `QueryCustomerModel` |
| `casesNew` | `GetCasesNew` | `casesNew` | `QueryCaseModel` |
| `proposalsNew` | `GetProposalsNew` | `proposalsNew` | `QueryProposalsResult` |
| `policiesNew` | `GetPoliciesNew` | `policiesNew` | `QueryPoliciesResult` |
| `policiesExpanded` | `GetPoliciesExpanded` | `policiesExpanded` | `QueryPoliciesExpandedResult` |

**Eski sorgular** (offset paging): `customers`, `cases`, `proposals`, `policies` — yeni entegrasyonlarda kullanılmamalı.

Kaynak dosyalar:

- `CustomerQuery.cs`
- `CaseQuery.cs`
- `ProposalQuery.cs`
- `PolicyQuery.cs`

---

## 4. Ortak sorgu parametreleri

Tüm `*New` sorguları **cursor pagination** ve aynı filtre/arama sözlüğünü destekler:

| Parametre | Açıklama |
|-----------|----------|
| `first` | Sayfa boyutu |
| `after` | Sonraki sayfa cursor’ı (`pageInfo.endCursor`) |
| `filter` | Alan bazlı filtre (`eq`, `contains`, `gte`, `in`, …) |
| `search` | Atlas Search (`autocomplete`, `or`, …) |
| `order` | Sıralama (ör. `createdAt: DESC`, `searchScore: DESC`) |

**Dönüş yapısı:**

```graphql
{
  totalCount
  pageInfo {
    hasNextPage
    endCursor
  }
  nodes {
    # seçilen alanlar
  }
}
```

**Filter input tipleri (şemada):**

- `QueryCustomerModelFilterInput`
- `QueryCaseModelFilterInput`
- `QueryProposalsResultFilterInput`
- `QueryPoliciesResultFilterInput`

Şemayı indirmek için:

```bash
curl -s https://api.insurup.com/graphql/schema -o insurup-schema.graphql
```

---

## 5. Müşteriler (`customersNew`)

### 5.1 Yetki

| Katman | Gereksinim |
|--------|------------|
| OAuth | `customer:read` veya `core-api` |
| Rol | `customers:read` |

### 5.2 Kullanılabilir alanlar

| Alan | Tip | Not |
|------|-----|-----|
| `id` | UUID | |
| `name` | String | Arama / sıralama |
| `type` | CustomerType | |
| `identityNumber` | String | Bireysel / yabancı |
| `taxNumber` | String | Kurumsal |
| `primaryEmail` | String | |
| `primaryPhoneNumber` | String | |
| `primaryPhoneNumberCountryCode` | Int | |
| `cityText`, `cityValue` | String | |
| `districtText`, `districtValue` | String | |
| `createdAt` | DateTime | Varsayılan sıralama |
| `creationChannel` | Channel | |
| `birthDate` | Date | |
| `gender`, `educationStatus`, `nationality`, `maritalStatus`, `job` | Enum | |
| `passportNumber` | String | |
| `agentBranchId` | String | |
| `agentBranch` | Object | `id`, `name`, `parentId`, `parentName` |
| `consents` | List | `consentType`, `isActive` |
| `emailCount`, `phoneCount` | Int | |
| `vehicleCount`, `propertyCount` | Int | Resolver (ek sorgu) |
| `proposalCount`, `policyCount`, `caseCount` | Int | Resolver |
| `searchScore` | Float | Yalnızca `search` aktifken |

### 5.3 Örnek sorgu — liste

```graphql
query CustomersList(
  $first: Int!
  $after: String
  $filter: QueryCustomerModelFilterInput
  $search: QueryCustomerModelSearchInput
  $order: [QueryCustomerModelSortInput!]
) {
  customersNew(
    first: $first
    after: $after
    filter: $filter
    search: $search
    order: $order
  ) {
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      name
      type
      identityNumber
      taxNumber
      primaryEmail
      primaryPhoneNumber
      primaryPhoneNumberCountryCode
      cityText
      districtText
      createdAt
      creationChannel
      birthDate
      gender
      educationStatus
      nationality
      maritalStatus
      job
      passportNumber
      agentBranchId
      agentBranch {
        id
        name
        parentId
        parentName
      }
      consents {
        consentType
        isActive
      }
      emailCount
      phoneCount
      vehicleCount
      propertyCount
      proposalCount
      policyCount
      caseCount
      searchScore
    }
  }
}
```

### 5.4 Örnek variables — filtre

```json
{
  "first": 50,
  "filter": {
    "name": { "contains": "Mehmet" }
  },
  "order": [{ "createdAt": "DESC" }]
}
```

### 5.5 Örnek variables — autocomplete arama

Agent Panel ile uyumlu arama:

```json
{
  "first": 20,
  "search": {
    "or": [
      { "name": { "autocomplete": { "value": "ahmet", "score": { "boost": 3.0 } } } },
      { "identityNumber": { "autocomplete": { "value": "ahmet" } } },
      { "taxNumber": { "autocomplete": { "value": "ahmet" } } },
      { "primaryEmail": { "autocomplete": { "value": "ahmet" } } },
      { "primaryPhoneNumber": { "autocomplete": { "value": "ahmet" } } }
    ]
  },
  "order": [{ "searchScore": "DESC" }]
}
```

### 5.6 Tek kayıt — REST

```http
GET https://api.insurup.com/customers/{customerId}
Authorization: Bearer {access_token}
```

Scope: `customer:read`

---

## 6. Vakalar (`casesNew`)

### 6.1 Yetki

| Katman | Gereksinim |
|--------|------------|
| OAuth | `case:read` veya `core-api` |
| Rol | `cases:read` |

### 6.2 Kullanılabilir alanlar (özet)

| Grup | Alanlar |
|------|---------|
| Vaka | `id`, `ref`, `type`, `status`, `mainState`, `subState`, `productBranch`, `channel`, `createdAt` |
| Alt tipler | `cancelSubType`, `saleOpportunitySubType`, `endorsementSubType`, `complaintSubType` |
| Kullanıcı | `createdByName`, `createdById`, `createdByEmail`, `createdByType` |
| Temsil | `representedByName`, `representedById`, `representedByEmail`, `representedByType` |
| İlişki | `policyCount`, `proposalCount`, `lastProposalDate`, `lastPolicyDate`, `policyEndDate` |
| Güncelleme | `lastUpdateDate`, `lastUpdatedByName`, `lastUpdatedById`, … |
| Öncelik | `priorityScore`, `priorityRuleHits` (`ruleName`, `score`, `label`, `description`) |
| Müşteri | `customerId`, `customerName`, `customerType`, `customerIdentity`, iletişim ve adres alanları |
| Araç | `vehiclePlateCode`, `vehicleModelBrandText`, `vehicleChassisNumber`, … |
| Konut | `propertyNumber`, `propertySquareMeter`, `propertyDaskPolicyNumber`, … |
| Diğer | `assetType`, `assetId`, `sourceCaseId`, `advertisingSource`, `advertisingCampaign`, `agentBranch` |

### 6.3 Örnek sorgu — liste

```graphql
query CasesList(
  $first: Int!
  $after: String
  $filter: QueryCaseModelFilterInput
  $search: QueryCaseModelSearchInput
  $order: [QueryCaseModelSortInput!]
) {
  casesNew(
    first: $first
    after: $after
    filter: $filter
    search: $search
    order: $order
  ) {
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      ref
      type
      status
      cancelSubType
      saleOpportunitySubType
      endorsementSubType
      complaintSubType
      mainState
      subState
      productBranch
      channel
      createdAt
      createdByName
      createdById
      createdByEmail
      createdByType
      representedByName
      representedById
      representedByEmail
      representedByType
      policyEndDate
      assetType
      assetId
      sourceCaseId
      policyCount
      proposalCount
      lastProposalDate
      lastPolicyDate
      lastUpdateDate
      lastUpdatedByName
      lastUpdatedById
      lastUpdatedByEmail
      lastUpdatedByType
      priorityScore
      priorityRuleHits {
        ruleName
        score
        label
        description
      }
      customerId
      customerName
      customerType
      customerIdentity
      customerCityText
      customerCityValue
      customerDistrictText
      customerDistrictValue
      customerPrimaryPhoneNumber
      customerPrimaryPhoneCountryCode
      customerPrimaryEmail
      customerBirthDate
      customerPassportNumber
      customerJob
      vehiclePlateCode
      vehiclePlateCity
      vehicleModelBrandText
      vehicleModelBrandValue
      vehicleModelTypeText
      vehicleModelTypeValue
      vehicleModelYear
      vehicleUtilizationStyle
      vehicleEngineNumber
      vehicleChassisNumber
      vehicleRegistrationDate
      vehicleFuelType
      vehicleSeatNumber
      vehicleDocumentSerialCode
      vehicleDocumentSerialNumber
      propertyNumber
      propertySquareMeter
      propertyConstructionYear
      propertyDamageStatus
      propertyFloorNumber
      propertyStructure
      propertyUtilizationStyle
      propertyOwnershipType
      propertyDaskPolicyNumber
      advertisingSource
      advertisingCampaign
      agentBranchId
      agentBranch {
        id
        name
        parentId
        parentName
      }
      searchScore
    }
  }
}
```

### 6.4 Örnek variables

```json
{
  "first": 50,
  "order": [{ "createdAt": "DESC" }]
}
```

---

## 7. Teklifler (`proposalsNew`)

### 7.1 Yetki

| Katman | Gereksinim |
|--------|------------|
| OAuth | `proposal:read` veya `core-api` |
| Rol | `proposals:read` |

### 7.2 Kullanılabilir alanlar (özet)

| Alan | Açıklama |
|------|----------|
| `id` | Teklif ID (ObjectId string) |
| `productBranch`, `state`, `channel` | |
| `insurerCustomerId`, `insuredCustomerId` | |
| `productsCount`, `succeedProductsCount`, `successRate` | |
| `createdAt`, `agentUserCreatedBy` | |
| `lowestPremium`, `highestPremium` | |
| `insuredCustomerName`, `insuredCustomerIdentityNumber`, `insuredCustomerTaxNumber` | |
| Sigortalı iletişim / adres | `insuredCustomerCityText`, `insuredCustomerPhoneNumber`, `insuredCustomerEmail`, … |
| Araç | `vehiclePlateCode`, `vehicleModelBrandText`, `vehicleId`, … |
| Konut | `propertyId` |
| Şube | `agentBranchId`, `agentBranch` |

### 7.3 Örnek sorgu — liste

```graphql
query ProposalsList(
  $first: Int!
  $after: String
  $filter: QueryProposalsResultFilterInput
  $search: QueryProposalsResultSearchInput
  $order: [QueryProposalsResultSortInput!]
) {
  proposalsNew(
    first: $first
    after: $after
    filter: $filter
    search: $search
    order: $order
  ) {
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      productBranch
      state
      insurerCustomerId
      insuredCustomerId
      productsCount
      succeedProductsCount
      createdAt
      agentUserCreatedBy {
        id
        name
        email
      }
      successRate
      insuredCustomerName
      insuredCustomerIdentityNumber
      insuredCustomerTaxNumber
      insuredCustomerType
      lowestPremium
      highestPremium
      channel
      insuredCustomerCityText
      insuredCustomerCityValue
      insuredCustomerDistrictText
      insuredCustomerDistrictValue
      insuredCustomerPhoneNumber
      insuredCustomerPhoneNumberCountryCode
      insuredCustomerEmail
      vehiclePlateCode
      vehiclePlateCity
      vehicleDocumentSerialCode
      vehicleDocumentSerialNumber
      vehicleModelBrandText
      vehicleModelBrandValue
      vehicleModelTypeText
      vehicleModelTypeValue
      vehicleModelYear
      vehicleFuelType
      utilizationStyle
      insuredCustomerBirthDate
      vehicleId
      propertyId
      agentBranchId
      agentBranch {
        id
        name
        parentId
        parentName
      }
    }
  }
}
```

### 7.4 Örnek variables

```json
{
  "first": 20,
  "order": [{ "createdAt": "DESC" }]
}
```

### 7.5 Tek kayıt — REST

```http
GET https://api.insurup.com/proposals/{proposalId}
GET https://api.insurup.com/proposals/{proposalId}/products
Authorization: Bearer {access_token}
```

Scope: `proposal:read`

---

## 8. Poliçeler (`policiesNew` / `policiesExpanded`)

### 8.1 Yetki

| Katman | Gereksinim |
|--------|------------|
| OAuth | `policy:read` veya `core-api` |
| Rol | `policies:read` |

### 8.2 `policiesNew` vs `policiesExpanded`

| Sorgu | Kullanım |
|-------|----------|
| `policiesNew` | Varsayılan liste — poliçe başına bir satır |
| `policiesExpanded` | Zeyil satırları açılmış görünüm (`$unwind` Versions) |

`policiesExpanded` ek alanlar: `netPremiumChange`, `grossPremiumChange`, `commissionChange`

### 8.3 Kullanılabilir alanlar (özet)

| Grup | Alanlar |
|------|---------|
| Poliçe | `id`, `state`, `productBranch`, `channel`, `campaign` |
| Prim | `netPremium`, `grossPremium`, `commission`, `*TL`, `currency`, `exchangeRate`, `paymentType`, `installmentNumber` |
| Tarih | `createdAt`, `startDate`, `endDate`, `arrangementDate` |
| Şirket | `insuranceCompanyId`, `insuranceCompanyName`, `insuranceCompanyLogo`, `productId`, `productName` |
| Numaralar | `insuranceCompanyProposalNumber`, `insuranceCompanyPolicyNumber`, `renewalNumber`, `endorsementNumber`, `endorsementType`, `updateReasonText`, `endorsementTimestamp` |
| Sigortalı / sigorta ettiren | İsim, kimlik, vergi, şehir, ilçe, doğum tarihi alanları |
| Araç / konut | Plaka, model, `vehicleId`, `propertyId`, `daskPolicyNumber`, … |
| Kullanıcı | `createdBy`, `representedBy` |
| Şube | `agentBranchId`, `agentBranch` |

### 8.4 Örnek sorgu — `policiesNew`

```graphql
query PoliciesList(
  $first: Int!
  $after: String
  $filter: QueryPoliciesResultFilterInput
  $search: QueryPoliciesResultSearchInput
  $order: [QueryPoliciesResultSortInput!]
) {
  policiesNew(
    first: $first
    after: $after
    filter: $filter
    search: $search
    order: $order
  ) {
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      id
      insurerCustomerId
      insuredCustomerId
      installmentNumber
      productBranch
      netPremium
      grossPremium
      commission
      paymentType
      currency
      exchangeRate
      netPremiumTL
      grossPremiumTL
      commissionTL
      insuranceCompanyProposalNumber
      insuranceCompanyPolicyNumber
      renewalNumber
      endorsementNumber
      endorsementType
      updateReasonText
      endorsementTimestamp
      createdAt
      startDate
      endDate
      arrangementDate
      state
      insuredCustomerName
      insuredCustomerIdentityNumber
      insuredCustomerTaxNumber
      insuredCustomerType
      insuredCustomerCityText
      insuredCustomerCityValue
      insuredCustomerDistrictText
      insuredCustomerDistrictValue
      insuredCustomerBirthDate
      insurerCustomerName
      insurerCustomerIdentityNumber
      insurerCustomerTaxNumber
      insurerCustomerCityText
      insurerCustomerCityValue
      insurerCustomerDistrictText
      insurerCustomerDistrictValue
      insurerCustomerBirthDate
      vehiclePlateCode
      vehiclePlateCity
      vehicleDocumentSerialCode
      vehicleDocumentSerialNumber
      vehicleModelBrandText
      vehicleModelBrandValue
      vehicleModelTypeText
      vehicleModelTypeValue
      vehicleModelYear
      vehicleFuelType
      productId
      productName
      insuranceCompanyId
      insuranceCompanyName
      insuranceCompanyLogo
      createdBy {
        id
        name
        email
      }
      representedBy {
        id
        name
        email
      }
      propertyNumber
      daskOldPolicyNumber
      daskPolicyNumber
      vehicleId
      propertyId
      channel
      campaign
      agentBranchId
      agentBranch {
        id
        name
        parentId
        parentName
      }
    }
  }
}
```

### 8.5 Örnek variables

```json
{
  "first": 50,
  "order": [{ "createdAt": "DESC" }]
}
```

### 8.6 Tek kayıt — REST

```http
GET https://api.insurup.com/policies/{policyId}
GET https://api.insurup.com/policies/{policyId}/document
Authorization: Bearer {access_token}
```

Scope: `policy:read`

---

## 9. REST vs GraphQL özeti

| Ekran | Liste / arama (CRM senkron) | Detay / yazma |
|-------|----------------------------|---------------|
| Müşteriler | `customersNew` | `POST/GET/PUT/DELETE /customers` |
| Vakalar | `casesNew` | Case REST uçları |
| Teklifler | `proposalsNew` | `POST/GET /proposals`, ürünler |
| Poliçeler | `policiesNew` veya `policiesExpanded` | `GET /policies`, manuel poliçe |

---

## 10. Önerilen entegrasyon akışı

```text
1. Login with InsurUp (OIDC + PKCE) → personel access_token
2. GET /agent-users/me → rol ve permission listesi (kendi CRM UI yetkilendirmesi)
3. Periyodik veya sayfalı GraphQL çekimi:
   - customersNew / casesNew / proposalsNew / policiesNew
   - after cursor ile tüm sayfalar
4. Detay ihtiyacında REST GET (tek kayıt, ürünler, belge)
5. Token süresi dolunca refresh_token
6. Yazma işlemleri REST + ilgili write scope (customer:write, …)
```

---

## 11. Referanslar

| Kaynak | Konum |
|--------|--------|
| OAuth ve token | `docs/login-with-insurup-integration.md` |
| OAuth scope sabitleri | `src/Packages/InsurUp.Api.Contracts/src/InsurUpApiScopes.cs` |
| Agent izinleri | `src/Common/Permissions/.../AgentUserPermissions.cs` |
| GraphQL sorguları | `src/Modules/*/Application/GraphQL/Queries/*Query.cs` |
| GraphQL modelleri | `src/Modules/*/*.GraphQLModels/` |
| Agent Panel grid kaynakları | `InsurUp.Apps.AgentPanel` — `CustomersPage.razor`, `CaseGrid.razor`, `ProposalGrid.razor`, `PolicyGrid.razor` |
| Tablo entegrasyon demosu | https://github.com/InsurUp/ts-toolkit/tree/main/packages/table-adapter-core/demos/vanilla/ts |

---

## 12. Kontrol listesi

- [ ] OAuth client oluşturuldu; gerekli scope’lar tanımlı (`customer:read`, `proposal:read`, `policy:read`, `case:read` veya `core-api`)
- [ ] Login with InsurUp implemente edildi; token personel session’ında
- [ ] `POST https://api.insurup.com/graphql` ile dört liste sorgusu test edildi
- [ ] Sayfalama (`first` + `after`) ile tam veri çekimi doğrulandı
- [ ] Rol izinleri (`customers:read`, …) ve scope (All/Own/Branch) beklentiyle uyumlu
- [ ] PII maskeleme davranışı anlaşıldı
- [ ] Detay senkronu için REST uçları dokümante edildi
- [ ] Üretim şeması: `GET /graphql/schema` ile güncel alan listesi alındı
