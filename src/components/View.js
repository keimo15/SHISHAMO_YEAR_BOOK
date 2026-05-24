import React, { useEffect, useState, useMemo } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function ViewMessages({ mode = "album", searchTerm = "" }) {
  const [messages, setMessages] = useState([]);

  // 🗂 Firestoreからデータ取得
  useEffect(() => {
    const fetchMessages = async () => {
      const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);
      setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchMessages();
  }, []);

  // 🎨 ランダム文字色の取得
  const colorPool = ["#e46c6c", "#4d73c9", "#5bb97a", "#c47ed4", "#f2a93b"];
  const getRandomTextColor = () =>
    colorPool[Math.floor(Math.random() * colorPool.length)];

  // 🔍 検索絞り込み（アルバムのみ適用）
  const filteredMessages =
    mode === "album"
      ? messages.filter((m) => {
          const lowerTerm = searchTerm.toLowerCase();
          return (
            m.text?.toLowerCase().includes(lowerTerm) ||
            (m.name || "").toLowerCase().includes(lowerTerm) || // ← 🔍 名前でも検索
            (m.xaccount || "").toLowerCase().includes(lowerTerm)
          );
        })
      : messages;

  // 🧩 テキスト長に応じた高さ計算（短文をより低く）
  const getDynamicHeight = (text = "") => {
    const length = text.length;
    if (length < 15) return 70;   // ← 🔽 短文用
    if (length < 30) return 100;
    if (length < 60) return 130;
    if (length < 120) return 160;
    return 200;
  };

  // シャッフル（Fisher–Yates）
  const shuffleArray = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // 🎲 表示用データを useMemo で作る（色・回転を固定化）
  const preparedMessages = useMemo(() => {
    const source = mode === "album" ? filteredMessages : messages;
    const mapped = source.map((m) => ({
      ...m,
      __color: getRandomTextColor(),
      __rotate: (Math.random() * 12 - 6).toFixed(2), // -6〜+6°
    }));
    return shuffleArray(mapped);
  }, [filteredMessages, messages, mode, searchTerm]);

  // 表示上限
  const boardLimit = 40;
  const albumLimit = 30;
  const boardMessages = preparedMessages.slice(0, boardLimit);
  const albumMessages = preparedMessages.slice(0, albumLimit);

  // 🌸 黒板モード
  if (mode === "board") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 3,
        }}
      >
        <AnimatePresence>
          {boardMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{
                x: Math.random() * window.innerWidth * 0.8,
                y: Math.random() * window.innerHeight * 0.8,
                rotate: Math.random() * 20 - 10,
                opacity: 0,
              }}
              animate={{
                opacity: 1,
                transition: { duration: 1.2 + Math.random() * 0.6 },
              }}
              style={{
                position: "absolute",
                background: "#fffbe8",
                color: msg.__color,
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "0.9rem",
                boxShadow: "2px 2px 6px rgba(0,0,0,0.25)",
                userSelect: "none",
                maxWidth: "180px",
                wordWrap: "break-word",
                transform: `rotate(${Math.random() * 12 - 6}deg)`,
              }}
            >
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>
              <div style={{ fontSize: "0.7rem", marginTop: 6, opacity: 0.8 }}>
                - {msg.nickname || msg.name || "匿名"}
                {msg.xaccount && (
                  <span style={{ display: "block", fontSize: "0.65rem" }}>
                    @{msg.xaccount}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // 📖 アルバムモード（整列＋スクロール可）
  return (
    <div
      style={{
        width: "100%",
        height: "420px",
        overflowY: "auto",
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        padding: "16px",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <AnimatePresence>
        {albumMessages.length > 0 ? (
          albumMessages.map((msg) => {
            const dynamicHeight = getDynamicHeight(msg.text || "");
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                style={{
                  background: "#fffbe8",
                  color: msg.__color,
                  padding: "12px",
                  borderRadius: "10px",
                  width: "140px",
                  minHeight: `${dynamicHeight}px`,
                  textAlign: "center",
                  boxShadow: "2px 2px 6px rgba(0,0,0,0.25)",
                  transform: `rotate(${msg.__rotate}deg)`,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <p style={{ fontSize: "0.95rem", margin: 0, whiteSpace: "pre-wrap" }}>
                  {msg.text}
                </p>
                <p
                  style={{
                    fontSize: "0.7rem",
                    margin: 0,
                    marginTop: "8px",
                    opacity: 0.7,
                  }}
                >
                  - {msg.nickname || msg.name || "匿名"}
                  {msg.xaccount && (
                    <span style={{ display: "block", fontSize: "0.6rem" }}>
                      @{msg.xaccount}
                    </span>
                  )}
                </p>
              </motion.div>
            );
          })
        ) : (
          <p style={{ color: "white", fontSize: "1rem", marginTop: "40px" }}>
            寄せ書きが見つかりませんでした。
          </p>
        )}
      </AnimatePresence>
    </div>
  );
}
