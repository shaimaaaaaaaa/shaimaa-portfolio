'use client';
import { useEffect, useState, use } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, addDoc, getDocs, orderBy, query, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

const T = {
  bg:'#0e0608', bg2:'#140a0c', card:'#1a0c10',
  burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', rose:'#d07080',
  white:'#ffffff', text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)', green:'#4ade80',
};

const LANG = {
  en: {
    dir:'ltr', langBtn:'العربية', back:'← Back to Articles',
    minRead:'min read', likes:'Likes', comments:'Comments',
    like:'Like ❤️', liked:'Liked ❤️',
    share:'Share', shareOn:'Share on',
    writeComment:'Write a comment...', yourName:'Your name',
    postComment:'Post Comment', posting:'Posting...',
    noComments:'Be the first to comment!',
    commentPosted:'Comment posted!',
    navLinks:[['/','Home'],['/about','About'],['/articles','Articles']] as [string,string][],
  },
  ar: {
    dir:'rtl', langBtn:'English', back:'المقالات ←',
    minRead:'دقيقة قراءة', likes:'إعجاب', comments:'تعليقات',
    like:'أعجبني ❤️', liked:'معجب ❤️',
    share:'مشاركة', shareOn:'شارك على',
    writeComment:'اكتب تعليقاً...', yourName:'اسمك',
    postComment:'نشر التعليق', posting:'جاري النشر...',
    noComments:'كن أول من يعلق!',
    commentPosted:'تم نشر تعليقك!',
    navLinks:[['/','الرئيسية'],['/about','عني'],['/articles','المقالات']] as [string,string][],
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
  const [lang,       setLang]       = useState<'en'|'ar'>('en');
  const [mounted,    setMounted]    = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lang') as 'en'|'ar';
    if (saved === 'ar' || saved === 'en') setLang(saved);
    const likedKey = `liked_${id}`;
    if (localStorage.getItem(likedKey)) setLiked(true);
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
    const likedKey = `liked_${id}`;
    setLiked(true);
    setLikesCount(prev => prev+1);
    localStorage.setItem(likedKey, '1');
    await updateDoc(doc(db,'articles',id), { likes: increment(1) });
  }

  async function handleComment() {
    if (!name.trim() || !text.trim()) return;
    setPosting(true);
    await addDoc(collection(db,'articles',id,'comments'), {
      name: name.trim(), text: text.trim(), createdAt: serverTimestamp(),
    });
    setName(''); setText('');
    setPosted(true);
    setTimeout(() => setPosted(false), 3000);
    await fetchComments();
    setPosting(false);
  }

  function formatDate(createdAt?:{seconds:number}) {
    if (!createdAt?.seconds) return '';
    return new Date(createdAt.seconds*1000).toLocaleDateString(lang==='ar'?'ar-AE':'en-GB',{day:'numeric',month:'long',year:'numeric'});
  }

  function handleShare(platform:string) {
    const url = window.location.href;
    const title = article ? (lang==='ar'?article.title_ar||article.title:article.title) : '';
    const urls:Record<string,string> = {
      twitter:  `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title+' '+url)}`,
    };
    if (urls[platform]) window.open(urls[platform],'_blank');
  }

  const inp: React.CSSProperties = {
    width:'100%', padding:'.85rem 1rem', background:'rgba(255,255,255,0.04)',
    border:`1px solid ${T.border}`, borderRadius:10, color:T.text,
    fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif", fontSize:'.95rem', outline:'none', transition:'border-color .2s',
  };

  const L = LANG[lang];

  if (!mounted || !article) return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <p style={{color:T.gold,fontFamily:'Playfair Display,serif'}}>Loading...</p>
    </main>
  );

  const displayTitle   = lang==='ar' ? article.title_ar||article.title     : article.title;
  const displayContent = lang==='ar' ? article.content_ar||article.content : article.content;

  return (
    <main style={{background:T.bg,color:T.text,minHeight:'100vh',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",direction:L.dir as 'ltr'|'rtl'}}>
      <div style={{position:'fixed',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.3) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none',zIndex:0}}/>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:1000,padding:'1.1rem 3rem',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(14,6,8,0.97)',backdropFilter:'blur(32px)',borderBottom:`1px solid ${T.border}`}}>
        <Link href="/" style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',color:T.goldL,fontWeight:700,textDecoration:'none',letterSpacing:1}}>✦ Shaimaa Kalel</Link>
        <div style={{display:'flex',gap:'2rem',alignItems:'center'}}>
          {L.navLinks.map(([h,l])=>(
            <a key={h} href={h} style={{color:T.text2,textDecoration:'none',fontSize:'1rem',fontWeight:600}}
              onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)}
              onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>{l}</a>
          ))}
          <button onClick={()=>setLang(lang==='en'?'ar':'en')}
            style={{padding:'.45rem 1.2rem',background:'rgba(200,158,72,0.1)',border:`1px solid ${T.border}`,borderRadius:20,color:T.gold,fontSize:'.85rem',fontWeight:700,cursor:'pointer'}}>
            {L.langBtn}
          </button>
        </div>
      </nav>

      <div style={{maxWidth:780,margin:'0 auto',padding:'8rem 2rem 5rem',position:'relative',zIndex:1}}>

        {/* BACK */}
        <Link href="/articles" style={{display:'inline-flex',alignItems:'center',gap:'.5rem',color:T.text2,textDecoration:'none',fontSize:'.9rem',fontWeight:600,marginBottom:'2rem',transition:'color .2s'}}
          onMouseEnter={e=>(e.currentTarget.style.color=T.goldL)}
          onMouseLeave={e=>(e.currentTarget.style.color=T.text2)}>
          {L.back}
        </Link>

        {/* ARTICLE HEADER */}
        <div style={{marginBottom:'2.5rem'}}>
          <div style={{display:'flex',gap:'1rem',alignItems:'center',marginBottom:'1.25rem',flexWrap:'wrap'}}>
            <span style={{fontSize:'.68rem',color:T.rose,letterSpacing:3,textTransform:'uppercase',fontFamily:'Playfair Display,serif'}}>{article.category}</span>
            <span style={{color:T.muted,fontSize:'.78rem'}}>·</span>
            <span style={{fontSize:'.78rem',color:T.muted}}>{article.readTime} {L.minRead}</span>
            {article.createdAt && <><span style={{color:T.muted,fontSize:'.78rem'}}>·</span><span style={{fontSize:'.78rem',color:T.muted}}>{formatDate(article.createdAt)}</span></>}
          </div>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(2rem,4.5vw,3rem)',fontWeight:900,color:T.white,lineHeight:1.25,marginBottom:'1.5rem'}}>
            {displayTitle}
          </h1>
          <div style={{width:80,height:2,background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
        </div>

        {/* ARTICLE CONTENT */}
        <div style={{fontSize:'1.05rem',color:T.text2,lineHeight:2.2,marginBottom:'3rem',whiteSpace:'pre-wrap'}}>
          {displayContent}
        </div>

        {/* LIKES + SHARE */}
        <div style={{display:'flex',gap:'1rem',alignItems:'center',flexWrap:'wrap',padding:'1.5rem',background:T.card,border:`1px solid ${T.border}`,borderRadius:16,marginBottom:'3rem'}}>
          <button onClick={handleLike} disabled={liked}
            style={{display:'flex',alignItems:'center',gap:'.6rem',padding:'.7rem 1.5rem',background:liked?'rgba(208,112,128,0.2)':'rgba(138,31,50,0.2)',border:`1px solid ${liked?T.rose:T.border}`,borderRadius:10,color:liked?T.rose:T.text2,fontSize:'.95rem',fontWeight:700,cursor:liked?'default':'pointer',transition:'all .2s'}}>
            {liked ? L.liked : L.like}
            <span style={{fontFamily:'Playfair Display,serif',color:T.rose,fontWeight:700}}>{likesCount}</span>
          </button>

          <div style={{width:1,height:30,background:T.border,margin:'0 .5rem'}}/>

          <span style={{fontSize:'.85rem',color:T.muted,fontWeight:600}}>{L.shareOn}:</span>
          {[['twitter','𝕏'],['linkedin','in'],['whatsapp','📱']].map(([p,icon])=>(
            <button key={p} onClick={()=>handleShare(p)}
              style={{padding:'.6rem 1.1rem',background:'rgba(255,255,255,0.04)',border:`1px solid ${T.border}`,borderRadius:8,color:T.text2,fontSize:'.88rem',fontWeight:700,cursor:'pointer',transition:'all .2s'}}
              onMouseEnter={e=>{const el=e.currentTarget as HTMLButtonElement;el.style.borderColor=T.gold;el.style.color=T.goldL;}}
              onMouseLeave={e=>{const el=e.currentTarget as HTMLButtonElement;el.style.borderColor=T.border;el.style.color=T.text2;}}>
              {icon}
            </button>
          ))}
        </div>

        {/* COMMENTS */}
        <div>
          <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.6rem',fontWeight:700,color:T.white,marginBottom:'2rem'}}>
            {L.comments} <span style={{color:T.gold,fontSize:'1.1rem'}}>({comments.length})</span>
          </h2>

          {/* COMMENT FORM */}
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.75rem',marginBottom:'2rem'}}>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <input placeholder={L.yourName} value={name} onChange={e=>setName(e.target.value)}
                style={inp}
                onFocus={e=>(e.target.style.borderColor=T.gold)}
                onBlur={e=>(e.target.style.borderColor=T.border)}/>
              <textarea placeholder={L.writeComment} value={text} onChange={e=>setText(e.target.value)}
                rows={4} style={{...inp,resize:'vertical'}}
                onFocus={e=>(e.target.style.borderColor=T.gold)}
                onBlur={e=>(e.target.style.borderColor=T.border)}/>
              <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                <button onClick={handleComment} disabled={posting||!name.trim()||!text.trim()}
                  style={{padding:'.75rem 1.75rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontWeight:700,fontSize:'.95rem',cursor:(posting||!name.trim()||!text.trim())?'not-allowed':'pointer',opacity:(posting||!name.trim()||!text.trim())?.6:1,boxShadow:`0 4px 16px rgba(138,31,50,0.4)`}}>
                  {posting ? L.posting : L.postComment}
                </button>
                {posted && <span style={{color:T.green,fontWeight:600,fontSize:'.9rem'}}>✓ {L.commentPosted}</span>}
              </div>
            </div>
          </div>

          {/* COMMENTS LIST */}
          {comments.length === 0 && (
            <p style={{color:T.muted,textAlign:'center',padding:'2rem',fontSize:'1rem'}}>{L.noComments}</p>
          )}
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {comments.map(c=>(
              <div key={c.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:'1.25rem 1.5rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:'rgba(138,31,50,0.35)',border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <span style={{color:T.goldL,fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:'.85rem'}}>{c.name?.charAt(0)?.toUpperCase()||'?'}</span>
                    </div>
                    <span style={{fontWeight:700,color:T.white,fontSize:'.95rem'}}>{c.name}</span>
                  </div>
                  {c.createdAt && <span style={{fontSize:'.75rem',color:T.muted}}>{formatDate(c.createdAt)}</span>}
                </div>
                <p style={{color:T.text2,lineHeight:1.9,fontSize:'.92rem',whiteSpace:'pre-wrap'}}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}