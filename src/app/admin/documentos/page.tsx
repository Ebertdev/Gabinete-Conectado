'use client';

import { useState, useEffect } from 'react';
import { FolderOpen, Sparkles, FileText, Download, Upload, Plus, Search, Copy, Check, Printer, Trash2, FileCode, Clock, Building, ArrowRight, Loader2, Tag, Eye, X, Lock, Zap } from 'lucide-react';
import type { PlanType } from '../assinatura/page';

type DocumentItem = {
  id: string;
  code: string;
  title: string;
  category: 'Indicação' | 'Ofício' | 'Projeto de Lei' | 'Moção' | 'Requerimento';
  date: string;
  status: 'Aprovado' | 'Enviado' | 'Rascunho' | 'Aguardando Resposta';
  recipient: string;
  size: string;
  contentSnippet: string;
  fullContent: string;
};

const initialDocuments: DocumentItem[] = [
  {
    id: '1',
    code: 'IND-045/2026',
    title: 'Pavimentação Asfáltica e Drenagem na Gleba A',
    category: 'Indicação',
    date: '15/05/2026',
    status: 'Aprovado',
    recipient: 'Mesa Diretora / SEINFRA',
    size: '240 KB',
    contentSnippet: 'Indica ao Chefe do Poder Executivo Municipal a necessidade imperiosa de recapeamento asfáltico e desobstrução da rede de águas pluviais na Rua Principal da Gleba A.',
    fullContent: `ESTADO DA BAHIA\nCÂMARA MUNICIPAL DE CAMAÇARI\nGabinete Parlamentar\n\nINDICAÇÃO Nº 045/2026\n\nSenhor Presidente,\nSenhores Vereadores,\n\nO Vereador que esta subscreve, no uso de suas atribuições regimentais e amparado pelo Regimento Interno desta Casa Legislativa, INDICA ao Excelentíssimo Senhor Prefeito Municipal, com cópia para a Secretaria de Infraestrutura (SEINFRA), a imediata realização de obras de pavimentação asfáltica, recapeamento e desobstrução completa da rede de águas pluviais na Rua Principal do bairro Gleba A.\n\nJUSTIFICATIVA\n\nA presente solicitação atende a um clamor urgente dos moradores e comerciantes da referida localidade. Durante o período de chuvas, a via fica intransitável devido ao acúmulo de água e buracos extensos, causando prejuízos aos veículos e colocando em risco a integridade física de pedestres e idosos.\n\nA execução desta obra restaurará a dignidade da comunidade, promovendo mobilidade urbana segura e salubridade pública.\n\nSala das Sessões, Camaçari - BA, 15 de Maio de 2026.\n\n____________________________________\nGabinete Conectado de Camaçari`,
  },
  {
    id: '2',
    code: 'OF-112/2026',
    title: 'Solicitação de Insumos Médicos - UPA Arembepe',
    category: 'Ofício',
    date: '14/05/2026',
    status: 'Aguardando Resposta',
    recipient: 'Secretaria de Saúde (SESAU)',
    size: '512 KB',
    contentSnippet: 'Cumprimentando-o cordialmente, sirvo-me do presente para solicitar a normalização imediata do fornecimento de soro fisiológico e antibióticos pediátricos na UPA de Arembepe.',
    fullContent: `ESTADO DA BAHIA\nCÂMARA MUNICIPAL DE CAMAÇARI\nGabinete Parlamentar\n\nOFÍCIO Nº 112/2026\nCamaçari - BA, 14 de Maio de 2026.\n\nAo Ilustríssimo Senhor Secretário Municipal de Saúde,\nSecretaria de Saúde (SESAU) - Camaçari/BA\n\nAssunto: Solicitação Institucional de Insumos Médicos em Caráter de Urgência\n\nCumprimentando-o cordialmente, sirvo-me do presente expediente para levar ao conhecimento desta respeitável Secretaria a grave situação relatada por eleitores e confirmada por nossa equipe de fiscalização na UPA de Arembepe.\n\nConstatou-se a escassez crítica de insumos básicos de atendimento de urgência, notadamente soro fisiológico, seringas e antibióticos da grade pediátrica. Tal situação compromete o atendimento humanizado à população costeira de nosso município.\n\nDiante do exposto, solicitamos a imediata recomposição dos estoques da referida unidade de saúde, garantindo a continuidade do serviço público essencial de saúde.\n\nNa certeza de contarmos com a vossa habitual presteza e sensibilidade com a saúde pública, reiteramos protestos de elevada estima e distinta consideração.\n\nAtenciosamente,\n\n____________________________________\nGabinete Conectado de Camaçari`,
  },
  {
    id: '3',
    code: 'PL-018/2026',
    title: 'Programa Municipal de Inclusão Digital nas Escolas',
    category: 'Projeto de Lei',
    date: '10/05/2026',
    status: 'Enviado',
    recipient: 'Comissão de Constituição e Justiça',
    size: '1.2 MB',
    contentSnippet: 'Institui a política de acesso gratuito à internet de alta velocidade e distribuição de tablets educacionais para alunos da rede pública municipal de ensino.',
    fullContent: `PROJETO DE LEI Nº 018/2026\n\nInstitui o Programa Municipal de Inclusão Digital na Rede Pública de Ensino de Camaçari e dá outras providências.\n\nA CÂMARA MUNICIPAL DE CAMAÇARI APROVA:\n\nArt. 1º - Fica instituído o Programa Municipal de Inclusão Digital, com o objetivo de assegurar acesso universal e gratuito à internet de banda larga em todas as unidades escolares da rede municipal.\n\nArt. 2º - O Poder Executivo garantirá a distribuição de equipamentos tecnológicos (tablets educacionais) aos alunos matriculados no Ensino Fundamental II, mediante critérios socioeconômicos.\n\nArt. 3º - As despesas decorrentes da execução desta Lei correrão por conta de dotações orçamentárias próprias da Secretaria Municipal de Educação (SEDUC).\n\nArt. 4º - Esta Lei entra em vigor na data de sua publicação.\n\nSala das Sessões, 10 de Maio de 2026.`,
  },
  {
    id: '4',
    code: 'MOC-009/2026',
    title: 'Aplausos aos Profissionais de Limpeza Urbana',
    category: 'Moção',
    date: '02/05/2026',
    status: 'Aprovado',
    recipient: 'Câmara Municipal de Camaçari',
    size: '180 KB',
    contentSnippet: 'Requer que conste nos anais desta Casa Legislativa Votos de Congratulações e Aplausos a todos os garis e margaridas pelos serviços de excelência prestados no município.',
    fullContent: `MOÇÃO DE CONGRATULAÇÕES E APLAUSOS Nº 009/2026\n\nA Câmara Municipal de Camaçari, no uso de suas prerrogativas regimentais, faz constar nos anais desta Casa Legislativa Votos de Congratulações e Aplausos a todos os garis e profissionais de limpeza urbana que atuam em nosso município.\n\nJUSTIFICATIVA\n\nO trabalho contínuo, incansável e essencial realizado por estes valorosos trabalhadores mantém a nossa cidade limpa, organizada e higienizada. Mesmo sob intempéries e desafios diários, demonstram dedicação exemplar e espírito comunitário que merecem o profundo reconhecimento do Poder Legislativo.\n\nDê-se ciência desta Moção às associações representativas da categoria.\n\nSala das Sessões, 02 de Maio de 2026.`,
  },
];

