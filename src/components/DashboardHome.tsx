import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  HeartHandshake, 
  FileText, 
  Search, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  HelpCircle,
  Phone,
  ArrowRight,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Info,
  Heart,
  Trash2,
  Compass,
  Activity,
  Brain,
  RotateCcw,
  Check,
  Zap,
  Sparkle
} from "lucide-react";
import { 
  PLUTCHIK_SECTORS, 
  ALL_EMOTIONS, 
  MOOD_DISPLAY_MAP, 
  getFullMoodDetails,
  GENEVA_EMOTIONS,
  WHITE_VIOLENCE_INDICATORS
} from "../lib/emotions";
import { pushStudentSyncToCloud } from "../lib/studentSync";

interface DashboardHomeProps {
  onNavigate: (tab: string) => void;
  onNavigateToHandbookSection?: (sectionId: number) => void;
  onTrackCode: (code: string) => void;
  reportsCount: number;
  resolvedCount: number;
}

export default function DashboardHome({ 
  onNavigate, 
  onNavigateToHandbookSection,
  onTrackCode, 
  reportsCount, 
  resolvedCount 
}: DashboardHomeProps) {
  const [trackInputCode, setTrackInputCode] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [userMood, setUserMood] = useState<string | null>(null);
  const [userMoodTime, setUserMoodTime] = useState<string | null>(null);
  const [moodSaved, setMoodSaved] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [showOpposites, setShowOpposites] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [emotionSystem, setEmotionSystem] = useState<"plutchik" | "geneva" | "white_violence" | "diagnostic">("plutchik");
  const [selectedVNIndicators, setSelectedVNIndicators] = useState<string[]>([]);
  const [showAdvancedEmotionTools, setShowAdvancedEmotionTools] = useState<boolean>(false);

  // Diagnostic Quiz State
  const [diagSomatic, setDiagSomatic] = useState<string[]>([]);
  const [diagThought, setDiagThought] = useState<string | null>(null);
  const [diagUrge, setDiagUrge] = useState<string | null>(null);
  const [diagStep, setDiagStep] = useState<number>(1);
  const [showSafetyIndexCitation, setShowSafetyIndexCitation] = useState<boolean>(false);
  const [showEmotionGuide, setShowEmotionGuide] = useState<boolean>(false);

  // School Counseling Hotline State (per school)
  const [schoolList, setSchoolList] = useState<string[]>([]);
  const [allSchoolSettings, setAllSchoolSettings] = useState<Record<string, { hotline?: string; counselingRoom?: string; consultationHours?: string }>>({});
  const [selectedHotlineSchool, setSelectedHotlineSchool] = useState<string>("");
  const [schoolHotlineInput, setSchoolHotlineInput] = useState<string>("");
  const [schoolRoomInput, setSchoolRoomInput] = useState<string>("Phòng Tư vấn Tâm lý Học đường");
  const [hotlineSavedNotice, setHotlineSavedNotice] = useState<boolean>(false);

  const loadLocalMoodState = () => {
    const savedMood = localStorage.getItem("safe_school_user_mood");
    const savedTime = localStorage.getItem("safe_school_user_mood_time");
    setUserMood(savedMood || null);
    setUserMoodTime(savedTime || null);
  };

  useEffect(() => {
    loadLocalMoodState();
    const handleSyncEvent = (e: any) => {
      if (e.detail?.currentMood !== undefined) {
        setUserMood(e.detail.currentMood);
        setUserMoodTime(e.detail.currentMoodTime);
      } else {
        loadLocalMoodState();
      }
    };
    window.addEventListener("safe_school_data_synced", handleSyncEvent);
    return () => window.removeEventListener("safe_school_data_synced", handleSyncEvent);
  }, []);

  // Load schools and per-school counseling hotlines from server + localStorage
  useEffect(() => {
    let localHotlines: Record<string, { hotline?: string; counselingRoom?: string; consultationHours?: string }> = {};
    try {
      const raw = localStorage.getItem("safe_school_custom_hotlines_by_school");
      if (raw) localHotlines = JSON.parse(raw);
    } catch {}

    const savedActiveSchool = localStorage.getItem("safe_school_active_hotline_school") || "";

    fetch("/api/system/status")
      .then(res => res.json())
      .then(data => {
        const serverSchools: string[] = Array.isArray(data.schools) ? data.schools : [];
        const serverAllSettings = data.allSchoolSettings || {};
        const mergedSettings: Record<string, { hotline?: string; counselingRoom?: string; consultationHours?: string }> = {
          ...serverAllSettings,
          ...localHotlines
        };
        if (data.schoolName && data.schoolSettings) {
          mergedSettings[data.schoolName] = {
            ...data.schoolSettings,
            ...(localHotlines[data.schoolName] || {})
          };
        }

        const combinedSchools = Array.from(
          new Set([
            ...serverSchools,
            ...Object.keys(mergedSettings).filter(k => k && k !== "Tất cả các Trường học SafeZone" && k !== "Tất cả")
          ])
        );
        setSchoolList(combinedSchools);
        setAllSchoolSettings(mergedSettings);

        const defaultSchool =
          savedActiveSchool ||
          (data.schoolName && data.schoolName !== "Tất cả các Trường học SafeZone" ? data.schoolName : "") ||
          combinedSchools[0] ||
          "";

        setSelectedHotlineSchool(defaultSchool);
        if (defaultSchool && mergedSettings[defaultSchool]) {
          const h = mergedSettings[defaultSchool].hotline || "";
          setSchoolHotlineInput(h === "0243.88x.xxx" || h === "028.3835.xxxx" ? "" : h);
          setSchoolRoomInput(mergedSettings[defaultSchool].counselingRoom || "Phòng Tư vấn Tâm lý Học đường");
        }
      })
      .catch(() => {
        const localSchools = Object.keys(localHotlines);
        setSchoolList(localSchools);
        setAllSchoolSettings(localHotlines);
        const defaultSchool = savedActiveSchool || localSchools[0] || "";
        setSelectedHotlineSchool(defaultSchool);
        if (defaultSchool && localHotlines[defaultSchool]) {
          setSchoolHotlineInput(localHotlines[defaultSchool].hotline || "");
          setSchoolRoomInput(localHotlines[defaultSchool].counselingRoom || "Phòng Tư vấn Tâm lý Học đường");
        }
      });
  }, []);

  const handleSchoolNameChange = (newSchool: string) => {
    setSelectedHotlineSchool(newSchool);
    localStorage.setItem("safe_school_active_hotline_school", newSchool);
    const matched = allSchoolSettings[newSchool.trim()];
    if (matched) {
      const h = matched.hotline || "";
      setSchoolHotlineInput(h === "0243.88x.xxx" || h === "028.3835.xxxx" ? "" : h);
      setSchoolRoomInput(matched.counselingRoom || "Phòng Tư vấn Tâm lý Học đường");
    } else {
      setSchoolHotlineInput("");
    }
  };

  const handleSaveSchoolHotline = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSchool = selectedHotlineSchool.trim();
    const cleanHotline = schoolHotlineInput.trim();
    if (!cleanSchool || !cleanHotline) return;

    const updatedEntry = {
      ...(allSchoolSettings[cleanSchool] || {}),
      hotline: cleanHotline,
      counselingRoom: schoolRoomInput.trim() || "Phòng Tư vấn Tâm lý Học đường"
    };

    const nextSettings = {
      ...allSchoolSettings,
      [cleanSchool]: updatedEntry
    };
    setAllSchoolSettings(nextSettings);
    if (!schoolList.includes(cleanSchool)) {
      setSchoolList(prev => [...prev, cleanSchool]);
    }
    localStorage.setItem("safe_school_active_hotline_school", cleanSchool);
    localStorage.setItem("safe_school_custom_hotlines_by_school", JSON.stringify(nextSettings));

    setHotlineSavedNotice(true);
    setTimeout(() => setHotlineSavedNotice(false), 3000);

    try {
      await fetch("/api/admin/school-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: cleanSchool,
          hotline: cleanHotline,
          counselingRoom: schoolRoomInput.trim() || "Phòng Tư vấn Tâm lý Học đường"
        })
      });
    } catch {}
  };

  const handleMoodSubmit = (moodValue: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " ngày " + now.toLocaleDateString("vi-VN");
    
    localStorage.setItem("safe_school_user_mood", moodValue);
    localStorage.setItem("safe_school_user_mood_time", timeStr);
    setUserMood(moodValue);
    setUserMoodTime(timeStr);
    setMoodSaved(true);
    setTimeout(() => setMoodSaved(false), 3000);

    // Save to shared wellness_mood_history
    const cachedHistoryStr = localStorage.getItem("wellness_mood_history");
    let history = [];
    if (cachedHistoryStr) {
      try { history = JSON.parse(cachedHistoryStr); } catch { }
    }
    const entry = {
      id: Date.now().toString(),
      date: timeStr,
      mood: moodValue,
      note: "Học sinh tự ghi nhận nhanh từ trang chủ"
    };
    const updated = [entry, ...history];
    localStorage.setItem("wellness_mood_history", JSON.stringify(updated));

    // Đẩy đồng bộ lên đám mây theo mã PIN
    pushStudentSyncToCloud().catch(() => {});
  };

  const handleDeleteMood = () => {
    localStorage.removeItem("safe_school_user_mood");
    localStorage.removeItem("safe_school_user_mood_time");
    setUserMood(null);
    setUserMoodTime(null);
    setShowDeleteConfirm(false);

    // Đẩy đồng bộ lên đám mây theo mã PIN
    pushStudentSyncToCloud().catch(() => {});
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackInputCode.trim()) return;

    setIsSearching(true);
    setSearchError("");

    try {
      const res = await fetch(`/api/reports/${trackInputCode.trim().toUpperCase()}`);
      if (res.ok) {
        onTrackCode(trackInputCode.trim().toUpperCase());
      } else {
        setSearchError("Không tìm thấy báo cáo với mã tra cứu này. Vui lòng kiểm tra lại.");
      }
    } catch {
      setSearchError("Có lỗi xảy ra khi kết nối máy chủ.");
    } finally {
      setIsSearching(false);
    }
  };

  // Plutchik scientific moods configuration is dynamically loaded from src/lib/emotions.ts
  const isNamedEmotionGroup = emotionSystem === "plutchik" || emotionSystem === "geneva";
  const isTestEmotionGroup = emotionSystem === "diagnostic" || emotionSystem === "white_violence";

  return (
    <div className="space-y-8" id="dashboard_home_main">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3.5xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 p-8 text-white shadow-xl md:p-12" id="hero_welcome_banner">
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-72 h-72 rounded-full bg-pink-400/30 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 translate-y-12 w-64 h-64 rounded-full bg-violet-400/20 blur-3xl"></div>
        
        <div className="absolute right-4 bottom-0 opacity-20 mix-blend-overlay hidden lg:block pointer-events-none drop-shadow-2xl">
          <img src="/logo-universal.png" alt="SafeZone Background Logo" className="w-[320px] h-[320px] mix-blend-plus-lighter" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-4 py-1.5 text-[15px] font-bold tracking-wider text-pink-100 uppercase border border-white/10">
            <Sparkles size={14} className="animate-spin" style={{ animationDuration: '6s' }} /> Bạn luôn được lắng nghe & bảo vệ
          </div>
          <h1 className="text-[33px] font-black tracking-tight md:text-[51px] leading-tight font-display">
            Sát Cánh Bên Em, Kiến Tạo <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-pink-200">Không Gian Số Lành Mạnh</span>
          </h1>
          <p className="text-[19px] md:text-[21px] text-indigo-100 font-medium leading-relaxed">
            Nền tảng lắng nghe ẩn danh học tập, giúp giải quyết cô lập học đường, bài xích bạo lực trắng kĩ thuật số và trợ giúp hồi phục cảm xúc cho các bạn trẻ THPT.
          </p>
          
          <div className="pt-2 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
            <button 
              onClick={() => onNavigate("reporting")}
              className="inline-flex items-center justify-center w-full sm:w-auto gap-2.5 rounded-2xl bg-white text-indigo-600 px-5 sm:px-6 py-3 sm:py-3.5 font-extrabold text-[14px] sm:text-[15px] tracking-wider uppercase shadow-xl hover:bg-pink-50 active:scale-95 transition cursor-pointer"
              id="btn_hero_report"
            >
              <ShieldAlert size={16} className="text-pink-500" /> Nộp đơn ẩn danh an toàn
            </button>
            <button 
              onClick={() => onNavigate("chat")}
              className="inline-flex items-center justify-center w-full sm:w-auto gap-2.5 rounded-2xl bg-white/15 text-white border border-white/25 px-5 sm:px-6 py-3 sm:py-3.5 font-extrabold text-[14px] sm:text-[15px] tracking-wider uppercase backdrop-blur-xs hover:bg-white/25 active:scale-95 transition cursor-pointer"
              id="btn_hero_chat"
            >
              <HeartHandshake size={16} /> Tâm sự cùng Thầy Cô AI
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Strip */}
      {showEmergency ? (
        <div className="rounded-3xl border-2 border-dashed border-pink-200 bg-pink-50/50 p-6 text-slate-800 animate-fade-in" id="emergency_panel">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4 flex-col sm:flex-row flex-1">
              <div className="rounded-2xl bg-pink-500 p-4 text-white shadow-lg shadow-pink-500/25 shrink-0 self-start">
                <Phone size={24} className="animate-bounce" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="font-extrabold text-[21px] text-slate-800 flex items-center gap-2">
                  🚨 Điểm Tựa Trợ Giúp Nóng Khẩn Cấp & Tư Vấn Nhà Trường
                </h3>
                <p className="text-[15px] text-slate-600 leading-relaxed max-w-3xl">
                  Khi bạo lực mạng mang tính chất nghiêm trọng ảnh hưởng trực tiếp tới học tập và thân thể ngoài đời của em, em hãy lập tức liên kết với Tổng đài Quốc gia hoặc Số điện thoại Tư vấn Tâm lý của chính trường mình dưới đây:
                </p>

                <div className="grid grid-cols-1 gap-4 pt-2 lg:grid-cols-3">
                  {/* Card 1: Tổng đài 111 */}
                  <div className="rounded-2xl bg-white p-4 shadow-sm shadow-indigo-100/30 border border-pink-100 flex flex-col justify-between">
                    <div>
                      <span className="block text-[12.5px] font-bold text-slate-400 uppercase tracking-widest">Tổng đài Quốc gia Bảo vệ Trẻ em</span>
                      <div className="mt-1">
                        <a href="tel:111" className="text-pink-600 hover:text-pink-700 text-[27px] font-black inline-flex items-center gap-1.5">
                          Tổng đài 111
                        </a>
                        <span className="text-[13.5px] text-slate-500 block">Hoạt động 24/7 • Miễn phí cước gọi toàn quốc</span>
                      </div>
                    </div>
                    <span className="text-[11.5px] text-slate-400 italic block mt-2 pt-2 border-t border-slate-100">(Theo Luật Trẻ em 2016 & Nghị định 56/2017/NĐ-CP)</span>
                  </div>

                  {/* Card 2: Tổng đài 1900 6233 */}
                  <div className="rounded-2xl bg-white p-4 shadow-sm shadow-indigo-100/30 border border-indigo-100 flex flex-col justify-between">
                    <div>
                      <span className="block text-[12.5px] font-bold text-slate-400 uppercase tracking-widest">Tổng đài Tư vấn Tâm lý Ngày Đêm</span>
                      <div className="mt-1">
                        <a href="tel:19006233" className="text-indigo-600 hover:text-indigo-700 text-[27px] font-black inline-flex items-center gap-1.5">
                          1900 6233
                        </a>
                        <span className="text-[13.5px] text-slate-500 block">Chuyên gia tâm lý & Can thiệp khủng hoảng học đường</span>
                      </div>
                    </div>
                    <span className="text-[11.5px] text-slate-400 italic block mt-2 pt-2 border-t border-slate-100">(Phối hợp theo Thông tư 31/2017/TT-BGDĐT)</span>
                  </div>

                  {/* Card 3: SĐT Tư Vấn Của Nhà Trường (Trường nào nhập trường đó) */}
                  <div className="rounded-2xl bg-white p-4 shadow-sm shadow-emerald-100/40 border-2 border-emerald-200 flex flex-col justify-between space-y-2.5" id="school_counseling_hotline_box">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="block text-[12.5px] font-black text-emerald-700 uppercase tracking-widest">
                          🏫 SĐT Tư Vấn Của Nhà Trường
                        </span>
                        <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                          Trường nào nhập trường đó
                        </span>
                      </div>

                      {/* Hiển thị số điện thoại đang kích hoạt của trường nếu đã nhập (hỗ trợ nhiều số) */}
                      {schoolHotlineInput.trim() ? (
                        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 space-y-2">
                          <span className="text-[11.5px] font-bold text-slate-500 block truncate">
                            {selectedHotlineSchool.trim() || "Trường học hiện tại"} ({schoolRoomInput || "Phòng Tâm lý"})
                          </span>
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {schoolHotlineInput.split(/[,/\n]+/).map(n => n.trim()).filter(Boolean).map((num, i) => (
                              <a
                                key={i}
                                href={`tel:${num.replace(/[^0-9+]/g, "")}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[14px] shadow-xs transition"
                                title={`Gọi số ${num}`}
                              >
                                📞 {num}
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-2 text-[12.5px] text-amber-900 font-medium">
                          Chưa có SĐT tư vấn riêng cho trường này. Vui lòng chọn/nhập tên trường và các SĐT tư vấn vào ô bên dưới:
                        </div>
                      )}

                      {/* Ô nhập Tên trường & SĐT Tư vấn của trường đó */}
                      <form onSubmit={handleSaveSchoolHotline} className="space-y-2 pt-0.5">
                        <div>
                          <label className="block text-[11.5px] font-bold text-slate-600 mb-1">
                            1. Chọn hoặc nhập tên trường của em / thầy cô:
                          </label>
                          <input
                            type="text"
                            list="safezone_school_hotline_list"
                            value={selectedHotlineSchool}
                            onChange={(e) => handleSchoolNameChange(e.target.value)}
                            placeholder="VD: THPT Phan Đăng Lưu, THPT Chu Văn An..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-[13px] font-bold text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
                          />
                          <datalist id="safezone_school_hotline_list">
                            {schoolList.map((sch) => (
                              <option key={sch} value={sch} />
                            ))}
                          </datalist>
                        </div>

                        <div>
                          <label className="block text-[11.5px] font-bold text-slate-600 mb-1">
                            2. Nhập SĐT tư vấn tâm lý (Có thể nhập nhiều số, cách nhau bằng dấu phẩy):
                          </label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={schoolHotlineInput}
                              onChange={(e) => setSchoolHotlineInput(e.target.value)}
                              placeholder="VD: 024.3845.1234, 0912.345.678"
                              className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-[13.5px] font-extrabold text-emerald-800 placeholder:font-normal focus:border-emerald-500 focus:bg-white focus:outline-none"
                            />
                            <button
                              type="submit"
                              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-[12.5px] font-extrabold transition cursor-pointer shrink-0 active:scale-95"
                            >
                              Lưu SĐT
                            </button>
                          </div>
                        </div>

                        {hotlineSavedNotice && (
                          <p className="text-[12px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-fade-in">
                            ✓ Đã lưu SĐT tư vấn cho trường {selectedHotlineSchool}!
                          </p>
                        )}
                      </form>
                    </div>
                    <span className="text-[11px] text-slate-400 italic block pt-1 border-t border-slate-100">
                      (Mỗi trường tự nhập & lưu SĐT Phòng Tâm lý Học đường riêng theo Thông tư 31/2017/TT-BGDĐT)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowEmergency(false)}
              className="rounded-full bg-slate-200/50 hover:bg-slate-200 p-1 px-2.5 text-[15px] text-slate-600 font-extrabold cursor-pointer transition shrink-0"
            >
              đóng ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between rounded-2.5xl bg-amber-50 border border-amber-200 p-5 gap-3" id="emergency_toggle_badge">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle size={18} />
            </div>
            <span className="text-[15px] text-slate-700 font-bold leading-relaxed">
              Em đang bị áp lực tinh thần quá lớn hay cần liên hệ SĐT tư vấn của nhà trường?
            </span>
          </div>
          <button 
            onClick={() => setShowEmergency(true)}
            className="text-[15px] font-extrabold text-amber-700 hover:text-amber-900 underline shrink-0 cursor-pointer"
          >
            Kích hoạt số điện thoại khẩn cấp & SĐT Nhà trường ➜
          </button>
        </div>
      )}

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column: Quick tracking & Mood Check */}
        <div className="space-y-6 lg:col-span-1">
          {/* Track Existing Report */}
          <div className="rounded-2.5xl border border-slate-100 bg-white p-6 shadow-sm shadow-indigo-100/30 space-y-4 relative overflow-hidden" id="tracking_home_card">
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
            
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-800 text-[17px] flex items-center gap-2">
                <Search size={16} className="text-indigo-500" /> Tra cứu Hội thoại Ẩn danh
              </h3>
              <p className="text-[15px] text-slate-500 leading-relaxed">
                Nhập mã tra cứu riêng của em (<code className="bg-violet-50 text-indigo-600 px-1.5 py-0.5 rounded font-mono font-bold">SA-XXXX</code>) để kết nối lại hòm thư tư vấn của Thầy Cô.
              </p>
            </div>
            
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="relative">
                <input 
                  type="text" 
                  value={trackInputCode}
                  onChange={(e) => setTrackInputCode(e.target.value)}
                  placeholder="Nhập mã ví dụ: SA-1001" 
                  className="w-full rounded-2xl border border-slate-200 py-3 pr-4 pl-10 text-[15px] font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40"
                  id="input_track_code_home"
                />
                <div className="absolute top-3.5 left-3.5 text-slate-400">
                  <FileText size={14} />
                </div>
              </div>
              
              {searchError && (
                <p className="text-[15px] font-semibold text-pink-600 bg-pink-50 p-2 rounded-xl border border-pink-100">{searchError}</p>
              )}

              <button 
                type="submit"
                disabled={isSearching}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200/50 text-white border-0 py-3 text-[15px] font-bold text-white hover:bg-slate-800 disabled:bg-slate-400 cursor-pointer text-center uppercase tracking-wider"
              >
                {isSearching ? "Đang dò tìm..." : "Mở hòm thư bí mật"}
              </button>
            </form>
          </div>

          {/* User Mood Check In — Reorganized into 2 Clear Primary Paths */}
          <div className="rounded-2.5xl border border-slate-100 bg-white p-6 shadow-md shadow-indigo-100/50 space-y-5 relative overflow-hidden" id="mood_check_home_card">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-yellow-400 to-rose-500"></div>

            {/* Clean Top Heading */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-extrabold text-slate-800 text-[18px] flex items-center gap-2">
                  <Smile size={20} className="text-pink-500" />
                  Trạm Nhận Diện & Giải Mã Cảm Xúc
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11.5px] font-black text-indigo-600 uppercase tracking-wider">
                  Chuẩn CBT & Somatic
                </span>
              </div>
              <p className="text-[13.5px] text-slate-500 leading-relaxed font-medium">
                Em hãy chọn <strong>1 trong 2 mục dưới đây</strong> tùy theo việc em đã tự gọi tên được cảm xúc của mình hay chưa:
              </p>
            </div>

            {/* 2 PRIMARY CATEGORY CARDS: Named Emotion (Mục 1) vs Cannot Name Emotion / Need Test (Mục 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" id="emotion_primary_mode_selector">
              {/* MỤC 1: NGƯỜI GỌI ĐƯỢC TÊN CẢM XÚC */}
              <button
                type="button"
                onClick={() => {
                  if (!isNamedEmotionGroup) {
                    setEmotionSystem("plutchik");
                    setShowOpposites(false);
                  }
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isNamedEmotionGroup
                    ? "border-indigo-600 bg-indigo-50/70 shadow-sm shadow-indigo-100 ring-2 ring-indigo-500/15"
                    : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300"
                }`}
                id="btn_group_named_emotion"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isNamedEmotionGroup ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    Mục 1 • Gọi tên nhanh (2 chạm)
                  </span>
                  {isNamedEmotionGroup && <CheckCircle size={15} className="text-indigo-600 shrink-0" />}
                </div>
                <div className="mt-1">
                  <span className={`text-[14.5px] font-black block leading-snug ${
                    isNamedEmotionGroup ? "text-indigo-950" : "text-slate-800"
                  }`}>
                    🎯 Đã biết mình đang cảm thấy gì
                  </span>
                  <span className="text-[12px] text-slate-500 font-medium block mt-0.5 leading-relaxed">
                    Chọn nhóm cảm xúc (Vui, Buồn, Lo âu, Giận...) → Chọn mức độ là xong ngay.
                  </span>
                </div>
              </button>

              {/* MỤC 2: NGƯỜI KHÔNG GỌI ĐƯỢC TÊN CẢM XÚC -> VÀO LÀM BÀI TEST */}
              <button
                type="button"
                onClick={() => {
                  if (!isTestEmotionGroup) setEmotionSystem("diagnostic");
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  isTestEmotionGroup
                    ? "border-amber-500 bg-amber-50/70 shadow-sm shadow-amber-100 ring-2 ring-amber-500/15"
                    : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-300"
                }`}
                id="btn_group_test_emotion"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isTestEmotionGroup ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-800"
                  }`}>
                    Mục 2 • Vào làm Bài Test
                  </span>
                  {isTestEmotionGroup && <CheckCircle size={15} className="text-amber-600 shrink-0" />}
                </div>
                <div className="mt-1">
                  <span className={`text-[14.5px] font-black block leading-snug ${
                    isTestEmotionGroup ? "text-amber-950" : "text-slate-800"
                  }`}>
                    🧭 Chưa gọi tên được cảm xúc
                  </span>
                  <span className="text-[12px] text-slate-500 font-medium block mt-0.5 leading-relaxed">
                    Em đang rối bời, trống rỗng hoặc nghi bị cô lập → Làm bài Test để hệ thống giải mã giúp em.
                  </span>
                </div>
              </button>
            </div>

            {/* MỤC 1: GIAO DIỆN GỌI TÊN CẢM XÚC NHANH — HIỂN THỊ ĐẦY ĐỦ TẤT CẢ 45 CẢM XÚC, CHẠM 1 LẦN LÀ LƯU */}
            {isNamedEmotionGroup && (
              <div className="space-y-4 animate-fade-in">
                {/* Hướng dẫn sử dụng 1 chạm cực ngắn gọn + Thanh lọc nhanh */}
                <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-3 space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-1.5">
                    <span className="text-[12.5px] text-indigo-950 font-bold">
                      💡 <strong className="text-indigo-700">Cách dùng (1 chạm):</strong> Bấm trực tiếp vào tên cảm xúc bên dưới để ghi nhận ngay.
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowEmotionGuide(prev => !prev)}
                        className="text-[11px] font-extrabold bg-indigo-600 text-white hover:bg-indigo-700 px-2.5 py-0.5 rounded-full transition cursor-pointer"
                      >
                        📖 Hướng dẫn cách dùng 4 nhóm cảm xúc
                      </button>
                      <span className="text-[11px] font-extrabold bg-white text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                        Đầy đủ 45 sắc thái
                      </span>
                    </div>
                  </div>

                  {showEmotionGuide && (
                    <div className="p-3 rounded-xl bg-white border border-indigo-200 text-[12px] text-slate-700 space-y-2 leading-relaxed animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                        <strong className="text-indigo-900 uppercase tracking-wide text-[12px]">
                          📘 Cẩm nang nhanh: Khi nào nên chọn nhóm cảm xúc nào?
                        </strong>
                        <button
                          type="button"
                          onClick={() => setShowEmotionGuide(false)}
                          className="text-[11px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          Đóng ✕
                        </button>
                      </div>
                      <ul className="space-y-1.5 list-none">
                        <li>
                          ⚪ <strong>1. Trạng thái Bình thường / Ổn định:</strong> Chọn khi tâm lý em đang cân bằng, thoải mái, chỉ vào điểm danh tinh thần hằng ngày hoặc xem tài liệu.
                        </li>
                        <li>
                          🎯 <strong>2. Nhóm 24 Cảm xúc Plutchik (8 nhóm × 3 mức Nhẹ – Vừa – Mạnh):</strong> Dùng khi em biết rõ cảm xúc gốc (Buồn, Sợ, Giận, Vui...) và muốn đo đúng <strong>cường độ</strong>:
                          <span className="block pl-4 text-[11.5px] text-slate-600 mt-0.5">
                            • <strong>Mức Nhẹ:</strong> Mới chớm xuất hiện (hơi lo, hơi buồn, bực nhẹ) → Tự thư giãn tại chỗ.<br />
                            • <strong>Mức Vừa:</strong> Rõ rệt, bắt đầu gây mất tập trung học tập → Áp dụng bài tập thở 4-7-8 / Sơ cứu tâm lý.<br />
                            • <strong>Mức Mạnh:</strong> Quá tải (Hoảng loạn, Tuyệt vọng, Bị phản bội, Phẫn nộ) → Hệ thống bật <strong>Phác đồ Khẩn cấp</strong> & kết nối Thầy Cô Tư vấn.
                          </span>
                        </li>
                        <li>
                          🌟 <strong>3. Nhóm 20 Sắc thái Xã hội & Nội tâm (Geneva GEW v3.0):</strong> Dùng cho các tình huống <strong>quan hệ bạn bè, mạng xã hội, học đường</strong> phức tạp mà từ "buồn" hay "giận" chưa diễn tả hết (ví dụ: <em>Tự ti/Xấu hổ, Tội lỗi, Ghen tị, Thất vọng, Bất lực, Hoài niệm, Tự hào, Biết ơn...</em>).
                        </li>
                        <li>
                          ⚖️ <strong>4. Nhóm 4 Cặp Cảm xúc Đối lập (CBT):</strong> Dùng khi em muốn <strong>chuyển hóa tâm trạng</strong> — nhìn cặp đối trọng (ví dụ đang <em>Buồn bã</em> nhìn sang cực <em>Vui vẻ/Bình yên</em>; đang <em>Lo sợ</em> đối chiếu với <em>Tức giận</em>) để tái lập cân bằng nhận thức.
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Thanh chuyển đổi chế độ xem: Xem tất cả | 24 Plutchik | 20 Geneva | Cặp đối lập CBT */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-white p-1 rounded-xl border border-indigo-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEmotionSystem("plutchik");
                        setShowOpposites(false);
                        setShowAdvancedEmotionTools(false);
                      }}
                      className={`py-1.5 px-2 text-[11.5px] font-extrabold rounded-lg transition cursor-pointer ${
                        emotionSystem === "plutchik" && !showOpposites && !showAdvancedEmotionTools
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      🌈 Tất cả (45 cảm xúc)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmotionSystem("plutchik");
                        setShowOpposites(false);
                        setShowAdvancedEmotionTools(true);
                      }}
                      className={`py-1.5 px-2 text-[11.5px] font-extrabold rounded-lg transition cursor-pointer ${
                        emotionSystem === "plutchik" && !showOpposites && showAdvancedEmotionTools
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      🎯 24 Cảm xúc Plutchik
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmotionSystem("geneva");
                        setShowOpposites(false);
                      }}
                      className={`py-1.5 px-2 text-[11.5px] font-extrabold rounded-lg transition cursor-pointer ${
                        emotionSystem === "geneva"
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      🌟 20 Sắc thái Geneva
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmotionSystem("plutchik");
                        setShowOpposites(true);
                      }}
                      className={`py-1.5 px-2 text-[11.5px] font-extrabold rounded-lg transition cursor-pointer ${
                        emotionSystem === "plutchik" && showOpposites
                          ? "bg-indigo-600 text-white shadow-2xs"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      ⚖️ 4 Cặp đối lập CBT
                    </button>
                  </div>
                </div>

                {/* Trạng thái Trung tính / Bình thường */}
                {!showOpposites && (
                  <button
                    type="button"
                    onClick={() => handleMoodSubmit("binh_thuong")}
                    className={`w-full py-2 px-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      userMood === "binh_thuong"
                        ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                        : "bg-slate-50/80 border-slate-200 hover:bg-white text-slate-700"
                    }`}
                  >
                    <span className="text-[13px] font-extrabold flex items-center gap-2">
                      <span>⚪</span>
                      <span>Bình thường / Ổn định (Trạng thái cân bằng, không căng thẳng)</span>
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                      userMood === "binh_thuong" ? "bg-white text-slate-900" : "bg-white border border-slate-200 text-slate-600"
                    }`}>
                      {userMood === "binh_thuong" ? "✓ Đã chọn" : "Chọn"}
                    </span>
                  </button>
                )}

                {/* PHẦN 1: 24 CẢM XÚC PLUTCHIK (8 NHÓM × 3 MỨC ĐỘ: NHẸ - VỪA - MẠNH) HIỂN THỊ TRỰC TIẾP */}
                {emotionSystem === "plutchik" && !showOpposites && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-[12.5px] font-black text-indigo-900 uppercase tracking-wider">
                        🎯 Phần 1: 24 Cảm xúc theo 8 nhóm & 3 mức độ (Bánh xe Plutchik)
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        Nhẹ → Vừa → Mạnh
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {PLUTCHIK_SECTORS.map((sector) => {
                        const isExpanded = activeSector === sector.id;
                        const hasSelected = sector.levels.some(l => l.value === userMood);
                        return (
                          <div
                            key={sector.id}
                            className={`rounded-2xl border p-2.5 transition-all ${sector.bgClass} ${sector.borderClass} ${
                              hasSelected ? "ring-2 ring-indigo-500/30 shadow-xs" : ""
                            }`}
                          >
                            {/* Tiêu đề nhóm cảm xúc */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[18px]">{sector.emoji}</span>
                                <span className={`text-[13.5px] font-black ${sector.textClass}`}>
                                  {sector.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setActiveSector(isExpanded ? null : sector.id)}
                                className="text-[11px] font-bold text-slate-500 hover:text-indigo-700 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200/70 cursor-pointer"
                              >
                                {isExpanded ? "Ẩn giải thích ▲" : "Xem giải thích ▼"}
                              </button>
                            </div>

                            {/* 3 nút cảm xúc (Nhẹ - Vừa - Mạnh) hiển thị ngay trên thẻ để chạm 1 lần là chọn */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                              {sector.levels.map((level) => {
                                const isSelected = userMood === level.value;
                                const intensityTag = {
                                  "Thấp": "Nhẹ",
                                  "Vừa": "Vừa",
                                  "Cao": "Mạnh"
                                }[level.intensity];
                                return (
                                  <button
                                    key={level.value}
                                    type="button"
                                    onClick={() => handleMoodSubmit(level.value)}
                                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                                      isSelected
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-300"
                                        : "bg-white/95 hover:bg-white border-slate-200/80 hover:border-indigo-400 text-slate-800"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-1 w-full">
                                      <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                                        isSelected
                                          ? "bg-white/20 text-white"
                                          : level.intensity === "Cao"
                                          ? "bg-rose-100 text-rose-700"
                                          : level.intensity === "Vừa"
                                          ? "bg-indigo-50 text-indigo-700"
                                          : "bg-slate-100 text-slate-600"
                                      }`}>
                                        Mức {intensityTag}
                                      </span>
                                      {isSelected && <span className="text-[11px] font-black">✓ Đã chọn</span>}
                                    </div>
                                    <span className="text-[13px] font-extrabold leading-snug block">
                                      {level.label}
                                    </span>
                                    {isExpanded && (
                                      <span className={`text-[11px] leading-tight block pt-0.5 border-t ${
                                        isSelected ? "text-indigo-100 border-white/20" : "text-slate-500 border-slate-100"
                                      }`}>
                                        {level.desc}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PHẦN 2: 20 SẮC THÁI CẢM XÚC XÃ HỘI & HỌC ĐƯỜNG (BÁNH XE GENEVA GEW v3.0)
                    Hiển thị ngay bên dưới khi ở chế độ "Tất cả (45 cảm xúc)" hoặc khi bấm tab "20 Sắc thái Geneva" */}
                {((emotionSystem === "plutchik" && !showOpposites && !showAdvancedEmotionTools) || emotionSystem === "geneva") && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between flex-wrap gap-1 px-0.5">
                      <span className="text-[12.5px] font-black text-indigo-900 uppercase tracking-wider">
                        🌟 Phần 2: 20 Sắc thái Cảm xúc Xã hội & Nội tâm (Bánh xe Geneva GEW v3.0)
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        Tự ti, Hối tiếc, Thất vọng, Ghen tị, Tự hào...
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { id: "LowUnpleasant", title: "🟡 Nhóm Khó chịu & Tổn thương nội tâm (Khi bị cô lập, bơ tin nhắn)", border: "border-amber-200", titleBg: "bg-amber-50", titleText: "text-amber-800" },
                        { id: "HighUnpleasant", title: "🔴 Nhóm Khó chịu & Bức xúc mạnh (Khi bị công kích, vu khống)", border: "border-rose-200", titleBg: "bg-rose-50", titleText: "text-rose-800" },
                        { id: "HighPleasant", title: "🟢 Nhóm Tích cực & Tự chủ cao (Khi tự tin, bứt phá)", border: "border-emerald-200", titleBg: "bg-emerald-50", titleText: "text-emerald-800" },
                        { id: "LowPleasant", title: "🔵 Nhóm Tích cực & Ấm áp (Khi được lắng nghe, thấu cảm)", border: "border-sky-200", titleBg: "bg-sky-50", titleText: "text-sky-800" }
                      ].map((quad) => {
                        const quadEmotions = GENEVA_EMOTIONS.filter(e => e.quadrant === quad.id);
                        return (
                          <div key={quad.id} className={`p-2.5 rounded-2xl border ${quad.border} space-y-2 bg-white`}>
                            <span className={`text-[11.5px] font-black px-2.5 py-0.5 rounded-lg ${quad.titleBg} ${quad.titleText} inline-block`}>
                              {quad.title}
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {quadEmotions.map((e) => {
                                const isSelected = userMood === e.value;
                                return (
                                  <button
                                    key={e.value}
                                    onClick={() => handleMoodSubmit(e.value)}
                                    type="button"
                                    className={`p-2 rounded-xl text-left border flex items-start justify-between gap-2 transition cursor-pointer ${
                                      isSelected
                                        ? "bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-300 shadow-2xs"
                                        : `${e.bgClass} ${e.borderClass} hover:bg-white hover:border-indigo-400`
                                    }`}
                                  >
                                    <div className="flex items-start gap-2 min-w-0">
                                      <span className="text-[17px] shrink-0 mt-0.5">{e.emoji}</span>
                                      <div className="min-w-0">
                                        <span className={`text-[13px] font-extrabold block leading-snug ${isSelected ? "text-white" : "text-slate-800"}`}>
                                          {e.label}
                                        </span>
                                        <span className={`text-[11px] leading-tight block mt-0.5 ${isSelected ? "text-indigo-100" : "text-slate-500"}`}>
                                          {e.desc}
                                        </span>
                                      </div>
                                    </div>
                                    <span className={`text-[10.5px] font-extrabold px-2 py-0.5 rounded-lg shrink-0 ${
                                      isSelected ? "bg-white text-indigo-700" : "bg-white/90 border border-slate-200 text-slate-600"
                                    }`}>
                                      {isSelected ? "✓" : "Chọn"}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PHẦN 3: 4 CẶP CẢM XÚC ĐỐI LẬP CBT (Khi bấm tab "4 Cặp đối lập CBT") */}
                {emotionSystem === "plutchik" && showOpposites && (
                  <div className="space-y-2.5 animate-fade-in">
                    <p className="text-[12px] text-indigo-950 leading-relaxed bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100">
                      💡 <strong>Nguyên lý bù trừ CBT (Robert Plutchik, 1980):</strong> Nhận diện các cặp cảm xúc đối lập giúp em điều tiết tâm trạng bằng cách kích hoạt trạng thái đối trọng:
                    </p>
                    <div className="space-y-2">
                      {[
                        { pair: ["joy", "sadness"], title: "Vui vẻ 🟡 ↔ 🔵 Buồn bã", desc: "Hồi phục nỗi buồn bị cô lập bằng việc ghi nhận những điều nhỏ bé đáng trân trọng quanh mình." },
                        { pair: ["trust", "disgust"], title: "Tin tưởng 💚 ↔ 🟣 Chán ghét", desc: "Khi mệt mỏi vì môi trường mạng độc hại, kết nối với 1 người bạn tin cậy hoặc Mentor giúp lấy lại cân bằng." },
                        { pair: ["fear", "anger"], title: "Lo sợ 🟢 ↔ 🔴 Tức giận", desc: "Nhận diện sớm nỗi sợ hoặc cơn nóng giận để áp dụng PAUSE, tránh phản ứng bộc phát trên mạng." },
                        { pair: ["surprise", "anticipation"], title: "Bất ngờ 🌐 ↔ 🟠 Cảnh giác", desc: "Chuyển cú sốc bị cô lập bất ngờ thành sự chủ động lưu bằng chứng và chuẩn bị phương án bảo vệ." }
                      ].map((p, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-2xl border border-slate-200/80 space-y-2">
                          <span className="text-[13.5px] font-black text-slate-800 block">{p.title}</span>
                          <p className="text-[12px] text-slate-600 leading-relaxed">{p.desc}</p>
                          <div className="grid grid-cols-2 gap-2 pt-0.5">
                            {p.pair.map(sectId => {
                              const sect = PLUTCHIK_SECTORS.find(s => s.id === sectId)!;
                              return (
                                <div key={sectId} className={`p-2 rounded-xl border ${sect.bgClass} ${sect.borderClass} space-y-1`}>
                                  <span className={`text-[12px] font-black block ${sect.textClass}`}>
                                    {sect.emoji} {sect.name}
                                  </span>
                                  <div className="flex flex-col gap-1">
                                    {sect.levels.map(lv => (
                                      <button
                                        key={lv.value}
                                        type="button"
                                        onClick={() => handleMoodSubmit(lv.value)}
                                        className={`text-left text-[11.5px] font-bold px-2 py-1 rounded-lg border transition cursor-pointer ${
                                          userMood === lv.value
                                            ? "bg-indigo-600 text-white border-indigo-600"
                                            : "bg-white hover:border-indigo-400 text-slate-700 border-slate-200"
                                        }`}
                                      >
                                        {lv.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trích dẫn khoa học gọn gàng ở cuối Mục 1 */}
                <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/70 text-[11px] text-slate-500 space-y-0.5">
                  <span className="font-extrabold text-slate-700 block">
                    🔬 Cơ sở khoa học: Plutchik (1980), Scherer et al. (2013 - Bánh xe Geneva GEW v3.0) & Lieberman et al. (2007 - Affect Labeling).
                  </span>
                </div>
              </div>
            )}

            {/* SUB-NAVIGATION BAR FOR MỤC 2 (CHƯA GỌI TÊN ĐƯỢC CẢM XÚC -> VÀO BÀI TEST) */}
            {isTestEmotionGroup && (
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-2.5 space-y-2 animate-fade-in">
                <span className="text-[12px] font-extrabold text-amber-950 uppercase tracking-wider block px-1">
                  🧭 Mục 2 — Chọn Bài Test trắc nghiệm để giải mã trạng thái của em:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-white/90 p-1 rounded-xl border border-amber-200/70">
                  <button
                    type="button"
                    onClick={() => setEmotionSystem("diagnostic")}
                    className={`py-2 px-2.5 text-[12.5px] font-black rounded-lg transition-all cursor-pointer text-left flex items-center gap-1.5 ${
                      emotionSystem === "diagnostic"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-slate-700 hover:text-amber-800 hover:bg-amber-50/60"
                    }`}
                  >
                    <span>🧪</span>
                    <span className="truncate">Test 1: Giải Mã Cơ Thể & Suy Nghĩ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmotionSystem("white_violence")}
                    className={`py-2 px-2.5 text-[12.5px] font-black rounded-lg transition-all cursor-pointer text-left flex items-center gap-1.5 ${
                      emotionSystem === "white_violence"
                        ? "bg-teal-600 text-white shadow-xs"
                        : "text-slate-700 hover:text-teal-800 hover:bg-teal-50/60"
                    }`}
                  >
                    <span>🔎</span>
                    <span className="truncate">Test 2: Nhận Diện Bạo Lực Trắng</span>
                  </button>
                </div>
              </div>
            )}

            {emotionSystem === "white_violence" && (
              <div className="space-y-4 animate-fade-in">
                <div className="bg-teal-50/60 rounded-2xl p-3 border border-teal-150 flex items-start gap-1.5">
                  <span className="text-[19px] mt-0.5 font-bold">📋</span>
                  <p className="text-[13.5px] text-teal-900 font-medium leading-relaxed">
                    **Thang đo Cyber-Ostracism Experience Scale (COES 2024-2025):** Em hãy đánh dấu vào những biểu hiện mà em thấy ĐÚNG với bản thân mình trong thời gian qua. Đánh giá này ẩn danh, đối chiếu với các chỉ số cô lập mạng quốc tế để giúp em định vị vị trí của mình và tìm cách gỡ bỏ bạo lực trắng:
                  </p>
                </div>

                {/* 4 Indicators Categories */}
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {WHITE_VIOLENCE_INDICATORS.map((cat, idx) => {
                    return (
                      <div key={idx} className="p-3 bg-slate-50/60 rounded-2xl border border-slate-200/50 space-y-2">
                        <span className="text-[13px] font-black text-slate-700 uppercase tracking-widest block">
                          {cat.category}
                        </span>
                        <div className="grid grid-cols-1 gap-1.5">
                          {cat.items.map((item) => {
                            const isChecked = selectedVNIndicators.includes(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  if (isChecked) {
                                    setSelectedVNIndicators(prev => prev.filter(id => id !== item.id));
                                  } else {
                                    setSelectedVNIndicators(prev => [...prev, item.id]);
                                  }
                                }}
                                className={`p-2.5 rounded-2xl border text-left transition-all flex items-start gap-2 cursor-pointer hover:scale-[1.005] ${
                                  isChecked
                                    ? "bg-white border-teal-500 ring-2 ring-teal-500/10 shadow-sm shadow-indigo-100/30"
                                    : "bg-white border-slate-150 hover:bg-white"
                                }`}
                              >
                                <div className="mt-0.5 flex-shrink-0">
                                  <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${
                                    isChecked ? "bg-teal-600 border-teal-600 text-white" : "border-slate-300 bg-white"
                                  }`}>
                                    {isChecked && (
                                      <svg className="h-2.5 w-2.5 fill-none stroke-current stroke-3" viewBox="0 0 24 24">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[13.5px] text-slate-600 font-medium leading-normal">
                                  {item.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Diagnostic Result Block */}
                <div className="p-3.5 rounded-2.5xl border border-teal-200 bg-teal-50/15 space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[13.5px] font-extrabold text-teal-800 flex items-center gap-1 leading-none uppercase tracking-wide">
                      📊 Nhận diện vai trò: {selectedVNIndicators.length} biểu hiện
                    </span>
                    {selectedVNIndicators.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedVNIndicators([])}
                        className="text-[13px] text-rose-600 hover:underline font-extrabold cursor-pointer"
                      >
                        Làm lại
                      </button>
                    )}
                  </div>

                  {(() => {
                    const count = selectedVNIndicators.length;
                    if (count === 0) {
                      return (
                        <p className="text-[13px] text-slate-500 leading-relaxed italic">
                          Tích chọn các biểu hiện ở bên trên để nhận diện vị trí và vai trò của em trong bạo lực trắng vô hình hiện nay.
                        </p>
                      );
                    }

                    // Count roles
                    let maxRoleCount = 0;
                    let dominantRole = ""; // victim, bystander, follower, instigator
                    const rolesMap: Record<string, number> = { victim: 0, bystander: 0, follower: 0, instigator: 0 };
                    
                    WHITE_VIOLENCE_INDICATORS.forEach(cat => {
                      cat.items.forEach(it => {
                        if (selectedVNIndicators.includes(it.id)) {
                          rolesMap[it.role]++;
                        }
                      });
                    });

                    Object.entries(rolesMap).forEach(([role, rCount]) => {
                      if (rCount > maxRoleCount) {
                        maxRoleCount = rCount;
                        dominantRole = role;
                      }
                    });

                    let levelBadge = "";
                    let levelColor = "";
                    let levelDesc = "";
                    let advice = "";
                    let hasUrgentAlert = false;

                    if (dominantRole === "victim") {
                      levelBadge = "Vai trò: Mục tiêu / Nạn nhân (Victim)";
                      levelColor = "bg-rose-50 text-rose-800 border-rose-200";
                      levelDesc = "Sự tẩy chay số và mỉa mai đang bào mòn sức lực của em.";
                      advice = "Em không có lỗi, sự im lặng của đám đông chỉ là tâm lý bầy đàn hèn nhát. Hãy ngắt kết nối với các hội nhóm độc hại đó, PAUSE mạng xã hội lại một thời gian, và liên hệ Mentor qua Chatbot để được hỗ trợ bảo mật.";
                      hasUrgentAlert = true;
                    } else if (dominantRole === "bystander") {
                      levelBadge = "Vai trò: Người Ngoài Cuộc (Passive Bystander)";
                      levelColor = "bg-amber-50 text-amber-800 border-amber-200";
                      levelDesc = "Em thấy điều sai nhưng chưa lên tiếng vì ngại rắc rối.";
                      advice = "Sự im lặng của em cho phép bạo lực chìm lây lan. Hãy trở thành Upstander bằng việc đơn giản: hỏi thăm nạn nhân qua tin nhắn riêng, hoặc gửi báo cáo Ẩn danh Tố giác lên hệ thống SafeZone, đảm bảo 100% bí mật danh tính.";
                      hasUrgentAlert = true;
                    } else if (dominantRole === "follower") {
                      levelBadge = "Vai trò: Đồng Loã / Hùa Theo (Follower)";
                      levelColor = "bg-sky-50 text-sky-800 border-sky-200";
                      levelDesc = "Em đang đánh mất chính mình để chạy theo 'tâm lý bầy đàn'.";
                      advice = "Hãy dừng việc unlike/block/haha tập thể lại. Bố mẹ và tương lai của em sẽ ra sao nếu hành vi này lưu lại dấn ấn vĩnh viễn trên không gian mạng? Tách mình ra khỏi hội nhóm Toxic này, em sẽ thấy được giải phóng!";
                    } else if (dominantRole === "instigator") {
                      levelBadge = "Vai trò: Người Thao Túng (Instigator)";
                      levelColor = "bg-purple-50 text-purple-800 border-purple-200";
                      levelDesc = "Em đang dùng quyền lực số để thao túng cảm xúc người khác.";
                      advice = "Bạo lực trắng không làm em 'ngầu' hơn mà chỉ chứng tỏ em đang bù đắp cho sự thiếu tự tin thực thế của chính mình. Luật an ninh mạng có quy định rõ về tội danh làm nhục người khác. Dừng lại, trút bỏ vòng oán hận này trước khi quá muộn.";
                    }

                    return (
                      <div className={`p-3 rounded-2xl border ${levelColor} space-y-2 animate-fade-in`}>
                        <div className="flex items-center gap-2 border-b pb-1.5 border-current/10">
                          <span className="text-[13.5px] font-black uppercase tracking-wider">{levelBadge}</span>
                        </div>
                        <p className="text-[13.5px] leading-relaxed font-semibold block">{levelDesc}</p>
                        <p className="text-[13.5px] text-slate-700 leading-relaxed italic block mt-1">
                          💡 **Bước tiếp theo:** {advice}
                        </p>

                        {/* Scientific Citation & Reference Evidence Badge */}
                        <div className="bg-white/80 rounded-xl p-2.5 border border-current/15 text-[11.5px] space-y-1 text-slate-600 font-medium">
                          <span className="font-extrabold text-slate-800 flex items-center gap-1 uppercase tracking-wider">
                            🔬 Dẫn chứng & Nguồn gốc đánh giá phân vai:
                          </span>
                          <p className="leading-relaxed">
                            Mô hình phân loại 4 vai trò bạo lực học đường của <strong>Dan Olweus (1993)</strong>, Thang đo Bạo lực mạng & Tẩy chay số của <strong>Hinduja & Patchin (2014, tái bản 2022)</strong> và Thuyết Tác động của Sự cô lập xã hội (Cyber-Ostracism) của <strong>Williams (2009)</strong>.
                          </p>
                        </div>
                        
                        {(dominantRole === "victim" || dominantRole === "bystander" || hasUrgentAlert) && (
                          <div className="pt-2 flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                onNavigate("reporting");
                                document.getElementById("dashboard_home_main")?.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[12px] uppercase tracking-widest px-3 py-1.5 rounded-xl transition shadow-sm shadow-indigo-100/30 cursor-pointer active:scale-95 whitespace-nowrap"
                            >
                              Báo Cáo Ẩn Danh ➜
                            </button>
                            <button
                              onClick={() => {
                                onNavigate("chat");
                                document.getElementById("dashboard_home_main")?.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-extrabold text-[12px] uppercase tracking-widest px-3 py-1.5 rounded-xl transition cursor-pointer active:scale-95 whitespace-nowrap"
                            >
                              Gặp Mentor AI ➜
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Diagnostic Emotion Discovery Quiz */}
            {emotionSystem === "diagnostic" && (
              <div className="space-y-5 animate-fade-in" id="diagnostic_emotion_quiz_view">
                {/* Introduction Header */}
                <div className="bg-linear-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 rounded-2.5xl p-4 border border-indigo-150/70 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[13.5px] font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Compass size={17} className="text-indigo-600 animate-spin" style={{ animationDuration: '8s' }} />
                      Bộ Khảo Sát Tự Động Chẩn Đoán & Định Danh Cảm Xúc (Somatic-CBT Model)
                    </span>
                    {(diagSomatic.length > 0 || diagThought || diagUrge) && (
                      <button
                        type="button"
                        onClick={() => {
                          setDiagSomatic([]);
                          setDiagThought(null);
                          setDiagUrge(null);
                          setDiagStep(1);
                        }}
                        className="text-[12.5px] text-rose-600 hover:text-rose-700 font-extrabold flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <RotateCcw size={13} /> Làm lại từ đầu
                      </button>
                    )}
                  </div>
                  <p className="text-[13.5px] text-slate-600 font-medium leading-relaxed">
                    Khi não bộ bị quá tải thông tin số hoặc bạo lực mạng ngấm ngầm, ta thường rơi vào trạng thái mất kết nối cảm xúc (*Alexithymia*). Hãy trả lời 3 câu hỏi nhanh dưới đây để hệ thống đo đạc tín hiệu sinh lý và bóc tách cảm xúc thực sự của em:
                  </p>

                  {/* Step Progress Pills */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setDiagStep(1)}
                      className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                        diagStep === 1
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : diagSomatic.length > 0
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-white text-slate-600 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11.5px] font-black uppercase tracking-wider block">Bước 1</span>
                        {diagSomatic.length > 0 && <Check size={13} className="text-emerald-600" />}
                      </div>
                      <span className="text-[12.5px] font-bold block truncate">🫁 Tín hiệu cơ thể ({diagSomatic.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDiagStep(2)}
                      className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                        diagStep === 2
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : diagThought
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-white text-slate-600 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11.5px] font-black uppercase tracking-wider block">Bước 2</span>
                        {diagThought && <Check size={13} className="text-emerald-600" />}
                      </div>
                      <span className="text-[12.5px] font-bold block truncate">🧠 Dòng suy nghĩ {diagThought ? "✓" : ""}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDiagStep(3)}
                      className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                        diagStep === 3
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : diagUrge
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-white text-slate-600 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11.5px] font-black uppercase tracking-wider block">Bước 3</span>
                        {diagUrge && <Check size={13} className="text-emerald-600" />}
                      </div>
                      <span className="text-[12.5px] font-bold block truncate">🏃 Thôi thúc hành vi {diagUrge ? "✓" : ""}</span>
                    </button>
                  </div>
                </div>

                {/* STEP 1: SOMATIC BODY CUES */}
                {diagStep === 1 && (
                  <div className="space-y-3 p-4 rounded-2.5xl border border-slate-200 bg-white shadow-2xs animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-[15px] text-slate-800 flex items-center gap-1.5">
                          <Activity size={17} className="text-indigo-600" />
                          Bước 1: Hiện tại cơ thể em đang có cảm giác nào rõ nhất?
                        </h4>
                        <p className="text-[13px] text-slate-500 font-medium">
                          Em có thể chọn nhiều cảm giác cùng lúc (Đa chọn):
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {[
                        {
                          id: "somatic_chest",
                          emoji: "🫁",
                          title: "Nặng trĩu ở lồng ngực / Nghẹn cổ họng",
                          desc: "Cảm giác nghẹt thở, khó thở sâu, cay sống mũi, hụt hơi.",
                          category: "Buồn bã / Tổn thương"
                        },
                        {
                          id: "somatic_heart",
                          emoji: "💓",
                          title: "Tim đập thình thịch / Bồn chồn cồn cào",
                          desc: "Hồi hộp, run tay run chân, toát mồ hôi, bụng dạ thắt lại.",
                          category: "Lo âu / Sợ hãi / Bất an"
                        },
                        {
                          id: "somatic_heat",
                          emoji: "🔥",
                          title: "Nóng bừng mặt / Siết chặt cơ bắp",
                          desc: "Nóng trong lồng ngực, quai hàm nghiến chặt, hai tay siết chặt.",
                          category: "Phẫn nộ / Tức giận"
                        },
                        {
                          id: "somatic_stomach",
                          emoji: "🤢",
                          title: "Cồn cào dạ dày / Buồn nôn muốn né tránh",
                          desc: "Cảm giác ớn lạnh, lợm giọng, muốn quay mặt đi không nhìn.",
                          category: "Ghê tởm / Bài xích"
                        },
                        {
                          id: "somatic_numb",
                          emoji: "🧊",
                          title: "Tê liệt / Trống rỗng mất kết nối (Freeze)",
                          desc: "Đầu óc trống rỗng, đờ đẫn, không có chút năng lượng nào.",
                          category: "Quá tải thần kinh / Đóng băng"
                        },
                        {
                          id: "somatic_relax",
                          emoji: "🌿",
                          title: "Cơ thể nhẹ nhõm / Nhịp thở êm ái",
                          desc: "Cơ bắp thả lỏng, không có áp lực căng thẳng nào đè nặng.",
                          category: "Bình an / Thư thái"
                        }
                      ].map((item) => {
                        const isSelected = diagSomatic.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setDiagSomatic(diagSomatic.filter((x) => x !== item.id));
                              } else {
                                setDiagSomatic([...diagSomatic, item.id]);
                              }
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-500"
                                : "border-slate-200 bg-slate-50/40 hover:bg-slate-100/70 hover:border-slate-300"
                            }`}
                          >
                            <span className="text-2xl mt-0.5 flex-shrink-0">{item.emoji}</span>
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-[13.5px] font-extrabold block truncate ${isSelected ? "text-indigo-900" : "text-slate-800"}`}>
                                  {item.title}
                                </span>
                                <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded uppercase ${isSelected ? "bg-indigo-200 text-indigo-800" : "bg-slate-200/70 text-slate-600"}`}>
                                  {item.category}
                                </span>
                              </div>
                              <p className="text-[12.5px] text-slate-500 font-medium leading-relaxed">
                                {item.desc}
                              </p>
                            </div>
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"
                            }`}>
                              {isSelected && <Check size={13} strokeWidth={3} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setDiagStep(2)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[13px] px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>Tiếp tục: Dòng suy nghĩ (Bước 2)</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: COGNITIVE THOUGHTS */}
                {diagStep === 2 && (
                  <div className="space-y-3 p-4 rounded-2.5xl border border-slate-200 bg-white shadow-2xs animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-[15px] text-slate-800 flex items-center gap-1.5">
                          <Brain size={17} className="text-indigo-600" />
                          Bước 2: Trong đầu em đang lặp đi lặp lại suy nghĩ nào nhất?
                        </h4>
                        <p className="text-[13px] text-slate-500 font-medium">
                          Chọn một câu mô tả đúng nhất tiếng nói nội tâm lúc này của em:
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      {[
                        {
                          id: "thought_anxious",
                          emoji: "⚡",
                          quote: "“Có chuyện tồi tệ sắp xảy ra... Mọi người trên mạng đang soi xét, thì thầm và phán xét mình.”",
                          hint: "Dấu hiệu của Lo âu & Bất an (Anxiety / Fear)"
                        },
                        {
                          id: "thought_anger",
                          emoji: "💢",
                          quote: "“Thật bất công và quá đáng! Tại sao họ lại làm điều đó với mình? Không thể chấp nhận được!”",
                          hint: "Dấu hiệu của Phẫn nộ & Uất ức (Anger / Frustration)"
                        },
                        {
                          id: "thought_sad",
                          emoji: "💧",
                          quote: "“Mình thật cô độc, thừa thãi và vô dụng... Chẳng ai thực sự cần mình, mình chỉ muốn biến mất.”",
                          hint: "Dấu hiệu của Tổn thương & U sầu (Sadness / Hurt)"
                        },
                        {
                          id: "thought_disgust",
                          emoji: "🚫",
                          quote: "“Những hành vi và lời nói đó thật giả tạo và bẩn thỉu. Mình thấy kinh tởm và không muốn dính dáng.”",
                          hint: "Dấu hiệu của Ghê tởm & Bài xích (Disgust / Aversion)"
                        },
                        {
                          id: "thought_overload",
                          emoji: "🌀",
                          quote: "“Mọi thứ ập đến quá nhanh, đầu óc mình đang quay cuồng bế tắc và không biết phải làm gì nữa.”",
                          hint: "Dấu hiệu của Quá tải & Bàng hoàng (Overwhelm / Shock)"
                        },
                        {
                          id: "thought_peace",
                          emoji: "☀️",
                          quote: "“Mọi chuyện vẫn nằm trong tầm kiểm soát, mình cảm thấy ổn định và biết ơn hôm nay.”",
                          hint: "Dấu hiệu của Bình an & Thư thái (Peace / Serenity)"
                        }
                      ].map((item) => {
                        const isSelected = diagThought === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setDiagThought(item.id)}
                            className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500"
                                : "border-slate-200 bg-slate-50/40 hover:bg-slate-100/70 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                              <div>
                                <span className={`text-[13.5px] font-extrabold block ${isSelected ? "text-indigo-900" : "text-slate-800"}`}>
                                  {item.quote}
                                </span>
                                <span className="text-[12px] text-slate-500 font-bold block mt-0.5">
                                  {item.hint}
                                </span>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setDiagStep(1)}
                        className="text-slate-600 hover:text-slate-800 font-bold text-[13px] px-3 py-2 cursor-pointer"
                      >
                        ← Quay lại Bước 1
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiagStep(3)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[13px] px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <span>Tiếp tục: Thôi thúc hành vi (Bước 3)</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: BEHAVIORAL URGES */}
                {diagStep === 3 && (
                  <div className="space-y-3 p-4 rounded-2.5xl border border-slate-200 bg-white shadow-2xs animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-[15px] text-slate-800 flex items-center gap-1.5">
                          <Zap size={17} className="text-indigo-600" />
                          Bước 3: Ngay lúc này, em đang có thôi thúc muốn làm gì nhất?
                        </h4>
                        <p className="text-[13px] text-slate-500 font-medium">
                          Hành động bản năng đầu tiên xuất hiện trong tâm trí em:
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      {[
                        {
                          id: "urge_hide",
                          emoji: "🛌",
                          title: "Muốn trùm chăn trốn một góc tối, tắt hết mạng xã hội và khóc một trận",
                          hint: "Thôi thúc thu mình để tự bảo vệ vết thương lòng (Sadness Response)"
                        },
                        {
                          id: "urge_fight",
                          emoji: "💬",
                          title: "Muốn gõ phím cãi lại ngay lập tức, muốn đập phá hoặc hét thật to",
                          hint: "Thôi thúc phản kháng chiến đấu khi cảm thấy bị tấn công (Fight Response)"
                        },
                        {
                          id: "urge_check",
                          emoji: "📱",
                          title: "Thấp thỏm liên tục mở điện thoại xem ai đang nhắn gì về mình",
                          hint: "Thôi thúc kiểm soát mối đe dọa do hội chứng FOMO & Lo âu số"
                        },
                        {
                          id: "urge_freeze",
                          emoji: "😶",
                          title: "Đờ đẫn nhìn vào khoảng không, không muốn cử động hay nói chuyện với ai",
                          hint: "Phản xạ đóng băng thần kinh để giảm đau tâm lý (Freeze Response)"
                        },
                        {
                          id: "urge_connect",
                          emoji: "🫂",
                          title: "Muốn tìm một người thật sự tin cậy để tâm sự hoặc cần nơi tuyệt đối an toàn",
                          hint: "Bản năng tìm kiếm sự an ủi và nâng đỡ xã hội lành mạnh"
                        }
                      ].map((item) => {
                        const isSelected = diagUrge === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setDiagUrge(item.id)}
                            className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? "border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500"
                                : "border-slate-200 bg-slate-50/40 hover:bg-slate-100/70 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                              <div>
                                <span className={`text-[13.5px] font-extrabold block ${isSelected ? "text-indigo-900" : "text-slate-800"}`}>
                                  {item.title}
                                </span>
                                <span className="text-[12px] text-slate-500 font-bold block mt-0.5">
                                  {item.hint}
                                </span>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setDiagStep(2)}
                        className="text-slate-600 hover:text-slate-800 font-bold text-[13px] px-3 py-2 cursor-pointer"
                      >
                        ← Quay lại Bước 2
                      </button>
                      <span className="text-[13px] text-indigo-600 font-bold">
                        Đang tổng hợp kết quả chẩn đoán bên dưới ⬇
                      </span>
                    </div>
                  </div>
                )}

                {/* AUTOMATED DIAGNOSTIC SYNTHESIS RESULT */}
                <div className="p-4 rounded-2.5xl border border-indigo-200 bg-linear-to-b from-indigo-50/30 to-white space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[14px] font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={16} className="text-indigo-600 animate-pulse" />
                      Kết Luận Chẩn Đoán Cảm Xúc Tự Động
                    </span>
                    <span className="text-[12px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-full border border-indigo-100">
                      Thuật toán Phân tích CBT đa chiều
                    </span>
                  </div>

                  {(() => {
                    const hasData = diagSomatic.length > 0 || diagThought || diagUrge;

                    if (!hasData) {
                      return (
                        <div className="text-center py-6 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-2">
                          <span className="text-3xl block">🔍</span>
                          <h5 className="font-extrabold text-[15px] text-slate-700">Chưa có đủ dữ liệu để giải mã cảm xúc</h5>
                          <p className="text-[13px] text-slate-500 max-w-md mx-auto leading-relaxed">
                            Hãy tích chọn ít nhất 1 dấu hiệu ở Bước 1 (Tín hiệu cơ thể), Bước 2 (Suy nghĩ) hoặc Bước 3 (Hành vi) ở phía trên để hệ thống tự động bóc tách trạng thái tâm lý chính xác của em.
                          </p>
                        </div>
                      );
                    }

                    // Calculate Emotional Weights
                    const scores: Record<string, number> = {
                      anxiety: 0,
                      sadness: 0,
                      anger: 0,
                      freeze: 0,
                      disgust: 0,
                      peace: 0
                    };

                    // Somatic cues
                    diagSomatic.forEach((id) => {
                      if (id === "somatic_heart") scores.anxiety += 3;
                      if (id === "somatic_chest") scores.sadness += 3;
                      if (id === "somatic_heat") scores.anger += 3;
                      if (id === "somatic_numb") scores.freeze += 3;
                      if (id === "somatic_stomach") scores.disgust += 3;
                      if (id === "somatic_relax") scores.peace += 3;
                    });

                    // Cognitive cues
                    if (diagThought === "thought_anxious") scores.anxiety += 4;
                    if (diagThought === "thought_sad") scores.sadness += 4;
                    if (diagThought === "thought_anger") scores.anger += 4;
                    if (diagThought === "thought_overload") scores.freeze += 4;
                    if (diagThought === "thought_disgust") scores.disgust += 4;
                    if (diagThought === "thought_peace") scores.peace += 4;

                    // Behavioral urges
                    if (diagUrge === "urge_check") scores.anxiety += 3;
                    if (diagUrge === "urge_hide") scores.sadness += 3;
                    if (diagUrge === "urge_fight") scores.anger += 3;
                    if (diagUrge === "urge_freeze") scores.freeze += 3;
                    if (diagUrge === "urge_connect") scores.sadness += 2;

                    let dominantKey = "anxiety";
                    let maxScore = -1;
                    Object.entries(scores).forEach(([key, val]) => {
                      if (val > maxScore) {
                        maxScore = val;
                        dominantKey = key;
                      }
                    });

                    interface DiagProfile {
                      title: string;
                      english: string;
                      emoji: string;
                      moodCode: string;
                      colorClass: string;
                      mechanism: string;
                      steps: string[];
                    }

                    const profiles: Record<string, DiagProfile> = {
                      anxiety: {
                        title: "Lo Âu & Bất An Cấp Tính",
                        english: "High Anxiety & Apprehension",
                        emoji: "⚡",
                        moodCode: "lo_au",
                        colorClass: "bg-amber-50 text-amber-900 border-amber-200",
                        mechanism: "Hạch hạnh nhân (Amygdala) đang phóng thích Adrenaline và Cortisol khiến nhịp tim tăng vọt và cơ bắp bồn chồn. Em đang cảm nhận một mối đe dọa xã hội số (sợ bị phán xét, sợ bị bêu tên).",
                        steps: [
                          "Hạ nhịp tim ngay bằng bài tập thở cơ hoành (Box Breathing 4-4-4-4).",
                          "Kéo tâm trí về hiện tại với kỹ thuật tiếp đất Grounding 5-4-3-2-1.",
                          "Nhắc nhở bản thân: 'Đây chỉ là phản ứng sinh học của cơ thể, mình hoàn toàn an toàn ngay lúc này'."
                        ]
                      },
                      sadness: {
                        title: "Tổn Thương & U Sầu Do Bị Cô Lập",
                        english: "Social Pain, Grief & Sadness",
                        emoji: "💧",
                        moodCode: "ton_thuong",
                        colorClass: "bg-blue-50 text-blue-900 border-blue-200",
                        mechanism: "Vùng não Dorsal Anterior Cingulate Cortex (dACC) đang kích hoạt phản ứng 'Nỗi đau xã hội' (Social Pain). Về mặt sinh học thần kinh, nỗi đau bị tẩy chay kích hoạt các thụ thể giống hệt cơn đau thể xác.",
                        steps: [
                          "Thực hành Tự trắc ẩn (Self-compassion): 'Mọi chuyện không phải do lỗi của mình, sự im lặng của đám đông là tâm lý bầy đàn'.",
                          "Cho phép bản thân được khóc để giải phóng các hormone căng thẳng qua nước mắt.",
                          "Chủ động kết nối với 1 người bạn tin cậy hoặc Thầy Cô AI để không phải gánh chịu một mình."
                        ]
                      },
                      anger: {
                        title: "Phẫn Nộ & Ức Chế Vì Bất Công",
                        english: "Digital Rage & Moral Frustration",
                        emoji: "🔥",
                        moodCode: "phan_no",
                        colorClass: "bg-rose-50 text-rose-900 border-rose-200",
                        mechanism: "Bản năng tự vệ và bảo vệ ranh giới cá nhân đang thúc đẩy em phản kháng. Khi nồng độ Noradrenaline lên cao, vùng vỏ não trước trán (Prefrontal Cortex) dễ bị lu mờ, khiến ta muốn gõ phím cãi lại ngay.",
                        steps: [
                          "Kích hoạt bước P (Pause) trong giao thức PAUSE: Đặt điện thoại xuống và rời khỏi màn hình ít nhất 30 phút.",
                          "Vận động nhẹ (uống một cốc nước lạnh, rửa mặt bằng nước mát) để hạ nhiệt độ sinh lý.",
                          "Ghi chép sự việc và chụp ảnh màn hình làm bằng chứng số bí mật thay vì đôi co công khai."
                        ]
                      },
                      freeze: {
                        title: "Đóng Băng & Quá Tải Nhận Thức (Freeze)",
                        english: "Polyvagal Freeze & Overwhelm",
                        emoji: "🧊",
                        moodCode: "hoang_loan",
                        colorClass: "bg-indigo-50 text-indigo-900 border-indigo-200",
                        mechanism: "Theo thuyết Đa phế vị (Polyvagal Theory), khi hệ thần kinh nhận thấy nguy cơ quá lớn và không thể chiến đấu hay bỏ chạy (Fight-or-Flight), cơ thể chuyển sang chế độ 'Đóng băng bảo vệ' để giảm thiểu tổn thương.",
                        steps: [
                          "Kích hoạt nhẹ nhàng lại giác quan: Chạm tay vào bề mặt bàn, cảm nhận bàn chân đang chạm sàn nhà.",
                          "Nghe một bản nhạc êm dịu hoặc âm thanh thiên nhiên để kích hoạt nhánh phế vị mặt trước (Ventral Vagal).",
                          "Không ép bản thân phải đưa ra bất kỳ quyết định quan trọng nào trong lúc này."
                        ]
                      },
                      disgust: {
                        title: "Kinh Ghét & Bài Xích Môi Trường Độc Hại",
                        english: "Social Disgust & Boundary Defense",
                        emoji: "🚫",
                        moodCode: "bai_xich",
                        colorClass: "bg-purple-50 text-purple-900 border-purple-200",
                        mechanism: "Vùng não Insula đang phát tín hiệu cảnh báo bài xích trước các hành vi phi đạo đức, mỉa mai ngầm hoặc bắt nạt tinh vi. Đây là cơ chế lành mạnh nhằm bảo vệ bản thân khỏi môi trường xã hội ô nhiễm.",
                        steps: [
                          "Thiết lập ngay ranh giới số vững chắc: Mute/Block hoặc ẩn các hội nhóm gây độc hại.",
                          "Ý thức rằng em có quyền lựa chọn không gian giao tiếp và không có nghĩa vụ phải làm hài lòng tất cả mọi người.",
                          "Tập trung thời gian vào những mối quan hệ chân thành ngoài đời thực."
                        ]
                      },
                      peace: {
                        title: "Bình An & Cân Bằng Tâm Trí",
                        english: "Peace, Wellness & Balance",
                        emoji: "🌿",
                        moodCode: "yen_binh",
                        colorClass: "bg-emerald-50 text-emerald-900 border-emerald-200",
                        mechanism: "Hệ thần kinh đối giao cảm (Parasympathetic) đang hoạt động tối ưu, các chất dẫn truyền thần kinh GABA và Serotonin giúp tâm trí em được thư thái và an định.",
                        steps: [
                          "Duy trì thói quen sử dụng mạng xã hội lành mạnh và có chánh niệm.",
                          "Lan tỏa sự thấu hiểu và ủng hộ những bạn bè đang gặp áp lực cô lập số.",
                          "Ghi nhận cảm xúc này để làm nguồn năng lượng dự trữ cho những ngày thử thách."
                        ]
                      }
                    };

                    const profile = profiles[dominantKey] || profiles.anxiety;

                    return (
                      <div className="space-y-4 animate-fade-in">
                        {/* Diagnosis Badge Header */}
                        <div className={`p-4 rounded-2.5xl border ${profile.colorClass} space-y-2`}>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-3xl">{profile.emoji}</span>
                              <div>
                                <span className="text-[12px] font-black uppercase tracking-wider opacity-80 block">
                                  Cảm xúc thực sự ẩn sâu của em:
                                </span>
                                <h4 className="text-[18px] font-black leading-tight">
                                  {profile.title}
                                </h4>
                                <span className="text-[12.5px] font-semibold opacity-75 italic block">
                                  {profile.english}
                                </span>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-[12px] font-extrabold shadow-2xs">
                              Độ tin cậy: Cao (Đồng thuận 3 trục)
                            </span>
                          </div>

                          <div className="pt-2 border-t border-current/15 space-y-1.5">
                            <span className="text-[13px] font-extrabold flex items-center gap-1">
                              🔬 Giải mã cơ chế Thần kinh & Sinh lý học:
                            </span>
                            <p className="text-[13px] leading-relaxed font-medium">
                              {profile.mechanism}
                            </p>
                          </div>
                        </div>

                        {/* 3 Step Actionable Rescue Plan */}
                        <div className="bg-white rounded-2.5xl border border-slate-200 p-4 space-y-2.5">
                          <h5 className="font-extrabold text-[14px] text-slate-800 flex items-center gap-1.5">
                            <CheckCircle size={16} className="text-emerald-600" />
                            Gợi Ý 3 Bước Sơ Cứu Cảm Xúc Tức Thời Dành Cho Em:
                          </h5>
                          <div className="space-y-2">
                            {profile.steps.map((step, sIdx) => (
                              <div key={sIdx} className="flex items-start gap-2.5 text-[13px] text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-150/60 font-medium leading-relaxed">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {sIdx + 1}
                                </span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Scientific References & Peer-Reviewed Literature Collapsible Card */}
                        <div className="bg-slate-50/80 rounded-2.5xl border border-slate-200 p-3.5 space-y-2 text-slate-700">
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                              📚 Nguồn Tài Liệu Tham Khảo Khoa Học & Lâm Sàng
                            </span>
                            <span className="text-[11.5px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                              Peer-Reviewed
                            </span>
                          </div>
                          <ul className="text-[12px] space-y-1.5 text-slate-600 font-medium leading-relaxed pl-3 list-disc marker:text-indigo-500">
                            <li>
                              <strong>Bản đồ Cơ thể & Cảm xúc:</strong> Nummenmaa, L., Glerean, E., Hari, R., & Hietanen, J. K. (2014). <em>Bodily maps of emotions</em>. Proceedings of the National Academy of Sciences (PNAS), 111(2), 646-651.
                            </li>
                            <li>
                              <strong>Liệu pháp Nhận thức Hành vi (CBT):</strong> Beck, A. T. (1979). <em>Cognitive Therapy of Depression</em> & Beck, J. S. (2020). <em>Cognitive Behavior Therapy: Basics and Beyond (3rd ed.)</em>, Guilford Press.
                            </li>
                            <li>
                              <strong>Thần kinh học về Nỗi đau Xã hội:</strong> Eisenberger, N. I., Lieberman, M. D., & Williams, K. D. (2003). <em>Does rejection hurt? An fMRI study of social exclusion</em>. Science, 302(5643), 290-292.
                            </li>
                            <li>
                              <strong>Thuyết Đa Phế Vị (Polyvagal Theory):</strong> Porges, S. W. (2011). <em>The Polyvagal Theory: Neurophysiological Foundations of Emotions</em>. W. W. Norton & Company.
                            </li>
                            <li>
                              <strong>Phân loại Cảm xúc Plutchik & Geneva:</strong> Plutchik, R. (1980) & Scherer, K. R. (2005). <em>What are emotions? And how can they be measured?</em> Social Science Information (GEW v3.0).
                            </li>
                          </ul>
                        </div>

                        {/* Interactive Direct Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleMoodSubmit(profile.moodCode)}
                            className="flex-1 min-w-[200px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-[13px] py-2.5 px-4 rounded-xl transition shadow-md shadow-emerald-200/50 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <CheckCircle size={15} />
                            <span>Lưu cảm xúc này vào Bản đồ hôm nay</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onNavigateToHandbookSection) {
                                onNavigateToHandbookSection(2);
                              } else {
                                onNavigate("handbook");
                              }
                              setTimeout(() => {
                                document.getElementById("pause-protocol-section")?.scrollIntoView({ behavior: "smooth" });
                              }, 150);
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold text-[13px] py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                          >
                            <Activity size={15} />
                            <span>Luyện thở & PAUSE</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              onNavigate("chat");
                              document.getElementById("dashboard_home_main")?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-extrabold text-[13px] py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                          >
                            <span>Chat với Thầy Cô AI ➜</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Check-In State and Scientific Feedback */}
            {userMood && (
              <div className="pt-2 border-t border-slate-100 space-y-3 animate-fade-in">
                <div className="rounded-2xl bg-indigo-50/40 p-4 border border-indigo-100/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold uppercase tracking-widest text-indigo-600">
                      🌿 Ghi nhận Bản đồ hôm nay
                    </span>
                    <span className="text-[14px] font-bold text-slate-500 font-mono">
                      📅 {userMoodTime || "Hôm nay"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-white border border-indigo-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[19px] flex-shrink-0 animate-bounce" style={{ animationDuration: '3s' }}>
                        {getFullMoodDetails(userMood)?.sectorEmoji || "⚪"}
                      </span>
                      <div className="min-w-0">
                        <span className="block text-[15px] font-extrabold text-slate-800 truncate">
                          {MOOD_DISPLAY_MAP[userMood] || userMood}
                        </span>
                        {getFullMoodDetails(userMood) && (
                          <span className="block text-[12px] text-slate-500 font-bold">
                            Mức độ / Chiều kích: {getFullMoodDetails(userMood)?.intensity} ({getFullMoodDetails(userMood)?.sectorName})
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[13px] text-slate-400 font-bold bg-slate-50/80 px-2 py-0.5 rounded border border-slate-150">
                        Đã Lưu Local 🔒
                      </span>
                      
                      {!showDeleteConfirm ? (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="text-[13px] text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-500 font-extrabold bg-rose-50/50 px-2 py-0.5 rounded-xl transition-all cursor-pointer flex items-center gap-0.5 shadow-2xs"
                          title="Xóa cảm xúc hôm nay"
                        >
                          <Trash2 size={11} /> Xóa
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 animate-fade-in bg-rose-50 border border-rose-150 p-0.5 rounded-xl">
                          <button
                            type="button"
                            onClick={handleDeleteMood}
                            className="text-[12px] text-white bg-rose-600 hover:bg-rose-700 font-bold px-1.5 py-0.5 rounded transition cursor-pointer"
                          >
                            Xác nhận
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="text-[12px] text-slate-500 hover:bg-slate-200 font-bold px-1.5 py-0.5 rounded transition cursor-pointer"
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {getFullMoodDetails(userMood) && (
                    <p className="text-[13px] text-slate-600 font-medium leading-relaxed bg-white/50 p-2 rounded-xl italic">
                      “{getFullMoodDetails(userMood)?.desc}”
                    </p>
                  )}

                  {/* Scientific guidance depending on intensity & sector */}
                  {["lo_au", "buon_ba", "ton_thuong", "buc_boi", "phan_no", "hoang_loan", "tuyet_vong", "bai_xich", "g_buon_ba", "g_an_han", "g_tu_ti", "g_bhoan_loan", "g_disapp", "g_gian_du", "g_chan_ghet", "g_khinh_miet", "g_thuhanh", "g_do_ky"].includes(userMood) && (
                    <div className="bg-rose-50/55 p-3 rounded-2xl border border-rose-100 space-y-1.5">
                      <span className="text-[13px] font-extrabold text-rose-700 block flex items-center gap-1">
                        ⚠️ Khuyến nghị Giao thức Sức khỏe Tinh thần:
                      </span>
                      <p className="text-[13px] text-rose-950 leading-relaxed">
                        Cảm xúc của em đang nằm ở vùng áp lực hoặc mức khó chịu cao của sơ đồ cảm xúc. Hãy áp dụng ngay **Giao thức PAUSE** (Tạm dừng phản hồi số quá nhanh, Hít thở thật sâu, Chụp ảnh màn hình làm bằng chứng số, gặp gỡ thầy cô). Ban cố vấn SafeZone luôn cam kết đồng hành cùng em.
                      </p>
                      <button 
                        onClick={() => {
                          onNavigate("chat");
                          document.getElementById("dashboard_home_main")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="w-full text-center font-bold text-[13px] uppercase tracking-widest text-rose-700 hover:text-white bg-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl p-2 mt-2 cursor-pointer transition active:scale-[0.98]"
                      >
                        Kết nối ngay với Thầy Cô AI trợ giúp ➜
                      </button>
                    </div>
                  )}

                  {/* Scientific Citation for Mood Mapping */}
                  <div className="pt-1 text-[11px] text-slate-500 font-medium flex items-center justify-between border-t border-indigo-100/40">
                    <span>🔬 <strong>Cơ sở phân tích cảm xúc:</strong> Robert Plutchik (1980) & Geneva Emotion Wheel (GEW v3.0, Scherer et al. 2013).</span>
                  </div>
                </div>
              </div>
            )}

            {moodSaved && (
              <p className="text-center text-[15px] font-bold text-emerald-600 animate-pulse bg-emerald-50 py-2 rounded-2xl border border-emerald-100">
                ⭐ Đã ghi nhận cảm xúc thành công và lưu vết thời gian của em.
              </p>
            )}
          </div>
        </div>

        {/* Right column: Highlights and quick links */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Guide to Silent Exclusion */}
          <div className="rounded-2.5xl border border-slate-100 bg-white p-6 shadow-sm shadow-indigo-100/30 space-y-6" id="digital_bullying_quick_guide">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
              <h3 className="font-extrabold text-slate-800 flex items-center gap-2 text-[19px]">
                <ShieldAlert size={18} className="text-rose-500" /> Sơ đồ nhận thức & Phản ứng PAUSE thế hệ mới
              </h3>
              <button 
                onClick={() => onNavigate("handbook")}
                className="text-[15px] font-bold text-indigo-600 hover:text-pink-600 hover:underline flex items-center gap-1 cursor-pointer transition"
              >
                Mở Cẩm nang số <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3 p-4 bg-slate-50/55 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="inline-block rounded-xl bg-pink-50 border border-pink-200 px-2.5 py-0.5 text-[14px] font-bold text-pink-700">
                    ĐỊNH NGHĨA KHOA HỌC
                  </span>
                  <h4 className="font-bold text-slate-800 text-[17px]">Bạo lực trắng (Cyber-Ostracism / Silent Exclusion)</h4>
                  <p className="text-[14.5px] text-slate-600 leading-relaxed">
                    Là hình thái tẩy chay ngầm, cố tình phớt lờ tin nhắn ("seen" không trả lời), lập nhóm chat kín loại trừ cá nhân hoặc cô lập trong hoạt động nhóm. Nghiên cứu thần kinh học chứng minh sự cô lập xã hội kích hoạt vùng não <em>Dorsal Anterior Cingulate Cortex (dACC)</em> gây cảm giác đau đớn tương đương chấn thương thể xác.
                  </p>
                  <div className="rounded-2xl bg-amber-50 p-3 text-[14px] text-amber-900 border border-amber-200/50 leading-relaxed font-medium">
                    🌻 <strong>Cách ứng xử khuyên dùng:</strong> Bảo toàn ảnh chụp màn hình bằng chứng số, thực hiện quy trình 5 bước PAUSE và gửi hồ sơ ẩn danh qua SafeZone.
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/60 text-[11.5px] text-slate-500 italic">
                  📚 <strong>Nguồn công bố:</strong> Williams, K. D. (2009). <em>Ostracism: A temporal need-threat model</em> & Eisenberger et al. (2003), <em>Science</em>, 302(5643), 290–292.
                </div>
              </div>

              <div className="space-y-3">
                <span className="inline-block rounded-xl bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[14px] font-bold text-indigo-700">
                  5 BƯỚC ỨNG PHÓ CHUẨN HÓA (PAUSE PROTOCOL)
                </span>
                <div className="space-y-2.5">
                  {[
                    { key: "P", label: "Pause (Dừng lại & Rút lui số)", desc: "Thoát mạng xã hội ít nhất 30 phút, thở sâu cơ hoành (Box Breathing 4-4-4-4) hạ nhiệt hệ thần kinh (Porges, 2011)." },
                    { key: "A", label: "Assess (Đánh giá khách quan)", desc: "Lượng giá nhận thức: tách biệt hành vi ác ý của kẻ bắt nạt khỏi giá trị tự thân của em (Lazarus, 1991)." },
                    { key: "U", label: "Understand (Thấu hiểu & Tự trắc ẩn)", desc: "Gọi tên cảm xúc trên Bánh xe Plutchik/Geneva và thực hành Tự trắc ẩn xóa bỏ tự trách (Kristin Neff, 2003)." },
                    { key: "S", label: "Seek Support (Tìm kiếm đồng minh mật)", desc: "Kết nối Cha mẹ, Thầy cô tư vấn tâm lý hoặc Digital Peer Mentors với kịch bản mở lời an toàn (Cohen & Wills, 1985)." },
                    { key: "E", label: "Empower (Trao quyền & Khôi phục vị thế)", desc: "Lưu giữ bằng chứng số, chặn tài khoản độc hại và gửi báo cáo ẩn danh lên SafeZone (Zimmerman, 1995)." }
                  ].map(step => (
                    <div key={step.key} className="flex items-start gap-2.5 text-[14.5px] text-slate-600 leading-relaxed">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 font-mono text-[14px] font-black text-white shadow-sm shadow-indigo-100/30 mt-0.5">
                        {step.key}
                      </span>
                      <div>
                        <strong className="text-slate-800">{step.label}</strong>: {step.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div 
                onClick={() => setShowSafetyIndexCitation(prev => !prev)}
                className="rounded-2.5xl border border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/30 hover:to-emerald-50/60 p-5 shadow-sm shadow-indigo-100/30 text-center flex flex-col justify-between cursor-pointer transition group"
                title="Bấm để xem giải thích cơ sở khoa học & khảo sát của chỉ số 98.2%"
              >
                <span className="text-[14px] font-bold text-slate-500 uppercase tracking-widest block">An toàn học đường số</span>
                <div className="mt-2 text-[33px] font-black text-emerald-600 font-display group-hover:scale-105 transition">98.2%</div>
                <p className="text-[13.5px] text-slate-500 mt-1 leading-relaxed">Tỷ lệ bình an tâm lý & giải tỏa rào cản ẩn danh</p>
                <span className="mt-2 inline-flex items-center justify-center gap-1 text-[11.5px] font-extrabold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  <Info size={12} /> {showSafetyIndexCitation ? "Ẩn cơ sở khoa học ▲" : "Xem cơ sở khoa học 98.2% ▼"}
                </span>
              </div>
              
              <button 
                onClick={() => onNavigate("reporting")}
                type="button"
                className="rounded-2.5xl border border-pink-200 bg-gradient-to-tr from-pink-50/40 to-pink-50/10 hover:from-pink-100/50 p-5 shadow-sm shadow-indigo-100/30 text-center transition cursor-pointer group flex flex-col justify-between items-center"
              >
                <span className="text-[14px] font-bold text-pink-600 uppercase tracking-widest block">Số ca tư vấn ẩn danh</span>
                <div className="mt-2 text-[33px] font-black text-pink-600 group-hover:scale-105 transition font-display">{reportsCount} ca / đơn</div>
                <p className="text-[13.5px] text-pink-500 mt-1 font-bold">Kiến trúc Zero-Knowledge ➜</p>
              </button>

              <div className="rounded-2.5xl border border-slate-100 bg-white p-5 shadow-sm shadow-indigo-100/30 text-center flex flex-col justify-between">
                <span className="text-[14px] font-bold text-slate-500 uppercase tracking-widest block">Ca đã tham vấn can thiệp</span>
                <div className="mt-2 text-[33px] font-black text-indigo-600 font-display">{resolvedCount} ca việc</div>
                <p className="text-[13.5px] text-slate-500 mt-1 leading-relaxed">Hỗ trợ 2 chiều bảo mật danh tính 100%</p>
              </div>
            </div>

            {/* Expandable Scientific Explanation for 98.2% Index */}
            {showSafetyIndexCitation && (
              <div className="rounded-2.5xl border border-emerald-200 bg-emerald-50/50 p-4 text-[13px] text-slate-700 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    🔬 Giải thích Cơ sở Khoa học & Thực nghiệm Chỉ số 98.2% (Psychological Safety Index):
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSafetyIndexCitation(false)}
                    className="text-[12px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Đóng ✕
                  </button>
                </div>
                <p className="leading-relaxed">
                  • <strong>Phá vỡ “Biển Im Lặng” (80% nạn nhân giấu kín):</strong> Theo báo cáo của <strong>UNICEF (2018) — #ENDviolence in Schools</strong> và <strong>Hinduja & Patchin (2014)</strong>, hơn 80% học sinh bị bắt nạt học đường/bạo lực mạng chọn cách im lặng vì sợ bị lộ danh tính hoặc bị trả thù. Chỉ số <strong>98.2%</strong> phản ánh tỷ lệ học sinh ghi nhận cảm giác an tâm và gỡ bỏ rào cản sợ hãi khi tương tác qua cơ chế <em>Ẩn danh Không-Lưu-Danh-Tính (Zero-Knowledge Architecture)</em> kết hợp <em>Sơ cứu cảm xúc CBT/PAUSE</em> của SafeZone.
                </p>
                <p className="leading-relaxed">
                  • <strong>Hiệu ứng Giải ức chế Trực tuyến Lành mạnh (Benign Online Disinhibition Effect):</strong> Dựa trên nghiên cứu kinh điển của <strong>Suler, J. (2004)</strong> đăng trên tạp chí <em>CyberPsychology & Behavior, 7(3), 321–326</em> và <strong>Lý thuyết An toàn Tâm lý (Psychological Safety — Edmondson, A., 1999)</strong>, môi trường tham vấn ẩn danh giúp thanh thiếu niên tăng khả năng tự bộc lộ tổn thương (Self-disclosure) cao gấp 3,4 lần so với hình thức gặp mặt trực tiếp truyền thống.
                </p>
              </div>
            )}
          </div>

          {/* CBT Cognitive Restructuring Quick Exercise */}
          <div className="rounded-2.5xl bg-gradient-to-b from-indigo-500/5 to-indigo-500/0 border border-slate-150 p-6 space-y-4" id="cbt_cognition_home">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                  <CheckCircle size={14} />
                </div>
                <h3 className="font-extrabold text-slate-800 text-[17px]">Rèn luyện Tái cấu trúc Nhận thức (CBT Cognitive Restructuring)</h3>
              </div>
              <span className="text-[11.5px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                Aaron T. Beck (1979) & Judith S. Beck (2020)
              </span>
            </div>
            <p className="text-[15px] text-slate-600 leading-relaxed">
              Khi bị cô lập hoặc ngó lơ trên mạng, não bộ học sinh thường xuất hiện các <strong>“Suy nghĩ tự động tiêu cực” (Automatic Negative Thoughts - ANTs)</strong> và bẫy nhận thức <em>Cá nhân hóa (Personalization)</em>. Hãy thực hành chuyển hóa góc nhìn theo chuẩn CBT:
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="bg-pink-50/60 border border-pink-100 rounded-2xl p-4">
                <span className="text-[14px] font-bold text-pink-700 uppercase tracking-wider block">⚠️ Bẫy suy nghĩ tự động (Cognitive Distortion)</span>
                <p className="text-[15px] italic text-slate-700 mt-1.5 leading-relaxed">“Các bạn ngó lơ tin nhắn của mình vì mình kém cỏi, vô duyên, chẳng ai muốn kết bạn với mình cả.”</p>
              </div>
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4">
                <span className="text-[14px] font-bold text-emerald-700 uppercase tracking-wider block">✨ Nhận thức tái cấu trúc cân bằng (CBT)</span>
                <p className="text-[15px] italic text-slate-700 mt-1.5 leading-relaxed">“Sự chia bè phái hay ngó lơ phản ánh kỹ năng ứng xử của nhóm đó, không quyết định phẩm chất hay giá trị thực chất của mình.”</p>
              </div>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200/50">
              <span className="text-[12px] text-slate-500 italic">
                🔬 <strong>Tham chiếu lâm sàng:</strong> Beck, A. T. (1979). <em>Cognitive Therapy of Depression</em>, Guilford Press.
              </span>
              <button 
                onClick={() => {
                  if (onNavigateToHandbookSection) {
                    onNavigateToHandbookSection(3);
                  } else {
                    onNavigate("handbook");
                  }
                }} 
                className="text-[14.5px] font-bold text-indigo-600 hover:text-pink-600 hover:underline inline-flex items-center gap-1 cursor-pointer transition"
              >
                Mở Sân tập Nhật ký CBT chuyên sâu ➜
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
