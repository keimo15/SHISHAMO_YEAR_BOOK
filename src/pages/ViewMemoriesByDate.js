import React, { useEffect, useState, useRef } from "react";
import bcrypt from "bcryptjs";
import { deleteDoc, doc, increment, setDoc } from "firebase/firestore";
import { Trash2 } from "lucide-react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import EmptyNote from "../components/EmptyNote";
import LikeButton from "../components/LikeButton";

export default function ViewMemoriesByDate() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [expandedMonth, setExpandedMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [isDateListOpen, setIsDateListOpen] = useState(true);

  const colors = ["#ff7b7b", "#ffa74d", "#ffdc4d", "#7bffb5", "#7bafff", "#da7bff", "#ff7bd8"];

  const todayRef = useRef(null);

  const [visibleCount, setVisibleCount] = useState(10);

  const [dateCounts, setDateCounts] = useState({});

  // Firestoreから全データ取得
    useEffect(() => {
      const fetchCounts = async () => {
        const snapshot = await getDocs(
          collection(db, "dateCounts")
        );

        const counts = {};

        snapshot.forEach((doc) => {
          const monthDay = doc.id.slice(-5);
          counts[monthDay] = (counts[monthDay] || 0) + (doc.data().count || 0);
        });

        setDateCounts(counts);
      };

      fetchCounts();
    }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchMemoriesByDate = async () => {
      setLoading(true);

      const snap = await getDocs(
        query(
          collection(db, "memoriesByDate"),
          where("monthDay", "==", selectedDate)
        )
      );

      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      const shuffled = [...list].sort(() => Math.random() - 0.5);

      setMemories(shuffled);
      setVisibleCount(10);
      setLoading(false);
    };

    fetchMemoriesByDate();
  }, [selectedDate]);

  // 1年分の日付リスト生成（うるう年対応簡略）
  const months = [31,28,31,30,31,30,31,31,30,31,30,31];
  const dateGroups = months.map((daysInMonth, monthIndex) => {
    const month = String(monthIndex + 1).padStart(2, "0");

    return {
      month,
      dates: Array.from(
        { length: daysInMonth },
        (_, dayIndex) => `${month}-${String(dayIndex + 1).padStart(2, "0")}`
      ),
    };
  });

  const today = new Date();
  const todayMD = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    setSelectedDate(todayMD);
  }, [todayMD]);

  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  useEffect(() => {
      // スマホサイズの取得.
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);

    }, []);

  const handleDelete = async (mem) => {
    const input = prompt("削除用パスワードを入力してください:");
    if (!input) return;

    const isMatch = await bcrypt.compare(input, mem.password);

    if (!isMatch) {
      alert("パスワードが違います。");
      return;
    }

    await deleteDoc(doc(db, "memoriesByDate", mem.id));
    await setDoc(
      doc(db, "dateCounts", mem.date),
      { count: increment(-1) },
      { merge: true }
    );

    setMemories((prev) => prev.filter((m) => m.id !== mem.id));

    setDateCounts((prev) => ({
      ...prev,
      [selectedDate]: Math.max((prev[selectedDate] || 1) - 1, 0),
    }));

    alert("投稿を削除しました。");
  };

  const handleLikeChange = (memoryId, likes) => {
    setMemories((prev) =>
      prev.map((mem) => (mem.id === memoryId ? { ...mem, likes } : mem))
    );
  };

  const visibleMemories = memories.slice(
    0,
    visibleCount
  );
  const goToPost = () => {
    const dateForPost = selectedDate
      ? `${new Date().getFullYear()}-${selectedDate}`
      : "";

    navigate("/post", {
      state: {
        postPreset: {
          form: "date",
          ...(dateForPost ? { date: dateForPost } : {}),
        },
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.42 }}
      style={{
        display: "flex",
        height: "100vh",
        background: "#fffef6",
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
        <button onClick={() => navigate("/home0")} style={buttonStyle}>
          もくじ
        </button>
      </div>
      <button
        onClick={goToPost}
        style={{
          ...buttonStyle,
          position: "fixed",
          top: 10,
          right: 10,
          zIndex: 1000,
          background: "#e0ad45",
        }}
      >
        投稿する
      </button>

      {/* 左側：日付スクロールリスト */}
      <motion.div
        initial={{ x: -34 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: isDateListOpen ? (isMobile ? "38%" : "210px") : "34px",
          overflowY: "scroll",
          overflowX: "hidden",
          borderRight: "7px solid #e4c9a4",
          padding: isDateListOpen
            ? isMobile
              ? "96px 5px 16px 8px"
              : "100px 8px 18px 12px"
            : "96px 0 16px",
          background: "#f5ead5",
          boxShadow: "inset -4px 0 0 rgba(168, 128, 81, 0.12)",
          position: "relative",
          flexShrink: 0,
          transition: "width 240ms ease, padding 240ms ease",
        }}
      >
        <button
          type="button"
          onClick={() => setIsDateListOpen((open) => !open)}
          aria-label={isDateListOpen ? "日付一覧を閉じる" : "日付一覧を開く"}
          title={isDateListOpen ? "日付一覧を閉じる" : "日付一覧を開く"}
          style={{
            position: "sticky",
            top: "50%",
            marginLeft: "auto",
            marginRight: "1px",
            width: "26px",
            height: "26px",
            border: "none",
            borderRadius: "999px",
            background: "#d87575",
            color: "#fffdf6",
            boxShadow: "1px 2px 0 rgba(146, 91, 65, 0.16)",
            cursor: "pointer",
            fontFamily: "'Yomogi', cursive",
            fontSize: "1.15rem",
            fontWeight: "bold",
            lineHeight: 1,
            transform: "translateY(-50%)",
            zIndex: 2,
            display: "block",
          }}
        >
          {isDateListOpen ? "‹" : "›"}
        </button>
        {!isDateListOpen && (
          <span
            style={{
              display: "block",
              margin: "8px auto 0",
              color: "#c76767",
              fontFamily: "'Yomogi', cursive",
              fontSize: "0.78rem",
              fontWeight: "bold",
              letterSpacing: "0.16em",
              writingMode: "vertical-rl",
            }}
          >
            日付
          </span>
        )}
        {isDateListOpen && (
          <>
        <h2
          style={{
            margin: "0 0 10px 4px",
            color: "#b95d5d",
            fontSize: isMobile ? "0.76rem" : "0.9rem",
            letterSpacing: "0.12em",
          }}
        >
          日付のしおり
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          {dateGroups.map(({ month, dates }) => {
            const isExpanded = expandedMonth === month;
            const monthCount = dates.reduce(
              (total, md) => total + (dateCounts[md] || 0),
              0
            );

            return (
              <div key={month}>
                <button
                  onClick={() => setExpandedMonth(month)}
                  style={{
                    width: "100%",
                    border: isExpanded
                      ? "1px solid #c99562"
                      : "1px solid rgba(177, 139, 91, 0.2)",
                    padding: isMobile ? "8px 6px" : "8px 10px",
                    borderRadius: "7px 2px 2px 7px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "4px",
                    background: isExpanded ? "#e7c18e" : "#fffaf0",
                    color: "#6d5946",
                    fontFamily: "'Yomogi', cursive",
                    fontSize: isMobile ? "0.82rem" : "0.92rem",
                    fontWeight: "bold",
                    boxShadow: "1px 2px 0 rgba(132, 105, 70, 0.08)",
                  }}
                >
                  <span>{parseInt(month)}月</span>
                  <span style={{ fontSize: "0.72rem", opacity: 0.78 }}>
                    {monthCount > 0 ? `${monthCount}件` : ""}
                    {isExpanded ? " ▲" : " ▼"}
                  </span>
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      padding: "7px 0 2px 7px",
                    }}
                  >
                    {dates.map((md) => {
                      const count = dateCounts[md] || 0;
                      const isSelected = selectedDate === md;

                      return (
              <button
                ref={md === todayMD ? todayRef : null}
                key={md}
                onClick={() => {
                  setSelectedDate(md);
                  setVisibleCount(10);
                }}
                style={{
                  width: "100%",
                  border: isSelected
                    ? "1px solid #c95353"
                    : "1px solid rgba(177, 139, 91, 0.2)",
                  padding: isMobile ? "7px 6px" : "7px 10px",
                  borderRadius: "7px 2px 2px 7px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "4px",
                  color: isSelected ? "#fffdf8" : "#6d5946",
                  fontSize: isMobile ? "0.78rem" : "0.9rem",
                  fontWeight: isSelected || count > 0 ? "bold" : "normal",
                  background: isSelected
                    ? "#e46c6c"
                    : count > 0
                    ? "#fffaf0"
                    : "rgba(255, 253, 246, 0.5)",
                  boxShadow: isSelected
                    ? "2px 3px 0 rgba(150, 80, 65, 0.18)"
                    : "1px 2px 0 rgba(132, 105, 70, 0.08)",
                  transform: isSelected ? "translateX(4px)" : "translateX(0)",
                  transition: "transform 180ms ease, background 180ms ease",
                }}
              >
                <span>
                  {parseInt(md.slice(0, 2))}月
                  {parseInt(md.slice(3, 5))}日
                </span>
                {count > 0 && (
                  <span
                    title={`${count}件の投稿`}
                    style={{
                      width: isMobile ? "6px" : "7px",
                      height: isMobile ? "6px" : "7px",
                      flexShrink: 0,
                      borderRadius: "50%",
                      background: isSelected ? "#fffdf8" : "#e46c6c",
                    }}
                  />
                )}
              </button>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
          </>
        )}
      </motion.div>

      {/* 右側：選択された日の出来事 */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, delay: 0.16 }}
        style={{ flex: 1, padding: "24px", overflowY: "scroll" }}
      >
        {loading ? (
          <p>読み込み中...</p>
        ) : selectedDate ? (
          <>
            <h2
              style={{
                position: "sticky",
                top: 0,
                zIndex: 2,
                margin: "-4px -4px 16px",
                padding: "4px 4px 10px",
                background: "rgba(255, 254, 246, 0.94)",
                boxShadow: "0 5px 8px rgba(132, 105, 70, 0.06)",
                fontSize: "1.5rem",
              }}
            >
              {parseInt(selectedDate.slice(0,2))}月{parseInt(selectedDate.slice(3,5))}日!!!
            </h2>
            {memories.length === 0 ? (
              <EmptyNote>まだ投稿はありません。</EmptyNote>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {visibleMemories.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      position: "relative",
                      background: "rgba(255,253,244,0.92)",
                      border: "1px solid rgba(177,139,91,0.18)",
                      borderRadius: "3px",
                      padding: "34px 44px 48px 16px",
                      boxShadow: "3px 4px 0 rgba(137,102,64,0.1)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "-8px",
                        left: "50%",
                        width: "62px",
                        height: "17px",
                        background: "rgba(244,215,142,0.62)",
                        transform: "translateX(-50%) rotate(-2deg)",
                      }}
                    />
                    <div
                      onClick={() => handleDelete(m)}
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        cursor: "pointer",
                        opacity: 0.7,
                      }}
                    >
                      <Trash2 size={18} />
                    </div>

                    <LikeButton
                      collectionName="memoriesByDate"
                      postId={m.id}
                      likes={m.likes || 0}
                      onChange={(likes) => handleLikeChange(m.id, likes)}
                      style={{
                        position: "absolute",
                        right: 10,
                        bottom: 10,
                        fontSize: "0.82rem",
                      }}
                    />

                    <p
                      style={{
                        marginBottom: "6px",
                        color: colors[Math.floor(Math.random() * colors.length)],
                        fontFamily: "'Yomogi', cursive",
                        fontWeight: "600",
                        lineHeight: "1.5",
                        fontSize: "1.05rem",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {m.event}
                    </p>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "#555",
                        fontFamily: "'Yomogi', cursive",
                      }}
                    >
                      {m.name && <span>{m.name}　</span>}
                      {m.sns && <span>@{m.sns}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {memories.length > visibleCount && (
            <div
              style={{
                textAlign: "center",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() =>
                  setVisibleCount((prev) => prev + 10)
                }
                style={{
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "999px",
                  background: "#ff7b7b",
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "'Yomogi', cursive",
                  fontWeight: "bold",
                }}
              >
                もっと見る
              </button>
            </div>
          )}
          </>
        ) : (
          <EmptyNote>左の日付から選択してください。</EmptyNote>
        )}
      </motion.div>
    </motion.div>
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
