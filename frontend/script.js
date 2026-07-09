const landingView = document.querySelector("#landingView");
const managerDashboard = document.querySelector("#managerDashboard");
const employeeDashboard = document.querySelector("#employeeDashboard");
const managerLogin = document.querySelector("#managerLogin");
const employeeLogin = document.querySelector("#employeeLogin");
const backButtons = document.querySelectorAll("[data-view='landing']");
const recognizedText = document.querySelector("#recognizedText");
const languageSelect = document.querySelector("#languageSelect");
const exportReportButton = document.querySelector("#exportReportButton");

const translations = {
  hi: {
    English: "अंग्रेजी",
    Hindi: "हिंदी",
    Marathi: "मराठी",
    "IFQM Nexus": "आईएफक्यूएम नेक्सस",
    "IFQM Manager Dashboard": "आईएफक्यूएम मैनेजर डैशबोर्ड",
    "IFQM Employee Dashboard": "आईएफक्यूएम कर्मचारी डैशबोर्ड",
    "An Industry-Led Movement for Transformation": "परिवर्तन के लिए उद्योग-नेतृत्व वाला अभियान",
    "Industrial improvement intelligence": "औद्योगिक सुधार इंटेलिजेंस",
    "Intelligent Quality & Improvement Management Platform": "बुद्धिमान गुणवत्ता और सुधार प्रबंधन प्लेटफॉर्म",
    "Capture employee ideas, review critical risks, and manage Kaizen improvements with a calm enterprise dashboard built for factory teams.": "कर्मचारी विचारों को कैप्चर करें, महत्वपूर्ण जोखिमों की समीक्षा करें, और फैक्ट्री टीमों के लिए बनाए गए शांत एंटरप्राइज डैशबोर्ड से काइजेन सुधारों को प्रबंधित करें.",
    "Login as Manager": "मैनेजर के रूप में लॉगिन",
    "Login as Employee": "कर्मचारी के रूप में लॉगिन",
    "Create Employee Account": "कर्मचारी खाता बनाएं",
    "Employee ID": "कर्मचारी आईडी",
    "Employee Name": "कर्मचारी नाम",
    Password: "पासवर्ड",
    "Confirm Password": "पासवर्ड की पुष्टि करें",
    "Enter Employee ID": "कर्मचारी आईडी दर्ज करें",
    "Enter Employee Name": "कर्मचारी नाम दर्ज करें",
    "Enter Password": "पासवर्ड दर्ज करें",
    "Create Account": "खाता बनाएं",
    Cancel: "रद्द करें",
    "Manager Console": "मैनेजर कंसोल",
    Overview: "ओवरव्यू",
    Critical: "महत्वपूर्ण",
    Suggestions: "सुझाव",
    Analytics: "विश्लेषण",
    Back: "वापस",
    "Factory Intelligence Command Center": "फैक्ट्री इंटेलिजेंस कमांड सेंटर",
    "Manager dashboard": "मैनेजर डैशबोर्ड",
    "System Status": "सिस्टम स्थिति",
    Active: "सक्रिय",
    "Today's Suggestions": "आज के सुझाव",
    "Pending Reviews": "लंबित समीक्षाएं",
    "Critical Issues": "महत्वपूर्ण समस्याएं",
    "Total Suggestions": "कुल सुझाव",
    "+18 this week": "+18 इस सप्ताह",
    "Pending Review": "लंबित समीक्षा",
    "12 high attention": "12 उच्च ध्यान",
    Implemented: "लागू",
    "38% closure rate": "38% क्लोजर दर",
    "Safety Issues": "सुरक्षा समस्याएं",
    "5 critical": "5 महत्वपूर्ण",
    Search: "खोज",
    "Search suggestions": "सुझाव खोजें",
    Category: "श्रेणी",
    "All Categories": "सभी श्रेणियां",
    Safety: "सुरक्षा",
    Quality: "गुणवत्ता",
    Productivity: "उत्पादकता",
    "Cost Saving": "लागत बचत",
    Maintenance: "रखरखाव",
    "General Improvement": "सामान्य सुधार",
    Priority: "प्राथमिकता",
    "All Priorities": "सभी प्राथमिकताएं",
    High: "उच्च",
    Medium: "मध्यम",
    Low: "कम",
    Status: "स्थिति",
    "All Statuses": "सभी स्थितियां",
    Pending: "लंबित",
    "In Review": "समीक्षा में",
    Approved: "स्वीकृत",
    Rejected: "अस्वीकृत",
    "Date Range": "तारीख सीमा",
    "Suggestions queue": "सुझाव कतार",
    "Prioritized items from employee submissions.": "कर्मचारी सबमिशन से प्राथमिकता वाले आइटम.",
    "Export Report": "रिपोर्ट निर्यात",
    Suggestion: "सुझाव",
    Timestamp: "टाइमस्टैम्प",
    "Workers spend too much time waiting for tools": "कर्मचारी औजारों का इंतजार करने में बहुत समय बिताते हैं",
    "Mark material bins with clearer labels": "मटेरियल बिन पर अधिक स्पष्ट लेबल लगाएं",
    "Maintenance checklist is missing compressor inspection": "रखरखाव चेकलिस्ट में कंप्रेसर निरीक्षण नहीं है",
    "Critical Suggestions": "महत्वपूर्ण सुझाव",
    "Highest priority items needing action.": "कार्रवाई की जरूरत वाले सर्वोच्च प्राथमिकता आइटम.",
    "Safety risk - immediate containment required": "सुरक्षा जोखिम - तुरंत नियंत्रण आवश्यक",
    "Exposed electrical wiring": "खुली विद्युत वायरिंग",
    "Maintenance team assigned": "रखरखाव टीम नियुक्त",
    "Unsafe forklift route": "असुरक्षित फोर्कलिफ्ट मार्ग",
    "Route audit pending approval": "मार्ग ऑडिट स्वीकृति लंबित",
    "Category distribution": "श्रेणी वितरण",
    "Improvement opportunities by theme.": "थीम के अनुसार सुधार अवसर.",
    "Safety 32%": "सुरक्षा 32%",
    "Quality 24%": "गुणवत्ता 24%",
    "Productivity 21%": "उत्पादकता 21%",
    "Cost Saving 13%": "लागत बचत 13%",
    "Maintenance 10%": "रखरखाव 10%",
    "Priority distribution": "प्राथमिकता वितरण",
    "Risk and action urgency across open items.": "खुले आइटम में जोखिम और कार्रवाई की तात्कालिकता.",
    "Employee Console": "कर्मचारी कंसोल",
    Submit: "सबमिट",
    "My Suggestions": "मेरे सुझाव",
    "Employee improvement workflow": "कर्मचारी सुधार वर्कफ्लो",
    "Submit a Kaizen suggestion": "काइजेन सुझाव सबमिट करें",
    "Record Voice Suggestion": "वॉयस सुझाव रिकॉर्ड करें",
    "Capture an improvement idea from the shop floor.": "शॉप फ्लोर से सुधार विचार कैप्चर करें.",
    "Recognized Text": "पहचाना गया टेक्स्ट",
    "Machine number 4 has oil leakage near the operator path.": "मशीन नंबर 4 में ऑपरेटर पथ के पास तेल रिसाव है.",
    "Listening for a voice suggestion...": "वॉयस सुझाव सुन रहे हैं...",
    "Translated Text": "अनुवादित टेक्स्ट",
    "AI Analysis": "एआई विश्लेषण",
    "Submit Suggestion": "सुझाव सबमिट करें",
    "Recent submissions and their current status.": "हालिया सबमिशन और उनकी वर्तमान स्थिति.",
    Date: "तारीख",
    "11 Jun": "11 जून",
    "10 Jun": "10 जून",
    "11 Jun, 10:40 AM": "11 जून, 10:40 AM",
    "11 Jun, 09:15 AM": "11 जून, 09:15 AM",
    "10 Jun, 04:25 PM": "10 जून, 04:25 PM",
    "10 Jun, 12:10 PM": "10 जून, 12:10 PM"
  },
  mr: {
    English: "इंग्रजी",
    Hindi: "हिंदी",
    Marathi: "मराठी",
    "IFQM Nexus": "आयएफक्यूएम नेक्सस",
    "IFQM Manager Dashboard": "आयएफक्यूएम मॅनेजर डॅशबोर्ड",
    "IFQM Employee Dashboard": "आयएफक्यूएम कर्मचारी डॅशबोर्ड",
    "An Industry-Led Movement for Transformation": "परिवर्तनासाठी उद्योग-नेतृत्वाखालील चळवळ",
    "Industrial improvement intelligence": "औद्योगिक सुधारणा बुद्धिमत्ता",
    "Intelligent Quality & Improvement Management Platform": "बुद्धिमान गुणवत्ता आणि सुधारणा व्यवस्थापन प्लॅटफॉर्म",
    "Capture employee ideas, review critical risks, and manage Kaizen improvements with a calm enterprise dashboard built for factory teams.": "कर्मचार्‍यांच्या कल्पना नोंदवा, गंभीर जोखीम तपासा आणि कारखाना टीमसाठी तयार केलेल्या एंटरप्राइज डॅशबोर्डमधून काइजेन सुधारणा व्यवस्थापित करा.",
    "Login as Manager": "मॅनेजर म्हणून लॉगिन",
    "Login as Employee": "कर्मचारी म्हणून लॉगिन",
    "Create Employee Account": "कर्मचारी खाते तयार करा",
    "Employee ID": "कर्मचारी आयडी",
    "Employee Name": "कर्मचारी नाव",
    Password: "पासवर्ड",
    "Confirm Password": "पासवर्डची पुष्टी करा",
    "Enter Employee ID": "कर्मचारी आयडी प्रविष्ट करा",
    "Enter Employee Name": "कर्मचारी नाव प्रविष्ट करा",
    "Enter Password": "पासवर्ड प्रविष्ट करा",
    "Create Account": "खाते तयार करा",
    Cancel: "रद्द करा",
    "Manager Console": "मॅनेजर कन्सोल",
    Overview: "आढावा",
    Critical: "गंभीर",
    Suggestions: "सूचना",
    Analytics: "विश्लेषण",
    Back: "मागे",
    "Factory Intelligence Command Center": "फॅक्टरी इंटेलिजन्स कमांड सेंटर",
    "Manager dashboard": "मॅनेजर डॅशबोर्ड",
    "System Status": "सिस्टम स्थिती",
    Active: "सक्रिय",
    "Today's Suggestions": "आजच्या सूचना",
    "Pending Reviews": "प्रलंबित पुनरावलोकने",
    "Critical Issues": "गंभीर समस्या",
    "Total Suggestions": "एकूण सूचना",
    "+18 this week": "+18 या आठवड्यात",
    "Pending Review": "प्रलंबित पुनरावलोकन",
    "12 high attention": "12 उच्च लक्ष",
    Implemented: "अंमलात आले",
    "38% closure rate": "38% पूर्णता दर",
    "Safety Issues": "सुरक्षा समस्या",
    "5 critical": "5 गंभीर",
    Search: "शोध",
    "Search suggestions": "सूचना शोधा",
    Category: "श्रेणी",
    "All Categories": "सर्व श्रेणी",
    Safety: "सुरक्षा",
    Quality: "गुणवत्ता",
    Productivity: "उत्पादकता",
    "Cost Saving": "खर्च बचत",
    Maintenance: "देखभाल",
    "General Improvement": "सामान्य सुधारणा",
    Priority: "प्राधान्य",
    "All Priorities": "सर्व प्राधान्ये",
    High: "उच्च",
    Medium: "मध्यम",
    Low: "कमी",
    Status: "स्थिती",
    "All Statuses": "सर्व स्थिती",
    Pending: "प्रलंबित",
    "In Review": "पुनरावलोकनात",
    Approved: "मंजूर",
    Rejected: "नाकारले",
    "Date Range": "दिनांक श्रेणी",
    "Suggestions queue": "सूचना रांग",
    "Prioritized items from employee submissions.": "कर्मचारी सबमिशनमधील प्राधान्य दिलेले आयटम.",
    "Export Report": "अहवाल निर्यात",
    Suggestion: "सूचना",
    Timestamp: "टाइमस्टॅम्प",
    "Workers spend too much time waiting for tools": "कामगार साधनांची प्रतीक्षा करण्यात खूप वेळ घालवतात",
    "Mark material bins with clearer labels": "मटेरियल बिनवर स्पष्ट लेबले लावा",
    "Maintenance checklist is missing compressor inspection": "देखभाल चेकलिस्टमध्ये कंप्रेसर तपासणी नाही",
    "Critical Suggestions": "गंभीर सूचना",
    "Highest priority items needing action.": "कारवाईची गरज असलेले सर्वोच्च प्राधान्य आयटम.",
    "Safety risk - immediate containment required": "सुरक्षा जोखीम - त्वरित नियंत्रण आवश्यक",
    "Exposed electrical wiring": "उघडी विद्युत वायरिंग",
    "Maintenance team assigned": "देखभाल टीम नियुक्त",
    "Unsafe forklift route": "असुरक्षित फोर्कलिफ्ट मार्ग",
    "Route audit pending approval": "मार्ग ऑडिट मंजुरी प्रलंबित",
    "Category distribution": "श्रेणी वितरण",
    "Improvement opportunities by theme.": "थीमनुसार सुधारणा संधी.",
    "Safety 32%": "सुरक्षा 32%",
    "Quality 24%": "गुणवत्ता 24%",
    "Productivity 21%": "उत्पादकता 21%",
    "Cost Saving 13%": "खर्च बचत 13%",
    "Maintenance 10%": "देखभाल 10%",
    "Priority distribution": "प्राधान्य वितरण",
    "Risk and action urgency across open items.": "उघड्या आयटममधील जोखीम आणि कारवाईची तातडी.",
    "Employee Console": "कर्मचारी कन्सोल",
    Submit: "सबमिट",
    "My Suggestions": "माझ्या सूचना",
    "Employee improvement workflow": "कर्मचारी सुधारणा वर्कफ्लो",
    "Submit a Kaizen suggestion": "काइजेन सूचना सबमिट करा",
    "Record Voice Suggestion": "व्हॉइस सूचना रेकॉर्ड करा",
    "Capture an improvement idea from the shop floor.": "शॉप फ्लोअरवरील सुधारणा कल्पना नोंदवा.",
    "Recognized Text": "ओळखलेला मजकूर",
    "Machine number 4 has oil leakage near the operator path.": "मशीन नंबर 4 मध्ये ऑपरेटर मार्गाजवळ तेल गळती आहे.",
    "Listening for a voice suggestion...": "व्हॉइस सूचना ऐकत आहे...",
    "Translated Text": "अनुवादित मजकूर",
    "AI Analysis": "एआय विश्लेषण",
    "Submit Suggestion": "सूचना सबमिट करा",
    "Recent submissions and their current status.": "अलीकडील सबमिशन आणि त्यांची सद्य स्थिती.",
    Date: "दिनांक",
    "11 Jun": "11 जून",
    "10 Jun": "10 जून",
    "11 Jun, 10:40 AM": "11 जून, 10:40 AM",
    "11 Jun, 09:15 AM": "11 जून, 09:15 AM",
    "10 Jun, 04:25 PM": "10 जून, 04:25 PM",
    "10 Jun, 12:10 PM": "10 जून, 12:10 PM"
  }
};

