const got = require('@/utils/got');
// const url = require('url');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.manamana.net/api/activity/indexList?orderBy=0&pageIndex=1&pageSize=20',
        headers: {
            Referer: 'https://www.manamana.net/activity',
        },
    });

    const data = response.data.data.list;

    ctx.state.data = {
        title: 'MANA新媒体 | 发现活动',
        link: 'https://www.manamana.net/activity',
        description: 'MANA新媒体',
        item: data.map((item) => ({
            title: item.title,
            description: `<img src="https://image.manamana.net/${item.thumb}"><br/><p>${item.title} - ${item.nickname}</p>`,
            pubDate: new Date(item.holdStartTime).toUTCString(),
            author: item.nickname,
            link: `https://www.manamana.net/activityDetail/${item.id}`,
        })),
    };
};
