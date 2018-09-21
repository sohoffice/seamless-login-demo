import {Injectable} from '@angular/core';
import {from, Observable, Observer, Subject} from 'rxjs';
import {publishReplay, refCount} from 'rxjs/operators';

@Injectable()
export class SocketService {

  /**
   * Mapping (workerId: WorkerId) -> SocketWorker
   */
  private socketWorkers: { [key: string]: SocketWorker<any> } = {};

  constructor() {
  }

  getWorker<T>(url: string, reader: (s: string) => T, writer: (msg: T) => string): SocketWorker<T> {
    if (!(url in this.socketWorkers)) {
      this.socketWorkers[url] = new SocketWorker(url, reader, writer);
    }
    return this.socketWorkers[url];
  }

}

export class SocketWorker<T> {
  private readonly subject: Subject<T>;
  private socket: WebSocket;

  constructor(url: string,
              private reader: (s: string) => T,
              private writer: (msg: T) => string) {
    const socket = this.socket = new WebSocket(url);

    const observable: Observable<T> = Observable.create(
      (obs: Observer<T>) => {
        socket.onmessage = (msg: MessageEvent) => {
          obs.next(this.reader(msg.data as string));
        };
        socket.onerror = obs.error.bind(obs);
        socket.onclose = obs.complete.bind(obs);
        return socket.close.bind(socket);
      }
    ).pipe(
      publishReplay(), refCount()
    );
    const observer = {
      next: (data: T) => {
        if (socket.readyState === WebSocket.OPEN) {
          const s = this.writer(data);
          socket.send(s);
        }
      }
    };

    this.subject = Subject.create(observer, observable);
  }

  asObservable(): Observable<T> {
    return from(this.subject);
  }

  send(msg: T) {
    this.subject.next(msg);
  }

  close() {
  }

}
