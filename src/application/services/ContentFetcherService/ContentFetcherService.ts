import { Configuration } from "puppeteer";
import { ContentDTO } from "../../dtos/ContentDTO";
import { ContentStatus } from "../../entities/Content";
import { ContentLinkConfiguration } from "../../entities/ContentLinkConfiguration";
import { getGoogleNewsArticleUrl } from "../../helpers/GoogleUtils";
import { extractDataFromURLViaPuppeteer } from "../../helpers/WebSiteDataExtracter";
import { ContentLinkConfigurationService } from "../ContentLinkConfigurationService";
import { ContentService } from "../ContentService";
import { News, NewsAggregatorDatabase, Tweet } from "../NewsAggregatorDatabase";
import { checkIfUrlIsGoogleNews, checkIfUrlIsSupported, chunkArray, fetchContentViaPuppeteer, findConfigurationfor } from "./ContentFetcherUtils";
import { ContentRequest } from "./model/ContentRequest";

export class ContentFetcherService {
    private newsAggregatorDatabase: NewsAggregatorDatabase;
    private contentService: ContentService;
    private contentConfigurationService: ContentLinkConfigurationService;

    private configurations: ContentLinkConfiguration[] = [];

    private queue: ContentRequest[] = [];
    private processChunkSize: number = 20;
    private isProcessing: boolean = false

    constructor(
        newsAggregatorDatabase: NewsAggregatorDatabase,
        contentService: ContentService,
        contentConfigurationService: ContentLinkConfigurationService
    ) {
        this.newsAggregatorDatabase = newsAggregatorDatabase;
        this.contentService = contentService;
        this.contentConfigurationService = contentConfigurationService;
        setInterval(async () => {
            if (this.isProcessing || this.queue.length == 0) {
                return;
            }
            this.isProcessing = true
            const queueToExecute: ContentRequest[] = [];
            while (this.queue.length > 0) {
                const item = this.queue.shift()
                if (item) {
                    queueToExecute.push(item)
                }
            }
            await this.flushQueue(queueToExecute)
            this.isProcessing = false
        }, 1000);
    }

    async setup() {
        this.configurations = await this.contentConfigurationService.getAll()

        await this.newsAggregatorDatabase.newsWithForLoop(async (news): Promise<boolean> => {
            return this.processNews(news);
        });

        await this.newsAggregatorDatabase.tweetsWithForLoop(async (tweet): Promise<boolean> => {
            return this.processTweet(tweet)
        });

        this.newsAggregatorDatabase
            .newsTrackChanges((newNews, oldNews, err) => {
                if (oldNews === null && newNews) {
                    this.processNews(newNews)
                }
            });

        this.newsAggregatorDatabase
            .tweetsTrackChanges((newTweet, oldTweet, err) => {
                if (oldTweet === null && newTweet) {
                    this.processTweet(newTweet)
                }
            });
    }

    private async processNews(news: News): Promise<boolean> {
        const isContentAlreadyExists = await this.contentService.checkIfContentAlreadyExistsFor(news.link)
        if (isContentAlreadyExists) {
            console.log("News already downloaded " + news)
            return false;
        }
        const isGoogleNews = checkIfUrlIsGoogleNews(news.link)
        const configuration = findConfigurationfor(news, isGoogleNews, this.configurations)
        if (configuration) {
            const contentRequest = new ContentRequest(news, undefined, configuration, isGoogleNews, [])
            this.queue.push(contentRequest)
        }
        return false;
    }

    private async processTweet(tweet: Tweet): Promise<boolean> {
        const extractedLinks: string[] = [];
        let matchedWithConfiguration: ContentLinkConfiguration | undefined
        for (const configuration of this.configurations) {
            for (const linkPatternRegex of configuration.linkPatternRegexs) {
                const regex = new RegExp(linkPatternRegex, "g");
                const matches: RegExpMatchArray | null = tweet.text.match(regex);
                if (matches) {
                    extractedLinks.push(...matches);
                    matchedWithConfiguration = configuration
                }
            }
        }
        if (extractedLinks.length > 0) {
            if (matchedWithConfiguration) {
                const isContentAlreadyExists = await this.contentService.checkIfContentAlreadyExistsFor(extractedLinks[0])
                if (isContentAlreadyExists) {
                    console.log("News already downloaded " + extractedLinks[0])
                    return false;
                }
                const contentRequest = new ContentRequest(undefined, tweet, matchedWithConfiguration, false, extractedLinks)
                this.queue.push(contentRequest)
            }
        }
        return false;
    }

    private async flushQueue(queue: ContentRequest[]) {
        const uniqueQueue = ContentRequest.removeDuplicateContentRequests(queue)
        const chunks = chunkArray(uniqueQueue, this.processChunkSize);

        for (const chunk of chunks) {
            await Promise.all(chunk.map(async (item) => {
                const newsValue = item.news
                const tweetValue = item.tweet
                if (newsValue) {
                    await this.processNewsQueueItem(item, newsValue);
                } else if (tweetValue) {
                    await this.processTweetQueueItem(item, tweetValue);
                }
            }));
        }
    }

    private async processNewsQueueItem(item: ContentRequest, news: News) {
        try {
            let url = news.link
            if (item.isGoogleNews) {
                url = await getGoogleNewsArticleUrl(url)
                if (!checkIfUrlIsSupported(item.configuration, url)) {
                    return
                }
            }
            const content = await fetchContentViaPuppeteer(url, item.configuration)
            if (content) {
                const contentDTO = new ContentDTO(item.configuration.id, news.id, -1, ContentStatus.done, content, news.link, (item.isGoogleNews ? url : ""), [])
                await this.contentService.insert(contentDTO)
            }
        } catch (error: any) {
            const contentDTO = new ContentDTO(item.configuration.id, news.id, -1, ContentStatus.error, "", news.link, (item.isGoogleNews ? news.link : ""), [error])
            await this.contentService.insert(contentDTO)
        }
    }

    private async processTweetQueueItem(item: ContentRequest, tweet: Tweet) {
        console.log("processTweetQueueItem " + item.extractedLinks)
        let url = item.extractedLinks[0]
        try {
            const content = await fetchContentViaPuppeteer("https://" + url, item.configuration)
            if (content) {
                console.log("processTweetQueueItem save content" + item.extractedLinks)
                const contentDTO = new ContentDTO(item.configuration.id, -1, tweet.id, ContentStatus.done, content, url, "", [])
                await this.contentService.insert(contentDTO)
            }
        } catch (error: any) {
            const contentDTO = new ContentDTO(item.configuration.id, -1, tweet.id, ContentStatus.error, "", url, "", [error])
            await this.contentService.insert(contentDTO)
        }
    }
}