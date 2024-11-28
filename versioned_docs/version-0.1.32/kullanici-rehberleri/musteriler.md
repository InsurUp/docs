---
title: "Müşteriler"
sidebar_position: 9
---

# Müşteriler

Müşteriler modülü, acentelerin tüm müşteri bilgilerini yönetebileceği bir alan sunar. Bu modül sayesinde bireysel ve kurumsal müşteriler listelenebilir, yeni müşteri eklenebilir, mevcut müşteriler güncellenebilir veya silinebilir. Ayrıca, kullanıcılar filtreleme ve sütun ayarları yaparak müşteri listelerini özelleştirebilir.

## Listeleme Alanı

Tüm müşteriler tablo formatında listelenir. Liste özelleştirilmesi **“Sütun Ayarları”** kısmından yapılabilir. Bu tabloda şu sütunlar yer alır:

| Sütun              | Açıklama                                                                          |
|--------------------|-----------------------------------------------------------------------------------|
| **Id**             | Her müşterinin benzersiz kimlik numarası.                                         |
| **Sigortalı**      | Müşterinin adı ve soyadı.                                                         |
| **E-Mail**         | Müşterinin e-posta adresi.                                                        |
| **Telefon Numarası** | Müşterinin telefon numarası.                                                    |
| **Oluşturulma Tarihi** | Müşterinin sisteme eklenme tarihi.                                             |

## Sütun Ayarları

Tablodaki bilgileri ihtiyacınıza göre görüntülemek için **Sütun Ayarları** alanını kullanabilirsiniz. Sütunları ekleyebilir veya kaldırabilirsiniz.

## Veri İndirme

**Veri İndirme** butonuna tıklayarak mevcut müşteri listesini Excel formatında bilgisayarınıza indirebilirsiniz.

## Filtreleme

Üst menüde yer alan **Filtre** alanı kullanılarak kimlik numaraları filtrelenebilir. Örneğin, müşteri adlarına veya kimlik bilgilerine göre arama yapılabilir. Bu sayede, büyük bir liste içinde kolaylıkla aradığınız müşteriye ulaşabilirsiniz.

:::info
Filtreleme özelliği, müşteri listelerinde arama yapmayı kolaylaştırır ve zaman kazandırır.
:::

## Müşteri Ekleme

Ekranın sağ üst köşesindeki **"+"** butonu ile yeni bir müşteri ekleyebilirsiniz:

- **Bireysel Müşteri Ekle**: Bireysel müşterilerin kimlik numarası, ad-soyad, e-posta, telefon numarası gibi bilgileri girilerek kaydedilir.
- **Kurumsal Müşteri Ekle**: Kurumsal müşteri bilgileri, vergi numarası, şirket adı ve iletişim bilgileri ile eklenir.

### Satır Aksiyonları

Her müşterinin satırında şu aksiyonlar mevcuttur:

| Aksiyon        | Açıklama                                                                          |
|----------------|-----------------------------------------------------------------------------------|
| **Id**         | Link şeklinde gösterilen kimlik numarasına tıklayarak müşteri detaylarına ulaşabilirsiniz. |
| **"i" Butonu** | Müşterinin detay bilgilerini görüntülemek için kullanılır.                        |
| **Kalem İkonu** | Müşteri bilgilerini güncellemek için bu butona tıklanır. Pop-up olarak bir güncelleme ekranı açılır ve gerekli düzenlemeler yapılabilir. |
| **Çöp Kutusu İkonu** | Müşteri kaydını silmek için kullanılır. Silme işlemi öncesi bir onay penceresi açılır. |

:::caution
Müşteri silme işlemi geri alınamaz, bu yüzden silme öncesi dikkatli olun ve müşteri bilgilerini doğru şekilde kontrol edin.
:::