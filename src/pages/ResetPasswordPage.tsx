import React, { FormEvent, useMemo, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import HubHeader from '../components/HubHeader';
import { hubApi } from '../lib/api';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState(''); const [message,setMessage]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent){ e.preventDefault(); setError(''); if(password.length<8){setError('Use pelo menos 8 caracteres.');return;} if(password!==confirm){setError('As duas senhas precisam ser iguais.');return;} setBusy(true); try{await hubApi.resetPassword(token,password);setMessage('Senha atualizada. Você já pode entrar no Hub.');}catch(err){setError(err instanceof Error?err.message:'Não foi possível redefinir a senha.');}finally{setBusy(false);} }
  return <div className="lab-page"><HubHeader compact/><main className="lab-main"><section className="lab-section"><form className="lab-form-shell" onSubmit={submit}>
    <div style={{width:64,height:64,borderRadius:22,display:'grid',placeItems:'center',background:'rgba(134,239,172,.08)',border:'1px solid rgba(134,239,172,.22)',color:'#86EFAC'}}><KeyRound size={28}/></div>
    <p className="lab-kicker" style={{marginTop:28,color:'#86EFAC'}}>NOVA SENHA</p><h1>Redefinir acesso</h1><p style={{color:'#9ca3af',marginBottom:28}}>Crie uma nova senha para sua conta.</p>
    {!token&&<div className="lab-message error">O link de recuperação está incompleto.</div>}{message&&<div className="lab-message success">{message}</div>}{error&&<div className="lab-message error">{error}</div>}
    {!message&&<div className="lab-form-grid"><div className="lab-field"><label>Nova senha</label><input type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)}/></div><div className="lab-field"><label>Repetir senha</label><input type="password" required minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)}/></div><button className="lab-primary" disabled={busy||!token}>{busy?'Salvando…':'Criar nova senha'}</button></div>}
    {message&&<Link className="lab-primary" style={{marginTop:18,textDecoration:'none'}} to="/entrar">Ir para o login</Link>}
  </form></section></main></div>;
}
