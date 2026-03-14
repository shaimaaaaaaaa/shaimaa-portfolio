'use client';
import { useState } from 'react';
import Link from 'next/link';
import { T } from '../lib/constants';
import type { Lang, LangData, Course, Article } from '../lib/constants';
import ContactForm from './ContactForm';

// ═══════════════════════════════
//  EDUCATION
// ═══════════════════════════════
interface EduItem { degree:string; school:string; period:string; note:string; imageUrl?:string; }
interface EducationProps { lang: Lang; }

export function EducationSection({ lang }: EducationProps) {
  const [edu, setEdu] = useState<EduItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useState(() => {
    if (loaded) return;
    import('../lib/firebase').then(({ db }) => {
      import('firebase/firestore').then(({ doc, getDoc }) => {
        getDoc(doc(db, 'about', 'main')).then(d => {
          if (d.exists() && d.data().edu?.length) setEdu(d.data().edu);
          setLoaded(true);
        });
      });
    });
  });

  const eyebrow: React.CSSProperties = {
    fontSize:'.72rem', letterSpacing:5, textTransform:'uppercase',
    color:T.rose, fontFamily:'Playfair Display,serif',
    display:'block', marginBottom:'.65rem',
  };
  const rule: React.CSSProperties = {
    width:60, height:2, marginTop:'1rem',
    background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`,
  };

  const title   = lang==='ar' ? 'التعليم'   : 'Education';
  const span    = lang==='ar' ? 'والتدريب'  : '& Training';
  const tag     = 'academic background';
  const viewAll = lang==='ar' ? 'عرض التفاصيل ←' : 'View Full Details →';

  if (!loaded || edu.length === 0) return null;

  return (
    <section className="section-pad" style={{padding:'7rem 3rem',background:T.bg2}}>
      <div style={{maxWidth:1050,margin:'0 auto'}}>
        <div style={{marginBottom:'3rem',display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <span style={eyebrow}>{tag}</span>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.8rem,4vw,2.4rem)',fontWeight:900,color:T.white}}>
              {title} <span style={{color:T.gold,fontStyle:'italic'}}>{span}</span>
            </h2>
            <div style={rule}/>
          </div>
          <Link href="/about" className="link-hover">{viewAll}</Link>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {edu.map((e,i)=>(
            <div key={i} className="edu-card" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.25rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem'}}>
              <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                {e.imageUrl && (
                  <img src={e.imageUrl} alt={e.school}
                    style={{width:44,height:44,objectFit:'contain',borderRadius:8,background:'rgba(255,255,255,0.06)',padding:3,flexShrink:0}}/>
                )}
                <div>
                  <div style={{fontFamily:'Playfair Display,serif',fontSize:'1rem',fontWeight:700,color:T.white,marginBottom:'.2rem',lineHeight:1.3}}>{e.degree}</div>
                  <div style={{fontSize:'.84rem',color:T.gold,fontWeight:600,marginBottom:'.1rem'}}>{e.school}</div>
                  {e.note && <div style={{fontSize:'.72rem',color:T.rose,letterSpacing:1}}>{e.note}</div>}
                </div>
              </div>
              <div style={{fontSize:'.76rem',color:T.muted,flexShrink:0,whiteSpace:'nowrap'}}>{e.period}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════
//  COURSES
// ═══════════════════════════════
interface CoursesProps { L: LangData; lang: Lang; courses: Course[]; showViewAll?: boolean; }

export function CoursesSection({ L, lang, courses, showViewAll = false }: CoursesProps) {
  const eyebrow: React.CSSProperties = {fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'};
  const rule: React.CSSProperties = {width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`};
  const viewAllLabel = lang === 'ar' ? 'عرض كل الكورسات' : 'View All Courses';

  return (
    <section id="courses" className="section-pad" style={{padding:'7rem 3rem',background:T.bg}}>
      <div style={{maxWidth:1050,margin:'0 auto'}}>
        <div style={{marginBottom:'3rem',display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <span style={eyebrow}>{L.courseSub}</span>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.8rem,4vw,2.4rem)',fontWeight:900,color:T.white}}>
              {L.courseTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.courseSpan}</span>
            </h2>
            <div style={rule}/>
          </div>
          {showViewAll && <Link href="/courses" className="link-hover">{viewAllLabel} →</Link>}
        </div>
        <div className="cards-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1.5rem'}}>
          {courses.length===0 && <p style={{color:T.muted,gridColumn:'1/-1',textAlign:'center',padding:'3rem'}}>{L.noCourse}</p>}
          {courses.map((c,idx) => (
            <Link key={c.id} href={`/courses/${c.id}`} className="card-hover"
              style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.75rem',textDecoration:'none',display:'flex',flexDirection:'column'}}>
              {c.imageUrl ? (
                <div style={{width:'100%',height:140,borderRadius:10,overflow:'hidden',marginBottom:'1.1rem',border:`1px solid ${T.border}`}}>
                  <img src={c.imageUrl} alt={c.title} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                </div>
              ) : (
                <div style={{width:48,height:48,borderRadius:12,background:'rgba(138,31,50,0.35)',border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.1rem'}}>
                  <span style={{fontFamily:'Playfair Display,serif',color:T.goldL,fontWeight:700,fontSize:'1rem'}}>{String(idx+1).padStart(2,'0')}</span>
                </div>
              )}
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.05rem',fontWeight:700,color:T.white,marginBottom:'.5rem',lineHeight:1.4}}>{c.title}</div>
              <div style={{fontSize:'.85rem',color:T.text2,lineHeight:1.9,flex:1,marginBottom:'1.1rem'}}>{c.desc}</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'.85rem',borderTop:`1px solid rgba(200,158,72,0.12)`}}>
                <span style={{fontSize:'.78rem',color:T.muted}}>{c.lessons?.length||0} {L.lessons}</span>
                <span style={{fontSize:'.82rem',color:T.gold,fontWeight:700}}>{L.startBtn}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════
//  ARTICLES
// ═══════════════════════════════
interface ArticlesProps { L: LangData; lang: Lang; articles: Article[]; }

export function ArticlesSection({ L, lang, articles }: ArticlesProps) {
  const eyebrow: React.CSSProperties = {fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'};
  const rule: React.CSSProperties = {width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`};

  function formatDate(a: Article) {
    if (!a.createdAt?.seconds) return '';
    return new Date(a.createdAt.seconds*1000).toLocaleDateString(lang==='ar'?'ar-AE':'en-GB',{day:'numeric',month:'short',year:'numeric'});
  }

  return (
    <section id="articles" className="section-pad" style={{padding:'7rem 3rem',background:T.bg2}}>
      <div style={{maxWidth:1050,margin:'0 auto'}}>
        <div className="section-header-row" style={{marginBottom:'3rem',display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <span style={eyebrow}>{L.articleSub}</span>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.8rem,4vw,2.4rem)',fontWeight:900,color:T.white}}>
              {L.articleTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.articleSpan}</span>
            </h2>
            <div style={rule}/>
          </div>
          <Link href="/articles" className="link-hover">{L.viewAll} →</Link>
        </div>
        {articles.length===0 && <p style={{color:T.muted,textAlign:'center',padding:'3rem'}}>{L.noArticles}</p>}
        <div className="cards-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:'1.5rem'}}>
          {articles.map(a=>(
            <Link key={a.id} href={`/articles/${a.id}`} className="card-hover"
              style={{textDecoration:'none',display:'flex',flexDirection:'column',background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden'}}>
              <div style={{height:120,background:`linear-gradient(135deg,${T.burg},#1a0c10)`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,backgroundSize:'35px 35px',opacity:.3}}/>
                <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.8rem',color:'rgba(255,255,255,0.12)',fontWeight:900,position:'relative',zIndex:1}}>♥</span>
              </div>
              <div style={{padding:'1.25rem',flex:1,display:'flex',flexDirection:'column'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.6rem'}}>
                  <span style={{fontSize:'.65rem',color:T.rose,letterSpacing:2,textTransform:'uppercase',fontFamily:'Playfair Display,serif'}}>{a.category}</span>
                  <span style={{fontSize:'.72rem',color:T.muted}}>{a.readTime} {L.minRead}</span>
                </div>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'1rem',fontWeight:700,color:T.white,marginBottom:'.45rem',lineHeight:1.4}}>
                  {lang==='ar'?a.title_ar||a.title:a.title}
                </div>
                <div style={{fontSize:'.82rem',color:T.text2,lineHeight:1.85,flex:1,marginBottom:'.9rem'}}>
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
    </section>
  );
}

// ═══════════════════════════════
//  CONTACT
// ═══════════════════════════════
interface ContactProps { L: LangData; lang: Lang; }

export function ContactSection({ L, lang }: ContactProps) {
  const eyebrow: React.CSSProperties = {fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'};
  const social = [
    ['Email','mailto:shaimaakalel@gmail.com'],
    ['LinkedIn','https://www.linkedin.com/in/shaimaakalel'],
    ['GitHub','https://github.com/shaimaaaaaaaa'],
    ['Instagram','https://instagram.com/shaimaa_agile'],
    ['YouTube','https://youtube.com/@ShaimaasAgileStories'],
    ['TikTok','https://tiktok.com/@shaimaa_agile'],
  ];

  return (
    <section id="contact" className="section-pad" style={{padding:'7rem 3rem',background:T.bg}}>
      <div style={{maxWidth:700,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'3rem'}}>
          <span style={eyebrow}>{L.ctaSub}</span>
          <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.8rem,4vw,2.4rem)',fontWeight:900,color:T.white,marginBottom:'1rem'}}>
            {L.ctaTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.ctaSpan}</span>
          </h2>
          <div style={{width:60,height:2,margin:'1rem auto 0',background:`linear-gradient(90deg,${T.gold},transparent)`}}/>
          <p style={{color:T.text2,lineHeight:2.1,fontSize:'clamp(.88rem,2.5vw,1rem)',marginTop:'1.25rem',whiteSpace:'pre-line'}}>{L.ctaP}</p>
        </div>
        <div className="social-grid" style={{display:'flex',justifyContent:'center',gap:'.75rem',flexWrap:'wrap',marginBottom:'2.5rem'}}>
          {social.map(([label,href]) => (
            <a key={label} href={href} target="_blank" rel="noopener" className="social-btn"
              style={{display:'flex',alignItems:'center',gap:'.5rem',padding:'.7rem 1.25rem',background:'rgba(138,31,50,0.18)',border:`1px solid ${T.border}`,borderRadius:10,color:T.text,textDecoration:'none',fontSize:'.88rem',fontWeight:600}}>
              {label}
            </a>
          ))}
        </div>
        <ContactForm lang={lang}/>
      </div>
    </section>
  );
}

// ═══════════════════════════════
//  FOOTER
// ═══════════════════════════════
interface FooterProps { L: LangData; }

export function Footer({ L: _L }: FooterProps) {
  const [clicks, setClicks] = useState(0);
  const [timer,  setTimer]  = useState<ReturnType<typeof setTimeout>|null>(null);

  function handleHeartClick() {
    const next = clicks + 1;
    setClicks(next);
    if (timer) clearTimeout(timer);
    const t = setTimeout(() => setClicks(0), 1500);
    setTimer(t);
    if (next >= 3) {
      setClicks(0);
      window.location.href = '/admin/login';
    }
  }

  return (
    <>
      <style>{`
        /* ── view-all links ── */
        .link-hover {
          font-size:.88rem; color:#c9a048; font-weight:700;
          text-decoration:none;
          padding:.38rem .85rem;
          border:1px solid transparent;
          border-radius:20px;
          transition: color .2s, border-color .2s, background .2s, box-shadow .2s;
        }
        .link-hover:hover {
          color:#0e0608 !important;
          background:#c9a048;
          border-color:#c9a048;
          box-shadow: 0 4px 18px rgba(201,160,72,0.45);
        }

        /* ── cards ── */
        .card-hover {
          transition: transform .28s, border-color .28s, box-shadow .28s;
        }
        .card-hover:hover {
          transform: translateY(-7px) scale(1.01);
          border-color: #c9a048 !important;
          box-shadow: 0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,160,72,0.3);
        }

        /* ── edu rows ── */
        .edu-card {
          transition: border-color .22s, background .22s, box-shadow .22s;
        }
        .edu-card:hover {
          border-color: #c9a048 !important;
          background: rgba(201,160,72,0.07) !important;
          box-shadow: 0 4px 24px rgba(201,160,72,0.15);
        }

        /* ── social buttons ── */
        .social-btn {
          transition: border-color .2s, color .2s, background .2s, transform .18s, box-shadow .2s;
        }
        .social-btn:hover {
          border-color: #c9a048 !important;
          color: #0e0608 !important;
          background: #c9a048 !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 22px rgba(201,160,72,0.4);
        }
      `}</style>

      <footer style={{textAlign:'center',padding:'2rem 1.25rem',borderTop:`1px solid ${T.border}`,fontSize:'.8rem',color:T.muted,lineHeight:1.8}}>
        Made with{' '}
        <span onClick={handleHeartClick} style={{color:T.gold,cursor:'pointer',fontSize:clicks>0?'1.1rem':'1rem',transition:'font-size .15s'}}>♥</span>
        {' '}by{' '}
        <span style={{color:T.goldL,fontWeight:700}}>Shaimaa Kalel</span>
        {' '}· Software Engineer · Content Creator · Abu Dhabi · 2026
      </footer>
    </>
  );
}