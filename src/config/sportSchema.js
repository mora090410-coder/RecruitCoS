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

const buildPositionMapping = (sportKey, map, positionToGroup) => {
    const rows = [];
    const seen = new Set();
    Object.entries(map).forEach(([canonical, list]) => {
        const group = positionToGroup[canonical] || null;
        const values = [...list, canonical];
        values.forEach((value) => {
            const normalized = normalizeAliasKey(value);
            const key = `${sportKey}::${normalized}`;
            if (seen.has(key)) return;
            seen.add(key);
            rows.push({
                sport: sportKey,
                input: value,
                normalizedPosition: canonical,
                positionGroup: group
            });
        });
    });
    return rows;
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

const footballPositions = {
    QB: ['qb', 'quarterback'],
    RB: ['rb', 'running back', 'runningback'],
    WR: ['wr', 'wide receiver', 'receiver'],
    TE: ['te', 'tight end'],
    OL: ['ol', 'offensive line', 'offensive lineman', 'center', 'guard', 'tackle'],
    DL: ['dl', 'defensive line', 'defensive lineman', 'defensive end', 'defensive tackle'],
    LB: ['lb', 'linebacker'],
    DB: ['db', 'defensive back', 'corner', 'cornerback', 'safety'],
    K: ['k', 'kicker'],
    P: ['p', 'punter'],
    LS: ['ls', 'long snapper']
};

const footballAliases = buildPositionAliases(footballPositions);

const footballPositionToGroup = {
    QB: 'QB',
    RB: 'RB',
    WR: 'WR',
    TE: 'TE',
    OL: 'OL',
    DL: 'DL',
    LB: 'LB',
    DB: 'DB',
    K: 'KP',
    P: 'KP',
    LS: 'KP'
};

const soccerPositions = {
    GK: ['gk', 'goalkeeper', 'keeper'],
    CB: ['cb', 'center back', 'centre back'],
    FB: ['fb', 'fullback', 'full back', 'outside back'],
    DM: ['dm', 'defensive mid', 'defensive midf', 'cdm', 'holding mid'],
    CM: ['cm', 'center mid', 'centre mid', 'central mid'],
    AM: ['am', 'attacking mid', 'attacking midfielder', 'cam'],
    W: ['w', 'wing', 'winger'],
    ST: ['st', 'striker', 'forward']
};

const soccerAliases = buildPositionAliases(soccerPositions);

const soccerPositionToGroup = {
    GK: 'GK',
    CB: 'DEF',
    FB: 'DEF',
    DM: 'MID',
    CM: 'MID',
    AM: 'MID',
    W: 'FWD',
    ST: 'FWD'
};

const basketballPositions = {
    PG: ['pg', 'point guard', 'point'],
    SG: ['sg', 'shooting guard', 'shooting'],
    SF: ['sf', 'small forward'],
    PF: ['pf', 'power forward'],
    C: ['c', 'center']
};

const basketballAliases = buildPositionAliases(basketballPositions);

const basketballPositionToGroup = {
    PG: 'G',
    SG: 'G',
    SF: 'W',
    PF: 'B',
    C: 'B'
};

const defaultInputs = {
    time: { min: 0, max: 20, step: 0.01 },
    velocity: { min: 0, max: 120, step: 0.1 },
    jumpIn: { min: 0, max: 60, step: 0.1 },
    jumpCm: { min: 0, max: 200, step: 0.5 },
    reps: { min: 0, max: 60, step: 1 },
    level: { min: 0, max: 30, step: 0.1 },
    lengthIn: { min: 0, max: 120, step: 0.1 },
    rpm: { min: 0, max: 4000, step: 10 },
    percent: { min: 0, max: 100, step: 0.5 },
    distanceYd: { min: 0, max: 100, step: 0.5 }
};

const meaningfulDeltas = {
    time: 0.2,
    velocity: 5,
    jumpIn: 2,
    jumpCm: 5,
    reps: 5,
    level: 1,
    lengthIn: 2,
    rpm: 150,
    percent: 2,
    distanceYd: 3
};

export const POSITION_MAPPING = {
    softball: buildPositionMapping('softball', baseballSoftballPositions, baseballSoftballPositionToGroup),
    baseball: buildPositionMapping('baseball', baseballSoftballPositions, baseballSoftballPositionToGroup),
    football: buildPositionMapping('football', footballPositions, footballPositionToGroup),
    soccer: buildPositionMapping('soccer', soccerPositions, soccerPositionToGroup),
    basketball: buildPositionMapping('basketball', basketballPositions, basketballPositionToGroup)
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
        positionGroups: ['IF', 'OF', 'C', 'P'],
        metrics: [
            {
                key: 'home_to_first',
                label: 'Home to First',
                unit: 'sec',
                direction: 'lower_better',
                appliesToGroups: ['IF', 'OF'],
                weightDefault: 6,
                input: defaultInputs.time,
                meaningfulDelta: meaningfulDeltas.time,
                aliases: ['home to first', 'home to 1st', 'home_to_1st', 'h2f']
            },
            {
                key: 'overhand_velocity',
                label: 'Overhand Velocity',
                unit: 'mph',
                direction: 'higher_better',
                appliesToGroups: ['C', 'IF', 'OF'],
                weightDefault: 6,
                input: defaultInputs.velocity,
                meaningfulDelta: meaningfulDeltas.velocity,
                aliases: ['overhand velocity', 'overhand velo', 'throw velocity', 'throw velo', 'throwing velo', 'throw vel', 'throw_velocity']
            },
            {
                key: 'exit_velo',
                label: 'Exit Velocity',
                unit: 'mph',
                direction: 'higher_better',
                appliesToGroups: ['C', 'IF', 'OF'],
                weightDefault: 6,
                input: defaultInputs.velocity,
                meaningfulDelta: meaningfulDeltas.velocity,
                aliases: ['exit velo', 'exit_velocity', 'ev', 'exitv', 'exit vel']
            },
            {
                key: 'pop_time',
                label: 'Pop Time',
                unit: 'sec',
                direction: 'lower_better',
                appliesToGroups: ['C'],
                weightDefault: 7,
                input: defaultInputs.time,
                meaningfulDelta: meaningfulDeltas.time,
                aliases: ['pop', 'pop time']
            },
            {
                key: 'pitch_velocity',
                label: 'Pitch Velocity',
                unit: 'mph',
                direction: 'higher_better',
                appliesToGroups: ['P'],
                weightDefault: 8,
                input: defaultInputs.velocity,
                meaningfulDelta: meaningfulDeltas.velocity,
                aliases: ['pitch velo', 'pitching velo', 'pitch velocity']
            },
            {
                key: 'spin_rate',
                label: 'Spin Rate',
                unit: 'rpm',
                direction: 'higher_better',
                appliesToGroups: ['P'],
                weightDefault: 3,
                input: defaultInputs.rpm,
                meaningfulDelta: meaningfulDeltas.rpm,
                aliases: ['spin', 'spin rate', 'spinrate']
            },
            {
                key: 'strike_percentage',
                label: 'Strike Percentage',
                unit: 'percent',
                direction: 'higher_better',
                appliesToGroups: ['P'],
                weightDefault: 4,
                input: defaultInputs.percent,
                meaningfulDelta: meaningfulDeltas.percent,
                aliases: ['strike pct', 'strike percent', 'strike %']
            }
        ],
        metricAliases: buildMetricAliases({
            home_to_first: ['home to first', 'home to 1st', 'home_to_1st', 'h2f'],
            pop_time: ['pop', 'pop time'],
            overhand_velocity: [
                'overhand velocity',
                'overhand velo',
                'throw velocity',
                'throw velo',
                'throwing velo',
                'throw vel',
                'throw_velocity'
            ],
            exit_velo: ['exit velo', 'exit vel', 'exit velocity', 'exit_velocity', 'ev', 'exitv'],
            pitch_velocity: ['pitch velo', 'pitching velo', 'pitch velocity'],
            spin_rate: ['spin', 'spin rate', 'spinrate'],
            strike_percentage: ['strike pct', 'strike percent', 'strike %']
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
        positionGroups: ['IF', 'OF', 'C', 'P'],
        metrics: [
            {
                key: 'sixty_time',
                label: '60 Time',
                unit: 'sec',
                direction: 'lower_better',
                appliesToGroups: ['IF', 'OF'],
                weightDefault: 6,
                input: defaultInputs.time,
                meaningfulDelta: meaningfulDeltas.time,
                aliases: ['60', '60 time', 'sixty', 'sixty time', '60 yd dash', '60-yard']
            },
            {
                key: 'infield_velocity',
                label: 'Infield Velocity',
                unit: 'mph',
                direction: 'higher_better',
                appliesToGroups: ['IF'],
                weightDefault: 6,
                input: defaultInputs.velocity,
                meaningfulDelta: meaningfulDeltas.velocity,
                aliases: ['infield velo', 'if velocity', 'if velo']
            },
            {
                key: 'outfield_velocity',
                label: 'Outfield Velocity',
                unit: 'mph',
                direction: 'higher_better',
                appliesToGroups: ['OF'],
                weightDefault: 6,
                input: defaultInputs.velocity,
                meaningfulDelta: meaningfulDeltas.velocity,
                aliases: ['outfield velo', 'of velocity', 'of velo']
            },
            {
                key: 'exit_velocity',
                label: 'Exit Velocity',
                unit: 'mph',
                direction: 'higher_better',
                appliesToGroups: ['IF', 'OF', 'C'],
                weightDefault: 6,
                input: defaultInputs.velocity,
                meaningfulDelta: meaningfulDeltas.velocity,
                aliases: ['exit vel', 'exit velo', 'exit_velocity', 'ev']
            },
            {
                key: 'pop_time',
                label: 'Pop Time',
                unit: 'sec',
                direction: 'lower_better',
                appliesToGroups: ['C'],
                weightDefault: 7,
                input: defaultInputs.time,
                meaningfulDelta: meaningfulDeltas.time,
                aliases: ['pop', 'pop time']
            },
            {
                key: 'catcher_throw_velocity',
                label: 'Catcher Throw Velocity',
                unit: 'mph',
                direction: 'higher_better',
                appliesToGroups: ['C'],
                weightDefault: 6,
                input: defaultInputs.velocity,
                meaningfulDelta: meaningfulDeltas.velocity,
                aliases: ['catcher velo', 'catcher throw velo', 'catcher throw velocity', 'catcher vel']
            },
            {
                key: 'pitch_velocity',
                label: 'Pitch Velocity',
                unit: 'mph',
                direction: 'higher_better',
                appliesToGroups: ['P'],
                weightDefault: 8,
                input: defaultInputs.velocity,
                meaningfulDelta: meaningfulDeltas.velocity,
                aliases: ['pitch velo', 'pitching velo', 'pitch velocity']
            },
            {
                key: 'spin_rate',
                label: 'Spin Rate',
                unit: 'rpm',
                direction: 'higher_better',
                appliesToGroups: ['P'],
                weightDefault: 3,
                input: defaultInputs.rpm,
                meaningfulDelta: meaningfulDeltas.rpm,
                aliases: ['spin', 'spin rate', 'spinrate']
            },
            {
                key: 'strike_percentage',
                label: 'Strike Percentage',
                unit: 'percent',
                direction: 'higher_better',
                appliesToGroups: ['P'],
                weightDefault: 4,
                input: defaultInputs.percent,
                meaningfulDelta: meaningfulDeltas.percent,
                aliases: ['strike pct', 'strike percent', 'strike %']
            }
        ],
        metricAliases: buildMetricAliases({
            sixty_time: ['60', '60 time', 'sixty', 'sixty time', '60 yd dash', '60-yard'],
            pop_time: ['pop', 'pop time'],
            catcher_throw_velocity: ['catcher velo', 'catcher throw velo', 'catcher throw velocity', 'catcher vel'],
            exit_velocity: ['exit vel', 'exit velo', 'exit_velocity', 'ev'],
            infield_velocity: ['infield velo', 'if velocity', 'if velo'],
            outfield_velocity: ['outfield velo', 'of velocity', 'of velo'],
            pitch_velocity: ['pitch velo', 'pitching velo', 'pitch velocity'],
            spin_rate: ['spin', 'spin rate', 'spinrate'],
            strike_percentage: ['strike pct', 'strike percent', 'strike %']
        }),
        defaultTargetLevels: DEFAULT_TARGET_LEVELS
    },
    football: {
        positionAliases: footballAliases,
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
        positionToGroup: footballPositionToGroup,
        positionGroups: ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB', 'KP'],
        metrics: [
            {
                key: 'throwing_velocity',
                label: 'Throwing Velocity',
                unit: 'mph',
                direction: 'higher_better',
                appliesToGroups: ['QB'],
                weightDefault: 7,
                input: defaultInputs.velocity,
                meaningfulDelta: meaningfulDeltas.velocity,
                aliases: ['throw velocity', 'throw velo', 'throwing velo', 'qb velocity']
            },
            {
                key: 'forty_time',
                label: '40 Time',
                unit: 'sec',
                direction: 'lower_better',
                appliesToGroups: ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'DB'],
                weightDefault: 6,
                input: defaultInputs.time,
                meaningfulDelta: meaningfulDeltas.time,
                aliases: ['40', '40 yd', '40-yard', '40 yard', '40 yard dash', '40 yd dash', 'forty', 'forty time']
            },
            {
                key: 'shuttle',
                label: 'Shuttle',
                unit: 'sec',
                direction: 'lower_better',
                appliesToGroups: ['QB', 'RB', 'TE', 'OL', 'DL', 'LB'],
                weightDefault: 5,
                input: defaultInputs.time,
                meaningfulDelta: meaningfulDeltas.time,
                aliases: ['pro agility', 'pro_agility_shuttle', 'shuttle', 'shuttle time']
            },
            {
                key: 'three_cone',
                label: 'Three Cone',
                unit: 'sec',
                direction: 'lower_better',
                appliesToGroups: ['WR', 'DB'],
                weightDefault: 5,
                input: defaultInputs.time,
                meaningfulDelta: meaningfulDeltas.time,
                aliases: ['3 cone', 'three cone', '3-cone']
            },
            {
                key: 'vertical',
                label: 'Vertical',
                unit: 'in',
                direction: 'higher_better',
                appliesToGroups: ['RB', 'WR', 'LB', 'DB'],
                weightDefault: 5,
                input: defaultInputs.jumpIn,
                meaningfulDelta: meaningfulDeltas.jumpIn,
                aliases: ['vert', 'vertical jump', 'vertical']
            },
            {
                key: 'bench_reps',
                label: 'Bench Reps',
                unit: 'reps',
                direction: 'higher_better',
                appliesToGroups: ['TE', 'OL', 'DL'],
                weightDefault: 6,
                input: defaultInputs.reps,
                meaningfulDelta: meaningfulDeltas.reps,
                aliases: ['bench', 'bench press', 'bench_press_225', 'bench reps', '225 bench', 'bench 225']
            },
            {
                key: 'kick_distance',
                label: 'Kick Distance',
                unit: 'yd',
                direction: 'higher_better',
                appliesToGroups: ['KP'],
                weightDefault: 6,
                input: defaultInputs.distanceYd,
                meaningfulDelta: meaningfulDeltas.distanceYd,
                aliases: ['kick distance', 'field goal distance', 'fg distance']
            },
            {
                key: 'hang_time',
                label: 'Hang Time',
                unit: 'sec',
                direction: 'higher_better',
                appliesToGroups: ['KP'],
                weightDefault: 5,
                input: defaultInputs.time,
                meaningfulDelta: meaningfulDeltas.time,
                aliases: ['hang time', 'punt hang time']
            },
            {
                key: 'kick_accuracy',
                label: 'Kick Accuracy',
                unit: 'percent',
                direction: 'higher_better',
                appliesToGroups: ['KP'],
                weightDefault: 6,
                input: defaultInputs.percent,
                meaningfulDelta: meaningfulDeltas.percent,
                aliases: ['kick accuracy', 'fg accuracy', 'field goal accuracy']
            }
        ],
        metricAliases: buildMetricAliases({
            forty_time: ['40', '40 yd', '40 yard', '40-yard', 'forty', '40 time', '40 yd dash', 'forty_yard_dash', 'forty time'],
            shuttle: ['pro agility', 'pro_agility_shuttle', 'shuttle', 'shuttle time'],
            three_cone: ['3 cone', 'three cone', '3-cone'],
            vertical: ['vert', 'vertical jump', 'vertical'],
            bench_reps: ['bench', 'bench press', 'bench_press_225', 'bench reps', '225 bench', 'bench 225'],
            throwing_velocity: ['throw velocity', 'throw velo', 'throwing velo', 'qb velocity'],
            kick_distance: ['kick distance', 'field goal distance', 'fg distance'],
            hang_time: ['hang time', 'punt hang time'],
            kick_accuracy: ['kick accuracy', 'fg accuracy', 'field goal accuracy']
        }),
        defaultTargetLevels: DEFAULT_TARGET_LEVELS
    },
    soccer: {
        positionAliases: soccerAliases,
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
        positionToGroup: soccerPositionToGroup,
        positionGroups: ['GK', 'DEF', 'MID', 'FWD'],
        metrics: [
            {
                key: 'sprint_30m',
                label: '30m Sprint',
                unit: 'sec',
                direction: 'lower_better',
                appliesToGroups: ['GK', 'DEF', 'MID', 'FWD'],
                weightDefault: 5,
                input: defaultInputs.time,
                meaningfulDelta: meaningfulDeltas.time,
                aliases: ['30m', '30 m', '30m sprint', '30 meter', '30m dash']
            },
            {
                key: 'yo_yo',
                label: 'Yo-Yo Test',
                unit: 'level',
                direction: 'higher_better',
                appliesToGroups: ['DEF', 'MID', 'FWD'],
                weightDefault: 6,
                input: defaultInputs.level,
                meaningfulDelta: meaningfulDeltas.level,
                aliases: ['yoyo', 'yo yo', 'yo-yo', 'yo-yo test']
            },
            {
                key: 'vertical_jump',
                label: 'Vertical Jump',
                unit: 'cm',
                direction: 'higher_better',
                appliesToGroups: ['GK', 'DEF', 'MID', 'FWD'],
                weightDefault: 4,
                input: defaultInputs.jumpCm,
                meaningfulDelta: meaningfulDeltas.jumpCm,
                aliases: ['vert', 'vertical', 'vertical jump']
            },
            {
                key: 'agility_505',
                label: '505 Agility',
                unit: 'sec',
                direction: 'lower_better',
                appliesToGroups: ['GK', 'DEF', 'MID', 'FWD'],
                weightDefault: 4,
                input: defaultInputs.time,
                meaningfulDelta: meaningfulDeltas.time,
                aliases: ['505', '505 agility', 'agility 505']
            }
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
        positionAliases: basketballAliases,
        positionLabels: {
            PG: 'Point Guard',
            SG: 'Shooting Guard',
            SF: 'Small Forward',
            PF: 'Power Forward',
            C: 'Center'
        },
        positionToGroup: basketballPositionToGroup,
        positionGroups: ['G', 'W', 'B'],
        metrics: [
            {
                key: 'three_quarter_sprint',
                label: '3/4 Court Sprint',
                unit: 'sec',
                direction: 'lower_better',
                appliesToGroups: ['G', 'W', 'B'],
                weightDefault: 6,
                input: defaultInputs.time,
                meaningfulDelta: meaningfulDeltas.time,
                aliases: ['3/4 court', '3 4 court', '3/4 sprint', 'three quarter sprint']
            },
            {
                key: 'lane_agility',
                label: 'Lane Agility',
                unit: 'sec',
                direction: 'lower_better',
                appliesToGroups: ['G', 'W', 'B'],
                weightDefault: 6,
                input: defaultInputs.time,
                meaningfulDelta: meaningfulDeltas.time,
                aliases: ['lane agility', 'lane drill']
            },
            {
                key: 'vertical_jump',
                label: 'Vertical Jump',
                unit: 'in',
                direction: 'higher_better',
                appliesToGroups: ['G', 'W', 'B'],
                weightDefault: 5,
                input: defaultInputs.jumpIn,
                meaningfulDelta: meaningfulDeltas.jumpIn,
                aliases: ['vert', 'vertical', 'vertical jump']
            },
            {
                key: 'wingspan',
                label: 'Wingspan',
                unit: 'in',
                direction: 'higher_better',
                appliesToGroups: ['W', 'B'],
                weightDefault: 5,
                input: defaultInputs.lengthIn,
                meaningfulDelta: meaningfulDeltas.lengthIn,
                aliases: ['wing span', 'arm span']
            },
            {
                key: 'height',
                label: 'Height',
                unit: 'in',
                direction: 'higher_better',
                appliesToGroups: ['G', 'W', 'B'],
                weightDefault: 4,
                input: defaultInputs.lengthIn,
                meaningfulDelta: meaningfulDeltas.lengthIn,
                aliases: ['ht', 'height']
            }
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

export const canonicalizeMetricKeyForGroup = (sport, metricInput, positionGroup) => {
    const canonical = canonicalizeMetricKey(sport, metricInput);
    if (normalizeSportKey(sport) !== 'softball') return canonical;
    if (!positionGroup) return canonical;
    if (positionGroup === 'P' && canonical === 'overhand_velocity') {
        return 'pitch_velocity';
    }
    return canonical;
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
