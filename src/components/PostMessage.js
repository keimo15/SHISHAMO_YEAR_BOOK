import React, { useState } from "react";
import bcrypt from "bcryptjs";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  runTransaction,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { allSongs } from "../data/songs";

const ANONYMOUS_CONTRIBUTOR = "\u533f\u540d\u306e\u3057\u3083\u3082\u30b5\u30dd";
const SITE_URL = "https://keimo15.github.io/SHISHAMO_YEAR_BOOK";

function shareOnX(label, content, isFirstPost = false, firstPostTarget = "") {
  const params = new URLSearchParams({
    text: "しゃもサポの卒業制作に投稿しました！",
    url: SITE_URL,
  });
  const normalizedContent = content.trim().replace(/\s+/g, " ");
  const shortenedContent =
    normalizedContent.length > 100
      ? `${normalizedContent.slice(0, 100)}...`
      : normalizedContent;
  params.set(
    "text",
    `\u3057\u3083\u3082\u30b5\u30dd\u306e\u5352\u696d\u5236\u4f5c\u306b\u6295\u7a3f\u3057\u307e\u3057\u305f${isFirstPost ? `\n\u300c${firstPostTarget}\u300d\u6700\u521d\u306e\u6295\u7a3f\u3067\u3059!!!` : ""}\n#\u3057\u3083\u3082\u30b5\u30dd\u306e\u5352\u0336\u696d\u0336\u5236\u4f5c\n\n${label}\n${shortenedContent}\n\n${SITE_URL}`
  );
  params.delete("url");

  window.open(
    `https://twitter.com/intent/tweet?${params.toString()}`,
    "_blank",
    "noopener,noreferrer"
  );
}

async function incrementCount(collectionName, id) {
  const countRef = doc(db, collectionName, id);
  let isFirstPost = false;

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(countRef);
    const currentCount =
      snapshot.exists() && typeof snapshot.data().count === "number"
        ? snapshot.data().count
        : 0;

    isFirstPost = currentCount <= 0;
    transaction.set(countRef, { count: currentCount + 1 }, { merge: true });
  });

  return isFirstPost;
}

async function saveContributor(name, sns) {
  const contributorName = name.trim() || ANONYMOUS_CONTRIBUTOR;
  const contributorSns = sns.trim().replace(/^@+/, "");
  const contributorRef = doc(
    db,
    "contributors",
    encodeURIComponent(contributorName)
  );

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(contributorRef);
    const contributor = {
      name: contributorName,
    };

    if (contributorSns) {
      contributor.sns = contributorSns;
    }

    if (!snapshot.exists()) {
      contributor.createdAt = serverTimestamp();
    }

    transaction.set(contributorRef, contributor, { merge: true });
  });
}

