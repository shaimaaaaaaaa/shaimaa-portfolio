'use client';
import { useState } from 'react';
import type { Lang } from '../lib/constants';

const T = {
  bg2:'#140a0c', gold:'#c9a048', goldL:'#e2bb60',
  text2:'#d4c4bc', muted:'#8a7268', border:'rgba(200,158,72,0.2)',
};

interface SharedFooterProps { lang?: Lang; }

export default function SharedFooter({ lang = 'en' }: SharedFooterProps) {
  const [clicks, setClicks] = useState(0);
  const [timer,  setTimer]  = useState<ReturnType<typeof setTimeout>|null>(null);

  function handleHeartClick() {
    const next = clicks + 1;
    setClicks(next);
    if (timer) clearTimeout(timer);
    const t = setTimeout(() => setClicks(0), 1500);
    setTimer(t);
    if (next >= 3) { setClicks(0); window.location.href = '/admin/login'; }
  }

  const quickLinks = lang === 'ar'
    ? [['/','الرئيسية'],['/about','عني'],['/projects','المشاريع'],['/courses','الكورسات'],['/articles','المقالات'],['/#contact','تواصل']]
    : [['/',  'Home'],['/about','About'],['/projects','Projects'],['/courses','Courses'],['/articles','Articles'],['/#contact','Contact']];

  const social = [
    { label:'LinkedIn', href:'https://www.linkedin.com/in/shaimaakalel',  icon:'in' },
    { label:'GitHub',   href:'https://github.com/shaimaaaaaaaa',          icon:'gh' },
    { label:'Instagram',href:'https://instagram.com/shaimaa_agile',       icon:'ig' },
    { label:'YouTube',  href:'https://youtube.com/@ShaimaasAgileStories', icon:'yt' },
    { label:'TikTok',   href:'https://tiktok.com/@shaimaa_agile',         icon:'tt' },
    { label:'Email',    href:'mailto:shaimaakalel@gmail.com',             icon:'✉'  },
  ];

  const bio = lang === 'ar'
    ? 'مهندسة برمجيات وصانعة محتوى من أبوظبي. أجمع بين التقنية وعقلية Agile لبناء أنظمة تخدم الناس.'
    : 'Software Engineer & Content Creator based in Abu Dhabi. Combining technical skills with an Agile mindset.';

  const colTitle = (txt: string) => (
    <div style={{fontFamily:'Playfair Display,serif',fontSize:'.78rem',fontWeight:700,color:T.gold,letterSpacing:3,textTransform:'uppercase',marginBottom:'1.25rem'}}>{txt}</div>
  );

  return (
    <>
      <style>{`
        .sf-quick-link {
          color:${T.muted}; text-decoration:none; font-size:.88rem; font-weight:500;
          padding:.3rem 0; display:block;
          transition:color .2s, padding-left .2s;
        }
        .sf-quick-link:hover { color:${T.gold} !important; padding-left:.4rem; }

        .sf-social-btn {
          display:inline-flex; align-items:center; justify-content:center;
          width:38px; height:38px; border-radius:10px;
          background:rgba(255,255,255,0.04); border:1px solid rgba(200,158,72,0.2);
          color:${T.muted}; font-size:.78rem; font-weight:700; text-decoration:none;
          transition:background .2s, border-color .2s, color .2s, transform .18s, box-shadow .2s;
        }
        .sf-social-btn:hover {
          background:${T.gold} !important; border-color:${T.gold} !important;
          color:#0e0608 !important; transform:translateY(-3px);
          box-shadow:0 8px 20px rgba(201,160,72,0.4);
        }

        .sf-cols {
          display:grid; grid-template-columns:2fr 1fr 1fr; gap:3rem;
        }
        @media(max-width:768px){
          .sf-cols { grid-template-columns:1fr 1fr !important; gap:2rem !important; }
          .sf-cols > div:first-child { grid-column:1/-1; }
        }
        @media(max-width:480px){
          .sf-cols { grid-template-columns:1fr !important; }
        }
      `}</style>

      <footer style={{background:T.bg2,borderTop:`1px solid ${T.border}`,paddingTop:'3.5rem'}}>
        <div style={{maxWidth:1050,margin:'0 auto',padding:'0 2rem 2.5rem'}}>

          <div className="sf-cols">

            {/* col 1 — brand + bio + icons */}
            <div>
              <a href="/" style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:T.goldL,fontWeight:700,letterSpacing:1,textDecoration:'none',display:'block',marginBottom:'1rem'}}>
                ♥ Shaimaa Kalel
              </a>
              <p style={{fontSize:'.88rem',color:T.muted,lineHeight:1.9,marginBottom:'1.5rem',maxWidth:280}}>{bio}</p>
              <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
                {social.map(s=>(
                  <a key={s.label} href={s.href} target="_blank" rel="noopener"
                    className="sf-social-btn" title={s.label}>{s.icon}</a>
                ))}
              </div>
            </div>

            {/* col 2 — quick links */}
            <div>
              {colTitle(lang==='ar'?'روابط سريعة':'Quick Links')}
              <div style={{display:'flex',flexDirection:'column',gap:'.1rem'}}>
                {quickLinks.map(([href,label])=>(
                  <a key={href} href={href} className="sf-quick-link">{label}</a>
                ))}
              </div>
            </div>

            {/* col 3 — contact */}
            <div>
              {colTitle(lang==='ar'?'تواصل':'Contact')}
              <div style={{display:'flex',flexDirection:'column',gap:'.85rem'}}>
                <div>
                  <div style={{fontSize:'.78rem',color:T.text2,fontWeight:600,marginBottom:'.25rem'}}>📍 {lang==='ar'?'الموقع':'Location'}</div>
                  <div style={{fontSize:'.85rem',color:T.muted}}>Abu Dhabi, UAE</div>
                </div>
                <div>
                  <div style={{fontSize:'.78rem',color:T.text2,fontWeight:600,marginBottom:'.25rem'}}>✉ Email</div>
                  <a href="mailto:shaimaakalel@gmail.com" className="sf-quick-link" style={{padding:0,fontSize:'.82rem'}}>
                    shaimaakalel@gmail.com
                  </a>
                </div>
                <div>
                  <div style={{fontSize:'.78rem',color:T.text2,fontWeight:600,marginBottom:'.25rem'}}>🎓 {lang==='ar'?'الجامعة':'University'}</div>
                  <div style={{fontSize:'.85rem',color:T.muted}}>University of Bolton</div>
                </div>
              </div>
            </div>
          </div>

          {/* divider */}
          <div style={{height:1,background:`linear-gradient(90deg,transparent,${T.border},transparent)`,margin:'2.5rem 0 1.5rem'}}/>

          {/* bottom row */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
            <p style={{fontSize:'.78rem',color:T.muted}}>
              © 2026 <span style={{color:T.text2,fontWeight:600}}>Shaimaa Kalel</span>
              {' '}· {lang==='ar'?'جميع الحقوق محفوظة':'All rights reserved'}
            </p>
            <p style={{fontSize:'.75rem',color:T.muted}}>
              Made with{' '}
              <span onClick={handleHeartClick}
                style={{color:T.gold,cursor:'pointer',fontSize:clicks>0?'1.1rem':'1rem',transition:'font-size .15s'}}>♥</span>
              {' '}by Shaimaa Kalel
            </p>
          </div>

        </div>
      </footer>
    </>
  );
}