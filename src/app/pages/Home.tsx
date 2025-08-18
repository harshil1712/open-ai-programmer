"use client";

import React, { useState } from "react";
import { ChatWindow } from "@/components/Chat";
import { PreviewPanel } from "@/components/Preview";

export function Home() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <div className="h-screen flex">
      <ChatWindow onPreviewReady={setPreviewUrl} />
      <PreviewPanel previewUrl={previewUrl} />
    </div>
  );
}
