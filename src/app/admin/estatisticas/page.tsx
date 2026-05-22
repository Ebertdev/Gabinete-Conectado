'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, Clock, CheckCircle2, Calendar, Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const allMonthlyData = [
  { month: 'Jun', demandas: 90, resolvidas: 70 },
  { month: 'Jul', demandas: 110, resolvidas: 85 },
  { month: 'Ago', demandas: 130, resolvidas: 100 },
  { month: 'Set', demandas: 140, resolvidas: 110 },
  { month: 'Out', demandas: 160, resolvidas: 125 },
  { month: 'Nov', demandas: 150, resolvidas: 115 },
  { month: 'Dez', demandas: 120, resolvidas: 90 },
  { month: 'Jan', demandas: 180, resolvidas: 140 },
  { month: 'Fev', demandas: 250, resolvidas: 190 },
  { month: 'Mar', demandas: 290, resolvidas: 220 },
  { month: 'Abr', demandas: 340, resolvidas: 270 },
  { month: 'Mai', demandas: 410, resolvidas: 320 },
];

const neighborhoodData = [
  { name: 'Centro', count: 145 },
  { name: 'Gleba A', count: 112 },
  { name: 'Vila Abrantes', count: 98 },
  { name: 'Ponto Certo', count: 86 },
  { name: 'Arembepe', count: 74 },
  { name: 'Phoc II', count: 65 },
];

const categoryData = [
  { name: 'Infraestrutura', value: 35, color: '#f59e0b' },
  { name: 'Saúde', value: 25, color: '#ef4444' },
  { name: 'Educação & Seg.', value: 20, color: '#8b5cf6' },
  { name: 'Limpeza Urbana', value: 20, color: '#10b981' },
];

export default function EstatisticasPage() {
  const [timeRange, setTimeRange] = useState('6M');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const itemCount = timeRange === '1M' ? 1 : timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : 12;
  const currentMonthlyData = allMonthlyData.slice(-itemCount);

  const totalDemands = currentMonthlyData.reduce((acc, curr) => acc + (curr.demandas || 0), 0);
  const totalResolved = currentMonthlyData.reduce((acc, curr) => acc + (curr.resolvidas || 0), 0);
  const efficiencyRate = totalDemands > 0 ? ((totalResolved / totalDemands) * 100).toFixed(1) : '0';

  const exportCSV = () => {
    const headers = ['Mês', 'Demandas Recebidas', 'Demandas Resolvidas', 'Taxa de Eficiência'];
    const rows = currentMonthlyData.map(d => [
      d.month,
      d.demandas,
      d.resolvidas,
      `${((d.resolvidas / d.demandas) * 100).toFixed(1)}%`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(";") + "\n"
      + rows.map(e => e.join(";")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `estatisticas_gabinete_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text("Relatório de Inteligência - Gabinete Conectado", 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text(`Período de Análise: Últimos ${timeRange}`, 14, 30);
      doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 36);

      doc.setFontSize(12);
      doc.setTextColor(16, 185, 129);
      doc.text(`Resumo do Período: ${totalDemands} recebidas | ${totalResolved} resolvidas (${efficiencyRate}% eficiência)`, 14, 46);

      const headers = [['Mês', 'Demandas Recebidas', 'Demandas Resolvidas', 'Taxa Eficiência']];
      const data = currentMonthlyData.map(d => [
        d.month, 
        d.demandas.toString(), 
        d.resolvidas.toString(), 
        `${((d.resolvidas / d.demandas) * 100).toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: 54,
        head: headers,
        body: data,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 10, cellPadding: 6 },
      });

      doc.save(`relatorio_estatisticas_${timeRange}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Não foi possível gerar o PDF. Verifique as configurações do navegador.');
    } finally {
      setShowExportMenu(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estatísticas e Inteligência</h1>
          <p className="text-gray-500 mt-1">Análise de dados do gabinete para tomada de decisão estratégica em Camaçari.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex bg-gray-100 p-1 rounded-xl">
            {['1M', '3M', '6M', '1A'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === range ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {range}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" /> Exportar Relatório <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-30 py-1 animate-in zoom-in-95 duration-100">
                <button
                  onClick={exportCSV}
                  className="w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 text-gray-800 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Exportar em CSV
                </button>
                <button
                  onClick={exportPDF}
                  className="w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 text-gray-800 transition-colors"
                >
                  <FileText className="w-4 h-4 text-red-500" /> Exportar em PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-violet-50 rounded-full z-0 pointer-events-none"></div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-gray-500">Taxa de Eficiência ({timeRange})</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{efficiencyRate}%</h3>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-2">
              <TrendingUp className="w-4 h-4" /> {totalResolved} concluídas
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 rounded-full z-0 pointer-events-none"></div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-gray-500">Volume no Período</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{totalDemands}</h3>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-2">
              <Clock className="w-4 h-4" /> Demandas recebidas
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-50 rounded-full z-0 pointer-events-none"></div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-gray-500">Bairro com Mais Acessos</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-2">Centro</h3>
            <div className="flex items-center gap-1 text-amber-600 text-xs font-bold mt-2">
              145 ocorrências registradas
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-50 rounded-full z-0 pointer-events-none"></div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-gray-500">Categoria Mais Crítica</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-2">Infraestrutura</h3>
            <div className="flex items-center gap-1 text-red-600 text-xs font-bold mt-2">
              35% do volume total
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section 1: Line & Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Area Chart: Monthly Evolution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Evolução de Solicitações (Últimos {timeRange})</h3>
              <p className="text-xs text-gray-500 font-medium">Comparativo entre demandas recebidas e resolvidas</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-violet-700">
                <span className="w-3 h-3 rounded-full bg-violet-600"></span> Recebidas
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Resolvidas
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemandas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolvidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="demandas" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorDemandas)" />
                <Area type="monotone" dataKey="resolvidas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolvidas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Categories */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Distribuição por Categoria</h3>
            <p className="text-xs text-gray-500 font-medium">Cores oficiais do Gabinete Conectado</p>
          </div>

          <div className="flex-1 flex items-center justify-center my-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            {categoryData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0 shadow-xs" style={{ backgroundColor: item.color }}></span>
                <span className="text-xs font-bold text-gray-700 truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bar Chart: Neighborhood Distribution */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Bairros com Maior Incidência</h3>
            <p className="text-xs text-gray-500 font-medium">Mapeamento de foco de atenção na cidade</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={neighborhoodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} cursor={{ fill: '#f3f4f6' }} />
              <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
