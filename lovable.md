# Lovable Build Prompts — Virtual Try-On App

---

## Prompt 1 — Scaffold & Design System

```
Create a Next.js 14 app with TypeScript and Tailwind CSS.

Design system — Zalando-inspired:
- Primary color: #FF6900 (orange) for buttons, active states, accents
- Background: #FFFFFF
- Surface/cards: #F5F5F5
- Primary text: #1A1A1A
- Secondary text: #767676
- Border: #E5E5E5
- Font: Inter

Global layout:
- Top header: white background, bottom border #E5E5E5
  - Left: logo text "TryOn" in bold black, with a small orange dot after it
  - Right: two nav links "Try It On" and "Style Suggestions" in #1A1A1A,
    active link gets orange underline
- Page content area: max-w-4xl centered, px-4 py-8
- Footer: border-t, centered text "AI-powered by Google Imagen & Gemini" in #767676

Two pages: /try-on (default) and /style
```

---

## Prompt 2 — Try It On page

```
Build the /try-on page ("use client").

Header section:
- H1: "Virtual Try-On"
- Subtext in #767676: "Upload your photo and clothing items to see how they look on you"

Upload section — two columns on desktop, stacked on mobile:
- Left box: label "Your Photo", bordered upload area (#E5E5E5 dashed border, #F5F5F5 bg),
  shows "Upload a photo of yourself" with a person icon. After selection, shows image preview.
- Right box: label "Clothing Items", same style, allows multiple files (up to 5).
  After selection, shows thumbnail previews in a row with filenames below.

Below uploads: orange button "Try It On →" full width on mobile, auto width on desktop.
Disabled (gray) until both inputs have files.

Loading state: replace button with a gray disabled button "Processing..."
and show a text below it: "This can take up to 60 seconds per item — please wait"

Results section (shown after success):
- Section heading "Results"
- Horizontal scrollable row of cards, each card:
  - Image taking full card width, rounded corners
  - Below: step label "Step 1 of 3" in orange, filename in gray
  - Last card gets a small badge "Final Look" in orange

Error: red text below the button showing the error message. Button re-enables.

API: POST /api/try-on (base URL from process.env.NEXT_PUBLIC_API_URL)
Body: multipart/form-data — person_image (File), clothing_images (File[])
Response: { results: [{ step: number, clothing_name: string, image_base64: string }] }
Images: <img src={`data:image/png;base64,${image_base64}`} />
```

---

## Prompt 3 — Style Suggestions page

```
Build the /style page ("use client").

Header section:
- H1: "Style Suggestions"
- Subtext in #767676: "Upload a clothing item and get 3 complete outfit ideas styled by AI"

Upload section — centered card with #F5F5F5 background, rounded, p-6:
- Label "Clothing Item", bordered upload area, shows image preview after selection
- Below upload: label "Gender" with three pill buttons: "Auto-detect" | "Woman" | "Man"
  Selected pill: orange background, white text. Unselected: white bg, #767676 text, gray border
- Orange button "Generate Styles →", disabled until file selected

Loading state: disabled "Generating..." button + text below:
"Gemini is analysing your item and generating 3 outfits — this takes about 60–90 seconds"

Results section (shown after success):
- Item description in a subtle banner: gray bg, text "Detected: [item_description]"
- 3 cards in a responsive grid (1 col mobile, 3 col desktop), each card:
  - White bg, rounded, border #E5E5E5, p-4
  - Bold look name at top (e.g. "Urban Chic")
  - Gray description text below
  - Two images side by side, each labeled:
    Left: "AI Model" (small gray label above)
    Right: "With Your Item" (small orange label above, slight orange border)

Error: red text message, button re-enables.

API: POST /api/style (base URL from process.env.NEXT_PUBLIC_API_URL)
Body: multipart/form-data — clothing_image (File), gender only if "woman" or "man"
Response: { gender, item_description, styles: [{ name, description, model_image_base64, tryon_image_base64 }] }
Images: <img src={`data:image/png;base64,${...}`} />
```

---

## Prompt 4 — Landing page

```
Replace the default / route with a landing page for shoppers.

Hero section:
- Full-width, white background
- Big H1: "See it on you before you buy it"
- Subtext: "AI-powered virtual try-on. Upload your photo, try on any outfit in seconds."
- Two orange CTA buttons side by side: "Try It On" (links to /try-on) and "Style Me" (links to /style)

How it works section — 3 steps in a row (stacked on mobile):
- Step 1: icon + "Upload your photo" + short description
- Step 2: icon + "Add clothing items" + short description
- Step 3: icon + "See the result" + short description
Each step: number in orange, title in bold, description in #767676

Bottom banner: #F5F5F5 background, centered text:
"Powered by Google Imagen 4 · Gemini Vision · Vertex AI"

No login, no sign up — direct access.
```

---

## Prompt 5 — Production deployment config

```
Prepare the app for production deployment on Vercel.

1. Replace every hardcoded http://localhost:8000 with process.env.NEXT_PUBLIC_API_URL

2. In next.config.ts add:
   - images.remotePatterns allowing data URLs (for base64 images)
   - async headers() returning:
       source: '/api/:path*'
       headers: [{ key: 'Cache-Control', value: 'no-store' }]

3. Add a next.config.ts export for NEXT_PUBLIC_API_URL so it is passed through at build time.

4. Update the footer to show the current year dynamically.

5. On both /try-on and /style pages, if NEXT_PUBLIC_API_URL is not set or empty,
   show a visible warning banner at the top:
   "Backend URL is not configured. Set NEXT_PUBLIC_API_URL in your environment."
```

---

## Setup

### Local development

1. Add `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

2. Start the backend:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

### Deploy the backend to Google Cloud Run

Run these commands once from the `backend/` folder:

```bash
# Build and push the container
gcloud run deploy virtual-try-on-backend \
  --source . \
  --region europe-west4 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=virtual-try-on-490008,LOCATION=europe-west4,GEMINI_LOCATION=us-central1 \
  --memory 2Gi
```

Cloud Run will give you a URL like `https://virtual-try-on-backend-xxxx-ew.a.run.app`

You also need a `Dockerfile` in `backend/`:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

Update `config.py` CORS to allow your Vercel domain:
```
CORS_ORIGINS=https://your-app.vercel.app
```

### Deploy the frontend to Vercel

1. Push the Next.js project to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add environment variable in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://virtual-try-on-backend-xxxx-ew.a.run.app
   ```
4. Deploy — Vercel auto-deploys on every push to main
