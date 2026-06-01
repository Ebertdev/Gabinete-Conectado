export type Role = 'Administrador' | 'Assessor' | 'Parlamentar';
export type Plan = 'Essencial' | 'Inteligente' | 'Enterprise';

export type Permission =
  | 'view_citizens'
  | 'create_citizen'
  | 'edit_citizen'
  | 'delete_citizen'
  | 'export_citizens'
  | 'view_demands'
  | 'create_demand'
  | 'edit_demand'
  | 'assign_demand'
  | 'resolve_demand'
  | 'view_documents'
  | 'upload_document'
  | 'download_document'
  | 'delete_document'
  | 'generate_ai_document'
  | 'send_whatsapp'
  | 'send_email'
  | 'view_reports'
  | 'export_reports'
  | 'ai_reports'
  | 'manage_users'
  | 'manage_permissions'
  | 'manage_plans'
  | 'view_audit';

export type PermissionGroup = {
  id: string;
  label: string;
  description: string;
  permissions: Permission[];
};

export const PERMISSION_METADATA: Record<Permission, { label: string; description: string; group: string }> = {
  view_citizens: { label: 'Visualizar cidadãos', description: 'Permite acessar a lista e os dados cadastrais.', group: 'Cidadãos' },
  create_citizen: { label: 'Criar cidadão', description: 'Permite cadastrar novos cidadãos no CRM.', group: 'Cidadãos' },
  edit_citizen: { label: 'Editar cidadão', description: 'Permite atualizar informações de cadastro.', group: 'Cidadãos' },
  delete_citizen: { label: 'Excluir cidadão', description: 'Permite remover registros de cidadãos.', group: 'Cidadãos' },
  export_citizens: { label: 'Exportar cidadãos', description: 'Permite exportar dados do CRM em arquivo.', group: 'Cidadãos' },
  view_demands: { label: 'Visualizar demandas', description: 'Permite abrir e acompanhar solicitações.', group: 'Demandas' },
  create_demand: { label: 'Criar demanda', description: 'Permite registrar novas demandas.', group: 'Demandas' },
  edit_demand: { label: 'Editar demanda', description: 'Permite ajustar dados de uma demanda.', group: 'Demandas' },
  assign_demand: { label: 'Atribuir demanda', description: 'Permite encaminhar demandas para responsáveis.', group: 'Demandas' },
  resolve_demand: { label: 'Resolver demanda', description: 'Permite concluir demandas no fluxo.', group: 'Demandas' },
  view_documents: { label: 'Visualizar documentos', description: 'Permite acessar o cofre e os arquivos.', group: 'Documentos' },
  upload_document: { label: 'Enviar documento', description: 'Permite fazer upload de novos arquivos.', group: 'Documentos' },
  download_document: { label: 'Baixar documento', description: 'Permite baixar documentos armazenados.', group: 'Documentos' },
  delete_document: { label: 'Excluir documento', description: 'Permite remover arquivos do cofre.', group: 'Documentos' },
  generate_ai_document: { label: 'Gerar documento com IA', description: 'Permite usar a redação assistida para peças oficiais.', group: 'Documentos' },
  send_whatsapp: { label: 'Enviar WhatsApp', description: 'Permite enviar notificações pelo WhatsApp.', group: 'Comunicação' },
  send_email: { label: 'Enviar e-mail', description: 'Permite disparar mensagens por e-mail.', group: 'Comunicação' },
  view_reports: { label: 'Visualizar relatórios', description: 'Permite acessar dashboards e painéis.', group: 'Relatórios' },
  export_reports: { label: 'Exportar relatórios', description: 'Permite exportar relatórios e indicadores.', group: 'Relatórios' },
  ai_reports: { label: 'Relatórios com IA', description: 'Permite usar recursos analíticos assistidos.', group: 'Relatórios' },
  manage_users: { label: 'Gerenciar usuários', description: 'Permite convidar, remover e administrar usuários.', group: 'Administração' },
  manage_permissions: { label: 'Gerenciar permissões', description: 'Permite alterar permissões unitárias por usuário.', group: 'Administração' },
  manage_plans: { label: 'Gerenciar planos', description: 'Permite administrar o plano do gabinete.', group: 'Administração' },
  view_audit: { label: 'Ver auditoria', description: 'Permite consultar trilhas de auditoria e logs.', group: 'Administração' },
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'citizens',
    label: 'Cidadãos',
    description: 'Controle do cadastro e das operações de CRM.',
    permissions: ['view_citizens', 'create_citizen', 'edit_citizen', 'delete_citizen', 'export_citizens'],
  },
  {
    id: 'demands',
    label: 'Demandas',
    description: 'Fluxo de solicitações, triagem e conclusão.',
    permissions: ['view_demands', 'create_demand', 'edit_demand', 'assign_demand', 'resolve_demand'],
  },
  {
    id: 'documents',
    label: 'Documentos',
    description: 'Cofre, upload e geração de peças.',
    permissions: ['view_documents', 'upload_document', 'download_document', 'delete_document', 'generate_ai_document'],
  },
  {
    id: 'communication',
    label: 'Comunicação',
    description: 'Envios automáticos e mensagens diretas.',
    permissions: ['send_whatsapp', 'send_email'],
  },
  {
    id: 'reports',
    label: 'Relatórios',
    description: 'Painéis, exportações e análises.',
    permissions: ['view_reports', 'export_reports', 'ai_reports'],
  },
  {
    id: 'admin',
    label: 'Administração',
    description: 'Permissões de gestão do gabinete.',
    permissions: ['manage_users', 'manage_permissions', 'manage_plans', 'view_audit'],
  },
];

