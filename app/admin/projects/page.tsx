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
    eyebrow:'admin panel', title:'Manage', span:'Projects',
    dashboard:'Dashboard', addNew:'Add New Project ♥',
    noProjects:'No projects yet.', newProject:'New Project', editProject:'Edit Project',
    titlePlaceholder:'Project title *', stackPlaceholder:'Stack (Next.js, Laravel...)',
    githubPlaceholder:'GitHub URL', demoPlaceholder:'Demo URL',
    descPlaceholder:'Project description (English)', descArPlaceholder:'Project description (Arabic)',
    saving:'Saving...', saveChanges:'Save Changes ♥', addProject:'Add Project ♥',
    cancel:'Cancel', edit:'Edit', delete:'Delete',
    featured:'Featured ⭐', notFeatured:'Not Featured',
    featuredHint:'Featured projects appear on the home page',
    uploadImages:'Upload Images (multiple)', uploadPdfs:'Upload PDF Files (multiple)',
    uploadHint:'PNG, JPG up to 5MB each', pdfHint:'PDF up to 10MB each',
    uploading:'Uploading...', remove:'Remove',
    gallery:'Project Gallery', docs:'Project Documents',
    mainImg:'Click image to set as main',
    categories:[
      {value:'web',label:'Web Development'},{value:'agile',label:'Agile'},
      {value:'database',label:'Database'},{value:'desktop',label:'Desktop'},{value:'network',label:'Network'},
    ],
  },
  ar: {
    langBtn:'English', dir:'rtl',
    eyebrow:'لوحة التحكم', title:'إدارة', span:'المشاريع',
    dashboard:'لوحة التحكم', addNew:'إضافة مشروع جديد ♥',
    noProjects:'لا يوجد مشاريع بعد.', newProject:'مشروع جديد', editProject:'تعديل المشروع',
    titlePlaceholder:'عنوان المشروع *', stackPlaceholder:'التقنيات (Next.js, Laravel...)',
    githubPlaceholder:'رابط GitHub', demoPlaceholder:'رابط Demo',
    descPlaceholder:'وصف المشروع (إنجليزي)', descArPlaceholder:'وصف المشروع (عربي)',
    saving:'جاري الحفظ...', saveChanges:'حفظ التغييرات ♥', addProject:'إضافة المشروع ♥',
    cancel:'إلغاء', edit:'تعديل', delete:'حذف',
    featured:'مميز ⭐', notFeatured:'غير مميز',
    featuredHint:'المشاريع المميزة تظهر في الصفحة الرئيسية',
    uploadImages:'رفع صور (متعددة)', uploadPdfs:'رفع ملفات PDF (متعددة)',
    uploadHint:'PNG أو JPG حتى 5MB لكل صورة', pdfHint:'PDF حتى 10MB لكل ملف',
    uploading:'جاري الرفع...', remove:'حذف',
    gallery:'معرض المشروع', docs:'وثائق المشروع',
    mainImg:'اضغط على صورة لتعيينها كرئيسية',
    categories:[
      {value:'web',label:'Web Development'},{value:'agile',label:'Agile'},
      {value:'database',label:'Database'},{value:'desktop',label:'Desktop'},{value:'network',label:'Network'},
    ],
  },
};

interface PdfFile { name: string; url: string; }
interface Project {
  id:string; title:string; desc:string; desc_en:string; desc_ar:string;
  stack:string; category:string; github:string; demo:string;
  featured?:boolean; imageUrl?:string; images?:string[]; pdfs?:PdfFile[];
}

const inp = (b=T.border): React.CSSProperties => ({
  width:'100%', padding:'.85rem 1rem', background:'rgba(255,255,255,0.04)',
  border:`1px solid ${b}`, borderRadius:10, color:T.text,
  fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif", fontSize:'.95rem', outline:'none', transition:'border-color .2s',
});

