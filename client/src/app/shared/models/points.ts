import {Point} from "./models";

export function above(point: Point): Point {
  return {row: point.row - 1, col: point.col};
}

export function below(point: Point): Point {
  return {row: point.row + 1, col: point.col};
}

export function left(point: Point): Point {
  return {row: point.row, col: point.col - 1};
}

export function right(point: Point): Point {
  return {row: point.row, col: point.col + 1};
}

export function neighbors(point: Point): Point[] {
  return [
    above(point),
    right(point),
    below(point),
    left(point),
  ];
}

export function encode(point: Point): string {
  return `${point.row},${point.col}`;
}

export function decode(key: string): Point|undefined {
  const parts = key.split(',');
  if (parts.length !== 2) {
    return undefined;
  }

  try {
    const row = parseInt(parts[0]);
    const col = parseInt(parts[1]);
    return {row, col};
  } catch (e) {
    return undefined;
  }
}

export function copy(point: Point): Point {
  return {...point};
}