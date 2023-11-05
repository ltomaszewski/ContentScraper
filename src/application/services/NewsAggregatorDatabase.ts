import { configuration } from "../../Index";
import { DatabaseHost, DatabasePort, baseNewsAggregatorDatabaseName } from "../../config/Constants";
import { DatabaseRepository } from "../repositories/DatabaseRepository/DatabaseRepository";

export class NewsAggregatorDatabase {
    private databaseRepository: DatabaseRepository;
    private databaseName: string;

    constructor() {
        this.databaseName = `${configuration.env}${baseNewsAggregatorDatabaseName}`;
        this.databaseRepository = new DatabaseRepository(DatabaseHost, DatabasePort, false)
    }

    async connect() {
        await this.databaseRepository.connect(this.databaseName, false);
    }

    async tweets(): Promise<Tweet[]> {
        const result = (await this.databaseRepository.query(this.databaseName, Tweet.Schema.name, function (table) { return table }))
        const rawResult = await result.toArray()
        const sampleEntities = rawResult.map((object: any) => { return Tweet.createFromObject(object) })
        result.close()
        return sampleEntities
    }

    async tweetsWithForLoop(forLoop: (tweet: Tweet) => void) {
        const result = (await this.databaseRepository.query(this.databaseName, Tweet.Schema.name, function (table) { return table }))
        while (result.hasNext) {
            const nextEntity = await result.next()
            const nextTweet = Tweet.createFromObject(nextEntity)
            forLoop(nextTweet)
        }
        result.close()
    }

    async news(): Promise<News[]> {
        const result = (await this.databaseRepository.query(this.databaseName, News.Schema.name, function (table) { return table }))
        const rawResult = await result.toArray()
        const sampleEntities = rawResult.map((object: any) => { return News.createFromObject(object) })
        result.close()
        return sampleEntities
    }
}

export class Tweet {
    static Schema = {
        name: "Tweet"
    };

    static createFromObject(object: any): Tweet {
        return new Tweet(object.id, object.androidPackage, object.ticker, object.title, object.text, object.postTime);
    }

    readonly id: number;
    readonly androidPackage: string;
    readonly ticker: string;
    readonly title: string;
    readonly text: string;
    readonly postTime: number;

    constructor(id: number, androidPackage: string, ticker: string, title: string, text: string, postTime: number) {
        this.id = id;
        this.androidPackage = androidPackage;
        this.ticker = ticker;
        this.title = title;
        this.text = text;
        this.postTime = postTime;
    }
}

export class News {
    static Schema = {
        name: "News"
    };

    static createFromObject(object: any): News {
        return new News(
            object.id,
            object.id_source,
            object.fetchedAt,
            object.publicationDate,
            object.title,
            object.description,
            object.link,
            object.tags
        );
    }

    readonly id: number;
    readonly id_source: number;
    readonly fetchedAt: number;
    readonly publicationDate: number;
    readonly title: string;
    readonly description: string;
    readonly link: string;
    readonly tags: string[];

    constructor(
        id: number,
        id_source: number,
        fetchedAt: number,
        publicationDate: number,
        title: string,
        description: string,
        link: string,
        tags: string[]
    ) {
        this.id = id;
        this.id_source = id_source;
        this.fetchedAt = fetchedAt;
        this.publicationDate = publicationDate;
        this.title = title;
        this.description = description;
        this.link = link;
        this.tags = tags;
    }
}