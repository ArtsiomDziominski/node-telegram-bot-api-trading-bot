import WebSocket from 'ws';
import TelegramBot from 'node-telegram-bot-api';
import fs from "fs";

interface UserSocket {
	ws: WebSocket;
	initialMessage?: object;
}

class WebSocketClient {
	private static instance: WebSocketClient;
	private bot: TelegramBot;
	private userSockets: Map<string, UserSocket> = new Map();

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
				const blockNotification = ['NOTIFICATION_POSITION_RISK', 'NOTIFICATION_AUTH'];
				if (!blockNotification.includes(msgObj?.type) && msgObj?.data?.message) this.bot.sendMessage(chatId, msgObj?.data?.message || 'error');
			});

			ws.on('error', (error: any) => {
				console.error(`Ошибка WebSocket для пользователя ${chatId}:`, error);
			});

			ws.on('close', () => {
				console.log(`WebSocket для пользователя ${chatId} отключен. Попытка переподключения через 10 секунд...`);
				this.userSockets.delete(chatId);

				setTimeout(() => {
					console.log(`Переподключение WebSocket для пользователя ${chatId}...`);
					connect();
				}, 10000);
			});

			try {
				let data = JSON.stringify([...this.userSockets.entries()]);
				fs.writeFileSync('files/usersws.json', data);
			} catch (e) {
				console.log(new Date());
				console.log(e);
				setTimeout(() => connect(), 10000);
			}
		};

		connect();
	}

	public removeUser(chatId: string): void {
		const userSocket = this.userSockets.get(chatId);
		if (userSocket?.ws) {
			userSocket.ws.close();
			this.userSockets.delete(chatId);
			console.log(`Пользователь ${chatId} отключен от WebSocket.`);
		}
	}

	public sendMessage(chatId: string, message: object): void {
		const userSocket = this.userSockets.get(chatId);
		if (userSocket?.ws && userSocket.ws.readyState === WebSocket.OPEN) userSocket.ws.send(JSON.stringify(message));
		else this.addUser(chatId, message);
	}

	public getStatus(chatId: string): number | undefined {
		const userSocket = this.userSockets.get(chatId);
		if (userSocket?.ws && userSocket.ws.readyState) return userSocket.ws.readyState;
		else return undefined;
	}
}

export default WebSocketClient;
