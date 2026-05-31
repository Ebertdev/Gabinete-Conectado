import DemandForm from '@/components/demand-form';

export default function SolicitarPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/60 via-gray-50 to-white flex flex-col items-center justify-center p-4 md:p-8">
      <div className="absolute top-0 w-full h-[350px] bg-gradient-to-b from-emerald-500/10 via-violet-500/5 to-transparent -z-10 pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        <div className="text-center mb-10 mt-6 animate-in slide-in-from-top duration-700">
          <div className="inline-block px-4 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-widest rounded-full mb-4 shadow-sm">
            Atendimento Digital Direto
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-violet-600 bg-clip-text text-transparent drop-shadow-sm pb-1">
            Voz de Camaçari
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto text-lg leading-relaxed font-medium">
            Faça sua solicitação para o gabinete diretamente do seu celular. Acompanhe protocolos e ajude a construir uma cidade melhor para todos.
          </p>
        </div>

        <DemandForm />
      </div>
    </main>
  );
}
