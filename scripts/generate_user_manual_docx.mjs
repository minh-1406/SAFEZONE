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
  PageBreak,
  ShadingType
} from "docx";

async function generateUserManualDocument() {
  const primaryNavy = "1E3A8A";    // Deep Navy
  const secondaryBlue = "0284C7";  // Ocean Blue
  const accentIndigo = "4F46E5";   // Modern Indigo
  const darkSlate = "0F172A";      // Slate 900
  const bodyColor = "334155";      // Slate 700
  const headerBg = "F1F5F9";       // Slate 100
  const alertRose = "E11D48";      // Rose 600

  // Helper create styled paragraph
  const p = (text, opts = {}) => {
    const runs = Array.isArray(text)
      ? text
      : [
          new TextRun({
            text,
            font: "Times New Roman",
            size: opts.size || 24, // 12pt default
            bold: opts.bold || false,
            italics: opts.italics || false,
            color: opts.color || bodyColor,
          }),
        ];

    return new Paragraph({
      alignment: opts.alignment || AlignmentType.JUSTIFY,
      spacing: {
        before: opts.spaceBefore || 60,
        after: opts.spaceAfter || 120,
        line: opts.line || 320, // 1.33 line spacing
      },
      bullet: opts.bullet || undefined,
      children: runs,
    });
  };

  const h1 = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 360, after: 180 },
      children: [
        new TextRun({
          text,
          bold: true,
          font: "Times New Roman",
          size: 28, // 14pt
          color: primaryNavy,
        }),
      ],
    });

  const h2 = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text,
          bold: true,
          font: "Times New Roman",
          size: 26, // 13pt
          color: secondaryBlue,
        }),
      ],
    });

  const h3 = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 180, after: 80 },
      children: [
        new TextRun({
          text,
          bold: true,
          font: "Times New Roman",
          size: 24, // 12pt
          color: darkSlate,
        }),
      ],
    });

  const calloutBox = (title, content, color = accentIndigo, bg = "EEF2FF") => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        left: { style: BorderStyle.SINGLE, size: 24, color: color },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: bg },
              margins: { top: 140, bottom: 140, left: 200, right: 200 },
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 60 },
                  children: [
                    new TextRun({
                      text: `💡 ${title}`,
                      bold: true,
                      font: "Times New Roman",
                      size: 24,
                      color: color,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.JUSTIFY,
                  spacing: { before: 40, after: 40, line: 300 },
                  children: [
                    new TextRun({
                      text: content,
                      font: "Times New Roman",
                      size: 22,
                      color: "1E293B",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  };

  const createTable = (headers, rowsData, widths = []) => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: headers.map((h, i) =>
            new TableCell({
              width: widths[i] ? { size: widths[i], type: WidthType.PERCENTAGE } : undefined,
              shading: { type: ShadingType.CLEAR, fill: primaryNavy },
              margins: { top: 120, bottom: 120, left: 140, right: 140 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({
                      text: h,
                      bold: true,
                      font: "Times New Roman",
                      size: 22,
                      color: "FFFFFF",
                    }),
                  ],
                }),
              ],
            })
          ),
        }),
        ...rowsData.map(
          (row, rIdx) =>
            new TableRow({
              children: row.map((cellText, cIdx) =>
                new TableCell({
                  width: widths[cIdx] ? { size: widths[cIdx], type: WidthType.PERCENTAGE } : undefined,
                  shading: {
                    type: ShadingType.CLEAR,
                    fill: rIdx % 2 === 0 ? "FFFFFF" : headerBg,
                  },
                  margins: { top: 100, bottom: 100, left: 140, right: 140 },
                  children: [
                    new Paragraph({
                      alignment: cIdx === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
                      spacing: { before: 40, after: 40, line: 280 },
                      children: [
                        new TextRun({
                          text: cellText,
                          font: "Times New Roman",
                          size: 22,
                          color: darkSlate,
                        }),
                      ],
                    }),
                  ],
                })
              ),
            })
        ),
      ],
    });
  };

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 2.54cm
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
                    text: "Tài liệu Hướng dẫn sử dụng SafeZone Học Đường © 2026",
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
            spacing: { before: 80, after: 60 },
            children: [
              new TextRun({
                text: "BỘ GIÁO DỤC VÀ ĐÀO TẠO",
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: "SỞ GIÁO DỤC VÀ ĐÀO TẠO THỪA THIÊN HUẾ — TRƯỜNG THPT PHAN ĐĂNG LƯU",
                bold: true,
                font: "Times New Roman",
                size: 22,
                color: "475569",
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 140 },
            children: [
              new TextRun({
                text: "TÀI LIỆU HƯỚNG DẪN SỬ DỤNG HỆ THỐNG",
                bold: true,
                font: "Times New Roman",
                size: 34,
                color: primaryNavy,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "SAFEZONE HỌC ĐƯỜNG",
                bold: true,
                font: "Times New Roman",
                size: 38,
                color: accentIndigo,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 700 },
            children: [
              new TextRun({
                text: "Nền Tảng Số Hỗ Trợ Sức Khỏe Tâm Lý, Phòng Chống Bạo Lực Học Đường Ẩn Danh & Tham Vấn Đa Trường Ứng Dụng Trí Tuệ Nhân Tạo (AI)",
                italics: true,
                font: "Times New Roman",
                size: 24,
                color: "334155",
              }),
            ],
          }),

          // Box thông tin phiên bản
          new Table({
            width: { size: 80, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: "F8FAFC" },
                    margins: { top: 160, bottom: 160, left: 240, right: 240 },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
                      bottom: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
                      left: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
                      right: { style: BorderStyle.SINGLE, size: 8, color: "CBD5E1" },
                    },
                    children: [
                      p("• Phiên bản hệ thống: SafeZone v2.6 Multi-Tenant Cloud Edition", { size: 22, bold: true, spaceAfter: 60 }),
                      p("• Đối tượng sử dụng: Học sinh THPT, Cán bộ Tư vấn Tâm lý, Ban Giám hiệu, Quản trị viên Trường học", { size: 22, spaceAfter: 60 }),
                      p("• Cơ chế an toàn cốt lõi: Ẩn danh tuyệt đối (Zero-Knowledge) — Khóa PIN băm SHA-256 — Đồng bộ phân vùng đa trường", { size: 22, spaceAfter: 60 }),
                      p("• Ngày ban hành: Năm 2026", { size: 22, italics: true }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 1200 },
            children: [
              new TextRun({
                text: "Thừa Thiên Huế, Năm 2026",
                bold: true,
                font: "Times New Roman",
                size: 24,
              }),
            ],
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= MỤC LỤC & LỜI NÓI ĐẦU =================
          h1("LỜI NÓI ĐẦU & TỔNG QUAN HỆ THỐNG"),
          p(
            "Trong bối cảnh chuyển đổi số giáo dục mạnh mẽ, các vấn đề sức khỏe tâm thần và mâu thuẫn học đường cũng chuyển dịch phức tạp sang không gian số. Đặc biệt, hiện tượng 'bạo lực trắng' (cố tình ngó lơ, seen không trả lời, loại trừ khỏi nhóm chat, hội chứng sợ bỏ lỡ FOMO) đang âm thầm tàn phá tâm lý của hàng ngàn học sinh THPT mà các phương pháp giám sát truyền thống không thể phát hiện."
          ),
          p(
            "Hệ thống SAFEZONE được nghiên cứu và phát triển như một 'Lá chắn học đường & Sức khỏe số' toàn diện. Nền tảng kết hợp chặt chẽ giữa các liệu pháp tâm lý học hành vi (CBT, Bánh xe cảm xúc Plutchik, Giao thức PAUSE) với công nghệ trí tuệ nhân tạo Gemini và hạ tầng đám mây Google Cloud Firestore bảo mật đa trường."
          ),
          p(
            "Tài liệu này được biên soạn nhằm hướng dẫn chi tiết từng bước cho từng nhóm người dùng: Học sinh, Thầy/Cô Cán bộ tư vấn tâm lý, Ban Giám hiệu và Quản trị viên trường học, giúp việc vận hành và tiếp nhận hệ thống diễn ra an toàn, chính xác và hiệu quả cao nhất."
          ),

          calloutBox(
            "NGUYÊN TẮC BẤT DI BẤT DỊCH CỦA SAFEZONE",
            "1. Tuyệt đối không lưu vết học sinh: Không yêu cầu họ tên, lớp, số điện thoại, email cá nhân khi nộp đơn tâm sự hoặc làm bài kiểm tra tâm lý.\n2. Bảo mật phân vùng đa trường: Ban tư vấn trường này tuyệt đối không thể nhìn thấy đơn từ hay thông tin của trường khác.\n3. Quyền tự chủ dữ liệu của học sinh: Dữ liệu cảm xúc chỉ mở khóa bằng mã PIN cá nhân do học sinh tự đặt.",
            accentIndigo,
            "EEF2FF"
          ),

          new Paragraph({ spacing: { after: 120 } }),
          h2("BẢNG TỔNG QUAN PHÂN QUYỀN TRONG HỆ THỐNG"),
          createTable(
            ["Vai trò", "Phạm vi chức năng chính", "Quyền bảo mật"],
            [
              [
                "Học sinh",
                "Khám phá cẩm nang, tự chẩn đoán tâm lý, làm bài test COES/FOMO, gửi đơn phản ánh ẩn danh, trao đổi 2 chiều với thầy cô qua mã theo dõi, trò chuyện cùng AI Cố vấn, đặt mã PIN bảo mật cá nhân.",
                "Ẩn danh 100%, không cần tài khoản, mã PIN tự quản lý.",
              ],
              [
                "Cán bộ Tư vấn Tâm lý",
                "Tiếp nhận đơn phản ánh của học sinh trường mình, phân loại rủi ro (Thấp/TB/Cao/Khẩn cấp), gửi phản hồi bảo mật cho học sinh, lưu nhật ký ca tư vấn nội bộ.",
                "Đăng nhập bằng Email giáo viên, chỉ xem đơn thuộc trường mình phụ trách.",
              ],
              [
                "Ban Giám hiệu / Admin Trường",
                "Xem thống kê tổng quan xu hướng tâm lý trường, quản lý danh sách giáo viên trong Ban Tư vấn, cập nhật phòng trực và hotline BGH.",
                "Toàn quyền quản trị nội bộ trong khuôn khổ trường học.",
              ],
              [
                "Quản trị viên Cấp cao (Master)",
                "Bàn giao & Phân phối hệ thống cho các trường mới, cấp quyền khởi tạo, giám sát sức khỏe hạ tầng hệ thống.",
                "Quyền quản trị hạ tầng phân vùng đa trường.",
              ],
            ],
            [22, 53, 25]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= PHẦN 1 =================
          h1("PHẦN 1: HƯỚNG DẪN DÀNH CHO HỌC SINH"),
          p(
            "SafeZone được thiết kế thân thiện, ấm áp và hoạt động trơn tru trên cả điện thoại di động lẫn máy tính cá nhân. Học sinh có thể truy cập bất kỳ lúc nào mà không cần đăng ký tài khoản."
          ),

          h2("1.1. Màn hình Tổng quan (Dashboard) & Công cụ Chẩn đoán 3 Tầng"),
          p("Khi truy cập trang chủ, học sinh sẽ tiếp cận ngay các tiện ích sơ cứu tâm lý:"),
          p("• Tự chẩn đoán tình huống học đường 3 tầng: Bấm chọn các tình huống cụ thể (Ví dụ: Bạn bè seen không trả lời, bị xóa khỏi nhóm chat, bị nói xấu sau lưng...). Hệ thống sẽ lập tức phân tích đâu là hành vi vô tình, đâu là bạo lực trắng có chủ đích và đề xuất chiến lược phản ứng thông minh."),
          p("• Bánh xe cảm xúc 8 nhóm Plutchik: Chọn nhanh tâm trạng hiện tại (Vui vẻ, tin tưởng, sợ hãi, bất ngờ, buồn bã, chán ghét, giận dữ, mong đợi). Hệ thống sẽ tự động lưu lại biểu đồ diễn biến tâm trạng để học sinh tự theo dõi sức khỏe tinh thần của mình."),
          p("• Nút Thoát khẩn cấp (Panic Button / Phím ESC): Nếu đang sử dụng máy tính ở phòng thực hành hoặc có bạn bè lại gần, học sinh chỉ cần bấm phím 'ESC' trên bàn phím hoặc nút thoát khẩn cấp, màn hình sẽ lập tức chuyển hướng sang trang Wikipedia Toán học, không để lộ bất kỳ dấu vết nào."),

          h2("1.2. Khám phá Cẩm nang Tâm lý Số tương tác"),
          p("Tại tab 'Cẩm Nang Số', học sinh được cung cấp các công cụ khoa học thực chứng:"),
          p("1. Thang đo Trải nghiệm Lạnh nhạt số (COES - Cyber Ostracism Experience Scale): Trả lời 5 câu hỏi trắc nghiệm Likert từ 1 đến 5 để đánh giá mức độ em đang bị cô lập trên mạng xã hội."),
          p("2. Thang đo Hội chứng sợ bỏ lỡ (State-FoMO): 10 câu hỏi đo lường mức độ lệ thuộc vào thế giới ảo và sự bồn chồn khi không biết bạn bè đang làm gì."),
          p("3. Sân tập Tái cấu trúc nhận thức CBT: Công cụ hướng dẫn học sinh phân tách giữa 'Sự kiện khách quan' và 'Suy nghĩ tự động tiêu cực', từ đó hình thành 'Góc nhìn tái cấu trúc cân bằng', xoa dịu cảm giác tự trách bản thân."),
          p("4. Giao thức 5 bước PAUSE: Hướng dẫn chi tiết từng câu nói mẫu và kỹ thuật mở lời đối thoại trực tiếp để giải tỏa hiểu lầm với bạn bè."),
          p("5. Kỹ thuật điều hòa nhịp thở 4-7-8 & Grounding 5-4-3-2-1: Hướng dẫn trực quan bằng hoạt họa nhịp thở giúp giải tỏa cơn hoảng loạn, run sợ trong vòng 2 phút."),

          h2("1.3. Quy trình Gửi Đơn Phản Ánh / Tâm Sự Ẩn Danh"),
          p("Khi gặp bất kỳ khó khăn nào (bị bắt nạt, bị cô lập, áp lực gia đình, trầm cảm), học sinh thực hiện 4 bước gửi đơn sau:"),
          p("• Bước 1: Chọn trường học em đang theo học (để đơn được gửi chính xác đến Thầy/Cô tư vấn trường đó)."),
          p("• Bước 2: Chọn phân loại vấn đề (Bạo lực thân thể, Bạo lực mạng, Bạo lực trắng, Khủng hoảng tâm lý, Áp lực học đường...)."),
          p("• Bước 3: Nhập nội dung chia sẻ. Có thể đính kèm ảnh chụp màn hình bằng chứng nếu cần thiết."),
          p("• Bước 4: Nhấn nút 'GỬI ĐƠN ẨN DANH' ➜ Hệ thống sẽ cấp cho em một MÃ THEO DÕI BẢO MẬT DUY NHẤT (Ví dụ: SZ-892147)."),

          calloutBox(
            "LƯU Ý QUAN TRỌNG VỀ MÃ THEO DÕI",
            "Mã theo dõi (SZ-XXXXXX) là chìa khóa DUY NHẤT để em kiểm tra tiến độ xử lý và xem câu trả lời của Thầy/Cô. Hệ thống không lưu email hay tên em, vì vậy hãy chụp màn hình hoặc ghi nhớ mã này vào nơi an toàn!",
            alertRose,
            "FFF1F2"
          ),

          p("• Tra cứu và Đối thoại 2 chiều: Tại tab 'Báo Cáo Ẩn Danh', em chỉ cần nhập mã theo dõi vào ô 'Tra cứu đơn' ➜ Ngay lập tức sẽ thấy phản hồi riêng tư từ Thầy/Cô tư vấn và có thể tiếp tục nhắn tin trao đổi qua lại hoàn toàn ẩn danh."),

          h2("1.4. Trò chuyện cùng Trợ lý AI Cố vấn SafeZone"),
          p("• Hoạt động 24/7: Cung cấp giải tỏa cảm xúc tức thì khi học sinh gặp khủng hoảng vào ban đêm hoặc ngoài giờ hành chính."),
          p("• Nguyên tắc AI: Lắng nghe không phán xét, dựa trên khung tham vấn tâm lý học đường, đưa ra các câu hỏi mở giúp học sinh bình tâm."),
          p("• Tự động kích hoạt cứu hộ: Nếu phát hiện học sinh có dấu hiệu tự hại hoặc nguy hiểm tính mạng, AI sẽ hiển thị ngay số Tổng đài quốc gia 111 và số hotline trường học để hỗ trợ cấp cứu."),

          h2("1.5. Thiết lập Mã PIN Cá nhân & Đồng bộ Đa Thiết Bị"),
          p("• Nhấn vào nút 'BẢO MẬT' ở góc trên màn hình: Học sinh có thể tự đặt một Mã PIN bí mật 4 chữ số."),
          p("• Tính năng Khóa tự động: Khi người lạ mở máy em lên, màn hình sẽ hiển thị bàn phím số yêu cầu nhập đúng mã PIN mới xem được nhật ký tâm lý."),
          p("• Tự động đồng bộ lên đám mây: Toàn bộ nhật ký cảm xúc, kết quả bài test và danh sách mã đơn đã gửi sẽ được mã hóa gắn với mã PIN này. Khi em đổi sang điện thoại mới hoặc máy tính khác, chỉ cần nhập đúng mã PIN cũ là toàn bộ dữ liệu tự động phục hồi!"),
          p("• Nút Tự Hủy Khẩn Cấp (Self-Destruct): Nếu có người ép buộc em mở màn hình, chỉ cần bấm 'Quên PIN / Tự Hủy', hệ thống sẽ xóa sạch toàn bộ dữ liệu lưu trên máy ngay lập tức."),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= PHẦN 2 =================
          h1("PHẦN 2: HƯỚNG DẪN DÀNH CHO CÁN BỘ TƯ VẤN TÂM LÝ"),
          p(
            "Giao diện Bảng điều khiển Chuyên sâu (Counselor Dashboard) là không gian làm việc chuyên biệt dành cho Ban Tư Vấn Tâm Lý Học Đường và Ban Giám Hiệu."
          ),

          h2("2.1. Đăng nhập và Xác thực Chuyên sâu"),
          p("• Bước 1: Nhấp vào tab 'Phòng Tư Vấn Tâm Lý' trên thanh điều hướng."),
          p("• Bước 2: Nhập Email giáo viên và Mật khẩu được cấp."),
          p("• Bước 3: Hệ thống nhận diện danh tính và tự động mở đúng không gian dữ liệu của trường Thầy/Cô."),

          h2("2.2. Phân loại Rủi ro và Tiếp nhận Đơn phản ánh"),
          p("Mọi đơn học sinh gửi lên sẽ hiển thị theo hàng đợi xử lý kèm mức độ ưu tiên:"),
          createTable(
            ["Mức độ rủi ro", "Màu sắc chỉ báo", "Tiêu chí phân loại", "Thời gian can thiệp khuyến nghị"],
            [
              ["Khẩn cấp", "Đỏ rực (Red Alert)", "Có dấu hiệu bạo lực thể xác nguy cấp, đe dọa tống tiền, tự hại", "Can thiệp trong vòng 15 - 30 phút"],
              ["Cao", "Cam (High Risk)", "Bị cô lập có hệ thống, tẩy chay tập thể kéo dài, khủng hoảng tâm lý nặng", "Xử lý trong vòng 2 - 4 giờ"],
              ["Trung bình", "Vàng (Medium)", "Mâu thuẫn nhóm bạn bè, bất an trên mạng, hội chứng FOMO", "Xử lý trong vòng 12 - 24 giờ"],
              ["Thấp / Tâm sự", "Xanh lam (Low/Info)", "Chia sẻ cảm xúc học tập, hỏi kỹ năng giao tiếp, tâm sự nhẹ nhàng", "Hồi đáp trong 1 - 2 ngày"],
            ],
            [18, 20, 42, 20]
          ),

          h2("2.3. Quy trình Xử lý Ca và Đối thoại 2 Chiều"),
          p("1. Nhấp vào đơn cần xử lý để xem chi tiết nội dung và ảnh bằng chứng đính kèm."),
          p("2. Cán bộ tư vấn nhập tin nhắn hồi đáp chuyên môn vào khung phản hồi. Em học sinh khi tra cứu mã đơn sẽ đọc được tin nhắn này."),
          p("3. Cập nhật trạng thái ca: Chuyển đổi từ 'Chờ xử lý' ➜ 'Đang tham vấn' ➜ 'Đã giải quyết' để theo dõi tiến độ."),
          p("4. Phân công cán bộ: Trưởng ban tư vấn có thể chỉ định cụ thể Thầy/Cô nào phụ trách ca này."),
          p("5. Ghi chú bảo mật nội bộ: Phần ghi chú này chỉ các giáo viên trong ban tư vấn nhìn thấy, dùng để hội chẩn nghiệp vụ, học sinh hoàn toàn không thấy."),

          calloutBox(
            "NGUYÊN TẮC ĐẠO ĐỨC THAM VẤN HỌC ĐƯỜNG",
            "1. Tuyệt đối không dò hỏi danh tính hay ép buộc học sinh phải lộ diện nếu em chưa sẵn sàng.\n2. Lắng nghe với thái độ đồng cảm, tôn trọng, không chỉ trích, không xem nhẹ cảm xúc của học sinh.\n3. Nếu có dấu hiệu nguy hại tính mạng, phối hợp ngay với Ban Giám hiệu và Phụ huynh theo quy trình bảo vệ trẻ em.",
            secondaryBlue,
            "F0F9FF"
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= PHẦN 3 =================
          h1("PHẦN 3: HƯỚNG DẪN DÀNH CHO BAN GIÁM HIỆU & ADMIN NHÀ TRƯỜNG"),
          p(
            "Ban Giám hiệu và Quản trị viên trường học đóng vai trò thiết lập môi trường, giám sát tổng thể và quản lý nhân sự tư vấn."
          ),

          h2("3.1. Quản lý Danh sách Cán bộ Tư vấn Nhà trường"),
          p("Tại mục 'Quản lý Đội ngũ Cán bộ Tư vấn' trong Dashboard:"),
          p("• Thêm mới Cán bộ: Nhập Họ tên, Email ngành giáo dục, Số điện thoại và Vai trò (Trưởng ban tư vấn, Cán bộ tâm lý, Giáo viên cố vấn)."),
          p("• Phân quyền và Cập nhật trạng thái: Có thể bật/tắt trạng thái trực ca của từng giáo viên để học sinh biết ai đang sẵn sàng hỗ trợ."),
          p("• Thu hồi tài khoản: Khi giáo viên chuyển công tác, Admin trường có thể xóa hoặc đổi mật khẩu tài khoản ngay lập tức."),

          h2("3.2. Cấu hình Thông tin Tiếp nhận Riêng của Trường"),
          p("Mỗi trường học có thể tùy biến các thông tin định danh nội bộ:"),
          p("• Vị trí Phòng tư vấn học đường: Ví dụ 'Phòng A.204 - Tầng 2 Dãy nhà Hiệu bộ'."),
          p("• Đường dây nóng khẩn cấp của Ban Giám hiệu: Số điện thoại tiếp nhận 24/7."),
          p("• Lịch trực tư vấn trực tiếp: Giờ tiếp nhận học sinh tại trường."),

          h2("3.3. Giám sát Báo cáo Thống kê Xu hướng Học đường"),
          p("• Hệ thống tự động tổng hợp số liệu trực quan: Tỷ lệ các loại hành vi (Bạo lực trắng, bạo lực mạng, mâu thuẫn học tập...)."),
          p("• Thống kê tỷ lệ ca đã giải quyết thành công và thời gian phản hồi trung bình của Ban tư vấn."),
          p("• Cảnh báo sớm các đợt cao điểm căng thẳng (Ví dụ: Giai đoạn thi học kỳ hoặc đầu năm học mới) để Nhà trường chủ động tổ chức các buổi sinh hoạt chuyên đề."),

          h2("3.4. Quy trình Bàn Giao & Phân Phối Trường Mới (Multi-Tenant Isolation)"),
          p("Đối với tài khoản Master: Khi triển khai mở rộng cho một trường học đối tác mới:"),
          p("• Bước 1: Nhấn vào nút 'Phân phối & Bàn giao trường học mới'."),
          p("• Bước 2: Nhập Tên trường tiếp nhận (Ví dụ: THPT Chuyên Quốc Học, THPT Hai Bà Trưng...), Email và Mật khẩu khởi tạo cho Quản trị viên trường bạn."),
          p("• Bước 3: Xác nhận khởi tạo. Trường mới sẽ được cấp ngay một không gian độc lập sạch 100%, máy chủ tự động phân tách cơ sở dữ liệu."),
          p("• Cơ chế cách ly tuyệt đối: Cán bộ trường A không thể truy cập dữ liệu của trường B và ngược lại, bảo vệ quyền riêng tư theo tiêu chuẩn an ninh thông tin cao nhất."),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= PHẦN 4 =================
          h1("PHẦN 4: CÂU HỎI THƯỜNG GẶP (FAQ) & XỬ LÝ SỰ CỐ"),

          h2("1. Học sinh làm mất mã theo dõi (SZ-XXXXXX) thì phải làm sao?"),
          p(
            "Vì hệ thống vận hành theo nguyên tắc ẩn danh tuyệt đối (Zero-Knowledge) và không lưu bất kỳ thông tin nhận dạng nào, máy chủ không thể tự ý tìm lại mã nếu học sinh quên. Tuy nhiên, nếu học sinh đã từng cài đặt MÃ PIN BẢO MẬT, danh sách các mã đơn em đã nộp sẽ tự động được lưu trong vùng an toàn theo mã PIN đó. Học sinh chỉ cần vào mục Bảo Mật ➜ Xem lại lịch sử mã đơn."
          ),

          h2("2. Khi chuyển sang máy tính mới hoặc dùng điện thoại, làm sao để giữ dữ liệu?"),
          p(
            "Rất đơn giản: Tại thiết bị cũ, học sinh hãy chắc chắn đã đặt Mã PIN tại mục 'Bảo Mật'. Khi sang thiết bị mới, học sinh chỉ cần nhập đúng Mã PIN đó tại màn hình khóa bảo mật. Toàn bộ nhật ký cảm xúc và các bài khảo sát sẽ tự động được tải về thiết bị mới."
          ),

          h2("3. Dữ liệu của nhiều trường có nguy cơ bị đầy bộ nhớ không?"),
          p(
            "Không thể bị đầy. SafeZone ứng dụng kiến trúc Google Cloud Firestore NoSQL phân tán tự động mở rộng (Auto-scaling). Dữ liệu văn bản được nén tối ưu (trung bình 1 năm của một trường chỉ chiếm khoảng 7MB). Kể cả khi triển khai cho hàng trăm trường học trong suốt 10 năm, dung lượng vẫn hoàn toàn đáp ứng trơn tru."
          ),

          h2("4. Thầy cô có nhìn thấy được tin nhắn của học sinh với AI Cố vấn không?"),
          p(
            "Tuyệt đối không. Cuộc trò chuyện giữa học sinh và Trợ lý AI được xử lý trực tiếp và chỉ lưu trên trình duyệt của học sinh đó. Thầy cô chỉ tiếp nhận và xử lý các Đơn phản ánh/Tâm sự mà học sinh chủ động bấm nút GỬI lên hệ thống."
          ),

          new Paragraph({ spacing: { before: 240, after: 120 } }),
          h1("PHẦN 5: ĐẦU MỐI LIÊN HỆ & ĐƯỜNG DÂY NÓNG HỖ TRỢ"),
          createTable(
            ["Kênh hỗ trợ", "Đầu mối liên hệ", "Thời gian tiếp nhận", "Ghi chú"],
            [
              ["Tổng đài Quốc gia Bảo vệ Trẻ em", "111 (Miễn phí cước gọi)", "24/7 tất cả các ngày", "Hỗ trợ khẩn cấp toàn quốc"],
              ["Tổng đài Tư vấn Tâm lý Ngày Đêm", "1900 6233", "8:00 - 22:00 hàng ngày", "Chuyên gia tâm lý hỗ trợ"],
              ["Đường dây nóng BGH Nhà trường", "Theo số cấu hình riêng của từng trường", "Giờ hành chính & Khẩn cấp", "Tiếp nhận can thiệp trực tiếp tại trường"],
              ["Hỗ trợ Kỹ thuật SafeZone", "Ban Nghiên cứu Khoa học Kỹ thuật", "24/7 qua hệ thống", "Bảo trì và cập nhật nền tảng"],
            ],
            [26, 26, 24, 24]
          ),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 800 },
            children: [
              new TextRun({
                text: "--- HẾT TÀI LIỆU HƯỚNG DẪN SỬ DỤNG ---",
                bold: true,
                font: "Times New Roman",
                size: 22,
                color: "94A3B8",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("public/Huong_Dan_Su_Dung_SafeZone.docx", buffer);
  console.log("SUCCESS: Created public/Huong_Dan_Su_Dung_SafeZone.docx (" + buffer.length + " bytes)");
}

generateUserManualDocument().catch((err) => {
  console.error("ERROR generating document:", err);
  process.exit(1);
});
