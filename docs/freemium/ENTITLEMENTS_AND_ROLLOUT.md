# Freemium Entitlements And Rollout

This document is the operational source of truth for free access, legacy Start
access, Elite access, trial behavior, metered exports and data preservation.

## Non-Negotiable Data Rule

Changing a plan must never delete or rewrite customer projects, published sites,
CRM forms, leads, analytics or generated assets.

- A downgrade changes permissions only.
- Existing published sites stay online.
- Existing leads stay in `crm_form_submissions`.
- Existing projects stay in `fabrica_diagnosticos`.
- CRM data becomes visible again when Elite access is restored.
- Explicit project deletion uses the existing project deletion RPC. That RPC
  preserves captured leads in account history.
- Explicit deletion remains available to the owner after downgrade; plan locks
  cannot trap customer-owned projects or sites.

The migration performs no automatic or bulk deletion. Its single project
deletion statement is confined to the explicit `delete_fabrica_project` RPC,
requires both the selected project ID and authenticated owner, archives linked
forms first and never deletes captured leads.

## Access Matrix

| Capability | Guest | Free | Start legacy | Elite trial | Elite | Admin |
| --- | --- | --- | --- | --- | --- | --- |
| View permanent free content | Yes | Yes | Yes | Yes | Yes | Yes |
| Open and configure Fabrica | Yes, local | Yes | Yes | Yes | Yes | Yes |
| Save projects | Local draft | 1 cloud project | 1 cloud project | Unlimited | Unlimited | Unlimited |
| Search real destination photos | No | Yes | Yes | Yes | Yes | Yes |
| Preview ads and carousels | Protected preview | Yes while quota remains | Yes while quota remains | Yes | Yes | Yes |
| Export ads | No | 3 lifetime | 3 lifetime | Unlimited | Unlimited | Unlimited |
| Export carousels | No | 2 lifetime | 2 lifetime | Unlimited | Unlimited | Unlimited |
| Preview site and CRM | Yes, sample only | Yes, sample only | Yes, sample only | Yes | Yes | Yes |
| Publish site | No | No | No | Yes | Yes | Yes |
| Read and manage real CRM data | No | No | No | Yes | Yes | Yes |
| Voice extraction and Vendedor IA | No | No | No | Yes | Yes | Yes |
| Historical Start premium library | No | No | Yes | Yes | Yes | Yes |

Free export limits are account-scoped and lifetime. A credit is reserved only
when the user requests the final download. It is committed after a successful
export and released after an export failure. Idempotency prevents double charge
for the same export action.

Guest drafts use an isolated local namespace and never reuse the last signed-in
account cache. After sign-up, a meaningful guest draft may be imported only
when the account has no existing project. The guest copy is deleted only after
the cloud save has been confirmed. A sign-out or failed save keeps the draft.

After a Free or Start export quota reaches zero, the project remains editable
and saved, but the final preview/download is protected by the contextual Elite
paywall. The server ledger, not the visual lock, remains the authority.

## Free Access Versus Elite Trial

These are different offers and the UI must keep them explicit:

- Permanent free access requires no payment card. It includes selected content
  and, after account creation, one saved project, three ad exports and two
  carousel exports.
- The Elite trial is three days of full access through Stripe checkout. It
  requires the checkout flow and has no charge on the first day.
- The public Start offer remains hidden. Start is supported only for historical
  customers.

## Product Catalog

Plan recognition uses exact IDs. Never use partial names or substring matching.

Legacy Start:

- `prod_TkvaozfpkAcbpM`
- `start_ticto`
- `monthly_access_ticto`

Elite:

- `prod_UTFsXcKq8m0mol`
- `prod_UTSmPe3GPt8iHt`
- `prod_UTFlCWzNqvqSNx`
- `hotmart_elite`
- `elite_ticto`
- `monthly_access_pix`
- `annual_access_pix`

Unknown active products are classified as `unknown_paid` for manual review.
They do not silently receive Elite permissions.

