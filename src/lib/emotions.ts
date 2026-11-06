export interface PlutchikLevel {
  value: string;
  label: string;
  english: string;
  intensity: "Thấp" | "Vừa" | "Cao";
  desc: string;
}

export interface PlutchikSector {
  id: string;
  name: string;
  emoji: string;
  oppositeSectorId: string;
  colorClass: string; // Base theme
  bgClass: string;    // Light background
  borderClass: string;// Border color
  textClass: string;  // Dark text color
  levels: PlutchikLevel[];
}

export const PLUTCHIK_SECTORS: PlutchikSector[] = [
  {
    id: "joy",
    name: "Vui vẻ (Joy)",
    emoji: "🟡",
    oppositeSectorId: "sadness",
    colorClass: "from-yellow-400 to-amber-500",
    bgClass: "bg-yellow-50",
    borderClass: "border-yellow-250",
    textClass: "text-yellow-700",
    levels: [
      {
        value: "yen_binh",
        label: "Yên bình / Thư thái",
        english: "Serenity",
        intensity: "Thấp",
        desc: "Cảm giác bình tâm, nhẹ lòng, không có áp lực số."
      },
      {
        value: "vui_ve",
        label: "Vui vẻ / Hân tươi",
        english: "Joy",
        intensity: "Vừa",
        desc: "Có nhiều tiếng cười, cảm xúc hạnh phúc lành mạnh."
      },
      {
        value: "han_hoan",
        label: "Hân hoan / Cực lạc",
        english: "Ecstasy",
        intensity: "Cao",
        desc: "Hạnh phúc tột cùng, tràn đầy năng lượng tích cực."
      }
    ]
  },
  {
    id: "trust",
    name: "Tin tưởng (Trust)",
    emoji: "💚",
    oppositeSectorId: "disgust",
    colorClass: "from-lime-400 to-emerald-400",
    bgClass: "bg-lime-50/70",
    borderClass: "border-lime-200",
    textClass: "text-lime-700",
    levels: [
      {
        value: "chap_nhan",
        label: "Dễ chịu / Chấp nhận",
        english: "Acceptance",
        intensity: "Thấp",
        desc: "Chấp nhận hoàn cảnh hiện tại, mở lòng hòa giải."
      },
      {
        value: "tin_tuong",
        label: "Tin tưởng / An tâm",
        english: "Trust",
        intensity: "Vừa",
        desc: "An tâm nương tựa vào thầy cô, bạn bè và Mentor."
      },
      {
        value: "thau_cam",
        label: "Thấu cảm / Kính trọng",
        english: "Admiration",
        intensity: "Cao",
        desc: "Kết nối tâm hồn cực kỳ sâu sắc, kính trọng thầy cô."
      }
    ]
  },
  {
    id: "fear",
    name: "Sợ hãi (Fear)",
    emoji: "🟢",
    oppositeSectorId: "anger",
    colorClass: "from-green-600 to-emerald-800",
    bgClass: "bg-green-50/60",
    borderClass: "border-green-200",
    textClass: "text-green-800",
    levels: [
      {
        value: "e_ngai",
        label: "E dè / Có chút ngại",
        english: "Apprehension",
        intensity: "Thấp",
        desc: "Hơi ngại ngùng khi giao tiếp trong các nhóm kín mạng."
      },
      {
        value: "lo_au",
        label: "Lo âu / Sợ sệt",
        english: "Fear",
        intensity: "Vừa",
        desc: "Lo âu thường trực, sợ hãi bị dòm ngó, cô lập."
      },
      {
        value: "hoang_loan",
        label: "Kinh sợ / Hoảng loạn",
        english: "Terror",
        intensity: "Cao",
        desc: "Kinh sợ tột cùng trước đe dọa bạo lực hoặc bài xích."
      }
    ]
  },
  {
    id: "surprise",
    name: "Ngạc nhiên (Surprise)",
    emoji: "🌐",
    oppositeSectorId: "anticipation",
    colorClass: "from-cyan-400 to-sky-400",
    bgClass: "bg-cyan-50/70",
    borderClass: "border-cyan-200",
    textClass: "text-cyan-700",
    levels: [
      {
        value: "mo_ho",
        label: "Mơ hồ / Xao nhãng",
        english: "Distraction",
        intensity: "Thấp",
        desc: "Xao lãng tâm trí trước các luồng thông tin mạng."
      },
      {
        value: "ngac_nhien",
        label: "Bất ngờ / Ngạc nhiên",
        english: "Surprise",
        intensity: "Vừa",
        desc: "Ngỡ ngàng vì những động thái đột ngột của tập thể."
      },
      {
        value: "ton_thuong",
        label: "Sốc / Tổn thương / Bàng kinh",
        english: "Amazement / Shock",
        intensity: "Cao",
        desc: "Bị tổn thương dữ dội, bàng hoàng bế tắc vì bạo lực trắng."
      }
    ]
  },
  {
    id: "sadness",
    name: "Buồn bã (Sadness)",
    emoji: "🔵",
    oppositeSectorId: "joy",
    colorClass: "from-blue-500 to-indigo-700",
    bgClass: "bg-blue-50/70",
    borderClass: "border-blue-200",
    textClass: "text-blue-700",
    levels: [
      {
        value: "tram_ngam",
        label: "Trầm tư / Buồn nhẹ",
        english: "Pensiveness",
        intensity: "Thấp",
        desc: "Im lặng trầm ngâm suy nghĩ suy xét một mình."
      },
      {
        value: "buon_ba",
        label: "Buồn tủi / Cô độc",
        english: "Sadness",
        intensity: "Vừa",
        desc: "Buồn bã cô đơn vì bị bạn bè ngó lơ, tách biệt nhóm."
      },
      {
        value: "tuyet_vong",
        label: "Đau khổ / Tuyệt vọng",
        english: "Grief",
        intensity: "Cao",
        desc: "Đau buồn cùng cực, tuyệt vọng không tìm thấy lối ra."
      }
    ]
  },
  {
    id: "disgust",
    name: "Chán ghét (Disgust)",
    emoji: "🟣",
    oppositeSectorId: "trust",
    colorClass: "from-violet-400 to-purple-600",
    bgClass: "bg-violet-50/70",
    borderClass: "border-violet-200",
    textClass: "text-violet-700",
    levels: [
      {
        value: "te_nhat",
        label: "Nhạt nhẽo / Tẻ nhạt",
        english: "Boredom",
        intensity: "Thấp",
        desc: "Không thấy hào hứng khi online hay xem mạng xã hội."
      },
      {
        value: "chan_ghet",
        label: "Không thích / Chán ngán",
        english: "Disgust",
        intensity: "Vừa",
        desc: "Chán ngán cảnh bài xích ngầm, so đo giữa các nhóm."
      },
      {
        value: "bai_xich",
        label: "Ghê tởm / Bài xích",
        english: "Loathing",
        intensity: "Cao",
        desc: "Ghê tởm hành vi hạ bệ, thóa mạ trực tuyến dã man."
      }
    ]
  },
  {
    id: "anger",
    name: "Giận dữ (Anger)",
    emoji: "🔴",
    oppositeSectorId: "fear",
    colorClass: "from-red-550 to-rose-700",
    bgClass: "bg-red-50",
    borderClass: "border-red-200",
    textClass: "text-red-700",
    levels: [
      {
        value: "buc_boi",
        label: "Cáu gắt / Bực bối",
        english: "Annoyance",
        intensity: "Thấp",
        desc: "Bứt rứt, khó chịu khi bị công kích, ngáng đường."
      },
      {
        value: "gian_du",
        label: "Phẫn uất / Tức giận",
        english: "Anger",
        intensity: "Vừa",
        desc: "Phẫn chí, bất bình vì sự thiếu công bằng hay vu khống."
      },
      {
        value: "phan_no",
        label: "Phẫn nộ / Áp lực",
        english: "Rage",
        intensity: "Cao",
        desc: "Giận dữ điên người vì áp lực khôn xiết, uất ức."
      }
    ]
  },
  {
    id: "anticipation",
    name: "Kỳ vọng (Anticipation)",
    emoji: "🟠",
    oppositeSectorId: "surprise",
    colorClass: "from-orange-400 to-amber-600",
    bgClass: "bg-orange-50",
    borderClass: "border-orange-200",
    textClass: "text-orange-700",
    levels: [
      {
        value: "quan_tam",
        label: "Tò mò / Quan tâm",
        english: "Interest",
        intensity: "Thấp",
        desc: "Mong muốn tìm hiểu sâu về kỹ năng phòng tránh tổn thương."
      },
      {
        value: "ky_vong",
        label: "Mong đợi / Hy vọng",
        english: "Anticipation",
        intensity: "Vừa",
        desc: "Chờ đón giải pháp an toàn xây dựng văn hóa trường học."
      },
      {
        value: "canh_giac",
        label: "Đề phòng / Cảnh giác",
        english: "Vigilance",
        intensity: "Cao",
        desc: "Chủ động đề phòng cẩn thận, bảo tồn dấu vết bạo lực số."
      }
    ]
  }
];

