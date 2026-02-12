-- Migration: Normalize athlete positions and measurable metrics

-- 1) Add canonical position fields to athletes
ALTER TABLE public.athletes
ADD COLUMN IF NOT EXISTS primary_position_display TEXT,
ADD COLUMN IF NOT EXISTS position_canonical TEXT,
ADD COLUMN IF NOT EXISTS position_group TEXT;

-- Backfill display from legacy position
UPDATE public.athletes
SET primary_position_display = COALESCE(primary_position_display, position)
WHERE position IS NOT NULL;

-- 2) Add canonical metric/unit fields to athlete_measurables
ALTER TABLE public.athlete_measurables
ADD COLUMN IF NOT EXISTS metric_canonical TEXT,
ADD COLUMN IF NOT EXISTS unit_canonical TEXT;

-- 3) Backfill canonical position fields using embedded mappings
UPDATE public.athletes
SET position_canonical = CASE
    WHEN sport ILIKE 'softball' THEN CASE
        WHEN position ~* '\b(pitcher|pitching|p)\b' THEN 'P'
        WHEN position ~* '\b(catcher|catching|c)\b' THEN 'C'
        WHEN position ~* '\b(1b|1st\s*base|first\s*base)\b' THEN '1B'
        WHEN position ~* '\b(2b|2nd\s*base|second\s*base)\b' THEN '2B'
        WHEN position ~* '\b(3b|3rd\s*base|third\s*base)\b' THEN '3B'
        WHEN position ~* '\b(ss|short\s*stop|shortstop)\b' THEN 'SS'
        WHEN position ~* '\b(lf|left\s*field)\b' THEN 'LF'
        WHEN position ~* '\b(cf|center\s*field|centre\s*field)\b' THEN 'CF'
        WHEN position ~* '\b(rf|right\s*field)\b' THEN 'RF'
        WHEN position ~* '\b(outfield|of)\b' THEN 'OF'
        WHEN position ~* '\b(utility|util)\b' THEN 'UTIL'
        ELSE NULL
    END
    WHEN sport ILIKE 'baseball' THEN CASE
        WHEN position ~* '\b(pitcher|pitching|p)\b' THEN 'P'
        WHEN position ~* '\b(catcher|catching|c)\b' THEN 'C'
        WHEN position ~* '\b(1b|1st\s*base|first\s*base)\b' THEN '1B'
        WHEN position ~* '\b(2b|2nd\s*base|second\s*base)\b' THEN '2B'
        WHEN position ~* '\b(3b|3rd\s*base|third\s*base)\b' THEN '3B'
        WHEN position ~* '\b(ss|short\s*stop|shortstop)\b' THEN 'SS'
        WHEN position ~* '\b(lf|left\s*field)\b' THEN 'LF'
        WHEN position ~* '\b(cf|center\s*field|centre\s*field)\b' THEN 'CF'
        WHEN position ~* '\b(rf|right\s*field)\b' THEN 'RF'
        WHEN position ~* '\b(outfield|of)\b' THEN 'OF'
        WHEN position ~* '\b(utility|util)\b' THEN 'UTIL'
        ELSE NULL
    END
    WHEN sport ILIKE 'football' THEN CASE
        WHEN position ~* '\b(qb|quarterback)\b' THEN 'QB'
        WHEN position ~* '\b(rb|running\s*back)\b' THEN 'RB'
        WHEN position ~* '\b(wr|wide\s*receiver|receiver)\b' THEN 'WR'
        WHEN position ~* '\b(te|tight\s*end)\b' THEN 'TE'
        WHEN position ~* '\b(ol|offensive\s*line|offensive\s*lineman)\b' THEN 'OL'
        WHEN position ~* '\b(dl|defensive\s*line|defensive\s*lineman)\b' THEN 'DL'
        WHEN position ~* '\b(lb|linebacker)\b' THEN 'LB'
        WHEN position ~* '\b(db|defensive\s*back|corner|cornerback|safety)\b' THEN 'DB'
        WHEN position ~* '\b(k|kicker)\b' THEN 'K'
        WHEN position ~* '\b(p|punter)\b' THEN 'P'
        WHEN position ~* '\b(ls|long\s*snapper)\b' THEN 'LS'
        ELSE NULL
    END
    WHEN sport ILIKE 'soccer' THEN CASE
        WHEN position ~* '\b(gk|goalkeeper|keeper)\b' THEN 'GK'
        WHEN position ~* '\b(cb|center\s*back|centre\s*back)\b' THEN 'CB'
        WHEN position ~* '\b(fb|full\s*back|fullback|outside\s*back)\b' THEN 'FB'
        WHEN position ~* '\b(dm|defensive\s*mid|defensive\s*midf|cdm|holding\s*mid)\b' THEN 'DM'
        WHEN position ~* '\b(cm|center\s*mid|centre\s*mid|central\s*mid)\b' THEN 'CM'
        WHEN position ~* '\b(am|attacking\s*mid|attacking\s*midfielder|cam)\b' THEN 'AM'
        WHEN position ~* '\b(w|wing|winger)\b' THEN 'W'
        WHEN position ~* '\b(st|striker|forward)\b' THEN 'ST'
        ELSE NULL
    END
    WHEN sport ILIKE 'basketball' THEN CASE
        WHEN position ~* '\b(pg|point\s*guard|point)\b' THEN 'PG'
        WHEN position ~* '\b(sg|shooting\s*guard|shooting)\b' THEN 'SG'
        WHEN position ~* '\b(sf|small\s*forward)\b' THEN 'SF'
        WHEN position ~* '\b(pf|power\s*forward)\b' THEN 'PF'
        WHEN position ~* '\b(c|center)\b' THEN 'C'
        ELSE NULL
    END
    ELSE NULL
