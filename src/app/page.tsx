'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  FolderOpen, 
  BarChart3, 
  MapPin, 
  Users, 
  Settings, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Building2, 
  ShieldCheck, 
  Menu, 
  X, 
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Clock,
  Printer
} from 'lucide-react';
import { Logo } from '@/components/logo';

// Eber's WhatsApp Contact Number
const WHATSAPP_PHONE = '5571993211494';

export default function MarketingLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeScreenTab, setActiveScreenTab] = useState<'dashboard' | 'kanban' | 'agenda' | 'ia' | 'mapa' | 'cidadaos'>('dashboard');

  const plans = [
    {
      id: 'essencial',
      name: 'Plano Essencial',
      badge: 'Iniciante',
      price: '247',
      desc: 'Estrutura sólida para gabinetes que estão iniciando na digitalização.',
      features: [
        'Até 5 Contas de Assessores',
        'Cadastro de Cidadãos e Lideranças',
        'Caixa de Entrada de Demandas',
        'Agenda Parlamentar Mensal',
      ],
      lockedFeatures: [
        'Redação de Ofícios/PLs com IA',
        'Relatórios de Bairros (BI e Geo)',
        'Automação de WhatsApp',
      ],
      color: 'border-gray-200 hover:border-gray-300',
      btnColor: 'bg-gray-900 hover:bg-gray-800 text-white',
      msg: 'Olá! Gostaria de saber mais sobre o Plano Essencial do Gabinete Conectado.'
    },
    {
      id: 'inteligente',
      name: 'Plano Inteligente',
      badge: 'Popular',
      price: '337',
      desc: 'O favorito dos gabinetes modernos. Libera o assistente de IA Legislativa e BI.',
      features: [
        'IA Redatora de Projetos e Ofícios',
        'Até 15 Contas de Assessores',
        'Mapa Geoespacial de Cidadãos',
        'BI e Gráficos de Demandas por Bairro',
        'Esteira Kanban de Atendimento',
        'Notificações Diretas WhatsApp',
      ],
      lockedFeatures: [],
      color: 'border-emerald-500/40 ring-4 ring-emerald-500/10 shadow-emerald-950/20 bg-slate-900/60 scale-[1.02]',
      btnColor: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20 shadow-lg',
      recommended: true,
      msg: 'Olá! Gostaria de saber mais sobre o Plano Inteligente do Gabinete Conectado e iniciar o teste de 14 dias.'
    },
    {
      id: 'enterprise',
      name: 'Mandato Total',
      badge: 'VIP / Líder',
      price: '697',
      desc: 'Para vereadores e deputados com equipes amplas e máxima capilaridade.',
      features: [
        'Tudo do Plano Inteligente',
        'Assessores e Lideranças Ilimitados',
        'Automação Completa via WhatsApp API',
        'Cofre Digital Ilimitado em Nuvem',
        'Exportação de Relatórios para Prestação',
        'Suporte VIP 24/7 com Gerente Dedicado',
      ],
      lockedFeatures: [],
      color: 'border-violet-500/40 hover:border-violet-400/60',
      btnColor: 'bg-violet-600 hover:bg-violet-700 text-white',
      msg: 'Olá! Gostaria de saber mais sobre o Plano Mandato Total do Gabinete Conectado.'
    }
  ];

  const screenDetails = {
    dashboard: {
      title: 'Dashboard Analítico',
      icon: LayoutDashboard,
      desc: 'Visualize em tempo real o volume de demandas recebidas, em andamento e resolvidas. Acompanhe taxas de eficiência do mandato com gráficos interativos e exportação direta.',
      benefits: ['Indicadores chave (KPIs) de desempenho', 'Gráficos de evolução mensal', 'Monitor de eficiência do gabinete'],
      imageSnippet: (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-white text-base">Indicadores do Gabinete</h4>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold">Camaçari</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-gray-400 block font-bold">EFICIÊNCIA</span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-1">71.3%</span>
              <span className="text-[9px] text-emerald-400 font-bold block mt-1">▲ +3% este mês</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-gray-400 block font-bold">RECEBIDAS</span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-1">1,248</span>
              <span className="text-[9px] text-emerald-400 font-bold block mt-1">▲ +12% este mês</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <span className="text-[10px] text-gray-400 block font-bold">RESOLVIDAS</span>
              <span className="text-xl sm:text-2xl font-black text-white block mt-1">890</span>
              <span className="text-[9px] text-gray-500 font-bold block mt-1">Dentro do prazo</span>
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl h-24 flex items-center justify-center text-xs text-gray-500 font-bold">
            [ Gráficos Recharts Responsivos Integrados ]
          </div>
        </div>
      )
    },
    kanban: {
      title: 'Esteira Kanban de Demandas',
      icon: FileText,
      desc: 'Gerencie o fluxo de solicitações da população através de colunas visuais: Entrada, Encaminhado, Em Andamento e Concluído. Filtre por bairro ou urgência instantaneamente.',
      benefits: ['Acompanhamento visual de status', 'Filtro rápido por bairro e protocolo', 'Ações de arrastar e soltar (Kanban)'],
      imageSnippet: (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-white text-sm">Esteira de Trabalho (Caixa de Entrada)</h4>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">Pendente</span>
              <p className="text-xs font-bold text-white leading-tight">Poda de árvores na praça</p>
              <p className="text-[10px] text-gray-500">Gleba A • Protocolo #908</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">Encaminhado</span>
              <p className="text-xs font-bold text-white leading-tight">Reparo de iluminação pública</p>
              <p className="text-[10px] text-gray-500">Centro • Protocolo #906</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">Concluído</span>
              <p className="text-xs font-bold text-white leading-tight">Tapa-buracos na via principal</p>
              <p className="text-[10px] text-gray-500">Abrantes • Protocolo #901</p>
            </div>
          </div>
        </div>
      )
    },
    agenda: {
      title: 'Agenda Parlamentar Inteligente',
      icon: Calendar,
      desc: 'Organize as reuniões, visitas de campo e sessões legislativas do seu mandato. Agende compromissos diretamente no calendário com notificações de WhatsApp pré-configuradas.',
      benefits: ['Grade mensal interativa', 'Disparo de lembrete com WhatsApp', 'Status de eventos centralizado'],
      imageSnippet: (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-white text-sm">Agenda de Atendimentos</h4>
            <span className="text-[10px] text-emerald-400 font-bold">Maio 2026</span>
          </div>
          <div className="space-y-2">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Audiência SESAU (Saúde)</p>
                <p className="text-[10px] text-gray-400">15:00 • Centro Administrativo</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">Confirmado</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Vistoria de Drenagem</p>
                <p className="text-[10px] text-gray-400">09:30 • Vila de Abrantes</p>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">Pendente</span>
            </div>
          </div>
        </div>
      )
    },
    ia: {
      title: 'IA Redatora Legislativa',
      icon: Sparkles,
      desc: 'Redija Projetos de Lei, Indicações, Ofícios e Requerimentos de forma autônoma e regimental. A IA do Gabinete Conectado economiza dezenas de horas de trabalho técnico.',
      benefits: ['Gerador automático de cabeçalho regimental', 'Fundamentação baseada na Lei Orgânica', 'Ferramenta de cópia rápida e impressão'],
      imageSnippet: (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
              <span className="text-xs font-bold text-white">Rascunho de Indicação Legislativa</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">IND-452/2026</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-serif text-[10px] text-gray-300 leading-relaxed whitespace-pre-wrap">
            {"ESTADO DA BAHIA\nCÂMARA MUNICIPAL DE CAMAÇARI\n\nINDICA ao Excelentíssimo Senhor Prefeito Municipal... a necessidade urgente de pavimentação asfáltica e drenagem pluvial na Gleba A."}
          </div>
        </div>
      )
    },
    mapa: {
      title: 'Mapa Geoespacial',
      icon: MapPin,
      desc: 'Identifique visualmente no mapa municipal a origem das demandas da população. Mapeie carências de infraestrutura, saúde ou saneamento por bairros para atuar de forma cirúrgica.',
      benefits: ['Visualização em tempo real com Leaflet', 'Filtro dinâmico por categoria de queixa', 'Mapeamento de focos de insatisfação pública'],
      imageSnippet: (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-white text-sm">Mapa de Demandas - Camaçari</h4>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl h-28 flex flex-col items-center justify-center text-xs text-gray-500 font-bold gap-2">
            <MapPin className="w-6 h-6 text-emerald-500 animate-bounce" />
            <span>[ Mapa Interativo Leaflet Carregado ]</span>
          </div>
        </div>
      )
    },
    cidadaos: {
      title: 'Controle de Cidadãos & LGPD',
      icon: Users,
      desc: 'Centralize dados de contato da população e das lideranças comunitárias. Gerencie autorizações da LGPD com termo digital de aceite e histórico de interações registradas.',
      benefits: ['Ficha cadastral completa com histórico', 'Exportação e anonimização LGPD (Art. 18)', 'Disparo segmentado de WhatsApp por bairro'],
      imageSnippet: (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">J</div>
              <div>
                <p className="text-xs font-bold text-white">João da Silva</p>
                <p className="text-[10px] text-gray-500">Abrantes • (71) 99999-1111</p>
              </div>
            </div>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">LGPD OK</span>
          </div>
          <div className="space-y-1.5">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px] text-gray-400">
              <span className="font-bold text-gray-300 block mb-0.5">Anotação Assessor Carlos (12/05/2026):</span>
              Cidadão veio ao gabinete agradecer pela resolução do asfalto.
            </div>
          </div>
        </div>
      )
    }
  };

  const SelectedIcon = screenDetails[activeScreenTab].icon;

  return (
    <div className="min-h-screen bg-slate-950 text-gray-300 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo dark className="h-9 scale-110" />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-400">
            <a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a>
            <a href="#telas" className="hover:text-white transition-colors">Telas do Software</a>
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos & Preços</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-bold text-gray-300 hover:text-white transition-colors px-4 py-2"
            >
              Acessar Painel
            </Link>
            <Link 
              href="mailto:suporte.gabineteinteligente@gmail.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-emerald-500 text-slate-950 text-sm font-black px-5 py-2.5 rounded-xl hover:bg-emerald-400 transition-all hover:scale-[1.02] shadow-emerald-500/10 shadow-lg"
            >
              Entrar em contato
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-900 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200">
            <a 
              href="#como-funciona" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-gray-400 hover:text-white"
            >
              Como Funciona
            </a>
            <a 
              href="#telas" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-gray-400 hover:text-white"
            >
              Telas do Software
            </a>
            <a 
              href="#recursos" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-gray-400 hover:text-white"
            >
              Recursos
            </a>
            <a 
              href="#planos" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-semibold text-gray-400 hover:text-white"
            >
              Planos & Preços
            </a>
            <hr className="border-slate-900 my-4" />
            <div className="flex flex-col gap-3">
              <Link 
                href="/login" 
                className="w-full text-center py-3 border border-slate-800 rounded-xl font-bold text-gray-300 hover:text-white"
              >
                Acessar Painel
              </Link>
              <a 
                href="mailto:suporte.gabineteinteligente@gmail.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full text-center py-3 bg-emerald-500 text-slate-950 rounded-xl font-black"
              >
                Entrar em contato
              </a>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero text (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Mandato Legislativo de Alta Performance
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              Substitua planilhas improvisadas por <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-violet-400 bg-clip-text text-transparent">Governança Digital</span>
            </h1>
            
            <p className="text-gray-400 text-base sm:text-lg max-w-xl font-medium leading-relaxed">
              O Gabinete Conectado é a ferramenta definitiva para parlamentares gerenciarem as demandas da população, mapearem focos geoespaciais, redigirem peças com IA e organizarem atendimentos sem burocracia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#planos"
                className="bg-emerald-500 text-slate-950 font-black px-8 py-4 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15"
              >
                Ver Planos & Preços <ArrowRight className="w-4 h-4" />
              </a>
              <Link 
                href="mailto:suporte.gabineteinteligente@gmail.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-slate-900 border border-slate-800 text-gray-200 font-bold px-8 py-4 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-500" /> Entrar em contato
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-6 border-t border-slate-900 text-xs text-gray-500 font-semibold">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> 100% Adequado à LGPD</span>
              <span>•</span>
              <span>14 Dias de Teste Grátis</span>
              <span>•</span>
              <span>Sem Multa ou Fidelidade</span>
            </div>
          </div>

          {/* Hero interactive screen preview mockup (5 cols) */}
          
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-violet-600 rounded-3xl blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-900 border border-slate-800/80 rounded-3xl p-6 shadow-2xl text-left space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 block"></span>
                </div>
                <span className="text-[10px] font-mono text-gray-500">gabineteconectado.com.br/admin</span>
              </div>
              
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Visualização Rápida</span>
                  <span className="text-[10px] text-gray-500">Camaçari-BA</span>
                </div>
                <div className="h-28 bg-slate-900 rounded-lg flex items-center justify-center text-xs text-gray-500 font-bold border border-slate-800/60">
                  [ Painel de Gestão e Dashboard Principal ]
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-400 font-bold">12 Assessores Ativos</span>
                  <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> 890 Demandas Resolvidas
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-extrabold hover:underline"
                >
                  Fazer login demonstrativo <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 bg-slate-950/60 border-y border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Como Funciona a Operação</h2>
            <p className="text-gray-400 text-sm sm:text-base font-medium">
              Elimine gargalos e conecte o gabinete de ponta a ponta: do envio do cidadão no celular até o ofício pronto pela IA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8 text-left space-y-4 hover:border-slate-800 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Cidadão Solicita</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                O eleitor preenche o formulário online personalizado do gabinete ("Voz da Cidade") enviando fotos, localização e detalhes sem precisar instalar nada.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8 text-left space-y-4 hover:border-slate-800 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Assessores Triam</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                A equipe recebe as demandas no Kanban, define a urgência, gera o termo de LGPD e despacha para as pastas ou secretarias públicas mapeadas no mapa.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-8 text-left space-y-4 hover:border-slate-800 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-white">IA Redige & Notifica</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">
                O assessor gera indicações ou ofícios com IA com um clique, imprime ou exporta, e avisa o cidadão no WhatsApp de forma automatizada sobre a resposta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TELAS DO SISTEMA (INTERACTIVE CAROUSEL GRID) */}
      <section id="telas" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Gerenciamento Integrado</h2>
            <p className="text-gray-400 text-sm sm:text-base font-medium">
              Conheça as principais telas do Gabinete Conectado preparadas para organizar a rotina parlamentar.
            </p>
          </div>

          {/* Screen Tabs Selector */}
          <div className="flex border-b border-slate-900 overflow-x-auto gap-2 pb-px justify-start lg:justify-center">
            {Object.keys(screenDetails).map((key) => {
              const Icon = screenDetails[key as keyof typeof screenDetails].icon;
              const isActive = activeScreenTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveScreenTab(key as any)}
                  className={`flex items-center gap-2 px-5 py-4 border-b-2 font-bold text-xs uppercase tracking-wider transition-colors shrink-0 ${
                    isActive 
                      ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' 
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {screenDetails[key as keyof typeof screenDetails].title.split(' ')[0]}
                </button>
              );
            })}
          </div>

          {/* Selected Screen Tab Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-slate-900/30 border border-slate-900 rounded-3xl p-8 sm:p-12 text-left shadow-xl">
            {/* Info Column (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <SelectedIcon className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-white">
                  {screenDetails[activeScreenTab].title}
                </h3>
              </div>

              <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-medium">
                {screenDetails[activeScreenTab].desc}
              </p>

              <ul className="space-y-3 text-sm font-semibold text-gray-300">
                {screenDetails[activeScreenTab].benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <Link 
                  href="/login"
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md"
                >
                  Ver no Painel <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Visual Column (6 cols) */}
            <div className="lg:col-span-6">
              {screenDetails[activeScreenTab].imageSnippet}
            </div>
          </div>

        </div>
      </section>

      {/* RECURSOS */}
      <section id="recursos" className="py-20 bg-slate-950/60 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Recursos de Inteligência e Conformidade</h2>
            <p className="text-gray-400 text-sm sm:text-base font-medium">
              Tudo o que seu gabinete necessita para se destacar no ambiente legislativo contemporâneo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-8 space-y-3">
              <Sparkles className="w-8 h-8 text-violet-400" />
              <h4 className="text-lg font-bold text-white">IA Legislativa Inteligente</h4>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
                Gere indicações legislativas de asfalto, saneamento ou ofícios em segundos com a fundamentação padronizada e coerente com a Câmara.
              </p>
            </div>

            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-8 space-y-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <h4 className="text-lg font-bold text-white">Conformidade Plena com a LGPD</h4>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
                Controle de consentimento e termos de segurança. Os dados do cidadão ficam guardados e protegidos por ações de anonimização imediata.
              </p>
            </div>

            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-8 space-y-3">
              <MessageSquare className="w-8 h-8 text-amber-400" />
              <h4 className="text-lg font-bold text-white">Integração WhatsApp</h4>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
                Envie feedbacks ao cidadão sobre o andamento das solicitações no WhatsApp pessoal. Aumente o engajamento e a credibilidade do mandato.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLANOS E PREÇOS */}
      <section id="planos" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Escolha o Plano Ideal para seu Mandato</h2>
            <p className="text-gray-400 text-sm sm:text-base font-medium">
              Todos os planos incluem 14 dias de teste grátis. Escolha o ideal e entre em contato via e‑mail para ativar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`bg-slate-900/30 border-2 rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 ${plan.color}`}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-md">
                    Mais Escolhido
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{plan.badge}</span>
                  </div>

                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  <p className="text-xs text-gray-400 mt-2 font-semibold min-h-[40px] leading-relaxed">
                    {plan.desc}
                  </p>

                  <div className="my-6 py-4 border-y border-slate-900">
                    <div className="text-3xl sm:text-4xl font-black text-white flex items-baseline justify-center">
                      <span className="text-lg font-bold text-gray-500 mr-1">R$</span>
                      {plan.price}
                      <span className="text-xs font-semibold text-gray-400 ml-1">/mês</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-extrabold block mt-1">14 dias de teste gratuito</span>
                  </div>

                  <ul className="space-y-3.5 text-xs sm:text-sm font-semibold text-left mb-8">
                    {plan.features.map((f, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-300">
                        <Check className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.lockedFeatures.map((lf, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-600 font-medium">
                        <span>❌ {lf}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <a 
                  href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(plan.msg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider text-center transition-all hover:scale-[1.02] block ${plan.btnColor}`}
                >
                  Contratar no WhatsApp
                </a>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-8 max-w-3xl mx-auto space-y-4">
            <h4 className="font-bold text-white text-base">Está em dúvida sobre qual plano escolher?</h4>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl mx-auto">
              Nossa equipe faz uma importação assistida de seus dados atuais (planilhas, PDFs, contatos) para dentro do sistema sem custo adicional. Fale agora com a equipe.
            </p>
            <div className="pt-2">
              <Link 
                href="mailto:suporte.gabineteinteligente@gmail.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-800 text-white font-black px-6 py-3 rounded-xl hover:bg-slate-700 transition-all text-xs uppercase tracking-wider inline-flex items-center gap-1.5"
              >
                Entrar em contato
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo dark className="h-7" />
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-500 font-semibold">
            <a href="#como-funciona" className="hover:text-gray-300">Como Funciona</a>
            <a href="#telas" className="hover:text-gray-300">Telas do Software</a>
            <a href="#planos" className="hover:text-gray-300">Planos</a>
            <Link href="/solicitar" className="text-emerald-500 hover:text-emerald-400">Voz de Camaçari (Cidadão)</Link>
          </div>

          <div className="text-xs text-gray-600 font-semibold text-center md:text-right">
            <p>© 2026 Gabinete Conectado. Todos os direitos reservados.</p>
            <p className="mt-1">Desenvolvido por Eber Freitas.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
