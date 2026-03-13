'use client';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LANG, T } from '../../lib/constants';
import type { Lang, Project } from '../../lib/constants';
import Navbar from '../../components/Navbar';
import { useParams } from 'next/navigation';

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [project,  setProject]  = useState<Project|null>(null);
  const [loading,  setLoading]  = useState(true);
  const [lang,     setLang]     = useState<Lang>('en');
  const [mounted,  setMounted]  = useState(false);
  const [mainImg,  setMainImg]  = useState<string>('');
  const [lightbox, setLightbox] = useState<string|null>(null);

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
    if (!id) return;
    getDoc(doc(db,'projects',id)).then(d => {
      if (d.exists()) {
        const p = {id:d.id,...d.data()} as Project;
        setProject(p);
        setMainImg(p.imageUrl || p.images?.[0] || '');
      }
      setLoading(false);
    });
  }, [id]);

  const L = LANG[lang];

  if (!mounted || loading) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  if (!project) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.muted}}>Project not found.</p>
    </main>
  );

  const images = project.images?.length ? project.images : (project.imageUrl ? [project.imageUrl] : []);
  const pdfs   = project.pdfs || [];
  const desc   = lang==='ar' ? project.desc_ar||project.desc : project.desc_en||project.desc;

  return (
    <>
      <style>{`
        .lightbox-overlay { position:fixed;inset:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:1rem; }
        .lightbox-img     { max-width:90vw;max-height:88vh;border-radius:12px;object-fit:contain; }
        .thumb            { cursor:pointer;border-radius:8px;overflow:hidden;border:2px solid transparent;transition:border-color .2s; }
        .thumb:hover      { border-color:rgba(201,160,72,0.5); }
        .thumb.active     { border-color:${T.gold}; }

        .detail-wrap   { max-width:1050px;margin:0 auto;padding:8rem 2rem 5rem; }
        .detail-grid   { display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start; }
        .thumb-grid    { display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:.5rem; }

        @media(max-width:768px){
          .detail-wrap  { padding:6rem 1.25rem 4rem; }
          .detail-grid  { grid-template-columns:1fr !important; gap:2rem !important; }
          .thumb-grid   { grid-template-columns:repeat(auto-fill,minmax(70px,1fr)); }
        }
      `}</style>

      {lightbox && (
        <div className="lightbox-overlay" onClick={()=>setLightbox(null)}>
          <img src={lightbox} alt="full" className="lightbox-img"/>
        </div>
      )}

      <main style={{background:T.bg,color:T.text,minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir}}>
        <Navbar lang={lang} L={L} onLangChange={setLang}/>

        <div className="detail-wrap">
          <a href="/projects" style={{display:'inline-flex',alignItems:'center',gap:'.4rem',fontSize:'.85rem',color:T.text2,textDecoration:'none',marginBottom:'2rem',fontWeight:600}}
            onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)} onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>
            ← {lang==='ar'?'كل المشاريع':'All Projects'}
          </a>

          <div className="detail-grid">

            {/* IMAGES */}
            <div>
              {mainImg ? (
                <div style={{borderRadius:16,overflow:'hidden',border:`1px solid ${T.border}`,marginBottom:'1rem',cursor:'zoom-in',background:T.bg}}
                  onClick={()=>setLightbox(mainImg)}>
                  <img src={mainImg} alt={project.title} style={{width:'100%',maxHeight:320,objectFit:'contain',display:'block',background:T.bg}}/>
                </div>
              ) : (
                <div style={{borderRadius:16,background:`linear-gradient(135deg,${T.burg},#1a0c10)`,aspectRatio:'16/10',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem',border:`1px solid ${T.border}`}}>
                  <span style={{fontFamily:'Playfair Display,serif',fontSize:'2rem',color:'rgba(255,255,255,0.1)',fontWeight:900}}>♥</span>
                </div>
              )}

              {images.length > 1 && (
                <div className="thumb-grid">
                  {images.map((url,i)=>(
                    <div key={i} className={`thumb ${url===mainImg?'active':''}`} onClick={()=>setMainImg(url)}>
                      <img src={url} alt={`thumb-${i}`} style={{width:'100%',height:60,objectFit:'cover',display:'block'}}/>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DETAILS */}
            <div>
              <div style={{fontSize:'.65rem',color:T.rose,letterSpacing:3,textTransform:'uppercase',fontFamily:'Playfair Display,serif',marginBottom:'.5rem'}}>{project.category}</div>
              <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.5rem,5vw,2.2rem)',fontWeight:900,color:T.white,marginBottom:'.75rem',lineHeight:1.3}}>{project.title}</h1>

              <div style={{display:'flex',flexWrap:'wrap',gap:'.4rem',marginBottom:'1.5rem'}}>
                {project.stack?.split(',').map(s=>s.trim()).filter(Boolean).map(s=>(
                  <span key={s} style={{padding:'.3rem .75rem',background:'rgba(201,160,72,0.08)',border:`1px solid ${T.border}`,borderRadius:20,fontSize:'.78rem',color:T.gold,fontWeight:600}}>{s}</span>
                ))}
              </div>

              <p style={{fontSize:'.92rem',color:T.text2,lineHeight:2,marginBottom:'2rem'}}>{desc}</p>

              <div style={{display:'flex',gap:'1rem',marginBottom:'2rem',flexWrap:'wrap'}}>
                {project.github && (
                  <a href={project.github} target="_blank" rel="noopener"
                    style={{display:'inline-flex',alignItems:'center',gap:'.5rem',padding:'.75rem 1.5rem',background:'rgba(255,255,255,0.05)',border:`1px solid ${T.border}`,borderRadius:10,color:T.text,textDecoration:'none',fontSize:'.88rem',fontWeight:700,transition:'all .2s'}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;e.currentTarget.style.color=T.goldL;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.text;}}>
                    GitHub ↗
                  </a>
                )}
                {project.demo && (
                  <a href={project.demo} target="_blank" rel="noopener"
                    style={{display:'inline-flex',alignItems:'center',gap:'.5rem',padding:'.75rem 1.5rem',background:`linear-gradient(135deg,rgba(138,31,50,0.5),rgba(74,15,28,0.5))`,border:`1px solid rgba(138,31,50,0.5)`,borderRadius:10,color:T.white,textDecoration:'none',fontSize:'.88rem',fontWeight:700}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=T.gold;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(138,31,50,0.5)';}}>
                    Live Demo ↗
                  </a>
                )}
              </div>

              {pdfs.length > 0 && (
                <div>
                  <h3 style={{fontFamily:'Playfair Display,serif',fontSize:'1rem',color:T.white,fontWeight:700,marginBottom:'1rem'}}>
                    📄 {lang==='ar'?'وثائق المشروع':'Project Documents'}
                  </h3>
                  <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
                    {pdfs.map((pdf,i)=>(
                      <a key={i} href={pdf.url} target="_blank" rel="noopener"
                        style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.75rem 1rem',background:'rgba(255,255,255,0.03)',border:`1px solid ${T.border}`,borderRadius:10,textDecoration:'none',transition:'border-color .2s'}}
                        onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(201,160,72,0.4)')}
                        onMouseLeave={e=>(e.currentTarget.style.borderColor=T.border)}>
                        <span style={{fontSize:'1.1rem'}}>📄</span>
                        <span style={{fontSize:'.85rem',color:T.text2,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{pdf.name}</span>
                        <span style={{fontSize:'.75rem',color:T.gold,fontWeight:700,flexShrink:0}}>Download ↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
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