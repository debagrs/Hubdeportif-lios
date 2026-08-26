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

async function imageToWebp(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file;
  if (file.size <= 850_000 && file.type === 'image/webp') return file;
  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 2000;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d', { alpha: true }); if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height); bitmap.close?.();
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.84));
    if (!blob || blob.size >= file.size) return file;
    const stem = file.name.replace(/\.[^.]+$/, '') || 'imagem';
    return new File([blob], `${stem}.webp`, { type: 'image/webp', lastModified: Date.now() });
  } catch { return file; }
}

type UploadKind = 'avatar'|'hero'|'cover'|'gallery'|'custom-icon'|'pdf';

async function uploadAsset(file: File, kind: UploadKind, portfolioId?: string) {
  const prepared = ['avatar','hero','cover','gallery'].includes(kind) ? await imageToWebp(file) : file;
  const ticket = await request<{ uploadUrl:string; apiKey:string; timestamp:number; signature:string; folder:string; publicId:string; resourceType:string }>(endpoint('sign-upload'), {
    method:'POST', body:JSON.stringify({ filename:prepared.name, contentType:prepared.type, size:prepared.size, kind, portfolioId }),
  });
  const form = new FormData();
  form.append('file',prepared); form.append('api_key',ticket.apiKey); form.append('timestamp',String(ticket.timestamp)); form.append('signature',ticket.signature); form.append('folder',ticket.folder); form.append('public_id',ticket.publicId);
  const upload = await fetch(ticket.uploadUrl,{method:'POST',body:form});
  const result = await upload.json().catch(()=>({}));
  if(!upload.ok || !result?.secure_url) throw new Error(result?.error?.message || 'O Cloudinary não conseguiu receber o arquivo.');
  return String(result.secure_url);
}

export const hubApi = {
  health: () => request<{ ok:boolean; configured:boolean; emailConfigured:boolean; storageConfigured:boolean; mailProvider:string }>(endpoint('health')),
  getPublicPortfolios: () => request<{ portfolios:PortfolioSummary[]; configured:boolean }>(endpoint('public-portfolios')),
  getPublicPortfolio: (slug:string) => request<{ portfolio:PortfolioDetail|null; configured:boolean }>(endpoint('public-portfolio',{slug})),
  session: () => request<{ authenticated:boolean; user:SessionUser|null }>(endpoint('session')),
  login: (email:string,password:string) => request<{user:SessionUser}>(endpoint('login'),{method:'POST',body:JSON.stringify({email,password})}),
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
  uploadImage: (file:File,kind:'avatar'|'hero'|'cover'|'gallery',portfolioId?:string) => uploadAsset(file,kind,portfolioId),
  uploadCustomIcon: (file:File,portfolioId?:string) => uploadAsset(file,'custom-icon',portfolioId),
  uploadPdf: (file:File,portfolioId?:string) => uploadAsset(file,'pdf',portfolioId),
};
