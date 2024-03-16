import pino from 'pino';

export default pino(
  process.env.NM_APP_ENV === 'dev'
    ? {
        transport: {
          target: 'pino-pretty'
        }
      }
    : null
);
