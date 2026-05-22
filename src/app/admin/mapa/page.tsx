'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/admin/map-component'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-gray-100 rounded-2xl flex items-center justify-center animate-pulse border border-gray-200">Carregando mapa geoespacial...</div>
});

export default function MapaPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            Mapa de Demandas <MapPin className="w-8 h-8 text-emerald-500" />
          </h1>
          <p className="text-gray-500 mt-1">Visualização geoespacial de problemas da cidade (PostGIS).</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <MapComponent />
      </div>
    </div>
  );
}
