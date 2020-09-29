import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GraphPageRoutingModule } from './graph-routing.module';

import { GraphPage } from './graph.page';
import { ChartsModule } from 'ng2-charts';
import { ArrayFilterPipe } from 'src/app/shared/array-filter.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GraphPageRoutingModule,
    ChartsModule,
  ],
  declarations: [GraphPage,ArrayFilterPipe]
})
export class GraphPageModule {}
