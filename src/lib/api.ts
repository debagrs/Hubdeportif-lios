import type { GoogleFontItem, PortfolioDetail, PortfolioSummary, Project, SessionUser, StudentAccount, StudentInvite } from '../types';

const endpoint = (action: string, params?: Record<string, string>) => {
  const search = new URLSearchParams({ action, ...(params || {}) });
  return `/api/backend?${search.toString()}`;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    ...init,
    headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'Não foi possível concluir a solicitação.');
  return data as T;
}

const MAX_SERVER_IMAGE_BYTES = 2_200_000;

async function imageToWebp(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file;
  try {
    const bitmap = await createImageBitmap(file);
    let width = bitmap.width;
    let height = bitmap.height;
    const maxSide = 1800;
    const firstScale = Math.min(1, maxSide / Math.max(width, height));
    width = Math.max(1, Math.round(width * firstScale));
    height = Math.max(1, Math.round(height * firstScale));
    let quality = 0.84;
    let blob: Blob | null = null;

    for (let attempt = 0; attempt < 7; attempt++) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { alpha: true });
      if (!context) break;
      context.drawImage(bitmap, 0, 0, width, height);
      blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob && blob.size <= MAX_SERVER_IMAGE_BYTES) break;
      quality = Math.max(0.56, quality - 0.07);
      if (attempt >= 3) {
        width = Math.max(1, Math.round(width * 0.82));
        height = Math.max(1, Math.round(height * 0.82));
      }
    }
    bitmap.close?.();
    if (!blob) throw new Error('Não foi possível converter a imagem.');
    if (blob.size > MAX_SERVER_IMAGE_BYTES) throw new Error('A imagem continua muito grande após a otimização automática.');
    const stem = file.name.replace(/\.[^.]+$/, '') || 'imagem';
    return new File([blob], `${stem}.webp`, { type: 'image/webp', lastModified: Date.now() });
  } catch (error) {
    if (file.size <= MAX_SERVER_IMAGE_BYTES && ['image/jpeg','image/png','image/webp','image/avif'].includes(file.type)) return file;
    throw error instanceof Error ? error : new Error('Não foi possível preparar a imagem para envio.');
  }
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise<string>((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Não foi possível ler a imagem.'));
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });
}

type UploadKind = 'avatar'|'hero'|'cover'|'gallery'|'custom-icon'|'pdf';

async function uploadAsset(file: File, kind: UploadKind, portfolioId?: string) {
  const prepared = ['avatar','hero','cover','gallery'].includes(kind) ? await imageToWebp(file) : file;
  const ticket = await request<{ uploadUrl:string; apiKey:string; signature:string; uploadParams:Record<string,string|number>; resourceType:string }>(endpoint('sign-upload'), {
    method:'POST', body:JSON.stringify({ filename:prepared.name, contentType:prepared.type, size:prepared.size, kind, portfolioId }),
  });
  const form = new FormData();
  form.append('file',prepared);
  form.append('api_key',ticket.apiKey);
  form.append('signature',ticket.signature);
  Object.entries(ticket.uploadParams || {}).forEach(([key,value])=>form.append(key,String(value)));

  let upload: Response;
  try {
    upload = await fetch(ticket.uploadUrl,{method:'POST',body:form});
  } catch {
    throw new Error('O navegador não conseguiu alcançar o Cloudinary. Verifique a conexão e a configuração do Cloudinary na Vercel.');
  }
  const result = await upload.json().catch(()=>({} as any));
  if(!upload.ok || !result?.secure_url) {
    const detail = result?.error?.message || result?.message || `HTTP ${upload.status}`;
    throw new Error(`Falha no Cloudinary: ${detail}`);
  }
  const url=String(result.secure_url || '');
  if(!url.startsWith('https://res.cloudinary.com/')) throw new Error('O Cloudinary respondeu, mas não devolveu uma URL pública de imagem válida.');
  return url;
}

async function uploadImageThroughBackend(file: File, kind: 'avatar'|'hero'|'cover'|'gallery', portfolioId?: string, projectId?: string) {
  const prepared = await imageToWebp(file);
  if (prepared.size > MAX_SERVER_IMAGE_BYTES) throw new Error('A foto ficou grande demais para o envio.');
  const dataUrl = await fileToDataUrl(prepared);
  return request<{url:string;portfolio?:PortfolioDetail;project?:Project}>(endpoint('upload-image'), {
    method:'POST',
    body:JSON.stringify({
      filename:prepared.name,
      contentType:prepared.type,
      size:prepared.size,
      kind,
      portfolioId,
      projectId,
      dataUrl,
    }),
  });
}

