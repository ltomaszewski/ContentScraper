import puppeteer from "puppeteer";
import { Scraper } from "./Scarpers/Scarper.js";
import { ScraperItemService } from "./ScraperItemService.js";
import { BankierScraper } from "./Scarpers/BankierScraper.js";
import { TVN24Scraper } from "./Scarpers/TVN24Scraper.js";
import { ReutersScarper } from "./Scarpers/ReutersScarper.js";
import { PAPScarper } from "./Scarpers/PAPScarper.js";
import { TradingEconomicsScarper } from "./Scarpers/TradingEconomicsScarper.js";

export class WebsiteScraperService {
    private scrapers: Scraper[];
    private scraperItemService: ScraperItemService;
    private isRunning: boolean;

    constructor(scraperItemService: ScraperItemService) {
        const bankierScarper = new BankierScraper(false);
        const tvn24Scarper = new TVN24Scraper(false);
        const reutersScarper = new ReutersScarper(false);
        const papScarper = new PAPScarper(false)
        const tradingEconomicsScarper = new TradingEconomicsScarper(false);

        this.scrapers = [bankierScarper, tvn24Scarper, reutersScarper, papScarper, tradingEconomicsScarper];
        this.scraperItemService = scraperItemService;
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        this.runLoop();
    }

    stop() {
        this.isRunning = false;
    }

    private async runLoop() {
        while (this.isRunning) {
            await this.executeScrapers();
            const interval = this.getRandomInterval(11, 15);
            await this.sleep(interval * 60 * 1000);
        }
    }

    private async executeScrapers() {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                `--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15`
            ]
        });
        for (const scraper of this.scrapers) {
            try {
                const items = await scraper.scalp(browser);
                for (const item of items) {
                    try {
                        await this.scraperItemService.insert(item);
                    } catch (error) {
                        console.error(`Error saving item: ${error}`);
                    }
                }
            } catch (error) {
                console.error(`Error executing scraper: ${error}`);
            }
        }
    }

    private getRandomInterval(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}