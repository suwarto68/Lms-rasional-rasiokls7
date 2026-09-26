import React, { useState } from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SCHOOL_LOGO_URL = 'https://ibb.co.com/S4095CCm';

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ className = '', size = 'md' }) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
  };

  return (
    <div
      className={`relative shrink-0 rounded-xl bg-white p-1 shadow-sm border border-sky-200/80 flex items-center justify-center overflow-hidden ${sizeMap[size]} ${className}`}
      title="Logo Resmi SMP Negeri 1 Wanaraya - Kabupaten Barito Kuala"
    >
      {!imgError ? (
        <img
          src={SCHOOL_LOGO_URL}
          alt="Logo SMP Negeri 1 Wanaraya"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain"
        />
      ) : (
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-label="Logo SMP Negeri 1 Wanaraya"
        >
          {/* Perisai Segilima Pendidikan */}
          <path
            d="M32 4L56 14V32C56 46.5 45.5 56.5 32 60C18.5 56.5 8 46.5 8 32V14L32 4Z"
            fill="url(#shieldGrad)"
            stroke="#0369A1"
            strokeWidth="2.5"
          />
          <path
            d="M32 8L52 16.5V31.5C52 43.5 43.2 52.2 32 55.2C20.8 52.2 12 43.5 12 31.5V16.5L32 8Z"
            stroke="#BAE6FD"
            strokeWidth="1.2"
          />
          {/* Bintang Pendidikan */}
          <polygon
            points="32,12 34.2,16.8 39.5,17.3 35.5,20.8 36.7,26 32,23.2 27.3,26 28.5,20.8 24.5,17.3 29.8,16.8"
            fill="#FACC15"
          />
          {/* Buku Terbuka */}
          <path
            d="M19 36C23 34.5 27.5 35 32 37.5C36.5 35 41 34.5 45 36V45C41 43.5 36.5 44 32 46.5C27.5 44 23 43.5 19 45V36Z"
            fill="#FFFFFF"
          />
          <path d="M32 37.5V46.5" stroke="#0284C7" strokeWidth="1.5" />
          {/* Pita SMPN 1 WANARAYA */}
          <rect x="16" y="27" width="32" height="6.5" rx="2" fill="#FDE047" />
          <text
            x="32"
            y="31.8"
            textAnchor="middle"
            fill="#0F172A"
            fontSize="5.2"
            fontWeight="700"
            fontFamily="Plus Jakarta Sans, sans-serif"
          >
            SMPN 1 WNR
          </text>
          <defs>
            <linearGradient id="shieldGrad" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0284C7" />
              <stop offset="1" stopColor="#0369A1" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  );
};
