const STORAGE_KEY = 'profitClientsArabicWebApp_no_login_v8';
const SUPABASE_URL = 'https://srubkmjkqxypyexuydvj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nEGazqaPPEdLaDyD4VhpsA_pljvmJqt';
const CLOUD_TABLE = 'shared_app_state';
const CLOUD_ROW_ID = 'main';

let supabaseClient = null;
let currentUser = { email: 'Shared cloud sync' };
let cloudSyncEnabled = true;
let cloudSaveTimer = null;
let isCloudLoading = false;

const lists = {
  currencies: ['EGP','USD','SAR','QAR','IQD'],
  accounts: ['Vodafone Cash','فيزا فوري','فيزا بنك مصر','Cash','InstaPay','PayPal','Binance','Western Union','أخرى'],
  coreAccounts: ['Vodafone Cash','فيزا فوري','فيزا بنك مصر'],
  countries: ['مصر','السعودية','العراق','قطر','فلسطين','باكستان','أخرى'],
  clientTypes: ['شهري','فيديو منفرد','باقة','تجربة','متوقف'],
  clientStatus: ['نشط','متوقف','محتمل','انتهى','بانتظار الدفع'],
  packageDuration: ['فيديو واحد','أسبوعية','شهرية','شهرين','مخصصة'],
  paymentTerms: ['مقدم','نصف أول الشهر ونصف منتصف الشهر','آخر الشهر','بعد كل فيديو','مخصص'],
  videoTypes: ['Caption Reel','Motion Reel','AI Video','Product Video','UGC','تجربة','تعديل','آخر'],
  videoDurations: ['أقل من 30 ثانية','30-45 ثانية','45-60 ثانية','أكثر من 60 ثانية'],
  videoStatus: ['لم يبدأ','جاري','تم التسليم','تعديلات','منتهي'],
  invoiceTypes: ['فيديو منفرد','باقة شهرية','باقة شهرين','دفعة أولى','دفعة ثانية','تعديل','أخرى'],
  expenseTypes: ['اشتراك برنامج','إعلان','أداة AI','إنترنت','عمولة تحويل','شراء Assets','معدات','مصروف شخصي','أخرى'],
  paymentMethods: ['تحويل','كاش','InstaPay','Vodafone Cash','فوري','بنك','أخرى'],
  transferReasons: ['توزيع 33%','سحب','إيداع','تصحيح','مصروف','أخرى'],
  yesNo: ['نعم','لا']
};

function seedData(){
  return {
  "settings": {
    "exchangeRates": {
      "EGP": 1,
      "USD": 52.02,
      "SAR": 13.85,
      "QAR": 13.05,
      "IQD": 0.036
    },
    "providerName": "Abdo Creative Studio",
    "targetPercent": 33.333333,
    "currentMonth": "2026-06"
  },
  "accounts": [
    {
      "name": "Vodafone Cash",
      "opening": 350.0,
      "target": 33.333333
    },
    {
      "name": "فيزا فوري",
      "opening": 300.0,
      "target": 33.333333
    },
    {
      "name": "فيزا بنك مصر",
      "opening": 980.0,
      "target": 33.333333
    }
  ],
  "packages": [
    {
      "code": "PKG-SAR-001",
      "name": "Starter",
      "currency": "SAR",
      "price": 200.0,
      "priceEgp": 2770.0,
      "duration": "باقة شهرية بنظام نصفين",
      "videos": 4,
      "unitPrice": 50,
      "terms": "نصف أول الشهر ونصف منتصف الشهر",
      "notes": "مثال: يدفع نصف أول الشهر ونصف منتصف الشهر"
    },
    {
      "code": "PKG-SAR-002",
      "name": "Basic",
      "currency": "SAR",
      "price": 300.0,
      "priceEgp": 4155.0,
      "duration": "باقة شهرية بنظام نصفين",
      "videos": 6,
      "unitPrice": 50,
      "terms": "نصف أول الشهر ونصف منتصف الشهر",
      "notes": "مثال: يدفع نصف أول الشهر ونصف منتصف الشهر"
    },
    {
      "code": "PKG-SAR-003",
      "name": "Growth",
      "currency": "SAR",
      "price": 450.0,
      "priceEgp": 6232.5,
      "duration": "باقة شهرية بنظام نصفين",
      "videos": 10,
      "unitPrice": 45,
      "terms": "نصف أول الشهر ونصف منتصف الشهر",
      "notes": "السعر الرسمي 500، سعر العرض 450"
    },
    {
      "code": "PKG-SAR-004",
      "name": "Pro",
      "currency": "SAR",
      "price": 675.0,
      "priceEgp": 9348.75,
      "duration": "باقة شهرية بنظام نصفين",
      "videos": 15,
      "unitPrice": 45,
      "terms": "نصف أول الشهر ونصف منتصف الشهر",
      "notes": "السعر الرسمي 750، سعر العرض 675"
    },
    {
      "code": "PKG-SAR-005",
      "name": "Premium",
      "currency": "SAR",
      "price": 800.0,
      "priceEgp": 11080.0,
      "duration": "باقة شهرية بنظام نصفين",
      "videos": 20,
      "unitPrice": 40,
      "terms": "نصف أول الشهر ونصف منتصف الشهر",
      "notes": "السعر الرسمي 1000، سعر العرض 800"
    },
    {
      "code": "PKG-USD-1",
      "name": "Starter",
      "currency": "USD",
      "price": 60.0,
      "priceEgp": 3121.2000000000003,
      "duration": "باقة شهرية بنظام نصفين",
      "videos": 4,
      "unitPrice": 15,
      "terms": "نصف أول الشهر ونصف منتصف الشهر",
      "notes": "مثال: مبلغ ثابت آخر الشهر وتقييم سعر الفيديو الفعلي"
    },
    {
      "code": "PKG-USD-2",
      "name": "Basic",
      "currency": "USD",
      "price": 90.0,
      "priceEgp": 4681.8,
      "duration": "باقة شهرية بنظام نصفين",
      "videos": 6,
      "unitPrice": 15,
      "terms": "نصف أول الشهر ونصف منتصف الشهر",
      "notes": "مثال: مبلغ ثابت آخر الشهر وتقييم سعر الفيديو الفعلي"
    },
    {
      "code": "PKG-USD-3",
      "name": "Growth",
      "currency": "USD",
      "price": 130.0,
      "priceEgp": 6762.6,
      "duration": "باقة شهرية بنظام نصفين",
      "videos": 10,
      "unitPrice": 13,
      "terms": "نصف أول الشهر ونصف منتصف الشهر",
      "notes": "السعر الرسمي 150، سعر العرض 130"
    },
    {
      "code": "PKG-USD-4",
      "name": "Pro",
      "currency": "USD",
      "price": 200.0,
      "priceEgp": 10404.0,
      "duration": "باقة شهرية بنظام نصفين",
      "videos": 15,
      "unitPrice": 13,
      "terms": "نصف أول الشهر ونصف منتصف الشهر",
      "notes": "السعر الرسمي 225، سعر العرض 200"
    },
    {
      "code": "PKG-USD-5",
      "name": "Premium",
      "currency": "USD",
      "price": 220.0,
      "priceEgp": 11444.400000000001,
      "duration": "باقة شهرية بنظام نصفين",
      "videos": 20,
      "unitPrice": 11,
      "terms": "نصف أول الشهر ونصف منتصف الشهر",
      "notes": "السعر الرسمي 300، سعر العرض 220"
    },
    {
      "code": "PKG-EGP-1",
      "name": "Starter",
      "currency": "EGP",
      "price": 1800.0,
      "priceEgp": 1800.0,
      "duration": "باقة شهرية بنظام نصفين",
      "videos": 4,
      "unitPrice": 450,
      "terms": "نصف أول الشهر ونصف منتصف الشهر",
      "notes": "مثال: مبلغ ثابت آخر الشهر وتقييم سعر الفيديو الفعلي"
    },
    {
      "code": "PKG-EGP-2",
      "name": "Basic",
      "currency": "EGP",
      "price": 2700.0,
      "priceEgp": 2700.0,
      "duration": "باقة شهرية بنظام نصفين",
      "videos": 6,
      "unitPrice": 450,
      "terms": "نصف أول الشهر ونصف منتصف الشهر",
      "notes": "مثال: مبلغ ثابت آخر الشهر وتقييم سعر الفيديو الفعلي"
    },
    {
      "code": "PKG-EGP-3",
      "name": "Growth",
      "currency": "EGP",
      "price": 4000.0,
      "priceEgp": 4000.0,
      "duration": "باقة شهرية بنظام نصفين",
      "videos": 10,
      "unitPrice": 400,
      "terms": "نصف أول الشهر ونصف منتصف الشهر",
      "notes": "السعر الرسمي 5000، سعر العرض 4500"
    },
    {
      "code": "PKG-EGP-4",
      "name": "Pro",
      "currency": "EGP",
      "price": 6000.0,
      "priceEgp": 6000.0,
      "duration": "باقة شهرية بنظام نصفين",
      "videos": 15,
      "unitPrice": 400,
      "terms": "نصف أول الشهر ونصف منتصف الشهر",
      "notes": "السعر الرسمي 7500، سعر العرض 6750"
    },
    {
      "code": "PKG-EGP-5",
      "name": "Premium",
      "currency": "EGP",
      "price": 7000.0,
      "priceEgp": 7000.0,
      "duration": "باقة شهرية بنظام نصفين",
      "videos": 20,
      "unitPrice": 350,
      "terms": "نصف أول الشهر ونصف منتصف الشهر",
      "notes": "السعر الرسمي 10000، سعر العرض 8000"
    },
    {
      "code": "VID-USD-2",
      "name": "Per Video USD",
      "currency": "USD",
      "price": 0,
      "priceEgp": 0.0,
      "duration": "بالعدد آخر الشهر",
      "videos": 0,
      "unitPrice": 10,
      "terms": "مخصص",
      "notes": "مثال: عدد الفيديوهات × 15 USD في آخر الشهر"
    },
    {
      "code": "RET-SAR-1",
      "name": "Retainer 360 SAR",
      "currency": "SAR",
      "price": 360.0,
      "priceEgp": 4986.0,
      "duration": "راتب شهري ثابت آخر الشهر",
      "videos": 0,
      "unitPrice": "",
      "terms": "مخصص",
      "notes": "راتب شهري ثابت آخر الشهر؛ الأخضر حتى حوالي 8 فيديوهات، الأصفر حتى 12 فيديو تقريبًا"
    },
    {
      "code": "ONE-EGP-1",
      "name": "One Video EGP",
      "currency": "EGP",
      "price": 350.0,
      "priceEgp": 350.0,
      "duration": "دفع مرة واحدة مقابل فيديو واحد",
      "videos": 1,
      "unitPrice": 350,
      "terms": "مخصص",
      "notes": "دفع مرة واحدة مقابل فيديو واحد"
    },
    {
      "code": "ONE-SAR-1",
      "name": "One Video SAR",
      "currency": "SAR",
      "price": 50.0,
      "priceEgp": 692.5,
      "duration": "دفع مرة واحدة مقابل فيديو واحد",
      "videos": 1,
      "unitPrice": 50,
      "terms": "مخصص",
      "notes": "دفع مرة واحدة مقابل فيديو واحد"
    },
    {
      "code": "ONE-USD-1",
      "name": "One Video USD",
      "currency": "USD",
      "price": 15.0,
      "priceEgp": 780.3000000000001,
      "duration": "دفع مرة واحدة مقابل فيديو واحد",
      "videos": 1,
      "unitPrice": 15,
      "terms": "مخصص",
      "notes": "دفع مرة واحدة مقابل فيديو واحد"
    },
    {
      "code": "ONE-USD-2",
      "name": "One Video USD",
      "currency": "USD",
      "price": 15.0,
      "priceEgp": 780.3000000000001,
      "duration": "دفع مرة واحدة مقابل فيديو واحد",
      "videos": 1,
      "unitPrice": 15,
      "terms": "مخصص",
      "notes": "دفع مرة واحدة مقابل فيديو واحد"
    }
  ],
  "clients": [
    {
      "code": "C003",
      "name": "Ahmed Allaf",
      "country": "السعودية",
      "contactMethod": "",
      "contact": "",
      "packageCode": "RET-SAR-1",
      "type": "راتب شهري ثابت آخر الشهر",
      "status": "نشط",
      "notes": "مثال نوع 3 - راتب ثابت آخر الشهر",
      "date": "2026-06-01"
    },
    {
      "code": "C004",
      "name": "Qamar Nouri",
      "country": "فلسطين",
      "contactMethod": "",
      "contact": "",
      "packageCode": "VID-USD-2",
      "type": "بالعدد آخر الشهر",
      "status": "نشط",
      "notes": "مثال نوع 2 - الحساب بالعدد آخر الشهر",
      "date": "2026-06-01"
    },
    {
      "code": "C002",
      "name": "Ahmed Yasser",
      "country": "مصر",
      "contactMethod": "",
      "contact": "",
      "packageCode": "PKG-EGP-5",
      "type": "باقة شهرية بنظام نصفين",
      "status": "نشط",
      "notes": "",
      "date": "2026-06-01"
    },
    {
      "code": "C001",
      "name": "Ahmed Yasser",
      "country": "مصر",
      "contactMethod": "",
      "contact": "",
      "packageCode": "ONE-EGP-1",
      "type": "دفع مرة واحدة مقابل فيديو واحد",
      "status": "نشط",
      "notes": "بيجرب فيديو",
      "date": "2026-06-01"
    },
    {
      "code": "C005",
      "name": "Mohamed Algo",
      "country": "امارات",
      "contactMethod": "",
      "contact": "",
      "packageCode": "ONE-USD-1",
      "type": "دفع مرة واحدة مقابل فيديو واحد",
      "status": "نشط",
      "notes": "",
      "date": "2026-06-01"
    },
    {
      "code": "C006",
      "name": "Mohamed Algo",
      "country": "امارات",
      "contactMethod": "",
      "contact": "",
      "packageCode": "ONE-USD-2",
      "type": "دفع مرة واحدة مقابل فيديو واحد",
      "status": "نشط",
      "notes": "",
      "date": "2026-06-01"
    }
  ],
  "videos": [
    {
      "id": "V-001",
      "date": "2026-06-01",
      "clientCode": "C003",
      "type": "Caption Reel",
      "duration": "30-45 ثانية",
      "price": 360.0,
      "currency": "SAR",
      "rate": 13.85,
      "status": "تم التسليم",
      "count": "نعم",
      "invoiceId": "INV-001",
      "notes": "مثال"
    },
    {
      "id": "V-002",
      "date": "2026-06-02",
      "clientCode": "C004",
      "type": "Caption Reel",
      "duration": "30-45 ثانية",
      "price": 10.0,
      "currency": "USD",
      "rate": 52.02,
      "status": "تم التسليم",
      "count": "نعم",
      "invoiceId": "INV-002",
      "notes": "مثال"
    },
    {
      "id": "V-003",
      "date": "2026-06-03",
      "clientCode": "C004",
      "type": "Caption Reel",
      "duration": "30-45 ثانية",
      "price": 10.0,
      "currency": "USD",
      "rate": 52.02,
      "status": "تم التسليم",
      "count": "نعم",
      "invoiceId": "INV-002",
      "notes": "مثال"
    },
    {
      "id": "V-004",
      "date": "2026-06-03",
      "clientCode": "C003",
      "type": "Caption Reel",
      "duration": "30-45 ثانية",
      "price": 360.0,
      "currency": "SAR",
      "rate": 13.85,
      "status": "تم التسليم",
      "count": "نعم",
      "invoiceId": "INV-001",
      "notes": "مثال"
    },
    {
      "id": "V-005",
      "date": "2026-06-03",
      "clientCode": "C004",
      "type": "Caption Reel",
      "duration": "30-45 ثانية",
      "price": 10.0,
      "currency": "USD",
      "rate": 52.02,
      "status": "تم التسليم",
      "count": "نعم",
      "invoiceId": "INV-002",
      "notes": "مثال"
    },
    {
      "id": "V-006",
      "date": "2026-06-04",
      "clientCode": "C001",
      "type": "Caption Reel",
      "duration": "30-45 ثانية",
      "price": 350.0,
      "currency": "EGP",
      "rate": 1,
      "status": "تم التسليم",
      "count": "نعم",
      "invoiceId": "INV-003",
      "notes": "Video 1"
    },
    {
      "id": "V-007",
      "date": "2026-06-04",
      "clientCode": "C003",
      "type": "Caption Reel",
      "duration": "30-45 ثانية",
      "price": 360.0,
      "currency": "SAR",
      "rate": 13.85,
      "status": "تم التسليم",
      "count": "نعم",
      "invoiceId": "INV-001",
      "notes": "مثال"
    },
    {
      "id": "V-008",
      "date": "2026-06-05",
      "clientCode": "C004",
      "type": "Caption Reel",
      "duration": "30-45 ثانية",
      "price": 10.0,
      "currency": "USD",
      "rate": 52.02,
      "status": "تم التسليم",
      "count": "نعم",
      "invoiceId": "INV-002",
      "notes": "Video 4"
    },
    {
      "id": "V-009",
      "date": "2026-06-05",
      "clientCode": "C002",
      "type": "Caption Reel",
      "duration": "30-45 ثانية",
      "price": 350.0,
      "currency": "EGP",
      "rate": 1,
      "status": "تم التسليم",
      "count": "نعم",
      "invoiceId": "INV-004",
      "notes": "Video 2"
    },
    {
      "id": "V-010",
      "date": "2026-06-05",
      "clientCode": "C002",
      "type": "Caption Reel",
      "duration": "30-45 ثانية",
      "price": 350.0,
      "currency": "EGP",
      "rate": 1,
      "status": "تعديل مطلوب",
      "count": "نعم",
      "invoiceId": "INV-004",
      "notes": "Video 3"
    },
    {
      "id": "V-011",
      "date": "2026-06-06",
      "clientCode": "C003",
      "type": "Caption Reel",
      "duration": "30-45 ثانية",
      "price": 360.0,
      "currency": "SAR",
      "rate": 13.85,
      "status": "تم التسليم",
      "count": "نعم",
      "invoiceId": "INV-001",
      "notes": "مثال"
    },
    {
      "id": "V-012",
      "date": "2026-06-06",
      "clientCode": "C004",
      "type": "Caption Reel",
      "duration": "30-45 ثانية",
      "price": 10.0,
      "currency": "USD",
      "rate": 52.02,
      "status": "تعديل مطلوب",
      "count": "نعم",
      "invoiceId": "INV-002",
      "notes": "Video 5"
    },
    {
      "id": "V-013",
      "date": "2026-06-06",
      "clientCode": "C005",
      "type": "Caption Reel",
      "duration": "30-45 ثانية",
      "price": 15.0,
      "currency": "USD",
      "rate": 52.02,
      "status": "تم التسليم",
      "count": "نعم",
      "invoiceId": "INV-005",
      "notes": "Video 1"
    },
    {
      "id": "V-014",
      "date": "2026-06-06",
      "clientCode": "C006",
      "type": "Caption Reel",
      "duration": "30-45 ثانية",
      "price": 15.0,
      "currency": "USD",
      "rate": 52.02,
      "status": "تم التسليم",
      "count": "نعم",
      "invoiceId": "INV-006",
      "notes": "Video 2"
    }
  ],
  "invoices": [
    {
      "id": "INV-001",
      "date": "2026-06-01",
      "month": "2026-06",
      "clientCode": "C003",
      "type": "راتب شهري ثابت آخر الشهر",
      "desc": "فاتورة 2026-06 — Ahmed Allaf",
      "amount": 360.0,
      "currency": "SAR",
      "rate": 13.85,
      "dueDate": "",
      "notes": "التقييم يوضح هل عدد الفيديوهات مناسب للسعر"
    },
    {
      "id": "INV-002",
      "date": "2026-06-01",
      "month": "2026-06",
      "clientCode": "C004",
      "type": "بالعدد آخر الشهر",
      "desc": "فاتورة 2026-06 — Qamar Nouri",
      "amount": 50.0,
      "currency": "USD",
      "rate": 52.02,
      "dueDate": "",
      "notes": "المستحق = عدد الفيديوهات × سعر الفيديو"
    },
    {
      "id": "INV-003",
      "date": "2026-06-01",
      "month": "2026-06",
      "clientCode": "C001",
      "type": "دفع مرة واحدة مقابل فيديو واحد",
      "desc": "فاتورة 2026-06 — Ahmed Yasser",
      "amount": 350.0,
      "currency": "EGP",
      "rate": 1,
      "dueDate": "",
      "notes": ""
    },
    {
      "id": "INV-004",
      "date": "2026-06-01",
      "month": "2026-06",
      "clientCode": "C002",
      "type": "باقة شهرية بنظام نصفين",
      "desc": "فاتورة 2026-06 — Ahmed Yasser",
      "amount": 7000.0,
      "currency": "EGP",
      "rate": 1,
      "dueDate": "",
      "notes": "دفعتين: أول الشهر ومنتصف الشهر"
    },
    {
      "id": "INV-005",
      "date": "2026-06-01",
      "month": "2026-06",
      "clientCode": "C005",
      "type": "دفع مرة واحدة مقابل فيديو واحد",
      "desc": "فاتورة 2026-06 — Mohamed Algo",
      "amount": 15.0,
      "currency": "USD",
      "rate": 52.02,
      "dueDate": "",
      "notes": "فاتورة مرة واحدة لفيديو واحد"
    },
    {
      "id": "INV-006",
      "date": "2026-06-01",
      "month": "2026-06",
      "clientCode": "C006",
      "type": "دفع مرة واحدة مقابل فيديو واحد",
      "desc": "فاتورة 2026-06 — Mohamed Algo",
      "amount": 15.0,
      "currency": "USD",
      "rate": 52.02,
      "dueDate": "",
      "notes": "فاتورة مرة واحدة لفيديو واحد"
    }
  ],
  "receipts": [
    {
      "id": "RC-001",
      "date": "2026-06-05",
      "amount": 350.0,
      "currency": "EGP",
      "rate": 1,
      "account": "Vodafone Cash",
      "txId": "",
      "manualClientCode": "C001",
      "manualInvoiceId": "INV-003",
      "converted": "لا",
      "notes": "دخل في الخزنة: التزامات - Vodafone Cash"
    },
    {
      "id": "RC-002",
      "date": "2026-06-05",
      "amount": 15.0,
      "currency": "USD",
      "rate": 52.02,
      "account": "Vodafone Cash",
      "txId": "",
      "manualClientCode": "C005",
      "manualInvoiceId": "INV-005",
      "converted": "لا",
      "notes": "دخل في الخزنة: التزامات - Vodafone Cash"
    }
  ],
  "manualPayments": [],
  "expenses": [
    {
      "id": "EX-001",
      "date": "2026-06-03",
      "type": "Internet",
      "desc": "مثال",
      "amount": 661.0,
      "account": "Vodafone Cash",
      "deduct": "نعم",
      "notes": "مثال"
    },
    {
      "id": "EX-002",
      "date": "2026-06-05",
      "type": "Chat GPT",
      "desc": "مثال",
      "amount": 220.0,
      "account": "Vodafone Cash",
      "deduct": "نعم",
      "notes": "مثال"
    },
    {
      "id": "EX-003",
      "date": "2026-06-05",
      "type": "Adobe",
      "desc": "",
      "amount": 280.0,
      "account": "Vodafone Cash",
      "deduct": "نعم",
      "notes": ""
    }
  ],
  "transfers": [],
  "monthClose": [],
  "goals": [
    {
      "month": "2026-01",
      "revenueTarget": 0,
      "profitTarget": 0,
      "actualRevenue": 0.0,
      "actualProfit": 0.0,
      "revenueRate": 0.0,
      "profitRate": 0.0,
      "indicator": "▼ بعيد"
    },
    {
      "month": "2026-02",
      "revenueTarget": 0,
      "profitTarget": 0,
      "actualRevenue": 0.0,
      "actualProfit": 0.0,
      "revenueRate": 0.0,
      "profitRate": 0.0,
      "indicator": "▼ بعيد"
    },
    {
      "month": "2026-03",
      "revenueTarget": 0,
      "profitTarget": 0,
      "actualRevenue": 0.0,
      "actualProfit": 0.0,
      "revenueRate": 0.0,
      "profitRate": 0.0,
      "indicator": "▼ بعيد"
    },
    {
      "month": "2026-04",
      "revenueTarget": 0,
      "profitTarget": 0,
      "actualRevenue": 0.0,
      "actualProfit": 0.0,
      "revenueRate": 0.0,
      "profitRate": 0.0,
      "indicator": "▼ بعيد"
    },
    {
      "month": "2026-05",
      "revenueTarget": 0,
      "profitTarget": 0,
      "actualRevenue": 0.0,
      "actualProfit": 0.0,
      "revenueRate": 0.0,
      "profitRate": 0.0,
      "indicator": "▼ بعيد"
    },
    {
      "month": "2026-06",
      "revenueTarget": 2000.0,
      "profitTarget": 10000.0,
      "actualRevenue": 16497.6,
      "actualProfit": -30.699999999999818,
      "revenueRate": 8.2488,
      "profitRate": -0.0030699999999999816,
      "indicator": "▲ محقق"
    },
    {
      "month": "2026-07",
      "revenueTarget": 0,
      "profitTarget": 0,
      "actualRevenue": 0.0,
      "actualProfit": 0.0,
      "revenueRate": 0.0,
      "profitRate": 0.0,
      "indicator": "▼ بعيد"
    },
    {
      "month": "2026-08",
      "revenueTarget": 0,
      "profitTarget": 0,
      "actualRevenue": 0.0,
      "actualProfit": 0.0,
      "revenueRate": 0.0,
      "profitRate": 0.0,
      "indicator": "▼ بعيد"
    },
    {
      "month": "2026-09",
      "revenueTarget": 0,
      "profitTarget": 0,
      "actualRevenue": 0.0,
      "actualProfit": 0.0,
      "revenueRate": 0.0,
      "profitRate": 0.0,
      "indicator": "▼ بعيد"
    },
    {
      "month": "2026-10",
      "revenueTarget": 0,
      "profitTarget": 0,
      "actualRevenue": 0.0,
      "actualProfit": 0.0,
      "revenueRate": 0.0,
      "profitRate": 0.0,
      "indicator": "▼ بعيد"
    },
    {
      "month": "2026-11",
      "revenueTarget": 0,
      "profitTarget": 0,
      "actualRevenue": 0.0,
      "actualProfit": 0.0,
      "revenueRate": 0.0,
      "profitRate": 0.0,
      "indicator": "▼ بعيد"
    },
    {
      "month": "2026-12",
      "revenueTarget": 0,
      "profitTarget": 0,
      "actualRevenue": 0.0,
      "actualProfit": 0.0,
      "revenueRate": 0.0,
      "profitRate": 0.0,
      "indicator": "▼ بعيد"
    }
  ]
};
}


