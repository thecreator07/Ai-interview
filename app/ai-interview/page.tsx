"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { ResponseData } from "@/lib/validid";
// import { ResponseData } from "../api/ai/route";
export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [history, setHistory] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (data?.content) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.content },
        ]);
        setHistory(data?.history);
      } else {
        setMessages([
          ...newMessages,
          { role: "assistant", content: "Error: No response" },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Something went wrong" },
      ]);
    } finally {
      setLoading(false);
      console.log(history);
    }
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  

  return (
    <motion.div
      initial={{ opacity: 0.0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.3,
        duration: 0.8,
        ease: "easeInOut",
      }}
      className="relative flex flex-col gap-4 items-center justify-center px-4 overflow-y-auto hide-scrollbar"
    >
      <div className="max-w-2xl h-full mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4 text-center">Persona AI</h1>
        <div className="mb-4"></div>

        <div className="space-y-4 mb-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3  ${
                msg.role === "user" ? "pl-3 ml-10 " : "pr-3 mr-10"
              } rounded-lg ${
                msg.role === "user"
                  ? "bg-green-100 text-right"
                  : "bg-slate-200 text-left"
              }`}
            >
              <strong>{msg.role === "user" ? "You" : "sytem"}:</strong>
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="text-black-500">system is thinking...</div>
          )}
        </div>

        <div className="flex gap-2 pb-2.5">
          <Input
            type="text"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Ask something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            onClick={sendMessage}
            disabled={loading}
          >
            Send
          </Button>
        </div>
      </div>
      <div ref={bottomRef} />
    </motion.div>
  );
}
