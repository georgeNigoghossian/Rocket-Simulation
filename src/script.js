import './style.css'
import * as THREE from 'three'
import { LoadingManager, log, MeshDepthMaterial } from 'three'
import gsap from 'gsap'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { color } from 'dat.gui'
import Rocket from './physics/Rocket'
import World from './physics/world'
import typeFaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json'

//consts
const TEMPERETURE=15;
const MASSOFWORLD=5.972*10000000000000;
const WORLDR = 6365000;
const HEIGHT=1
//
const textureLoader = new THREE.TextureLoader()
const matacpTexture=textureLoader.load('/textures/matcaps/6.png')
const matacpTexture1=textureLoader.load('/textures/matcaps/3.png')
const matacpTexture2=textureLoader.load('/textures/matcaps/3.png')
const grassColorTexture = textureLoader.load('textures/bricks/color.jpg')
const grassAmbientTexture = textureLoader.load('textures/bricks/ambientOcclusion.jpg')
const grassNormalTexture = textureLoader.load('textures/bricks/normal.jpg')
const grassRoughnessTexture = textureLoader.load('textures/bricks/roughness.jpg')


grassColorTexture.repeat.set(8,8)
grassAmbientTexture.repeat.set(8,8)
grassNormalTexture.repeat.set(8,8)
grassRoughnessTexture.repeat.set(8,8)

grassColorTexture.wrapS =  THREE.RepeatWrapping
grassAmbientTexture.wrapS =  THREE.RepeatWrapping
grassNormalTexture.wrapS =  THREE.RepeatWrapping
grassRoughnessTexture.wrapS =  THREE.RepeatWrapping

grassColorTexture.wrapT =  THREE.RepeatWrapping
grassAmbientTexture.wrapT =  THREE.RepeatWrapping
grassNormalTexture.wrapT =  THREE.RepeatWrapping
grassRoughnessTexture.wrapT =  THREE.RepeatWrapping

/**
 * paramters
 */
 const paramters = {

  massOfWorld: 5.972*10000000000000,
  worldR: 6365000,
  tempereture: 15,
  angle:0.01,
  resistanseCoeff: 0.8,
  frictionCoeff: 0.8,
  initial_mass: 200,
  payload_mass: 200,
  fuel_mass: 100,
  type: 0,
  height: 0,
  ex_area:1,
  ex_pessure:1,
  ex_speed:8000,
  fuel_loss:4,
  cylinderHeight:60,
};

 const world = new World(MASSOFWORLD,WORLDR,HEIGHT,TEMPERETURE);
 

//debug
const gui = new dat.GUI( );
let argument = window.matchMedia("(max-width: 425px)");
let fun = (argument) => {
  if (argument.matches) {
    gui.width = 300;
  } else {
    gui.width = 380;
  }
};
fun(argument);
const worldfolder = gui.addFolder("World");
const rocketFolder = gui.addFolder("Rocket");
worldfolder
  .add(paramters, "massOfWorld", 10000000000000, 100000000000000, 100000000000)
  .name("World Mass")
  .onChange(() => {
   world.massOfWorld = paramters.massOfWorld;
  });
  worldfolder
  .add(paramters, "worldR", 5000000, 10000000, 100000)
  .name("World Radius")
  .onChange(() => {
   world.worldR = paramters.worldR;
  });
  worldfolder
  .add(paramters, "tempereture", -100, 100, 1)
  .name("Temperature")
  .onChange(() => {
    world.tempereture = paramters.tempereture;
  });
  rocketFolder.add(paramters, "cylinderHeight", 40, 100, 5).name("Cylinder Height").onChange(()=>{
     rocket.scale.set(paramters.cylinderHeight,paramters.cylinderHeight,paramters.cylinderHeight)
  });
 rocketFolder.add(paramters, "initial_mass", 100, 1000, 10).name("Initial Mass").onChange(() => {
  rocket.initial_mass= paramters.initial_mass;
 });
 rocketFolder.add(paramters, "payload_mass", 100, 1000, 10).name("Payload Mass").onChange(() => {
  rocket.payload_mass= paramters.payload_mass;
 });
 rocketFolder.add(paramters, "fuel_mass", 40, 200, 5).name("Fuel Mass").onChange(() => {
  rocket.fuel_mass= paramters.fuel_mass;
 });
 rocketFolder.add(paramters, "fuel_loss", 2, 50, 2).name("Fuel Loss").onChange(() => {
  rocket.fuel_loss= paramters.fuel_loss;
 });
  rocketFolder.add(paramters, "ex_speed", 5000, 10000, 100).name("Exhaust Speed").onChange(() => {
    rocket.ex_speed= paramters.ex_speed;
   });
  rocketFolder.add(paramters, "ex_area", 1, 10,0.5).name("Exhaust Area").onChange(() => {
    rocket.ex_area= paramters.ex_area;
   });
  rocketFolder.add(paramters, "ex_pessure", 1, 10,0.5).name("Exhaust Pressure").onChange(() => {
    rocket.ex_pessure= paramters.ex_pessure;
   });;
  rocketFolder.add(paramters, "angle", 0, 0.02,0.001).name("Angle").onChange(() => {
    rocket.anglex= paramters.angle;
   });;

