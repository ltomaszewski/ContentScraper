//Google News is problematic, there is some code on github needs more research, besiade that everything should work great. Fix it first


// Importing CLIConfiguration class for handling Command Line Interface (CLI) arguments
import express from "express";
import { ContentLinkConfigurationRepository } from "./application/repositories/ContentLinkConfigurationRepository";
import { DatabaseRepository } from "./application/repositories/DatabaseRepository/DatabaseRepository";
import { ContentLinkConfigurationService } from "./application/services/ContentLinkConfigurationService";
import { CLIConfiguration } from "./config/CLIConfiguration";
import { DatabaseForceDrop, DatabaseHost, DatabasePort, Env, baseDatabaseName } from "./config/Constants";
import { ContentLinkConfigurationRESTService } from "./application/services/REST/ContentLinkConfigurationRESTService";
import { ContentRepository } from "./application/repositories/ContentRepository";
import { ContentService } from "./application/services/ContentService";
import { ContentRESTService } from "./application/services/REST/ContentRESTService";
import { getGoogleNewsArticleUrl } from "./application/helpers/GoogleUtils";
import { extractDataFromURLViaPuppeteer } from "./application/helpers/WebSiteDataExtracter";
import { ContentDTO } from "./application/dtos/ContentDTO";
import { ContentStatus } from "./application/entities/Content";

// Extracting command line arguments
const args = process.argv;

// Creating CLIConfiguration object from the extracted CLI arguments
export const configuration: CLIConfiguration = CLIConfiguration.fromCommandLineArguments(args);

// Logging the configuration details
console.log("Application started with configuration: " + configuration.arg1 + ", environment: " + configuration.env);

(async () => {
    // Database connection details
    const databaseName = `${configuration.env}${baseDatabaseName}`;

    // Creating DatabaseRepository instance for database connection
    const databaseRepository = new DatabaseRepository(DatabaseHost, DatabasePort, DatabaseForceDrop);

    // Establishing connection to the specified database
    await databaseRepository.connect(databaseName);

    // Creating all repositories and services
    const contentLinkConfigurationRepository = new ContentLinkConfigurationRepository(databaseRepository, databaseName);
    const contentRepository = new ContentRepository(databaseRepository, databaseName);

    const contentLinkConfigurationService = new ContentLinkConfigurationService(contentLinkConfigurationRepository);
    const contentService = new ContentService(contentRepository);

    // Setup REST Server
    const app = express();
    app.use(express.json());

    // Create REST services
    const baseApi = "/api/v1";
    const contentLinkConfigurationRESTService = new ContentLinkConfigurationRESTService(contentLinkConfigurationService);
    const contentRESTService = new ContentRESTService(contentService);
    const PORT = configuration.env == Env.Prod ? 997 : 697

    // Install REST services
    contentLinkConfigurationRESTService.installEndpoints(baseApi, app);
    contentRESTService.installEndpoints(baseApi, app);

    // Start the server
    app.listen(PORT, () => {
        console.log(`REST server is running on port ${PORT}`);
    });

    const googleNewsUrl = "https://news.google.com/rss/articles/CBMiO2h0dHBzOi8vd3d3LmNic25ld3MuY29tL25ld3MvaXNyYWVsLXdhci1oYW1hcy1ibGlua2VuLWdhemEv0gE_aHR0cHM6Ly93d3cuY2JzbmV3cy5jb20vYW1wL25ld3MvaXNyYWVsLXdhci1oYW1hcy1ibGlua2VuLWdhemEv?oc=5";
    const newUrl = await getGoogleNewsArticleUrl(googleNewsUrl);
    const content = await extractDataFromURLViaPuppeteer(newUrl, '//*[@id="article-0"]/section');
    if (content) {
        const contentDTO = new ContentDTO(-1, -1, -1, ContentStatus.ready, content, googleNewsUrl, newUrl, []);
        contentService.insert(contentDTO);
    } else {
        throw new Error("Failed to extract content from URL");
    }
})();

