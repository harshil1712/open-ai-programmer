"use client";

import { useState, useEffect } from "react";

interface PreviewStatus {
  previewUrl: string | null;
  status: 'pending' | 'ready';
}

export function PreviewPanel() {
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>({
    previewUrl: null,
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkPreviewStatus = async () => {
      try {
        const response = await fetch('/api/preview-status');
        const status: PreviewStatus = await response.json();
        setPreviewStatus(status);
        
        // Stop polling once we have a preview URL
        if (status.previewUrl) {
          return true; // Signal to stop polling
        }
        return false;
      } catch (error) {
        console.error('Error checking preview status:', error);
        return false;
      }
    };

    // Smart polling: start fast, slow down over time
    let pollInterval = 1000; // Start with 1 second
    let timeoutId: NodeJS.Timeout;

    const poll = async () => {
      const shouldStop = await checkPreviewStatus();
      
      if (!shouldStop) {
        // Increase interval gradually (max 5 seconds)
        pollInterval = Math.min(pollInterval * 1.2, 5000);
        timeoutId = setTimeout(poll, pollInterval);
      }
    };

    // Initial check
    poll();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const renderContent = () => {
    if (previewStatus.previewUrl) {
      return (
        <iframe
          src={previewStatus.previewUrl}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: "0.5rem",
          }}
          onLoad={() => setLoading(false)}
          onError={() => {
            console.error('Iframe failed to load');
            setLoading(false);
          }}
        />
      );
    }

    return (
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
        {previewStatus.status === 'pending' 
          ? "Waiting for generated app..." 
          : "Your generated app will appear here"
        }
      </div>
    );
  };

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
        {renderContent()}
      </div>
    </div>
  );
}
