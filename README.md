# Dakota Research Website

Static multi-page website scaffold for Dakota Research.

## Structure

- `index.html`: main landing page
- `about.html`: team and company background page
- `portfolio.html`: portfolio page with embedded PDF viewer
- `css/style.css`: shared styles and responsive layout
- `js/main.js`: mobile menu, reveal animations, and contact form interaction
- `assets/images/`: image assets
- `assets/docs/`: downloadable PDFs/briefs

## Run locally

Open `index.html` directly in a browser, or serve with a local static server.

Example with Python:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Add your PDF portfolio

1. Place your portfolio file at `assets/docs/portfolio.pdf`.
2. Open `portfolio.html` in the browser.
3. (Optional) Add more files and update links in `portfolio.html`:
   - `assets/docs/case-study-1.pdf`
   - `assets/docs/case-study-2.pdf`
   - `assets/docs/case-study-3.pdf`
