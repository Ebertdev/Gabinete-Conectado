'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Check, Shield, Star, Zap, Sparkles, Building2, Users, FileText } from 'lucide-react';

export type PlanType = 'essencial' | 'inteligente' | 'enterprise';

export default function AssinaturaPage() {
  const [currentPlan, setCurrentPlan] = useState<PlanType>('essencial');

  useEffect(() => {
    const savedPlan = localStorage.getItem('gabinete_plan') as PlanType;
    if (savedPlan === 'essencial' || savedPlan === 'inteligente' || savedPlan === 'enterprise') {
      setCurrentPlan(savedPlan);
    }
  }, []);

  const handleSelectPlan = (plan: PlanType) => {
    setCurrentPlan(plan);
    localStorage.setItem('gabinete_plan', plan);
    window.dispatchEvent(new Event('planChanged'));
    alert(`Plano alterado com sucesso para: Gabinete Conectado ${plan.toUpperCase()}! Permissões de IA e Assessores atualizadas.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-emerald-600" /> Planos e Assinatura
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Escolha o pacote ideal para a gestão do seu mandato político com base em benchmarks do setor.
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl flex items-center gap-2 text-emerald-800 font-bold text-sm shadow-xs self-start">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" /> 14 Dias de Teste Gratuito Ativo
        </div>
      </div>

      {/* Destaque do Plano Atual */}
      <div className={`rounded-3xl p-8 text-white shadow-xl relative overflow-hidden transition-all duration-500 border ${
        currentPlan === 'enterprise' 
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 border-purple-500/40 shadow-purple-900/20' 
          : currentPlan === 'inteligente'
          ? 'bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border-emerald-500/40 shadow-emerald-900/20'
          : 'bg-gradient-to-r from-gray-900 to-slate-800 border-gray-700'
      }`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-extrabold uppercase tracking-widest mb-3 shadow-xs">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Plano Atual Selecionado
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-2 flex items-center gap-2 text-white">
              Gabinete Conectado {currentPlan === 'essencial' ? 'Essencial' : currentPlan === 'inteligente' ? 'Inteligente 🚀' : 'Mandato Total 👑'}
            </h2>
            <p className="text-gray-300 font-medium max-w-xl text-sm sm:text-base">
              {currentPlan === 'essencial' 
                ? 'Operação diária para gabinetes enxutos. Controle de demandas, cidadãos e agenda com até 5 assessores.'
                : currentPlan === 'inteligente'
                ? 'O plano mais procurado! Automação com Inteligência Artificial, redação legislativa e até 15 assessores.'
                : 'Poder máximo. Assessores ilimitados, automação de WhatsApp completa e relatórios executivos para o vereador/deputado.'}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center min-w-[220px] shadow-lg">
            <p className="text-xs text-gray-300 font-bold tracking-wider uppercase mb-1">Investimento Mensal</p>
            <div className="text-4xl font-black flex items-baseline justify-center gap-1 text-white">
              <span className="text-xl text-emerald-400 font-bold">R$</span>
              {currentPlan === 'essencial' ? '247' : currentPlan === 'inteligente' ? '337' : '697'}
              <span className="text-base text-gray-300 font-medium">/mês</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <span className="text-xs text-emerald-300 font-extrabold flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Assinatura Ativa e Regular
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grade de 3 Planos */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-gray-900">Opções de Contratação e Permissões</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* PLANO 1: ESSENCIAL */}
          <div className={`bg-white rounded-3xl p-8 shadow-lg flex flex-col justify-between border-2 transition-all relative ${
            currentPlan === 'essencial' ? 'border-gray-900 ring-4 ring-gray-900/10 scale-[1.02]' : 'border-gray-200 hover:border-gray-300'
          }`}>
            {currentPlan === 'essencial' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-md">
                Plano Selecionado
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-800 font-black text-xs rounded-lg uppercase tracking-wider">Iniciante</span>
                <Users className="w-6 h-6 text-gray-600" />
              </div>
              <h4 className="text-2xl font-black text-gray-900">Plano Essencial</h4>
              <p className="text-gray-500 text-sm mt-2 font-medium min-h-[40px]">
                Estrutura sólida para gabinetes que estão iniciando na digitalização.
              </p>
              
              <div className="my-6 py-4 border-y border-gray-100">
                <div className="text-4xl font-black text-gray-900 flex items-baseline">
                  <span className="text-lg font-bold text-gray-400 mr-1">R$</span>247<span className="text-sm font-semibold text-gray-500 ml-1">/mês</span>
                </div>
                <span className="text-xs text-emerald-600 font-bold block mt-1">14 dias grátis para testar</span>
              </div>

              <ul className="space-y-3.5 text-sm font-semibold text-gray-700 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Até 5 Contas de Assessores
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Cadastro de Cidadãos e Lideranças
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Caixa de Entrada de Demandas
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Agenda Parlamentar Mensal
                </li>
                <li className="flex items-center gap-2.5 text-gray-400 font-medium">
                  ❌ Redação de Ofícios/PLs com IA
                </li>
                <li className="flex items-center gap-2.5 text-gray-400 font-medium">
                  ❌ Relatórios de Bairros (BI e Geo)
                </li>
                <li className="flex items-center gap-2.5 text-gray-400 font-medium">
                  ❌ Automação de WhatsApp
                </li>
              </ul>
            </div>

            {currentPlan === 'essencial' ? (
              <button disabled className="w-full font-black py-4 rounded-2xl bg-gray-100 text-gray-500 border-2 border-gray-200 cursor-default">
                Pacote em Uso
              </button>
            ) : (
              <button 
                onClick={() => handleSelectPlan('essencial')}
                className="w-full font-black py-4 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white transition-all shadow-md transform hover:scale-[1.02]"
              >
                Ativar Plano Essencial
              </button>
            )}
          </div>

          {/* PLANO 2: INTELIGENTE (BENCHMARK MANDATO INTELIGENTE - R$ 337) */}
          <div className={`bg-white rounded-3xl p-8 shadow-xl flex flex-col justify-between border-2 transition-all relative ${
            currentPlan === 'inteligente' ? 'border-emerald-600 ring-4 ring-emerald-600/20 scale-[1.04] z-10 shadow-emerald-900/10' : 'border-emerald-200 hover:border-emerald-400'
          }`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" /> Recomendado (Benchmark)
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-black text-xs rounded-lg uppercase tracking-wider">Popular</span>
                <Zap className="w-6 h-6 text-amber-500 fill-amber-400" />
              </div>
              <h4 className="text-2xl font-black text-gray-900">Plano Inteligente</h4>
              <p className="text-gray-500 text-sm mt-2 font-medium min-h-[40px]">
                O favorito dos gabinetes modernos. Libera o assistente de IA Legislativa e BI.
              </p>
              
              <div className="my-6 py-4 border-y border-gray-100 bg-emerald-50/50 -mx-4 px-4 rounded-xl">
                <div className="text-4xl font-black text-gray-900 flex items-baseline">
                  <span className="text-lg font-bold text-gray-400 mr-1">R$</span>337<span className="text-sm font-semibold text-gray-500 ml-1">/mês</span>
                </div>
                <span className="text-xs text-emerald-700 font-extrabold block mt-1 flex items-center gap-1">
                  ⭐ Melhor Custo-Benefício de Mercado
                </span>
              </div>

              <ul className="space-y-3.5 text-sm font-semibold text-gray-700 mb-8">
                <li className="flex items-center gap-2.5 text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" /> IA Redatora de Projetos e Ofícios
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Até 15 Contas de Assessores
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Mapa Geoespacial de Cidadãos
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" /> BI e Gráficos de Demandas por Bairro
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Esteira Kanban de Atendimento
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Notificações Diretas WhatsApp
                </li>
              </ul>
            </div>

            {currentPlan === 'inteligente' ? (
              <button disabled className="w-full font-black py-4 rounded-2xl bg-emerald-50 text-emerald-800 border-2 border-emerald-300 cursor-default shadow-xs">
                Plano em Uso
              </button>
            ) : (
              <button 
                onClick={() => handleSelectPlan('inteligente')}
                className="w-full font-black py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all shadow-lg transform hover:scale-[1.03] flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 text-amber-300 fill-amber-300" /> Ativar Plano Inteligente
              </button>
            )}
          </div>

          {/* PLANO 3: MANDATO TOTAL / ENTERPRISE */}
          <div className={`bg-white rounded-3xl p-8 shadow-lg flex flex-col justify-between border-2 transition-all relative ${
            currentPlan === 'enterprise' ? 'border-purple-600 ring-4 ring-purple-600/20 scale-[1.02]' : 'border-gray-200 hover:border-purple-300'
          }`}>
            {currentPlan === 'enterprise' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-md">
                Plano Selecionado
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 font-black text-xs rounded-lg uppercase tracking-wider">VIP / Líder</span>
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-2xl font-black text-gray-900">Mandato Total</h4>
              <p className="text-gray-500 text-sm mt-2 font-medium min-h-[40px]">
                Para vereadores e deputados com equipes amplas e máxima capilaridade.
              </p>
              
              <div className="my-6 py-4 border-y border-gray-100">
                <div className="text-4xl font-black text-gray-900 flex items-baseline">
                  <span className="text-lg font-bold text-gray-400 mr-1">R$</span>697<span className="text-sm font-semibold text-gray-500 ml-1">/mês</span>
                </div>
                <span className="text-xs text-purple-600 font-bold block mt-1">Acesso irrestrito e VIP</span>
              </div>

              <ul className="space-y-3.5 text-sm font-semibold text-gray-700 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Tudo do Plano Inteligente
                </li>
                <li className="flex items-center gap-2.5 text-purple-900 bg-purple-50 p-2 rounded-xl border border-purple-100">
                  <Users className="w-5 h-5 text-purple-600 shrink-0" /> Assessores e Lideranças Ilimitados
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Automação Completa via WhatsApp API
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Cofre Digital Ilimitado em Nuvem
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Exportação de Relatórios para Prestação
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Suporte VIP 24/7 com Gerente Dedicado
                </li>
              </ul>
            </div>

            {currentPlan === 'enterprise' ? (
              <button disabled className="w-full font-black py-4 rounded-2xl bg-purple-50 text-purple-900 border-2 border-purple-300 cursor-default shadow-xs">
                Pacote em Uso
              </button>
            ) : (
              <button 
                onClick={() => handleSelectPlan('enterprise')}
                className="w-full font-black py-4 rounded-2xl bg-purple-900 hover:bg-purple-800 text-white transition-all shadow-lg transform hover:scale-[1.02]"
              >
                Ativar Mandato Total
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Detalhes de Faturamento e Transparência */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm mt-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-600" /> Transparência e Segurança Institucional
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="p-4 bg-gray-50 rounded-2xl">
            <h4 className="font-bold text-gray-900 mb-1">Flexibilidade Total</h4>
            <p className="text-gray-600 text-xs leading-relaxed">Você pode alterar ou cancelar seu plano a qualquer momento sem multas rescisórias.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <h4 className="font-bold text-gray-900 mb-1">Conformidade com a LGPD</h4>
            <p className="text-gray-600 text-xs leading-relaxed">Todos os dados de cidadãos e lideranças são criptografados com servidores seguros no Brasil.</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <h4 className="font-bold text-gray-900 mb-1">Migração Assistida</h4>
            <p className="text-gray-600 text-xs leading-relaxed">Nossa equipe auxilia na importação de planilhas e contatos sem perda de histórico.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
