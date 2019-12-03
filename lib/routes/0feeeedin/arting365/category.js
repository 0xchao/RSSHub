const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `http://arting365.com/channel/${id}`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.index4_1 ul li').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('h4').text();
            let title = $('h1 a').text();
            let category = $('h6').text();
            if (!title) {
                title = $('a').text();
            }
            const linkzh = $('h1 a').attr('href');
            const itemUrl = encodeURI(linkzh);
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

        // let time = '7小时';
        // if (!time) {
        //     time = $('.article-header .info .date').text();
        // }
        // out[indexList[i]].pubDate = new Date(time).toUTCString();

        const content = $('.pd_left .pd_zw').html();
        const contentStr = content.replace('<hr>', '');
        out[indexList[i]].description = contentStr;
        // let category = $('._introduce_tag').text();
        // out[indexList[i]].category = category;
        let author = $('.banner3_dn span:nth-child(2)').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
