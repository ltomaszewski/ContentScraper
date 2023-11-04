import { ContentLinkConfigurationDTO } from "../dtos/ContentLinkConfigurationDTO";

export class ContentLinkConfiguration {
    static Schema = {
        name: "ContentLinkConfiguration",
        properties: {
            id: 'id',
            linkPrefix: 'linkPrefix',
            xpath: 'xpath'
        },
    };
    readonly id: number
    readonly linkPrefix: string
    readonly xpath: string


    constructor(id: number, linkPrefix: string, xpath: string) {
        this.id = id
        this.linkPrefix = linkPrefix
        this.xpath = xpath
    }

    static createFromObject(obj: any): ContentLinkConfiguration {
        const id = obj.id;
        const linkPrefix = obj.linkPrefix;
        const xpath = obj.xpath;
        return new ContentLinkConfiguration(id, linkPrefix, xpath);
    }

    static createFromDTO(dto: ContentLinkConfigurationDTO, newId: number): ContentLinkConfiguration {
        return new ContentLinkConfiguration(newId, dto.linkPrefix, dto.xpath);
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