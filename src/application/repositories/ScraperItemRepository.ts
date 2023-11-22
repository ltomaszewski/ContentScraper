import * as r from 'rethinkdb';
import { ScraperItem } from "../entities/ScraperItem";
import { Repository } from "../interfaces/Repository";
import { DatabaseRepository } from "./DatabaseRepository/DatabaseRepository";

export class ScraperItemRepository implements Repository<ScraperItem> {
    private databaseRepository: DatabaseRepository;
    private databaseName: string;

    constructor(databaseRepository: DatabaseRepository, databaseName: string) {
        this.databaseRepository = databaseRepository;
        this.databaseName = databaseName;
    }

    async insert(entity: ScraperItem) {
        await this.databaseRepository.insert(this.databaseName, ScraperItem.Schema.name, entity);
    }

    async getAll(): Promise<ScraperItem[]> {
        const result = await this.databaseRepository.query(this.databaseName, ScraperItem.Schema.name, (table) => table);
        const rawResult = await result.toArray();
        const scraperItems = rawResult.map((object: any) => ScraperItem.createFromObject(object));
        await result.close();
        return scraperItems;
    }

    async update(entity: ScraperItem) {
        await this.databaseRepository.insert(this.databaseName, ScraperItem.Schema.name, entity);
    }

    async delete(entity: ScraperItem): Promise<void> {
        await this.databaseRepository.delete(this.databaseName, ScraperItem.Schema.name, { id: entity.id });
    }

    async getById(id: number): Promise<ScraperItem | undefined> {
        const result = await this.databaseRepository.query(this.databaseName, ScraperItem.Schema.name, (table) => table.filter({ id: id }));
        const entities = await result.toArray();
        await result.close();
        return entities.length > 0 ? ScraperItem.createFromObject(entities[0]) : undefined;
    }

    async getByUrl(url: string): Promise<ScraperItem | undefined> {
        const result = await this.databaseRepository.query(this.databaseName, ScraperItem.Schema.name, (table) => table.filter({ url: url }));
        const entities = await result.toArray();
        await result.close();
        return entities.length > 0 ? ScraperItem.createFromObject(entities[0]) : undefined;
    }

    async getTheNewestEntity(): Promise<ScraperItem | undefined> {
        try {
            const result = (await this.databaseRepository.query(this.databaseName, ScraperItem.Schema.name, function (table) { return table.orderBy({ index: r.desc('id') }).limit(1); }));
            const entities = await result.toArray()
            await result.close();
            return entities[0];
        } catch {
            return undefined;
        }
    }

    async scraperItemWithForLoop(forLoop: (scraperItem: ScraperItem) => Promise<boolean>, lastFetchedAt: number | undefined) {
        const result = await this.databaseRepository.query(
            this.databaseName,
            ScraperItem.Schema.name,
            function (table) {
                if (lastFetchedAt) {
                    return table
                        .orderBy({ index: r.desc('id') })
                        .filter(r.row('fetchedAt').gt(lastFetchedAt))
                } else {
                    return table
                        .orderBy({ index: r.desc('id') })
                }
            })
        try {
            let nextEntity
            let nextNews
            while (result.hasNext) {
                nextEntity = await result.next();
                nextNews = ScraperItem.createFromObject(nextEntity);
                const shouldStop = await forLoop(nextNews);
                if (shouldStop) {
                    await result.close();
                    return;
                }
            }
        } catch { }
        await result.close()
    }

    async trackChanges(change: (newTweet: ScraperItem | undefined, oldTweet: ScraperItem | undefined, err: Error) => void) {
        await this.databaseRepository
            .changes(
                this.databaseName,
                ScraperItem.Schema.name,
                (new_val, oldVal, err) => {
                    let newTweet: ScraperItem | undefined = undefined;
                    if (new_val) {
                        newTweet = ScraperItem.createFromObject(new_val);
                    }
                    let oldTweet: ScraperItem | undefined = undefined;
                    if (oldVal) {
                        oldTweet = ScraperItem.createFromObject(oldVal);
                    }
                    change(newTweet, oldTweet, err);
                }
            );
    }
}