const MONTH_DATA_KEYS = ['clients','videos','invoices','receipts','manualPayments','expenses','transfers','accounts'];
const MONTH_SCOPED_COLLECTIONS = ['clients','videos','invoices','receipts','manualPayments','expenses','transfers','accounts'];

let state = loadState();
ensureStateShape();
let currentView = 'dashboard';

function loadState(){
  try{
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : seedData();
  }catch(e){ return seedData(); }
}
function saveState(){
  syncCurrentWorkspace();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  queueCloudSave();
}
function resetState(){
  if(!confirm('سيتم رجوع البيانات الافتراضية. هل أنت متأكد؟')) return;
  state = seedData();
  ensureStateShape();
  saveState();
  render();
  toast('تم رجوع البيانات الافتراضية');
}
function uid(prefix, list){
  const nums = list.map(x => String(x.id || x.code || '').replace(prefix+'-','').replace(prefix,'')).map(x => parseInt(x,10)).filter(Boolean);
  const next = (nums.length ? Math.max(...nums)+1 : 1);
  return `${prefix}-${String(next).padStart(3,'0')}`;
}
function today(){ return new Date().toISOString().slice(0,10); }
function monthNow(){ return today().slice(0,7); }
function activeMonth(){ return state?.settings?.currentMonth || monthNow(); }
function monthStart(month){ return `${month || activeMonth()}-01`; }
function defaultRecordDate(){ return activeMonth() === monthNow() ? today() : monthStart(activeMonth()); }
function nextMonthValue(month){
  const [y,m] = String(month || activeMonth()).split('-').map(n=>parseInt(n,10));
  if(!y || !m) return monthNow();
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function ensureStateShape(){
  state.settings = state.settings || {};
  state.settings.exchangeRates = state.settings.exchangeRates || { EGP:1, USD:52.02, SAR:13.85, QAR:13.05, IQD:0.036 };
  if(!state.settings.currentMonth) state.settings.currentMonth = inferMonthFromData() || monthNow();
  state.monthArchives = Array.isArray(state.monthArchives) ? state.monthArchives : [];
  state.monthClose = Array.isArray(state.monthClose) ? state.monthClose : [];
  state.goals = Array.isArray(state.goals) ? state.goals : [];
  state.monthWorkspaces = (state.monthWorkspaces && typeof state.monthWorkspaces === 'object' && !Array.isArray(state.monthWorkspaces)) ? state.monthWorkspaces : {};
  ['clients','packages','videos','invoices','receipts','manualPayments','expenses','transfers','accounts'].forEach(k=>{ if(!Array.isArray(state[k])) state[k] = []; });

  // ترقية تلقائية للنسخ القديمة: أي أرشيف شهر قديم يتحول لمساحة شهر قابلة للفتح والتعديل.
  state.monthArchives.forEach(archive=>{
    if(!archive || !archive.month || !archive.data) return;
    if(!state.monthWorkspaces[archive.month]){
      state.monthWorkspaces[archive.month] = {
        month: archive.month,
        updatedAt: archive.archivedAt || new Date().toISOString(),
        summary: archive.summary || null,
        data: normalizeMonthData(archive.data)
      };
    }
  });

  const current = state.settings.currentMonth;
  const hasActiveArrays = MONTH_DATA_KEYS.some(k => Array.isArray(state[k]) && state[k].length);
  if(!state.monthWorkspaces[current] || hasActiveArrays){
    state.monthWorkspaces[current] = {
      ...(state.monthWorkspaces[current] || {}),
      month: current,
      updatedAt: new Date().toISOString(),
      data: getCurrentMonthData()
    };
  }else{
    setCurrentMonthData(state.monthWorkspaces[current].data);
  }

  ensureGoalMonth(current);
  dedupeArchives();
}

function inferMonthFromData(){
  const samples = [];
  ['invoices','videos','receipts','manualPayments','expenses','transfers','clients'].forEach(k=>{
    (state[k] || []).forEach(x=>{
      if(x?.month) samples.push(x.month);
      if(x?.date && /^\d{4}-\d{2}/.test(x.date)) samples.push(x.date.slice(0,7));
    });
  });
  return samples.find(Boolean) || '';
}

function normalizeMonthData(data={}){
  const out = {};
  MONTH_DATA_KEYS.forEach(k=>{ out[k] = Array.isArray(data[k]) ? copyData(data[k]) : []; });
  if(!out.accounts.length && Array.isArray(state.accounts)) out.accounts = copyData(state.accounts);
  return out;
}

function getCurrentMonthData(){
  const out = {};
  MONTH_DATA_KEYS.forEach(k=>{ out[k] = copyData(state[k] || []); });
  return out;
}

function setCurrentMonthData(data={}){
  const clean = normalizeMonthData(data);
  MONTH_DATA_KEYS.forEach(k=>{ state[k] = copyData(clean[k]); });
}

function withTemporaryMonthData(data, fn){
  const backup = getCurrentMonthData();
  try{
    setCurrentMonthData(data);
    return fn();
  }finally{
    setCurrentMonthData(backup);
  }
}

function syncCurrentWorkspace(){
  if(!state || !state.settings) return;
  state.monthWorkspaces = (state.monthWorkspaces && typeof state.monthWorkspaces === 'object' && !Array.isArray(state.monthWorkspaces)) ? state.monthWorkspaces : {};
  const month = activeMonth();
  const previousSummary = state.monthWorkspaces?.[month]?.summary || (state.monthClose || []).find(m=>m.month===month) || {};
  const summary = currentMonthSummary(month, { closed: previousSummary.closed || 'لا', notes: previousSummary.notes || 'ملخص مباشر للشهر المفتوح' });
  state.monthWorkspaces[month] = {
    ...(state.monthWorkspaces[month] || {}),
    month,
    updatedAt: new Date().toISOString(),
    summary,
    data: getCurrentMonthData()
  };
  upsertMonthClose(summary);
  upsertGoalActuals(summary);
}

function allKnownMonths(){
  const months = new Set([activeMonth()]);
  Object.keys(state.monthWorkspaces || {}).forEach(m=>months.add(m));
  (state.monthArchives || []).forEach(a=>a?.month && months.add(a.month));
  (state.monthClose || []).forEach(m=>m?.month && months.add(m.month));
  (state.goals || []).forEach(g=>g?.month && months.add(g.month));
  return Array.from(months).filter(m=>/^\d{4}-\d{2}$/.test(m)).sort();
}

function workspaceSummary(month){
  const ws = state.monthWorkspaces?.[month];
  if(!ws) return (state.monthClose || []).find(m=>m.month===month) || null;
  if(month === activeMonth()){
    const previous = ws.summary || (state.monthClose || []).find(m=>m.month===month) || {};
    return currentMonthSummary(month, { closed: previous.closed || 'لا', notes: previous.notes || 'ملخص مباشر للشهر المفتوح' });
  }
  return withTemporaryMonthData(ws.data, ()=>currentMonthSummary(month, { closed: ws.summary?.closed || 'لا', notes: ws.summary?.notes || 'ملخص محفوظ من بيانات الشهر' }));
}

function switchMonth(month){
  ensureStateShape();
  if(!month){ toast('اختار شهر صحيح'); return; }
  if(month === activeMonth()){ render(); return; }
  syncCurrentWorkspace();
  if(!state.monthWorkspaces[month]){
    state.monthWorkspaces[month] = {
      month,
      updatedAt: new Date().toISOString(),
      summary: null,
      data: {
        clients: [], videos: [], invoices: [], receipts: [], manualPayments: [], expenses: [], transfers: [],
        accounts: copyData(state.accounts || []).map(a=>({...a, opening:0}))
      }
    };
  }
  state.settings.currentMonth = month;
  setCurrentMonthData(state.monthWorkspaces[month].data);
  ensureGoalMonth(month);
  saveState();
  currentView = 'dashboard';
  render();
  toast(`تم فتح شهر ${month} للتصفح والتعديل`);
}

function monthSwitcher(){
  const months = allKnownMonths();
  const active = activeMonth();
  const s = workspaceSummary(active) || currentMonthSummary(active);
  const opts = months.slice().reverse().map(m=>`<option value="${m}" ${m===active?'selected':''}>${m}${m===active?' — مفتوح الآن':''}</option>`).join('');
  return `<div class="month-switcher no-print">
    <div class="month-switcher-info">
      <span>الشهر الحالي</span>
      <strong>${active}</strong>
      <small>${fmt(s.paid)} مقبوض • ${fmt(s.profit)} ربح • ${s.clients} عميل • ${s.videos} فيديو</small>
    </div>
    <div class="month-switcher-actions">
      <select id="monthJumpSelect">${opts}</select>
      <button class="btn ghost" id="openSelectedMonthBtn">فتح / تعديل الشهر</button>
      <button class="btn primary" data-open-new-month>+ شهر جديد</button>
    </div>
  </div>`;
}

function dedupeArchives(){
  const seen = new Set();
  state.monthArchives = (state.monthArchives || []).filter(a=>{
    if(!a || !a.month) return false;
    if(seen.has(a.month)) return false;
    seen.add(a.month);
    return true;
  });
}

function upsertMonthArchive(archive){
  if(!archive || !archive.month) return;
  const idx = state.monthArchives.findIndex(a=>a.month === archive.month);
  if(idx >= 0) state.monthArchives[idx] = archive;
  else state.monthArchives.push(archive);
  dedupeArchives();
}

function copyData(value){ return JSON.parse(JSON.stringify(value)); }
function num(v){ const n = Number(v); return Number.isFinite(n) ? n : 0; }
function rateFor(currency, manualRate){ return num(manualRate) || num(state.settings.exchangeRates[currency]) || 1; }
function egp(amount, currency='EGP', rate){ return num(amount) * rateFor(currency, rate); }
function fmt(n, currency='EGP'){
  const value = num(n);
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: currency==='EGP'?0:2 }).format(value) + ' ' + currency;
}
function pct(n){ return `${num(n).toFixed(1)}%`; }
function byId(id){ return document.getElementById(id); }

