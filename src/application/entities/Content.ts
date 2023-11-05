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
            errors: 'errors'
        },
    };
    readonly id: number
    readonly id_configuration: number
    readonly relatedNewsId: number
    readonly relatedTweetId: number
    readonly status: ContentStatus
    readonly content: string
    readonly url: string
    readonly errors: string[]


    constructor(
        id: number,
        id_configuration: number,
        relatedNewsId: number,
        relatedTweetId: number,
        status: ContentStatus,
        content: string,
        url: string,
        errors: string[]
    ) {
        this.id = id;
        this.id_configuration = id_configuration;
        this.relatedNewsId = relatedNewsId;
        this.relatedTweetId = relatedTweetId;
        this.status = status;
        this.content = content;
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
        const url = obj.url;
        const errors = obj.errors;
        return new Content(id, id_configuration, relatedNewsId, relatedTweetId, status, content, url, errors);
    }

    static createFromDTO(dto: ContentDTO, newId: number): Content {
        return new Content(newId, dto.id_configuration, dto.relatedNewsId, dto.relatedTweetId, dto.status, dto.content, dto.url, dto.errors);
    }
}


export enum ContentStatus { created, queued, error, ready };