const extraLanguageNames = {
  hi: {
    Tamil: "तमिल",
    Telugu: "तेलुगु",
    Gujarati: "गुजराती",
    "Language selector": "भाषा चयनकर्ता",
    "Select language": "भाषा चुनें",
    "Primary navigation": "मुख्य नेविगेशन",
    "IFQM Nexus Logo": "आईएफक्यूएम नेक्सस लोगो",
    "Choose login type": "लॉगिन प्रकार चुनें",
    "Manager navigation": "मैनेजर नेविगेशन",
    "Live operational status": "लाइव संचालन स्थिति",
    "Key metrics": "मुख्य मेट्रिक्स",
    "Suggestion filters": "सुझाव फिल्टर",
    "Update status for oil leakage": "तेल रिसाव की स्थिति अपडेट करें",
    "Update status for tool waiting": "टूल प्रतीक्षा की स्थिति अपडेट करें",
    "Update status for bin labels": "बिन लेबल की स्थिति अपडेट करें",
    "Update status for checklist": "चेकलिस्ट की स्थिति अपडेट करें",
    "Category donut chart": "श्रेणी डोनट चार्ट",
    "Employee navigation": "कर्मचारी नेविगेशन",
    "Record voice suggestion": "वॉयस सुझाव रिकॉर्ड करें"
  },
  mr: {
    Tamil: "तामिळ",
    Telugu: "तेलुगू",
    Gujarati: "गुजराती",
    "Language selector": "भाषा निवडक",
    "Select language": "भाषा निवडा",
    "Primary navigation": "मुख्य नेव्हिगेशन",
    "IFQM Nexus Logo": "आयएफक्यूएम नेक्सस लोगो",
    "Choose login type": "लॉगिन प्रकार निवडा",
    "Manager navigation": "मॅनेजर नेव्हिगेशन",
    "Live operational status": "लाइव्ह कार्यस्थिती",
    "Key metrics": "मुख्य मेट्रिक्स",
    "Suggestion filters": "सूचना फिल्टर",
    "Update status for oil leakage": "तेल गळतीची स्थिती अपडेट करा",
    "Update status for tool waiting": "साधन प्रतीक्षेची स्थिती अपडेट करा",
    "Update status for bin labels": "बिन लेबलची स्थिती अपडेट करा",
    "Update status for checklist": "चेकलिस्टची स्थिती अपडेट करा",
    "Category donut chart": "श्रेणी डोनट चार्ट",
    "Employee navigation": "कर्मचारी नेव्हिगेशन",
    "Record voice suggestion": "व्हॉइस सूचना रेकॉर्ड करा"
  }
};

