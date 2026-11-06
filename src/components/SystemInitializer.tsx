import React, { useState } from "react";
import { 
  School, 
  UserPlus, 
  Settings, 
  Sparkles, 
  Trash2,
  Lock, 
  ArrowRight, 
  Check, 
  Users, 
  AlertTriangle 
} from "lucide-react";

interface CounselorInput {
  name: string;
  email: string;
  password: string;
}

interface SystemInitializerProps {
  onSetupSuccess: () => void;
}

export default function SystemInitializer({ onSetupSuccess }: SystemInitializerProps) {
  const [setupMode, setSetupMode] = useState<"choose" | "custom" | "mock" | "submitting">("choose");
  const [schoolName, setSchoolName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // School contact & consultation room details
  const [counselingRoom, setCounselingRoom] = useState("Phòng Tham Vấn & Hỗ Trợ Tâm Lý Học Đường");
  const [hotline, setHotline] = useState("");
  const [consultationHours, setConsultationHours] = useState("Thứ 2 - Thứ 6 (Giờ hành chính & Sau giờ học)");
  const [principalHotline, setPrincipalHotline] = useState("");
  
  // Custom auxiliary counselors list
  const [auxCounselors, setAuxCounselors] = useState<CounselorInput[]>([]);
  const [newAuxName, setNewAuxName] = useState("");
  const [newAuxEmail, setNewAuxEmail] = useState("");
  const [newAuxPassword, setNewAuxPassword] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [isActivating, setIsActivating] = useState(false);

  const handleAddAuxCounselor = () => {
    if (!newAuxName.trim() || !newAuxEmail.trim() || !newAuxPassword.trim()) {
      setErrorMsg("Vui lòng điền đủ thông tin tên, email và mật khẩu của trợ lý.");
      return;
    }
    if (!newAuxEmail.includes("@")) {
      setErrorMsg("Định dạng email của trợ lý không hợp lệ.");
      return;
    }
    
    setAuxCounselors([
      ...auxCounselors, 
      { name: newAuxName.trim(), email: newAuxEmail.trim(), password: newAuxPassword }
    ]);
    setNewAuxName("");
    setNewAuxEmail("");
    setNewAuxPassword("");
    setErrorMsg("");
  };

  const handleRemoveAuxCounselor = (idx: number) => {
    setAuxCounselors(auxCounselors.filter((_, i) => i !== idx));
  };

  const handleCustomSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim() || !adminName.trim() || !adminEmail.trim() || !adminPassword.trim()) {
      setErrorMsg("Vui lòng điền đầy đủ các mục cấu hình Quản trị viên bắt buộc.");
      return;
    }
    if (!adminEmail.includes("@")) {
      setErrorMsg("Định dạng email chính không hợp lệ.");
      return;
    }

    setIsActivating(true);
    setErrorMsg("");
    setSetupMode("submitting");

    try {
      const response = await fetch("/api/system/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "custom",
          schoolName: schoolName.trim(),
          adminName: adminName.trim(),
          adminEmail: adminEmail.trim(),
          adminPassword: adminPassword,
          otherCounselors: auxCounselors,
          counselingRoom: counselingRoom.trim(),
          hotline: hotline.trim(),
          consultationHours: consultationHours.trim(),
          principalHotline: principalHotline.trim()
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onSetupSuccess();
      } else {
        setErrorMsg(data.error || "Gặp sự cố khi kích hoạt hệ thống.");
        setSetupMode("custom");
      }
    } catch {
      setErrorMsg("Không kết nối được tới máy chủ SafeZone.");
      setSetupMode("custom");
    } finally {
      setIsActivating(false);
    }
  };

  const handleMockSetupSubmit = async () => {
    setIsActivating(true);
    setSetupMode("submitting");

    try {
      const response = await fetch("/api/system/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "mock" })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onSetupSuccess();
      } else {
        setErrorMsg(data.error || "Gặp sự cố khi cài đặt mô phỏng thử nghiệm.");
        setSetupMode("choose");
      }
    } catch {
      setErrorMsg("Không thể đồng bộ cơ sở dữ liệu mẫu.");
      setSetupMode("choose");
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 backdrop-blur-sm flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-serif text-slate-800" id="initializer_panel">
      <div className="max-w-xl w-full mx-auto bg-white rounded-3xl border border-slate-150 p-8 sm:p-10 shadow-2xl relative">
        
        {/* Dynamic header */}
        <div className="text-center space-y-3 mb-8">
          <img src="/logo-universal.png?v=3" alt="SafeZone Logo" className="h-20 w-20 object-contain mx-auto pointer-events-none" />
          <h1 className="text-[32px] font-black tracking-tight text-slate-900 uppercase home-hero-title">
            SafeZone
          </h1>
          <p className="text-[17px] text-slate-600 max-w-md mx-auto leading-relaxed font-sans mt-2">
            Hệ thống hỗ trợ tâm lý học đường toàn diện. Nơi giáo viên thiết lập không gian an toàn và bảo mật.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-[15px] font-bold font-sans">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* --- STEP 1: CHOOSE PROTOCOL SETUP --- */}
        {setupMode === "choose" && (
          <div className="space-y-8 animate-fade-in font-sans">
            <h3 className="text-[19px] font-bold text-slate-900 uppercase tracking-widest text-center">
              Khởi tạo Hệ thống
            </h3>

            <div className="grid grid-cols-1 gap-6">
              
              {/* Clean Slate option */}
              <button
                onClick={() => setSetupMode("custom")}
                className="w-full text-left rounded-3xl border border-slate-200 hover:border-indigo-500 bg-white p-6 transition-all hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer group"
              >
                <div className="flex items-start gap-5">
                  <div className="rounded-full bg-indigo-100 text-indigo-600 p-4 group-hover:scale-105 transition-transform shrink-0">
                    <School size={24} />
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-[17px] font-black text-slate-900 uppercase">Trường học Thực tế</strong>
                      <span className="bg-slate-100 text-slate-700 text-[13px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Khuyên dùng</span>
                    </div>
                    <p className="text-[15px] text-slate-500 leading-relaxed">
                      Cài đặt hệ thống hoàn toàn mới cho đơn vị giáo dục của bạn, thiết lập quyền truy cập cho quản trị viên.
                    </p>
                  </div>
                </div>
              </button>

              {/* Mock Preset Option */}
              <button
                onClick={() => setSetupMode("mock")}
                className="w-full text-left rounded-3xl border border-slate-200 hover:border-indigo-500 bg-white p-6 transition-all hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer group"
              >
                <div className="flex items-start gap-5">
                  <div className="rounded-full bg-teal-100 text-teal-600 p-4 group-hover:scale-105 transition-transform shrink-0">
                    <Sparkles size={24} />
                  </div>
                  <div className="space-y-1.5 pt-1 font-sans">
                    <strong className="text-[17px] font-black text-slate-900 uppercase">Bản mẫu thử nghiệm</strong>
                    <p className="text-[15px] text-slate-500 leading-relaxed">
                      Nạp dữ liệu mẫu để trải nghiệm tính năng chương trình nhanh chóng.
                    </p>
                  </div>
                </div>
              </button>

              {/* Student Bypass Option */}
              <a
                href="https://truonghocantoan.ai.studio"
                className="block text-center mt-4 text-[15px] p-4 font-bold text-slate-500 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
              >
                Em là Học sinh? Click tại đây để truy cập trực tiếp ứng dụng không qua cài đặt ➜
              </a>

              {/* Specialized Link Information Section */}
              <div className="mt-6 border-t border-slate-100 pt-6 space-y-4">
                <h4 className="text-[13px] font-extrabold text-slate-700 uppercase tracking-widest text-center decoration-indigo-500 decoration-2">
                  🔗 DANH SÁCH ĐƯỜNG DẪN TRUY CẬP (SAFEZONE LINKS)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
                  {/* Link 1: Direct Access for students */}
                  <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 flex flex-col justify-between hover:bg-emerald-50/70 transition-all">
                    <div>
                      <strong className="block text-[13.5px] text-emerald-800 uppercase font-black flex items-center gap-1.5">
                        <span className="text-base">🎓</span> LINK HỌC SINH (TRỰC TIẾP)
                      </strong>
                      <p className="text-[13px] text-slate-500 mt-1 leading-relaxed font-sans font-medium">
                        Khi giáo viên chia sẻ link này, học sinh của các trường sẽ vào trực tiếp ứng dụng để trình bày tâm sự, không bao giờ bị dừng lại ở trang cài đặt.
                      </p>
                    </div>
                    <div className="mt-3">
                      <code className="block bg-white text-emerald-700 px-2.5 py-1.5 text-[12px] font-mono rounded-lg border border-emerald-200 select-all font-bold truncate cursor-pointer shadow-xs" title="Nhấp đúp chuột để sao chép">
                        https://truonghocantoan.ai.studio
                      </code>
                    </div>
                  </div>

                  {/* Link 2: Teacher setup */}
                  <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100 flex flex-col justify-between hover:bg-indigo-50/70 transition-all">
                    <div>
                      <strong className="block text-[13.5px] text-indigo-800 uppercase font-black flex items-center gap-1.5">
                        <span className="text-base">⚙️</span> LINK PHÂN QUYỀN (BGH)
                      </strong>
                      <p className="text-[13px] text-slate-500 mt-1 leading-relaxed font-sans font-medium">
                        Đường dẫn đặc quyền dành cho Ban Giám hiệu, nhà trường hoặc bộ phận nhân sự để cài đặt cơ sở riêng hay thiết lập thêm giáo viên.
                      </p>
                    </div>
                    <div className="mt-3">
                      <code className="block bg-white text-indigo-700 px-2.5 py-1.5 text-[12px] font-mono rounded-lg border border-indigo-200 select-all font-bold truncate cursor-pointer shadow-xs" title="Nhấp đúp chuột để sao chép">
                        {window.location.origin}/?setup=true
                      </code>
                    </div>
                  </div>
                </div>
                
                <p className="text-center text-[12.5px] text-slate-400 font-medium font-sans italic leading-relaxed">
                  💡 Giải pháp định hướng thông minh: Ban Giám hiệu chỉ cần gửi đúng liên kết phù hợp cho từng nhóm đối tượng học sinh hoặc thầy cô để sử dụng ngay lập tức.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* --- STEP 1A: CONFIRM MOCK PRESENTS --- */}
        {setupMode === "mock" && (
          <div className="space-y-6 animate-fade-in font-sans">
            <p className="text-[15px] text-slate-600 leading-relaxed bg-amber-50 border border-amber-200 p-4 rounded-2xl">
              💡 Bạn đã quyết định chọn **Bản thử nghiệm mẫu**. Hệ thống sẽ tự động cấu hình các tham vấn viên, trường học và tạo sẵn một số đơn báo cáo giả lập để bạn kiểm thử các chức năng xử lý hồ sơ bí mật.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSetupMode("choose")}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-2xl text-[15px] hover:bg-slate-200 cursor-pointer"
              >
                Quay lại
              </button>
              <button
                onClick={handleMockSetupSubmit}
                className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-2xl text-[15px] hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5"
              >
                Đồng ý & Kích hoạt dữ liệu mẫu <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 2: CUSTOM SETUP FORM --- */}
        {setupMode === "custom" && (
          <form onSubmit={handleCustomSetupSubmit} className="space-y-6 animate-fade-in font-sans text-[15px]">
            <h3 className="text-[17px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <School size={16} className="text-indigo-600" />
              Thông tin Trường học & Ban giám sát
            </h3>

            <div className="space-y-4">
              
              {/* School Name block with Guide */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Cơ sở Giáo dục của Bạn *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trường THPT Chuyên Lê Hồng Phong (TP. HCM)"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-3 bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 outline-hidden focus:border-indigo-600 focus:bg-white transition font-sans font-medium text-[17px]"
                  required
                />
                
                {/* Visual guideline card */}
                <div className="mt-2 p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2 text-[15px] leading-relaxed text-slate-650 font-sans">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-[15px]">
                    <Sparkles size={13} className="text-indigo-600" />
                    <span>Nên nhập kèm địa danh Tỉnh/Thành phố hoặc Quận/Huyện không?</span>
                  </div>
                  <p>
                    <strong className="text-slate-800">Cực kỳ khuyên dùng!</strong> Vì trên toàn quốc có rất nhiều trường trùng tên nhau (ví dụ: <span className="italic">THCS Nguyễn Du</span>, <span className="italic">THPT Phan Đình Phùng</span>). Để hệ thống phân biệt riêng biệt và học sinh không bị nhầm lẫn khi nộp đơn, em hãy đặt tên theo các công thức sau:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[15px]">
                    <div className="bg-white p-2 rounded-xl border border-slate-100 space-y-1">
                      <span className="block text-emerald-600 font-bold">✓ Cách 1: Thêm Tỉnh/Thành phố</span>
                      <p className="text-slate-550 italic">Công thức nhanh & tối ưu nhất:</p>
                      <div className="bg-slate-50/60 backdrop-blur-sm px-1.5 py-1 rounded text-slate-800 font-bold border">
                        Tên Trường (Tên Tỉnh)
                      </div>
                      <p className="text-slate-400 text-[15px]">Ví dụ: THPT Phan Đình Phùng (Hà Nội)</p>
                    </div>
                    
                    <div className="bg-white p-2 rounded-xl border border-slate-100 space-y-1">
                      <span className="block text-indigo-600 font-bold">✓ Cách 2: Chi tiết đến Quận/Huyện</span>
                      <p className="text-slate-550 italic">Dành cho cấp Tiểu học/THCS quản lý:</p>
                      <div className="bg-slate-50/60 backdrop-blur-sm px-1.5 py-1 rounded text-slate-800 font-bold border">
                        Tên Trường, Quận/Huyện, Tỉnh
                      </div>
                      <p className="text-slate-400 text-[15px]">Ví dụ: THCS Nguyễn Du, Quận 1, TP. HCM</p>
                    </div>
                  </div>
                  
                  <p className="text-[15px] text-slate-400 pt-1 border-t border-slate-100/60 font-sans italic">
                    💡 Học sinh khi truy cập SafeZone sẽ nhìn thấy đúng Thẻ nhận diện này để an tâm gửi thư đúng nhà trường.
                  </p>
                </div>
              </div>

              {/* Master Counselor Admin Account details */}
              <div className="bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 p-4 rounded-2xl border border-slate-200/60 space-y-3">
                <strong className="block text-slate-800 font-bold uppercase text-[15px] tracking-wider mb-1">
                  🔑 Tài khoản Quản trị viên / Nhà tâm lý học chính
                </strong>

                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5">Tên hiển thị (Thầy/Cô) *</label>
                    <input
                      type="text"
                      placeholder="ví dụ: Thầy Hoàng Văn Sơn"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 p-2.5 bg-white focus:border-indigo-600"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-0.5">Email làm việc *</label>
                      <input
                        type="email"
                        placeholder="admin@school.edu.vn"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 p-2.5 bg-white focus:border-indigo-600 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-0.5">Mật khẩu admin *</label>
                      <input
                        type="password"
                        placeholder="Mật khẩu bảo mật"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 p-2.5 bg-white focus:border-indigo-600"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Consultation Room & School Contact Hotline */}
              <div className="bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/40 p-4 rounded-2xl border border-emerald-200/60 space-y-3">
                <strong className="block text-emerald-900 font-bold uppercase text-[15px] tracking-wider mb-1 flex items-center gap-1.5">
                  🏢 Thông tin Phòng Tư Vấn Tâm Lý & Đường Dây Nóng
                </strong>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-0.5">Tên phòng tư vấn</label>
                      <input
                        type="text"
                        placeholder="Phòng Tham Vấn Tâm Lý Học Đường (Nhà B)"
                        value={counselingRoom}
                        onChange={(e) => setCounselingRoom(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 p-2.5 bg-white focus:border-emerald-600 text-[14px]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-0.5">Đường dây nóng (Hotline)</label>
                      <input
                        type="text"
                        placeholder="028.3835.xxxx hoặc 090x.xxx.xxx"
                        value={hotline}
                        onChange={(e) => setHotline(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 p-2.5 bg-white focus:border-emerald-600 text-[14px] font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-0.5">Thời gian tiếp nhận</label>
                      <input
                        type="text"
                        placeholder="Thứ 2 - Thứ 6 (Giờ ra chơi & Sau giờ học)"
                        value={consultationHours}
                        onChange={(e) => setConsultationHours(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 p-2.5 bg-white focus:border-emerald-600 text-[14px]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-0.5">Khẩn cấp BGH / Đường dây bảo vệ 24/7</label>
                      <input
                        type="text"
                        placeholder="111 (Tổng đài Trẻ em) hoặc Hotline BGH"
                        value={principalHotline}
                        onChange={(e) => setPrincipalHotline(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 p-2.5 bg-white focus:border-emerald-600 text-[14px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Auxiliary counselors setup */}
              <div className="bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 p-4 rounded-2xl border border-slate-200/60 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <strong className="block text-slate-800 font-bold uppercase text-[15px] tracking-wider">
                    👥 Phân quyền thêm cho Giáo viên tư vấn trợ tá
                  </strong>
                  <span className="text-[15px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">
                    Đã thêm: {auxCounselors.length}
                  </span>
                </div>
                
                {auxCounselors.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto mb-3 bg-white p-2 rounded-2xl border">
                    {auxCounselors.map((c, i) => (
                      <div key={i} className="flex justify-between items-center text-[15px] bg-slate-50/60 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border">
                        <div>
                          <span className="font-bold text-slate-800">{c.name}</span>
                          <span className="text-slate-400 font-mono ml-2">({c.email})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAuxCounselor(i)}
                          className="text-rose-500 hover:text-rose-700 cursor-pointer font-bold uppercase text-[15px]"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline form to append counselor */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Tên Cô/Thầy"
                    value={newAuxName}
                    onChange={(e) => setNewAuxName(e.target.value)}
                    className="rounded-2xl border border-slate-200 p-2 bg-white text-[17px]"
                  />
                  <input
                    type="email"
                    placeholder="email@school.edu.vn"
                    value={newAuxEmail}
                    onChange={(e) => setNewAuxEmail(e.target.value)}
                    className="rounded-2xl border border-slate-200 p-2 bg-white text-[17px] font-mono"
                  />
                  <input
                    type="password"
                    placeholder="Mật khẩu phụ"
                    value={newAuxPassword}
                    onChange={(e) => setNewAuxPassword(e.target.value)}
                    className="rounded-2xl border border-slate-200 p-2 bg-white text-[17px]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddAuxCounselor}
                  className="w-full text-center hover:bg-indigo-50 border border-dashed border-indigo-300 text-indigo-700 py-2 rounded-2xl text-[17px] font-bold cursor-pointer transition-colors"
                >
                  ➕ Thêm Giáo Viên Này Vào Phân Quyền
                </button>
              </div>

            </div>

            <div className="flex gap-2 justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSetupMode("choose")}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-2xl cursor-pointer"
              >
                Quay lại
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-slate-900 text-white font-bold rounded-2xl cursor-pointer shadow-md"
              >
                Kích hoạt SafeZone Học Đường ⚙
              </button>
            </div>
          </form>
        )}

        {/* --- STEP 3: SUBMITTING / ACTIVATING --- */}
        {setupMode === "submitting" && (
          <div className="py-12 text-center space-y-4 font-sans animate-pulse">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent" />
            <p className="text-[17px] text-indigo-700 font-bold">
              🛠️ Đang xóa trắng cấu hình cũ, cấp phép dữ liệu trường mới & băm khóa lớp học ẩn danh...
            </p>
            <p className="text-[15px] text-slate-400">Vui lòng đợi trong giây lát.</p>
          </div>
        )}

      </div>
    </div>
  );
}
