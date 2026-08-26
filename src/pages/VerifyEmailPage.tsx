import React, { useEffect, useMemo, useState } from 'react';
import { MailCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import HubHeader from '../components/HubHeader';
import { hubApi } from '../lib/api';

export default function VerifyEmailPage(){
 const [params]=useSearchParams(); const token=useMemo(()=>params.get('token')||'',[params]); const [state,setState]=useState<'loading'|'ok'|'error'>(token?'loading':'error'); const [msg,setMsg]=useState(token?'Validando seu e-mail…':'O link está incompleto.');
 useEffect(()=>{if(!token)return; hubApi.verifyEmail(token).then(()=>{setState('ok');setMsg('E-mail confirmado. Sua conta está pronta para uso.');}).catch(e=>{setState('error');setMsg(e instanceof Error?e.message:'Não foi possível validar este link.');});},[token]);
 return <div className="lab-page"><HubHeader compact/><main className="lab-main"><section className="lab-section"><div className="lab-form-shell"><MailCheck size={42} color={state==='ok'?'#86EFAC':'#D2A979'}/><p className="lab-kicker" style={{marginTop:24}}>VALIDAÇÃO DE E-MAIL</p><h1>{state==='ok'?'Tudo certo':'Confirmando'}</h1><div className={`lab-message ${state==='ok'?'success':state==='error'?'error':''}`}>{msg}</div>{state!=='loading'&&<Link to="/entrar" className="lab-primary" style={{marginTop:20,textDecoration:'none'}}>Ir para o login</Link>}</div></section></main></div>;
}
