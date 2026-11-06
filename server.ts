import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, getDocs, collection, deleteDoc } from "firebase/firestore";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Thiết lập Headers chặn bộ nhớ đệm (Anti-Caching) cho toàn bộ API để đồng bộ dữ liệu chuẩn xác nhất giữa máy tính & điện thoại
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// Initialize Gemini AI Client (Server-side)
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("Mảnh ghép quan trọng: GEMINI_API_KEY chưa được cấu hình. Trình tư vấn AI sẽ ở chế độ ngoại tuyến.");
}

import fs from "fs";
import crypto from "crypto";

// Persistent Dynamic JSON Database
interface Report {
  code: string;
  schoolName: string;
  category: string;
  title: string;
  description: string;
  date: string;
  location: string;
  evidenceText?: string;
  evidenceFiles?: { name: string; data: string; type: string }[];
  status: "Đang chờ tiếp nhận" | "Đang xử lý" | "Đang tham vấn" | "Đã giải quyết";
  responses: Array<{
    sender: "Counselor" | "Student";
    message: string;
    date: string;
  }>;
}

interface Counselor {
  email: string;
  password: string;
  name: string;
  role: string;
  school: string;
}

interface SchoolSettings {
  schoolName: string;
  hotline?: string;
  counselingRoom?: string;
  consultationHours?: string;
  principalHotline?: string;
  bannerNotice?: string;
  handoverDate?: string;
  handoverNote?: string;
}

export interface StudentSyncRecord {
  pinHash: string;
  data: {
    moodHistory?: any[];
    currentMood?: string | null;
    currentMoodTime?: string | null;
    surveyHistory?: any[];
    cbtJournals?: any[];
    submittedCodes?: string[];
  };
  updatedAt: string;
}

interface SystemState {
  isInitialized: boolean;
  schoolName: string;
  schools: string[];
  counselors: Counselor[];
  reports: Report[];
  schoolSettings?: Record<string, SchoolSettings>;
  studentSyncRecords?: Record<string, StudentSyncRecord>;
}

const DB_FILE = path.join(process.cwd(), "system_db.json");

// Default initial state is UNINITIALIZED (empty reports, empty counselors)
let systemState: SystemState = {
  isInitialized: false,
  schoolName: "",
  schools: [],
  counselors: [],
  reports: [],
  schoolSettings: {}
};

// Global memory cache of deleted report codes to prevent recreating them on subsequent sync pulls
const deletedReportCodes = new Set<string>();

// --- Firebase Cloud Database Setup ---
let db: any = null;
let useFirebase = false;

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    useFirebase = true;
    console.log("[SafeZone Cloud] Firebase & Firestore connected successfully!");
  } else {
    console.warn("[SafeZone Cloud] firebase-applet-config.json not found. Using local server state only.");
  }
} catch (err) {
  console.error("[SafeZone Cloud] Failed to initialize Firestore database:", err);
}

// Helper: Synchronize memory state from Cloud Firestore
async function syncFromCloud() {
  if (!useFirebase || !db) return;
  try {
    const configDoc = await getDoc(doc(db, "system", "config"));
    if (configDoc.exists()) {
      const configData = configDoc.data();
      systemState.isInitialized = configData.isInitialized ?? false;
      systemState.schoolName = configData.schoolName ?? "";
      systemState.schools = configData.schools ?? [];
      if (configData.schoolSettings) {
        systemState.schoolSettings = configData.schoolSettings;
      }
    }

    // Load dynamic Counselor list
    const counselorsCol = await getDocs(collection(db, "counselors"));
    const tempCounselors: Counselor[] = [];
    counselorsCol.forEach((docSnap) => {
      tempCounselors.push(docSnap.data() as Counselor);
    });
    if (counselorsCol.size > 0 || configDoc.exists()) {
      // Direct assignment only if clean Firestore backup exists
      systemState.counselors = tempCounselors;
    }

    // Load student anonymous reports
    const reportsCol = await getDocs(collection(db, "reports"));
    const tempReports: Report[] = [];
    reportsCol.forEach((docSnap) => {
      tempReports.push(docSnap.data() as Report);
    });
    if (reportsCol.size > 0 || configDoc.exists()) {
      // Intelligently merge tempReports with systemState.reports to protect newly submitted reports in RAM
      const mergedReports = [...systemState.reports];

      tempReports.forEach((cloudReport) => {
        const uppercaseCode = cloudReport.code.toUpperCase();
        if (deletedReportCodes.has(uppercaseCode)) {
          return;
        }

        const idx = mergedReports.findIndex(r => r.code.toUpperCase() === uppercaseCode);
        if (idx === -1) {
          mergedReports.push(cloudReport);
        } else {
          const memReport = mergedReports[idx];
          const cloudMsgCount = cloudReport.responses?.length || 0;
          const memMsgCount = memReport.responses?.length || 0;

          if (cloudMsgCount > memMsgCount) {
            mergedReports[idx] = cloudReport;
          } else if (cloudMsgCount === memMsgCount) {
            mergedReports[idx] = {
              ...memReport,
              status: cloudReport.status,
              evidenceFiles: cloudReport.evidenceFiles || memReport.evidenceFiles
            };
          }
        }
      });

      // Filter out deleted or non-existent reports, but keep fresh memory-only reports (within 20s)
      systemState.reports = mergedReports.filter(memReport => {
        const uppercaseCode = memReport.code.toUpperCase();
        if (deletedReportCodes.has(uppercaseCode)) {
          return false;
        }
        const inCloud = tempReports.some(cloudReport => cloudReport.code.toUpperCase() === uppercaseCode);
        if (inCloud) {
          return true;
        }
        try {
          const createdAt = new Date(memReport.date).getTime();
          const ageMs = Date.now() - createdAt;
          if (ageMs < 20000) {
            return true; // Safe window for newly submitted reports
          }
        } catch {
          // Fallback
        }
        return false;
      });
    }

    // Load Student Sync Records from Firestore
    try {
      const studentSyncCol = await getDocs(collection(db, "student_sync"));
      if (studentSyncCol.size > 0) {
        if (!systemState.studentSyncRecords) systemState.studentSyncRecords = {};
        studentSyncCol.forEach((docSnap) => {
          const rec = docSnap.data() as StudentSyncRecord;
          if (rec && rec.pinHash) {
            systemState.studentSyncRecords![rec.pinHash] = rec;
          }
        });
      }
    } catch (e) {
      console.warn("[SafeZone CLOUD] Could not load student_sync collection:", e);
    }

    console.log(`[SafeZone CLOUD] Synchronized state with cloud Firestore. Counselors: ${systemState.counselors.length}, Reports: ${systemState.reports.length}`);
  } catch (err) {
    console.error("[SafeZone CLOUD] Reading data from Firestore failed:", err);
  }
}

