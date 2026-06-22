---
title: Müşteri Belgesi PDF Entegrasyon Rehberi
sidebar_position: 9
slug: /entegrasyon/musteri-belgesi-pdf
---

# Müşteri Belgesi PDF Entegrasyon Rehberi

Bu rehber, InsurUp Agent Panel'deki **Müşteri Belgesi** özelliğinin API üzerinden nasıl kullanılacağını açıklar. Bir teklifteki sigorta şirketi tekliflerinden seçtiklerinizi müşteriye sunmak için **PDF belgesi oluşturup indirebilirsiniz**.

Oluşturulan PDF; müşteri bilgilerini, sigortalanan varlık detaylarını (araç, konut, sağlık, seyahat vb.) ve seçilen sigorta şirketlerinin prim karşılaştırmasını içerir.

:::info Agent Panel ile aynı çıktı
Bu API, Agent Panel'deki **Müşteri Belgesi → PDF İndir** ekranının ürettiği belge ile **aynı PDF'i** oluşturur.
:::

| | Müşteri Belgesi (bu rehber) | Karşılaştırma PDF'i |
|---|---|---|
| **Amaç** | Müşteriye sunum için sadeleştirilmiş özet | Acente için detaylı teminat karşılaştırması |
| **Endpoint** | `POST .../customer-document-pdf` | `POST .../compare-pdf` |
| **Hedef kitle** | Son müşteri | Acente / iç kullanım |

### PDF çıktısı hakkında

| Özellik | Açıklama |
|---------|----------|
| **Dosya adı** | `MusteriAdi_Brans_VarlikKimligi.pdf` formatında (ör. `AhmetYilmaz_Kasko_34ABC123.pdf`) |
| **Sıralama** | Ürünler brüt prime göre **artan** sırada listelenir |
| **Taksit bilgisi** | Birden fazla taksit seçeneği varsa aylık ödeme tutarı da gösterilir |
| **Prim tutarı** | En düşük taksit numarasına (`installmentNumber`) karşılık gelen `grossPremium` kullanılır |

---

## 1. Ön koşullar

Müşteri belgesi API'sini çağırmadan önce aşağıdakilerin hazır olması gerekir:

| Gereksinim | Açıklama |
|------------|----------|
| **Geçerli access token** | Tüm isteklerde `Authorization: Bearer <token>` |
| **Acente kullanıcısı token'ı** | Endpoint yalnızca acente kullanıcıları (AgentUser) içindir; son müşteri token'ı ile çağrılamaz |
| **`proposal:write` veya `core-api` kapsamı** | PDF oluşturma için zorunlu |
| **Mevcut bir teklif** | En az bir `ACTIVE` durumunda ve primi olan ürünü olan `proposalId` |

Kimlik doğrulama ve token alma adımları bu rehberin kapsamı dışındadır. Kullandığınız senaryoya göre ilgili rehberi takip edin:

| Senaryo | Rehber |
|---------|--------|
| Kullanıcı InsurUp hesabıyla uygulamanıza giriş yapıyor | [InsurUp ile Giriş (OAuth 2.0 / OIDC)](/entegrasyon/insurup-ile-giris-oauth-entegrasyonu) |
| Sunucu‑sunucu otomasyon (M2M) | [Servis Hesabı Oluşturma](/entegrasyon/servis-hesabi-olusturma) |

:::tip İki sunucu mimarisi
Token'ı **Kimlik Sunucusu** (`https://auth.insurup.com`) üzerinden alır, API çağrılarını **Core API** (`https://api.insurup.com`) üzerinden yaparsınız. Detaylar OAuth rehberinin [1. bölümünde](/entegrasyon/insurup-ile-giris-oauth-entegrasyonu#1-mimari-i̇ki-ayrı-sunucu) açıklanmıştır.
:::

:::tip API adresi
Örneklerde `https://api.insurup.com/proposals/...` kullanılmıştır. `.NET SDK` varsayılan taban adresi `https://api.insurup.com/api/` şeklindedir; `/api/` önekli adresler de desteklenir.
:::

