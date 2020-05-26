const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.digitaling.com/projects/all`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.work_item').get();

    const proList = [];
    const indexList = [];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const $ = cheerio.load(item);
            const time = $('.works_bd div.clearfix.font_12.h_line_20 label.v_m.color_999.mg_r_10').text();
            const title = $('.box-info .content .row h3 a').text();
            const imageUrl = `<img src="` + $('.works_pic a img').attr('data-original') + `">`;
            const itemUrl = $('.works_pic a').attr('href');
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

        // let time = out.pubDate;
        // out[indexList[i]].pubDate = time;
        const title = $('.project_title h2').text();
        out[indexList[i]].title = title;
        const content = $('div.article_con#article_con').html();
        const contentStr = content.replace('<hr>', '');
        out[indexList[i]].description = out[indexList[i]].imageUrl + contentStr;
        const category =
            $('.mg_b_10.bd_b_e0.pd_b_10.clearfix .p_999.mg_t_10.w_590.color_999 .f_l span.mg_r_10:first-child').text() +
            '/' +
            $('.mg_b_10.bd_b_e0.pd_b_10.clearfix .p_999.mg_t_10.w_590.color_999 .f_l span.mg_r_10:nth-child(2)').text();
        out[indexList[i]].category = category;
        const author = $('div#avatar_by p.font_16 a').text();
        out[indexList[i]].author = author;
        ctx.cache.set(out[indexList[i]].link, JSON.stringify(out[i]));
    }
    ctx.state.data = {
        title: '数音DIGITALING - 精选项目',
        link: 'https://www.digitaling.com/projects/all',
        item: out,
    };
};
