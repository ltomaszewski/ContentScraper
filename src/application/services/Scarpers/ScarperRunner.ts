import puppeteer, { Browser } from "puppeteer";
import { Scraper } from "./Scarper";
import { randomDelay, randomScalpDelay } from "../../helpers/DateUtils";
import { ScraperItemDTO } from "../../dtos/ScraperItemDTO.js";

export class ScarperRunner {
    async scalp(scrapers: Scraper[]): Promise<ScraperItemDTO[]> {
        // await randomScalpDelay();
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                `--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15`
            ]
        });
        const result: ScraperItemDTO[] = [];
        try {
            for (let scraper of scrapers) {
                await randomDelay();
                (await scraper.scalp(browser))
                    .forEach((item) => {
                        result.push(item);
                    });
            }
        } finally {
            await browser.close();
            return result;
        }
    }
}