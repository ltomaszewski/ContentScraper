import { getUnixTime } from "date-fns";
import { ContentDTO } from "../../dtos/ContentDTO";
import { ContentStatus } from "../../entities/Content";
import { ContentLinkConfiguration } from "../../entities/ContentLinkConfiguration";
import { getGoogleNewsArticleUrl } from "../../helpers/GoogleUtils";
import { ContentLinkConfigurationService } from "../ContentLinkConfigurationService";
import { ContentService } from "../ContentService";
import { News, NewsAggregatorDatabase, Tweet } from "../NewsAggregatorDatabase";
import { checkIfUrlIsGoogleNews, checkIfUrlIsSupported, chunkArray, fetchContentViaPuppeteer, findConfigurationfor } from "./ContentFetcherUtils";
import { ContentRequest } from "./model/ContentRequest";
import { currentTimeInSeconds, nextRetryDateFromNowPlusRandom } from "../../helpers/DateUtils";
import { configuration } from "../../../Index";
import { Env } from "../../../config/Constants";
import { ScraperItemService } from "../ScraperItemService.js";

export class ContentFetcherService {
    private newsAggregatorDatabase: NewsAggregatorDatabase;
    private contentService: ContentService;
    private contentConfigurationService: ContentLinkConfigurationService;
    private scarperItemService: ScraperItemService;

    private configurations: ContentLinkConfiguration[] = [];

    private queue: ContentRequest[] = [];
    private processChunkSize: number = 3;
    private isProcessing: boolean = false
    private lastProcessingTime: number

    constructor(
        newsAggregatorDatabase: NewsAggregatorDatabase,
        contentService: ContentService,
        contentConfigurationService: ContentLinkConfigurationService,
        scarperItemService: ScraperItemService
    ) {
        this.newsAggregatorDatabase = newsAggregatorDatabase;
        this.contentService = contentService;
        this.contentConfigurationService = contentConfigurationService;
        this.scarperItemService = scarperItemService;
        this.lastProcessingTime = currentTimeInSeconds();
        setInterval(async () => {
            if ((currentTimeInSeconds() - this.lastProcessingTime > 120) && !this.isProcessing) {
                const contentRequestsForContentWithError = await this.contentService.createListOfContentRequestOfContentWithError(this.newsAggregatorDatabase, this.contentConfigurationService)
                for (const contentRequest of contentRequestsForContentWithError) {
                    this.queue.push(contentRequest)
                }
                if (contentRequestsForContentWithError.length == 0) {
                    this.lastProcessingTime = currentTimeInSeconds()
                }
            }

            if ((this.isProcessing || this.queue.length == 0)) { return; }
            this.isProcessing = true
            const queueToExecute: ContentRequest[] = [];
            while (this.queue.length > 0) {
                const item = this.queue.shift()
                if (item) {
                    queueToExecute.push(item)
                }
            }

            await this.flushQueue(queueToExecute)
            this.lastProcessingTime = currentTimeInSeconds()
            this.isProcessing = false
        }, 1000);
    }

    async setup() {
        this.configurations = await this.contentConfigurationService.getAll();
        const theNewestContent = await this.contentService.getTheNewsestEntity();
        let latestFetcheTime = theNewestContent?.fetchedAt;

        if (configuration.env == Env.Dev) [
            latestFetcheTime = currentTimeInSeconds()
        ]

        await this.newsAggregatorDatabase
            .newsWithForLoop(async (news): Promise<boolean> => {
                return this.processNews(news);
            },
                latestFetcheTime);

        await this.newsAggregatorDatabase
            .tweetsWithForLoop(async (tweet): Promise<boolean> => {
                return this.processTweet(tweet)
            },
                latestFetcheTime);

        await this.newsAggregatorDatabase
            .newsTrackChanges((newNews, oldNews, err) => {
                if (oldNews === undefined && newNews) {
                    console.log("NewsTrackChanges " + newNews.link)
                    this.processNews(newNews)
                }
            });

        await this.newsAggregatorDatabase
            .tweetsTrackChanges((newTweet, oldTweet, err) => {
                if (oldTweet === undefined && newTweet) {
                    console.log("TweetsTrackChanges " + newTweet.text)
                    this.processTweet(newTweet)
                }
            });
    }

