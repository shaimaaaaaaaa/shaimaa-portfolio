'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const T = {
  bg:'#0e0608', card:'#1a0c10', burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', white:'#ffffff',
  text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)', rose:'#d07080',
};

const LANG = {
  en: {
    langBtn:'العربية', dir:'ltr',
    eyebrow:'admin panel', title:'Manage', span:'Projects',
    dashboard:'Dashboard', addNew:'Add New Project ♥',
    noProjects:'No projects yet.',
    newProject:'New Project', editProject:'Edit Project',
    titlePlaceholder:'Project title *', stackPlaceholder:'Stack (Next.js, Laravel...)',
    githubPlaceholder:'GitHub URL', demoPlaceholder:'Demo URL',
    descPlaceholder:'Project description (English)',
    descArPlaceholder:'Project description (Arabic)',
    saving:'Saving...', saveChanges:'Save Changes ♥', addProject:'Add Project ♥',
    cancel:'Cancel', edit:'Edit', delete:'Delete',
    featured:'Featured ⭐', notFeatured:'Not Featured',
    featuredHint:'Featured projects appear on the home page',
    categories:[
      {value:'web',      label:'Web Development'},
      {value:'agile',    label:'Agile'},
      {value:'database', label:'Database'},
      {value:'desktop',  label:'Desktop'},
      {value:'network',  label:'Network'},
    ],
  },
  ar: {
    langBtn:'English', dir:'rtl',
    eyebrow:'لوحة التحكم', title:'إدارة', span:'المشاريع',
    dashboard:'لوحة التحكم', addNew:'إضافة مشروع جديد ♥',
    noProjects:'لا يوجد مشاريع بعد.',
    newProject:'مشروع جديد', editProject:'تعديل المشروع',
    titlePlaceholder:'عنوان المشروع *', stackPlaceholder:'التقنيات (Next.js, Laravel...)',
    githubPlaceholder:'رابط GitHub', demoPlaceholder:'رابط Demo',
    descPlaceholder:'وصف المشروع (إنجليزي)',
    descArPlaceholder:'وصف المشروع (عربي)',
    saving:'جاري الحفظ...', saveChanges:'حفظ التغييرات ♥', addProject:'إضافة المشروع ♥',
    cancel:'إلغاء', edit:'تعديل', delete:'حذف',
    featured:'مميز ⭐', notFeatured:'غير مميز',
    featuredHint:'المشاريع المميزة تظهر في الصفحة الرئيسية',
    categories:[
      {value:'web',      label:'Web Development'},
      {value:'agile',    label:'Agile'},
      {value:'database', label:'Database'},
      {value:'desktop',  label:'Desktop'},
      {value:'network',  label:'Network'},
    ],
  },
};

interface Project {
  id:string; title:string; desc:string; desc_en:string; desc_ar:string;
  stack:string; category:string; github:string; demo:string; featured?:boolean;
}

const inp = (b=T.border): React.CSSProperties => ({
  width:'100%', padding:'.85rem 1rem', background:'rgba(255,255,255,0.04)',
  border:`1px solid ${b}`, borderRadius:10, color:T.text,
  fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif", fontSize:'.95rem', outline:'none', transition:'border-color .2s',
});

const EMPTY = {title:'',desc:'',desc_en:'',desc_ar:'',stack:'',category:'web',github:'',demo:'',featured:false};

