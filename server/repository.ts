import Database from 'better-sqlite3';
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { DEFAULT_POLICIES } from '../src/engine/defaultPolicies';
import { PolicyRule, ReviewQueueItem, RuntimeEvent } from '../src/types';

export class ControlPlaneRepository {
  private readonly db: Database.Database;

  public constructor(filename = process.env.SQLITE_DB_PATH || 'controlplane.sqlite') {
    if (filename !== ':memory:') {
      mkdirSync(dirname(resolve(filename)), { recursive: true });
    }
    this.db = new Database(filename);
    this.db.pragma('journal_mode = WAL');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS policies (
        id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS runtime_events (
        id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );
    `);

    const count = this.db.prepare('SELECT COUNT(*) AS count FROM policies').get() as { count: number };
    if (count.count === 0) {
      const insert = this.db.prepare(
        'INSERT INTO policies (id, payload, updated_at) VALUES (@id, @payload, @updated_at)'
      );
      const seed = this.db.transaction(() => {
        for (const policy of DEFAULT_POLICIES) {
          insert.run({
            id: policy.id,
            payload: JSON.stringify(policy),
            updated_at: policy.updatedAt
          });
        }
      });
      seed();
    }
  }

  public listPolicies(): PolicyRule[] {
    return this.db.prepare('SELECT payload FROM policies ORDER BY rowid DESC').all()
      .map(row => JSON.parse((row as { payload: string }).payload) as PolicyRule);
  }

  public createPolicy(policy: PolicyRule): PolicyRule {
    this.db.prepare(
      'INSERT INTO policies (id, payload, updated_at) VALUES (?, ?, ?)'
    ).run(policy.id, JSON.stringify(policy), policy.updatedAt);
    return policy;
  }

  public updatePolicy(id: string, policy: PolicyRule): PolicyRule | undefined {
    const result = this.db.prepare(
      'UPDATE policies SET payload = ?, updated_at = ? WHERE id = ?'
    ).run(JSON.stringify(policy), policy.updatedAt, id);
    return result.changes ? policy : undefined;
  }

  public togglePolicyStatus(id: string): PolicyRule | undefined {
    const current = this.db.prepare('SELECT payload FROM policies WHERE id = ?').get(id) as { payload: string } | undefined;
    if (!current) return undefined;
    const policy = JSON.parse(current.payload) as PolicyRule;
    const updated: PolicyRule = {
      ...policy,
      status: policy.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE',
      updatedAt: new Date().toISOString().substring(0, 16) + ' UTC'
    };
    this.db.prepare('UPDATE policies SET payload = ?, updated_at = ? WHERE id = ?')
      .run(JSON.stringify(updated), updated.updatedAt, id);
    return updated;
  }

  public listEvents(): RuntimeEvent[] {
    return this.db.prepare('SELECT payload FROM runtime_events ORDER BY rowid DESC').all()
      .map(row => JSON.parse((row as { payload: string }).payload) as RuntimeEvent);
  }

  public insertEvent(event: RuntimeEvent): RuntimeEvent {
    this.db.prepare(
      'INSERT OR REPLACE INTO runtime_events (id, payload, timestamp) VALUES (?, ?, ?)'
    ).run(event.id, JSON.stringify(event), event.timestamp);
    return event;
  }

  public updateEvent(id: string, update: Partial<RuntimeEvent>): RuntimeEvent | undefined {
    const current = this.db.prepare('SELECT payload FROM runtime_events WHERE id = ?').get(id) as { payload: string } | undefined;
    if (!current) return undefined;
    const event = { ...(JSON.parse(current.payload) as RuntimeEvent), ...update };
    this.db.prepare('UPDATE runtime_events SET payload = ?, timestamp = ? WHERE id = ?')
      .run(JSON.stringify(event), event.timestamp, id);
    return event;
  }

  public listReviews(): ReviewQueueItem[] {
    return this.db.prepare('SELECT payload FROM reviews ORDER BY rowid DESC').all()
      .map(row => JSON.parse((row as { payload: string }).payload) as ReviewQueueItem);
  }

  public insertReview(review: ReviewQueueItem): ReviewQueueItem {
    this.db.prepare(
      'INSERT OR REPLACE INTO reviews (id, payload, timestamp) VALUES (?, ?, ?)'
    ).run(review.id, JSON.stringify(review), review.timestamp);
    return review;
  }

  public updateReview(id: string, update: Partial<ReviewQueueItem>): ReviewQueueItem | undefined {
    const current = this.db.prepare('SELECT payload FROM reviews WHERE id = ?').get(id) as { payload: string } | undefined;
    if (!current) return undefined;
    const review = { ...(JSON.parse(current.payload) as ReviewQueueItem), ...update };
    this.db.prepare('UPDATE reviews SET payload = ?, timestamp = ? WHERE id = ?')
      .run(JSON.stringify(review), review.timestamp, id);
    return review;
  }

  public close(): void {
    this.db.close();
  }
}
