import { ContentStatus } from "../entities/Content";

export class ContentDTO {
    readonly id_configuration: number;
    readonly relatedNewsId: number;
    readonly relatedTweetId: number;
    readonly relatedCreateAt: number;
    readonly fetchedAt: number;
    readonly status: ContentStatus;
    readonly content: string;
    readonly baseUrl: string; // Added: To save original url before any redirection
    readonly url: string | undefined; // Added: To save url after redirection of baseUrl, can be nil if there is no redirection
    readonly errors: string[];
    readonly retryCounter: number;
    readonly nextRetryAt: number;

    constructor(id_configuration: number,
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
        nextRetryAt: number) {
        this.id_configuration = id_configuration;
        this.relatedNewsId = relatedNewsId;
        this.relatedTweetId = relatedTweetId;
        this.relatedCreateAt = relatedCreateAt;
        this.fetchedAt = fetchedAt;
        this.status = status;
        this.content = content;
        this.baseUrl = baseUrl;
        this.url = url;
        this.errors = errors;
        this.retryCounter = retryCounter
        this.nextRetryAt = nextRetryAt
    }

    static createFromObject(obj: any): ContentDTO {
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
        return new ContentDTO(
            id_configuration,
            relatedNewsId,
            relatedTweetId,
            relatedCreateAt,
            fetchedAt,
            status,
            content,
            baseUrl,
            url,
            errors,
            retryCounter,
            nextRetryAt);
    }
}