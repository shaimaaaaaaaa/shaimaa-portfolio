'use client';
import { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const T = {
  bg:'#0e0608', bg2:'#140a0c', card:'#1a0c10', burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', white:'#ffffff',
  text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)', rose:'#d07080',
};

const LANG = {
  en: {
    langBtn:'العربية', dir:'ltr',
    eyebrow:'dashboard', welcome:'Welcome Back,', name:'Shaimaa',
    viewSite:'View Site', signOut:'Sign Out',
    sections:[
      { href:'/admin/projects',  icon:'▣', label:'Projects',  sub:'Add, edit, and remove projects' },
      { href:'/admin/courses',   icon:'◈', label:'Courses',   sub:'Manage video lessons and quizzes' },
      { href:'/admin/articles',  icon:'✍', label:'Articles',  sub:'Write and manage blog posts' },
      { href:'/admin/messages',  icon:'◉', label:'Messages',  sub:'View contact form submissions' },
      { href:'/admin/settings',  icon:'◎', label:'Settings',  sub:'Update profile and site info' },
    ],
  },
  ar: {
    langBtn:'English', dir:'rtl',
    eyebrow:'لوحة التحكم', welcome:'أهلاً،', name:'شيماء',
    viewSite:'عرض الموقع', signOut:'تسجيل الخروج',
    sections:[
      { href:'/admin/projects',  icon:'▣', label:'المشاريع',  sub:'إضافة وتعديل وحذف المشاريع' },
      { href:'/admin/courses',   icon:'◈', label:'الكورسات',  sub:'إدارة الدروس والكويز' },
      { href:'/admin/articles',  icon:'✍', label:'المقالات',  sub:'كتابة وإدارة المقالات' },
      { href:'/admin/messages',  icon:'◉', label:'الرسائل',   sub:'عرض رسائل نموذج التواصل' },
      { href:'/admin/settings',  icon:'◎', label:'الإعدادات', sub:'تحديث الملف الشخصي ومعلومات الموقع' },
    ],
  },
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [email,   setEmail]   = useState('');
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
    const unsub = onAuthStateChanged(auth, user => {
      if (!user) router.push('/admin/login');
      else { setEmail(user.email || ''); setLoading(false); }
    });
    return () => unsub();
  }, [router]);

  const L = LANG[lang];

  if (loading) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif',fontSize:'1.1rem'}}>Loading...</p>
    </main>
  );

  return (
    <main style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir as 'ltr'|'rtl'}}>
      <div style={{position:'fixed',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.3) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none',zIndex:0}}/>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,padding:'1.1rem 3rem',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`,boxShadow:'0 2px 40px rgba(0,0,0,0.8)'}}>
        <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:T.goldL,fontWeight:700,letterSpacing:1}}>✦ Admin Panel</span>
        <div style={{display:'flex',alignItems:'center',gap:'1.5rem'}}>
          <span style={{fontSize:'.85rem',color:T.muted}}>{email}</span>
          <button onClick={()=>setLang(lang==='en'?'ar':'en')}
            style={{padding:'.4rem 1rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:20,color:T.gold,fontSize:'.82rem',fontWeight:700,cursor:'pointer'}}>
            {L.langBtn}
          </button>
          <Link href="/" style={{fontSize:'.85rem',color:T.text2,textDecoration:'none',fontWeight:600}} onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)} onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>{L.viewSite}</Link>
          <button onClick={()=>signOut(auth).then(()=>router.push('/admin/login'))}
            style={{padding:'.45rem 1.2rem',background:'rgba(138,31,50,0.3)',border:`1px solid rgba(138,31,50,0.5)`,borderRadius:20,color:T.rose,fontSize:'.85rem',fontWeight:700,cursor:'pointer'}}>
            {L.signOut}
          </button>
        </div>
      </nav>

      <div style={{maxWidth:1000,margin:'0 auto',padding:'4rem 2rem',position:'relative',zIndex:1}}>
        <div style={{marginBottom:'3.5rem'}}>
          <span style={{fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'}}>{L.eyebrow}</span>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'2.6rem',fontWeight:900,color:T.white}}>
            {L.welcome} <span style={{color:T.goldL,fontStyle:'italic'}}>{L.name}</span>
          </h1>
          <div style={{width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'1.5rem'}}>
          {L.sections.map(({href,icon,label,sub}) => (
            <Link key={href} href={href} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'2rem',textDecoration:'none',display:'flex',flexDirection:'column',gap:'.75rem',transition:'all .3s'}}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.borderColor='rgba(201,160,72,0.5)';el.style.transform='translateY(-5px)';el.style.boxShadow='0 20px 50px rgba(0,0,0,0.5)';}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.borderColor=T.border;el.style.transform='translateY(0)';el.style.boxShadow='none';}}>
              <div style={{width:48,height:48,borderRadius:12,background:'rgba(138,31,50,0.35)',border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem',color:T.goldL}}>
                {icon}
              </div>
              <div>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem',fontWeight:700,color:T.white,marginBottom:'.3rem'}}>{label}</div>
                <div style={{fontSize:'.82rem',color:T.muted,lineHeight:1.6}}>{sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}