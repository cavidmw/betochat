# BetoChat

Modern, minimal ve hızlı bir mesajlaşma uygulaması. Discord'dan ilham alınmış, birebir mesajlaşmaya odaklı.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Typed-blue)

## ✨ Özellikler

- 🔐 **Kullanıcı Kimlik Doğrulama** - E-posta ile kayıt ve giriş
- 👤 **Profil Yönetimi** - Avatar, görünen isim ve bio düzenleme
- 👥 **Arkadaş Sistemi** - Kullanıcı adı ile arama, istek gönderme/kabul etme
- 💬 **Gerçek Zamanlı Mesajlaşma** - Anlık mesaj gönderme ve alma
- 📷 **Görsel Paylaşımı** - Sohbette fotoğraf gönderme
- 📜 **Mesaj Geçmişi** - Yukarı kaydırarak eski mesajları yükleme
- 🟢 **Çevrimiçi Durumu** - Arkadaşların çevrimiçi/çevrimdışı durumunu görme
- ✍️ **Yazıyor Göstergesi** - Karşı tarafın yazdığını görme
- ↩️ **Yanıt Verme** - Mesajlara yanıt verme
- 🌙 **Karanlık Tema** - iOS tarzı glassmorphism tasarım
- 📱 **Mobil Uyumlu** - Responsive tasarım

## 🛠️ Teknoloji Stack

- **Framework:** Next.js 14 (App Router)
- **Veritabanı:** Supabase (PostgreSQL + Realtime + Storage)
- **Stil:** TailwindCSS + Glassmorphism
- **State:** Zustand
- **Data Fetching:** TanStack React Query
- **Animasyon:** Framer Motion
- **Form:** React Hook Form + Zod
- **Dil:** TypeScript

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Supabase hesabı

### Adımlar

1. **Repoyu klonlayın:**
```bash
git clone https://github.com/kullanici/betochat.git
cd betochat
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Ortam değişkenlerini ayarlayın:**
```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Supabase veritabanını kurun:**
   - `supabase/schema.sql` dosyasını SQL Editor'da çalıştırın
   - `supabase/policies.sql` dosyasını SQL Editor'da çalıştırın
   - `chat-media` adında bir Storage bucket oluşturun

5. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

6. **Tarayıcıda açın:**
```
http://localhost:3000
```

## 📁 Proje Yapısı

```
betochat/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth sayfaları (login, register)
│   ├── (app)/             # Uygulama sayfaları (chat, friends, settings)
│   ├── globals.css        # Global stiller
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Temel UI bileşenleri
│   ├── layout/            # Layout bileşenleri
│   ├── chat/              # Chat bileşenleri
│   ├── background/        # Arka plan animasyonları
│   └── providers/         # Context providers
├── lib/
│   ├── supabase/          # Supabase client ve helpers
│   ├── db/                # Veritabanı işlemleri
│   ├── hooks/             # Custom hooks
│   ├── store/             # Zustand store
│   ├── types/             # TypeScript tipleri
│   ├── validation/        # Zod şemaları
│   └── utils.ts           # Yardımcı fonksiyonlar
├── supabase/
│   ├── schema.sql         # Veritabanı şeması
│   └── policies.sql       # RLS politikaları
└── KURULUM.md             # Türkçe kurulum rehberi
```

## 🔒 Güvenlik

- Row Level Security (RLS) ile veritabanı güvenliği
- Supabase Auth ile kimlik doğrulama
- Signed URL'ler ile medya güvenliği
- Input validation ile form güvenliği

## 📄 Lisans

MIT

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır. Büyük değişiklikler için önce bir issue açın.
