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
            // const time = $('.Preview__date').text();
            const title = $('.Preview__title').text();
            const itemUrl = 'https://httpster.net' + $('.Preview__action--eye').attr('href');
            const description = $('noscript').html() + title;
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                description,
                link: itemUrl,
                guid: itemUrl,
            };
            proList.push(got.get(itemUrl));
            indexList.push(i);
            return Promise.resolve(single);
        })
    );
    const responses = await got.all(proList);
    for (let i = 0; i < responses.length; i++) {
        const res = responses[i];
        const $ = cheerio.load(res.data);

        const time = $('.Browser__chrome .Browser__title').text();
        out[indexList[i]].pubDate = new Date(time).toUTCString();

        // const content = $('.Browser__bd .Snapshot__fig Imgset').html();
        // const content = `<img src="https://httpster.net` + $('img.Imgset__img').attr('src') + `"></img>` + $('.Header ').html() + $('.Snapshot__tags ').html();
        // const contentStr = content.replace('<hr>', '');
        // out[indexList[i]].description = content;
        // let category = $('.list-tags').html();
        // out[indexList[i]].category = category;
        // let author = $('.box-info .by a').html();
        // out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'Totally rocking websites | httpster',
        link: 'https://httpster.net/',
        item: out,
    };
};
