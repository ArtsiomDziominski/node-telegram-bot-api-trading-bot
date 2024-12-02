import TelegramBot from 'node-telegram-bot-api';

export const handleCommands = (bot: TelegramBot) => {

	bot.onText(/\/start/, (msg: any) => {
		bot.sendMessage(msg.chat.id, 'Для входа используйте команду /login');
	});

	bot.onText(/\/info/, (msg: any) => {
		bot.sendMessage(msg.chat.id, 'Этот бот предназначен для отправки уведомлений о ваших ботах');
	});
};
