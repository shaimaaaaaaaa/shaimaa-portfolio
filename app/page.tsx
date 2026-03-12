'use client';
import { useEffect, useState } from 'react';
import { db } from './lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Link from 'next/link';
import ContactForm from './components/ContactForm';

interface Project { id:string; title:string; desc:string; desc_en:string; desc_ar:string; stack:string; category:string; github:string; demo:string; }
interface Course  { id:string; title:string; desc:string; category:string; lessons:[];}
interface Article { id:string; title:string; title_ar:string; excerpt:string; excerpt_ar:string; category:string; readTime:number; createdAt?:{seconds:number}; }

const T = {
  bg:'#0e0608', bg2:'#140a0c', card:'#1a0c10',
  burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60',
  rose:'#d07080',
  white:'#ffffff', text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)',
};

const LANG = {
  en: {
    dir:'ltr',
    navLinks:[['/about','About'],['#projects','Projects'],['#courses','Courses'],['/articles','Articles'],['#contact','Contact']] as [string,string][],
    langBtn:'العربية',
    eyebrow:'Software Engineer · Human-Centered Agility',
    hi:"Hello, I'm", name:'Shaimaa Kalel',
    bio:'Combining <b>Technical Skills</b> with an <b gold>Agile Mindset</b> to build real systems that serve real people. Passionate about creating healthier, more human tech teams.',
    btn1:'View Projects', btn2:'Get In Touch',
    stats:[['12+','Projects'],['8+','Certifications'],['3+','Years'],['2025','Graduating']] as [string,string][],
    projSub:'selected work', projTitle:'My', projSpan:'Projects',
    filters:[['all','All'],['web','Web Dev'],['agile','Agile'],['database','Database'],['desktop','Desktop'],['network','Network']] as [string,string][],
    noProj:'No projects yet.',
    courseSub:'learn with me', courseTitle:'Free', courseSpan:'Courses',
    noCourse:'Courses coming soon.',
    lessons:'lessons', startBtn:'Start Learning →',
    articleSub:'from the blog', articleTitle:'Latest', articleSpan:'Articles',
    noArticles:'No articles yet.',
    readMore:'Read More →', minRead:'min read', viewAll:'View All Articles →',
    ctaSub:'get in touch', ctaTitle:'Get In', ctaSpan:'Touch',
    ctaP:'Abu Dhabi, UAE · University of Bolton\nOpen to collaborations, opportunities, and conversations.',
    footTxt:'Software Engineer · Content Creator · Abu Dhabi · 2025',
    githubLbl:'GitHub →', demoLbl:'Live Demo →',
  },
  ar: {
    dir:'rtl',
    navLinks:[['/about','عني'],['#projects','المشاريع'],['#courses','الكورسات'],['/articles','المقالات'],['#contact','تواصل']] as [string,string][],
    langBtn:'English',
    eyebrow:'Software Engineer · Human-Centered Agility',
    hi:'مرحباً، أنا', name:'شيماء خليل',
    bio:'أجمع بين <b>Technical Skills</b> والـ <b gold>Agile Mindset</b> لأبني أنظمة حقيقية تخدم ناس حقيقيين. شغوفة ببناء فرق تقنية أكثر صحة وإنسانية.',
    btn1:'عرض المشاريع', btn2:'تواصل معي',
    stats:[['12+','مشروع'],['8+','شهادة'],['3+','سنوات'],['2025','تخرج']] as [string,string][],
    projSub:'selected work', projTitle:'', projSpan:'المشاريع',
    filters:[['all','الكل'],['web','Web Dev'],['agile','Agile'],['database','Database'],['desktop','Desktop'],['network','Network']] as [string,string][],
    noProj:'لا يوجد مشاريع بعد.',
    courseSub:'learn with me', courseTitle:'', courseSpan:'الكورسات',
    noCourse:'الكورسات قادمة قريباً.',
    lessons:'درس', startBtn:'ابدأ التعلم ←',
    articleSub:'من المدونة', articleTitle:'', articleSpan:'أحدث المقالات',
    noArticles:'لا توجد مقالات بعد.',
    readMore:'اقرأ المزيد ←', minRead:'دقيقة قراءة', viewAll:'عرض كل المقالات ←',
    ctaSub:'get in touch', ctaTitle:'', ctaSpan:'تواصل معي',
    ctaP:'أبوظبي، الإمارات · University of Bolton\nهل عندك فكرة أو فرصة تعاون؟ تواصل معي.',
    footTxt:'مهندسة برمجيات · صانعة محتوى · أبوظبي · 2025',
    githubLbl:'GitHub →', demoLbl:'Live Demo →',
  },
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [courses,  setCourses]  = useState<Course[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter,   setFilter]   = useState('all');
  const [lang,     setLang]     = useState<'en'|'ar'>('en');
  const [mounted,  setMounted]  = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lang') as 'en'|'ar';
    if (saved === 'ar' || saved === 'en') setLang(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('lang', lang);
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, mounted]);

  useEffect(() => {
    getDocs(collection(db,'projects')).then(s => setProjects(s.docs.map(d=>({id:d.id,...d.data()} as Project))));
    getDocs(collection(db,'courses')).then(s  => setCourses(s.docs.map(d=>({id:d.id,...d.data()} as Course))));
    getDocs(query(collection(db,'articles'), orderBy('createdAt','desc'), limit(3)))
      .then(s => setArticles(s.docs.map(d=>({id:d.id,...d.data()} as Article))))
      .catch(() => getDocs(collection(db,'articles')).then(s => setArticles(s.docs.map(d=>({id:d.id,...d.data()} as Article)).slice(0,3))));
  }, []);

  const L = LANG[lang];
  const filtered = filter==='all' ? projects : projects.filter(p=>p.category===filter);

  const eyebrow:React.CSSProperties = {fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'};
  const rule:React.CSSProperties    = {width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`};
  const h2base:React.CSSProperties  = {fontFamily:'Playfair Display,serif',fontSize:'clamp(1.8rem,4vw,2.4rem)',fontWeight:900,color:T.white};

  function bioHtml(raw:string) {
    return raw
      .replace(/<b gold>(.*?)<\/b>/g,`<strong style="color:${T.goldL};font-weight:700">$1</strong>`)
      .replace(/<b>(.*?)<\/b>/g,`<strong style="color:${T.white};font-weight:700">$1</strong>`);
  }

  function formatDate(a:Article) {
    if (!a.createdAt?.seconds) return '';
    return new Date(a.createdAt.seconds*1000).toLocaleDateString(lang==='ar'?'ar-AE':'en-GB',{day:'numeric',month:'short',year:'numeric'});
  }

  if (!mounted) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  return (
    <>
      {/* ══ GLOBAL RESPONSIVE CSS ══ */}
      <style>{`
        .nav-desktop { display:flex !important; }
        .nav-burger  { display:none !important; }
        @media(max-width:768px){
          .nav-desktop { display:none !important; }
          .nav-burger  { display:flex !important; }
          .hero-section { padding: 7rem 1.25rem 4rem !important; }
          .section-pad  { padding: 4rem 1.25rem !important; }
          .cards-grid   { grid-template-columns: 1fr !important; }
          .stats-row    { gap: 1.5rem !important; }
          .hero-btns    { flex-direction: column !important; align-items: center !important; }
          .hero-btns a  { width: 100% !important; max-width: 300px !important; text-align: center !important; }
          .filters-wrap { gap: .4rem !important; }
          .filters-wrap button { padding: .4rem .75rem !important; font-size: .78rem !important; }
          .social-grid  { flex-direction: column !important; }
          .social-grid a{ justify-content: center !important; }
          .section-header-row { flex-direction: column !important; align-items: flex-start !important; }
        }
        @media(min-width:769px) and (max-width:1024px){
          .cards-grid { grid-template-columns: repeat(2,1fr) !important; }
          .hero-section { padding: 8rem 2rem 5rem !important; }
          .section-pad  { padding: 5rem 2rem !important; }
        }
      `}</style>

      <main style={{background:T.bg,color:T.text,minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif"}}>

        {/* ══ NAV ══ */}
        <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:1000,background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`,boxShadow:'0 2px 40px rgba(0,0,0,0.8)'}}>
          <div style={{padding:'.9rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>

            {/* LOGO */}
            <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.15rem',color:T.goldL,fontWeight:700,letterSpacing:1,flexShrink:0}}>♥ Shaimaa Kalel</span>

            {/* DESKTOP LINKS */}
            <div className="nav-desktop" style={{gap:'1.5rem',alignItems:'center'}}>
              {L.navLinks.map(([h,l]) => (
                <a key={h} href={h} style={{color:T.text2,textDecoration:'none',fontSize:'.9rem',fontWeight:600,whiteSpace:'nowrap',transition:'color .2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)}
                  onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>{l}</a>
              ))}
              <button onClick={()=>setLang(lang==='en'?'ar':'en')}
                style={{padding:'.4rem .95rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:20,color:T.gold,fontSize:'.82rem',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>
                {L.langBtn}
              </button>
              <Link href="/admin/login" style={{padding:'.4rem .95rem',background:'rgba(138,31,50,0.3)',border:`1px solid rgba(138,31,50,0.5)`,borderRadius:20,color:T.rose,textDecoration:'none',fontSize:'.82rem',fontWeight:700,whiteSpace:'nowrap'}}>
                Admin
              </Link>
            </div>

            {/* HAMBURGER */}
            <button className="nav-burger" onClick={()=>setMenuOpen(!menuOpen)}
              style={{flexDirection:'column',gap:5,background:'none',border:'none',cursor:'pointer',padding:6,flexShrink:0}}>
              <span style={{width:22,height:2,background:menuOpen?T.goldL:T.text2,display:'block',transition:'all .3s',transform:menuOpen?'rotate(45deg) translate(5px,5px)':'none'}}/>
              <span style={{width:22,height:2,background:menuOpen?T.goldL:T.text2,display:'block',transition:'all .3s',opacity:menuOpen?0:1}}/>
              <span style={{width:22,height:2,background:menuOpen?T.goldL:T.text2,display:'block',transition:'all .3s',transform:menuOpen?'rotate(-45deg) translate(5px,-5px)':'none'}}/>
            </button>
          </div>

          {/* MOBILE MENU */}
          {menuOpen && (
            <div style={{borderTop:`1px solid ${T.border}`,padding:'1rem 1.5rem 1.5rem',display:'flex',flexDirection:'column',gap:'.65rem'}}>
              {L.navLinks.map(([h,l]) => (
                <a key={h} href={h} onClick={()=>setMenuOpen(false)}
                  style={{color:T.text2,textDecoration:'none',fontSize:'1rem',fontWeight:600,padding:'.5rem 0',borderBottom:`1px solid rgba(200,158,72,0.08)`}}>
                  {l}
                </a>
              ))}
              <div style={{display:'flex',gap:'.75rem',marginTop:'.5rem'}}>
                <button onClick={()=>{setLang(lang==='en'?'ar':'en');setMenuOpen(false);}}
                  style={{flex:1,padding:'.65rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:10,color:T.gold,fontSize:'.9rem',fontWeight:700,cursor:'pointer'}}>
                  {L.langBtn}
                </button>
                <Link href="/admin/login" onClick={()=>setMenuOpen(false)}
                  style={{flex:1,padding:'.65rem',background:'rgba(138,31,50,0.3)',border:`1px solid rgba(138,31,50,0.5)`,borderRadius:10,color:T.rose,textDecoration:'none',fontSize:'.9rem',fontWeight:700,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  Admin
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* ══ HERO ══ */}
        <section className="hero-section" style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'9rem 2rem 7rem',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',width:800,height:800,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.4) 0%,transparent 65%)',top:-250,right:-200,pointerEvents:'none'}}/>
          <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(201,160,72,0.06) 0%,transparent 70%)',bottom:-100,left:-120,pointerEvents:'none'}}/>
          <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,backgroundSize:'70px 70px',pointerEvents:'none',opacity:.4}}/>
          <div style={{maxWidth:760,textAlign:'center',position:'relative',zIndex:1,width:'100%'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:'.6rem',fontSize:'.65rem',letterSpacing:4,textTransform:'uppercase',color:T.gold,marginBottom:'1.5rem',fontFamily:'Playfair Display,serif',flexWrap:'wrap',justifyContent:'center'}}>
              <span style={{width:28,height:1,background:T.gold,display:'inline-block'}}/>
              {L.eyebrow}
              <span style={{width:28,height:1,background:T.gold,display:'inline-block'}}/>
            </div>
            <h1 style={{fontFamily:'Playfair Display,serif',fontWeight:900,lineHeight:1.1,color:T.white,fontSize:'clamp(2.2rem,7vw,5.5rem)',marginBottom:'.4rem'}}>{L.hi}</h1>
            <h1 style={{fontFamily:'Playfair Display,serif',fontWeight:900,lineHeight:1.1,color:T.goldL,fontStyle:'italic',fontSize:'clamp(2.2rem,7vw,5.5rem)',marginBottom:'1.75rem'}}>{L.name}</h1>
            <p style={{color:T.text2,lineHeight:2.1,fontSize:'clamp(.9rem,2.5vw,1.08rem)',maxWidth:560,margin:'0 auto 2.25rem'}} dangerouslySetInnerHTML={{__html:bioHtml(L.bio)}}/>
            <div className="hero-btns" style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap',marginBottom:'2.5rem'}}>
              <a href="#projects" style={{padding:'.85rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,borderRadius:8,textDecoration:'none',fontWeight:700,fontSize:'clamp(.88rem,2.5vw,1rem)',boxShadow:`0 6px 28px rgba(138,31,50,0.5)`}}>{L.btn1}</a>
              <a href="#contact"  style={{padding:'.85rem 2rem',background:'transparent',border:`1px solid rgba(201,160,72,0.4)`,color:T.goldL,borderRadius:8,textDecoration:'none',fontWeight:700,fontSize:'clamp(.88rem,2.5vw,1rem)'}}>{L.btn2}</a>
            </div>
            <div className="stats-row" style={{display:'flex',gap:'2.5rem',justifyContent:'center',paddingTop:'2rem',borderTop:`1px solid ${T.border}`,flexWrap:'wrap'}}>
              {L.stats.map(([n,l],i) => (
                <div key={i} style={{textAlign:'center'}}>
                  <div style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.5rem,4vw,2.2rem)',fontWeight:700,color:T.goldL,lineHeight:1}}>{n}</div>
                  <div style={{fontSize:'.75rem',color:T.muted,marginTop:'.35rem',letterSpacing:1}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PROJECTS ══ */}
        <section id="projects" className="section-pad" style={{padding:'7rem 2rem',background:T.bg2}}>
          <div style={{maxWidth:1050,margin:'0 auto'}}>
            <div style={{marginBottom:'3rem'}}>
              <span style={eyebrow}>{L.projSub}</span>
              <h2 style={h2base}>{L.projTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.projSpan}</span></h2>
              <div style={rule}/>
            </div>
            <div className="filters-wrap" style={{display:'flex',gap:'.55rem',flexWrap:'wrap',marginBottom:'2rem'}}>
              {L.filters.map(([v,l]) => (
                <button key={v} onClick={()=>setFilter(v)} style={{padding:'.5rem 1.1rem',background:filter===v?'rgba(138,31,50,0.5)':'transparent',border:`1px solid ${filter===v?T.burg:T.border}`,borderRadius:24,color:filter===v?T.white:T.text2,fontSize:'.85rem',fontWeight:600,cursor:'pointer',transition:'all .2s'}}>{l}</button>
              ))}
            </div>
            <div className="cards-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.5rem'}}>
              {filtered.length===0 && <p style={{color:T.muted,gridColumn:'1/-1',textAlign:'center',padding:'3rem'}}>{L.noProj}</p>}
              {filtered.map(p => (
                <div key={p.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden',display:'flex',flexDirection:'column',transition:'all .3s'}}>
                  <div style={{height:130,background:`linear-gradient(135deg,${T.burg},#1a0c10)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
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
        </section>

        {/* ══ COURSES ══ */}
        <section id="courses" className="section-pad" style={{padding:'7rem 2rem',background:T.bg}}>
          <div style={{maxWidth:1050,margin:'0 auto'}}>
            <div style={{marginBottom:'3rem'}}>
              <span style={eyebrow}>{L.courseSub}</span>
              <h2 style={h2base}>{L.courseTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.courseSpan}</span></h2>
              <div style={rule}/>
            </div>
            <div className="cards-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1.5rem'}}>
              {courses.length===0 && <p style={{color:T.muted,gridColumn:'1/-1',textAlign:'center',padding:'3rem'}}>{L.noCourse}</p>}
              {courses.map((c,idx) => (
                <Link key={c.id} href={`/courses/${c.id}`} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.75rem',textDecoration:'none',display:'flex',flexDirection:'column',transition:'all .3s'}}>
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

        {/* ══ ARTICLES ══ */}
        <section id="articles" className="section-pad" style={{padding:'7rem 2rem',background:T.bg2}}>
          <div style={{maxWidth:1050,margin:'0 auto'}}>
            <div className="section-header-row" style={{marginBottom:'3rem',display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:'1rem'}}>
              <div>
                <span style={eyebrow}>{L.articleSub}</span>
                <h2 style={h2base}>{L.articleTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.articleSpan}</span></h2>
                <div style={rule}/>
              </div>
              <Link href="/articles" style={{fontSize:'.88rem',color:T.gold,fontWeight:700,textDecoration:'none'}}>{L.viewAll}</Link>
            </div>
            {articles.length===0 && <p style={{color:T.muted,textAlign:'center',padding:'3rem'}}>{L.noArticles}</p>}
            <div className="cards-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:'1.5rem'}}>
              {articles.map(a=>(
                <Link key={a.id} href={`/articles/${a.id}`} style={{textDecoration:'none',display:'flex',flexDirection:'column',background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden',transition:'all .3s'}}>
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

        {/* ══ CONTACT ══ */}
        <section id="contact" className="section-pad" style={{padding:'7rem 2rem',background:T.bg}}>
          <div style={{maxWidth:700,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:'3rem'}}>
              <span style={eyebrow}>{L.ctaSub}</span>
              <h2 style={{...h2base,marginBottom:'1rem'}}>{L.ctaTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.ctaSpan}</span></h2>
              <div style={{width:60,height:2,margin:'1rem auto 0',background:`linear-gradient(90deg,${T.gold},transparent)`}}/>
              <p style={{color:T.text2,lineHeight:2.1,fontSize:'clamp(.88rem,2.5vw,1rem)',marginTop:'1.25rem',whiteSpace:'pre-line'}}>{L.ctaP}</p>
            </div>
            <div className="social-grid" style={{display:'flex',justifyContent:'center',gap:'.75rem',flexWrap:'wrap',marginBottom:'2.5rem'}}>
              {[['Email','mailto:shaimaakalel@gmail.com'],['LinkedIn','https://www.linkedin.com/in/shaimaakalel'],['GitHub','https://github.com/shaimaaaaaaaa'],['Instagram','https://instagram.com/shaimaa_agile'],['YouTube','https://youtube.com/@ShaimaasAgileStories'],['TikTok','https://tiktok.com/@shaimaa_agile']].map(([label,href]) => (
                <a key={String(label)} href={String(href)} target="_blank" rel="noopener"
                  style={{display:'flex',alignItems:'center',gap:'.5rem',padding:'.7rem 1.25rem',background:'rgba(138,31,50,0.18)',border:`1px solid ${T.border}`,borderRadius:10,color:T.text,textDecoration:'none',fontSize:'.88rem',fontWeight:600,transition:'all .25s'}}>
                  {label}
                </a>
              ))}
            </div>
            <ContactForm lang={lang}/>
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer style={{textAlign:'center',padding:'2rem 1.25rem',borderTop:`1px solid ${T.border}`,fontSize:'.8rem',color:T.muted,lineHeight:1.8}}>
          Made with <span style={{color:T.gold}}>&#9829;</span> by{' '}
          <span style={{color:T.goldL,fontWeight:700}}>Shaimaa Kalel</span>
          {' '}· {L.footTxt}
        </footer>

      </main>
    </>
  );
}