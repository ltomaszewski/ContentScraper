import { DatabaseHost, DatabasePort, Env, baseDatabaseName } from "../../../config/Constants";
import { ContentLinkConfigurationRepository } from "../../repositories/ContentLinkConfigurationRepository";
import { ContentRepository } from "../../repositories/ContentRepository";
import { DatabaseRepository } from "../../repositories/DatabaseRepository/DatabaseRepository";
import express from "express";

export class ImportRESTService {
    private databaseName: string;
    private databaseRepository: DatabaseRepository;

    constructor(databaseName: string, databaseRespository: DatabaseRepository) {
        this.databaseName = databaseName;
        this.databaseRepository = databaseRespository;
    }

    installEndpoints(basePath: string, app: express.Application) {
        app.get(basePath + "/import/dev", async (req, res) => {
            try {
                await this.importContentConfigurationFromDevelopmentDataIfNeed();
                await this.importContentFromDevelopmentDataIfNeed();
                res.sendStatus(204);
            } catch (error: any) {
                res.status(400).json({ error: error.message });
            }
        });
    }

    async importContentConfigurationFromDevelopmentDataIfNeed() {
        const developDatabaseName = `${Env.Dev}${baseDatabaseName}`;
        const developDatabase = new DatabaseRepository(DatabaseHost, DatabasePort, false);
        await developDatabase.connect(developDatabaseName);

        const prodContentLinkconfigurationRepository = new ContentLinkConfigurationRepository(this.databaseRepository, this.databaseName);
        const developContentLinkconfigurationRepository = new ContentLinkConfigurationRepository(developDatabase, developDatabaseName);

        const developConfigurations = (await developContentLinkconfigurationRepository.getAll())

        for (let developConfiguration of developConfigurations) {
            await prodContentLinkconfigurationRepository.insert(developConfiguration);
        }
    }

    async importContentFromDevelopmentDataIfNeed() {
        const developDatabaseName = `${Env.Dev}${baseDatabaseName}`;
        const developDatabase = new DatabaseRepository(DatabaseHost, DatabasePort, false);
        await developDatabase.connect(developDatabaseName);

        const prodContentRepository = new ContentRepository(this.databaseRepository, this.databaseName);
        const developContentRepository = new ContentRepository(developDatabase, developDatabaseName);

        const developContents = await developContentRepository.getAll()

        for (let developContent of developContents) {
            try {
                await prodContentRepository.insert(developContent);
            } catch {
                console.log("Error " + developContent.id)
            }
        }
    }
}