// Helper: Synchronize memory state into Cloud Firestore (Asynchronous)
async function syncToCloud() {
  if (!useFirebase || !db) return;
  try {
    // 1. Persist System Config & School Settings
    await setDoc(doc(db, "system", "config"), {
      isInitialized: systemState.isInitialized,
      schoolName: systemState.schoolName,
      schools: systemState.schools,
      schoolSettings: systemState.schoolSettings || {}
    });

    // 2. Clear old deleted counselors
    const counselorsCol = await getDocs(collection(db, "counselors"));
    const deleteCounselorPromises: Promise<any>[] = [];
    counselorsCol.forEach((docSnap) => {
      const emailId = docSnap.id;
      const cEmail = emailId.replace(/_dot_/g, ".").toLowerCase();
      const stillActive = systemState.counselors.some(c => c.email.toLowerCase() === cEmail);
      if (!stillActive) {
        deleteCounselorPromises.push(deleteDoc(doc(db, "counselors", emailId)));
      }
    });
    await Promise.all(deleteCounselorPromises);

    // Write all active counselors to Firestore
    const writeCounselorPromises = systemState.counselors.map((c) => {
      const safeId = c.email.toLowerCase().replace(/\./g, "_dot_");
      return setDoc(doc(db, "counselors", safeId), c);
    });
    await Promise.all(writeCounselorPromises);

    // 3. Clear old deleted/reset reports
    const reportsCol = await getDocs(collection(db, "reports"));
    const deleteReportPromises: Promise<any>[] = [];
    reportsCol.forEach((docSnap) => {
      const codeId = docSnap.id;
      const rCode = codeId.replace(/_dash_/g, "-").toUpperCase();
      const stillActive = systemState.reports.some(r => r.code.toUpperCase() === rCode);
      if (!stillActive) {
        deleteReportPromises.push(deleteDoc(doc(db, "reports", codeId)));
      }
    });
    await Promise.all(deleteReportPromises);

    // Write all current reports to Firestore
    const writeReportPromises = systemState.reports.map((r) => {
      const safeId = r.code.toUpperCase().replace(/-/g, "_dash_");
      return setDoc(doc(db, "reports", safeId), r);
    });
    await Promise.all(writeReportPromises);

    // 4. Write Student Sync Records to Firestore
    if (systemState.studentSyncRecords) {
      const syncPromises = Object.entries(systemState.studentSyncRecords).map(([pinHash, record]) => {
        return setDoc(doc(db, "student_sync", pinHash), record);
      });
      await Promise.all(syncPromises);
    }

    console.log(`[SafeZone CLOUD] Successfully updated database snapshot in Cloud Firestore.`);
  } catch (err) {
    console.error("[SafeZone CLOUD] Writing state to Firestore failed:", err);
  }
}

// Load saved configuration from file on startup if it exists
try {
  if (fs.existsSync(DB_FILE)) {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    systemState = JSON.parse(data);
    console.log("[SafeZone System] Loaded local system_db.json baseline.");
  }
} catch (err) {
  console.error("[SafeZone System] Error reading local state database:", err);
}

// Run bootstrap synchronization with Cloud Firestore asynchronously
syncFromCloud().catch(err => console.error("Initial syncFromCloud failed:", err));

async function persistState() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(systemState, null, 2), "utf-8");
    // Trigger and wait for cloud synchronization to prevent race conditions during immediate fetches
    await syncToCloud();
  } catch (err) {
    console.error("[SafeZone System] Error saving state to storage file:", err);
  }
}

// --- API Endpoints ---

// Download User Guide DOCX
app.get(["/api/download/guide", "/download-guide"], (req, res) => {
  const filePath = path.join(process.cwd(), "public", "Huong_Dan_Su_Dung_SafeZone.docx");
  if (fs.existsSync(filePath)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Disposition", 'attachment; filename="Huong_Dan_Su_Dung_SafeZone.docx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    return res.sendFile(filePath);
  } else {
    return res.status(404).json({ error: "Tài liệu hướng dẫn chưa được khởi tạo." });
  }
});

// Download QA & 98.2% Explanation DOCX
app.get(["/api/download/qa", "/download-qa"], (req, res) => {
  const filePath = path.join(process.cwd(), "public", "Giai_Thich_Chi_So_Va_Cau_Hoi_Phan_Bien_SafeZone.docx");
  if (fs.existsSync(filePath)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Disposition", 'attachment; filename="Giai_Thich_Chi_So_Va_Cau_Hoi_Phan_Bien_SafeZone.docx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    return res.sendFile(filePath);
  } else {
    return res.status(404).json({ error: "Tài liệu giải thích chỉ số & câu hỏi phản biện chưa được khởi tạo." });
  }
});

// A. Get System Status & Active Schools
app.get("/api/system/status", async (req, res) => {
  await syncFromCloud();
  const currentSchool = systemState.schoolName || "Tất cả các Trường học SafeZone";
  const currentSettings = systemState.schoolSettings?.[currentSchool] || {
    schoolName: currentSchool,
    counselingRoom: "Phòng Tham Vấn Tâm Lý Học Đường",
    hotline: "0243.88x.xxx",
    consultationHours: "Thứ 2 - Thứ 6 (Tiết 5 & Sau giờ học)",
    principalHotline: "Khẩn cấp 24/7",
    bannerNotice: "Không gian lắng nghe an toàn, bảo mật tuyệt đối 100% dành riêng cho học sinh của trường."
  };

  res.json({
    isInitialized: systemState.isInitialized,
    schoolName: systemState.schoolName,
    schools: systemState.schools,
    counselorsCount: systemState.counselors.length,
    schoolSettings: currentSettings,
    allSchoolSettings: systemState.schoolSettings || {}
  });
});