### Gerekli kapsamlar (scopes)

| İşlem | Minimum kapsam |
|-------|----------------|
| Teklif detayı alma | `proposal:read`, `proposal:write` veya `core-api` |
| Müşteri belgesi PDF oluşturma | `proposal:write` veya `core-api` |

OAuth istemcinizde bu kapsamların tanımlı olduğundan emin olun. Kapsam listesi için bkz. [OAuth rehberi — Kapsamlar](/entegrasyon/insurup-ile-giris-oauth-entegrasyonu#3-kapsamlar-scopes).

---

## 2. Entegrasyon akışı

Müşteri belgesi almak için **dört adım** yeterlidir:

```
1. GET  /proposals/{proposalId}
       → Ürün listesi, primler ve durum bilgisi

2. Filtrele
       → ACTIVE durumunda ve primi olan ürünlerin id'lerini seç

3. POST /proposals/{proposalId}/products/customer-document-pdf
       → İndirilebilir PDF URL'i döner

4. GET  {url}
       → PDF dosyasını indirin veya müşteriye iletin
```

:::warning Ürün seçim ekranı için ayrı API yok
Agent Panel'deki ürün seçim listesi ayrı bir endpoint değildir. Liste, teklif detayından (`GET /proposals/{proposalId}`) gelir; hangi ürünlerin belgeye dahil edileceğine siz karar verirsiniz.
:::

---

## 3. Adım 1 — Teklif detayını alın

Belgeye dahil edilebilecek ürünleri listelemek için teklif detayını çekin.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `https://api.insurup.com/proposals/{proposalId}` |
| **Kapsam** | `proposal:read`, `proposal:write` veya `core-api` |

**Örnek istek:**

```http
GET https://api.insurup.com/proposals/abc123-def456
Authorization: Bearer <access_token>
```

**Örnek yanıt (ilgili alanlar):**

```json
{
  "proposalId": "abc123-def456",
  "productBranch": "KASKO",
  "products": [
    {
      "id": "prod-001",
      "state": "ACTIVE",
      "insuranceCompanyName": "Türkiye Sigorta",
      "insuranceCompanyLogo": "https://...",
      "productName": "Kasko Ürünü",
      "premiums": [
        {
          "installmentNumber": 1,
          "grossPremium": 17245.19,
          "netPremium": 14500.00,
          "currency": "TRY"
        }
      ]
    },
    {
      "id": "prod-002",
      "state": "FAILED",
      "insuranceCompanyName": "Örnek Sigorta",
      "premiums": []
    }
  ]
}
```

| Alan | Açıklama |
|------|----------|
| `products[].id` | Ürün kimliği — PDF isteğinde `proposalProductIds` olarak kullanılır |
| `products[].state` | Ürün durumu — PDF'e yalnızca `ACTIVE` olanlar yazılır |
| `products[].premiums` | Prim listesi — boş olan ürünler belgeye dahil edilemez |
| `products[].insuranceCompanyName` | Sigorta şirketi adı |
| `products[].insuranceCompanyLogo` | Sigorta şirketi logo URL'si |

---

## 4. Adım 2 — Ürünleri filtreleyin

PDF oluşturma isteğine göndermeden önce ürünleri filtreleyin:

| Kural | Değer |
|-------|-------|
| Ürün durumu | Yalnızca `ACTIVE` |
| Prim bilgisi | `premiums` dizisi boş olmamalı |

| Durum | Açıklama | PDF'e yazılır mı? |
|-------|----------|-------------------|
| `WAITING` | Teklif bekleniyor | Hayır |
| `FAILED` | Teklif başarısız | Hayır |
| `ACTIVE` | Teklif alındı, satın alınabilir | **Evet** |
| `PURCHASING` | Satın alma devam ediyor | Hayır |
| `PURCHASED` | Satın alındı | Hayır |

:::warning Yalnızca ACTIVE ürünler PDF'e yazılır
Agent Panel seçim ekranında `PURCHASING` ve `PURCHASED` durumundaki ürünler de listelenebilir; ancak PDF oluşturma API'si yalnızca **`ACTIVE`** durumundaki ürünleri belgeye dahil eder. Diğer durumlardaki ürün kimlikleri gönderilirse sessizce yok sayılır — hata dönmez, ancak PDF'te görünmezler.
:::

:::warning Boş ürün tablosu riski
Gönderdiğiniz tüm `proposalProductIds` değerleri `ACTIVE` değilse veya primi yoksa API hata vermez; ürün tablosu boş bir PDF oluşabilir. İstek öncesinde filtreyi uyguladığınızdan emin olun.
:::

:::tip Gösterilecek prim tutarı
Ekranda ve PDF'te görünen prim, `premiums` dizisindeki **en düşük `installmentNumber`** değerine sahip kaydın `grossPremium` alanıdır.
:::

---

## 5. Adım 3 — PDF oluşturun

Seçilen ürünlerden müşteri belgesi PDF'i oluşturur.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `https://api.insurup.com/proposals/{proposalId}/products/customer-document-pdf` |
| **Kapsam** | `proposal:write` veya `core-api` |
| **Content-Type** | `application/json` |

**İstek gövdesi:**

```json
{
  "proposalId": "abc123-def456",
  "proposalProductIds": [
    "prod-001",
    "prod-003"
  ],
  "agentName": "Örnek Sigorta Acentesi"
}
```

| Alan | Zorunlu | Açıklama |
|------|---------|----------|
| `proposalId` | Evet | Teklif kimliği — URL path'indeki `{proposalId}` ile **aynı** olmalıdır |
| `proposalProductIds` | Evet | Belgeye dahil edilecek ürün kimlikleri (en az 1 adet, yalnızca `ACTIVE` olanlar PDF'e yazılır) |
| `agentName` | Koşullu | Belge başlığında görünecek acente adı. Kullanıcı girişi senaryosunda opsiyoneldir (oturumdaki acente adı kullanılır). **M2M (Servis Hesabı) senaryosunda gönderilmesi önerilir** |

**Örnek istek:**

```http
POST https://api.insurup.com/proposals/abc123-def456/products/customer-document-pdf
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "proposalId": "abc123-def456",
  "proposalProductIds": ["prod-001", "prod-003"],
  "agentName": "Örnek Sigorta Acentesi"
}
```

**Örnek yanıt:**

```json
{
  "url": "https://storage.example.com/files/AhmetYilmaz_Kasko_34ABC123.pdf?token=..."
}
```

| Alan | Açıklama |
|------|----------|
| `url` | Oluşturulan PDF'in indirme adresi |

:::warning URL zaman sınırlıdır
Dönen `url` geçici olabilir. PDF'i aldıktan sonra kendi sisteminizde saklamanız önerilir.
:::

---

## 6. Adım 4 — PDF'i indirin

Yanıttaki `url` adresine standart bir HTTP `GET` isteği atarak PDF dosyasını indirin. Bu adım Core API token'ı gerektirmez; dönen URL kendi erişim mekanizmasını içerir.

```bash
curl -o musteri-belgesi.pdf "<url>"
```

---

## 7. SDK ile kullanım

### 7.1 TypeScript SDK ile (`@insurup/sdk` — önerilen)

OAuth kurulumu ve SDK istemcisi oluşturma için bkz. [InsurUp ile Giriş rehberi — TypeScript SDK](/entegrasyon/insurup-ile-giris-oauth-entegrasyonu#51-typescript-sdk-ile-insurupsdk--önerilen). Aşağıdaki örnek, auth yapılandırmasının tamamlandığını varsayar.

```typescript
import { DefaultInsurUpClient } from '@insurup/sdk';

const client = new DefaultInsurUpClient({ auth });

const proposalId = 'abc123-def456';

// 1. Teklif detayı
const proposal = await client.proposals.getProposalDetail(proposalId);
if (!proposal.isSuccess) {
  throw proposal.error;
}

// 2. Belgeye dahil edilecek ürünleri filtrele (yalnızca ACTIVE)
const productIds = proposal.data.products
  .filter(p => p.state === 'ACTIVE' && p.premiums.length > 0)
  .map(p => p.id);

if (productIds.length === 0) {
  throw new Error('Belgeye dahil edilecek ACTIVE ürün bulunamadı');
}

// 3. PDF oluştur
const pdf = await client.proposals.generateCustomerProposalDocumentPdf({
  proposalId,
  proposalProductIds: productIds,
  agentName: 'Örnek Sigorta Acentesi', // M2M senaryosunda zorunlu
});

if (!pdf.isSuccess) {
  throw pdf.error;
}

// 4. PDF indir
const response = await fetch(pdf.data.url);
const blob = await response.blob();
```

:::tip Token yönetimi otomatiktir
`auth` nesnesi SDK istemcisine bağlandığında access token her çağrıda otomatik enjekte edilir. Detaylar OAuth rehberinde açıklanmıştır.
:::

:::info TypeScript SDK referansı
SDK kaynak kodu ve API referansı: [github.com/InsurUp/ts-toolkit](https://github.com/InsurUp/ts-toolkit)
:::

### 7.2 .NET SDK ile (`InsurUp.Sdk`)

SDK kurulumu, DI kaydı ve token yönetimi için bkz. [InsurUp ile Giriş rehberi — .NET SDK](/entegrasyon/insurup-ile-giris-oauth-entegrasyonu#52-net-sdk-ile-insurupsdk). Aşağıdaki örnek `IInsurUpClient`'ın DI ile inject edildiğini ve token'ın ayarlandığını varsayar.

```csharp
using InsurUp.Api.Contracts;
using InsurUp.Common.Models;
using InsurUp.Sdk;

public async Task<byte[]> DownloadCustomerDocumentAsync(
    IInsurUpClient client,
    string proposalId,
    string? agentName = null,
    CancellationToken ct = default)
{
    // 1. Teklif detayı
    var proposalResult = await client.GetProposalDetail(proposalId);
    if (!proposalResult.IsSuccess)
        throw new InvalidOperationException(proposalResult.Message);

    var proposal = proposalResult.UnwrapSuccess().Data;

    // 2. Belgeye dahil edilecek ürünleri filtrele (yalnızca ACTIVE)
    var productIds = proposal.Products
        .Where(p => p.State == ProposalProductState.Active)
        .Where(p => p.Premiums.Length > 0)
        .Select(p => p.Id)
        .ToArray();

    if (productIds.Length == 0)
        throw new InvalidOperationException("Belgeye dahil edilecek ACTIVE ürün bulunamadı");

    // 3. PDF oluştur
    var pdfResult = await client.GenerateCustomerProposalDocumentPdf(
        new GenerateCustomerProposalDocumentPdfEndpointRequest
        {
            ProposalId = proposal.ProposalId,
            ProposalProductIds = productIds,
            AgentName = agentName // M2M senaryosunda gönderin
        });

    if (!pdfResult.IsSuccess)
        throw new InvalidOperationException(pdfResult.Message);

    var pdfUrl = pdfResult.UnwrapSuccess().Data.Url;

    // 4. PDF indir
    using var http = new HttpClient();
    return await http.GetByteArrayAsync(pdfUrl, ct);
}
```

`InsurUpResult<T>` hata yönetimi ve `ServerError` / `ClientError` varyantları için bkz. [OAuth rehberi — Result pattern](/entegrasyon/insurup-ile-giris-oauth-entegrasyonu#result-pattern-sonuç-tipi).

---

## 8. Tam REST örneği (cURL)

Token alma adımı için bkz. [Servis Hesabı](/entegrasyon/servis-hesabi-olusturma) veya [OAuth giriş akışı](/entegrasyon/insurup-ile-giris-oauth-entegrasyonu).

```bash
# Önkoşul: geçerli access_token elinizde olsun
TOKEN="<access_token>"
PROPOSAL_ID="abc123-def456"

# 1. Teklif detayı (ACTIVE ürün id'lerini buradan alın)
curl -s "https://api.insurup.com/proposals/$PROPOSAL_ID" \
  -H "Authorization: Bearer $TOKEN"

# 2. PDF oluştur
PDF_URL=$(curl -s -X POST \
  "https://api.insurup.com/proposals/$PROPOSAL_ID/products/customer-document-pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"proposalId\": \"$PROPOSAL_ID\",
    \"proposalProductIds\": [\"prod-001\", \"prod-003\"],
    \"agentName\": \"Örnek Sigorta Acentesi\"
  }" | jq -r '.url')

# 3. PDF indir
curl -o musteri-belgesi.pdf "$PDF_URL"
```

---

## 9. Hata kodları

| HTTP | Açıklama | Önerilen aksiyon |
|------|----------|------------------|
| `400` | `proposalProductIds` boş veya geçersiz | En az bir geçerli ürün kimliği gönderin |
| `401` | Token geçersiz veya süresi dolmuş | Yeni access token alın (bkz. OAuth / Servis Hesabı rehberleri) |
| `403` | Yetersiz yetki | `proposal:write` veya `core-api` kapsamını doğrulayın; token'ın acente kullanıcısına ait olduğunu kontrol edin |
| `404` | Teklif bulunamadı | `proposalId` değerini kontrol edin |

:::info Sessiz filtreleme
`proposalProductIds` içinde `ACTIVE` olmayan veya primi olmayan ürünler gönderilirse API **hata dönmez**; bu ürünler PDF'e yazılmaz. Sonuçta ürün tablosu boş kalabilir — istek öncesinde filtreyi uygulayın.
:::

---

## 10. Sık sorulan sorular

**PDF'i doğrudan e-posta ile gönderebilir miyim?**  
Müşteri belgesi için hazır bir "gönder" endpoint'i yoktur. PDF'i `url` üzerinden indirip kendi e-posta veya bildirim altyapınız üzerinden iletebilirsiniz.

**Kaç ürün belgeye eklenebilir?**  
Teknik bir üst sınır yoktur; yalnızca `ACTIVE` durumunda ve primi olan ürünler PDF'e yazılır.

**PURCHASING veya PURCHASED ürünler neden PDF'te görünmüyor?**  
PDF oluşturma API'si yalnızca `ACTIVE` durumundaki ürünleri işler. Agent Panel'de bu ürünler seçilebilir görünse de belgeye dahil edilmezler.

**M2M (Servis Hesabı) ile `agentName` göndermeli miyim?**  
Evet, önerilir. Servis hesabı token'ında oturumdaki acente adı bağlamı olmayabilir; `agentName` gönderilmezse belge başlığında acente adı eksik kalabilir.

**Karşılaştırma PDF'i ile farkı nedir?**  
Karşılaştırma PDF'i (`POST .../compare-pdf`) detaylı teminat tablosu içerir ve acente kullanımına yöneliktir. Müşteri Belgesi, son müşteriye sunum için sadeleştirilmiş bir özet belgedir.

**Hangi token türünü kullanmalıyım?**  
İnsan kullanıcı girişi senaryosunda Authorization Code + PKCE ile alınan kullanıcı token'ı; otomasyon senaryosunda Servis Hesabı (client credentials) token'ı kullanılır. Her iki durumda da `proposal:write` veya `core-api` kapsamı gerekir.

**API şemasını nereden görebilirim?**  
Güncel OpenAPI belgesi: `https://api.insurup.com/openapi/v1.json`

---

## 11. İlgili rehberler

| Rehber | Ne zaman? |
|--------|-----------|
| [InsurUp ile Giriş (OAuth)](/entegrasyon/insurup-ile-giris-oauth-entegrasyonu) | Kullanıcı girişi, token alma, SDK kurulumu |
| [Servis Hesabı Oluşturma](/entegrasyon/servis-hesabi-olusturma) | Sunucu‑sunucu otomasyon |
| [Uygulama Desenleri ve Sorun Giderme](/entegrasyon/insurup-ile-giris-uygulama-desenleri-ve-sorun-giderme) | SPA / BFF desenleri, sık karşılaşılan hatalar |
