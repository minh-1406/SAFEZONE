import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  Filter, 
  Search, 
  RefreshCw, 
  Send,
  User,
  School,
  Tag,
  MapPin,
  FileSpreadsheet,
  Lock,
  LogOut,
  ShieldCheck,
  Briefcase,
  Trash2
} from "lucide-react";
import { Report } from "../types";

export const MASTER_DISTRIBUTOR_EMAIL = "c3ndqminh.pdl@hue.edu.vn";

const formatReportDate = (isoString: string) => {
  if (!isoString) return "";
  try {
    const dateObj = new Date(isoString);
    if (isNaN(dateObj.getTime())) return isoString;
    
    // Check if the ISO string doesn't have minutes/seconds (e.g. legacy split "2026-06-03")
    if (isoString.length <= 10) {
      const parts = isoString.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return isoString;
    }

    const pad = (num: number) => String(num).padStart(2, "0");
    const d = pad(dateObj.getDate());
    const m = pad(dateObj.getMonth() + 1);
    const y = dateObj.getFullYear();
    const hr = pad(dateObj.getHours());
    const min = pad(dateObj.getMinutes());
    
    return `${d}/${m}/${y} lúc ${hr}:${min}`;
  } catch (e) {
    return isoString;
  }
};

interface CounselorDashboardProps {
  onRefreshData: () => void;
  onSystemReset?: () => void;
}