export default function AdminProjects() {
  const [loading,  setLoading]  = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing,  setEditing]  = useState<Project|null>(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [lang,     setLang]     = useState<'en'|'ar'>('en');
  const [mounted,  setMounted]  = useState(false);
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
      else { setLoading(false); fetchProjects(); }
    });
    return () => unsub();
  }, [router]);

  async function fetchProjects() {
    const snap = await getDocs(collection(db,'projects'));
    setProjects(snap.docs.map(d=>({id:d.id,...d.data()} as Project)));
  }

  async function handleSave() {
    if (!form.title) return;
    setSaving(true);
    const data = {
      title:    form.title,
      desc:     form.desc_en || form.desc,
      desc_en:  form.desc_en || form.desc,
      desc_ar:  form.desc_ar,
      stack:    form.stack,
      category: form.category,
      github:   form.github,
      demo:     form.demo,
      featured: form.featured,
    };
    if (editing) await updateDoc(doc(db,'projects',editing.id), data);
    else await addDoc(collection(db,'projects'), data);
    setForm(EMPTY);
    setEditing(null);
    setShowForm(false);
    await fetchProjects();
    setSaving(false);
  }

  async function handleDelete(id:string) {
    if (!confirm(lang==='ar'?'هل تريد حذف هذا المشروع؟':'Delete this project?')) return;
    await deleteDoc(doc(db,'projects',id));
    await fetchProjects();
  }

  async function toggleFeatured(p:Project) {
    await updateDoc(doc(db,'projects',p.id), {featured: !p.featured});
    await fetchProjects();
  }

  function handleEdit(p:Project) {
    setEditing(p);
    setForm({
      title:    p.title,
      desc:     p.desc,
      desc_en:  p.desc_en || p.desc,
      desc_ar:  p.desc_ar || '',
      stack:    p.stack,
      category: p.category,
      github:   p.github,
      demo:     p.demo,
      featured: p.featured || false,
    });
    setShowForm(true);
    window.scrollTo({top:0,behavior:'smooth'});
  }

  const L = LANG[lang];
  const featuredCount = projects.filter(p=>p.featured).length;

  if (loading) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  return (
    <main style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir as 'ltr'|'rtl'}}>
      <div style={{position:'fixed',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.3) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none',zIndex:0}}/>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,padding:'1rem 3rem',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`}}>
        <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',color:T.goldL,fontWeight:700}}>♥ Admin Panel</span>
        <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
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
          <span style={{fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'}}>{L.eyebrow}</span>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'2.4rem',fontWeight:900,color:T.white}}>
            {L.title} <span style={{color:T.gold,fontStyle:'italic'}}>{L.span}</span>
          </h1>
          <div style={{width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
        </div>

        {/* FEATURED HINT */}
        <div style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.85rem 1.25rem',background:'rgba(201,160,72,0.08)',border:`1px solid rgba(201,160,72,0.2)`,borderRadius:12,marginBottom:'1.5rem',fontSize:'.85rem',color:T.text2}}>
          <span style={{fontSize:'1.1rem'}}>⭐</span>
          <span>{L.featuredHint}</span>
          <span style={{marginLeft:'auto',color:T.gold,fontWeight:700}}>{featuredCount} featured</span>
        </div>

        {!showForm && (
          <button onClick={()=>{setEditing(null);setForm(EMPTY);setShowForm(true);}}
            style={{padding:'.85rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'.95rem',cursor:'pointer',boxShadow:`0 4px 20px rgba(138,31,50,0.4)`,marginBottom:'2.5rem'}}>
            {L.addNew}
          </button>
        )}

        {/* FORM */}
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

              {/* FEATURED TOGGLE */}
              <div style={{display:'flex',alignItems:'center',gap:'1rem',padding:'.85rem 1rem',background:'rgba(255,255,255,0.03)',border:`1px solid ${form.featured?'rgba(201,160,72,0.5)':T.border}`,borderRadius:10,cursor:'pointer'}}
                onClick={()=>setForm({...form,featured:!form.featured})}>
                <div style={{width:40,height:22,borderRadius:11,background:form.featured?'rgba(201,160,72,0.6)':'rgba(255,255,255,0.1)',border:`1px solid ${form.featured?T.gold:T.border}`,position:'relative',transition:'all .2s',flexShrink:0}}>
                  <div style={{position:'absolute',top:2,left:form.featured?20:2,width:16,height:16,borderRadius:'50%',background:form.featured?T.gold:'#666',transition:'all .2s'}}/>
                </div>
                <span style={{fontSize:'.88rem',color:form.featured?T.gold:T.muted,fontWeight:600}}>
                  {form.featured ? L.featured : L.notFeatured}
                </span>
              </div>

              <textarea placeholder={L.descPlaceholder} value={form.desc_en} onChange={e=>setForm({...form,desc_en:e.target.value})} rows={3} style={{...inp(),resize:'vertical',gridColumn:'1/-1',direction:'ltr'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              <textarea placeholder={L.descArPlaceholder} value={form.desc_ar} onChange={e=>setForm({...form,desc_ar:e.target.value})} rows={3} style={{...inp(),resize:'vertical',gridColumn:'1/-1',direction:'rtl'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
            </div>
            <div style={{display:'flex',gap:'1rem',marginTop:'1.25rem'}}>
              <button onClick={handleSave} disabled={saving}
                style={{padding:'.85rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'.95rem',cursor:saving?'not-allowed':'pointer',opacity:saving?.6:1}}>
                {saving ? L.saving : editing ? L.saveChanges : L.addProject}
              </button>
              <button onClick={()=>{setShowForm(false);setEditing(null);}}
                style={{padding:'.85rem 2rem',background:'transparent',border:`1px solid ${T.border}`,color:T.text2,borderRadius:10,fontWeight:600,fontSize:'.95rem',cursor:'pointer'}}>
                {L.cancel}
              </button>
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
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'.6rem',marginBottom:'.3rem'}}>
                  {p.featured && <span style={{fontSize:'.85rem'}} title="Featured on home page">⭐</span>}
                  <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.05rem',fontWeight:700,color:T.white}}>{p.title}</div>
                </div>
                <div style={{fontSize:'.85rem',color:T.gold,fontWeight:600,marginBottom:'.3rem'}}>{p.stack}</div>
                <div style={{fontSize:'.82rem',color:T.muted,lineHeight:1.7}}>{p.desc_en||p.desc}</div>
                <div style={{display:'flex',gap:'1rem',marginTop:'.5rem'}}>
                  {p.github && <a href={p.github} target="_blank" rel="noopener" style={{fontSize:'.78rem',color:T.text2,textDecoration:'none'}} onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)} onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>GitHub ↗</a>}
                  {p.demo   && <a href={p.demo}   target="_blank" rel="noopener" style={{fontSize:'.78rem',color:T.text2,textDecoration:'none'}} onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)} onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>Demo ↗</a>}
                </div>
              </div>
              <div style={{display:'flex',gap:'.6rem',flexShrink:0,flexWrap:'wrap',justifyContent:'flex-end'}}>
                {/* FEATURED TOGGLE BUTTON */}
                <button onClick={()=>toggleFeatured(p)}
                  title={p.featured?'Remove from featured':'Add to featured'}
                  style={{padding:'.5rem .85rem',background:p.featured?'rgba(201,160,72,0.15)':'transparent',border:`1px solid ${p.featured?T.gold:T.border}`,borderRadius:8,color:p.featured?T.gold:T.muted,fontSize:'.9rem',cursor:'pointer',transition:'all .2s'}}>
                  ⭐
                </button>
                <button onClick={()=>handleEdit(p)}
                  style={{padding:'.5rem 1rem',background:'transparent',border:`1px solid ${T.border}`,borderRadius:8,color:T.text2,fontSize:'.85rem',fontWeight:600,cursor:'pointer'}}>
                  {L.edit}
                </button>
                <button onClick={()=>handleDelete(p.id)}
                  style={{padding:'.5rem 1rem',background:'rgba(138,31,50,0.2)',border:`1px solid rgba(138,31,50,0.4)`,borderRadius:8,color:T.rose,fontSize:'.85rem',fontWeight:600,cursor:'pointer'}}>
                  {L.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}