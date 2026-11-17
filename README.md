# GELİR & GİDER — Premium Finans Tablosu

iPhone Safari ana ekranı için hazırlanmış mobil finans takip PWA'sı.

## Durum
GitHub deposunda uygulama dosyaları mevcuttur. **Bulut veritabanı bağlantısı yapılana kadar uygulama özel finans verisi kaydetmez.** GitHub Pages yayın durumunu GitHub > Settings > Pages bölümünde kontrol edin.

## Gizlilik
Bu depo herkese açıksa **gerçek borç tutarları, kişisel alacaklar, şifreler ve kişisel başlangıç JSON dosyası GitHub'a yüklenmemelidir**. Bunlar yalnızca oturum açılan özel veritabanına aktarılmalıdır. `config.js` dosyasına **yalnızca Supabase Project URL ve public/publishable (anon) key** koyun. Kesinlikle `service_role` veya secret key eklemeyin.

## Bulut kurulumu (zorunlu)
1. https://supabase.com/dashboard adresinde kendinize ait proje oluşturun.
2. SQL Editor'de `database.sql` dosyasını çalıştırın; Auth > Providers > Email'in açık olduğunu kontrol edin.
3. Project Settings > API'den HTTPS Project URL ve **publishable/anon** key değerlerini `config.js` dosyasına koyun.
4. Supabase > Authentication > URL Configuration içinde yayın adresini Site URL / Redirect URLs listesine ekleyin.
5. GitHub > Settings > Pages > Deploy from a branch > main > /(root) seçeneğiyle sayfayı etkinleştirin.
6. Uygulamaya e-posta ve güçlü şifreyle kayıt olup doğrulama e-postasını tamamlayın. Test kayıtlarını ekleyin; farklı cihazdan yeniden giriş yaparak verilerin buluttan geldiğini kontrol edin.
7. iPhone Safari > Paylaş > Ana Ekrana Ekle ile kurun.

## Kayıtların korunması
Safari geçmişi ve web sitesi verileri silinse bile **buluta başarıyla kaydedilen** kayıtlar Supabase'de kalır. Oturumun yeniden açılması gerekebilir. Çevrimdışı yapılan işlemler desteklenmez; kaydetme hatasında işlem geri alınır. Ayrıca düzenli JSON yedeklemesi önerilir.

## Finans hesaplamaları
Ödeme işaretlendiğinde o ayın kalan planı azalır; kart/krediye bağlanmış kayıtların tahmini borç bakiyeleri de ödeme tutarı kadar düşer. Kart faizleri/yeni harcamalar banka ekstresine göre düzeltilebilir. Kredilerdeki bakiye, **kalan taksit ödemeleri toplamıdır**, gerçek anapara veya erken kapama bakiyesi değildir. Düzenli ödeme günü, başlangıç ayı ve süresi ayrı ayrı düzenlenebilir. Fibabanka ödemesi Aralık 2026'dan başlatılacak şekilde kişisel başlangıç JSON'unda bulunur.

## Kişisel başlangıç
`Gelir_Gider_Ozel_Baslangic_Verilerim.json` dosyasını **GitHub'a eklemeyin**. İlk girişten sonra Ayarlar > Özel başlangıç dosyasını içe aktar üzerinden yalnızca size özel Supabase tablosuna yükleyin.
