import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, LogIn, Menu, X, UserRoundCog } from 'lucide-react';
import LabLogo from './LabLogo';

export default function HubHeader({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="lab-header">
        <Link to="/" className="lab-brand" aria-label="Portfólios LabInterface — início">
          <LabLogo />
          <div>
            <h1 className="lab-brand-title">LabInterface UFSM</h1>
            <p className="lab-brand-sub">PORTFÓLIOS / DESIGN SYSTEM</p>
          </div>
        </Link>
        <div className="lab-header-actions">
          {!compact && (
            <button className="lab-icon-btn" onClick={() => navigate('/')} aria-label="Ver portfólios">
              <LayoutGrid size={20} />
            </button>
          )}
          <button className="lab-pill-btn" onClick={() => navigate('/entrar')}>
            <LogIn size={19} /><span>Entrar</span>
          </button>
          <button className="lab-icon-btn" onClick={() => setOpen(v => !v)} aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(5,5,5,.98)', backdropFilter: 'blur(28px)', paddingTop: 110, overflowY: 'auto' }}>
          <div className="lab-container" style={{ paddingBottom: 80 }}>
            <div className="section-head">
              <div>
                <p className="lab-kicker">LABINTERFACE UFSM</p>
                <h2>Hub de Portfólios</h2>
              </div>
              <p>Uma única infraestrutura para portfólios autorais distintos, preservando a identidade visual do Laboratório de Interfaces.</p>
            </div>
            <div className="portfolio-grid">
              <button className="portfolio-card" style={{ ['--student-accent' as string]: '#00FFFF', textAlign: 'left' }} onClick={() => { setOpen(false); navigate('/'); }}>
                <div><LayoutGrid size={34} color="#00FFFF" /><h3>Portfólios</h3><p>Explorar os cinco espaços autorais da turma.</p></div>
                <div className="portfolio-card-foot"><span>Área pública</span><span className="portfolio-card-arrow">↗</span></div>
              </button>
              <button className="portfolio-card" style={{ ['--student-accent' as string]: '#D2A979', textAlign: 'left' }} onClick={() => { setOpen(false); navigate('/entrar'); }}>
                <div><UserRoundCog size={34} color="#D2A979" /><h3>Área do estudante</h3><p>Editar identidade, projetos, imagens e configurações do próprio portfólio.</p></div>
                <div className="portfolio-card-foot"><span>Acesso protegido</span><span className="portfolio-card-arrow">↗</span></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
