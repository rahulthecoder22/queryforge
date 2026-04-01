import { useId } from 'react';

type Props = {
  className?: string;
  size?: number;
  /** Omit rounded plate behind the mark. */
  markOnly?: boolean;
};

/**
 * QueryForge mark: search arc + “result rows” (forge). Matches `public/favicon.svg`.
 */
export function QueryForgeLogo({ className = '', size = 36, markOnly = false }: Props) {
  const uid = useId().replace(/:/g, '');
  const gradId = `qf-logo-stroke-${uid}`;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="6" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent-primary, #6C5CE7)" />
          <stop offset="1" stopColor="var(--accent-secondary, #00CEC9)" />
        </linearGradient>
      </defs>
      {!markOnly ? <rect width="40" height="40" rx="10" fill="var(--bg-secondary, #111827)" opacity={0.9} /> : null}
      <path
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20 9a7.5 7.5 0 1 0 4.9 13.2L31 31"
      />
      <path
        fill={`url(#${gradId})`}
        d="M26 8.5h6v2.2h-6V8.5zm0 4.4h6v2.2h-6v-2.2zm0 4.3h4.5v2.2H26v-2.2z"
        opacity={0.95}
      />
    </svg>
  );
}
