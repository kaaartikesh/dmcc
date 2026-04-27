import { createHash } from "node:crypto";
import { generateFingerprint, newId } from "@/lib/mvp-fingerprint";
import { inferPlatform } from "@/lib/mvp-intelligence";
import { DiscoveredMedia, Fingerprint, SourceConnector } from "@/lib/mvp-types";

type RedditListing = {
  data?: {
    children?: Array<{
      data?: RedditPostData;
    }>;
  };
};

type RedditPostData = {
  id?: string;
  title?: string;
  permalink?: string;
  subreddit?: string;
  link_flair_text?: string;
  ups?: number;
  num_comments?: number;
  created_utc?: number;
  thumbnail?: string;
  preview?: {
    images?: Array<{
      source?: {
        url?: string;
      };
    }>;
  };
};

const DEFAULT_SUBREDDITS = ["soccer", "football", "sports"];

function getRedditSubreddits() {
  return (process.env.REDDIT_SUBREDDITS || DEFAULT_SUBREDDITS.join(","))
    .split(",")
    .map((item) => item.trim().replace(/^r\//i, ""))
    .filter(Boolean)
    .slice(0, 5);
}

function getRedditFetchLimit() {
  const parsed = Number(process.env.REDDIT_FETCH_LIMIT || 8);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 15) : 8;
}

function decodeHtmlUrl(value: string) {
  return value.replace(/&amp;/g, "&");
}

function inferLabelsFromPost(post: RedditPostData | undefined) {
  const text = [post?.title, post?.subreddit, post?.link_flair_text].filter(Boolean).join(" ").toLowerCase();
  const candidates = [
    "sports",
    "football",
    "soccer",
    "stadium",
    "player",
    "team",
    "logo",
    "match",
    "crowd",
    "highlight",
    "jersey",
  ];
  return candidates.filter((label) => text.includes(label)).slice(0, 8);
}

function buildFallbackFingerprint(seed: string, labels: string[]): Fingerprint {
  return {
    hash: createHash("sha256").update(seed).digest("hex"),
    labels,
  };
}

function getPostImageUrl(post: RedditPostData | undefined) {
  const previewUrl = post?.preview?.images?.[0]?.source?.url;
  if (previewUrl) {
    return decodeHtmlUrl(previewUrl);
  }

  const thumbnail = post?.thumbnail;
  if (thumbnail && /^https?:\/\//i.test(thumbnail)) {
    return thumbnail;
  }

  return null;
}

async function buildFingerprintForPost(imageUrl: string, title: string, fallbackSeed: string, fallbackLabels: string[]) {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        "user-agent": "dmcc-monitor/1.0 (+https://dmcc.local)",
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      throw new Error(`Image fetch failed: ${response.status}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    return await generateFingerprint(bytes, "", title);
  } catch {
    return buildFallbackFingerprint(fallbackSeed, fallbackLabels);
  }
}

export async function fetchRedditDiscoveries(connector: SourceConnector): Promise<DiscoveredMedia[]> {
  const platform = inferPlatform(`https://${connector.sourceDomain}`);
  const subreddits = getRedditSubreddits();
  const perSubredditLimit = Math.max(1, Math.floor(getRedditFetchLimit() / Math.max(subreddits.length, 1)));
  const discoveries: DiscoveredMedia[] = [];

  for (const subreddit of subreddits) {
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/new.json?limit=${perSubredditLimit}&raw_json=1`, {
      headers: {
        "user-agent": "dmcc-monitor/1.0 (+https://dmcc.local)",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      continue;
    }

    const json = (await response.json()) as RedditListing;
    for (const child of json.data?.children ?? []) {
      const post = child.data;
      if (!post?.id || !post.title) {
        continue;
      }

      const imageUrl = getPostImageUrl(post);
      if (!imageUrl) {
        continue;
      }

      const sourceUrl = post.permalink ? `https://www.reddit.com${post.permalink}` : imageUrl;
      const labels = inferLabelsFromPost(post);
      const fingerprint = await buildFingerprintForPost(imageUrl, post.title, `${post.id}:${sourceUrl}`, labels);

      discoveries.push({
        id: newId("dis"),
        connectorId: connector.id,
        title: post.title,
        sourceUrl,
        discoveredAt: post.created_utc ? new Date(post.created_utc * 1000).toISOString() : new Date().toISOString(),
        platform,
        imageUrl,
        views: Math.max(0, Number(post.ups ?? 0)),
        shares: Math.max(0, Number(post.num_comments ?? 0)),
        fingerprint,
      });
    }
  }

  return discoveries;
}
