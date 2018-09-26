import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Subscription, of} from 'rxjs';
import {tap, flatMap} from 'rxjs/operators';
import {AuthFlowMachine, AuthFlowState, IdentityService} from '../../shared/services/identity.service';
import {CheckInService} from '../../shared/services/check-in.service';
import {CheckInRecord} from '../../models/check-in-record';
import {MatSnackBar} from '@angular/material';

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
  private authMachine: AuthFlowMachine;

  constructor(private identityService: IdentityService,
              private checkInService: CheckInService,
              private snackBar: MatSnackBar,
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
      this.snackBar.open('Already signed in', 'OK');
    } else {
      this.identityService.startAuthProcess().pipe(
        tap(am => {
          this.authMachine = am;

          this.$sub2 = am.observable.pipe(
            tap(this.retrieveHandle.bind(this)),
            tap(this.handleAuthenticated.bind(this))
          ).subscribe(x => console.log('Auth flow state', x));
        })
      ).subscribe(x => console.log('start auth process', x));

      if (this.$sub1 === undefined) {
        this.$sub1 = this.identityService.logObservable.pipe(
          tap(
            this.pushMessage.bind(this)
          )
        ).subscribe(x => {
          console.log('Auth message: ', x);
        });
      }
    }
  }

  onOpenLoginDialog() {
    this.window.open(`https://${this.remoteHost}/external/login?handle=${this.handle}`, '_blank',
      'height=500,width=500');
  }

  private updateCheckIns() {
    return this.checkInService.getCheckins().pipe(
      tap(checkIns => this.currentCheckIns = checkIns)
    ).subscribe(x => console.log('check-in-page update check-ins finished.', x));
  }

  private retrieveHandle(x: AuthFlowState) {
    if (x === AuthFlowState.AuthHandle) {
      this.handle = this.authMachine.handle;

      this.onOpenLoginDialog();
    }
  }

  private handleAuthenticated(state: AuthFlowState) {
    if (state === AuthFlowState.Authenticated) {
      this.checkInService.checkIn(
        parseInt(this.authMachine.token)
      ).pipe(
        tap(this.updateCheckIns.bind(this))
      ).subscribe(x => console.log('check-in-page check in', x));
    }
  }

  private pushMessage(msg: string) {
    this.messages.splice(0, 0, msg);
    if (this.messages.length > MAX_MESSAGES) {
      this.messages.splice(MAX_MESSAGES, this.messages.length - MAX_MESSAGES);
    }
  }
}
