# Dakota Research Website

Static multi-page website scaffold for Dakota Research.

## Structure

- `index.html`: main landing page
- `services.html`: standalone services page
- `process.html`: standalone process page
- `contact.html`: standalone contact page
- `about.html`: company background page
- `portfolio.html`: portfolio page with embedded PDF viewer
- `css/style.css`: shared black/white styles and sliding drawer UI
- `js/main.js`: drawer navigation behavior and contact form interaction
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

## Enable contact emails (Formspree)

1. Create a form at Formspree and copy your form endpoint ID.
2. Open `contact.html` and update:
   - `action="https://formspree.io/f/your_form_id"`
3. Replace `your_form_id` with your real ID (example: `xabcdeyz`).
4. Submissions will appear in your Formspree dashboard and can forward to your email.
