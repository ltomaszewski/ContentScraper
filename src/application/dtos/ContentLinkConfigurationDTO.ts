export class ContentLinkConfigurationDTO {
    readonly id: number | undefined;
    readonly linkPrefix: string;
    readonly xpath: string;

    constructor(id: number | undefined, linkPrefix: string, xpath: string) {
        this.id = id;
        this.linkPrefix = linkPrefix;
        this.xpath = xpath;
    }

    static createFromObject(obj: any): ContentLinkConfigurationDTO {
        const id = obj.id;
        const linkPrefix = obj.linkPrefix;
        const xpath = obj.xpath;
        return new ContentLinkConfigurationDTO(id, linkPrefix, xpath);
    }
}