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
