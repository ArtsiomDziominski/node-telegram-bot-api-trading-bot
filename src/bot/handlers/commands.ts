import TelegramBot from 'node-telegram-bot-api';

export const handleCommands = (bot: TelegramBot) => {

	bot.onText(/\/start/, (msg: any) => {
		bot.sendMessage(msg.chat.id, 'Привет!');
	});
};
