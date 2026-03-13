'use client';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, orderBy, query, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { LANG as NAV_LANG } from '../../lib/constants';
import type { Lang } from '../../lib/constants';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const T = {
  bg:'#0e0608', bg2:'#140a0c', card:'#1a0c10',
  burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', rose:'#d07080',
  white:'#ffffff', text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)', green:'#4ade80',
};

const LANG = {
  en: {
    dir:'ltr' as const, langBtn:'العربية',
    eyebrow:'admin panel', title:'Manage', span:'Articles',
    addArticle:'Add New Article ♥', noArticles:'No articles yet.',
    edit:'Edit', delete:'Delete', back:'Back', dashboard:'Dashboard',
    newArticle:'New Article', editArticle:'Edit Article',
    titleL:'Title (English) *', titleArL:'Title (Arabic)',
    excerptL:'Excerpt (English)', excerptArL:'Excerpt (Arabic)',
    contentL:'Content (English)', contentArL:'Content (Arabic)',
    categoryL:'Category', readTimeL:'Read Time (min)',
    saving:'Saving...', save:'Save Article ♥', create:'Create Article ♥',
    saved:'✓ Saved!',
  },
  ar: {
    dir:'rtl' as const, langBtn:'English',
    eyebrow:'لوحة التحكم', title:'إدارة', span:'المقالات',
    addArticle:'إضافة مقال جديد ♥', noArticles:'لا توجد مقالات بعد.',
    edit:'تعديل', delete:'حذف', back:'رجوع', dashboard:'لوحة التحكم',
    newArticle:'مقال جديد', editArticle:'تعديل المقال',
    titleL:'العنوان (إنجليزي) *', titleArL:'العنوان (عربي)',
    excerptL:'المقتطف (إنجليزي)', excerptArL:'المقتطف (عربي)',
    contentL:'المحتوى (إنجليزي)', contentArL:'المحتوى (عربي)',
    categoryL:'الفئة', readTimeL:'وقت القراءة (دقيقة)',
    saving:'جاري الحفظ...', save:'حفظ المقال ♥', create:'إنشاء المقال ♥',
    saved:'✓ تم الحفظ!',
  },
};

interface Article {
  id:string; title:string; title_ar:string; excerpt:string; excerpt_ar:string;
  content:string; content_ar:string; category:string; readTime:number;
  createdAt?:{seconds:number};
}

const EMPTY = { title:'', title_ar:'', excerpt:'', excerpt_ar:'', content:'', content_ar:'', category:'agile', readTime:5 };

const inp = (): React.CSSProperties => ({
  width:'100%', padding:'.85rem 1rem', background:'rgba(255,255,255,0.04)',
  border:`1px solid ${T.border}`, borderRadius:10, color:T.text,
  fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif", fontSize:'.95rem', outline:'none',
});

