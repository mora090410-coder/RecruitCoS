const STORAGE_KEY = 'rc_attribution';
const SESSION_KEY = 'rc_session_started';

const browserWindow = typeof window !== 'undefined' ? window : null;
const isBrowser = Boolean(browserWindow);
const isDev = import.meta.env.DEV;

const env = {
  posthogKey: import.meta.env.VITE_POSTHOG_KEY,
  mixpanelToken: import.meta.env.VITE_MIXPANEL_TOKEN,
  gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID
};

const hasProvider = Boolean(
  (env.posthogKey && browserWindow?.posthog) ||
  (env.mixpanelToken && browserWindow?.mixpanel) ||
  (env.gaMeasurementId && browserWindow?.gtag)
);

const safe = (fn) => {
  try {
    fn();
  } catch (error) {
    if (isDev) {
      console.warn('[analytics] non-blocking tracking error', error);
    }
  }
};

const fireAndForget = (fn) => {
  Promise.resolve().then(() => safe(fn));
};

const devLog = (type, name, props) => {
  if (isDev && !hasProvider) {
    console.log(`[analytics:${type}] ${name}`, props || {});
  }
};

const normalizeString = (value) => (typeof value === 'string' && value.trim() ? value : null);

const parseAttributionFromLocation = () => {
  if (!isBrowser) return null;
  const params = new URLSearchParams(window.location.search || '');
  const data = {
    referrer: normalizeString(document.referrer),
    utm_source: normalizeString(params.get('utm_source')),
    utm_medium: normalizeString(params.get('utm_medium')),
    utm_campaign: normalizeString(params.get('utm_campaign')),
    utm_content: normalizeString(params.get('utm_content')),
    utm_term: normalizeString(params.get('utm_term')),
    gclid: normalizeString(params.get('gclid')),
    fbclid: normalizeString(params.get('fbclid')),
    landing_path: `${browserWindow.location.pathname || '/'}${browserWindow.location.search || ''}`
  };
  return data;
};

const readStoredAttribution = () => {
  if (!isBrowser) return null;
  try {
    const raw = browserWindow.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    if (isDev) {
      console.warn('[analytics] failed to read attribution', error);
    }
    return null;
  }
};

export const getStoredAttribution = () => readStoredAttribution();

export const captureAttributionOnce = () => {
  if (!isBrowser) return null;
  const existing = readStoredAttribution();
  if (existing) return existing;

  const attribution = {
    ...parseAttributionFromLocation(),
    captured_at: new Date().toISOString()
  };

  safe(() => {
    browserWindow.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  });

  track('acquisition_attribution_captured', attribution);
  return attribution;
};

export const getAttributionProps = () => {
  const data = readStoredAttribution();
  if (!data) return {};
  return {
    referrer: data.referrer || null,
    utm_source: data.utm_source || null,
    utm_medium: data.utm_medium || null,
    utm_campaign: data.utm_campaign || null,
    utm_content: data.utm_content || null,
    utm_term: data.utm_term || null,
    gclid: data.gclid || null,
    fbclid: data.fbclid || null,
    landing_path: data.landing_path || null
  };
};

export const ensureSignupTimestamp = (value) => {
  if (!isBrowser || !value) return value;
  safe(() => {
    if (!browserWindow.localStorage.getItem('rc_signup_ts')) {
      browserWindow.localStorage.setItem('rc_signup_ts', value);
    }
  });
  return value;
};

export const getSignupTimestamp = () => {
  if (!isBrowser) return null;
  try {
    return browserWindow.localStorage.getItem('rc_signup_ts');
  } catch {
    return null;
  }
};

export const markSessionStart = (route) => {
  if (!isBrowser) return;
  const alreadyMarked = browserWindow.sessionStorage.getItem(SESSION_KEY);
  if (alreadyMarked) return;
  safe(() => {
    browserWindow.sessionStorage.setItem(SESSION_KEY, '1');
  });
  track('session_start', { route });
};

export const page = (name, props = {}) => {
  fireAndForget(() => {
    if (browserWindow?.posthog && env.posthogKey) {
      browserWindow.posthog.capture('$pageview', { page_name: name, ...props });
    } else if (browserWindow?.mixpanel && env.mixpanelToken) {
      browserWindow.mixpanel.track('page_view', { page_name: name, ...props });
    } else if (browserWindow?.gtag && env.gaMeasurementId) {
      browserWindow.gtag('event', 'page_view', { page_title: name, ...props });
    } else {
      devLog('page', name, props);
    }
  });
};

export const identify = (id, traits = {}) => {
  if (!id) return;
  fireAndForget(() => {
    if (browserWindow?.posthog && env.posthogKey) {
      browserWindow.posthog.identify(id, traits);
    } else if (browserWindow?.mixpanel && env.mixpanelToken) {
      browserWindow.mixpanel.identify(id);
      browserWindow.mixpanel.people?.set?.(traits);
    } else if (browserWindow?.gtag && env.gaMeasurementId) {
      browserWindow.gtag('set', 'user_properties', traits);
    } else {
      devLog('identify', id, traits);
    }
  });
};

export const track = (name, props = {}) => {
  fireAndForget(() => {
    if (browserWindow?.posthog && env.posthogKey) {
      browserWindow.posthog.capture(name, props);
    } else if (browserWindow?.mixpanel && env.mixpanelToken) {
      browserWindow.mixpanel.track(name, props);
    } else if (browserWindow?.gtag && env.gaMeasurementId) {
      browserWindow.gtag('event', name, props);
    } else {
      devLog('track', name, props);
    }
  });
};

export const trackAppError = (location, error, extra = {}) => {
  track('app_error', {
    location,
    message: error?.message || String(error || 'unknown_error'),
    code: error?.code || null,
    ...extra
  });
};
