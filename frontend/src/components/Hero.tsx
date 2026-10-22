import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Clock,
  KeyRound,
  FileText,
  Lock,
  ArrowRight,
  Server,
  FolderLock,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { fetchServerTime } from '../utils/api.ts';
import { AntiForgetGuide } from './AntiForgetGuide.tsx';
import type { AntiForgetItem } from '../data/antiForgetChecklist.ts';
import heroVaultStill from '../assets/images/hero_vault_still_1792649436605.jpg';
import waxSealCrest from '../assets/images/wax_seal_crest_1792649436268.jpg';

interface HeroProps {
  onStartCreate: () => void;
  onGoUnlock: (prefillId?: string, prefillPass?: string) => void;
  onGoManage: (prefillId?: string, prefillKey?: string) => void;
  onApplyAntiForgetItem?: (item: AntiForgetItem) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartCreate,
  onGoUnlock,
  onGoManage,
  onApplyAntiForgetItem
}) => {
  const [serverTimeStr, setServerTimeStr] = useState<string>('同步中...');
  const [showDemoDrawer, setShowDemoDrawer] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;
    async function syncTime() {
      try {
        const data = await fetchServerTime();
        const date = new Date(data.now);
        setServerTimeStr(
          date.toLocaleString('zh-CN', {
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        );
      } catch {
        const d = new Date();
        setServerTimeStr(d.toLocaleString('zh-CN', { hour12: false }));
      }
    }

    syncTime();
    timer = setInterval(syncTime, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-16">
        {/* Top quiet trust ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="font-serif text-stone-800 font-semibold">时光遗嘱 · 生前交代与托付信标</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>给家人最清晰的保障，为自己留最体面的从容</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-stone-600 bg-white px-3 py-1 rounded border border-stone-200 shadow-2xs">
            <Server className="w-3.5 h-3.5 text-stone-700" />
            <span className="text-stone-500">权威服务器时钟:</span>
            <span className="text-stone-900 font-semibold tabular-nums">{serverTimeStr}</span>
          </div>
        </div>

        {/* Hero Section: Dignified, warm, curatorial editorial atmosphere */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs text-red-800 font-semibold tracking-wide">
              <span>● 生前托付 · 防遗漏资产清册 · 权威时间锁保密</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight leading-tight text-balance">
              世事无常，把不曾言说的爱与财产，<br />
              <span className="text-red-900">
                清清楚楚留给最爱的人。
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-700 leading-relaxed max-w-2xl font-light">
              很多人猝不及防离世，家属因不知晓商业人身保单而错失百万理赔、因找不到购房契税发票无法过户继承、因解不开手机无法接收银行动账短信。
              在这里，系统专属引导您梳理
              <strong className="text-stone-900 font-medium">商业保单、隐秘暗格、手机中枢与生前预嘱</strong>。
              预先设置开启时间与密码，时间到达前坚固封存，立嘱人终身可随时修改更新。
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <button
                onClick={onStartCreate}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-red-800 hover:bg-red-700 active:bg-red-900 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>开始梳理我的财产与遗嘱（附防漏引导）</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onGoUnlock()}
                className="px-6 py-3.5 text-sm font-medium text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-stone-700" />
                <span>输入密码解密遗言</span>
              </button>
            </div>

            {/* Core Reassurances */}
            <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-900 font-semibold block">全景防漏清单</span>
                  <span>覆盖保险、暗格、发票与手机锁屏</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-900 font-semibold block">服务器时间锁封印</span>
                  <span>权威独立授时，未到时间无法解密</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-stone-900 font-semibold block">本人终身可修订</span>
                  <span>凭管理密钥随时推迟、补充或撤回</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Visual Card in Gallery Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-white p-3 shadow-md">
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={heroVaultStill}
                  alt="静谧庄重的遗言书房桌面与火漆封印信封"
                  className="w-full h-80 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />

                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-stone-200/90 shadow flex items-center gap-3">
                  <img
                    src={waxSealCrest}
                    alt="时间锁火漆徽章"
                    className="w-11 h-11 rounded-lg object-cover border border-stone-300 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-serif font-bold text-stone-900 truncate">生前交代 · 备忘录中枢</span>
                      <span className="text-red-800 text-[11px] font-semibold">权威封印</span>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-1">
                      未到指定服务器时间，即使持有密码也绝不下发敏感载荷
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Anti-Forgetfulness Panorama Guide */}
        <div className="pt-6">
          <AntiForgetGuide
            onApplyTemplate={item => {
              if (onApplyAntiForgetItem) {
                onApplyAntiForgetItem(item);
              } else {
                onStartCreate();
              }
            }}
            onGoCreate={onStartCreate}
          />
        </div>

        {/* Minimal Subtle Testing Utility Strip */}
        <div className="pt-8 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500">
              功能核验通道：需要快速体验解密或时间锁效果？
            </span>
            <button
              type="button"
              onClick={() => setShowDemoDrawer(!showDemoDrawer)}
              className="text-xs text-stone-700 hover:text-stone-900 underline cursor-pointer"
            >
              {showDemoDrawer ? '收起示范信标' : '展开示范信标'}
            </button>
          </div>

          {showDemoDrawer && (
            <div className="mt-4 p-4 bg-white border border-stone-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shadow-xs">
              <div
                onClick={() => onGoUnlock('DEMO-READY-2026', '123456')}
                className="p-3 bg-stone-50 rounded-lg border border-stone-200 hover:border-stone-400 cursor-pointer space-y-1 transition-colors"
              >
                <span className="text-emerald-800 font-semibold block">范本1：已达解锁时间</span>
                <span className="text-stone-800 block">DEMO-READY-2026（密码：123456）</span>
                <span className="text-[11px] text-stone-500">点击自动填入体验解封全套资产</span>
              </div>

              <div
                onClick={() => onGoUnlock('TIME-LOCKED-DEMO', 'demo2026')}
                className="p-3 bg-stone-50 rounded-lg border border-stone-200 hover:border-stone-400 cursor-pointer space-y-1 transition-colors"
              >
                <span className="text-amber-800 font-semibold block">范本2：时间锁保护中</span>
                <span className="text-stone-800 block">TIME-LOCKED-DEMO（密码：demo2026）</span>
                <span className="text-[11px] text-stone-500">点击体验服务器防篡改时间锁拦截</span>
              </div>

              <div
                onClick={() => onGoManage('DEMO-READY-2026', 'ADM-DEMO-001')}
                className="p-3 bg-stone-50 rounded-lg border border-stone-200 hover:border-stone-400 cursor-pointer space-y-1 transition-colors"
              >
                <span className="text-stone-800 font-semibold block">范本3：立嘱人修改中心</span>
                <span className="text-stone-700 block">密钥：ADM-DEMO-001</span>
                <span className="text-[11px] text-stone-500">点击进入管理中心测试修订已有遗言</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
