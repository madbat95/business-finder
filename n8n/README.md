# Cold Outreach Workflow (n8n)

This workflow turns a Nearby Business Finder search into throttled, deduplicated
cold emails. It pulls fresh results from the backend's `POST /places` endpoint
(JSON, not the CSV export — see "Why JSON, not CSV" below), splits them into
one lead per item, routes leads with no email address to a review sheet instead
of dropping them, skips anyone already emailed, and logs every send.

The backend also exposes a `GET /places/export` CSV endpoint
(`http://localhost:3001/places/export?lat=...&lon=...&radiusKm=...&categories=...`)
for manual review/backup/import into a spreadsheet or CRM. It is **not** used
by this automated workflow — see below for why.

## Import

1. Open your n8n instance → **Workflows → Import from File** → select
   `cold-outreach-workflow.json`.
2. n8n does not store real credentials or sheet/document IDs in exported
   workflow JSON, so several things will show up as placeholders you must
   replace after import (all listed below). This is expected and is what
   makes the file safe to commit to a public repo.
3. n8n versions differ in exact node parameter schemas. If a node shows a
   type-version warning or a parameter looks blank on import, the node
   connections/graph are still intact — open the node and reconfigure the
   flagged field via its normal UI (e.g. re-pick the Google Sheet from the
   picker, re-select the dedupe comparison field, re-link the SMTP
   credential). Don't delete/rewire nodes to fix this; it's just re-pointing
   values that can't be serialized into a shareable file anyway.

## Known gotcha: Gmail SMTP "Connection closed unexpectedly"

If you're using Gmail's SMTP as a free testing credential (see the Provider
section below for why it's not recommended beyond testing), and n8n's SMTP
credential test fails with `Connection closed unexpectedly` even though the
network path is fine (TCP/TLS handshake succeeds outside n8n), check the
credential's **"Client Host Name"** field. It must be **blank**. If it
contains anything that isn't a real, valid hostname (e.g. a credential
label like `Gmail Test` typed into the wrong field), Gmail's server rejects
the EHLO handshake and drops the connection — which n8n surfaces as this
generic, unhelpful error with no indication of which field caused it.

## What you must configure before running it for real

| Node | What to set | Why it's a placeholder |
|---|---|---|
| **Search Parameters** | `lat`, `lon`, `radiusKm`, `categories` | Ships with a Berlin example (good OSM email coverage for testing) — change to your target area. |
| **Search Parameters** | `senderName`, `senderPhysicalAddress` | CAN-SPAM requires a real physical postal address in every commercial email footer — see Compliance below. This is not optional. |
| **Search Parameters** | `backendBaseUrl` | Defaults to `http://localhost:3001` — change if the backend is deployed elsewhere. |
| **Send Email** | SMTP credential | Create a credential in n8n (Credentials → New → SMTP) using your provider's settings (see Provider recommendation below), then open this node and select it — the JSON only carries a placeholder credential name/ID, never a secret. |
| **Send Email** | `fromEmail` | Must be an address verified with your sending provider. |
| **No-Email Leads Log**, **Log Sent Emails** | Google Sheets credential + `documentId` | Create a Google Sheet with two tabs, `NoEmailLeads` and `SentLog` (header rows matching whatever fields you want logged — the node auto-maps input fields to matching column headers), share it with your n8n Google account, and paste its ID into both nodes. |
| **Compose Email Content** | The `[Write your pitch here.]` placeholder in the body expression | This ships as a stub — write your actual outreach message before sending anything real. |

## Why JSON, not CSV, for the automated path

n8n operates natively on JSON item arrays — every downstream node (filter,
dedupe, expressions) works directly against `response.results[]` with zero
parsing step. Pulling from the CSV endpoint instead would require an extra
"Extract from File" node just to get back to the same structure the backend
already returns as JSON, adding a failure point for no benefit. The CSV
endpoint stays useful as a separate, human-facing export (open in Excel/Sheets,
hand off to someone else, archive a snapshot) — it's just not part of this
workflow's data path.

## Node-by-node

1. **Manual Trigger** — run on demand. Swap for a **Schedule Trigger** if you
   want recurring runs — if you do, the dedupe step (node 6) becomes mandatory,
   not optional, since the same search will return the same businesses every
   time.
2. **Search Parameters** — workflow variables (see table above).
3. **Fetch Nearby Businesses** — `POST {backendBaseUrl}/places` with the
   search params as the JSON body.
4. **Split Out Businesses** — turns the single response's `results` array into
   one n8n item per business.
5. **Has Email?** — branches on whether `email` is non-empty.
   - **False branch → No-Email Leads Log** (Google Sheets append): phone-only
     leads are not dropped — they land here for manual/phone follow-up, since
     a phone-only lead is still a lead.
   - **True branch → continues below.**
6. **Not Already Sent** — n8n's built-in "Remove Duplicates" node, comparing
   on `email` against previous workflow executions. This replaces a
   Google-Sheets-lookup-then-branch pattern with n8n's native mechanism for
   exactly this problem (skip items seen in a prior run) — it's simpler and
   doesn't need a parallel lookup/merge branch to work correctly. The
   `SentLog` sheet (node 10) still exists as your human-readable audit trail
   and opt-out list (see Compliance) — this node is just the actual technical
   gate that stops a re-run from double-emailing someone.
