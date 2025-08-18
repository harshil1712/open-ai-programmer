"use client";

import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from "./ai-elements/web-preview";

interface PreviewPanelProps {
  previewUrl: string | null;
}

export function PreviewPanel({ previewUrl }: PreviewPanelProps) {

  return (
    <div className="w-1/2 flex flex-col">
      <WebPreview>
        <WebPreviewNavigation>
          <WebPreviewUrl
            readOnly
            placeholder="Your app here..."
            value={previewUrl || ""}
          />
        </WebPreviewNavigation>
        <WebPreviewBody src={previewUrl || ""} />
      </WebPreview>
    </div>
  );
}
