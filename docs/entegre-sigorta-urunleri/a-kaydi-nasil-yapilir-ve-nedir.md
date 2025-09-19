---
sidebar_position: 4
---

# A Kaydı Nasıl Yapılır ve Nedir

A Kaydı, sigorta şirketlerinin InsurUp entegrasyonu için domain DNS konfigürasyonu sürecidir. Bu rehber, sigorta şirketlerinin domain'lerini InsurUp sunucusuna nasıl yönlendireceğini ve A kaydı konfigürasyonunu nasıl yapacağını detaylı olarak açıklamaktadır.

## A Kaydı Nedir?

A Kaydı (A Record), DNS (Domain Name System) konfigürasyonunda domain adını belirli bir IP adresine yönlendiren kayıttır. InsurUp entegrasyonu için:

- **Domain Yönlendirme**: Sigorta şirketinin domain'ini InsurUp sunucusuna yönlendirme
- **IP Adresi**: 46.20.150.244 adresine yönlendirme
- **WWW ve Non-WWW**: Hem www'li hem de www'siz versiyonların yönlendirilmesi
- **Entegrasyon Hazırlığı**: InsurUp sistemine bağlantı için gerekli altyapı

## A Kaydı Neden Önemlidir?

### 1. InsurUp Entegrasyonu
- Sigorta şirketinin InsurUp sistemine bağlanabilmesi için gerekli
- Web servis ve robot entegrasyonları için temel altyapı
- Güvenli veri transferi için SSL sertifikası desteği

### 2. Teknik Gereklilik
- InsurUp'un sigorta şirketi sistemlerine erişebilmesi için
- API bağlantıları ve webhook'lar için gerekli
- Sistem güvenliği ve doğrulama için

### 3. Süreklilik
- Entegrasyon sürecinin kesintisiz çalışması için
- Otomatik senkronizasyon için gerekli
- Hata durumlarında alternatif erişim yolları

## A Kaydı Nasıl Yapılır?

### Adım 1: Gerekli Bilgilerin Hazırlanması

A Kaydı yapabilmek için aşağıdaki bilgilere ihtiyaç vardır:

#### Domain Bilgileri
- **Domain Adı**: Sigorta şirketinin domain'i (örn: sigortasirketi.com)
- **Subdomain**: Gerekli subdomain'ler (api, webhook, vb.)
- **Mevcut DNS Yönetimi**: Domain'in hangi sağlayıcıda yönetildiği

#### InsurUp Bilgileri
- **IP Adresi**: 46.20.150.244
- **WWW Versiyonu**: www.sigortasirketi.com
- **Non-WWW Versiyonu**: sigortasirketi.com
- **SSL Sertifikası**: HTTPS desteği için

### Adım 2: DNS Sağlayıcısına Erişim

1. **Domain Yönetim Paneline Giriş**
   - Domain sağlayıcınızın yönetim paneline gidin
   - Domain yönetimi bölümüne erişin
   - DNS ayarları sekmesini açın

2. **Mevcut Kayıtları Kontrol Etme**
   - Mevcut A kayıtlarını listeleyin
   - Çakışan kayıtları tespit edin
   - Gerekli değişiklikleri planlayın

### Adım 3: A Kaydı Konfigürasyonu

#### Ana Domain A Kaydı
```
Kayıt Türü: A
İsim: @ (veya boş)
Değer: 46.20.150.244
TTL: 3600 (1 saat)
```

#### WWW Subdomain A Kaydı
```
Kayıt Türü: A
İsim: www
Değer: 46.20.150.244
TTL: 3600 (1 saat)
```

#### CNAME Alternatifi (Önerilen)
```
Kayıt Türü: CNAME
İsim: www
Değer: sigortasirketi.com
TTL: 3600 (1 saat)
```

### Adım 4: Ek DNS Kayıtları

#### API Subdomain (Gerekirse)
```
Kayıt Türü: A
İsim: api
Değer: 46.20.150.244
TTL: 3600 (1 saat)
```

#### Webhook Subdomain (Gerekirse)
```
Kayıt Türü: A
İsim: webhook
Değer: 46.20.150.244
TTL: 3600 (1 saat)
```

### Adım 5: DNS Propagasyon Bekleme

1. **Değişiklikleri Kaydetme**
   - Tüm DNS kayıtlarını kaydedin
   - Değişiklikleri onaylayın
   - Sistem güncellemesini bekleyin

2. **Propagasyon Süreci**
   - DNS değişiklikleri 24-48 saat sürebilir
   - Global DNS sunucularında güncellenme
   - Cache temizleme süreçleri

