import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Mail, UserPlus } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import HubHeader from '../components/HubHeader';
import { hubApi } from '../lib/api';

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72);
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [requestedEmail, setRequestedEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [slug, setSlug] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(Boolean(token));
  const [inviteReady, setInviteReady] = useState(false);

  useEffect(() => {
    if (!token) return;
    setBusy(true);
    hubApi.getInviteInfo(token)
      .then(info => {
        setInviteEmail(info.email);
        setDisplayName(info.suggestedName || '');
        setSlug(makeSlug(info.suggestedName || ''));
        setInviteReady(true);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Convite inválido.'))
      .finally(() => setBusy(false));
  }, [token]);

  async function requestLink(event: FormEvent) {
    event.preventDefault();
    setError(''); setMessage(''); setBusy(true);
    try {
      const result = await hubApi.requestRegistrationLink(requestedEmail);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível solicitar o link.');
    } finally { setBusy(false); }
  }

  async function register(event: FormEvent) {
    event.preventDefault();
    setError(''); setMessage('');
    if (password.length < 8) return setError('A senha precisa ter pelo menos 8 caracteres.');
    if (password !== confirm) return setError('As duas senhas não são iguais.');
    if (!slug) return setError('Escolha um endereço para o portfólio.');
    setBusy(true);
    try {
      await hubApi.register({ token, displayName, slug, password });
      navigate('/painel', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.');
    } finally { setBusy(false); }
  }

  return (
    <div className="lab-page">
      <HubHeader compact />
      <main className="lab-main">
        <section className="lab-section">
          {!token ? (
            <form className="lab-form-shell" onSubmit={requestLink}>
              <div style={{ width:64,height:64,borderRadius:22,display:'grid',placeItems:'center',background:'rgba(134,239,172,.08)',border:'1px solid rgba(134,239,172,.22)',color:'#86EFAC' }}><Mail size={30}/></div>
              <p className="lab-kicker" style={{ marginTop:28 }}>PRIMEIRO ACESSO</p>
              <h1>Criar minha conta</h1>
              <p style={{ color:'#9ca3af', marginBottom:28 }}>Use o mesmo e-mail que foi autorizado pela administração do Hub. Se houver um convite pendente, você receberá um link para escolher sua senha e criar seu portfólio.</p>
              {error && <div className="lab-message error">{error}</div>}
              {message && <div className="lab-message success">{message}</div>}
              <div className="lab-form-grid">
                <div className="lab-field"><label htmlFor="register-email">E-mail convidado</label><input id="register-email" type="email" required autoComplete="email" value={requestedEmail} onChange={e => setRequestedEmail(e.target.value)} /></div>
                <button className="lab-primary" disabled={busy} type="submit"><Mail size={18}/>{busy ? 'Enviando…' : 'Receber link de criação'}</button>
              </div>
              <div style={{ display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:12,marginTop:22 }}>
                <Link className="lab-text-link" to="/entrar">Já tenho conta</Link>
                <Link className="lab-secondary" to="/"><ArrowLeft size={16}/> Voltar ao Hub</Link>
              </div>
            </form>
          ) : (
            <form className="lab-form-shell" onSubmit={register}>
              <div style={{ width:64,height:64,borderRadius:22,display:'grid',placeItems:'center',background:'rgba(0,255,255,.08)',border:'1px solid rgba(0,255,255,.2)',color:'#00FFFF' }}><UserPlus size={30}/></div>
              <p className="lab-kicker" style={{ marginTop:28 }}>CONVITE VALIDADO POR E-MAIL</p>
              <h1>Crie sua conta</h1>
              {busy && !inviteReady && <div className="lab-message">Validando convite…</div>}
              {error && <div className="lab-message error">{error}</div>}
              {inviteReady && (
                <>
                  <div className="lab-message success" style={{ marginBottom:20 }}><CheckCircle2 size={16}/> E-mail autorizado: <strong>{inviteEmail}</strong></div>
                  <div className="lab-form-grid">
                    <div className="lab-field"><label htmlFor="displayName">Seu nome público</label><input id="displayName" required value={displayName} onChange={e => { setDisplayName(e.target.value); if (!slug || slug === makeSlug(displayName)) setSlug(makeSlug(e.target.value)); }} /></div>
                    <div className="lab-field"><label htmlFor="slug">Endereço do seu portfólio</label><div className="slug-input"><span>/portfolio/</span><input id="slug" required value={slug} onChange={e => setSlug(makeSlug(e.target.value))} /></div></div>
                    <div className="lab-field"><label htmlFor="new-password">Crie sua senha</label><input id="new-password" type="password" minLength={8} required autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /></div>
                    <div className="lab-field"><label htmlFor="confirm-password">Repita a senha</label><input id="confirm-password" type="password" minLength={8} required autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} /></div>
                    <button className="lab-primary" disabled={busy} type="submit"><UserPlus size={18}/>{busy ? 'Criando…' : 'Criar conta e entrar'}</button>
                  </div>
                </>
              )}
              <div style={{ display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:12,marginTop:22 }}>
                <Link className="lab-text-link" to="/entrar">Voltar ao login</Link>
                <Link className="lab-secondary" to="/"><ArrowLeft size={16}/> Voltar ao Hub</Link>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