// --------------------------------------------------
// 投稿フォーム群（寄せ書き・マップ・カレンダー）
// --------------------------------------------------
export default function PostForms({ onBack }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [completedPost, setCompletedPost] = useState(null);
  const handleSubmitted = (post) => setCompletedPost(post);
  const forms = [
    { component: <MessageForm onSubmitted={handleSubmitted} />, icon: "✉", title: "SHISHAMO へ", note: "メッセージ" },
    { component: <MemoryForm onSubmitted={handleSubmitted} />, icon: "⌖", title: "マップ", note: "場所の思い出" },
    { component: <MemoryDateForm onSubmitted={handleSubmitted} />, icon: "▣", title: "カレンダー", note: "日付の思い出" },
    { component: <FavoriteSongForm onSubmitted={handleSubmitted} />, icon: "♪", title: "みんなのうた", note: "好きな曲" },
  ];

  return (
    <div style={postPageStyle}>
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
        <button onClick={() => navigate("/home0")} style={homeButtonStyle}>
          もくじ
        </button>
      </div>

      <div style={formTabsStyle}>
        {forms.map((form, formIndex) => {
          const active = formIndex === index;

          return (
            <button
              key={form.title}
              type="button"
              onClick={() => setIndex(formIndex)}
              style={{
                ...formTabStyle,
                background: active ? "#e46c6c" : "#fffdf2",
                color: active ? "#fff" : "#9d3f3f",
                transform: active ? "translateY(-4px) rotate(-1deg)" : "none",
                boxShadow: active
                  ? "0 6px 0 #b84242"
                  : "0 3px 8px rgba(0,0,0,0.1)",
              }}
            >
              <span style={{ fontSize: "1.35rem" }}>{form.icon}</span>
              <strong>{form.title}</strong>
              <small style={{ opacity: 0.8 }}>{form.note}</small>
            </button>
          );
        })}
      </div>

      <h2 style={{ fontSize: "2rem", margin: "22px 0 14px", color: "#e46c6c" }}>
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

      <button
        onClick={() => {
          if (onBack) {
            onBack();
            return;
          }

          navigate("/home0");
        }}
        style={{
          marginTop: "20px",
          background: "transparent",
          color: "#9d3f3f",
          textDecoration: "underline",
          border: "none",
          cursor: "pointer",
        }}
      >
        ← 目次に戻る
      </button>

      {completedPost && (
        <div style={modalBackdropStyle}>
          <div style={completionCardStyle}>
            <div style={tapeStyle} />
            <p style={{ margin: 0, color: "#e46c6c", fontWeight: "bold" }}>
              投稿ありがとうございました！
            </p>
            <h3 style={{ margin: "14px 0 8px", color: "#444" }}>
              {completedPost.isFirstPost
                ? `「${completedPost.firstPostTarget}」最初の投稿です!!! Xでシェアしませんか？`
                : "Xでもシェアしませんか？"}
            </h3>
            <p style={{ margin: "0 0 22px", color: "#777", fontSize: "0.9rem" }}>
              {completedPost.isFirstPost
                ? `「${completedPost.firstPostTarget}」最初の投稿として、投稿内容を入れた文面をXで確認できます。`
                : "投稿内容を入れた文面をXで確認できます。"}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                onClick={() => {
                  shareOnX(
                    completedPost.label,
                    completedPost.content,
                    completedPost.isFirstPost,
                    completedPost.firstPostTarget
                  );
                  setCompletedPost(null);
                }}
                style={{ ...buttonStyle, background: "#222" }}
              >
                Xで共有する
              </button>
              <button
                onClick={() => setCompletedPost(null)}
                style={{ ...buttonStyle, background: "#aaa" }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --------------------------------------------------
// 各フォーム
// --------------------------------------------------
function MessageForm({ onSubmitted }) {
  const [name, setName] = useState("");
  const [sns, setSns] = useState("");
  const [target, setTarget] = useState("SHISHAMO");
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const buttonColor =
  target === "松岡彩"
    ? "#ffe064" // 黄色
    : target === "吉川美沙貴"
    ? "#4d96ff" // 青
    : "#e46c6c"; // デフォルト（赤）

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return alert("メッセージを入力してください！");
    if (!password.trim()) return alert("削除用パスワードは必須です。");

    if (password.length < 5 || password.length > 15) {
      return alert("パスワードは5〜15文字で入力してください");
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        name,
        sns,
        target,
        text,
        random: Math.random(),
        password: await bcrypt.hash(password, 10),
        createdAt: serverTimestamp(),
      });
      await saveContributor(name, sns);
      onSubmitted({ label: "SHISHAMOへのメッセージ", content: text });
      setName(""); setSns(""); setTarget("SHISHAMO"); setText(""); setPassword("");
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
        maxLength={15}
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            padding: "10px",
            background: "#f5f5f5",
            border: "1px solid #ccc",
            borderRight: "none",
            borderRadius: "8px 0 0 8px",
          }}
        >
          @
        </span>

        <input
          placeholder="Xアカウント（任意）"
          value={sns}
          maxLength={15}
          onChange={(e) =>
            setSns(e.target.value.replace(/^@+/, ""))
          }
          style={{
            ...inputStyle,
            borderRadius: "0 8px 8px 0",
          }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            padding: "10px",
            background: "#f5f5f5",
            border: "1px solid #ccc",
            borderRight: "none",
            borderRadius: "8px 0 0 8px",
            whiteSpace: "nowrap",
          }}
        >
          宛先
        </span>

        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          style={{
            ...inputStyle,
            borderRadius: "0 8px 8px 0",
          }}
        >
          <option value="SHISHAMO">SHISHAMO</option>
          <option value="宮崎朝子">宮崎朝子</option>
          <option value="松岡彩">松岡彩</option>
          <option value="吉川美沙貴">吉川美沙貴</option>
          <option value="その他">その他</option>
        </select>
      </div>
      <textarea
        placeholder="メッセージ"
        maxLength={300}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="削除用パスワード（5〜15文字）"
        minLength={5}
        maxLength={15}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          ...buttonStyle,
          background: buttonColor,
        }}
      >
        {loading ? "投稿中..." : "メッセージを記入する!!!"}
      </button>
    </form>
  );
}

