# Pusula · Kişisel Finans
Mobil öncelikli, Türkçe gelir-gider ve borç takibi. İnce tipografi, tam görünen ödeme adları ve banka/kurum logoları.

## Çalışan uygulama
GitHub Pages sürümü: https://kdrolmz.github.io/gelirgiderfinans/

Başlangıç finans kayıtları AES-256-GCM ile şifrelenmiş seed.enc.json dosyasındadır. Açma anahtarı depoda bulunmaz; kullanıcıya özel bağlantının URL parçasında (#key=...) yer alır ve GitHub sunucusuna HTTP isteğinde gönderilmez. Bu özel bağlantıyı paylaşmayın. Anahtarsız bağlantı yeni/boş bir uygulama açar; Ayarlar → Yedeği yükle ile JSON yedeği de yüklenebilir. Veriler tarayıcıda saklanır; Safari verileri silinmeden önce yedek alın. Otomatik bulut eşitlemesi yoktur.

## Özellikler
- Aylık toplam, ödenen, kalan, gelir farkı ve kart/kredi borçları
- Aylık tekrarlanan gelir ve giderler; vade seçimi; sınırlı taksit dönemi
- Tek ay veya gelecek aylar için düzenleme; kapsamlı silme ve geri alma
- Tam/kısmi ödeme, tahsilat ve ayrı borç defteri
- Vade ve zorunluluğa göre yerel otomatik sıralama
- JSON yedekleme, CSV raporu, iPhone Ana Ekrana Ekle desteği
- Banka logoları: LOGO-NOTICE.md ve logo-sources.json

## Çalıştırma
Node 22+, bağımlılık gerektirmeyen statik uygulama.
`npm test` hesaplama testlerini çalıştırır.
`python3 -m http.server 4173 --directory dist` yerel statik önizleme sunar.
GitHub Actions hesaplamaları ve 375, 390, 440, 1280 px tarayıcı testlerini çalıştırır, ardından Pages'e yayınlar.

## İsteğe bağlı gerçek yapay zekâ
GitHub Pages sunucu çalıştırmaz. Dahil edilen Worker, özel Sites dağıtımında `/api/analyze` sağlar. `OPENAI_API_KEY` sunucu sırrı ve isteğe bağlı `OPENAI_MODEL` ayarlanmalıdır. Anahtar yokken AI etkin gösterilmez. Kullanıcı isteğiyle seçili ayın verisi OpenAI'a gönderilir. Anahtarı istemciye veya GitHub'a koymayın. Sunucu özel Sites kimliğini denetler; bu Worker'ı aynı kimlik sınırı olmadan herkese açık çalıştırmayın.

Kredi borcu kalan taksit ödemelerinin toplamıdır; erken kapama/anapara değildir. Kart faizi ve yeni harcamalar otomatik çekilmez. Öncelik listesi profesyonel finans tavsiyesi veya otomatik ödeme değildir.
