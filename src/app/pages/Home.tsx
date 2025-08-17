import { ChatWindow } from "@/components/Chat";
import { PreviewPanel } from "@/components/Preview";

export function Home() {
  return (
    <div className="h-screen flex">
      <ChatWindow />
      <PreviewPanel />
    </div>
  );
}
