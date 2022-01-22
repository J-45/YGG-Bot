const proc = require('child_process');
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
        width: 1100, height: 1080
    }
};

(async () => {
    console.log("        -= YGG B0T =-\n");
    console.log("♪┏(・o･)┛♪┗ ( ･o･) ┓♪┏(・o･)┛\n");
    const browser = await puppeteer.launch(options);
    const [page] = await browser.pages();
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: './torrents/'});
    await page.goto('https://yggtorrent.re/');
    await page.waitForTimeout(5000)

    proc.exec('aria2c -v', function callback(error, stdout, stderr) {
        console.log(stdout);
    });

    while (true) {
        await page.goto('https://www3.yggtorrent.re/engine/search?do=search');
        await page.waitForTimeout(1000);
        const html = await page.evaluate(() => {
            return document.documentElement.innerHTML;
        });
        const regexp = /<tr>(?:[^>]+>){3}<a href="https:\/\/\w+.yggtorrent(?:[^=]+=){7}"([^"]+)(?:[^>]+>){14}(\d+)(?:[^>]+>){5}([^<]+)<\/td>\s+<td>(\d+)<\/td>\s+<td>(\d+)<\/td>\s+<td>(\d+)<\/td>/gm;
        const result = [...html.matchAll(regexp)];
        result.forEach(element => {
            url = element[1];
            time = element[2];
            size = element[3];
            download = element[4];
            seeds = element[5];
            peers = element[6];
            id = url.match(/https:\/\/\w+.yggtorrent.re\/(?:[^\/]+\/){3}(\d+)-/)[1];
            torrent_download = "https://www3.yggtorrent.re/engine/download_torrent?id="+id;
            local_torrent = `./torrents/${id}.torrent`;
            // if (download < 1 && seeds < 2 && peers < 2 && size.includes("Go")){
                if (download < 1 && size.includes("Go")){
                size = parseInt(size.split('Go')[0]);
                if (size > 1 && size < 10) {
                    console.log(`url: ${url}\nid: ${id}\ntime: ${time}\nsize: ${size}\ndownload: ${download}\nseeds: ${seeds}\npeers: ${peers}\n`);
                    proc.exec(`curl -L -C - --url '${torrent_download}' -o ${local_torrent}`, function callback(error, stdout, stderr) {
                        console.log(stdout);
                    });
                }
            }
        });
        await page.waitForTimeout(60000);
    }
    
    await browser.close();
})
();
