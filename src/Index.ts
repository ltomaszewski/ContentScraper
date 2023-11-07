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
import { NewsAggregatorDatabase } from "./application/services/NewsAggregatorDatabase";

// Extracting command line arguments
const args = process.argv;

// Creating CLIConfiguration object from the extracted CLI arguments
export const configuration: CLIConfiguration = CLIConfiguration.fromCommandLineArguments(args);

// Logging the configuration details
console.log("Application started with configuration: " + configuration.arg1 + ", environment: " + configuration.env);

const testMode: boolean = false;

(async () => {
    if (testMode) {
        const proxyApiKey = "JJh2f83WN2U2iugfCC0D2ppL14Q1TrQGCVNNKw5PdDOYA7cGm5Moz9al6tfz6GKUbJtAqlKWoIQSnZnYA9"
        const proxyPrefix = "https://scraping.narf.ai/api/v1/?api_key=" + proxyApiKey + "&url="
        const googleNewsUrl = "https://news.google.com/rss/articles/CBMiO2h0dHBzOi8vd3d3LmNic25ld3MuY29tL25ld3MvaXNyYWVsLXdhci1oYW1hcy1ibGlua2VuLWdhemEv0gE_aHR0cHM6Ly93d3cuY2JzbmV3cy5jb20vYW1wL25ld3MvaXNyYWVsLXdhci1oYW1hcy1ibGlua2VuLWdhemEv?oc=5";
        const newUrl = await getGoogleNewsArticleUrl(googleNewsUrl);
        const newUrlWithProxy = proxyPrefix + encodeURIComponent(newUrl);
        const content = await extractDataFromURLViaPuppeteer(newUrlWithProxy, '//*[@id="article-0"]/section');
        if (content) {
            const contentDTO = new ContentDTO(-1, -1, -1, ContentStatus.done, content, googleNewsUrl, newUrl, []);
            console.log(contentDTO.content);
        } else {
            throw new Error("Failed to extract content from URL");
        }
        process.exit()
    }
    // Database connection details
    const databaseName = `${configuration.env}${baseDatabaseName}`;

    // Creating DatabaseRepository instance for database connection
    const databaseRepository = new DatabaseRepository(DatabaseHost, DatabasePort, DatabaseForceDrop);

    //Create NewsAggregatorDatabase Repository for access data
    const newsAggregatorDatabase = new NewsAggregatorDatabase();

    // Establishing connection to the specified database
    await databaseRepository.connect(databaseName);
    await newsAggregatorDatabase.connect();

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

    // await newsAggregatorDatabase.tweetsWithForLoop((tweet) => {
    //     console.log(tweet)
    // })

    await newsAggregatorDatabase.tweetsTrackChanges();

})();

