import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

// Barre de recherche avec deux champs: mots-clés et ville
// Utilise les icônes lucide-react au lieu de SVG inline
export function SearchBars() {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');

  const handleSearch = () => {
    if (keyword || city) {
      // TODO: Implémenter la logique de recherche côté serveur
      // Exemple: naviguer vers /search?keyword=${keyword}&city=${city}
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center bg-gray-100 rounded-full px-2 py-1 gap-2 w-full lg:w-auto">
      {/* Icône recherche */}
      <Search className="h-4 w-4 opacity-50 shrink-0" />

      {/* Champ mot-clé */}
      <input
        type="text"
        placeholder="Mots-clés..."
        className="bg-transparent outline-none text-sm flex-65 min-w-0 lg:w-70 lg:flex-none"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* Séparateur vertical */}
      <div className="h-5 w-px bg-gray-300 shrink-0" />

      {/* Icône localisation */}
      <MapPin className="h-4 w-4 opacity-50 shrink-0" />

      {/* Champ ville */}
      <input
        type="text"
        placeholder="Ville..."
        className="bg-transparent outline-none text-sm flex-35 min-w-0 lg:w-52 lg:flex-none"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* Bouton recherche */}
      <button
        onClick={handleSearch}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-blue-500 transition-colors shrink-0"
      >
        <Search className="h-4 w-4 font-bold text-iakoa-blue" />
      </button>
    </div>
  );
}
