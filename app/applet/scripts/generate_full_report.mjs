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
  Header,
  Footer,
  PageNumber,
  PageBreak
} from "docx";

async function generateFullDocument() {
  const primaryColor = "1E3A8A"; // Deep Navy
  const secondaryColor = "0284C7"; // Sky Blue
  const darkTextColor = "1E293B";

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
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Báo cáo Đề tài KHKT: Nền tảng SAFEZONE Học Đường",
                    font: "Times New Roman",
                    size: 18,
                    italics: true,
                    color: "94A3B8",
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
                    bold: true,
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
            spacing: { before: 100, after: 80 },
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
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "CUỘC THI NGHIÊN CỨU KHOA HỌC KỸ THUẬT DÀNH CHO HỌC SINH TRUNG HỌC",
                bold: true,
                font: "Times New Roman",
                size: 22,
                color: "475569",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 150 },
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
            spacing: { after: 600 },
            children: [
              new TextRun({
                text: "SAFEZONE: NỀN TẢNG SỐ HỖ TRỢ SỨC KHỎE TÂM LÝ VÀ PHÒNG CHỐNG BẠO LỰC HỌC ĐƯỜNG ẨN DANH ỨNG DỤNG TRÍ TUỆ NHÂN TẠO (AI)",
                bold: true,
                font: "Times New Roman",
                size: 28,
                color: primaryColor,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 100 },
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
            spacing: { before: 800, after: 80 },
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
            spacing: { after: 80 },
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
            spacing: { after: 500 },
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

          // ================= TÓM TẮT DỰ ÁN =================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
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
            spacing: { after: 150, line: 360 },
            children: [
              new TextRun({
                text: "SAFEZONE là một nền tảng số hóa giải quyết căn bản và toàn diện rào cản tâm lý của học sinh THPT khi đối mặt với bạo lực học đường (bao gồm bạo lực thể xác, bạo lực ngôn từ, bạo lực trắng/cô lập số và bạo lực mạng). Dự án kết hợp công nghệ bảo mật ẩn danh tuyệt đối (Zero-Knowledge Anonymous Reporting) với Trí tuệ Nhân tạo (Gemini AI) và nền tảng tâm lý học chuẩn mực quốc tế:",
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
                text: "• Mô hình Bánh xe Cảm xúc Plutchik (Robert Plutchik) 8 miền phân định 3 cấp độ cường độ.\n• Mô hình Bánh xe Cảm xúc Geneva (Geneva Emotion Wheel - GEW v3.0, Klaus Scherer) 20 miền cảm xúc tinh vi theo 2 trục Valence và Control.\n• Quy trình 5 bước ứng phó khủng hoảng PAUSE Protocol: P (Pause - Dừng lại & Rút lui số) - A (Assess - Đánh giá tình hình khách quan) - U (Understand - Thấu hiểu cảm xúc & Tự trắc ẩn) - S (Seek - Tìm kiếm trợ lực/Đồng minh mật) - E (Empower - Trao quyền làm chủ & Khôi phục quyền ứng xử).\n• Kỹ thuật điều hòa thần kinh phế vị (Box Breathing 4-4-4-4, Grounding 5-4-3-2-1) và Liệu pháp Nhận thức Hành vi (CBT).\n• Bảng điều khiển quản trị ca việc (Counselor Management Dashboard) dành cho nhà trường và chuyên viên tâm lý.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFY,
            spacing: { after: 300, line: 360 },
            children: [
              new TextRun({
                text: "Từ khóa: ",
                bold: true,
                font: "Times New Roman",
                size: 26,
              }),
              new TextRun({
                text: "Bạo lực học đường, Ẩn danh tuyệt đối, Trợ lý AI tâm lý, Bánh xe cảm xúc Plutchik, Geneva Emotion Wheel, Quy trình PAUSE (Pause - Assess - Understand - Seek - Empower), Sơ cứu tâm lý THPT.",
                font: "Times New Roman",
                size: 26,
                italics: true,
              }),
            ],
          }),

          // ================= PHẦN 1 =================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
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
            spacing: { before: 150, after: 100 },
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
                text: "Theo thống kê từ Bộ Giáo dục và Đào tạo cùng các nghiên cứu của UNICEF và Viện Sức khỏe Tâm thần Quốc gia, có khoảng 30% đến 40% học sinh THCS và THPT từng trải qua cảm giác bị bắt nạt, đe dọa hoặc cô lập. Trong thời đại số hóa, bạo lực không còn dừng lại ở khuôn viên trường học mà chuyển dịch mạnh mẽ sang không gian mạng (Cyberbullying) dưới các hình thái ngầm tinh vi như: lập nhóm chat kín bôi nhọ danh dự, cắt ghép hình ảnh đe dọa tống tiền, tẩy chay và cô lập số ('bạo lực trắng').",
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
                text: "Điểm nghẽn lớn nhất khiến công tác can thiệp thất bại là: HƠN 80% NẠN NHÂN VÀ NHÂN CHỨNG CHỌN CÁCH IM LẶNG. Học sinh không dám lên tiếng bởi 4 nguyên nhân chủ yếu:\n1. Nỗi sợ bị trả thù, tẩy chay tập thể nếu lộ danh tính khi báo cáo.\n2. Tâm lý tự ti, xấu hổ hoặc sợ bị gắn mác 'kẻ mách lẻo'.\n3. Rào cản khi gặp mặt trực tiếp tại phòng tham vấn truyền thống.\n4. Thiếu kỹ năng nhận diện cảm xúc khoa học và thiếu kỹ thuật sơ cứu tâm lý tức thì khi bị khủng hoảng ngoài giờ học.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 100 },
            children: [
              new TextRun({
                text: "1.2. Mục tiêu nghiên cứu và giải pháp đề xuất",
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
                text: "Dự án SafeZone được nghiên cứu nhằm xây dựng một hệ sinh thái số hóa toàn diện:\n- Cung cấp kênh báo cáo ẩn danh 2 chiều độc lập, không lưu thông tin nhận dạng người dùng.\n- Ứng dụng Trí tuệ Nhân tạo AI làm người bạn đồng hành tâm lý 24/7, lắng nghe thấu cảm và sàng lọc nguy cơ tự hại.\n- Tích hợp cẩm nang sơ cứu tâm lý và các thang đo cảm xúc chuẩn quốc tế giúp học sinh tự lượng giá sức khỏe tinh thần.\n- Hỗ trợ nhà trường có công cụ quản trị dữ liệu ca việc trực quan, giải quyết triệt để và bảo mật.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),

          // ================= PHẦN 2 =================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: "PHẦN 2: CƠ SỞ KHOA HỌC & CÁC HỌC THUYẾT TÂM LÝ ỨNG DỤNG TRONG SAFEZONE",
                bold: true,
                font: "Times New Roman",
                size: 28,
                color: primaryColor,
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 100 },
            children: [
              new TextRun({
                text: "2.1. Thuyết Tiến hóa Cảm xúc & Bánh xe Cảm xúc Plutchik (Robert Plutchik, 1980)",
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
                text: "Nền tảng tích hợp cấu trúc Bánh xe Cảm xúc của nhà tâm lý học Robert Plutchik. Mô hình phân định 8 nhóm cảm xúc sơ cấp được cấu trúc thành 4 cặp đối lập: Vui mừng (Joy) ↔ Buồn bã (Sadness); Tin tưởng (Trust) ↔ Ghê tởm (Disgust); Sợ hãi (Fear) ↔ Phẫn nộ (Anger); Ngạc nhiên (Surprise) ↔ Kỳ vọng (Anticipation). Mỗi nhóm cảm xúc được chia thành 3 mức độ cường độ tăng dần từ ngoại vi vào tâm bánh xe. Việc gọi tên chính xác trạng thái giúp học sinh bước đầu làm chủ phản xạ hành vi tiêu cực.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 100 },
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
                text: "SafeZone tích hợp công cụ Geneva Emotion Wheel (GEW v3.0) do Trung tâm Khoa học Cảm xúc Quốc gia Thụy Sĩ (University of Geneva) phát triển. GEW bố trí 20 trạng thái cảm xúc tinh vi theo 2 trục toạ độ khoa học: Trục Valence (Mức độ dễ chịu / khó chịu) và Trục Control/Power (Năng lực kiểm soát cao / thấp), hỗ trợ người học tự phân tích sâu sắc phản ứng trước các tình huống bị chèn ép, bạo lực trắng hoặc tẩy chay số.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),

          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 100 },
            children: [
              new TextRun({
                text: "2.3. Chuẩn hóa Quy trình 5 bước ứng phó khủng hoảng PAUSE Protocol trong SafeZone",
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
                text: "Quy trình PAUSE trong ứng dụng SafeZone được xây dựng chuẩn mực theo 5 chữ cái viết tắt: PAUSE - ASSESS - UNDERSTAND - SEEK (SEEK SUPPORT) - EMPOWER. Cụ thể:",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),

          // Table PAUSE
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 18, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: "Ký hiệu", bold: true, font: "Times New Roman", size: 24, color: primaryColor })] })],
                  }),
                  new TableCell({
                    width: { size: 28, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: "Tên bước trong App", bold: true, font: "Times New Roman", size: 24, color: primaryColor })] })],
                  }),
                  new TableCell({
                    width: { size: 54, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: "Nội dung hành động & Cơ sở khoa học tâm lý", bold: true, font: "Times New Roman", size: 24, color: primaryColor })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "P - Pause", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Pause (Dừng lại & Rút lui số)", font: "Times New Roman", size: 24, bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Thoát tài khoản mạng xã hội ít nhất 30 phút, không khẩu chiến/đôi co tức thì. Thực hiện thở sâu 5 nhịp cơ hoành (Box Breathing 4-4-4-4) kích hoạt hệ thần kinh đối giao cảm hạ hỏa.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "A - Assess", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Assess (Đánh giá tình hình khách quan)", font: "Times New Roman", size: 24, bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Bình tâm tự lượng giá: Đây là hành vi có chủ ý bắt nạt hay bất đồng ý kiến nhất thời? Mức độ nghiêm trọng tới đâu? Định vị rằng hành vi tiêu cực của kẻ bắt nạt không quyết định giá trị bản thân.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "U - Understand", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Understand (Thấu hiểu cảm xúc & Tự trắc ẩn)", font: "Times New Roman", size: 24, bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Gọi tên chính xác cảm xúc trên Bánh xe Cảm xúc Plutchik/Geneva (cô độc, bẽ bàng, phẫn uất...). Ứng dụng thuyết Tự trắc ẩn (Kristin Neff) để xóa bỏ tự trách bản thân, viết ra các điểm mạnh của mình.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "S - Seek", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Seek (Tìm kiếm trợ lực / Đồng minh mật)", font: "Times New Roman", size: 24, bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tìm kiếm từ 1 - 2 người đáng tin cậy để giãi bày (Cha mẹ, Thầy cô chủ nhiệm, Cố vấn tâm lý học đường, Digital Peer Mentors) với kịch bản mở lời an toàn, bảo mật.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "E - Empower", bold: true, font: "Times New Roman", size: 24 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Empower (Trao quyền & Khôi phục quyền ứng xử)", font: "Times New Roman", size: 24, bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chuyển từ vị thế nạn nhân thụ động thành người làm chủ tình hình: 1. Lưu giữ và chụp màn hình bằng chứng số; 2. Chặn các tài khoản ác ý; 3. Gửi báo cáo ẩn danh lên SafeZone để nhà trường can thiệp.", font: "Times New Roman", size: 24 })] })] }),
                ],
              }),
            ],
          }),

          // ================= PHẦN 3 =================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
            children: [
              new TextRun({
                text: "PHẦN 3: KIẾN TRÚC KỸ THUẬT & CƠ CHẾ BẢO MẬT ẨN DANH",
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
                text: "1. Cơ chế Zero-Knowledge & Ẩn danh tuyệt đối: Nền tảng không thu thập IP, không bắt buộc đăng nhập tài khoản cá nhân, sinh mã Tracking ID độc lập duy nhất (UUID v4) cho phép trao đổi phản hồi 2 chiều mà không tiết lộ bất kỳ thông tin cá nhân nào của học sinh.\n2. Nút thoát hiểm khẩn cấp (Panic Exit / Phím ESC): Giúp học sinh ngay lập tức chuyển hướng toàn bộ giao diện sang trang học thuật trung lập (Wikipedia Toán học) khi có người lạ đột ngột đứng gần.\n3. Khóa PIN cục bộ & Xóa sạch dấu vết (Client-side PIN & Data Purge): Cho phép học sinh cài đặt mã PIN tạm thời để khóa phiên làm việc trên máy tính công cộng và nút 'Xóa sạch dấu vết' thanh tẩy bộ nhớ cache/IndexedDB chỉ bằng 1 thao tác.\n4. Trợ lý AI Tham vấn (Gemini AI API): Được tích hợp kịch bản Prompt Engineering chuyên sâu về tâm lý học đường, liên tục giám sát và kích hoạt báo động khẩn cấp khi phát hiện các dấu hiệu có nguy cơ tự hại.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),

          // ================= PHẦN 4 =================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
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
                    children: [new Paragraph({ children: [new TextRun({ text: "Tiêu chí đánh giá", bold: true, font: "Times New Roman", size: 24, color: primaryColor })] })],
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
            spacing: { before: 300, after: 150 },
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
                text: "Dự án SAFEZONE đã giải quyết thành công rào cản lớn nhất trong công tác phòng chống bạo lực học đường và chăm sóc sức khỏe tâm thần học sinh: NỖI SỢ BỊ LỘ DANH TÍNH. Bằng việc kết hợp hài hòa giữa cơ chế bảo mật ẩn danh và nền tảng tâm lý học chuẩn mực (Plutchik, Geneva Emotion Wheel, CBT, Quy trình PAUSE: Pause - Assess - Understand - Seek - Empower), SafeZone tạo nên một lá chắn số an toàn, giúp mọi học sinh đều có một nơi tin cậy để tìm kiếm sự giúp đỡ kịp thời.\n\nHướng phát triển tiếp theo của đề tài:\n1. Triển khai mở rộng hệ thống mã QR dán tại các góc tư vấn, lớp học và thư viện của tất cả các trường THPT trên địa bàn.\n2. Liên kết dữ liệu cảnh báo với Tổng đài Quốc gia Bảo vệ Trẻ em 111 và các trung tâm hỗ trợ tâm lý chuyên sâu.\n3. Nâng cấp thuật toán AI phát hiện sớm các đợt khủng hoảng tẩy chay hội đồng trên không gian mạng.",
                font: "Times New Roman",
                size: 26,
              }),
            ],
          }),

          // ================= TÀI LIỆU THAM KHẢO =================
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
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
                text: "1. Plutchik, R. (1980). A general psychoevolutionary theory of emotion. In Theories of emotion (pp. 3-33). Academic Press. [Cơ sở khoa học Mô hình Bánh xe Cảm xúc 8 miền và các cặp cảm xúc đối lập ứng dụng trong phân hệ Cẩm nang số SafeZone]",
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
                text: "2. Scherer, K. R., Shuman, V., Fontaine, J. R., & Soriano, C. (2013). The Geneva Emotion Wheel (GEW version 3.0). Geneva Emotion Research Group, University of Geneva. [Cơ sở khoa học Bánh xe Cảm xúc Geneva 20 cung bậc theo hệ trục Valence và Control trong SafeZone]",
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
                text: "3. Beck, A. T. (1979). Cognitive therapy of depression. Guilford Press. [Khung tham chiếu Liệu pháp Nhận thức Hành vi - CBT ứng dụng trong Trợ lý AI và phân tích suy nghĩ tiêu cực]",
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
                text: "4. Porges, S. W. (2011). The Polyvagal Theory: Neurophysiological Foundations of Emotions, Attachment, Communication, and Self-regulation. W. W. Norton & Company. [Cơ sở sinh lý học thần kinh cho bài tập thở Box Breathing và kỹ thuật Grounding 5-4-3-2-1 trong bước Pause (P) của Giao thức PAUSE]",
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
                text: "5. Neff, K. D. (2003). Self-compassion: An alternative conceptualization of a healthy attitude toward oneself. Self and Identity, 2(2), 85-101. [Lý thuyết Tự trắc ẩn ứng dụng trong bước Understand (U) của Giao thức PAUSE giúp xóa bỏ tâm lý tự đổ lỗi]",
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
                text: "6. Olweus, D. (1993). Bullying at school: What we know and what we can do. Blackwell Publishing. [Cơ sở lý thuyết phân loại 4 vai trò bạo lực học đường: Nạn nhân, Người ngoài cuộc, Nhóm a dua, Kẻ bắt nạt]",
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
                text: "7. Hinduja, S., & Patchin, J. W. (2014). Bullying Beyond the Schoolyard: Preventing and Responding to Cyberbullying (2nd ed.). Corwin Press. [Cơ sở lý thuyết xây dựng thang đo bạo lực mạng và các biểu hiện cô lập số]",
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
                text: "8. Bộ Giáo dục và Đào tạo (2017). Thông tư số 31/2017/TT-BGDĐT hướng dẫn thực hiện công tác tư vấn tâm lý cho học sinh trong trường phổ thông.",
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
                text: "9. UNICEF (2018). An Everyday Lesson: #ENDviolence in Schools. UNICEF Division of Communication, New York. [Số liệu thực trạng và khuyến nghị bảo vệ an toàn học đường toàn cầu]",
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
  console.log("Full Report Docx created successfully at public/Bao_Cao_Khoa_Hoc_SafeZone.docx");
}

generateFullDocument();
