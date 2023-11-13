import { Browser } from "puppeteer";

// Define the interface for BLABLAScraper
export interface Scraper {
    scrape(browser: Browser): Promise<void>;
}