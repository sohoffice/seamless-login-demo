import {NgModule} from '@angular/core';
import {MatButtonModule, MatCardModule, MatChipsModule, MatDividerModule, MatListModule} from '@angular/material';

@NgModule({
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
  ],
  exports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
  ],
  declarations: []
})
export class MaterialModule { }
