'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, Plus, Search, CheckCircle, AlertCircle, X, Save, Trash2, ListFilter, LayoutGrid, ChevronLeft, ChevronRight, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '@/infrastructure/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Appointment = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  contactName: string;
  contactPhone: string;
  type: 'Atendimento Gabinete' | 'Visita a Bairro' | 'Sessão na Câmara' | 'Reunião Externa';
  status: 'Confirmado' | 'Pendente' | 'Concluído';
  description: string;
};

export default function AgendaPage() {
  const { profile } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calendar Date State (Defaulting to Maio 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // 4 = Maio (0-indexed)
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Appointment, 'id'>>({
    title: '',
    date: '2026-05-18',
    time: '10:00',
    location: '',
    contactName: '',
    contactPhone: '',
    type: 'Atendimento Gabinete',
    status: 'Confirmado',
    description: '',
  });

  const categories = ['Todos', 'Atendimento Gabinete', 'Visita a Bairro', 'Sessão na Câmara', 'Reunião Externa'];
  const statuses = ['Todos', 'Confirmado', 'Pendente', 'Concluído'];

  const typeColors: Record<string, string> = {
    'Atendimento Gabinete': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Visita a Bairro': 'bg-amber-50 text-amber-800 border-amber-200',
    'Sessão na Câmara': 'bg-violet-50 text-violet-800 border-violet-200',
    'Reunião Externa': 'bg-blue-50 text-blue-800 border-blue-200',
  };

  const statusBadges: Record<string, { bg: string; icon: any }> = {
    'Confirmado': { bg: 'bg-emerald-100 text-emerald-800', icon: CheckCircle },
    'Pendente': { bg: 'bg-amber-100 text-amber-800', icon: AlertCircle },
    'Concluído': { bg: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agenda')
        .select('*');

      if (error) throw error;

      if (data) {
        const mapped = data.map((a: any) => {
          const dateObj = new Date(a.data_hora);
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return {
            id: a.id,
            title: a.titulo,
            date: dateStr,
            time: timeStr,
            location: a.local || '',
            contactName: a.contato_nome || '',
            contactPhone: a.contato_telefone || '',
            type: a.tipo || 'Atendimento Gabinete',
            status: a.status || 'Confirmado',
            description: a.descricao || '',
          };
        });
        setAppointments(mapped);
      }
    } catch (err: any) {
      console.error('Erro ao carregar compromissos:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filtered = appointments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Todos' || a.type === filterType;
    const matchesStatus = filterStatus === 'Todos' || a.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const handleOpenNewAppointment = (defaultDate?: string) => {
    setSelectedAppointment(null);
    setFormData({
      title: '',
      date: defaultDate || '2026-05-18',
      time: '10:00',
      location: '',
      contactName: '',
      contactPhone: '',
      type: 'Atendimento Gabinete',
      status: 'Confirmado',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditAppointment = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setFormData({
      title: appt.title,
      date: appt.date,
      time: appt.time,
      location: appt.location,
      contactName: appt.contactName,
      contactPhone: appt.contactPhone,
      type: appt.type,
      status: appt.status,
      description: appt.description,
    });
    setIsModalOpen(true);
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const dataHoraIso = new Date(`${formData.date}T${formData.time}:00`).toISOString();

    try {
      if (selectedAppointment) {
        const { error } = await supabase
          .from('agenda')
          .update({
            titulo: formData.title,
            data_hora: dataHoraIso,
            local: formData.location,
            contato_nome: formData.contactName,
            contato_telefone: formData.contactPhone,
            tipo: formData.type,
            status: formData.status,
            descricao: formData.description,
          })
          .eq('id', selectedAppointment.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('agenda')
          .insert({
            titulo: formData.title,
            data_hora: dataHoraIso,
            local: formData.location,
            contato_nome: formData.contactName,
            contato_telefone: formData.contactPhone,
            tipo: formData.type,
            status: formData.status,
            descricao: formData.description,
            gabinete_id: profile?.gabinete_id
          });

        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchAppointments();
    } catch (err: any) {
      alert('Erro ao salvar compromisso: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('Tem certeza que deseja desmarcar e excluir este compromisso?')) {
      try {
        const { error } = await supabase
          .from('agenda')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchAppointments();
        setIsModalOpen(false);
      } catch (err: any) {
        alert('Erro ao excluir compromisso: ' + err.message);
      }
    }
  };

  const handleNotifyParticipant = (appt: Appointment) => {
    if (!appt.contactPhone) {
      alert('Número de WhatsApp não cadastrado para este participante.');
      return;
    }
    const partsDate = appt.date.split('-');
    const formattedDate = partsDate.length === 3 ? `${partsDate[2]}/${partsDate[1]}/${partsDate[0]}` : appt.date;
    const msg = `Olá ${appt.contactName}! Em nome do Gabinete Conectado de Camaçari, passamos para confirmar nosso compromisso agendado:\n\n📌 *${appt.title}*\n📅 Data: ${formattedDate}\n⏰ Horário: ${appt.time}\n📍 Local: ${appt.location}\n\nQualquer imprevisto, avise-nos por aqui!`;
    const cleanPhone = appt.contactPhone.replace(/\D/g, '');
    const url = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const formatDateBR = (isoDate: string) => {
    const parts = isoDate.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return isoDate;
  };

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const blanks = Array.from({ length: firstDayIndex }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const getDayString = (day: number) => {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${currentYear}-${mStr}-${dStr}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-emerald-600" /> Agenda & Compromissos
          </h1>
          <p className="text-gray-500 mt-1">Organize atendimentos no gabinete, visitas aos bairros e reuniões externas.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-end md:self-auto w-full md:w-auto">
          {/* View Mode Toggle */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 border border-gray-200 shadow-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-xs transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Grade Mensal
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-xs transition-all ${viewMode === 'list' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <ListFilter className="w-4 h-4" /> Lista de Eventos
            </button>
          </div>

          <button
            onClick={() => handleOpenNewAppointment()}
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center gap-2 text-sm flex-shrink-0 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Agendar
          </button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-6 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, local ou participante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold text-gray-900 placeholder:text-gray-500 shadow-sm transition-all"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:border-emerald-500 text-sm shadow-sm"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'Todos' ? 'Todas Categorias' : c}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 bg-gray-50/80 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:border-emerald-500 text-sm shadow-sm"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s === 'Todos' ? 'Todos os Status' : s}</option>
            ))}
          </select>
        </div>

        {/* Month Navigation if in Grid View */}
        {viewMode === 'grid' && (
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl w-full sm:w-auto justify-between">
            <button onClick={prevMonth} className="p-1 hover:bg-white rounded-lg text-gray-600 transition-colors shadow-xs border border-transparent hover:border-gray-300">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-gray-900 text-base min-w-0 sm:min-w-32 text-center flex-1">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-white rounded-lg text-gray-600 transition-colors shadow-xs border border-transparent hover:border-gray-300">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <span className="text-gray-500 font-medium text-sm">Carregando compromissos da agenda...</span>
        </div>
      ) : viewMode === 'grid' ? (
        /* Visual Monthly Calendar Grid */
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-6 animate-in fade-in duration-300 overflow-x-auto">
          <div className="min-w-[768px]">
            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-3 mb-3 text-center">
              {weekDays.map((d, index) => (
                <div key={d} className={`text-xs font-black uppercase py-2 rounded-lg bg-gray-100 ${index === 0 || index === 6 ? 'text-violet-700' : 'text-gray-700'}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-3">
              {blanks.map(b => (
                <div key={`blank-${b}`} className="min-h-[110px] bg-gray-50/50 border border-gray-100 rounded-xl p-2 opacity-40"></div>
              ))}

              {days.map(day => {
                const dayString = getDayString(day);
                const dayAppts = filtered.filter(a => a.date === dayString);
                const isToday = day === 18 && currentMonth === 4 && currentYear === 2026;

                return (
                  <div 
                    key={day} 
                    className={`min-h-[115px] bg-white border p-2.5 rounded-xl flex flex-col justify-between transition-all group ${isToday ? 'border-2 border-emerald-500 bg-emerald-50/10 shadow-sm' : 'border-gray-200 hover:border-emerald-400'}`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${isToday ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-800'}`}>
                        {day}
                      </span>
                      <button
                        onClick={() => handleOpenNewAppointment(dayString)}
                        className="opacity-0 group-hover:opacity-100 text-emerald-600 hover:bg-emerald-50 p-1 rounded-lg transition-opacity"
                        title="Agendar neste dia"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5 overflow-y-auto max-h-24 flex-1 pr-1 text-left">
                      {dayAppts.map(appt => (
                        <div
                          key={appt.id}
                          onClick={() => handleOpenEditAppointment(appt)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg truncate cursor-pointer shadow-xs transition-transform hover:scale-[1.02] border ${typeColors[appt.type] || 'bg-gray-100 text-gray-800'}`}
                          title={`${appt.time} - ${appt.title}`}
                        >
                          <span className="font-extrabold mr-1">{appt.time}</span> {appt.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Appointments List Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
          {filtered.map(appt => {
            const StatusIcon = statusBadges[appt.status]?.icon || CheckCircle;
            return (
              <div key={appt.id} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-left">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${typeColors[appt.type] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                      {appt.type}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full shadow-xs ${statusBadges[appt.status]?.bg || 'bg-gray-100'}`}>
                      <StatusIcon className="w-3.5 h-3.5 flex-shrink-0" /> {appt.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">{appt.title}</h3>
                  <p className="text-sm text-gray-600 font-medium mb-4 leading-relaxed">{appt.description}</p>

                  <div className="space-y-2 bg-gray-50/80 p-4 rounded-xl border border-gray-100 mb-4 text-sm font-medium">
                    <div className="flex items-center gap-2.5 text-gray-900">
                      <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span><strong className="font-bold">{formatDateBR(appt.date)}</strong> às <strong className="font-bold text-violet-700">{appt.time}</strong></span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-700">
                      <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>{appt.location}</span>
                    </div>
                    {appt.contactName && (
                      <div className="flex items-center gap-2.5 text-gray-700">
                        <User className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span>{appt.contactName} {appt.contactPhone ? `(${appt.contactPhone})` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-gray-100 gap-3">
                  <button
                    onClick={() => handleNotifyParticipant(appt)}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs px-3.5 py-2 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-xs flex items-center justify-center gap-1.5 w-full sm:w-auto"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Notificar WhatsApp
                  </button>
                  <button
                    onClick={() => handleOpenEditAppointment(appt)}
                    className="bg-gray-900 text-white font-extrabold text-xs px-4 py-2 rounded-xl hover:bg-gray-800 transition-all shadow-xs w-full sm:w-auto"
                  >
                    Editar Detalhes
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-gray-500 font-bold bg-white rounded-2xl border border-gray-200">
              Nenhum compromisso agendado para o filtro selecionado.
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-600" /> {selectedAppointment ? 'Editar Compromisso' : 'Agendar Compromisso'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Título do Compromisso</label>
                <input required type="text" placeholder="Ex: Reunião Comunitária" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 text-sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Data</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Horário</label>
                  <input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Localização / Bairro</label>
                <input required type="text" placeholder="Ex: Gabinete 104 ou Gleba E" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 text-sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 text-sm">
                    <option value="Atendimento Gabinete">Atendimento Gabinete</option>
                    <option value="Visita a Bairro">Visita a Bairro</option>
                    <option value="Sessão na Câmara">Sessão na Câmara</option>
                    <option value="Reunião Externa">Reunião Externa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 text-sm">
                    <option value="Confirmado">Confirmado</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Contato</label>
                  <input type="text" placeholder="Ex: Liderança Maria" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp do Contato</label>
                  <input type="text" placeholder="Ex: 5571999990000" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pauta / Observações</label>
                <textarea rows={3} placeholder="Detalhes do assunto a ser tratado..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-500 font-semibold text-gray-900 text-sm resize-none" />
              </div>

              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                {selectedAppointment && (
                  <button
                    type="button"
                    onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                    className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold px-4 py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-1.5 w-full sm:w-auto"
                    title="Desmarcar / Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" /> Desmarcar
                  </button>
                )}
                <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm disabled:opacity-75 w-full sm:w-auto">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar Compromisso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
