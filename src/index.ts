import axios, { AxiosInstance }  from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

// Create instance and wrap
const jar = new CookieJar();

// TypeScript conflict due to Axios type resolution — safe to force cast
const client = wrapper((axios as any).create({ jar, withCredentials: true })) as AxiosInstance;


async function login() {
  const loginPage = await client.get('https://challenge.sunvoy.com/login');
  const $ = cheerio.load(loginPage.data);
  const nonce = $('input[name="nonce"]').val();

  if (!nonce) throw new Error('Nonce not found');

  const form = new URLSearchParams({
    username: 'demo@example.org',
    password: 'test',
    nonce: nonce as string,
  });

  await client.post('https://challenge.sunvoy.com/login', form.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const response = await client.post('https://challenge.sunvoy.com/api/users');

  // Save full response to JSON file
  fs.writeFileSync('users.json', JSON.stringify(response.data, null, 2));

  console.log('JSON data saved to users.json');
}

login().catch(console.error);
