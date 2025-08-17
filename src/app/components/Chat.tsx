"use client";

import { useChat, Chat } from "@ai-sdk/react";
import { useState } from "react";

export function ChatWindow() {
  const { messages, sendMessage, status } = useChat({
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });
  const [input, setInput] = useState("");
  
  console.log("Chat status:", status, "Messages:", messages.length);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "1rem",
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "600" }}>
          Chat
        </h2>
      </div>

      <div
        style={{
          flex: 1,
          padding: "1rem",
          overflowY: "auto",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              padding: "0.75rem",
              backgroundColor: "#f3f4f6",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            Welcome! Describe what you'd like to build and I'll generate it for
            you.
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              padding: "0.75rem",
              backgroundColor: message.role === "user" ? "#dbeafe" : "#f3f4f6",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                marginBottom: "0.25rem",
              }}
            >
              {message.role === "user" ? "You" : "Assistant"}
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>
              {message.parts
                .map((part, index) => (part.type === "text" ? part.text : ""))
                .join("")}
            </div>
          </div>
        ))}

        {status === "streaming" && (
          <div
            style={{
              padding: "0.75rem",
              backgroundColor: "#f3f4f6",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              fontStyle: "italic",
            }}
          >
            Generating...
          </div>
        )}
      </div>

      <div
        style={{
          padding: "1rem",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              console.log("Sending message:", input);
              sendMessage({ text: input });
              setInput("");
            }
          }}
          style={{ display: "flex", gap: "0.5rem" }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your app..."
            disabled={status === "streaming"}
            style={{
              flex: 1,
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              opacity: status === "streaming" ? 0.5 : 1,
            }}
          />
          <button
            type="submit"
            disabled={status === "streaming"}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: status === "streaming" ? "#9ca3af" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              cursor: status === "streaming" ? "not-allowed" : "pointer",
            }}
          >
            {status === "streaming" ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
