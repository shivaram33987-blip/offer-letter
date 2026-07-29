# Vercel Deployment Guide for Frontend

This repository is fully configured for seamless deployment of the React Vite frontend to **Vercel**.

---

## 🚀 How to Deploy on Vercel

### Option A: Deploying Frontend directly (Recommended)

1. **Push your code to GitHub / GitLab / Bitbucket**.
2. Log in to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..." > "Project"**.
3. Import your repository.
4. In the **Project Settings**:
   - **Root Directory**: Select `frontend` (or click Edit and set to `frontend`).
   - **Framework Preset**: `Vite` (Vercel automatically detects this).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   Add the following environment variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-backend-api-domain.com/api` *(replace with your live backend API URL)*
6. Click **Deploy**.

---

### Option B: Deploying Root Monorepo

If you deploy from the repository root without selecting a subdirectory:
- **Build Command**: `npm run build:frontend`
- **Output Directory**: `frontend/dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://your-backend-api-domain.com/api`

---

## ⚙️ Configuration Files Added/Updated

1. [frontend/vercel.json](file:///c:/Users/shiva/OneDrive/Desktop/offer%20letter/frontend/vercel.json): SPA rewrite rules for client-side routing & Vite settings.
2. [vercel.json](file:///c:/Users/shiva/OneDrive/Desktop/offer%20letter/vercel.json): Root Vercel setup for monorepo deployments.
3. [frontend/src/services/api.ts](file:///c:/Users/shiva/OneDrive/Desktop/offer%20letter/frontend/src/services/api.ts): Dynamic `API_BASE_URL` resolution via `import.meta.env.VITE_API_BASE_URL`.
4. [frontend/src/vite-env.d.ts](file:///c:/Users/shiva/OneDrive/Desktop/offer%20letter/frontend/src/vite-env.d.ts): TypeScript definitions for Vite `import.meta.env`.
5. [frontend/.env.example](file:///c:/Users/shiva/OneDrive/Desktop/offer%20letter/frontend/.env.example): Reference for environment variable configuration.
6. [.gitignore](file:///c:/Users/shiva/OneDrive/Desktop/offer%20letter/.gitignore) & [frontend/.gitignore](file:///c:/Users/shiva/OneDrive/Desktop/offer%20letter/frontend/.gitignore): Git ignore configuration for `node_modules`, `dist`, `.env`, and temporary files.

---

## 🧪 Local Testing

To test the production build locally prior to deploying:
```bash
cd frontend
npm run build
npm run preview
```
