import React, { useState } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi 👋 I’m AeroWay. Ask me about AQI, routes, or health tips!"
    }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);

    // Mock AI reply (replace with real AI later)
    setTimeout(() => {
      const botReply = {
        sender: "bot",
        text: getBotReply(input)
      };
      setMessages((prev) => [...prev, botReply]);
    }, 600);

    setInput("");
  };

  const getBotReply = (text) => {
    const msg = text.toLowerCase();

    if (msg.includes("aqi")) {
      return "📊 If AQI is above 150, avoid outdoor travel and wear a mask.";
    }
    if (msg.includes("route")) {
      return "🛣️ I recommend green routes with lower traffic for safer travel.";
    }
    if (msg.includes("asthma") || msg.includes("health")) {
      return "🧑‍⚕️ Asthma patients should avoid peak hours and use masks on poor AQI days.";
    }
    return "🤖 I can help with AQI safety, commute routes, and health advice!";
  };

  return (
    <>
      {/* Floating Button */}
      <div className="chatbot-button" onClick={() => setOpen(!open)}>
        🤖
      </div>

      {/* Chat Panel */}
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <span>AeroWay</span>
            <button onClick={() => setOpen(false)}>✖</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-message ${msg.sender}`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask me something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
