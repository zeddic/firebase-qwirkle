import { Component, OnInit, Input, HostBinding, Pipe, PipeTransform } from '@angular/core';
import {Tile} from '../models/models';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {

  @Input() tile: Tile;


  @Input() class: string = ''; 
  
  @HostBinding('class')
  get hostClasses() {
    if (!this.tile) {
      return this.class;
    }

    return [
      this.class,
      `color-${this.tile.color}`, 
      `shape-${this.tile.shape}`,
    ].join(' ')
  }

  constructor() { }

  ngOnInit() {

  }
}


@Pipe({name: 'tileIcon'})
export class TileIconPipe implements PipeTransform {
  transform(tile: Tile): string {
    switch (tile.shape) {
      case 0: return 'cake';
      case 1: return 'people';
      case 2: return 'mood';
      case 3: return 'star';
      case 4: return 'brightness_1';
      case 5: return 'brightness_5';
      default: return 'warning';
    }
  }
}