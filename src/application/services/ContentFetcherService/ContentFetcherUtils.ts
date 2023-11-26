import { ContentLinkConfiguration } from "../../entities/ContentLinkConfiguration";
import { extractDataFromURLViaPuppeteer } from "../../helpers/WebSiteDataExtracter";
import { News, ScraperItem } from "../NewsAggregatorDatabase";

export function chunkArray(array: any[], chunkSize: number): any[][] {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}

export function findConfigurationfor(news: News, isGoogleNews: boolean, configurations: ContentLinkConfiguration[]): ContentLinkConfiguration | undefined {
    for (const configuration of configurations) {
        if (isGoogleNews && configuration.googleNewsTitleSuffix.length > 0) {
            if (news.title.endsWith(configuration.googleNewsTitleSuffix)) {
                return configuration
            }
        } else {
            for (const urlPrefix of configuration.urlPrefixs) {
                if (news.link.startsWith(urlPrefix)) {
                    return configuration
                }
            }
        }
    }
}

export function findConfigurationWithScarperItem(scarperItem: ScraperItem, configurations: ContentLinkConfiguration[]): ContentLinkConfiguration | undefined {
    for (const configuration of configurations) {
        for (const urlPrefix of configuration.urlPrefixs) {
            if (scarperItem.url.startsWith(urlPrefix)) {
                return configuration
            }
        }
    }
}

export function checkIfUrlIsSupported(configuration: ContentLinkConfiguration, url: string): boolean {
    for (const urlPrefix of configuration.urlPrefixs) {
        if (url.startsWith(urlPrefix)) {
            return true;
        }
    }
    return false
}

export function checkIfUrlIsGoogleNews(url: string): boolean {
    return url.startsWith("https://news.google.com")
}

export async function fetchContentViaPuppeteer(url: string, configuration: ContentLinkConfiguration): Promise<string | undefined> {
    const proxyApiKey = "JJh2f83WN2U2iugfCC0D2ppL14Q1TrQGCVNNKw5PdDOYA7cGm5Moz9al6tfz6GKUbJtAqlKWoIQSnZnYA9"
    const proxyPrefix = "https://scraping.narf.ai/api/v1/?api_key=" + proxyApiKey + "&url="
    const newUrlWithProxy = proxyPrefix + encodeURIComponent(url);
    const content = await extractDataFromURLViaPuppeteer(newUrlWithProxy, configuration.xpaths);
    return content
}