## A Kaydı Sonrası Süreç

### Doğrulama ve Test

1. **DNS Kontrolü**
   ```bash
   nslookup sigortasirketi.com
   nslookup www.sigortasirketi.com
   ```

2. **Ping Testi**
   ```bash
   ping sigortasirketi.com
   ping www.sigortasirketi.com
   ```

3. **Online DNS Kontrol Araçları**
   - whatsmydns.net
   - dnschecker.org
   - mxtoolbox.com

### InsurUp Entegrasyon Testi

1. **Bağlantı Testi**
   - InsurUp teknik ekibi ile koordinasyon
   - API endpoint'lerinin test edilmesi
   - SSL sertifikası doğrulaması

2. **Entegrasyon Onayı**
   - Teknik testlerin başarılı olması
   - InsurUp tarafından onay
   - Entegrasyon sürecinin başlatılması

## Sık Karşılaşılan Sorunlar ve Çözümleri

### 1. DNS Propagasyon Gecikmesi

**Sorun**: A kaydı değişiklikleri hemen aktif olmuyor
**Çözüm**: 
- 24-48 saat bekleme süresi normaldir
- DNS cache'i temizleme
- Farklı DNS sunucularından test etme

### 2. Çakışan DNS Kayıtları

**Sorun**: Mevcut A kayıtları ile çakışma
**Çözüm**:
- Mevcut kayıtları kontrol edin
- Çakışan kayıtları silin veya değiştirin
- DNS sağlayıcısından destek alın

### 3. SSL Sertifika Sorunları

**Sorun**: HTTPS bağlantısı kurulamıyor
**Çözüm**:
- SSL sertifikasının geçerli olduğunu kontrol edin
- Wildcard sertifika kullanımı
- Let's Encrypt gibi ücretsiz sertifika seçenekleri

### 4. Subdomain Erişim Sorunları

**Sorun**: Alt domain'ler çalışmıyor
**Çözüm**:
- Her subdomain için ayrı A kaydı oluşturun
- CNAME kayıtlarını kontrol edin
- DNS sağlayıcısının subdomain desteğini kontrol edin

## Destek ve İletişim

A Kaydı konfigürasyonu sürecinde teknik destek için:

### InsurUp Teknik Destek
- **E-posta**: teknik@insurup.com
- **Telefon**: 0850 XXX XX XX
- **WhatsApp**: +90 XXX XXX XX XX

### DNS Sağlayıcısı Desteği
- **Domain sağlayıcınızın müşteri hizmetleri**
- **Online dokümantasyon ve rehberler**
- **Canlı destek chat'i**

### Destek Saatleri
- **Pazartesi-Cuma**: 09:00 - 18:00
- **Cumartesi**: 09:00 - 13:00
- **Pazar**: Kapalı

## Güvenlik ve En İyi Uygulamalar

### DNS Güvenliği
- DNS kayıtlarının düzenli kontrolü
- Yetkisiz değişikliklerin takibi
- DNS hijacking koruması

### Performans Optimizasyonu
- Uygun TTL değerleri kullanma
- DNS cache optimizasyonu
- CDN entegrasyonu (gerekirse)

### Yedekleme ve İzleme
- DNS konfigürasyonunun yedeklenmesi
- DNS uptime monitoring
- Otomatik bildirimler

## Sık Sorulan Sorular (SSS)

### A Kaydı ne kadar sürer?
DNS değişiklikleri genellikle 24-48 saat içinde global olarak aktif olur. Bazı durumlarda 72 saate kadar sürebilir.

### A Kaydı ücretli midir?
DNS konfigürasyonu genellikle domain sağlayıcısının sunduğu temel hizmet kapsamındadır. Ek ücret gerektirmez.

### A Kaydını geri alabilir miyim?
Evet, DNS kayıtlarını istediğiniz zaman eski haline döndürebilirsiniz. Ancak bu işlem InsurUp entegrasyonunu etkileyebilir.

### Birden fazla subdomain ekleyebilir miyim?
Evet, gerekli subdomain'ler için ayrı A kayıtları oluşturabilirsiniz. Her biri 46.20.150.244 adresine yönlendirilmelidir.

### SSL sertifikası gerekli midir?
Evet, güvenli bağlantı için SSL sertifikası gereklidir. InsurUp entegrasyonu HTTPS üzerinden çalışır.

---

Bu rehber, sigorta şirketlerinin InsurUp entegrasyonu için gerekli DNS A kaydı konfigürasyonunu detaylı şekilde açıklamaktadır. Teknik sorularınız için InsurUp teknik destek ekibiyle iletişime geçebilirsiniz.
