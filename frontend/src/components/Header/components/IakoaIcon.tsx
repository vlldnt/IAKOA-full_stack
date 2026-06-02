import { forwardRef } from 'react';
// Importé comme asset Vite : l'URL est résolue et servie correctement (évite le
// 404 que produisait la référence en dur "/iakoaIcon.svg").
import iakoaIconUrl from '@/assets/iakoaIcon.svg';

interface IakoaIconProps {
  className?: string;
}

export const IakoaIcon = forwardRef<SVGSVGElement, IakoaIconProps>(({ className }, ref) => {
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className || "h-5 w-5 lg:h-6 lg:w-6"}
    >
      <image href={iakoaIconUrl} x="0" y="0" width="24" height="24" />
    </svg>
  );
});

IakoaIcon.displayName = 'IakoaIcon';
