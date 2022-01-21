const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth'); // https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth
puppeteer.use(StealthPlugin());

var dir = "./user_data";
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const options = {
    args: [`--window-size=${1100},${1080}`],
    ignoreHTTPSErrors: true,
    userDataDir: dir,
    headless: false,
    defaultViewport: {
        width: 1100,
        height: 1080
    }
};

(async () => {
    const browser = await puppeteer.launch(options);
    const [page] = await browser.pages();
    await page.goto('https://yggtorrent.re/');
    await page.waitForTimeout(5000)
    await page.goto('https://www3.yggtorrent.re/engine/search?name=&do=search');
    await page.waitForTimeout(1000);
    const html = await page.evaluate(() => {
        return document.documentElement.innerHTML;
    });
    console.log('Torrents data:', html.length);
    const regexp = /<tr>(?:[^>]+>){3}<a href="https:\/\/\w+.yggtorrent(?:[^=]+=){7}"([^"]+)(?:[^>]+>){14}(\d+)(?:[^>]+>){5}([^<]+)<\/td>\s+<td>(\d+)<\/td>\s+<td>(\d+)<\/td>\s+<td>(\d+)<\/td>/gm;
    const result = [...html.matchAll(regexp)];
    result.forEach(element => {
        url = element[1];
        time = element[2];
        size = element[3];
        download = element[4];
        seeds = element[5];
        peers = element[6];
        console.log(`url: ${url}\ntime: ${time}\nsize: ${size}\ndownload: ${download}\nseeds: ${seeds}\npeers: ${peers}\n`);
    });
    
    await browser.close();
})
();
