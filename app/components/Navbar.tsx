'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const T = {
  gold:'#c9a048', goldL:'#e2bb60', rose:'#d07080',
  text2:'#d4c4bc', muted:'#8a7268', border:'rgba(200,158,72,0.2)',
};

const LINKS = {
  en: [['/','Home'],['/about','About'],['/#projects','Projects'],['/#courses','Courses'],['/articles','Articles'],['/#contact','Contact']] as [string,string][],
  ar: [['/','الرئيسية'],['/about','عني'],['/#projects','المشاريع'],['/#courses','الكورسات'],['/articles','المقالات'],['/#contact','تواصل']] as [string,string][],
};

interface NavbarProps {
  lang: 'en'|'ar';
  onLangChange: (l:'en'|'ar') => void;
  showAdmin?: boolean;
}

export default function Navbar({ lang, onLangChange, showAdmin=false }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const links = LINKS[lang];
  const langBtn = lang==='en' ? 'العربية' : 'English';

  // Close menu on resize
  useEffect(() => {
    const fn = () => { if(window.innerWidth > 768) setOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  return (
    <>
      <style>{`
        .nb-desktop { display:flex; }
        .nb-hamburger { display:none; }
        @media(max-width:768px){
          .nb-desktop { display:none !important; }
          .nb-hamburger { display:flex !important; }
        }
      `}</style>

      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:1000,background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`,boxShadow:'0 2px 40px rgba(0,0,0,0.8)'}}>

        {/* TOP ROW */}
        <div style={{padding:'.9rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <Link href="/" style={{fontFamily:'Playfair Display,serif',fontSize:'1.15rem',color:T.goldL,fontWeight:700,textDecoration:'none',letterSpacing:1,flexShrink:0}}>
            ✦ Shaimaa Kalel
          </Link>

          {/* DESKTOP */}
          <div className="nb-desktop" style={{gap:'1.4rem',alignItems:'center',flexWrap:'nowrap'}}>
            {links.map(([h,l])=>(
              <a key={h} href={h} style={{color:T.text2,textDecoration:'none',fontSize:'.9rem',fontWeight:600,whiteSpace:'nowrap',transition:'color .2s'}}
                onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)}
                onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>{l}</a>
            ))}
            <button onClick={()=>onLangChange(lang==='en'?'ar':'en')}
              style={{padding:'.38rem .9rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:20,color:T.gold,fontSize:'.8rem',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>
              {langBtn}
            </button>
            {showAdmin && (
              <Link href="/admin/login" style={{padding:'.38rem .9rem',background:'rgba(138,31,50,0.3)',border:`1px solid rgba(138,31,50,0.5)`,borderRadius:20,color:T.rose,textDecoration:'none',fontSize:'.8rem',fontWeight:700,whiteSpace:'nowrap'}}>
                Admin
              </Link>
            )}
          </div>

          {/* HAMBURGER */}
          <button className="nb-hamburger" onClick={()=>setOpen(!open)}
            style={{flexDirection:'column',gap:5,background:'none',border:'none',cursor:'pointer',padding:6,flexShrink:0}}>
            <span style={{width:22,height:2,background:open?T.goldL:T.text2,display:'block',transition:'all .3s',transform:open?'rotate(45deg) translate(5px,5px)':'none'}}/>
            <span style={{width:22,height:2,background:open?T.goldL:T.text2,display:'block',transition:'all .3s',opacity:open?0:1}}/>
            <span style={{width:22,height:2,background:open?T.goldL:T.text2,display:'block',transition:'all .3s',transform:open?'rotate(-45deg) translate(5px,-5px)':'none'}}/>
          </button>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div style={{borderTop:`1px solid ${T.border}`,padding:'1rem 1.25rem 1.5rem',display:'flex',flexDirection:'column',gap:'.6rem'}}>
            {links.map(([h,l])=>(
              <a key={h} href={h} onClick={()=>setOpen(false)}
                style={{color:T.text2,textDecoration:'none',fontSize:'1rem',fontWeight:600,padding:'.5rem 0',borderBottom:`1px solid rgba(200,158,72,0.07)`}}>
                {l}
              </a>
            ))}
            <div style={{display:'flex',gap:'.75rem',marginTop:'.5rem'}}>
              <button onClick={()=>{onLangChange(lang==='en'?'ar':'en');setOpen(false);}}
                style={{flex:1,padding:'.65rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:10,color:T.gold,fontSize:'.92rem',fontWeight:700,cursor:'pointer'}}>
                {langBtn}
              </button>
              {showAdmin && (
                <Link href="/admin/login" onClick={()=>setOpen(false)}
                  style={{flex:1,padding:'.65rem',background:'rgba(138,31,50,0.3)',border:`1px solid rgba(138,31,50,0.5)`,borderRadius:10,color:T.rose,textDecoration:'none',fontSize:'.92rem',fontWeight:700,textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  Admin
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}