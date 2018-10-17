import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TileComponent, TileIconPipe } from './tile/tile.component';

import {MatIconModule} from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
  ],
  declarations: [
    TileComponent,
    TileIconPipe,
  ],
  exports: [
    TileComponent,
  ],
})
export class SharedModule { }
