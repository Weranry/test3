const express = require('express');
const { createCanvas, registerFont } = require('canvas');
const { Solar, Lunar } = require('lunar-javascript');
const path = require('path');

const app = express();

// 注册字体
registerFont(path.join(__dirname, '..', 'fonts', 'simhei.ttf'), { family: 'SimHei' });

// 获取农历信息的函数
function getPerpetualOutput() {
    const solar = Solar.fromDate(new Date());
    const lunar = Lunar.fromDate(new Date());
    const shuJiu = lunar.getShuJiu();
    const shuJiuString = shuJiu ? shuJiu.toFullString() : 'N/A';
    const Fu = lunar.getFu();
    const FuString = Fu ? Fu.toFullString() : 'N/A';

    return {
        SolarYear: solar.getYear().toString() + '年',
        SolarMonth: solar.getMonth().toString() + '月',
        SolarDay: solar.getDay().toString() + '日',
        WeekDay: '星期' + solar.getWeekInChinese(),
        lunarMonth: lunar.getMonthInChinese() + '月',
        lunarDay: lunar.getDayInChinese(),
        ganzhiYear: lunar.getYearInGanZhiByLiChun() + '年',
        ganzhiMonth: lunar.getMonthInGanZhiExact() + '月',
        ganzhiDay: lunar.getDayInGanZhiExact() + '日',
        yuexiang: lunar.getYueXiang() + '月',
        wuhou: lunar.getWuHou(),
        hou: lunar.getHou(),
        shujiu: shuJiuString,
        fu: FuString,
    };
}

// 生成图片的函数
function generateImage(data) {
    const canvas = createCanvas(400, 300);
    const ctx = canvas.getContext('2d');

    // 设置背景
    const gradient = ctx.createLinearGradient(0, 0, 400, 300);
    gradient.addColorStop(0, '#f6d365');
    gradient.addColorStop(1, '#fda085');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);

    // 设置文本样式
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 16px SimHei';
    ctx.textAlign = 'center';

    // 绘制标题
    ctx.font = 'bold 24px SimHei';
    ctx.fillText('农历信息', 200, 40);

    // 绘制文本
    ctx.font = 'bold 16px SimHei';
    let y = 80;
    const leftX = 100;
    const rightX = 300;
    let isLeft = true;

    for (const [key, value] of Object.entries(data)) {
        const x = isLeft ? leftX : rightX;
        ctx.fillText(`${key}: ${value}`, x, y);
        if (!isLeft) y += 30;
        isLeft = !isLeft;
    }

    // 绘制边框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 390, 290);

    return canvas.toBuffer();
}

// API端点：获取图片
app.get('/api/lunar/getpic', (req, res) => {
    const data = getPerpetualOutput();
    const image = generateImage(data);
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': image.length
    });
    res.end(image);
});

// API端点：获取JSON数据
app.get('/api/lunar/getapi', (req, res) => {
    const data = getPerpetualOutput();
    res.json(data);
});

// 导出 app
module.exports = app;