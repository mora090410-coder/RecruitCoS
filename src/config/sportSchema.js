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

const normalizeAliasKey = (value) => normalizeMetric(value);

const buildPositionAliases = (map) => {
    const aliases = {};
    Object.entries(map).forEach(([canonical, list]) => {
        list.forEach((value) => {
            aliases[normalizeAliasKey(value)] = canonical;
        });
        aliases[normalizeAliasKey(canonical)] = canonical;
        aliases[canonical] = canonical;
    });
    return aliases;
};

const buildMetricAliases = (map) => {
    const aliases = {};
    Object.entries(map).forEach(([canonical, list]) => {
        list.forEach((value) => {
            aliases[normalizeAliasKey(value)] = canonical;
        });
        aliases[normalizeAliasKey(canonical)] = canonical;
        aliases[canonical] = canonical;
    });
    return aliases;
};

const baseballSoftballPositions = {
    P: ['p', 'pitcher', 'pitching'],
    C: ['c', 'catcher'],
    '1B': ['1b', '1st base', 'first base'],
    '2B': ['2b', '2nd base', 'second base'],
    '3B': ['3b', '3rd base', 'third base'],
    SS: ['ss', 'shortstop', 'short stop'],
    LF: ['lf', 'left field', 'leftfielder', 'left fielder'],
    CF: ['cf', 'center field', 'centerfielder', 'center fielder'],
    RF: ['rf', 'right field', 'rightfielder', 'right fielder'],
    OF: ['of', 'outfield', 'out fielder'],
    UTIL: ['util', 'utility', 'super utility']
};

const baseballSoftballAliases = buildPositionAliases(baseballSoftballPositions);

const baseballSoftballPositionToGroup = {
    P: 'P',
    C: 'C',
    '1B': 'IF',
    '2B': 'IF',
    '3B': 'IF',
    SS: 'IF',
    LF: 'OF',
    CF: 'OF',
    RF: 'OF',
    OF: 'OF',
    UTIL: 'IF'
};

const defaultInputs = {
    time: { min: 0, max: 20, step: 0.01 },
    velocity: { min: 0, max: 120, step: 0.1 },
    jumpIn: { min: 0, max: 60, step: 0.1 },
    jumpCm: { min: 0, max: 200, step: 0.5 },
    reps: { min: 0, max: 60, step: 1 },
    level: { min: 0, max: 30, step: 0.1 },
    lengthIn: { min: 0, max: 120, step: 0.1 }
};

