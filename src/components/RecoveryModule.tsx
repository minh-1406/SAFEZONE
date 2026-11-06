import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Dices, RefreshCw, Activity, Eye, Hand, Volume2, Wind, Heart, CheckCircle2, BookOpen } from "lucide-react";

interface RecoveryModuleProps {
  id?: string;
  className?: string;
}

type BreathProtocolKey = "polyvagal_416" | "box_4444" | "relax_478";

interface BreathProtocol {
  id: BreathProtocolKey;
  name: string;
  subtitle: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  mechanism: string;
  citation: string;
}

const BREATH_PROTOCOLS: Record<BreathProtocolKey, BreathProtocol> = {
  polyvagal_416: {
    id: "polyvagal_416",
    name: "Thở Phế Vị 4-1-6",
    subtitle: "Hít vào 4s · Giữ 1s · Thở ra chậm 6s",
    inhale: 4,
    holdIn: 1,
    exhale: 6,
    holdOut: 0,
    mechanism: "Nhịp thở ra dài hơn nhịp hít vào (tỷ lệ 4:6) kích thích dây thần kinh phế vị (Vagus Nerve), giải phóng Acetylcholine giúp làm chậm nhịp tim và tắt báo động ở Hạch hạnh nhân (Amygdala).",
    citation: "Porges, S. W. (2011). The Polyvagal Theory, W. W. Norton & Balban et al. (2023). Brief structured respiration practices enhance mood and reduce physiological arousal. Cell Reports Medicine (Stanford University), 4(1), 100895."
  },
  box_4444: {
    id: "box_4444",
    name: "Box Breathing 4-4-4-4",
    subtitle: "Hít vào 4s · Giữ 4s · Thở ra 4s · Nghỉ 4s",
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    mechanism: "Kỹ thuật thở hộp vuông cân bằng nồng độ CO2/O2 trong máu, ổn định biến thiên nhịp tim (HRV) và phục hồi khả năng tập trung của Vỏ não trước trán (Prefrontal Cortex) khi bị sốc tâm lý.",
    citation: "Ma, X., Yue, Z. Q., Gong, Z. Q., et al. (2017). The Effect of Diaphragmatic Breathing on Attention, Negative Affect and Stress in Healthy Adults. Frontiers in Psychology, 8, 874."
  },
  relax_478: {
    id: "relax_478",
    name: "Nhịp Thở An Thần 4-7-8",
    subtitle: "Hít vào 4s · Giữ 7s · Thở ra 8s",
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    mechanism: "Giữ hơi 7 giây giúp tăng độ bão hòa oxy mô tế bào, kết hợp thở ra kéo dài 8 giây đưa hệ thần kinh từ trạng thái Chiến-hoặc-Chạy (Sympathetic) về trạng thái Nghỉ ngơi-Chữa lành (Parasympathetic).",
    citation: "Zaccaro, A., Piarulli, A., Laurino, M., et al. (2018). How Breath-Control Can Change Your Life: A Systematic Review on Psycho-Physiological Correlates of Slow Breathing. Frontiers in Human Neuroscience, 12, 353."
  }
};

