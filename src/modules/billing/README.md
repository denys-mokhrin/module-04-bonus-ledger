# Billing

**Why it exists.** Companies pay per team per month, and a failed payment must eventually suspend sync and new periods. This is a generic subdomain that may be replaced by Stripe Billing behind the same events, so it is isolated from the product's core.

**Glossary** (from `docs/bc-map.md`):
- **Plan**: the price per team per month.
- **Subscription**: the company's active plan and billing cycle.
- **Invoice**: the monthly charge; it is paid, failed or void.
- **Grace Period**: the days after `PaymentFailed` before features are suspended.

**Events**
- Publishes: `SubscriptionActivated`, `PaymentFailed`, `SubscriptionSuspended` (→ Jira Integration, Bonus Review)
- Listens to: `CompanyRegistered` (starts a trial subscription)

**Public facade:** `public/`: `SubscriptionStatus` (is the company active?), not built yet.
**Schema:** `billing`. Layout: handler / service / repo, Stripe behind one adapter; Prisma client in `db/`. Money: `amountCents` + currency (`.claude/rules/money.md`).
