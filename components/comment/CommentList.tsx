"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChatCircleIcon,
  ArrowDownIcon,
  FunnelSimpleIcon,
  CaretDownIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

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

interface Comment {
  id: string;
  body: string;
  author: CommentAuthor;
  createdAt: string;
  likes: number;
  dislikes: number;
  userVote: "LIKE" | "DISLIKE" | null;
  replies: Reply[];
  replyCount: number;
}

interface CommentListProps {
  videoId: string;
}

type SortOption = "newest" | "oldest";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
};

export default function CommentList({ videoId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setSortOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [sortOpen]);

  const fetchComments = useCallback(
    async (appendCursor: string | null) => {
      if (appendCursor) setLoadingMore(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams({
          videoId,
          sort,
          limit: "20",
        });
        if (appendCursor) params.set("cursor", appendCursor);

        const res = await fetch(`/api/comments?${params}`);
        if (res.ok) {
          const data = await res.json();
          const items: Comment[] = data.items ?? [];
          if (appendCursor) {
            setComments((prev) => [...prev, ...items]);
          } else {
            setComments(items);
            setTotalCount(items.length);
          }
          setCursor(data.nextCursor ?? null);
          setHasMore(!!data.nextCursor);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [videoId, sort]
  );

  useEffect(() => {
    fetchComments(null);
  }, [fetchComments]);

  function handleNewComment() {
    fetchComments(null);
  }

  function handleDeleteComment(id: string) {
    setComments((prev) => prev.filter((c) => c.id !== id));
    setTotalCount((c) => Math.max(0, c - 1));
  }

  return (
    <section className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-text-primary tracking-tight">
            Comments
          </h2>
          {totalCount > 0 && (
            <span className="text-xs font-mono text-text-muted bg-bg-hover px-2 py-0.5 rounded-full">
              {totalCount}
            </span>
          )}
        </div>

        <div className="relative" ref={sortRef}>
          <button
            type="button"
            onClick={() => setSortOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-base"
          >
            <FunnelSimpleIcon size={14} />
            <span>{SORT_LABELS[sort]}</span>
            <CaretDownIcon
              size={12}
              className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
                role="listbox"
                className="absolute top-full right-0 mt-1 z-50 min-w-40 origin-top-right bg-bg-surface border border-border-default rounded-lg shadow-xl overflow-hidden"
              >
                {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => {
                  const selected = sort === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        setSort(key);
                        setSortOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-xs font-medium transition-base ${
                        selected
                          ? "text-text-primary bg-bg-hover"
                          : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                      }`}
                    >
                      <span>{SORT_LABELS[key]}</span>
                      {selected && <CheckIcon size={12} weight="bold" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Comment form */}
      <div className="mb-8">
        <CommentForm videoId={videoId} onSubmit={handleNewComment} />
      </div>

      {/* Comment list */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full skeleton shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 skeleton" />
                <div className="h-4 w-full skeleton" />
                <div className="h-4 w-3/4 skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-bg-hover flex items-center justify-center mb-3">
            <ChatCircleIcon size={20} className="text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-secondary">No comments yet</p>
          <p className="text-xs text-text-muted mt-1">Start the conversation</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                id={comment.id}
                body={comment.body}
                author={comment.author}
                videoId={videoId}
                createdAt={comment.createdAt}
                likes={comment.likes}
                dislikes={comment.dislikes}
                userVote={comment.userVote}
                replies={comment.replies}
                replyCount={comment.replyCount}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => fetchComments(cursor)}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-base disabled:opacity-50"
              >
                <ArrowDownIcon size={14} />
                {loadingMore ? "Loading..." : "Load more comments"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
