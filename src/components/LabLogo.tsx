import React from 'react';

export default function LabLogo({ className = 'lab-logo' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className} aria-hidden="true">
      <rect width="100" height="100" rx="24" fill="#0A0A0A" stroke="#3A4D3E" strokeWidth="4" />
      <path d="M 32 28 L 32 72 L 52 72" fill="none" stroke="#22D3EE" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="72" y1="48" x2="72" y2="72" stroke="#F48A79" strokeWidth="12" strokeLinecap="round" />
      <circle cx="72" cy="28" r="6" fill="#D2A979" />
    </svg>
  );
}
