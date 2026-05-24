import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Countdown() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [messages, setMessages] = useState([]);
  const [currentMsg, setCurrentMsg] = useState(null);
  const [fade, setFade] = useState(true);

  // 🔸 カウントダウン更新
  useEffect(() => {
    const target = new Date("2026-06-14T00:00:00");
    const update = () => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔸 Firestoreから全メッセージ取得
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "messages"));
        const all = querySnapshot.docs.map(doc => doc.data());
        setMessages(all);
        if (all.length > 0) {
          setCurrentMsg(all[Math.floor(Math.random() * all.length)]);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, []);

  // 🔸 5秒ごとにランダム切り替え
  useEffect(() => {
    if (messages.length === 0) return;
    const interval = setInterval(() => {
      setFade(false); // フェードアウト
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * messages.length);
        setCurrentMsg(messages[randomIndex]);
        setFade(true); // フェードイン
      }, 400); // フェードアウト時間
    }, 5000);

    return () => clearInterval(interval);
  }, [messages]);

  // 🔸 画面クリックで表紙へ
  return (
    <div
      onClick={() => navigate("/cover")}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff7f7",
        color: "#333",
        textAlign: "center",
        cursor: "pointer",
        padding: "20px",
        transition: "all 0.5s ease"
      }}
    >
      <h1>🎸 SHISHAMO 活動終了まであと</h1>

      <h2 style={{ fontSize: "64px", margin: "20px 0", color: "#ff8b8b" }}>
        {timeLeft.days}日 {timeLeft.hours.toString().padStart(2, "0")}:
        {timeLeft.minutes.toString().padStart(2, "0")}:
        {timeLeft.seconds.toString().padStart(2, "0")}
      </h2>

      <p style={{ fontSize: "16px", color: "#888" }}>（クリックで開く）</p>

      {currentMsg && (
        <div
          style={{
            marginTop: "40px",
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            maxWidth: "400px",
            textAlign: "left",
            opacity: fade ? 1 : 0,
            transition: "opacity 0.4s ease-in-out",
          }}
        >
          <p style={{ fontSize: "18px", lineHeight: "1.5", marginBottom: "10px" }}>
            {currentMsg.text}
          </p>
          <p style={{ fontSize: "14px", color: "#777" }}>
            - {currentMsg.name || "匿名"}
            {currentMsg.sns && <> ({currentMsg.sns})</>}
          </p>
        </div>
      )}
    </div>
  );
}
