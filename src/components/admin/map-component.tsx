'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Filter, AlertTriangle, CheckCircle, Clock, MapPin, Building2, Layers, RefreshCw } from 'lucide-react';

// Coordenadas base dos bairros e distritos de Camaçari para posicionamento automático
const neighborhoodCoords: Record<string, { lat: number, lng: number }> = {
  'centro': { lat: -12.6975, lng: -38.3241 },
  'gleba a': { lat: -12.7030, lng: -38.3280 },
  'gleba b': { lat: -12.7050, lng: -38.3300 },
  'gleba e': { lat: -12.7080, lng: -38.3350 },
  'arembepe': { lat: -12.7550, lng: -38.1670 },
  'vila de abrantes': { lat: -12.8378, lng: -38.2985 },
  'ponto certo': { lat: -12.7115, lng: -38.3150 },
  'phoc': { lat: -12.7180, lng: -38.3380 },
  'jaua': { lat: -12.8050, lng: -38.2250 },
};

const getCoordsForNeighborhood = (n: string, i: number) => {
  const key = (n || '').toLowerCase().trim();
  for (const [k, v] of Object.entries(neighborhoodCoords)) {
    if (key.includes(k)) {
      // Pequeno deslocamento no entorno para não encavalar os pinos no mesmo metro quadrado
      return {
        lat: v.lat + (i % 5) * 0.001 - 0.002,
        lng: v.lng + (i % 3) * 0.001 - 0.001
      };
    }
  }
  // Se for um bairro não cadastrado, distribui no centro expandido de Camaçari
  return {
    lat: -12.6975 + (i % 7) * 0.003 - 0.009,
    lng: -38.3241 + (i % 6) * 0.003 - 0.009
  };
};

const defaultMockDemands = [
  { id: '1', protocol: 'CAM-2026-0001', citizen: 'João da Silva', type: 'Infraestrutura', neighborhood: 'Vila de Abrantes', lat: -12.8378, lng: -38.2985, status: 'Em Análise', date: 'Hoje, 09:30', description: 'Recapeamento asfáltico e conserto de bueiro na via principal.' },
  { id: '2', protocol: 'CAM-2026-0002', citizen: 'Maria Souza', type: 'Saúde', neighborhood: 'Centro', lat: -12.6975, lng: -38.3241, status: 'Registrada', date: 'Hoje, 11:15', description: 'Solicitação de médicos na unidade básica central.' },
  { id: '3', protocol: 'CAM-2026-0003', citizen: 'Carlos Almeida', type: 'Limpeza Urbana', neighborhood: 'Gleba A', lat: -12.7030, lng: -38.3280, status: 'Resolvida', date: 'Ontem, 14:20', description: 'Coleta de lixo irregular na praça da comunidade.' },
  { id: '4', protocol: 'CAM-2026-0004', citizen: 'Ana Paula', type: 'Segurança', neighborhood: 'Ponto Certo', lat: -12.7115, lng: -38.3150, status: 'Encaminhada', date: 'Ontem, 16:45', description: 'Rondas policiais e instalação de postes de iluminação.' },
  { id: '5', protocol: 'CAM-2026-0005', citizen: 'Rui Costa', type: 'Educação', neighborhood: 'Phoc II', lat: -12.7180, lng: -38.3380, status: 'Registrada', date: '15 Mai, 10:00', description: 'Manutenção no telhado da escola municipal.' },
  { id: '6', protocol: 'CAM-2026-0006', citizen: 'Beto Silva', type: 'Infraestrutura', neighborhood: 'Arembepe', lat: -12.7550, lng: -38.1670, status: 'Resolvida', date: '14 Mai, 08:30', description: 'Instalação de passarela de acesso à praia.' },
];