export default function AdminArticles() {
  const [loading,        setLoading]        = useState(true);
  const [articles,       setArticles]       = useState<Article[]>([]);
  const [step,           setStep]           = useState<'list'|'form'>('list');
  const [editingArticle, setEditingArticle] = useState<Article|null>(null);
  const [form,           setForm]           = useState(EMPTY);
  const [saving,         setSaving]         = useState(false);
  const [saved,          setSaved]          = useState(false);
  const [lang,           setLang]           = useState<Lang>('en');
  const [mounted,        setMounted]        = useState(false);
  const router = useRouter();

  useEffect(() => {
    const s = localStorage.getItem('lang') as Lang;
    if (s==='ar'||s==='en') setLang(s);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('lang', lang);
    document.documentElement.dir  = lang==='ar'?'rtl':'ltr';
    document.documentElement.lang = lang;
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
    if (!form.title.trim()) return;
    setSaving(true);
    if (editingArticle) {
      await updateDoc(doc(db,'articles',editingArticle.id), {...form});
    } else {
      await addDoc(collection(db,'articles'), {
        ...form,
        createdAt: { seconds: Math.floor(Date.now()/1000) },
        likes: 0,
      });
    }
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
    setForm(EMPTY);
    setEditingArticle(null);
    await fetchArticles();
    setSaving(false);
    setStep('list');
  }

  async function handleDelete(id:string) {
    if (!confirm(lang==='ar'?'هل تريد حذف هذا المقال؟':'Delete this article?')) return;
    await deleteDoc(doc(db,'articles',id));
    await fetchArticles();
  }

  function formatDate(a:Article) {
    if (!a.createdAt?.seconds) return '';
    return new Date(a.createdAt.seconds*1000).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  }

  const L  = LANG[lang];
  const LN = NAV_LANG[lang];

  if (loading) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  return (
    <main style={{minHeight:'100vh',background:T.bg,color:T.text,fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir}}>
      <div style={{position:'fixed',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.3) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none',zIndex:0}}/>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,padding:'1rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`}}>
        <span style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',color:T.goldL,fontWeight:700}}>♥ Admin Panel</span>
        <div style={{display:'flex',gap:'1.5rem',alignItems:'center'}}>
          {step!=='list' && (
            <button onClick={()=>{setStep('list');setEditingArticle(null);setForm(EMPTY);}}
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
        {/* HEADER */}
        <div style={{marginBottom:'3rem'}}>
          <span style={{fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'}}>{L.eyebrow}</span>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'2.4rem',fontWeight:900,color:T.white}}>
            {L.title} <span style={{color:T.gold,fontStyle:'italic'}}>{L.span}</span>
          </h1>
          <div style={{width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
        </div>

        {/* LIST */}
        {step==='list' && (
          <>
            <button onClick={()=>{setEditingArticle(null);setForm(EMPTY);setStep('form');}}
              style={{padding:'.85rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'.95rem',cursor:'pointer',boxShadow:`0 4px 20px rgba(138,31,50,0.4)`,marginBottom:'2.5rem'}}>
              {L.addArticle}
            </button>

            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              {articles.length===0 && (
                <p style={{color:T.muted,textAlign:'center',padding:'3rem',fontSize:'1rem'}}>{L.noArticles}</p>
              )}
              {articles.map(a=>(
                <div key={a.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.4rem',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',transition:'border-color .2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(201,160,72,0.4)')}
                  onMouseLeave={e=>(e.currentTarget.style.borderColor=T.border)}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:'Playfair Display,serif',fontSize:'1rem',fontWeight:700,color:T.white,marginBottom:'.25rem'}}>{a.title}</div>
                    {a.title_ar && <div style={{fontSize:'.85rem',color:T.text2,marginBottom:'.25rem',direction:'rtl'}}>{a.title_ar}</div>}
                    <div style={{display:'flex',gap:'1rem',alignItems:'center',marginTop:'.4rem',flexWrap:'wrap'}}>
                      <span style={{fontSize:'.72rem',color:T.rose,letterSpacing:2,textTransform:'uppercase',fontFamily:'Playfair Display,serif'}}>{a.category}</span>
                      <span style={{fontSize:'.72rem',color:T.muted}}>{a.readTime} min</span>
                      {a.createdAt && <span style={{fontSize:'.72rem',color:T.muted}}>{formatDate(a)}</span>}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'.6rem',flexShrink:0}}>
                    <button onClick={()=>{setEditingArticle(a);setForm({title:a.title,title_ar:a.title_ar||'',excerpt:a.excerpt||'',excerpt_ar:a.excerpt_ar||'',content:a.content||'',content_ar:a.content_ar||'',category:a.category||'agile',readTime:a.readTime||5});setStep('form');}}
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
          </>
        )}

        {/* FORM */}
        {step==='form' && (
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:18,padding:'2rem'}}>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:T.white,fontWeight:700,marginBottom:'1.5rem'}}>
              {editingArticle ? L.editArticle : L.newArticle}
            </h2>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>

              {/* TITLES */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                <input placeholder={L.titleL} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                  style={{...inp(),direction:'ltr'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
                <input placeholder={L.titleArL} value={form.title_ar} onChange={e=>setForm({...form,title_ar:e.target.value})}
                  style={{...inp(),direction:'rtl'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              </div>

              {/* EXCERPTS */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                <textarea placeholder={L.excerptL} value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})}
                  rows={3} style={{...inp(),resize:'vertical',direction:'ltr'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
                <textarea placeholder={L.excerptArL} value={form.excerpt_ar} onChange={e=>setForm({...form,excerpt_ar:e.target.value})}
                  rows={3} style={{...inp(),resize:'vertical',direction:'rtl'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              </div>

              {/* CONTENT */}
              <textarea placeholder={L.contentL} value={form.content} onChange={e=>setForm({...form,content:e.target.value})}
                rows={8} style={{...inp(),resize:'vertical',direction:'ltr'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              <textarea placeholder={L.contentArL} value={form.content_ar} onChange={e=>setForm({...form,content_ar:e.target.value})}
                rows={8} style={{...inp(),resize:'vertical',direction:'rtl'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>

              {/* CATEGORY + READ TIME */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                  style={{...inp(),cursor:'pointer'}}>
                  <option value="agile">Agile</option>
                  <option value="tech">Tech</option>
                  <option value="career">Career</option>
                </select>
                <input type="number" placeholder={L.readTimeL} value={form.readTime} onChange={e=>setForm({...form,readTime:+e.target.value})}
                  style={{...inp(),direction:'ltr'}} onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
              </div>

              {/* SAVE */}
              <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                <button onClick={handleSave} disabled={saving||!form.title.trim()}
                  style={{padding:'.85rem 2rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'.95rem',cursor:(saving||!form.title.trim())?'not-allowed':'pointer',opacity:(saving||!form.title.trim())?.6:1,boxShadow:`0 4px 20px rgba(138,31,50,0.4)`}}>
                  {saving ? L.saving : editingArticle ? L.save : L.create}
                </button>
                {saved && <span style={{color:T.green,fontWeight:600}}>{L.saved}</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}