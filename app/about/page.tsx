'use client';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

const T = {
  bg:'#0e0608', bg2:'#140a0c', card:'#1a0c10', burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', white:'#ffffff',
  text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)', rose:'#d07080',
};

interface Settings {
  name:string; title:string; bio:string; location:string; university:string;
  email:string; linkedin:string; github:string; instagram:string; tiktok:string; whatsapp:string;
  stats_projects:string; stats_certs:string; stats_years:string; stats_grad:string;
}

const DEFAULTS: Settings = {
  name:'Shaimaa Kalel', title:'Software Engineer · Human-Centered Agility · Content Creator',
  bio:'Combining Technical Skills with an Agile Mindset to build real systems that serve real people.',
  location:'Abu Dhabi, UAE', university:'University of Bolton',
  email:'', linkedin:'', github:'', instagram:'', tiktok:'', whatsapp:'',
  stats_projects:'12+', stats_certs:'8+', stats_years:'3+', stats_grad:'2025',
};

const TX = {
  en: {
    nav:[['/','Home'],['/#projects','Projects'],['/#courses','Courses'],['/articles','Articles']] as [string,string][],
    langBtn:'العربية', dir:'ltr',
    aboutTag:'About Me',
    eduTitle:'Education', eduSpan:'& Training', eduTag:'academic background',
    certTitle:'Certifications', certSpan:'& Awards', certTag:'achievements',
    skillTitle:'Skills', skillSpan:'& Tools', skillTag:'expertise',
    statsLabels:['Projects','Certifications','Years','Graduating'],
    name:'Shaimaa Kalel',
    titleLine:'Software Engineer · Human-Centered Agility · Content Creator',
    bio:'Combining Technical Skills with an Agile Mindset to build real systems that serve real people. Passionate about creating healthier, more human tech teams.',
    location:'Abu Dhabi, UAE',
  },
  ar: {
    nav:[['/','الرئيسية'],['/#projects','المشاريع'],['/#courses','الكورسات'],['/articles','المقالات']] as [string,string][],
    langBtn:'English', dir:'rtl',
    aboutTag:'عني',
    eduTitle:'التعليم', eduSpan:'والتدريب', eduTag:'academic background',
    certTitle:'الشهادات', certSpan:'والإنجازات', certTag:'achievements',
    skillTitle:'المهارات', skillSpan:'والأدوات', skillTag:'expertise',
    statsLabels:['مشروع','شهادة','سنوات','تخرج'],
    name:'شيماء خليل',
    titleLine:'مهندسة برمجيات · Human-Centered Agility · صانعة محتوى',
    bio:'أجمع بين Technical Skills والـ Agile Mindset لأبني أنظمة حقيقية تخدم ناس حقيقيين.',
    location:'أبوظبي، الإمارات',
  },
};

const EDU = [
  { degree:'BEng (Hons) Software Engineering', school:'University of Bolton', period:'Oct 2022 – Aug 2025', note:'Human-Centered Agility' },
  { degree:'L4/L5 HND Computer Science', school:'NCC Education', period:'Oct 2022 – Jun 2024', note:'' },
  { degree:'Agile Software Developer Nanodegree', school:'Udacity', period:'Dec 2023 – Apr 2024', note:'Nanodegree' },
  { degree:'Software Engineering Specialization', school:'HKUST', period:'2024', note:'' },
];

const CERTS = [
  'IT Fundamentals — IBM','UI/UX Design — IBM','Front-End Development — IBM',
  'Intro to Software Engineering — IBM (with Honors)',
  'Scrum Master — SKILL-UP EDTECH (with Honors)','Software Engineering — HKUST (×3)',
];

const SKILLS = [
  { cat:{en:'Languages & Frameworks',ar:'لغات البرمجة والـ Frameworks'}, items:['C#','WinForms','SQL','ADO.NET','Laravel','Next.js','Firebase','WordPress'] },
  { cat:{en:'Agile & Project Management',ar:'Agile وإدارة المشاريع'}, items:['Scrum','Kanban','DSDM','Jira','Trello'] },
  { cat:{en:'Design & Analysis',ar:'التصميم والتحليل'}, items:['ERD','DFD','UI/UX Design','Agile Leadership'] },
];

