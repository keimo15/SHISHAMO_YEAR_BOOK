import React, { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

// --------------------------------------------------
// 投稿フォーム群（寄せ書き・マップ・カレンダー）
// --------------------------------------------------
export default function PostForms({ onBack }) {
  const [index, setIndex] = useState(0);
  const forms = [
    { component: <MessageForm />, title: "✉️ 寄せ書き" },
    { component: <MemoryForm />, title: "🗾 思い出マップ" },
    { component: <MemoryDateForm />, title: "📅 カレンダー思い出" },
  ];

  const next = () => setIndex((i) => (i + 1) % forms.length);
  const prev = () => setIndex((i) => (i - 1 + forms.length) % forms.length);

  const handlers = useSwipeable({
    onSwipedLeft: next,
    onSwipedRight: prev,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  return (
    <div {...handlers} style={{ width: "100%", textAlign: "center" }}>
      <h2 style={{ fontSize: "2.4rem", marginBottom: "20px", color: "white" }}>
        {forms[index].title}
      </h2>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          minHeight: "440px", // 全フォーム統一サイズ
        }}
      >
        {forms[index].component}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "12px",
        }}
      >
        <button onClick={prev} style={navBtn}>
          ← 前へ
        </button>
        <button onClick={next} style={navBtn}>
          次へ →
        </button>
      </div>

      <button
        onClick={onBack}
        style={{
          marginTop: "20px",
          background: "transparent",
          color: "white",
          textDecoration: "underline",
          border: "none",
          cursor: "pointer",
        }}
      >
        ← 目次に戻る
      </button>
    </div>
  );
}

// --------------------------------------------------
// 各フォーム
// --------------------------------------------------
function MessageForm() {
  const [name, setName] = useState("");
  const [sns, setSns] = useState("");
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return alert("メッセージを入力してください！");
    if (!password.trim()) return alert("削除用パスワードは必須です。");
    if (!agree) return alert("SNS共有への同意が必要です。");

    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        name,
        sns,
        text,
        password,
        createdAt: new Date(),
      });
      alert("寄せ書きを投稿しました📮");
      setName(""); setSns(""); setText(""); setPassword(""); setAgree(false);
    } catch (err) {
      console.error(err);
      alert("投稿中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <input
        placeholder="ニックネーム（任意）"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Xアカウント（任意）"
        value={sns}
        onChange={(e) => setSns(e.target.value)}
        style={inputStyle}
      />
      <textarea
        placeholder="SHISHAMOへのメッセージ"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="削除用パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <label style={checkboxLabelStyle}>
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />{" "}
        SNS共有を許可
      </label>
      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? "投稿中..." : "思い出を記入する!!!"}
      </button>
    </form>
  );
}

function MemoryForm() {
  const [name, setName] = useState("");
  const [sns, setSns] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const prefectures = [
    "北海道","青森","岩手","宮城","秋田","山形","福島",
    "茨城","栃木","群馬","埼玉","千葉","東京","神奈川",
    "新潟","富山","石川","福井","山梨","長野","岐阜","静岡","愛知",
    "三重","滋賀","京都","大阪","兵庫","奈良","和歌山",
    "鳥取","島根","岡山","広島","山口",
    "徳島","香川","愛媛","高知",
    "福岡","佐賀","長崎","熊本","大分","宮崎","鹿児島","沖縄"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prefecture) return alert("都道府県を選んでね！");
    if (!message.trim()) return alert("思い出メッセージを入力してね！");
    if (!password.trim()) return alert("削除用パスワードを入力してね！");

    setLoading(true);
    try {
      await addDoc(collection(db, "memories"), {
        name,
        sns,
        prefecture,
        message,
        password,
        createdAt: new Date(),
      });
      alert("思い出をマップに投稿しました🗾");
      setName(""); setSns(""); setPrefecture(""); setMessage(""); setPassword("");
    } catch (err) {
      console.error(err);
      alert("投稿中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <input
        placeholder="ニックネーム（任意）"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Xアカウント（任意）"
        value={sns}
        onChange={(e) => setSns(e.target.value)}
        style={inputStyle}
      />
      <select
        value={prefecture}
        onChange={(e) => setPrefecture(e.target.value)}
        style={inputStyle}
      >
        <option value="">都道府県を選択</option>
        {prefectures.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <textarea
        placeholder="思い出メッセージ"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="削除用パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? "投稿中..." : "思い出を記入する!!!"}
      </button>
    </form>
  );
}

function MemoryDateForm() {
  const [name, setName] = useState("");
  const [sns, setSns] = useState("");
  const [date, setDate] = useState("");
  const [event, setEvent] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) return alert("日付を選択してね！");
    if (!event.trim()) return alert("出来事を入力してね！");
    if (!password.trim()) return alert("削除用パスワードは必須です！");

    setLoading(true);
    try {
      await addDoc(collection(db, "memoriesByDate"), {
        name,
        sns,
        date,
        event,
        password,
        createdAt: new Date(),
      });
      alert("カレンダーに追加しました📅");
      setName(""); setSns(""); setDate(""); setEvent(""); setPassword("");
    } catch (err) {
      console.error(err);
      alert("投稿中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <input
        placeholder="ニックネーム（任意）"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Xアカウント（任意）"
        value={sns}
        onChange={(e) => setSns(e.target.value)}
        style={inputStyle}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={inputStyle}
      />
      <textarea
        placeholder="出来事・メモ"
        value={event}
        onChange={(e) => setEvent(e.target.value)}
        rows={4}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="削除用パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? "投稿中..." : "思い出を記入する!!!"}
      </button>
    </form>
  );
}

// --------------------------------------------------
// 共通スタイル
// --------------------------------------------------
const formStyle = {
  width: "100%",
  maxWidth: "340px",
  minHeight: "420px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "10px",
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  textAlign: "left",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  fontFamily: "'Yomogi', cursive",
};

const buttonStyle = {
  background: "#e46c6c",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "10px",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
};

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "0.9rem",
  color: "#333",
};

const navBtn = {
  background: "white",
  border: "1px solid #ccc",
  borderRadius: "20px",
  padding: "6px 12px",
  cursor: "pointer",
};
