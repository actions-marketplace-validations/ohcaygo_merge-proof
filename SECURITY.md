# Security Policy

## Supported versions

We currently support the latest published release of Merge Proof (`v0.1.0` and newer tags on `main`).

| Version | Supported |
| ------- | --------- |
| latest release / `main` | Yes |
| older tags | Best-effort |

## What Merge Proof is (threat boundary)

Merge Proof provides **independent exact-state merge evidence** for pull requests (CURRENT / STALE / NOT_PROVEN). It is **not** an AI code reviewer and is not designed to write or merge code on your behalf.

Please report issues that could affect confidentiality, integrity, or availability of:

- The hosted Merge Proof service (`merge-proof.ohcaygo.com` and related APIs)
- The GitHub App / GitHub Action / CLI distribution
- Customer proof data, auth sessions, or billing

## Reporting a vulnerability

**Do not open a public GitHub issue for security bugs.**

Email: **support@ohcaygo.com** (or **ryan@ohcaygo.com** if support is unreachable)

Please include:

1. Description of the issue and impact
2. Steps to reproduce (PoC if possible)
3. Affected component (App, Action, CLI, hosted site)
4. Whether you have shared this with anyone else

We will acknowledge receipt within **3 business days** and aim to provide a status update within **7 business days**.

## Safe harbor

If you report in good faith, without privacy violations, destruction of data, or service disruption beyond what’s needed to demonstrate the issue, we will not pursue legal action related to that research.

## Prefer not to use email?

Open a **private** security advisory on this repository if GitHub Security Advisories are enabled for the org; otherwise use email.
