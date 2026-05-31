'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Database, Shield, Bell, Loader2, CheckCircle2, Trash2, X, UserPlus, Lock, Zap, Sparkles } from 'lucide-react';
export type PlanType = 'essencial' | 'inteligente' | 'enterprise';

type Tab = 'geral' | 'acessos' | 'notificacoes';

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('geral');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanType>('essencial');

  useEffect(() => {
    const checkPlan = () => {
      const savedPlan = localStorage.getItem('gabinete_plan') as PlanType;
      if (savedPlan === 'essencial' || savedPlan === 'inteligente' || savedPlan === 'enterprise') {
        setCurrentPlan(savedPlan);
      }
    };
    checkPlan();
    window.addEventListener('planChanged', checkPlan);
    return () => window.removeEventListener('planChanged', checkPlan);
  }, []);

  const [formData, setFormData] = useState({
    name: 'Gabinete Conectado Camaçari',
    year: '2026',
    notifyCitizen: true,
    notifyAssessor: false
  });

  const [assessors, setAssessors] = useState([
    { id: '1', name: 'Ana Silva', email: 'ana@gabinete.com', role: 'Administrador' },
    { id: '2', name: 'Carlos Assessor', email: 'carlos@gabinete.com', role: 'Padrão' },
    { id: '3', name: 'Mariana Costa', email: 'mariana@gabinete.com', role: 'Padrão' },
    { id: '4', name: 'Roberto Lima', email: 'roberto@gabinete.com', role: 'Padrão' },
    { id: '5', name: 'Fernanda Souza', email: 'fernanda@gabinete.com', role: 'Padrão' }
  ]);
  const [isAssessorModalOpen, setIsAssessorModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [assessorFormData, setAssessorFormData] = useState({ name: '', email: '', role: 'Padrão' });

  const handleOpenAddAssessor = () => {
    const limit = currentPlan === 'essencial' ? 5 : currentPlan === 'inteligente' ? 15 : 999;
    if (assessors.length >= limit) {
      setIsLimitModalOpen(true);
    } else {
      setIsAssessorModalOpen(true);
    }
  };

  const handleAddAssessor = (e: React.FormEvent) => {
    e.preventDefault();
    setAssessors([...assessors, { id: Math.random().toString(), ...assessorFormData }]);
    setIsAssessorModalOpen(false);
    setAssessorFormData({ name: '', email: '', role: 'Padrão' });
  };

  const handleRemoveAssessor = (id: string) => {
    setAssessors(assessors.filter(a => a.id !== id));
  };

  const handleSave = () => {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl relative">
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
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'geral' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/10' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Database className="w-4 h-4" /> Geral
          </button>
          <button 
            onClick={() => setActiveTab('acessos')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'acessos' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/10' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Shield className="w-4 h-4" /> Acessos
          </button>
          <button 
            onClick={() => setActiveTab('notificacoes')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'notificacoes' ? 'border-b-2 border-emerald-500 text-emerald-600 bg-emerald-50/10' : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Bell className="w-4 h-4" /> Notificações
          </button>
        </div>

        <div className="p-4 sm:p-8 space-y-8 min-h-[400px]">
          
          {activeTab === 'geral' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Vereador / Gabinete</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold text-gray-900 shadow-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ano Legislativo Atual</label>
                    <input 
                      type="text" 
                      value={formData.year} 
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-semibold text-gray-900 shadow-sm" 
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100 my-8" />

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Integração WhatsApp API</h3>
                <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
                  <div className="flex items-center justify-between mb-4">
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
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Gestão de Assessores</h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Plano Atual: <span className="font-bold text-emerald-600 uppercase">{currentPlan}</span> ({assessors.length} cadastrados de {currentPlan === 'essencial' ? '5 máx' : currentPlan === 'inteligente' ? '15 máx' : 'ilimitado'})
                    </p>
                  </div>
                  <button 
                    onClick={handleOpenAddAssessor}
                    className="text-sm bg-gray-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-400" /> Adicionar Assessor
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                  {assessors.map(assessor => (
                    <div key={assessor.id} className="p-4 flex items-center justify-between border-b border-gray-200 bg-white last:border-0 group">
                      <div>
                        <p className="font-bold text-gray-900">{assessor.name}</p>
                        <p className="text-xs text-gray-500">{assessor.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${assessor.role === 'Administrador' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                          {assessor.role}
                        </span>
                        <button 
                          onClick={() => handleRemoveAssessor(assessor.id)}
                          className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {assessors.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500 bg-white">Nenhum assessor cadastrado.</div>
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
                      checked={formData.notifyCitizen}
                      onChange={(e) => setFormData({...formData, notifyCitizen: e.target.checked})}
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
                      checked={formData.notifyAssessor}
                      onChange={(e) => setFormData({...formData, notifyAssessor: e.target.checked})}
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
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-sm w-48 ${saved ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'} disabled:opacity-70`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Alterações'}
            </button>
          </div>

        </div>
      </div>

      {isAssessorModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Novo Assessor</h2>
              <button onClick={() => setIsAssessorModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddAssessor} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
                <input required type="text" value={assessorFormData.name} onChange={e => setAssessorFormData({...assessorFormData, name: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                <input required type="email" value={assessorFormData.email} onChange={e => setAssessorFormData({...assessorFormData, email: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 shadow-sm text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Permissão</label>
                <select value={assessorFormData.role} onChange={e => setAssessorFormData({...assessorFormData, role: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 shadow-sm text-sm">
                  <option value="Padrão">Padrão</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" /> Cadastrar Acesso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Limit Exceeded Modal */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Limite do Plano Atingido
              </span>
              <h3 className="text-2xl font-black text-gray-900">
                Você atingiu o limite de {currentPlan === 'essencial' ? '5 assessores' : '15 assessores'}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                O seu plano atual ({currentPlan.toUpperCase()}) não permite mais cadastros. Faça o upgrade agora para expandir sua equipe e liberar ferramentas de IA Legislativa!
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  const nextPlan = currentPlan === 'essencial' ? 'inteligente' : 'enterprise';
                  localStorage.setItem('gabinete_plan', nextPlan);
                  setCurrentPlan(nextPlan);
                  window.dispatchEvent(new Event('planChanged'));
                  setIsLimitModalOpen(false);
                  alert(`Upgrade simulado com sucesso para o Plano ${nextPlan.toUpperCase()}! Limite de assessores expandido.`);
                }}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                Fazer Upgrade para {currentPlan === 'essencial' ? 'Plano Inteligente (R$ 337)' : 'Mandato Total (R$ 697)'}
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
