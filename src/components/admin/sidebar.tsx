'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, LogOut, MapPin, CreditCard, BarChart3, Calendar, FolderOpen } from 'lucide-react';
import { Logo } from '@/components/logo';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: FileText, label: 'Demandas', href: '/admin/demandas' },
  { icon: Calendar, label: 'Agenda', href: '/admin/agenda' },
  { icon: FolderOpen, label: 'Documentos & IA', href: '/admin/documentos' },
  { icon: BarChart3, label: 'Estatísticas', href: '/admin/estatisticas' },
  { icon: MapPin, label: 'Mapa', href: '/admin/mapa' },
  { icon: Users, label: 'Cidadãos', href: '/admin/cidadaos' },
  { icon: Settings, label: 'Configurações', href: '/admin/configuracoes' },
  { icon: CreditCard, label: 'Assinatura', href: '/admin/assinatura' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col h-screen fixed top-0 left-0 shadow-2xl z-30">
      <div className="p-6 border-b border-gray-800/80 flex items-center justify-center">
        <Logo dark className="h-9 scale-110 origin-left" />
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${isActive ? 'bg-gradient-to-r from-emerald-600/20 to-violet-600/20 text-white font-bold border-l-4 border-emerald-500 shadow-sm' : 'text-gray-400 hover:bg-gray-800/80 hover:text-gray-200'}`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="font-medium">{item.label}</span>
              </div>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 pl-2">
          <Logo dark showText={false} className="h-7 w-7 flex-shrink-0" />
          <div className="leading-tight text-left">
            <span className="text-xs font-extrabold text-white block">Gabinete</span>
            <span className="text-[10px] text-gray-400 font-semibold block">Conectado Pro</span>
          </div>
        </div>
        <Link href="/login" className="p-2.5 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors group" title="Sair do sistema">
          <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
        </Link>
      </div>
    </aside>
  );
}
