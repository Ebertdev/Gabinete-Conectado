'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User as UserIcon, Loader2, ArrowRight, ShieldCheck, Key, CheckCircle, X } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Form State
  const [email, setEmail] = useState('admin@gabinete.com');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Assessor');

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setForgotSuccess(true);
    }, 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegistering) {
      // Simulate registering new account
      setTimeout(() => {
        alert(`Conta criada com sucesso para ${name || email}! Seja bem-vindo ao Gabinete Conectado.`);
        router.push('/admin');
      }, 1500);
    } else {
      // Simulate login
      setTimeout(() => {
        router.push('/admin');
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Column - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 to-gray-800 p-12 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-teal-500 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10 max-w-lg text-white">
          <div className="mb-8 scale-110 origin-left">
            <Logo dark className="h-10" />
          </div>
          <div className="inline-flex items-center gap-2 mb-8 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-semibold tracking-wide">Plataforma Segura em Nuvem</span>
          </div>

          <h1 className="text-5xl font-black mb-6 leading-tight tracking-tight">
            Gestão inteligente para <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-violet-400 font-extrabold">seu gabinete.</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-10 font-medium">
            Acesse o painel para gerenciar demandas, acompanhar estatísticas em tempo real, gerir agenda e se comunicar diretamente com a população de Camaçari.
          </p>

          <div className="flex gap-4 items-center">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center font-bold text-xs text-emerald-400 shadow-sm">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-sm font-extrabold text-white">+50 Assessores e Lideranças</span>
              <span className="text-xs text-gray-400 font-medium">já utilizam a plataforma no município</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login / Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md animate-in slide-in-from-bottom-8 fade-in duration-700">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-10 scale-110">
            <Logo className="h-10" />
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              {isRegistering ? 'Criar Nova Conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-gray-500 font-medium text-sm">
              {isRegistering 
                ? 'Preencha seus dados para habilitar o acesso ao sistema.' 
                : 'Insira suas credenciais para acessar o painel de administração.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome Completo</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-gray-800 font-medium text-sm"
                      placeholder="Ex: Carlos Almeida"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cargo / Função no Gabinete</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-gray-800 font-semibold text-sm appearance-none"
                    >
                      <option value="Assessor">Assessor Parlamentar</option>
                      <option value="Chefe de Gabinete">Chefe de Gabinete</option>
                      <option value="Vereador">Vereador(a)</option>
                      <option value="Liderança">Liderança Comunitária</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-gray-800 font-medium text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Senha de Acesso</label>
                {!isRegistering && (
                  <button
                    type="button"
                    onClick={() => { setForgotEmail(email); setForgotSuccess(false); setIsForgotModalOpen(true); }}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-gray-800 font-medium text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-extrabold py-4 px-6 rounded-xl hover:bg-emerald-700 hover:shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:shadow-none shadow-md mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isRegistering ? 'Criando Conta...' : 'Autenticando...'}
                </>
              ) : (
                <>
                  {isRegistering ? 'Finalizar Cadastro' : 'Entrar no Painel'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login <-> Register */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            {isRegistering ? (
              <p className="text-sm text-gray-600 font-medium">
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="font-bold text-emerald-600 hover:text-emerald-800 hover:underline transition-colors"
                >
                  Faça login aqui
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600 font-medium">
                Ainda não tem acesso?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="font-bold text-emerald-600 hover:text-emerald-800 hover:underline transition-colors"
                >
                  Criar uma nova conta
                </button>
              </p>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-gray-400 font-medium">
            Sistema restrito para uso oficial do gabinete parlamentar de Camaçari.
          </p>
        </div>
      </div>

      {/* Forgot Password Recovery Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Key className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Recuperação de Acesso</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsForgotModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">E-mail de Redefinição Enviado!</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium px-4">
                  Enviamos instruções de recuperação e um link seguro temporário para <strong>{forgotEmail}</strong>. Verifique sua caixa de entrada e spam.
                </p>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full bg-gray-900 text-white font-extrabold py-3.5 px-6 rounded-xl hover:bg-gray-800 transition-all shadow-md mt-4 text-sm"
                >
                  Voltar para o Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-5 animate-in fade-in duration-300">
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  Informe o seu e-mail corporativo cadastrado. Você receberá um link temporário para criar uma nova senha com segurança.
                </p>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                    E-mail Corporativo
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="Ex: seu@email.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-medium text-gray-900"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 text-white font-extrabold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                    {loading ? 'Verificando Cadastro...' : 'Enviar Link de Recuperação'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
