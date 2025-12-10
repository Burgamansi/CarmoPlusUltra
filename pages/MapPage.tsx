import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, Crosshair } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SectionTitle } from '../components/UI';

// Define Leaflet types locally since we are using CDN
declare const L: any;

export const MapPage = () => {
  const { members } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Default Center (São Paulo / Mock Data Center)
  const defaultCenter = [-23.550520, -46.633308];

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Map
    const map = L.map(mapContainerRef.current).setView(defaultCenter, 13);
    mapInstanceRef.current = map;

    // Add Tile Layer (OSM standard, but reliable)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom Icon Definition
    const carmelIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="
          color: #5D4037; 
          filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.3)); 
          transform: translateY(-24px);
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#5D4037" stroke="#FFF8E7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -40]
    });

    // Add Markers
    const bounds = L.latLngBounds([]);
    let hasValidMarkers = false;

    members.forEach(member => {
      if (member.geo_lat && member.geo_lng) {
        const marker = L.marker([member.geo_lat, member.geo_lng], { icon: carmelIcon }).addTo(map);
        
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
          <div class="text-center min-w-[150px]">
            <h4 class="font-bold text-[#5D4037] text-sm mb-1">${member.husband_name} e ${member.wife_name}</h4>
            <p class="text-xs text-[#5D4037]/70 mb-3">${member.neighborhood}</p>
            <div class="flex gap-2 justify-center">
              <button onclick="window.open('https://www.google.com/maps/search/?api=1&query=${member.geo_lat},${member.geo_lng}', '_blank')" 
                class="bg-[#DCE7F2] text-[#5D4037] text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 hover:opacity-80 transition-opacity">
                Maps
              </button>
              <button onclick="window.open('https://waze.com/ul?ll=${member.geo_lat},${member.geo_lng}&navigate=yes', '_blank')"
                class="bg-[#FFF8E7] border border-[#5D4037] text-[#5D4037] text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 hover:opacity-80 transition-opacity">
                Waze
              </button>
            </div>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        bounds.extend([member.geo_lat, member.geo_lng]);
        hasValidMarkers = true;
      }
    });

    if (hasValidMarkers) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [members]);

  const handleCenterUser = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapInstanceRef.current.setView([latitude, longitude], 15);
          
          // Add user marker
          L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: '#CDAA7D',
            color: '#FFF',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
          }).addTo(mapInstanceRef.current).bindPopup('Você está aqui').openPopup();
        },
        (error) => {
          alert('Não foi possível obter sua localização.');
          console.error(error);
        }
      );
    } else {
      alert('Geolocalização não suportada neste navegador.');
    }
  };

  const flyToMember = (lat: number, lng: number) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 16, {
        duration: 1.5
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <SectionTitle>Mapa da Comunidade</SectionTitle>
        <button 
          onClick={handleCenterUser}
          className="bg-carmel-brown text-white p-2 rounded-full shadow-lg active:scale-95 transition-transform"
          title="Minha Localização"
        >
          <Crosshair size={20} />
        </button>
      </div>
      
      {/* Map Container */}
      <div className="relative w-full h-1/2 min-h-[300px] bg-carmel-beige rounded-xl overflow-hidden shadow-md border border-carmel-gold/30 mb-4 z-0">
        <div ref={mapContainerRef} className="w-full h-full z-0" style={{ zIndex: 0 }} />
      </div>

      <h3 className="font-serif font-bold text-carmel-brown mb-2 px-1">Localização dos Membros</h3>
      
      <div className="space-y-3 flex-1 overflow-y-auto pb-4">
        {members.map(member => (
           <div 
             key={member.member_id} 
             onClick={() => flyToMember(member.geo_lat, member.geo_lng)}
             className="bg-white p-3 rounded-lg border-l-4 border-carmel-gold shadow-sm flex justify-between items-center cursor-pointer hover:bg-carmel-beige/30 transition-colors"
           >
              <div>
                 <h4 className="font-bold text-sm text-carmel-brown">{member.husband_name} e {member.wife_name}</h4>
                 <p className="text-xs text-carmel-brown/60">{member.neighborhood}</p>
              </div>
              <div className="flex gap-2">
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     window.open(`https://www.google.com/maps/search/?api=1&query=${member.geo_lat},${member.geo_lng}`, '_blank');
                   }}
                   className="p-2 bg-carmel-blue rounded-full text-carmel-brown hover:opacity-80"
                 >
                   <MapPin size={16} />
                 </button>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     window.open(`https://waze.com/ul?ll=${member.geo_lat},${member.geo_lng}&navigate=yes`, '_blank');
                   }}
                   className="p-2 bg-carmel-beige border border-carmel-brown/20 rounded-full text-carmel-brown hover:opacity-80"
                 >
                   <Navigation size={16} />
                 </button>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
};