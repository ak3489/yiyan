const express = require('express');

const capsuleModel = require('../models/capsule');
const { asyncHandler } = require('../utils/asyncHandler');
const { generateCapsuleId, generateAdminKey } = require('../utils/ids');

const router = express.Router();

/**
 * 2. 公开的信标列表（仅非敏感信息）
 */
router.get(
  '/capsules',
  asyncHandler(async function (req, res) {
    const docs = await capsuleModel.listActive();
    const now = Date.now();
    const metas = docs.map(function (doc) {
      return capsuleModel.toPublicMeta(doc, now);
    });
    res.json(metas);
  })
);

/**
 * 3. 查询单个信标的公开信息（不返回敏感内容）
 */
router.get(
  '/capsules/:id',
  asyncHandler(async function (req, res) {
    const doc = await capsuleModel.findById(req.params.id);

    if (!doc || doc.status === 'revoked') {
      res.status(404).json({ error: '未找到该遗言信标，请核对信标编号是否正确' });
      return;
    }

    res.json(capsuleModel.toPublicMeta(doc, Date.now()));
  })
);

/**
 * 4. 接收者解锁尝试（以服务器时间与访问密码为准）
 */
router.post(
  '/capsules/:id/unlock',
  asyncHandler(async function (req, res) {
    const now = Date.now();
    const password = req.body && req.body.password;
    const doc = await capsuleModel.findById(req.params.id);

    if (!doc || doc.status === 'revoked') {
      res.status(404).json({
        success: false,
        error: '该遗言信标不存在或已被立嘱人注销撤回',
        serverTime: now
      });
      return;
    }

    const matches = String(doc.password || '').trim() === String(password || '').trim();

    if (!matches) {
      res.status(401).json({
        success: false,
        matchesPassword: false,
        serverTime: now,
        error: '访问密码不正确，请向立嘱人确认或根据提示回忆'
      });
      return;
    }

    // 密码正确但尚未到达解锁时间：返回时间锁状态
    if (now < doc.unlockAt) {
      res.json({
        success: false,
        isTimeLocked: true,
        matchesPassword: true,
        serverTime: now,
        unlockAt: doc.unlockAt,
        remainingMs: doc.unlockAt - now,
        title: doc.title,
        recipientName: doc.recipientName,
        message:
          '密码验证成功！但根据立嘱人设定，该遗言受服务器时间锁保护，尚未到达开启时刻。服务器时间具备防篡改保护，请在解锁时间后再来提取。'
      });
      return;
    }

    // 解锁成功：返回完整遗言内容
    res.json({
      success: true,
      serverTime: now,
      unlockAt: doc.unlockAt,
      title: doc.title,
      recipientName: doc.recipientName,
      payload: doc.payload
    });
  })
);

/**
 * 5. 创建新的遗言信标
 */
router.post(
  '/capsules',
  asyncHandler(async function (req, res) {
    const body = req.body || {};
    const { title, recipientName, unlockAt, password, passwordHint, payload } = body;

    if (!title || !unlockAt || !password || !payload) {
      res.status(400).json({
        error: '请完整填写必填信息（标题、解锁时间、访问密码与遗言内容）'
      });
      return;
    }

    const now = Date.now();
    const newCapsule = {
      id: generateCapsuleId(),
      adminKey: generateAdminKey(),
      title: String(title).trim(),
      recipientName: String(recipientName || '致挚爱亲友').trim(),
      unlockAt: Number(unlockAt),
      createdAt: now,
      updatedAt: now,
      password: String(password).trim(),
      passwordHint: String(passwordHint || '').trim(),
      payload: payload,
      status: 'active'
    };

    await capsuleModel.insert(newCapsule);

    res.status(201).json({
      success: true,
      id: newCapsule.id,
      adminKey: newCapsule.adminKey,
      title: newCapsule.title,
      unlockAt: newCapsule.unlockAt,
      createdAt: newCapsule.createdAt,
      passwordHint: newCapsule.passwordHint
    });
  })
);

/**
 * 6. 立嘱人管理：校验管理密钥并读取完整数据用于编辑
 */
router.post(
  '/capsules/:id/verify-admin',
  asyncHandler(async function (req, res) {
    const body = req.body || {};
    const adminKey = body.adminKey;
    const doc = await capsuleModel.findById(req.params.id);

    if (!doc) {
      res.status(404).json({ error: '未找到指定编号的遗言信标' });
      return;
    }

    if (String(doc.adminKey || '').trim() !== String(adminKey || '').trim()) {
      res.status(403).json({ error: '立嘱人管理密钥错误，无法访问编辑权限' });
      return;
    }

    res.json({
      success: true,
      capsule: capsuleModel.toCapsule(doc)
    });
  })
);

/**
 * 7. 更新已存在的遗言信标
 */
router.put(
  '/capsules/:id',
  asyncHandler(async function (req, res) {
    const body = req.body || {};
    const {
      adminKey,
      title,
      recipientName,
      unlockAt,
      password,
      passwordHint,
      payload
    } = body;

    const doc = await capsuleModel.findById(req.params.id);

    if (!doc) {
      res.status(404).json({ error: '未找到指定遗言' });
      return;
    }

    if (String(doc.adminKey || '').trim() !== String(adminKey || '').trim()) {
      res.status(403).json({ error: '立嘱人管理密钥错误，无权修改' });
      return;
    }

    const patch = {
      title: title ? String(title).trim() : doc.title,
      recipientName: recipientName ? String(recipientName).trim() : doc.recipientName,
      unlockAt: unlockAt ? Number(unlockAt) : doc.unlockAt,
      password: password ? String(password).trim() : doc.password,
      passwordHint: passwordHint !== undefined ? String(passwordHint).trim() : doc.passwordHint,
      payload: payload || doc.payload,
      updatedAt: Date.now()
    };

    const updated = await capsuleModel.updateById(req.params.id, patch);

    res.json({
      success: true,
      message: '遗言修改成功并已安全存入保险箱！',
      capsule: capsuleModel.toCapsule(updated)
    });
  })
);

/**
 * 8. 撤回并销毁信标
 */
router.delete(
  '/capsules/:id',
  asyncHandler(async function (req, res) {
    const body = req.body || {};
    const adminKey = body.adminKey;
    const doc = await capsuleModel.findById(req.params.id);

    if (!doc) {
      res.status(404).json({ error: '未找到指定遗言' });
      return;
    }

    if (String(doc.adminKey || '').trim() !== String(adminKey || '').trim()) {
      res.status(403).json({ error: '管理密钥不匹配，无法撤回' });
      return;
    }

    await capsuleModel.removeById(req.params.id);

    res.json({ success: true, message: '遗言已彻底销毁并从保险库移除' });
  })
);

module.exports = router;
