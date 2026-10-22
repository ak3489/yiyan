/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { CreateTestamentWizard } from './components/CreateTestamentWizard.tsx';
import { UnlockPortal } from './components/UnlockPortal.tsx';
import { ManageTestamentModal } from './components/ManageTestamentModal.tsx';
import { SecurityGuideModal } from './components/SecurityGuideModal.tsx';
import type { TestamentCapsule } from './types/testament.ts';
import type { AntiForgetItem } from './data/antiForgetChecklist.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'unlock' | 'manage' | 'security'>('home');

  // Parameters for prefilled navigation
  const [unlockPrefill, setUnlockPrefill] = useState<{ id: string; password?: string }>({
    id: '',
    password: ''
  });

  const [managePrefill, setManagePrefill] = useState<{ id: string; adminKey?: string }>({
    id: '',
    adminKey: ''
  });

  // Editing state for CreateTestamentWizard
  const [editingCapsule, setEditingCapsule] = useState<TestamentCapsule | null>(null);

  // Template injected from Anti-Forget Checklist
  const [injectedItem, setInjectedItem] = useState<AntiForgetItem | null>(null);

  // Handlers
  const handleStartCreate = () => {
    setEditingCapsule(null);
    setInjectedItem(null);
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyAntiForgetItem = (item: AntiForgetItem) => {
    setInjectedItem(item);
    setEditingCapsule(null);
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoUnlock = (prefillId?: string, prefillPass?: string) => {
    if (prefillId) {
      setUnlockPrefill({ id: prefillId, password: prefillPass || '' });
    }
    setActiveTab('unlock');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoManage = (prefillId?: string, prefillKey?: string) => {
    if (prefillId) {
      setManagePrefill({ id: prefillId, adminKey: prefillKey || '' });
    }
    setActiveTab('manage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditCapsuleFromManage = (capsule: TestamentCapsule) => {
    setEditingCapsule(capsule);
    setInjectedItem(null);
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateSuccess = (id: string, adminKey: string, isEdit: boolean) => {
    setUnlockPrefill({ id, password: '' });
    setManagePrefill({ id, adminKey });
    setEditingCapsule(null);
    setInjectedItem(null);
    setActiveTab('unlock');
  };

  const handleCancelWizard = () => {
    setEditingCapsule(null);
    setInjectedItem(null);
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-white">
      {/* Top Bar navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={tab => {
          if (tab === 'manage') {
            setManagePrefill({ id: '', adminKey: '' });
          }
          if (tab === 'unlock') {
            setUnlockPrefill({ id: '', password: '' });
          }
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCreate={handleStartCreate}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'home' && (
          <Hero
            onStartCreate={handleStartCreate}
            onGoUnlock={handleGoUnlock}
            onGoManage={handleGoManage}
            onApplyAntiForgetItem={handleApplyAntiForgetItem}
          />
        )}

        {activeTab === 'create' && (
          <CreateTestamentWizard
            initialCapsule={editingCapsule}
            injectedItem={injectedItem}
            onSuccess={handleCreateSuccess}
            onCancel={handleCancelWizard}
          />
        )}

        {activeTab === 'unlock' && (
          <UnlockPortal
            initialId={unlockPrefill.id}
            initialPassword={unlockPrefill.password}
            onGoCreate={handleStartCreate}
          />
        )}

        {activeTab === 'manage' && (
          <ManageTestamentModal
            initialId={managePrefill.id}
            initialAdminKey={managePrefill.adminKey}
            onEditCapsule={handleEditCapsuleFromManage}
            onStartCreate={handleStartCreate}
          />
        )}

        {activeTab === 'security' && (
          <SecurityGuideModal
            onStartCreate={handleStartCreate}
            onGoUnlock={handleGoUnlock}
            onApplyTemplate={handleApplyAntiForgetItem}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-stone-200 bg-[#f7f5f0] py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-800">时光遗嘱 · 资产与寄语信标</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>为生命托底，让挚爱无忧</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('security')}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              防遗漏全景图谱
            </button>
            <button
              onClick={handleStartCreate}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              立下新遗嘱
            </button>
            <button
              onClick={() => handleGoUnlock()}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              提取遗言
            </button>
            <button
              onClick={() => handleGoManage()}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              修改已有遗言
            </button>
          </div>

          <div className="text-stone-400 font-mono text-[11px]">
            &copy; 2026 CHRONICLE TESTAMENT VAULT
          </div>
        </div>
      </footer>
    </div>
  );
}
