# RecruitCoS Schema Summary (Baseline Reset)

As of February 12, 2026, the active schema baseline has been reset to a single core table:

- `public.athletes`

Legacy table migrations were archived to:

- `supabase/migrations_archive_2026_02_12/`

## Active Baseline Migration

- `supabase/migrations/040_baseline_athletes.sql`

## Athletes Table (Current Baseline)

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key; should match Supabase Auth user id |
| `name` | `text` | Required display name |
| `first_name` | `text` | Optional |
| `last_name` | `text` | Optional |
| `grad_year` | `integer` | Optional |
| `sport` | `text` | Optional |
| `position` | `text` | Legacy/freeform position |
| `primary_position_display` | `text` | Human-readable primary position |
| `primary_position_canonical` | `text` | Canonicalized position key |
| `primary_position_group` | `text` | Canonicalized position group |
| `position_group` | `text` | Compatibility field used by existing UI paths |
| `secondary_positions_canonical` | `text[]` | Defaults to empty array |
| `secondary_position_groups` | `text[]` | Defaults to empty array |
| `goals` | `jsonb` | Defaults to `{}` |
| `target_divisions` | `text[]` | Defaults to empty array |
| `gpa` | `numeric(3,2)` | Optional |
| `gpa_range` | `text` | Optional |
| `academic_tier` | `text` | Optional |
| `dream_school` | `text` | Optional |
| `preferred_regions` | `text[]` | Defaults to empty array |
| `distance_preference` | `text` | Optional |
| `search_preference` | `text` | Optional |
| `city` | `text` | Optional |
| `state` | `text` | Optional |
| `zip_code` | `text` | Optional |
| `latitude` | `numeric` | Optional |
| `longitude` | `numeric` | Optional |
| `voice_profile` | `text` | Optional |
| `onboarding_completed` | `boolean` | Defaults to `false` |
| `weeks_active` | `integer` | Defaults to `0` |
| `actions_completed` | `integer` | Defaults to `0` |
| `metrics_count` | `integer` | Defaults to `0` |
| `dashboard_unlocked_at` | `timestamptz` | Optional |
| `last_active_at` | `timestamptz` | Optional |
| `created_at` | `timestamptz` | Defaults to `now()` |
| `updated_at` | `timestamptz` | Defaults to `now()`, trigger-managed |

## RLS

`public.athletes` has row-level security enabled with self-only CRUD policies keyed on `auth.uid()`.
