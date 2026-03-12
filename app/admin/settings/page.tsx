'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const T = {
  bg:'#0e0608', card:'#1a0c10', burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', white:'#ffffff',
  text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)', rose:'#d07080', green:'#4ade80',
};

const LANG = {
  en: {
    langBtn:'العربية', dir:'ltr',
    eyebrow:'admin panel', title:'Site', span:'Settings',
    dashboard:'Dashboard',
    profileTitle:'Profile Info', statsTitle:'Stats', socialTitle:'Social Links',
    name:'Full Name', titleField:'Title / Tagline', bio:'Bio',
    location:'Location', university:'University',
    statsProjects:'Projects (e.g. 12+)', statsCerts:'Certifications (e.g. 8+)',
    statsYears:'Years Experience (e.g. 3+)', statsGrad:'Graduation Year (e.g. 2025)',
    email:'Email Address', linkedin:'LinkedIn URL', github:'GitHub URL',
    instagram:'Instagram URL', tiktok:'TikTok URL',
    whatsapp:'WhatsApp Number (e.g. 971501234567)',
    saving:'Saving...', save:'Save Settings ♥', saved:'✓ Saved successfully!',
  },
  ar: {
    langBtn:'English', dir:'rtl',
    eyebrow:'لوحة التحكم', title:'إعدادات', span:'الموقع',
    dashboard:'لوحة التحكم',
    profileTitle:'معلومات الملف الشخصي', statsTitle:'الإحصائيات', socialTitle:'روابط التواصل',
    name:'الاسم الكامل', titleField:'العنوان / الوصف', bio:'نبذة عني',
    location:'الموقع', university:'الجامعة',
    statsProjects:'المشاريع (مثال: 12+)', statsCerts:'الشهادات (مثال: 8+)',
    statsYears:'سنوات الخبرة (مثال: 3+)', statsGrad:'سنة التخرج (مثال: 2025)',
    email:'البريد الإلكتروني', linkedin:'رابط LinkedIn', github:'رابط GitHub',
    instagram:'رابط Instagram', tiktok:'رابط TikTok',
    whatsapp:'رقم الواتساب (مثال: 971501234567)',
    saving:'جاري الحفظ...', save:'حفظ الإعدادات ♥', saved:'✓ تم الحفظ بنجاح!',
  },
};

const DEFAULTS = {
  name:'Shaimaa Kalel', title:'Software Engineer · Human-Centered Agility · Content Creator',
  bio:'Combining Technical Skills with an Agile Mindset to build real systems that serve real people.',
  location:'Abu Dhabi, UAE', university:'University of Bolton',
  email:'', linkedin:'', github:'', instagram:'', tiktok:'', whatsapp:'',
  stats_projects:'12+', stats_certs:'8+', stats_years:'3+', stats_grad:'2025',
};

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [form,    setForm]    = useState(DEFAULTS);
  const [lang,    setLang]    = useState<'en'|'ar'>('en');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('lang') as 'en'|'ar';
    if (saved === 'ar' || saved === 'en') setLang(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang, mounted]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) { router.push('/admin/login'); return; }
      const d = await getDoc(doc(db,'settings','main'));
      if (d.exists()) setForm({...DEFAULTS,...d.data()});
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  async function handleSave() {
    setSaving(true);
    await setDoc(doc(db,'settings','main'), form);
    setSaving(false);
    setSaved(true);
    setTimeout(()=>setSaved(false), 3000);
  }

  const inp = (b=T.border): React.CSSProperties => ({
    width:'100%', padding:'.85rem 1rem', background:'rgba(255,255,255,0.04)',
    border:`1px solid ${b}`, borderRadius:10, color:T.text,
    fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif", fontSize:'.95rem', outline:'none', transition:'border-color .2s',
  });

  const F = (key:keyof typeof DEFAULTS, placeholder:string, opts?:{dir?:'ltr',area?:boolean,rows?:number}) => (
    opts?.area
      ? <textarea placeholder={placeholder} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
          rows={opts.rows||3} style={{...inp(),resize:'vertical',direction:opts.dir||'inherit'}}
          onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
      : <input placeholder={placeholder} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
          style={{...inp(),direction:opts?.dir||'inherit'}}
          onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
  );

  const L = LANG[lang];

  if (loading) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  return (
    <main style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir as 'ltr'|'rtl'}}>
      <div style={{position:'fixed',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.3) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none',zIndex:0}}/>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`}}>
        <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',color:T.goldL,fontWeight:700}}>♥ Admin Panel</span>
        <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
          <button onClick={()=>setLang(lang==='en'?'ar':'en')}
            style={{padding:'.4rem 1rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:20,color:T.gold,fontSize:'.82rem',fontWeight:700,cursor:'pointer'}}>
            {L.langBtn}
          </button>
          <Link href="/admin/dashboard" style={{fontSize:'.88rem',color:T.text2,textDecoration:'none',fontWeight:600}}
            onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)}
            onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>
            {L.dashboard}
          </Link>
        </div>
      </nav>

      <div style={{maxWidth:900,margin:'0 auto',padding:'3.5rem 2rem',position:'relative',zIndex:1}}>
        <div style={{marginBottom:'3rem'}}>
          <span style={{fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'}}>{L.eyebrow}</span>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'2.4rem',fontWeight:900,color:T.white}}>
            {L.title} <span style={{color:T.gold,fontStyle:'italic'}}>{L.span}</span>
          </h1>
          <div style={{width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>

          {/* PROFILE */}
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2rem'}}>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem',color:T.gold,fontWeight:700,marginBottom:'1.25rem'}}>{L.profileTitle}</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              {F('name', L.name)}
              {F('title', L.titleField)}
              {F('bio', L.bio, {area:true, rows:4})}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                {F('location', L.location)}
                {F('university', L.university)}
              </div>
            </div>
          </div>

          {/* STATS */}
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2rem'}}>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem',color:T.gold,fontWeight:700,marginBottom:'1.25rem'}}>{L.statsTitle}</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              {F('stats_projects', L.statsProjects)}
              {F('stats_certs',    L.statsCerts)}
              {F('stats_years',    L.statsYears)}
              {F('stats_grad',     L.statsGrad)}
            </div>
          </div>

          {/* SOCIAL */}
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2rem'}}>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem',color:T.gold,fontWeight:700,marginBottom:'1.25rem'}}>{L.socialTitle}</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              {F('email',    L.email,    {dir:'ltr'})}
              {F('linkedin', L.linkedin, {dir:'ltr'})}
              {F('github',   L.github,   {dir:'ltr'})}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                {F('instagram', L.instagram, {dir:'ltr'})}
                {F('tiktok',    L.tiktok,    {dir:'ltr'})}
              </div>
              {F('whatsapp', L.whatsapp, {dir:'ltr'})}
            </div>
          </div>

          {/* SAVE */}
          <div style={{display:'flex',alignItems:'center',gap:'1.25rem'}}>
            <button onClick={handleSave} disabled={saving}
              style={{padding:'.95rem 2.5rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'1rem',cursor:saving?'not-allowed':'pointer',opacity:saving?.6:1,boxShadow:`0 4px 20px rgba(138,31,50,0.4)`}}>
              {saving ? L.saving : L.save}
            </button>
            {saved && <span style={{color:T.green,fontWeight:600,fontSize:'.95rem'}}>{L.saved}</span>}
          </div>
        </div>
      </div>
    </main>
  );
}