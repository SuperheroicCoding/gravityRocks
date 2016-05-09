import 'rxjs/Rx';
import {MD_INPUT_DIRECTIVES} from '@angular2-material/input';
import {MD_CARD_DIRECTIVES} from '@angular2-material/card';
import {MdToolbar} from '@angular2-material/toolbar';
import {MdButton} from '@angular2-material/button';
import {MD_LIST_DIRECTIVES} from '@angular2-material/list';
import {Observable} from 'rxjs/Rx';
import { Component, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {Vector2D} from './Vector2D';
import {TimeInterval} from 'rxjs/Rx.KitchenSink';

class Planet {
  constructor(public x: number, public y: number, public mass: number) {
  }
}

@Component({
  moduleId: module.id,
  selector: 'gravity-world',
  templateUrl: 'gravity-world.component.html',
  styleUrls: ['gravity-world.component.css'],
  directives: [MD_CARD_DIRECTIVES, MD_INPUT_DIRECTIVES, MdToolbar, MdButton, MD_LIST_DIRECTIVES],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GravityWorldComponent {
  public MAX_DIM = Vector2D.create(1000, 700);
  private CENTER_POS = this.MAX_DIM.div(2);
  // public listOfPlanets = [new Planet(, mass)];

  private planets$ = new EventEmitter<Planet>();
  public planetsObs$: Observable<Array<Planet>> = this.planets$
    .asObservable()
    .scan((allPlanets: Array<Planet>, newPlanet: Planet) => allPlanets.concat(newPlanet), new Array<Planet>());
  public planetsAmount$ = this.planetsObs$.map(planets => planets.length).startWith(0);

  private mass$ = Observable.from([1]);
  public massSun$ = new EventEmitter<number>();
  public massSunObs$ = this.massSun$.asObservable().startWith(50000.0);
  private targetCoordinates$ = new EventEmitter<Vector2D>();
  private targetCoordinatesObs$: Observable<Vector2D> = this.targetCoordinates$.asObservable().share();
  private positionEmitter$ = new EventEmitter<Vector2D>();
  private positionObs$: Observable<Vector2D> = this.positionEmitter$.asObservable().share();

  private gravitationalConstantEmitter$ = new EventEmitter<number>();
  private simStart$ = new EventEmitter<boolean>();

  x$: Observable<number>;
  y$: Observable<number>;

  mouseX$: Observable<number>;
  mouseY$: Observable<number>;

  public gravitationalConstant: number;
  private mouseDown$ = new EventEmitter<MouseEvent>();
  private mouseMove$ = new EventEmitter<MouseEvent>();
  private mouseUp$ = new EventEmitter<MouseEvent>();

  private drag$: Observable<Vector2D> = this.mouseDown$.asObservable()
    .flatMap((md: MouseEvent) =>
      this.mouseMove$
        .asObservable()
        .map((mm: MouseEvent) =>
          Vector2D.create(mm.offsetX, mm.offsetY)
        ).takeUntil(this.mouseUp$.asObservable())
    );
  private noDrag$: Observable<MouseEvent> = this.mouseDown$.asObservable()
    .flatMap((md: MouseEvent) =>
      this.mouseUp$.asObservable()
        .takeUntil(this.mouseMove$.asObservable()
        )).last();

  constructor() {
    let centerPositionMapper = (targetVector) => targetVector.sub(this.CENTER_POS);

    let centeredTargetCoordinates$ = this.targetCoordinates$.asObservable().map(centerPositionMapper);

    let timedTargetCoordinates$ = this.simStart$.asObservable()
      .switchMap((simStart: boolean) => {
        if (simStart) {
          return Observable.interval(10).timeInterval();
        }
        return Observable.empty();
      }).withLatestFrom(
        centeredTargetCoordinates$,
        (interval: TimeInterval<number>, targetCoordinates: Vector2D) =>
          new TimeInterval(targetCoordinates, interval.interval / 1000));

    let centeredPosition$ = this.positionObs$.map(centerPositionMapper);

    let calculateGravityForce = (position1: TimeInterval<Vector2D>,
                                 position2: Vector2D,
                                 mass1: number,
                                 mass2: number,
                                 gravityConst: number) => {
      let distance = position1.value.dist(position2);
      let interval = position1.interval;
      if (Math.abs(distance) <= 0.5) {
        return new TimeInterval(Vector2D.zero, interval);
      }
      // newtons law shortened to a1 = G * m2 / r²
      let forceAmount = gravityConst * mass2 * (1 / Math.pow(distance, 1.3));
      let directedForce = position1.value.directionTo(position2).mul(forceAmount);
      return new TimeInterval(directedForce.mul(interval), interval);
    };

    let gravitationalForceToApply$ = timedTargetCoordinates$
      .withLatestFrom(
        centeredPosition$,
        this.mass$,
        this.massSunObs$,
        this.gravitationalConstantEmitter$,
        // calculate the force
        calculateGravityForce
      );

    let velocity$ = gravitationalForceToApply$
      .scan((oldVelocity: TimeInterval<Vector2D>, forceInterval: TimeInterval<Vector2D>) => {
        let newVelocity = oldVelocity.value.add(forceInterval.value.mul(forceInterval.interval));
        return new TimeInterval(newVelocity, forceInterval.interval);
      }, new TimeInterval(Vector2D.create(-100, 100), 20));

    let nextPosition$ = velocity$.withLatestFrom(this.positionObs$,
      (timedVelocity: TimeInterval<Vector2D>, position: Vector2D) =>
        position.add(timedVelocity.value.mul(timedVelocity.interval))
    );
    nextPosition$.subscribe((position) => this.positionEmitter$.emit(position));

    this.x$ = this.positionObs$.map((vec) => vec.x);
    this.y$ = this.positionObs$.map((vec) => vec.y);
    this.mouseX$ = this.targetCoordinatesObs$.map((vec) => vec.x);
    this.mouseY$ = this.targetCoordinatesObs$.map((vec) => vec.y);
    this.gravitationalConstantEmitter$.asObservable().subscribe((val) => this.gravitationalConstant = val);
    this.gravitationalConstantEmitter$.emit(30);
    this.positionEmitter$.emit(this.CENTER_POS.sub(Vector2D.create(0, 30)));
    this.targetCoordinates$.emit(this.CENTER_POS);
  }

  updateStream($event) {
    (<EventEmitter<Vector2D>>this.targetCoordinates$).emit(new Vector2D($event.offsetX, $event.offsetY));
  }

  updateGravitationalConstant(value: string) {
    let floatGravConstant = parseFloat(value);
    this.gravitationalConstantEmitter$.emit(floatGravConstant);
  }

  updateMass(value: string) {
    let floatMass = parseFloat(value);
    this.gravitationalConstantEmitter$.emit(floatMass);
  }

  mouseDown($event) {
    this.noDrag$.subscribe(
      (event: MouseEvent) => this.addPlanet(event),
      error => console.error('error while no dragging', error),
      () => console.log('end click'));

    this.drag$.subscribe(
      (coord) => this.targetCoordinates$.emit(coord),
      error => console.error('error while dragging', error),
      () => console.log('end drag')
    );
    this.mouseDown$.emit($event);
  }

  mouseUp($event: MouseEvent) {
    this.mouseUp$.emit($event);
  }

  mouseMove($event: MouseEvent) {
    $event.preventDefault();
    this.mouseMove$.emit($event);
  }

  addPlanet($event: MouseEvent) {
    console.log('addPlanet');
    this.planets$.emit(new Planet($event.offsetX, $event.offsetY, 200));
  }

  startSim() {
    this.simStart$.emit(true);
  }

  stopSim() {
    this.simStart$.emit(false);
  }

}
