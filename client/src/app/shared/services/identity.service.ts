import {Inject, Injectable} from '@angular/core';
import {SocketService, SocketWorker, WorkerId} from './socket.service';
import {AuthCommand, AuthMessage} from '../../models/auth-message';
import {Observable, Subject, Subscriber, Subscription} from 'rxjs';
import {map, tap} from 'rxjs/operators';

@Injectable()
export class IdentityService {

  private _authWorker: SocketWorker<AuthMessage>;
  private _authFlow: AuthFlowMachine;
  private _authLog: Subject<string> = new Subject<string>();

  constructor(private socketService: SocketService,
              @Inject('remoteHost') private remoteHost: string) {
    const url = `ws://${remoteHost}/auth`;
    this._authWorker = this.socketService.getWorker<AuthMessage>(url, JSON.parse, JSON.stringify);

    // subscribe the inbound messages.
    this._authWorker.asObservable().pipe(
      map(this.authMessageToString.bind(this))
    ).subscribe(this._authLog);
  }

  isSignedIn(): boolean {
    return this._authFlow !== undefined && this._authFlow.token !== undefined;
  }

  /**
   * Start the auth process.
   *
   * The observer must look for the following states:
   *
   * - AuthFlowState.Handle, We've received the handle, open the login dialog to auth provider.
   * - AuthFlowState.Authenticated, The user has been authenticated.
   *
   * @return {Observable<AuthFlowState>}
   */
  startAuthProcess(): Observable<AuthFlowState> {
    if (this._authFlow === undefined) {
      this._authFlow = new AuthFlowMachine(this._authWorker);
    }
    const observable: Observable<AuthFlowState> = this._authFlow.start();

    // subscribe the outbound messages
    this._authFlow.outboundObservable.pipe(
      map(this.authMessageToString.bind(this))
    ).subscribe(this._authLog);

    return observable;
  }

  get handle(): string {
    if (this._authFlow !== undefined) {
      return this._authFlow.handle;
    }
  }

  get token(): string {
    if (this._authFlow !== undefined) {
      return this._authFlow.token;
    }
  }

  get logObservable(): Observable<string> {
    return this._authLog;
  }

  private authMessageToString(msg: AuthMessage): string {
    return `${msg.command} ${msg.handle || ''}${msg.token || ''}`;
  }
}

export enum AuthFlowState {
  Helo = 0,
  HeloAck = 1,
  Auth = 2,
  AuthHandle = 3,
  Authenticated = 4,
  Discarded = 5
}

class AuthFlowMachine {
  private state: AuthFlowState;
  private _handle: string;
  private _token: string;

  private _emitter: Subscriber<AuthFlowState>;
  private _observable: Observable<AuthFlowState>;
  private _outboundEmitter: Subscriber<AuthMessage>;
  private _outboundObservable: Observable<AuthMessage>;
  private $sub: Subscription;

  constructor(private authWorker: SocketWorker<AuthMessage>) {
    this.$sub = this.authWorker.asObservable().pipe(
      tap(this.progressState.bind(this))
    ).subscribe(x => console.log('AuthFlowMachine received auth message: ', x));
  }

  start(): Observable<AuthFlowState> {
    if (this.state === undefined) {
      // create the observables
      this._observable = Observable.create(observer => {
        this._emitter = observer;
      });
      this._observable.subscribe(dummyFunction);
      this._outboundObservable = Observable
        .create(observer => this._outboundEmitter = observer);
      this._outboundObservable.subscribe(dummyFunction);

      // send the message.
      const msg = {
        command: AuthCommand.HELO
      };
      setTimeout(() => {
        this.send(msg, AuthFlowState.Helo);
      }, 100);
    }

    return this._observable;
  }

  get handle(): string {
    return this._handle;
  }

  get token(): string {
    return this._token;
  }

  get outboundObservable() {
    return this._outboundObservable;
  }

  private send(msg: AuthMessage, state: AuthFlowState) {
    this.authWorker.send(msg);
    this.state = state;
    this._outboundEmitter.next(msg);
  }

  private progressState(msg: AuthMessage) {
    if (msg.command === AuthCommand.ACK) {
      if (this.state === AuthFlowState.Helo) {
        this.state = AuthFlowState.HeloAck;
        this.notifyStateChange();

        // go to the next step, AUTH
        this.send({
          command: AuthCommand.AUTH
        }, AuthFlowState.Auth);

        return;
      }
    } else if (msg.command === AuthCommand.HANDLE) {
      if (this.state === AuthFlowState.Auth) {
        this.state = AuthFlowState.AuthHandle;
        this._handle = msg.handle;
        this.notifyStateChange();
        return;
      }
    } else if (msg.command === AuthCommand.TOKEN) {
      if (this.state === AuthFlowState.AuthHandle) {
        this.state = AuthFlowState.Authenticated;
        this._token = msg.token;
        this.notifyStateChange();

        // we should close the channel now.
        this._emitter.complete();
        this._outboundEmitter.complete();
        this.$sub.unsubscribe();
        this.authWorker.close();

        return;
      }
    }
    this.logStateError(msg.command);
  }

  private logStateError(command: AuthCommand) {
    console.warn(`Incorrect auth message received, current state is ${this.state}, but message command is ${command}`);
  }

  private notifyStateChange() {
    this._emitter.next(this.state);
  }
}

const dummyFunction = _ => {
};
