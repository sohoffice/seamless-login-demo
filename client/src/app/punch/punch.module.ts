import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PunchRoutingModule } from './punch-routing.module';
import { PunchPageComponent } from './punch-page/punch-page.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    PunchRoutingModule,
    SharedModule
  ],
  declarations: [PunchPageComponent]
})
export class PunchModule { }
