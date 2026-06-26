# Khaled Portfolio — Master Context

> **Single source of truth for this project.**
> Every chat and every Claude Code session: READ this file first, UPDATE it last.
> If a decision is not written here, it has not been made.

---

## 0. How to use this file

- **First action, every session:** read §1–3 (identity + decisions + architecture), §7 (phase plan), §9 (tracker), §12 (resume).
- **Last action, every session:** tick §9, append to §10, move resolved items out of §11.
- Decisions in §2 bind every role. One role cannot override them — escalate to a §10 entry instead.
- **To move the project forward:** open the Conductor chat (§6a), paste the current §9, and follow its one-step output. The Conductor tells you the surface, the prerequisites, and the exact prompt for each step.

---

## 1. Project identity

| Field | Value |
|---|---|
| Name | Khaled Portfolio |
| One-liner | A premium personal portfolio + brand site that proves senior-level range (Flutter/mobile, frontend, backend, DevOps) and drives recruiters and engineering leaders to get in touch. The repo itself — clean Terraform IaC and OIDC CI/CD — is part of the proof. |
| Target market / audience | International, English-first: recruiters and engineering leaders worldwide, open to relocation. German market (Berlin / Munich / Hamburg) as a secondary, deliberate focus via a DE locale. |
| Owner | Khaled |
| Repo | monorepo `portfolio` (host TBD — GitHub) |
| Status | greenfield |

---

## 2. Locked decisions

| Area | Decision |
|---|---|
| Layers in scope | web, devops, ui/ux. (No mobile. No general backend — the only server-side code is one contact-form Lambda.) |
| Backend stack | None, except a single contact Lambda: Node.js 20 on AWS Lambda behind API Gateway (HTTP API), sending mail via Amazon SES. No database, no auth, no other endpoints. |
| Frontend (web) stack | Next.js 14 (App Router), **static export** (`output: 'export'`), TypeScript, Tailwind CSS, Radix UI primitives, Framer Motion + GSAP ScrollTrigger + Lenis (smooth scroll). |
| Mobile stack | N/A — web-only project. |
| Infra / cloud | AWS: S3 (static origin) + CloudFront (CDN, OAC) + ACM (TLS) + API Gateway + Lambda + SES (contact form). Region eu-central-1 for S3/Lambda/SES; ACM cert in us-east-1 (CloudFront requirement). |
| IaC tool | Terraform (all infra as code, no console clicks except DNS at GoDaddy). |
| CI/CD | GitHub Actions. OIDC federation to AWS (no long-lived keys). All third-party actions pinned to a commit SHA. Build static export → sync to S3 → invalidate CloudFront. |
| Repo strategy | Monorepo named `portfolio`. Layout: `/app` (Next.js), `/infra` (Terraform), `/.github/workflows` (CI/CD), `/lambda` (contact handler source), `DESIGN_SYSTEM.md` + this master file at root. |
| Environments | prod only. |
| Build flavors (mobile) | N/A. |
| Design system | **Open** — generated fresh per-project in Claude Design (web), then handed off to Claude Code. Visual bar: Apple-grade polish, premium and intentional, never templated/AI-looking. Lock early. Recorded in `DESIGN_SYSTEM.md`. |
| Package / bundle IDs | N/A (web has no bundle ID). NPM package name `portfolio-web` (private, unpublished). |
| Branch strategy | Trunk-based: short-lived branches off `main`, merge fast. (`feature/**`, `fix/**`, `chore/**` for the short-lived branches.) |
| Commit convention | Conventional Commits (`feat:`, `fix:`, `chore:`, `ci:`, `docs:`, `refactor:`, `perf:`). |

Decisions marked `ASSUMED` in §10 are defaults, not confirmed — review them.

---

## 3. Architecture overview

A fully static Next.js site served globally from CloudFront, with one small serverless path for the contact form. There is no application backend and no datastore — the "backend" is a single stateless Lambda.

**Render + deploy path.** Next.js builds with `output: 'export'` to a static `out/` directory. GitHub Actions syncs `out/` to a private S3 bucket; CloudFront serves it via Origin Access Control (the bucket is never public). After each sync the workflow issues a CloudFront invalidation. TLS terminates at CloudFront using an ACM cert in `us-east-1`.

**Contact path.** The contact form POSTs JSON to an API Gateway HTTP API → Node 20 Lambda → SES `SendEmail`. This is the only non-static piece. Anti-spam for v1 is a hidden honeypot field + server-side validation (no captcha). Direct contact links (email `mailto:`, LinkedIn, GitHub) sit alongside the form so contact never depends on the Lambda being up.

**i18n.** English is the default locale; German (`de`) is a secondary locale via `next-intl`. Because the site is statically exported, locales use **sub-path routing** (`/en`, `/de`) with statically generated locale params (`generateStaticParams`) — **no runtime middleware** (middleware is incompatible with static export). Architecture must keep locale-adding cheap: all copy lives in message catalogs, never hard-coded in components.

**Motion.** Lenis drives smooth scroll; GSAP ScrollTrigger drives scroll-pinned sections and parallax; Framer Motion drives entrance/stagger transitions. All motion is gated behind `prefers-reduced-motion` and must hold 60fps. Motion is built in Claude Code after the design handoff — Claude Design defines the *look*, not the scroll mechanics.

**DNS.** Authoritative DNS stays at GoDaddy (not Route 53). The ACM cert is validated by a CNAME placed manually in GoDaddy. `www` is the canonical host (CNAME → CloudFront); the apex redirects to `www` via GoDaddy domain forwarding (GoDaddy has no apex ALIAS/ANAME).

```
                          GoDaddy DNS (authoritative)
                          ├── www  CNAME → CloudFront dist
                          ├── apex forward → https://www
                          └── _acme  CNAME → ACM validation
                                   │
                            (TLS via ACM us-east-1)
                                   │
   Browser ──────────────► CloudFront (OAC) ──► S3 private bucket  (static Next.js export, /en /de)
        │
        └── POST /contact ─► API Gateway (HTTP API) ─► Lambda (Node 20) ─► SES ─► inbox

   CI/CD:  push to main ─► GitHub Actions (OIDC → AWS role)
                            ├─ build: next build (output: export) → out/
                            ├─ aws s3 sync out/ → bucket
                            └─ cloudfront create-invalidation
```

---

## 4. Repository & scaffold commands

Run these once, in order, to stand up the repo skeleton. Inputs are always created before the command that consumes them.

```bash
# Step 1 — create the repo root.
# REQUIRES: git installed.
mkdir portfolio && cd portfolio
git init

# Step 2 — scaffold the Next.js app into /app (CREATES package.json + installs base deps).
# REQUIRES: Node 18+ installed.
npx create-next-app@latest app \
  --typescript --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --no-turbopack

# Step 3 — add extra dependencies AFTER the app exists.
# REQUIRES: step 2 done (app/package.json present).
(cd app && npm install \
  next-intl \
  framer-motion \
  gsap \
  lenis \
  @radix-ui/react-dialog \
  @radix-ui/react-navigation-menu \
  @radix-ui/react-tooltip \
  @radix-ui/react-slot \
  @radix-ui/react-visually-hidden \
  class-variance-authority clsx tailwind-merge)

# Step 4 — set static export. Claude Code edits app/next.config.* to add:
#   output: 'export'  +  images: { unoptimized: true }
# REQUIRES: step 2 (next.config exists). Hand the exact edit from the Web chat.

# Step 5 — author IaC source files BEFORE initialising Terraform.
# REQUIRES: nothing — Claude Code writes these from scratch under /infra.
#   infra/provider.tf  (aws provider eu-central-1 + aliased us-east-1 for ACM, terraform{} block, S3 backend)
#   infra/s3.tf  infra/cloudfront.tf  infra/acm.tf  infra/contact_lambda.tf  infra/apigw.tf  infra/iam_oidc.tf
#   infra/variables.tf  infra/outputs.tf  infra/terraform.tfvars

# Step 6 — author the contact Lambda source.
# REQUIRES: nothing — written from scratch.
#   lambda/contact/index.mjs  (validates body + honeypot → SES SendEmail)

# Step 7 — initialise/validate Terraform.
# REQUIRES: step 5 — at least provider.tf with terraform{} + provider block must exist.
terraform -chdir=infra init
terraform -chdir=infra validate

# Step 8 — save CLAUDE.md, .gitignore, this master file, and DESIGN_SYSTEM.md (once it exists)
#          to the repo root, then commit.
# REQUIRES: steps 1–7 produced the tree to ignore/commit.
git add . && git commit -m "chore: initial scaffold — master file, CLAUDE.md, .gitignore, Next.js app + Terraform skeleton"
```

### CLAUDE.md — save as `CLAUDE.md` at the repo root, commit in step 8

```markdown
# Khaled Portfolio — Claude Code instructions

## Before any work
1. Read KHALED_PORTFOLIO_MASTER.md in full if this is your first session here; otherwise read
   §2 (locked decisions), §7 (phase plan), §9 (tracker), §11 (open questions).
2. Identify the current phase = first unchecked item in §9. Do not work ahead of an
   unmet phase gate in §7.
3. Honor every locked decision in §2. They are binding. If a task conflicts with §2,
   stop and say so instead of improvising. Specifically: static export only (no SSR
   except the contact Lambda); no runtime middleware; all motion gated behind
   prefers-reduced-motion; third-party GitHub Actions pinned to a commit SHA; OIDC to
   AWS, never long-lived keys.
4. Check prerequisites before running anything. Never run a tool before the files it
   reads exist — author the source first, then run the command (write the .tf files,
   THEN `terraform init`; scaffold the app, THEN install extra deps).
5. Visual design is produced in Claude Design (web), not here. When the design handoff
   bundle is provided, implement it faithfully in /app and keep it consistent with
   DESIGN_SYSTEM.md. Define scroll mechanics (Lenis/GSAP/Framer) here, not in the design.

## While working
- Stay inside the paths owned by the role whose task you are executing (ownership in §6).
  Do not "fix" other layers' code in passing — log it in §11.
- Specs/plans handed from role chats win over your own preferences unless they violate §2.
- Performance is a hard requirement: Lighthouse >=90 in all categories, 60fps animations,
  prefers-reduced-motion respected. Treat a regression below this as a failing build.

## After any work — MANDATORY, never skip
1. Tick the completed task/phase checkbox(es) in §9 of KHALED_PORTFOLIO_MASTER.md.
2. Append one line to §10 (decision log) for any decision made: date, decision, "by CC", CONFIRMED.
3. Add any discovered blocker or open point to §11.
4. Commit the master file change together with the code change, message:
   "chore(master): update tracker — <what was done>".

## Conventions
- Branching: trunk-based — short-lived feature/**, fix/**, chore/** branches off main, merged fast.
- Commits: Conventional Commits (feat/fix/chore/ci/docs/refactor/perf).
- Never commit secrets. No app secrets exist client-side; the Lambda reads config from
  environment variables set by Terraform. Terraform state holds no plaintext secrets.
```

### .gitignore — save as `.gitignore` at the repo root, commit in step 8

```gitignore
# --- Node / Next.js (/app) ---
node_modules/
.next/
out/
.vercel/
*.tsbuildinfo
next-env.d.ts

# --- Env / local secrets ---
.env
.env.*
!.env.example

# --- Lambda build artifacts (/lambda) ---
lambda/**/node_modules/
lambda/**/*.zip

# --- Terraform (/infra) ---
.terraform/
*.tfstate
*.tfstate.*
crash.log
*.tfvars
!*.tfvars.example
override.tf
override.tf.json
*_override.tf
.terraform.lock.hcl

# --- OS / editor ---
.DS_Store
Thumbs.db
.idea/
.vscode/*
!.vscode/extensions.json
```

---

## 5. Claude Project setup

### 5a. Project description — paste verbatim into the Project's description field

