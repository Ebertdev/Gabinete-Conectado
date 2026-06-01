'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, LogOut, MapPin, BarChart3, Calendar, FolderOpen, X, ShieldCheck, type LucideIcon } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  permission?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: FileText, label: 'Demandas', href: '/admin/demandas', permission: 'view_demands' },
  { icon: Calendar, label: 'Agenda', href: '/admin/agenda' },
  { icon: FolderOpen, label: 'Documentos & IA', href: '/admin/documentos', permission: 'view_documents' },
  { icon: BarChart3, label: 'Estatísticas', href: '/admin/estatisticas', permission: 'view_reports' },
  { icon: MapPin, label: 'Mapa', href: '/admin/mapa' },
  { icon: Users, label: 'Cidadãos', href: '/admin/cidadaos', permission: 'view_citizens' },
  { icon: ShieldCheck, label: 'Usuários', href: '/admin/usuarios', permission: 'manage_users' },
  { icon: Settings, label: 'Configurações', href: '/admin/configuracoes', permission: 'manage_plans' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { profile, can, signOut } = useAuth();

  const filteredNavItems = useMemo(() => {
    return navItems.filter(item => !item.permission || can(item.permission));
  }, [can]);

  useEffect(() => {
    if (onClose) onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <aside
      className={`w-[85vw] max-w-64 bg-gray-900 text-gray-300 flex flex-col h-[100dvh] fixed top-0 left-0 shadow-2xl z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
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

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto overscroll-contain">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${isActive ? 'bg-gradient-to-r from-emerald-600/20 to-violet-600/20 text-white font-bold border-l-4 border-emerald-500 shadow-sm' : 'text-gray-400 hover:bg-gray-800/80 hover:text-gray-200'}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="font-medium">{item.label}</span>
              </div>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 pl-2 truncate min-w-0 flex-1">
          <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center flex-shrink-0 text-emerald-400 font-bold text-sm">
            {profile?.nome?.charAt(0) || 'U'}
          </div>
          <div className="leading-tight text-left truncate">
            <span className="text-xs font-extrabold text-white block truncate" title={profile?.gabinete_nome || 'Gabinete Conectado'}>
              {profile?.gabinete_nome || 'Gabinete Conectado'}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold block truncate">
              {profile?.gabinete_plano || 'Pro'} • {profile?.role || 'User'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2.5 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors group flex-shrink-0"
          title="Sair do sistema"
        >
          <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
        </button>
      </div>
    </aside>
  );
}
