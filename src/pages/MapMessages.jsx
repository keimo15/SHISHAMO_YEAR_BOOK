// src/pages/MapMessages.js
import React, { useState, useEffect } from 'react';
import bcrypt from "bcryptjs";
import { deleteDoc, doc, updateDoc, increment, where,} from "firebase/firestore";
import { Trash2 } from "lucide-react";
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import JapanMap from '../assets/JapanMap'; // JSX化した日本地図をインポート
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./MapMessages.css";

export default function JapanMapFullScreen() {
  const navigate = useNavigate();
  const [selectedPref, setSelectedPref] = useState(null);
  const [memories, setMemories] = useState([]);
  const isMobile = window.innerWidth <= 768;
  const [showMemory, setShowMemory] = useState(true);
  const [showSeichi, setShowSeichi] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);
  const [prefectureCounts, setPrefectureCounts] = useState({});

  useEffect(() => {
    const fetchCounts = async () => {
      const snapshot = await getDocs(
        collection(db, "prefectureCounts")
      );

      const counts = {};

      snapshot.forEach((doc) => {
        counts[doc.id] = doc.data().count || 0;
      });

      setPrefectureCounts(counts);
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    if (!selectedPref) return;

    const fetchMemories = async () => {
      const q = query(
        collection(db, "memories"),
        where("prefecture", "==", selectedPref),
      );

      const snapshot = await getDocs(q);

      setMemories(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    };

    fetchMemories();
  }, [selectedPref]);

  // クリックされた県名を受け取ってstate更新
  const handlePrefClick = (prefName) => {
    setSelectedPref(prefName);
    setVisibleCount(10);
  };

  const handleDelete = async (mem) => {
    const input = prompt("削除用パスワードを入力してください:");
    if (!input) return;

    const isMatch = await bcrypt.compare(input, mem.password);

    if (!isMatch) {
      alert("パスワードが違います。");
      return;
    }

    await deleteDoc(doc(db, "memories", mem.id));

    setMemories((prev) => prev.filter((m) => m.id !== mem.id));

    await updateDoc(
      doc(db, "prefectureCounts", mem.prefecture),
      {
        count: increment(-1),
      }
    );

    alert("投稿を削除しました。");
  };

  // 選択中の県の思い出を抽出
  const filteredMemories =
    selectedPref && memories
      ? memories.filter((m) => {
          if (m.prefecture !== selectedPref) return false;

          if (m.category === "思い出" && !showMemory) return false;
          if (m.category === "聖地" && !showSeichi) return false;

          return true;
        })
      : [];

  const visibleMemories = filteredMemories.slice(
    0,
    visibleCount
  );
  const totalCount = Object.values(prefectureCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // ========================================
  // 4. JapanMap への反映（propsとして渡す）
  // ========================================
  // selectedPref と prefCounts を渡す
  return (
    <div onClick={() => setSelectedPref(null)} className="map-page">
      {/* 🔸 ヘッダー */}
      <div className="map-toolbar">
        <button onClick={() => navigate("/home0")} style={buttonStyle}>
          もくじ
        </button>

        <div className="map-filters" onClick={(e) => e.stopPropagation()}>
          <label className={`map-filter ${showMemory ? "is-active" : ""}`}>
            <input
              type="checkbox"
              checked={showMemory}
              onChange={() => setShowMemory(!showMemory)}
            />
            <span className="map-filter-dot memory" />
            思い出
          </label>

          <label className={`map-filter ${showSeichi ? "is-active" : ""}`}>
            <input
              type="checkbox"
              checked={showSeichi}
              onChange={() => setShowSeichi(!showSeichi)}
            />
            <span className="map-filter-dot seichi" />
            聖地
          </label>
        </div>
      </div>

      {/* 日本地図コンポーネント */}
      <motion.div
        initial={{ opacity: 0, scale: 0.82, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 95,
          damping: 16,
          duration: 0.8,
        }}
        className="map-stage"
        style={{ transformOrigin: "center center" }}
      >
        <div className="map-paper" onClick={(e) => e.stopPropagation()}>
          <div className="map-tape" />
          <header className="map-heading">
            <p className="map-kicker">SHAMO SUPPORTERS MAP</p>
            <h1>しゃもサポマップ</h1>
            <p>思い出のある都道府県を選んでください</p>
          </header>

          <JapanMap
            selectedPref={selectedPref}
            prefCounts={prefectureCounts}
            onPrefClick={handlePrefClick}
          />

          <div className="map-legend">
            <span><i className="legend-swatch empty" />まだ投稿なし</span>
            <span><i className="legend-swatch posted" />投稿あり</span>
            <strong>{totalCount}件の思い出</strong>
          </div>
        </div>
      </motion.div>

      {/* 選択中の県の思い出リスト */}
      <AnimatePresence>
      {selectedPref && (
        <motion.div
          key={selectedPref}
          initial={{ opacity: 0, x: isMobile ? 0 : 40, y: isMobile ? 16 : 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: isMobile ? 0 : 30 }}
          transition={{ duration: 0.28 }}
          onClick={(e) => e.stopPropagation()}
          className="map-memory-panel"
        >
          <div className="map-panel-tape" />
          <button
            className="map-panel-close"
            onClick={() => setSelectedPref(null)}
            aria-label="思い出一覧を閉じる"
          >
            ×
          </button>
          <p className="map-panel-kicker">TRAVEL NOTES</p>
          <h3>{selectedPref}の思い出</h3>
          <p className="map-panel-count">{filteredMemories.length}件の投稿</p>
          {filteredMemories.length === 0 ? (
            <p className="map-empty-message">まだ思い出はありません。</p>
          ) : (
            visibleMemories.map((mem) => (
          <div
            key={mem.id}
            className="map-memory-card"
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(mem);
              }}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                cursor: "pointer",
                opacity: 0.7,
              }}
            >
              <Trash2 size={16} />
            </div>

            {/* カテゴリ */}
            <div
              style={{
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "12px",
                background: mem.category === "聖地" ? "#ffd54f" : "#90caf9",
                color: "#333",
                fontSize: "0.75rem",
                marginBottom: "6px",
              }}
            >
              {mem.category}
            </div>

            {/* 住所 */}
            {mem.address && (
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "0.8rem",
                  color: "#666",
                }}
              >
                📍 {mem.address}
              </p>
            )}

            {/* 本文 */}
            <p
              style={{
                margin: 0,
                wordBreak: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
                color: "#4f4035",
                fontWeight: "bold",
              }}
            >
              {mem.message}
            </p>

            {/* 投稿者 */}
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "0.8rem",
                color: "#555",
                fontFamily: "'Yomogi', cursive",
              }}
            >
              {mem.name || "匿名のしゃもサポ"}
              {mem.sns && (
                <>
                  {" "}
                  @{mem.sns}
                </>
              )}
            </p>
          </div>
            ))
          )}

          {filteredMemories.length > visibleCount && (
            <div
              style={{
                textAlign: "center",
                marginTop: "12px",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVisibleCount((prev) => prev + 10);
                }}
                className="map-more-button"
              >
                もっと見る
              </button>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
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
