## Summary

---

## Architectural checklist (required)

### Feature / routing changes

- [ ] New features were generated via `pnpm gen:feature`
- [ ] Feature structure matches the required slice (routes/page/data/state/models)
- [ ] Feature routes declare `providers: [...]`
- [ ] No feature imports another feature
- [ ] `app.routes.ts` composes features only (no page imports)

### Data & state

- [ ] No component/page/state/guard uses `HttpClient`
- [ ] Data access is isolated to `*.data.ts` or `core/api`
- [ ] Feature state is route-scoped (no `providedIn: 'root'`)

### Styling & tokens

- [ ] No raw colors introduced outside token sources
- [ ] Token changes update `projects/tokens/dist`

---

## Verification

- [ ] `pnpm verify` passes locally
- [ ] CI is green
