const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.behance.net/galleries',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.qa-grid-item');
    let itemPicUrl;

    ctx.state.data = {
        title: 'Behance作品精选',
        link: 'https://www.behance.net/galleries',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    itemPicUrl = `${item.find('img.js-cover-image').attr('src')}`;
                    return {
                        title: item.find('.qa-title-owner').text(),
                        description: `作者：${item.find('.OwnersNeue-owner-3CC').text()}`,
                        link: item.find('.js-project-link').attr('href'),
                    };
                })
                .get(),
    };
};
