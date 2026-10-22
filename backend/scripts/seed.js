/**
 * 数据初始化脚本：把演示数据写入 MongoDB。
 * 用法：npm run seed
 */
const fs = require('fs');
const path = require('path');

const db = require('../src/db');
const capsuleModel = require('../src/models/capsule');
const { normalizeId } = require('../src/utils/ids');

const SEED_FILE = path.resolve(__dirname, '..', 'src', 'seed', 'demoData.json');

async function main() {
  await db.connect();

  const raw = fs.readFileSync(SEED_FILE, 'utf-8');
  const capsules = JSON.parse(raw);

  if (!Array.isArray(capsules) || capsules.length === 0) {
    throw new Error('演示数据文件为空或格式不正确：' + SEED_FILE);
  }

  const collection = await capsuleModel.getCollection();
  let inserted = 0;
  let updated = 0;

  for (let i = 0; i < capsules.length; i += 1) {
    const capsule = capsules[i];
    const doc = Object.assign({}, capsule, {
      idUpper: normalizeId(capsule.id),
      payload: capsule.payload || {},
      status: capsule.status || 'active'
    });

    const result = await collection.updateOne(
      { idUpper: doc.idUpper },
      { $set: doc },
      { upsert: true }
    );

    if (result.upsertedCount) {
      inserted += 1;
      console.log('[seed] 新增：' + doc.id + ' — ' + doc.title);
    } else {
      updated += 1;
      console.log('[seed] 已存在（已更新）：' + doc.id + ' — ' + doc.title);
    }
  }

  const total = await capsuleModel.countAll();
  console.log('');
  console.log('[seed] 完成：新增 ' + inserted + ' 条，更新 ' + updated + ' 条，当前库内共 ' + total + ' 条信标。');
}

main()
  .then(function () {
    return db.close();
  })
  .then(function () {
    process.exit(0);
  })
  .catch(function (err) {
    console.error('[seed] 执行失败：', err);
    db.close()
      .catch(function () {})
      .then(function () {
        process.exit(1);
      });
  });
