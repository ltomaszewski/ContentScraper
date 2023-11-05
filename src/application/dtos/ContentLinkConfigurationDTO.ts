export class ContentLinkConfigurationDTO {
    readonly id: number | undefined;
    readonly urlPrefix: string;
    readonly xpath: string;

    constructor(id: number | undefined, urlPrefix: string, xpath: string) {
        this.id = id;
        this.urlPrefix = urlPrefix;
        this.xpath = xpath;
    }

    static createFromObject(obj: any): ContentLinkConfigurationDTO {
        const id = obj.id;
        const urlPrefix = obj.urlPrefix;
        const xpath = obj.xpath;
        return new ContentLinkConfigurationDTO(id, urlPrefix, xpath);
    }
}