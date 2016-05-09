export class Vector2D {
  public static zero = new Vector2D(0.0, 0.0);

  public static create(x: number, y: number) {
    return new Vector2D(x, y);
  };

  public add(vec: Vector2D) {
    return new Vector2D(this.x + vec.x, this.y + vec.y);
  }

  public sub(vec: Vector2D) {
    return new Vector2D(this.x - vec.x, this.y - vec.y);
  }

  public mul(num) {
    return new Vector2D(this.x * num, this.y * num);
  }

  public div(num) {
    return new Vector2D(this.x / num, this.y / num);
  }

  public length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public dist(vect: Vector2D) {
    return Math.abs(vect.sub(this).length());
  }

  public directionTo(vect: Vector2D) {
    return this.sub(vect).norm();
  }

  public norm() {
    return this.div(this.length());
  }

  public scalar(vec: Vector2D) {
    return this.x * vec.x + this.y * vec.y;
  }

  constructor(public x: number, public y: number) {
  };
}
