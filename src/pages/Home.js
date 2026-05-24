import React, { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import PostForms from "../components/PostMessage";
import ViewMessages from "../components/View";
import Calendar from "../components/Calendar";
import { useSwipeable } from "react-swipeable";

export default function Home() {
  const [today, setToday] = useState({ month: 0, day: 0 });
  const [nichoku, setNichoku] = useState("");
  const [petals, setPetals] = useState([]);
  const [albumPage, setAlbumPage] = useState("toc");
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 検索ワード
  const [flash, setFlash] = useState(false); // 💡 フラッシュON/OFF状態
  const boardRef = useRef(null);

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

  const handlers = useSwipeable({
    onSwipedRight: () => setAlbumPage("toc"),
  });

  // 📘 アルバム中身を切り替え
  const renderAlbumContent = () => {
    switch (albumPage) {
      case "toc":
        // 目次データ（クリックでページ切り替え）
        const tocItems = [
          { label: "推し曲", page: "fav" },
          { label: "カレンダー思い出", page: "calendar" },
          { label: "思い出マップ", page: "map" },
          { label: "寄せ書き", page: "view" },
          { label: "制作協力", page: "credit" },
        ];

        return (
          <div
            style={{
              marginTop: "0px",
              width: "100%",
              textAlign: "left",
              marginLeft: "40px",
            }}
          >
            <h2 style={{ fontSize: "3.6rem", marginBottom: "12px" }}>目次</h2>

            <ol
              style={{
                paddingLeft: "30px",
                lineHeight: "2.6rem",
                fontSize: "1.6rem",
                marginLeft: "20px",
                listStyleType: "decimal",
              }}
            >
              {tocItems.map((item) => (
                <li
                  key={item.label}
                  onClick={() => setAlbumPage(item.page)}
                  style={{
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    transition: "all 0.2s",
                    background:
                      albumPage === item.page ? "#ffe066" : "transparent",
                    color: albumPage === item.page ? "#2f2f2f" : "white",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#fff17a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      albumPage === item.page ? "#ffe066" : "transparent")
                  }
                >
                  {item.label}
                </li>
              ))}
            </ol>

            <div style={{ display: "flex", gap: "16px", marginTop: "40px" }}>
              <button onClick={() => setAlbumPage("post")} style={buttonStyle}>
                思い出を記入する
              </button>
            </div>
          </div>
        );


      case "post":
        return <PostForms onBack={() => setAlbumPage("toc")} />;

      case "view":
        return (
          <div style={{ width: "100%", textAlign: "center" }}>
            {/* 🔍 検索ボックス */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="キーワードで検索..."
              style={{
                width: "80%",
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                fontSize: "1.2rem",
                marginBottom: "20px",
              }}
            />
            <ViewMessages mode="album" searchTerm={searchTerm} />
          </div>
        );

      case "calendar":
        return <Calendar />;

      default:
        return null;
    }
  };

  // 📸 スクショ処理
  const handleScreenshot = async () => {
    if (!boardRef.current) return;

    // 💥 フラッシュ開始
    setFlash(true);
    setTimeout(() => setFlash(false), 300);

    const canvas = await html2canvas(boardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    const link = document.createElement("a");
    link.download = "screenshot.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      {...handlers}
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
      {/* 📸 スクショボタン */}
      <button
        onClick={handleScreenshot}
        style={{
          position: "absolute",
          top: "20px",
          right: "40px",
          zIndex: 20,
          background: "#fff",
          color: "#2f5d50",
          border: "2px solid #2f5d50",
          padding: "8px 14px",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "2px 2px 4px rgba(0,0,0,0.2)",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "#dff3eb")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "#fff")
        }
      >
        📸 スクショ
      </button>

      {/* 💥 フラッシュ演出 */}
      {flash && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "white",
            opacity: 0.8,
            zIndex: 999,
            animation: "flashFade 0.3s ease-out",
            pointerEvents: "none",
          }}
        />
      )}

      {/* 黒板背景 */}
      <div
        ref={boardRef} // ← ここを撮影対象にする
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
        }}
      >
        {/* 🌸 花びら */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
            pointerEvents: "none",
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

        {/* 📝 黒板上の寄せ書き（viewタブのときのみ） */}
        {albumPage === "view" && (
          <ViewMessages mode="board" />
        )}

        {/* 🧑‍🏫 日直情報 */}
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
            zIndex: 5,
          }}
        >
          <span style={{ writingMode: "horizontal-tb", fontSize: "2.4rem" }}>
            {today.month}
          </span>
          月
          <span style={{ writingMode: "horizontal-tb", fontSize: "2.4rem" }}>
            {today.day}
          </span>
          日 日直 {nichoku}
        </div>

        {/* 📖 アルバム本体 */}
        <div
          style={{
            position: "relative",
            background: "#e46c6c",
            width: "440px",
            height: "600px", // ⬅ 高さ少しUPでバランス良く
            borderRadius: "8px",
            boxShadow: "8px 10px 0 #c94f4f, inset 6px 0 10px rgba(0,0,0,0.25)",
            padding: "60px 50px 100px 60px",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginRight: "60px",
            zIndex: 4,
          }}
        >
          {/* 栞タブ */}
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
            {[
              { label: "もくじ", color: "#e46c6c", page: "toc" },
              { label: "とうこう", color: "#b0b0b0", page: "post" },
              { label: "よせがき", color: "#7bafff", page: "view" },
              { label: "カレンダー", color: "#ffc04d", page: "calendar" }, // 🌟 新しい栞追加
            ].map((tab) => (
              <div
                key={tab.label}
                style={{
                  background:
                    albumPage === tab.page
                      ? tab.color
                      : `${tab.color}cc`,
                  transition: "0.2s",
                  color: "#fff",
                  width: "36px",
                  height: `${tab.label === "とうこう" ? 105 : 90}px`,
                  borderRadius: "6px 6px 0 0",
                  writingMode: "vertical-rl",
                  textOrientation: "upright",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow:
                    "inset 0 -4px 4px rgba(0,0,0,0.25), 0 2px 3px rgba(0,0,0,0.2)",
                }}
                onClick={() => setAlbumPage(tab.page)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.filter = "brightness(1.2)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.filter = "brightness(1.0)")
                }
              >
                {tab.label}
              </div>
            ))}
          </div>

          {/* 中身 */}
          {renderAlbumContent()}
        </div>

      </div>

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

const buttonStyle = {
  background: "white",
  color: "#e46c6c",
  padding: "16px 34px",
  borderRadius: "12px",
  fontWeight: "bold",
  border: "none",
  fontSize: "1.4rem",
  boxShadow: "3px 3px 0 #c94f4f",
  cursor: "pointer",
};
