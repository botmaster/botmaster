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
            ],
            headless: 'shell',
            defaultViewport: {
                width:1920,
                height:1080
            }
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

        const ua =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";
        await this.page.setUserAgent(ua);

        await this.page.goto(url, {
            waitUntil: 'domcontentloaded',
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
    async getLatesBlueskyPostsFromAccount(acc, n = 3) {
        try {
            const url = `https://bsky.app/profile/${acc}`;
            console.log('getLatestInstagramPostsFromAccount', url);
            await this.goToPage(url);

            console.log('wait for selector', 'div[role="link"]');
            await this.page.waitForSelector('div[role="link"]', {
                visible: true,
            });

            const images = await this.page.evaluate(() => {
                const imgs = document.querySelectorAll('div[data-expoimage] img');
                const filteredImgs = Array.from(imgs).filter(img => img.src.startsWith( 'https://cdn.bsky.app/img/feed_thumbnail'))
                return filteredImgs.map(img => img.src);
            });

            console.log('images', images);
            if (!images || images.length === 0) {
                console.error('No image found');
                return [];
            }
            return images.slice(0, n);
        } catch (error) {
            console.log('Error -> ', error);
            process.exit();
        }
    }
}

const puppeteerService = new PuppeteerService();


export default puppeteerService;
