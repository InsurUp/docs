---
title: "MERNIS ve TRAMER Sorgusu (B2B API)"
sidebar_position: 11
slug: /entegrasyon/mernis-tramer-sorgusu
---

# InsurUp B2B API — Token Alma, MERNIS ve TRAMER Sorgusu

Bu doküman, bir B2B entegrasyonunun InsurUp API üzerinden **erişim token'ı (access token)** almasını ve bu token ile **MERNIS** (kimlik sorgulama) ve **TRAMER** (araç/poliçe sorgulama) isteklerini nasıl yapacağını anlatır.

---

## Özet

| Konu | Cevap |
|---|---|
| Token nasıl alınır? | **OAuth 2.0 `client_credentials`** akışı ile (servis hesabı) |
| Servis hesabı mı, OAuth kullanıcı akışı mı? | **Servis hesabı (client_credentials)** — makineden-makineye (M2M) entegrasyon için |
| MERNIS endpoint | `POST /customers/external-lookup` |
| TRAMER endpoint | `POST /customers/{CustomerId}/vehicles/external-lookup` |
| Gerekli OAuth scope | `core-api` |

> **Servis hesabı nedir, nasıl oluşturulur?**
> Servis hesabı; bir insan kullanıcı yerine yazılımın/otomasyonun API'ye erişmesini sağlayan, kullanıcı oturumu gerektirmeyen bir hesap türüdür. Bu doküman, elinizde bir servis hesabı (`client_id` + `client_secret`) olduğunu varsayar. Hesabı Agent Panel üzerinden nasıl oluşturacağınız, secret'ı nasıl saklayacağınız ve yönetim adımları için: [Servis Hesabı Oluşturma ve Kullanım Kılavuzu](/entegrasyon/servis-hesabi-olusturma).

---

## Base URL'ler

| Ortam | Servis | URL |
|---|---|---|
| Production | Kimlik doğrulama (AuthServer) | `https://auth.insurup.com` |
| Production | REST API (WebApi) | `https://api.insurup.com` |

> **Not:** REST istekleri hem `https://api.insurup.com/...` hem de `https://api.insurup.com/api/...` biçiminde çalışır; `/api/*` yolları otomatik olarak köke yönlendirilir. Bu dokümanda `/api/` öneki kullanılmıştır.

---

## Adım 1 — Servis hesabı ile access token alma

Bu adım için bir servis hesabına ait `client_id` (`sa-...` biçiminde) ve `client_secret` gerekir. Henüz oluşturmadıysanız, Agent Panel'den oluşturma adımları için [Servis Hesabı Oluşturma ve Kullanım Kılavuzu](/entegrasyon/servis-hesabi-olusturma)'na bakın.

Elinizdeki `client_id` ve `client_secret` ile token endpoint'ine `client_credentials` isteği gönderin.

```
POST https://auth.insurup.com/connect/token
Content-Type: application/x-www-form-urlencoded
```

Gövde (form-urlencoded):

```
grant_type=client_credentials
client_id=sa-019f8dfa88c67bbb9bd500ae8c90f40d
client_secret={size verilen secret}
scope=core-api
```

cURL örneği:

```bash
curl -X POST "https://auth.insurup.com/connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=sa-019f8dfa88c67bbb9bd500ae8c90f40d" \
  -d "client_secret={SECRET}" \
  -d "scope=core-api"
```

Örnek yanıt:

```json
{
  "access_token": "eyJhbGciOiJ...",
  "token_type": "Bearer",
  "expires_in": 1800,
  "scope": "core-api"
}
```

**Önemli notlar:**

- Dönen `access_token`, sonraki tüm isteklerde `Authorization: Bearer {access_token}` başlığıyla kullanılır.
- Access token süresi **30 dakikadır** (`expires_in: 1800`). `client_credentials` akışında **refresh token yoktur**; token süresi dolduğunda bu adımı tekrarlayarak yeni token alın.
- `client_secret` yalnızca servis hesabı oluşturulurken **bir kez** gösterilir. Kaybederseniz sıfırlanması (rotate) gerekir.
- Erişim yetkisi (hangi verilere dokunabileceğiniz) servis hesabınıza tanımlı **rol/izinlerle** belirlenir; token isteğindeki `scope` her zaman `core-api`'dir.

---

## Adım 2 — MERNIS sorgusu (kimlik doğrulama / ön dolum)

MERNIS sorgusu, TCKN (veya VKN/YKN) üzerinden kişi/kurum bilgilerini getirir. Bu endpoint bir müşteri **oluşturmaz**; sorgu sonucunu döner, isterseniz müşteri oluştururken kullanırsınız.

```
POST https://api.insurup.com/api/customers/external-lookup
Authorization: Bearer {access_token}
Content-Type: application/json
```

