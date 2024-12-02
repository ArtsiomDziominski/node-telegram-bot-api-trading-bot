import CryptoJS from 'crypto-js';

export const encryptPassword = (password: string): string => {
	return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
};
