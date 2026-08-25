# Minima

Minima gündəlik mikro-vərdişlər, əhval qeydləri və fərdiləşdirilmiş AI tapşırıqları üçün mobil-fokuslu Next.js tətbiqidir.

## Texnologiyalar

- Next.js App Router, React, TypeScript
- Tailwind CSS və Framer Motion
- Supabase Auth + PostgreSQL + Row Level Security
- OpenRouter server-side AI inteqrasiyası
- `@ducanh2912/next-pwa` ilə install edilə bilən PWA

## Lokal işə salma

```bash
npm install
cp .env.example .env.local
npm run dev
```

Tətbiq default olaraq `http://localhost:3000` ünvanında açılır. Supabase dəyişənləri boş olduqda təhlükəsiz lokal demo rejimi işləyir; demo məlumatları brauzerin `localStorage` yaddaşında saxlanılır.

## Supabase quraşdırması

1. Supabase-də yeni project yaradın.
2. [`supabase/migrations/202607190001_initial_schema.sql`](./supabase/migrations/202607190001_initial_schema.sql) faylını SQL Editor-da icra edin və ya Supabase CLI ilə migration tətbiq edin.
3. Project URL və publishable key-i `.env.local` faylına əlavə edin.
4. Authentication bölməsində Email provider-i aktiv saxlayın.
5. Google provider-i aktivləşdirin və Google OAuth credentials əlavə edin.
6. Supabase URL Configuration-da aşağıdakı redirect URL-ləri əlavə edin:

```text
http://localhost:3000/auth/callback
https://SIZIN-DOMENINIZ/auth/callback
```

Migration profil yaradılmasını, starter vərdişləri, streak hesablanmasını, unique gündəlik logları və bütün cədvəllər üçün istifadəçi-səviyyəli RLS qaydalarını qurur.

## OpenRouter quraşdırması

`.env.local` daxilində yalnız serverdə istifadə olunan açarı təyin edin:

```env
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=google/gemma-3-4b-it
OPENROUTER_SITE_URL=http://localhost:3000
```

AI açarı frontend bundle-a ötürülmür. Bütün sorğular Next.js Route Handlers vasitəsilə göndərilir. OpenRouter əlçatan olmadıqda istifadəçi axınının qırılmaması üçün lokal, əhvala uyğun fallback tapşırıqlar qaytarılır.

## Əsas komandalar

```bash
npm run dev        # development server
npm run lint       # ESLint
npm run typecheck  # TypeScript yoxlaması
npm run build      # production build + service worker
npm start          # production server
npm run icons      # PWA ikonlarını yenidən yarat
```

## Production checklist

- `.env.local` dəyişənlərini hosting platformasında secret kimi əlavə edin.
- Supabase redirect URL-lərində production domenini qeyd edin.
- `OPENROUTER_SITE_URL` dəyərini production domeninə dəyişin.
- `ALLOW_DEMO_AI=false` saxlayın ki, anonim istifadəçilər OpenRouter xərcini yarada bilməsin.
- HTTPS üzərində build deploy edin; service worker yalnız təhlükəsiz origin-də (və localhost-da) işləyir.

