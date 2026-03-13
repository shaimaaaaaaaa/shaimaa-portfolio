'use client';
import { useEffect, useState, useRef } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CLOUD_NAME = 'dddhsobvx';
const UPLOAD_PRESET = 'shaimaa-portfolio';

const T = {
  bg:'#0e0608', card:'#1a0c10', burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', white:'#ffffff',
  text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)', rose:'#d07080', green:'#4ade80',
};

const LANG = {
  en: {
    langBtn:'العربية', dir:'ltr',
    title:'Manage', span:'Courses', addCourse:'Add New Course ♥',
    noCourses:'No courses yet.', lessons:'lessons',
    edit:'Edit', delete:'Delete', questions:'questions',
    back:'Back', dashboard:'Dashboard',
    newCourse:'New Course', editCourse:'Edit Course',
    courseTitle:'Course title *', courseDesc:'Course description',
    newLesson:'New Lesson', editLesson:'Edit Lesson',
    course:'Course', lessonTitle:'Lesson title *', youtubeUrl:'YouTube URL *',
    quizBuilder:'Quiz Builder', question:'Question', correctAnswer:'Correct answer:',
    option:'Option', addQuestion:'Add Question', remove:'Remove',
    saving:'Saving...', saveChanges:'Save Changes ♥', createCourse:'Create Course ♥', saveLesson:'Save Lesson ♥',
    uploadCover:'Upload Course Cover', uploadHint:'PNG, JPG up to 5MB',
    uploading:'Uploading...', removeCover:'Remove',
    uploadLessonImgs:'Upload Lesson Images', uploadLessonPdfs:'Upload Lesson PDFs',
    pdfHint:'PDF up to 10MB each', lessonGallery:'Lesson Gallery', lessonDocs:'Lesson Materials',
    mainImg:'Click image to set as main', addLesson:'+ Add Lesson',
  },
  ar: {
    langBtn:'English', dir:'rtl',
    title:'إدارة', span:'الكورسات', addCourse:'إضافة كورس جديد ♥',
    noCourses:'لا يوجد كورسات بعد.', lessons:'درس',
    edit:'تعديل', delete:'حذف', questions:'أسئلة',
    back:'رجوع', dashboard:'لوحة التحكم',
    newCourse:'كورس جديد', editCourse:'تعديل الكورس',
    courseTitle:'عنوان الكورس *', courseDesc:'وصف الكورس',
    newLesson:'درس جديد', editLesson:'تعديل الدرس',
    course:'الكورس', lessonTitle:'عنوان الدرس *', youtubeUrl:'رابط YouTube *',
    quizBuilder:'بناء الكويز', question:'السؤال', correctAnswer:'الإجابة الصحيحة:',
    option:'خيار', addQuestion:'إضافة سؤال', remove:'حذف',
    saving:'جاري الحفظ...', saveChanges:'حفظ التغييرات ♥', createCourse:'إنشاء الكورس ♥', saveLesson:'حفظ الدرس ♥',
    uploadCover:'رفع صورة الكورس', uploadHint:'PNG أو JPG حتى 5MB',
    uploading:'جاري الرفع...', removeCover:'حذف',
    uploadLessonImgs:'رفع صور الدرس', uploadLessonPdfs:'رفع ملفات الدرس PDF',
    pdfHint:'PDF حتى 10MB لكل ملف', lessonGallery:'صور الدرس', lessonDocs:'مواد الدرس',
    mainImg:'اضغط على صورة لتعيينها كرئيسية', addLesson:'+ إضافة درس',
  },
};

interface Quiz   { question:string; options:string[]; answer:number; }
interface PdfFile { name:string; url:string; }
interface Lesson {
  title:string; videoUrl:string; quiz:Quiz[];
  images?:string[]; imageUrl?:string; pdfs?:PdfFile[];
}
interface Course {
  id:string; title:string; desc:string; category:string;
  imageUrl?:string; lessons:Lesson[];
}

const inp = (b=T.border): React.CSSProperties => ({
  width:'100%', padding:'.85rem 1rem', background:'rgba(255,255,255,0.04)',
  border:`1px solid ${b}`, borderRadius:10, color:T.text,
  fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif", fontSize:'.95rem', outline:'none', transition:'border-color .2s',
});

