const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `http://ad518.com/cate/creative/id/1/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.card-body .mb-5').get();
    list.pop();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('div span:nth-child(2)').text();
            let title = $('h4 a.text-muted').text();
            // let author = $('.mb-5 div a.text-muted:first-child').text();
            const category = $('.d-flex div:first-child a:last-child').text();
            if (!title) {
                title = $('a').text();
            }
            const itemUrl = `http://ad518.com` + $('h4 a.text-muted').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                category,
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

        // let time = $('._article_date span.date').text();
        // if (!time) {
        //     time = $('.article-header .info .date').text();
        // }
        // out[indexList[i]].pubDate = new Date(time).toUTCString();

        const content = $('.bg-content').html();
        const contentStr = content.replace('<hr>', '');
        out[indexList[i]].description = contentStr;
        // let category = $('._introduce_tag').text();
        // out[indexList[i]].category = category;
        // let author = $('._authors ._author .name').text();
        // out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