//sizes 
const sizes = {
    width:window.innerWidth,
    height:window.innerHeight
}
//cursor
const cursor = {
    x:0,y:0
}
window.addEventListener('mousemove',(event)=>{
    cursor.x = event.clientX/sizes.width-0.5
    cursor.y = -(event.clientY/sizes.height-0.5)
    
})

//Scene
const scene = new THREE.Scene()
const texture = textureLoader.load("textures/bricks/stars.jpg", () => {
  const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
  rt.fromEquirectangularTexture(renderer, texture);
  scene.background = rt.texture;
});

const light = new THREE.DirectionalLight( 0xFFFF00 );
const helper = new THREE.DirectionalLightHelper( light, 500 );
helper.position.x=200
helper.position.y=100
scene.add( helper );

/*****************************************************
 * ROCKET START
 * 
 *  */
 
 let cones=[];
const rocket = new THREE.Group()
scene.add(rocket)

var geometry = new THREE.CylinderGeometry( 2, 2, 12, 32 );
var material = new THREE.MeshMatcapMaterial( { matcap:matacpTexture1,color: 0xD3D3D3,specular: 0x080808,shininess: 10});
material.alphaTest=1
const cylinder = new THREE.Mesh( geometry, material );
// cylinder.scale.set(1,1,1)
cylinder.position.x=0;
cylinder.position.y=6;
cylinder.position.z=0;

rocket.add( cylinder );

var geometry = new THREE.CylinderGeometry( 0.2, 2, 4, 32 );
var material = new THREE.MeshMatcapMaterial( { matcap:matacpTexture2,color: 0x696969,specular: 0x080808,shininess: 100} );
cones[0] = new THREE.Mesh( geometry, material );
cones[0].position.x = 0
cones[0].position.y = 14
cones[0].position.z = -0

rocket.add(cones[0]);

var geometry = new THREE.CylinderGeometry( 1, 1, 2, 32 );
var material = new THREE.MeshMatcapMaterial( { matcap:matacpTexture/*color: 0x996633, specular: 0x080808,shininess: 100*/} );
const booster1 = new THREE.Mesh( geometry, material );
booster1.position.x = 1.3
booster1.position.y = 0.9
booster1.position.z =1.7

rocket.add( booster1 );

var geometry = new THREE.CylinderGeometry( 1, 1, 2, 32 );
var material = new THREE.MeshMatcapMaterial( { matcap:matacpTexture/*color: 0x996633, specular: 0x080808,shininess: 100*/} );
const booster2 = new THREE.Mesh( geometry, material );
booster2.position.x = -1.3
booster2.position.y = 0.9
booster2.position.z =1.7

rocket.add( booster2 );

var geometry = new THREE.CylinderGeometry( 1, 1, 2, 32 );
var material = new THREE.MeshMatcapMaterial( { matcap:matacpTexture/*color: 0x996633, specular: 0x080808,shininess: 100*/} );
const booster3 = new THREE.Mesh( geometry, material );
booster3.position.x = -1.3
booster3.position.y = 0.9
booster3.position.z =-1.2

rocket.add( booster3 );

var geometry = new THREE.CylinderGeometry( 1, 1, 2, 32 );
var material = new THREE.MeshMatcapMaterial( { matcap:matacpTexture/*color: 0x996633, specular: 0x080808,shininess: 100*/} );
const booster4 = new THREE.Mesh( geometry, material );
booster4.position.x = 1.3
booster4.position.y = 0.9
booster4.position.z =-1.2
rocket.position.z=0
rocket.add( booster4 );

rocket.scale.set(60,60,60)
rocket.position.y=0
/*****************************************************
 * ROCKET END
 * 
 *  */
const floor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(200360,200360),
        new THREE.MeshStandardMaterial({
            map:grassColorTexture,
            aoMap:grassAmbientTexture,
            normalMap:grassNormalTexture,
            roughnessMap:grassRoughnessTexture
        })
)
floor.rotation.x=-Math.PI*0.5
floor.position.y=-15
floor.position.x=50000
floor.receiveShadow=true

scene.add(floor)


//canvas
const canvas = document.querySelector('.webgl')



//light 
const ambientLight = new THREE.AmbientLight('#b9b5ff',1)
scene.add(ambientLight)