Object.entries(extraLanguageNames).forEach(([language, names]) => {
  Object.assign(translations[language], names);
});

translations.ta = {
  English: "ஆங்கிலம்",
  Hindi: "இந்தி",
  Marathi: "மராத்தி",
  Tamil: "தமிழ்",
  Telugu: "தெலுங்கு",
  Gujarati: "குஜராத்தி",
  "Language selector": "மொழி தேர்வி",
  "Select language": "மொழியை தேர்ந்தெடுக்கவும்",
  "IFQM Nexus": "ஐஎஃப்க்யூஎம் நெக்சஸ்",
  "IFQM Manager Dashboard": "ஐஎஃப்க்யூஎம் மேலாளர் டாஷ்போர்டு",
  "IFQM Employee Dashboard": "ஐஎஃப்க்யூஎம் ஊழியர் டாஷ்போர்டு",
  "IFQM Nexus Logo": "ஐஎஃப்க்யூஎம் நெக்சஸ் லோகோ",
  "An Industry-Led Movement for Transformation": "மாற்றத்திற்கான தொழில்துறை முன்னெடுப்பு",
  "Primary navigation": "முதன்மை வழிசெலுத்தல்",
  "Industrial improvement intelligence": "தொழில்துறை மேம்பாட்டு நுண்ணறிவு",
  "Intelligent Quality & Improvement Management Platform": "நுண்ணறிவு தரம் மற்றும் மேம்பாட்டு மேலாண்மை தளம்",
  "Capture employee ideas, review critical risks, and manage Kaizen improvements with a calm enterprise dashboard built for factory teams.": "ஊழியர்களின் யோசனைகளை பதிவு செய்து, முக்கிய அபாயங்களை மதிப்பாய்வு செய்து, தொழிற்சாலை அணிகளுக்காக உருவாக்கப்பட்ட அமைதியான நிறுவன டாஷ்போர்டில் கைசன் மேம்பாடுகளை நிர்வகிக்கவும்.",
  "Choose login type": "உள்நுழைவு வகையை தேர்ந்தெடுக்கவும்",
  "Login as Manager": "மேலாளராக உள்நுழைக",
  "Login as Employee": "ஊழியராக உள்நுழைக",
  "Create Employee Account": "பணியாளர் கணக்கை உருவாக்கவும்",
  "Employee ID": "பணியாளர் ஐடி",
  "Employee Name": "பணியாளர் பெயர்",
  Password: "கடவுச்சொல்",
  "Confirm Password": "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
  "Enter Employee ID": "பணியாளர் ஐடியை உள்ளிடவும்",
  "Enter Employee Name": "பணியாளர் பெயரை உள்ளிடவும்",
  "Enter Password": "கடவுச்சொல்லை உள்ளிடவும்",
  "Create Account": "கணக்கை உருவாக்கவும்",
  Cancel: "ரத்து செய்",
  "Manager navigation": "மேலாளர் வழிசெலுத்தல்",
  "Manager Console": "மேலாளர் கன்சோல்",
  Overview: "மேலோட்டம்",
  Critical: "முக்கியம்",
  Suggestions: "பரிந்துரைகள்",
  Analytics: "பகுப்பாய்வு",
  Back: "திரும்பு",
  "Factory Intelligence Command Center": "தொழிற்சாலை நுண்ணறிவு கட்டளை மையம்",
  "Manager dashboard": "மேலாளர் டாஷ்போர்டு",
  "Live operational status": "நேரடி செயல்பாட்டு நிலை",
  "System Status": "கணினி நிலை",
  Active: "செயலில்",
  "Today's Suggestions": "இன்றைய பரிந்துரைகள்",
  "Pending Reviews": "நிலுவை மதிப்பாய்வுகள்",
  "Critical Issues": "முக்கிய சிக்கல்கள்",
  "Key metrics": "முக்கிய அளவுகள்",
  "Total Suggestions": "மொத்த பரிந்துரைகள்",
  "+18 this week": "இந்த வாரம் +18",
  "Pending Review": "நிலுவை மதிப்பாய்வு",
  "12 high attention": "12 அதிக கவனம்",
  Implemented: "செயல்படுத்தப்பட்டது",
  "38% closure rate": "38% நிறைவு விகிதம்",
  "Safety Issues": "பாதுகாப்பு சிக்கல்கள்",
  "5 critical": "5 முக்கியம்",
  "Suggestion filters": "பரிந்துரை வடிகட்டிகள்",
  Search: "தேடல்",
  "Search suggestions": "பரிந்துரைகளை தேடவும்",
  Category: "வகை",
  "All Categories": "அனைத்து வகைகள்",
  Safety: "பாதுகாப்பு",
  Quality: "தரம்",
  Productivity: "உற்பத்தித்திறன்",
  "Cost Saving": "செலவு சேமிப்பு",
  Maintenance: "பராமரிப்பு",
  "General Improvement": "பொது மேம்பாடு",
  Priority: "முன்னுரிமை",
  "All Priorities": "அனைத்து முன்னுரிமைகள்",
  High: "உயர்",
  Medium: "நடுத்தரம்",
  Low: "குறைந்த",
  Status: "நிலை",
  "All Statuses": "அனைத்து நிலைகள்",
  Pending: "நிலுவை",
  "In Review": "மதிப்பாய்வில்",
  Approved: "அங்கீகரிக்கப்பட்டது",
  Rejected: "நிராகரிக்கப்பட்டது",
  "Date Range": "தேதி வரம்பு",
  "Suggestions queue": "பரிந்துரை வரிசை",
  "Prioritized items from employee submissions.": "ஊழியர் சமர்ப்பிப்புகளில் இருந்து முன்னுரிமை பெற்ற உருப்படிகள்.",
  "Export Report": "அறிக்கையை ஏற்றுமதி செய்",
  Suggestion: "பரிந்துரை",
  Timestamp: "நேரமுத்திரை",
  "Update status for oil leakage": "எண்ணெய் கசிவின் நிலையை புதுப்பிக்கவும்",
  "Workers spend too much time waiting for tools": "கருவிகளுக்காக காத்திருப்பதில் தொழிலாளர்கள் அதிக நேரம் செலவிடுகின்றனர்",
  "Update status for tool waiting": "கருவி காத்திருப்பு நிலையை புதுப்பிக்கவும்",
  "Mark material bins with clearer labels": "பொருள் பெட்டிகளில் தெளிவான லேபிள்களை ஒட்டவும்",
  "Update status for bin labels": "பெட்டி லேபிள் நிலையை புதுப்பிக்கவும்",
  "Maintenance checklist is missing compressor inspection": "பராமரிப்பு சரிபார்ப்பு பட்டியலில் கம்ப்ரெசர் ஆய்வு இல்லை",
  "Update status for checklist": "சரிபார்ப்பு பட்டியல் நிலையை புதுப்பிக்கவும்",
  "Critical Suggestions": "முக்கிய பரிந்துரைகள்",
  "Highest priority items needing action.": "நடவடிக்கை தேவைப்படும் மிக உயர்ந்த முன்னுரிமை உருப்படிகள்.",
  "Safety risk - immediate containment required": "பாதுகாப்பு அபாயம் - உடனடி கட்டுப்பாடு தேவை",
  "Exposed electrical wiring": "வெளிப்பட்ட மின் வயரிங்",
  "Maintenance team assigned": "பராமரிப்பு அணி நியமிக்கப்பட்டது",
  "Unsafe forklift route": "பாதுகாப்பற்ற ஃபோர்க்லிஃப்ட் பாதை",
  "Route audit pending approval": "பாதை ஆய்வு அங்கீகாரம் நிலுவையில்",
  "Category distribution": "வகை பகிர்வு",
  "Category donut chart": "வகை டோனட் விளக்கப்படம்",
  "Improvement opportunities by theme.": "தீமின்படி மேம்பாட்டு வாய்ப்புகள்.",
  "Safety 32%": "பாதுகாப்பு 32%",
  "Quality 24%": "தரம் 24%",
  "Productivity 21%": "உற்பத்தித்திறன் 21%",
  "Cost Saving 13%": "செலவு சேமிப்பு 13%",
  "Maintenance 10%": "பராமரிப்பு 10%",
  "Priority distribution": "முன்னுரிமை பகிர்வு",
  "Risk and action urgency across open items.": "திறந்த உருப்படிகளில் அபாயம் மற்றும் நடவடிக்கை அவசரம்.",
  "Employee navigation": "ஊழியர் வழிசெலுத்தல்",
  "Employee Console": "ஊழியர் கன்சோல்",
  Submit: "சமர்ப்பி",
  "My Suggestions": "என் பரிந்துரைகள்",
  "Employee improvement workflow": "ஊழியர் மேம்பாட்டு பணிச்சூழல்",
  "Submit a Kaizen suggestion": "கைசன் பரிந்துரையை சமர்ப்பிக்கவும்",
  "Record Voice Suggestion": "குரல் பரிந்துரையை பதிவு செய்",
  "Capture an improvement idea from the shop floor.": "ஷாப் ஃப்ளோரிலிருந்து மேம்பாட்டு யோசனையை பதிவு செய்.",
  "Record voice suggestion": "குரல் பரிந்துரையை பதிவு செய்",
  "Recognized Text": "அடையாளம் காணப்பட்ட உரை",
  "Machine number 4 has oil leakage near the operator path.": "இயந்திரம் எண் 4 இல் இயக்குநர் பாதை அருகே எண்ணெய் கசிவு உள்ளது.",
  "Listening for a voice suggestion...": "குரல் பரிந்துரையை கேட்கிறது...",
  "Translated Text": "மொழிபெயர்க்கப்பட்ட உரை",
  "AI Analysis": "ஏஐ பகுப்பாய்வு",
  "Submit Suggestion": "பரிந்துரையை சமர்ப்பி",
  "Recent submissions and their current status.": "சமீபத்திய சமர்ப்பிப்புகள் மற்றும் அவற்றின் தற்போதைய நிலை.",
  Date: "தேதி",
  "11 Jun": "11 ஜூன்",
  "10 Jun": "10 ஜூன்",
  "11 Jun, 10:40 AM": "11 ஜூன், 10:40 AM",
  "11 Jun, 09:15 AM": "11 ஜூன், 09:15 AM",
  "10 Jun, 04:25 PM": "10 ஜூன், 04:25 PM",
  "10 Jun, 12:10 PM": "10 ஜூன், 12:10 PM"
};

