'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, MoreVertical, Archive, X, Save, FileText, Share2, Printer, Loader2, Upload, MessageSquare, Kanban, Table, ChevronRight, Camera } from 'lucide-react';
import { supabase } from '@/infrastructure/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const statusColors: Record<string, string> = {
  'Registrada': 'bg-gray-100 text-gray-700',
  'Em Análise': 'bg-blue-100 text-blue-700',
  'Encaminhada': 'bg-amber-100 text-amber-700',
  'Resolvida': 'bg-emerald-100 text-emerald-700',
};

const categoryColors: Record<string, string> = {
  'Saúde': 'bg-red-50 text-red-700 border border-red-200 font-bold',
  'Infraestrutura': 'bg-amber-50 text-amber-700 border border-amber-200 font-bold',
  'Educação': 'bg-violet-50 text-violet-700 border border-violet-200 font-bold',
  'Segurança': 'bg-violet-50 text-violet-700 border border-violet-200 font-bold',
  'Limpeza Urbana': 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold',
  'Iluminação': 'bg-amber-50 text-amber-700 border border-amber-200 font-bold',
  'Outros': 'bg-gray-100 text-gray-700 border border-gray-300 font-bold',
};

const normalizeAttachments = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    try {
      const parsed = JSON.parse(value);
      return normalizeAttachments(parsed);
    } catch {
      return [value];
    }
  }

  return [];
};

