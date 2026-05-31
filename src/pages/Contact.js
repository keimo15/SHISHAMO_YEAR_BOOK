import React from "react";
import { Link } from "react-router-dom";

const ADMIN_X_PROFILE_URL = "https://x.com/wool_SHAMOMAYO";

export default function Contact() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fffef8",
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
          background: "#fff",
          borderRadius: "16px",
          padding: "32px 20px",
          boxSizing: "border-box",
          boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginTop: 0, color: "#444" }}>お問い合わせ</h1>

        <p
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            color: "#555",
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
            background: "#222",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: "999px",
            textDecoration: "none",
            fontWeight: "bold",
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
