import React from 'react';
import {
  ShieldCheck,
  Clock,
  KeyRound,
  FileText,
  Lock,
  Server,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FolderLock
} from 'lucide-react';
import { AntiForgetGuide } from './AntiForgetGuide.tsx';
import type { AntiForgetItem } from '../data/antiForgetChecklist.ts';

interface SecurityGuideProps {
  onStartCreate: () => void;
  onGoUnlock: () => void;
  onApplyTemplate?: (item: AntiForgetItem) => void;
}

export const SecurityGuideModal: React.FC<SecurityGuideProps> = ({
  onStartCreate,
  onGoUnlock,
  onApplyTemplate
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* 1. Full Anti-Forget Guide */}
      <AntiForgetGuide
        onApplyTemplate={item => {
          if (onApplyTemplate) {
            onApplyTemplate(item);
          } else {
            onStartCreate();
          }
        }}
        onGoCreate={onStartCreate}
      />

      {/* 2. Security & Time Lock Guarantees */}
      <div className="pt-8 border-t border-slate-800 space-y-8">
        <div>
          <span className="text-xs text-amber-400 font-medium tracking-wide">
            【核心安全基石】权威服务器时间锁与双钥分离
          </span>
          <h3 className="text-xl font-serif font-bold text-slate-100 mt-1">
            为什么时光遗嘱能够让您放心托付？
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            生前交代涉及银行密码、隐密资产与家庭隐私。我们通过严密的机制设计，确保立嘱人在世时的绝对掌控力，与离世后亲属能够顺利交接的确定性。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <h4 className="text-base font-serif font-semibold text-slate-100">
                权威服务器独立时间锁
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              如果仅在客户端倒计时，任何人只要修改手机或电脑系统时间即可破解。
              本系统每次解密均由云端原子时钟仲裁，未到时间前<strong>后端绝不向网络传输任何敏感财产与信件内容</strong>。
            </p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <h4 className="text-base font-serif font-semibold text-slate-100">
                双轨凭据严格隔离
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              交付给家属的「提取密码」仅有时间到达后的只读权限；立嘱人专属的「管理密钥（Admin Key）」享有终身最高修订权，可随时推迟时间、更新卡号或彻底销毁。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
