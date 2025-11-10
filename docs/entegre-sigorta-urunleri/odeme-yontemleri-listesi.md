---
sidebar_position: 4
---

# Ödeme Yöntemleri Listesi

Bu sayfa, InsurUp Web Satış Platformu entegrasyonunda kullanılabilecek ödeme yöntemlerini sigorta şirketleri bazında listeler. Web satış projelerinde kullanılabilecek ödeme yöntemleri hakkında detaylı bilgi için [InsurUp Web Satış Platformu Self-servis Kasko Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-kasko-entegrasyon-rehberi) ve [InsurUp Web Satış Platformu Self‑servis Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-entegrasyon-rehberi) dokümanlarına bakabilirsiniz.

**Önemli Not:** Robot ürünlerde satın alma isteği bulunmamaktadır. Satın alma işlemi yalnızca web servis ürünlerinde mevcuttur.

## Entegre Web Servis Şirketlerinin Ödeme Yöntemleri

Aşağıdaki tablo, en az bir web servis ürününe sahip sigorta şirketlerinin desteklediği ödeme yöntemlerini göstermektedir.

| Şirket                   | Credit Card | Open Account | Insurance Company Redirect | 3D Secure | 3rd Party 3D Secure |
| ------------------------ | ----------- | ------------ | --------------------------- | --------- | ------------------- |
| AK Sigorta               | ✓           | ✓            | ✓                           |           | ✓                   |
| Allianz Sigorta          | ✓           | ✓            | ✓                           |           | ✓                   |
| Anadolu Sigorta          | ✓           | ✓            | ✓                           |           | ✓                   |
| Ankara Sigorta           | ✓           | ✓            | ✓                           |           | ✓                   |
| AXA Sigorta              | ✓           | ✓            | ✓                           |           | ✓                   |
| Bereket Sigorta          | ✓           | ✓            | ✓                           |           | ✓                   |
| Corpus Sigorta           | ✓           | ✓            | ✓                           |           | ✓                   |
| Doğa Sigorta             | ✓           | ✓            |                             | ✓         | ✓                   |
| Eureko Sigorta           | ✓           | ✓            | ✓                           |           | ✓                   |
| Gulf Sigorta             | ✓           | ✓            | ✓                           |           | ✓                   |
| HDI Katılım Sigorta      | ✓           | ✓            | ✓                           |           | ✓                   |
| HDI Sigorta              | ✓           | ✓            | ✓                           |           | ✓                   |
| Koru Sigorta             | ✓           | ✓            | ✓                           |           | ✓                   |
| Magdeburger Sigorta      | ✓           |              |                             |           |                     |
| Mapfre Sigorta           | ✓           | ✓            | ✓                           |           | ✓                   |
| Neova Sigorta            | ✓           | ✓            | ✓                           |           | ✓                   |
| Nippon Sigorta           | ✓           | ✓            | ✓                           |           | ✓                   |
| Quick Sigorta            | ✓           | ✓            | ✓                           |           | ✓                   |
| Ray Sigorta              | ✓           | ✓            | ✓                           |           | ✓                   |
| Sompo Sigorta            | ✓           | ✓            | ✓                           |           | ✓                   |
| Türkiye Katılım Sigorta  | ✓           | ✓            | ✓                           |           | ✓                   |
| Türkiye Sigorta          | ✓           | ✓            |                             | ✓         | ✓                   |
| Unico Sigorta            | ✓           | ✓            | ✓                           |           | ✓                   |
| Zurich Sigorta           | ✓           | ✓            | ✓                           |           | ✓                   |

**Açıklamalar:**

- **Credit Card**: Doğrudan kart bilgileri girilerek poliçeleştirme yapılır (sync yöntem).
- **Open Account**: Sigorta şirketleriyle açık hesap anlaşması olan acente/brokerlar için geçerlidir. Direkt satın alma isteği gerçekleştirilir.
- **Insurance Company Redirect**: Kart bilgileri ve doğrulama, sigorta şirketinin ödeme sayfasında tamamlanır (async yöntem).
- **3D Secure**: Kart bilgileri acentenin web sitesinde toplanır; ödeme bankanın 3D Secure sayfasında doğrulanır (async yöntem).
- **3rd Party 3D Secure**: Sync yöntemdeki credit-card yöntemine sahip olup 3D Secure veya InsuranceCompanyRedirect olmayan sigorta şirketlerinde InsurUp'ın geliştirdiği ek bir yöntem. Müşteriden kart bilgilerinin alınması sonrasında 3. parti (Papara, QPay, Paratika) bir şirket ile kartı doğrular (async yöntem).

**Not:** Eğer bir web satış projesi yapılacaksa kullanılabilecek yöntemler async yöntemlerdir (3D Secure, Insurance Company Redirect, 3rd Party 3D Secure). Fakat bazı şirketler bazı ödeme tiplerini destekler. En güncel bilgi için InsurUp'dan bilgi alın.

