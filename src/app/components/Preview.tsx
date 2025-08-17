export function PreviewPanel() {
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
          Preview
        </h2>
      </div>

      <div
        style={{
          flex: 1,
          padding: "1rem",
          backgroundColor: "#ffffff",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f9fafb",
            color: "#6b7280",
          }}
        >
          Your generated app will appear here
        </div>
      </div>
    </div>
  );
}
