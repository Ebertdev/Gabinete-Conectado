'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Download, FileSpreadsheet, FileText, ChevronDown, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/infrastructure/supabase/client';

type MonthlyDataPoint = { month: string; demandas: number; resolvidas: number };
type NeighborhoodDataPoint = { name: string; count: number };
type CategoryDataPoint = { name: string; value: number; color: string };

const CATEGORY_COLORS: Record<string, string> = {
  'Infraestrutura': '#f59e0b',
  'Saúde': '#ef4444',
  'Educação': '#8b5cf6',
  'Segurança': '#6366f1',
  'Limpeza Urbana': '#10b981',
  'Iluminação': '#f97316',
  'Outros': '#6b7280',
};

export default function EstatisticasPage() {
  const [timeRange, setTimeRange] = useState('6M');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [neighborhoodData, setNeighborhoodData] = useState<NeighborhoodDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDataPoint[]>([]);
  const [topBairro, setTopBairro] = useState({ name: '—', count: 0 });
  const [topCategoria, setTopCategoria] = useState({ name: '—', pct: 0 });

  const itemCount = timeRange === '1M' ? 1 : timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : 12;
  const currentMonthlyData = monthlyData.slice(-itemCount);

  const totalDemands = currentMonthlyData.reduce((acc, curr) => acc + (curr.demandas || 0), 0);
  const totalResolved = currentMonthlyData.reduce((acc, curr) => acc + (curr.resolvidas || 0), 0);
  const efficiencyRate = totalDemands > 0 ? ((totalResolved / totalDemands) * 100).toFixed(1) : '0';

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch all non-archived demands with date and type
      const { data, error } = await supabase
        .from('demandas')
        .select('status, tipo, bairro, data_criacao')
        .eq('arquivado', false);

      if (error) throw error;
      if (!data) return;

      // --- Monthly Evolution (last 12 months) ---
      const monthMap: Record<string, { demandas: number; resolvidas: number }> = {};
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      // Build last 12 months as keys
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap[key] = { demandas: 0, resolvidas: 0 };
      }

      data.forEach((d: any) => {
        const date = new Date(d.data_criacao);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthMap[key] !== undefined) {
          monthMap[key].demandas++;
          if (d.status === 'Resolvida') monthMap[key].resolvidas++;
        }
      });

      const builtMonthly = Object.entries(monthMap).map(([key, val]) => {
        const [year, month] = key.split('-');
        return {
          month: `${monthNames[parseInt(month) - 1]}/${year.slice(2)}`,
          demandas: val.demandas,
          resolvidas: val.resolvidas,
        };
      });
      setMonthlyData(builtMonthly);

      // --- Neighborhood Distribution ---
      const bairroMap: Record<string, number> = {};
      data.forEach((d: any) => {
        const b = d.bairro || 'Não informado';
        bairroMap[b] = (bairroMap[b] || 0) + 1;
      });
      const sortedBairros = Object.entries(bairroMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count]) => ({ name, count }));
      setNeighborhoodData(sortedBairros);

      if (sortedBairros.length > 0) {
        setTopBairro({ name: sortedBairros[0].name, count: sortedBairros[0].count });
      }

      // --- Category Distribution ---
      const catMap: Record<string, number> = {};
      data.forEach((d: any) => {
        const t = d.tipo || 'Outros';
        catMap[t] = (catMap[t] || 0) + 1;
      });
      const totalCat = Object.values(catMap).reduce((a, b) => a + b, 0) || 1;
      const builtCats = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, val]) => ({
          name,
          value: Math.round((val / totalCat) * 100),
          color: CATEGORY_COLORS[name] || '#6b7280',
        }));
      setCategoryData(builtCats);

      if (builtCats.length > 0) {
        setTopCategoria({ name: builtCats[0].name, pct: builtCats[0].value });
      }
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const exportCSV = () => {
    const headers = ['Mês', 'Demandas Recebidas', 'Demandas Resolvidas', 'Taxa de Eficiência'];
    const rows = currentMonthlyData.map(d => [
      d.month,
      d.demandas,
      d.resolvidas,
      d.demandas > 0 ? `${((d.resolvidas / d.demandas) * 100).toFixed(1)}%` : '0%',
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
      doc.text(`Resumo: ${totalDemands} recebidas | ${totalResolved} resolvidas (${efficiencyRate}% eficiência)`, 14, 46);

      const headers = [['Mês', 'Demandas Recebidas', 'Demandas Resolvidas', 'Taxa Eficiência']];
      const tableData = currentMonthlyData.map(d => [
        d.month,
        d.demandas.toString(),
        d.resolvidas.toString(),
        d.demandas > 0 ? `${((d.resolvidas / d.demandas) * 100).toFixed(1)}%` : '0%',
      ]);

      autoTable(doc, {
        startY: 54,
        head: headers,
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 10, cellPadding: 6 },
      });

      doc.save(`relatorio_estatisticas_${timeRange}.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Não foi possível gerar o PDF.');
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
          <p className="text-gray-500 mt-1">Análise de dados reais do gabinete para tomada de decisão estratégica.</p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="inline-flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto justify-between">
            {['1M', '3M', '6M', '1A'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === range ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm w-full sm:w-auto"
            >
              <Download className="w-4 h-4" /> Exportar Relatório <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-30 py-1 animate-in zoom-in-95 duration-100">
                <button onClick={exportCSV} className="w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 text-gray-800 transition-colors">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Exportar em CSV
                </button>
                <button onClick={exportPDF} className="w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 text-gray-800 transition-colors">
                  <FileText className="w-4 h-4 text-red-500" /> Exportar em PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <span className="text-gray-500 font-medium text-sm">Calculando estatísticas em tempo real...</span>
        </div>
      ) : (
        <>
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
                <p className="text-sm font-semibold text-gray-500">Bairro com Mais Demandas</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-2 truncate">{topBairro.name}</h3>
                <div className="flex items-center gap-1 text-amber-600 text-xs font-bold mt-2">
                  {topBairro.count} ocorrências registradas
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-50 rounded-full z-0 pointer-events-none"></div>
              <div className="relative z-10">
                <p className="text-sm font-semibold text-gray-500">Categoria Mais Crítica</p>
                <h3 className="text-2xl font-extrabold text-gray-900 mt-2 truncate">{topCategoria.name}</h3>
                <div className="flex items-center gap-1 text-red-600 text-xs font-bold mt-2">
                  {topCategoria.pct}% do volume total
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section 1: Area & Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Area Chart: Monthly Evolution */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Evolução de Solicitações (Últimos {timeRange})</h3>
                  <p className="text-xs text-gray-500 font-medium">Comparativo entre demandas recebidas e resolvidas</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-violet-700">
                    <span className="w-3 h-3 rounded-full bg-violet-600"></span> Recebidas
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Resolvidas
                  </span>
                </div>
              </div>

              <div className="h-72 w-full">
                {currentMonthlyData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium text-sm">
                    Sem dados para o período selecionado.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDemandas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorResolvidas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="demandas" name="Recebidas" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorDemandas)" />
                      <Area type="monotone" dataKey="resolvidas" name="Resolvidas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolvidas)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Donut Chart: Categories */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Distribuição por Categoria</h3>
                <p className="text-xs text-gray-500 font-medium">Baseado nos dados reais do gabinete</p>
              </div>

              {categoryData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 font-medium text-sm text-center">
                  Nenhuma demanda registrada para gerar o gráfico.
                </div>
              ) : (
                <>
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
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                          formatter={(value: any) => [`${value}%`, 'Participação']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                    {categoryData.map(item => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0 shadow-xs" style={{ backgroundColor: item.color }}></span>
                        <span className="text-xs font-bold text-gray-700 truncate">{item.name} ({item.value}%)</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Bar Chart: Neighborhood Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Bairros com Maior Incidência</h3>
                <p className="text-xs text-gray-500 font-medium">Mapeamento de foco de atenção na cidade</p>
              </div>
            </div>

            {neighborhoodData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400 font-medium text-sm">
                Sem dados de bairros para exibir.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={neighborhoodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="count" name="Demandas" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