İstek gövdesi, müşteri tipine göre `$type` alanı ile ayrışır: `individual` (bireysel), `company` (kurumsal), `foreign` (yabancı).

### Bireysel (T.C. vatandaşı)

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `$type` | string | Evet | `"individual"` olmalı |
| `identityNumber` | number | Evet | 11 haneli TCKN |
| `birthDate` | string (`YYYY-MM-DD`) | Hayır | Verilmezse sistem doğum tarihini önce sorgular |

```json
{
  "$type": "individual",
  "identityNumber": 11111111111,
  "birthDate": "1985-05-12"
}
```

### Kurumsal

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `$type` | string | Evet | `"company"` olmalı |
| `taxNumber` | string | Evet | Vergi No (VKN) |

```json
{
  "$type": "company",
  "taxNumber": "1234567890"
}
```

### Yabancı

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `$type` | string | Evet | `"foreign"` olmalı |
| `identityNumber` | string | Evet | Yabancı kimlik no / pasaport |
| `birthDate` | string (`YYYY-MM-DD`) | Evet | Zorunlu |

```json
{
  "$type": "foreign",
  "identityNumber": "99123456789",
  "birthDate": "1990-01-15"
}
```

### Örnek yanıt (bireysel)

```json
{
  "$type": "individual",
  "fullName": "Ada Lovelace",
  "gender": "FEMALE",
  "email": "ada@example.com",
  "phoneNumber": { "number": "5321234567", "countryCode": 90 },
  "maritalStatus": "MARRIED",
  "birthDate": "1985-05-12",
  "city": { "value": "34", "text": "İstanbul" },
  "district": { "value": "1234", "text": "Kadıköy" }
}
```

cURL örneği:

```bash
curl -X POST "https://api.insurup.com/api/customers/external-lookup" \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{"$type":"individual","identityNumber":11111111111,"birthDate":"1985-05-12"}'
```

---

## Adım 3 — Müşteriyi oluşturma / bulma (CustomerId edinme)

TRAMER sorgusu bir `CustomerId` gerektirir. Bu yüzden **önce müşteri sistemde olmalı**; yoksa oluşturursunuz, varsa bulursunuz. Akış şöyledir: müşteriyi oluşturur (`POST /customers`) veya mevcut kaydı bulur (`GET /customers/{TCKN|VKN}`), dönen `id` (GUID) değerini alırsınız; ardından bu `id`'yi TRAMER isteğinin URL'sinde `{CustomerId}` olarak kullanırsınız. Yani `CustomerId`, müşteri kaydı ile araç/TRAMER sorgusunu birbirine bağlayan referanstır.

### 3a — Müşteri oluşturma

```
POST https://api.insurup.com/api/customers
Authorization: Bearer {access_token}
Content-Type: application/json
```

İstek gövdesi, MERNIS'te olduğu gibi `$type` ile ayrışır (`individual` / `company` / `foreign`).

Bireysel:

```json
{
  "$type": "individual",
  "identityNumber": "11111111111",
  "birthDate": "1985-05-12",
  "fullName": "Ada Lovelace"
}
```

Kurumsal:

```json
{
  "$type": "company",
  "title": "ÖRNEK LTD. ŞTİ.",
  "taxNumber": "1234567890"
}
```

> **İpucu — `fillMissingFields`:** İstek gövdesine `"fillMissingFields": true` eklerseniz, sistem müşteri oluştururken eksik alanları MERNIS/SBM'den otomatik doldurur. Böylece Adım 2'yi ayrıca çağırmadan tek istekte hem oluşturma hem ön dolum yapabilirsiniz.

**Yanıt — CustomerId burada döner (HTTP 201):**

```json
{
  "id": "019f1234-5678-7abc-def0-123456789abc"
}
```

Bu `id`, bir sonraki adımda TRAMER isteğinin URL'sinde `{CustomerId}` olarak kullanılır.

> **Not — Aynı TCKN/VKN zaten varsa:** `POST /customers` mevcut müşteriyi döndürmez; **duplicate hatası** verir. Müşterinin zaten var olma ihtimali varsa önce 3b ile bulun, yoksa oluşturun.

cURL örneği:

```bash
curl -X POST "https://api.insurup.com/api/customers" \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{"$type":"individual","identityNumber":"11111111111","birthDate":"1985-05-12"}'
```

### 3b — Mevcut müşteriyi bulma

Müşteri zaten kayıtlıysa, GUID / TCKN / VKN ile tekil olarak çekip `id`'yi alabilirsiniz:

```
GET https://api.insurup.com/api/customers/{CustomerId|TCKN|VKN}
Authorization: Bearer {access_token}
```

