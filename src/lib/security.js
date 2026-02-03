import { useRef, useCallback } from 'react';

// --- Input Sanitization ---

/**
 * Strips potentially dangerous characters and sequences from user input
 * before sending to AI prompts.
 * @param {string} input 
 * @returns {string} 
 */
export function sanitizeInput(input) {
    if (!input) return '';
    if (typeof input !== 'string') return String(input);

    return input
        // Remove null bytes
        .replace(/\0/g, '')
        // Remove potential prompt injection sequences
        .replace(/ignore previous instructions/gi, '[REDACTED]')
        .replace(/system prompt/gi, '[REDACTED]')
        // Normalize heavy whitespace
        .trim();
}

/**
 * Safely parses a number, returning null if invalid.
 * @param {any} value 
 * @returns {number|null} 
 */
export function safeParseNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
}

// --- Rate Limiting (Throttler) ---

/**
 * A hook that returns a throttled function.
 * @param {Function} callback - The function to throttle
 * @param {number} delay - Delay in ms
 * @returns {Function} - The throttled function
 */
export function useThrottledCallback(callback, delay) {
    const lastRun = useRef(0);

    return useCallback((...args) => {
        const now = Date.now();
        if (now - lastRun.current >= delay) {
            lastRun.current = now;
            return callback(...args);
        } else {
            console.warn(`Throttled: Please wait ${((delay - (now - lastRun.current)) / 1000).toFixed(1)}s`);
            // Optionally throw or return specific value indicating throttle
            return { throttled: true, wait: delay - (now - lastRun.current) };
        }
    }, [callback, delay]);
}

/**
 * Helper to check throttle state without executing.
 * Use this in UI to disable buttons.
 */
export function isThrottled(lastRunTimestamp, delay) {
    return Date.now() - lastRunTimestamp < delay;
}