function updateCloudButtons(){
  const status = byId('cloudStatusBtn');
  if(status){
    status.textContent = cloudSyncEnabled ? 'متزامن تلقائيًا' : 'Local';
    status.className = cloudSyncEnabled ? 'btn secondary' : 'btn ghost';
    status.title = cloudSyncEnabled ? 'المزامنة تعمل بدون تسجيل دخول' : 'البيانات محفوظة محليًا فقط';
  }
}
async function initSupabase(){
  try{
    if(!window.supabase){
      toast('مكتبة Supabase لم تحمل. تأكد من الإنترنت.');
      cloudSyncEnabled = false;
      updateCloudButtons();
      return;
    }
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    cloudSyncEnabled = true;
    updateCloudButtons();
    await loadCloudState();
  }catch(err){
    console.error(err);
    cloudSyncEnabled = false;
    updateCloudButtons();
    toast('تعذر الاتصال بـ Supabase');
  }
}
async function loadCloudState(){
  if(!supabaseClient) return;
  isCloudLoading = true;
  try{
    const { data, error } = await supabaseClient
      .from(CLOUD_TABLE)
      .select('settings_json, updated_at')
      .eq('id', CLOUD_ROW_ID)
      .maybeSingle();
    if(error) throw error;
    if(data && data.settings_json && Object.keys(data.settings_json).length){
      state = data.settings_json;
      ensureStateShape();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      render();
      toast('تم تحميل البيانات من السحابة');
    }else{
      await saveCloudState(true);
      toast('تم تهيئة المزامنة السحابية');
    }
  }catch(err){
    console.error(err);
    toast('مشكلة في تحميل بيانات السحابة — تأكد من تشغيل SQL');
  }finally{
    isCloudLoading = false;
    updateCloudButtons();
  }
}
function queueCloudSave(){
  if(!cloudSyncEnabled || isCloudLoading) return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(()=>saveCloudState(false), 700);
}
async function saveCloudState(force=false){
  if(!supabaseClient) return;
  try{
    const row = {
      id: CLOUD_ROW_ID,
      settings_json: state,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabaseClient.from(CLOUD_TABLE).upsert(row, { onConflict: 'id' });
    if(error) throw error;
    if(force) toast('تم حفظ البيانات على السحابة');
    updateCloudButtons();
  }catch(err){
    console.error(err);
    toast('فشل حفظ السحابة — راجع صلاحيات Supabase');
  }
}
async function forceCloudSave(){
  await saveCloudState(true);
}
async function forceCloudLoad(){
  await loadCloudState();
}
function escapeHtml(value){ return String(value ?? '').replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s])); }
function clientName(code){ return state.clients.find(c=>c.code===code)?.name || 'غير موجود'; }
function packageName(code){ return state.packages.find(p=>p.code===code)?.name || ''; }
function invoiceById(id){ return state.invoices.find(i=>i.id===id); }
function clientOptions(){ return state.clients.map(c=>({value:c.code,label:`${c.code} — ${c.name}`})); }
function invoiceOptions(openOnly=false){
  return state.invoices.filter(i=>!openOnly || invoiceCalc(i).remainingEgp>0).map(i=>({value:i.id,label:`${i.id} — ${clientName(i.clientCode)} — ${fmt(i.amount,i.currency)}`}));
}
function packageOptions(){ return state.packages.map(p=>({value:p.code,label:`${p.code} — ${p.name}`})); }

function receiptMatch(receipt){
  if(receipt.manualInvoiceId){
    const inv = invoiceById(receipt.manualInvoiceId);
    return inv ? { status:'اختيار يدوي', invoiceId:inv.id, clientCode:inv.clientCode, score:'يدوي', finalInvoiceId:inv.id, finalClientCode:inv.clientCode } : { status:'يحتاج مراجعة', invoiceId:'', clientCode:receipt.manualClientCode||'', score:'', finalInvoiceId:'', finalClientCode:receipt.manualClientCode||'' };
  }
  if(receipt.manualClientCode){
    return { status:'اختيار يدوي', invoiceId:'', clientCode:receipt.manualClientCode, score:'يدوي', finalInvoiceId:'', finalClientCode:receipt.manualClientCode };
  }
  const matches = state.invoices.filter(inv => inv.currency === receipt.currency && Math.abs(num(inv.amount) - num(receipt.amount)) < 0.0001 && invoiceCalc(inv).remainingEgp > 0);
  if(matches.length === 1){ return { status:'تطابق مؤكد', invoiceId:matches[0].id, clientCode:matches[0].clientCode, score:'100%', finalInvoiceId:matches[0].id, finalClientCode:matches[0].clientCode }; }
  if(matches.length > 1){ return { status:'أكثر من احتمال — اختار يدويًا', invoiceId:'', clientCode:'', score:'متعدد', finalInvoiceId:'', finalClientCode:'' }; }
  return { status:'غير معروف — اختار يدويًا', invoiceId:'', clientCode:'', score:'0%', finalInvoiceId:'', finalClientCode:'' };
}

function receiptFinalInvoiceId(r){ return receiptMatch(r).finalInvoiceId; }
function receiptFinalClientCode(r){ return receiptMatch(r).finalClientCode; }
function paidFromReceipts(invoiceId){
  return state.receipts.filter(r => receiptFinalInvoiceId(r) === invoiceId).reduce((s,r)=>s+egp(r.amount,r.currency,r.rate),0);
}
function paidFromManual(invoiceId){
  return state.manualPayments.filter(p => p.invoiceId === invoiceId).reduce((s,p)=>s+egp(p.amount,p.currency,p.rate),0);
}
function invoiceCalc(inv){
  const dueEgp = egp(inv.amount, inv.currency, inv.rate);
  const manual = paidFromManual(inv.id);
  const receipts = paidFromReceipts(inv.id);
  const paid = manual + receipts;
  const remainingEgp = Math.max(0, dueEgp - paid);
  let status = 'غير مدفوع';
  if(dueEgp === 0) status = 'يحتاج تحديد مبلغ';
  else if(paid > dueEgp) status = 'زيادة دفع / يحتاج مراجعة';
  else if(Math.abs(paid - dueEgp) < 0.01) status = 'مدفوع';
  else if(paid > 0) status = 'مدفوع جزئيًا';
  if(inv.dueDate && inv.dueDate < today() && remainingEgp > 0) status = 'متأخر';
  if(!inv.dueDate && remainingEgp > 0) status = 'يحتاج تاريخ استحقاق';
  return { dueEgp, manual, receipts, paid, remainingEgp, status };
}
function statusBadge(status){
  let cls = 'neutral';
  if(['مدفوع','تطابق مؤكد','تم التنفيذ','نعم','اختيار يدوي','مفتوح'].includes(status)) cls='good';
  else if(['مدفوع جزئيًا','يحتاج تاريخ استحقاق','يحتاج مراجعة','أكثر من احتمال — اختار يدويًا','زيادة دفع / يحتاج مراجعة','محفوظ','قابل للتعديل','مغلق'].includes(status)) cls='warn';
  else if(['متأخر','غير معروف — اختار يدويًا','لا','غير منفذ'].includes(status)) cls='danger';
  else if(['غير مدفوع','يحتاج تحديد مبلغ'].includes(status)) cls='neutral';
  return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}
