import React from "react";
import { useNavigate } from "react-router-dom";

export default function Cover() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/home")}
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff7f7",
        color: "#333",
        cursor: "pointer",
        textAlign: "center",
        padding: "40px 0"
      }}
    >
      <h1 style={{ marginTop: "100px" }}>しゃもサポの卒業制作</h1>
      <p style={{ marginBottom: "100px", fontSize: "20px", color: "#ff8b8b" }}>クリックして開く</p>
    </div>
  );
}
