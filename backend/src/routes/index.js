const express = require('express');

const config = require('../config');
const capsuleModel = require('../models/capsule');
const { asyncHandler } = require('../utils/asyncHandler');
const timeRouter = require('./time');
const capsuleRouter = require('./capsules');

const router = express.Router();

/**
 * 健康检查：同时确认 MongoDB 连接与集合可读
 */
router.get(
  '/health',
  asyncHandler(async function (req, res) {
    const total = await capsuleModel.countAll();
    res.json({
      status: 'ok',
      database: 'connected',
      dbName: config.mongodbDb,
      capsules: total,
      serverTime: Date.now(),
      uptime: process.uptime()
    });
  })
);

router.use('/', timeRouter);
router.use('/', capsuleRouter);

module.exports = router;
