import { Browser } from "puppeteer";
import { Scraper } from "./Scarper";
import { dotEnv } from "../../../config/Constants.js";
import { ScraperItemDTO } from "../../dtos/ScraperItemDTO.js";

export class ReutersScarper implements Scraper {
    private url: string;

    constructor(useProxy: boolean) {
        const url = "https://www.reuters.com/"
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
        await page.goto(this.url, { waitUntil: 'domcontentloaded' });

        const articles = await page.$$eval('[class^="home-page-grid__story"]', (elements) => {
            const uniqueHrefSet = new Set<string>();
            console.log("Extracting article hrefs...");
            // Use Array.from to maintain the order of elements
            return Array.from(elements, (element) => {
                const hrefs = element.querySelectorAll('a[href]');
                const hrefPath = Array.from(hrefs, (href) => href?.getAttribute('href'))
                    .filter((str): str is string => str !== undefined)
                    // Reduce to find the longest string
                    .reduce((a, b) => a.length > b.length ? a : b, "");
                const href = `https://www.reuters.com${hrefPath}`;

                const textContents = element.querySelectorAll('p[data-testid="Body"]');
                const text = Array.from(textContents, (content) => {
                    return content.textContent; // Added return statement
                });

                const textContents2 = element.querySelectorAll(`h3 > a[href*="${hrefPath}"]`);
                const text2 = Array.from(textContents2, (content) => {
                    return content.textContent; // Added return statement
                });


                return { href: href, html: element.innerHTML, textContent: text, textContents2: textContents2 };
            }).filter((attr) => attr !== null);
        });

        console.log(articles);

        // const news = articles.map(article => { return new ScraperItemDTO(article.href, article.title, article.date) });

        return [];
    }
}