import { forwardRef } from 'react';

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
      <image href="/iakoaIcon.svg" x="0" y="0" width="24" height="24" />
    </svg>
  );
});

IakoaIcon.displayName = 'IakoaIcon';
