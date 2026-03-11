// seed-data.mjs
// شغّلي هاد الملف مرة واحدة بس عشان تضيفي كل البيانات لـ Firebase
// الأمر: node seed-data.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAOkTH9SsVS5I-2mZ3bqgG5AfwaGbUz0LY",
  authDomain: "shaimaa-portfolio.firebaseapp.com",
  projectId: "shaimaa-portfolio",
  storageBucket: "shaimaa-portfolio.firebasestorage.app",
  messagingSenderId: "84481013515",
  appId: "1:84481013515:web:ae10a010d663753430940e"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const PROJECTS = [
  {
    title: 'Little Bear Café System',
    desc: 'نظام متكامل مبني من الصفر — Authentication، Image Upload، وربط Laravel Backend بـ Next.js Frontend. تطبيق حقيقي شغّال مبني بتفكير هندسي.',
    stack: 'Laravel · Next.js · Firebase',
    category: 'web',
    github: '',
    demo: '',
  },
  {
    title: 'MyHotelBooking.com',
    desc: 'منصة حجز فنادق كاملة مع نظام إدارة متعدد الأدوار — Reservations، User Roles، Admin Dashboard، Ratings & Reviews.',
    stack: 'WordPress · Tourfic · WooCommerce · Elementor',
    category: 'web',
    github: '',
    demo: '',
  },
  {
    title: 'Agile App — SWE6011',
    desc: 'تطبيق Desktop كامل مبني خلال مادة Agile بالجامعة — Login، Proposals Dashboard، قاعدة بيانات MS Access، مدار بـ Sprints موثقة في Jira.',
    stack: 'C# · WinForms · MS Access · ADO.NET',
    category: 'desktop',
    github: '',
    demo: '',
  },
  {
    title: 'CDC Virus Tracker MVP',
    desc: 'تطبيق لتتبع تفشي الأوبئة عالميًا — Agile Product Management، User Stories، MVP Planning، Heat Maps لتتبع حالات الإصابة.',
    stack: 'Agile · Product Management · UX',
    category: 'agile',
    github: '',
    demo: '',
  },
  {
    title: 'Executing Agile with The A-Team',
    desc: 'قيادة مشروع Agile كان في أزمة — Transparency، Servant Leadership، Team Empowerment. MVP جاهز في 12 أسبوع.',
    stack: 'Scrum · Jira · Agile Leadership',
    category: 'agile',
    github: '',
    demo: '',
  },
  {
    title: 'WorldVisitz — Agile Transformation',
    desc: 'تحويل شركة سياحة من Waterfall لـ Scrum — تدريب الفريق على Agile Ceremonies وإعادة توزيع الأدوار.',
    stack: 'Scrum · Agile · Change Management',
    category: 'agile',
    github: '',
    demo: '',
  },
  {
    title: 'Retail Clothing Database',
    desc: 'تصميم قاعدة بيانات لشركة ملابس من الصفر — ERD، Data Normalization، SQL Scripts للجداول والتقارير.',
    stack: 'SQL · ERD · Data Normalization',
    category: 'database',
    github: '',
    demo: '',
  },
  {
    title: 'GeekUp — Mobile Valuation App',
    desc: 'تطبيق موبايل للمقتنيات بـ DSDM Agile — Iterative Development، User Stories، اقتراح ML لكشف المزيفات، MVP في 6 أشهر.',
    stack: 'DSDM · Agile · Mobile Design',
    category: 'agile',
    github: '',
    demo: '',
  },
  {
    title: 'Hybrid Network Design — Gotham City College',
    desc: 'تصميم شبكة هجينة لكلية تعتمد التعلم عن بُعد والحضوري — Network Topology، Access Points، Security Measures.',
    stack: 'Network Design · Security · Infrastructure',
    category: 'network',
    github: '',
    demo: '',
  },
  {
    title: 'IT Infrastructure Upgrade — Fashion Retail',
    desc: 'خطة ترقية IT Infrastructure لشركة أزياء — POS، CRM، E-commerce، اختيار Hardware & Software المناسب للميزانية.',
    stack: 'IT Infrastructure · Hardware · Software',
    category: 'network',
    github: '',
    demo: '',
  },
  {
    title: 'Mayo Clinic — Hospital Management System',
    desc: 'تصميم قاعدة بيانات لنظام إدارة مستشفى — ERD للمرضى والأطباء، Database Normalization، SQL للاستعلامات والتقارير.',
    stack: 'SQL · ERD · Database Design',
    category: 'database',
    github: '',
    demo: '',
  },
  {
    title: 'Fordley Car Park — Office Automation',
    desc: 'أتمتة موقف سيارات — Mail Merge تلقائي، Excel للتقارير، Interactive Membership Form، Prototype في Microsoft Access.',
    stack: 'MS Access · Excel · Word · Automation',
    category: 'desktop',
    github: '',
    demo: '',
  },
];

const COURSES = [
  {
    title: 'Agile & Scrum من الصفر',
    desc: 'كورس شامل يغطي أساسيات Agile وـ Scrum — من User Stories لـ Sprint Planning وـ Burndown Charts.',
    category: 'agile',
    lessons: [],
  },
  {
    title: 'تطوير الويب مع Next.js',
    desc: 'كورس عملي لبناء مواقع حديثة بـ Next.js وـ Firebase من الصفر حتى النشر.',
    category: 'web',
    lessons: [],
  },
];

async function seed() {
  console.log('🚀 بدأ إضافة البيانات...\n');

  console.log('📁 إضافة المشاريع...');
  for (const p of PROJECTS) {
    await addDoc(collection(db,'projects'), p);
    console.log(`  ✅ ${p.title}`);
  }

  console.log('\n📚 إضافة الكورسات...');
  for (const c of COURSES) {
    await addDoc(collection(db,'courses'), c);
    console.log(`  ✅ ${c.title}`);
  }

  console.log('\n🎉 تم إضافة كل البيانات بنجاح!');
  process.exit(0);
}

seed().catch(e => { console.error('❌ خطأ:', e); process.exit(1); });
