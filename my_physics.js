
			console.log([
				'    __     __',
				' __/ __\\  / __\\__   ____   _____   _____',
				'/ __/  /\\/ /  /___\\/ ____\\/ _____\\/ _____\\',
				'\\/_   __/ /   _   / /  __/ / __  / / __  /_   __   _____',
				'/ /  / / /  / /  / /  / / /  ___/ /  ___/\\ _\\/ __\\/ _____\\',
				'\\/__/  \\/__/\\/__/\\/__/  \\/_____/\\/_____/\\/__/ /  / /  ___/',
				'                                         / __/  /  \\__  \\',
				'                                         \\/____/\\/_____/'
      ].join('\n'));
      
/////////////////////////////////////////////
//////////////   COIN TOSS   ////////////////
/////////////////////////////////////////////



/////---Sources---/////

var blob = new Blob( [document.querySelector('#physijs_worker').textContent] );
Physijs.scripts.worker = window.URL.createObjectURL(blob);
Physijs.scripts.ammo = 'https://chandlerprall.github.io/Physijs/examples/js/ammo.js';



/////---Settings---/////


var dropHeight = 200;
var gravity = -400;
var fr = 200;  // friction
var re = 100;  // restitution



/////---Initiation---/////

var objArray = [];

///HTML
//declares a renderer object
var renderer = new THREE.WebGLRenderer({ antialias: true });
//sets the canvas at double-size for higher resolution
renderer.setSize( window.innerWidth*1.5, window.innerHeight*1.5 );
//places the renderer canvas element inside the canvas_div element
var canvasDiv = document.getElementById("canvas_div");
canvasDiv.appendChild( renderer.domElement );
//gets the renderer canvas element 
var canvas = document.getElementsByTagName('canvas')[0];
//shrinks the canvas to the window's size while keeping high resolution
canvas.style.width = window.innerWidth + "px";
canvas.style.height = window.innerHeight + "px";


///
// Instantiate a loader
//var loader = new THREE.GLTFLoader();




///physi.js scene
var scene = new Physijs.Scene;
scene.setGravity(new THREE.Vector3(0, gravity, 0));

///background
renderer.setClearColor (0xF2F2F2, 1);

///camera
var camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 1, 10000 );

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = false;
controls.target.set(0,0,-100);




//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 0, 350, 350 );
camera.lookAt(new THREE.Vector3(0,0,100));

controls.update();
scene.add( camera );

///lighting & shadows
var lightA1 = new THREE.AmbientLight(0xFFFFFF, 0.8);
scene.add(lightA1);
var lightD1 = new THREE.DirectionalLight( 0xFFFFFF, 0.3 );
lightD1.position.set( -250, 300, 150 );
lightD1.castShadow = true;
lightD1.shadow.camera.left = -500;
lightD1.shadow.camera.top = -500;
lightD1.shadow.camera.right = 500;
lightD1.shadow.camera.bottom = 500;
lightD1.shadow.camera.near = 1;
lightD1.shadow.camera.far = 700;
lightD1.shadow.mapSize.height = lightD1.shadow.mapSize.width = 1500;
scene.add( lightD1 );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// var helper = new THREE.CameraHelper( lightD1.shadow.camera );
// camera.position.set( 0, 1500, 1500 );
// scene.add( helper );



///---Platform---///

var platformGeometry = new THREE.PlaneGeometry( 2000, 2000 );
var platformMaterial = Physijs.createMaterial( 
  new THREE.MeshLambertMaterial({ color: 0xEEEEEE }), fr, re 
);
var platform = new Physijs.PlaneMesh(platformGeometry, platformMaterial );
platform.name = "platform";
platform.rotateX( - Math.PI / 2);
platform.receiveShadow = true;
scene.add(platform);


camera.lookAt( platform.position.x , platform.position.y+75, platform.position.z );
//controls.update();

///---Penny---///

