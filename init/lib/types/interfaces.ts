export interface UserClient {
    _id: number,
    username: string,
    password: string
}

export interface ResultsSaveUserClient {
    lastInsertId: number,
	data: UserClient
}