function MemoryForm({ onSubmitted }) {
  const [name, setName] = useState("");
  const [sns, setSns] = useState("");
  const [category, setCategory] = useState("思い出");
  const [address, setAddress] = useState("");
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

    if (password.length < 5 || password.length > 15) {
      return alert("パスワードは5〜15文字で入力してください");
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "memories"), {
        name,
        sns,
        category,
        prefecture,
        address,
        message,
        password: await bcrypt.hash(password, 10),
        createdAt: serverTimestamp(),
      });

      const isFirstPost = await incrementCount("prefectureCounts", prefecture);
      await saveContributor(name, sns);

      onSubmitted({
        label: `しゃもサポマップの思い出: ${prefecture}`,
        content: message,
        isFirstPost,
        firstPostTarget: prefecture,
      });
      setName(""); setSns(""); setCategory("思い出"); setPrefecture(""); setAddress(""); setMessage(""); setPassword("");
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
        maxLength={15}
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            padding: "10px",
            background: "#f5f5f5",
            border: "1px solid #ccc",
            borderRight: "none",
            borderRadius: "8px 0 0 8px",
          }}
        >
          @
        </span>

        <input
          placeholder="Xアカウント（任意）"
          value={sns}
          maxLength={15}
          onChange={(e) =>
            setSns(e.target.value.replace(/^@+/, ""))
          }
          style={{
            ...inputStyle,
            borderRadius: "0 8px 8px 0",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            padding: "10px",
            background: "#f5f5f5",
            border: "1px solid #ccc",
            borderRight: "none",
            borderRadius: "8px 0 0 8px",
            whiteSpace: "nowrap",
          }}
        >
          思い出 / 聖地
        </span>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            ...inputStyle,
            borderRadius: "0 8px 8px 0",
          }}
        >
          <option value="思い出">思い出</option>
          <option value="聖地">聖地</option>
        </select>
      </div>

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

      <input
        placeholder="住所（任意）"
        maxLength={100}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        style={inputStyle}
      />

      <textarea
        placeholder="思い出メッセージ"
        maxLength={300}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="削除用パスワード（5〜15文字）"
        minLength={5}
        maxLength={15}
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

function MemoryDateForm({ onSubmitted }) {
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

    if (password.length < 5 || password.length > 15) {
      return alert("パスワードは5〜15文字で入力してください");
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "memoriesByDate"), {
        name,
        sns,
        date,
        monthDay: date.slice(5),
        event,
        password: await bcrypt.hash(password, 10),
        createdAt: serverTimestamp(),
      });

      const isFirstPost = await incrementCount("dateCounts", date);
      await saveContributor(name, sns);

      onSubmitted({
        label: `${date}の思い出`,
        content: event,
        isFirstPost,
        firstPostTarget: `${parseInt(date.slice(5, 7), 10)}月${parseInt(
          date.slice(8, 10),
          10
        )}日`,
      });
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
        maxLength={15}
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            padding: "10px",
            background: "#f5f5f5",
            border: "1px solid #ccc",
            borderRight: "none",
            borderRadius: "8px 0 0 8px",
          }}
        >
          @
        </span>

        <input
          placeholder="Xアカウント（任意）"
          value={sns}
          maxLength={15}
          onChange={(e) =>
            setSns(e.target.value.replace(/^@+/, ""))
          }
          style={{
            ...inputStyle,
            borderRadius: "0 8px 8px 0",
          }}
        />
      </div>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={inputStyle}
      />
      <textarea
        placeholder="出来事・メモ"
        maxLength={300}
        value={event}
        onChange={(e) => setEvent(e.target.value)}
        rows={4}
        style={inputStyle}
      />
      <input
        type="password"
        placeholder="削除用パスワード（5〜15文字）"
        minLength={5}
        maxLength={15}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <button type="submit" disabled={loading} style={buttonStyle}>
        {loading ? "投稿中..." : "カレンダーに記入する!!!"}
      </button>
    </form>
  );
}

