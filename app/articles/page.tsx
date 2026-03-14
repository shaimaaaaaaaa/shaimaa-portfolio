'use client';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import Link from 'next/link';
import SharedFooter from '../components/SharedFooter';

const T = {
  bg:'#0e0608', bg2:'#140a0c', card:'#1a0c10',
  burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', rose:'#d07080',
  white:'#ffffff', text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)',
};

const LANG = {
  en: {
    dir:'ltr', langBtn:'العربية',
    eyebrow:'thoughts & ideas', title:'My', span:'Articles',
    noArticles:'No articles yet. Check back soon!',
    readMore:'Read More →', minRead:'min read',
    filters:[['all','All'],['agile','Agile'],['tech','Tech'],['career','Career']] as [string,string][],
    navLinks:[['/','Home'],['/about','About'],['/articles','Articles'],['/#contact','Contact']] as [string,string][],
  },
  ar: {
    dir:'rtl', langBtn:'English',
    eyebrow:'أفكار ومقالات', title:'', span:'مقالاتي',
    noArticles:'لا توجد مقالات بعد، تابعينا قريباً!',
    readMore:'اقرأ المزيد ←', minRead:'دقيقة قراءة',
    filters:[['all','الكل'],['agile','Agile'],['tech','تقنية'],['career','مسيرة']] as [string,string][],
    navLinks:[['/','الرئيسية'],['/about','عني'],['/articles','المقالات'],['/#contact','تواصل']] as [string,string][],
  },
};