export default function CounselorDashboard({ onRefreshData, onSystemReset }: CounselorDashboardProps) {
  // Trạng thái đăng nhập của nhà tâm lý
  const [currentCounselor, setCurrentCounselor] = useState<any | null>(() => {
    const saved = localStorage.getItem("logged_counselor");
    return saved ? JSON.parse(saved) : null;
  });

  // Giao diện Form Đăng nhập
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // States quản lý của Dashboard
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Selected Report detail state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showCounselorDeleteConfirm, setShowCounselorDeleteConfirm] = useState(false);
  const [isDeletingReport, setIsDeletingReport] = useState(false);
  
  // Controls bộ lọc
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [schoolFilter, setSchoolFilter] = useState("Tất cả");
  const [searchCode, setSearchCode] = useState("");
  
  // Internal reply
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyError, setReplyError] = useState("");

  // Danh sách tài khoản được cấp quyền từ máy chủ
  const [counselorsList, setCounselorsList] = useState<any[]>([]);
  
  // Form thêm giáo sư mới
  const [newCName, setNewCName] = useState("");
  const [newCEmail, setNewCEmail] = useState("");
  const [newCPassword, setNewCPassword] = useState("");
  const [newCSchool, setNewCSchool] = useState("");
  const [newCRole, setNewCRole] = useState<"Counselor" | "Co-Admin">("Counselor");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [activeSystemSchools, setActiveSystemSchools] = useState<string[]>([]);

  // School Settings & Handover modal state
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverSchoolName, setHandoverSchoolName] = useState("");
  const [handoverAdminName, setHandoverAdminName] = useState("");
  const [handoverAdminEmail, setHandoverAdminEmail] = useState("");
  const [handoverAdminPassword, setHandoverAdminPassword] = useState("");
  const [handoverWipeOldData, setHandoverWipeOldData] = useState(true);
  const [handoverCounselingRoom, setHandoverCounselingRoom] = useState("Phòng Tham Vấn Tâm Lý Học Đường");
  const [handoverHotline, setHandoverHotline] = useState("");
  const [handoverConsultationHours, setHandoverConsultationHours] = useState("Thứ 2 - Thứ 6 (Giờ hành chính & Sau giờ học)");
  const [handoverPrincipalHotline, setHandoverPrincipalHotline] = useState("");
  const [handoverNote, setHandoverNote] = useState("");
  const [handoverLoading, setHandoverLoading] = useState(false);
  const [handoverError, setHandoverError] = useState("");
  const [handoverSuccess, setHandoverSuccess] = useState("");

  // School Room & Hotline Settings modal
  const [showSchoolSettingsModal, setShowSchoolSettingsModal] = useState(false);
  const [curSchoolSettings, setCurSchoolSettings] = useState<{
    schoolName: string;
    counselingRoom: string;
    hotline: string;
    consultationHours: string;
    principalHotline: string;
    bannerNotice: string;
  }>({
    schoolName: "",
    counselingRoom: "Phòng Tham Vấn Tâm Lý Học Đường",
    hotline: "",
    consultationHours: "Thứ 2 - Thứ 6 (Giờ hành chính & Sau giờ học)",
    principalHotline: "",
    bannerNotice: ""
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");

  const loadSchoolSettings = async () => {
    try {
      const schoolTarget = currentCounselor?.school === "Tất cả" ? "" : currentCounselor?.school;
      const res = await fetch(`/api/admin/school-settings?school=${encodeURIComponent(schoolTarget || "")}`);
      if (res.ok) {
        const data = await res.json();
        setCurSchoolSettings({
          schoolName: data.schoolName || "",
          counselingRoom: data.counselingRoom || "Phòng Tham Vấn Tâm Lý Học Đường",
          hotline: data.hotline || "",
          consultationHours: data.consultationHours || "Thứ 2 - Thứ 6 (Giờ hành chính)",
          principalHotline: data.principalHotline || "",
          bannerNotice: data.bannerNotice || ""
        });
      }
    } catch (err) {
      console.error("Lỗi nạp cấu hình trường:", err);
    }
  };

  const handleSaveSchoolSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError("");
    setSettingsSuccess("");

    try {
      const res = await fetch("/api/admin/school-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: currentCounselor?.school === "Tất cả" ? curSchoolSettings.schoolName : currentCounselor?.school,
          counselingRoom: curSchoolSettings.counselingRoom,
          hotline: curSchoolSettings.hotline,
          consultationHours: curSchoolSettings.consultationHours,
          principalHotline: curSchoolSettings.principalHotline,
          bannerNotice: curSchoolSettings.bannerNotice
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsSuccess("Đã lưu thông tin Phòng tư vấn tâm lý thành công!");
        onRefreshData();
      } else {
        setSettingsError(data.error || "Gặp sự cố khi lưu cấu hình.");
      }
    } catch {
      setSettingsError("Không kết nối được tới máy chủ.");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleExecuteHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverSchoolName.trim() || !handoverAdminName.trim() || !handoverAdminEmail.trim() || !handoverAdminPassword.trim()) {
      setHandoverError("Vui lòng điền đủ Tên trường, Tên thầy cô, Email và Mật khẩu bàn giao.");
      return;
    }

    if (!window.confirm(`XÁC NHẬN CHUYỂN GIAO QUYỀN LÀM CHỦ:\n\nTrường tiếp nhận: ${handoverSchoolName}\nQuản trị viên tiếp quản: ${handoverAdminName} (${handoverAdminEmail})\nCách ly & Xóa trắng dữ liệu cũ: ${handoverWipeOldData ? "CÓ (Bảo mật 100% bí mật học sinh trường cũ)" : "KHÔNG (Giữ dữ liệu đa trường)"}\n\nSau khi bàn giao, trường "${handoverSchoolName}" sẽ toàn quyền làm chủ ứng dụng này. Em có chắc chắn muốn tiến hành?`)) {
      return;
    }

    setHandoverLoading(true);
    setHandoverError("");
    setHandoverSuccess("");

    try {
      const res = await fetch("/api/system/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initiatorEmail: currentCounselor?.email || "",
          newSchoolName: handoverSchoolName.trim(),
          newAdminName: handoverAdminName.trim(),
          newAdminEmail: handoverAdminEmail.trim(),
          newAdminPassword: handoverAdminPassword,
          wipeOldData: handoverWipeOldData,
          counselingRoom: handoverCounselingRoom.trim(),
          hotline: handoverHotline.trim(),
          consultationHours: handoverConsultationHours.trim(),
          principalHotline: handoverPrincipalHotline.trim(),
          handoverNote: handoverNote.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHandoverSuccess(data.message);
        alert(`BÀN GIAO THÀNH CÔNG!\n\nĐã bàn giao quyền làm chủ độc lập cho trường "${handoverSchoolName}".\nEmail quản trị mới: ${handoverAdminEmail}\nMật khẩu mới: ${handoverAdminPassword}\n\nTài khoản Master (${MASTER_DISTRIBUTOR_EMAIL}) đã hoàn tất phân quyền.`);
        setShowHandoverModal(false);
        loadCounselors();
      } else {
        setHandoverError(data.error || "Gặp lỗi khi chuyển giao quyền làm chủ.");
      }
    } catch {
      setHandoverError("Không kết nối được tới máy chủ khi chuyển giao.");
    } finally {
      setHandoverLoading(false);
    }
  };

  const loadCounselors = async () => {
    try {
      const emailParam = currentCounselor?.email ? `?email=${encodeURIComponent(currentCounselor.email)}` : "";
      const res = await fetch(`/api/admin/counselors${emailParam}`);
      if (res.ok) {
        const data = await res.json();
        setCounselorsList(data);
      }
      if (currentCounselor?.role === "Admin") {
        const sysRes = await fetch("/api/system/status");
        if (sysRes.ok) {
          const sysData = await sysRes.json();
          setActiveSystemSchools(sysData.schools || []);
        }
      }
    } catch (err) {
      console.error("Lỗi đồng bộ danh sách phân quyền:", err);
    }
  };

  useEffect(() => {
    loadCounselors();
    if (currentCounselor) {
      loadSchoolSettings();
    }
  }, [currentCounselor]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const found = data.counselor;
        setCurrentCounselor(found);
        localStorage.setItem("logged_counselor", JSON.stringify(found));
        // Tự động gán bộ lọc trường học theo phân quyền của tài khoản
        if (found.school !== "Tất cả") {
          setSchoolFilter(found.school);
        } else {
          setSchoolFilter("Tất cả");
        }
        setEmailInput("");
        setPasswordInput("");
      } else {
        setLoginError(data.error || "Email hoặc mật khẩu không chính xác. Em vui lòng kiểm tra lại danh sách cấp quyền ở dưới.");
      }
    } catch {
      setLoginError("Không kết nối được tới máy chủ xác thực.");
    }
  };

  const handleLogout = () => {
    setCurrentCounselor(null);
    setSelectedReport(null);
    localStorage.removeItem("logged_counselor");
  };

  const handleWipeSystem = async () => {
    if (!window.confirm("CẢNH BÁO CAO CẤP: Hành động này sẽ xóa vĩnh viễn TOÀN BỘ đơn từ phản ánh mật, tài khoản các giáo viên phụ tá và reset SafeZone về trạng bị trắng chưa cấu hình ban đầu. Em có chắc chắn muốn tiếp tục không?")) {
      return;
    }

    try {
      const res = await fetch("/api/system/reset", { method: "POST" });
      if (res.ok) {
        alert("Đã xóa trắng dữ liệu & cấu hình phân quyền giáo viên thành công! App sẽ tự động tải lại.");
        handleLogout();
        if (onSystemReset) {
          onSystemReset();
        } else {
          window.location.reload();
        }
      } else {
        alert("Gặp sự cố máy chủ khi tiến hành khôi phục gốc.");
      }
    } catch {
      alert("Lỗi kết nối máy chủ khi reset hệ thống.");
    }
  };

  const handleAddNewCounselor = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");

    const submitSchool = currentCounselor?.role !== "Admin" ? currentCounselor?.school : newCSchool;

    if (!newCName || !newCEmail || !newCPassword || !submitSchool) {
      setAddError("Vui lòng điền đủ tất cả các trường thông tin cấp quyền.");
      return;
    }

    try {
      const res = await fetch("/api/admin/counselors/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCName,
          email: newCEmail,
          password: newCPassword,
          school: submitSchool,
          role: newCRole
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAddSuccess(`Cấp quyền thành công cho giảng viên ${newCName}!`);
        setNewCName("");
        setNewCEmail("");
        setNewCPassword("");
        setNewCSchool(currentCounselor?.role !== "Admin" ? currentCounselor?.school || "" : "");
        setNewCRole("Counselor");
        loadCounselors();
      } else {
        setAddError(data.error || "Gặp lỗi khi tạo mới tài khoản giáo viên.");
      }
    } catch {
      setAddError("Không gửi được dữ liệu cấp quyền tới máy chủ.");
    }
  };

  const handleDeleteCounselor = async (emailToRevoke: string) => {
    if (emailToRevoke.toLowerCase() === currentCounselor?.email?.toLowerCase()) {
      alert("Em không thể tự thu hồi quyền truy cập của chính bản thân mình!");
      return;
    }
    if (!window.confirm(`XÁC NHẬN BẢO MẬT: Em chắc chắn muốn hủy bỏ & thu hồi toàn bộ quyền hạn của tài khoản: ${emailToRevoke}? Giáo sư này sẽ bị ngắt kết nối ngay lập tức.`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/counselors/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToRevoke })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Đã thu hồi đặc quyền thành viên của Thầy/Cô thành công!");
        loadCounselors();
      } else {
        alert(data.error || "Gặp lỗi khi yêu cầu thu hồi quyền tư vấn tâm lý.");
      }
    } catch {
      alert("Lỗi kết nối máy chủ khi xử lý thu hồi.");
    }
  };

  const handleDeleteSchool = async (schoolNameToDelete: string) => {
    if (activeSystemSchools.length <= 1) {
      alert("Hành động bị chặn: Phải có ít nhất 1 trường học trực tuyến để học sinh gửi phản hồi (tránh tình trạng rắn không đầu)!");
      return;
    }

    if (!window.confirm(`XÁC NHẬN BẢO MẬT: Chắc chắn muốn xóa trường: ${schoolNameToDelete} khỏi danh sách được hỗ trợ (Trường này sẽ không còn hiển thị ở trang gởi hồ sơ ẩn danh)?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/schools/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolName: schoolNameToDelete })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Đã xóa trường học thành công!");
        loadCounselors(); // Tải lại danh sách trường
      } else {
        alert("Lỗi: " + (data.error || "Không thể xóa trường học này."));
      }
    } catch {
      alert("Lỗi kết nối máy chủ khi xử lý xóa trường.");
    }
  };

  const loadReports = async () => {
    if (!currentCounselor) return;
    setLoading(true);
    setError("");
    try {
      const emailParam = encodeURIComponent(currentCounselor.email);
      const schoolParam = encodeURIComponent(currentCounselor.school);
      const res = await fetch(`/api/admin/reports?email=${emailParam}&school=${schoolParam}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
        
        // Cập nhật lại chi tiết báo cáo đang chọn nếu có dữ liệu mới
        if (selectedReport) {
          const updated = data.find((r: Report) => r.code === selectedReport.code);
          if (updated) setSelectedReport(updated);
        }
      } else {
        setError("Không thể nạp dữ liệu đơn từ máy chủ.");
      }
    } catch {
      setError("Lỗi kết nối máy chủ khi nạp kho lưu trữ đơn báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  // Đồng bộ hóa khi đăng nhập thành công hoặc làm mới + Tự động thăm dò dữ liệu mới (Realtime Sync)
  useEffect(() => {
    if (currentCounselor) {
      loadReports();
      // Áp đặt bộ lọc cứng theo trường học của nhà tâm lý
      if (currentCounselor.school !== "Tất cả") {
        setSchoolFilter(currentCounselor.school);
      }

      // Chức năng ngầm tự động cập nhật dữ liệu báo cáo mới sau mỗi 5 giây
      const fetchDataSilently = async () => {
        if (typeof document !== "undefined" && document.visibilityState !== "visible") {
          return;
        }
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          return;
        }
        try {
          const emailParam = encodeURIComponent(currentCounselor.email);
          const schoolParam = encodeURIComponent(currentCounselor.school);
          const res = await fetch(`/api/admin/reports?email=${emailParam}&school=${schoolParam}`);
          if (res.ok) {
            const data = await res.json();
            setReports(data);
            
            // Tự động làm mới chi tiết hồ sơ đang chọn nếu có hội thoại hoặc phản hồi mới từ học sinh
            if (selectedReport) {
              const updated = data.find((r: Report) => r.code === selectedReport.code);
              if (updated) {
                setSelectedReport(updated);
              }
            }
          }
        } catch (e) {
          console.warn("Tự đồng bộ báo cáo tư vấn tâm lý bị ngắt quãng:", e);
        }
      };

      const interval = setInterval(fetchDataSilently, 5000);

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          fetchDataSilently();
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [currentCounselor, selectedReport?.code]);

  const handleUpdateStatus = async (code: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/reports/${code}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Làm mới trạng thái cục bộ
        setReports(prev => prev.map(r => r.code === code ? { ...r, status: newStatus as any } : r));
        if (selectedReport && selectedReport.code === code) {
          setSelectedReport(prev => prev ? { ...prev, status: newStatus as any } : null);
        }
        onRefreshData();
      } else {
        setReplyError("Có lỗi xảy ra khi cập nhật tiến trình trạng thái.");
      }
    } catch {
      setReplyError("Lỗi kết nối máy chủ khi cập nhật trạng thái hồ sơ.");
    }
  };

  const handleCounselorDeleteReport = async (code: string) => {
    setIsDeletingReport(true);
    setReplyError("");
    try {
      const res = await fetch(`/api/reports/${code}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setReports(prev => prev.filter(r => r.code !== code));
        setSelectedReport(null);
        setShowCounselorDeleteConfirm(false);
        onRefreshData();
      } else {
        setReplyError(data.error || "Có lỗi xảy ra khi xóa báo cáo.");
      }
    } catch {
      setReplyError("Lỗi kết nối máy chủ khi thực hiện xóa.");
    } finally {
      setIsDeletingReport(false);
    }
  };

  const handleSendCounselorReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedReport) return;

    setIsReplying(true);
    setReplyError("");

    try {
      const res = await fetch(`/api/reports/${selectedReport.code}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyMessage,
          sender: "Counselor"
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Cập nhật cả danh sách cục bộ và báo cáo đang chọn
        // Trạng thái sẽ tự động chuyển sang "Đang xử lý" nếu trước đó là "Đang chờ tiếp nhận"
        setReports(prev => prev.map(r => r.code === selectedReport.code ? {
          ...r,
          responses: data.responses,
          status: data.status
        } : r));
        
        setSelectedReport(prev => prev ? {
          ...prev,
          responses: data.responses,
          status: data.status
        } : null);

        setReplyMessage("");
        onRefreshData();
      } else {
        setReplyError(data.error || "Gặp sự cố khi gửi tin nhắn tư vấn tâm lý.");
      }
    } catch {
      setReplyError("Lỗi kết nối máy chủ khi đẩy tin phản hồi Counselor.");
    } finally {
      setIsReplying(false);
    }
  };

  // Trích xuất danh sách trường học duy nhất để hỗ trợ lọc (đối với tài khoản Admin)
  const existingSchools = ["Tất cả", ...Array.from(new Set(reports.map(r => r.schoolName)))];

  // Lọc danh sách hồ sơ nghiêm ngặt theo phân quyền trường học của tài khoản nhà tâm lý
  // NGUYÊN TẮC BẢO MẬT TUYỆT ĐỐI:
  // - Mỗi tài khoản (kể cả Master Distributor) chỉ có quyền xem hồ sơ học sinh thuộc trường được gán của mình
  // - Hoàn toàn không thể xem chéo hồ sơ của bất kỳ trường nào khác sau khi bàn giao
  const assignedSchool = currentCounselor?.school === "Tất cả" ? "Trường THPT Phan Đăng Lưu" : currentCounselor?.school;

  const filteredReports = reports.filter(r => {
    // 1. Phân quyền trường học: Khóa cứng theo trường được gán của tài khoản
    const isAuthorizedSchool = !assignedSchool || r.schoolName?.trim().toLowerCase() === assignedSchool?.trim().toLowerCase();
    if (!isAuthorizedSchool) return false;

    // 2. Chấp hành bộ lọc Trạng thái
    const matchStatus = statusFilter === "Tất cả" || r.status === statusFilter;
    
    // 3. Chấp hành tìm kiếm theo Mã hoặc Tiêu đề
    const matchSearch = !searchCode || r.code.toUpperCase().includes(searchCode.trim().toUpperCase()) 
                     || r.title.toLowerCase().includes(searchCode.toLowerCase());
    
    return matchStatus && matchSearch;
  });

  // --- RENDERING MÀN HÌNH ĐĂNG NHẬP NẾU CHƯA XÁC THỰC ---
  if (!currentCounselor) {
    return (
      <div className="max-w-md mx-auto py-10 px-4 space-y-6" id="counselor_login_panel">
        <div className="rounded-3xl border border-slate-100 bg-white p-7 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
              <Lock size={26} className="animate-pulse" />
            </div>
            <h2 className="text-[21px] font-black tracking-tight text-slate-800 uppercase">
              XÁC THỰC BAN PHỤ TRÁCH
              <br />
              tư vấn tâm lý
            </h2>
            <p className="text-[15px] text-slate-500 leading-relaxed">
              Vui lòng đăng nhập tài khoản Cố vấn / Nhà tâm lý học đường được cấp quyền để tiếp quản dữ liệu phản ánh mật của học sinh.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-[15px]">
            {loginError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 font-medium">
                ⚠️ {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Email:</label>
              <input 
                type="email" 
                placeholder="vd: amsterdam.counselor@school.edu.vn"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 outline-hidden focus:border-indigo-600 focus:bg-white bg-slate-50/60 backdrop-blur-sm transition"
                required
              />
            </div>

            <div className="space-y-1 relative">
              <div className="flex justify-between items-center">
                <label className="block font-bold text-slate-700">Mật khẩu:</label>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[13px] text-indigo-600 font-bold hover:underline focus:outline-hidden"
                >
                  {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                </button>
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 outline-hidden focus:border-indigo-600 focus:bg-white bg-slate-50/60 backdrop-blur-sm transition"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200/50 text-white border-0 py-3 text-[15px] font-bold text-white hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <ShieldCheck size={16} /> Mở khóa Phòng tư vấn tâm lý
            </button>
            
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  window.location.href = window.location.protocol + "//" + window.location.host + window.location.pathname + "?setup=true";
                }}
                className="text-[14px] font-bold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
              >
                Quản trị viên? Về lại trang thiết lập & phân quyền gốc
              </button>
            </div>
          </form>
        </div>

        {/* Danh sách tài khoản hoạt động thực tế */}
        <div className="rounded-2xl bg-amber-50/75 border border-amber-200/50 p-5 space-y-3 shadow-sm shadow-indigo-100/30">
          <div className="flex items-center gap-2 text-[15px] font-extrabold text-amber-800 uppercase">
            <User size={14} /> Danh sách phân quyền tài khoản hoạt động thực tế
          </div>
          <p className="text-[14px] text-amber-700 leading-normal">
            Hệ thống phân tách quyền hạn chặt chẽ. Khi đăng nhập theo email trường nào, nhà tâm lý trường đó chỉ xem được hòm thư báo cáo mật của trường học của mình.
          </p>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {counselorsList.map((acc, idx) => {
              const maskName = (role: string) => {
                if (role === "Admin") return "Quản trị viên tối cao (Ẩn danh)";
                if (role === "Co-Admin") return "Quản trị đồng hành (Ẩn danh)";
                return "Cố vấn học đường (Ẩn danh)";
              };
              
              return (
              <div key={idx} className="bg-white p-2.5 rounded-xl border border-amber-250/30 text-[13px] space-y-1 font-medium">
                <div className="flex justify-between items-center font-bold text-slate-800 border-b border-slate-100 pb-1">
                  <span className="text-indigo-700">{maskName(acc.role)}</span>
                  <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[11px]">{acc.role}</span>
                </div>
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-500">Phạm vi:</span> {acc.school}
                </div>
                <div className="text-slate-600 font-mono flex flex-wrap items-center justify-between gap-2 border-t border-slate-50 pt-1.5 mt-1">
                  <div>
                    <span className="text-slate-400 font-sans text-[12px] font-bold">Email:</span> <span className="text-slate-800 select-all font-bold transition-all break-all">{acc.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput(acc.email);
                    }}
                    className="text-[11px] bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 px-2 py-1 rounded-lg border border-indigo-200/50 transition-all font-sans cursor-pointer font-bold shrink-0 ml-auto"
                    title="Nhấp để tự động điền email này vào ô đăng nhập phía trên"
                  >
                    ⚡ Điền nhanh Email
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING ADMIN DASHBOARD CHÍNH (KHI ĐÃ ĐĂNG NHẬP) ---
  return (
    <div className="space-y-6" id="counselor_dashboard_root">
      {/* Top Banner Alert to define role context */}
      <div className="rounded-2xl bg-slate-900 text-white p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-lg" id="role_context_alert">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[13px] font-bold text-emerald-300">
              ● PHÒNG TƯ VẤN TÂM LÝ VẬN HÀNH THỰC TẾ
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[13px] font-bold text-indigo-300">
              <Briefcase size={10} /> {currentCounselor.school === "Tất cả" ? "Quản trị viên toàn hệ thống" : currentCounselor.school}
            </span>
          </div>
          <h2 className="font-bold text-[19px] flex items-center gap-2">
            Chào mừng: {currentCounselor.name}
          </h2>
          <p className="text-[15px] text-slate-400 max-w-xl">
            Nhà tâm lý đang làm việc dưới danh nghĩa của <b>{currentCounselor.school === "Tất cả" ? "Tất cả các Trường học SafeZone" : currentCounselor.school}</b>. Mọi phản hồi gửi đi sẽ được mã hóa an toàn và bảo mật danh tính tuyệt đối.
          </p>
          <div className="text-[13px] text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 max-w-lg mt-0.5 animate-pulse">
            <span>✨ <b>Đồng bộ đám mây đa thiết bị:</b> Truy cập trên điện thoại & máy tính bằng cùng 1 tài khoản này đều nhìn thấy 100% hồ sơ, tiến trình xử lý và tin nhắn trò chuyện đồng nhất, tức thì.</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={loadReports}
            className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2 hover:bg-slate-700 cursor-pointer text-slate-300 hover:text-white transition flex items-center gap-1 text-[15px] font-semibold"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Làm mới
          </button>
          
          <button 
            onClick={handleLogout}
            className="rounded-2xl bg-rose-600/90 text-white px-3 py-2 hover:bg-rose-600 cursor-pointer transition flex items-center gap-1 text-[15px] font-semibold uppercase"
            title="Đăng xuất khỏi hệ thống tư vấn tâm lý"
          >
            <LogOut size={12} /> Thoát 🔓
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Reports Lists Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md shadow-indigo-100/50 space-y-4">
            
            {/* Filter controls headers */}
            <div className="space-y-3">
              <span className="text-[13px] uppercase font-bold text-slate-400">Bộ lọc thông tin mật</span>
              
              <div className="space-y-2.5 text-[15px]">
                {/* Search bar */}
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Tìm mã hoặc tiêu đề..."
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 py-2.5 pr-3 pl-8 outline-hidden focus:border-indigo-500"
                  />
                  <Search size={14} className="absolute left-2.5 top-3 text-slate-400" />
                </div>

                {/* School Security Indicator - Khóa cứng theo trường phân quyền để đảm bảo cách ly dữ liệu */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700 uppercase">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={13} className="text-indigo-600" />
                      Phạm vi Trường phụ trách:
                    </span>
                    <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full text-[10px]">
                      Bảo mật 100%
                    </span>
                  </div>
                  <div className="font-bold text-slate-800 text-[13px] truncate">
                    {assignedSchool}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Hệ thống tự động cách ly: Thầy/Cô chỉ có quyền xem và phản hồi hồ sơ học sinh của {assignedSchool}.
                  </p>
                </div>

                {/* Status Selector */}
                <div>
                  <span className="block text-[13px] text-slate-400 font-bold mb-1">Cấp độ xử lý:</span>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 bg-white text-slate-600 outline-hidden font-semibold"
                  >
                    {["Tất cả", "Đang chờ tiếp nhận", "Đang xử lý", "Đang tham vấn", "Đã giải quyết"].map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* List item scrollable wrapper */}
            <div className="border-t border-slate-100 pt-3 space-y-2 max-h-[350px] overflow-y-auto">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  📁 Hồ sơ phân quyền ({filteredReports.length})
                </span>
                <button
                  type="button"
                  onClick={loadReports}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 transition cursor-pointer select-none active:scale-95 border border-indigo-200/50"
                  title="Đồng bộ cập nhật tức thời từ tất cả các thiế bị khác"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                  Đồng bộ ngay
                </button>
              </div>
              {loading ? (
                <div className="py-8 text-center text-[15px] text-slate-400">Đang tải hồ sơ...</div>
              ) : filteredReports.length === 0 ? (
                <div className="py-8 text-center text-[15px] text-slate-400 italic">Không tìm thấy đơn báo phản ánh nào.</div>
              ) : (
                filteredReports.map((r) => {
                  const isSelected = selectedReport?.code === r.code;
                  return (
                    <button
                      key={r.code}
                      onClick={() => {
                        setSelectedReport(r);
                        setReplyError("");
                        setShowCounselorDeleteConfirm(false);
                      }}
                      className={`w-full rounded-2xl border p-3.5 text-left text-[15px] transition cursor-pointer flex flex-col space-y-1.5 hover:bg-slate-50/60 backdrop-blur-sm relative ${
                        isSelected 
                          ? "border-indigo-600 bg-indigo-50/20" 
                          : "border-slate-100 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <code className="text-[15px] font-mono font-black text-slate-800">{r.code}</code>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                          r.status === "Đang chờ tiếp nhận" ? "bg-amber-100 text-amber-700" :
                          r.status === "Đang xử lý" ? "bg-blue-100 text-blue-700" :
                          r.status === "Đang tham vấn" ? "bg-purple-100 text-purple-700" :
                          "bg-emerald-100 text-emerald-700"
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      
                      <strong className="text-slate-800 text-[15px] font-semibold block truncate leading-tight">{r.title}</strong>
                      <span className="text-[13px] block text-indigo-700 font-bold truncate">{r.schoolName}</span>
                      <span className="text-[12px] block text-slate-400 font-mono">{formatReportDate(r.date)}</span>
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* Admin Power Console */}
          {(currentCounselor.role === "Admin" || currentCounselor.role === "Co-Admin") && (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-md shadow-indigo-100/50 space-y-4 text-[15px] font-sans" id="admin_control_box">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="block text-[13px] uppercase font-bold text-slate-400">Quản lý & Phân quyền Tư vấn tâm lý</span>
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[12px] font-black">{currentCounselor.role}</span>
              </div>
              
              <form onSubmit={handleAddNewCounselor} className="space-y-3 bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 p-3.5 rounded-2xl border border-slate-100">
                <strong className="block text-[13px] uppercase font-bold text-slate-700">Cấp quyền Giáo viên Tư vấn</strong>
                
                {addError && <p className="text-[13px] font-bold text-rose-600">{addError}</p>}
                {addSuccess && <p className="text-[13px] font-bold text-emerald-600">{addSuccess}</p>}

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Tên Thầy/Cô (ví dụ: Cô Mai Lan)"
                    value={newCName}
                    onChange={(e) => setNewCName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-[14px] bg-white outline-hidden focus:border-indigo-500"
                    required
                  />
                  
                  <input
                    type="email"
                    placeholder="Email của giảng viên"
                    value={newCEmail}
                    onChange={(e) => setNewCEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-[14px] bg-white outline-hidden focus:border-indigo-500 font-mono"
                    required
                  />

                  <input
                    type="password"
                    placeholder="Mật khẩu khởi tạo"
                    value={newCPassword}
                    onChange={(e) => setNewCPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 text-[14px] bg-white outline-hidden focus:border-indigo-500"
                    required
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[12px] font-semibold text-slate-500 mb-0.5">Trường Quản Lý:</label>
                      {currentCounselor.role === "Admin" ? (
                        <>
                          <input
                            list="admin-school-list"
                            value={newCSchool}
                            onChange={(e) => setNewCSchool(e.target.value)}
                            placeholder="Nhập tên trường mới hoặc chọn..."
                            className="w-full rounded-xl border border-slate-200 p-2 text-[14px] bg-white font-semibold outline-hidden focus:border-indigo-500"
                            required
                          />
                          <datalist id="admin-school-list">
                            <option value="Tất cả" />
                            {counselorsList.map(c => c.school).filter((sch, idx, self) => sch && sch !== "Tất cả" && self.indexOf(sch) === idx).map(schoolName => (
                              <option key={schoolName} value={schoolName} />
                            ))}
                          </datalist>
                        </>
                      ) : (
                        <select
                          value={newCSchool}
                          onChange={(e) => setNewCSchool(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 p-2 text-[14px] bg-white text-slate-500 font-semibold outline-hidden cursor-not-allowed"
                          required
                        >
                          <option value={currentCounselor.school}>{currentCounselor.school}</option>
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-[12px] font-semibold text-slate-500 mb-0.5">Quyền hạn:</label>
                      <select
                        value={newCRole}
                        onChange={(e) => setNewCRole(e.target.value as "Counselor" | "Co-Admin")}
                        className="w-full rounded-xl border border-slate-200 p-2 text-[14px] bg-white font-semibold outline-hidden"
                        required
                      >
                        <option value="Counselor">Cố vấn tư vấn tâm lý</option>
                        <option value="Co-Admin">Quản trị đồng hành</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full text-center bg-gradient-to-r from-indigo-700 to-violet-700 hover:from-indigo-800 hover:to-violet-800 text-white font-black tracking-wide rounded-2xl p-4 text-[15px] cursor-pointer transition uppercase shadow-lg shadow-indigo-300/50 hover:shadow-indigo-400/60 scale-100 hover:scale-[1.01] active:scale-[0.99] animate-pulse"
                >
                  Cấp quyền truy cập mới ✔
                </button>
              </form>

              {/* Dynamic Counselor Account Directory with Revocation */}
              <div className="space-y-2">
                <span className="block text-[13px] uppercase font-bold text-slate-400">Danh Sách Cán Bộ Phụ Trách & Thu Hồi Quyền</span>
                <p className="text-[13px] text-slate-500 pb-1 leading-normal">
                  Chỉ cho phép xóa tài khoản không cùng bậc Quản trị viên tối cao hoặc tài khoản cán bộ của trường mình.
                </p>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {counselorsList
                    .filter(c => currentCounselor.role === "Admin" || c.school === currentCounselor.school)
                    .filter(c => currentCounselor.role === "Admin" || c.role !== "Admin")
                    .map((acc, idx) => {
                      const isMe = acc.email.toLowerCase() === currentCounselor.email.toLowerCase();
                      
                      const maskName = (account: any, me: boolean) => {
                        if (me) return account.name;
                        if (account.role === "Admin") return "Quản trị viên tối cao (Ẩn danh)";
                        if (account.role === "Co-Admin") return "Quản trị đồng hành (Ẩn danh)";
                        return "Cố vấn học đường (Ẩn danh)";
                      };
                      
                      const maskEmail = (account: any, me: boolean) => {
                        if (me) return account.email;
                        return "******@safezone.hidden";
                      };

                      return (
                        <div key={idx} className="flex items-center justify-between bg-slate-50/60 backdrop-blur-sm p-2.5 rounded-2xl border border-slate-100 text-[14px]">
                          <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-800 truncate">{maskName(acc, isMe)}</span>
                              <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-black ${
                                acc.role === "Admin" ? "bg-red-50 text-red-600 border border-red-100" :
                                acc.role === "Co-Admin" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                                "bg-teal-50 text-teal-700 border border-teal-100"
                              }`}>
                                {acc.role === "Admin" ? "Master Admin" : acc.role === "Co-Admin" ? "Co-Admin" : "Counselor"}
                              </span>
                              {isMe && <span className="text-[11px] text-indigo-600 bg-indigo-100 px-1 rounded font-bold">Tôi</span>}
                            </div>
                            <div className="text-[13px] text-slate-500 font-mono truncate">{maskEmail(acc, isMe)}</div>
                            <span className="text-[13px] block text-slate-400 font-semibold truncate">Trường: {acc.school}</span>
                          </div>
                          {!isMe && (currentCounselor.role === "Admin" || acc.role !== "Admin") && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCounselor(acc.email)}
                              className="text-rose-600 hover:text-rose-800 p-2 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                              title="Thu hồi quyền hạn tư vấn tâm lý"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
 
              {/* Chỉ tài khoản Master Distributor (c3ndqminh.pdl@hue.edu.vn) mới hiển thị tính năng Bàn giao trường học */}
              {currentCounselor.email.toLowerCase() === MASTER_DISTRIBUTOR_EMAIL.toLowerCase() ? (
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="block text-[13px] uppercase font-bold text-indigo-700 flex items-center gap-1">
                      👑 Bàn Giao Quyền Làm Chủ Trường
                    </span>
                    <span className="text-[11px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                      Master Quyền Năng
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500 leading-normal">
                    Đặc quyền của tài khoản Master: Phân phối và bàn giao ứng dụng cho các trường học khác. Mỗi trường nhận bàn giao sẽ trở thành đơn vị tự chủ độc lập và không thể chuyển giao tiếp cho bên thứ ba.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowHandoverModal(true);
                      setHandoverError("");
                      setHandoverSuccess("");
                    }}
                    className="w-full text-center text-indigo-700 font-black border border-indigo-200 bg-gradient-to-r from-indigo-50 to-sky-50 hover:from-indigo-100 hover:to-sky-100 rounded-xl py-2.5 text-[13px] cursor-pointer transition uppercase shadow-xs flex items-center justify-center gap-1.5"
                  >
                    🤝 Phân phối & Bàn giao trường học mới ➜
                  </button>
                </div>
              ) : (
                <div className="border-t border-slate-100 pt-3 space-y-1 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[12px] uppercase font-bold text-slate-700 flex items-center gap-1">
                    🛡️ Tự Chủ Độc Lập Trường Học
                  </span>
                  <p className="text-[12px] text-slate-500 leading-relaxed">
                    Trường <b>{currentCounselor.school}</b> đã được kích hoạt làm chủ độc lập. Mọi hồ sơ học sinh và thông tin tư vấn đều được cách ly bảo mật tuyệt đối 100% trong nội bộ trường.
                  </p>
                </div>
              )}

              {/* Configure school consultation details */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="block text-[13px] uppercase font-bold text-teal-700">Thông Tin Phòng Tư Vấn & Hotline</span>
                </div>
                <p className="text-[13px] text-slate-500 leading-normal">
                  Chỉnh sửa tên phòng tham vấn, đường dây nóng và khung giờ tiếp nhận hiển thị cho học sinh trường bạn.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    loadSchoolSettings();
                    setShowSchoolSettingsModal(true);
                    setSettingsError("");
                    setSettingsSuccess("");
                  }}
                  className="w-full text-center text-teal-700 font-bold border border-teal-200 bg-teal-50 hover:bg-teal-100 rounded-xl py-2 text-[13px] cursor-pointer transition uppercase"
                >
                  🏢 Cấu hình Phòng tư vấn & Hotline trường
                </button>
              </div>

              {currentCounselor.role === "Admin" && (
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <span className="block text-[13px] uppercase font-bold text-slate-400">Quản lý Trường học Hệ thống</span>
                  <p className="text-[13px] text-slate-500 leading-normal">
                    Quản trị viên tối cao có thể xóa các trường học đã đăng ký trong hệ thống (sẽ không còn hiển thị ở màn hình gửi hồ sơ ẩn danh).
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {activeSystemSchools.map((school, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50/60 backdrop-blur-sm p-2.5 rounded-2xl border border-slate-100 text-[14px]">
                        <span className="font-semibold text-slate-700 text-[13px] flex-1 truncate pr-2">{school}</span>
                        {activeSystemSchools.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSchool(school)}
                            className="text-rose-600 hover:text-rose-800 p-2 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                            title="Xóa trường khỏi hệ thống"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                    {activeSystemSchools.length === 0 && (
                      <div className="text-[13px] text-slate-400 italic py-2">Hệ thống đang tải dữ liệu trường học...</div>
                    )}
                  </div>
                </div>
              )}

               {currentCounselor.role === "Admin" && (
                 <div className="border-t border-slate-100 pt-3 space-y-2">
                   <span className="block text-[13px] uppercase font-bold text-rose-600">Phục hồi gốc hệ thống & Xoá dữ liệu</span>
                   <p className="text-[13px] text-slate-500 leading-normal">
                     Hành động này sẽ xóa trắng toàn bộ thư phản ánh, các phân lập tài khoản và đưa hệ thống quay lại màn hình onboarding thiết lập mới ban đầu.
                   </p>
                   <button
                     type="button"
                     onClick={handleWipeSystem}
                     className="w-full text-center text-rose-600 font-bold border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-xl py-2 text-[13px] cursor-pointer transition uppercase"
                   >
                     ⚠ Delete All & Reset SafeZone
                   </button>
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Detailed Sheet Column */}
        <div className="lg:col-span-2 space-y-4">
          {selectedReport ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md shadow-indigo-100/50 space-y-6 animate-fade-in" id="counselor_report_detail_panel">
              
              {/* Profile headers */}
              <div className="flex flex-col gap-3 justify-between border-b border-slate-150 pb-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <span className="text-[13px] font-extrabold text-indigo-600 uppercase tracking-widest font-mono">
                    HỒ SƠ MẬT CHỐNG BẠO LỰC SỐ
                  </span>
                  <h3 className="text-[21px] font-mono font-black text-slate-800">{selectedReport.code}</h3>
                  <p className="text-[15px] text-slate-500 font-mono">Đơn tiếp nhận ngày: {formatReportDate(selectedReport.date)}</p>
                </div>

                {/* Status action update dropdown or Delete */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 text-[15px]">
                  <div className="flex flex-col gap-1">
                    <span className="block text-[13px] text-slate-400 font-bold uppercase shrink-0">Cập nhật bước xử lý (Bấm để đổi):</span>
                    <select 
                      value={selectedReport.status}
                      onChange={(e) => handleUpdateStatus(selectedReport.code, e.target.value)}
                      className="rounded-xl border border-slate-200 p-2 text-[15px] font-bold bg-slate-50/60 backdrop-blur-sm text-slate-800 hover:bg-slate-100 cursor-pointer outline-hidden w-full sm:w-auto"
                    >
                      <option value="Đang chờ tiếp nhận">⏳ Đang chờ tiếp nhận</option>
                      <option value="Đang xử lý">🔧 Đang xử lý</option>
                      <option value="Đang tham vấn">💜 Đang tham vấn tâm lý</option>
                      <option value="Đã giải quyết">✔ Đã trung hòa dứt điểm</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    {!showCounselorDeleteConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowCounselorDeleteConfirm(true)}
                        className="rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 px-3.5 py-2 text-[14px] font-bold border border-pink-100 cursor-pointer transition-all flex items-center justify-center gap-1.5 h-[42px] sm:h-[40px] shrink-0"
                        id="counselor_delete_btn"
                        title="Xóa vĩnh viễn báo cáo này khỏi hệ thống"
                      >
                        <Trash2 size={16} className="shrink-0" />
                        <span>Xóa hồ sơ</span>
                      </button>
                    ) : (
                      <div className="bg-pink-50 border border-pink-200 rounded-xl p-2 flex flex-col sm:flex-row items-center gap-2 animate-fade-in max-w-sm shrink-0" id="counselor_delete_confirm_panel">
                        <span className="text-[12px] font-bold text-pink-700 leading-none">Chắc chắn xóa?</span>
                        <div className="flex gap-1.5 justify-end w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => handleCounselorDeleteReport(selectedReport.code)}
                            disabled={isDeletingReport}
                            className="bg-pink-600 hover:bg-pink-700 text-white px-2 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition disabled:bg-slate-400 shrink-0"
                            id="counselor_delete_confirm_btn"
                          >
                            {isDeletingReport ? "..." : "Xóa"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCounselorDeleteConfirm(false)}
                            disabled={isDeletingReport}
                            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition shrink-0"
                            id="counselor_delete_cancel_btn"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid content sheet details */}
              <div className="grid grid-cols-1 gap-4 text-[15px] md:grid-cols-3">
                <div className="space-y-1">
                  <span className="text-[13px] font-bold text-slate-400 mb-0.5 block flex items-center gap-1">
                    <School size={12} /> TRƯỜNG HỌC
                  </span>
                  <strong className="text-slate-800 block text-[15px]">{selectedReport.schoolName}</strong>
                </div>
                <div className="space-y-1">
                  <span className="text-[13px] font-bold text-slate-400 mb-0.5 block flex items-center gap-1">
                    <Tag size={12} /> PHÂN NHÓM BẠO LỰC
                  </span>
                  <strong className="text-slate-800 block text-[15px]">{selectedReport.category}</strong>
                </div>
                <div className="space-y-1">
                  <span className="text-[13px] font-bold text-slate-400 mb-0.5 block flex items-center gap-1">
                    <MapPin size={12} /> ĐỊA ĐIỂM SỰ VIỆC
                  </span>
                  <strong className="text-slate-800 block text-[15px]">{selectedReport.location || "Không nêu"}</strong>
                </div>
              </div>

              {/* Text Area Description */}
              <div className="space-y-2">
                <span className="block text-[13px] font-bold text-slate-400 uppercase">TIÊU ĐỀ SỰ VIỆC PHẢN ÁNH</span>
                <p className="text-[17px] font-semibold text-slate-800 italic bg-amber-50/40 p-3 rounded-xl border border-amber-100/50">
                  “ {selectedReport.title} ”
                </p>
              </div>

              <div className="space-y-2">
                <span className="block text-[13px] font-bold text-slate-400 uppercase">NỘI DUNG TƯỜNG TRÌNH CHI TIẾT</span>
                <p className="text-[15px] leading-relaxed text-slate-700 bg-slate-50/60 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-inner whitespace-pre-wrap">
                  {selectedReport.description}
                </p>
              </div>

              {/* Evidence details indicator */}
              {(selectedReport.evidenceText || (selectedReport.evidenceFiles && selectedReport.evidenceFiles.length > 0)) && (
                <div className="space-y-4">
                  <span className="block text-[13px] font-bold text-slate-400 uppercase">TÀI LIỆU CHỨNG CỨ SỐ KÈM THEO</span>
                  
                  {selectedReport.evidenceText && (
                    <p className="text-[15px] italic text-slate-600 bg-rose-50/40 p-3 rounded-xl border border-rose-100/40 break-words">
                      🔗 <a href={selectedReport.evidenceText.startsWith('http') ? selectedReport.evidenceText : `https://${selectedReport.evidenceText}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{selectedReport.evidenceText}</a>
                    </p>
                  )}

                  {selectedReport.evidenceFiles && selectedReport.evidenceFiles.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedReport.evidenceFiles.map((file, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                          {file.type.startsWith('image/') ? (
                            <div className="bg-slate-100 h-32 flex items-center justify-center p-2 relative group p-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={file.data} alt={file.name} className="max-h-full max-w-full rounded object-contain border border-slate-200" />
                            </div>
                          ) : file.type.startsWith('audio/') ? (
                            <div className="bg-slate-100 p-3 flex flex-col justify-center items-center h-32 gap-2">
                               <span className="text-2xl">🎵</span>
                               <audio controls className="w-full h-8 scale-90">
                                 <source src={file.data} type={file.type} />
                               </audio>
                            </div>
                          ) : (
                             <div className="bg-slate-100 p-3 flex flex-col justify-center items-center h-32 gap-2 text-slate-400">
                               <span className="text-3xl">📁</span>
                               <a href={file.data} download={file.name} className="text-[13px] text-indigo-600 hover:underline">Tải về máy tính</a>
                             </div>
                          )}
                          <div className="p-2 border-t border-slate-200 bg-white">
                            <p className="text-[12px] font-semibold text-slate-600 truncate" title={file.name}>{file.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Chat replies list */}
              <div className="space-y-4 pt-4 border-t border-slate-150">
                <h3 className="text-[15px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-indigo-600" /> Tiến Trình Đối Thoại Mật Đồng Hành ({selectedReport.responses.length})
                </h3>

                <div className="max-h-60 overflow-y-auto space-y-3 p-3 bg-slate-50/60 backdrop-blur-sm rounded-2xl border border-slate-100">
                  {selectedReport.responses.map((res, i) => {
                    const isCounselor = res.sender === "Counselor";
                    return (
                      <div key={i} className={`flex ${isCounselor ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-md p-3 rounded-2xl text-[15px] ${
                          isCounselor 
                            ? "bg-indigo-600 text-white rounded-tr-none" 
                            : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200/50 text-white border-0 text-white rounded-tl-none shadow-sm shadow-indigo-100/30"
                        }`}>
                          <div className="flex items-center gap-2 border-b border-white/15 pb-0.5 text-[11px] font-bold uppercase mb-1">
                            <span>{isCounselor ? `Thầy Cô: ${currentCounselor.name}` : "Học Sinh (Ẩn danh)"}</span>
                            <span className="ml-auto font-mono opacity-85">
                              {new Date(res.date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="whitespace-pre-line leading-relaxed">{res.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sender Reply Box */}
                <form onSubmit={handleSendCounselorReply} className="space-y-3">
                  <span className="block text-[13px] font-bold text-slate-600 uppercase">SOẠN PHẢN HỒI GỬI HỌC SINH (HỆ THỐNG SẼ TỰ ĐỘNG CHUYỂN TRẠNG THÁI SANG "ĐANG XỬ LÝ")</span>
                  
                  <textarea 
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Hãy viết thư trả lời giàu tâm huyết tư vấn tâm lý, an ủi cảm xúc, cam kết bảo mật và gợi mở giải pháp an toàn (khuyên em ứng dụng PAUSE, đến phòng tâm lý một cách khéo léo...)" 
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-[15px] outline-hidden focus:border-indigo-500"
                    disabled={isReplying}
                    required
                  />

                  {replyError && (
                    <p className="text-[15px] font-semibold text-rose-500">{replyError}</p>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isReplying || !replyMessage.trim()}
                      className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200/50 text-white border-0 px-5 py-2.5 text-[15px] font-bold text-white hover:bg-slate-800 disabled:bg-slate-400 flex items-center gap-2 cursor-pointer transition text-center uppercase"
                    >
                      <Send size={12} /> Gửi thư hỗ trợ tư vấn tâm lý mật
                    </button>
                  </div>
                </form>
              </div>

            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-400 space-y-3">
              <FileSpreadsheet size={48} className="mx-auto text-slate-300 animate-bounce" />
              <p className="text-[15px] font-medium max-w-sm mx-auto">
                Vui lòng chọn một mã hồ sơ đơn nộp ẩn danh bên tay trái để mở xem chi tiết và tham gia tư vấn giải tỏa áp lực học đường cho học sinh.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: BÀN GIAO QUYỀN LÀM CHỦ TRƯỜNG HỌC & CÁCH LY DỮ LIỆU */}
      {showHandoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8 border border-slate-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤝</span>
                <div>
                  <h3 className="text-[18px] font-extrabold text-slate-800 uppercase">
                    CHUYỂN GIAO QUYỀN LÀM CHỦ TRƯỜNG HỌC
                  </h3>
                  <p className="text-[13px] text-slate-500">Mỗi trường tự động độc lập 100%, không trường nào xem được dữ liệu của trường khác.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHandoverModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {handoverError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-[14px] font-medium">
                ⚠️ {handoverError}
              </div>
            )}
            {handoverSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-[14px] font-medium">
                ✅ {handoverSuccess}
              </div>
            )}

            <form onSubmit={handleExecuteHandover} className="space-y-4 text-[14px]">
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2 text-[13px] text-amber-900">
                <strong className="block font-bold text-[14px] text-amber-950">📋 Cơ chế Bàn giao độc lập & Tự chủ dữ liệu:</strong>
                <p>
                  Khi chuyển giao ứng dụng cho trường mới, trường mới sẽ trở thành <b>Chủ sở hữu cao nhất</b> của ứng dụng và phòng tư vấn tâm lý.
                </p>
                <div className="flex items-start gap-2 pt-1 font-medium">
                  <input
                    type="checkbox"
                    id="wipeOld"
                    checked={handoverWipeOldData}
                    onChange={(e) => setHandoverWipeOldData(e.target.checked)}
                    className="mt-1 rounded cursor-pointer accent-indigo-600 h-4 w-4"
                  />
                  <label htmlFor="wipeOld" className="cursor-pointer text-slate-800">
                    <b>Cách ly hoàn toàn & Xóa trắng hồ sơ trường cũ:</b> Đảm bảo bí mật tuyệt đối của học sinh trường trước, trường mới bắt đầu với cơ sở dữ liệu trống hoàn toàn độc lập.
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-bold text-slate-700">Tên Trường Học Mới Tiếp Nhận: *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: THPT Chuyên Lê Hồng Phong"
                    value={handoverSchoolName}
                    onChange={(e) => setHandoverSchoolName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-hidden focus:border-indigo-600 font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Họ Tên Thầy/Cô Quản Trị Mới: *</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Thầy Hoàng Nam"
                    value={handoverAdminName}
                    onChange={(e) => setHandoverAdminName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-hidden focus:border-indigo-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Email Đăng Nhập Quản Trị Mới: *</label>
                  <input
                    type="email"
                    placeholder="lehongphong.admin@school.edu.vn"
                    value={handoverAdminEmail}
                    onChange={(e) => setHandoverAdminEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-hidden focus:border-indigo-600 font-mono text-[13px]"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-bold text-slate-700">Mật Khẩu Đăng Nhập Tiếp Quản Mới: *</label>
                  <input
                    type="text"
                    placeholder="Đặt mật khẩu bảo mật (ví dụ: LeHongPhong@2025)"
                    value={handoverAdminPassword}
                    onChange={(e) => setHandoverAdminPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-hidden focus:border-indigo-600 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Tên Phòng Tham Vấn Tâm Lý:</label>
                  <input
                    type="text"
                    placeholder="Phòng Tham Vấn Tâm Lý Học Đường"
                    value={handoverCounselingRoom}
                    onChange={(e) => setHandoverCounselingRoom(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">Hotline Tư Vấn Tâm Lý Trường:</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 028.3835.XXXX"
                    value={handoverHotline}
                    onChange={(e) => setHandoverHotline(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-bold text-slate-700">Khung Giờ Tiếp Nhận Tham Vấn:</label>
                  <input
                    type="text"
                    placeholder="Thứ 2 - Thứ 6 (8h00 - 17h00)"
                    value={handoverConsultationHours}
                    onChange={(e) => setHandoverConsultationHours(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-hidden focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-bold text-slate-700">Ghi Chú Bàn Giao (Tùy chọn):</label>
                  <textarea
                    placeholder="Ghi chú về quy trình tư vấn tâm lý, phân ban tiếp nhận của trường..."
                    value={handoverNote}
                    onChange={(e) => setHandoverNote(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-hidden focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowHandoverModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={handoverLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold cursor-pointer transition shadow-md shadow-indigo-200/50 disabled:opacity-50 flex items-center gap-2"
                >
                  {handoverLoading ? "Đang chuyển giao quyền..." : "🤝 Xác nhận Bàn giao Quyền làm chủ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CẤU HÌNH PHÒNG TƯ VẤN & HOTLINE TRƯỜNG */}
      {showSchoolSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 my-8 border border-slate-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏢</span>
                <div>
                  <h3 className="text-[18px] font-extrabold text-slate-800 uppercase">
                    CẤU HÌNH PHÒNG TƯ VẤN & HOTLINE
                  </h3>
                  <p className="text-[13px] text-slate-500">Áp dụng cho: <b>{curSchoolSettings.schoolName || currentCounselor.school}</b></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSchoolSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {settingsError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-[14px] font-medium">
                ⚠️ {settingsError}
              </div>
            )}
            {settingsSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-[14px] font-medium">
                ✅ {settingsSuccess}
              </div>
            )}

            <form onSubmit={handleSaveSchoolSettings} className="space-y-4 text-[14px]">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Tên Trường Học:</label>
                <input
                  type="text"
                  value={curSchoolSettings.schoolName || (currentCounselor.school === "Tất cả" ? "" : currentCounselor.school)}
                  onChange={(e) => setCurSchoolSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                  disabled={currentCounselor.school !== "Tất cả"}
                  placeholder="Tên trường học"
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-hidden focus:border-teal-600 disabled:bg-slate-100 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Tên Phòng Tham Vấn / Tư Vấn Tâm Lý:</label>
                <input
                  type="text"
                  value={curSchoolSettings.counselingRoom}
                  onChange={(e) => setCurSchoolSettings(prev => ({ ...prev, counselingRoom: e.target.value }))}
                  placeholder="Ví dụ: Phòng Tham Vấn Tâm Lý Tầng 2 Nhà A"
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-hidden focus:border-teal-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Đường Dây Nóng Tư Vấn Trực Tiếp Của Trường (Có thể nhập nhiều số, cách nhau bằng dấu phẩy):</label>
                <input
                  type="text"
                  value={curSchoolSettings.hotline}
                  onChange={(e) => setCurSchoolSettings(prev => ({ ...prev, hotline: e.target.value }))}
                  placeholder="Ví dụ: 024.3845.1234, 0912.345.678"
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-hidden focus:border-teal-600 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Khung Giờ Mở Cửa & Trực Tư Vấn:</label>
                <input
                  type="text"
                  value={curSchoolSettings.consultationHours}
                  onChange={(e) => setCurSchoolSettings(prev => ({ ...prev, consultationHours: e.target.value }))}
                  placeholder="Thứ 2 - Thứ 6 (8h00 - 11h30, 13h30 - 17h00)"
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-hidden focus:border-teal-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Đường Dây Khẩn Cấp BGH / Trực Ban (Có thể nhập nhiều số):</label>
                <input
                  type="text"
                  value={curSchoolSettings.principalHotline}
                  onChange={(e) => setCurSchoolSettings(prev => ({ ...prev, principalHotline: e.target.value }))}
                  placeholder="Ví dụ: 0912.111.222, 0988.333.444"
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-hidden focus:border-teal-600 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">Thông Điệp Nhắn Nhủ Học Sinh:</label>
                <textarea
                  value={curSchoolSettings.bannerNotice}
                  onChange={(e) => setCurSchoolSettings(prev => ({ ...prev, bannerNotice: e.target.value }))}
                  placeholder="Ví dụ: Phòng tư vấn luôn sẵn sàng lắng nghe và bảo mật 100% mọi tâm tư của các em..."
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-hidden focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSchoolSettingsModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer transition shadow-md shadow-teal-200/50 disabled:opacity-50"
                >
                  {settingsLoading ? "Đang lưu..." : "💾 Lưu Cấu Hình"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

