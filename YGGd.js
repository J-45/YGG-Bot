// deno-lint-ignore-file
// deno-lint-ignore-file no-unused-vars

const proc = require('child_process');
const fs = require('fs');
const https = require('https');
const puppeteer = require('puppeteer-extra');
const path = require('path');
const fetch = require('node-fetch');
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
let age_max = 5; // minutes
let peer_min = 2;
let cat = 'XXX';
let taille_minimum = 7; // gigaoctets
let taille_maximum = 69; // gigaoctets
let refresh_delay = 30; // secondes
let search_url = "https://www3.yggtorrent.re/top/day";

taille_minimum = ((taille_minimum * 1024) * 1024) * 1024; // En giga octets
taille_maximum = ((taille_maximum * 1024) * 1024) * 1024; // En giga octets

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
    const response = await fetch('https://j45.eu/ip');
    const body = await response.text();
    const ip = body.split('= ')[1].slice(0, -5);
    console.log(`\n-=| YGG B0T [${ip}] |=-\n`);
    const browser = await puppeteer.launch(options);
    const [page] = await browser.pages();
    await page.setDefaultTimeout((refresh_delay * 2) * 1000);
    await page.setCacheEnabled(false);
    await page._client.send('Network.setCacheDisabled', { cacheDisabled: true });
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path.resolve(__dirname, torrents_dir)});

    // await page.setRequestInterception(true);
    // page.on('request', (req) => {
    // if(req.resourceType() === 'image'){
    //     req.abort(); // stop image
    // }
    // else {
    //     req.continue();
    // }
    // });

    while (true) {
        try {
            await page.goto(search_url, {waitUntil: 'networkidle2'});
            // await page.addStyleTag({content: 'body {zoom: 0.75;}'})
            await page.waitForSelector('#cat > div > strong');
            await page.setDefaultTimeout(3 * 1000);

            // ferme la sidebar
            messageSelector = "#cat.active > div > span";
            if (await page.$(messageSelector) != null) {
                // ferme le popup pour les don
                try {
                    await page.waitForSelector('.open > strong:nth-child(2)');
                    await page.click('.ico_chevron-left');
                    console.log('sidebar click');
                }
                catch(e) {
                    console.log(`[sidebar] ${e.name}+ " = " + ${e.message}`);
                }
            }

            messageSelector = "#over-18-notification > div.ad-alert-message-text > div > button";
            if (await page.$(messageSelector) != null) {
                // ferme le popup pour les don
                try {
                    await page.waitForSelector('#over-18-notification > div.ad-alert-message-text > div');
                    await page.click('#over-18-notification > div.ad-alert-message-text > div > button');
                    console.log('popup click');
                }
                catch(e) {
                    // console.log(`[popup] ${e.name}+ " = " + ${e.message}`);
                }
            }

            messageSelector = "div.ct:nth-child(2) > ul:nth-child(1) > li:nth-child(6)";
            if (await page.$(messageSelector) == null) {
                // se connecte
                try {
                    await page.waitForSelector('a#register');
                    await page.click('a#register');
                    await page.waitForSelector('button > i.ico_unlock');
                    await page.type('input[name=id]', ygg_user);
                    await page.type('input[name=pass]', ygg_pass);
                    await page.click('button > i.ico_unlock');
                }
                catch(e) {
                    // console.log("Can not login:",e);
                }
            }

            await page.setDefaultTimeout((refresh_delay * 2) * 1000);

            let html = await page.evaluate(() => {
                return document.documentElement.innerHTML;
            });
            const regexp = /<tr(?:[^>]+>){10}<a href="(https:\/\/\w+.yggtorrent[^"]+)"(?:[^"]+")(\d+)(?:[^"]*"){10}>(\d+)(?:[^>]+>){4}(\d+)(?:[^>]+>){3}(\d+)<\/td><td>(\d+)<\/td><td>(\d+)<\/td><\/tr>/gm;
            if (cat != ""){
                html = html.toString().split('<h2 class="margin" style="letter-spacing: 0px;">Torrents de <strong style="color : #7bd8bf">'+cat)[1];
                html = html.toString().split('<h2 class="margin" style="letter-spacing: 0px;">Torrents de')[0];
            }
            const result = [...html.matchAll(regexp)];
            let now = new Date();
            console.log(`${now.toLocaleString("fr-FR")}: ${result.length} torrents listés`);
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
                if (download == 0 && seeds <= 1 && size >= taille_minimum && size <= taille_maximum && timeDiff < age_max){
                        console.log(`url: ${url}\nid: ${id}\nage: ${timeDiff} minutes\nsize: ${size}\ntaile (go): ${((size / 1024) / 1024) / 1024}\ndownload: ${download}\nseeds: ${seeds}\npeers: ${peers}\n`);

                        await page.waitForTimeout(2 *1000);
                        await page.goto(torrent_page, {waitUntil: 'networkidle0'});
                        await page.waitForSelector('a.butt:nth-child(1)');
                        await page.click('a.butt:nth-child(1)');
                }
            }

            await page.waitForTimeout(refresh_delay * 1000);
        }
        catch(e) {
            // console.log(`${e.name}+ " = " + ${e.message}`);
            console.log(e);
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