translations.te = {
  English: "ఆంగ్లం",
  Hindi: "హిందీ",
  Marathi: "మరాఠీ",
  Tamil: "తమిళం",
  Telugu: "తెలుగు",
  Gujarati: "గుజరాతీ",
  "Language selector": "భాష ఎంపిక",
  "Select language": "భాషను ఎంచుకోండి",
  "IFQM Nexus": "ఐఎఫ్‌క్యూఎం నెక్సస్",
  "IFQM Manager Dashboard": "ఐఎఫ్‌క్యూఎం మేనేజర్ డాష్‌బోర్డ్",
  "IFQM Employee Dashboard": "ఐఎఫ్‌క్యూఎం ఉద్యోగి డాష్‌బోర్డ్",
  "IFQM Nexus Logo": "ఐఎఫ్‌క్యూఎం నెక్సస్ లోగో",
  "An Industry-Led Movement for Transformation": "మార్పు కోసం పరిశ్రమ ఆధ్వర్యంలోని ఉద్యమం",
  "Primary navigation": "ప్రాథమిక నావిగేషన్",
  "Industrial improvement intelligence": "పారిశ్రామిక మెరుగుదల మేధస్సు",
  "Intelligent Quality & Improvement Management Platform": "మేధో నాణ్యత మరియు మెరుగుదల నిర్వహణ వేదిక",
  "Capture employee ideas, review critical risks, and manage Kaizen improvements with a calm enterprise dashboard built for factory teams.": "ఉద్యోగుల ఆలోచనలను నమోదు చేసి, కీలక ప్రమాదాలను సమీక్షించి, ఫ్యాక్టరీ బృందాల కోసం రూపొందించిన ప్రశాంతమైన ఎంటర్‌ప్రైజ్ డాష్‌బోర్డ్‌తో కైజెన్ మెరుగుదలలను నిర్వహించండి.",
  "Choose login type": "లాగిన్ రకాన్ని ఎంచుకోండి",
  "Login as Manager": "మేనేజర్‌గా లాగిన్ అవ్వండి",
  "Login as Employee": "ఉద్యోగిగా లాగిన్ అవ్వండి",
  "Create Employee Account": "ఉద్యోగి ఖాతాను సృష్టించండి",
  "Employee ID": "ఉద్యోగి ఐడి",
  "Employee Name": "ఉద్యోగి పేరు",
  Password: "పాస్‌వర్డ్",
  "Confirm Password": "పాస్‌వర్డ్‌ను నిర్ధారించండి",
  "Enter Employee ID": "ఉద్యోగి ఐడిని నమోదు చేయండి",
  "Enter Employee Name": "ఉద్యోగి పేరును నమోదు చేయండి",
  "Enter Password": "పాస్‌వర్డ్‌ను నమోదు చేయండి",
  "Create Account": "ఖాతాను సృష్టించండి",
  Cancel: "రద్దు చేయి",
  "Manager navigation": "మేనేజర్ నావిగేషన్",
  "Manager Console": "మేనేజర్ కన్సోల్",
  Overview: "అవలోకనం",
  Critical: "కీలకం",
  Suggestions: "సూచనలు",
  Analytics: "విశ్లేషణలు",
  Back: "వెనుకకు",
  "Factory Intelligence Command Center": "ఫ్యాక్టరీ ఇంటెలిజెన్స్ కమాండ్ సెంటర్",
  "Manager dashboard": "మేనేజర్ డాష్‌బోర్డ్",
  "Live operational status": "ప్రత్యక్ష ఆపరేషన్ స్థితి",
  "System Status": "సిస్టమ్ స్థితి",
  Active: "సక్రియం",
  "Today's Suggestions": "నేటి సూచనలు",
  "Pending Reviews": "పెండింగ్ సమీక్షలు",
  "Critical Issues": "కీలక సమస్యలు",
  "Key metrics": "ముఖ్య కొలమానాలు",
  "Total Suggestions": "మొత్తం సూచనలు",
  "+18 this week": "ఈ వారం +18",
  "Pending Review": "పెండింగ్ సమీక్ష",
  "12 high attention": "12 అధిక శ్రద్ధ",
  Implemented: "అమలు చేయబడింది",
  "38% closure rate": "38% ముగింపు రేటు",
  "Safety Issues": "భద్రతా సమస్యలు",
  "5 critical": "5 కీలకం",
  "Suggestion filters": "సూచన ఫిల్టర్లు",
  Search: "శోధన",
  "Search suggestions": "సూచనలను శోధించండి",
  Category: "వర్గం",
  "All Categories": "అన్ని వర్గాలు",
  Safety: "భద్రత",
  Quality: "నాణ్యత",
  Productivity: "ఉత్పాదకత",
  "Cost Saving": "ఖర్చు ఆదా",
  Maintenance: "నిర్వహణ",
  "General Improvement": "సాధారణ మెరుగుదల",
  Priority: "ప్రాధాన్యత",
  "All Priorities": "అన్ని ప్రాధాన్యతలు",
  High: "అధిక",
  Medium: "మధ్యస్థ",
  Low: "తక్కువ",
  Status: "స్థితి",
  "All Statuses": "అన్ని స్థితులు",
  Pending: "పెండింగ్",
  "In Review": "సమీక్షలో",
  Approved: "ఆమోదించబడింది",
  Rejected: "తిరస్కరించబడింది",
  "Date Range": "తేదీ పరిధి",
  "Suggestions queue": "సూచనల క్యూతోరణం",
  "Prioritized items from employee submissions.": "ఉద్యోగి సమర్పణల నుండి ప్రాధాన్యత పొందిన అంశాలు.",
  "Export Report": "నివేదికను ఎగుమతి చేయండి",
  Suggestion: "సూచన",
  Timestamp: "సమయ ముద్ర",
  "Update status for oil leakage": "నూనె లీకేజ్ స్థితిని నవీకరించండి",
  "Workers spend too much time waiting for tools": "కార్మికులు సాధనాల కోసం వేచి ఉండటంలో ఎక్కువ సమయం ఖర్చు చేస్తున్నారు",
  "Update status for tool waiting": "సాధనాల వేచి ఉండే స్థితిని నవీకరించండి",
  "Mark material bins with clearer labels": "మెటీరియల్ బిన్‌లపై స్పష్టమైన లేబుళ్లు పెట్టండి",
  "Update status for bin labels": "బిన్ లేబుళ్ల స్థితిని నవీకరించండి",
  "Maintenance checklist is missing compressor inspection": "నిర్వహణ చెక్‌లిస్ట్‌లో కంప్రెసర్ తనిఖీ లేదు",
  "Update status for checklist": "చెక్‌లిస్ట్ స్థితిని నవీకరించండి",
  "Critical Suggestions": "కీలక సూచనలు",
  "Highest priority items needing action.": "చర్య అవసరమైన అత్యధిక ప్రాధాన్యత అంశాలు.",
  "Safety risk - immediate containment required": "భద్రతా ప్రమాదం - తక్షణ నియంత్రణ అవసరం",
  "Exposed electrical wiring": "బయటపడిన విద్యుత్ వైరింగ్",
  "Maintenance team assigned": "నిర్వహణ బృందం నియమించబడింది",
  "Unsafe forklift route": "సురక్షితం కాని ఫోర్క్‌లిఫ్ట్ మార్గం",
  "Route audit pending approval": "మార్గ ఆడిట్ ఆమోదం పెండింగ్‌లో ఉంది",
  "Category distribution": "వర్గ పంపిణీ",
  "Category donut chart": "వర్గ డోనట్ చార్ట్",
  "Improvement opportunities by theme.": "థీమ్ ప్రకారం మెరుగుదల అవకాశాలు.",
  "Safety 32%": "భద్రత 32%",
  "Quality 24%": "నాణ్యత 24%",
  "Productivity 21%": "ఉత్పాదకత 21%",
  "Cost Saving 13%": "ఖర్చు ఆదా 13%",
  "Maintenance 10%": "నిర్వహణ 10%",
  "Priority distribution": "ప్రాధాన్యత పంపిణీ",
  "Risk and action urgency across open items.": "తెరిచి ఉన్న అంశాలలో ప్రమాదం మరియు చర్య అత్యవసరత.",
  "Employee navigation": "ఉద్యోగి నావిగేషన్",
  "Employee Console": "ఉద్యోగి కన్సోల్",
  Submit: "సమర్పించు",
  "My Suggestions": "నా సూచనలు",
  "Employee improvement workflow": "ఉద్యోగి మెరుగుదల వర్క్‌ఫ్లో",
  "Submit a Kaizen suggestion": "కైజెన్ సూచనను సమర్పించండి",
  "Record Voice Suggestion": "వాయిస్ సూచనను రికార్డ్ చేయండి",
  "Capture an improvement idea from the shop floor.": "షాప్ ఫ్లోర్ నుండి మెరుగుదల ఆలోచనను నమోదు చేయండి.",
  "Record voice suggestion": "వాయిస్ సూచనను రికార్డ్ చేయండి",
  "Recognized Text": "గుర్తించిన టెక్స్ట్",
  "Machine number 4 has oil leakage near the operator path.": "మెషిన్ నంబర్ 4 వద్ద ఆపరేటర్ మార్గం దగ్గర నూనె లీకేజ్ ఉంది.",
  "Listening for a voice suggestion...": "వాయిస్ సూచన కోసం వింటోంది...",
  "Translated Text": "అనువదించిన టెక్స్ట్",
  "AI Analysis": "ఏఐ విశ్లేషణ",
  "Submit Suggestion": "సూచనను సమర్పించండి",
  "Recent submissions and their current status.": "ఇటీవలి సమర్పణలు మరియు వాటి ప్రస్తుత స్థితి.",
  Date: "తేదీ",
  "11 Jun": "11 జూన్",
  "10 Jun": "10 జూన్",
  "11 Jun, 10:40 AM": "11 జూన్, 10:40 AM",
  "11 Jun, 09:15 AM": "11 జూన్, 09:15 AM",
  "10 Jun, 04:25 PM": "10 జూన్, 04:25 PM",
  "10 Jun, 12:10 PM": "10 జూన్, 12:10 PM"
};

