/**
 * Side view of a Chattogram tempu (shared three-wheeler): marigold cab,
 * green passenger box, and the two visible wheels. Used for map markers,
 * the brand mark, and illustrations so vehicles look like tempus, not vans.
 */
export const TEMPU_SVG = `<svg viewBox="0 0 64 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <path d="M20 5h33a5 5 0 0 1 5 5v21H20z" fill="#0F5C43"/>
  <path d="M20 9h-5.5a7 7 0 0 0-6.6 4.7L5 22v9h15z" fill="#F2B233"/>
  <path d="M10.6 14.5 8.4 21h9.1v-6.5z" fill="#E7F3EC"/>
  <rect x="23.5" y="9" width="9" height="8" rx="2" fill="#E7F3EC"/>
  <rect x="35.5" y="9" width="9" height="8" rx="2" fill="#E7F3EC"/>
  <rect x="47.5" y="9" width="7" height="8" rx="2" fill="#E7F3EC"/>
  <path d="M20 21h38" stroke="#F2B233" stroke-width="2"/>
  <rect x="3" y="29" width="57" height="4.5" rx="2.25" fill="#0A3F2E"/>
  <circle cx="14" cy="35.5" r="6.5" fill="#10231C"/>
  <circle cx="14" cy="35.5" r="2.6" fill="#F4F1EA"/>
  <circle cx="48" cy="35.5" r="6.5" fill="#10231C"/>
  <circle cx="48" cy="35.5" r="2.6" fill="#F4F1EA"/>
</svg>`;

type TempuIconProps = {
  className?: string;
  size?: number;
};

export function TempuIcon({ className, size = 40 }: TempuIconProps) {
  return (
    <span
      className={className ? `tempu-icon ${className}` : "tempu-icon"}
      style={{ width: size, height: Math.round((size * 44) / 64) }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: TEMPU_SVG }}
    />
  );
}
