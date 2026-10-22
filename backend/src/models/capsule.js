const { getDb } = require('../db');
const { normalizeId } = require('../utils/ids');

const COLLECTION_NAME = 'capsules';

let indexesPromise = null;

/**
 * 获取 capsules 集合并保证索引存在（索引只需创建一次）。
 */
async function getCollection() {
  const db = getDb();
  const collection = db.collection(COLLECTION_NAME);

  if (!indexesPromise) {
    indexesPromise = (async function () {
      await collection.createIndex({ idUpper: 1 }, { unique: true, name: 'uniq_id_upper' });
      await collection.createIndex({ status: 1, unlockAt: 1 }, { name: 'status_unlock_at' });
      await collection.createIndex({ createdAt: -1 }, { name: 'created_at_desc' });
    })().catch(function (err) {
      indexesPromise = null;
      throw err;
    });
  }

  await indexesPromise;

  return collection;
}

/**
 * 转换为前端使用的公开元信息（不包含密码、管理密钥与正文）。
 */
function toPublicMeta(doc, now) {
  const current = typeof now === 'number' ? now : Date.now();
  return {
    id: doc.id,
    title: doc.title,
    recipientName: doc.recipientName,
    unlockAt: doc.unlockAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    isLocked: current < doc.unlockAt,
    passwordHint: doc.passwordHint || ''
  };
}

/**
 * 转换为完整的信标对象（字段与前端 TestamentCapsule 类型保持一致）。
 */
function toCapsule(doc) {
  if (!doc) {
    return null;
  }
  return {
    id: doc.id,
    adminKey: doc.adminKey,
    title: doc.title,
    recipientName: doc.recipientName,
    unlockAt: doc.unlockAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    password: doc.password,
    passwordHint: doc.passwordHint || '',
    payload: doc.payload || {},
    status: doc.status || 'active'
  };
}

async function listActive() {
  const collection = await getCollection();
  return collection
    .find({ status: { $ne: 'revoked' } })
    .sort({ createdAt: -1 })
    .toArray();
}

async function findById(id) {
  const collection = await getCollection();
  return collection.findOne({ idUpper: normalizeId(id) });
}

async function insert(capsule) {
  const collection = await getCollection();
  const doc = Object.assign({}, capsule, {
    idUpper: normalizeId(capsule.id),
    createdAt: capsule.createdAt || Date.now(),
    updatedAt: capsule.updatedAt || capsule.createdAt || Date.now()
  });
  await collection.insertOne(doc);
  return doc;
}

async function updateById(id, patch) {
  const collection = await getCollection();
  const result = await collection.findOneAndUpdate(
    { idUpper: normalizeId(id) },
    { $set: Object.assign({}, patch, { updatedAt: patch.updatedAt || Date.now() }) },
    { returnDocument: 'after' }
  );
  // 兼容不同驱动版本：v4 返回 { value } 包装，v5+ 直接返回文档
  return result && result.value !== undefined ? result.value : result;
}

async function removeById(id) {
  const collection = await getCollection();
  const result = await collection.deleteOne({ idUpper: normalizeId(id) });
  return result.deletedCount;
}

async function countAll() {
  const collection = await getCollection();
  return collection.countDocuments({});
}

module.exports = {
  COLLECTION_NAME,
  getCollection,
  toPublicMeta,
  toCapsule,
  listActive,
  findById,
  insert,
  updateById,
  removeById,
  countAll
};