const categoryColors: Record<string, string> = {
  'Saúde': 'bg-red-100 text-red-800 border-red-200',
  'Infraestrutura': 'bg-amber-100 text-amber-800 border-amber-200',
  'Educação': 'bg-violet-100 text-violet-800 border-violet-200',
  'Segurança': 'bg-purple-100 text-purple-800 border-purple-200',
  'Limpeza Urbana': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Iluminação': 'bg-blue-100 text-blue-800 border-blue-200',
  'Outros': 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusBadges: Record<string, { bg: string, text: string }> = {
  'Registrada': { bg: 'bg-gray-100', text: 'text-gray-700' },
  'Em Análise': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Encaminhada': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Resolvida': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

// Gerador robusto de DivIcon (HTML nativo)
const getCustomDivIcon = (type: string) => {
  const bgColor =
    type === 'Saúde' ? '#ef4444' :
      type === 'Infraestrutura' ? '#f59e0b' :
        type === 'Educação' ? '#8b5cf6' :
          type === 'Segurança' ? '#a855f7' :
            type === 'Limpeza Urbana' ? '#10b981' :
              type === 'Iluminação' ? '#3b82f6' : '#6b7280';

  const markerHtml = `
    <div style="
      background-color: ${bgColor}; 
      width: 28px; 
      height: 28px; 
      border-radius: 50% 50% 50% 0; 
      transform: rotate(-45deg); 
      border: 3px solid white; 
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      display: flex; 
      align-items: center; 
      justify-content: center;
    ">
      <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: markerHtml,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

function MapUpdater({ activePopupId, demands, defaultCenter }: { activePopupId: string | null, demands: any[], defaultCenter: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    if (activePopupId) {
      const target = demands.find(d => d.id === activePopupId);
      if (target) {
        map.flyTo([target.lat, target.lng], 16, { animate: true, duration: 1.2 });
      }
    } else {
      map.flyTo(defaultCenter, 12, { animate: true, duration: 1.2 });
    }
  }, [activePopupId, demands, defaultCenter, map]);

  return null;
}

export default function MapComponent() {
  const [demandsList, setDemandsList] = useState<any[]>(defaultMockDemands);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [activePopupId, setActivePopupId] = useState<string | null>(null);

  // Centro geral de Camaçari
  const centerCenter: [number, number] = [-12.6975, -38.3241];

  const categories = ['Todas', 'Infraestrutura', 'Saúde', 'Segurança', 'Limpeza Urbana', 'Educação', 'Iluminação'];

  // Sincroniza em tempo real com o localStorage do módulo de Demandas
  useEffect(() => {
    const loadFromStorage = () => {
      const saved = localStorage.getItem('gabinete_demands');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const mappedWithGeo = parsed.map((item: any, i: number) => {
            const coords = getCoordsForNeighborhood(item.neighborhood, i);
            return {
              id: item.id || String(i),
              protocol: item.protocol || `CAM-2026-${i + 100}`,
              citizen: item.citizen || 'Cidadão',
              type: item.type || 'Outros',
              neighborhood: item.neighborhood || 'Centro',
              lat: item.lat !== undefined ? item.lat : coords.lat,
              lng: item.lng !== undefined ? item.lng : coords.lng,
              status: item.status || 'Registrada',
              date: item.date || 'Hoje',
              description: item.description || `Solicitação registrada no sistema para o bairro ${item.neighborhood}.`,
            };
          });
          setDemandsList(mappedWithGeo);
        } catch (e) { }
      }
    };

    loadFromStorage();
    window.addEventListener('demandsChanged', loadFromStorage);
    return () => window.removeEventListener('demandsChanged', loadFromStorage);
  }, []);

  const filteredDemands = demandsList.filter(item => {
    const matchesSearch = item.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.citizen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || item.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resetMapCenter = () => {
    setActivePopupId(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[800px] lg:h-[720px] w-full rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-xl relative z-0">

      {/* Sidebar de Controle Geoespacial */}
      <div className="w-full lg:w-96 bg-gray-50/95 border-b lg:border-b-0 lg:border-r border-gray-200 p-6 flex flex-col h-[350px] lg:h-full z-10 overflow-hidden shadow-lg">

        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2 mb-1">
              <Layers className="w-6 h-6 text-emerald-600" /> Mapa de Ocorrências
            </h3>
            <p className="text-xs text-gray-500 font-medium">Sincronizado com a Caixa de Demandas</p>
          </div>
          <button
            onClick={resetMapCenter}
            className="p-2.5 bg-white rounded-xl border border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-300 transition-colors shadow-sm"
            title="Restaurar visualização central"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar protocolo, bairro ou cidadão..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-gray-900 placeholder:text-gray-400 shadow-xs transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-gray-200 overflow-y-auto max-h-28">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setActivePopupId(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md scale-105 font-black'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Demands List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filteredDemands.map(demand => (
            <div
              key={demand.id}
              onClick={() => setActivePopupId(demand.id)}
              className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer ${activePopupId === demand.id ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 shadow-md' : 'border-gray-200 hover:border-gray-300 shadow-xs'
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-black text-gray-900">{demand.protocol}</span>
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${statusBadges[demand.status]?.bg || 'bg-gray-100'} ${statusBadges[demand.status]?.text || 'text-gray-700'}`}>
                  {demand.status}
                </span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${categoryColors[demand.type] || 'bg-gray-100 text-gray-800'}`}>
                  {demand.type}
                </span>
                <span className="text-xs font-bold text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /> {demand.neighborhood}
                </span>
              </div>

              <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed font-medium">
                {demand.description}
              </p>

              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 text-[10px] text-gray-400 font-bold">
                <span>{demand.citizen}</span>
                <span>{demand.date}</span>
              </div>
            </div>
          ))}

          {filteredDemands.length === 0 && (
            <div className="text-center py-10 text-xs font-semibold text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
              Nenhuma demanda encontrada com estes filtros.
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs">
          <span className="text-gray-500 font-semibold">Pontos Georreferenciados</span>
          <span className="text-emerald-600 font-black px-2.5 py-1 bg-emerald-100/50 rounded-lg">{filteredDemands.length} no mapa</span>
        </div>

      </div>

      {/* Container Principal do Mapa Leaflet */}
      <div className="flex-1 h-[450px] lg:h-full w-full relative z-0">
        <MapContainer
          center={centerCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          className="z-0 h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater activePopupId={activePopupId} demands={filteredDemands} defaultCenter={centerCenter} />

          {filteredDemands.map(demand => (
            <Marker
              key={demand.id}
              position={[demand.lat, demand.lng]}
              icon={getCustomDivIcon(demand.type)}
              eventHandlers={{
                click: () => setActivePopupId(demand.id),
              }}
            >
              <Popup>
                <div className="font-sans p-1 max-w-xs">
                  <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-gray-100">
                    <span className="font-mono text-xs font-black text-gray-900">{demand.protocol}</span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${statusBadges[demand.status]?.bg} ${statusBadges[demand.status]?.text}`}>
                      {demand.status}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-gray-900 text-sm mb-1">{demand.type}</h4>
                  <p className="text-xs text-gray-600 mb-3 leading-tight font-medium">{demand.description}</p>

                  <div className="text-[11px] text-gray-600 space-y-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <p><span className="font-extrabold text-gray-900">Eleitor:</span> {demand.citizen}</p>
                    <p><span className="font-extrabold text-gray-900">Bairro/Região:</span> {demand.neighborhood}</p>
                    <p><span className="font-extrabold text-gray-900">Registro:</span> {demand.date}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

    </div>
  );
}