## Server Enforcement

Client-side locks are explanatory only. Sensitive actions are enforced on the
server and in the database:

- `fabrica-entitlements` is the authoritative capability and usage service.
- `reserve_fabrica_usage` serializes and records metered exports.
- RLS limits direct project creation and Elite-only site/CRM mutations.
- `enforce_fabrica_project_limit` closes concurrent free-project insert races.
- Voice, AI design, photo editing and Vendedor IA verify Elite server-side.
- Photo search requires authentication and has burst limits.
- Checkout uses the configured application URL, checks duplicate Elite access
  and never places email in the return URL.

## Published Site Recovery

Legacy published sites are recovered without fabricating a successful cloud
save:

- `materialize_fabrica_published_site` locks the owned `public_sites` row,
  creates the project snapshot and links the site in one transaction.
- A retry returns the already linked project instead of creating a duplicate.
- The trigger exception is scoped to that RPC and still requires the site to
  belong to the authenticated account.
- If the RPC is not deployed or the request fails, the browser may open a
  device-only snapshot for editing, but it keeps the site unlinked and retries
  cloud materialization later.
- Recovery never changes published HTML and never deletes CRM leads or
  analytics.

## Required Secrets

Before deployment, confirm these names exist in the official Supabase project:

- `STRIPE_SECRET_KEY`
- `STRIPE_ELITE_MONTHLY_PRICE_ID`
- `STRIPE_ELITE_SEMIANNUAL_PRICE_ID`
- `STRIPE_ELITE_ANNUAL_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`
- `LOVABLE_API_KEY`
- `PEXELS_API_KEY`
- `APP_URL` or `SITE_URL`

Values must never be committed or exposed to the browser.

## Analytics Events

The allowed conversion events are:

- `fabrica_opened`
- `free_quota_seen`
- `free_export_reserved`
- `free_export_completed`
- `free_limit_reached`
- `paywall_viewed`
- `upgrade_clicked`
- `site_publish_blocked`
- `crm_preview_opened`

Do not store customer form contents, email, phone or project payloads in these
events.

## Deployment Order

1. Run `npm run safety:freemium`.
2. Run the production build.
3. Record read-only counts for projects, sites and CRM leads.
4. Dry-run the database migration against the official project.
5. Apply `20260729170000_freemium_entitlements.sql`.
6. Deploy the changed Edge Functions.
7. Smoke-test with Free, Start, Elite trial, Elite and Admin accounts.
8. Push the reviewed commit to the current GitHub branch.
9. Integrate into Lovable only with a fast-forward or normal merge. Never force
   push an older tree over Lovable.

## Smoke Tests

Free account:

- Can create one project and reopen it.
- A guest can configure a local draft; signing up imports it only after the
  account is confirmed empty.
- Cannot create a second project.
- Can export exactly three ads and two carousels.
- A failed export does not consume a credit.
- Site preview works; publish opens the contextual Elite paywall.
- CRM preview works; real leads are hidden but remain in the database.
- Voice and Vendedor IA remain blocked.

Start legacy:

- Keeps access to historical premium content.
- Uses the same Fabrica export limits as Free.
- Can upgrade through the Elite checkout.

Elite trial and Elite:

- Unlimited exports.
- Site publish and CRM real data work.
- Voice and Vendedor IA work.
- Existing data from before the upgrade is still present.

Downgrade:

- Published URL stays online.
- Project, site and CRM row counts do not decrease.
- Premium mutations are blocked.
- Restoring Elite makes the same CRM rows visible again.

Legacy recovery:

- An orphan owned site becomes one project and receives `project_id`.
- Repeating recovery returns the same project.
- A failed RPC remains explicitly device-only and retries on reload.
- A site from another account can never be linked or materialized.

## Rollback

Frontend locks can be reverted independently. If a database policy must be
rolled back, create a new forward migration that restores the previous policy;
do not reset the database and do not delete the usage ledger. Edge Functions can
be redeployed from the previous reviewed commit.
