import React, { useEffect, useState } from "react";

export default function Home() {
  const [today, setToday] = useState({ month: 0, day: 0 });
  const [nichoku, setNichoku] = useState("");
  const [petals, setPetals] = useState([]);
  const [albumPage, setAlbumPage] = useState("toc"); // ← アルバムの中身を管理

  useEffect(() => {
    const date = new Date();
    setToday({ month: date.getMonth() + 1, day: date.getDate() });

    const names = ["みやざきあさこ", "まつおかあや", "よしかわみさき"];
    setNichoku(names[Math.floor(Math.random() * names.length)]);

    // 🌸 花びら生成
    const petalsArr = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 10 + Math.random() * 14,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 5,
      rotate: Math.random() * 360,
    }));
    setPetals(petalsArr);
  }, []);

  // アルバムの中身を切り替える関数
  const renderAlbumContent = () => {
    switch (albumPage) {
      case "toc":
        return (
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
              <h2 style={{ marginBottom: "12px" }}>1. 推し曲!!!</h2>
              <h2 style={{ marginBottom: "12px" }}>2. カレンダー!!!</h2>
              <h2 style={{ marginBottom: "12px" }}>3. 思い出マップ!!!</h2>
              <h2 style={{ marginBottom: "12px" }}>4. 寄せ書き!!!</h2>
              <h2 style={{ marginBottom: "12px" }}>5. 制作協力!!!</h2>
            </ol>
            <button
              onClick={() => setAlbumPage("post")}
              style={{
                background: "white",
                color: "#e46c6c",
                padding: "16px 34px",
                borderRadius: "12px",
                fontWeight: "bold",
                border: "none",
                fontSize: "1.3rem",
                marginTop: "40px",
                boxShadow: "3px 3px 0 #c94f4f",
                cursor: "pointer",
              }}
            >
              思い出を記入する
            </button>
          </div>
        );

      case "post":
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "16px",
              width: "100%",
            }}
          >
            <h2 style={{ fontSize: "2.4rem", marginBottom: "12px" }}>
              思い出を記入する ✏️
            </h2>
            <textarea
              placeholder="ここに思い出を書いてね！"
              style={{
                width: "100%",
                height: "200px",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                outline: "none",
                fontSize: "1.1rem",
                fontFamily: "inherit",
              }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={{
                  background: "white",
                  color: "#e46c6c",
                  padding: "10px 24px",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  border: "none",
                  boxShadow: "3px 3px 0 #c94f4f",
                  cursor: "pointer",
                }}
              >
                投稿する
              </button>
              <button
                onClick={() => setAlbumPage("toc")}
                style={{
                  background: "transparent",
                  color: "white",
                  textDecoration: "underline",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                ← 目次に戻る
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
          border: "10px solid #fff",
          borderRadius: "12px",
          boxShadow: "inset 0 0 25px rgba(0,0,0,0.4)",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          paddingRight: "120px",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        {/* 🌸 花びらレイヤー */}
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

        {/* 日付＋日直 */}
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
          <span
            style={{
              writingMode: "horizontal-tb",
              display: "inline-block",
              fontSize: "2.4rem",
            }}
          >
            {today.month}
          </span>
          月
          <span
            style={{
              writingMode: "horizontal-tb",
              display: "inline-block",
              fontSize: "2.4rem",
            }}
          >
            {today.day}
          </span>
          日 日直 {nichoku}
        </div>

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
            zIndex: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginRight: "60px",
            transition: "all 0.4s ease-in-out",
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
              background:
                "linear-gradient(90deg, #b34d4d 0%, #d26060 40%, #e46c6c 100%)",
              borderRadius: "8px 0 0 8px",
              boxShadow: "inset -2px 0 5px rgba(0,0,0,0.3)",
            }}
          ></div>

          {/* 中身切り替え部分 */}
          {renderAlbumContent()}
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
