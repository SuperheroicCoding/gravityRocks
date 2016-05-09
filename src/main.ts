import 'rxjs/Rx';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import {GravityRocksAppComponent, environment} from './app/index';

if (environment.production) {
  enableProdMode();
}

bootstrap(GravityRocksAppComponent);
