"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const PlaygroundPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (messageContent?: string) => {
    const userInput = messageContent ?? input;
    if (!userInput.trim()) return;

    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/interview/${sessionId}/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: newMessages }),
      });
      const data = await res.json();

      if (data?.content) {
        setMessages((prev) => [
          ...newMessages,
          { role: "assistant", content: data.content },
        ]);
        setResponse(data.content);
      }
    } catch (e) {
      setResponse("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    handleSend("Start the interview");
  }, []);

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Interview Playground</h1>
      <div className="mb-4">
        <textarea
          className="w-full border rounded p-2"
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer or question..."
        />
        <button
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => handleSend()}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
        <p>{response}</p>
      </div>
    </div>
  );
};

export default PlaygroundPage;