export const ALL_PERMISSIONS = Object.keys(PERMISSION_METADATA) as Permission[];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Administrador: [
    'view_citizens',
    'create_citizen',
    'edit_citizen',
    'delete_citizen',
    'export_citizens',
    'view_demands',
    'create_demand',
    'edit_demand',
    'assign_demand',
    'resolve_demand',
    'view_documents',
    'upload_document',
    'download_document',
    'delete_document',
    'generate_ai_document',
    'send_whatsapp',
    'send_email',
    'view_reports',
    'export_reports',
    'ai_reports',
    'manage_users',
    'manage_permissions',
    'manage_plans',
    'view_audit',
  ],
  Assessor: [
    'view_citizens',
    'create_citizen',
    'edit_citizen',
    'view_demands',
    'create_demand',
    'edit_demand',
    'assign_demand',
    'resolve_demand',
    'view_documents',
    'upload_document',
    'download_document',
    'send_whatsapp',
    'send_email',
    'view_reports',
  ],
  Parlamentar: [
    'view_citizens',
    'view_demands',
    'view_documents',
    'download_document',
    'view_reports',
    'export_reports',
  ],
};

export const PLAN_LIMITS: Record<Plan, { maxCitizens: number; maxWhatsapp: number }> = {
  Essencial: { maxCitizens: 5000, maxWhatsapp: 100 },
  Inteligente: { maxCitizens: 10000, maxWhatsapp: 3000 },
  Enterprise: { maxCitizens: Infinity, maxWhatsapp: Infinity },
};

export const PLAN_PERMISSIONS: Record<Plan, Permission[]> = {
  Essencial: [
    'view_citizens',
    'create_citizen',
    'edit_citizen',
    'delete_citizen',
    'view_demands',
    'create_demand',
    'edit_demand',
    'view_documents',
    'download_document',
    'send_whatsapp',
    'send_email',
    'view_reports',
    'manage_users',
    'manage_permissions',
  ],
  Inteligente: [
    'view_citizens',
    'create_citizen',
    'edit_citizen',
    'delete_citizen',
    'export_citizens',
    'view_demands',
    'create_demand',
    'edit_demand',
    'assign_demand',
    'resolve_demand',
    'view_documents',
    'upload_document',
    'download_document',
    'delete_document',
    'generate_ai_document',
    'send_whatsapp',
    'send_email',
    'view_reports',
    'export_reports',
    'ai_reports',
    'manage_users',
    'manage_permissions',
  ],
  Enterprise: ALL_PERMISSIONS,
};

export const getPlanPermissions = (plan: Plan | undefined): Permission[] => {
  return PLAN_PERMISSIONS[plan || 'Essencial'] || PLAN_PERMISSIONS.Essencial;
};

export const getAllowedPermissionsSet = (plan: Plan | undefined): Set<Permission> => {
  return new Set(getPlanPermissions(plan));
};

export const normalizePermissions = (permissions: unknown): Permission[] => {
  if (!Array.isArray(permissions)) return [];

  const seen = new Set<Permission>();
  for (const permission of permissions) {
    if (typeof permission !== 'string') continue;
    if ((ALL_PERMISSIONS as string[]).includes(permission) && !seen.has(permission as Permission)) {
      seen.add(permission as Permission);
    }
  }

  return Array.from(seen);
};

export const getDefaultPermissionsForRole = (userRole: Role | undefined, plan: Plan | undefined): Permission[] => {
  if (!userRole) return [];
  const allowed = getAllowedPermissionsSet(plan);
  return (ROLE_PERMISSIONS[userRole] || []).filter(permission => allowed.has(permission)) as Permission[];
};

export const getPermissionLabel = (permission: Permission) => PERMISSION_METADATA[permission].label;
export const getPermissionDescription = (permission: Permission) => PERMISSION_METADATA[permission].description;
export const getPermissionGroup = (permission: Permission) => PERMISSION_METADATA[permission].group;

export const hasPermission = (userRole: Role | undefined, permission: string): boolean => {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole]?.includes(permission as Permission) || false;
};
