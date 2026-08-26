import React, { FormEvent, useEffect, useState } from 'react';
import {
  CheckCircle2, CircleAlert, Code2, ExternalLink, Eye, FileText, ImagePlus, KeyRound, LayoutDashboard, Link2,
  LogOut, Palette, Plus, Save, Send, Settings2, Trash2, Upload, UserPlus, UsersRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DesignSystemEditor from '../components/DesignSystemEditor';
import HubHeader from '../components/HubHeader';
import { hubApi } from '../lib/api';
import { mergeTheme } from '../theme/portfolioTheme';
import type { IconRole, PortfolioDetail, Project, SessionUser, StudentAccount, StudentInvite } from '../types';

type Tab = 'portfolio' | 'design' | 'projects' | 'students' | 'account' | 'system';
type Health = { ok: boolean; configured: boolean; emailConfigured: boolean; storageConfigured: boolean; mailProvider: string };

const emptyProject = (portfolioId = ''): Project => ({
  id:'', portfolioId, slug:'', title:'', subtitle:'', category:'Projeto de Design', year:String(new Date().getFullYear()), summary:'', body:'', coverUrl:'', gallery:[], externalUrl:'', tags:[], attachments:[], interactive:{type:'none',height:520,position:'after-text'}, featured:false, published:true, sortOrder:0,
});

const slugify = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,72);

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user,setUser] = useState<SessionUser|null>(null);
  const [portfolio,setPortfolio] = useState<PortfolioDetail|null>(null);
  const [projects,setProjects] = useState<Project[]>([]);
  const [students,setStudents] = useState<StudentAccount[]>([]);
  const [invites,setInvites] = useState<StudentInvite[]>([]);
  const [selectedStudentId,setSelectedStudentId] = useState<string|undefined>();
  const [tab,setTab] = useState<Tab>('portfolio');
  const [projectDraft,setProjectDraftState] = useState<Project|null>(null);
  const projectDraftRef = React.useRef<Project|null>(null);
  const setProjectDraft = React.useCallback((next: Project|null|((current:Project|null)=>Project|null)) => {
    const resolved = typeof next === 'function' ? (next as (current:Project|null)=>Project|null)(projectDraftRef.current) : next;
    projectDraftRef.current = resolved;
    setProjectDraftState(resolved);
  }, []);
  const [message,setMessage] = useState('');
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const [newInvite,setNewInvite] = useState({email:'',suggestedName:''});
  const [lastInviteUrl,setLastInviteUrl] = useState('');
  const [health,setHealth] = useState<Health|null>(null);
  const [passwords,setPasswords] = useState({current:'',next:'',confirm:''});
  const isAdmin = user?.role === 'admin';

  const clearNotice = () => { setMessage(''); setError(''); };
  const refreshHealth = async () => { try { setHealth(await hubApi.health()); } catch { setHealth(null); } };

  async function loadPortfolio(studentUserId?: string) {
    const result = await hubApi.getMyPortfolio(studentUserId);
    const loaded = result.portfolio ? {...result.portfolio,theme:mergeTheme(result.portfolio.theme)} : null;
    setPortfolio(loaded);
    if (loaded) setProjects((await hubApi.listMyProjects(loaded.id)).projects); else setProjects([]);
  }

  async function refreshStudents() {
    if (user?.role !== 'admin') return;
    const [s,i] = await Promise.all([hubApi.listStudents(),hubApi.listInvites()]);
    setStudents(s.students); setInvites(i.invites);
  }

  useEffect(()=>{
    refreshHealth();
    hubApi.session().then(async result=>{
      if(!result.authenticated||!result.user){navigate('/entrar',{replace:true});return;}
      setUser(result.user);
      if(result.user.role==='admin'){
        const [s,i]=await Promise.all([hubApi.listStudents(),hubApi.listInvites()]);
        setStudents(s.students);setInvites(i.invites);
        // A administradora entra primeiro na gestão do Hub. Não abrimos automaticamente
        // o primeiro aluno, para não dar a impressão de que a conta da professora é a dele.
        setSelectedStudentId(undefined); setPortfolio(null); setProjects([]); setTab('students');
      } else await loadPortfolio();
    }).catch(()=>navigate('/entrar',{replace:true}));
  },[navigate]);

  async function chooseStudent(student: StudentAccount){setSelectedStudentId(student.id);clearNotice();setProjectDraft(null);setTab('portfolio');await loadPortfolio(student.id);}
  function stopEditingStudent(){setSelectedStudentId(undefined);setPortfolio(null);setProjects([]);setProjectDraft(null);clearNotice();setTab('students');}

  async function savePortfolio(event?: FormEvent){
    event?.preventDefault(); if(!portfolio)return; setBusy(true);clearNotice();
    try { const result=await hubApi.saveMyPortfolio({...portfolio,theme:mergeTheme(portfolio.theme)},isAdmin?selectedStudentId:undefined); setPortfolio({...result.portfolio,theme:mergeTheme(result.portfolio.theme)});setMessage('Alterações salvas. O portfólio público já usa este design system.'); if(isAdmin)await refreshStudents(); }
    catch(e){setError(e instanceof Error?e.message:'Não foi possível salvar.');}finally{setBusy(false);}
  }

  async function uploadPortfolioImage(file: File,kind:'avatar'|'hero'){
    if(!portfolio)return;setBusy(true);clearNotice();
    try{
      const url=await hubApi.uploadImage(file,kind,portfolio.id);
      const updated={...portfolio,...(kind==='avatar'?{avatarUrl:url}:{heroImageUrl:url})};
      setPortfolio(updated);
      // O upload agora também persiste a URL imediatamente no Neon. Antes, a imagem
      // podia aparecer na prévia e sumir no site público se o usuário não clicasse em Salvar.
      const result=await hubApi.saveMyPortfolio({...updated,theme:mergeTheme(updated.theme)},isAdmin?selectedStudentId:undefined);
      setPortfolio({...result.portfolio,theme:mergeTheme(result.portfolio.theme)});
      setMessage('Imagem enviada e salva. Ela já está disponível no portfólio público.');
      if(isAdmin)await refreshStudents();
    }
    catch(e){setError(e instanceof Error?e.message:'Falha no upload.');}finally{setBusy(false);}
  }

  async function persistExistingProject(updated:Project){
    if(!portfolio||!updated.id)return updated;
    const result=await hubApi.saveProject({...updated,portfolioId:portfolio.id,slug:updated.slug||slugify(updated.title)});
    const saved=result.project;
    setProjects(current=>current.some(item=>item.id===saved.id)?current.map(item=>item.id===saved.id?saved:item):[...current,saved]);
    setProjectDraft(saved);
    return saved;
  }

  async function uploadProjectImage(file:File,kind:'cover'|'gallery'){
    const current=projectDraftRef.current;
    if(!portfolio||!current)return;setBusy(true);clearNotice();
    try{
      const url=await hubApi.uploadImage(file,kind,portfolio.id);
      const latest=projectDraftRef.current||current;
      const updated=kind==='cover'?{...latest,coverUrl:url}:{...latest,gallery:[...(latest.gallery||[]),url]};
      setProjectDraft(updated);
      if(updated.id){
        await persistExistingProject(updated);
        setMessage('Imagem enviada e salva. Ela já está disponível no portfólio público.');
      }else{
        setMessage('Imagem enviada. Como este projeto ainda é novo, clique em Salvar projeto para publicá-la.');
      }
    }
    catch(e){setError(e instanceof Error?e.message:'Falha no upload.');}finally{setBusy(false);}
  }

  async function uploadProjectPdf(file:File){
    const current=projectDraftRef.current;
    if(!portfolio||!current)return;setBusy(true);clearNotice();
    try{
      const url=await hubApi.uploadPdf(file,portfolio.id);
      const latest=projectDraftRef.current||current;
      const updated={...latest,attachments:[...(latest.attachments||[]),{id:crypto.randomUUID(),type:'pdf' as const,title:file.name.replace(/\.pdf$/i,''),url}]};
      setProjectDraft(updated);
      if(updated.id){await persistExistingProject(updated);setMessage('PDF enviado e salvo.');}
      else setMessage('PDF enviado. Como este projeto ainda é novo, clique em Salvar projeto.');
    }
    catch(e){setError(e instanceof Error?e.message:'Falha no upload do PDF.');}finally{setBusy(false);}
  }

  async function uploadCustomIcon(file:File,role:IconRole){
    if(!portfolio)return;setBusy(true);clearNotice();
    try{const url=await hubApi.uploadCustomIcon(file,portfolio.id);setPortfolio(p=>p?{...p,theme:mergeTheme({...p.theme,customIconUrls:{...mergeTheme(p.theme).customIconUrls,[role]:url}})}:p);setMessage('Ícone enviado. Clique em Salvar design system para confirmar.');}
    catch(e){setError(e instanceof Error?e.message:'Falha no upload do ícone.');}finally{setBusy(false);}
  }

  async function saveProject(event:FormEvent){
    event.preventDefault();if(!portfolio||!projectDraft)return;setBusy(true);clearNotice();
    try{await hubApi.saveProject({...projectDraft,portfolioId:portfolio.id,slug:projectDraft.slug||slugify(projectDraft.title)});setProjects((await hubApi.listMyProjects(portfolio.id)).projects);setProjectDraft(null);setMessage('Projeto salvo.');}
    catch(e){setError(e instanceof Error?e.message:'Não foi possível salvar o projeto.');}finally{setBusy(false);}
  }

  async function removeProject(id:string){if(!window.confirm('Excluir este projeto?'))return;clearNotice();try{await hubApi.deleteProject(id);setProjects(p=>p.filter(x=>x.id!==id));setProjectDraft(null);setMessage('Projeto excluído.');}catch(e){setError(e instanceof Error?e.message:'Não foi possível excluir.');}}

  async function createInvite(event:FormEvent){event.preventDefault();setBusy(true);clearNotice();setLastInviteUrl('');try{const r=await hubApi.createInvite(newInvite);await refreshStudents();setNewInvite({email:'',suggestedName:''});setLastInviteUrl(r.emailSent?'':r.inviteUrl);setMessage(r.emailSent?'Convite enviado. O estudante criará a própria conta e senha.':'Convite criado. O e-mail não está configurado; use o link de teste abaixo.');}catch(e){setError(e instanceof Error?e.message:'Não foi possível criar o convite.');}finally{setBusy(false);}}
  async function resendInvite(invite:StudentInvite){clearNotice();setBusy(true);try{await hubApi.resendInvite(invite.id);await refreshStudents();setMessage(`Convite reenviado para ${invite.email}.`);}catch(e){setError(e instanceof Error?e.message:'Não foi possível reenviar.');}finally{setBusy(false);}}
  async function cancelInvite(invite:StudentInvite){if(!window.confirm(`Cancelar o convite de ${invite.email}?`))return;setBusy(true);clearNotice();try{await hubApi.deleteInvite(invite.id);await refreshStudents();setMessage('Convite cancelado.');}catch(e){setError(e instanceof Error?e.message:'Não foi possível cancelar.');}finally{setBusy(false);}}
  async function deleteStudent(student:StudentAccount){if(!window.confirm(`Excluir a conta e o portfólio de ${student.displayName}?`))return;setBusy(true);clearNotice();try{await hubApi.deleteStudent(student.id);const s=await hubApi.listStudents();setStudents(s.students);setMessage('Conta excluída.');if(selectedStudentId===student.id){setSelectedStudentId(undefined);setPortfolio(null);setProjects([]);setProjectDraft(null);setTab('students');}}catch(e){setError(e instanceof Error?e.message:'Não foi possível excluir.');}finally{setBusy(false);}}
  async function changePassword(event:FormEvent){event.preventDefault();clearNotice();if(passwords.next.length<8)return setError('A nova senha precisa ter pelo menos 8 caracteres.');if(passwords.next!==passwords.confirm)return setError('As duas novas senhas não são iguais.');setBusy(true);try{await hubApi.changePassword(passwords.current,passwords.next);setPasswords({current:'',next:'',confirm:''});setMessage('Senha alterada.');}catch(e){setError(e instanceof Error?e.message:'Não foi possível alterar a senha.');}finally{setBusy(false);}}
  async function logout(){const destination=isAdmin?'/admin':'/entrar';await hubApi.logout().catch(()=>undefined);navigate(destination);}

  const title=isAdmin?'Administração do Hub':'Meu portfólio';
  const selectedStudent=students.find(s=>s.id===selectedStudentId);
  const systemReady=Boolean(health?.configured&&health?.storageConfigured&&health?.emailConfigured);

  return <div className="lab-page"><HubHeader compact sessionLabel={isAdmin?'Administração':'Meu painel'}/><main className="lab-main"><section className="lab-section"><div className="lab-container">
    <div className="section-head"><div><p className="lab-kicker">PAINEL • LABINTERFACE</p><h2>{title}</h2><p className="dashboard-help">{isAdmin?'Esta é a conta da professora. Cadastre novos estudantes em Estudantes e só abra um portfólio quando quiser editá-lo.':'Este painel controla somente o seu portfólio autoral.'}</p></div><div className="dashboard-actions" style={{marginTop:0}}>{portfolio?.slug&&<><a className="lab-secondary" href={`/portfolio/${portfolio.slug}`} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Ver site</a><a className="lab-secondary" href={`/embed/${portfolio.slug}`} target="_blank" rel="noreferrer"><Eye size={16}/> Ver versão embed</a></>}<button className="lab-secondary" onClick={logout}><LogOut size={16}/> Sair</button></div></div>
    {user&&<div className="dashboard-session"><span>SESSÃO ATIVA</span><strong>{user.email}</strong><em>{isAdmin?'ADMINISTRADORA':'ESTUDANTE'}</em></div>}
    {error&&<div className="lab-message error" style={{marginBottom:16}}>{error}</div>}{message&&<div className="lab-message success" style={{marginBottom:16}}>{message}</div>}

    {isAdmin&&selectedStudent&&<div className="dashboard-card"><p className="lab-label" style={{color:'#D2A979',marginBottom:12}}>EDITANDO COMO PROFESSORA</p><div className="dashboard-card-head"><div><h2 style={{margin:0}}>{selectedStudent.displayName}</h2><p className="dashboard-help">{selectedStudent.email} • o login e a senha deste aluno não são alterados por esta edição.</p></div><button className="lab-secondary" onClick={stopEditingStudent}>Voltar à administração</button></div></div>}

    <div className="dashboard-layout"><aside className="dashboard-side" aria-label="Seções do painel">
      {isAdmin&&<button className={tab==='students'?'active':''} onClick={()=>{stopEditingStudent();setTab('students')}}><UsersRound size={16}/> Estudantes / criar</button>}
      {(!isAdmin||Boolean(selectedStudentId))&&<><button className={tab==='portfolio'?'active':''} onClick={()=>setTab('portfolio')}><LayoutDashboard size={16}/> Conteúdo</button><button className={tab==='design'?'active':''} onClick={()=>setTab('design')}><Palette size={16}/> Design system</button><button className={tab==='projects'?'active':''} onClick={()=>setTab('projects')}><ImagePlus size={16}/> Projetos</button></>}
      <button className={tab==='account'?'active':''} onClick={()=>setTab('account')}><KeyRound size={16}/> {isAdmin?'Senha da professora':'Minha senha'}</button>
      {isAdmin&&<button className={tab==='system'?'active':''} onClick={()=>{setTab('system');refreshHealth();}}><Settings2 size={16}/> Integrações</button>}
    </aside><div className="dashboard-panel">

      {tab==='portfolio'&&portfolio&&<form onSubmit={savePortfolio}>
        <div className="dashboard-card"><p className="lab-label" style={{color:'#00FFFF'}}>CONTEÚDO AUTORAL</p><h2>Identidade e apresentação</h2><div className="lab-form-grid">
          <div className="lab-field"><label>Nome público</label><input value={portfolio.displayName} onChange={e=>setPortfolio({...portfolio,displayName:e.target.value})}/></div>
          <div className="lab-field"><label>Frase de apresentação</label><input value={portfolio.headline||''} onChange={e=>setPortfolio({...portfolio,headline:e.target.value})}/></div>
          <div className="lab-field"><label>Bio curta</label><textarea value={portfolio.bio||''} onChange={e=>setPortfolio({...portfolio,bio:e.target.value})}/></div>
          <div className="lab-field"><label>Sobre / texto longo</label><textarea value={portfolio.about||''} onChange={e=>setPortfolio({...portfolio,about:e.target.value})}/></div>
        </div></div>
        <div className="dashboard-card"><p className="lab-label" style={{color:'#F48A79'}}>IMAGENS • CLOUDINARY</p><h2>Avatar e abertura</h2><div className="two-fields">
          <div className="lab-field"><label>Retrato / avatar</label><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)uploadPortfolioImage(f,'avatar');}}/>{portfolio.avatarUrl&&<div className="image-preview"><img src={portfolio.avatarUrl} alt="Prévia do avatar"/></div>}</div>
          <div className="lab-field"><label>Imagem principal / hero</label><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)uploadPortfolioImage(f,'hero');}}/>{portfolio.heroImageUrl&&<div className="image-preview"><img src={portfolio.heroImageUrl} alt="Prévia do hero"/></div>}</div>
        </div></div>
        <div className="dashboard-card"><p className="lab-label" style={{color:'#86EFAC'}}>CONTATO</p><h2>Links públicos</h2><div className="theme-grid">
          <div className="lab-field"><label>E-mail público</label><input type="email" value={portfolio.publicEmail||''} onChange={e=>setPortfolio({...portfolio,publicEmail:e.target.value})}/></div>
          <div className="lab-field"><label>Instagram</label><input type="url" value={portfolio.instagramUrl||''} onChange={e=>setPortfolio({...portfolio,instagramUrl:e.target.value})}/></div>
          <div className="lab-field"><label>LinkedIn</label><input type="url" value={portfolio.linkedinUrl||''} onChange={e=>setPortfolio({...portfolio,linkedinUrl:e.target.value})}/></div>
          <div className="lab-field"><label>Site externo</label><input type="url" value={portfolio.websiteUrl||''} onChange={e=>setPortfolio({...portfolio,websiteUrl:e.target.value})}/></div>
        </div><label className="lab-check" style={{marginTop:18}}><input type="checkbox" checked={portfolio.published!==false} onChange={e=>setPortfolio({...portfolio,published:e.target.checked})}/> Portfólio público</label></div>
        <div className="dashboard-savebar"><button className="lab-primary" disabled={busy} type="submit"><Save size={17}/>{busy?'Salvando…':'Salvar conteúdo'}</button></div>
      </form>}

      {tab==='design'&&portfolio&&<><DesignSystemEditor portfolio={portfolio} onChange={setPortfolio} onUploadCustomIcon={uploadCustomIcon}/><div className="dashboard-savebar sticky"><button className="lab-primary" disabled={busy} onClick={()=>savePortfolio()}><Save size={17}/>{busy?'Salvando…':'Salvar design system'}</button>{portfolio.slug&&<a className="lab-secondary" href={`/portfolio/${portfolio.slug}`} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Abrir resultado</a>}</div></>}

      {tab==='projects'&&portfolio&&<>
        <div className="dashboard-card"><div className="dashboard-card-head"><div><p className="lab-label" style={{color:'#F48A79'}}>CONTEÚDO DOS PROJETOS</p><h2>Projetos</h2><p className="dashboard-help">O design dos cards é definido na aba Design system. Aqui o estudante cuida do conteúdo, imagens, links e ordem.</p></div><button className="lab-primary" onClick={()=>setProjectDraft(emptyProject(portfolio.id))}><Plus size={17}/> Novo projeto</button></div>
          <div className="dashboard-list">{projects.length===0&&<div className="lab-empty">Nenhum projeto cadastrado.</div>}{projects.map(project=><button className="dashboard-row project-editor-row" key={project.id} onClick={()=>setProjectDraft({...project})}><div><div className="dashboard-row-title">{project.title}</div><div className="dashboard-row-sub">{project.category} • {project.year} • {project.published?'público':'rascunho'}</div></div><span className="dashboard-badge">editar</span></button>)}</div>
        </div>
        {projectDraft&&<form className="dashboard-card" onSubmit={saveProject}><p className="lab-label" style={{color:'#D2A979'}}>{projectDraft.id?'EDITAR PROJETO':'NOVO PROJETO'}</p><h2>{projectDraft.id?'Editar projeto':'Novo projeto'}</h2><div className="lab-form-grid">
          <div className="lab-field"><label>Título</label><input required value={projectDraft.title} onChange={e=>setProjectDraft({...projectDraft,title:e.target.value})}/></div>
          <div className="lab-field"><label>Subtítulo</label><input value={projectDraft.subtitle||''} onChange={e=>setProjectDraft({...projectDraft,subtitle:e.target.value})}/></div>
          <div className="two-fields"><div className="lab-field"><label>Categoria</label><input value={projectDraft.category} onChange={e=>setProjectDraft({...projectDraft,category:e.target.value})}/></div><div className="lab-field"><label>Ano</label><input value={projectDraft.year} onChange={e=>setProjectDraft({...projectDraft,year:e.target.value})}/></div></div>
          <div className="lab-field"><label>Resumo</label><textarea value={projectDraft.summary} onChange={e=>setProjectDraft({...projectDraft,summary:e.target.value})}/></div>
          <div className="lab-field"><label>Texto completo</label><textarea rows={8} value={projectDraft.body||''} onChange={e=>setProjectDraft({...projectDraft,body:e.target.value})}/></div>
          <div className="lab-field"><label>Tags — separadas por vírgula</label><input value={(projectDraft.tags||[]).join(', ')} onChange={e=>setProjectDraft({...projectDraft,tags:e.target.value.split(',').map(t=>t.trim()).filter(Boolean)})}/></div>
          <div className="lab-field"><label>Link principal do projeto</label><input type="url" value={projectDraft.externalUrl||''} onChange={e=>setProjectDraft({...projectDraft,externalUrl:e.target.value})} placeholder="https://..."/></div>
          <div className="lab-field"><label>Ordem</label><input type="number" value={projectDraft.sortOrder} onChange={e=>setProjectDraft({...projectDraft,sortOrder:Number(e.target.value)})}/></div>
          <div className="lab-field"><label>Capa</label><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>{const f=e.target.files?.[0];if(f)uploadProjectImage(f,'cover');}}/>{projectDraft.coverUrl&&<div className="image-preview"><img src={projectDraft.coverUrl} alt="Prévia da capa"/></div>}</div>
          <div className="lab-field"><label>Galeria — pode selecionar várias fotos</label><input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={async e=>{for(const f of Array.from(e.target.files||[]) as File[])await uploadProjectImage(f,'gallery');}}/>{projectDraft.gallery.length>0&&<div className="gallery-previews">{projectDraft.gallery.map((url,index)=><div className="gallery-preview-item" key={`${url}-${index}`}><img src={url} alt=""/><button type="button" onClick={()=>setProjectDraft({...projectDraft,gallery:projectDraft.gallery.filter((_,i)=>i!==index)})}>×</button></div>)}</div>}</div>

          <div className="project-builder-block">
            <div className="project-builder-head"><FileText size={20}/><div><strong>PDFs, arquivos e links</strong><span>O projeto pode ter memorial, apresentação, processo, artigo, protótipo ou qualquer link externo.</span></div></div>
            <div className="lab-field"><label>Enviar PDF — até 15 MB</label><label className="ds-upload-button"><Upload size={16}/> Escolher PDF<input hidden type="file" accept="application/pdf" onChange={e=>{const f=e.target.files?.[0];if(f)uploadProjectPdf(f);e.currentTarget.value='';}}/></label></div>
            <button type="button" className="lab-secondary" onClick={()=>setProjectDraft({...projectDraft,attachments:[...(projectDraft.attachments||[]),{id:crypto.randomUUID(),type:'link',title:'Novo link',url:'https://'}]})}><Link2 size={15}/> Adicionar link</button>
            {(projectDraft.attachments||[]).length>0&&<div className="attachment-editor-list">{(projectDraft.attachments||[]).map((item,index)=><div className="attachment-editor" key={item.id}><select value={item.type} onChange={e=>{const a=[...(projectDraft.attachments||[])];a[index]={...item,type:e.target.value as 'pdf'|'link'|'file'};setProjectDraft({...projectDraft,attachments:a});}}><option value="pdf">PDF</option><option value="link">Link</option><option value="file">Arquivo</option></select><input value={item.title} onChange={e=>{const a=[...(projectDraft.attachments||[])];a[index]={...item,title:e.target.value};setProjectDraft({...projectDraft,attachments:a});}} placeholder="Título"/><input value={item.url} onChange={e=>{const a=[...(projectDraft.attachments||[])];a[index]={...item,url:e.target.value};setProjectDraft({...projectDraft,attachments:a});}} placeholder="https://..."/><button type="button" className="lab-secondary lab-danger" onClick={()=>setProjectDraft({...projectDraft,attachments:(projectDraft.attachments||[]).filter((_,i)=>i!==index)})}>×</button></div>)}</div>}
          </div>

          <div className="project-builder-block">
            <div className="project-builder-head"><Code2 size={20}/><div><strong>Interatividade / creative coding</strong><span>Incorpore um sketch p5.js diretamente ou um URL embutido. O p5.js roda isolado em iframe sandbox.</span></div></div>
            <div className="theme-grid"><div className="lab-field"><label>Tipo</label><select value={projectDraft.interactive?.type||'none'} onChange={e=>setProjectDraft({...projectDraft,interactive:{...(projectDraft.interactive||{}),type:e.target.value as 'none'|'p5'|'iframe',height:projectDraft.interactive?.height||520,position:projectDraft.interactive?.position||'after-text'}})}><option value="none">Sem interatividade</option><option value="p5">p5.js — colar código</option><option value="iframe">Embed por URL / iframe</option></select></div><div className="lab-field"><label>Posição</label><select value={projectDraft.interactive?.position||'after-text'} onChange={e=>setProjectDraft({...projectDraft,interactive:{...(projectDraft.interactive||{type:'none'}),position:e.target.value as 'before-text'|'after-text'|'after-gallery'}})}><option value="before-text">Antes do texto</option><option value="after-text">Depois do texto</option><option value="after-gallery">Depois da galeria</option></select></div><div className="lab-field"><label>Altura — {projectDraft.interactive?.height||520}px</label><input type="range" min="240" max="1000" step="10" value={projectDraft.interactive?.height||520} onChange={e=>setProjectDraft({...projectDraft,interactive:{...(projectDraft.interactive||{type:'none'}),height:Number(e.target.value)}})}/></div></div>
            {projectDraft.interactive?.type==='p5'&&<div className="lab-field"><label>Código p5.js</label><textarea className="code-editor" rows={16} value={projectDraft.interactive.p5Code||''} onChange={e=>setProjectDraft({...projectDraft,interactive:{...projectDraft.interactive,p5Code:e.target.value}})} placeholder={'function setup() {\n  createCanvas(600, 400);\n}\n\nfunction draw() {\n  background(240);\n  circle(mouseX, mouseY, 40);\n}'}/><small>Cole somente o JavaScript do sketch. Não precisa inserir &lt;script&gt; nem importar p5.js.</small></div>}
            {projectDraft.interactive?.type==='iframe'&&<div className="lab-field"><label>URL para incorporar</label><input type="url" value={projectDraft.interactive.url||''} onChange={e=>setProjectDraft({...projectDraft,interactive:{...projectDraft.interactive,url:e.target.value}})} placeholder="https://..."/><small>Alguns sites bloqueiam iframe. Quando isso acontecer, mantenha também o Link principal do projeto.</small></div>}
            {projectDraft.interactive?.type!=='none'&&<div className="lab-field"><label>Título acessível do embed</label><input value={projectDraft.interactive?.title||''} onChange={e=>setProjectDraft({...projectDraft,interactive:{...(projectDraft.interactive||{type:'none'}),title:e.target.value}})} placeholder="Ex.: Experimento generativo do projeto"/></div>}
          </div>
          <label className="lab-check"><input type="checkbox" checked={projectDraft.published} onChange={e=>setProjectDraft({...projectDraft,published:e.target.checked})}/> Projeto público</label><label className="lab-check"><input type="checkbox" checked={projectDraft.featured} onChange={e=>setProjectDraft({...projectDraft,featured:e.target.checked})}/> Projeto destacado</label>
        </div><div className="dashboard-actions"><button className="lab-primary" disabled={busy} type="submit"><Save size={17}/> Salvar projeto</button><button className="lab-secondary" type="button" onClick={()=>setProjectDraft(null)}>Cancelar</button>{projectDraft.id&&<button className="lab-secondary lab-danger" type="button" onClick={()=>removeProject(projectDraft.id)}><Trash2 size={16}/> Excluir</button>}</div></form>}
      </>}

      {tab==='students'&&isAdmin&&<>
        <form className="dashboard-card" onSubmit={createInvite}><p className="lab-label" style={{color:'#86EFAC'}}>ADMINISTRAÇÃO • NOVO PORTFÓLIO</p><h2>Cadastrar novo estudante</h2><p className="dashboard-help">É aqui que nasce um novo portfólio. Você autoriza o e-mail; o estudante abre o convite, cria a própria senha e o sistema cria automaticamente um portfólio independente para ele.</p><div className="lab-form-grid"><div className="lab-field"><label>Nome (opcional)</label><input value={newInvite.suggestedName} onChange={e=>setNewInvite({...newInvite,suggestedName:e.target.value})}/></div><div className="lab-field"><label>E-mail autorizado</label><input required type="email" value={newInvite.email} onChange={e=>setNewInvite({...newInvite,email:e.target.value})}/></div></div><div className="dashboard-actions"><button className="lab-primary" disabled={busy||students.length+invites.length>=5}><UserPlus size={17}/> Criar convite / novo portfólio</button><button className="lab-secondary" type="button" onClick={refreshStudents}><UsersRound size={16}/> Atualizar</button></div>{lastInviteUrl&&<div className="lab-message" style={{marginTop:16,wordBreak:'break-all'}}><strong>Link de teste:</strong><br/><a className="lab-text-link" href={lastInviteUrl}>{lastInviteUrl}</a></div>}</form>
        <div className="dashboard-card"><p className="lab-label" style={{color:'#F48A79'}}>AGUARDANDO CADASTRO</p><h2>Convites pendentes</h2><div className="dashboard-list">{invites.length===0&&<div className="lab-empty">Nenhum convite pendente.</div>}{invites.map(invite=><div className="dashboard-row" key={invite.id}><div><div className="dashboard-row-title">{invite.suggestedName||'Estudante convidado'}</div><div className="dashboard-row-sub">{invite.email}</div></div><div className="dashboard-actions" style={{marginTop:0}}><button className="lab-secondary" onClick={()=>resendInvite(invite)}><Send size={14}/> Reenviar</button><button className="lab-secondary lab-danger" onClick={()=>cancelInvite(invite)}><Trash2 size={14}/> Cancelar</button></div></div>)}</div></div>
        <div className="dashboard-card"><p className="lab-label" style={{color:'#D2A979'}}>CONTAS ATIVAS</p><h2>Estudantes</h2><div className="dashboard-list">{students.length===0&&<div className="lab-empty">Nenhum estudante cadastrado.</div>}{students.map(student=><div className="dashboard-row" key={student.id}><div><div className="dashboard-row-title">{student.displayName}</div><div className="dashboard-row-sub">{student.email} • /portfolio/{student.slug}</div></div><div className="dashboard-actions" style={{marginTop:0}}>{student.emailVerified?<span className="dashboard-badge"><CheckCircle2 size={13}/> validada</span>:<button className="lab-secondary" onClick={()=>hubApi.resendVerification(student.id).then(()=>setMessage('Validação reenviada.')).catch(e=>setError(e.message))}><Send size={14}/> reenviar validação</button>}<button className="lab-secondary" onClick={()=>chooseStudent(student)}>Editar</button><button className="lab-secondary lab-danger" onClick={()=>deleteStudent(student)}><Trash2 size={14}/> Excluir</button></div></div>)}</div></div>
      </>}

      {tab==='account'&&<form className="dashboard-card" onSubmit={changePassword}><p className="lab-label" style={{color:'#D2A979'}}>SEGURANÇA • {isAdmin?'ADMINISTRADORA':'ESTUDANTE'}</p><h2>Alterar senha</h2><p className="dashboard-help">Você está alterando a senha da conta <strong>{user?.email}</strong>{isAdmin?' — a conta da professora.':' — somente a sua conta de estudante.'}</p><div className="lab-form-grid"><div className="lab-field"><label>Senha atual</label><input type="password" required value={passwords.current} onChange={e=>setPasswords({...passwords,current:e.target.value})}/></div><div className="lab-field"><label>Nova senha</label><input type="password" minLength={8} required value={passwords.next} onChange={e=>setPasswords({...passwords,next:e.target.value})}/></div><div className="lab-field"><label>Repetir nova senha</label><input type="password" minLength={8} required value={passwords.confirm} onChange={e=>setPasswords({...passwords,confirm:e.target.value})}/></div></div><div className="dashboard-actions"><button className="lab-primary" disabled={busy}><KeyRound size={17}/> Alterar senha</button></div></form>}

      {tab==='system'&&isAdmin&&<div className="dashboard-card"><p className="lab-label" style={{color:systemReady?'#86EFAC':'#F48A79'}}>INFRAESTRUTURA</p><h2>Integrações</h2><p className="dashboard-help">O design system dos alunos fica no Neon como JSON de tokens; as imagens continuam no Cloudinary.</p><div className="integration-grid"><IntegrationStatus name="Neon" description="contas, conteúdo e design systems" ready={Boolean(health?.configured)}/><IntegrationStatus name="Cloudinary" description="imagens e galerias" ready={Boolean(health?.storageConfigured)}/><IntegrationStatus name={health?.mailProvider==='brevo'?'Brevo':'Resend'} description="validação e recuperação" ready={Boolean(health?.emailConfigured)}/></div><div className="dashboard-actions"><button className="lab-secondary" onClick={refreshHealth}><Settings2 size={16}/> Verificar novamente</button></div>{selectedStudent&&<div className="lab-message" style={{marginTop:18}}>Em edição: <strong>{selectedStudent.displayName}</strong>.</div>}</div>}

    </div></div>
  </div></section></main></div>;
}

function IntegrationStatus({name,description,ready}:{name:string;description:string;ready:boolean}){return <div className={`integration-status ${ready?'ready':'pending'}`}><div className="integration-icon">{ready?<CheckCircle2 size={22}/>:<CircleAlert size={22}/>}</div><div><strong>{name}</strong><span>{description}</span></div><small>{ready?'ATIVO':'PENDENTE'}</small></div>}
