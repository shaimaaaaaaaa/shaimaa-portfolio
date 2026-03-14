'use client';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { LANG } from '../lib/constants';
import type { Lang } from '../lib/constants';
import Navbar from '../components/Navbar';
import SharedFooter from '../components/SharedFooter';

const T = {
  bg:'#0e0608', bg2:'#140a0c', card:'#1a0c10', burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', white:'#ffffff',
  text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)', rose:'#d07080',
};

const TX = {
  en: {
    dir:'ltr' as const,
    aboutTag:'About Me',
    eduTitle:'Education', eduSpan:'& Training', eduTag:'academic background',
    certTitle:'Certifications', certSpan:'& Awards', certTag:'achievements',
    skillTitle:'Skills', skillSpan:'& Tools', skillTag:'expertise',
    statsLabels:['Projects','Certifications','Years','Graduating'],
  },
  ar: {
    dir:'rtl' as const,
    aboutTag:'عني',
    eduTitle:'التعليم', eduSpan:'والتدريب', eduTag:'academic background',
    certTitle:'الشهادات', certSpan:'والإنجازات', certTag:'achievements',
    skillTitle:'المهارات', skillSpan:'والأدوات', skillTag:'expertise',
    statsLabels:['مشروع','شهادة','سنوات','تخرج'],
  },
};

interface EduItem  { degree:string; school:string; period:string; note:string; imageUrl?:string; }
interface CertItem { name:string; imageUrl?:string; }
interface SkillCat { cat_en:string; cat_ar:string; items:string; }

const FALLBACK_EDU: EduItem[] = [
  { degree:'BEng (Hons) Software Engineering', school:'University of Bolton', period:'Oct 2022 – Aug 2025', note:'Human-Centered Agility' },
  { degree:'L4/L5 HND Computer Science', school:'NCC Education', period:'Oct 2022 – Jun 2024', note:'' },
  { degree:'Agile Software Developer Nanodegree', school:'Udacity', period:'Dec 2023 – Apr 2024', note:'Nanodegree' },
  { degree:'Software Engineering Specialization', school:'HKUST', period:'2024', note:'' },
];
const FALLBACK_CERTS: CertItem[] = [
  { name:'IT Fundamentals — IBM' },
  { name:'UI/UX Design — IBM' },
  { name:'Front-End Development — IBM' },
  { name:'Intro to Software Engineering — IBM (with Honors)' },
  { name:'Scrum Master — SKILL-UP EDTECH (with Honors)' },
  { name:'Software Engineering — HKUST (×3)' },
];
const FALLBACK_SKILLS: SkillCat[] = [
  { cat_en:'Languages & Frameworks', cat_ar:'لغات البرمجة والـ Frameworks', items:'C#,WinForms,SQL,ADO.NET,Laravel,Next.js,Firebase,WordPress' },
  { cat_en:'Agile & Project Management', cat_ar:'Agile وإدارة المشاريع', items:'Scrum,Kanban,DSDM,Jira,Trello' },
  { cat_en:'Design & Analysis', cat_ar:'التصميم والتحليل', items:'ERD,DFD,UI/UX Design,Agile Leadership' },
];

// ── Lightbox ──
function Lightbox({ src, alt, onClose }: { src:string; alt:string; onClose:()=>void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key==='Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow=''; };
  }, [onClose]);

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.93)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem',cursor:'zoom-out'}}>
      <button onClick={onClose} style={{position:'absolute',top:'1.25rem',right:'1.25rem',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'50%',width:40,height:40,color:'#fff',fontSize:'1.1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
      <img src={src} alt={alt} onClick={e=>e.stopPropagation()}
        style={{maxWidth:'90vw',maxHeight:'88vh',objectFit:'contain',borderRadius:12,boxShadow:'0 30px 80px rgba(0,0,0,0.8)',cursor:'default',border:'1px solid rgba(200,158,72,0.2)'}}/>
      <div style={{position:'absolute',bottom:'1.5rem',left:0,right:0,textAlign:'center',fontSize:'.85rem',color:'rgba(255,255,255,0.45)',pointerEvents:'none'}}>{alt}</div>
    </div>
  );
}

