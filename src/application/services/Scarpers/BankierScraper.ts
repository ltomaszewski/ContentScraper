import { Browser } from "puppeteer";
import { Scraper } from "./Scarper";
import { dotEnv } from "../../../config/Constants.js";
import { ScraperItemDTO } from "../../dtos/ScraperItemDTO.js";

export class BankierScraper implements Scraper {
    private url: string;

    constructor(useProxy: boolean) {
        const url = "https://www.bankier.pl/wiadomosc/"
        if (useProxy) {
            const proxyPrefix = "https://scraping.narf.ai/api/v1/?api_key=" + dotEnv.NARF_AI_KEY + "&url="
            const newUrlWithProxy = proxyPrefix + encodeURIComponent(url);
            this.url = newUrlWithProxy
        } else {
            this.url = url;
        }
    }

    async scalp(browser: Browser): Promise<ScraperItemDTO[]> {
        const page = await browser.newPage()
        page.setJavaScriptEnabled(false)
        console.log(`Navigating to ${this.url}...`);
        await page.goto(this.url).catch(e => console.error(e));;

        const articles = await page.evaluate(() => {
            const articleElements = Array.from(document.querySelectorAll('.article'));

            return articleElements.map((articleElement) => {
                const hrefSuffix = articleElement.querySelector('.entry-title a')?.getAttribute('href') || '';
                const href = `https://www.bankier.pl${hrefSuffix}`;
                const date = articleElement.querySelector('.entry-date')?.textContent || '';
                const titleElement = articleElement.querySelector('.entry-title a');
                const title = titleElement?.textContent?.trim().replace(/\s+/g, ' ') || '';

                return { href, date, title };
            });
        });

        const news = articles.map(article => { return new ScraperItemDTO(article.href, article.title, article.date) });

        if (news.length == 0) {
            console.error('BankierScraper empty articles for url ' + this.url);
        }

        return news;
    }
}