---
name: supabase-architect
description: Use this skill when architecting database schemas, writing migrations, or configuring RLS.
---
# Supabase Architect Skill
This skill guides the creation of database schemas, security policies, and edge functions.

## Decision Tree

### 1. Creating Tables
- [ ] **Check Normalization**: maximize 3rd Normal Form.
- [ ] **Idempotency**: Ensure all migrations are idempotent (use `IF NOT EXISTS`).
- [ ] **Timestamps**: Include `created_at` and `updated_at` (with triggers) by default.

### 2. Defining Policies (RLS)
> [!IMPORTANT]
> **MANDATORY**: You MUST load and read `standards/references/supabase-security.md` before defining any policy.

- [ ] **Enable RLS**: `ALTER TABLE x ENABLE ROW LEVEL SECURITY;`
- [ ] **Specific Policies**: Create separate policies for SELECT, INSERT, UPDATE, DELETE.
- [ ] **Documentation**:
    ```sql
    -- POLICY: Allow users to view their own profile
    -- REASON: Privacy compliance, users should not see others' PII.
    CREATE POLICY "..." ON ...
    ```

### 3. Writing Edge Functions
- [ ] **Error Handling**: Wrap ALL logic in `try/catch` blocks.
- [ ] **Response Format**: Return standardized JSON error responses.
- [ ] **Environment Variables**: Never hardcode secrets; use `Deno.env.get()`.
