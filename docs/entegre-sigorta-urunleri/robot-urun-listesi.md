---
sidebar_position: 2
---

# Robot Ürün Listesi

InsurUp’ın Robot (RPA) entegrasyon katmanı, web servisi bulunmayan ya da tercih edilmeyen durumlarda sigorta şirketlerinin ekranlarına otomatik olarak giriş yapar; teklif, poliçe ve üretim mutabakatı işlemlerini bir insan operatör gibi gerçekleştirir.

RPA yaklaşımı, API erişiminin mümkün olmadığı durumlarda süreçleri otomatikleştirerek operasyonel verimliliği artırır.

**Özet İstatistikler**

| Özet | Değer |
| ---- | ----- |
| Aktif Şirket Sayısı | 24 (en az bir branşta entegrasyon olan) |
| Branş Sayısı | 3 (Kasko, Trafik, TSS) |
| Toplam Ürün Sayısı | 51 (her ✓ bir ürün entegrasyonunu temsil eder) |
| Paketli Ürün Sayısı | 21 (tek teklif isteğinde aynı robotun döndüğü ek paketli pirim versiyonları) |

## Entegre Robot Ürünleri

| Sigorta Şirketi | Kasko | Kasko Paketli | Trafik | Trafik Paketli | TSS | TSS Paketli |
|-----------------|-------|---------------|--------|----------------|-----|-------------|
| Acıbadem        |       |               |        |                | ✓   |             |
| AcnTürk         |       |               |        |                |     |             |
| Ak              | ✓     |               | ✓      |                | ✓   |             |
| Allianz         | ✓     | <abbr title="Allianz Eko Kasko AIR · Allianz Markalı Kasko AIR">2</abbr> | ✓      | <abbr title="Allianz Kapsamlı Trafik AIR">1</abbr> | ✓   | <abbr title="Allianz Tss Yatarak + Ayakta (4 adet) Robot · Allianz Tss Yatarak + Ayakta (10 adet) Robot">2</abbr> |
| Ana             |       |               |        |                |     |             |
| Anadolu         |       |               |        |                |     |             |
| Ankara          |       |               | ✓      |                | ✓   | <abbr title="Ankara Eko Network Yatarak Tedavi Robot · Ankara Eko Network Yatarak ve Ayakta Tedavi Robot · Ankara Geniş Network Yatarak Tedavi Robot">3</abbr> |
| AtlasMutel      |       |               |        |                |     |             |
| Aveon           |       |               |        |                |     |             |
| Axa             |       |               |        |                |     |             |
| Bereket         | ✓     |               | ✓      |                |     |             |
| Corpus          | ✓     |               | ✓      |                |     |             |
| Doğa            | ✓     |               | ✓      |                | ✓   |             |
| Dubai           |       |               |        |                |     |             |
| Ethica          |       |               |        |                |     |             |
| Eureko          | ✓     |               | ✓      |                |     |             |
| Generali        | ✓     |               | ✓      |                |     |             |
| Gri             |       |               |        |                |     |             |
| Groupama        |       |               |        |                |     |             |
| Gulf            | ✓     |               |        |                |     |             |
| Halk            |       |               |        |                |     |             |
| HDI             | ✓     |               | ✓      |                | ✓   |             |
| Hepiyi          | ✓     | <abbr title="Hepiyi Premium Kasko Bot">1</abbr> | ✓      |                | ✓   | <abbr title="Hepiyi Tss Pekiyi-Geniş Network · Hepiyi Tss Pekiyi Avantaj-Geniş Network">2</abbr> |
| Koru            | ✓     |               | ✓      |                |     |             |
| Magdeburger     | ✓     |               |        |                | ✓   |             |
| Mapfre          | ✓     |               | ✓      |                |     |             |
| Neova           |       |               |        |                |     |             |
| Nippon          | ✓     |               |        |                |     |             |
| Orient          | ✓     |               |        |                |     |             |
| Prive           | ✓     |               |        |                |     |             |
| Quick           | ✓     | <abbr title="Quick Kasko Sigortası Taksitli Fiyat Bot · Quick Sigorta Kaskonomiq Air">2</abbr> | ✓      |                | ✓   |             |
| Ray             |       |               | ✓      |                |     |             |
| Sompo           | ✓     | <abbr title="Sompo Servis Seçimli Kasko AIR · Sompo Bütçe Dostu Kasko AIR · Sompo Mini Kasko AIR">3</abbr> | ✓      | <abbr title="Sompo Ek Teminatlı Trafik AIR">1</abbr> | ✓   |             |
| Şeker           |       |               |        |                |     |             |
| Tmt             |       |               |        |                |     |             |
| Türkiye         | ✓     |               | ✓      |                | ✓   | <abbr title="Türkiye Genç Tss Air · Türkiye Genç Tss Ekstra Air · Türkiye Tss YT Air · Türkiye Tss YT+AT (5 Adet) Air">4</abbr> |
| Türkiye Katılım | ✓     |               | ✓      |                | ✓   |             |
| Unico           | ✓     |               | ✓      |                |     |             |
| Zurich          |       |               |        |                |     |             |

