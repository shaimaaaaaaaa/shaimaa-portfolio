'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const T = {
  bg:'#0e0608', card:'#1a0c10', burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', white:'#ffffff',
  text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)', rose:'#d07080', green:'#4ade80',
};

interface EduItem  { degree:string; school:string; period:string; note:string; }
interface SkillCat { cat_en:string; cat_ar:string; items:string; }

const LANG = {
  en: { langBtn:'العربية', dir:'ltr',
    title:'About', span:'Page Editor',
    eyebrow:'admin panel', dashboard:'Dashboard',
    secProfile:'Profile Info', secStats:'Stats (Auto + Manual)',
    secEdu:'Education', secCerts:'Certifications', secSkills:'Skills & Tools',
    nameL:'Full Name', nameArL:'Name in Arabic', titleL:'Title / Tagline', titleArL:'Title in Arabic',
    bioL:'Bio (English)', bioArL:'Bio (Arabic)',
    locationL:'Location', uniL:'University',
    autoNote:'⚡ Auto-calculated from your data:',
    manualNote:'Manual overrides (leave blank to use auto):',
    statsProj:'Projects override', statsCerts:'Certs override',
    statsYears:'Years Experience', statsGrad:'Graduation Year',
    degreeL:'Degree', schoolL:'School/University', periodL:'Period', noteL:'Note (optional)',
    addEdu:'+ Add Education', removeL:'Remove',
    certL:'Certification name (e.g. Scrum Master — IBM)',
    addCert:'+ Add Certification',
    catEnL:'Category (English)', catArL:'Category (Arabic)',
    itemsL:'Skills (comma separated)', addSkill:'+ Add Skill Category',
    saving:'Saving...', save:'Save All Changes ♥', saved:'✓ Saved!',
  },
  ar: { langBtn:'English', dir:'rtl',
    title:'تعديل', span:'صفحة عني',
    eyebrow:'لوحة التحكم', dashboard:'لوحة التحكم',
    secProfile:'المعلومات الشخصية', secStats:'الإحصائيات (تلقائي + يدوي)',
    secEdu:'التعليم', secCerts:'الشهادات', secSkills:'المهارات والأدوات',
    nameL:'الاسم (إنجليزي)', nameArL:'الاسم (عربي)', titleL:'العنوان (إنجليزي)', titleArL:'العنوان (عربي)',
    bioL:'نبذة (إنجليزي)', bioArL:'نبذة (عربي)',
    locationL:'الموقع', uniL:'الجامعة',
    autoNote:'⚡ محسوبة تلقائياً من بياناتك:',
    manualNote:'تجاوز يدوي (اتركيه فارغاً للاستخدام التلقائي):',
    statsProj:'تجاوز المشاريع', statsCerts:'تجاوز الشهادات',
    statsYears:'سنوات الخبرة', statsGrad:'سنة التخرج',
    degreeL:'الدرجة العلمية', schoolL:'الجامعة/المؤسسة', periodL:'الفترة', noteL:'ملاحظة (اختياري)',
    addEdu:'+ إضافة تعليم', removeL:'حذف',
    certL:'اسم الشهادة (مثال: Scrum Master — IBM)',
    addCert:'+ إضافة شهادة',
    catEnL:'الفئة (إنجليزي)', catArL:'الفئة (عربي)',
    itemsL:'المهارات (مفصولة بفاصلة)', addSkill:'+ إضافة فئة مهارات',
    saving:'جاري الحفظ...', save:'حفظ كل التغييرات ♥', saved:'✓ تم الحفظ!',
  },
};

const DEFAULT_EDU: EduItem[] = [
  { degree:'BEng (Hons) Software Engineering', school:'University of Bolton', period:'Oct 2022 – Aug 2025', note:'Human-Centered Agility' },
  { degree:'L4/L5 HND Computer Science', school:'NCC Education', period:'Oct 2022 – Jun 2024', note:'' },
  { degree:'Agile Software Developer Nanodegree', school:'Udacity', period:'Dec 2023 – Apr 2024', note:'Nanodegree' },
  { degree:'Software Engineering Specialization', school:'HKUST', period:'2024', note:'' },
];

