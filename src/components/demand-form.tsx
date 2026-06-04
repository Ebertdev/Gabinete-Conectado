'use client';

import React, { useState } from 'react';
import { MapPin, Camera, Send, Loader2, CheckCircle, X } from 'lucide-react';
// In a real app we'd use the use-case with DI, but for simplicity we directly instantiate or use a Server Action.
import { CreateDemandUseCase } from '@/application/use-cases/CreateDemandUseCase';
import { SupabaseDemandRepository } from '@/infrastructure/repositories/SupabaseDemandRepository';
import { supabase } from '@/infrastructure/supabase/client';

const demandTypes = [
  'Infraestrutura',
  'Saúde',
  'Educação',
  'Segurança',
  'Limpeza Urbana',
  'Outros'
];

export default function DemandForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successProtocol, setSuccessProtocol] = useState<string | null>(null);
  const [lgpdAccepted, setLgpdAccepted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cep: '',
    address: '',
    neighborhood: '',
    description: '',
    type: 'Infraestrutura',
  });

  const [cepLoading, setCepLoading] = useState(false);

  const handleCepLookup = async (rawCep: string) => {
    const cleanCep = rawCep.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cep: rawCep }));
    
    if (cleanCep.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({
            ...prev,
            address: data.street || prev.address,
            neighborhood: data.neighborhood || prev.neighborhood,
          }));
        } else {
          // Fallback to ViaCEP
          const resVia = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          if (resVia.ok) {
            const dataVia = await resVia.json();
            if (!dataVia.erro) {
              setFormData(prev => ({
                ...prev,
                address: dataVia.logradouro || prev.address,
                neighborhood: dataVia.bairro || prev.neighborhood,
              }));
            }
          }
        }
      } catch (err) {
        console.error('Erro ao buscar CEP', err);
      } finally {
        setCepLoading(false);
      }
    }
  };

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [photos, setPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleGetLocation = () => {
    setLocationLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationLoading(false);
        },
        (error) => {
          alert('Erro ao capturar localização. Por favor, permita o acesso.');
          setLocationLoading(false);
        }
      );
    } else {
      alert('Geolocalização não suportada no seu dispositivo.');
      setLocationLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPhotos = [...photos, ...filesArray].slice(0, 3); // Max 3 photos
      setPhotos(newPhotos);

      const newPreviews = newPhotos.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviews);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);

    const newPreviews = [...previewUrls];
    newPreviews.splice(index, 1);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Em uma aplicação real faríamos o upload das imagens para o Supabase Storage aqui
      // e pegaríamos as URLs públicas para salvar no banco.
      const uploadedImageUrls: string[] = [];

      for (const photo of photos) {
        const fileExt = photo.name.split('.').pop() || 'jpg';
        const uniqueId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const fileName = `${uniqueId}.${fileExt}`;
        const filePath = `public/${new Date().getFullYear()}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('demand-photos')
          .upload(filePath, photo, {
            cacheControl: '3600',
            upsert: false,
            contentType: photo.type,
          });

        if (uploadError) {
          throw new Error(`Erro ao enviar foto: ${uploadError.message}`);
        }

        const { data } = supabase.storage.from('demand-photos').getPublicUrl(filePath);
        uploadedImageUrls.push(data.publicUrl);
      }

      // Initialize the Clean Arch use case
      const repo = new SupabaseDemandRepository();
      const useCase = new CreateDemandUseCase(repo);

      const result = await useCase.execute({
        citizen: { name: formData.name, phone: formData.phone, address: formData.address },
        description: formData.description,
        type: formData.type,
        location: {
          latitude: location?.lat || 0,
          longitude: location?.lng || 0,
          address: formData.address,
          neighborhood: formData.neighborhood,
        },
        attachments: uploadedImageUrls,
      });

      setSuccessProtocol(result.protocolNumber || 'CAM-2026-9999');

    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Erro ao enviar demanda.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (successProtocol) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl max-w-md w-full mx-auto border border-emerald-100 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Demanda Registrada!</h2>
        <p className="text-gray-600 mb-6">Sua solicitação foi enviada com sucesso para o gabinete.</p>

        <div className="bg-gray-50 p-4 rounded-2xl w-full border border-gray-100 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Nº do Protocolo</p>
          <p className="text-2xl font-mono font-bold text-gray-800 tracking-tight">{successProtocol}</p>
        </div>

        <button
          onClick={() => { setSuccessProtocol(null); setStep(1); setFormData({ ...formData, description: '' }); setPhotos([]); setPreviewUrls([]); }}
          className="w-full bg-gray-900 text-white font-medium py-3 px-6 rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-[0.98]"
        >
          Registrar Nova Demanda
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100/50 rounded-[2rem] overflow-hidden">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            Nova Demanda
          </h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">Gabinete Conectado • Camaçari</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-gray-100'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-gray-100'}`} />
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} className="space-y-6">

          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Seu Nome</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-800 placeholder-gray-400"
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp / Telefone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-800 placeholder-gray-400"
                  placeholder="(71) 90000-0000"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white font-medium py-3.5 px-6 rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Qual é o problema?</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-800 placeholder-gray-400 resize-none"
                  placeholder="Descreva a situação com detalhes..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Categoria</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-gray-800 appearance-none font-medium"
                >
                  {demandTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Address / ViaCEP Module */}
              <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-bold text-gray-800">Endereço da Ocorrência</label>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    ViaCEP Grátis
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="relative sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">CEP</label>
                    <input
                      type="text"
                      maxLength={9}
                      value={formData.cep}
                      onChange={(e) => handleCepLookup(e.target.value)}
                      placeholder="00000-000"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-gray-900 placeholder:text-gray-400 shadow-sm"
                    />
                    {cepLoading && (
                      <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-9 text-emerald-600" />
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Bairro</label>
                    <input
                      type="text"
                      required
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      placeholder="Ex: Centro"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-gray-900 placeholder:text-gray-400 shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Logradouro / Rua e Número</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ex: Rua das Flores, 123"
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-bold text-gray-900 placeholder:text-gray-400 shadow-sm"
                  />
                </div>
              </div>

              {/* Location Module */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">GPS / Ponto de Referência (Opcional)</label>
                {location ? (
                  <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Localização capturada com sucesso!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locationLoading}
                    className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-300 text-gray-600 py-4 px-4 rounded-xl hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all font-medium disabled:opacity-50"
                  >
                    {locationLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                    {locationLoading ? 'Capturando GPS...' : 'Pegar minha localização atual'}
                  </button>
                )}
              </div>

              {/* Photo Module */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Fotos do Local (Opcional)</label>
                <div className="flex flex-wrap gap-3">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-gray-200 group">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  ))}

                  {previewUrls.length < 3 && (
                    <label className="w-20 h-20 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-500 transition-all text-gray-400">
                      <Camera className="w-6 h-6 mb-1" />
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* LGPD Compliance & Consent */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
                <input
                  type="checkbox"
                  required
                  id="lgpd-consent"
                  checked={lgpdAccepted}
                  onChange={(e) => setLgpdAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer flex-shrink-0"
                />
                <label htmlFor="lgpd-consent" className="text-xs text-emerald-950 leading-relaxed cursor-pointer font-normal">
                  Declaro que autorizo a captação, uso e armazenamento dos meus dados pessoais pelo Gabinete Conectado exclusivamente para fins de atendimento e comunicação institucional, de acordo com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading || !location}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium py-3.5 px-6 rounded-xl hover:shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                  {loading ? 'Enviando...' : 'Registrar Demanda'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
