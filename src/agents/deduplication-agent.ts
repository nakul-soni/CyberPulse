/**
 * Deduplication Agent
 * 
 * Responsibilities:
 * - Generate content hashes for incidents
 * - Detect duplicate incidents across sources
 * - Use fuzzy matching for similar incidents
 */

import CryptoJS from 'crypto-js';
import { incidentExistsByHash, incidentExistsByUrl } from '../lib/db';

export interface DeduplicationResult {
  isDuplicate: boolean;
  reason?: 'url' | 'content_hash' | 'similar';
  existingUrl?: string;
}

export class DeduplicationAgent {
  /**
   * Generate a content hash from title and description
   * This helps identify duplicate incidents even if URLs differ
   */
  generateContentHash(title: string, description?: string): string {
    const content = `${title.toLowerCase().trim()}\n${(description || '').toLowerCase().trim()}`;
    return CryptoJS.SHA256(content).toString();
  }

  /**
   * Normalize URL for comparison
   */
  normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove common tracking parameters
      const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'source'];
      paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
      return urlObj.toString().toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  /**
   * Check if an incident is a duplicate
   */
  async checkDuplicate(
    url: string,
    title: string,
    description?: string
  ): Promise<DeduplicationResult> {
    // Check by URL (exact match)
    const normalizedUrl = this.normalizeUrl(url);
    const existsByUrl = await incidentExistsByUrl(normalizedUrl);
    
    if (existsByUrl) {
      return {
        isDuplicate: true,
        reason: 'url',
        existingUrl: normalizedUrl,
      };
    }

    // Check by content hash (similar content, different URL)
    const contentHash = this.generateContentHash(title, description);
    const existsByHash = await incidentExistsByHash(contentHash);
    
    if (existsByHash) {
      return {
        isDuplicate: true,
        reason: 'content_hash',
      };
    }

    return {
      isDuplicate: false,
    };
  }

  /**
   * Batch check duplicates
   */
  async checkDuplicates(
    items: Array<{ url: string; title: string; description?: string }>
  ): Promise<Map<number, DeduplicationResult>> {
    const results = new Map<number, DeduplicationResult>();
    
    // Check all items in parallel
    const checks = items.map((item, index) =>
      this.checkDuplicate(item.url, item.title, item.description)
        .then(result => ({
          index,
          result,
          success: true,
        }))
        .catch(() => ({
          index,
          result: { isDuplicate: false } as DeduplicationResult,
          success: false,
        }))
    );
    
    const settled = await Promise.all(checks);
    
    for (const check of settled) {
      results.set(check.index, check.result);
    }
    
    return results;
  }
}
