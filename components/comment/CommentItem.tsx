"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThumbsUpIcon, ThumbsDownIcon, ChatCircleIcon, TrashIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import CommentForm from "./CommentForm";
import ReplyList from "./ReplyList";
import OverflowMenu from "@/components/ui/OverflowMenu";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import CommentBody from "./CommentBody";

interface CommentAuthor {
  id: string;
  name: string | null;
  image: string | null;
}

interface Reply {
  id: string;
  body: string;
  author: CommentAuthor;
  createdAt: string;
  likes: number;
  dislikes: number;
  userVote: "LIKE" | "DISLIKE" | null;
}

interface CommentItemProps {
  id: string;
  body: string;
  author: CommentAuthor;
  videoId: string;
  createdAt: string;
  likes: number;
  dislikes: number;
  userVote: "LIKE" | "DISLIKE" | null;
  replies: Reply[];
  replyCount: number;
  onDelete: (id: string) => void;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear > 0) return `${diffYear}y ago`;
  if (diffMonth > 0) return `${diffMonth}mo ago`;
  if (diffWeek > 0) return `${diffWeek}w ago`;
  if (diffDay > 0) return `${diffDay}d ago`;
  if (diffHour > 0) return `${diffHour}h ago`;
  if (diffMin > 0) return `${diffMin}m ago`;
  return "just now";
}

export default function CommentItem({
  id,
  body,
  author,
  videoId,
  createdAt,
  likes,
  dislikes,
  userVote,
  replies,
  replyCount,
  onDelete,
}: CommentItemProps) {
  const { data: session } = useSession();
  const isAuthor = session?.user?.id === author.id;
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [currentVote, setCurrentVote] = useState(userVote);
  const [likeCount, setLikeCount] = useState(likes);
  const [dislikeCount, setDislikeCount] = useState(dislikes);
  const [loadedReplies, setLoadedReplies] = useState<Reply[]>(replies);
  const [loadedReplyCount, setLoadedReplyCount] = useState(replyCount);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function deleteReplyLocal(replyId: string) {
    setLoadedReplies((prev) => prev.filter((r) => r.id !== replyId));
    setLoadedReplyCount((c) => Math.max(0, c - 1));
  }

  function requestDelete(close: () => void) {
    close();
    setConfirmOpen(true);
  }

  async function handleConfirmDelete() {
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setConfirmOpen(false);
      onDelete(id);
      toast.success("Comment deleted");
    } catch {
      toast.error("Couldn't delete comment");
    }
  }

  const fetchReplies = useCallback(async () => {
    setRepliesLoading(true);
    try {
      const res = await fetch(`/api/comments?parentId=${id}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        const items: Reply[] = (data.items ?? []).slice().reverse();
        setLoadedReplies(items);
        setLoadedReplyCount(items.length);
      }
    } finally {
      setRepliesLoading(false);
    }
  }, [id]);

  const expandReplies = useCallback(async () => {
    setShowReplies(true);
    if (loadedReplies.length >= loadedReplyCount) return;
    await fetchReplies();
  }, [loadedReplies.length, loadedReplyCount, fetchReplies]);

  const handleReplyAdded = useCallback(async () => {
    setShowReplies(true);
    await fetchReplies();
  }, [fetchReplies]);

  async function handleVote(type: "LIKE" | "DISLIKE") {
    const prevVote = currentVote;
    const prevLikes = likeCount;
    const prevDislikes = dislikeCount;

    // Optimistic update
    if (currentVote === type) {
      setCurrentVote(null);
      if (type === "LIKE") setLikeCount((c) => c - 1);
      else setDislikeCount((c) => c - 1);
    } else {
      if (currentVote === "LIKE") setLikeCount((c) => c - 1);
      if (currentVote === "DISLIKE") setDislikeCount((c) => c - 1);
      setCurrentVote(type);
      if (type === "LIKE") setLikeCount((c) => c + 1);
      else setDislikeCount((c) => c + 1);
    }

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: id, type }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setCurrentVote(prevVote);
      setLikeCount(prevLikes);
      setDislikeCount(prevDislikes);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/channel/${author.id}`} className="shrink-0 mt-0.5">
          {author.image ? (
            <Image
              src={author.image}
              alt={author.name || "User"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover border border-border-default"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-bg-hover border border-border-default flex items-center justify-center">
              <span className="text-xs font-medium text-text-secondary">
                {author.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Link
              href={`/channel/${author.id}`}
              className="text-xs font-medium text-text-primary hover:underline"
            >
              {author.name || "Unknown"}
            </Link>
            <span className="text-xs text-text-muted">{formatTimeAgo(createdAt)}</span>
          </div>

          {/* Body */}
          <CommentBody
            body={body}
            className="text-sm text-text-primary mt-1 leading-relaxed whitespace-pre-wrap wrap-break-word"
          />

          {/* Actions */}
          <div className="flex items-center gap-1 mt-2">
            <button
              onClick={() => handleVote("LIKE")}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-base ${
                currentVote === "LIKE"
                  ? "text-amber-100 bg-amber-700"
                  : "text-text-muted hover:text-text-secondary hover:bg-bg-hover"
              }`}
            >
              <ThumbsUpIcon size={14} weight={currentVote === "LIKE" ? "fill" : "regular"} />
              {likeCount > 0 && <span className="font-mono">{likeCount}</span>}
            </button>

            <button
              onClick={() => handleVote("DISLIKE")}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-base ${
                currentVote === "DISLIKE"
                  ? "text-vermillion-100 bg-vermillion-700"
                  : "text-text-muted hover:text-text-secondary hover:bg-bg-hover"
              }`}
            >
              <ThumbsDownIcon size={14} weight={currentVote === "DISLIKE" ? "fill" : "regular"} />
              {dislikeCount > 0 && <span className="font-mono">{dislikeCount}</span>}
            </button>

            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-base"
            >
              <ChatCircleIcon size={14} />
              Reply
            </button>

            {isAuthor && (
              <OverflowMenu
                ariaLabel="Comment options"
                triggerClassName="p-1 rounded-md text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-base opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                {(close) => (
                  <button
                    type="button"
                    onClick={() => requestDelete(close)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-vermillion-100 hover:bg-vermillion-700/20 transition-base"
                  >
                    <TrashIcon size={14} />
                    Delete
                  </button>
                )}
              </OverflowMenu>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                videoId={videoId}
                parentId={id}
                placeholder="Add a reply..."
                autoFocus
                onCancel={() => setShowReplyForm(false)}
                onSubmit={() => {
                  setShowReplyForm(false);
                  handleReplyAdded();
                }}
              />
            </div>
          )}

          {/* Replies */}
          {loadedReplyCount > 0 && (
            <div className="mt-2">
              {!showReplies ? (
                <button
                  onClick={expandReplies}
                  className="text-xs font-medium text-amber-100 hover:text-amber-500 transition-base"
                >
                  View {loadedReplyCount} {loadedReplyCount === 1 ? "reply" : "replies"}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowReplies(false)}
                    className="text-xs font-medium text-amber-100 hover:text-amber-500 transition-base mb-3"
                  >
                    Hide replies
                  </button>
                  {repliesLoading && loadedReplies.length === 0 ? (
                    <p className="text-xs text-text-muted">Loading replies...</p>
                  ) : (
                    <ReplyList
                      replies={loadedReplies}
                      videoId={videoId}
                      parentId={id}
                      onReplyAdded={handleReplyAdded}
                      onReplyDeleted={deleteReplyLocal}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this comment?"
        description="This will also remove all replies under it. This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </motion.div>
  );
}
