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
  name:'Shaimaa Kalel',
  title:'Software Engineer · Human-Centered Agility · Content Creator',
  bio:'Combining Technical Skills with an Agile Mindset to build real systems that serve real people. Passionate about creating healthier, more human tech teams.',
  location:'Abu Dhabi, UAE', university:'University of Bolton',
  email:'', linkedin:'', github:'', instagram:'', tiktok:'', whatsapp:'',
  stats_projects:'12+', stats_certs:'8+', stats_years:'3+', stats_grad:'2025',
};

const TX = {
  en: {
    nav: [['/', 'Home'], ['/#projects', 'Projects'], ['/#courses', 'Courses']] as [string,string][],
    langBtn: 'العربية',
    aboutTag: 'About Me',
    eduTitle: 'Education', eduSpan: '& Training', eduTag: 'academic background',
    certTitle: 'Certifications', certSpan: '& Awards', certTag: 'achievements',
    skillTitle: 'Skills', skillSpan: '& Tools', skillTag: 'expertise',
    statsLabels: ['Projects', 'Certifications', 'Years', 'Graduating'],
    name: 'Shaimaa Kalel',
    titleLine: 'Software Engineer · Human-Centered Agility · Content Creator',
    bio: 'Combining Technical Skills with an Agile Mindset to build real systems that serve real people. Passionate about creating healthier, more human tech teams.',
    location: 'Abu Dhabi, UAE',
  },
  ar: {
    nav: [['/', 'الرئيسية'], ['/#projects', 'المشاريع'], ['/#courses', 'الكورسات']] as [string,string][],
    langBtn: 'English',
    aboutTag: 'عني',
    eduTitle: 'التعليم', eduSpan: 'والتدريب', eduTag: 'academic background',
    certTitle: 'الشهادات', certSpan: 'والإنجازات', certTag: 'achievements',
    skillTitle: 'المهارات', skillSpan: 'والأدوات', skillTag: 'expertise',
    statsLabels: ['مشروع', 'شهادة', 'سنوات', 'تخرج'],
    name: 'شيماء خليل',
    titleLine: 'مهندسة برمجيات · Human-Centered Agility · صانعة محتوى',
    bio: 'أجمع بين Technical Skills والـ Agile Mindset لأبني أنظمة حقيقية تخدم ناس حقيقيين. شغوفة ببناء فرق تقنية أكثر صحة وإنسانية.',
    location: 'أبوظبي، الإمارات',
  },
};

const EDU = [
  { degree:'BEng (Hons) Software Engineering', school:'University of Bolton', period:'Oct 2022 – Aug 2025', note:'Human-Centered Agility' },
  { degree:'L4/L5 HND Computer Science', school:'NCC Education', period:'Oct 2022 – Jun 2024', note:'' },
  { degree:'Agile Software Developer Nanodegree', school:'Udacity', period:'Dec 2023 – Apr 2024', note:'Nanodegree' },
  { degree:'Software Engineering Specialization', school:'HKUST', period:'2024', note:'' },
];

const CERTS = [
  'IT Fundamentals — IBM',
  'UI/UX Design — IBM',
  'Front-End Development — IBM',
  'Intro to Software Engineering — IBM (with Honors)',
  'Scrum Master — SKILL-UP EDTECH (with Honors)',
  'Software Engineering — HKUST (×3)',
];

const SKILLS = [
  { cat:{ en:'Languages & Frameworks', ar:'لغات البرمجة والـ Frameworks' }, items:['C#','WinForms','SQL','ADO.NET','Laravel','Next.js','Firebase','WordPress'] },
  { cat:{ en:'Agile & Project Management', ar:'Agile وإدارة المشاريع' }, items:['Scrum','Kanban','DSDM','Jira','Trello'] },
  { cat:{ en:'Design & Analysis', ar:'التصميم والتحليل' }, items:['ERD','DFD','UI/UX Design','Agile Leadership'] },
];

