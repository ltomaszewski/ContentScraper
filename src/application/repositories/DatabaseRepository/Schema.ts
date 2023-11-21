import * as r from 'rethinkdb';
import { DatabaseRepository } from './DatabaseRepository';
import { ContentLinkConfiguration } from '../../entities/ContentLinkConfiguration';
import { Content } from '../../entities/Content';
import { ScraperItem } from '../../entities/ScraperItem.js';

// Schema - responsible for database schema migration
export class Schema {
    databaseName: string
    private databaseRepository: DatabaseRepository

    constructor(databaseName: string, databaseRepository: DatabaseRepository) {
        this.databaseName = databaseName
        this.databaseRepository = databaseRepository
    }

    async updateSchemaIfNeeded(dropAllFirst: boolean = false) {
        if (dropAllFirst) {
            await this.databaseRepository.dropTableIfExists(this.databaseName, ScraperItem.Schema.name)
            await this.databaseRepository.dropTableIfExists(this.databaseName, Content.Schema.name)
            await this.databaseRepository.dropTableIfExists(this.databaseName, ContentLinkConfiguration.Schema.name)
            await this.databaseRepository.dropDatabaseIfExists(this.databaseName)
        }

        await this.databaseRepository.createDatabaseIfNotExists(this.databaseName)
        await this.databaseRepository.createTableIfNotExists(this.databaseName, ContentLinkConfiguration.Schema.name)
        await this.databaseRepository.createTableIfNotExists(this.databaseName, Content.Schema.name)
        await this.databaseRepository.createTableIfNotExists(this.databaseName, ScraperItem.Schema.name)
    }
}