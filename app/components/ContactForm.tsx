'use client';
import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const T = {
  bg2:'#140a0c', card:'#1a0c10', burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', white:'#ffffff',
  text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)', rose:'#d07080', green:'#4ade80',
};

export default function ContactForm({ lang='en' }: { lang?:'en'|'ar' }) {
  const [form,    setForm]    = useState({ name:'', email:'', message:'' });
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const TXT = {
    en: { name:'Full Name', email:'Email Address', msg:'Your Message', btn:'Send Message', ok:'Message sent! I will get back to you soon.', err:'Something went wrong. Please try again.' },
    ar: { name:'الاسم الكامل', email:'البريد الإلكتروني', msg:'رسالتك', btn:'إرسال الرسالة', ok:'تم الإرسال! سأتواصل معك قريباً.', err:'حدث خطأ. حاول مرة أخرى.' },
  };
  const tx = TXT[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    setError('');
    try {
      await addDoc(collection(db,'messages'), { ...form, createdAt: serverTimestamp() });
      setSent(true);
      setForm({ name:'', email:'', message:'' });
    } catch {
      setError(tx.err);
    } finally {
      setSending(false);
    }
  }

  const inp: React.CSSProperties = {
    width:'100%', padding:'.85rem 1rem',
    background:'rgba(255,255,255,0.04)',
    border:`1px solid ${T.border}`,
    borderRadius:10, color:T.text,
    fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",
    fontSize:'.95rem', outline:'none', transition:'border-color .2s',
    boxSizing:'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize:'.78rem', color:T.text2, fontWeight:600, letterSpacing:.5,
  };

  if (sent) return (
    <div style={{padding:'2rem',background:'rgba(74,222,128,0.08)',border:`1px solid rgba(74,222,128,0.3)`,borderRadius:16,textAlign:'center'}}>
      <div style={{fontSize:'2rem',marginBottom:'1rem'}}>✓</div>
      <p style={{color:T.green,fontWeight:700,fontSize:'1rem'}}>{tx.ok}</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>

      {/* NAME — full width */}
      <div style={{display:'flex',flexDirection:'column',gap:'.4rem'}}>
        <label style={labelStyle}>{tx.name.toUpperCase()}</label>
        <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
          placeholder={tx.name} required style={inp}
          onFocus={e=>(e.target.style.borderColor=T.gold)}
          onBlur={e=>(e.target.style.borderColor=T.border)}/>
      </div>

      {/* EMAIL — full width */}
      <div style={{display:'flex',flexDirection:'column',gap:'.4rem'}}>
        <label style={labelStyle}>{tx.email.toUpperCase()}</label>
        <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
          placeholder={tx.email} required style={{...inp,direction:'ltr'}}
          onFocus={e=>(e.target.style.borderColor=T.gold)}
          onBlur={e=>(e.target.style.borderColor=T.border)}/>
      </div>

      {/* MESSAGE */}
      <div style={{display:'flex',flexDirection:'column',gap:'.4rem'}}>
        <label style={labelStyle}>{tx.msg.toUpperCase()}</label>
        <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})}
          placeholder={tx.msg} required rows={5}
          style={{...inp,resize:'vertical'}}
          onFocus={e=>(e.target.style.borderColor=T.gold)}
          onBlur={e=>(e.target.style.borderColor=T.border)}/>
      </div>

      {error && <p style={{color:T.rose,fontSize:'.88rem',margin:0}}>{error}</p>}

      {/* BUTTON — full width */}
      <button type="submit" disabled={sending}
        style={{
          width:'100%', padding:'1rem',
          background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,
          color:T.white, border:'none', borderRadius:10,
          fontWeight:700, fontSize:'1rem',
          cursor:sending?'not-allowed':'pointer',
          opacity:sending?.7:1,
          boxShadow:`0 6px 24px rgba(138,31,50,0.4)`,
          transition:'all .25s',
          fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif",
        }}>
        {sending ? '...' : tx.btn + ' ✦'}
      </button>
    </form>
  );
}