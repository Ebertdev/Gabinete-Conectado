export type Role = 'Administrador' | 'Assessor' | 'Parlamentar';
export type Plan = 'Essencial' | 'Inteligente' | 'Enterprise';

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  Administrador: [
    'view_citizens', 'create_citizen', 'edit_citizen', 'delete_citizen', 'export_citizens',
    'view_demands', 'create_demand', 'edit_demand', 'assign_demand', 'resolve_demand',
    'view_documents', 'upload_document', 'download_document', 'delete_document', 'generate_ai_document',
    'send_whatsapp', 'send_email',
    'view_reports', 'export_reports', 'ai_reports',
    'manage_users', 'manage_permissions', 'manage_plans', 'view_audit'
  ],
  Assessor: [
    'view_citizens', 'create_citizen', 'edit_citizen',
    'view_demands', 'create_demand', 'edit_demand', 'assign_demand', 'resolve_demand',
    'view_documents', 'upload_document', 'download_document',
    'send_whatsapp', 'send_email',
    'view_reports'
  ],
  Parlamentar: [
    'view_citizens',
    'view_demands',
    'view_documents', 'download_document',
    'view_reports', 'export_reports'
  ]
};

export const PLAN_LIMITS: Record<Plan, { maxCitizens: number, maxWhatsapp: number }> = {
  Essencial: { maxCitizens: 5000, maxWhatsapp: 100 },
  Inteligente: { maxCitizens: 10000, maxWhatsapp: 3000 },
  Enterprise: { maxCitizens: Infinity, maxWhatsapp: Infinity }
};

export const hasPermission = (userRole: Role | undefined, permission: string): boolean => {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};
