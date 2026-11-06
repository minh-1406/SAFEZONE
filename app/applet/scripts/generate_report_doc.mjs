import fs from "fs";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  PageBreak,
  Header,
  Footer,
  PageNumber
} from "docx";

async function generateDoc() {
  const primaryColor = "1E3A8A"; // Indigo/Navy
  const secondaryColor = "3B82F6"; // Blue
  const darkTextColor = "1F2937";
  const grayTextColor = "4B5563";

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Báo cáo Khoa học Kỹ thuật: Dự án SAFEZONE",
                    font: "Times New Roman",
                    size: 18,
                    italics: true,
                    color: "9CA3AF",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Trang ",
                    font: "Times New Roman",
                    size: 20,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: "Times New Roman",
                    size: 20,
                  }),
                  new TextRun({
                    text: " / ",
                    font: "Times New Roman",
                    size: 20,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: "Times New Roman",
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // ================= TRANG BÌA =================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: "BỘ GIÁO DỤC VÀ ĐÀO TẠO",
                bold: true,
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "CUỘC THI NGHIÊN CỨU KHOA HỌC KỸ THUẬT DÀNH CHO HỌC SINH TRUNG HỌC",
                bold: true,
                font: "Times New Roman",
                size: 22,
                color: "4B5563",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 800, after: 300 },
            children: [
              new TextRun({
                text: "BÁO CÁO KẾT QUẢ NGHIÊN CỨU ĐỀ TÀI",
                bold: true,
                font: "Times New Roman",
                size: 32,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
            children: [
              new TextRun({
                text: "SAFEZONE: NỀN TẢNG SỐ HỖ TRỢ SỨC KHỎE TÂM LÝ VÀ PHÒNG CHỐNG BẠO LỰC HỌC ĐƯỜNG ẨN DANH ỨNG DỤNG TRÍ TUỆ NHÂN TẠO (AI)",
                bold: true,
                font: "Times New Roman",
                size: 30,
                color: primaryColor,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 150 },
            children: [
              new TextRun({
                text: "Lĩnh vực: Khoa học Xã hội và Hành vi & Hệ thống Thông tin Trí tuệ Nhân tạo",
                bold: true,
                font: "Times New Roman",
                size: 24,
                italics: true,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 1200, after: 100 },
            children: [
              new TextRun({
                text: "Nhóm tác giả: ",
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
              new TextRun({
                text: "Học sinh Trường THPT",
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "Giáo viên hướng dẫn: ",
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
              new TextRun({
                text: "Cố vấn Khoa học & Tâm lý học đường",
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 800 },
            children: [
              new TextRun({
                text: "Năm học: ",
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
              new TextRun({
                text: "2025 - 2026",
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // ================= MỤC LỤC & TÓM TẮT =================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 200 },
            children: [
              new TextRun({
                text: "TÓM TẮT DỰ ÁN (ABSTRACT)",
                bold: true,
                font: "Times New Roman",
                size: 28,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 200, line: 360 },
            children: [
              new TextRun({
                text: "SAFEZONE là nền tảng số hóa giải quyết triệt để vấn đề rào cản tâm lý của học sinh khi đối mặt với bạo lực học đường và khủng hoảng tâm lý. Dự án kết hợp công nghệ bảo mật ẩn danh hoàn toàn (Zero-Knowledge Anonymous Reporting) với Trí tuệ nhân tạo (Gemini AI) và cẩm nang sơ cứu tâm lý chuẩn hóa (Quy trình PAUSE). Ứng dụng cung cấp kênh báo cáo hai chiều bảo vệ người học, trợ lý tâm lý đồng hành 24/7 phát hiện sớm rủi ro tự hại, đồng thời cung cấp bảng điều khiển (Dashboard) hỗ trợ Nhà trường và chuyên viên tâm lý can thiệp kịp thời, nhân văn và chính xác.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 400, line: 360 },
            children: [
              new TextRun({
                text: "Từ khóa: ",
                bold: true,
                font: "Times New Roman",
                size: 26,
              }),
              new TextRun({
                text: "Bạo lực học đường, Ẩn danh tuyệt đối, Trợ lý AI tâm lý, Quy trình PAUSE, Sức khỏe tinh thần THPT, Sơ cứu tâm lý.",
                font: "Times New Roman",
                size: 26,
                italics: true,
              }),
            ],
          }),

          // ================= PHẦN 1 =================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "PHẦN 1: LÝ DO CHỌN ĐỀ TÀI & TÍNH CẤP THIẾT",
                bold: true,
                font: "Times New Roman",
                size: 28,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 150 },
            children: [
              new TextRun({
                text: "1.1. Bối cảnh thực tiễn và tính cấp bách",
                bold: true,
                font: "Times New Roman",
                size: 26,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 150, line: 360 },
            children: [
              new TextRun({
                text: "Theo các số liệu khảo sát tâm lý học đường tại Việt Nam, có hơn 30% học sinh THCS và THPT từng là nạn nhân hoặc nhân chứng của ít nhất một hình thức bạo lực học đường (bao gồm bạo lực thể xác, bạo lực tinh thần/ngôn ngữ, bạo lực mạng và tẩy chay hội đồng). Trong thời đại số hóa, bạo lực mạng (Cyberbullying) diễn biến ngày càng phức tạp, tinh vi và diễn ra 24/7 ngoài tầm kiểm soát trực tiếp của thầy cô và phụ huynh.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 150, line: 360 },
            children: [
              new TextRun({
                text: "Nghiên cứu cho thấy có tới hơn 80% học sinh bị bạo lực hoặc khủng hoảng tâm lý chọn cách IM LẶNG. Nguyên nhân cốt lõi bao gồm: (1) Sợ bị lộ danh tính và bị trả thù; (2) Sợ bị bạn bè kỳ thị, gắn nhãn 'kẻ mách lẻo'; (3) E ngại quy trình tiếp nhận rườm rà tại phòng tư vấn; (4) Thiếu kiến thức sơ cứu cảm xúc tức thì khi khủng hoảng ập đến.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 150 },
            children: [
              new TextRun({
                text: "1.2. Mục tiêu nghiên cứu của đề tài",
                bold: true,
                font: "Times New Roman",
                size: 26,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 150, line: 360 },
            children: [
              new TextRun({
                text: "1. Xây dựng kênh phản ánh, báo cáo ẩn danh hoàn toàn giúp người học gạt bỏ nỗi sợ bị lộ danh tính.\n2. Phát triển Trợ lý ảo AI đóng vai trò người lắng nghe ban đầu, hỗ trợ sơ cứu tâm lý 24/7 và cảnh báo mức độ rủi ro tự hại.\n3. Chuẩn hóa quy trình sơ cứu khủng hoảng PAUSE và cung cấp các công cụ tự đo lường cảm xúc (Mood Tracker), nhận diện mối quan hệ độc hại.\n4. Xây dựng công cụ điều hành Dashboard cho nhà trường nhằm giải quyết ca việc nhanh chóng, minh bạch và bảo mật.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),

          // ================= PHẦN 2 =================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "PHẦN 2: CƠ SỞ KHOA HỌC & NGUYÊN LÝ THIẾT KẾ",
                bold: true,
                font: "Times New Roman",
                size: 28,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 150 },
            children: [
              new TextRun({
                text: "2.1. Cơ sở tâm lý học & Quy trình PAUSE Protocol",
                bold: true,
                font: "Times New Roman",
                size: 26,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 150, line: 360 },
            children: [
              new TextRun({
                text: "Đề tài ứng dụng liệu pháp tâm lý tập trung vào thân chủ (Person-Centered Therapy) và quy trình 5 bước ứng phó khủng hoảng bạo lực học đường PAUSE:",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),

          // Table for PAUSE
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: "Bước", bold: true, font: "Times New Roman", size: 24, color: primaryColor })] })],
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: "Ý nghĩa", bold: true, font: "Times New Roman", size: 24, color: primaryColor })] })],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: "Hành động cụ thể", bold: true, font: "Times New Roman", size: 24, color: primaryColor })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "P - Pause", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tạm dừng", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Rời khỏi màn hình/khu vực xung đột, hít thở sâu 4-4-4, không phản ứng nóng nảy.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "A - Assess", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Đánh giá", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Xác định mức độ đe dọa (thể xác, tinh thần, uy tín mạng) và cảm xúc bản thân.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "U - Understand", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Thấu hiểu", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Nhận thức rõ: Bạn không có lỗi, kẻ bạo lực vi phạm nội quy & pháp luật.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "S - Save", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Lưu bằng chứng", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chụp ảnh màn hình tin nhắn, ghi âm, lưu đường dẫn link, không xóa bằng chứng.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "E - Escalate", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tìm trợ giúp", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Gửi báo cáo ẩn danh qua SafeZone hoặc liên hệ tổng đài 111 / phòng tâm lý.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: "2.2. Cơ chế Bảo mật Ẩn danh & Thoát hiểm khẩn cấp",
                bold: true,
                font: "Times New Roman",
                size: 26,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 150, line: 360 },
            children: [
              new TextRun({
                text: "1. Ẩn danh tuyệt đối (Zero-Profile): Không yêu cầu tài khoản cá nhân, họ tên, email hay số điện thoại khi gửi phản ánh.\n2. Mã định danh ngẫu nhiên (Unique Tracking ID): Mỗi ca việc được cấp 1 mã ngẫu nhiên duy nhất (VD: SZ-883F-XXXX) để trao đổi 2 chiều và tra cứu kết quả.\n3. Nút thoát hiểm khẩn cấp (Panic Exit): Phím tắt ESC hoặc nút thoát nhanh lập tức chuyển hướng trang web sang trang học thuật trung lập (Wikipedia Toán học).\n4. Bảo mật phía Client (PIN Lock & Auto-purge): Cho phép đặt mã PIN tạm thời và xóa sạch toàn bộ lịch sử bộ nhớ cache sau khi kết thúc phiên truy cập.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),

          // ================= PHẦN 3 =================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "PHẦN 3: KIẾN TRÚC HỆ THỐNG & CÁC PHÂN HỆ CHỨC NĂNG",
                bold: true,
                font: "Times New Roman",
                size: 28,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 150, line: 360 },
            children: [
              new TextRun({
                text: "Nền tảng SAFEZONE được xây dựng theo kiến trúc full-stack hiện đại với 4 phân hệ chính hoạt động thống nhất:",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 120, line: 360 },
            children: [
              new TextRun({
                text: "1. Phân hệ Báo cáo Ẩn danh 2 chiều (Anonymous Case Management): ",
                bold: true,
                font: "Times New Roman",
                size: 26,
              }),
              new TextRun({
                text: "Cho phép người dùng chọn phân loại sự vụ (Bạo lực học đường, Bắt nạt mạng, Áp lực tâm lý, Bị đe dọa), tải lên bằng chứng, chọn mức độ khẩn cấp. Người gửi có thể theo dõi tiến độ giải quyết và trao đổi tin nhắn phản hồi với ban tư vấn.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 120, line: 360 },
            children: [
              new TextRun({
                text: "2. Phân hệ Trợ lý AI Tham vấn Tâm lý (AI Psychological Companion): ",
                bold: true,
                font: "Times New Roman",
                size: 26,
              }),
              new TextRun({
                text: "Ứng dụng mô hình AI ngôn ngữ lớn (Gemini) được tích hợp sẵn các kịch bản tham vấn thấu cảm, bài tập hít thở (Box Breathing), kỹ thuật giải tỏa căng thẳng (Grounding 5-4-3-2-1), đồng thời liên tục giám sát nguy cơ tự hại để cảnh báo khẩn cấp.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 120, line: 360 },
            children: [
              new TextRun({
                text: "3. Phân hệ Cẩm nang Sức khỏe Số (Interactive Handbook & Mood Meter): ",
                bold: true,
                font: "Times New Roman",
                size: 26,
              }),
              new TextRun({
                text: "Cung cấp hệ thống theo dõi diễn biến tâm trạng (Mood Tracker) lưu trữ cục bộ, bản đồ mối quan hệ số nhận diện bẫy thao túng (Gaslighting, Red Flags), và hướng dẫn chi tiết quy trình PAUSE.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 200, line: 360 },
            children: [
              new TextRun({
                text: "4. Phân hệ Bảng điều khiển Quản trị Nhà trường (Counselor Dashboard): ",
                bold: true,
                font: "Times New Roman",
                size: 26,
              }),
              new TextRun({
                text: "Giao diện quản lý dành cho Ban Giám hiệu, Cán bộ tâm lý và Đoàn trường. Thống kê biểu đồ trực quan về số lượng sự vụ, mức độ xử lý, phân bổ theo thời gian và danh mục, cho phép phản hồi trực tiếp tới từng mã theo dõi.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),

          // ================= PHẦN 4 =================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "PHẦN 4: ĐÁNH GIÁ TÍNH MỚI, TÍNH SÁNG TẠO & HIỆU QUẢ",
                bold: true,
                font: "Times New Roman",
                size: 28,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 150, line: 360 },
            children: [
              new TextRun({
                text: "So sánh hiệu quả giữa mô hình truyền thống và giải pháp số SafeZone:",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),

          // Table Comparison
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: "Tiêu chí so sánh", bold: true, font: "Times New Roman", size: 24, color: primaryColor })] })],
                  }),
                  new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: "Phương pháp truyền thống", bold: true, font: "Times New Roman", size: 24, color: primaryColor })] })],
                  }),
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: "Nền tảng SAFEZONE", bold: true, font: "Times New Roman", size: 24, color: primaryColor })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "1. Bảo vệ danh tính", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Dễ lộ diện khi đến phòng tư vấn hoặc bỏ hòm thư giấy.", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Ẩn danh hoàn toàn 100%, mã hóa định danh độc lập.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "2. Tốc độ hỗ trợ", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chờ đợi lâu, phụ thuộc giờ làm việc hành chính.", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "AI phản hồi tức thì 24/7, hướng dẫn sơ cứu ngay lập tức.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "3. Tương tác 2 chiều", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Hòm thư góp ý 1 chiều, không thể đối thoại nếu giấu tên.", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Trao đổi tin nhắn 2 chiều liên tục qua Mã theo dõi bảo mật.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "4. Dữ liệu quản trị", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Sổ sách thủ công, khó tổng hợp và phân tích xu hướng.", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Dashboard trực quan hóa dữ liệu theo thời gian thực.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
            ],
          }),

          // ================= PHẦN 5 =================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "PHẦN 5: KẾT LUẬN & HƯỚNG PHÁT TRIỂN",
                bold: true,
                font: "Times New Roman",
                size: 28,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 150 },
            children: [
              new TextRun({
                text: "5.1. Kết luận",
                bold: true,
                font: "Times New Roman",
                size: 26,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 150, line: 360 },
            children: [
              new TextRun({
                text: "Dự án SAFEZONE đã giải quyết thành công 'nút thắt' lớn nhất trong công tác phòng chống bạo lực học đường và chăm sóc sức khỏe tâm thần: NỖI SỢ BỊ LỘ DANH TÍNH. Bằng việc kết hợp hài hòa giữa cơ chế bảo mật ẩn danh và trí tuệ nhân tạo nhân văn, SafeZone tạo nên một lá chắn an toàn, giúp mọi học sinh đều có một nơi tin cậy để tìm kiếm sự giúp đỡ kịp thời.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 150 },
            children: [
              new TextRun({
                text: "5.2. Khả năng nhân rộng & Kế hoạch phát triển",
                bold: true,
                font: "Times New Roman",
                size: 26,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 150, line: 360 },
            children: [
              new TextRun({
                text: "1. Nhân rộng tại các trường THCS và THPT trên địa bàn thông qua hệ thống mã QR dán tại lớp học, thư viện và website trường.\n2. Kết nối liên thông dữ liệu với Tổng đài Quốc gia Bảo vệ Trẻ em 111 và các bệnh viện tâm thần/trung tâm can thiệp tâm lý khi có ca bệnh nghiêm trọng.\n3. Phát triển thuật toán cảnh báo sớm các đợt khủng hoảng tẩy chay tập thể trên không gian mạng nội bộ trường học.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),

          // ================= TÀI LIỆU THAM KHẢO =================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "TÀI LIỆU THAM KHẢO",
                bold: true,
                font: "Times New Roman",
                size: 28,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 100, line: 360 },
            children: [
              new TextRun({
                text: "1. Bộ Giáo dục và Đào tạo (2017), Thông tư 31/2017/TT-BGDĐT hướng dẫn thực hiện công tác tư vấn tâm lý cho học sinh trong trường phổ thông.\n2. Olweus, D. (1993), Bullying at school: What we know and what we can do, Blackwell Publishing.\n3. Hinduja, S., & Patchin, J. W. (2014), Bullying Beyond the Schoolyard: Preventing and Responding to Cyberbullying, Corwin Press.\n4. UNICEF (2018), An Everyday Lesson: #ENDviolence in Schools, Báo cáo toàn cầu về bạo lực học đường.",
                font: "Times New Roman",
                size: 24,
                italics: true,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("public/Bao_Cao_Khoa_Hoc_SafeZone.docx", buffer);
  console.log("File docx created successfully at public/Bao_Cao_Khoa_Hoc_SafeZone.docx");
}

generateDoc();
