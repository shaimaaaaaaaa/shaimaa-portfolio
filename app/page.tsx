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
    dir:'ltr', navLinks:[['/about','About'],['#projects','Projects'],['#courses','Courses'],['/articles','Articles'],['#contact','Contact']] as [string,string][],
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
    dir:'rtl', navLinks:[['/about','عني'],['#projects','المشاريع'],['#courses','الكورسات'],['/articles','المقالات'],['#contact','تواصل']] as [string,string][],
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
  const h2base:React.CSSProperties  = {fontFamily:'Playfair Display,serif',fontSize:'2.4rem',fontWeight:900,color:T.white};

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
    <main style={{background:T.bg,color:T.text,minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif"}}>

      {/* ══ NAV ══ */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:1000,background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`,boxShadow:'0 2px 40px rgba(0,0,0,0.8)'}}>
        <div style={{padding:'1.1rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',color:T.goldL,fontWeight:700,letterSpacing:1}}>✦ Shaimaa Kalel</span>

          {/* DESKTOP LINKS */}
          <div className="desktop-nav" style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
            {L.navLinks.map(([h,l]) => (
              <a key={h} href={h} style={{color:T.text2,textDecoration:'none',fontSize:'.95rem',fontWeight:600,transition:'color .2s'}}
                onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)}
                onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>{l}</a>
            ))}
            <button onClick={()=>setLang(lang==='en'?'ar':'en')}
              style={{padding:'.4rem 1rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:20,color:T.gold,fontSize:'.82rem',fontWeight:700,cursor:'pointer'}}>
              {L.langBtn}
            </button>
            <Link href="/admin/login" style={{padding:'.4rem 1rem',background:'rgba(138,31,50,0.3)',border:`1px solid rgba(138,31,50,0.5)`,borderRadius:20,color:T.rose,textDecoration:'none',fontSize:'.82rem',fontWeight:700}}>
              Admin
            </Link>
          </div>

          {/* HAMBURGER */}
          <button className="hamburger" onClick={()=>setMenuOpen(!menuOpen)}
            style={{display:'none',flexDirection:'column',gap:5,background:'none',border:'none',cursor:'pointer',padding:4}}>
            <span style={{width:24,height:2,background:menuOpen?T.gold:T.text2,display:'block',transition:'all .3s',transform:menuOpen?'rotate(45deg) translate(5px,5px)':'none'}}/>
            <span style={{width:24,height:2,background:menuOpen?T.gold:T.text2,display:'block',transition:'all .3s',opacity:menuOpen?0:1}}/>
            <span style={{width:24,height:2,background:menuOpen?T.gold:T.text2,display:'block',transition:'all .3s',transform:menuOpen?'rotate(-45deg) translate(5px,-5px)':'none'}}/>
          </button>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div style={{padding:'1rem 1.5rem 1.5rem',borderTop:`1px solid ${T.border}`,display:'flex',flexDirection:'column',gap:'.75rem'}}>
            {L.navLinks.map(([h,l]) => (
              <a key={h} href={h} onClick={()=>setMenuOpen(false)}
                style={{color:T.text2,textDecoration:'none',fontSize:'1.05rem',fontWeight:600,padding:'.5rem 0',borderBottom:`1px solid rgba(200,158,72,0.08)`}}>
                {l}
              </a>
            ))}
            <div style={{display:'flex',gap:'1rem',marginTop:'.5rem'}}>
              <button onClick={()=>{setLang(lang==='en'?'ar':'en');setMenuOpen(false);}}
                style={{flex:1,padding:'.6rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:10,color:T.gold,fontSize:'.9rem',fontWeight:700,cursor:'pointer'}}>
                {L.langBtn}
              </button>
              <Link href="/admin/login" onClick={()=>setMenuOpen(false)}
                style={{flex:1,padding:'.6rem',background:'rgba(138,31,50,0.3)',border:`1px solid rgba(138,31,50,0.5)`,borderRadius:10,color:T.rose,textDecoration:'none',fontSize:'.9rem',fontWeight:700,textAlign:'center'}}>
                Admin
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* CSS for responsive */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
        }
      `}</style>

      {/* ══ HERO ══ */}
      <section style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'9rem 2rem 7rem',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',width:800,height:800,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.4) 0%,transparent 65%)',top:-250,right:-200,pointerEvents:'none'}}/>
        <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(201,160,72,0.06) 0%,transparent 70%)',bottom:-100,left:-120,pointerEvents:'none'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,backgroundSize:'70px 70px',pointerEvents:'none',opacity:.4}}/>
        <div style={{maxWidth:760,textAlign:'center',position:'relative',zIndex:1}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'.8rem',fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.gold,marginBottom:'2rem',fontFamily:'Playfair Display,serif'}}>
            <span style={{width:36,height:1,background:T.gold,display:'inline-block'}}/>
            {L.eyebrow}
            <span style={{width:36,height:1,background:T.gold,display:'inline-block'}}/>
          </div>
          <h1 style={{fontFamily:'Playfair Display,serif',fontWeight:900,lineHeight:1.1,color:T.white,fontSize:'clamp(3rem,6.5vw,5.5rem)',marginBottom:'.4rem'}}>{L.hi}</h1>
          <h1 style={{fontFamily:'Playfair Display,serif',fontWeight:900,lineHeight:1.1,color:T.goldL,fontStyle:'italic',fontSize:'clamp(3rem,6.5vw,5.5rem)',marginBottom:'2rem'}}>{L.name}</h1>
          <p style={{color:T.text2,lineHeight:2.2,fontSize:'1.08rem',maxWidth:560,margin:'0 auto 2.75rem'}} dangerouslySetInnerHTML={{__html:bioHtml(L.bio)}}/>
          <div style={{display:'flex',gap:'1.2rem',justifyContent:'center',flexWrap:'wrap',marginBottom:'3rem'}}>
            <a href="#projects" style={{padding:'.9rem 2.2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,borderRadius:8,textDecoration:'none',fontWeight:700,fontSize:'1rem',boxShadow:`0 6px 28px rgba(138,31,50,0.5)`,letterSpacing:.4}}>{L.btn1}</a>
            <a href="#contact"  style={{padding:'.9rem 2.2rem',background:'transparent',border:`1px solid rgba(201,160,72,0.4)`,color:T.goldL,borderRadius:8,textDecoration:'none',fontWeight:700,fontSize:'1rem',letterSpacing:.4}}>{L.btn2}</a>
          </div>
          <div style={{display:'flex',gap:'3.5rem',justifyContent:'center',paddingTop:'2.25rem',borderTop:`1px solid ${T.border}`,flexWrap:'wrap'}}>
            {L.stats.map(([n,l],i) => (
              <div key={i} style={{textAlign:'center'}}>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'2.2rem',fontWeight:700,color:T.goldL,lineHeight:1}}>{n}</div>
                <div style={{fontSize:'.78rem',color:T.muted,marginTop:'.4rem',letterSpacing:1}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROJECTS ══ */}
      <section id="projects" style={{padding:'7rem 2rem',background:T.bg2}}>
        <div style={{maxWidth:1050,margin:'0 auto'}}>
          <div style={{marginBottom:'3.5rem'}}>
            <span style={eyebrow}>{L.projSub}</span>
            <h2 style={h2base}>{L.projTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.projSpan}</span></h2>
            <div style={rule}/>
          </div>
          <div style={{display:'flex',gap:'.55rem',flexWrap:'wrap',marginBottom:'2.25rem'}}>
            {L.filters.map(([v,l]) => (
              <button key={v} onClick={()=>setFilter(v)} style={{padding:'.5rem 1.2rem',background:filter===v?'rgba(138,31,50,0.5)':'transparent',border:`1px solid ${filter===v?T.burg:T.border}`,borderRadius:24,color:filter===v?T.white:T.text2,fontSize:'.88rem',fontWeight:600,cursor:'pointer',transition:'all .2s'}}>{l}</button>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.75rem'}}>
            {filtered.length===0 && <p style={{color:T.muted,gridColumn:'1/-1',textAlign:'center',padding:'3rem',fontSize:'1rem'}}>{L.noProj}</p>}
            {filtered.map(p => (
              <div key={p.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden',display:'flex',flexDirection:'column',transition:'all .3s'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translateY(-7px)';el.style.borderColor='rgba(201,160,72,0.5)';el.style.boxShadow='0 28px 65px rgba(0,0,0,0.6)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform='translateY(0)';el.style.borderColor=T.border;el.style.boxShadow='none';}}>
                <div style={{height:145,background:`linear-gradient(135deg,${T.burg},#1a0c10)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <div style={{padding:'.5rem 1rem',background:'rgba(255,255,255,0.06)',border:`1px solid ${T.border}`,borderRadius:8}}>
                    <span style={{fontFamily:'monospace',color:T.goldL,fontWeight:700,fontSize:'.9rem',letterSpacing:2}}>{p.category.toUpperCase().slice(0,4)}</span>
                  </div>
                </div>
                <div style={{padding:'1.4rem',flex:1,display:'flex',flexDirection:'column'}}>
                  <div style={{fontSize:'.68rem',color:T.rose,letterSpacing:2,textTransform:'uppercase',marginBottom:'.4rem',fontFamily:'Playfair Display,serif'}}>{p.category}</div>
                  <div style={{fontWeight:700,fontSize:'1.05rem',color:T.white,marginBottom:'.35rem',lineHeight:1.4}}>{p.title}</div>
                  <div style={{fontSize:'.82rem',color:T.gold,fontWeight:600,marginBottom:'.65rem'}}>{p.stack}</div>
                  <div style={{fontSize:'.88rem',color:T.text2,lineHeight:2,flex:1,marginBottom:'1rem'}}>{lang==='ar' ? p.desc_ar||p.desc : p.desc_en||p.desc}</div>
                  <div style={{display:'flex',gap:'.9rem',paddingTop:'.75rem',borderTop:`1px solid rgba(200,158,72,0.12)`}}>
                    {p.github && <a href={p.github} target="_blank" rel="noopener" style={{fontSize:'.82rem',color:T.gold,textDecoration:'none',fontWeight:700}}>{L.githubLbl}</a>}
                    {p.demo   && <a href={p.demo}   target="_blank" rel="noopener" style={{fontSize:'.82rem',color:T.gold,textDecoration:'none',fontWeight:700}}>{L.demoLbl}</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COURSES ══ */}
      <section id="courses" style={{padding:'7rem 2rem',background:T.bg}}>
        <div style={{maxWidth:1050,margin:'0 auto'}}>
          <div style={{marginBottom:'3.5rem'}}>
            <span style={eyebrow}>{L.courseSub}</span>
            <h2 style={h2base}>{L.courseTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.courseSpan}</span></h2>
            <div style={rule}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:'1.75rem'}}>
            {courses.length===0 && <p style={{color:T.muted,gridColumn:'1/-1',textAlign:'center',padding:'3rem',fontSize:'1rem'}}>{L.noCourse}</p>}
            {courses.map((c,idx) => (
              <Link key={c.id} href={`/courses/${c.id}`} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'2rem',textDecoration:'none',display:'flex',flexDirection:'column',transition:'all .3s'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.borderColor='rgba(201,160,72,0.5)';el.style.transform='translateY(-5px)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.borderColor=T.border;el.style.transform='translateY(0)';}}>
                <div style={{width:52,height:52,borderRadius:12,background:'rgba(138,31,50,0.35)',border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.25rem'}}>
                  <span style={{fontFamily:'Playfair Display,serif',color:T.goldL,fontWeight:700,fontSize:'1.1rem'}}>{String(idx+1).padStart(2,'0')}</span>
                </div>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem',fontWeight:700,color:T.white,marginBottom:'.6rem',lineHeight:1.4}}>{c.title}</div>
                <div style={{fontSize:'.88rem',color:T.text2,lineHeight:2,flex:1,marginBottom:'1.25rem'}}>{c.desc}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'.9rem',borderTop:`1px solid rgba(200,158,72,0.12)`}}>
                  <span style={{fontSize:'.8rem',color:T.muted}}>{c.lessons?.length||0} {L.lessons}</span>
                  <span style={{fontSize:'.85rem',color:T.gold,fontWeight:700}}>{L.startBtn}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ARTICLES ══ */}
      <section id="articles" style={{padding:'7rem 2rem',background:T.bg2}}>
        <div style={{maxWidth:1050,margin:'0 auto'}}>
          <div style={{marginBottom:'3.5rem',display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:'1rem'}}>
            <div>
              <span style={eyebrow}>{L.articleSub}</span>
              <h2 style={h2base}>{L.articleTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.articleSpan}</span></h2>
              <div style={rule}/>
            </div>
            <Link href="/articles" style={{fontSize:'.9rem',color:T.gold,fontWeight:700,textDecoration:'none'}}
              onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)}
              onMouseLeave={e=>(e.currentTarget.style.color=T.gold)}>
              {L.viewAll}
            </Link>
          </div>
          {articles.length===0 && <p style={{color:T.muted,textAlign:'center',padding:'3rem',fontSize:'1rem'}}>{L.noArticles}</p>}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.75rem'}}>
            {articles.map(a=>(
              <Link key={a.id} href={`/articles/${a.id}`} style={{textDecoration:'none',display:'flex',flexDirection:'column',background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden',transition:'all .3s'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.transform='translateY(-6px)';el.style.borderColor='rgba(201,160,72,0.5)';el.style.boxShadow='0 24px 60px rgba(0,0,0,0.6)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.transform='translateY(0)';el.style.borderColor=T.border;el.style.boxShadow='none';}}>
                <div style={{height:130,background:`linear-gradient(135deg,${T.burg},#1a0c10)`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                  <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,backgroundSize:'35px 35px',opacity:.3}}/>
                  <span style={{fontFamily:'Playfair Display,serif',fontSize:'2rem',color:'rgba(255,255,255,0.12)',fontWeight:900,position:'relative',zIndex:1}}>✦</span>
                </div>
                <div style={{padding:'1.4rem',flex:1,display:'flex',flexDirection:'column'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.65rem'}}>
                    <span style={{fontSize:'.68rem',color:T.rose,letterSpacing:2,textTransform:'uppercase',fontFamily:'Playfair Display,serif'}}>{a.category}</span>
                    <span style={{fontSize:'.75rem',color:T.muted}}>{a.readTime} {L.minRead}</span>
                  </div>
                  <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.05rem',fontWeight:700,color:T.white,marginBottom:'.5rem',lineHeight:1.4}}>
                    {lang==='ar' ? a.title_ar||a.title : a.title}
                  </div>
                  <div style={{fontSize:'.85rem',color:T.text2,lineHeight:1.9,flex:1,marginBottom:'1rem'}}>
                    {lang==='ar' ? a.excerpt_ar||a.excerpt : a.excerpt}
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'.75rem',borderTop:`1px solid rgba(200,158,72,0.12)`}}>
                    <span style={{fontSize:'.75rem',color:T.muted}}>{formatDate(a)}</span>
                    <span style={{fontSize:'.85rem',color:T.gold,fontWeight:700}}>{L.readMore}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section id="contact" style={{padding:'7rem 2rem',background:T.bg}}>
        <div style={{maxWidth:700,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'3.5rem'}}>
            <span style={eyebrow}>{L.ctaSub}</span>
            <h2 style={{...h2base,marginBottom:'1.25rem'}}>
              {L.ctaTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.ctaSpan}</span>
            </h2>
            <div style={{width:60,height:2,margin:'1rem auto 0',background:`linear-gradient(90deg,${T.gold},transparent)`}}/>
            <p style={{color:T.text2,lineHeight:2.2,fontSize:'1rem',marginTop:'1.5rem',whiteSpace:'pre-line'}}>{L.ctaP}</p>
          </div>
          <div style={{display:'flex',justifyContent:'center',gap:'1rem',flexWrap:'wrap',marginBottom:'3rem'}}>
            {[['Email','mailto:shaimaakalel@gmail.com'],['LinkedIn','https://www.linkedin.com/in/shaimaakalel'],['GitHub','https://github.com/shaimaaaaaaaa'],['Instagram','https://instagram.com/shaimaa_agile'],['YouTube','https://youtube.com/@ShaimaasAgileStories'],['TikTok','https://tiktok.com/@shaimaa_agile']].map(([label,href]) => (
              <a key={String(label)} href={String(href)} target="_blank" rel="noopener"
                style={{display:'flex',alignItems:'center',gap:'.6rem',padding:'.75rem 1.4rem',background:'rgba(138,31,50,0.18)',border:`1px solid ${T.border}`,borderRadius:10,color:T.text,textDecoration:'none',fontSize:'.92rem',fontWeight:600,transition:'all .25s'}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.borderColor=T.gold;el.style.color=T.goldL;el.style.transform='translateY(-3px)';}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.borderColor=T.border;el.style.color=T.text;el.style.transform='translateY(0)';}}>
                {label}
              </a>
            ))}
          </div>
          <ContactForm lang={lang}/>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{textAlign:'center',padding:'2.25rem',borderTop:`1px solid ${T.border}`,fontSize:'.82rem',color:T.muted}}>
        Made with <span style={{color:T.gold}}>&#9829;</span> by{' '}
        <span style={{color:T.goldL,fontWeight:700}}>Shaimaa Kalel</span>
        {' '}· {L.footTxt}
      </footer>

    </main>
  );
}