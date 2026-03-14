'use client';
import { useEffect, useState } from 'react';
import { db } from './lib/firebase';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { LANG } from './lib/constants';
import type { Lang, Project, Course, Article } from './lib/constants';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectsSection from './components/ProjectsSection';
import { EducationSection, CoursesSection, ArticlesSection, ContactSection, Footer } from './components/Sections';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [courses,  setCourses]  = useState<Course[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [lang,     setLang]     = useState<Lang>('en');
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang;
    if (saved === 'ar' || saved === 'en') setLang(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('lang', lang);
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, mounted]);

  useEffect(() => {
    // Featured projects only — fallback to latest 3 if none featured
    getDocs(query(collection(db,'projects'), where('featured','==',true)))
      .then(s => {
        const featured = s.docs.map(d=>({id:d.id,...d.data()} as Project));
        if (featured.length > 0) {
          setProjects(featured);
        } else {
          getDocs(collection(db,'projects'))
            .then(all => setProjects(all.docs.map(d=>({id:d.id,...d.data()} as Project)).slice(0,3)));
        }
      });

    getDocs(collection(db,'courses'))
      .then(s => setCourses(s.docs.map(d=>({id:d.id,...d.data()} as Course)).slice(0,3)));

    getDocs(query(collection(db,'articles'), orderBy('createdAt','desc'), limit(3)))
      .then(s => setArticles(s.docs.map(d=>({id:d.id,...d.data()} as Article))))
      .catch(() => getDocs(collection(db,'articles'))
        .then(s => setArticles(s.docs.map(d=>({id:d.id,...d.data()} as Article)).slice(0,3))));
  }, []);

  const L = LANG[lang];

  if (!mounted) return (
    <main style={{minHeight:'100vh',background:'#0e0608',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:'#c9a048',fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  return (
    <>
      <style>{`
        @media(max-width:768px){
          .hero-section { padding: 7rem 1.25rem 4rem !important; }
          .section-pad  { padding: 4rem 1.25rem !important; }
          .cards-grid   { grid-template-columns: 1fr !important; }
          .stats-row    { gap: 1.5rem !important; }
          .hero-btns    { flex-direction: column !important; align-items: center !important; }
          .hero-btns a  { width: 100% !important; max-width: 300px !important; text-align: center !important; }
          .filters-wrap { gap: .4rem !important; }
          .filters-wrap button { padding: .4rem .75rem !important; font-size: .78rem !important; }
          .social-grid  { flex-direction: column !important; }
          .section-header-row { flex-direction: column !important; align-items: flex-start !important; }
        }
        @media(min-width:769px) and (max-width:1024px){
          .cards-grid   { grid-template-columns: repeat(2,1fr) !important; }
          .section-pad  { padding: 5rem 2rem !important; }
        }
      `}</style>

      <main style={{background:'#0e0608',color:'#ede4de',minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif"}}>
        <Navbar lang={lang} L={L} onLangChange={setLang} />
        <Hero L={L} />
        <ProjectsSection  L={L} lang={lang} projects={projects} showViewAll={true} />
        <EducationSection lang={lang} />
        <CoursesSection   L={L} lang={lang} courses={courses} showViewAll={true} />
        <ArticlesSection  L={L} lang={lang} articles={articles} />
        <ContactSection   L={L} lang={lang} />
        <Footer L={L} />
      </main>
    </>
  );
}