const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://eyeondesign.aiga.org/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.grid-items .grid-post').get();
    list.splice(1, 1);
    list.pop();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            let title = $('.grid-item-title a').text();
            let category = $('.grid-item-label a').text();
            const imageUrl = `<img src="` + $('.grid-item a img.grid-thumbnail-large').attr('src') + `"/>`;
            const description = imageUrl + `<br/>` + $('.grid-item-lede a p').text();
            const itemUrl = $('.grid-item-title a').attr('href');
            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const single = {
                title,
                category,
                imageUrl,
                description,
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

        let time1 = $('.post-meta .post-meta-item:last-child p').text();
        const time2 = time1.replace('Published on', '');
        const time3 = time2.replace('th,', '');
        const time4 = time3.replace('st,', '');
        const time5 = time4.replace('nd,', '');
        const time = time5.replace('rd,', '');
        out[indexList[i]].pubDate = new Date(time).toUTCString();
        let author = $('.post-meta .post-meta-item:first-child a').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: `AIGA设计协会 | Eye on Design`,
        link: `https://eyeondesign.aiga.org/`,
        item: out,
    };
};