function accountBalances(){
  const balances = {};
  state.accounts.forEach(a=> balances[a.name] = num(a.opening));
  state.receipts.forEach(r=>{ if(balances[r.account] !== undefined) balances[r.account] += egp(r.amount,r.currency,r.rate); });
  state.expenses.forEach(e=>{ if(e.deduct === 'نعم' && balances[e.account] !== undefined) balances[e.account] -= num(e.amount); });
  state.transfers.filter(t=>t.executed==='نعم').forEach(t=>{
    if(balances[t.from] !== undefined) balances[t.from] -= num(t.amount);
    if(balances[t.to] !== undefined) balances[t.to] += num(t.amount);
  });
  return balances;
}
function totals(){
  const due = state.invoices.reduce((s,i)=>s+invoiceCalc(i).dueEgp,0);
  const paid = state.invoices.reduce((s,i)=>s+invoiceCalc(i).paid,0);
  const remaining = state.invoices.reduce((s,i)=>s+invoiceCalc(i).remainingEgp,0);
  const expenses = state.expenses.filter(e=>e.deduct==='نعم').reduce((s,e)=>s+num(e.amount),0);
  const balances = accountBalances();
  const totalMoney = Object.values(balances).reduce((s,n)=>s+n,0);
  return { due, paid, remaining, expenses, profit: paid-expenses, balances, totalMoney };
}
function distribution(){
  const t = totals();
  const target = t.totalMoney / 3;
  const vodafone = t.balances['Vodafone Cash'] || 0;
  const fawry = t.balances['فيزا فوري'] || 0;
  const bank = t.balances['فيزا بنك مصر'] || 0;
  let needFawry = Math.max(0, target - fawry);
  let needBank = Math.max(0, target - bank);
  const availableFromVodafone = Math.max(0, vodafone - target);
  const totalNeed = needFawry + needBank;
  let toFawry = 0, toBank = 0;
  if(totalNeed > 0 && availableFromVodafone > 0){
    const ratio = Math.min(1, availableFromVodafone / totalNeed);
    toFawry = Math.round(needFawry * ratio);
    toBank = Math.round(needBank * ratio);
  }
  const keepVodafone = Math.round(vodafone - toFawry - toBank);
  return { target, vodafone, fawry, bank, needFawry, needBank, toFawry, toBank, keepVodafone, totalMoney:t.totalMoney };
}
function auditItem(type, message, level, view, search, fix, targetType='', targetId=''){
  return { type, message, level, view, search:String(search||''), fix, targetType, targetId:String(targetId||'') };
}
function auditItems(){
  const items = [];
  const add = (...args)=>items.push(auditItem(...args));
  const dup = (arr, key, label, view, targetType='') => {
    const seen = new Map(), duplicates = new Map();
    arr.forEach(x=>{
      const v = x && x[key];
      if(!v) return;
      if(seen.has(v)) duplicates.set(v, [seen.get(v), x]);
      else seen.set(v, x);
    });
    duplicates.forEach((records,v)=> add(
      'تكرار',
      `${label} مكرر: ${v}`,
      'danger',
      view,
      v,
      `راجع السجلات التي تحمل نفس ${label}. أبقِ سجلًا واحدًا صحيحًا وعدّل أو احذف التكرار حتى لا تتكرر الحسابات.`,
      targetType,
      v
    ));
  };

  dup(state.clients,'code','كود عميل','clients','client');
  dup(state.invoices,'id','رقم فاتورة','invoices','invoice');
  dup(state.receipts,'id','رقم استلام','receipts','receipt');

  const names = {};
  state.clients.forEach(c=>{
    const n=(c.name||'').trim().toLowerCase();
    if(!n) return;
    names[n]=(names[n]||[]).concat(c.code);
  });
  Object.entries(names).forEach(([name,codes])=>{
    if(codes.length>1) add(
      'تشابه عملاء',
      `اسم عميل مكرر على أكواد مختلفة: ${name} — ${codes.join(' / ')}`,
      'warn',
      'clients',
      codes[0],
      'افتح صفحة العملاء، وحدد هل هم نفس العميل. لو نفس العميل، وحّد التعاملات على كود واحد وانقل الفواتير/الفيديوهات عليه، ثم احذف أو أوقف الكود المكرر.',
      'client',
      codes[0]
    );
  });

  const txs = state.receipts.filter(r=>r.txId).map(r=>({id:r.txId, receiptId:r.id}));
  dup(txs,'id','Transaction ID','receipts','receipt');

  state.clients.forEach(c=>{
    if(!c.code) add('عميل', 'عميل بدون كود', 'danger', 'clients', c.name, 'ادخل صفحة العملاء واكتب كود فريد للعميل مثل C005.', 'client', c.code);
    if(!c.name) add('عميل', `${c.code || 'سجل عميل'} بدون اسم`, 'danger', 'clients', c.code, 'اكتب اسم العميل حتى تظهر الفواتير والاستلامات بشكل مفهوم.', 'client', c.code);
    if(c.packageCode && !state.packages.find(p=>p.code===c.packageCode)) add('عميل', `${c.code} مربوط بباقة غير موجودة: ${c.packageCode}`, 'warn', 'clients', c.code, 'اختار باقة موجودة من صفحة العملاء أو أضف الباقة الناقصة في صفحة الباقات.', 'client', c.code);
  });

  state.packages.forEach(p=>{
    if(!p.code) add('باقة', 'باقة بدون كود', 'danger', 'packages', p.name, 'اكتب كود للباقة مثل P004.', 'package', p.code);
    if(!p.currency) add('باقة', `${p.code} بدون عملة`, 'warn', 'packages', p.code, 'اختار العملة من القائمة حتى تتحسب بالجنيه بشكل صحيح.', 'package', p.code);
    if(num(p.price)<=0) add('باقة', `${p.code} سعرها صفر أو فارغ`, 'warn', 'packages', p.code, 'عدّل سعر الباقة أو اكتب ملاحظة أنها مجانية/تجربة.', 'package', p.code);
  });

  state.invoices.forEach(inv=>{
    const c = invoiceCalc(inv);
    if(!state.clients.find(cl=>cl.code===inv.clientCode)) add('فاتورة', `${inv.id} مرتبطة بعميل غير موجود`, 'danger', 'invoices', inv.id, 'افتح الفاتورة واختار كود عميل موجود، أو أضف العميل الناقص في صفحة العملاء.', 'invoice', inv.id);
    if(num(inv.amount)<=0) add('فاتورة', `${inv.id} المستحق صفر أو فارغ`, 'warn', 'invoices', inv.id, 'حدد قيمة الفاتورة الصحيحة أو اكتب ملاحظة واضحة لو هي فاتورة انتظار آخر الشهر.', 'invoice', inv.id);
    if(inv.currency !== 'EGP' && !num(inv.rate)) add('فاتورة', `${inv.id} تحتاج سعر صرف`, 'warn', 'invoices', inv.id, 'اكتب سعر الصرف حتى يتحسب المستحق بالجنيه.', 'invoice', inv.id);
    if(!inv.dueDate && c.remainingEgp>0) add('فاتورة', `${inv.id} بدون تاريخ استحقاق`, 'warn', 'invoices', inv.id, 'حدد تاريخ استحقاق عشان النظام يعرف هل الفاتورة متأخرة ولا لا.', 'invoice', inv.id);
    if(c.paid > c.dueEgp && c.dueEgp > 0) add('زيادة دفع', `${inv.id} مدفوع أكثر من المستحق`, 'danger', 'invoices', inv.id, 'راجع الاستلامات والمدفوعات المرتبطة بالفاتورة واحذف التكرار أو عدّل المبلغ.', 'invoice', inv.id);
    if(c.status !== 'مدفوع') add('فاتورة', `${inv.id} — ${clientName(inv.clientCode)} — ${c.status} — المتبقي ${fmt(c.remainingEgp)}`, c.status==='متأخر'?'danger':'warn', 'invoices', inv.id, c.status==='متأخر' ? 'تواصل مع العميل أو سجل دفعة جديدة. لو العميل دفع بالفعل، اربط الاستلام بهذه الفاتورة.' : 'لو الفاتورة اتدفعت، سجل الاستلام في استلامات سريعة أو مدفوعات يدوية. لو لسه، سيبها مفتوحة.', 'invoice', inv.id);
    if(c.manual>0 && c.receipts>0) add('تكرار دفع', `${inv.id} عليها مدفوعات يدوية واستلامات سريعة — راجع عدم التكرار`, 'warn', 'invoices', inv.id, 'افتح الفاتورة وراجع هل الدفع اتسجل مرتين. الأفضل تخلي الدفع في استلامات سريعة وتحذف اليدوي لو مكرر.', 'invoice', inv.id);
  });

  state.receipts.forEach(r=>{
    const m = receiptMatch(r);
    if(!m.finalClientCode) add('استلام', `${r.id} بدون عميل نهائي`, 'danger', 'receipts', r.id, 'افتح الاستلام واختار كود عميل يدوي من القائمة أو اربطه بفاتورة صحيحة.', 'receipt', r.id);
    if(!m.finalInvoiceId) add('استلام', `${r.id} بدون فاتورة نهائية`, 'warn', 'receipts', r.id, 'اختار رقم فاتورة يدوي أو أنشئ فاتورة جديدة ثم اربط الاستلام بها.', 'receipt', r.id);
    if(num(r.amount) <= 0) add('استلام', `${r.id} المبلغ صفر أو فارغ`, 'danger', 'receipts', r.id, 'اكتب المبلغ الصحيح الذي وصلك.', 'receipt', r.id);
    if(r.currency !== 'EGP' && !num(r.rate)) add('استلام', `${r.id} يحتاج سعر صرف`, 'warn', 'receipts', r.id, 'اكتب سعر الصرف حتى يظهر المبلغ بالجنيه.', 'receipt', r.id);
    if(m.status && String(m.status).includes('أكثر من احتمال')) add('استلام', `${r.id} له أكثر من فاتورة محتملة`, 'warn', 'receipts', r.id, 'اختار الفاتورة الصحيحة يدويًا من خانة رقم فاتورة يدوي.', 'receipt', r.id);
  });

  state.videos.forEach(v=>{
    if(!v.clientCode) add('فيديو', `${v.id} بدون كود عميل`, 'danger', 'videos', v.id, 'اختار كود العميل من القائمة حتى يظهر في الحسابات والفواتير.', 'video', v.id);
    if(v.count==='نعم' && !v.invoiceId) add('فيديو', `${v.id} محسوب بدون فاتورة`, 'warn', 'videos', v.id, 'اربط الفيديو برقم فاتورة أو أنشئ فاتورة جديدة له.', 'video', v.id);
    if(v.status==='تم التسليم' && !v.invoiceId) add('فيديو', `${v.id} تم تسليمه بدون فاتورة`, 'warn', 'videos', v.id, 'اعمل فاتورة للفيديو أو اربطه بفاتورة موجودة.', 'video', v.id);
    if(v.duration==='أكثر من 60 ثانية') add('تسعير', `${v.id} أكثر من 60 ثانية — راجع السعر`, 'warn', 'videos', v.id, 'راجع السعر لأن الفيديوهات فوق 60 ثانية لها تسعير مختلف حسب شروطك.', 'video', v.id);
  });

  state.expenses.forEach(e=>{
    if(!e.type) add('مصروف', `${e.id} بدون نوع مصروف`, 'warn', 'expenses', e.id, 'اختار نوع المصروف من القائمة عشان التقارير تبقى منظمة.', 'expense', e.id);
    if(!e.account) add('مصروف', `${e.id} بدون حساب`, 'danger', 'expenses', e.id, 'اختار الحساب الذي خرج منه المصروف.', 'expense', e.id);
    if(num(e.amount)<=0) add('مصروف', `${e.id} المبلغ صفر أو فارغ`, 'warn', 'expenses', e.id, 'اكتب قيمة المصروف الصحيحة أو احذف السجل لو اتعمل بالخطأ.', 'expense', e.id);
  });

  state.transfers.forEach(t=>{
    if(t.from===t.to) add('تحويل', `${t.id} من وإلى نفس الحساب`, 'danger', 'transfers', t.id, 'غيّر حساب الإرسال أو الاستقبال. التحويل لازم يكون بين حسابين مختلفين.', 'transfer', t.id);
    if(num(t.amount)<=0) add('تحويل', `${t.id} مبلغ التحويل صفر`, 'danger', 'transfers', t.id, 'اكتب مبلغ التحويل الصحيح أو احذف السجل.', 'transfer', t.id);
    if(t.executed !== 'نعم') add('تحويل', `${t.id} غير منفذ`, 'warn', 'transfers', t.id, 'لو نفذت التحويل فعلًا، عدّل تم التنفيذ إلى نعم. لو لم تنفذه، سيبه لا.', 'transfer', t.id);
  });

  const balances = accountBalances();
  Object.entries(balances).forEach(([acc,b])=>{
    if(b<0) add('حسابات', `رصيد ${acc} بالسالب: ${fmt(b)}`, 'danger', 'accounts', acc, 'راجع الاستلامات والمصروفات والتحويلات الخاصة بهذا الحساب؛ غالبًا فيه مصروف أو تحويل أكبر من الرصيد.', '', acc);
  });
  return items;
}


function render(){
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.view === currentView));
  const titles = { dashboard:'لوحة التحكم', clients:'العملاء', packages:'الباقات والتسعير', videos:'الفيديوهات', invoices:'فواتير الشهر', receipts:'استلامات سريعة', manualPayments:'مدفوعات يدوية', expenses:'المصروفات', accounts:'الحسابات + توزيع 33%', transfers:'التحويلات', printInvoice:'طباعة فاتورة', monthClose:'داشبورد الشهور', audit:'فحص الأخطاء', settings:'إعدادات ونسخ احتياطي'};
  byId('pageTitle').textContent = titles[currentView] || '';
  const app = byId('app');
  const map = { dashboard:renderDashboard, clients:renderClients, packages:renderPackages, videos:renderVideos, invoices:renderInvoices, receipts:renderReceipts, manualPayments:renderManualPayments, expenses:renderExpenses, accounts:renderAccounts, transfers:renderTransfers, printInvoice:renderPrintInvoice, monthClose:renderMonthClose, audit:renderAudit, settings:renderSettings };
  app.innerHTML = monthSwitcher() + (map[currentView] || renderDashboard)();
  bindViewEvents();
}

function metric(label,value,sub='',cls='',icon=''){
  return `<div class="card metric ${cls}"><div class="metric-icon">${icon}</div><div class="label">${label}</div><div class="value">${value}</div><div class="sub">${sub}</div></div>`;
}
function accountTheme(name){
  if(name === 'Vodafone Cash') return 'vodafone';
  if(name === 'فيزا فوري') return 'fawry';
  if(name === 'فيزا بنك مصر') return 'bank';
  return 'default';
}
function accountShort(name){
  if(name === 'Vodafone Cash') return 'VC';
  if(name === 'فيزا فوري') return 'FW';
  if(name === 'فيزا بنك مصر') return 'BM';
  return 'AC';
}
function accountVisualCard(name, balance, total, target){
  const theme = accountTheme(name);
  const percent = total ? Math.max(0, Math.min(100, balance / total * 100)) : 0;
  const diff = balance - target;
  const remainingToTarget = Math.max(0, target - balance);
  const overTarget = Math.max(0, diff);
  const status = Math.abs(diff) < 5 ? 'متوازن' : diff > 0 ? 'فوق الهدف' : 'تحت الهدف';
  const statusClass = Math.abs(diff) < 5 ? 'good' : diff > 0 ? 'warn' : 'danger';
  const statusIcon = diff > 0 ? '↗' : diff < 0 ? '↘' : '•';
  const brandWord = name === 'فيزا فوري' ? 'MEZA' : name === 'فيزا بنك مصر' ? 'BANQUE MISR' : '';
  const accentValue = fmt(diff >= 0 ? overTarget : remainingToTarget);
  const accentLabel = diff >= 0 ? 'زيادة عن الهدف' : 'متبقي عن الهدف';
  const decorative = name === 'Vodafone Cash'
    ? `<div class="card-deco phone-cash"><div class="phone-body"></div><div class="cash-note"></div></div>`
    : name === 'فيزا فوري'
      ? `<div class="card-deco meza-block"><div class="brand-title">MEZA</div><div class="contactless">)))</div><div class="chip"></div></div>`
      : `<div class="card-deco bank-block"><div class="bank-mark">BANQUE MISR</div><div class="contactless">)))</div><div class="dome"></div></div>`;
  return `
    <button class="account-card ${theme} realistic-card" data-account="${escapeHtml(name)}" type="button" title="عرض سجل الحساب">
      <div class="account-sheen"></div>
      <div class="account-top">
        <div class="account-logo">${accountShort(name)}</div>
        <span class="account-pill ${statusClass}"><b>${status}</b><i>${statusIcon}</i></span>
      </div>
      <div class="account-headline">
        <div class="account-name">${name}</div>
        ${brandWord ? `<div class="account-brandword">${brandWord}</div>` : ''}
      </div>
      <div class="account-balance">${num(balance).toLocaleString('en-US',{maximumFractionDigits:0})}<small>EGP</small></div>
      <div class="account-caption">الرصيد الحالي</div>
      ${decorative}
      <div class="account-side-percent">${pct(percent)}</div>
      <div class="account-progress"><span style="width:${percent}%"></span></div>
      <div class="account-footer split">
        <div><strong>${fmt(target)}</strong><span>الهدف</span></div>
        <div><strong>${accentValue}</strong><span>${accentLabel}</span></div>
      </div>
    </button>`;
}

function accountLedgerRows(accountName){
  const rows = [];
  const acc = state.accounts.find(a=>a.name===accountName);
  if(acc) rows.push({date:'—', type:'رصيد افتتاحي', desc:'الرصيد الأساسي عند بداية النظام', inVal:num(acc.opening), outVal:0, ref:'Opening'});
  state.receipts.filter(r=>r.account===accountName).forEach(r=>{
    const match = receiptMatch(r);
    rows.push({date:r.date, type:'استلام', desc:`${clientName(match.finalClientCode)} — ${match.finalInvoiceId || 'بدون فاتورة'}`, inVal:egp(r.amount,r.currency,r.rate), outVal:0, ref:r.id});
  });
  state.manualPayments.filter(p=>p.account===accountName).forEach(p=>{
    rows.push({date:p.date, type:'دفع يدوي', desc:`${clientName(p.clientCode)} — ${p.invoiceId || 'بدون فاتورة'}`, inVal:egp(p.amount,p.currency,p.rate), outVal:0, ref:p.id});
  });
  state.expenses.filter(e=>e.account===accountName && e.deduct==='نعم').forEach(e=>{
    rows.push({date:e.date, type:'مصروف', desc:`${e.type || 'مصروف'} — ${e.desc || '-'}`, inVal:0, outVal:num(e.amount), ref:e.id});
  });
  state.transfers.filter(t=>t.executed==='نعم' && (t.from===accountName || t.to===accountName)).forEach(t=>{
    if(t.to===accountName) rows.push({date:t.date, type:'تحويل داخل', desc:`من ${t.from}`, inVal:num(t.amount), outVal:0, ref:t.id});
    if(t.from===accountName) rows.push({date:t.date, type:'تحويل خارج', desc:`إلى ${t.to}`, inVal:0, outVal:num(t.amount), ref:t.id});
  });
  return rows.sort((a,b)=>String(a.date).localeCompare(String(b.date)));
}
function openAccountLedger(accountName){
  const rows = accountLedgerRows(accountName);
  let running = 0;
  const tableRows = rows.map(r=>{
    running += num(r.inVal) - num(r.outVal);
    return `<tr><td>${escapeHtml(r.date)}</td><td>${statusBadge(r.type)}</td><td>${escapeHtml(r.desc)}</td><td class="money-in">${r.inVal?fmt(r.inVal):'-'}</td><td class="money-out">${r.outVal?fmt(r.outVal):'-'}</td><td>${fmt(running)}</td><td>${escapeHtml(r.ref)}</td></tr>`;
  }).join('');
  const totalIn = rows.reduce((s,r)=>s+num(r.inVal),0);
  const totalOut = rows.reduce((s,r)=>s+num(r.outVal),0);
  byId('modalTitle').textContent = `سجل حساب: ${accountName}`;
  byId('modalBody').innerHTML = `
    <div class="ledger-summary">
      <div><span>إجمالي الداخل</span><strong>${fmt(totalIn)}</strong></div>
      <div><span>إجمالي الخارج</span><strong>${fmt(totalOut)}</strong></div>
      <div><span>الرصيد الحالي</span><strong>${fmt(totalIn-totalOut)}</strong></div>
    </div>
    <div class="table-shell ledger-table"><div class="table-wrap"><table style="min-width:980px"><thead><tr><th>التاريخ</th><th>النوع</th><th>الوصف</th><th>داخل</th><th>خارج</th><th>الرصيد بعد الحركة</th><th>المرجع</th></tr></thead><tbody>${tableRows || '<tr><td colspan="7">لا توجد حركات</td></tr>'}</tbody></table></div></div>
    <div class="form-actions"><button class="btn ghost" id="cancelForm">إغلاق</button><button class="btn primary" data-open="transfer">+ تحويل جديد</button></div>`;
  byId('modal').classList.remove('hidden');
  byId('cancelForm').addEventListener('click', closeModal);
  const transferBtn = byId('modalBody').querySelector('[data-open="transfer"]');
  if(transferBtn) transferBtn.addEventListener('click',()=>{ closeModal(); openForm('transfer'); });
}


