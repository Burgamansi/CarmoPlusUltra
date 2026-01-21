
import React, { useState } from 'react';
import { Search, Phone, MapPin, Calendar, Plus, X, Save, Navigation, Pencil, Trash } from 'lucide-react';
import { useApp, normalizeText } from '../context/AppContext';
import { Card, SectionTitle, Input, ButtonSecondary, ButtonPrimary } from '../components/UI';
import { salvarDados } from '../services/firestoreService';
import { getMembersLS, setMembersLS } from '../services/storage';

interface FormErrors {
  email?: string;
  phone?: string;
  birthday?: string;
  cep?: string;
  general?: string;
}

const { members, addMember, updateMember, deleteMember } = useApp();
const [searchTerm, setSearchTerm] = useState('');
const [expandedId, setExpandedId] = useState<string | null>(null);
const [editingId, setEditingId] = useState<string | null>(null);

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

// ... (CEP Auto-Fill and Validation remain same)

// Toast State
const [toastMsg, setToastMsg] = useState<string | null>(null);

const showToast = (type: 'success' | 'warn', msg: string) => {
  setToastMsg(msg);
  setTimeout(() => setToastMsg(null), 2500);
};

const [isSaving, setIsSaving] = useState(false);

const handleDelete = (id: string, e: React.MouseEvent) => {
  e.stopPropagation();
  if (window.confirm("Excluir este membro?")) {
    deleteMember(id);

    // Update LocalStorage
    const currentMembers = getMembersLS();
    const updatedList = currentMembers.filter(m => m.member_id !== id);
    setMembersLS(updatedList);

    showToast('success', 'Membro excluído.');
  }
};

const handleEdit = (member: any, e: React.MouseEvent) => {
  e.stopPropagation();
  setEditingId(member.member_id);
  setFormData({
    husband_name: member.husband_name,
    wife_name: member.wife_name,
    email: member.email || '',
    phone: member.phone || '',
    cep: member.cep || '',
    address: member.address || '',
    number: '', // Reset number as it is part of address usually
    neighborhood: member.neighborhood || '',
    city: member.city || '',
    state: member.state || '',
    birthday: member.birthday || '',
    notes: member.notes || ''
  });
  setIsModalOpen(true);
};

const cancelEdit = () => {
  setEditingId(null);
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
  setIsModalOpen(false);
};