`{CustomerId}` yerine müşterinin GUID'i, **11 haneli TCKN'si** veya **VKN'si** verilebilir.

---

## Adım 4 — TRAMER sorgusu (araç / poliçe sorgusu)

Elinizde Adım 3'ten gelen `CustomerId` ile artık TRAMER sorgusu yapabilirsiniz. TRAMER; plaka (ve varsa ruhsat seri no) üzerinden aracın model, poliçe ve TRAMER bilgilerini getirir.

> **Önemli — Müşteri kaydı zorunludur:**
> TRAMER sorgusu, kimlik bilgilerini (bireysel için TCKN + doğum tarihi, kurumsal için VKN) **request gövdesinden değil**, URL'deki `{CustomerId}` ile bağlı **sistemdeki müşteri kaydından** okur. Bu nedenle sorgudan önce müşterinin sistemde kayıtlı olması gerekir (bkz. Adım 3). Bireysel/yabancı müşteride **doğum tarihi**, kurumsalda **VKN** kayıtlı değilse sorgu hata verir.

```
POST https://api.insurup.com/api/customers/{CustomerId}/vehicles/external-lookup
Authorization: Bearer {access_token}
Content-Type: application/json
```

İstek gövdesi:

| Alan | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `plate` | object | Evet | `{ "city": 1–81, "code": "ABC123" }` |
| `plate.city` | number | Evet | İl plaka kodu (1–81) |
| `plate.code` | string | Evet | Plakanın harf+rakam kısmı |
| `documentSerial` | object | Hayır | Verilmezse sistem ruhsat seri no'yu sorgular |
| `documentSerial.code` | string | (verilirse) | 2 harf (örn. `"AB"`) |
| `documentSerial.number` | string | (verilirse) | 6 hane (örn. `"123456"`) |

```json
{
  "plate": {
    "city": 34,
    "code": "ABC123"
  },
  "documentSerial": {
    "code": "AB",
    "number": "123456"
  }
}
```

### Örnek yanıt

```json
{
  "registrationDate": "2020-03-15",
  "firstRegistrationDate": "2020-03-20",
  "plate": { "city": 34, "code": "ABC123" },
  "documentSerial": { "code": "AB", "number": "123456" },
  "model": {
    "year": 2020,
    "brand": { "value": "100", "text": "TOYOTA" },
    "type": { "value": "200", "text": "COROLLA 1.6" }
  },
  "chassis": "CHASSIS123",
  "chassisIsMasked": false,
  "engine": "ENGINE123",
  "engineIsMasked": false,
  "fuelType": "GASOLINE",
  "price": 150000,
  "currency": "TRY",
  "kaskoOldPolicy": {
    "insuranceCompanyPolicyNumber": "12345678",
    "insuranceCompanyRenewalNumber": 0,
    "insuranceCompanyReference": "001",
    "agentNumber": "AG123",
    "endDate": "2026-03-15"
  },
  "trafikOldPolicy": null,
  "utilizationStyle": "PRIVATE",
  "seatNumber": 5
}
```

**Yanıt hakkında notlar:**

- `chassisIsMasked` / `engineIsMasked` `true` ise ilgili değer maskelenmiştir (örn. `"W***8"`); bu maskeli değeri kaydetmeyin.
- `model` yerine `partialModel` dönebilir (model yılı maskeliyse yalnızca marka/tip gelir).

cURL örneği:

```bash
curl -X POST "https://api.insurup.com/api/customers/019f1234-5678-7abc-def0-123456789abc/vehicles/external-lookup" \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{"plate":{"city":34,"code":"ABC123"},"documentSerial":{"code":"AB","number":"123456"}}'
```

---

## Önerilen uçtan uca akış

```
1) POST /connect/token                                        → access token al (scope: core-api)
2) POST /api/customers/external-lookup                        → (opsiyonel) MERNIS ile kimlik bilgisi ön dolum
3) GET  /api/customers/{TCKN|VKN}                             → müşteri var mı? Varsa CustomerId'yi al
4) (müşteri yoksa) POST /api/customers                        → müşteri oluştur, yanıttaki { "id": ... } = CustomerId
5) POST /api/customers/{CustomerId}/vehicles/external-lookup  → TRAMER (plaka +ruhsat seri no) sorgusu
```

---

## Yetkilendirme ve hata durumları

| Durum | Açıklama |
|---|---|
| `401 Unauthorized` | Token yok, geçersiz veya süresi dolmuş. Adım 1'i tekrarlayın. |
| `403 Forbidden` | Servis hesabınızın bu işlem için rol/izni yok. |
| Kimlik bilgisi eksik | TRAMER için müşterinin doğum tarihi (bireysel/yabancı) veya VKN (kurumsal) kaydı eksikse sorgu hata verir; müşteri kaydını tamamlayın. |