export default function DocumentosIAPage() {
  const [activeTab, setActiveTab] = useState<'cofre' | 'ia'>('cofre');
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');
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

  // Vault Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  // IA Generator State
  const [aiDocType, setAiDocType] = useState<'Indicação' | 'Ofício' | 'Requerimento' | 'Moção'>('Indicação');
  const [aiTopic, setAiTopic] = useState('');
  const [aiRecipient, setAiRecipient] = useState('Secretaria de Infraestrutura (SEINFRA)');
  const [aiUrgency, setAiUrgency] = useState('Alta');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copied, setCopied] = useState(false);

  const categories = ['Todos', 'Indicação', 'Ofício', 'Projeto de Lei', 'Moção', 'Requerimento'];

  const categoryBadges: Record<string, string> = {
    'Indicação': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Ofício': 'bg-blue-50 text-blue-800 border-blue-200',
    'Projeto de Lei': 'bg-violet-50 text-violet-800 border-violet-200',
    'Moção': 'bg-amber-50 text-amber-800 border-amber-200',
    'Requerimento': 'bg-rose-50 text-rose-800 border-rose-200',
  };

  const statusColors: Record<string, string> = {
    'Aprovado': 'bg-emerald-100 text-emerald-800 font-bold',
    'Enviado': 'bg-blue-100 text-blue-800 font-bold',
    'Rascunho': 'bg-gray-100 text-gray-800 font-bold',
    'Aguardando Resposta': 'bg-amber-100 text-amber-800 font-bold animate-pulse',
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.recipient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todos' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenDoc = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setIsViewModalOpen(true);
  };

  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este documento do repositório?')) {
      setDocuments(documents.filter(d => d.id !== id));
    }
  };

  // IA Generator Execution
  const handleGenerateAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic) return;

    setAiGenerating(true);
    setGeneratedContent('');
    setCopied(false);

    setTimeout(() => {
      let draft = '';
      const dateStr = new Date().toLocaleDateString('pt-BR');

      if (aiDocType === 'Indicação') {
        draft = `ESTADO DA BAHIA\nCÂMARA MUNICIPAL DE CAMAÇARI\nGabinete Parlamentar\n\nINDICAÇÃO Nº ______/2026\n\nSenhor Presidente,\nSenhores Vereadores,\n\nO Vereador que esta subscreve, com amparo nas normas regimentais desta Casa Legislativa, INDICA ao Excelentíssimo Senhor Prefeito Municipal, com cópia para a ${aiRecipient}, a extrema e urgente necessidade de:\n\n"${aiTopic.toUpperCase()}"\n\nJUSTIFICATIVA\n\nA presente proposição atende a justos e reiterados apelos dos moradores da região afetada. Trata-se de uma medida de urgência (${aiUrgency}) indispensável para garantir a segurança, dignidade e o bem-estar social da comunidade local, que vem enfrentando transtornos diários devido à ausência de intervenção pública.\n\nCerto do pronto atendimento por parte do Poder Executivo, submeto o pedido à elevada apreciação dos nobres Pares.\n\nSala das Sessões, Camaçari - BA, ${dateStr}.\n\n__________________________________\nVereador(a) / Gabinete Conectado`;
      } else if (aiDocType === 'Ofício') {
        draft = `ESTADO DA BAHIA\nCÂMARA MUNICIPAL DE CAMAÇARI\nGabinete Parlamentar\n\nOFÍCIO Nº ______/2026\nCamaçari - BA, ${dateStr}.\n\nAo Ilustríssimo(a) Senhor(a) Secretário(a),\n${aiRecipient}\nAssunto: Solicitação Institucional - Regime de Urgência (${aiUrgency})\n\nCumprimentando-o(a) cordialmente, sirvo-me do presente instrumento oficial para levar ao conhecimento desta respeitável Secretaria a demanda advinda dos cidadãos de Camaçari, requerendo providências céleres acerca do seguinte pleito:\n\n${aiTopic}\n\nRessaltamos que a referida solicitação se reveste de alto interesse público e impacto comunitário direto. Colocamo-nos à inteira disposição para eventuais esclarecimentos ou diligências conjuntas no local.\n\nNa certeza de podermos contar com a vossa habitual presteza e espírito público, renovamos protestos de elevada estima e distinta consideração.\n\nAtenciosamente,\n\n__________________________________\nGabinete Conectado de Camaçari`;
      } else if (aiDocType === 'Requerimento') {
        draft = `CÂMARA MUNICIPAL DE CAMAÇARI\n\nREQUERIMENTO DE INFORMAÇÃO Nº ______/2026\n\nRequer informações ao Poder Executivo Municipal acerca de: ${aiTopic}.\n\nSenhor Presidente,\n\nREQUEREMOS, nos termos do Regimento Interno desta Casa, que seja oficiado ao Senhor Prefeito Municipal para que, através dos órgãos competentes (${aiRecipient}), encaminhe a este Gabinete, no prazo legal de 15 (quinze) dias, as seguintes informações detalhadas:\n\n1. Qual o cronograma previsto para a execução e conclusão dos serviços citados?\n2. Há rubrica orçamentária vigente alocada para o atendimento desta finalidade no presente exercício?\n\nSala das Sessões, ${dateStr}.`;
      } else {
        draft = `CÂMARA MUNICIPAL DE CAMAÇARI\n\nMOÇÃO DE CONGRATULAÇÕES / RECONHECIMENTO Nº ______/2026\n\nA Câmara Municipal de Camaçari, no uso de suas atribuições legais, faz inserir na ata de seus trabalhos a presente Moção de Aplausos e Reconhecimento a: ${aiRecipient}.\n\nJUSTIFICATIVA\n\nO merecido destaque se fundamenta na inestimável contribuição e dedicação em prol de: ${aiTopic}. A atuação exemplar engrandece o nosso município e serve de orgulho para toda a nossa sociedade.\n\nCamaçari - BA, ${dateStr}.`;
      }

      setGeneratedContent(draft);
      setAiGenerating(false);
    }, 1500);
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintAI = () => {
    if (!generatedContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Documento Oficial - Gabinete Conectado</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 50px; line-height: 1.6; font-size: 16px; color: #000; white-space: pre-wrap; }
          </style>
        </head>
        <body>${generatedContent}
          <script>
            window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveToVault = () => {
    if (!generatedContent) return;
    const newDoc: DocumentItem = {
      id: Math.random().toString(),
      code: `${aiDocType.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}/2026`,
      title: aiTopic.substring(0, 50) + (aiTopic.length > 50 ? '...' : ''),
      category: aiDocType === 'Requerimento' ? 'Requerimento' : aiDocType === 'Moção' ? 'Moção' : aiDocType,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Rascunho',
      recipient: aiRecipient,
      size: '120 KB',
      contentSnippet: generatedContent.substring(0, 200) + '...',
      fullContent: generatedContent,
    };
    setDocuments([newDoc, ...documents]);
    alert('Documento gerado pela IA salvo no Cofre com sucesso!');
    setActiveTab('cofre');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-emerald-600" /> Cofre de Documentos & IA
          </h1>
          <p className="text-gray-500 mt-1">Repositório em nuvem de ofícios e assistente inteligente de redação legislativa.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="bg-gray-100 p-1 rounded-2xl flex items-center gap-1.5 shadow-inner self-start md:self-auto border border-gray-200/80">
          <button
            onClick={() => setActiveTab('cofre')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs ${activeTab === 'cofre' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <FolderOpen className={`w-4 h-4 ${activeTab === 'cofre' ? 'text-emerald-600' : 'text-gray-400'}`} />
            Cofre Digital ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('ia')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs ${activeTab === 'ia' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'ia' ? 'text-amber-300 animate-spin' : 'text-gray-400'}`} />
            IA Legislativa
          </button>
        </div>
      </div>

      {/* TAB 1: COFRE DIGITAL (VAULT) */}
      {activeTab === 'cofre' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Toolbar */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por código, título ou destinatário..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 text-sm font-semibold text-gray-900 shadow-sm"
                />
              </div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="px-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:border-emerald-500 text-sm shadow-sm"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c === 'Todos' ? 'Todas Categorias' : c}</option>
                ))}
              </select>
            </div>

            <label className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2 text-sm cursor-pointer self-end md:self-auto">
              <Upload className="w-4 h-4 text-emerald-400" /> Upload de Arquivo
              <input type="file" className="hidden" onChange={() => alert('Simulação de upload de arquivo concluída com sucesso.')} />
            </label>
          </div>

          {/* Vault Documents List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDocs.map(doc => (
              <div 
                key={doc.id} 
                onClick={() => handleOpenDoc(doc)}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {doc.code}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${categoryBadges[doc.category]}`}>
                        {doc.category}
                      </span>
                    </div>
                    <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full shadow-xs ${statusColors[doc.status]}`}>
                      {doc.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium mb-4 line-clamp-2">
                    {doc.contentSnippet}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-600" /> {doc.date}</div>
                    <div className="flex items-center gap-1.5"><Building className="w-4 h-4 text-violet-600" /> {doc.recipient}</div>
                    <div className="flex items-center gap-1.5 ml-auto font-mono text-gray-400">{doc.size}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                  <span className="text-xs font-extrabold text-emerald-600 group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                    <Eye className="w-4 h-4" /> Ler Documento Oficial <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={e => { e.stopPropagation(); alert('Iniciando download do arquivo PDF...'); }}
                      className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={e => handleDeleteDoc(doc.id, e)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredDocs.length === 0 && (
              <div className="col-span-full py-16 text-center text-gray-500 font-bold bg-white rounded-2xl border border-gray-200">
                Nenhum documento encontrado no cofre digital.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: IA ASSISTENTE DE REDAÇÃO LEGISLATIVA */}
      {activeTab === 'ia' && (
        <div className="animate-in fade-in duration-300">
          {currentPlan === 'essencial' ? (
            /* Premium Feature Lock Banner */
            <div className="bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden max-w-4xl mx-auto my-8 border border-violet-500/30">
              <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 space-y-6 flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                  <Lock className="w-10 h-10 animate-bounce" />
                </div>

                <div className="inline-block bg-amber-400/10 border border-amber-400/30 px-4 py-1.5 rounded-full text-amber-300 text-xs font-extrabold uppercase tracking-widest">
                  🔒 Recurso Exclusivo dos Planos Inteligente e Mandato Total
                </div>

                <h3 className="text-3xl sm:text-4xl font-black text-white max-w-2xl">
                  Inteligência Artificial Redatora de Peças Oficiais
                </h3>
                
                <p className="text-gray-300 text-base max-w-xl mx-auto font-medium leading-relaxed">
                  A redação autônoma de Projetos de Lei, Indicações, Ofícios e Requerimentos com adequação regimental automática à Lei Orgânica de Camaçari requer o Plano Inteligente (R$ 337/mês) ou superior.
                </p>

                <div className="pt-4 w-full max-w-md">
                  <button 
                    onClick={() => {
                      localStorage.setItem('gabinete_plan', 'inteligente');
                      setCurrentPlan('inteligente');
                      window.dispatchEvent(new Event('planChanged'));
                      alert('Upgrade simulado realizado com sucesso para o Plano Inteligente! IA Legislativa desbloqueada.');
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-950 font-black py-4 px-8 rounded-2xl shadow-xl transition-all transform hover:scale-[1.03] flex items-center justify-center gap-2 text-base"
                  >
                    <Zap className="w-5 h-5 fill-gray-950 text-gray-950" /> Desbloquear com Plano Inteligente
                  </button>
                </div>
                <p className="text-xs text-gray-400">Upgrade imediato para teste sem cobrança em ambiente de demonstração.</p>
              </div>
            </div>
          ) : (
            /* AI Generator Interface */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form Options (5 cols) */}
              <div className="lg:col-span-5 bg-white border border-gray-200 rounded-3xl p-7 shadow-lg self-start">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                  <div className="w-10 h-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Gerador de Peças</h2>
                    <p className="text-xs text-gray-500 mt-0.5 font-medium">Modelos padronizados com base na Lei Orgânica</p>
                  </div>
                </div>

                <form onSubmit={handleGenerateAI} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de Documento</label>
                    <select
                      value={aiDocType}
                      onChange={e => setAiDocType(e.target.value as any)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-violet-500 font-bold text-gray-900 text-sm shadow-sm"
                    >
                      <option value="Indicação">Indicação Legislativa (Obras/Serviços)</option>
                      <option value="Ofício">Ofício de Cobrança / Solicitação</option>
                      <option value="Requerimento">Requerimento de Informação</option>
                      <option value="Moção">Moção de Aplausos / Pesar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Destinatário / Órgão</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Secretaria de Obras ou SESAU"
                      value={aiRecipient}
                      onChange={e => setAiRecipient(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-violet-500 font-medium text-gray-900 text-sm shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nível de Urgência</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Normal', 'Média', 'Alta'].map(u => (
                        <button
                          type="button"
                          key={u}
                          onClick={() => setAiUrgency(u)}
                          className={`py-2 rounded-xl font-bold text-xs transition-all border ${aiUrgency === u ? 'bg-violet-600 text-white border-violet-600 shadow-md' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Resumo do Assunto / Demanda</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Descreva o problema ou pleito. Ex: Moradores da rua X pedem instalação de semáforo urgente devido a acidentes constantes."
                      value={aiTopic}
                      onChange={e => setAiTopic(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-violet-500 font-medium text-gray-900 text-sm resize-none shadow-sm"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <button
                      type="submit"
                      disabled={aiGenerating || !aiTopic}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold py-4 px-6 rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                    >
                      {aiGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Redigindo Peça Oficial...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                          Gerar Documento com IA
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Generated Preview Output (7 cols) */}
              <div className="lg:col-span-7 flex flex-col h-full">
                <div className="bg-gray-900 text-white rounded-t-3xl p-6 border-b border-gray-800 flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-3">
                    <FileCode className="w-6 h-6 text-emerald-400" />
                    <div>
                      <h3 className="font-extrabold text-lg">Visualizador de Documento</h3>
                      <p className="text-xs text-gray-400">Edição livre e formatação automática</p>
                    </div>
                  </div>
                  
                  {generatedContent && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="bg-gray-800 border border-gray-700 text-gray-200 px-3.5 py-2 rounded-xl font-bold text-xs hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                        title="Copiar texto formatado"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copiado!' : 'Copiar'}
                      </button>
                      <button
                        onClick={handlePrintAI}
                        className="bg-gray-800 border border-gray-700 text-gray-200 px-3.5 py-2 rounded-xl font-bold text-xs hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                        title="Imprimir ou Salvar PDF"
                      >
                        <Printer className="w-4 h-4 text-emerald-400" /> Imprimir / PDF
                      </button>
                      <button
                        onClick={handleSaveToVault}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Upload className="w-4 h-4" /> Salvar no Cofre
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white border-x border-b border-gray-200 rounded-b-3xl p-8 shadow-xl flex-1 min-h-[500px]">
                  {aiGenerating ? (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300">
                      <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center shadow-inner">
                        <Sparkles className="w-8 h-8 animate-spin" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-bold text-gray-900">IA Analisando Fundamentação Jurídica...</h4>
                        <p className="text-sm text-gray-500 font-medium max-w-sm mx-auto">
                          Formatando cabeçalho oficial, parágrafos de justificativa e referências regimentais para Camaçari.
                        </p>
                      </div>
                    </div>
                  ) : generatedContent ? (
                    <textarea
                      value={generatedContent}
                      onChange={e => setGeneratedContent(e.target.value)}
                      className="w-full h-full min-h-[450px] font-serif text-gray-900 leading-relaxed outline-none border-0 resize-none text-base p-2 focus:ring-0"
                    />
                  ) : (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-3 text-gray-400 animate-in fade-in">
                      <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-gray-700 text-lg">Nenhuma peça gerada ainda</h4>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                          Preencha os campos ao lado e clique em "Gerar Documento com IA" para redigir instantaneamente.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vault View Document Modal */}
      {isViewModalOpen && selectedDoc && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 w-full max-w-3xl shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-black text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                    {selectedDoc.code}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${categoryBadges[selectedDoc.category]}`}>
                    {selectedDoc.category}
                  </span>
                  <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${statusColors[selectedDoc.status]}`}>
                    {selectedDoc.status}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedDoc.title}</h2>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 py-2 pr-2">
              <div className="grid grid-cols-2 gap-4 text-sm font-semibold bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-xs text-gray-500 block mb-0.5">Destinatário / Órgão:</span>
                  <span className="text-gray-900">{selectedDoc.recipient}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block mb-0.5">Data de Protocolo:</span>
                  <span className="text-gray-900">{selectedDoc.date}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider mb-2">Teor Integral do Documento Oficial</h4>
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl font-serif text-gray-900 leading-relaxed text-base whitespace-pre-wrap selection:bg-emerald-100">
                  {selectedDoc.fullContent || selectedDoc.contentSnippet}
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-gray-500">Tamanho do Arquivo em Nuvem: <strong>{selectedDoc.size}</strong></span>
              <div className="flex gap-3">
                <button
                  onClick={() => { alert('Iniciando impressão oficial...'); }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-5 rounded-xl transition-colors flex items-center gap-2 text-sm shadow-xs"
                >
                  <Printer className="w-4 h-4" /> Imprimir Cópia
                </button>
                <button
                  onClick={() => { alert('Download do arquivo PDF concluído com sucesso!'); }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 text-sm shadow-sm"
                >
                  <Download className="w-4 h-4" /> Baixar Arquivo PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
