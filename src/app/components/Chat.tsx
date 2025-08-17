export function ChatWindow() {
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
      </div>

      <div
        style={{
          padding: "1rem",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Describe your app..."
            style={{
              flex: 1,
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
            }}
          />
          <button
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
