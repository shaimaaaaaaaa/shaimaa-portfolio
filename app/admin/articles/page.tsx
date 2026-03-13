'use client';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import Link from 'next/link';
import { LANG as NAV_LANG } from '../lib/constants';
import type { Lang } from '../lib/constants';
import Navbar from '../components/Navbar';

const T = {
  bg:'#0e0608', bg2:'#140a0c', card:'#1a0c10',
  burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', rose:'#d07080',
  white:'#ffffff', text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)',
};

const LANG = {
  en: {
    dir:'ltr' as const, langBtn:'العربية',
    eyebrow:'thoughts & ideas', title:'My', span:'Articles',
    noArticles:'No articles yet. Check back soon!',
    readMore:'Read More →', minRead:'min read',
    filters:[['all','All'],['agile','Agile'],['tech','Tech'],['career','Career']] as [string,string][],
  },
  ar: {
    dir:'rtl' as const, langBtn:'English',
    eyebrow:'أفكار ومقالات', title:'', span:'مقالاتي',
    noArticles:'لا توجد مقالات بعد، تابعينا قريباً!',
    readMore:'اقرأ المزيد ←', minRead:'دقيقة قراءة',
    filters:[['all','الكل'],['agile','Agile'],['tech','تقنية'],['career','مسيرة']] as [string,string][],
  },
};

interface Article {
  id:string; title:string; title_ar:string; excerpt:string; excerpt_ar:string;
  category:string; readTime:number; createdAt?:{seconds:number}; coverColor?:string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter,   setFilter]   = useState('all');
  const [lang,     setLang]     = useState<Lang>('en');
  const [mounted,  setMounted]  = useState(false);

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
    const q = query(collection(db,'articles'), orderBy('createdAt','desc'));
    getDocs(q)
      .then(s => setArticles(s.docs.map(d=>({id:d.id,...d.data()} as Article))))
      .catch(() => getDocs(collection(db,'articles')).then(s =>
        setArticles(s.docs.map(d=>({id:d.id,...d.data()} as Article)))
      ));
  }, []);

  const L  = LANG[lang];
  const LN = NAV_LANG[lang];
  const filtered = filter==='all' ? articles : articles.filter(a=>a.category===filter);
  const eyebrow: React.CSSProperties = {fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'};

  function formatDate(a:Article) {
    if (!a.createdAt?.seconds) return '';
    return new Date(a.createdAt.seconds*1000).toLocaleDateString(lang==='ar'?'ar-AE':'en-GB',{day:'numeric',month:'long',year:'numeric'});
  }

  if (!mounted) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  return (
    <>
      <style>{`
        @media(max-width:768px){
          .art-hero  { padding: 7rem 1.25rem 3rem !important; }
          .art-grid  { grid-template-columns: 1fr !important; padding: 2rem 1.25rem 5rem !important; }
          .art-filters { gap: .4rem !important; }
          .art-filters button { padding: .4rem .75rem !important; font-size: .78rem !important; }
        }
      `}</style>

      <main style={{background:T.bg,color:T.text,minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir}}>

        <Navbar lang={lang} L={LN} onLangChange={setLang} />

        {/* HERO */}
        <section className="art-hero" style={{padding:'9rem 3rem 4rem',position:'relative',overflow:'hidden',background:T.bg2}}>
          <div style={{position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.35) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none'}}/>
          <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,backgroundSize:'70px 70px',opacity:.3,pointerEvents:'none'}}/>
          <div style={{maxWidth:1050,margin:'0 auto',position:'relative',zIndex:1}}>
            <span style={eyebrow}>{L.eyebrow}</span>
            <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(2rem,6vw,3.5rem)',fontWeight:900,color:T.white}}>
              {L.title} <span style={{color:T.gold,fontStyle:'italic'}}>{L.span}</span>
            </h1>
            <div style={{width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
          </div>
        </section>

        {/* FILTERS + GRID */}
        <div style={{maxWidth:1050,margin:'0 auto',padding:'3rem 3rem 6rem'}}>
          <div className="art-filters" style={{display:'flex',gap:'.55rem',flexWrap:'wrap',marginBottom:'2rem'}}>
            {L.filters.map(([v,l]) => (
              <button key={v} onClick={()=>setFilter(v)} style={{padding:'.5rem 1.1rem',background:filter===v?'rgba(138,31,50,0.5)':'transparent',border:`1px solid ${filter===v?T.burg:T.border}`,borderRadius:24,color:filter===v?T.white:T.text2,fontSize:'.85rem',fontWeight:600,cursor:'pointer',transition:'all .2s'}}>
                {l}
              </button>
            ))}
          </div>

          {filtered.length===0 && (
            <p style={{color:T.muted,textAlign:'center',padding:'4rem'}}>{L.noArticles}</p>
          )}

          <div className="art-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.5rem'}}>
            {filtered.map(a => (
              <Link key={a.id} href={`/articles/${a.id}`} style={{textDecoration:'none',display:'flex',flexDirection:'column',background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden',transition:'all .3s'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.transform='translateY(-6px)';el.style.borderColor='rgba(201,160,72,0.5)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.transform='translateY(0)';el.style.borderColor=T.border;}}>
                <div style={{height:140,background:a.coverColor||`linear-gradient(135deg,${T.burg},#1a0c10)`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                  <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,backgroundSize:'35px 35px',opacity:.3}}/>
                  <span style={{fontFamily:'Playfair Display,serif',fontSize:'2rem',color:'rgba(255,255,255,0.12)',fontWeight:900,position:'relative',zIndex:1}}>♥</span>
                </div>
                <div style={{padding:'1.35rem',flex:1,display:'flex',flexDirection:'column'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.6rem'}}>
                    <span style={{fontSize:'.65rem',color:T.rose,letterSpacing:2,textTransform:'uppercase',fontFamily:'Playfair Display,serif'}}>{a.category}</span>
                    <span style={{fontSize:'.72rem',color:T.muted}}>{a.readTime} {L.minRead}</span>
                  </div>
                  <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.05rem',fontWeight:700,color:T.white,marginBottom:'.45rem',lineHeight:1.4}}>
                    {lang==='ar'?a.title_ar||a.title:a.title}
                  </div>
                  <div style={{fontSize:'.85rem',color:T.text2,lineHeight:1.85,flex:1,marginBottom:'.9rem'}}>
                    {lang==='ar'?a.excerpt_ar||a.excerpt:a.excerpt}
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'.7rem',borderTop:`1px solid rgba(200,158,72,0.12)`}}>
                    <span style={{fontSize:'.72rem',color:T.muted}}>{formatDate(a)}</span>
                    <span style={{fontSize:'.82rem',color:T.gold,fontWeight:700}}>{L.readMore}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <footer style={{textAlign:'center',padding:'2rem 1.25rem',borderTop:`1px solid ${T.border}`,fontSize:'.8rem',color:T.muted}}>
          Made with <span style={{color:T.gold}}>♥</span> by{' '}
          <span style={{color:T.goldL,fontWeight:700}}>Shaimaa Kalel</span>
          {' '}· Software Engineer · Content Creator · Abu Dhabi · 2025
        </footer>
      </main>
    </>
  );
}