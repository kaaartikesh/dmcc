import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { MVPDatabase } from "@/lib/mvp-types";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "dmcc.sqlite");
const legacyJsonPath = path.join(dataDir, "mvp-db.json");

const defaultDb: MVPDatabase = {
  assets: [],
  monitoredImages: [],
  detections: [],
  cases: [],
  connectors: [],
  crawlJobs: [],
  discoveries: [],
  compliance: {
    respectRobotsTxt: true,
    maxRequestsPerMinute: 60,
    regionsAllowed: ["US", "EU", "UAE"],
    termsAccepted: true,
  },
};

function openDatabase() {
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA synchronous = NORMAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      image_url TEXT NOT NULL,
      fingerprint_json TEXT NOT NULL,
      ownership_json TEXT
    );

    CREATE TABLE IF NOT EXISTS monitored_images (
      id TEXT PRIMARY KEY,
      source_url TEXT NOT NULL,
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      platform TEXT,
      views INTEGER,
      shares INTEGER,
      fingerprint_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS detections (
      id TEXT PRIMARY KEY,
      asset_id TEXT NOT NULL,
      monitored_image_id TEXT,
      similarity_score INTEGER NOT NULL,
      status TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      detected_at TEXT NOT NULL,
      source_title TEXT NOT NULL,
      source_url TEXT NOT NULL,
      source_image_url TEXT NOT NULL,
      platform TEXT NOT NULL,
      views INTEGER NOT NULL,
      shares INTEGER NOT NULL,
      intelligence_json TEXT NOT NULL,
      threat_score_json TEXT NOT NULL,
      spread_json TEXT NOT NULL,
      case_id TEXT
    );

    CREATE TABLE IF NOT EXISTS cases (
      id TEXT PRIMARY KEY,
      asset_id TEXT NOT NULL,
      detection_ids_json TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      threat_score INTEGER NOT NULL,
      history_json TEXT
    );

    CREATE TABLE IF NOT EXISTS connectors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      source_domain TEXT NOT NULL,
      status TEXT NOT NULL,
      rate_limit_per_min INTEGER NOT NULL,
      last_run_at TEXT
    );

    CREATE TABLE IF NOT EXISTS crawl_jobs (
      id TEXT PRIMARY KEY,
      connector_id TEXT NOT NULL,
      status TEXT NOT NULL,
      started_at TEXT NOT NULL,
      completed_at TEXT,
      discovered_count INTEGER NOT NULL,
      matched_count INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS discoveries (
      id TEXT PRIMARY KEY,
      connector_id TEXT NOT NULL,
      title TEXT NOT NULL,
      source_url TEXT NOT NULL,
      discovered_at TEXT NOT NULL,
      platform TEXT NOT NULL,
      image_url TEXT NOT NULL,
      views INTEGER NOT NULL,
      shares INTEGER NOT NULL,
      fingerprint_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS compliance (
      singleton_id INTEGER PRIMARY KEY CHECK (singleton_id = 1),
      value_json TEXT NOT NULL
    );
  `);
  return db;
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeDetectionStatus(value: unknown): "Unauthorized" | "Review" {
  return value === "Unauthorized" ? "Unauthorized" : "Review";
}

function normalizeRiskLevel(value: unknown): "high" | "medium" | "low" {
  return value === "high" || value === "medium" ? value : "low";
}

function normalizeCaseStatus(value: unknown): "open" | "investigating" | "resolved" {
  return value === "investigating" || value === "resolved" ? value : "open";
}

function normalizeCasePriority(value: unknown): "urgent" | "high" | "normal" {
  return value === "urgent" || value === "high" ? value : "normal";
}

function normalizeConnectorType(value: unknown): "api" | "scraper" | "rss" {
  return value === "scraper" || value === "rss" ? value : "api";
}

function normalizeConnectorStatus(value: unknown): "active" | "paused" | "error" {
  return value === "paused" || value === "error" ? value : "active";
}

function normalizeJobStatus(value: unknown): "queued" | "running" | "completed" | "failed" {
  return value === "queued" || value === "running" || value === "failed" ? value : "completed";
}

function normalizeAiSource(value: unknown): "google-vision" | "gemini" | "heuristic" {
  return value === "google-vision" || value === "gemini" ? value : "heuristic";
}

function mergeWithDefaultDb(partial: Partial<MVPDatabase>): MVPDatabase {
  return {
    ...defaultDb,
    ...partial,
    assets: partial.assets ?? defaultDb.assets,
    monitoredImages: partial.monitoredImages ?? defaultDb.monitoredImages,
    detections: partial.detections ?? defaultDb.detections,
    cases: partial.cases ?? defaultDb.cases,
    connectors: partial.connectors ?? defaultDb.connectors,
    crawlJobs: partial.crawlJobs ?? defaultDb.crawlJobs,
    discoveries: partial.discoveries ?? defaultDb.discoveries,
    compliance: partial.compliance ?? defaultDb.compliance,
  };
}

function tableHasData(db: DatabaseSync, tableName: string) {
  const row = db.prepare(`SELECT EXISTS(SELECT 1 FROM ${tableName} LIMIT 1) AS has_data`).get() as { has_data: number };
  return row.has_data === 1;
}

function writeDatasetSync(db: DatabaseSync, dataset: MVPDatabase) {
  const tx = db.prepare("BEGIN IMMEDIATE");
  const commit = db.prepare("COMMIT");
  const rollback = db.prepare("ROLLBACK");

  const insertAsset = db.prepare(`
    INSERT INTO assets (id, file_name, mime_type, size, created_at, image_url, fingerprint_json, ownership_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertMonitored = db.prepare(`
    INSERT INTO monitored_images (id, source_url, title, image_url, platform, views, shares, fingerprint_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertDetection = db.prepare(`
    INSERT INTO detections (
      id, asset_id, monitored_image_id, similarity_score, status, risk_level, detected_at, source_title, source_url,
      source_image_url, platform, views, shares, intelligence_json, threat_score_json, spread_json, case_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertCase = db.prepare(`
    INSERT INTO cases (
      id, asset_id, detection_ids_json, title, summary, status, priority, created_at, updated_at, threat_score, history_json
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertConnector = db.prepare(`
    INSERT INTO connectors (id, name, type, source_domain, status, rate_limit_per_min, last_run_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertJob = db.prepare(`
    INSERT INTO crawl_jobs (id, connector_id, status, started_at, completed_at, discovered_count, matched_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertDiscovery = db.prepare(`
    INSERT INTO discoveries (id, connector_id, title, source_url, discovered_at, platform, image_url, views, shares, fingerprint_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const upsertCompliance = db.prepare(`
    INSERT INTO compliance (singleton_id, value_json)
    VALUES (1, ?)
    ON CONFLICT(singleton_id) DO UPDATE SET value_json = excluded.value_json
  `);

  try {
    tx.run();
    db.exec(`
      DELETE FROM assets;
      DELETE FROM monitored_images;
      DELETE FROM detections;
      DELETE FROM cases;
      DELETE FROM connectors;
      DELETE FROM crawl_jobs;
      DELETE FROM discoveries;
      DELETE FROM compliance;
    `);

    for (const asset of dataset.assets) {
      insertAsset.run(
        asset.id,
        asset.fileName,
        asset.mimeType,
        asset.size,
        asset.createdAt,
        asset.imageUrl,
        JSON.stringify(asset.fingerprint),
        JSON.stringify(asset.ownershipVerification ?? null),
      );
    }

    for (const image of dataset.monitoredImages) {
      insertMonitored.run(
        image.id,
        image.sourceUrl,
        image.title,
        image.imageUrl,
        image.platform ?? null,
        image.views ?? null,
        image.shares ?? null,
        JSON.stringify(image.fingerprint),
      );
    }

    for (const detection of dataset.detections) {
      insertDetection.run(
        detection.id,
        detection.assetId,
        detection.monitoredImageId ?? null,
        detection.similarityScore,
        detection.status,
        detection.riskLevel,
        detection.detectedAt,
        detection.sourceTitle,
        detection.sourceUrl,
        detection.sourceImageUrl,
        detection.platform,
        detection.views,
        detection.shares,
        JSON.stringify(detection.intelligence),
        JSON.stringify(detection.threatScore),
        JSON.stringify(detection.spread),
        detection.caseId ?? null,
      );
    }

    for (const caseRecord of dataset.cases) {
      insertCase.run(
        caseRecord.id,
        caseRecord.assetId,
        JSON.stringify(caseRecord.detectionIds),
        caseRecord.title,
        caseRecord.summary,
        caseRecord.status,
        caseRecord.priority,
        caseRecord.createdAt,
        caseRecord.updatedAt,
        caseRecord.threatScore,
        JSON.stringify(caseRecord.history ?? []),
      );
    }

    for (const connector of dataset.connectors) {
      insertConnector.run(
        connector.id,
        connector.name,
        connector.type,
        connector.sourceDomain,
        connector.status,
        connector.rateLimitPerMin,
        connector.lastRunAt ?? null,
      );
    }

    for (const job of dataset.crawlJobs) {
      insertJob.run(
        job.id,
        job.connectorId,
        job.status,
        job.startedAt,
        job.completedAt ?? null,
        job.discoveredCount,
        job.matchedCount,
      );
    }

    for (const discovery of dataset.discoveries) {
      insertDiscovery.run(
        discovery.id,
        discovery.connectorId,
        discovery.title,
        discovery.sourceUrl,
        discovery.discoveredAt,
        discovery.platform,
        discovery.imageUrl,
        discovery.views,
        discovery.shares,
        JSON.stringify(discovery.fingerprint),
      );
    }

    upsertCompliance.run(JSON.stringify(dataset.compliance));
    commit.run();
  } catch (error) {
    rollback.run();
    throw error;
  }
}

function bootstrapDatabaseIfNeeded(db: DatabaseSync) {
  const hasAnyData =
    tableHasData(db, "assets") ||
    tableHasData(db, "monitored_images") ||
    tableHasData(db, "detections") ||
    tableHasData(db, "cases") ||
    tableHasData(db, "connectors") ||
    tableHasData(db, "crawl_jobs") ||
    tableHasData(db, "discoveries") ||
    tableHasData(db, "compliance");

  if (hasAnyData) {
    return;
  }

  let seed = defaultDb;
  if (existsSync(legacyJsonPath)) {
    const raw = readFileSync(legacyJsonPath, "utf-8");
    seed = mergeWithDefaultDb(JSON.parse(raw) as Partial<MVPDatabase>);
  }

  writeDatasetSync(db, seed);
}

export async function readDb(): Promise<MVPDatabase> {
  const db = openDatabase();
  try {
    bootstrapDatabaseIfNeeded(db);

    const assets = (db.prepare(`
      SELECT id, file_name, mime_type, size, created_at, image_url, fingerprint_json, ownership_json
      FROM assets
      ORDER BY datetime(created_at) DESC, rowid DESC
    `).all() as Array<Record<string, unknown>>).map((row) => ({
      id: String(row.id),
      fileName: String(row.file_name),
      mimeType: String(row.mime_type),
      size: Number(row.size),
      createdAt: String(row.created_at),
      imageUrl: String(row.image_url),
      fingerprint: parseJson(String(row.fingerprint_json), { hash: "", labels: [] }),
      ownershipVerification: parseJson(row.ownership_json ? String(row.ownership_json) : null, undefined),
    }));

    const monitoredImages = (db.prepare(`
      SELECT id, source_url, title, image_url, platform, views, shares, fingerprint_json
      FROM monitored_images
      ORDER BY rowid DESC
    `).all() as Array<Record<string, unknown>>).map((row) => ({
      id: String(row.id),
      sourceUrl: String(row.source_url),
      title: String(row.title),
      imageUrl: String(row.image_url),
      platform: row.platform ? String(row.platform) : undefined,
      views: row.views == null ? undefined : Number(row.views),
      shares: row.shares == null ? undefined : Number(row.shares),
      fingerprint: parseJson(String(row.fingerprint_json), { hash: "", labels: [] }),
    }));

    const detections = (db.prepare(`
      SELECT *
      FROM detections
      ORDER BY datetime(detected_at) DESC, rowid DESC
    `).all() as Array<Record<string, unknown>>).map((row) => {
      const intelligence = parseJson(String(row.intelligence_json), {
        explanation: [],
        matchingLabels: [],
        semanticSummary: "",
        aiSource: "heuristic",
        ownershipSignals: [],
      });

      return {
        id: String(row.id),
        assetId: String(row.asset_id),
        monitoredImageId: row.monitored_image_id ? String(row.monitored_image_id) : undefined,
        similarityScore: Number(row.similarity_score),
        status: normalizeDetectionStatus(row.status),
        riskLevel: normalizeRiskLevel(row.risk_level),
        detectedAt: String(row.detected_at),
        sourceTitle: String(row.source_title),
        sourceUrl: String(row.source_url),
        sourceImageUrl: String(row.source_image_url),
        platform: String(row.platform),
        views: Number(row.views),
        shares: Number(row.shares),
        intelligence: {
          ...intelligence,
          aiSource: normalizeAiSource(intelligence.aiSource),
        },
        threatScore: parseJson(String(row.threat_score_json), {
          confidence: 0,
          virality: 0,
          platformRisk: 0,
          total: 0,
        }),
        spread: parseJson(String(row.spread_json), []),
        caseId: row.case_id ? String(row.case_id) : undefined,
      };
    });

    const cases = (db.prepare(`
      SELECT *
      FROM cases
      ORDER BY datetime(updated_at) DESC, rowid DESC
    `).all() as Array<Record<string, unknown>>).map((row) => ({
      id: String(row.id),
      assetId: String(row.asset_id),
      detectionIds: parseJson(String(row.detection_ids_json), []),
      title: String(row.title),
      summary: String(row.summary),
      status: normalizeCaseStatus(row.status),
      priority: normalizeCasePriority(row.priority),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      threatScore: Number(row.threat_score),
      history: parseJson(row.history_json ? String(row.history_json) : null, []),
    }));

    const connectors = (db.prepare(`
      SELECT *
      FROM connectors
      ORDER BY rowid ASC
    `).all() as Array<Record<string, unknown>>).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      type: normalizeConnectorType(row.type),
      sourceDomain: String(row.source_domain),
      status: normalizeConnectorStatus(row.status),
      rateLimitPerMin: Number(row.rate_limit_per_min),
      lastRunAt: row.last_run_at ? String(row.last_run_at) : undefined,
    }));

    const crawlJobs = (db.prepare(`
      SELECT *
      FROM crawl_jobs
      ORDER BY datetime(started_at) DESC, rowid DESC
    `).all() as Array<Record<string, unknown>>).map((row) => ({
      id: String(row.id),
      connectorId: String(row.connector_id),
      status: normalizeJobStatus(row.status),
      startedAt: String(row.started_at),
      completedAt: row.completed_at ? String(row.completed_at) : undefined,
      discoveredCount: Number(row.discovered_count),
      matchedCount: Number(row.matched_count),
    }));

    const discoveries = (db.prepare(`
      SELECT *
      FROM discoveries
      ORDER BY datetime(discovered_at) DESC, rowid DESC
    `).all() as Array<Record<string, unknown>>).map((row) => ({
      id: String(row.id),
      connectorId: String(row.connector_id),
      title: String(row.title),
      sourceUrl: String(row.source_url),
      discoveredAt: String(row.discovered_at),
      platform: String(row.platform),
      imageUrl: String(row.image_url),
      views: Number(row.views),
      shares: Number(row.shares),
      fingerprint: parseJson(String(row.fingerprint_json), { hash: "", labels: [] }),
    }));

    const complianceRow = db.prepare("SELECT value_json FROM compliance WHERE singleton_id = 1").get() as
      | { value_json: string }
      | undefined;

    return {
      assets,
      monitoredImages,
      detections,
      cases,
      connectors,
      crawlJobs,
      discoveries,
      compliance: complianceRow ? parseJson(complianceRow.value_json, defaultDb.compliance) : defaultDb.compliance,
    };
  } finally {
    db.close();
  }
}

export async function writeDb(dataset: MVPDatabase): Promise<void> {
  const db = openDatabase();
  try {
    writeDatasetSync(db, mergeWithDefaultDb(dataset));
  } finally {
    db.close();
  }
}
