# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## School Catalog API

The dev server exposes dynamic school catalog routes backed by Supabase:

- `GET /v1/schools?query=<text>&divisions=d1,d2,d3,juco&sport=football&limit=20&offset=0`
- `GET /v1/schools/:id`
- `GET /v1/sports`

Legacy compatibility route:

- `GET /api/schools?divisions=d1,d2`

### Syncing School Data

Run the sync script to upsert schools and sport offerings:

```bash
npm run sync:schools -- --file scripts/data/schools_catalog.sample.json
```

For annual maintenance updates (only new/changed rows):

```bash
npm run sync:schools -- --file /path/to/full_catalog.json --delta
```

To bootstrap NCAA D1/D2/D3 schools into SQL for local DB import:

```bash
npm run catalog:ncaa:sql
```

To bootstrap NCAA + NAIA + NJCAA in one import:

```bash
npm run catalog:full:sql
```

Then apply it to local Supabase:

```bash
/bin/zsh -lc "{ cat supabase/snippets/import_full_school_catalog.sql; } | docker exec -i -e PGPASSWORD=postgres supabase_db_RecruitCoS psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -f -"
```

Required environment variables:

- `VITE_SUPABASE_URL` (or `SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY`
