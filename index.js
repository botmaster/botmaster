import fetch from 'node-fetch';

import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import Mustache from 'mustache';
import fs from 'fs';
import puppeteerService from './services/puppeteer.service.js'

dotenv.config()

// const puppeteerService = require('./services/puppeteer.service');

const MUSTACHE_MAIN_DIR = './main.mustache';
const locale = 'en-US';
const timezone = 'Europe/Paris';
const imageCount = 8;

let DATA = {
    refresh_date: new Date().toLocaleDateString(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short',
        timeZone: timezone,
    }),
};

async function setWeatherInformation() {
    if(!process.env.OPEN_WEATHER_MAP_KEY) {
        throw new Error("OPEN_WEATHER_MAP_KEY not found!")
    }
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?id=6454071&appid=${process.env.OPEN_WEATHER_MAP_KEY}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        DATA.openweather = {
            city_temp: Math.round(data.main.temp),
            city_weather: data.weather[0].description,
            city_weather_icon: data.weather[0].icon,
            city_weather_icon_url:"https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png",
            sun_rise: new Date(data.sys.sunrise * 1000).toLocaleString(locale, {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: timezone,
            }),
            sun_set: new Date(data.sys.sunset * 1000).toLocaleString(locale, {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: timezone,
            })
        }

    } catch (error) {
        console.log('Error', error);
        process.exit();
    }
}

async function setInstagramPosts() {
    DATA.images = await puppeteerService.getLatestInstagramPostsFromAccount('villedegrenoble', imageCount);
}

async function generateReadMe() {
    await fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
        if (err) throw err;
        const output = Mustache.render(data.toString(), DATA);
        fs.writeFileSync('README.md', output);
    });
}

async function action() {
    /**
     * Fetch Weather
     */
    await setWeatherInformation();

    /**
     * Scrap insta images
     */
    await setInstagramPosts();

    /**
     * Generate README
     */
    await generateReadMe();

    /**
     * Close puppeteer.
     */
    await puppeteerService.close();

    console.log(DATA)
}

action().then();
