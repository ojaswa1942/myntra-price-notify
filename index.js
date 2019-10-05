const fs = require('fs');
const puppeteer = require('puppeteer');
const readline = require('readline');

const parallelTabs = 5;

const config = {
	launchOptions: {
		headless: false,
		args: ['--no-sandbox']
	},
	viewport: {width: 1920, height: 1080}
}

async function processLineByLine(filee) {
	const fileStream = fs.createReadStream(filee);
	const rl = readline.createInterface({
		input: fileStream,
		crlfDelay: Infinity
	});

	let sites = [];

	for await (const line of rl) {
		const prod = line.split(" ");
		sites.push({
			
		});
	}
	return sites;
}

const returnNewPage = async (browser, num) => {
	return new Promise(async (resolve, reject) =>{
		const page = await browser.newPage();
		return resolve({page, number: num});
	})
}

puppeteer.launch(config.launchOptions).then(async browser => {
	const sites = await processLineByLine('products.txt');
	console.log(sites);
  	const promises=[], total = sites.length;
  	var logs = [];
	let count=0, dcount=0;
	while(count<total){
		let limit = (total-count<parallelTabs)?(total-count):parallelTabs;
		for(let i = 0; i<limit; i++){
			console.log('Page ID Spawned', i);

			promises.push(returnNewPage(browser, count++)
			.then(async data => {
				const {page, number} = data;
				await page.setDefaultNavigationTimeout('70000');
				await page.setViewport(config.viewport);
				await page.setUserAgent("notifyme-myntra");
				


				await page.waitFor(10000);

				await page.close();
			})
			.catch(err => console.log('Error 100', err)))
		}
		console.log('WAITING FOR',limit, 'PROCESSES TO END');
		await Promise.all(promises)
		console.log('------------------------');
  	}
	console.log('---Closing Browser---');
  	await browser.close();

});