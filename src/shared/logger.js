import log from 'loglevel';

const levels = {
  debug: 'DBG',
  error: 'ERR',
  info: 'INF',
  log: 'DBG',
  trace: 'TRC',
  warn: 'WRN'
};
const methodFactory = log.methodFactory;
// eslint-disable-next-line no-undef
const timeFormatter = Intl.DateTimeFormat('en', {
  hourCycle: 'h23',
  timeStyle: 'medium'
});

log.methodFactory = (methodName, logLevel, loggerName) => {
  const method = methodFactory(methodName, logLevel, loggerName);

  return function (...args) {
    method(
      `[NRD ${timeFormatter.format(Date.now())} ${levels[methodName]}]`,
      ...args
    );
  };
};
log.setLevel(import.meta.env.VITE_LOG_LEVEL, false);

export default log;