    private async processNews(news: News): Promise<boolean> {
        const isContentAlreadyExists = await this.contentService.checkIfContentAlreadyExistsFor(news.link)
        if (isContentAlreadyExists) {
            console.log("News already downloaded " + news.link)
            return false;
        }
        const isGoogleNews = checkIfUrlIsGoogleNews(news.link)
        const configuration = findConfigurationfor(news, isGoogleNews, this.configurations)
        if (configuration) {
            const contentRequest = new ContentRequest(news, undefined, undefined, configuration, isGoogleNews, [], false)
            console.log("Added to news queue " + news.link)
            this.queue.push(contentRequest)
        } else {
            console.log("No configuration found for news links " + news.link)
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
                console.log("Added tweet to queue " + extractedLinks)
                const contentRequest = new ContentRequest(undefined, tweet, undefined, matchedWithConfiguration, false, extractedLinks, false)
                this.queue.push(contentRequest)
            }
        } else {
            console.log("No configuration found for tweet text " + tweet.text);
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
        console.log("processNewsQueueItem " + news.link)
        let url = news.link
        try {
            if (item.isGoogleNews) {
                console.log("processNewsQueueItem isGoogleNews" + news.link)
                url = await getGoogleNewsArticleUrl(url)
                if (!checkIfUrlIsSupported(item.configuration, url)) {
                    console.log("processNewsQueueItem not supported google news" + news.link + " url " + url)
                    return
                }
            }
            const content = await fetchContentViaPuppeteer(url, item.configuration)
            if (content) {
                console.log("processNewsQueueItem save content " + news.link)
                const contentDTO = new ContentDTO(
                    item.configuration.id,
                    news.id,
                    -1,
                    news.publicationDate,
                    getUnixTime(new Date()),
                    ContentStatus.done,
                    content,
                    news.link,
                    (item.isGoogleNews ? url : ""),
                    [],
                    0,
                    0,
                    -1
                )
                if (item.isRetry) {
                    await this.contentService.insertAfterRetryAndSuccess(contentDTO)
                } else {
                    await this.contentService.insert(contentDTO)
                }
            }
        } catch (error: any) {
            const contentDTO = new ContentDTO(
                item.configuration.id,
                news.id,
                -1,
                -1,
                getUnixTime(new Date()),
                ContentStatus.error,
                "",
                news.link,
                (item.isGoogleNews ? url : ""),
                [error],
                1,
                nextRetryDateFromNowPlusRandom(1),
                -1
            )
            if (item.isRetry) {
                await this.contentService.insertForRetry(contentDTO)
            } else {
                await this.contentService.insert(contentDTO)
            }
        }
    }

    private async processTweetQueueItem(item: ContentRequest, tweet: Tweet) {
        console.log("processTweetQueueItem " + item.extractedLinks)
        let url = item.extractedLinks[0]
        try {
            const content = await fetchContentViaPuppeteer("https://" + url, item.configuration)
            if (content) {
                console.log("processTweetQueueItem save content " + item.extractedLinks)
                const contentDTO = new ContentDTO(
                    item.configuration.id,
                    -1,
                    tweet.id,
                    tweet.postTime,
                    getUnixTime(new Date()),
                    ContentStatus.done,
                    content,
                    url,
                    "",
                    [],
                    0,
                    0,
                    -1
                )
                if (item.isRetry) {
                    await this.contentService.insertAfterRetryAndSuccess(contentDTO)
                } else {
                    await this.contentService.insert(contentDTO)
                }
            }
        } catch (error: any) {
            const contentDTO = new ContentDTO(
                item.configuration.id,
                -1,
                tweet.id,
                tweet.postTime,
                getUnixTime(new Date()),
                ContentStatus.error,
                "",
                url,
                "",
                [error],
                1,
                nextRetryDateFromNowPlusRandom(1),
                -1
            )
            if (item.isRetry) {
                await this.contentService.insertForRetry(contentDTO)
            } else {
                await this.contentService.insert(contentDTO)
            }
        }
    }
}