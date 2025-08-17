"use client";

import { useChat } from "@ai-sdk/react";
import { Loader } from "lucide-react";
import { useState } from "react";
import { Conversation, ConversationContent } from "./ai-elements/conversation";
import { Message, MessageContent } from "./ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "./ai-elements/prompt-input";
import { Response } from "./ai-elements/response";

export function ChatWindow() {
  const { messages, sendMessage, status } = useChat({
    onError: (error) => {
      console.error("Chat error:", error);
    },
  });
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  return (
    <div className="w-1/2 flex flex-col border-r">
      <div className="border-b p-3 h-14 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Open AI Programmer</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center font-semibold mt-8">
            <p className="text-3xl mt-4">What can we build together?</p>
          </div>
        ) : (
          <>
            <Conversation>
              <ConversationContent>
                {messages.map((msg, index) => (
                  <Message from={msg.role} key={index}>
                    <MessageContent>
                      {msg.parts.map((part, i) => {
                        switch (part.type) {
                          case "text":
                            return <Response key={i}>{part.text}</Response>;
                          default:
                            return null;
                        }
                      })}
                    </MessageContent>
                  </Message>
                ))}
              </ConversationContent>
            </Conversation>
            {status === "submitted" && (
              <Message from="assistant">
                <MessageContent>
                  <div className="flex items-center gap-2">
                    <Loader />
                    Creating your app...
                  </div>
                </MessageContent>
              </Message>
            )}
          </>
        )}
      </div>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <PromptInput
            onSubmit={handleSubmit}
            className="mt-4 w-full max-w-2xl mx-auto relative"
          >
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              className="pr-12 min-h-[60px]"
            />
            <PromptInputSubmit
              className="absolute bottom-1 right-1"
              disabled={!input}
              status={status === "streaming" ? "streaming" : "ready"}
            />
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
