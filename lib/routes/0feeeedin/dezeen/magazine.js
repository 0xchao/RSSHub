const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.dezeen.com/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.pagination-wrapper + .main-story-list li').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('header h3').text();
            const time = $('footer time').attr('datetime');
            const author = $('footer a[rel=author]').text();
            const category = $('header h4 a').text();
            const itemUrl = $('header a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                category,
                author,
                pubDate: new Date(time).toUTCString(),
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
        const imageUrl = `<img src="` + $('#preload-hero').attr('data-lightboximage') + `">`;
        const content = $('.main-article-body').html();
        out[indexList[i]].description = imageUrl + content;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'dezeen 建筑设计',
        link: 'https://www.dezeen.com/',
        item: out,
    };
};
