import {Injectable} from '@angular/core';
import {from, Observable, Subject, Observer} from 'rxjs';
import {map} from 'rxjs/operators';

const AuthWorkerUrl = 'ws://localhost:9000/auth';

@Injectable()
export class SocketService {

  /**
   * Mapping (workerId: WorkerId) -> SocketWorker
   */
  private socketWorkers: { [key: string]: SocketWorker<any> } = {};

  constructor() {
  }

  getWorker<T>(id: WorkerId): SocketWorker<T> {
    const workerId = id.toString();
    if (!(workerId in this.socketWorkers)) {
      this.socketWorkers[workerId] = new SocketWorker(this.getUrl(id));
    }
    return this.socketWorkers[workerId];
  }

  private getUrl(id: WorkerId): string {
    if (id === WorkerId.auth) {
      return AuthWorkerUrl;
    }
  }
}

export enum WorkerId {
  auth = 'auth'
}

export class SocketWorker<T> {
  private readonly subject: Subject<T>;
  private socket: WebSocket;

  constructor(url: string) {
    const socket = this.socket = new WebSocket(url);

    const observable = Observable.create(
      (obs: Observer<T>) => {
        socket.onmessage = obs.next.bind(obs);
        socket.onerror = obs.error.bind(obs);
        socket.onclose = obs.complete.bind(obs);
        return socket.close.bind(socket);
      }
    );
    const observer = {
      next: (data: any) => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(data);
        }
      }
    };

    this.subject = Subject.create(observer, observable);
  }

  asObservable(): Observable<T> {
    return from(this.subject).pipe(
      map(this.extractMessagePayload.bind(this))
    );
  }

  send(msg: T) {
    this.subject.next(msg);
    // this.socket.send(msg);
  }

  private extractMessagePayload(msg: MessageEvent): T {
    return msg.data as T;
  }
}
