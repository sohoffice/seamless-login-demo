export enum AuthCommand {
  AUTH = 'AUTH',
  handle = 'HANDLE',
  token = 'TOKEN'
}

export class AuthMessage {
  authHandle?: string;
  accessToken?: string;

  constructor(public command: AuthCommand) {
  }
}
