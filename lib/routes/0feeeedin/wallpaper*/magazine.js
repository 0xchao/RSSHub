const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.wallpaper.com/latest`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.columnLayout').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('.title h4').text();
            const itemUrl = $('.img-wrapper a').attr('href');
            const imageUrl = `<img src="` + $('.img-wrapper a img').attr('data-fallback') + `">`;
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                imageUrl,
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
        const content = $('.articleBody').html();
        out[indexList[i]].description = out[indexList[i]].imageUrl + content;
        const category = $('.byline .section').text();
        out[indexList[i]].category = category;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'Wallpaper* 设计杂志',
        link: 'https://www.wallpaper.com/latest',
        item: out,
    };
};