export default function AboutPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [lang, setLang]         = useState<'en'|'ar'>('en');
  const [mounted, setMounted]   = useState(false);

  // تحميل اللغة من localStorage بعد التحميل
  useEffect(() => {
    const saved = localStorage.getItem('lang') as 'en'|'ar';
    if (saved === 'ar' || saved === 'en') setLang(saved);
    setMounted(true);
  }, []);

  // حفظ اللغة وتغيير الاتجاه
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('lang', lang);
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, mounted]);

  // تحميل الإعدادات من Firebase
  useEffect(() => {
    getDoc(doc(db,'settings','main')).then(d => {
      if (d.exists()) setSettings({...DEFAULTS,...d.data() as Settings});
    });
  }, []);

  const L = TX[lang];

  const eyebrow: React.CSSProperties = {
    fontSize:'.72rem', letterSpacing:5, textTransform:'uppercase',
    color:T.rose, fontFamily:'Playfair Display,serif',
    display:'block', marginBottom:'.65rem',
  };
  const rule: React.CSSProperties = {
    width:60, height:2, marginTop:'1rem',
    background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`,
  };

  // نخفي المحتوى حتى يتحمل على المتصفح عشان نتجنب Hydration error
  if (!mounted) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  return (
    <main style={{background:T.bg,color:T.text,minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif"}}>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:1000,padding:'1.1rem 3rem',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`,boxShadow:'0 2px 40px rgba(0,0,0,0.8)'}}>
        <Link href="/" style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:T.goldL,textDecoration:'none',fontWeight:700}}>✦ Shaimaa Kalel</Link>
        <div style={{display:'flex',gap:'2rem',alignItems:'center'}}>
          {L.nav.map(([h,l]) => (
            <Link key={h} href={h} style={{color:T.text2,textDecoration:'none',fontSize:'1rem',fontWeight:600,transition:'color .2s'}}
              onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)}
              onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>{l}</Link>
          ))}
          <button onClick={()=>setLang(lang==='en'?'ar':'en')}
            style={{padding:'.45rem 1.2rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:20,color:T.gold,fontSize:'.85rem',fontWeight:700,cursor:'pointer'}}>
            {L.langBtn}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{padding:'9rem 2rem 7rem',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',width:700,height:700,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.4) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(rgba(200,158,72,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(200,158,72,0.03) 1px,transparent 1px)`,backgroundSize:'70px 70px',pointerEvents:'none'}}/>
        <div style={{maxWidth:1050,margin:'0 auto',position:'relative',zIndex:1,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5rem',alignItems:'center'}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:'.8rem',fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.gold,marginBottom:'2rem',fontFamily:'Playfair Display,serif'}}>
              <span style={{width:36,height:1,background:T.gold,display:'inline-block'}}/>
              {L.aboutTag}
            </div>
            <h1 style={{fontFamily:'Playfair Display,serif',fontWeight:900,lineHeight:1.1,color:T.white,fontSize:'clamp(2.5rem,5vw,4rem)',marginBottom:'1.5rem'}}>
              {L.name}
            </h1>
            <p style={{color:T.gold,fontSize:'1rem',fontWeight:600,marginBottom:'1.5rem',letterSpacing:.5}}>
              {L.titleLine}
            </p>
            <p style={{color:T.text2,lineHeight:2.2,fontSize:'1.05rem',marginBottom:'2rem'}}>
              {L.bio}
            </p>
            <div style={{display:'flex',gap:'.75rem',flexWrap:'wrap'}}>
              <span style={{padding:'.4rem 1rem',background:'rgba(138,31,50,0.2)',border:`1px solid ${T.border}`,borderRadius:20,fontSize:'.82rem',color:T.text2}}>
                {L.location}
              </span>
              <span style={{padding:'.4rem 1rem',background:'rgba(138,31,50,0.2)',border:`1px solid ${T.border}`,borderRadius:20,fontSize:'.82rem',color:T.text2}}>
                {settings.university}
              </span>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            {([
              [settings.stats_projects, L.statsLabels[0]],
              [settings.stats_certs,    L.statsLabels[1]],
              [settings.stats_years,    L.statsLabels[2]],
              [settings.stats_grad,     L.statsLabels[3]],
            ] as [string,string][]).map(([n,l],i) => (
              <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.75rem',textAlign:'center'}}>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'2.2rem',fontWeight:700,color:T.goldL,lineHeight:1,marginBottom:'.5rem'}}>{n}</div>
                <div style={{fontSize:'.8rem',color:T.muted,letterSpacing:1}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section style={{padding:'6rem 2rem',background:T.bg2}}>
        <div style={{maxWidth:1050,margin:'0 auto'}}>
          <div style={{marginBottom:'3.5rem'}}>
            <span style={eyebrow}>{L.eduTag}</span>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'2.2rem',fontWeight:900,color:T.white}}>
              {L.eduTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.eduSpan}</span>
            </h2>
            <div style={rule}/>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'1.1rem'}}>
            {EDU.map((e,i) => (
              <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.6rem',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem',transition:'border-color .2s'}}
                onMouseEnter={el=>(el.currentTarget.style.borderColor='rgba(201,160,72,0.45)')}
                onMouseLeave={el=>(el.currentTarget.style.borderColor=T.border)}>
                <div>
                  <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.05rem',fontWeight:700,color:T.white,marginBottom:'.3rem'}}>{e.degree}</div>
                  <div style={{fontSize:'.88rem',color:T.gold,fontWeight:600,marginBottom:'.2rem'}}>{e.school}</div>
                  {e.note && <div style={{fontSize:'.78rem',color:T.rose,letterSpacing:1}}>{e.note}</div>}
                </div>
                <div style={{fontSize:'.82rem',color:T.muted,flexShrink:0,textAlign:'right'}}>{e.period}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS */}
      <section style={{padding:'6rem 2rem',background:T.bg}}>
        <div style={{maxWidth:1050,margin:'0 auto'}}>
          <div style={{marginBottom:'3.5rem'}}>
            <span style={eyebrow}>{L.certTag}</span>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'2.2rem',fontWeight:900,color:T.white}}>
              {L.certTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.certSpan}</span>
            </h2>
            <div style={rule}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1rem'}}>
            {CERTS.map((c,i) => (
              <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:'1.2rem 1.4rem',display:'flex',alignItems:'center',gap:'1rem',transition:'border-color .2s'}}
                onMouseEnter={el=>(el.currentTarget.style.borderColor='rgba(201,160,72,0.45)')}
                onMouseLeave={el=>(el.currentTarget.style.borderColor=T.border)}>
                <div style={{width:8,height:8,borderRadius:'50%',background:T.gold,flexShrink:0}}/>
                <span style={{fontSize:'.88rem',color:T.text2,lineHeight:1.5}}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section style={{padding:'6rem 2rem',background:T.bg2}}>
        <div style={{maxWidth:1050,margin:'0 auto'}}>
          <div style={{marginBottom:'3.5rem'}}>
            <span style={eyebrow}>{L.skillTag}</span>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'2.2rem',fontWeight:900,color:T.white}}>
              {L.skillTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.skillSpan}</span>
            </h2>
            <div style={rule}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1.5rem'}}>
            {SKILLS.map((s,i) => (
              <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.75rem'}}>
                <h3 style={{fontFamily:'Playfair Display,serif',fontSize:'1rem',color:T.gold,fontWeight:700,marginBottom:'1.25rem'}}>
                  {s.cat[lang]}
                </h3>
                <div style={{display:'flex',flexWrap:'wrap',gap:'.5rem'}}>
                  {s.items.map((item,j) => (
                    <span key={j} style={{padding:'.35rem .85rem',background:'rgba(138,31,50,0.2)',border:`1px solid ${T.border}`,borderRadius:20,fontSize:'.82rem',color:T.text2,fontWeight:500}}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{textAlign:'center',padding:'2.25rem',borderTop:`1px solid ${T.border}`,fontSize:'.82rem',color:T.muted}}>
        Made with <span style={{color:T.gold}}>&#9829;</span> by{' '}
        <span style={{color:T.goldL,fontWeight:700}}>Shaimaa Kalel</span>
        {' '}· Software Engineer · Content Creator · Abu Dhabi · 2025
      </footer>
    </main>
  );
}