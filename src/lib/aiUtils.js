/**
 * AI Utility Functions
 * Robust retry wrapper for handling transient API errors (503, 429)
 * 
 * @module aiUtils
 */

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wraps an async function with retry logic and exponential backoff.
 * Specifically handles 503 (Overloaded) and 429 (Rate Limit) errors.
 * 
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Configuration options
 * @param {number} options.maxRetries - Maximum retry attempts (1-5, default: 3)
 * @param {number} options.baseDelay - Initial delay in ms (default: 1000)
 * @param {Function} options.onRetry - Callback when retrying (receives attempt number and error)
 * @returns {Promise<any>} Result of the function execution
 * @throws {Error} After all retries exhausted or on non-retryable errors
 */
export async function withRetry(fn, options = {}) {
    const {
        maxRetries = 3,
        baseDelay = 1000,
        onRetry = null
    } = options;

    // Safety check: cap retries at 5 to prevent infinite loops
    const safeMaxRetries = Math.min(Math.max(maxRetries, 1), 5);

    let lastError;

    for (let attempt = 1; attempt <= safeMaxRetries + 1; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Check if error is retryable (503, 429, or other 5xx errors)
            const isRetryable = isRetryableError(error);

            if (!isRetryable || attempt > safeMaxRetries) {
                throw error;
            }

            // Calculate delay with exponential backoff
            const delay = baseDelay * Math.pow(2, attempt - 1);

            if (import.meta.env.DEV) {
                console.warn(`[withRetry] Attempt ${attempt}/${safeMaxRetries} failed:`, error.message);
                console.warn(`[withRetry] Retrying in ${delay}ms...`);
            }

            // Notify caller if callback provided
            if (onRetry) {
                onRetry(attempt, error, delay);
            }

            await wait(delay);
        }
    }

    throw lastError;
}

/**
 * Determines if an error is retryable based on status code or message.
 * Retryable: 429 (Rate Limit), 503 (Overloaded), other 5xx errors
 * 
 * @param {Error} error - The error to check
 * @returns {boolean} True if the error is retryable
 */
export function isRetryableError(error) {
    const message = error.message?.toLowerCase() || '';
    const status = error.status || error.statusCode;

    // Check for specific status codes
    if (status === 429 || status === 503) return true;

    // Check for 5xx errors
    if (status >= 500 && status < 600) return true;

    // Check error message for common patterns
    if (message.includes('429') || message.includes('rate limit')) return true;
    if (message.includes('503') || message.includes('overloaded')) return true;
    if (message.includes('service unavailable')) return true;
    if (message.includes('temporarily unavailable')) return true;
    if (message.includes('internal server error')) return true;

    return false;
}

/**
 * Creates a retry status message for UI display.
 * 
 * @param {number} attempt - Current attempt number
 * @param {number} maxAttempts - Maximum attempts
 * @returns {string} User-friendly status message
 */
export function getRetryStatusMessage(attempt, maxAttempts) {
    if (attempt === 1) return 'Processing...';
    if (attempt === 2) return 'Server busy, retrying...';
    if (attempt >= 3) return `Retrying (${attempt}/${maxAttempts})...`;
    return 'Processing...';
}
