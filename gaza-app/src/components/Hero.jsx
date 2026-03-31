import { useLang } from '../context/LangContext';
import './Hero.css';

export default function Hero() {
  const { t } = useLang();

  const scrollToMap = () => {
    const mapElement = document.getElementById('map-section-wrapper');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-bg-shape"></div>
      <div className="hero-bg-shape-2"></div>
      
      <div className="hero-container">
        <div className="hero-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {t.heroBadge}
        </div>
        
        <h1 className="hero-title">
          {t.heroTitle.split(' ').map((word, i) => (
            <span key={i} className={(word.includes('غزة') || word.includes('Gaza') || word.includes('تضاريس') || word.includes('Terrain')) ? 'text-gradient' : ''}>
              {word}{' '}
            </span>
          ))}
        </h1>
        
        <p className="hero-subtitle">
          {t.heroSubtitle}
        </p>
        
        <div className="hero-actions">
          <button className="hero-btn-primary" onClick={scrollToMap} aria-label="Scroll to map">
            {t.heroBtn}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
            </svg>
          </button>
        </div>

        <div className="hero-features">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <h3>{t.feat1Title}</h3>
            <p>{t.feat1Desc}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <h3>{t.feat2Title}</h3>
            <p>{t.feat2Desc}</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <h3>{t.feat3Title}</h3>
            <p>{t.feat3Desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
