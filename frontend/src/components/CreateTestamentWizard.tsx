import React, { useState, useEffect } from 'react';
import {
  FileText,
  CreditCard,
  MapPin,
  Smartphone,
  Heart,
  Lock,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
  AlertTriangle,
  Sparkles,
  Calendar,
  KeyRound,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import type {
  BankAccountItem,
  InsuranceItem,
  DebtClaimItem,
  PhysicalItemLocation,
  DigitalAccountItem,
  FinalWishes,
  TestamentPayload,
  TestamentCapsule
} from '../types/testament.ts';
import { createCapsule, updateCapsule } from '../utils/api.ts';
import type { AntiForgetItem } from '../data/antiForgetChecklist.ts';

interface CreateTestamentWizardProps {
  initialCapsule?: TestamentCapsule | null;
  injectedItem?: AntiForgetItem | null;
  onSuccess: (id: string, adminKey: string, isEdit: boolean) => void;
  onCancel: () => void;
}

export const CreateTestamentWizard: React.FC<CreateTestamentWizardProps> = ({
  initialCapsule,
  injectedItem,
  onSuccess,
  onCancel
}) => {
  const isEdit = Boolean(initialCapsule);

  // Form states
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 1. Basic & Letter
  const [title, setTitle] = useState<string>(initialCapsule?.title || '致挚爱亲友的信：财产交代与生前寄语');
  const [recipientName, setRecipientName] = useState<string>(initialCapsule?.recipientName || '爱妻/丈夫与我的孩子们');
  const [opening, setOpening] = useState<string>(
    initialCapsule?.payload?.letter?.opening ||
      '展信佳，见字如晤。当你输入密码看到这封信时，请先深呼吸，不必惊慌悲痛。'
  );
  const [body, setBody] = useState<string>(
    initialCapsule?.payload?.letter?.body ||
      '这是我生前专门为您梳理的详尽生活后盾清单。\n\n我把家里所有银行卡、证券、商业保险、以及家中隐蔽暗格和手机密码全部梳理在此。哪怕未来我不在身边，我也希望你们衣食无忧、生活从容。\n\n不要沉浸在悲伤中，去感受阳光、去看山河，带着我的那一份热爱继续幸福生活。'
  );
  const [closing, setClosing] = useState<string>(
    initialCapsule?.payload?.letter?.closing || '永远深爱你们的人'
  );

  // 2. Bank Accounts & Financial Assets
  const [bankAccounts, setBankAccounts] = useState<BankAccountItem[]>(
    initialCapsule?.payload?.bankAccounts || [
      {
        id: 'acc-' + Date.now(),
        bankName: '招商银行（工资与活期主卡）',
        accountNumber: '6225 **** **** 1234',
        accountHolder: '本人姓名',
        approxAmount: '约 ¥100,000 (活期+理财)',
        passcodeHint: '取款密码为6位常用密码（如家人生日）',
        remarks: '若无法使用手机App，可携带本人死亡证明、户口本与结婚证到网点办理公证支取'
      }
    ]
  );

  // 2b. Commercial Insurances (Critical Anti-Forget Item)
  const [insurances, setInsurances] = useState<InsuranceItem[]>(
    initialCapsule?.payload?.insurances || [
      {
        id: 'ins-' + Date.now(),
        insuranceCompany: '中国平安人寿 / 中国人寿',
        policyName: '终身重大疾病险与定期寿险',
        policyNumber: 'PA-2022-881920',
        beneficiary: '爱妻/丈夫与孩子（指定受益人）',
        claimPhone: '客服专线 95511 / 经纪人电话 138-xxxx-xxxx',
        policyLocation: '书房实木书柜第二层“家庭保单专用档案袋”内'
      }
    ]
  );

  // 2c. Private Debts and Claims
  const [debtsAndClaims, setDebtsAndClaims] = useState<DebtClaimItem[]>(
    initialCapsule?.payload?.debtsAndClaims || []
  );

  // 3. Physical Item Hidden Locations (Safe, Deeds, Tax receipts, Keys)
  const [physicalItems, setPhysicalItems] = useState<PhysicalItemLocation[]>(
    initialCapsule?.payload?.physicalItems || [
      {
        id: 'phy-1',
        category: 'deeds',
        itemName: '房产证原件 + 原始购房发票 + 契税完税发票（过户必备）',
        exactLocation: '书房实木书架第三层，字典后侧牛皮纸档案袋（上印“家宅档案”）',
        accessMethod: '直接取出档案袋即可',
        notes: '房屋继承过户不仅需要房产证，交易中心硬性要求出示原始完税契税发票，切勿丢失'
      },
      {
        id: 'phy-2',
        category: 'safe',
        itemName: '家用防盗保险箱（双机械/电子重机构）',
        exactLocation: '主卧更衣室内侧最底层抽屉后方暗板移开',
        accessMethod: '电子面板密码为【0912#】；若电池耗尽，应急机械十字钥匙藏在梳妆台首饰盒底层夹层',
        notes: '内含应急备用金、金条首饰、结婚证与全家户口簿原件'
      },
      {
        id: 'phy-3',
        category: 'keys',
        itemName: '备用汽车钥匙、老宅大门钥匙与储藏室门禁',
        exactLocation: '玄关进门处强电箱/电闸箱金属门内侧磁吸挂钩上',
        accessMethod: '推开电闸箱门即可取下钥匙包',
        notes: '包含防盗门备用机械钥匙2把、汽车遥控钥匙1把'
      }
    ]
  );

  // 4. Digital Accounts & Mobile Phone (The modern critical hub)
  const [digitalAccounts, setDigitalAccounts] = useState<DigitalAccountItem[]>(
    initialCapsule?.payload?.digitalAccounts || [
      {
        id: 'dig-1',
        platform: '主力手机（iPhone / 华为）—— 接收所有银行短信验证码中枢',
        username: '我的主力手机号 138****8899',
        passwordHint: '锁屏密码：6位常用数字；中国移动服务密码：668822',
        disposalPreference: '必须保留此SIM卡继续充值缴费至少1年！用于后续所有银行卡、微信解冻验证'
      },
      {
        id: 'dig-2',
        platform: '微信支付 / 微信零钱通',
        username: '日常微信号',
        passwordHint: '支付密码同银行卡常用密码',
        disposalPreference: '零钱通内有闲钱，查收后可申请账号留念'
      },
      {
        id: 'dig-3',
        platform: '百度网盘 / 苹果iCloud家庭珍贵相册',
        username: '家庭回忆云盘',
        passwordHint: '登录密码：Memory#2026',
        disposalPreference: '内有全家从恋爱至今所有照片与孩子成长视频，请全部导出至移动硬盘永久收藏'
      }
    ]
  );

  // 5. Final Wishes & Medical Directives (Living Will)
  const [finalWishes, setFinalWishes] = useState<FinalWishes>(
    initialCapsule?.payload?.finalWishes || {
      funeralPreference: '崇尚简朴与温馨，拒绝铺张大办。若有条件愿选择生态树葬或海葬，告别时播放温暖平和的轻音乐。',
      medicalDirectives: '【生前预嘱】若生命不可逆进入终末期，我明确要求放弃任何有创插管、气管切开、有创心肺复苏及电击等过度救治。允许我平静、有尊严、无痛苦地离开。',
      organDonation: '若身体条件允许，愿将眼角膜及有用器官捐赠给急需之人，回馈人间。',
      petCare: '家中的爱宠已在银行账户留存专属护理基金，托付给信任的亲友照料，严禁遗弃。',
      subscriptions: [
        {
          id: 'sub-1',
          serviceName: '苹果 iCloud 订阅与视频自动包月',
          deductSource: '招行卡免密自动扣款',
          actionPlan: '在手机设置中点击“Apple ID-订阅”取消连续包月，避免长期扣减卡内余额'
        }
      ],
      specialInstructions: '若有任何财产继承法律疑问，可联络法律顾问陈律师协助办理公证。'
    }
  );

  // 6. Unlock Time & Password
  const defaultFutureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 180);
  const formatDateForInput = (d: Date) => {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [unlockDateTime, setUnlockDateTime] = useState<string>(
    initialCapsule ? formatDateForInput(new Date(initialCapsule.unlockAt)) : formatDateForInput(defaultFutureDate)
  );
  const [password, setPassword] = useState<string>(initialCapsule?.password || '');
  const [passwordHint, setPasswordHint] = useState<string>(initialCapsule?.passwordHint || '');

  // Result state
  const [resultData, setResultData] = useState<{
    id: string;
    adminKey: string;
    unlockAt: number;
    title: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string>('');

  // Auto-inject item from Anti-Forget Catalog if passed
  useEffect(() => {
    if (injectedItem && injectedItem.defaultTemplate) {
      if (injectedItem.category === 'finance') {
        if (injectedItem.id === 'af-insurance') {
          setInsurances(prev => [
            ...prev,
            { id: 'ins-' + Date.now(), ...injectedItem.defaultTemplate }
          ]);
          setStep(2);
        } else if (injectedItem.id === 'af-debts') {
          setDebtsAndClaims(prev => [
            ...prev,
            { id: 'debt-' + Date.now(), ...injectedItem.defaultTemplate }
          ]);
          setStep(2);
        } else {
          setBankAccounts(prev => [
            ...prev,
            { id: 'acc-' + Date.now(), ...injectedItem.defaultTemplate }
          ]);
          setStep(2);
        }
      } else if (injectedItem.category === 'physical') {
        setPhysicalItems(prev => [
          ...prev,
          { id: 'phy-' + Date.now(), ...injectedItem.defaultTemplate }
        ]);
        setStep(3);
      } else if (injectedItem.category === 'digital') {
        setDigitalAccounts(prev => [
          ...prev,
          { id: 'dig-' + Date.now(), ...injectedItem.defaultTemplate }
        ]);
        setStep(4);
      } else if (injectedItem.category === 'wishes') {
        if (injectedItem.id === 'af-living-will') {
          setFinalWishes(prev => ({
            ...prev,
            medicalDirectives: injectedItem.defaultTemplate.funeralPreference || prev.medicalDirectives
          }));
        } else if (injectedItem.id === 'af-pet-care') {
          setFinalWishes(prev => ({
            ...prev,
            petCare: injectedItem.defaultTemplate.petCare || prev.petCare
          }));
        } else if (injectedItem.id === 'af-items-to-destroy') {
          setFinalWishes(prev => ({
            ...prev,
            specialInstructions: injectedItem.defaultTemplate.specialInstructions || prev.specialInstructions
          }));
        }
        setStep(5);
      }
    }
  }, [injectedItem]);

  // Array manipulation helpers
  const addBankAccount = () => {
    setBankAccounts([
      ...bankAccounts,
      {
        id: 'acc-' + Date.now(),
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        approxAmount: '',
        passcodeHint: '',
        remarks: ''
      }
    ]);
  };

  const addInsurance = () => {
    setInsurances([
      ...insurances,
      {
        id: 'ins-' + Date.now(),
        insuranceCompany: '',
        policyName: '',
        policyNumber: '',
        beneficiary: '',
        claimPhone: '',
        policyLocation: ''
      }
    ]);
  };

  const addDebt = () => {
    setDebtsAndClaims([
      ...debtsAndClaims,
      {
        id: 'debt-' + Date.now(),
        type: 'receivable',
        counterparty: '',
        amount: '',
        iouLocation: '',
        contactInfo: '',
        remarks: ''
      }
    ]);
  };

  const addPhysicalItem = () => {
    setPhysicalItems([
      ...physicalItems,
      {
        id: 'phy-' + Date.now(),
        category: 'deeds',
        itemName: '',
        exactLocation: '',
        accessMethod: '',
        notes: ''
      }
    ]);
  };

  const addDigitalAccount = () => {
    setDigitalAccounts([
      ...digitalAccounts,
      {
        id: 'dig-' + Date.now(),
        platform: '',
        username: '',
        passwordHint: '',
        disposalPreference: ''
      }
    ]);
  };

  const setQuickTime = (days: number) => {
    const target = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    setUnlockDateTime(formatDateForInput(target));
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!title.trim()) {
      setErrorMsg('请填写遗言信标标题');
      setStep(1);
      return;
    }
    if (!password.trim()) {
      setErrorMsg('请设置接收人提取密码（至少4位字符）');
      setStep(6);
      return;
    }

    const unlockTimestamp = new Date(unlockDateTime).getTime();
    if (isNaN(unlockTimestamp)) {
      setErrorMsg('请设置有效的开启时间');
      setStep(6);
      return;
    }

    setIsSubmitting(true);
    const payload: TestamentPayload = {
      letter: {
        title,
        recipient: recipientName,
        opening,
        body,
        closing
      },
      bankAccounts: bankAccounts.filter(a => a.bankName.trim() || a.accountNumber.trim()),
      insurances: insurances.filter(i => i.insuranceCompany.trim() || i.policyName.trim()),
      debtsAndClaims: debtsAndClaims.filter(d => d.counterparty.trim() || d.amount.trim()),
      physicalItems: physicalItems.filter(p => p.itemName.trim() || p.exactLocation.trim()),
      digitalAccounts: digitalAccounts.filter(d => d.platform.trim()),
      finalWishes
    };

    try {
      if (isEdit && initialCapsule) {
        const updated = await updateCapsule(initialCapsule.id, initialCapsule.adminKey, {
          title,
          recipientName,
          unlockAt: unlockTimestamp,
          password,
          passwordHint,
          payload
        });
        setResultData({
          id: updated.id,
          adminKey: updated.adminKey,
          unlockAt: updated.unlockAt,
          title: updated.title
        });
      } else {
        const res = await createCapsule({
          title,
          recipientName,
          unlockAt: unlockTimestamp,
          password,
          passwordHint,
          payload
        });
        setResultData(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || '保存失败，请检查网络后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  // SUCCESS CERTIFICATE VIEW (Warm paper style)
  if (resultData) {
    const unlockDateStr = new Date(resultData.unlockAt).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    const recipientShareCard = `【时光遗嘱 · 终焉开启凭据】
尊敬的 ${recipientName}：
这是立嘱人为您封存的详尽人生重要交代信箱。内含商业保单、银行资产清单、家中隐藏物品地图、手机密码及生前长信。

■ 信标编号：${resultData.id}
■ 接收人访问密码：${password}
■ 密码提示：${passwordHint || '见立嘱人当面交代'}
■ 服务器解密开启时间：${unlockDateStr}

提示：本信箱受权威服务器时间锁保护，到达指定开启时间前，即便输入密码亦无法解密。请妥善保存。`;

    const adminBackupRecord = `【立嘱人专属最高管理凭证（请绝密单存！）】
■ 信标编号：${resultData.id}
■ 立嘱人管理密钥（Admin Key）：${resultData.adminKey}
■ 设定接收人密码：${password}
■ 当前设定的开启时间：${unlockDateStr}

★ 重要注意：凭此管理密钥，您终身可随时在网站上修改银行卡、藏匿地点、心底话、或延期与永久撤回销毁。请切勿将此密钥告知接收人！`;

    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="p-8 sm:p-10 bg-white border border-stone-200 rounded-2xl shadow-md relative overflow-hidden">
          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-800 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              {isEdit ? '遗嘱信标已成功修订并重新封存' : '遗嘱信标已正式入库封存'}
            </h2>
            <p className="text-sm text-stone-600 max-w-lg mx-auto">
              您的重要财产账目、隐蔽地点地图及生前长信已安全存入保险箱，受服务器防篡改时间锁严密保护。
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-5 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-serif font-bold text-stone-900 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-red-800" />
                  <span>1. 交付给接收亲属的凭证卡（可提前告知）</span>
                </span>
                <button
                  onClick={() => copyToClipboard(recipientShareCard, 'recipient')}
                  className="px-3 py-1 text-xs bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'recipient' ? '已复制！' : '复制亲友通知'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-lg border border-stone-200">
                  <span className="text-stone-500 block mb-1">信标编号 (Capsule ID)</span>
                  <span className="font-mono text-base font-bold text-stone-900">{resultData.id}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200">
                  <span className="text-stone-500 block mb-1">接收人访问密码</span>
                  <span className="font-mono text-base font-bold text-red-800">{password}</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200 sm:col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-stone-500 block">服务器权威受保开启时间</span>
                    <span className="font-mono text-sm font-semibold text-stone-800">{unlockDateStr}</span>
                  </div>
                  <span className="text-[11px] text-red-800 bg-red-50 px-2.5 py-1 rounded font-medium border border-red-200">
                    时间未到无法提前解密
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-serif font-bold text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-amber-800" />
                  <span>2. 立嘱人专属管理凭据（切勿交予接收人）</span>
                </div>
                <button
                  onClick={() => copyToClipboard(adminBackupRecord, 'admin')}
                  className="px-3 py-1 text-xs bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'admin' ? '已复制！' : '复制保存管理密钥'}</span>
                </button>
              </div>

              <div className="p-3.5 bg-white rounded-lg border border-amber-200">
                <div className="text-xs text-stone-500 mb-1">
                  立嘱人管理密钥 (Admin Key)
                </div>
                <div className="font-mono text-lg font-bold text-stone-900 tracking-wider">
                  {resultData.adminKey}
                </div>
                <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                  凭此密钥您终身可回到「修改管理中心」更新财产卡号、变更藏匿地点或推迟时间。
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onSuccess(resultData.id, resultData.adminKey, isEdit)}
              className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold rounded-lg shadow-sm cursor-pointer transition-colors"
            >
              去体验提取解密或查看详情
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-medium rounded-lg cursor-pointer transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepTitles = [
    { num: 1, name: '心里话与致辞', icon: Heart },
    { num: 2, name: '金融资产与保险', icon: CreditCard },
    { num: 3, name: '重要物品与钥匙位置', icon: MapPin },
    { num: 4, name: '手机与数字账号', icon: Smartphone },
    { num: 5, name: '后事与生前预嘱', icon: FileText },
    { num: 6, name: '时间锁与密码设定', icon: Lock }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="mb-6 flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <span className="text-xs text-red-800 font-semibold tracking-wide">
            {isEdit ? '【立嘱人编辑模式】正在修改已有遗言信标' : '【结构化防遗漏工坊】引导录入重要生前信息'}
          </span>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mt-1">
            {isEdit ? `修改信标: ${initialCapsule?.id}` : '立下新的财产与遗言信标'}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
        >
          取消退出
        </button>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-8">
        {stepTitles.map(st => {
          const Icon = st.icon;
          const isActive = step === st.num;
          const isDone = step > st.num;
          return (
            <button
              key={st.num}
              onClick={() => setStep(st.num)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-stone-900 border-stone-900 text-stone-50 shadow-sm'
                  : isDone
                  ? 'bg-white border-stone-300 text-stone-800'
                  : 'bg-stone-100/60 border-stone-200 text-stone-400'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-medium mb-1">
                <span className="font-mono">{st.num}.</span>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs truncate font-medium">{st.name}</div>
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-700" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step Contents */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* STEP 1: Letter */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-800" />
                <span>第一步：标题、致辞与深情长信</span>
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                无论财产多么重要，最给家人前行力量的始终是您真挚的心里话。写下一封信，告诉他们您的爱、过往的感激与对未来的嘱咐。
              </p>
            </div>

            {/* Anti-Forget Hint Box */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-1.5 text-stone-700">
              <span className="text-stone-900 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>心里话防遗漏灵感提点：</span>
              </span>
              <p className="leading-relaxed text-stone-600">
                · <strong>对伴侣：</strong>感谢一生的携手陪伴，交代生活要继续向前，不要长久悲伤。<br />
                · <strong>对子女：</strong>回忆他们儿时最自豪的小事，告诉他们健康善良比财富更重要。<br />
                · <strong>解开心结：</strong>活着时难以启齿的抱歉或误会，在这里平心静气说明，不留遗憾。
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  遗言信标总标题 <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="例如：致妻子与儿子的信：资产交代与深情嘱托"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  致呈称谓（接收人） <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  placeholder="例如：爱妻晓华与儿子小轩 / 致我的挚友"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                信件开篇引言
              </label>
              <input
                type="text"
                value={opening}
                onChange={e => setOpening(e.target.value)}
                placeholder="例如：展信佳，见字如晤。当你输入密码看到这封信时，请先深呼吸..."
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-800">
                  心底深处的信件正文
                </label>
                <span className="text-xs text-stone-400 font-mono">{body.length} 字</span>
              </div>
              <textarea
                rows={9}
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="写下你想对他们说的话，对过往时光的感恩，对未来的期许与祝福..."
                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 leading-relaxed focus:bg-white focus:outline-none focus:border-stone-900 font-serif"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                信末落款签名
              </label>
              <input
                type="text"
                value={closing}
                onChange={e => setClosing(e.target.value)}
                placeholder="例如：深爱你们的：李明 / 2026年秋"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Financial Assets & Insurances */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-800" />
                <span>第二步：银行存款、商业保险与债权清册</span>
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                特别提醒：银行存款可通过公证书查询，但<strong>商业保单保司绝不会主动联系家属</strong>！务必列明保单。
              </p>
            </div>

            {/* Anti-Forget Callout */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-2 text-stone-800">
              <span className="text-amber-950 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-800" />
                <span>金融与财产交代盲区提醒：</span>
              </span>
              <p className="leading-relaxed text-stone-700">
                1. <strong>商业重疾险/人寿险：</strong>保险公司无义务主动排查身故人，无人报案理赔金永久沉没！<br />
                2. <strong>理财零钱：</strong>微信零钱通、支付宝余额宝、天天基金的钱传统银行查不到。<br />
                3. <strong>私下借款：</strong>借给别人的钱借条在哪？欠别人的钱有无交代家人还清？
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={addInsurance}
                  className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3 h-3 text-red-800" />
                  <span>补充一份商业保单</span>
                </button>
                <button
                  type="button"
                  onClick={addDebt}
                  className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3 h-3 text-stone-700" />
                  <span>记录一笔私人借条/债权</span>
                </button>
              </div>
            </div>

            {/* Section A: Bank Accounts */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-serif font-bold text-stone-900">
                  1. 银行储蓄卡与存折 ({bankAccounts.length})
                </span>
                <button
                  type="button"
                  onClick={addBankAccount}
                  className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>加一张银行卡</span>
                </button>
              </div>

              {bankAccounts.map((acc, index) => (
                <div key={acc.id} className="p-4 bg-stone-50/70 border border-stone-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-200 pb-2">
                    <span className="font-semibold text-stone-800">银行卡 #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setBankAccounts(bankAccounts.filter(a => a.id !== acc.id))}
                      className="text-red-700 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>删除</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">开户机构 / 银行名称</label>
                      <input
                        type="text"
                        value={acc.bankName}
                        onChange={e => {
                          const updated = [...bankAccounts];
                          updated[index].bankName = e.target.value;
                          setBankAccounts(updated);
                        }}
                        placeholder="例如：工商银行、招商银行、中信证券"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">卡号 / 存折号</label>
                      <input
                        type="text"
                        value={acc.accountNumber}
                        onChange={e => {
                          const updated = [...bankAccounts];
                          updated[index].accountNumber = e.target.value;
                          setBankAccounts(updated);
                        }}
                        placeholder="例如：6222 0210 **** ****"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded font-mono text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">大致金额 / 用途</label>
                      <input
                        type="text"
                        value={acc.approxAmount}
                        onChange={e => {
                          const updated = [...bankAccounts];
                          updated[index].approxAmount = e.target.value;
                          setBankAccounts(updated);
                        }}
                        placeholder="例如：三年大额存单约 ¥200,000"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">取款密码 / U盾存放处</label>
                      <input
                        type="text"
                        value={acc.passcodeHint}
                        onChange={e => {
                          const updated = [...bankAccounts];
                          updated[index].passcodeHint = e.target.value;
                          setBankAccounts(updated);
                        }}
                        placeholder="例如：密码是孩子生日6位，U盾在书房右侧抽屉"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-stone-600 mb-1">办理提示备注</label>
                      <input
                        type="text"
                        value={acc.remarks}
                        onChange={e => {
                          const updated = [...bankAccounts];
                          updated[index].remarks = e.target.value;
                          setBankAccounts(updated);
                        }}
                        placeholder="例如：可携公证书至网点支取，或在手机银行转出"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Section B: Commercial Insurances */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-serif font-bold text-red-950">
                    2. 商业人身保险单（重疾/寿险/意外险） ({insurances.length})
                  </span>
                  <span className="text-xs text-stone-500 block mt-0.5">
                    保司不主动找人，家人必须知道保单才能索赔！
                  </span>
                </div>
                <button
                  type="button"
                  onClick={addInsurance}
                  className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>添加商业保单</span>
                </button>
              </div>

              {insurances.map((ins, index) => (
                <div key={ins.id} className="p-4 bg-red-50/40 border border-red-200/80 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500 border-b border-red-200/60 pb-2">
                    <span className="font-semibold text-red-900">保单 #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setInsurances(insurances.filter(i => i.id !== ins.id))}
                      className="text-red-700 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>删除</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">承保保险公司</label>
                      <input
                        type="text"
                        value={ins.insuranceCompany}
                        onChange={e => {
                          const updated = [...insurances];
                          updated[index].insuranceCompany = e.target.value;
                          setInsurances(updated);
                        }}
                        placeholder="例如：中国平安人寿、友邦保险、太平洋人寿"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">险种名称 / 保单号</label>
                      <input
                        type="text"
                        value={ins.policyNumber}
                        onChange={e => {
                          const updated = [...insurances];
                          updated[index].policyNumber = e.target.value;
                          setInsurances(updated);
                        }}
                        placeholder="例如：PA-2022-881920（终身重疾+定期寿险）"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded font-mono text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">指定受益人</label>
                      <input
                        type="text"
                        value={ins.beneficiary}
                        onChange={e => {
                          const updated = [...insurances];
                          updated[index].beneficiary = e.target.value;
                          setInsurances(updated);
                        }}
                        placeholder="例如：配偶晓华（100%）或法定继承人"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">纸质保单存放处 / 报案电话</label>
                      <input
                        type="text"
                        value={ins.policyLocation}
                        onChange={e => {
                          const updated = [...insurances];
                          updated[index].policyLocation = e.target.value;
                          setInsurances(updated);
                        }}
                        placeholder="例如：书房第二层保险档案袋 / 客服电话 95511"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Section C: Debts & Claims */}
            {debtsAndClaims.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <span className="text-sm font-serif font-bold text-stone-900 block">
                  3. 私人借条债权与欠款 ({debtsAndClaims.length})
                </span>
                {debtsAndClaims.map((debt, index) => (
                  <div key={debt.id} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-stone-200 pb-2">
                      <span className="font-semibold text-stone-900">
                        {debt.type === 'receivable' ? '★ 他人欠我（债权）' : '▲ 我欠他人（债务）'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDebtsAndClaims(debtsAndClaims.filter(d => d.id !== debt.id))}
                        className="text-red-700 hover:text-red-800"
                      >
                        删除
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-stone-600 mb-1">借款人/债权人姓名</label>
                        <input
                          type="text"
                          value={debt.counterparty}
                          onChange={e => {
                            const updated = [...debtsAndClaims];
                            updated[index].counterparty = e.target.value;
                            setDebtsAndClaims(updated);
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-stone-600 mb-1">金额 / 借条存放处</label>
                        <input
                          type="text"
                          value={debt.amount}
                          onChange={e => {
                            const updated = [...debtsAndClaims];
                            updated[index].amount = e.target.value;
                            setDebtsAndClaims(updated);
                          }}
                          placeholder="例如：¥50,000，纸质借条在书房铁盒"
                          className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Physical Item Locations */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-800" />
                  <span>第三步：家中重要物品藏匿与钥匙位置</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  保险箱机械钥匙、房产证完税发票、备用钥匙、紧急现金与首饰的隐藏暗格，给家人最精准指引。
                </p>
              </div>
              <button
                type="button"
                onClick={addPhysicalItem}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer shadow-2xs self-start"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加一处物品或钥匙</span>
              </button>
            </div>

            {/* Anti-Forget Callout */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1 text-stone-800">
              <span className="text-amber-950 font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-800" />
                <span>实物交代高频盲区：</span>
              </span>
              <p className="text-stone-700 leading-relaxed">
                · <strong>保险箱应急机械钥匙：</strong>电子锁电池若耗尽，光有密码无法打开！必须写明十字机械钥匙在何处。<br />
                · <strong>契税与购房发票原件：</strong>过户继承时，不动产交易中心必须核对当年契税发票原件。<br />
                · <strong>汽车备用钥匙：</strong>配一把带防盗芯片的车钥匙需数千元，务必写清备用车钥匙在哪。
              </p>
            </div>

            <div className="space-y-4">
              {physicalItems.map((item, index) => (
                <div key={item.id} className="p-4 bg-stone-50/70 border border-stone-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-200 pb-2">
                    <span className="font-semibold text-stone-800">实物项目 #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setPhysicalItems(physicalItems.filter(p => p.id !== item.id))}
                      className="text-red-700 hover:text-red-800"
                    >
                      删除此项
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">物品名称 / 类别</label>
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={e => {
                          const updated = [...physicalItems];
                          updated[index].itemName = e.target.value;
                          setPhysicalItems(updated);
                        }}
                        placeholder="例如：主卧保险箱、房产证契税发票、备用车钥匙"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">具体藏匿位置（越细致越好）</label>
                      <input
                        type="text"
                        value={item.exactLocation}
                        onChange={e => {
                          const updated = [...physicalItems];
                          updated[index].exactLocation = e.target.value;
                          setPhysicalItems(updated);
                        }}
                        placeholder="例如：书房书架第三层《辞海》后侧暗盒"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">打开方式 / 密码 / 钥匙在哪</label>
                      <input
                        type="text"
                        value={item.accessMethod}
                        onChange={e => {
                          const updated = [...physicalItems];
                          updated[index].accessMethod = e.target.value;
                          setPhysicalItems(updated);
                        }}
                        placeholder="例如：密码0912#，应急机械钥匙在梳妆台夹层"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">内容物或特别注意事项</label>
                      <input
                        type="text"
                        value={item.notes}
                        onChange={e => {
                          const updated = [...physicalItems];
                          updated[index].notes = e.target.value;
                          setPhysicalItems(updated);
                        }}
                        placeholder="例如：内有5万现金、金条与过户发票"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Digital Accounts & Phone */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-red-800" />
                  <span>第四步：手机锁屏、微信与数字资产</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  手机是现代财产命脉。若家人解不开手机，接收不到银行动账验证码，所有财产公证和转移将举步维艰。
                </p>
              </div>
              <button
                type="button"
                onClick={addDigitalAccount}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加数字账号</span>
              </button>
            </div>

            {/* Anti-Forget Callout */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1 text-stone-800">
              <span className="text-amber-950 font-bold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-800" />
                <span>数字遗产最容易忽略的两件事：</span>
              </span>
              <p className="text-stone-700 leading-relaxed">
                1. <strong>SIM卡手机号服务密码：</strong>用于日后家人去营业厅补办手机卡。<br />
                2. <strong>取消连续自动扣费：</strong>iCloud订阅、各种年费会员，不及时取消会持续每月从银行卡扣钱。
              </p>
            </div>

            <div className="space-y-4">
              {digitalAccounts.map((dig, index) => (
                <div key={dig.id} className="p-4 bg-stone-50/70 border border-stone-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-200 pb-2">
                    <span className="font-semibold text-stone-800">数字账号 #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => setDigitalAccounts(digitalAccounts.filter(d => d.id !== dig.id))}
                      className="text-red-700 hover:text-red-800"
                    >
                      删除
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">平台 / 设备名称</label>
                      <input
                        type="text"
                        value={dig.platform}
                        onChange={e => {
                          const updated = [...digitalAccounts];
                          updated[index].platform = e.target.value;
                          setDigitalAccounts(updated);
                        }}
                        placeholder="例如：iPhone锁屏、微信支付、iCloud相册"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">账号 / 手机号</label>
                      <input
                        type="text"
                        value={dig.username}
                        onChange={e => {
                          const updated = [...digitalAccounts];
                          updated[index].username = e.target.value;
                          setDigitalAccounts(updated);
                        }}
                        placeholder="例如：138****8899 / user@icloud.com"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">密码 / 密码提示 / 手势说明</label>
                      <input
                        type="text"
                        value={dig.passwordHint}
                        onChange={e => {
                          const updated = [...digitalAccounts];
                          updated[index].passwordHint = e.target.value;
                          setDigitalAccounts(updated);
                        }}
                        placeholder="例如：数字锁屏940821；移动服务密码668822"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-600 mb-1">处置意愿（保留/注销/导出）</label>
                      <input
                        type="text"
                        value={dig.disposalPreference}
                        onChange={e => {
                          const updated = [...digitalAccounts];
                          updated[index].disposalPreference = e.target.value;
                          setDigitalAccounts(updated);
                        }}
                        placeholder="例如：保留手机卡充值，导出照片后注销其他App"
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Final Wishes & Living Will */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-800" />
                <span>第五步：生前预嘱、后事安排与宠物托付</span>
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                明确后事与医疗意向，可以免除亲人在终末期面对道德折磨，避免过度无意义抢救，体面告别。
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-900 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-800" />
                  <span>生前预嘱（终末期过度抢救意愿 · 尊严死）</span>
                </label>
                <textarea
                  rows={3}
                  value={finalWishes.medicalDirectives}
                  onChange={e =>
                    setFinalWishes({ ...finalWishes, medicalDirectives: e.target.value })
                  }
                  placeholder="例如：若生命不可逆进入终末期，我明确要求放弃切喉、有创心肺复苏及电击等延长痛苦的过度抢救，允许我平静尊严地离开..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900 font-serif leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  告别仪式与安葬形式意向
                </label>
                <input
                  type="text"
                  value={finalWishes.funeralPreference}
                  onChange={e =>
                    setFinalWishes({ ...finalWishes, funeralPreference: e.target.value })
                  }
                  placeholder="例如：极简家庭告别，海葬或树葬，播放喜爱的温暖歌曲..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  器官与遗体捐献意向
                </label>
                <input
                  type="text"
                  value={finalWishes.organDonation}
                  onChange={e =>
                    setFinalWishes({ ...finalWishes, organDonation: e.target.value })
                  }
                  placeholder="例如：已在红十字会签署志愿捐献，若有可用器官请捐赠救治他人..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  宠物终身照护托付与专款安排
                </label>
                <input
                  type="text"
                  value={finalWishes.petCare}
                  onChange={e =>
                    setFinalWishes({ ...finalWishes, petCare: e.target.value })
                  }
                  placeholder="例如：金毛托付给好友王建军，在招行卡留存5万元专项照护基金..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                  私人日记销毁 / 法律顾问联络说明
                </label>
                <input
                  type="text"
                  value={finalWishes.specialInstructions}
                  onChange={e =>
                    setFinalWishes({ ...finalWishes, specialInstructions: e.target.value })
                  }
                  placeholder="例如：书房左侧带锁抽屉内的日记本请直接焚毁不阅；继承法律事宜联络陈律师 139-xxxx-xxxx"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Time Lock & Access Passcode */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-800" />
                <span>第六步：服务器时间锁与提取密码</span>
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                时间到达前，即便接收人持有正确密码，服务器也会坚决拒绝解密！立嘱人本人凭管理密钥终身可随时延期或修订。
              </p>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
              <label className="block text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-red-800" />
                <span>设定解密封存的服务器时间（精确到分）</span>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickTime(30)}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded shadow-2xs"
                >
                  +1 个月后
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime(90)}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded shadow-2xs"
                >
                  +3 个月后
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime(180)}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded shadow-2xs"
                >
                  +6 个月后
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime(365)}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded shadow-2xs"
                >
                  +1 年后
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime(365 * 3)}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded shadow-2xs"
                >
                  +3 年后
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime(365 * 10)}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded shadow-2xs"
                >
                  +10 年后
                </button>
              </div>

              <div>
                <input
                  type="datetime-local"
                  value={unlockDateTime}
                  onChange={e => setUnlockDateTime(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 font-mono focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-900 mb-1">
                  接收人提取密码 <span className="text-red-700">*</span>
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="例如：6位以上密码，如 123456 或 mylove2026"
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm font-mono text-stone-900 focus:outline-none focus:border-stone-900"
                />
                <span className="text-xs text-stone-500 mt-1 block">
                  您可以提前将此密码告知接收人（即使告知，在上述时间前他们也无法查阅）。
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  密码记忆提示语（可选）
                </label>
                <input
                  type="text"
                  value={passwordHint}
                  onChange={e => setPasswordHint(e.target.value)}
                  placeholder="例如：我们第一次旅行的年份 / 母亲的农历生日"
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1.5">
              <div className="font-semibold text-stone-900">提交前核对清单：</div>
              <div>· 标题：《{title}》</div>
              <div>· 银行卡账户：{bankAccounts.filter(a => a.bankName).length} 项</div>
              <div>· 商业保险单：{insurances.filter(i => i.insuranceCompany).length} 项</div>
              <div>· 隐秘实物与钥匙：{physicalItems.filter(p => p.itemName).length} 项</div>
              <div>· 手机与数字账号：{digitalAccounts.filter(d => d.platform).length} 项</div>
              <div>· 设定解锁时间：{unlockDateTime ? new Date(unlockDateTime).toLocaleString() : '未设'}</div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="mt-8 pt-4 border-t border-stone-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>上一步</span>
            </button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <span>下一步：{stepTitles[step].name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-red-800 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? '正在安全封印入库...' : isEdit ? '保存所有修改' : '确认并正式加锁封存'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
