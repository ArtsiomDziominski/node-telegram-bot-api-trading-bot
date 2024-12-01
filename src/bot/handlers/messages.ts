import TelegramBot from 'node-telegram-bot-api';

export const handleMessages = (bot: TelegramBot) => {
	bot.on('message', () => {
		// bot.sendMessage(msg.chat.id, 'Привет!');
	});
};
