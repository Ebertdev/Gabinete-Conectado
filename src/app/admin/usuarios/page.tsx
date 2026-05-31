'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, ShieldCheck, UserPlus, Trash2, Mail, User, X } from 'lucide-react';
import { supabase } from '@/infrastructure/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type GabineteUser = {
  id: string;
  nome: string;
  email: string;
  role: string;
};

function getErrorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Erro inesperado.';
}

export default function UsuariosPage() {
  const { profile } = useAuth();
  const gabineteId = profile?.gabinete_id;
  const [users, setUsers] = useState<GabineteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', role: 'Assessor' });

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
        .select('id, nome, email, role')
        .eq('gabinete_id', gabineteId)
        .order('nome', { ascending: true });

      if (error) throw error;
      setUsers((data || []) as GabineteUser[]);
    } catch (err) {
      console.error('Erro ao carregar usuários:', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [gabineteId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, [loadUsers]);

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
        });
        if (insertErr) throw insertErr;
      }

      setIsModalOpen(false);
      setForm({ nome: '', email: '', role: 'Assessor' });
      await loadUsers();
      alert('Usuário convidado com sucesso!');
    } catch (err) {
      alert('Erro ao convidar usuário: ' + getErrorMessage(err));
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!profile?.id || userId === profile.id) {
      alert('Você não pode remover sua própria conta.');
      return;
    }

    if (!window.confirm('Tem certeza que deseja remover este usuário?')) return;

    try {
      const { error } = await supabase.from('usuarios').delete().eq('id', userId);
      if (error) throw error;
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      alert('Erro ao remover usuário: ' + getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600" /> Usuários do Gabinete
          </h1>
          <p className="text-gray-500 mt-1">Gerencie os acessos vinculados ao seu gabinete.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          <UserPlus className="w-4 h-4 text-emerald-400" /> Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center gap-3 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span className="text-sm font-medium">Carregando usuários...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Nenhum usuário encontrado neste gabinete.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map(user => (
              <div key={user.id} className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                    {user.nome?.charAt(0) || <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{user.nome}</p>
                    <p className="text-sm text-gray-500 truncate flex items-center gap-1.5">
                      <Mail className="w-4 h-4" /> {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${user.role === 'Administrador' ? 'bg-blue-100 text-blue-700' : user.role === 'Parlamentar' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'}`}>
                    {user.role}
                  </span>
                  {user.id !== profile?.id && (
                    <button
                      onClick={() => handleRemove(user.id)}
                      className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remover usuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Novo Usuário</h2>
              <button
                onClick={() => setIsModalOpen(false)}
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
                  placeholder="Ex: João Silva"
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cargo</label>
                <select
                  value={form.role}
                  onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-emerald-500"
                >
                  <option value="Assessor">Assessor</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Parlamentar">Parlamentar</option>
                </select>
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
    </div>
  );
}
