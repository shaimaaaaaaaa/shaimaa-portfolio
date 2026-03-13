'use client';
import { useState } from 'react';
import Link from 'next/link';
import { T } from '../lib/constants';
import type { Lang, LangData, Course, Article } from '../lib/constants';
import ContactForm from './ContactForm';

// ═══════════════════════════════
//  COURSES
// ═══════════════════════════════
interface CoursesProps { L: LangData; lang: Lang; courses: Course[]; }

export function CoursesSection({ L, courses }: CoursesProps) {
  const eyebrow: React.CSSProperties = {fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'};

  return (
    <section id="courses" className="section-pad" style={{padding:'7rem 3rem',background:T.bg}}>
      <div style={{maxWidth:1050,margin:'0 auto'}}>
        <div style={{marginBottom:'3rem'}}>
          <span style={eyebrow}>{L.courseSub}</span>
          <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.8rem,4vw,2.4rem)',fontWeight:900,color:T.white}}>
            {L.courseTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.courseSpan}</span>
          </h2>
          <div style={{width:60,height:2,marginTop:'1rem',background:`linear-gradient(90deg,${T.gold},transparent)`}}/>
        </div>
        <div className="cards-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1.5rem'}}>
          {courses.length===0 && <p style={{color:T.muted,gridColumn:'1/-1',textAlign:'center',padding:'3rem'}}>{L.noCourse}</p>}
          {courses.map((c,idx) => (
            <Link key={c.id} href={`/courses/${c.id}`} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.75rem',textDecoration:'none',display:'flex',flexDirection:'column',transition:'all .3s'}}
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
  const rule: React.CSSProperties    = {width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`};

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
          <Link href="/articles" style={{fontSize:'.88rem',color:T.gold,fontWeight:700,textDecoration:'none'}}>{L.viewAll}</Link>
        </div>
        {articles.length===0 && <p style={{color:T.muted,textAlign:'center',padding:'3rem'}}>{L.noArticles}</p>}
        <div className="cards-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:'1.5rem'}}>
          {articles.map(a=>(
            <Link key={a.id} href={`/articles/${a.id}`} style={{textDecoration:'none',display:'flex',flexDirection:'column',background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden',transition:'all .3s'}}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.transform='translateY(-6px)';el.style.borderColor='rgba(201,160,72,0.5)';}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.transform='translateY(0)';el.style.borderColor=T.border;}}>
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
            <a key={label} href={href} target="_blank" rel="noopener"
              style={{display:'flex',alignItems:'center',gap:'.5rem',padding:'.7rem 1.25rem',background:'rgba(138,31,50,0.18)',border:`1px solid ${T.border}`,borderRadius:10,color:T.text,textDecoration:'none',fontSize:'.88rem',fontWeight:600,transition:'all .25s'}}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.borderColor=T.gold;el.style.color=T.goldL;}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.borderColor=T.border;el.style.color=T.text;}}>
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

export function Footer({ L }: FooterProps) {
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
    <footer style={{textAlign:'center',padding:'2rem 1.25rem',borderTop:`1px solid ${T.border}`,fontSize:'.8rem',color:T.muted,lineHeight:1.8}}>
      Made with{' '}
      <span
        onClick={handleHeartClick}
        style={{color:T.gold, cursor:'pointer', fontSize: clicks > 0 ? '1.1rem' : '1rem', transition:'font-size .15s'}}
        title=""
      >
        ♥
      </span>
      {' '}by{' '}
      <span style={{color:T.goldL,fontWeight:700}}>Shaimaa Kalel</span>
      {' '}· {L.footTxt}
    </footer>
  );
}