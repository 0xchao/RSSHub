const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.topys.cn`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.article-item').get();
    list.splice(2, 1);
    list.splice(4, 1);
    list.pop();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.box-info .content .row-2col .box-right').text();
            const title = $('.article-panel .title').text();
            const imageUrl = $('.cover').html();
            const itemUrl = `https://www.topys.cn` + $('.article-panel .title').attr('href');
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

        const time = $('.author-box .add-time').text();
        out[indexList[i]].pubDate = new Date(time).toUTCString();
        // let title = $('.article_title h2').text();
        // out[indexList[i]].title = title;
        const content = $('.new-detail').html();
        const contentStr = content.replace('<hr>', '');
        out[indexList[i]].description = out[indexList[i]].imageUrl + contentStr;
        const category = $('.article-head .category a').text();
        out[indexList[i]].category = category;
        const author = $('.author-box .author-name').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'TOPYS | 全球顶尖创意分享平台',
        link: 'https://www.topys.cn/',
        item: out,
    };
};
