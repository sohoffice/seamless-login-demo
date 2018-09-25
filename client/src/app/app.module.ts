import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SharedModule} from './shared/shared.module';
import {ModelsModule} from './models/models.module';
import {CheckInModule} from './check-in/check-in.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    CheckInModule,
    ModelsModule,
  ],
  providers: [
    {
      provide: 'window', useFactory: () => {
        return window;
      }
    },
    {
      // provide: 'remoteHost', useValue: 'seamless-login-demo.herokuapp.com'
      provide: 'remoteHost', useValue: 'localhost:19000'
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
