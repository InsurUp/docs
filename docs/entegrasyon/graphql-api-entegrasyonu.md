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

## Kullanım Örnekleri

### JavaScript/Node.js

```javascript
const fetch = require('node-fetch');

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

// Kullanım
getCustomers(0, 20).then(customers => {
  console.log('Toplam müşteri sayısı:', customers.data.customers.totalCount);
  console.log('Müşteriler:', customers.data.customers.items);
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

# Kullanım
customers = get_customers(0, 20)
print(f"Toplam müşteri sayısı: {customers['data']['customers']['totalCount']}")
print(f"Müşteriler: {customers['data']['customers']['items']}")
```

### cURL

```bash
curl -X POST https://api.insurup.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "query": "query { customers(skip: 0 take: 10 where: {} ){totalCount items{id name identity type primaryEmail primaryPhoneNumber{number countryCode } createdAt city{text value }}}}"
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
