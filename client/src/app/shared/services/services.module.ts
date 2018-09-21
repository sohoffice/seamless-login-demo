import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {SocketService} from './socket.service';
import {IdentityService} from './identity.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    SocketService,
    IdentityService
  ]
})
export class ServicesModule { }
