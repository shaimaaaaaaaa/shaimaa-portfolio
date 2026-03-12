'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
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
    title:'Manage', span:'Courses', addCourse:'Add New Course ♥',
    noLessons:'No courses yet.', lessons:'lessons', addLesson:'+ Lesson',
    edit:'Edit', delete:'Delete', questions:'questions',
    back:'Back', dashboard:'Dashboard',
    newCourse:'New Course', editCourse:'Edit Course',
    courseTitle:'Course title *', courseDesc:'Course description',
    newLesson:'New Lesson', editLesson:'Edit Lesson',
    course:'Course', lessonTitle:'Lesson title *', youtubeUrl:'YouTube URL *',
    quizBuilder:'Quiz Builder', question:'Question', correctAnswer:'Correct answer:',
    option:'Option', addQuestion:'Add Question', remove:'Remove',
    saving:'Saving...', saveChanges:'Save Changes ♥', createCourse:'Create Course ♥', saveLesson:'Save Lesson ♥',
    dir:'ltr', langBtn:'العربية',
  },
  ar: {
    title:'إدارة', span:'الكورسات', addCourse:'إضافة كورس جديد ♥',
    noLessons:'لا يوجد كورسات بعد.', lessons:'درس', addLesson:'+ درس',
    edit:'تعديل', delete:'حذف', questions:'أسئلة',
    back:'رجوع', dashboard:'لوحة التحكم',
    newCourse:'كورس جديد', editCourse:'تعديل الكورس',
    courseTitle:'عنوان الكورس *', courseDesc:'وصف الكورس',
    newLesson:'درس جديد', editLesson:'تعديل الدرس',
    course:'الكورس', lessonTitle:'عنوان الدرس *', youtubeUrl:'رابط YouTube *',
    quizBuilder:'بناء الكويز', question:'السؤال', correctAnswer:'الإجابة الصحيحة:',
    option:'خيار', addQuestion:'إضافة سؤال', remove:'حذف',
    saving:'جاري الحفظ...', saveChanges:'حفظ التغييرات ♥', createCourse:'إنشاء الكورس ♥', saveLesson:'حفظ الدرس ♥',
    dir:'rtl', langBtn:'English',
  },
};

interface Quiz   { question:string; options:string[]; answer:number; }
interface Lesson { title:string; videoUrl:string; quiz:Quiz[]; }
interface Course { id:string; title:string; desc:string; category:string; lessons:Lesson[]; }

const inp = (b=T.border): React.CSSProperties => ({
  width:'100%', padding:'.85rem 1rem', background:'rgba(255,255,255,0.04)',
  border:`1px solid ${b}`, borderRadius:10, color:T.text,
  fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif", fontSize:'.95rem', outline:'none', transition:'border-color .2s',
});

