---
title: Entegrasyon
sidebar_position: 4
---

# Entegrasyon

InsurUp ile sistemlerinizi entegre ederken kullanabileceğiniz başlıca rehberler ve entegrasyon yaklaşımlarını bu bölümde bulabilirsiniz. Aşağıdaki içerikler web satış platformları, CRM/B2B senkronu, kimlik doğrulama ve olay bazlı bildirim (webhook) akışlarını kapsar.

## Bu bölümde neler var?

### Web satış platformu (B2C)

- [InsurUp Web Satış Platformu Self‑servis Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-entegrasyon-rehberi): B2C akışında müşteri oturumundan teklif/poliçe ve ödeme süreçlerine kadar uçtan uca entegrasyon adımları.
- [InsurUp Web Satış Platformu Self‑servis Kasko Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-kasko-entegrasyon-rehberi): Kasko branşı için uçtan uca entegrasyon rehberi.
- [InsurUp Web Satış Platformu Self‑servis Tamamlayıcı Sağlık (TSS) Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-tss-entegrasyon-rehberi): Tamamlayıcı Sağlık Sigortası (TSS) teklifi alıp poliçe satışı yapmak için InsurUp API'lerini kullanma rehberi.
- [Tamamlayıcı Sağlık'ta Aile Kurgusu ve Entegrasyonu](/entegrasyon/tss-aile-entegrasyonu): TSS tekliflerinde aile üyeleri (eş, çocuk) için teklif alma ve poliçe oluşturma rehberi.
- [Mobil Projeler İçin Web Satış Platformu Entegrasyonu](/entegrasyon/mobil-projeler-icin-web-satis-platformu-entegrasyonu): iOS, Android ve cross-platform uygulamalara özgü gereksinimler.
- [Web Satış Platformu Uyumluluk Gereksinimleri](/entegrasyon/web-satis-platformu-uyumluluk-gereksinimleri): Mevzuat, 3D Secure ve entegrasyon öncesi kontrol listesi.
- [Web Satış Platformunda Şubeli Yapı Kullanımları](/entegrasyon/web-satis-platformunda-subeli-yapi-kullanimlari): Partner siteler, alt acenteler ve beyaz etiket platformlar için şube (branch) yapısı entegrasyonu.

### CRM ve B2B

- [B2B / CRM Entegrasyonu](/entegrasyon/b2b-crm-entegrasyonu): Agent user kimlik doğrulaması, teklif alma ve sync poliçeleştirme akışları.
- [GraphQL CRM Liste Ekranları Entegrasyon Rehberi](/entegrasyon/graphql-crm-liste-entegrasyonu): Agent Panel'deki müşteri, vaka, teklif ve poliçe liste ekranlarına karşılık gelen GraphQL sorguları (`customersNew`, `casesNew`, `proposalsNew`, `policiesNew`), filtre/arama, cursor sayfalama ve OAuth scope'ları. [HTML sürüm](pathname:///entegrasyon/graphql-crm-list-integration.html).
- [InsurUp ile Giriş (OAuth 2.0 / OIDC) Entegrasyon Rehberi](/entegrasyon/insurup-ile-giris-oauth-entegrasyonu): Kendi uygulamanıza "InsurUp ile Giriş" eklemek için OAuth istemcisi oluşturma, Authorization Code + PKCE akışı ve token kullanımı.
- [InsurUp ile Giriş: Uygulama Desenleri ve Sorun Giderme](/entegrasyon/insurup-ile-giris-uygulama-desenleri-ve-sorun-giderme): SPA ve sunucu (BFF) desenleri, örnek kurulum ve sık karşılaşılan sorunların (scope/`core-api`, proxy yönlendirme, çıkış, oturum geri yükleme) çözümleri.
- [Servis Hesabı Oluşturma ve Kullanım Kılavuzu](/entegrasyon/servis-hesabi-olusturma): Servis hesabı oluşturma, Client ID/Secret ile token alma (M2M Authentication) ve API'ye erişim rehberi.

### Olay bazlı bildirimler

- [Webhook API Entegrasyonu](/entegrasyon/webhook-api-entegrasyonu): InsurUp tarafından tetiklenen async/sync webhook event'leri, imza doğrulama ve örnek payload'lar.

## Kimler için?

- Kendi web satış platformunu InsurUp’a bağlamak isteyen acente ve broker IT ekipleri.
- Harici CRM’lerini Agent Panel liste ekranlarıyla senkronize etmek isteyen B2B partnerleri.
- Gerçek zamanlı bildirim ve iş akışlarını webhook’lar üzerinden yönetmek isteyen ekipler.

## Nasıl başlarım?

- **Web satış (B2C):** Genel mimariyi anlamak için [self‑servis entegrasyon rehberini](/entegrasyon/insurup-web-satis-platformu-self-servis-entegrasyon-rehberi) inceleyin; ardından webhook entegrasyonunu yapılandırın.
- **CRM senkronu (B2B):** [InsurUp ile Giriş](/entegrasyon/insurup-ile-giris-oauth-entegrasyonu) ile personel token’ı alın, ardından [GraphQL CRM liste rehberi](/entegrasyon/graphql-crm-liste-entegrasyonu) ile müşteri/vaka/teklif/poliçe listelerini çekin.
