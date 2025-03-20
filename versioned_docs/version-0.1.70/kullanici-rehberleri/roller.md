---
title: "Roller"
sidebar_position: 11
---

# Roller

Roller modülü, kullanıcıların belirli izinler çerçevesinde uygulamayı kullanmalarını sağlayan bir yetkilendirme sistemidir. Her kullanıcıya atanan roller, uygulama içinde hangi işlemleri yapabileceklerini belirler.

## Rol Oluşturma

**"+"** butonuna tıklayarak yeni bir rol ekleyebilirsiniz. Rol ismi ve bu role ait yetkiler ekranda gösterilir.

### Yetkiler

Yetkiler, belirli kategorilere ayrılmıştır. Her bir yetki kutucuğu işaretlenerek aktif hale getirilir.

| Kategori                 | Açıklama                                                                          |
|--------------------------|-----------------------------------------------------------------------------------|
| **Acenta Kullanıcı Yönetimi** | Kullanıcıları davet etme, sorgulama, silme, aktif ve pasif yapma gibi işlemleri içerir. |
| **Acenta Rol Yönetimi**  | Rol oluşturma, okuma ve yazma izinlerini kapsar.                                  |
| **Müşteri Yönetimi**     | Müşteri verilerini okuma ve yazma yetkilerini sağlar.                             |
| **Teminat Gruplama**     | Poliçe teminatlarını okuma ve yazma yetkilerini içerir.                           |
| **Teklifler**            | Tekliflerin okunması ve oluşturulması işlemlerini kapsar.                         |
| **Poliçeler**            | Poliçeleri satın alma ve okuma yetkilerini içerir.                                |

## Sütun Ayarları

Tablodaki bilgileri ihtiyacınıza göre görüntülemek için **Sütun Ayarları** alanını kullanabilirsiniz. Sütunları ekleyebilir veya kaldırabilirsiniz.

## Veri İndirme

**Veri İndirme** butonuna tıklayarak mevcut rol listesini Excel formatında bilgisayarınıza indirebilirsiniz.

## Filtreleme

Üst menüde yer alan **Filtre** alanı kullanılarak filtreleme yapılabilir. Örneğin, rol adlarına göre arama yapılabilir. Bu sayede, büyük bir liste içinde kolaylıkla aradığınız role ulaşabilirsiniz.

:::info
Filtreleme, özellikle çok sayıda rol bulunduğunda belirli bir rolü hızlıca bulmak için kullanışlıdır.
:::

## Rol Güncelleme ve Silme

| Aksiyon        | Açıklama                                                                          |
|----------------|-----------------------------------------------------------------------------------|
| **Düzenleme**  | Bir rol üzerinde değişiklik yapmak için kalem ikonuna tıklanarak düzenleme penceresi açılır. Bu pencerede rol ismi ve yetkiler güncellenebilir. |
| **Silme**      | Bir rolü tamamen silmek için çöp kutusu simgesine tıklanarak "Rolü silmek istediğinize emin misiniz?" sorusuna onay verilmesi gereklidir.       |

:::caution
Bir rolü silerken, bu role atanmış kullanıcıların yetkilerini kaybedeceğini göz önünde bulundurun. Silmeden önce emin olun.
:::