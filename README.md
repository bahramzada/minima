# Minima

Minima gündəlik mikro-vərdişlər, əhval qeydləri və fərdiləşdirilmiş AI tapşırıqları üçün mobil-fokuslu Next.js tətbiqidir.

Bu folder müstəqil `web` Git repository-sidir (`bahramzada/minima`). React Native + Expo tətbiqi sibling `../mobile/` repository-sindədir. Backend Minima API-dir (`../api/`, `https://minima.ltehub.top/v1`); `supabase/` folder-i yalnız köhnə Supabase migration-larının tarixi istinadıdır. Workspace roadmap və iş qaydaları bir üst `minima/` folder-ində saxlanılır.

## Texnologiyalar

- Next.js App Router, React, TypeScript
- Tailwind CSS və Framer Motion
- Minima API (Hono + PostgreSQL), eyni origin üzərində `/v1/*`
- `@ducanh2912/next-pwa` ilə install edilə bilən PWA

## Sessiya modeli

- Brauzer API-yə birbaşa `/v1/...` ilə müraciət edir; access token (15 dəq) yalnız yaddaşdadır.
- Refresh token JavaScript-ə görünmür: `/api/session/{login,refresh,logout,change-password}` route handler-ləri onu `httpOnly`, `SameSite=Lax` cookie-də saxlayır və API-yə `API_INTERNAL_URL` ilə müraciət edir (ziyarətçinin IP-sini `cf-connecting-ip` ilə ötürür, çünki API sorğu limitini IP ilə hesablayır).
- Refresh tabs arası `navigator.locks` ilə növbələnir ki, rotasiya olunmuş cookie təkrar istifadə edilməsin.
- E-poçt linkləri (`client=web`) API üzərindən `/auth/callback`-ə yönləndirilir (təsdiq → `/login?notice=verified`, şifrə sıfırlama → yeni şifrə formu).
- Service worker `/v1/*` cavablarını heç vaxt keşləmir (`NetworkOnly`).

## Lokal işə salma

API-ni ayrıca işə salın (`../api/scripts/dev-db.sh`, sonra `WEB_BASE_URL=http://localhost:3000 npm run dev` `api/` daxilində).

```bash
cd web
npm install
cp .env.example .env.local   # API_INTERNAL_URL=http://localhost:8080
npm run dev
```

Development serverində `/v1/*` sorğuları `next.config.mjs`-dəki rewrite ilə API-yə yönləndirilir; production-da bunu Caddy edir.

## Container

`Dockerfile` (Next.js standalone, istifadəçi `node`, port 3000, health `GET /api/health`). Runtime dəyişənləri: `API_INTERNAL_URL` (məs. `http://minima-api:8080`), istəyə görə `SITE_URL`. Secret lazım deyil; build arqumenti yoxdur.

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

- Caddy `/v1/*` sorğularını API-yə, qalanını web konteynerinə yönləndirməlidir (eyni origin, CORS lazım deyil).
- API-də `WEB_BASE_URL` web-in ictimai origin-nə bərabər olmalıdır (e-poçt linkləri üçün).
- HTTPS üzərində deploy edin: session cookie-si production-da `Secure` işarəlidir və service worker yalnız təhlükəsiz origin-də işləyir.
- AI köməkçi (Tapşırıq Tap) API-yə köçürülənə qədər "Tezliklə" kimi göstərilir (roadmap MB-12).

## License

MIT. See [LICENSE](LICENSE).
