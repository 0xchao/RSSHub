const got = require('@/utils/got');
// const url = require('url');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.ideatchina.com/web/index/article',
        headers: {
            Referer: 'http://www.ideatchina.com/',
        },
    });

    const data = response.data;

    ctx.state.data = {
        title: 'IDEAT 理想家',
        link: 'http://www.ideatchina.com/',
        description: 'IDEAT 理想家',
        item: data.map((item) => ({
            title: item.title,
            description: `<img src="${item.img}">`,
            pubDate: new Date(item.online_time).toUTCString(),
            link: `http://www.ideatchina.com/web/article/${item.link}${item.aid}`,
        })),
    };
};
