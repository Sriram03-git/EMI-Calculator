# EMI Calculator

## Project structure

- `index.html` is the application entry point. The original source is preserved as `index.backup.html`.
- `assets/css/variables.css` holds the original design tokens; `themes.css` holds dark-mode rules; `layout.css` holds page and navigation structure; `components.css` holds reusable UI; `responsive.css` holds media-query overrides; `main.css` imports them in cascade order.
- `assets/js/state.js` defines shared application state. `utils.js` contains formatting, icons, and input helpers. `app.js` builds the existing view markup.
- `assets/js/calculations/` contains EMI, amortization, prepayment, yearly-optimizer, special-calculation, and date-calculation logic.
- `assets/js/ui/` contains table, renderer, and modal behavior. `validation.js` owns loan-input validation; `navigation.js` wires views, sidebar navigation, and startup.

## Run locally

Open `index.html` directly in a browser, as the application uses ordered classic scripts rather than ES modules. No build step or local server is required. The existing Google Fonts and Tailwind CDN references remain unchanged.

## JavaScript dependencies and maintenance

The original application relies on shared top-level lexical bindings and load order. To avoid changing its behavior, the extracted scripts remain classic scripts and are loaded in dependency order at the end of `index.html`; they intentionally do not use ES-module imports. Keep shared values in `state.js`, and place calculation changes in the corresponding file under `calculations/`. UI rendering and table markup belong under `ui/`. Load new classic scripts only after their dependencies and before `navigation.js`, which performs initialization. This lets calculation work stay isolated from unrelated layout and navigation code without altering the existing calculation algorithms.
