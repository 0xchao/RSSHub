const got = require('@/utils/got');
// const url = require('url');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://apps.game.qq.com/wmp/v3.1/?p0=117&p1=searchNewsKeywordsList&r0=cors&source=web_PC',
        headers: {
            Referer: 'https://tgideas.qq.com/',
        },
    });

    const data = response.data.msg.result;

    ctx.state.data = {
        title: '腾讯TGIDEAS',
        link: 'https://tgideas.qq.com/',
        description: '腾讯TGIDEAS',
        item: data.map((item) => ({
            title: item.sTitle,
            description: `<img src="${item.sIMG}"><br/><p>${item.sTitle} - ${item.sAuthor}</p>`,
            pubDate: new Date(item.sCreated).toUTCString(),
            author: item.sAuthor,
            link: `https://tgideas.qq.com/gicp/news/476/${item.iNewsId}.html`,
        })),
    };
};
