'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const T = {
  bg:'#0e0608', card:'#1a0c10', burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', white:'#ffffff',
  text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)', rose:'#d07080', green:'#4ade80',
};

const EMAILJS_SERVICE  = 'service_dxg2i9q';
const EMAILJS_TEMPLATE = 'template_lhzrtyl';
const EMAILJS_KEY      = 'C7oJFDGR4fyaxWiPP';

const LANG = {
  en: {
    langBtn:'العربية', dir:'ltr',
    eyebrow:'admin panel', title:'Contact', span:'Messages',
    dashboard:'Dashboard', noMessages:'No messages yet.',
    message:'Message', replyTo:'Reply to', sendReply:'Send Reply ✉',
    sending:'Sending...', sent:'✓ Reply sent!', delete:'Delete',
    writePlaceholder:(name:string)=>`Write your reply to ${name}...`,
    msgCount:(n:number)=>`${n} message${n!==1?'s':''}`,
  },
  ar: {
    langBtn:'English', dir:'rtl',
    eyebrow:'لوحة التحكم', title:'رسائل', span:'التواصل',
    dashboard:'لوحة التحكم', noMessages:'لا توجد رسائل بعد.',
    message:'الرسالة', replyTo:'رد على', sendReply:'إرسال الرد ✉',
    sending:'جاري الإرسال...', sent:'✓ تم الإرسال!', delete:'حذف',
    writePlaceholder:(name:string)=>`اكتب ردك على ${name}...`,
    msgCount:(n:number)=>`${n} رسالة`,
  },
};

interface Message { id:string; name:string; email:string; message:string; createdAt?:{seconds:number}; }

const inp = (b=T.border): React.CSSProperties => ({
  width:'100%', padding:'.85rem 1rem', background:'rgba(255,255,255,0.04)',
  border:`1px solid ${b}`, borderRadius:10, color:T.text,
  fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif", fontSize:'.95rem', outline:'none', transition:'border-color .2s',
});

