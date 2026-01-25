import pino from "pino"

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',

  redact: ['req.headers.authorization', 'user.password', 'email'],

  // Use a custom serializer for Errors to ensure stack traces appear cleanly
  serializers: {
    err: pino.stdSerializers.err,
  },

  // In dev, use 'pino-pretty' to make logs readable. 
  // In prod, keep it JSON (undefined transport) for performance.
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  } : undefined
});
