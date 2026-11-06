export interface SurveyRecord {
  id: string;
  date: string;
  type: "fomo" | "diagnostic" | "white_violence" | "dass21" | "custom";
  title: string;
  score?: number;
  maxScore?: number;
  level: string;
  summary: string;
  details?: Record<string, any>;
}

export interface StudentSyncPayload {
  moodHistory: any[];
  currentMood: string | null;
  currentMoodTime: string | null;
  surveyHistory: SurveyRecord[];
  cbtJournals: any[];
  submittedCodes: string[];
}

/**
 * Thu thập toàn bộ dữ liệu tâm lý của học sinh hiện có trên máy này
 */
export function getStudentLocalPayload(): StudentSyncPayload {
  let moodHistory: any[] = [];
  try {
    const raw = localStorage.getItem("wellness_mood_history");
    if (raw) moodHistory = JSON.parse(raw);
  } catch { }

  let cbtJournals: any[] = [];
  try {
    const raw = localStorage.getItem("restructure_journals_cbt");
    if (raw) cbtJournals = JSON.parse(raw);
  } catch { }

  let surveyHistory: SurveyRecord[] = [];
  try {
    const raw = localStorage.getItem("safe_school_survey_history");
    if (raw) surveyHistory = JSON.parse(raw);
  } catch { }

  let submittedCodes: string[] = [];
  try {
    const raw = localStorage.getItem("safe_school_submitted_codes");
    if (raw) submittedCodes = JSON.parse(raw);
  } catch { }

  const currentMood = localStorage.getItem("safe_school_user_mood");
  const currentMoodTime = localStorage.getItem("safe_school_user_mood_time");

  return {
    moodHistory,
    currentMood,
    currentMoodTime,
    surveyHistory,
    cbtJournals,
    submittedCodes
  };
}

/**
 * Ghi đè / Cập nhật dữ liệu từ đám mây xuống bộ nhớ máy tính này
 */
export function applyStudentLocalPayload(payload: Partial<StudentSyncPayload>) {
  if (Array.isArray(payload.moodHistory)) {
    localStorage.setItem("wellness_mood_history", JSON.stringify(payload.moodHistory));
  }
  if (payload.currentMood !== undefined && payload.currentMood !== null) {
    localStorage.setItem("safe_school_user_mood", payload.currentMood);
  }
  if (payload.currentMoodTime !== undefined && payload.currentMoodTime !== null) {
    localStorage.setItem("safe_school_user_mood_time", payload.currentMoodTime);
  }
  if (Array.isArray(payload.cbtJournals)) {
    localStorage.setItem("restructure_journals_cbt", JSON.stringify(payload.cbtJournals));
  }
  if (Array.isArray(payload.surveyHistory)) {
    localStorage.setItem("safe_school_survey_history", JSON.stringify(payload.surveyHistory));
  }
  if (Array.isArray(payload.submittedCodes)) {
    localStorage.setItem("safe_school_submitted_codes", JSON.stringify(payload.submittedCodes));
  }

  // Phát tín hiệu thông báo cho toàn bộ các màn hình giao diện cập nhật ngay lập tức
  window.dispatchEvent(new CustomEvent("safe_school_data_synced", { detail: payload }));
}

/**
 * Tự động đẩy dữ liệu lên đám mây gắn với mã PIN
 */
export async function pushStudentSyncToCloud(customPin?: string): Promise<{ success: boolean; message?: string; stats?: any }> {
  const pin = (customPin || localStorage.getItem("safe_school_local_pin") || "").trim();
  if (!pin || pin.length < 4) {
    return { success: false, message: "Chưa thiết lập mã PIN bảo mật." };
  }

  try {
    const payload = getStudentLocalPayload();
    const res = await fetch("/api/student/sync/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, data: payload })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem("safe_school_last_sync_time", new Date().toISOString());
      return { success: true, message: data.message, stats: data.stats };
    }
    return { success: false, message: data.error || "Không thể đồng bộ lên đám mây." };
  } catch (err: any) {
    return { success: false, message: err.message || "Lỗi kết nối máy chủ." };
  }
}

/**
 * Kéo dữ liệu từ đám mây về máy mới khi nhập mã PIN
 */
export async function pullStudentSyncFromCloud(pin: string): Promise<{ success: boolean; found: boolean; message: string; data?: any }> {
  const cleanPin = (pin || "").trim();
  if (!cleanPin || cleanPin.length < 4) {
    return { success: false, found: false, message: "Mã PIN phải từ 4 chữ số." };
  }

  try {
    const res = await fetch("/api/student/sync/pull", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: cleanPin })
    });
    const result = await res.json();
    if (res.ok && result.success) {
      if (result.found && result.data) {
        applyStudentLocalPayload(result.data);
        localStorage.setItem("safe_school_local_pin", cleanPin);
        sessionStorage.setItem("safe_school_pin_verified", "true");
        localStorage.setItem("safe_school_last_sync_time", result.updatedAt || new Date().toISOString());
        return {
          success: true,
          found: true,
          message: result.message,
          data: result.data
        };
      }
      return {
        success: true,
        found: false,
        message: result.message || "Không tìm thấy dữ liệu đồng bộ cho mã PIN này."
      };
    }
    return { success: false, found: false, message: result.error || "Lỗi khi khôi phục dữ liệu." };
  } catch (err: any) {
    return { success: false, found: false, message: err.message || "Lỗi kết nối máy chủ." };
  }
}

/**
 * Ghi nhận một kết quả khảo sát mới và tự động đồng bộ
 */
export function recordSurveyResult(survey: Omit<SurveyRecord, "id" | "date">) {
  const now = new Date();
  const dateStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " ngày " + now.toLocaleDateString("vi-VN");
  
  const newEntry: SurveyRecord = {
    ...survey,
    id: Date.now().toString(),
    date: dateStr
  };

  let history: SurveyRecord[] = [];
  try {
    const raw = localStorage.getItem("safe_school_survey_history");
    if (raw) history = JSON.parse(raw);
  } catch { }

  const updated = [newEntry, ...history];
  localStorage.setItem("safe_school_survey_history", JSON.stringify(updated));

  // Kích hoạt đồng bộ đám mây ngầm nếu đã bật mã PIN
  pushStudentSyncToCloud().catch(() => {});

  window.dispatchEvent(new CustomEvent("safe_school_data_synced", { detail: { surveyHistory: updated } }));
  return newEntry;
}

/**
 * Ghi nhận mã đơn tố giác đã nộp để không bị quên khi sang máy khác
 */
export function recordSubmittedReportCode(code: string) {
  if (!code) return;
  const cleanCode = code.trim().toUpperCase();
  let codes: string[] = [];
  try {
    const raw = localStorage.getItem("safe_school_submitted_codes");
    if (raw) codes = JSON.parse(raw);
  } catch { }

  if (!codes.includes(cleanCode)) {
    const updated = [cleanCode, ...codes];
    localStorage.setItem("safe_school_submitted_codes", JSON.stringify(updated));
    pushStudentSyncToCloud().catch(() => {});
  }
}
