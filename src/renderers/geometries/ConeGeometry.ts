import { Vector2, Vector3 } from "three";
import { IGeometry } from "./IGeometry";

export class ConeGeometry implements IGeometry {
    private readonly tau = 2 * Math.PI;
    private readonly R1: number;
    private readonly R2: number;
    private readonly dR: number;
    private readonly H: number;
    private readonly invH: number;

    constructor(
        options: {
            topDiameter: number;
            bottomDiameter: number;
            height: number;
        }
    ) {
        const { topDiameter, bottomDiameter, height } = options;
        this.R1 = topDiameter / 2;
        this.R2 = bottomDiameter / 2;
        this.dR = this.R2 - this.R1;
        this.H = height;
        this.invH = 1 / height;
    }

    public intersect(cameraPosition: Vector3, rayDirection: Vector3) {
        /*
          ro: eye/camera position
          Point q on ray is defined as
          q = ro + t * rd
      
          Point q is on cone if
      
          |q.y| = (q.z * invH + 0.5) * dR + R1
          and
          |q.z| <= hH
      
          Let (rox,roy,roz) = ro
              (rdx,rdy,rdz) = rd
      
          Then
          |q.y| = sqrt(qx^2 + qy^2) = sqrt((rox+t*rdx)^2 + (roy+t*rdy)^2)
      
          must be equal to
      
          ((roz+t*rdz) * invH + 0.5) * dR + R1
      
          Expanding this gives
      
          dR*invH*rdz * t + dR*invH*roz + 0.5*dR + R1
      
          Let A = dR*invH*rdz
              B = dR*invH*roz + 0.5*dR + R1
      
          We now have to solve for t
      
          sqrt((rox+t*rdx)^2 + (roy+t*rdy)^2) = A*t + B
      
          Squaring both sides gives
      
          (rox+t*rdx)^2 + (roy+t*rdy)^2 = (A*t + B)^2
      
          This becomes a simple quadratic equation:
          
          (rox+t*rdx)^2 + (roy+t*rdy)^2 - (A*t + B)^2 = 0
      
          a*t^2 + b*t + c = 0
      
          with
      
          a = rdx*rdx + rdy*rdy - A*A
          b = 2*(rdx*rox + rdy*roy - A*B)
          c = rox*rox + roy*roy - B*B
        */

        const dRiH = this.dR * this.invH;
        const A = dRiH * rayDirection.z;
        const B = dRiH * cameraPosition.z + 0.5 * this.dR + this.R1;

        const a = new Vector3(rayDirection.x, rayDirection.y, -A).dot(new Vector3(rayDirection.x, rayDirection.y, A));
        const b = new Vector3(rayDirection.x, rayDirection.y, A).dot(new Vector3(cameraPosition.x, cameraPosition.y, -B)) * 2;
        const c = new Vector3(cameraPosition.x, cameraPosition.y, B).dot(new Vector3(cameraPosition.x, cameraPosition.y, -B));

        // Solution of quadratic equation is (-b ± sqrt(b*b - 4*a*c))/(2*a)
        const d = b * b - 4 * a * c;
        if (d < 0) return undefined;

        const hh = this.H * 0.5;

        // we have two solutions, -sqrt(d) and +sqrt(d)
        // we take the one closest to the camera (pointing in the negative Y
        // direction)
        const t = (-b + Math.sqrt(d)) / (2 * a);
        const q = cameraPosition
            .clone()
            .addScalar(t)
            .multiply(rayDirection);
        const y = q.z;

        // const side = 1;

        // Only needed for double-sided debugging, comment out otherwise.
        /*
        if (abs(y) > hh) {
          t = (-b - sqrt(d))/(2*a);
          q = ro + t * rd;
          // y = dot(q - co, cd);
          y = q.z;
          side = -1;
        }
        */

        if (Math.abs(y) > hh)
            return undefined;

        const R = this.R1 + y * this.invH + 0.5 * this.dR;
        const iR = 1 / R;

        const rad = (Math.atan2(q.y * iR, -q.x * iR) + this.tau) % this.tau;
        return new Vector2(rad * this.R1, y + hh);  // side
    }
}
