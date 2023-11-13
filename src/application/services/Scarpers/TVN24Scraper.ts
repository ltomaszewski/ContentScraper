import { Browser } from "puppeteer";
import { Scraper } from "./Scarper";

export class TVN24Scraper implements Scraper {
    private url: string;

    constructor(useProxy: boolean) {
        const url = "https://www.tvn24.pl"
        if (useProxy) {
            const proxyApiKey = "JJh2f83WN2U2iugfCC0D2ppL14Q1TrQGCVNNKw5PdDOYA7cGm5Moz9al6tfz6GKUbJtAqlKWoIQSnZnYA9"
            const proxyPrefix = "https://scraping.narf.ai/api/v1/?api_key=" + proxyApiKey + "&url="
            const newUrlWithProxy = proxyPrefix + encodeURIComponent(url);
            this.url = newUrlWithProxy
        } else {
            this.url = url;
        }
    }

    async scrape(browser: Browser) {
        const page = await browser.newPage()
        page.setJavaScriptEnabled(false)
        console.log(`Navigating to ${this.url}...`);
        // Navigate to the selected page
        await page.goto(this.url);
        // Wait for the required DOM to be rendered
        await page.waitForSelector('.page-content');

        const uniqueAttributes = await page.$$eval('.default-teaser__link', (elements) => {
            const uniqueHrefSet = new Set<string>();

            // Use Array.from to maintain the order of elements
            return Array.from(elements, (element) => {
                const href = element.getAttribute('href');
                let title = element.getAttribute('title');

                // Check if the href is unique before processing
                if (href && !uniqueHrefSet.has(href)) {
                    uniqueHrefSet.add(href);

                    // Remove the prefix "przejdź do " from the title if it exists
                    const prefix = 'przejdź do ';
                    if (title && title.startsWith(prefix)) {
                        title = title.slice(prefix.length);
                    }

                    return { href, title: title || '' };
                }

                // Return null for duplicates to filter them out
                return null;
            }).filter((attr) => attr !== null);
        });

        console.log(uniqueAttributes);
    }
}