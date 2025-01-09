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
			axios.post(BURL + '/auth/login/telegram',
				{
					mail: userLoginRequest[chatId].mail,
					password: passwordEncrypt,
					tgId: chatId,
				}).then((response: any) => {
				if (response?.data?.success) bot.sendMessage(chatId, response?.data?.message || 'Вы успешно вошли');
				else bot.sendMessage(chatId, response?.data?.message || 'Не удалось получить токен');
			}).catch((error: any) => bot.sendMessage(chatId, error?.response?.data?.message || 'Не удалось выполнить вход'))
			delete userLoginRequest[chatId];
		}
	});

	bot.onText(/\/logout/, (msg: any) => {
		const chatId = msg.chat.id.toString();
		axios.delete(BURL + '/auth/loginout/telegram', {data: { tgId: chatId }})
			.then((response: any) => bot.sendMessage(msg.chat.id, response?.data?.message || 'Вы успешно вышли. Для входа используйте команду /login'))
			.catch((error: any) => bot.sendMessage(msg.chat.id, error?.data?.message || 'Не удалось выйти'))

	});
};
