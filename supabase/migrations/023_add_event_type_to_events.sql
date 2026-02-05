-- Migration: Add event_type to events table
-- Description: Adds event_type column to public.events for category-based filtering and research.

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS event_type TEXT;
