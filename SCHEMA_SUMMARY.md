# RecruitCoS Database Schema Summary (Standardized)

This document provides the consolidated schema for the core tables in the Recruiting Compass application.

> [!IMPORTANT]
> The schema has been standardized on **UUIDs**. All `athlete_id` columns now reference `athletes.id` (UUID), which aligns with the Supabase Auth UUID. Clerk-specific dependencies (`user_id`) have been removed.

---

### 1. athletes
Stores core athlete profile information.

| Column Name | Data Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| **id** | UUID | No | **Primary Key (Matches Supabase Auth UUID)** |
| name | TEXT | No | |
| first_name | TEXT | Yes | |
| last_name | TEXT | Yes | |
| grad_year | INTEGER | Yes | |
| sport | TEXT | Yes | |
| position | TEXT | Yes | |
| city | TEXT | Yes | Primary location field |
| state | TEXT | Yes | Primary location field |
| gpa | DECIMAL(3,2) | Yes | |
| academic_tier | TEXT | Yes | |
| dream_school | TEXT | Yes | |
| target_divisions | TEXT[] | Yes | Array of D1, D2, etc. |
| onboarding_completed | BOOLEAN | Yes | |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

---

### 2. coaches
Library of college coaches.

| Column Name | Data Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| id | UUID | No | |
| name | TEXT | No | |
| school | TEXT | No | |
| division | TEXT | No | |
| conference | TEXT | Yes | |
| sport | TEXT | No | |

---

### 3. athlete_saved_schools
Schools saved by athletes to their "My List".

| Column Name | Data Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| id | UUID | No | |
| **athlete_id** | UUID | No | **FK to athletes.id (ON DELETE CASCADE)** |
| school_name | TEXT | No | |
| category | TEXT | No | reach, target, solid |
| gpa | DECIMAL(3,2) | Yes | |
| insight | TEXT | Yes | AI generated insight |

---

### 4. athlete_interactions
Logs of contacts between athletes and coaches/schools.

| Column Name | Data Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| id | UUID | No | |
| **athlete_id** | UUID | No | **FK to athletes.id (ON DELETE CASCADE)** |
| school_id | UUID | Yes | |
| coach_id | UUID | Yes | |
| type | TEXT | No | |

---

### 5. posts
Recruiting updates and AI-generated social media drafts.

| Column Name | Data Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| id | UUID | No | |
| **athlete_id** | UUID | No | **FK to athletes.id (ON DELETE CASCADE)** |
| event_id | UUID | Yes | |
| post_text | TEXT | No | |

---

### 6. events
Athletic performances recorded by athletes.

| Column Name | Data Type | Nullable | Notes |
| :--- | :--- | :--- | :--- |
| id | UUID | No | |
| **athlete_id** | UUID | No | **FK to athletes.id (ON DELETE CASCADE)** |
| event_name | TEXT | No | |
| performance | TEXT | Yes | |
| event_date | DATE | No | |
