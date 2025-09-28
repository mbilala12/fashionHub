# Fashionhub Automation (Playwright + TypeScript)

This repository contains a Playwright + TypeScript solution implementing the requested automation tests with production-grade structure, cross-browser support, multi-environment config, and Docker/CI friendliness.

## ✅ What’s Included
- Playwright test suite for **Chromium**, **Firefox**, **WebKit** (Safari)
- **Multi-environment** support (local, staging, prod) with CLI or env var selection and automatic fallback
- **Page Object Model** for maintainability
- Console error watcher utility
- Link status verifier with HEAD/GET fallback
- Login test with robust selectors
- GitHub PRs exporter to **CSV**
- HTML report artifacts
- Linting & formatting (ESLint + Prettier)

## Folder Structure
```
.
├── configs/
│   ├── local.json
│   ├── staging.json
│   └── prod.json
├── src/
│   ├── pages/
│   │   ├── HomePage.ts
│   │   └── LoginPage.ts
│   └── utils/
│       ├── consoleWatcher.ts
│       ├── env.ts
│       └── links.ts
├── tests/
│   ├── tc1-console.spec.ts
│   ├── tc2-links-status.spec.ts
│   ├── tc3-login.spec.ts
│   └── tc4-github-prs.spec.ts
├── artifacts/ (created at runtime)
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Environments
Three environment config files live in `configs/`:
- `local.json` → `http://localhost:4000/fashionhub`
- `staging.json` → `https://staging-env/fashionhub`
- `prod.json` → `https://pocketaces2.github.io/fashionhub`

You can select the environment in **either** of these ways (priority left→right):
1. CLI: `--env=prod|staging|local`
2. Env var: `TEST_ENV=prod|staging|local` (or `ENV`, `env`)
3. Default fallback to `prod` if not provided / missing file

## Prerequisites
- Node.js 18+ (recommended 20+)
- (Optional) Docker if you want to run the demo app locally as a container

## Setup
```bash
npm i
npm run install:pwx
```

## Running tests
Default (runs on `prod`):
```bash
npm test

npm run test:prod
npm run test:staging
npm run test:local
```

Select env and/or browser projects:
```bash
# Staging env (uses configs/staging.json)
npx playwright test --env=staging

# Local env (when running the Fashionhub demo container locally)
npx playwright test --env=local

# Single browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

Open Playwright UI or report:
```bash
npm run test:ui
npm run report
```

## Test Cases Mapping

### TC1 – Console Errors
- `tests/tc1-console.spec.ts`
- Validates **home page has no console errors**.
- Also **demonstrates** error capture on `/about.html` (this page has an intentional error).

### TC2 – Link Status
- `tests/tc2-links-status.spec.ts`
- Extracts all `<a href>` on home, skips `mailto:`, `tel:`, `javascript:`, `#`.
- Checks each link via **HEAD** with **GET fallback** → expects **200–399** only.
- (Bonus) Navigates to internal links to ensure client navigation works.

### TC3 – Login
- `tests/tc3-login.spec.ts`
- Visits `/login.html` and logs in with:
  - **Username:** `demouser`
  - **Password:** `fashion123`
- Asserts successful login via multiple heuristics (Welcome/Logout/etc.).

### TC4 – GitHub PRs → CSV
- `tests/tc4-github-prs.spec.ts`
- Uses GitHub public API to list **open** PRs for `appwrite/appwrite`.
- Writes CSV to `./artifacts/appwrite_open_prs.csv` and also prints CSV to console.

## Docker Notes
If you run the **Fashionhub Demo App** locally (as per challenge), start it on `http://localhost:4000/fashionhub` and then run:
```bash
npx playwright test --env=local
```
(You can also run tests inside the official Playwright Docker image; add a simple Dockerfile if needed.)

## Jenkins / CI
- Set `TEST_ENV` env var or pass `--env=` in the CI job.
- Artifacts: HTML report (`playwright-report/`) and CSV (`artifacts/`).
- Example shell:
```bash
npm ci
npx playwright install --with-deps
npx playwright test --env=prod
npx playwright show-report
```

## Notes on Selectors & Robustness
- Prefer **role/label** based selectors (`getByRole`, `getByLabel`) to be resilient.
- Utilities are isolated under `src/utils` to encourage reuse and maintenance.
- Config resolution logic gracefully **falls back** if the preferred config is missing.

## Troubleshooting
- If TC2 fails due to an external site returning 4xx/5xx transiently, re-run or restrict to same-origin links.
- If the login page uses different field labels, the test tries both **label** and **placeholder** strategies.


## Running with explicit environment
Because Playwright parses its own CLI flags, pass custom flags **after** `--`, or prefer env vars:

**Recommended (simple):**  
```bash
# macOS/Linux
TEST_ENV=staging npx playwright test
TEST_ENV=local npx playwright test
```

**Windows PowerShell:**  
```powershell
$env:TEST_ENV="staging"; npx playwright test
```

**Using npm scripts (added):**  
```bash
npm run test:staging   # TEST_ENV=staging
npm run test:local     # TEST_ENV=local
npm run test:prod      # TEST_ENV=prod
```

**If you still want to use a CLI flag:**  
```bash
npx playwright test -- --env=staging
```


### Custom/real staging URL
The default `staging.json` contains a **dummy hostname** (`https://staging-env/fashionhub`). To run against a real staging host, set one of:
```bash
# macOS/Linux
BASE_URL="https://your-real-staging.example.com/fashionhub" npx playwright test

# Windows PowerShell
$env:BASE_URL="https://your-real-staging.example.com/fashionhub"; npx playwright test
```

Priority order for base URL resolution:
1. `BASE_URL` or `TEST_BASE_URL` (highest)
2. `--env=prod|staging|local` (or `TEST_ENV`/`ENV`)
3. Config file fallback (`configs/prod.json`)
