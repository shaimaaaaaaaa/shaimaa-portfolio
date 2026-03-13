'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

const T = {
  bg:'#0e0608', card:'#1a0c10', burg:'#8a1f32', burgL:'#a02840',
  gold:'#c9a048', goldL:'#e2bb60', white:'#ffffff',
  text:'#ede4de', text2:'#d4c4bc', muted:'#8a7268',
  border:'rgba(200,158,72,0.2)', rose:'#d07080',
};

export default function AdminLogin() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin/dashboard');
    } catch {
      setError('Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',fontFamily:"'IBM Plex Sans Arabic','DM Sans',sans-serif"}}>
      {/* bg orb */}
      <div style={{position:'fixed',width:600,height:600,borderRadius:'50%',background:'radial-gradient(circle,rgba(138,31,50,0.35) 0%,transparent 65%)',top:-200,right:-150,pointerEvents:'none',zIndex:0}}/>

      <div style={{width:'100%',maxWidth:440,position:'relative',zIndex:1}}>
        {/* logo */}
        <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.5rem',color:T.goldL,fontWeight:700,letterSpacing:1,marginBottom:'.5rem'}}>♥ Shaimaa Kalel</div>
          <div style={{fontSize:'.72rem',letterSpacing:4,textTransform:'uppercase',color:T.muted}}>Admin Panel</div>
        </div>

        {/* card */}
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:'2.5rem',boxShadow:'0 32px 80px rgba(0,0,0,0.7)'}}>
          <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'1.6rem',fontWeight:900,color:T.white,marginBottom:'.4rem'}}>
            Welcome Back
          </h1>
          <p style={{fontSize:'.88rem',color:T.muted,marginBottom:'2rem'}}>Sign in to manage your portfolio</p>

          <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div>
              <label style={{display:'block',fontSize:'.78rem',color:T.text2,marginBottom:'.4rem',fontWeight:600,letterSpacing:.5}}>EMAIL</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" required
                style={{width:'100%',padding:'.85rem 1rem',background:'rgba(255,255,255,0.04)',border:`1px solid ${T.border}`,borderRadius:10,color:T.text,fontFamily:'inherit',fontSize:'.95rem',outline:'none',transition:'border-color .2s'}}
                onFocus={e=>(e.target.style.borderColor=T.gold)}
                onBlur={e=>(e.target.style.borderColor=T.border)}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:'.78rem',color:T.text2,marginBottom:'.4rem',fontWeight:600,letterSpacing:.5}}>PASSWORD</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required
                style={{width:'100%',padding:'.85rem 1rem',background:'rgba(255,255,255,0.04)',border:`1px solid ${T.border}`,borderRadius:10,color:T.text,fontFamily:'inherit',fontSize:'.95rem',outline:'none',transition:'border-color .2s'}}
                onFocus={e=>(e.target.style.borderColor=T.gold)}
                onBlur={e=>(e.target.style.borderColor=T.border)}/>
            </div>

            {error && (
              <div style={{padding:'.75rem 1rem',background:'rgba(208,112,128,0.1)',border:'1px solid rgba(208,112,128,0.3)',borderRadius:8,fontSize:'.85rem',color:T.rose}}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{marginTop:'.5rem',padding:'1rem',background:`linear-gradient(135deg,${T.burgL},#4a0f1c)`,color:T.white,border:'none',borderRadius:10,fontSize:'1rem',fontWeight:700,cursor:loading?'not-allowed':'pointer',transition:'all .25s',boxShadow:`0 6px 24px rgba(138,31,50,0.45)`,opacity:loading?.6:1}}>
              {loading ? 'Signing in...' : 'Sign In ♥'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}