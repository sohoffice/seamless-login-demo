import {Component, OnDestroy, OnInit} from '@angular/core';
import {SocketService, SocketWorker, WorkerId} from '../../shared/services/socket.service';
import {Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';

const MAX_MESSAGES = 30;

interface MessageRecord {
  message: string;
  no: number;
}

@Component({
  selector: 'sl-punch-page',
  templateUrl: './punch-page.component.html',
  styleUrls: ['./punch-page.component.scss']
})
export class PunchPageComponent implements OnInit, OnDestroy {
  private authWorker: SocketWorker<string>;

  messages: MessageRecord[] = [];
  private sub1: Subscription;
  private counter = 0;

  constructor(private sockerService: SocketService) {
  }

  ngOnInit() {
    this.authWorker = this.sockerService.getWorker<string>(WorkerId.auth);
    this.sub1 = this.authWorker.asObservable().pipe(
      tap(
        this.pushMessage.bind(this)
      )
    ).subscribe(x => {
      console.log('Punch message: ', x);
    });
  }

  ngOnDestroy(): void {
    this.sub1.unsubscribe();
  }

  onPunchIn() {
    this.authWorker.send('something');
  }

  private pushMessage(msg: string) {
    this.messages.push({
      message: msg, no: this.counter++
    });
    if (this.messages.length > MAX_MESSAGES) {
      this.messages.splice(0, this.messages.length - MAX_MESSAGES);
    }
  }
}