const EMPTY_LESSON: Lesson = { title:'', videoUrl:'', quiz:[], images:[], imageUrl:'', pdfs:[] };

async function uploadFile(file: File, folder: string, type: 'image'|'raw', onProgress:(p:number)=>void): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  fd.append('folder', `portfolio/${folder}`);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = type==='raw'
      ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`
      : `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    xhr.open('POST', url);
    xhr.upload.onprogress = e => { if(e.lengthComputable) onProgress(Math.round(e.loaded/e.total*100)); };
    xhr.onload = () => { if(xhr.status===200) resolve(JSON.parse(xhr.responseText).secure_url); else reject(); };
    xhr.onerror = () => reject();
    xhr.send(fd);
  });
}

export default function AdminCourses() {
  const [loading,        setLoading]        = useState(true);
  const [courses,        setCourses]        = useState<Course[]>([]);
  const [step,           setStep]           = useState<'list'|'course'|'lesson'>('list');
  const [editingCourse,  setEditingCourse]  = useState<Course|null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course|null>(null);
  const [editingLessonIdx, setEditingLessonIdx] = useState<number|null>(null);
  const [saving,         setSaving]         = useState(false);
  const [courseForm,     setCourseForm]     = useState({title:'',desc:'',category:'agile',imageUrl:''});
  const [lessonForm,     setLessonForm]     = useState<Lesson>(EMPTY_LESSON);
  const [quizForm,       setQuizForm]       = useState({question:'',options:['','','',''],answer:0});
  const [lang,           setLang]           = useState<'en'|'ar'>('en');
  const [mounted,        setMounted]        = useState(false);
  // upload progress states
  const [coverPct,       setCoverPct]       = useState<number|null>(null);
  const [lessonImgPct,   setLessonImgPct]   = useState<number|null>(null);
  const [lessonPdfPct,   setLessonPdfPct]   = useState<number|null>(null);

  const coverRef      = useRef<HTMLInputElement>(null);
  const lessonImgRef  = useRef<HTMLInputElement>(null);
  const lessonPdfRef  = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(()=>{const s=localStorage.getItem('lang') as 'en'|'ar';if(s==='ar'||s==='en')setLang(s);setMounted(true);},[]);
  useEffect(()=>{if(!mounted)return;localStorage.setItem('lang',lang);document.documentElement.dir=lang==='ar'?'rtl':'ltr';},[lang,mounted]);
  useEffect(()=>{const unsub=onAuthStateChanged(auth,user=>{if(!user)router.push('/admin/login');else{setLoading(false);fetchCourses();}});return()=>unsub();},[router]);

  async function fetchCourses(){
    const snap=await getDocs(collection(db,'courses'));
    setCourses(snap.docs.map(d=>({id:d.id,...d.data()} as Course)));
  }

  // ── COURSE COVER ──
  async function handleCoverChange(e:React.ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0]; if(!file) return;
    if(file.size>5*1024*1024){alert('Max 5MB');return;}
    setCoverPct(0);
    try{ const url=await uploadFile(file,'courses','image',setCoverPct); setCourseForm(f=>({...f,imageUrl:url})); }
    catch{ alert('Upload failed'); } finally{ setCoverPct(null); if(coverRef.current) coverRef.current.value=''; }
  }

  // ── LESSON IMAGES (multiple) ──
  async function handleLessonImgsChange(e:React.ChangeEvent<HTMLInputElement>){
    const files=Array.from(e.target.files||[]); if(!files.length) return;
    for(const file of files){
      if(file.size>5*1024*1024){alert(`${file.name} too large`);continue;}
      setLessonImgPct(0);
      try{
        const url=await uploadFile(file,'lessons','image',setLessonImgPct);
        setLessonForm(f=>({
          ...f,
          images:[...(f.images||[]),url],
          imageUrl: f.imageUrl||url,
        }));
      } catch{ alert(`Failed: ${file.name}`); }
    }
    setLessonImgPct(null);
    if(lessonImgRef.current) lessonImgRef.current.value='';
  }

  // ── LESSON PDFs (multiple) ──
  async function handleLessonPdfsChange(e:React.ChangeEvent<HTMLInputElement>){
    const files=Array.from(e.target.files||[]); if(!files.length) return;
    for(const file of files){
      if(file.size>10*1024*1024){alert(`${file.name} too large`);continue;}
      setLessonPdfPct(0);
      try{
        const url=await uploadFile(file,'lessons/docs','raw',setLessonPdfPct);
        setLessonForm(f=>({...f, pdfs:[...(f.pdfs||[]),{name:file.name,url}]}));
      } catch{ alert(`Failed: ${file.name}`); }
    }
    setLessonPdfPct(null);
    if(lessonPdfRef.current) lessonPdfRef.current.value='';
  }

  function removeLessonImg(idx:number){
    setLessonForm(f=>{
      const imgs=(f.images||[]).filter((_,i)=>i!==idx);
      return{...f, images:imgs, imageUrl:imgs[0]||''};
    });
  }

  function removeLessonPdf(idx:number){
    setLessonForm(f=>({...f, pdfs:(f.pdfs||[]).filter((_,i)=>i!==idx)}));
  }

  // ── SAVE COURSE ──
  async function saveCourse(){
    if(!courseForm.title.trim()) return; setSaving(true);
    const data={title:courseForm.title,desc:courseForm.desc,category:courseForm.category,imageUrl:courseForm.imageUrl||''};
    if(editingCourse) await updateDoc(doc(db,'courses',editingCourse.id),data);
    else await addDoc(collection(db,'courses'),{...data,lessons:[]});
    setCourseForm({title:'',desc:'',category:'agile',imageUrl:''});
    setEditingCourse(null); await fetchCourses(); setSaving(false); setStep('list');
  }

  async function deleteCourse(c:Course){
    if(!confirm(lang==='ar'?'هل تريد حذف هذا الكورس؟':'Delete this course?')) return;
    await deleteDoc(doc(db,'courses',c.id)); await fetchCourses();
  }

  // ── SAVE LESSON ──
  async function saveLesson(){
    if(!selectedCourse||!lessonForm.title||!lessonForm.videoUrl) return; setSaving(true);
    let updated:Lesson[];
    const lessonData:Lesson={
      title:lessonForm.title, videoUrl:lessonForm.videoUrl, quiz:lessonForm.quiz,
      images:lessonForm.images||[], imageUrl:lessonForm.imageUrl||lessonForm.images?.[0]||'',
      pdfs:lessonForm.pdfs||[],
    };
    if(editingLessonIdx!==null){updated=[...(selectedCourse.lessons||[])];updated[editingLessonIdx]=lessonData;}
    else updated=[...(selectedCourse.lessons||[]),lessonData];
    await updateDoc(doc(db,'courses',selectedCourse.id),{lessons:updated});
    setLessonForm(EMPTY_LESSON); setEditingLessonIdx(null);
    await fetchCourses(); setSaving(false); setStep('list');
  }

  async function deleteLesson(course:Course,idx:number){
    if(!confirm(lang==='ar'?'هل تريد حذف هذا الدرس؟':'Delete this lesson?')) return;
    await updateDoc(doc(db,'courses',course.id),{lessons:course.lessons.filter((_,i)=>i!==idx)});
    await fetchCourses();
  }

  function editLesson(course:Course,idx:number){
    setSelectedCourse(course);
    const l=course.lessons[idx];
    setLessonForm({...l, quiz:l.quiz||[], images:l.images||[], imageUrl:l.imageUrl||l.images?.[0]||'', pdfs:l.pdfs||[]});
    setEditingLessonIdx(idx); setStep('lesson');
  }

  function addQuiz(){
    if(!quizForm.question.trim()) return;
    setLessonForm(prev=>({...prev,quiz:[...prev.quiz,{...quizForm}]}));
    setQuizForm({question:'',options:['','','',''],answer:0});
  }

  function getYtId(url:string){const m=url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);return m?m[1]:url;}

  const L=LANG[lang];
  const isUploading = coverPct!==null || lessonImgPct!==null || lessonPdfPct!==null;

  if(loading) return <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}><p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p></main>;

  return(
    <main style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir as 'ltr'|'rtl'}}>
      <div style={{position:'fixed',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.3) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none',zIndex:0}}/>

      <nav style={{position:'sticky',top:0,zIndex:100,padding:'1rem 3rem',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`}}>
        <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',color:T.goldL,fontWeight:700}}>♥ Admin Panel</span>
        <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
          {step!=='list' && <button onClick={()=>{setStep('list');setEditingLessonIdx(null);}} style={{background:'none',border:'none',color:T.text2,fontSize:'.88rem',fontWeight:600,cursor:'pointer'}}>{L.back}</button>}
          <button onClick={()=>setLang(lang==='en'?'ar':'en')} style={{padding:'.4rem 1rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:20,color:T.gold,fontSize:'.82rem',fontWeight:700,cursor:'pointer'}}>{L.langBtn}</button>
          <Link href="/admin/dashboard" style={{fontSize:'.88rem',color:T.text2,textDecoration:'none',fontWeight:600}}>{L.dashboard}</Link>
        </div>
      </nav>

      <div style={{maxWidth:900,margin:'0 auto',padding:'3.5rem 2rem',position:'relative',zIndex:1}}>
        <div style={{marginBottom:'3rem'}}>
          <span style={{fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'}}>admin panel</span>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'2.4rem',fontWeight:900,color:T.white}}>{L.title} <span style={{color:T.gold,fontStyle:'italic'}}>{L.span}</span></h1>
          <div style={{width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
        </div>

        {/* ════ LIST ════ */}
        {step==='list' && (
          <>
            <button onClick={()=>{setEditingCourse(null);setCourseForm({title:'',desc:'',category:'agile',imageUrl:''});setStep('course');}}
              style={{padding:'.85rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'.95rem',cursor:'pointer',boxShadow:`0 4px 20px rgba(138,31,50,0.4)`,marginBottom:'2.5rem'}}>{L.addCourse}</button>

            <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
              {courses.length===0 && <p style={{color:T.muted,textAlign:'center',padding:'3rem'}}>{L.noCourses}</p>}
              {courses.map(c=>(
                <div key={c.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden'}}>
                  {/* course header */}
                  <div style={{padding:'1.4rem',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem'}}>
                    <div style={{display:'flex',gap:'1rem',flex:1,alignItems:'flex-start'}}>
                      {c.imageUrl
                        ? <img src={c.imageUrl} alt={c.title} style={{width:80,height:60,objectFit:'cover',borderRadius:8,border:`1px solid ${T.border}`,flexShrink:0}}/>
                        : <div style={{width:80,height:60,borderRadius:8,background:`linear-gradient(135deg,${T.burg},#1a0c10)`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${T.border}`}}><span style={{color:T.goldL,fontSize:'1.2rem'}}>📚</span></div>
                      }
                      <div style={{flex:1}}>
                        <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.1rem',fontWeight:700,color:T.white,marginBottom:'.3rem'}}>{c.title}</div>
                        <div style={{fontSize:'.85rem',color:T.muted,marginBottom:'.5rem'}}>{c.desc}</div>
                        <div style={{fontSize:'.78rem',color:T.gold,fontWeight:600}}>{c.lessons?.length||0} {L.lessons}</div>
                      </div>
                    </div>
                    <div style={{display:'flex',gap:'.6rem',flexShrink:0,flexWrap:'wrap',justifyContent:'flex-end'}}>
                      <button onClick={()=>{setSelectedCourse(c);setEditingLessonIdx(null);setLessonForm(EMPTY_LESSON);setStep('lesson');}}
                        style={{padding:'.5rem 1rem',background:'rgba(201,160,72,0.1)',border:`1px solid ${T.border}`,borderRadius:8,color:T.goldL,fontSize:'.85rem',fontWeight:600,cursor:'pointer'}}>{L.addLesson}</button>
                      <button onClick={()=>{setEditingCourse(c);setCourseForm({title:c.title,desc:c.desc,category:c.category,imageUrl:c.imageUrl||''});setStep('course');}}
                        style={{padding:'.5rem 1rem',background:'transparent',border:`1px solid ${T.border}`,borderRadius:8,color:T.text2,fontSize:'.85rem',fontWeight:600,cursor:'pointer'}}>{L.edit}</button>
                      <button onClick={()=>deleteCourse(c)}
                        style={{padding:'.5rem 1rem',background:'rgba(138,31,50,0.2)',border:`1px solid rgba(138,31,50,0.4)`,borderRadius:8,color:T.rose,fontSize:'.85rem',fontWeight:600,cursor:'pointer'}}>{L.delete}</button>
                    </div>
                  </div>
                  {/* lessons list */}
                  {c.lessons?.length>0 && (
                    <div style={{borderTop:`1px solid ${T.border}`,padding:'1rem 1.4rem',display:'flex',flexDirection:'column',gap:'.4rem'}}>
                      {c.lessons.map((l,i)=>(
                        <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.5rem .75rem',background:'rgba(255,255,255,0.02)',borderRadius:8,gap:'.5rem'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'.75rem',flex:1,overflow:'hidden'}}>
                            {l.imageUrl
                              ? <img src={l.imageUrl} alt="" style={{width:40,height:30,objectFit:'cover',borderRadius:4,border:`1px solid ${T.border}`,flexShrink:0}}/>
                              : <span style={{fontFamily:'Playfair Display,serif',color:T.gold,fontSize:'.78rem',fontWeight:700,flexShrink:0}}>{String(i+1).padStart(2,'0')}</span>
                            }
                            <span style={{fontSize:'.88rem',color:T.text2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.title}</span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:'.75rem',flexShrink:0}}>
                            {(l.images?.length||0)>0 && <span style={{fontSize:'.72rem',color:T.muted}}>🖼 {l.images?.length}</span>}
                            {(l.pdfs?.length||0)>0 && <span style={{fontSize:'.72rem',color:T.muted}}>📄 {l.pdfs?.length}</span>}
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

        {/* ════ COURSE FORM ════ */}
        {step==='course' && (
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2rem'}}>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:T.white,fontWeight:700,marginBottom:'1.5rem'}}>{editingCourse?L.editCourse:L.newCourse}</h2>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <input placeholder={L.courseTitle} value={courseForm.title} onChange={e=>setCourseForm({...courseForm,title:e.target.value})} style={inp()} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              <textarea placeholder={L.courseDesc} value={courseForm.desc} onChange={e=>setCourseForm({...courseForm,desc:e.target.value})} rows={3} style={{...inp(),resize:'vertical'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              <select value={courseForm.category} onChange={e=>setCourseForm({...courseForm,category:e.target.value})} style={{...inp(),cursor:'pointer'}}>
                <option value="agile">Agile / Scrum</option>
                <option value="web">Web Development</option>
                <option value="career">Career & Tips</option>
              </select>

              {/* COVER IMAGE */}
              <div style={{border:`2px dashed ${T.border}`,borderRadius:12,padding:'1.25rem',background:'rgba(255,255,255,0.02)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'.5rem'}}>
                  <p style={{fontSize:'.85rem',color:T.gold,fontWeight:700}}>🖼 {L.uploadCover}</p>
                  <span style={{fontSize:'.72rem',color:T.muted}}>{L.uploadHint}</span>
                </div>
                {courseForm.imageUrl ? (
                  <div style={{display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
                    <img src={courseForm.imageUrl} alt="cover" style={{width:160,height:100,objectFit:'cover',borderRadius:8,border:`1px solid ${T.border}`}}/>
                    <button onClick={()=>{setCourseForm(f=>({...f,imageUrl:''}));if(coverRef.current)coverRef.current.value='';}}
                      style={{padding:'.5rem 1rem',background:'rgba(138,31,50,0.3)',border:`1px solid rgba(138,31,50,0.4)`,borderRadius:8,color:T.rose,fontSize:'.82rem',fontWeight:600,cursor:'pointer'}}>{L.removeCover}</button>
                  </div>
                ):(
                  <>
                    <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverChange} style={{display:'none'}} id="course-cover"/>
                    <label htmlFor="course-cover" style={{display:'inline-flex',alignItems:'center',gap:'.4rem',padding:'.6rem 1.2rem',background:'rgba(201,160,72,0.08)',border:`1px solid ${T.border}`,borderRadius:8,color:T.gold,fontSize:'.85rem',fontWeight:700,cursor:'pointer'}}>📁 {L.uploadCover}</label>
                  </>
                )}
                {coverPct!==null && (
                  <div style={{marginTop:'.75rem'}}>
                    <div style={{height:4,background:'rgba(255,255,255,0.1)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${coverPct}%`,background:T.gold,transition:'width .3s'}}/></div>
                    <p style={{fontSize:'.72rem',color:T.gold,marginTop:'.3rem'}}>{L.uploading} {coverPct}%</p>
                  </div>
                )}
              </div>

              <button onClick={saveCourse} disabled={saving||isUploading}
                style={{padding:'.85rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'.95rem',cursor:(saving||isUploading)?'not-allowed':'pointer',opacity:(saving||isUploading)?.6:1}}>
                {saving?L.saving:editingCourse?L.saveChanges:L.createCourse}
              </button>
            </div>
          </div>
        )}

        {/* ════ LESSON FORM ════ */}
        {step==='lesson' && (
          <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
            {/* basic info */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2rem'}}>
              <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:T.white,fontWeight:700,marginBottom:'.4rem'}}>{editingLessonIdx!==null?L.editLesson:L.newLesson}</h2>
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

            {/* lesson images */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'.5rem'}}>
                <p style={{fontSize:'.85rem',color:T.gold,fontWeight:700}}>🖼 {L.lessonGallery}</p>
                <div style={{display:'flex',alignItems:'center',gap:'.75rem',flexWrap:'wrap'}}>
                  <span style={{fontSize:'.72rem',color:T.muted}}>{L.uploadHint}</span>
                  <input ref={lessonImgRef} type="file" accept="image/*" multiple onChange={handleLessonImgsChange} style={{display:'none'}} id="lesson-imgs"/>
                  <label htmlFor="lesson-imgs" style={{display:'inline-flex',alignItems:'center',gap:'.4rem',padding:'.5rem 1rem',background:'rgba(201,160,72,0.08)',border:`1px solid ${T.border}`,borderRadius:8,color:T.gold,fontSize:'.82rem',fontWeight:700,cursor:'pointer'}}>
                    📁 {L.uploadLessonImgs}
                  </label>
                </div>
              </div>
              {lessonImgPct!==null && (
                <div style={{marginBottom:'1rem'}}>
                  <div style={{height:4,background:'rgba(255,255,255,0.1)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${lessonImgPct}%`,background:T.gold,transition:'width .3s'}}/></div>
                  <p style={{fontSize:'.72rem',color:T.gold,marginTop:'.3rem'}}>{L.uploading} {lessonImgPct}%</p>
                </div>
              )}
              {(lessonForm.images||[]).length > 0 ? (
                <>
                  <p style={{fontSize:'.72rem',color:T.muted,marginBottom:'.75rem'}}>{L.mainImg}</p>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:'.75rem'}}>
                    {lessonForm.images!.map((url,i)=>(
                      <div key={i} style={{position:'relative',borderRadius:8,overflow:'hidden',border:`2px solid ${url===lessonForm.imageUrl?T.gold:T.border}`,cursor:'pointer'}}
                        onClick={()=>setLessonForm(f=>({...f,imageUrl:url}))}>
                        <img src={url} alt="" style={{width:'100%',height:75,objectFit:'cover',display:'block'}}/>
                        {url===lessonForm.imageUrl && <div style={{position:'absolute',top:3,left:3,background:T.gold,borderRadius:3,padding:'1px 5px',fontSize:'.6rem',fontWeight:700,color:'#000'}}>MAIN</div>}
                        <button onClick={e=>{e.stopPropagation();removeLessonImg(i);}}
                          style={{position:'absolute',top:3,right:3,width:20,height:20,borderRadius:'50%',background:'rgba(208,112,128,0.9)',border:'none',color:'#fff',fontSize:'.7rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>✕</button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{fontSize:'.82rem',color:T.muted,textAlign:'center',padding:'1rem'}}>No images yet ☝️</p>
              )}
            </div>

            {/* lesson PDFs */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'.5rem'}}>
                <p style={{fontSize:'.85rem',color:T.gold,fontWeight:700}}>📄 {L.lessonDocs}</p>
                <div style={{display:'flex',alignItems:'center',gap:'.75rem',flexWrap:'wrap'}}>
                  <span style={{fontSize:'.72rem',color:T.muted}}>{L.pdfHint}</span>
                  <input ref={lessonPdfRef} type="file" accept=".pdf" multiple onChange={handleLessonPdfsChange} style={{display:'none'}} id="lesson-pdfs"/>
                  <label htmlFor="lesson-pdfs" style={{display:'inline-flex',alignItems:'center',gap:'.4rem',padding:'.5rem 1rem',background:'rgba(201,160,72,0.08)',border:`1px solid ${T.border}`,borderRadius:8,color:T.gold,fontSize:'.82rem',fontWeight:700,cursor:'pointer'}}>
                    📁 {L.uploadLessonPdfs}
                  </label>
                </div>
              </div>
              {lessonPdfPct!==null && (
                <div style={{marginBottom:'1rem'}}>
                  <div style={{height:4,background:'rgba(255,255,255,0.1)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${lessonPdfPct}%`,background:T.gold,transition:'width .3s'}}/></div>
                  <p style={{fontSize:'.72rem',color:T.gold,marginTop:'.3rem'}}>{L.uploading} {lessonPdfPct}%</p>
                </div>
              )}
              {(lessonForm.pdfs||[]).length > 0 ? (
                <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
                  {lessonForm.pdfs!.map((pdf,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.6rem .9rem',background:'rgba(255,255,255,0.03)',border:`1px solid ${T.border}`,borderRadius:8}}>
                      <span>📄</span>
                      <a href={pdf.url} target="_blank" rel="noopener" style={{flex:1,fontSize:'.85rem',color:T.text2,textDecoration:'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}
                        onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)} onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>{pdf.name}</a>
                      <button onClick={()=>removeLessonPdf(i)} style={{background:'none',border:'none',color:T.rose,fontSize:'.85rem',cursor:'pointer',fontWeight:700}}>✕</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{fontSize:'.82rem',color:T.muted,textAlign:'center',padding:'1rem'}}>No materials yet ☝️</p>
              )}
            </div>

            {/* quiz builder */}
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2rem'}}>
              <h3 style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',color:T.white,fontWeight:700,marginBottom:'1.5rem'}}>{L.quizBuilder}</h3>
              <div style={{display:'flex',flexDirection:'column',gap:'.85rem',marginBottom:'1.25rem'}}>
                <input placeholder={L.question} value={quizForm.question} onChange={e=>setQuizForm({...quizForm,question:e.target.value})} style={inp()} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
                {quizForm.options.map((op,i)=>(
                  <input key={i} placeholder={`${L.option} ${i+1}`} value={op} onChange={e=>{const o=[...quizForm.options];o[i]=e.target.value;setQuizForm({...quizForm,options:o});}} style={{...inp(),fontSize:'.9rem'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
                ))}
                <div style={{display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
                  <label style={{fontSize:'.85rem',color:T.text2,fontWeight:600}}>{L.correctAnswer}</label>
                  <select value={quizForm.answer} onChange={e=>setQuizForm({...quizForm,answer:+e.target.value})} style={{padding:'.5rem .8rem',background:T.card,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:'inherit',fontSize:'.88rem',outline:'none'}}>
                    {[0,1,2,3].map(i=><option key={i} value={i}>{L.option} {i+1}</option>)}
                  </select>
                  <button onClick={addQuiz} style={{padding:'.5rem 1.2rem',background:'rgba(201,160,72,0.1)',border:`1px solid ${T.border}`,borderRadius:8,color:T.goldL,fontSize:'.85rem',fontWeight:700,cursor:'pointer'}}>{L.addQuestion}</button>
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
                      <button onClick={()=>setLessonForm(prev=>({...prev,quiz:prev.quiz.filter((_,j)=>j!==i)}))} style={{background:'none',border:'none',color:T.rose,fontSize:'.82rem',cursor:'pointer',fontWeight:600}}>{L.remove}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={saveLesson} disabled={saving||isUploading}
              style={{padding:'.95rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'1rem',cursor:(saving||isUploading)?'not-allowed':'pointer',opacity:(saving||isUploading)?.6:1}}>
              {saving?L.saving:editingLessonIdx!==null?L.saveChanges:L.saveLesson}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}