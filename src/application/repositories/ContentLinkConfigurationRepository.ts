import { ContentLinkConfiguration } from "../entities/ContentLinkConfiguration";
import { Repository } from "../interfaces/Repository";
import { DatabaseRepository } from "./DatabaseRepository/DatabaseRepository";

export class ContentLinkConfigurationRepository implements Repository<ContentLinkConfiguration> {
    private databaseRepository: DatabaseRepository
    private databaseName: string

    constructor(databaseRepository: DatabaseRepository, databaseName: string) {
        this.databaseRepository = databaseRepository
        this.databaseName = databaseName
    }

    async insert(entity: ContentLinkConfiguration) {
        await this.databaseRepository.insert(this.databaseName, ContentLinkConfiguration.Schema.name, entity)
    }

    async getAll(): Promise<ContentLinkConfiguration[]> {
        const result = (await this.databaseRepository.query(this.databaseName, ContentLinkConfiguration.Schema.name, function (table) { return table }))
        const rawResult = await result.toArray()
        const sampleEntities = rawResult.map((object: any) => { return ContentLinkConfiguration.createFromObject(object) })
        result.close()
        return sampleEntities
    }

    async update(entity: ContentLinkConfiguration) {
        await this.databaseRepository.insert(this.databaseName, ContentLinkConfiguration.Schema.name, entity)
    }

    async delete(entity: ContentLinkConfiguration) {
        await this.databaseRepository.delete(this.databaseName, ContentLinkConfiguration.Schema.name, { id: entity.id })
    }
}
