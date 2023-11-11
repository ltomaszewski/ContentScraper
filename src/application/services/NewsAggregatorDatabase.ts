import * as r from 'rethinkdb';
import { configuration } from "../../Index";
import { DatabaseHost, DatabasePort, baseNewsAggregatorDatabaseName } from "../../config/Constants";
import { DatabaseRepository } from "../repositories/DatabaseRepository/DatabaseRepository";

export class NewsAggregatorDatabase {
    private databaseRepository: DatabaseRepository;
    private databaseName: string;

    constructor() {
        this.databaseName = `${baseNewsAggregatorDatabaseName}`;
        this.databaseRepository = new DatabaseRepository(DatabaseHost, DatabasePort, false)
    }

    async connect() {
        await this.databaseRepository.connect(this.databaseName, false);
    }

    async tweets(): Promise<Tweet[]> {
        const result = (await this.databaseRepository.query(this.databaseName, Tweet.Schema.name, function (table) { return table }))
        const rawResult = await result.toArray()
        const sampleEntities = rawResult.map((object: any) => { return Tweet.createFromObject(object) })
        await result.close()
        return sampleEntities
    }

    async tweetsWithForLoop(forLoop: (tweet: Tweet) => Promise<boolean>) {
        const result = (await this.databaseRepository.query(this.databaseName, Tweet.Schema.name, function (table) { return table.orderBy({ index: r.desc('id') }) }))
        try {
            let nextEntity
            let nextTweet
            while (result.hasNext) {
                nextEntity = await result.next()
                nextTweet = Tweet.createFromObject(nextEntity)
                const shouldStop = await forLoop(nextTweet)
                if (shouldStop) {
                    await result.close()
                    return
                }
            }
        } catch { }
        await result.close()
    }

    async news(): Promise<News[]> {
        const result = (await this.databaseRepository.query(this.databaseName, News.Schema.name, function (table) { return table }))
        const rawResult = await result.toArray()
        const sampleEntities = rawResult.map((object: any) => { return News.createFromObject(object) })
        await result.close()
        return sampleEntities
    }

    async newsWithForLoop(forLoop: (news: News) => Promise<boolean>) {
        const result = (await this.databaseRepository.query(this.databaseName, News.Schema.name, function (table) { return table.orderBy({ index: r.desc('id') }) }))
        try {
            let nextEntity
            let nextNews
            while (result.hasNext) {
                nextEntity = await result.next()
                nextNews = News.createFromObject(nextEntity)
                const shouldStop = await forLoop(nextNews)
                if (shouldStop) {
                    await result.close()
                    return
                }
            }
        } catch { }
        await result.close()
    }

    async tweetsTrackChanges(change: (newTweet: Tweet | undefined, oldTweet: Tweet | undefined, err: Error) => void) {
        await this.databaseRepository.changes(this.databaseName, Tweet.Schema.name, (new_val, oldVal, err) => {
            let newTweet: Tweet | undefined = undefined;
            if (new_val) {
                newTweet = Tweet.createFromObject(new_val);
            }
            let oldTweet: Tweet | undefined = undefined;
            if (oldVal) {
                oldTweet = Tweet.createFromObject(oldVal);
            }
            change(newTweet, oldTweet, err);
        });
    }

    async newsTrackChanges(change: (newNews: News | undefined, oldNews: News | undefined, err: Error) => void) {
        await this.databaseRepository.changes(this.databaseName, News.Schema.name, (new_val, oldVal, err) => {
            let newNews: News | undefined = undefined;
            if (new_val) {
                newNews = News.createFromObject(new_val);
            }
            let oldNews: News | undefined = undefined;
            if (oldVal) {
                oldNews = News.createFromObject(oldVal);
            }
            change(newNews, oldNews, err);
        });
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