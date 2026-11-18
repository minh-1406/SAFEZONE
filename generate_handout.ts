import * as fs from "fs";
import * as path from "path";
import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from "docx";

async function generateHandout() {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              // A5 size in dxa: 148mm x 210mm -> width: 10488 dxa, height: 14875 dxa
              width: 10488,
              height: 14875,
            },
            margin: {
              top: 1134, // ~2cm
              bottom: 1134,
              left: 1134,
              right: 1134,
            },
          },
        },
        children: [
          // Header / Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "GIỚI THIỆU NHANH VỀ NỀN TẢNG",
                bold: true,
                size: 20, // 10pt
                color: "4F46E5",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "SAFEZONE — KHÔNG GIAN SỐ AN TOÀN CHO HỌC SINH",
                bold: true,
                size: 28, // 14pt
                color: "312E81",
              }),
            ],
          }),

          // Subtitle / Intro
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Tài liệu tóm tắt ngắn gọn dành cho học sinh tham gia khảo sát đánh giá ứng dụng hỗ trợ sức khỏe tâm thần và phòng chống bạo lực học đường/bạo lực trắng trên không gian mạng.",
                italics: true,
                size: 20,
                color: "475569",
              }),
            ],
          }),

          // Section 1: SafeZone là gì?
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
            children: [
              new TextRun({
                text: "1. SafeZone là gì?",
                bold: true,
                size: 24, // 12pt
                color: "1E1B4B",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "SafeZone là ứng dụng web thông minh được xây dựng để đồng hành cùng học sinh THPT trong việc ",
                size: 20,
              }),
              new TextRun({
                text: "phòng chống bạo lực học đường, bạo lực trắng ",
                bold: true,
                size: 20,
                color: "4F46E5",
              }),
              new TextRun({
                text: "(tẩy chay ngầm, cô lập vô hình trên mạng xã hội) và ",
                size: 20,
              }),
              new TextRun({
                text: "giảm thiểu hội chứng sợ bỏ lỡ (FOMO). ",
                bold: true,
                size: 20,
                color: "4F46E5",
              }),
              new TextRun({
                text: "Ứng dụng đóng vai trò là cầu nối bảo mật giữa học sinh và Phòng Tư vấn tâm lý nhà trường.",
                size: 20,
              }),
            ],
          }),

          // Section 2: Các tính năng cốt lõi
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
            children: [
              new TextRun({
                text: "2. Các tính năng cốt lõi trên ứng dụng",
                bold: true,
                size: 24,
                color: "1E1B4B",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: "• ", bold: true, color: "4F46E5", size: 20 }),
              new TextRun({ text: "Trạm Nhận Diện & Đo Lường Cảm Xúc: ", bold: true, size: 20 }),
              new TextRun({ text: "Ghi nhận trạng thái hằng ngày, làm trắc nghiệm COES (bạo lực trắng) và State-FoMO (sợ bỏ lỡ) chuẩn khoa học.", size: 20 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: "• ", bold: true, color: "4F46E5", size: 20 }),
              new TextRun({ text: "Báo Cáo Ẩn Danh Bảo Mật: ", bold: true, size: 20 }),
              new TextRun({ text: "Gửi đơn kiến nghị, tố giác bắt nạt hoặc tâm sự kín đáo bằng mã số riêng (SA-XXXX) mà không lộ danh tính.", size: 20 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 80 },
            children: [
              new TextRun({ text: "• ", bold: true, color: "4F46E5", size: 20 }),
              new TextRun({ text: "Thầy Cô AI & Quy trình PAUSE: ", bold: true, size: 20 }),
              new TextRun({ text: "Tư vấn tâm lý theo liệu pháp CBT (tái cấu trúc nhận thức) và hướng dẫn 5 bước ứng phó khủng hoảng số (PAUSE).", size: 20 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "• ", bold: true, color: "4F46E5", size: 20 }),
              new TextRun({ text: "Cẩm Nang Số & Đường Dây Nóng: ", bold: true, size: 20 }),
              new TextRun({ text: "Cung cấp kiến thức kỹ năng số và danh bạ liên hệ khẩn cấp (Tổng đài 111, SĐT tư vấn trường học).", size: 20 }),
            ],
          }),

          // Section 3: Ý nghĩa khảo sát
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 80 },
            children: [
              new TextRun({
                text: "3. Lưu ý khi tham gia khảo sát",
                bold: true,
                size: 24,
                color: "1E1B4B",
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({
                text: "Khi trải nghiệm và làm phiếu khảo sát, các em hãy đánh giá khách quan về tính hữu ích, giao diện trực quan cũng như mức độ hỗ trợ thiết thực của SafeZone trong đời sống học đường hằng ngày. Ý kiến của các em rất quan trọng để hoàn thiện đề tài nghiên cứu!",
                size: 20,
              }),
            ],
          }),

          // Footer info
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
            children: [
              new TextRun({
                text: "SafeZone — Lắng nghe, thấu cảm và bảo vệ học sinh trong kỷ nguyên số.",
                italics: true,
                size: 18,
                color: "64748B",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filePath = path.join(process.cwd(), "Gioi_Thieu_SafeZone_Cho_Hoc_Sinh.docx");
  fs.writeFileSync(filePath, buffer);
  console.log("A5 Handout generated successfully at:", filePath);
}

generateHandout().catch(console.error);
