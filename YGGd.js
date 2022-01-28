const proc = require('child_process');
const fs = require('fs');
const https = require('https');
const puppeteer = require('puppeteer-extra');
const prompt = require("prompt-sync")({ 
    autocomplete: complete(['ether123', 'hello123456']),
    sigint: true 
});
// puppeteer.use(require('puppeteer-extra-plugin-font-size')({defaultFontSize: 11}))
const StealthPlugin = require('puppeteer-extra-plugin-stealth'); 

// https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth
// https://www.scrapingbee.com/blog/download-file-puppeteer/

puppeteer.use(StealthPlugin());


let ygg_user = prompt("YGG username: ");
let ygg_pass = prompt("YGG password: ", {echo: ''});
let taille_minimum = 1; // En giga octets
let taille_maximum = 20; // En Giga octets

console.log("\n");

var user_data = "./user_data";
if (!fs.existsSync(user_data)){
    fs.mkdirSync(user_data);
}
var torrents_dir = "./torrents";
if (!fs.existsSync(torrents_dir)){
    fs.mkdirSync(torrents_dir);
}

const options = {
    // args: [`--window-size=${1920},${1080}`],
    // args: ["--force-device-scale-factor=0.75"],
    ignoreHTTPSErrors: false,
    userDataDir: user_data,
    headless: false,
    defaultViewport: null,
};

(async () => {
    console.log("        -= YGG B0T =-\n");
    console.log("♪┏(・o･)┛♪┗ ( ･o･) ┓♪┏(・o･)┛\n");
    const browser = await puppeteer.launch(options);
    const [page] = await browser.pages();
    await page.setDefaultTimeout(7000);

    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: torrents_dir});
    await page.goto('https://www3.yggtorrent.re/', {waitUntil: 'load', timeout: 21*1000});
    await page.addStyleTag({content: 'body {zoom: 0.75;}'})

    while (true) {
        try {
            await page.waitForSelector('body > footer',{timeout: 3000});
            const messageSelector = "div.ct:nth-child(2) > ul:nth-child(1) > li:nth-child(6) > a:nth-child(1)";

            if (await page.$(messageSelector) == null) {

                try {
                    await page.waitForSelector('a#register');
                    await page.click('a#register');
                    await page.waitForSelector('button > i.ico_unlock');
                    await page.type('input[name=id]', ygg_user);
                    await page.type('input[name=pass]', ygg_pass);
                    await page.click('button > i.ico_unlock');
                }
                catch(e) {
                    console.log("Can not login:" + e);
                }
            }

            await page.goto('https://www3.yggtorrent.re/engine/search?name=&description=&file=&uploader=&category=2145&sub_category=2184&option_episode%5B%5D=1&do=search', {waitUntil: 'load', timeout: 21*1000});
            await page.addStyleTag({content: 'body {zoom: 0.75;}'})
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
                if (download == 0 && seeds < 2 && peers <= 3 && size.includes("Go")){
                    size = parseInt(size.split('Go')[0]);
                    if (size >= taille_minimum && size <= taille_maximum) {
                        // console.log(`url: ${url}\nid: ${id}\ntime: ${time}\nsize: ${size}\ndownload: ${download}\nseeds: ${seeds}\npeers: ${peers}\n`);

                        await page.goto(torrent_page, {waitUntil: 'load', timeout: 13*1000});
                        await page.addStyleTag({content: 'body {zoom: 0.80;}'})
                        await page.waitForSelector('a.butt:nth-child(1)');
                        await page.click('a.butt:nth-child(1)');
                        await page.waitForTimeout(3000);

                        // proc.exec('aria2c --save-session=./session/  --dir=./files/ --max-concurrent-downloads=666 --bt-max-open-files=1024 --bt-max-peers=1024 --seed-ratio=0.0 --follow-torrent=mem --torrent-file='+local_torrent, function callback(error, stdout, stderr) {
                        //     console.log(stdout);
                        // });
                    }
                }
            }
            await page.waitForTimeout(60000);
        }
        catch(e) {
            console.log(e);
        }

    }
    await browser.close();
})
();

function complete(commands) {
    return function (str) {
      var i;
      var ret = [];
      for (i=0; i< commands.length; i++) {
        if (commands[i].indexOf(str) == 0)
          ret.push(commands[i]);
      }
      return ret;
    };
  };
