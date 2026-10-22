const express = require('express');

const router = express.Router();

/**
 * 1. 权威服务器时间接口（防客户端时间篡改）
 */
router.get('/time', function (req, res) {
  const now = Date.now();
  res.json({
    now: now,
    iso: new Date(now).toISOString()
  });
});

module.exports = router;