// Flat list of all emotion items for simple lookup
export const ALL_EMOTIONS = PLUTCHIK_SECTORS.flatMap(sector => 
  sector.levels.map(level => ({
    ...level,
    sectorId: sector.id,
    sectorName: sector.name,
    sectorEmoji: sector.emoji,
    bgClass: sector.bgClass,
    borderClass: sector.borderClass,
    textClass: sector.textClass,
    oppositeSectorId: sector.oppositeSectorId
  }))
);

// Map of legacy & custom keys to full display labels to safeguard existing histories
export const MOOD_DISPLAY_MAP: Record<string, string> = {
  yen_binh: "🟡 Yên bình / Thư thái",
  vui_ve: "🟡 Vui vẻ / Hân tươi",
  binh_thuong: "⚪ Bình thường / Ổn định",
  lo_au: "🟢 Lo âu / Sợ sệt (FoMO)",
  buon_ba: "🔵 Buồn tủi / Cô độc",
  ton_thuong: "🔵 Sốc / Tổn thương",
  buc_boi: "🔴 Cáu gắt / Bực bối",
  phan_no: "🔴 Phẫn nộ / Áp lực cực đỉnh",
  // New Plutchik entries
  han_hoan: "🟡 Hân hoan / Cực lạc",
  chap_nhan: "💚 Dễ chịu / Chấp nhận",
  tin_tuong: "💚 Tin tưởng / An tâm",
  thau_cam: "💚 Thấu cảm / Kính trọng",
  e_ngai: "🟢 E dè / Có chút ngại",
  hoang_loan: "🟢 Kinh sợ / Hoảng loạn",
  mo_ho: "🌐 Mơ hồ / Xao nhãng",
  ngac_nhien: "🌐 Bất ngờ / Ngạc nhiên",
  tram_ngam: "🔵 Trầm tư / Buồn nhẹ",
  tuyet_vong: "🔵 Đau khổ / Tuyệt vọng",
  te_nhat: "🟣 Nhạt nhẽo / Tẻ nhạt",
  chan_ghet: "🟣 Không thích / Chán ngán",
  bai_xich: "🟣 Ghê tởm / Bài xích",
  gian_du: "🔴 Phẫn uất / Tức giận",
  quan_tam: "🟠 Tò mò / Quan tâm",
  ky_vong: "🟠 Mong đợi / Hy vọng",
  canh_giac: "🟠 Đề phòng / Cảnh giác",
  // Geneva Emotion Wheel v3.0 entries
  g_tu_hao: "🦁 Kiêu hãnh / Tự hào (Geneva)",
  g_vui_suong: "🎉 Hân hoan / Vui sướng (Geneva)",
  g_thich_thu: "🎡 Thích thú / Kích thích (Geneva)",
  g_to_mo: "🌟 Tò mò / Quan tâm (Geneva)",
  g_hy_vong: "🌅 Hy vọng / Tin tưởng (Geneva)",
  g_nhe_nhom: "🍃 Nhẹ nhõm / Thở phào (Geneva)",
  g_dong_cam: "🤝 Thương cảm / Đồng cảm (Geneva)",
  g_yeu_thuong: "💖 Yêu thương / Ấm áp (Geneva)",
  g_ton_trong: "👑 Tôn kính / Cảm phục (Geneva)",
  g_hai_long: "🧘 Hài lòng / Thỏa mãn (Geneva)",
  g_buon_ba: "🌧️ Đau buồn / Sầu tổn (Geneva)",
  g_an_han: "💔 Hối tiếc / Ân hận (Geneva)",
  g_tu_ti: "😳 Xấu ổ / Tự ti (Geneva)",
  g_bhoan_loan: "😨 Kinh hoảng / Bất an (Geneva)",
  g_disapp: "🥀 Thất vọng / Hụt hẫng (Geneva)",
  g_gian_du: "🔥 Giận dữ / Cáu bực (Geneva)",
  g_chan_ghet: "🤮 Khinh ghét / Chán ghét (Geneva)",
  g_khinh_miet: "😒 Khinh miệt / Bất bình (Geneva)",
  g_thuhanh: "👿 Căm ghét / Thù hằn (Geneva)",
  g_do_ky: "🍏 Ghen tị / Đố kỵ (Geneva)"
};

