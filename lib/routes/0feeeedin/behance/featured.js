const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    // const url = `https://www.behance.net`;

    // const res = await got.get(url);
    // const $ = cheerio.load(res.data);
    // const list = $('li.ContentGrid-gridItem-2Ad').get();

    const browser = await require('@/utils/puppeteer')();
    // 创建一个新的浏览器页面
    const page = await browser.newPage();
    // 访问指定的链接
    const link = 'http://www.behance.net';
    await page.goto(link);
    // 渲染目标网页
    const html = await page.evaluate(
        () =>
            // 选取渲染后的 HTML
            document.querySelector('ul.ContentGrid-grid-1EY').innerHTML
    );
    // 关闭浏览器进程
    browser.close();

    const $ = cheerio.load(html); // 使用 cheerio 加载返回的 HTML
    const list = $('li.ContentGrid-gridItem-2Ad').get(); // 使用 cheerio 选择器，选择所有 <div class="item"> 元素，返回 cheerio node 对象数组

    // console.log(list);

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.rf-feature__date').text();
            console.log(time);
            let title = $('a.Title-title-3nk').text();
            const itemUrl = $('a.Title-title-3nk').attr('href');
            // let category = $('.tags').text();
            let author = $('.OwnersNeue-owner-3CC').text();
            let description = $('.Cover-content-2R2 img').attr('src');

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const single = {
                title,
                author,
                description,
                pubDate: new Date(time).toUTCString(),
                link: itemUrl,
                guid: itemUrl,
            };
            proList.push(got.get(itemUrl));
            indexList.push(i);
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: 'Behance 作品精选',
        link: 'https://www.behance.net/',
        item: out,
    };
};
