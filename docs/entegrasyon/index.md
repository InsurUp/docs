---
title: Entegrasyon
sidebar_position: 4
---

# Entegrasyon

InsurUp ile sistemlerinizi entegre ederken kullanabileceğiniz başlıca rehberler ve entegrasyon yaklaşımlarını bu bölümde bulabilirsiniz. Aşağıdaki içerikler, web satış platformları ve olay bazlı bildirim (webhook) akışlarını kapsar.

## Bu bölümde neler var?

- [InsurUp Web Satış Platformu Self‑servis Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-entegrasyon-rehberi): B2C akışında müşteri oturumundan teklif/poliçe ve ödeme süreçlerine kadar uçtan uca entegrasyon adımları.
- [InsurUp Web Satış Platformu Self‑servis Kasko Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-kasko-entegrasyon-rehberi): Kasko branşı için uçtan uca entegrasyon rehberi.
- [InsurUp Web Satış Platformu Self‑servis Tamamlayıcı Sağlık (TSS) Entegrasyon Rehberi](/entegrasyon/insurup-web-satis-platformu-self-servis-tss-entegrasyon-rehberi): Tamamlayıcı Sağlık Sigortası (TSS) teklifi alıp poliçe satışı yapmak için InsurUp API'lerini kullanma rehberi.
- [Tamamlayıcı Sağlık'ta Aile Kurgusu ve Entegrasyonu](/entegrasyon/tss-aile-entegrasyonu): TSS tekliflerinde aile üyeleri (eş, çocuk) için teklif alma ve poliçe oluşturma rehberi.
- [Webhook API Entegrasyonu](/entegrasyon/webhook-api-entegrasyonu): InsurUp tarafından tetiklenen async/sync webhook event'leri, imza doğrulama ve örnek payload'lar.
- [SignalR Entegrasyonu](/entegrasyon/signalr-entegrasyonu): Teklif ürünü prim/satın alma yaşam döngüsünü anlık (real‑time) takip etmek için `/hubs/proposal-detail` üzerinden event akışı; bağlantı, yetkilendirme ve istemci örnekleri.
- [Web Satış Platformunda Şubeli Yapı Kullanımları](/entegrasyon/web-satis-platformunda-subeli-yapi-kullanimlari): Partner siteler, alt acenteler ve beyaz etiket platformlar için şube (branch) yapısı entegrasyonu.
- [Servis Hesabı Oluşturma ve Kullanım Kılavuzu](/entegrasyon/servis-hesabi-olusturma): Servis hesabı oluşturma, Client ID/Secret ile token alma (M2M Authentication) ve API'ye erişim rehberi.
- [InsurUp ile Giriş (OAuth 2.0 / OIDC) Entegrasyon Rehberi](/entegrasyon/insurup-ile-giris-oauth-entegrasyonu): Kendi uygulamanıza "InsurUp ile Giriş" eklemek için OAuth istemcisi oluşturma, Authorization Code + PKCE akışı ve token kullanımı.
- [InsurUp ile Giriş: Uygulama Desenleri ve Sorun Giderme](/entegrasyon/insurup-ile-giris-uygulama-desenleri-ve-sorun-giderme): SPA ve sunucu (BFF) desenleri, örnek kurulum ve sık karşılaşılan sorunların (scope/`core-api`, proxy yönlendirme, çıkış, oturum geri yükleme) çözümleri.

## Kimler için?

- Kendi web satış platformunu InsurUp’a bağlamak isteyen acente ve broker IT ekipleri.
- Gerçek zamanlı bildirim ve iş akışlarını webhook’lar üzerinden yönetmek isteyen ekipler.

## Nasıl başlarım?

Önce genel mimariyi ve ihtiyaçları anlamak için self‑servis entegrasyon rehberini inceleyin. Sonrasında, gerçek zamanlı olayları sisteminize aktarmak için webhook entegrasyonunu yapılandırın.
