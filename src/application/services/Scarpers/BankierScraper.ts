import { Browser } from "puppeteer";
import { Scraper } from "./Scarper";

export class BankierScraper implements Scraper {
    private url: string;

    constructor(useProxy: boolean) {
        const url = "https://www.bankier.pl/wiadomosc/"
        if (useProxy) {
            const proxyApiKey = "JJh2f83WN2U2iugfCC0D2ppL14Q1TrQGCVNNKw5PdDOYA7cGm5Moz9al6tfz6GKUbJtAqlKWoIQSnZnYA9"
            const proxyPrefix = "https://scraping.narf.ai/api/v1/?api_key=" + proxyApiKey + "&url="
            const newUrlWithProxy = proxyPrefix + encodeURIComponent(url);
            this.url = newUrlWithProxy
        } else {
            this.url = url;
        }
    }

    async scrape(browser: Browser): Promise<void> {
        const page = await browser.newPage()
        page.setJavaScriptEnabled(false)
        console.log(`Navigating to ${this.url}...`);
        // Navigate to the selected page
        await page.goto(this.url);

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

        console.log(articles)
    }

}
