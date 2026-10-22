const crypto = require('crypto');

// 去掉 I / O / 0 / 1 等易混淆字符
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(length) {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

function randomDigits(length) {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += crypto.randomInt(0, 10);
  }
  return out;
}

/** 生成信标编号，例如 TST-K7QM-4821 */
function generateCapsuleId() {
  return 'TST-' + randomCode(4) + '-' + randomDigits(4);
}

/** 生成立嘱人管理密钥，例如 ADM-K7QM-4821 */
function generateAdminKey() {
  return 'ADM-' + randomCode(4) + '-' + randomDigits(4);
}

/** 统一大小写用于信标编号的模糊查询 */
function normalizeId(id) {
  return String(id || '').trim().toUpperCase();
}

module.exports = {
  randomCode,
  randomDigits,
  generateCapsuleId,
  generateAdminKey,
  normalizeId
};
