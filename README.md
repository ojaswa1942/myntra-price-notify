# myntra-price-notify
Notifies when price of a product is less than a certain amount

### Installation

- Clone the repo using `git clone https://github.com/ojaswa1942/myntra-price-notify.git`
- Install dependencies using `npm install` or `yarn install`
- In `products.txt`, enter the product pages you want to monitor and the threshold price in the format `url, priceTarget`, one page per line.
- Create/Update `/serviceAccouts.json` or `.env` entering the required SMTP credentials.

### Usage

- Start the application using node `npm start` or `yarn start`, it will launch a puppeteer instance to test for all Myntra products pages in `products.txt`.

- Maximum number of concurrent tests is 5 by default, you can change it by changing the variable `parallelTabs` in `index.js`.

- Setup a CRON for regular monitoring