function monthlyPerformanceChart(){
  const goals = (state.goals || []).filter(g => g.month).slice(-12);
  const t = totals();
  const chartMonth = activeMonth();
  let data = goals.length ? goals.map(g => ({
    month: g.month,
    revenue: num(g.actualRevenue),
    target: num(g.revenueTarget),
    profit: num(g.actualProfit),
    indicator: g.indicator || ''
  })) : [{month:chartMonth,revenue:t.paid,target:t.due,profit:t.profit,indicator:t.profit>=0?'▲':'▼'}];

  // لو الأشهر القديمة كلها صفر، خلي شهر النظام الحالي ظاهر بقوة من بيانات الموقع الحالية
  data = data.map(row => row.month === chartMonth ? {...row, revenue: Math.max(row.revenue, t.paid), target: Math.max(row.target, t.due || row.target), profit: t.profit} : row);

  const maxVal = Math.max(1, ...data.map(d => Math.max(num(d.revenue), num(d.target))));
  const W = 760, H = 260, padX = 42, padY = 34;
  const plotW = W - padX*2, plotH = H - padY*2;
  const point = (value, i) => {
    const x = padX + (data.length === 1 ? plotW/2 : i * (plotW/(data.length-1)));
    const y = H - padY - (num(value)/maxVal)*plotH;
    return [x,y];
  };
  const revPts = data.map((d,i)=>point(d.revenue,i));
  const targetPts = data.map((d,i)=>point(d.target,i));
  const pathFrom = pts => pts.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const bars = data.map((d,i)=>{
    const [x,y]=point(d.revenue,i);
    const h = H-padY-y;
    const up = num(d.revenue) >= num(d.target) && num(d.target) > 0;
    return `<g class="trend-bar ${up?'up':'down'}" style="--i:${i}"><rect x="${(x-13).toFixed(1)}" y="${y.toFixed(1)}" width="26" height="${Math.max(5,h).toFixed(1)}" rx="10"></rect><text x="${x.toFixed(1)}" y="${(H-10).toFixed(1)}">${d.month.slice(5)}</text></g>`;
  }).join('');
  const dots = revPts.map((p,i)=>{
    const d=data[i]; const up = num(d.revenue) >= num(d.target) && num(d.target)>0;
    return `<g class="trend-dot ${up?'up':'down'}" style="--i:${i}"><circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="5"></circle><text x="${p[0].toFixed(1)}" y="${(p[1]-12).toFixed(1)}">${up?'↗':'↘'}</text></g>`;
  }).join('');
  const current = data.find(d=>d.month===chartMonth) || data[data.length-1] || {};
  const achievement = num(current.target) ? Math.round(num(current.revenue)/num(current.target)*100) : 0;
  return `
    <div class="panel modern-panel trend-panel">
      <div class="panel-head">
        <div>
          <h3>مخطط الأداء المالي</h3>
          <p>أسهم صعود وهبوط حسب تحقيق هدف الإيرادات، والبيانات مأخوذة من ملف الإكسل.</p>
        </div>
        <div class="trend-score ${achievement>=100?'up':'down'}"><span>${achievement>=100?'↗':'↘'}</span><strong>${achievement}%</strong><small>تحقيق الهدف</small></div>
      </div>
      <div class="trend-content">
        <div class="trend-chart-wrap">
          <svg class="trend-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="مخطط أداء مالي">
            <defs>
              <linearGradient id="revLine" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stop-color="#7ee7dd"/>
                <stop offset="100%" stop-color="#19a7a5"/>
              </linearGradient>
              <linearGradient id="barUp" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#7ee7dd"/>
                <stop offset="100%" stop-color="#19a7a5"/>
              </linearGradient>
              <linearGradient id="barDown" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#ff8b8b"/>
                <stop offset="100%" stop-color="#ef4444"/>
              </linearGradient>
            </defs>
            <path class="trend-grid-line" d="M${padX},${padY} H${W-padX} M${padX},${H/2} H${W-padX} M${padX},${H-padY} H${W-padX}"></path>
            ${bars}
            <path class="target-line" d="${pathFrom(targetPts)}"></path>
            <path class="revenue-line" d="${pathFrom(revPts)}"></path>
            ${dots}
          </svg>
        </div>
        <div class="trend-side">
          <div><span>إيراد الشهر</span><strong>${fmt(num(current.revenue))}</strong></div>
          <div><span>هدف الشهر</span><strong>${fmt(num(current.target))}</strong></div>
          <div><span>صافي الربح</span><strong class="${t.profit>=0?'pos':'neg'}">${fmt(t.profit)}</strong></div>
          <div><span>حالة المؤشر</span><strong>${escapeHtml(current.indicator || (achievement>=100?'▲ محقق':'▼ بعيد'))}</strong></div>
        </div>
      </div>
    </div>`;
}


function recentActivity(){
  const items = [];
  state.receipts.slice(-4).forEach(r=>items.push({type:'استلام', title:`${fmt(r.amount,r.currency)} من ${clientName(receiptFinalClientCode(r))}`, sub:r.date, level:'good'}));
  state.invoices.slice(-4).forEach(inv=>items.push({type:'فاتورة', title:`${inv.id} — ${clientName(inv.clientCode)}`, sub:invoiceCalc(inv).status, level:invoiceCalc(inv).remainingEgp>0?'warn':'good'}));
  state.expenses.slice(-3).forEach(e=>items.push({type:'مصروف', title:`${fmt(e.amount)} — ${e.type}`, sub:e.date, level:'danger'}));
  return items.slice(-7).reverse();
}
function quickActions(){
  return `<div class="quick-actions">
    <button class="quick-action" data-open="receipt"><span>＋</span><strong>استلام سريع</strong><small>فلوس وصلت</small></button>
    <button class="quick-action" data-open="invoice"><span>▣</span><strong>فاتورة جديدة</strong><small>مستحق جديد</small></button>
    <button class="quick-action" data-open="client"><span>👤</span><strong>عميل جديد</strong><small>كود وبيانات</small></button>
    <button class="quick-action" data-open="expense"><span>↘</span><strong>مصروف</strong><small>اشتراك أو عمولة</small></button>
    <button class="quick-action" data-open="transfer"><span>⇄</span><strong>تحويل</strong><small>بين الحسابات</small></button>
    <button class="quick-action" data-open-new-month><span>📅</span><strong>فتح شهر جديد</strong><small>فاضي + ترحيل الرصيد</small></button>
  </div>`;
}
function renderDashboard(){
  const t = totals();
  const unPaid = state.invoices.filter(i=>invoiceCalc(i).remainingEgp>0).length;
  const active = state.clients.filter(c=>c.status==='نشط').length;
  const items = auditItems();
  const d = distribution();
  const latest = recentActivity();
  const accountCards = state.accounts.map(a=>accountVisualCard(a.name, t.balances[a.name]||0, t.totalMoney, d.target)).join('');
  const paidPercent = t.due ? Math.min(100, (t.paid/t.due)*100) : 0;
  return `
    <section class="hero-panel">
      <div>
        <p class="eyebrow">Abdo Finance OS • V12</p>
        <h1>كل شغلك المالي في مكان واحد</h1>
        <p>الشهر المفتوح حاليًا: <b>${activeMonth()}</b> — سجل استلام، طابقه بفواتير العملاء، وخلّي النظام يقولك تحول كام لكل حساب بنسبة 33%.</p>
        <div class="imported-data-note">تم استيراد بيانات العملاء والباقات والفواتير من ملف الإكسل الأخير</div>
        ${quickActions()}
      </div>
      <div class="hero-stat">
        <span>صافي الربح</span>
        <strong>${fmt(t.profit)}</strong>
        <small>${t.profit>=0?'الوضع موجب':'راجع المصروفات والمدفوعات'}</small>
      </div>
    </section>

    <div class="grid cards stylish-metrics">
      ${metric('إجمالي المستحق',fmt(t.due),'كل الفواتير','','₪')}
      ${metric('إجمالي المقبوض',fmt(t.paid),'من الاستلامات والمدفوعات','good','✓')}
      ${metric('إجمالي المتبقي',fmt(t.remaining),'مبالغ لسه مطلوبة', t.remaining>0?'warn':'good','!')}
      ${metric('إجمالي المال الحالي',fmt(t.totalMoney),'الأرصدة بعد الحركة','','≡')}
    </div>

    <div class="grid three account-grid" style="margin-top:16px">${accountCards}</div>

    ${monthlyPerformanceChart()}

    <div class="grid two" style="margin-top:16px">
      <div class="panel modern-panel">
        <div class="panel-head"><div><h3>متابعة الدفع</h3><p>نسبة المقبوض من إجمالي المستحق</p></div><button class="btn secondary small" data-go="invoices">الفواتير</button></div>
        <div class="payment-ring" style="--p:${paidPercent}"><div><strong>${pct(paidPercent)}</strong><span>مقبوض</span></div></div>
        <div class="mini-stats">
          <div><span>عملاء نشطين</span><strong>${active}</strong></div>
          <div><span>فواتير مفتوحة</span><strong>${unPaid}</strong></div>
          <div><span>فيديوهات الشهر</span><strong>${state.videos.filter(v=>String(v.date).startsWith(activeMonth())).length}</strong></div>
        </div>
      </div>
      <div class="panel modern-panel">
        <div class="panel-head"><div><h3>توزيع 33%</h3><p>اقتراح التحويل الحالي</p></div><button class="btn secondary small" data-go="accounts">فتح الحسابات</button></div>
        <div class="transfer-suggestion">
          <div><span>حوّل إلى فوري</span><strong>${fmt(d.toFawry)}</strong></div>
          <div><span>حوّل إلى بنك مصر</span><strong>${fmt(d.toBank)}</strong></div>
          <div><span>اترك في الكاش</span><strong>${fmt(d.keepVodafone)}</strong></div>
        </div>
        <div class="warning-box soft">${d.toFawry===0 && d.toBank===0 ? 'التوزيع متوازن حاليًا، لا يوجد تحويل مطلوب.' : 'نفذ التحويلات المقترحة ثم سجلها في صفحة التحويلات.'}</div>
      </div>
    </div>

    <div class="grid two" style="margin-top:16px">
      <div class="panel modern-panel">
        <div class="panel-head"><div><h3>آخر الحركات</h3><p>ملخص سريع لآخر نشاط</p></div></div>
        ${latest.length?`<div class="activity-list">${latest.map(x=>`<div class="activity-item ${x.level}"><span>${x.type}</span><div><strong>${escapeHtml(x.title)}</strong><small>${escapeHtml(x.sub)}</small></div></div>`).join('')}</div>`:'<div class="empty">لا توجد حركات حتى الآن</div>'}
      </div>
      <div class="panel modern-panel">
        <div class="panel-head"><div><h3>تنبيهات تحتاج عينك</h3><p>أهم مشاكل أو احتمالات لخبطة</p></div><button class="btn secondary small" data-go="audit">عرض الفحص</button></div>
        ${items.length?`<ul class="info-list premium-alerts">${items.slice(0,6).map(i=>`<li>${statusBadge(i.level==='danger'?'متأخر':'يحتاج مراجعة')} ${escapeHtml(i.message)}</li>`).join('')}</ul>`:'<div class="success-box">كل شيء واضح حاليًا، مفيش مشاكل مهمة.</div>'}
      </div>
    </div>
  `;
}

