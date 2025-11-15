# Visual Product Matcher

Image-based product lookup demo built with a MERN-style stack:

- **Frontend**: React + Vite (JavaScript + JSX)
- **Backend**: Node.js + Express + MongoDB (seeded from products.json)
- **Data**: MongoDB collection seeded via `backend/seed.js` from `backend/products.json`

Similarity is currently a **deterministic placeholder**: the backend mixes a per-image hash with each product’s seeded score to produce stable, image-dependent rankings. The API is structured so you can later plug in a real ML model (e.g., CLIP) and store embeddings.

---

## 1. Project Structure

```text
assignment/
  backend/
    server.js
    products.json
    package.json
    .env.example
    seed.js
  frontend/
    index.html
    vite.config.js
    package.json
    .env.example
    src/
      main.jsx
      App.jsx
      styles.css
      components/
        UploadPage.jsx
        ResultsPage.jsx
        ProductCard.jsx
        FiltersPanel.jsx
```

---

## 2. Backend Setup (Node + Express + MongoDB)

```bash
cd backend
npm install
# create .env from .env.example and adjust if needed
# PORT=5000, ALLOWED_ORIGIN=http://localhost:5173, UPLOAD_DIR=uploads, MONGODB_URI=...
npm run seed     # seeds 50 products
npm run dev      # start backend with nodemon
```

Default backend URL: `http://localhost:5000`.

API routes:

- `GET /api/health` – health check
- `GET /api/products` – list all products from MongoDB
- `POST /api/upload` – upload an image (multipart/form-data field: `image`), returns `{ imageUrl }`
- `POST /api/similarity` – body `{ imageUrl, topK?, minScore? }`, returns `{ queryImageUrl, products }`

Uploads are served from `/uploads/...`.

---

## 3. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
# Optionally create .env from .env.example (VITE_API_BASE=http://localhost:5000)
npm run dev
```

Default frontend URL: `http://localhost:5173`.

In dev, Vite proxies `/api` and `/uploads` to the backend; or set `VITE_API_BASE` to the backend base URL.

---

## 4. How the Similarity Feature Works (Current Version)

- MongoDB contains at least **50 products** (seeded).
- Each product has: `id`, `name`, `category`, `imageUrl`, `similarityScore` (seed value).
- `POST /api/similarity` computes a mixed score:
  - `0.6 * seededScore + 0.4 * hash(imageUrl, product)`
  - Filters by `minScore` if provided. Returns top `topK` (frontend requests 50).

### Upgrading to real ML

Replace the placeholder mix with a real image-embedding pipeline (e.g., CLIP embeddings and cosine similarity; embeddings stored in MongoDB/Atlas or computed on the fly via an API).

---

## 5. UI Components

- **UploadPage**
  - Upload an image file or paste an image URL.
  - Basic validation and error messages.
  - Calls `POST /api/upload` (for file) then `POST /api/similarity`.

- **ResultsPage**
  - Shows the query image and similar products.
  - Back navigation.

- **ProductCard**
  - Shows product image, name, category, and similarity score.

- **FiltersPanel**
  - Slider to filter by **minimum similarity score**.

Mobile-responsive layout with CSS grid and media queries.

---

## 6. Error Handling and Loading States

Frontend:

- `UploadPage` tracks `isLoading` and disables the submit button while searching.
- Shows error messages if upload or similarity requests fail.

Backend:

- Returns clear `400` errors when required fields are missing.
- Global error handler returns `500` JSON error messages.

---

## 7. Deployment Notes (Free Hosting)

### Backend (Render / Railway / Fly.io)

1. Push `backend/` to GitHub.
2. Create a new service and set environment variables from `.env.example`.
3. Use `npm start` as the start command.

### Frontend (Netlify / Vercel)

1. Push `frontend/` to GitHub.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set `VITE_API_BASE` to your backend URL (e.g., `https://your-backend.onrender.com`).

---

## 8. 200-word Project Approach Write-up

This project demonstrates a visual product search experience using a MERN-style architecture. The focus is on the end-to-end flow and UX while keeping similarity logic simple and swappable.

On the backend, a Node.js + Express API provides product listing, upload, and similarity endpoints. Products are stored in MongoDB and seeded from a JSON dataset. The similarity endpoint returns top-K items using a deterministic mix of seeded scores and a per-image hash so different inputs yield different, stable rankings. The upload endpoint uses Multer and serves files from a static `/uploads` directory, mirroring a production setup.

The frontend uses React and Vite with a two-step experience: an upload/search step and a results step. Components (`UploadPage`, `ResultsPage`, `ProductCard`, `FiltersPanel`) keep code modular and easy to iterate. The UI is mobile-responsive, includes loading states, and surfaces errors. The API shape and UI make it straightforward to upgrade the similarity logic to real ML embeddings when desired.


<img width="1898" height="907" alt="image" src="https://github.com/user-attachments/assets/8998f516-446e-4486-bf2c-ff7b1b22ccc2" />
