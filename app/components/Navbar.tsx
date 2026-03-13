'use client';
import { useState, useEffect } from 'react';
import { T } from '../lib/constants';
import type { Lang, LangData } from '../lib/constants';

interface NavbarProps {
  lang: Lang;
  L: LangData;
  onLangChange: (l: Lang) => void;
}

export default function Navbar({ lang, L, onLangChange }: NavbarProps) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // close menu on resize to desktop
  useEffect(() => {
    const fn = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const navBg = scrolled
    ? 'rgba(14,6,8,0.97)'
    : 'transparent';

  const navBorder = scrolled
    ? `1px solid ${T.border}`
    : '1px solid transparent';

  const navShadow = scrolled
    ? '0 2px 40px rgba(0,0,0,0.8)'
    : 'none';

  return (
    <>
      <style>{`
        .nav-desktop { display:flex !important; }
        .nav-burger  { display:none !important; }
        @media(max-width:768px){
          .nav-desktop { display:none !important; }
          .nav-burger  { display:flex !important; }
        }
      `}</style>

      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:1000,
        background: navBg,
        backdropFilter: scrolled ? 'blur(32px)' : 'none',
        borderBottom: navBorder,
        boxShadow: navShadow,
        transition: 'background .35s, border-color .35s, box-shadow .35s',
      }}>
        {/* TOP ROW */}
        <div style={{
          padding:'.95rem 3rem',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          maxWidth:1280, margin:'0 auto',
        }}>
          {/* LOGO */}
          <a href="/" style={{
            fontFamily:'Playfair Display,serif', fontSize:'1.2rem',
            color:T.goldL, fontWeight:700, letterSpacing:1,
            textDecoration:'none', flexShrink:0,
          }}>
            ♥ Shaimaa Kalel
          </a>

          {/* DESKTOP LINKS */}
          <div className="nav-desktop" style={{ gap:'2rem', alignItems:'center' }}>
            {L.navLinks.map(([h,l]) => (
              <a key={h} href={h} style={{
                color: T.text2, textDecoration:'none',
                fontSize:'.9rem', fontWeight:600, whiteSpace:'nowrap', transition:'color .2s',
              }}
                onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)}
                onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>
                {l}
              </a>
            ))}
            <button onClick={() => onLangChange(lang==='en'?'ar':'en')} style={{
              padding:'.42rem 1.1rem',
              background:'rgba(200,158,72,0.1)',
              border:`1px solid ${T.border}`,
              borderRadius:20, color:T.gold,
              fontSize:'.82rem', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
            }}>
              {L.langBtn}
            </button>
          </div>

          {/* HAMBURGER */}
          <button className="nav-burger" onClick={() => setMenuOpen(!menuOpen)} style={{
            flexDirection:'column', gap:5,
            background:'none', border:'none', cursor:'pointer', padding:6, flexShrink:0,
          }}>
            <span style={{ width:22, height:2, background:menuOpen?T.goldL:T.text2, display:'block', transition:'all .3s', transform:menuOpen?'rotate(45deg) translate(5px,5px)':'none' }}/>
            <span style={{ width:22, height:2, background:menuOpen?T.goldL:T.text2, display:'block', transition:'all .3s', opacity:menuOpen?0:1 }}/>
            <span style={{ width:22, height:2, background:menuOpen?T.goldL:T.text2, display:'block', transition:'all .3s', transform:menuOpen?'rotate(-45deg) translate(5px,-5px)':'none' }}/>
          </button>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div style={{
            borderTop:`1px solid ${T.border}`,
            background:'rgba(14,6,8,0.98)',
            padding:'1rem 1.5rem 1.5rem',
            display:'flex', flexDirection:'column', gap:'.65rem',
          }}>
            {L.navLinks.map(([h,l]) => (
              <a key={h} href={h} onClick={() => setMenuOpen(false)} style={{
                color:T.text2, textDecoration:'none',
                fontSize:'1rem', fontWeight:600,
                padding:'.5rem 0', borderBottom:`1px solid rgba(200,158,72,0.08)`,
              }}>{l}</a>
            ))}
            <button onClick={() => { onLangChange(lang==='en'?'ar':'en'); setMenuOpen(false); }} style={{
              marginTop:'.5rem', padding:'.65rem',
              background:'rgba(200,158,72,0.1)', border:`1px solid ${T.border}`,
              borderRadius:10, color:T.gold, fontSize:'.9rem', fontWeight:700, cursor:'pointer',
            }}>
              {L.langBtn}
            </button>
          </div>
        )}
      </nav>
    </>
  );
}