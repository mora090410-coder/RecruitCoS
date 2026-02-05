const DEFAULT_TARGET_LEVELS = ['D1-top', 'D1-mid', 'D2', 'D3', 'NAIA', 'JUCO'];

const normalizeSportKey = (sport) => {
    if (!sport) return '';
    return sport.toString().trim().toLowerCase();
};

export const normalizeMetric = (value) => {
    if (!value) return '';
    return value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^\w\s/]+/g, '')
        .replace(/\s+/g, ' ');
};

const baseballSoftballPositions = {
    P: ['p', 'pitcher', 'pitching'],
    C: ['c', 'catcher'],
    '1B': ['1b', '1st base', 'first base'],
    '2B': ['2b', '2nd base', 'second base'],
    '3B': ['3b', '3rd base', 'third base'],
    SS: ['ss', 'shortstop', 'short stop'],
    LF: ['lf', 'left field', 'leftfielder'],
    CF: ['cf', 'center field', 'centerfielder'],
    RF: ['rf', 'right field', 'rightfielder'],
    IF: ['if', 'infield', 'middle infield', 'mi'],
    OF: ['of', 'outfield'],
    UT: ['ut', 'utility', 'super utility']
};

const buildPositionAliases = (map) => {
    const aliases = {};
    Object.entries(map).forEach(([canonical, list]) => {
        list.forEach((value) => {
            aliases[value] = canonical;
        });
        aliases[canonical.toLowerCase()] = canonical;
        aliases[canonical] = canonical;
    });
    return aliases;
};

const baseballSoftballAliases = buildPositionAliases(baseballSoftballPositions);

const baseballSoftballPositionToGroup = {
    P: 'P',
    C: 'C',
    '1B': 'IF',
    '2B': 'IF',
    '3B': 'IF',
    SS: 'IF',
    IF: 'IF',
    OF: 'OF',
    LF: 'OF',
    CF: 'OF',
    RF: 'OF',
    UT: 'IF'
};

const defaultInputs = {
    speed: { min: 0, max: 15, step: 0.01 },
    velocity: { min: 0, max: 120, step: 0.1 },
    jump: { min: 0, max: 60, step: 0.1 },
    reps: { min: 0, max: 60, step: 1 },
    level: { min: 0, max: 30, step: 0.1 }
};

