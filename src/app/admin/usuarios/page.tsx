'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  ShieldCheck,
  UserPlus,
  Trash2,
  Mail,
  User,
  X,
  Edit3,
  Lock,
  Check,
  Shield,
} from 'lucide-react';
import { supabase } from '@/infrastructure/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  ALL_PERMISSIONS,
  PERMISSION_GROUPS,
  Permission,
  Plan,
  Role,
  getAllowedPermissionsSet,
  getDefaultPermissionsForRole,
  getPermissionDescription,
  getPermissionLabel,
  normalizePermissions,
} from '@/utils/permissions';

type GabineteUser = {
  id: string;
  nome: string;
  email: string;
  role: Role;
  permissions: Permission[] | null;
};

type PermissionDraft = {
  role: Role;
  permissions: Permission[];
};

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Erro inesperado.';
}

function uniqPermissions(permissions: Permission[]) {
  return Array.from(new Set(permissions.filter(permission => ALL_PERMISSIONS.includes(permission))));
}

export default function UsuariosPage() {
  const { profile } = useAuth();
  const gabineteId = profile?.gabinete_id;
  const currentPlan = (profile?.gabinete_plano || 'Essencial') as Plan;
  const allowedPermissions = useMemo(() => getAllowedPermissionsSet(currentPlan), [currentPlan]);

  const [users, setUsers] = useState<GabineteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<GabineteUser | null>(null);
  const [permissionDraft, setPermissionDraft] = useState<PermissionDraft>({ role: 'Assessor', permissions: [] });
  const [form, setForm] = useState({ nome: '', email: '', role: 'Assessor' as Role });

  const loadUsers = useCallback(async () => {
    if (!gabineteId) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, role, permissions')
        .eq('gabinete_id', gabineteId)
        .order('nome', { ascending: true });

      if (error) throw error;

      const normalized = (data || []).map(row => ({
        ...row,
        role: row.role === 'Administrador' || row.role === 'Parlamentar' ? row.role : 'Assessor',
        permissions: row.permissions === null || row.permissions === undefined ? null : normalizePermissions(row.permissions),
      })) as GabineteUser[];

      setUsers(normalized);
    } catch (err) {
      console.error('Erro ao carregar usuarios:', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [gabineteId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [loadUsers]);

  const resetInviteForm = () => {
    setForm({ nome: '', email: '', role: 'Assessor' });
  };

  const openInviteModal = () => {
    resetInviteForm();
    setIsInviteModalOpen(true);
  };

  const openPermissionEditor = (user: GabineteUser) => {
    const currentPermissions =
      user.permissions === null
        ? getDefaultPermissionsForRole(user.role, currentPlan)
        : normalizePermissions(user.permissions);

    setEditingUser(user);
    setPermissionDraft({
      role: user.role,
      permissions: uniqPermissions(currentPermissions.filter(permission => allowedPermissions.has(permission))),
    });
  };

  const closePermissionEditor = () => {
    setEditingUser(null);
    setPermissionDraft({ role: 'Assessor', permissions: [] });
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gabineteId) return;

    setInviting(true);
    try {
      const { error } = await supabase.auth.admin.inviteUserByEmail(form.email, {
        data: {
          full_name: form.nome,
          role: form.role,
          gabinete_id: gabineteId,
        },
      });

      if (error) {
        const { error: insertErr } = await supabase.from('usuarios').insert({
          id: crypto.randomUUID(),
          email: form.email,
          nome: form.nome,
          role: form.role,
          gabinete_id: gabineteId,
          permissions: null,
        });
        if (insertErr) throw insertErr;
      }

      setIsInviteModalOpen(false);
      resetInviteForm();
      await loadUsers();
      alert('Usuario convidado com sucesso!');
    } catch (err) {
      alert('Erro ao convidar usuario: ' + getErrorMessage(err));
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!profile?.id || userId === profile.id) {
      alert('Voce nao pode remover sua propria conta.');
      return;
    }

    if (!window.confirm('Tem certeza que deseja remover este usuario?')) return;

    try {
      const { error } = await supabase.from('usuarios').delete().eq('id', userId);
      if (error) throw error;
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      alert('Erro ao remover usuario: ' + getErrorMessage(err));
    }
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !gabineteId) return;

    setSavingPermissions(true);
    try {
      const sanitizedPermissions = uniqPermissions(
        permissionDraft.permissions.filter(permission => allowedPermissions.has(permission))
      );

      const { error } = await supabase
        .from('usuarios')
        .update({
          role: permissionDraft.role,
          permissions: sanitizedPermissions,
        })
        .eq('id', editingUser.id)
        .eq('gabinete_id', gabineteId);

      if (error) throw error;

      setUsers(prev =>
        prev.map(user =>
          user.id === editingUser.id
            ? {
                ...user,
                role: permissionDraft.role,
                permissions: sanitizedPermissions,
              }
            : user
        )
      );

      closePermissionEditor();
      await loadUsers();
      alert('Permissoes atualizadas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar permissoes: ' + getErrorMessage(err));
    } finally {
      setSavingPermissions(false);
    }
  };

  const handleRoleChange = (nextRole: Role) => {
    const defaults = getDefaultPermissionsForRole(nextRole, currentPlan);
    setPermissionDraft({
      role: nextRole,
      permissions: uniqPermissions(defaults.filter(permission => allowedPermissions.has(permission))),
    });
  };

  const setAllAvailablePermissions = () => {
    setPermissionDraft(prev => ({
      ...prev,
      permissions: uniqPermissions(Array.from(allowedPermissions)),
    }));
  };

  const setRoleDefaults = () => {
    setPermissionDraft(prev => ({
      ...prev,
      permissions: uniqPermissions(
        getDefaultPermissionsForRole(prev.role, currentPlan).filter(permission => allowedPermissions.has(permission))
      ),
    }));
  };

  const togglePermission = (permission: Permission) => {
    if (!allowedPermissions.has(permission)) return;

    setPermissionDraft(prev => {
      const isSelected = prev.permissions.includes(permission);
      return {
        ...prev,
        permissions: isSelected
          ? prev.permissions.filter(item => item !== permission)
          : [...prev.permissions, permission],
      };
    });
  };

  const permissionCount = permissionDraft.permissions.length;
  const allowedCount = allowedPermissions.size;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-600" /> Usuarios do Gabinete
            </h1>
            <p className="text-gray-500 mt-1">
              Gerencie acessos, papeis e permissões unitarias vinculadas ao seu gabinete.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" /> Plano {currentPlan}
            </span>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold uppercase tracking-wider">
              {allowedCount} permissões liberadas neste plano
            </span>
          </div>
        </div>

        <button
          onClick={openInviteModal}
          className="bg-gray-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm w-full md:w-auto justify-center"
        >
          <UserPlus className="w-4 h-4 text-emerald-400" /> Novo Usuario
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-3 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span className="text-sm font-medium">Carregando usuarios...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Nenhum usuario encontrado neste gabinete.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map(user => {
              const resolvedPermissions =
                user.permissions === null
                  ? getDefaultPermissionsForRole(user.role, currentPlan)
                  : normalizePermissions(user.permissions);

              return (
                <div key={user.id} className="p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black flex-shrink-0">
                      {user.nome?.charAt(0) || <User className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">{user.nome}</p>
                      <p className="text-sm text-gray-500 truncate flex items-center gap-1.5">
                        <Mail className="w-4 h-4" /> {user.email}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            user.role === 'Administrador'
                              ? 'bg-blue-100 text-blue-700'
                              : user.role === 'Parlamentar'
                                ? 'bg-violet-100 text-violet-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.role}
                        </span>
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {user.permissions === null ? 'Permissoes herdadas do papel' : `${resolvedPermissions.length} permissao(oes) ativas`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:items-end">
                    <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
                      {resolvedPermissions.slice(0, 4).map(permission => (
                        <span
                          key={permission}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-50 text-gray-600 border border-gray-200"
                          title={getPermissionDescription(permission)}
                        >
                          {getPermissionLabel(permission)}
                        </span>
                      ))}
                      {resolvedPermissions.length > 4 && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-900 text-white">
                          +{resolvedPermissions.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPermissionEditor(user)}
                        className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" /> Editar permissões
                      </button>
                      {user.id !== profile?.id && (
                        <button
                          onClick={() => handleRemove(user.id)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remover usuario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Novo Usuario</h2>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
                <input
                  required
                  value={form.nome}
                  onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-emerald-500"
                  placeholder="Ex: Joao Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-emerald-500"
                  placeholder="usuario@gabinete.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Papel inicial</label>
                <select
                  value={form.role}
                  onChange={e => setForm(prev => ({ ...prev, role: e.target.value as Role }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-emerald-500"
                >
                  <option value="Assessor">Assessor</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Parlamentar">Parlamentar</option>
                </select>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-600">
                As permissões iniciais seguirão o papel selecionado e o plano atual do gabinete.
              </div>

              <button
                type="submit"
                disabled={inviting}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {inviting ? 'Convidando...' : 'Convidar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Editar permissoes</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Ajuste o papel e as permissoes unitarias de {editingUser.nome}.
                </p>
              </div>
              <button
                onClick={closePermissionEditor}
                className="self-end sm:self-auto text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
                aria-label="Fechar editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePermissions} className="flex flex-col flex-1 min-h-0">
              <div className="p-4 sm:p-6 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Papel</label>
                  <select
                    value={permissionDraft.role}
                    onChange={e => handleRoleChange(e.target.value as Role)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="Assessor">Assessor</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Parlamentar">Parlamentar</option>
                  </select>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs uppercase tracking-wider font-bold text-gray-500">Plano atual</p>
                    <p className="text-lg font-black text-gray-900 mt-1">{currentPlan}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-xs uppercase tracking-wider font-bold text-emerald-600">Permissoes selecionadas</p>
                    <p className="text-lg font-black text-emerald-900 mt-1">{permissionCount}</p>
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-6 pt-5 pb-3 flex flex-wrap items-center gap-3 border-b border-gray-100">
                <button
                  type="button"
                  onClick={setRoleDefaults}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Aplicar padrao do papel
                </button>
                <button
                  type="button"
                  onClick={setAllAvailablePermissions}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-sm hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Liberar tudo do plano
                </button>
                <span className="text-xs text-gray-500 font-medium">
                  Permissoes fora do plano atual ficam bloqueadas automaticamente.
                </span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
                {PERMISSION_GROUPS.map(group => {
                  const groupPermissions = group.permissions.filter(permission => allowedPermissions.has(permission));
                  const lockedPermissions = group.permissions.filter(permission => !allowedPermissions.has(permission));

                  return (
                    <section key={group.id} className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{group.label}</h3>
                          <p className="text-sm text-gray-500">{group.description}</p>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          {groupPermissions.length}/{group.permissions.length} liberadas
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.permissions.map(permission => {
                          const enabled = allowedPermissions.has(permission);
                          const selected = permissionDraft.permissions.includes(permission);

                          return (
                            <label
                              key={permission}
                              className={`rounded-2xl border p-4 flex items-start gap-3 transition-colors ${
                                enabled
                                  ? 'cursor-pointer border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                                  : 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                disabled={!enabled}
                                onChange={() => togglePermission(permission)}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:cursor-not-allowed"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-gray-900">{getPermissionLabel(permission)}</span>
                                  {!enabled && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                      <Lock className="w-3 h-3" /> Plano insuficiente
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{getPermissionDescription(permission)}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      {lockedPermissions.length > 0 && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                          {lockedPermissions.length} permissao(oes) desta categoria exigem um plano superior.
                        </p>
                      )}
                    </section>
                  );
                })}
              </div>

              <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={closePermissionEditor}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingPermissions}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {savingPermissions ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  {savingPermissions ? 'Salvando...' : 'Salvar permissoes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
