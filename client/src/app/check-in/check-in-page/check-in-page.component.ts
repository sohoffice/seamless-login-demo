import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';
import {AuthFlowState, IdentityService} from '../../shared/services/identity.service';

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

  messages: string[] = [];
  public handle: string;

  private $sub1: Subscription;
  private $sub2: Subscription;

  constructor(private identityService: IdentityService,
              @Inject('window') private window: Window,
              @Inject('remoteHost') private remoteHost: string) {
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.$sub1.unsubscribe();
    this.$sub2.unsubscribe();
  }

  onCheckIn() {
    if (this.identityService.isSignedIn()) {
      console.log('already signed in');
    } else {
      this.$sub2 = this.identityService.startAuthProcess().pipe(
        tap(this.retrieveHandle.bind(this))
      ).subscribe(x => console.log('Auth flow state', x));

      this.$sub1 = this.identityService.logObservable.pipe(
        tap(
          this.pushMessage.bind(this)
        )
      ).subscribe(x => {
        console.log('Auth message: ', x);
      });
    }
  }

  onOpenLoginDialog() {
    this.window.open(`http://${this.remoteHost}/callback?id=${this.handle}`, '_blank',
      'height=200,width=200');
  }

  private retrieveHandle(x: AuthFlowState) {
    if (x === AuthFlowState.AuthHandle) {
      this.handle = this.identityService.handle;
    }
  }

  private pushMessage(msg: string) {
    this.messages.push(msg);
    if (this.messages.length > MAX_MESSAGES) {
      this.messages.splice(0, this.messages.length - MAX_MESSAGES);
    }
  }
}
