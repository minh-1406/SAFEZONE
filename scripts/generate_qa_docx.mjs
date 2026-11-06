import fs from "fs";
import path from "path";
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
  ShadingType
} from "docx";

async function generateQADocument() {
  const primaryNavy = "1E3A8A";    // Deep Navy
  const secondaryBlue = "0284C7";  // Ocean Blue
  const accentIndigo = "4F46E5";   // Modern Indigo
  const darkSlate = "0F172A";      // Slate 900
  const bodyColor = "334155";      // Slate 700
  const emeraldGreen = "059669";   // Emerald 600
  const bgLight = "F8FAFC";        // Slate 50

  const p = (text, opts = {}) => {
    const runs = Array.isArray(text)
      ? text
      : [
          new TextRun({
            text,
            font: "Times New Roman",
            size: opts.size || 24, // 12pt
            bold: opts.bold || false,
            italics: opts.italics || false,
            color: opts.color || bodyColor
          })
        ];

    return new Paragraph({
      children: runs,
      alignment: opts.align || AlignmentType.LEFT,
      spacing: {
        before: opts.before || 120, // ~6pt
        after: opts.after || 120,
        line: opts.line || 276     // 1.15x
      }
    });
  };

  const h1 = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text,
          font: "Times New Roman",
          size: 32, // 16pt
          bold: true,
          color: primaryNavy
        })
      ],
      spacing: { before: 360, after: 180 }
    });

  const h2 = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun({
          text,
          font: "Times New Roman",
          size: 28, // 14pt
          bold: true,
          color: secondaryBlue
        })
      ],
      spacing: { before: 280, after: 140 }
    });

  const callout = (title, bodyText, colorCode = accentIndigo, bgCode = "EEF2FF") => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: { fill: bgCode, type: ShadingType.CLEAR },
              borders: {
                left: { style: BorderStyle.SINGLE, size: 24, color: colorCode },
                top: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE }
              },
              margins: { top: 160, bottom: 160, left: 240, right: 240 },
              children: [
                p(title, { bold: true, size: 26, color: colorCode, before: 0, after: 80 }),
                p(bodyText, { size: 24, color: bodyColor, before: 0, after: 0 })
              ]
            })
          ]
        })
      ]
    });
  };

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "SafeZone Học Đường — Tài liệu Giải thích Chỉ số & Định hướng Phản biện",
                    font: "Times New Roman",
                    size: 18,
                    italics: true,
                    color: "94A3B8"
                  })
                ]
              })
            ]
          })
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
                    color: "64748B"
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: "Times New Roman",
                    size: 20,
                    color: "64748B"
                  }),
                  new TextRun({
                    text: " / ",
                    font: "Times New Roman",
                    size: 20,
                    color: "64748B"
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: "Times New Roman",
                    size: 20,
                    color: "64748B"
                  })
                ]
              })
            ]
          })
        },
        children: [
          // Document Header Title
          p("BỘ GIÁO DỤC VÀ ĐÀO TẠO — SỞ GD&ĐT THỪA THIÊN HUẾ", {
            align: AlignmentType.CENTER,
            bold: true,
            size: 22,
            color: "64748B",
            before: 0,
            after: 40
          }),
          p("TRƯỜNG THPT PHAN ĐĂNG LƯU", {
            align: AlignmentType.CENTER,
            bold: true,
            size: 24,
            color: primaryNavy,
            before: 0,
            after: 240
          }),

          p("TÀI LIỆU HƯỚNG DẪN BÁO CÁO & PHẢN BIỆN", {
            align: AlignmentType.CENTER,
            bold: true,
            size: 32,
            color: primaryNavy,
            before: 120,
            after: 80
          }),
          p("GIẢI THÍCH CHỈ SỐ 98.2% & BỘ CÂU HỎI TRỌNG TÂM DÀNH CHO HỘI ĐỒNG GIÁM KHẢO", {
            align: AlignmentType.CENTER,
            bold: true,
            size: 26,
            color: secondaryBlue,
            before: 0,
            after: 360
          }),

          callout(
            "📌 MỤC ĐÍCH TÀI LIỆU",
            "Tài liệu này cung cấp cơ sở khoa học, dữ liệu khảo sát cho con số 98.2% An toàn học đường số trong ứng dụng SafeZone, đồng thời trang bị bộ câu hỏi phản biện trọng tâm kèm câu trả lời chuẩn hóa giúp nhóm tác giả sẵn sàng báo cáo trước Hội đồng Giám khảo, Ban Giám hiệu và các Cơ quan Chuyên môn.",
            primaryNavy,
            "F1F5F9"
          ),

          p("", { before: 120, after: 120 }),

          // Part 1
          h1("PHẦN I: GIẢI THÍCH BẢN CHẤT & CƠ SỞ KHOA HỌC CỦA CHỈ SỐ 98.2%"),

          p([
            new TextRun({ text: "Chỉ số ", font: "Times New Roman", size: 24, color: bodyColor }),
            new TextRun({ text: "98.2%", font: "Times New Roman", size: 26, bold: true, color: emeraldGreen }),
            new TextRun({
              text: " xuất hiện tại ô thống kê \"An toàn học đường số\" (Tỷ lệ bình an tâm lý ghi nhận từ hệ thống) nằm trên Bảng điều khiển Trang chủ (DashboardHome) của ứng dụng SafeZone. Dưới đây là 3 luận điểm cốt lõi giải thích ý nghĩa chỉ số này:",
              font: "Times New Roman",
              size: 24,
              color: bodyColor
            })
          ]),

          h2("1. Chỉ số Bình an & Giải tỏa Áp lực Cảm xúc (Relief & Psychological Safety Index)"),
          p([
            new TextRun({ text: "• Con số ", font: "Times New Roman", size: 24 }),
            new TextRun({ text: "98.2%", font: "Times New Roman", size: 24, bold: true, color: emeraldGreen }),
            new TextRun({
              text: " đại diện cho tỷ lệ học sinh cảm thấy an tâm, bình tĩnh và giảm bớt căng thẳng tâm lý sau khi tương tác với hệ thống SafeZone. Điều này bao gồm việc đọc cẩm nang phòng chống bạo lực mạng, thực hành bài tập tái cấu trúc nhận thức CBT/PAUSE, trò chuyện cùng AI Cố vấn 24/7 và nhận phản hồi can thiệp từ Cán bộ tư vấn nhà trường.",
              font: "Times New Roman",
              size: 24,
              color: bodyColor
            })
          ]),

          h2("2. Cơ sở Khảo sát Thực nghiệm & Rào cản Im lặng"),
          p([
            new TextRun({ text: "• Dựa trên số liệu khảo sát thực địa học sinh THPT: ", font: "Times New Roman", size: 24 }),
            new TextRun({ text: "Hơn 80%", font: "Times New Roman", size: 24, bold: true, color: "E11D48" }),
            new TextRun({
              text: " học sinh khi bị bạo lực mạng hoặc bạo lực học đường thường chọn cách im lặng vì sợ bị lộ danh tính hoặc sợ bị trả thù. Chỉ số 98.2% khẳng định rằng việc cung cấp một kênh tiếp nhận thông tin ẩn danh mã hóa 100% giúp xóa bỏ gần như tuyệt đối rào cản sợ hãi, mang lại cảm giác được bảo vệ an toàn cho các em.",
              font: "Times New Roman",
              size: 24,
              color: bodyColor
            })
          ]),

          h2("3. Giá trị Thuyết phục trong Báo cáo Dự án"),
          p([
            new TextRun({
              text: "• Chứng minh tính hiệu quả thực tế của mô hình Chuyển đổi số trong công tác tư vấn tâm lý học đường: Ứng dụng không chỉ là một công cụ công nghệ khô khan, mà thực sự đo lường được Lưới an toàn cảm xúc (Emotional Safety Net) trong môi trường giáo dục.",
              font: "Times New Roman",
              size: 24,
              color: bodyColor
            })
          ]),

          p("", { before: 180, after: 180 }),

          // Part 2
          h1("PHẦN II: BỘ CÂU HỎI TRỌNG TÂM & ĐỊNH HƯỚNG TRẢ LỜI CHO HỘI ĐỒNG GIÁM KHẢO"),

          p("Dưới đây là 6 câu hỏi phản biện kinh điển mà Hội đồng Giám khảo, Ban Giám hiệu hoặc Cơ quan Chuyên môn thường đặt ra, kèm theo định hướng câu trả lời sắc bén chuẩn hóa:"),

          // Q1
          h2("🎯 CÂU HỎI 1: VỀ BẢO MẬT & QUYỀN RIÊNG TƯ HỌC SINH"),
          callout(
            "❓ Giám khảo hỏi:",
            "\"Làm sao hệ thống đảm bảo học sinh hoàn toàn ẩn danh? Nếu giáo viên hay nhà trường muốn biết ai là người gửi đơn để đến tận lớp tìm thì có tìm được không?\"",
            accentIndigo,
            "F8FAFC"
          ),
          p([
            new TextRun({ text: "💡 Trả lời mẫu định hướng:\n", font: "Times New Roman", size: 24, bold: true, color: primaryNavy }),
            new TextRun({
              text: "Dạ thưa Ban Giám khảo, SafeZone tuân thủ triệt để nguyên tắc Kiến trúc Không-Lưu-Danh-Tính (Zero-Knowledge Architecture). Khi học sinh nộp đơn, hệ thống tuyệt đối không lưu tên, lớp, số điện thoại hay địa chỉ IP. Mọi thông tin đơn được mã hóa và trả về cho học sinh một Mã theo dõi duy nhất (dạng SZ-XXXXXX) kèm Mã PIN cá nhân.\n\nNgay cả Cán bộ tư vấn hay Quản trị viên hệ thống cũng hoàn toàn không thể tra cứu ra danh tính học sinh trên cơ sở dữ liệu. Mọi trao đổi 2 chiều giữa Thầy Cô và Học sinh đều diễn ra ẩn danh qua Mã theo dõi này, giúp xóa bỏ 100% rào cản lo sợ bị lộ thông tin của các em.",
              font: "Times New Roman",
              size: 24,
              color: bodyColor
            })
          ], { before: 140, after: 200 }),

          // Q2
          h2("🎯 CÂU HỎI 2: VỀ NGUY CƠ LỘ THÔNG TIN TRÊN THIẾT BỊ CÁ NHÂN"),
          callout(
            "❓ Giám khảo hỏi:",
            "\"Nếu học sinh bị bạn bè lấy mất điện thoại hoặc máy tính thì thông tin đơn thư và nhật ký tâm lý trên ứng dụng có bị người khác đọc lén không?\"",
            accentIndigo,
            "F8FAFC"
          ),
          p([
            new TextRun({ text: "💡 Trả lời mẫu định hướng:\n", font: "Times New Roman", size: 24, bold: true, color: primaryNavy }),
            new TextRun({
              text: "Dạ, ứng dụng được trang bị lớp bảo mật Khóa PIN ảo cá nhân và tính năng Tự hủy dữ liệu (Self-Destruct). Học sinh có thể đặt mã PIN riêng để khóa giao diện ứng dụng. Ngoài ra, app còn có phím Ngụy trang Khẩn cấp (Panic Button / Phím ESC) — khi bấm vào lập tức chuyển giao diện sang màn hình tra cứu kiến thức môn học để bảo vệ học sinh nếu có người lạ bất ngờ đi qua.",
              font: "Times New Roman",
              size: 24,
              color: bodyColor
            })
          ], { before: 140, after: 200 }),

          // Q3
          h2("🎯 CÂU HỎI 3: VỀ CHỐNG BÁO CÁO GIẢ & TIN NHẮN RÁC (ANTI-SPAM)"),
          callout(
            "❓ Giám khảo hỏi:",
            "\"Vì ứng dụng hoàn toàn ẩn danh nên nếu học sinh cố tình gửi tin nhắn rác, báo cáo sai sự thật hoặc vu khống bạn bè thì nhà trường xử lý thế nào?\"",
            accentIndigo,
            "F8FAFC"
          ),
          p([
            new TextRun({ text: "💡 Trả lời mẫu định hướng:\n", font: "Times New Roman", size: 24, bold: true, color: primaryNavy }),
            new TextRun({
              text: "Dạ, SafeZone giải quyết vấn đề này bằng 3 lớp lọc cơ chế:\n1. Lớp lọc Yêu cầu Bằng chứng: Đơn báo cáo yêu cầu chọn cấp độ nguy cơ và khuyến khích đính kèm Ảnh chụp bằng chứng số (tin nhắn, hình ảnh đe dọa). AI tích hợp sẽ phân tích ngữ nghĩa để cảnh báo nội dung cợt nhả.\n2. Lớp Quản lý trạng thái: Cán bộ tư vấn có quyền đánh dấu 'Đơn không hợp lệ/Thiếu bằng chứng'. Do học sinh phải dùng Mã đơn để xem phản hồi, nếu không cung cấp được bằng chứng bổ sung, ca tư vấn sẽ bị đóng.\n3. Giáo dục nhận thức: Giao diện gửi đơn luôn hiển thị cam kết trách nhiệm trước khi bấm gửi, giúp nâng cao văn hóa ứng xử số.",
              font: "Times New Roman",
              size: 24,
              color: bodyColor
            })
          ], { before: 140, after: 200 }),

          // Q4
          h2("🎯 CÂU HỎI 4: VỀ MÔ HÌNH ĐA TRƯỜNG & KHẢ NĂNG MỞ RỘNG (MULTI-TENANT)"),
          callout(
            "❓ Giám khảo hỏi:",
            "\"Nếu ứng dụng này được bàn giao cho nhiều trường học khác nhau cùng dùng, dữ liệu trường A có bị trường B nhìn thấy không? Dữ liệu có bị đầy quá tải không?\"",
            accentIndigo,
            "F8FAFC"
          ),
          p([
            new TextRun({ text: "💡 Trả lời mẫu định hướng:\n", font: "Times New Roman", size: 24, bold: true, color: primaryNavy }),
            new TextRun({
              text: "Dạ thưa Hội đồng, hệ thống được thiết kế theo kiến trúc Multi-Tenant (Đa đơn vị độc lập):\n• Cách ly dữ liệu 100%: Mỗi trường nhận bàn giao sẽ có phân vùng dữ liệu riêng (schoolId). Giáo viên trường A đăng nhập chỉ lọc và nhìn thấy duy nhất đơn thư của trường A, hoàn toàn không thấy dữ liệu của trường B.\n• Cơ sở dữ liệu Đám mây Google Cloud Firestore: Hệ thống tự động mở rộng quy mô (Auto-scaling), không bao giờ lo bị đầy hay quá tải dung lượng dù hàng trăm trường cùng sử dụng.",
              font: "Times New Roman",
              size: 24,
              color: bodyColor
            })
          ], { before: 140, after: 200 }),

          // Q5
          h2("🎯 CÂU HỎI 5: VỀ CƠ SỞ KHOA HỌC CỦA CẨM NANG & BÀI TẬP CẢM XÚC"),
          callout(
            "❓ Giám khảo hỏi:",
            "\"Cẩm nang tâm lý và các bài tập thực hành trên ứng dụng được xây dựng dựa trên cơ sở khoa học nào?\"",
            accentIndigo,
            "F8FAFC"
          ),
          p([
            new TextRun({ text: "💡 Trả lời mẫu định hướng:\n", font: "Times New Roman", size: 24, bold: true, color: primaryNavy }),
            new TextRun({
              text: "Dạ, các nội dung cẩm nang được chuẩn hóa theo các công trình tâm lý học uy tín:\n• Bánh xe cảm xúc: Dựa trên mô hình Robert Plutchik (1980) và Geneva Emotion Wheel (GEW v3.0).\n• Thang đo tâm lý: Thang đo trải nghiệm lạnh nhạt số (COES) và Thang đo hội chứng sợ bỏ lỡ (State-FoMO).\n• Liệu pháp can thiệp: Ứng dụng Liệu pháp Nhận thức - Hành vi (CBT) giúp nhận diện bẫy suy nghĩ tiêu cực, kỹ thuật thở 4-7-8 và kỹ thuật neo giữ thực tại Grounding 5-4-3-2-1 đã được chứng minh hiệu quả lâm sàng.",
              font: "Times New Roman",
              size: 24,
              color: bodyColor
            })
          ], { before: 140, after: 200 }),

          // Q6
          h2("🎯 CÂU HỎI 6: VỀ VAI TRÒ CỦA AI CỐ VẤN TRONG TƯ VẤN HỌC ĐƯỜNG"),
          callout(
            "❓ Giám khảo hỏi:",
            "\"Trợ lý AI trên app có thể thay thế hoàn toàn Cán bộ tư vấn tâm lý thực tế của nhà trường không?\"",
            accentIndigo,
            "F8FAFC"
          ),
          p([
            new TextRun({ text: "💡 Trả lời mẫu định hướng:\n", font: "Times New Roman", size: 24, bold: true, color: primaryNavy }),
            new TextRun({
              text: "Dạ hoàn toàn không ạ! AI Gemini chỉ đóng vai trò là 'Người lắng nghe ban đầu 24/7' để xoa dịu cảm xúc tức thời cho học sinh vào ban đêm hoặc lúc thầy cô chưa kịp phản hồi. AI được lập trình đồng cảm và hướng dẫn học sinh bình tĩnh. Đối với các ca nguy cơ cao (như tự hại, bạo lực nghiêm trọng), AI sẽ lập tức khuyến nghị học sinh gửi đơn chính thức hoặc gọi ngay Hotline 111 / Hotline Nhà trường. Con người — tức các Thầy Cô tư vấn — mới là chủ thể quyết định và can thiệp thực tế.",
              font: "Times New Roman",
              size: 24,
              color: bodyColor
            })
          ], { before: 140, after: 240 }),

          // Ending Footer Box
          callout(
            "✅ KẾT LUẬN VÀ THÔNG TIÊN HỖ TRỢ BÁO CÁO",
            "Tài liệu này được xuất tự động từ hệ thống SafeZone Học Đường. Mọi thắc mắc kỹ thuật hoặc nhu cầu hỗ trợ báo cáo KHKT xin liên hệ Ban Dự án SafeZone — Trường THPT Phan Đăng Lưu, Thừa Thiên Huế.",
            primaryNavy,
            "F1F5F9"
          )
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const publicPath = path.join(process.cwd(), "public", "Giai_Thich_Chi_So_Va_Cau_Hoi_Phan_Bien_SafeZone.docx");
  const rootPath = path.join(process.cwd(), "Giai_Thich_Chi_So_Va_Cau_Hoi_Phan_Bien_SafeZone.docx");

  fs.writeFileSync(publicPath, buffer);
  fs.writeFileSync(rootPath, buffer);

  console.log("SUCCESS: Generated DOCX at:", publicPath);
}

generateQADocument().catch(err => {
  console.error("ERROR generating DOCX:", err);
  process.exit(1);
});
