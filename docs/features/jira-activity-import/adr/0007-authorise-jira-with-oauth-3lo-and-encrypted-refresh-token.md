---
status: Accepted
owner: "Denys Mokhrin"
reviewers: ["Tech Lead", "Security Lead"]
updated_at: "2026-11-24"
feature_size: M
stage: "04-05"
ticket: "<TBD>"
---

# 0007 — Authorise Jira with OAuth 3LO and an encrypted refresh token

- **Status:** Accepted
- **Date:** 2026-11-24
- **Deciders:** Denys Mokhrin (Architect) with Claude during the architecture-design walk

## Context

US-01 needs read access to the Team's Jira Cloud site that survives when the connecting person leaves (CONTEXT Connection), and AC-16 needs re-authorisation of the same Connection. PRD §6.1 requires the credential to be stored encrypted, never shown back, read-only, with a security review.

## Decision drivers

- PRD §6.1: credential never returned or logged, read-only access, Security review Required
- AC-15 / AC-16: lost access is detected and the same Connection is re-authorised
- Tokens encrypted at rest, decrypted only in the HTTP client (SAD §2)

## Considered options

1. **Atlassian OAuth 2.0 (3LO) with read-only scopes, encrypted refresh token** — the Team Lead consents in Atlassian; the app stores only an encrypted refresh token per Connection.
2. **Personal API token pasted by the Team Lead** — the Team Lead creates a token in their Atlassian account and pastes it.
3. **Atlassian Connect / Forge app installed on the site** — a site-level app installed by a Jira administrator.

## Decision outcome

**Chosen:** Option 1. It gives read-only scopes, revocation that the import can detect, and re-authorisation by any Team Lead of the Team without sharing a secret. Pasted API tokens carry the person's full rights and are copied by hand; a site app needs a Jira administrator, which CONTEXT says the Team Lead does not have to be.

## Consequences

**Positive**
- Least privilege: read-only scopes
- Lost access shows up as a failed refresh, which feeds the access-lost Import Alert

**Negative**
- Requires an Atlassian developer app and its client secret in configuration
- Refresh-token rotation must be persisted atomically

**Neutral**
- Encryption key management follows the foundation config rules (scaffold S3)

## Links

- PRD: [[../PRD.md]] US-01, AC-01, AC-15, AC-16, §6.1
- SAD: [[../sad.md]] §8
- Related ADR: —