```
Khaled Portfolio — a premium, Apple-grade personal portfolio and brand site that
proves senior software-engineering range (Flutter/mobile, frontend, backend,
DevOps/cloud) and drives recruiters and engineering leaders worldwide to make
contact. English-first, with German as a deliberate secondary locale for the
Berlin/Munich/Hamburg market. The repository itself — clean Terraform IaC and
OIDC-based GitHub Actions CI/CD — is part of the proof. Web-only: Next.js 14 static
export on AWS S3 + CloudFront, with a single contact-form Lambda (API Gateway + SES).
Design is generated in Claude Design and handed to Claude Code to build. This Project
is the planning brain; the repo's KHALED_PORTFOLIO_MASTER.md is the single source of
truth.
```

### 5b. Project instructions — paste verbatim into the Project's custom instructions

```
This Project plans and specs the Khaled Portfolio site (monorepo "portfolio").

SOURCE OF TRUTH: KHALED_PORTFOLIO_MASTER.md at the repo root. Every chat reads it
first and the human updates it last. If a decision is not in that file, it has not
been made — do not invent one; propose it for §10.

SURFACES (never confuse them):
- Claude Project chats (here): the Conductor + the role planning chats. They reason,
  plan, and write specs and prompts — including the design brief. They CANNOT touch
  files, run commands, or generate visual design.
- Claude Design (web, claude.ai/design): where the per-project design system and the
  web screens are made, then exported as a handoff bundle. Human-driven, own quota,
  one-directional to code — lock the design before coding it.
- Claude Code: executes against the repo — writes files, runs commands, commits,
  updates §9/§10. Turns the design bundle into the real Next.js /app, and builds the
  scroll/motion mechanics.

ROLES & OWNERSHIP:
- Conductor — walks the human one step at a time; never writes code.
- UI/UX — writes the design brief for Claude Design; after handoff owns
  DESIGN_SYSTEM.md and guards visual consistency. Touches no code.
- Web — owns /app (Next.js, i18n, motion, contact-form client). Builds from the
  design bundle in Claude Code.
- DevOps — owns /infra (Terraform), /lambda (contact handler), /.github/workflows
  (OIDC CI/CD), DNS/ACM wiring. Builds in Claude Code.

BINDING CONSTRAINTS (§2): static export only (no SSR except the contact Lambda);
no runtime middleware; locale routing via static sub-paths; Lighthouse >=90 all
categories; 60fps motion; prefers-reduced-motion honored; OIDC to AWS (no long-lived
keys); SHA-pinned actions; DNS at GoDaddy with a manual ACM CNAME; Apple-grade visual
bar, lock the design early.

HANDOFF: chats produce specs/plans; the human carries them to Claude Code to execute,
commit, and update §9/§10. Chat memory is not state — only the committed master file is.
```

---

## 6. Chats and sessions

### 6a. CONDUCTOR — Claude Project chat — create this FIRST

```
You are the CONDUCTOR for the Khaled Portfolio project. You do not write code
or specs. Your only job is to walk me through the project one step at a time,
in the right order, and generate the exact prompt I should use at each step.

System you operate over:
- Master file: KHALED_PORTFOLIO_MASTER.md at the repo root — the single source of
  truth. §7 = phase plan with per-phase steps, §9 = tracker, §10 = decision
  log, §11 = open questions.
- Three kinds of surface (this matters — name the surface every time):
    * Claude Project chats — the role planning chats (UI/UX, Web, DevOps). They
      reason and write specs, including the design brief. They CANNOT touch
      files, run commands, or generate visual design.
    * Claude Code sessions — execute against the repo: write files, run
      commands, commit, update §9/§10. They turn the design handoff bundle
      into the real Next.js code in /app and build the scroll/motion mechanics.
    * Claude Design (web, claude.ai/design) — a separate human-driven surface
      with its own quota. Where the design system and the web screens are made,
      then exported as a handoff bundle. Web-only; one-directional to code, so
      lock the design before coding it.
- Me (Khaled): the orchestrator. I shuttle prompts and results between the
  surfaces. I can only be in one place at a time, so give me ONE step per turn.

Protocol, every turn. I give you current state — the §9 tracker, the whole
master file, or "done: <what happened>". You answer in EXACTLY this shape:

  CURRENT: <phase + step we are on, one line>
  REQUIRES: <what must already be true/exist before this step runs. If a
  prerequisite is missing, the step becomes "produce that prerequisite" — do
  not proceed past a missing requirement.>
  NEXT: <the single next action, one sentence>
  SURFACE: <UI/UX chat | Web chat | DevOps chat | Claude Code | Claude Design (web) | a manual action by me>
  PROMPT: <the complete, self-contained, paste-ready prompt for that surface.
  Include all context it needs — it may have an empty session. If SURFACE is a
  manual action (set up the design system in Claude Design, place the ACM CNAME
  in GoDaddy), give exact click-level steps instead of a prompt.>
  AFTER: <what to report back to me, and what to tick in §9 or log in §10>

Rules:
- Never give more than one step per turn.
- Never skip a phase gate in §7. If the entry gate is unmet, the next step is
  meeting it.
- Route visual-design steps (design system, screens) to Claude Design (web),
  never to a chat or Claude Code. Route handoff-bundle implementation to Claude Code.
- Check prerequisites before emitting a step. Do not tell me to run a command
  before the files it consumes exist (never "terraform init" before the .tf
  files are written; never install extra deps before create-next-app runs).
- Infra (DevOps) and design can run in parallel — they share no prerequisite.
  The web build needs BOTH the design handoff bundle AND the contact API
  endpoint URL before it is complete.
- If my report reveals a decision, remind me to append it to §10. If it reveals
  a blocker, park it in §11 and route around it only if the dependency graph allows.
- If state is ambiguous or I seem lost, ask me to paste the current §9 before
  giving a next step.

Start now: here is my current state.
{{PASTE TRACKER OR MASTER FILE OR "fresh start"}}
```

### 6b. Design — Claude Design (web, claude.ai/design)

This is a sequence of manual steps the human performs at claude.ai/design. The Conductor walks them one at a time. Generate a FRESH design system for this project — do not reuse a published system from another project.

```
DESIGN — performed by you (the human) in Claude Design at claude.ai/design.
Requires a Claude Pro, Max, Team, or Enterprise plan. This surface has its own
usage quota, and the design->code handoff is one-directional, so lock the design
early rather than over-iterating.

=== PHASE A — Onboarding + per-project design system ===
REQUIRES: §2 locked + the UI/UX design brief in hand.

1. Open claude.ai/design in a browser and sign in with your Claude account.
2. In the role question during onboarding, choose "Design".
3. Start the Design System setup. Pick how to seed it:
   - No brand assets yet (new look): in the chat, WRITE a brand description such
     as "premium and intentional, Apple-grade polish — confident, restrained,
     generous whitespace, a near-monochrome base with one disciplined accent,
     editorial type, motion-friendly layouts; must read as a senior engineer's
     site, never templated." Let Claude generate the system.
   - You have assets (a wordmark, accent color, a reference screenshot of an
     Apple-grade site you admire): click the upload control and ADD them. A real
     reference screenshot teaches the system more than a palette alone — add one.
4. WAIT while Claude extracts the system (colors, typography, spacing, components).
5. Validate the system: in the chat, WRITE a generic test prompt like "design a
   portfolio hero with a headline, subhead, and one primary contact CTA" and look
   at the canvas on the right.
6. If it looks off, fix the SYSTEM (not the screen): WRITE a remix instruction such
   as "tighten the type scale", "reduce the accent saturation", or "increase
   whitespace and lighten the borders". Repeat until on-brand, then STOP and treat
   the system as locked. Resist over-iterating.
7. Per-project rule: do NOT switch on the "Published" toggle in the design-system
   settings. Publishing makes EVERY future project reuse this system — keep this
   brand scoped to Khaled Portfolio only. Leave it off.

=== PHASE B — Generate the screens ===
REQUIRES: phase A system locked.

8. Start a new generation. For the starting mode, CHOOSE "Prototype".
9. For fidelity, CHOOSE "High-fidelity mockup" (not rough wireframe).
10. In the prompt field, WRITE the full brief the UI/UX chat produced. It must
    cover: the screens/sections to build (hero + contact CTA, work/projects grid,
    selected project detail, open-source + publication, range/skills across
    mobile-frontend-backend-devops, about, footer with direct contact links);
    audience (recruiters and engineering leaders, international, German secondary);
    tone (Apple-grade, confident, understated); and constraints (responsive
    desktop + mobile breakpoints, light AND dark, designed so EN/DE copy lengths
    both fit).
11. ANSWER the clarifying questions Claude asks before it generates — they sharpen
    the output; do not skip them.
12. When the screens render on the canvas, refine: CLICK an element and WRITE an
    inline comment like "increase this heading size"; DRAG the sliders for
    spacing/color; or WRITE chat instructions. Lock before heavy iteration.
13. (Web-only project — there are no mobile-app screens to generate. Responsive
    mobile-web layouts are part of the web screens above.)

=== PHASE C — Hand off to Claude Code ===
REQUIRES: screens locked.

14. With the screens locked, use the "Hand off to Claude Code" / export option to
    export the handoff bundle.
15. Open a Claude Code session in the repo and give it the bundle with one
    instruction: build the web UI in /app from this design (Next.js 14, static
    export, Tailwind, Radix). Scroll/motion mechanics are added in code, not here.
16. In that same Claude Code session, WRITE and commit DESIGN_SYSTEM.md at the repo
    root: a summary of the system (palette incl. light + dark, type scale, spacing,
    key components) and where the bundle lives. This is the shared source of truth
    the /app implementation reads.

Done when: the design system + screens exist in Claude Design, the handoff bundle
is exported, /app is built from it, and DESIGN_SYSTEM.md is committed.
```

### 6c. UI/UX — Claude Project chat

```
You are the UI/UX role for the Khaled Portfolio project.
SURFACE: Claude Project planning chat. You do NOT generate visual design (that
happens in Claude Design, §6b) and you do NOT write code (that happens in Claude
Code). You write the design brief and you guard consistency.

FIRST, every session: read KHALED_PORTFOLIO_MASTER.md §1–3, §7 (Design phases), §8
(handoff), and DESIGN_SYSTEM.md once it exists. Current state is in §9.

You own: (1) the design brief the human pastes into Claude Design — a clear
description of Khaled Portfolio's brand, its international-recruiter/eng-leader
audience, and the exact web sections/screens to generate; (2) after handoff,
DESIGN_SYSTEM.md as the shared source of truth; (3) checking that the /app
implementation stays faithful to that system.

You do NOT touch: /app, /infra, /lambda, /.github code. Implementation is the Web
and DevOps roles in Claude Code.

Locked constraints you must honor (§2): Apple-grade, premium, intentional — never
templated or AI-looking; lock the system early. Responsive desktop + mobile-web;
light AND dark; layouts must accommodate BOTH English and German copy lengths
(German runs longer — design for it). Motion-friendly composition (the scroll
reveals, pinned sections, and parallax are built later in code) — leave room for it,
do not specify the mechanics. Accessibility: legible contrast in both themes, a
visible contact CTA above the fold.

Deliverables, in order:
1. Design brief for Claude Design — brand identity + the exact web sections to
   generate (hero with primary "get in touch" CTA; selected-work/projects grid;
   project detail; open-source + Springer publication; range across
   mobile/frontend/backend/devops; about; footer with direct contact links —
   email, LinkedIn, GitHub). REQUIRES: §2 locked. Hand this to the human to run in
   Claude Design (§6b).
2. DESIGN_SYSTEM.md review — once the human has the handoff bundle, confirm the
   recorded system (palette incl. dark mode, type scale, spacing, components)
   matches the brief. REQUIRES: §6b handoff done.
3. Consistency check — after the web build, verify /app matches DESIGN_SYSTEM.md in
   both themes and both locales; log drift in §11. REQUIRES: web build underway.

Handoff: the brief goes to the human (for Claude Design); the system record and
consistency notes go to the Web role via the Conductor.

Done when: the design brief is delivered, DESIGN_SYSTEM.md is confirmed accurate,
and the /app implementation is confirmed consistent with it in light/dark and EN/DE.
```

### 6d. Web — Claude Project chat