export default function AdminCourses() {
  const [loading,          setLoading]          = useState(true);
  const [courses,          setCourses]          = useState<Course[]>([]);
  const [step,             setStep]             = useState<'list'|'course'|'lesson'>('list');
  const [editingCourse,    setEditingCourse]    = useState<Course|null>(null);
  const [selectedCourse,   setSelectedCourse]   = useState<Course|null>(null);
  const [editingLessonIdx, setEditingLessonIdx] = useState<number|null>(null);
  const [saving,           setSaving]           = useState(false);
  const [courseForm,       setCourseForm]       = useState({title:'',desc:'',category:'agile'});
  const [lessonForm,       setLessonForm]       = useState<Lesson>({title:'',videoUrl:'',quiz:[]});
  const [quizForm,         setQuizForm]         = useState({question:'',options:['','','',''],answer:0});
  const [lang,             setLang]             = useState<'en'|'ar'>('en');
  const [mounted,          setMounted]          = useState(false);
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
      else { setLoading(false); fetchCourses(); }
    });
    return () => unsub();
  }, [router]);

  async function fetchCourses() {
    const snap = await getDocs(collection(db,'courses'));
    setCourses(snap.docs.map(d=>({id:d.id,...d.data()} as Course)));
  }

  async function saveCourse() {
    if (!courseForm.title.trim()) return;
    setSaving(true);
    if (editingCourse) await updateDoc(doc(db,'courses',editingCourse.id),{...courseForm});
    else await addDoc(collection(db,'courses'),{...courseForm,lessons:[]});
    setCourseForm({title:'',desc:'',category:'agile'});
    setEditingCourse(null);
    await fetchCourses();
    setSaving(false);
    setStep('list');
  }

  async function deleteCourse(id:string) {
    if (!confirm(lang==='ar'?'هل تريد حذف هذا الكورس؟':'Delete this course?')) return;
    await deleteDoc(doc(db,'courses',id));
    await fetchCourses();
  }

  async function saveLesson() {
    if (!selectedCourse||!lessonForm.title||!lessonForm.videoUrl) return;
    setSaving(true);
    let updated:Lesson[];
    if (editingLessonIdx !== null) {
      updated = [...(selectedCourse.lessons||[])];
      updated[editingLessonIdx] = lessonForm;
    } else {
      updated = [...(selectedCourse.lessons||[]), lessonForm];
    }
    await updateDoc(doc(db,'courses',selectedCourse.id),{lessons:updated});
    setLessonForm({title:'',videoUrl:'',quiz:[]});
    setEditingLessonIdx(null);
    await fetchCourses();
    setSaving(false);
    setStep('list');
  }

  async function deleteLesson(course:Course, idx:number) {
    if (!confirm(lang==='ar'?'هل تريد حذف هذا الدرس؟':'Delete this lesson?')) return;
    const updated = course.lessons.filter((_,i)=>i!==idx);
    await updateDoc(doc(db,'courses',course.id),{lessons:updated});
    await fetchCourses();
  }

  function editLesson(course:Course, idx:number) {
    setSelectedCourse(course);
    setLessonForm({...course.lessons[idx], quiz: course.lessons[idx].quiz||[]});
    setEditingLessonIdx(idx);
    setStep('lesson');
  }

  function addQuiz() {
    if (!quizForm.question.trim()) return;
    setLessonForm(prev=>({...prev,quiz:[...prev.quiz,{...quizForm}]}));
    setQuizForm({question:'',options:['','','',''],answer:0});
  }

  function removeQuiz(idx:number) {
    setLessonForm(prev=>({...prev,quiz:prev.quiz.filter((_,i)=>i!==idx)}));
  }

  function getYtId(url:string) {
    const m=url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
    return m?m[1]:url;
  }

  const L = LANG[lang];

  if (loading) return <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}><p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p></main>;

  return (
    <main style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir as 'ltr'|'rtl'}}>
      <div style={{position:'fixed',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.3) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none',zIndex:0}}/>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,padding:'1rem 3rem',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`}}>
        <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',color:T.goldL,fontWeight:700}}>♥ Admin Panel</span>
        <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
          {step!=='list' && (
            <button onClick={()=>{setStep('list');setEditingLessonIdx(null);}}
              style={{background:'none',border:'none',color:T.text2,fontSize:'.88rem',fontWeight:600,cursor:'pointer'}}
              onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)}
              onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>
              {L.back}
            </button>
          )}
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
          <span style={{fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'}}>admin panel</span>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'2.4rem',fontWeight:900,color:T.white}}>
            {L.title} <span style={{color:T.gold,fontStyle:'italic'}}>{L.span}</span>
          </h1>
          <div style={{width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
        </div>

        {/* ── LIST ── */}
        {step==='list' && (
          <>
            <button onClick={()=>{setEditingCourse(null);setCourseForm({title:'',desc:'',category:'agile'});setStep('course');}}
              style={{padding:'.85rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'.95rem',cursor:'pointer',boxShadow:`0 4px 20px rgba(138,31,50,0.4)`,marginBottom:'2.5rem'}}>
              {L.addCourse}
            </button>
            <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
              {courses.length===0 && <p style={{color:T.muted,textAlign:'center',padding:'3rem',fontSize:'1rem'}}>{L.noLessons}</p>}
              {courses.map(c=>(
                <div key={c.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden'}}>
                  <div style={{padding:'1.4rem',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem'}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem',fontWeight:700,color:T.white,marginBottom:'.3rem'}}>{c.title}</div>
                      <div style={{fontSize:'.85rem',color:T.muted,marginBottom:'.5rem'}}>{c.desc}</div>
                      <div style={{fontSize:'.78rem',color:T.gold,fontWeight:600}}>{c.lessons?.length||0} {L.lessons}</div>
                    </div>
                    <div style={{display:'flex',gap:'.6rem',flexShrink:0}}>
                      <button onClick={()=>{setSelectedCourse(c);setEditingLessonIdx(null);setLessonForm({title:'',videoUrl:'',quiz:[]});setStep('lesson');}}
                        style={{padding:'.5rem 1rem',background:'rgba(201,160,72,0.1)',border:`1px solid ${T.border}`,borderRadius:8,color:T.goldL,fontSize:'.85rem',fontWeight:600,cursor:'pointer'}}>
                        {L.addLesson}
                      </button>
                      <button onClick={()=>{setEditingCourse(c);setCourseForm({title:c.title,desc:c.desc,category:c.category});setStep('course');}}
                        style={{padding:'.5rem 1rem',background:'transparent',border:`1px solid ${T.border}`,borderRadius:8,color:T.text2,fontSize:'.85rem',fontWeight:600,cursor:'pointer'}}>
                        {L.edit}
                      </button>
                      <button onClick={()=>deleteCourse(c.id)}
                        style={{padding:'.5rem 1rem',background:'rgba(138,31,50,0.2)',border:`1px solid rgba(138,31,50,0.4)`,borderRadius:8,color:T.rose,fontSize:'.85rem',fontWeight:600,cursor:'pointer'}}>
                        {L.delete}
                      </button>
                    </div>
                  </div>
                  {c.lessons?.length>0 && (
                    <div style={{borderTop:`1px solid ${T.border}`,padding:'1rem 1.4rem',display:'flex',flexDirection:'column',gap:'.4rem'}}>
                      {c.lessons.map((l,i)=>(
                        <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.5rem .75rem',background:'rgba(255,255,255,0.02)',borderRadius:8}}>
                          <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
                            <span style={{fontFamily:'Playfair Display,serif',color:T.gold,fontSize:'.78rem',fontWeight:700}}>{String(i+1).padStart(2,'0')}</span>
                            <span style={{fontSize:'.88rem',color:T.text2}}>{l.title}</span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
                            <span style={{fontSize:'.75rem',color:T.muted}}>{l.quiz?.length||0} {L.questions}</span>
                            <button onClick={()=>editLesson(c,i)} style={{background:'none',border:'none',color:T.goldL,fontSize:'.82rem',cursor:'pointer',fontWeight:600}}>{L.edit}</button>
                            <button onClick={()=>deleteLesson(c,i)} style={{background:'none',border:'none',color:T.rose,fontSize:'.82rem',cursor:'pointer',fontWeight:600}}>{L.delete}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── COURSE FORM ── */}
        {step==='course' && (
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2rem'}}>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:T.white,fontWeight:700,marginBottom:'1.5rem'}}>
              {editingCourse ? L.editCourse : L.newCourse}
            </h2>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <input placeholder={L.courseTitle} value={courseForm.title} onChange={e=>setCourseForm({...courseForm,title:e.target.value})} style={inp()} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              <textarea placeholder={L.courseDesc} value={courseForm.desc} onChange={e=>setCourseForm({...courseForm,desc:e.target.value})} rows={3} style={{...inp(),resize:'vertical'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              <select value={courseForm.category} onChange={e=>setCourseForm({...courseForm,category:e.target.value})} style={{...inp(),cursor:'pointer'}}>
                <option value="agile">Agile / Scrum</option>
                <option value="web">Web Development</option>
                <option value="career">Career & Tips</option>
              </select>
              <button onClick={saveCourse} disabled={saving}
                style={{padding:'.85rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'.95rem',cursor:saving?'not-allowed':'pointer',opacity:saving?.6:1}}>
                {saving ? L.saving : editingCourse ? L.saveChanges : L.createCourse}
              </button>
            </div>
          </div>
        )}

        {/* ── LESSON FORM ── */}
        {step==='lesson' && (
          <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2rem'}}>
              <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:T.white,fontWeight:700,marginBottom:'.4rem'}}>
                {editingLessonIdx!==null ? L.editLesson : L.newLesson}
              </h2>
              <p style={{fontSize:'.85rem',color:T.muted,marginBottom:'1.5rem'}}>{L.course}: <span style={{color:T.gold}}>{selectedCourse?.title}</span></p>
              <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                <input placeholder={L.lessonTitle} value={lessonForm.title} onChange={e=>setLessonForm({...lessonForm,title:e.target.value})} style={inp()} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
                <input placeholder={L.youtubeUrl} value={lessonForm.videoUrl} onChange={e=>setLessonForm({...lessonForm,videoUrl:e.target.value})} style={{...inp(),direction:'ltr'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
                {lessonForm.videoUrl && (
                  <div style={{borderRadius:12,overflow:'hidden',aspectRatio:'16/9',background:'#000'}}>
                    <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYtId(lessonForm.videoUrl)}`} allowFullScreen style={{border:'none'}}/>
                  </div>
                )}
              </div>
            </div>

            {/* QUIZ BUILDER */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2rem'}}>
              <h3 style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',color:T.white,fontWeight:700,marginBottom:'1.5rem'}}>{L.quizBuilder}</h3>
              <div style={{display:'flex',flexDirection:'column',gap:'.85rem',marginBottom:'1.25rem'}}>
                <input placeholder={L.question} value={quizForm.question} onChange={e=>setQuizForm({...quizForm,question:e.target.value})} style={inp()} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
                {quizForm.options.map((op,i)=>(
                  <input key={i} placeholder={`${L.option} ${i+1}`} value={op}
                    onChange={e=>{const o=[...quizForm.options];o[i]=e.target.value;setQuizForm({...quizForm,options:o});}}
                    style={{...inp(),fontSize:'.9rem'}}
                    onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
                ))}
                <div style={{display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
                  <label style={{fontSize:'.85rem',color:T.text2,fontWeight:600}}>{L.correctAnswer}</label>
                  <select value={quizForm.answer} onChange={e=>setQuizForm({...quizForm,answer:+e.target.value})}
                    style={{padding:'.5rem .8rem',background:T.card,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:'inherit',fontSize:'.88rem',outline:'none'}}>
                    {[0,1,2,3].map(i=><option key={i} value={i}>{L.option} {i+1}</option>)}
                  </select>
                  <button onClick={addQuiz}
                    style={{padding:'.5rem 1.2rem',background:'rgba(201,160,72,0.1)',border:`1px solid ${T.border}`,borderRadius:8,color:T.goldL,fontSize:'.85rem',fontWeight:700,cursor:'pointer'}}>
                    {L.addQuestion}
                  </button>
                </div>
              </div>
              {lessonForm.quiz.length>0 && (
                <div style={{display:'flex',flexDirection:'column',gap:'.4rem',marginBottom:'1.25rem'}}>
                  {lessonForm.quiz.map((q,i)=>(
                    <div key={i} style={{padding:'.6rem 1rem',background:'rgba(255,255,255,0.03)',border:`1px solid ${T.border}`,borderRadius:8,fontSize:'.85rem',color:T.text2,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
                        <span style={{color:T.gold,fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:'.78rem'}}>{String(i+1).padStart(2,'0')}</span>
                        {q.question}
                      </div>
                      <button onClick={()=>removeQuiz(i)} style={{background:'none',border:'none',color:T.rose,fontSize:'.82rem',cursor:'pointer',fontWeight:600,flexShrink:0}}>{L.remove}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={saveLesson} disabled={saving}
              style={{padding:'.95rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'1rem',cursor:saving?'not-allowed':'pointer',opacity:saving?.6:1,boxShadow:`0 4px 20px rgba(138,31,50,0.4)`}}>
              {saving ? L.saving : editingLessonIdx!==null ? L.saveChanges : L.saveLesson}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}