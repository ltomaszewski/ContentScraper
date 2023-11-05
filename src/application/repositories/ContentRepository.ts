import * as r from 'rethinkdb';
import { Content } from "../entities/Content";
import { Repository } from "../interfaces/Repository";
import { DatabaseRepository } from "./DatabaseRepository/DatabaseRepository";

export class ContentRepository implements Repository<Content> {
    private databaseRepository: DatabaseRepository;
    private databaseName: string;

    constructor(databaseRepository: DatabaseRepository, databaseName: string) {
        this.databaseRepository = databaseRepository;
        this.databaseName = databaseName;
    }

    async insert(entity: Content) {
        await this.databaseRepository.insert(this.databaseName, Content.Schema.name, entity)
    }

    async checkIfEntityWithUrlExists(url: string): Promise<boolean> {
        const result = (await this.databaseRepository.query(this.databaseName, Content.Schema.name, function (table) { return table.filter({ url: url }); }));
        const hasEntity = (await result.toArray()).length > 0;
        result.close()
        return hasEntity;
    }

    async getTheNewestEntity(): Promise<Content | undefined> {
        try {
            const result = (await this.databaseRepository.query(this.databaseName, Content.Schema.name, function (table) { return table.orderBy({ index: r.desc('id') }).limit(1); }));
            const entities = await result.toArray()
            result.close();
            return entities[0];
        } catch {
            return undefined
        }
    }

    async getAll(): Promise<Content[]> {
        const result = (await this.databaseRepository.query(this.databaseName, Content.Schema.name, function (table) { return table }))
        const rawResult = await result.toArray()
        const sampleEntities = rawResult.map((object: any) => { return Content.createFromObject(object) })
        result.close()
        return sampleEntities
    }

    async update(entity: Content) {
        await this.databaseRepository.insert(this.databaseName, Content.Schema.name, entity)
    }

    async delete(entity: Content) {
        await this.databaseRepository.delete(this.databaseName, Content.Schema.name, { id: entity.id })
    }
}