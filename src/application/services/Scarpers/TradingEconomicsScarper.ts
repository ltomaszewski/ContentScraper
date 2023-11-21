import { Browser } from "puppeteer";
import { Scraper } from "./Scarper";
import { dotEnv } from "../../../config/Constants.js";
import { ScraperItemDTO } from "../../dtos/ScraperItemDTO.js";

export class TradingEconomicsScarper implements Scraper {
    private url: string;

    constructor(useProxy: boolean) {
        const url = "https://tradingeconomics.com"
        if (useProxy) {
            const proxyPrefix = "https://scraping.narf.ai/api/v1/?api_key=" + dotEnv.NARF_AI_KEY + "&url="
            const newUrlWithProxy = proxyPrefix + encodeURIComponent(url);
            this.url = newUrlWithProxy
        } else {
            this.url = url;
        }
    }

    async scrape(browser: Browser): Promise<ScraperItemDTO[]> {
        const page = await browser.newPage()
        page.setJavaScriptEnabled(false)
        console.log(`Navigating to ${this.url}...`);
        await page.goto(this.url);

        const articles = await page.evaluate(() => {
            const articleElements = Array.from(document.querySelectorAll('.home-tile-outside'));

            return articleElements.map((articleElement) => {
                const hrefSuffix = articleElement.querySelector('a[href]')?.getAttribute('href') || '';
                const href = `https://tradingeconomics.com${hrefSuffix}`;
                const text = articleElement.querySelector('a[href]')?.querySelector('div.home-tile-inside > b')?.textContent;
                const textDescription = articleElement.querySelectorAll('a[href]')[0]?.querySelectorAll('div.home-tile-description')[0].textContent;

                return { href, text, textDescription };
            });
        });

        const news = articles.map(article => { return new ScraperItemDTO(article.href, article.text, null, article.textDescription) });

        return news;
    }

}
