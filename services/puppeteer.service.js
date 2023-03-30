//const puppeteer = require('puppeteer');

import puppeteer from "puppeteer";

class PuppeteerService {
    browser;
    page;

    async init() {
        console.log("init")
        this.browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--incognito',
                // '--proxy-server=http=194.67.37.90:3128',
                // '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"', //
            ],
             headless: 'new',
        });
    }

    /**
     *
     * @param {string} url
     */
    async goToPage(url) {
        console.log('goToPage', url);
        if (!this.browser) {
            await this.init();
        }
        this.page = await this.browser.newPage();

        await this.page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US',
        });

        await this.page.goto(url, {
            waitUntil: `networkidle0`,
        });
    }

    async close() {
        await this.page.close();
        await this.browser.close();
    }

    /**
     *
     * @param {string} acc Account to crawl
     * @param {number} n Qty of image to fetch
     */
    async getLatestInstagramPostsFromAccount(acc, n = 3) {
        try {
            const url = `https://www.picuki.com/profile/${acc}`;
            await this.goToPage(url);
            //await this.page.waitForTimeout(6000);
            console.log('wait for selector', this.page.url());
            //await this.page.waitForSelector('body');
            await this.page.waitForSelector('.post-image');

            const images = await this.page.evaluate(() => {
                const imgs = document.querySelectorAll('.post-image');
                return Array.from(imgs).map(img => img.src);
            });

            console.log("images", images);
            if(!images || images.length === 0) {
                console.error('No image found');
                return [];
            }
            return images.slice(0, n);
        } catch (error) {
            console.log('Error', error);
            process.exit();
        }
    }
}

const puppeteerService = new PuppeteerService();

export default puppeteerService;