function table(headers, rows, min='980px'){
  if(!rows.length) return '<div class="empty">لا توجد بيانات حتى الآن</div>';
  const cellClass = (i)=> headers[i] === 'إجراءات' ? ' class="sticky-actions"' : '';
  return `<div class="table-shell"><div class="table-tools"><input class="table-search" type="search" placeholder="بحث سريع داخل الجدول..." data-table-search><span>${rows.length} سجل</span></div><div class="table-wrap"><table style="min-width:${min}"><thead><tr>${headers.map((h,i)=>`<th${cellClass(i)}>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td${cellClass(i)}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
}
function actionBtns(type,id){
  const safeType = escapeHtml(type);
  const safeId = escapeHtml(id);
  return `<div class="row-actions"><button class="btn ghost small" data-edit="${safeType}" data-id="${safeId}">تعديل</button><button class="btn danger small" data-delete="${safeType}" data-id="${safeId}">حذف</button></div>`;
}
function invoiceActionBtns(inv){
  return `<div class="row-actions"><button class="btn ghost small" data-edit="invoices" data-id="${escapeHtml(inv.id)}">تعديل</button><button class="btn secondary small" data-receipt-invoice="${escapeHtml(inv.id)}">استلام</button><button class="btn ghost small" data-print-invoice="${escapeHtml(inv.id)}">طباعة</button><button class="btn danger small" data-delete="invoices" data-id="${escapeHtml(inv.id)}">حذف</button></div>`;
}
function printInvoiceById(invoiceId){
  localStorage.setItem('selectedInvoice', invoiceId);
  currentView = 'printInvoice';
  render();
}
function openReceiptForInvoice(invoiceId){
  const inv = invoiceById(invoiceId);
  if(!inv){ toast('الفاتورة غير موجودة'); return; }
  const c = invoiceCalc(inv);
  const rate = rateFor(inv.currency, inv.rate);
  const remainingNative = inv.currency === 'EGP' ? c.remainingEgp : (c.remainingEgp / rate);
  openForm('receipt','',{
    date: defaultRecordDate(),
    amount: Math.max(0, Math.round(remainingNative * 100) / 100),
    currency: inv.currency,
    rate,
    account: 'Vodafone Cash',
    manualClientCode: inv.clientCode,
    manualInvoiceId: inv.id,
    converted: 'لا',
    notes: `استلام على فاتورة ${inv.id}`
  });
}
function renderClients(){
  const rows = state.clients.map(c=>[c.code,c.name,c.country,c.contactMethod||'-',c.contact||'-',packageName(c.packageCode)||'-',c.type,statusBadge(c.status),c.notes||'-',c.date||'-',actionBtns('clients',c.code)]);
  return panel('العملاء','أضف عميل مرة واحدة فقط، وكل الفواتير والفيديوهات ترتبط بنفس الكود','+ عميل جديد','client', table(['كود العميل','اسم العميل','الدولة','طريقة التواصل','رقم/يوزر','الباقة','نوع العميل','الحالة','ملاحظات','تاريخ الإضافة','إجراءات'], rows));
}
function renderPackages(){
  const rows = state.packages.map(p=>[p.code,p.name,p.currency,fmt(p.price,p.currency),fmt(p.priceEgp,'EGP'),p.duration,p.videos,p.unitPrice||'-',p.terms,p.notes||'-',actionBtns('packages',p.code)]);
  return panel('الباقات والتسعير','كل أسعارك وباقاتك في مكان واحد','+ باقة','package', table(['كود الباقة','اسم الباقة','العملة','السعر','السعر بالجنيه','المدة','عدد الفيديوهات','سعر الفيديو','طريقة الدفع','ملاحظات','إجراءات'], rows));
}
function renderVideos(){
  const rows = state.videos.map(v=>[v.id,v.date,v.clientCode,clientName(v.clientCode),v.type,v.duration,fmt(v.price,v.currency),fmt(egp(v.price,v.currency,v.rate),'EGP'),statusBadge(v.status),statusBadge(v.count),v.invoiceId||'-',v.notes||'-',actionBtns('videos',v.id)]);
  return panel('الفيديوهات','سجل الشغل، والتسليم، وربطه بالفاتورة','+ فيديو','video', table(['رقم الفيديو','التاريخ','كود العميل','اسم العميل','نوع الفيديو','المدة','السعر','السعر بالجنيه','حالة التسليم','يُحتسب؟','رقم الفاتورة','ملاحظات','إجراءات'], rows,'1120px'));
}
function renderInvoices(){
  const rows = state.invoices.map(inv=>{
    const c = invoiceCalc(inv);
    return [inv.id, inv.date, inv.month, inv.clientCode, clientName(inv.clientCode), inv.type, inv.desc, fmt(inv.amount,inv.currency), fmt(c.dueEgp), fmt(c.manual), fmt(c.receipts), fmt(c.paid), fmt(c.remainingEgp), statusBadge(c.status), inv.dueDate||'-', inv.notes||'-', invoiceActionBtns(inv)];
  });
  return panel('فواتير الشهر','تتحدث تلقائيًا من الاستلامات السريعة والمدفوعات اليدوية — زر الإجراءات ثابت على يمين الجدول للتعديل والاستلام والطباعة','+ فاتورة','invoice', table(['رقم الفاتورة','التاريخ','الشهر','كود العميل','اسم العميل','نوع الفاتورة','الوصف','المستحق','المستحق بالجنيه','مدفوع يدوي','مدفوع استلامات','إجمالي المدفوع','المتبقي','الحالة','تاريخ الاستحقاق','ملاحظات','إجراءات'], rows,'1500px'));
}
function renderReceipts(){
  const rows = state.receipts.map(r=>{
    const m = receiptMatch(r);
    return [r.id,r.date,fmt(r.amount,r.currency),fmt(egp(r.amount,r.currency,r.rate),'EGP'),r.account,r.txId||'-',clientName(m.clientCode)||'-',m.invoiceId||'-',m.score,statusBadge(m.status),r.manualClientCode||'-',r.manualInvoiceId||'-',clientName(m.finalClientCode)||'-',m.finalInvoiceId||'-',statusBadge(r.converted),r.notes||'-',actionBtns('receipts',r.id)];
  });
  return panel('استلامات سريعة','اكتب المبلغ والعملة، والنظام يحاول يطابق الفاتورة تلقائيًا','+ استلام','receipt', table(['رقم الاستلام','التاريخ','المبلغ','بالجنيه','مكان الاستلام','Transaction ID','العميل المتوقع','الفاتورة المتوقعة','درجة المطابقة','حالة المطابقة','كود يدوي','فاتورة يدوية','العميل النهائي','الفاتورة النهائية','تم التحويل؟','ملاحظات','إجراءات'], rows,'1500px'));
}
function renderManualPayments(){
  const rows = state.manualPayments.map(p=>[p.id,p.date,p.clientCode,clientName(p.clientCode),p.invoiceId,fmt(p.amount,p.currency),fmt(egp(p.amount,p.currency,p.rate),'EGP'),p.account,p.method,p.notes||'-',duplicatePaymentWarning(p.invoiceId),actionBtns('manualPayments',p.id)]);
  return panel('مدفوعات يدوية','استخدمها للحالات الاستثنائية فقط حتى لا يتكرر الدفع','+ دفع يدوي','manualPayment', table(['رقم الدفع','التاريخ','كود العميل','اسم العميل','رقم الفاتورة','المبلغ','بالجنيه','الحساب','طريقة الدفع','ملاحظات','تحذير','إجراءات'], rows,'1200px'));
}
function duplicatePaymentWarning(invoiceId){ return paidFromManual(invoiceId)>0 && paidFromReceipts(invoiceId)>0 ? statusBadge('يحتاج مراجعة') + ' ممكن تكون الدفعة محسوبة مرتين' : '-'; }
function renderExpenses(){
  const rows = state.expenses.map(e=>[e.id,e.date,e.type,e.desc,fmt(e.amount),e.account,statusBadge(e.deduct),e.notes||'-',actionBtns('expenses',e.id)]);
  return panel('المصروفات','أي اشتراك أو إعلان أو أداة AI سجلها هنا','+ مصروف','expense', table(['رقم المصروف','التاريخ','النوع','الوصف','المبلغ','الحساب','يُخصم من الربح؟','ملاحظات','إجراءات'], rows));
}
function renderAccounts(){
  const t = totals(); const d = distribution();
  const visualCards = state.accounts.map(a=>accountVisualCard(a.name, t.balances[a.name]||0, t.totalMoney, d.target)).join('');
  const rows = state.accounts.map(a=>{
    const bal = t.balances[a.name] || 0;
    return [a.name,fmt(a.opening),fmt(bal),pct(t.totalMoney?bal/t.totalMoney*100:0),pct(a.target),fmt(bal-d.target), `<div class="progress"><span style="width:${Math.min(100,Math.max(0,t.totalMoney?bal/t.totalMoney*100:0))}%"></span></div>`, `<button class="btn ghost small" data-edit-opening="${escapeHtml(a.name)}">تعديل الافتتاحي</button>`];
  });
  return `
    <div class="accounts-hero">
      <div>
        <p class="eyebrow">Money Distribution</p>
        <h2>الحسابات وتوزيع 33%</h2>
        <p>النظام يحسب الرصيد الافتتاحي + المقبوض + المصروفات + التحويلات، وبعدها يقترح تحوّل كام عشان كل حساب يقرب من 33.33%.</p>
      </div>
      <div class="actions"><button class="btn ghost" data-edit-opening>تعديل الرصيد الافتتاحي</button><button class="btn primary" data-open="transfer">+ سجل تحويل</button></div>
    </div>
    <div class="grid three account-grid" style="margin-top:16px">${visualCards}</div>
    <div class="grid cards" style="margin-top:16px">
      ${metric('إجمالي المال الحالي',fmt(t.totalMoney),'الأرصدة بعد كل الحركة','','≡')}
      ${metric('الهدف لكل حساب',fmt(d.target),'33.33% تقريبًا','','◎')}
      ${metric('حوّل إلى فيزا فوري',fmt(d.toFawry),'اقتراح من Vodafone Cash', d.toFawry>0?'warn':'good','⇢')}
      ${metric('حوّل إلى فيزا بنك مصر',fmt(d.toBank),'اقتراح من Vodafone Cash', d.toBank>0?'warn':'good','⇢')}
    </div>
    <div class="panel modern-panel" style="margin-top:16px">
      <div class="panel-head"><div><h3>خطة التحويل المقترحة</h3><p>أرقام عملية قريبة لأقرب جنيه</p></div></div>
      <div class="transfer-plan">
        <div><span>1</span><strong>حوّل إلى فيزا فوري</strong><b>${fmt(d.toFawry)}</b></div>
        <div><span>2</span><strong>حوّل إلى فيزا بنك مصر</strong><b>${fmt(d.toBank)}</b></div>
        <div><span>3</span><strong>اترك في Vodafone Cash</strong><b>${fmt(d.keepVodafone)}</b></div>
      </div>
      <div class="warning-box soft" style="margin-top:14px">${d.toFawry===0 && d.toBank===0 ? 'لا يوجد تحويل مطلوب حاليًا.' : 'بعد تنفيذ التحويل فعليًا، سجله من زر + سجل تحويل عشان الرصيد يتحدث.'}</div>
    </div>
    <div class="panel" style="margin-top:16px">
      <div class="panel-head"><div><h3>جدول الحسابات التفصيلي</h3><p>الأرقام الخام لكل حساب</p></div></div>
      ${table(['الحساب','الرصيد الافتتاحي','الرصيد الحالي','النسبة الحالية','النسبة المستهدفة','الفرق عن الهدف','مؤشر','إجراءات'], rows)}
    </div>
  `;
}
function renderTransfers(){
  const rows = state.transfers.map(t=>[t.id,t.date,t.from,t.to,fmt(t.amount),t.reason,statusBadge(t.executed),t.notes||'-',actionBtns('transfers',t.id)]);
  return panel('التحويلات بين الحسابات','سجل أي تحويل تنفذه فعليًا عشان الأرصدة تتحدث','+ تحويل','transfer', table(['رقم التحويل','التاريخ','من حساب','إلى حساب','المبلغ','سبب التحويل','تم التنفيذ؟','ملاحظات','إجراءات'], rows));
}
function renderMonthClose(){
  const months = allKnownMonths().slice().reverse();
  const active = activeMonth();
  const activeSummary = workspaceSummary(active) || currentMonthSummary(active);
  const activeIsClosed = activeSummary.closed === 'نعم';
  const rows = months.map(m=>{
    const sm = workspaceSummary(m) || (state.monthClose || []).find(x=>x.month===m) || {due:0,paid:0,remaining:0,expenses:0,profit:0,videos:0,clients:0,closed:'لا',notes:'-'};
    const isActive = m === active;
    const stateLabel = isActive ? statusBadge(activeIsClosed ? 'مغلق' : 'مفتوح') : statusBadge(sm.closed === 'نعم' ? 'محفوظ' : 'قابل للتعديل');
    const actions = [
      isActive ? `<span class="badge good">الشهر الحالي</span>` : `<button class="btn primary small" data-switch-month="${m}">فتح / تعديل</button>`,
      isActive && !activeIsClosed ? `<button class="btn danger small" data-close-current-month>إقفال الشهر</button>` : '',
      isActive && activeIsClosed ? `<button class="btn secondary small" data-reopen-current-month>إعادة فتح</button>` : '',
      `<button class="btn ghost small" data-edit="monthClose" data-id="${m}">ملخص</button>`
    ].filter(Boolean).join(' ');
    return [
      m,
      stateLabel,
      fmt(sm.due),
      fmt(sm.paid),
      fmt(sm.remaining),
      fmt(sm.expenses),
      fmt(sm.profit),
      sm.videos,
      sm.clients,
      escapeHtml(sm.notes || '-'),
      actions
    ];
  });
  return `
    <div class="month-hero month-control-hero">
      <div>
        <p class="eyebrow">Months Control Dashboard</p>
        <h2>داشبورد التحكم في الشهور</h2>
        <p>من هنا تفتح شهر جديد، تقفل الشهر الحالي بعد ما تخلصه، أو ترجع لأي شهر قديم. بمجرد فتح شهر، كل العملاء والفواتير والإحصائيات والحسابات بتبقى خاصة بالشهر المختار فقط.</p>
      </div>
      <div class="actions">
        <button class="btn ghost" data-edit-opening>تعديل الرصيد الافتتاحي</button>
        ${activeIsClosed ? `<button class="btn secondary" data-reopen-current-month>إعادة فتح الشهر</button>` : `<button class="btn danger" data-close-current-month>إقفال الشهر الحالي</button>`}
        <button class="btn primary" data-open-new-month>+ فتح شهر جديد</button>
      </div>
    </div>
    <div class="grid cards" style="margin-bottom:16px">
      ${metric('الشهر المتحكم فيه الآن', active, activeIsClosed ? 'مغلق ومحفوظ — يمكنك إعادة فتحه' : 'مفتوح للتعديل والإضافة', activeIsClosed?'warn':'good', '📅')}
      ${metric('عدد الشهور', months.length, 'كل شهر Workspace مستقل', '', '◎')}
      ${metric('رصيد افتتاحي', fmt((state.accounts||[]).reduce((s,a)=>s+num(a.opening),0)), 'يمكن تعديله من زر الرصيد الافتتاحي', '', '↺')}
      ${metric('الرصيد الحالي', fmt(totals().totalMoney), 'بعد المقبوض والمصروفات والتحويلات', 'good', '⇢')}
    </div>
    <div class="grid two" style="margin-bottom:16px">
      <div class="panel month-tools-panel">
        <div class="panel-head"><div><h3>إجراءات الشهر الحالي</h3><p>الشهر المفتوح: ${active}</p></div></div>
        <div class="month-preview">
          <div><span>الحالة</span><strong>${activeIsClosed ? 'مغلق / محفوظ' : 'مفتوح للتعديل'}</strong></div>
          <div><span>المقبوض</span><strong>${fmt(activeSummary.paid)}</strong></div>
          <div><span>المتبقي</span><strong>${fmt(activeSummary.remaining)}</strong></div>
          <div><span>صافي الربح</span><strong>${fmt(activeSummary.profit)}</strong></div>
        </div>
        <div class="actions" style="margin-top:12px">
          ${activeIsClosed ? `<button class="btn secondary" data-reopen-current-month>إعادة فتح الشهر للتعديل</button>` : `<button class="btn danger" data-close-current-month>إقفال الشهر خلاص</button>`}
          <button class="btn ghost" data-edit-opening>تعديل الرصيد الافتتاحي</button>
        </div>
      </div>
      <div class="panel month-tools-panel">
        <div class="panel-head"><div><h3>فتح شهر جديد</h3><p>الشهر الجديد سيصبح هو الشهر الحالي تلقائيًا</p></div></div>
        <div class="month-preview">
          <div><span>الشهر الحالي</span><strong>${active}</strong></div>
          <div><span>الشهر المقترح</span><strong>${nextMonthValue(active)}</strong></div>
          <div><span>الرصيد الممكن ترحيله</span><strong>${fmt(totals().totalMoney)}</strong></div>
        </div>
        <div class="actions" style="margin-top:12px"><button class="btn primary" data-open-new-month>+ فتح شهر جديد</button></div>
      </div>
    </div>
    <div class="panel">
      <div class="panel-head"><div><h3>كل الشهور</h3><p>اضغط فتح / تعديل لأي شهر قديم عشان النظام كله يرجع عليه، ولو فتحت شهر جديد النظام ينتقل له تلقائيًا.</p></div></div>
      ${table(['الشهر','الحالة','المستحق','المقبوض','المتبقي','المصروفات','صافي الربح','الفيديوهات','العملاء','ملاحظات','إجراءات'], rows,'1400px')}
    </div>
  `;
}

function renderAudit(){
  const items = auditItems();
  const rows = items.map((i,idx)=>[
    statusBadge(i.level==='danger'?'متأخر':'يحتاج مراجعة'),
    i.type,
    `<div class="audit-problem"><strong>${escapeHtml(i.message)}</strong><small>${escapeHtml(i.fix || 'راجع البيانات المرتبطة بهذا السجل.')}</small></div>`,
    `<button class="btn primary small" data-audit-go="${idx}">افتح مكان الخطأ</button>`
  ]);
  const severe = items.filter(i=>i.level==='danger').length;
  const warn = items.length - severe;
  return `
    <div class="audit-hero">
      <div>
        <p class="eyebrow">Smart Audit</p>
        <h2>فحص الأخطاء الذكي</h2>
        <p>اضغط على أي مشكلة، والنظام هيوديك للصفحة اللي فيها الخطأ ويقولك تعمل إيه بالظبط عشان تصلحه.</p>
      </div>
      <div class="audit-score">
        <span>إجمالي التنبيهات</span>
        <strong>${items.length}</strong>
        <small>${severe} خطير • ${warn} يحتاج مراجعة</small>
      </div>
    </div>
    <div class="grid cards" style="margin-bottom:16px">
      ${metric('أخطاء مهمة', severe, 'اضغط وافتح مكان الخطأ', severe?'danger':'good','!')}
      ${metric('تحتاج مراجعة', warn, 'تنبيهات غير عاجلة', warn?'warn':'good','؟')}
      ${metric('طريقة الحل', 'Click', 'كل صف فيه زر فتح مكان الخطأ', '', '↗')}
    </div>
    <div class="panel">
      <div class="panel-head"><div><h3>قائمة الأخطاء</h3><p>كل تحذير فيه مكانه وطريقة إصلاحه</p></div></div>
      ${items.length?table(['المستوى','النوع','المشكلة + الحل المقترح','انتقال'],rows,'980px'):'<div class="success-box">ممتاز، مفيش أخطاء واضحة.</div>'}
    </div>`;
}

function renderPrintInvoice(){
  const selected = localStorage.getItem('selectedInvoice') || state.invoices[0]?.id || '';
  const inv = invoiceById(selected);
  return `
    <div class="panel no-print"><div class="panel-head"><div><h3>اختيار الفاتورة</h3><p>اختر رقم فاتورة وبعدها اطبع PDF أو عدّلها مباشرة</p></div><div class="actions">${inv ? `<button class="btn ghost" data-edit="invoices" data-id="${escapeHtml(inv.id)}">تعديل الفاتورة</button>` : ''}<button class="btn primary" onclick="window.print()">طباعة / PDF</button></div></div>
      <div class="form-grid"><div class="field"><label>رقم الفاتورة</label><select id="invoicePrintSelect">${state.invoices.map(i=>`<option value="${i.id}" ${i.id===selected?'selected':''}>${i.id} — ${clientName(i.clientCode)}</option>`).join('')}</select></div></div>
    </div>
    <div class="panel printable-panel" style="margin-top:16px"><div class="print-page">${inv?invoiceHtml(inv):'<div class="danger-box">اختر رقم فاتورة صحيح</div>'}</div></div>
  `;
}
function invoiceHtml(inv){
  const c = invoiceCalc(inv);
  return `
    <div class="invoice-modern">
      <div class="invoice-watermark">INVOICE</div>
      <div class="invoice-hero">
        <div>
          <span class="invoice-kicker">فاتورة خدمات فيديو</span>
          <h1 class="invoice-title">فاتورة</h1>
          <p>${state.settings.providerName}</p>
        </div>
        <div class="invoice-number">
          <span>رقم الفاتورة</span>
          <strong>${inv.id}</strong>
          <small>${inv.date}</small>
        </div>
      </div>
      <div class="invoice-box modern">
        <div><span>العميل</span><strong>${clientName(inv.clientCode)}</strong></div>
        <div><span>كود العميل</span><strong>${inv.clientCode}</strong></div>
        <div><span>حالة الدفع</span><strong>${statusBadge(c.status)}</strong></div>
        <div><span>تاريخ الاستحقاق</span><strong>${inv.dueDate || 'غير محدد'}</strong></div>
      </div>
      <div class="invoice-service-card">
        <table style="min-width:100%"><thead><tr><th>الوصف</th><th>المستحق</th><th>المدفوع</th><th>المتبقي</th></tr></thead><tbody><tr><td>${escapeHtml(inv.desc)}</td><td>${fmt(c.dueEgp)}</td><td>${fmt(c.paid)}</td><td>${fmt(c.remainingEgp)}</td></tr></tbody></table>
      </div>
      <div class="invoice-total-row">
        <div><span>المستحق</span><strong>${fmt(c.dueEgp)}</strong></div>
        <div><span>المدفوع</span><strong>${fmt(c.paid)}</strong></div>
        <div class="highlight"><span>المتبقي</span><strong>${fmt(c.remainingEgp)}</strong></div>
      </div>
      <div class="invoice-notes">
        <div><span>ملاحظات</span><p>${escapeHtml(inv.notes || '-')}</p></div>
        <div><span>التوقيع</span><p>${state.settings.providerName}</p></div>
      </div>
      <p class="invoice-thanks">شكرًا لتعاملك معنا — نتمنى لك يومًا رائعًا ❤️</p>
    </div>
  `;
}
function renderSettings(){
  return `
    <div class="grid two">
      <div class="panel month-tools-panel"><div class="panel-head"><div><h3>فتح شهر جديد</h3><p>يفتح شهر فاضي ويُبقي الباقات والأسعار والحسابات الثابتة</p></div></div>
        <div class="month-preview">
          <div><span>الشهر المفتوح</span><strong>${activeMonth()}</strong></div>
          <div><span>الشهر القادم المقترح</span><strong>${nextMonthValue(activeMonth())}</strong></div>
          <div><span>الرصيد الذي يمكن ترحيله</span><strong>${fmt(totals().totalMoney)}</strong></div>
        </div>
        <div class="actions"><button class="btn ghost" data-edit-opening>تعديل الرصيد الافتتاحي</button><button class="btn primary" data-open-new-month>+ فتح شهر جديد</button></div>
      </div>
      <div class="panel cloud-panel"><div class="panel-head"><div><h3>المزامنة السحابية</h3><p>GitHub Pages + Supabase</p></div></div>
        <div class="cloud-status">
          <div><span>الحالة</span><strong>مزامنة تلقائية بدون تسجيل دخول</strong></div>
          <div><span>المساحة</span><strong>Shared Cloud Sync</strong></div>
        </div>
        <div class="actions"><button class="btn primary" id="cloudSaveBtn">حفظ الآن على السحابة</button><button class="btn ghost" id="cloudLoadBtn">تحميل من السحابة</button></div>
        <div class="warning-box soft" style="margin-top:12px">تنبيه: المزامنة بدون تسجيل دخول، لذلك لا تشارك رابط الموقع إلا مع نفسك فقط.</div>
      </div>
      <div class="panel"><div class="panel-head"><div><h3>إدارة الشهور</h3><p>فتح شهر قديم أو الرجوع للشهر الحالي</p></div></div>
        <div class="form-grid"><div class="field"><label>اختر شهر</label><select id="settingsMonthSelect">${allKnownMonths().slice().reverse().map(m=>`<option value="${m}" ${m===activeMonth()?'selected':''}>${m}</option>`).join('')}</select></div></div>
        <div class="actions" style="margin-top:12px"><button class="btn primary" id="settingsOpenMonthBtn">فتح الشهر المختار</button><button class="btn ghost" data-go="monthClose">عرض كل الشهور</button></div>
      </div>
      <div class="panel"><div class="panel-head"><div><h3>نسخ احتياطي</h3><p>احفظ بياناتك أو انقلها لجهاز تاني</p></div></div>
        <div class="actions"><button class="btn primary" id="exportBtn">تحميل نسخة JSON</button><label class="btn ghost">استيراد JSON<input type="file" id="importFile" accept="application/json" hidden></label><button class="btn danger" id="resetBtn">رجوع للبيانات الافتراضية</button></div>
      </div>
      <div class="panel"><div class="panel-head"><div><h3>أسعار الصرف</h3><p>تعديل سريع للعملات</p></div></div>
        <div class="form-grid">${lists.currencies.map(cur=>`<div class="field"><label>${cur}</label><input type="number" step="0.0001" data-rate="${cur}" value="${state.settings.exchangeRates[cur]||1}"></div>`).join('')}</div>
        <div class="form-actions"><button class="btn primary" id="saveRatesBtn">حفظ الأسعار</button></div>
      </div>
    </div>
    <div class="panel" style="margin-top:16px"><div class="panel-head"><div><h3>فكرة التشغيل</h3><p>امشي على الترتيب ده</p></div></div>
      <ol class="info-list"><li>ضيف العميل مرة واحدة من صفحة العملاء.</li><li>سجل فاتورة أو فيديو.</li><li>لما فلوس توصلك استخدم استلامات سريعة.</li><li>لو المطابقة غلط اختار الفاتورة يدويًا.</li><li>راجع توزيع 33% ونفذ التحويلات.</li><li>في آخر الشهر راجع لوحة التحكم وإغلاق الشهر.</li></ol>
    </div>
  `;
}
function panel(title,desc,btnText,openType,body){
  return `<div class="panel"><div class="panel-head"><div><h3>${title}</h3><p>${desc}</p></div><button class="btn primary" data-open="${openType}">${btnText}</button></div>${body}</div>`;
}

