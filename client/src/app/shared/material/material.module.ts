import {NgModule} from '@angular/core';
import {MatButtonModule, MatCardModule, MatChipsModule, MatDividerModule, MatGridListModule, MatListModule} from '@angular/material';

@NgModule({
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatGridListModule,
    MatListModule,
  ],
  exports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatGridListModule,
    MatListModule,
  ],
  declarations: []
})
export class MaterialModule { }
