export interface BankAccountItem {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  approxAmount: string;
  passcodeHint: string;
  remarks: string;
}

export interface InsuranceItem {
  id: string;
  insuranceCompany: string; // 如：中国人寿、中国平安、友邦保险
  policyName: string; // 如：终身重疾险、定期寿险、百万医疗
  policyNumber: string;
  beneficiary: string; // 受益人姓名与关系
  claimPhone: string; // 报案理赔电话或经办经纪人
  policyLocation: string; // 纸质保单存放处或电子保单邮箱
}

export interface DebtClaimItem {
  id: string;
  type: 'receivable' | 'payable'; // 我应收的债权（别人欠我）/ 我应偿付的债务（我欠别人）
  counterparty: string; // 借款人或债权人姓名
  amount: string; // 金额
  iouLocation: string; // 借条、转账凭证存放位置
  contactInfo: string; // 对方联络方式
  remarks: string;
}

export type PhysicalItemCategory =
  | 'safe'
  | 'deeds'
  | 'cash_jewelry'
  | 'keys'
  | 'documents'
  | 'sentimental'
  | 'medical_records'
  | 'other';

export interface PhysicalItemLocation {
  id: string;
  category: PhysicalItemCategory;
  itemName: string;
  exactLocation: string;
  accessMethod: string;
  notes: string;
}

export interface DigitalAccountItem {
  id: string;
  platform: string;
  username: string;
  passwordHint: string;
  disposalPreference: string;
}

export interface SubscriptionItem {
  id: string;
  serviceName: string; // 如：iCloud订阅、网易云音乐、视频会员、宽带代扣
  deductSource: string; // 绑定的扣费银行卡或微信/支付宝
  actionPlan: string; // 停机/注销步骤
}

export interface FinalWishes {
  funeralPreference: string;
  medicalDirectives: string; // 生前预嘱：末期是否放弃气管切开、有创心肺复苏及电击等过度救治
  organDonation: string;
  petCare: string;
  subscriptions: SubscriptionItem[];
  specialInstructions: string;
}

export interface LetterContent {
  title: string;
  recipient: string;
  opening: string;
  body: string;
  closing: string;
}

export interface TestamentPayload {
  letter: LetterContent;
  bankAccounts: BankAccountItem[];
  insurances?: InsuranceItem[];
  debtsAndClaims?: DebtClaimItem[];
  physicalItems: PhysicalItemLocation[];
  digitalAccounts: DigitalAccountItem[];
  finalWishes: FinalWishes;
}

export interface TestamentCapsule {
  id: string;
  adminKey: string;
  title: string;
  recipientName: string;
  unlockAt: number; // UTC timestamp in ms
  createdAt: number;
  updatedAt: number;
  password: string; // Stored securely on server
  passwordHint: string;
  payload: TestamentPayload;
  status: 'active' | 'revoked';
}

export interface CapsulePublicMeta {
  id: string;
  title: string;
  recipientName: string;
  unlockAt: number;
  createdAt: number;
  updatedAt: number;
  isLocked: boolean;
  passwordHint: string;
}

export interface ServerTimeResponse {
  now: number;
  iso: string;
}

export interface UnlockResponse {
  success: boolean;
  isTimeLocked?: boolean;
  matchesPassword?: boolean;
  serverTime: number;
  unlockAt?: number;
  remainingMs?: number;
  message?: string;
  error?: string;
  payload?: TestamentPayload;
  title?: string;
  recipientName?: string;
}