export default function DemandasList() {
  const { profile } = useAuth();
  const [demands, setDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [viewMode, setViewMode] = useState<'ativas' | 'arquivadas'>('ativas');
  const [displayMode, setDisplayMode] = useState<'table' | 'kanban'>('kanban');

  const [isDemandModalOpen, setIsDemandModalOpen] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [isNewDemandModalOpen, setIsNewDemandModalOpen] = useState(false);
  const [newDemandFormData, setNewDemandFormData] = useState({
    citizen: '',
    phone: '',
    cep: '',
    address: '',
    type: 'Infraestrutura',
    neighborhood: '',
  });
  const [cepLoading, setCepLoading] = useState(false);

  const fetchDemands = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('demandas')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          protocol: d.protocolo,
          citizen: d.nome_cidadao || 'Desconhecido',
          phone: d.telefone_cidadao || '',
          type: d.tipo || 'Outros',
          neighborhood: d.bairro || 'Centro',
          status: d.status || 'Registrada',
          date: new Date(d.data_criacao).toLocaleString('pt-BR'),
          isArchived: d.arquivado ?? false,
          address: d.endereco || '',
          cep: d.cep || '',
          cidadao_id: d.cidadao_id,
          description: d.descricao || '',
          attachments: normalizeAttachments(d.anexos || d.attachments || d.fotos || d.imagens)
        }));
        setDemands(mapped);
      }
    } catch (err: any) {
      console.error('Erro ao buscar demandas:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const handleCepLookup = async (rawCep: string) => {
    const cleanCep = rawCep.replace(/\D/g, '');
    setNewDemandFormData(prev => ({ ...prev, cep: rawCep }));

    if (cleanCep.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
        if (res.ok) {
          const data = await res.json();
          setNewDemandFormData(prev => ({
            ...prev,
            address: data.street || prev.address,
            neighborhood: data.neighborhood || prev.neighborhood,
          }));
        } else {
          const resVia = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          if (resVia.ok) {
            const dataVia = await resVia.json();
            if (!dataVia.erro) {
              setNewDemandFormData(prev => ({
                ...prev,
                address: dataVia.logradouro || prev.address,
                neighborhood: dataVia.bairro || prev.neighborhood,
              }));
            }
          }
        }
      } catch (err) {
        console.error('Erro ao buscar CEP', err);
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleCreateDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Procurar ou criar cidadão com esse telefone no gabinete
      let citizenId = null;
      const cleanPhone = newDemandFormData.phone.replace(/\D/g, '');
      if (cleanPhone) {
        const { data: existingCitizen } = await supabase
          .from('cidadaos')
          .select('id')
          .eq('telefone', cleanPhone)
          .maybeSingle();

        if (existingCitizen) {
          citizenId = existingCitizen.id;
        } else {
          // Criar novo cidadão automaticamente
          const { data: newCitizen, error: createCitError } = await supabase
            .from('cidadaos')
            .insert({
              nome: newDemandFormData.citizen,
              telefone: cleanPhone,
              bairro: newDemandFormData.neighborhood || 'Centro',
              endereco: newDemandFormData.address || '',
              gabinete_id: profile?.gabinete_id,
              anotacoes: [{ id: 'n-init', date: new Date().toLocaleDateString('pt-BR'), author: profile?.nome || 'Sistema', content: 'Cidadão cadastrado automaticamente via abertura de demanda.' }]
            })
            .select('id')
            .single();

          if (createCitError) throw createCitError;
          if (newCitizen) citizenId = newCitizen.id;
        }
      }

      // 2. Criar protocolo único
      const protocolo = `CAM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // 3. Inserir demanda
      const { error: demError } = await supabase
        .from('demandas')
        .insert({
          protocolo,
          nome_cidadao: newDemandFormData.citizen,
          telefone_cidadao: newDemandFormData.phone,
          tipo: newDemandFormData.type,
          bairro: newDemandFormData.neighborhood || 'Centro',
          endereco: newDemandFormData.address || '',
          cep: newDemandFormData.cep || '',
          status: 'Registrada',
          gabinete_id: profile?.gabinete_id,
          cidadao_id: citizenId
        });

      if (demError) throw demError;

      setIsNewDemandModalOpen(false);
      setNewDemandFormData({ citizen: '', phone: '', cep: '', address: '', type: 'Infraestrutura', neighborhood: '' });
      fetchDemands();
    } catch (err: any) {
      alert('Erro ao criar demanda: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const openDemandModal = (demand: any) => {
    setSelectedDemand(demand);
    setIsDemandModalOpen(true);
    setOpenDropdownId(null);
  };

  const saveDemandChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('demandas')
        .update({
          status: selectedDemand.status,
          descricao: selectedDemand.description
        })
        .eq('id', selectedDemand.id);

      if (error) throw error;

      setIsDemandModalOpen(false);
      fetchDemands();
    } catch (err: any) {
      alert('Erro ao salvar alterações da demanda: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveResolved = async () => {
    try {
      const { error } = await supabase
        .from('demandas')
        .update({ arquivado: true })
        .eq('status', 'Resolvida')
        .eq('arquivado', false);

      if (error) throw error;
      fetchDemands();
      alert('Demandas resolvidas arquivadas com sucesso.');
    } catch (err: any) {
      alert('Erro ao arquivar demandas: ' + err.message);
    }
  };

  const toggleDropdown = (id: string) => {
    if (openDropdownId === id) setOpenDropdownId(null);
    else setOpenDropdownId(id);
  };

  const handleShare = (demand: any) => {
    const text = `Acompanhe sua demanda no Gabinete Conectado!\n*Protocolo:* ${demand.protocol}\n*Status:* ${demand.status}\n*Categoria:* ${demand.type}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setOpenDropdownId(null);
  };

  const handlePrintProtocol = (demand: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Protocolo - ${demand.protocol}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
              .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
              .title { font-size: 24px; font-weight: bold; }
              .protocol { font-size: 32px; font-family: monospace; font-weight: bold; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
              .info { margin-bottom: 12px; font-size: 16px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px; }
              .label { font-weight: bold; color: #6b7280; display: inline-block; width: 120px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">Gabinete Conectado Camaçari</div>
              <p>Comprovante de Registro de Demanda</p>
            </div>
            <div class="protocol">${demand.protocol}</div>
            <div class="info"><span class="label">Cidadão:</span> <strong>${demand.citizen}</strong></div>
            <div class="info"><span class="label">Contato:</span> ${demand.phone}</div>
            <div class="info"><span class="label">Categoria:</span> ${demand.type}</div>
            <div class="info"><span class="label">Bairro:</span> ${demand.neighborhood}</div>
            <div class="info"><span class="label">Status Atual:</span> ${demand.status}</div>
            <div class="info"><span class="label">Data:</span> ${demand.date}</div>
            <p style="margin-top: 50px; text-align: center; font-size: 14px; color: #9ca3af;">
              Guarde este protocolo para acompanhamento futuro com a equipe do gabinete.
            </p>
            <script>
              window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    setOpenDropdownId(null);
  };

  const handleDeleteDemand = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir permanentemente esta demanda?")) {
      try {
        const { error } = await supabase
          .from('demandas')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchDemands();
      } catch (err: any) {
        alert('Erro ao excluir demanda: ' + err.message);
      }
    }
    setOpenDropdownId(null);
  };

  const handleNotifyStatusWhatsApp = (demand: any) => {
    if (!demand) return;

    let statusMsg = '';
    if (demand.status === 'Registrada') {
      statusMsg = `Sua solicitação (Protocolo *${demand.protocol}*) sobre *${demand.type}* foi recebida com sucesso pelo nosso gabinete e já está na fila de triagem.`;
    } else if (demand.status === 'Em Análise') {
      statusMsg = `Sua solicitação (Protocolo *${demand.protocol}*) entrou *Em Análise*! Nossa equipe técnica está verificando os detalhes para encaminhamento.`;
    } else if (demand.status === 'Encaminhada') {
      statusMsg = `Boas notícias! Sua demanda (Protocolo *${demand.protocol}*) sobre *${demand.type}* no bairro *${demand.neighborhood}* foi oficialmente *Encaminhada* para a secretaria responsável da Prefeitura.`;
    } else if (demand.status === 'Resolvida') {
      statusMsg = `🎉 Solicitação Concluída! Informamos que o problema relatado no protocolo *${demand.protocol}* (*${demand.type}* em *${demand.neighborhood}*) foi totalmente *Resolvido*. O Gabinete Conectado agradece sua confiança!`;
    }

    const fullMsg = `Olá ${demand.citizen}! Aqui é a equipe do Gabinete Conectado de Camaçari. 🏢\n\n📌 *Atualização de Protocolo:*\n${statusMsg}\n\nAcompanhe seu protocolo conosco a qualquer momento!`;
    const cleanPhone = demand.phone ? demand.phone.replace(/\D/g, '') : '';
    const phoneParam = cleanPhone.length >= 10 ? `phone=55${cleanPhone}&` : '';
    const url = `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(fullMsg)}`;
    window.open(url, '_blank');
  };

  const handleAdvanceStatus = async (id: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let nextStatus = 'Registrada';
    if (currentStatus === 'Registrada') nextStatus = 'Em Análise';
    else if (currentStatus === 'Em Análise') nextStatus = 'Encaminhada';
    else if (currentStatus === 'Encaminhada') nextStatus = 'Resolvida';
    else return;

    try {
      const { error } = await supabase
        .from('demandas')
        .update({ status: nextStatus })
        .eq('id', id);

      if (error) throw error;
      fetchDemands();
    } catch (err: any) {
      alert('Erro ao avançar status: ' + err.message);
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      if (lines.length < 2) {
        alert('O arquivo CSV parece estar vazio ou sem linhas de dados válidas.');
        return;
      }

      const importedDemands: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(/[;,]/);
        if (cols.length >= 2) {
          const cleanStr = (str: string) => str ? str.replace(/^["']|["']$/g, '').trim() : '';

          const protocol = cleanStr(cols[1]) || `CAM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
          const citizen = cleanStr(cols[2]) || cleanStr(cols[0]) || 'Cidadão Importado';
          const type = cols.length > 3 ? cleanStr(cols[3]) : 'Outros';
          const neighborhood = cols.length > 4 ? cleanStr(cols[4]) : 'Centro';
          const statusRaw = cols.length > 5 ? cleanStr(cols[5]) : 'Registrada';
          const validStatus = ['Registrada', 'Em Análise', 'Encaminhada', 'Resolvida'].includes(statusRaw) ? statusRaw : 'Registrada';

          importedDemands.push({
            protocolo: protocol,
            nome_cidadao: citizen,
            telefone_cidadao: '5571999990000',
            tipo: type,
            bairro: neighborhood,
            status: validStatus,
            arquivado: false,
            gabinete_id: profile?.gabinete_id
          });
        }
      }

      if (importedDemands.length > 0) {
        try {
          const { error } = await supabase
            .from('demandas')
            .insert(importedDemands);

          if (error) throw error;

          alert(`Sucesso! ${importedDemands.length} demandas importadas com sucesso.`);
          fetchDemands();
        } catch (err: any) {
          alert('Erro ao salvar demandas importadas: ' + err.message);
        }
      } else {
        alert('Não foi possível processar o arquivo. Certifique-se de que o CSV tenha colunas separadas por ponto e vírgula (;).');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredDemands = demands.filter(d => {
    const matchesViewMode = viewMode === 'arquivadas' ? d.isArchived : !d.isArchived;
    const matchesSearch = d.citizen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || d.status === filterStatus;

    return matchesViewMode && matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Demandas</h1>
          <p className="text-gray-500 mt-1">Gerencie, encaminhe e arquive as solicitações.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input type="file" accept=".csv" id="csv-upload" className="hidden" onChange={handleImportCSV} />
          <button
            onClick={() => document.getElementById('csv-upload')?.click()}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            Importar CSV
          </button>
          <button
            onClick={handleArchiveResolved}
            className="flex items-center gap-2 bg-gray-100 border border-gray-300 text-gray-800 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors shadow-sm text-sm"
          >
            <Archive className="w-4 h-4 text-gray-600" />
            Arquivar Resolvidas
          </button>
          <button
            onClick={() => setIsNewDemandModalOpen(true)}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md text-sm"
          >
            + Nova Demanda
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Navigation Tabs and Display Toggle */}
        <div className="flex flex-col sm:flex-row border-b border-gray-100 justify-between items-start sm:items-center px-4 bg-gray-50/20 gap-3 py-3 sm:py-0">
          <div className="flex w-full sm:w-auto border-b sm:border-b-0 border-gray-100">
            <button
              onClick={() => setViewMode('ativas')}
              className={`flex-1 sm:flex-none text-center px-4 sm:px-6 py-3 sm:py-4 font-bold text-sm transition-colors ${viewMode === 'ativas' ? 'border-b-2 border-emerald-500 text-emerald-700 bg-emerald-50/20' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Caixa de Entrada
            </button>
            <button
              onClick={() => setViewMode('arquivadas')}
              className={`flex-1 sm:flex-none text-center px-4 sm:px-6 py-3 sm:py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${viewMode === 'arquivadas' ? 'border-b-2 border-gray-800 text-gray-900 bg-gray-50' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Arquivadas <Archive className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200 shadow-xs w-full sm:w-auto justify-center sm:justify-start">
            <button
              onClick={() => setDisplayMode('kanban')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${displayMode === 'kanban' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Kanban className="w-3.5 h-3.5" /> Esteira Kanban
            </button>
            <button
              onClick={() => setDisplayMode('table')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${displayMode === 'table' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Table className="w-3.5 h-3.5" /> Tabela
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/30">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar por protocolo, nome ou bairro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-500 shadow-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full sm:w-auto px-4 py-2.5 border ${filterStatus !== 'Todos' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 font-extrabold' : 'border-gray-300 bg-white text-gray-900 font-bold'} rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm shadow-sm transition-all cursor-pointer`}
            >
              <option value="Todos">Todos os Status</option>
              <option value="Registrada">Registrada</option>
              <option value="Em Análise">Em Análise</option>
              <option value="Encaminhada">Encaminhada</option>
              <option value="Resolvida">Resolvida</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            <span className="text-gray-500 font-medium text-sm">Carregando demandas...</span>
          </div>
        ) : displayMode === 'kanban' ? (
          /* Kanban Board View */
          <div className="p-4 sm:p-6 bg-gray-50/50 overflow-x-auto min-h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 min-w-[1000px]">
              {[
                { label: 'Registrada', status: 'Registrada', border: 'border-gray-400', bg: 'bg-gray-100/80 text-gray-800' },
                { label: 'Em Análise', status: 'Em Análise', border: 'border-amber-500', bg: 'bg-amber-100 text-amber-800' },
                { label: 'Encaminhada', status: 'Encaminhada', border: 'border-blue-500', bg: 'bg-blue-100 text-blue-800' },
                { label: 'Resolvida', status: 'Resolvida', border: 'border-emerald-500', bg: 'bg-emerald-100 text-emerald-800' },
              ].map(col => {
                const colDocs = filteredDemands.filter(d => d.status === col.status);
                return (
                  <div key={col.status} className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                    <div className={`p-4 bg-gray-50/80 border-b border-gray-200 flex justify-between items-center border-t-4 ${col.border}`}>
                      <span className="font-extrabold text-gray-900 text-sm">{col.label}</span>
                      <span className={`px-2.5 py-0.5 rounded-full font-black text-xs ${col.bg}`}>
                        {colDocs.length}
                      </span>
                    </div>

                    <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[600px]">
                      {colDocs.map(item => (
                        <div
                          key={item.id}
                          onClick={() => openDemandModal(item)}
                          className="bg-white border border-gray-200 hover:border-emerald-500 rounded-xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-center gap-2 mb-2">
                              <span className="font-mono text-xs font-black text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {item.protocol}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryColors[item.type] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                {item.type}
                              </span>
                            </div>

                            <h4 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors mb-1">
                              {item.citizen}
                            </h4>
                            {item.attachments.length > 0 && (
                              <div className="mb-3 flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-2">
                                <img
                                  src={item.attachments[0]}
                                  alt={`Foto da demanda ${item.protocol}`}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                                <span className="flex items-center gap-1 text-[11px] font-bold text-gray-600">
                                  <Camera className="h-3.5 w-3.5 text-emerald-600" />
                                  {item.attachments.length} foto{item.attachments.length > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1 font-medium">
                              📍 {item.neighborhood}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); handleNotifyStatusWhatsApp(item); }}
                              className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                              title="Notificar WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                            {col.status !== 'Resolvida' && (
                              <button
                                type="button"
                                onClick={e => handleAdvanceStatus(item.id, col.status, e)}
                                className="bg-gray-900 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-all flex items-center gap-1 shadow-xs ml-auto"
                                title="Avançar status da demanda"
                              >
                                Avançar <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {colDocs.length === 0 && (
                        <div className="py-8 text-center text-xs font-bold text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                          Nenhuma demanda nesta etapa
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto animate-in fade-in duration-300">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                  <th className="px-6 py-4 font-medium">Protocolo</th>
                  <th className="px-6 py-4 font-medium">Cidadão / Contato</th>
                  <th className="px-6 py-4 font-medium">Categoria / Bairro</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDemands.length > 0 ? filteredDemands.map(demand => (
                  <tr key={demand.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-gray-900">{demand.protocol}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{demand.citizen}</div>
                      <div className="text-sm text-gray-500">{demand.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs inline-block mb-1 ${categoryColors[demand.type] || 'bg-gray-100 text-gray-700 font-bold border border-gray-200'}`}>
                        {demand.type}
                      </span>
                      <div className="text-sm font-medium text-gray-600">{demand.neighborhood}</div>
                      {demand.attachments.length > 0 && (
                        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          <Camera className="h-3.5 w-3.5" />
                          {demand.attachments.length} foto{demand.attachments.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${statusColors[demand.status] || 'bg-gray-100 text-gray-700'}`}>
                        {demand.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{demand.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDemandModal(demand)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Ver Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDemandModal(demand)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => toggleDropdown(demand.id)}
                            className={`p-2 rounded-lg transition-colors ${openDropdownId === demand.id ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openDropdownId === demand.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-10 py-2 animate-in zoom-in-95 duration-100">
                              <button
                                onClick={() => handleShare(demand)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Share2 className="w-4 h-4 text-gray-400" /> Compartilhar
                              </button>
                              <button
                                onClick={() => handlePrintProtocol(demand)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Printer className="w-4 h-4 text-gray-400" /> Imprimir Protocolo
                              </button>
                              <div className="h-px bg-gray-100 my-1"></div>
                              <button
                                onClick={() => handleDeleteDemand(demand.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" /> Excluir Demanda
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-bold">
                      Nenhuma demanda encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-gray-500 bg-gray-50/30">
          <span>Mostrando {filteredDemands.length} de {demands.length} resultados</span>
        </div>
      </div>

      {isDemandModalOpen && selectedDemand && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" /> Detalhes da Demanda
              </h2>
              <button onClick={() => setIsDemandModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveDemandChanges} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Protocolo</p>
                  <p className="font-mono font-bold text-gray-900">{selectedDemand.protocol}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Data</p>
                  <p className="font-medium text-gray-900 text-xs">{selectedDemand.date}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Cidadão</label>
                <input type="text" readOnly value={`${selectedDemand.citizen} - ${selectedDemand.phone}`} className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl outline-none text-sm text-gray-600 font-medium" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
                  <input type="text" readOnly value={selectedDemand.type} className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl outline-none text-sm text-gray-600 font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bairro</label>
                  <input type="text" readOnly value={selectedDemand.neighborhood} className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl outline-none text-sm text-gray-600 font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={selectedDemand.description}
                  onChange={e => setSelectedDemand({ ...selectedDemand, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-medium text-sm text-gray-800"
                  placeholder="Descreva os detalhes da demanda..."
                />
              </div>

              {selectedDemand.attachments.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fotos anexadas</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedDemand.attachments.map((url: string, index: number) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                        title="Abrir foto em nova aba"
                      >
                        <img
                          src={url}
                          alt={`Foto ${index + 1} da demanda ${selectedDemand.protocol}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Status da Demanda</label>
                <select
                  value={selectedDemand.status}
                  onChange={e => setSelectedDemand({ ...selectedDemand, status: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 shadow-sm text-sm"
                >
                  <option value="Registrada">Registrada (Aguardando Análise)</option>
                  <option value="Em Análise">Em Análise (Equipe Verificando)</option>
                  <option value="Encaminhada">Encaminhada (Secretaria)</option>
                  <option value="Resolvida">Resolvida (Concluída)</option>
                </select>
              </div>

              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                <button type="submit" disabled={saving} className="w-full sm:flex-1 bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm disabled:opacity-70">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 flex-shrink-0" />} Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={() => handleNotifyStatusWhatsApp(selectedDemand)}
                  className="w-full sm:w-auto bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold py-3 px-4 rounded-xl hover:bg-emerald-100 hover:text-emerald-950 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" /> Notificar Status (WhatsApp)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isNewDemandModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" /> Nova Demanda
              </h2>
              <button onClick={() => setIsNewDemandModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDemand} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Cidadão</label>
                <input required type="text" placeholder="Ex: João da Silva" value={newDemandFormData.citizen} onChange={e => setNewDemandFormData({ ...newDemandFormData, citizen: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 shadow-sm text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone / WhatsApp</label>
                <input required type="text" placeholder="Ex: (71) 99999-1111" value={newDemandFormData.phone} onChange={e => setNewDemandFormData({ ...newDemandFormData, phone: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 shadow-sm text-sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
                  <select value={newDemandFormData.type} onChange={e => setNewDemandFormData({ ...newDemandFormData, type: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 shadow-sm text-sm">
                    <option value="Infraestrutura">Infraestrutura</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Educação">Educação</option>
                    <option value="Segurança">Segurança</option>
                    <option value="Limpeza Urbana">Limpeza Urbana</option>
                    <option value="Iluminação">Iluminação</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CEP (Busca Automática)</label>
                  <input type="text" maxLength={9} placeholder="00000-000" value={newDemandFormData.cep} onChange={e => handleCepLookup(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 shadow-sm text-sm pr-10" />
                  {cepLoading && <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-9 text-emerald-600" />}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bairro</label>
                  <input required type="text" placeholder="Ex: Centro" value={newDemandFormData.neighborhood} onChange={e => setNewDemandFormData({ ...newDemandFormData, neighborhood: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 shadow-sm text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Logradouro / Rua e Nº</label>
                  <input type="text" placeholder="Ex: Rua da Paz, 45" value={newDemandFormData.address} onChange={e => setNewDemandFormData({ ...newDemandFormData, address: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 shadow-sm text-sm" />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button type="submit" disabled={saving} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-75">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Cadastrar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