function FavoriteSongForm({ onSubmitted }) {
  const [name, setName] = useState("");
  const [sns, setSns] = useState("");
  const [song, setSong] = useState("");
  const [reason, setReason] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const sortedSongs = allSongs;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!song) return alert("好きな曲を選択してください！");
    if (!reason.trim()) return alert("好きな理由を書いてください！");
    if (!password.trim()) return alert("削除用パスワードを入力してください！");

    if (password.length < 5 || password.length > 15) {
      return alert("パスワードは5〜15文字で入力してください");
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "favoriteSongs"), {
        name,
        sns,
        song,
        reason,
        lyrics,
        random: Math.random(),
        lyricRandom: lyrics.trim() ? Math.random() : null,
        password: await bcrypt.hash(password, 10),
        createdAt: serverTimestamp(),
      });

      const isFirstPost = await incrementCount("songCounts", song);
      await saveContributor(name, sns);

      onSubmitted({
        label: `好きな曲: ${song}`,
        content: reason,
        isFirstPost,
        firstPostTarget: song,
      });

      setName("");
      setSns("");
      setSong("");
      setReason("");
      setLyrics("");
      setPassword("");

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
        maxLength={15}
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />

      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            padding: "10px",
            background: "#f5f5f5",
            border: "1px solid #ccc",
            borderRight: "none",
            borderRadius: "8px 0 0 8px",
          }}
        >
          @
        </span>

        <input
          placeholder="Xアカウント（任意）"
          value={sns}
          maxLength={15}
          onChange={(e) =>
            setSns(e.target.value.replace(/^@+/, ""))
          }
          style={{
            ...inputStyle,
            borderRadius: "0 8px 8px 0",
          }}
        />
      </div>

      {/* 曲選択 */}
      <select
        value={song}
        onChange={(e) => setSong(e.target.value)}
        style={inputStyle}
      >
        <option value="">好きな曲を選択</option>

        {sortedSongs.map((s) => (
          <option key={s.title} value={s.title}>
            {s.title}
          </option>
        ))}
      </select>

      <textarea
        placeholder="好きな理由"
        maxLength={300}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
        style={inputStyle}
      />

      <textarea
        placeholder="好きな歌詞（任意）"
        maxLength={30}
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        rows={3}
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="削除用パスワード（5〜15文字）"
        minLength={5}
        maxLength={15}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />

      <button
        type="submit"
        disabled={loading}
        style={buttonStyle}
      >
        {loading ? "投稿中..." : "みんなのうた を投稿する!!!"}
      </button>
    </form>
  );
}

// --------------------------------------------------
// 共通スタイル
// --------------------------------------------------
const postPageStyle = {
  width: "100%",
  minHeight: "100vh",
  boxSizing: "border-box",
  padding: "72px 16px 30px",
  background: "#fff7f7",
  textAlign: "center",
  fontFamily: "'Yomogi', cursive",
};

const formTabsStyle = {
  display: "flex",
  gap: "10px",
  maxWidth: "760px",
  margin: "0 auto",
  padding: "8px 4px 12px",
  overflowX: "auto",
};

const formTabStyle = {
  minWidth: "148px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "3px",
  padding: "12px 10px",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontFamily: "'Yomogi', cursive",
  transition: "transform 0.2s, box-shadow 0.2s, background 0.2s",
};

const formStyle = {
  width: "100%",
  maxWidth: "340px",
  minHeight: "420px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: "10px",
  background: "#fffdf2",
  padding: "24px 20px",
  borderRadius: "12px",
  boxShadow: "0 8px 18px rgba(0,0,0,0.12)",
  textAlign: "left",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #e7caca",
  background: "#fff",
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

const homeButtonStyle = {
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

const modalBackdropStyle = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  background: "rgba(47, 93, 80, 0.45)",
  zIndex: 2000,
};

const completionCardStyle = {
  position: "relative",
  width: "100%",
  maxWidth: "380px",
  boxSizing: "border-box",
  padding: "34px 24px 24px",
  borderRadius: "12px",
  background: "#fffdf2",
  boxShadow: "0 12px 28px rgba(0,0,0,0.2)",
  textAlign: "center",
  transform: "rotate(-1deg)",
};

const tapeStyle = {
  position: "absolute",
  top: "-10px",
  left: "50%",
  width: "88px",
  height: "22px",
  borderRadius: "3px",
  background: "rgba(255, 237, 160, 0.78)",
  transform: "translateX(-50%) rotate(2deg)",
};
