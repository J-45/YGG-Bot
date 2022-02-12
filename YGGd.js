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

let YGG_USER = prompt("YGG username: ");
let YGG_PASS = prompt("YGG password: ", {echo: ''});
let AGE_MAX = 5; // minutes
let CAT = 'XXX';
let TAILLE_MINIMUM = 7; // gigaoctets
let TAILLE_MAXIMUM = 69; // gigaoctets
let REFRESH_DELAY = 30; // secondes
let SEARCH_URL = "https://www3.yggtorrent.re/top/day";

TAILLE_MINIMUM = ((TAILLE_MINIMUM * 1024) * 1024) * 1024; // En giga octets
TAILLE_MAXIMUM = ((TAILLE_MAXIMUM * 1024) * 1024) * 1024; // En giga octets

var USER_DATA = "USER_DATA";
if (!fs.existsSync(USER_DATA)){
    fs.mkdirSync(USER_DATA);
}
var TORRENTS_DIR = "torrents";
if (!fs.existsSync(TORRENTS_DIR)){
    fs.mkdirSync(TORRENTS_DIR);
}

const options = {
    // args: [`--window-size=${1920},${1080}`],
    ignoreHTTPSErrors: false,
    userDataDir: path.resolve(__dirname, USER_DATA),
    headless: false,
    defaultViewport: null,
};

async function run () {
    const response = await fetch('https://ip4.seeip.org');
    const ip = await response.text();
    console.log(`\n-=| YGG B0T [${ip}] |=-\n`);
    const browser = await puppeteer.launch(options);
    const [page] = await browser.pages();
    await page.setDefaultTimeout((REFRESH_DELAY * 2) * 1000);
    await page.setCacheEnabled(false);
    await page._client.send('Network.setCacheDisabled', { cacheDisabled: true });
    await page._client.send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: path.resolve(__dirname, TORRENTS_DIR)});

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
            await page.goto(SEARCH_URL, {waitUntil: 'networkidle2'});
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

            messageSelector = "#over-18-notifiCATion > div.ad-alert-message-text > div > button";
            if (await page.$(messageSelector) != null) {
                // ferme le popup pour les don
                try {
                    await page.waitForSelector('#over-18-notifiCATion > div.ad-alert-message-text > div');
                    await page.click('#over-18-notifiCATion > div.ad-alert-message-text > div > button');
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
                    await page.type('input[name=id]', YGG_USER);
                    await page.type('input[name=pass]', YGG_PASS);
                    await page.click('button > i.ico_unlock');
                }
                catch(e) {
                    // console.log("Can not login:",e);
                }
            }

            await page.setDefaultTimeout((REFRESH_DELAY * 2) * 1000);
            let html = "";
            html = await page.evaluate(() => {
                return document.documentElement.innerHTML;
            });
            const regexp = /<tr(?:[^>]+>){10}<a href="(https:\/\/\w+.yggtorrent[^"]+)"(?:[^"]+")(\d+)(?:[^"]*"){10}>(\d+)(?:[^>]+>){4}(\d+)(?:[^>]+>){3}(\d+)<\/td><td>(\d+)<\/td><td>(\d+)<\/td><\/tr>/gm;
            if (html !== undefined && CAT != "" && html.includes(CAT))
            {
                html = html.split('<h2 class="margin" style="letter-spacing: 0px;">Torrents de <strong style="color : #7bd8bf">'+CAT)[1];
                html = html.split('<h2 class="margin" style="letter-spacing: 0px;">Torrents de')[0];
            }

            const result = [...html.matchAll(regexp)];
            let now = new Date();
            console.log(`${now.toLocaleString("fr-FR")}: ${result.length} torrents listés`);
            for(let index =0;index<result.length;++index) {

                Url = result[index][1];
                Id = result[index][2];
                Time = result[index][3] * 1000;
                EndTime = new Date();
                let TimeDiff = EndTime - Time; //in ms
                TimeDiff /= 1000;
                TimeDiff = Math.round(TimeDiff / 60);
                Size = result[index][4];
                Download = result[index][5];
                Seeds = result[index][6];
                Peers = result[index][7];
                Torrent_page = "https://www3.yggtorrent.re/torrent/-/-/"+Id+"--";


                // console.log(`url: ${Url}\nid: ${Id}\nage: ${TimeDiff} minutes\nsize: ${Size}\ntaile (go): ${((Size / 1024) / 1024) / 1024}\ndownload: ${Download}\nseeds: ${Seeds}\npeers: ${Peers}\n`);

                // local_torrent = `./torrents/${id}.torrent`;
                if (Download == 0 && Seeds <= 1 && Size >= TAILLE_MINIMUM && Size <= TAILLE_MAXIMUM && TimeDiff < AGE_MAX){
                        console.log(`url: ${Url}\nid: ${Id}\nage: ${TimeDiff} minutes\nsize: ${Size}\ntaile (go): ${((Size / 1024) / 1024) / 1024}\ndownload: ${Download}\nseeds: ${Seeds}\npeers: ${Peers}\n`);

                        await page.waitForTimeout(2 *1000);
                        await page.goto(Torrent_page, {waitUntil: 'networkidle0'});
                        await page.waitForSelector('a.butt:nth-child(1)');
                        await page.click('a.butt:nth-child(1)');
                }
            }

            await page.waitForTimeout(REFRESH_DELAY * 1000);
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
