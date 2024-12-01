import WebSocket from 'ws';
import TelegramBot from 'node-telegram-bot-api';

class WebSocketClient {
	private static instance: WebSocketClient;
	private bot: TelegramBot;
	private userSockets: Map<string, WebSocket> = new Map();

	private constructor(bot: TelegramBot) {
		this.bot = bot;
	}

	public static getInstance(bot: TelegramBot): WebSocketClient {
		if (!WebSocketClient.instance) {
			WebSocketClient.instance = new WebSocketClient(bot);
		}
		return WebSocketClient.instance;
	}

	public addUser(chatId: string, initialMessage?: object): void {
		const WS_URL = process.env.WS_SERVER_URL;

		const connect = () => {
			if (!WS_URL) return;
			const ws = new WebSocket(WS_URL);

			ws.on('open', () => {
				console.log(`WebSocket для пользователя ${chatId} подключен.`);

				if (initialMessage) {
					ws.send(JSON.stringify(initialMessage));
					console.log(`Сообщение отправлено пользователю ${chatId}.`);
				}
			});

			ws.on('message', (message: string) => {
				const msgObj = JSON.parse(message);
				if (msgObj?.type !== 'NOTIFICATION_POSITION_RISK') this.bot.sendMessage(chatId, msgObj?.data?.message || msgObj?.message || 'error');
			});

			ws.on('error', (error: any) => {
				console.error(`Ошибка WebSocket для пользователя ${chatId}:`, error);
			});

			ws.on('close', () => {
				console.log(`WebSocket для пользователя ${chatId} отключен. Попытка переподключения через 30 секунд...`);
				this.userSockets.delete(chatId);

				setTimeout(() => {
					console.log(`Переподключение WebSocket для пользователя ${chatId}...`);
					connect();
				}, 30000);
			});

			this.userSockets.set(chatId, ws);
		};

		connect();
	}


	public removeUser(chatId: string): void {
		const ws = this.userSockets.get(chatId);
		if (ws) {
			ws.close();
			this.userSockets.delete(chatId);
			console.log(`Пользователь ${chatId} отключен от WebSocket.`);
		}
	}

	public sendMessage(chatId: string, message: object): void {
		const ws = this.userSockets.get(chatId);
		if (ws && ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(message));
		} else {
			this.addUser(chatId, message)
		}
	}

	public getStatus(chatId: string): string {
		const ws = this.userSockets.get(chatId);
		if (ws && ws.readyState) return String(ws?.readyState)
		else return String('ws not found');
	}
}

export default WebSocketClient;
