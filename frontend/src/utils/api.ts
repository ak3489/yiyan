import type {
  CapsulePublicMeta,
  ServerTimeResponse,
  UnlockResponse,
  TestamentCapsule,
  TestamentPayload
} from '../types/testament.ts';

export interface MyCapsuleRecord {
  id: string;
  adminKey: string;
  title: string;
  unlockAt: number;
  createdAt: number;
}

const STORAGE_KEY = 'chronicle_my_capsules_v1';

export function getMySavedCapsules(): MyCapsuleRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export function saveMyCapsuleRecord(record: MyCapsuleRecord) {
  try {
    const list = getMySavedCapsules();
    const existingIndex = list.findIndex(item => item.id === record.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...record };
    } else {
      list.unshift(record);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export function removeMyCapsuleRecord(id: string) {
  try {
    const list = getMySavedCapsules().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }
}

export async function fetchServerTime(): Promise<ServerTimeResponse> {
  const res = await fetch('/api/time');
  if (!res.ok) throw new Error('无法连接到服务器时间服务');
  return res.json();
}

export async function fetchCapsulesList(): Promise<CapsulePublicMeta[]> {
  const res = await fetch('/api/capsules');
  if (!res.ok) throw new Error('无法获取遗言信标列表');
  return res.json();
}

export async function fetchCapsuleMeta(id: string): Promise<CapsulePublicMeta> {
  const res = await fetch(`/api/capsules/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || '未找到该遗言信标');
  }
  return res.json();
}

export async function unlockCapsule(id: string, password: string): Promise<UnlockResponse> {
  const res = await fetch(`/api/capsules/${encodeURIComponent(id)}/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  const data = await res.json();
  if (!res.ok && !data.matchesPassword && !data.isTimeLocked) {
    throw new Error(data.error || '解锁失败');
  }
  return data;
}

export async function createCapsule(data: {
  title: string;
  recipientName: string;
  unlockAt: number;
  password: string;
  passwordHint: string;
  payload: TestamentPayload;
}): Promise<{ id: string; adminKey: string; unlockAt: number; title: string }> {
  const res = await fetch('/api/capsules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || '创建遗言信标失败');
  }
  const result = await res.json();
  saveMyCapsuleRecord({
    id: result.id,
    adminKey: result.adminKey,
    title: result.title,
    unlockAt: result.unlockAt,
    createdAt: Date.now()
  });
  return result;
}

export async function verifyAdminAndLoad(id: string, adminKey: string): Promise<TestamentCapsule> {
  const res = await fetch(`/api/capsules/${encodeURIComponent(id)}/verify-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminKey })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || '管理密钥校验失败');
  }
  const data = await res.json();
  return data.capsule;
}

export async function updateCapsule(id: string, adminKey: string, data: Partial<TestamentCapsule>): Promise<TestamentCapsule> {
  const res = await fetch(`/api/capsules/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminKey, ...data })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || '更新遗言失败');
  }
  const result = await res.json();
  saveMyCapsuleRecord({
    id: result.capsule.id,
    adminKey: result.capsule.adminKey,
    title: result.capsule.title,
    unlockAt: result.capsule.unlockAt,
    createdAt: result.capsule.createdAt
  });
  return result.capsule;
}

export async function deleteCapsule(id: string, adminKey: string): Promise<void> {
  const res = await fetch(`/api/capsules/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminKey })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || '撤回销毁失败');
  }
  removeMyCapsuleRecord(id);
}
