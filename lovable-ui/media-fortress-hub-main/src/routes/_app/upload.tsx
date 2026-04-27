import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { UploadCloud, FileVideo, FileImage, FileAudio, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/upload")({
  head: () => ({
    meta: [
      { title: "Upload Assets — DMCC" },
      { name: "description", content: "Upload media assets for fingerprinting and global protection." },
    ],
  }),
  component: UploadPage,
});

interface UploadFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "uploading" | "done" | "error";
}

function UploadPage() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);

  const addFiles = useCallback((list: FileList | File[]) => {
    const next: UploadFile[] = Array.from(list).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      type: f.type || "application/octet-stream",
      progress: 0,
      status: "uploading",
    }));
    setFiles((cur) => [...next, ...cur]);
    next.forEach((f) => simulate(f.id));
  }, []);

  const simulate = (id: string) => {
    let p = 0;
    const t = setInterval(() => {
      p += Math.random() * 18;
      setFiles((cur) =>
        cur.map((x) => {
          if (x.id !== id) return x;
          if (p >= 100) {
            clearInterval(t);
            const fail = Math.random() < 0.08;
            return { ...x, progress: 100, status: fail ? "error" : "done" };
          }
          return { ...x, progress: Math.min(99, p) };
        })
      );
    }, 240);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => setFiles((c) => c.filter((f) => f.id !== id));

  return (
    <div className="px-4 md:px-8 py-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Upload assets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drop files to fingerprint and add them to global monitoring. Supports video, image, audio.
        </p>
      </div>

      <motion.label
        htmlFor="file-input"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        animate={{
          borderColor: dragging ? "var(--color-primary)" : "var(--color-border)",
          backgroundColor: dragging ? "oklch(0.82 0.16 200 / 0.05)" : "transparent",
        }}
        className={cn(
          "relative flex flex-col items-center justify-center cursor-pointer rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors overflow-hidden",
          dragging && "glow-primary"
        )}
      >
        <input
          id="file-input"
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />

        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

        <motion.div
          animate={{ y: dragging ? -4 : 0, scale: dragging ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow"
        >
          <UploadCloud className="h-8 w-8 text-primary-foreground" />
        </motion.div>

        <div className="relative mt-5 text-base font-medium">
          {dragging ? "Release to upload" : "Drop files or click to browse"}
        </div>
        <div className="relative mt-1 text-xs text-muted-foreground">
          MP4 · MOV · MP3 · WAV · PNG · JPG up to 5 GB per file
        </div>

        <div className="relative mt-5 flex gap-2">
          <Button type="button" size="sm" variant="outline">
            Browse files
          </Button>
          <Button type="button" size="sm" variant="ghost">
            Import from URL
          </Button>
        </div>
      </motion.label>

      {/* File list */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {files.map((f) => (
            <motion.div
              key={f.id}
              layout
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <FileIcon type={f.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium truncate">{f.name}</div>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{formatSize(f.size)}</span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-secondary">
                    <motion.div
                      animate={{ width: `${f.progress}%` }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "h-full rounded-full",
                        f.status === "error"
                          ? "bg-destructive"
                          : f.status === "done"
                            ? "bg-success"
                            : "bg-gradient-to-r from-primary to-accent"
                      )}
                    />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>
                      {f.status === "uploading" && `Uploading… ${Math.round(f.progress)}%`}
                      {f.status === "done" && (
                        <span className="inline-flex items-center gap-1 text-success">
                          <CheckCircle2 className="h-3 w-3" /> Fingerprinted & monitoring
                        </span>
                      )}
                      {f.status === "error" && (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <AlertCircle className="h-3 w-3" /> Upload failed — retry
                        </span>
                      )}
                    </span>
                    <span>{f.type}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(f.id)}
                  className="h-8 w-8 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center justify-center"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FileIcon({ type }: { type: string }) {
  const Icon = type.startsWith("video") ? FileVideo : type.startsWith("audio") ? FileAudio : FileImage;
  return (
    <div className="h-10 w-10 shrink-0 rounded-lg bg-secondary flex items-center justify-center">
      <Icon className="h-5 w-5 text-primary" />
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