function Penny() {  //settings
  
  var pennyDiameter = 50;
  var radiusTop = pennyDiameter*.5;
  var radiusBottom = pennyDiameter*.5;
  var height = pennyDiameter*.085;
  var segments = 100;

  //array to store materials
  var materialsArray = [];

  //component images
  //var headsImage = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/409445/penny_heads.png"
  //var tailsImage = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/409445/penny_tails.png";
  var headsImage = "img/uk_heads.png"
  var tailsImage = "img/uk_tails.png";


  //declares a new penny pennyGeometry
  var pennyGeometry = new THREE.CylinderGeometry( radiusTop, radiusBottom, height, segments );
  
  //declares a new three.js material for the side of the penny, then from it creates a new physi.js material that gives the material friction and restitution
  var pennyMaterialSide = Physijs.createMaterial( new THREE.MeshPhongMaterial({ ambient: 0x030303, color: 0x4F3E37, emissive: 0x0, specular: 0x555555, shininess: 100 }), fr, re );
  //var pennyMaterialSide = Physijs.createMaterial( new THREE.MeshLambertMaterial({ color: 0x4F3E37 }), fr, re );
  materialsArray.push( pennyMaterialSide );  //(materialindex = 0)

  //declares a new loader for the heads image, assigns it to a material, and pushes to the materials array
  var headsLoader = new THREE.TextureLoader();
  headsLoader.load( headsImage, function ( texture ) { 
    var pennyMaterialTop = Physijs.createMaterial( new THREE.MeshBasicMaterial({ map: texture }), fr, re );
    materialsArray.push(pennyMaterialTop);  //(materialindex = 1)
  });

  //declares a new loader for the tails image, assigns it to a material, and pushes to the materials array
  var tailsLoader = new THREE.TextureLoader();
  tailsLoader.load( tailsImage, function ( texture ) { 
    var pennyMaterialBottom = Physijs.createMaterial( new THREE.MeshBasicMaterial({ map: texture }), fr, re );
    materialsArray.push(pennyMaterialBottom);  //(materialindex = 2)
  });

  //assigns each of the penny's faces to a material index
  var faceCount = pennyGeometry.faces.length;
  for ( i=0; i<faceCount; i++ ) {
    //first set of faces makes up the penny's side
    if ( i < segments*2 ) {
      pennyGeometry.faces[i].materialIndex = 0;
    //second set of faces makes up the penny's top
    } else if ( i < segments*3 ) {
      pennyGeometry.faces[i].materialIndex = 1;
    //third set of faces makes up the penny's bottom
    } else {
      pennyGeometry.faces[i].materialIndex = 2;
    }
  }

  // assigns the penny as a physi.js object and adds it to the scene
  var obj = new Physijs.CylinderMesh( pennyGeometry, materialsArray, 5 );  //(last parameter is mass)
  obj.rotation.set( 1.57, 1.57, 0 );
  obj.castShadow = true;

  scene.add( obj );
  objArray.push(obj);

  // lifts the penny and gives it some random initial spin
  obj.__dirtyPosition = true;
  obj.__dirtyRotation = true;
  obj.position.y = dropHeight;
  obj.setAngularVelocity(new THREE.Vector3(
   Math.random()*50-25, //Math.random()*50-25, // THE FLIP
   Math.random()*30-15, 
   Math.random()*5-2.5
  ));

}

function Dice() {

  //array to store materials
  var materialsArray = [];
 ///frame
 var importsize = 2.0;
 var diceFrameGeometry =  new RoundEdgedBox(importsize,importsize,importsize,importsize/7.5,0.01,0.01,0.01);
 var diceFrameMesh = new THREE.MeshBasicMaterial({ visible: false, color: 0x333333 });
 materialsArray.push(Physijs.createMaterial( diceFrameMesh, fr, re/13 ));

   
 //assigns each of the penny's faces to a material index
 var faceCount = diceFrameGeometry.faces.length;
 for ( i=0; i<faceCount; i++ ) {
  diceFrameGeometry.faces[i].materialIndex = 0;
 }

 var obj = new Physijs.BoxMesh(diceFrameGeometry, materialsArray,3);


 var loader = new THREE.GLTFLoader().setPath( 'models/Dice/gltf/' );  
 loader.load(
   // resource URL
   'scene.gltf',
   // called when the resource is loaded
   function ( gltf ) {
         obj.body = gltf.scene.children[0]; 
         obj.body.rotation.set(0,0,0)
         obj.body.position.set(0,0,0)
         obj.body.name = 'model';
         obj.body.componentOf = 'dice';
         obj.body.traverse(function(child){child.castShadow = true;});
         obj.body.castShadow = true;
         obj.add(obj.body);
   },
   // called while loading is progressing
   function ( xhr ) {
     console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );    },
   // called when loading has errors
   function ( error ) {
     console.log( 'An error happened: ' + error );
   }
 );
 obj.scale.set(15,15,15);

 scene.add(obj);
 objArray.push(obj);

 obj.setDamping(0,.001);
 // lifts the penny and gives it some random initial spin
 obj.__dirtyPosition = true;
 obj.__dirtyRotation = true;
 obj.position.y = dropHeight;
 obj.rotation.x = Math.random()*6.28;
 obj.rotation.y = Math.random()*6.28;
 obj.rotation.z = Math.random()*6.28;
 obj.setAngularVelocity(new THREE.Vector3(
  Math.random()*20-10, //Math.random()*50-25, // THE FLIP
  Math.random()*20-10, 
  Math.random()*20-10
 ));
 obj.setLinearVelocity(new THREE.Vector3(
   Math.random()*200-100, //Math.random()*50-25, // THE FLIP
   Math.random()*100-50, 
   0
  ));
}