const EMPTY = {
  title:'', desc:'', desc_en:'', desc_ar:'', stack:'', category:'web',
  github:'', demo:'', featured:false, imageUrl:'', images:[] as string[], pdfs:[] as PdfFile[],
};

async function uploadToCloudinary(file: File, folder: string, type: 'image'|'raw', onProgress: (p:number)=>void): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `portfolio/${folder}`);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const endpoint = type === 'raw'
      ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`
      : `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    xhr.open('POST', endpoint);
    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(Math.round(e.loaded/e.total*100)); };
    xhr.onload = () => {
      if (xhr.status === 200) resolve(JSON.parse(xhr.responseText).secure_url);
      else reject(new Error('Upload failed'));
    };
    xhr.onerror = () => reject(new Error('Upload error'));
    xhr.send(formData);
  });
}

export default function AdminProjects() {
  const [loading,     setLoading]     = useState(true);
  const [projects,    setProjects]    = useState<Project[]>([]);
  const [editing,     setEditing]     = useState<Project|null>(null);
  const [form,        setForm]        = useState(EMPTY);
  const [saving,      setSaving]      = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [lang,        setLang]        = useState<'en'|'ar'>('en');
  const [mounted,     setMounted]     = useState(false);
  const [imgProgress, setImgProgress] = useState<number|null>(null);
  const [pdfProgress, setPdfProgress] = useState<number|null>(null);
  const imgRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('lang') as 'en'|'ar';
    if (saved==='ar'||saved==='en') setLang(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('lang', lang);
    document.documentElement.dir = lang==='ar'?'rtl':'ltr';
  }, [lang, mounted]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (!user) router.push('/admin/login');
      else { setLoading(false); fetchProjects(); }
    });
    return () => unsub();
  }, [router]);

  async function fetchProjects() {
    const snap = await getDocs(collection(db,'projects'));
    setProjects(snap.docs.map(d=>({id:d.id,...d.data()} as Project)));
  }

  async function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      if (file.size > 5*1024*1024) { alert(`${file.name} is too large (max 5MB)`); continue; }
      setImgProgress(0);
      try {
        const url = await uploadToCloudinary(file, 'projects', 'image', setImgProgress);
        setForm(f => ({
          ...f,
          images: [...(f.images||[]), url],
          imageUrl: f.imageUrl || url,
        }));
      } catch { alert(`Failed to upload ${file.name}`); }
    }
    setImgProgress(null);
    if (imgRef.current) imgRef.current.value = '';
  }

  async function handlePdfsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      if (file.size > 10*1024*1024) { alert(`${file.name} is too large (max 10MB)`); continue; }
      setPdfProgress(0);
      try {
        const url = await uploadToCloudinary(file, 'projects/docs', 'raw', setPdfProgress);
        setForm(f => ({ ...f, pdfs: [...(f.pdfs||[]), { name: file.name, url }] }));
      } catch { alert(`Failed to upload ${file.name}`); }
    }
    setPdfProgress(null);
    if (pdfRef.current) pdfRef.current.value = '';
  }

  function removeImage(idx: number) {
    setForm(f => {
      const imgs = f.images.filter((_,i)=>i!==idx);
      return { ...f, images: imgs, imageUrl: imgs[0]||'' };
    });
  }

  function removePdf(idx: number) {
    setForm(f => ({ ...f, pdfs: f.pdfs.filter((_,i)=>i!==idx) }));
  }

  async function handleSave() {
    if (!form.title) return;
    setSaving(true);
    const data = {
      title: form.title, desc: form.desc_en||form.desc,
      desc_en: form.desc_en||form.desc, desc_ar: form.desc_ar,
      stack: form.stack, category: form.category,
      github: form.github, demo: form.demo,
      featured: form.featured,
      imageUrl: form.imageUrl || form.images?.[0] || '',
      images: form.images || [],
      pdfs: form.pdfs || [],
    };
    if (editing) await updateDoc(doc(db,'projects',editing.id), data);
    else await addDoc(collection(db,'projects'), data);
    setForm(EMPTY); setEditing(null); setShowForm(false);
    await fetchProjects(); setSaving(false);
  }

  async function handleDelete(p: Project) {
    if (!confirm(lang==='ar'?'هل تريد حذف هذا المشروع؟':'Delete this project?')) return;
    await deleteDoc(doc(db,'projects',p.id));
    await fetchProjects();
  }

  async function toggleFeatured(p: Project) {
    await updateDoc(doc(db,'projects',p.id), {featured: !p.featured});
    await fetchProjects();
  }

  function handleEdit(p: Project) {
    setEditing(p);
    setForm({
      title:p.title, desc:p.desc, desc_en:p.desc_en||p.desc, desc_ar:p.desc_ar||'',
      stack:p.stack, category:p.category, github:p.github, demo:p.demo,
      featured:p.featured||false, imageUrl:p.imageUrl||'',
      images: p.images || (p.imageUrl ? [p.imageUrl] : []),
      pdfs: p.pdfs || [],
    });
    setShowForm(true);
    window.scrollTo({top:0,behavior:'smooth'});
  }

  const L = LANG[lang];
  const featuredCount = projects.filter(p=>p.featured).length;
  const isUploading = imgProgress !== null || pdfProgress !== null;

  if (loading) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  return (
    <main style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir as 'ltr'|'rtl'}}>
      <div style={{position:'fixed',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.3) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none',zIndex:0}}/>

      <nav style={{position:'sticky',top:0,zIndex:100,padding:'1rem 3rem',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`}}>
        <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',color:T.goldL,fontWeight:700}}>♥ Admin Panel</span>
        <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
          <button onClick={()=>setLang(lang==='en'?'ar':'en')} style={{padding:'.4rem 1rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:20,color:T.gold,fontSize:'.82rem',fontWeight:700,cursor:'pointer'}}>{L.langBtn}</button>
          <Link href="/admin/dashboard" style={{fontSize:'.88rem',color:T.text2,textDecoration:'none',fontWeight:600}} onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)} onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>{L.dashboard}</Link>
        </div>
      </nav>

      <div style={{maxWidth:900,margin:'0 auto',padding:'3.5rem 2rem',position:'relative',zIndex:1}}>
        <div style={{marginBottom:'3rem'}}>
          <span style={{fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'}}>{L.eyebrow}</span>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'2.4rem',fontWeight:900,color:T.white}}>{L.title} <span style={{color:T.gold,fontStyle:'italic'}}>{L.span}</span></h1>
          <div style={{width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.85rem 1.25rem',background:'rgba(201,160,72,0.08)',border:`1px solid rgba(201,160,72,0.2)`,borderRadius:12,marginBottom:'1.5rem',fontSize:'.85rem',color:T.text2}}>
          <span>⭐</span><span>{L.featuredHint}</span>
          <span style={{marginLeft:'auto',color:T.gold,fontWeight:700}}>{featuredCount} featured</span>
        </div>

        {!showForm && (
          <button onClick={()=>{setEditing(null);setForm(EMPTY);setShowForm(true);}}
            style={{padding:'.85rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'.95rem',cursor:'pointer',boxShadow:`0 4px 20px rgba(138,31,50,0.4)`,marginBottom:'2.5rem'}}>
            {L.addNew}
          </button>
        )}

        {showForm && (
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2rem',marginBottom:'2.5rem'}}>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:T.white,fontWeight:700,marginBottom:'1.5rem'}}>
              {editing ? L.editProject : L.newProject}
            </h2>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <input placeholder={L.titlePlaceholder} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={inp()} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              <input placeholder={L.stackPlaceholder} value={form.stack} onChange={e=>setForm({...form,stack:e.target.value})} style={inp()} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              <input placeholder={L.githubPlaceholder} value={form.github} onChange={e=>setForm({...form,github:e.target.value})} style={{...inp(),direction:'ltr'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              <input placeholder={L.demoPlaceholder} value={form.demo} onChange={e=>setForm({...form,demo:e.target.value})} style={{...inp(),direction:'ltr'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{...inp(),cursor:'pointer'}}>
                {L.categories.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
              </select>

              <div style={{display:'flex',alignItems:'center',gap:'1rem',padding:'.85rem 1rem',background:'rgba(255,255,255,0.03)',border:`1px solid ${form.featured?'rgba(201,160,72,0.5)':T.border}`,borderRadius:10,cursor:'pointer'}} onClick={()=>setForm({...form,featured:!form.featured})}>
                <div style={{width:40,height:22,borderRadius:11,background:form.featured?'rgba(201,160,72,0.6)':'rgba(255,255,255,0.1)',border:`1px solid ${form.featured?T.gold:T.border}`,position:'relative',transition:'all .2s',flexShrink:0}}>
                  <div style={{position:'absolute',top:2,left:form.featured?20:2,width:16,height:16,borderRadius:'50%',background:form.featured?T.gold:'#666',transition:'all .2s'}}/>
                </div>
                <span style={{fontSize:'.88rem',color:form.featured?T.gold:T.muted,fontWeight:600}}>{form.featured?L.featured:L.notFeatured}</span>
              </div>

              <textarea placeholder={L.descPlaceholder} value={form.desc_en} onChange={e=>setForm({...form,desc_en:e.target.value})} rows={3} style={{...inp(),resize:'vertical',gridColumn:'1/-1',direction:'ltr'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              <textarea placeholder={L.descArPlaceholder} value={form.desc_ar} onChange={e=>setForm({...form,desc_ar:e.target.value})} rows={3} style={{...inp(),resize:'vertical',gridColumn:'1/-1',direction:'rtl'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
            </div>

            {/* ── IMAGES GALLERY ── */}
            <div style={{marginTop:'1.5rem',border:`2px dashed ${T.border}`,borderRadius:12,padding:'1.25rem',background:'rgba(255,255,255,0.02)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'.5rem'}}>
                <p style={{fontSize:'.85rem',color:T.gold,fontWeight:700}}>🖼 {L.gallery}</p>
                <div style={{display:'flex',alignItems:'center',gap:'.75rem',flexWrap:'wrap'}}>
                  <span style={{fontSize:'.72rem',color:T.muted}}>{L.uploadHint}</span>
                  <input ref={imgRef} type="file" accept="image/*" multiple onChange={handleImagesChange} style={{display:'none'}} id="proj-imgs"/>
                  <label htmlFor="proj-imgs" style={{display:'inline-flex',alignItems:'center',gap:'.4rem',padding:'.5rem 1rem',background:'rgba(201,160,72,0.08)',border:`1px solid ${T.border}`,borderRadius:8,color:T.gold,fontSize:'.82rem',fontWeight:700,cursor:'pointer'}}>
                    📁 {L.uploadImages}
                  </label>
                </div>
              </div>
              {imgProgress !== null && (
                <div style={{marginBottom:'1rem'}}>
                  <div style={{height:4,background:'rgba(255,255,255,0.1)',borderRadius:2,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${imgProgress}%`,background:T.gold,transition:'width .3s'}}/>
                  </div>
                  <p style={{fontSize:'.72rem',color:T.gold,marginTop:'.3rem'}}>{L.uploading} {imgProgress}%</p>
                </div>
              )}
              {form.images.length > 0 ? (
                <>
                  <p style={{fontSize:'.72rem',color:T.muted,marginBottom:'.75rem'}}>{L.mainImg}</p>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:'.75rem'}}>
                    {form.images.map((url,i)=>(
                      <div key={i} style={{position:'relative',borderRadius:8,overflow:'hidden',border:`2px solid ${url===form.imageUrl?T.gold:T.border}`,cursor:'pointer'}} onClick={()=>setForm(f=>({...f,imageUrl:url}))}>
                        <img src={url} alt={`img-${i}`} style={{width:'100%',height:80,objectFit:'cover',display:'block'}}/>
                        {url===form.imageUrl && (
                          <div style={{position:'absolute',top:4,left:4,background:T.gold,borderRadius:4,padding:'1px 6px',fontSize:'.65rem',fontWeight:700,color:'#000'}}>MAIN</div>
                        )}
                        <button onClick={e=>{e.stopPropagation();removeImage(i);}}
                          style={{position:'absolute',top:4,right:4,width:22,height:22,borderRadius:'50%',background:'rgba(208,112,128,0.9)',border:'none',color:'#fff',fontSize:'.75rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>✕</button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{fontSize:'.82rem',color:T.muted,textAlign:'center',padding:'1rem'}}>No images yet — upload some above ☝️</p>
              )}
            </div>

            {/* ── PDF FILES ── */}
            <div style={{marginTop:'1rem',border:`2px dashed ${T.border}`,borderRadius:12,padding:'1.25rem',background:'rgba(255,255,255,0.02)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'.5rem'}}>
                <p style={{fontSize:'.85rem',color:T.gold,fontWeight:700}}>📄 {L.docs}</p>
                <div style={{display:'flex',alignItems:'center',gap:'.75rem',flexWrap:'wrap'}}>
                  <span style={{fontSize:'.72rem',color:T.muted}}>{L.pdfHint}</span>
                  <input ref={pdfRef} type="file" accept=".pdf" multiple onChange={handlePdfsChange} style={{display:'none'}} id="proj-pdfs"/>
                  <label htmlFor="proj-pdfs" style={{display:'inline-flex',alignItems:'center',gap:'.4rem',padding:'.5rem 1rem',background:'rgba(201,160,72,0.08)',border:`1px solid ${T.border}`,borderRadius:8,color:T.gold,fontSize:'.82rem',fontWeight:700,cursor:'pointer'}}>
                    📁 {L.uploadPdfs}
                  </label>
                </div>
              </div>
              {pdfProgress !== null && (
                <div style={{marginBottom:'1rem'}}>
                  <div style={{height:4,background:'rgba(255,255,255,0.1)',borderRadius:2,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${pdfProgress}%`,background:T.gold,transition:'width .3s'}}/>
                  </div>
                  <p style={{fontSize:'.72rem',color:T.gold,marginTop:'.3rem'}}>{L.uploading} {pdfProgress}%</p>
                </div>
              )}
              {form.pdfs.length > 0 ? (
                <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
                  {form.pdfs.map((pdf,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.6rem .9rem',background:'rgba(255,255,255,0.03)',border:`1px solid ${T.border}`,borderRadius:8}}>
                      <span style={{fontSize:'1rem'}}>📄</span>
                      <a href={pdf.url} target="_blank" rel="noopener" style={{flex:1,fontSize:'.85rem',color:T.text2,textDecoration:'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}
                        onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)} onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>
                        {pdf.name}
                      </a>
                      <button onClick={()=>removePdf(i)} style={{background:'none',border:'none',color:T.rose,fontSize:'.85rem',cursor:'pointer',fontWeight:700,flexShrink:0}}>✕</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{fontSize:'.82rem',color:T.muted,textAlign:'center',padding:'1rem'}}>No documents yet — upload PDFs above ☝️</p>
              )}
            </div>

            <div style={{display:'flex',gap:'1rem',marginTop:'1.5rem'}}>
              <button onClick={handleSave} disabled={saving||isUploading}
                style={{padding:'.85rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'.95rem',cursor:(saving||isUploading)?'not-allowed':'pointer',opacity:(saving||isUploading)?.6:1}}>
                {saving?L.saving:editing?L.saveChanges:L.addProject}
              </button>
              <button onClick={()=>{setShowForm(false);setEditing(null);}} style={{padding:'.85rem 2rem',background:'transparent',border:`1px solid ${T.border}`,color:T.text2,borderRadius:10,fontWeight:600,fontSize:'.95rem',cursor:'pointer'}}>{L.cancel}</button>
            </div>
          </div>
        )}

        {/* LIST */}
        <div style={{display:'flex',flexDirection:'column',gap:'1.1rem'}}>
          {projects.length===0 && <p style={{color:T.muted,textAlign:'center',padding:'3rem'}}>{L.noProjects}</p>}
          {projects.map(p=>(
            <div key={p.id} style={{background:T.card,border:`1px solid ${p.featured?'rgba(201,160,72,0.45)':T.border}`,borderRadius:16,padding:'1.4rem',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',transition:'border-color .2s'}}
              onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(201,160,72,0.4)')}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=p.featured?'rgba(201,160,72,0.45)':T.border)}>
              <div style={{display:'flex',gap:'1rem',flex:1,alignItems:'flex-start'}}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.title} style={{width:80,height:60,objectFit:'cover',borderRadius:8,border:`1px solid ${T.border}`,flexShrink:0}}/>
                ) : (
                  <div style={{width:80,height:60,borderRadius:8,background:`linear-gradient(135deg,${T.burg},#1a0c10)`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,border:`1px solid ${T.border}`}}>
                    <span style={{fontFamily:'monospace',color:T.goldL,fontSize:'.7rem',fontWeight:700}}>{p.category.slice(0,4).toUpperCase()}</span>
                  </div>
                )}
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.25rem'}}>
                    {p.featured && <span>⭐</span>}
                    <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.05rem',fontWeight:700,color:T.white}}>{p.title}</span>
                  </div>
                  <div style={{fontSize:'.85rem',color:T.gold,fontWeight:600,marginBottom:'.25rem'}}>{p.stack}</div>
                  <div style={{fontSize:'.82rem',color:T.muted,lineHeight:1.6,marginBottom:'.4rem'}}>{p.desc_en||p.desc}</div>
                  <div style={{display:'flex',gap:'.75rem',flexWrap:'wrap',alignItems:'center'}}>
                    {(p.images?.length||0)>0 && <span style={{fontSize:'.72rem',color:T.text2}}>🖼 {p.images?.length} images</span>}
                    {(p.pdfs?.length||0)>0 && <span style={{fontSize:'.72rem',color:T.text2}}>📄 {p.pdfs?.length} docs</span>}
                    {p.github && <a href={p.github} target="_blank" rel="noopener" style={{fontSize:'.78rem',color:T.text2,textDecoration:'none'}} onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)} onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>GitHub ↗</a>}
                    {p.demo   && <a href={p.demo}   target="_blank" rel="noopener" style={{fontSize:'.78rem',color:T.text2,textDecoration:'none'}} onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)} onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>Demo ↗</a>}
                  </div>
                </div>
              </div>
              <div style={{display:'flex',gap:'.6rem',flexShrink:0,flexWrap:'wrap',justifyContent:'flex-end'}}>
                <button onClick={()=>toggleFeatured(p)} style={{padding:'.5rem .85rem',background:p.featured?'rgba(201,160,72,0.15)':'transparent',border:`1px solid ${p.featured?T.gold:T.border}`,borderRadius:8,color:p.featured?T.gold:T.muted,fontSize:'.9rem',cursor:'pointer'}}>⭐</button>
                <button onClick={()=>handleEdit(p)} style={{padding:'.5rem 1rem',background:'transparent',border:`1px solid ${T.border}`,borderRadius:8,color:T.text2,fontSize:'.85rem',fontWeight:600,cursor:'pointer'}}>{L.edit}</button>
                <button onClick={()=>handleDelete(p)} style={{padding:'.5rem 1rem',background:'rgba(138,31,50,0.2)',border:`1px solid rgba(138,31,50,0.4)`,borderRadius:8,color:T.rose,fontSize:'.85rem',fontWeight:600,cursor:'pointer'}}>{L.delete}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}