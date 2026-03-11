'use client';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const T = {
  bg:'#0e0608', bg2:'#140a0c', card:'#1a0c10', burg:'#8a1f32',
  gold:'#c9a048', goldL:'#e2bb60', white:'#ffffff',
  text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)', rose:'#d07080',
  green:'#4ade80', red:'#f87171',
};

interface Quiz   { question:string; options:string[]; answer:number; }
interface Lesson { title:string; videoUrl:string; quiz:Quiz[]; }
interface Course { id:string; title:string; desc:string; lessons:Lesson[]; }

export default function CoursePage() {
  const { id } = useParams();
  const [course,       setCourse]       = useState<Course|null>(null);
  const [activeLesson, setActiveLesson] = useState(0);
  const [answers,      setAnswers]      = useState<Record<string,number>>({});
  const [submitted,    setSubmitted]    = useState<Record<string,boolean>>({});

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db,'courses',id as string)).then(d => {
      if (d.exists()) setCourse({id:d.id,...d.data()} as Course);
    });
  }, [id]);

  function getYtId(url:string) {
    const m = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
    return m ? m[1] : url;
  }

  if (!course) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif"}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif',fontSize:'1.1rem'}}>Loading...</p>
    </main>
  );

  const lesson = course.lessons?.[activeLesson];

  return (
    <main style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif"}}>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'1rem 2.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`,boxShadow:'0 2px 40px rgba(0,0,0,0.8)'}}>
        <Link href="/" style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',color:T.goldL,textDecoration:'none',fontWeight:700}}>✦ Shaimaa Kalel</Link>
        <Link href="/#courses" style={{fontSize:'.88rem',color:T.text2,textDecoration:'none',fontWeight:600,transition:'color .2s'}}
          onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)}
          onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>
          All Courses ←
        </Link>
      </nav>

      <div style={{paddingTop:'4rem',display:'grid',gridTemplateColumns:'280px 1fr',minHeight:'100vh'}}>

        {/* SIDEBAR */}
        <aside style={{background:T.bg2,borderLeft:`1px solid ${T.border}`,padding:'2rem 1rem',position:'sticky',top:'4rem',height:'calc(100vh - 4rem)',overflowY:'auto'}}>
          <div style={{marginBottom:'1.75rem',padding:'0 .5rem'}}>
            <div style={{fontSize:'.68rem',letterSpacing:3,textTransform:'uppercase',color:T.rose,marginBottom:'.4rem',fontFamily:'Playfair Display,serif'}}>Course</div>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1rem',fontWeight:700,color:T.white,lineHeight:1.4}}>{course.title}</h2>
            <div style={{fontSize:'.78rem',color:T.muted,marginTop:'.4rem'}}>{course.lessons?.length||0} lessons</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'.4rem'}}>
            {course.lessons?.map((l,i) => (
              <button key={i} onClick={()=>setActiveLesson(i)}
                style={{textAlign:'left',padding:'.75rem 1rem',borderRadius:10,border:'none',background:activeLesson===i?'rgba(138,31,50,0.45)':'transparent',color:activeLesson===i?T.white:T.muted,fontSize:'.85rem',cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',gap:'.7rem',borderLeft:activeLesson===i?`2px solid ${T.gold}`:'2px solid transparent'}}>
                <span style={{color:T.gold,fontSize:'.72rem',fontFamily:'Playfair Display,serif',fontWeight:700,flexShrink:0}}>{String(i+1).padStart(2,'0')}</span>
                <span style={{lineHeight:1.4}}>{l.title}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* CONTENT */}
        <div style={{padding:'3rem 4rem',maxWidth:820}}>
          {lesson ? (
            <>
              <div style={{marginBottom:'2rem'}}>
                <div style={{fontSize:'.68rem',letterSpacing:3,textTransform:'uppercase',color:T.rose,marginBottom:'.5rem',fontFamily:'Playfair Display,serif'}}>
                  Lesson {String(activeLesson+1).padStart(2,'0')}
                </div>
                <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'1.8rem',fontWeight:900,color:T.white,lineHeight:1.2}}>{lesson.title}</h1>
                <div style={{width:50,height:2,marginTop:'.85rem',background:`linear-gradient(90deg,${T.gold},transparent)`}}/>
              </div>

              {/* VIDEO */}
              <div style={{borderRadius:14,overflow:'hidden',aspectRatio:'16/9',marginBottom:'2.5rem',background:'#000',boxShadow:`0 20px 60px rgba(0,0,0,0.6)`}}>
                <iframe width="100%" height="100%"
                  src={`https://www.youtube.com/embed/${getYtId(lesson.videoUrl)}`}
                  allowFullScreen style={{border:'none'}}/>
              </div>

              {/* QUIZ */}
              {lesson.quiz?.length > 0 && (
                <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2.25rem'}}>
                  <div style={{marginBottom:'2rem'}}>
                    <span style={{fontSize:'.68rem',letterSpacing:3,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.5rem'}}>knowledge check</span>
                    <h3 style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:T.white,fontWeight:700}}>Quiz</h3>
                  </div>
                  {lesson.quiz.map((q,qi) => {
                    const key  = `${activeLesson}-${qi}`;
                    const done = submitted[key];
                    return (
                      <div key={qi} style={{marginBottom:'2rem',paddingBottom:'2rem',borderBottom:qi<lesson.quiz.length-1?`1px solid rgba(200,158,72,0.1)`:'none'}}>
                        <p style={{fontWeight:600,fontSize:'1rem',marginBottom:'1rem',lineHeight:1.7,color:T.white}}>
                          <span style={{color:T.gold,fontFamily:'Playfair Display,serif',marginRight:'.5rem'}}>{String(qi+1).padStart(2,'0')}.</span>
                          {q.question}
                        </p>
                        <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
                          {q.options.filter(Boolean).map((op,oi) => {
                            const sel     = answers[key]===oi;
                            const correct = done && oi===q.answer;
                            const wrong   = done && sel && oi!==q.answer;
                            return (
                              <button key={oi} onClick={()=>{ if(!done) setAnswers({...answers,[key]:oi}); }}
                                style={{textAlign:'left',padding:'.75rem 1.1rem',borderRadius:10,border:`1px solid ${correct?T.green:wrong?T.red:sel?T.gold:T.border}`,background:correct?'rgba(74,222,128,.1)':wrong?'rgba(248,113,113,.1)':sel?`rgba(201,160,72,0.1)`:'transparent',color:correct?T.green:wrong?T.red:T.text,fontSize:'.9rem',cursor:done?'default':'pointer',transition:'all .2s',fontFamily:'inherit'}}>
                                <span style={{color:T.muted,marginRight:'.5rem',fontSize:'.75rem'}}>{String.fromCharCode(65+oi)}.</span>
                                {op}
                              </button>
                            );
                          })}
                        </div>
                        {!done && answers[key]!==undefined && (
                          <button onClick={()=>setSubmitted({...submitted,[key]:true})}
                            style={{marginTop:'1rem',padding:'.6rem 1.4rem',background:`linear-gradient(135deg,${T.burg},#4a0f1c)`,color:T.white,border:'none',borderRadius:8,fontSize:'.88rem',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 16px rgba(138,31,50,0.4)`}}>
                            Check Answer ✦
                          </button>
                        )}
                        {done && (
                          <p style={{marginTop:'.75rem',fontSize:'.88rem',color:answers[key]===q.answer?T.green:T.red,fontWeight:700}}>
                            {answers[key]===q.answer ? '✅ Correct!' : `❌ Correct answer: ${q.options[q.answer]}`}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* NAV BTNS */}
              <div style={{display:'flex',justifyContent:'space-between',marginTop:'2.5rem',gap:'1rem'}}>
                {activeLesson>0 ? (
                  <button onClick={()=>setActiveLesson(activeLesson-1)}
                    style={{padding:'.75rem 1.5rem',background:'transparent',border:`1px solid ${T.border}`,borderRadius:10,color:T.text2,fontSize:'.9rem',cursor:'pointer',transition:'all .2s',fontFamily:'inherit'}}>
                    ← Previous Lesson
                  </button>
                ) : <div/>}
                {activeLesson<(course.lessons?.length||0)-1 && (
                  <button onClick={()=>setActiveLesson(activeLesson+1)}
                    style={{padding:'.75rem 1.5rem',background:`linear-gradient(135deg,${T.burg},#4a0f1c)`,border:'none',borderRadius:10,color:T.white,fontSize:'.9rem',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 20px rgba(138,31,50,0.4)`,fontFamily:'inherit'}}>
                    Next Lesson →
                  </button>
                )}
              </div>
            </>
          ) : (
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}>
              <p style={{color:T.muted,fontSize:'1rem'}}>Select a lesson from the sidebar.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}