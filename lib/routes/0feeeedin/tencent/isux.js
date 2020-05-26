const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://isux.tencent.com/articles/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.article-single').get();
    list.pop();
    list.pop();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.date').text();
            let title = $('.specific-title').text();
            if (!title) {
                title = $('a').text();
            }
            const imageUrl = `<img src="` + $('.chief-img.colorful').attr('data-src') + `">`;
            const itemUrl = 'https://isux.tencent.com/' + $('.article-single').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                imageUrl,
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

        const time = $('._article_date span.date').text();
        // if (!time) {
        //     time = $('.article-header .info .date').text();
        // }
        out[indexList[i]].pubDate = new Date(time).toUTCString();

        const content = $('.editable ._mod_content').html();
        out[indexList[i]].description = out[indexList[i]].imageUrl + content;
        const category = $('._introduce_tag').text();
        out[indexList[i]].category = category;
        const author = $('._authors ._author .name').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
