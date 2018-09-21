export enum AuthCommand {
  HELO = 'HELO',
  ACK = 'ACK',
  AUTH = 'AUTH',
  HANDLE = 'HANDLE',
  TOKEN = 'TOKEN'
}

export interface AuthMessage {
  handle?: string;
  token?: string;
  command?: AuthCommand;
}
