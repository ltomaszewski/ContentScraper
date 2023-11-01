import { load } from "cheerio";

export async function getGoogleNewsArticleUrl(feedUrl: string): Promise<string> {
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