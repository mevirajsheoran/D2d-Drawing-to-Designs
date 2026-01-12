"use client";

import { TextShape } from "@/redux/slice/shapes";
import { useAppDispatch } from "@/redux/store";
import { updateShape } from "@/redux/slice/shapes";
import { useState, useRef, useEffect } from "react";

interface TextProps {
  shape: TextShape;
  isSelected?: boolean;
}

export function Text({ shape, isSelected }: TextProps) {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(updateShape({ id: shape.id, patch: { text: e.target.value } }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: shape.x,
        top: shape.y,
        minWidth: 50,
      }}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <textarea
          ref={inputRef}
          value={shape.text}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none resize-none"
          style={{
            fontFamily: shape.fontFamily,
            fontSize: shape.fontSize,
            fontWeight: shape.fontWeight,
            fontStyle: shape.fontStyle,
            textAlign: shape.textAlign,
            textDecoration: shape.textDecoration,
            lineHeight: shape.lineHeight,
            letterSpacing: shape.letterSpacing,
            textTransform: shape.textTransform,
            color: shape.fill || "#ffffff",
            width: "auto",
            minWidth: 100,
          }}
        />
      ) : (
        <span
          style={{
            fontFamily: shape.fontFamily,
            fontSize: shape.fontSize,
            fontWeight: shape.fontWeight,
            fontStyle: shape.fontStyle,
            textAlign: shape.textAlign,
            textDecoration: shape.textDecoration,
            lineHeight: shape.lineHeight,
            letterSpacing: `${shape.letterSpacing}px`,
            textTransform: shape.textTransform,
            color: shape.fill || "#ffffff",
            whiteSpace: "pre-wrap",
          }}
        >
          {shape.text || "Type here..."}
        </span>
      )}
    </div>
  );
}