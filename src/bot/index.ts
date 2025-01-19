import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { handleCommands } from './handlers/commands';
import { handleMessages } from "./handlers/messages";
import { handleAuth } from "./handlers/auth";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
	console.error('Токен Telegram бота не найден в переменных окружения');
} else {
	const bot = new TelegramBot(token, {
		polling: {
			interval: 300,
			autoStart: true,
			params: {
				timeout: 10
			}
		}
	});

	handleCommands(bot);
	handleMessages(bot);
	handleAuth(bot);

	console.log('Started telegram bot')
}


