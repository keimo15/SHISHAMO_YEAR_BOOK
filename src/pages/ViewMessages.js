import React, { useCallback, useEffect, useState } from "react";
import bcrypt from "bcryptjs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react"; // ← ゴミ箱アイコン
import EmptyNote from "../components/EmptyNote";

const MESSAGE_COLORS = ["#ff7b7b", "#ffa74d", "#ffdc4d", "#7bffb5", "#7bafff", "#da7bff", "#ff7bd8"];
const MOBILE_BREAKPOINT = 768;
const getNoteSize = () =>
  window.innerWidth <= MOBILE_BREAKPOINT
    ? { width: 150, height: 120 }
    : { width: 200, height: 150 };

export default function ViewMessages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [styledMessages, setStyledMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [targetFilter, setTargetFilter] = useState("ALL");

  // 🔹 Firestoreからメッセージ取得
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, []);

  // 🔹 付箋スタイル生成
  const generateRandomStyles = useCallback((msgs) =>
    msgs.map((msg) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const { width: noteWidth, height: noteHeight } = getNoteSize();

      return {
        ...msg,
        x: Math.random() * (width - noteWidth),
        y: Math.random() * (height - noteHeight),
        rotate: Math.random() * 20 - 10,
        color: MESSAGE_COLORS[Math.floor(Math.random() * MESSAGE_COLORS.length)],
        fontSize: window.innerWidth <= MOBILE_BREAKPOINT
          ? `${Math.random() * 0.18 + 0.82}rem`
          : `${Math.random() * 0.4 + 1}rem`,
        zIndex: Math.floor(Math.random() * 50),
      };
    }), []);

  // 🔹 初期表示＆ハイライト投稿の遅延表示
  useEffect(() => {
    if (messages.length === 0) return;
    const highlightId = searchParams.get("highlight");
    const others = messages.filter((m) => m.id !== highlightId);
    const latest = messages.find((m) => m.id === highlightId);

    const otherStyles = generateRandomStyles(others);
    setStyledMessages(otherStyles);

    if (latest) {
      setTimeout(() => {
        setStyledMessages((prev) => [
          ...prev,
          {
            ...latest,
            x: 50,
            y: 50,
            rotate: Math.random() * 6 - 3,
            color: "#ff7b7b",
            fontSize: "1.2rem",
            zIndex: 999,
          },
        ]);
      }, 2000);
    }
  }, [generateRandomStyles, messages, searchParams]);

  // 🔹 背景クリックで再配置（シャッフル）
  const shuffleLayout = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const { width: noteWidth, height: noteHeight } = getNoteSize();

    setStyledMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        x: Math.random() * (width - noteWidth),
        y: Math.random() * (height - noteHeight),
        rotate: Math.random() * 20 - 10,
      }))
    );
  };

  // 🔹 削除機能
  const handleDelete = async (msg) => {
    const input = prompt("削除用パスワードを入力してください:");
    if (!input) return;

    // ハッシュ照合
    const isMatch = await bcrypt.compare(input, msg.password);
    if (!isMatch) {
      return alert("パスワードが違います。");
    }

    setTimeout(async () => {
      await deleteDoc(doc(db, "messages", msg.id));
      setStyledMessages((prev) => prev.filter((m) => m.id !== msg.id));
      alert("メッセージを削除しました。");
    }, 1000);
  };

  // 🔹 検索
  const filteredMessages = styledMessages.filter((m) => {
    if (
      targetFilter !== "ALL" &&
      m.target !== targetFilter
    ) {
      return false;
    }

    if (!searchTerm) return true;

    return (
      m.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.name &&
        m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.sns &&
        m.sns.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.target &&
        m.target.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div
      id="message-board"
      onClick={(e) => {
        // 特定のUI要素を除いてクリック時にシャッフル
        if (
          e.target.closest("button") ||
          e.target.closest("input") ||
          e.target.closest("svg")
        )
          return;
        shuffleLayout();
      }}
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#fffef6",
        overflow: "hidden",
        fontFamily: "'Yomogi', cursive",
      }}
    >
      {/* 🔸 ヘッダー */}
      <div
        style={{
          position: "fixed",
          top: 10,
          left: 10,
          right: 10,
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", gap: "8px", width: "100%" }}>
          <button onClick={() => navigate("/home0")} style={buttonStyle}>
            もくじ
          </button>
          <input
            type="text"
            placeholder="🔍 検索（名前・SNS・内容）"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              minWidth: 0,
              flex: 1,
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontFamily: "'Yomogi', cursive",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            gap: "6px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          {[
            "ALL",
            "SHISHAMO",
            "宮崎朝子",
            "松岡彩",
            "吉川美沙貴",
            "その他",
          ].map((target) => (
            <button
              key={target}
              onClick={() => setTargetFilter(target)}
              style={{
                ...buttonStyle,
                flexShrink: 0,
                opacity: targetFilter === target ? 1 : 0.5,
              }}
            >
              {target}
            </button>
          ))}
        </div>

      </div>

      {/* 🔸 付箋の表示 */}
      <AnimatePresence>
        {filteredMessages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ y: -200, opacity: 0, rotate: msg.rotate - 20, scale: 0.8 }}
            animate={{
              x: msg.x,
              y: msg.y,
              rotate: msg.rotate,
              opacity: 1,
              scale: 1,
              transition: { type: "spring", stiffness: 50, delay: i * 0.08 },
            }}

            exit={{
              y: 800,
              rotate: msg.rotate + 40,
              opacity: 0,
              transition: { duration: 1 },
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              transform: "translate(-50%, -50%)",
              background: "rgba(255,255,255,0.8)",
              color: msg.color,
              padding: window.innerWidth <= MOBILE_BREAKPOINT ? "8px 10px" : "10px 14px",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              textAlign: "center",
              width: window.innerWidth <= MOBILE_BREAKPOINT ? "150px" : "200px",
              fontWeight: "600",
              lineHeight: "1.5",
              zIndex: msg.zIndex || 1,
              userSelect: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: window.innerWidth <= MOBILE_BREAKPOINT ? "-7px" : "-9px",
                left: "50%",
                width: window.innerWidth <= MOBILE_BREAKPOINT ? "48px" : "62px",
                height: window.innerWidth <= MOBILE_BREAKPOINT ? "14px" : "17px",
                borderRadius: "2px",
                background: "rgba(255, 232, 153, 0.68)",
                boxShadow: "0 1px 2px rgba(125, 90, 47, 0.1)",
                transform: "translateX(-50%) rotate(-3deg)",
                pointerEvents: "none",
              }}
            />

            {/* 🗑️ ゴミ箱アイコン */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(msg);
              }}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                cursor: "pointer",
                opacity: 0.7,
              }}
            >
              <Trash2 size={18} />
            </div>

            <p style={{ margin: "0 0 6px 0" }}>{msg.text}</p>
            <p
              style={{
                fontSize: window.innerWidth <= MOBILE_BREAKPOINT ? "0.7rem" : "0.8rem",
                color: "#444",
                // marginBottom: "4px",
              }}
            >
              to {msg.target || "SHISHAMO"}
            </p>

            <p
              style={{
                fontSize: window.innerWidth <= MOBILE_BREAKPOINT ? "0.72rem" : "0.85rem",
                color: "#555",
                whiteSpace: "nowrap",
              }}
            >
              {msg.name || "匿名のしゃもサポ"} {msg.sns && `@${msg.sns}`}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>

      <p
        style={{
          position: "fixed",
          left: "50%",
          bottom: "14px",
          zIndex: 900,
          margin: 0,
          padding: "5px 12px",
          borderRadius: "999px",
          background: "rgba(255, 253, 246, 0.5)",
          color: "rgba(109, 89, 70, 0.46)",
          fontSize: window.innerWidth <= MOBILE_BREAKPOINT ? "0.72rem" : "0.82rem",
          letterSpacing: "0.05em",
          textAlign: "center",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        画面をタップすると付箋を並び替えられます
      </p>

      {messages.length === 0 && (
        <EmptyNote
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(88vw, 360px)",
            margin: 0,
          }}
        >
          メッセージがまだありません。
        </EmptyNote>
      )}
    </div>
  );
}

const buttonStyle = {
  background: "#ff7b7b",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "8px 12px",
  cursor: "pointer",
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  fontWeight: "bold",
  fontFamily: "'Yomogi', cursive",
};