export const SPORT_SCHEMA = {
    softball: {
        positionAliases: baseballSoftballAliases,
        positionLabels: {
            P: 'Pitcher',
            C: 'Catcher',
            '1B': 'First Base',
            '2B': 'Second Base',
            '3B': 'Third Base',
            SS: 'Shortstop',
            LF: 'Left Field',
            CF: 'Center Field',
            RF: 'Right Field',
            IF: 'Infield',
            OF: 'Outfield',
            UT: 'Utility'
        },
        positionToGroup: baseballSoftballPositionToGroup,
        positionGroups: ['P', 'C', 'IF', 'OF'],
        metrics: [
            { key: 'pop_time', label: 'Pop Time', unit: 's', direction: 'lower_better', appliesToGroups: ['C'], weightDefault: 5, input: defaultInputs.speed },
            { key: 'throw_velocity', label: 'Throw Velocity', unit: 'mph', direction: 'higher_better', appliesToGroups: ['C', 'IF', 'OF'], weightDefault: 5, input: defaultInputs.velocity },
            { key: 'home_to_first', label: 'Home to First', unit: 's', direction: 'lower_better', appliesToGroups: ['IF', 'OF'], weightDefault: 5, input: defaultInputs.speed },
            { key: 'pitch_velocity', label: 'Pitch Velocity', unit: 'mph', direction: 'higher_better', appliesToGroups: ['P'], weightDefault: 5, input: defaultInputs.velocity }
        ],
        metricAliases: {
            pop_time: ['pop', 'pop time'],
            throw_velocity: ['throw velo', 'throwing velo', 'throw vel'],
            home_to_first: ['home to 1st', 'home_to_1st', 'home to first'],
            pitch_velocity: ['pitch velo', 'pitching velo']
        },
        defaultTargetLevels: DEFAULT_TARGET_LEVELS
    },
    baseball: {
        positionAliases: baseballSoftballAliases,
        positionLabels: {
            P: 'Pitcher',
            C: 'Catcher',
            '1B': 'First Base',
            '2B': 'Second Base',
            '3B': 'Third Base',
            SS: 'Shortstop',
            LF: 'Left Field',
            CF: 'Center Field',
            RF: 'Right Field',
            IF: 'Infield',
            OF: 'Outfield',
            UT: 'Utility'
        },
        positionToGroup: baseballSoftballPositionToGroup,
        positionGroups: ['P', 'C', 'IF', 'OF'],
        metrics: [
            { key: 'pop_time', label: 'Pop Time', unit: 's', direction: 'lower_better', appliesToGroups: ['C'], weightDefault: 5, input: defaultInputs.speed },
            { key: 'throw_velocity', label: 'Throw Velocity', unit: 'mph', direction: 'higher_better', appliesToGroups: ['C', 'IF', 'OF'], weightDefault: 5, input: defaultInputs.velocity },
            { key: 'exit_velocity', label: 'Exit Velocity', unit: 'mph', direction: 'higher_better', appliesToGroups: ['IF', 'OF'], weightDefault: 5, input: defaultInputs.velocity },
            { key: 'sixty_time', label: '60 Time', unit: 's', direction: 'lower_better', appliesToGroups: ['IF', 'OF'], weightDefault: 5, input: defaultInputs.speed },
            { key: 'pitch_velocity', label: 'Pitch Velocity', unit: 'mph', direction: 'higher_better', appliesToGroups: ['P'], weightDefault: 5, input: defaultInputs.velocity }
        ],
        metricAliases: {
            pop_time: ['pop', 'pop time'],
            throw_velocity: ['throw velo', 'throwing velo', 'throw vel'],
            exit_velocity: ['exit velo', 'exit vel'],
            sixty_time: ['60', '60 time', 'sixty', 'sixty time'],
            pitch_velocity: ['pitch velo', 'pitching velo']
        },
        defaultTargetLevels: DEFAULT_TARGET_LEVELS
    },
    football: {
        positionAliases: buildPositionAliases({
            QB: ['qb', 'quarterback'],
            RB: ['rb', 'running back', 'runningback'],
            WR: ['wr', 'wide receiver', 'receiver'],
            DB: ['db', 'defensive back', 'corner', 'cornerback', 'safety'],
            LB: ['lb', 'linebacker'],
            TE: ['te', 'tight end'],
            OL: ['ol', 'offensive line', 'offensive lineman'],
            DL: ['dl', 'defensive line', 'defensive lineman'],
            K: ['k', 'kicker'],
            P: ['p', 'punter'],
            LS: ['ls', 'long snapper']
        }),
        positionToGroup: {
            QB: 'QB',
            RB: 'RB',
            WR: 'WR/DB',
            DB: 'WR/DB',
            LB: 'LB',
            TE: 'RB',
            OL: 'OL/DL',
            DL: 'OL/DL',
            K: 'Specialists',
            P: 'Specialists',
            LS: 'Specialists'
        },
        positionLabels: {
            QB: 'Quarterback',
            RB: 'Running Back',
            WR: 'Wide Receiver',
            DB: 'Defensive Back',
            LB: 'Linebacker',
            TE: 'Tight End',
            OL: 'Offensive Line',
            DL: 'Defensive Line',
            K: 'Kicker',
            P: 'Punter',
            LS: 'Long Snapper'
        },
        positionGroups: ['QB', 'RB', 'WR/DB', 'LB', 'OL/DL', 'Specialists'],
        metrics: [
            { key: 'throw_velocity', label: 'Throw Velocity', unit: 'mph', direction: 'higher_better', appliesToGroups: ['QB'], weightDefault: 5, input: defaultInputs.velocity },
            { key: 'forty_time', label: '40 Time', unit: 's', direction: 'lower_better', appliesToGroups: ['RB', 'WR/DB', 'LB', 'OL/DL'], weightDefault: 5, input: defaultInputs.speed },
            { key: 'shuttle', label: 'Shuttle', unit: 's', direction: 'lower_better', appliesToGroups: ['RB', 'WR/DB', 'LB', 'OL/DL'], weightDefault: 5, input: defaultInputs.speed },
            { key: 'bench_reps', label: 'Bench Reps (225)', unit: 'reps', direction: 'higher_better', appliesToGroups: ['OL/DL', 'LB'], weightDefault: 5, input: defaultInputs.reps }
        ],
        metricAliases: {
            throw_velocity: ['throw velo', 'throwing velo', 'throw vel'],
            forty_time: ['40', '40 yd', '40 yard', '40-yard', 'forty', '40 time', '40 yd dash', 'forty_yard_dash', 'forty time'],
            shuttle: ['pro agility', 'pro_agility_shuttle', 'shuttle', 'shuttle time'],
            bench_reps: ['bench', 'bench press', 'bench_press_225', 'bench reps', '225 bench', 'bench 225']
        },
        defaultTargetLevels: DEFAULT_TARGET_LEVELS
    },
    soccer: {
        positionAliases: buildPositionAliases({
            GK: ['gk', 'goalkeeper', 'keeper'],
            F: ['f', 'forward', 'striker'],
            M: ['m', 'midfielder', 'midfield'],
            D: ['d', 'defender', 'defense'],
            FIELD: ['field', 'field player']
        }),
        positionToGroup: {
            GK: 'GK',
            F: 'Field',
            M: 'Field',
            D: 'Field',
            FIELD: 'Field'
        },
        positionLabels: {
            GK: 'Goalkeeper',
            F: 'Forward',
            M: 'Midfielder',
            D: 'Defender',
            FIELD: 'Field Player'
        },
        positionGroups: ['Field', 'GK'],
        metrics: [
            { key: 'sprint_30m', label: '30m Sprint', unit: 's', direction: 'lower_better', appliesToGroups: ['Field', 'GK'], weightDefault: 5, input: defaultInputs.speed },
            { key: 'yo_yo_test', label: 'Yo-Yo Test', unit: 'level', direction: 'higher_better', appliesToGroups: ['Field'], weightDefault: 5, input: defaultInputs.level },
            { key: 'vertical_jump', label: 'Vertical Jump', unit: 'in', direction: 'higher_better', appliesToGroups: ['GK'], weightDefault: 5, input: defaultInputs.jump }
        ],
        metricAliases: {
            sprint_30m: ['30m', '30 m', '30m sprint', '30 meter', '30m dash'],
            yo_yo_test: ['yoyo', 'yo yo', 'yo-yo', 'yo-yo test'],
            vertical_jump: ['vert', 'vertical', 'vertical jump']
        },
        defaultTargetLevels: DEFAULT_TARGET_LEVELS
    },
    basketball: {
        positionAliases: buildPositionAliases({
            PG: ['pg', 'point guard', 'point'],
            SG: ['sg', 'shooting guard', 'shooting'],
            SF: ['sf', 'small forward'],
            PF: ['pf', 'power forward'],
            C: ['c', 'center']
        }),
        positionToGroup: {
            PG: 'Guard',
            SG: 'Guard',
            SF: 'Wing',
            PF: 'Big',
            C: 'Big'
        },
        positionLabels: {
            PG: 'Point Guard',
            SG: 'Shooting Guard',
            SF: 'Small Forward',
            PF: 'Power Forward',
            C: 'Center'
        },
        positionGroups: ['Guard', 'Wing', 'Big'],
        metrics: [
            { key: 'sprint_3_4_court', label: '3/4 Court Sprint', unit: 's', direction: 'lower_better', appliesToGroups: ['Guard', 'Wing', 'Big'], weightDefault: 5, input: defaultInputs.speed },
            { key: 'vertical_jump', label: 'Vertical Jump', unit: 'in', direction: 'higher_better', appliesToGroups: ['Guard', 'Wing', 'Big'], weightDefault: 5, input: defaultInputs.jump },
            { key: 'lane_agility', label: 'Lane Agility', unit: 's', direction: 'lower_better', appliesToGroups: ['Guard', 'Wing', 'Big'], weightDefault: 5, input: defaultInputs.speed }
        ],
        metricAliases: {
            sprint_3_4_court: ['3/4 court', '3 4 court', '3/4 sprint', 'three quarter sprint'],
            vertical_jump: ['vert', 'vertical', 'vertical jump'],
            lane_agility: ['lane agility', 'lane drill']
        },
        defaultTargetLevels: DEFAULT_TARGET_LEVELS
    }
};

