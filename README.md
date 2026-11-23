# GameSubs — iPhone 16e kurulumu (PC'siz)

Bu paket, GameSubs'ın deneysel iPhone web uygulaması prototipidir. iPhone'a App Store uygulaması gibi yüklenmez; Safari'den açılır ve Ana Ekran'a eklenerek uygulama gibi kullanılabilir.

## 1) Önce dosyaları iPhone'a çıkar
1. Bu ZIP'i iPhone'da **Dosyalar** uygulamasına kaydet.
2. ZIP dosyasına bir kez dokun; `GameSubs_Offline_Starter` klasörü oluşur.

## 2) HTTPS adresi oluştur
Safari mikrofon izni için güvenli HTTPS adresi ister. Bu yüzden dosyaları bir statik site barındırma servisine yüklemek gerekiyor. Örnek: GitHub Pages.

1. Safari'de `https://github.com` adresini aç ve kendi GitHub hesabını oluştur veya giriş yap. Şifreni kimseyle paylaşma.
2. Yeni bir **public repository** oluştur; adını `gamesubs` koy. README, lisans veya .gitignore ekleme seçeneklerini kapalı bırak.
3. Repository içinde **Add file → Upload files** seçeneğini aç.
4. iPhone Dosyalar'dan paketin içindeki dosyaları yükle. Kök dizine `index.html`, `app.js`, `sw.js`, `manifest.webmanifest` ve `README.md` dosyalarını koy.
5. `icons` klasöründeki `icon-192.png` ve `icon-512.png` dosyalarını `icons` adlı klasöre yükle. GitHub'da klasör oluşturmak için Add file → Create new file ile `icons/.keep` oluşturup kaydedebilir, sonra klasöre girerek iki görseli yükleyebilirsin.
6. **Commit changes** ile kaydet.
7. Repository'de **Settings → Pages** bölümünü aç. Build and deployment altında **Deploy from a branch**, branch olarak `main`, folder olarak `/(root)` seç ve Save'e bas.
8. Birkaç dakika sonra Pages bölümünde `https://KULLANICI-ADIN.github.io/gamesubs/` benzeri adres görünür.

## 3) iPhone'a uygulama gibi ekle
1. Safari'de yayınlanan HTTPS adresini aç.
2. Sayfa açılınca Paylaş simgesine dokun → **Ana Ekrana Ekle**.
3. GameSubs simgesi Ana Ekran'da görünür.
4. İlk denemede internet bağlantısı açıkken **Modelleri indir / hazırla** düğmesine bas.

## 4) İlk test
- iPhone'da Ayarlar değil, Safari sayfası açıldığında mikrofon izni sorulursa izin ver.
- TV/monitör sesini iPhone mikrofonunun duyabileceği seviyede tut.
- İngilizce konuşma olan kısa bir sahnede dene.
- İlk model indirmesi büyük olabilir; Wi-Fi ve şarj önerilir.

## Gerçekçi beklenti ve gizlilik
- Bu bir deneysel prototiptir; iPhone Safari'de model indirme, bellek ve işlem hızı sorun çıkarabilir. Başarılı çalışacağı garanti değildir.
- Ses, uygulama kodunda tarayıcı içinde işlenmek üzere tasarlanmıştır; ses kaydı sunucuya gönderilmez. İlk kullanımda yazılım/model dosyaları internetten indirilir.
- Tarayıcı önbelleği iOS tarafından temizlenebilir; çevrimdışı çalışma garanti değildir. Uçak modu testi geçmeden çevrimdışı olduğunu varsayma.
- Yaklaşık 6 saniyelik ses parçaları kullanır; altyazılar anlık değil, gecikmeli gelir.
- Xbox HDMI görüntüsünün üstüne yazı bindirmez. iPhone mikrofonuyla TV/monitör hoparlörünü dinler ve altyazıyı telefonda gösterir.
- Microsoft, Xbox, Apple veya e-posta şifreni bu uygulamaya girmen gerekmez. GitHub hesabı açarsan giriş bilgilerini yalnızca GitHub'ın kendi sitesinde kullan.
