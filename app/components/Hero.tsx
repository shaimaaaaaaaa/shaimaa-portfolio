'use client';
import { T } from '../lib/constants';
import type { LangData } from '../lib/constants';

interface HeroProps { L: LangData; }

function bioHtml(raw: string) {
  return raw
    .replace(/<b gold>(.*?)<\/b>/g, `<strong style="color:#e2bb60;font-weight:700">$1</strong>`)
    .replace(/<b>(.*?)<\/b>/g, `<strong style="color:#ffffff;font-weight:700">$1</strong>`);
}

export default function Hero({ L }: HeroProps) {
  return (
    <section className="hero-section" style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      padding:'9rem 3rem 7rem', position:'relative', overflow:'hidden',
    }}>
      {/* BG blobs */}
      <div style={{position:'absolute',width:800,height:800,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.4) 0%,transparent 65%)',top:-250,right:-200,pointerEvents:'none'}}/>
      <div style={{position:'absolute',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(201,160,72,0.06) 0%,transparent 70%)',bottom:-100,left:-120,pointerEvents:'none'}}/>
      <div style={{position:'absolute',inset:0,backgroundImage:`linear-gradient(${T.border} 1px,transparent 1px),linear-gradient(90deg,${T.border} 1px,transparent 1px)`,backgroundSize:'70px 70px',pointerEvents:'none',opacity:.4}}/>

      <div style={{ maxWidth:760, textAlign:'center', position:'relative', zIndex:1, width:'100%' }}>
        {/* eyebrow */}
        <div style={{display:'inline-flex',alignItems:'center',gap:'.6rem',fontSize:'.65rem',letterSpacing:4,textTransform:'uppercase',color:T.gold,marginBottom:'1.5rem',fontFamily:'Playfair Display,serif',flexWrap:'wrap',justifyContent:'center'}}>
          <span style={{width:28,height:1,background:T.gold,display:'inline-block'}}/>
          {L.eyebrow}
          <span style={{width:28,height:1,background:T.gold,display:'inline-block'}}/>
        </div>

        {/* name */}
        <h1 style={{fontFamily:'Playfair Display,serif',fontWeight:900,lineHeight:1.1,color:T.white,fontSize:'clamp(2.2rem,7vw,5.5rem)',marginBottom:'.4rem'}}>{L.hi}</h1>
        <h1 style={{fontFamily:'Playfair Display,serif',fontWeight:900,lineHeight:1.1,color:T.goldL,fontStyle:'italic',fontSize:'clamp(2.2rem,7vw,5.5rem)',marginBottom:'1.75rem'}}>{L.name}</h1>

        {/* bio */}
        <p style={{color:T.text2,lineHeight:2.1,fontSize:'clamp(.9rem,2.5vw,1.08rem)',maxWidth:560,margin:'0 auto 2.25rem'}}
          dangerouslySetInnerHTML={{__html:bioHtml(L.bio)}}/>

        {/* CTA buttons */}
        <div className="hero-btns" style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap',marginBottom:'2.5rem'}}>
          <a href="#projects" style={{padding:'.85rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,borderRadius:8,textDecoration:'none',fontWeight:700,fontSize:'clamp(.88rem,2.5vw,1rem)',boxShadow:`0 6px 28px rgba(138,31,50,0.5)`}}>{L.btn1}</a>
          <a href="#contact"  style={{padding:'.85rem 2rem',background:'transparent',border:`1px solid rgba(201,160,72,0.4)`,color:T.goldL,borderRadius:8,textDecoration:'none',fontWeight:700,fontSize:'clamp(.88rem,2.5vw,1rem)'}}>{L.btn2}</a>
        </div>

        {/* stats */}
        <div className="stats-row" style={{display:'flex',gap:'2.5rem',justifyContent:'center',paddingTop:'2rem',borderTop:`1px solid ${T.border}`,flexWrap:'wrap'}}>
          {L.stats.map(([n,l],i) => (
            <div key={i} style={{textAlign:'center'}}>
              <div style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.5rem,4vw,2.2rem)',fontWeight:700,color:T.goldL,lineHeight:1}}>{n}</div>
              <div style={{fontSize:'.75rem',color:T.muted,marginTop:'.35rem',letterSpacing:1}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}