---
title: "Web Satış Platformu Uyumluluk Gereksinimleri"
sidebar_position: 6
slug: /entegrasyon/web-satis-platformu-uyumluluk-gereksinimleri
---

# Web Satış Platformu Uyumluluk Gereksinimleri

Bu döküman, InsurUp Web Satış Platformu ile B2C sigorta satışı yapmak isteyen acentelerin dikkat etmesi gereken yasal, teknik ve operasyonel uyumluluk gereksinimlerini kapsar. Platformu kullanmadan önce bu gereksinimlerin tamamlanmış olması gerekmektedir.

## 1. İzin türleri ve farkları

Web üzerinden sigorta satışı yapabilmek için iki farklı izin türü bulunmaktadır. Bu izinler birbirinden bağımsızdır ve her biri ayrı ayrı alınmalıdır.

### 1.1 Web servis izni

Web servis izni, sigorta şirketlerinin API'leri üzerinden teklif alabilmenizi sağlar. Bu izin:

- Sigorta şirketinden talep edilir
- Genellikle hızlı bir şekilde alınabilir
- CRM içinden 3D Secure ile satın alma yapabilmek için yeterlidir
- Her sigorta şirketi için ayrı ayrı alınmalıdır

Web servis izni aldığınızda, InsurUp CRM üzerinden ilgili şirketin tekliflerini alabilir ve temsilcileriniz aracılığıyla satış yapabilirsiniz.

### 1.2 Mesafeli satış izni

Mesafeli satış izni, müşterinin kendi başına web siteniz üzerinden doğrudan poliçe satın alabilmesi için gereklidir. Bu izin:

- Web servis izninden ayrı bir süreçtir
- Alınması aylar sürebilir
- Her sigorta şirketi için ayrı ayrı alınmalıdır
- Ek sermaye şartı ve TOBB kaydı gerektirebilir

**Önemli:** Mesafeli satış izni almadan bir sigorta şirketinin ürünlerini web sitenizde müşterinin doğrudan satın alabileceği şekilde sunamazsınız. Ancak bu şirketlerden teklif alıp CRM üzerinden temsilci aracılığıyla satış yapabilirsiniz.

### 1.3 İzin türlerinin karşılaştırması

| Özellik | Web Servis İzni | Mesafeli Satış İzni |
| --- | --- | --- |
| Teklif alma | Evet | Evet |
| CRM'den temsilci ile satış | Evet | Evet |
| Web sitesinden doğrudan satış | Hayır | Evet |
| Alım süresi | Hızlı (günler/haftalar) | Yavaş (aylar) |
| Sermaye şartı | Hayır | Evet |
| TOBB kaydı | Hayır | Evet |

## 2. Mesafeli satış için gereksinimler

### 2.1 Sermaye şartı

Mesafeli satış izni alabilmek için acentenin belirli bir sermaye şartını karşılaması gerekmektedir. Güncel mevzuata göre bu tutar yaklaşık 3,5-4 milyon TL civarındadır. Bu şart, sigorta şirketi ve ürün türüne göre değişiklik gösterebilir.

### 2.2 TOBB kaydı

Mesafeli satış faaliyeti için Türkiye Odalar ve Borsalar Birliği (TOBB) nezdinde uygun kayıt ve faaliyet belgesi gerekmektedir.

### 2.3 Sigorta şirketinden yazılı onay

Her sigorta şirketinden mesafeli satış için ayrı yazılı onay almanız gerekmektedir. Bu onay süreci şirketten şirkete farklılık gösterir ve genellikle şu adımları içerir:

1. Başvuru dilekçesi
2. Sermaye belgesi
3. TOBB faaliyet belgesi
4. Domain bilgileri
5. Teknik altyapı bilgileri

## 3. Domain ve web sitesi gereksinimleri

### 3.1 Domain bazlı izinler

Sigorta şirketlerinden alınan mesafeli satış izinleri domain bazlıdır. Bu demektir ki:

- Her domain için ayrı izin alınmalıdır
- Birden fazla domaininiz varsa her biri için ayrı başvuru yapılmalıdır
- Alt domainler için de izin gerekebilir (şirket politikasına göre değişir)
- Domain değişikliği yaparsanız yeni domain için tekrar izin almanız gerekir

**Örnek:** `sigortam.com.tr` domaini için izin aldıysanız, `sigortadukkani.com` domaininden satış yapmak için ayrı bir izin almanız gerekir.

### 3.2 SSL sertifikası

Web sitenizde mutlaka geçerli bir SSL sertifikası bulunmalıdır. HTTPS kullanımı zorunludur.

## 4. Marka ve logo kullanımı

### 4.1 Yazılı izin zorunluluğu

Bir sigorta şirketinin logosunu, markasını veya kurumsal kimlik unsurlarını web sitenizde göstermeden önce mutlaka o şirketten yazılı izin almanız gerekmektedir. Bu izin:

