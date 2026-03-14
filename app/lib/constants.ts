// app/lib/constants.ts

export const T = {
  bg:'#0e0608', bg2:'#140a0c', card:'#1a0c10',
  burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60',
  rose:'#d07080',
  white:'#ffffff', text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)',
};

export const LANG = {
  en: {
    dir:'ltr' as const,
    navLinks:[
      ['/','Home'],
      ['/about','About'],
      ['/projects','Projects'],
      ['/courses','Courses'],
      ['/articles','Articles'],
      ['/#contact','Contact'],
    ] as [string,string][],
    langBtn:'العربية',
    eyebrow:'Software Engineer · Human-Centered Agility',
    hi:"Hello, I'm", name:'Shaimaa Kalel',
    bio:'Combining <b>Technical Skills</b> with an <b gold>Agile Mindset</b> to build real systems that serve real people. Passionate about creating healthier, more human tech teams.',
    btn1:'View Projects', btn2:'Get In Touch',
    stats:[['12+','Projects'],['8+','Certifications'],['3+','Years'],['2025','Graduating']] as [string,string][],
    projSub:'selected work', projTitle:'Featured', projSpan:'Projects',
    projViewAll:'View All Projects →',
    filters:[['all','All'],['web','Web Dev'],['agile','Agile'],['database','Database'],['desktop','Desktop'],['network','Network']] as [string,string][],
    noProj:'No projects yet.',
    courseSub:'learn with me', courseTitle:'Free', courseSpan:'Courses',
    noCourse:'Courses coming soon.',
    lessons:'lessons', startBtn:'Start Learning →',
    courseViewAll:'View All Courses →',
    articleSub:'from the blog', articleTitle:'Latest', articleSpan:'Articles',
    noArticles:'No articles yet.',
    readMore:'Read More →', minRead:'min read', viewAll:'View All Articles →',
    ctaSub:'get in touch', ctaTitle:'Get In', ctaSpan:'Touch',
    ctaP:'Abu Dhabi, UAE · University of Bolton\nOpen to collaborations, opportunities, and conversations.',
    footTxt:'Software Engineer · Content Creator · Abu Dhabi · 2025',
    githubLbl:'GitHub →', demoLbl:'Live Demo →',
  },
  ar: {
    dir:'rtl' as const,
    navLinks:[
      ['/','الرئيسية'],
      ['/about','عني'],
      ['/projects','المشاريع'],
      ['/courses','الكورسات'],
      ['/articles','المقالات'],
      ['/#contact','تواصل'],
    ] as [string,string][],
    langBtn:'English',
    eyebrow:'Software Engineer · Human-Centered Agility',
    hi:'مرحباً، أنا', name:'شيماء خليل',
    bio:'أجمع بين <b>Technical Skills</b> والـ <b gold>Agile Mindset</b> لأبني أنظمة حقيقية تخدم ناس حقيقيين. شغوفة ببناء فرق تقنية أكثر صحة وإنسانية.',
    btn1:'عرض المشاريع', btn2:'تواصل معي',
    stats:[['12+','مشروع'],['8+','شهادة'],['3+','سنوات'],['2025','تخرج']] as [string,string][],
    projSub:'selected work', projTitle:'', projSpan:'أبرز المشاريع',
    projViewAll:'عرض كل المشاريع ←',
    filters:[['all','الكل'],['web','Web Dev'],['agile','Agile'],['database','Database'],['desktop','Desktop'],['network','Network']] as [string,string][],
    noProj:'لا يوجد مشاريع بعد.',
    courseSub:'learn with me', courseTitle:'', courseSpan:'الكورسات',
    noCourse:'الكورسات قادمة قريباً.',
    lessons:'درس', startBtn:'ابدأ التعلم ←',
    courseViewAll:'عرض كل الكورسات ←',
    articleSub:'من المدونة', articleTitle:'', articleSpan:'أحدث المقالات',
    noArticles:'لا توجد مقالات بعد.',
    readMore:'اقرأ المزيد ←', minRead:'دقيقة قراءة', viewAll:'عرض كل المقالات ←',
    ctaSub:'get in touch', ctaTitle:'', ctaSpan:'تواصل معي',
    ctaP:'أبوظبي، الإمارات · University of Bolton\nهل عندك فكرة أو فرصة تعاون؟ تواصل معي.',
    footTxt:'مهندسة برمجيات · صانعة محتوى · أبوظبي · 2025',
    githubLbl:'GitHub →', demoLbl:'Live Demo →',
  },
};

export type Lang = 'en' | 'ar';
export type LangData = typeof LANG['en'] | typeof LANG['ar'];

export interface PdfFile { name: string; url: string; }

export interface CertItem { name: string; imageUrl?: string; }

export interface Project {
  id: string;
  title: string;
  desc: string;
  desc_en: string;
  desc_ar: string;
  stack: string;
  category: string;
  github: string;
  demo: string;
  featured?: boolean;
  imageUrl?: string;
  images?: string[];
  pdfs?: PdfFile[];
}

export interface Course {
  id: string;
  title: string;
  desc: string;
  category: string;
  imageUrl?: string;
  lessons: unknown[];
}

export interface Article {
  id: string;
  title: string;
  title_ar: string;
  excerpt: string;
  excerpt_ar: string;
  category: string;
  readTime: number;
  createdAt?: { seconds: number };
}