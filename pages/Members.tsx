
import React, { useState } from 'react';
import { Search, Phone, MapPin, Calendar, Plus, X, Save, Navigation } from 'lucide-react';
import { useApp, normalizeText } from '../context/AppContext';
import { Card, SectionTitle, Input, ButtonSecondary, ButtonPrimary } from '../components/UI';
import { salvarDados } from '../services/firestoreService';

interface FormErrors {
  email?: string;
  phone?: string;
  birthday?: string;
  cep?: string;
  general?: string;
}

export const Members = () => {
  const { members, addMember } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    husband_name: '',
    wife_name: '',
    email: '',
    phone: '',
    cep: '',
    address: '',
    number: '', // Only used for geocoding accuracy
    neighborhood: '',
    city: '',
    state: '',
    birthday: '',
    notes: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // CEP Auto-Fill
  const handleCepBlur = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
        if(formData.cep) setErrors({...errors, cep: 'CEP deve ter 8 dígitos.'});
        return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf,
          cep: cep // Keep clean format
        }));
        setErrors({...errors, cep: undefined});
      } else {
        setErrors({...errors, cep: 'CEP não encontrado.'});
      }
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
      setErrors({...errors, cep: 'Erro ao buscar CEP.'});
    }
  };

  // Validation Logic
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Formato de e-mail inválido.';
      isValid = false;
    }

    // Phone Validation (Basic Brazil Format)
    const phoneClean = formData.phone.replace(/\D/g, '');
    if (formData.phone && (phoneClean.length < 10 || phoneClean.length > 11)) {
      newErrors.phone = 'Telefone inválido (insira DDD + número).';
      isValid = false;
    }

    // CEP Validation
    const cepClean = formData.cep.replace(/\D/g, '');
    if (!formData.cep || cepClean.length !== 8) {
       newErrors.cep = 'Por favor, informe um CEP válido.';
       isValid = false;
    }

    // Birthday Validation
    if (formData.birthday) {
      const date = new Date(formData.birthday);
      const today = new Date();
      if (isNaN(date.getTime())) {
        newErrors.birthday = 'Data inválida.';
        isValid = false;
      } else if (date > today) {
        newErrors.birthday = 'A data de aniversário não pode ser no futuro.';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    // Basic required fields check
    if (!formData.husband_name || !formData.wife_name) {
      setErrors({ ...errors, general: 'Preencha os nomes do casal.' });
      return;
    }

    if (!validateForm()) {
      return;
    }

    // Geocoding
    let lat = 0;
    let lng = 0;
    // Construct address for Geocoding: Street, Number, District, City - State, Brazil
    const fullAddress = `${formData.address}, ${formData.number}, ${formData.neighborhood}, ${formData.city} - ${formData.state}, Brazil`;

    try {
        const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`);
        const geoData = await geoResponse.json();
        if (geoData && geoData.length > 0) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);
        }
    } catch (e) {
        console.error("Geocoding error", e);
        // We continue saving even if geocoding fails, user can update map later (feature to be added)
    }

    const memberData = {
      husband_name: formData.husband_name,
      wife_name: formData.wife_name,
      email: formData.email,
      phone: formData.phone,
      cep: formData.cep,
      address: `${formData.address}${formData.number ? `, ${formData.number}` : ''}`, // Store number in address for simple display
      neighborhood: formData.neighborhood,
      city: formData.city,
      state: formData.state,
      birthday: formData.birthday,
      notes: formData.notes,
      geo_lat: lat,
      geo_lng: lng,
    };

    try {
      const docRef = await salvarDados('members', memberData);

      addMember({
        ...memberData,
        member_id: docRef.id
      });

      alert('Dados salvos com sucesso!');
      setIsModalOpen(false);
      setFormData({
        husband_name: '',
        wife_name: '',
        email: '',
        phone: '',
        cep: '',
        address: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        birthday: '',
        notes: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar dados.');
    }
  };

  const filteredMembers = members.filter(m => {
    const text = `${m.husband_name} ${m.wife_name} ${m.neighborhood}`.toLowerCase();
    return normalizeText(text).includes(normalizeText(searchTerm));
  }).sort((a, b) => a.husband_name.localeCompare(b.husband_name));

  return (
    <div className="relative">
      <div className="flex justify-between items-center">
        <SectionTitle>Membros do Grupo</SectionTitle>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-carmel-brown text-white p-2 rounded-full shadow-md active:scale-95 transition-transform"
          title="Adicionar Membro"
        >
          <Plus size={20} />
        </button>
      </div>
      
      <div className="mb-6 relative">
        <Input 
          placeholder="Buscar casal ou bairro..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute right-3 top-2.5 text-carmel-brown/40" size={20} />
      </div>

      <div className="space-y-4">
        {filteredMembers.map(member => (
          <Card key={member.member_id} className="transition-all duration-300">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === member.member_id ? null : member.member_id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-carmel-brown text-carmel-beige flex items-center justify-center font-serif font-bold text-sm border-2 border-carmel-gold">
                  {member.husband_name.charAt(0)}{member.wife_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-carmel-brown leading-tight">
                    {member.husband_name} & {member.wife_name}
                  </h3>
                  <p className="text-xs text-carmel-brown/60 flex items-center gap-1">
                    <MapPin size={10} /> {member.neighborhood}
                  </p>
                </div>
              </div>
              <div className="text-carmel-gold text-xs font-bold">
                 {member.notes === 'Coordenadores' ? 'COORD' : ''}
              </div>
            </div>

            {/* Details Section */}
            {expandedId === member.member_id && (
              <div className="mt-4 pt-4 border-t border-carmel-brown/10 space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-bold text-carmel-gold uppercase">Telefone</span>
                    <p className="text-carmel-brown flex items-center gap-1">
                      <Phone size={12} /> {member.phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-carmel-gold uppercase">Aniversário</span>
                    <p className="text-carmel-brown flex items-center gap-1">
                      <Calendar size={12} /> {member.birthday ? new Date(member.birthday).toLocaleDateString('pt-BR') : '-'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <span className="text-xs font-bold text-carmel-gold uppercase">Endereço</span>
                  <p className="text-carmel-brown text-sm">{member.address}</p>
                  {member.city && <p className="text-carmel-brown text-xs">{member.city} - {member.state}</p>}
                </div>
                
                {member.email && (
                  <div>
                    <span className="text-xs font-bold text-carmel-gold uppercase">Email</span>
                    <p className="text-carmel-brown text-xs">{member.email}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2 flex-wrap">
                   <ButtonSecondary onClick={(e) => {
                     e.stopPropagation();
                     window.open(`https://wa.me/55${member.phone.replace(/\D/g, '')}`, '_blank');
                   }} className="flex-1 text-xs whitespace-nowrap">
                     WhatsApp
                   </ButtonSecondary>
                   
                   {member.geo_lat !== 0 && (
                     <>
                        <ButtonSecondary onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${member.geo_lat},${member.geo_lng}`, '_blank');
                        }} className="flex-1 text-xs whitespace-nowrap">
                          Abrir no Google Maps
                        </ButtonSecondary>
                        <ButtonSecondary onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://waze.com/ul?ll=${member.geo_lat},${member.geo_lng}&navigate=yes`, '_blank');
                        }} className="flex-1 text-xs whitespace-nowrap">
                          <Navigation size={12} /> Abrir no Waze
                        </ButtonSecondary>
                     </>
                   )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto hide-scrollbar" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
              <h3 className="font-serif font-bold text-xl text-carmel-brown">Adicionar Membros</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-carmel-brown/50 hover:text-carmel-brown">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Nome Esposo *</label>
                  <Input 
                    value={formData.husband_name}
                    onChange={(e) => setFormData({...formData, husband_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Nome Esposa *</label>
                  <Input 
                    value={formData.wife_name}
                    onChange={(e) => setFormData({...formData, wife_name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-carmel-brown mb-1">CEP *</label>
                <Input 
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={(e) => {
                      setFormData({...formData, cep: e.target.value});
                      if(errors.cep) setErrors({...errors, cep: undefined});
                  }}
                  onBlur={handleCepBlur}
                  className={errors.cep ? 'border-red-500' : ''}
                />
                {errors.cep && <span className="text-red-500 text-xs mt-1 block">{errors.cep}</span>}
              </div>

              <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-3">
                    <label className="block text-xs font-bold text-carmel-brown mb-1">Endereço</label>
                    <Input 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      disabled // Auto-filled from CEP
                      className="bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-carmel-brown mb-1">Número</label>
                    <Input 
                      value={formData.number}
                      onChange={(e) => setFormData({...formData, number: e.target.value})}
                    />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Bairro</label>
                  <Input 
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-carmel-brown mb-1">Cidade - UF</label>
                  <Input 
                    value={formData.city ? `${formData.city} - ${formData.state}` : ''}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-carmel-brown mb-1">Email</label>
                <Input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    if (errors.email) setErrors({...errors, email: undefined});
                  }}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <span className="text-red-500 text-xs mt-1 block">{errors.email}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-carmel-brown mb-1">Telefone (DDD + Número)</label>
                <Input 
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({...formData, phone: e.target.value});
                    if (errors.phone) setErrors({...errors, phone: undefined});
                  }}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <span className="text-red-500 text-xs mt-1 block">{errors.phone}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-carmel-brown mb-1">Data de Casamento / Aniversário</label>
                <Input 
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => {
                    setFormData({...formData, birthday: e.target.value});
                    if (errors.birthday) setErrors({...errors, birthday: undefined});
                  }}
                  className={errors.birthday ? 'border-red-500' : ''}
                />
                {errors.birthday && <span className="text-red-500 text-xs mt-1 block">{errors.birthday}</span>}
              </div>

              <div>
                   <label className="block text-xs font-bold text-carmel-brown mb-1">Observações</label>
                   <Input 
                     value={formData.notes}
                     onChange={(e) => setFormData({...formData, notes: e.target.value})}
                     placeholder="Ex: Coordenadores"
                   />
              </div>

              {errors.general && <p className="text-red-500 text-center text-sm font-bold">{errors.general}</p>}

              <ButtonPrimary onClick={handleSave} className="w-full mt-4">
                <Save size={18} /> Salvar Membro
              </ButtonPrimary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
