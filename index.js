const fs = require('fs');
const puppeteer = require('puppeteer');
const readline = require('readline');
const nodemailer = require('nodemailer');
const serviceAccounts = require('./serviceAccounts.json');

const parallelTabs = 5;

const config = {
	launchOptions: {
		headless: true,
		args: ['--no-sandbox']
	},
	viewport: {width: 1920, height: 1080}
}

const sendNotification = async (url, price, productName) => {
	const transporter = nodemailer.createTransport(serviceAccounts.transport);
 	transporter.verify(function(error, success) {
	   if (error) {
	        console.log('miserable', error);
	   } else {
	        console.log('Server is ready to take our messages');

	        let mailOptions = {
		        from: serviceAccounts.from, // sender address
		        to: serviceAccounts.to, // list of receivers
		        subject: 'Cron: Myntra Notify '+productName, // Subject line,
		        text: 'The Myntra Product '+productName+' URL: '+url+' is available at a price '+price, // plain text body
		        html: 'The Myntra product <b>'+productName+'<br />URL: </b>'+url+' is available at a <b>Rs.'+price+'</b>'// html body
		    };
		    transporter.sendMail(mailOptions, (error, info) => {
		        if (error) {
		            return console.log(error);
		        }
		        console.log('Message sent: %s', info.messageId);
		        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
		    });
	   }
	});
}

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

const returnNewPage = async (browser, num) => {
	return new Promise(async (resolve, reject) =>{
		const page = await browser.newPage();
		return resolve({page, number: num});
	})
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

			promises.push(returnNewPage(browser, count++)
			.then(async data => {
				const {page, number} = data;
				const {url, targetPrice} = sites[number];

				await page.setDefaultNavigationTimeout('70000');
				await page.setViewport(config.viewport);
				await page.setUserAgent("notifyme-myntra");

				await page.goto(url);
				await page.waitFor('.pdp-price strong');

				const [price, productName] = await page.evaluate(() => {
					const el = document.querySelector('.pdp-price strong');
					const price = el.innerText.replace("Rs. ", "");

					const name = document.querySelector('.pdp-title').innerText+' '+document.querySelector('.pdp-name').innerText;

					return [Number(price), name];
				});

				if(price < targetPrice){
					console.log(`Price for ${url} is ${price}`);
					console.log('Sending email');
					await sendNotification(url, price, productName);
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