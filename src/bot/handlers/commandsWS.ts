import TelegramBot from 'node-telegram-bot-api';
import WebSocketClient from "../services/websocketClient";

enum WebSocketStatus {
	'CONNECTING',
	'OPEN',
	'CLOSING',
	'CLOSED'
}

const WebSocketStatusInfo = {
	[WebSocketStatus.CONNECTING]: 'Устанавливается соединение...',
	[WebSocketStatus.OPEN]: 'Соединение активно и стабильное',
	[WebSocketStatus.CLOSING]: 'Соединение закрывается...',
	[WebSocketStatus.CLOSED]: 'Соединение закрыто',
};


export const handleCommandsWS = (bot: TelegramBot) => {
	const wsClient = WebSocketClient.getInstance(bot);

	const loginJWT: { [userId: string]: any } = {};

	bot.onText(/\/disconnect/, (msg: any) => {
		const chatId = msg.chat.id.toString();
		wsClient.removeUser(chatId);
		bot.sendMessage(chatId, 'Вы отключены от WebSocket.');
	});

	bot.onText(/\/check/, (msg: any) => {
		const chatId = msg.chat.id.toString();
		const status = wsClient.getStatus(chatId) as WebSocketStatus || undefined;
		bot.sendMessage(chatId, WebSocketStatusInfo?.[status || WebSocketStatus.CLOSED]);
	});

	bot.onText(/\/send (.+)/, (msg: any, match: any) => {
		const message = match ? match[1] : '';
		const chatId = msg.chat.id.toString();
		wsClient.sendMessage(chatId, {message});
		bot.sendMessage(msg.chat.id, `Сообщение "${message}" отправлено на WebSocket.`);
	});

	bot.onText(/\/login_jwt/, (msg: any) => {
		const chatId = msg.chat.id.toString();
		loginJWT[chatId] = { awaiting: true };
		bot.sendMessage(msg.chat.id, `Введите jwt токен:`);
	});

	bot.on('message', (msg: any) => {
		const chatId = msg.chat.id.toString();
		if (chatId && loginJWT?.[chatId]?.awaiting) {
			const message = msg?.text;
			if (message) {
				wsClient.sendMessage(chatId, {authorization: message});
				bot.sendMessage(msg.chat.id, 'authorization успешно установлен!');
				loginJWT[chatId].awaiting = false;
			} else {
				bot.sendMessage(msg.chat.id, 'Не может быть пустым. Попробуйте снова.');
			}
		}
	});
};