function currentMonthSummary(month=activeMonth(), options={}){
  const t = totals();
  return {
    month,
    due: t.due,
    paid: t.paid,
    remaining: t.remaining,
    expenses: t.expenses,
    profit: t.profit,
    videos: state.videos.length,
    clients: state.clients.length,
    closed: options.closed || 'لا',
    notes: options.notes || `ملخص تلقائي لشهر ${month}`
  };
}
function upsertMonthClose(summary){
  const idx = state.monthClose.findIndex(m=>m.month === summary.month);
  if(idx >= 0) state.monthClose[idx] = {...state.monthClose[idx], ...summary};
  else state.monthClose.push(summary);
}
function upsertGoalActuals(summary){
  const idx = state.goals.findIndex(g=>g.month === summary.month);
  const base = idx >= 0 ? state.goals[idx] : {month:summary.month,revenueTarget:0,profitTarget:0};
  const revenueTarget = num(base.revenueTarget);
  const profitTarget = num(base.profitTarget);
  const updated = {
    ...base,
    actualRevenue: summary.paid,
    actualProfit: summary.profit,
    revenueRate: revenueTarget ? summary.paid / revenueTarget : 0,
    profitRate: profitTarget ? summary.profit / profitTarget : 0,
    indicator: revenueTarget && summary.paid >= revenueTarget ? '▲ محقق' : '▼ بعيد'
  };
  if(idx >= 0) state.goals[idx] = updated;
  else state.goals.push(updated);
}
function ensureGoalMonth(month){
  if(!state.goals.some(g=>g.month === month)){
    state.goals.push({month,revenueTarget:0,profitTarget:0,actualRevenue:0,actualProfit:0,revenueRate:0,profitRate:0,indicator:'▼ بعيد'});
  }
}
function buildMonthArchive(month, summary){
  return {
    month,
    archivedAt: new Date().toISOString(),
    summary: copyData(summary),
    data: {
      clients: copyData(state.clients),
      videos: copyData(state.videos),
      invoices: copyData(state.invoices),
      receipts: copyData(state.receipts),
      manualPayments: copyData(state.manualPayments),
      expenses: copyData(state.expenses),
      transfers: copyData(state.transfers),
      accounts: copyData(state.accounts)
    }
  };
}
function openNewMonthModal(){
  const oldMonth = activeMonth();
  const suggested = nextMonthValue(oldMonth);
  byId('modalTitle').textContent = 'فتح شهر جديد';
  byId('modalBody').innerHTML = `
    <div class="new-month-box">
      <div class="warning-box soft">
        سيتم حفظ ملخص وأرشيف للشهر الحالي (${oldMonth})، ثم فتح شهر جديد فاضي. الباقات، أسعار الصرف، وأسماء الحسابات ستظل كما هي.
      </div>
      <div class="form-grid" style="margin-top:14px">
        <div class="field"><label>الشهر الجديد</label><input type="month" id="newMonthInput" value="${suggested}"></div>
        <label class="check-line"><input type="checkbox" id="carryBalancesCheck" checked> ترحيل أرصدة الحسابات الحالية كرصيد افتتاحي للشهر الجديد</label>
        <label class="check-line"><input type="checkbox" id="keepClientsCheck"> الاحتفاظ بالعملاء بدل تصفيرهم</label>
      </div>
      <div class="month-preview">
        <div><span>سيتم تصفير</span><strong>العملاء، الفيديوهات، الفواتير، الاستلامات، المدفوعات، المصروفات، التحويلات</strong></div>
        <div><span>سيظل ثابت</span><strong>الباقات، أسعار الصرف، إعدادات الاستوديو، الحسابات</strong></div>
        <div><span>الرصيد المرحّل</span><strong>${fmt(totals().totalMoney)}</strong></div>
      </div>
      <div class="form-actions">
        <button class="btn ghost" id="cancelForm">إلغاء</button>
        <button class="btn primary" id="confirmNewMonthBtn">افتح الشهر الجديد</button>
      </div>
    </div>`;
  byId('modal').classList.remove('hidden');
  byId('cancelForm').addEventListener('click', closeModal);
  byId('confirmNewMonthBtn').addEventListener('click', ()=>{
    const newMonth = byId('newMonthInput').value;
    const carryBalances = byId('carryBalancesCheck').checked;
    const keepClients = byId('keepClientsCheck').checked;
    if(!newMonth){ toast('اختار الشهر الجديد'); return; }
    if(newMonth === oldMonth){ toast('اختار شهر مختلف عن الشهر الحالي'); return; }
    const msg = keepClients
      ? `سيتم فتح ${newMonth} مع الاحتفاظ بالعملاء وتصفير الحركات. متأكد؟`
      : `سيتم فتح ${newMonth} فاضي بدون عملاء ولا فواتير ولا حركات. متأكد؟`;
    if(!confirm(msg)) return;
    openNewMonth(newMonth, {carryBalances, keepClients});
  });
}
function openNewMonth(newMonth, options={}){
  ensureStateShape();
  const oldMonth = activeMonth();
  if(state.monthWorkspaces?.[newMonth]){
    if(confirm(`شهر ${newMonth} موجود قبل كده. تحب تفتحه للتصفح والتعديل بدل إنشاء شهر جديد؟`)){
      switchMonth(newMonth);
    }
    return;
  }

  syncCurrentWorkspace();
  const summary = currentMonthSummary(oldMonth, { closed:'نعم', notes:`إغلاق تلقائي قبل فتح شهر ${newMonth}` });
  state.monthWorkspaces[oldMonth] = {
    ...(state.monthWorkspaces[oldMonth] || {}),
    month: oldMonth,
    updatedAt: new Date().toISOString(),
    summary,
    data: getCurrentMonthData()
  };
  upsertMonthClose(summary);
  upsertGoalActuals(summary);
  upsertMonthArchive(buildMonthArchive(oldMonth, summary));

  const balances = accountBalances();
  const carryBalances = options.carryBalances !== false;
  const keepClients = options.keepClients === true;

  const newMonthData = {
    clients: keepClients ? copyData(state.clients).map(c=>({...c, date: monthStart(newMonth), status: c.status || 'نشط'})) : [],
    videos: [],
    invoices: [],
    receipts: [],
    manualPayments: [],
    expenses: [],
    transfers: [],
    accounts: copyData(state.accounts).map(a=>({...a, opening: carryBalances ? num(balances[a.name]) : 0}))
  };

  state.monthWorkspaces[newMonth] = {
    month: newMonth,
    updatedAt: new Date().toISOString(),
    summary: { month:newMonth, due:0, paid:0, remaining:0, expenses:0, profit:0, videos:0, clients:newMonthData.clients.length, closed:'لا', notes:'شهر جديد مفتوح' },
    data: newMonthData
  };
  state.settings.currentMonth = newMonth;
  setCurrentMonthData(newMonthData);
  ensureGoalMonth(newMonth);

  saveState();
  closeModal();
  currentView = 'dashboard';
  render();
  toast(`تم فتح شهر ${newMonth} بنجاح`);
}


function setCurrentMonthClosed(closedValue){
  ensureStateShape();
  const month = activeMonth();
  const isClosing = closedValue === 'نعم';
  if(isClosing && !confirm(`تأكيد إقفال شهر ${month}؟ ستظل قادرًا على فتحه لاحقًا للتصفح أو التعديل.`)) return;
  const summary = currentMonthSummary(month, {
    closed: closedValue,
    notes: isClosing ? `تم إقفال شهر ${month}` : `تمت إعادة فتح شهر ${month} للتعديل`
  });
  state.monthWorkspaces[month] = {
    ...(state.monthWorkspaces[month] || {}),
    month,
    updatedAt: new Date().toISOString(),
    summary,
    data: getCurrentMonthData()
  };
  upsertMonthClose(summary);
  upsertGoalActuals(summary);
  saveState();
  render();
  toast(isClosing ? `تم إقفال شهر ${month}` : `تمت إعادة فتح شهر ${month}`);
}
function closeCurrentMonth(){ setCurrentMonthClosed('نعم'); }
function reopenCurrentMonth(){ setCurrentMonthClosed('لا'); }

function openOpeningBalancesModal(accountName=''){
  ensureStateShape();
  const selected = String(accountName || '');
  const accounts = selected ? state.accounts.filter(a=>a.name === selected) : state.accounts;
  if(!accounts.length){ toast('لا توجد حسابات لتعديل رصيدها'); return; }
  byId('modalTitle').textContent = selected ? `تعديل رصيد ${selected}` : 'تعديل الأرصدة الافتتاحية';
  byId('modalBody').innerHTML = `
    <div class="opening-balance-box">
      <div class="warning-box soft">
        الرصيد الافتتاحي يخص الشهر المفتوح الآن (${activeMonth()}). تعديله يغير حسابات هذا الشهر فقط ولا يغير باقي الشهور.
      </div>
      <div class="form-grid" style="margin-top:14px">
        ${accounts.map((a,idx)=>`<div class="field"><label>${escapeHtml(a.name)}</label><input type="number" step="0.01" data-opening-account="${escapeHtml(a.name)}" value="${num(a.opening)}"></div>`).join('')}
      </div>
      <div class="form-actions">
        <button class="btn ghost" id="cancelForm">إلغاء</button>
        <button class="btn primary" id="saveOpeningBalancesBtn">حفظ الرصيد الافتتاحي</button>
      </div>
    </div>`;
  byId('modal').classList.remove('hidden');
  byId('cancelForm').addEventListener('click', closeModal);
  byId('saveOpeningBalancesBtn').addEventListener('click', ()=>{
    document.querySelectorAll('[data-opening-account]').forEach(input=>{
      const acc = state.accounts.find(a=>a.name === input.dataset.openingAccount);
      if(acc) acc.opening = num(input.value);
    });
    saveState();
    closeModal();
    render();
    toast('تم تحديث الرصيد الافتتاحي للشهر الحالي');
  });
}

function goToAuditItem(index){
  const item = auditItems()[Number(index)];
  if(!item) return;
  sessionStorage.setItem('auditFocus', JSON.stringify(item));
  currentView = item.view || 'audit';
  render();
  toast('تم فتح مكان المشكلة');
}
function applyAuditFocus(){
  let item = null;
  try{ item = JSON.parse(sessionStorage.getItem('auditFocus') || 'null'); }catch(e){ item = null; }
  if(!item || item.view !== currentView) return;
  const app = byId('app');
  if(!app) return;
  const banner = document.createElement('div');
  banner.className = `audit-focus-banner ${item.level === 'danger' ? 'danger' : 'warn'}`;
  banner.innerHTML = `
    <div>
      <span>${item.type}</span>
      <h3>${escapeHtml(item.message)}</h3>
      <p>${escapeHtml(item.fix || 'راجع هذا السجل وعدّل البيانات الناقصة.')}</p>
    </div>
    <div class="audit-focus-actions">
      ${item.targetType && item.targetId ? `<button class="btn primary small" data-audit-edit="${escapeHtml(item.targetType)}" data-audit-id="${escapeHtml(item.targetId)}">تعديل السجل</button>` : ''}
      <button class="btn ghost small" data-clear-audit-focus>إخفاء</button>
    </div>`;
  app.prepend(banner);
  const q = String(item.search || item.targetId || '').trim().toLowerCase();
  if(q){
    const input = app.querySelector('[data-table-search]');
    if(input){
      input.value = q;
      input.dispatchEvent(new Event('input'));
      const rows = Array.from(app.querySelectorAll('tbody tr'));
      rows.forEach(tr=>{
        const hit = tr.textContent.toLowerCase().includes(q);
        if(hit){
          tr.style.display = '';
          tr.classList.add('audit-row-focus');
        }
      });
      const first = app.querySelector('.audit-row-focus');
      if(first) setTimeout(()=>first.scrollIntoView({behavior:'smooth', block:'center'}), 150);
    }
  }
  app.querySelectorAll('[data-clear-audit-focus]').forEach(b=>b.addEventListener('click',()=>{ sessionStorage.removeItem('auditFocus'); render(); }));
  app.querySelectorAll('[data-audit-edit]').forEach(b=>b.addEventListener('click',()=>openForm(b.dataset.auditEdit, b.dataset.auditId)));
}

