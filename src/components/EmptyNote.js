import React from "react";

export default function EmptyNote({ children, style = {} }) {
  return (
    <div
      style={{
        position: "relative",
        boxSizing: "border-box",
        maxWidth: "360px",
        margin: "18px auto",
        padding: "24px 18px 18px",
        border: "1px solid rgba(177, 139, 91, 0.18)",
        borderRadius: "3px",
        background: "rgba(255, 253, 244, 0.92)",
        boxShadow: "3px 4px 0 rgba(137, 102, 64, 0.1)",
        color: "#927d6b",
        fontFamily: "'Yomogi', cursive",
        textAlign: "center",
        ...style,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "-9px",
          left: "50%",
          width: "64px",
          height: "18px",
          background: "rgba(244, 215, 142, 0.62)",
          transform: "translateX(-50%) rotate(-2deg)",
        }}
      />
      {children}
    </div>
  );
}
