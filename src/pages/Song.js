import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  deleteDoc,
  doc,
  where,
  updateDoc,
  increment,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { albums } from "../data/songs";
import bcrypt from "bcryptjs";
import { Trash2 } from "lucide-react";

const YELLOW_SONGS = new Set(["はなればなれでも", "マフラー"]);
const BLUE_SONGS = new Set([
  "僕に彼女ができたんだ",
  "僕、実は",
  "ミルクコーヒー",
  "絆創膏",
]);
const RANKING_ALBUM = {
  name: "RANKING",
  color: "#d6a94f",
};

const getActiveSongColor = (songTitle) => {
  if (YELLOW_SONGS.has(songTitle)) return "#f2c94c";
  if (BLUE_SONGS.has(songTitle)) return "#4d96ff";
  return "#ff7b7b";
};

export default function SongsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState("SHISHAMO");
  const [selectedSong, setSelectedSong] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [sortOrder, setSortOrder] = useState("new");
  const [songCounts, setSongCounts] = useState({});

  // 件数取得.
  useEffect(() => {
    const fetchCounts = async () => {
      const snapshot = await getDocs(
        collection(db, "songCounts")
      );

      const counts = {};

      snapshot.forEach((doc) => {
        counts[doc.id] = doc.data().count || 0;
      });

      setSongCounts(counts);
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    if (!selectedSong) {
      setPosts([]);
      return;
    }

    const fetchSongPosts = async () => {
      const q = query(
        collection(db, "favoriteSongs"),
        where("song", "==", selectedSong)
      );

      const snapshot = await getDocs(q);

      setPosts(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    };

    fetchSongPosts();
  }, [selectedSong]);

  // 🔸 選択中アルバム
  const currentAlbum = useMemo(() => {
    return albums.find((a) => a.name === selectedAlbum);
  }, [selectedAlbum]);
  const rankedSongs = useMemo(() => {
    return Object.entries(songCounts)
      .filter(([, count]) => count > 0)
      .sort(([, aCount], [, bCount]) => bCount - aCount)
      .slice(0, 10)
      .map(([title, count], index) => ({
        rank: index + 1,
        title,
        count,
      }));
  }, [songCounts]);
  const shelfAlbums = [...albums, RANKING_ALBUM];

  const albumHeights = useMemo(() => {
    const minHeight = 120;
    const maxHeight = 180;
    const totals = albums.map((album) =>
      album.songs.reduce(
        (total, song) => total + (songCounts[song.title] || 0),
        0
      )
    );
    const largestTotal = Math.max(...totals, 0);

    return new Map(
      albums.map((album, index) => {
        const ratio = largestTotal === 0 ? 0 : totals[index] / largestTotal;
        return [album.name, minHeight + ratio * (maxHeight - minHeight)];
      })
    );
  }, [songCounts]);
  const totalCount = Object.values(songCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // 🔸 曲選択時の投稿
  const filteredPosts = useMemo(() => {
    const sorted = [...posts];

    return sortOrder === "new"
      ? sorted.reverse()
      : sorted;
  }, [posts, sortOrder]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);

  useEffect(() => {
    if (!selectedSong) return;

    const timer = setTimeout(() => {
      const el = document.getElementById("posts-title");

      if (!el) return;

      const y =
        el.getBoundingClientRect().top +
        window.scrollY -
        300;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedSong]);

  const handleDelete = async (post) => {
    const input = prompt("削除用パスワードを入力してください:");
    if (!input) return;

    const isMatch = await bcrypt.compare(
      input,
      post.password
    );

    if (!isMatch) {
      alert("パスワードが違います。");
      return;
    }

    await deleteDoc(
      doc(db, "favoriteSongs", post.id)
    );

    await updateDoc(
      doc(db, "songCounts", post.song),
      {
        count: increment(-1),
      }
    );

    setSongCounts(prev => ({
      ...prev,
      [post.song]: (prev[post.song] || 0) - 1,
    }));

    setPosts((prev) =>
      prev.filter((p) => p.id !== post.id)
    );

    alert("投稿を削除しました。");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.46 }}
      style={{
        minHeight: "100vh",
        background:
          "repeating-linear-gradient(0deg, rgba(130,170,190,0.06) 0 1px, transparent 1px 25px), #fffaf0",
        fontFamily: "'Yomogi', cursive",
        paddingBottom: "80px",
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

      {/* 🔸 タイトル */}
      <div
        style={{
          padding: "42px 24px 18px",
          textAlign: "center",
        }}
      >
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
        SHAMO SUPPORTERS SONG BOOK
      </p>
      <h1
        style={{
          fontSize: "clamp(2rem, 8vw, 3rem)",
          margin: "5px 0 2px",
          color: "#d66565",
          whiteSpace: "nowrap",
        }}
      >
        みんなのうた!!!
      </h1>
      <p style={{ margin: 0, color: "#9a8069", fontSize: "0.86rem" }}>
        {totalCount}件の好きな曲が集まっています
      </p>
      </div>

      {/* 🔸 本棚 */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        style={{
          position: selectedSong ? "relative" : "sticky",
          top: 0,
          zIndex: 20,
          padding: "8px 0 24px",
          background: "rgba(255, 250, 240, 0.94)",
          boxShadow: "0 7px 14px rgba(126, 91, 55, 0.08)",
        }}
      >
        <div
          style={{
            overflowX: "auto",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: "14px",
              minWidth: "max-content",
              padding: "14px 12px 20px",
              borderBottom: "14px solid #9b704f",
              borderRadius: "5px",
              background: "rgba(255, 253, 246, 0.8)",
              boxShadow: "inset 0 -4px 0 rgba(96, 62, 40, 0.12)",
            }}
          >
            {shelfAlbums.map((album, i) => {
              const active = selectedAlbum === album.name;
              const isRanking = album.name === RANKING_ALBUM.name;

              return (
                <motion.div
                  key={album.name}
                  initial={{
                    opacity: 0,
                    x: 90,
                    y: -24,
                    rotate: 10,
                    scale: 0.88,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                    rotate: 0,
                    scale: 1,
                  }}
                  whileHover={{
                    y: -8,
                    rotate: -2,
                    rotateY: -10,
                    x: -4,
                  }}
                  whileTap={{
                    scale: 0.96,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 14,
                    delay: i * 0.09,
                  }}
                  onClick={() => {
                    setSelectedAlbum(album.name);
                    setSelectedSong(null);
                  }}
                  style={{
                    width: "90px",
                    height: `${isRanking ? 170 : albumHeights.get(album.name)}px`,
                    background: album.color,
                    borderRadius: "10px 10px 4px 4px",
                    cursor: "pointer",

                    transformStyle: "preserve-3d",
                    transformPerspective: "1000px",

                    boxShadow: active
                      ? "0 10px 20px rgba(0,0,0,0.2)"
                      : "0 4px 10px rgba(0,0,0,0.12)",
                    border: active
                      ? "4px solid #444"
                      : "2px solid rgba(255,255,255,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px",
                    position: "relative",
                    transition: "0.2s",
                    flexShrink: 0,
                  }}
                >
                  {/* 背表紙線 */}
                  <div
                    style={{
                      position: "absolute",
                      left: "8px",
                      top: 0,
                      width: "6px",
                      height: "100%",
                      background: "rgba(255,255,255,0.35)",
                    }}
                  />

                  <div
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      letterSpacing: "2px",
                      textShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    }}
                  >
                    {isRanking ? "ランキング" : album.name}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 🔸 曲一覧 */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "40px auto 20px",
          padding: "24px 22px",
          border: "1px solid rgba(174,139,91,0.22)",
          borderRadius: "4px",
          background: "rgba(255,253,244,0.82)",
          boxShadow: "3px 4px 0 rgba(145,105,64,0.1)",
        }}
      >
        <p
          style={{
            margin: "0 0 3px",
            color: "#c66a68",
            fontFamily: "sans-serif",
            fontSize: "0.6rem",
            fontWeight: "bold",
            letterSpacing: "0.18em",
          }}
        >
          {selectedAlbum === RANKING_ALBUM.name ? "TOP 10" : "TRACK LIST"}
        </p>
        <h2
          style={{
            fontSize: "2rem",
            margin: "0 0 20px",
            color: "#6a5140",
          }}
        >
          {selectedAlbum}
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          {selectedAlbum === RANKING_ALBUM.name ? (
            rankedSongs.length === 0 ? (
              <p style={{ margin: 0, color: "#9a8069" }}>
                まだランキングに表示できる投稿がありません。
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: "12px",
                  width: "100%",
                }}
              >
                {rankedSongs.map((song) => (
                  <motion.button
                    key={song.title}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedSong(song.title);
                      setVisibleCount(10);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      border: "1px solid rgba(174,139,91,0.2)",
                      borderRadius: "4px",
                      padding: "12px",
                      background:
                        selectedSong === song.title ? "#fff2c7" : "#fffdf8",
                      color: "#604b3b",
                      cursor: "pointer",
                      boxShadow: "2px 3px 0 rgba(145,105,64,0.1)",
                      fontFamily: "'Yomogi', cursive",
                      textAlign: "left",
                    }}
                  >
                    <strong
                      style={{
                        minWidth: "2.3rem",
                        color: song.rank <= 3 ? "#d66565" : "#9a8069",
                        fontSize: "1.25rem",
                      }}
                    >
                      {song.rank}
                    </strong>
                    <span style={{ flex: 1, fontWeight: "bold" }}>
                      {song.title}
                    </span>
                    <span style={{ color: "#9a8069", fontSize: "0.86rem" }}>
                      {song.count}人
                    </span>
                  </motion.button>
                ))}
              </div>
            )
          ) : currentAlbum?.songs.map((song) => {
            const count = songCounts[song.title] || 0;

            const active = selectedSong === song.title;

            return (
              <motion.button
                key={song.title}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedSong(song.title);
                  setVisibleCount(10);
                }}
                style={{
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: "999px",
                  background: active ? getActiveSongColor(song.title) : "#fffdf8",
                  color: active ? "white" : "#444",
                  cursor: "pointer",
                  boxShadow: active
                    ? "0 4px 0 rgba(126, 76, 65, 0.16)"
                    : "0 2px 6px rgba(126, 91, 55, 0.1)",
                  fontFamily: "'Yomogi', cursive",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  transition: "0.2s",
                }}
              >
                🎵 {song.title}
                <span
                  style={{
                    marginLeft: "8px",
                    opacity: 0.7,
                    fontSize: "0.9rem",
                  }}
                >
                  {count}人
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 🔸 投稿カード */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "30px auto",
          padding: "0 20px",
        }}
      >
        <AnimatePresence>
          {selectedSong && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h3
                id="posts-title"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 24,
                  margin: "0 -8px 18px",
                  padding: "10px 8px",
                  background: "rgba(255, 250, 240, 0.96)",
                  boxShadow: "0 5px 8px rgba(126, 91, 55, 0.08)",
                  fontSize: "1.8rem",
                  color: "#6a5140",
                }}
              >
                「{selectedSong}」の投稿
              </h3>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "24px",
                }}
              >
                <button
                  onClick={() => setSortOrder("new")}
                  style={{
                    border: "none",
                    borderRadius: "999px",
                    padding: "8px 14px",
                    cursor: "pointer",
                    background:
                      sortOrder === "new" ? "#ff7b7b" : "#eee",
                    color:
                      sortOrder === "new" ? "#fff" : "#555",
                    fontFamily: "'Yomogi', cursive",
                  }}
                >
                  新しい順
                </button>

                <button
                  onClick={() => setSortOrder("old")}
                  style={{
                    border: "none",
                    borderRadius: "999px",
                    padding: "8px 14px",
                    cursor: "pointer",
                    background:
                      sortOrder === "old" ? "#ff7b7b" : "#eee",
                    color:
                      sortOrder === "old" ? "#fff" : "#555",
                    fontFamily: "'Yomogi', cursive",
                  }}
                >
                  古い順
                </button>
              </div>

              {filteredPosts.length === 0 ? (
                <div
                  style={{
                    background: "white",
                    padding: "30px",
                    borderRadius: "20px",
                    textAlign: "center",
                    color: "#999",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  まだ投稿がありません 📮
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {visiblePosts.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: {
                          delay: i * 0.05,
                        },
                      }}
                      style={{
                        position: "relative",
                        background: "#fffdf4",
                        borderRadius: "4px",
                        padding: "22px",
                        boxShadow: "3px 4px 0 rgba(145,105,64,0.1)",
                        border: "1px solid rgba(174,139,91,0.2)",
                      }}
                    >
                      <div
                        onClick={() => handleDelete(post)}
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          cursor: "pointer",
                          opacity: 0.7,
                        }}
                      >
                        <Trash2 size={18} />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "16px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: "bold",
                              color: "#e46c6c",
                            }}
                          >
                            {post.name || "匿名のしゃもサポ"}
                            {post.sns && <span> @{post.sns}</span>}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          lineHeight: "1.9",
                          color: "#555",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: "bold", color: "#4f4035" }}>
                            {post.reason}
                          </div>

                          {post.lyrics && (
                            <>
                              <strong style={{ color: "#c66a68" }}>好きな歌詞</strong>
                              <div
                                style={{
                                  marginTop: "4px",
                                  padding: "8px 10px",
                                  borderLeft: "3px solid #e6b5a5",
                                  background: "rgba(247, 231, 210, 0.45)",
                                  color: "#79604d",
                                }}
                              >
                                「{post.lyrics}」
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {filteredPosts.length > visibleCount && (
        <div
          style={{
            textAlign: "center",
            marginTop: "30px",
          }}
        >
          <button
            onClick={() => setVisibleCount((prev) => prev + 10)}
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