export const hubApi = {
  health: () => request<{ ok:boolean; configured:boolean; adminConfigured?:boolean; adminReady?:boolean; emailConfigured:boolean; storageConfigured:boolean; storageVerified?:boolean; storageStatus?:string; mailProvider:string }>(endpoint('health')),
  getPublicPortfolios: () => request<{ portfolios:PortfolioSummary[]; configured:boolean }>(endpoint('public-portfolios')),
  getPublicPortfolio: (slug:string) => request<{ portfolio:PortfolioDetail|null; configured:boolean }>(endpoint('public-portfolio',{slug})),
  session: () => request<{ authenticated:boolean; user:SessionUser|null }>(endpoint('session')),
  login: (email:string,password:string,expectedRole?:'admin'|'student') => request<{user:SessionUser}>(endpoint('login'),{method:'POST',body:JSON.stringify({email,password,expectedRole})}),
  logout: () => request<{ok:true}>(endpoint('logout'),{method:'POST',body:'{}'}),
  forgotPassword: (email:string) => request<{ok:true;message:string}>(endpoint('forgot-password'),{method:'POST',body:JSON.stringify({email})}),
  resetPassword: (token:string,password:string) => request<{ok:true}>(endpoint('reset-password'),{method:'POST',body:JSON.stringify({token,password})}),
  verifyEmail: (token:string) => request<{ok:true}>(endpoint('verify-email'),{method:'POST',body:JSON.stringify({token})}),
  getInviteInfo: (token:string) => request<{email:string;suggestedName:string;expiresAt:string}>(endpoint('invite-info',{token})),
  requestRegistrationLink: (email:string) => request<{ok:true;message:string}>(endpoint('request-registration-link'),{method:'POST',body:JSON.stringify({email})}),
  register: (payload:{token:string;displayName:string;slug:string;password:string}) => request<{ok:true;user:SessionUser;portfolioSlug:string}>(endpoint('register'),{method:'POST',body:JSON.stringify(payload)}),
  changePassword: (currentPassword:string,newPassword:string) => request<{ok:true}>(endpoint('change-password'),{method:'POST',body:JSON.stringify({currentPassword,newPassword})}),
  getMyPortfolio: (studentUserId?:string) => request<{portfolio:PortfolioDetail|null}>(endpoint('my-portfolio',studentUserId?{userId:studentUserId}:undefined)),
  saveMyPortfolio: (portfolio:Partial<PortfolioDetail>,studentUserId?:string) => request<{portfolio:PortfolioDetail}>(endpoint('my-portfolio',studentUserId?{userId:studentUserId}:undefined),{method:'PUT',body:JSON.stringify(portfolio)}),
  listMyProjects: (portfolioId?:string) => request<{projects:Project[]}>(endpoint('projects',portfolioId?{portfolioId}:undefined)),
  saveProject: (project:Partial<Project>) => request<{project:Project}>(endpoint('projects'),{method:'POST',body:JSON.stringify(project)}),
  deleteProject: (id:string) => request<{ok:true}>(endpoint('projects',{id}),{method:'DELETE'}),
  listStudents: () => request<{students:StudentAccount[]}>(endpoint('students')),
  deleteStudent: (id:string) => request<{ok:true}>(endpoint('students',{id}),{method:'DELETE'}),
  resendVerification: (userId:string) => request<{ok:true}>(endpoint('resend-verification'),{method:'POST',body:JSON.stringify({userId})}),
  listInvites: () => request<{invites:StudentInvite[]}>(endpoint('invites')),
  createInvite: (payload:{email:string;suggestedName?:string}) => request<{ok:true;emailSent:boolean;inviteUrl:string}>(endpoint('invites'),{method:'POST',body:JSON.stringify(payload)}),
  deleteInvite: (id:string) => request<{ok:true}>(endpoint('invites',{id}),{method:'DELETE'}),
  resendInvite: (id:string) => request<{ok:true}>(endpoint('resend-invite'),{method:'POST',body:JSON.stringify({id})}),
  listGoogleFonts: () => request<{fonts:GoogleFontItem[]}>(endpoint('font-catalog')),
  searchIcons: (q:string) => request<{icons:string[]}>(endpoint('icon-search',{q})),
  uploadImage: (file:File,kind:'avatar'|'hero'|'cover'|'gallery',portfolioId?:string,projectId?:string) => uploadImageThroughBackend(file,kind,portfolioId,projectId),
  uploadCustomIcon: (file:File,portfolioId?:string) => uploadAsset(file,'custom-icon',portfolioId),
  uploadPdf: (file:File,portfolioId?:string) => uploadAsset(file,'pdf',portfolioId),
};
