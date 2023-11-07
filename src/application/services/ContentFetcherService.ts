import { ContentDTO } from "../dtos/ContentDTO";
import { ContentStatus } from "../entities/Content";
import { ContentLinkConfiguration } from "../entities/ContentLinkConfiguration";
import { getGoogleNewsArticleUrl } from "../helpers/GoogleUtils";
import { extractDataFromURLViaPuppeteer } from "../helpers/WebSiteDataExtracter";
import { ContentLinkConfigurationService } from "./ContentLinkConfigurationService";
import { ContentService } from "./ContentService";
import { News, NewsAggregatorDatabase } from "./NewsAggregatorDatabase";

export class ContentFetcherService {
    private newsAggregatorDatabase: NewsAggregatorDatabase;
    private contentService: ContentService;
    private contentConfigurationService: ContentLinkConfigurationService;

    private configurations: ContentLinkConfiguration[] = [];

    private queue: ContentRequest[] = [];
    private processChunkSize: number = 10;

    constructor(
        newsAggregatorDatabase: NewsAggregatorDatabase,
        contentService: ContentService,
        contentConfigurationService: ContentLinkConfigurationService
    ) {
        this.newsAggregatorDatabase = newsAggregatorDatabase;
        this.contentService = contentService;
        this.contentConfigurationService = contentConfigurationService;
    }

    async setup() {
        this.configurations = await this.contentConfigurationService.getAll()

        await this.newsAggregatorDatabase.newsWithForLoop(async (news): Promise<boolean> => {
            return this.processNews(news);
        });
        await this.flushQueue();
    }

    private async processNews(news: News): Promise<boolean> {
        const isGoogleNews = this.checkIfUrlIsGoogleNews(news.link)
        const configuration = this.findConfigurationfor(news, isGoogleNews)
        if (configuration) {
            const contentRequest = new ContentRequest(news, configuration, isGoogleNews)
            this.queue.push(contentRequest)
        }

        if (this.queue.length > 10) {
            await this.flushQueue()
            return false
        }
        return false;
    }

    private async flushQueue() {
        const chunks = this.chunkArray(this.queue, this.processChunkSize);

        for (const chunk of chunks) {
            await Promise.all(chunk.map(async (item) => {
                await this.processQueueItem(item);
            }));
        }

        this.queue = []
    }

    private async processQueueItem(item: ContentRequest) {
        const proxyApiKey = "JJh2f83WN2U2iugfCC0D2ppL14Q1TrQGCVNNKw5PdDOYA7cGm5Moz9al6tfz6GKUbJtAqlKWoIQSnZnYA9"
        const proxyPrefix = "https://scraping.narf.ai/api/v1/?api_key=" + proxyApiKey + "&url="
        let url = item.news.link
        if (item.isGoogleNews) {
            url = await getGoogleNewsArticleUrl(url)
            if (!url.startsWith(item.configuration.urlPrefix)) {
                return
            }
        }
        const newUrlWithProxy = proxyPrefix + encodeURIComponent(url);
        const content = await extractDataFromURLViaPuppeteer(newUrlWithProxy, item.configuration.xpaths);
        if (content) {
            const contentDTO = new ContentDTO(item.configuration.id, item.news.id, -1, ContentStatus.done, content, item.news.link, (item.isGoogleNews ? url : ""), [])
            await this.contentService.insert(contentDTO)
        }
    }

    private checkIfUrlIsGoogleNews(url: string): boolean {
        return url.startsWith("https://news.google.com")
    }

    private findConfigurationfor(news: News, isGoogleNews: boolean): ContentLinkConfiguration | undefined {
        for (const configuration of this.configurations) {
            if (isGoogleNews) {
                if (news.title.endsWith(configuration.googleNewsTitleSuffix)) {
                    return configuration
                }
            } else {
                if (news.link.startsWith(configuration.urlPrefix)) {
                    return configuration
                }
            }
        }
    }

    private chunkArray(array: any[], chunkSize: number): any[][] {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
}

class ContentRequest {
    readonly news: News
    readonly configuration: ContentLinkConfiguration
    readonly isGoogleNews: boolean

    constructor(news: News, configuration: ContentLinkConfiguration, isGoogleNews: boolean) {
        this.news = news
        this.configuration = configuration
        this.isGoogleNews = isGoogleNews
    }
}