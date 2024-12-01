interface UserState {
	password?: string;
	initialMessage?: string;
}

const userStates: { [userId: string]: UserState } = {};