translations.gu = {
  English: "અંગ્રેજી",
  Hindi: "હિન્દી",
  Marathi: "મરાઠી",
  Tamil: "તમિલ",
  Telugu: "તેલુગુ",
  Gujarati: "ગુજરાતી",
  "Language selector": "ભાષા પસંદગી",
  "Select language": "ભાષા પસંદ કરો",
  "IFQM Nexus": "આઈએફક્યુએમ નેક્સસ",
  "IFQM Manager Dashboard": "આઈએફક્યુએમ મેનેજર ડેશબોર્ડ",
  "IFQM Employee Dashboard": "આઈએફક્યુએમ કર્મચારી ડેશબોર્ડ",
  "IFQM Nexus Logo": "આઈએફક્યુએમ નેક્સસ લોગો",
  "An Industry-Led Movement for Transformation": "પરિવર્તન માટે ઉદ્યોગ-નિર્દેશિત ચળવળ",
  "Primary navigation": "મુખ્ય નેવિગેશન",
  "Industrial improvement intelligence": "ઔદ્યોગિક સુધારણા બુદ્ધિ",
  "Intelligent Quality & Improvement Management Platform": "બુદ્ધિશાળી ગુણવત્તા અને સુધારણા વ્યવસ્થાપન પ્લેટફોર્મ",
  "Capture employee ideas, review critical risks, and manage Kaizen improvements with a calm enterprise dashboard built for factory teams.": "કર્મચારી વિચારો કૅપ્ચર કરો, મહત્વપૂર્ણ જોખમોની સમીક્ષા કરો, અને ફેક્ટરી ટીમો માટે બનાવેલા શાંત એન્ટરપ્રાઇઝ ડેશબોર્ડથી કાઇઝેન સુધારાઓ સંચાલિત કરો.",
  "Choose login type": "લૉગિન પ્રકાર પસંદ કરો",
  "Login as Manager": "મેનેજર તરીકે લૉગિન કરો",
  "Login as Employee": "કર્મચારી તરીકે લૉગિન કરો",
  "Create Employee Account": "કર્મચારી ખાતું બનાવો",
  "Employee ID": "કર્મચારી આઈડી",
  "Employee Name": "કર્મચારી નામ",
  Password: "પાસવર્ડ",
  "Confirm Password": "પાસવર્ડની પુષ્ટિ કરો",
  "Enter Employee ID": "કર્મચારી આઈડી દાખલ કરો",
  "Enter Employee Name": "કર્મચારી નામ દાખલ કરો",
  "Enter Password": "પાસવર્ડ દાખલ કરો",
  "Create Account": "ખાતું બનાવો",
  Cancel: "રદ કરો",
  "Manager navigation": "મેનેજર નેવિગેશન",
  "Manager Console": "મેનેજર કન્સોલ",
  Overview: "ઝાંખી",
  Critical: "મહત્વપૂર્ણ",
  Suggestions: "સૂચનો",
  Analytics: "વિશ્લેષણ",
  Back: "પાછા",
  "Factory Intelligence Command Center": "ફેક્ટરી ઇન્ટેલિજન્સ કમાન્ડ સેન્ટર",
  "Manager dashboard": "મેનેજર ડેશબોર્ડ",
  "Live operational status": "લાઇવ કામગીરી સ્થિતિ",
  "System Status": "સિસ્ટમ સ્થિતિ",
  Active: "સક્રિય",
  "Today's Suggestions": "આજના સૂચનો",
  "Pending Reviews": "બાકી સમીક્ષાઓ",
  "Critical Issues": "મહત્વપૂર્ણ સમસ્યાઓ",
  "Key metrics": "મુખ્ય માપદંડો",
  "Total Suggestions": "કુલ સૂચનો",
  "+18 this week": "આ અઠવાડિયે +18",
  "Pending Review": "બાકી સમીક્ષા",
  "12 high attention": "12 ઉચ્ચ ધ્યાન",
  Implemented: "અમલમાં મૂક્યું",
  "38% closure rate": "38% સમાપ્તિ દર",
  "Safety Issues": "સુરક્ષા સમસ્યાઓ",
  "5 critical": "5 મહત્વપૂર્ણ",
  "Suggestion filters": "સૂચન ફિલ્ટર્સ",
  Search: "શોધ",
  "Search suggestions": "સૂચનો શોધો",
  Category: "શ્રેણી",
  "All Categories": "બધી શ્રેણીઓ",
  Safety: "સુરક્ષા",
  Quality: "ગુણવત્તા",
  Productivity: "ઉત્પાદકતા",
  "Cost Saving": "ખર્ચ બચત",
  Maintenance: "જાળવણી",
  "General Improvement": "સામાન્ય સુધારો",
  Priority: "પ્રાથમિકતા",
  "All Priorities": "બધી પ્રાથમિકતાઓ",
  High: "ઉચ્ચ",
  Medium: "મધ્યમ",
  Low: "નીચું",
  Status: "સ્થિતિ",
  "All Statuses": "બધી સ્થિતિઓ",
  Pending: "બાકી",
  "In Review": "સમીક્ષામાં",
  Approved: "મંજૂર",
  Rejected: "નકાર્યું",
  "Date Range": "તારીખ શ્રેણી",
  "Suggestions queue": "સૂચન કતાર",
  "Prioritized items from employee submissions.": "કર્મચારી સબમિશનમાંથી પ્રાથમિકતા આપેલ વસ્તુઓ.",
  "Export Report": "રિપોર્ટ નિકાસ કરો",
  Suggestion: "સૂચન",
  Timestamp: "સમયમુદ્રા",
  "Update status for oil leakage": "તેલ લીકેજની સ્થિતિ અપડેટ કરો",
  "Workers spend too much time waiting for tools": "કામદારો સાધનો માટે રાહ જોવામાં વધુ સમય ખર્ચે છે",
  "Update status for tool waiting": "સાધન રાહ સ્થિતિ અપડેટ કરો",
  "Mark material bins with clearer labels": "મટિરિયલ બિન્સ પર વધુ સ્પષ્ટ લેબલ લગાવો",
  "Update status for bin labels": "બિન લેબલ સ્થિતિ અપડેટ કરો",
  "Maintenance checklist is missing compressor inspection": "જાળવણી ચેકલિસ્ટમાં કોમ્પ્રેસર નિરીક્ષણ નથી",
  "Update status for checklist": "ચેકલિસ્ટ સ્થિતિ અપડેટ કરો",
  "Critical Suggestions": "મહત્વપૂર્ણ સૂચનો",
  "Highest priority items needing action.": "ક્રિયા જરૂરી હોય તેવી સર્વોચ્ચ પ્રાથમિકતા વસ્તુઓ.",
  "Safety risk - immediate containment required": "સુરક્ષા જોખમ - તાત્કાલિક નિયંત્રણ જરૂરી",
  "Exposed electrical wiring": "ખુલ્લી વિદ્યુત વાયરિંગ",
  "Maintenance team assigned": "જાળવણી ટીમ નિયુક્ત",
  "Unsafe forklift route": "અસુરક્ષિત ફોર્કલિફ્ટ માર્ગ",
  "Route audit pending approval": "માર્ગ ઓડિટ મંજૂરી બાકી",
  "Category distribution": "શ્રેણી વિતરણ",
  "Category donut chart": "શ્રેણી ડોનટ ચાર્ટ",
  "Improvement opportunities by theme.": "થીમ મુજબ સુધારણા તકો.",
  "Safety 32%": "સુરક્ષા 32%",
  "Quality 24%": "ગુણવત્તા 24%",
  "Productivity 21%": "ઉત્પાદકતા 21%",
  "Cost Saving 13%": "ખર્ચ બચત 13%",
  "Maintenance 10%": "જાળવણી 10%",
  "Priority distribution": "પ્રાથમિકતા વિતરણ",
  "Risk and action urgency across open items.": "ખુલ્લી વસ્તુઓમાં જોખમ અને ક્રિયાની તાત્કાલિકતા.",
  "Employee navigation": "કર્મચારી નેવિગેશન",
  "Employee Console": "કર્મચારી કન્સોલ",
  Submit: "સબમિટ",
  "My Suggestions": "મારા સૂચનો",
  "Employee improvement workflow": "કર્મચારી સુધારણા વર્કફ્લો",
  "Submit a Kaizen suggestion": "કાઇઝેન સૂચન સબમિટ કરો",
  "Record Voice Suggestion": "વૉઇસ સૂચન રેકોર્ડ કરો",
  "Capture an improvement idea from the shop floor.": "શોપ ફ્લોર પરથી સુધારણા વિચાર કૅપ્ચર કરો.",
  "Record voice suggestion": "વૉઇસ સૂચન રેકોર્ડ કરો",
  "Recognized Text": "ઓળખાયેલ ટેક્સ્ટ",
  "Machine number 4 has oil leakage near the operator path.": "મશીન નંબર 4 માં ઓપરેટર માર્ગ પાસે તેલ લીકેજ છે.",
  "Listening for a voice suggestion...": "વૉઇસ સૂચન સાંભળી રહ્યું છે...",
  "Translated Text": "અનુવાદિત ટેક્સ્ટ",
  "AI Analysis": "એઆઈ વિશ્લેષણ",
  "Submit Suggestion": "સૂચન સબમિટ કરો",
  "Recent submissions and their current status.": "તાજેતરના સબમિશન અને તેમની વર્તમાન સ્થિતિ.",
  Date: "તારીખ",
  "11 Jun": "11 જૂન",
  "10 Jun": "10 જૂન",
  "11 Jun, 10:40 AM": "11 જૂન, 10:40 AM",
  "11 Jun, 09:15 AM": "11 જૂન, 09:15 AM",
  "10 Jun, 04:25 PM": "10 જૂન, 04:25 PM",
  "10 Jun, 12:10 PM": "10 જૂન, 12:10 PM"
};

