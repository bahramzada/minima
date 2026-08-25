# 🌿 Minima — Micro-habits Tracker

> **Fəlsəfə:** *"Kiçik addımlar, böyük nəticələr."*
> İstifadəçiləri yormadan, gündə cəmi 5–10 dəqiqə çəkən minimal vərdişləri (kitab oxumaq, gəzinti, su içmək) reallaşdırmağa kömək edən, AI dəstəkli, mobil-öncəlikli fəaliyyət izləyicisi.

Bu paket **dizayn prototipidir** (hi-fi, interaktiv). Məqsəd: development mərhələsində AI agent və developerlər üçün **vahid həqiqət mənbəyi (source of truth)** rolunu oynamaq — vizual dil, ekranlar, state-lər, axın və qarşılıqlı təsir məntiqi burada tam işlək şəkildə göstərilir.

---

## 📦 Fayl strukturu

```
Minima micro-habits tracker/
├── README.md                 ← BU FAYL (izahlar + istifadə qaydaları)
├── Minima Website.dc.html     ← ⭐ ƏSAS FAYL — tam işlək məhsul (landing + auth + app)
├── Minima.dc.html             ← Tarixçə: ilk mobil-maket + 3 vizual istiqamət araşdırması
└── support.js                 ← Runtime (avtomatik yaradılıb — ƏL VURMAYIN)
```

### Hansı faylı açmalı?
- **`Minima Website.dc.html`** — məhsulun son, tam versiyası. Development bunun üzərindən getməlidir.
- `Minima.dc.html` — yalnız **referans/tarixçə**: burada 3 vizual istiqamət (Neubrutalism `1a`, Cyberpunk `1b`, Zeytun `1c`) müqayisə edilib. Seçilmiş istiqamət: **`1c` — Mat premium zeytun**. Yeni işdə istifadə olunmur, silinə bilər.

### Necə açılır?
Hər `.dc.html` faylı adi brauzerdə **birbaşa** açılır (server tələb olunmur) — sadəcə iki şərt:
1. `support.js` eyni qovluqda qalmalıdır.
2. İnternet bağlantısı (Google Fonts üçün: Sora, DM Sans, Space Grotesk).

---

## 🎨 Dizayn sistemi (Design tokens)

Seçilmiş istiqamət: **Mat premium zeytun** — sakit, isti, premium; tibbi/korporativ deyil, "dopamin dostu".

### Rənglər
| Rol | HEX | İstifadə |
|-----|-----|----------|
| **Accent (əsas yaşıl)** | `#6b7d5a` | Düymələr, AI kartı, aktiv hallar, tamamlanmış vərdiş |
| Accent tünd | `#5a6b49` | Hover, gradient dərinliyi |
| Accent ən tünd | `#3f4a37` | Streak pill fonu, başlıq mətnləri |
| Mətn (əsas) | `#2f3a28` | Başlıqlar |
| Mətn (ikinci) | `#6f7365` / `#8a8f7c` | Alt yazılar |
| Mətn (solğun) | `#a3a795` / `#b7bbab` | Etiketlər, placeholder |
| Fon (səhifə) | `#f3f1e9` | Əsas arxa fon (isti krem) |
| Fon (kart) | `#ffffff` | Kartlar |
| Fon (ikinci) | `#f7f6ef` | Input, daxili sahələr |
| Yumşaq yaşıl fon | `#eef3e2` / `#eef1e4` | Tamamlanmış/aktiv vurğu |
| Kənar (border) | `#e6e4d9` / `#eceadf` / `#e2e0d5` | İncə ayırıcılar |

**Mood/əhval qradiyenti** (GitHub-tərzi töhfə qrafiki, azdan çoxa):
`#e7e6dd` → `#d7e0c4` → `#b3c795` → `#86a262` → `#5a6b49`

**Tweaks-də dəyişdirilə bilən accent variantları:** `#6b7d5a`, `#5a6b49`, `#7d8a5c`, `#4f6346`

### Tipoqrafiya
- **Sora** (700–800) — başlıqlar, rəqəmlər, düymələr. Cəsarətli, müasir.
- **DM Sans** (400–600) — əsas mətn, alt yazılar, çat baloncukları.
- **Space Grotesk** (600–700) — statistika/rəqəm aksentləri, naviqasiya etiketləri.

### Radiuslar & kölgələr
- Radius: kartlar `18–26px`, düymələr `12–14px`, kiçik elementlər `11–15px`, pill `20px+`.
- Kölgə (yumşaq): `0 4px 16px rgba(63,74,55,.06)` (kart), `0 10px 24px rgba(107,125,90,.3)` (accent kart).

