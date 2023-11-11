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
import { ContentLinkConfigurationDTO } from "./application/dtos/ContentLinkConfigurationDTO";
import { ContentFetcherService } from "./application/services/ContentFetcherService/ContentFetcherService";
import { ContentLinkConfiguration } from "./application/entities/ContentLinkConfiguration";

// Extracting command line arguments
const args = process.argv;

// Creating CLIConfiguration object from the extracted CLI arguments
export const configuration: CLIConfiguration = CLIConfiguration.fromCommandLineArguments(args);

// Logging the configuration details
console.log("Application started with configuration: " + configuration.arg1 + ", environment: " + configuration.env);

const testMode: boolean = false;

(async () => {
    if (testMode) {
        const configurationReuters = new ContentLinkConfiguration(1,
            ["https://www.reuters.com/", "reut.rs"],
            ['//*[@id="main-content"]/article/div[1]/div/div/div/div[2]', '//*[@id="main-content"]/article/div[1]/div'],
            ["reut\\.rs/[a-zA-Z0-9]+"],
            "- Reuters");
        const googleNewsTVN24Configuration = new ContentLinkConfigurationDTO(2,
            ["https://tvn24.pl/"],
            ['//*[@id="main-content"]/article/div[1]/div/div/div/div[2]', '//*[@id="main-content"]/article/div[1]/div', '//*[@id="__next"]/div/div[2]/div/div[2]/article/div[3]/div/div[2]'], // TODO: Create api to update xpaths for specific configuration
            [],
            "- TVN24");

        const polsatNewsConfiguration = new ContentLinkConfigurationDTO(3,
            ["https://www.polsatnews.pl/"],
            ['//*[@id="body"]/div[2]/div[2]/div[1]/div[1]/main/article/div[3]', '//*[@id="body"]/div[2]/div[2]/div[1]/div[1]/main/article/div[2]'],
            [],
            "");

        const googleNewsUSATodayConfiguration = new ContentLinkConfigurationDTO(4,
            ["https://eu.usatoday.com/"],
            ['//*[@id="truncationWrap"]/article'],
            [],
            "- USA TODAY");

        const proxyApiKey = "JJh2f83WN2U2iugfCC0D2ppL14Q1TrQGCVNNKw5PdDOYA7cGm5Moz9al6tfz6GKUbJtAqlKWoIQSnZnYA9"
        const proxyPrefix = "https://scraping.narf.ai/api/v1/?api_key=" + proxyApiKey + "&url="
        const reutersShortLink = "https://reut.rs/49DuZKv"
        const tvn24Link = "https://tvn24.pl/swiat/walki-w-strefie-gazy-najwazniejsze-wydarzenia-ostatnich-godzin-10-listopada-7430512"
        const polsatNewsLink = "https://www.polsatnews.pl/wiadomosc/2023-11-10/jaroslaw-kaczynski-jest-przygotowany-plan-anihilacji-polskiego-panstwa/"
        const googleNewsTVN24 = "https://news.google.com/rss/articles/CBMibmh0dHBzOi8vdHZuMjQucGwvc3dpYXQvd2llbGthLWJyeXRhbmlhLWthcm9sLWlpaS1tb3dhLXRyb25vd2EtamFraWUtc2EtZ2xvd25lLXByYWNlLWJyeXR5anNraWVnby1yemFkdS03NDI2NjQ30gEA?oc=5"
        const googleNewsUSAToday = "https://news.google.com/rss/articles/CBMicWh0dHBzOi8vd3d3LnVzYXRvZGF5LmNvbS9zdG9yeS9uZXdzL3dvcmxkL2lzcmFlbC1oYW1hcy8yMDIzLzExLzA5L2lzcmFlbC1oYW1hcy13YXItZ2F6YS1saXZlLXVwZGF0ZXMvNzE1MTQyNzUwMDcv0gEA?oc=5"
        const encodedGoogleNews = await getGoogleNewsArticleUrl(googleNewsTVN24);
        const newUrlWithProxy = proxyPrefix + encodeURIComponent(googleNewsTVN24) + "&render_js=true";
        console.log(newUrlWithProxy)

        const content = await extractDataFromURLViaPuppeteer(newUrlWithProxy, polsatNewsConfiguration.xpaths);
        console.log(content)

        process.exit()
    }
    process.setMaxListeners(0)

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
    // const polsatNewsConfiguration = new ContentLinkConfigurationDTO(3,
    //     ["https://www.polsatnews.pl/"],
    //     ['//*[@id="body"]/div[2]/div[2]/div[1]/div[1]/main/article/div[3]', '//*[@id="body"]/div[2]/div[2]/div[1]/div[1]/main/article/div[2]'],
    //     [],
    //     "");
    // await contentLinkConfigurationService.insert(polsatNewsConfiguration);
    // console.log(await contentLinkConfigurationService.getAll());

    const contentFetcherService = new ContentFetcherService(newsAggregatorDatabase, contentService, contentLinkConfigurationService);

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

    await contentFetcherService.setup()
})();