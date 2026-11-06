import React, { useState, useEffect } from "react";
import { Lock, Unlock, ShieldAlert, LogOut, DownloadCloud, RefreshCw, Sparkles } from "lucide-react";
import { pullStudentSyncFromCloud, pushStudentSyncToCloud } from "../lib/studentSync";

interface PinLockScreenProps {
  onSuccess: () => void;
}

export default function PinLockScreen({ onSuccess }: PinLockScreenProps) {
  const [pin, setPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isCheckingCloud, setIsCheckingCloud] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  const handleKeyPress = (num: string) => {
    if (isCheckingCloud) return;
    if (pin.length < 4) {
      setErrorMsg("");
      setInfoMsg("");
      const newPin = pin + num;
      setPin(newPin);
      
      // Auto-validate if 4 digits are reached
      if (newPin.length === 4) {
        validatePin(newPin);
      }
    }
  };

  const handleDelete = () => {
    if (isCheckingCloud) return;
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg("");
      setInfoMsg("");
    }
  };

  const validatePin = async (enteredPin: string) => {
    const savedPin = localStorage.getItem("safe_school_local_pin");
    
    // Case 1: Local PIN matches
    if (savedPin && enteredPin === savedPin) {
      sessionStorage.setItem("safe_school_pin_verified", "true");
      // Pull latest from cloud in background to sync any changes
      pullStudentSyncFromCloud(enteredPin).catch(() => {});
      onSuccess();
      return;
    }

    // Case 2: Local PIN does not match or user is on a new device with cloud record
    setIsCheckingCloud(true);
    setInfoMsg("Đang kiểm tra chìa khóa đồng bộ đám mây...");
    try {
      const cloudRes = await pullStudentSyncFromCloud(enteredPin);
      if (cloudRes.success && cloudRes.found) {
        setInfoMsg("🎉 Đã khôi phục dữ liệu từ đám mây!");
        setTimeout(() => {
          sessionStorage.setItem("safe_school_pin_verified", "true");
          onSuccess();
        }, 800);
        return;
      }
    } catch { }
    finally {
      setIsCheckingCloud(false);
    }

    setErrorMsg("Mã PIN không khớp! Vui lòng kiểm tra lại.");
    setInfoMsg("");
    setPin("");
  };

  const handleSelfDestruct = () => {
    if (window.confirm("BẢO VỆ KHẨN CẤP: Em không nhớ mã PIN và muốn tự hủy mọi dữ liệu trên máy tính này ngay lập tức chứ? Phục hồi dữ liệu là bất khả thi.")) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  // Listen to keyboard inputs 0-9
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleDelete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, isCheckingCloud]);

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 text-white font-sans animate-fade-in" id="pin_lock_screen_overlay">
      <div className="max-w-xs w-full text-center space-y-5">
        
        {/* Shield Logo with pulse */}
        <div className="flex justify-center">
          <div className="h-20 w-20 flex items-center justify-center animate-pulse drop-shadow-2xl">
            <img src="/logo-universal.png" alt="SafeZone Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-[20px] font-black tracking-tight text-white uppercase flex items-center justify-center gap-1.5">
            <Lock size={18} className="text-indigo-400" />
            Màn Khóa Bảo Mật SafeZone
          </h2>
          <p className="text-[13px] text-slate-400 font-medium">Bảo vệ sự an lành & riêng tư tuyệt đối của học sinh</p>
        </div>

        <p className="text-[13px] text-slate-300 px-3 leading-relaxed bg-white/5 py-2.5 rounded-2xl border border-white/10">
          Nhập mã PIN 4 chữ số để mở khóa. Nếu em đang ở máy tính khác, nhập mã PIN cũ để tự động khôi phục dữ liệu!
        </p>

        {/* PIN indicator circles */}
        <div className="flex justify-center gap-4 py-1">
          {[0, 1, 2, 3].map((index) => (
            <div 
              key={index} 
              className={`h-4 w-4 rounded-full border border-white/30 transition-all duration-150 ${
                index < pin.length 
                  ? "bg-indigo-400 scale-115 shadow-[0_0_10px_rgba(129,140,248,0.8)]" 
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {infoMsg && (
          <p className="text-[13px] text-sky-300 font-bold bg-sky-500/20 py-2 px-3 rounded-xl border border-sky-400/30 flex items-center justify-center gap-1.5 animate-pulse">
            <RefreshCw size={14} className="animate-spin" /> {infoMsg}
          </p>
        )}

        {errorMsg && (
          <p className="text-[13px] text-rose-400 font-bold bg-rose-500/15 py-1.5 px-3 rounded-xl border border-rose-500/30 animate-shake">
            ⚠️ {errorMsg}
          </p>
        )}

        {/* Virtual Keypad */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              disabled={isCheckingCloud}
              className="h-13 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-[20px] font-bold transition-all active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleSelfDestruct}
            className="text-[11px] font-bold uppercase transition hover:text-rose-400 flex items-center justify-center text-slate-400 hover:bg-rose-500/20 rounded-2xl h-13 border border-dashed border-white/10 cursor-pointer leading-tight p-1"
            title="Nhấp vào đây nếu quên mã PIN để tự hủy mọi dữ liệu"
          >
            Quên PIN / Tự Hủy
          </button>
          <button
            onClick={() => handleKeyPress("0")}
            disabled={isCheckingCloud}
            className="h-13 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-[20px] font-bold transition-all active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            disabled={isCheckingCloud}
            className="h-13 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-[13px] font-bold transition-all active:scale-95 flex items-center justify-center cursor-pointer text-indigo-300 hover:text-indigo-200"
          >
            XÓA
          </button>
        </div>

        <div className="text-[11.5px] text-slate-500 leading-tight">
          ☁️ Dữ liệu được mã hóa gắn với mã PIN — an toàn khi đăng nhập trên bất kỳ thiết bị nào.
        </div>

      </div>
    </div>
  );
}

