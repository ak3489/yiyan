const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const config = require('./config');
const apiRouter = require('./routes');

function resolveCorsOrigin(origin) {
  if (!origin) {
    return true; // 同源 / 服务端调用
  }
  if (config.corsOrigins.indexOf('*') !== -1) {
    return true;
  }
  return config.corsOrigins.indexOf(origin) !== -1;
}

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: config.bodyLimit }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    cors({
      origin: function (origin, callback) {
        callback(null, resolveCorsOrigin(origin));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  // 简易访问日志
  app.use(function (req, res, next) {
    const startedAt = Date.now();
    res.on('finish', function () {
      console.log(
        '[http] ' +
          req.method +
          ' ' +
          req.originalUrl +
          ' -> ' +
          res.statusCode +
          ' (' +
          (Date.now() - startedAt) +
          'ms)'
      );
    });
    next();
  });

  app.use('/api', apiRouter);

  // 未匹配的 API 路由统一返回 JSON
  app.use('/api', function (req, res) {
    res.status(404).json({ error: '接口不存在：' + req.method + ' ' + req.originalUrl });
  });

  // 生产模式下由后端托管前端构建产物
  const distDir = config.frontendDist;
  const hasFrontendBuild = fs.existsSync(path.join(distDir, 'index.html'));

  if (hasFrontendBuild) {
    app.use(express.static(distDir));
    app.get('*', function (req, res) {
      res.sendFile(path.join(distDir, 'index.html'));
    });
    console.log('[http] 已启用前端静态资源托管：' + distDir);
  } else {
    app.get('*', function (req, res) {
      res
        .status(404)
        .json({ error: '页面不存在。前端尚未构建，请执行 npm run build 或访问 Vite 开发服务器。' });
    });
  }

  // 统一错误处理
  app.use(function (err, req, res, next) {
    console.error('[error] ' + (err && err.stack ? err.stack : err));
    if (res.headersSent) {
      next(err);
      return;
    }
    res.status(500).json({
      error: '服务器内部错误，请稍后重试',
      detail: config.isProduction ? undefined : String((err && err.message) || err)
    });
  });

  return app;
}

module.exports = {
  createApp
};
