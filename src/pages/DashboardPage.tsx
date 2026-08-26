import React, { FormEvent, useEffect, useState } from 'react';
import {
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  ImagePlus,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Plus,
  Save,
  Send,
  Settings2,
  Trash2,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HubHeader from '../components/HubHeader';
import { hubApi } from '../lib/api';
import type { PortfolioDetail, Project, SessionUser, StudentAccount, StudentInvite } from '../types';

type Tab = 'portfolio' | 'projects' | 'students' | 'account' | 'system';
type Health = { ok: boolean; configured: boolean; emailConfigured: boolean; storageConfigured: boolean; mailProvider: string };

const emptyProject = (portfolioId = ''): Project => ({
  id: '',
  portfolioId,
  slug: '',
  title: '',
  subtitle: '',
  category: 'Projeto de Interface',
  year: String(new Date().getFullYear()),
  summary: '',
  body: '',
  coverUrl: '',
  gallery: [],
  externalUrl: '',
  tags: [],
  featured: false,
  published: true,
  sortOrder: 0,
});

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioDetail | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [invites, setInvites] = useState<StudentInvite[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>();
  const [tab, setTab] = useState<Tab>('portfolio');
  const [projectDraft, setProjectDraft] = useState<Project | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [newInvite, setNewInvite] = useState({ email: '', suggestedName: '' });
  const [lastInviteUrl, setLastInviteUrl] = useState('');
  const [health, setHealth] = useState<Health | null>(null);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  const isAdmin = user?.role === 'admin';

  function clearNotice() {
    setMessage('');
    setError('');
  }

  async function refreshHealth() {
    try {
      setHealth(await hubApi.health());
    } catch {
      setHealth(null);
    }
  }

  async function loadPortfolio(studentUserId?: string) {
    const result = await hubApi.getMyPortfolio(studentUserId);
    setPortfolio(result.portfolio);
    if (result.portfolio) {
      const list = await hubApi.listMyProjects(result.portfolio.id);
      setProjects(list.projects);
    } else {
      setProjects([]);
    }
  }

  async function refreshStudents() {
    if (!isAdmin && user?.role !== 'admin') return;
    const [studentsResult, invitesResult] = await Promise.all([hubApi.listStudents(), hubApi.listInvites()]);
    setStudents(studentsResult.students);
    setInvites(invitesResult.invites);
  }

  useEffect(() => {
    refreshHealth();
    hubApi.session()
      .then(async result => {
        if (!result.authenticated || !result.user) {
          navigate('/entrar', { replace: true });
          return;
        }
        setUser(result.user);
        if (result.user.role === 'admin') {
          const [s, i] = await Promise.all([hubApi.listStudents(), hubApi.listInvites()]);
          setStudents(s.students);
          setInvites(i.invites);
          if (s.students[0]) {
            setSelectedStudentId(s.students[0].id);
            await loadPortfolio(s.students[0].id);
          } else {
            setTab('students');
          }
        } else {
          await loadPortfolio();
        }
      })
      .catch(() => navigate('/entrar', { replace: true }));
  }, [navigate]);

  async function chooseStudent(student: StudentAccount) {
    setSelectedStudentId(student.id);
    clearNotice();
    setProjectDraft(null);
    setTab('portfolio');
    await loadPortfolio(student.id);
  }

  async function savePortfolio(event: FormEvent) {
    event.preventDefault();
    if (!portfolio) return;
    setBusy(true);
    clearNotice();
    try {
      const result = await hubApi.saveMyPortfolio(portfolio, isAdmin ? selectedStudentId : undefined);
      setPortfolio(result.portfolio);
      setMessage('Portfólio salvo.');
      if (isAdmin) await refreshStudents();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setBusy(false);
    }
  }

  async function uploadPortfolioImage(file: File, kind: 'avatar' | 'hero') {
    if (!portfolio) return;
    setBusy(true);
    clearNotice();
    try {
      const url = await hubApi.uploadImage(file, kind, portfolio.id);
      setPortfolio(prev => prev ? ({ ...prev, ...(kind === 'avatar' ? { avatarUrl: url } : { heroImageUrl: url }) }) : prev);
      setMessage('Imagem enviada. Clique em “Salvar portfólio” para confirmar a alteração.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no upload.');
    } finally {
      setBusy(false);
    }
  }

  async function uploadProjectImage(file: File, kind: 'cover' | 'gallery') {
    if (!portfolio || !projectDraft) return;
    setBusy(true);
    clearNotice();
    try {
      const url = await hubApi.uploadImage(file, kind, portfolio.id);
      setProjectDraft(prev => prev
        ? (kind === 'cover'
          ? { ...prev, coverUrl: url }
          : { ...prev, gallery: [...(prev.gallery || []), url] })
        : prev);
      setMessage('Imagem enviada. Salve o projeto para manter a alteração.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no upload.');
    } finally {
      setBusy(false);
    }
  }

  async function saveProject(event: FormEvent) {
    event.preventDefault();
    if (!portfolio || !projectDraft) return;
    setBusy(true);
    clearNotice();
    try {
      const payload = {
        ...projectDraft,
        portfolioId: portfolio.id,
        slug: projectDraft.slug || projectDraft.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      };
      await hubApi.saveProject(payload);
      const list = await hubApi.listMyProjects(portfolio.id);
      setProjects(list.projects);
      setProjectDraft(null);
      setMessage('Projeto salvo.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar o projeto.');
    } finally {
      setBusy(false);
    }
  }

  async function removeProject(id: string) {
    if (!window.confirm('Excluir este projeto? Esta ação remove os dados do projeto do Hub.')) return;
    clearNotice();
    try {
      await hubApi.deleteProject(id);
      setProjects(prev => prev.filter(project => project.id !== id));
      setProjectDraft(null);
      setMessage('Projeto excluído.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível excluir.');
    }
  }

  async function createInvite(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    clearNotice();
    setLastInviteUrl('');
    try {
      const result = await hubApi.createInvite(newInvite);
      const lists = await Promise.all([hubApi.listStudents(), hubApi.listInvites()]);
      setStudents(lists[0].students);
      setInvites(lists[1].invites);
      setNewInvite({ email: '', suggestedName: '' });
      setLastInviteUrl(result.emailSent ? '' : result.inviteUrl);
      setMessage(result.emailSent
        ? 'Convite enviado. O estudante criará a própria conta e escolherá a própria senha.'
        : 'Convite criado, mas o e-mail ainda não está configurado. Use o link mostrado abaixo somente para teste.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível criar o convite.');
    } finally {
      setBusy(false);
    }
  }

  async function resendInvite(invite: StudentInvite) {
    clearNotice();
    setBusy(true);
    try {
      await hubApi.resendInvite(invite.id);
      const result = await hubApi.listInvites();
      setInvites(result.invites);
      setMessage(`Convite reenviado para ${invite.email}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível reenviar o convite.');
    } finally {
      setBusy(false);
    }
  }

  async function cancelInvite(invite: StudentInvite) {
    if (!window.confirm(`Cancelar o convite de ${invite.email}?`)) return;
    clearNotice();
    setBusy(true);
    try {
      await hubApi.deleteInvite(invite.id);
      const result = await hubApi.listInvites();
      setInvites(result.invites);
      setMessage('Convite cancelado.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível cancelar o convite.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteStudent(student: StudentAccount) {
    if (!window.confirm(`Excluir a conta e o portfólio de ${student.displayName}? Os dados desse estudante serão removidos do Neon.`)) return;
    setBusy(true);
    clearNotice();
    try {
      await hubApi.deleteStudent(student.id);
      const s = await hubApi.listStudents();
      setStudents(s.students);
      setMessage('Conta de estudante excluída.');
      if (selectedStudentId === student.id) {
        if (s.students[0]) {
          setSelectedStudentId(s.students[0].id);
          await loadPortfolio(s.students[0].id);
        } else {
          setSelectedStudentId(undefined);
          setPortfolio(null);
          setProjects([]);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível excluir a conta.');
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    clearNotice();
    if (passwords.next.length < 8) {
      setError('A nova senha precisa ter pelo menos 8 caracteres.');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setError('As duas novas senhas não são iguais.');
      return;
    }
    setBusy(true);
    try {
      await hubApi.changePassword(passwords.current, passwords.next);
      setPasswords({ current: '', next: '', confirm: '' });
      setMessage('Senha alterada.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível alterar a senha.');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await hubApi.logout().catch(() => undefined);
    navigate('/entrar');
  }

  const title = isAdmin ? 'Administração do Hub' : 'Meu portfólio';
  const projectFormTitle = projectDraft?.id ? 'Editar projeto' : 'Novo projeto';
  const selectedStudent = students.find(student => student.id === selectedStudentId);
  const systemReady = Boolean(health?.configured && health?.storageConfigured && health?.emailConfigured);

  return (
    <div className="lab-page">
      <HubHeader compact />
      <main className="lab-main">
        <section className="lab-section">
          <div className="lab-container">
            <div className="section-head">
              <div>
                <p className="lab-kicker">PAINEL • LABINTERFACE</p>
                <h2>{title}</h2>
              </div>
              <div className="dashboard-actions" style={{ marginTop: 0 }}>
                {portfolio?.slug && <a className="lab-secondary" href={`/portfolio/${portfolio.slug}`} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Ver portfólio</a>}
                <button className="lab-secondary" onClick={logout}><LogOut size={16} /> Sair</button>
              </div>
            </div>

            {error && <div className="lab-message error" style={{ marginBottom: 16 }}>{error}</div>}
            {message && <div className="lab-message success" style={{ marginBottom: 16 }}>{message}</div>}

            {isAdmin && students.length > 0 && (
              <div className="dashboard-card">
                <p className="lab-label" style={{ color: '#D2A979', marginBottom: 12 }}>PORTFÓLIO EM EDIÇÃO</p>
                <div className="dashboard-actions" style={{ marginTop: 0 }}>
                  {students.map(student => (
                    <button
                      key={student.id}
                      className="lab-secondary"
                      style={selectedStudentId === student.id ? { borderColor: '#00FFFF', color: '#00FFFF' } : {}}
                      onClick={() => chooseStudent(student)}
                    >
                      {student.displayName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="dashboard-layout">
              <aside className="dashboard-side" aria-label="Seções do painel">
                <button className={tab === 'portfolio' ? 'active' : ''} onClick={() => setTab('portfolio')}><LayoutDashboard size={16} /> Portfólio</button>
                <button className={tab === 'projects' ? 'active' : ''} onClick={() => setTab('projects')}><ImagePlus size={16} /> Projetos</button>
                {isAdmin && <button className={tab === 'students' ? 'active' : ''} onClick={() => setTab('students')}><UsersRound size={16} /> Estudantes</button>}
                <button className={tab === 'account' ? 'active' : ''} onClick={() => setTab('account')}><KeyRound size={16} /> Minha senha</button>
                {isAdmin && <button className={tab === 'system' ? 'active' : ''} onClick={() => { setTab('system'); refreshHealth(); }}><Settings2 size={16} /> Integrações</button>}
              </aside>

              <div className="dashboard-panel">
                {tab === 'portfolio' && portfolio && (
                  <form onSubmit={savePortfolio}>
                    <div className="dashboard-card">
                      <p className="lab-label" style={{ color: '#00FFFF' }}>IDENTIDADE DO ESTUDANTE</p>
                      <h2>Identidade</h2>
                      <div className="lab-form-grid">
                        <div className="lab-field"><label>Nome público</label><input value={portfolio.displayName} onChange={e => setPortfolio({ ...portfolio, displayName: e.target.value })} /></div>
                        <div className="lab-field"><label>Frase de apresentação</label><input value={portfolio.headline || ''} onChange={e => setPortfolio({ ...portfolio, headline: e.target.value })} /></div>
                        <div className="lab-field"><label>Bio curta</label><textarea value={portfolio.bio || ''} onChange={e => setPortfolio({ ...portfolio, bio: e.target.value })} /></div>
                        <div className="lab-field"><label>Sobre</label><textarea value={portfolio.about || ''} onChange={e => setPortfolio({ ...portfolio, about: e.target.value })} /></div>
                      </div>
                    </div>

                    <div className="dashboard-card">
                      <p className="lab-label" style={{ color: '#F48A79' }}>UPLOAD DIRETO • CLOUDINARY</p>
                      <h2>Imagens</h2>
                      <p className="dashboard-help">As imagens são reduzidas para WebP no navegador sempre que possível e enviadas diretamente ao armazenamento.</p>
                      <div className="lab-form-grid">
                        <div className="lab-field">
                          <label>Retrato / avatar</label>
                          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={e => { const file = e.target.files?.[0]; if (file) uploadPortfolioImage(file, 'avatar'); }} />
                          {portfolio.avatarUrl && <div className="image-preview"><img src={portfolio.avatarUrl} alt="Prévia do avatar" /></div>}
                        </div>
                        <div className="lab-field">
                          <label>Imagem inicial do portfólio</label>
                          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={e => { const file = e.target.files?.[0]; if (file) uploadPortfolioImage(file, 'hero'); }} />
                          {portfolio.heroImageUrl && <div className="image-preview"><img src={portfolio.heroImageUrl} alt="Prévia da imagem inicial" /></div>}
                        </div>
                      </div>
                    </div>

                    <div className="dashboard-card">
                      <p className="lab-label" style={{ color: '#86EFAC' }}>AUTORIA VISUAL</p>
                      <h2>Aparência</h2>
                      <div className="theme-grid">
                        <div className="lab-field"><label>Cor de destaque</label><input type="color" style={{ padding: 6 }} value={portfolio.theme?.accent || '#00FFFF'} onChange={e => setPortfolio({ ...portfolio, theme: { ...portfolio.theme, accent: e.target.value } })} /></div>
                        <div className="lab-field"><label>Cor secundária</label><input type="color" style={{ padding: 6 }} value={portfolio.theme?.secondary || '#D2A979'} onChange={e => setPortfolio({ ...portfolio, theme: { ...portfolio.theme, secondary: e.target.value } })} /></div>
                        <div className="lab-field"><label>Forma dos cards</label><select value={portfolio.theme?.cardRadius || 'round'} onChange={e => setPortfolio({ ...portfolio, theme: { ...portfolio.theme, cardRadius: e.target.value as 'soft' | 'round' | 'square' } })}><option value="round">Arredondado</option><option value="soft">Suave</option><option value="square">Reto</option></select></div>
                        <div className="lab-field"><label>Layout dos projetos</label><select value={portfolio.theme?.projectLayout || 'grid'} onChange={e => setPortfolio({ ...portfolio, theme: { ...portfolio.theme, projectLayout: e.target.value as 'grid' | 'editorial' } })}><option value="grid">Grade</option><option value="editorial">Editorial</option></select></div>
                      </div>
                    </div>

                    <div className="dashboard-card">
                      <p className="lab-label" style={{ color: '#D2A979' }}>CONTATO</p>
                      <h2>Links públicos</h2>
                      <div className="lab-form-grid">
                        <div className="lab-field"><label>E-mail público</label><input type="email" value={portfolio.publicEmail || ''} onChange={e => setPortfolio({ ...portfolio, publicEmail: e.target.value })} /></div>
                        <div className="lab-field"><label>Instagram</label><input placeholder="https://instagram.com/..." value={portfolio.instagramUrl || ''} onChange={e => setPortfolio({ ...portfolio, instagramUrl: e.target.value })} /></div>
                        <div className="lab-field"><label>LinkedIn</label><input placeholder="https://linkedin.com/in/..." value={portfolio.linkedinUrl || ''} onChange={e => setPortfolio({ ...portfolio, linkedinUrl: e.target.value })} /></div>
                        <div className="lab-field"><label>Site externo</label><input placeholder="https://..." value={portfolio.websiteUrl || ''} onChange={e => setPortfolio({ ...portfolio, websiteUrl: e.target.value })} /></div>
                        <label className="lab-check"><input type="checkbox" checked={portfolio.published} onChange={e => setPortfolio({ ...portfolio, published: e.target.checked })} /> Portfólio público</label>
                      </div>
                      <div className="dashboard-actions"><button className="lab-primary" disabled={busy} type="submit"><Save size={17} />{busy ? 'Salvando…' : 'Salvar portfólio'}</button></div>
                    </div>
                  </form>
                )}

                {tab === 'portfolio' && !portfolio && <div className="lab-empty">Selecione ou crie um estudante para editar o portfólio.</div>}

                {tab === 'projects' && portfolio && (
                  <>
                    <div className="dashboard-card">
                      <div className="dashboard-card-head"><div><p className="lab-label" style={{ color: '#00FFFF' }}>CONTEÚDO</p><h2>Projetos</h2></div><button className="lab-primary" onClick={() => setProjectDraft(emptyProject(portfolio.id))}><Plus size={17} /> Novo projeto</button></div>
                      <div className="dashboard-list">
                        {projects.length === 0 && <div className="lab-empty">Nenhum projeto cadastrado.</div>}
                        {projects.map(project => (
                          <div className="dashboard-row" key={project.id}>
                            <div><div className="dashboard-row-title">{project.title}</div><div className="dashboard-row-sub">{project.category || 'Sem categoria'} • {project.year || 'Sem ano'}</div></div>
                            <div className="dashboard-actions" style={{ marginTop: 0 }}><span className="dashboard-badge">{project.published ? 'público' : 'rascunho'}</span><button className="lab-secondary" onClick={() => setProjectDraft(project)}>Editar</button></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {projectDraft && (
                      <form className="dashboard-card" onSubmit={saveProject}>
                        <p className="lab-label" style={{ color: '#F48A79' }}>PROJETO</p>
                        <h2>{projectFormTitle}</h2>
                        <div className="lab-form-grid">
                          <div className="lab-field"><label>Título</label><input required value={projectDraft.title} onChange={e => setProjectDraft({ ...projectDraft, title: e.target.value })} /></div>
                          <div className="lab-field"><label>Subtítulo</label><input value={projectDraft.subtitle || ''} onChange={e => setProjectDraft({ ...projectDraft, subtitle: e.target.value })} /></div>
                          <div className="two-fields"><div className="lab-field"><label>Categoria</label><input value={projectDraft.category} onChange={e => setProjectDraft({ ...projectDraft, category: e.target.value })} /></div><div className="lab-field"><label>Ano</label><input value={projectDraft.year} onChange={e => setProjectDraft({ ...projectDraft, year: e.target.value })} /></div></div>
                          <div className="lab-field"><label>Descrição curta</label><textarea required value={projectDraft.summary} onChange={e => setProjectDraft({ ...projectDraft, summary: e.target.value })} /></div>
                          <div className="lab-field"><label>Texto do projeto</label><textarea value={projectDraft.body || ''} onChange={e => setProjectDraft({ ...projectDraft, body: e.target.value })} /></div>
                          <div className="lab-field"><label>Tags — separadas por vírgula</label><input value={(projectDraft.tags || []).join(', ')} onChange={e => setProjectDraft({ ...projectDraft, tags: e.target.value.split(',').map(value => value.trim()).filter(Boolean) })} /></div>
                          <div className="lab-field"><label>Link externo</label><input placeholder="https://..." value={projectDraft.externalUrl || ''} onChange={e => setProjectDraft({ ...projectDraft, externalUrl: e.target.value })} /></div>
                          <div className="lab-field"><label>Capa do projeto</label><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e => { const file = e.target.files?.[0]; if (file) uploadProjectImage(file, 'cover'); }} />{projectDraft.coverUrl && <div className="image-preview"><img src={projectDraft.coverUrl} alt="Prévia da capa" /></div>}</div>
                          <div className="lab-field">
                            <label>Galeria — pode selecionar várias fotos</label>
                            <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={async e => { const files = Array.from(e.target.files || []) as File[]; for (const file of files) await uploadProjectImage(file, 'gallery'); }} />
                            {projectDraft.gallery?.length > 0 && <div className="gallery-previews">{projectDraft.gallery.map((url, index) => <div key={`${url}-${index}`} className="gallery-preview-item"><img src={url} alt="" /><button type="button" aria-label="Remover imagem" onClick={() => setProjectDraft({ ...projectDraft, gallery: projectDraft.gallery.filter((_, itemIndex) => itemIndex !== index) })}>×</button></div>)}</div>}
                          </div>
                          <label className="lab-check"><input type="checkbox" checked={projectDraft.published} onChange={e => setProjectDraft({ ...projectDraft, published: e.target.checked })} /> Projeto público</label>
                          <label className="lab-check"><input type="checkbox" checked={projectDraft.featured} onChange={e => setProjectDraft({ ...projectDraft, featured: e.target.checked })} /> Projeto destacado</label>
                        </div>
                        <div className="dashboard-actions"><button className="lab-primary" disabled={busy} type="submit"><Save size={17} /> Salvar projeto</button><button className="lab-secondary" type="button" onClick={() => setProjectDraft(null)}>Cancelar</button>{projectDraft.id && <button className="lab-secondary lab-danger" type="button" onClick={() => removeProject(projectDraft.id)}><Trash2 size={16} /> Excluir</button>}</div>
                      </form>
                    )}
                  </>
                )}

                {tab === 'students' && isAdmin && (
                  <>
                    <form className="dashboard-card" onSubmit={createInvite}>
                      <p className="lab-label" style={{ color: '#86EFAC' }}>ADMINISTRAÇÃO • CONVITES</p>
                      <h2>Convidar estudante</h2>
                      <p className="dashboard-help">Você autoriza o e-mail. O estudante recebe o link, cria a própria conta, escolhe a própria senha e define o endereço do portfólio. Nenhuma senha de aluno fica com a administração.</p>
                      <div className="lab-form-grid">
                        <div className="lab-field"><label>Nome para identificar o convite (opcional)</label><input value={newInvite.suggestedName} onChange={e => setNewInvite({ ...newInvite, suggestedName: e.target.value })} /></div>
                        <div className="lab-field"><label>E-mail autorizado</label><input required type="email" value={newInvite.email} onChange={e => setNewInvite({ ...newInvite, email: e.target.value })} /></div>
                      </div>
                      <div className="dashboard-actions"><button className="lab-primary" disabled={busy || students.length + invites.length >= 5}><UserPlus size={17} /> Enviar convite</button><button className="lab-secondary" type="button" disabled={busy} onClick={refreshStudents}><UsersRound size={16}/> Atualizar listas</button></div>
                      {students.length + invites.length >= 5 && <div className="lab-message" style={{ marginTop:16 }}>Os cinco espaços já estão ocupados por contas ativas ou convites pendentes.</div>}
                      {lastInviteUrl && <div className="lab-message" style={{ marginTop:16, wordBreak:'break-all' }}><strong>Link de teste:</strong><br/><a className="lab-text-link" href={lastInviteUrl}>{lastInviteUrl}</a></div>}
                    </form>

                    <div className="dashboard-card">
                      <p className="lab-label" style={{ color:'#F48A79' }}>AGUARDANDO CADASTRO</p>
                      <h2>Convites pendentes</h2>
                      <div className="dashboard-list">
                        {invites.length === 0 && <div className="lab-empty">Nenhum convite pendente.</div>}
                        {invites.map(invite => (
                          <div className="dashboard-row" key={invite.id}>
                            <div><div className="dashboard-row-title">{invite.suggestedName || 'Estudante convidado'}</div><div className="dashboard-row-sub">{invite.email} • expira em {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}</div></div>
                            <div className="dashboard-actions" style={{ marginTop:0 }}><button className="lab-secondary" disabled={busy} onClick={() => resendInvite(invite)}><Send size={14}/> Reenviar</button><button className="lab-secondary lab-danger" disabled={busy} onClick={() => cancelInvite(invite)}><Trash2 size={14}/> Cancelar</button></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="dashboard-card">
                      <p className="lab-label" style={{ color: '#D2A979' }}>CONTAS ATIVAS</p>
                      <h2>Estudantes</h2>
                      <div className="dashboard-list">
                        {students.length === 0 && <div className="lab-empty">Os estudantes aparecerão aqui depois que criarem as próprias contas.</div>}
                        {students.map(student => (
                          <div className="dashboard-row" key={student.id}>
                            <div><div className="dashboard-row-title">{student.displayName}</div><div className="dashboard-row-sub">{student.email} • /portfolio/{student.slug}</div></div>
                            <div className="dashboard-actions" style={{ marginTop: 0 }}>
                              {student.emailVerified ? <span className="dashboard-badge"><CheckCircle2 size={13} /> conta validada</span> : <button className="lab-secondary" onClick={() => hubApi.resendVerification(student.id).then(() => setMessage('E-mail de validação reenviado.')).catch(e => setError(e.message))}><Send size={14}/> reenviar validação</button>}
                              <button className="lab-secondary" onClick={() => chooseStudent(student)}>Editar</button>
                              <button className="lab-secondary lab-danger" disabled={busy} onClick={() => deleteStudent(student)}><Trash2 size={14} /> Excluir</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {tab === 'account' && (
                  <form className="dashboard-card" onSubmit={changePassword}>
                    <p className="lab-label" style={{ color: '#D2A979' }}>SEGURANÇA</p>
                    <h2>Alterar senha</h2>
                    <p className="dashboard-help">Esta alteração é para a conta com a qual você está conectado agora.</p>
                    <div className="lab-form-grid">
                      <div className="lab-field"><label>Senha atual</label><input type="password" autoComplete="current-password" required value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} /></div>
                      <div className="lab-field"><label>Nova senha</label><input type="password" autoComplete="new-password" minLength={8} required value={passwords.next} onChange={e => setPasswords({ ...passwords, next: e.target.value })} /></div>
                      <div className="lab-field"><label>Repetir nova senha</label><input type="password" autoComplete="new-password" minLength={8} required value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} /></div>
                    </div>
                    <div className="dashboard-actions"><button className="lab-primary" disabled={busy}><KeyRound size={17} /> Alterar senha</button></div>
                  </form>
                )}

                {tab === 'system' && isAdmin && (
                  <div className="dashboard-card">
                    <p className="lab-label" style={{ color: systemReady ? '#86EFAC' : '#F48A79' }}>INFRAESTRUTURA</p>
                    <h2>Integrações</h2>
                    <p className="dashboard-help">Esta área é visível apenas para a administradora e serve para conferir se as três integrações essenciais estão ativas.</p>
                    <div className="integration-grid">
                      <IntegrationStatus name="Neon" description="dados, contas e projetos" ready={Boolean(health?.configured)} />
                      <IntegrationStatus name="Cloudinary" description="imagens e galerias" ready={Boolean(health?.storageConfigured)} />
                      <IntegrationStatus name={health?.mailProvider === 'brevo' ? 'Brevo' : 'Resend'} description="validação e recuperação por e-mail" ready={Boolean(health?.emailConfigured)} />
                    </div>
                    <div className="dashboard-actions"><button className="lab-secondary" onClick={refreshHealth}><Settings2 size={16} /> Verificar novamente</button></div>
                    {selectedStudent && <div className="lab-message" style={{ marginTop: 18 }}>Em edição agora: <strong>{selectedStudent.displayName}</strong>.</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function IntegrationStatus({ name, description, ready }: { name: string; description: string; ready: boolean }) {
  return (
    <div className={`integration-status ${ready ? 'ready' : 'pending'}`}>
      <div className="integration-icon">{ready ? <CheckCircle2 size={22} /> : <CircleAlert size={22} />}</div>
      <div><strong>{name}</strong><span>{description}</span></div>
      <small>{ready ? 'ATIVO' : 'PENDENTE'}</small>
    </div>
  );
}
