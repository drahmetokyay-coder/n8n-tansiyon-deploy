# JobSwipe Kurulum Rehberi

## Gereksinimler

### Backend
- Node.js 18+
- MongoDB 4.4+
- npm veya yarn

### Mobile
- Node.js 18+
- React Native CLI
- Xcode (iOS için)
- Android Studio (Android için)

## Backend Kurulumu

### 1. Bağımlılıkları Yükle
```bash
cd backend
npm install
```

### 2. Ortam Değişkenlerini Ayarla
```bash
cp .env.example .env
```

`.env` dosyasını düzenle:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/jobswipe
JWT_SECRET=super-gizli-anahtar-buraya-gir
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
```

### 3. MongoDB'yi Başlat
```bash
# macOS (Homebrew ile)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Docker ile
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Backend Sunucusunu Başlat
```bash
npm run dev
```

Backend şu adreste çalışacak: http://localhost:3000

## Mobile Kurulumu

### 1. Bağımlılıkları Yükle
```bash
cd mobile
npm install
```

### 2. iOS Bağımlılıkları (macOS için)
```bash
cd ios
pod install
cd ..
```

### 3. Metro Bundler'ı Başlat
```bash
npm start
```

### 4. Uygulamayı Çalıştır

#### iOS
```bash
npm run ios
# veya
npx react-native run-ios
```

#### Android
```bash
npm run android
# veya
npx react-native run-android
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Giriş yap
- `GET /api/auth/profile` - Profil bilgisi
- `PUT /api/auth/profile` - Profil güncelle

### Jobs
- `GET /api/jobs` - İş ilanlarını listele
- `POST /api/jobs` - Yeni iş ilanı oluştur
- `GET /api/jobs/:jobId` - İş ilanı detayı
- `PUT /api/jobs/:jobId` - İş ilanı güncelle
- `DELETE /api/jobs/:jobId` - İş ilanı sil
- `GET /api/jobs/:jobId/candidates` - İş için adaylar

### Swipes
- `POST /api/swipes/job` - İş ilanına swipe
- `POST /api/swipes/candidate` - Adaya swipe
- `GET /api/swipes/history` - Swipe geçmişi

### Matches
- `GET /api/matches` - Eşleşmeler
- `GET /api/matches/:matchId` - Eşleşme detayı
- `DELETE /api/matches/:matchId` - Eşleşmeyi kaldır
- `GET /api/matches/:matchId/messages` - Mesajlar
- `POST /api/matches/:matchId/messages` - Mesaj gönder

### Notifications
- `GET /api/notifications` - Bildirimler
- `PUT /api/notifications/:id/read` - Bildirimi okundu işaretle
- `PUT /api/notifications/read-all` - Tümünü okundu işaretle

## Test Kullanıcıları Oluşturma

### İş Arayan (Job Seeker)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seeker@example.com",
    "password": "password123",
    "userType": "job_seeker",
    "profile": {
      "firstName": "Ahmet",
      "lastName": "Yılmaz",
      "bio": "Part-time iş arıyorum",
      "skills": ["JavaScript", "React", "Node.js"],
      "experience": "2 yıl",
      "availability": {
        "days": ["Monday", "Tuesday", "Wednesday"],
        "hours": "09:00-17:00"
      },
      "hourlyRate": {
        "min": 100,
        "max": 200,
        "currency": "TRY"
      }
    },
    "location": {
      "type": "Point",
      "coordinates": [28.9784, 41.0082],
      "city": "Istanbul",
      "country": "Turkey"
    }
  }'
```

### İşveren (Employer)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "employer@example.com",
    "password": "password123",
    "userType": "employer",
    "profile": {
      "companyName": "Tech Şirketi",
      "contactName": "Mehmet Demir",
      "description": "Teknoloji şirketi",
      "industry": "Yazılım",
      "companySize": "10-50",
      "verified": false
    },
    "location": {
      "type": "Point",
      "coordinates": [28.9784, 41.0082],
      "city": "Istanbul",
      "country": "Turkey"
    }
  }'
```

### İş İlanı Oluşturma
```bash
# Önce login olun ve token alın
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "React Native Developer",
    "description": "Part-time React Native geliştirici arıyoruz",
    "jobType": "part_time",
    "location": {
      "type": "Point",
      "coordinates": [28.9784, 41.0082],
      "city": "Istanbul",
      "address": "Kadıköy, Istanbul"
    },
    "requirements": {
      "skills": ["React Native", "JavaScript", "TypeScript"],
      "experience": "1-2 yıl"
    },
    "schedule": {
      "days": ["Monday", "Wednesday", "Friday"],
      "hours": "14:00-18:00",
      "hoursPerWeek": 12
    },
    "compensation": {
      "amount": 150,
      "currency": "TRY",
      "period": "hour"
    },
    "benefits": ["Esnek çalışma saatleri", "Remote çalışma"]
  }'
```

## Özellikler

### ✅ Tamamlanan
- ✅ Kullanıcı kayıt ve giriş (JWT)
- ✅ İş arayan ve işveren profilleri
- ✅ Tinder-style swipe mekanizması
- ✅ Akıllı eşleşme algoritması
- ✅ Gerçek zamanlı mesajlaşma (Socket.io)
- ✅ Konum bazlı filtreleme
- ✅ Beceri eşleştirme
- ✅ Bildirim sistemi

### 🔄 Gelecek Özellikler
- 📸 Fotoğraf yükleme
- 🔔 Push bildirimleri (Firebase)
- 📊 İstatistikler ve analizler
- ⭐ Değerlendirme sistemi
- 🔍 Gelişmiş filtreleme
- 💼 CV yükleme ve görüntüleme
- 📍 Harita entegrasyonu

## Sorun Giderme

### MongoDB Bağlantı Hatası
```bash
# MongoDB servisinin çalıştığından emin olun
# macOS
brew services list

# Linux
sudo systemctl status mongod
```

### Port Zaten Kullanımda
```bash
# Port 3000'i kullanan uygulamayı bul
lsof -i :3000

# Uygulamayı kapat
kill -9 <PID>
```

### Metro Bundler Hatası
```bash
# Cache'i temizle
cd mobile
npm start -- --reset-cache
```

## Performans İyileştirmeleri

### Backend
- MongoDB index'leri optimize edildi
- Geospatial sorgular için 2dsphere index
- Redis cache (gelecek özellik)

### Mobile
- React Native Reanimated için smooth animasyonlar
- Image lazy loading
- API response caching

## Güvenlik

- ✅ JWT ile kimlik doğrulama
- ✅ Bcrypt ile şifre hashleme
- ✅ Input validasyonu (express-validator)
- ✅ CORS koruması
- ✅ Rate limiting (gelecek özellik)

## Lisans

MIT
