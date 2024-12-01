import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { handleCommands } from './handlers/commands';
import { handleCommandsWS } from "./handlers/commandsWS";
import { handleMessages } from "./handlers/messages";
import WebSocketClient from "./services/websocketClient";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
	console.error('Токен Telegram бота не найден в переменных окружения');
} else {
	const bot = new TelegramBot(token, { polling: true });
	const wsClient = WebSocketClient.getInstance(bot); // Правильная передача бота

	handleCommands(bot);
	handleCommandsWS(bot);
	handleMessages(bot);
}


