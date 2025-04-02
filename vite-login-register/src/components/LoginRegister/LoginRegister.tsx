import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaEnvelope, FaRegMoon, FaPhone } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import { MdOutlineLanguage } from "react-icons/md";
import { TiWeatherSunny } from "react-icons/ti";
import { login, register } from './api'; 
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './LoginRegister.module.css';
import { tokens } from './theme';

// Type definitions
interface FormData {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
}

interface TranslationKeys {
  login: string;
  register: string;
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  rememberMe: string;
  forgotPassword: string;
  terms: string;
  haveAccount: string;
  noAccount: string;
  continueWithGoogle: string;
}

interface Translations {
  en: TranslationKeys;
  am: TranslationKeys;
  om: TranslationKeys;
  ti: TranslationKeys;
}

interface LanguageDropdownProps {
  onLanguageChange: (lang: string) => void;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  colors: {
    primary: Record<number, string>;
    grey: Record<number, string>;
    greenAccent: Record<number, string>;
  };
}

// Translation dictionary
const translations: Translations = {
  en: {
    login: "Login",
    register: "Register",
    username: "Username",
    password: "Password",
    email: "Email",
    phoneNumber: "Phone Number",
    rememberMe: "Remember me",
    forgotPassword: "Forgot Password",
    terms: "I agree to the terms & conditions",
    haveAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    continueWithGoogle: "Continue with Google"
  },
  am: {
    login: "ግባ",
    register: "ክፈት",
    username: "የተጠቃሚ ስም",
    password: "የይለፍ ቃል",
    email: "ኢሜይል",
    phoneNumber: "ስልክ ቁጥር",
    rememberMe: "አስታውሰኝ",
    forgotPassword: "የይለፍ ቃል ረሳኽው?",
    terms: "ከውሎች ጋር ተስማምቻለሁ",
    haveAccount: "ቀድሞ መለያ አለህ?",
    noAccount: "መለያ የሎትም?",
    continueWithGoogle: "በGoogle ይቀጥሉ"
  },
  om: {
    login: "Seeni",
    register: "Galmeessuu",
    username: "Maqaa Fayyadamaa",
    password: "Jecha Darbii",
    email: "Imeelii",
    phoneNumber: "Lakkoofsa Bilbila",
    rememberMe: "Na Yaadadhu",
    forgotPassword: "Jecha Darbii Dagadhe?",
    terms: "Sharii fi haala waliin walii galle",
    haveAccount: "Akkaawuntii hordoftanii?",
    noAccount: "Akkaawuntii hin qabduu?",
    continueWithGoogle: "Google waliin itti fufu"
  },
  ti: {
    login: "እተው",
    register: "ተመዝገብ",
    username: "ስም ተጠቃሚ",
    password: "መሕለፊ ቃል",
    email: "ኢመይል",
    phoneNumber: "ቁጽሪ ስልኪ",
    rememberMe: "ዘክርኒ",
    forgotPassword: "መሕለፊ ቃል ረሲዕካ?",
    terms: "ምስ ውዕላት ተሰማሚዐ",
    haveAccount: "ድሮ መለያ ኣለካ?",
    noAccount: "መለያ የብልካን?",
    continueWithGoogle: "ብGoogle ቀፀል"
  }
};

