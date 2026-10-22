export interface AntiForgetItem {
  id: string;
  category: 'finance' | 'physical' | 'digital' | 'wishes';
  title: string;
  urgency: 'critical' | 'high' | 'recommended';
  whyForgotten: string; // 为什么容易被忘？
  familyTrouble: string; // 如果不交代，亲友会面临什么麻烦？
  guidancePrompt: string; // 交代时必须写清楚的关键要素
  defaultTemplate?: any; // 预置模版，点击可直接填充
}

export const ANTI_FORGET_CATALOG: AntiForgetItem[] = [
  // 1. 金融与隐秘资产
  {
    id: 'af-insurance',
    category: 'finance',
    title: '商业人寿与重疾保险单（最致命盲区）',
    urgency: 'critical',
    whyForgotten: '银行存款可以通过公证处拉清单查询，但商业保险并无全国统一公开查询平台。保司绝不会主动致电家属认领赔款！',
    familyTrouble: '家属根本不知道有这张保单，数以十万计的保费化为乌有，百万人身理赔金永久沉没。',
    guidancePrompt: '务必列明：投保公司名称、保单号、理赔险种（寿险/意外险）、受益人姓名、保单存放处或保司报案专线。',
    defaultTemplate: {
      insuranceCompany: '中国平安人寿',
      policyName: '定期寿险与终身重疾险',
      policyNumber: 'PA-2022-881920',
      beneficiary: '爱妻与孩子（法定或指定）',
      claimPhone: '客服专线 95511 / 经纪人王经理 138-0000-1111',
      policyLocation: '书房实木书架第二层“家庭保险档案袋”内有纸质原件'
    }
  },
  {
    id: 'af-digital-wallet',
    category: 'finance',
    title: '微信零钱通、支付宝余额宝与第三方零钱',
    urgency: 'critical',
    whyForgotten: '很多零钱零星放在微信零钱通、蚂蚁财富基金代销或京东小金库，平时随手用，但家属在银行拉流水查不到这些代销账户。',
    familyTrouble: '资金一直停留在第三方理财基金中，亲属难以通过传统遗产继承手续查知其存在。',
    guidancePrompt: '列明零钱通大概金额、支付宝基金平台、微众银行/网商银行电子账户卡号。',
    defaultTemplate: {
      bankName: '微信零钱通 & 支付宝余额宝',
      accountNumber: '绑定手机号 138****8899',
      accountHolder: '本人姓名',
      approxAmount: '合计约 ¥30,000 ~ ¥50,000 货币基金',
      passcodeHint: '支付密码同手机常用6位密码',
      remarks: '先通过手机登录转出至招行卡，或联系微信财付通客服办理遗产提取'
    }
  },
  {
    id: 'af-housing-fund',
    category: 'finance',
    title: '住房公积金与企业年金余额',
    urgency: 'high',
    whyForgotten: '公积金平时不发短信，很多人离职或未退休时忘记自己在公积金中心还有可观资金。',
    familyTrouble: '公积金中心封存账户不会自动汇款给继承人，家属必须知晓并持死亡公证书前往当地住房公积金管理中心专门提取。',
    guidancePrompt: '记录公积金所属城市、所属工作单位、大概缴纳年限。',
    defaultTemplate: {
      bankName: '市住房公积金管理中心（个人账户）',
      accountNumber: '身份证号即可查询',
      accountHolder: '本人姓名',
      approxAmount: '封存账户约 ¥80,000',
      passcodeHint: '可在“随申办”或当地政务App查询',
      remarks: '配偶持结婚证、继承公证书及本人死亡证明即可全额一次性销户提取'
    }
  },
  {
    id: 'af-debts',
    category: 'finance',
    title: '私人借条债权与未结欠款（免后人糊涂账）',
    urgency: 'high',
    whyForgotten: '借给朋友或亲戚的钱没向配偶公开；或者自己欠了某些至交的私债，怕家人担心隐瞒不提。',
    familyTrouble: '人走茶凉，别人欠你的钱随着没有借条无法追讨；你欠别人的钱导致朋友上门反目，家人蒙受名誉损失。',
    guidancePrompt: '明确：借款人姓名、金额、纸质借条放在哪、转账聊天记录在哪；需归还的款项要求优先偿还。',
    defaultTemplate: {
      type: 'receivable',
      counterparty: '多年老友周某',
      amount: '借款本金 ¥50,000',
      iouLocation: '书房抽屉铁盒内纸质欠条，微信有2024年借款转账确认记录',
      contactInfo: '电话：139-1234-5678',
      remarks: '约定2027年分期结清，若我不在请温和联络催收'
    }
  },

  // 2. 实物藏匿与物理钥匙
  {
    id: 'af-deed-tax-receipts',
    category: 'physical',
    title: '房产证附带的「契税发票」与「购房发票」（过户死穴）',
    urgency: 'critical',
    whyForgotten: '大家只记得交代房产证红本子，但房屋过户继承时，不动产交易中心必须核验原始契税完税证明与原始购房发票！',
    familyTrouble: '若发票丢失，继承过户必须向开发商和税务局申请漫长的调档核验，甚至被征收高额差额税金。',
    guidancePrompt: '必须把不动产权证、购房合同、契税发票原件放在一个专用袋内，并指明具体柜体层数。',
    defaultTemplate: {
      category: 'deeds',
      itemName: '房产证原件 + 原始契税完税发票 + 购房全套合同',
      exactLocation: '书房实木书柜第三层，右侧精装字典后侧牛皮纸档案袋（上写“房产不动产”）',
      accessMethod: '直接取出档案袋即可',
      notes: '内含主卧翠湖湾房屋产权红本、原始购房发票与契税票，过户继承两张发票绝对不能丢'
    }
  },
  {
    id: 'af-safe-dual-key',
    category: 'physical',
    title: '保险箱的「机械备用钥匙」与「电子转盘密码」（缺一不可）',
    urgency: 'critical',
    whyForgotten: '只记了电子密码，但如果保险箱电池没电（几年后很常见），电子密码将彻底失效，必须配合实体应急梅花钥匙才能转动！',
    familyTrouble: '家属只能被迫请暴力开锁师傅将昂贵的保险箱强行切割破拆，甚至损伤箱内首饰金条。',
    guidancePrompt: '必须分别写清：主密码是多少，应急实体钥匙藏在哪个房间哪个暗格，防止电池耗尽。',
    defaultTemplate: {
      category: 'safe',
      itemName: '家用防盗保险箱（双锁机构）',
      exactLocation: '主卧更衣室内侧最底层抽屉后方暗板移开',
      accessMethod: '电子面板密码为【0912#】；若电池耗尽，应急机械十字钥匙藏在梳妆台首饰盒双层底座下',
      notes: '箱内有应急现金5万元、黄金饰品、全家户口簿与结婚证原件'
    }
  },
  {
    id: 'af-keys-all',
    category: 'physical',
    title: '老家老宅钥匙、汽车备用钥匙与储藏室门禁',
    urgency: 'high',
    whyForgotten: '很多钥匙平时不常用，散落在各个角落。人走后家人需要用车或回老家清理祖屋时，完全找不到钥匙。',
    familyTrouble: '汽车配一把遥控智能钥匙需要数千元，老宅防盗门只能撬锁重装。',
    guidancePrompt: '把所有备用汽车钥匙、老家防盗门钥匙、地下室/自行车库钥匙统一放置在指定磁吸盒内。',
    defaultTemplate: {
      category: 'keys',
      itemName: '全套备用车钥匙与老家祖宅防盗门钥匙',
      exactLocation: '玄关进门弱电箱/电闸箱金属内壁，强力磁吸挂钩上',
      accessMethod: '推开电闸箱门，在左上角即可取下钥匙包',
      notes: '含沃尔沃备用机械钥匙、特斯拉卡片钥匙、老家松江平房门钥匙'
    }
  },
  {
    id: 'af-medical-records',
    category: 'physical',
    title: '重大病历本、基因检测报告与独生子女证明',
    urgency: 'recommended',
    whyForgotten: '病历卡、手术记录对后人了解家族遗传病史、申请医保二次报销及商业保险身故理赔至关重要。',
    familyTrouble: '保司理赔要求提供完整出院小结原件，若未妥善保管，家属需要奔波多家医院复印封存。',
    guidancePrompt: '交代过往重大住院小结、病理报告、家族健康基因档案所在文件袋。',
    defaultTemplate: {
      category: 'medical_records',
      itemName: '历年重大病历档案与独生子女证原件',
      exactLocation: '书房文件柜最下层塑料收纳整理箱（蓝色标签“医疗健康”）',
      accessMethod: '直接开启卡扣',
      notes: '包含2023年住院病历出院小结、病理切片报告、独生子女父母光荣证（关系证明核心文件）'
    }
  },

  // 3. 数字时代命脉与设备
  {
    id: 'af-phone-lock',
    category: 'digital',
    title: '主力手机锁屏密码（现代财产的最核心中枢）',
    urgency: 'critical',
    whyForgotten: '每天用人脸识别，极容易忘记交代数字锁屏密码！然而人走后人脸无法使用，多次输错将导致手机彻底停用抹掉数据。',
    familyTrouble: '手机是现代财产命脉！解不开手机，接收不到银行验证码、微信登不上、所有资产交接全部陷入死局！',
    guidancePrompt: '必须写清：6位锁屏密码，以及手机号的服务密码（用于家属前往营业厅补卡）。',
    defaultTemplate: {
      platform: '主力手机（iPhone 15 Pro / 华为Mate60）',
      username: '本人手机号 138****8899',
      passwordHint: '锁屏数字密码：940821；中国移动服务密码：668822',
      disposalPreference: '千万保留该SIM卡继续充值缴费至少1年！用于接收所有银行卡、微信、网盘解冻验证码'
    }
  },
  {
    id: 'af-subscriptions',
    category: 'digital',
    title: '每月自动续费扣款（iCloud/视频/会员无底洞）',
    urgency: 'high',
    whyForgotten: '平时绑定了苹果扣费、各类App连续包年包月，人离世后如果银行卡还有钱，系统会年复一年自动扣款！',
    familyTrouble: '银行卡存款被无声无息扣光，亲属需要四处找各平台申请停止服务。',
    guidancePrompt: '列明开通了哪些连续订阅服务（iCloud、百度网盘、音乐软件、各种VIP），交代停机销户顺序。',
    defaultTemplate: {
      platform: '连续包月自动续费服务清册',
      username: '苹果 Apple ID: jiaming@icloud.com',
      passwordHint: '绑定了招行卡免密支付',
      disposalPreference: '请在手机“设置-Apple ID-订阅”中一键取消iCloud 2TB订阅及音乐会员，避免持续扣款'
    }
  },
  {
    id: 'af-cloud-photos',
    category: 'digital',
    title: '家庭珍贵回忆相册与网盘账号（不可挽回的精神财富）',
    urgency: 'high',
    whyForgotten: '大家只顾交代金钱，却遗忘了存有孩子从小到大成长录像、全家旅游照片的私密云盘和电脑硬盘。',
    familyTrouble: '超过一定时间未登录，平台可能会注销非活跃账号，数以万计的珍贵家庭记忆彻底灰飞烟灭。',
    guidancePrompt: '交代iCloud、百度网盘或NAS私人云盘的账号、密码及主电脑开机密码。',
    defaultTemplate: {
      platform: '百度网盘 / 苹果家庭共享相册',
      username: 'jiaming_memory',
      passwordHint: '密码：FamilyPhoto#2026',
      disposalPreference: '内有全家从2015年至今所有照片和孩子成长视频，请全部导出至移动硬盘永久收藏'
    }
  },

  // 4. 后事意愿与人生嘱托
  {
    id: 'af-living-will',
    category: 'wishes',
    title: '生前预嘱（拒绝终末期切喉/电击等无意义过度抢救）',
    urgency: 'critical',
    whyForgotten: '在ICU病房外，家属因为愧疚心理往往选择不计代价切开气管、插满管道、反复胸外按压，让病患承受极大痛苦。',
    familyTrouble: '没有逝者白纸黑字的明确意愿，子女和配偶陷入剧烈的道德折磨与自责，花光积蓄却徒增痛苦。',
    guidancePrompt: '明确写明：当医学判定为不可逆昏迷或终末期时，是否放弃心肺复苏、放弃电击与气管切开，选择有尊严的舒适缓和医疗。',
    defaultTemplate: {
      funeralPreference: '若生命进入不可逆转之终末期，我明确要求放弃任何有创插管、气管切开、心脏电击等延长痛苦的过度抢救。允许我平静、有尊严、无痛苦地离开这个世界。'
    }
  },
  {
    id: 'af-pet-care',
    category: 'wishes',
    title: '宠物安置与专款照料安排',
    urgency: 'recommended',
    whyForgotten: '宠物在法律上只是财产，若无明确交代，一旦亲友无力抚养，毛孩子容易面临被遗弃或送收容所的命运。',
    familyTrouble: '家人在悲痛中手忙脚乱，对宠物的饮食习惯、过敏史及定点医院一无所知。',
    guidancePrompt: '指明委托谁照顾宠物、留了多少抚养基金、宠物的习惯与疫苗接种档案。',
    defaultTemplate: {
      petCare: '家里的边牧犬“奥利奥”（今年5岁，性格温顺怕雷声），已托付给有独立小院的好友王建军收养。已在招行账户为王建军留存5万元专项照护基金，严禁将其遗弃或转卖。'
    }
  },
  {
    id: 'af-items-to-destroy',
    category: 'wishes',
    title: '特定私人物品的销毁愿望（日记、手稿、私密照片）',
    urgency: 'recommended',
    whyForgotten: '每个人都有不想让父母子女翻阅的隐私日记、年轻时的私人信件或抽屉里的小秘密。',
    familyTrouble: '逝者去世后，私人物品被各路亲戚翻看，造成尴尬或误会。',
    guidancePrompt: '明确指定信任的人，要求在不翻阅的情况下直接烧毁或物理粉碎某抽屉/某硬盘中的特定物品。',
    defaultTemplate: {
      specialInstructions: '书房办公桌左侧带锁抽屉里的两本牛皮笔记本为我个人日记，请爱妻在勿翻看的情况下直接将其妥善焚毁，保留我心中的最后一方净土。'
    }
  }
];
