import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function ViewMemoriesByDate() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [memories, setMemories] = useState([]);
  const [allMemories, setAllMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firestoreから全データ取得
  useEffect(() => {
    const fetchMemories = async () => {
      const q = query(collection(db, "memoriesByDate"), orderBy("date", "asc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        monthDay: d.data().date.slice(5), // 例: "10-05"
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

  // 1年分の日付リスト生成（うるう年対応簡略）
  const dateList = [];
  const months = [31,28,31,30,31,30,31,31,30,31,30,31];
  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= months[m-1]; d++) {
      dateList.push(`${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#fffef6",
        fontFamily: "'Yomogi', cursive",
      }}
    >
      {/* 左側：日付スクロールリスト */}
      <div
        style={{
          width: "200px",
          overflowY: "scroll",
          borderRight: "2px solid #eee",
          padding: "16px",
          background: "#faf9f5",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", marginBottom: "12px" }}>📅 日付を選択</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {dateList.map((md) => (
            <button
              key={md}
              onClick={() => setSelectedDate(md)}
              style={{
                border: "none",
                padding: "6px 10px",
                borderRadius: "6px",
                cursor: "pointer",
                textAlign: "left",
                background: selectedDate === md ? "#ffdca8" : "transparent",
              }}
            >
              {parseInt(md.slice(0,2))}月{parseInt(md.slice(3,5))}日
            </button>
          ))}
        </div>
      </div>

      {/* 右側：選択された日の出来事 */}
      <div style={{ flex: 1, padding: "24px", overflowY: "scroll" }}>
        {loading ? (
          <p>読み込み中...</p>
        ) : selectedDate ? (
          <>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "16px" }}>
              🌸 {parseInt(selectedDate.slice(0,2))}月{parseInt(selectedDate.slice(3,5))}日の思い出
            </h2>
            {memories.length === 0 ? (
              <p style={{ color: "#888" }}>まだ投稿はありません。</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {memories.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      background: "rgba(255,255,255,0.9)",
                      borderRadius: "10px",
                      padding: "16px",
                      boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    <p style={{ marginBottom: "6px" }}>{m.event}</p>
                    <div style={{ fontSize: "0.9rem", color: "#555" }}>
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
