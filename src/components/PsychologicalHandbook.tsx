import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  PenTool, 
  Users, 
  CheckCircle,
  AlertTriangle,
  Smile,
  Meh,
  Frown,
  Heart,
  Plus,
  Trash2,
  Bookmark,
  CloudCheck,
  Sparkles
} from "lucide-react";
import { HealingJournal, MoodEntry } from "../types";
import { 
  PLUTCHIK_SECTORS, 
  ALL_EMOTIONS, 
  GENEVA_EMOTIONS,
  MOOD_DISPLAY_MAP, 
  getFullMoodDetails 
} from "../lib/emotions";
import { pushStudentSyncToCloud, recordSurveyResult } from "../lib/studentSync";
import RecoveryModule from "./RecoveryModule";

interface PsychologicalHandbookProps {
  initialSection?: number;
}

export default function PsychologicalHandbook({ initialSection = 0 }: PsychologicalHandbookProps) {
  const [activeSection, setActiveSection] = useState<number>(initialSection);

  useEffect(() => {
    if (initialSection !== undefined) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);
  
  // --- Section 1: Silent Exclusion Quiz State ---
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizError, setQuizError] = useState("");
  
  const quizQuestions = [
    {
      id: 1,
      text: "Nhóm bạn đăng ảnh đi chơi mà em không được mời nhưng cố tình gắn thẻ (tag) tất cả mọi người để em nhìn thấy."
    },
    {
      id: 2,
      text: "Em bị bỏ sót hoặc lờ đi trong nhóm chat chung của lớp/bạn bè dù tất cả các bạn khác đều có mặt tham gia hoạt động."
    },
    {
      id: 3,
      text: "Mọi người tương tác sôi nổi (like, bình luận, chia sẻ) với bài đăng của người khác nhưng cố tình phớt lờ bài của em."
    },
    {
      id: 4,
      text: "Tin nhắn của em bị hiển thị đã xem (\"seen\") hoặc bị ngó lơ nhưng không ai trả lời, trong khi nhóm bạn vẫn đang nhắn tin rôm rả."
    },
    {
      id: 5,
      text: "Em bị xóa khỏi nhóm chat chung lớp hoặc cố tình không được thêm vào khi nhóm bạn lập phòng trò chuyện mới."
    }
  ];

  const handleQuizAnswer = (qId: number, score: number) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: score }));
    setQuizError("");
  };

  const calculateQuiz = () => {
    if (Object.keys(quizAnswers).length < quizQuestions.length) {
      setQuizError("Bấm chọn mức độ ở toàn bộ 5 câu hỏi để nhận phân tích bạo lực trắng chính xác nhất cho em nhé!");
      return;
    }
    setQuizError("");
    const total = (Object.values(quizAnswers) as number[]).reduce((sum, current) => sum + current, 0);
    setQuizScore(total);

    const levelStr = total <= 10 ? "Thấp (An toàn)" : total <= 18 ? "Trung bình (Bắt đầu cô lập)" : "Nghiêm trọng (Báo động bạo lực trắng)";
    const summaryStr = `Điểm COES: ${total}/25 - ${levelStr}`;

    // Tự động ghi nhớ vào lịch sử bài khảo sát cá nhân & đồng bộ theo PIN
    recordSurveyResult({
      type: "white_violence",
      title: "Khảo Sát Trải Nghiệm Lạnh Nhạt Số (COES)",
      score: total,
      maxScore: 25,
      level: levelStr,
      summary: summaryStr,
      details: quizAnswers
    });
  };

  const resetQuiz = () => {
    setQuizAnswers({});
    setQuizScore(null);
    setQuizError("");
  };

  // --- Section 2: Mood & FOMO Tracker State ---
  const [fomoScore, setFomoScore] = useState<number | null>(null);
  const [fomoAnswers, setFomoAnswers] = useState<Record<number, number>>({});
  const [fomoError, setFomoError] = useState("");

  const fomoQuestions = [
    { id: 1, text: "Tôi sợ rằng người khác đang có những trải nghiệm bổ ích/thú vị hơn tôi." },
    { id: 2, text: "Tôi sợ rằng bạn bè tôi đang có những trải nghiệm tuyệt vời hơn tôi ở những nơi tôi vắng mặt." },
    { id: 3, text: "Tôi lo lắng khi biết bạn bè đang tụ tập vui vẻ mà không có sự tham gia của tôi." },
    { id: 4, text: "Tôi cảm thấy lo sợ khi bỏ lỡ các cuộc hẹn hay kế hoạch chung của nhóm bạn." },
    { id: 5, text: "Tôi thấy bồn chồn, bất an khi không biết bạn bè của mình đang làm gì hoặc đang ở đâu." },
    { id: 6, text: "Điều quan trọng với tôi là phải hiểu và cập nhật mọi câu chuyện/trò chuyện đang diễn ra trong nhóm bạn trực tuyến." },
    { id: 7, text: "Khi có một dịp vui vẻ, điều cực kỳ quan trọng đối với tôi là phải chia sẻ ngay những hình ảnh đó lên mạng xã hội." },
    { id: 8, text: "Tôi cảm thấy bực bội hoặc cực kỳ bứt rứt khi lỡ mất một cuộc hẹn hoặc kế hoạch đi chơi của bạn bè." },
    { id: 9, text: "Khi tôi không gặp mặt trực tiếp bạn bè một thời gian, tôi lo lắng rằng họ đang gắn bó khăng khít hơn mà không cần có tôi." },
    { id: 10, text: "Tôi cảm thấy thôi thúc cần phải liên tục lướt, kiểm tra mạng xã hội để xem bạn bè mình đang làm gì." }
  ];

  const handleFomoAnswer = (id: number, score: number) => {
    setFomoAnswers(prev => ({ ...prev, [id]: score }));
    setFomoError("");
  };

  const calculateFomo = () => {
    if (Object.keys(fomoAnswers).length < fomoQuestions.length) {
      setFomoError("Em hãy tích đủ đầy đủ 10 câu trắc nghiệm FOMO chuẩn để tính toán điểm số chính xác nhé.");
      return;
    }
    setFomoError("");
    const total = (Object.values(fomoAnswers) as number[]).reduce((sum, curr) => sum + curr, 0);
    setFomoScore(total);

    const levelStr = total <= 22 ? "Thấp (Cân bằng)" : total <= 36 ? "Trung bình (Áp lực kết nối)" : "Báo động (Lệ thuộc thế giới ảo)";
    const summaryStr = `Điểm FOMO: ${total}/50 - ${levelStr}`;

    // Tự động ghi nhớ vào lịch sử bài khảo sát cá nhân & đồng bộ theo PIN
    recordSurveyResult({
      type: "fomo",
      title: "Trắc Nghiệm Hội Chứng Sợ Bỏ Lỡ (State-FoMO)",
      score: total,
      maxScore: 50,
      level: levelStr,
      summary: summaryStr,
      details: fomoAnswers
    });
  };

  // Mood & Survey history state (Local Storage)
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [surveyHistory, setSurveyHistory] = useState<any[]>([]);
  const [newMood, setNewMood] = useState<string>("binh_thuong");
  const [newMoodNote, setNewMoodNote] = useState("");
  const [hActiveSector, setHActiveSector] = useState<string | null>(null);

  const loadLocalMoods = () => {
    const cached = localStorage.getItem("wellness_mood_history");
    if (cached) {
      try { setMoodHistory(JSON.parse(cached)); } catch { }
    }
  };

  const loadSurveyHistory = () => {
    const cached = localStorage.getItem("safe_school_survey_history");
    if (cached) {
      try { setSurveyHistory(JSON.parse(cached)); } catch { }
    }
  };

  useEffect(() => {
    loadLocalMoods();
    loadSurveyHistory();
    const handleSyncEvent = (e: any) => {
      if (e.detail?.moodHistory) {
        setMoodHistory(e.detail.moodHistory);
      }
      if (e.detail?.surveyHistory) {
        setSurveyHistory(e.detail.surveyHistory);
      }
      if (!e.detail?.moodHistory && !e.detail?.surveyHistory) {
        loadLocalMoods();
        loadSurveyHistory();
      }
    };
    window.addEventListener("safe_school_data_synced", handleSyncEvent);
    return () => window.removeEventListener("safe_school_data_synced", handleSyncEvent);
  }, []);

  const deleteSurveyRecord = (id: string) => {
    const updated = surveyHistory.filter(s => s.id !== id);
    setSurveyHistory(updated);
    localStorage.setItem("safe_school_survey_history", JSON.stringify(updated));
    pushStudentSyncToCloud().catch(() => {});
  };

  const renderHistoryTable = () => (
    <div className="mt-8 pt-6 border-t border-slate-100 space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-md shadow-indigo-100/50" id="personal_history_table">
      <h3 className="text-[19px] font-bold text-slate-800 flex items-center gap-2">
        <Activity className="text-indigo-600" size={22} /> Bảng Lịch Sử Ghi Nhận Cảm Xúc & Kết Quả Thang Đo Cá Nhân
      </h3>
      <p className="text-[15px] text-slate-500">
        Toàn bộ lịch sử các lần làm trắc nghiệm COES, State-FoMO và nhật ký cảm xúc cá nhân của em lưu trữ bảo mật trên thiết bị.
      </p>

      {surveyHistory.length === 0 && moodHistory.length === 0 ? (
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center text-slate-400 italic text-[15px]">
          Chưa có lịch sử khảo sát hoặc ghi nhận cảm xúc nào. Hãy thực hiện các bài trắc nghiệm bên trên để ghi lại tiến trình của em nhé.
        </div>
      ) : (
        <div className="space-y-6">
          {surveyHistory.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[15px] font-bold text-indigo-900 uppercase tracking-wider">📋 Lịch sử Khảo sát Thang đo (COES & State-FoMO)</h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[13px] font-bold text-slate-500 uppercase">
                      <th className="p-3">Thời gian</th>
                      <th className="p-3">Bài Khảo Sát</th>
                      <th className="p-3">Điểm Số</th>
                      <th className="p-3">Mức Độ Đánh Giá</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[14px]">
                    {surveyHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-3 font-mono text-slate-500 text-[13px]">{item.date}</td>
                        <td className="p-3 font-semibold text-slate-800">{item.title}</td>
                        <td className="p-3 font-bold text-indigo-600">{item.score} / {item.maxScore || 25}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2.5 py-1 rounded-xl text-[12px] font-bold ${
                            item.level?.includes("Thấp") || item.level?.includes("An toàn") || item.level?.includes("Cân bằng")
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.level?.includes("Trung bình")
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {item.level}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => deleteSurveyRecord(item.id)}
                            className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                            title="Xóa kết quả này"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {moodHistory.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-[15px] font-bold text-indigo-900 uppercase tracking-wider">😊 Lịch sử Ghi Nhận Cảm Xúc Cá Nhân</h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[13px] font-bold text-slate-500 uppercase">
                      <th className="p-3">Thời gian</th>
                      <th className="p-3">Trạng Thái Cảm Xúc</th>
                      <th className="p-3">Ghi Chú Chi Tiết</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[14px]">
                    {moodHistory.map((m) => {
                      const details = getFullMoodDetails(m.mood);
                      const emoji = details?.sectorEmoji || "😊";
                      const label = details?.label || m.mood;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-3 font-mono text-slate-500 text-[13px]">{m.date}</td>
                          <td className="p-3 font-semibold text-slate-800 flex items-center gap-2">
                            <span className="text-[18px]">{emoji}</span>
                            <span>{label}</span>
                          </td>
                          <td className="p-3 text-slate-600 italic">{m.note || "(Không có ghi chú)"}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => deleteMood(m.id)}
                              className="text-slate-400 hover:text-rose-600 transition p-1 cursor-pointer"
                              title="Xóa ghi nhận này"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const saveMood = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " ngày " + now.toLocaleDateString("vi-VN");
    
    const entry: MoodEntry = {
      id: Date.now().toString(),
      date: timeStr,
      mood: newMood,
      note: newMoodNote.trim()
    };
    const updated = [entry, ...moodHistory];
    setMoodHistory(updated);
    localStorage.setItem("wellness_mood_history", JSON.stringify(updated));
    setNewMoodNote("");

    // Đồng bộ lên đám mây gắn với mã PIN
    pushStudentSyncToCloud().catch(() => {});
  };

  const deleteMood = (id: string) => {
    const updated = moodHistory.filter(m => m.id !== id);
    setMoodHistory(updated);
    localStorage.setItem("wellness_mood_history", JSON.stringify(updated));
    pushStudentSyncToCloud().catch(() => {});
  };

  // --- Section 4: CBT Cognitive Restructuring Journal State ---
  const [journals, setJournals] = useState<HealingJournal[]>([]);
  const [negThought, setNegThought] = useState("");
  const [restrucThought, setRestrucThought] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("Buồn bực, áp lực nợ nần tinh thần");

  const loadLocalJournals = () => {
    const cached = localStorage.getItem("restructure_journals_cbt");
    if (cached) {
      try { setJournals(JSON.parse(cached)); } catch { }
    }
  };

  useEffect(() => {
    loadLocalJournals();
    const handleSyncEvent = (e: any) => {
      if (e.detail?.cbtJournals) {
        setJournals(e.detail.cbtJournals);
      } else {
        loadLocalJournals();
      }
    };
    window.addEventListener("safe_school_data_synced", handleSyncEvent);
    return () => window.removeEventListener("safe_school_data_synced", handleSyncEvent);
  }, []);

  const addJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!negThought || !restrucThought) return;

    const entry: HealingJournal = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("vi-VN"),
      negativeThought: negThought,
      restructuredThought: restrucThought,
      emotion: selectedEmotion
    };

    const updated = [entry, ...journals];
    setJournals(updated);
    localStorage.setItem("restructure_journals_cbt", JSON.stringify(updated));
    
    // reset form fields
    setNegThought("");
    setRestrucThought("");

    // Đồng bộ lên đám mây gắn với mã PIN
    pushStudentSyncToCloud().catch(() => {});
  };

  const deleteJournal = (id: string) => {
    const updated = journals.filter(j => j.id !== id);
    setJournals(updated);
    localStorage.setItem("restructure_journals_cbt", JSON.stringify(updated));
    pushStudentSyncToCloud().catch(() => {});
  };


  // Interactive CBT Cognitive Distortions (Beck, 1979; Burns, 1980)
  const [selectedDistortion, setSelectedDistortion] = useState<number>(0);
  const cbtTemplates = [
    {
      trapName: "1. Cá nhân hóa & Tự đổ lỗi (Personalization)",
      citation: "Beck, A. T. (1979) & Burns, D. D. (1980)",
      explanation: "Bẫy nhận thức khiến em tự quy kết mọi hành vi lạnh nhạt của người khác đều do lỗi hoặc sự kém cỏi của bản thân mình.",
      neg: "Các bạn cùng tổ cố tình bỏ rơi mình, không giao việc nhóm là vì mình dở tệ, bất tài vô dụng.",
      pos: "Có lẽ nhóm chưa hiểu rõ thế mạnh của mình, hoặc cách giao tiếp của chúng mình đang có chút lệch nhịp. Sức học của mình đã được chứng minh qua các kỳ kiểm tra cá nhân, hành vi của nhóm không đo lường được toàn diện giá trị của mình."
    },
    {
      trapName: "2. Đọc ý nghĩ & Thảm họa hóa (Mind Reading & Catastrophizing)",
      citation: "Beck, J. S. (2020) — Cognitive Behavior Therapy (3rd ed.)",
      explanation: "Tự suy diễn rằng người khác đang nghĩ xấu về mình dù chưa có bằng chứng, và phóng đại hậu quả thành thảm họa không thể cứu vãn.",
      neg: "Họ đăng status ẩn ý nói xấu mình, cả thế giới chắc chắn đang ghét mình và cười nhạo mình.",
      pos: "Status ẩn danh đó có thể không viết về mình, và mạng xã hội chỉ là một lát cắt cực nhỏ. Những người thực sự quan trọng ngoài đời thực (bố mẹ, thầy cô, bạn thân) vẫn yêu quý và thấu hiểu mình sâu sắc."
    },
    {
      trapName: "3. Tư duy Trắng - Đen Tuyệt đối hóa (All-or-Nothing Thinking)",
      citation: "Burns, D. D. (1980) — Feeling Good: The New Mood Therapy",
      explanation: "Nhìn nhận sự việc theo hai thái cực: Nếu một nhóm bạn không chơi với mình nghĩa là mình hoàn toàn thất bại trong giao tiếp xã hội.",
      neg: "Bị một nhóm bạn trong lớp ngó lơ tin nhắn nghĩa là mình hoàn toàn bị cô lập, chẳng còn ai ở trường muốn làm bạn với mình nữa.",
      pos: "Một nhóm nhỏ không hợp tính không đại diện cho cả tập thể lớp hay toàn trường. Mình vẫn có thể chủ động kết nối với những bạn hiền lành ở các câu lạc bộ và lớp học khác."
    }
  ];

  const applyTemplate = (index: number) => {
    setSelectedDistortion(index);
    setNegThought(cbtTemplates[index].neg);
    setRestrucThought(cbtTemplates[index].pos);
  };

  // Dynamic School Consultation Settings from /api/system/status and localStorage
  const [schoolInfo, setSchoolInfo] = useState(() => {
    try {
      const cached = localStorage.getItem("safe_school_handbook_settings");
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
    return {
      counselingRoom: "Phòng Tham Vấn Tâm Lý Học Đường (Phòng A.204)",
      hotline: "1900 6233 / Tổng đài 111",
      consultationHours: "Thứ 2 - Thứ 6 (Giờ hành chính & Sau giờ học)",
      principalHotline: "Khẩn cấp 24/7"
    };
  });

  const [isEditingHotlines, setIsEditingHotlines] = useState(false);
  const [editCounselingRoom, setEditCounselingRoom] = useState(schoolInfo.counselingRoom);
  const [editHotline, setEditHotline] = useState(schoolInfo.hotline);
  const [editPrincipalHotline, setEditPrincipalHotline] = useState(schoolInfo.principalHotline);
  const [editConsultationHours, setEditConsultationHours] = useState(schoolInfo.consultationHours);
  const [hotlineSaveSuccess, setHotlineSaveSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/system/status")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.schoolSettings) {
          const fetched = {
            counselingRoom: data.schoolSettings.counselingRoom || "Phòng Tham Vấn Tâm Lý Học Đường",
            hotline: data.schoolSettings.hotline || "1900 6233",
            consultationHours: data.schoolSettings.consultationHours || "Thứ 2 - Thứ 6",
            principalHotline: data.schoolSettings.principalHotline || "Khẩn cấp 24/7"
          };
          setSchoolInfo(fetched);
          setEditCounselingRoom(fetched.counselingRoom);
          setEditHotline(fetched.hotline);
          setEditPrincipalHotline(fetched.principalHotline);
          setEditConsultationHours(fetched.consultationHours);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSection5Hotlines = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      counselingRoom: editCounselingRoom.trim() || "Phòng Tham Vấn Tâm Lý Học Đường",
      hotline: editHotline.trim(),
      principalHotline: editPrincipalHotline.trim(),
      consultationHours: editConsultationHours.trim() || "Thứ 2 - Thứ 6"
    };
    setSchoolInfo(updated);
    try {
      localStorage.setItem("safe_school_handbook_settings", JSON.stringify(updated));
      const activeSchool = localStorage.getItem("safe_school_active_hotline_school") || "Trường THPT Chung";
      let localHotlines: Record<string, any> = {};
      const raw = localStorage.getItem("safe_school_custom_hotlines_by_school");
      if (raw) localHotlines = JSON.parse(raw);
      localHotlines[activeSchool] = updated;
      localStorage.setItem("safe_school_custom_hotlines_by_school", JSON.stringify(localHotlines));
    } catch {}

    setHotlineSaveSuccess(true);
    setTimeout(() => {
      setHotlineSaveSuccess(false);
      setIsEditingHotlines(false);
    }, 2000);
  };


  const sections = [
    { id: 0, title: "1. Nhận Diện & Chỉ Số Cô Lập", icon: HelpCircle },
    { id: 1, title: "2. Thang Đo Sợ Bỏ Lỡ (State-FoMO)", icon: Activity },
    { id: 2, title: "3. PAUSE & Luyện Thở Phục Hồi", icon: BookOpen },
    { id: 3, title: "4. Sân Luyện Tâm Lý (CBT Journal)", icon: PenTool },
    { id: 4, title: "5. Digital Peer Mentors & Hỗ Trợ", icon: Users }
  ];

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-4" id="psy_handbook_root">
      {/* Sidebar Sidebar */}
      <div className="md:col-span-1 space-y-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-md shadow-indigo-100/50" id="handbook_sidebar_tabs">
          <span className="block text-[15px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-2">Bộ Cẩm Nang Số</span>
          <nav className="space-y-1">
            {sections.map(s => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[17px] font-semibold transition cursor-pointer ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                      : "text-slate-600 hover:bg-slate-50/60 backdrop-blur-sm hover:text-slate-800"
                  }`}
                  id={`btn_handbook_tab_${s.id}`}
                >
                  <Icon size={22} />
                  <span>{s.title}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Supportive banner card */}
        <div className="rounded-2xl bg-linear-to-b from-indigo-900 to-indigo-950 p-5 text-white space-y-3">
          <Heart className="text-pink-300 animate-pulse fill-pink-300" size={24} />
          <h4 className="font-bold text-[17px]">Góc Sức Khỏe Số</h4>
          <p className="text-[14px] text-indigo-200 leading-relaxed">
            Chương trình được biên khảo theo đề án &ldquo;Digital Wellness for Teens&rdquo; giúp bảo vệ sức khỏe tâm thần lứa tuổi học đường trong thế kỷ số hóa.
          </p>
        </div>
      </div>

      {/* Main content body */}
      <div className="md:col-span-3 space-y-6">
        
        {/* SECTION 1: SILENT EXCLUSION DETECTOR QUIZ */}
        {activeSection === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md shadow-indigo-100/50 space-y-6" id="handbook_sec_0">
            <div className="border-b border-slate-100 pb-4 space-y-2">
              <h2 className="text-[23px] font-bold text-slate-800 flex items-center gap-2">
                <HelpCircle className="text-rose-500" size={28} /> Thang Đo Trải Nghiệm Lạnh Nhạt Số (Cyber-Ostracism Experience Scale - COES)
              </h2>
              <p className="text-[16px] text-slate-500">
                Làm bài đánh giá nhanh 5 câu hỏi theo thang Likert (1–5) để chẩn đoán mức độ em đang bị tác động bởi bạo lực trắng vô hình và sự tẩy chay trên không gian mạng.
              </p>
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-2.5 text-[12px] text-slate-600">
                🔬 <strong>Cơ sở khoa học công bố:</strong> Chuẩn hóa từ mô hình <em>Cyberostracism</em> của <strong>Williams, Cheung, & Choi (2000)</strong> (<em>Journal of Personality and Social Psychology, 79(5), 748–762</em>), kết hợp nghiên cứu thần kinh học fMRI về nỗi đau bị loại trừ xã hội của <strong>Eisenberger, Lieberman, & Williams (2003)</strong> (<em>Science, 302, 290–292</em>) và <strong>Hinduja & Patchin (2014)</strong>.
              </div>
            </div>

            {quizScore === null ? (
              <div className="space-y-6">
                {quizQuestions.map((q, idx) => (
                  <div key={q.id} className="space-y-3 bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 p-4 rounded-2xl border border-slate-100/50">
                    <h4 className="font-bold text-slate-800 text-[15px]">
                      Câu {idx + 1}: {q.text}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 text-center">
                      {[
                        { text: "Không bao giờ", val: 1, color: "hover:border-emerald-300", activeColor: "border-emerald-600 bg-emerald-50/50 text-emerald-900 ring-2 ring-emerald-500" },
                        { text: "Hiếm khi", val: 2, color: "hover:border-blue-300", activeColor: "border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500" },
                        { text: "Đôi khi", val: 3, color: "hover:border-amber-300", activeColor: "border-amber-600 bg-amber-50/50 text-amber-900 ring-2 ring-amber-500" },
                        { text: "Thường xuyên", val: 4, color: "hover:border-orange-300", activeColor: "border-orange-600 bg-orange-50/50 text-orange-900 ring-2 ring-orange-500" },
                        { text: "Rất thường xuyên", val: 5, color: "hover:border-rose-300", activeColor: "border-rose-600 bg-rose-50/50 text-rose-900 ring-2 ring-rose-500" }
                      ].map((opt) => {
                        const isSelected = quizAnswers[q.id] === opt.val;
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => handleQuizAnswer(q.id, opt.val)}
                            className={`rounded-2xl border p-2 text-[14px] font-bold transition cursor-pointer flex flex-col items-center justify-center space-y-1 ${opt.color} ${
                              isSelected 
                                ? opt.activeColor 
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="text-[17px] font-black">{opt.val}</span>
                            <span className="text-[12px] font-semibold leading-tight">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {quizError && (
                  <div className="p-3 bg-pink-50 text-pink-700 rounded-2xl border border-pink-100 text-[15px] font-semibold animate-pulse">
                    ⚠️ {quizError}
                  </div>
                )}

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={calculateQuiz}
                    className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200/50 text-white border-0 px-6 py-3 text-[17px] font-semibold text-white hover:bg-slate-800 cursor-pointer"
                  >
                    Xem kết quả đánh giá (Chỉ số COES)
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-indigo-50/40 border border-indigo-100 p-6 space-y-6 animate-fade-in" id="quiz_result_box">
                <div className="text-center space-y-2">
                  <span className="text-[15px] font-bold text-indigo-600 uppercase tracking-widest block">Điểm số bạo lực trắng (COES) của em</span>
                  <div className="text-[51px] font-extrabold text-indigo-700">{quizScore} / 25</div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-[19px]">Thầy cô phân tích tình hình của em:</h3>
                  {quizScore <= 10 ? (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 text-[15px] leading-relaxed space-y-2">
                      <p>🟢 <strong>Mức độ Thấp (Vùng quan hệ an toàn - Điểm số: {quizScore}/25):</strong> Môi trường học tập và các quan hệ bạn bè trên mạng xã hội của em đang ở ngưỡng an toàn lành mạnh. Những xích mích nhẹ thỉnh thoảng chỉ là hiểu lầm hoặc xung đột lứa tuổi thông thường.</p>
                      <p><strong>Cố vấn khuyên em:</strong> Hãy luôn duy trì sự cởi mở, lắng nghe tích cực và chủ động kết nạp thêm nhiều bạn tốt ở cả hoạt động ngoài đời thực nhé.</p>
                    </div>
                  ) : quizScore <= 18 ? (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 text-[15px] leading-relaxed space-y-2">
                      <p>🟡 <strong>Mức độ Trung bình (Bắt đầu xuất hiện bạo lực trắng - Điểm số: {quizScore}/25):</strong> Em đang chịu sự cô lập nhẹ, tẩy chay ngầm hoặc dính đồn đại ngắt quãng gây ảnh hưởng nhẹ đến lòng tự trọng.</p>
                      <p><strong>Cố vấn khuyên em:</strong> Đừng tự chịu đựng một mình. Hãy chủ động rèn luyện giao thức <strong>PAUSE</strong> để điều tiết tương tác số và liên tâm chia sẻ với một Digital Peer Mentor mà em tin tưởng.</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-950 text-[15px] leading-relaxed space-y-2">
                      <p>🔴 <strong>Mức độ Nghiêm trọng (Báo động bạo lực trắng học đường & số - Điểm số: {quizScore}/25):</strong> Em đang là nạn nhân của sự tẩy chay tập thể nguy hại, bị cô lập, bôi nhọ, chặn đối thoại hoặc gắn thẻ công kích công cộng có tổ chức cực kỳ nghiêm trọng.</p>
                      <p><strong>Cố vấn khuyên em:</strong> Thầy cô và nhà trường luôn ở bên hỗ trợ em. Đây tuyệt đối không phải lỗi của em! Hãy chụp màn hình lưu các bằng chứng lăng mạ, lờ đi của các nhóm, và <strong>Gửi báo cáo mật ẩn danh ngay lập tức</strong> cho ban giám hiệu trường qua mục Báo cáo của ứng dụng này để thầy cô có giải pháp can thiệp phục hồi an toàn và kín kẽ nhất.</p>
                    </div>
                  )}

                  {/* Scientific Citation for COES Quiz */}
                  <div className="bg-white/90 rounded-xl p-3 border border-indigo-100 text-[12px] text-slate-600 space-y-1">
                    <span className="font-extrabold text-indigo-900 flex items-center gap-1 uppercase tracking-wider">
                      🔬 Dẫn chứng & Nguồn gốc đánh giá mức độ:
                    </span>
                    <p className="leading-relaxed">
                      Phân bậc dựa theo <em>Cyber-Ostracism Experience Scale (COES)</em> của <strong>Williams (2009)</strong>, thang đo Bạo lực mạng của <strong>Hinduja & Patchin (2014, 2022)</strong> và Thang đo Trắc lượng Tâm lý Bắt nạt Học đường của <strong>Dan Olweus (1993)</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={resetQuiz}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-[15px] font-semibold text-slate-700 hover:bg-slate-50/60 backdrop-blur-sm cursor-pointer"
                  >
                    Làm lại trắc nghiệm
                  </button>
                  <button
                    onClick={() => setActiveSection(2)}
                    className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                  >
                    Xem quy trình ứng phó PAUSE ➜
                  </button>
                </div>
              </div>
            )}

            {/* Pillars of COES based on recent research */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/40 p-5 space-y-3">
              <h3 className="font-bold text-slate-800 text-[15px] uppercase text-indigo-700 flex items-center gap-1.5">
                📌 4 TRỤ CỘT BẠO LỰC TRẮNG (DỰA THEO THANG ĐO COES 2024-2025)
              </h3>
              <p className="text-[14px] text-slate-500">Nghiên cứu tâm lý học quốc tế gần đây (Cyber-Ostracism Experience Scale) định nghĩa bạo lực trắng không chỉ là bắt nạt, mà là "sự tước đoạt quyền tồn tại số" thông qua 4 yếu tố tàn phá tâm lý sâu sắc sau:</p>
              <ul className="grid grid-cols-1 gap-2 text-[15px] text-slate-600 md:grid-cols-2">
                <li className="flex items-start gap-2 bg-white/50 p-3 rounded-xl border border-slate-100/30">
                  <span className="text-indigo-600 font-bold text-[21px] leading-none">1</span>
                  <span><strong>Sự phớt lờ (Ignored Factor):</strong> Tin nhắn bị "seen" đồng loạt tập thể, bài đăng bị giả lơ không tương tác trong khi những người khác vẫn được phản hồi rôm rả. Đây là dạng tước đoạt giá trị giao tiếp.</span>
                </li>
                <li className="flex items-start gap-2 bg-white/50 p-3 rounded-xl border border-slate-100/30">
                  <span className="text-indigo-600 font-bold text-[21px] leading-none">2</span>
                  <span><strong>Sự loại trừ khỏi vòng kết nối (Excluded Factor):</strong> Lập các group chat kín, hội nhóm học tập, hay nhóm chơi game mà cố tình bỏ sót duy nhất mình em, tạo cảm giác mình là người thừa thãi.</span>
                </li>
                <li className="flex items-start gap-2 bg-white/50 p-3 rounded-xl border border-slate-100/30">
                  <span className="text-indigo-600 font-bold text-[21px] leading-none">3</span>
                  <span><strong>Treo phản hồi (Delayed Response Factor):</strong> Cố tình trì hoãn cực lâu mới trả lời tin nhắn của em, chừa lại em ở trạng thái "treo" để biểu thị sự khinh thường quyền lực ngầm.</span>
                </li>
                <li className="flex items-start gap-2 bg-white/50 p-3 rounded-xl border border-slate-100/30">
                  <span className="text-indigo-600 font-bold text-[21px] leading-none">4</span>
                  <span><strong>Giao tiếp vô hình (Invisible Status Factor):</strong> Mọi người vẫn chat, vẫn tham gia nhưng đột ngột im lặng hoặc chuyển chủ đề gượng gạo ngay lập tức khi em bắt đầu xuất hiện hoặc lên tiếng.</span>
                </li>
              </ul>
              <div className="mt-2 bg-indigo-50/50 p-2 rounded border border-indigo-100 text-[13px] text-indigo-800 italic">
                * Việc nhận diện đúng 4 trụ cột này giúp em giải trừ cảm giác "ảo tưởng lỗi do mình", hiểu rõ đây là hành vi thao túng tâm lý tập thể (Gaslighting tập thể) để áp dụng giao thức PAUSE.
              </div>
            </div>

            {renderHistoryTable()}
          </div>
        )}

        {/* SECTION 2: FOMO ASSESSMENT & DIGITAL MOOD TRACKER */}
        {activeSection === 1 && (
          <div className="space-y-6" id="handbook_sec_1">
            {/* FOMO Assessment card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md shadow-indigo-100/50 space-y-6">
              <div className="border-b border-slate-100 pb-4 space-y-2">
                <h2 className="text-[23px] font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="text-indigo-500" size={28} /> Thang Đo Hội Chứng Sợ Bỏ Lỡ Không Gian Mạng (State-FoMO Scale)
                </h2>
                <p className="text-[16px] text-slate-500">
                  Mạng xã hội dễ phóng đại cuộc sống &ldquo;dàn dựng&rdquo; và gây hội chứng sợ hụt thông tin trầm trọng. Hãy tự lượng giá qua 10 mệnh đề chuẩn quốc tế:
                </p>
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-2.5 text-[12px] text-slate-600">
                  🔬 <strong>Cơ sở khoa học công bố:</strong> Xây dựng trên thang đo gốc 10 mục <em>Fear of Missing Out Scale (FoMOs)</em> của <strong>Przybylski, Murayama, DeHaan, & Gladwell (2013)</strong> (<em>Đại học Oxford — Computers in Human Behavior, 29(4), 1841–1848</em>) và thang đo <em>State-FoMO</em> trực tuyến của <strong>Wegmann et al. (2017)</strong>.
                </div>
              </div>

              {fomoScore === null ? (
                <div className="space-y-5">
                  {fomoQuestions.map((q, idx) => (
                    <div key={q.id} className="flex flex-col gap-2.5 bg-slate-50/55 p-4 rounded-2xl border border-slate-100/50">
                      <span className="text-[15px] font-semibold text-slate-800">
                        {idx + 1}. {q.text}
                      </span>
                      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                        {[
                          { text: "Hoàn toàn sai", val: 1 },
                          { text: "Đa phần sai", val: 2 },
                          { text: "Đúng một phần", val: 3 },
                          { text: "Đa phần đúng", val: 4 },
                          { text: "Hoàn toàn đúng", val: 5 }
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => handleFomoAnswer(q.id, opt.val)}
                            className={`rounded-xl py-2 text-[13px] sm:text-[14px] font-bold border transition text-center flex flex-col items-center justify-center cursor-pointer ${
                              fomoAnswers[q.id] === opt.val
                                ? "bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-300"
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            <span className="text-[15px] font-extrabold">{opt.val}</span>
                            <span className="text-[11px] leading-tight text-center hidden sm:inline">{opt.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {fomoError && (
                    <div className="p-3 bg-pink-50 text-pink-700 rounded-2xl border border-pink-100 text-[15px] font-semibold animate-pulse">
                      ⚠️ {fomoError}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={calculateFomo}
                      className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200/50 text-white border-0 px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-slate-800 cursor-pointer"
                    >
                      Kiểm nghiệm Chỉ số State-FoMO (10-50 điểm)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-indigo-50/50 p-5 space-y-4 border border-indigo-100/60 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-indigo-100/40 pb-2">
                    <span className="text-[15px] font-bold text-indigo-900">Tổng điểm hội chứng sợ bỏ lỡ (State-FoMO Scale):</span>
                    <strong className="text-[23px] text-indigo-700">{fomoScore} / 50 điểm</strong>
                  </div>
                  
                  <div className="text-[15px] text-slate-700 leading-relaxed space-y-2">
                    {fomoScore <= 22 ? (
                      <div>
                        <p className="text-emerald-700 font-bold">🟢 MỨC ĐỘ FOMO THẤP (Chỉ số cân bằng: {fomoScore}/50 điểm):</p>
                        <p className="mt-1">Em đang điều tiết quan hệ mạng xã hội vô cùng an toàn và lành mạnh! Em phân định hoàn hảo giá trị thực tế đời thường, không bận tâm quá mức về những cập nhật liên tục trên smartphone và biết cách giữ bình tĩnh tuyệt vời.</p>
                      </div>
                    ) : fomoScore <= 36 ? (
                      <div>
                        <p className="text-amber-700 font-bold">🟡 MỨC ĐỘ FOMO TRUNG BÌNH (Áp lực kết nối vô hình: {fomoScore}/50 điểm):</p>
                        <p className="mt-1">Em đang bắt đầu chịu áp lực tâm lý so sánh ngầm hoặc bứt rứt muốn mở điện thoại liên tục. Việc không thấy thông tin hay nhóm bạn vui chơi có thể vô thức gây sụt giảm năng lượng và lòng tự trọng của em.</p>
                        <p className="mt-1 font-semibold text-indigo-600">Thầy cô khuyên em: Khuyến khích rèn luyện kỹ thuật cai nghiện số hoặc nghỉ xả hơi một vài giờ cố định trong ngày.</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-rose-700 font-bold">🔴 MỨC ĐỘ FOMO BÁO ĐỘNG (Dẫn dắt bởi thế giới ảo cực đoan: {fomoScore}/50 điểm):</p>
                        <p className="mt-1">Em bị trói buộc và chi phối cực kỳ nghiêm trọng bởi thế giới số ảo. Sự bất an, lo sợ bị quên lãng hối thúc em lướt điện thoại dồn dập, kéo theo sự căng thẳng, mất ngủ và suy kiệt hứng khởi học tập thực tế.</p>
                        <p className="mt-1 font-semibold text-rose-600">Thầy cô hỗ trợ em: Hãy tiến hành thực thi giao thức PAUSE, tập thiền thở 5 phút, hoặc liên hệ ngay với thầy cô phòng Tư vấn tâm lý hay các Digital Peer Mentor để tìm lại thói quen số hạnh phúc.</p>
                      </div>
                    )}
                  </div>

                  {/* Scientific Citation for FOMO Scale */}
                  <div className="bg-white/90 rounded-xl p-3 border border-indigo-100 text-[12px] text-slate-600 space-y-1">
                    <span className="font-extrabold text-indigo-900 flex items-center gap-1 uppercase tracking-wider">
                      🔬 Dẫn chứng & Nguồn gốc thang đo FOMO:
                    </span>
                    <p className="leading-relaxed">
                      Chuẩn hóa dựa trên <em>Fear of Missing Out Scale (FoMOs)</em> của <strong>Przybylski, Murayama, DeHaan, & Gladwell (2013, Oxford University)</strong> và nghiên cứu Tác động của Mạng xã hội lên Sức khỏe Tâm thần Thanh thiếu niên của <strong>Twenge (2020)</strong>.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-start">
                    <button 
                      onClick={() => { setFomoAnswers({}); setFomoScore(null); }}
                      className="rounded-xl bg-white border border-slate-200 px-4 py-2 text-[15px] font-bold text-indigo-600 hover:bg-slate-50/60 backdrop-blur-sm cursor-pointer"
                    >
                      Đặt lại thang đo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {renderHistoryTable()}
          </div>
        )}

        {/* SECTION 3: PAUSE PROTOCOL */}
        {activeSection === 2 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md shadow-indigo-100/50 space-y-6" id="handbook_sec_2">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-[23px] font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="text-indigo-500" size={28} /> Sổ Tay Ứng Cứu Số & Nâng Cao Năng Lực Ứng Phó (Psychological Resilience)
              </h2>
              <p className="text-[17px] text-slate-500 mt-1">
                Sản phẩm ứng dụng từ đề tài: "Nghiên cứu hành vi 'Bạo lực trắng' trên không gian mạng và giải pháp giảm thiểu hội chứng sợ bị bỏ rơi (FOMO) ở học sinh THPT".
              </p>
            </div>

            {/* Protocol Steps Box */}
            <div className="space-y-4">
              {[
                {
                  code: "P",
                  title: "PAUSE - Dừng Lại & Rút Lui Số",
                  desc: "Ngay khi nhận ra bất cứ tín hiệu bạo lực trắng (bị xầm xì, ném đá mạng, lập group anti, seen không trả lời), hãy thoát toàn bộ tài khoản mạng xã hội trong ít nhất 30 phút. Tuyệt đối không khẩu chiến hay đôi co phản hồi tức thì dưới sự giận dữ.",
                  action: "Hít thở sâu 5 nhịp chậm rãi bằng cơ hoành (Box Breathing 4-4-4-4 hoặc Thở phế vị 4-1-6) để kích hoạt hệ thần kinh đối giao cảm hạ hỏa.",
                  citation: "Porges, S. W. (2011). The Polyvagal Theory: Neurophysiological Foundations of Emotions. W. W. Norton & Company."
                },
                {
                  code: "A",
                  title: "ASSESS - Đánh Giá Tình Hình Khách Quan",
                  desc: "Trực giác đầu tiên hay thổi phồng vấn đề. Hãy bình tâm trả lời 3 câu hỏi tự lượng giá: (1) Đây là hành vi có chủ ý bắt nạt hay chỉ là hiểu nhầm ngẫu nhiên? (2) Mức độ nghiêm trọng tới đâu? (3) Mình cần trợ giúp gì lúc này?",
                  action: "Tự nhắc nhở bản thân rằng: Hành vi cô lập của kẻ bắt nạt phản ánh vấn đề của họ, tuyệt đối không định nghĩa giá trị hay nhân phẩm của em.",
                  citation: "Lazarus, R. S. (1991). Emotion and Adaptation (Cognitive Appraisal Theory). Oxford University Press."
                },
                {
                  code: "U",
                  title: "UNDERSTAND - Thấu Hiểu Cảm Xúc & Tự Trắc Ẩn",
                  desc: "Định danh cụ thể cảm xúc của em trên Bánh xe Plutchik hoặc Geneva v3.0 (cô độc, bẽ bàng, bàng hoàng hay phẫn uất). Nhớ rằng việc buồn bực là phản ứng sinh học tự nhiên, không phải biểu hiện sự yếu đuối.",
                  action: "Thực hành Tự trắc ẩn (Self-Compassion) xóa bỏ tâm lý tự đổ lỗi và viết ra 3 điểm mạnh cá nhân hoàn toàn không phụ thuộc mạng xã hội.",
                  citation: "Neff, K. D. (2003). Self-compassion: An alternative conceptualization of a healthy attitude toward oneself. Self and Identity, 2(2), 85–101 & Lieberman et al. (2007)."
                },
                {
                  code: "S",
                  title: "SEEK SUPPORT - Tìm Kiếm Trợ Lực & Đồng Minh Mật",
                  desc: "Xác định từ 1 đến 2 người trưởng thành hoặc đồng lứa đáng tin cậy để giãi bày (Cha mẹ, Giáo viên chủ nhiệm, Cán bộ tư vấn tâm lý học đường, hoặc Digital Peer Mentors).",
                  action: "Sử dụng kịch bản mở lời an toàn: 'Thầy/Cô ơi, em đang gặp vấn đề cô lập trên MXH, em rất lo lắng. Thầy/Cô có thể trao đổi bảo mật giúp đỡ em được không ạ?'",
                  citation: "Cohen, S., & Wills, T. A. (1985). Stress, social support, and the buffering hypothesis. Psychological Bulletin, 98(2), 310–357."
                },
                {
                  code: "E",
                  title: "EMPOWER - Trao Quyền & Khôi Phục Quyền Ứng Xử",
                  desc: "Chuyển từ vị thế nạn nhân thụ động thành người làm chủ tình hình bằng các biện pháp kỹ thuật số và bảo vệ chính thống:",
                  action: "1. Chụp màn hình lưu giữ toàn bộ bằng chứng số. 2. Khóa bình luận, chặn tài khoản ác ý. 3. Gửi hồ sơ ca tư vấn ẩn danh lên SafeZone để nhà trường can thiệp.",
                  citation: "Zimmerman, M. A. (1995). Psychological empowerment: Issues and illustrations. American Journal of Community Psychology, 23(5), 581–599."
                }
              ].map((step, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 hover:bg-slate-50/60 backdrop-blur-sm transition">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[21px] font-black text-white font-mono">
                    {step.code}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-bold text-slate-800 text-[17px]">{step.title}</h4>
                    <p className="text-[15px] text-slate-600 leading-relaxed">{step.desc}</p>
                    <div className="mt-1 text-[14.5px] font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100/40">
                      ⚡ <strong>Hành động cụ thể:</strong> {step.action}
                    </div>
                    <div className="text-[11.5px] text-slate-500 italic pt-1">
                      🔬 <strong>Trích dẫn khoa học:</strong> {step.citation}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Scientific Citation for PAUSE Protocol */}
            <div className="bg-indigo-50/70 rounded-xl p-3 border border-indigo-100 text-[12px] text-slate-600 space-y-1">
              <span className="font-extrabold text-indigo-900 flex items-center gap-1 uppercase tracking-wider">
                🔬 Tổng hợp Cơ sở khoa học & Can thiệp khủng hoảng:
              </span>
              <p className="leading-relaxed">
                Được xây dựng dựa trên <strong>Thuyết Đa phế vị (Polyvagal Theory - Stephen Porges, 2011)</strong>, <strong>Lý thuyết Đánh giá Nhận thức (Lazarus, 1991)</strong>, <strong>Mô hình Tự trắc ẩn (Kristin Neff, 2003)</strong> và Hướng dẫn thúc đẩy sức khỏe tâm thần thanh thiếu niên của <em>Tổ chức Y tế Thế giới (WHO, 2020)</em>.
              </p>
            </div>

            {/* Interactive Recovery Module: Step 5 Recovery */}
            <div className="pt-2 border-t border-slate-100">
              <RecoveryModule id="pause-protocol-section" />
            </div>
          </div>
        )}

        {/* SECTION 4: CBT COGNITIVE RESTRUCTURING JOURNAL */}
        {activeSection === 3 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md shadow-indigo-100/50 space-y-6" id="handbook_sec_3">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-[23px] font-bold text-slate-800 flex items-center gap-2">
                <PenTool className="text-indigo-500" size={28} /> Sân Luyện Tâm Lý: Nhật Ký Tái Cấu Trúc Nhận Thức (CBT Journal)
              </h2>
              <p className="text-[17px] text-slate-500 mt-1">
                Công cụ thực hành Liệu pháp Nhận thức - Hành vi giúp học sinh bóc tách "Bẫy suy nghĩ tự động" và kiến tạo góc nhìn cân bằng, khách quan.
              </p>
            </div>

            {/* Scientific Citation for CBT Journal */}
            <div className="bg-indigo-50/70 rounded-xl p-3 border border-indigo-100 text-[12px] text-slate-600 space-y-1">
              <span className="font-extrabold text-indigo-900 flex items-center gap-1 uppercase tracking-wider">
                🔬 Cơ sở lý thuyết Liệu pháp Nhận thức - Hành vi (CBT):
              </span>
              <p className="leading-relaxed">
                Ứng dụng mô hình <strong>Tái cấu trúc nhận thức (Cognitive Restructuring)</strong> của <strong>Aaron T. Beck (1979)</strong> (<em>Cognitive Therapy of Depression, Guilford Press</em>), <strong>Judith S. Beck (2020)</strong> và phân loại các bẫy nhận thức của <strong>David D. Burns (1980)</strong> (<em>Feeling Good: The New Mood Therapy</em>).
              </p>
            </div>

            {/* Interactive Cognitive Distortion Selector */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/20 p-4 space-y-3">
              <span className="text-[13px] font-bold text-indigo-700 uppercase block tracking-wider">
                💡 Bước 1: Chọn Bẫy Nhận Thức (Cognitive Distortion) để xem giải thích khoa học & điền mẫu nhanh
              </span>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {cbtTemplates.map((t, idx) => {
                  const isSelected = selectedDistortion === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyTemplate(idx)}
                      className={`rounded-xl border p-3 text-left text-[13.5px] cursor-pointer block transition ${
                        isSelected
                          ? "border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-xs"
                          : "border-slate-200 bg-white/80 hover:border-indigo-400"
                      }`}
                    >
                      <strong className="text-indigo-900 block mb-1">{t.trapName}</strong>
                      <p className="text-[12px] text-slate-600 leading-relaxed mb-1.5">{t.explanation}</p>
                      <span className="text-[11px] font-mono text-indigo-600 font-bold block">
                        📚 {t.citation}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Structured Entry Form */}
            <form onSubmit={addJournal} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-[15px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-500"></span> Suy nghĩ tự động tiêu cực (ANTs)
                  </label>
                  <textarea
                    value={negThought}
                    onChange={(e) => setNegThought(e.target.value)}
                    placeholder="Ví dụ: Cả lớp không ai muốn bàn luận hỏi han mình khi làm bài tập, chắc chắn là do mình học kém và tẻ nhạt vô dụng..."
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-[15px] outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[15px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Nhận thức tái cấu trúc cân bằng (CBT)
                  </label>
                  <textarea
                    value={restrucThought}
                    onChange={(e) => setRestrucThought(e.target.value)}
                    placeholder="Ví dụ: Đây chỉ là định kiến nhất thời. Học lực mình vẫn tốt. Mình có cuộc sống phong phú giá trị khác ngoài giao tiếp học đường..."
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 p-3 text-[15px] outline-hidden focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="space-y-1.5">
                  <span className="block text-[14px] font-bold text-slate-500 uppercase">Cảm xúc hiện tại là:</span>
                  <select 
                    value={selectedEmotion}
                    onChange={(e) => setSelectedEmotion(e.target.value)}
                    className="rounded-xl border border-slate-200 p-2 text-[15px] outline-hidden text-slate-700 bg-white"
                  >
                    <option>Sợ hãi, mệt mỏi</option>
                    <option>U uất, bị cô lập, tủi thân</option>
                    <option>Tức giận bộc phát</option>
                    <option>Tạm ổn, đang lấy lại thăng bằng</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200/50 text-white border-0 px-5  py-2.5 text-[15px] font-semibold text-white hover:bg-slate-800 cursor-pointer self-end"
                >
                  Lưu vào Sổ nhật ký chữa lành
                </button>
              </div>
            </form>

            {/* Saved journals history */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-[15px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Bookmark size={14} className="text-indigo-500" /> Sổ tay Chữa lành cá nhân của em
              </h3>

              {journals.length === 0 ? (
                <p className="text-[15px] font-medium italic text-slate-400 text-center py-6 bg-slate-50/60 backdrop-blur-sm rounded-2xl">
                  Chưa ghi lại bài tập suy tưởng nào. Sử dụng mẫu bên trên hoặc tự viết ra băn khoăn của em để rèn luyện tư duy tự hồi phục nhé.
                </p>
              ) : (
                <div className="space-y-3">
                  {journals.map((j) => (
                    <div key={j.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-2 relative">
                      <button
                        onClick={() => deleteJournal(j.id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Xóa trang nhật ký"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-mono text-slate-400">{j.date}</span>
                        <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[12px] font-bold text-indigo-600">
                          {j.emotion}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 pt-1 text-[15px]">
                        <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/50">
                          <strong className="text-[13px] text-rose-700 block uppercase font-bold mb-1">Suy nghĩ tự động tiêu cực</strong>
                          <p className="text-slate-700 italic">“{j.negativeThought}”</p>
                        </div>
                        <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50">
                          <strong className="text-[13px] text-emerald-700 block uppercase font-bold mb-1">Nhận thức tái cấu trúc lành mạnh</strong>
                          <p className="text-slate-700 font-medium">“{j.restructuredThought}”</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 5: SCHOOL SUPPORT & DIGITAL PEER MENTORS */}
        {activeSection === 4 && (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md shadow-indigo-100/50 space-y-6" id="handbook_sec_4">
            <div className="border-b border-slate-100 pb-4 space-y-2">
              <h2 className="text-[23px] font-bold text-slate-800 flex items-center gap-2">
                <Users className="text-indigo-500" size={28} /> Mạng Lưới Digital Peer Mentors & Hệ Thống Tham Vấn Học Đường
              </h2>
              <p className="text-[16px] text-slate-500">
                Các &ldquo;Digital Peer Mentors&rdquo; (Cố vấn đồng lứa số) là học sinh tình nguyện được tập huấn kỹ năng lắng nghe thấu cảm và sơ cứu tâm lý để đồng hành bảo mật cùng bạn bè.
              </p>
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-[12px] text-slate-600 space-y-1">
                <span className="font-extrabold text-indigo-900 block uppercase tracking-wider">
                  🔬 Cơ sở khoa học & Pháp lý Giáo dục:
                </span>
                <p className="leading-relaxed">
                  • <strong>Mô hình Hỗ trợ Đồng đẳng (Peer Support Model):</strong> Cowie, H., & Wallace, P. (2000). <em>Peer Support in Action: From Bystanding to Standing By</em>, SAGE Publications & Topping, K. J. (2005), <em>Educational Psychology, 25(6), 631–645</em>.
                </p>
                <p className="leading-relaxed">
                  • <strong>Căn cứ Pháp lý Bộ GD&ĐT:</strong> Triển khai theo <strong>Thông tư số 31/2017/TT-BGDĐT</strong> về hướng dẫn công tác tư vấn tâm lý cho học sinh trong trường phổ thông và <strong>Thông tư số 20/2023/TT-BGDĐT</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-indigo-50/30 p-5 space-y-3">
                <h4 className="font-bold text-indigo-900 text-[17px]">🎒 Digital Peer Mentors hỗ trợ gì cho em?</h4>
                <ul className="space-y-2.5 text-[15px] text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span><strong>Lắng nghe không phán xét:</strong> Chia sẻ mọi áp lực số, cô lập mạng bằng sự đồng cảm đồng trang lứa (<em>Active Listening — Rogers, 1957</em>).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span><strong>Chuyển hóa Người ngoài cuộc thành Đồng minh (Upstander):</strong> Phá vỡ hiệu ứng đứng nhìn thụ động (<em>Bystander Effect — Latané & Darley, 1970</em>).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">✓</span>
                    <span><strong>Cầu nối bảo mật:</strong> Hỗ trợ hướng dẫn bạn gửi hồ sơ ẩn danh hoặc kết nối với Phòng Tham vấn Tâm lý học đường an toàn tuyệt đối.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="font-bold text-slate-800 text-[17px]">🏫 Đầu mối Tiếp nhận & Đường dây nóng Hỗ trợ (Hỗ trợ nhiều số)</h4>
                  <button
                    type="button"
                    onClick={() => setIsEditingHotlines(!isEditingHotlines)}
                    className="text-[12px] font-extrabold bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1 rounded-xl transition cursor-pointer"
                  >
                    {isEditingHotlines ? "✕ Đóng chỉnh sửa" : "✏️ Chỉnh sửa & Nhập số"}
                  </button>
                </div>

                {isEditingHotlines ? (
                  <form onSubmit={handleSaveSection5Hotlines} className="space-y-3 bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs animate-fade-in">
                    <h5 className="font-bold text-indigo-900 text-[14px]">Cập nhật SĐT Tư vấn & Phòng tham vấn trực tiếp</h5>
                    <div>
                      <label className="block text-[12px] font-bold text-slate-600 mb-1">Tên Phòng Tham Vấn / Địa điểm:</label>
                      <input
                        type="text"
                        value={editCounselingRoom}
                        onChange={(e) => setEditCounselingRoom(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-[13.5px] font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-slate-600 mb-1">Giờ làm việc:</label>
                      <input
                        type="text"
                        value={editConsultationHours}
                        onChange={(e) => setEditConsultationHours(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-[13.5px] text-slate-700 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-slate-600 mb-1">Tổng đài Tư vấn Tâm lý & Hotline Trường (Nhiều số cách nhau bằng dấu phẩy):</label>
                      <input
                        type="text"
                        value={editHotline}
                        onChange={(e) => setEditHotline(e.target.value)}
                        placeholder="VD: 1900 6233, 024.3845.1234, 0912345678"
                        className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-[13.5px] font-extrabold text-indigo-700 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-slate-600 mb-1">Đường dây nóng Ban Giám Hiệu (Nhiều số cách nhau bằng dấu phẩy):</label>
                      <input
                        type="text"
                        value={editPrincipalHotline}
                        onChange={(e) => setEditPrincipalHotline(e.target.value)}
                        placeholder="VD: 0903.111.222, 0988.777.666"
                        className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-[13.5px] font-extrabold text-emerald-700 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      {hotlineSaveSuccess ? (
                        <span className="text-[12px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">✓ Đã lưu thành công!</span>
                      ) : <span />}
                      <button
                        type="submit"
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 text-[13px] font-bold transition cursor-pointer"
                      >
                        Lưu Thay Đổi
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2 text-[14.5px] text-slate-600">
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 gap-2">
                      <span>{schoolInfo.counselingRoom}</span>
                      <strong className="text-indigo-600 text-right">{schoolInfo.consultationHours}</strong>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 gap-2">
                      <span>Tổng đài Quốc gia Bảo vệ Trẻ em</span>
                      <strong className="text-rose-600">
                        <a href="tel:111" className="hover:underline">111 (24/7 Miễn phí)</a>
                      </strong>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 gap-2">
                      <span>Tổng đài Tư vấn Tâm lý & Hotline Trường</span>
                      <div className="text-right">
                        {(() => {
                          const phoneStr = schoolInfo.hotline || "";
                          const numbers = phoneStr.split(/[,/\n]+/).map(n => n.trim()).filter(Boolean);
                          if (numbers.length <= 1) {
                            return (
                              <a href={`tel:${phoneStr.replace(/[^0-9+]/g, "")}`} className="hover:underline font-bold text-indigo-600">
                                {phoneStr || "Chưa cập nhật"}
                              </a>
                            );
                          }
                          return (
                            <div className="flex flex-wrap gap-1.5 justify-end">
                              {numbers.map((num, i) => (
                                <a
                                  key={i}
                                  href={`tel:${num.replace(/[^0-9+]/g, "")}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[13px] border border-indigo-200/60 transition"
                                  title={`Gọi số ${num}`}
                                >
                                  📞 {num}
                                </a>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 gap-2">
                      <span>Đường dây nóng Ban Giám Hiệu</span>
                      <div className="text-right">
                        {(() => {
                          const phoneStr = schoolInfo.principalHotline || "";
                          const numbers = phoneStr.split(/[,/\n]+/).map(n => n.trim()).filter(Boolean);
                          if (numbers.length <= 1) {
                            return (
                              <a href={`tel:${phoneStr.replace(/[^0-9+]/g, "")}`} className="hover:underline font-bold text-emerald-700">
                                {phoneStr || "Khẩn cấp 24/7"}
                              </a>
                            );
                          }
                          return (
                            <div className="flex flex-wrap gap-1.5 justify-end">
                              {numbers.map((num, i) => (
                                <a
                                  key={i}
                                  href={`tel:${num.replace(/[^0-9+]/g, "")}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[13px] border border-emerald-200/60 transition"
                                  title={`Gọi số ${num}`}
                                >
                                  📞 {num}
                                </a>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-[15px] text-amber-900">
              💡 <strong>Thông điệp tâm lý học đường:</strong> Tìm kiếm sự trợ giúp không phải là yếu đuối, mà là biểu hiện của <strong>Năng lực Phục hồi Tâm lý (Psychological Resilience — Masten, 2001)</strong>. Nhà trường và Thầy Cô luôn đứng về phía em!
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
