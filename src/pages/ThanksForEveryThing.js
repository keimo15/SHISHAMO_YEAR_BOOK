import React, { useEffect, useState } from "react";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";

const PAGE_SIZE = 20;

export default function CreditsPage() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [totalMembers, setTotalMembers] = useState(null);
  const [lastMember, setLastMember] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchMembers = async (cursor = null) => {
    if (loading) return;

    setLoading(true);
    try {
      const contributorsRef = collection(db, "contributors");
      const membersQuery = cursor
        ? query(
            contributorsRef,
            orderBy("createdAt", "asc"),
            startAfter(cursor),
            limit(PAGE_SIZE)
          )
        : query(contributorsRef, orderBy("createdAt", "asc"), limit(PAGE_SIZE));
      const snapshot = await getDocs(membersQuery);
      const nextMembers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
      }));

      setMembers((prev) => (cursor ? [...prev, ...nextMembers] : nextMembers));
      setLastMember(snapshot.docs.at(-1) || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    getCountFromServer(collection(db, "contributors"))
      .then((snapshot) => setTotalMembers(snapshot.data().count))
      .catch((err) => console.error(err));
    // Only fetch the first page when this screen opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      style={{
        minHeight: "100vh",
        boxSizing: "border-box",
        background:
          "radial-gradient(circle at 18% 12%, rgba(255,255,255,0.72), transparent 24%), repeating-linear-gradient(0deg, rgba(177,142,96,0.045) 0 1px, transparent 1px 24px), #f5ead5",
        padding: "40px 20px 80px",
        fontFamily: "'Yomogi', cursive",
      }}
    >
      {/* 🔸 ヘッダー */}
      <div
        style={{
          position: "fixed",
          top: 10,
          left: 10,
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => navigate("/home0")}
          style={buttonStyle}
        >
          もくじ
        </button>
      </div>

      <motion.main
        initial={{ opacity: 0, y: 18, rotate: -0.4 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          maxWidth: "900px",
          margin: "36px auto 0",
          padding: "42px clamp(18px, 5vw, 48px) 46px",
          border: "1px solid rgba(174,139,91,0.28)",
          borderRadius: "4px",
          background:
            "repeating-linear-gradient(0deg, transparent 0 25px, rgba(130,170,190,0.08) 25px 26px), #fffdf4",
          boxShadow:
            "6px 8px 0 rgba(145,105,64,0.14), 0 16px 34px rgba(105,75,45,0.14)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-15px",
            left: "50%",
            width: "110px",
            height: "30px",
            transform: "translateX(-50%) rotate(-2deg)",
            background: "rgba(244,215,142,0.64)",
            boxShadow: "0 1px 2px rgba(125,90,47,0.1)",
          }}
        />

        <header style={{ textAlign: "center", marginBottom: "34px" }}>
          <p
            style={{
              margin: 0,
              color: "#c66a68",
              fontFamily: "sans-serif",
              fontSize: "0.64rem",
              fontWeight: "bold",
              letterSpacing: "0.22em",
            }}
          >
            SPECIAL THANKS
          </p>

          <h1
            style={{
              margin: "6px 0 2px",
              color: "#d66565",
              fontSize: "clamp(2.3rem, 8vw, 3.3rem)",
              letterSpacing: "0.08em",
            }}
          >
            制作協力
          </h1>

          <p
            style={{
              margin: "8px 0 0",
              color: "#9a8069",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            総勢 {totalMembers ?? "..."}名!!!
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          {members.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12, rotate: i % 2 === 0 ? -1 : 1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: i * 0.025, duration: 0.3 }}
              style={{
                position: "relative",
                minWidth: 0,
                padding: "14px 12px",
                border: "1px solid rgba(177,139,91,0.16)",
                borderRadius: "3px",
                background: "rgba(255,255,255,0.82)",
                boxShadow: "2px 3px 0 rgba(137,102,64,0.08)",
              }}
            >
              <div
                style={{
                  color: "#d66565",
                  fontSize: "1.08rem",
                  fontWeight: "bold",
                  lineHeight: "1.55",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {m.name}
              </div>

              {m.sns && (
                <div
                  style={{
                    marginTop: "3px",
                    color: "#79604d",
                    fontSize: "0.86rem",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  @{m.sns.replace("@", "")}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {hasMore && (
          <div style={{ marginTop: "26px", textAlign: "center" }}>
            <button
              onClick={() => fetchMembers(lastMember)}
              disabled={loading}
              style={{
                ...buttonStyle,
                padding: "10px 20px",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "読み込み中..." : "もっと見る"}
            </button>
          </div>
        )}
      </motion.main>
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
