import Link from "next/link";

import { Brand } from "@/components/brand";

const features = [
  {
    emoji: "📋",
    tint: "#eef1e4",
    title: "Günlük minimallar",
    text: "5–10 dəqiqəlik kiçik tapşırıqlar. Böyük hədəf yox — sadəcə növbəti kiçik addım.",
  },
  {
    emoji: "⚡",
    tint: "#e4eef1",
    title: "AI Tapşırıq Tap",
    text: "Əhvalını de, AI sənə anında sənə uyğun 2 dəqiqəlik reaksiya versin.",
  },
  {
    emoji: "📅",
    tint: "#f1e9e4",
    title: "Mood Tracker",
    text: "Əhvalını izlə, AI hansı vərdişin sənə yaxşı təsir etdiyini göstərsin.",
  },
];

export function LandingPage() {
  return (
    <main className="landing-page">
      <nav className="landing-nav">
        <Brand />
        <div className="landing-nav-actions">
          <Link href="/login" className="nav-login">
            Daxil ol
          </Link>
          <Link href="/signup" className="button button-small button-primary">
            Pulsuz başla
          </Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span aria-hidden="true">✦</span> AI mikro-vərdiş izləyicisi
          </div>
          <h1>
            Kiçik addımlar,
            <br />
            böyük nəticələr.
          </h1>
          <p>
            Gün ərzində cəmi 5–10 dəqiqə. Minima sənə hər gün kiçik
            vərdişlər verir, AI əhvalına uyğun tapşırıq seçir — sən sadəcə
            davam edirsən.
          </p>
          <div className="hero-actions">
            <Link href="/signup" className="button button-primary">
              Pulsuz başla →
            </Link>
            <Link href="/login" className="button button-secondary">
              Girişə keç
            </Link>
          </div>
          <div className="hero-note">
            Kart tələb olunmur · İlk vərdişini 30 saniyəyə seç
          </div>
        </div>

        <div className="hero-preview-wrap" aria-label="Minima tətbiq önizləməsi">
          <div className="hero-glow" />
          <div className="hero-preview floating-card">
            <div className="preview-header">
              <strong>Salam, Aysel 🌿</strong>
              <span>🔥 12</span>
            </div>
            <div className="preview-ai">
              <small>✦ Günün Tapşırığı · AI</small>
              <strong>3 dəqiqə pəncərədən bayıra bax</strong>
            </div>
            <div className="preview-habit">
              <span className="preview-icon">📖</span>
              <strong>10 dəq kitab oxu</strong>
              <i aria-hidden="true" />
            </div>
            <div className="preview-habit is-done">
              <span className="preview-icon">🚶</span>
              <strong>20 dəq gəz</strong>
              <b aria-label="Tamamlandı">✓</b>
            </div>
          </div>
        </div>
      </section>

      <section className="how-section" id="nece-isleyir">
        <div className="section-inner">
          <h2>Necə işləyir</h2>
          <p>Üç sadə hissə — yormadan, hər gün kiçik bir addım.</p>
          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <span style={{ backgroundColor: feature.tint }}>
                  {feature.emoji}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-bottom">
        <div className="cta-card">
          <h2>Bu gün ilk minimalını seç</h2>
          <p>Seriyanı bu gün başlat. Sabah özünə təşəkkür edəcəksən. 🔥</p>
          <Link href="/signup" className="button button-inverse">
            Pulsuz başla →
          </Link>
        </div>
        <footer>
          <span>© 2026 Minima · Kiçik addımlar, böyük nəticələr.</span>
          <div>
            <a href="#gizlilik">Gizlilik</a>
            <a href="#sertler">Şərtlər</a>
            <a href="mailto:hello@minima.app">Əlaqə</a>
          </div>
        </footer>
      </section>
    </main>
  );
}
