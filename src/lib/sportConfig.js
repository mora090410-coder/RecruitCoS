/**
 * Sport Configuration
 * Centralized source of truth for position groups, weighting, and required metrics.
 */
import { RECRUITING_PHASES } from './constants.js';

export const POSITION_GROUPS = {
    Football: ['Skill (QB/WR/DB)', 'Big Skill (RB/LB/TE)', 'Linemen (OL/DL)', 'Specialists'],
    Volleyball: ['Hitters', 'Setters', 'Liberos/DS', 'Middles'],
    Soccer: ['Forwards', 'Midfielders', 'Defenders', 'Goalkeepers']
};

export const PILLAR_WEIGHTS = {
    [RECRUITING_PHASES.FOUNDATION]: {
        measurables: 0.35,
        progression: 0.30,
        exposure: 0.10,
        academics: 0.20,
        execution: 0.05
    },
    [RECRUITING_PHASES.EVALUATION]: {
        measurables: 0.35,
        progression: 0.30,
        exposure: 0.10,
        academics: 0.20,
        execution: 0.05
    },
    [RECRUITING_PHASES.IDENTIFICATION]: {
        measurables: 0.25,
        progression: 0.25,
        exposure: 0.20,
        academics: 0.20,
        execution: 0.10
    },
    [RECRUITING_PHASES.COMPARISON]: {
        measurables: 0.15,
        progression: 0.10,
        exposure: 0.30,
        academics: 0.15,
        execution: 0.30
    },
    [RECRUITING_PHASES.COMMITMENT]: {
        measurables: 0.15,
        progression: 0.10,
        exposure: 0.30,
        academics: 0.15,
        execution: 0.30
    }
};

export const LEVEL_THRESHOLDS = {
    'D1': { excellent: 85, strong: 75, good: 60, baseline: 30 },
    'D2': { excellent: 65, strong: 50, good: 40, baseline: 40 },
    'D3': { excellent: 45, strong: 30, good: 20, baseline: 60 },
    'NAIA': { excellent: 45, strong: 30, good: 20, baseline: 60 }
};

export const INTEREST_WEIGHTS = {
    engagement: 0.55,
    levelFit: 0.30,
    positionFit: 0.15
};

export const DEFAULT_TARGET_LEVEL = {
    'Scholarship': 'D1',
    'Competitive': 'D2',
    'Participation': 'D3'
};

export const BENCHMARK_METRICS = {
    'Football': {
        'Skill (QB/WR/DB)': ['forty_yard_dash', 'vertical_jump', 'pro_agility_shuttle', 'broad_jump'],
        'Big Skill (RB/LB/TE)': ['forty_yard_dash', 'vertical_jump', 'pro_agility_shuttle', 'broad_jump', 'bench_press_225'],
        'Linemen (OL/DL)': ['forty_yard_dash', 'pro_agility_shuttle', 'broad_jump', 'bench_press_225', 'ten_yard_split'],
        'Specialists': []
    },
    'Volleyball': {
        'Hitters': ['vertical_jump', 'approach_touch', 'block_touch'],
        'Setters': ['vertical_jump', 'approach_touch', 'pro_agility_shuttle'],
        'Liberos/DS': ['pro_agility_shuttle', 'vertical_jump'],
        'Middles': ['vertical_jump', 'approach_touch', 'block_touch']
    }
};
