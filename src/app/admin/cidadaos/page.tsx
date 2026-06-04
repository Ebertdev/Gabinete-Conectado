'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Phone, X, Save, MessageSquare, ShieldCheck, ShieldAlert, Clock, Plus, Download, Trash2, MapPin, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '@/infrastructure/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PLAN_LIMITS } from '@/utils/permissions';

type Note = {
  id: string;
  date: string;
  author: string;
  content: string;
};

type Citizen = { 
  id: string; 
  name: string; 
  phone: string; 
  address: string; 
  neighborhood: string;
  birthDate: string; 
  demandsCount: number; 
  lgpdVerified: boolean;
  notes: Note[];
};

export default function CidadaosPage() {
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [filterNeighborhood, setFilterNeighborhood] = useState('Todos');
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Form
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    address: '', 
    neighborhood: 'Centro', 
    birthDate: '', 
    lgpdVerified: true 
  });

  const neighborhoods = ['Todos', 'Vila de Abrantes', 'Centro', 'Gleba A', 'Ponto Certo'];

  const fetchCitizens = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cidadaos')
        .select('*, demandas(id)')
        .order('nome', { ascending: true });

      if (error) throw error;

      if (data) {
        const mapped = data.map((c: any) => ({
          id: c.id,
          name: c.nome,
          phone: c.telefone || '',
          address: c.endereco || '',
          neighborhood: c.bairro || 'Centro',
          birthDate: c.data_nascimento || '',
          demandsCount: c.demandas ? c.demandas.length : 0,
          lgpdVerified: c.lgpd_consentimento ?? true,
          notes: c.anotacoes || []
        }));
        setCitizens(mapped);
      }
    } catch (err: any) {
      console.error('Erro ao buscar cidadãos:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, []);

  const filtered = citizens.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchesNeighborhood = filterNeighborhood === 'Todos' || c.neighborhood === filterNeighborhood;
    return matchesSearch && matchesNeighborhood;
  });

  const openNewCitizen = () => {
    // Verificar limites do plano SaaS antes de cadastrar
    const plano = profile?.gabinete_plano || 'Essencial';
    const limite = PLAN_LIMITS[plano].maxCitizens;
    if (citizens.length >= limite) {
      alert(`Você atingiu o limite de ${limite} cidadãos do seu plano ${plano}. Faça upgrade para cadastrar mais.`);
      return;
    }

    setSelectedCitizen(null);
    setFormData({ name: '', phone: '', address: '', neighborhood: 'Centro', birthDate: '', lgpdVerified: true });
    setIsModalOpen(true);
  };

  const openCitizenProfile = (citizen: Citizen) => {
    setSelectedCitizen(citizen);
    setIsProfileModalOpen(true);
  };

  const saveCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selectedCitizen) {
        const { error } = await supabase
          .from('cidadaos')
          .update({
            nome: formData.name,
            telefone: formData.phone,
            endereco: formData.address,
            bairro: formData.neighborhood,
            data_nascimento: formData.birthDate,
            lgpd_consentimento: formData.lgpdVerified
          })
          .eq('id', selectedCitizen.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cidadaos')
          .insert({
            nome: formData.name,
            telefone: formData.phone,
            endereco: formData.address,
            bairro: formData.neighborhood,
            data_nascimento: formData.birthDate,
            lgpd_consentimento: formData.lgpdVerified,
            anotacoes: [{ id: 'n-init', date: new Date().toLocaleDateString('pt-BR'), author: profile?.nome || 'Gabinete', content: 'Cadastro inicial do cidadão no sistema.' }],
            gabinete_id: profile?.gabinete_id
          });

        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchCitizens();
    } catch (err: any) {
      alert('Erro ao salvar cidadão: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBroadcastWhatsApp = () => {
    if (filtered.length === 0) {
      alert('Nenhum cidadão filtrado para enviar notificação.');
      return;
    }
    const text = `Gabinete Conectado de Camaçari informa: Temos novidades sobre os serviços no bairro ${filterNeighborhood === 'Todos' ? 'em sua região' : filterNeighborhood}!`;
    alert(`Preparando disparo no WhatsApp para ${filtered.length} contatos de ${filterNeighborhood === 'Todos' ? 'Camaçari' : filterNeighborhood}...`);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCitizen || !newNoteText.trim()) return;
    setAddingNote(true);

    const newNoteObj: Note = {
      id: `note-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      author: profile?.nome || 'Assessor',
      content: newNoteText.trim(),
    };

    const newNotes = [newNoteObj, ...selectedCitizen.notes];

    try {
      const { error } = await supabase
        .from('cidadaos')
        .update({ anotacoes: newNotes })
        .eq('id', selectedCitizen.id);

      if (error) throw error;

      const updatedCitizen = { ...selectedCitizen, notes: newNotes };
      setSelectedCitizen(updatedCitizen);
      setCitizens(citizens.map(c => c.id === updatedCitizen.id ? updatedCitizen : c));
      setNewNoteText('');
    } catch (err: any) {
      alert('Erro ao adicionar anotação: ' + err.message);
    } finally {
      setAddingNote(false);
    }
  };

  const exportLgpdData = (c: Citizen) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(c, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `dados_lgpd_${c.name.replace(/\s+/g, '_')}.json`);
    dlAnchorElem.click();
  };

  const anonymizeCitizen = async (c: Citizen) => {
    if (window.confirm(`Tem certeza que deseja anonimizar os dados de ${c.name}? (Ação irreversível de acordo com a LGPD)`)) {
      const anonymizedNotes = [...c.notes, { id: Date.now().toString(), date: 'Hoje', author: 'Sistema LGPD', content: 'Dados sensíveis anonimizados a pedido do titular.' }];
      
      try {
        const { error } = await supabase
          .from('cidadaos')
          .update({
            nome: 'Cidadão Anonimizado (LGPD)',
            telefone: '***-****',
            endereco: 'Dado Ocultado',
            data_nascimento: '**/**',
            lgpd_consentimento: false,
            anotacoes: anonymizedNotes
          })
          .eq('id', c.id);

        if (error) throw error;

        const anonymized: Citizen = {
          ...c,
          name: 'Cidadão Anonimizado (LGPD)',
          phone: '***-****',
          address: 'Dado Ocultado',
          birthDate: '**/**',
          lgpdVerified: false,
          notes: anonymizedNotes
        };

        setCitizens(citizens.map(item => item.id === c.id ? anonymized : item));
        setSelectedCitizen(anonymized);
        alert('Dados do cidadão anonimizados com sucesso conforme LGPD.');
      } catch (err: any) {
        alert('Erro ao anonimizar cidadão: ' + err.message);
      }
    }
  };

  const startEditCitizen = (citizen: Citizen) => {
    setSelectedCitizen(citizen);
    setFormData({
      name: citizen.name,
      phone: citizen.phone,
      address: citizen.address,
      neighborhood: citizen.neighborhood,
      birthDate: citizen.birthDate,
      lgpdVerified: citizen.lgpdVerified
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" /> Relacionamento & Cidadãos
          </h1>
          <p className="text-gray-500 mt-1">Gestão de contatos da população de Camaçari com conformidade LGPD.</p>
        </div>
        <button 
          onClick={openNewCitizen}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-2 text-sm w-full md:w-auto"
        >
          <Plus className="w-4 h-4 text-emerald-400" /> Novo Cadastro
        </button>
      </div>

      {/* Toolbar / Search / Feature 2: WhatsApp Broadcast */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por cidadão, telefone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold text-gray-900 placeholder:text-gray-500 shadow-sm transition-all"
            />
          </div>
          <select
            value={filterNeighborhood}
            onChange={(e) => setFilterNeighborhood(e.target.value)}
            className="px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:border-emerald-500 text-sm shadow-sm"
          >
            {neighborhoods.map(b => (
              <option key={b} value={b}>{b === 'Todos' ? 'Todos os Bairros' : b}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-auto">
          <button
            onClick={handleBroadcastWhatsApp}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all text-sm"
          >
            <MessageSquare className="w-4 h-4" />
            Notificar Bairro no WhatsApp ({filtered.length})
          </button>
        </div>
      </div>

      {/* Citizens Grid / Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <span className="text-gray-500 font-medium text-sm">Carregando dados dos cidadãos...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(c => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-extrabold text-lg border border-emerald-200 shadow-xs">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{c.name}</h3>
                      <span className="text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-0.5 rounded-full inline-block mt-1">
                        {c.neighborhood}
                      </span>
                    </div>
                  </div>
                  
                  {/* Feature 3: LGPD Verified Badge */}
                  <div className="self-start sm:self-auto">
                    {c.lgpdVerified ? (
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-1 rounded-lg" title="Consentimento LGPD Ativo">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" /> LGPD OK
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-2 py-1 rounded-lg" title="Aceite de Termos Pendente">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" /> Pendente
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 text-sm text-gray-600 font-medium py-3 border-t border-b border-gray-100/80 my-3">
                  <div className="flex items-center gap-2.5 text-gray-800">
                    <Phone className="w-4 h-4 text-emerald-600" /> {c.phone}
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-600 text-xs">
                    <MapPin className="w-4 h-4 text-amber-500" /> {c.address}
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-600 text-xs">
                    <Calendar className="w-4 h-4 text-violet-500" /> Nasc: <span className="font-bold text-gray-800">{c.birthDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-3">
                <span className="text-xs text-gray-500 font-semibold">{c.demandsCount} demandas</span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => startEditCitizen(c)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs px-3 py-2 rounded-xl transition-all shadow-xs flex-1 sm:flex-none"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => openCitizenProfile(c)}
                    className="bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 font-extrabold text-xs px-3 py-2 rounded-xl transition-all shadow-xs flex-1 sm:flex-none"
                  >
                    Histórico
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 font-bold bg-white rounded-2xl border border-gray-200">
              Nenhum cidadão encontrado.
            </div>
          )}
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && selectedCitizen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            
            {/* Modal Header */}
            <div className="p-6 bg-gray-900 text-white flex justify-between items-center border-b border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-extrabold text-2xl shadow-md">
                  {selectedCitizen.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedCitizen.name}</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{selectedCitizen.neighborhood} | WhatsApp: {selectedCitizen.phone}</p>
                </div>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* LGPD Compliance Section */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${selectedCitizen.lgpdVerified ? 'text-emerald-600' : 'text-amber-500'}`} />
                    <span className="font-bold text-gray-900 text-sm">Status de Conformidade LGPD</span>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${selectedCitizen.lgpdVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {selectedCitizen.lgpdVerified ? 'Autorizado pelo Titular' : 'Consentimento Pendente'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  O titular possui os direitos garantidos pelo Artigo 18 da LGPD, incluindo portabilidade e eliminação de dados sensíveis.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    onClick={() => exportLgpdData(selectedCitizen)}
                    className="flex items-center justify-center gap-1.5 bg-white border border-gray-300 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-xs w-full sm:w-auto"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" /> Exportar Dados (JSON)
                  </button>
                  <button
                    onClick={() => anonymizeCitizen(selectedCitizen)}
                    className="flex items-center justify-center gap-1.5 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors shadow-xs w-full sm:w-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" /> Anonimizar / Apagar Dados
                  </button>
                </div>
              </div>

              {/* Timeline of Interactions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-violet-600" /> Linha do Tempo & Anotações
                  </h3>
                  <span className="text-xs bg-violet-100 text-violet-800 font-extrabold px-2.5 py-0.5 rounded-full">
                    {selectedCitizen.notes.length} registros
                  </span>
                </div>

                {/* Quick Add Note Form */}
                <form onSubmit={handleAddNote} className="mb-6 bg-violet-50/50 p-4 rounded-2xl border border-violet-100">
                  <label className="block text-xs font-bold text-violet-950 mb-1.5">Registrar Novo Ponto de Contato</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ligou para informar que o poste da rua foi consertado..."
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-white border border-violet-200 rounded-xl outline-none focus:border-violet-500 text-sm text-gray-900 placeholder:text-gray-400 font-medium"
                    />
                    <button type="submit" disabled={addingNote} className="bg-violet-600 text-white font-extrabold px-5 py-2.5 rounded-xl hover:bg-violet-700 transition-colors text-sm shadow-sm flex items-center justify-center gap-1 disabled:opacity-75 w-full sm:w-auto">
                      {addingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Registrar
                    </button>
                  </div>
                </form>

                {/* Notes List */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {selectedCitizen.notes.map((note, index) => (
                    <div key={note.id || index} className="bg-gray-50/80 border border-gray-200 p-4 rounded-2xl flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-extrabold text-gray-900">{note.author}</span>
                          <span className="text-xs font-semibold text-gray-400">{note.date}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">{note.content}</p>
                      </div>
                    </div>
                  ))}

                  {selectedCitizen.notes.length === 0 && (
                    <div className="text-center py-8 text-sm text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      Nenhuma anotação registrada ainda.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm w-full sm:w-auto"
              >
                Fechar Perfil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New/Edit Citizen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex justify-between items-start sm:items-center mb-6 gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{selectedCitizen ? 'Editar Cidadão' : 'Novo Cidadão'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={saveCitizen} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp / Telefone</label>
                <input required type="text" placeholder="Ex: 5571999990000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bairro / Região</label>
                <select value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900">
                  {neighborhoods.filter(b => b !== 'Todos').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Endereço Completo</label>
                <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Data de Nascimento</label>
                <input required type="text" placeholder="Ex: 18/05" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900" />
              </div>
              
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="lgpdVerified"
                  checked={formData.lgpdVerified}
                  onChange={e => setFormData({...formData, lgpdVerified: e.target.checked})}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="lgpdVerified" className="text-sm font-semibold text-gray-700">Consentimento LGPD Ativo</label>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={saving} className="w-full bg-emerald-600 text-white font-extrabold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md disabled:opacity-75">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {selectedCitizen ? 'Salvar Alterações' : 'Salvar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
