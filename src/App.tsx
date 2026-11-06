import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  BookOpen, 
  HeartHandshake, 
  MessageSquare, 
  Compass, 
  Lock,
  UserCheck,
  Building,
  Heart,
  ShieldCheck
} from "lucide-react";
import DashboardHome from "./components/DashboardHome";
import PsychologicalHandbook from "./components/PsychologicalHandbook";
import AnonymousReporting from "./components/AnonymousReporting";
import AiCounselor from "./components/AiCounselor";
import CounselorDashboard from "./components/CounselorDashboard";
import LocalSecurityPanel from "./components/LocalSecurityPanel";
import PinLockScreen from "./components/PinLockScreen";
import SystemInitializer from "./components/SystemInitializer";
import { Report } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialTrackingCode, setInitialTrackingCode] = useState<string>("");
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [isPinLocked, setIsPinLocked] = useState(false);
  const [handbookSection, setHandbookSection] = useState<number>(0);

  const handleNavigateToHandbookSection = (secId: number) => {
    setHandbookSection(secId);
    setActiveTab("handbook");
    setTimeout(() => {
      document.getElementById("pause-protocol-section")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const [isSystemInitialized, setIsSystemInitialized] = useState<boolean | null>(null);
  const [isCheckingSystem, setIsCheckingSystem] = useState(true);

  // Check pin status on render
  const checkPinStatus = () => {
    const savedPin = localStorage.getItem("safe_school_local_pin");
    const verified = sessionStorage.getItem("safe_school_pin_verified");
    if (savedPin && verified !== "true") {
      setIsPinLocked(true);
    } else {
      setIsPinLocked(false);
    }
  };

  const checkSystemStatus = async () => {
    try {
      const res = await fetch("/api/system/status");
      if (res.ok) {
        const data = await res.json();
        setIsSystemInitialized(data.isInitialized);
      } else {
        setIsSystemInitialized(true); // Fallback
      }
    } catch {
      setIsSystemInitialized(true);
    } finally {
      setIsCheckingSystem(false);
    }
  };

  useEffect(() => {
    checkPinStatus();
    checkSystemStatus();
  }, []);

  // Listen for ESC panic exit
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        window.location.href = "https://vi.wikipedia.org/wiki/To%C3%A1n_h%E1%BB%8Dc";
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Load latest reports data from server to compute dynamic counters
  const fetchReportsData = async () => {
    // Ngăn chặn gọi API khi tab đang ẩn (ví dụ: khoá màn hình điện thoại hoặc chuyển tab) 
    // nhằm loại bỏ hoàn toàn lỗi "Load failed" / "Failed to fetch" do hệ điều hành di động (iOS/Android) tự động ngắt kết nối nền.
    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      return;
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return;
    }

    try {
      const res = await fetch("/api/admin/reports", {
        headers: {
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (e) {
      // Ghi nhận cảnh báo nhẹ, tránh ném lỗi gây gián đoạn trải nghiệm người dùng
      console.warn("Đồng bộ báo cáo học sinh bị ngắt quãng hoặc trì hoãn:", e);
    }
  };

  useEffect(() => {
    if (isSystemInitialized) {
      fetchReportsData();
      
      // Tự động đồng bộ báo cáo định kỳ mỗi 10 giây khi màn hình đang mở (màn hình sáng)
      const interval = setInterval(fetchReportsData, 10000);

      // Thêm sự kiện lắng nghe khi người dùng tab trở lại app (Focus/Visibility change) để lập tức làm mới dữ liệu
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          fetchReportsData();
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [isSystemInitialized]);

  const handleTrackCodeFromHome = (code: string) => {
    setInitialTrackingCode(code);
    setActiveTab("reporting");
  };

  const handleNavigateToReporting = (code?: string) => {
    if (code) {
      setInitialTrackingCode(code);
    } else {
      setInitialTrackingCode("");
    }
    setActiveTab("reporting");
  };

  // Compute stats on the fly
  const reportsCount = reports.length;
  const resolvedCount = reports.filter(r => r.status === "Đã giải quyết" || r.status === "Đang tham vấn").length;

  const handlePinSuccess = () => {
    setIsPinLocked(false);
  };

  if (isCheckingSystem) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200/50 text-white border-0 flex flex-col items-center justify-center p-6 text-slate-300">
        <div className="space-y-4 text-center max-w-sm">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-650 text-white shadow-xl shadow-indigo-600/10">
            <ShieldAlert size={32} className="animate-pulse" />
          </div>
          <h2 className="text-[15px] font-bold tracking-wider text-white uppercase font-sans">Đang đồng bộ hệ thống SafeZone...</h2>
          <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-2/3 bg-indigo-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const urlParams = new URLSearchParams(window.location.search);
  const isStudentBypass = urlParams.get("role") === "student";
  const isForceSetup = urlParams.get("setup") === "true" || urlParams.get("role") === "admin_setup" || urlParams.get("role") === "setup";

  if (isForceSetup || (isSystemInitialized === false && !isStudentBypass)) {
    return (
      <SystemInitializer 
        onSetupSuccess={() => {
          setIsSystemInitialized(true);
          // Redirect or clear URL query params so they can see the direct user dashboard next
          const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.pushState({ path: cleanUrl }, "", cleanUrl);
          fetchReportsData();
        }}
      />
    );
  }

  if (isPinLocked) {
    return <PinLockScreen onSuccess={handlePinSuccess} />;
  }

  const handleClearAllCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 flex flex-col font-sans pb-16 md:pb-0" id="safe_school_root">
      
      {/* Global Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm shadow-indigo-100/30 shrink-0" id="global_header_bar">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo and Slogan */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 mr-2 md:mr-4 lg:mr-6 py-2">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center shrink-0">
                <img src="/logo-universal.png?v=2" alt="SafeZone Logo" className="h-full w-full drop-shadow-md hover:scale-105 transition-transform" />
              </div>
              <div>
                <h1 className="text-[17px] sm:text-[19px] font-black tracking-tight text-slate-800 uppercase flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 whitespace-nowrap">
                  <span>SafeZone</span>
                  <img src="/logo-universal.png?v=2" alt="SafeZone Logo" className="h-6 w-6" />
                  <span className="text-[11px] sm:text-[13px] font-bold bg-rose-50 text-rose-600 border border-rose-200/50 px-1.5 py-0.5 rounded-full lowercase w-fit">học đường sạch</span>
                </h1>
                <p className="text-[13px] sm:text-[15px] text-slate-550 font-semibold tracking-wide hidden sm:block whitespace-nowrap">Lá Chắn Học Đường & Sức Khỏe Số</p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center flex-wrap gap-0.5 lg:gap-1 flex-1 justify-center max-w-5xl mx-1 py-1">
              {[
                { id: "home", label: "Tổng Quan", icon: Compass },
                { id: "handbook", label: "Cẩm Nang Số", icon: BookOpen },
                { id: "reporting", label: "Báo Cáo Ẩn Danh", icon: Lock },
                { id: "chat", label: "Tư Vấn AI", icon: HeartHandshake },
                { id: "counselor", label: "Phòng Tư Vấn Tâm Lý", icon: UserCheck }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id !== "reporting") {
                        setInitialTrackingCode("");
                      }
                    }}
                    className={`flex items-center gap-1 xl:gap-1.5 rounded-lg xl:rounded-xl px-2 py-1.5 lg:px-2.5 lg:py-2 xl:px-3 xl:py-2 text-[14px] lg:text-[15px] xl:text-[16px] font-bold tracking-wide transition cursor-pointer relative ${
                      isActive 
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200/50 text-white border-0 text-white" 
                        : "text-slate-600 hover:bg-slate-50/60 backdrop-blur-sm hover:text-slate-800"
                    }`}
                    id={`nav_btn_${tab.id}`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span className="leading-tight">{tab.label}</span>
                    {tab.id === "counselor" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping absolute top-1 right-2"></span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Total items stats badge indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-[13px] sm:text-[15px] shrink-0 py-2">
              <button
                onClick={() => {
                  setShowSecurityModal(true);
                  // Refresh PIN state
                  checkPinStatus();
                }}
                className="flex items-center gap-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 text-[13px] sm:text-[14px] font-bold border border-indigo-200/60 cursor-pointer transition-all hover:scale-101 shrink-0"
                title="Cài đặt khóa PIN, Tự hủy & Ngụy trang cứu nạn"
                id="security_center_btn"
              >
                <ShieldCheck size={16} className="text-indigo-650 shrink-0" />
                <span>Bảo Mật</span>
              </button>
              <span className="hidden xl:inline-block rounded-full bg-slate-900 px-2.5 py-1 text-[13.5px] xl:text-[15px] font-bold text-slate-200 shrink-0">
                🟢 {reportsCount} báo cáo hoạt động
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Contents */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 overflow-x-hidden">
        {activeTab === "home" && (
          <DashboardHome 
            onNavigate={setActiveTab}
            onNavigateToHandbookSection={handleNavigateToHandbookSection}
            onTrackCode={handleTrackCodeFromHome}
            reportsCount={reportsCount}
            resolvedCount={resolvedCount}
          />
        )}

        {activeTab === "handbook" && (
          <PsychologicalHandbook initialSection={handbookSection} />
        )}

        {activeTab === "reporting" && (
          <AnonymousReporting 
            onReportCreated={fetchReportsData}
            initialTrackingCode={initialTrackingCode}
            onClearInitialTrackingCode={() => setInitialTrackingCode("")}
          />
        )}

        {activeTab === "chat" && (
          <AiCounselor 
            onNavigateToReporting={handleNavigateToReporting}
          />
        )}

        {activeTab === "counselor" && (
          <CounselorDashboard 
            onRefreshData={fetchReportsData}
            onSystemReset={() => setIsSystemInitialized(false)}
          />
        )}
      </main>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-slate-100 py-6 shrink-0 mt-12" id="global_footer_bar">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-[15px] text-slate-400 font-medium">
            SafeZone Học Đường © 2026. Công cụ được bảo trợ và mã hóa ẩn danh phi máy chủ vì mục đích sức khỏe tinh thần học sinh THPT.
          </p>
          <div className="flex justify-center items-center gap-1.5 text-[15px] text-slate-400">
            <span>Kiến tạo môi trường số an toàn cùng</span> 
            <Heart className="text-rose-500 fill-rose-500" size={14} /> 
            <span>và công nghệ trí tuệ nhân tạo Gemini</span>
          </div>
        </div>
      </footer>

      {/* Bottom Floating Navigation for Mobile screens */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 shadow-md py-2 md:hidden" id="mobile_floating_nav">
        <div className="grid grid-cols-5 gap-1 text-center">
          {[
            { id: "home", label: "Tổng Quan", icon: Compass },
            { id: "handbook", label: "Cẩm Nang", icon: BookOpen },
            { id: "reporting", label: "Báo Cáo", icon: Lock },
            { id: "chat", label: "AI Cố Vấn", icon: HeartHandshake },
            { id: "counselor", label: "Tư Vấn Tâm Lý", icon: UserCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== "reporting") {
                    setInitialTrackingCode("");
                  }
                }}
                className={`flex flex-col items-center justify-center p-1 cursor-pointer transition ${
                  isActive ? "text-indigo-600 font-extrabold" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon size={20} className="sm:size-[22px]" />
                <span className="text-[12px] sm:text-[14px] mt-0.5 truncate w-full px-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PAUSE Floating Emergency Button */}
      <button
        onClick={() => {
          handleNavigateToHandbookSection(2);
        }}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-[60] bg-rose-600 hover:bg-rose-700 text-white rounded-full p-4 shadow-xl shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
        title="Mình cần trợ giúp ngay (Quy trình PAUSE)"
      >
        <ShieldAlert size={24} />
        <span className="font-bold hidden md:inline">PAUSE (Hỗ Trợ Ngay)</span>
      </button>

      {/* Security Info/Config Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in" id="security_suite_modal">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 relative text-slate-800">
            <LocalSecurityPanel 
              onClose={() => setShowSecurityModal(false)}
              onClearAllCache={handleClearAllCache}
            />
          </div>
        </div>
      )}
    </div>
  );
}
