export class ScraperItem {
    static Schema = {
        name: "ScraperItem",
        properties: {
            url: 'url',
            date: 'date',
            timestamp: 'timestamp',
            title: 'title',
            description: 'description'
        },
    };

    readonly id: number
    readonly url: string;
    readonly date: string;
    readonly timestamp: number;
    readonly title: string;
    readonly description: string;

    constructor(
        id: number,
        url: string,
        title: string | null = null,
        date: string | null = null,
        description: string | null = null
    ) {
        this.id = id;
        this.url = url;
        this.title = title ?? '';
        this.date = date ?? '';
        this.timestamp = ScraperItem.convertToTimestamp(this.date);
        this.description = description ?? '';
    }

    private static convertToTimestamp(dateStr: string): number {
        const date = new Date(dateStr);
        return date.getTime() / 1000;
    }

    static createFromObject(obj: any): ScraperItem {
        return new ScraperItem(
            obj.url,
            obj.title,
            obj.date,
            obj.description
        );
    }

    static createFromDTO(dto: any, newId: number): ScraperItem {
        return new ScraperItem(
            newId,
            dto.url,
            dto.title ?? null,
            dto.date ?? null,
            dto.description ?? null
        );
    }
}