export default function AboutPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
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
    getDoc(doc(db,'settings','main')).then(d => {
      if (d.exists()) setSettings({...DEFAULTS,...d.data() as Settings});
    });
  }, []);

  const L = TX[lang];

  const eyebrow:React.CSSProperties = {fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'};
  const rule:React.CSSProperties    = {width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`};

  if (!mounted) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  return (
    <>
      <style>{`
        .ab-desktop { display:flex !important; }
        .ab-burger   { display:none !important; }
        @media(max-width:768px){
          .ab-desktop  { display:none !important; }
          .ab-burger   { display:flex !important; }
          .about-hero  { grid-template-columns:1fr !important; gap:2.5rem !important; }
          .stats-grid  { grid-template-columns:repeat(2,1fr) !important; }
          .about-sec   { padding:4rem 1.25rem !important; }
          .edu-item    { flex-direction:column !important; align-items:flex-start !important; gap:.5rem !important; }
          .edu-period  { text-align:left !important; }
          .certs-grid  { grid-template-columns:1fr !important; }
          .skills-grid { grid-template-columns:1fr !important; }
        }
        @media(max-width:480px){
          .about-hero-section { padding:6.5rem 1.25rem 3.5rem !important; }
        }
      `}</style>

      <main style={{background:T.bg,color:T.text,minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir as 'ltr'|'rtl'}}>

        {/* NAV */}
        <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:1000,background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`,boxShadow:'0 2px 40px rgba(0,0,0,0.8)'}}>
          <div style={{padding:'.9rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <Link href="/" style={{fontFamily:'Playfair Display,serif',fontSize:'1.15rem',color:T.goldL,textDecoration:'none',fontWeight:700,flexShrink:0}}>✦ Shaimaa Kalel</Link>

            {/* DESKTOP */}
            <div className="ab-desktop" style={{gap:'1.5rem',alignItems:'center'}}>
              {L.nav.map(([h,l])=>(
                <Link key={h} href={h} style={{color:T.text2,textDecoration:'none',fontSize:'.9rem',fontWeight:600,whiteSpace:'nowrap',transition:'color .2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)}
                  onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>{l}</Link>
              ))}
              <button onClick={()=>setLang(lang==='en'?'ar':'en')}
                style={{padding:'.4rem .95rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:20,color:T.gold,fontSize:'.82rem',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>
                {L.langBtn}
              </button>
            </div>

            {/* HAMBURGER */}
            <button className="ab-burger" onClick={()=>setMenuOpen(!menuOpen)}
              style={{flexDirection:'column',gap:5,background:'none',border:'none',cursor:'pointer',padding:6,flexShrink:0}}>
              <span style={{width:22,height:2,background:menuOpen?T.goldL:T.text2,display:'block',transition:'all .3s',transform:menuOpen?'rotate(45deg) translate(5px,5px)':'none'}}/>
              <span style={{width:22,height:2,background:menuOpen?T.goldL:T.text2,display:'block',transition:'all .3s',opacity:menuOpen?0:1}}/>
              <span style={{width:22,height:2,background:menuOpen?T.goldL:T.text2,display:'block',transition:'all .3s',transform:menuOpen?'rotate(-45deg) translate(5px,-5px)':'none'}}/>
            </button>
          </div>

          {/* MOBILE MENU */}
          {menuOpen && (
            <div style={{borderTop:`1px solid ${T.border}`,padding:'1rem 1.5rem 1.5rem',display:'flex',flexDirection:'column',gap:'.65rem'}}>
              {L.nav.map(([h,l])=>(
                <Link key={h} href={h} onClick={()=>setMenuOpen(false)}
                  style={{color:T.text2,textDecoration:'none',fontSize:'1rem',fontWeight:600,padding:'.5rem 0',borderBottom:`1px solid rgba(200,158,72,0.08)`}}>
                  {l}
                </Link>
              ))}
              <button onClick={()=>{setLang(lang==='en'?'ar':'en');setMenuOpen(false);}}
                style={{marginTop:'.5rem',padding:'.65rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:10,color:T.gold,fontSize:'.9rem',fontWeight:700,cursor:'pointer'}}>
                {L.langBtn}
              </button>
            </div>
          )}
        </nav>

        {/* HERO */}
        <section className="about-hero-section" style={{padding:'9rem 2rem 6rem',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',width:700,height:700,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.4) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none'}}/>
          <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(rgba(200,158,72,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(200,158,72,0.03) 1px,transparent 1px)`,backgroundSize:'70px 70px',pointerEvents:'none'}}/>
          <div style={{maxWidth:1050,margin:'0 auto',position:'relative',zIndex:1}}>
            <div className="about-hero" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5rem',alignItems:'center'}}>
              <div>
                <div style={{display:'inline-flex',alignItems:'center',gap:'.8rem',fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.gold,marginBottom:'1.75rem',fontFamily:'Playfair Display,serif'}}>
                  <span style={{width:36,height:1,background:T.gold,display:'inline-block'}}/>
                  {L.aboutTag}
                </div>
                <h1 style={{fontFamily:'Playfair Display,serif',fontWeight:900,lineHeight:1.1,color:T.white,fontSize:'clamp(2rem,6vw,4rem)',marginBottom:'1.25rem'}}>
                  {L.name}
                </h1>
                <p style={{color:T.gold,fontSize:'clamp(.85rem,2vw,1rem)',fontWeight:600,marginBottom:'1.25rem',letterSpacing:.5,lineHeight:1.6}}>
                  {L.titleLine}
                </p>
                <p style={{color:T.text2,lineHeight:2.1,fontSize:'clamp(.88rem,2.5vw,1.05rem)',marginBottom:'1.75rem'}}>
                  {L.bio}
                </p>
                <div style={{display:'flex',gap:'.65rem',flexWrap:'wrap'}}>
                  <span style={{padding:'.4rem 1rem',background:'rgba(138,31,50,0.2)',border:`1px solid ${T.border}`,borderRadius:20,fontSize:'.8rem',color:T.text2}}>{L.location}</span>
                  <span style={{padding:'.4rem 1rem',background:'rgba(138,31,50,0.2)',border:`1px solid ${T.border}`,borderRadius:20,fontSize:'.8rem',color:T.text2}}>{settings.university}</span>
                </div>
              </div>
              <div className="stats-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                {([
                  [settings.stats_projects,L.statsLabels[0]],
                  [settings.stats_certs,L.statsLabels[1]],
                  [settings.stats_years,L.statsLabels[2]],
                  [settings.stats_grad,L.statsLabels[3]],
                ] as [string,string][]).map(([n,l],i)=>(
                  <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.5rem',textAlign:'center'}}>
                    <div style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.6rem,4vw,2.2rem)',fontWeight:700,color:T.goldL,lineHeight:1,marginBottom:'.4rem'}}>{n}</div>
                    <div style={{fontSize:'.78rem',color:T.muted,letterSpacing:1}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* EDUCATION */}
        <section className="about-sec" style={{padding:'6rem 2rem',background:T.bg2}}>
          <div style={{maxWidth:1050,margin:'0 auto'}}>
            <div style={{marginBottom:'3rem'}}>
              <span style={eyebrow}>{L.eduTag}</span>
              <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.6rem,4vw,2.2rem)',fontWeight:900,color:T.white}}>
                {L.eduTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.eduSpan}</span>
              </h2>
              <div style={rule}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              {EDU.map((e,i)=>(
                <div key={i} className="edu-item" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.4rem 1.6rem',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem'}}>
                  <div>
                    <div style={{fontFamily:'Playfair Display,serif',fontSize:'1rem',fontWeight:700,color:T.white,marginBottom:'.3rem'}}>{e.degree}</div>
                    <div style={{fontSize:'.85rem',color:T.gold,fontWeight:600,marginBottom:'.2rem'}}>{e.school}</div>
                    {e.note && <div style={{fontSize:'.75rem',color:T.rose,letterSpacing:1}}>{e.note}</div>}
                  </div>
                  <div className="edu-period" style={{fontSize:'.8rem',color:T.muted,flexShrink:0,textAlign:'right',whiteSpace:'nowrap'}}>{e.period}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section className="about-sec" style={{padding:'6rem 2rem',background:T.bg}}>
          <div style={{maxWidth:1050,margin:'0 auto'}}>
            <div style={{marginBottom:'3rem'}}>
              <span style={eyebrow}>{L.certTag}</span>
              <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.6rem,4vw,2.2rem)',fontWeight:900,color:T.white}}>
                {L.certTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.certSpan}</span>
              </h2>
              <div style={rule}/>
            </div>
            <div className="certs-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1rem'}}>
              {CERTS.map((c,i)=>(
                <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:'1.1rem 1.3rem',display:'flex',alignItems:'center',gap:'.85rem'}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:T.gold,flexShrink:0}}/>
                  <span style={{fontSize:'.85rem',color:T.text2,lineHeight:1.5}}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section className="about-sec" style={{padding:'6rem 2rem',background:T.bg2}}>
          <div style={{maxWidth:1050,margin:'0 auto'}}>
            <div style={{marginBottom:'3rem'}}>
              <span style={eyebrow}>{L.skillTag}</span>
              <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.6rem,4vw,2.2rem)',fontWeight:900,color:T.white}}>
                {L.skillTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.skillSpan}</span>
              </h2>
              <div style={rule}/>
            </div>
            <div className="skills-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:'1.4rem'}}>
              {SKILLS.map((s,i)=>(
                <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.6rem'}}>
                  <h3 style={{fontFamily:'Playfair Display,serif',fontSize:'1rem',color:T.gold,fontWeight:700,marginBottom:'1.1rem'}}>{s.cat[lang]}</h3>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'.45rem'}}>
                    {s.items.map((item,j)=>(
                      <span key={j} style={{padding:'.32rem .8rem',background:'rgba(138,31,50,0.2)',border:`1px solid ${T.border}`,borderRadius:20,fontSize:'.8rem',color:T.text2}}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer style={{textAlign:'center',padding:'2rem 1.25rem',borderTop:`1px solid ${T.border}`,fontSize:'.8rem',color:T.muted,lineHeight:1.8}}>
          Made with <span style={{color:T.gold}}>&#9829;</span> by{' '}
          <span style={{color:T.goldL,fontWeight:700}}>Shaimaa Kalel</span>
          {' '}· Software Engineer · Content Creator · Abu Dhabi · 2025
        </footer>
      </main>
    </>
  );
}