Step 2 of the Team slice: failing tests first (AGENTS.md: new behaviour starts with a failing test).

Write, without the implementation:

- a unit spec for the team service: creates a team, rejects an empty name, rejects a duplicate
  name inside the same company, returns not found for an unknown id;
- an integration spec against Postgres for POST /teams and GET /teams/:id: 201 with the created
  team, 400 on invalid body, 409 on duplicate name in the same company, 404 on unknown id,
  errors in the project's error envelope.

Follow the naming and location of the existing specs. Run them and show me that they fail for
the right reason (missing implementation, not a typo).