export default function RecoveryModule({ id = "recover-module", className = "" }: RecoveryModuleProps) {
  const [selectedProtocol, setSelectedProtocol] = useState<BreathProtocolKey>("polyvagal_416");
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"idle" | "inhale" | "holdIn" | "exhale" | "holdOut">("idle");
  const [cycleCount, setCycleCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeProto = BREATH_PROTOCOLS[selectedProtocol];

  useEffect(() => {
    if (!isBreathingActive) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setBreathPhase("idle");
      return;
    }

    let isCancelled = false;

    const runLoop = () => {
      if (isCancelled) return;
      // Step 1: Inhale
      setBreathPhase("inhale");
      timerRef.current = setTimeout(() => {
        if (isCancelled) return;
        // Step 2: Hold In
        setBreathPhase("holdIn");
        timerRef.current = setTimeout(() => {
          if (isCancelled) return;
          // Step 3: Exhale
          setBreathPhase("exhale");
          timerRef.current = setTimeout(() => {
            if (isCancelled) return;
            if (activeProto.holdOut > 0) {
              // Step 4: Hold Out (for Box Breathing 4-4-4-4)
              setBreathPhase("holdOut");
              timerRef.current = setTimeout(() => {
                if (isCancelled) return;
                setCycleCount(c => c + 1);
                runLoop();
              }, activeProto.holdOut * 1000);
            } else {
              setCycleCount(c => c + 1);
              runLoop();
            }
          }, activeProto.exhale * 1000);
        }, activeProto.holdIn * 1000);
      }, activeProto.inhale * 1000);
    };

    runLoop();

    return () => {
      isCancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isBreathingActive, selectedProtocol]);

  const toggleBreathing = () => {
    setIsBreathingActive(prev => !prev);
  };

  // --- 2. Grounding 5-4-3-2-1 Interactive Checklist ---
  const groundingSteps = [
    {
      id: "g5",
      num: "5",
      title: "5 vật thể em NHÌN thấy quanh mình",
      desc: "Nhìn quanh phòng và gọi tên 5 đồ vật có màu sắc/hình khối rõ ràng (VD: chiếc bút xanh, khung cửa sổ, tán cây...).",
      icon: Eye,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200"
    },
    {
      id: "g4",
      num: "4",
      title: "4 bề mặt xúc giác em CHẠM vào được",
      desc: "Chạm tay vào mặt bàn mát lạnh, chất vải áo đang mặc, lòng bàn chân đặt vững trên sàn nhà.",
      icon: Hand,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200"
    },
    {
      id: "g3",
      num: "3",
      title: "3 âm thanh thực tại em NGHE thấy",
      desc: "Lắng nghe tiếng quạt quay, tiếng gió ngoài trời, hoặc nhịp thở đều đặn của chính mình.",
      icon: Volume2,
      color: "text-sky-600 bg-sky-50 border-sky-200"
    },
    {
      id: "g2",
      num: "2",
      title: "2 mùi hương tự nhiên em CẢM NHẬN",
      desc: "Hít sâu cảm nhận mùi không khí trong phòng, mùi trang sách mới hoặc hương xà phòng trên tay.",
      icon: Wind,
      color: "text-amber-600 bg-amber-50 border-amber-200"
    },
    {
      id: "g1",
      num: "1",
      title: "1 điều tử tế em TỰ NHẮC bản thân lúc này",
      desc: "Đặt tay lên ngực và nói thầm: “Mình đang ở nơi an toàn, giá trị của mình không phụ thuộc vào lời phán xét trên mạng”.",
      icon: Heart,
      color: "text-rose-600 bg-rose-50 border-rose-200"
    }
  ];
  const [checkedGrounding, setCheckedGrounding] = useState<string[]>([]);

  const toggleGroundingStep = (stepId: string) => {
    setCheckedGrounding(prev =>
      prev.includes(stepId) ? prev.filter(id => id !== stepId) : [...prev, stepId]
    );
  };

  // --- 3. Offline Action Suggestions (Behavioral Activation) ---
  const acts = [
    "Vẽ một bức tranh nhỏ, không cần đẹp — chỉ cần là của bạn.",
    "Nhảy hoặc vươn vai theo một bài hát bạn thích trong 60 giây.",
    "Trò chuyện trực tiếp hoặc gọi điện cho một người bạn thân thiết ngoài đời.",
    "Sắp xếp lại góc học tập gọn gàng trong 10 phút để tạo cảm giác làm chủ không gian.",
    "Thực hiện 5 động tác giãn cơ cổ - vai - gáy nhẹ nhàng.",
    "Viết ra giấy 3 điều nhỏ bé khiến bạn cảm thấy biết ơn trong hôm nay.",
    "Pha một cốc nước ấm và ngồi ngắm bầu trời 5 phút hoàn toàn không điện thoại."
  ];
  const [currentAct, setCurrentAct] = useState(acts[0]);

  const changeAct = () => {
    const remaining = acts.filter(a => a !== currentAct);
    const randomAct = remaining[Math.floor(Math.random() * remaining.length)] || acts[0];
    setCurrentAct(randomAct);
  };

  // --- 4. Expressive Writing Prompts ---
  const prompts = [
    "Ba điều khiến mình thấy mình có giá trị — hoàn toàn không liên quan đến mạng xã hội — là gì?",
    "Nếu người bạn thân nhất đang buồn giống mình lúc này, mình sẽ ôm và nói lời an ủi gì với bạn ấy?",
    "Một khoảnh khắc gần đây khiến mình thấy ấm áp và được thấu hiểu là khi nào?",
    "Điều gì mình tự hào vì đã kiên cường vượt qua trong một năm vừa qua?",
    "Ai là người khiến mình thấy an toàn nhất khi ở bên, và vì sao?"
  ];
  const [currentPrompt, setCurrentPrompt] = useState(prompts[0]);
  const [journalContent, setJournalContent] = useState("");

  const changePrompt = () => {
    const remaining = prompts.filter(p => p !== currentPrompt);
    const randomPrompt = remaining[Math.floor(Math.random() * remaining.length)] || prompts[0];
    setCurrentPrompt(randomPrompt);
  };

  const getBreathLabel = () => {
    switch (breathPhase) {
      case "inhale": return `Hít vào (${activeProto.inhale}s)…`;
      case "holdIn": return `Giữ hơi (${activeProto.holdIn}s)…`;
      case "exhale": return `Thở ra (${activeProto.exhale}s)…`;
      case "holdOut": return `Nghỉ (${activeProto.holdOut}s)…`;
      default: return "Bấm Bắt đầu";
    }
  };

  return (
    <div className={`recover-wrapper ${className}`} id={id}>
      <style>{`
        .recover-wrapper {
          --rc-bg: #F6F3EC;
          --rc-card: #FFFFFF;
          --rc-line: #E5DEC9;
          --rc-text: #1B2430;
          --rc-sub: #475569;
          --rc-primary: #4F46E5;
          --rc-accent: #F2A65A;
          font-family: system-ui, -apple-system, sans-serif;
          color: var(--rc-text);
          max-width: 960px;
          margin: 0 auto;
          padding: 20px 8px;
        }
        .rc-breath-circle {
          width: 132px; height: 132px; border-radius: 50%;
          margin: 18px auto; display: flex; align-items: center; justify-content: center;
          background: radial-gradient(circle, #FDE68A, #F59E0B);
          color: #1E293B; font-weight: 800; font-size: 13.5px;
          transition: transform 4s ease-in-out, box-shadow 1s ease-in-out; text-align: center;
          user-select: none; padding: 12px;
          box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
        }
        .rc-breath-circle.grow { transform: scale(1.28); box-shadow: 0 12px 32px rgba(79, 70, 229, 0.35); background: radial-gradient(circle, #C7D2FE, #6366F1); color: #FFFFFF; }
        .rc-breath-circle.shrink { transform: scale(0.84); transition: transform ${activeProto.exhale}s ease-in-out; background: radial-gradient(circle, #A7F3D0, #10B981); color: #064E3B; }
        .rc-breath-circle.hold { transform: scale(1.28); background: radial-gradient(circle, #DDD6FE, #7C3AED); color: #FFFFFF; }
      `}</style>

      <div className="text-center mb-6 space-y-1.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[12px] font-black uppercase tracking-wider">
          <Activity size={13} /> Tổ hợp Điều hòa Sinh lý Thần kinh & Tiếp đất Thực tại
        </span>
        <h2 className="text-[22px] font-black text-slate-800">Trạm Sơ Cứu & Phục Hồi Cân Bằng Tự Nhiên</h2>
        <p className="text-[14.5px] text-slate-500 max-w-2xl mx-auto">
          Các bài tập thực hành dưới đây được chuẩn hóa lâm sàng giúp làm dịu hệ thần kinh giao cảm, cắt đứt cơn hoảng loạn số và đưa tâm trí em về vùng an toàn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. Hơi thở điều hòa thần kinh phế vị */}
        <div className="rounded-2.5xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-extrabold text-[17px] text-slate-800 flex items-center gap-1.5">
                🫁 1. Điều Hòa Nhịp Thở Thần Kinh Phế Vị
              </h3>
              {cycleCount > 0 && (
                <span className="text-[12px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ✓ Đã hoàn thành {cycleCount} chu kỳ thở
                </span>
              )}
            </div>

            {/* Protocol Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(Object.keys(BREATH_PROTOCOLS) as BreathProtocolKey[]).map((key) => {
                const proto = BREATH_PROTOCOLS[key];
                const isSelected = selectedProtocol === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setIsBreathingActive(false);
                      setSelectedProtocol(key);
                    }}
                    className={`py-2 px-1.5 rounded-lg text-[12px] font-extrabold transition cursor-pointer text-center ${
                      isSelected
                        ? "bg-white text-indigo-700 shadow-2xs border border-indigo-100"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {proto.name}
                  </button>
                );
              })}
            </div>

            <div className="text-center py-1">
              <span className="text-[13.5px] font-bold text-indigo-700 bg-indigo-50/70 px-3 py-1 rounded-full border border-indigo-100 inline-block">
                ⏱️ Chu kỳ: {activeProto.subtitle}
              </span>

              <div
                className={`rc-breath-circle ${
                  breathPhase === "inhale"
                    ? "grow"
                    : breathPhase === "holdIn"
                    ? "hold"
                    : breathPhase === "exhale"
                    ? "shrink"
                    : ""
                }`}
                id="rc-circle"
              >
                {getBreathLabel()}
              </div>

              <button
                type="button"
                id="rc-breath-btn"
                onClick={toggleBreathing}
                className={`px-6 py-2.5 rounded-full font-extrabold text-[14px] transition cursor-pointer shadow-sm ${
                  isBreathingActive
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {isBreathingActive ? "⏹ Dừng nhịp thở" : "▶ Bắt đầu hít thở theo vòng tròn"}
              </button>
            </div>
          </div>

          {/* Scientific Citation Box for Breathing */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 text-[12px] space-y-1 text-slate-600">
            <span className="font-extrabold text-indigo-900 block">
              🔬 Cơ chế sinh lý thần kinh ({activeProto.name}):
            </span>
            <p className="leading-relaxed">{activeProto.mechanism}</p>
            <p className="text-[11.5px] text-slate-500 italic pt-1 border-t border-slate-200/60">
              📚 <strong>Trích dẫn công bố:</strong> {activeProto.citation}
            </p>
          </div>
        </div>

        {/* 2. Kỹ thuật Tiếp đất Đa giác quan Grounding 5-4-3-2-1 */}
        <div className="rounded-2.5xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-extrabold text-[17px] text-slate-800 flex items-center gap-1.5">
                ⚓ 2. Kỹ Thuật Tiếp Đất Thực Tại (Grounding 5-4-3-2-1)
              </h3>
              <span className="text-[12px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Đã thực hành: {checkedGrounding.length}/5 giác quan
              </span>
            </div>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              Khi bị bạo lực mạng hoặc tin đồn làm đầu óc quay cuồng, hãy bấm tích chọn từng bước dưới đây để kéo sự chú ý từ "thế giới ảo" quay về thực tại an toàn:
            </p>

            <div className="space-y-2">
              {groundingSteps.map((step) => {
                const isDone = checkedGrounding.includes(step.id);
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => toggleGroundingStep(step.id)}
                    className={`w-full p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                      isDone
                        ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/30"
                        : "bg-slate-50/60 border-slate-200 hover:bg-white"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg font-black text-[13px] flex items-center justify-center shrink-0 mt-0.5 border ${
                        isDone ? "bg-emerald-600 text-white border-emerald-600" : step.color
                      }`}
                    >
                      {isDone ? "✓" : step.num}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[13.5px] font-extrabold block ${isDone ? "text-emerald-900 line-through" : "text-slate-800"}`}>
                        {step.title}
                      </span>
                      <span className="text-[12px] text-slate-500 leading-snug block mt-0.5">
                        {step.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scientific Citation Box for Grounding 5-4-3-2-1 */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 text-[12px] space-y-1 text-slate-600">
            <span className="font-extrabold text-indigo-900 block">
              🔬 Cơ sở khoa học Kỹ thuật Grounding 5-4-3-2-1:
            </span>
            <p className="leading-relaxed">
              Kích hoạt mạng lưới chú ý giác quan ngoại vi (Exteroceptive Sensory Network) để ngắt mạch suy nghĩ luẩn quẩn (Rumination) ở Mạng lưới chế độ mặc định (Default Mode Network - DMN).
            </p>
            <p className="text-[11.5px] text-slate-500 italic pt-1 border-t border-slate-200/60">
              📚 <strong>Trích dẫn công bố:</strong> Najavits, L. M. (2002). <em>Seeking Safety: A Treatment Manual for PTSD</em>, Guilford Press & Kabat-Zinn, J. (1990). <em>Full Catastrophe Living (MBSR)</em>.
            </p>
          </div>
        </div>

        {/* 3. Hoạt động Offline (Behavioral Activation) */}
        <div className="rounded-2.5xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="font-extrabold text-[17px] text-slate-800 flex items-center gap-1.5">
              🌤️ 3. Kích Hoạt Hành Vi Ngoài Màn Hình (Behavioral Activation)
            </h3>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              Thực hiện một hành động nhỏ ngoài đời thực để kích thích não bộ tiết Dopamine & Endorphin tự nhiên:
            </p>
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-[14.5px] font-semibold text-amber-950 italic min-h-[72px] flex items-center">
              “{currentAct}”
            </div>
            <button
              type="button"
              id="rc-act-btn"
              onClick={changeAct}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[13px] inline-flex items-center gap-1.5 cursor-pointer transition"
            >
              <Dices size={15} />
              <span>Đổi hoạt động thực tế khác</span>
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 text-[12px] space-y-1 text-slate-600">
            <p className="text-[11.5px] text-slate-500 italic">
              📚 <strong>Trích dẫn công bố:</strong> Jacobson, N. S., Martell, C. R., & Dimidjian, S. (2001). <em>Behavioral Activation Treatment for Depression: Returning to Contextual Roots</em>. Clinical Psychology: Science and Practice, 8(3), 255–270.
            </p>
          </div>
        </div>

        {/* 4. Nhật ký Viết Biểu Đạt (Expressive Writing) */}
        <div className="rounded-2.5xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-extrabold text-[17px] text-slate-800 flex items-center gap-1.5">
                📝 4. Phản Chiếu Tự Trắc Ẩn (Expressive Writing)
              </h3>
              <button
                type="button"
                id="rc-journal-btn"
                onClick={changePrompt}
                className="text-[12px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>Câu hỏi gợi mở khác</span>
              </button>
            </div>
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-[13.5px] font-semibold text-indigo-950 italic">
              💡 Gợi ý suy ngẫm: “{currentPrompt}”
            </div>
            <textarea
              className="w-full min-h-[82px] p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none text-[13.5px]"
              placeholder="Viết tự do suy nghĩ của em tại đây để giải phóng áp lực nội tâm..."
              value={journalContent}
              onChange={(e) => setJournalContent(e.target.value)}
            />
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 text-[12px] space-y-1 text-slate-600">
            <p className="text-[11.5px] text-slate-500 italic">
              📚 <strong>Trích dẫn công bố:</strong> Pennebaker, J. W., & Beall, S. K. (1986). <em>Confronting a traumatic event: Toward an understanding of inhibition and disease</em>. Journal of Abnormal Psychology, 95(3), 274–281 & Neff, K. D. (2003). <em>Self-Compassion Theory</em>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
