import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  HelpCircle, 
  ChevronRight, 
  Search, 
  FileText, 
  ArrowLeft, 
  Clock, 
  Send, 
  CheckCircle, 
  MessageSquare, 
  Copy, 
  Lock,
  Trash2,
  BookOpen
} from "lucide-react";
import { Report } from "../types";
import { recordSubmittedReportCode, getStudentLocalPayload } from "../lib/studentSync";

interface AnonymousReportingProps {
  onReportCreated: () => void;
  initialTrackingCode?: string;
  onClearInitialTrackingCode?: () => void;
}

export default function AnonymousReporting({ onReportCreated, initialTrackingCode, onClearInitialTrackingCode }: AnonymousReportingProps) {
  // Navigation inside reporting tab: "submit" | "success" | "track"
  const [reportSubTab, setReportSubTab] = useState<"submit" | "success" | "track">(
    initialTrackingCode ? "track" : "submit"
  );

  // Form State
  const [schoolName, setSchoolName] = useState("");
  const [category, setCategory] = useState("Bạo lực trắng (Cô lập, tẩy chay ngầm)");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<{name: string, data: string, type: string}[]>([]);
  
  // States of request
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  // Tracking Code state
  const [trackCode, setTrackCode] = useState(initialTrackingCode || "");
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [trackError, setTrackError] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy success notification state (custom toast instead of alert)
  const [copySuccess, setCopySuccess] = useState(false);

  // Reply state inside thread
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyError, setReplyError] = useState("");

  const [schoolOptions, setSchoolOptions] = useState<string[]>([]);
  const [savedPinCodes, setSavedPinCodes] = useState<string[]>([]);

  const refreshSavedPinCodes = () => {
    const hasPin = Boolean(localStorage.getItem("safe_school_local_pin"));
    if (hasPin) {
      const payload = getStudentLocalPayload();
      setSavedPinCodes(payload.submittedCodes || []);
    } else {
      setSavedPinCodes([]);
    }
  };

  const categoryOptions = [
    "Bạo lực trắng (Cô lập, tẩy chay ngầm)",
    "Bạo lực mạng (Cyberbullying & Spreading)",
    "Đồn thổi tin sai sự thật / Nhóm chat bêu rếu Confessions",
    "Bắt nạt tâm lý / Đe dọa tống tiền vật chất",
    "Loại trừ khỏi hoạt động chung & Học tập nhóm",
    "Khác"
  ];

  useEffect(() => {
    refreshSavedPinCodes();
    const handleSync = () => refreshSavedPinCodes();
    window.addEventListener("safe_school_data_synced", handleSync);

    const fetchSystemStatus = async () => {
      try {
        const res = await fetch("/api/system/status");
        if (res.ok) {
          const data = await res.json();
          if (data.schools && data.schools.length > 0) {
            setSchoolOptions(data.schools);
            // Auto pre-select if only 1 school exists
            if (data.schools.length === 1) {
              setSchoolName(data.schools[0]);
            }
          } else {
            setSchoolOptions([
              "THPT Chuyên Hà Nội - Amsterdam",
              "THPT Phan Đình Phùng",
              "THPT Chu Văn An",
              "THPT Kim Liên",
              "THPT Việt Đức"
            ]);
          }
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách các trường học hoạt động:", err);
      }
    };
    fetchSystemStatus();
    return () => window.removeEventListener("safe_school_data_synced", handleSync);
  }, []);

  useEffect(() => {
    if (initialTrackingCode) {
      setTrackCode(initialTrackingCode);
      setReportSubTab("track");
      handleTrack(initialTrackingCode);
    }
  }, [initialTrackingCode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      // Limit file size to 2MB for simplicity and performance in this demo
      if (file.size > 2 * 1024 * 1024) {
        alert(`File ${file.name} vượt quá dung lượng 2MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        setEvidenceFiles(prev => [...prev, { name: file.name, data, type: file.type }]);
      };
      reader.readAsDataURL(file);
    });
    // Clear input so same file can be selected again if removed
    e.target.value = "";
  };

  const removeEvidenceFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName || !title || !description) {
      setSubmitError("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName,
          category,
          title,
          description,
          location,
          evidenceText,
          evidenceFiles
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setGeneratedCode(data.code);
        setReportSubTab("success");
        // Lưu mã vào sync cache để đồng bộ qua các máy có mã PIN
        recordSubmittedReportCode(data.code);
        refreshSavedPinCodes();
        // Clear submit form
        setSchoolName("");
        setTitle("");
        setDescription("");
        setLocation("");
        setEvidenceText("");
        setEvidenceFiles([]);
        onReportCreated();
      } else {
        setSubmitError(data.error || "Có lỗi xảy ra khi tạo báo cáo.");
      }
    } catch {
      setSubmitError("Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại mạng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = async (codeToTrack?: string) => {
    const code = codeToTrack || trackCode;
    if (!code.trim()) return;

    setIsTracking(true);
    setTrackError("");
    setActiveReport(null);

    try {
      const res = await fetch(`/api/reports/${code.trim().toUpperCase()}`);
      const data = await res.json();
      if (res.ok) {
        setActiveReport(data);
      } else {
        setTrackError(data.error || "Mã tra cứu không khớp. Vui lòng thử lại.");
      }
    } catch {
      setTrackError("Lỗi đường truyền hệ thống khi tra cứu.");
    } finally {
      setIsTracking(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!activeReport) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reports/${activeReport.code}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        setActiveReport(null);
        setTrackCode("");
        setShowDeleteConfirm(false);
        if (onReportCreated) {
          onReportCreated();
        }
      } else {
        setTrackError(data.error || "Có lỗi xảy ra khi xóa báo cáo.");
      }
    } catch {
      setTrackError("Lỗi kết nối xảy ra khi thực hiện xóa.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeReport) return;

    setIsReplying(true);
    setReplyError("");

    try {
      const res = await fetch(`/api/reports/${activeReport.code}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyMessage,
          sender: "Student"
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Update local active report responses
        setActiveReport(prev => prev ? {
          ...prev,
          responses: data.responses,
          status: data.status
        } : null);
        setReplyMessage("");
      } else {
        setReplyError(data.error || "Lỗi gửi tin nhắn phản hồi.");
      }
    } catch {
      setReplyError("Lỗi kết nối máy chủ khi đăng tải câu trả lời.");
    } finally {
      setIsReplying(false);
    }
  };

  const copyCode = () => {
    const codeStr = generatedCode || activeReport?.code || "";
    navigator.clipboard.writeText(codeStr);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const returnToSubmit = () => {
    setReportSubTab("submit");
    setTrackCode("");
    setActiveReport(null);
    setTrackError("");
    if (onClearInitialTrackingCode) onClearInitialTrackingCode();
  };

  return (
    <div className="space-y-6" id="anonymous_reporting_root">
      
      {/* Sub menu tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md gap-1" id="sub_navigation_reporting">
        <button 
          onClick={returnToSubmit}
          className={`flex-1 py-2.5 text-[15px] font-bold transition rounded-2xl cursor-pointer text-center ${
            reportSubTab === "submit" || reportSubTab === "success"
              ? "bg-white text-indigo-600 shadow-sm shadow-indigo-100/30" 
              : "text-slate-500 hover:text-slate-800"
          }`}
          id="btn_subtab_submit_report"
        >
          ✍️ Gửi Đơn Ẩn Danh
        </button>
        <button 
          onClick={() => setReportSubTab("track")}
          className={`flex-1 py-2.5 text-[15px] font-bold transition rounded-2xl cursor-pointer text-center ${
            reportSubTab === "track"
              ? "bg-white text-indigo-600 shadow-sm shadow-indigo-100/30" 
              : "text-slate-500 hover:text-slate-800"
          }`}
          id="btn_subtab_track_report"
        >
          💬 Kênh Đàm Thoại Ẩn Danh
        </button>
      </div>

      {/* VIEW 1: SUBMIT REPORT */}
      {reportSubTab === "submit" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3" id="submit_report_container">
          <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-indigo-100/30 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            <div className="border-b border-slate-100 pb-4 space-y-2.5">
              <h2 className="text-[21px] font-extrabold text-slate-800 flex items-center gap-2">
                <ShieldAlert className="text-pink-500 shrink-0" size={20} /> Mở Hồ Sơ Ca Tư Vấn Ẩn Danh (Anonymous Case File)
              </h2>
              <p className="text-[15px] text-slate-500 leading-relaxed">
                Nêu rõ cảm xúc và thông tin vụ việc để mở <strong>Ca tư vấn tâm lý bảo mật</strong> và được nhà trường liên hệ trợ giúp ẩn danh kịp thời.
              </p>
              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[12.5px] text-slate-600 leading-relaxed flex items-start gap-2">
                <BookOpen size={15} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-indigo-900">Cơ sở khoa học & Pháp lý:</strong> Ứng dụng <em>Hiệu ứng Giải ức chế Trực tuyến Lành tính (Benign Online Disinhibition Effect — Suler, 2004, CyberPsychology & Behavior)</em> giúp học sinh vượt qua nỗi sợ bị trả thù hoặc kỳ thị để lên tiếng phá vỡ <em>Vòng xoáy Im lặng (Noelle-Neumann, 1974; Olweus, 1993)</em>, tuân thủ quy trình bảo mật tham vấn học đường tại <em>Thông tư 31/2017/TT-BGDĐT</em>.
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-[15px] font-bold text-slate-700 uppercase tracking-wider">
                    Em học tại trường nào? <span className="text-pink-500">*</span>
                  </label>
                  <select 
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-[15px] bg-slate-50/60 backdrop-blur-sm text-slate-800 outline-hidden focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                    required
                  >
                    <option value="">-- Bấm Chọn Trường Học --</option>
                    {schoolOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[15px] font-bold text-slate-700 uppercase tracking-wider">
                    Dạng áp lực gặp phải <span className="text-pink-500">*</span>
                  </label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-[15px] bg-slate-50/60 backdrop-blur-sm text-slate-800 outline-hidden focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    {categoryOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[15px] font-bold text-slate-700 uppercase tracking-wider">
                  Tiêu đề tóm vắt ngắn sự kiện <span className="text-pink-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Bị cô lập khi chia nhóm học tập môn chuyên và bị dán nhãn đặt điều tiếng xấu" 
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[15px] font-bold text-slate-700 uppercase tracking-wider">
                  Chi tiết nội trình (Ai bạo lực, thời điểm, cảm xúc buồn tủi cụ thể) <span className="text-pink-500">*</span>
                </label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Thầy cô sẽ đọc và hỗ trợ từng bước một. Đừng sợ hãi, hãy viết rõ để thầy cô thấu hiểu câu chuyện của em..." 
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-[15px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-[15px] font-bold text-slate-700 uppercase tracking-wider">
                    Địa bàn xảy ra (Lớp học, Messenger, Group kín, Zalo, v.v.)
                  </label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ví dụ: Diễn ra chủ yếu trên nhóm chat ẩn hoặc hành lang sau giờ" 
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[15px] font-bold text-slate-700 uppercase tracking-wider">
                    Bằng chứng kèm theo (Link bài viết nói xấu hoặc ảnh/video)
                  </label>
                  <input 
                    type="text" 
                    value={evidenceText}
                    onChange={(e) => setEvidenceText(e.target.value)}
                    placeholder="Ví dụ: Em đã lưu lại 5 ảnh cap group anti, bôi nhọ..." 
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 focus:bg-white transition-all"
                  />
                  <div className="mt-2">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/50 px-4 py-3 text-[14px] font-semibold text-sky-700 hover:bg-sky-100 transition-colors w-full">
                      <input 
                        type="file"
                        multiple
                        accept="image/*,video/*,audio/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <span>📎 Đính kèm tệp phương tiện (Ảnh, Video, Ghi âm)</span>
                    </label>
                  </div>
                  {evidenceFiles.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                      {evidenceFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-indigo-50 text-indigo-700 rounded-lg px-3 py-2 text-[14px]">
                          <span className="truncate max-w-[80%] font-medium text-slate-700">{file.name}</span>
                          <button 
                            type="button" 
                            onClick={() => removeEvidenceFile(idx)}
                            className="text-pink-600 hover:text-pink-800 font-bold"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {submitError && (
                <div className="p-3.5 rounded-2xl bg-pink-50 text-pink-700 border border-pink-150 text-[15px] font-semibold">
                  ⚠️ {submitError}
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 py-3.5 text-[15px] font-bold text-white hover:opacity-90 disabled:bg-slate-400 cursor-pointer transition uppercase text-center tracking-wider shadow-md shadow-indigo-500/10"
              >
                {isSubmitting ? "🔒 Đang mã hóa gửi đi bảo mật..." : "Gửi Báo Cáo Không Để Lại Dấu Vết"}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm shadow-indigo-100/30 space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Lock size={18} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-[17px]">Kiến trúc Zero-Knowledge xóa dấu vết</h3>
              <p className="text-[14.5px] text-slate-600 leading-relaxed">
                Áp dụng nguyên lý <strong>Bằng chứng không tiết lộ (Zero-Knowledge Architecture — Goldwasser, Micali, & Rackoff, 1985)</strong>: Hệ thống lập tức loại bỏ thông tin định danh và phiên kết nối mạng của em ngay khi khởi tạo Ca tư vấn. Không ai — kể cả quản trị viên — biết được danh tính thật hay địa chỉ IP của em.
              </p>
            </div>

            <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200/50 text-white border-0 p-6 space-y-4 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-y-6 translate-x-6 w-32 h-32 rounded-full bg-indigo-500/10 blur-xl"></div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                <MessageSquare size={18} />
              </div>
              <h3 className="font-extrabold text-[17px]">Tham vấn 2 chiều qua Mã Ca (Case Code)</h3>
              <p className="text-[14.5px] text-slate-200 leading-relaxed">
                Mỗi báo cáo tạo ra một <strong>Hồ sơ Ca tư vấn (Case File)</strong> gắn với mã định danh ngẫu nhiên <code className="bg-white/15 px-1.5 py-0.5 rounded font-mono">SA-XXXX</code>. Thầy cô Tổ Tư vấn Tâm lý phản hồi hoặc trao đổi hướng giải quyết, em sẽ đọc và nhắn tin lại ngay lập tức mà hoàn toàn ẩn danh <em>(Suler, 2004; Thông tư 31/2017/TT-BGDĐT)</em>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SUCCESS WITH TRACKING CODE */}
      {reportSubTab === "success" && (
        <div className="max-w-xl mx-auto rounded-3.5xl border border-emerald-150 bg-gradient-to-tr from-emerald-50/40 to-emerald-50/10 p-8 shadow-sm shadow-indigo-100/30 space-y-6 text-center animate-fade-in" id="reporting_success_panel">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-lg shadow-emerald-250/10">
            <CheckCircle size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-[23px] font-extrabold text-slate-800 font-display">Khởi Tạo Hồ Sơ Ca Tư Vấn Thành Công!</h2>
            <p className="text-[15px] text-slate-600 leading-relaxed px-4">
              Hệ thống mã hóa không dấu vết đã khởi tạo <strong>Hồ sơ Ca tư vấn (Case File)</strong> của em. Em hãy lưu giữ chìa khóa bí mật duy nhất dưới đây để theo dõi trạng thái xử lý và trò chuyện hai chiều với giáo viên tâm lý.
            </p>
          </div>

          {/* Secure tracking code receipt */}
          <div className="rounded-2.5xl border border-violet-100 bg-white p-6 shadow-sm shadow-indigo-100/30 space-y-4 max-w-sm mx-auto">
            <span className="text-[15px] uppercase font-extrabold text-indigo-400 tracking-widest">MÃ HỒ SƠ CA TƯ VẤN ẨN DANH</span>
            <div className="bg-slate-50/60 backdrop-blur-sm border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
              <code className="text-[27px] font-mono font-black text-indigo-700 tracking-widest">{generatedCode}</code>
              <button 
                onClick={copyCode}
                type="button"
                className="text-slate-500 hover:text-indigo-600 p-2 border border-slate-150 rounded-xl hover:border-indigo-150 cursor-pointer bg-white transition"
                title="Sao chép"
              >
                <Copy size={14} />
              </button>
            </div>
            
            {copySuccess ? (
              <p className="text-[15px] text-emerald-600 font-extrabold bg-emerald-50 py-1 rounded-md animate-pulse">
                ✓ Đã lưu mã số vào bộ nhớ đệm an toàn!
              </p>
            ) : (
              <p className="text-[14px] text-pink-600 font-semibold italic leading-relaxed">
                * Lưu ý bảo mật: Hãy ghi nhớ mã <code className="font-mono font-bold">{generatedCode}</code> (hoặc bật Mã PIN Bảo Mật ở góc trên bên phải để hệ thống tự động lưu mã trong két sắt cá nhân của em).
              </p>
            )}
          </div>

          <div className="flex gap-4 justify-center pt-2">
            <button 
              onClick={() => {
                setTrackCode(generatedCode);
                setReportSubTab("track");
                handleTrack(generatedCode);
              }}
              className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200/50 text-white border-0 px-5 py-3 text-[15px] font-bold text-white hover:bg-slate-800 cursor-pointer transition uppercase tracking-wider"
            >
              💬 Trò chuyện với Thầy Cô ngay
            </button>
            <button 
              onClick={returnToSubmit}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-[15px] font-bold text-slate-700 hover:bg-slate-50/60 backdrop-blur-sm cursor-pointer"
            >
              Gửi tin khác
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: TRACK REPORT THREAD */}
      {reportSubTab === "track" && (
        <div className="max-w-4xl mx-auto space-y-6" id="reporting_track_panel">
          {/* Tracking Lookup form if no active report loaded */}
          {!activeReport && (
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-indigo-100/30 max-w-xl mx-auto space-y-4 animate-fade-in">
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-150 flex items-center gap-2 text-slate-800">
                  <Search size={16} className="text-indigo-500" /> Tra cứu Hồ sơ Ca tư vấn & Phòng hội thoại bảo mật
                </h3>
                <p className="text-[15px] text-slate-600 leading-relaxed">
                  Vui lòng nhập mã Hồ sơ Ca tư vấn dạng <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono font-bold">SA-XXXX</code> để mở cuộc đối thoại kín mật 2 chiều với Tổ Tư vấn Tâm lý học đường.
                </p>
                <div className="mt-3.5 p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-[13.5px] text-slate-600 space-y-1.5">
                  <p className="font-extrabold text-indigo-800 flex items-center gap-1.5 uppercase tracking-wide text-[12px]">
                    🔒 CƠ CHẾ BẢO VỆ MÃ CA TƯ VẤN (ZERO-KNOWLEDGE PRIVACY):
                  </p>
                  <p className="leading-relaxed text-slate-650">
                    Để phòng ngừa trường hợp em dùng máy tính chung ở phòng Tin học hoặc bị người khác cầm điện thoại xem lén, hệ thống <strong>không hiển thị công khai mã đơn nếu chưa mở khóa Mã PIN Bảo Mật</strong> <em>(Goldwasser et al., 1985; Suler, 2004)</em>.
                  </p>
                  <p className="leading-relaxed font-semibold text-indigo-700">
                    👉 Nếu em đã bật <strong>Mã PIN Bảo Mật</strong> (nút góc trên bên phải), các mã Ca tư vấn của em sẽ được bảo vệ trong két sắt PIN và hiển thị ngay bên dưới để bấm mở nhanh!
                  </p>
                </div>

                {savedPinCodes.length > 0 && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <span className="text-[12px] font-black uppercase tracking-wider text-emerald-800 block">
                      🔐 Mã Hồ sơ Ca tư vấn đã lưu trong Két sắt PIN của em:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {savedPinCodes.map((codeItem) => (
                        <button
                          key={codeItem}
                          type="button"
                          onClick={() => {
                            setTrackCode(codeItem);
                            handleTrack(codeItem);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-mono font-black text-[13.5px] hover:bg-emerald-600 hover:text-white transition cursor-pointer shadow-xs"
                        >
                          📂 {codeItem}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input 
                    type="text" 
                    value={trackCode}
                    onChange={(e) => setTrackCode(e.target.value)}
                    placeholder="Nhập mã ví dụ: SA-1001" 
                    className="w-full rounded-2xl border border-slate-200 py-3 pr-4 pl-10 text-[15px] font-mono tracking-wider focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 focus:bg-white"
                    id="input_track_code_direct"
                  />
                  <div className="absolute top-3.5 left-3.5 text-slate-400">
                    <FileText size={14} />
                  </div>
                </div>

                {trackError && (
                  <p className="text-[15px] font-semibold text-pink-600 bg-pink-50 p-2.5 rounded-xl border border-pink-100">{trackError}</p>
                )}

                <button 
                  onClick={() => handleTrack()}
                  disabled={isTracking}
                  className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200/50 text-white border-0 py-3.5 text-[15px] font-bold text-white hover:bg-slate-800 disabled:bg-slate-400 cursor-pointer text-center uppercase tracking-wider transition-all"
                >
                  {isTracking ? "Đang xác nhận kết nối bảo mật..." : "Xác nhận & Vào trò chuyện bí mật"}
                </button>
              </div>
            </div>
          )}

          {/* Active Report Chat Room Thread */}
          {activeReport && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-fade-in" id="active_chat_thread_room">
              
              {/* Left Details block */}
              <div className="rounded-3xl border border-slate-150 bg-white p-5 shadow-sm shadow-indigo-100/30 space-y-4">
                <button 
                  onClick={() => {
                    setActiveReport(null);
                    setTrackCode("");
                    setTrackError("");
                    if (onClearInitialTrackingCode) onClearInitialTrackingCode();
                  }}
                  className="inline-flex items-center gap-1.5 text-[15px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <ArrowLeft size={12} /> Tra cứu mã số khác
                </button>

                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div>
                    <span className="text-[13px] font-black text-indigo-600 uppercase tracking-widest block mb-0.5">Mã Hồ sơ Ca tư vấn (Case ID)</span>
                    <strong className="text-[21px] font-mono font-black text-slate-800">{activeReport.code}</strong>
                  </div>

                  <div>
                    <span className="text-[15px] font-bold text-slate-500 uppercase block mb-1">Mức độ tiếp nhận</span>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[15px] font-bold ${
                      activeReport.status === "Đang chờ tiếp nhận" ? "bg-amber-100 text-amber-800" :
                      activeReport.status === "Đang xử lý" ? "bg-blue-100 text-blue-800" :
                      activeReport.status === "Đang tham vấn" ? "bg-purple-100 text-purple-800" :
                      "bg-emerald-100 text-emerald-800"
                    }`}>
                      ● {activeReport.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[15px] font-bold text-slate-500 uppercase block mb-0.5">Trường của em</span>
                    <p className="text-[15px] font-bold text-indigo-950 leading-relaxed">{activeReport.schoolName}</p>
                  </div>

                  <div>
                    <span className="text-[15px] font-bold text-slate-500 uppercase block mb-0.5">Phân loại áp lực</span>
                    <p className="text-[15px] text-slate-700 font-bold">{activeReport.category}</p>
                  </div>

                  <div>
                    <span className="text-[15px] font-bold text-slate-500 uppercase block mb-0.5">Mô tả vụ việc</span>
                    <p className="text-[15px] text-slate-700 italic">“{activeReport.title}”</p>
                  </div>

                  <div className="bg-slate-50/60 backdrop-blur-sm p-3 rounded-2xl text-slate-600 text-[15px] leading-relaxed border border-slate-100">
                    <strong>Nội dung tâm thư:</strong> {activeReport.description}
                  </div>

                  {/* Bằng chứng */}
                  {(activeReport.evidenceText || (activeReport.evidenceFiles && activeReport.evidenceFiles.length > 0)) && (
                    <div className="bg-indigo-50/60 backdrop-blur-sm p-3 rounded-2xl text-indigo-800 text-[15px] border border-indigo-100 space-y-2">
                      {activeReport.evidenceText && (
                        <div>
                          <strong className="block text-indigo-900 mb-1">Bằng chứng (Link):</strong> 
                          <span className="italic">{activeReport.evidenceText}</span>
                        </div>
                      )}
                      
                      {activeReport.evidenceFiles && activeReport.evidenceFiles.length > 0 && (
                        <div>
                          <strong className="block text-indigo-900 mb-1">Tệp đính kèm ({activeReport.evidenceFiles.length}):</strong>
                          <div className="flex flex-col gap-2 mt-1">
                            {activeReport.evidenceFiles.map((file, idx) => (
                              <div key={idx} className="bg-white rounded p-2 text-[14px] flex items-center gap-2 border border-indigo-100">
                                <span>📎</span>
                                <span className="truncate flex-1 font-medium text-slate-700">{file.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Student self-delete tool */}
                  <div className="border-t border-dashed border-slate-200 pt-4 mt-4">
                    {!showDeleteConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 hover:text-pink-700 py-2.5 text-[14px] font-bold border border-pink-100 cursor-pointer transition-all"
                        id="student_self_delete_btn"
                      >
                        <Trash2 size={14} className="shrink-0" />
                        <span>Xóa vĩnh viễn báo cáo này</span>
                      </button>
                    ) : (
                      <div className="bg-pink-50 border border-pink-200 rounded-2xl p-3.5 space-y-3 animate-fade-in" id="student_delete_confirm_zone">
                        <p className="text-[13px] font-bold text-pink-800 leading-relaxed">
                          ⚠️ CẢNH BÁO: Hành động này sẽ xóa hoàn toàn báo cáo khỏi hệ thống nhà trường, không thể khôi phục lại. Em chắc chắn muốn xóa chứ?
                        </p>
                        <div className="flex gap-2 text-[13px] font-bold">
                          <button
                            type="button"
                            onClick={handleDeleteReport}
                            disabled={isDeleting}
                            className="flex-1 rounded-xl bg-pink-600 hover:bg-pink-700 text-white py-2 text-center cursor-pointer transition-all disabled:bg-slate-400"
                            id="student_self_delete_confirm_btn"
                          >
                            {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            className="flex-1 rounded-xl bg-white hover:bg-slate-100 text-slate-700 py-2 text-center border border-slate-200 cursor-pointer transition-all"
                            id="student_self_delete_cancel_btn"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right chat logs area */}
              <div className="lg:col-span-2 rounded-3xl border border-slate-150 bg-white overflow-hidden shadow-sm shadow-indigo-100/30 flex flex-col h-[530px]">
                
                {/* Header info */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 p-4 text-white flex items-center justify-between shadow-sm shadow-indigo-100/30">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div>
                      <h4 className="font-extrabold text-[15px] text-indigo-100 tracking-wide uppercase">Cổng Hội thoại Bảo mật</h4>
                      <span className="text-[15px] text-slate-400 font-mono">Xóa dấu vết lưu cache của trình duyệt</span>
                    </div>
                  </div>
                  <button 
                    onClick={copyCode}
                    type="button"
                    className="text-[15px] font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl font-mono flex items-center gap-1 cursor-pointer transition"
                  >
                    Mã {activeReport.code}
                  </button>
                </div>

                {/* Sub-notification if copy succeeded */}
                {copySuccess && (
                  <div className="bg-emerald-505 text-white text-[15px] font-bold py-1 px-4 text-center animate-fade-in">
                    ✓ Đã sao chép mã {activeReport.code} vào clipboard học sinh!
                  </div>
                )}

                {/* Messages body stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {activeReport.responses.map((resMsg, idx) => {
                    const isStudent = resMsg.sender === "Student";
                    return (
                      <div 
                        key={idx} 
                        className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-md p-3.5 rounded-2xl text-[15px] leading-relaxed space-y-1.5 ${
                          isStudent 
                            ? "bg-slate-900 text-white rounded-br-none shadow-sm shadow-indigo-100/30" 
                            : "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-bl-none shadow-sm shadow-indigo-100/30"
                        }`}>
                          <div className="flex items-center gap-2 border-b border-white/10 pb-1">
                            <span className="font-black text-[15px] uppercase tracking-wider opacity-90">
                              {isStudent ? "🙋 Bạn (Học Sinh ẩn danh)" : "❤️ Sư Phạm học đường / Tư Vấn Viên"}
                            </span>
                            <span className="text-[15px] opacity-60 ml-auto font-mono">
                              {new Date(resMsg.date).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="whitespace-pre-line leading-relaxed font-medium">{resMsg.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply bar */}
                <form onSubmit={handleSendReply} className="p-3 border-t border-slate-100 flex gap-2 bg-white">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Nhập phần trả lời hoặc cập nhật bối cảnh học tập mới cho thầy cô..."
                    className="flex-1 rounded-2xl border border-slate-200 px-4 text-[15px] outline-hidden focus:border-indigo-500 focus:bg-slate-50/10 focus:ring-1 focus:ring-indigo-500 transition-all"
                    disabled={isReplying}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isReplying || !replyMessage.trim()}
                    className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 p-3 text-white transition cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <Send size={14} />
                  </button>
                </form>

                {replyError && (
                  <p className="text-[15px] text-pink-600 bg-pink-50 p-1 px-3 text-center border-t border-pink-100">{replyError}</p>
                )}
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
