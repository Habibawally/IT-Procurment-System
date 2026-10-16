
export const ar = {
  // ── App ──────────────────────────────────────────────────────────────────
  appName: 'ProcureIT',
  appTagline: 'نظام إدارة المشتريات',

  // ── Navigation ───────────────────────────────────────────────────────────
  nav: {
    menu:       'القائمة',
    dashboard:  'لوحة التحكم',
    requests:   'جميع الطلبات',
    newRequest: 'طلب جديد',
    approvals:  'الموافقات',
    signOut:    'تسجيل الخروج',
  },

  // ── Roles ────────────────────────────────────────────────────────────────
  roles: {
    employee:    'موظف',
    manager:     'مدير',
    it:          'قسم تقنية المعلومات',
    procurement: 'قسم المشتريات',
  },

  // ── Status Labels ────────────────────────────────────────────────────────
  status: {
    pending_manager:     'في انتظار موافقة المدير',
    pending_it:          'في انتظار موافقة قسم الـ IT',
    pending_procurement: 'في انتظار قسم المشتريات',
    completed:           'مكتمل',
    rejected:            'مرفوض',
  },

  // ── Priority Labels ──────────────────────────────────────────────────────
  priority: {
    low:      'منخفضة',
    medium:   'متوسطة',
    high:     'عالية',
    critical: 'حرجة',
  },

  // ── Item Types ───────────────────────────────────────────────────────────
  itemTypes: ['أجهزة', 'برامج', 'ملحقات', 'شبكات', 'تخزين', 'أخرى'],
  itemTypesMap: {
    'Hardware':    'أجهزة',
    'Software':    'برامج',
    'Accessories': 'ملحقات',
    'Networking':  'شبكات',
    'Storage':     'تخزين',
    'Other':       'أخرى',
  },

  // ── Login Page ───────────────────────────────────────────────────────────
  login: {
    heroTitle:    'إدارة مشتريات الـ IT',
    heroSub:      'بكل سهولة ويسر',
    heroDesc:     'منظومة متكاملة لتقديم الطلبات واعتمادها وتتبعها من البداية حتى التسليم.',
    steps: [
      'يقدم الموظف الطلب',
      'يوافق المدير على الطلب',
      'يراجع قسم تقنية المعلومات',
      'يُنفّذ قسم المشتريات الطلب',
    ],
    formTitle:    'مرحباً بعودتك',
    formSubtitle: 'سجّل دخولك للمتابعة',
    emailLabel:   'البريد الإلكتروني',
    emailPlaceholder: 'example@company.com',
    passwordLabel: 'كلمة المرور',
    passwordPlaceholder: 'أدخل كلمة المرور',
    submitBtn:    'تسجيل الدخول',
    signingIn:    'جارٍ تسجيل الدخول...',
    demoAccounts: 'حسابات ',
    demoPassword: 'كلمة المرور لجميع الحسابات:',
    demoRoles: {
      Employee:    'موظف',
      Manager:     'مدير',
      'IT Dept.':  'قسم IT',
      Procurement: 'مشتريات',
    },
    footer: 'نظام مشتريات تقنية المعلومات · الإصدار 1.0',
  },

  // ── Dashboard ────────────────────────────────────────────────────────────
  dashboard: {
    greetMorning:   'صباح الخير',
    greetAfternoon: 'مساء الخير',
    greetEvening:   'مساء النور',
    wave:           '👋',
    loggedAs:       'مسجّل دخولك بصفة',
    newRequest:     '+ طلب جديد',
    approvalsQueue: 'قائمة الموافقات ←',
    totalRequests:  'إجمالي الطلبات',
    recentRequests: 'الطلبات الأخيرة',
    recentSub:      'آخر النشاطات',
    viewAll:        'عرض الكل ←',
    noRequests:     'لا توجد طلبات بعد',
    avgStageTime:   'متوسط وقت كل مرحلة',
    managerReview:  'مراجعة المدير',
    itReview:       'مراجعة قسم IT',
    procurement:    'المشتريات',
    yourRole:       'دورك في النظام',
    roleDesc: {
      employee:    'قدّم طلبات الشراء وتابع حالة الموافقة في كل مرحلة.',
      manager:     'راجع طلبات الموظفين واعتمدها أو ارفضها.',
      it:          'تحقق من المتطلبات التقنية للطلبات المعتمدة من المدير.',
      procurement: 'نفّذ الطلبات المعتمدة وارفع إثبات الاستلام.',
    },
    statLabels: {
      pending_manager:     'انتظار المدير',
      pending_it:          'انتظار قسم IT',
      pending_procurement: 'انتظار المشتريات',
      completed:           'مكتملة',
      rejected:            'مرفوضة',
    },
  },

  // ── Requests Page ────────────────────────────────────────────────────────
  requests: {
    title:        'الطلبات',
    of:           'من',
    requestsWord: 'طلب',
    newRequest:   '+ طلب جديد',
    searchPlaceholder: 'ابحث في الطلبات...',
    filterAll:    'الكل',
    filters: {
      pending_manager:     'انتظار المدير',
      pending_it:          'انتظار IT',
      pending_procurement: 'انتظار المشتريات',
      completed:           'مكتملة',
      rejected:            'مرفوضة',
    },
    cols: {
      request:     'الطلب',
      requestedBy: 'مقدم الطلب',
      type:        'النوع',
      priority:    'الأولوية',
      status:      'الحالة',
      created:     'تاريخ الإنشاء',
    },
    empty:        'لا توجد طلبات',
    noMatch:      'لا توجد نتائج مطابقة',
    tryDifferent: 'جرّب بحثاً مختلفاً',
  },

  // ── Create Request ───────────────────────────────────────────────────────
  create: {
    back:         '← رجوع',
    title:        'طلب شراء جديد',
    subtitle:     'قدّم طلباً للحصول على معدات أو برامج IT',
    titleLabel:   'عنوان الطلب',
    titlePlaceholder: 'مثال: جهاز MacBook Pro 16 للتطوير',
    titleHint:    'كن محدداً — العنوان الواضح يساعد المراجعين على التصرف بسرعة.',
    descLabel:    'وصف الطلب',
    descPlaceholder: 'اشرح سبب الحاجة لهذا البند، الوضع الحالي، وكيف سيُستخدم...',
    typeLabel:    'نوع البند',
    typePlaceholder: 'اختر النوع...',
    priorityLabel: 'الأولوية',
    priorityPlaceholder: 'اختر الأولوية...',
    required:     'مطلوب',
    allRequired:  'يرجى ملء جميع الحقول قبل الإرسال.',
    submitBtn:    'إرسال الطلب ←',
    submitting:   'جارٍ الإرسال...',
    cancel:       'إلغاء',
    priorityInfo: {
      low:      { label: 'منخفضة', desc: 'روتيني — لا استعجال' },
      medium:   { label: 'متوسطة', desc: 'مطلوب خلال الأسابيع القادمة' },
      high:     { label: 'عالية',  desc: 'عاجل — يعيق العمل' },
      critical: { label: 'حرجة',  desc: 'يؤثر على الإنتاج أو الأمان' },
    },
    workflowTitle: 'مسار الموافقة',
    workflowSteps: [
      { label: 'تقديم الطلب',           desc: 'يدخل الطلب في قائمة انتظار المدير' },
      { label: 'مراجعة المدير',          desc: 'الاعتماد أو الرفض' },
      { label: 'مراجعة قسم IT',          desc: 'التحقق من المتطلبات التقنية' },
      { label: 'تنفيذ قسم المشتريات',    desc: 'الطلب والتسليم مع إثبات' },
    ],
    tipsTitle: '💡 نصائح للحصول على موافقة أسرع',
    tips: [
      'أدرج تفاصيل الموديل والمواصفات',
      'اشرح الأثر على العمل',
      'اختر مستوى الأولوية المناسب',
      'اذكر أي مواعيد نهائية لديك',
    ],
  },

  // ── Request Detail ───────────────────────────────────────────────────────
  detail: {
    backBtn:        '← العودة إلى الطلبات',
    requestedBy:    'مقدّم الطلب:',
    on:             'في',
    approveBtn:     'اعتماد',
    rejectBtn:      'رفض',
    completeBtn:    'إتمام الطلب',
    description:    'الوصف',
    progress:       'مسار الطلب',
    stageTiming:    'توقيت المراحل',
    proofOfDelivery:'إثبات التسليم',
    rejectedTitle:  'تم رفض الطلب',
    details:        'التفاصيل',
    activityLog:    'سجل النشاط',
    noActivity:     'لا يوجد نشاط بعد',
    detailRows: {
      requestedBy:  'مقدّم الطلب',
      email:        'البريد الإلكتروني',
      submitted:    'تاريخ التقديم',
      mgrApproved:  'اعتماد المدير',
      itApproved:   'اعتماد قسم IT',
      completed:    'تاريخ الإتمام',
    },
    timingLabels: {
      toManager:    'حتى موافقة المدير',
      inIT:         'في مراجعة IT',
      inProcurement:'في المشتريات',
      total:        'المدة الإجمالية',
    },
    stages: ['تقديم الطلب', 'المدير', 'قسم IT', 'المشتريات'],
    approveModal: {
      title:   'اعتماد الطلب',
      body:    'أنت على وشك اعتماد',
      next:    'سيُحال الطلب إلى المرحلة التالية.',
      notes:   'ملاحظات (اختياري)',
      notesPlaceholder: 'أي تعليقات أو شروط...',
      confirm: '✓ تأكيد الاعتماد',
      cancel:  'إلغاء',
    },
    rejectModal: {
      title:   'رفض الطلب',
      body:    'أنت على وشك رفض',
      hint:    'يرجى ذكر السبب حتى يفهم مقدّم الطلب.',
      reason:  'سبب الرفض',
      reasonPlaceholder: 'اشرح سبب رفض هذا الطلب...',
      confirm: '✗ تأكيد الرفض',
      cancel:  'إلغاء',
    },
    completeModal: {
      title:        'إتمام الطلب',
      body:         'هل تريد وضع علامة "مُسلَّم" على',
      imageLabel:   'صورة إثبات التسليم',
      imageHint:    'ارفع صورة للبند المُسلَّم',
      notesLabel:   'ملاحظات الإتمام (اختياري)',
      notesPlaceholder: 'أي ملاحظات خاصة بالتسليم...',
      confirm:      '✓ تأكيد الإتمام',
      cancel:       'إلغاء',
    },
  },

  // ── Approvals Page ───────────────────────────────────────────────────────
  approvals: {
    roles: {
      manager: {
        title: 'قائمة موافقات المدير',
        desc:  'راجع طلبات موظفيك واعتمدها أو ارفضها.',
        color: '#7c3aed',
      },
      it: {
        title: 'قائمة مراجعة قسم IT',
        desc:  'تحقق من المتطلبات التقنية للطلبات المعتمدة من المدير.',
        color: '#2563eb',
      },
      procurement: {
        title: 'قائمة تنفيذ المشتريات',
        desc:  'نفّذ الطلبات المعتمدة وارفع إثبات التسليم.',
        color: '#d97706',
      },
    },
    awaitingAction: 'طلب في انتظار إجراءاتك',
    awaitingActionPlural: 'طلبات في انتظار إجراءاتك',
    allDone:   'لا توجد طلبات معلّقة!',
    allDoneSub:'لا توجد طلبات تحتاج إلى إجراء منك الآن.',
    requestedBy: 'مقدّم الطلب:',
    waiting:   'وقت الانتظار',
    reviewBtn: 'مراجعة ←',
    noRole:    'دورك لا يملك قائمة موافقات.',
  },

  // ── Shared / Common ──────────────────────────────────────────────────────
  common: {
    loading:    'جارٍ التحميل...',
    processing: 'جارٍ المعالجة...',
    noResults:  'لا توجد نتائج',
    error:      'حدث خطأ',
    serverDown: 'تعذّر الاتصال بالخادم. تأكد من تشغيل الخادم على المنفذ 5000.',
    invalidJson: 'استجابة غير صالحة من الخادم',
  },

  // ── Action Log Labels ────────────────────────────────────────────────────
  actions: {
    created:               'تم إنشاء الطلب',
    manager_approved:      'اعتمده المدير',
    manager_rejected:      'رفضه المدير',
    it_approved:           'اعتمده قسم IT',
    it_rejected:           'رفضه قسم IT',
    procurement_completed: 'أتمّه قسم المشتريات',
  },
};

// Convenience helpers
export const t = ar;
export const statusLabel   = (s) => ar.status[s]   || s;
export const priorityLabel = (p) => ar.priority[p] || p;
export const roleLabel     = (r) => ar.roles[r]    || r;
export const actionLabel   = (a) => ar.actions[a]  || a;
export const itemTypeAr    = (t) => ar.itemTypesMap[t] || t;
