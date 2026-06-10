// 🚀 Impulso PR & TV - Infraestructura Digital de Puerto Rico 🇵🇷 (Test) - Ver. 1.1.0
// REFRESH: DUAL-METRIC SYNC ACTIVE - REAL-TIME ENGAGEMENT FOR IMPULSO & YOUTUBE
import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense, lazy } from 'react';
import { AppView, PRTab, Business, TVAd, UserSettings, REGIONES_PR, TV_ONLY_REGIONS, Promoter, PaymentLinks, AdminEmails, Seller, ShopProduct, SHOP_CATEGORIES, UserProfile, FamilyStatus, PRMessage } from './types';
import { IdentityModal } from './components/shared/IdentityModal';
import { AddProductModal } from './components/impulsoshop/modals/AddProductModal';
import Home from './components/home/Home';
import Navbar from './components/Navbar';
import { supabase } from './supabaseClient';
import { db, messaging } from './firebaseClient';
import { collection, addDoc } from 'firebase/firestore';
import { onMessage } from 'firebase/messaging';
import { PromoterModal } from './components/promoter/PromoterModal';
import GlobalMusicPlayer from './components/shared/GlobalMusicPlayer';
import { RadioPlayer } from './components/shared/RadioPlayer';
import { FamilyLiveChat } from './components/impulsofamily/FamilyLiveChat';
import { ImpulsoFamily_SeccionCartas_SuperAnuncios as ImpulsoFamily } from './components/home/ImpulsoFamily_SeccionCartas_SuperAnuncios';
import { askIA } from './geminiClient';
import AICore from './components/impulsopr/chat/AICore';

// Lazy Loading de componentes pesados
const ImpulsoPR = lazy(() => import('./components/impulsopr/ImpulsoPR_SeccionCartas_SuperAnuncios'));
const ImpulsoTV_D = lazy(() => import('./components/impulsotv/ImpulsoTV'));
const ImpulsoTV_M = lazy(() => import('./components/impulsotv/ImpulsoTV_Mobile'));
const ImpulsoShop = lazy(() => import('./components/impulsoshop/ImpulsoShop'));
const ImpulsoApps = lazy(() => import('./components/impulsoapps/ImpulsoApps_SeccionCartas_SuperAnuncios'));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));
const SettingsModal = lazy(() => import('./components/settings/SettingsModal').then(module => ({ default: module.SettingsModal })));
const FloatingClock = lazy(() => import('./components/FloatingClock').then(module => ({ default: module.FloatingClock })));
const ProgramAlarm = lazy(() => import('./components/ProgramAlarm').then(module => ({ default: module.ProgramAlarm })));
const AdClientDashboard = lazy(() => import('./components/admin/AdClientDashboard').then(module => ({ default: module.AdClientDashboard })));
const ShipModuleModal = lazy(() => import('./components/shared/ShipModuleModal').then(module => ({ default: module.ShipModuleModal })));

const mapBusinessFromDB = (row: any): Business => ({
  id: row.id || Math.random().toString(),
  name: row.name || 'Negocio sin Nombre',
  category: row.category || 'Varios',
  niches: Array.isArray(row.niches) ? row.niches : [],
  town: row.town || 'Puerto Rico',
  description: row.description || '',
  isCertified: !!row.is_certified,
  accessKey: row.access_key || '',
  contact: row.contact || '',
  logoUrl: row.logo_url || '',
  website: row.website || '',
  instagram: row.instagram || '',
  facebook: row.facebook || '',
  mapsLink: row.maps_link || '',
  appLink: row.app_link || '',
  appDescription: row.app_description || '',
  hasAppSubscription: !!row.has_app_subscription,
  appCategories: Array.isArray(row.app_categories) ? row.app_categories : [],
  appRegion: row.app_region || 'Isla',
  ratingSum: Number(row.rating_sum) || 0,
  reviewCount: Number(row.review_count) || 0,
  email: row.email || '',
  status: (row.status as 'basic' | 'premium') || 'basic',
  promoterCode: row.promoter_code || '',
  trialEndsAt: row.trial_ends_at ? new Date(row.trial_ends_at) : undefined
});

const mapBusinessToDB = (biz: Business) => ({
  id: biz.id,
  name: biz.name,
  category: biz.category,
  niches: biz.niches,
  town: biz.town,
  description: biz.description,
  contact: biz.contact,
  logo_url: biz.logoUrl,
  website: biz.website,
  instagram: biz.instagram,
  facebook: biz.facebook,
  maps_link: biz.mapsLink,
  app_link: biz.appLink,
  app_description: biz.appDescription,
  has_app_subscription: biz.hasAppSubscription,
  app_categories: biz.appCategories,
  app_region: biz.appRegion,
  access_key: biz.accessKey,
  is_certified: biz.isCertified,
  status: biz.status,
  email: biz.email,
  promoter_code: biz.promoterCode,
  trial_ends_at: biz.trialEndsAt ? (biz.trialEndsAt instanceof Date ? biz.trialEndsAt : new Date(biz.trialEndsAt)).toISOString() : null
});

const mapAdFromDB = (row: any): TVAd => ({
  id: row.id || Math.random().toString(),
  businessName: row.business_name || 'Anunciante',
  videoUrl: row.video_url || '',
  videoUrlHighRes: row.video_url_high_res || '',
  promoUrl: row.promo_url || '',
  promoPosteriorUrl: row.promo_posterior_url || '',
  region: row.region || 'Metro',
  town: row.town || '',
  isPremium: !!row.is_premium,
  slotIndex: Number(row.slot_index) || 0,
  ctaText: row.cta_text || 'Ver Más',
  ctaUrl: row.cta_url || '',
  contactEmail: row.contact_email || '',
  views: Number(row.views) || 0,
  directoryClicks: Number(row.directory_clicks) || 0,
  ctaClicks: Number(row.cta_clicks) || 0,
  likes: Number(row.likes) || 0,
  revenue: Number(row.revenue) || 0,
  expiresAt: row.expires_at ? new Date(row.expires_at) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  promoterCode: row.promoter_code || '',
  subscribers: String(row.subscribers || 0),
  isSuperAd: !!row.is_super_ad,
  startTime: row.start_time || '00:00',
  endTime: row.end_time || '23:59',
  scheduledDate: row.scheduled_date || '',
  ytLikes: String(row.ytLikes || '0'),
  isVerified: !!row.is_verified
});

const mapAdToDB = (ad: TVAd) => ({
  id: ad.id,
  business_name: ad.businessName,
  video_url: ad.videoUrl,
  video_url_high_res: ad.videoUrlHighRes,
  promo_url: ad.promoUrl,
  promo_posterior_url: ad.promoPosteriorUrl,
  region: ad.region,
  town: ad.town,
  is_premium: ad.isPremium,
  slot_index: ad.slotIndex,
  cta_text: ad.ctaText,
  cta_url: ad.ctaUrl,
  contact_email: ad.contactEmail,
  revenue: ad.revenue,
  likes: ad.likes || 0,
  views: ad.views || 0,
  directory_clicks: ad.directoryClicks || 0,
  cta_clicks: ad.ctaClicks || 0,
  expires_at: (ad.expiresAt instanceof Date ? ad.expiresAt : new Date(ad.expiresAt || Date.now())).toISOString(),
  promoter_code: ad.promoterCode,
  subscribers: ad.subscribers, // Sync real subscribers
  is_super_ad: ad.isSuperAd,
  start_time: ad.startTime,
  end_time: ad.endTime,
  scheduled_date: ad.scheduledDate,
  ytLikes: ad.ytLikes || '0',
  is_verified: ad.isVerified,
  created_at: (ad.createdAt instanceof Date ? ad.createdAt : new Date(ad.createdAt || Date.now())).toISOString()
});

const mapFamilyStatusFromDB = (row: any): FamilyStatus => ({
  id: row.id,
  user: row.user || 'Usuario',
  text: row.text,
  timestamp: Number(row.timestamp),
  role: row.role || 'user',
  href: row.href,
  thumb: row.thumb || row.image || row.imageUrl, // Guardamos la foto en ambos para máxima compatibilidad
  imageUrl: row.thumb || row.image || row.imageUrl || row.image_url, 
  region: row.region,
  pueblo: row.pueblo,
  product: row.product ? (typeof row.product === 'string' ? JSON.parse(row.product) : row.product) : undefined
});

