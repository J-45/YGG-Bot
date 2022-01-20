const fs = require('fs');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth') // https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth
puppeteer.use(StealthPlugin())

var dir = "./user_data";
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const options = {
    headless: true,
    ignoreHTTPSErrors: true,
    userDataDir: dir,
    headless: false,
    defaultViewport: {
        width: 1080,
        height: 1920
    }
};

(async () => {

    // const preloadFile = fs.readFileSync('./preload.js', 'utf8');
    const browser = await puppeteer.launch(options);
    const [page] = await browser.pages();
    // await page.evaluateOnNewDocument(preloadFile);
    await page.goto('https://yggtorrent.re/');
    await delay(3000);
    await page.goto('https://www3.yggtorrent.re/engine/search?name=&do=search');
    await delay(60000);
    await browser.close();
})();