'use client';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import Link from 'next/link';

const T = {
  bg:'#0e0608', bg2:'#140a0c', card:'#1a0c10',
  burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', rose:'#d07080',
  white:'#ffffff', text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)',
};

const LANG = {
  en: {
    dir:'ltr', langBtn:'العربية',
    eyebrow:'thoughts & ideas', title:'My', span:'Articles',
    noArticles:'No articles yet. Check back soon!',
    readMore:'Read More →', minRead:'min read',
    filters:[['all','All'],['agile','Agile'],['tech','Tech'],['career','Career']] as [string,string][],
    navLinks:[['/','Home'],['/about','About'],['/articles','Articles'],['#contact','Contact']] as [string,string][],
  },
  ar: {
    dir:'rtl', langBtn:'English',
    eyebrow:'أفكار ومقالات', title:'', span:'مقالاتي',
    noArticles:'لا توجد مقالات بعد، تابعينا قريباً!',
    readMore:'اقرأ المزيد ←', minRead:'دقيقة قراءة',
    filters:[['all','الكل'],['agile','Agile'],['tech','تقنية'],['career','مسيرة']] as [string,string][],
    navLinks:[['/','الرئيسية'],['/about','عني'],['/articles','المقالات'],['#contact','تواصل']] as [string,string][],
  },
};

interface Article {
  id:string; title:string; title_ar:string; excerpt:string; excerpt_ar:string;
  category:string; readTime:number; createdAt?:{seconds:number}; coverColor?:string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filter,   setFilter]   = useState('all');
  const [lang,     setLang]     = useState<'en'|'ar'>('en');
  const [mounted,  setMounted]  = useState(false);

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
    const q = query(collection(db,'articles'), orderBy('createdAt','desc'));
    getDocs(q).then(s => setArticles(s.docs.map(d=>({id:d.id,...d.data()} as Article))))
      .catch(() => getDocs(collection(db,'articles')).then(s => setArticles(s.docs.map(d=>({id:d.id,...d.data()} as Article)))));
  }, []);

  const L = LANG[lang];
  const filtered = filter === 'all' ? articles : articles.filter(a => a.category === filter);

  const eyebrow: React.CSSProperties = {fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'};

  function formatDate(a: Article) {
    if (!a.createdAt?.seconds) return '';
    return new Date(a.createdAt.seconds*1000).toLocaleDateString(lang==='ar'?'ar-AE':'en-GB',{day:'numeric',month:'long',year:'numeric'});
  }

  if (!mounted) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  return (
    <main style={{background:T.bg,color:T.text,minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir as 'ltr'|'rtl'}}>
      <div style={{position:'fixed',width:700,height:700,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.3) 0%,transparent 65%)',top:-250,right:-200,pointerEvents:'none',zIndex:0}}/>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:1000,padding:'1.1rem 3rem',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`}}>
        <Link href="/" style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:T.goldL,fontWeight:700,letterSpacing:1,textDecoration:'none'}}>✦ Shaimaa Kalel</Link>
        <div style={{display:'flex',gap:'2rem',alignItems:'center',flexWrap:'wrap'}}>
          {L.navLinks.map(([h,l])=>(
            <a key={h} href={h} style={{color:T.text2,textDecoration:'none',fontSize:'1rem',fontWeight:600,transition:'color .2s'}}
              onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)}
              onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>{l}</a>
          ))}
          <button onClick={()=>setLang(lang==='en'?'ar':'en')}
            style={{padding:'.45rem 1.2rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:20,color:T.gold,fontSize:'.85rem',fontWeight:700,cursor:'pointer'}}>
            {L.langBtn}
          </button>
        </div>
      </nav>

      <div style={{maxWidth:1050,margin:'0 auto',padding:'8rem 2rem 5rem',position:'relative',zIndex:1}}>
        {/* HEADER */}
        <div style={{marginBottom:'3.5rem'}}>
          <span style={eyebrow}>{L.eyebrow}</span>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(2.4rem,5vw,3.5rem)',fontWeight:900,color:T.white}}>
            {L.title} <span style={{color:T.gold,fontStyle:'italic'}}>{L.span}</span>
          </h1>
          <div style={{width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
        </div>

        {/* FILTERS */}
        <div style={{display:'flex',gap:'.55rem',flexWrap:'wrap',marginBottom:'2.5rem'}}>
          {L.filters.map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)}
              style={{padding:'.5rem 1.2rem',background:filter===v?'rgba(138,31,50,0.5)':'transparent',border:`1px solid ${filter===v?T.burg:T.border}`,borderRadius:24,color:filter===v?T.white:T.text2,fontSize:'.88rem',fontWeight:600,cursor:'pointer',transition:'all .2s'}}>
              {l}
            </button>
          ))}
        </div>

        {/* ARTICLES GRID */}
        {filtered.length === 0 && (
          <div style={{textAlign:'center',padding:'5rem',color:T.muted,fontSize:'1rem'}}>{L.noArticles}</div>
        )}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'1.75rem'}}>
          {filtered.map(a=>(
            <Link key={a.id} href={`/articles/${a.id}`} style={{textDecoration:'none',display:'flex',flexDirection:'column',background:'#1a0c10',border:`1px solid ${T.border}`,borderRadius:18,overflow:'hidden',transition:'all .3s'}}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.transform='translateY(-6px)';el.style.borderColor='rgba(201,160,72,0.5)';el.style.boxShadow='0 24px 60px rgba(0,0,0,0.6)';}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLAnchorElement;el.style.transform='translateY(0)';el.style.borderColor=T.border;el.style.boxShadow='none';}}>
              {/* COVER */}
              <div style={{height:160,background:a.coverColor||`linear-gradient(135deg,${T.burg},#1a0c10)`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,backgroundSize:'40px 40px',opacity:.3}}/>
                <span style={{fontFamily:'Playfair Display,serif',fontSize:'2.5rem',color:'rgba(255,255,255,0.15)',fontWeight:900,position:'relative',zIndex:1}}>✦</span>
              </div>
              {/* CONTENT */}
              <div style={{padding:'1.5rem',flex:1,display:'flex',flexDirection:'column'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
                  <span style={{fontSize:'.68rem',color:T.rose,letterSpacing:2,textTransform:'uppercase',fontFamily:'Playfair Display,serif'}}>{a.category}</span>
                  <span style={{fontSize:'.75rem',color:T.muted}}>{a.readTime} {L.minRead}</span>
                </div>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.15rem',fontWeight:700,color:T.white,marginBottom:'.65rem',lineHeight:1.4}}>
                  {lang==='ar' ? a.title_ar||a.title : a.title}
                </div>
                <div style={{fontSize:'.88rem',color:T.text2,lineHeight:2,flex:1,marginBottom:'1.25rem'}}>
                  {lang==='ar' ? a.excerpt_ar||a.excerpt : a.excerpt}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'.9rem',borderTop:`1px solid rgba(200,158,72,0.12)`}}>
                  <span style={{fontSize:'.78rem',color:T.muted}}>{formatDate(a)}</span>
                  <span style={{fontSize:'.85rem',color:T.gold,fontWeight:700}}>{L.readMore}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}