import { currentTimeInSeconds } from "../helpers/DateUtils.js";

export class ScraperItemDTO {
    readonly url: string;
    readonly date?: string;
    readonly timestamp: number;
    readonly title?: string | null;
    readonly description?: string | null
    readonly fetchedAt: number;

    constructor(url: string, title?: string | null, date?: string | null, description?: string | null) {
        this.url = url;
        this.title = title;
        this.date = date ?? this.getCurrentFormattedDate();
        this.timestamp = this.convertToTimestamp(this.date);
        this.description = description
        this.fetchedAt = currentTimeInSeconds();
    }

    private getCurrentFormattedDate(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = this.padWithZero(now.getMonth() + 1); // JavaScript months are 0-indexed
        const day = this.padWithZero(now.getDate());
        const hours = this.padWithZero(now.getHours());
        const minutes = this.padWithZero(now.getMinutes());

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    private padWithZero(number: number): string {
        return number < 10 ? `0${number}` : number.toString();
    }

    private convertToTimestamp(dateStr: string): number {
        const date = new Date(dateStr);
        return date.getTime() / 1000;
    }

}