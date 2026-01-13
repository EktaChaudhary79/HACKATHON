import React, {
  useEffect,
  useState,
  useRef,
  useCallback
} from "react";
import "./Chatbot.css";

const API_URL = "https://chatbot-x3x4.onrender.com/chat";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState("start");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({ lat: null, lon: null });

  // 🔒 Prevent duplicate greeting
  const hasGreeted = useRef(false);

  /* =====================
     GET USER LOCATION
  ===================== */
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {
        console.warn("Location permission denied");
      }
    );
  }, []);

  /* =====================
     SEND MESSAGE (STABLE)
  ===================== */
  const sendMessage = useCallback(
    async (msg) => {
      setLoading(true);

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: msg,
            step: step,
            lat: location.lat,
            lon: location.lon,
          }),
        });

        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.reply },
        ]);

        setStep(data.nextStep || step);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "⚠️ Server error. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [step, location.lat, location.lon]
  );

  /* =====================
     GREETING (ONLY ONCE)
  ===================== */
  useEffect(() => {
    if (open && !hasGreeted.current) {
      hasGreeted.current = true;
      sendMessage("");
    }
  }, [open, sendMessage]);

  /* =====================
     HANDLE USER INPUT
  ===================== */
  const handleSend = () => {
    if (!input.trim()) return;

    const msg = input.trim();

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: msg },
    ]);

    setInput("");
    sendMessage(msg);
  };

  /* =====================
     QUICK OPTION BUTTONS
  ===================== */
  const quickOption = (value, label) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: label },
    ]);
    sendMessage(value);
  };

  return (
    <>
      {/* Floating Button */}
      <div
        className="chatbot-button"
        onClick={() => setOpen(true)}
      >
        🤖
      </div>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span>AeroWay</span>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat-message ${msg.sender}`}
              >
                {msg.text}
              </div>
            ))}

            {/* Quick Options */}
            {step === "choose" && !loading && (
              <div className="chat-options">
                <button onClick={() => quickOption("1", "Air Quality")}>
                  🌫 Air Quality
                </button>
                <button onClick={() => quickOption("2", "Health Advice")}>
                  🩺 Health Advice
                </button>
                <button onClick={() => quickOption("3", "Best Time to Go Out")}>
                  ⏰ Best Time
                </button>
              </div>
            )}

            {loading && (
              <div className="chat-message bot">
                ⏳ Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Type 1, 2 or 3..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleSend()
              }
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
