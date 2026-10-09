import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Comprehensive dictionary for Hindi translations
const hindiDictionary = {
  // Navigation & Header
  'सेवा': 'सेवाएं',
  'Services': 'सेवाएं',
  'अर्ज स्थिती': 'आवेदन स्थिति',
  'Track Status': 'आवेदन स्थिति',
  'योजना दूत': 'योजना दूत',
  'Yojana Dut': 'योजना दूत',
  'वॉलेट': 'वॉलेट',
  'Wallet': 'वॉलेट',
  'सूचना': 'सूचनाएं',
  'Notices': 'सूचनाएं',
  'संपर्क': 'संपर्क',
  'Contact': 'संपर्क',
  'सेवा अर्ज करा': 'सेवा के लिए आवेदन करें',
  'Apply for Service': 'सेवा के लिए आवेदन करें',
  'लॉगिन': 'लॉग इन',
  'Login': 'लॉग इन',
  'लॉगआउट करा': 'लॉग आउट करें',
  'Logout': 'लॉग आउट करें',
  'माझे अर्ज': 'मेरे आवेदन',
  'My Applications': 'मेरे आवेदन',
  'योजना दूत पोर्टल': 'योजना दूत पोर्टल',
  'Gov Facilitation Portal': 'शासकीय सुविधा पोर्टल',
  'सूचना आणि अपडेट्स': 'सूचनाएं एवं अपडेट्स',
  'Notifications': 'सूचनाएं एवं अपडेट्स',
  'सर्व अर्ज पहा →': 'सभी आवेदन देखें →',
  'View all applications →': 'सभी आवेदन देखें →',
  'नागरिक': 'नागरिक',
  'Citizen': 'नागरिक',
  'एजंट': 'एजेंट',
  'Agent': 'एजेंट',

  // Categories & Filters
  'सर्व सेवा': 'सभी सेवाएं',
  'All Services': 'सभी सेवाएं',
  'दाखले': 'प्रमाण पत्र',
  'Certificates': 'प्रमाण पत्र',
  'दाखले / प्रमाणपत्र': 'प्रमाण पत्र',
  'ओळखपत्र': 'पहचान पत्र',
  'Identity': 'पहचान पत्र',
  'ओळखपत्र सेवा': 'पहचान पत्र सेवाएं',
  'शेती': 'कृषि',
  'Agriculture': 'कृषि',
  'शेती व महसूल': 'कृषि एवं राजस्व',
  'महसूल व शेती': 'कृषि एवं राजस्व',
  'Revenue': 'राजस्व',
  'व्यापार': 'व्यापार',
  'Business': 'व्यापार',
  'व्यापार व उद्योग': 'व्यापार एवं उद्योग',
  'समाजकल्याण': 'कल्याणकारी योजनाएं',
  'Social': 'कल्याणकारी योजनाएं',
  'कल्याणकारी योजना': 'कल्याणकारी योजनाएं',
  'सर्व वर्गवारी': 'सभी श्रेणियां',
  'All Categories': 'सभी श्रेणियां',
  'शोधा': 'खोजें',
  'Search': 'खोजें',
  'सरकारी सेवा शोधा...': 'सरकारी सेवाएं खोजें...',
  'Search government services...': 'सरकारी सेवाएं खोजें...',
  'लोकप्रिय सेवा': 'लोकप्रिय सेवाएं',
  'Popular Services': 'लोकप्रिय सेवाएं',
  'कागदपत्रे': 'दस्तावेज',
  'Documents': 'दस्तावेज',
  'कालावधी': 'समय सीमा',
  'Timeline': 'समय सीमा',
  'शुल्क': 'शुल्क',
  'Fee': 'शुल्क',
  'कमिशन': 'कमीशन',
  'Commission': 'कमीशन',
  'अर्ज करा': 'आवेदन करें',
  'Apply Now': 'आवेदन करें',
  'तपशील पहा': 'विवरण देखें',
  'View Details': 'विवरण देखें',

  // Track Status
  'अर्ज क्रमांक': 'आवेदन संख्या',
  'Application Number': 'आवेदन संख्या',
  'अर्जाची स्थिती तपासा': 'आवेदन की स्थिति जांचें',
  'Check Application Status': 'आवेदन की स्थिति जांचें',
  'अर्ज प्राप्त': 'आवेदन प्राप्त',
  'Received': 'आवेदन प्राप्त',
  'तपासणी': 'सत्यापन',
  'Verification': 'सत्यापन',
  'कागदपत्रे तपासणी': 'दस्तावेज सत्यापन',
  'Doc Review': 'दस्तावेज सत्यापन',
  'प्रक्रियेत': 'प्रक्रिया में',
  'In Process': 'प्रक्रिया में',
  'पूर्ण': 'पूर्ण',
  'Completed': 'पूर्ण',
  'कागदपत्र त्रुटी आढळली': 'दस्तावेज में त्रुटि पाई गई',
  'Document action required': 'दस्तावेज में त्रुटि पाई गई',
  'कागदपत्रे अपलोड करा': 'दस्तावेज अपलोड करें',
  'Upload Document': 'दस्तावेज अपलोड करें',
  'सध्याची स्थिती': 'वर्तमान स्थिति',
  'Current Status': 'वर्तमान स्थिति',
  'कागदपत्र पुन्हा अपलोड करा': 'दस्तावेज पुनः अपलोड करें',
  'Re-upload Document': 'दस्तावेज पुनः अपलोड करें',
  'नवीन स्पष्ट कागदपत्र निवडा': 'नया स्पष्ट दस्तावेज चुनें',
  'Select clear document file': 'नया स्पष्ट दस्तावेज चुनें',
  'फाईल निवडा': 'फ़ाइल चुनें',
  'Browse File': 'फ़ाइल चुनें',
  'रद्द करा': 'रद्द करें',
  'Cancel': 'रद्द करें',
  'दाखला डाउनलोड करा': 'प्रमाण पत्र डाउनलोड करें',
  'Download Certificate': 'प्रमाण पत्र डाउनलोड करें',

  // Wallet
  'वॉलेट व कमाई व्यवस्थापन': 'वॉलेट एवं कमाई प्रबंधन',
  'Wallet & Earnings': 'वॉलेट एवं कमाई प्रबंधन',
  'रक्कम काढा (Withdraw)': 'राशि निकालें (Withdraw)',
  'Withdraw Funds': 'राशि निकालें (Withdraw)',
  'उपलब्ध शिल्लक': 'उपलब्ध शेष राशि',
  'Available Balance': 'उपलब्ध शेष राशि',
  'प्रलंबित कमिशन': 'लंबित कमीशन',
  'Pending Commission': 'लंबित कमीशन',
  'एकूण मंजूर कमाई': 'कुल स्वीकृत कमाई',
  'Total Approved': 'कुल स्वीकृत कमाई',
  'काढलेली रक्कम': 'निकाली गई राशि',
  'Total Withdrawn': 'निकाली गई राशि',
  'व्यवहार तपशील (Transaction History)': 'लेन-देन विवरण',
  'Transaction History': 'लेन-देन विवरण',

  // Common
  'गाव': 'गांव',
  'Village': 'गांव',
  'तालुका': 'तहसील',
  'Taluka': 'तहसील',
  'जिल्हा': 'जिला',
  'District': 'जिला',
  'नाव': 'नाम',
  'Name': 'नाम',
  'मोबाईल': 'मोबाइल',
  'Mobile': 'मोबाइल',
  'ईमेल': 'ईमेल',
  'Email': 'ईमेल',
  'आधार कार्ड': 'आधार कार्ड',
  'Aadhaar Card': 'आधार कार्ड',
  'रेशन कार्ड': 'राशन कार्ड',
  'Ration Card': 'राशन कार्ड',
  'उत्पन्न दाखला': 'आय प्रमाण पत्र',
  'Income Certificate': 'आय प्रमाण पत्र',
  'पॅन कार्ड': 'पैन कार्ड',
  'PAN Card': 'पैन कार्ड',
};

export const LanguageProvider = ({ children }) => {
  // 'mr' (मराठी - default), 'hi' (हिंदी), or 'en' (English)
  const [lang, setLang] = useState('mr');

  useEffect(() => {
    const saved = localStorage.getItem('yojanadut_lang');
    if (saved && (saved === 'mr' || saved === 'hi' || saved === 'en')) {
      setLang(saved);
    }
  }, []);

  const switchLanguage = (newLang) => {
    if (newLang === 'mr' || newLang === 'hi' || newLang === 'en') {
      setLang(newLang);
      localStorage.setItem('yojanadut_lang', newLang);
    }
  };

  const t = (marathiText, englishText, hindiText) => {
    if (lang === 'mr') return marathiText;
    if (lang === 'en') return englishText || marathiText;
    if (lang === 'hi') {
      if (hindiText) return hindiText;
      if (hindiDictionary[marathiText]) return hindiDictionary[marathiText];
      if (englishText && hindiDictionary[englishText]) return hindiDictionary[englishText];
      return marathiText;
    }
    return marathiText;
  };

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
