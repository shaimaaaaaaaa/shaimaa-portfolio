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
//  FOOTER — 3 columns
// ═══════════════════════════════
interface FooterProps { L: LangData; lang?: Lang; }

export function Footer({ L: _L, lang = 'en' }: FooterProps) {
  const [clicks, setClicks] = useState(0);
  const [timer,  setTimer]  = useState<ReturnType<typeof setTimeout>|null>(null);

  function handleHeartClick() {
    const next = clicks + 1;
    setClicks(next);
    if (timer) clearTimeout(timer);
    const t = setTimeout(() => setClicks(0), 1500);
    setTimer(t);
    if (next >= 3) { setClicks(0); window.location.href = '/admin/login'; }
  }

  const quickLinks = lang === 'ar'
    ? [['/','الرئيسية'],['/about','عني'],['/projects','المشاريع'],['/courses','الكورسات'],['/articles','المقالات'],['/#contact','تواصل']]
    : [['/',  'Home'],['/about','About'],['/projects','Projects'],['/courses','Courses'],['/articles','Articles'],['/#contact','Contact']];

  const social = [
    { label:'LinkedIn', href:'https://www.linkedin.com/in/shaimaakalel',       icon:'in' },
    { label:'GitHub',   href:'https://github.com/shaimaaaaaaaa',               icon:'gh' },
    { label:'Instagram',href:'https://instagram.com/shaimaa_agile',            icon:'ig' },
    { label:'YouTube',  href:'https://youtube.com/@ShaimaasAgileStories',      icon:'yt' },
    { label:'TikTok',   href:'https://tiktok.com/@shaimaa_agile',              icon:'tt' },
    { label:'Email',    href:'mailto:shaimaakalel@gmail.com',                  icon:'✉'  },
  ];

  const bio = lang === 'ar'
    ? 'مهندسة برمجيات وصانعة محتوى من أبوظبي. أجمع بين التقنية وعقلية Agile لبناء أنظمة تخدم الناس.'
    : 'Software Engineer & Content Creator based in Abu Dhabi. Combining technical skills with an Agile mindset.';

  const colTitle = (txt: string) => (
    <div style={{fontFamily:'Playfair Display,serif',fontSize:'.78rem',fontWeight:700,color:T.gold,letterSpacing:3,textTransform:'uppercase',marginBottom:'1.25rem'}}>{txt}</div>
  );

  return (
    <>
      <style>{`
        .link-hover {
          font-size:.88rem; color:#c9a048; font-weight:700;
          text-decoration:none; padding:.38rem .85rem;
          border:1px solid transparent; border-radius:20px; display:inline-block;
          transition:color .2s, border-color .2s, background .2s, box-shadow .2s;
        }
        .link-hover:hover { color:#0e0608 !important; background:#c9a048; border-color:#c9a048; box-shadow:0 4px 18px rgba(201,160,72,0.45); }
        .card-hover { transition:transform .28s, border-color .28s, box-shadow .28s !important; }
        .card-hover:hover { transform:translateY(-7px) scale(1.01) !important; border-color:#c9a048 !important; box-shadow:0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,160,72,0.3) !important; }
        .edu-card { transition:border-color .22s, background .22s, box-shadow .22s !important; }
        .edu-card:hover { border-color:#c9a048 !important; background:rgba(201,160,72,0.07) !important; box-shadow:0 4px 24px rgba(201,160,72,0.15) !important; }
        .social-btn { transition:border-color .2s, color .2s, background .2s, transform .18s, box-shadow .2s !important; }
        .social-btn:hover { border-color:#c9a048 !important; color:#0e0608 !important; background:#c9a048 !important; transform:translateY(-3px) !important; box-shadow:0 8px 22px rgba(201,160,72,0.4) !important; }

        .footer-quick-link {
          color:#8a7268; text-decoration:none; font-size:.88rem; font-weight:500;
          padding:.3rem 0; display:block;
          transition:color .2s, padding-left .2s;
        }
        .footer-quick-link:hover { color:#c9a048 !important; padding-left:.4rem; }

        .footer-social-btn {
          display:inline-flex; align-items:center; justify-content:center;
          width:38px; height:38px; border-radius:10px;
          background:rgba(255,255,255,0.04); border:1px solid rgba(200,158,72,0.2);
          color:#8a7268; font-size:.78rem; font-weight:700; text-decoration:none;
          transition:background .2s, border-color .2s, color .2s, transform .18s, box-shadow .2s;
        }
        .footer-social-btn:hover {
          background:#c9a048 !important; border-color:#c9a048 !important;
          color:#0e0608 !important; transform:translateY(-3px);
          box-shadow:0 8px 20px rgba(201,160,72,0.4);
        }

        .footer-cols {
          display:grid; grid-template-columns:2fr 1fr 1fr; gap:3rem;
        }
        @media(max-width:768px){
          .footer-cols { grid-template-columns:1fr 1fr !important; gap:2rem !important; }
          .footer-cols > div:first-child { grid-column:1/-1; }
        }
        @media(max-width:480px){
          .footer-cols { grid-template-columns:1fr !important; }
        }
      `}</style>

      <footer style={{background:T.bg2,borderTop:`1px solid ${T.border}`,paddingTop:'3.5rem'}}>
        <div style={{maxWidth:1050,margin:'0 auto',padding:'0 2rem 2.5rem'}}>

          {/* 3 COLUMNS */}
          <div className="footer-cols">

            {/* col 1 — brand + bio + social icons */}
            <div>
              <a href="/" style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:T.goldL,fontWeight:700,letterSpacing:1,textDecoration:'none',display:'block',marginBottom:'1rem'}}>
                ♥ Shaimaa Kalel
              </a>
              <p style={{fontSize:'.88rem',color:T.muted,lineHeight:1.9,marginBottom:'1.5rem',maxWidth:280}}>{bio}</p>
              <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
                {social.map(s=>(
                  <a key={s.label} href={s.href} target="_blank" rel="noopener"
                    className="footer-social-btn" title={s.label}>{s.icon}</a>
                ))}
              </div>
            </div>

            {/* col 2 — quick links */}
            <div>
              {colTitle(lang==='ar'?'روابط سريعة':'Quick Links')}
              <div style={{display:'flex',flexDirection:'column',gap:'.1rem'}}>
                {quickLinks.map(([href,label])=>(
                  <a key={href} href={href} className="footer-quick-link">{label}</a>
                ))}
              </div>
            </div>

            {/* col 3 — contact info */}
            <div>
              {colTitle(lang==='ar'?'تواصل':'Contact')}
              <div style={{display:'flex',flexDirection:'column',gap:'.85rem'}}>
                <div>
                  <div style={{fontSize:'.78rem',color:T.text2,fontWeight:600,marginBottom:'.25rem'}}>📍 {lang==='ar'?'الموقع':'Location'}</div>
                  <div style={{fontSize:'.85rem',color:T.muted}}>Abu Dhabi, UAE</div>
                </div>
                <div>
                  <div style={{fontSize:'.78rem',color:T.text2,fontWeight:600,marginBottom:'.25rem'}}>✉ Email</div>
                  <a href="mailto:shaimaakalel@gmail.com" className="footer-quick-link" style={{padding:0,fontSize:'.82rem'}}>
                    shaimaakalel@gmail.com
                  </a>
                </div>
                <div>
                  <div style={{fontSize:'.78rem',color:T.text2,fontWeight:600,marginBottom:'.25rem'}}>🎓 {lang==='ar'?'الجامعة':'University'}</div>
                  <div style={{fontSize:'.85rem',color:T.muted}}>University of Bolton</div>
                </div>
              </div>
            </div>
          </div>

          {/* DIVIDER */}
          <div style={{height:1,background:`linear-gradient(90deg,transparent,${T.border},transparent)`,margin:'2.5rem 0 1.5rem'}}/>

          {/* BOTTOM ROW */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
            <p style={{fontSize:'.78rem',color:T.muted}}>
              © 2026 <span style={{color:T.text2,fontWeight:600}}>Shaimaa Kalel</span>
              {' '}· {lang==='ar'?'جميع الحقوق محفوظة':'All rights reserved'}
            </p>
            <p style={{fontSize:'.75rem',color:T.muted}}>
              Made with{' '}
              <span onClick={handleHeartClick}
                style={{color:T.gold,cursor:'pointer',fontSize:clicks>0?'1.1rem':'1rem',transition:'font-size .15s'}}>♥</span>
              {' '}by Shaimaa Kalel
            </p>
          </div>

        </div>
      </footer>
    </>
  );
}