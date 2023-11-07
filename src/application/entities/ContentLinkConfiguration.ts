import { ContentLinkConfigurationDTO } from "../dtos/ContentLinkConfigurationDTO";

export class ContentLinkConfiguration {
    static Schema = {
        name: "ContentLinkConfiguration",
        properties: {
            id: 'id',
            urlPrefix: 'urlPrefix',
            xpath: 'xpath'
        },
    };
    readonly id: number
    readonly urlPrefixs: string[]
    readonly xpaths: string[]
    readonly googleNewsTitleSuffix: string // string that indicate the source on the end of title in News stracture

    constructor(id: number, urlPrefixs: string[], xpaths: string[], googleNewsTitleSuffix: string) {
        this.id = id
        this.urlPrefixs = urlPrefixs
        this.xpaths = xpaths
        this.googleNewsTitleSuffix = googleNewsTitleSuffix
    }

    static createFromObject(obj: any): ContentLinkConfiguration {
        const id = obj.id;
        const urlPrefixs = obj.urlPrefixs;
        const xpaths = obj.xpaths;
        const googleNewsTitleSuffix = obj.googleNewsTitleSuffix
        return new ContentLinkConfiguration(id, urlPrefixs, xpaths, googleNewsTitleSuffix);
    }

    static createFromDTO(dto: ContentLinkConfigurationDTO, newId: number): ContentLinkConfiguration {
        return new ContentLinkConfiguration(newId, dto.urlPrefixs, dto.xpaths, dto.googleNewsTitleSuffix);
    }

    static findMaxId(sources: ContentLinkConfiguration[]): number {
        let maxId = 0;
        for (const source of sources) {
            if (source.id > maxId) {
                maxId = source.id;
            }
        }
        return maxId;
    }

    static createNewId(sources: ContentLinkConfiguration[]): number {
        const maxId = ContentLinkConfiguration.findMaxId(sources);
        return maxId + 1;
    }
}