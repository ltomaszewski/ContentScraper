import puppeteer, { Browser } from "puppeteer";
import { Scraper } from "./Scarper";
import { randomDelay } from "../../helpers/DateUtils";

export class ScarperRunner {
    async run(scrapers: Scraper[]) {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                `--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15`
            ]
        });
        try {
            for (let scraper of scrapers) {
                await randomDelay();
                await scraper.scrape(browser);
            }
        } finally {
            await browser.close();
        }
    }
}