END
WHERE position IS NOT NULL
  AND position_canonical IS NULL;

UPDATE public.athletes
SET position_group = CASE
    WHEN sport ILIKE 'softball' THEN CASE
        WHEN position_canonical IN ('P') THEN 'P'
        WHEN position_canonical IN ('C') THEN 'C'
        WHEN position_canonical IN ('1B','2B','SS','3B','UTIL') THEN 'IF'
        WHEN position_canonical IN ('LF','CF','RF','OF') THEN 'OF'
        ELSE NULL
    END
    WHEN sport ILIKE 'baseball' THEN CASE
        WHEN position_canonical IN ('P') THEN 'P'
        WHEN position_canonical IN ('C') THEN 'C'
        WHEN position_canonical IN ('1B','2B','SS','3B','UTIL') THEN 'IF'
        WHEN position_canonical IN ('LF','CF','RF','OF') THEN 'OF'
        ELSE NULL
    END
    WHEN sport ILIKE 'football' THEN CASE
        WHEN position_canonical = 'QB' THEN 'QB'
        WHEN position_canonical IN ('RB','WR') THEN 'SKILL'
        WHEN position_canonical IN ('TE','OL','DL') THEN 'BIG'
        WHEN position_canonical = 'DB' THEN 'DB'
        WHEN position_canonical = 'LB' THEN 'LB'
        WHEN position_canonical IN ('K','P','LS') THEN 'ST'
        ELSE NULL
    END
    WHEN sport ILIKE 'soccer' THEN CASE
        WHEN position_canonical = 'GK' THEN 'GK'
        WHEN position_canonical IN ('CB','FB','DM','CM','AM','W','ST') THEN 'FIELD'
        ELSE NULL
    END
    WHEN sport ILIKE 'basketball' THEN CASE
        WHEN position_canonical IN ('PG','SG') THEN 'GUARD'
        WHEN position_canonical IN ('SF') THEN 'WING'
        WHEN position_canonical IN ('PF','C') THEN 'BIG'
        ELSE NULL
    END
    ELSE NULL
END
WHERE position_canonical IS NOT NULL
  AND position_group IS NULL;

-- 4) Backfill canonical metric/unit fields
UPDATE public.athlete_measurables
SET metric_canonical = CASE
        WHEN metric IS NULL THEN NULL
        ELSE regexp_replace(lower(replace(replace(trim(metric), ' ', '_'), '-', '_')), '[^a-z0-9_]', '', 'g')
    END,
    unit_canonical = CASE
        WHEN unit IS NULL OR trim(unit) = '' THEN NULL
        ELSE lower(trim(unit))
    END
WHERE metric_canonical IS NULL OR unit_canonical IS NULL;

-- 5) Indexes
CREATE INDEX IF NOT EXISTS idx_athletes_sport_position_group ON public.athletes (sport, position_group);
CREATE INDEX IF NOT EXISTS idx_measurables_athlete_sport_metric ON public.athlete_measurables (athlete_id, sport, metric_canonical, measured_at DESC);

-- 6) CHECK constraints (not validated to avoid blocking existing data)
ALTER TABLE public.athlete_measurables
ADD CONSTRAINT athlete_measurables_metric_canonical_format
CHECK (metric_canonical ~ '^[a-z0-9_]+$') NOT VALID;

ALTER TABLE public.athlete_measurables
ADD CONSTRAINT athlete_measurables_unit_canonical_format
CHECK (unit_canonical IS NULL OR unit_canonical ~ '^[a-z]+$') NOT VALID;
