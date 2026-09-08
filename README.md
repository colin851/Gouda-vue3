# GoudaText Showcase

Vue 3 + Vite + GSAP single-page Gunpla portfolio. The original visual language is kept: dark background, warm gold accents, left navigation, full-screen section transitions, gallery cards, and schedule panels.

## Run locally

```bash
npm install
npm run dev
```

Build for production with `npm run build`, then preview with `npm run preview`.

## Structure

- `src/App.vue` — full-screen shell, navigation, GSAP transitions, gallery and detail dialog.
- `src/data/products.js` — single source of truth for works and image paths.
- `src/styles.css` — responsive desktop/mobile visual system.
- `public/img/` and `public/fonts/` — static assets copied into the production build by Vite.

The old duplicated detail pages and jQuery plugins are no longer used. Product details are data-driven and opened in an accessible dialog, with lazy image loading, fallback images, keyboard Escape support, and touch-friendly navigation.
