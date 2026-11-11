I want to add the first real entity to the identity context: Team (see docs/bc-map.md and
src/modules/identity/README.md). The slice is: Prisma model + migration with down.sql,
POST /teams and GET /teams/:id, unit and integration tests.

Do not write code yet. Read the conventions that apply (AGENTS.md, ARCHITECTURE.md,
docs/architecture-map.md, docs/adr/0002, the identity module, the existing init migration,
the shared ids / errors primitives, the existing tests) and tell me:

1. the files you would create or change, with paths;
2. the conventions each of them has to follow;
3. anything in the scaffold that is missing for this slice.
