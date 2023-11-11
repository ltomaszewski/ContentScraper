import { ContentLinkConfiguration } from "../../../entities/ContentLinkConfiguration"
import { News, Tweet } from "../../NewsAggregatorDatabase"

export class ContentRequest {
    readonly news: News | undefined
    readonly tweet: Tweet | undefined
    readonly configuration: ContentLinkConfiguration
    readonly isGoogleNews: boolean
    readonly extractedLinks: string[]
    readonly isRetry: boolean

    constructor(
        news: News | undefined,
        tweet: Tweet | undefined,
        configuration: ContentLinkConfiguration,
        isGoogleNews: boolean,
        extractedLinks: string[],
        isRetry: boolean) {
        this.news = news;
        this.tweet = tweet;
        this.configuration = configuration;
        this.isGoogleNews = isGoogleNews;
        this.extractedLinks = extractedLinks;
        this.isRetry = isRetry
    }

    static removeDuplicateContentRequests(contentRequests: ContentRequest[]): ContentRequest[] {
        const uniqueExtractedLinks: Set<string[]> = new Set();
        const filteredContentRequests: ContentRequest[] = [];

        for (const contentRequest of contentRequests) {
            if (!uniqueExtractedLinks.has(contentRequest.extractedLinks)) {
                uniqueExtractedLinks.add(contentRequest.extractedLinks);
                filteredContentRequests.push(contentRequest);
            }
        }

        return filteredContentRequests;
    }
}