// B. Setup System (Mock or Custom)
app.post("/api/system/setup", async (req, res) => {
  try {
    const { mode, schoolName, adminName, adminEmail, adminPassword, otherCounselors, counselingRoom, hotline, consultationHours, principalHotline } = req.body;

    if (mode === "mock") {
      // Load standard mock data
      systemState = {
        isInitialized: true,
        schoolName: "Tất cả các Trường học SafeZone",
        schools: [
          "THPT Chuyên Hà Nội - Amsterdam",
          "THPT Phan Đình Phùng",
          "THPT Chu Văn An",
          "THPT Kim Liên",
          "THPT Việt Đức"
        ],
        counselors: [
          {
            email: "admin.counselor@school.edu.vn",
            password: "admin123@safe",
            name: "Thầy Nguyễn Minh Triết",
            role: "Admin",
            school: "Tất cả"
          },
          {
            email: "amsterdam.counselor@school.edu.vn",
            password: "ams123@safe",
            name: "Cô Trịnh Phương Linh",
            role: "Counselor",
            school: "THPT Chuyên Hà Nội - Amsterdam"
          },
          {
            email: "pdp.counselor@school.edu.vn",
            password: "pdp123@safe",
            name: "Thầy Vũ Hoàng Hải",
            role: "Counselor",
            school: "THPT Phan Đình Phùng"
          },
          {
            email: "cva.counselor@school.edu.vn",
            password: "cva123@safe",
            name: "Cô Phạm Mai Chi",
            role: "Counselor",
            school: "THPT Chu Văn An"
          },
          {
            email: "kl.counselor@school.edu.vn",
            password: "kl123@safe",
            name: "Thầy Nguyễn Tiến Dũng",
            role: "Counselor",
            school: "THPT Kim Liên"
          },
          {
            email: "vd.counselor@school.edu.vn",
            password: "vd123@safe",
            name: "Cô Lê Mỹ Hạnh",
            role: "Counselor",
            school: "THPT Việt Đức"
          }
        ],
        reports: [
          {
            code: "SA-1001",
            schoolName: "THPT Chuyên Hà Nội - Amsterdam",
            category: "Bạo lực trắng (Cô lập, đồn thổi dịch chuyển)",
            title: "Bị cả lớp tẩy chay và lập nhóm chat bêu rếu ẩn danh",
            description: "Sau khi em từ chối cho các bạn chép bài thi, các bạn trong nhóm trưởng lớp đã chụp ảnh dìm của em và chia sẻ khắp các nhóm chat riêng. Hiện tại cả lớp không ai nói chuyện với em, khi em bước vào lớp mọi người đều im lặng cười cợt.",
            date: "2026-06-02",
            location: "Trong lớp học và các nhóm chat trực tuyến",
            evidenceText: "Có lưu lại ảnh chụp màn hình nhóm chat 'Anti-M'",
            status: "Đang tham vấn",
            responses: [
              {
                sender: "Counselor",
                message: "Chào em, Thầy/Cô ban tâm lý trường Amsterdam đã nhận được báo cáo của em. Thầy cô hiểu em đang rất cô đơn và áp lực. Hành vi tự ý lập nhóm bôi nhọ là bạo lực trắng nguy hiểm. Chiều mai, em có thể ghé Phòng Tâm lý học đường (tầng 2 nhà B) vào tiết 5 để tụi mình trò chuyện an toàn nhé. Thầy cô cam kết bảo mật danh tính tuyệt đối.",
                date: "2026-06-03T09:00:00Z"
              },
              {
                sender: "Student",
                message: "Dạ em cảm ơn thầy cô ạ, chiều mai em sẽ đến. Em rất sợ các bạn phát hiện.",
                date: "2026-06-03T11:20:00Z"
              },
              {
                sender: "Counselor",
                message: "Em yên tâm tuyệt đối nhé, phòng tâm lý có lối đi riêng và các bạn sẽ nghĩ em chỉ hỗ trợ thầy cô một số công việc thông thường. Hãy tự tin lên, em đã hành động đúng đắn.",
                date: "2026-06-03T14:15:00Z"
              }
            ]
          },
          {
            code: "SA-1002",
            schoolName: "THPT Phan Đình Phùng",
            category: "Bạo lực mạng (Cyberbullying & Spreading)",
            title: "Bị giả mạo tài khoản Facebook đăng tải thông tin vu khống",
            description: "Có ai đó đã lập một trang cá nhân giống hệt em, sử dụng ảnh của em rồi nhắn tin gạ tình, lừa đảo khắp nơi. Điều này làm ảnh hưởng nghiêm trọng danh dự của em, em sợ đến trường.",
            date: "2026-05-28",
            location: "Mạng xã hội Facebook",
            evidenceText: "Link tài khoản giả mạo: facebook.com/profile.php?id=992837",
            status: "Đã giải quyết",
            responses: [
              {
                sender: "Counselor",
                message: "Ban giám hiệu và ban tư vấn số Phan Đình Phùng đã làm việc trực tiếp với Đoàn trường và cơ quan công nghệ để báo cáo vi phạm tài khoản giả mạo, hiện tài khoản kia đã bị vô hiệu hóa hoàn toàn. Chúng tôi cũng đã tuyên truyền điều 15 trong Bộ quy tắc ứng xử số tại lớp của em. Em có thể yên tâm học tập nhé.",
                date: "2026-05-29T10:00:00Z"
              },
              {
                sender: "Student",
                message: "Em xin chân thành cảm ơn thầy cô ạ. Tài khoản kia đã biến mất và các bạn đã hiểu ra câu chuyện.",
                date: "2026-05-30T08:00:00Z"
              }
            ]
          }
        ],
        schoolSettings: {}
      };
    } else {
      // Custom clean setup for a specific sovereign school
      if (!schoolName || !adminName || !adminEmail || !adminPassword) {
        return res.status(400).json({ error: "Thiếu thông tin thiết lập bắt buộc." });
      }

      const cleanSchool = schoolName.trim();
      const activeCounselors: Counselor[] = [
        {
          email: adminEmail.trim(),
          password: adminPassword,
          name: adminName.trim(),
          role: "Admin",
          school: cleanSchool
        }
      ];

      if (otherCounselors && Array.isArray(otherCounselors)) {
        otherCounselors.forEach((c: any) => {
          if (c.email && c.name) {
            activeCounselors.push({
              email: c.email.trim(),
              password: c.password || "safe123@counselor",
              name: c.name.trim(),
              role: "Counselor",
              school: cleanSchool
            });
          }
        });
      }

      const customSettings: SchoolSettings = {
        schoolName: cleanSchool,
        counselingRoom: counselingRoom?.trim() || "Phòng Tư Vấn Tâm Lý Học Đường",
        hotline: hotline?.trim() || "028.3835.xxxx",
        consultationHours: consultationHours?.trim() || "Thứ 2 - Thứ 6 (Giờ hành chính & Sau giờ học)",
        principalHotline: principalHotline?.trim() || "Đường dây nóng Khẩn cấp BGH 24/7",
        bannerNotice: `Hệ thống hỗ trợ tâm lý & bảo vệ học sinh chính thức của ${cleanSchool}`,
        handoverDate: new Date().toISOString()
      };

      systemState = {
        isInitialized: true,
        schoolName: cleanSchool, // Trường chủ quản độc lập
        schools: [cleanSchool],
        counselors: activeCounselors,
        reports: [], // Khởi tạo dữ liệu sạch 100% cho trường mới
        schoolSettings: {
          [cleanSchool]: customSettings
        }
      };
    }

    await persistState();
    res.json({ success: true, message: "Hệ thống đã khởi tạo cấu hình làm chủ trường học độc lập thành công!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Master Distributor Account (Chỉ tài khoản này mới có quyền phân phối & bàn giao cho nhiều trường)
export const MASTER_DISTRIBUTOR_EMAIL = "c3ndqminh.pdl@hue.edu.vn";

// B2. Handover School Ownership (Chuyển giao quyền làm chủ cho trường khác)
app.post("/api/system/handover", async (req, res) => {
  try {
    await syncFromCloud();
    const { 
      initiatorEmail, // Email của người thực hiện thao tác bàn giao
      newSchoolName, 
      newAdminName, 
      newAdminEmail, 
      newAdminPassword, 
      wipeOldData,
      counselingRoom,
      hotline,
      consultationHours,
      principalHotline,
      handoverNote
    } = req.body;

    // 1. Kiểm tra đặc quyền tối cao của Master Distributor: CHỈ c3ndqminh.pdl@hue.edu.vn mới được bàn giao!
    const cleanInitiatorEmail = (initiatorEmail || "").trim().toLowerCase();
    if (cleanInitiatorEmail !== MASTER_DISTRIBUTOR_EMAIL.toLowerCase()) {
      return res.status(403).json({ 
        error: `Từ chối quyền hạn: Chỉ tài khoản Master (${MASTER_DISTRIBUTOR_EMAIL}) mới có quyền phân phối và bàn giao ứng dụng cho các trường khác. Trường sau khi nhận bàn giao không được phép bàn giao tiếp.` 
      });
    }

    if (!newSchoolName || !newAdminName || !newAdminEmail || !newAdminPassword) {
      return res.status(400).json({ error: "Vui lòng nhập đủ Tên trường mới, Họ tên Thầy/Cô quản trị, Email và Mật khẩu bàn giao." });
    }

    const cleanSchoolName = newSchoolName.trim();
    const cleanAdminEmail = newAdminEmail.trim();

    // 2. Khởi tạo tài khoản Quản trị cho trường học mới tiếp nhận
    const newMasterAdmin: Counselor = {
      email: cleanAdminEmail,
      password: newAdminPassword,
      name: newAdminName.trim(),
      role: "Admin",
      school: cleanSchoolName
    };

    const newSettings: SchoolSettings = {
      schoolName: cleanSchoolName,
      counselingRoom: counselingRoom?.trim() || "Phòng Tư Vấn Tâm Lý Học Đường",
      hotline: hotline?.trim() || "028.3835.xxxx",
      consultationHours: consultationHours?.trim() || "Thứ 2 - Thứ 6 (Giờ hành chính & Sau giờ học)",
      principalHotline: principalHotline?.trim() || "Đường dây nóng Khẩn cấp BGH 24/7",
      bannerNotice: `Hệ thống hỗ trợ tâm lý & bảo vệ học sinh chính thức của ${cleanSchoolName}`,
      handoverDate: new Date().toISOString(),
      handoverNote: handoverNote?.trim() || `Được phân phối và bàn giao bởi Master Admin (${MASTER_DISTRIBUTOR_EMAIL})`
    };

    // Đảm bảo trường mới được thêm vào danh sách trường của hệ thống
    systemState.schools = Array.from(new Set([...(systemState.schools || []), cleanSchoolName]));

    // Đảm bảo Master Distributor luôn được bảo toàn tài khoản với trường gốc
    const masterAccount = systemState.counselors.find(c => c.email.toLowerCase() === MASTER_DISTRIBUTOR_EMAIL.toLowerCase()) || {
      email: MASTER_DISTRIBUTOR_EMAIL,
      password: "admin123@safe",
      name: "Thầy Nguyễn Đắc Quang Minh",
      role: "Admin" as const,
      school: "Trường THPT Phan Đăng Lưu"
    };

    // Thêm/cập nhật admin của trường mới và giữ tài khoản của Master
    const otherCounselors = systemState.counselors.filter(c => 
      c.email.toLowerCase() !== cleanAdminEmail.toLowerCase() && 
      c.email.toLowerCase() !== MASTER_DISTRIBUTOR_EMAIL.toLowerCase()
    );

    systemState.counselors = [
      masterAccount,
      newMasterAdmin,
      ...otherCounselors
    ];

    systemState.isInitialized = true;
    if (!systemState.schoolSettings) {
      systemState.schoolSettings = {};
    }
    systemState.schoolSettings[cleanSchoolName] = newSettings;

    // Nếu chọn xóa sạch dữ liệu cho trường mới (bắt đầu trắng cho trường mới tiếp nhận)
    if (wipeOldData) {
      // Xóa các báo cáo cũ nếu có cùng tên trường mới để đảm bảo dữ liệu mới sạch 100%
      systemState.reports = systemState.reports.filter(r => r.schoolName?.trim().toLowerCase() !== cleanSchoolName.toLowerCase());
    }

    await persistState();
    res.json({
      success: true,
      message: `Đã bàn giao và phân quyền làm chủ độc lập cho trường "${cleanSchoolName}" thành công!`,
      schoolName: cleanSchoolName,
      newAdmin: {
        email: cleanAdminEmail,
        name: newMasterAdmin.name,
        role: "Admin",
        school: cleanSchoolName
      },
      schoolSettings: newSettings
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// B3. Get / Update School Settings (Cấu hình thông tin phòng tư vấn & đường dây nóng của trường)
app.get("/api/admin/school-settings", async (req, res) => {
  await syncFromCloud();
  const school = (req.query.school as string) || systemState.schoolName;
  const settings = systemState.schoolSettings?.[school] || {
    schoolName: school,
    counselingRoom: "Phòng Tham Vấn Tâm Lý Học Đường",
    hotline: "0243.88x.xxx",
    consultationHours: "Thứ 2 - Thứ 6 (Tiết 5 & Sau giờ học)",
    principalHotline: "Khẩn cấp 24/7",
    bannerNotice: "Không gian lắng nghe an toàn, bảo mật tuyệt đối 100% dành riêng cho học sinh của trường."
  };
  res.json(settings);
});

app.post("/api/admin/school-settings", async (req, res) => {
  try {
    await syncFromCloud();
    const { schoolName, counselingRoom, hotline, consultationHours, principalHotline, bannerNotice } = req.body;
    const targetSchool = (schoolName || systemState.schoolName || "").trim();
    if (!targetSchool) {
      return res.status(400).json({ error: "Không xác định được tên trường để cập nhật." });
    }

    if (!systemState.schoolSettings) {
      systemState.schoolSettings = {};
    }

    if (targetSchool !== "Tất cả" && targetSchool !== "Tất cả các Trường học SafeZone" && !systemState.schools.includes(targetSchool)) {
      systemState.schools.push(targetSchool);
    }

    systemState.schoolSettings[targetSchool] = {
      schoolName: targetSchool,
      counselingRoom: counselingRoom?.trim() || systemState.schoolSettings[targetSchool]?.counselingRoom || "Phòng Tư Vấn Tâm Lý Học Đường",
      hotline: hotline?.trim() || "028.3835.xxxx",
      consultationHours: consultationHours?.trim() || systemState.schoolSettings[targetSchool]?.consultationHours || "Thứ 2 - Thứ 6 (Giờ hành chính)",
      principalHotline: principalHotline?.trim() || systemState.schoolSettings[targetSchool]?.principalHotline || "Đường dây nóng Khẩn cấp BGH 24/7",
      bannerNotice: bannerNotice?.trim() || systemState.schoolSettings[targetSchool]?.bannerNotice || `Hệ thống hỗ trợ tâm lý & bảo vệ học sinh chính thức của ${targetSchool}`
    };

    await persistState();
    res.json({ success: true, message: "Đã cập nhật thông tin phòng tư vấn học đường thành công!", settings: systemState.schoolSettings[targetSchool], allSchoolSettings: systemState.schoolSettings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// C. Reset system to Uninitialized (Wipe all)
app.post("/api/system/reset", async (req, res) => {
  systemState = {
    isInitialized: false,
    schoolName: "",
    schools: [],
    counselors: [],
    reports: [],
    schoolSettings: {}
  };
  await persistState();
  res.json({ success: true, message: "Hệ thống đã được xóa trắng và quay về màn hình khởi sinh thiết lập lại phân quyền!" });
});

// D. List dynamic counselors registered with School Isolation
app.get("/api/admin/counselors", async (req, res) => {
  await syncFromCloud();
  const requesterEmail = (req.query.email as string)?.trim().toLowerCase();
  const schoolFilter = (req.query.school as string)?.trim();
  let targetCounselors = systemState.counselors;

  // If counselor email provided, filter by that counselor's assigned school
  if (requesterEmail) {
    const counselor = systemState.counselors.find(c => c.email.toLowerCase() === requesterEmail);
    if (counselor && counselor.school && counselor.school !== "Tất cả") {
      targetCounselors = targetCounselors.filter(
        c => c.school.toLowerCase() === counselor.school.toLowerCase()
      );
    }
  } else if (schoolFilter && schoolFilter !== "Tất cả") {
    targetCounselors = targetCounselors.filter(
      c => c.school.toLowerCase() === schoolFilter.toLowerCase()
    );
  } else if (systemState.schoolName && systemState.schoolName !== "Tất cả các Trường học SafeZone" && systemState.schools.length <= 1) {
    targetCounselors = targetCounselors.filter(
      c => c.school.toLowerCase() === systemState.schoolName.trim().toLowerCase()
    );
  }

  const safeCounselors = targetCounselors.map(c => {
    const { password, ...safeData } = c;
    return safeData;
  });
  
  res.json(safeCounselors);
});

// E. Login counselor checking dynamic list
app.post("/api/admin/login", async (req, res) => {
  await syncFromCloud();
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Thiếu thông tin email hoặc mật khẩu." });
  }
  const found = systemState.counselors.find(
    c => c.email.toLowerCase() === email.trim().toLowerCase() && c.password === password
  );
  if (found) {
    res.json({ success: true, counselor: found });
  } else {
    res.status(401).json({ error: "Thanh tra thất bại. Email hoặc mật khẩu của giáo viên không khớp hoặc chưa được cấp quyền." });
  }
});

// F. Create Counselor profile dynamically (via Admin / Co-Admin role)
app.post("/api/admin/counselors/add", async (req, res) => {
  try {
    await syncFromCloud();
    const { email, password, name, school, role } = req.body;
    if (!email || !password || !name || !school) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ Name, Email, Password, School cho tài khoản giáo sư mới." });
    }
    
    // Check duplication
    const duplicate = systemState.counselors.some(c => c.email.toLowerCase() === email.trim().toLowerCase());
    if (duplicate) {
      return res.status(400).json({ error: "Địa chỉ email giáo sư này đã được cấp quyền trước đó!" });
    }

    const assignedRole = role === "Co-Admin" ? "Co-Admin" : "Counselor";

    const newC: Counselor = {
      email: email.trim(),
      password,
      name: name.trim(),
      role: assignedRole,
      school: school.trim()
    };

    systemState.counselors.push(newC);
    
    // Add school to global scope list if not exists
    if (school !== "Tất cả" && !systemState.schools.includes(school.trim())) {
      systemState.schools.push(school.trim());
    }

    await persistState();
    res.status(201).json({ success: true, counselors: systemState.counselors });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// G. Revoke Counselor access (for Admin & Co-Admin users)
app.post("/api/admin/counselors/delete", async (req, res) => {
  try {
    await syncFromCloud();
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Thiếu email tài khoản cần thu hồi quyền." });
    }

    const targetIndex = systemState.counselors.findIndex(c => c.email.toLowerCase() === email.trim().toLowerCase());
    if (targetIndex === -1) {
      return res.status(404).json({ error: "Không tìm thấy tài khoản giáo sư cần thu hồi." });
    }

    const target = systemState.counselors[targetIndex];
    if (target.role === "Admin") {
      const adminCount = systemState.counselors.filter(c => c.role === "Admin").length;
      if (adminCount <= 1) {
        return res.status(400).json({ error: "Không thể thu hồi tài khoản Quản trị viên tối cao duy nhất của hệ thống." });
      }
    }

    systemState.counselors.splice(targetIndex, 1);
    await persistState();
    res.json({ success: true, message: "Đã thu hồi đặc quyền truy cập của giáo viên thành công!", counselors: systemState.counselors });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// H. Revoke/Delete a school from the system
app.post("/api/admin/schools/delete", async (req, res) => {
  try {
    await syncFromCloud();
    const { schoolName } = req.body;
    if (!schoolName) {
      return res.status(400).json({ error: "Thiếu tên trường cần xóa." });
    }

    const targetIndex = systemState.schools.findIndex(s => s.toLowerCase() === schoolName.trim().toLowerCase());
    if (targetIndex === -1) {
      return res.status(404).json({ error: "Không tìm thấy trường này trong hệ thống." });
    }

    systemState.schools.splice(targetIndex, 1);
    
    // Bắt buộc lưu vào Firestore để đồng bộ
    await persistState();
    res.json({ success: true, message: "Đã xóa trường học thành công!", schools: systemState.schools });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 1. Submit an Anonymous Report
app.post("/api/reports", async (req, res) => {
  try {
    await syncFromCloud();
    const { schoolName, category, title, description, location, evidenceText, evidenceFiles } = req.body;
    
    if (!schoolName || !category || !title || !description) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ các thông tin bắt buộc." });
    }

    // Generate a secure anonymous tracking code (e.g., SA-XXXX)
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `SA-${randomCode}`;

    const newReport: Report = {
      code: trackingCode,
      schoolName,
      category,
      title,
      description,
      date: new Date().toISOString(),
      location: location || "Không xác định",
      evidenceText: evidenceText || "",
      evidenceFiles: evidenceFiles || [],
      status: "Đang chờ tiếp nhận",
      responses: [
        {
          sender: "Counselor",
          message: `Cảm ơn em đã gửi báo cáo ẩn danh đến Ban Tư Vấn Tâm Lý trường **${schoolName}**. Mã tra cứu bí mật của em là: **${trackingCode}**. Hãy lưu giữ lại mã này để theo dõi tiến trình hỗ trợ và trao đổi ẩn danh tiếp theo với Hội đồng tâm lý/nhà trường. Thầy cô bảo vệ danh tính của em an toàn tuyệt đối.`,
          date: new Date().toISOString()
        }
      ]
    };

    systemState.reports.push(newReport);
    await persistState();
    res.status(201).json({ success: true, code: trackingCode, report: newReport });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Track an Anonymous Report via Tracking Code
app.get("/api/reports/:code", async (req, res) => {
  await syncFromCloud();
  const { code } = req.params;
  const report = systemState.reports.find(r => r.code.toUpperCase() === code.trim().toUpperCase());
  if (!report) {
    return res.status(404).json({ error: "Mã tra cứu không tồn tại hoặc không chính xác." });
  }
  res.json(report);
});

// 3. Send anonymous reply inside a report thread
app.post("/api/reports/:code/messages", async (req, res) => {
  await syncFromCloud();
  const { code } = req.params;
  const { message, sender } = req.body; // sender: "Student" or "Counselor"

  if (!message || !sender) {
    return res.status(400).json({ error: "Tin nhắn và vai trò không hợp lệ." });
  }

  const report = systemState.reports.find(r => r.code.toUpperCase() === code.trim().toUpperCase());
  if (!report) {
    return res.status(404).json({ error: "Mã tra cứu không tồn tại." });
  }

  // Add the message
  report.responses.push({
    sender,
    message,
    date: new Date().toISOString()
  });

  // If counselor replies, we can change status to "Đang xử lý" or keep it.
  if (sender === "Counselor" && report.status === "Đang chờ tiếp nhận") {
    report.status = "Đang xử lý";
  }

  await persistState();
  res.json({ success: true, responses: report.responses, status: report.status });
});

// 4. Retrieve reports with Strict School Isolation (Counselor View Dashboard)
// NGUYÊN TẮC BẢO MẬT & ĐẠO ĐỨC TƯ VẤN:
// - Mỗi trường học hoàn toàn độc lập, tuyệt đối không ai (kể cả tài khoản Master Distributor) được xem báo cáo của trường khác.
// - Bất kỳ tài khoản nào đăng nhập chỉ xem được đúng hồ sơ học sinh thuộc trường được phân công của mình.
app.get("/api/admin/reports", async (req, res) => {
  await syncFromCloud();
  const requesterEmail = (req.query.email as string)?.trim().toLowerCase();
  const schoolFilter = (req.query.school as string)?.trim();

  // 1. Xác định trường được gán của tài khoản đang truy vấn
  if (requesterEmail) {
    const counselor = systemState.counselors.find(c => c.email.toLowerCase() === requesterEmail);
    if (counselor && counselor.school && counselor.school !== "Tất cả") {
      const filtered = systemState.reports.filter(
        r => r.schoolName?.trim().toLowerCase() === counselor.school.trim().toLowerCase()
      );
      return res.json(filtered);
    }
  }

  // 2. Nếu có chỉ định bộ lọc trường cụ thể
  if (schoolFilter && schoolFilter !== "Tất cả") {
    const filtered = systemState.reports.filter(
      r => r.schoolName?.trim().toLowerCase() === schoolFilter.toLowerCase()
    );
    return res.json(filtered);
  }

  // 3. Nếu là trường học độc lập đơn lẻ
  if (systemState.schoolName && systemState.schoolName !== "Tất cả các Trường học SafeZone") {
    const filtered = systemState.reports.filter(
      r => r.schoolName?.trim().toLowerCase() === systemState.schoolName.trim().toLowerCase()
    );
    return res.json(filtered);
  }

  // Mặc định trả về rỗng nếu không xác định được trường để chống rò rỉ dữ liệu xuyên trường
  res.json([]);
});

// 5. Update Report Status (for counselor interactions)
app.patch("/api/reports/:code/status", async (req, res) => {
  await syncFromCloud();
  const { code } = req.params;
  const { status } = req.body;
  
  const report = systemState.reports.find(r => r.code.toUpperCase() === code.trim().toUpperCase());
  if (!report) {
    return res.status(404).json({ error: "Mã tra cứu không tồn tại." });
  }

  report.status = status;
  await persistState();
  res.json({ success: true, status: report.status });
});

// 5.5. Delete An Anonymous Report (either student self-delete or counselor action)
app.delete("/api/reports/:code", async (req, res) => {
  try {
    await syncFromCloud();
    const { code } = req.params;
    
    const targetIdx = systemState.reports.findIndex(r => r.code.toUpperCase() === code.trim().toUpperCase());
    if (targetIdx === -1) {
      return res.status(404).json({ error: "Mã tra cứu không tồn tại để xóa." });
    }
    
    // Track deleted codes to prevent recreating them on subsequent sync pulls
    deletedReportCodes.add(code.trim().toUpperCase());
    
    systemState.reports.splice(targetIdx, 1);
    await persistState();
    res.json({ success: true, message: "Hồ sơ ẩn danh đã được xóa vĩnh viễn khỏi toàn bộ hệ thống lưu trữ!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper for intelligent merging of history arrays by ID or date
function mergeStudentHistory(arr1: any[] = [], arr2: any[] = []) {
  const map = new Map<string, any>();
  arr1.forEach(item => {
    if (!item) return;
    const key = item.id || `${item.date || ""}_${item.mood || item.title || item.negativeThought || Math.random()}`;
    map.set(key, item);
  });
  arr2.forEach(item => {
    if (!item) return;
    const key = item.id || `${item.date || ""}_${item.mood || item.title || item.negativeThought || Math.random()}`;
    map.set(key, item);
  });
  return Array.from(map.values()).sort((a, b) => {
    const tA = Number(a.id) || (a.date ? new Date(a.date).getTime() : 0) || 0;
    const tB = Number(b.id) || (b.date ? new Date(b.date).getTime() : 0) || 0;
    return tB - tA;
  });
}

// ==========================================
// 5.6. STUDENT PIN-BASED DATA SYNCHRONIZATION
// ==========================================

// PUSH: Đồng bộ Nhật ký cảm xúc, khảo sát & CBT của học sinh lên máy chủ gắn với Mã PIN bảo mật
app.post("/api/student/sync/push", async (req, res) => {
  try {
    const { pin, data } = req.body;
    if (!pin || typeof pin !== "string" || pin.trim().length < 4) {
      return res.status(400).json({ error: "Mã PIN phải từ 4 chữ số trở lên để bảo mật hồ sơ." });
    }

    const cleanPin = pin.trim();
    // Tạo khóa băm an toàn một chiều không lưu thô mã PIN
    const pinHash = crypto.createHash("sha256").update("safezone_student_salt_" + cleanPin).digest("hex");

    if (!systemState.studentSyncRecords) {
      systemState.studentSyncRecords = {};
    }

    const prev = systemState.studentSyncRecords[pinHash]?.data || {};

    // Hợp nhất dữ liệu thông minh tránh trùng lặp
    const mergedMoodHistory = mergeStudentHistory(prev.moodHistory || [], data?.moodHistory || []);
    const mergedSurveyHistory = mergeStudentHistory(prev.surveyHistory || [], data?.surveyHistory || []);
    const mergedCbtJournals = mergeStudentHistory(prev.cbtJournals || [], data?.cbtJournals || []);
    const mergedSubmittedCodes = Array.from(new Set([...(prev.submittedCodes || []), ...(data?.submittedCodes || [])]));

    const mergedData = {
      ...prev,
      ...data,
      moodHistory: mergedMoodHistory,
      surveyHistory: mergedSurveyHistory,
      cbtJournals: mergedCbtJournals,
      submittedCodes: mergedSubmittedCodes,
      currentMood: data?.currentMood !== undefined ? data.currentMood : prev.currentMood,
      currentMoodTime: data?.currentMoodTime !== undefined ? data.currentMoodTime : prev.currentMoodTime,
    };

    const record: StudentSyncRecord = {
      pinHash,
      data: mergedData,
      updatedAt: new Date().toISOString()
    };

    systemState.studentSyncRecords[pinHash] = record;
    await persistState();

    if (useFirebase && db) {
      try {
        await setDoc(doc(db, "student_sync", pinHash), record);
      } catch (e) {
        console.error("[SafeZone CLOUD] Error pushing student sync record to Firestore:", e);
      }
    }

    res.json({
      success: true,
      message: "Đã đồng bộ nhật ký cảm xúc & bài khảo sát lên đám mây gắn với mã PIN an toàn!",
      updatedAt: record.updatedAt,
      stats: {
        moodCount: mergedMoodHistory.length,
        surveyCount: mergedSurveyHistory.length,
        journalCount: mergedCbtJournals.length,
        submittedCount: mergedSubmittedCodes.length
      }
    });
  } catch (err: any) {
    console.error("Lỗi đồng bộ dữ liệu học sinh:", err);
    res.status(500).json({ error: err.message || "Lỗi đồng bộ máy chủ." });
  }
});

// PULL: Khôi phục Nhật ký cảm xúc & bài khảo sát từ máy chủ khi sang máy mới bằng Mã PIN
app.post("/api/student/sync/pull", async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || typeof pin !== "string" || pin.trim().length < 4) {
      return res.status(400).json({ error: "Vui lòng nhập đúng mã PIN (tối thiểu 4 số)." });
    }

    const cleanPin = pin.trim();
    const pinHash = crypto.createHash("sha256").update("safezone_student_salt_" + cleanPin).digest("hex");

    let record = systemState.studentSyncRecords?.[pinHash];

    // Tra cứu thêm trên Firestore Cloud nếu chưa có trong RAM
    if (!record && useFirebase && db) {
      try {
        const snap = await getDoc(doc(db, "student_sync", pinHash));
        if (snap.exists()) {
          record = snap.data() as StudentSyncRecord;
          if (!systemState.studentSyncRecords) systemState.studentSyncRecords = {};
          if (record) {
            systemState.studentSyncRecords[pinHash] = record;
          }
        }
      } catch (e) {
        console.error("[SafeZone CLOUD] Error pulling student sync from Firestore:", e);
      }
    }

    if (!record || !record.data) {
      return res.json({
        success: true,
        found: false,
        message: "Chưa có bản ghi đồng bộ nào trên máy chủ với mã PIN này. Em có thể bật đồng bộ từ máy cũ hoặc bắt đầu nhật ký mới."
      });
    }

    res.json({
      success: true,
      found: true,
      data: record.data,
      updatedAt: record.updatedAt,
      message: "Đã khôi phục thành công toàn bộ nhật ký cảm xúc, bài khảo sát & bài tập CBT của em từ đám mây!"
    });
  } catch (err: any) {
    console.error("Lỗi kéo dữ liệu học sinh:", err);
    res.status(500).json({ error: err.message || "Lỗi kết nối máy chủ." });
  }
});

// WIPE: Xóa sạch dữ liệu đám mây của học sinh khi muốn tự hủy
app.post("/api/student/sync/wipe", async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || typeof pin !== "string") {
      return res.status(400).json({ error: "Mã PIN không hợp lệ." });
    }

    const cleanPin = pin.trim();
    const pinHash = crypto.createHash("sha256").update("safezone_student_salt_" + cleanPin).digest("hex");

    if (systemState.studentSyncRecords && systemState.studentSyncRecords[pinHash]) {
      delete systemState.studentSyncRecords[pinHash];
      await persistState();
    }

    if (useFirebase && db) {
      try {
        await deleteDoc(doc(db, "student_sync", pinHash));
      } catch (e) {
        console.error("[SafeZone CLOUD] Error deleting student sync from Firestore:", e);
      }
    }

    res.json({ success: true, message: "Đã xóa toàn bộ dữ liệu đồng bộ đám mây gắn với mã PIN này thành công." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Gemini AI Psychological Support Counselor with custom CBT + PAUSE Prompt
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages } = req.body; // Expects array of [{ role: "user" | "model", message: string }]
    
    if (!aiClient) {
      return res.status(503).json({ 
        error: "Trợ lý AI đang ngoại tuyến.", 
        reply: "Chào em, hiện tại Thầy cô AI đang có một chút sự cố kết nối kỹ thuật. Tuy nhiên em hãy nhớ áp dụng bộ quy tắc **PAUSE** có sẵn trong mục Cẩm Nang để tự xoa dịu cảm xúc, hoặc gửi báo cáo ẩn danh ngay cho trường nhé!"
      });
    }

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "Thiếu nội dung câu hỏi." });
    }

    // System instruction combining Vietnamese youth tone, warmth, non-judgmental stance, CBT techniques, and PAUSE protocol instructions.
    const systemInstruction = 
      "Bạn là một chuyên gia tâm lý học trường học và cố vấn số (Digital Peer Mentor) trẻ trung, đồng cảm, ấm áp, " +
      "chuyên hỗ trợ các bạn học sinh THPT gặp khó khăn liên quan đến bạo lực học đường, bạo lực mạng, bạo lực trắng (cô lập, tẩy chay, đồn thổi ác ý) và hội chứng sợ bỏ lỡ (FOMO).\n\n" +
      "Nhiệm vụ của bạn:\n" +
      "1. Lắng nghe sâu sắc, chia sẻ chân thành, tuyệt đối KHÔNG phán xét hay đổ lỗi cho nạn nhân.\n" +
      "2. Sử dụng các kỹ thuật Tái cấu trúc nhận thức (Cognitive Restructuring - CBT) để giúp học sinh thách thức các suy nghĩ tự động cực đoan (Ví dụ: Thách thức ý nghĩ 'Mình bị tẩy chay vì mình kém cỏi' thành 'Hành vi của người khác phản ánh bản chất của họ chứ không phản ánh giá trị tối thượng của mình').\n" +
      "3. Hướng dẫn học sinh từng bước của quy trình ứng phó khủng hoảng số **PAUSE**:\n" +
      "   - **P - Pause (Dừng lại)**: Rời khỏi mạng xã hội ít nhất 30 phút, hít thở sâu 5 lần xoa dịu thần kinh phó giao cảm.\n" +
      "   - **A - Assess (Đánh giá)**: Xem xét mức độ nghiêm trọng và bản chất có chủ ý hay hiểu lầm.\n" +
      "   - **U - Understand (Hiểu bản thân)**: Nhận biết cảm xúc trên Bánh xe cảm xúc, viết ra điều tích cực riêng không thuộc thế giới ảo.\n" +
      "   - **S - Seek support (Tìm trợ giúp)**: Chia sẻ với người lớn hoặc người bạn đáng tin cậy.\n" +
      "   - **E - Empower (Trao quyền)**: Ghi lại chứng cứ, tăng cường bảo mật riêng tư, báo cáo ẩn danh.\n" +
      "4. Nhắc nhở người dùng rằng ứng dụng có tính năng **Báo cáo ẩn danh** để họ có thể kiến nghị mật lên trường hiệu quả và an toàn.\n" +
      "5. Trả lời bằng tiếng Việt tự nhiên, ấm áp, sử dụng ngôn từ gần gũi của lứa tuổi học sinh (nhưng vẫn lịch sự, gọi người dùng là 'em' xưng 'Thầy cô' hoặc 'Anh chị cố vấn số'). Giữ câu trả lời súc tích, dễ đọc bằng định dạng markdown.";

    // Map messages to Gemini API expectations
    // SDK uses: contents: [{ role: "user" | "model", parts: [{ text: "..." }] }]
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.message }]
    }));

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "Thầy cô đang lắng nghe em đây. Em hãy chia sẻ thêm nhé.";
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: error.message,
      reply: "Rất tiếc, hệ thống gặp gián đoạn tạm thời khi phân tích cảm xúc. Em hãy hít thở thật sâu, tham khảo quy trình PAUSE trong cẩm nang hoặc chia sẻ mật qua công cụ báo cáo nhé!"
    });
  }
});


// Serve static assets in production, Vite middleware in development
const isProduction = process.env.NODE_ENV === "production";

async function bootstrap() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Anti-Bullying Server] đang hoạt động tại cổng http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Gặp sự cố khởi động máy chủ tư vấn tâm lý:", err);
});
