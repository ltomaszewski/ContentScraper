export class ContentLinkConfigurationDTO {
    readonly id: number | undefined;
    readonly urlPrefix: string;
    readonly xpaths: string[];
    readonly googleNewsTitleSuffix: string

    constructor(id: number | undefined, urlPrefix: string, xpaths: string[], googleNewsTitleSuffix: string) {
        this.id = id;
        this.urlPrefix = urlPrefix;
        this.xpaths = xpaths;
        this.googleNewsTitleSuffix = googleNewsTitleSuffix
    }

    static createFromObject(obj: any): ContentLinkConfigurationDTO {
        const id = obj.id;
        const urlPrefix = obj.urlPrefix;
        const xpaths = obj.xpaths;
        const googleNewsTitleSuffix = obj.googleNewsTitleSuffix
        return new ContentLinkConfigurationDTO(id, urlPrefix, xpaths, googleNewsTitleSuffix);
    }
}