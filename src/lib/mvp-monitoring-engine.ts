import { createHash } from "node:crypto";
import { enrichDetectionWithAI } from "@/lib/mvp-ai";
import { buildDetectionFromSource, inferPlatform } from "@/lib/mvp-intelligence";
import { newId } from "@/lib/mvp-fingerprint";
import { readDb, writeDb } from "@/lib/mvp-db";
import { fetchRedditDiscoveries } from "@/lib/reddit-connector";
import { CrawlJob, DiscoveredMedia, SourceConnector } from "@/lib/mvp-types";

const defaultConnectors: Array<Omit<SourceConnector, "id" | "lastRunAt">> = [
  { name: "Reddit Live Feed", type: "api", sourceDomain: "reddit.com", status: "active", rateLimitPerMin: 30 },
  { name: "YouTube Thumbnail Watch", type: "api", sourceDomain: "youtube.com", status: "paused", rateLimitPerMin: 20 },
  { name: "Forums Scraper", type: "scraper", sourceDomain: "sportsforums.example", status: "active", rateLimitPerMin: 20 },
  { name: "Marketplace Tracker", type: "scraper", sourceDomain: "resale.example", status: "paused", rateLimitPerMin: 15 },
];

function syntheticFingerprint(title: string, source: string, labels: string[]) {
  return {
    hash: createHash("sha256").update(`${title}-${source}`).digest("hex").slice(0, 64),
    labels,
  };
}

function simulateDiscoveries(connector: SourceConnector): DiscoveredMedia[] {
  const platform = inferPlatform(`https://${connector.sourceDomain}`);
  const candidates = connector.sourceDomain.includes("reddit")
    ? [
        {
          title: "Reddit match-day repost thread",
          url: `https://${connector.sourceDomain}/r/soccer/comments/a1/protected_media/`,
          labels: ["sports", "player", "stadium", "team"],
          imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&q=80",
          views: 9200,
          shares: 540,
        },
        {
          title: "Fan collage with team crest",
          url: `https://${connector.sourceDomain}/r/football/comments/a2/team_crest_post/`,
          labels: ["logo", "team", "branding", "sports"],
          imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&q=80",
          views: 15500,
          shares: 830,
        },
      ]
    : [
        {
          title: "Match highlight repost",
          url: `https://${connector.sourceDomain}/watch/a1`,
          labels: ["sports", "match", "player", "stadium"],
          imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=900&q=80",
          views: 34400,
          shares: 2500,
        },
        {
          title: "Team logo compilation",
          url: `https://${connector.sourceDomain}/clip/a2`,
          labels: ["logo", "team", "sports", "branding"],
          imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&q=80",
          views: 22800,
          shares: 1900,
        },
      ];

  return candidates.map((candidate) => ({
    id: newId("dis"),
    connectorId: connector.id,
    title: candidate.title,
    sourceUrl: candidate.url,
    discoveredAt: new Date().toISOString(),
    platform,
    imageUrl: candidate.imageUrl,
    views: candidate.views,
    shares: candidate.shares,
    fingerprint: syntheticFingerprint(candidate.title, candidate.url, candidate.labels),
  }));
}

async function collectDiscoveries(connector: SourceConnector) {
  if (connector.sourceDomain.includes("reddit.com")) {
    return fetchRedditDiscoveries(connector);
  }
  return simulateDiscoveries(connector);
}

export async function ensureConnectors() {
  const db = await readDb();
  if (db.connectors.length === 0) {
    db.connectors = defaultConnectors.map((connector) => ({
      ...connector,
      id: newId("con"),
    }));
    await writeDb(db);
  }
  return db;
}

export async function runCrawlForConnector(connectorId: string) {
  const db = await ensureConnectors();
  const connector = db.connectors.find((item) => item.id === connectorId);
  if (!connector) {
    throw new Error("Connector not found");
  }

  const job: CrawlJob = {
    id: newId("job"),
    connectorId,
    status: "running",
    startedAt: new Date().toISOString(),
    discoveredCount: 0,
    matchedCount: 0,
  };
  db.crawlJobs.unshift(job);

  try {
    const discoveries = await collectDiscoveries(connector);
    db.discoveries.unshift(...discoveries);
    job.discoveredCount = discoveries.length;

    let matched = 0;
    for (const discovery of discoveries) {
      for (const asset of db.assets) {
        const detection = buildDetectionFromSource({
          asset,
          sourceTitle: discovery.title,
          sourceUrl: discovery.sourceUrl,
          sourceImageUrl: discovery.imageUrl,
          sourceFingerprint: discovery.fingerprint,
          detectedAt: discovery.discoveredAt,
          views: discovery.views,
          shares: discovery.shares,
          threshold: 75,
          aiSource: asset.fingerprint.labels.length > 0 ? "google-vision" : "heuristic",
        });

        if (detection) {
          matched += 1;
          db.detections.unshift(await enrichDetectionWithAI(asset, detection));
        }
      }
    }

    job.matchedCount = matched;
    job.status = "completed";
    job.completedAt = new Date().toISOString();
    connector.lastRunAt = new Date().toISOString();

    await writeDb(db);
    return { job, discoveries };
  } catch (error) {
    job.status = "failed";
    job.completedAt = new Date().toISOString();
    connector.status = "error";
    connector.lastRunAt = new Date().toISOString();
    await writeDb(db);
    throw error;
  }
}

export async function runGlobalMonitoringCycle() {
  const db = await ensureConnectors();
  const activeConnectors = db.connectors.filter((item) => item.status === "active");
  const results = [];
  for (const connector of activeConnectors) {
    try {
      results.push(await runCrawlForConnector(connector.id));
    } catch (error) {
      results.push({
        error: error instanceof Error ? error.message : "Connector run failed",
        connectorId: connector.id,
      });
    }
  }
  return results;
}
