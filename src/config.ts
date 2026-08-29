const ONE_SEC = 1000
const ONE_MIN = ONE_SEC * 60

// TODO: Refactor this flat configuration object into domain-specific configuration modules.
export const config = {
  // Timeouts & Intervals
  typingIndicatorIntervalMs: ONE_SEC * 10,
  commandTimeoutMs: ONE_MIN * 5,
  commandCheckIntervalMs: ONE_MIN,
  watchTimeoutMs: ONE_MIN * 5,
  markovUpdateIntervalMs: ONE_MIN * 60,

  // Message Fetching
  messageSearchLimit: 50,
  maxMessagesToFetch: 500,
  messagesPerRequestLimit: 100,
  messagesBeforeSaveThreshold: 100,

  // Image Processing - Resolution
  effectMaxResolution: { height: 800, width: 800 },
  randomImageMaxResolution: { height: 600, width: 600 },

  // Image Processing - Ratios
  defaultOverlayRatio: 0.25,
  effectOverlayRatio: 1.5,
  tomatoOverlayRatio: 1.5,
  nonTransparentOverlayRatio: 0.1,
  defaultPositionOverflowPercent: 0.3,

  // Image Processing - GIF/PNG Encoding
  pngColorCount: 256,
  pngDitherLevel: 1,
  gifQuantizeColors: 256,
  gifLoopCount: 0,
  defaultFrameDelayCentisecs: 10,

  // FFmpeg
  mp4ToGifFps: 10,
  mp4ToGifScaleWidth: 320,
  ffmpegOptimizeScaleWidth: 300,
  ffmpegOptimizeFps: 10,
  ffmpegOptimizeLoopCount: 0,
  ffmpegBgLoopCount: 1,

  // FFmpeg Random Positioning
  ffmpegCenterRandomXMin: -200,
  ffmpegCenterRandomXMax: 200,
  ffmpegCenterRandomYMin: -50,
  ffmpegCenterRandomYMax: 600,

  // Tomato Positioning
  tomatoRandomXMin: -200,
  tomatoRandomXMax: 40,
  tomatoRandomYMin: -150,
  tomatoRandomYMax: -50,
  tomatoYPositionDivisor: 3,

  // Tomato Command Limits
  maxTomatoAmount: 50,
  minTomatoAmount: -1,

  // Boomerify
  boomerifyEffectChanceMax: 3,

  // Markov Chain
  markovDefaultNgrams: 2,
  markovMaxResultLength: 10,
  markovMinWordCount: 5,
  markovMaxAttempts: 8,
  markovSeedAttemptThreshold: 5,

  // Logging
  defaultLogLevel: 'info' as const,
  logRedactedFields: ['req.headers.authorization', 'user.password', 'email'],

  // HTTP
  httpUserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
} as const