interface Article {
  id:string; title:string; title_ar:string; excerpt:string; excerpt_ar:string;
  category:string; readTime:number; createdAt?:{seconds:number}; coverColor?:string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter,   setFilter]   = useState('all');
  const [lang,     setLang]     = useState<'en'|'ar'>('en');
  const [mounted,  setMounted]  = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lang') as 'en'|'ar';
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
    getDocs(q).then(s => setArticles(s.docs.map(d=>({id:d.id,...d.data()} as Article))))
      .catch(() => getDocs(collection(db,'articles')).then(s => setArticles(s.docs.map(d=>({id:d.id,...d.data()} as Article)))));
  }, []);

  const L = LANG[lang];
  const filtered = filter==='all' ? articles : articles.filter(a=>a.category===filter);
  const eyebrow:React.CSSProperties = {fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'};

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
        .art-desktop { display:flex !important; }
        .art-burger  { display:none !important; }

        /* nav links */
        .art-nav-link {
          position:relative;
          color:${T.text2};
          text-decoration:none;
          font-size:.9rem;
          font-weight:600;
          white-space:nowrap;
          padding-bottom:3px;
          transition:color .2s;
        }
        .art-nav-link::after {
          content:'';
          position:absolute;
          bottom:0; left:0;
          width:0; height:2px;
          background:${T.gold};
          border-radius:2px;
          transition:width .25s ease;
        }
        .art-nav-link:hover { color:${T.goldL} !important; }
        .art-nav-link:hover::after { width:100%; }

        /* lang button */
        .art-lang-btn {
          padding:.4rem .95rem;
          background:rgba(200,158,72,0.1);
          border:1px solid ${T.border};
          border-radius:20px;
          color:${T.gold};
          font-size:.82rem;
          font-weight:700;
          white-space:nowrap;
          transition:background .2s, border-color .2s, color .2s, transform .15s, box-shadow .2s;
        }
        .art-lang-btn:hover {
          background:${T.gold} !important;
          border-color:${T.gold} !important;
          color:#0e0608 !important;
          transform:translateY(-2px);
          box-shadow:0 6px 18px rgba(201,160,72,0.4);
        }

        /* mobile nav links */
        .art-mobile-link {
          color:${T.text2};
          text-decoration:none;
          font-size:1rem;
          font-weight:600;
          padding:.5rem 0;
          border-bottom:1px solid rgba(200,158,72,0.08);
          display:block;
          transition:color .2s, padding-left .2s;
        }
        .art-mobile-link:hover {
          color:${T.goldL} !important;
          padding-left:.5rem;
        }

        /* article cards */
        .art-card {
          text-decoration:none;
          display:flex;
          flex-direction:column;
          background:${T.card};
          border:1px solid ${T.border};
          border-radius:18px;
          overflow:hidden;
          transition:transform .28s, border-color .28s, box-shadow .28s;
        }
        .art-card:hover {
          transform:translateY(-7px) scale(1.01);
          border-color:${T.gold} !important;
          box-shadow:0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,160,72,0.25);
        }

        /* filter buttons */
        .art-filter-btn {
          padding:.45rem 1.1rem;
          border-radius:24px;
          font-size:.85rem;
          font-weight:600;
          transition:background .18s, border-color .18s, color .18s, box-shadow .18s;
        }
        .art-filter-btn:not(.active):hover {
          background:rgba(201,160,72,0.12) !important;
          border-color:${T.gold} !important;
          color:${T.goldL} !important;
          box-shadow:0 0 0 2px rgba(201,160,72,0.2);
        }
        .art-filter-btn.active {
          background:rgba(138,31,50,0.5) !important;
          border-color:${T.burg} !important;
          color:#ffffff !important;
        }

        @media(max-width:768px){
          .art-desktop { display:none !important; }
          .art-burger  { display:flex !important; }
          .art-grid    { grid-template-columns:1fr !important; }
          .art-pad     { padding:6rem 1.25rem 4rem !important; }
        }
      `}</style>

      <main style={{background:T.bg,color:T.text,minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir as 'ltr'|'rtl'}}>
        <div style={{position:'fixed',width:700,height:700,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.3) 0%,transparent 65%)',top:-250,right:-200,pointerEvents:'none',zIndex:0}}/>

        {/* NAV */}
        <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:1000,background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`,boxShadow:'0 2px 40px rgba(0,0,0,0.8)'}}>
          <div style={{padding:'.9rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <Link href="/" className="art-nav-link" style={{fontFamily:'Playfair Display,serif',fontSize:'1.15rem',color:T.goldL,fontWeight:700,letterSpacing:1,textDecoration:'none',flexShrink:0}}>
              ♥ Shaimaa Kalel
            </Link>

            {/* DESKTOP */}
            <div className="art-desktop" style={{gap:'1.5rem',alignItems:'center'}}>
              {L.navLinks.map(([h,l])=>(
                <a key={h} href={h} className="art-nav-link">{l}</a>
              ))}
              <button className="art-lang-btn" onClick={()=>setLang(lang==='en'?'ar':'en')}>
                {L.langBtn}
              </button>
            </div>

            {/* HAMBURGER */}
            <button className="art-burger" onClick={()=>setMenuOpen(!menuOpen)}
              style={{flexDirection:'column',gap:5,background:'none',border:'none',padding:6,flexShrink:0}}>
              <span style={{width:22,height:2,background:menuOpen?T.goldL:T.text2,display:'block',transition:'all .3s',transform:menuOpen?'rotate(45deg) translate(5px,5px)':'none'}}/>
              <span style={{width:22,height:2,background:menuOpen?T.goldL:T.text2,display:'block',transition:'all .3s',opacity:menuOpen?0:1}}/>
              <span style={{width:22,height:2,background:menuOpen?T.goldL:T.text2,display:'block',transition:'all .3s',transform:menuOpen?'rotate(-45deg) translate(5px,-5px)':'none'}}/>
            </button>
          </div>

          {menuOpen && (
            <div style={{borderTop:`1px solid ${T.border}`,padding:'1rem 1.5rem 1.5rem',display:'flex',flexDirection:'column',gap:'.65rem'}}>
              {L.navLinks.map(([h,l])=>(
                <a key={h} href={h} className="art-mobile-link" onClick={()=>setMenuOpen(false)}>{l}</a>
              ))}
              <button className="art-lang-btn" style={{marginTop:'.5rem',borderRadius:10,fontSize:'.9rem'}}
                onClick={()=>{setLang(lang==='en'?'ar':'en');setMenuOpen(false);}}>
                {L.langBtn}
              </button>
            </div>
          )}
        </nav>

        {/* CONTENT */}
        <div className="art-pad" style={{maxWidth:1050,margin:'0 auto',padding:'8rem 2rem 5rem',position:'relative',zIndex:1}}>
          <div style={{marginBottom:'3rem'}}>
            <span style={eyebrow}>{L.eyebrow}</span>
            <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(2rem,5vw,3.5rem)',fontWeight:900,color:T.white}}>
              {L.title} <span style={{color:T.gold,fontStyle:'italic'}}>{L.span}</span>
            </h1>
            <div style={{width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
          </div>

          {/* FILTERS */}
          <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap',marginBottom:'2.5rem'}}>
            {L.filters.map(([v,l])=>(
              <button key={v} onClick={()=>setFilter(v)}
                className={`art-filter-btn${filter===v?' active':''}`}
                style={{background:filter===v?'rgba(138,31,50,0.5)':'transparent',border:`1px solid ${filter===v?T.burg:T.border}`,color:filter===v?T.white:T.text2}}>
                {l}
              </button>
            ))}
          </div>

          {filtered.length===0 && (
            <div style={{textAlign:'center',padding:'5rem',color:T.muted}}>{L.noArticles}</div>
          )}

          {/* GRID */}
          <div className="art-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.5rem'}}>
            {filtered.map(a=>(
              <Link key={a.id} href={`/articles/${a.id}`} className="art-card">
                <div style={{height:150,background:a.coverColor||`linear-gradient(135deg,${T.burg},#1a0c10)`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                  <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,backgroundSize:'40px 40px',opacity:.3}}/>
                  <span style={{fontFamily:'Playfair Display,serif',fontSize:'2.2rem',color:'rgba(255,255,255,0.15)',fontWeight:900,position:'relative',zIndex:1}}>♥</span>
                </div>
                <div style={{padding:'1.4rem',flex:1,display:'flex',flexDirection:'column'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.65rem'}}>
                    <span style={{fontSize:'.65rem',color:T.rose,letterSpacing:2,textTransform:'uppercase',fontFamily:'Playfair Display,serif'}}>{a.category}</span>
                    <span style={{fontSize:'.72rem',color:T.muted}}>{a.readTime} {L.minRead}</span>
                  </div>
                  <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.08rem',fontWeight:700,color:T.white,marginBottom:'.55rem',lineHeight:1.4}}>
                    {lang==='ar'?a.title_ar||a.title:a.title}
                  </div>
                  <div style={{fontSize:'.85rem',color:T.text2,lineHeight:1.9,flex:1,marginBottom:'1rem'}}>
                    {lang==='ar'?a.excerpt_ar||a.excerpt:a.excerpt}
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'.8rem',borderTop:`1px solid rgba(200,158,72,0.12)`}}>
                    <span style={{fontSize:'.75rem',color:T.muted}}>{formatDate(a)}</span>
                    <span style={{fontSize:'.82rem',color:T.gold,fontWeight:700}}>{L.readMore}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SharedFooter lang={lang} />
    </>
  );
}