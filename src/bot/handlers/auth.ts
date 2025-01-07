import TelegramBot from 'node-telegram-bot-api';
import axios from "axios";
import { encryptPassword } from "../../utils/encrypt";


export const handleAuth = (bot: TelegramBot) => {
	const BURL = process.env.SERVER_URL;
	const userLoginRequest: Record<string, any> = {};

	bot.onText(/\/login/, (msg: any) => {
		userLoginRequest[msg.chat.id] = {isLogin: true, isPassword: false};
		bot.sendMessage(msg.chat.id, 'Введите логин:');
	});

	bot.on('message', (msg: any) => {
		const chatId = msg.chat.id.toString();
		const text = msg?.text;
		if (userLoginRequest?.[chatId]?.isLogin) {
			userLoginRequest[chatId] = {...userLoginRequest[chatId], isLogin: false, mail: text, isPassword: true}
			bot.sendMessage(chatId, 'Введите пароль:');
		} else if (userLoginRequest?.[chatId]?.isPassword) {
			userLoginRequest[chatId].isPassword = false;
			const passwordEncrypt = encryptPassword(text);
			axios.post(BURL + '/auth/login',
				{
					mail: userLoginRequest[chatId].mail,
					password: passwordEncrypt
				}).then((response: any) => {
				const token = response?.data?.token
				if (token) {
					bot.sendMessage(chatId, 'Вы успешно вошли');
				} else bot.sendMessage(chatId, 'Не удалось получить токен');
			}).catch((error: any) => {
				bot.sendMessage(chatId, error?.response?.data?.message || 'Не удалось выполнить вход');
			})
			delete userLoginRequest[chatId];
		}
	});

	bot.onText(/\/logout/, (msg: any) => {
		bot.sendMessage(msg.chat.id, 'Вы успешно вышли. Для входа используйте команду /login');
	});
};