const landingUiTranslations = {
  hi: {
    "Company Name": "कंपनी का नाम",
    "COMPANY NAME": "कंपनी का नाम",
    "Enter Company Name": "कंपनी का नाम दर्ज करें",
    Login: "लॉगिन",
    "Secure access": "सुरक्षित पहुंच",
    "Manager access": "मैनेजर पहुंच",
    "Employee access": "कर्मचारी पहुंच",
    "Manager ID": "मैनेजर आईडी",
    "All fields are required": "सभी फ़ील्ड आवश्यक हैं",
    "Passwords do not match": "पासवर्ड मेल नहीं खाते",
    "Please enter a company name": "कृपया कंपनी का नाम दर्ज करें",
    "Account created successfully. Please login.": "खाता सफलतापूर्वक बनाया गया। कृपया लॉगिन करें।",
    "Invalid company, user ID, or password": "कंपनी, यूज़र आईडी या पासवर्ड अमान्य है",
    Welcome: "स्वागत है",
    "Signing in.": "साइन इन हो रहा है।",
    "Creating...": "बनाया जा रहा है...",
    "Loading...": "लोड हो रहा है...",
    "This account is registered as": "यह खाता इस रूप में पंजीकृत है"
  },
  mr: {
    "Company Name": "कंपनीचे नाव",
    "COMPANY NAME": "कंपनीचे नाव",
    "Enter Company Name": "कंपनीचे नाव प्रविष्ट करा",
    Login: "लॉगिन",
    "Secure access": "सुरक्षित प्रवेश",
    "Manager access": "मॅनेजर प्रवेश",
    "Employee access": "कर्मचारी प्रवेश",
    "Manager ID": "मॅनेजर आयडी",
    "All fields are required": "सर्व फील्ड आवश्यक आहेत",
    "Passwords do not match": "पासवर्ड जुळत नाहीत",
    "Please enter a company name": "कृपया कंपनीचे नाव प्रविष्ट करा",
    "Account created successfully. Please login.": "खाते यशस्वीरित्या तयार झाले. कृपया लॉगिन करा.",
    "Invalid company, user ID, or password": "कंपनी, यूजर आयडी किंवा पासवर्ड अमान्य आहे",
    Welcome: "स्वागत आहे",
    "Signing in.": "साइन इन होत आहे.",
    "Creating...": "तयार करत आहे...",
    "Loading...": "लोड होत आहे...",
    "This account is registered as": "हे खाते या भूमिकेत नोंदणीकृत आहे"
  },
  ta: {
    "Company Name": "நிறுவன பெயர்",
    "COMPANY NAME": "நிறுவன பெயர்",
    "Enter Company Name": "நிறுவன பெயரை உள்ளிடவும்",
    Login: "உள்நுழை",
    "Secure access": "பாதுகாப்பான அணுகல்",
    "Manager access": "மேலாளர் அணுகல்",
    "Employee access": "ஊழியர் அணுகல்",
    "Manager ID": "மேலாளர் ஐடி",
    "All fields are required": "அனைத்து புலங்களும் அவசியம்",
    "Passwords do not match": "கடவுச்சொற்கள் பொருந்தவில்லை",
    "Please enter a company name": "நிறுவன பெயரை உள்ளிடவும்",
    "Account created successfully. Please login.": "கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது. தயவுசெய்து உள்நுழைக.",
    "Invalid company, user ID, or password": "நிறுவனம், பயனர் ஐடி அல்லது கடவுச்சொல் தவறானது",
    Welcome: "வரவேற்கிறோம்",
    "Signing in.": "உள்நுழைகிறது.",
    "Creating...": "உருவாக்குகிறது...",
    "Loading...": "ஏற்றுகிறது...",
    "This account is registered as": "இந்த கணக்கு இந்த வகையில் பதிவு செய்யப்பட்டுள்ளது"
  },
  te: {
    "Company Name": "కంపెనీ పేరు",
    "COMPANY NAME": "కంపెనీ పేరు",
    "Enter Company Name": "కంపెనీ పేరును నమోదు చేయండి",
    Login: "లాగిన్",
    "Secure access": "సురక్షిత ప్రవేశం",
    "Manager access": "మేనేజర్ ప్రవేశం",
    "Employee access": "ఉద్యోగి ప్రవేశం",
    "Manager ID": "మేనేజర్ ఐడి",
    "All fields are required": "అన్ని ఫీల్డులు అవసరం",
    "Passwords do not match": "పాస్‌వర్డ్‌లు సరిపోలడం లేదు",
    "Please enter a company name": "దయచేసి కంపెనీ పేరును నమోదు చేయండి",
    "Account created successfully. Please login.": "ఖాతా విజయవంతంగా సృష్టించబడింది. దయచేసి లాగిన్ అవ్వండి.",
    "Invalid company, user ID, or password": "కంపెనీ, యూజర్ ఐడి లేదా పాస్‌వర్డ్ చెల్లదు",
    Welcome: "స్వాగతం",
    "Signing in.": "సైన్ ఇన్ అవుతోంది.",
    "Creating...": "సృష్టిస్తోంది...",
    "Loading...": "లోడ్ అవుతోంది...",
    "This account is registered as": "ఈ ఖాతా ఈ విధంగా నమోదు చేయబడింది"
  },
  gu: {
    "Company Name": "કંપનીનું નામ",
    "COMPANY NAME": "કંપનીનું નામ",
    "Enter Company Name": "કંપનીનું નામ દાખલ કરો",
    Login: "લૉગિન",
    "Secure access": "સુરક્ષિત પ્રવેશ",
    "Manager access": "મેનેજર પ્રવેશ",
    "Employee access": "કર્મચારી પ્રવેશ",
    "Manager ID": "મેનેજર આઈડી",
    "All fields are required": "બધા ફીલ્ડ જરૂરી છે",
    "Passwords do not match": "પાસવર્ડ મેળ ખાતા નથી",
    "Please enter a company name": "કૃપા કરીને કંપનીનું નામ દાખલ કરો",
    "Account created successfully. Please login.": "ખાતું સફળતાપૂર્વક બનાવાયું. કૃપા કરીને લૉગિન કરો.",
    "Invalid company, user ID, or password": "કંપની, યુઝર આઈડી અથવા પાસવર્ડ અમાન્ય છે",
    Welcome: "સ્વાગત છે",
    "Signing in.": "સાઇન ઇન થઈ રહ્યું છે.",
    "Creating...": "બનાવી રહ્યું છે...",
    "Loading...": "લોડ થઈ રહ્યું છે...",
    "This account is registered as": "આ ખાતું આ રીતે નોંધાયેલું છે"
  }
};

