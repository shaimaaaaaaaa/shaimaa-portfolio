'use client';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { LANG, T } from '../lib/constants';
import type { Lang, Course } from '../lib/constants';
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lang,    setLang]    = useState<Lang>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang;
    if (saved==='ar'||saved==='en') setLang(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('lang', lang);
    document.documentElement.dir  = lang==='ar'?'rtl':'ltr';
    document.documentElement.lang = lang;
  }, [lang, mounted]);

  useEffect(() => {
    getDocs(collection(db,'courses'))
      .then(s => setCourses(s.docs.map(d=>({id:d.id,...d.data()} as Course))));
  }, []);

  const L = LANG[lang];
  const eyebrow: React.CSSProperties = {fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'};

  if (!mounted) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  return (
    <>
      <style>{`
        @media(max-width:768px){
          .courses-hero { padding: 7rem 1.25rem 3rem !important; }
          .courses-grid { grid-template-columns: 1fr !important; padding: 2rem 1.25rem 5rem !important; }
        }
      `}</style>

      <main style={{background:T.bg,color:T.text,minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir}}>
        <Navbar lang={lang} L={L} onLangChange={setLang} />

        {/* HERO */}
        <section className="courses-hero" style={{padding:'9rem 3rem 4rem',position:'relative',overflow:'hidden',background:T.bg2}}>
          <div style={{position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.35) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none'}}/>
          <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,backgroundSize:'70px 70px',opacity:.3,pointerEvents:'none'}}/>
          <div style={{maxWidth:1050,margin:'0 auto',position:'relative',zIndex:1}}>
            <span style={eyebrow}>{L.courseSub}</span>
            <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(2rem,6vw,3.5rem)',fontWeight:900,color:T.white}}>
              {L.courseTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.courseSpan}</span>
            </h1>
            <div style={{width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
          </div>
        </section>

        {/* GRID */}
        <div className="courses-grid" style={{maxWidth:1050,margin:'0 auto',padding:'3rem 3rem 6rem',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1.5rem'}}>
          {courses.length===0 && (
            <p style={{color:T.muted,textAlign:'center',padding:'4rem',gridColumn:'1/-1'}}>{L.noCourse}</p>
          )}
          {courses.map((c,idx) => (
            <Link key={c.id} href={`/courses/${c.id}`}
              style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.75rem',textDecoration:'none',display:'flex',flexDirection:'column',transition:'all .3s'}}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.borderColor='rgba(201,160,72,0.5)';el.style.transform='translateY(-5px)';}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.borderColor=T.border;el.style.transform='translateY(0)';}}>
              <div style={{width:48,height:48,borderRadius:12,background:'rgba(138,31,50,0.35)',border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.1rem'}}>
                <span style={{fontFamily:'Playfair Display,serif',color:T.goldL,fontWeight:700,fontSize:'1rem'}}>{String(idx+1).padStart(2,'0')}</span>
              </div>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.05rem',fontWeight:700,color:T.white,marginBottom:'.5rem',lineHeight:1.4}}>{c.title}</div>
              <div style={{fontSize:'.85rem',color:T.text2,lineHeight:1.9,flex:1,marginBottom:'1.1rem'}}>{c.desc}</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'.85rem',borderTop:`1px solid rgba(200,158,72,0.12)`}}>
                <span style={{fontSize:'.78rem',color:T.muted}}>{c.lessons?.length||0} {L.lessons}</span>
                <span style={{fontSize:'.82rem',color:T.gold,fontWeight:700}}>{L.startBtn}</span>
              </div>
            </Link>
          ))}
        </div>

        <footer style={{textAlign:'center',padding:'2rem 1.25rem',borderTop:`1px solid ${T.border}`,fontSize:'.8rem',color:T.muted}}>
          Made with <span style={{color:T.gold}}>♥</span> by{' '}
          <span style={{color:T.goldL,fontWeight:700}}>Shaimaa Kalel</span>
          {' '}· {L.footTxt}
        </footer>
      </main>
    </>
  );
}