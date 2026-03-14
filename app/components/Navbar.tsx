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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const navBg     = scrolled ? 'rgba(14,6,8,0.97)' : 'transparent';
  const navBorder = scrolled ? `1px solid ${T.border}` : '1px solid transparent';
  const navShadow = scrolled ? '0 2px 40px rgba(0,0,0,0.8)' : 'none';

  return (
    <>
      <style>{`
        .nav-desktop { display:flex !important; }
        .nav-burger  { display:none !important; }
        @media(max-width:768px){
          .nav-desktop { display:none !important; }
          .nav-burger  { display:flex !important; }
        }

        /* desktop nav links — underline slide */
        .nav-link {
          position:relative;
          color:#d4c4bc;
          text-decoration:none;
          font-size:.9rem;
          font-weight:600;
          white-space:nowrap;
          transition:color .2s;
          padding-bottom:3px;
        }
        .nav-link::after {
          content:'';
          position:absolute;
          bottom:0; left:0;
          width:0; height:2px;
          background:#c9a048;
          border-radius:2px;
          transition:width .25s ease;
        }
        .nav-link:hover { color:#e2bb60 !important; }
        .nav-link:hover::after { width:100%; }

        /* lang toggle button */
        .nav-lang-btn {
          padding:.42rem 1.1rem;
          background:rgba(200,158,72,0.1);
          border:1px solid rgba(200,158,72,0.2);
          border-radius:20px;
          color:#c9a048;
          font-size:.82rem;
          font-weight:700;
          white-space:nowrap;
          transition: background .2s, border-color .2s, color .2s, transform .15s, box-shadow .2s;
        }
        .nav-lang-btn:hover {
          background:#c9a048 !important;
          border-color:#c9a048 !important;
          color:#0e0608 !important;
          transform:translateY(-2px);
          box-shadow:0 6px 18px rgba(201,160,72,0.4);
        }

        /* mobile nav links */
        .mobile-nav-link {
          color:#d4c4bc;
          text-decoration:none;
          font-size:1rem;
          font-weight:600;
          padding:.5rem 0;
          border-bottom:1px solid rgba(200,158,72,0.08);
          transition:color .2s, padding-left .2s;
          display:block;
        }
        .mobile-nav-link:hover {
          color:#e2bb60 !important;
          padding-left:.5rem;
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
          <a href="/" className="nav-link" style={{
            fontFamily:'Playfair Display,serif', fontSize:'1.2rem',
            color:T.goldL, fontWeight:700, letterSpacing:1,
            textDecoration:'none', flexShrink:0,
          }}>
            ♥ Shaimaa Kalel
          </a>

          {/* DESKTOP LINKS */}
          <div className="nav-desktop" style={{gap:'2rem', alignItems:'center'}}>
            {L.navLinks.map(([h,l]) => (
              <a key={h} href={h} className="nav-link">{l}</a>
            ))}
            <button className="nav-lang-btn" onClick={() => onLangChange(lang==='en'?'ar':'en')}>
              {L.langBtn}
            </button>
          </div>

          {/* HAMBURGER */}
          <button className="nav-burger" onClick={() => setMenuOpen(!menuOpen)} style={{
            flexDirection:'column', gap:5,
            background:'none', border:'none', padding:6, flexShrink:0,
          }}>
            <span style={{width:22,height:2,background:menuOpen?T.goldL:T.text2,display:'block',transition:'all .3s',transform:menuOpen?'rotate(45deg) translate(5px,5px)':'none'}}/>
            <span style={{width:22,height:2,background:menuOpen?T.goldL:T.text2,display:'block',transition:'all .3s',opacity:menuOpen?0:1}}/>
            <span style={{width:22,height:2,background:menuOpen?T.goldL:T.text2,display:'block',transition:'all .3s',transform:menuOpen?'rotate(-45deg) translate(5px,-5px)':'none'}}/>
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
              <a key={h} href={h} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>{l}</a>
            ))}
            <button className="nav-lang-btn" style={{marginTop:'.5rem',borderRadius:10,fontSize:'.9rem'}}
              onClick={() => { onLangChange(lang==='en'?'ar':'en'); setMenuOpen(false); }}>
              {L.langBtn}
            </button>
          </div>
        )}
      </nav>
    </>
  );
}