Object.entries(landingUiTranslations).forEach(([language, names]) => {
  Object.assign(translations[language], names);
});

const employeeDashboardDynamicTranslations = {
  hi: {
    Approval: "स्वीकृति",
    Submitted: "सबमिट किया गया",
    "Manager Feedback / Rejection Reason": "मैनेजर फीडबैक / अस्वीकृति कारण",
    "Suggestion progress": "सुझाव प्रगति"
  },
  mr: {
    Approval: "मंजुरी",
    Submitted: "सबमिट केले",
    "Manager Feedback / Rejection Reason": "मॅनेजर अभिप्राय / नकाराचे कारण",
    "Suggestion progress": "सूचनेची प्रगती"
  },
  ta: {
    Approval: "அங்கீகாரம்",
    Submitted: "சமர்ப்பிக்கப்பட்டது",
    "Manager Feedback / Rejection Reason": "மேலாளர் கருத்து / நிராகரிப்பு காரணம்",
    "Suggestion progress": "பரிந்துரை முன்னேற்றம்"
  },
  te: {
    Approval: "ఆమోదం",
    Submitted: "సమర్పించబడింది",
    "Manager Feedback / Rejection Reason": "మేనేజర్ అభిప్రాయం / తిరస్కరణ కారణం",
    "Suggestion progress": "సూచన పురోగతి"
  },
  gu: {
    Approval: "મંજૂરી",
    Submitted: "સબમિટ કર્યું",
    "Manager Feedback / Rejection Reason": "મેનેજર પ્રતિસાદ / નકારવાનું કારણ",
    "Suggestion progress": "સૂચન પ્રગતિ"
  }
};

