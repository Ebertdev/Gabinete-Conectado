'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, Clock, CheckCircle, Search, Filter, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const mockDemands = [
  { id: '1', protocol: 'CAM-2026-0001', citizen: 'João da Silva', type: 'Infraestrutura', neighborhood: 'Vila de Abrantes', status: 'Em Análise', date: 'Hoje, 09:30' },
  { id: '2', protocol: 'CAM-2026-0002', citizen: 'Maria Souza', type: 'Saúde', neighborhood: 'Centro', status: 'Registrada', date: 'Hoje, 11:15' },
  { id: '3', protocol: 'CAM-2026-0003', citizen: 'Carlos Almeida', type: 'Limpeza Urbana', neighborhood: 'Gleba A', status: 'Resolvida', date: 'Ontem, 14:20' },
  { id: '4', protocol: 'CAM-2026-0004', citizen: 'Ana Paula', type: 'Segurança', neighborhood: 'Ponto Certo', status: 'Encaminhada', date: 'Ontem, 16:45' },
];

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

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filteredDemands = mockDemands.filter(d => {
    const matchesSearch = d.citizen.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Protocolo', 'Cidadão', 'Categoria', 'Bairro', 'Status', 'Data'];
    const rows = mockDemands.map(d => [
      d.id, 
      d.protocol, 
      `"${d.citizen}"`, 
      `"${d.type}"`, 
      `"${d.neighborhood}"`, 
      d.status, 
      `"${d.date}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(";") + "\n"
      + rows.map(e => e.join(";")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "relatorio_demandas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Relatório de Demandas - Gabinete Conectado", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);

    const headers = [['ID', 'Protocolo', 'Cidadão', 'Categoria', 'Bairro', 'Status', 'Data']];
    const data = mockDemands.map(d => [
      d.id, d.protocol, d.citizen, d.type, d.neighborhood, d.status, d.date
    ]);

    autoTable(doc, {
      startY: 36,
      head: headers,
      body: data,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 },
    });

    doc.save("relatorio_demandas.pdf");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Demandas</h1>
          <p className="text-gray-500 mt-1">Visão geral e acompanhamento das solicitações da população.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            CSV
          </button>
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-red-400" />
            PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 border border-violet-200">
            <Activity className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <p className="text-gray-500 font-medium">Total de Demandas</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">1,248</h3>
            <p className="text-sm text-emerald-600 font-medium mt-1">+12% este mês</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-200">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-gray-500 font-medium">Em Andamento</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">342</h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Sendo tratadas</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-200">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-gray-500 font-medium">Resolvidas</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">890</h3>
            <p className="text-sm text-emerald-600 font-medium mt-1">71% de taxa de resolução</p>
          </div>
        </div>
      </div>

      {/* Demand List Section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Demandas Recentes</h2>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar protocolo, cidadão..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm font-semibold text-gray-900 placeholder:text-gray-500 shadow-sm"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center justify-center gap-2 px-4 py-2 bg-white border ${filterStatus !== 'Todos' ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50 font-bold' : 'border-gray-200 text-gray-700'} rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm`}
              >
                <Filter className="w-4 h-4" />
                {filterStatus === 'Todos' ? 'Filtros' : filterStatus}
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-20 py-2 animate-in zoom-in-95 duration-100">
                  <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 mb-1">Status</div>
                  {['Todos', 'Registrada', 'Em Análise', 'Encaminhada', 'Resolvida'].map(status => (
                    <button
                      key={status}
                      onClick={() => { setFilterStatus(status); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${filterStatus === status ? 'font-bold text-emerald-600 bg-emerald-50/30' : 'text-gray-700'}`}
                    >
                      {status}
                      {filterStatus === status && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                <th className="px-6 py-4 font-medium">Protocolo</th>
                <th className="px-6 py-4 font-medium">Cidadão</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium">Bairro</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDemands.map((demand) => (
                <tr key={demand.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-semibold text-gray-900">{demand.protocol}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{demand.citizen}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs inline-block ${categoryColors[demand.type] || 'bg-gray-100 text-gray-700 font-bold border border-gray-200'}`}>
                      {demand.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{demand.neighborhood}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[demand.status] || 'bg-gray-100 text-gray-700'}`}>
                      {demand.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{demand.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex justify-center">
          <Link href="/admin/demandas" className="text-emerald-600 font-bold text-sm hover:text-emerald-700 transition-colors flex items-center gap-1.5">
            Ver todas as demandas →
          </Link>
        </div>

      </div>

    </div>
  );
}
