## Summary
- 

## Checklist
- [ ] Scope is focused and PR is reviewable
- [ ] `npm test` passed (backend/frontend)
- [ ] `npm run build` passed (frontend)
- [ ] Lint passed (frontend)
- [ ] Security-sensitive changes reviewed (auth, env, headers, CORS)
- [ ] No secrets committed
- [ ] Docs updated if behavior changed

## Test Plan
- [ ] Login with local account works
- [ ] Dashboard load/error/empty states look correct
- [ ] OAuth buttons show disabled coming-soon behavior
- [ ] `/api/health` reflects degraded OAuth when disabled
