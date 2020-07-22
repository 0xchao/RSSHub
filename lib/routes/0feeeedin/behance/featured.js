// const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `http://www.behance.net/v2/projects/?client_id=C40ETlQ9qALWNS5F4r92GXQK5ppmkmYO`,
        headers: {
            Referer: `http://www.behance.net/`,
        },
    });

    const data = response.data.projects;

    ctx.state.data = {
        // 源标题
        title: `Behance 作品精选`,
        // 源链接
        link: `http://www.behance.net/`,
        // 源说明
        description: `Behance 作品精选`,
        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 文章标题
            title: item.name,
            // 文章正文
            description: `<img src="${item.covers.max_808}">`,
            // 文章发布时间
            pubDate: new Date(item.published_on * 1000).toUTCString(),
            // 文章链接
            link: item.url,
            author: item.owners[0].display_name,
            category: item.fields,
        })),
    };
};