const LoadingFallback = ({ onRefresh }: { onRefresh: () => void }) => {
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[40000] bg-[#020617] flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* ANTIGRAVITY CINEMATIC BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-purple-900/30"></div>
        <div className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.15)_0%,_transparent_60%)] animate-nebula-float opacity-70"></div>
        {/* Estrellas */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-sm">
        {/* Logo / Dish Icon / Orbit Progress */}
        <div className="relative">
          {/* Círculo de Progreso (SVG) */}
          <svg className="absolute -inset-4 w-32 h-32 -rotate-90">
            <circle
              cx="64" cy="64" r="58"
              fill="none"
              stroke="rgba(59,130,246,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="64" cy="64" r="58"
              fill="none"
              stroke="url(#loadingGradient)"
              strokeWidth="4"
              strokeDasharray="364"
              strokeDashoffset={364 - (364 * simulatedProgress / 100)}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
            <defs>
              <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
            </defs>
          </svg>

          <div className="w-24 h-24 rounded-full border-2 border-blue-500/30 flex items-center justify-center bg-blue-600/5 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
            <i className="fas fa-satellite-dish text-blue-400 text-4xl"></i>
          </div>

          {/* Orbiting dot (Sync Icon) */}
          <div className="absolute inset-0 animate-spin-slow duration-[3s]">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(96,165,250,1)]"></div>
          </div>
        </div>

        <div className="space-y-4 w-full">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Sistema Impulso PR</h2>
            <p className="text-blue-400/60 text-[9px] font-black uppercase tracking-[0.4em]">Sincronizando con el Satélite...</p>
          </div>

          {/* Progress Bar Horizontal */}
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 transition-all duration-300"
              style={{ width: `${simulatedProgress}%` }}
            ></div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <button
              onClick={(e) => { e.stopPropagation(); onRefresh(); }}
              className="px-8 py-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-full font-black text-[9px] uppercase tracking-[0.2em] transition-all border border-blue-500/30 flex items-center gap-2 group"
            >
              <i className="fas fa-sync-alt group-hover:rotate-180 transition-transform duration-500"></i>
              Forzar Sincronización
            </button>

            <div className="flex items-center gap-3 opacity-20">
              <div className="h-[1px] w-6 bg-blue-500"></div>
              <span className="text-[7px] font-black uppercase tracking-[0.5em] text-blue-400 italic">Boricua Network</span>
              <div className="h-[1px] w-6 bg-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [viewHistory, setViewHistory] = useState<AppView[]>([AppView.HOME]);
  const currentView = viewHistory[viewHistory.length - 1];

  // MODO DESKTOP FORZADO (PEDIDO USER)
  const isForceDesktop = typeof window !== 'undefined' && localStorage.getItem('impulso_force_desktop') === 'true';

  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;

    if (isForceDesktop) {
      meta.setAttribute('content', 'width=1280, initial-scale=0.3, maximum-scale=2');
      document.body.style.minWidth = '1280px';
    } else {
      meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0');
      document.body.style.minWidth = 'auto';
    }
  }, [isForceDesktop]);

  const ImpulsoTV = isForceDesktop ? ImpulsoTV_D : ImpulsoTV_M;

  useEffect(() => {
    localStorage.setItem('impulso_view_history', JSON.stringify(viewHistory));
  }, [viewHistory]);

  const OFFICIAL_LOGO = '/brand_final.jpg';
  const OFFICIAL_ASTRONAUT_LOGO = '/brand_final.jpg';
  const OFFICIAL_MURAL = '/mural_1.jpg';
  const OFFICIAL_MURAL_2 = '/mural_extra.jpg';

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showSyncError, setShowSyncError] = useState(false);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  
  const [targetBusinessName, setTargetBusinessName] = useState<string | null>(null);
  const [businessToEdit, setBusinessToEdit] = useState<Business | null>(null);
  const [activePRTab, setActivePRTab] = useState<PRTab>(PRTab.TOWNS);
  const [isUIHidden, setIsUIHidden] = useState(false);
  const uiTimeoutRef = useRef<number | null>(null);

  // GHOST ASSISTANT (TV MODE ONLY)
  const [showTVAssistant, setShowTVAssistant] = useState(true);
  const assistantTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetAssistantTimer = useCallback(() => {
    setShowTVAssistant(true);
    if (assistantTimerRef.current) clearTimeout(assistantTimerRef.current);
    assistantTimerRef.current = setTimeout(() => {
      setShowTVAssistant(false);
    }, 5000);
  }, []);

  const toggleUI = useCallback((isHidden?: boolean) => {
    // Sincronizar el asistente en TV
    resetAssistantTimer();

    // Si pasamos un booleano (desde un componente hijo como ImpulsoTV), lo usamos
    if (isHidden !== undefined) {
      setIsUIHidden(isHidden);
      if (uiTimeoutRef.current) window.clearTimeout(uiTimeoutRef.current);
      return;
    }

    // Para la vista de TV, no queremos el auto-ocultamiento global de App.tsx
    // ya que ImpulsoTV maneja su propia lógica interna para el modo cine.
    if (currentView === AppView.TV) {
      // Si por alguna razón estaba oculto, lo despertamos, pero no ponemos un timer para volverlo a ocultar.
      setIsUIHidden(false);
      if (uiTimeoutRef.current) window.clearTimeout(uiTimeoutRef.current);
      return;
    }

    // Lógica normal de auto-hide para el resto de la App
    setIsUIHidden(false);
    if (uiTimeoutRef.current) window.clearTimeout(uiTimeoutRef.current);

    // Si estamos en POD o PR, queremos más tiempo (30s) antes de ocultar
    const timeout = (currentView === AppView.SHOP || currentView === AppView.PR) ? 30000 : 5000;

    uiTimeoutRef.current = window.setTimeout(() => {
      setIsUIHidden(true);
    }, timeout);
  }, [currentView]);


  useEffect(() => {
    // Inicializar el timer (excepto en TV donde es estático por defecto)
    if (currentView !== AppView.TV) {
      toggleUI();
    } else {
      setIsUIHidden(false);
    }
    return () => { if (uiTimeoutRef.current) window.clearTimeout(uiTimeoutRef.current); };
  }, [toggleUI, currentView]);

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('impulso_user_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.soundsEnabled === undefined) parsed.soundsEnabled = true;
        if (!parsed.soundMode) parsed.soundMode = 'pop';
        if (parsed.showClock === undefined) parsed.showClock = true;
        if (parsed.alarmEnabled === undefined) parsed.alarmEnabled = parsed.lockScreenEnabled || false;
        if (parsed.alarmSound === undefined) parsed.alarmSound = 'impulso_melody_alarm';
        if (parsed.musicEnabled === undefined) parsed.musicEnabled = true; // Por defecto activo
        if (parsed.backgroundMusicMode === undefined) parsed.backgroundMusicMode = true;
        if (parsed.musicShuffleMode === undefined) parsed.musicShuffleMode = true;
        if (parsed.musicRepeatMode === undefined) parsed.musicRepeatMode = 'all';
        // BLINDAJE: Normalizar language antes de retornar
        if (!parsed.language || !['es', 'en'].includes(parsed.language)) {
          parsed.language = 'es';
        }
        return parsed;
      }
    } catch (e) {
      console.error("Error loading settings:", e);
    }
    const defaultNotifs: Record<string, boolean> = {};
    Object.keys(REGIONES_PR).forEach(r => defaultNotifs[r] = true);
    return { language: 'es', notifications: defaultNotifs, soundsEnabled: true, soundMode: 'pop', showClock: true, alarmEnabled: false, alarmSound: 'impulso_melody_alarm', musicEnabled: true, musicSource: 'top10', backgroundMusicMode: true, musicShuffleMode: true, musicRepeatMode: 'all', customMusicUrls: [], radioTheme: 'dark', screensaverBg: '/assets/screensaver_1.png' };
  });


  const [activePromoter, setActivePromoter] = useState<Promoter | null>(() => {
    const saved = localStorage.getItem('impulso_active_promoter');
    return saved ? JSON.parse(saved) : null;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState<string | undefined>(undefined);
  const [showPromoterModal, setShowPromoterModal] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(() => {
    return localStorage.getItem('impulso_show_family') === 'true';
  });
  const [familyInitialIsPosting, setFamilyInitialIsPosting] = useState(false);
  useEffect(() => {
    localStorage.setItem('impulso_show_family', showFamilyModal.toString());
    if (!showFamilyModal) setFamilyInitialIsPosting(false);
  }, [showFamilyModal]);
  const [isShipModalOpen, setIsShipModalOpen] = useState(false);
  const [activeShipModule, setActiveShipModule] = useState<'music' | 'sounds' | 'alarm' | 'general'>('general');
  const [forceOpenNotifTab, setForceOpenNotifTab] = useState<'tv' | 'pr' | 'biz' | 'local' | 'actions' | null>(null);
  const [registeredBusinesses, setRegisteredBusinesses] = useState<Business[]>([]);
  const [activeAds, setActiveAds] = useState<TVAd[]>([]);
  const [sellers, setSellers] = useState<Seller[]>(() => {
    const saved = localStorage.getItem('impulso_sellers');
    return saved ? JSON.parse(saved) : [];
  });
  const [shopProducts, setShopProducts] = useState<ShopProduct[]>([]);
  const [shouldOpenShopAddModal, setShouldOpenShopAddModal] = useState(false);
  const [initialOpenProductId, setInitialOpenProductId] = useState<string | null>(null);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);
  const [musicProgress, setMusicProgress] = useState({ current: 0, duration: 0 });
  const [liveTrackMetadata, setLiveTrackMetadata] = useState<{ title: string; artist: string } | null>(null);
  const [familyStatuses, setFamilyStatuses] = useState<FamilyStatus[]>([]);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isTVSettingsOpen, setIsTVSettingsOpen] = useState(false);
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isBabyMode, setIsBabyMode] = useState(false);

  // DETECTOR DE PANTALLA COMPLETA NATIVA (YOUTUBE)
  useEffect(() => {
    const handleFSChange = () => {
      const fsElement = document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement;
      // Si el elemento en pantalla completa es un iframe, asumimos que es el reproductor nativo de YouTube
      setIsNativeFullscreen(!!fsElement && fsElement.tagName === 'IFRAME');
    };

    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    document.addEventListener('mozfullscreenchange', handleFSChange);
    document.addEventListener('MSFullscreenChange', handleFSChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
      document.removeEventListener('mozfullscreenchange', handleFSChange);
      document.removeEventListener('MSFullscreenChange', handleFSChange);
    };
  }, []);
  const aiAutoClearRef = useRef<NodeJS.Timeout | null>(null);

  // IA CORE (TAB PR) - PERSISTENTE
  const [prTabAiMessages, setPrTabAiMessages] = useState<PRMessage[]>(() => {
    const saved = localStorage.getItem('impulso_ai_chat_core');
    return saved ? JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) : [];
  });

  // ASISTENTE FLOTANTE (VOLÁTIL)
  const [floatingAiMessages, setFloatingAiMessages] = useState<PRMessage[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    localStorage.setItem('impulso_ai_chat_core', JSON.stringify(prTabAiMessages));
  }, [prTabAiMessages]);

  useEffect(() => {
    resetAssistantTimer();
    return () => { if (assistantTimerRef.current) clearTimeout(assistantTimerRef.current); };
  }, [currentView, resetAssistantTimer]);

  // RESETEAR TEMPORIZADOR DE AUTO-BORRADO (10 MINUTOS)
  const resetAIAutoClearTimer = useCallback(() => {
    if (aiAutoClearRef.current) clearTimeout(aiAutoClearRef.current);
    aiAutoClearRef.current = setTimeout(() => {
      setFloatingAiMessages([]); // Borrar charla al cabo de 10 min de inactividad
      console.log("🧹 Conversación del asistente borrada por inactividad (10m)");
    }, 10 * 60 * 1000); // 10 minutos
  }, []);

  useEffect(() => {
    // Solicitar Permiso de GPS
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("GPS no disponible"),
        { enableHighAccuracy: true }
      );
    }

    // Solicitar Permiso de Notificaciones Push (Firebase)
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("🔔 Permiso de notificaciones concedido exitosamente.");
          // Pedir el token a Firebase para enlazar el dispositivo
          import('./firebaseClient').then(({ requestFirebaseToken }) => {
            requestFirebaseToken();
          });
        } else {
          console.log("🔕 Permiso de notificaciones denegado o ignorado.");
        }
      }).catch((err) => console.error("Error pidiendo permiso de notificaciones:", err));
    } else if ("Notification" in window && Notification.permission === "granted") {
       // Si ya había dado permiso antes, obtenemos el token silenciosamente
       import('./firebaseClient').then(({ requestFirebaseToken }) => {
         requestFirebaseToken();
       });
    }
  }, []);

  const handleSendAIMessageGlobal = async (text: string, isFloating: boolean = true) => {
    if (!text.trim() || isAILoading) return;

    // Nombres legibles de las secciones para la IA
    const viewNames: Record<string, string> = {
      [AppView.PR]: "Impulso PR (Directorio y Chat)",
      [AppView.TV]: "Impulso TV (Canales en vivo y Anuncios)",
      [AppView.SHOP]: "Impulso Shop (Tienda Online)",
      [AppView.APPS]: "Impulso Apps (Ecosistema de Aplicaciones)",
      [AppView.FAMILY]: "Impulso Family (Muro Social)",
      [AppView.HOME]: "Inicio (Paso de mando)"
    };

    const targetMessages = isFloating ? floatingAiMessages : prTabAiMessages;
    const setTargetMessages = isFloating ? setFloatingAiMessages : setPrTabAiMessages;

    const newMsgs: PRMessage[] = [...targetMessages, { role: 'user', content: text, timestamp: new Date() }];
    setTargetMessages(newMsgs);
    setIsAILoading(true);
    if (isFloating) resetAIAutoClearTimer();

    try {
      const locationContext = userCoords
        ? `UBICACIÓN ACTUAL DEL USUARIO: Lat ${userCoords.lat}, Lng ${userCoords.lng}. Prioriza negocios en su pueblo.`
        : "UBICACIÓN: Desconocida. Pregunta el pueblo si es necesario para dar mejores recomendaciones.";

      const systemInstruction = `ROL: Eres el 'Facilitador Digital Oficial' de 'Impulso PR'. Tu misión es conectar a los usuarios con el mejor comercio local de Puerto Rico.
      PERSONALIDAD: Puertorriqueño Profesional, Proactivo, Experto en Tecnología y muy Cálido. Tú no solo respondes, tú GUÍAS al usuario de la mano. Usa términos como 'Wepa', 'Boricua', 'Pa' servirte'. 
      
      SITUACIÓN ACTUAL: El usuario está navegando en: ${viewNames[currentView] || 'Módulo Desconocido'}.
      LUGAR DETECTADO: ${userCoords ? 'Moca (o detectado por GPS)' : 'Buscando señal...'}.

      CONOCIMIENTO DEL ECOSISTEMA:
      1. IMPULSO TV: Canales 24/7 (Boricua, TV, Kids, Top 10). Los negocios pueden pautar aquí para alcance masivo.
      2. IMPULSO SHOP: Compra directa hablando con los dueños. ¡Trato directo!
      3. IMPULSO FAMILY: Muro social de momentos reales en la isla.
      4. DIRECTORIO: Negocios certificados con GPS.

      INVENTARIO DE NEGOCIOS (PARA TU CONTEO): 
      ${registeredBusinesses.map(b => `- ${b.name} (Pueblo: ${b.town}, Categoría: ${b.category})`).join('\n')}

      PROTOCOLO DE RESPUESTA (REGULACIONES):
      1. NO REPITAS SALUDOS: Solo menciona el pueblo (ej: Moca) en tu mensaje inicial. No digas "Wepa" en cada turno.
      2. COHERENCIA: Lee el historial y responde directamente. Si ya se saludaron, ve al grano con la información solicitada.
      3. MANEJO DE NO RESULTADOS: Si NO hay lo que piden, responde: "¡Ay Virgen! Por ahora no tenemos negocios de [CATEGORÍA] en [PUEBLO], pero no te quites Boricua, que Puerto Rico está creciendo y estamos certificando más comercios cada día. ¡Manténgase pendiente!"
      4. GUÍA INICIAL: Solo en el primer mensaje de la charla, ofrece desglosar (Comida, Servicios, Compras).
      5. MANEJO DE CRECIMIENTO: Si solo hay un negocio (demo), preséntalo como el líder actual en su zona.
      6. TERMINA TUS FRASES: Sé conciso pero termina tus puntos. No dejes respuestas a la mitad.`;

      const aiText = await askIA(text, systemInstruction);
      setTargetMessages(prev => [...prev, { role: 'assistant', content: aiText, timestamp: new Date() }]);
      playBeep('ai');
    } catch (e) {
      setTargetMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Lo siento Boricua, hay un problema técnico con mi señal. Reintenta en breve.", timestamp: new Date() }]);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleClearAIMessages = (isFloating: boolean) => {
    const initialMsg: PRMessage = { role: 'assistant', content: merchantWelcome, timestamp: new Date() };
    if (isFloating) {
      setFloatingAiMessages([initialMsg]);
    } else {
      setPrTabAiMessages([initialMsg]);
      localStorage.setItem('impulso_ai_chat_core', JSON.stringify([initialMsg]));
    }
  };

  // PERFIL UNIFICADO GLOBAL
  const [globalProfile, setGlobalProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('impulso_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading user profile:", e);
    }
    return { name: '', photo: '', email: '', userId: Math.floor(100000 + Math.random() * 900000).toString() };
  });

  // Escuchar cambios de perfil en otras ventanas/modales
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('impulso_user_profile');
        if (saved) setGlobalProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Error updating user profile from storage:", e);
      }
    };
    window.addEventListener('storage', handleStorage);
    // Checker de intervalo para cuando se cambia en el mismo thread sin disparar 'storage'
    const interval = setInterval(handleStorage, 2000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // LOCAL STORE ADD PRODUCT MODAL STATES (Root Level)
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const prevShowAddProductModal = useRef(false);
  const [newProduct, setNewProduct] = useState<Partial<ShopProduct>>({
    name: '',
    price: 0,
    store: '',
    category: SHOP_CATEGORIES[1],
    niche: 'Global',
    imageUrl: '',
    externalUrl: '',
    description: '',
    vendorEmail: ''
  });
  const [vendorEmail, setVendorEmail] = useState('');
  const [isDescEditing, setIsDescEditing] = useState(false);

  // Initialize newProduct and vendorEmail when opening the modal (only if not editing)
  useEffect(() => {
    if (showAddProductModal && !prevShowAddProductModal.current && globalProfile) {
      if (!newProduct.id) {
        setNewProduct({
          name: '',
          price: 0,
          store: globalProfile.storeName || '',
          category: SHOP_CATEGORIES[1],
          niche: 'Global',
          imageUrl: '',
          externalUrl: '',
          description: '',
          vendorEmail: globalProfile.email || ''
        });
        setVendorEmail(globalProfile.email || '');
      }
    }
    prevShowAddProductModal.current = showAddProductModal;
  }, [showAddProductModal, globalProfile]);

  // --- LÓGICA DE SEGURIDAD: BOTÓN DE PÁNICO (4 CLICS PARA HOME) ---
  const backPanicRef = useRef({ count: 0, lastTime: 0 });

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Al presionar atrás en el móvil, retrocedemos en nuestro historial interno
      setViewHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
      setIsUIHidden(false);
    };

    // LIMPIEZA DE ANUNCIOS CADA 24 HORAS
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const cutoff = now - 24 * 60 * 60 * 1000;

      setFamilyStatuses(prev => {
        const filtered = prev.filter(s => s.timestamp > cutoff);
        return filtered.length !== prev.length ? filtered : prev;
      });
    }, 60000); // Revisar cada minuto

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearInterval(cleanupInterval);
    };
  }, []);

  const MASTER_VIDEOS: Record<string, { title: string, url: string, sub: string, desc: string, ytLikes: string }[]> = {
    'Metro': [
      { title: 'Planeta Alofoke', url: 'https://www.youtube.com/watch?v=FmUvI-S6Krk', sub: '8.9M', desc: 'Sintoniza las mejores entrevistas y contenido exclusivo del mundo del entretenimiento urbano.', ytLikes: '12M+' },
      { title: 'Chente Ydrach', url: 'https://www.youtube.com/watch?v=9x3-C9p9_5s', sub: '1.5M', desc: 'El podcast más duro de Puerto Rico. Comedia, entrevistas y cultura pop.', ytLikes: '4.5M' },
    ],
    'Norte': [
      { title: 'Danilo Montero', url: 'https://www.youtube.com/watch?v=1F_lM0lR3fA', sub: '1.2M', desc: 'Un espacio para la fe y la reflexión con Danilo Montero.', ytLikes: '2.1M' },
    ],
    'Sur': [
      { title: 'Molinari TV', url: 'https://www.youtube.com/watch?v=M6XN-eZ_O2A', sub: '450K', desc: 'Análisis político y entrevistas de profundidad con Molinari TV.', ytLikes: '890K' },
    ],
    'TV Boricua': [
      { title: 'Molusco TV', url: 'https://www.youtube.com/watch?v=3r9-A-B-1-A', sub: '2.8M', desc: 'Noticias, entrevistas y el mejor contenido de entretenimiento.', ytLikes: '6.7M' },
    ],
    'Impulso TV': [
      { title: 'Planeta Alofoke', url: 'https://www.youtube.com/watch?v=FmUvI-S6Krk', sub: '8.9M', desc: 'El epicentro del entretenimiento urbano mundial.', ytLikes: '12M+' },
    ],
    'TOP 10': [
      { title: 'Planeta Alofoke', url: 'https://www.youtube.com/watch?v=FmUvI-S6Krk', sub: '8.9M', desc: 'Contenido #1 en tendencia.', ytLikes: '12M+' },
    ],
    'PR': [
      { title: 'Chente Ydrach', url: 'https://www.youtube.com/watch?v=9x3-C9p9_5s', sub: '1.5M', desc: 'Canal dedicado a comercios y servicios con cobertura en todo Puerto Rico.', ytLikes: '4.5M' }
    ]
  };

  const normalizeAds = (currentAds: TVAd[], isSupabase: boolean) => {
    const allRegions = [...Object.keys(REGIONES_PR), ...Object.keys(TV_ONLY_REGIONS)];
    let finalAds: TVAd[] = [];
    let adsAddedToSync: TVAd[] = [];
    let adsRemovedFromSyncIds: string[] = [];

    allRegions.forEach(region => {
      const targetCount = region === 'TOP 10' ? 20 : 20;
      const regionAds = currentAds.filter(a => a.region?.trim() === region.trim());

      const seenSlots = new Map<number, TVAd>();
      const extraAds: TVAd[] = [];

      regionAds.forEach(ad => {
        const slot = ad.slotIndex ?? -1;
        if (slot >= 0 && slot < targetCount) {
          const existing = seenSlots.get(slot);
          if (!existing) {
            seenSlots.set(slot, ad);
          } else {
            // LÓGICA DE PRIORIDAD:
            // 1. Prioridad a anuncios con contenido real sobre placeholders
            // 2. Prioridad al más recientemente creado/modificado
            // LÓGICA DE PRIORIDAD: EL MÁS NUEVO SIEMPRE GANA
            // Esto permite "borrar" un anuncio creando un registro nuevo (placeholder) vacío.
            const existingDate = new Date(existing.createdAt || 0).getTime();
            const currentDate = new Date(ad.createdAt || 0).getTime();

            const isExistingPlaceholder = existing.id.startsWith('00000000-');
            const isCurrentPlaceholder = ad.id.startsWith('00000000-');

            // PRIORIDAD: Un anuncio real (no placeholder) siempre gana a un placeholder.
            // Si ambos son del mismo tipo, gana el más reciente.
            let shouldReplace = false;
            if (isExistingPlaceholder && !isCurrentPlaceholder) {
              shouldReplace = true; // El nuevo es real, el viejo era placeholder
            } else if (!isExistingPlaceholder && isCurrentPlaceholder) {
              shouldReplace = false; // El viejo es real, el nuevo es placeholder (no reemplazar)
            } else {
              shouldReplace = currentDate >= existingDate; // Ambos iguales tipo, gana el más nuevo
            }

            if (shouldReplace) {
              extraAds.push(existing);
              seenSlots.set(slot, ad);
            } else {
              extraAds.push(ad);
            }
          }
        } else {
          extraAds.push(ad);
        }
      });

      // Recolectar IDs de anuncios extra/duplicados para borrar en la nube
      adsRemovedFromSyncIds.push(...extraAds.map(a => a.id));

      // Crear los slots faltantes
      for (let i = 0; i < targetCount; i++) {
        if (seenSlots.has(i)) {
          const ad = seenSlots.get(i)!;
          ad.slotIndex = i; // Asegurar que tenga el slotIndex correcto
          finalAds.push(ad);
        } else {
          const isTVBoricua = region === 'TV Boricua';
          const isImpulsoTV = region === 'Impulso TV';
          const isTop10 = region === 'TOP 10';

          const regionalList = !isSupabase ? (MASTER_VIDEOS[region] || []) : [];
          const videoData = regionalList[i];

          const defaultVideo = videoData ? videoData.url : "";
          const defaultName = videoData ? videoData.title :
            region === 'TOP 10' && i >= 10 ? `CARTOON PR NETWORK #${i + 1}` : `DISPONIBLE #${i + 1}`;

          const newAdId = `00000000-0000-0000-0000-${(allRegions.indexOf(region) * 100 + i).toString().padStart(12, '0')}`;
          const newAd: TVAd = {
            id: isSupabase ? newAdId : `slot-${region}-${i}-${Date.now()}`,
            businessName: defaultName,
            videoUrl: defaultVideo,
            region: region,
            town: "Puerto Rico",
            slotIndex: i,
            isPremium: true,
            isSuperAd: false,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10),
            revenue: 0,
            ctaText: region === 'TOP 10' ? "Ver" : "Más Info",
            ctaUrl: "",
            likes: 0,
            views: 0,
            directoryClicks: 0,
            ctaClicks: 0,
            isVerified: true,
            subscribers: videoData ? videoData.sub : 'Canal',
            description: videoData ? videoData.desc : 'Contenido original de Impulso TV.',
            ytLikes: '0'
          };
          finalAds.push(newAd);
          // IMPORTANTE: Solo sincronizar si NO es un placeholder automático en modo Supabase
          // Esto evita que el sistema "rellene" la nube con videos demo de forma infinita.
          if (!isSupabase) {
            adsAddedToSync.push(newAd);
          }
        }
      }
    });

    return { finalAds, adsAddedToSync, adsRemovedFromSyncIds };
  };

  const loadData = useCallback(async () => {
    if (!supabase) {
      console.log("ℹ️ MODO LOCAL: Cargando desde memoria del dispositivo...");
      let localBiz = JSON.parse(localStorage.getItem('impulso_registered_businesses') || '[]')
        .filter((b: any) => b && typeof b === 'object')
        .map((b: any) => ({
          ...b,
          trialEndsAt: b.trialEndsAt ? new Date(b.trialEndsAt) : undefined
        }));

      if (localBiz.length === 0) {
        localBiz = [{
          id: 'impulso-official-001',
          name: 'Impulso PR',
          category: '💼 Servicios Profesionales, Finanzas y B2B',
          niches: ['Desarrollo Web & Apps', 'Estrategia de Marca (Branding)'],
          town: 'Moca',
          description: 'Creador Rubén Medina. Developer of Applications. Tu infraestructura digital certificada en Puerto Rico.',
          isCertified: true,
          accessKey: 'IPR-2025',
          contact: '787-378-6170',
          status: 'premium',
          email: 'iimpulsopr@gmail.com',
          logoUrl: OFFICIAL_LOGO,
          appLink: 'https://impulsopr-tv-apps-572316843568.us-east1.run.app',
          hasAppSubscription: true,
          appCategories: ['Desarrollo Web & Apps'],
          appRegion: 'Isla 🇵🇷',
          trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }];
        localStorage.setItem('impulso_registered_businesses', JSON.stringify(localBiz));
      }

      setRegisteredBusinesses(localBiz);
      let localAds = JSON.parse(localStorage.getItem('impulso_active_ads') || '[]')
        .filter((ad: any) => ad && typeof ad === 'object');

      const seenSlots = new Set();
      localAds = localAds.filter((ad: TVAd) => {
        const key = `${ad.region}-${ad.slotIndex}`;
        if (seenSlots.has(key)) return false;
        seenSlots.add(key);
        return true;
      });

      const { finalAds } = normalizeAds(localAds, false);
      localStorage.setItem('impulso_active_ads', JSON.stringify(finalAds));
      setActiveAds(finalAds);
      setIsDataLoaded(true);
      return;
    }

    try {
      (window as any).DEBUG_LOAD_STEP = "Maestro Iniciado - Supabase Businesses Fetch";
      console.log("☁️ MODO CLOUD: Maestro Iniciado. Refrescando memoria local...");

      // REFRESCAR MEMORIA (PEDIDO USER): Limpiar caché local de anuncios antes de sincronizar
      localStorage.removeItem('impulso_active_ads');

      const { data: bizData, error: bizError } = await supabase.from('businesses').select('*');
      if (bizError) throw bizError;

      setRegisteredBusinesses(bizData ? bizData.map(mapBusinessFromDB) : []);

      const { data: adsData, error: adsError } = await supabase.from('ads').select('*').order('created_at', { ascending: true });
      if (adsError) throw adsError;

      (window as any).DEBUG_LOAD_STEP = "Supabase Ads Fetched";

      let dbAdsRaw = adsData ? adsData.map(mapAdFromDB) : [];
      console.log(`📡 Supabase: ${dbAdsRaw.length} anuncios recuperados.`);

      const { finalAds, adsAddedToSync, adsRemovedFromSyncIds } = normalizeAds(dbAdsRaw, true);

      // 1. Borrar excedentes o inconsistencias detectadas (duplicados de slots)
      if (adsRemovedFromSyncIds.length > 0) {
        console.warn(`🧹 Sincronización: Limpiando ${adsRemovedFromSyncIds.length} inconsistencias de slots en la nube.`);
        await supabase.from('ads').delete().in('id', adsRemovedFromSyncIds);
      }
      console.log("TRACE: Passed Step 1 (Delete extra ads)");
      (window as any).DEBUG_LOAD_STEP = "Paso 1: Ads limpiados";

      // 2. Insertar faltantes necesarios para completar los 20 slots
      if (adsAddedToSync.length > 0) {
        console.log(`📡 Sincronizando ${adsAddedToSync.length} nuevos espacios para completar el grid...`);
        const chunkSize = 50;
        for (let i = 0; i < adsAddedToSync.length; i += chunkSize) {
          const chunk = adsAddedToSync.slice(i, i + chunkSize);
          await supabase.from('ads').upsert(chunk.map(mapAdToDB));
        }
      }
      console.log("TRACE: Passed Step 2 (Insert missing ads)");
      (window as any).DEBUG_LOAD_STEP = "Paso 2: Ads completados";

      setActiveAds(finalAds);

      // HELPER: Timeout Wrapper para evitar que peticiones pegadas bloqueen toda la App
      const fetchWithTimeout = <T,>(promise: Promise<T>, ms: number = 15000): Promise<T> => {
        return Promise.race([
          promise,
          new Promise<T>((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), ms))
        ]);
      };
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      // 🧹 LIMPIEZA AUTOMÁTICA: Temporalmente desactivada para diagnóstico
      /*
      if (supabase) {
        supabase.from('family_statuses').delete().lt('timestamp', new Date(oneDayAgo).toISOString())
          .then(({ error }) => {
            if (!error) console.log("🧹 Limpieza Global: Registros antiguos eliminados de Supabase");
          });
      }
      */

      (window as any).DEBUG_LOAD_STEP = "Paso 3, 4, 5: Iniciando Fetches Concurrentes...";

      // Disparar las peticiones simultáneamente con timeout de 15 segundos
      const [configRes, sDataRes, prodRes] = await Promise.allSettled<any>([
        fetchWithTimeout(Promise.resolve(supabase.from('app_config').select('*').eq('id', 'global').limit(1))),
        fetchWithTimeout(Promise.resolve(supabase.from('family_statuses').select('*').gt('timestamp', oneDayAgo).order('timestamp', { ascending: false }))),
        fetchWithTimeout(Promise.resolve(supabase.from('shop_products').select('*').order('createdAt', { ascending: false })))
      ]);

      console.log("DEBUG loadData concurrent responses:", {
        configRes: { status: configRes.status, data: (configRes as any).value?.data, error: (configRes as any).value?.error || (configRes as any).reason },
        sDataRes: { status: sDataRes.status, data: (sDataRes as any).value?.data, error: (sDataRes as any).value?.error || (sDataRes as any).reason },
        prodRes: { status: prodRes.status, data: (prodRes as any).value?.data, error: (prodRes as any).value?.error || (prodRes as any).reason }
      });

      // Procesar Configuración Global
      if (configRes.status === 'fulfilled' && configRes.value && configRes.value.data && !configRes.value.error) {
        const configData = configRes.value.data[0];
        if (configData) {
          if (configData.global_slogan) setGlobalSlogan(configData.global_slogan);
          if (configData.welcome_title) setWelcomeTitle(configData.welcome_title);
          if (configData.welcome_description) setWelcomeDescription(configData.welcome_description);
          if (configData.merchant_welcome) setMerchantWelcome(configData.merchant_welcome);
          if (configData.mural_images) setSuccessGalleryImages(configData.mural_images);
          if (configData.background_images) setBackgroundImages(configData.background_images);
          if (configData.mural_links) setMuralLinks(configData.mural_links);
          if (configData.payment_links) setPaymentLinks(configData.payment_links);
          if (configData.admin_emails) setAdminEmails(configData.admin_emails);
          if (configData.global_logo) setGlobalLogo(configData.global_logo);
          if (configData.app_icon) setAppIcon(configData.app_icon);
          if (configData.admin_music_playlist) setAdminMusicUrls(configData.admin_music_playlist);
        }
      }

      // Procesar Family Statuses
      if (sDataRes.status === 'fulfilled' && sDataRes.value && sDataRes.value.data) {
        console.log(`📡 Family Statuses: ${sDataRes.value.data.length} anuncios recuperados.`);
        const mapped = sDataRes.value.data.map(mapFamilyStatusFromDB);
        setFamilyStatuses(mapped);
      }


      // Procesar Shop Products
      let loadedProducts: ShopProduct[] = [];
      if (prodRes.status === 'fulfilled' && prodRes.value && prodRes.value.data && prodRes.value.data.length > 0) {
        loadedProducts = prodRes.value.data.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt || Date.now()) }));
      } else {
        const savedProds = localStorage.getItem('impulso_shop_products');
        if (savedProds) loadedProducts = JSON.parse(savedProds).map((p: any) => ({ ...p, createdAt: new Date(p.createdAt || 0) }));
      }

      const realisticMocks: ShopProduct[] = [
        { id: '1', name: 'Premium Coffee Beans', price: 15.00, imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400', images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800'], store: 'Hacienda PR', category: 'Hogar y Cocina', niche: 'Global', externalUrl: 'https://wa.me/11234567890', status: 'open', youtubeLiveUrl: 'https://youtube.com/live/demo', createdAt: new Date(), region: 'Centro', pueblo: 'Jayuya' },
        { id: '2', name: 'Designer Cap', price: 29.99, imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=400', images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800', 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800'], store: 'Urban PR', category: 'Ropa de Hombre', niche: 'Global', externalUrl: 'https://wa.me/11234567890', status: 'busy', queueCount: 2, youtubeLiveUrl: 'https://youtube.com/live/demo2', createdAt: new Date(), region: 'Metro', pueblo: 'San Juan' },
        { id: '3', name: 'Artisan Honey', price: 12.50, imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=400', images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800'], store: 'Finca Moca', category: 'Hogar y Cocina', niche: 'Global', externalUrl: 'https://wa.me/11234567890', status: 'closed', createdAt: new Date(), region: 'Oeste', pueblo: 'Moca' },
      ];

      const baseProducts = loadedProducts.length > 0 ? loadedProducts : realisticMocks;
      const existingCategories = new Set(baseProducts.map(p => p.category));

      const getCategoryImageUrl = (category: string) => {
        const c = category.toLowerCase();
        const hash = Array.from(c).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const pick = (ids: string[]) => `https://images.unsplash.com/photo-${ids[hash % ids.length]}?q=80&w=400`;
        if (c.includes('mujer')) return pick(['1483985988355-763728e1935b', '1515886657613-9f3515b0c78f']);
        if (c.includes('hombre')) return pick(['1516257984-b1b4d707412e', '1480440263309-43c2bd652f1e']);
        return pick(['1472851294608-062f124dcb02', '1556742049-0cfed4f6a45d']);
      };

      const autoGenMocks: ShopProduct[] = SHOP_CATEGORIES
        .filter((cat: string) => cat !== 'Todo' && !existingCategories.has(cat))
        .slice(0, 10) // Limit to 10 mocks to improve performance significantly
        .map((cat: string, index: number) => {
          const catImageUrl = getCategoryImageUrl(cat);
          const regions = Object.keys(REGIONES_PR).filter(r => r !== 'PR');
          const assignedRegion = regions[index % regions.length];
          const assignedTown = REGIONES_PR[assignedRegion as keyof typeof REGIONES_PR][0];
          return {
            id: `auto-mock-${index}`,
            name: `${cat}`,
            price: 19.99 + (index % 10) * 5,
            imageUrl: catImageUrl,
            images: [catImageUrl, catImageUrl.replace('w=400', 'w=800')],
            store: 'Marca Demo Oficial',
            category: cat,
            niche: 'Global',
            externalUrl: 'https://wa.me/11234567890',
            status: 'open',
            createdAt: new Date(),
            region: assignedRegion,
            pueblo: assignedTown
          };
        });

      setShopProducts([...baseProducts, ...autoGenMocks]);

      setIsCloudMode(true);
      (window as any).DEBUG_LOAD_STEP = "¡Todo completado!";
      console.log(`🚀 Sincronización completa: ${finalAds.length} slots activos.`);
    } catch (err: any) {
      (window as any).DEBUG_LOAD_ERROR = err?.message || String(err);
      console.error("❌ Error ULTRA FATAL de Cloud Sync capturado por catch:", err);
      setRegisteredBusinesses(JSON.parse(localStorage.getItem('impulso_registered_businesses') || '[]'));
      setActiveAds(JSON.parse(localStorage.getItem('impulso_active_ads') || '[]'));

      const savedProds = localStorage.getItem('impulso_shop_products');
      if (savedProds) {
        setShopProducts(JSON.parse(savedProds).map((p: any) => ({ ...p, createdAt: new Date(p.createdAt || 0) })));
      }
    } finally {
      setIsDataLoaded(true);
    }
  }, []);

  // --- 📡 SISTEMA REAL-TIME SUPABASE (SYNC UNIVERSAL) ---
  // (Lógica movida al segundo bloque unificado abajo para evitar conflictos)



  const [promoters, setPromoters] = useState<Promoter[]>(() => {
    const saved = localStorage.getItem('impulso_promoters');
    return saved ? JSON.parse(saved) : [];
  });

  const onOpenShipModule = (module: 'music' | 'sounds' | 'alarm' | 'general') => {
    setActiveShipModule(module);
    setIsShipModalOpen(true);
  };



  useEffect(() => {
    try {
      localStorage.setItem('impulso_user_profile', JSON.stringify(globalProfile));
    } catch (e) {
      console.error("Error saving user profile to localStorage:", e);
    }
  }, [globalProfile]);

  useEffect(() => {
    if (!globalProfile?.userId || !globalProfile?.pueblo) return;
    const targetRegion = globalProfile.region || 'Metro';
    const targetPueblo = globalProfile.pueblo;

    setShopProducts(prevProducts => {
      let changed = false;
      const updated = prevProducts.map(p => {
        const isMatched = p.vendorId === globalProfile.userId || 
          (globalProfile.email && p.vendorEmail?.toLowerCase() === globalProfile.email.toLowerCase());
        
        if (isMatched) {
          if (p.region !== targetRegion || p.pueblo !== targetPueblo || p.vendorId !== globalProfile.userId) {
            changed = true;
            return {
              ...p,
              region: targetRegion,
              pueblo: targetPueblo,
              vendorId: globalProfile.userId
            };
          }
        }
        return p;
      });

      if (changed) {
        localStorage.setItem('impulso_shop_products', JSON.stringify(updated));
        if (supabase) {
          const userProds = updated.filter(p => p.vendorId === globalProfile.userId);
          if (userProds.length > 0) {
            supabase.from('shop_products')
              .upsert(userProds)
              .then(({ error }) => {
                if (error) {
                  console.error("❌ Error updating products on Supabase:", error);
                } else {
                  console.log("✅ Products auto-updated on Supabase!");
                }
              });
          }
        }
        return updated;
      }
      return prevProducts;
    });
  }, [globalProfile?.region, globalProfile?.pueblo, globalProfile?.userId, globalProfile?.email]);

  const [globalLogo, setGlobalLogo] = useState<string | null>(() => localStorage.getItem('impulso_global_logo') || OFFICIAL_LOGO);
  const [appIcon, setAppIcon] = useState<string | null>(() => localStorage.getItem('impulso_app_icon') || OFFICIAL_LOGO);
  const [adminMusicUrls, setAdminMusicUrls] = useState<{ url: string, title?: string, category?: string }[]>(() => {
    const saved = localStorage.getItem('impulso_admin_music_urls');
    if (saved) return JSON.parse(saved);
    const legacy = localStorage.getItem('impulso_music_url');
    const initial = legacy ? [{ url: legacy, title: 'Impulso PR Station', category: 'Official Broadcast' }] : [];
    // Asegurar al menos 3 slots
    while (initial.length < 3) initial.push({ url: '', title: '', category: '' });
    return initial;
  });
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const isFirstMount = useRef(true);
  const [isRadioFaded, setIsRadioFaded] = useState(false);
  const radioFadeTimeoutRef = useRef<number | null>(null);

  const startRadioFadeTimer = useCallback(() => {
    if (radioFadeTimeoutRef.current) {
      window.clearTimeout(radioFadeTimeoutRef.current);
    }
    radioFadeTimeoutRef.current = window.setTimeout(() => {
      setIsRadioFaded(true);
    }, 3000);
  }, []);

  // Controlar desvanecimiento inicial y cuando se despierta la UI
  useEffect(() => {
    if (!isUIHidden) {
      setIsRadioFaded(false);
      startRadioFadeTimer();
    }
    return () => {
      if (radioFadeTimeoutRef.current) {
        window.clearTimeout(radioFadeTimeoutRef.current);
      }
    };
  }, [isUIHidden, startRadioFadeTimer]);

  // Apagar música si el usuario la deshabilita, pero NO auto-play
  useEffect(() => {
    if (userSettings.musicEnabled === false) {
      setIsMusicPlaying(false);
    }
  }, [userSettings.musicEnabled]);

  // --- GESTIÓN DE RADIO / PLAYLIST ---
  const [activeMusicUrl, setActiveMusicUrl] = useState<string>('');

  const currentPlaylist = useMemo(() => {
    if (userSettings.musicSource === 'top10') {
      return activeAds
        .filter(ad => ad.region === 'TOP 10' && ad.videoUrl && ad.videoUrl.trim() !== '' && (ad.slotIndex === undefined || ad.slotIndex < 10))
        .map(ad => ({
          url: ad.videoUrl,
          title: ad.businessName,
          category: 'TOP 10 EXCLUSIVE'
        }));
    }
    if (userSettings.musicSource === 'original') {
      return (adminMusicUrls || [])
        .filter(u => u.url && u.url.trim() !== '')
        .map(u => ({
          url: u.url,
          title: u.title || 'Impulso PR Station',
          category: u.category || 'Official Broadcast'
        }));
    }
    if (userSettings.musicSource === 'custom') {
      const folders = userSettings.customMusicFolders || [];
      const activeFolder = folders.find(f => f.id === userSettings.activeFolderId);
      if (activeFolder) {
        return activeFolder.tracks
          .filter(u => u.url && u.url.trim() !== '')
          .map(u => ({
            url: u.url,
            title: u.title || 'Custom Track',
            category: activeFolder.name
          }));
      }
      return (userSettings.customMusicUrls || [])
        .filter(u => u.url && u.url.trim() !== '')
        .map(u => ({
          url: u.url,
          title: u.title || 'Custom Track',
          category: u.category || 'My Mix'
        }));
    }
    return [];
  }, [userSettings.musicSource, userSettings.customMusicUrls, userSettings.customMusicFolders, userSettings.activeFolderId, activeAds, adminMusicUrls]);

  const pickNextMusic = useCallback((forcePlay: boolean = true) => {
    const playlist = currentPlaylist;

    if (playlist.length === 0) {
      setActiveMusicUrl(userSettings.musicSource === 'original' && adminMusicUrls[0]?.url ? adminMusicUrls[0].url : '');
      return;
    }

    if (userSettings.musicRepeatMode === 'one') {
      // Force reload without double-state flicker: strip old ts param and add a fresh one
      const base = (activeMusicUrl || adminMusicUrls[0]?.url || '').split('&_ts=')[0].split('?_ts=')[0];
      const sep = base.includes('?') ? '&' : '?';
      setActiveMusicUrl(`${base}${sep}_ts=${Date.now()}`);
      if (forcePlay) setIsMusicPlaying(true);
      return;
    }

    let nextUrl: string;
    if (userSettings.musicShuffleMode) {
      let next = activeMusicUrl;
      if (playlist.length > 1) {
        let attempts = 0;
        while (next === activeMusicUrl && attempts < 10) {
          next = playlist[Math.floor(Math.random() * playlist.length)].url;
          attempts++;
        }
      } else {
        next = playlist[0].url;
      }
      nextUrl = next;
    } else {
      const currentIndex = playlist.findIndex(t => t.url === activeMusicUrl);
      if (currentIndex === playlist.length - 1 && userSettings.musicRepeatMode === 'none') {
        setIsMusicPlaying(false);
        return;
      }
      const nextIndex = (currentIndex + 1) % playlist.length;
      nextUrl = playlist[nextIndex].url;
    }
    setActiveMusicUrl(nextUrl);
    if (forcePlay) setIsMusicPlaying(true);
  }, [currentPlaylist, userSettings.musicShuffleMode, userSettings.musicRepeatMode, adminMusicUrls, activeMusicUrl, userSettings.musicSource]);

  const pickPreviousMusic = useCallback(() => {
    const playlist = currentPlaylist;
    if (playlist.length === 0) return;

    if (userSettings.musicShuffleMode) {
      pickNextMusic();
    } else {
      const currentIndex = playlist.findIndex(t => t.url === activeMusicUrl);
      const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
      setActiveMusicUrl(playlist[prevIndex].url);
    }
  }, [currentPlaylist, userSettings.musicShuffleMode, activeMusicUrl, pickNextMusic]);

  // Inicializar o re-sincronizar si cambia el playlist
  useEffect(() => {
    const playlist = currentPlaylist;

    if (playlist.length > 0) {
      const urls = playlist.map(t => t.url);
      if (!urls.includes(activeMusicUrl) && userSettings.musicRepeatMode !== 'one') {
        if (userSettings.musicSource === 'original' && playlist[0]) {
          setActiveMusicUrl(playlist[0].url);
        } else {
          pickNextMusic(isMusicPlaying);
        }
      }
    } else if (userSettings.musicRepeatMode !== 'one') {
      // Solo permitimos el fallback al URL oficial si el origen es 'original'
      setActiveMusicUrl(userSettings.musicSource === 'original' && adminMusicUrls[0]?.url ? adminMusicUrls[0].url : '');
    }
  }, [currentPlaylist, userSettings.musicSource, adminMusicUrls, pickNextMusic, activeMusicUrl, userSettings.musicRepeatMode, isMusicPlaying]);

  const finalMusicUrl = activeMusicUrl || (userSettings.musicSource === 'original' ? (adminMusicUrls[0]?.url || '') : '');

  const isEnglish = userSettings.language === 'en';

  const currentTrackMetadata = useMemo(() => {
    const track = currentPlaylist.find(t => t.url === activeMusicUrl);
    if (track) return track;
    if (userSettings.musicSource === 'original' && adminMusicUrls[0]?.url) {
      return adminMusicUrls[0];
    }
    return { url: '', title: isEnglish ? 'SIGNAL LOST' : 'SEÑAL PERDIDA', category: 'Sync Error' };
  }, [currentPlaylist, activeMusicUrl, userSettings.musicSource, adminMusicUrls, isEnglish]);

  // Firebase Messaging: Escucha en primer plano
  useEffect(() => {
    if (messaging) {
      onMessage(messaging, (payload: any) => {
        console.log('Message received. ', payload);
        // Si el mensaje es una alerta o alarma, podemos forzar un sonido melódico
        playBeep('sonar');
      });
    }
  }, []);

  const [successGalleryImages, setSuccessGalleryImages] = useState<string[]>(() => {
    const saved = localStorage.getItem('impulso_mural_images');
    return saved ? JSON.parse(saved) : [OFFICIAL_MURAL, '', '', '', ''];
  });

  const [backgroundImages, setBackgroundImages] = useState<string[]>(() => {
    const savedBg = localStorage.getItem('impulso_background_images');
    if (savedBg) return JSON.parse(savedBg);
    return [OFFICIAL_MURAL, OFFICIAL_MURAL_2];
  });

  useEffect(() => {
    if (!globalLogo || (!globalLogo.startsWith('http') && !globalLogo.startsWith('data:') && !globalLogo.startsWith('/')) || globalLogo.includes('null') || globalLogo.length < 5) {
      setGlobalLogo(OFFICIAL_LOGO);
      setAppIcon(OFFICIAL_LOGO);
    }
  }, [globalLogo]);

  useEffect(() => {
    if (activePromoter) localStorage.setItem('impulso_active_promoter', JSON.stringify(activePromoter));
    else localStorage.removeItem('impulso_active_promoter');
  }, [activePromoter]);

  const playBeep = useCallback((mode?: string) => {
    if (userSettings.soundsEnabled) {
      let soundPath = '';
      const finalMode = mode || userSettings.soundMode;

      switch (finalMode) {
        case 'pop': soundPath = '/sounds/freesound_community-pop-39222.mp3?v=3'; break;
        case 'click': soundPath = '/sounds/freesound_community-click-47609.mp3?v=3'; break;
        case 'digital-click': soundPath = '/sounds/creatorshome-digital-click-357350.mp3?v=3'; break;
        case 'mouse-click': soundPath = '/sounds/film-special-effects-computer-mouse-click-351398.mp3?v=3'; break;
        case 'beep': soundPath = '/sounds/beep.mp3?v=3'; break;
        case 'sonar': soundPath = '/sounds/sonar.mp3?v=3'; break;
        case 'ai': soundPath = '/sounds/impulso_space.mp3?v=3'; break;
        case 'melody': soundPath = '/sounds/impulso_melody_alarm.mp3?v=3'; break;
        case 'rocket': soundPath = '/sounds/rocket_launch.mp3?v=3'; break;
        case 'level-up': soundPath = '/sounds/tithuh-click-level-up-524643.mp3?v=3'; break;
        case 'random':
        default:
          const sounds = ['/sounds/beep.mp3?v=3', '/sounds/freesound_community-click-47609.mp3?v=3', '/sounds/sonar.mp3?v=3'];
          soundPath = sounds[Math.floor(Math.random() * sounds.length)];
          break;
      }
      const audio = new Audio(soundPath);
      audio.volume = finalMode === 'rocket' ? 0.7 : 0.4;
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
  }, [userSettings.soundsEnabled, userSettings.soundMode]);

  // Hack avanzado para evitar que iOS/Android suspendan el app en segundo plano
  useEffect(() => {
    try {
      Object.defineProperty(document, 'hidden', { value: false, writable: false });
      Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: false });
    } catch (e) {}

    const silentAudio = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=");
    silentAudio.loop = true;
    silentAudio.volume = 0;
    
    const playSilent = () => {
      silentAudio.play().catch(()=>{});
      document.removeEventListener('click', playSilent);
      document.removeEventListener('touchstart', playSilent);
    };
    
    document.addEventListener('click', playSilent);
    document.addEventListener('touchstart', playSilent);
    
    return () => {
      silentAudio.pause();
    };
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!userSettings.soundsEnabled) return;
      const target = e.target as HTMLElement;

      const hasReactOnClick = (el: HTMLElement | null): boolean => {
        if (!el || el === document.body || el === document.documentElement) return false;
        const key = Object.keys(el).find(k => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$') || k.startsWith('__reactFiber$'));
        if (key && (el as any)[key]) {
          const props = (el as any)[key].memoizedProps || (el as any)[key];
          if (props && typeof props.onClick === 'function') return true;
        }
        return hasReactOnClick(el.parentElement);
      };

      const isInteractive = target.closest('button') || 
                            target.closest('a') || 
                            target.closest('select') || 
                            target.closest('.cursor-pointer') || 
                            target.closest('[role="button"]') || 
                            target.closest('[role="tab"]') || 
                            target.closest('[role="switch"]') || 
                            (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'text') ||
                            hasReactOnClick(target);
      
      if (isInteractive && !target.closest('.no-sound')) {
        playBeep();
      }
    };
    document.addEventListener('click', handleGlobalClick, true);
    return () => document.removeEventListener('click', handleGlobalClick, true);
  }, [userSettings.soundsEnabled, userSettings.soundMode, playBeep]);

  useEffect(() => {
    localStorage.setItem('impulso_user_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  const [globalSlogan, setGlobalSlogan] = useState<string>(() => localStorage.getItem('impulso_global_slogan') || 'Tu Marca Certificada • Confianza Boricua 🇵🇷');
  const [welcomeTitle, setWelcomeTitle] = useState<string>(() => localStorage.getItem('impulso_welcome_title') || 'Impulso PR & TV');
  const [welcomeDescription, setWelcomeDescription] = useState<string>(() => localStorage.getItem('impulso_welcome_description') || 'La plataforma inteligente para potenciar el comercio local y pautar tu marca con impacto visual.');
  const [merchantWelcome, setMerchantWelcome] = useState<string>(() => localStorage.getItem('impulso_merchant_welcome') || '🇵🇷 ¡Bienvenido a Impulso PR! \n\nEstamos aquí para respaldar tu negocio local.');
  const [muralLinks, setMuralLinks] = useState<string[]>(() => {
    const saved = localStorage.getItem('impulso_mural_links');
    return saved ? JSON.parse(saved) : ['', '', '', '', ''];
  });

  const [paymentLinks, setPaymentLinks] = useState<PaymentLinks>(() => {
    const saved = localStorage.getItem('impulso_payment_links');
    return saved ? JSON.parse(saved) : { athMovil: '', stripe: '', paypal: '', crypto: '' };
  });
  const [adminEmails, setAdminEmails] = useState<AdminEmails>(() => {
    const saved = localStorage.getItem('impulso_admin_emails');
    return saved ? JSON.parse(saved) : { main: '', accountant: '' };
  });

  useEffect(() => {
    const syncConfig = async () => {
      if (supabase && isCloudMode) {
        await supabase.from('app_config').upsert({
          id: 'global',
          global_slogan: globalSlogan,
          welcome_title: welcomeTitle,
          welcome_description: welcomeDescription,
          merchant_welcome: merchantWelcome,
          mural_images: successGalleryImages,
          background_images: backgroundImages,
          mural_links: muralLinks,
          payment_links: paymentLinks,
          admin_emails: adminEmails,
          global_logo: globalLogo,
          app_icon: appIcon,
          admin_music_playlist: adminMusicUrls,
          updated_at: new Date().toISOString()
        });
      }
    };

    // Solo sincronizar si los datos iniciales ya se cargaron para evitar sobreescribir con valores por defecto vacíos
    if (isDataLoaded) {
      localStorage.setItem('impulso_global_slogan', globalSlogan);
      localStorage.setItem('impulso_welcome_title', welcomeTitle);
      localStorage.setItem('impulso_welcome_description', welcomeDescription);
      localStorage.setItem('impulso_merchant_welcome', merchantWelcome);
      localStorage.setItem('impulso_mural_images', JSON.stringify(successGalleryImages));
      localStorage.setItem('impulso_background_images', JSON.stringify(backgroundImages));
      localStorage.setItem('impulso_mural_links', JSON.stringify(muralLinks));
      localStorage.setItem('impulso_payment_links', JSON.stringify(paymentLinks));
      localStorage.setItem('impulso_admin_emails', JSON.stringify(adminEmails));
      localStorage.setItem('impulso_global_logo', globalLogo || '');
      localStorage.setItem('impulso_app_icon', appIcon || '');
      localStorage.setItem('impulso_admin_music_urls', JSON.stringify(adminMusicUrls));
      localStorage.setItem('impulso_music_url', (adminMusicUrls || [])[0]?.url || '');

      syncConfig();
    }
  }, [globalSlogan, welcomeTitle, welcomeDescription, merchantWelcome, successGalleryImages, backgroundImages, muralLinks, paymentLinks, adminEmails, globalLogo, appIcon, adminMusicUrls, isDataLoaded, isCloudMode]);

  useEffect(() => {
    loadData();
    // Refresh automático de 5 minutos ELIMINADO para evitar sobreescritura de datos

    // TIMER DE SEGURIDAD (BOTÓN DE PÁNICO):
    // Si en 15 segundos no ha cargado, mostramos el botón de refresco total.
    const loadingTimeout = setTimeout(() => {
      if (!isDataLoaded) {
        console.warn("⚠️ Tiempo de carga excedido. Mostrando opción de recuperación...");
        setShowSyncError(true);
      }
    }, 15000);

    return () => clearTimeout(loadingTimeout);
  }, [loadData, isDataLoaded]);


  // --- LIMPIEZA ÚNICA TRAS MIGRACIÓN / RESET ---
  useEffect(() => {
    if (!localStorage.getItem('impulso_reset_sync_v1')) {
      console.warn("🧹 Realizando limpieza profunda de memoria local...");
      localStorage.removeItem('impulso_active_ads');
      localStorage.setItem('impulso_reset_sync_v1', 'true');
      window.location.reload();
    }
  }, []);

  // --- REALTIME SUBSCRIPTION (SUPABASE) ---
  useEffect(() => {
    if (!supabase || !isCloudMode) return;

    const channel = supabase
      .channel('db-ads-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ads' },
        (payload) => {
          console.log('🔔 Cambio en base de datos detectado en tiempo real:', payload.eventType);
          if (payload.new && (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE')) {
            const remoteAd = mapAdFromDB(payload.new);
            setActiveAds(prev => {
              const exists = prev.find(a => a.id === remoteAd.id);
              if (exists) {
                // Solo actualizar si realmente cambió algo para evitar loops
                return prev.map(a => a.id === remoteAd.id ? remoteAd : a);
              }
              return [...prev, remoteAd];
            });
          } else if (payload.eventType === 'DELETE' && payload.old) {
            setActiveAds(prev => prev.filter(a => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [isCloudMode]);

  // --- REALTIME SUBSCRIPTION (FAMILY) ---
  useEffect(() => {
    if (!supabase || !isCloudMode) return;

    const sChannel = supabase
      .channel('family_statuses_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'family_statuses' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const nS = mapFamilyStatusFromDB(payload.new);
          setFamilyStatuses(prev => [nS, ...prev.filter(s => s.id !== nS.id)].slice(0, 50));
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setFamilyStatuses(prev => prev.filter(s => s.id !== payload.old.id));
        }
      }).subscribe();

    const pChannel = supabase
      .channel('shop_products_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_products' }, payload => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const nP = { ...payload.new, createdAt: new Date(payload.new.createdAt || Date.now()) } as ShopProduct;
          setShopProducts(prev => {
            const exists = prev.find(p => p.id === nP.id);
            if (exists) return prev.map(p => p.id === nP.id ? nP : p);
            return [nP, ...prev];
          });
        } else if (payload.eventType === 'DELETE' && payload.old) {
          setShopProducts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      }).subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(sChannel);
        supabase.removeChannel(pChannel);
      }
    };
  }, [isCloudMode]);

  // --- DETECCIÓN DE ENLACES INTELIGENTES (DEEP LINKING) ---
  useEffect(() => {
    if (!isDataLoaded) return;
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const regionParam = params.get('region');
    const videoIndexParam = params.get('v');
    const productParam = params.get('product');

    if (viewParam) {
      if (viewParam === 'TV') {
        const region = regionParam;
        const miniChannel = parseInt(videoIndexParam || '1');
        if (region) handleDirectTune(region as any, miniChannel);
        else handleNavigate(AppView.TV);
      } else if (viewParam === 'SHOP') {
        handleNavigate(AppView.SHOP);
        if (productParam) {
          setInitialOpenProductId(productParam);
        }
      } else if (viewParam === 'FAMILY') {
        handleNavigate(AppView.FAMILY);
      } else if (viewParam === 'PR') {
        handleNavigate(AppView.PR);
      } else if (viewParam === 'APPS') {
        handleNavigate(AppView.APPS);
      } else if (viewParam === 'ADMIN') {
        handleNavigate(AppView.ADMIN);
      }

      // Limpiamos la URL para evitar re-navegación al refrescar e historia limpia
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [isDataLoaded]);

  // --- SYNC METADATA DINÁMICA DE COMPARTIR Y SEO ---
  useEffect(() => {
    let title = 'Impulso PR & TV';
    let description = 'Infraestructura Digital de Puerto Rico';
    let imageUrl = '/logo.png';
    let shareUrl = window.location.origin + window.location.pathname;

    if (currentView === AppView.SHOP) {
      title = 'Impulso Shop ON!';
      description = 'Marketplace de Conexión Local en Puerto Rico. ¡Entra directamente a Shop ON!';
      imageUrl = paymentLinks?.shopOnLogo || '/impulso_shop_on_logo_final.png';
      shareUrl = `${window.location.origin}${window.location.pathname}?view=SHOP`;
    } else if (currentView === AppView.PR) {
      title = 'Impulso PR';
      description = 'Directorio y Chat de Inteligencia Artificial para Puerto Rico. ¡Entra directamente a Impulso PR!';
      imageUrl = globalLogo || '/logo.png';
      shareUrl = `${window.location.origin}${window.location.pathname}?view=PR`;
    } else if (currentView === AppView.TV) {
      title = 'Impulso TV';
      description = '¡Mira canales locales en vivo y anuncios interactivos en Impulso TV!';
      imageUrl = paymentLinks?.tvLogo || '/brand_tv.jpg';
      shareUrl = `${window.location.origin}${window.location.pathname}?view=TV`;
    } else if (currentView === AppView.APPS) {
      title = 'Impulso Apps';
      description = 'El App Center Service de Puerto Rico. ¡Entra directamente a Impulso Apps!';
      imageUrl = paymentLinks?.appLogo || '/images/astronaut-apps.jpg';
      shareUrl = `${window.location.origin}${window.location.pathname}?view=APPS`;
    } else if (currentView === AppView.FAMILY) {
      title = 'Impulso Family';
      description = 'Muro Social y Conexión de Puerto Rico. ¡Entra directamente a Impulso Family!';
      imageUrl = paymentLinks?.familyLogo || '/logo.png';
      shareUrl = `${window.location.origin}${window.location.pathname}?view=FAMILY`;
    }

    // Actualizar document title
    document.title = title;

    // Actualizar meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Actualizar og:title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);

    // Actualizar og:description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);

    // Actualizar og:image
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', imageUrl);

    // Actualizar og:url
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', shareUrl);
  }, [currentView, paymentLinks?.shopOnLogo, paymentLinks?.tvLogo, paymentLinks?.appLogo, paymentLinks?.familyLogo, globalLogo]);

  const handleRegisterBusiness = async (biz: Business) => {
    let finalBiz = { ...biz };
    setRegisteredBusinesses(prev => {
      const exists = prev.find(b => b.id === finalBiz.id);
      const updated = exists ? prev.map(b => b.id === finalBiz.id ? finalBiz : b) : [finalBiz, ...prev];
      if (supabase && isCloudMode) supabase.from('businesses').upsert([mapBusinessToDB(finalBiz)]).then();
      else localStorage.setItem('impulso_registered_businesses', JSON.stringify(updated));
      return updated;
    });
    setBusinessToEdit(null);
  };

  const handleDeleteBusiness = async (id: string) => {
    setRegisteredBusinesses(prev => {
      const updated = prev.filter(b => b.id !== id);
      if (supabase && isCloudMode) supabase.from('businesses').delete().eq('id', id).then();
      else localStorage.setItem('impulso_registered_businesses', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRegisterAd = async (newAd: TVAd) => {
    if (activePromoter) newAd.promoterCode = activePromoter.code;

    // 1. Actualización local inmediata de la UI
    setActiveAds(prev => {
      const exists = prev.find(ad => ad.id === newAd.id);
      const updatedList = exists ? prev.map(ad => ad.id === newAd.id ? newAd : ad) : [...prev, newAd];

      // Si no hay nube, guardamos en local ahora
      if (!supabase || !isCloudMode) {
        localStorage.setItem('impulso_active_ads', JSON.stringify(updatedList));
      }
      return updatedList;
    });

    // 2. Sincronización directa con Supabase (Señal Directa)
    if (supabase && isCloudMode) {
      try {
        const dbReadyAd = mapAdToDB(newAd);
        console.log(`📡 Enviando señal directa a Supabase (Upsert): ${newAd.businessName}`);

        // Intentar el upsert
        const { error } = await supabase.from('ads').upsert([dbReadyAd]);

        if (error) {
          console.error("❌ Error de Supabase:", error);
          alert(`⚠️ ERROR DE SINCRONIZACIÓN: No se pudo guardar "${newAd.businessName}" en la nube. Por favor, verifica tu conexión e intenta de nuevo.`);
          throw error;
        }

        console.log("✅ Señal de registro sincronizada con éxito.");
      } catch (err) {
        console.error("❌ Error fatal en la señal directa (Upsert):", err);
        // Opcional: Podríamos revertir el cambio local si falla el remoto, 
        // pero por ahora alertar al usuario es la prioridad #1.
      }
    }
  };

  const handleDeleteAd = async (id: string) => {
    // 1. Actualización local inmediata
    setActiveAds(prev => {
      const updated = prev.filter(ad => ad.id !== id);
      if (!supabase || !isCloudMode) {
        localStorage.setItem('impulso_active_ads', JSON.stringify(updated));
      }
      return updated;
    });

    // 2. Señal directa de borrado
    if (supabase && isCloudMode) {
      try {
        console.log(`🧹 Enviando señal directa de borrado a la nube: ${id}`);
        const { error } = await supabase.from('ads').delete().eq('id', id);
        if (error) throw error;
        console.log("✅ Borrado sincronizado con éxito.");
      } catch (err) {
        console.error("❌ Error en la señal de borrado:", err);
      }
    }
  };

  const handleUpdateAdSlot = (region: string, slotIndex: number, videoUrl: string, businessName: string, extra?: Partial<TVAd>) => {
    const existingAd = activeAds.find(a => a.region === region && a.slotIndex === slotIndex);
    if (existingAd) {
      const updatedAd = { ...existingAd, videoUrl, businessName, createdAt: new Date(), ...extra };
      // Si el nombre dice DISPONIBLE, reseteamos la verificación
      if (businessName.includes('DISPONIBLE')) {
        updatedAd.isVerified = false;
      }
      handleRegisterAd(updatedAd);
    } else {
      const newAd: TVAd = {
        id: crypto.randomUUID(),
        region,
        slotIndex,
        videoUrl,
        businessName,
        town: "Puerto Rico",
        isPremium: true,
        isVerified: false, // Por defecto los del Panel Admin no son verificados
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10),
        revenue: 0,
        ctaText: "Más Información",
        ctaUrl: "",
        likes: 0,
        ...extra
      };
      handleRegisterAd(newAd);
    }
  };

  const handleResetTVDefaults = async () => {
    // 1. Limpieza total de los canales seleccionados en la Nube / Local
    const regionsToReset = ['Impulso TV', 'TV Boricua', 'TOP 10'];

    if (confirm("⚠️ ¿Estás seguro? Se borrarán todos los enlaces actuales de estos canales para resetearlos a 'Disponible'.")) {

      // Filtrar localmente
      setActiveAds(prev => prev.filter(ad => !regionsToReset.includes(ad.region)));

      if (supabase && isCloudMode) {
        // Borrar de Supabase permanentemente
        await supabase.from('ads').delete().in('region', regionsToReset);
      } else {
        localStorage.setItem('impulso_active_ads', JSON.stringify(activeAds.filter(ad => !regionsToReset.includes(ad.region))));
      }

      // 2. Forzar regeneración de slots vacíos
      window.location.reload(); // Recargar para que loadData haga la purga y el re-init limpio
    }
  };

  const handleTrackMetric = useCallback(async (adId: string, metric: 'views' | 'directoryClicks' | 'ctaClicks' | 'likes') => {
    setActiveAds(prev => {
      const updated = prev.map(ad => {
        if (ad.id === adId) {
          const newMetrics = { ...ad, views: metric === 'views' ? (ad.views || 0) + 1 : ad.views, directoryClicks: metric === 'directoryClicks' ? (ad.directoryClicks || 0) + 1 : ad.directoryClicks, ctaClicks: metric === 'ctaClicks' ? (ad.ctaClicks || 0) + 1 : ad.ctaClicks, likes: metric === 'likes' ? (ad.likes || 0) + 1 : ad.likes };
          if (supabase && isCloudMode) supabase.from('ads').update(mapAdToDB(newMetrics)).eq('id', adId).then();
          return newMetrics;
        }
        return ad;
      });
      return updated;
    });
  }, [isCloudMode]);

  const handleRegisterPromoter = (promoter: Promoter) => {
    setPromoters(prev => {
      const updated = [...prev, promoter];
      localStorage.setItem('impulso_promoters', JSON.stringify(updated));
      return updated;
    });
  };

  const handleProductUpload = (email: string, product: Partial<ShopProduct>) => {
    if (!email) return;

    setSellers(prev => {
      const existingSeller = prev.find(s => s.email.toLowerCase() === email.toLowerCase());
      let updatedSellers: Seller[];

      if (existingSeller) {
        // Increment product count for existing seller
        updatedSellers = prev.map(s =>
          s.id === existingSeller.id
            ? { ...s, productsCount: (s.productsCount || 0) + 1 }
            : s
        );
      } else {
        // Generate new 4-digit PIN for first-time seller
        const newPin = Math.floor(1000 + Math.random() * 9000).toString();
        const newSeller: Seller = {
          id: Math.random().toString(36).substring(2, 9),
          email: email.toLowerCase(),
          pin: newPin,
          productsCount: 1,
          joinedAt: new Date()
        };

        updatedSellers = [...prev, newSeller];

        // Simular envío de PIN por email
        alert(`🚀 ¡BIENVENIDO A SHOP ON!\nHemos generado tu PIN de Gerencia: ${newPin}\n(Enviado a ${email})`);
        console.log(`📩 [EMAIL SYSTEM] PIN for ${email}: ${newPin}`);
      }

      localStorage.setItem('impulso_sellers', JSON.stringify(updatedSellers));
      return updatedSellers;
    });
  };

  const calculateListingFee = (price: number) => {
    if (!price || price <= 0) return 0;
    if (price < 10) return 0.99;
    if (price < 50) return 2.99;
    if (price < 100) return 5.99;
    return 9.99;
  };

  const handleFileUpload = (file: File | null | undefined, callback: (base64: string) => void) => {
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        alert("La imagen es muy pesada. Máximo 15MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_width = 500;
          const max_height = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_width) {
              height = Math.round((height * max_width) / width);
              width = max_width;
            }
          } else {
            if (height > max_height) {
              width = Math.round((width * max_height) / height);
              height = max_height;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.55);
            callback(compressed);
          } else {
            callback(base64Str);
          }
        };
        img.onerror = () => {
          callback(base64Str);
        };
        img.src = base64Str;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAppProductUpload = (email?: string, prod?: Partial<ShopProduct>) => {
    const activeProd = prod || newProduct;
    const activeEmail = email || vendorEmail;

    const activeStore = globalProfile?.isVendor ? (globalProfile.storeName || activeProd.store) : activeProd.store;
    if (!activeProd.name || !activeProd.price || !activeStore || !activeProd.imageUrl) return;

    const isEdit = !!activeProd.id;
    const product: ShopProduct = {
      ...activeProd,
      id: activeProd.id || crypto.randomUUID(),
      vendorId: globalProfile?.userId || activeProd.vendorId || 'unknown-vendor-id',
      name: activeProd.name!,
      price: Number(activeProd.price),
      store: activeStore!,
      category: activeProd.category || SHOP_CATEGORIES[1],
      niche: 'Global',
      imageUrl: activeProd.imageUrl!,
      externalUrl: activeProd.externalUrl || '',
      contactInfo: globalProfile?.phone || activeProd.contactInfo || '',
      description: activeProd.description || '',
      images: activeProd.images || [activeProd.imageUrl!, activeProd.imageUrl!],
      vendorEmail: activeEmail.trim() || globalProfile?.email || '',
      region: activeProd.region || globalProfile?.region || 'Metro',
      pueblo: activeProd.pueblo || globalProfile?.pueblo || 'P.R.',
      shippingCost: activeProd.shippingCost !== undefined ? Number(activeProd.shippingCost) : undefined,
      ivu: activeProd.ivu !== undefined ? Number(activeProd.ivu) : undefined,
      status: activeProd.status,
      queueCount: activeProd.queueCount,
      createdAt: activeProd.createdAt ? new Date(activeProd.createdAt) : new Date()
    };

    if (!isEdit) {
      handleProductUpload(product.vendorEmail || globalProfile?.email || '', product);
    }

    let updated: ShopProduct[];
    if (isEdit) {
      updated = shopProducts.map(p => p.id === product.id ? product : p);
    } else {
      updated = [product, ...shopProducts];
    }
    setShopProducts(updated);
    
    // SYNC TO SUPABASE WITH DIAGNOSTICS
    if (supabase) {
      supabase.from('shop_products')
        .upsert([product])
        .then(({ error }) => {
          if (error) {
            console.error("❌ Error uploading product to Supabase:", error);
            alert(`⚠️ Error al sincronizar el producto en la nube:\nCódigo: ${error.code || 'Desconocido'}\nMensaje: ${error.message}\n\n(El producto se guardó localmente en este dispositivo, pero no se mostrará a los demás hasta corregir esto).`);
          } else {
            console.log("✅ Product successfully synced to Supabase!");
          }
        });
    }

    // SEND REAL-TIME NOTIFICATION TO FIRESTORE (ONLY FOR NEW PRODUCTS)
    if (db && !isEdit) {
      addDoc(collection(db, "notifications"), {
        category: 'biz',
        source: activeStore || 'Tienda',
        message: `Nuevo Producto: ${product.name} - $${product.price.toFixed(2)} en ${activeStore}`,
        region: product.region,
        town: product.pueblo,
        timestamp: new Date()
      }).catch(err => console.error("❌ Error writing notification to Firestore:", err));
    }

    localStorage.setItem('impulso_shop_products', JSON.stringify(updated));
    setShowAddProductModal(false);
    playBeep('level-up');
    setNewProduct({
      name: '',
      price: 0,
      store: globalProfile?.storeName || '',
      category: SHOP_CATEGORIES[1],
      niche: 'Global',
      imageUrl: '',
      externalUrl: '',
      description: '',
      vendorEmail: globalProfile?.email || ''
    });
    setVendorEmail(globalProfile?.email || '');
  };

  const handleStoreStatusChange = async (status: 'open' | 'busy' | 'closing' | 'closed', queueCount: number, options?: { closingTimeLabel?: string, overtimeQueueLimit?: number, scheduleDays?: string[], scheduleOpen?: string, scheduleClose?: string }) => {
    if (!globalProfile) return;

    const vendorEmail = globalProfile.email;
    const vendorId = globalProfile.userId;

    const userProds = shopProducts.filter(p => p.vendorId === vendorId || (vendorEmail && p.vendorEmail?.toLowerCase() === vendorEmail.toLowerCase()));
    if (userProds.length === 0) return;

    const updatedProducts = shopProducts.map(p => {
      const isOwner = p.vendorId === vendorId || (vendorEmail && p.vendorEmail?.toLowerCase() === vendorEmail.toLowerCase());
      if (isOwner) {
        return {
          ...p,
          status,
          queueCount,
          overtimeQueueLimit: options?.overtimeQueueLimit !== undefined ? options.overtimeQueueLimit : p.overtimeQueueLimit,
          scheduleDays: options?.scheduleDays !== undefined ? options.scheduleDays : p.scheduleDays,
          scheduleOpen: options?.scheduleOpen !== undefined ? options.scheduleOpen : p.scheduleOpen,
          scheduleClose: options?.scheduleClose !== undefined ? options.scheduleClose : p.scheduleClose
        };
      }
      return p;
    });

    setShopProducts(updatedProducts);
    localStorage.setItem('impulso_shop_products', JSON.stringify(updatedProducts));

    if (supabase) {
      const updatedUserProds = updatedProducts.filter(p => p.vendorId === vendorId || (vendorEmail && p.vendorEmail?.toLowerCase() === vendorEmail.toLowerCase()));
      const { error } = await supabase.from('shop_products').upsert(updatedUserProds);
      if (error) {
        console.error("❌ Error syncing store status to Supabase:", error);
      } else {
        console.log("✅ Store status successfully synced to Supabase for all products!");
      }
    }

    if (db) {
      let statusStr = 'Abierta 🟢';
      if (status === 'busy') statusStr = `Ocupada 🟡 (Cola: ${queueCount})`;
      if (status === 'closed') statusStr = `Cerrada 🔴${options?.closingTimeLabel ? ` (Reabre: ${options?.closingTimeLabel})` : ''}`;

      addDoc(collection(db, "notifications"), {
        category: 'biz',
        source: globalProfile.storeName || 'Tienda',
        message: `La tienda "${globalProfile.storeName || 'Mi Tienda'}" ahora está ${statusStr}`,
        region: globalProfile.region || 'Metro',
        town: globalProfile.pueblo || 'P.R.',
        timestamp: new Date()
      }).catch(err => console.error("❌ Error writing store status notification to Firestore:", err));
    }
  };

  const handleUpdateSeller = (id: string, updates: Partial<Seller>) => {
    setSellers(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      localStorage.setItem('impulso_sellers', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteFamilyStatus = async (id: string) => {
    if (confirm("⚠️ ¿Estás seguro de borrar permanentemente este Súper Anuncio de la nube?")) {
      try {
        if (supabase && isCloudMode) {
          const { error } = await supabase.from('family_statuses').delete().eq('id', id);
          if (error) throw error;
        }
        setFamilyStatuses(prev => prev.filter(s => s.id !== id));
        alert("✅ Anuncio borrado de la nube con éxito.");
      } catch (err: any) {
        alert("❌ Error al borrar el anuncio: " + err.message);
      }
    }
  };

  const handleClearAllFamilyStatuses = async () => {
    if (confirm("🚨 ¿ESTÁS SEGURO? Esto borrará TODOS los Súper Anuncios de la base de datos global.")) {
      try {
        if (supabase && isCloudMode) {
          const { error } = await supabase.from('family_statuses').delete().gte('timestamp', 0);
          if (error) throw error;
        }
        setFamilyStatuses([]);
        alert("✅ Todos los anuncios han sido purgados.");
      } catch (err: any) {
        alert("❌ Error al purgar: " + err.message);
      }
    }
  };


  const handleUpdateFamilyStatus = async (id: string, updates: Partial<FamilyStatus>) => {
    setFamilyStatuses(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      if (supabase && isCloudMode) supabase.from('family_statuses').update(updates).eq('id', id).then();
      return updated;
    });
  };

  const [isRadioBuffering, setIsRadioBuffering] = useState(false);
  const [radioSeekTo, setRadioSeekTo] = useState<number | undefined>(undefined);

  const handleSeek = (time: number) => {
    setRadioSeekTo(time);
  };

  const handleNavigate = (view: AppView) => {
    // Si navegamos a cualquier vista que NO sea SHOP, reseteamos el flag del modal
    if (view !== AppView.SHOP) setShouldOpenShopAddModal(false);

    // Sincronizar estado de modal legado para compatibilidad con componentes que aún lo usen
    if (view === AppView.FAMILY) setShowFamilyModal(true);
    else setShowFamilyModal(false);

    if (view === AppView.PR) {
      setActivePRTab(PRTab.TOWNS);
    }

    setViewHistory(prev => {
      const last = prev[prev.length - 1];
      if (last === view) return prev;

      window.history.pushState({ view }, '', '');

      const newHistory = [...prev, view];
      if (newHistory.length > 5) {
        return [AppView.HOME, ...newHistory.slice(-4)];
      }
      return newHistory;
    });
    setIsUIHidden(false); // Despertar UI al navegar
    resetAssistantTimer();
    window.scrollTo(0, 0);
  };

  const handleDirectTune = (region: keyof typeof REGIONES_PR, miniChannel: number) => {
    setViewHistory([AppView.HOME, AppView.TV]);
    localStorage.setItem('impulso_auto_tune', JSON.stringify({ region, miniChannel }));
    setIsUIHidden(false);
  };

  const handleOpenRadio = () => {
    playBeep();
    setIsRadioOpen(true);
    setIsMusicPlaying(true);
    toggleUI();
  };

  const handleBack = () => {
    const now = Date.now();
    const timeDiff = now - backPanicRef.current.lastTime;

    // Si los clics son rápidos (menos de 600ms entre ellos), contamos
    if (timeDiff < 600) {
      backPanicRef.current.count += 1;
    } else {
      backPanicRef.current.count = 1;
    }
    backPanicRef.current.lastTime = now;

    // SEGURIDAD NIVEL 4: FORCE HOME
    if (backPanicRef.current.count >= 4) {
      console.log("🚀 Nivel de Seguridad 4 Activado: Forzando regreso a Home...");
      backPanicRef.current.count = 0;
      setViewHistory([AppView.HOME]);
      window.history.replaceState({ view: AppView.HOME }, '', '');
      playBeep('sonar');
      return;
    }

    playBeep();
    toggleUI();
    if (viewHistory.length > 1) {
      // Volver físicamente en el historial del navegador
      window.history.back();
    } else if (currentView !== AppView.HOME) {
      // Fallback de seguridad: Si no hay historial pero no estamos en HOME, forzamos el regreso
      handleNavigate(AppView.HOME);
    }
  };

  const navigateToPRWithBusiness = (name: string) => { setTargetBusinessName(name); handleNavigate(AppView.PR); };
  const handleTriggerEdit = (business: Business) => { setBusinessToEdit(business); handleNavigate(AppView.PR); };

  const renderView = () => {
    if (!isDataLoaded) return <LoadingFallback onRefresh={() => window.location.reload()} />;
    switch (currentView) {
      case AppView.PR: return <Suspense fallback={<LoadingFallback onRefresh={() => window.location.reload()} />}><ImpulsoPR initialTab={targetBusinessName !== null ? PRTab.DIRECTORY : activePRTab} initialBusinessSearch={targetBusinessName} registeredBusinesses={registeredBusinesses} onRegisterBusiness={handleRegisterBusiness} onUpdateBusiness={handleRegisterBusiness} ads={activeAds} globalSlogan={globalSlogan} globalLogo={globalLogo} merchantWelcome={merchantWelcome} language={userSettings.language} activePromoter={activePromoter} paymentLinks={paymentLinks} businessToEdit={businessToEdit} onPlayBeep={playBeep} onTabChange={setActivePRTab} muralImages={successGalleryImages} onToggleUI={toggleUI} externalAiMessages={prTabAiMessages} onSendAiMessage={(t) => handleSendAIMessageGlobal(t, false)} onClearAiMessages={() => handleClearAIMessages(false)} isAiLoading={isAILoading} familyStatuses={familyStatuses} onOpenFamilyPost={() => { setShowFamilyModal(true); setFamilyInitialIsPosting(true); }} onCloseRegister={() => { if (targetBusinessName === '') handleBack(); setTargetBusinessName(null); }} /></Suspense>;
      case AppView.TV: return <Suspense fallback={<LoadingFallback onRefresh={() => window.location.reload()} />}><ImpulsoTV
        onNavigateToBusiness={navigateToPRWithBusiness}
        registeredBusinesses={registeredBusinesses}
        ads={activeAds}
        onTrackMetric={handleTrackMetric}
        onRegisterAd={handleRegisterAd}
        welcomeLogoUrl={globalLogo}
        paymentLinks={paymentLinks}
        language={userSettings.language}
        onToggleUI={toggleUI}
        activePromoter={activePromoter}
        onPlayBeep={playBeep}
        isMusicPlaying={isMusicPlaying}
        onNavigate={handleNavigate}
        onBack={handleBack}
        isSettingsOpen={isTVSettingsOpen}
        onSettingsOpenChange={setIsTVSettingsOpen}
        isControlPanelOpen={isControlPanelOpen}
        onToggleControlPanel={setIsControlPanelOpen}
        isBabyMode={isBabyMode}
        onBabyModeChange={setIsBabyMode}
      /></Suspense>;
      case AppView.SHOP: return <Suspense fallback={<LoadingFallback onRefresh={() => window.location.reload()} />}><ImpulsoShop onOpenFamilyPost={() => { setShowFamilyModal(true); setFamilyInitialIsPosting(true); }} onToggleUI={toggleUI} onOpenRadio={handleOpenRadio} sellers={sellers} onProductUpload={handleProductUpload} products={shopProducts} setProducts={setShopProducts} globalProfile={globalProfile} setGlobalProfile={setGlobalProfile} initialOpenAddModal={shouldOpenShopAddModal} onAddModalHandled={() => setShouldOpenShopAddModal(false)} ads={activeAds} familyStatuses={familyStatuses} registeredBusinesses={registeredBusinesses} shopOnLogoUrl={paymentLinks.shopOnLogo || '/impulso_shop_on_logo_final.png'} initialOpenProductId={initialOpenProductId} onOpenProductIdHandled={() => setInitialOpenProductId(null)} /></Suspense>;
      case AppView.FAMILY: return (
        <Suspense fallback={<LoadingFallback onRefresh={() => window.location.reload()} />}>
          <ImpulsoFamily
            isModal={false}
            registeredBusinesses={registeredBusinesses}
            onClose={() => handleNavigate(AppView.HOME)}
            onJoin={() => { navigateToPRWithBusiness(''); }}
            images={successGalleryImages}
            links={muralLinks}
            language={userSettings.language}
            onOpenRadio={handleOpenRadio}
            onEditProfile={() => setShowProfileSetup(true)}
            globalProfile={globalProfile}
            astronautLogoUrl={paymentLinks.familyLogo || OFFICIAL_ASTRONAUT_LOGO}
            externalStatuses={familyStatuses}
            onSetExternalStatuses={setFamilyStatuses}
            ads={activeAds}
            onToggleUI={toggleUI}
          />
        </Suspense>
      );
      case AppView.APPS: return <Suspense fallback={<LoadingFallback onRefresh={() => window.location.reload()} />}><ImpulsoApps registeredBusinesses={registeredBusinesses} activePromoter={activePromoter} onToggleUI={toggleUI} ads={activeAds} familyStatuses={familyStatuses} onOpenFamilyPost={() => { setShowFamilyModal(true); setFamilyInitialIsPosting(true); }} paymentLinks={paymentLinks} onPlayBeep={playBeep} /></Suspense>;
      case AppView.ADMIN: return <Suspense fallback={<LoadingFallback onRefresh={() => window.location.reload()} />}><AdminPanel activeAds={activeAds} registeredBusinesses={registeredBusinesses} historicalRevenue={[]} onDeleteBusiness={handleDeleteBusiness} onDeleteAd={handleDeleteAd} onUpdateAdSlot={handleUpdateAdSlot} onResetTVDefaults={handleResetTVDefaults} globalLogo={globalLogo} setGlobalLogo={setGlobalLogo} appIcon={appIcon} setAppIcon={setAppIcon} globalSlogan={globalSlogan} setGlobalSlogan={setGlobalSlogan} welcomeTitle={welcomeTitle} setWelcomeTitle={setWelcomeTitle} welcomeDescription={welcomeDescription} setWelcomeDescription={setWelcomeDescription} merchantWelcome={merchantWelcome} setMerchantWelcome={setMerchantWelcome} muralImages={successGalleryImages} setMuralImages={setSuccessGalleryImages} backgroundImages={backgroundImages} setBackgroundImages={setBackgroundImages} muralLinks={muralLinks} setMuralLinks={setMuralLinks} paymentLinks={paymentLinks} setPaymentLinks={setPaymentLinks} adminEmails={adminEmails} setAdminEmails={setAdminEmails} promoters={promoters} onRegisterPromoter={handleRegisterPromoter} adminMusicUrls={adminMusicUrls} onUpdateAdminMusic={(urls) => { setAdminMusicUrls(urls); localStorage.setItem('impulso_admin_music_urls', JSON.stringify(urls)); }} musicEnabled={userSettings.musicEnabled || false} setMusicEnabled={(enabled) => setUserSettings({ ...userSettings, musicEnabled: enabled })} onNavigate={handleNavigate} sellers={sellers} onUpdateSeller={handleUpdateSeller} familyStatuses={familyStatuses} onDeleteFamilyStatus={handleDeleteFamilyStatus} onUpdateFamilyStatus={handleUpdateFamilyStatus} onClearAllFamilyStatuses={handleClearAllFamilyStatuses} language={userSettings.language} /></Suspense>;
      case AppView.AD_CLIENTS: return <Suspense fallback={<LoadingFallback onRefresh={() => window.location.reload()} />}><AdClientDashboard ads={activeAds} /></Suspense>;
      default: return <Home onNavigate={(v) => { playBeep(); handleNavigate(v); }} onRegister={() => { playBeep(); navigateToPRWithBusiness(''); }} welcomeLogoUrl={OFFICIAL_ASTRONAUT_LOGO} welcomeTitle={welcomeTitle} welcomeDescription={welcomeDescription} muralImages={backgroundImages} galleryImages={successGalleryImages} muralLinks={muralLinks} language={userSettings.language} onOpenRadio={handleOpenRadio} onEditProfile={() => setShowProfileSetup(true)} globalProfile={globalProfile} astronautLogoUrl={OFFICIAL_ASTRONAUT_LOGO} showFamilyModal={showFamilyModal} setShowFamilyModal={setShowFamilyModal} shopOnLogoUrl="/impulso_shop_on_logo_final.png" />;
    }
  };

  const [globalAlert, setGlobalAlert] = useState<{ message: string; id: number } | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase.channel('global_alerts')
      .on('broadcast', { event: 'new_alert' }, (payload) => {
        console.log("Nueva alerta global recibida:", payload);
        if (payload.payload && payload.payload.message) {
          setGlobalAlert({ message: payload.payload.message, id: Date.now() });
          playBeep();
        }
      })
      .subscribe();
      
    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (globalAlert) {
      const timer = setTimeout(() => setGlobalAlert(null), 10000); // 10 seconds auto-hide
      return () => clearTimeout(timer);
    }
  }, [globalAlert]);

  const currentTrackInfo = useMemo(() => {
    if (userSettings.musicSource === 'top10') {
      const ad = activeAds.find(ad => ad.videoUrl === finalMusicUrl);
      if (ad) return { title: ad.businessName, type: 'OFFICIAL TOP 10' };
    }
    if (finalMusicUrl === adminMusicUrls[0]?.url && adminMusicUrls[0]?.url) {
      return { title: 'IMPULSO PR: STATION', type: 'ELITE TRANSMISSION' };
    }
    return { title: '', type: '' };
  }, [finalMusicUrl, userSettings.musicSource, activeAds, adminMusicUrls]);

  return (
    <div
      onMouseMove={() => toggleUI()}
      onClick={() => toggleUI()}
      className={`min-h-screen w-full flex flex-col relative transition-all duration-700 bg-black overflow-x-hidden ${isForceDesktop ? 'w-[1280px] overflow-x-auto' : ''} ${currentView === AppView.HOME ? 'bg-slate-50 text-slate-900' : 'bg-[#020617] text-white'} ${isUIHidden && currentView === AppView.TV ? 'cursor-none' : 'cursor-default'}`}
    >
      {/* LOADER ANTIGRAVITY ORIGINAL - SIEMPRE VISIBLE HASTA CARGAR */}
      {!isDataLoaded && (
        <LoadingFallback onRefresh={() => window.location.reload()} />
      )}

      {/* BARRA ELEGANTE DE ALERTA GLOBAL (IN-APP PUSH) */}
      {globalAlert && (
        <div key={globalAlert.id} className="fixed top-0 left-0 w-full z-[40000] animate-in slide-in-from-top duration-500 flex justify-center px-4 pt-4">
          <div className="bg-zinc-950/90 backdrop-blur-2xl border-2 border-amber-500/50 rounded-2xl p-4 shadow-[0_10px_40px_rgba(245,158,11,0.3)] w-full max-w-2xl flex items-center justify-between gap-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-black shrink-0 animate-bounce">
                <i className="fas fa-bell text-lg"></i>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Transmisión Élite</span>
                <span className="text-sm font-bold text-white leading-tight mt-0.5">{globalAlert.message}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setGlobalAlert(null)}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all relative z-10 shrink-0"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>
      )}

      {/* CAPA DE DESPERTAR GLOBAL (TAP TAP) */}
      {isUIHidden && (
        <div
          className="fixed inset-0 z-[200] cursor-pointer"
          onClick={(e) => { e.stopPropagation(); toggleUI(); }}
          onTouchStart={(e) => { e.stopPropagation(); toggleUI(); }}
        />
      )}

      {/* PANTALLA DE RECUPERACIÓN SINCRO (BOTÓN DE PÁNICO) */}
      {showSyncError && !isDataLoaded && (
        <div className="fixed inset-0 z-[30000] bg-[#020617] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full animate-pulse"></div>

          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-full border-2 border-blue-500/30 flex items-center justify-center bg-blue-600/5 shadow-[0_0_30px_rgba(59,130,246,0.2)] animate-bounce">
              <i className="fas fa-satellite-dish text-blue-400 text-4xl"></i>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Señal Satelital Débil</h2>
              <p className="text-blue-400/60 text-[10px] font-black uppercase tracking-[0.3em] max-w-[250px]">El sistema está tardando más de lo habitual en sincronizar los datos.</p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-10 py-5 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all border border-blue-400/30 flex items-center gap-3"
            >
              <i className="fas fa-sync-alt animate-spin-slow"></i>
              Re-establecer Conexión
            </button>

            <div className="mt-8 flex items-center gap-4 opacity-30">
              <div className="h-[1px] w-8 bg-blue-500"></div>
              <span className="text-[8px] font-black uppercase tracking-[0.5em] text-blue-400">Impulso PR Network</span>
              <div className="h-[1px] w-8 bg-blue-500"></div>
            </div>
          </div>
        </div>
      )}

      {/* FONDO CÓSMICO PERSISTENTE (MODO MYSPACE) */}
      <div
        className={`fixed inset-0 z-0 pointer-events-none overflow-hidden transition-all duration-[2000ms] 
          ${isMusicPlaying ? 'scale-110' : 'scale-100'}`}
        style={{ perspective: '1000px' }}
      >
        <div className={`absolute inset-0 bg-[#020617] transition-all duration-1000`}></div>
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-purple-900/30 transition-opacity duration-1000
          ${currentView === AppView.HOME ? 'opacity-20' : 'opacity-100'}`}></div>
        <div className={`absolute -top-1/2 -left-1/4 w-[150%] h-[200%] bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.1)_0%,_transparent_60%)] 
          ${isMusicPlaying ? 'animate-nebula-float' : 'opacity-40'}`}></div>

        {/* Estrellas Estáticas */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 0)', backgroundSize: '100px 100px', backgroundPosition: '20px 20px' }}></div>
      </div>

      {/* Fondos Temáticos Unificados (TV, PR, APPS) o Capas de hiperespacio */}
      {currentView === AppView.TV ? (
        <div className="absolute inset-0 z-0 overflow-hidden bg-black select-none pointer-events-none">
          {/* CAPA 1: NEBULOSA ELITE - REMOVED BLUE GLOW AS PER USER REQUEST */}
          {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(37,99,235,0.15)_0%,_transparent_70%)]"></div> */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(139,92,246,0.05)_0%,_transparent_60%)]"></div>

          {/* CAPA 2: GRILLA HOLOGRÁFICA (CONSOLA) */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '4vw 4vw' }}></div>

          {/* CAPA 3: BRANDING "IMPULSO TV" (CINEMATIC WATERMARK) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="text-[12vw] font-black italic tracking-[0.3em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-white/30 via-white/10 to-transparent leading-tight">
              IMPULSO
            </h1>
            <h1 className="text-[18vw] font-black italic tracking-[0.5em] uppercase text-transparent bg-clip-text bg-gradient-to-t from-white/30 via-white/10 to-transparent -mt-[4vw]">
              TV
            </h1>
          </div>

          {/* CAPA 4: EFECTO DE SCANLINES (SUTIL) */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 2px)', backgroundSize: '100% 3px' }}></div>

          {/* VINETE DE ENFOQUE */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_#020617_100%)] opacity-60"></div>
        </div>
      ) : currentView === AppView.PR ? (
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#020617] select-none pointer-events-none">
          {/* CAPA 1: NEBULOSA BORICUA (AZUL Y ROJO) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(0,80,240,0.15)_0%,_transparent_60%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(237,27,36,0.1)_0%,_transparent_60%)]"></div>

          {/* CAPA 2: GRILLA TÁCTICA */}
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '2vw 2vw' }}></div>

          {/* CAPA 3: BRANDING "IMPULSO PR" CON COLORES DE BANDERA */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="text-[12vw] font-black italic tracking-[0.3em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-white/30 via-white/15 to-transparent leading-tight">
              IMPULSO
            </h1>
            <div className="flex text-[18vw] font-black italic tracking-[0.5em] uppercase -mt-[4vw]">
              <span className="text-transparent bg-clip-text bg-gradient-to-tr from-[#0050f0]/30 to-white/20">P</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-tl from-[#ed1b24]/30 to-white/20 -ml-[2vw]">R</span>
            </div>
          </div>

          {/* VINETE DE ENFOQUE */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_#020617_100%)] opacity-60"></div>
        </div>
      ) : currentView === AppView.APPS ? (
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#020108] select-none pointer-events-none">
          <img src="/images/spaceship-cabin-bg.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />

          {/* CAPA 1: AURA DE LUZ (GRADIENTES SUAVES SOBRE EL ASTRONAUTA) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(37,99,235,0.15)_0%,_transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(59,130,246,0.1)_0%,_transparent_60%)]"></div>

          {/* VINETE DE CLARIDAD / ENFOQUE */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_#020108_100%)] opacity-80"></div>
        </div>
      ) : currentView === AppView.SHOP ? (
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#f8fafc] select-none pointer-events-none">
          {/* CAPA 1: NEBULOSA DUAL (BLUE + SLATE) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(10,46,93,0.05)_0%,_transparent_60%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_rgba(59,130,246,0.03)_0%,_transparent_60%)]"></div>

          {/* CAPA 2: GRILLA TÉCNICA REFINADA */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(10,46,93,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(10,46,93,0.1) 1px, transparent 1px)', backgroundSize: '4vw 4vw' }}></div>

          {/* CAPA 3: BRANDING CINEMÁTICO PREMIUM */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="text-[12vw] font-black italic tracking-[0.3em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#0a2e5d]/10 via-[#0a2e5d]/5 to-transparent leading-tight">
              IMPULSO
            </h1>
            <div className="flex flex-col items-center -mt-[4vw]">
              <h1 className="text-[15vw] font-black italic tracking-[0.5em] uppercase text-transparent bg-clip-text bg-gradient-to-t from-[#0a2e5d]/20 via-[#0a2e5d]/5 to-transparent">
                SHOP
              </h1>
              <h1 className="text-[9vw] font-black italic tracking-[0.6em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-600/10 via-blue-400/5 to-transparent -mt-[4vw]">
                ON! MARKETPLACE
              </h1>
            </div>
          </div>

          {/* VINETE DE CLARIDAD */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_#f8fafc_100%)] opacity-80"></div>
        </div>
      ) : null}

      {
        currentView !== AppView.HOME && (
          <div className={`transition-all duration-700 ease-in-out fixed top-0 left-0 w-full z-[100] 
          ${(isUIHidden || isBabyMode) ? 'opacity-0 -translate-y-20 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'}`}>
            <Navbar
              currentView={currentView}
              onNavigate={(v) => { playBeep(); handleNavigate(v); }}
              onBack={() => { playBeep(); handleBack(); }}
              onOpenSettings={(section) => {
                playBeep();
                setActiveSettingsSection(section);
                setIsSettingsOpen(true);
              }}
              language={userSettings.language}
              onOpenPromoter={() => {
                playBeep();
                setShowPromoterModal(true);
              }}
              activePromoter={activePromoter}
              isSpaceMode={true}
              isCloudMode={isCloudMode}
              userSettings={userSettings}
              onUpdateSettings={setUserSettings}
              onOpenAlarm={() => {
                playBeep();
                onOpenShipModule('alarm');
              }}
              onOpenShipModule={onOpenShipModule}
              forceOpenNotifTab={forceOpenNotifTab}
              onNotifPanelConsumed={() => setForceOpenNotifTab(null)}
              globalProfile={globalProfile}
              onEditProfile={() => setShowProfileSetup(true)}
              products={shopProducts}
              setProducts={setShopProducts}
              onOpenAddProductModal={() => {
                setNewProduct({
                  name: '',
                  price: 0,
                  store: globalProfile?.storeName || '',
                  category: SHOP_CATEGORIES[1],
                  niche: 'Global',
                  imageUrl: '',
                  externalUrl: '',
                  description: '',
                  vendorEmail: globalProfile?.email || ''
                });
                setShowAddProductModal(true);
              }}
              onEditProduct={(p) => {
                setNewProduct(p);
                setVendorEmail(p.vendorEmail || globalProfile?.email || '');
                setShowAddProductModal(true);
              }}
              onStoreStatusChange={handleStoreStatusChange}
            />
          </div>
        )
      }
      <main className={`flex-grow flex flex-col relative overflow-hidden ${currentView !== AppView.HOME ? 'pt-20 md:pt-24' : ''}`}>{renderView()}</main>

      {/* BOTONES DE CONTROL GLOBAL (HELP / CLOSE SETTINGS) */}
      {
        (currentView !== AppView.HOME && !(currentView === AppView.PR && activePRTab === PRTab.CHAT)) && (
          <div className={`fixed z-[10500] flex items-center gap-2 transition-all duration-700 
            ${currentView === AppView.TV ? 'bottom-1 right-6' : 'bottom-6 right-6'}
            ${(!showTVAssistant && !isAIChatOpen && !isTVSettingsOpen) ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'}`}
          >

            {/* BOTÓN HELP IA - RESTAURADO ORIGINAL */}
            {!isNativeFullscreen && (
              <button
                onClick={() => { playBeep(); setIsAIChatOpen(!isAIChatOpen); resetAssistantTimer(); }}
                className={`flex flex-col items-center justify-center group active:scale-95 transition-all duration-300 
                ${currentView === AppView.TV
                    ? 'px-2.5 py-0.5 bg-[#0a2e5d]/80 backdrop-blur-md rounded-md border border-white/10'
                    : 'w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl border-2 border-blue-500/30'
                  }
                ${'shadow-[0_10px_30px_rgba(59,130,246,0.3)]'}`}
                title="Asistente Boricua"
              >
                <div className={`absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[8px] text-white font-black animate-pulse shadow-lg ${isAILoading ? 'opacity-100' : 'opacity-0'}`}>IA</div>
                {isAIChatOpen ? (
                  <>
                    <i className="fas fa-times text-red-500 text-base md:text-xl"></i>
                    <span className="text-[7px] font-black text-red-500 uppercase tracking-widest mt-0.5">CLOSE</span>
                  </>
                ) : currentView === AppView.TV ? (
                  <span className="text-[7px] font-black text-white/90 uppercase tracking-[0.2em] animate-pulse">HELP IA</span>
                ) : (
                  <>
                    <i className="fas fa-user-astronaut text-[#0a2e5d] text-base md:text-xl animate-astronaut-float"></i>
                    <span className="text-[7px] font-black text-[#0a2e5d] uppercase tracking-widest mt-1">HELP</span>
                  </>
                )}
              </button>
            )}

            {/* CONEXIÓN ENGRANAJE A YOUTUBE (SOLO CLOSE RESTAURADO) */}
            {currentView === AppView.TV && isTVSettingsOpen && !isNativeFullscreen && (
              <>
                <button
                  onClick={() => { playBeep(); setIsTVSettingsOpen(false); setIsControlPanelOpen(false); }}
                  className="flex flex-col items-center justify-center px-2 md:px-2.5 py-0.5 bg-red-600/90 backdrop-blur-md rounded-md border border-white/20 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-in slide-in-from-right-5 duration-300 active:scale-95 group"
                  title="Cerrar Ajustes"
                >
                  <i className="fas fa-times text-white text-[10px] mb-0.5 group-hover:rotate-90 transition-transform"></i>
                  <span className="text-[7px] font-black text-white uppercase tracking-widest leading-none">CLOSE</span>
                </button>
              </>
            )}
          </div>
        )
      }

      {/* OVERLAY DE CHAT IA UNIFICADO */}
      {isAIChatOpen && (
        <div className="fixed inset-0 z-[10400] flex items-end justify-end md:p-8 pointer-events-none p-4 pb-16 md:pb-8">
          <div className="w-full h-[85vh] md:w-[400px] md:h-[600px] bg-white rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)] border border-blue-100 overflow-hidden flex flex-col pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <i className="fas fa-user-astronaut text-white animate-astronaut-float"></i>
                </div>
                <div>
                  <h4 className="text-white text-xs font-black uppercase tracking-widest leading-tight">Asistente <span className="text-blue-400">PR</span></h4>
                  <span className="text-blue-300/60 text-[8px] font-bold uppercase tracking-widest">Sincronizado • IA Core</span>
                </div>
              </div>
              <button
                onClick={() => setIsAIChatOpen(false)}
                className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                title="Cerrar Asistente"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <div className="flex-grow overflow-hidden p-2">
              <AICore
                ads={activeAds}
                registeredBusinesses={registeredBusinesses}
                merchantWelcome={merchantWelcome}
                language={userSettings.language}
                muralImages={successGalleryImages}
                onPlayBeep={playBeep}
                externalMessages={floatingAiMessages}
                onSendMessage={(t) => handleSendAIMessageGlobal(t, true)}
                onClearMessages={() => handleClearAIMessages(true)}
                isLoading={isAILoading}
                showFamilyHologram={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* REPRODUCTOR DE MÚSICA GLOBAL */}
      {
        userSettings.musicEnabled && finalMusicUrl && (
          <GlobalMusicPlayer
            url={finalMusicUrl}
            isPlaying={isMusicPlaying}
            backgroundMode={userSettings.backgroundMusicMode}
            onTogglePlayback={() => {
              const next = !isMusicPlaying;
              setIsMusicPlaying(next);
              if (next && !userSettings.musicEnabled) {
                setUserSettings({ ...userSettings, musicEnabled: true });
              }
            }}
            onTrackEnd={pickNextMusic}
            onNextTrack={pickNextMusic}
            onPreviousTrack={pickPreviousMusic}
            trackTitle={currentTrackMetadata?.title || ''}
            trackArtist={currentTrackMetadata?.category || ''}
            onProgress={(current, duration) => setMusicProgress({ current, duration })}
            onMetadata={(meta) => setLiveTrackMetadata(meta)}
            onBuffering={(buffering) => setIsRadioBuffering(buffering)}
            seekTo={radioSeekTo}
            loop={userSettings.musicRepeatMode === 'one'}
            isEnglish={userSettings.language === 'en'}
          />
        )
      }

      {/* GLOBAL FAMILY LIVE CHAT */}
      {isGlobalChatOpen && <FamilyLiveChat globalProfile={globalProfile} onClose={() => setIsGlobalChatOpen(false)} />}
      
      {/* RADIO PLAYER OVERLAY */}
      <RadioPlayer
        isOpen={isRadioOpen}
        onClose={() => {
          setIsUIHidden(false);
          setIsRadioFaded(false);
          startRadioFadeTimer();
          setTimeout(() => setIsRadioOpen(false), 150);
        }}
        isPlaying={isMusicPlaying}
        onTogglePlayback={() => {
          const next = !isMusicPlaying;
          setIsMusicPlaying(next);
          if (next && !userSettings.musicEnabled) {
            setUserSettings({ ...userSettings, musicEnabled: true });
          }
        }}
        onNext={() => {
          setIsRadioBuffering(true);
          setLiveTrackMetadata({ title: '', artist: '' });
          pickNextMusic();
          setIsMusicPlaying(true);
        }}
        onPrevious={() => {
          setIsRadioBuffering(true);
          setLiveTrackMetadata({ title: '', artist: '' });
          pickPreviousMusic();
          setIsMusicPlaying(true);
        }}
        isRandom={userSettings.musicShuffleMode || false}
        onToggleRandom={() => setUserSettings({ ...userSettings, musicShuffleMode: !userSettings.musicShuffleMode })}
        isRepeat={userSettings.musicRepeatMode === 'one'}
        repeatMode={userSettings.musicRepeatMode || 'all'}
        onToggleRepeat={() => {
          const current = userSettings.musicRepeatMode || 'all';
          let next: 'none' | 'one' | 'all' = 'all';
          if (current === 'all') next = 'one';
          else if (current === 'one') next = 'none';
          else next = 'all';
          setUserSettings({ ...userSettings, musicRepeatMode: next });
        }}
        backgroundMode={userSettings.backgroundMusicMode || false}
        onToggleBackgroundMode={() => setUserSettings({ ...userSettings, backgroundMusicMode: !userSettings.backgroundMusicMode })}
        activeUrl={finalMusicUrl}
        isEnglish={isEnglish}
        musicSource={userSettings.musicSource}
        onSwitchSource={(source) => {
          setUserSettings({ ...userSettings, musicSource: source });
        }}
        onOpenRadioSettings={() => { setIsRadioOpen(false); setIsSettingsOpen(true); setActiveSettingsSection('radio'); }}
        onEditProfile={() => setShowProfileSetup(true)}
        globalProfile={globalProfile}
        currentTime={musicProgress.current}
        duration={musicProgress.duration}
        trackTitle={liveTrackMetadata?.title || currentTrackMetadata?.title}
        trackType={liveTrackMetadata?.artist || currentTrackMetadata?.category}
        trackIndex={currentPlaylist.findIndex(t => t.url === activeMusicUrl) + 1}
        totalTracks={currentPlaylist.length}
        playlist={currentPlaylist}
        onSyncCustom={() => {
          playBeep('sonar');
          // Load first track of active folder immediately after sync, but wait for explicit play
          setTimeout(() => {
            const folders = userSettings.customMusicFolders || [];
            const activeFolder = folders.find((f: any) => f.id === userSettings.activeFolderId);
            const tracks = activeFolder ? (activeFolder.tracks || []) : (userSettings.customMusicUrls || []);
            if (tracks.length > 0) {
              setIsRadioBuffering(true);
              setLiveTrackMetadata({ title: '', artist: '' });
              setActiveMusicUrl(tracks[0].url);
              setIsMusicPlaying(false);
            }
          }, 100);
        }}
        onPlayTrack={(url) => {
          setIsRadioBuffering(true);
          setLiveTrackMetadata({ title: '', artist: '' });
          setActiveMusicUrl(url);
          setIsMusicPlaying(false);
        }}
        isBuffering={isRadioBuffering}
        onSeek={(time) => {
          setRadioSeekTo(time);
          setTimeout(() => setRadioSeekTo(undefined), 100);
        }}
        userSettings={userSettings}
        onUpdateSettings={setUserSettings}
      />

      {/* BOTÓN DE MÚSICA GLOBAL (ASTRONAUTA CON HEADPHONES) */}
      {
        userSettings.musicEnabled && currentView !== AppView.ADMIN && currentView !== AppView.TV && currentView !== AppView.PR && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              playBeep();
              setIsRadioOpen(true);
              setIsMusicPlaying(true);
              setIsRadioFaded(false);
              if (radioFadeTimeoutRef.current) {
                window.clearTimeout(radioFadeTimeoutRef.current);
              }
              toggleUI();
            }}
            className={`fixed z-[250] w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center group active:scale-95 transition-all duration-700 border-[3px] md:border-4 border-black overflow-hidden
            bottom-6 left-6 md:bottom-10 md:left-10
            backdrop-blur-md
            ${isMusicPlaying 
              ? 'bg-[#0a2e5d]/60 shadow-[0_0_25px_rgba(59,130,246,0.9)] grayscale-0' 
              : 'bg-slate-900/40 shadow-[0_0_15px_rgba(59,130,246,0.4)] grayscale'
            }
            ${isRadioFaded 
              ? 'opacity-30 translate-y-0 hover:opacity-100 pointer-events-auto' 
              : 'opacity-100 translate-y-0 pointer-events-auto'} `}
            title={userSettings.language === 'en' ? "Open Radio" : "Abrir Radio"}
          >
            {globalProfile.photo ? (
              <img src={globalProfile.photo} alt="Profile" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : null}

            <div className={`relative z-10 w-full h-full flex flex-col items-center justify-center ${globalProfile.photo ? 'bg-black/50 backdrop-blur-sm' : ''}`}>
              <i className={`fas fa-user-astronaut ${isMusicPlaying ? 'text-[#00c3ff] animate-astronaut-float' : 'text-slate-400'} text-xl md:text-3xl`}></i>
              {/* Visual indicator of headphones (small overlapping icon or just the theme) */}
              <i className={`fas fa-headphones absolute top-2 right-2 md:top-3 md:right-3 text-[10px] md:text-xs ${isMusicPlaying ? 'text-white animate-pulse' : 'text-slate-500/50'}`}></i>
              <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-wider mt-1 ${isMusicPlaying ? 'text-[#00c3ff] drop-shadow-[0_0_8px_rgba(0,195,255,0.8)]' : 'text-slate-400 drop-shadow-sm'}`}>RADIO</span>
            </div>

            {/* Playing wave indicator */}
            {isMusicPlaying && (
              <div className="absolute top-1 right-1/2 translate-x-1/2 flex gap-1 z-20 opacity-80">
                <div className="w-1 h-2 bg-[#00c3ff] animate-music-bar-1 rounded-full"></div>
                <div className="w-1 h-3 bg-[#00c3ff] animate-music-bar-2 rounded-full"></div>
                <div className="w-1 h-1.5 bg-[#00c3ff] animate-music-bar-3 rounded-full"></div>
              </div>
            )}
          </button>
        )
      }

        {/* BOTÓN GLOBAL DE CHAT */}
        {
          currentView !== AppView.ADMIN && currentView !== AppView.TV && currentView !== AppView.PR && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                playBeep();
                setIsGlobalChatOpen(!isGlobalChatOpen);
                setIsRadioFaded(false);
                if (radioFadeTimeoutRef.current) {
                  window.clearTimeout(radioFadeTimeoutRef.current);
                }
              }}
              className={`fixed z-[250] w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center group active:scale-95 transition-all duration-700 border-[3px] md:border-4 border-black overflow-hidden
              bottom-6 left-[96px] md:bottom-10 md:left-[130px]
              backdrop-blur-md
              ${isGlobalChatOpen ? 'bg-[#0a2e5d]/60 shadow-[0_0_25px_rgba(59,130,246,0.9)] grayscale-0' : 'bg-slate-900/40 shadow-[0_0_15px_rgba(59,130,246,0.4)] grayscale'}
              ${isRadioFaded ? 'opacity-30 hover:opacity-100 pointer-events-auto' : 'opacity-100 pointer-events-auto'}`}
              title="Chat en Vivo"
            >
              <div className={`relative z-10 w-full h-full flex flex-col items-center justify-center ${globalProfile?.photo ? 'bg-black/50 backdrop-blur-sm' : ''}`}>
                <i className={`fa-solid fa-comment-dots text-xl md:text-3xl transition-colors ${isGlobalChatOpen ? 'text-[#00c3ff]' : 'text-slate-400'}`}></i>
                <span className={`text-[8px] md:text-[10px] font-black uppercase tracking-wider mt-1 ${isGlobalChatOpen ? 'text-[#00c3ff] drop-shadow-[0_0_8px_rgba(0,195,255,0.8)]' : 'text-slate-400 drop-shadow-sm'}`}>CHAT</span>
              </div>
            </button>
          )
        }

      {showFamilyModal && currentView !== AppView.FAMILY && (
        <Suspense fallback={null}>
          <ImpulsoFamily
            key={familyInitialIsPosting ? 'posting-active' : 'family-modal'}
            registeredBusinesses={registeredBusinesses}
            onClose={() => {
              setShowFamilyModal(false);
              setFamilyInitialIsPosting(false);
            }}
            onJoin={() => { navigateToPRWithBusiness(''); }}
            images={successGalleryImages}
            links={muralLinks}
            language={userSettings.language}
            onOpenRadio={handleOpenRadio}
            onEditProfile={() => setShowProfileSetup(true)}
            globalProfile={globalProfile}
            astronautLogoUrl={paymentLinks.familyLogo || OFFICIAL_ASTRONAUT_LOGO}
            initialIsPosting={familyInitialIsPosting}
            externalStatuses={familyStatuses}
            onSetExternalStatuses={setFamilyStatuses}
            onToggleUI={toggleUI}
            ads={activeAds}
          />
        </Suspense>
      )}

      {isShipModalOpen && (
        <Suspense fallback={null}>
          <ShipModuleModal
            isOpen={isShipModalOpen}
            onClose={() => {
              setIsShipModalOpen(false);
              setForceOpenNotifTab('actions');
            }}
            module={activeShipModule}
            userSettings={userSettings}
            onUpdateSettings={setUserSettings}
            onPlayBeep={playBeep}
          />
        </Suspense>
      )}

      {showPromoterModal && <PromoterModal onClose={() => setShowPromoterModal(false)} onLogin={setActivePromoter} activePromoter={activePromoter} registeredBusinesses={registeredBusinesses} promoters={promoters} />}
      {
        isSettingsOpen && (
          <Suspense fallback={null}>
            <SettingsModal
              onClose={() => {
                const wasFromRadio = activeSettingsSection === 'radio';
                setIsSettingsOpen(false);
                setActiveSettingsSection(undefined);
                if (wasFromRadio) setIsRadioOpen(true);
              }}
              onEditBusiness={handleTriggerEdit}
              onDeleteBusiness={handleDeleteBusiness}
              onResetApp={() => { localStorage.clear(); window.location.reload(); }}
              userSettings={userSettings}
              onUpdateSettings={setUserSettings}
              installPWA={null}
              registeredBusinesses={registeredBusinesses}
              ads={activeAds}
              initialSection={activeSettingsSection}
              onSyncSuccess={() => {
                setIsSettingsOpen(false);
                handleNavigate(AppView.HOME);
                setIsRadioOpen(true);
              }}
            />
          </Suspense>
        )
      }
      {
        userSettings.alarmEnabled && userSettings.favoriteProgram && (
          <Suspense fallback={null}>
            <ProgramAlarm
              favoriteProgram={userSettings.favoriteProgram}
              alarmSound={userSettings.alarmSound}
              onNavigateToTV={() => {
                if (userSettings.favoriteProgram) {
                  handleDirectTune(userSettings.favoriteProgram.channel as any, userSettings.favoriteProgram.miniChannel || 1);
                } else {
                  handleNavigate(AppView.TV);
                }
              }}
              onDismiss={() => { }}
            />
          </Suspense>
        )
      }

      <IdentityModal
        isOpen={showProfileSetup}
        onClose={() => setShowProfileSetup(false)}
        userProfile={globalProfile}
        setUserProfile={setGlobalProfile}
        products={shopProducts}
        language={userSettings.language}
      />

      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        vendorEmail={vendorEmail}
        setVendorEmail={setVendorEmail}
        onProductUpload={handleAppProductUpload}
        calculateListingFee={calculateListingFee}
        handleFileUpload={handleFileUpload}
        isDescEditing={isDescEditing}
        setIsDescEditing={setIsDescEditing}
        globalProfile={globalProfile}
      />



      <style>{`
        @keyframes shiny-twinkle {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        @keyframes nebula-float {
          0%, 100% { transform: translate(0, 0) scale(1.1); opacity: 0.4; }
          33% { transform: translate(40px, -30px) scale(1.2); opacity: 0.6; }
          66% { transform: translate(-30px, 40px) scale(1.15); opacity: 0.5; }
      `}</style>

      {/* RELOJ FLOTANTE DESACTIVADO PARA EVITAR DUPLICIDAD */}
      {/* 
      <Suspense fallback={null}>
        <FloatingClock position="top-right" />
      </Suspense> 
      */}
    </div >
  );
};

export default App;
