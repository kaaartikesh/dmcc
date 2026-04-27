"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  FileAudio,
  FileImage,
  FileVideo,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import { MetricCard, PageHeader, PageShell, SectionCard } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/frontend-data";

type UploadFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "uploading" | "done" | "error";
  message?: string;
};

export default function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);

  const uploadOne = useCallback(async (file: File, id: string) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const timer = setInterval(() => {
        setFiles((current) =>
          current.map((item) =>
            item.id === id && item.progress < 92
              ? { ...item, progress: Math.min(item.progress + Math.random() * 18, 92) }
              : item
          )
        );
      }, 220);

      const response = await fetch("/api/assets/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(timer);

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Upload failed");
      }

      setFiles((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, progress: 100, status: "done", message: "Fingerprinted and monitoring" }
            : item
        )
      );
    } catch (error) {
      setFiles((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                progress: 100,
                status: "error",
                message: error instanceof Error ? error.message : "Upload failed",
              }
            : item
        )
      );
    }
  }, []);

  const addFiles = useCallback((list: FileList | File[]) => {
    const batch = Array.from(list);
    const next = batch.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      progress: 0,
      status: "uploading" as const,
    }));

    setFiles((current) => [...next, ...current]);
    next.forEach((item, index) => {
      void uploadOne(batch[index], item.id);
    });
  }, [uploadOne]);

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  };

  const completed = files.filter((file) => file.status === "done").length;
  const removeFile = (id: string) => setFiles((current) => current.filter((file) => file.id !== id));

  return (
    <PageShell>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Protected asset intake"
          title="Register media that matters"
          description="Drop images into the protection pipeline so the system can fingerprint, store, and monitor them across your configured sources."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Queued uploads" value={files.length} hint="Current intake batch" icon={<UploadCloud className="h-5 w-5" />} />
          <MetricCard label="Completed" value={completed} hint="Assets ready for monitoring" icon={<CheckCircle2 className="h-5 w-5" />} tone="positive" />
          <MetricCard label="Supported flow" value="Images" hint="Current backend supports protected image intake" icon={<ShieldCheck className="h-5 w-5" />} />
        </div>

        <SectionCard title="Upload zone" description="Drag files in or browse to add protected images to the monitoring workspace.">
          <motion.label
            htmlFor="file-input"
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            animate={{
              borderColor: dragging ? "var(--color-primary)" : "var(--color-border)",
              backgroundColor: dragging ? "rgba(77, 172, 247, 0.08)" : "rgba(255, 255, 255, 0.01)",
            }}
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border border-dashed px-6 py-16 text-center transition-all duration-200",
              dragging && "shadow-[0_20px_60px_rgba(77,172,247,0.18)]"
            )}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(event) => event.target.files && addFiles(event.target.files)}
            />

            <div className="pointer-events-none absolute inset-0 app-shell-grid opacity-40" />

            <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[0_18px_48px_rgba(77,172,247,0.24)]">
              <UploadCloud className="h-9 w-9" />
            </div>

            <div className="relative mt-6 text-xl font-semibold tracking-tight text-foreground">
              {dragging ? "Release to start protected intake" : "Drop images here or browse your files"}
            </div>
            <div className="relative mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Each upload is fingerprinted and added to your protection layer for downstream matching, case creation, and monitoring.
            </div>

            <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button type="button" size="sm">Browse files</Button>
              <Badge variant="neutral">JPG, PNG, WEBP</Badge>
            </div>
          </motion.label>
        </SectionCard>

        <SectionCard title="Batch activity" description="Track file progress, fingerprinting status, and intake errors.">
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {files.length === 0 ? (
                <div className="rounded-2xl border border-border bg-secondary/45 p-5 text-sm text-muted-foreground">
                  No files in the queue yet. Add a protected image to start monitoring coverage.
                </div>
              ) : null}

              {files.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl border border-border bg-secondary/45 p-4"
                >
                  <div className="flex items-start gap-4">
                    <FileIcon type={file.type} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-sm font-semibold text-foreground">{file.name}</div>
                        <Badge variant={file.status === "done" ? "success" : file.status === "error" ? "danger" : "info"}>
                          {file.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-card">
                        <motion.div
                          animate={{ width: `${file.progress}%` }}
                          transition={{ duration: 0.25 }}
                          className={cn(
                            "h-full rounded-full",
                            file.status === "error"
                              ? "bg-destructive"
                              : file.status === "done"
                                ? "bg-success"
                                : "bg-gradient-to-r from-primary to-accent"
                          )}
                        />
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                          {file.status === "uploading" && `Uploading... ${Math.round(file.progress)}%`}
                          {file.status === "done" && (
                            <span className="inline-flex items-center gap-1 text-success">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {file.message}
                            </span>
                          )}
                          {file.status === "error" && (
                            <span className="inline-flex items-center gap-1 text-destructive">
                              <AlertCircle className="h-3.5 w-3.5" />
                              {file.message}
                            </span>
                          )}
                        </span>
                        <span>{file.type || "image"}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFile(file.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-card hover:text-foreground"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}

function FileIcon({ type }: { type: string }) {
  const Icon = type.startsWith("video") ? FileVideo : type.startsWith("audio") ? FileAudio : FileImage;
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-card">
      <Icon className="h-5 w-5 text-primary" />
    </div>
  );
}