export const SUPPORTED_SPORTS = ['Softball', 'Baseball', 'Football', 'Soccer', 'Basketball'];

export const getSportSchema = (sport) => {
    const key = normalizeSportKey(sport);
    return SPORT_SCHEMA[key] || null;
};

export const getMetricOptionsForSport = (sport) => {
    const schema = getSportSchema(sport);
    return schema ? schema.metrics : [];
};

export const getMetricUnit = (sport, canonicalKey) => {
    const schema = getSportSchema(sport);
    if (!schema) return '';
    const match = schema.metrics.find(metric => metric.key === canonicalKey);
    return match ? match.unit : '';
};

export const getMetricLabel = (sport, canonicalKey) => {
    const schema = getSportSchema(sport);
    if (!schema) return canonicalKey?.replace(/_/g, ' ') || 'Unknown';
    const match = schema.metrics.find(metric => metric.key === canonicalKey);
    return match ? match.label : canonicalKey?.replace(/_/g, ' ') || 'Unknown';
};

export const getPositionOptionsForSport = (sport) => {
    const schema = getSportSchema(sport);
    if (!schema) return [];
    return Object.keys(schema.positionLabels || {}).map(code => ({
        code,
        label: schema.positionLabels[code],
        group: schema.positionToGroup[code] || null
    }));
};

