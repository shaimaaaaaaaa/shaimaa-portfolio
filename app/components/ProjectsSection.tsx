'use client';
import { useState } from 'react';
import Link from 'next/link';
import { T } from '../lib/constants';
import type { Lang, LangData, Project } from '../lib/constants';

interface Props { L: LangData; lang: Lang; projects: Project[]; showViewAll?: boolean; }

export default function ProjectsSection({ L, lang, projects, showViewAll = false }: Props) {
  const [filter, setFilter] = useState('all');
  const filtered = filter==='all' ? projects : projects.filter(p=>p.category===filter);

  const eyebrow: React.CSSProperties = {fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'};
  const rule: React.CSSProperties    = {width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`};

  return (
    <>
      <style>{`
        .proj-section { padding:7rem 3rem !important; }
        .proj-grid    { grid-template-columns:repeat(auto-fill,minmax(300px,1fr)) !important; }

        /* project card */
        .proj-card {
          background:${T.card};
          border:1px solid ${T.border};
          border-radius:16px;
          overflow:hidden;
          display:flex;
          flex-direction:column;
          transition:transform .28s, border-color .28s, box-shadow .28s;
        }
        .proj-card:hover {
          transform:translateY(-6px) scale(1.01);
          border-color:#c9a048 !important;
          box-shadow:0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,160,72,0.25);
        }

        /* filter buttons */
        .proj-filter-btn {
          padding:.5rem 1.1rem;
          border-radius:24px;
          font-size:.85rem;
          font-weight:600;
          transition:background .18s, border-color .18s, color .18s, box-shadow .18s;
        }
        .proj-filter-btn:not(.active):hover {
          background:rgba(201,160,72,0.12) !important;
          border-color:#c9a048 !important;
          color:#e2bb60 !important;
          box-shadow:0 0 0 2px rgba(201,160,72,0.2);
        }
        .proj-filter-btn.active {
          background:rgba(138,31,50,0.5) !important;
          border-color:${T.burg} !important;
          color:#ffffff !important;
        }

        /* github / demo links inside card */
        .proj-link {
          font-size:.8rem;
          color:${T.gold};
          text-decoration:none;
          font-weight:700;
          padding:.25rem .6rem;
          border-radius:6px;
          border:1px solid transparent;
          transition:background .18s, border-color .18s, color .18s;
        }
        .proj-link:hover {
          background:rgba(201,160,72,0.12);
          border-color:rgba(201,160,72,0.4);
          color:#e2bb60;
        }

        @media(max-width:768px){
          .proj-section { padding:4rem 1.25rem !important; }
          .proj-grid    { grid-template-columns:1fr !important; gap:1rem !important; }
          .proj-filters { gap:.4rem !important; }
          .proj-filter-btn { padding:.4rem .75rem !important; font-size:.78rem !important; }
          .proj-header-row { flex-direction:column !important; align-items:flex-start !important; gap:.75rem !important; }
        }
      `}</style>

      <section id="projects" className="proj-section section-pad" style={{background:T.bg2}}>
        <div style={{maxWidth:1050,margin:'0 auto'}}>

          <div className="proj-header-row" style={{marginBottom:'3rem',display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:'1rem'}}>
            <div>
              <span style={eyebrow}>{L.projSub}</span>
              <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.8rem,4vw,2.4rem)',fontWeight:900,color:T.white}}>
                {L.projTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.projSpan}</span>
              </h2>
              <div style={rule}/>
            </div>
            {showViewAll && (
              <Link href="/projects" className="link-hover">{L.projViewAll}</Link>
            )}
          </div>

          {!showViewAll && (
            <div className="proj-filters" style={{display:'flex',gap:'.55rem',flexWrap:'wrap',marginBottom:'2rem'}}>
              {L.filters.map(([v,l]) => (
                <button key={v} onClick={()=>setFilter(v)}
                  className={`proj-filter-btn${filter===v?' active':''}`}
                  style={{background:filter===v?'rgba(138,31,50,0.5)':'transparent',border:`1px solid ${filter===v?T.burg:T.border}`,color:filter===v?T.white:T.text2}}>
                  {l}
                </button>
              ))}
            </div>
          )}

          <div className="proj-grid" style={{display:'grid',gap:'1.5rem'}}>
            {filtered.length===0 && (
              <p style={{color:T.muted,gridColumn:'1/-1',textAlign:'center',padding:'3rem'}}>{L.noProj}</p>
            )}
            {filtered.map(p => (
              <div key={p.id} className="proj-card">
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
                    {p.github && <a href={p.github} target="_blank" rel="noopener" className="proj-link">{L.githubLbl}</a>}
                    {p.demo   && <a href={p.demo}   target="_blank" rel="noopener" className="proj-link">{L.demoLbl}</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}