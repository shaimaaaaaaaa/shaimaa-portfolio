// update-projects-bilingual.mjs
// شغّلي هاد الملف عشان تضيفي وصف عربي وإنجليزي لكل مشروع
// الأمر: node update-projects-bilingual.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

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

const DESCRIPTIONS = {
  'Little Bear Café System': {
    en: 'A fully integrated system built from scratch — Authentication, Image Upload, and connecting Laravel Backend with Next.js Frontend. A real working application built with genuine engineering thinking.',
    ar: 'نظام متكامل مبني من الصفر — Authentication، Image Upload، وربط Laravel Backend بـ Next.js Frontend. تطبيق حقيقي شغّال مبني بتفكير هندسي.',
  },
  'MyHotelBooking.com': {
    en: 'A complete hotel booking platform with multi-role management — Reservations, User Roles, Admin Dashboard, Ratings & Reviews.',
    ar: 'منصة حجز فنادق كاملة مع نظام إدارة متعدد الأدوار — Reservations، User Roles، Admin Dashboard، Ratings & Reviews.',
  },
  'Agile App — SWE6011': {
    en: 'A complete Desktop application built during an Agile university course — Login, Proposals Dashboard, MS Access database, managed with documented Sprints in Jira.',
    ar: 'تطبيق Desktop كامل مبني خلال مادة Agile بالجامعة — Login، Proposals Dashboard، قاعدة بيانات MS Access، مدار بـ Sprints موثقة في Jira.',
  },
  'CDC Virus Tracker MVP': {
    en: 'An application for tracking global epidemic outbreaks — Agile Product Management, User Stories, MVP Planning, Heat Maps for tracking infection cases.',
    ar: 'تطبيق لتتبع تفشي الأوبئة عالميًا — Agile Product Management، User Stories، MVP Planning، Heat Maps لتتبع حالات الإصابة.',
  },
  'Executing Agile with The A-Team': {
    en: 'Led an Agile project in crisis — Transparency, Servant Leadership, Team Empowerment. MVP delivered in 12 weeks.',
    ar: 'قيادة مشروع Agile كان في أزمة — Transparency، Servant Leadership، Team Empowerment. MVP جاهز في 12 أسبوع.',
  },
  'WorldVisitz — Agile Transformation': {
    en: 'Transformed a tourism company from Waterfall to Scrum — trained the team on Agile Ceremonies and redistributed roles.',
    ar: 'تحويل شركة سياحة من Waterfall لـ Scrum — تدريب الفريق على Agile Ceremonies وإعادة توزيع الأدوار.',
  },
  'Retail Clothing Database': {
    en: 'Designed a database for a clothing company from scratch — ERD, Data Normalization, SQL Scripts for tables and reports.',
    ar: 'تصميم قاعدة بيانات لشركة ملابس من الصفر — ERD، Data Normalization، SQL Scripts للجداول والتقارير.',
  },
  'GeekUp — Mobile Valuation App': {
    en: 'A mobile app for collectibles using DSDM Agile — Iterative Development, User Stories, ML suggestion for detecting counterfeits, MVP in 6 months.',
    ar: 'تطبيق موبايل للمقتنيات بـ DSDM Agile — Iterative Development، User Stories، اقتراح ML لكشف المزيفات، MVP في 6 أشهر.',
  },
  'Hybrid Network Design — Gotham City College': {
    en: 'Designed a hybrid network for a college using blended learning — Network Topology, Access Points, Security Measures.',
    ar: 'تصميم شبكة هجينة لكلية تعتمد التعلم عن بُعد والحضوري — Network Topology، Access Points، Security Measures.',
  },
  'IT Infrastructure Upgrade — Fashion Retail': {
    en: 'IT Infrastructure upgrade plan for a fashion company — POS, CRM, E-commerce, selecting appropriate Hardware & Software within budget.',
    ar: 'خطة ترقية IT Infrastructure لشركة أزياء — POS، CRM، E-commerce، اختيار Hardware & Software المناسب للميزانية.',
  },
  'Mayo Clinic — Hospital Management System': {
    en: 'Designed a database for a hospital management system — ERD for patients and doctors, Database Normalization, SQL for queries and reports.',
    ar: 'تصميم قاعدة بيانات لنظام إدارة مستشفى — ERD للمرضى والأطباء، Database Normalization، SQL للاستعلامات والتقارير.',
  },
  'Fordley Car Park — Office Automation': {
    en: 'Automated car park operations — automatic Mail Merge, Excel reports, Interactive Membership Form, Microsoft Access prototype.',
    ar: 'أتمتة موقف سيارات — Mail Merge تلقائي، Excel للتقارير، Interactive Membership Form، Prototype في Microsoft Access.',
  },
};

async function update() {
  console.log('🚀 بدأ تحديث المشاريع...\n');
  const snap = await getDocs(collection(db, 'projects'));

  for (const d of snap.docs) {
    const title = d.data().title;
    const match = DESCRIPTIONS[title];
    if (match) {
      await updateDoc(doc(db, 'projects', d.id), {
        desc_en: match.en,
        desc_ar: match.ar,
      });
      console.log(`✅ ${title}`);
    } else {
      console.log(`⚠️  ما لقيت وصف لـ: ${title}`);
    }
  }

  console.log('\n🎉 تم تحديث كل المشاريع!');
  process.exit(0);
}

update().catch(e => { console.error('❌ خطأ:', e); process.exit(1); });
