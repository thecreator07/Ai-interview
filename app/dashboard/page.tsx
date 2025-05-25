"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";

const DashboardPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
const router=useRouter()
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage("Please select a file to upload.");
      return;
    }
    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/uploadpdf", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("File uploaded successfully!");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setMessage("Failed to upload file.");
      }
    } catch (error:unknown) {
      console.error("Upload error:", error);
      setMessage("An error occurred during upload.");
    } finally {
      setUploading(false);
router.push('/voice-interview')
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        padding: 24,
        border: "1px solid #eee",
        borderRadius: 8,
      }}
    >
      <h2>Upload a File</h2>
      <form onSubmit={handleUpload}>
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading}
          style={{ marginBottom: 16 }}
        />
        <br />
        <Button type="submit" disabled={uploading || !selectedFile}>
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </form>
      {message && (
        <div
          style={{
            marginTop: 16,
            color: message.includes("success") ? "green" : "red",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
