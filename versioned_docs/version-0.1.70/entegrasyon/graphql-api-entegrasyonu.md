---
title: GraphQL API Entegrasyonu
sidebar_position: 2
slug: /entegrasyon/graphql-api-entegrasyonu
---

# GraphQL API Entegrasyonu

InsurUp GraphQL API'si, sisteminizle programatik olarak etkileşim kurmanızı sağlayan güçlü bir arayüzdür. Bu API ile müşteri bilgileri, teklifler, poliçeler ve diğer verileri sorgulayabilir ve yönetebilirsiniz.

## Genel Bilgiler

- **Base URL**: `https://api.insurup.com/graphql`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (Header: `Authorization: Bearer <token>`)

## API Endpoints

### Müşteri Listesi (Customers)

Müşteri bilgilerini sorgulamak için kullanılan endpoint.

#### Request

**URL**: `https://api.insurup.com/graphql`  
**Method**: `POST`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <your-token>
```

**Request Body**:
```json
{
  "query": "query { customers(skip: 0 take: 10 where: {} ){totalCount items{id name identity type identity primaryEmail primaryPhoneNumber{number countryCode } passportNumber createdAt gender city{text value } district{text value } nationality birthDate educationStatus maritalStatus job }}}"
}
```

#### Response

**Başarılı Yanıt (200 OK)**:
```json
{
  "data": {
    "customers": {
      "totalCount": 150,
      "items": [
        {
          "id": "customer-id-123",
          "name": "Ahmet Yılmaz",
          "identity": "12345678901",
          "type": "individual",
          "primaryEmail": "ahmet@example.com",
          "primaryPhoneNumber": {
            "number": "5551234567",
            "countryCode": 90
          },
          "passportNumber": null,
          "createdAt": "2024-01-15T10:30:00Z",
          "gender": "Male",
          "city": {
            "text": "İSTANBUL",
            "value": "34"
          },
          "district": {
            "text": "KADIKÖY",
            "value": "1234"
          },
          "nationality": "Turkish",
          "birthDate": "1990-05-15",
          "educationStatus": "University",
          "maritalStatus": "Single",
          "job": "Software Developer"
        }
      ]
    }
  }
}
```

#### Parametreler

| Parametre | Tip | Açıklama | Zorunlu |
|-----------|-----|----------|---------|
| `skip` | Integer | Atlanacak kayıt sayısı (pagination için) | Hayır |
| `take` | Integer | Getirilecek kayıt sayısı (max: 100) | Hayır |
| `where` | Object | Filtreleme kriterleri | Hayır |

#### Filtreleme Örnekleri

**Tarih Aralığı Filtresi**:
```json
{
  "query": "query { customers(skip: 0 take: 10 where: { createdAt: { gte: \"2024-01-01\", lte: \"2024-12-31\" } } ){totalCount items{id name identity createdAt}}}"
}
```

**Şehir Filtresi**:
```json
{
  "query": "query { customers(skip: 0 take: 10 where: { city: { value: \"34\" } } ){totalCount items{id name city{text value}}}}"
}
```

**Müşteri Tipi Filtresi**:
```json
{
  "query": "query { customers(skip: 0 take: 10 where: { type: \"individual\" } ){totalCount items{id name type}}}"
}
```

#### Hata Yanıtları

**401 Unauthorized**:
```json
{
  "errors": [
    {
      "message": "Unauthorized access",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

**400 Bad Request**:
```json
{
  "errors": [
    {
      "message": "Invalid query syntax",
      "extensions": {
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

### Talep Listesi (Cases)

Talep bilgilerini sorgulamak için kullanılan endpoint.

#### Request

**URL**: `https://api.insurup.com/graphql`  
**Method**: `POST`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <your-token>
```

**Request Body**:
```json
{
  "query": "query { cases(skip: 0 take: 10 where: {} order: {createdAt: DESC}){totalCount items{id ref status subState type cancelSubType saleOpportunitySubType endorsementSubType complaintSubType priorityScore priorityRuleHits{ruleName score label description } customerName customerType assetType assetId vehiclePlateCode vehiclePlateCity propertyNumber mainState productBranch channel representedBy{name id } policyEndDate createdBy{name id } createdAt lastUpdatedBy{name id } lastUpdateDate customerIdentity customerCityText customerDistrictText customerBirthDate vehicleDocumentSerialCode vehicleDocumentSerialNumber vehicleModelBrandText vehicleModelTypeText vehicleModelYear vehicleEngineNumber vehicleChassisNumber vehicleRegistrationDate vehicleSeatNumber propertySquareMeter propertyConstructionYear propertyFloorNumber advertisingSource advertisingCampaign }}}"
}
```

#### Response

**Başarılı Yanıt (200 OK)**:
```json
{
  "data": {
    "cases": {
      "totalCount": 250,
      "items": [
        {
          "id": "case-id-123",
          "ref": "TALEP-2024-001",
          "status": "Active",
          "subState": "InProgress",
          "type": "Complaint",
          "cancelSubType": null,
          "saleOpportunitySubType": null,
          "endorsementSubType": null,
          "complaintSubType": "Service",
          "priorityScore": 85,
          "priorityRuleHits": [
            {
              "ruleName": "High Priority Customer",
              "score": 85,
              "label": "VIP",
              "description": "Premium müşteri önceliği"
            }
          ],
          "customerName": "Ahmet Yılmaz",
          "customerType": "Individual",
          "assetType": "Vehicle",
          "assetId": "asset-123",
          "vehiclePlateCode": "34ABC123",
          "vehiclePlateCity": "İstanbul",
          "propertyNumber": null,
          "mainState": "Open",
          "productBranch": "Kasko",
          "channel": "Online",
          "representedBy": {
            "name": "Mehmet Özkan",
            "id": "user-456"
          },
          "policyEndDate": "2024-12-31",
          "createdBy": {
            "name": "Sistem",
            "id": "system"
          },
          "createdAt": "2024-01-15T10:30:00Z",
          "lastUpdatedBy": {
            "name": "Mehmet Özkan",
            "id": "user-456"
          },
          "lastUpdateDate": "2024-01-16T14:20:00Z",
          "customerIdentity": "12345678901",
          "customerCityText": "İstanbul",
          "customerDistrictText": "Kadıköy",
          "customerBirthDate": "1990-05-15",
          "vehicleDocumentSerialCode": "ABC123",
          "vehicleDocumentSerialNumber": "123456789",
          "vehicleModelBrandText": "Toyota",
          "vehicleModelTypeText": "Corolla",
          "vehicleModelYear": 2020,
          "vehicleEngineNumber": "ENG123456",
          "vehicleChassisNumber": "CHS123456",
          "vehicleRegistrationDate": "2020-03-15",
          "vehicleSeatNumber": 5,
          "propertySquareMeter": null,
          "propertyConstructionYear": null,
          "propertyFloorNumber": null,
          "advertisingSource": "Google Ads",
          "advertisingCampaign": "Kasko 2024"
        }
      ]
    }
  }
}
```

#### Parametreler

| Parametre | Tip | Açıklama | Zorunlu |
|-----------|-----|----------|---------|
| `skip` | Integer | Atlanacak kayıt sayısı (pagination için) | Hayır |
| `take` | Integer | Getirilecek kayıt sayısı (max: 100) | Hayır |
| `where` | Object | Filtreleme kriterleri | Hayır |
| `order` | Object | Sıralama kriterleri | Hayır |

#### Filtreleme Örnekleri

**Durum Filtresi**:
```json
{
  "query": "query { cases(skip: 0 take: 10 where: { status: \"Active\" } ){totalCount items{id ref status createdAt}}}"
}
```

**Tarih Aralığı Filtresi**:
```json
{
  "query": "query { cases(skip: 0 take: 10 where: { createdAt: { gte: \"2024-01-01\", lte: \"2024-12-31\" } } ){totalCount items{id ref createdAt}}}"
}
```

**Müşteri Tipi Filtresi**:
```json
{
  "query": "query { cases(skip: 0 take: 10 where: { customerType: \"Individual\" } ){totalCount items{id ref customerName customerType}}}"
}
```

**Ürün Branşı Filtresi**:
```json
{
  "query": "query { cases(skip: 0 take: 10 where: { productBranch: \"Kasko\" } ){totalCount items{id ref productBranch}}}"
}
```

**Öncelik Skoru Filtresi**:
```json
{
  "query": "query { cases(skip: 0 take: 10 where: { priorityScore: { gte: 80 } } ){totalCount items{id ref priorityScore}}}"
}
```

#### Sıralama Örnekleri

**Oluşturulma Tarihine Göre Azalan**:
```json
{
  "query": "query { cases(skip: 0 take: 10 order: { createdAt: DESC } ){totalCount items{id ref createdAt}}}"
}
```

**Öncelik Skoruna Göre Azalan**:
```json
{
  "query": "query { cases(skip: 0 take: 10 order: { priorityScore: DESC } ){totalCount items{id ref priorityScore}}}"
}
```

**Müşteri Adına Göre Artan**:
```json
{
  "query": "query { cases(skip: 0 take: 10 order: { customerName: ASC } ){totalCount items{id ref customerName}}}"
}
```

### Teklif Listesi (Proposals)

Teklif bilgilerini sorgulamak için kullanılan endpoint.

#### Request

**URL**: `https://api.insurup.com/graphql`  
**Method**: `POST`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <your-token>
```

**Request Body**:
```json
{
  "query": "query { proposals(skip: 0 take: 10 where: {} order: {createdAt: DESC}){totalCount items{id productBranch insuredCustomerName insuredCustomerIdentity insuredCustomerType state highestPremium lowestPremium successRate productsCount succeedProductsCount createdAt agentUserCreatedBy{id name } vehicleModel{brand{text value } year type{text value } } }}}"
}
```

#### Response

**Başarılı Yanıt (200 OK)**:
```json
{
  "data": {
    "proposals": {
      "totalCount": 500,
      "items": [
        {
          "id": "proposal-id-123",
          "productBranch": "Kasko",
          "insuredCustomerName": "Ahmet Yılmaz",
          "insuredCustomerIdentity": "12345678901",
          "insuredCustomerType": "Individual",
          "state": "Completed",
          "highestPremium": 2500.00,
          "lowestPremium": 1800.00,
          "successRate": 85.5,
          "productsCount": 3,
          "succeedProductsCount": 2,
          "createdAt": "2024-01-15T10:30:00Z",
          "agentUserCreatedBy": {
            "id": "agent-456",
            "name": "Mehmet Özkan"
          },
          "vehicleModel": {
            "brand": {
              "text": "Toyota",
              "value": "toyota"
            },
            "year": 2020,
            "type": {
              "text": "Corolla",
              "value": "corolla"
            }
          }
        }
      ]
    }
  }
}
```

#### Parametreler

| Parametre | Tip | Açıklama | Zorunlu |
|-----------|-----|----------|---------|
| `skip` | Integer | Atlanacak kayıt sayısı (pagination için) | Hayır |
| `take` | Integer | Getirilecek kayıt sayısı (max: 100) | Hayır |
| `where` | Object | Filtreleme kriterleri | Hayır |
| `order` | Object | Sıralama kriterleri | Hayır |

#### Filtreleme Örnekleri

**Durum Filtresi**:
```json
{
  "query": "query { proposals(skip: 0 take: 10 where: { state: \"Completed\" } ){totalCount items{id productBranch state createdAt}}}"
}
```

**Ürün Branşı Filtresi**:
```json
{
  "query": "query { proposals(skip: 0 take: 10 where: { productBranch: \"Kasko\" } ){totalCount items{id productBranch state}}}"
}
```

**Tarih Aralığı Filtresi**:
```json
{
  "query": "query { proposals(skip: 0 take: 10 where: { createdAt: { gte: \"2024-01-01\", lte: \"2024-12-31\" } } ){totalCount items{id createdAt}}}"
}
```

**Müşteri Tipi Filtresi**:
```json
{
  "query": "query { proposals(skip: 0 take: 10 where: { insuredCustomerType: \"Individual\" } ){totalCount items{id insuredCustomerName insuredCustomerType}}}"
}
```

**Başarı Oranı Filtresi**:
```json
{
  "query": "query { proposals(skip: 0 take: 10 where: { successRate: { gte: 80 } } ){totalCount items{id successRate}}}"
}
```

#### Sıralama Örnekleri

**Oluşturulma Tarihine Göre Azalan**:
```json
{
  "query": "query { proposals(skip: 0 take: 10 order: { createdAt: DESC } ){totalCount items{id createdAt}}}"
}
```

**Başarı Oranına Göre Azalan**:
```json
{
  "query": "query { proposals(skip: 0 take: 10 order: { successRate: DESC } ){totalCount items{id successRate}}}"
}
```

**En Yüksek Prima Göre Azalan**:
```json
{
  "query": "query { proposals(skip: 0 take: 10 order: { highestPremium: DESC } ){totalCount items{id highestPremium}}}"
}
```

### Poliçe Listesi (Policies)

Poliçe bilgilerini sorgulamak için kullanılan endpoint.

#### Request

**URL**: `https://api.insurup.com/graphql`  
**Method**: `POST`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <your-token>
```

**Request Body**:
```json
{
  "query": "query { policies(skip: 0 take: 10 where: {} order: {arrangementDate: DESC}){totalCount items{id state productBranch startDate endDate insuranceCompanyLogo insuranceCompanyPolicyNumber insuranceCompanyName productName grossPremium netPremium insuredCustomerName insuredCustomerIdentity insuredCustomerType arrangementDate createdAt createdBy{name id } representedBy{name id } channel vehicleModel{brand{text value } year type{text value } } }}}"
}
```

#### Response

**Başarılı Yanıt (200 OK)**:
```json
{
  "data": {
    "policies": {
      "totalCount": 750,
      "items": [
        {
          "id": "policy-id-123",
          "state": "Active",
          "productBranch": "Kasko",
          "startDate": "2024-01-01",
          "endDate": "2025-01-01",
          "insuranceCompanyLogo": "https://example.com/logo.png",
          "insuranceCompanyPolicyNumber": "POL-2024-001",
          "insuranceCompanyName": "ABC Sigorta",
          "productName": "Kasko Plus",
          "grossPremium": 2500.00,
          "netPremium": 2000.00,
          "insuredCustomerName": "Ahmet Yılmaz",
          "insuredCustomerIdentity": "12345678901",
          "insuredCustomerType": "Individual",
          "arrangementDate": "2024-01-15T10:30:00Z",
          "createdAt": "2024-01-15T10:30:00Z",
          "createdBy": {
            "name": "Mehmet Özkan",
            "id": "user-456"
          },
          "representedBy": {
            "name": "Mehmet Özkan",
            "id": "user-456"
          },
          "channel": "Online",
          "vehicleModel": {
            "brand": {
              "text": "Toyota",
              "value": "toyota"
            },
            "year": 2020,
            "type": {
              "text": "Corolla",
              "value": "corolla"
            }
          }
        }
      ]
    }
  }
}
```

#### Parametreler

| Parametre | Tip | Açıklama | Zorunlu |
|-----------|-----|----------|---------|
| `skip` | Integer | Atlanacak kayıt sayısı (pagination için) | Hayır |
| `take` | Integer | Getirilecek kayıt sayısı (max: 100) | Hayır |
| `where` | Object | Filtreleme kriterleri | Hayır |
| `order` | Object | Sıralama kriterleri | Hayır |

#### Filtreleme Örnekleri

**Durum Filtresi**:
```json
{
  "query": "query { policies(skip: 0 take: 10 where: { state: \"Active\" } ){totalCount items{id state productBranch startDate endDate}}}"
}
```

**Ürün Branşı Filtresi**:
```json
{
  "query": "query { policies(skip: 0 take: 10 where: { productBranch: \"Kasko\" } ){totalCount items{id productBranch state}}}"
}
```

**Tarih Aralığı Filtresi**:
```json
{
  "query": "query { policies(skip: 0 take: 10 where: { arrangementDate: { gte: \"2024-01-01\", lte: \"2024-12-31\" } } ){totalCount items{id arrangementDate}}}"
}
```

**Sigorta Şirketi Filtresi**:
```json
{
  "query": "query { policies(skip: 0 take: 10 where: { insuranceCompanyName: \"ABC Sigorta\" } ){totalCount items{id insuranceCompanyName}}}"
}
```

**Prim Aralığı Filtresi**:
```json
{
  "query": "query { policies(skip: 0 take: 10 where: { grossPremium: { gte: 1000, lte: 5000 } } ){totalCount items{id grossPremium}}}"
}
```

**Müşteri Tipi Filtresi**:
```json
{
  "query": "query { policies(skip: 0 take: 10 where: { insuredCustomerType: \"Individual\" } ){totalCount items{id insuredCustomerName insuredCustomerType}}}"
}
```

#### Sıralama Örnekleri

**Düzenleme Tarihine Göre Azalan**:
```json
{
  "query": "query { policies(skip: 0 take: 10 order: { arrangementDate: DESC } ){totalCount items{id arrangementDate}}}"
}
```

**Prim Tutarına Göre Azalan**:
```json
{
  "query": "query { policies(skip: 0 take: 10 order: { grossPremium: DESC } ){totalCount items{id grossPremium}}}"
}
```

**Bitiş Tarihine Göre Artan**:
```json
{
  "query": "query { policies(skip: 0 take: 10 order: { endDate: ASC } ){totalCount items{id endDate}}}"
}
```

### Poliçe Transfer Listesi (PolicyTransfers)

Poliçe transfer işlemlerini sorgulamak için kullanılan endpoint.

#### Request

**URL**: `https://api.insurup.com/graphql`  
**Method**: `POST`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <your-token>
```

**Request Body**:
```json
{
  "query": "query { policyTransfers(skip: 0 take: 10 where: {} order: {createdAt: DESC}){totalCount items{id startDate endDate createdAt succeededPolicyCount failedPolicyCount skippedPolicyCount }}}"
}
```

#### Response

**Başarılı Yanıt (200 OK)**:
```json
{
  "data": {
    "policyTransfers": {
      "totalCount": 25,
      "items": [
        {
          "id": "transfer-id-123",
          "startDate": "2024-01-01",
          "endDate": "2024-01-31",
          "createdAt": "2024-01-15T10:30:00Z",
          "succeededPolicyCount": 45,
          "failedPolicyCount": 3,
          "skippedPolicyCount": 2
        }
      ]
    }
  }
}
```

#### Parametreler

| Parametre | Tip | Açıklama | Zorunlu |
|-----------|-----|----------|---------|
| `skip` | Integer | Atlanacak kayıt sayısı (pagination için) | Hayır |
| `take` | Integer | Getirilecek kayıt sayısı (max: 100) | Hayır |
| `where` | Object | Filtreleme kriterleri | Hayır |
| `order` | Object | Sıralama kriterleri | Hayır |

#### Filtreleme Örnekleri

**Tarih Aralığı Filtresi**:
```json
{
  "query": "query { policyTransfers(skip: 0 take: 10 where: { createdAt: { gte: \"2024-01-01\", lte: \"2024-12-31\" } } ){totalCount items{id createdAt}}}"
}
```

**Başlangıç Tarihi Filtresi**:
```json
{
  "query": "query { policyTransfers(skip: 0 take: 10 where: { startDate: { gte: \"2024-01-01\" } } ){totalCount items{id startDate}}}"
}
```

**Bitiş Tarihi Filtresi**:
```json
{
  "query": "query { policyTransfers(skip: 0 take: 10 where: { endDate: { lte: \"2024-12-31\" } } ){totalCount items{id endDate}}}"
}
```

**Başarılı Transfer Filtresi**:
```json
{
  "query": "query { policyTransfers(skip: 0 take: 10 where: { succeededPolicyCount: { gte: 10 } } ){totalCount items{id succeededPolicyCount}}}"
}
```

**Başarısız Transfer Filtresi**:
```json
{
  "query": "query { policyTransfers(skip: 0 take: 10 where: { failedPolicyCount: { gte: 1 } } ){totalCount items{id failedPolicyCount}}}"
}
```

#### Sıralama Örnekleri

**Oluşturulma Tarihine Göre Azalan**:
```json
{
  "query": "query { policyTransfers(skip: 0 take: 10 order: { createdAt: DESC } ){totalCount items{id createdAt}}}"
}
```

**Başarılı Transfer Sayısına Göre Azalan**:
```json
{
  "query": "query { policyTransfers(skip: 0 take: 10 order: { succeededPolicyCount: DESC } ){totalCount items{id succeededPolicyCount}}}"
}
```

**Başlangıç Tarihine Göre Artan**:
```json
{
  "query": "query { policyTransfers(skip: 0 take: 10 order: { startDate: ASC } ){totalCount items{id startDate}}}"
}
```

### Dosya Poliçe Transfer Listesi (FilePolicyTransfers)

Dosya bazlı poliçe transfer işlemlerini sorgulamak için kullanılan endpoint.

#### Request

**URL**: `https://api.insurup.com/graphql`  
**Method**: `POST`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <your-token>
```

**Request Body**:
```json
{
  "query": "query { filePolicyTransfers(skip: 0 take: 10 where: {} order: {createdAt: DESC}){totalCount items{insuranceCompanyLogo insuranceCompanyName createdAt succeededPolicyCount failedPolicyCount skippedPolicyCount id }}}"
}
```

#### Response

**Başarılı Yanıt (200 OK)**:
```json
{
  "data": {
    "filePolicyTransfers": {
      "totalCount": 15,
      "items": [
        {
          "id": "file-transfer-id-123",
          "insuranceCompanyLogo": "https://example.com/logo.png",
          "insuranceCompanyName": "ABC Sigorta",
          "createdAt": "2024-01-15T10:30:00Z",
          "succeededPolicyCount": 120,
          "failedPolicyCount": 5,
          "skippedPolicyCount": 3
        }
      ]
    }
  }
}
```

#### Parametreler

| Parametre | Tip | Açıklama | Zorunlu |
|-----------|-----|----------|---------|
| `skip` | Integer | Atlanacak kayıt sayısı (pagination için) | Hayır |
| `take` | Integer | Getirilecek kayıt sayısı (max: 100) | Hayır |
| `where` | Object | Filtreleme kriterleri | Hayır |
| `order` | Object | Sıralama kriterleri | Hayır |

#### Filtreleme Örnekleri

**Tarih Aralığı Filtresi**:
```json
{
  "query": "query { filePolicyTransfers(skip: 0 take: 10 where: { createdAt: { gte: \"2024-01-01\", lte: \"2024-12-31\" } } ){totalCount items{id createdAt}}}"
}
```

**Sigorta Şirketi Filtresi**:
```json
{
  "query": "query { filePolicyTransfers(skip: 0 take: 10 where: { insuranceCompanyName: \"ABC Sigorta\" } ){totalCount items{id insuranceCompanyName}}}"
}
```

**Başarılı Transfer Filtresi**:
```json
{
  "query": "query { filePolicyTransfers(skip: 0 take: 10 where: { succeededPolicyCount: { gte: 50 } } ){totalCount items{id succeededPolicyCount}}}"
}
```

**Başarısız Transfer Filtresi**:
```json
{
  "query": "query { filePolicyTransfers(skip: 0 take: 10 where: { failedPolicyCount: { gte: 1 } } ){totalCount items{id failedPolicyCount}}}"
}
```

**Atlanan Transfer Filtresi**:
```json
{
  "query": "query { filePolicyTransfers(skip: 0 take: 10 where: { skippedPolicyCount: { gte: 1 } } ){totalCount items{id skippedPolicyCount}}}"
}
```

#### Sıralama Örnekleri

**Oluşturulma Tarihine Göre Azalan**:
```json
{
  "query": "query { filePolicyTransfers(skip: 0 take: 10 order: { createdAt: DESC } ){totalCount items{id createdAt}}}"
}
```

**Başarılı Transfer Sayısına Göre Azalan**:
```json
{
  "query": "query { filePolicyTransfers(skip: 0 take: 10 order: { succeededPolicyCount: DESC } ){totalCount items{id succeededPolicyCount}}}"
}
```

**Sigorta Şirketi Adına Göre Artan**:
```json
{
  "query": "query { filePolicyTransfers(skip: 0 take: 10 order: { insuranceCompanyName: ASC } ){totalCount items{id insuranceCompanyName}}}"
}
```

### Acente Kullanıcı Listesi (AgentUsers)

Acente kullanıcı bilgilerini sorgulamak için kullanılan endpoint.

#### Request

**URL**: `https://api.insurup.com/graphql`  
**Method**: `POST`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <your-token>
```

**Request Body**:
```json
{
  "query": "query { agentUsers(skip: 0 take: 10 where: {} order: {createdAt: DESC}){totalCount items{id firstName lastName email state createdAt createdByName updatedAt updatedByName roles }}}"
}
```

#### Response

**Başarılı Yanıt (200 OK)**:
```json
{
  "data": {
    "agentUsers": {
      "totalCount": 50,
      "items": [
        {
          "id": "user-id-123",
          "firstName": "Mehmet",
          "lastName": "Özkan",
          "email": "mehmet@example.com",
          "state": "Active",
          "createdAt": "2024-01-15T10:30:00Z",
          "createdByName": "Admin User",
          "updatedAt": "2024-01-20T14:20:00Z",
          "updatedByName": "Admin User",
          "roles": [
            {
              "id": "role-1",
              "name": "Agent",
              "permissions": ["read", "write"]
            },
            {
              "id": "role-2", 
              "name": "Manager",
              "permissions": ["read", "write", "delete"]
            }
          ]
        }
      ]
    }
  }
}
```

#### Parametreler

| Parametre | Tip | Açıklama | Zorunlu |
|-----------|-----|----------|---------|
| `skip` | Integer | Atlanacak kayıt sayısı (pagination için) | Hayır |
| `take` | Integer | Getirilecek kayıt sayısı (max: 100) | Hayır |
| `where` | Object | Filtreleme kriterleri | Hayır |
| `order` | Object | Sıralama kriterleri | Hayır |

#### Filtreleme Örnekleri

**Durum Filtresi**:
```json
{
  "query": "query { agentUsers(skip: 0 take: 10 where: { state: \"Active\" } ){totalCount items{id firstName lastName email state}}}"
}
```

**E-posta Filtresi**:
```json
{
  "query": "query { agentUsers(skip: 0 take: 10 where: { email: { contains: \"@example.com\" } } ){totalCount items{id firstName lastName email}}}"
}
```

**Tarih Aralığı Filtresi**:
```json
{
  "query": "query { agentUsers(skip: 0 take: 10 where: { createdAt: { gte: \"2024-01-01\", lte: \"2024-12-31\" } } ){totalCount items{id firstName lastName createdAt}}}"
}
```

**Ad Filtresi**:
```json
{
  "query": "query { agentUsers(skip: 0 take: 10 where: { firstName: { contains: \"Mehmet\" } } ){totalCount items{id firstName lastName}}}"
}
```

**Soyad Filtresi**:
```json
{
  "query": "query { agentUsers(skip: 0 take: 10 where: { lastName: { contains: \"Özkan\" } } ){totalCount items{id firstName lastName}}}"
}
```

#### Sıralama Örnekleri

**Oluşturulma Tarihine Göre Azalan**:
```json
{
  "query": "query { agentUsers(skip: 0 take: 10 order: { createdAt: DESC } ){totalCount items{id firstName lastName createdAt}}}"
}
```

**Ad'a Göre Artan**:
```json
{
  "query": "query { agentUsers(skip: 0 take: 10 order: { firstName: ASC } ){totalCount items{id firstName lastName}}}"
}
```

**Soyad'a Göre Artan**:
```json
{
  "query": "query { agentUsers(skip: 0 take: 10 order: { lastName: ASC } ){totalCount items{id firstName lastName}}}"
}
```

**E-posta'ya Göre Artan**:
```json
{
  "query": "query { agentUsers(skip: 0 take: 10 order: { email: ASC } ){totalCount items{id firstName lastName email}}}"
}
```

## Kullanım Örnekleri

### JavaScript/Node.js

```javascript
const fetch = require('node-fetch');

// Müşteri listesi
async function getCustomers(skip = 0, take = 10) {
  const query = `
    query {
      customers(skip: ${skip} take: ${take} where: {}) {
        totalCount
        items {
          id
          name
          identity
          type
          primaryEmail
          primaryPhoneNumber {
            number
            countryCode
          }
          createdAt
          city {
            text
            value
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.insurup.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN_HERE'
    },
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  return data;
}

// Talep listesi
async function getCases(skip = 0, take = 10, filters = {}) {
  const query = `
    query {
      cases(skip: ${skip} take: ${take} where: ${JSON.stringify(filters)} order: {createdAt: DESC}) {
        totalCount
        items {
          id
          ref
          status
          subState
          type
          priorityScore
          customerName
          customerType
          productBranch
          channel
          createdAt
          lastUpdateDate
          representedBy {
            name
            id
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.insurup.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN_HERE'
    },
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  return data;
}

// Kullanım örnekleri
getCustomers(0, 20).then(customers => {
  console.log('Toplam müşteri sayısı:', customers.data.customers.totalCount);
  console.log('Müşteriler:', customers.data.customers.items);
});

// Aktif talepleri getir
getCases(0, 20, { status: 'Active' }).then(cases => {
  console.log('Toplam talep sayısı:', cases.data.cases.totalCount);
  console.log('Talepler:', cases.data.cases.items);
});

// Yüksek öncelikli talepleri getir
getCases(0, 20, { priorityScore: { gte: 80 } }).then(cases => {
  console.log('Yüksek öncelikli talepler:', cases.data.cases.items);
});

// Teklif listesi
async function getProposals(skip = 0, take = 10, filters = {}) {
  const query = `
    query {
      proposals(skip: ${skip} take: ${take} where: ${JSON.stringify(filters)} order: {createdAt: DESC}) {
        totalCount
        items {
          id
          productBranch
          insuredCustomerName
          insuredCustomerIdentity
          insuredCustomerType
          state
          highestPremium
          lowestPremium
          successRate
          productsCount
          succeedProductsCount
          createdAt
          agentUserCreatedBy {
            id
            name
          }
          vehicleModel {
            brand {
              text
              value
            }
            year
            type {
              text
              value
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.insurup.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN_HERE'
    },
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  return data;
}

// Kullanım örnekleri
// Tamamlanan teklifleri getir
getProposals(0, 20, { state: 'Completed' }).then(proposals => {
  console.log('Toplam teklif sayısı:', proposals.data.proposals.totalCount);
  console.log('Teklifler:', proposals.data.proposals.items);
});

// Yüksek başarı oranlı teklifleri getir
getProposals(0, 20, { successRate: { gte: 80 } }).then(proposals => {
  console.log('Yüksek başarı oranlı teklifler:', proposals.data.proposals.items);
});

// Poliçe listesi
async function getPolicies(skip = 0, take = 10, filters = {}) {
  const query = `
    query {
      policies(skip: ${skip} take: ${take} where: ${JSON.stringify(filters)} order: {arrangementDate: DESC}) {
        totalCount
        items {
          id
          state
          productBranch
          startDate
          endDate
          insuranceCompanyLogo
          insuranceCompanyPolicyNumber
          insuranceCompanyName
          productName
          grossPremium
          netPremium
          insuredCustomerName
          insuredCustomerIdentity
          insuredCustomerType
          arrangementDate
          createdAt
          createdBy {
            name
            id
          }
          representedBy {
            name
            id
          }
          channel
          vehicleModel {
            brand {
              text
              value
            }
            year
            type {
              text
              value
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.insurup.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN_HERE'
    },
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  return data;
}

// Kullanım örnekleri
// Aktif poliçeleri getir
getPolicies(0, 20, { state: 'Active' }).then(policies => {
  console.log('Toplam poliçe sayısı:', policies.data.policies.totalCount);
  console.log('Poliçeler:', policies.data.policies.items);
});

// Yüksek primli poliçeleri getir
getPolicies(0, 20, { grossPremium: { gte: 2000 } }).then(policies => {
  console.log('Yüksek primli poliçeler:', policies.data.policies.items);
});

// Acente kullanıcı listesi
async function getAgentUsers(skip = 0, take = 10, filters = {}) {
  const query = `
    query {
      agentUsers(skip: ${skip} take: ${take} where: ${JSON.stringify(filters)} order: {createdAt: DESC}) {
        totalCount
        items {
          id
          firstName
          lastName
          email
          state
          createdAt
          createdByName
          updatedAt
          updatedByName
          roles {
            id
            name
            permissions
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.insurup.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN_HERE'
    },
    body: JSON.stringify({ query })
  });

  const data = await response.json();
  return data;
}

// Kullanım örnekleri
// Aktif kullanıcıları getir
getAgentUsers(0, 20, { state: 'Active' }).then(users => {
  console.log('Toplam kullanıcı sayısı:', users.data.agentUsers.totalCount);
  console.log('Kullanıcılar:', users.data.agentUsers.items);
});

// Belirli e-posta domainindeki kullanıcıları getir
getAgentUsers(0, 20, { email: { contains: '@example.com' } }).then(users => {
  console.log('Example.com kullanıcıları:', users.data.agentUsers.items);
});
```

### Python

```python
import requests
import json

def get_customers(skip=0, take=10):
    query = """
    query {
      customers(skip: %d take: %d where: {}) {
        totalCount
        items {
          id
          name
          identity
          type
          primaryEmail
          primaryPhoneNumber {
            number
            countryCode
          }
          createdAt
          city {
            text
            value
          }
        }
      }
    }
    """ % (skip, take)

    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
    }

    response = requests.post(
        'https://api.insurup.com/graphql',
        headers=headers,
        json={'query': query}
    )

    return response.json()

def get_cases(skip=0, take=10, filters=None):
    if filters is None:
        filters = {}
    
    query = """
    query {
      cases(skip: %d take: %d where: %s order: {createdAt: DESC}) {
        totalCount
        items {
          id
          ref
          status
          subState
          type
          priorityScore
          customerName
          customerType
          productBranch
          channel
          createdAt
          lastUpdateDate
          representedBy {
            name
            id
          }
        }
      }
    }
    """ % (skip, take, json.dumps(filters))

    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
    }

    response = requests.post(
        'https://api.insurup.com/graphql',
        headers=headers,
        json={'query': query}
    )

    return response.json()

# Kullanım örnekleri
customers = get_customers(0, 20)
print(f"Toplam müşteri sayısı: {customers['data']['customers']['totalCount']}")
print(f"Müşteriler: {customers['data']['customers']['items']}")

# Aktif talepleri getir
cases = get_cases(0, 20, {'status': 'Active'})
print(f"Toplam talep sayısı: {cases['data']['cases']['totalCount']}")
print(f"Talepler: {cases['data']['cases']['items']}")

# Yüksek öncelikli talepleri getir
high_priority_cases = get_cases(0, 20, {'priorityScore': {'gte': 80}})
print(f"Yüksek öncelikli talepler: {high_priority_cases['data']['cases']['items']}")

def get_proposals(skip=0, take=10, filters=None):
    if filters is None:
        filters = {}
    
    query = """
    query {
      proposals(skip: %d take: %d where: %s order: {createdAt: DESC}) {
        totalCount
        items {
          id
          productBranch
          insuredCustomerName
          insuredCustomerIdentity
          insuredCustomerType
          state
          highestPremium
          lowestPremium
          successRate
          productsCount
          succeedProductsCount
          createdAt
          agentUserCreatedBy {
            id
            name
          }
          vehicleModel {
            brand {
              text
              value
            }
            year
            type {
              text
              value
            }
          }
        }
      }
    }
    """ % (skip, take, json.dumps(filters))

    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
    }

    response = requests.post(
        'https://api.insurup.com/graphql',
        headers=headers,
        json={'query': query}
    )

    return response.json()

# Kullanım örnekleri
# Tamamlanan teklifleri getir
proposals = get_proposals(0, 20, {'state': 'Completed'})
print(f"Toplam teklif sayısı: {proposals['data']['proposals']['totalCount']}")
print(f"Teklifler: {proposals['data']['proposals']['items']}")

# Yüksek başarı oranlı teklifleri getir
high_success_proposals = get_proposals(0, 20, {'successRate': {'gte': 80}})
print(f"Yüksek başarı oranlı teklifler: {high_success_proposals['data']['proposals']['items']}")

def get_policies(skip=0, take=10, filters=None):
    if filters is None:
        filters = {}
    
    query = """
    query {
      policies(skip: %d take: %d where: %s order: {arrangementDate: DESC}) {
        totalCount
        items {
          id
          state
          productBranch
          startDate
          endDate
          insuranceCompanyLogo
          insuranceCompanyPolicyNumber
          insuranceCompanyName
          productName
          grossPremium
          netPremium
          insuredCustomerName
          insuredCustomerIdentity
          insuredCustomerType
          arrangementDate
          createdAt
          createdBy {
            name
            id
          }
          representedBy {
            name
            id
          }
          channel
          vehicleModel {
            brand {
              text
              value
            }
            year
            type {
              text
              value
            }
          }
        }
      }
    }
    """ % (skip, take, json.dumps(filters))

    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
    }

    response = requests.post(
        'https://api.insurup.com/graphql',
        headers=headers,
        json={'query': query}
    )

    return response.json()

# Kullanım örnekleri
# Aktif poliçeleri getir
policies = get_policies(0, 20, {'state': 'Active'})
print(f"Toplam poliçe sayısı: {policies['data']['policies']['totalCount']}")
print(f"Poliçeler: {policies['data']['policies']['items']}")

# Yüksek primli poliçeleri getir
high_premium_policies = get_policies(0, 20, {'grossPremium': {'gte': 2000}})
print(f"Yüksek primli poliçeler: {high_premium_policies['data']['policies']['items']}")

def get_agent_users(skip=0, take=10, filters=None):
    if filters is None:
        filters = {}
    
    query = """
    query {
      agentUsers(skip: %d take: %d where: %s order: {createdAt: DESC}) {
        totalCount
        items {
          id
          firstName
          lastName
          email
          state
          createdAt
          createdByName
          updatedAt
          updatedByName
          roles {
            id
            name
            permissions
          }
        }
      }
    }
    """ % (skip, take, json.dumps(filters))

    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
    }

    response = requests.post(
        'https://api.insurup.com/graphql',
        headers=headers,
        json={'query': query}
    )

    return response.json()

# Kullanım örnekleri
# Aktif kullanıcıları getir
agent_users = get_agent_users(0, 20, {'state': 'Active'})
print(f"Toplam kullanıcı sayısı: {agent_users['data']['agentUsers']['totalCount']}")
print(f"Kullanıcılar: {agent_users['data']['agentUsers']['items']}")

# Belirli e-posta domainindeki kullanıcıları getir
example_users = get_agent_users(0, 20, {'email': {'contains': '@example.com'}})
print(f"Example.com kullanıcıları: {example_users['data']['agentUsers']['items']}")
```

### cURL

**Müşteri Listesi**:
```bash
curl -X POST https://api.insurup.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { customers(skip: 0 take: 10 where: {} ){totalCount items{id name identity type primaryEmail primaryPhoneNumber{number countryCode } createdAt city{text value }}}}"
  }'
```

**Talep Listesi**:
```bash
curl -X POST https://api.insurup.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { cases(skip: 0 take: 10 where: {} order: {createdAt: DESC}){totalCount items{id ref status subState type priorityScore customerName customerType productBranch channel createdAt lastUpdateDate representedBy{name id }}}}"
  }'
```

**Aktif Talepler**:
```bash
curl -X POST https://api.insurup.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { cases(skip: 0 take: 10 where: { status: \"Active\" } order: {createdAt: DESC}){totalCount items{id ref status customerName createdAt}}}"
  }'
```

**Teklif Listesi**:
```bash
curl -X POST https://api.insurup.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { proposals(skip: 0 take: 10 where: {} order: {createdAt: DESC}){totalCount items{id productBranch insuredCustomerName insuredCustomerIdentity state highestPremium lowestPremium successRate createdAt agentUserCreatedBy{id name }}}}"
  }'
```

**Tamamlanan Teklifler**:
```bash
curl -X POST https://api.insurup.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { proposals(skip: 0 take: 10 where: { state: \"Completed\" } order: {createdAt: DESC}){totalCount items{id productBranch state successRate createdAt}}}"
  }'
```

**Poliçe Listesi**:
```bash
curl -X POST https://api.insurup.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { policies(skip: 0 take: 10 where: {} order: {arrangementDate: DESC}){totalCount items{id state productBranch startDate endDate insuranceCompanyName productName grossPremium netPremium insuredCustomerName arrangementDate}}}"
  }'
```

**Aktif Poliçeler**:
```bash
curl -X POST https://api.insurup.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { policies(skip: 0 take: 10 where: { state: \"Active\" } order: {arrangementDate: DESC}){totalCount items{id state productBranch startDate endDate grossPremium}}}"
  }'
```

**Acente Kullanıcı Listesi**:
```bash
curl -X POST https://api.insurup.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { agentUsers(skip: 0 take: 10 where: {} order: {createdAt: DESC}){totalCount items{id firstName lastName email state createdAt roles}}}"
  }'
```

**Aktif Kullanıcılar**:
```bash
curl -X POST https://api.insurup.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { agentUsers(skip: 0 take: 10 where: { state: \"Active\" } order: {createdAt: DESC}){totalCount items{id firstName lastName email state}}}"
  }'
```

## Güvenlik

- Tüm API istekleri için geçerli bir Bearer token gereklidir
- Token'lar belirli bir süre sonra sona erer ve yenilenmesi gerekir
- Rate limiting uygulanır: dakikada maksimum 100 istek
- HTTPS kullanımı zorunludur

## Hata Kodları

| Kod | Açıklama |
|-----|----------|
| `UNAUTHENTICATED` | Geçersiz veya eksik token |
| `FORBIDDEN` | Yetersiz yetki |
| `BAD_USER_INPUT` | Geçersiz sorgu parametreleri |
| `INTERNAL_ERROR` | Sunucu hatası |

## Rate Limiting

- **Limit**: Dakikada 100 istek
- **Window**: 60 saniye
- **Response Headers**:
  - `X-RateLimit-Limit`: Maksimum istek sayısı
  - `X-RateLimit-Remaining`: Kalan istek sayısı
  - `X-RateLimit-Reset`: Limit sıfırlanma zamanı (Unix timestamp)

## Destek

API kullanımı ile ilgili sorularınız için [Destek Ekibi](mailto:destek@insurup.com) ile iletişime geçebilirsiniz.
