import { Component } from '@angular/core';
import { HTTP_PROVIDERS } from '@angular/http';
import {MD_SIDENAV_DIRECTIVES} from '@angular2-material/sidenav';
import {MdToolbar} from '@angular2-material/toolbar';
import {MdIcon, MdIconRegistry} from '@angular2-material/icon';
import {MdButton} from '@angular2-material/button';
import {MD_LIST_DIRECTIVES} from '@angular2-material/list';
import {Routes , ROUTER_PROVIDERS, ROUTER_DIRECTIVES} from '@angular/router';
import {GravityWorldComponent} from './gravity-world/index';

@Component({
  moduleId: module.id,
  selector: 'gravity-rocks-app',
  templateUrl: 'gravity-rocks.component.html',
  styleUrls: ['gravity-rocks.component.css'],
  directives: [ROUTER_DIRECTIVES, MD_SIDENAV_DIRECTIVES, MdToolbar, MdIcon, MdButton, MD_LIST_DIRECTIVES],
  providers: [ROUTER_PROVIDERS, HTTP_PROVIDERS, MdIconRegistry]
})
@Routes([
  {path: '/gravityWorld', component: GravityWorldComponent}
])
export class GravityRocksAppComponent {

  constructor(iconRegistry: MdIconRegistry) {
    iconRegistry.setDefaultFontSetClass('material-icons');
  }
}