function Legoman() {

   //array to store materials
   var materialsArray = [];
  ///frame
  var h = 16.93;
  var legomanFrameGeometry = new THREE.BoxGeometry( h, 4.34, 10.75);
  var legomanFrameMesh = new THREE.MeshBasicMaterial({ visible: false, color: 0x333333 });
  materialsArray.push(Physijs.createMaterial( legomanFrameMesh, fr, re ));

    
  //assigns each of the penny's faces to a material index
  var faceCount = legomanFrameGeometry.faces.length;
  for ( i=0; i<faceCount; i++ ) {
    legomanFrameGeometry.faces[i].materialIndex = 0;
  }

  var obj = new Physijs.BoxMesh(legomanFrameGeometry, materialsArray, 3);


  var loader = new THREE.GLTFLoader().setPath( 'models/LegoMan/gltf/' );  
  loader.load(
    // resource URL
    'scene.gltf',
    // called when the resource is loaded
    function ( gltf ) {
          obj.body = gltf.scene.children[0]; 
          obj.body.rotation.set(0,3.14/2,0)
          obj.body.position.set(-h/2,0,0)
          obj.body.name = 'model';
          obj.body.componentOf = 'legoman';
          obj.body.traverse(function(child){child.castShadow = true;});
          obj.body.castShadow = true;
          obj.add(obj.body);
    },
    // called while loading is progressing
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );    },
    // called when loading has errors
    function ( error ) {
      console.log( 'An error happened: ' + error );
    }
  );
  obj.scale.set(5.4,5.4,5.4);

  scene.add(obj);
  objArray.push(obj);

  // lifts the penny and gives it some random initial spin
  obj.__dirtyPosition = true;
  obj.__dirtyRotation = true;
  obj.position.y = dropHeight;
  obj.rotation.x = Math.random()*6.28;
  obj.rotation.y = Math.random()*6.28;
  obj.rotation.z = Math.random()*6.28;
  obj.setAngularVelocity(new THREE.Vector3(
    Math.random()*20-10, // THE FLIP
    Math.random()*20-10, 
   Math.random()*20-10
  ));
}


function Duck() {

  //array to store materials
  var materialsArray = [];
 ///frame
var h =  0.72;
 var duckFrameGeometry = new THREE.BoxGeometry( h, 1.05, 0.99);
 var duckFrameMesh = new THREE.MeshBasicMaterial({ visible: false, color: 0x333333 });
 materialsArray.push(Physijs.createMaterial( duckFrameMesh, fr, re ));

   
 //assigns each of the penny's faces to a material index
 var faceCount = duckFrameGeometry.faces.length;
 for ( i=0; i<faceCount; i++ ) {
   duckFrameGeometry.faces[i].materialIndex = 0;
 }

 var obj = new Physijs.BoxMesh(duckFrameGeometry, materialsArray, 3);


 var loader = new THREE.GLTFLoader().setPath( 'models/Duck/gltf/' );  
 loader.load(
   // resource URL
   'scene.gltf',
   // called when the resource is loaded
   function ( gltf ) {
         obj.body = gltf.scene.children[0]; 
         obj.body.rotation.set(0,3.14/2,0)
         obj.body.position.set(-h/1.5,0,0)
         obj.body.name = 'model';
         obj.body.componentOf = 'legoman';
         obj.body.traverse(function(child){child.castShadow = true;});
         obj.body.castShadow = true;
         obj.add(obj.body);
   },
   // called while loading is progressing
   function ( xhr ) {
     console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );    },
   // called when loading has errors
   function ( error ) {
     console.log( 'An error happened: ' + error );
   }
 );
 obj.scale.set(40,40,40);

 scene.add(obj);
 objArray.push(obj);

 // lifts the penny and gives it some random initial spin
 obj.__dirtyPosition = true;
 obj.__dirtyRotation = true;
 obj.position.y = dropHeight;
 obj.rotation.x = Math.random()*6.28;
 obj.rotation.y = Math.random()*6.28;
 obj.rotation.z = Math.random()*6.28;
 obj.setAngularVelocity(new THREE.Vector3(
   Math.random()*20-10, // THE FLIP
   Math.random()*20-10, 
  Math.random()*20-10
 ));
}

///Some helper functions///

function onWindowResize() {
	sceneHeight = window.innerHeight;
	sceneWidth = window.innerWidth;
	canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";
	camera.aspect = sceneWidth/sceneHeight;
	camera.updateProjectionMatrix();
}

function addPenny() {
  new Penny;
}

function addDie() {
  new Dice;
}


function addDice() {
  new Dice;
  new Dice;
}

function addLegoman() {
  new Legoman;
}

function addDuck() {
  new Duck;
}

function clearScene() {
  for (o of objArray){
      o.traverse(function(child){ scene.remove(child);});
    scene.remove(o);
  }
  
  objArray.length = 0;
}


///---Interaction---///

window.addEventListener('resize', onWindowResize, false);

$("#penny_icon").click(function(){ addPenny(); });
$("#die_icon").click(function(){ addDie(); });
$("#dice_icon").click(function(){ addDice(); });
$("#lego_icon").click(function(){ addLegoman(); });
$("#clear_icon").click(function(){ clearScene(); });

$("#me_link").hover(function(){addDuck();});


///---Rendering---///

addPenny();

function render() {
  scene.simulate();
  

	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();
  renderer.render( scene, camera);

   
  requestAnimationFrame( render );
};

render();
