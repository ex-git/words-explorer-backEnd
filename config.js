'use strict'

exports.PORT = process.env.PORT || 8080;
exports.DATABASE_URL = process.env.DATABASE || "mongodb://localhost/business";
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE || "mongodb://localhost/business-test";
exports.JWT_SECRET = process.env.JWT_SECRET || "7AQJiJbYnLrt57NxfdbHuy3hz2CxQKjf";
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '10m';
exports.CLIENT_ORIGIN = '*'