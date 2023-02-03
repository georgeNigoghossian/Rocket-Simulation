import vector from "./vector";
class World {
  constructor(massOfWorld,worldR,height, tempereture) {
    this.massOfWorld = massOfWorld;
    this.worldR = worldR
    this.height=height;
    this.tempereture=tempereture;
    this.objects = [];
  }
  calc_gravity(worldm,worldr,h){
    let gravity=((worldm*6.67482)/((worldr+h)*(worldr+h)));
    return gravity;
  }
  calc_air_rho(g, H, T) {
    let Rspecific = 287.058,
      R = 8.3148,
      Md = 0.028964;
    let P0 = 1.01325; // 1bar =100000pa
    let Tkelvin = T + 273.15;
    let P = P0 * Math.exp((-Md * g * H) / (R * Tkelvin)) * Math.pow(10, 5);
    let rho = P / (Rspecific * Tkelvin);
    return rho;
  }
  add(object) {
    this.objects.push(object);
  }
  update(deltaTime) {
    for (const object of this.objects) {
      let gravity=this.calc_gravity(this.massOfWorld,this.worldR,this.height)
      let air_rho = this.calc_air_rho(
        gravity,
        this.height,
        this.tempereture
      );
      object.update(deltaTime, gravity, air_rho);
    }
  }
}
export default World;