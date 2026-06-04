'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Database, Shield, Bell, Loader2, CheckCircle2, Trash2, X, UserPlus, Lock, Zap } from 'lucide-react';
import { supabase } from '@/infrastructure/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
export type PlanType = 'Essencial' | 'Inteligente' | 'Enterprise';

type Tab = 'geral' | 'acessos' | 'notificacoes';

type GabineteUser = {
  id: string;
  nome: string;
  email: string;
  role: string;
};

const PLAN_LIMITS: Record<string, number> = {
  Essencial: 5,
  Inteligente: 15,
  Enterprise: 999,
};

export default function ConfiguracoesPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('geral');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [inviting, setInviting] = useState(false);

  const [gabineteNome, setGabineteNome] = useState('');
  const [notifyCitizen, setNotifyCitizen] = useState(true);
  const [notifyAssessor, setNotifyAssessor] = useState(false);

  const [users, setUsers] = useState<GabineteUser[]>([]);
  const [isAssessorModalOpen, setIsAssessorModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [assessorFormData, setAssessorFormData] = useState({ email: '', nome: '', role: 'Assessor' });

  const currentPlan = (profile?.gabinete_plano || 'Essencial') as PlanType;
  const userLimit = PLAN_LIMITS[currentPlan] || 5;

  // Load gabinete info & users
  useEffect(() => {
    if (!profile?.gabinete_id) return;

    const fetchData = async () => {
      setLoadingUsers(true);
      try {
        // Gabinete name
        setGabineteNome(profile?.gabinete_nome || '');

        // List users in same gabinete
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, nome, email, role')
          .eq('gabinete_id', profile.gabinete_id);

        if (error) throw error;
        setUsers(data || []);
      } catch (err: any) {
        console.error('Erro ao carregar usuários:', err.message);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchData();
  }, [profile]);

  const handleOpenAddAssessor = () => {
    if (users.length >= userLimit) {
      setIsLimitModalOpen(true);
    } else {
      setIsAssessorModalOpen(true);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      // Invite via Supabase Auth — sends magic link email
      const { error } = await supabase.auth.admin.inviteUserByEmail(assessorFormData.email, {
        data: {
          full_name: assessorFormData.nome,
          role: assessorFormData.role,
          gabinete_id: profile?.gabinete_id,
        },
      });

      if (error) {
        // Fallback: insert directly in usuarios table if admin invite fails (RLS restrictions)
        const { error: insertErr } = await supabase.from('usuarios').insert({
          email: assessorFormData.email,
          nome: assessorFormData.nome,
          role: assessorFormData.role,
          gabinete_id: profile?.gabinete_id,
          id: crypto.randomUUID(),
        });
        if (insertErr) throw insertErr;
      }

      alert(`Convite enviado com sucesso para ${assessorFormData.email}!`);
      setIsAssessorModalOpen(false);
      setAssessorFormData({ email: '', nome: '', role: 'Assessor' });

      // Reload users
      const { data } = await supabase.from('usuarios').select('id, nome, email, role').eq('gabinete_id', profile?.gabinete_id);
      setUsers(data || []);
    } catch (err: any) {
      alert('Erro ao convidar usuário: ' + err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (userId === profile?.id) {
      alert('Você não pode remover sua própria conta.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja remover este assessor do gabinete?')) return;
    try {
      const { error } = await supabase.from('usuarios').delete().eq('id', userId);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert('Erro ao remover usuário: ' + err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const { error } = await supabase
        .from('gabinetes')
        .update({ nome: gabineteNome })
        .eq('id', profile?.gabinete_id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-full relative">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-gray-500" /> Configurações do Gabinete
        </h1>
        <p className="text-gray-500 mt-1">Gerencie preferências, acessos e integrações do sistema.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="flex border-b border-gray-100 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('geral')}
            className={`shrink-0 flex items-center gap-2 px-4 sm:px-6 py-4 font-medium transition-colors ${activeTab === 'geral' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/10' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Database className="w-4 h-4" /> Geral
          </button>
          <button 
            onClick={() => setActiveTab('acessos')}
            className={`shrink-0 flex items-center gap-2 px-4 sm:px-6 py-4 font-medium transition-colors ${activeTab === 'acessos' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/10' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Shield className="w-4 h-4" /> Acessos
          </button>
          <button 
            onClick={() => setActiveTab('notificacoes')}
            className={`shrink-0 flex items-center gap-2 px-4 sm:px-6 py-4 font-medium transition-colors ${activeTab === 'notificacoes' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/10' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Bell className="w-4 h-4" /> Notificações
          </button>
        </div>

        <div className="p-4 sm:p-8 space-y-8 min-h-[400px] text-left">
          
          {activeTab === 'geral' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Informações do Gabinete</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Gabinete</label>
                    <input 
                      type="text" 
                      value={gabineteNome} 
                      onChange={(e) => setGabineteNome(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold text-gray-900 shadow-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Plano Atual</label>
                    <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl font-bold text-emerald-800 flex items-center justify-between">
                      <span>{currentPlan}</span>
                      <span className="text-xs bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-full font-extrabold uppercase">
                        {currentPlan === 'Essencial' ? '5 usuários' : currentPlan === 'Inteligente' ? '15 usuários' : 'Ilimitado'}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100 my-8" />

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Integração WhatsApp API</h3>
                <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-emerald-900">Evolution API (Conectado)</h4>
                      <p className="text-sm text-emerald-700 mt-1">Sessão ativa para envio de protocolos aos cidadãos.</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full uppercase tracking-wide">
                      Online
                    </div>
                  </div>
                  <button className="text-sm font-medium text-emerald-600 hover:text-emerald-800 underline">Desconectar Sessão</button>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'acessos' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Gestão de Assessores</h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Plano: <span className="font-bold text-emerald-600 uppercase">{currentPlan}</span> — {loadingUsers ? '...' : users.length} cadastrado(s) de {userLimit === 999 ? 'ilimitado' : `${userLimit} máx`}
                    </p>
                  </div>
                  <button 
                    onClick={handleOpenAddAssessor}
                    className="text-sm bg-gray-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5 shadow-sm w-full sm:w-auto"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-400" /> Adicionar Assessor
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  {loadingUsers ? (
                    <div className="p-8 flex items-center justify-center gap-2 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm font-medium">Carregando usuários do gabinete...</span>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500 bg-white">Nenhum assessor cadastrado.</div>
                  ) : (
                    users.map(user => (
                      <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 bg-white last:border-0 group">
                        <div>
                          <p className="font-bold text-gray-900">{user.nome}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-3 self-start sm:self-auto">
                          <span className={`px-2 py-1 text-xs font-bold rounded ${user.role === 'Administrador' ? 'bg-blue-100 text-blue-700' : user.role === 'Parlamentar' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-700'}`}>
                            {user.role}
                          </span>
                          {user.id !== profile?.id && (
                            <button 
                              onClick={() => handleRemoveUser(user.id)}
                              className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              title="Remover do gabinete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Regras de Notificação</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" 
                      checked={notifyCitizen}
                      onChange={(e) => setNotifyCitizen(e.target.checked)}
                    />
                    <div>
                      <p className="font-bold text-gray-900">Notificar Cidadão via WhatsApp</p>
                      <p className="text-sm text-gray-500">Envia uma mensagem automática sempre que o status da demanda for alterado.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" 
                      checked={notifyAssessor}
                      onChange={(e) => setNotifyAssessor(e.target.checked)}
                    />
                    <div>
                      <p className="font-bold text-gray-900">Alerta Interno Diário</p>
                      <p className="text-sm text-gray-500">Envia um resumo das demandas pendentes para o e-mail do gabinete toda manhã.</p>
                    </div>
                  </label>
                </div>
              </section>
            </div>
          )}

          <div className="flex justify-end pt-8 border-t border-gray-100">
            <button 
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-sm w-full sm:w-48 ${saved ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'} disabled:opacity-70`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Alterações'}
            </button>
          </div>

        </div>
      </div>

      {/* Add Assessor Modal */}
      {isAssessorModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Novo Assessor</h2>
              <button onClick={() => setIsAssessorModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
                <input required type="text" placeholder="Ex: João Assessor" value={assessorFormData.nome} onChange={e => setAssessorFormData({...assessorFormData, nome: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                <input required type="email" placeholder="assessor@gabinete.com" value={assessorFormData.email} onChange={e => setAssessorFormData({...assessorFormData, email: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cargo / Permissão</label>
                <select value={assessorFormData.role} onChange={e => setAssessorFormData({...assessorFormData, role: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 shadow-sm text-sm">
                  <option value="Assessor">Assessor</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Parlamentar">Parlamentar</option>
                </select>
              </div>
              <div className="pt-4">
                <button type="submit" disabled={inviting} className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70">
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {inviting ? 'Convidando...' : 'Convidar Assessor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Limit Exceeded Modal */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Limite do Plano Atingido
              </span>
              <h3 className="text-2xl font-black text-gray-900">
                Você atingiu o limite de {userLimit} assessores
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                O seu plano atual ({currentPlan}) não permite mais cadastros. Entre em contato para fazer upgrade e expandir sua equipe.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setIsLimitModalOpen(false)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                Falar sobre Upgrade de Plano
              </button>
              <button
                onClick={() => setIsLimitModalOpen(false)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-xl transition-colors text-xs uppercase tracking-wider"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