export const SPORT_SCHEMA = {
    softball: {
        positionAliases: baseballSoftballAliases,
        positionLabels: {
            P: 'Pitcher',
            C: 'Catcher',
            '1B': 'First Base',
            '2B': 'Second Base',
            SS: 'Shortstop',
            '3B': 'Third Base',
            LF: 'Left Field',
            CF: 'Center Field',
            RF: 'Right Field',
            OF: 'Outfield',
            UTIL: 'Utility'
        },
        positionToGroup: baseballSoftballPositionToGroup,
        positionGroups: ['P', 'C', 'IF', 'OF'],
        metrics: [
            { key: 'home_to_first', label: 'Home to First', unit: 'sec', direction: 'lower_better', appliesToGroups: ['IF', 'OF'], weightDefault: 5, input: defaultInputs.time },
            { key: 'pop_time', label: 'Pop Time', unit: 'sec', direction: 'lower_better', appliesToGroups: ['C'], weightDefault: 5, input: defaultInputs.time },
            { key: 'throw_velocity', label: 'Throw Velocity', unit: 'mph', direction: 'higher_better', appliesToGroups: ['C', 'IF', 'OF'], weightDefault: 5, input: defaultInputs.velocity },
            { key: 'exit_velo', label: 'Exit Velocity', unit: 'mph', direction: 'higher_better', appliesToGroups: ['IF', 'OF'], weightDefault: 5, input: defaultInputs.velocity },
            { key: 'pitch_velocity', label: 'Pitch Velocity', unit: 'mph', direction: 'higher_better', appliesToGroups: ['P'], weightDefault: 5, input: defaultInputs.velocity }
        ],
        metricAliases: buildMetricAliases({
            home_to_first: ['home to first', 'home to 1st', 'home_to_1st'],
            pop_time: ['pop', 'pop time'],
            throw_velocity: ['throw velo', 'throwing velo', 'throw vel'],
            exit_velo: ['exit velo', 'exit vel', 'exit velocity'],
            pitch_velocity: ['pitch velo', 'pitching velo']
        }),
        defaultTargetLevels: DEFAULT_TARGET_LEVELS
    },
    baseball: {
        positionAliases: baseballSoftballAliases,
        positionLabels: {
            P: 'Pitcher',
            C: 'Catcher',
            '1B': 'First Base',
            '2B': 'Second Base',
            SS: 'Shortstop',
            '3B': 'Third Base',
            LF: 'Left Field',
            CF: 'Center Field',
            RF: 'Right Field',
            OF: 'Outfield',
            UTIL: 'Utility'
        },
        positionToGroup: baseballSoftballPositionToGroup,
        positionGroups: ['P', 'C', 'IF', 'OF'],
        metrics: [
            { key: 'sixty_time', label: '60 Time', unit: 'sec', direction: 'lower_better', appliesToGroups: ['IF', 'OF'], weightDefault: 5, input: defaultInputs.time },
            { key: 'pop_time', label: 'Pop Time', unit: 'sec', direction: 'lower_better', appliesToGroups: ['C'], weightDefault: 5, input: defaultInputs.time },
            { key: 'catcher_throw_velocity', label: 'Catcher Throw Velocity', unit: 'mph', direction: 'higher_better', appliesToGroups: ['C'], weightDefault: 5, input: defaultInputs.velocity },
            { key: 'exit_velocity', label: 'Exit Velocity', unit: 'mph', direction: 'higher_better', appliesToGroups: ['IF', 'OF'], weightDefault: 5, input: defaultInputs.velocity },
            { key: 'infield_velocity', label: 'Infield Velocity', unit: 'mph', direction: 'higher_better', appliesToGroups: ['IF'], weightDefault: 5, input: defaultInputs.velocity },
            { key: 'outfield_velocity', label: 'Outfield Velocity', unit: 'mph', direction: 'higher_better', appliesToGroups: ['OF'], weightDefault: 5, input: defaultInputs.velocity },
            { key: 'pitch_velocity', label: 'Pitch Velocity', unit: 'mph', direction: 'higher_better', appliesToGroups: ['P'], weightDefault: 5, input: defaultInputs.velocity }
        ],
        metricAliases: buildMetricAliases({
            sixty_time: ['60', '60 time', 'sixty', 'sixty time'],
            pop_time: ['pop', 'pop time'],
            catcher_throw_velocity: ['catcher velo', 'catcher throw velo', 'catcher throw velocity'],
            exit_velocity: ['exit velo', 'exit vel'],
            infield_velocity: ['infield velo', 'if velocity'],
            outfield_velocity: ['outfield velo', 'of velocity'],
            pitch_velocity: ['pitch velo', 'pitching velo']
        }),
        defaultTargetLevels: DEFAULT_TARGET_LEVELS
    },
    football: {
        positionAliases: buildPositionAliases({
            QB: ['qb', 'quarterback'],
            RB: ['rb', 'running back', 'runningback'],
            WR: ['wr', 'wide receiver', 'receiver'],
            TE: ['te', 'tight end'],
            OL: ['ol', 'offensive line', 'offensive lineman'],
            DL: ['dl', 'defensive line', 'defensive lineman'],
            LB: ['lb', 'linebacker'],
            DB: ['db', 'defensive back', 'corner', 'cornerback', 'safety'],
            K: ['k', 'kicker'],
            P: ['p', 'punter'],
            LS: ['ls', 'long snapper']
        }),
        positionLabels: {
            QB: 'Quarterback',
            RB: 'Running Back',
            WR: 'Wide Receiver',
            TE: 'Tight End',
            OL: 'Offensive Line',
            DL: 'Defensive Line',
            LB: 'Linebacker',
            DB: 'Defensive Back',
            K: 'Kicker',
            P: 'Punter',
            LS: 'Long Snapper'
        },
        positionToGroup: {
            QB: 'QB',
            RB: 'SKILL',
            WR: 'SKILL',
            TE: 'BIG',
            OL: 'BIG',
            DL: 'BIG',
            LB: 'LB',
            DB: 'DB',
            K: 'ST',
            P: 'ST',
            LS: 'ST'
        },
        positionGroups: ['QB', 'SKILL', 'BIG', 'DB', 'LB', 'OL_DL', 'ST'],
        metrics: [
            { key: 'forty_time', label: '40 Time', unit: 'sec', direction: 'lower_better', appliesToGroups: ['SKILL', 'DB', 'LB'], weightDefault: 5, input: defaultInputs.time },
            { key: 'shuttle', label: 'Shuttle', unit: 'sec', direction: 'lower_better', appliesToGroups: ['SKILL', 'DB', 'LB'], weightDefault: 5, input: defaultInputs.time },
            { key: 'three_cone', label: 'Three Cone', unit: 'sec', direction: 'lower_better', appliesToGroups: ['SKILL', 'DB'], weightDefault: 5, input: defaultInputs.time },
            { key: 'vertical', label: 'Vertical', unit: 'in', direction: 'higher_better', appliesToGroups: ['SKILL', 'DB', 'LB'], weightDefault: 5, input: defaultInputs.jumpIn },
            { key: 'bench_reps', label: 'Bench Reps', unit: 'reps', direction: 'higher_better', appliesToGroups: ['BIG', 'LB'], weightDefault: 5, input: defaultInputs.reps },
            { key: 'throwing_velocity', label: 'Throwing Velocity', unit: 'mph', direction: 'higher_better', appliesToGroups: ['QB'], weightDefault: 5, input: defaultInputs.velocity }
        ],
        metricAliases: buildMetricAliases({
            forty_time: ['40', '40 yd', '40 yard', '40-yard', 'forty', '40 time', '40 yd dash', 'forty_yard_dash', 'forty time'],
            shuttle: ['pro agility', 'pro_agility_shuttle', 'shuttle', 'shuttle time'],
            three_cone: ['3 cone', 'three cone', '3-cone'],
            vertical: ['vert', 'vertical jump', 'vertical'],
            bench_reps: ['bench', 'bench press', 'bench_press_225', 'bench reps', '225 bench', 'bench 225'],
            throwing_velocity: ['throw velocity', 'throw velo', 'throwing velo', 'qb velocity']
        }),
        defaultTargetLevels: DEFAULT_TARGET_LEVELS
    },
    soccer: {
        positionAliases: buildPositionAliases({
            GK: ['gk', 'goalkeeper', 'keeper'],
            CB: ['cb', 'center back', 'centre back'],
            FB: ['fb', 'fullback', 'full back', 'outside back'],
            DM: ['dm', 'defensive mid', 'defensive midf', 'cdm', 'holding mid'],
            CM: ['cm', 'center mid', 'centre mid', 'central mid'],
            AM: ['am', 'attacking mid', 'attacking midfielder', 'cam'],
            W: ['w', 'wing', 'winger'],
            ST: ['st', 'striker', 'forward']
        }),
        positionLabels: {
            GK: 'Goalkeeper',
            CB: 'Center Back',
            FB: 'Fullback',
            DM: 'Defensive Mid',
            CM: 'Central Mid',
            AM: 'Attacking Mid',
            W: 'Winger',
            ST: 'Striker'
        },
        positionToGroup: {
            GK: 'GK',
            CB: 'FIELD',
            FB: 'FIELD',
            DM: 'FIELD',
            CM: 'FIELD',
            AM: 'FIELD',
            W: 'FIELD',
            ST: 'FIELD'
        },
        positionGroups: ['GK', 'FIELD'],
        metrics: [
            { key: 'sprint_30m', label: '30m Sprint', unit: 'sec', direction: 'lower_better', appliesToGroups: ['FIELD', 'GK'], weightDefault: 5, input: defaultInputs.time },
            { key: 'yo_yo', label: 'Yo-Yo Test', unit: 'level', direction: 'higher_better', appliesToGroups: ['FIELD'], weightDefault: 5, input: defaultInputs.level },
            { key: 'vertical_jump', label: 'Vertical Jump', unit: 'cm', direction: 'higher_better', appliesToGroups: ['FIELD', 'GK'], weightDefault: 5, input: defaultInputs.jumpCm },
            { key: 'agility_505', label: '505 Agility', unit: 'sec', direction: 'lower_better', appliesToGroups: ['FIELD'], weightDefault: 5, input: defaultInputs.time }
        ],
        metricAliases: buildMetricAliases({
            sprint_30m: ['30m', '30 m', '30m sprint', '30 meter', '30m dash'],
            yo_yo: ['yoyo', 'yo yo', 'yo-yo', 'yo-yo test'],
            vertical_jump: ['vert', 'vertical', 'vertical jump'],
            agility_505: ['505', '505 agility', 'agility 505']
        }),
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
        positionLabels: {
            PG: 'Point Guard',
            SG: 'Shooting Guard',
            SF: 'Small Forward',
            PF: 'Power Forward',
            C: 'Center'
        },
        positionToGroup: {
            PG: 'GUARD',
            SG: 'GUARD',
            SF: 'WING',
            PF: 'BIG',
            C: 'BIG'
        },
        positionGroups: ['GUARD', 'WING', 'BIG'],
        metrics: [
            { key: 'three_quarter_sprint', label: '3/4 Court Sprint', unit: 'sec', direction: 'lower_better', appliesToGroups: ['GUARD', 'WING', 'BIG'], weightDefault: 5, input: defaultInputs.time },
            { key: 'lane_agility', label: 'Lane Agility', unit: 'sec', direction: 'lower_better', appliesToGroups: ['GUARD', 'WING', 'BIG'], weightDefault: 5, input: defaultInputs.time },
            { key: 'vertical_jump', label: 'Vertical Jump', unit: 'in', direction: 'higher_better', appliesToGroups: ['GUARD', 'WING', 'BIG'], weightDefault: 5, input: defaultInputs.jumpIn },
            { key: 'wingspan', label: 'Wingspan', unit: 'in', direction: 'higher_better', appliesToGroups: ['WING', 'BIG'], weightDefault: 5, input: defaultInputs.lengthIn },
            { key: 'height', label: 'Height', unit: 'in', direction: 'higher_better', appliesToGroups: ['GUARD', 'WING', 'BIG'], weightDefault: 5, input: defaultInputs.lengthIn }
        ],
        metricAliases: buildMetricAliases({
            three_quarter_sprint: ['3/4 court', '3 4 court', '3/4 sprint', 'three quarter sprint'],
            lane_agility: ['lane agility', 'lane drill'],
            vertical_jump: ['vert', 'vertical', 'vertical jump'],
            wingspan: ['wing span', 'arm span'],
            height: ['ht', 'height']
        }),
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

export const getMetricKeysForSport = (sport) => {
    const schema = getSportSchema(sport);
    if (!schema) return [];
    return schema.metrics.map(metric => metric.key);
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

export const canonicalizeMetricKey = (sport, metricInput) => {
    if (!metricInput) return '';
    const schema = getSportSchema(sport);
    const normalized = normalizeAliasKey(metricInput);
    if (!schema) {
        return metricInput
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
    }

    const directMatch = schema.metrics.find(metric => metric.key === metricInput || metric.key === metricInput.toLowerCase());
    if (directMatch) return directMatch.key;

    const normalizedSnake = metricInput
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
    const snakeMatch = schema.metrics.find(metric => metric.key === normalizedSnake);
    if (snakeMatch) return snakeMatch.key;

    const aliasMatch = schema.metricAliases[normalized];
    if (aliasMatch) return aliasMatch;

    return normalizedSnake;
};

export const canonicalizeMeasurableRow = (sport, row) => {
    if (!row) return row;
    const key = row.metric_canonical || canonicalizeMetricKey(sport || row.sport, row.metric);
    const unit = row.unit_canonical || row.unit || getMetricUnit(sport || row.sport, key);
    return {
        ...row,
        metric: key,
        unit
    };
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

export const derivePositionGroup = (sportInput, positionInput) => {
    const schema = getSportSchema(sportInput);
    if (!schema || !positionInput) return null;
    const canonical = schema.positionAliases[normalizeAliasKey(positionInput)] || null;
    if (!canonical) return null;
    return schema.positionToGroup[canonical] || null;
};

export const getCanonicalPosition = (sportInput, positionInput) => {
    const schema = getSportSchema(sportInput);
    if (!schema || !positionInput) return null;
    return schema.positionAliases[normalizeAliasKey(positionInput)] || null;
};
