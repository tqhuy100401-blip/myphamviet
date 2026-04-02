import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';

function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className={`dropdown ${className}`} style={{ display: 'inline-block' }}>
      <button 
        className="btn btn-light dropdown-toggle" 
        id="languageDropdown" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
        style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}
      >
        <FiGlobe size={18} /> 
        {i18n.language === 'vi' ? 'Tiếng Việt' : 'English'}
      </button>
      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="languageDropdown">
        <li>
          <button 
            className="dropdown-item" 
            onClick={() => changeLanguage('vi')}
            style={{ 
              fontWeight: i18n.language === 'vi' ? 700 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🇻🇳 Tiếng Việt
          </button>
        </li>
        <li>
          <button 
            className="dropdown-item" 
            onClick={() => changeLanguage('en')}
            style={{ 
              fontWeight: i18n.language === 'en' ? 700 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🇬🇧 English
          </button>
        </li>
      </ul>
    </div>
  );
}

export default LanguageSwitcher;
