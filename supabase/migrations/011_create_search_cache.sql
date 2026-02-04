-- Migration: Create search_cache table
-- Phase 3: Performance & Optimization

CREATE TABLE IF NOT EXISTS public.search_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    query_key TEXT NOT NULL,
    results JSONB NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, query_key)
);

-- Note: RLS is enabled and configured in migration 012_security_audit.sql
