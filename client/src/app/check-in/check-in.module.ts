import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {SharedModule} from '../shared/shared.module';
import {CheckInPageComponent} from "./check-in-page/check-in-page.component";
import {CheckInRoutingModule} from "./check-in-routing.module";

@NgModule({
  imports: [
    CommonModule,
    CheckInRoutingModule,
    SharedModule
  ],
  declarations: [CheckInPageComponent]
})
export class CheckInModule { }
