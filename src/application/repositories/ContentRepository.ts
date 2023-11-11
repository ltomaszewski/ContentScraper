import * as r from 'rethinkdb';
import { Content, ContentStatus } from "../entities/Content";
import { Repository } from "../interfaces/Repository";
import { DatabaseRepository } from "./DatabaseRepository/DatabaseRepository";
import { currentTimeInSeconds } from '../helpers/DateUtils';

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
        await result.close()
        return hasEntity;
    }

    async checkIfEntityWithBaseUrlExists(url: string): Promise<boolean> {
        const result = (await this.databaseRepository.query(this.databaseName, Content.Schema.name, function (table) { return table.filter({ baseUrl: url }); }));
        const hasEntity = (await result.toArray()).length > 0;
        await result.close()
        return hasEntity;
    }

    async getEntityByBaseUrl(baseUrl: string): Promise<Content | undefined> {
        const result = (await this.databaseRepository.query(this.databaseName, Content.Schema.name, function (table) { return table.filter({ baseUrl: baseUrl }); }));
        const entities = await result.toArray()
        await result.close()
        if (entities.length == 0) {
            return undefined
        } else {
            return Content.createFromObject(entities[0]);
        }
    }

    async getTheNewestEntity(): Promise<Content | undefined> {
        try {
            const result = (await this.databaseRepository.query(this.databaseName, Content.Schema.name, function (table) { return table.orderBy({ index: r.desc('id') }).limit(1); }));
            const entities = await result.toArray()
            await result.close();
            return entities[0];
        } catch {
            return undefined
        }
    }

    async getAll(): Promise<Content[]> {
        const result = (await this.databaseRepository.query(this.databaseName, Content.Schema.name, function (table) { return table }))
        const rawResult = await result.toArray()
        const sampleEntities = rawResult.map((object: any) => { return Content.createFromObject(object) })
        await result.close()
        return sampleEntities
    }

    async getAllForRetry(): Promise<Content[]> {
        const result = (await this.databaseRepository
            .query(this.databaseName,
                Content.Schema.name,
                function (table) {
                    return table
                        .filter(r.row(Content.Schema.properties.status).eq(ContentStatus.error))
                        .filter(r.row(Content.Schema.properties.nextRetryAt).gt(0))
                        .filter(r.row(Content.Schema.properties.nextRetryAt).lt(currentTimeInSeconds()));
                }
            )
        )
        const rawResult = await result.toArray()
        const enitities = rawResult.map((object: any) => { return Content.createFromObject(object) })
        await result.close()
        return enitities
    }

    async update(entity: Content) {
        await this.databaseRepository.insert(this.databaseName, Content.Schema.name, entity)
    }

    async delete(entity: Content) {
        await this.databaseRepository.delete(this.databaseName, Content.Schema.name, { id: entity.id })
    }
}