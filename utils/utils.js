const fs = require('fs');
const readline = require('readline');

const processLineByLine = async (filee) => {
    const fileStream = fs.createReadStream(filee);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let sites = [];

    for await (const line of rl) {
        const prod = line.split(" ");
        sites.push({
            url: prod[0],
            targetPrice: Number(prod[1])
        });
    }
    return sites;
}

const returnNewPage = async ({ browser, config }, tag) => {
    return new Promise(async (resolve, reject) =>{
        const page = await browser.newPage();
        await page.setDefaultNavigationTimeout('70000');
        await page.setViewport(config.viewport);
        await page.setUserAgent("notifyme-myntra");

        return resolve({page, tag});
    })
}

module.exports = {
    processLineByLine,
    returnNewPage
}