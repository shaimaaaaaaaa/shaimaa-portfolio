'use client';
import { useEffect, useState, use } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, addDoc, getDocs, orderBy, query, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { LANG as NAV_LANG } from '../../lib/constants';
import type { Lang } from '../../lib/constants';
import Navbar from '../../components/Navbar';

const T = {
  bg:'#0e0608', bg2:'#140a0c', card:'#1a0c10',
  burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', rose:'#d07080',
  white:'#ffffff', text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)', green:'#4ade80',
};

const LANG = {
  en: {
    dir:'ltr' as const, langBtn:'العربية', back:'← Back to Articles',
    minRead:'min read', comments:'Comments',
    like:'Like ♥', liked:'Liked ♥', shareOn:'Share on',
    writeComment:'Write a comment...', yourName:'Your name',
    postComment:'Post Comment', posting:'Posting...',
    noComments:'Be the first to comment!', commentPosted:'Comment posted!',
  },
  ar: {
    dir:'rtl' as const, langBtn:'English', back:'المقالات ←',
    minRead:'دقيقة قراءة', comments:'تعليقات',
    like:'أعجبني ♥', liked:'معجب ♥', shareOn:'شارك على',
    writeComment:'اكتب تعليقاً...', yourName:'اسمك',
    postComment:'نشر التعليق', posting:'جاري النشر...',
    noComments:'كن أول من يعلق!', commentPosted:'تم نشر تعليقك!',
  },
};

interface Article {
  id:string; title:string; title_ar:string; content:string; content_ar:string;
  excerpt:string; excerpt_ar:string; category:string; readTime:number;
  createdAt?:{seconds:number}; likes?:number;
}
interface Comment { id:string; name:string; text:string; createdAt?:{seconds:number}; }

