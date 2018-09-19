import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ServicesModule } from './services/services.module';

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    MaterialModule,
    ServicesModule,
  ],
  exports: [
    MaterialModule,
    ServicesModule,
  ],
  declarations: []
})
export class SharedModule { }
