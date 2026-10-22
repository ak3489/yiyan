import React from 'react';
import { Lock, Plus, Bookmark } from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'create' | 'unlock' | 'manage' | 'security';
  onSelectTab: (tab: 'home' | 'create' | 'unlock' | 'manage' | 'security') => void;
  onOpenCreate: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, onOpenCreate }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#fbf9f5]/95 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark, single element */}
        <button
          onClick={() => onSelectTab('home')}
          className="text-left flex items-center gap-2.5 text-base sm:text-lg font-serif font-bold tracking-tight text-stone-900 hover:text-stone-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center font-serif text-xs font-bold shadow-sm">
            印
          </div>
          <span>时光遗嘱 · 财产与生前托付信标</span>
        </button>

        {/* Zone 2: 4-5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => onSelectTab('home')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
              activeTab === 'home'
                ? 'text-stone-950 font-bold border-b-2 border-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            首页概览
          </button>
          <button
            onClick={() => onSelectTab('create')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
              activeTab === 'create'
                ? 'text-stone-950 font-bold border-b-2 border-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            整理立嘱工坊
          </button>
          <button
            onClick={() => onSelectTab('security')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
              activeTab === 'security'
                ? 'text-stone-950 font-bold border-b-2 border-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            防遗漏全景图谱
          </button>
          <button
            onClick={() => onSelectTab('unlock')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
              activeTab === 'unlock'
                ? 'text-stone-950 font-bold border-b-2 border-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            提取解密遗言
          </button>
          <button
            onClick={() => onSelectTab('manage')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer pb-0.5 ${
              activeTab === 'manage'
                ? 'text-stone-950 font-bold border-b-2 border-stone-900'
                : 'hover:text-stone-900'
            }`}
          >
            修改管理
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreate}
            className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 active:bg-stone-950 rounded-lg shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>立下新遗嘱</span>
          </button>
        </div>
      </div>
    </header>
  );
};
