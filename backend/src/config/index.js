const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '..', '..', '.env')
});

function toList(value) {
  return String(value || '')
    .split(',')
    .map(function (item) {
      return item.trim();
    })
    .filter(Boolean);
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
  mongodbDb: process.env.MONGODB_DB || 'yiyan_testament',
  mongoRetryWrites: process.env.MONGO_RETRY_WRITES === 'true',
  corsOrigins: toList(process.env.CORS_ORIGIN || 'http://localhost:5173'),
  frontendDist: path.resolve(
    __dirname,
    '..',
    '..',
    process.env.FRONTEND_DIST || '../frontend/dist'
  ),
  bodyLimit: process.env.BODY_LIMIT || '10mb'
};

config.isProduction = config.nodeEnv === 'production';

module.exports = config;
