const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();
const nodemailer = require('nodemailer');

const url = 'http://books.toscrape.com/';

async function fetchData() {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const livros = [];
    
    $('.product_pod').slice(0, 5).each((index, element) => {
      const title = $(element).find('h3 a').attr('title');
      const price = $(element).find('.price_color').text();
      livros.push({ title, price });
    });

    if (livros.length > 0) {
      sendEmail(livros);
    } else {
      console.log('Nenhum livro encontrado.');
    }
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(livros) {
  try {
    const conteudoEmail = livros.map((livro, index) => 
      `${index + 1}. ${livro.title} - ${livro.price}`
    ).join('\n');

    const info = await transporter.sendMail({
      from: `"Scraping Books" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEBER,
      subject: 'Novos Livros Disponíveis!',
      text: conteudoEmail,
    });

    console.log('E-mail enviado: %s', info.messageId);
  } catch (error) {
    console.error('Erro ao enviar o e-mail:', error);
  }
}

fetchData();
