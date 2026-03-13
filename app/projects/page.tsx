'use client';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { LANG, T } from '../lib/constants';
import type { Lang, Project } from '../lib/constants';
import Navbar from '../components/Navbar';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
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
    getDocs(collection(db,'projects'))
      .then(s => setProjects(s.docs.map(d=>({id:d.id,...d.data()} as Project))));
  }, []);

  const L = LANG[lang];
  const filtered = filter==='all' ? projects : projects.filter(p=>p.category===filter);
  const eyebrow: React.CSSProperties = {fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'};

  if (!mounted) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  return (
    <>
      <style>{`
        .proj-hero    { padding: 9rem 3rem 4rem !important; }
        .proj-content { padding: 3rem 3rem 6rem !important; max-width: 1050px; margin: 0 auto; }
        .proj-grid    { grid-template-columns: repeat(auto-fill,minmax(300px,1fr)) !important; }
        @media(max-width:768px){
          .proj-hero    { padding: 7rem 1.25rem 3rem !important; }
          .proj-content { padding: 2rem 1.25rem 5rem !important; }
          .proj-grid    { grid-template-columns: 1fr !important; gap: 1rem !important; }
          .proj-filters { gap: .4rem !important; }
          .proj-filters button { padding: .4rem .75rem !important; font-size: .78rem !important; }
        }
      `}</style>

      <main style={{background:T.bg,color:T.text,minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir}}>
        <Navbar lang={lang} L={L} onLangChange={setLang} />

        <section className="proj-hero" style={{position:'relative',overflow:'hidden',background:T.bg2}}>
          <div style={{position:'absolute',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.35) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none'}}/>
          <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,backgroundSize:'70px 70px',opacity:.3,pointerEvents:'none'}}/>
          <div style={{maxWidth:1050,margin:'0 auto',position:'relative',zIndex:1}}>
            <span style={eyebrow}>{L.projSub}</span>
            <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(2rem,6vw,3.5rem)',fontWeight:900,color:T.white}}>
              {L.projTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.projSpan}</span>
            </h1>
            <div style={{width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
          </div>
        </section>

        <div className="proj-content">
          <div className="proj-filters" style={{display:'flex',gap:'.55rem',flexWrap:'wrap',marginBottom:'2rem'}}>
            {L.filters.map(([v,l]) => (
              <button key={v} onClick={()=>setFilter(v)}
                style={{padding:'.5rem 1.1rem',background:filter===v?'rgba(138,31,50,0.5)':'transparent',border:`1px solid ${filter===v?T.burg:T.border}`,borderRadius:24,color:filter===v?T.white:T.text2,fontSize:'.85rem',fontWeight:600,cursor:'pointer',transition:'all .2s'}}>
                {l}
              </button>
            ))}
          </div>

          {filtered.length===0 && (
            <p style={{color:T.muted,textAlign:'center',padding:'4rem'}}>{L.noProj}</p>
          )}

          <div className="proj-grid" style={{display:'grid',gap:'1.5rem'}}>
            {filtered.map(p => (
              <div key={p.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden',display:'flex',flexDirection:'column',transition:'all .3s'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translateY(-4px)';el.style.borderColor='rgba(201,160,72,0.5)';el.style.boxShadow='0 24px 60px rgba(0,0,0,0.6)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translateY(0)';el.style.borderColor=T.border;el.style.boxShadow='none';}}>
                <div style={{height:120,background:`linear-gradient(135deg,${T.burg},#1a0c10)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <div style={{padding:'.4rem .9rem',background:'rgba(255,255,255,0.06)',border:`1px solid ${T.border}`,borderRadius:8}}>
                    <span style={{fontFamily:'monospace',color:T.goldL,fontWeight:700,fontSize:'.85rem',letterSpacing:2}}>{p.category.toUpperCase().slice(0,4)}</span>
                  </div>
                </div>
                <div style={{padding:'1.25rem',flex:1,display:'flex',flexDirection:'column'}}>
                  <div style={{fontSize:'.65rem',color:T.rose,letterSpacing:2,textTransform:'uppercase',marginBottom:'.35rem',fontFamily:'Playfair Display,serif'}}>{p.category}</div>
                  <div style={{fontWeight:700,fontSize:'1rem',color:T.white,marginBottom:'.3rem',lineHeight:1.4}}>{p.title}</div>
                  <div style={{fontSize:'.8rem',color:T.gold,fontWeight:600,marginBottom:'.6rem'}}>{p.stack}</div>
                  <div style={{fontSize:'.85rem',color:T.text2,lineHeight:1.9,flex:1,marginBottom:'.9rem'}}>{lang==='ar'?p.desc_ar||p.desc:p.desc_en||p.desc}</div>
                  <div style={{display:'flex',gap:'.9rem',paddingTop:'.7rem',borderTop:`1px solid rgba(200,158,72,0.12)`}}>
                    {p.github && <a href={p.github} target="_blank" rel="noopener" style={{fontSize:'.8rem',color:T.gold,textDecoration:'none',fontWeight:700}}>{L.githubLbl}</a>}
                    {p.demo   && <a href={p.demo}   target="_blank" rel="noopener" style={{fontSize:'.8rem',color:T.gold,textDecoration:'none',fontWeight:700}}>{L.demoLbl}</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
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