const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ 
  onLanguageChange, 
  isOpen, 
  onMouseEnter, 
  onMouseLeave, 
  colors 
}) => {
  const languages = [
    { code: 'en', name: 'Eng' },
    { code: 'am', name: 'Amh' },
    { code: 'om', name: 'A/O' },
    { code: 'ti', name: 'Tig' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        right: '0',
        top: '40px',
        backgroundColor: colors.primary[500],
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        display: isOpen ? 'block' : 'none',
        zIndex: 1000,
        color: colors.grey[100],
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {languages.map((lang) => (
        <div
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          style={{
            padding: '10px',
            cursor: 'pointer',
            color: colors.grey[100],
            borderBottom: '1px solid #ddd',
            transition: 'color 0.3s ease',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#00bfff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = colors.grey[100])}
        >
          {lang.name}
        </div>
      ))}
    </div>
  );
};

const LoginRegister: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [isNightMode, setIsNightMode] = useState(false);
  const [language, setLanguage] = useState<keyof Translations>('en');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedLanguage = sessionStorage.getItem('preferredLanguage');
    if (savedLanguage && translations[savedLanguage as keyof Translations]) {
      setLanguage(savedLanguage as keyof Translations);
    } else {
      const userLanguage = navigator.language.split('-')[0];
      if (translations[userLanguage as keyof Translations]) {
        setLanguage(userLanguage as keyof Translations);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({
        email: formData.email,
        password: formData.password
      });
      const { token } = res.data;
      localStorage.setItem('token', token);
      navigate('/admin', { replace: true });

      toast.success('Login successful!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await register(formData);
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        toast.success('Registration successful!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setFormData({
          username: '',
          email: '',
          phoneNumber: '',
          password: '',
        });
        setIsRegisterMode(false);
      } else {
        throw new Error('Token not found in response');
      }
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const toggleTheme = () => setIsNightMode(!isNightMode);

  const handleLanguageChange = (lang: keyof Translations) => {
    setLanguage(lang);
    sessionStorage.setItem('preferredLanguage', lang);
    setIsLanguageDropdownOpen(false);
  };

  const colors = tokens(isNightMode ? 'light' : 'dark');

  return (
    <div className={`${styles.containerbox} ${isNightMode ? styles['day-mode'] : styles['night-mode']}`} 
         style={{ backgroundColor: colors.primary[500] }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className={styles['theme-toggle']} onClick={toggleTheme} style={{ color: colors.grey[100] }}>
          {isNightMode ? <TiWeatherSunny /> : <FaRegMoon />}
        </div>
        <div
          onMouseEnter={(e) => {
            setIsLanguageDropdownOpen(true);
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.border = `2px solid ${colors.greenAccent[500]}`;
            e.currentTarget.style.backgroundColor = colors.primary[400];
          }}
          onMouseLeave={(e) => {
            setIsLanguageDropdownOpen(false);
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.border = 'none';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          style={{
            cursor: 'pointer',
            color: colors.grey[100],
            position: 'absolute',
            right: '20px',
            top: '80px',
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
          }}
        >
          <MdOutlineLanguage size={25} />
          <LanguageDropdown
            onLanguageChange={handleLanguageChange}
            isOpen={isLanguageDropdownOpen}
            onMouseEnter={() => setIsLanguageDropdownOpen(true)}
            onMouseLeave={() => setIsLanguageDropdownOpen(false)}
            colors={colors}
          />
        </div>
      </div>
      <div className={`${styles.wrapper} ${isRegisterMode ? styles.active : ''}`} 
           style={{ backgroundColor: colors.primary[400], color: colors.grey[100] }}>
        {/* Login Form */}
        <div className={`${styles['form-box']} ${styles.login}`}>
          <form onSubmit={handleLogin}>
            <h1>{translations[language].login}</h1>
            <div className={styles['input-box']}>
              <input
                type="email"
                placeholder={translations[language].email}
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ color: colors.grey[100], border: `1px solid ${colors.grey[100]}` }}
              />
              <FaEnvelope className={styles.icon} style={{ color: colors.grey[100] }} />
            </div>
            <div className={styles['input-box']}>
              <input
                type="password"
                placeholder={translations[language].password}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ color: colors.grey[100], border: `1px solid ${colors.grey[100]}` }}
              />
              <FaLock className={styles.icon} style={{ color: colors.grey[100] }} />
            </div>
            <div className={styles['remember-forgot']}>
              <label>
                <input type="checkbox" /> {translations[language].rememberMe}
              </label>
              <span
                onClick={() => {}}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {translations[language].forgotPassword}
              </span>
            </div>
            <button 
               type="submit" 
               className={styles['link-button']} 
               >
              {translations[language].login}
            </button>
            <div className={styles['google-link']}>
                <button 
                  type="button" 
                  className={styles['link-button']} 
                >
                  <FcGoogle className={styles.google}/>{translations[language].continueWithGoogle}
                </button>
            </div>
            <div className={styles['register-link']}>
              <p>
                {translations[language].noAccount}{' '}
                <button
                  type="button" 
                  className={styles['link--button'] } 
                  onClick={() => setIsRegisterMode(true)}
                >
                  {translations[language].register}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Register Form */}
        <div className={`${styles['form-box']} ${styles.register}`}>
          <form onSubmit={handleRegister}>
            <h1>{translations[language].register}</h1>
            <div className={styles['input-box']}>
              <input
                type="text"
                placeholder={translations[language].username}
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={{ color: colors.grey[100], border: `1px solid ${colors.grey[100]}` }}
              />
              <FaUser className={styles.icon} style={{ color: colors.grey[100] }} />
            </div>
            <div className={styles['input-box']}>
              <input
                type="email"
                placeholder={translations[language].email}
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ color: colors.grey[100], border: `1px solid ${colors.grey[100]}` }}
              />
              <FaEnvelope className={styles.icon} style={{ color: colors.grey[100] }} />
            </div>
            <div className={styles['input-box']}>
              <input
                type="tel"
                placeholder={translations[language].phoneNumber}
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                style={{ color: colors.grey[100], border: `1px solid ${colors.grey[100]}` }}
              />
              <FaPhone className={styles.icon} style={{ color: colors.grey[100] }} />
            </div>
            <div className={styles['input-box']}>
              <input
                type="password"
                placeholder={translations[language].password}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ color: colors.grey[100], border: `1px solid ${colors.grey[100]}` }}
              />
              <FaLock className={styles.icon} style={{ color: colors.grey[100] }} />
            </div>
            <div className={styles['remember-forgot']}>
              <label>
                <input type="checkbox" /> {translations[language].terms}
              </label>
            </div>
            <button type="submit" className={styles['link-button']} >
              {translations[language].register}
            </button>
            <div className={styles['google-link']}>
                <button 
                  type="button" 
                  className={styles['link-button']} 
                >
                  <FcGoogle className={styles.google}/>{translations[language].continueWithGoogle}
                </button>
            </div>
            <div className={styles['register-link']}>
              <p>
                {translations[language].haveAccount}{' '}
                <button
                  type="button" 
                  className={styles['link--button'] } 
                  onClick={() => setIsRegisterMode(false)}
                  >
                     {translations[language].login}
                  </button>
              </p>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoginRegister;