const config = require('./config');
const db = require('./db');
const { createApp } = require('./app');

async function bootstrap() {
  await db.connect();

  const app = createApp();
  const server = app.listen(config.port, '0.0.0.0', function () {
    console.log('');
    console.log('  时光遗嘱·数字财产与遗言信标 —— 后端服务');
    console.log('  环境      : ' + config.nodeEnv);
    console.log('  接口地址  : http://localhost:' + config.port + '/api');
    console.log('  健康检查  : http://localhost:' + config.port + '/api/health');
    console.log('  数据库    : ' + config.mongodbDb + ' @ ' + config.mongodbUri);
    console.log('');
  });

  const shutdown = function (signal) {
    console.log('\n[server] 收到 ' + signal + '，正在优雅退出...');
    server.close(function () {
      db.close()
        .catch(function () {})
        .then(function () {
          process.exit(0);
        });
    });
    // 兜底：10 秒内未关闭则强制退出
    setTimeout(function () {
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGINT', function () {
    shutdown('SIGINT');
  });
  process.on('SIGTERM', function () {
    shutdown('SIGTERM');
  });
}

bootstrap().catch(function (err) {
  console.error('[server] 启动失败：', err && err.message ? err.message : err);
  console.error('[server] 请确认 MongoDB 已启动，并检查 backend/.env 中的 MONGODB_URI 配置。');
  db.close()
    .catch(function () {})
    .then(function () {
      process.exit(1);
    });
});
