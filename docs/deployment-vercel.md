# Deploying EventCraft AI on Vercel — step by step

Free Hobby plan is enough. The repo is already on GitHub at
`Yuser00123/eventcraft-ai`, and Vercel auto-detects Next.js, so no build
configuration is needed.

---

## Part A — One-time setup (~5 minutes)

### 1. Create / open your Vercel account
1. Go to **https://vercel.com/signup**
2. Choose **Continue with GitHub** and authorize Vercel on your GitHub account.
3. If asked to pick a plan, choose **Hobby (free, for personal projects)**.

### 2. Import the repository
1. Go to **https://vercel.com/new**
2. Under **Import Git Repository**, find **`eventcraft-ai`**.
   - If it is not listed, click **Adjust GitHub App Permissions** (or
     **Add GitHub Account**), grant access to the `eventcraft-ai` repo, and return.
3. Click **Import**.

### 3. Configure the project
Vercel pre-fills everything correctly for Next.js — verify these values and
do not change them:

| Setting | Value |
|---|---|
| Project Name | `eventcraft-ai` (or anything you like) |
| Framework Preset | **Next.js** (auto-detected) |
| Root Directory | `./` (repo root — do not change) |
| Build Command | `next build` (auto) |
| Output Directory | `.next` (auto) |
| Install Command | `npm install` (auto) |
| Node.js version | 20.x (Settings → General, if shown) |

### 4. Add the environment variable
Expand the **Environment Variables** section and add:

| Key | Value | Environments |
|---|---|---|
| `GEMINI_API_KEY` | *(paste the key from Google AI Studio)* | Production, Preview, Development ✅ |

Optionally add a second variable:

| Key | Value |
|---|---|
| `GEMINI_MODEL` | `gemini-flash-latest` |

> **No key yet?** You can deploy without it — the app runs fully in its
> labelled **demo mode**, so the deployed link is never broken. Add the key
> later (Part C) and redeploy.

### 5. Deploy
Click **Deploy**. The first build takes 1–3 minutes. Wait until you see the
celebration screen, then click **Visit** (or **Continue to Dashboard**).

Your live URL looks like:
`https://eventcraft-ai-<your-slug>.vercel.app`

---

## Part B — Verify the deployment (3 minutes)

Open these checks in order:

1. **Landing page** — `https://<your-url>.vercel.app/` → hero renders, sections scroll.
2. **Sample flow** — click **Try a sample event** → **Generate AI plan** → the dashboard appears.
3. **Dashboard tabs** — Budget, Timeline, Checklist, Ideas, Assistant all open.
4. **Security headers** (optional, good evidence for your README/video):
   ```bash
   curl -s -D - -o /dev/null https://<your-url>.vercel.app/ | grep -iE "content-security-policy|x-frame|strict-transport"
   ```
   You should see the CSP, X-Frame-Options and HSTS headers.
5. **Live Gemini check** (only if you added the key): generate a plan and
   confirm the top badge **does not** say "Demo estimates". If it does, the
   key is missing or invalid — check Part C.

Paste the final URL into the **Project Deployed Link** field on Hack2Skill.

---

## Part C — Adding or fixing the Gemini key later

1. In the Vercel dashboard, open the project → **Settings** → **Environment Variables**.
2. Add or correct `GEMINI_API_KEY` (tick all three environments).
3. Go to the **Deployments** tab → open the latest deployment's `⋯` menu → **Redeploy** → confirm.
   (Env-var changes only take effect on a new deployment.)
4. Re-run verification step 5.

---

## Part D — Updating the app after future code changes

Every `git push` to `main` automatically triggers a new production deployment:

```bash
git add -A
git commit -m "your change message"
git push origin main
```

Preview deployments are created automatically for any other branch — useful
for testing attempt 2/3 improvements without touching the live submission URL.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails on dependency install | Redeploy; if persistent, Settings → Git → redeploy with no build cache. |
| "Demo estimates" badge stays after adding key | Env var name must be exactly `GEMINI_API_KEY`; then Redeploy (Part C). |
| API returns 429 quickly | The in-memory rate limiter resets per serverless instance — normal on free tier; wait a minute. |
| Page 404 after deploy | Confirm Root Directory is `./` and the deployed branch is `main`. |
| Fonts look different briefly | `next/font` self-hosts fonts; a cold start may swap fallback fonts for a second — expected. |

## What goes into the Hack2Skill form
- **Project Deployed Link:** the `https://...vercel.app` URL
- **Public GitHub Repository Link:** `https://github.com/Yuser00123/eventcraft-ai`
- Keep the deployment live until evaluation completes.
