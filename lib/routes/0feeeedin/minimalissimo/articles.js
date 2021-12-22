const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://minimalissimo.com/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.thumbnail').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('.thumbnail-title').text();
            const itemUrl = $('.thumbnail-holder').attr('href');
            const imageUrl = `<img src="` + $('.thumbnail-image').attr('src') + `"/>`;
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
        const content = $('.editor').html();
        out[indexList[i]].description = out[indexList[i]].imageUrl + content;
        const category = $('.intro-pretitle').text();
        out[indexList[i]].category = category;
        const author = $('.intro-author').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: '极简设计 Minimalissimo',
        link: 'https://minimalissimo.com/',
        item: out,
    };
};
