import React, { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, LogIn, MailCheck, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HubHeader from '../components/HubHeader';
import { hubApi } from '../lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    hubApi.health().then(r => setConfigured(r.configured)).catch(() => setConfigured(false));
    hubApi.session().then(r => { if (r.authenticated && r.user?.role === 'student') navigate('/painel', { replace: true }); }).catch(() => undefined);
  }, [navigate]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(''); setBusy(true);
    try {
      await hubApi.login(email, password, 'student');
      navigate('/painel');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally { setBusy(false); }
  }

  return (
    <div className="lab-page">
      <HubHeader compact />
      <main className="lab-main">
        <section className="lab-section">
          <form className="lab-form-shell" onSubmit={submit}>
            <div style={{ width: 64, height: 64, borderRadius: 22, display:'grid', placeItems:'center', background:'rgba(0,255,255,.08)', border:'1px solid rgba(0,255,255,.2)', color:'#00FFFF' }}><ShieldCheck size={30}/></div>
            <p className="lab-kicker" style={{ marginTop: 28 }}>ACESSO AO HUB</p>
            <h1>Área de acesso</h1>
            <p style={{ color:'#9ca3af', marginBottom:28 }}>Acesso dos estudantes. A professora entra pela área administrativa separada.</p>
            {!configured && <div className="lab-message">O acesso está temporariamente indisponível. Tente novamente mais tarde.</div>}
            {error && <div className="lab-message error">{error}</div>}
            <div className="lab-form-grid">
              <div className="lab-field"><label htmlFor="email">E-mail</label><input id="email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div className="lab-field"><label htmlFor="password">Senha</label><input id="password" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></div>
              <button className="lab-primary" disabled={busy || !configured} type="submit"><LogIn size={18}/>{busy ? 'Entrando…' : 'Entrar'}</button>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', gap:14, marginTop:22 }}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
                <Link className="lab-text-link" to="/esqueci-senha">Esqueci minha senha</Link>
                <Link className="lab-text-link" to="/criar-conta">Criar minha conta</Link>
                <Link className="lab-text-link" to="/admin">Sou administradora</Link>
              </div>
              <Link className="lab-secondary" to="/"><ArrowLeft size={16}/> Voltar ao Hub</Link>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:30, paddingTop:22, borderTop:'1px solid rgba(255,255,255,.08)', color:'#7f8794', fontSize:'.82rem' }}>
              <MailCheck size={18} color="#86EFAC"/> A criação da conta e a recuperação de senha são validadas pelo e-mail autorizado.
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
