# Billing

Owns plans, company subscriptions, invoices and the grace period after a failed payment. It is a generic subdomain that will be backed by Stripe Billing.

- Publishes: `SubscriptionActivated`, `PaymentFailed`, `SubscriptionSuspended`
- Listens to: `CompanyRegistered` (starts a trial subscription)
- Public facade: `public/` — `SubscriptionStatus` (is the company active?)
- Schema: `billing`
