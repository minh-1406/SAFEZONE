import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertOctagon, 
  LogOut, 
  ExternalLink,
  BookOpen,
  X,
  Plus,
  Cloud,
  CloudRain,
  RefreshCw,
  DownloadCloud,
  UploadCloud,
  CheckCircle2,
  FileCheck2,
  HeartHandshake
} from "lucide-react";
import { 
  getStudentLocalPayload, 
  pushStudentSyncToCloud, 
  pullStudentSyncFromCloud, 
  SurveyRecord 
} from "../lib/studentSync";

interface LocalSecurityPanelProps {
  onClose: () => void;
  onClearAllCache: () => void;
}

export default function LocalSecurityPanel({ onClose, onClearAllCache }: LocalSecurityPanelProps) {
  const [hasPin, setHasPin] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [inputPin, setInputPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [currentPinAttempt, setCurrentPinAttempt] = useState("");
  const [restorePinInput, setRestorePinInput] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [stats, setStats] = useState({ moods: 0, surveys: 0, journals: 0, reports: 0 });
  const [surveyList, setSurveyList] = useState<SurveyRecord[]>([]);

  const refreshLocalStats = () => {
    const payload = getStudentLocalPayload();
    setStats({
      moods: payload.moodHistory.length,
      surveys: payload.surveyHistory.length,
      journals: payload.cbtJournals.length,
      reports: payload.submittedCodes.length
    });
    setSurveyList(payload.surveyHistory);
  };

  useEffect(() => {
    const savedPin = localStorage.getItem("safe_school_local_pin");
    if (savedPin) {
      setHasPin(true);
      setCurrentPin(savedPin);
    }
    const savedSyncTime = localStorage.getItem("safe_school_last_sync_time");
    if (savedSyncTime) {
      try {
        setLastSyncTime(new Date(savedSyncTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " ngày " + new Date(savedSyncTime).toLocaleDateString("vi-VN"));
      } catch {
        setLastSyncTime(savedSyncTime);
      }
    }
    refreshLocalStats();

    const handleSyncEvent = () => {
      refreshLocalStats();
    };
    window.addEventListener("safe_school_data_synced", handleSyncEvent);
    return () => window.removeEventListener("safe_school_data_synced", handleSyncEvent);
  }, []);

  const handleSetNewPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin.length < 4 || !/^\d+$/.test(inputPin)) {
      setErrorMsg("Mã PIN phải gồm từ 4 chữ số trở lên!");
      return;
    }
    if (inputPin !== confirmPin) {
      setErrorMsg("Xác nhận mã PIN chưa trùng khớp!");
      return;
    }

    localStorage.setItem("safe_school_local_pin", inputPin);
    sessionStorage.setItem("safe_school_pin_verified", "true");
    setHasPin(true);
    setCurrentPin(inputPin);
    setInputPin("");
    setConfirmPin("");
    setErrorMsg("");

    setIsSyncing(true);
    const syncRes = await pushStudentSyncToCloud(inputPin);
    setIsSyncing(false);

    if (syncRes.success) {
      setSuccessMsg("🔒 Đã thiết lập Khóa PIN và đồng bộ an toàn dữ liệu cảm xúc & bài khảo sát lên đám mây!");
      setLastSyncTime(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " hôm nay");
    } else {
      setSuccessMsg("🔒 Đã thiết lập Khóa PIN cho máy này thành công!");
    }

    refreshLocalStats();
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const handleManualSyncNow = async () => {
    if (!hasPin) {
      setErrorMsg("Vui lòng kích hoạt Mã PIN trước để làm chìa khóa đồng bộ dữ liệu.");
      return;
    }
    setIsSyncing(true);
    setErrorMsg("");
    const res = await pushStudentSyncToCloud();
    setIsSyncing(false);

    if (res.success) {
      setSuccessMsg("☁️ Đã đồng bộ tức thì toàn bộ nhật ký cảm xúc & bài khảo sát lên đám mây thành công!");
      setLastSyncTime(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " vừa xong");
      refreshLocalStats();
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrorMsg(res.message || "Lỗi khi đồng bộ.");
    }
  };

  const handleRestoreFromCloud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (restorePinInput.length < 4 || !/^\d+$/.test(restorePinInput)) {
      setErrorMsg("Vui lòng nhập đúng mã PIN (tối thiểu 4 số) đã từng dùng trên máy cũ.");
      return;
    }

    setIsRestoring(true);
    setErrorMsg("");
    const res = await pullStudentSyncFromCloud(restorePinInput);
    setIsRestoring(false);

    if (res.success && res.found) {
      setHasPin(true);
      setCurrentPin(restorePinInput);
      setRestorePinInput("");
      setSuccessMsg("🎉 Tuyệt vời! Đã khôi phục thành công toàn bộ nhật ký cảm xúc, bài khảo sát & bài tập CBT từ máy cũ về máy này!");
      setLastSyncTime(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " vừa khôi phục");
      refreshLocalStats();
      setTimeout(() => setSuccessMsg(""), 6000);
    } else {
      setErrorMsg(res.message || "Không tìm thấy dữ liệu đã đồng bộ nào với mã PIN này trên máy chủ.");
    }
  };

  const handleRemovePin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedPin = localStorage.getItem("safe_school_local_pin");
    if (currentPinAttempt !== savedPin) {
      setErrorMsg("Mã PIN hiện tại không chính xác!");
      return;
    }

    localStorage.removeItem("safe_school_local_pin");
    setHasPin(false);
    setCurrentPin("");
    setCurrentPinAttempt("");
    setErrorMsg("");
    setSuccessMsg("🔓 Đã gỡ bỏ khóa PIN trên thiết bị này.");
    setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
  };

  const triggerEscape = () => {
    window.location.href = "https://vi.wikipedia.org/wiki/To%C3%A1n_h%E1%BB%8Dc";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-[17px] font-black text-slate-800 uppercase flex items-center gap-2">
          <ShieldCheck className="text-emerald-600 animate-pulse" size={20} />
          Trung Tâm Bảo Mật & Đồng Bộ Dữ Liệu Học Sinh
        </h3>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 rounded-xl p-1.5 hover:bg-slate-50 transition cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Sync Status Banner */}
      <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-sky-50/60 to-purple-50/80 border border-indigo-150 rounded-2.5xl space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-extrabold text-indigo-900 flex items-center gap-1.5 text-[15px]">
            <Cloud size={18} className="text-indigo-600" />
            Trạng Thái Đồng Bộ Đám Mây Theo Mã PIN
          </span>
          <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full ${
            hasPin ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-slate-200 text-slate-600"
          }`}>
            {hasPin ? "🟢 Đang tự động sao lưu an toàn" : "⚪ Chưa kích hoạt mã PIN"}
          </span>
        </div>

        <p className="text-[13.5px] text-slate-600 leading-relaxed">
          Hệ thống SafeZone áp dụng cơ chế <strong>Đồng bộ ẩn danh gắn với mã PIN</strong>: Khi đổi máy tính hoặc điện thoại khác, chỉ cần nhập lại đúng Mã PIN là toàn bộ Nhật ký cảm xúc, kết quả khảo sát, bài tập CBT và mã Hồ sơ Ca tư vấn sẽ tự động phục hồi 100%.
        </p>

        <div className="p-2.5 rounded-xl bg-white/90 border border-indigo-100 text-[12px] text-slate-600 leading-relaxed flex items-start gap-2">
          <BookOpen size={14} className="text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-indigo-900">Chuẩn mật mã học & Tâm lý học bảo mật:</strong> Mã PIN của em được băm một chiều bằng thuật toán <em>SHA-256 (Chuẩn NIST FIPS 180-4)</em> theo kiến trúc <em>Zero-Knowledge (Goldwasser, Micali, & Rackoff, 1985)</em> — máy chủ không lưu mã PIN gốc và không gắn với tên hay email, bảo đảm <em>An toàn tâm lý tuyệt đối (Edmondson, 1999; Suler, 2004)</em>.
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="bg-white/80 border border-indigo-100/60 rounded-xl p-2.5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Nhật ký cảm xúc</span>
            <span className="text-[18px] font-black text-indigo-600">{stats.moods}</span>
            <span className="text-[10px] text-slate-400 block">bản ghi</span>
          </div>
          <div className="bg-white/80 border border-indigo-100/60 rounded-xl p-2.5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Bài khảo sát</span>
            <span className="text-[18px] font-black text-violet-600">{stats.surveys}</span>
            <span className="text-[10px] text-slate-400 block">kết quả test</span>
          </div>
          <div className="bg-white/80 border border-indigo-100/60 rounded-xl p-2.5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Sân tập CBT</span>
            <span className="text-[18px] font-black text-sky-600">{stats.journals}</span>
            <span className="text-[10px] text-slate-400 block">bài tái cấu trúc</span>
          </div>
          <div className="bg-white/80 border border-indigo-100/60 rounded-xl p-2.5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Đơn tra cứu</span>
            <span className="text-[18px] font-black text-emerald-600">{stats.reports}</span>
            <span className="text-[10px] text-slate-400 block">mã hồ sơ</span>
          </div>
        </div>

        {hasPin && (
          <div className="flex items-center justify-between pt-1 text-[12px] text-slate-500 border-t border-indigo-100/70">
            <span>Đồng bộ gần nhất: <strong>{lastSyncTime || "Vừa xong"}</strong></span>
            <button
              onClick={handleManualSyncNow}
              disabled={isSyncing}
              className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer hover:underline disabled:opacity-50"
            >
              <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? "Đang đẩy lên mây..." : "Đồng bộ ngay"}
            </button>
          </div>
        )}
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-[14px] font-bold text-center animate-fade-in flex items-center justify-center gap-1.5">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-[14px] font-bold text-center animate-fade-in">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Option 1: PIN Management & Cloud Setting */}
      <div className="border border-slate-150 rounded-2.5xl p-5 space-y-3 bg-white shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[15px] font-black text-slate-800 uppercase flex items-center gap-1.5">
              <Lock size={15} className="text-indigo-600" />
              Khóa PIN Bảo Mật & Đồng Bộ Trên Thiết Bị Này
            </h4>
            <p className="text-[13px] text-slate-500 mt-0.5">Đặt 4 số bí mật để khóa màn hình và làm chìa khóa sao lưu dữ liệu cá nhân.</p>
          </div>
          <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full ${
            hasPin ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-100 text-slate-500"
          }`}>
            {hasPin ? "Đang bảo vệ" : "Chưa bật"}
          </span>
        </div>

        {!hasPin ? (
          <form onSubmit={handleSetNewPin} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[12px] uppercase font-bold text-slate-500 mb-1">Mã PIN mới (4 số)</label>
                <input 
                  type="password"
                  maxLength={6}
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Ví dụ: 1234"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-[15px] text-center font-mono focus:border-indigo-500 font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-[12px] uppercase font-bold text-slate-500 mb-1">Xác nhận PIN</label>
                <input 
                  type="password"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Nhập lại mã PIN"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-[15px] text-center font-mono focus:border-indigo-500 font-bold"
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isSyncing}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-[14px] font-bold text-white hover:bg-indigo-700 cursor-pointer text-center transition flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-200"
            >
              <UploadCloud size={16} />
              {isSyncing ? "Đang đồng bộ..." : "Kích hoạt PIN & Bật Tự Động Sao Lưu"}
            </button>
          </form>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[13px] text-slate-600 flex items-center justify-between">
              <span>Mã PIN thiết bị đang kích hoạt: <strong className="font-mono text-indigo-700">••••</strong></span>
              <button
                type="button"
                onClick={handleManualSyncNow}
                disabled={isSyncing}
                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[12px] px-3 py-1.5 rounded-lg border border-indigo-200 cursor-pointer flex items-center gap-1"
              >
                <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                Đẩy dữ liệu lên mây
              </button>
            </div>

            <form onSubmit={handleRemovePin} className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-[12px] uppercase font-bold text-slate-500">Gỡ bỏ mã PIN trên máy này (nếu không cần dùng nữa):</label>
              <div className="flex gap-2">
                <input 
                  type="password"
                  maxLength={6}
                  value={currentPinAttempt}
                  onChange={(e) => setCurrentPinAttempt(e.target.value.replace(/\D/g, ""))}
                  placeholder="Nhập mã PIN để gỡ"
                  className="flex-1 rounded-xl border border-slate-200 p-2 text-[14px] text-center font-mono font-bold"
                  required
                />
                <button 
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2 text-[13px] font-bold text-white hover:bg-rose-700 cursor-pointer"
                >
                  Gỡ Khóa PIN
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Option 2: Restore from Old Machine by PIN */}
      <div className="border border-sky-200 rounded-2.5xl p-5 space-y-3 bg-gradient-to-tr from-sky-50/40 to-indigo-50/30 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[15px] font-black text-sky-900 uppercase flex items-center gap-1.5">
              <DownloadCloud size={16} className="text-sky-600" />
              Khôi Phục Dữ Liệu Từ Máy Khác / Thiết Bị Cũ
            </h4>
            <p className="text-[13px] text-slate-600 mt-0.5">
              Nếu em vừa đổi sang máy tính/điện thoại mới, hãy nhập mã PIN đã đặt ở máy cũ để kéo lại toàn bộ dữ liệu.
            </p>
          </div>
        </div>

        <form onSubmit={handleRestoreFromCloud} className="space-y-3 pt-1">
          <div className="flex gap-2">
            <input 
              type="password"
              maxLength={6}
              value={restorePinInput}
              onChange={(e) => setRestorePinInput(e.target.value.replace(/\D/g, ""))}
              placeholder="Nhập mã PIN của máy cũ (VD: 1234)"
              className="flex-1 rounded-xl border border-sky-300 bg-white p-2.5 text-[15px] text-center font-mono font-bold focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              required
            />
            <button 
              type="submit"
              disabled={isRestoring}
              className="rounded-xl bg-sky-600 hover:bg-sky-700 px-5 py-2.5 text-[14px] font-bold text-white cursor-pointer transition flex items-center gap-1.5 shadow-sm shadow-sky-200 disabled:opacity-50"
            >
              <DownloadCloud size={15} />
              {isRestoring ? "Đang kéo về..." : "Khôi phục dữ liệu ➜"}
            </button>
          </div>
          <p className="text-[12px] text-sky-800 italic">
            * Sau khi khôi phục thành công, toàn bộ lịch sử cảm xúc, kết quả làm trắc nghiệm FOMO/chẩn đoán và mã đơn sẽ hiện lại đầy đủ ngay lập tức trên máy này.
          </p>
        </form>
      </div>

      {/* Survey History List Preview */}
      {surveyList.length > 0 && (
        <div className="border border-slate-150 rounded-2.5xl p-5 space-y-3 bg-white shadow-xs">
          <h4 className="text-[15px] font-black text-slate-800 uppercase flex items-center gap-1.5">
            <FileCheck2 size={15} className="text-violet-600" />
            Lịch Sử Các Bài Khảo Sát & Trắc Nghiệm Đã Lưu ({surveyList.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {surveyList.map((item) => (
              <div key={item.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-[13px]">
                <div>
                  <strong className="text-slate-800 block font-bold">{item.title}</strong>
                  <span className="text-slate-400 text-[11px]">{item.date} • Đánh giá: <strong>{item.level}</strong></span>
                </div>
                {item.score !== undefined && (
                  <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-bold text-[12px]">
                    {item.score} điểm
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Escape / Panic Mode */}
      <div className="border border-rose-150 rounded-2.5xl p-4 space-y-2.5 bg-rose-50/20 shadow-xs">
        <h4 className="text-[14px] font-black text-rose-800 uppercase flex items-center gap-1.5">
          <AlertOctagon size={14} className="text-rose-600 animate-bounce" />
          Phím nóng Lánh nạn & Ngụy trang khẩn cấp (Panic Escape)
        </h4>
        <p className="text-[12.5px] text-slate-500">
          Nếu có người thân bất ngờ đi qua hoặc kẻ xấu nhìn lén, bấm nút dưới hoặc phím <strong>ESC</strong> để biến toàn bộ cửa sổ thành trang bài học Toán:
        </p>
        <button 
          onClick={triggerEscape}
          type="button"
          className="w-full rounded-xl bg-rose-600 text-white hover:bg-rose-700 py-2 text-[13px] font-bold cursor-pointer flex items-center justify-center gap-1.5 uppercase transition"
        >
          <LogOut size={13} />
          Trốn thoát ngụy trang nhanh! (ESC)
        </button>
      </div>

      {/* Wipe/Local Self-Destruct Cache */}
      <div className="border border-slate-150 rounded-2.5xl p-4 space-y-2 bg-white shadow-xs">
        <h4 className="text-[14px] font-black text-slate-800 uppercase flex items-center gap-1.5">
          <Trash2 size={14} className="text-slate-500" />
          Tự hủy cục bộ trên thiết bị này (1-Click Local Wipe)
        </h4>
        <p className="text-[12.5px] text-slate-400">
          Xóa sạch toàn bộ dữ liệu trên trình duyệt máy này khi dùng máy lạ:
        </p>
        <button 
          onClick={() => {
            if (window.confirm("CẢNH BÁO: Hành vi này sẽ xóa sạch dữ liệu trên trình duyệt này. Nếu em đã có mã PIN đồng bộ trên đám mây, em có thể khôi phục lại sau bằng mã PIN đó. Em chắc chắn muốn xóa chứ?")) {
              onClearAllCache();
            }
          }}
          type="button"
          className="w-full rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 py-2 text-[13px] font-bold cursor-pointer transition flex items-center justify-center gap-1.5"
        >
          <Trash2 size={13} />
          Xóa sạch dữ liệu trên thiết bị này ngay
        </button>
      </div>
    </div>
  );
}

