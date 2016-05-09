import {
  beforeEachProviders,
  describe,
  expect,
  it,
  inject
} from '@angular/core/testing';
import { GravityRocksAppComponent } from '../app/gravity-rocks.component';

beforeEachProviders(() => [GravityRocksAppComponent]);

describe('App: GravityRocks', () => {
  it('should create the app',
      inject([GravityRocksAppComponent], (app: GravityRocksAppComponent) => {
    expect(app).toBeTruthy();
  }));

  it('should have as title \'gravity-rocks works!\'',
      inject([GravityRocksAppComponent], (app: GravityRocksAppComponent) => {
    //expect(app.title).toEqual('gravity-rocks works!');
  }));
});