export default function AdminMessages() {
  const [loading,   setLoading]   = useState(true);
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [expanded,  setExpanded]  = useState<string|null>(null);
  const [replyText, setReplyText] = useState<Record<string,string>>({});
  const [sending,   setSending]   = useState<string|null>(null);
  const [sent,      setSent]      = useState<string|null>(null);
  const [lang,      setLang]      = useState<'en'|'ar'>('en');
  const [mounted,   setMounted]   = useState(false);
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
      else { setLoading(false); fetchMessages(); }
    });
    return () => unsub();
  }, [router]);

  async function fetchMessages() {
    try {
      const q = query(collection(db,'messages'), orderBy('createdAt','desc'));
      const snap = await getDocs(q);
      setMessages(snap.docs.map(d=>({id:d.id,...d.data()} as Message)));
    } catch {
      const snap = await getDocs(collection(db,'messages'));
      setMessages(snap.docs.map(d=>({id:d.id,...d.data()} as Message)));
    }
  }

  async function handleDelete(id:string) {
    if (!confirm(lang==='ar'?'هل تريد حذف هذه الرسالة؟':'Delete this message?')) return;
    await deleteDoc(doc(db,'messages',id));
    await fetchMessages();
  }

  async function handleReply(m:Message) {
    const reply = replyText[m.id]?.trim();
    if (!reply) return;
    setSending(m.id);
    try {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          service_id:  EMAILJS_SERVICE,
          template_id: EMAILJS_TEMPLATE,
          user_id:     EMAILJS_KEY,
          template_params: { to_name:m.name, to_email:m.email, reply_message:reply, original_msg:m.message },
        }),
      });
      if (res.ok) {
        setSent(m.id);
        setReplyText(prev=>({...prev,[m.id]:''}));
        setTimeout(()=>setSent(null), 4000);
      } else {
        alert('Failed to send. Check EmailJS template variables.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setSending(null);
    }
  }

  function formatDate(msg:Message) {
    if (!msg.createdAt?.seconds) return '';
    return new Date(msg.createdAt.seconds*1000).toLocaleDateString('en-GB',{
      day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
    });
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
        <div style={{marginBottom:'3rem',display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
          <div>
            <span style={{fontSize:'.72rem',letterSpacing:5,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',display:'block',marginBottom:'.65rem'}}>{L.eyebrow}</span>
            <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'2.4rem',fontWeight:900,color:T.white}}>
              {L.title} <span style={{color:T.gold,fontStyle:'italic'}}>{L.span}</span>
            </h1>
            <div style={{width:60,height:2,marginTop:'1rem',background:`linear-gradient(${lang==='ar'?'270deg':'90deg'},${T.gold},transparent)`}}/>
          </div>
          <div style={{padding:'.6rem 1.4rem',background:'rgba(201,160,72,0.1)',border:`1px solid ${T.border}`,borderRadius:20,fontSize:'.88rem',color:T.gold,fontWeight:700}}>
            {L.msgCount(messages.length)}
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          {messages.length===0 && (
            <div style={{textAlign:'center',padding:'4rem',background:T.card,border:`1px solid ${T.border}`,borderRadius:16}}>
              <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>📭</div>
              <p style={{color:T.muted,fontSize:'1rem'}}>{L.noMessages}</p>
            </div>
          )}

          {messages.map(m=>(
            <div key={m.id} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden',transition:'border-color .2s'}}
              onMouseEnter={e=>(e.currentTarget.style.borderColor='rgba(201,160,72,0.4)')}
              onMouseLeave={e=>(e.currentTarget.style.borderColor=T.border)}>

              {/* HEADER */}
              <div style={{padding:'1.25rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem',cursor:'pointer'}}
                onClick={()=>setExpanded(expanded===m.id?null:m.id)}>
                <div style={{display:'flex',alignItems:'center',gap:'1rem',flex:1,minWidth:0}}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:'rgba(138,31,50,0.35)',border:`1px solid ${T.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <span style={{color:T.goldL,fontFamily:'Playfair Display,serif',fontWeight:700,fontSize:'.9rem'}}>
                      {m.name?.charAt(0)?.toUpperCase()||'?'}
                    </span>
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontWeight:700,color:T.white,fontSize:'.95rem',marginBottom:'.15rem'}}>{m.name}</div>
                    <div style={{fontSize:'.82rem',color:T.gold}}>{m.email}</div>
                  </div>
                  <div style={{flex:1,fontSize:'.88rem',color:T.muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:280}}>
                    {m.message}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'1rem',flexShrink:0}}>
                  {m.createdAt && <span style={{fontSize:'.78rem',color:T.muted}}>{formatDate(m)}</span>}
                  <span style={{color:T.text2,fontSize:'.9rem',display:'inline-block',transition:'transform .2s',transform:expanded===m.id?'rotate(180deg)':'rotate(0deg)'}}>▾</span>
                </div>
              </div>

              {/* EXPANDED */}
              {expanded===m.id && (
                <div style={{padding:'1.5rem',borderTop:`1px solid ${T.border}`,background:'rgba(255,255,255,0.02)'}}>
                  <div style={{background:'rgba(138,31,50,0.1)',border:`1px solid rgba(138,31,50,0.25)`,borderRadius:12,padding:'1.1rem 1.3rem',marginBottom:'1.5rem'}}>
                    <div style={{fontSize:'.72rem',letterSpacing:3,textTransform:'uppercase',color:T.rose,fontFamily:'Playfair Display,serif',marginBottom:'.6rem'}}>{L.message}</div>
                    <p style={{color:T.text2,lineHeight:1.9,fontSize:'.95rem',whiteSpace:'pre-wrap'}}>{m.message}</p>
                  </div>
                  <div>
                    <div style={{fontSize:'.72rem',letterSpacing:3,textTransform:'uppercase',color:T.gold,fontFamily:'Playfair Display,serif',marginBottom:'.75rem'}}>
                      {L.replyTo} {m.name}
                    </div>
                    <textarea
                      placeholder={L.writePlaceholder(m.name)}
                      value={replyText[m.id]||''}
                      onChange={e=>setReplyText(prev=>({...prev,[m.id]:e.target.value}))}
                      rows={4}
                      style={{...inp(),resize:'vertical',marginBottom:'1rem'}}
                      onFocus={e=>(e.target.style.borderColor=T.gold)}
                      onBlur={e=>(e.target.style.borderColor=T.border)}
                    />
                    <div style={{display:'flex',gap:'1rem',alignItems:'center',flexWrap:'wrap'}}>
                      <button onClick={()=>handleReply(m)} disabled={sending===m.id||!replyText[m.id]?.trim()}
                        style={{padding:'.65rem 1.75rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:8,fontWeight:700,fontSize:'.9rem',cursor:(sending===m.id||!replyText[m.id]?.trim())?'not-allowed':'pointer',opacity:(sending===m.id||!replyText[m.id]?.trim())?.6:1,boxShadow:`0 4px 16px rgba(138,31,50,0.4)`}}>
                        {sending===m.id ? L.sending : L.sendReply}
                      </button>
                      <button onClick={()=>handleDelete(m.id)}
                        style={{padding:'.65rem 1rem',background:'rgba(138,31,50,0.2)',border:`1px solid rgba(138,31,50,0.4)`,borderRadius:8,color:T.rose,fontSize:'.85rem',fontWeight:600,cursor:'pointer'}}>
                        {L.delete}
                      </button>
                      {sent===m.id && <span style={{color:T.green,fontWeight:700,fontSize:'.9rem'}}>{L.sent}</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}