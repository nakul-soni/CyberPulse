"use strict";
/**
 * News Ingestion Agent
 *
 * Responsibilities:
 * - Fetch RSS feeds from multiple sources
 * - Parse and normalize feed items
 * - Extract structured data (title, content, URL, date)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsIngestionAgent = exports.RSS_SOURCES = void 0;
const rss_parser_1 = __importDefault(require("rss-parser"));
// Global RSS sources configuration
exports.RSS_SOURCES = [
    {
        name: 'The Hacker News',
        url: 'https://feeds.feedburner.com/TheHackersNews',
        enabled: true,
    },
    {
        name: 'BleepingComputer',
        url: 'https://www.bleepingcomputer.com/feed/',
        enabled: true,
    },
    {
        name: 'Krebs on Security',
        url: 'https://krebsonsecurity.com/feed/',
        enabled: true,
    },
    {
        name: 'SecurityWeek',
        url: 'https://www.securityweek.com/rss.xml',
        enabled: true,
    },
    {
        name: 'Dark Reading',
        url: 'https://www.darkreading.com/rss.xml',
        enabled: true,
    },
];
const parser = new rss_parser_1.default({
    timeout: 10000,
    maxRedirects: 5,
});
class NewsIngestionAgent {
    /**
     * Fetch and parse RSS feed from a single source
     */
    async fetchFeed(source) {
        if (!source.enabled) {
            return [];
        }
        try {
            console.log(`📡 Fetching feed: ${source.name}`);
            const feed = await parser.parseURL(source.url);
            const items = [];
            for (const item of feed.items || []) {
                if (!item.link || !item.title) {
                    continue;
                }
                // Parse publication date
                let publishedAt = new Date();
                if (item.pubDate) {
                    publishedAt = new Date(item.pubDate);
                }
                else if (item.isoDate) {
                    publishedAt = new Date(item.isoDate);
                }
                items.push({
                    title: item.title.trim(),
                    description: item.contentSnippet?.trim() || item.description?.trim(),
                    content: item.content?.trim() || item.contentSnippet?.trim(),
                    url: item.link.trim(),
                    publishedAt,
                    source: source.name,
                });
            }
            console.log(`✅ Fetched ${items.length} items from ${source.name}`);
            return items;
        }
        catch (error) {
            console.error(`❌ Error fetching ${source.name}:`, error.message);
            return [];
        }
    }
    /**
     * Fetch all enabled RSS feeds
     */
    async fetchAllFeeds() {
        const allItems = [];
        // Fetch all feeds in parallel
        const fetchPromises = exports.RSS_SOURCES.map(source => this.fetchFeed(source));
        const results = await Promise.allSettled(fetchPromises);
        for (const result of results) {
            if (result.status === 'fulfilled') {
                allItems.push(...result.value);
            }
        }
        return allItems;
    }
}
exports.NewsIngestionAgent = NewsIngestionAgent;
