# Minima Design QA

Source visual truth: `/Users/raullte/Desktop/Projects/Side Projects/minima/Minima micro-habits tracker/Minima Website.dc.html`

Implementation: `http://127.0.0.1:4173`

Implementation screenshots:

- `/Users/raullte/Desktop/Projects/Side Projects/minima/qa/implementation-mobile-landing.jpg`
- `/Users/raullte/Desktop/Projects/Side Projects/minima/qa/implementation-mobile-signup.jpg`
- `/Users/raullte/Desktop/Projects/Side Projects/minima/qa/implementation-mobile-dashboard.jpg`
- `/Users/raullte/Desktop/Projects/Side Projects/minima/qa/implementation-desktop-landing.jpg`
- `/Users/raullte/Desktop/Projects/Side Projects/minima/qa/implementation-desktop-profile.jpg`

Source captures are stored beside them with the `source-` prefix.

Viewports: `390 × 844` mobile and `1440 × 1000` desktop.

States: landing, sign-up, authenticated dashboard, optimistic completion success, AI idle/loading/result, profile analytics, and daily mood selection.

## Full-view comparison evidence

Each source capture and implementation capture was emitted together in the same browser comparison input at the matching viewport and state. The final mobile landing, sign-up, dashboard, AI states, completion overlay, and desktop landing/profile compositions preserve the source hierarchy, matte olive palette, typography treatment, rounded surfaces, shadows, navigation structure, and responsive behavior.

## Focused region comparison evidence

- Mobile sign-up card: compared brand position, card crop, field heights, labels, CTA, terms, and account switcher.
- Mobile dashboard: compared header badges, daily AI card, section rhythm, habit rows, completion states, and fixed bottom navigation.
- AI chat: compared idle, loading, and generated-task card states, including disabled composer controls.
- Desktop profile: compared stat cards, mood heatmap proportions, analytics column, sidebar, and logout treatment.

These regions were readable at the captured sizes, so no additional cropped detail captures were required.

## Findings

No actionable P0, P1, or P2 findings remain.

The required fidelity surfaces were checked explicitly:

- Fonts and typography: Sora, DM Sans, and Space Grotesk reproduce the source display/body/data hierarchy, weight, wrapping, and small-label tracking without truncation.
- Spacing and layout rhythm: mobile top alignment, dashboard spacing, desktop profile column ratio, radii, and elevation now match the source closely at both tested viewports.
- Colors and visual tokens: olive, dark ink, cream page, soft surfaces, borders, selected/completed states, and shadows map consistently to the source palette.
- Image quality and asset fidelity: the interface has no missing hero/product imagery. PWA raster icons are sharp at 180, 192, and 512 pixels and derive from the established Phosphor plant icon. UI actions use the Phosphor icon family instead of handcrafted SVG/CSS drawings.
- Copy and content: Azerbaijani product copy matches the source intent. Dynamic stats and AI/habit text differ only because tested interactions mutate real demo state.

## Open Questions

- The production password minimum is intentionally six characters while the visual source says four. This is classified as acceptable security-driven P3 copy drift.
- The profile includes an inline “Bu gün” mood chooser and a second generated insight card. These are intentional functional extensions required by the brief; they add vertical content but do not break the source hierarchy.

## Comparison history

### Iteration 1

- Earlier finding [P1]: the mobile auth layout was vertically centered, placing the brand and card below the source position.
  Fix: mobile `.auth-page` now aligns content to the top.
  Post-fix evidence: paired `source-mobile-signup.jpg` and `implementation-mobile-signup.jpg` show matching card start and horizontal alignment.
- Earlier finding [P2]: the Minima wordmark was hidden at the narrow mobile breakpoint.
  Fix: removed the mobile rule that hid the brand text.
  Post-fix evidence: paired mobile landing captures show the full wordmark in both versions.
- Earlier finding [P2]: the mobile habit list began too far below the daily AI card.
  Fix: tightened the mobile daily-card gap/margin and section-heading rhythm.
  Post-fix evidence: paired mobile dashboard captures show the first habit row within the source rhythm.

### Iteration 2

- Earlier finding [P1]: switching between dashboard screens retained the previous page scroll position.
  Fix: screen changes now reset window scroll to the top.
  Post-fix evidence: profile opens with the greeting and stat cards visible at the top of the mobile viewport.
- Earlier finding [P2]: the desktop profile heatmap/analytics split was too wide on the heatmap side.
  Fix: changed the profile grid ratio from `2fr / 1fr` to `1.55fr / 1fr`.
  Post-fix evidence: paired desktop profile captures now align the heatmap and analytics column proportions with the source.
- Earlier finding [P2]: mood selection exposed visual state but not programmatic selected state.
  Fix: added `aria-pressed` to mood controls.
  Post-fix evidence: selected mood retains the source outline while reporting its state accessibly.

## Primary interactions tested

- Landing → sign-up → demo app navigation.
- Optimistic habit completion and success overlay.
- AI mood selection, loading state, generated result, and “Başla” insertion into habits.
- Habit create, rename, and delete.
- Desktop/sidebar and mobile/bottom navigation.
- Daily mood save and selected state.
- PWA manifest, service worker response, and generated icon dimensions.

Production browser console warnings/errors: none.

## Implementation Checklist

- [x] Resolve all P0/P1/P2 visual findings.
- [x] Verify mobile and desktop responsive layouts.
- [x] Verify core interaction states and optimistic updates.
- [x] Verify PWA assets and production service worker.
- [x] Run lint, typecheck, and production build.

## Follow-up Polish

- [P3] Update the source design copy to say “ən azı 6 simvol” if the design file is maintained further.
- [P3] Add a dedicated reference state for the functional daily mood chooser so future QA does not treat the added row as visual drift.

final result: passed
