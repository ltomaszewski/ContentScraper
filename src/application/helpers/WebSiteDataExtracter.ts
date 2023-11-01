import puppeteer from 'puppeteer';

export async function extractDataFromURLViaPuppeteer(url: string, xpath: string) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            `--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15`
        ]
    });
    const page = await browser.newPage()
    await page.goto(url)

    const selectedContent = await page.$x(xpath);

    if (selectedContent.length > 0) {
        // Get the text content of the selected element
        const innerHTML = await page.evaluate(() => {
            for (const script of document.body.querySelectorAll('script')) script.remove();
            return document.body.innerHTML;
        });

        const content = await page.evaluate(element => element.innerHTML, selectedContent[0]);

        if (content) {
            return removeJavaScriptAndHTML(content)
        }
    } else {
        throw new Error('Element with specified XPath not found.')
    }

    await browser.close();
}

function removeJavaScriptAndHTML(inputString: string): string {
    // Remove JavaScript code
    const withoutJavaScript = inputString.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove HTML code
    const withoutHTML = withoutJavaScript.replace(/<[^>]*>/g, '');

    // Remove new lines and replace them with spaces
    const withoutNewLines = withoutHTML.replace(/\n/g, ' ').replace(/\r/g, ' ');

    return withoutNewLines;
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