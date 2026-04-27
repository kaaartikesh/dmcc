import { MonitoredImage } from "@/lib/mvp-types";
import { inferPlatform } from "@/lib/mvp-intelligence";
import { newId } from "@/lib/mvp-fingerprint";

const samplePool = [
  {
    title: "Fan repost - Match Highlight",
    sourceUrl: "https://example-social.com/post/football-highlight",
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&q=80",
    labels: ["sports", "football", "player", "stadium", "team"],
    views: 18420,
    shares: 980,
  },
  {
    title: "Sports news thumbnail",
    sourceUrl: "https://sports-news.example.com/story/2026/final-recap",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=900&q=80",
    labels: ["sports", "team", "stadium", "crowd"],
    views: 6400,
    shares: 140,
  },
  {
    title: "Unauthorized team logo use",
    sourceUrl: "https://promo-site.example.com/match-day",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&q=80",
    labels: ["logo", "sports", "team", "branding"],
    views: 22500,
    shares: 2100,
  },
  {
    title: "Reddit repost gallery",
    sourceUrl: "https://www.reddit.com/r/soccer/comments/demo_asset_post/",
    imageUrl: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=900&q=80",
    labels: ["sports", "player", "crowd", "stadium"],
    views: 12200,
    shares: 720,
  },
];

export function buildMonitoringDataset(): MonitoredImage[] {
  return samplePool.map((sample, index) => ({
    id: newId(`mon_${index}`),
    sourceUrl: sample.sourceUrl,
    title: sample.title,
    imageUrl: sample.imageUrl,
    platform: inferPlatform(sample.sourceUrl),
    views: sample.views,
    shares: sample.shares,
    fingerprint: {
      hash: Buffer.from(`${sample.title}:${sample.sourceUrl}`).toString("hex").slice(0, 32),
      labels: sample.labels,
    },
  }));
}
