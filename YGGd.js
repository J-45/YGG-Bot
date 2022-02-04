const proc = require('child_process');
const fs = require('fs');
const https = require('https');
const puppeteer = require('puppeteer-extra');
const path = require('path');
const prompt = require("prompt-sync")({
    autocomplete: complete(['kevin','kevina']),
    sigint: true
});
// puppeteer.use(require('puppeteer-extra-plugin-font-size')({defaultFontSize: 11}))
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { exit } = require('process');
// https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth
// https://www.scrapingbee.com/blog/download-file-puppeteer/
puppeteer.use(StealthPlugin());

let ygg_user = prompt("YGG username: ");
let ygg_pass = prompt("YGG password: ", {echo: ''});
let age_max = 15; // en minutes
let seed_max = 1;
let peer_max = 2;
let taille_minimum = 7;
let taille_maximum = 42;
taille_minimum = ((taille_minimum * 1024) * 1024) * 1024; // En giga octets
taille_maximum = ((taille_maximum * 1024) * 1024) * 1024; // En giga octets
console.log("");

var user_data = "user_data";
if (!fs.existsSync(user_data)){
    fs.mkdirSync(user_data);
}
var torrents_dir = "torrents";
if (!fs.existsSync(torrents_dir)){
    fs.mkdirSync(torrents_dir);
}

const options = {
    // args: [`--window-size=${1920},${1080}`],
    ignoreHTTPSErrors: false,
    userDataDir: path.resolve(__dirname, user_data),
    headless: false,
    defaultViewport: null,
};

async function run () {
    console.log("        -= YGG B0T =-\n");
    console.log("♪┏(・o･)┛♪┗ ( ･o･) ┓♪┏(・o･)┛\n");
    const browser = await puppeteer.launch(options);
    const [page] = await browser.pages();
    await page.setDefaultTimeout(90*1000);
    await page.setCacheEnabled(false);
    await page._client.send('Network.setCacheDisabled', { cacheDisabled: true });

    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path.resolve(__dirname, torrents_dir)});
    await page.goto('https://www3.yggtorrent.re/', {waitUntil: 'load'});
    await page.waitForTimeout(3 * 1000);
    await page.addStyleTag({content: 'body {zoom: 0.75;}'})

    while (true) {
        try {
            const messageSelector = "div.ct:nth-child(2) > ul:nth-child(1) > li:nth-child(6)";
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
                    // console.log("Can not login");
                }
            }
            let search_url = "https://www3.yggtorrent.re/top/day";

            await page.goto(search_url, {waitUntil: 'networkidle0'});
            await page.waitForSelector('#cat > div');
            await page.click('#cat > div');
            await page.addStyleTag({content: 'body {zoom: 0.75;}'})

            const html = await page.evaluate(() => {
                return document.documentElement.innerHTML;
            });
            const regexp = /<tr(?:[^>]+>){10}<a href="(https:\/\/\w+.yggtorrent[^"]+)"(?:[^"]+")(\d+)(?:[^"]*"){10}>(\d+)(?:[^>]+>){4}(\d+)(?:[^>]+>){3}(\d+)<\/td><td>(\d+)<\/td><td>(\d+)<\/td><\/tr>/gm;
            const result = [...html.matchAll(regexp)];
            let now = new Date();
            console.log();
            console.log(`> ${result.length} torrents listés - ${now.toLocaleString("fr-FR")}`);
            for(let index =0;index<result.length;++index) {

                url = result[index][1];
                id = result[index][2];
                time = result[index][3] * 1000;
                endTime = new Date();
                let timeDiff = endTime - time; //in ms
                timeDiff /= 1000;
                timeDiff = Math.round(timeDiff / 60);
                size = result[index][4];
                download = result[index][5];
                seeds = result[index][6];
                peers = result[index][7];
                torrent_page = "https://www3.yggtorrent.re/torrent/-/-/"+id+"--";


                // console.log(`url: ${url}\nid: ${id}\nage: ${timeDiff} minutes\nsize: ${size}\ntaile (go): ${((size / 1024) / 1024) / 1024}\ndownload: ${download}\nseeds: ${seeds}\npeers: ${peers}\n`);

                // local_torrent = `./torrents/${id}.torrent`;
                if (download == 0 && seeds <= seed_max && peers <= peer_max && size >= taille_minimum && size <= taille_maximum && timeDiff < age_max){
                        console.log(`url: ${url}\nid: ${id}\nage: ${timeDiff} minutes\nsize: ${size}\ntaile (go): ${((size / 1024) / 1024) / 1024}\ndownload: ${download}\nseeds: ${seeds}\npeers: ${peers}\n`);

                        await page.waitForTimeout(3 *1000);
                        await page.goto(torrent_page, {waitUntil: 'networkidle2', timeout: 13*1000});
                        await page.waitForSelector('a.butt:nth-child(1)');
                        await page.click('a.butt:nth-child(1)');
                }
            }
            await page.goto(search_url, {waitUntil: 'networkidle0'});
            await page.waitForSelector('#cat > div');
            await page.click('#cat > div');
            await page.addStyleTag({content: 'body {zoom: 0.75;}'})
            await page.waitForTimeout(30 * 1000);
        }
        catch(e) {
            // console.log(e);
        }
    }
    await browser.close();
};

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

run();
