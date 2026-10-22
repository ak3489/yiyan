const { MongoClient } = require('mongodb');
const config = require('./config');

let client = null;
let database = null;
let connecting = null;
let lastHeartbeatWarningAt = 0;

const HEARTBEAT_WARNING_INTERVAL = 30000;

/**
 * 建立 MongoDB 连接（幂等）。连接失败会抛出异常，由调用方决定是否退出进程。
 */
async function connect() {
  if (database) {
    return database;
  }

  if (!connecting) {
    connecting = (async function () {
      const mongoClient = new MongoClient(config.mongodbUri, {
        retryWrites: config.mongoRetryWrites,
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000
      });

      mongoClient.on('serverHeartbeatFailed', function () {
        // 心跳失败可能频繁触发，这里做节流，避免刷屏
        const now = Date.now();
        if (now - lastHeartbeatWarningAt < HEARTBEAT_WARNING_INTERVAL) {
          return;
        }
        lastHeartbeatWarningAt = now;
        console.warn('[db] MongoDB 心跳失败，请检查数据库服务是否正常运行');
      });

      await mongoClient.connect();
      await mongoClient.db(config.mongodbDb).command({ ping: 1 });

      client = mongoClient;
      database = mongoClient.db(config.mongodbDb);
      console.log('[db] 已连接 MongoDB：' + config.mongodbDb + ' @ ' + config.mongodbUri);
      return database;
    })();
  }

  try {
    return await connecting;
  } finally {
    connecting = null;
  }
}

function getDb() {
  if (!database) {
    throw new Error('MongoDB 尚未连接，请先调用 connect()');
  }
  return database;
}

async function close() {
  if (client) {
    await client.close();
    client = null;
    database = null;
    console.log('[db] MongoDB 连接已关闭');
  }
}

module.exports = {
  connect,
  getDb,
  close
};