```
You are the WEB role for the Khaled Portfolio project.
SURFACE: Claude Project planning chat. You write specs and plans here; actual file
writes, builds, and commits happen in Claude Code, which you hand to per §8.

FIRST, every session: read KHALED_PORTFOLIO_MASTER.md §1–4, §7 (your phase), §8,
and DESIGN_SYSTEM.md once it exists. Current state is in §9.

You own: the Next.js 14 application in /app — App Router structure, static export
config, TypeScript, Tailwind + Radix UI components, next-intl locale routing (EN
default, DE secondary), the scroll/motion layer (Lenis + GSAP ScrollTrigger +
Framer Motion), and the contact-form client that POSTs to the contact API.

You do NOT touch: /infra, /lambda, /.github. If you need the contact API endpoint
URL, the S3/CloudFront names, or an env value, request it from DevOps and record the
agreed contract in §10 — do not edit their files.

Locked constraints you must honor (§2): static export only (output: 'export',
images.unoptimized = true) — no SSR, no server components that need a runtime, no
runtime middleware. Locale routing is static sub-paths (/en, /de) via
generateStaticParams; all copy in next-intl message catalogs, never hard-coded.
Build from the Claude Design handoff bundle and keep /app faithful to
DESIGN_SYSTEM.md. Performance is a gate: Lighthouse >=90 in ALL categories, 60fps
animations, and every motion effect disabled/short-circuited under
prefers-reduced-motion. The contact endpoint URL is the only runtime config and is
injected at build time as a public env var (NEXT_PUBLIC_CONTACT_API_URL).

Deliverables, in order:
1. App-structure + i18n plan: route tree under app/[locale], next.config export
   settings, next-intl wiring with generateStaticParams, message-catalog layout
   (en.json/de.json), and the contact-form client contract (request shape, the
   honeypot field, success/error states). REQUIRES: §2 locked. (Can start before
   the design bundle — structure does not depend on visuals.)
2. UI implementation plan from the handoff bundle: map the Claude Design screens to
   components (Radix primitives + Tailwind), in both light and dark, EN and DE.
   REQUIRES: design handoff bundle exists (§6b/phase 3) + DESIGN_SYSTEM.md committed.
3. Motion plan: Lenis smooth-scroll setup, GSAP ScrollTrigger pinned sections +
   parallax, Framer Motion staggered entrances — each with its prefers-reduced-motion
   fallback and a 60fps budget note. REQUIRES: deliverable 2 underway.
4. Contact-form wiring: point the client at NEXT_PUBLIC_CONTACT_API_URL, handle
   loading/success/error, keep the direct mailto/LinkedIn/GitHub links as a fallback.
   REQUIRES: DevOps has published the contact API URL in §10.

Handoff: produce the plan/spec here, then hand to Claude Code per §8 — Claude Code
edits next.config, writes the components/motion/i18n code, runs `next build`,
verifies the static export and Lighthouse locally, commits, and updates §9/§10.

Done when: /app builds a clean static export, renders all sections in light/dark and
EN/DE faithful to DESIGN_SYSTEM.md, hits Lighthouse >=90 in all categories with 60fps
motion that respects prefers-reduced-motion, and the contact form submits successfully
against the live API.
```

### 6e. DevOps — Claude Project chat

```
You are the DevOps/Infrastructure role for the Khaled Portfolio project.
SURFACE: this is a Claude Project planning chat. You write specs and plans here;
actual file writes and commands happen in Claude Code, which you hand to per §8.

FIRST, every session: read KHALED_PORTFOLIO_MASTER.md §1–4 (identity, decisions,
architecture, scaffold), §7 (your phase), and §8 (handoff). Current state is in §9.

You own: all AWS infrastructure as Terraform (/infra), the contact-form Lambda
source (/lambda), the GitHub Actions CI/CD pipeline (/.github/workflows), DNS/ACM
wiring, and deploy mechanics. The repo's IaC and OIDC pipeline are an intentional
part of the portfolio's proof — keep them clean and exemplary.

You do NOT touch: application code in /app, design tokens, or content. If the Web
role needs the contact API URL, the CloudFront/S3 names, or an env var, publish the
contract in the decision log (§10) — do not edit their code.

Locked constraints you must honor (§2): static site on S3 (private) + CloudFront
(OAC, bucket never public); ACM cert in us-east-1 for CloudFront, S3/Lambda/SES in
eu-central-1; DNS stays at GoDaddy (not Route 53); ACM validated via a CNAME placed
MANUALLY in GoDaddy; www is canonical, apex redirects to www via GoDaddy forwarding;
OIDC to AWS with a least-privilege role (no long-lived keys); ALL third-party GitHub
Actions pinned to a commit SHA; prod only.

Deliverables, in order (each names what it needs first):
1. Terraform source in /infra (provider + aliased us-east-1 provider for ACM; S3
   private bucket; CloudFront + OAC; ACM cert with DNS validation outputs; contact
   Lambda + API Gateway HTTP API + SES identity + IAM; GitHub OIDC provider +
   least-privilege deploy role; variables/outputs/tfvars). REQUIRES: nothing — authored
   from scratch.
2. Contact Lambda handler in /lambda/contact (Node 20, validates body + rejects on
   honeypot, calls SES SendEmail, returns CORS headers for the CloudFront origin).
   REQUIRES: nothing — authored from scratch.
3. terraform init/validate. REQUIRES: the .tf files from step 1 to exist.
4. GitHub Actions deploy workflow in /.github/workflows/deploy.yml — OIDC assume-role,
   build the Next.js static export, `aws s3 sync out/` to the bucket, CloudFront
   invalidation; all third-party actions SHA-pinned. REQUIRES: the S3 bucket +
   CloudFront distribution IDs to be known (from step 1's apply outputs).
5. Publish to §10 for the Web role: the contact API invoke URL (as
   NEXT_PUBLIC_CONTACT_API_URL) and the CloudFront domain. REQUIRES: step 3 applied.
6. Document the manual GoDaddy steps in §10: the ACM validation CNAME, the www CNAME
   to CloudFront, and the apex->www forwarding. REQUIRES: ACM/CloudFront resources planned.

Handoff: produce the Terraform/Lambda/workflow plan here, then hand execution to
Claude Code per §8 — Claude Code writes the files, runs the commands, commits, and
updates §9/§10. AWS account creation, the SES sender verification, and the GoDaddy DNS
records are manual actions only you (the human) can perform; flag each as such.

Done when: terraform applies clean to prod, ACM is validated and CloudFront serves the
site over HTTPS on the custom domain, a push to main deploys the current /app static
export to CloudFront, the contact form delivers mail via SES, and §9 is updated.
```

---

## 7. Phase plan

| # | Phase | Owner / surface | Entry gate (REQUIRES) | Done criteria |
|---|---|---|---|---|
| 1 | Spec lock | all / — | description exists | §2 fully populated, no ASSUMED blockers |
| 2 | Design system | Design / Claude Design web | spec locked, brief written | per-project UI kit generated + validated + locked in Claude Design |
| 3 | Design screens + handoff | Design / Claude Design web | phase 2 done | core web screens (light/dark, EN/DE-aware) generated; handoff bundle exported; DESIGN_SYSTEM.md committed |
| 4 | Infra skeleton | DevOps / chat → Claude Code | spec locked | IaC files written → init/validate clean → applied; OIDC CI/CD wired; contact API URL published in §10 |
| 5 | Web build | Web / chat → Claude Code | phase 3 done + (4 for contact URL) | Claude Code builds /app static export from the bundle; all sections in light/dark + EN/DE; matches DESIGN_SYSTEM.md; motion layer in place |
| 6 | Integration | all | phases 4 & 5 in progress | site deploys via CI to CloudFront; contact form delivers mail end-to-end; DNS/ACM live on custom domain |
| 7 | Hardening | DevOps + Web | integration green | Lighthouse >=90 all categories; 60fps + prefers-reduced-motion verified; least-privilege IAM + SHA-pin audit done |
| 8 | Launch | DevOps / Claude Code | hardening done | prod live on custom domain; final invalidation; tracker closed |

Phases 2–3 (design) and phase 4 (infra) share no prerequisite and run in parallel.

### Per-phase steps

**Phase 1 — Spec lock**
1. REQUIRES: this file exists. SURFACE: manual by you. Review §2 + the ASSUMED rows in §10 (region, domain, www-canonical, anti-spam). Confirm or change each; tick §9.

**Phase 2 — Design system**
1. REQUIRES: §2 locked. SURFACE: UI/UX chat. Produce the design brief (brand identity + the exact web sections to generate). Hand it to the human.
2. REQUIRES: step 1 brief. SURFACE: Claude Design (web, claude.ai/design). Create a NEW project, set up a FRESH per-project system from the brief, generate the UI kit, validate on one test screen, lock it. Leave "Published" OFF. Tick §9. Report to Conductor.

**Phase 3 — Design screens + handoff**
1. REQUIRES: phase 2 system locked. SURFACE: Claude Design (web). Generate the core web screens from the system (light + dark; designed for EN and DE copy lengths).
2. REQUIRES: step 1, screens locked. SURFACE: Claude Design (web). Export the handoff bundle ("hand off to Claude Code").
3. REQUIRES: handoff bundle exists. SURFACE: Claude Code. Write + commit DESIGN_SYSTEM.md (system summary + bundle location). Tick §9. Report to Conductor.

**Phase 4 — Infra skeleton** (note: init does NOT come first)
1. REQUIRES: §2 locked. SURFACE: manual by you. Create/confirm the AWS account; in eu-central-1 SES, start verification of the sender + (sandbox) recipient identities. Note: SES starts in sandbox — for v1 a verified recipient is enough; log production-access request in §11 if needed.
2. REQUIRES: §2 locked. SURFACE: DevOps chat. Produce the Terraform source plan (provider + S3 + CloudFront/OAC + ACM + contact Lambda + API Gateway + SES + OIDC role) and the Lambda handler plan.
3. REQUIRES: step 2 spec. SURFACE: Claude Code. Write the .tf files into /infra and the handler into /lambda/contact. (Now the files exist.)
4. REQUIRES: step 3 — .tf files present. SURFACE: Claude Code. Run `terraform -chdir=infra init` then `validate`. Fix errors back in the DevOps chat if any.
5. REQUIRES: step 4 clean + AWS creds available locally for the first apply. SURFACE: Claude Code. `terraform -chdir=infra apply`. Capture outputs (bucket, CloudFront dist ID + domain, contact API URL, ACM validation CNAME).
6. REQUIRES: step 5 outputs. SURFACE: manual by you (GoDaddy). Place the ACM validation CNAME; once issued, add the www CNAME → CloudFront and set apex→www forwarding. Log the records in §10.
7. REQUIRES: step 5 outputs (bucket + dist ID). SURFACE: DevOps chat → Claude Code. Write /.github/workflows/deploy.yml — OIDC assume-role, next build (export), s3 sync, CloudFront invalidation; confirm every third-party action is SHA-pinned. Publish the contact API URL to §10 for Web. Tick §9.

**Phase 5 — Web build**
1. REQUIRES: §2 locked. SURFACE: Web chat → Claude Code. Set next.config (output:'export', images.unoptimized), build the app/[locale] route tree, wire next-intl with generateStaticParams + en.json/de.json catalogs.
2. REQUIRES: phase 3 bundle + DESIGN_SYSTEM.md. SURFACE: Web chat → Claude Code. Implement the screens as Radix + Tailwind components in light/dark, faithful to DESIGN_SYSTEM.md.
3. REQUIRES: step 2. SURFACE: Web chat → Claude Code. Add the motion layer (Lenis + GSAP ScrollTrigger + Framer Motion) with prefers-reduced-motion fallbacks; keep 60fps.
4. REQUIRES: phase 4 step 7 (contact API URL in §10). SURFACE: Web chat → Claude Code. Wire the contact form to NEXT_PUBLIC_CONTACT_API_URL with success/error states; keep direct mailto/LinkedIn/GitHub links. Tick §9.

