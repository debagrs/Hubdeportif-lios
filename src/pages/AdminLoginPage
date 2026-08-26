import React, { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, LogIn, ShieldCheck, UserRoundCog } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HubHeader from '../components/HubHeader';
import { hubApi } from '../lib/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [notice,setNotice] = useState('');
  const [busy,setBusy] = useState(false);
  const [configured,setConfigured] = useState(true);

  useEffect(()=>{
    hubApi.health().then(r=>setConfigured(r.configured && Boolean(r.adminReady ?? true))).catch(()=>setConfigured(false));
    hubApi.session().then(r=>{
      if(r.authenticated && r.user?.role==='admin') navigate('/painel',{replace:true});
      else if(r.authenticated && r.user?.role==='student') setNotice(`Há uma sessão de estudante ativa (${r.user.email}). Ao entrar como administradora, ela será substituída neste navegador.`);
    }).catch(()=>undefined);
  },[navigate]);

  async function submit(event:FormEvent){
    event.preventDefault(); setError(''); setBusy(true);
    try{
      const result=await hubApi.login(email,password,'admin');
      if(result.user.role!=='admin') throw new Error('Esta conta não possui permissão administrativa.');
      navigate('/painel',{replace:true});
    }catch(err){setError(err instanceof Error?err.message:'Não foi possível entrar como administradora.');}
    finally{setBusy(false);}
  }

  return <div className="lab-page"><HubHeader compact/><main className="lab-main"><section className="lab-section">
    <form className="lab-form-shell" onSubmit={submit}>
      <div style={{width:64,height:64,borderRadius:22,display:'grid',placeItems:'center',background:'rgba(210,169,121,.09)',border:'1px solid rgba(210,169,121,.28)',color:'#D2A979'}}><UserRoundCog size={30}/></div>
      <p className="lab-kicker" style={{marginTop:28,color:'#D2A979'}}>PROFESSORA • ADMINISTRAÇÃO</p>
      <h1>Administrar o Hub</h1>
      <p style={{color:'#9ca3af',marginBottom:28}}>Entre com a conta administrativa. Aqui você convida estudantes, cria os novos acessos, acompanha os cinco portfólios e pode editar qualquer um deles.</p>
      {!configured&&<div className="lab-message error">A conta administrativa ainda não está configurada no servidor.</div>}
      {notice&&<div className="lab-message" style={{marginBottom:16}}>{notice}</div>}
      {error&&<div className="lab-message error">{error}</div>}
      <div className="lab-form-grid">
        <div className="lab-field"><label htmlFor="admin-email">E-mail da administradora</label><input id="admin-email" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></div>
        <div className="lab-field"><label htmlFor="admin-password">Senha</label><input id="admin-password" type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></div>
        <button className="lab-primary" disabled={busy||!configured} type="submit"><LogIn size={18}/>{busy?'Entrando…':'Entrar como administradora'}</button>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:14,marginTop:22}}>
        <Link className="lab-text-link" to="/esqueci-senha">Esqueci minha senha</Link>
        <Link className="lab-secondary" to="/"><ArrowLeft size={16}/> Voltar ao Hub</Link>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10,marginTop:30,paddingTop:22,borderTop:'1px solid rgba(255,255,255,.08)',color:'#7f8794',fontSize:'.82rem'}}><ShieldCheck size={18} color="#86EFAC"/> Esta tela aceita somente a conta com papel de administradora.</div>
    </form>
  </section></main></div>;
}
