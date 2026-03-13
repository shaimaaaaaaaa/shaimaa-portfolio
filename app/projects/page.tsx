'use client';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { LANG, T } from '../lib/constants';
import type { Lang, Project } from '../lib/constants';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter,   setFilter]   = useState('all');
  const [lang,     setLang]     = useState<Lang>('en');
  const [mounted,  setMounted]  = useState(false);
  const router = useRouter();

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
        .proj-hero    { padding: 9rem 3rem 4rem; }
        .proj-content { padding: 3rem 3rem 6rem; max-width: 1050px; margin: 0 auto; }
        .proj-grid    { display:grid; grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); gap: 1.5rem; }
        .proj-img     { height:180px; overflow:hidden; }
        .proj-img img { width:100%; height:100%; object-fit:contain; display:block; background:#0e0608; transition:transform .4s; }
        .proj-img img:hover { transform:scale(1.04); }

        @media(max-width:768px){
          .proj-hero    { padding: 6.5rem 1.25rem 2.5rem; }
          .proj-content { padding: 1.5rem 1.25rem 4rem; }
          .proj-grid    { grid-template-columns: 1fr; gap: 1rem; }
          .proj-filters { gap: .35rem; flex-wrap: wrap; }
          .proj-filters button { padding: .38rem .7rem !important; font-size: .76rem !important; }
          .proj-img     { height:160px; }
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
          <div className="proj-filters" style={{display:'flex',gap:'.55rem',flexWrap:'wrap',marginBottom:'1.5rem'}}>
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

          <div className="proj-grid">
            {filtered.map(p => (
              <div key={p.id}
                onClick={()=>router.push(`/projects/${p.id}`)}
                style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden',display:'flex',flexDirection:'column',transition:'all .3s',cursor:'pointer'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translateY(-4px)';el.style.borderColor='rgba(201,160,72,0.5)';el.style.boxShadow='0 24px 60px rgba(0,0,0,0.6)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translateY(0)';el.style.borderColor=T.border;el.style.boxShadow='none';}}>

                {p.imageUrl ? (
                  <div className="proj-img">
                    <img src={p.imageUrl} alt={p.title}/>
                  </div>
                ) : (
                  <div style={{height:110,background:`linear-gradient(135deg,${T.burg},#1a0c10)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <div style={{padding:'.4rem .9rem',background:'rgba(255,255,255,0.06)',border:`1px solid ${T.border}`,borderRadius:8}}>
                      <span style={{fontFamily:'monospace',color:T.goldL,fontWeight:700,fontSize:'.85rem',letterSpacing:2}}>{p.category.toUpperCase().slice(0,4)}</span>
                    </div>
                  </div>
                )}

                <div style={{padding:'1.1rem',flex:1,display:'flex',flexDirection:'column'}}>
                  <div style={{fontSize:'.63rem',color:T.rose,letterSpacing:2,textTransform:'uppercase',marginBottom:'.3rem',fontFamily:'Playfair Display,serif'}}>{p.category}</div>
                  <div style={{fontWeight:700,fontSize:'.97rem',color:T.white,marginBottom:'.25rem',lineHeight:1.4}}>{p.title}</div>
                  <div style={{fontSize:'.78rem',color:T.gold,fontWeight:600,marginBottom:'.5rem'}}>{p.stack}</div>
                  <div style={{fontSize:'.83rem',color:T.text2,lineHeight:1.85,flex:1,marginBottom:'.8rem'}}>{lang==='ar'?p.desc_ar||p.desc:p.desc_en||p.desc}</div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:'.65rem',borderTop:`1px solid rgba(200,158,72,0.12)`}}>
                    <div style={{display:'flex',gap:'.75rem'}}>
                      {p.github && (
                        <a href={p.github} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()}
                          style={{fontSize:'.78rem',color:T.gold,textDecoration:'none',fontWeight:700}}>{L.githubLbl}</a>
                      )}
                      {p.demo && (
                        <a href={p.demo} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()}
                          style={{fontSize:'.78rem',color:T.gold,textDecoration:'none',fontWeight:700}}>{L.demoLbl}</a>
                      )}
                    </div>
                    <div style={{display:'flex',gap:'.4rem',alignItems:'center'}}>
                      {(p.images?.length||0)>1 && <span style={{fontSize:'.7rem',color:T.muted}}>🖼{p.images?.length}</span>}
                      {(p.pdfs?.length||0)>0   && <span style={{fontSize:'.7rem',color:T.muted}}>📄{p.pdfs?.length}</span>}
                      <span style={{fontSize:'.78rem',color:T.text2,fontWeight:600}}>→</span>
                    </div>
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