export default function AboutPage() {
  const [lang,      setLang]      = useState<Lang>('en');
  const [mounted,   setMounted]   = useState(false);
  const [name,      setName]      = useState('Shaimaa Kalel');
  const [nameAr,    setNameAr]    = useState('شيماء خليل');
  const [titleEn,   setTitleEn]   = useState('Software Engineer · Human-Centered Agility · Content Creator');
  const [titleAr,   setTitleAr]   = useState('مهندسة برمجيات · Human-Centered Agility · صانعة محتوى');
  const [bioEn,     setBioEn]     = useState('Combining Technical Skills with an Agile Mindset to build real systems that serve real people.');
  const [bioAr,     setBioAr]     = useState('أجمع بين Technical Skills والـ Agile Mindset لأبني أنظمة حقيقية تخدم ناس حقيقيين.');
  const [location,  setLocation]  = useState('Abu Dhabi, UAE');
  const [university,setUniversity]= useState('University of Bolton');
  const [statsProj, setStatsProj] = useState('12+');
  const [statsCerts,setStatsCerts]= useState('8+');
  const [statsYears,setStatsYears]= useState('3+');
  const [statsGrad, setStatsGrad] = useState('2025');
  const [edu,    setEdu]    = useState<EduItem[]>(FALLBACK_EDU);
  const [certs,  setCerts]  = useState<CertItem[]>(FALLBACK_CERTS);
  const [skills, setSkills] = useState<SkillCat[]>(FALLBACK_SKILLS);

  const [lightbox, setLightbox] = useState<{src:string;alt:string}|null>(null);

  useEffect(() => {
    const s = localStorage.getItem('lang') as Lang;
    if (s==='ar'||s==='en') setLang(s);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('lang', lang);
    document.documentElement.dir  = lang==='ar'?'rtl':'ltr';
    document.documentElement.lang = lang;
  }, [lang, mounted]);

  useEffect(() => {
    async function load() {
      const d = await getDoc(doc(db,'about','main'));
      if (d.exists()) {
        const data = d.data();
        if (data.name)           setName(data.name);
        if (data.nameAr)         setNameAr(data.nameAr);
        if (data.titleEn)        setTitleEn(data.titleEn);
        if (data.titleAr)        setTitleAr(data.titleAr);
        if (data.bioEn)          setBioEn(data.bioEn);
        if (data.bioAr)          setBioAr(data.bioAr);
        if (data.location)       setLocation(data.location);
        if (data.university)     setUniversity(data.university);
        if (data.stats_projects) setStatsProj(data.stats_projects);
        if (data.stats_certs)    setStatsCerts(data.stats_certs);
        if (data.stats_years)    setStatsYears(data.stats_years);
        if (data.stats_grad)     setStatsGrad(data.stats_grad);
        if (data.edu?.length)    setEdu(data.edu);
        if (data.certs?.length) {
          const normalized: CertItem[] = data.certs.map((c: string | CertItem) =>
            typeof c === 'string' ? { name: c } : c
          );
          setCerts(normalized);
        }
        if (data.skills?.length) setSkills(data.skills);
      } else {
        const proj = await getDocs(collection(db,'projects'));
        setStatsProj(`${proj.size}+`);
      }
    }
    load();
  }, []);

  const L  = TX[lang];
  const LN = LANG[lang];
  const eyebrow: React.CSSProperties = {fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'};
  const rule: React.CSSProperties    = {width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`};

  if (!mounted) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  const displayName  = lang==='ar' ? nameAr  : name;
  const displayTitle = lang==='ar' ? titleAr : titleEn;
  const displayBio   = lang==='ar' ? bioAr   : bioEn;

  return (
    <>
      <style>{`
        @media(max-width:768px){
          .about-hero  { grid-template-columns:1fr !important; gap:2rem !important; }
          .stats-grid  { grid-template-columns:repeat(2,1fr) !important; }
          .about-sec   { padding:4rem 1.25rem !important; }
          .edu-item    { flex-direction:column !important; align-items:flex-start !important; gap:.5rem !important; }
          .certs-grid  { grid-template-columns:1fr !important; }
          .skills-grid { grid-template-columns:1fr !important; }
        }
        .img-clickable { cursor:zoom-in; transition:opacity .2s,transform .2s; }
        .img-clickable:hover { opacity:.82; transform:scale(1.06); }
      `}</style>

      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={()=>setLightbox(null)}/>}

      <main style={{background:T.bg,color:T.text,minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir}}>

        <Navbar lang={lang} L={LN} onLangChange={setLang} />

        {/* HERO */}
        <section style={{padding:'9rem 3rem 6rem',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',width:700,height:700,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.4) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none'}}/>
          <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(rgba(200,158,72,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(200,158,72,0.03) 1px,transparent 1px)`,backgroundSize:'70px 70px',pointerEvents:'none'}}/>
          <div style={{maxWidth:1050,margin:'0 auto',position:'relative',zIndex:1}}>
            <div className="about-hero" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5rem',alignItems:'center'}}>
              <div>
                <div style={{display:'inline-flex',alignItems:'center',gap:'.8rem',fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.gold,marginBottom:'1.75rem',fontFamily:'Playfair Display,serif'}}>
                  <span style={{width:36,height:1,background:T.gold,display:'inline-block'}}/>{L.aboutTag}
                </div>
                <h1 style={{fontFamily:'Playfair Display,serif',fontWeight:900,lineHeight:1.1,color:T.white,fontSize:'clamp(2rem,6vw,4rem)',marginBottom:'1.1rem'}}>{displayName}</h1>
                <p style={{color:T.gold,fontSize:'clamp(.82rem,2vw,.98rem)',fontWeight:600,marginBottom:'1.1rem',lineHeight:1.6}}>{displayTitle}</p>
                <p style={{color:T.text2,lineHeight:2.1,fontSize:'clamp(.88rem,2.5vw,1.02rem)',marginBottom:'1.5rem'}}>{displayBio}</p>
                <div style={{display:'flex',gap:'.6rem',flexWrap:'wrap'}}>
                  <span style={{padding:'.38rem .9rem',background:'rgba(138,31,50,0.2)',border:`1px solid ${T.border}`,borderRadius:20,fontSize:'.78rem',color:T.text2}}>{location}</span>
                  <span style={{padding:'.38rem .9rem',background:'rgba(138,31,50,0.2)',border:`1px solid ${T.border}`,borderRadius:20,fontSize:'.78rem',color:T.text2}}>{university}</span>
                </div>
              </div>
              <div className="stats-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                {([
                  [statsProj,  L.statsLabels[0]],
                  [statsCerts, L.statsLabels[1]],
                  [statsYears, L.statsLabels[2]],
                  [statsGrad,  L.statsLabels[3]],
                ] as [string,string][]).map(([n,l],i)=>(
                  <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.5rem',textAlign:'center'}}>
                    <div style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.6rem,4vw,2.2rem)',fontWeight:700,color:T.goldL,lineHeight:1,marginBottom:'.4rem'}}>{n}</div>
                    <div style={{fontSize:'.76rem',color:T.muted,letterSpacing:1}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* EDUCATION */}
        <section className="about-sec" style={{padding:'6rem 3rem',background:T.bg2}}>
          <div style={{maxWidth:1050,margin:'0 auto'}}>
            <div style={{marginBottom:'3rem'}}>
              <span style={eyebrow}>{L.eduTag}</span>
              <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.6rem,4vw,2.2rem)',fontWeight:900,color:T.white}}>{L.eduTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.eduSpan}</span></h2>
              <div style={rule}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              {edu.map((e,i)=>(
                <div key={i} className="edu-item" style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.4rem 1.6rem',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                    {e.imageUrl && (
                      <img
                        src={e.imageUrl} alt={e.school}
                        className="img-clickable"
                        onClick={()=>setLightbox({src:e.imageUrl!,alt:e.school})}
                        style={{width:48,height:48,objectFit:'contain',borderRadius:8,background:'rgba(255,255,255,0.06)',padding:4,flexShrink:0}}
                      />
                    )}
                    <div>
                      <div style={{fontFamily:'Playfair Display,serif',fontSize:'1rem',fontWeight:700,color:T.white,marginBottom:'.25rem'}}>{e.degree}</div>
                      <div style={{fontSize:'.85rem',color:T.gold,fontWeight:600,marginBottom:'.15rem'}}>{e.school}</div>
                      {e.note && <div style={{fontSize:'.75rem',color:T.rose,letterSpacing:1}}>{e.note}</div>}
                    </div>
                  </div>
                  <div style={{fontSize:'.78rem',color:T.muted,flexShrink:0,whiteSpace:'nowrap'}}>{e.period}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section className="about-sec" style={{padding:'6rem 3rem',background:T.bg}}>
          <div style={{maxWidth:1050,margin:'0 auto'}}>
            <div style={{marginBottom:'3rem'}}>
              <span style={eyebrow}>{L.certTag}</span>
              <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.6rem,4vw,2.2rem)',fontWeight:900,color:T.white}}>{L.certTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.certSpan}</span></h2>
              <div style={rule}/>
            </div>
            <div className="certs-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1rem'}}>
              {certs.map((c,i)=>(
                <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:'1rem 1.25rem',display:'flex',alignItems:'center',gap:'.8rem'}}>
                  {c.imageUrl
                    ? <img
                        src={c.imageUrl} alt={c.name}
                        className="img-clickable"
                        onClick={()=>setLightbox({src:c.imageUrl!,alt:c.name})}
                        style={{width:40,height:40,objectFit:'contain',borderRadius:6,background:'rgba(255,255,255,0.05)',padding:3,flexShrink:0}}
                      />
                    : <div style={{width:7,height:7,borderRadius:'50%',background:T.gold,flexShrink:0}}/>
                  }
                  <span style={{fontSize:'.85rem',color:T.text2,lineHeight:1.5}}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section className="about-sec" style={{padding:'6rem 3rem',background:T.bg2}}>
          <div style={{maxWidth:1050,margin:'0 auto'}}>
            <div style={{marginBottom:'3rem'}}>
              <span style={eyebrow}>{L.skillTag}</span>
              <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.6rem,4vw,2.2rem)',fontWeight:900,color:T.white}}>{L.skillTitle} <span style={{color:T.gold,fontStyle:'italic'}}>{L.skillSpan}</span></h2>
              <div style={rule}/>
            </div>
            <div className="skills-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))',gap:'1.4rem'}}>
              {skills.map((s,i)=>(
                <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.6rem'}}>
                  <h3 style={{fontFamily:'Playfair Display,serif',fontSize:'1rem',color:T.gold,fontWeight:700,marginBottom:'1rem'}}>{lang==='ar'?s.cat_ar:s.cat_en}</h3>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'.4rem'}}>
                    {s.items.split(',').map(item=>item.trim()).filter(Boolean).map((item,j)=>(
                      <span key={j} style={{padding:'.3rem .75rem',background:'rgba(138,31,50,0.2)',border:`1px solid ${T.border}`,borderRadius:20,fontSize:'.8rem',color:T.text2}}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <SharedFooter lang={lang} />
      </main>
    </>
  );
}