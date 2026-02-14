const EARTH_RADIUS_MILES = 3959;

export const MATCH_CATEGORY_COLORS = {
    SAFETY: '#059669',
    TARGET: '#8B2635',
    REACH: '#F59E0B',
    DREAM: '#DC2626'
};

export const TIER_DIFFICULTY = {
    d1_top25: 95,
    d1_power5: 85,
    d1_mid_major: 70,
    d2_high: 60,
    d2_low: 50,
    d3: 40,
    naia: 35,
    juco: 30
};

const STATE_CENTROIDS = {
    AL: { latitude: 32.806671, longitude: -86.79113 },
    AZ: { latitude: 33.729759, longitude: -111.431221 },
    AR: { latitude: 34.969704, longitude: -92.373123 },
    CA: { latitude: 36.116203, longitude: -119.681564 },
    CO: { latitude: 39.059811, longitude: -105.311104 },
    CT: { latitude: 41.597782, longitude: -72.755371 },
    DE: { latitude: 39.318523, longitude: -75.507141 },
    FL: { latitude: 27.766279, longitude: -81.686783 },
    GA: { latitude: 33.040619, longitude: -83.643074 },
    IA: { latitude: 42.011539, longitude: -93.210526 },
    ID: { latitude: 44.240459, longitude: -114.478828 },
    IL: { latitude: 40.349457, longitude: -88.986137 },
    IN: { latitude: 39.849426, longitude: -86.258278 },
    KS: { latitude: 38.5266, longitude: -96.726486 },
    KY: { latitude: 37.66814, longitude: -84.670067 },
    LA: { latitude: 31.169546, longitude: -91.867805 },
    MA: { latitude: 42.230171, longitude: -71.530106 },
    MD: { latitude: 39.063946, longitude: -76.802101 },
    ME: { latitude: 44.693947, longitude: -69.381927 },
    MI: { latitude: 43.326618, longitude: -84.536095 },
    MN: { latitude: 45.694454, longitude: -93.900192 },
    MO: { latitude: 38.456085, longitude: -92.288368 },
    MS: { latitude: 32.741646, longitude: -89.678696 },
    MT: { latitude: 46.921925, longitude: -110.454353 },
    NC: { latitude: 35.630066, longitude: -79.806419 },
    ND: { latitude: 47.528912, longitude: -99.784012 },
    NE: { latitude: 41.12537, longitude: -98.268082 },
    NH: { latitude: 43.452492, longitude: -71.563896 },
    NJ: { latitude: 40.298904, longitude: -74.521011 },
    NM: { latitude: 34.840515, longitude: -106.248482 },
    NV: { latitude: 38.313515, longitude: -117.055374 },
    NY: { latitude: 42.165726, longitude: -74.948051 },
    OH: { latitude: 40.388783, longitude: -82.764915 },
    OK: { latitude: 35.565342, longitude: -96.928917 },
    OR: { latitude: 44.572021, longitude: -122.070938 },
    PA: { latitude: 40.590752, longitude: -77.209755 },
    RI: { latitude: 41.680893, longitude: -71.51178 },
    SC: { latitude: 33.856892, longitude: -80.945007 },
    SD: { latitude: 44.299782, longitude: -99.438828 },
    TN: { latitude: 35.747845, longitude: -86.692345 },
    TX: { latitude: 31.054487, longitude: -97.563461 },
    UT: { latitude: 40.150032, longitude: -111.862434 },
    VA: { latitude: 37.769337, longitude: -78.169968 },
    VT: { latitude: 44.045876, longitude: -72.710686 },
    WA: { latitude: 47.400902, longitude: -121.490494 },
    WI: { latitude: 44.268543, longitude: -89.616508 },
    WV: { latitude: 38.491226, longitude: -80.954453 },
    WY: { latitude: 42.755966, longitude: -107.30249 }
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function safeNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function normalizeCoordinate(value, maxAbs) {
    const parsed = safeNumber(value);
    if (parsed === null) return null;
    if (Math.abs(parsed) <= maxAbs) return parsed;

    let normalized = parsed;
    // Handle mis-scaled values (e.g., 359606 -> 35.9606).
    while (Math.abs(normalized) > maxAbs && Math.abs(normalized) > maxAbs * 10) {
        normalized /= 10;
    }

    if (Math.abs(normalized) <= maxAbs) return normalized;
    return null;
}

export function normalizeLatitude(value) {
    return normalizeCoordinate(value, 90);
}

export function normalizeLongitude(value) {
    return normalizeCoordinate(value, 180);
}

/**
 * Returns geographic centroid coordinates for a U.S. state abbreviation.
 */
export function getStateCentroid(state) {
    const normalizedState = String(state || '').trim().toUpperCase();
    return STATE_CENTROIDS[normalizedState] || null;
}

/**
 * Calculates great-circle distance between two coordinate pairs in miles.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const sourceLat = normalizeLatitude(lat1);
    const sourceLon = normalizeLongitude(lon1);
    const targetLat = normalizeLatitude(lat2);
    const targetLon = normalizeLongitude(lon2);

    if ([sourceLat, sourceLon, targetLat, targetLon].some((value) => value === null)) {
        return 0;
    }

    const deltaLat = (targetLat - sourceLat) * Math.PI / 180;
    const deltaLon = (targetLon - sourceLon) * Math.PI / 180;

    const lat1Rad = sourceLat * Math.PI / 180;
    const lat2Rad = targetLat * Math.PI / 180;

    const a = (
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
        + Math.cos(lat1Rad) * Math.cos(lat2Rad)
        * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
    );

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(EARTH_RADIUS_MILES * c);
}

/**
 * Scores athletic fit by combining school tier difficulty and benchmark comparisons.
 */
export function calculateAthleticFit(athleteStats, schoolBenchmarks, schoolTier) {
    const tierKey = String(schoolTier || '').toLowerCase();
    const tierDifficulty = TIER_DIFFICULTY[tierKey] || 50;

    // Harder tiers start from a lower baseline to avoid false optimism.
    let athleticScore = 50 - Math.round((tierDifficulty - 50) * 0.35);

    const athleteDash = safeNumber(athleteStats?.sixty_yard_dash);
    const benchmarkDash = safeNumber(schoolBenchmarks?.avg_sixty_yard_dash);
    if (athleteDash !== null && benchmarkDash !== null) {
        const dashDiff = athleteDash - benchmarkDash;
        if (dashDiff <= -0.3) athleticScore += 25;
        else if (dashDiff <= 0) athleticScore += 15;
        else if (dashDiff <= 0.3) athleticScore += 5;
        else athleticScore -= 10;
    }

    const athleteJump = safeNumber(athleteStats?.vertical_jump);
    const benchmarkJump = safeNumber(schoolBenchmarks?.avg_vertical_jump);
    if (athleteJump !== null && benchmarkJump !== null) {
        const jumpDiff = athleteJump - benchmarkJump;
        if (jumpDiff >= 4) athleticScore += 25;
        else if (jumpDiff >= 0) athleticScore += 15;
        else if (jumpDiff >= -2) athleticScore += 5;
        else athleticScore -= 10;
    }

    if (athleteStats?.recent_stats) {
        athleticScore += 5;
    }

    return clamp(Math.round(athleticScore), 0, 100);
}

/**
 * Scores geographic fit by travel distance with a bonus for known recruiting footprint.
 */
export function calculateGeographicFit(userLocation, schoolLocation, recruitsRegion) {
    const distance = calculateDistance(
        userLocation?.latitude,
        userLocation?.longitude,
        schoolLocation?.latitude,
        schoolLocation?.longitude
    );

    let geoScore = 100;
    if (distance > 300) geoScore = 70;
    if (distance > 500) geoScore = 40;
    if (distance > 800) geoScore = 20;

    if (recruitsRegion) {
        geoScore = Math.min(100, geoScore + 20);
    }

    return geoScore;
}

/**
 * Scores academic fit against school GPA benchmarks.
 */
export function calculateAcademicFit(athleteGpa, schoolBenchmarkGpa) {
    const athlete = safeNumber(athleteGpa);
    const benchmark = safeNumber(schoolBenchmarkGpa);

    if (athlete === null && benchmark === null) return 65;
    if (athlete !== null && benchmark === null) return athlete >= 3.5 ? 85 : athlete >= 3.0 ? 72 : 58;
    if (athlete === null && benchmark !== null) return benchmark <= 3.2 ? 72 : 58;

    const diff = athlete - benchmark;
    if (diff >= 0.3) return 92;
    if (diff >= 0.1) return 82;
    if (diff >= -0.1) return 72;
    if (diff >= -0.3) return 58;
    return 42;
}

/**
 * Estimates financial fit from school cost and available athlete profile context.
 */
export function calculateFinancialFit(athleteProfile, schoolCostOfAttendance) {
    const cost = safeNumber(schoolCostOfAttendance);
    if (cost === null) return 65;

    let score;
    if (cost <= 25000) score = 88;
    else if (cost <= 40000) score = 74;
    else if (cost <= 55000) score = 58;
    else score = 42;

    const athleteGpa = safeNumber(athleteProfile?.gpa);
    if (athleteGpa !== null && athleteGpa >= 3.7) {
        score += 6;
    }

    return clamp(score, 0, 100);
}

/**
 * Combines fit dimensions into an overall 0-100 match score.
 */
export function calculateOverallMatch(athleticFit, geographicFit, academicFit, financialFit) {
    return Math.round(
        athleticFit * 0.5
        + geographicFit * 0.2
        + academicFit * 0.15
        + financialFit * 0.15
    );
}

/**
 * Converts overall score into recruiting posture categories.
 */
export function categorizeMatch(overallScore) {
    if (overallScore >= 80) return 'SAFETY';
    if (overallScore >= 60) return 'TARGET';
    if (overallScore >= 40) return 'REACH';
    return 'DREAM';
}

/**
 * Generates structured pivot guidance for long-shot dream schools.
 */
export function generatePivotSuggestions(dreamSchool, matchScore) {
    if (matchScore >= 60) return null;

    const tier = String(dreamSchool?.tier || '').toLowerCase();
    const schoolName = dreamSchool?.name || 'This school';

    const pivots = {
        message: `${schoolName} can stay on your list, but this profile is currently a long shot. Build parallel options now.`,
        alternativesHeading: 'Recommended alternatives with stronger fit right now',
        recommendedTiers: ['d1_mid_major', 'd2_high', 'd3'],
        safetyNet: {
            message: 'If traction is limited by junior year, pivot to:',
            options: [
                'Programs where your current measurables align with the median recruit.',
                'Regional programs that recruit heavily from your state.',
                'Academic-forward options with coach communication upside.'
            ]
        }
    };

    if (tier === 'd1_top25') {
        pivots.message = `${schoolName} is a true dream. Keep it, but pair it with realistic options where your odds are materially better.`;
        pivots.recommendedTiers = ['d1_power5', 'd1_mid_major', 'd2_high'];
    } else if (tier === 'd1_power5') {
        pivots.message = `${schoolName} is possible but currently high-risk. Add balanced options with clearer fit signals.`;
        pivots.recommendedTiers = ['d1_mid_major', 'd2_high', 'd3'];
    } else if (tier === 'd1_mid_major') {
        pivots.message = `${schoolName} is a stretch today. Add schools where your match profile lands in target/safety territory.`;
        pivots.recommendedTiers = ['d2_high', 'd2_low', 'd3'];
    }

    return pivots;
}
