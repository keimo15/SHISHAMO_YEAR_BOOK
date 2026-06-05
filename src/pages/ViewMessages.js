import React, { useCallback, useEffect, useState } from "react";
import bcrypt from "bcryptjs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  limit,
  query,
  orderBy,
  startAfter,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react"; // ← ゴミ箱アイコン
import EmptyNote from "../components/EmptyNote";
import LikeButton from "../components/LikeButton";

const MESSAGE_COLORS = ["#ff7b7b", "#ffa74d", "#c99500", "#45d88f", "#7bafff", "#da7bff", "#ff7bd8"];
const MOBILE_BREAKPOINT = 768;
const PAGE_SIZE = 20;
const getNoteSize = (text = "") => {
  const isLong = text.trim().length >= 90;

  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    return {
      width: isLong ? 164 : 114,
      height: isLong ? 72 : 76,
    };
  }

  return { width: isLong ? 560 : 300, height: 150 };
};
const getBoardSize = () =>
  window.innerWidth <= MOBILE_BREAKPOINT
    ? {
        width: window.innerWidth,
        height: 1700,
      }
    : {
        width: Math.max(window.innerWidth, 1200),
        height: Math.max(window.innerHeight, 4500),
      };
const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const getLooseGridStyles = (messages, { preserveOrder = false } = {}) => {
  const { width, height } = getBoardSize();
  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  const columns = 4;
  const sidePadding = isMobile ? 8 : 64;
  const topPadding = isMobile ? 190 : 180;
  const rowHeight = isMobile ? 130 : 390;
  const columnWidth = (width - sidePadding * 2) / columns;
  const horizontalOffset = isMobile ? -54 : -78;
  const longSource = messages.filter((msg) => msg.text.trim().length >= 90);
  const shortSource = messages.filter((msg) => msg.text.trim().length < 90);
  const longMessages = preserveOrder ? longSource : shuffle(longSource);
  const shortMessages = preserveOrder ? shortSource : shuffle(shortSource);
  const placements = [];
  const placementCountByColumn = [0, 0, 0, 0];

  longMessages.forEach((msg) => {
    const placementColumn =
      placementCountByColumn[1] <= placementCountByColumn[2] ? 1 : 2;
    placements.push({ msg, placementColumn });
    placementCountByColumn[placementColumn] += 1;
  });

  shortMessages.forEach((msg) => {
    const placementColumn =
      placementCountByColumn[0] <= placementCountByColumn[3] ? 0 : 3;
    placements.push({ msg, placementColumn });
    placementCountByColumn[placementColumn] += 1;
  });

  const nextRowByColumn = [0, 0, 0, 0];
  const compactPlacements = placements.map(({ msg, placementColumn }) => {
    const placementRow = nextRowByColumn[placementColumn];
    nextRowByColumn[placementColumn] += 1;

    return { msg, placementRow, placementColumn };
  });

  return compactPlacements.map(({ msg, placementRow, placementColumn }) => {
    const baseX =
      sidePadding + columnWidth * (placementColumn + 0.5) + horizontalOffset;
    const baseY = topPadding + rowHeight * placementRow;

    return {
      ...msg,
      x: baseX + (Math.random() * (isMobile ? 8 : 18) - (isMobile ? 4 : 9)),
      y: Math.min(baseY + (Math.random() * 18 - 9), height - 360),
      rotate: Math.random() * (isMobile ? 5 : 8) - (isMobile ? 2.5 : 4),
      zIndex: Math.floor(Math.random() * 50),
    };
  });
};

