"use strict";
/**
 * Deduplication Agent
 *
 * Responsibilities:
 * - Generate content hashes for incidents
 * - Detect duplicate incidents across sources
 * - Use fuzzy matching for similar incidents
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeduplicationAgent = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const db_1 = require("../lib/db");
class DeduplicationAgent {
    /**
     * Generate a content hash from title and description
     * This helps identify duplicate incidents even if URLs differ
     */
    generateContentHash(title, description) {
        const content = `${title.toLowerCase().trim()}\n${(description || '').toLowerCase().trim()}`;
        return crypto_js_1.default.SHA256(content).toString();
    }
    /**
     * Normalize URL for comparison
     */
    normalizeUrl(url) {
        try {
            const urlObj = new URL(url);
            // Remove common tracking parameters
            const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'source'];
            paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
            return urlObj.toString().toLowerCase();
        }
        catch {
            return url.toLowerCase();
        }
    }
    /**
     * Check if an incident is a duplicate
     */
    async checkDuplicate(url, title, description) {
        // Check by URL (exact match)
        const normalizedUrl = this.normalizeUrl(url);
        const existsByUrl = await (0, db_1.incidentExistsByUrl)(normalizedUrl);
        if (existsByUrl) {
            return {
                isDuplicate: true,
                reason: 'url',
                existingUrl: normalizedUrl,
            };
        }
        // Check by content hash (similar content, different URL)
        const contentHash = this.generateContentHash(title, description);
        const existsByHash = await (0, db_1.incidentExistsByHash)(contentHash);
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
    async checkDuplicates(items) {
        const results = new Map();
        // Check all items in parallel
        const checks = items.map((item, index) => this.checkDuplicate(item.url, item.title, item.description)
            .then(result => ({
            index,
            result,
            success: true,
        }))
            .catch(() => ({
            index,
            result: { isDuplicate: false },
            success: false,
        })));
        const settled = await Promise.all(checks);
        for (const check of settled) {
            results.set(check.index, check.result);
        }
        return results;
    }
}
exports.DeduplicationAgent = DeduplicationAgent;
