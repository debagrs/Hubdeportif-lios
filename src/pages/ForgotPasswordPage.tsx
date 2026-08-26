import React, { FormEvent, useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import HubHeader from '../components/HubHeader';
import { hubApi } from '../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = await hubApi.forgotPassword(email);
      setMessage(result.message || 'Se esse e-mail estiver cadastrado, enviaremos as instruções de recuperação.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível enviar a solicitação.'); }
    finally { setBusy(false); }
  }

  return <div className="lab-page"><HubHeader compact/><main className="lab-main"><section className="lab-section"><form className="lab-form-shell" onSubmit={submit}>
    <div style={{ width:64,height:64,borderRadius:22,display:'grid',placeItems:'center',background:'rgba(210,169,121,.10)',border:'1px solid rgba(210,169,121,.24)',color:'#D2A979' }}><Mail size={28}/></div>
    <p className="lab-kicker" style={{ marginTop:28,color:'#D2A979' }}>RECUPERAÇÃO DE ACESSO</p><h1>Esqueci minha senha</h1>
    <p style={{ color:'#9ca3af',marginBottom:28 }}>Informe o e-mail cadastrado. O Hub enviará um link temporário para criar uma nova senha.</p>
    {message && <div className="lab-message success">{message}</div>}{error && <div className="lab-message error">{error}</div>}
    <div className="lab-form-grid"><div className="lab-field"><label htmlFor="email">E-mail</label><input id="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div><button className="lab-primary" disabled={busy}>{busy?'Enviando…':'Enviar link de recuperação'}</button></div>
    <div style={{ marginTop:22 }}><Link className="lab-secondary" to="/entrar"><ArrowLeft size={16}/> Voltar ao login</Link></div>
  </form></section></main></div>;
}