const DEFAULT_CERTS: string[] = [
  'IT Fundamentals — IBM','UI/UX Design — IBM','Front-End Development — IBM',
  'Intro to Software Engineering — IBM (with Honors)',
  'Scrum Master — SKILL-UP EDTECH (with Honors)','Software Engineering — HKUST (×3)',
];

const DEFAULT_SKILLS: SkillCat[] = [
  { cat_en:'Languages & Frameworks', cat_ar:'لغات البرمجة والـ Frameworks', items:'C#,WinForms,SQL,ADO.NET,Laravel,Next.js,Firebase,WordPress' },
  { cat_en:'Agile & Project Management', cat_ar:'Agile وإدارة المشاريع', items:'Scrum,Kanban,DSDM,Jira,Trello' },
  { cat_en:'Design & Analysis', cat_ar:'التصميم والتحليل', items:'ERD,DFD,UI/UX Design,Agile Leadership' },
];

export default function AdminAbout() {
  const router = useRouter();
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [lang,     setLang]     = useState<'en'|'ar'>('en');
  const [mounted,  setMounted]  = useState(false);

  // auto counts
  const [autoProjects, setAutoProjects] = useState(0);
  const [autoCerts,    setAutoCerts]    = useState(0);

  // profile fields
  const [name,      setName]     = useState('Shaimaa Kalel');
  const [nameAr,    setNameAr]   = useState('شيماء خليل');
  const [titleEn,   setTitleEn]  = useState('Software Engineer · Human-Centered Agility · Content Creator');
  const [titleAr,   setTitleAr]  = useState('مهندسة برمجيات · Human-Centered Agility · صانعة محتوى');
  const [bioEn,     setBioEn]    = useState('');
  const [bioAr,     setBioAr]    = useState('');
  const [location,  setLocation] = useState('Abu Dhabi, UAE');
  const [university,setUniversity] = useState('University of Bolton');

  // manual stat overrides
  const [overrideProj,  setOverrideProj]  = useState('');
  const [overrideCerts, setOverrideCerts] = useState('');
  const [statsYears,    setStatsYears]    = useState('3+');
  const [statsGrad,     setStatsGrad]     = useState('2025');

  // sections
  const [edu,    setEdu]    = useState<EduItem[]>(DEFAULT_EDU);
  const [certs,  setCerts]  = useState<string[]>(DEFAULT_CERTS);
  const [skills, setSkills] = useState<SkillCat[]>(DEFAULT_SKILLS);

  useEffect(() => {
    const s = localStorage.getItem('lang') as 'en'|'ar';
    if (s==='ar'||s==='en') setLang(s);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang==='ar'?'rtl':'ltr';
  }, [lang, mounted]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { router.push('/admin/login'); return; }

      // Load auto counts
      const [projSnap, certsCount] = await Promise.all([
        getDocs(collection(db,'projects')),
        Promise.resolve(0), // certs come from about doc
      ]);
      setAutoProjects(projSnap.size);

      // Load about data
      const d = await getDoc(doc(db,'about','main'));
      if (d.exists()) {
        const data = d.data();
        if (data.name)       setName(data.name);
        if (data.nameAr)     setNameAr(data.nameAr);
        if (data.titleEn)    setTitleEn(data.titleEn);
        if (data.titleAr)    setTitleAr(data.titleAr);
        if (data.bioEn)      setBioEn(data.bioEn);
        if (data.bioAr)      setBioAr(data.bioAr);
        if (data.location)   setLocation(data.location);
        if (data.university) setUniversity(data.university);
        if (data.overrideProj  !== undefined) setOverrideProj(data.overrideProj);
        if (data.overrideCerts !== undefined) setOverrideCerts(data.overrideCerts);
        if (data.statsYears)   setStatsYears(data.statsYears);
        if (data.statsGrad)    setStatsGrad(data.statsGrad);
        if (data.edu?.length)    setEdu(data.edu);
        if (data.certs?.length)  { setCerts(data.certs); setAutoCerts(data.certs.length); }
        if (data.skills?.length) setSkills(data.skills);
      } else {
        setAutoCerts(DEFAULT_CERTS.length);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  // auto update certs count whenever certs array changes
  useEffect(() => { setAutoCerts(certs.length); }, [certs]);

  async function handleSave() {
    setSaving(true);
    const data = {
      name, nameAr, titleEn, titleAr, bioEn, bioAr, location, university,
      overrideProj, overrideCerts, statsYears, statsGrad,
      // computed display values (what about page reads)
      stats_projects: overrideProj  || `${autoProjects}+`,
      stats_certs:    overrideCerts || `${autoCerts}`,
      stats_years:    statsYears,
      stats_grad:     statsGrad,
      edu, certs, skills,
    };
    await setDoc(doc(db,'about','main'), data);
    // also update settings/main for backward compat
    await setDoc(doc(db,'settings','main'), {
      name, title:titleEn, bio:bioEn, location, university,
      stats_projects: overrideProj  || `${autoProjects}+`,
      stats_certs:    overrideCerts || `${autoCerts}`,
      stats_years:    statsYears,
      stats_grad:     statsGrad,
    }, { merge:true });
    setSaving(false); setSaved(true);
    setTimeout(()=>setSaved(false), 3000);
  }

  // ── helpers ──
  const inp = (dir?:'ltr'|'rtl'): React.CSSProperties => ({
    width:'100%', padding:'.8rem 1rem', background:'rgba(255,255,255,0.04)',
    border:`1px solid ${T.border}`, borderRadius:10, color:T.text,
    fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif", fontSize:'.9rem', outline:'none',
    direction: dir||'inherit',
  });
  const label = (txt:string) => (
    <span style={{fontSize:'.75rem',color:T.muted,letterSpacing:1,display:'block',marginBottom:'.4rem'}}>{txt}</span>
  );
  const card = (children:React.ReactNode, title:string) => (
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'1.75rem',marginBottom:'1.25rem'}}>
      <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.05rem',color:T.gold,fontWeight:700,marginBottom:'1.5rem'}}>{title}</h2>
      {children}
    </div>
  );

  const L = LANG[lang];

  if (loading) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  return (
    <main style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir as 'ltr'|'rtl'}}>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`}}>
        <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.15rem',color:T.goldL,fontWeight:700}}>♥ Admin Panel</span>
        <div style={{display:'flex',gap:'1.25rem',alignItems:'center'}}>
          <button onClick={()=>setLang(lang==='en'?'ar':'en')}
            style={{padding:'.38rem .9rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:20,color:T.gold,fontSize:'.8rem',fontWeight:700,cursor:'pointer'}}>
            {L.langBtn}
          </button>
          <Link href="/admin/dashboard" style={{fontSize:'.85rem',color:T.text2,textDecoration:'none',fontWeight:600}}>
            {L.dashboard}
          </Link>
        </div>
      </nav>

      <div style={{maxWidth:900,margin:'0 auto',padding:'2.5rem 1.5rem 5rem',position:'relative',zIndex:1}}>

        {/* HEADER */}
        <div style={{marginBottom:'2.5rem'}}>
          <span style={{fontSize:'.7rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.5rem'}}>{L.eyebrow}</span>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.8rem,4vw,2.4rem)',fontWeight:900,color:T.white}}>
            {L.title} <span style={{color:T.gold,fontStyle:'italic'}}>{L.span}</span>
          </h1>
          <div style={{width:60,height:2,marginTop:'.75rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
        </div>

        {/* ── PROFILE ── */}
        {card(<>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
            <div>{label(L.nameL)}<input value={name} onChange={e=>setName(e.target.value)} style={inp('ltr')}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
            <div>{label(L.nameArL)}<input value={nameAr} onChange={e=>setNameAr(e.target.value)} style={inp('rtl')}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
            <div>{label(L.titleL)}<input value={titleEn} onChange={e=>setTitleEn(e.target.value)} style={inp('ltr')}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
            <div>{label(L.titleArL)}<input value={titleAr} onChange={e=>setTitleAr(e.target.value)} style={inp('rtl')}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
            <div>{label(L.bioL)}<textarea value={bioEn} onChange={e=>setBioEn(e.target.value)} rows={4} style={{...inp('ltr'),resize:'vertical'}}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
            <div>{label(L.bioArL)}<textarea value={bioAr} onChange={e=>setBioAr(e.target.value)} rows={4} style={{...inp('rtl'),resize:'vertical'}}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div>{label(L.locationL)}<input value={location} onChange={e=>setLocation(e.target.value)} style={inp()}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
            <div>{label(L.uniL)}<input value={university} onChange={e=>setUniversity(e.target.value)} style={inp()}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
          </div>
        </>, L.secProfile)}

        {/* ── STATS ── */}
        {card(<>
          {/* AUTO */}
          <div style={{background:'rgba(74,222,128,0.06)',border:`1px solid rgba(74,222,128,0.2)`,borderRadius:12,padding:'1rem 1.25rem',marginBottom:'1.5rem'}}>
            <p style={{fontSize:'.8rem',color:T.green,fontWeight:700,marginBottom:'.75rem'}}>{L.autoNote}</p>
            <div style={{display:'flex',gap:'1.5rem',flexWrap:'wrap'}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.8rem',fontWeight:700,color:T.goldL}}>{autoProjects}+</div>
                <div style={{fontSize:'.72rem',color:T.muted}}>Projects (from Firebase)</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.8rem',fontWeight:700,color:T.goldL}}>{autoCerts}</div>
                <div style={{fontSize:'.72rem',color:T.muted}}>Certifications (from list below)</div>
              </div>
            </div>
          </div>
          {/* MANUAL OVERRIDE */}
          <p style={{fontSize:'.78rem',color:T.muted,marginBottom:'.85rem'}}>{L.manualNote}</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div>{label(L.statsProj)}<input placeholder={`auto: ${autoProjects}+`} value={overrideProj} onChange={e=>setOverrideProj(e.target.value)} style={inp('ltr')}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
            <div>{label(L.statsCerts)}<input placeholder={`auto: ${autoCerts}`} value={overrideCerts} onChange={e=>setOverrideCerts(e.target.value)} style={inp('ltr')}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
            <div>{label(L.statsYears)}<input value={statsYears} onChange={e=>setStatsYears(e.target.value)} style={inp('ltr')}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
            <div>{label(L.statsGrad)}<input value={statsGrad} onChange={e=>setStatsGrad(e.target.value)} style={inp('ltr')}
              onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
          </div>
        </>, L.secStats)}

        {/* ── EDUCATION ── */}
        {card(<>
          <div style={{display:'flex',flexDirection:'column',gap:'.85rem'}}>
            {edu.map((e,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${T.border}`,borderRadius:12,padding:'1.1rem'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem',marginBottom:'.75rem'}}>
                  <div>{label(L.degreeL)}<input value={e.degree} onChange={ev=>{const n=[...edu];n[i]={...n[i],degree:ev.target.value};setEdu(n);}} style={inp()}
                    onFocus={ev=>ev.target.style.borderColor=T.gold} onBlur={ev=>ev.target.style.borderColor=T.border}/></div>
                  <div>{label(L.schoolL)}<input value={e.school} onChange={ev=>{const n=[...edu];n[i]={...n[i],school:ev.target.value};setEdu(n);}} style={inp()}
                    onFocus={ev=>ev.target.style.borderColor=T.gold} onBlur={ev=>ev.target.style.borderColor=T.border}/></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem'}}>
                  <div>{label(L.periodL)}<input value={e.period} onChange={ev=>{const n=[...edu];n[i]={...n[i],period:ev.target.value};setEdu(n);}} style={inp('ltr')}
                    onFocus={ev=>ev.target.style.borderColor=T.gold} onBlur={ev=>ev.target.style.borderColor=T.border}/></div>
                  <div style={{display:'flex',gap:'.5rem',alignItems:'flex-end'}}>
                    <div style={{flex:1}}>{label(L.noteL)}<input value={e.note} onChange={ev=>{const n=[...edu];n[i]={...n[i],note:ev.target.value};setEdu(n);}} style={inp()}
                      onFocus={ev=>ev.target.style.borderColor=T.gold} onBlur={ev=>ev.target.style.borderColor=T.border}/></div>
                    <button onClick={()=>setEdu(edu.filter((_,j)=>j!==i))}
                      style={{padding:'.8rem',background:'rgba(138,31,50,0.3)',border:`1px solid rgba(138,31,50,0.4)`,borderRadius:8,color:T.rose,cursor:'pointer',fontSize:'.8rem',flexShrink:0}}>✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>setEdu([...edu,{degree:'',school:'',period:'',note:''}])}
            style={{marginTop:'1rem',padding:'.65rem 1.25rem',background:'rgba(200,158,72,0.08)',border:`1px solid ${T.border}`,borderRadius:10,color:T.gold,fontSize:'.85rem',fontWeight:700,cursor:'pointer'}}>
            {L.addEdu}
          </button>
        </>, L.secEdu)}

        {/* ── CERTIFICATIONS ── */}
        {card(<>
          <div style={{display:'flex',flexDirection:'column',gap:'.6rem'}}>
            {certs.map((c,i)=>(
              <div key={i} style={{display:'flex',gap:'.6rem',alignItems:'center'}}>
                <input value={c} onChange={e=>{const n=[...certs];n[i]=e.target.value;setCerts(n);}}
                  placeholder={L.certL} style={{...inp(),flex:1}}
                  onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/>
                <button onClick={()=>setCerts(certs.filter((_,j)=>j!==i))}
                  style={{padding:'.8rem',background:'rgba(138,31,50,0.3)',border:`1px solid rgba(138,31,50,0.4)`,borderRadius:8,color:T.rose,cursor:'pointer',flexShrink:0}}>✕</button>
              </div>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'1rem',marginTop:'.85rem'}}>
            <button onClick={()=>setCerts([...certs,''])}
              style={{padding:'.65rem 1.25rem',background:'rgba(200,158,72,0.08)',border:`1px solid ${T.border}`,borderRadius:10,color:T.gold,fontSize:'.85rem',fontWeight:700,cursor:'pointer'}}>
              {L.addCert}
            </button>
            <span style={{fontSize:'.78rem',color:T.green}}>⚡ {autoCerts} certifications → stat auto-updates</span>
          </div>
        </>, L.secCerts)}

        {/* ── SKILLS ── */}
        {card(<>
          <div style={{display:'flex',flexDirection:'column',gap:'.85rem'}}>
            {skills.map((s,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.03)',border:`1px solid ${T.border}`,borderRadius:12,padding:'1.1rem'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem',marginBottom:'.75rem'}}>
                  <div>{label(L.catEnL)}<input value={s.cat_en} onChange={e=>{const n=[...skills];n[i]={...n[i],cat_en:e.target.value};setSkills(n);}} style={inp('ltr')}
                    onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
                  <div>{label(L.catArL)}<input value={s.cat_ar} onChange={e=>{const n=[...skills];n[i]={...n[i],cat_ar:e.target.value};setSkills(n);}} style={inp('rtl')}
                    onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
                </div>
                <div style={{display:'flex',gap:'.5rem',alignItems:'flex-end'}}>
                  <div style={{flex:1}}>{label(L.itemsL)}<input value={s.items} onChange={e=>{const n=[...skills];n[i]={...n[i],items:e.target.value};setSkills(n);}}
                    placeholder="React, Node.js, Firebase..." style={inp('ltr')}
                    onFocus={e=>e.target.style.borderColor=T.gold} onBlur={e=>e.target.style.borderColor=T.border}/></div>
                  <button onClick={()=>setSkills(skills.filter((_,j)=>j!==i))}
                    style={{padding:'.8rem',background:'rgba(138,31,50,0.3)',border:`1px solid rgba(138,31,50,0.4)`,borderRadius:8,color:T.rose,cursor:'pointer',flexShrink:0}}>✕</button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>setSkills([...skills,{cat_en:'',cat_ar:'',items:''}])}
            style={{marginTop:'1rem',padding:'.65rem 1.25rem',background:'rgba(200,158,72,0.08)',border:`1px solid ${T.border}`,borderRadius:10,color:T.gold,fontSize:'.85rem',fontWeight:700,cursor:'pointer'}}>
            {L.addSkill}
          </button>
        </>, L.secSkills)}

        {/* SAVE */}
        <div style={{display:'flex',alignItems:'center',gap:'1.25rem',marginTop:'.5rem'}}>
          <button onClick={handleSave} disabled={saving}
            style={{padding:'.9rem 2.25rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'1rem',cursor:saving?'not-allowed':'pointer',opacity:saving?.6:1,boxShadow:`0 4px 20px rgba(138,31,50,0.4)`}}>
            {saving ? L.saving : L.save}
          </button>
          {saved && <span style={{color:T.green,fontWeight:600}}>✓ {L.saved}</span>}
        </div>
      </div>
    </main>
  );
}