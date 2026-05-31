'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, LogOut, MapPin, BarChart3, Calendar, FolderOpen, X, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/logo';
import { supabase } from '@/infrastructure/supabase/client';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: FileText, label: 'Demandas', href: '/admin/demandas' },
  { icon: Calendar, label: 'Agenda', href: '/admin/agenda' },
  { icon: FolderOpen, label: 'Documentos & IA', href: '/admin/documentos' },
  { icon: BarChart3, label: 'Estatísticas', href: '/admin/estatisticas' },
  { icon: MapPin, label: 'Mapa', href: '/admin/mapa' },
  { icon: Users, label: 'Cidadãos', href: '/admin/cidadaos' },
  { icon: ShieldCheck, label: 'Usuários', href: '/admin/usuarios' },
  { icon: Settings, label: 'Configurações', href: '/admin/configuracoes' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (onClose) onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside
      className={`w-64 bg-gray-900 text-gray-300 flex flex-col h-screen fixed top-0 left-0 shadow-2xl z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-6 border-b border-gray-800/80 flex items-center justify-between lg:justify-center">
        <Logo dark className="h-9 scale-110 origin-left" />
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
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
        <button
          onClick={handleLogout}
          className="p-2.5 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors group"
          title="Sair do sistema"
        >
          <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
        </button>
      </div>
    </aside>
  );
}
