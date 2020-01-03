const got = require('@/utils/got');
const url = require('url');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://ueno-www.cdn.prismic.io/api/v2/documents/search?page=1&pageSize=20&orderings=%5Bmy.news_article.publish_date%20desc%5D&ref=Xg34HRIAACAAbitc&q=%5B%5Bat(document.type%2C%20%22news_article%22)%5D%5D',
        headers: {
            Referer: 'https://ueno.co/news',
        },
    });

    const data = response.data.results;

    ctx.state.data = {
        title: 'ueno. News',
        link: 'https://ueno.co/news',
        description: 'ueno. News',
        item: data.map((item) => ({
            title: item.data.title[0].text,
            description: `<img src="${item.data.image.grid_x1.url}"><br/><p>${item.data.description[0].text}</p>`,
            pubDate: new Date(item.data.publish_date).toUTCString(),
            link: `https://ueno.co/news/${item.uid}`,
        })),
    };
};
