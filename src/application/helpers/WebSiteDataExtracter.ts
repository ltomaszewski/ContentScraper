import puppeteer, { ElementHandle } from 'puppeteer';
import sanitizeHtml from 'sanitize-html';
import { randomDelay } from './DateUtils';

export async function extractDataFromURLViaPuppeteer(url: string, xpaths: string[]) {
    console.log("extractDataFromURLViaPuppeteer " + url)
    await randomDelay();
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            `--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15`
        ]
    });

    const page = await browser.newPage();
    page.setJavaScriptEnabled(false)
    await page.goto(url)

    let selectedContent: Array<ElementHandle<Node>> = [];
    let xPathIndex = 0
    while (selectedContent.length == 0) {
        const xPath = xpaths[xPathIndex]
        selectedContent = await page.$x(xPath);
        xPathIndex = xPathIndex + 1
    }

    if (selectedContent.length > 0) {
        // Get the text content of the selected element
        const innerHTML = await page.evaluate((element) => {
            for (const script of document.body.querySelectorAll('script')) script.remove();
            for (const script of document.body.querySelectorAll('style')) script.remove();
            // Cast the Node to HTMLElement to access innerHTML property
            const htmlElement = element as HTMLElement;
            return htmlElement.innerHTML;
        }, selectedContent[0]);

        if (innerHTML) {
            await browser.close();
            return removeJavaScriptHTMLAndWhitespace(sanitizeHtml(innerHTML))
        }
    } else {
        await browser.close();
        let source = await page.content();
        return sanitizeHtml(source)
    }

    await browser.close();
}

function removeJavaScriptHTMLAndWhitespace(inputString: string): string {
    // Remove JavaScript code
    const withoutJavaScript = inputString.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove HTML code
    const withoutHTML = withoutJavaScript.replace(/<[^>]*>/g, '');

    // Remove new lines and replace them with spaces
    const withoutNewLines = withoutHTML.replace(/\n/g, ' ').replace(/\r/g, ' ');

    // Remove duplicated whitespace (more than one space) with a single space
    const withoutDuplicatedWhitespace = withoutNewLines.replace(/\s+/g, ' ');

    return withoutDuplicatedWhitespace.trim(); // Trim to remove leading and trailing spaces
}

// This one does not work perfectly, cherrio is more like jQuery and its not so sofisticated as puppeteer
// export async function extractDataFromURLViaCheerio(url: string, xpath: string): Promise<string[]> {
//     try {
//         const response = await axios.get(url);
//         const html = response.data;
//         const $ = load(html);
//         const extractedData: string[] = [];

//         $(xpath).each((index, element) => {
//             extractedData.push($(element).text().trim());
//         });

//         return extractedData;
//     } catch (error) {
//         throw new Error('Error extracting data: ' + error);
//     }
// }