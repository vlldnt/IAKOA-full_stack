import { useState } from 'react';
import { SocialButton } from '@/components/ui/SocialButton';
import googleIcon from '@/assets/icons/google.svg';
import facebookIcon from '@/assets/icons/facebook.svg';
import appleIcon from '@/assets/icons/apple.svg';

interface SocialConnectIconsProps {
  label?: string;
}

// Affiche les boutons de connexion sociale (Google, Facebook, Apple)
// Boutons non fonctionnels - implémentation OAuth à venir
function SocialConnectIcons({ label = 'Se connecter avec :' }: SocialConnectIconsProps) {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-gray-500 text-sm">{label}</p>
      <div className="flex justify-center items-center gap-4">
        <SocialButton
          icon={googleIcon}
          alt="Google"
          name="Google"
          isHovered={hoveredIcon === 'google'}
          onHover={(hovered) => setHoveredIcon(hovered ? 'google' : null)}
        />
        <SocialButton
          icon={facebookIcon}
          alt="Facebook"
          name="Facebook"
          isHovered={hoveredIcon === 'facebook'}
          onHover={(hovered) => setHoveredIcon(hovered ? 'facebook' : null)}
        />
        <SocialButton
          icon={appleIcon}
          alt="Apple"
          name="Apple"
          isHovered={hoveredIcon === 'apple'}
          onHover={(hovered) => setHoveredIcon(hovered ? 'apple' : null)}
        />
      </div>
    </div>
  );
}

export default SocialConnectIcons;
