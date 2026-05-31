import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Countdown() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isOpening, setIsOpening] = useState(false);
  const countdownItems = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINUTES", value: timeLeft.minutes },
    { label: "SECONDS", value: timeLeft.seconds },
  ];

  const openCover = () => {
    if (isOpening) return;

    setIsOpening(true);
    setTimeout(() => navigate("/cover"), 700);
  };

  // 🔸 カウントダウン更新
  useEffect(() => {
    const target = new Date("2026-06-14T20:00:00");
    const update = () => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        navigate("/cover", { replace: true });
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
  }, [navigate]);

  // 🔸 画面クリックで表紙へ
  return (
    <div
      onClick={openCover}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background:
          "radial-gradient(circle at 18% 12%, rgba(255,255,255,0.9), transparent 23%), repeating-linear-gradient(0deg, rgba(177,142,96,0.045) 0 1px, transparent 1px 24px), #f5ead5",
        color: "#604b3b",
        textAlign: "center",
        cursor: "pointer",
        padding: "20px",
        boxSizing: "border-box",
        overflow: "hidden",
        opacity: isOpening ? 0 : 1,
        transform: isOpening ? "scale(1.04)" : "scale(1)",
        transition: "opacity 0.7s ease, transform 0.7s ease",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(92vw, 850px)",
          padding: "clamp(28px, 6vw, 54px) clamp(14px, 5vw, 46px)",
          border: "1px solid rgba(174,139,91,0.28)",
          borderRadius: "4px",
          background:
            "repeating-linear-gradient(0deg, transparent 0 25px, rgba(130,170,190,0.08) 25px 26px), #fffdf4",
          boxShadow:
            "6px 8px 0 rgba(145,105,64,0.14), 0 16px 34px rgba(105,75,45,0.16)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-15px",
            left: "50%",
            width: "110px",
            height: "30px",
            transform: "translateX(-50%) rotate(-2deg)",
            background: "rgba(244,215,142,0.64)",
            boxShadow: "0 1px 2px rgba(125,90,47,0.1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "22px",
            right: "18px",
            padding: "5px 11px",
            borderRadius: "20px",
            background: "#e46c6c",
            color: "#fff",
            boxShadow: "2px 2px 0 rgba(0,0,0,0.1)",
            fontSize: "clamp(0.58rem, 2vw, 0.8rem)",
            fontWeight: "bold",
            transform: "rotate(6deg)",
          }}
        >
          ✕ しゃもサポの卒業制作
        </div>
        <p
          style={{
            margin: 0,
            color: "#c66a68",
            fontFamily: "sans-serif",
            fontSize: "0.68rem",
            fontWeight: "bold",
            letterSpacing: "0.22em",
          }}
        >
          SHISHAMO YEAR BOOK
        </p>
        <h1
          style={{
            margin: "10px 0 4px",
            color: "#d66565",
            fontSize: "clamp(1.45rem, 5vw, 2.45rem)",
          }}
        >
          活動終了まであと
        </h1>
        <p style={{ margin: "0 0 24px", color: "#9a8069", fontSize: "0.9rem" }}>
          2026.06.14 20:00
        </p>

        <div className="countdown-grid">
          {countdownItems.map((item) => (
            <div className="countdown-card" key={item.label}>
              <strong>
                {String(item.value).padStart(2, "0")}
              </strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <p className="countdown-open">
          クリックしてアルバムの表紙へ
        </p>
      </div>

      <style>
        {`
          .countdown-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: clamp(7px, 2vw, 16px);
          }

          .countdown-card {
            position: relative;
            display: flex;
            min-width: 0;
            padding: clamp(12px, 3vw, 22px) 4px clamp(10px, 2.5vw, 16px);
            flex-direction: column;
            border: 1px solid rgba(203, 117, 110, 0.22);
            border-radius: 3px;
            background: rgba(255, 255, 255, 0.86);
            box-shadow: 2px 3px 0 rgba(137, 102, 64, 0.1);
          }

          .countdown-card strong {
            color: #e46c6c;
            font-family: serif;
            font-size: clamp(2rem, 8vw, 4.5rem);
            font-variant-numeric: tabular-nums;
            line-height: 1;
          }

          .countdown-card span {
            margin-top: 9px;
            color: #a88d76;
            font-family: sans-serif;
            font-size: clamp(0.52rem, 1.6vw, 0.72rem);
            font-weight: bold;
            letter-spacing: 0.12em;
          }

          .countdown-open {
            margin: 28px 0 0;
            color: #a85c5c;
            font-size: clamp(0.85rem, 2.5vw, 1rem);
            font-weight: bold;
            animation: countdown-pulse 2.2s ease-in-out infinite;
          }

          @keyframes countdown-pulse {
            0%, 100% { opacity: 0.62; }
            50% { opacity: 1; }
          }

          @media (prefers-reduced-motion: reduce) {
            * {
              transition-duration: 0.01ms !important;
              animation-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </div>
  );
}
