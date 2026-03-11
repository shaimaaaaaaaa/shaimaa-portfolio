'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, orderBy, query, serverTimestamp } from 'firebase/firestore';
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
    eyebrow:'admin panel', title:'Manage', span:'Articles',
    dashboard:'Dashboard', addNew:'Add New Article ✦',
    noArticles:'No articles yet.',
    newArticle:'New Article', editArticle:'Edit Article',
    titleEn:'Title (English) *', titleAr:'Title (Arabic)',
    excerptEn:'Excerpt (English) *', excerptAr:'Excerpt (Arabic)',
    contentEn:'Content (English) *', contentAr:'Content (Arabic)',
    readTime:'Read Time (minutes)', category:'Category',
    saving:'Saving...', saveChanges:'Save Changes ✦', addArticle:'Publish Article ✦',
    cancel:'Cancel', edit:'Edit', delete:'Delete', view:'View →',
    minRead:'min read', likes:'likes',
    categories:[
      {value:'agile',  label:'Agile'},
      {value:'tech',   label:'Tech'},
      {value:'career', label:'Career'},
    ],
  },
  ar: {
    langBtn:'English', dir:'rtl',
    eyebrow:'لوحة التحكم', title:'إدارة', span:'المقالات',
    dashboard:'لوحة التحكم', addNew:'إضافة مقال جديد ✦',
    noArticles:'لا توجد مقالات بعد.',
    newArticle:'مقال جديد', editArticle:'تعديل المقال',
    titleEn:'العنوان (إنجليزي) *', titleAr:'العنوان (عربي)',
    excerptEn:'المقتطف (إنجليزي) *', excerptAr:'المقتطف (عربي)',
    contentEn:'المحتوى (إنجليزي) *', contentAr:'المحتوى (عربي)',
    readTime:'وقت القراءة (دقائق)', category:'التصنيف',
    saving:'جاري الحفظ...', saveChanges:'حفظ التغييرات ✦', addArticle:'نشر المقال ✦',
    cancel:'إلغاء', edit:'تعديل', delete:'حذف', view:'عرض →',
    minRead:'دقيقة قراءة', likes:'إعجاب',
    categories:[
      {value:'agile',  label:'Agile'},
      {value:'tech',   label:'تقنية'},
      {value:'career', label:'مسيرة'},
    ],
  },
};

interface Article {
  id:string; title:string; title_ar:string; excerpt:string; excerpt_ar:string;
  content:string; content_ar:string; category:string; readTime:number;
  likes?:number; createdAt?:{seconds:number};
}

const EMPTY = { title:'', title_ar:'', excerpt:'', excerpt_ar:'', content:'', content_ar:'', category:'agile', readTime:5 };

const inp = (b=T.border): React.CSSProperties => ({
  width:'100%', padding:'.85rem 1rem', background:'rgba(255,255,255,0.04)',
  border:`1px solid ${b}`, borderRadius:10, color:T.text,
  fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif", fontSize:'.95rem', outline:'none', transition:'border-color .2s',
});