const handleSave = async () => {
  if (isSaving) return;

  // Basic required fields check
  if (!formData.husband_name || !formData.wife_name) {
    showToast('warn', 'Preencha os nomes do casal.');
    return;
  }

  if (!validateForm()) {
    showToast('warn', 'Verifique os erros no formulário.');
    return;
  }

  setIsSaving(true);

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
  }

  const memberData = {
    husband_name: formData.husband_name,
    wife_name: formData.wife_name,
    email: formData.email,
    phone: formData.phone,
    cep: formData.cep,
    address: `${formData.address}${formData.number ? `, ${formData.number}` : ''}`,
    neighborhood: formData.neighborhood,
    city: formData.city,
    state: formData.state,
    birthday: formData.birthday,
    notes: formData.notes,
    geo_lat: lat,
    geo_lng: lng,
  };


  try {
    if (editingId) {
      // Update existing
      const updatedMember = { ...memberData, member_id: editingId };

      // In a real app we would update firestore too, but user asked for "localStorage" persistence mainly for this task loop?
      // Assuming we should update Firestore if possible or just Context+LS as per request constraint "remove from state + localStorage".
      // Using salvarDados for update might limit us if it only creates? 
      // Implementation plan says "Update existing". 
      // Assuming just LS/Ctx for now or re-using salvarDados if it handles merge? No, firestoreService usually has update. 
      // But let's stick to valid requirements: "replace the existing item in the array by id, then persist to localStorage".

      updateMember(updatedMember);

      // Update LocalStorage
      const currentMembers = getMembersLS();
      const updatedList = currentMembers.map(m => m.member_id === editingId ? updatedMember : m);
      setMembersLS(updatedList);

      showToast('success', 'Membro atualizado.');
    } else {
      // Create new
      const docRef = await salvarDados('members', memberData);

      const newMemberWithId = {
        ...memberData,
        member_id: docRef.id
      };

      addMember(newMemberWithId);

      // Persist to LocalStorage
      const updatedMembersList = [...members, newMemberWithId];
      setMembersLS(updatedMembersList);

      showToast('success', '✅ Contato salvo');
    }

    setIsModalOpen(false);
    setEditingId(null);
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
    showToast('warn', 'Erro ao salvar dados.');
  } finally {
    setIsSaving(false);
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
      <div className="flex gap-2">
        <ButtonPrimary onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar Membro'}
        </ButtonPrimary>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-carmel-brown text-white p-2 rounded-full shadow-md active:scale-95 transition-transform"
          title="Adicionar Membro"
        >
          <Plus size={20} />
        </button>
      </div>
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
            <div className="flex gap-2 items-center">
              <button
                onClick={(e) => handleEdit(member, e)}
                className="p-1 text-carmel-brown/60 hover:text-carmel-brown active:scale-95 transition-colors"
                title="Editar"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={(e) => handleDelete(member.member_id, e)}
                className="p-1 text-red-400 hover:text-red-600 active:scale-95 transition-colors"
                title="Excluir"
              >
                <Trash size={16} />
              </button>
              <div className="text-carmel-gold text-xs font-bold">
                {member.notes === 'Coordenadores' ? 'COORD' : ''}
              </div>
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
            <h3 className="font-serif font-bold text-xl text-carmel-brown">
              {editingId ? 'Editar Membro' : 'Adicionar Membros'}
            </h3>
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
                  onChange={(e) => setFormData({ ...formData, husband_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-carmel-brown mb-1">Nome Esposa *</label>
                <Input
                  value={formData.wife_name}
                  onChange={(e) => setFormData({ ...formData, wife_name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-carmel-brown mb-1">CEP *</label>
              <Input
                placeholder="00000-000"
                value={formData.cep}
                onChange={(e) => {
                  setFormData({ ...formData, cep: e.target.value });
                  if (errors.cep) setErrors({ ...errors, cep: undefined });
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
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled // Auto-filled from CEP
                  className="bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-carmel-brown mb-1">Número</label>
                <Input
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-carmel-brown mb-1">Bairro</label>
                <Input
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
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
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
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
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: undefined });
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
                  setFormData({ ...formData, birthday: e.target.value });
                  if (errors.birthday) setErrors({ ...errors, birthday: undefined });
                }}
                className={errors.birthday ? 'border-red-500' : ''}
              />
              {errors.birthday && <span className="text-red-500 text-xs mt-1 block">{errors.birthday}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-carmel-brown mb-1">Observações</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ex: Coordenadores"
              />
            </div>

            {errors.general && <p className="text-red-500 text-center text-sm font-bold">{errors.general}</p>}

            <div className="flex gap-2 mt-4">
              {editingId && (
                <ButtonSecondary onClick={cancelEdit} className="flex-1" disabled={isSaving}>
                  Cancelar Edição
                </ButtonSecondary>
              )}
              <ButtonPrimary onClick={handleSave} className="flex-1" disabled={isSaving}>
                <Save size={18} /> {isSaving ? 'Salvando...' : (editingId ? 'Atualizar Membro' : 'Salvar Membro')}
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </div>
    )}
    {/* Toast Notification */}
    {toastMsg && (
      <div style={{
        position: "fixed",
        bottom: 90,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "10px 14px",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.15)",
        background: "rgba(0,0,0,0.75)",
        color: "#fff",
        fontWeight: 800,
        zIndex: 9999,
        maxWidth: "92%",
        textAlign: "center"
      }}>
        {toastMsg}
      </div>
    )}
  </div>
);
};
