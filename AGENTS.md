# DAB Website — Codex Working Notes

## Goal

Continue developing a refined coming-soon site for **DAB**, a climbing brand. The site should feel minimal, premium, product-focused, and editorial rather than like a generic startup landing page.

## Brand direction

- Brand name: DAB
- Category: Climbing goods and training tools
- Current stage: Coming soon / first drop
- Visual tone: Clean, tactile, confident, restrained
- Background: White
- Palette: Primarily black, white, and neutral gray
- Avoid bright gradients, glossy SaaS styling, excessive rounded cards, or decorative UI clutter
- Avoid explicitly describing products as “3D printed” unless the owner later requests it

## Current copy

- Eyebrow: “Climbing, distilled.”
- Hero: “Grip. Move. Repeat.”
- Supporting copy: “DAB makes considered climbing tools for warm-ups, training days, and the moments between attempts. Designed by climbers. Made to move.”
- Signup heading: “First drop, soon.”

Copy can be refined, but keep it brief and brand-led.

## Important files

- `index.html` — semantic page structure and copy
- `assets/css/styles.css` — all visual styling and responsive rules
- `assets/js/main.js` — email signup demo behavior
- `assets/images/dab-logo.svg` — official DAB logo; preserve proportions
- `assets/images/dab-block.png` — current product render used in the hero

## Engineering constraints

- Keep the site dependency-free unless there is a clear reason to add tooling
- Preserve responsive behavior at desktop, tablet, and mobile widths
- Maintain accessible labels, focus states, semantic headings, and reduced-motion support
- Do not remove the email form; improve it only when requested
- Keep the site easy to deploy to GitHub Pages, Netlify, Vercel, or any static host

## Suggested next steps

1. Refine product-image sizing and crop across breakpoints
2. Replace placeholder Instagram link
3. Connect the email form to a production endpoint
4. Add favicon and social preview metadata
5. Consider a subtle second content section only if it improves the launch story
