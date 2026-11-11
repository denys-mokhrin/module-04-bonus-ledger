Step 3 of the Team slice: implementation.

Add the teams feature to the identity context in the handler / service / repo layout from
ARCHITECTURE.md: controller for POST /teams and GET /teams/:id, service with the rules from the
specs, repo that is the only place touching the identity Prisma client. Wire it into
identity.module.ts. Use the shared ids, clock and errors primitives; do not import anything from
another context.

Make the specs from the previous step pass without weakening them.