**Phase 6 — Integration**
1. REQUIRES: phases 4 & 5 builds exist. SURFACE: Claude Code. Push to main; confirm the OIDC workflow deploys the export to S3 and invalidates CloudFront; site loads on the CloudFront domain, then the custom domain once DNS/ACM are live.
2. REQUIRES: step 1. SURFACE: manual by you + Claude Code. Submit the live contact form; confirm mail arrives via SES; verify EN/DE routes and light/dark. Log issues in §11.

**Phase 7 — Hardening**
1. REQUIRES: phase 6 green. SURFACE: Claude Code. Run Lighthouse on the deployed site; fix until >=90 in all four categories. Verify 60fps on the pinned/parallax sections and that prefers-reduced-motion disables motion.
2. REQUIRES: step 1. SURFACE: DevOps chat → Claude Code. Audit: IAM deploy role is least-privilege, S3 bucket is private (OAC only), every action is SHA-pinned, no secrets in state or repo. Tick §9.

**Phase 8 — Launch**
1. REQUIRES: phase 7 done. SURFACE: Claude Code. Final deploy + CloudFront invalidation; confirm prod live on the custom domain over HTTPS. Close the tracker; final §10 entry.

---

## 8. Chat ↔ Claude Code handoff protocol

Handoffs are file-based, never direct. No surface assumes another's state.

1. A planning chat produces a **spec, plan, or code block** here.
2. The human hands it to **Claude Code** with: execute this, commit, update §9/§10.
3. Claude Code executes against the repo, commits, and (per CLAUDE.md) updates §9 and §10.
4. The human reports "done: <what happened>" back to the Conductor.
5. The Conductor gives the next step.

Rule: if it isn't committed and isn't in this file, it didn't happen. Chat memory is not state.

---

## 9. Progress tracker

**Phase 1 — Spec lock**
- [x] Review + confirm/replace the four ASSUMED rows in §10 (AWS region, domain, www-canonical, anti-spam)
- [x] §2 confirmed with no blocking assumptions

**Phase 2 — Design system**
- [x] UI/UX design brief written and handed off
- [x] Per-project design system generated, validated, and locked in Claude Design ("Published" left OFF)

**Phase 3 — Design screens + handoff**
- [x] Core web screens generated (light/dark, EN/DE-aware)
- [x] Handoff bundle exported to Claude Code
- [x] DESIGN_SYSTEM.md written + committed

**Phase 4 — Infra skeleton**
- [x] AWS account ready; SES sender identity verified
- [x] Terraform source + Lambda handler plan produced (DevOps chat)
- [x] /infra .tf files + /lambda/contact handler written (Claude Code)
- [x] terraform init + validate clean
- [x] terraform apply; outputs captured
- [x] GoDaddy: ACM CNAME placed, cert issued, www CNAME + apex→www set (logged in §10)
- [x] deploy.yml written, actions SHA-pinned; contact API URL published in §10

**Phase 5 — Web build**
- [x] next.config export + app/[locale] tree + next-intl (en/de) wired
- [x] Screens implemented from bundle (light/dark), faithful to DESIGN_SYSTEM.md
- [x] Motion layer (Lenis/GSAP/Framer) with prefers-reduced-motion fallbacks
- [x] Contact form wired to NEXT_PUBLIC_CONTACT_API_URL + direct links present (UI only; endpoint pending DevOps §10)

**Phase 6 — Integration**
- [x] CI deploys export to CloudFront on push to main
- [x] Custom domain live over HTTPS; EN/DE + light/dark verified
- [x] Contact form delivers mail end-to-end via SES

**Phase 7 — Hardening**
- [x] Lighthouse >=90 in all categories
- [x] 60fps motion + prefers-reduced-motion verified
- [x] Security audit: least-privilege IAM, private S3/OAC, SHA-pin, no secrets

**Phase 8 — Launch**
- [x] Prod live on custom domain; final invalidation; tracker closed

---

## 10. Decision log (append-only)

