import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PunchPageComponent} from './punch-page/punch-page.component';

const routes: Routes = [
  { path: 'punch',  component: PunchPageComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class PunchRoutingModule { }
