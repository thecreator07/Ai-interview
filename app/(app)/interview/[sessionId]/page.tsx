"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResponseData } from "@/lib/validid";
import { ResumeData } from "@/models/resumes.models";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const Dashboard: React.FC = () => {
  const param = useParams();
  const { data: session } = useSession();
  const [chats, setChats] = useState<ResumeData | null>(null);

  const fetchSessionById = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/interview/${sessionId}/chats`);
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch session");
      if (data?.session) setChats(data.session);
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  };

  useEffect(() => {
    fetchSessionById(param.sessionId as string);
  }, [param.sessionId]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="border-b pb-2 text-center text-4xl font-extrabold tracking-tight lg:text-5xl">
        ProPrep AI
      </h1>

      <section className="flex flex-col mt-5 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h4 className="flex items-end gap-1 text-xl font-semibold tracking-tight">
            Name: <p className="text-base truncate max-w-xs">{session?.user?.email}</p>
          </h4>
          <h4 className="flex items-end gap-1 text-xl font-semibold tracking-tight">
            Resume: <p className="text-base truncate max-w-xs">{chats?.resumeName}</p>
          </h4>
          <h4 className="flex items-end gap-1 text-xl font-semibold tracking-tight">
            Creation Date:{" "}
            <p className="text-base whitespace-nowrap">
              {chats?.createdAt
                ? new Date(chats.createdAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </p>
          </h4>
        </div>

        <div className="overflow-x-auto border rounded-sm">
          <Table className="min-w-full table-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="max-w-[200px] break-words">Question</TableHead>
                <TableHead className="max-w-[300px] break-words">Answer</TableHead>
                <TableHead className="max-w-[100px] break-words">Rating</TableHead>
                <TableHead className="max-w-[300px] text-right break-words">Guideline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {chats?.conversation.slice(0, 4).map((session: ResponseData, i) => (
                <TableRow key={i} className="align-top">
                  <TableCell className="max-w-[200px] break-words whitespace-normal">
                  {session.question}
                  </TableCell>
                  <TableCell className="max-w-[300px] break-words whitespace-normal">
                  {session.answer}
                  </TableCell>
                  <TableCell className="max-w-[100px] break-words whitespace-normal">
                  {session.rating}
                  </TableCell>
                    <TableCell className="max-w-[300px] text-left break-words whitespace-normal">
                    {session.guideline
                      ?.split(/\d+\.\s/)
                      .filter(Boolean)
                      .map((point, idx) => (
                      <div key={idx} className="mb-1">
                        {`${idx + 1}. ${point.trim()}`}
                      </div>
                      ))}
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
