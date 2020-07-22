const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.ableton.com/en/blog/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.blog-teaser-grid .cell').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('.blog-teaser__headline').text();
            const category = $('.blog-teaser__category').text();
            const imageUrl = `<img src="` + $('.blog-teaser__media').attr('data-original') + `"/>`;
            const itemUrl = `https://ableton.com` + $('.blog-teaser').attr('href');
            const single = {
                title,
                imageUrl,
                category,
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
        const time = $('.blog-entry__footer__meta .body-text p span').first().text();
        out[indexList[i]].pubDate = new Date(time).toUTCString();
        const content = $('.blog-entry__content').html();
        out[indexList[i]].description = out[indexList[i]].imageUrl + content;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'Ableton 音乐官方博客',
        link: 'https://www.ableton.com/en/blog/',
        item: out,
    };
};
