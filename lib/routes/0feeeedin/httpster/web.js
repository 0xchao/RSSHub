const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://httpster.net/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.Grid__unit ').get();
    list.pop();
    list.shift();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.Preview__date').text();
            let title = $('.Preview__title').text();
            const itemUrl = 'https://httpster.net' + $('.Preview__action--eye').attr('href');
            const description = title + $('noscript').attr('data-json');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                description,
                pubDate: new Date(time).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };
            proList.push(got.get(itemUrl));
            indexList.push(i);
            return Promise.resolve(single);
        })
    );
    // const responses = await got.all(proList);
    // for (let i = 0; i < responses.length; i++) {
    //     const res = responses[i];
    //     const $ = cheerio.load(res.data);

    //     let time = $('.box-breadcrumb .box-left .text-x-thin').text();
    //     out[indexList[i]].pubDate = new Date(time).toUTCString();

    //     const content = `<img src="https://httpster.net` + $('img.Imgset__img').attr('src') + `"></img>` + $('.Header ').html() + $('.Snapshot__tags ').html();
    //     const contentStr = content.replace('<hr>', '');
    //     out[indexList[i]].description = contentStr;
    //     let category = $('.list-tags').html();
    //     out[indexList[i]].category = category;
    //     let author = $('.box-info .by a').html();
    //     out[indexList[i]].author = author;
    //     ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    // }
    ctx.state.data = {
        title: 'Sites of the day - Awwwards',
        link: 'https://www.awwwards.com/websites/sites_of_the_day/',
        item: out,
    };
};