7. **Compose Email Content** — builds `emailSubject`/`emailBody` from the
   business's `name`, `businessType`/`category`, and `address`, plus the
   sender name/address/unsubscribe line from Search Parameters.
8. **Throttle Between Sends** — fixed delay (default 20s) between sends. See
   Compliance below for why this shouldn't be shortened aggressively.
9. **Send Email** — generic SMTP send.
10. **Log Sent Emails** — appends to the `SentLog` sheet, closing the loop for
    future runs and doubling as your opt-out/suppression record.

**Not built, documented as a v1.1 follow-up:** an error-handling branch if
Send Email fails (so a bounce doesn't silently vanish the lead). Kept out of
v1 to keep the imported graph simple; add an error-output branch on the Send
Email node to a failure-log sheet if you want this.

## Email provider recommendation: Amazon SES

- **Cost**: effectively free at low volume (~$0.10 per 1,000 emails after a
  small free tier) — fits low-to-moderate B2B cold outreach volume, unlike
  providers with flat monthly minimums.
- **Deliverability**: full SPF/DKIM/DMARC domain verification via SES's setup
  flow. This is what actually determines inbox placement — a personal
  Gmail/Outlook account can't offer this and will get rate-limited or flagged
  as spam quickly at any real volume.
- **n8n compatibility**: SES exposes standard SMTP credentials (distinct from
  AWS IAM API keys — find these under SES → SMTP Settings), which plug
  directly into n8n's generic SMTP credential type. No custom node needed.
- **Sandbox mode**: new SES accounts start restricted to sending only to
  verified addresses. You must request production access (a short form,
  approval can take a day or more) before you can email real prospects —
  budget lead time for this before you plan to run the workflow live.
- **Alternatives**: Mailgun and Postmark are equally valid drop-in SMTP
  alternatives if you'd rather not use AWS — both work with the same generic
  SMTP node.

## Compliance (read this before sending anything real)

This workflow automates outreach, not compliance — you are responsible for
following the law in whatever jurisdictions your leads are in.

- **CAN-SPAM (US)**: truthful, non-deceptive subject and From fields; a real
  physical postal address in every email footer (the `senderPhysicalAddress`
  variable — do not ship this blank or fake); a clear, working opt-out
  mechanism; opt-outs honored within 10 business days (in practice: honor them
  immediately by adding the address to your suppression/opt-out record and
  never emailing it again).
- **GDPR (EU)**: B2B outreach to a business address can generally rely on
  "legitimate interest" as a lawful basis, but you still must clearly identify
  yourself/your company, state your purpose, and offer an easy opt-out. Don't
  send to personal EU email addresses you find incidentally (e.g. tagged
  under a business but clearly a named individual's personal account) without
  a stronger basis.
- **Volume / domain warm-up**: do not blast your entire result set from a
  brand-new sending domain on day one — ramp gradually (e.g. 20–50 emails/day,
  increasing over 2–4 weeks) to protect your domain and IP reputation. This is
  why the throttle node exists; don't remove it or cut it to near-zero.
- **Suppression = opt-out list**: the `SentLog` sheet should be treated as
  (or extended into) your opt-out list — anyone who replies asking to stop
  must be added to it and checked before every future send. As shipped, this
  workflow checks "already sent" via the Remove Duplicates node but does
  **not** yet automatically check an opt-out list separately from "already
  sent" — if someone opts out without you re-running the workflow against
  them, they're safe by default (no repeat send), but if you add them back
  into a search result set from a different radius/category combo, nothing
  currently stops a new email to that same address unless it also matches the
  `email` values Remove Duplicates has already seen. Treat manually reviewing
  the `SentLog` sheet before every campaign as mandatory until this is
  automated — this is flagged here deliberately because honoring opt-outs
  promptly is a legal requirement, not just good practice.

## Verification checklist

What was already verified against the live backend and real OSM data:
- The Berlin example params (`lat=52.52, lon=13.405, radiusKm=10,
  categories=electrician,plumber,hvac`) return real results with populated
  `email` and `businessType` fields (confirmed via direct API testing before
  this workflow was built).

What you need to verify yourself after import (cannot be done without your
own credentials):
1. **Import**: confirm the workflow loads with no parse errors and no
   orphaned/broken-expression nodes (n8n flags broken expressions with a
   warning icon on the node).
2. **Fetch step**: manually execute just the "Fetch Nearby Businesses" node
   (or up through "Split Out Businesses") against your running backend and
   confirm real items appear, including non-null `email`/`businessType` on at
   least some rows if you used the Berlin example.
3. **Branching**: confirm "Has Email?" correctly splits a mixed result set —
   if your live data doesn't naturally contain both cases, temporarily pin
   a manually-crafted test item with `email: ""` and one with a real value.
4. **Google Sheets**: create the sheet, share it with your n8n service
   account/OAuth connection, and confirm both the "No-Email Leads Log" and
   "Log Sent Emails" nodes can write to it (run each manually once with a
   test item).
5. **SMTP**: request SES production access, verify your sending domain
   (SPF/DKIM/DMARC), and send yourself one test email through the "Send
   Email" node before pointing it at real leads.
6. **Full run**: only after 1–5 pass, do a small manual run (a tight radius,
   one category) and confirm exactly the leads you expect receive an email
   and end up logged in `SentLog`.
