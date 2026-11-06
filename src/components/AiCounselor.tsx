import React, { useState, useRef, useEffect } from "react";
import { 
  HeartHandshake, 
  Send, 
  Bot, 
  Sparkles, 
  AlertTriangle, 
  Smile, 
  RefreshCw, 
  Frown, 
  ShieldAlert,
  ArrowRight,
  BookOpen,
  PhoneCall
} from "lucide-react";

interface AiCounselorProps {
  onNavigateToReporting: (code?: string) => void;
}

interface Message {
  sender: "Student" | "AI";
  text: string;
  time: string;
}

export default function AiCounselor({ onNavigateToReporting }: AiCounselorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "AI",
      text: "Chào em, Thầy/Cô Cố Vấn Số AI đang ở đây lắng nghe em. Trường học hay thế giới ảo đôi lúc có thể làm em mỏi mệt hay bất an. Em đang gặp uất ức hay khó khăn tâm lý gì liên quan đến bạn bè, bị cô lập, bêu xấu hay áp lực mạng (FOMO)? Hãy nhẹ lòng chia sẻ kín với Thầy/Cô nhé. Mầm mống của sự chữa lành bắt đầu từ việc em lên tiếng.",
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      sender: "Student",
      text: textToSend,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      // Prepare message history to feed to server endpoint so dialogue carries history context
      const historyPayload = messages.map(m => ({
        role: m.sender === "Student" ? "user" : "assistant",
        message: m.text
      }));
      // Append current user prompt to payload
      historyPayload.push({ role: "user", message: textToSend });

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyPayload })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setMessages(prev => [...prev, {
          sender: "AI",
          text: data.reply,
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        }]);
      } else {
        setMessages(prev => [...prev, {
          sender: "AI",
          text: data.reply || "Rất tiếc, đường truyền tư vấn tâm lý AI gặp gián đoạn tạm thời. Em đừng buồn nhé, hãy áp dụng bộ quy tắc PAUSE trong cẩm nang hoặc gửi báo cáo bảo mật danh tính trực tiếp cho Ban giám hiệu ngay bên dưới nhé!",
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        sender: "AI",
        text: "Không thể kết nối máy chủ phân tích cảm xúc lúc này. Đừng lo lắng em nhé, bạn bè xung quanh, anh chị Digital Peer Mentor và căn phòng tham vấn THPT luôn rộng mở ôm em.",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        sender: "AI",
        text: "Thầy/Cô Cố Vấn Số AI đã thiết lập lại cuộc đối thoại sạch sẽ. Trái tim và đôi tai của Thầy cô luôn rộng mở lắng nghe em chia sẻ lại từ đầu.",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setClearConfirm(false);
  };

  const promptSuggestions = [
    { label: "Bắt bài việc bị cô lập tẩy chay học nhóm", prompt: "Thầy cô ơi, gần đây khi làm bài tập nhóm môn Sử, cả nhóm dường như cố ý ngó lơ ý kiến của em, không phân công việc và tự hoàn thành lấy rồi chụp ảnh vui vẻ đăng story không có mặt em. Em cảm thấy cực kỳ cô đơn và tủi thân, nghi ngờ giá trị bản thân." },
    { label: "Bì dìm hàng, chế giễu ẩn danh trên trang lớp", prompt: "Gần đây có các trang Facebook Page ẩn danh đăng status chế giễu ngoại hình và vu khống em ham hư vinh. Bạn bè trong lớp xì xào bàn tán sau lưng khi em đi ngang qua. Em sợ ngủ mộng mị và không dám đến lớp nữa." },
    { label: "Áp lực tâm lý FOMO so sánh với mạng xã hội", prompt: "Em bị nghiện lướt Instagram nhìn ảnh đi chơi, story của các bạn. Cứ mỗi lần không cầm điện thoại em lo phát sốt sợ mình bỏ lỡ đi chơi. So sánh cuộc sống tẻ nhạt của mình với các bạn kéo tinh thần em đi xuống tột độ." },
    { label: "Thực hành CBT viết thư nhận thức xoa dịu u uất", prompt: "Vừa qua em dính vào một tranh cãi vặt và các bạn đang tẩy chay ngầm em. Em rất hay tự dằn vặt bản thân là mình dở tệ, vô dụng. Thầy cô hãy huấn luyện em rèn luyện phương pháp CBT Tái cấu trúc nhận thức để tự vượt lên cảm giác tồi tệ này được không ạ?" }
  ];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4" id="ai_counselor_main_root">
      {/* Suggestions side drawer */}
      <div className="lg:col-span-1 space-y-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm shadow-indigo-100/30 space-y-4 relative overflow-hidden" id="suggestions_counselor_box">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-indigo-500"></div>
          
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <Sparkles className="text-teal-500 animate-pulse" style={{ animationDuration: '3s' }} size={16} />
            <h3 className="font-extrabold text-slate-800 text-[17px] uppercase tracking-wider">CÂU GỢI Ý ĐỂ BẮT ĐẦU</h3>
          </div>
          <p className="text-[15px] text-slate-500 leading-relaxed">
            Chọn câu chuyện giống bối cảnh của em bên dưới để bắt đầu tâm sự nhanh và nhận lời khuyên thích hợp từ chuyên gia:
          </p>

          <div className="space-y-2.5">
            {promptSuggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(s.prompt)}
                className="w-full text-left rounded-2xl border border-slate-100 p-3 text-[17px] bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 hover:border-indigo-400 hover:bg-indigo-50/35 transition-all text-slate-800 cursor-pointer block"
                disabled={loading}
              >
                <div className="font-bold text-slate-800 flex items-center justify-between mb-1">
                  <span className="text-[15px] text-indigo-500 uppercase font-bold tracking-wider">Tình huống {idx + 1}</span>
                  <ChevronRight size={10} className="text-indigo-500" />
                </div>
                <p className="text-[15px] text-slate-700 leading-relaxed font-semibold">“{s.label}”</p>
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3">
            {clearConfirm ? (
              <div className="space-y-2 bg-pink-50 p-2.5 rounded-2xl border border-pink-100 animate-fade-in text-center">
                <span className="text-[15px] font-black text-pink-700 block text-center">🔐 Có chắc chắn xóa hoàn tất để bảo mật lịch sử?</span>
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={handleResetChat}
                    className="bg-pink-600 text-white text-[15px] font-bold px-3 py-1.5 rounded-xl hover:bg-pink-700 cursor-pointer"
                  >
                    Có, Xóa sạch
                  </button>
                  <button 
                    onClick={() => setClearConfirm(false)}
                    className="bg-slate-200 text-slate-800 text-[15px] font-bold px-3 py-1.5 rounded-xl hover:bg-slate-300 cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setClearConfirm(true)}
                className="w-full text-center py-2 text-[15px] font-bold text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={11} className="text-slate-400" /> Tẩy hội thoại bảo mật
              </button>
            )}
          </div>
        </div>

        {/* Severe situation warning block */}
        <div className="rounded-3xl bg-pink-50/60 border border-pink-150 p-5 space-y-3">
          <div className="flex items-center gap-2 text-pink-700">
            <ShieldAlert size={16} />
            <span className="font-extrabold text-[16px]">CẦN CAN THIỆP KHẨN CẤP?</span>
          </div>
          <p className="text-[14px] text-slate-700 leading-relaxed font-semibold">
            Cố vấn AI đóng vai trò <strong>Sơ cứu Tâm lý ban đầu (PFA — WHO, 2011)</strong>. Nếu khủng hoảng nghiêm trọng đe dọa an toàn thực tế, em hãy mở Hồ sơ Ca tư vấn ẩn danh để Tổ Tư vấn nhà trường can thiệp hoặc gọi ngay:
          </p>
          <div className="bg-white/90 border border-pink-200 rounded-2xl p-2.5 text-[12.5px] space-y-1 text-slate-700">
            <div className="flex items-center justify-between font-bold text-rose-700">
              <span className="flex items-center gap-1"><PhoneCall size={12} /> Tổng đài Trẻ em Quốc gia:</span>
              <span className="font-mono font-black text-[14px]">111 (24/7)</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-indigo-800">
              <span>Đường dây Tư vấn Tâm lý:</span>
              <span className="font-mono font-bold">1900 6233</span>
            </div>
          </div>
          <button 
            onClick={() => onNavigateToReporting()}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200/50 text-white border-0 hover:bg-slate-800 py-3 text-[14px] text-center font-bold text-white transition flex items-center justify-center gap-1 cursor-pointer tracking-wide uppercase"
          >
            Mở Hồ sơ Ca tư vấn ẩn danh <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Primary chat workspace */}
      <div className="lg:col-span-3 rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm shadow-indigo-100/30 flex flex-col h-[640px]" id="primary_ai_chat_interface">
        {/* Chat top identity bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 p-4 shrink-0 text-white flex items-center justify-between shadow-sm shadow-indigo-100/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center text-white font-black animate-pulse">
                <Bot size={22} className="text-indigo-200" />
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
            </div>
            <div>
              <h2 className="font-extrabold text-[19px] text-indigo-100 flex items-center gap-1.5">
                Cố Vấn Lắng Nghe - Sư Phạm AI <span className="text-[13px] font-black bg-pink-500/30 px-2 py-0.5 rounded-full text-pink-200">24/7 ONLINE</span>
              </h2>
              <p className="text-[13.5px] text-slate-300 font-medium">
                Tham vấn thấu cảm theo Liệu pháp Lấy người học làm trung tâm (Carl Rogers, 1957) & CBT (Beck, 1979)
              </p>
            </div>
          </div>
          <div className="text-[13px] font-bold text-slate-300 font-mono bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-2xl uppercase tracking-wider">
            KHÔNG LƯU COOKIES
          </div>
        </div>

        {/* Scientific Foundation Sub-banner */}
        <div className="bg-indigo-50/80 border-b border-indigo-100 px-4 py-2 text-[12px] text-slate-600 flex items-center gap-2 shrink-0">
          <BookOpen size={14} className="text-indigo-600 shrink-0" />
          <span>
            <strong className="text-indigo-900">Cơ sở khoa học:</strong> Tích hợp nguyên lý <em>Chấp nhận tích cực vô điều kiện (Unconditional Positive Regard — Rogers, 1957)</em>, quy trình <em>Sơ cứu Tâm lý PFA: Look - Listen - Link (WHO, 2011)</em> và <em>Tái cấu trúc nhận thức CBT (Beck, 1979)</em>.
          </span>
        </div>

        {/* Dynamic chat content screen list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40">
          {messages.map((m, idx) => {
            const isStudent = m.sender === "Student";
            return (
              <div 
                key={idx} 
                className={`flex ${isStudent ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-xl p-4 rounded-2.5xl text-[17px] leading-relaxed space-y-2 ${
                  isStudent 
                    ? "bg-indigo-50 border border-indigo-200 text-slate-800 rounded-br-none shadow-sm shadow-indigo-100/30" 
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm shadow-indigo-100/30"
                }`}>
                  <div className={`flex items-center gap-2 border-b pb-1 text-[15px] font-extrabold uppercase tracking-widest ${isStudent ? "border-indigo-200/60 text-indigo-500" : "border-slate-200 text-slate-500"}`}>
                    <span>{isStudent ? "🙍 BẠN (HỌC SINH)" : "☕ THẦY CÔ CỐ VẤN AI"}</span>
                    <span className="ml-auto text-[15px] opacity-60 font-mono font-medium">{m.time}</span>
                  </div>
                  
                  {/* Styled text output */}
                  <p className="whitespace-pre-line leading-relaxed font-medium">
                    {m.text}
                  </p>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-150 p-4 rounded-2xl rounded-tl-none space-y-2 max-w-sm shadow-sm shadow-indigo-100/30">
                <span className="text-[15px] font-extrabold uppercase text-indigo-500 tracking-wider">Thầy cô AI đang tư duy cách tháo gỡ cùng em...</span>
                <div className="flex gap-1 items-center p-2 justify-start">
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce delay-100" />
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce delay-200" />
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce delay-300" />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input response editor */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }} 
          className="p-3 border-t border-slate-150 flex gap-2 bg-white shrink-0"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Viết tiếp bất cứ khúc mắc, nỗi lo hay tâm sự dằn vặt nào của em..."
            className="flex-1 rounded-2xl border border-slate-200 bg-white text-slate-900 px-4 text-[17px] outline-hidden focus:border-indigo-500 focus:bg-slate-50 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            disabled={loading}
            required
          />
          <button
            type="submit"
            disabled={loading || !inputVal.trim()}
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 p-3.5 text-white transition cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

// ChevronRight stub wrapper for standardizing
function ChevronRight(props: { size?: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={props.size || 16} 
      height={props.size || 16} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={props.className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
