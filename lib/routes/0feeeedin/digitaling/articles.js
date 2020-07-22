const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.digitaling.com/articles/choice`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('ul#art_list li').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.box-info .content .row-2col .box-right').text();
            const title = $('.w_445 h3 a').attr('title');
            const imageUrl = `<img src="` + $('.w_235 a img').attr('data-original') + `">`;
            const itemUrl = $('.w_445 h3 a').attr('href');
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

        const time = $('.mg_b_10.bd_b_e0.pd_b_10 .p_999.w_590 span.color_999.mg_r_10').text();
        out[indexList[i]].pubDate = new Date(time).toUTCString();
        const title = $('.article_title h2').text();
        out[indexList[i]].title = title;
        const content = $('div.article_con#article_con').html();
        const contentStr = content.replace('<hr>', '');
        out[indexList[i]].description = out[indexList[i]].imageUrl + contentStr;
        const category = $('span[itemprop="about"]').text();
        out[indexList[i]].category = category;
        const author = $('div#avatar_by p.font_16 a').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: '数音DIGITALING - 精选文章',
        link: 'https://www.digitaling.com/articles/choice',
        item: out,
    };
};