function bindViewEvents(){
  document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openForm(b.dataset.open)));
  document.querySelectorAll('[data-open-new-month]').forEach(b=>b.addEventListener('click',openNewMonthModal));
  document.querySelectorAll('[data-close-current-month]').forEach(b=>b.addEventListener('click',closeCurrentMonth));
  document.querySelectorAll('[data-reopen-current-month]').forEach(b=>b.addEventListener('click',reopenCurrentMonth));
  document.querySelectorAll('[data-edit-opening]').forEach(b=>b.addEventListener('click',()=>openOpeningBalancesModal(b.dataset.editOpening || '')));
  document.querySelectorAll('[data-switch-month]').forEach(b=>b.addEventListener('click',()=>switchMonth(b.dataset.switchMonth)));
  const monthJump = byId('monthJumpSelect');
  const openSelected = byId('openSelectedMonthBtn');
  if(openSelected && monthJump) openSelected.addEventListener('click',()=>switchMonth(monthJump.value));
  const settingsMonthSelect = byId('settingsMonthSelect');
  const settingsOpenMonthBtn = byId('settingsOpenMonthBtn');
  if(settingsOpenMonthBtn && settingsMonthSelect) settingsOpenMonthBtn.addEventListener('click',()=>switchMonth(settingsMonthSelect.value));
  document.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>openForm(singular(b.dataset.edit), b.dataset.id)));
  document.querySelectorAll('[data-receipt-invoice]').forEach(b=>b.addEventListener('click',()=>openReceiptForInvoice(b.dataset.receiptInvoice)));
  document.querySelectorAll('[data-print-invoice]').forEach(b=>b.addEventListener('click',()=>printInvoiceById(b.dataset.printInvoice)));
  document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>deleteItem(b.dataset.delete,b.dataset.id)));
  document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{ sessionStorage.removeItem('auditFocus'); currentView=b.dataset.go; render(); }));
  document.querySelectorAll('[data-audit-go]').forEach(b=>b.addEventListener('click',()=>goToAuditItem(b.dataset.auditGo)));
  const cs = byId('cloudSaveBtn'); if(cs) cs.addEventListener('click', forceCloudSave);
  const cl = byId('cloudLoadBtn'); if(cl) cl.addEventListener('click', forceCloudLoad);
  document.querySelectorAll('[data-account]').forEach(card=>card.addEventListener('click',()=>openAccountLedger(card.dataset.account)));
  const select = byId('invoicePrintSelect');
  if(select) select.addEventListener('change', e=>{ localStorage.setItem('selectedInvoice', e.target.value); render(); });
  const exportBtn = byId('exportBtn'); if(exportBtn) exportBtn.addEventListener('click', exportJson);
  const importFile = byId('importFile'); if(importFile) importFile.addEventListener('change', importJson);
  const resetBtn = byId('resetBtn'); if(resetBtn) resetBtn.addEventListener('click',()=>{ if(confirm('متأكد من الرجوع للبيانات الافتراضية؟')) resetState(); });
  const saveRatesBtn = byId('saveRatesBtn'); if(saveRatesBtn) saveRatesBtn.addEventListener('click', saveRates);
  document.querySelectorAll('[data-table-search]').forEach(input=>{
    input.addEventListener('input', ()=>{
      const shell = input.closest('.table-shell');
      const q = input.value.trim().toLowerCase();
      shell.querySelectorAll('tbody tr').forEach(tr=>{
        tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  });
  applyAuditFocus();
}
function singular(type){ return ({clients:'client',packages:'package',videos:'video',invoices:'invoice',receipts:'receipt',manualPayments:'manualPayment',expenses:'expense',transfers:'transfer',monthClose:'monthClose'}[type] || type); }
function collectionFor(type){ return ({client:'clients',package:'packages',video:'videos',invoice:'invoices',receipt:'receipts',manualPayment:'manualPayments',expense:'expenses',transfer:'transfers',monthClose:'monthClose'}[type]); }
function itemKey(type){ return ['client','package'].includes(type) ? 'code' : type==='monthClose' ? 'month' : 'id'; }
function findItem(type,id){ return state[collectionFor(type)].find(x=>String(x[itemKey(type)])===String(id)); }
function deleteItem(collection,id){
  if(!confirm('هل تريد حذف هذا السجل؟')) return;
  const type = singular(collection); const key = itemKey(type);
  state[collection] = state[collection].filter(x=>String(x[key])!==String(id));
  saveState(); render(); toast('تم الحذف');
}

function openForm(type, id='', preset=null){
  const isEditing = !!id;
  const item = isEditing ? findItem(type,id) : (preset || null);
  const defs = formDefs(type, item);
  byId('modalTitle').textContent = (isEditing?'تعديل ':'إضافة ') + defs.title;
  byId('modalBody').innerHTML = `<form id="entityForm"><div class="form-grid three-cols">${defs.fields.map(fieldHtml).join('')}</div><div class="form-actions"><button type="button" class="btn ghost" id="cancelForm">إلغاء</button><button class="btn primary" type="submit">حفظ</button></div></form>`;
  byId('modal').classList.remove('hidden');
  byId('cancelForm').addEventListener('click', closeModal);
  byId('entityForm').addEventListener('submit', e=>{ e.preventDefault(); submitForm(type,id,defs.fields); });
}
function closeModal(){ byId('modal').classList.add('hidden'); }
function fieldHtml(f){
  const label = `<label>${f.label}</label>`;
  const value = escapeHtml(f.value ?? '');
  if(f.type==='select') return `<div class="field"><label>${f.label}</label><select name="${f.name}"><option value="">اختر</option>${f.options.map(o=> typeof o==='string'?`<option value="${escapeHtml(o)}" ${o===f.value?'selected':''}>${escapeHtml(o)}</option>`:`<option value="${escapeHtml(o.value)}" ${o.value===f.value?'selected':''}>${escapeHtml(o.label)}</option>`).join('')}</select></div>`;
  if(f.type==='textarea') return `<div class="field"><label>${f.label}</label><textarea name="${f.name}">${value}</textarea></div>`;
  return `<div class="field">${label}<input name="${f.name}" type="${f.type||'text'}" step="${f.step||'any'}" value="${value}" ${f.readonly?'readonly':''}></div>`;
}
function formDefs(type, item={}){
  const it = item || {};
  const defaults = { date: defaultRecordDate(), month: activeMonth(), currency:'EGP', rate:1, converted:'لا', deduct:'نعم', executed:'لا', count:'نعم' };
  const v = (k,d='') => it[k] ?? defaults[k] ?? d;
  const common = {
    client: { title:'عميل', fields:[
      {name:'code',label:'كود العميل',value:v('code',`C${String(state.clients.length+1).padStart(3,'0')}`)}, {name:'name',label:'اسم العميل',value:v('name')}, {name:'country',label:'الدولة',type:'select',options:lists.countries,value:v('country')},
      {name:'contactMethod',label:'طريقة التواصل',value:v('contactMethod')}, {name:'contact',label:'رقم/يوزر التواصل',value:v('contact')}, {name:'packageCode',label:'كود الباقة',type:'select',options:packageOptions(),value:v('packageCode')},
      {name:'type',label:'نوع العميل',type:'select',options:lists.clientTypes,value:v('type')}, {name:'status',label:'حالة العميل',type:'select',options:lists.clientStatus,value:v('status')}, {name:'date',label:'تاريخ الإضافة',type:'date',value:v('date')},
      {name:'notes',label:'ملاحظات',type:'textarea',value:v('notes')}
    ]},
    package: { title:'باقة', fields:[
      {name:'code',label:'كود الباقة',value:v('code',`P${String(state.packages.length+1).padStart(3,'0')}`)}, {name:'name',label:'اسم الباقة',value:v('name')}, {name:'currency',label:'العملة',type:'select',options:lists.currencies,value:v('currency')},
      {name:'price',label:'السعر',type:'number',value:v('price')}, {name:'priceEgp',label:'السعر بالجنيه',type:'number',value:v('priceEgp')}, {name:'duration',label:'مدة الباقة',type:'select',options:lists.packageDuration,value:v('duration')},
      {name:'videos',label:'عدد الفيديوهات',value:v('videos')}, {name:'unitPrice',label:'سعر الفيديو الواحد',type:'number',value:v('unitPrice')}, {name:'terms',label:'طريقة الدفع',type:'select',options:lists.paymentTerms,value:v('terms')},
      {name:'notes',label:'ملاحظات',type:'textarea',value:v('notes')}
    ]},
    video: { title:'فيديو', fields:[
      {name:'id',label:'رقم الفيديو',value:v('id',uid('V',state.videos))}, {name:'date',label:'التاريخ',type:'date',value:v('date')}, {name:'clientCode',label:'كود العميل',type:'select',options:clientOptions(),value:v('clientCode')},
      {name:'type',label:'نوع الفيديو',type:'select',options:lists.videoTypes,value:v('type')}, {name:'duration',label:'مدة الفيديو',type:'select',options:lists.videoDurations,value:v('duration')}, {name:'price',label:'السعر',type:'number',value:v('price')},
      {name:'currency',label:'العملة',type:'select',options:lists.currencies,value:v('currency')}, {name:'rate',label:'سعر الصرف',type:'number',value:v('rate')}, {name:'status',label:'حالة التسليم',type:'select',options:lists.videoStatus,value:v('status')},
      {name:'count',label:'يُحتسب؟',type:'select',options:lists.yesNo,value:v('count')}, {name:'invoiceId',label:'رقم الفاتورة',type:'select',options:invoiceOptions(false),value:v('invoiceId')}, {name:'notes',label:'ملاحظات',type:'textarea',value:v('notes')}
    ]},
    invoice: { title:'فاتورة', fields:[
      {name:'id',label:'رقم الفاتورة',value:v('id',uid('INV',state.invoices))}, {name:'date',label:'تاريخ الفاتورة',type:'date',value:v('date')}, {name:'month',label:'الشهر',type:'month',value:v('month')},
      {name:'clientCode',label:'كود العميل',type:'select',options:clientOptions(),value:v('clientCode')}, {name:'type',label:'نوع الفاتورة',type:'select',options:lists.invoiceTypes,value:v('type')}, {name:'desc',label:'الوصف',value:v('desc')},
      {name:'amount',label:'المستحق',type:'number',value:v('amount')}, {name:'currency',label:'العملة',type:'select',options:lists.currencies,value:v('currency')}, {name:'rate',label:'سعر الصرف',type:'number',value:v('rate')},
      {name:'dueDate',label:'تاريخ الاستحقاق',type:'date',value:v('dueDate')}, {name:'notes',label:'ملاحظات',type:'textarea',value:v('notes')}
    ]},
    receipt: { title:'استلام سريع', fields:[
      {name:'id',label:'رقم الاستلام',value:v('id',uid('RC',state.receipts))}, {name:'date',label:'تاريخ الاستلام',type:'date',value:v('date')}, {name:'amount',label:'المبلغ المستلم',type:'number',value:v('amount')},
      {name:'currency',label:'العملة',type:'select',options:lists.currencies,value:v('currency')}, {name:'rate',label:'سعر الصرف',type:'number',value:v('rate')}, {name:'account',label:'مكان الاستلام',type:'select',options:lists.accounts,value:v('account','Vodafone Cash')},
      {name:'txId',label:'Transaction ID',value:v('txId')}, {name:'manualClientCode',label:'كود عميل يدوي',type:'select',options:clientOptions(),value:v('manualClientCode')}, {name:'manualInvoiceId',label:'رقم فاتورة يدوي',type:'select',options:invoiceOptions(true),value:v('manualInvoiceId')},
      {name:'converted',label:'تم التحويل؟',type:'select',options:lists.yesNo,value:v('converted')}, {name:'notes',label:'ملاحظات',type:'textarea',value:v('notes')}
    ]},
    manualPayment: { title:'دفع يدوي', fields:[
      {name:'id',label:'رقم الدفع',value:v('id',uid('PAY',state.manualPayments))}, {name:'date',label:'التاريخ',type:'date',value:v('date')}, {name:'clientCode',label:'كود العميل',type:'select',options:clientOptions(),value:v('clientCode')},
      {name:'invoiceId',label:'رقم الفاتورة',type:'select',options:invoiceOptions(false),value:v('invoiceId')}, {name:'amount',label:'المبلغ',type:'number',value:v('amount')}, {name:'currency',label:'العملة',type:'select',options:lists.currencies,value:v('currency')},
      {name:'rate',label:'سعر الصرف',type:'number',value:v('rate')}, {name:'account',label:'الحساب المستلم',type:'select',options:lists.accounts,value:v('account','Vodafone Cash')}, {name:'method',label:'طريقة الدفع',type:'select',options:lists.paymentMethods,value:v('method')},
      {name:'notes',label:'ملاحظات',type:'textarea',value:v('notes')}
    ]},
    expense: { title:'مصروف', fields:[
      {name:'id',label:'رقم المصروف',value:v('id',uid('EXP',state.expenses))}, {name:'date',label:'التاريخ',type:'date',value:v('date')}, {name:'type',label:'نوع المصروف',type:'select',options:lists.expenseTypes,value:v('type')},
      {name:'desc',label:'الوصف',value:v('desc')}, {name:'amount',label:'المبلغ',type:'number',value:v('amount')}, {name:'account',label:'الحساب المدفوع منه',type:'select',options:lists.accounts,value:v('account','Vodafone Cash')},
      {name:'deduct',label:'يُخصم من الربح؟',type:'select',options:lists.yesNo,value:v('deduct')}, {name:'notes',label:'ملاحظات',type:'textarea',value:v('notes')}
    ]},
    transfer: { title:'تحويل', fields:[
      {name:'id',label:'رقم التحويل',value:v('id',uid('TR',state.transfers))}, {name:'date',label:'التاريخ',type:'date',value:v('date')}, {name:'from',label:'من حساب',type:'select',options:lists.coreAccounts,value:v('from','Vodafone Cash')},
      {name:'to',label:'إلى حساب',type:'select',options:lists.coreAccounts,value:v('to')}, {name:'amount',label:'المبلغ',type:'number',value:v('amount')}, {name:'reason',label:'سبب التحويل',type:'select',options:lists.transferReasons,value:v('reason','توزيع 33%')},
      {name:'executed',label:'تم التنفيذ؟',type:'select',options:lists.yesNo,value:v('executed')}, {name:'notes',label:'ملاحظات',type:'textarea',value:v('notes')}
    ]},
    monthClose: { title:'إغلاق شهر', fields:[
      {name:'month',label:'الشهر',type:'month',value:v('month')}, {name:'due',label:'إجمالي المستحق',type:'number',value:v('due',totals().due)}, {name:'paid',label:'إجمالي المقبوض',type:'number',value:v('paid',totals().paid)},
      {name:'remaining',label:'إجمالي المتبقي',type:'number',value:v('remaining',totals().remaining)}, {name:'expenses',label:'إجمالي المصروفات',type:'number',value:v('expenses',totals().expenses)}, {name:'profit',label:'صافي الربح',type:'number',value:v('profit',totals().profit)},
      {name:'videos',label:'عدد الفيديوهات',type:'number',value:v('videos',state.videos.length)}, {name:'clients',label:'عدد العملاء',type:'number',value:v('clients',state.clients.length)}, {name:'closed',label:'تم الإغلاق؟',type:'select',options:lists.yesNo,value:v('closed','لا')},
      {name:'notes',label:'ملاحظات',type:'textarea',value:v('notes')}
    ]}
  };
  return common[type];
}
function submitForm(type,id,fields){
  const form = byId('entityForm');
  const data = {};
  fields.forEach(f=>{
    let val = form.elements[f.name]?.value ?? '';
    if(f.type === 'number') val = num(val);
    data[f.name] = val;
  });
  if(type==='package' && !data.priceEgp) data.priceEgp = egp(data.price,data.currency);
  if(['video','invoice','receipt','manualPayment'].includes(type) && !data.rate) data.rate = rateFor(data.currency);
  const collection = collectionFor(type); const key = itemKey(type);
  if(id){
    const idx = state[collection].findIndex(x=>String(x[key])===String(id));
    if(idx>=0) state[collection][idx] = data;
  }else{
    if(state[collection].some(x=>String(x[key])===String(data[key]))) { toast('الكود أو الرقم موجود قبل كده'); return; }
    state[collection].push(data);
  }
  if(type === 'monthClose' && data.month){
    state.monthWorkspaces = (state.monthWorkspaces && typeof state.monthWorkspaces === 'object' && !Array.isArray(state.monthWorkspaces)) ? state.monthWorkspaces : {};
    if(state.monthWorkspaces[data.month]){
      state.monthWorkspaces[data.month].summary = {...(state.monthWorkspaces[data.month].summary || {}), ...data};
      state.monthWorkspaces[data.month].updatedAt = new Date().toISOString();
    }
  }
  saveState(); closeModal(); render(); toast('تم الحفظ');
}

function exportJson(){
  const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `profit-clients-backup-${today()}.json`; a.click(); URL.revokeObjectURL(url);
}
function importJson(e){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = () => { try{ state = JSON.parse(reader.result); ensureStateShape(); saveState(); render(); toast('تم استيراد البيانات'); }catch(err){ toast('ملف غير صالح'); } };
  reader.readAsText(file);
}
function saveRates(){
  document.querySelectorAll('[data-rate]').forEach(inp=> state.settings.exchangeRates[inp.dataset.rate] = num(inp.value));
  saveState(); render(); toast('تم حفظ أسعار الصرف');
}
function toast(msg){ const t=byId('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2200); }

byId('nav').addEventListener('click', e=>{ const btn = e.target.closest('.nav-item'); if(!btn) return; currentView = btn.dataset.view; render(); });
byId('closeModal').addEventListener('click', closeModal);
byId('modal').addEventListener('click', e=>{ if(e.target.id==='modal') closeModal(); });
byId('quickReceiptBtn').addEventListener('click',()=>openForm('receipt'));
byId('resetFiltersBtn').addEventListener('click',()=>render());
byId('cloudStatusBtn').addEventListener('click',()=>forceCloudSave());

render();
initSupabase();
