import React from 'react';

export default function HubFooter() {
  return (
    <footer className="lab-footer">
      <div className="lab-container lab-footer-grid">
        <div>
          <h2>LABINTERFACE UFSM.</h2>
          <p>Hub acadêmico de portfólios em Design de Interfaces. A estrutura foi desenhada para ser incorporada ao ecossistema digital do laboratório sem ruptura visual.</p>
        </div>
        <div className="lab-colorbars" aria-label="Cores do design system">
          <span style={{ background: '#00FFFF' }} />
          <span style={{ background: '#F48A79' }} />
          <span style={{ background: '#86EFAC' }} />
          <span style={{ background: '#D2A979' }} />
        </div>
      </div>
    </footer>
  );
}
