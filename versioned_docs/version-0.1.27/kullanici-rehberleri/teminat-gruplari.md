---
title: "Teminat Grupları"
sidebar_position: 12
---

# Teminat Grupları

Teminat Grupları modülü, belirli sigorta ürünleri için farklı teminat setlerini “n” sayıda tanımlayarak bu setleri teklif süreçlerinde kullanmanıza olanak sağlar. Her bir sigorta branşı (örn. Kasko, Konut) için özelleştirilmiş teminat paketleri oluşturabilirsiniz. Ayrıca oluşturulan paketler sonradan düzenlenebilir veya silinebilir. Bu paketler, teklif hazırlarken teminat seçeneklerini hızlı bir şekilde seçmenize ve ilgili poliçeye dahil etmenize olanak tanır.

## Yeni Teminat Grubu Ekleme

**"+"** butonuna tıklanarak yeni bir teminat grubu eklenebilir.

| Özellikler                | Açıklama                                                                          |
|---------------------------|-----------------------------------------------------------------------------------|
| **Teminat Grubu Adı**     | Oluşturulacak pakete uygun bir isim verilir (örn. "Yüksek Teminat Paketi").       |
| **Ürün Branşı Seçimi**    | Teminat paketi, hangi ürün branşı (Kasko, Konut vb.) ile ilişkilendirilecekse buradan seçim yapılır. Ürün branşı seçildiğinde o branşa ait teminat kalemleri otomatik olarak gelir. |

### Branşa Özel Teminat Kalemleri

#### Kasko

- **FK Limit**, **IMM Limit**
- **Onarım Servis Türü**
- **Kullanılacak Yedek Parça Türü**
- **Manevi Tazminat**
- **Cam Kırılma Muafiyeti**
- **Kiralık Araç Süresi**

#### Konut

- **Eşya Bedeli**
- **Cam Bedeli**
- **Elektronik Cihaz Bedeli**
- **İzolasyon Bedeli**

## Sütun Ayarları

Tablodaki bilgileri ihtiyacınıza göre görüntülemek için **Sütun Ayarları** alanını kullanabilirsiniz. Sütunları ekleyebilir veya kaldırabilirsiniz.

## Veri İndirme

**Veri İndirme** butonuna tıklayarak mevcut teminat grupları listesini Excel formatında bilgisayarınıza indirebilirsiniz.

## Listeleme ve Arama

Teminat Grupları ekranında tüm mevcut teminat paketleri listelenir. Her paketin **"Id"**, **"İsim"**, **"Ürün Branşı"**, **"Oluşturma Tarihi"**, **"Oluşturan Kullanıcı"** ve **"Son Güncelleyen Kullanıcı"** bilgileri görünür. Kullanıcı bu bilgileri baz alarak arama ve sıralama yapabilir.

| Sütun                  | Açıklama                                                                          |
|------------------------|-----------------------------------------------------------------------------------|
| **Id**                 | Teminat grubunun benzersiz kimlik numarası.                                       |
| **İsim**               | Teminat grubunun adı.                                                             |
| **Ürün Branşı**        | Teminat paketinin ilişkilendirildiği ürün branşı (örn. Kasko, Konut).             |
| **Oluşturma Tarihi**   | Teminat grubunun oluşturulduğu tarih.                                             |
| **Oluşturan Kullanıcı**| Teminat paketini oluşturan kullanıcı bilgisi.                                     |
| **Son Güncelleyen Kullanıcı** | En son güncelleme yapan kullanıcı bilgisi.                                 |

:::tip
Yeni bir teminat grubu eklerken, ilgili branşa ait doğru teminat kalemlerini seçmek poliçe tekliflerinde doğruluğu sağlar.
:::