### Boşluq
Kartlararası `gap: 11–14px`. Bölmə paddingi masaüstü `34–56px`, mobil `18–22px`. **Bütün qruplar `flex`/`grid` + `gap` ilə düzülür** (inline flow deyil).

---

## 📱 Ekranlar və axın

Tətbiq **tək fayl daxilində** `view` state-i ilə naviqasiya edir:

```
landing  →  login / signup  →  app
                                 ├─ home    (Dashboard)
                                 ├─ ai      (Tapşırıq Tap / AI Chat)
                                 └─ profil  (Profil + Mood Tracker)
```

### 1. Landing (`view: 'landing'`)
Marketinq səhifəsi: hero (şüar + canlı app önizləmə kartı), "Necə işləyir" (3 xüsusiyyət), CTA bloku, footer. "Pulsuz başla"→signup, "Daxil ol"→login.

### 2. Auth (`view: 'login' | 'signup'`)
Login və signup eyni kart komponentini paylaşır. Google düyməsi + e-poçt/şifrə (+signup-da ad). Landing loqosuna klik → geri.
> ⚠️ **Demo davranışı:** validasiya girişi **bloklamır** — istənilən düymə birbaşa app-a keçir. Real backend qoşulanda `submitLogin`/`submitSignup` daxilində `this.valid(...)` yenidən aktivləşdirilməlidir (aşağıya bax).

### 3. App
Naviqasiya **cihaza görə uyğunlaşır**:
- **Masaüstü** (`≥860px`): sol **sidebar** (loqo, menyu, streak, profil, çıxış).
- **Mobil** (`<860px`): aşağı **Bottom Navigation Bar** (baş barmaq zonası) — briefin əsas tələbi.

**Home** — "Günün Tapşırığı" AI kartı, günlük minimal vərdiş kartları (klik→tamamla), həftəlik qrafik, ipucu.
**AI Chat** — əhval çipləri (😴😰😐🙂🤩) → AI 1.6s "düşünür" → əhvala uyğun 2 dəqiqəlik tapşırıq kartı.
**Profil** — 4 statistika, Mood Tracker (17 həftəlik yaşıl qrid), AI Analitika paneli, çıxış.

---

## ✨ State-lər (briefin xüsusi tələbi)

| State | Harada | Necə tetiklənir |
|-------|--------|-----------------|
| **Success (uğur)** | Overlay | İstənilən vərdiş kartına klik → tamamla. Halqa + konfeti + emoji pop animasiyası, ~1.5s. |
| **Empty (boş)** | Home | Bütün vərdişlər tamamlananda "Bugünü bağladın! 🎉" motivasiya ekranı (`allDone`). |
| **Loading (yüklənmə)** | AI Chat | Əhval seçiləndə "AI düşünür…" 3-nöqtəli typing animasiyası (`typing`). |

> Əvvəlki `Minima.dc.html`-də bu state-lərin **izolə spesifikasiyaları** da var (`2b` Loading skeleton, `2c` Empty, `2d` Success) — dizayn referansı kimi saxlanılıb.

---

## 🛠 Tweaks (host panelindən dəyişdirilə bilən proplar)

`Minima Website.dc.html` faylının props metadata-sında təyin olunub:

| Prop | Tip | Default | Təsir |
|------|-----|---------|-------|
| **`device`** | enum | `Avtomatik` | `Avtomatik` / `Mobil` / `Masaüstü`. Mobil seçildikdə dizayn real telefon çərçivəsində göstərilir. |
| **`accent`** | color | `#6b7d5a` | Bütün əsas yaşıl tonu (düymələr, kartlar, aktiv hallar) bir yerdən dəyişir. |
| **`streak`** | int | `12` | Ardıcıl gün sayğacının göstərdiyi rəqəm. |

Prototipdə **`device`** ilə mobil/masaüstü keçidini gözlə yoxlaya bilərsiniz (kod dəyişmədən).

---

## 🤖 AI AGENT ÜÇÜN İSTİFADƏ QAYDALARI

Bu bölmə development mərhələsində kod yazan AI agent üçündür.

### Bu prototipin texnologiyası
Fayllar **Design Component (`.dc.html`)** formatındadır — brauzerdə birbaşa işləyən, React-bənzəri xüsusi runtime (`support.js`). Bu, **production framework deyil**; **spesifikasiya/prototipdir**. Development zamanı iki yol var:

**A) Referans kimi istifadə (tövsiyə olunan):**
Bu prototipi *dizayn spesifikasiyası* kimi götürün və məhsulu öz stack-inizdə (React/Vue/Svelte/vanilla + istənilən backend) yenidən qurun. Bütün rənglər, ölçülər, mətnlər, axın və state məntiqi burada hazırdır — birbaşa köçürün.

