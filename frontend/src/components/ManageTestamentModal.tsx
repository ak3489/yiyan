import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  KeyRound,
  Edit3,
  Calendar,
  Lock,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus
} from 'lucide-react';
import {
  getMySavedCapsules,
  verifyAdminAndLoad,
  updateCapsule,
  deleteCapsule
} from '../utils/api.ts';
import type { TestamentCapsule } from '../types/testament.ts';

interface ManageTestamentModalProps {
  initialId?: string;
  initialAdminKey?: string;
  onEditCapsule: (capsule: TestamentCapsule) => void;
  onStartCreate: () => void;
}

export const ManageTestamentModal: React.FC<ManageTestamentModalProps> = ({
  initialId = '',
  initialAdminKey = '',
  onEditCapsule,
  onStartCreate
}) => {
  const [capsuleId, setCapsuleId] = useState<string>(initialId);
  const [adminKey, setAdminKey] = useState<string>(initialAdminKey);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [loadedCapsule, setLoadedCapsule] = useState<TestamentCapsule | null>(null);

  // Quick action states
  const [isChangingPass, setIsChangingPass] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>('');

  // Local storage records
  const [savedRecords, setSavedRecords] = useState(getMySavedCapsules());

  // Sync initial inputs if provided, but DO NOT automatically verify
  useEffect(() => {
    if (initialId) setCapsuleId(initialId);
    if (initialAdminKey) setAdminKey(initialAdminKey);
  }, [initialId, initialAdminKey]);

  const handleLoadCapsule = async (idToUse?: string, keyToUse?: string) => {
    const id = (idToUse || capsuleId).trim();
    const key = (keyToUse || adminKey).trim();
    setErrorMsg('');
    setSuccessMsg('');

    if (!id || !key) {
      setErrorMsg('请填写遗言信标编号与专属管理密钥');
      return;
    }

    setIsLoading(true);
    try {
      const capsule = await verifyAdminAndLoad(id, key);
      setLoadedCapsule(capsule);
      setSuccessMsg('成功验证立嘱人身份，已载入遗言数据！');
    } catch (err: any) {
      setErrorMsg(err.message || '管理密钥校验失败，请核对后重试');
      setLoadedCapsule(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickExtend = async (months: number) => {
    if (!loadedCapsule) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const targetTime = loadedCapsule.unlockAt + months * 30 * 24 * 60 * 60 * 1000;
      const updated = await updateCapsule(loadedCapsule.id, loadedCapsule.adminKey, {
        unlockAt: targetTime
      });
      setLoadedCapsule(updated);
      setSuccessMsg(`成功将开启时间延长 ${months} 个月！`);
    } catch (err: any) {
      setErrorMsg(err.message || '延期失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePasswordSubmit = async () => {
    if (!loadedCapsule || !newPassword.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const updated = await updateCapsule(loadedCapsule.id, loadedCapsule.adminKey, {
        password: newPassword.trim()
      });
      setLoadedCapsule(updated);
      setSuccessMsg('接收人提取密码修改成功！');
      setIsChangingPass(false);
      setNewPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || '修改密码失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!loadedCapsule) return;
    const confirmed = window.confirm(
      `警告：此操作不可逆！\n确定要彻底撤回并销毁信标 [${loadedCapsule.id}] 吗？销毁后无论立嘱人还是接收人都无法再次查看。`
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await deleteCapsule(loadedCapsule.id, loadedCapsule.adminKey);
      setLoadedCapsule(null);
      setCapsuleId('');
      setAdminKey('');
      setSavedRecords(getMySavedCapsules());
      setSuccessMsg('遗言信标已彻底从保险库注销销毁。');
    } catch (err: any) {
      setErrorMsg(err.message || '撤回失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div>
          <span className="text-xs text-red-800 font-semibold tracking-wide">
            【立嘱人专区】终身管理权与修订权限
          </span>
          <h2 className="text-2xl font-serif font-bold text-stone-900 flex items-center gap-2 mt-1">
            <FolderLock className="w-6 h-6 text-stone-800" />
            <span>遗言信标管理与修改中心</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            只有拥有立嘱人管理密钥（Admin Key）的本人才能访问。您可在此编辑卡号、修改藏物地点、延长时间锁或彻底注销。
          </p>
        </div>

        <button
          onClick={onStartCreate}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>立下新遗嘱</span>
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-700" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Login & Verification Box */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
          <span className="text-sm font-serif font-bold text-stone-900 flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-red-800" />
            <span>输入管理凭据验证身份</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setCapsuleId('DEMO-READY-2026');
              setAdminKey('ADM-DEMO-001');
              setSuccessMsg('已填入示范编号与密钥，请核对后点击下方【校验身份并载入】继续');
            }}
            className="text-xs text-stone-600 hover:text-stone-900 underline cursor-pointer"
          >
            填入示范密钥 (ADM-DEMO-001)
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            handleLoadCapsule();
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              遗言信标编号 (Capsule ID)
            </label>
            <input
              type="text"
              value={capsuleId}
              onChange={e => setCapsuleId(e.target.value)}
              placeholder="例如：DEMO-READY-2026 或 TST-XXXX-XXXX"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono text-stone-900 uppercase focus:bg-white focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              立嘱人专属管理密钥 (Admin Key)
            </label>
            <input
              type="text"
              value={adminKey}
              onChange={e => setAdminKey(e.target.value)}
              placeholder="例如：ADM-DEMO-001 或 ADM-XXXX-XXXX"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {isLoading ? '核验中...' : '校验身份并载入'}
            </button>
          </div>
        </form>

        {/* Local Saved Capsules Strip */}
        {savedRecords.length > 0 && (
          <div className="mt-5 pt-4 border-t border-stone-100">
            <span className="text-[11px] text-stone-500 block mb-2 font-medium">
              在本机浏览器已记录的遗嘱信标凭据（点击填入）：
            </span>
            <div className="flex flex-wrap gap-2">
              {savedRecords.map(rec => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => {
                    setCapsuleId(rec.id);
                    setAdminKey(rec.adminKey);
                    setSuccessMsg(`已填入信标【${rec.id}】凭据，请点击上方【校验身份并载入】继续`);
                  }}
                  className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs text-stone-800 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span className="font-semibold text-stone-900">{rec.id}</span>
                  <span className="text-stone-500 max-w-[150px] truncate">{rec.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LOADED CAPSULE MANAGEMENT PANEL */}
      {loadedCapsule && (
        <div className="space-y-6">
          {/* Status Card */}
          <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <span className="text-xs text-emerald-800 font-mono flex items-center gap-1 mb-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  管理权限已激活 · 您享有最高修改与撤回权力
                </span>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  {loadedCapsule.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                  <span>编号：<strong className="font-mono text-stone-800">{loadedCapsule.id}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>致呈：{loadedCapsule.recipientName}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    设定开启：
                    <strong className="font-mono text-red-900 ml-1">
                      {new Date(loadedCapsule.unlockAt).toLocaleString('zh-CN')}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 self-start">
                <button
                  onClick={() => onEditCapsule(loadedCapsule)}
                  className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>进入完整编辑工坊</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoadedCapsule(null);
                    setSuccessMsg('');
                    setErrorMsg('');
                  }}
                  className="px-4 py-2.5 bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium rounded-lg border border-stone-300 cursor-pointer transition-colors"
                >
                  锁定并退出当前管理
                </button>
              </div>
            </div>

            {/* Quick Operations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Quick Action 1: Extend Unlock Time */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Clock className="w-4 h-4 text-stone-700" />
                  <span>快捷延期时间锁</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  随着生活向前，您可以随时将开启时间往后顺延。
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(6)}
                    className="px-2.5 py-1 text-xs bg-white hover:bg-stone-100 text-stone-800 rounded border border-stone-300 cursor-pointer shadow-2xs"
                  >
                    +6 个月
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(12)}
                    className="px-2.5 py-1 text-xs bg-white hover:bg-stone-100 text-stone-800 rounded border border-stone-300 cursor-pointer shadow-2xs"
                  >
                    +1 年
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickExtend(36)}
                    className="px-2.5 py-1 text-xs bg-white hover:bg-stone-100 text-stone-800 rounded border border-stone-300 cursor-pointer shadow-2xs"
                  >
                    +3 年
                  </button>
                </div>
              </div>

              {/* Quick Action 2: Change Recipient Password */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                  <Lock className="w-4 h-4 text-stone-700" />
                  <span>修改接收人密码</span>
                </div>
                <div className="text-[11px] text-stone-500">
                  当前密码：<strong className="font-mono text-red-900">{loadedCapsule.password}</strong>
                </div>
                {!isChangingPass ? (
                  <button
                    type="button"
                    onClick={() => setIsChangingPass(true)}
                    className="px-3 py-1 text-xs bg-white hover:bg-stone-100 text-stone-800 rounded border border-stone-300 cursor-pointer shadow-2xs"
                  >
                    修改密码
                  </button>
                ) : (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="新访问密码"
                      className="w-full px-2.5 py-1 text-xs bg-white border border-stone-300 rounded text-stone-900 font-mono"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleChangePasswordSubmit}
                        className="px-2.5 py-1 text-xs bg-stone-900 text-white font-medium rounded"
                      >
                        确认保存
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChangingPass(false)}
                        className="px-2.5 py-1 text-xs bg-stone-200 text-stone-700 rounded"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Action 3: Revoke and Destroy */}
              <div className="p-4 bg-red-50/60 border border-red-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-red-950">
                  <Trash2 className="w-4 h-4 text-red-800" />
                  <span>永久撤回与销毁</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  若您改变主意或已当面交代，可随时永久注销该信标。
                </p>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1 text-xs bg-red-800 hover:bg-red-700 text-white rounded cursor-pointer transition-colors shadow-2xs"
                >
                  彻底销毁遗言信标
                </button>
              </div>
            </div>

            {/* Current Content Overview */}
            <div className="pt-4 border-t border-stone-100">
              <span className="text-xs font-serif font-bold text-stone-900 block mb-2">
                当前封存内容概览：
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-stone-600">
                <div className="p-2.5 bg-stone-50 rounded border border-stone-200">
                  <span>长信篇幅：</span>
                  <span className="text-stone-900 ml-1 font-mono font-semibold">{loadedCapsule.payload.letter.body.length} 字</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded border border-stone-200">
                  <span>银行卡账户：</span>
                  <span className="text-stone-900 ml-1 font-mono font-semibold">{loadedCapsule.payload.bankAccounts?.length || 0} 个</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded border border-stone-200">
                  <span>隐秘地点地图：</span>
                  <span className="text-stone-900 ml-1 font-mono font-semibold">{loadedCapsule.payload.physicalItems?.length || 0} 处</span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded border border-stone-200">
                  <span>手机与数字账号：</span>
                  <span className="text-stone-900 ml-1 font-mono font-semibold">{loadedCapsule.payload.digitalAccounts?.length || 0} 个</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
