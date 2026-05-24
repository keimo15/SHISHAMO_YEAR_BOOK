import React, { useEffect, useState } from "react";
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
import html2canvas from "html2canvas";
import { Trash2 } from "lucide-react"; // ← ゴミ箱アイコン

export default function ViewMessages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [styledMessages, setStyledMessages] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const colors = ["#ff7b7b", "#ffa74d", "#ffdc4d", "#7bffb5", "#7bafff", "#da7bff", "#ff7bd8"];

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
  const generateRandomStyles = (msgs) =>
    msgs.map((msg) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const noteWidth = 200;  // 付箋の幅
      const noteHeight = 150; // 高さの目安（文字量に応じて調整可）

      return {
        ...msg,
        x: Math.random() * (width - noteWidth),
        y: Math.random() * (height - noteHeight),
        rotate: Math.random() * 20 - 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        fontSize: `${Math.random() * 0.4 + 1}rem`,
        zIndex: Math.floor(Math.random() * 50),
      };
    });

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
  }, [messages]);

  // 🔹 背景クリックで再配置（シャッフル）
  const shuffleLayout = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const noteWidth = 200;
    const noteHeight = 150;

    setStyledMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        x: Math.random() * (width - noteWidth),
        y: Math.random() * (height - noteHeight),
        rotate: Math.random() * 20 - 10,
      }))
    );
  };

  // 🔹 スクショ機能
  const takeScreenshot = async () => {
    const element = document.getElementById("message-board");
    const canvas = await html2canvas(element, { scale: 2 });
    const link = document.createElement("a");
    link.download = "寄せ書き.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  // 🔹 削除機能
  const handleDelete = async (msg) => {
    const input = prompt("削除用パスワードを入力してください:");
    if (!input) return;
    if (input !== msg.password) return alert("パスワードが違います。");

    setDeletingId(msg.id);
    setTimeout(async () => {
      await deleteDoc(doc(db, "messages", msg.id));
      setStyledMessages((prev) => prev.filter((m) => m.id !== msg.id));
      alert("メッセージを削除しました。");
    }, 1000);
  };

  // 🔹 検索
  const filteredMessages = styledMessages.filter(
    (m) =>
      m.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.sns && m.sns.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          display: "flex",
          gap: "10px",
          zIndex: 1000,
        }}
      >
        <button onClick={() => navigate("/home")} style={buttonStyle}>
          ← ホーム
        </button>
        <button onClick={takeScreenshot} style={{ ...buttonStyle, background: "#7bafff" }}>
          📸 スクショ
        </button>
        <input
          type="text"
          placeholder="🔍 検索（名前・SNS・内容）"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontFamily: "'Yomogi', cursive",
            width: "200px",
          }}
        />
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
              padding: "10px 14px",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              textAlign: "center",
              width: "200px",
              fontWeight: "600",
              lineHeight: "1.5",
              zIndex: msg.zIndex || 1,
              userSelect: "none",
            }}
          >
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
                fontSize: "0.85rem",
                color: "#444",
                whiteSpace: "nowrap",
              }}
            >
              - {msg.name || "匿名のしゃもサポ"} {msg.sns && `(${msg.sns})`}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>

      {messages.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#999",
          }}
        >
          メッセージがまだありません 📮
        </div>
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
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
  fontWeight: "bold",
  fontFamily: "'Yomogi', cursive",
};
