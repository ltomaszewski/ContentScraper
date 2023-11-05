import { ContentDTO } from "../dtos/ContentDTO";

export class Content {
    static Schema = {
        name: "Content",
        properties: {
            id: 'id',
            id_configuration: 'id_configuration',
            relatedNewsId: 'relatedNewsId',
            relatedTweetId: 'relatedTweetId',
            status: 'status',
            content: 'content',
            url: 'url',
            baseUrl: 'baseUrl',
            errors: 'errors'
        },
    };
    readonly id: number
    readonly id_configuration: number
    readonly relatedNewsId: number
    readonly relatedTweetId: number
    readonly status: ContentStatus
    readonly content: string
    readonly baseUrl: string // Added: to hold base url for future processing
    readonly url: string | undefined // Added: To save url after redirection of baseUrl, can be nil if there is no redirection
    readonly errors: string[]


    constructor(
        id: number,
        id_configuration: number,
        relatedNewsId: number,
        relatedTweetId: number,
        status: ContentStatus,
        content: string,
        baseUrl: string,
        url: string | undefined,
        errors: string[]
    ) {
        this.id = id;
        this.id_configuration = id_configuration;
        this.relatedNewsId = relatedNewsId;
        this.relatedTweetId = relatedTweetId;
        this.status = status;
        this.content = content;
        this.baseUrl = baseUrl;
        this.url = url;
        this.errors = errors;
    }

    static createFromObject(obj: any): Content {
        const id = obj.id;
        const id_configuration = obj.id_configuration;
        const relatedNewsId = obj.relatedNewsId;
        const relatedTweetId = obj.relatedTweetId;
        const status = obj.status;
        const content = obj.content;
        const baseUrl = obj.baseUrl;
        const url = obj.url;
        const errors = obj.errors;
        return new Content(id, id_configuration, relatedNewsId, relatedTweetId, status, content, baseUrl, url, errors);
    }

    static createFromDTO(dto: ContentDTO, newId: number): Content {
        return new Content(newId, dto.id_configuration, dto.relatedNewsId, dto.relatedTweetId, dto.status, dto.content, dto.baseUrl, dto.url, dto.errors);
    }
}


export enum ContentStatus { created, queued, error, ready };