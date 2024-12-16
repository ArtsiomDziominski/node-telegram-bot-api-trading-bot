import fs from "fs";

export function getUserFromFile(chatId: string): any {
	try {
		const data = fs.readFileSync('files/usersws.json', 'utf-8');
		const users = JSON.parse(data);

		const user = users.find(([id]: [string, any]) => id === chatId);

		return user ? { chatId: user[0], ...user[1] } : null;
	} catch (error) {
		console.error("Ошибка при чтении файла usersws.json:", error);
		return null;
	}
}

export function getUsersFromFile(): any {
	try {
		const data = fs.readFileSync('files/usersws.json', 'utf-8');
		const users = JSON.parse(data);

		return users ? users : null;
	} catch (error) {
		console.error("Ошибка при чтении файла usersws.json:", error);
		return null;
	}
}