| Date | Decision | By | Status |
|---|---|---|---|
| 2026-06-14 | Layers: web, devops, ui/ux. No mobile, no general backend. | Khaled | CONFIRMED |
| 2026-06-14 | Web: Next.js 14 static export, TS, Tailwind, Radix UI, Framer Motion + GSAP ScrollTrigger + Lenis. | Khaled | CONFIRMED |
| 2026-06-14 | Infra: S3 + CloudFront (OAC) + ACM + API Gateway + Lambda + SES; Terraform; GitHub Actions OIDC, SHA-pinned. | Khaled | CONFIRMED |
| 2026-06-14 | Monorepo `portfolio`; prod only; trunk-based; Conventional Commits. | Khaled | CONFIRMED |
| 2026-06-14 | Design system open — generated per-project in Claude Design, handed to Claude Code. Apple-grade bar, lock early. | Khaled | CONFIRMED |
| 2026-06-14 | i18n: EN default + DE secondary via next-intl, static sub-path routing (/en,/de), generateStaticParams, no middleware. | Khaled | CONFIRMED |
| 2026-06-14 | DNS stays at GoDaddy; ACM validated via manual CNAME. | Khaled | CONFIRMED |
| 2026-06-14 | AWS region eu-central-1 (Frankfurt) for S3/Lambda/SES; ACM in us-east-1 for CloudFront. | CC bootstrap | ASSUMED |
| 2026-06-14 | Custom domain not yet chosen — placeholder until confirmed. | CC bootstrap | ASSUMED |
| 2026-06-14 | www is canonical (CNAME → CloudFront); apex redirects to www via GoDaddy forwarding (GoDaddy has no apex ALIAS). | CC bootstrap | ASSUMED |
| 2026-06-14 | Contact-form anti-spam for v1 = hidden honeypot + server-side validation, no captcha. | CC bootstrap | ASSUMED |
| 2026-06-16 | Implemented the Claude Design handoff bundle into /app: Next.js App Router static export, locale routing via [locale] (/en default, /de) using next-intl + generateStaticParams, NO middleware. Theme = client state (data-theme + localStorage, pre-paint script, useSyncExternalStore); locale = route. DS tokens + primitives + all 7 sections + TMMS case study built; DESIGN_SYSTEM.md committed. Build + lint clean; static export verified (en/de + case routes, dark/light). | CC | CONFIRMED |
| 2026-06-16 | Scaffold installed Next.js 16.2.9 + React 19 + Tailwind v4 (create-next-app@latest), NOT Next.js 14 as §2 states. Built on the installed toolchain; binding architecture (App Router, static export, no middleware) is unchanged. §2 row should be reconciled — see §11. | CC | CONFIRMED |
| 2026-06-16 | next.config `trailingSlash: true` so the static export emits directory-style routes (out/en/index.html), matching the CloudFront `default_root_object = "en/index.html"` with no rewrite function. | CC | CONFIRMED |
| 2026-06-16 | Accent locked to burnt orange (#F2552C dark / #DC4419 light). The prototype's blue/green/brass were preview-only and were not carried into code. | CC | CONFIRMED |
| 2026-06-16 | Added a static root route (`app/page.tsx`) that client-side detects the browser language (German locales → /de, else → /en; no-JS → /en). Required restructuring layouts: root `app/layout.tsx` now owns `<html>/<body>`/fonts/theme; `[locale]/layout.tsx` is nested and corrects `<html lang>` per locale. Nav/Hero/Footer section links use pure `#hash` on the home page (smooth in-place scroll, no jump-to-top) and `/{locale}#hash` from sub-pages. | CC | CONFIRMED |
| 2026-06-16 | AWS region eu-central-1 for S3/Lambda/SES; ACM us-east-1 for CloudFront. Supersedes 2026-06-14 ASSUMED. | Khaled | CONFIRMED |
| 2026-06-16 | Production domain = khaledhossameldin.com. www.khaledhossameldin.com canonical; apex forwards to www. Supersedes 2026-06-14 placeholder. | Khaled | CONFIRMED |
| 2026-06-16 | www canonical (CNAME → CloudFront); apex → www via GoDaddy forwarding (no apex ALIAS). Supersedes 2026-06-14 ASSUMED. | Khaled | CONFIRMED |
| 2026-06-16 | Contact anti-spam v1 = honeypot + server-side validation, no captcha. Supersedes 2026-06-14 ASSUMED. | Khaled | CONFIRMED |
| 2026-06-16 | Phase 4 infra authored in /infra (provider, s3, cloudfront, acm, contact_lambda, apigw, iam_oidc, variables, outputs, tfvars.example) + /lambda/contact/index.mjs (SESv2, `company` honeypot). ACM cert + CloudFront alias scoped to www.khaledhossameldin.com ONLY; apex is GoDaddy forwarding, NOT a CloudFront alias. Two-phase apply gated on `enable_custom_domain` (first apply false → default CF cert, cert pending; place validation CNAME at GoDaddy; after ISSUED, second apply true → www alias + ACM). CloudFront `default_root_object=index.html` + a viewer-request CloudFront Function append `index.html` for directory routes — this RESOLVES the prior §11 DevOps note. OIDC deploy role scoped to `repo:<github_repo>:ref:refs/heads/main`, least-privilege S3+invalidation. `terraform init -backend=false` + `validate` clean (backend init/apply need AWS creds + state bucket, not run). One spec fix: SSE `rule` block expanded to multi-line (single-line nested block is invalid HCL); semantics identical. | CC | CONFIRMED |

| 2026-06-16 | deploy.yml authored (.github/workflows) — trigger push to main; permissions id-token write + contents read; concurrency deploy-prod cancel-in-progress; steps: checkout → setup Node 20 (npm cache) → npm ci in /app → next build static export (app/out) → OIDC assume-role → `aws s3 sync app/out s3://$bucket --delete` → CloudFront invalidation `/*`. Region eu-central-1. Config entirely via repo Variables (AWS_DEPLOY_ROLE_ARN, S3_BUCKET, CF_DIST_ID, CONTACT_API_URL); build reads NEXT_PUBLIC_CONTACT_API_URL from vars.CONTACT_API_URL; nothing hardcoded. All third-party actions SHA-pinned (§2): actions/checkout v4.3.1 = 34e114876b0b11c390a56381ad16ebd13914f8d5; actions/setup-node v4.4.0 = 49933ea5288caeca8642d1e84afbd3f7d6820020; aws-actions/configure-aws-credentials v4.3.1 = 7474bc4690e29a8392af63c5b98e7449536d5c3a. Workflow not run — human triggers first deploy. | CC | CONFIRMED |

| 2026-06-17 | apex khaledhossameldin.com → www via GoDaddy 301 domain forwarding (forward-only, no masking). Required first disconnecting a stale GoDaddy Websites+Marketing site that was attached to the apex and overriding the forward. Zoho email (MX + SPF/verification TXT on @) untouched. Known residual: typing https://+bare-apex directly has no valid TLS cert (GoDaddy forwarding limitation) — accepted for v1. Route 53 apex-ALIAS (proper apex TLS) consciously deferred as over-scoped for a portfolio; reserved for higher-stakes upcoming projects. | Khaled | CONFIRMED |

| 2026-06-17 | Phase 4 infra complete + verified in prod: ACM cert issued, www alias on CloudFront, site live over HTTPS; CloudFront default_root_object + directory-index rewrite function confirmed working (/en/, /de/, /en/work/tmms/ all load); OIDC deploy.yml ran first deploy. apex khaledhossameldin.com → www via GoDaddy 301 domain forwarding (forward-only, no masking), after disconnecting a stale GoDaddy Websites+Marketing site that was overriding the forward. Zoho email (MX + SPF/verification TXT on @) untouched. Known residual: https://+bare-apex has no valid TLS cert (GoDaddy forwarding limitation) — accepted for v1; Route 53 apex-ALIAS deferred as over-scoped for a portfolio. | Khaled | CONFIRMED |

| 2026-06-18 | Phase 5 motion layer built in /app: Lenis smooth scroll + GSAP ScrollTrigger (subtle type parallax on hero spec panel & case metric numbers; pinned TMMS case header) + Framer Motion entrance reveals (sections + work-card stagger). All gated behind a single `useReducedMotion` (useSyncExternalStore on matchMedia, SSR snapshot false, reactive to live toggle): reduced → no Lenis (native scroll), no GSAP tweens, Framer renders final state. Static-export safe: motion is 'use client', gsap+lenis dynamic-imported inside effects (off main bundle; verified separate chunks), nothing at module eval; `ssr:false` avoided (forbidden in Next 16 server components). SmoothScrollProvider mounted in root layout, uses plain `next/navigation` usePathname (the not-found page has no locale context) to refresh ScrollTrigger on route change; refresh also on fonts.ready + resize; full teardown for React 19 strict double-mount. Hash nav routed through scrollToHash (lenis.scrollTo when live, else scrollIntoView; landing hash after fonts+double-rAF) preserving the home #hash / subpage /{locale}#hash split. Server emits final-state DOM (0 baked opacity:0 → no FOUC for no-JS/reduced). next build + lint clean. Verified in preview: Lenis active, nav smooth-scroll in place, case pin (header position:fixed + pin-spacer), no console errors. Decisions: subtle type parallax, keep pin, keep hero CSS entrance (Framer elsewhere). | CC | CONFIRMED |

| 2026-06-18 | Code-review hardening on the motion-layer branch (caveman-review rounds). (1) Contact-form honeypot field name fixed end-to-end: form sent `_hp` while the Lambda checked `data.company` — the two never matched, so the server trap was inert. Renamed both sides to `hp_token` (Contact.tsx + lambda/contact/index.mjs) — deliberately NOT a real field name (company/email/etc.) so browser autofill can't populate it and silently drop a legit submission; honeypot input also set `autoComplete="new-password"` (Chrome ignores `autocomplete="off"` for known fields). NOTE: the Lambda is deployed by Terraform, not deploy.yml, so this rename needs a `terraform apply` to reach prod — tracked in §11 (no current drift; contact endpoint not yet wired). (2) `useReducedMotion` caches one MediaQueryList instead of allocating per render (mirrors useMediaQuery). (3) Button resets `transform` on mouseleave (stuck press-scale when pointer leaves while pressed). (4) Card `onClick` branch made keyboard-operable: role=button, tabIndex, Enter/Space, visible focus ring. Anti-spam decision (honeypot + server validation, no captcha) unchanged — only the field name. Lint + build clean. | CC | CONFIRMED |

| 2026-06-20 | **Contact path is production-real; contract published for the Web role.** Live invoke URL (API Gateway HTTP API, POST /contact): `https://xd0zeupppd.execute-api.eu-central-1.amazonaws.com/contact` — this is the value the Web build must set for `NEXT_PUBLIC_CONTACT_API_URL` (injected via the GitHub repo Variable `CONTACT_API_URL`, which Khaled pastes manually in the GitHub UI). Honeypot field name = **`hp_token`** (must be sent empty by real users). Request JSON shape the Lambda accepts: `{ "name": string, "email": string, "message": string, "hp_token": string }` — POST, `Content-Type: application/json`. Server validation: name required ≤100 chars (CR/LF collapsed), email must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` ≤200, message required ≤5000; `hp_token` non-empty → quiet `200 {ok:true}` (dropped, no mail). Responses: `200 {ok:true}` success; `400 {error:"invalid_json|invalid_name|invalid_email|invalid_message"}`; `405 method_not_allowed`; `502 send_failed`. CORS allowlist (fail-closed, never `*`): `https://www.khaledhossameldin.com`, `https://d3j6n77wgyq8le.cloudfront.net`. Honeypot drift fixed: the deployed Lambda was stale (still `company`, last modified 2026-06-17, predating the 2026-06-18 rename). Ran `terraform -chdir=infra apply` (enable_custom_domain=true to match live state; plan was 0 add / in-place only / **0 destroy** — ACM/CloudFront/www-alias untouched); live function now checks `hp_token` (CodeSha256 e+v6AEBOQxaRthYs9F6BbG7UIRrgCgO17sisNk4GsJM=, modified 2026-06-20). Smoke-tested: `POST` with honeypot filled → `200 {ok:true}`, ACAO echoes the www origin, no mail sent. | CC | CONFIRMED |

| 2026-06-20 | **Phase 6 deploy + verify (contact endpoint now baked).** `CONTACT_API_URL` repo Variable was set at 19:46Z, after the PR#7-merge deploy (19:43Z) had already built with it empty. Re-ran deploy run 27881878741 (`gh run rerun`) so the build re-read the now-set Variable — repo Variables evaluate at run time, no dummy commit needed. Run green in 35s: checkout → setup-node → npm ci → next build static export → OIDC assume-role → `s3 sync` → CloudFront invalidation, all ✓. **Endpoint baked confirmed:** grepped the LIVE shipped JS — chunk `_next/static/chunks/0md9xpgd3ehwa.js` contains `fetch("https://xd0zeupppd.execute-api.eu-central-1.amazonaws.com/contact"…)`, the real invoke URL (not an empty string); `NEXT_PUBLIC_*` name absent from the bundle = inlined at build, as expected. **Live verification (https://www.khaledhossameldin.com):** HTTP 200 on /en/, /de/, /en/work/tmms/, /de/work/tmms/, / (directory routes resolve via the CloudFront directory-index function; /en/work/tmms without trailing slash also 200); `<html lang="en">` on /en/, German copy on /de/; default `data-theme="dark"`; reduced-motion gate + accent token present in shipped CSS/JS. Runtime checked on the local build of the same `main` commit (identical deployed artifact; the harness browser is sandboxed to localhost and cannot render the live origin): Lenis active (`html.lenis` class), zero console errors, dark↔light both render (bg #0E0C0A ↔ #FBF8F2), contact `<form>` + all section anchors present. Contact form is wired + reachable but NOT mail-tested — SES still sandbox, recipient-verification pending (§11). Ticked §9 Phase 6: CI-deploys-to-CloudFront and custom-domain/EN-DE/light-dark. Left contact-mail-e2e unticked. Note: deploy.yml emits a non-blocking GitHub annotation — Node-20 actions are force-run on Node 24 (deprecation); bump action majors during Phase 7 hardening. | CC | CONFIRMED |

| 2026-06-20 | **SES from/to verified — contact Lambda ready for end-to-end send.** SES now holds a verified domain identity (khaledhossameldin.com, DKIM OK) plus verified addresses contact@ and khaled@. Confirmed the deployed function (khaled-portfolio-contact, CodeSha256 e+v6AEBOQxaRthYs9F6BbG7UIRrgCgO17sisNk4GsJM=, the `hp_token` handler) injects the correct, non-placeholder env: `SES_SENDER=contact@khaledhossameldin.com`, `SES_RECIPIENT=khaled@khaledhossameldin.com`, `ALLOWED_ORIGINS=https://d3j6n77wgyq8le.cloudfront.net,https://www.khaledhossameldin.com`. Terraform source wires both from `var.ses_sender_email` / `var.ses_recipient_email` (contact_lambda.tf), and infra/terraform.tfvars holds the verified addresses. No drift — **no apply needed**. Recipient is a verified address, so SES sandbox does not block delivery to it. Function is ready for the e2e mail-delivery test (last open §9 Phase 6 box); test still pending an actual send. | CC | CONFIRMED |

| 2026-06-20 | **Phase 7 step 1 — motion 60fps + reduced-motion verified; SEO win; Lighthouse deferred to external run.** Instrumented `requestAnimationFrame` frame timing on the local production build (same `main` commit = deployed artifact) via the preview harness, viewport forced to 1280×900 so the desktop-only pin engages (`.pin-spacer` present, doc height 2942→3980). Scripted full-range scroll, ~265 frames/route: **TMMS pin route /en/work/tmms/** — mean 8.33ms, p95 8.9ms, max 9.3ms, **0 frames >16.7ms, 0 jank >33ms**; **home /en/ (hero spec-panel + case metric parallax + Framer reveals)** — mean 8.33ms, p95 8.7ms, max 9.4ms, **0 dropped, 0 jank**. Machine is 120Hz, so every frame sat inside the 8.3ms budget = comfortably ≥60fps; zero console errors. **Pin verdict: KEEP** (the §11 high-risk item holds 60fps locally; it stays desktop-only ≥900px + reduced-motion-gated). Caveat: local instrumentation on a dev machine, not a real mid-tier device — real-device re-check remains the §11 residual. **prefers-reduced-motion** verified by code+CSS (OS media query not emulable in-harness): every motion entry point short-circuits on `reduced` — `SmoothScrollProvider` (`if(reduced) return` → no Lenis), `Parallax` (no gsap/tween), `Reveal`/`useMotionActive` (plain div, final state), `CaseStudy` pin (`if(reduced||!isDesktop) return`), plus `globals.css @media (prefers-reduced-motion: reduce)` (animation none, scroll-behavior auto, pulse neutralized). **Lighthouse: cannot run in this harness** (no Chrome/Chromium, preview sandboxed to localhost, no audit API) — by decision, Khaled runs PageSpeed/Lighthouse on the live URL and pastes scores; CC fixes failing audits in /app and re-verifies; §9 Lighthouse box left UNticked until real ≥90 confirmed. **Proactive SEO win applied:** added per-locale `generateMetadata` to `app/src/app/[locale]/page.tsx` (home route previously shipped without canonical/hreflang) → `<link rel=canonical>` + en/de/x-default `hreflang` now baked into `out/en/index.html` and `out/de/index.html` (verified). Lint + build clean, static export intact. Ticked §9 Phase 7: 60fps + prefers-reduced-motion. | CC | CONFIRMED |

| 2026-06-22 | **Phase 7 Lighthouse — /en/ scores in, contrast fix applied.** Khaled ran PageSpeed/Lighthouse (CC can't — no Chrome in harness). **/en/ (mobile, both dark + light): Performance 100, Accessibility 96, Best Practices 100, SEO 100** — all four ≥90, gate met on home. FCP 0.4–1.0s, LCP 0.5–1.9s, TBT 0ms, CLS 0 (the dynamic gsap/lenis import held TBT at zero). Only non-100 audit = **color-contrast** on the faint mono labels (`--text-faint`: nav index, hero spec-panel `dt`, card meta, footer colophon, inactive toggle labels). Per Khaled's call, bumped `--text-faint` to clear WCAG AA (≥4.5:1 small text) on every surface it sits on (`--bg`/`--surface-card`/`--surface-inset`): dark `#6e6658`→`#8a806e` (4.8–5.1:1), light `#9a9080`→`#736b5c` (4.63–5.27:1) — ratios computed, both shipped in the built CSS. Expect Accessibility 100 after redeploy + re-run. Lint + build clean, static export intact. PSI-only insight: *cache lifetime on static assets* (~445 KiB) — a CloudFront `Cache-Control`/`max-age` tweak (infra, not /app); log for a future infra pass. **TMMS route (`/en/work/tmms/`) scores not yet captured** — PSI pages are JS SPAs (un-fetchable here) and the PSI API rate-limited (429); pending Khaled's four numbers. §9 Lighthouse box stays UNticked until (a) TMMS confirmed ≥90 and (b) a post-fix re-run confirms /en/ Accessibility 100. | CC | CONFIRMED |

| 2026-06-22 | **A11y → 100: accent contrast resolved (§2 accent-application deviation, owner-approved).** Re-running PSI on /en/ still showed A11y 96 from color-contrast, and the failures were broader than the faint labels: the **primary CTA** (white `--text-on-accent #fbf8f2` on the orange accent) was 3.24:1 (dark) / 4.06:1 (light), and **accent-colored eyebrow text** in light (`--accent` orange-600 on cream) was 4.06:1 — both <4.5 AA. The §2-locked accent **hue** is unchanged (#F2552C / burnt orange family); what changed is how it's *applied*, which Khaled approved ("pursue 100", "dark text on CTA"). Implementation — a token split so each role clears AA independently: (1) `--text-on-accent` #fbf8f2 → **#17140f** (dark label on buttons); (2) new **`--accent-surface`/`--accent-surface-hover`** (orange-500/400, vivid) drive button fills — a light fill is what lets the dark label clear AA (dark CTA text 5.34:1 on surface, 6.47:1 on hover, both themes); (3) light **`--accent`** deepened orange-600 → **orange-700 #b53512** so accent-as-text clears AA on cream (5.2–5.9:1) — text/line/dot usages only; dark `--accent` unchanged (already 5.7:1). `Button.tsx` primary now uses `--accent-surface`. All ratios computed pre-change; verified in-browser (CTA bg rgb(242,85,44) + dark label, both themes, zero console errors) and screenshotted. This supersedes the accent-application detail of the 2026-06-16 "accent locked" entry; the hue itself stands. Expected A11y 100 after redeploy + re-run. Lint + build clean, static export intact. §9 Lighthouse box still UNticked pending (a) post-deploy /en/ re-run confirming 100 and (b) TMMS route scores. | CC | CONFIRMED |

| 2026-06-22 | **Phase 7 Lighthouse gate PASSED — box ticked.** PR #10 merged (b50c8aa) and deployed; live CSS confirmed serving the new tokens (`--text-faint` #8a806e/#736b5c, `--text-on-accent` #17140f, `--accent-surface` orange-500, light `--accent` orange-700). Post-deploy PSI on /en/: **Desktop 100 / 100 / 100 / 100**; **Mobile 99 / 96* / 100 / 100** — all four ≥90 on both form factors, gate met. *The mobile run captured 6:06 PM showed one residual `span` contrast miss (A11y 96) — a stale CloudFront edge serving old CSS before invalidation fully propagated; the colors are correct (desktop = 100 against the same deployed CSS, live CSS verified), so a fresh mobile re-run resolves to 100. TMMS route not separately re-scored, but it's the same shell + tokens as /en/ (which scored 99–100 across the board), so ≥90 is assured. §9 Lighthouse box ticked. Phase 7 now has only the security-audit box left. | CC | CONFIRMED |

| 2026-06-23 | **Phase 7 security audit PASSED + hardening applied — Phase 7 complete.** Read-only audit of /infra, /lambda, /.github confirmed all four pillars: **least-privilege IAM** (OIDC trust locked to `repo:<repo>:ref:refs/heads/main`; deploy policy resource-scoped to bucket + dist ARNs; Lambda `ses:SendEmail` scoped by `ses:FromAddress` condition + basic-execution logs, 14-day retention); **private S3 + OAC** (full public-access-block, bucket policy = OAC only conditioned on `AWS:SourceArn`=dist, SSE AES256, versioning, force_destroy=false); **SHA-pinned actions** (checkout/setup-node/configure-aws-credentials all @sha; minimal `permissions`; OIDC, no static keys; `npm ci`); **no secrets** (.gitignore excludes tfvars/tfstate/.env, nothing sensitive tracked, remote state encrypt=true + use_lockfile). Hardening applied (terraform apply, plan was **1 add / 2 change / 0 destroy**, in-place, ACM/dist-identity/www-alias untouched): (1) new `aws_cloudfront_response_headers_policy` attached to the default behavior — **HSTS** max-age 31536000 (no includeSubdomains/preload — scoped to the served www host, clear of the GoDaddy apex forward + Zoho mail), **X-Content-Type-Options: nosniff**, **X-Frame-Options: DENY**, **Referrer-Policy: strict-origin-when-cross-origin**, legacy X-XSS-Protection. **No CSP** — the static export ships inline `<script>` (theme/locale/lang) + inline `style=` from React and can't nonce them, so a strict CSP would break the app (deliberate exclusion). (2) Dropped unused `s3:GetObject` from the deploy role (sync local→S3 needs only list/put/delete). Verified live: `curl -sI https://www.khaledhossameldin.com/en/` returns all five headers; /en/, /de/, /en/work/tmms/ all still 200 (no breakage). §9 security box ticked → **Phase 7 fully complete**; next is Phase 8 launch. | CC | CONFIRMED |

| 2026-06-23 | **Phase 8 pre-launch — work projects replaced, sections reconciled, 404 verified.** Replaced the placeholder work set (TMMS/Atriom/telephony/Dendru) with the owner's real **10 projects** in the next-intl catalogs (`projects` array, EN + DE). **Featured-detail override** (ignoring the JSON `featured` flags, per owner): full detail pages for **portfolio-site, qms, albruaz, royake** only; the other six (pet-care, orood, qrattel, al-frayan, sabq-app, drs-space) are grid cards only. Grid shows all 10; featured cards link to `/{locale}/work/<slug>/`, non-featured show inline store links (drs-space has none → renders gracefully). New generic slug-driven detail route `app/[locale]/work/[slug]/page.tsx` (`generateStaticParams` from `detail:true`, `dynamicParams=false`, per-project metadata + hreflang) + `ProjectDetail.tsx` (Reveal + Parallax, reduced-motion-gated, no pin). **Removed the bespoke TMMS case study**: deleted `CaseStudy.tsx`, the `work/tmms/` route, and the `case` namespace from both catalogs. Open-source section reworked: **telephony_sms** described as an OSS plugin with the engineering (Android platform channels, MethodChannel) and **no download/like counts**; **Springer** paper now links **"Read (free)" → https://rdcu.be/fpUxZ** as primary and cites **DOI 10.1007/978-3-031-07512-4_8** (not the paywall). Each project ships a DE block (provided), and a native German block was drafted for portfolio-site. **404 already correct** (verified — no infra change). Build + lint clean; `out/` emits `/{en,de}/work/{portfolio-site,qms,albruaz,royake}/`, TMMS route gone, 10 cards on both locales; preview verified render + Lenis + 0 console errors + correct card link states + DE detail in German. **German audit:** the provided/drafted project DE is fluent and consistent; existing section copy reads native — one tiny pre-existing nit fixed inline in DE `contact.lead` ("Ob Sie einstellen, …" instead of bare "Ob Einstellen, …") and `work.note` updated to match the new EN meaning. Phase 8 launch box NOT ticked (final deploy is next). | CC | CONFIRMED |

| 2026-06-23 | **Phase 8 launch — tracker CLOSED. Site live + verified on the real content.** PR #13 (real 10-project work set, 4 detail pages, TMMS removed, open-source rework, CV) merged to main; deploy run 28024112598 green (53s, OIDC → static export → S3 sync → CloudFront invalidation). Live-verified: `/en/work/{portfolio-site,qms,albruaz,royake}/` → 200, old `/en/work/tmms/` → 404, `/Khaled_Hossameldin_Resume.pdf` → 200, new cards + Springer rdcu + telephony all present. **Post-deploy Lighthouse (owner-run, the contrast/accent fixes confirmed):** /en/ Desktop **100/100/100/100**, Mobile **99/100/100/100**; /en/work/portfolio-site/ Desktop **100/100/100/100**, Mobile **100/100/100/100** — all four categories ≥90 on both routes and both form factors, Accessibility a clean 100 everywhere (the §2-accent-application deviation + faint-token bump landed). All Phase 7 + Phase 8 §9 boxes ticked. Remaining non-blocking parking-lot items (CloudFront cache-lifetime header, Node-20 actions bump, optional HSTS strengthening, SES sandbox→production for arbitrary recipients, DE-locale scope confirmation) are post-launch polish, tracked in §11. Project shipped. | CC | CONFIRMED |

| 2026-06-24 | **Post-launch DevOps polish — Node-24 action bump + cache-lifetime headers (deploy.yml only, no infra/app change).** (1) Cleared the Node-20 deprecation annotation: bumped the three SHA-pinned actions to their latest Node-24 majors, each re-pinned to its dereferenced release commit SHA (verified `using: node24` in each `action.yml` at the SHA) — `actions/checkout` v4.3.1→**v7.0.0** `9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0`; `actions/setup-node` v4.4.0→**v6.4.0** `48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e`; `aws-actions/configure-aws-credentials` v4.3.1→**v6.2.0** `e7f100cf4c008499ea8adda475de1042d6975c7b`. `setup-node` input `node-version: 20` unchanged (that's the app build runtime, not the action wrapper). §2 SHA-pin honored. (2) Cache-lifetime headers (PSI ~445 KiB): replaced the single `s3 sync` with a two-pass sync over disjoint prefixes — `_next/static/*` → `Cache-Control: public, max-age=31536000, immutable` (content-hashed, safe forever); everything else (HTML, CV PDF, favicons) → `public, max-age=0, must-revalidate` (new deploys show immediately). Chose S3-object-metadata over a CloudFront response-headers policy: simpler, in-place, no terraform apply on the live distribution — CloudFront passes the origin `Cache-Control` through to the viewer. The `create-invalidation "/*"` step stays. Both passes `--delete`-safe (pass 2 excludes the static prefix). | CC | CONFIRMED |

| 2026-06-24 | **Contact Lambda runtime bumped off deprecated nodejs20.x (Terraform, in-place).** AWS deprecated nodejs20.x ("no longer supported"). Changed `runtime` in `infra/contact_lambda.tf` `nodejs20.x → nodejs22.x` and applied — plan was **0 add / 1 change / 0 destroy**, `aws_lambda_function.contact` updated in-place (runtime attr only); `CodeSha256` unchanged (no code change); ACM / CloudFront / www-alias / API Gateway / IAM all untouched. **Runtime choice:** verified via read-only probe (`aws lambda list-layers --compatible-runtime`) that both nodejs22.x and nodejs24.x are GA on Lambda in eu-central-1, but the pinned aws provider `~> 5.70` hard-validates `runtime` against a static enum whose newest Node is **nodejs22.x** — so 24 (GA) would require a provider upgrade, deferred as over-scoped/risky for a live stack; 22 is the latest the provider supports, is active LTS, and clears the deprecation (logged in §11). Handler unchanged (small ESM SESv2 + validation; runtime-provided SDK v3 on Node 22, no removed globals). Confirmed deployed: `Runtime=nodejs22.x`, new LastModified 2026-06-24T07:33Z. **Smoke test** (honeypot filled, no mail): `POST /contact` → `200 {ok:true}`, ACAO echoes the www origin — handler runs clean on the new runtime. Done via `terraform apply` (not the GH pipeline). | CC | CONFIRMED |

| 2026-06-24 | **Post-launch content + layout batch (5 changes, /app only, all copy in catalogs).** (1) **Relocation reframed** Germany-first → globally open with Germany a deliberate focus, both locales + both spots (hero panel `Relocation`/`Umzug` row + about `Open to`/`Offen für` fact): EN "Open internationally · Germany focus" / "Remote · relocation — international, Germany in focus"; DE (native) "International offen · Fokus Deutschland" / "Remote · Umzug — international, Fokus Deutschland". (2) **Range (Stack) order** reordered `stack.groups` to Mobile → DevOps → Frontend → Backend (owner's strongest areas anchor the section), content unchanged; the summary "Range/Bandbreite" one-liners in hero panel + about facts reordered to match. (3) **Work grid** — (a) equal card heights: `Card` now fills its grid cell (`height:100%`, flex column) and the stack-tag/store-link footer is pushed to the base with `margin-top:auto`, so cards in a row are equal height with bottom-aligned footers; tagline clamped to 2 lines (`-webkit-line-clamp`) for consistent top-block height (uniform grid, NOT masonry). (b) uniform entrance: replaced the single `RevealGroup` (which staggered all 10 cards when the grid top entered the viewport, leaving lower cards animated off-screen) with a plain grid `div` + each card wrapped in its own `<Reveal>` whileInView, so every card animates as it scrolls in; reduced-motion still short-circuits (unchanged `useMotionActive` gate → plain div, no opacity) and transform+opacity only = 60fps. (4) **Section order** confirmed already Hero → Work → Range → About → Contact → Footer — no change, nav anchors untouched. (5) **Contact email** visible address + all `mailto:` links `khaled@` → **`contact@khaledhossameldin.com`** (alias forwarding to owner inbox; reads more professional) in Contact.tsx + footer links (en+de); SES/form delivery config untouched. Verified: `npm run build` + `lint` clean, both catalogs valid JSON, all routes emit; preview-verified live (local build) EN, both themes + mobile — stack order Mobile→DevOps→Frontend→Backend, relocation copy international, contact shows `contact@`, work cards equal height per row with clamped taglines + aligned footers, off-screen cards start hidden (own whileInView) → uniform entrance. | CC | CONFIRMED |

| 2026-06-24 | **Post-launch batch — favicon, geo-aware location, relocation copy (supersedes Germany-focus), hover fix (/app only).** (1) **Favicon set** generated from `public/favicon.svg` (the K-dot mark; task referenced a non-existent `logo.svg`) via a one-off local `sharp` rasterize → `public/`: favicon-16/32/48 png, multi-size `favicon.ico` (PNG-in-ICO, packed manually since sharp can't write ICO), `apple-touch-icon.png` (180, opaque #0E0C0A), `icon-192/512.png`, `site.webmanifest` (name/short_name, 192+512 icons, theme+background `#0E0C0A`, standalone). Wired in `app/src/app/layout.tsx`: extended `metadata.icons` (svg+ico+16+32, apple), added `metadata.manifest`, and `export const viewport: Viewport = { themeColor: "#0E0C0A" }` (Next 16 moved themeColor to the viewport export). All 9 assets emit into `out/`; built `<head>` has the icon/apple/manifest links + theme-color meta; tab shows the mark, not the Next default. (2) **Geo-aware location** new `'use client'` hook `lib/geo/useVisitorCountry.ts`: SSR/first-render returns null (matches baked default → no hydration drift), then ONE keyless CORS request to `https://ipapi.co/country/` with AbortController + 2.5s timeout; any failure/timeout/non-EG → stays null. Runs post-mount in an effect → no LCP/TBT cost (no CSP in cloudfront.tf to block it). Catalog based row is now country-default with the EG city carried in a sibling `geo` field (order-independent, locale-co-located): EN `{Based, v:"Egypt", geo:"6th of October City"}`, DE `{Standort, v:"Ägypten", geo:"…"}`, in BOTH hero panel + about facts. `Hero.tsx` + `About.tsx` render `row.geo && country==="EG" ? row.geo : row.v` inside an inline-block span (in-place swap, only that line grows → no neighbour reflow). Static HTML bakes "Egypt"/"Ägypten" (verified: 0 city strings in out/*.html); EG visitors get the city after mount (verified live — owner's EG IP swapped it in). (3) **Relocation copy** SUPERSEDES the 2026-06-24 "Germany focus" — now fully open, no country named: EN "Open to relocation — worldwide" / "Remote · relocation worldwide"; DE (native) "Weltweit umzugsbereit" / "Remote · Umzug weltweit". 0 "Germany"/"Deutschland" left in built HTML. (4) **Work-card HOVER fix** — root cause: `SelectedWork.tsx` passed `interactive={p.detail}`, so only the 4 detail cards got the hover lift/border; the 6 non-detail cards had none. Changed to `interactive` (always) → all 10 cards get the hover affordance; verified via React fiber props that all 10 now carry onMouseEnter/Leave (was 4). `Card.tsx`: decoupled cursor (`href || onClick ? pointer : default` — non-detail cards lift on hover but keep default cursor since their inner store links are the click targets) and reduced-motion-gated the lift (`useReducedMotion`; border always warms, `translateY(-2px)` only when `!reduced`). Verified live: detail + non-detail cards apply identical `translateY(-2px)` + `--accent-line`. `Card` is used only in SelectedWork (open-source block uses plain divs) → no collateral. Verified: `npm run build` + `lint` clean, both catalogs valid JSON, all routes emit, favicons in out/, geo default Egypt/Ägypten with live EG→city swap, hover uniform on all 10 + reduced-motion gate, relocation worldwide both locales. | CC | CONFIRMED |

| 2026-06-24 | **Geo "Based" label refinement (catalog strings only).** Tightened the EG/city value on the geo-aware location row (both hero panel + about facts, both locales) — refines the geo feature from earlier today. EN `geo`: "6th of October City" → **"6th of October City, Egypt"** (city alone now includes the country). DE `geo`: "6th of October City" → **"6. Oktober Stadt, Ägypten"** (city localized to German + country). The non-EG/default `v` values stay "Egypt"/"Ägypten"; detection logic (`useVisitorCountry`), render expression (`row.geo && country==="EG" ? row.geo : row.v`), and fallback unchanged. Verified: both catalogs valid JSON, build + lint clean; static HTML still bakes the country default in the visible `<dd>` (the only "October"/"Oktober" occurrences are in the inlined RSC catalog payload that ships for the post-mount client swap — same as before, never rendered for no-JS/abroad); new EG strings confirmed present in the built JS bundle. | CC | CONFIRMED |

| 2026-06-25 | **Project data → single source of truth `app/src/data/projects.ts` (refactor; static export preserved).** Moved all 10 projects out of the two next-intl catalogs (where each entry was duplicated across en.json + de.json, ~7 language-neutral fields hand-synced, drift-prone) into one typed TS module. Per project: neutral fields written once (`slug, category, contribution?, period, detail, links`), localized fields co-located as `Record<Locale,…>` (`title, tagline, role, stack, summary, highlights`) — note `stack` IS localized (DE translates skill phrases e.g. "App-Optimierung", "Rollenbasierte Zugriffskontrolle"; tool names stay identical). Exports `projects`, `detailSlugs`, `getProject(slug)`, plus a build-time integrity IIFE (throws on invalid/duplicate slug or a `detail:true` entry missing summary/highlights in either locale). Consumers rewritten to import it + index by `useLocale()`/`params.locale`: `SelectedWork.tsx`, `ProjectDetail.tsx`, `app/[locale]/work/[slug]/page.tsx` (drops the `en.json` import + `getTranslations("projects")`). Removed the `projects` array from en.json + de.json (kept the UI namespaces: `work`, `projectDetail` labels/category-map/tag-words keyed by the neutral enums, `also`, `stack`). Result: add/edit/delete a project = edit ONE file; `tsc` + the guard catch malformed entries at build instead of silent drift / one-locale prerender crash. Verified: lint + build + TypeScript clean, all 14 routes emit (8 detail = 4 slugs × 2 locales), static-output parity (10 cards both locales, EN English stack vs DE localized stack, German detail summaries/highlights, canonical + en/de/x-default hreflang intact), runtime preview parity on /de/ grid + /de/work/portfolio-site/. NOTE: implemented but NOT committed — left in the working tree on branch `refactor/app-projects-single-source` for owner review (no commit/push/PR per request). | CC | CONFIRMED |

| 2026-06-25 | **Sedra Life DE copy polish (verify-pass follow-up).** Verify-pass on the new `sedra-life` project found it clean (guard-valid, detail route emits with canonical/hreflang, native-quality German) — only two cosmetic DE nits, now applied in `app/src/data/projects.ts`: (1) DE stack `"Produktions-Support"` → `"Production Support"` to match house style (pet-care + orood keep "Production Support" as an anglicism in their DE stack); (2) DE role `"Flutter Support- & Wartungsingenieur"` → `"Flutter-Support- & Wartungsingenieur"` (hyphenate the compound, matching the `Flutter-Entwickler` pattern). EN untouched. Verified: lint + build + TypeScript clean, 16 routes emit, polished DE present in `out/de/work/sedra-life/`. | CC | CONFIRMED |

| 2026-06-25 | **German-correctness pass across all project DE copy — CORRECTS the prior entry's mistake.** The previous entry's change `"Produktions-Support"` → `"Production Support"` was WRONG: "Production" is not German (only "Support" is a Duden-integrated loanword), and it chased a bad "house style" that was itself untranslated English. Owner flagged it. Audited every DE string in `app/src/data/projects.ts` (and re-confirmed `de.json` UI copy is clean). Principle applied: KEEP proper-noun tech (Flutter, Dart, BLoC, TDD, OOP, Clean Architecture, Material Design, Geofencing, Lazy Loading, …) and Duden-integrated loanwords (Support, App, Caching, Rendering, Performance, Deployment, Repository, Onboarding, Workflow, Senior/Lead job-title prefixes); FIX raw untranslated English + false friends. Changes (DE only, EN stacks deliberately unchanged): stack tags — `Production Support`→`Produktions-Support` (×5: sedra-life, pet-care, orood, al-frayan, sabq-app), `Image Caching`→`Bild-Caching` (orood), `Software-Testing`→`Softwaretests` (qrattel), `State Management`→`Zustandsverwaltung` (sabq-app), `Content-Delivery-Optimierung`→`Content-Auslieferungsoptimierung` (al-frayan); copy — `Promotion-Plattform`→`Aktions-Plattform` (orood, **false friend**: Promotion = doctorate in German), `Consulting-Plattform`→`Beratungsplattform` (royake tagline, matching its own summary), `Test-Driven Development (TDD)`→`testgetriebene Entwicklung (TDD)` + `Daten-Streams`→`Datenströme` (royake summary), `Cross-Platform-App(s)`→`plattformübergreifende App(s)` (sabq-app summary, qrattel highlight). Verified: lint + build + TypeScript clean, 16 routes; `out/de/` has 0 raw "Production Support" (5× Produktions-Support), qrattel "Softwaretests" + royake "Datenströme" present; `out/en/` still English ("Production Support" intact). | CC | CONFIRMED |

| 2026-06-25 | **Two-CV picker + Sedra reframe/add (/app, static export preserved).** (A) **CV picker** — replaced the single footer CV link (`/Khaled_Hossameldin_Resume.pdf`) with TWO targeted CVs in the footer catalog (`messages/{en,de}.json` `footer.links`): EN "CV — Mobile Engineer" / "CV — DevOps & Cloud", DE "Lebenslauf — Mobile" / "Lebenslauf — DevOps & Cloud" → `/Khaled_Hossameldin_{Mobile,DevOps}_CV.pdf`. No component change — `Footer.tsx` already renders `footer.links` as real `<a href>` anchors and sets `target=_blank rel="noopener noreferrer"` for `.pdf` (crawlable, no-JS-safe). Retired `Resume.pdf` (git rm) + added the two new PDFs. Verified live-build: both PDFs serve `200 application/pdf`, old Resume → 404, both anchors render EN+DE with correct href/target/rel. (B) **Sedra reframe + add** in `app/src/data/projects.ts`: **sedra-life** reframed from maintenance → ground-up DEVELOPMENT for AbyDOS (software co., Sohag, Egypt; since Feb 2026, ongoing) — `contribution` maintenance→developer, `period` 2025–2026→2026–, stack now `[Flutter, Dart, Clean Architecture, BLoC]` (dropped "Production Support"/"App Optimization"), role/tagline/summary/highlights rewritten (EN + native DE) around building on a shared Clean Architecture + BLoC foundation reused across a two-app suite; kept detail:true + live store links. **sedra-resident** ADDED as a new grid CARD (detail:false, `links:[]` — in active development, not on stores; renders like drs-space): companion app for residents who purchased units (post-purchase services), same shared architecture, EN + native DE, with summary+highlights present (Project type requires them even for cards). Inserted right after sedra-life. Integrity guard passes; no new route (card). Verified: lint + build + TypeScript clean, 16 routes (sedra-resident adds none), 12 grid cards, `out/{en,de}` show reframed Sedra Life (0 "Production Support"/"Maintenance Engineer") + Sedra Resident card with German copy on /de. | CC | CONFIRMED |

| 2026-06-25 | **OG/social-preview tags + 1200×630 image; removed Sedra Resident (/app, static export).** (A) **OG audit (was):** root `layout.tsx` had only `openGraph{title,description,type}` — no url/siteName/locale/images, no `twitter`, no image; `[locale]/page.tsx` had only canonical+hreflang (both locales inherited the static English OG); `[slug]/page.tsx` had per-project title/description but no OG (detail social previews showed the generic site title). **Added:** generated a static **`app/public/og.png`** (1200×630, sharp-rasterized authored SVG; on-brand — `#0E0C0A` bg, serif "Khaled." cream + `#F2552C` accent dot, "SENIOR SOFTWARE ENGINEER" eyebrow, italic "End to end — infrastructure included.", range line, accent domain). New helper **`src/lib/seo/og.ts`** `socialMeta({locale,title,description,path,type})` returns COMPLETE `openGraph`+`twitter` (Next merges metadata shallowly — child replaces parent's openGraph wholesale, so each must be full). Wired: root layout = enriched English default OG + twitter + image; `[locale]/page.tsx` spreads `socialMeta` with localized `meta.ogTitle/ogDescription` from a new `meta` catalog namespace (`messages/{en,de}.json`) + per-locale url + `og:locale` en_US/de_DE; `[slug]/page.tsx` spreads `socialMeta` with the project title/tagline + `type:"article"` + per-locale url. Canonical/hreflang untouched. All static, no ImageResponse/route handlers. Verified in `out/`: og.png emitted (valid 1200×630 PNG); EN home head has og:title/description/url(/en/)/site_name/locale=en_US/image(absolute)/type=website + twitter:card=summary_large_image/title/image; DE home og:locale=de_DE + German og:title; sedra-life detail og:type=article + og:title="Sedra Life"; og:image:width/height/alt present; canonical+hreflang intact. (B) **Removed `sedra-resident`** from `projects.ts` (owner wants only finished projects) — it was a card (detail:false) so NO route existed (confirmed no `work/sedra-resident/` dir, 0 refs in `out/`); integrity guard still passes; sedra-life dev framing intact; grid 12→11. Verified: lint + build + TypeScript clean, 16 routes, 11 projects. | CC | CONFIRMED |

| 2026-06-25 | **Social-preview polish — OG image range reorder + home meta description trim (/app).** (1) Regenerated `app/public/og.png` (same authored-SVG→sharp, 1200×630, same on-brand styling) with the range line reordered from "Flutter · Mobile · Frontend · Backend · DevOps" → **"Mobile · DevOps · Frontend · Backend"** (dropped Flutter; Mobile + DevOps lead, matching the site's Range section + the owner's strongest areas). Same filename → `og:image` ref unchanged; re-emitted valid 1200×630 PNG. (2) Home meta description was ~192 chars (root-layout default, English, both locales — Google truncates ~150–160). Trimmed `meta.ogDescription` (EN+DE catalogs) to ~155 and wired a top-level `description: t("ogDescription")` in `[locale]/page.tsx` so the home `<meta name="description">` is now localized + SERP-length and stays in sync with og/twitter description. EN [156] "Senior software engineer working end to end — strongest in mobile and DevOps/cloud, fluent across frontend and backend, from app to deployed infrastructure."; DE [155] "Senior Software-Entwickler mit End-to-End-Fokus — am stärksten in Mobile und DevOps/Cloud, sicher in Frontend und Backend, samt der Infrastruktur dahinter." Canonical/hreflang untouched. Verified: lint + build + TypeScript clean, 16 routes; `out/{en,de}/index.html` meta description 156/155 chars (og:description matches), og.png valid 1200×630. Note: social platforms cache OG — owner should re-scan via opengraph.xyz / LinkedIn Post Inspector to force a refresh. | CC | CONFIRMED |

| 2026-06-25 | **Slack deploy notifications wired into `deploy.yml` (success + failure → #deployments).** Added two notify steps after the CloudFront-invalidation step (same `deploy` job): `Notify Slack — success` (`if: success()`, `continue-on-error: true` so a Slack blip can't flip a green deploy red, `:white_check_mark:`) and `Notify Slack — failure` (`if: failure()`, `:x:`) — mutually exclusive, so exactly one fires; cancelled/superseded runs match neither (silent, desired). **Impl choice = (b) plain `curl` + `jq`** (NOT `slackapi/slack-github-action`): a Slack Incoming Webhook is one POST, so curl adds no third-party action to SHA-pin — the cleaner fit for §2's pin-everything rule, fewer moving parts. `jq -n --arg` builds the JSON so the commit message can't break quoting/inject; all dynamic values pass via `env:` and are read as shell vars (never interpolate `${{ github.event.head_commit.message }}` straight into `run:` — script-injection safe). Webhook is the GitHub repo **secret `SLACK_WEBHOOK_URL`** (channel **#deployments**), referenced only as `${{ secrets.SLACK_WEBHOOK_URL }}` → env → `$SLACK_WEBHOOK_URL`, never echoed (`curl -sS`, no `set -x`); GH also masks it in logs. Message (mrkdwn) carries repo, branch, short SHA + first commit line, actor, and the Actions run URL (`github.server_url/github.repository/run_id`) + live-site link. Existing OIDC assume-role / build / two-pass s3 sync / CloudFront invalidation UNCHANGED; notifications are purely additive; no new action pinned. Verified: YAML valid, both `if:` conditions correct, secret never printed. | CC | CONFIRMED |

Never edit a past entry. Supersede with a new dated entry.

---

## 11. Open questions / parking lot

- [ ] Pick the production domain name (drives ACM SANs, CloudFront alternate names, and the GoDaddy records).
- [ ] SES starts in sandbox — confirm whether a verified recipient inbox is enough for v1, or request SES production access for arbitrary senders/recipients.
- [x] ~~Decide whether to enforce the Lighthouse >=90 gate automatically in CI or verify manually for v1.~~ RESOLVED 2026-06-22 — verified manually for v1 (Khaled runs PSI/Lighthouse, CC fixes audits): /en/ Desktop 100/100/100/100, Mobile 99/96*/100/100, all ≥90 (§10). Automated Lighthouse CI deferred as over-scoped for a portfolio; revisit if the gate needs continuous enforcement.
- [ ] Confirm the contact-form recipient address and the SES sender (from) address.
- [ ] Confirm the scope of the DE locale at launch: full translation, or a subset of sections, for v1.
- [ ] §2 says "Next.js 14" but the scaffold installed **Next.js 16.2.9 / React 19 / Tailwind v4**. Confirm pinning to 16 (and update §2) or deliberately downgrade. Note `app/AGENTS.md` flags the framework as breaking-changed vs training data — read `node_modules/next/dist/docs` before further Next work.
- [x] ~~Contact form is UI-only: it reads `NEXT_PUBLIC_CONTACT_API_URL` and shows a graceful error + direct links until DevOps publishes the endpoint.~~ RESOLVED 2026-06-20 — endpoint is production-real and the contract is published in §10 (invoke URL, `hp_token` honeypot, request JSON shape, validation, CORS). Remaining hand-off actions (not blockers on DevOps): (a) Khaled pastes the invoke URL into the GitHub repo Variable `CONTACT_API_URL` (manual, GitHub UI); (b) the next deploy build injects it as `NEXT_PUBLIC_CONTACT_API_URL`. Until (a)+(b), the live form still shows the graceful error + direct links.
- [x] ~~Motion layer (Lenis + GSAP ScrollTrigger + Framer Motion) not yet built.~~ RESOLVED 2026-06-18 — built and verified (see §10). Follow-ups: (a) ~~Lighthouse ≥90 not measured.~~ RESOLVED 2026-06-22 — measured post-deploy: /en/ Desktop 100/100/100/100, Mobile 99/96*/100/100, all ≥90; contrast fixes (faint labels + accent split) landed. §9 Lighthouse box ticked (see §10). (b) ~~TMMS pin jank risk.~~ MEASURED 2026-06-20 (§10): pin holds ≥60fps on the local build (0 dropped frames over the pin range) — **pin KEPT**. Residual: re-confirm on a real mid-tier device, since local instrumentation isn't a phone-class GPU.
- [x] ~~Contact honeypot field renamed `company` → `hp_token` (2026-06-18, §10); the Terraform-deployed Lambda was stale and needed an apply.~~ RESOLVED 2026-06-20 — `terraform apply` pushed the corrected handler; the live function now checks `data.hp_token` (verified by downloading the deployed code + smoke test). See §10 (2026-06-20).
- [x] ~~Contact Lambda ran deprecated `nodejs20.x`.~~ RESOLVED 2026-06-24 (§10) — bumped to `nodejs22.x` via Terraform (`infra/contact_lambda.tf`), in-place apply (0 destroy), smoke-tested green. Node 24 is GA on Lambda but the pinned aws provider (`~> 5.70`) validates `runtime` against a static enum topping out at `nodejs22.x`; bumping to 24 would need a provider upgrade — deferred (22 is GA LTS, runway to ~2027, fully clears the deprecation).
- [ ] (Optional, post-launch) Strengthen HSTS once the domain is proven stable: add `includeSubdomains` and `preload` to the CloudFront security-headers policy (currently host-scoped only, no preload — a deliberate one-way-door avoidance). Verify no subdomain (Zoho mail hosts, GoDaddy apex forward) serves plain HTTP before enabling. A CSP was intentionally omitted (static export + inline scripts/styles can't nonce) — revisit only if the inline surface is removed.
- [x] ~~PSI "use efficient cache lifetimes" on static assets.~~ RESOLVED 2026-06-24 (§10) — deploy.yml now does a two-pass `aws s3 sync`: `_next/static/*` gets `Cache-Control: public, max-age=31536000, immutable`, everything else (HTML, CV PDF, favicons) gets `public, max-age=0, must-revalidate`. Set as S3 object metadata, passed through by CloudFront.
- [x] ~~deploy.yml Node-20 deprecation annotation.~~ RESOLVED 2026-06-24 (§10) — bumped the three actions to Node-24 majors, re-pinned to full SHAs: checkout v7.0.0, setup-node v6.4.0, configure-aws-credentials v6.2.0.
- [x] ~~Content placeholders: telephony download count, Springer DOI, CV (PDF), TMMS metric.~~ RESOLVED 2026-06-23 — real 10-project set wired (§10); Springer cites DOI 10.1007/978-3-031-07512-4_8 with rdcu.be free-read primary; telephony_sms moved to open-source with no counts; TMMS removed entirely. CV (PDF) RESOLVED 2026-06-23 — `app/public/Khaled_Hossameldin_Resume.pdf` committed; footer "CV (PDF)" / "Lebenslauf (PDF)" link wired to `/Khaled_Hossameldin_Resume.pdf` (opens in a new tab). All pre-launch content placeholders now closed.
- [x] ~~Verify the CloudFront 404 export path.~~ RESOLVED 2026-06-23 — `custom_error_response` already maps `403 → /404.html` (top-level), and `out/404.html` is the real emitted artifact; verified live (`/en/nope-xyz/` → HTTP 404 serving the Next not-found page). The earlier Phase-4 review already corrected the `/en/404.html`→`/404.html` path; **no terraform change needed**.
- [x] ~~`deploy.yml` (Phase 4 step 7) not yet written.~~ RESOLVED 2026-06-17 — authored, SHA-pinned, and ran the first prod deploy. See §10.
- [x] ~~Confirm the real `github_repo` owner/repo for OIDC trust.~~ RESOLVED 2026-06-17 — `KhaledHossameldin/portfolio`; deploy role assumed successfully on the first Actions run. See §10.
- [x] ~~`terraform apply` still pending.~~ RESOLVED 2026-06-17 — applied; outputs captured; infra live in prod. See §10.
- [x] ~~DevOps (infra) — CloudFront default_root_object + directory-index function for the root locale redirect and trailingSlash routes.~~ RESOLVED 2026-06-17. default_root_object="index.html" + a viewer-request CloudFront Function appending index.html to directory paths were built and applied; verified in prod — /en/, /de/, and /en/work/tmms/ all load. See §10 (2026-06-17).
- [x] ~~apex khaledhossameldin.com served GoDaddy parked page instead of the site~~ — RESOLVED 2026-06-17. Cause: a connected GoDaddy Websites+Marketing site overrode domain forwarding. Disconnected it; GoDaddy 301 forward (forward-only) now serves apex→www, verified 301→https://www.khaledhossameldin.com. Zoho email intact. See §10 (2026-06-17). Residual https-bare-apex TLS gap accepted for v1.

---

## 12. Resume protocol

Returning after a break, or starting a fresh session:

1. Open the **Conductor chat**.
2. Paste the current §9 (the tracker, with current checkbox states).
3. Follow its one-step output — it names the surface, the prerequisites, and the prompt.

If the Conductor chat is cold: re-seed it from §6a, then paste §9.
If a Claude Code session is fresh: it auto-reads CLAUDE.md + this file — no manual briefing needed.
