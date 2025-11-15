# JobSwipe - Part-Time İş Eşleştirme Uygulaması

Tinder benzeri swipe mekanizmasıyla part-time iş arayanlar ve iş verenler için modern mobil uygulama.

## Özellikler

### 🎯 Temel Özellikler
- **Swipe Mekanizması**: Sağa kaydır (beğen), sola kaydır (geç)
- **İki Kullanıcı Tipi**: İş arayan ve İş veren
- **Akıllı Eşleşme**: Konum, beceriler, çalışma saatleri bazlı eşleştirme
- **Anlık Mesajlaşma**: Eşleşen kullanıcılar arası chat
- **Push Bildirimler**: Yeni eşleşme ve mesaj bildirimleri

### 💼 İş Veren İçin
- İş ilanı oluşturma ve yönetimi
- Uygun adayları swipe ile değerlendirme
- Eşleşen adaylarla iletişim
- İlan performans istatistikleri

### 👤 İş Arayan İçin
- Kişisel profil ve CV oluşturma
- Uygun iş ilanlarını swipe ile inceleme
- Beceri ve tercihlere göre filtreleme
- Eşleşen işverenlerle görüşme

## Teknoloji Stack

### Mobile App (iOS & Android)
- **React Native** - Cross-platform development
- **TypeScript** - Type safety
- **React Navigation** - Routing
- **React Native Gesture Handler** - Swipe animations
- **Redux Toolkit** - State management
- **Socket.io Client** - Real-time messaging

### Backend
- **Node.js + Express** - REST API
- **TypeScript** - Type safety
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **Firebase Admin** - Push notifications

## Proje Yapısı

```
.
├── mobile/                 # React Native uygulaması
│   ├── src/
│   │   ├── components/    # UI bileşenleri
│   │   ├── screens/       # Ekranlar
│   │   ├── navigation/    # Navigasyon yapısı
│   │   ├── store/         # Redux store
│   │   ├── services/      # API servisleri
│   │   └── utils/         # Yardımcı fonksiyonlar
│   ├── android/           # Android native kod
│   └── ios/               # iOS native kod
│
├── backend/               # Node.js API
│   ├── src/
│   │   ├── models/        # Database modelleri
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # İş mantığı
│   │   ├── middleware/    # Auth, validation vb.
│   │   ├── services/      # Socket.io, notifications
│   │   └── utils/         # Yardımcı fonksiyonlar
│   └── tests/             # Unit & integration tests
│
└── shared/                # Ortak tipler ve sabitler
    └── types/             # TypeScript type definitions
```

## Kurulum

### Backend
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenle
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx react-native start
# Yeni terminalde:
npx react-native run-ios
# veya
npx react-native run-android
```

## Geliştirme Roadmap

- [x] Proje yapısı kurulumu
- [ ] Backend API geliştirme
- [ ] Kullanıcı kimlik doğrulama
- [ ] Swipe UI implementasyonu
- [ ] Eşleşme algoritması
- [ ] Mesajlaşma sistemi
- [ ] Push bildirimleri
- [ ] Profil ve ilan yönetimi
- [ ] Filtreleme ve arama
- [ ] Test ve optimizasyon

## Lisans

MIT
