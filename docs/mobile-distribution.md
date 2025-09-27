# Mobil Dağıtım Kılavuzu

Bu doküman, App Lab Agent platformunun Android ve iOS dağıtım süreçlerini ve otomasyon adımlarını açıklar. Kullanıcıların uygulamalarını mağazalara güvenli ve hızlı bir şekilde yükleyebilmeleri için gerekli konfigürasyon detaylarını içerir.

## Ön Koşullar

- Google Play Developer hesabı ve servis hesabı JSON anahtarı
- Apple Developer Program üyeliği, App Store Connect API anahtarları
- Hostinger üzerinde yapı artefaktlarını barındırmak için güvenli depolama
- Fastlane kurulumları ve CI ortamı erişimi

## Android Dağıtım Süreci

1. **Versiyonlama**
   - `pubspec.yaml` veya `app/build.gradle` dosyasında sürüm numarası güncellenir.
   - Sürüm kodu (versionCode) CI pipeline tarafından otomatik artırılır.
2. **Build**
   - Flutter `build appbundle` komutu veya Native projelerde `gradlew bundleRelease`.
   - Artifaktlar `build/outputs` klasöründe toplanır.
3. **İmza**
   - Keystore dosyası Vault’dan çekilir, CI ortamında decrypt edilir.
   - `jarsigner` veya `gradle` signing config ile imzalama yapılır.
4. **Yükleme**
   - Fastlane `supply` komutu kullanılarak Google Play’e yükleme yapılır.
   - Hedef kanallar: Internal, Closed, Open testing ve Production.
5. **Mağaza İçeriği**
   - Ekran görüntüleri, özellik grafikleri, açıklamalar içerik ajanı tarafından güncellenir.
6. **Dağıtım Sonrası**
   - Play Console API’sinden durum kontrolü, hata varsa otomatik geri bildirim.

## iOS Dağıtım Süreci

1. **Versiyonlama**
   - `pubspec.yaml` veya Xcode `Info.plist` içerisinde `CFBundleShortVersionString` güncellenir.
   - Build numarası CI tarafından artırılır (Fastlane `increment_build_number`).
2. **Build**
   - `flutter build ipa` veya Xcode `xcodebuild -scheme Release`.
   - Artifaktlar `build/ios/ipa` klasöründe saklanır.
3. **İmza & Profil**
   - Sertifikalar ve provisioning profilleri Fastlane Match ile yönetilir.
   - CI ortamında anahtarlar decrypt edilerek kullanılabilir.
4. **Yükleme**
   - Fastlane `deliver` veya `pilot` ile TestFlight ve App Store Connect yüklemesi yapılır.
   - Metadata otomatik güncellenir, otomatik screenshot yükleme desteklenir.
5. **İnceleme Süreci**
   - App Store inceleme notları, uyumluluk belgeleri ajan tarafından hazırlanan şablonlarla sunulur.
   - İnceleme durumları Slack/Jira entegrasyonlarıyla izlenir.

## Ortak CI/CD Adımları

- GitHub Actions tetikleyici: `push` veya `workflow_dispatch`.
- Build matrix: Android (Linux runner), iOS (macOS runner).
- Artefakt saklama: GitHub Artifacts, Hostinger S3 uyumlu depo.
- Güvenlik: Fastlane için `APP_STORE_CONNECT_API_KEY`, `GOOGLE_PLAY_JSON_KEY` gibi gizliler Vault’dan alınır.
- Bildirimler: Slack, Teams, e-posta.

## Mağaza Yayın Kontrolleri

| Kontrol | Android | iOS |
| --- | --- | --- |
| Uygulama İçi Gizlilik | Data Safety formu güncel mi? | Privacy manifest, ATT açıklamaları |
| İzinler | Manifest izinleri doğrulandı mı? | Info.plist izin açıklamaları |
| Test Cihazları | Internal testers güncel mi? | TestFlight internal testers |
| Sürüm Notları | Sürüm notu ajanı güncelledi mi? | Release notes deliver edildi mi? |
| Çeviriler | Lokalizasyon paketleri eksiksiz mi? | Lokalizasyon dosyaları güncel mi? |

## Sorun Giderme

- **İmza Hataları:** Keystore/sertifika süreleri kontrol edilmeli, otomatik yenileme akışı kurulmalı.
- **API Limitleri:** Google/Apple API kotaları izlenmeli, aşım durumunda bekleme politikaları uygulanmalı.
- **CI Fail:** Loglar otomatik olarak Sentry’ye gönderilir, yeniden deneme stratejileri belirlenir.
- **Mağaza Retleri:** Ajan destekli kök neden analizi ve düzeltme önerileri oluşturulur.

## Yayın Sonrası İzleme

- Crash ve performans metrikleri: Firebase Crashlytics, Sentry, App Store Connect Analytics.
- Kullanıcı yorumları: Google Play & App Store API ile çekilir, yanıtlar ajan tarafından taslaklanır.
- A/B testleri: Firebase Remote Config, App Store Product Page Optimization.

---
Bu kılavuz, mobil dağıtım süreçlerinin standartlaşmasını sağlar. Güncellemeler yapıldığında CI/CD ve otomasyon ekipleri bilgilendirilmelidir.
