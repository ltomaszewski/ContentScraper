//Google News is problematic, there is some code on github needs more research, besiade that everything should work great. Fix it first


// Importing CLIConfiguration class for handling Command Line Interface (CLI) arguments
import { getGoogleNewsArticleUrl } from "./application/helpers/GoogleUtils";
import { extractDataFromURLViaPuppeteer } from "./application/helpers/WebSiteDataExtracter";
import { CLIConfiguration } from "./config/CLIConfiguration";

// Extracting command line arguments
const args = process.argv;

// Creating CLIConfiguration object from the extracted CLI arguments
export const configuration: CLIConfiguration = CLIConfiguration.fromCommandLineArguments(args);

// Logging the configuration details
console.log("Application started with configuration: " + configuration.arg1 + ", environment: " + configuration.env);

import cheerio, { load } from 'cheerio';


(async () => {
    const googleNewsUrl = "https://news.google.com/rss/articles/CBMihwFodHRwczovL3d3dy5yZXV0ZXJzLmNvbS9idXNpbmVzcy9oZWFsdGhjYXJlLXBoYXJtYWNldXRpY2Fscy91bmxpa2UtcGZpemVyLW1vZGVybmEtY2FuLW1lZXQtMjAyMy1jb3ZpZC1mb3JlY2FzdC1hbmFseXN0cy1zYXktMjAyMy0xMS0wMS_SAQA?oc=5";
    const newUrl = await getGoogleNewsArticleUrl(googleNewsUrl);
    const content = await extractDataFromURLViaPuppeteer(newUrl, '//*[@id="main-content"]/article/div[1]/div/div/div/div[2]');
    console.log(newUrl)
    console.log(content)
})();

