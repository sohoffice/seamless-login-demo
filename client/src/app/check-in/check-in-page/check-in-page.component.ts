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
  selector: 'sl-check-in-page',
  templateUrl: './check-in-page.component.html',
  styleUrls: ['./check-in-page.component.scss']
})
export class CheckInPageComponent implements OnInit, OnDestroy {
  private authWorker: SocketWorker<string>;

  id: string = Math.round(Math.random() * 10000.0).toString();

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
      console.log('remote message: ', x);
    });
  }

  ngOnDestroy(): void {
    this.sub1.unsubscribe();
  }

  onPunchIn() {
    this.authWorker.send(`From ${this.id}`);
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
