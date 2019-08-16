const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://isux.tencent.com/articles/',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.article-single');
    let itemPicUrl;

    ctx.state.data = {
        title: 'Articles文章 - ISUX腾讯',
        link: 'https://isux.tencent.com/articles/',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.specific-title').text(),
                        description: `${item.find('.specific-kind').text()}<br>${item.find('.specific-introduce').text()}<br><img referrerpolicy="no-referrer" src="${$(item)
                            .find('.colorful')
                            .attr('data-src')}">`,
                        link: 'https://isux.tencent.com' + item.attr('href'),
                    };
                })
                .get(),
    };
};