export interface GenevaEmotion {
  value: string;
  label: string;
  english: string;
  emoji: string;
  quadrant: "HighPleasant" | "LowPleasant" | "LowUnpleasant" | "HighUnpleasant";
  quadrantLabel: string;
  desc: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export const GENEVA_EMOTIONS: GenevaEmotion[] = [
  // 1. High Control & Pleasant (HighPleasant)
  {
    value: "g_tu_hao",
    label: "Kiêu hãnh / Tự hào",
    english: "Pride",
    emoji: "🦁",
    quadrant: "HighPleasant",
    quadrantLabel: "Làm chủ cao • Tích cực",
    desc: "Cảm thấy trân quý giá trị và thành tựu chân chính của bản thân trước đám đông.",
    bgClass: "bg-amber-50/70",
    borderClass: "border-amber-200",
    textClass: "text-amber-800"
  },
  {
    value: "g_vui_suong",
    label: "Hân hoan / Vui sướng",
    english: "Elation",
    emoji: "🎉",
    quadrant: "HighPleasant",
    quadrantLabel: "Làm chủ cao • Tích cực",
    desc: "Sự thăng hoa, phấn hứng dạt dào khi mục tiêu học tập bứt phá thành công.",
    bgClass: "bg-yellow-50",
    borderClass: "border-yellow-200",
    textClass: "text-yellow-750"
  },
  {
    value: "g_thich_thu",
    label: "Thích thú / Kích thích",
    english: "Amusement",
    emoji: "🎡",
    quadrant: "HighPleasant",
    quadrantLabel: "Làm chủ cao • Tích cực",
    desc: "Cảm giác vui nhộn, hào hứng trước các sáng tạo hay trò đùa lành mạnh.",
    bgClass: "bg-rose-50/70",
    borderClass: "border-rose-200",
    textClass: "text-rose-700"
  },
  // 2. Low Control & Pleasant (LowPleasant)
  {
    value: "g_to_mo",
    label: "Tò mò / Quan tâm",
    english: "Interest",
    emoji: "🌟",
    quadrant: "LowPleasant",
    quadrantLabel: "Làm chủ thấp • Tích cực",
    desc: "Sự lôi cuốn thôi thúc tìm hiểu điều mới mẻ, tự cải thiện nội sinh.",
    bgClass: "bg-cyan-50/70",
    borderClass: "border-cyan-200",
    textClass: "text-cyan-705"
  },
  {
    value: "g_hy_vong",
    label: "Hy vọng / Tin tưởng",
    english: "Hope",
    emoji: "🌅",
    quadrant: "LowPleasant",
    quadrantLabel: "Làm chủ thấp • Tích cực",
    desc: "Niềm tin tươi sáng hướng về tương lai an bình, vượt bão khủng hoảng.",
    bgClass: "bg-indigo-50/70",
    borderClass: "border-indigo-200",
    textClass: "text-indigo-705"
  },
  {
    value: "g_nhe_nhom",
    label: "Nhẹ nhõm / Thở phào",
    english: "Relief",
    emoji: "🍃",
    quadrant: "LowPleasant",
    quadrantLabel: "Làm chủ thấp • Tích cực",
    desc: "Cảm giác trút bỏ gánh nặng, an lòng sau khi hóa giải áp lực hay bêu rếu.",
    bgClass: "bg-emerald-50/70",
    borderClass: "border-emerald-200",
    textClass: "text-emerald-705"
  },
  {
    value: "g_dong_cam",
    label: "Thương cảm / Đồng cảm",
    english: "Compassion",
    emoji: "🤝",
    quadrant: "LowPleasant",
    quadrantLabel: "Làm chủ thấp • Tích cực",
    desc: "Sự rung động xót thương và muốn trợ giúp người có nghịch cảnh tương quý.",
    bgClass: "bg-teal-50/70",
    borderClass: "border-teal-200",
    textClass: "text-teal-705"
  },
  {
    value: "g_yeu_thuong",
    label: "Yêu thương / Ấm áp",
    english: "Love",
    emoji: "💖",
    quadrant: "LowPleasant",
    quadrantLabel: "Làm chủ thấp • Tích cực",
    desc: "Mối liên kết sâu sắc, san sẻ vô điều kiện từ gia đình, bạn hữu vững tâm.",
    bgClass: "bg-pink-50/70",
    borderClass: "border-pink-200",
    textClass: "text-pink-705"
  },
  {
    value: "g_ton_trong",
    label: "Tôn kính / Cảm phục",
    english: "Admiration",
    emoji: "👑",
    quadrant: "LowPleasant",
    quadrantLabel: "Làm chủ thấp • Tích cực",
    desc: "Lòng trân quý thành quả hoặc đức hạnh đáng kính của thầy cô, bạn hiền.",
    bgClass: "bg-orange-50/70",
    borderClass: "border-orange-200",
    textClass: "text-orange-705"
  },
  {
    value: "g_hai_long",
    label: "Hài lòng / Thỏa mãn",
    english: "Contentment",
    emoji: "🧘",
    quadrant: "LowPleasant",
    quadrantLabel: "Làm chủ thấp • Tích cực",
    desc: "Cảm giác bình tịnh, trọn vẹn chấp nhận mọi điều diễn ra quanh mình.",
    bgClass: "bg-lime-50/70",
    borderClass: "border-lime-200",
    textClass: "text-lime-705"
  },
  // 3. Low Control & Unpleasant (LowUnpleasant)
  {
    value: "g_buon_ba",
    label: "Đau buồn / Sầu tổn",
    english: "Sadness",
    emoji: "🌧️",
    quadrant: "LowUnpleasant",
    quadrantLabel: "Làm chủ thấp • Tiêu cực",
    desc: "Phản ứng vật lý hụt hẫng rệu rã khi phát hiện mình bị bỏ rơi hoàn toàn.",
    bgClass: "bg-blue-50/75",
    borderClass: "border-blue-200",
    textClass: "text-blue-705"
  },
  {
    value: "g_an_han",
    label: "Hối tiếc / Ân hận",
    english: "Regret",
    emoji: "💔",
    quadrant: "LowUnpleasant",
    quadrantLabel: "Làm chủ thấp • Tiêu cực",
    desc: "Nỗi dằn vặt lo âu khi tự nghĩ hành động trong quá khứ đã làm tổn thương bè bạn.",
    bgClass: "bg-amber-100/40",
    borderClass: "border-amber-200",
    textClass: "text-amber-805"
  },
  {
    value: "g_tu_ti",
    label: "Xấu hổ / Tự ti",
    english: "Shame",
    emoji: "😳",
    quadrant: "LowUnpleasant",
    quadrantLabel: "Làm chủ thấp • Tiêu cực",
    desc: "Cảm giác lúng túng bẽ bàng, sợ sệt bị người khác dòm ngó định giá phán xét.",
    bgClass: "bg-purple-50/70",
    borderClass: "border-purple-200",
    textClass: "text-purple-705"
  },
  {
    value: "g_bhoan_loan",
    label: "Kinh hoảng / Bất an",
    english: "Fear",
    emoji: "😨",
    quadrant: "LowUnpleasant",
    quadrantLabel: "Làm chủ thấp • Tiêu cực",
    desc: "Báo động đỏ căng thẳng dồn dập tột bực do bị hăm dọa hoặc tẩy chay.",
    bgClass: "bg-red-50/70",
    borderClass: "border-red-200",
    textClass: "text-red-705"
  },
  {
    value: "g_disapp",
    label: "Thất vọng / Hụt hẫng",
    english: "Disappointment",
    emoji: "🥀",
    quadrant: "LowUnpleasant",
    quadrantLabel: "Làm chủ thấp • Tiêu cực",
    desc: "Nỗi bẽ bàng cực độ khi mong mỏi một môi trường tốt lại bị dập tắt phũ phàng.",
    bgClass: "bg-slate-100/80",
    borderClass: "border-slate-200",
    textClass: "text-slate-700"
  },
  // 4. High Control & Unpleasant (HighUnpleasant)
  {
    value: "g_gian_du",
    label: "Giận dữ / Cáu bực",
    english: "Anger",
    emoji: "🔥",
    quadrant: "HighUnpleasant",
    quadrantLabel: "Làm chủ cao • Tiêu cực",
    desc: "Dâng trào adrenaline muốn bùng nổ phản kháng trước bất công, vu khống số.",
    bgClass: "bg-rose-50/80",
    borderClass: "border-rose-200",
    textClass: "text-rose-805"
  },
  {
    value: "g_chan_ghet",
    label: "Khinh ghét / Chán ghét",
    english: "Disgust",
    emoji: "🤮",
    quadrant: "HighUnpleasant",
    quadrantLabel: "Làm chủ cao • Tiêu cực",
    desc: "Sự bác bỏ ghê sợ hành vi lập nhóm chat bộc phát thói ác ôn nhạo báng người khác.",
    bgClass: "bg-orange-50/70",
    borderClass: "border-orange-200",
    textClass: "text-orange-800"
  },
  {
    value: "g_khinh_miet",
    label: "Khinh miệt / Bất bình",
    english: "Contempt",
    emoji: "😒",
    quadrant: "HighUnpleasant",
    quadrantLabel: "Làm chủ cao • Tiêu cực",
    desc: "Cảm giác bất mãn và hạ thấp những động thái lừa dối chia bè phái.",
    bgClass: "bg-amber-100/30",
    borderClass: "border-amber-250",
    textClass: "text-amber-800"
  },
  {
    value: "g_thuhanh",
    label: "Căm ghét / Thù hằn",
    english: "Hate",
    emoji: "👿",
    quadrant: "HighUnpleasant",
    quadrantLabel: "Làm chủ cao • Tiêu cực",
    desc: "Nỗi hằn học bế tắc trầm lắng sục sôi hướng vào thủ phạm gây bạo lực học đường.",
    bgClass: "bg-red-50/45",
    borderClass: "border-red-200",
    textClass: "text-red-950"
  },
  {
    value: "g_do_ky",
    label: "Ghen tị / Đố kỵ",
    english: "Jealousy",
    emoji: "🍏",
    quadrant: "HighUnpleasant",
    quadrantLabel: "Làm chủ cao • Tiêu cực",
    desc: "Bức rực đè nén lòng tham so sánh khi thấy bạn bè phô trương thành tích xa xỉ.",
    bgClass: "bg-emerald-50/70",
    borderClass: "border-emerald-200",
    textClass: "text-emerald-805"
  }
];

export const WHITE_VIOLENCE_INDICATORS = [
  {
    category: "🌀 Nhóm Cảm giác - Trải nghiệm (Mục tiêu tẩy chay / Nạn nhân)",
    items: [
      { id: "v1", role: "victim", label: "Tin nhắn gửi đi bị 'seen' đồng loạt hoặc mọi người cố tình bơ mình đi." },
      { id: "v2", role: "victim", label: "Thấy mình không được mời tham gia các group chat/nhóm học dù trước đó vẫn chơi chung." },
      { id: "v3", role: "victim", label: "Phát hiện có những trạng thái (story/status) bóng gió mỉa mai dường như nhắm vào mình." },
      { id: "v4", role: "victim", label: "Mọi người đột ngột im lặng hoặc đổi chủ đề gượng gạo ngay khi mình bước tới." }
    ]
  },
  {
    category: "🫣 Nhóm Im lặng - Quan sát (Người ngoài cuộc thụ động / Nhắm mắt làm ngơ)",
    items: [
      { id: "b1", role: "bystander", label: "Biết một bạn đang bị loại trừ/tẩy chay nhưng chọn im lặng vì sợ bản thân bị ghét lây." },
      { id: "b2", role: "bystander", label: "Thấy người khác bị xúc phạm bóng gió trên mạng nhưng lướt qua, coi như không liên quan." },
      { id: "b3", role: "bystander", label: "Tránh tiếp xúc với bạn đang bị cô lập để giữ an toàn cho vị trí của mình trong nhóm." },
      { id: "b4", role: "bystander", label: "Tin rằng 'chỉ cần mình không trêu chọc thì mình hoàn toàn vô tội'." }
    ]
  },
  {
    category: "🐑 Nhóm A dua - Hùa theo (Đồng phạm tâm lý bầy đàn / Mất ý chí độc lập)",
    items: [
      { id: "f1", role: "follower", label: "Cười cợt, thả haha hoặc hùa theo các bình luận trêu chọc/body-shaming nhắm vào ai đó." },
      { id: "f2", role: "follower", label: "Chặn, block hoặc tẩy chay nghỉ chơi một người chỉ vì 'bạn bờ', leader trong nhóm yêu cầu thế." },
      { id: "f3", role: "follower", label: "Tham gia thảo luận sôi nổi vào những tin đồn chưa được kiểm chứng về một bạn học." },
      { id: "f4", role: "follower", label: "Chia sẻ ảnh dìm, memes hoặc tiết lộ thông tin nhạy cảm của người khác như một trò vui vô hại." }
    ]
  },
  {
    category: "🎭 Nhóm Khởi xướng - Thao túng (Người chủ mưu bạo lực trắng)",
    items: [
      { id: "i1", role: "instigator", label: "Cố ý tạo lập nhóm chat riêng để bàn luận, nói xấu hoặc bỏ rơi một cá nhân cụ thể." },
      { id: "i2", role: "instigator", label: "Áp dụng chiến thuật 'im lặng bạo lực' và lôi kéo người khác cũng phải tẩy chay mục tiêu." },
      { id: "i3", role: "instigator", label: "Thường xuyên viết status ẩn ý, mỉa mai để kích động đám đông hùa vào chỉ trích một bạn học." },
      { id: "i4", role: "instigator", label: "Dùng lời khen giả tạo (toxic positivity) sắc nhọn để mỉa mai, hạ nhục người khác trước mặt mọi người." }
    ]
  }
];

export function getFullMoodDetails(value: string) {
  // First search in primary Plutchik emotions
  const item = ALL_EMOTIONS.find(m => m.value === value);
  if (item) return item;
  
  // Search in Geneva Emotion Wheel v3.0 emotions
  const gItem = GENEVA_EMOTIONS.find(m => m.value === value);
  if (gItem) {
    return {
      value: gItem.value,
      label: gItem.label,
      english: gItem.english,
      intensity: "Vừa" as const, // standard baseline mapping
      desc: gItem.desc,
      sectorId: gItem.quadrant,
      sectorName: gItem.quadrantLabel,
      sectorEmoji: gItem.emoji,
      bgClass: gItem.bgClass,
      borderClass: gItem.borderClass,
      textClass: gItem.textClass,
      oppositeSectorId: ""
    };
  }
  
  // Neutral state fallback
  if (value === "binh_thuong") {
    return {
      value: "binh_thuong",
      label: "Bình thường / Ổn định",
      english: "Neutral / Balanced",
      intensity: "Thấp" as const,
      desc: "Trạng thái tâm lý cân bằng, bình tĩnh nhẹ nhàng.",
      sectorId: "neutral",
      sectorName: "Bình thường",
      sectorEmoji: "⚪",
      bgClass: "bg-slate-50",
      borderClass: "border-slate-200",
      textClass: "text-slate-600",
      oppositeSectorId: ""
    };
  }
  
  // Dynamic fallback for any other cases
  return null;
}
