import { getSportSchema, getCanonicalPosition, derivePositionGroup } from '../config/sportSchema';

export const normalizeText = (value) => {
    if (value === null || value === undefined) return '';
    return value.toString().trim().replace(/\s+/g, ' ');
};

export const normalizePositionInput = (value) => {
    const normalized = normalizeText(value);
    if (!normalized) return '';
    if (/^[0-9]{1,2}[a-zA-Z]$/.test(normalized)) return normalized.toUpperCase();
    if (/^[A-Za-z]{1,3}$/.test(normalized)) return normalized.toUpperCase();
    return normalized;
};

export const normalizeMetricKey = (value) => {
    if (!value) return '';
    return value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
};

export const normalizeUnit = (value) => {
    const normalized = normalizeText(value);
    if (!normalized) return null;
    return normalized.toLowerCase();
};

const POSITION_FALLBACKS = [
    { pattern: /\b(pitcher|pitching|p)\b/i, canonical: 'P' },
    { pattern: /\b(catcher|catching|c)\b/i, canonical: 'C' },
    { pattern: /\b(short\s*stop|shortstop|ss)\b/i, canonical: 'SS' },
    { pattern: /\b(1b|1st\s*base|first\s*base)\b/i, canonical: '1B' },
    { pattern: /\b(2b|2nd\s*base|second\s*base)\b/i, canonical: '2B' },
    { pattern: /\b(3b|3rd\s*base|third\s*base)\b/i, canonical: '3B' },
    { pattern: /\b(left\s*field|lf)\b/i, canonical: 'LF' },
    { pattern: /\b(center\s*field|cf)\b/i, canonical: 'CF' },
    { pattern: /\b(right\s*field|rf)\b/i, canonical: 'RF' },
    { pattern: /\b(outfield|of)\b/i, canonical: 'OF' },
    { pattern: /\b(infield|if)\b/i, canonical: 'IF' },
    { pattern: /\b(utility|ut)\b/i, canonical: 'UT' },
    { pattern: /\b(goalkeeper|keeper|gk)\b/i, canonical: 'GK' },
    { pattern: /\b(forward|striker|f)\b/i, canonical: 'F' },
    { pattern: /\b(midfielder|midfield|m)\b/i, canonical: 'M' },
    { pattern: /\b(defender|defense|d)\b/i, canonical: 'D' },
    { pattern: /\b(point\s*guard|pg)\b/i, canonical: 'PG' },
    { pattern: /\b(shooting\s*guard|sg)\b/i, canonical: 'SG' },
    { pattern: /\b(small\s*forward|sf)\b/i, canonical: 'SF' },
    { pattern: /\b(power\s*forward|pf)\b/i, canonical: 'PF' },
    { pattern: /\b(center|c)\b/i, canonical: 'C' },
    { pattern: /\b(quarterback|qb)\b/i, canonical: 'QB' },
    { pattern: /\b(running\s*back|rb)\b/i, canonical: 'RB' },
    { pattern: /\b(wide\s*receiver|wr)\b/i, canonical: 'WR' },
    { pattern: /\b(defensive\s*back|db|corner|cornerback|safety)\b/i, canonical: 'DB' },
    { pattern: /\b(linebacker|lb)\b/i, canonical: 'LB' },
    { pattern: /\b(tight\s*end|te)\b/i, canonical: 'TE' },
    { pattern: /\b(offensive\s*line|offensive\s*lineman|ol)\b/i, canonical: 'OL' },
    { pattern: /\b(defensive\s*line|defensive\s*lineman|dl)\b/i, canonical: 'DL' },
    { pattern: /\b(kicker|k)\b/i, canonical: 'K' },
    { pattern: /\b(punter|p)\b/i, canonical: 'P' },
    { pattern: /\b(long\s*snapper|ls)\b/i, canonical: 'LS' }
];

export const mapPositionToCanonical = (sport, positionInput) => {
    const schema = getSportSchema(sport);
    if (!schema || !positionInput) return null;
    const normalized = normalizePositionInput(positionInput).toLowerCase();

    if (schema.positionAliases[normalized]) return schema.positionAliases[normalized];

    const raw = normalizeText(positionInput);
    if (schema.positionAliases[raw]) return schema.positionAliases[raw];
    if (schema.positionAliases[raw.toLowerCase()]) return schema.positionAliases[raw.toLowerCase()];

    const fallback = POSITION_FALLBACKS.find(entry => entry.pattern.test(raw));
    if (fallback && schema.positionToGroup[fallback.canonical]) return fallback.canonical;

    return null;
};

export const mapCanonicalToGroup = (sport, canonicalPosition) => {
    const schema = getSportSchema(sport);
    if (!schema || !canonicalPosition) return null;
    return schema.positionToGroup[canonicalPosition] || null;
};

export const logSamplePositionMappings = (sport = 'Softball', inputs = [
    '3B', 'Third Base', 'third base', 'SS', 'short stop', 'P', 'Pitcher', 'Catcher', 'OF', 'Outfield', 'IF', 'Infield'
]) => {
    if (!import.meta.env?.DEV) return;
    const rows = inputs.map(input => {
        const canonical = mapPositionToCanonical(sport, input);
        return {
            input,
            canonical,
            group: mapCanonicalToGroup(sport, canonical)
        };
    });
    console.group(`[normalize] Position mappings for ${sport}`);
    console.table(rows);
    console.groupEnd();
};
