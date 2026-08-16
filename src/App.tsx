/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sprout, 
  Camera, 
  Search, 
  Leaf, 
  Bug, 
  Droplets, 
  ThermometerSun, 
  Loader2,
  ChevronRight,
  Info,
  LogOut,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  Phone,
  Smartphone,
  User as UserIcon,
  Settings,
  RefreshCw,
  X,
  Save,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  BarChart3,
  Calendar,
  CheckCircle2,
  Wind,
  CloudRain,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
import axios from 'axios';
import { diagnoseCrop, getMarketRates, MarketRateData, CropDiagnosisData } from './services/geminiService';
import { countries, statesByCountry, districtsByState, talukasByDistrict } from './data/locations';
import ReactMarkdown from 'react-markdown';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth } from './firebase';
import { translations, Language } from './translations';

// Map Modal Component
function MapModal({ latitude, longitude, setLatitude, setLongitude, setShowMap, t }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-lg"
      >
        <div className="p-6 border-b border-earth-100 flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-forest-900">{t.selectLocation || 'Select Location'}</h3>
          <button onClick={() => setShowMap(false)} className="p-2 hover:bg-earth-50 rounded-full transition-colors">
            <X className="w-6 h-6 text-earth-400" />
          </button>
        </div>
        <div className="h-[400px] w-full relative flex items-center justify-center bg-earth-50">
          <MapContainer 
            center={[latitude || 20.5937, longitude || 78.9629]} 
            zoom={latitude ? 15 : 5} 
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker latitude={latitude} longitude={longitude} setLatitude={setLatitude} setLongitude={setLongitude} />
          </MapContainer>
        </div>
        <div className="p-6 bg-earth-50 flex justify-end">
          <button 
            onClick={() => setShowMap(false)}
            className="bg-forest-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-forest-600/20 hover:bg-forest-700 active:scale-95 transition-all"
          >
            {t.confirmLocation || 'Confirm Location'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function LocationMarker({ latitude, longitude, setLatitude, setLongitude }: any) {
  useMapEvents({
    click(e) {
      setLatitude(e.latlng.lat);
      setLongitude(e.latlng.lng);
    },
  });

  return latitude && longitude ? (
    <Marker position={[latitude, longitude]} />
  ) : null;
}

// Main Dashboard Component
function Onboarding({ onComplete, language }: { onComplete: () => void, language: Language }) {
  const t = translations[language];
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: t.onboardingDiagnoseTitle || "Diagnose Crop",
      description: t.onboardingDiagnoseDesc || "Take a photo of your crop to instantly identify diseases and get treatment recommendations.",
      icon: <Camera className="w-12 h-12 text-forest-500" />
    },
    {
      title: t.onboardingMarketTitle || "Market Rates",
      description: t.onboardingMarketDesc || "Check live market prices for your crops across different mandis to get the best value.",
      icon: <Search className="w-12 h-12 text-forest-500" />
    },
    {
      title: t.onboardingProfileTitle || "Profile & Farm",
      description: t.onboardingProfileDesc || "Update your profile and farm details to get personalized advice and weather updates.",
      icon: <UserIcon className="w-12 h-12 text-forest-500" />
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-earth-100">
          <div 
            className="h-full bg-forest-500 transition-all duration-300" 
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
        
        <div className="flex flex-col items-center text-center mt-4">
          <div className="bg-forest-50 p-4 rounded-full mb-6">
            {steps[step].icon}
          </div>
          <h2 className="text-2xl font-bold text-forest-900 mb-4">{steps[step].title}</h2>
          <p className="text-earth-600 mb-8">{steps[step].description}</p>
          
          <div className="flex w-full gap-3">
            {step > 0 && (
              <button 
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-3 rounded-xl font-bold text-forest-600 bg-forest-50 hover:bg-forest-100 transition-colors"
              >
                {t.onboardingBack || "Back"}
              </button>
            )}
            <button 
              onClick={() => {
                if (step === steps.length - 1) {
                  onComplete();
                } else {
                  setStep(s => s + 1);
                }
              }}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-forest-600 hover:bg-forest-700 transition-colors"
            >
              {step === steps.length - 1 ? (t.onboardingStart || "Get Started") : (t.onboardingNext || "Next")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Dashboard({ user, language, setLanguage, onLogout, onUpdateUser }: { 
  user: { uid: string, displayName?: string, email?: string, phoneNumber?: string }, 
  language: Language, 
  setLanguage: (lang: Language) => void,
  onLogout: () => void,
  onUpdateUser: (data: any) => void
}) {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'diagnose' | 'market' | 'profile' | 'farm'>('diagnose');
  const [selectedCrop, setSelectedCrop] = useState('General');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketRateData[] | null>(null);
  const [diagnosisData, setDiagnosisData] = useState<CropDiagnosisData | null>(null);
  const [cropSearch, setCropSearch] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [taluka, setTaluka] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [profileName, setProfileName] = useState(user.displayName || '');
  const [profileFarmerId, setProfileFarmerId] = useState('');
  const [profileDob, setProfileDob] = useState('');
  const [profileGender, setProfileGender] = useState('male');
  const [profilePhone, setProfilePhone] = useState(user.phoneNumber || '');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [farmLocation, setFarmLocation] = useState('');
  const [farmArea, setFarmArea] = useState('');
  const [farmUnit, setFarmUnit] = useState('acre');
  const [chemicalUsage, setChemicalUsage] = useState('');
  const [regularCrops, setRegularCrops] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [weatherData, setWeatherData] = useState<{ temp: number, humidity: number, description: string } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<{id: string, date: string, stage: string, cropName: string, notes: string}[]>([]);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(`onboarding_${user.uid}`);
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [user.uid]);

  const completeOnboarding = () => {
    localStorage.setItem(`onboarding_${user.uid}`, 'true');
    setShowOnboarding(false);
  };

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`);
      
      const weatherCode = response.data.current.weather_code;
      let description = 'Clear';
      if (weatherCode >= 1 && weatherCode <= 3) description = 'Cloudy';
      else if (weatherCode >= 45 && weatherCode <= 48) description = 'Fog';
      else if (weatherCode >= 51 && weatherCode <= 67) description = 'Rain';
      else if (weatherCode >= 71 && weatherCode <= 86) description = 'Snow';
      else if (weatherCode >= 95) description = 'Thunderstorm';

      setWeatherData({
        temp: response.data.current.temperature_2m,
        humidity: response.data.current.relative_humidity_2m,
        description
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      fetchWeather(latitude, longitude);
    }
  }, [latitude, longitude, fetchWeather]);

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    const savedProfile = localStorage.getItem(`profile_${user.uid}`);
    if (savedProfile) {
      const data = JSON.parse(savedProfile);
      setProfileName(data.displayName || '');
      setProfileFarmerId(data.farmerId || '');
      setProfileDob(data.dob || '');
      setProfileGender(data.gender || 'male');
      setProfilePhone(data.phoneNumber || '');
      setProfilePhoto(data.photo || null);
      setFarmLocation(data.farmLocation || '');
      setFarmArea(data.farmArea || '');
      setFarmUnit(data.farmUnit || 'acre');
      setChemicalUsage(data.chemicalUsage || '');
      setRegularCrops(data.regularCrops || '');
      setLatitude(data.latitude || null);
      setLongitude(data.longitude || null);
      setTimelineEvents(data.timelineEvents || []);
    }
  }, [user.uid]);

  const addTimelineEvent = () => {
    setTimelineEvents([{ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], stage: 'sowing', cropName: '', notes: '' }, ...timelineEvents]);
  };

  const updateTimelineEvent = (id: string, field: string, value: string) => {
    setTimelineEvents(timelineEvents.map(evt => evt.id === id ? { ...evt, [field]: value } : evt));
  };

  const removeTimelineEvent = (id: string) => {
    setTimelineEvents(timelineEvents.filter(evt => evt.id !== id));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    if (!/^\d{12}$/.test(profileFarmerId)) {
      setProfileMessage({ type: 'error', text: t.invalidFarmerId });
      return;
    }

    setProfileLoading(true);
    try {
      const profileData = {
        displayName: profileName,
        email: user.email,
        phoneNumber: profilePhone,
        farmerId: profileFarmerId,
        dob: profileDob,
        gender: profileGender,
        photo: profilePhoto,
        farmLocation,
        farmArea,
        farmUnit,
        chemicalUsage,
        regularCrops,
        latitude,
        longitude,
        timelineEvents,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`profile_${user.uid}`, JSON.stringify(profileData));
      onUpdateUser({ displayName: profileName, phoneNumber: profilePhone });
      setProfileMessage({ type: 'success', text: t.profileUpdated });
    } catch (err) {
      console.error("Error updating profile:", err);
      setProfileMessage({ type: 'error', text: "Failed to update profile. Please try again." });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateFarmerId = () => {
    const id = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    setProfileFarmerId(id);
  };

  const crops = [
    { id: 'General', label: t.general },
    { id: 'Tomato', label: t.tomato },
    { id: 'Potato', label: t.potato },
    { id: 'Rice', label: t.rice },
    { id: 'Wheat', label: t.wheat },
    { id: 'Corn', label: t.corn },
    { id: 'Cotton', label: t.cotton },
    { id: 'Grapes', label: t.grapes },
    { id: 'Apple', label: t.apple }
  ];

  const resizeImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width === 0 || height === 0) {
          resolve(dataUrl);
          return;
        }

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => {
        resolve(dataUrl);
      };
      img.src = dataUrl;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (reader.result) {
          const resized = await resizeImage(reader.result as string);
          setImage(resized);
          setResult(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera is not supported in this browser.");
      return;
    }
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      
      // Wait for the video element to be mounted
      let retries = 0;
      const assignStream = () => {
        if (!streamRef.current) return; // Camera was stopped
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        } else if (retries < 20) {
          retries++;
          setTimeout(assignStream, 50);
        } else {
          console.error("Video element not found");
          setCameraError("Camera initialization failed.");
          setShowCamera(false);
        }
      };
      assignStream();
      
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.message === 'Permission denied' || err.message === 'Permission dismissed') {
        setCameraError("Camera access was denied. Please allow camera access in your browser settings and try again.");
      } else {
        setCameraError("Camera access unavailable. Please upload an image instead.");
      }
      setShowCamera(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        let width = videoRef.current.videoWidth;
        let height = videoRef.current.videoHeight;

        if (width === 0 || height === 0) {
          console.warn("Video not ready yet");
          // Maybe show a toast or message to the user?
          // For now, let's just try to wait a bit or inform the user.
          // Since I don't have a toast component, I'll just set an error.
          setCameraError("Camera is still initializing. Please wait a moment.");
          return;
        }

        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvasRef.current.width = width;
        canvasRef.current.height = height;
        context.drawImage(videoRef.current, 0, 0, width, height);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        
        if (dataUrl && dataUrl !== 'data:,') {
          setCameraError(null);
          setImage(dataUrl);
          stopCamera();
        } else {
          console.warn("Failed to capture image");
        }
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setIsScanning(false);
    setScanProgress(0);
  };

  useEffect(() => {
    if (showCamera) {
      stopCamera();
    }
  }, [activeTab]);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const duration = 5000; // 5 seconds scan
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          captureImage();
          return 100;
        }
        return prev + step;
      });
    }, interval);
  };

  const handleDiagnose = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);
    setDiagnosisData(null);
    try {
      const diagnosis = await diagnoseCrop(image, selectedCrop, language);
      setDiagnosisData(diagnosis);
    } catch (err) {
      console.error(err);
      setResult("Error diagnosing crop. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarketRates = async () => {
    if (!cropSearch.trim()) return;
    setLoading(true);
    setResult(null);
    setMarketData(null);
    try {
      const rates = await getMarketRates(cropSearch, { country, state, district, taluka }, language);
      setMarketData(rates);
    } catch (err) {
      console.error(err);
      setResult("Error fetching market rates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className="flex min-h-screen bg-earth-50 font-sans selection:bg-forest-200 pb-24 lg:pb-0">
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding onComplete={completeOnboarding} language={language} />
        )}
      </AnimatePresence>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-earth-100 sticky top-0 h-screen z-50">
        <div className="p-6 md:p-8 flex items-center gap-3">
          <div className="bg-forest-600 p-2.5 rounded-2xl shadow-md shadow-forest-900/20">
            <Sprout className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-forest-900 leading-tight">{t.appName}</h1>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {(['diagnose', 'farm', 'market', 'profile'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setResult(null); setImage(null); }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl text-sm font-bold transition-all duration-300 group ${
                activeTab === tab 
                  ? 'bg-forest-600 text-white shadow-md shadow-forest-600/20' 
                  : 'text-earth-400 hover:text-forest-600 hover:bg-forest-50'
              }`}
            >
              {tab === 'diagnose' && <Camera className={`w-5 h-5 ${activeTab === tab ? 'text-white' : 'text-earth-300 group-hover:text-forest-600'}`} />}
              {tab === 'farm' && <Sprout className={`w-5 h-5 ${activeTab === tab ? 'text-white' : 'text-earth-300 group-hover:text-forest-600'}`} />}
              {tab === 'market' && <Search className={`w-5 h-5 ${activeTab === tab ? 'text-white' : 'text-earth-300 group-hover:text-forest-600'}`} />}
              {tab === 'profile' && <UserIcon className={`w-5 h-5 ${activeTab === tab ? 'text-white' : 'text-earth-300 group-hover:text-forest-600'}`} />}
              <span className="uppercase tracking-wider text-[10px]">
                {tab === 'diagnose' ? t.checkCrop : 
                 tab === 'farm' ? t.farm :
                 tab === 'market' ? t.marketRates :
                 t.profile}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-earth-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-xl text-earth-400 hover:text-red-500 hover:bg-red-50 transition-all duration-300 font-bold"
          >
            <LogOut className="w-5 h-5" />
            <span className="uppercase tracking-wider text-[10px]">{t.logout}</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/60 backdrop-blur-xl border-b border-earth-100 px-6 py-4 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="lg:hidden flex items-center gap-3">
              <div className="bg-forest-600 p-2 rounded-xl">
                <Sprout className="text-white w-5 h-5" />
              </div>
              <h1 className="text-lg font-display font-bold text-forest-900">{t.appName}</h1>
            </div>

            <div className="hidden lg:block">
              <h2 className="text-sm font-bold text-earth-400 uppercase tracking-[0.2em]">
                {activeTab === 'diagnose' ? t.checkCrop : 
                 activeTab === 'farm' ? t.farm :
                 activeTab === 'market' ? t.marketRates :
                 t.profile}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {weatherData && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="hidden md:flex items-center gap-4 bg-sun-50/50 border border-sun-100 px-4 py-2 rounded-2xl shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <ThermometerSun className="w-4 h-4 text-sun-600" />
                    <span className="text-xs font-bold text-sun-900">{weatherData.temp.toFixed(1)}°C</span>
                  </div>
                  <div className="w-px h-4 bg-sun-200" />
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-blue-900">{weatherData.humidity}%</span>
                  </div>
                  <div className="w-px h-4 bg-sun-200" />
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-earth-400" />
                    <span className="text-[10px] font-bold text-earth-600 uppercase tracking-wider">{weatherData.description}</span>
                  </div>
                </motion.div>
              )}
              
              <div className="flex bg-earth-100 p-1 rounded-2xl border border-earth-100">
                {(['en', 'hi', 'mr'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                      language === lang 
                        ? 'bg-white text-forest-700 shadow-sm' 
                        : 'text-earth-400 hover:text-earth-600'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-earth-100">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-forest-900 uppercase tracking-wider">{user.displayName || 'Farmer'}</p>
                  <p className="text-[8px] text-earth-400 font-medium uppercase tracking-wider">{t.premiumMember}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-earth-100 flex items-center justify-center border border-earth-200">
                  <UserIcon className="w-5 h-5 text-earth-400" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 pb-32 lg:pb-10">
          <AnimatePresence mode="wait">
          {activeTab === 'diagnose' && (
            <motion.div
              key="diagnose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Upload & Controls */}
              <div className="lg:col-span-5 space-y-6">
                <section className="bg-white rounded-2xl p-6 md:p-10 shadow-md border border-earth-200">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-forest-50 p-3 rounded-2xl">
                      <Camera className="w-6 h-6 text-forest-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-forest-900 leading-tight">{t.checkCrop}</h2>
                      <p className="text-[10px] font-bold text-earth-400 uppercase tracking-wider mt-1">{t.aiPoweredAnalysis}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-[10px] font-bold uppercase text-earth-400 tracking-wider">{t.selectCrop}</label>
                    <div className="flex flex-wrap gap-2">
                      {crops.map(crop => (
                        <button
                          key={crop.id}
                          onClick={() => setSelectedCrop(crop.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 ${
                            selectedCrop === crop.id
                              ? 'bg-forest-600 text-white shadow-lg shadow-forest-600/20'
                              : 'bg-earth-50 text-earth-600 hover:bg-earth-100'
                          }`}
                        >
                          {crop.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                    <div 
                      className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center ${
                        image ? 'border-forest-500 bg-forest-50' : 'border-earth-200 bg-earth-50 hover:bg-earth-100'
                      }`}
                    >
                      {image ? (
                        <>
                          <img src={image} alt="Crop" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button 
                            onClick={() => setImage(null)}
                            className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2.5 rounded-2xl shadow-lg hover:bg-white transition-all text-red-500"
                          >
                            <Bug className="w-5 h-5" />
                          </button>
                        </>
                      ) : showCamera ? (
                        <div className="w-full h-full relative">
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                          
                          {isScanning && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
                              <div className="relative w-48 h-48 flex items-center justify-center">
                                {/* Scanning Circle */}
                                <svg className="w-full h-full -rotate-90">
                                  <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.2)"
                                    strokeWidth="8"
                                  />
                                  <motion.circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="8"
                                    strokeDasharray="553"
                                    initial={{ strokeDashoffset: 553 }}
                                    animate={{ strokeDashoffset: 553 - (553 * scanProgress) / 100 }}
                                    transition={{ duration: 0.1 }}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                  <span className="text-3xl font-bold font-display">{Math.round(scanProgress)}%</span>
                                  <span className="text-xs font-semibold text-earth-500 opacity-80">{t.scanningInProgress}</span>
                                </div>
                                
                                {/* Scanning Line Animation */}
                                <motion.div 
                                  className="absolute left-0 right-0 h-1 bg-forest-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-10"
                                  animate={{ top: ['10%', '90%', '10%'] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                />
                              </div>
                              <p className="mt-6 text-white font-bold text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-earth-200/10">
                                {t.rotateCrop}
                              </p>
                            </div>
                          )}

                          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                            {!isScanning ? (
                              <>
                                <button 
                                  onClick={startScan} 
                                  className="bg-forest-600 text-white px-6 py-4 rounded-2xl shadow-md shadow-forest-600/40 active:scale-95 transition-all flex items-center gap-2 font-bold"
                                >
                                  <RefreshCw className="w-5 h-5" /> {t.startScanning}
                                </button>
                                <button onClick={captureImage} className="bg-white/90 backdrop-blur text-forest-600 p-4 rounded-2xl shadow-md active:scale-95 transition-all">
                                  <Camera className="w-6 h-6" />
                                </button>
                              </>
                            ) : (
                              <button onClick={stopCamera} className="bg-white/90 backdrop-blur text-red-500 p-4 rounded-2xl shadow-md active:scale-95 transition-all">
                                <X className="w-6 h-6" />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-6 md:p-8">
                          <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-earth-100">
                            <Camera className="text-earth-300 w-10 h-10" />
                          </div>
                          <p className="text-earth-900 font-bold text-lg">{t.takePhoto}</p>
                          <p className="text-earth-400 text-sm mt-2 max-w-[200px] mx-auto leading-relaxed">{t.ensureLighting}</p>
                          {cameraError && (
                            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 max-w-[250px] mx-auto">
                              {cameraError}
                            </div>
                          )}
                          <div className="flex flex-col gap-3 mt-8">
                            <button 
                              onClick={startCamera}
                              className="bg-forest-600 text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-forest-600/20 hover:bg-forest-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                              <Camera className="w-5 h-5" /> {t.useCamera}
                            </button>
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-earth-100 text-earth-700 px-8 py-4 rounded-2xl text-sm font-bold hover:bg-earth-200 active:scale-95 transition-all"
                            >
                              {t.uploadFile}
                            </button>
                          </div>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    disabled={!image || loading}
                    onClick={handleDiagnose}
                    className="w-full mt-8 bg-forest-600 text-white py-5 rounded-2xl font-bold text-lg shadow-md shadow-forest-600/30 hover:bg-forest-700 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                    {loading ? t.analyzingCrop : t.checkCrop}
                  </button>
                </section>

                {/* Quick Tips */}
                <section className="bg-forest-900 text-white rounded-xl p-6 md:p-8 shadow-md shadow-forest-950/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-forest-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                  <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                    <Info className="w-5 h-5 text-sun-400" />
                    {t.proTips}
                  </h3>
                  <ul className="space-y-4 relative z-10">
                    <li className="flex gap-4">
                      <div className="bg-white/10 p-2 rounded-xl h-fit"><Leaf className="w-4 h-4 text-sun-300" /></div>
                      <p className="text-forest-100 text-sm leading-relaxed">{t.tip1}</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="bg-white/10 p-2 rounded-xl h-fit"><Bug className="w-4 h-4 text-sun-300" /></div>
                      <p className="text-forest-100 text-sm leading-relaxed">{t.tip2}</p>
                    </li>
                    <li className="flex gap-4">
                      <div className="bg-white/10 p-2 rounded-xl h-fit"><Droplets className="w-4 h-4 text-sun-300" /></div>
                      <p className="text-forest-100 text-sm leading-relaxed">{t.tip3}</p>
                    </li>
                  </ul>
                </section>
              </div>

              {/* Right Column: Results */}
              <div className="lg:col-span-7 space-y-6">
                <section className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-earth-200 min-h-[500px] flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-sun-50 p-2 rounded-xl">
                        <BarChart3 className="w-5 h-5 text-sun-600" />
                      </div>
                      <h2 className="text-2xl font-display font-bold text-forest-900">{t.diagnosisResult}</h2>
                    </div>
                    {(result || diagnosisData) && (
                      <div className="bg-forest-100 text-forest-700 px-4 py-1.5 rounded-full text-xs font-semibold border border-forest-200">
                        {t.analysisComplete}
                      </div>
                    )}
                  </div>

                  {!result && !diagnosisData && !loading && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                      <div className="bg-earth-50 w-24 h-24 rounded-xl flex items-center justify-center mb-6 border border-earth-100">
                        <Info className="w-12 h-12 text-earth-300" />
                      </div>
                      <p className="text-earth-900 font-bold text-lg mb-2">{t.readyToAnalyze}</p>
                      <p className="text-earth-400 text-sm max-w-[280px] leading-relaxed">{t.uploadPrompt}</p>
                    </div>
                  )}

                  {loading && (
                    <div className="flex-1 space-y-8 py-8">
                      <div className="space-y-3">
                        <div className="h-4 bg-earth-50 rounded-full w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-earth-50 rounded-full w-full animate-pulse"></div>
                        <div className="h-4 bg-earth-50 rounded-full w-5/6 animate-pulse"></div>
                      </div>
                      <div className="h-64 bg-earth-50 rounded-xl w-full animate-pulse"></div>
                    </div>
                  )}

                  {result && (
                    <div className="prose prose-stone max-w-none prose-headings:font-display prose-headings:text-forest-900 prose-p:text-earth-700 prose-strong:text-forest-800">
                      <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                  )}

                  {diagnosisData && (
                    <div className="space-y-8">
                      {/* Quality Hero Section */}
                      <div className="bg-forest-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg shadow-forest-900/20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-forest-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sun-500/5 rounded-full -ml-32 -mb-32 blur-3xl" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                          {/* Large Gauge */}
                          <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                              <circle
                                cx="96"
                                cy="96"
                                r="88"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="12"
                              />
                              <motion.circle
                                cx="96"
                                cy="96"
                                r="88"
                                fill="none"
                                stroke={diagnosisData.qualityScore > 80 ? '#10b981' : diagnosisData.qualityScore > 60 ? '#f59e0b' : '#ef4444'}
                                strokeWidth="12"
                                strokeDasharray="553"
                                initial={{ strokeDashoffset: 553 }}
                                animate={{ strokeDashoffset: 553 - (553 * diagnosisData.qualityScore) / 100 }}
                                transition={{ duration: 2, ease: "easeOut" }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <motion.span 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="text-6xl font-display font-bold"
                              >
                                {diagnosisData.qualityScore}
                              </motion.span>
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">{t.qualityScore}</span>
                            </div>
                          </div>

                          <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                              <h2 className="text-4xl font-display font-bold leading-tight">{diagnosisData.productName}</h2>
                              <p className="text-forest-300 font-medium mt-1">{t.condition}: <span className="text-white">{diagnosisData.condition}</span></p>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                              <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-2xl border border-earth-200/10">
                                <p className="text-xs font-semibold text-earth-500 opacity-60 mb-1">{t.status}</p>
                                <p className="text-sm font-bold">
                                  {diagnosisData.qualityScore > 80 ? t.premiumQuality : 
                                   diagnosisData.qualityScore > 60 ? t.standardQuality : 
                                   diagnosisData.qualityScore > 40 ? t.subStandard : t.criticalCondition}
                                </p>
                              </div>
                              <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-2xl border border-earth-200/10">
                                <p className="text-xs font-semibold text-earth-500 opacity-60 mb-1">{t.issues}</p>
                                <p className="text-sm font-bold">{diagnosisData.issues.length} {t.detected}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Issues Table */}
                      <div className="bg-white rounded-2xl border border-earth-100 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-earth-50/50 border-b border-earth-100">
                                <th className="py-4 px-6 text-[10px] font-bold uppercase text-earth-400 tracking-wider">{t.issue}</th>
                                <th className="py-4 px-6 text-[10px] font-bold uppercase text-earth-400 tracking-wider">{t.severity}</th>
                                <th className="py-4 px-6 text-[10px] font-bold uppercase text-earth-400 tracking-wider">{t.description}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-earth-50">
                              {diagnosisData.issues.map((issue, idx) => (
                                <tr key={idx} className="hover:bg-earth-50/30 transition-colors">
                                  <td className="py-5 px-6 font-bold text-forest-900">{issue.name}</td>
                                  <td className="py-5 px-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                      issue.severity === 'high' ? 'bg-red-50 text-red-600 border-red-100' :
                                      issue.severity === 'medium' ? 'bg-sun-50 text-sun-600 border-sun-100' :
                                      'bg-forest-50 text-forest-600 border-forest-100'
                                    }`}>
                                      {issue.severity === 'high' ? t.high :
                                       issue.severity === 'medium' ? t.medium :
                                       t.low}
                                    </span>
                                  </td>
                                  <td className="py-5 px-6 text-sm text-earth-600 leading-relaxed">{issue.description}</td>
                                </tr>
                              ))}
                              {diagnosisData.issues.length === 0 && (
                                <tr>
                                  <td colSpan={3} className="py-12 text-center text-earth-400 italic font-medium">{t.noIssuesDetected}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Actions & Tips */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl border border-earth-100 p-6 space-y-5">
                          <h3 className="flex items-center gap-3 font-display font-bold text-forest-900">
                            <div className="bg-sun-100 p-1.5 rounded-lg"><AlertCircle className="w-5 h-5 text-sun-600" /></div>
                            {t.actions}
                          </h3>
                          <ul className="space-y-3">
                            {diagnosisData.immediateActions.map((action, idx) => (
                              <li key={idx} className="flex gap-4 text-sm text-earth-700 bg-earth-50/50 p-4 rounded-2xl border border-earth-100/50">
                                <span className="text-forest-600 font-bold font-display">{String(idx + 1).padStart(2, '0')}</span>
                                <p className="leading-relaxed">{action}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-white rounded-2xl border border-earth-100 p-6 space-y-5">
                          <h3 className="flex items-center gap-3 font-display font-bold text-forest-900">
                            <div className="bg-forest-100 p-1.5 rounded-lg"><CheckCircle2 className="w-5 h-5 text-forest-600" /></div>
                            {t.tips}
                          </h3>
                          <ul className="space-y-3">
                            {diagnosisData.maintenanceTips.map((tip, idx) => (
                              <li key={idx} className="flex gap-4 text-sm text-earth-700 bg-forest-50/30 p-4 rounded-2xl border border-forest-100/30">
                                <div className="mt-1"><Info className="w-4 h-4 text-forest-300" /></div>
                                <p className="leading-relaxed">{tip}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Detailed Assessment */}
                      <div className="bg-forest-900 p-6 md:p-8 rounded-xl shadow-md shadow-forest-950/10 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-forest-500/10 rounded-full -ml-16 -mb-16 blur-3xl" />
                        <h3 className="font-bold text-sun-400 mb-3 uppercase tracking-wider text-[10px] relative z-10">{t.assessment}</h3>
                        <p className="text-forest-50 text-sm leading-relaxed relative z-10 font-medium">{diagnosisData.assessment}</p>
                      </div>
                    </div>
                  )}
                </section>

                {/* Weather/Stats Widget (Mock) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200 group hover:border-forest-200 transition-all">
                    <div className="flex items-center gap-3 text-earth-400 mb-4">
                      <div className="bg-sun-50 p-2 rounded-xl group-hover:bg-sun-100 transition-colors">
                        <ThermometerSun className="w-5 h-5 text-sun-600" />
                      </div>
                      <span className="text-xs font-semibold text-earth-500">{t.temperature}</span>
                    </div>
                    <p className="text-3xl font-display font-bold text-forest-900">24°C</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-forest-600 font-bold mt-2 bg-forest-50 px-2 py-1 rounded-lg w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      {t.optimalFor} {crops.find(c => c.id === selectedCrop)?.label}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-earth-200 group hover:border-forest-200 transition-all">
                    <div className="flex items-center gap-3 text-earth-400 mb-4">
                      <div className="bg-forest-50 p-2 rounded-xl group-hover:bg-forest-100 transition-colors">
                        <Droplets className="w-5 h-5 text-forest-600" />
                      </div>
                      <span className="text-xs font-semibold text-earth-500">{t.humidity}</span>
                    </div>
                    <p className="text-3xl font-display font-bold text-forest-900">62%</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-sun-600 font-bold mt-2 bg-sun-50 px-2 py-1 rounded-lg w-fit">
                      <AlertCircle className="w-3 h-3" />
                      {t.slightlyHigh}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}



          {activeTab === 'market' && (
            <motion.div
              key="market"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              {/* Top Section: Input */}
              <div className="w-full">
                <section className="bg-white rounded-2xl p-6 md:p-10 shadow-md border border-earth-200">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-sun-50 p-3 rounded-2xl">
                      <TrendingUp className="w-6 h-6 text-sun-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-forest-900 leading-tight">{t.marketRates}</h2>
                      <p className="text-[10px] font-bold text-earth-400 uppercase tracking-wider mt-1">{t.livePriceTracking}</p>
                    </div>
                  </div>
                  <p className="text-earth-500 text-sm mb-8 leading-relaxed">{t.marketRatesDescription}</p>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold uppercase text-earth-400 tracking-wider">{t.enterCropName}</label>
                      <div className="relative">
                        <Leaf className="absolute left-4 top-1/2 -translate-y-1/2 text-earth-300 w-5 h-5" />
                        <input
                          type="text"
                          value={cropSearch}
                          onChange={(e) => setCropSearch(e.target.value)}
                          placeholder={t.enterCropName}
                          className="w-full bg-earth-50 border border-earth-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all text-earth-900 placeholder:text-earth-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-earth-400 tracking-wider">{t.country}</label>
                        <select
                          value={country}
                          onChange={(e) => {
                            setCountry(e.target.value);
                            setState('');
                            setDistrict('');
                            setTaluka('');
                          }}
                          className="w-full bg-earth-50 border border-earth-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all text-earth-900"
                        >
                          <option value="">{t.selectLocation}</option>
                          {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-earth-400 tracking-wider">{t.state}</label>
                        <select
                          value={state}
                          onChange={(e) => {
                            setState(e.target.value);
                            setDistrict('');
                            setTaluka('');
                          }}
                          disabled={!country || !statesByCountry[country]}
                          className="w-full bg-earth-50 border border-earth-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all disabled:opacity-50 text-earth-900"
                        >
                          <option value="">{t.selectLocation}</option>
                          {country && statesByCountry[country]?.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-earth-400 tracking-wider">{t.district}</label>
                        <select
                          value={district}
                          onChange={(e) => {
                            setDistrict(e.target.value);
                            setTaluka('');
                          }}
                          disabled={!state || !districtsByState[state]}
                          className="w-full bg-earth-50 border border-earth-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all disabled:opacity-50 text-earth-900"
                        >
                          <option value="">{t.selectLocation}</option>
                          {state && districtsByState[state]?.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-earth-400 tracking-wider">{t.taluka}</label>
                        <select
                          value={taluka}
                          onChange={(e) => setTaluka(e.target.value)}
                          disabled={!district || !talukasByDistrict[district]}
                          className="w-full bg-earth-50 border border-earth-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500 transition-all disabled:opacity-50 text-earth-900"
                        >
                          <option value="">{t.selectLocation}</option>
                          {district && talukasByDistrict[district]?.map(ta => <option key={ta} value={ta}>{ta}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={!cropSearch.trim() || loading}
                    onClick={handleMarketRates}
                    className="w-full mt-8 bg-forest-600 text-white py-5 rounded-2xl font-bold text-lg shadow-md shadow-forest-600/30 hover:bg-forest-700 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
                    {loading ? t.fetchingRates : t.getLatestRates}
                  </button>
                </section>
              </div>

              {/* Bottom Section: Results */}
              <div className="w-full space-y-6">
                <section className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-earth-200 min-h-[500px] flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="bg-sun-50 p-2 rounded-xl">
                        <BarChart3 className="w-5 h-5 text-sun-600" />
                      </div>
                      <h2 className="text-2xl font-display font-bold text-forest-900">{t.marketRatesResult}</h2>
                    </div>
                    {result && (
                      <div className="bg-forest-100 text-forest-700 px-4 py-1.5 rounded-full text-xs font-semibold border border-forest-200">
                        {t.analysisComplete}
                      </div>
                    )}
                  </div>

                  {!result && !marketData && !loading && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                      <div className="bg-earth-50 w-24 h-24 rounded-xl flex items-center justify-center mb-6 border border-earth-100">
                        <Search className="w-12 h-12 text-earth-300" />
                      </div>
                      <p className="text-earth-900 font-bold text-lg mb-2">{t.searchMarketRates}</p>
                      <p className="text-earth-400 text-sm max-w-[280px] leading-relaxed">{t.marketRatesDescription}</p>
                    </div>
                  )}

                  {loading && (
                    <div className="flex-1 space-y-8 py-8">
                      <div className="space-y-3">
                        <div className="h-4 bg-earth-50 rounded-full w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-earth-50 rounded-full w-full animate-pulse"></div>
                        <div className="h-4 bg-earth-50 rounded-full w-5/6 animate-pulse"></div>
                      </div>
                      <div className="h-64 bg-earth-50 rounded-xl w-full animate-pulse"></div>
                    </div>
                  )}

                  {result && (
                    <div className="prose prose-stone max-w-none prose-headings:font-display prose-headings:text-forest-900 prose-p:text-earth-700 prose-strong:text-forest-800">
                      <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                  )}

                  {marketData && marketData.length > 0 && (
                    <div className="bg-white rounded-2xl border border-earth-100 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-earth-50/50 border-b border-earth-100">
                              <th className="py-4 px-6 text-[10px] font-bold uppercase text-earth-400 tracking-wider">{t.crop}</th>
                              <th className="py-4 px-6 text-[10px] font-bold uppercase text-earth-400 tracking-wider">{t.market}</th>
                              <th className="py-4 px-6 text-[10px] font-bold uppercase text-earth-400 tracking-wider">{t.price}</th>
                              <th className="py-4 px-6 text-[10px] font-bold uppercase text-earth-400 tracking-wider">{t.unitPrice}</th>
                              <th className="py-4 px-6 text-[10px] font-bold uppercase text-earth-400 tracking-wider">{t.trend}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-earth-50">
                            {marketData.map((item, idx) => (
                              <motion.tr 
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="hover:bg-earth-50/30 transition-colors"
                              >
                                <td className="py-5 px-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-earth-50 flex-shrink-0 border border-earth-100">
                                      <img 
                                        src={`https://picsum.photos/seed/${item.imageKeyword}/200/200`} 
                                        alt={item.cropName}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                    <div>
                                      <div className="font-bold text-forest-900">{item.cropName}</div>
                                      <div className="text-[10px] text-earth-400 uppercase tracking-wider font-bold">{item.sentiment}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-5 px-6">
                                  <div className="flex items-center gap-2 text-earth-600">
                                    <MapPin className="w-4 h-4 text-forest-500" />
                                    <span className="text-sm font-medium">{item.marketName}</span>
                                  </div>
                                </td>
                                <td className="py-5 px-6">
                                  <div className="font-bold text-forest-900">₹{item.price}</div>
                                  <div className="text-[10px] text-earth-400 uppercase tracking-wider font-bold">{t.per} {item.unit}</div>
                                </td>
                                <td className="py-5 px-6">
                                  <div className="font-bold text-forest-600">₹{item.normalizedPrice}</div>
                                  <div className="text-[10px] text-earth-400 uppercase tracking-wider font-bold">{t.per} {item.normalizedUnit}</div>
                                </td>
                                <td className="py-5 px-6">
                                  <div className={`flex items-center gap-1.5 font-bold ${
                                    item.trend === 'up' ? 'text-forest-600' : 
                                    item.trend === 'down' ? 'text-red-500' : 
                                    'text-earth-400'
                                  }`}>
                                    {item.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                                     item.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : 
                                     <Minus className="w-4 h-4" />}
                                    <span className="text-sm">{item.trendPercentage}</span>
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </motion.div>
          )}



          {activeTab === 'farm' && (
            <motion.div
              key="farm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-10 pb-20"
            >
              <div className="bg-white rounded-2xl shadow-md border border-earth-200 overflow-hidden">
                <div className="bg-forest-600 px-6 py-6 md:px-10 md:py-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                      <Sprout className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold text-white leading-tight">{t.farmInfo}</h2>
                      <p className="text-[10px] font-bold text-forest-100 uppercase tracking-wider mt-1">{t.manageAssets}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="p-6 md:p-10 space-y-8 md:space-y-10">
                  {profileMessage && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
                        profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                      }`}
                    >
                      {profileMessage.type === 'success' ? <Sprout className="w-5 h-5" /> : <Bug className="w-5 h-5" />}
                      {profileMessage.text}
                    </motion.div>
                  )}

                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-3">
                      <div className="bg-forest-50 p-2 rounded-lg">
                        <MapPin className="w-4 h-4 text-forest-600" />
                      </div>
                      {t.farmLocation}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-earth-400 mb-2 ml-1">{t.farmLocation}</label>
                        <div className="flex gap-3">
                          <div className="relative flex-1 group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-300 group-focus-within:text-forest-500 transition-colors" />
                            <input
                              type="text"
                              value={farmLocation}
                              onChange={(e) => setFarmLocation(e.target.value)}
                              className="w-full bg-earth-50/50 border border-earth-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all text-earth-900"
                              placeholder={t.locationPlaceholder}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowMap(true)}
                            className="bg-white text-forest-600 px-6 rounded-2xl font-bold hover:bg-forest-50 active:scale-95 transition-all text-[10px] uppercase tracking-wider border border-earth-100 shadow-sm flex items-center gap-2"
                          >
                            <MapPin className="w-4 h-4" /> {t.selectOnMap}
                          </button>
                        </div>
                        {(latitude && longitude) && (
                          <div className="mt-2 flex items-center gap-4 text-[10px] font-bold text-earth-400 uppercase tracking-wider">
                            <span>{t.latitude}: {latitude.toFixed(4)}</span>
                            <span>{t.longitude}: {longitude.toFixed(4)}</span>
                          </div>
                        )}
                      </div>

                      {/* Map Modal */}
                      <AnimatePresence>
                        {showMap && (
                          <MapModal 
                            latitude={latitude}
                            longitude={longitude}
                            setLatitude={setLatitude}
                            setLongitude={setLongitude}
                            setShowMap={setShowMap}
                            t={t}
                          />
                        )}
                      </AnimatePresence>

                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-earth-400 mb-2 ml-1">{t.farmArea}</label>
                          <input
                            type="number"
                            value={farmArea}
                            onChange={(e) => setFarmArea(e.target.value)}
                            className="w-full bg-earth-50/50 border border-earth-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all text-earth-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-earth-400 mb-2 ml-1">{t.unit}</label>
                          <select
                            value={farmUnit}
                            onChange={(e) => setFarmUnit(e.target.value)}
                            className="w-full bg-earth-50/50 border border-earth-100 rounded-2xl py-4 px-6 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all appearance-none text-earth-900"
                          >
                            <option value="acre">{t.acre}</option>
                            <option value="hectare">{t.hectare}</option>
                            <option value="guntha">{t.guntha}</option>
                          </select>
                        </div>
                        <div className="bg-sun-50/50 rounded-2xl p-4 flex flex-col justify-center border border-sun-100">
                          <span className="text-xs font-semibold text-sun-600 mb-1">{t.farmArea}</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-sun-900">
                              {farmArea ? Number(farmArea).toLocaleString() : '0'}
                            </span>
                            <span className="text-[10px] text-sun-600 font-bold uppercase">{t[farmUnit as keyof typeof t]}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-earth-400 mb-2 ml-1">{t.chemicalUsage}</label>
                        <div className="relative group">
                          <Droplets className="absolute left-4 top-4 w-5 h-5 text-earth-300 group-focus-within:text-forest-500 transition-colors" />
                          <textarea
                            value={chemicalUsage}
                            onChange={(e) => setChemicalUsage(e.target.value)}
                            className="w-full bg-earth-50/50 border border-earth-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all text-earth-900 min-h-[100px]"
                            placeholder={t.chemicalUsagePlaceholder}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-earth-400 mb-2 ml-1">{t.regularCrops}</label>
                        <div className="relative group">
                          <Leaf className="absolute left-4 top-4 w-5 h-5 text-earth-300 group-focus-within:text-forest-500 transition-colors" />
                          <textarea
                            value={regularCrops}
                            onChange={(e) => setRegularCrops(e.target.value)}
                            className="w-full bg-earth-50/50 border border-earth-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all text-earth-900 min-h-[100px]"
                            placeholder={t.regularCropsPlaceholder}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Growth Timeline Section */}
                  <div className="space-y-6 pt-10 border-t border-earth-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-3">
                        <div className="bg-forest-50 p-2 rounded-lg">
                          <Clock className="w-4 h-4 text-forest-600" />
                        </div>
                        {t.growthTimeline}
                      </h3>
                      <button
                        type="button"
                        onClick={addTimelineEvent}
                        className="bg-forest-50 text-forest-600 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-forest-600 hover:bg-forest-100 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {t.addStage}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {timelineEvents.length === 0 ? (
                        <div className="text-center py-8 bg-earth-50/50 rounded-2xl border border-earth-100 border-dashed">
                          <p className="text-earth-500 text-sm font-medium">{t.trackGrowthStages}</p>
                        </div>
                      ) : (
                        <div className="relative pl-6 space-y-6 border-l-2 border-forest-100 ml-4 py-2">
                          <AnimatePresence>
                            {timelineEvents.map((evt, index) => (
                              <motion.div 
                                key={evt.id} 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative bg-white p-5 rounded-2xl border border-earth-100 shadow-sm flex flex-col md:flex-row gap-4 items-start group"
                              >
                                <div className="absolute -left-[35px] top-5 w-4 h-4 bg-white border-2 border-forest-500 rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-forest-500 rounded-full" />
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                  <div>
                                    <label className="block text-xs font-semibold text-earth-400 mb-2">{t.date}</label>
                                    <input 
                                      type="date" 
                                      value={evt.date}
                                      onChange={(e) => updateTimelineEvent(evt.id, 'date', e.target.value)}
                                      className="w-full bg-earth-50 border border-earth-100 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-forest-500/20 text-sm text-earth-900"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-earth-400 mb-2">{t.stage}</label>
                                    <select 
                                      value={evt.stage}
                                      onChange={(e) => updateTimelineEvent(evt.id, 'stage', e.target.value)}
                                      className="w-full bg-earth-50 border border-earth-100 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-forest-500/20 text-sm text-earth-900 appearance-none"
                                    >
                                      <option value="sowing">{t.sowing}</option>
                                      <option value="sprouting">{t.sprouting}</option>
                                      <option value="vegetative">{t.vegetative}</option>
                                      <option value="flowering">{t.flowering}</option>
                                      <option value="fruiting">{t.fruiting}</option>
                                      <option value="harvesting">{t.harvesting}</option>
                                    </select>
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-earth-400 mb-2">{t.crop}</label>
                                    <input 
                                      type="text" 
                                      value={evt.cropName}
                                      onChange={(e) => updateTimelineEvent(evt.id, 'cropName', e.target.value)}
                                      className="w-full bg-earth-50 border border-earth-100 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-forest-500/20 text-sm text-earth-900"
                                      placeholder={t.enterCropName}
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-earth-400 mb-2">{t.cropNotes}</label>
                                    <input 
                                      type="text" 
                                      value={evt.notes}
                                      onChange={(e) => updateTimelineEvent(evt.id, 'notes', e.target.value)}
                                      className="w-full bg-earth-50 border border-earth-100 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-forest-500/20 text-sm text-earth-900"
                                    />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeTimelineEvent(evt.id)}
                                  className="self-start p-2 text-earth-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-10">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="w-full bg-forest-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-forest-600/20 hover:bg-forest-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {profileLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                      {t.saveChanges}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-10 pb-20"
            >
              {/* Farmer ID Card Container */}
              <div className="flex flex-col items-center gap-6">
                <div 
                  className="perspective-1000 w-full max-w-[450px] aspect-[1.6/1] cursor-pointer group"
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  <div className={`relative w-full h-full flip-card-inner preserve-3d duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}>
                    
                    {/* FRONT SIDE (Aadhar Style) */}
                    <div className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden flex flex-col">
                      {/* Header */}
                      <div className="bg-emerald-900/5 px-6 py-3 border-b border-emerald-900/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sprout className="w-5 h-5 text-emerald-600" />
                          <span className="text-xs font-semibold text-emerald-900">{t.digitalIdentity}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          <span className="text-[8px] font-bold text-emerald-600 uppercase">{t.verified}</span>
                        </div>
                      </div>

                      <div className="flex-1 p-6 flex gap-6">
                        {/* Photo Area */}
                        <div className="w-28 flex flex-col gap-3">
                          <div className="aspect-square bg-emerald-50 rounded-2xl border-2 border-earth-200 shadow-sm flex items-center justify-center overflow-hidden">
                            {profilePhoto ? (
                              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <UserIcon className="w-12 h-12 text-emerald-200" />
                            )}
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-emerald-100 shadow-sm">
                            <div className="w-full h-8 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#ecfdf5_2px,#ecfdf5_4px)] rounded-md" />
                          </div>
                        </div>

                        {/* Details Area */}
                        <div className="flex-1 space-y-4">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-emerald-400">{t.fullName}</p>
                            <p className="text-lg font-display font-bold text-emerald-900 leading-tight">{profileName || t.guestFarmer}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-emerald-400">{t.gender}</p>
                              <p className="text-xs font-bold text-emerald-700">{t[profileGender as keyof typeof t] || t.male}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-emerald-400">{t.dob}</p>
                              <p className="text-xs font-bold text-emerald-700">{profileDob || '---'}</p>
                            </div>
                          </div>
                          <div className="pt-2">
                            <p className="text-xs font-semibold text-emerald-400">{t.email}</p>
                            <p className="text-xs font-medium text-emerald-600 truncate">{user.email}</p>
                          </div>
                          <div className="pt-2">
                            <p className="text-xs font-semibold text-emerald-400">{t.phoneNumber}</p>
                            <p className="text-xs font-medium text-emerald-600 truncate">{profilePhone || '---'}</p>
                          </div>
                        </div>
                      </div>

                      {/* ID Number Footer */}
                      <div className="bg-emerald-900/5 px-8 py-3 border-t border-emerald-900/10 flex flex-col items-center justify-center">
                        <p className="text-xs font-semibold text-emerald-600/50 mb-1">{t.farmerId}</p>
                        <p className="text-2xl font-mono font-bold tracking-[0.3em] text-emerald-900">
                          {profileFarmerId ? profileFarmerId.replace(/(\d{4})/g, '$1 ').trim() : '0000 0000 0000'}
                        </p>
                      </div>
                    </div>

                    {/* BACK SIDE (Farm Info) */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden flex flex-col">
                      <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-emerald-500">{t.farmInfo}</span>
                        </div>
                      </div>

                      <div className="flex-1 p-6 flex gap-6">
                        <div className="flex-1 space-y-5">
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-emerald-400">{t.address}</p>
                            <p className="text-xs font-bold text-emerald-700 leading-relaxed">
                              {farmLocation || t.locationNotSet}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-emerald-400">{t.farmArea}</p>
                              <p className="text-sm font-bold text-emerald-600">
                                {farmArea ? Number(farmArea).toLocaleString() : '0'} {t[farmUnit as keyof typeof t]}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-emerald-100">
                            {(latitude && longitude) && (
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-emerald-400">{t.coordinates}</p>
                                <p className="text-[10px] font-bold text-emerald-600">
                                  {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="pt-2 flex items-center gap-3">
                            <div className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                              <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider">{t.activeFarm}</span>
                            </div>
                            <div className="bg-sun-50 px-3 py-1 rounded-full border border-sun-100">
                              <span className="text-[8px] font-bold text-sun-600 uppercase tracking-wider">{t.premiumUser}</span>
                            </div>
                          </div>
                        </div>

                        {/* QR Code Area */}
                        <div className="w-24 flex flex-col items-center justify-center gap-3">
                          <div className="w-24 h-24 bg-white p-2 rounded-2xl border border-earth-100 shadow-sm flex items-center justify-center">
                            <QRCodeCanvas 
                              value={`FarmerID: ${profileFarmerId || '000000000000'}\nName: ${profileName || 'Guest'}\nLocation: ${farmLocation || 'Not Set'}`}
                              size={80}
                              level="H"
                              includeMargin={false}
                            />
                          </div>
                          <p className="text-[8px] font-bold text-earth-300 uppercase tracking-tighter">{t.scanToVerify}</p>
                        </div>
                      </div>

                      <div className="bg-earth-50 px-8 py-3 border-t border-earth-100 text-center">
                        <p className="text-[9px] font-bold text-earth-400 uppercase tracking-[0.2em]">{t.ecosystemName}</p>
                      </div>
                    </div>

                  </div>
                </div>
                
                <button 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="flex items-center gap-2 text-xs font-semibold text-forest-600 bg-forest-50 px-6 py-2.5 rounded-full border border-forest-100 hover:bg-forest-100 transition-all active:scale-95"
                >
                  <RefreshCw className={`w-3 h-3 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
                  {isFlipped ? t.front : t.back}
                </button>
              </div>

              {/* Edit Form Section */}
              <div className="bg-white rounded-2xl shadow-md border border-earth-200 overflow-hidden">
                <div className="bg-forest-900 p-6 md:p-8 text-white flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="bg-forest-800 p-3 rounded-2xl border border-forest-700 shadow-md">
                      <Settings className="w-6 h-6 text-sun-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display font-bold">{t.profile}</h2>
                      <p className="text-forest-400 text-xs font-semibold mt-1">{t.manageDigitalIdentity}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="p-6 md:p-10 space-y-8 md:space-y-10">
                  {profileMessage && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-5 rounded-2xl flex items-center gap-4 border ${
                        profileMessage.type === 'success' 
                          ? 'bg-forest-50 text-forest-700 border-forest-100' 
                          : 'bg-red-50 text-red-700 border-red-100'
                      }`}
                    >
                      {profileMessage.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      <p className="text-sm font-bold">{profileMessage.text}</p>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-3">
                        <div className="bg-forest-50 p-2 rounded-lg">
                          <UserIcon className="w-4 h-4 text-forest-600" />
                        </div>
                        {t.personalDetails}
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-earth-400 mb-2 ml-1">{t.profilePhoto}</label>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-earth-50 border border-earth-100 flex items-center justify-center overflow-hidden">
                              {profilePhoto ? (
                                <img src={profilePhoto} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <UserIcon className="w-6 h-6 text-earth-200" />
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfilePhotoUpload}
                              className="hidden"
                              id="profile-photo-upload"
                            />
                            <label
                              htmlFor="profile-photo-upload"
                              className="bg-white text-forest-600 px-6 py-2.5 rounded-xl font-bold hover:bg-forest-50 active:scale-95 transition-all text-[10px] uppercase tracking-wider border border-earth-100 shadow-sm cursor-pointer"
                            >
                              {profilePhoto ? t.changePhoto : t.uploadPhoto}
                            </label>
                            {profilePhoto && (
                              <button
                                type="button"
                                onClick={() => setProfilePhoto(null)}
                                className="text-red-500 text-xs font-semibold hover:underline"
                              >
                                {t.remove}
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-earth-400 mb-2 ml-1">{t.fullName}</label>
                          <div className="relative group">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-300 group-focus-within:text-forest-500 transition-colors" />
                            <input
                              type="text"
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              className="w-full bg-earth-50/50 border border-earth-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all text-earth-900"
                              placeholder={t.fullName}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-earth-400 mb-2 ml-1">{t.farmerId}</label>
                          <div className="flex gap-3">
                            <div className="relative flex-1 group">
                              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-300 group-focus-within:text-forest-500 transition-colors" />
                              <input
                                type="text"
                                value={profileFarmerId}
                                onChange={(e) => setProfileFarmerId(e.target.value.replace(/\D/g, '').slice(0, 12))}
                                className="w-full bg-earth-50/50 border border-earth-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all text-earth-900"
                                placeholder={t.twelveDigitId}
                                maxLength={12}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={generateFarmerId}
                              className="bg-white text-forest-600 px-6 rounded-2xl font-bold hover:bg-forest-50 active:scale-95 transition-all text-[10px] uppercase tracking-wider border border-earth-100 shadow-sm"
                            >
                              {t.generateId}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-earth-400 mb-2 ml-1">{t.dob}</label>
                          <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-300 group-focus-within:text-forest-500 transition-colors" />
                            <input
                              type="date"
                              value={profileDob}
                              onChange={(e) => setProfileDob(e.target.value)}
                              className="w-full bg-earth-50/50 border border-earth-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all text-earth-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-earth-400 mb-2 ml-1">{t.gender}</label>
                          <div className="grid grid-cols-3 gap-3">
                            {(['male', 'female', 'other'] as const).map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setProfileGender(g)}
                                className={`py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all border ${
                                  profileGender === g
                                    ? 'bg-forest-600 text-white border-forest-600 shadow-lg shadow-forest-600/20'
                                    : 'bg-earth-50/50 text-earth-400 border-earth-100 hover:bg-earth-50'
                                }`}
                              >
                                {t[g as keyof typeof t]}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-earth-400 mb-2 ml-1">{t.phoneNumber}</label>
                          <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-300 group-focus-within:text-forest-500 transition-colors" />
                            <input
                              type="tel"
                              value={profilePhone}
                              onChange={(e) => setProfilePhone(e.target.value)}
                              className="w-full bg-earth-50/50 border border-earth-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all text-earth-900"
                              placeholder="+91 00000 00000"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-forest-900 flex items-center gap-3">
                        <div className="bg-forest-50 p-2 rounded-lg">
                          <Smartphone className="w-4 h-4 text-forest-600" />
                        </div>
                        {t.contactInfo}
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-earth-400 mb-2 ml-1">{t.phoneNumber}</label>
                          <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-300 group-focus-within:text-forest-500 transition-colors" />
                            <input
                              type="tel"
                              value={profilePhone}
                              onChange={(e) => setProfilePhone(e.target.value)}
                              className="w-full bg-earth-50/50 border border-earth-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all text-earth-900"
                              placeholder="+91 00000 00000"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="flex-1 bg-forest-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-forest-600/20 hover:bg-forest-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {profileLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                      {t.updateProfile}
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-10 bg-white text-red-500 py-5 rounded-2xl font-bold text-lg border border-red-100 hover:bg-red-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      <LogOut className="w-6 h-6" />
                      {t.logout}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>

    {/* Mobile Nav */}
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-earth-100 px-4 py-3 pb-6 flex justify-around items-center z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      {(['diagnose', 'farm', 'market', 'profile'] as const).map((tab) => (
        <button 
          key={tab}
          onClick={() => { setActiveTab(tab); setResult(null); setImage(null); }} 
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === tab ? 'text-forest-600 scale-110' : 'text-earth-300 hover:text-earth-500'}`}
        >
          <div className={`p-2 rounded-2xl transition-all duration-300 ${activeTab === tab ? 'bg-forest-50 shadow-sm' : ''}`}>
            {tab === 'diagnose' && <Camera className="w-6 h-6" />}
            {tab === 'farm' && <Sprout className="w-6 h-6" />}
            {tab === 'market' && <Search className="w-6 h-6" />}
            {tab === 'profile' && <UserIcon className="w-6 h-6" />}
          </div>
          <span className={`text-xs font-semibold transition-all duration-300 ${activeTab === tab ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
            {tab === 'diagnose' ? t.scan : 
             tab === 'farm' ? t.farm :
             tab === 'market' ? t.rates :
             t.user}
          </span>
        </button>
      ))}
    </div>

    {/* Hidden Canvas for Capture */}
    <canvas ref={canvasRef} className="hidden" />
  </div>
);
}

function FirebaseAuth({ language, setLanguage }: { language: Language, setLanguage: (lang: Language) => void }) {
  const t = translations[language];
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loginMethod === 'phone' && !(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved
        }
      });
    }
  }, [loginMethod]);

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setError('Please enter a valid phone number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !confirmationResult) return;
    setError('');
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
    } catch (err: any) {
      setError('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMethod === 'phone') {
      if (confirmationResult) {
        await handleVerifyOtp();
      } else {
        await handleSendOtp();
      }
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      if (isSignUp && err.code === 'auth/email-already-in-use') {
        setError("User already exists. Please sign in");
      } else if (!isSignUp && (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')) {
        setError("Email or password is incorrect");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-forest-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-sun-100/30 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-forest-600 w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-forest-600/30"
          >
            <Sprout className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-forest-900 tracking-tight mb-2">{t.appName}</h1>
          <p className="text-earth-500 font-medium">{t.welcomeMessage}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-md border border-earth-200">
          <div className="flex justify-center gap-2 mb-8 bg-earth-50/50 p-1.5 rounded-2xl border border-earth-100/50">
            {(['en', 'hi', 'mr'] as const).map((lang) => (
              <button 
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  language === lang 
                    ? 'bg-white text-forest-600 shadow-sm border border-earth-100' 
                    : 'text-earth-400 hover:text-earth-600'
                }`}
              >
                {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex bg-earth-50/50 p-1 rounded-2xl border border-earth-100/50 mb-6">
              <button
                type="button"
                onClick={() => { setLoginMethod('email'); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  loginMethod === 'email' 
                    ? 'bg-white text-forest-600 shadow-sm border border-earth-100' 
                    : 'text-earth-400 hover:text-earth-600'
                }`}
              >
                <Mail className="w-4 h-4" /> Email
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('phone'); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  loginMethod === 'phone' 
                    ? 'bg-white text-forest-600 shadow-sm border border-earth-100' 
                    : 'text-earth-400 hover:text-earth-600'
                }`}
              >
                <Smartphone className="w-4 h-4" /> Phone
              </button>
            </div>

            {loginMethod === 'email' ? (
              <>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-earth-400 ml-1">{t.email}</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-300 group-focus-within:text-forest-500 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-earth-50/50 border border-earth-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all text-earth-900 placeholder:text-earth-300"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-earth-400 ml-1">{t.password}</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-300 group-focus-within:text-forest-500 transition-colors" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-earth-50/50 border border-earth-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all text-earth-900 placeholder:text-earth-300"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {!confirmationResult ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-earth-400 ml-1">Phone Number</label>
                    <div className="relative group">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-300 group-focus-within:text-forest-500 transition-colors" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-earth-50/50 border border-earth-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all text-earth-900 placeholder:text-earth-300"
                        placeholder="1234567890"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-earth-400 ml-1">OTP</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-300 group-focus-within:text-forest-500 transition-colors" />
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-earth-50/50 border border-earth-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-forest-500/10 focus:border-forest-500 transition-all text-earth-900 placeholder:text-earth-300 tracking-wider"
                        placeholder="123456"
                      />
                    </div>
                  </div>
                )}
                <div id="recaptcha-container"></div>
              </>
            )}

            {error && (
              <div className="text-red-500 text-sm font-medium text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg shadow-forest-600/20 hover:bg-forest-700 hover:shadow-forest-600/40 active:scale-[0.98] transition-all mt-4 flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              {loginMethod === 'phone' 
                ? (confirmationResult ? 'Verify OTP' : 'Send OTP')
                : (isSignUp ? t.signUp : t.signIn)}
            </button>
            
            {loginMethod === 'email' && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-forest-600 text-sm font-bold hover:underline"
                >
                  {isSignUp ? t.alreadyHaveAccount : t.dontHaveAccount}
                </button>
              </div>
            )}
          </form>
        </div>

        <p className="text-center mt-8 text-earth-400 text-xs font-medium">
          {t.byContinuing} <span className="text-forest-600 font-bold">{t.termsOfService}</span>
        </p>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<{ uid: string, displayName?: string | null, email?: string | null, phoneNumber?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleUpdateUser = (data: any) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      localStorage.setItem('guest_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-earth-50">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-forest-600 p-4 rounded-xl shadow-md shadow-forest-600/20 animate-pulse">
            <Sprout className="w-10 h-10 text-white" />
          </div>
          <Loader2 className="w-6 h-6 text-forest-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {user ? (
        <Dashboard 
          key="dashboard" 
          user={user} 
          language={language} 
          setLanguage={setLanguage} 
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
        />
      ) : (
        <FirebaseAuth 
          key="auth" 
          language={language} 
          setLanguage={setLanguage} 
        />
      )}
    </AnimatePresence>
  );
}
