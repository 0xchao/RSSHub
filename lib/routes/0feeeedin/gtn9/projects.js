const cheerio = require('cheerio');
const got = require('@/utils/got');
const formatPubDate = require('@/utils/date.js');

module.exports = async (ctx) => {
    const url = `https://www.gtn9.com/index.aspx`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.recommend .content_list_box').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const times = $('.zan_box_right').text().trim();
            const timess = times.replace('内', '前');
            const timesss = timess.replace('天', '天 00:00');
            const pubDate = formatPubDate(timesss);

            const title = $('.title_big').text();
            const imageUrl1 = `<img src="` + $('.effect-ming img').attr('src') + `"/>`;
            const imageUrl = imageUrl1.replace('?imageView2/1/w/280/h/200/q/100', '');
            const category = $('.title_small').text();
            const author = $('.zan_box_foot span a').text();
            const itemUrl = 'https://www.gtn9.com/' + $('.grid a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                category,
                author,
                imageUrl,
                pubDate,
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

        const content = $('.imgBox-content').html();
        out[indexList[i]].description = out[indexList[i]].imageUrl + content;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: `古田路9号 品牌创意设计社区`,
        link: `https://www.gtn9.com/index.aspx`,
        item: out,
    };
};
