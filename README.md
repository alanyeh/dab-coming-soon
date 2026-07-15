# DAB Coming Soon

A lightweight, responsive coming-soon landing page for **DAB**, a climbing brand.

## Project structure

```text
.
├── index.html
├── AGENTS.md
├── README.md
├── assets
│   ├── css
│   │   └── styles.css
│   ├── images
│   │   ├── dab-block.png
│   │   └── dab-logo.svg
│   └── js
│       └── main.js
```

## Run locally

No build step or package installation is required.

From this folder, run:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

You can also open `index.html` directly, though a local server is better for testing.

## Email signup

The form currently behaves as a demo:

- When `FORM_ENDPOINT` in `assets/js/main.js` is blank, the submitted email is stored in `localStorage`.
- To make it production-ready, set `FORM_ENDPOINT` to a Formspree, Basin, custom API, or other form endpoint.

## Store launch

The product page is scaffolded at `/buy/` but remains closed by default. Store settings live in `assets/js/store-config.js`.

To launch:

1. Add the final product copy, hold names, prices, shipping, and returns details to `store-config.js`.
2. Set each hold option's `checkoutUrl` to its HTTPS Stripe Payment Link.
3. Change `enabled` from `false` to `true`.

With `enabled: false`, the homepage continues to show “Coming soon,” the shop link stays hidden, and checkout remains disabled. The full product preview is still available directly at `/buy/`.

To smoke-test the configured live checkout links without launching the store, use `/buy/?checkout=1` on `localhost` or `127.0.0.1`. This switch never activates checkout on the production domain.

## Main editing locations

- Page content and structure: `index.html`
- Layout, typography, responsive behavior, and animation: `assets/css/styles.css`
- Signup behavior: `assets/js/main.js`
- Logo and product image: `assets/images/`

## Current design direction

- White background
- Black and gray editorial typography
- Minimal, premium climbing-brand feel
- Large product-led composition
- No language describing the product as “3D printed”
- Responsive desktop and mobile layouts
