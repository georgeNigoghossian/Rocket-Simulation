import vector from "./vector";
import * as THREE from "three";
import { Vector3 } from "three";

class Rocket
{
  constructor(
    position,
    initial_mass,
    payload_mass,
    angle,
    fuel_mass,
    drag_coeff,
    ex_pressure,
    ex_area,
    ex_speed,
    fuel_loss
  ) {
    this.position = position;
    this.velocity = vector.create(0, 0, 0);
    this.velocity.inits(5,90,90);
    this.drag_coeff=drag_coeff;
    this.angle=angle;
    this.ex_speed = ex_speed;
    this.ex_pressure=ex_pressure;
    this.ex_area=ex_area;
    this.fuel_loss = fuel_loss;
    this.initial_mass=  initial_mass;
    this.payload_mass = payload_mass ;
    this.fuel_mass = fuel_mass;
    this.rho = 7700;
    this.angular_acc = new THREE.Vector3();
    this.quaternion = new THREE.Quaternion();
    this.rotationMatrix = new THREE.Matrix3();
    this.angular_velocity=vector.create(1,1,1)
    this.rotateAxes = vector.create(
      this.angular_velocity.getX(),
      this.angular_velocity.getY(),
      this.angular_velocity.getZ()
    );
    this.total_mass = initial_mass + payload_mass + fuel_mass;
    }
    update(time, gravity, air_rho) {
    //Forces
    let gravityForce = this.gravity_force(gravity);
    let dragForce = this.drag_force(air_rho);
    let liftForce=this.lift_force(air_rho);
    let thrustforce=this.thrust_Force(this.fuel_loss,this.ex_speed,this.ex_pressure,1,this.ex_area);
    let totalForce = vector.create(
      dragForce.getX()+liftForce.getX(),
      gravityForce.getY() + dragForce.getY() + thrustforce.getY()+liftForce.getY(),
      dragForce.getZ()
    );
    $('.payloadMass').text('Total Mass : '+this.total_mass)
    if(this.fuel_mass<0){
  let t=0
    $('.fuelMass').text('Fuel Mass : '+0)
    }else{
          $('.fuelMass').text('Fuel Mass : '+Math.round(this.fuel_mass*100)/100)
    }
    //Linear Movement
    let acc = vector.create(
       totalForce.getX() /  this.total_mass,
       totalForce.getY() /  this.total_mass,
       totalForce.getZ() /  this.total_mass
    );
    let L=((this.position.y*time-this.position.y)/(this.position.x*time-this.position.x))
    let L2=((this.position.z*time-this.position.z)/(this.position.x*time-this.position.x))
    let L3=((this.position.y*time-this.position.y)/(this.position.z*time-this.position.z))
    let B=Math.atan(L)
    let B2=Math.atan(L2)
    let B3=Math.atan(L3)
    let M=B+this.angle
    let M2=B2+this.angle
    let M3=B3+this.angle

    if(this.position.y>4500){
      if(this.fuel_mass>0){
        if(this.position.y<5000 && this.position.y<3400){this.velocity.cut(M,M2)}
     if(this.position.y>5500 && this.position.y<7500){
        
      if(this.fuel_mass>0){
     this.velocity.cut(B,B2)
    }
     }
     if(this.position.y<30000){
        if(this.quaternion.z<0.015){
      this.quaternion.z-=B/1000
    }
     }
      }else{
        if(this.quaternion.z>0.005)
        this.quaternion.z+=0.0001
      }
    }
    if(this.position.y>200){
        this.velocity.addTo(acc, time);
      }
      if(this.position.y>0){
      $('.velocity').text('velocity : '+Math.abs( Number(this.velocity.getY().toFixed(2))))
    }else{
      $('.velocity').text('velocity : '+0)
    }
     ////// updDate Positon
     this.position.x +=Number(this.velocity.getX().toFixed(2)) *time*10;
     this.position.y +=Number(this.velocity.getY().toFixed(2)) *time*10;
     this.position.z -=Number(this.velocity.getZ().toFixed(2)) *time*10;

     let interiaTensor = this.rotationMatrix
     .clone()
     .multiply(this.rotationMatrix.clone().transpose());
     let viscousTorque = this.viscousTorque();
    //torque
    let torque = new Vector3(
      viscousTorque.getX(),
      viscousTorque.getY(),
      viscousTorque.getZ()
    );
     //angular
     this.angular_acc = torque.applyMatrix3(interiaTensor);
    //update angular velocity
     this.angular_velocity._x += this.angular_acc.y * time;
     this.angular_velocity._y += this.angular_acc.y * time;
     this.angular_velocity._z += this.angular_acc.z * time;
    this.updateQuaternion(this.angular_velocity.normalize(), time);
    this.updateRotationMatrix(this.quaternion.normalize());
    }
    //gravity
    gravity_force(gravity) {
    return vector.create(0, -gravity *this.total_mass, 0);
    }
    //drag
    drag_force(rho) {
    let velocitySquere = this.velocity.squere();
    let normalize = this.velocity.normalize();
    let drag = vector.create(
      ((velocitySquere * -1) / 2) *
        this.drag_coeff *
        rho *
        1 *
        normalize.getX(),
      ((velocitySquere * -1) / 2) *
        this.drag_coeff *
        rho *
        1 *
        normalize.getY(),
      ((velocitySquere * -1) / 2) *
        this.drag_coeff *
        rho *
        1 *
        normalize.getZ()
    );
    return drag;
    }
    //thrust
    thrust_Force(fuel_loss,ex_velocity,ex_pressure,atm_pressurse,ex_area){
    let normalize = this.velocity.normalize();
     if(this.fuel_mass>0){
    let thrust = vector.create(
        fuel_loss*ex_velocity+(ex_pressure-atm_pressurse)*ex_area*normalize.getX(),
        fuel_loss*ex_velocity+(ex_pressure-atm_pressurse)*ex_area*normalize.getY(),
        fuel_loss*ex_velocity+(ex_pressure-atm_pressurse)*ex_area*normalize.getZ(),
    )
    return thrust;
     }else{
      let thrust = vector.create(
                      0,
                      0,
                      0,
    )
    return thrust
     }
    }
    viscousTorque() {
     let v = vector.create(
      -this.angular_velocity.getX(),
      -this.angular_velocity.getY(),
      -this.angular_velocity.getZ()
           );
         v.setLength(0.0002);
     return v;
    }
    updateQuaternion(vector, time) {
    const quaternionTemp = new THREE.Quaternion(
    vector._x * time,
    vector._y * time,
    vector._z * time,
    0
        );
     quaternionTemp.multiply(this.quaternion);
     if(this.position.y<800){
     if(this.fuel_mass>0){
     this.quaternion.y += quaternionTemp.y *1.6;
     this.quaternion.w += quaternionTemp.w*1.6 ;
        }
              }
              if(this.position.y<8000){
                if(this.fuel_mass<0){
                  this.quaternion.x += quaternionTemp.x *0.5;
                  this.quaternion.z += quaternionTemp.z *0.5;
                  this.quaternion.w += quaternionTemp.w*0.5 ;
                }
              }
    }
   updateRotationMatrix(quaternion) {
      const q = quaternion;
          this.rotationMatrix.set(
             1 - 2 * Math.pow(q.y, 2) - 2 * Math.pow(q.z, 2),
             2 * q.x * q.y - 2 * q.z * q.w,
             2 * q.x * q.z + 2 * q.y * q.w,
             2 * q.x * q.y + 2 * q.z * q.w,
             1 - 2 * Math.pow(q.x, 2) - 2 * Math.pow(q.z, 2),
             2 * q.y * q.z - 2 * q.x * q.w,
             2 * q.x * q.z - 2 * q.y * q.w,
             2 * q.y * q.z + 2 * q.x * q.w,
             1 - 2 * Math.pow(q.x, 2) - 2 * Math.pow(q.y, 2)
              );
    }
  lift_force(rho) {
        let lift_coeff =0.005
        let velocitySquere = this.velocity.squere();
        if(this.fuel_mass>0){
        let cross = this.rotateAxes.cross(this.velocity);
        console.log(this.rotateAxes)
        console.log(cross)
        let lift = vector.create(
            ((velocitySquere * 1) / 2) * lift_coeff * rho * cross.getX(),
            ((-velocitySquere *1) / 2) * lift_coeff * rho * cross.getY(),
            ((velocitySquere * 1) / 2) * lift_coeff * rho * cross.getZ()
               );
       return lift;
      }else{
         let cross = vector.create(
             1,
             1,
             1,
          )
        let lift = vector.create(
           ((velocitySquere * 1) / 2) * lift_coeff * rho  * cross.getX(),
           ((-velocitySquere * 1) / 2) * lift_coeff * rho  * cross.getY(),
           ((velocitySquere * 1) / 2) * lift_coeff * rho  * cross.getZ()
              );
       return lift;
    }
    } 
}
export default Rocket;