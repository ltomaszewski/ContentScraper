import { load } from "cheerio";
import { randomDelay } from "./DateUtils";

export async function getGoogleNewsArticleUrl(feedUrl: string): Promise<string> {
    await randomDelay();
    const response = await fetch(feedUrl);
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const $ = load(await response.text());
    const newUrl = $('a[rel="nofollow"]').attr("href");
    if (newUrl) {
        return newUrl;
    } else {
        throw new Error("Url not found");
    }
}