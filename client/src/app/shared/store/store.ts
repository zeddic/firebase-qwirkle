import {BehaviorSubject, Observable, combineLatest} from "rxjs";
import {distinctUntilChanged, map, take, publishBehavior} from "rxjs/operators";
import {produce, Draft} from "immer";

export class Store<T> {
  private readonly state: BehaviorSubject<T>;

  constructor(initialValue: T) {
    this.state = new BehaviorSubject<T>(initialValue);
  }

  value<B>(selector: Selector<T, B>): StoreValue<B> {
    return create(this, selector);
  }

  set(newState: T) {
    this.state.next(newState);
  }

  update(updater: UpdateFn<T>) {
    const existingState = this.snapshot();
    // Wrap the updater to never return a value. We explicitly do not support
    // immer's ability to have update functions return a new object.
    const wrappedUpdater = (draft: Draft<T>) => { updater(draft); };
    const newState = produce(existingState, wrappedUpdater);
    this.state.next(newState);
  }

  snapshot(): T {
    return this.state.getValue();
  }

  select(): Observable<T> {
    return this.state.asObservable().pipe(distinctUntilChanged());
  }
}

export interface UpdateFn<T> {
  (draftState: Draft<T>): void;
}

export class StoreValue<T> {
  constructor(private readonly state: BehaviorSubject<T>) {}

  snapshot(): T {
    return this.state.getValue();
  }

  select(): Observable<T> {
    return this.state.asObservable();
  }

  map<B>(selector: Selector<T, B>): StoreValue<B> {
    return create(this, selector);
  }
}

export interface Selector<A, B> {
  (a: A): B;
}

export interface Joinable<T> {
  snapshot(): T;
  select(): Observable<T>;
}

export function create<A, R>(
    a: Joinable<A>,
    projector: (a: A) => R): StoreValue<R>;

export function create<A, B, R>(
    a: Joinable<A>,
    b: Joinable<B>,
    projector: (a: A, b: B) => R): StoreValue<R>;

export function create<A, B, C, R>(
    a: Joinable<A>,
    b: Joinable<B>,
    c: Joinable<C>,
    projector: (a: A, b: B, c: C) => R): StoreValue<R>;

export function create<A, B, C, D, R>(
    a: Joinable<A>,
    b: Joinable<B>,
    c: Joinable<C>,
    d: Joinable<D>,
    projector: (a: A, b: B, c: C, d: D) => R): StoreValue<R>;

export function create(...inputs: (Joinable<{}>|AnyFn)[]): StoreValue<{}> {
  const projector = inputs.pop() as AnyFn;
  const joinables = inputs as Joinable<{}>[];
  const joinablesAsObservables = joinables.map(i => i.select());
  const behavior = joinInputs(joinablesAsObservables, projector);
  return new StoreValue<{}>(behavior);
}

// function create<A, R>(
//   a: BehaviorSubject<A>,
//   projector: (a: A) => R): BehaviorSubject<R>;

// function create<A, B, R>(
//   a: BehaviorSubject<A>,
//   b: BehaviorSubject<B>,
//   projector: (a: A, b: B) => R): BehaviorSubject<R>;

function joinInputs(
  inputs: Observable<{}>[],
  projector: AnyFn
): BehaviorSubject<{}> {

  // TODO: memoize the projector
  
  // const projector = input.pop() as AnyFn;
  // const observables = input as BehaviorSubject<{}>[];

  const combined = combineLatest(...inputs);
  const transformed = combined.pipe(map(args => {
    return projector.apply(this, args);
  }));

  const initial = transformed.pipe(take(1));
  const behavior = new BehaviorSubject<{}>(initial);
  transformed.subscribe(behavior);

  return behavior;
}

type AnyFn = (...args: any[]) => any;