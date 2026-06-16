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

- Branching: trunk-based — short-lived feature/**, fix/**, chore/\*\* branches off main, merged fast.
- Commits: Conventional Commits (feat/fix/chore/ci/docs/refactor/perf).
- Never commit secrets. No app secrets exist client-side; the Lambda reads config from
  environment variables set by Terraform. Terraform state holds no plaintext secrets.
