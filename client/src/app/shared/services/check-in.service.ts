import {Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CheckInRecord} from '../../models/check-in-record';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable()
export class CheckInService {

  constructor(@Inject('remoteHost') private remoteHost: string,
              private http: HttpClient) {
  }

  getCheckins(): Observable<CheckInRecord[]> {
    return this.http.get(`http://${this.remoteHost}/check-in`).pipe(
      map(this.mapToCheckInRecord.bind(this))
    );
  }

  checkIn(userId: number): Observable<any> {
    return this.http.post(`http://${this.remoteHost}/check-in?userId=${userId}`, {});
  }

  private mapToCheckInRecord(x: any): CheckInRecord[] {
    return x as CheckInRecord[];
  }
}
