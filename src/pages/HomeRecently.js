import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAt,
} from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const splitChalkText = (text) => {
  const normalized = text.trim().replace(/\s+/g, " ");

  if (normalized.length <= 12) return [normalized];

  const midpoint = Math.ceil(normalized.length / 2);
  return [normalized.slice(0, midpoint), normalized.slice(midpoint)];
};

export default function Home() {
  const navigate = useNavigate();
  const [today, setToday] = useState({ month: 0, day: 0 });
  const [nichoku, setNichoku] = useState("");
  const [petals, setPetals] = useState([]);
  const [featuredLyric, setFeaturedLyric] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const date = new Date();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    setToday({ month, day });

    const names = ["みやざきあさこ", "まつおかあや", "よしかわみさき"];
    const rareNames = ["K氏", "まつもとあや", "うたがわなお", "yucco", "しゃもサポ"];
    const nichokuNames = Math.random() < 0.01 ? rareNames : names;
    setNichoku(nichokuNames[Math.floor(Math.random() * nichokuNames.length)]);

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

    // 🔸 黒板に表示する歌詞をランダムに1件取得
    const fetchFeaturedLyric = async () => {
      try {
        const songsRef = collection(db, "favoriteSongs");
        const randomValue = Math.random();
        let snapshot = await getDocs(
          query(
            songsRef,
            orderBy("random"),
            startAt(randomValue),
            limit(1)
          )
        );

        if (snapshot.empty) {
          snapshot = await getDocs(
            query(songsRef, orderBy("random"), limit(1))
          );
        }

        // Existing posts are displayed until random is backfilled.
        if (snapshot.empty) {
          snapshot = await getDocs(query(songsRef, limit(1)));
        }

        setFeaturedLyric(
          snapshot.empty
            ? null
            : {
                id: snapshot.docs[0].id,
                ...snapshot.docs[0].data(),
              }
        );

      } catch (err) {
        console.error(err);
      }
    };

    fetchFeaturedLyric();

    // スマホサイズの取得.
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);

  }, []);

  const tabs = [
    { label: "もくじ", color: "#e46c6c", path: "/home0", height: 90 },
    { label: "よせがき", color: "#e1bd62", path: "/view", height: 95 },
    { label: "みんなのうた", color: "#7fa6c8", path: "/song", height: 100 },
    { label: "マップ", color: "#d6a94f", path: "/map", height: 80 },
    { label: "カレンダー", color: "#6f98bd", path: "/memories-by-date", height: 110 },
    { label: "とうこう", color: "#edc96e", path: "/post", height: 105 },
  ];

  const sections = [
    { title: "1. 寄せ書き!!!", path: "/view" },
    { title: "2. みんなのうた!!!", path: "/song" },
    { title: "3. しゃもサポマップ!!!", path: "/map" },
    { title: "4. カレンダー!!!", path: "/memories-by-date" },
    { title: "5. 制作協力!!!", path: "/thanks" },
  ];
  const chalkLines = featuredLyric
    ? splitChalkText(featuredLyric.lyrics?.trim() || featuredLyric.song)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background:
          "radial-gradient(circle at 18% 12%, rgba(255,255,255,0.72), transparent 24%), repeating-linear-gradient(0deg, rgba(177,142,96,0.045) 0 1px, transparent 1px 24px), #f5ead5",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontFamily: "'Yomogi', cursive",
        padding: isMobile ? "0px" :"20px",
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      {/* 黒板背景 */}
      <div
        style={{
          background:
            "radial-gradient(ellipse at 24% 38%, rgba(255,255,255,0.045), transparent 28%), radial-gradient(ellipse at 72% 66%, rgba(255,255,255,0.035), transparent 30%), repeating-linear-gradient(176deg, rgba(255,255,255,0.018) 0 2px, transparent 2px 8px), #2f5d50",
          width: isMobile ? "100%" : "92%",
          height: isMobile ? "max(100vh, 760px)" : "max(88vh, 760px)",
          flexShrink: 0,
          position: "relative",
          border: isMobile ? "none" : "12px solid #a9764f",
          borderRadius: isMobile ? "0" :"8px",
          boxShadow: isMobile
            ? "inset 0 0 28px rgba(0,0,0,0.46)"
            : "inset 0 0 28px rgba(0,0,0,0.46), 0 0 0 4px #80583e, 0 12px 24px rgba(93,66,41,0.18)",
          display: "flex",
          justifyContent: isMobile ? "center" : "flex-end",
          alignItems: isMobile ? "flex-start" : "center",
          paddingTop: isMobile ? "10vh" : "0px",
          paddingRight: isMobile ? "0px" : "120px",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background:
              "linear-gradient(12deg, transparent 16%, rgba(255,255,255,0.032) 18%, transparent 20%), linear-gradient(-9deg, transparent 58%, rgba(255,255,255,0.028) 60%, transparent 63%)",
            opacity: 0.84,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: isMobile ? 0 : "-6px",
            right: isMobile ? 0 : "-6px",
            bottom: 0,
            height: isMobile ? "14px" : "18px",
            zIndex: 6,
            pointerEvents: "none",
            background: isMobile
              ? "linear-gradient(#946643, #6f4a34)"
              : "linear-gradient(#bd8c64, #80573d)",
            boxShadow: "0 -2px 3px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.2)",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: isMobile ? "12%" : "22%",
              top: isMobile ? "-3px" : "-4px",
              width: isMobile ? "52px" : "72px",
              height: isMobile ? "5px" : "6px",
              borderRadius: "999px",
              background: "rgba(255,248,224,0.9)",
              boxShadow: "1px 1px 2px rgba(0,0,0,0.18)",
              transform: "rotate(-2deg)",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: isMobile ? "35%" : "38%",
              top: isMobile ? "-2px" : "-3px",
              width: isMobile ? "34px" : "46px",
              height: isMobile ? "5px" : "6px",
              borderRadius: "999px",
              background: "rgba(245,191,121,0.92)",
              boxShadow: "1px 1px 2px rgba(0,0,0,0.18)",
              transform: "rotate(3deg)",
            }}
          />
        </div>

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

        {/* 🔸 ランダムに選んだ歌詞を黒板へ表示 */}
        {featuredLyric && (
          <motion.div
            key={featuredLyric.id}
            initial={{ opacity: 0, x: -22, y: isMobile ? 0 : "-50%", rotate: -3 }}
            animate={{ opacity: 1, x: 0, y: isMobile ? 0 : "-50%", rotate: -1.5 }}
            transition={{ duration: 0.8, delay: 0.18 }}
            style={{
              position: "absolute",
              top: isMobile ? "79%" : "50%",
              left: isMobile ? "-15%" : "2%",
              width: isMobile ? "130vw" : "min(56vw, 780px)",
              zIndex: 3,
              color: "rgba(255,255,244,0.7)",
              textAlign: "center",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <div
              style={{
                fontSize: isMobile
                  ? "clamp(2.8rem, 14vw, 5.2rem)"
                  : "clamp(5rem, 8.8vw, 9rem)",
                fontWeight: "bold",
                lineHeight: "1.12",
                letterSpacing: "0.06em",
                textShadow:
                  "1px 1px 0 rgba(255,255,255,0.22), -2px 0 0 rgba(255,255,255,0.1), 2px -1px 0 rgba(255,255,255,0.08), 0 2px 5px rgba(0,0,0,0.12)",
                filter: "contrast(0.88) blur(0.25px)",
              }}
            >
              {chalkLines.map((line, index) => (
                <div key={`${line}-${index}`} style={{ whiteSpace: "nowrap" }}>
                  {line}
                </div>
              ))}
            </div>
          </motion.div>
        )}

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
                  fontVariantNumeric: "tabular-nums",
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
                  marginRight: "10px",
                  fontVariantNumeric: "tabular-nums",
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
            background: "#c94f4f",
            width: isMobile ? "92%" : "520px",
            height: isMobile ? "max(64%, 560px)" : "max(90%, 680px)",
            borderRadius: "10px",
            boxShadow: "12px 14px 0 #b84242, 0 20px 35px rgba(0,0,0,0.18)",
            color: "#444",
            zIndex: 4, // ← 花びらより上に
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginRight: "0px",
          }}
        >
          {/* 開いたアルバムのページ面 */}
          <div
            style={{
              position: "absolute",
              inset: "10px 8px 8px 18px",
              borderRadius: "4px 8px 8px 4px",
              background: "#fffdf2",
              boxShadow: "inset 3px 0 0 rgba(0,0,0,0.08)",
            }}
          />

          {/* 綴じ目 */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "24px",
              height: "100%",
              background: "linear-gradient(90deg, #a84444 0%, #cb5a5a 55%, #e46c6c 100%)",
              borderRadius: "10px 0 0 10px",
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
            {tabs.map((tab) => {
              const isActive = tab.path === "/home0";
              const restingTransform = isActive
                ? "translateY(3px) rotate(-2deg)"
                : "translateY(12px) rotate(0deg)";

              return (
              <Link
                key={tab.label}
                to={tab.path}
                style={{
                  background: tab.color,
                  color: "#fff",
                  width: isMobile ? "33px" : "38px",
                  height: `${tab.height}px`,
                  border: "1px solid rgba(255,255,255,0.28)",
                  borderBottom: "none",
                  borderRadius: "7px 7px 1px 1px",
                  writingMode: "vertical-rl",
                  textOrientation: "upright",
                  textDecoration: "none",
                  fontSize: isMobile ? "0.78rem" : "0.9rem",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.3s, box-shadow 0.3s, filter 0.2s",
                  boxShadow: isActive
                    ? "inset 0 -5px 5px rgba(0,0,0,0.16), 3px 4px 5px rgba(0,0,0,0.22)"
                    : "inset 0 -5px 5px rgba(0,0,0,0.2), 1px 3px 3px rgba(0,0,0,0.18)",
                  transformOrigin: "bottom center",
                  transform: restingTransform,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(2px) rotate(-5deg)";
                  e.currentTarget.style.boxShadow =
                    "inset 0 -2px 4px rgba(0,0,0,0.2), 2px 4px 6px rgba(0,0,0,0.2)";
                  e.currentTarget.style.filter = "brightness(1.1)";
                  e.currentTarget.style.backgroundColor = "#ff8ba7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = restingTransform;
                  e.currentTarget.style.boxShadow = isActive
                    ? "inset 0 -5px 5px rgba(0,0,0,0.16), 3px 4px 5px rgba(0,0,0,0.22)"
                    : "inset 0 -5px 5px rgba(0,0,0,0.2), 1px 3px 3px rgba(0,0,0,0.18)";
                  e.currentTarget.style.filter = "brightness(1)";
                  e.currentTarget.style.backgroundColor = tab.color;
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.46)",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.14)",
                  }}
                />
                <span style={{ marginTop: "12px" }}>{tab.label}</span>
                <span
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    width: "11px",
                    height: "11px",
                    background: "rgba(255,255,255,0.2)",
                    clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
                  }}
                />
              </Link>
              );
            })}
          </div>

          {/* 右上リボン */}
          <div
            style={{
              position: "absolute",
              top: isMobile ? "13%" : "34px",
              right: "18px",
              background: "#e46c6c",
              color: "white",
              fontWeight: "bold",
              padding: isMobile ? "3px 7px" : "6px 14px",
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
              position: "relative",
              marginTop: isMobile ? "10%" : "5%",
              width: isMobile ? "88%" : "100%",
              textAlign: "left",
              marginLeft: isMobile ? "18%" : "15%",
            }}
          >
            <h2
              style={{
                fontSize: isMobile ? "2.0rem" : "3.4rem",
                marginBottom: "0px",
                color: "#e46c6c",
                fontWeight: "900",
                letterSpacing: "0.08em",
                textShadow: "1px 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              もくじ
            </h2>
            <ol
              style={{
                paddingLeft: isMobile ? "20px" : "30px",
                lineHeight: isMobile ? "1.7rem" : "2.3rem",
                fontSize: isMobile ? "1.0rem" : "1.4rem",
                marginLeft: isMobile ? "4px" : "20px",
              }}
            >
              {sections.map((sec) => (
                <h2
                  key={sec.title}
                  style={{
                    marginBottom: "12px",
                    fontWeight: "900",
                    letterSpacing: "0.03em",
                    fontSize: isMobile ? "clamp(1rem, 4.8vw, 1.25rem)" : "1.5rem",
                  }}
                >
                  <Link
                    to={sec.path}
                    style={{
                      color: "#e46c6c",
                      fontWeight: "900",
                      textDecoration: "none",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ffd954")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#e46c6c")}
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
              position: "relative",
              background: "#e46c6c",
              color: "white",
              padding: "16px 34px",
              borderRadius: "12px",
              fontWeight: "bold",
              textDecoration: "none",
              fontSize: "1.3rem",
              marginTop: "40px",
              boxShadow: "3px 3px 0 #b84242",
            }}
          >
            思い出を記入する
          </Link>

          {/* アルバムを閉じる */}
          <button
            onClick={() => navigate("/countdown")}
            style={{
              marginTop: "20px",
              position: "relative",
              background: "transparent",
              border: "none",
              color: "#9d3f3f",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            卒業アルバムを閉じる
          </button>

          <Link
            to="/contact"
            style={{
              position: "absolute",
              right: "18px",
              bottom: "16px",
              color: "#9d3f3f",
              textDecoration: "underline",
              fontSize: isMobile ? "0.58rem" : "0.9rem",
              zIndex: 1,
              opacity: 0.9,
            }}
          >
            お問い合わせ
          </Link>
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
    </motion.div>
  );
}
