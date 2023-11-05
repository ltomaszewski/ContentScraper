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
    readonly urlPrefix: string
    readonly xpath: string

    constructor(id: number, urlPrefix: string, xpath: string) {
        this.id = id
        this.urlPrefix = urlPrefix
        this.xpath = xpath
    }

    static createFromObject(obj: any): ContentLinkConfiguration {
        const id = obj.id;
        const urlPrefix = obj.urlPrefix;
        const xpath = obj.xpath;
        return new ContentLinkConfiguration(id, urlPrefix, xpath);
    }

    static createFromDTO(dto: ContentLinkConfigurationDTO, newId: number): ContentLinkConfiguration {
        return new ContentLinkConfiguration(newId, dto.urlPrefix, dto.xpath);
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