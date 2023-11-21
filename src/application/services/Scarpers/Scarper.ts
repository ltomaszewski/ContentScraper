import { Browser } from "puppeteer";
import { ScraperItemDTO } from "../../dtos/ScraperItemDTO.js";

export interface Scraper {
    scrape(browser: Browser): Promise<ScraperItemDTO[]>;
}