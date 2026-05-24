import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function ViewMemoriesByDate() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [memories, setMemories] = useState([]);
  const [allMemories, setAllMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const dateListRef = useRef(null);
  const todayRef = useRef(null);

  // 📅 今日の日付を初期値にセット
  useEffect(() => {
    const date = new Date();
    const todayMonth = String(date.getMonth() + 1).padStart(2, "0");
    const todayDay = String(date.getDate()).padStart(2, "0");
    setSelectedDate(`${todayMonth}-${todayDay}`);
  }, []);

  // Firestoreから全データ取得
  useEffect(() => {
    const fetchMemories = async () => {
      const q = query(collection(db, "memoriesByDate"), orderBy("date", "asc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        monthDay: d.data().date.slice(5),
      }));
      setAllMemories(list);
      setLoading(false);
    };
    fetchMemories();
  }, []);

  // 選択された日付のデータを絞り込み
  useEffect(() => {
    if (selectedDate) {
      setMemories(allMemories.filter((m) => m.monthDay === selectedDate));
    }
  }, [selectedDate, allMemories]);

  // 1年分の日付リスト
  const dateList = [];
  const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= months[m - 1]; d++) {
      dateList.push(`${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
  }

  // 🪄 スクロールを今日に合わせる
  useEffect(() => {
    if (todayRef.current && dateListRef.current) {
      const container = dateListRef.current;
      const todayButton = todayRef.current;
      const offset =
        todayButton.offsetTop - container.clientHeight / 2 + todayButton.clientHeight / 2;
      container.scrollTo({
        top: offset,
        behavior: "smooth",
      });
    }
  }, [loading]); // Firestore読み込み完了後に動作

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#fffef6",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "inset 0 0 6px rgba(0,0,0,0.1)",
      }}
    >
      {/* 左側：日付リスト */}
      <div
        ref={dateListRef}
        style={{
          width: "120px",
          overflowY: "auto",
          borderRight: "2px solid #eee",
          padding: "10px",
          background: "#faf9f5",
        }}
      >
        <h2 style={{ fontSize: "1rem", marginBottom: "8px" }}>📅 日付</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {dateList.map((md) => {
            const isToday = md === selectedDate;
            return (
                <button
                key={md}
                ref={isToday ? todayRef : null}
                onClick={() => setSelectedDate(md)}
                style={{
                    border: "none",
                    padding: "4px 6px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    textAlign: "left",
                    fontWeight: isToday ? "bold" : "normal",
                    background: isToday ? "#ffeb99" : "transparent", // 🌟 背景明るく
                    color: isToday ? "#5c3c00" : "#333", // 🌟 文字色濃く
                    boxShadow: isToday ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
                }}
                >
                {parseInt(md.slice(0, 2))}月{parseInt(md.slice(3, 5))}日
                </button>
            );
            })}
        </div>
      </div>

      {/* 右側：思い出 */}
      <div style={{ flex: 1, padding: "14px", overflowY: "auto" }}>
        {loading ? (
          <p>読み込み中...</p>
        ) : selectedDate ? (
          <>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "12px", color: "#333" }}>
              🌸 {parseInt(selectedDate.slice(0, 2))}月
              {parseInt(selectedDate.slice(3, 5))}日の思い出
            </h2>
            {memories.length === 0 ? (
              <p style={{ color: "#999" }}>まだ投稿はありません。</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {memories.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      background: "#fffaf0",
                      borderRadius: "10px",
                      padding: "12px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      border: "1px solid #f3e5c0",
                    }}
                  >
                    <p style={{ marginBottom: "4px", color: "#333" }}>{m.event}</p>
                    <div style={{ fontSize: "0.9rem", color: "#666" }}>
                      {m.name && <span>{m.name}　</span>}
                      {m.sns && <span>{m.sns}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p style={{ color: "#888" }}>左の日付から選択してください。</p>
        )}
      </div>
    </div>
  );
}
