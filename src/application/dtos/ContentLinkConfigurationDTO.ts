export class ContentLinkConfigurationDTO {
    readonly id: number | undefined;
    readonly urlPrefixs: string[];
    readonly xpaths: string[];
    readonly googleNewsTitleSuffix: string

    constructor(id: number | undefined, urlPrefixs: string[], xpaths: string[], googleNewsTitleSuffix: string) {
        this.id = id;
        this.urlPrefixs = urlPrefixs;
        this.xpaths = xpaths;
        this.googleNewsTitleSuffix = googleNewsTitleSuffix
    }

    static createFromObject(obj: any): ContentLinkConfigurationDTO {
        const id = obj.id;
        const urlPrefixs = obj.urlPrefixs;
        const xpaths = obj.xpaths;
        const googleNewsTitleSuffix = obj.googleNewsTitleSuffix
        return new ContentLinkConfigurationDTO(id, urlPrefixs, xpaths, googleNewsTitleSuffix);
    }
}