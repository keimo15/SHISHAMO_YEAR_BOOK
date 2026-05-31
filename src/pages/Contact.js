import React from "react";
import { Link } from "react-router-dom";

const ADMIN_X_PROFILE_URL = "https://x.com/wool_SHAMOMAYO";

export default function Contact() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 18% 12%, rgba(255,255,255,0.72), transparent 24%), repeating-linear-gradient(0deg, rgba(177,142,96,0.045) 0 1px, transparent 1px 24px), #f5ead5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
        fontFamily: "'Yomogi', cursive",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "620px",
          position: "relative",
          background:
            "repeating-linear-gradient(0deg, transparent 0 25px, rgba(130,170,190,0.08) 25px 26px), #fffdf4",
          border: "1px solid rgba(174,139,91,0.28)",
          borderRadius: "4px",
          padding: "42px clamp(20px, 5vw, 42px) 34px",
          boxSizing: "border-box",
          boxShadow:
            "6px 8px 0 rgba(145,105,64,0.14), 0 16px 34px rgba(105,75,45,0.14)",
          textAlign: "center",
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
          }}
        />
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
          CONTACT
        </p>
        <h1 style={{ margin: "6px 0 18px", color: "#d66565" }}>
          お問い合わせ
        </h1>

        <p
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            color: "#6a5140",
            lineHeight: "2",
            textAlign: "left",
          }}
        >
          サイトの利用中に困ったことがあった場合や、悪質な投稿を見かけた場合は、
          管理人のXプロフィールまでご連絡ください。
        </p>

        <a
          href={ADMIN_X_PROFILE_URL}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-block",
            marginTop: "18px",
            background: "#e46c6c",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: "999px",
            textDecoration: "none",
            fontWeight: "bold",
            boxShadow: "0 3px 0 #b84242",
          }}
        >
          管理人のXプロフィールを開く
        </a>

        <div style={{ marginTop: "30px" }}>
          <Link
            to="/home0"
            style={{
              color: "#e46c6c",
              textDecoration: "underline",
              fontWeight: "bold",
            }}
          >
            もくじに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
