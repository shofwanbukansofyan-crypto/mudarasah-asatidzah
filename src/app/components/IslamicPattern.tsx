export function IslamicPattern({ opacity = 0.45 }: { opacity?: number }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="islamic-geo" x="0" y="0" width="60" height="34.64" patternUnits="userSpaceOnUse">
          {/* Top face of isometric cube */}
          <path d="M30,0 L60,8.66 L30,17.32 L0,8.66 Z" fill="#EDE8DC" stroke="#D4C9B0" strokeWidth="0.6" />
          {/* Left face */}
          <path d="M0,8.66 L30,17.32 L30,34.64 L0,25.98 Z" fill="#E8E2D5" stroke="#D4C9B0" strokeWidth="0.6" />
          {/* Right face */}
          <path d="M60,8.66 L30,17.32 L30,34.64 L60,25.98 Z" fill="#E3DAC9" stroke="#D4C9B0" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-geo)" />
    </svg>
  );
}
