import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Subscription, of} from 'rxjs';
import {tap, flatMap} from 'rxjs/operators';
import {AuthFlowState, IdentityService} from '../../shared/services/identity.service';
import {CheckInService} from '../../shared/services/check-in.service';
import {CheckInRecord} from '../../models/check-in-record';

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
  currentCheckIns: CheckInRecord[];

  private $sub1: Subscription;
  private $sub2: Subscription;

  constructor(private identityService: IdentityService,
              private checkInService: CheckInService,
              @Inject('window') private window: Window,
              @Inject('remoteHost') private remoteHost: string) {
  }

  ngOnInit() {
    this.updateCheckIns();
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
        tap(this.retrieveHandle.bind(this)),
        tap(this.handleAuthenticated.bind(this))
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
    this.window.open(`http://${this.remoteHost}/external/login?handle=${this.handle}`, '_blank',
      'height=500,width=500');
  }

  private updateCheckIns() {
    return this.checkInService.getCheckins().pipe(
      tap(checkIns => this.currentCheckIns = checkIns)
    ).subscribe(x => console.log('check-in-page update check-ins finished.', x));
  }

  private retrieveHandle(x: AuthFlowState) {
    if (x === AuthFlowState.AuthHandle) {
      this.handle = this.identityService.handle;

      this.onOpenLoginDialog();
    }
  }

  private handleAuthenticated(state: AuthFlowState) {
    if (state === AuthFlowState.Authenticated) {
      this.checkInService.checkIn(
        parseInt(this.identityService.token)
      ).pipe(
        tap(this.updateCheckIns.bind(this))
      ).subscribe(x => console.log('check-in-page check in', x));
    }
  }

  private pushMessage(msg: string) {
    this.messages.push(msg);
    if (this.messages.length > MAX_MESSAGES) {
      this.messages.splice(0, this.messages.length - MAX_MESSAGES);
    }
  }
}
