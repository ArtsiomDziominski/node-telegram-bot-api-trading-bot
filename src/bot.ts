import TelegramBot from 'node-telegram-bot-api';

// Замените на ваш токен Telegram Bot
const token = 'YOUR_TELEGRAM_BOT_TOKEN';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

interface UserState {
	awaitingPassword: boolean;
	password?: string;
}

const userStates: { [userId: string]: UserState } = {};

// Команда /start
bot.onText(/\/start/, (msg) => {
	bot.sendMessage(
		msg.chat.id,
		'Привет! Я бот. Чтобы установить пароль, отправьте команду /setpassword.'
	);
});

// Команда для установки пароля
bot.onText(/\/setpassword/, (msg) => {
	const userId = msg.from?.id.toString();
	if (userId) {
		userStates[userId] = { awaitingPassword: true };
		bot.sendMessage(msg.chat.id, 'Пожалуйста, введите новый пароль:');
	}
});

// Обработка текстовых сообщений (для установки пароля)
bot.on('message', (msg) => {
	const userId = msg.from?.id.toString();
	const userState = userId ? userStates[userId] : undefined;

	if (userState && userState.awaitingPassword) {
		const password = msg.text;
		if (password) {
			userStates[userId] = { awaitingPassword: false, password };
			bot.sendMessage(msg.chat.id, 'Пароль успешно установлен!');
		} else {
			bot.sendMessage(msg.chat.id, 'Пароль не может быть пустым. Попробуйте снова.');
		}
	}
});