export default function ViewMessages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [styledMessages, setStyledMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [targetFilter, setTargetFilter] = useState("ALL");
  const [messagePages, setMessagePages] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [hasOlderMessages, setHasOlderMessages] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [isTopLikedMode, setIsTopLikedMode] = useState(false);

  // 🔹 Firestoreから最新20件を取得
  useEffect(() => {
    const fetchMessages = async () => {
      setLoadingPage(true);
      try {
        const q = query(
          collection(db, "messages"),
          orderBy("createdAt", "desc"),
          limit(PAGE_SIZE)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessages(data);
        setMessagePages([{ messages: data, lastDoc: snapshot.docs.at(-1) || null }]);
        setHasOlderMessages(snapshot.docs.length === PAGE_SIZE);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoadingPage(false);
      }
    };
    fetchMessages();
  }, []);

  const showOlderMessages = async () => {
    setIsTopLikedMode(false);
    const cachedPage = messagePages[pageIndex + 1];
    if (cachedPage) {
      setPageIndex((current) => current + 1);
      setMessages(cachedPage.messages);
      return;
    }

    const lastDoc = messagePages[pageIndex]?.lastDoc;
    if (!lastDoc || loadingPage || !hasOlderMessages) return;

    setLoadingPage(true);
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "messages"),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(PAGE_SIZE)
        )
      );
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (data.length === 0) {
        setHasOlderMessages(false);
        return;
      }

      setMessagePages((pages) => [
        ...pages,
        { messages: data, lastDoc: snapshot.docs.at(-1) || null },
      ]);
      setPageIndex((current) => current + 1);
      setMessages(data);
      setHasOlderMessages(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error("Error fetching older messages:", err);
    } finally {
      setLoadingPage(false);
    }
  };

  const showNewerMessages = () => {
    setIsTopLikedMode(false);
    if (pageIndex <= 0) {
      setPageIndex(0);
      setMessages(messagePages[0]?.messages || []);
      setHasOlderMessages(true);
      return;
    }

    const nextIndex = pageIndex - 1;
    setPageIndex(nextIndex);
    setMessages(messagePages[nextIndex].messages);
    setHasOlderMessages(true);
  };

  const showTopLikedMessages = async () => {
    if (loadingPage) return;

    setLoadingPage(true);
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "messages"),
          orderBy("createdAt", "desc")
        )
      );
      const data = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const likeDiff = (b.likes || 0) - (a.likes || 0);
          if (likeDiff !== 0) return likeDiff;

          const aCreatedAt = a.createdAt?.toMillis?.() || 0;
          const bCreatedAt = b.createdAt?.toMillis?.() || 0;
          return bCreatedAt - aCreatedAt;
        })
        .slice(0, PAGE_SIZE);

      setIsTopLikedMode(true);
      setPageIndex(0);
      setMessages(data);
    } catch (err) {
      console.error("Error fetching top liked messages:", err);
      alert("いいねが多い付箋の読み込みに失敗しました。");
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    if (messagePages.length === 0) return;
    if (isTopLikedMode) return;

    if (targetFilter === "ALL") {
      setMessages(messagePages[pageIndex]?.messages || []);
      return;
    }

    const matchingMessages = messagePages
      .flatMap((page) => page.messages)
      .filter((msg) => msg.target === targetFilter)
      .slice(0, PAGE_SIZE);
    setMessages(matchingMessages);
  }, [isTopLikedMode, messagePages, pageIndex, targetFilter]);

  useEffect(() => {
    if (
      isTopLikedMode ||
      targetFilter === "ALL" ||
      messagePages.length === 0 ||
      loadingPage ||
      !hasOlderMessages
    ) {
      return;
    }

    const matchingCount = messagePages
      .flatMap((page) => page.messages)
      .filter((msg) => msg.target === targetFilter).length;
    if (matchingCount >= PAGE_SIZE) return;

    const fetchMoreFilteredMessages = async () => {
      const lastDoc = messagePages.at(-1)?.lastDoc;
      if (!lastDoc) return;

      setLoadingPage(true);
      try {
        const snapshot = await getDocs(
          query(
            collection(db, "messages"),
            orderBy("createdAt", "desc"),
            startAfter(lastDoc),
            limit(PAGE_SIZE)
          )
        );
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        if (data.length === 0) {
          setHasOlderMessages(false);
          return;
        }

        setMessagePages((pages) => [
          ...pages,
          { messages: data, lastDoc: snapshot.docs.at(-1) || null },
        ]);
        setHasOlderMessages(snapshot.docs.length === PAGE_SIZE);
      } catch (err) {
        console.error("Error fetching filtered messages:", err);
      } finally {
        setLoadingPage(false);
      }
    };

    fetchMoreFilteredMessages();
  }, [hasOlderMessages, isTopLikedMode, loadingPage, messagePages, targetFilter]);

  // 🔹 付箋スタイル生成
  const generateRandomStyles = useCallback((msgs) =>
    getLooseGridStyles(msgs, { preserveOrder: isTopLikedMode }).map((msg) => ({
        ...msg,
        color: MESSAGE_COLORS[Math.floor(Math.random() * MESSAGE_COLORS.length)],
        fontSize: window.innerWidth <= MOBILE_BREAKPOINT
          ? `${Math.random() * 0.04 + 0.38}rem`
          : `${Math.random() * 0.4 + 1}rem`,
      })), [isTopLikedMode]);

  // 🔹 初期表示＆ハイライト投稿の遅延表示
  useEffect(() => {
    if (messages.length === 0) {
      setStyledMessages([]);
      return;
    }
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
            x: getBoardSize().width / 2,
            y: window.innerWidth <= MOBILE_BREAKPOINT ? 190 : 120,
            rotate: window.innerWidth <= MOBILE_BREAKPOINT ? 0 : Math.random() * 6 - 3,
            color: "#ff7b7b",
            fontSize: window.innerWidth <= MOBILE_BREAKPOINT ? "0.46rem" : "1.2rem",
            zIndex: 999,
          },
        ]);
      }, 2000);
    }
  }, [generateRandomStyles, messages, searchParams]);

  // 🔹 背景クリックで再配置（シャッフル）
  const shuffleLayout = () => {
    setStyledMessages((prev) =>
      getLooseGridStyles(prev, { preserveOrder: isTopLikedMode })
    );
  };
  const bringToFront = (messageId) => {
    setStyledMessages((prev) => {
      const highestZIndex = Math.max(0, ...prev.map((msg) => msg.zIndex || 0));

      return prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, zIndex: highestZIndex + 1 }
          : msg
      );
    });
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
      setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      setMessagePages((pages) =>
        pages.map((page) => ({
          ...page,
          messages: page.messages.filter((m) => m.id !== msg.id),
        }))
      );
      setStyledMessages((prev) => prev.filter((m) => m.id !== msg.id));
      alert("メッセージを削除しました。");
    }, 1000);
  };

  // 🔹 検索
  const handleLikeChange = (messageId, likes) => {
    const updateMessage = (msg) =>
      msg.id === messageId ? { ...msg, likes } : msg;

    setStyledMessages((prev) => prev.map(updateMessage));
  };

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
  const boardSize = getBoardSize();
  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
  const returnToContents = () => {
    window.scrollTo({ top: 0, left: 0 });
    navigate("/home0");
  };
  const goToPost = () => {
    navigate("/post", {
      state: {
        postPreset: {
          form: "message",
          ...(targetFilter !== "ALL" ? { target: targetFilter } : {}),
        },
      },
    });
  };

  useEffect(() => {
    const originalBackground = document.body.style.background;
    const originalOverflowX = document.body.style.overflowX;
    document.body.style.background = "#f5ead5";
    document.body.style.overflowX = "hidden";

    return () => {
      document.body.style.background = originalBackground;
      document.body.style.overflowX = originalOverflowX;
    };
  }, []);

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
        width: `${boardSize.width}px`,
        minHeight: "100vh",
        height: `${boardSize.height}px`,
        background:
          "repeating-linear-gradient(0deg, rgba(177,142,96,0.045) 0 1px, transparent 1px 24px), #f5ead5",
        overflowX: "hidden",
        overflowY: window.innerWidth <= MOBILE_BREAKPOINT ? "visible" : "hidden",
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
        <div
          style={{
            display: "flex",
            gap: "8px",
            width: "100%",
            paddingRight: "96px",
            boxSizing: "border-box",
          }}
        >
          <button onClick={returnToContents} style={buttonStyle}>
            もくじ
          </button>
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
              onClick={() => {
                setIsTopLikedMode(false);
                setTargetFilter(target);
              }}
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

        {targetFilter === "ALL" && (
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {(pageIndex > 0 || isTopLikedMode) && (
              <button
                type="button"
                onClick={showNewerMessages}
                disabled={loadingPage}
                style={{ ...buttonStyle, background: "#7fa6c8" }}
              >
                新しい付箋を見る
              </button>
            )}
            {hasOlderMessages && (
              <button
                type="button"
                onClick={showOlderMessages}
                disabled={loadingPage}
                style={{ ...buttonStyle, background: "#d6a94f" }}
              >
                {loadingPage ? "読み込み中..." : "古い付箋を見る"}
              </button>
            )}
            <button
              type="button"
              onClick={showTopLikedMessages}
              disabled={loadingPage}
              style={{
                ...buttonStyle,
                background: isTopLikedMode ? "#ff7b7b" : "#e46c6c",
              }}
            >
              {loadingPage && isTopLikedMode ? "読み込み中..." : "人気の付箋"}
            </button>
          </div>
        )}

      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${boardSize.width}px`,
          height: `${boardSize.height}px`,
        }}
      >
      {/* 🔸 付箋の表示 */}
      <AnimatePresence>
        {filteredMessages.map((msg, i) => (
          <motion.div
            key={msg.id}
            onClick={(e) => {
              e.stopPropagation();
              bringToFront(msg.id);
            }}
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
              background: "rgba(255,255,255,0.96)",
              color: msg.color,
              padding: window.innerWidth <= MOBILE_BREAKPOINT ? "13px 18px 18px 6px" : "32px 42px 38px 14px",
              boxSizing: "border-box",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              textAlign: "center",
              width: `${getNoteSize(msg.text).width}px`,
              fontWeight: "600",
              lineHeight: "1.5",
              zIndex: msg.zIndex || 1,
              userSelect: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: window.innerWidth <= MOBILE_BREAKPOINT ? "-5px" : "-9px",
                left: "50%",
                width: window.innerWidth <= MOBILE_BREAKPOINT ? "30px" : "62px",
                height: window.innerWidth <= MOBILE_BREAKPOINT ? "9px" : "17px",
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
                top: window.innerWidth <= MOBILE_BREAKPOINT ? 3 : 6,
                right: window.innerWidth <= MOBILE_BREAKPOINT ? 3 : 6,
                cursor: "pointer",
                opacity: 0.7,
              }}
            >
              <Trash2 size={window.innerWidth <= MOBILE_BREAKPOINT ? 11 : 18} />
            </div>

            <LikeButton
              collectionName="messages"
              postId={msg.id}
              likes={msg.likes || 0}
              onChange={(likes) => handleLikeChange(msg.id, likes)}
              size={window.innerWidth <= MOBILE_BREAKPOINT ? 10 : 16}
              style={{
                position: "absolute",
                right: window.innerWidth <= MOBILE_BREAKPOINT ? 3 : 7,
                bottom: window.innerWidth <= MOBILE_BREAKPOINT ? 3 : 7,
                padding: window.innerWidth <= MOBILE_BREAKPOINT ? "2px 4px" : "4px 7px",
                fontSize: window.innerWidth <= MOBILE_BREAKPOINT ? "0.34rem" : "0.78rem",
              }}
            />

            <p
              style={{
                margin: "0 0 6px 0",
                fontSize: window.innerWidth <= MOBILE_BREAKPOINT ? "0.4rem" : msg.fontSize,
                fontWeight: "800",
              }}
            >
              {msg.text}
            </p>
            <p
              style={{
                fontSize: window.innerWidth <= MOBILE_BREAKPOINT ? "0.36rem" : "0.8rem",
                color: "#444",
                // marginBottom: "4px",
              }}
            >
              to {msg.target || "SHISHAMO"}
            </p>

            <p
              style={{
                fontSize: window.innerWidth <= MOBILE_BREAKPOINT ? "0.36rem" : "0.85rem",
                color: "#555",
                whiteSpace: "nowrap",
              }}
            >
              {msg.name || "匿名のしゃもサポ"} {msg.sns && `@${msg.sns}`}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
      </div>

      <p
        style={{
          position: "fixed",
          left: "50%",
          bottom: "14px",
          zIndex: 900,
          margin: 0,
          padding: isMobile ? "8px 14px" : "7px 16px",
          border: "1px solid rgba(177, 139, 91, 0.2)",
          borderRadius: "8px",
          background: "rgba(255, 253, 246, 0.9)",
          boxShadow: "2px 3px 0 rgba(137, 102, 64, 0.1)",
          color: "rgba(109, 89, 70, 0.82)",
          fontSize: window.innerWidth <= MOBILE_BREAKPOINT ? "0.76rem" : "0.84rem",
          fontWeight: "bold",
          letterSpacing: "0.05em",
          textAlign: "center",
          lineHeight: 1.65,
          transform: "translateX(-50%)",
          width: isMobile ? "min(86vw, 340px)" : "auto",
          whiteSpace: isMobile ? "normal" : "nowrap",
          pointerEvents: "none",
        }}
      >
        <span style={{ display: "block" }}>スワイプして付箋を見てまわれます</span>
        <span style={{ display: "block" }}>画面をタップすると並び替えられます</span>
      </p>

      {messages.length === 0 && (
        <EmptyNote
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            zIndex: 850,
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
