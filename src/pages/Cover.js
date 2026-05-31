import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Cover() {
  const navigate = useNavigate();
  const [isOpening, setIsOpening] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const openAlbum = () => {
    if (isOpening) return;

    setIsOpening(true);
    setTimeout(() => setIsFading(true), 700);
    setTimeout(() => navigate("/home0"), 1250);
  };

  return (
    <div
      onClick={openAlbum}
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff7f7",
        color: "#333",
        cursor: "pointer",
        textAlign: "center",
        overflow: "hidden",
        perspective: "1400px",
        opacity: isFading ? 0 : 1,
        transition: "opacity 0.55s ease",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(82vw, 420px)",
          height: "min(72vh, 590px)",
          borderRadius: "10px",
          background: "#c94f4f",
          boxShadow: "12px 14px 0 #b84242, 0 20px 35px rgba(0,0,0,0.18)",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "10px 8px 8px 18px",
            borderRadius: "4px 8px 8px 4px",
            background: "#fffdf2",
            boxShadow: "inset 3px 0 0 rgba(0,0,0,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "10px",
            background: "#e46c6c",
            boxShadow: "4px 3px 10px rgba(0,0,0,0.18)",
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            transform: isOpening ? "rotateY(-105deg)" : "rotateY(0deg)",
            transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "10px",
              background: "#e46c6c",
              backfaceVisibility: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "34px 30px",
                border: "2px solid rgba(255,255,255,0.65)",
                borderRadius: "8px",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "24px",
                height: "100%",
                borderRadius: "10px 0 0 10px",
                background:
                  "linear-gradient(90deg, #a84444 0%, #cb5a5a 55%, #e46c6c 100%)",
                boxShadow: "inset -2px 0 5px rgba(0,0,0,0.25)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                padding: "30px",
              }}
            >
              <p style={{ margin: "0 0 16px", fontSize: "1rem" }}>SHISHAMO</p>
              <h1 style={{ margin: 0, fontSize: "clamp(2rem, 8vw, 3rem)" }}>
                しゃもサポの
                <br />
                卒業制作
              </h1>
              <p style={{ marginTop: "36px", fontSize: "1rem", opacity: 0.9 }}>
                クリックしてアルバムを開く
              </p>
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "10px",
              background: "#fffdf2",
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
            }}
          />
        </div>
      </div>

      <style>
        {`
          @media (prefers-reduced-motion: reduce) {
            * {
              transition-duration: 0.01ms !important;
              animation-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </div>
  );
}
