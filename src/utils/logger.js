const LOG_LEVELS = {
  none: 0,
  error: 1,
  warn: 2,
  log: 3,
  debug: 4,
};

const logConfig = {
  level: LOG_LEVELS.log,
  enabled: true,
  timestamp: true,
};

const isProduction = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production';
  }
  if (typeof window !== 'undefined') {
    return window.location?.hostname !== 'localhost' &&
      !window.location?.hostname?.startsWith('127.0.0.1');
  }
  return false;
};

const getConfiguredLevel = () => {
  if (typeof process !== 'undefined' && process.env?.GUIA_LOG_LEVEL) {
    return process.env.GUIA_LOG_LEVEL.toLowerCase();
  }
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('GUIA_LOG_LEVEL');
      if (stored) return stored.toLowerCase();
    } catch {
      // localStorage unavailable; keep default resolution
    }
  }
  return isProduction() ? 'error' : 'log';
};

const initializeConfig = () => {
  const levelName = getConfiguredLevel();
  logConfig.level = LOG_LEVELS[levelName] ?? LOG_LEVELS.log;
  logConfig.enabled = logConfig.level > LOG_LEVELS.none;
};

initializeConfig();

const isLevelEnabled = (level) => logConfig.enabled && logConfig.level >= level;
const withPrefix = (message) =>
  logConfig.timestamp ? [`[${formatTimestamp()}]`, message] : [message];

export const formatTimestamp = () => new Date().toISOString();

export function log(message, ...params) {
  if (isLevelEnabled(LOG_LEVELS.log)) {
    console.log(...withPrefix(message), ...params);
  }
}

export function warn(message, ...params) {
  if (isLevelEnabled(LOG_LEVELS.warn)) {
    console.warn(...withPrefix(message), ...params);
  }
}

export function error(message, ...params) {
  if (isLevelEnabled(LOG_LEVELS.error)) {
    console.error(...withPrefix(message), ...params);
  }
}

export function debug(message, ...params) {
  if (isLevelEnabled(LOG_LEVELS.debug)) {
    console.debug(...withPrefix(`[DEBUG] ${message}`), ...params);
  }
}

export function setLogLevel(options = {}) {
  if (options.level && LOG_LEVELS[options.level] !== undefined) {
    logConfig.level = LOG_LEVELS[options.level];
  }
  if (typeof options.enabled === 'boolean') {
    logConfig.enabled = options.enabled;
  }
  if (typeof options.timestamp === 'boolean') {
    logConfig.timestamp = options.timestamp;
  }
}

export function getLogLevel() {
  const levelName = Object.keys(LOG_LEVELS).find((key) => LOG_LEVELS[key] === logConfig.level) || 'log';
  return {
    level: logConfig.level,
    levelName,
    enabled: logConfig.enabled,
    timestamp: logConfig.timestamp,
    isProduction: isProduction(),
  };
}
