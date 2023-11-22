import { ContentDTO } from "../dtos/ContentDTO";
import { nextRetryDateFromNowPlusRandom } from "../helpers/DateUtils";

export class Content {
    static Schema = {
        name: "Content",
        properties: {
            id: 'id',
            id_configuration: 'id_configuration',
            relatedNewsId: 'relatedNewsId',
            relatedTweetId: 'relatedTweetId',
            relatedScraperItemId: 'relatedScraperItemId',
            relatedCreateAt: 'relatedCreateAt',
            fetchedAt: 'fetchedAt',
            status: 'status',
            content: 'content',
            url: 'url',
            baseUrl: 'baseUrl',
            errors: 'errors',
            retryCounter: 'retryCounter',
            nextRetryAt: 'nextRetryAt'
        },
    };
    readonly id: number
    readonly id_configuration: number
    readonly relatedNewsId: number
    readonly relatedTweetId: number
    readonly relatedScraperItemId: number
    readonly relatedCreateAt: number
    readonly fetchedAt: number
    readonly status: ContentStatus
    readonly content: string
    readonly baseUrl: string // Added: to hold base url for future processing
    readonly url: string // Added: To save url after redirection of baseUrl, can be nil if there is no redirection
    readonly errors: string[]
    readonly retryCounter: number
    readonly nextRetryAt: number

    constructor(
        id: number,
        id_configuration: number,
        relatedNewsId: number,
        relatedTweetId: number,
        relatedCreateAt: number,
        fetchedAt: number,
        status: ContentStatus,
        content: string,
        baseUrl: string,
        url: string | undefined,
        errors: string[],
        retryCounter: number,
        nextRetryAt: number,
        relatedScraperItemId: number
    ) {
        this.id = id;
        this.id_configuration = id_configuration;
        this.relatedNewsId = relatedNewsId;
        this.relatedTweetId = relatedTweetId;
        this.relatedCreateAt = relatedCreateAt;
        this.fetchedAt = fetchedAt;
        this.status = status;
        this.content = content;
        this.baseUrl = baseUrl;
        if (url) {
            this.url = url;
        } else {
            this.url = ""
        }
        this.errors = errors;
        this.retryCounter = retryCounter
        this.nextRetryAt = nextRetryAt
        this.relatedScraperItemId = relatedScraperItemId
    }

    createUpdatedWithUpdatedRetryAndMarkAsError(error: string): Content {
        const newRetryCounter = this.retryCounter + 1;
        this.errors.push(error)
        return new Content(
            this.id,
            this.id_configuration,
            this.relatedNewsId,
            this.relatedTweetId,
            this.relatedCreateAt,
            this.fetchedAt,
            ContentStatus.error,
            this.content,
            this.baseUrl,
            this.url,
            this.errors,
            newRetryCounter,
            nextRetryDateFromNowPlusRandom(newRetryCounter),
            this.relatedScraperItemId
        );
    }

    createUpdatedMarkStatusRetry(): Content {
        return new Content(
            this.id,
            this.id_configuration,
            this.relatedNewsId,
            this.relatedTweetId,
            this.relatedCreateAt,
            this.fetchedAt,
            ContentStatus.retry,
            this.content,
            this.baseUrl,
            this.url,
            this.errors,
            this.retryCounter,
            this.nextRetryAt,
            this.relatedScraperItemId
        );
    }

    static createFromObject(obj: any): Content {
        const id = obj.id;
        const id_configuration = obj.id_configuration;
        const relatedNewsId = obj.relatedNewsId;
        const relatedTweetId = obj.relatedTweetId;
        const relatedCreateAt = obj.relatedCreateAt;
        const fetchedAt = obj.fetchedAt;
        const status = obj.status;
        const content = obj.content;
        const baseUrl = obj.baseUrl;
        const url = obj.url;
        const errors = obj.errors;
        const retryCounter = obj.retryCounter;
        const nextRetryAt = obj.nextRetryAt;
        const relatedScraperItemId = obj.relatedScraperItemId
        return new Content(id, id_configuration, relatedNewsId, relatedTweetId, relatedCreateAt, fetchedAt, status, content, baseUrl, url, errors, retryCounter, nextRetryAt, relatedScraperItemId);
    }

    static createFromDTO(dto: ContentDTO, newId: number): Content {
        return new Content(newId, dto.id_configuration, dto.relatedNewsId, dto.relatedTweetId, dto.relatedCreateAt, dto.fetchedAt, dto.status, dto.content, dto.baseUrl, dto.url, dto.errors, dto.retryCounter, dto.nextRetryAt, dto.relatedScraperItemId);
    }
}

export enum ContentStatus { error, done, retry };