export const canonicalizeMetricKey = (sport, metricInput) => {
    if (!metricInput) return '';
    const schema = getSportSchema(sport);
    const normalized = normalizeMetric(metricInput);
    if (!schema) {
        return metricInput
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[^\w\s]+/g, '')
            .replace(/\s+/g, '_');
    }

    const directMatch = schema.metrics.find(metric => metric.key === metricInput || metric.key === metricInput.toLowerCase());
    if (directMatch) return directMatch.key;

    const normalizedSnake = metricInput
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^\w\s]+/g, '')
        .replace(/\s+/g, '_');
    const snakeMatch = schema.metrics.find(metric => metric.key === normalizedSnake);
    if (snakeMatch) return snakeMatch.key;

    const aliasMatch = Object.entries(schema.metricAliases || {}).find(([, aliases]) =>
        aliases.some(alias => normalizeMetric(alias) === normalized)
    );
    if (aliasMatch) return aliasMatch[0];

    return normalizedSnake;
};

export const canonicalizeMeasurableRow = (sport, row) => {
    if (!row) return row;
    const key = canonicalizeMetricKey(sport || row.sport, row.metric);
    const unit = row.unit || getMetricUnit(sport || row.sport, key);
    return {
        ...row,
        metric: key,
        unit
    };
};

export const derivePositionGroup = (sportInput, positionInput) => {
    const schema = getSportSchema(sportInput);
    if (!schema || !positionInput) return null;
    const normalized = normalizeMetric(positionInput);
    const canonical = schema.positionAliases[normalized] || schema.positionAliases[positionInput] || schema.positionAliases[positionInput.toString().trim().toLowerCase()];
    if (!canonical) return null;
    return schema.positionToGroup[canonical] || null;
};

export const getCanonicalPosition = (sportInput, positionInput) => {
    const schema = getSportSchema(sportInput);
    if (!schema || !positionInput) return null;
    const normalized = normalizeMetric(positionInput);
    return schema.positionAliases[normalized] || schema.positionAliases[positionInput] || schema.positionAliases[positionInput.toString().trim().toLowerCase()] || null;
};
