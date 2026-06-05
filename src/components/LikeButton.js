import React, { useEffect, useState } from "react";
import { doc, increment, updateDoc } from "firebase/firestore";
import { Heart } from "lucide-react";
import { db } from "../firebase";

const getStorageKey = (collectionName, postId) =>
  `shishamo-liked:${collectionName}:${postId}`;

export default function LikeButton({
  collectionName,
  postId,
  likes = 0,
  onChange,
  style,
  size = 18,
}) {
  const [liked, setLiked] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLiked(localStorage.getItem(getStorageKey(collectionName, postId)) === "1");
  }, [collectionName, postId]);

  const handleClick = async (event) => {
    event.stopPropagation();
    if (saving) return;

    const previousLiked = liked;
    const previousLikes = likes || 0;
    const nextLiked = !liked;
    const delta = nextLiked ? 1 : -1;
    const nextLikes = Math.max(previousLikes + delta, 0);

    setSaving(true);
    setLiked(nextLiked);
    onChange?.(nextLikes);

    try {
      await updateDoc(doc(db, collectionName, postId), {
        likes: increment(delta),
      });

      const storageKey = getStorageKey(collectionName, postId);
      if (nextLiked) {
        localStorage.setItem(storageKey, "1");
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error(error);
      setLiked(previousLiked);
      onChange?.(previousLikes);
      alert("いいねの更新に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saving}
      aria-label={liked ? "いいねを取り消す" : "いいねする"}
      title={liked ? "いいねを取り消す" : "いいねする"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        border: "none",
        background: "rgba(255, 255, 255, 0.82)",
        color: liked ? "#e25570" : "#7a6a61",
        borderRadius: "999px",
        padding: "4px 7px",
        cursor: saving ? "wait" : "pointer",
        fontFamily: "'Yomogi', cursive",
        fontWeight: "bold",
        boxShadow: "0 2px 6px rgba(80, 50, 30, 0.12)",
        opacity: saving ? 0.7 : 1,
        ...style,
      }}
    >
      <Heart size={size} fill={liked ? "currentColor" : "none"} />
      <span>{likes || 0}</span>
    </button>
  );
}