Object.entries(employeeDashboardDynamicTranslations).forEach(([language, names]) => {
  Object.assign(translations[language], names);
});

const textNodes = [];
const translatableAttributes = ["placeholder", "aria-label"];
let currentLanguage = "en";

function normalizeI18nKey(value) {
  return value.replace(/\s+/g, " ").trim();
}

function getDatasetI18nKey(attribute) {
  return `${attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}I18nKey`;
}

function preserveSpacing(original, translated) {
  const leading = original.match(/^\s*/)[0];
  const trailing = original.match(/\s*$/)[0];
  return `${leading}${translated}${trailing}`;
}

function collectTextNodes(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parentName = node.parentElement?.tagName;
      if (["SCRIPT", "STYLE"].includes(parentName)) {
        return NodeFilter.FILTER_REJECT;
      }
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.i18nKey) {
      node.i18nKey = normalizeI18nKey(node.nodeValue);
    }
    if (!textNodes.includes(node)) {
      textNodes.push(node);
    }
  }

  const attributeSelector = translatableAttributes.map((attribute) => `[${attribute}]`).join(",");
  const attributeElements = [
    ...(root.matches?.(attributeSelector) ? [root] : []),
    ...root.querySelectorAll(attributeSelector)
  ];

  attributeElements.forEach((element) => {
    translatableAttributes.forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (value) {
        const datasetKey = getDatasetI18nKey(attribute);
        if (!element.dataset[datasetKey]) {
          element.dataset[datasetKey] = normalizeI18nKey(value);
        }
      }
    });
  });
}

function translateAppText(value, language = currentLanguage) {
  const key = normalizeI18nKey(String(value || ""));
  const dictionary = translations[language] || {};
  return language === "en" ? key : dictionary[key] || key;
}

function applyLanguage(language) {
  const dictionary = translations[language] || {};
  currentLanguage = language;
  document.documentElement.lang = language;

  textNodes.forEach((node) => {
    const translated = language === "en" ? node.i18nKey : dictionary[node.i18nKey];
    if (translated) {
      node.nodeValue = preserveSpacing(node.nodeValue, translated);
    } else {
      node.nodeValue = preserveSpacing(node.nodeValue, node.i18nKey);
    }
  });

  document.querySelectorAll("[placeholder], [aria-label]").forEach((element) => {
    translatableAttributes.forEach((attribute) => {
      const key = element.dataset[getDatasetI18nKey(attribute)];
      if (!key) {
        return;
      }
      element.setAttribute(attribute, language === "en" ? key : dictionary[key] || key);
    });
  });

  try {
    localStorage.setItem("ifqm-language", language);
  } catch (error) {
    // Storage can be unavailable in restricted preview contexts.
  }
}

window.setAppLanguage = (language) => {
  const previousLanguage = currentLanguage;
  applyLanguage(language);
  if (language === previousLanguage) {
    return;
  }
  window.dispatchEvent(new CustomEvent("app-language-changed", {
    detail: { language }
  }));
};

window.translateAppText = translateAppText;
window.getAppLanguage = () => currentLanguage;

window.registerTranslatableContent = (root) => {
  if (!root) {
    return;
  }
  collectTextNodes(root);
  applyLanguage(languageSelect?.value || currentLanguage);
};

function showView(view) {
  landingView.classList.add("is-hidden");
  managerDashboard.classList.add("is-hidden");
  employeeDashboard.classList.add("is-hidden");

  view.classList.remove("is-hidden");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function getOriginalText(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const textNode = walker.nextNode();
  return textNode?.i18nKey || normalizeI18nKey(element.textContent);
}

function getSelectedOptionText(select) {
  const selectedOption = select.selectedOptions[0];
  return selectedOption?.firstChild?.i18nKey || normalizeI18nKey(selectedOption?.textContent || "");
}

function escapePdfText(value) {
  return String(value).replace(/[\\()]/g, "\\$&");
}

function wrapReportLine(line, maxLength = 92) {
  const words = line.split(" ");
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

function createPdfBlob(lines) {
  const pageWidth = 612;
  const pageHeight = 792;
  const marginX = 48;
  const startY = 740;
  const pages = [];

  lines.forEach((line) => {
    wrapReportLine(line).forEach((wrappedLine) => {
      const currentPage = pages[pages.length - 1] || [];
      if (!pages.length || currentPage.length >= 42) {
        pages.push([]);
      }
      pages[pages.length - 1].push(wrappedLine);
    });
  });

  const pageRefs = pages.map((_, index) => `${4 + index * 2} 0 R`);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pageRefs.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  ];

  pages.forEach((pageLines, index) => {
    const pageObjectNumber = 4 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    const content = [
      "BT",
      "/F1 11 Tf",
      "14 TL",
      `${marginX} ${startY} Td`,
      ...pageLines.map((line, lineIndex) => {
        const prefix = lineIndex === 0 ? "" : "T* ";
        return `${prefix}(${escapePdfText(line)}) Tj`;
      }),
      "ET"
    ].join("\n");

    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`);
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function downloadSuggestionsReport() {
  const rows = [...document.querySelectorAll(".suggestion-table .table-row:not(.table-head)")].map((row) => {
    const cells = [...row.querySelectorAll("[role='cell']")];
    const statusSelect = cells[3].querySelector("select");
    return {
      suggestion: getOriginalText(cells[0]),
      category: getOriginalText(cells[1]),
      priority: getOriginalText(cells[2]),
      status: statusSelect ? getSelectedOptionText(statusSelect) : getOriginalText(cells[3]),
      timestamp: getOriginalText(cells[4])
    };
  });

  const lines = [
    "IFQM Nexus - Suggestions Report",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "Suggestion | Category | Priority | Status | Timestamp",
    "------------------------------------------------------",
    ...rows.map((row) => `${row.suggestion} | ${row.category} | ${row.priority} | ${row.status} | ${row.timestamp}`)
  ];

  const url = URL.createObjectURL(createPdfBlob(lines));
  const link = document.createElement("a");
  link.href = url;
  link.download = "kaizen-suggestions-report.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

managerLogin.addEventListener("click", () => showView(managerDashboard));
employeeLogin.addEventListener("click", () => showView(employeeDashboard));

backButtons.forEach((button) => {
  button.addEventListener("click", () => showView(landingView));
});

if (exportReportButton) {
  exportReportButton.addEventListener("click", downloadSuggestionsReport);
}

collectTextNodes();

if (languageSelect) {
  let savedLanguage = "en";
  try {
    savedLanguage = localStorage.getItem("ifqm-language") || "en";
  } catch (error) {
    savedLanguage = "en";
  }
  languageSelect.value = savedLanguage;
  applyLanguage(savedLanguage);

  languageSelect.addEventListener("change", (event) => {
    window.setAppLanguage(event.target.value);
  });
  languageSelect.addEventListener("input", (event) => {
    window.setAppLanguage(event.target.value);
  });
}

const signupBtn =
    document.getElementById("signupBtn");

const signupModal =
    document.getElementById("signupModal");

const cancelSignupBtn =
    document.getElementById("cancelSignupBtn");

signupBtn.addEventListener("click", () => {
    signupModal.classList.remove("hidden");
});

cancelSignupBtn.addEventListener("click", () => {
    signupModal.classList.add("hidden");
});