const moonLight = new THREE.DirectionalLight('#b9b5ff',0.12)
moonLight.position.set(0,0,0)
moonLight.castShadow=true
scene.add(moonLight)


window.addEventListener('resize',()=>{
    //update sizes
    sizes.width=window.innerWidth,
    sizes.height=window.innerHeight

    //update camera
    camera.aspect = sizes.width/sizes.height
    camera.updateProjectionMatrix()

    //update renderer
    renderer.setSize(sizes.width,sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    

})

window.addEventListener('dblclick',()=>{
  const fullscreenElement=document.fullscreenElement||document.webkitFullscreenElement

  if(!fullscreenElement){
    if(canvas.requestFullscreen){
        canvas.requestFullscreen()
    }
    else if(canvas.webkitFullscreenElement){
      canvas.webkitFullscreenElement()
    }
  }
  else{
    if(document.exitFullscreen){
          document.exitFullscreen()
    }
    else if(document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
    }
  }
})



//Camera
let isCameraChasing = false;
const camera = new THREE.PerspectiveCamera(75,sizes.width/sizes.height,0.1,3000000)
camera.position.z=1500
camera.position.y=150
scene.add(camera)
const chasingCamera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  3000
);
chasingCamera.position.set(0, 40, 1200);
scene.add(chasingCamera);
///
let check = false;
let loss = false;
window.addEventListener('keypress',(bb)=>{
  if(!check){
    check=true
  if(bb.key=='f'){
    loss=true
    createrocket();
  }}
  if(bb.key=='1'){
    isCameraChasing = false;
  }
  if(bb.key=='2'){
    isCameraChasing = true;
  }
  
}
);

/**
 * fonts
 */
const fontLoader= new THREE.FontLoader()

fontLoader.load(
  'fonts/helvetiker_regular.typeface.json',
  (font)=>{
      const textGeometry = new THREE.TextBufferGeometry(
        'Rocket Station',{
          font:font,
          size:100.5,
          height:100.2,
          curveSegments:5,
          bevelEnabled:true,
          bevelThickness:0.05,
          bevelSize:0.001,
          bevelOffset:0,
          bevelSegments:4
        }
      )
      textGeometry.center();
      const material =new THREE.MeshMatcapMaterial({matcap:matacpTexture})
      const text= new THREE.Mesh(textGeometry,material)
      text.position.y=700
      text.position.z=-1500
      scene.add(text)
  }
)
const geometry11 = new THREE.BoxGeometry( 1600, 1000, 1000 );
const material111 = new THREE.MeshMatcapMaterial( { 
} );
const cubessss = new THREE.Mesh( geometry11, material111 );
cubessss.position.y=520
cubessss.position.z=-2000
scene.add( cubessss );





//controls
const controls = new OrbitControls(camera,canvas)
controls.enableDamping=true

//Renderer
const renderer = new THREE.WebGLRenderer({
    canvas:canvas
})
renderer.setSize(sizes.width,sizes.height);
renderer.setClearColor('#262837')
renderer.shadowMap.enabled=true
//////////////////////
let objectsToUpdate = [];
const createrocket=()=>{
  let physicsrocket= new Rocket(
    rocket.position,
    paramters.initial_mass,
    paramters.payload_mass,
    paramters.angle,
    paramters.fuel_mass,
    paramters.dragCoeff,
    paramters.ex_pessure,
    paramters.ex_area,
    paramters.ex_speed,
    paramters.fuel_loss
    );
    world.add(physicsrocket)
    objectsToUpdate.push({
      rocket,
      physicsrocket
    })
}
const clock = new THREE.Clock()
let oldElapsedTime = 0;
let maxAltitude = 0;


const tick =()=>
{
  var id= $( "input:checked" ).attr("id")
  $('.drag').text('Drag Coefficient : ' + paramters.dragCoeff);
   if(id==1){
    paramters.dragCoeff= 0.68;
   }
   if(id==2){
    paramters.dragCoeff=  1.49;
   }
   if(id==3){
    paramters.dragCoeff=  0.75;
   }
   if(rocket.position.y>0){
   $('.rocketPos').text('Rocket Position :\n ' + Math.round(rocket.position.y * 100) / 100);
  }else{
    $('.rocketPos').text('Rocket Position :\n ' +0);
  }
   $('.rocketPos').html($('.rocketPos').html().replace(/\n/g,'<br/>'));
   if (rocket.position.y > maxAltitude) {
    maxAltitude = Math.round(rocket.position.y * 100) / 100;
  }
    $('.rocketHeight').text('Rocket Max Height :\n ' + maxAltitude)
    $('.rocketHeight').html($('.rocketHeight').html().replace(/\n/g,'<br/>'));
    world.height = rocket.position.y
    const elapsedTime = clock.getElapsedTime();
    const delteTime = elapsedTime - oldElapsedTime;
    if(rocket.position.y>=0){
      world.update(delteTime);
      oldElapsedTime = elapsedTime;
    for (const object of objectsToUpdate) {
      if(loss){
        if(object.physicsrocket.fuel_mass>0)
        object.physicsrocket.fuel_mass-=(paramters.fuel_loss/60)
      }
      object.rocket.position.copy(object.physicsrocket.position);
      if(rocket.position.y>100){
       object.rocket.quaternion.copy(object.physicsrocket.quaternion);
        }
    }
  }
    controls.update()
    //Render
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    if (objectsToUpdate.slice(-1)[0]?.rocket) {
      chasingCamera.position.copy(
        objectsToUpdate
          .slice(-1)[0]
          ?.rocket.position.clone()
          .add(new THREE.Vector3(0,50, 1000))
      );
    }
    if (isCameraChasing) {
      renderer.render(scene, chasingCamera);
    } else {
      renderer.render(scene, camera);
    }
   
    //call tick again on the next frame
    window.requestAnimationFrame(tick)

}
function getRocket() {
  return rocket;
}

