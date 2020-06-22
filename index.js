const puppeteer = require('puppeteer');
const { processLineByLine, returnNewPage } = require('./utils/utils');
const { sendEmailNotification, sendWhatsappNotification } = require('./utils/notifications');

//When using json value for SERVICE_ACCOUNTS in .env

const parallelTabs = 5;

const config = {
	launchOptions: {
		headless: true,
		args: ['--no-sandbox']
	},
	viewport: {width: 1920, height: 1080}
}

puppeteer.launch(config.launchOptions).then(async browser => {
	const sites = await processLineByLine('products.txt');
  	const promises=[], total = sites.length;
  	var logs = [];
	let count=0, dcount=0;
	while(count<total){
		let limit = (total-count<parallelTabs)?(total-count):parallelTabs;
		for(let i = 0; i<limit; i++){
			console.log('Page ID Spawned', i);

			promises.push(returnNewPage({ browser, config }, count++)
			.then(async data => {
				const {page, tag: number} = data;
				const {url, targetPrice} = sites[number];

				await page.goto(url);
				await page.waitFor('.pdp-price strong');

				const [price, productName] = await page.evaluate(() => {
					const price = document.querySelector('.pdp-price strong').innerText.replace("Rs. ", "");
					const name = `${document.querySelector('.pdp-title').innerText} ${document.querySelector('.pdp-name').innerText}`;
					return [Number(price), name];
				});

				if(price <= targetPrice){
					console.log(`Price for ${url} is ${price} (less than target price ${targetPrice})`);
					console.log('Sending email & whatsapp notifications');
					await sendEmailNotification(url, price, productName);
					await sendWhatsappNotification(url, price, productName);
				}

				await page.close();
			})
			.catch(err => console.log('Error 100', err)))
		}
		console.log('WAITING FOR',limit, 'PROCESSES TO END');
		await Promise.all(promises)
  	}
	console.log('---Closing Browser---');
  	await browser.close();

});