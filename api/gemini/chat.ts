import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION =
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

async function readJsonBody(req: any): Promise<any> {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk: any) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await readJsonBody(req);
    const messages = body?.messages;

    const apiKey = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      ""
    ).trim();

    if (!apiKey) {
      return res.status(503).json({
        error: "Trợ lý AI đang ngoại tuyến (chưa cấu hình GEMINI_API_KEY trên máy chủ).",
        reply:
          "Chào em, hiện tại Thầy cô AI đang tạm thời ngoại tuyến vì máy chủ chưa được cấu hình khóa API Gemini. Trong lúc chờ Thầy cô kỹ thuật kích hoạt lại, em hãy áp dụng bộ quy tắc **PAUSE** có sẵn trong mục Cẩm Nang để tự xoa dịu cảm xúc, hoặc gửi báo cáo ẩn danh ngay cho trường nhé!",
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Thiếu nội dung câu hỏi." });
    }

    const aiClient = new GoogleGenAI({ apiKey });

    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.message || "") }],
    }));

    let response;
    try {
      response = await aiClient.models.generateContent({
        model: "gemini-4-hydrogen",
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });
    } catch (primaryErr: any) {
      const msg = String(primaryErr?.message || "").toLowerCase();
      const status = Number(primaryErr?.status || primaryErr?.code || 0);
      const isApiKeyOrQuotaIssue =
        msg.includes("api key") ||
        msg.includes("api_key") ||
        msg.includes("permission") ||
        msg.includes("quota") ||
        status === 429;
      if (
        !isApiKeyOrQuotaIssue &&
        (status === 404 ||
          status === 400 ||
          msg.includes("not found") ||
          msg.includes("404") ||
          msg.includes("unsupported") ||
          msg.includes("not supported") ||
          msg.includes("model"))
      ) {
        response = await aiClient.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });
      } else {
        throw primaryErr;
      }
    }

    const replyText =
      response.text || "Thầy cô đang lắng nghe em đây. Em hãy chia sẻ thêm nhé.";
    return res.status(200).json({ reply: replyText });
  } catch (error: any) {
    console.error("[Vercel /api/gemini/chat] Error:", error?.message || error);
    return res.status(500).json({
      error: error?.message || "Internal server error",
      reply:
        "Rất tiếc, hệ thống gặp gián đoạn tạm thời khi phân tích cảm xúc. Em hãy hít thở thật sâu, tham khảo quy trình PAUSE trong cẩm nang hoặc chia sẻ mật qua công cụ báo cáo nhé!",
    });
  }
}