**✓** işareti bulunan alanlar, ilgili sigorta şirketinin o branşta robot entegrasyonuna sahip olduğunu göstermektedir.

**Paketli** sütunlarındaki sayı, o branşta tek bir teklif isteğine karşılık robotun kullanıcıya ayrıca döndüğü sigorta şirketi ürün versiyonunu gösterir; sayının üzerine gelindiğinde ürün adları görünür. Sigorta şirketinin her istekte bu versiyonların tamamını fiyatlamadığı, hiç dönmeyen versiyonların ise listeye alınmadığı unutulmamalıdır.

## Paketli Robot Ürünleri

Yukarıdaki tabloda sayı olarak gösterilen paketli ürünlerin tam listesi aşağıdadır.

| Sigorta Şirketi | Branş  | Paketli Ürün                                      |
|-----------------|--------|---------------------------------------------------|
| Allianz         | Kasko  | Allianz Eko Kasko AIR                             |
| Allianz         | Kasko  | Allianz Markalı Kasko AIR                         |
| Allianz         | Trafik | Allianz Kapsamlı Trafik AIR                       |
| Allianz         | TSS    | Allianz Tss Yatarak + Ayakta (4 adet) Robot       |
| Allianz         | TSS    | Allianz Tss Yatarak + Ayakta (10 adet) Robot      |
| Ankara          | TSS    | Ankara Eko Network Yatarak Tedavi Robot           |
| Ankara          | TSS    | Ankara Eko Network Yatarak ve Ayakta Tedavi Robot |
| Ankara          | TSS    | Ankara Geniş Network Yatarak Tedavi Robot         |
| Hepiyi          | Kasko  | Hepiyi Premium Kasko Bot                          |
| Hepiyi          | TSS    | Hepiyi Tss Pekiyi-Geniş Network                   |
| Hepiyi          | TSS    | Hepiyi Tss Pekiyi Avantaj-Geniş Network           |
| Quick           | Kasko  | Quick Kasko Sigortası Taksitli Fiyat Bot          |
| Quick           | Kasko  | Quick Sigorta Kaskonomiq Air                      |
| Sompo           | Kasko  | Sompo Servis Seçimli Kasko AIR                    |
| Sompo           | Kasko  | Sompo Bütçe Dostu Kasko AIR                       |
| Sompo           | Kasko  | Sompo Mini Kasko AIR                              |
| Sompo           | Trafik | Sompo Ek Teminatlı Trafik AIR                     |
| Türkiye         | TSS    | Türkiye Genç Tss Air                              |
| Türkiye         | TSS    | Türkiye Genç Tss Ekstra Air                       |
| Türkiye         | TSS    | Türkiye Tss YT Air                                |
| Türkiye         | TSS    | Türkiye Tss YT+AT (5 Adet) Air                    |
