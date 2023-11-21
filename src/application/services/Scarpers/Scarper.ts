import { Browser } from "puppeteer";
import { ScraperItemDTO } from "../../dtos/ScraperItemDTO.js";

export interface Scraper {
    scalp(browser: Browser): Promise<ScraperItemDTO[]>;
}