const proc = require('child_process');
const fs = require('fs');
const https = require('https');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth'); 

// https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth
// https://www.scrapingbee.com/blog/download-file-puppeteer/

puppeteer.use(StealthPlugin());

let ygg_user = "";
let ygg_pass = "";

var user_data = "./user_data";
if (!fs.existsSync(user_data)){
    fs.mkdirSync(user_data);
}

var torrents_dir = "./torrents";
if (!fs.existsSync(torrents_dir)){
    fs.mkdirSync(torrents_dir);
}

const options = {
    // args: [`--window-size=${1100},${1080}`],
    ignoreHTTPSErrors: false,
    userDataDir: user_data,
    headless: true,
    // defaultViewport: {
    //     width: 1100, height: 1080
    // }
};

(async () => {
    console.log("        -= YGG B0T =-\n");
    console.log("♪┏(・o･)┛♪┗ ( ･o･) ┓♪┏(・o･)┛\n");
    const browser = await puppeteer.launch(options);
    const [page] = await browser.pages();
    await page.setDefaultTimeout(7000);

    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: torrents_dir});
    await page.goto('https://www3.yggtorrent.re/');

    try {
        await page.waitForSelector('a#register');
        await page.click('a#register');
        await page.waitForSelector('button > i.ico_unlock');
        await page.type('input[name=id]', ygg_user);
        await page.type('input[name=pass]', ygg_pass);
        await page.click('button > i.ico_unlock');
    }
    catch(e) {
        // handle initialization error
    }

    while (true) {
        
        try {

            await page.goto('https://www3.yggtorrent.re/engine/search?do=search', {waitUntil: 'load', timeout: 0});
            await page.waitForSelector('div.table-responsive:nth-child(2)');

            const html = await page.evaluate(() => {
                return document.documentElement.innerHTML;
            });
            const regexp = /<tr>(?:[^>]+>){3}<a href="https:\/\/\w+.yggtorrent(?:[^=]+=){7}"([^"]+)(?:[^>]+>){14}(\d+)(?:[^>]+>){5}([^<]+)<\/td>\s+<td>(\d+)<\/td>\s+<td>(\d+)<\/td>\s+<td>(\d+)<\/td>/gm;
            const result = [...html.matchAll(regexp)];
            for(let index =0;index<result.length;++index) {
                url = result[index][1];
                time = result[index][2];
                size = result[index][3];
                download = result[index][4];
                seeds = result[index][5];
                peers = result[index][6];
                id = url.match(/https:\/\/\w+.yggtorrent.re\/(?:[^\/]+\/){3}(\d+)-/)[1];
                torrent_download = "https://www3.yggtorrent.re/engine/download_torrent?id="+id;
                torrent_page = "https://www3.yggtorrent.re/torrent/-/-/"+id+"--";
                // local_torrent = `./torrents/${id}.torrent`;
                if (download == 0 && seeds < 2 && peers == 0 && size.includes("Go")){
                    size = parseInt(size.split('Go')[0]);
                    if (size >= 10 && size <= 50) {
                        // console.log(`url: ${url}\nid: ${id}\ntime: ${time}\nsize: ${size}\ndownload: ${download}\nseeds: ${seeds}\npeers: ${peers}\n`);

                        await page.goto(torrent_page, {waitUntil: 'load', timeout: 0});
                        await page.waitForSelector('a.butt:nth-child(1)');
                        await page.click('a.butt:nth-child(1)');
                        await page.waitForTimeout(100);

                        // proc.exec('aria2c --save-session=./session/  --dir=./files/ --max-concurrent-downloads=666 --bt-max-open-files=1024 --bt-max-peers=1024 --seed-ratio=0.0 --follow-torrent=mem --torrent-file='+local_torrent, function callback(error, stdout, stderr) {
                        //     console.log(stdout);
                        // });
                    }
                }
                await page.waitForTimeout(3000);
            }
            await page.waitForTimeout(60000);
        }
        catch(e) {
            // handle initialization error
        }

    }
    await browser.close();
})
();
