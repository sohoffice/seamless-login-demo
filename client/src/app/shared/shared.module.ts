import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material/material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ServicesModule } from './services/services.module';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    ServicesModule,
  ],
  exports: [
    HttpClientModule,
    MaterialModule,
    ServicesModule,
  ],
  declarations: []
})
export class SharedModule { }
