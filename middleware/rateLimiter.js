import rateLimit from 'express-rate-limit'
const rateLimiter = rateLimit ({
    windowMs: 10* 60 * 1000, // 1 minute
    max: 2,
    message: "Too many requests from this IP, please try again later after 10 min",
    // standard headers
    standardHeaders: true,
    legacyHeaders: false,
})

export default rateLimiter