**B) Prototipdən çıxarış:**
Konkret komponentin dəqiq stilini götürmək üçün `Minima Website.dc.html` faylını oxuyun. Struktur:
- **Template (markup):** `<x-dc>...</x-dc>` arasında. Bütün stillər **inline** (`style="..."`).
- **Logic:** `class Component extends DCLogic` — bütün state, handlerlər, hesablanmış stillər `renderVals()`-da.
- **`{{ path }}`** = template deşikləri; dəyərləri `renderVals()`-dan gəlir.
- **`<sc-if>` / `<sc-for>`** = şərt / dövr.

### Məlumat modeli (data model)
Real backend üçün minimum sxem:

```
User        { id, name, email, avatarInitial, plan, streak, createdAt }
Habit       { id, emoji, title, subtitle, category, targetMinutes }
HabitLog    { id, userId, habitId, date, done:boolean, completedAt }
Mood        { id, userId, date, level:0-4, emoji }         // Mood Tracker
DailyTask   { id, userId, date, text, source:'ai', done }  // "Günün Tapşırığı"
```

### AI inteqrasiyaları (2 ayrı yer)
1. **"Günün Tapşırığı"** (Home) — hər gün istifadəçiyə fərdi mikro-tapşırıq. Prototipdə statik mətndir.
2. **"Tapşırıq Tap"** (AI Chat) — istifadəçi əhvalını göndərir → AI 2 dəqiqəlik reaksiya qaytarır.

> Brief **OpenRouter** göstərir. Prototipdəki cavablar `mood()` funksiyasında **hardcoded** (`tasks` obyekti — Yorğun/Stresli/Həvəssiz/Yaxşı/Əla). Development-də bunu real API çağırışı ilə əvəz edin. Prompt nümunəsi: *"İstifadəçi indi özünü '{əhval}' hiss edir. Ona 2 dəqiqədən çox çəkməyən, alət tələb etməyən, sakit bir mikro-tapşırıq təklif et. Azərbaycan dilində, 1 cümlə, isti tonda."* "AI düşünür…" loading state-i və 1.6s gecikmə saxlanılmalıdır.

### Backend qoşularkən dəyişdiriləcək yerlər (prototipdəki demo qısayolları)
`Minima Website.dc.html` → logic class:
- `submitLogin()` / `submitSignup()` — hazırda **həmişə** app-a keçir. Real auth üçün `this.valid('login')`/`this.valid('signup')` yoxlamasını geri qaytarın (metodlar artıq mövcuddur) və xəta mesajı əlavə edin.
- `mood()` — hardcoded `tasks` obyektini AI API çağırışı ilə əvəz edin.
- `habits`, `moodCells`, həftəlik qrafik dəyərləri, statistika (`84`, `91%`, `40%`) — hamısı **nümunə datadır**, real DB-dən gəlməlidir.
- "Günün Tapşırığı" mətni template-də statikdir — dinamikləşdirin.

### Dil və məzmun
- İnterfeys tam **Azərbaycan dilində**. Ton: **enerjili, motivasiyaedici** ("dopamin dostu").
- Emoji brendin bir hissəsidir (🌿 🔥 ✦) — saxlanılmalıdır.

### Kritik UX qaydaları (briefdən — pozulmamalı)
1. **Mobile-first** — istifadəçilərin 95%-i mobildən. Mobil təcrübə prioritetdir.
2. **Bottom navigation** — mobildə bütün əsas keçidlər aşağıda, baş barmaq zonasında. Yuxarı menyudan istifadə edilmir.
3. **Güclü success state** — tapşırıq tamamlananda güclü vizual uğur hissi (animasiya) məcburidir.
4. Hit target-lər mobildə **≥44px**.

### Loqo
Hazır loqo faylı yoxdur — brief ayrıca verilib. Placeholder: 🌿 emoji + "Minima" (Sora 800). Real loqo hazır olanda sidebar, landing nav, auth və app başlığındakı loqo bloklarında əvəzlənməlidir.

---

## ✅ Hazır olanlar / ⏳ Development-də görüləcəklər

**Hazır (dizayn/UX):** Landing · Login/Signup · Dashboard · AI Chat · Profil + Mood Tracker · Success/Empty/Loading state-ləri · responsiv (mobil↔masaüstü) · mikro-animasiyalar · streak/gamification.

**Development-də əlavə olunmalı:** real auth & backend · OpenRouter AI inteqrasiyası (2 yer) · verilənlər bazası & persistanslıq · vərdiş əlavə/redaktə/silmə axını · onboarding · bildirişlər · real loqo · settings səhifəsi.
