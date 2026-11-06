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
} from "docx";

async function generateDoc() {
  const primaryColor = "1E3A8A"; // Dark Blue
  const secondaryColor = "0D9488"; // Teal
  const darkText = "1F2937";

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch (2.54cm)
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          // ================= TRANG BÌA & TIÊU ĐỀ =================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "BỘ GIÁO DỤC VÀ ĐÀO TẠO",
                bold: true,
                font: "Times New Roman",
                size: 26,
                color: "4B5563",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "CUỘC THI NGHIÊN CỨU KHOA HỌC KỸ THUẬT DÀNH CHO HỌC SINH TRUNG HỌC",
                bold: true,
                font: "Times New Roman",
                size: 26,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
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
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "SAFEZONE: NỀN TẢNG SỐ HỖ TRỢ SỨC KHỎE TÂM LÝ VÀ PHÒNG CHỐNG BẠO LỰC HỌC ĐƯỜNG ẨN DANH ỨNG DỤNG TRÍ TUỆ NHÂN TẠO (AI)",
                bold: true,
                font: "Times New Roman",
                size: 30,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "Lĩnh vực: Khoa học Xã hội và Hành vi & Hệ thống Thông tin Trí tuệ Nhân tạo\nNhóm tác giả: Học sinh Trường THPT\nNăm học: 2025 - 2026",
                font: "Times New Roman",
                size: 24,
                italics: true,
                color: "4B5563",
              }),
            ],
          }),

          // ================= TÓM TẮT DỰ ÁN =================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
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
                text: "SAFEZONE là giải pháp công nghệ toàn diện giải quyết triệt để vấn đề rào cản tâm lý của học sinh khi đối mặt với bạo lực học đường (bao gồm bạo lực thể xác, bạo lực ngôn từ, bạo lực trắng/cô lập tập thể và bạo lực mạng). Dự án tích hợp các mô hình tâm lý học kinh điển và hiện đại gồm: Bánh xe Cảm xúc Plutchik (Robert Plutchik), Geneva Emotion Wheel v3.0 (Klaus Scherer), Trắc nghiệm Đo lường Bạo lực trắng, Trợ lý AI đồng hành (Gemini AI) dựa trên Liệu pháp Nhận thức Hành vi (CBT) và Quy trình 5 bước ứng phó khủng hoảng PAUSE Protocol. Ứng dụng cung cấp kênh báo cáo 2 chiều bảo mật ẩn danh hoàn toàn (Zero-Knowledge Reporting), hệ thống sơ cứu cảm xúc tức thì và Bảng điều khiển quản trị (Counselor Dashboard) cho nhà trường.",
                font: "Times New Roman",
                size: 26,
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
                text: "1.1. Bối cảnh thực tiễn & Nỗi sợ im lặng",
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
                text: "Bạo lực học đường và bạo lực không gian mạng (Cyberbullying) đang diễn biến phức tạp dưới nhiều hình thái ngầm như 'bạo lực trắng' (cô lập, tẩy chay có chủ đích, loại trừ khỏi nhóm chat). Theo các nghiên cứu tâm lý học đường, hơn 80% nạn nhân và nhân chứng chọn cách im lặng vì 4 rào cản chính:\n1. Nỗi sợ bị trả thù hoặc trả đũa tập thể nếu lộ danh tính.\n2. Tâm lý tự ti, xấu hổ hoặc sợ bị gắn mác 'kẻ mách lẻo'.\n3. Sự bất tiện và e ngại khi tiếp xúc trực tiếp tại phòng tham vấn truyền thống.\n4. Thiếu công cụ nhận diện cảm xúc khoa học và thiếu kỹ năng sơ cứu tâm lý tức thì khi khủng hoảng ập đến ngoài giờ học.",
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
                text: "1.2. Mục tiêu và Giả thuyết nghiên cứu",
                bold: true,
                font: "Times New Roman",
                size: 26,
                color: secondaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 200, line: 360 },
            children: [
              new TextRun({
                text: "Đề tài hướng tới việc xây dựng một hệ thống số hóa hỗ trợ bảo vệ học sinh toàn diện: Thiết lập kênh báo cáo ẩn danh hai chiều không định danh (Zero-Knowledge), trang bị công cụ định danh cảm xúc theo chuẩn tâm lý học quốc tế, trợ lý AI hỗ trợ sơ cứu tinh thần 24/7 và hệ thống quản trị ca việc dành cho chuyên viên tâm lý nhà trường.",
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
                text: "PHẦN 2: CƠ SỞ KHOA HỌC & CÁC HỌC THUYẾT TÂM LÝ ỨNG DỤNG",
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
                text: "2.1. Mô hình Bánh xe Cảm xúc Plutchik (Robert Plutchik, 1980)",
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
                text: "Ứng dụng tích hợp cấu trúc Bánh xe Cảm xúc của nhà tâm lý học Robert Plutchik (Psychoevolutionary Theory of Emotion). Mô hình định vị 8 nhóm cảm xúc sơ cấp được sắp xếp thành các cặp đối lập (Opposites): Vui mừng (Joy) đối lập Buồn bã (Sadness), Tin tưởng (Trust) đối lập Ghê tởm (Disgust), Sợ hãi (Fear) đối lập Phẫn nộ (Anger), Ngạc nhiên (Surprise) đối lập Kỳ vọng (Anticipation). Mỗi nhánh cảm xúc được chia thành 3 mức độ cường độ (Cường độ cao - Trung bình - Nhẹ). Giúp học sinh gọi tên chính xác trạng thái nội tâm thay vì những cảm giác mơ hồ.",
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
                text: "2.2. Bánh xe Cảm xúc Geneva - Geneva Emotion Wheel v3.0 (Klaus Scherer, 2013)",
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
                text: "Nhằm bổ sung cho các tình huống xung đột học đường phức tạp, SafeZone tích hợp thêm công cụ Geneva Emotion Wheel (GEW v3.0) do Trung tâm Khoa học Cảm xúc Quốc gia Thụy Sĩ (CISA, University of Geneva) phát triển. GEW phân loại 20 trạng thái cảm xúc tinh vi trên hệ quy chiếu 2 trục: Trục Valence (Dễ chịu / Khó chịu) và Trục Control/Power (Khả năng kiểm soát cao / thấp), hỗ trợ học sinh tự đánh giá năng lực làm chủ tình huống khi bị chèn ép.",
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
                text: "2.3. Quy trình 5 bước ứng phó khủng hoảng PAUSE Protocol",
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
                text: "Quy trình PAUSE được xây dựng dựa trên nguyên tắc Trị liệu Nhận thức Hành vi (CBT - Aaron Beck) và Kỹ thuật Điều hòa thần kinh phế vị (Polyvagal Theory):\n- P (Pause - Tạm dừng & Rút lui số): Ngắt kết nối thiết bị khi bị tấn công mạng, thực hiện Box Breathing (4s hít - 4s giữ - 4s thở - 4s nghỉ).\n- A (Assess - Định danh & Đánh giá): Định vị cảm xúc trên Bánh xe Plutchik / Geneva và xác định mức độ nguy hiểm thực tế.\n- U (Understand - Tự trắc ẩn & Nhận thức đúng): Xóa bỏ mặc cảm tội lỗi (Self-blame), nhận thức rõ bạo lực là sai trái từ phía kẻ gây hại.\n- S (Save - Thu thập chứng cứ an toàn): Chụp màn hình, lưu URL, mã hóa bản ghi âm mà không tranh cãi đôi co.\n- E (Escalate - Kết nối trợ giúp bảo mật): Gửi báo cáo ẩn danh lên SafeZone hoặc kích hoạt đường dây khẩn cấp 111 / 113.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),

          // ================= BẢNG BƯỚC PAUSE =================
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: "Ký hiệu", bold: true, font: "Times New Roman", size: 24, color: primaryColor })] })],
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: "Tên bước", bold: true, font: "Times New Roman", size: 24, color: primaryColor })] })],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: "Kỹ thuật tâm lý ứng dụng", bold: true, font: "Times New Roman", size: 24, color: primaryColor })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "P", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Pause & Step Back", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Box Breathing 4-4-4-4, Grounding 5-4-3-2-1 kích hoạt hệ đối giao cảm.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "A", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Assess Emotion", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Mô hình Bánh xe Plutchik và Geneva Emotion Wheel (GEW v3.0).", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "U", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Understand Truth", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Trị liệu Tự trắc ẩn (Self-Compassion - Kristin Neff), loại bỏ Gaslighting.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "S", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Save Evidence", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Kỹ năng lưu vết chứng cứ số chuẩn pháp lý an ninh mạng.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "E", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Escalate & Report", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Hệ thống Báo cáo Ẩn danh SafeZone, Tổng đài Quốc gia 111.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
            ],
          }),

          // ================= PHẦN 3 =================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            children: [
              new TextRun({
                text: "PHẦN 3: KIẾN TRÚC HỆ THỐNG VÀ CÔNG NGHỆ BẢO MẬT",
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
                text: "1. Cơ chế Zero-Knowledge & Ẩn danh tuyệt đối: Nền tảng không thu thập IP, không yêu cầu Cookie nhận dạng người dùng, sinh mã Tracking ID ngẫu nhiên theo tiêu chuẩn UUID v4 cho phép trao đổi phản hồi 2 chiều không lộ danh tính.\n2. Nút thoát hiểm khẩn cấp (Panic Exit / ESC key): Ngay lập tức xóa sạch màn hình và chuyển hướng trình duyệt sang trang bách khoa học thuật, bảo vệ học sinh khi có người lạ đột ngột tiếp cận.\n3. Khóa PIN cục bộ & Xóa sạch dấu vết (Client-side PIN & Data Purge): Cho phép học sinh cài mã PIN cá nhân để bảo vệ nhật ký trên thiết bị mượn và cung cấp nút xóa sạch bộ nhớ tạm IndexedDB chỉ trong 1 chạm.\n4. Trợ lý AI Tham vấn (Gemini AI API): Ứng dụng Prompt Engineering chuyên sâu về tâm lý học đường, tích hợp bộ lọc từ khóa nguy cơ tự hại (Self-harm Red Flags) để lập tức hiển thị cảnh báo can thiệp khẩn cấp.",
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
                text: "PHẦN 4: ĐÁNH GIÁ TÍNH MỚI, TÍNH SÁNG TẠO & TÍNH ỨNG DỤNG",
                bold: true,
                font: "Times New Roman",
                size: 28,
                color: primaryColor,
              }),
            ],
          }),
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
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "2. Khoa học cảm xúc", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Đánh giá cảm tính, thiếu công cụ đo lường trực quan.", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tích hợp Bánh xe Plutchik 8 miền & Geneva Emotion Wheel v3.0 20 miền.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "3. Tốc độ hỗ trợ", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chờ đợi lâu, phụ thuộc giờ làm việc hành chính.", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "AI phản hồi tức thì 24/7, hướng dẫn sơ cứu PAUSE ngay lập tức.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "4. Tương tác 2 chiều", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Hòm thư góp ý 1 chiều, không thể đối thoại nếu giấu tên.", font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Trao đổi tin nhắn 2 chiều liên tục qua Mã theo dõi bảo mật.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "5. Dữ liệu quản trị", bold: true, font: "Times New Roman", size: 24 })] })] }),
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
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 150, line: 360 },
            children: [
              new TextRun({
                text: "Dự án SAFEZONE đã giải quyết thành công rào cản lớn nhất trong công tác phòng chống bạo lực học đường và chăm sóc sức khỏe tâm thần học sinh: NỖI SỢ BỊ LỘ DANH TÍNH. Bằng việc kết hợp hài hòa giữa cơ chế bảo mật ẩn danh và nền tảng tâm lý học chuẩn mực (Plutchik, Geneva Emotion Wheel, CBT), SafeZone tạo nên một lá chắn số an toàn, giúp mọi học sinh đều có một nơi tin cậy để tìm kiếm sự giúp đỡ kịp thời.",
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
                text: "TÀI LIỆU THAM KHẢO (REFERENCES)",
                bold: true,
                font: "Times New Roman",
                size: 28,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 80, line: 320 },
            children: [
              new TextRun({
                text: "1. Plutchik, R. (1980). A general psychoevolutionary theory of emotion. In Theories of emotion (pp. 3-33). Academic Press. [Nguồn gốc Mô hình Bánh xe Cảm xúc 8 miền và các cặp cảm xúc đối lập ứng dụng trong SafeZone]",
                font: "Times New Roman",
                size: 22,
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 80, line: 320 },
            children: [
              new TextRun({
                text: "2. Scherer, K. R., Shuman, V., Fontaine, J. R., & Soriano, C. (2013). The Geneva Emotion Wheel (GEW version 3.0). Geneva Emotion Research Group, University of Geneva. [Nguồn gốc Bánh xe Cảm xúc Geneva 20 cung bậc theo trục Valence và Control]",
                font: "Times New Roman",
                size: 22,
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 80, line: 320 },
            children: [
              new TextRun({
                text: "3. Beck, A. T. (1979). Cognitive therapy of depression. Guilford Press. [Cơ sở Liệu pháp Nhận thức Hành vi - CBT ứng dụng trong Trợ lý AI và phân tích suy nghĩ tiêu cực]",
                font: "Times New Roman",
                size: 22,
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 80, line: 320 },
            children: [
              new TextRun({
                text: "4. Porges, S. W. (2011). The Polyvagal Theory: Neurophysiological Foundations of Emotions, Attachment, Communication, and Self-regulation. W. W. Norton & Company. [Cơ sở khoa học bài tập thở Box Breathing và kỹ thuật Grounding 5-4-3-2-1 trong Giao thức PAUSE]",
                font: "Times New Roman",
                size: 22,
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 80, line: 320 },
            children: [
              new TextRun({
                text: "5. Neff, K. D. (2003). Self-compassion: An alternative conceptualization of a healthy attitude toward oneself. Self and Identity, 2(2), 85-101. [Lý thuyết Tự trắc ẩn ứng dụng trong bước Understand của Giao thức PAUSE giúp xóa bỏ tự trách bản thân]",
                font: "Times New Roman",
                size: 22,
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 80, line: 320 },
            children: [
              new TextRun({
                text: "6. Bộ Giáo dục và Đào tạo (2017). Thông tư số 31/2017/TT-BGDĐT hướng dẫn thực hiện công tác tư vấn tâm lý cho học sinh trong trường phổ thông.",
                font: "Times New Roman",
                size: 22,
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 80, line: 320 },
            children: [
              new TextRun({
                text: "7. Olweus, D. (1993). Bullying at school: What we know and what we can do. Blackwell Publishing. [Lý thuyết kinh điển về bạo lực học đường và phân loại vai trò: Nạn nhân, Kẻ bắt nạt, Người ngoài cuộc]",
                font: "Times New Roman",
                size: 22,
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 80, line: 320 },
            children: [
              new TextRun({
                text: "8. Hinduja, S., & Patchin, J. W. (2014). Bullying Beyond the Schoolyard: Preventing and Responding to Cyberbullying (2nd ed.). Corwin Press. [Cơ sở xây dựng thang đo bạo lực mạng và các hành vi cô lập số]",
                font: "Times New Roman",
                size: 22,
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 80, line: 320 },
            children: [
              new TextRun({
                text: "9. UNICEF (2018). An Everyday Lesson: #ENDviolence in Schools. UNICEF Division of Communication, New York. [Số liệu thực trạng và khuyến nghị toàn cầu về bảo vệ an toàn học đường]",
                font: "Times New Roman",
                size: 22,
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
