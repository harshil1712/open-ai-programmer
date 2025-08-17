import { ChatWindow } from "../components/Chat";
import { PreviewPanel } from "../components/Preview";

export function Home() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "40%",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ChatWindow />
      </div>

      <div
        style={{
          width: "60%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <PreviewPanel />
      </div>
    </div>
  );
}