export default function ArticlePage({ params }:{ params: Promise<{ id:string }> }) {
  const { id } = use(params);

  const [article,    setArticle]    = useState<Article|null>(null);
  const [comments,   setComments]   = useState<Comment[]>([]);
  const [liked,      setLiked]      = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [name,       setName]       = useState('');
  const [text,       setText]       = useState('');
  const [posting,    setPosting]    = useState(false);
  const [posted,     setPosted]     = useState(false);
  const [lang,       setLang]       = useState<Lang>('en');
  const [mounted,    setMounted]    = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang;
    if (saved === 'ar' || saved === 'en') setLang(saved);
    if (localStorage.getItem(`liked_${id}`)) setLiked(true);
    setMounted(true);
  }, [id]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('lang', lang);
    document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, mounted]);

  useEffect(() => {
    getDoc(doc(db,'articles',id)).then(d => {
      if (d.exists()) {
        const data = { id:d.id, ...d.data() } as Article;
        setArticle(data);
        setLikesCount(data.likes||0);
      }
    });
    fetchComments();
  }, [id]);

  async function fetchComments() {
    try {
      const q = query(collection(db,'articles',id,'comments'), orderBy('createdAt','desc'));
      const snap = await getDocs(q);
      setComments(snap.docs.map(d=>({id:d.id,...d.data()} as Comment)));
    } catch {
      const snap = await getDocs(collection(db,'articles',id,'comments'));
      setComments(snap.docs.map(d=>({id:d.id,...d.data()} as Comment)));
    }
  }

  async function handleLike() {
    if (liked) return;
    setLiked(true); setLikesCount(p=>p+1);
    localStorage.setItem(`liked_${id}`,'1');
    await updateDoc(doc(db,'articles',id),{likes:increment(1)});
  }

  async function handleComment() {
    if (!name.trim()||!text.trim()) return;
    setPosting(true);
    await addDoc(collection(db,'articles',id,'comments'),{name:name.trim(),text:text.trim(),createdAt:serverTimestamp()});
    setName(''); setText(''); setPosted(true);
    setTimeout(()=>setPosted(false),3000);
    await fetchComments(); setPosting(false);
  }

  function formatDate(createdAt?:{seconds:number}) {
    if (!createdAt?.seconds) return '';
    return new Date(createdAt.seconds*1000).toLocaleDateString(lang==='ar'?'ar-AE':'en-GB',{day:'numeric',month:'long',year:'numeric'});
  }

  function handleShare(platform:string) {
    const url = window.location.href;
    const title = article?(lang==='ar'?article.title_ar||article.title:article.title):'';
    const urls:Record<string,string> = {
      twitter:`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin:`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp:`https://wa.me/?text=${encodeURIComponent(title+' '+url)}`,
    };
    if (urls[platform]) window.open(urls[platform],'_blank');
  }

  const inp: React.CSSProperties = {
    width:'100%', padding:'.85rem 1rem', background:'rgba(255,255,255,0.04)',
    border:`1px solid ${T.border}`, borderRadius:10, color:T.text,
    fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif", fontSize:'.95rem', outline:'none',
  };

  const L  = LANG[lang];
  const LN = NAV_LANG[lang];

  if (!mounted||!article) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  return (
    <>
      <style>{`
        /* back link */
        .article-back {
          display:inline-flex;
          align-items:center;
          gap:.5rem;
          color:${T.text2};
          text-decoration:none;
          font-size:.88rem;
          font-weight:600;
          padding:.35rem .75rem;
          border:1px solid transparent;
          border-radius:8px;
          transition:color .2s, border-color .2s, background .2s, transform .18s;
        }
        .article-back:hover {
          color:${T.gold} !important;
          border-color:rgba(201,160,72,0.3);
          background:rgba(201,160,72,0.06);
          transform:translateX(-3px);
        }

        /* like button */
        .like-btn {
          display:flex;
          align-items:center;
          gap:.5rem;
          padding:.65rem 1.25rem;
          border-radius:10px;
          font-size:.9rem;
          font-weight:700;
          transition:background .2s, border-color .2s, color .2s, transform .18s, box-shadow .2s;
        }
        .like-btn:not(:disabled):hover {
          background:rgba(208,112,128,0.3) !important;
          border-color:${T.rose} !important;
          color:${T.rose} !important;
          transform:scale(1.05);
          box-shadow:0 6px 20px rgba(208,112,128,0.3);
        }

        /* share buttons */
        .share-btn {
          padding:.55rem 1rem;
          background:rgba(255,255,255,0.04);
          border:1px solid ${T.border};
          border-radius:8px;
          color:${T.text2};
          font-size:.88rem;
          font-weight:700;
          transition:background .2s, border-color .2s, color .2s, transform .15s;
        }
        .share-btn:hover {
          background:rgba(201,160,72,0.12) !important;
          border-color:${T.gold} !important;
          color:${T.gold} !important;
          transform:translateY(-2px);
        }

        /* post comment button */
        .comment-btn {
          padding:.7rem 1.5rem;
          background:linear-gradient(135deg,${T.burgL},#4a0f1c);
          color:${T.white};
          border:1px solid transparent;
          border-radius:10px;
          font-weight:700;
          font-size:.9rem;
          transition:background .2s, color .2s, border-color .2s, transform .18s, box-shadow .2s;
        }
        .comment-btn:not(:disabled):hover {
          background:linear-gradient(135deg,${T.gold},#a07830) !important;
          color:#0e0608 !important;
          border-color:${T.gold};
          transform:translateY(-2px);
          box-shadow:0 8px 24px rgba(201,160,72,0.4);
        }
        .comment-btn:disabled { opacity:.6; }
      `}</style>

      <main style={{background:T.bg,color:T.text,minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir}}>

        <Navbar lang={lang} L={LN} onLangChange={setLang} />

        <div style={{maxWidth:780,margin:'0 auto',padding:'7rem 1.5rem 4rem',position:'relative',zIndex:1}}>

          {/* BACK */}
          <a href="/articles" className="article-back" style={{marginBottom:'1.75rem'}}>
            {L.back}
          </a>

          {/* HEADER */}
          <div style={{marginBottom:'2rem',marginTop:'1.75rem'}}>
            <div style={{display:'flex',gap:'.75rem',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap'}}>
              <span style={{fontSize:'.65rem',color:T.rose,letterSpacing:3,textTransform:'uppercase',fontFamily:'Playfair Display,serif'}}>{article.category}</span>
              <span style={{color:T.muted}}>·</span>
              <span style={{fontSize:'.75rem',color:T.muted}}>{article.readTime} {L.minRead}</span>
              {article.createdAt && <><span style={{color:T.muted}}>·</span><span style={{fontSize:'.75rem',color:T.muted}}>{formatDate(article.createdAt)}</span></>}
            </div>
            <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(1.6rem,5vw,2.8rem)',fontWeight:900,color:T.white,lineHeight:1.25,marginBottom:'1.25rem'}}>
              {lang==='ar'?article.title_ar||article.title:article.title}
            </h1>
            <div style={{width:80,height:2,background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
          </div>

          {/* CONTENT */}
          <div style={{fontSize:'clamp(.9rem,2.5vw,1.05rem)',color:T.text2,lineHeight:2.2,marginBottom:'2.5rem',whiteSpace:'pre-wrap'}}>
            {lang==='ar'?article.content_ar||article.content:article.content}
          </div>

          {/* LIKES + SHARE */}
          <div style={{display:'flex',gap:'.75rem',alignItems:'center',flexWrap:'wrap',padding:'1.25rem',background:T.card,border:`1px solid ${T.border}`,borderRadius:14,marginBottom:'2.5rem'}}>
            <button onClick={handleLike} disabled={liked} className="like-btn"
              style={{background:liked?'rgba(208,112,128,0.2)':'rgba(138,31,50,0.2)',border:`1px solid ${liked?T.rose:T.border}`,color:liked?T.rose:T.text2}}>
              {liked?L.liked:L.like}
              <span style={{color:T.rose,fontWeight:700}}>{likesCount}</span>
            </button>
            <div style={{width:1,height:28,background:T.border}}/>
            <span style={{fontSize:'.82rem',color:T.muted,fontWeight:600}}>{L.shareOn}:</span>
            {[['twitter','𝕏'],['linkedin','in'],['whatsapp','📱']].map(([p,icon])=>(
              <button key={p} onClick={()=>handleShare(p)} className="share-btn">{icon}</button>
            ))}
          </div>

          {/* COMMENTS */}
          <div>
            <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.4rem',fontWeight:700,color:T.white,marginBottom:'1.5rem'}}>
              {L.comments} <span style={{color:T.gold,fontSize:'1rem'}}>({comments.length})</span>
            </h2>

            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:'1.25rem',marginBottom:'1.5rem'}}>
              <div style={{display:'flex',flexDirection:'column',gap:'.85rem'}}>
                <input placeholder={L.yourName} value={name} onChange={e=>setName(e.target.value)} style={inp}
                  onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
                <textarea placeholder={L.writeComment} value={text} onChange={e=>setText(e.target.value)}
                  rows={4} style={{...inp,resize:'vertical'}}
                  onFocus={e=>(e.target.style.borderColor=T.gold)} onBlur={e=>(e.target.style.borderColor=T.border)}/>
                <div style={{display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
                  <button onClick={handleComment} disabled={posting||!name.trim()||!text.trim()} className="comment-btn">
                    {posting?L.posting:L.postComment + ' ♥'}
                  </button>
                  {posted && <span style={{color:T.green,fontWeight:600,fontSize:'.88rem'}}>✓ {L.commentPosted}</span>}
                </div>
              </div>
            </div>

            {comments.length===0 && <p style={{color:T.muted,textAlign:'center',padding:'2rem'}}>{L.noComments}</p>}
            <div style={{display:'flex',flexDirection:'column',gap:'.85rem'}}>
              {comments.map(c=>(
                <div key={c.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:'1rem 1.25rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.6rem',flexWrap:'wrap',gap:'.5rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
                      <div style={{width:32,height:32,borderRadius:'50%',background:'rgba(138,31,50,0.35)',border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <span style={{color:T.goldL,fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:'.8rem'}}>{c.name?.charAt(0)?.toUpperCase()||'?'}</span>
                      </div>
                      <span style={{fontWeight:700,color:T.white,fontSize:'.9rem'}}>{c.name}</span>
                    </div>
                    {c.createdAt && <span style={{fontSize:'.72rem',color:T.muted}}>{formatDate(c.createdAt)}</span>}
                  </div>
                  <p style={{color:T.text2,lineHeight:1.9,fontSize:'.88rem',whiteSpace:'pre-wrap'}}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}