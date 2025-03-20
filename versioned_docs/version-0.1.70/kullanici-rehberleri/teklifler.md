---
title: "Teklifler"
sidebar_position: 5
---

# Teklifler

Teklifler modülü, acenteler tarafından çalışılan tekliflerin listelendiği bölümdür. Bu ekranda, farklı sigorta branşları için yapılan teklifleri inceleyebilir, teklif detaylarına erişebilir ve yeni teklifler oluşturabilirsiniz.

## Teklif Listesi

- **ID**: Her teklifin benzersiz kimlik numarası.
- **Branş**: Teklifin hangi sigorta branşı (Kasko, Konut, Trafik vb.) için yapıldığını gösterir.
- **Sigortalı**: Teklifin düzenlendiği kişinin adı ve T.C. kimlik numarası.
- **Durum**: Teklifin başarılı mı yoksa başarısız mı olduğunu gösterir.
- **Prim Aralığı**: Teklif edilen en düşük ve en yüksek prim tutarlarını içerir.
- **Ürünler**: Teklifin kaç ürün içerdiği ve tamamlanma oranını gösterir.
- **Oluşturulma Tarihi**: Teklifin oluşturulduğu tarihi gösterir.
- **Oluşturan Kullanıcı**: Teklifi oluşturan kullanıcı bilgisi.

## Ana Özellikler

### Sütun Ayarları

Liste görünümünde hangi bilgilerin görüntüleneceğini seçmek için **Sütun Ayarları** alanını kullanabilirsiniz. Tekliflerin görüntülenme düzenini özelleştirebilirsiniz.

### Veri İndirme

**Veri İndirme** butonuna tıklayarak teklif verilerini Excel formatında indirebilir ve raporlamalar için kullanabilirsiniz.

### Yeni Teklif Oluşturma

Sağ üst köşede bulunan **+ Teklif Al** butonuna basarak yeni bir teklif formu açabilirsiniz. Burada branş seçimi yaparak (Kasko, Konut, Trafik, TSS gibi) ilgili teklif formuna yönlendirilirsiniz.

### Detaylara Erişim

- **ID**: Teklif listesinde sol kısımda yer alan ID'ye tıklayarak teklif detay sayfasına gidebilirsiniz.
- **Aksiyonlar**: Sağdaki bilgi (**i**) simgesine tıklayarak da teklifin detaylarına erişim sağlayabilirsiniz.

### Sayfa Geçişleri

Ekranın sağ alt kısmında, teklif listesindeki sayfalar arasında ileri/geri geçiş yapabileceğiniz butonlar bulunmaktadır.

:::tip
Teklif detay sayfasında, teklifin içeriği hakkında daha fazla bilgiye erişebilir ve gerektiğinde revizyon yapabilirsiniz.
:::

### Channel Değerleri

`channel` alanında kullanılabilecek değerler aşağıdaki gibidir:

| Değer | JSON Değeri | Açıklama |
|-------|-------------|-----------|
| Unknown | UNKNOWN | Bilinmeyen kanal |
| Manual | MANUAL | Manuel giriş |
| Website | WEBSITE | Web sitesi üzerinden |
| GoogleAds | GOOGLE_ADS | Google Ads üzerinden |
| CallCenter | CALL_CENTER | Çağrı merkezi üzerinden |
| SocialMedia | SOCIAL_MEDIA | Sosyal medya üzerinden |
| MobileApp | MOBILE_APP | Mobil uygulama üzerinden |
| OfflineProposalForm | OFFLINE_PROPOSAL_FORM | Çevrimdışı teklif formu |
| Field | FIELD | Saha satışı |
| PrintMedia | PRINT_MEDIA | Basılı medya |
| FairEvent | FAIR_EVENT | Fuar ve etkinlikler |
| BusinessPartner | BUSINESS_PARTNER | İş ortağı |
| Chatbot | CHATBOT | Chatbot üzerinden |