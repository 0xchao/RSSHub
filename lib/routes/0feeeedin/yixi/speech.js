const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.yixi.tv/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list1 = $('.swiper-slide').get();
    const list = list1.slice(0, 20);

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const title = $('.swiper-type1_item h4').first().text() + ` - ` + $('.swiper-type1_item p').first().text();
            const itemUrl1 = $('.swiper-slide').attr('onclick');
            const itemUrl2 = itemUrl1.replace("javascript:location.href='", '');
            const itemUrl = `https://www.yixi.tv` + itemUrl2.replace("'", '');
            const author = $('.swiper-type1_item p').first().text();
            const imageUrlSrc = `<img src="` + $('.swiper-type1_item img').attr('src') + `"/>`;
            const imageUrl = imageUrlSrc.replace('?imageslim?imageView2/1/w/283/h/159', '');
            const single = {
                title,
                imageUrl,
                author,
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
        const time1 = $('.time').text();
        const time = time1;
        out[indexList[i]].pubDate = new Date(time).toUTCString();
        const content = $('.an').html();
        out[indexList[i]].description = out[indexList[i]].imageUrl + '<br/>' + content;
        const category = $('.intro-pretitle').text();
        out[indexList[i]].category = category;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: '一席 YiXi',
        link: 'https://www.yixi.tv/',
        item: out,
    };
};
