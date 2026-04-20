# BetoChat Kurulum Rehberi

Bu rehber, BetoChat uygulamasını sıfırdan canlıya almanız için gereken tüm adımları içerir. Teknik bilginiz olmasa bile adımları takip ederek projeyi yayınlayabilirsiniz.

---

## 📋 Gereksinimler

- **GitHub hesabı** (ücretsiz): https://github.com
- **Supabase hesabı** (ücretsiz): https://supabase.com
- **Vercel hesabı** (ücretsiz): https://vercel.com
- **Node.js** (bilgisayarınızda): https://nodejs.org (v18 veya üzeri)

---

## 1️⃣ GitHub'a Projeyi Yükleme

### Adım 1.1: Yeni Repo Oluşturma

1. GitHub'a giriş yapın
2. Sağ üstteki **+** butonuna tıklayın → **New repository**
3. Repository name: `betochat` (veya istediğiniz isim)
4. **Private** veya **Public** seçin
5. **Create repository** butonuna tıklayın

### Adım 1.2: Projeyi Yükleme

Terminal/Komut satırında proje klasörüne gidin ve şu komutları çalıştırın:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/betochat.git
git push -u origin main
```

> **Not:** `KULLANICI_ADINIZ` kısmını kendi GitHub kullanıcı adınızla değiştirin.

---

## 2️⃣ Supabase Kurulumu

### Adım 2.1: Yeni Proje Oluşturma

1. https://supabase.com adresine gidin ve giriş yapın
2. **New Project** butonuna tıklayın
3. Şu bilgileri girin:
   - **Name:** BetoChat (veya istediğiniz isim)
   - **Database Password:** Güçlü bir şifre oluşturun (bunu bir yere not edin!)
   - **Region:** Size en yakın bölgeyi seçin (örn: Frankfurt)
4. **Create new project** butonuna tıklayın
5. Proje oluşturulana kadar bekleyin (1-2 dakika)

### Adım 2.2: Veritabanı Tablolarını Oluşturma

1. Sol menüden **SQL Editor** sekmesine tıklayın
2. **New query** butonuna tıklayın
3. Proje klasöründeki `supabase/schema.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'a yapıştırın
5. **Run** butonuna tıklayın (veya Ctrl+Enter)
6. "Success" mesajını görene kadar bekleyin

### Adım 2.3: Güvenlik Politikalarını Ekleme

1. Yeni bir SQL query açın
2. `supabase/policies.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'a yapıştırın
4. **Run** butonuna tıklayın
5. "Success" mesajını görene kadar bekleyin

### Adım 2.4: Storage Bucket Oluşturma

1. Sol menüden **Storage** sekmesine tıklayın
2. **New bucket** butonuna tıklayın
3. Şu bilgileri girin:
   - **Name:** `chat-media`
   - **Public bucket:** ✅ İşaretleyin (görsellerin görüntülenebilmesi için)
4. **Create bucket** butonuna tıklayın

### Adım 2.5: Storage Politikalarını Ayarlama

1. `chat-media` bucket'ına tıklayın
2. **Policies** sekmesine gidin
3. **New policy** → **For full customization** seçin
4. Şu politikayı ekleyin:

**INSERT politikası (yükleme için):**
- Policy name: `Allow authenticated uploads`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- WITH CHECK expression: `true`

**SELECT politikası (okuma için):**
- Policy name: `Allow public read`
- Allowed operation: `SELECT`
- Target roles: `public`
- USING expression: `true`

### Adım 2.6: API Anahtarlarını Alma

1. Sol menüden **Project Settings** (dişli ikonu) tıklayın
2. **API** sekmesine gidin
3. Şu değerleri bir yere not edin:
   - **Project URL:** `https://xxxxx.supabase.co` formatında
   - **anon public:** `eyJhbGciOi...` ile başlayan uzun anahtar

---

## 3️⃣ Vercel'e Deploy Etme

### Adım 3.1: Vercel'e Bağlanma

1. https://vercel.com adresine gidin ve giriş yapın
2. **Add New...** → **Project** butonuna tıklayın
3. **Import Git Repository** bölümünde GitHub hesabınızı bağlayın
4. `betochat` reposunu bulun ve **Import** butonuna tıklayın

### Adım 3.2: Ortam Değişkenlerini Ekleme

Deploy ekranında **Environment Variables** bölümünü bulun ve şu değişkenleri ekleyin:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase'den aldığınız Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase'den aldığınız anon public key |

### Adım 3.3: Deploy Etme

1. **Deploy** butonuna tıklayın
2. Build işleminin tamamlanmasını bekleyin (2-3 dakika)
3. "Congratulations!" mesajını gördüğünüzde site yayında!

---

## 4️⃣ Deploy Sonrası Kontroller

### Test Listesi

Site yayına alındıktan sonra şu adımları test edin:

1. **Kayıt Ol:** Yeni bir hesap oluşturun
2. **Giriş Yap:** Oluşturduğunuz hesapla giriş yapın
3. **Profil:** Ayarlar sayfasından profil fotoğrafı yükleyin
4. **Arkadaş Ekle:** İkinci bir hesap oluşturup arkadaş isteği gönderin
5. **Mesajlaşma:** Arkadaş olduktan sonra mesaj gönderin
6. **Görsel Gönderme:** Sohbette bir fotoğraf gönderin

### Yaygın Sorunlar ve Çözümleri

#### "Invalid API key" hatası
- Supabase API anahtarlarını doğru kopyaladığınızdan emin olun
- Vercel'deki ortam değişkenlerini kontrol edin
- Değişken isimlerinde yazım hatası olmadığından emin olun

#### Görseller yüklenmiyor
- Storage bucket'ın `chat-media` olarak adlandırıldığından emin olun
- Storage politikalarının doğru ayarlandığını kontrol edin
- Bucket'ın public olarak işaretlendiğinden emin olun

#### Kayıt/Giriş çalışmıyor
- Supabase → Authentication → Providers → Email'in aktif olduğundan emin olun
- Email confirmation'ı kapatmak için: Authentication → Settings → "Enable email confirmations" kapatın

#### Mesajlar görünmüyor
- SQL Editor'da `schema.sql` ve `policies.sql` dosyalarının çalıştırıldığından emin olun
- Table Editor'da `messages`, `conversations`, `profiles` tablolarının oluştuğunu kontrol edin

---

## 5️⃣ Opsiyonel: Email Onayını Kapatma

Geliştirme aşamasında email onayını kapatmak için:

1. Supabase → **Authentication** → **Providers** → **Email**
2. **Confirm email** seçeneğini kapatın
3. **Save** butonuna tıklayın

---

## 6️⃣ Güncelleme Yapma

Kodda değişiklik yaptıktan sonra:

```bash
git add .
git commit -m "Değişiklik açıklaması"
git push
```

Vercel otomatik olarak yeni sürümü deploy edecektir.

---

## 📞 Yardım

Sorun yaşarsanız:
- Supabase Dashboard'daki **Logs** sekmesini kontrol edin
- Vercel Dashboard'daki **Deployments** → **Build Logs** kontrol edin
- Tarayıcı konsolunu açın (F12) ve hataları kontrol edin

---

## 🎉 Tebrikler!

BetoChat uygulamanız artık yayında! Arkadaşlarınızla paylaşabilir ve mesajlaşmaya başlayabilirsiniz.
