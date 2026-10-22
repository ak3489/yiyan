import React, { useState } from 'react';
import {
  AlertTriangle,
  CreditCard,
  MapPin,
  Smartphone,
  Heart,
  Plus,
  CheckCircle2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { ANTI_FORGET_CATALOG, type AntiForgetItem } from '../data/antiForgetChecklist.ts';

interface AntiForgetGuideProps {
  onApplyTemplate: (item: AntiForgetItem) => void;
  onGoCreate: () => void;
}

export const AntiForgetGuide: React.FC<AntiForgetGuideProps> = ({
  onApplyTemplate,
  onGoCreate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'finance' | 'physical' | 'digital' | 'wishes'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredItems = selectedCategory === 'all'
    ? ANTI_FORGET_CATALOG
    : ANTI_FORGET_CATALOG.filter(item => item.category === selectedCategory);

  const categoryLabels = [
    { key: 'all', label: '全部防漏清单 (12项)' },
    { key: 'finance', label: '商业保险与金融盲区' },
    { key: 'physical', label: '隐秘实物与钥匙发票' },
    { key: 'digital', label: '手机锁屏与数字命脉' },
    { key: 'wishes', label: '生前预嘱与后事意愿' }
  ];

  const getUrgencyText = (urgency: AntiForgetItem['urgency']) => {
    switch (urgency) {
      case 'critical':
        return <span className="text-red-700 font-semibold tracking-wide">● 极高频致命遗漏</span>;
      case 'high':
        return <span className="text-amber-800 font-medium">▲ 高频困扰事项</span>;
      case 'recommended':
        return <span className="text-stone-500 font-medium">○ 建议生前交代</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Deck */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex items-center gap-2 text-xs text-red-800 font-medium mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>立嘱人避坑指南 · 守护至亲</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
          立嘱防遗漏全景清单：那些最容易被忘记的关键交代
        </h2>
        <p className="text-sm text-stone-600 mt-1.5 max-w-3xl leading-relaxed">
          许多财产由于家属不知情而永久沉睡在保司或银行；许多家庭因为找不到一张购房发票或解不开手机锁屏，而奔波半年甚至蒙受巨额损失。
          在此为您系统梳理盲区，支持一键将预置模版加入立嘱草稿。
        </p>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {categoryLabels.map(cat => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key as any)}
            className={`px-3.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === cat.key
                ? 'bg-stone-900 text-stone-50 font-medium shadow-sm'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map(item => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="p-5 bg-white border border-stone-200/90 hover:border-stone-300 rounded-xl space-y-3.5 transition-all shadow-sm hover:shadow flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs border-b border-stone-100 pb-2">
                  <div className="text-[11px] font-mono">
                    {getUrgencyText(item.urgency)}
                  </div>
                  <span className="text-stone-400 text-xs">
                    {item.category === 'finance' && '金融保险'}
                    {item.category === 'physical' && '实物钥匙'}
                    {item.category === 'digital' && '数字设备'}
                    {item.category === 'wishes' && '后事预嘱'}
                  </span>
                </div>

                <h3 className="text-base font-serif font-bold text-stone-900">
                  {item.title}
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200/60 text-stone-700">
                    <span className="text-stone-900 font-semibold block mb-0.5">
                      为何容易被忘？
                    </span>
                    <p className="leading-relaxed text-stone-600">{item.whyForgotten}</p>
                  </div>

                  <div className="p-3 bg-red-50/60 rounded-lg border border-red-200/60 text-red-950">
                    <span className="text-red-900 font-semibold block mb-0.5">
                      若不交代，亲友会面临什么：
                    </span>
                    <p className="leading-relaxed text-red-900/90">{item.familyTrouble}</p>
                  </div>

                  {isExpanded && (
                    <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200/80 text-amber-950 space-y-1 animate-in fade-in">
                      <span className="text-amber-900 font-semibold block text-[11px]">
                        ★ 必须写清的核心要素：
                      </span>
                      <p className="leading-relaxed text-amber-900/90">{item.guidancePrompt}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="text-stone-500 hover:text-stone-900 underline cursor-pointer"
                >
                  {isExpanded ? '收起要素' : '展开交代要素'}
                </button>

                <button
                  type="button"
                  onClick={() => onApplyTemplate(item)}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium rounded-lg flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>以此范本加入我的遗嘱</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Banner */}
      <div className="p-6 bg-white border border-stone-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mt-8">
        <div>
          <h4 className="text-base font-serif font-bold text-stone-900">
            准备好将这些关键交代妥善封存了吗？
          </h4>
          <p className="text-xs text-stone-600 mt-1">
            进入立嘱工坊，系统将按商业保单、银行、隐秘地点、数字账号、生前预嘱分步引导您填写。
          </p>
        </div>
        <button
          onClick={onGoCreate}
          className="px-5 py-2.5 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors shrink-0"
        >
          <span>进入整理立嘱工坊</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
