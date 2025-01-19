const keyboardLogin = {
	reply_markup: {
		keyboard: [
			[{ text: 'Отмена' }]
		],
		one_time_keyboard: true,
		resize_keyboard: true
	}
};

const useKeyboardAuth = () => ({
	keyboardLogin
})

export default useKeyboardAuth