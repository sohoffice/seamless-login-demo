import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CheckInPageComponent} from "./check-in-page/check-in-page.component";

const routes: Routes = [
  { path: 'punch',  component: CheckInPageComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class CheckInRoutingModule { }
