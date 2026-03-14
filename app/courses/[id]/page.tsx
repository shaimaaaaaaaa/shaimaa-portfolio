'use client';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { LANG as NAV_LANG } from '../../lib/constants';
import type { Lang } from '../../lib/constants';
import Navbar from '../../components/Navbar';
import SharedFooter from '../../components/SharedFooter';

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
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [lang,         setLang]         = useState<Lang>('en');
  const [mounted,      setMounted]      = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang;
    if (saved==='ar'||saved==='en') setLang(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('lang', lang);
    document.documentElement.dir  = lang==='ar'?'rtl':'ltr';
    document.documentElement.lang = lang;
  }, [lang, mounted]);

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

  const LN = NAV_LANG[lang];

  if (!course) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif"}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif',fontSize:'1.1rem'}}>Loading...</p>
    </main>
  );

  const lesson = course.lessons?.[activeLesson];

  return (
    <main style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif"}}>

      <style>{`
        .course-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          min-height: calc(100vh - 64px);
          padding-top: 64px;
        }
        .course-sidebar {
          position: sticky;
          top: 64px;
          height: calc(100vh - 64px);
          overflow-y: auto;
          background: ${T.bg2};
          border-right: 1px solid ${T.border};
          padding: 1.5rem 1rem;
        }
        .course-content { padding: 2.5rem 3rem; max-width: 820px; width: 100%; }
        .mobile-lesson-bar { display: none; }

        @media (max-width: 768px) {
          .course-layout { grid-template-columns: 1fr; padding-top: 56px; }
          .course-sidebar { display: none; }
          .course-content { padding: 1.25rem 1rem; max-width: 100%; }
          .mobile-lesson-bar {
            display: flex; align-items: center; justify-content: space-between;
            padding: .75rem 1rem; background: ${T.bg2};
            border-bottom: 1px solid ${T.border};
            position: sticky; top: 56px; z-index: 50;
          }
          .lesson-nav-btns { flex-direction: column !important; gap: .75rem !important; }
          .lesson-nav-btns button { width: 100% !important; justify-content: center !important; }
        }
      `}</style>

      {/* SHARED NAV */}
      <Navbar lang={lang} L={LN} onLangChange={setLang} />

      {/* MOBILE LESSON BAR */}
      <div className="mobile-lesson-bar">
        <button onClick={()=>setSidebarOpen(true)}
          style={{display:'flex',alignItems:'center',gap:'.5rem',background:'rgba(138,31,50,0.3)',border:`1px solid ${T.border}`,borderRadius:8,padding:'.5rem .9rem',color:T.gold,fontSize:'.82rem',fontWeight:700,cursor:'pointer'}}>
          ☰ Lessons ({activeLesson+1}/{course.lessons?.length||0})
        </button>
        <span style={{fontSize:'.78rem',color:T.muted,maxWidth:'55%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
          {lesson?.title}
        </span>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.7)'}} onClick={()=>setSidebarOpen(false)}>
          <div style={{position:'fixed',top:0,left:0,bottom:0,width:'85%',maxWidth:320,background:T.bg2,border:`1px solid ${T.border}`,padding:'1.5rem 1rem',overflowY:'auto',zIndex:201}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
              <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'.95rem',fontWeight:700,color:T.white,lineHeight:1.4,flex:1,marginRight:'1rem'}}>{course.title}</h2>
              <button onClick={()=>setSidebarOpen(false)} style={{background:'none',border:'none',color:T.muted,fontSize:'1.4rem',cursor:'pointer'}}>✕</button>
            </div>
            <div style={{fontSize:'.75rem',color:T.muted,marginBottom:'1rem'}}>{course.lessons?.length||0} lessons</div>
            <div style={{display:'flex',flexDirection:'column',gap:'.35rem'}}>
              {course.lessons?.map((l,i) => (
                <button key={i} onClick={()=>{setActiveLesson(i);setSidebarOpen(false);}}
                  style={{textAlign:'left',padding:'.75rem 1rem',borderRadius:10,border:'none',background:activeLesson===i?'rgba(138,31,50,0.45)':'transparent',color:activeLesson===i?T.white:T.muted,fontSize:'.88rem',cursor:'pointer',display:'flex',alignItems:'center',gap:'.7rem',borderLeft:activeLesson===i?`2px solid ${T.gold}`:'2px solid transparent'}}>
                  <span style={{color:T.gold,fontSize:'.72rem',fontFamily:'Playfair Display,serif',fontWeight:700,flexShrink:0}}>{String(i+1).padStart(2,'0')}</span>
                  <span style={{lineHeight:1.4}}>{l.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="course-layout">

        {/* DESKTOP SIDEBAR */}
        <aside className="course-sidebar">
          <div style={{marginBottom:'1.75rem',padding:'0 .5rem'}}>
            <div style={{fontSize:'.65rem',letterSpacing:3,textTransform:'uppercase',color:T.rose,marginBottom:'.4rem',fontFamily:'Playfair Display,serif'}}>Course</div>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1rem',fontWeight:700,color:T.white,lineHeight:1.4}}>{course.title}</h2>
            <div style={{fontSize:'.75rem',color:T.muted,marginTop:'.4rem'}}>{course.lessons?.length||0} lessons</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'.35rem'}}>
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
        <div className="course-content">
          {lesson ? (
            <>
              <div style={{marginBottom:'1.5rem'}}>
                <div style={{fontSize:'.65rem',letterSpacing:3,textTransform:'uppercase',color:T.rose,marginBottom:'.4rem',fontFamily:'Playfair Display,serif'}}>
                  Lesson {String(activeLesson+1).padStart(2,'0')}
                </div>
                <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.3rem,4vw,1.8rem)',fontWeight:900,color:T.white,lineHeight:1.3}}>{lesson.title}</h1>
                <div style={{width:50,height:2,marginTop:'.75rem',background:`linear-gradient(90deg,${T.gold},transparent)`}}/>
              </div>

              {/* VIDEO */}
              <div style={{borderRadius:14,overflow:'hidden',aspectRatio:'16/9',marginBottom:'2rem',background:'#000',boxShadow:`0 20px 60px rgba(0,0,0,0.6)`}}>
                <iframe width="100%" height="100%"
                  src={`https://www.youtube.com/embed/${getYtId(lesson.videoUrl)}`}
                  allowFullScreen style={{border:'none',display:'block'}}/>
              </div>

              {/* QUIZ */}
              {lesson.quiz?.length > 0 && (
                <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2rem'}}>
                  <div style={{marginBottom:'1.5rem'}}>
                    <span style={{fontSize:'.65rem',letterSpacing:3,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.4rem'}}>knowledge check</span>
                    <h3 style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',color:T.white,fontWeight:700}}>Quiz</h3>
                  </div>
                  {lesson.quiz.map((q,qi) => {
                    const key  = `${activeLesson}-${qi}`;
                    const done = submitted[key];
                    return (
                      <div key={qi} style={{marginBottom:'2rem',paddingBottom:'2rem',borderBottom:qi<lesson.quiz.length-1?`1px solid rgba(200,158,72,0.1)`:'none'}}>
                        <p style={{fontWeight:600,fontSize:'clamp(.88rem,2.5vw,1rem)',marginBottom:'1rem',lineHeight:1.7,color:T.white}}>
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
                                style={{textAlign:'left',padding:'.7rem 1rem',borderRadius:10,border:`1px solid ${correct?T.green:wrong?T.red:sel?T.gold:T.border}`,background:correct?'rgba(74,222,128,.1)':wrong?'rgba(248,113,113,.1)':sel?`rgba(201,160,72,0.1)`:'transparent',color:correct?T.green:wrong?T.red:T.text,fontSize:'clamp(.82rem,2.5vw,.9rem)',cursor:done?'default':'pointer',transition:'all .2s',fontFamily:'inherit',lineHeight:1.5}}>
                                <span style={{color:T.muted,marginRight:'.5rem',fontSize:'.72rem'}}>{String.fromCharCode(65+oi)}.</span>
                                {op}
                              </button>
                            );
                          })}
                        </div>
                        {!done && answers[key]!==undefined && (
                          <button onClick={()=>setSubmitted({...submitted,[key]:true})}
                            style={{marginTop:'1rem',padding:'.6rem 1.4rem',background:`linear-gradient(135deg,${T.burg},#4a0f1c)`,color:T.white,border:'none',borderRadius:8,fontSize:'.88rem',fontWeight:700,cursor:'pointer',boxShadow:`0 4px 16px rgba(138,31,50,0.4)`}}>
                            Check Answer ♥
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
              <div className="lesson-nav-btns" style={{display:'flex',justifyContent:'space-between',marginTop:'2rem',gap:'1rem'}}>
                {activeLesson>0 ? (
                  <button onClick={()=>setActiveLesson(activeLesson-1)}
                    style={{padding:'.75rem 1.5rem',background:'transparent',border:`1px solid ${T.border}`,borderRadius:10,color:T.text2,fontSize:'.9rem',cursor:'pointer',fontFamily:'inherit'}}>
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
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'50vh'}}>
              <p style={{color:T.muted,fontSize:'1rem'}}>Select a lesson from the sidebar.</p>
            </div>
          )}
        </div>
      </div>
      <SharedFooter lang={lang} />
    </main>
    
  );
}