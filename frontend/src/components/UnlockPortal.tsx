import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  FileText,
  CreditCard,
  MapPin,
  Smartphone,
  Heart,
  Server
} from 'lucide-react';
import { unlockCapsule } from '../utils/api.ts';
import type { UnlockResponse, TestamentPayload } from '../types/testament.ts';

interface UnlockPortalProps {
  initialId?: string;
  initialPassword?: string;
  onGoCreate: () => void;
}

export const UnlockPortal: React.FC<UnlockPortalProps> = ({
  initialId = '',
  initialPassword = '',
  onGoCreate
}) => {
  const [capsuleId, setCapsuleId] = useState<string>(initialId);
  const [password, setPassword] = useState<string>(initialPassword);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [unlockResult, setUnlockResult] = useState<UnlockResponse | null>(null);

  // Active viewing tab when unlocked
  const [activeTab, setActiveTab] = useState<'letter' | 'banks' | 'physical' | 'digital' | 'wishes'>('letter');
  const [copiedKey, setCopiedKey] = useState<string>('');

  // Server-authoritative countdown states
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  } | null>(null);

  // Sync initial inputs if provided, but DO NOT automatically attempt unlock
  useEffect(() => {
    if (initialId) setCapsuleId(initialId);
    if (initialPassword) setPassword(initialPassword);
  }, [initialId, initialPassword]);

  // Countdown ticker
  useEffect(() => {
    if (!unlockResult?.isTimeLocked || !unlockResult.unlockAt) {
      setCountdown(null);
      return;
    }

    const targetTime = unlockResult.unlockAt;

    const tick = () => {
      const now = Date.now();
      const diff = targetTime - now;
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        handleUnlockAttempt(capsuleId, password);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds, totalMs: diff });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [unlockResult]);

  const handleUnlockAttempt = async (idToUse?: string, passToUse?: string) => {
    const id = (idToUse || capsuleId).trim();
    const pass = (passToUse || password).trim();
    setErrorMsg('');

    if (!id) {
      setErrorMsg('请输入遗言信标识别码（例如：DEMO-READY-2026 或 TST-XXXX-XXXX）');
      return;
    }
    if (!pass) {
      setErrorMsg('请输入立嘱人交付给您的提取密码');
      return;
    }

    setIsLoading(true);
    try {
      const res = await unlockCapsule(id, pass);
      setUnlockResult(res);
      if (res.success) {
        setActiveTab('letter');
      }
    } catch (err: any) {
      setErrorMsg(err.message || '解密失败，请核实编号与密码');
      setUnlockResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const payload: TestamentPayload | undefined = unlockResult?.payload;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Search / Entry Box */}
      <div className="no-print bg-white border border-stone-200/90 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5 mb-5">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-red-800" />
              <span>提取并解密遗言信标</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              受服务器时间锁与访问密码双重保护。若时间尚未到达，系统将安全拦截并呈现防篡改倒计时。
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400">快捷填入：</span>
            <button
              type="button"
              onClick={() => {
                setCapsuleId('DEMO-READY-2026');
                setPassword('123456');
                setUnlockResult(null);
                setErrorMsg('');
              }}
              className="px-2.5 py-1 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded border border-stone-200 cursor-pointer transition-colors"
            >
              已解锁范本
            </button>
            <button
              type="button"
              onClick={() => {
                setCapsuleId('TIME-LOCKED-DEMO');
                setPassword('demo2026');
                setUnlockResult(null);
                setErrorMsg('');
              }}
              className="px-2.5 py-1 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded border border-stone-200 cursor-pointer transition-colors"
            >
              时间锁范本
            </button>
          </div>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            handleUnlockAttempt();
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3"
        >
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              信标编号 (Capsule ID)
            </label>
            <input
              type="text"
              value={capsuleId}
              onChange={e => setCapsuleId(e.target.value)}
              placeholder="例如：DEMO-READY-2026 或 TST-XXXX-XXXX"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm font-mono text-stone-900 uppercase focus:bg-white focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold text-stone-700 mb-1">
              立嘱人交付的访问密码
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="输入访问密码"
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm font-mono text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>正在校验授时...</span>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>验证并开启</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* STATE 1: TIME-LOCKED INTERCEPTION */}
      {unlockResult?.isTimeLocked && (
        <div className="p-8 sm:p-10 bg-white border border-stone-200 rounded-2xl shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-800 mx-auto flex items-center justify-center shadow-2xs">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>密码验证完全正确！已核身通过</span>
            </div>

            <h3 className="text-2xl font-serif font-bold text-stone-900">
              遗言受服务器时间锁保护，尚未到达开启时刻
            </h3>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
              立嘱人设定了强制时间封印。请您完全放心，您所持有的提取密码是准确无误的，
              但在服务器时间正式到达指定刻度前，任何人都无法解密里面的敏感财产与信件内容。
            </p>
          </div>

          {/* Countdown block */}
          {countdown && (
            <div className="p-6 bg-stone-50 border border-stone-200 rounded-xl max-w-lg mx-auto shadow-2xs">
              <span className="text-xs text-stone-500 block mb-3 font-mono">
                距离服务器权威解锁还需等待：
              </span>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-red-900 tabular-nums">
                    {countdown.days}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">天</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-red-900 tabular-nums">
                    {countdown.hours}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">小时</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-red-900 tabular-nums">
                    {countdown.minutes}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">分钟</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs">
                  <div className="font-mono text-2xl sm:text-3xl font-bold text-red-900 tabular-nums">
                    {countdown.seconds}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">秒</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
                <span>指定解锁服务器时刻：</span>
                <span className="font-mono text-stone-900 font-semibold">
                  {new Date(unlockResult.unlockAt!).toLocaleString('zh-CN')}
                </span>
              </div>
            </div>
          )}

          <div className="text-xs text-stone-500 max-w-md mx-auto">
            <span className="flex items-center justify-center gap-1.5 text-stone-500">
              <Server className="w-3.5 h-3.5 text-stone-700" />
              防篡改说明：由权威服务器时钟硬校验，客户端修改本机系统时间无效。
            </span>
          </div>
        </div>
      )}

      {/* STATE 2: SUCCESSFULLY UNLOCKED & VIEWING */}
      {unlockResult?.success && payload && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-6 bg-white border border-stone-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-red-800 font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>已验证授权并解除时间封印 · 终焉遗言正式展现</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                {payload.letter.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                <span>致呈：{payload.letter.recipient}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">编号：{capsuleId}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-medium">已完整解密</span>
              </div>
            </div>

            <div className="no-print flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-medium rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>打印为纸质备忘录</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs (no-print) */}
          <div className="no-print flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('letter')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'letter'
                  ? 'bg-stone-900 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>深情长信 ({payload.letter.body ? '完整' : '0'})</span>
            </button>

            <button
              onClick={() => setActiveTab('banks')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'banks'
                  ? 'bg-stone-900 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>银行、保单与资产 ({payload.bankAccounts?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('physical')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'physical'
                  ? 'bg-stone-900 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>重要物品与钥匙位置 ({payload.physicalItems?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('digital')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'digital'
                  ? 'bg-stone-900 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>手机与数字账号 ({payload.digitalAccounts?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('wishes')}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'wishes'
                  ? 'bg-stone-900 text-white font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>后事愿望与生前预嘱</span>
            </button>
          </div>

          {/* TAB 1: LETTER (Traditional Stationery Letterhead Look) */}
          {(activeTab === 'letter' || true) && (
            <div className={`p-8 sm:p-12 bg-white border border-stone-200/90 rounded-2xl shadow-sm space-y-6 ${activeTab !== 'letter' ? 'hidden print:block' : ''}`}>
              <div className="border-b border-stone-200 pb-5">
                <div className="text-xs text-red-800 font-mono font-semibold tracking-wider mb-1">LETTERHEAD ARCHIVE</div>
                <h3 className="text-2xl font-serif font-bold text-stone-900">
                  {payload.letter.title}
                </h3>
                <div className="text-xs text-stone-500 mt-1">致：{payload.letter.recipient}</div>
              </div>

              {payload.letter.opening && (
                <div className="text-sm font-serif italic text-stone-700 leading-relaxed border-l-2 border-red-800 pl-4 py-1 bg-stone-50 rounded-r-lg">
                  “{payload.letter.opening}”
                </div>
              )}

              <div className="text-base sm:text-lg font-serif text-stone-900 leading-loose whitespace-pre-line max-w-prose">
                {payload.letter.body}
              </div>

              {payload.letter.closing && (
                <div className="pt-8 border-t border-stone-200 text-right font-serif text-base text-stone-900 font-bold">
                  —— {payload.letter.closing}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BANK ACCOUNTS & INSURANCES */}
          {(activeTab === 'banks' || false) && (
            <div className={`space-y-6 ${activeTab !== 'banks' ? 'hidden print:block' : ''}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-red-800" />
                  <span>银行账户、存折与金融理财清单 ({payload.bankAccounts?.length || 0})</span>
                </h3>
                <span className="text-xs text-stone-400">点击卡号可一键复制</span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {payload.bankAccounts?.map((acc, index) => (
                  <div
                    key={acc.id || index}
                    className="p-5 bg-white border border-stone-200 rounded-xl space-y-3 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div>
                        <span className="text-xs font-semibold text-stone-500 mr-2">#{index + 1}</span>
                        <span className="text-base font-bold text-stone-900">{acc.bankName}</span>
                        {acc.accountHolder && (
                          <span className="ml-2 text-xs text-stone-500">（户名：{acc.accountHolder}）</span>
                        )}
                      </div>
                      {acc.approxAmount && (
                        <div className="text-xs text-stone-900 font-semibold bg-stone-100 px-2.5 py-1 rounded border border-stone-200">
                          {acc.approxAmount}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                        <span className="text-stone-500 block mb-1">卡号 / 账号</span>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-bold text-stone-900 tracking-wide">
                            {acc.accountNumber || '未填卡号'}
                          </span>
                          {acc.accountNumber && (
                            <button
                              type="button"
                              onClick={() => copyText(acc.accountNumber, 'acc-' + index)}
                              className="text-stone-700 hover:text-stone-900 p-1 cursor-pointer"
                              title="复制卡号"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {copiedKey === 'acc-' + index && (
                          <span className="text-[10px] text-emerald-700 block mt-0.5">已复制卡号</span>
                        )}
                      </div>

                      <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                        <span className="text-stone-500 block mb-1">取款密码 / U盾存放提示</span>
                        <span className="text-stone-900 font-medium">
                          {acc.passcodeHint || '无特殊说明'}
                        </span>
                      </div>

                      {acc.remarks && (
                        <div className="sm:col-span-2 p-3 bg-stone-50 rounded-lg border border-stone-200 text-stone-700">
                          <span className="text-stone-500 block mb-0.5">办理说明与提取备注：</span>
                          <span>{acc.remarks}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Commercial Insurances */}
                {payload.insurances && payload.insurances.length > 0 && (
                  <div className="pt-4 border-t border-stone-200 space-y-3">
                    <h4 className="text-sm font-serif font-bold text-red-950">
                      商业人身保险单 ({payload.insurances.length}) —— 需家属主动报案理赔
                    </h4>
                    {payload.insurances.map((ins, index) => (
                      <div key={ins.id || index} className="p-4 bg-red-50/40 border border-red-200/80 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center border-b border-red-100 pb-2">
                          <span className="font-bold text-stone-900">{ins.insuranceCompany} · {ins.policyName}</span>
                          <span className="text-red-900 font-mono font-semibold">保单号：{ins.policyNumber}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-700">
                          <div>受益人：<strong className="text-stone-900">{ins.beneficiary}</strong></div>
                          <div>报案热线/经纪人：<strong className="text-stone-900">{ins.claimPhone}</strong></div>
                          <div className="sm:col-span-2 text-stone-600">纸质保单存放：{ins.policyLocation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Debts & Claims */}
                {payload.debtsAndClaims && payload.debtsAndClaims.length > 0 && (
                  <div className="pt-4 border-t border-stone-200 space-y-3">
                    <h4 className="text-sm font-serif font-bold text-stone-900">
                      私人借条债权与结欠 ({payload.debtsAndClaims.length})
                    </h4>
                    {payload.debtsAndClaims.map((debt, index) => (
                      <div key={debt.id || index} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-stone-900">
                            {debt.type === 'receivable' ? '★ 别人欠我（应收账款）' : '▲ 我欠别人（应还账款）'}
                          </span>
                          <span className="font-mono text-stone-900 font-bold">{debt.amount}</span>
                        </div>
                        <div className="text-stone-600">对方：{debt.counterparty} | 借条存放：{debt.iouLocation}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PHYSICAL ITEMS & KEYS */}
          {(activeTab === 'physical' || false) && (
            <div className={`space-y-4 ${activeTab !== 'physical' ? 'hidden print:block' : ''}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-800" />
                  <span>家中重要实物藏匿地图与钥匙在哪 ({payload.physicalItems?.length || 0})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {payload.physicalItems?.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="p-5 bg-white border border-stone-200 rounded-xl space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-800 flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-base font-bold text-stone-900">{item.itemName}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                        <span className="text-red-800 font-semibold block mb-1">
                          📍 具体藏匿位置：
                        </span>
                        <p className="text-stone-900 text-sm font-medium leading-relaxed">
                          {item.exactLocation}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                          <span className="text-stone-500 block mb-1">🔑 开启方式 / 密码 / 钥匙在哪：</span>
                          <p className="text-stone-800">{item.accessMethod || '直接开启'}</p>
                        </div>
                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                          <span className="text-stone-500 block mb-1">📦 内部内容或注意事项：</span>
                          <p className="text-stone-800">{item.notes || '无'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DIGITAL ACCOUNTS */}
          {(activeTab === 'digital' || false) && (
            <div className={`space-y-4 ${activeTab !== 'digital' ? 'hidden print:block' : ''}`}>
              <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-red-800" />
                <span>手机锁屏、微信与数字资产 ({payload.digitalAccounts?.length || 0})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {payload.digitalAccounts?.map((dig, index) => (
                  <div
                    key={dig.id || index}
                    className="p-4 bg-white border border-stone-200 rounded-xl space-y-2 text-xs shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <span className="font-bold text-stone-900 text-sm">{dig.platform}</span>
                      <span className="text-stone-400">#{index + 1}</span>
                    </div>

                    <div>
                      <span className="text-stone-500">账号/手机：</span>
                      <span className="font-mono text-stone-900 ml-1">{dig.username || '见设备'}</span>
                    </div>

                    <div>
                      <span className="text-stone-500">密码提示：</span>
                      <span className="text-stone-900 font-mono ml-1 font-bold">
                        {dig.passwordHint || '未注明'}
                      </span>
                    </div>

                    {dig.disposalPreference && (
                      <div className="p-2 bg-stone-50 rounded text-stone-700 mt-2">
                        <span className="text-stone-500 block text-[11px]">处置愿望：</span>
                        <span>{dig.disposalPreference}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: WISHES */}
          {(activeTab === 'wishes' || false) && (
            <div className={`p-6 bg-white border border-stone-200 rounded-2xl space-y-4 shadow-xs ${activeTab !== 'wishes' ? 'hidden print:block' : ''}`}>
              <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                <FileText className="w-4 h-4 text-red-800" />
                <span>后事丧葬、生前预嘱与宠物托付愿望</span>
              </h3>

              <div className="space-y-4 text-xs">
                {payload.finalWishes?.medicalDirectives && (
                  <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-950 block mb-1">
                      【生前预嘱】终末期救治意向（放弃过度抢救 · 尊严死）
                    </span>
                    <p className="text-stone-900 leading-relaxed text-sm font-serif">
                      {payload.finalWishes.medicalDirectives}
                    </p>
                  </div>
                )}

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-bold text-stone-900 block mb-1">告别仪式与安葬形式意愿</span>
                  <p className="text-stone-700 leading-relaxed text-sm">
                    {payload.finalWishes?.funeralPreference || '由家属依当地习俗简办即可。'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-bold text-stone-900 block mb-1">器官与遗体捐献意向</span>
                  <p className="text-stone-700 leading-relaxed text-sm">
                    {payload.finalWishes?.organDonation || '无特殊意向。'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-bold text-stone-900 block mb-1">宠物托付与照料基金</span>
                  <p className="text-stone-700 leading-relaxed text-sm">
                    {payload.finalWishes?.petCare || '无宠物托付。'}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-bold text-stone-900 block mb-1">特别交代与法律顾问</span>
                  <p className="text-stone-700 leading-relaxed text-sm">
                    {payload.finalWishes?.specialInstructions || '无。'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Back Button */}
          <div className="no-print pt-6 flex justify-between items-center text-xs text-stone-500">
            <span>遗言查看完成。请尊重逝者嘱托，依法合规妥善保管。</span>
            <button
              onClick={() => {
                setUnlockResult(null);
                setPassword('');
              }}
              className="text-stone-800 hover:text-stone-950 font-medium underline cursor-pointer"
            >
              重新锁定并返回
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
