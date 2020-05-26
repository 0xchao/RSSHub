const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url1 = `https://xd.adobe.com/ideas/process/`;
    const url2 = `https://xd.adobe.com/ideas/principles/`;
    const url3 = `https://xd.adobe.com/ideas/perspectives/`;

    const res1 = await got.get(url1);
    const $1 = cheerio.load(res1.data);
    const listdata1 = $1('.index-item-row .index-item').get();
    const list1 = listdata1.slice(0, 6);
    const res2 = await got.get(url2);
    const $2 = cheerio.load(res2.data);
    const listdata2 = $2('.index-item-row .index-item').get();
    const list2 = listdata2.slice(0, 6);
    const res3 = await got.get(url3);
    const $3 = cheerio.load(res3.data);
    const listdata3 = $3('.index-item-row .index-item').get();
    const list3 = listdata3.slice(0, 6);
    const list4 = list1.concat(list2);
    const list = list4.concat(list3);

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.css-0 time').attr('datetime');
            const title = $('h2 a').text();
            const imageUrl = `<img src="https://xd.adobe.com` + $('.img-zoom-wrapper a img').attr('data-src') + `">`;
            const itemUrl = 'https://xd.adobe.com' + $('h2 a').attr('href');
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
        const time = $('.post-author-info .post-date').text();
        const times = time.replace('th', '');
        out[indexList[i]].pubDate = new Date(times).toUTCString();
        const content = $('.article-body').html();
        out[indexList[i]].description = out[indexList[i]].imageUrl + '<br/>' + content;
        const category = $('.article-breadcrumbs').text();
        out[indexList[i]].category = category;
        const author = $('.post-author-info .post-author').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: 'Adobe XD Ideas',
        link: 'https://xd.adobe.com/ideas/',
        item: out,
    };
};