- Mesafeli satış izninden ayrı bir süreçtir
- Logo kullanım koşullarını içerir
- Hangi sayfalarda, nasıl kullanılacağını belirler
- Şirketin kurumsal kimlik kurallarına uyum gerektirir

### 4.2 Logo kullanımı olmadan çalışma

Yazılı izin almadan önce veya izin alamadığınız şirketler için:

- Şirket adını metin olarak yazabilirsiniz
- Logo veya marka görseli kullanamazsınız
- Şirketin kurumsal renklerini taklit etmekten kaçının

## 5. Ödeme ve 3D Secure gereksinimleri

### 5.1 3D Secure zorunluluğu

Web üzerinden yapılan sigorta satışlarında 3D Secure (3D doğrulama) kullanımı büyük önem taşır. Bazı sigorta şirketleri belirli ürünler için 3D Secure'ı zorunlu kılmaktadır.

| Durum | 3D Secure Gerekliliği |
| --- | --- |
| Zorunlu Trafik Sigortası | Bazı şirketlerde zorunlu (HDI, Türkiye Sigorta vb.) |
| Kasko | Şirkete göre değişir |
| Diğer branşlar | Şirkete göre değişir |

### 5.2 Şifreleme gereksinimleri

3D Secure kullanılmayan ödeme akışlarında bazı sigorta şirketleri kendi şifreleme algoritmalarını kullanmanızı isteyebilir. Bu algoritmalar şirketten şirkete farklılık gösterir ve entegrasyon sırasında teknik dokümantasyonları incelenmelidir.

### 5.3 Kart bilgisi saklama yasağı

Müşteri kart bilgileri hiçbir koşulda:

- Veritabanınızda saklanmamalıdır
- Log dosyalarına yazılmamalıdır
- Ekran görüntülerinde yer almamalıdır
- E-posta veya SMS ile iletilmemelidir

## 6. KVKK ve veri koruma

### 6.1 Açık rıza ve izinler

Web siteniz üzerinden toplanan tüm kişisel veriler için KVKK kapsamında gerekli izinlerin alınması zorunludur:

- Açık rıza metni
- Aydınlatma metni
- Pazarlama izinleri
- Veri işleme izinleri

### 6.2 Veri saklama

Kişisel veriler şifrelenmiş ortamlarda saklanmalıdır. TC kimlik numarası ve diğer hassas bilgiler özel koruma altında tutulmalıdır.

## 7. Entegrasyon öncesi kontrol listesi

Aşağıdaki kontrol listesi, web satış platformunu aktif etmeden önce tamamlanması gereken adımları özetler:

### 7.1 Yasal gereksinimler

- [ ] Sermaye şartı karşılandı
- [ ] TOBB kaydı tamamlandı
- [ ] KVKK metinleri hazırlandı
- [ ] Gizlilik politikası hazırlandı

### 7.2 Sigorta şirketi izinleri

Her çalışmak istediğiniz sigorta şirketi için:

- [ ] Web servis izni alındı
- [ ] Mesafeli satış izni alındı (web sitesinden doğrudan satış için)
- [ ] Logo kullanım izni alındı
- [ ] Domain onayı alındı

### 7.3 Teknik gereksinimler

- [ ] SSL sertifikası kuruldu
- [ ] 3D Secure entegrasyonu tamamlandı
- [ ] Şifreleme gereksinimleri karşılandı (varsa)

## 8. Sık yapılan hatalar

### 8.1 Web servis ve mesafeli satış izni karıştırma

Web servis izni almak, mesafeli satış yapma hakkı vermez. İki izin birbirinden bağımsızdır.

### 8.2 Domain değişikliğinde izin yenilememek

Domain değiştirildiğinde tüm sigorta şirketlerinden yeni domain için izin alınmalıdır.

### 8.3 Logo kullanımında izinsiz hareket

Sigorta şirketi logoları yazılı izin olmadan kullanılmamalıdır. Bu durum yasal sorunlara yol açabilir.

### 8.4 Tüm şirketlerden aynı anda izin bekleme

Mesafeli satış izinleri uzun sürebilir. İzin aldığınız şirketlerle başlayıp, diğerleri için süreci paralel yürütmeniz önerilir. Web servis izni olan ancak mesafeli satış izni olmayan şirketlerden de teklif alınabilir; bu teklifler CRM üzerinden temsilci aracılığıyla satışa dönüştürülebilir.

---

Bu döküman genel bilgilendirme amaçlıdır. Güncel mevzuat değişiklikleri ve sigorta şirketi politikaları için ilgili kurumlarla doğrudan iletişime geçmeniz önerilir. Entegrasyon sırasında oluşacak sorular için InsurUp teknik ekibiyle iletişime geçebilirsiniz.