export default function AdminArticles() {
  const [loading,  setLoading]  = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [editing,  setEditing]  = useState<Article|null>(null);
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
      else { setLoading(false); fetchArticles(); }
    });
    return () => unsub();
  }, [router]);

  async function fetchArticles() {
    try {
      const q = query(collection(db,'articles'), orderBy('createdAt','desc'));
      const snap = await getDocs(q);
      setArticles(snap.docs.map(d=>({id:d.id,...d.data()} as Article)));
    } catch {
      const snap = await getDocs(collection(db,'articles'));
      setArticles(snap.docs.map(d=>({id:d.id,...d.data()} as Article)));
    }
  }

  async function handleSave() {
    if (!form.title || !form.content) return;
    setSaving(true);
    if (editing) {
      await updateDoc(doc(db,'articles',editing.id), { ...form });
    } else {
      await addDoc(collection(db,'articles'), { ...form, likes:0, createdAt: serverTimestamp() });
    }
    setForm(EMPTY);
    setEditing(null);
    setShowForm(false);
    await fetchArticles();
    setSaving(false);
  }

  async function handleDelete(id:string) {
    if (!confirm(lang==='ar'?'هل تريد حذف هذا المقال؟':'Delete this article?')) return;
    await deleteDoc(doc(db,'articles',id));
    await fetchArticles();
  }

  function handleEdit(a:Article) {
    setEditing(a);
    setForm({ title:a.title, title_ar:a.title_ar||'', excerpt:a.excerpt, excerpt_ar:a.excerpt_ar||'', content:a.content, content_ar:a.content_ar||'', category:a.category, readTime:a.readTime||5 });
    setShowForm(true);
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function formatDate(a:Article) {
    if (!a.createdAt?.seconds) return '';
    return new Date(a.createdAt.seconds*1000).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  }

  const L = LANG[lang];

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
        <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',color:T.goldL,fontWeight:700}}>✦ Admin Panel</span>
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

        {!showForm && (
          <button onClick={()=>{setEditing(null);setForm(EMPTY);setShowForm(true);}}
            style={{padding:'.85rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'.95rem',cursor:'pointer',boxShadow:`0 4px 20px rgba(138,31,50,0.4)`,marginBottom:'2.5rem'}}>
            {L.addNew}
          </button>
        )}

        {showForm && (
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2rem',marginBottom:'2.5rem'}}>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:T.white,fontWeight:700,marginBottom:'1.5rem'}}>
              {editing ? L.editArticle : L.newArticle}
            </h2>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                <input placeholder={L.titleEn} value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={{...inp(),direction:'ltr'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
                <input placeholder={L.titleAr} value={form.title_ar} onChange={e=>setForm({...form,title_ar:e.target.value})} style={{...inp(),direction:'rtl'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
                <textarea placeholder={L.excerptEn} value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} rows={2} style={{...inp(),resize:'vertical',direction:'ltr'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
                <textarea placeholder={L.excerptAr} value={form.excerpt_ar} onChange={e=>setForm({...form,excerpt_ar:e.target.value})} rows={2} style={{...inp(),resize:'vertical',direction:'rtl'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              </div>
              <textarea placeholder={L.contentEn} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows={8} style={{...inp(),resize:'vertical',direction:'ltr'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              <textarea placeholder={L.contentAr} value={form.content_ar} onChange={e=>setForm({...form,content_ar:e.target.value})} rows={8} style={{...inp(),resize:'vertical',direction:'rtl'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{...inp(),cursor:'pointer'}}>
                  {L.categories.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <input type="number" placeholder={L.readTime} value={form.readTime} onChange={e=>setForm({...form,readTime:+e.target.value})} style={{...inp(),direction:'ltr'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              </div>
              <div style={{display:'flex',gap:'1rem',marginTop:'.5rem'}}>
                <button onClick={handleSave} disabled={saving}
                  style={{padding:'.85rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'.95rem',cursor:saving?'not-allowed':'pointer',opacity:saving?.6:1}}>
                  {saving ? L.saving : editing ? L.saveChanges : L.addArticle}
                </button>
                <button onClick={()=>{setShowForm(false);setEditing(null);}}
                  style={{padding:'.85rem 2rem',background:'transparent',border:`1px solid ${T.border}`,color:T.text2,borderRadius:10,fontWeight:600,fontSize:'.95rem',cursor:'pointer'}}>
                  {L.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{display:'flex',flexDirection:'column',gap:'1.1rem'}}>
          {articles.length===0 && <p style={{color:T.muted,textAlign:'center',padding:'3rem'}}>{L.noArticles}</p>}
          {articles.map(a=>(
            <div key={a.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.4rem',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',transition:'border-color .2s'}}
              onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(201,160,72,0.4)')}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=T.border)}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',gap:'.75rem',alignItems:'center',marginBottom:'.4rem',flexWrap:'wrap'}}>
                  <span style={{fontSize:'.68rem',color:T.rose,letterSpacing:2,textTransform:'uppercase',fontFamily:'Playfair Display,serif'}}>{a.category}</span>
                  <span style={{fontSize:'.75rem',color:T.muted}}>{a.readTime} {L.minRead}</span>
                  <span style={{fontSize:'.75rem',color:T.muted}}>❤️ {a.likes||0} {L.likes}</span>
                  {a.createdAt && <span style={{fontSize:'.75rem',color:T.muted}}>{formatDate(a)}</span>}
                </div>
                <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.05rem',fontWeight:700,color:T.white,marginBottom:'.3rem'}}>{a.title}</div>
                <div style={{fontSize:'.82rem',color:T.muted,lineHeight:1.7}}>{a.excerpt}</div>
              </div>
              <div style={{display:'flex',gap:'.6rem',flexShrink:0}}>
                <Link href={`/articles/${a.id}`} target="_blank"
                  style={{padding:'.5rem 1rem',background:'transparent',border:`1px solid ${T.border}`,borderRadius:8,color:T.gold,fontSize:'.85rem',fontWeight:600,textDecoration:'none'}}>
                  {L.view}
                </Link>
                <button onClick={()=>handleEdit(a)}
                  style={{padding:'.5rem 1rem',background:'transparent',border:`1px solid ${T.border}`,borderRadius:8,color:T.text2,fontSize:'.85rem',fontWeight:600,cursor:'pointer'}}>
                  {L.edit}
                </button>
                <button onClick={()=>handleDelete(a.id)}
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