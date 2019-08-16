const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.cssdesignawards.com/wotd-award-winners',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.single-project');
    let itemPicUrl;

    ctx.state.data = {
        title: 'WOTD - CSSDesignAwards',
        link: 'https://www.cssdesignawards.com/wotd-award-winners',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        image: item.find('.single-project__thumbnail img').attr('src'),
                        title: item.find('h3.single-project__title a').text(),
                        description: `Scores：${item.find('.single-project__scores').text()}<br>描述：${item.find('.content p').text()}<br><img referrerpolicy="no-referrer" src="https://www.cssdesignawards.com${$(item)
                            .find('.single-project__thumbnail img')
                            .attr('src')}">`,
                        link: 'https://www.cssdesignawards.com' + item.find('h3.single-project__title a').attr('href'),
                    };
                })
                .get(),
    };
};
