import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [today, setToday] = useState({ month: 0, day: 0 });
  const [nichoku, setNichoku] = useState("");
  const [petals, setPetals] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    setToday({ month, day });

    const names = ["みやざきあさこ", "まつおかあや", "よしかわみさき"];
    setNichoku(names[Math.floor(Math.random() * names.length)]);

    // 🌸 花びらを生成
    const numPetals = 20;
    const petalsArr = [];
    for (let i = 0; i < numPetals; i++) {
      petalsArr.push({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 14,
        duration: 8 + Math.random() * 6,
        delay: Math.random() * 5,
        rotate: Math.random() * 360,
      });
    }
    setPetals(petalsArr);

    // スマホサイズの取得.
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);

  }, []);

  const tabs = [
    { label: "もくじ", color: "#e46c6c", path: "/home", height: 90 },
    { label: "おしきょく", color: "#b0b0b0", path: "/songs", height: 100 },
    { label: "ちず", color: "#b0b0b0", path: "/map", height: 80 },
    { label: "カレンダー", color: "#b0b0b0", path: "/memories-by-date", height: 110 },
    { label: "よせがき", color: "#b0b0b0", path: "/view", height: 95 },
    { label: "とうこう", color: "#b0b0b0", path: "/post", height: 105 },
  ];

  const sections = [
    { title: "1. 推し曲!!!", path: "/songs" },
    { title: "2. カレンダー!!!", path: "/memories-by-date" },
    { title: "3. 思い出マップ!!!", path: "/map" },
    { title: "4. 寄せ書き!!!", path: "/view" },
    { title: "5. 制作協力!!!", path: "/credits" },
  ];

  return (
    <div
      style={{
        background: "#fff",
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontFamily: "'Yomogi', cursive",
        padding: "20px",
        overflow: "hidden",
      }}
    >
      {/* 黒板背景 */}
      <div
        style={{
          background: "#2f5d50",
          width: "92%",
          height: "88vh",
          position: "relative",
          border: isMobile ? "none" : "10px solid #fff",
          borderRadius: "12px",
          boxShadow: "inset 0 0 25px rgba(0,0,0,0.4)",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          paddingRight: isMobile ? "0px" : "120px",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        {/* 🌸 花びらレイヤー（黒板の上、アルバムの下） */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {petals.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                top: "-20px",
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: "rgba(255,182,193,0.8)",
                borderRadius: "50%",
                transform: `rotate(${p.rotate}deg)`,
                animation: `fall ${p.duration}s linear ${p.delay}s infinite`,
              }}
            ></div>
          ))}
        </div>

        {/* 日付＋日直（縦書き、数字のみ横） */}
        {!isMobile && (
          <div
            style={{
              position: "absolute",
              right: "40px",
              top: "10%",
              color: "white",
              writingMode: "vertical-rl",
              fontSize: "2.8rem",
              lineHeight: "2.6rem",
              textAlign: "center",
              zIndex: 3,
            }}
          >
            <span style={{ transform: "rotate(0deg)", display: "inline-block" }}>
              <span
                style={{
                  writingMode: "horizontal-tb",
                  fontSize: "2.4rem",
                  display: "inline-block",
                  verticalAlign: "middle",
                  marginRight: "10px",
                }}
              >
                {today.month}
              </span>
              月
              <span
                style={{
                  writingMode: "horizontal-tb",
                  fontSize: "2.4rem",
                  display: "inline-block",
                  verticalAlign: "middle",
                }}
              >
                {today.day}
              </span>
              日 日直 {nichoku}
            </span>
          </div>
        )}

        {/* アルバム本体 */}
        <div
          style={{
            position: "relative",
            background: "#e46c6c",
            width: "440px",
            height: "560px",
            borderRadius: "8px",
            boxShadow: "8px 10px 0 #c94f4f, inset 6px 0 10px rgba(0,0,0,0.25)",
            padding: "60px 50px 100px 60px",
            color: "white",
            zIndex: 4, // ← 花びらより上に
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginRight: "60px",
          }}
        >
          {/* 綴じ目 */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "24px",
              height: "100%",
              background: "linear-gradient(90deg, #b34d4d 0%, #d26060 40%, #e46c6c 100%)",
              borderRadius: "8px 0 0 8px",
              boxShadow: "inset -2px 0 5px rgba(0,0,0,0.3)",
            }}
          ></div>

          {/* 栞 */}
          <div
            style={{
              position: "absolute",
              top: "-54px",
              left: "36px",
              display: "flex",
              gap: "6px",
              zIndex: 5,
            }}
          >
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                to={tab.path}
                style={{
                  background: tab.color,
                  color: "#fff",
                  width: "36px",
                  height: `${tab.height}px`,
                  borderRadius: "6px 6px 0 0",
                  writingMode: "vertical-rl",
                  textOrientation: "upright",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.3s, box-shadow 0.3s, filter 0.2s",
                  boxShadow:
                    "inset 0 -4px 4px rgba(0,0,0,0.25), 0 2px 3px rgba(0,0,0,0.2)",
                  transformOrigin: "bottom center",
                  transform: "translateY(10px) rotate(0deg)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(2px) rotate(-5deg)";
                  e.currentTarget.style.boxShadow =
                    "inset 0 -2px 4px rgba(0,0,0,0.2), 2px 4px 6px rgba(0,0,0,0.2)";
                  e.currentTarget.style.filter = "brightness(1.1)";
                  e.currentTarget.style.backgroundColor = "#ff8ba7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(10px) rotate(0deg)";
                  e.currentTarget.style.boxShadow =
                    "inset 0 -4px 4px rgba(0,0,0,0.25), 0 2px 3px rgba(0,0,0,0.2)";
                  e.currentTarget.style.filter = "brightness(1)";
                  e.currentTarget.style.backgroundColor = tab.color;
                }}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* 右上リボン */}
          <div
            style={{
              position: "absolute",
              top: "14px",
              right: "18px",
              background: "white",
              color: "#e46c6c",
              fontWeight: "bold",
              padding: "6px 14px",
              borderRadius: "20px",
              transform: "rotate(6deg)",
              boxShadow: "2px 2px 0 rgba(0,0,0,0.1)",
              fontSize: "0.9rem",
            }}
          >
            ✕ しゃもサポの卒業制作
          </div>

          {/* 目次 */}
          <div
            style={{
              marginTop: "0px",
              width: "100%",
              textAlign: "left",
              marginLeft: "30px",
            }}
          >
            <h2 style={{ fontSize: "3.4rem", marginBottom: "0px" }}>目次</h2>
            <ol
              style={{
                paddingLeft: "30px",
                lineHeight: "2.3rem",
                fontSize: "1.4rem",
                marginLeft: "20px",
              }}
            >
              {sections.map((sec) => (
                <h2 key={sec.title} style={{ marginBottom: "12px" }}>
                  <Link
                    to={sec.path}
                    style={{
                      color: "white",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ffd954")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                  >
                    {sec.title}
                  </Link>
                </h2>
              ))}
            </ol>
          </div>

          {/* 思い出を記入する */}
          <Link
            to="/post"
            style={{
              background: "white",
              color: "#e46c6c",
              padding: "16px 34px",
              borderRadius: "12px",
              fontWeight: "bold",
              textDecoration: "none",
              fontSize: "1.3rem",
              marginTop: "40px",
              boxShadow: "3px 3px 0 #c94f4f",
            }}
          >
            思い出を記入する
          </Link>

          {/* アルバムを閉じる */}
          <button
            onClick={() => navigate("/countdown")}
            style={{
              marginTop: "20px",
              background: "transparent",
              border: "none",
              color: "white",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            卒業アルバムを閉じる
          </button>
        </div>
      </div>

      {/* 🌸 花びらアニメーション */}
      <style>
        {`
          @keyframes fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0.3; }
          }
        `}
      </style>
    </div>
  );
}