function getRadius() {
  var radius;

  var id = $("input:checked").attr("id");
  if (id == 1) {
    radius = 2;

    return radius;
  }
  if (id == 2) {
    radius = 4;
    return radius;
  }
  if (id == 3) {
    radius = 1;
    return radius;
  }
}
let i = 0
function removeCone(rocket) {

  rocket.remove(cones[i]);
  i++;
}
$('.form-check-input').change(function () {

  var id = $("input:checked").attr("id")
  if (id == 2) {

    removeCone(rocket);

    var conegeometry = new THREE.BoxGeometry(3, 4, 3);

    var material =new THREE.MeshMatcapMaterial( { matcap:matacpTexture2,color: 0x696969,specular: 0x080808,shininess: 100} )
    cones[i] = new THREE.Mesh(conegeometry, material);


    cones[i].position.x = 0
    cones[i].position.y = 14
    cones[i].position.z = 0

    rocket.add(cones[i]);


  } else {

    removeCone(rocket);

    var conegeometry = new THREE.CylinderGeometry( 0.2, getRadius(), 4, 32 );

    var material = new THREE.MeshMatcapMaterial( { matcap:matacpTexture2,color: 0x696969,specular: 0x080808,shininess: 100} )
    cones[i] = new THREE.Mesh(conegeometry, material);


    cones[i].position.x = 0
    cones[i].position.y = 14
    cones[i].position.z = 0

    rocket.add(cones[i]);


  }

});


function rand(min, max) {
  min = parseInt(min, 10);
  max = parseInt(max, 10);

  if (min > max) {
      var tmp = min;
      min = max;
      max = tmp;
  }

  return Math.floor(Math.random() * (max - min + 1) + min);
}

var game;
var ui;
window.addEventListener("load", function () {
    

    function Fire() {
        var material = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            wireframe: false,
            blending: THREE
                .AdditiveBlending // kluczowy element zapewniający mieszanie kolorów poszczególnych cząsteczek
        });
        var particles = []

        function generate(ilosc) {
            while (particles.length) {
                scene.remove(particles.shift())
            }
            for (var i = 0; i < ilosc; i++) {
                var size = rand(1, 5) * 2
                var particle = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), material.clone())
                particle.position.set(0, 0, 0);
                scene.add(particle)
                particles.push(particle)
            }

        }
        generate(200)
        function update(speed, width, height) {
            for (var i = 0; i < particles.length; i++) {
              if(objectsToUpdate.slice(-1)[0]?.physicsrocket.fuel_mass>=0){

                if (particles[i].position.y < height) {
                    particles[i].position.y += rand(rocket.position.y,speed);
                    particles[i].material.opacity -= 1 / height;
                } else {
                    particles[i].material.opacity = 1;
                    particles[i].position.y =rocket.position.y-(i+5);
                    particles[i].position.x =rocket.position.x-(rand(-40, 40));
                    particles[i].position.z = rocket.position.z+(rand(-40, 40))
                }
                if (particles[i].position.y > height / 2) {
                    if (particles[i].position.x > 0)
                        particles[i].position.x -= 0.3
                    else
                        particles[i].position.x += 0.3
                    if (particles[i].position.z > 0)
                        particles[i].position.z -= 0.3
                    else
                        particles[i].position.z += 0.3
                }
            }else{
              for (var i = 0; i < particles.length; i++) {
                particles[i].material.opacity=0;
              }

            }
          }
        }
        this.update = function (speed, width, height) {
            update(speed, width, height);
        }
    }
    var f = new Fire();
    function animateScene() {
        f.update(5, 50, 50);
        requestAnimationFrame(animateScene);
      
    }


    animateScene();


})

tick()

