import { ContentDTO } from "../application/dtos/ContentDTO";
import { ContentStatus } from "../application/entities/Content";
import { getGoogleNewsArticleUrl } from "../application/helpers/GoogleUtils";
import { extractDataFromURLViaPuppeteer } from "../application/helpers/WebSiteDataExtracter";

test('async works', async () => {
    let promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve("done!"), 1000)
    });
    const promiseResult = await promise;
    expect(promiseResult).toBe("done!");
}, 10000)