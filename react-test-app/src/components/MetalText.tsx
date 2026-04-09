// components/MetalText.tsx
import React from "react";

interface MetalTextProps {
  children: React.ReactNode;
  color?: string;
  fontSize?: string;
  className?: string;
}

export const MetalText: React.FC<MetalTextProps> = ({
  children,
  color = "#a3a000",
  fontSize = "1rem",
  className = "",
}) => {
  return (
    <span
      className={className}
      style={{
        filter: "url(#recessed-metal)", // The magic link
        color: color,
        fontSize: fontSize,
        fontFamily: "monospace",
        fontWeight: "bold",
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
};
