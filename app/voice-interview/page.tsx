// components/InterviewAssistant.tsx
"use client";

import React, { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { ResponseData } from "../api/ai/route";

export default function InterviewAssistant() {
  const [chatHistory, setChatHistory] = useState<ResponseData[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [currentOutput, setCurrentOutput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      alert("Your browser does not support speech recognition.");
    }
  }, [browserSupportsSpeechRecognition]);

  // 🗣️ Text-to-speech function
  const speakText = (text: string) => {
    SpeechRecognition.stopListening();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
  
    // utterance.onend=()=>{
    //   if (utterance.volume) {

    //   }
    // }

    speechSynthesis.speak(utterance);
  };

  // 🎤 Start recording
  const handleStartListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };

  // 📩 Send transcript to API
  const handleSubmit = async () => {
    if (!transcript) return;
    setIsSending(true);
    // const newMessages = [...chatHistory, { role: "user", content: transcript }];

    const newMessages = [...messages, { role: "user", content: transcript }];
    setMessages(newMessages);
    // setInput("");
    // setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      //   setChatHistory([...newMessages, { role: "user", content: data.content }]);
      if (data?.content) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.content },
        ]);
        setChatHistory(data?.history);
        setCurrentOutput(data.content);
        speakText(data.content);
      } // 📢 Read output aloud
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsSending(false);
      resetTranscript();
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🎓 Interview Assistant</h2>

      <div className="border p-4 rounded bg-gray-100">
        <p className="text-gray-600">Transcript:</p>
        <p className="text-lg font-medium">
          {transcript || 'Click "Start Listening" and speak...'}
        </p>
      </div>

      <div className="mt-4 flex gap-4">
        <button
          onClick={handleStartListening}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          🎤 Start Listening
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSending || !transcript}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          🚀 Submit
        </button>
      </div>

      {currentOutput && (
        <div className="mt-6 p-4 border rounded bg-white shadow">
          <h4 className="font-semibold">AI Response:</h4>
          <pre className="whitespace-pre-wrap">{currentOutput}</pre>
        </div>
      )}

      {chatHistory.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-2">📜 Interview History</h3>
          <ul className="space-y-4">
            {chatHistory.map((entry, index) => (
              <li key={index} className="p-4 border rounded bg-white shadow">
                <p>
                  <strong>❓ Question:</strong> {entry.question}
                </p>
                <p>
                  <strong>⭐ Rating:</strong> {entry.rating}
                </p>
                <p>
                  <strong>📌 Guideline:</strong> {entry.guideline}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
