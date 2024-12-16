const halfPI = Math.PI/2;
const PI2 = Math.PI*2;
const UP = new THREE.Vector3(0, 1, 0 );


function randRange(min,max, posonly = false){
  let sign = posonly;
  if (!posonly) sign = Math.random() >= 0.5;

  let n = min + Math.random()*max;
  if (!sign) n = -n;
  return n;
}

class Coin {

  static materialsArray = [];
  static mesh;
  static sceneObjects = [];
  static history = [];
  static heightCycle = 0;


  static init(physics, scene){
      var coinDiameter = 3;
      var radiusTop = coinDiameter*.5;
      var radiusBottom = coinDiameter*.5;
      var height = coinDiameter*.085;
      var segments = 100;
  
      var headsImage = "img/uk_heads.png";
      var tailsImage = "img/uk_tails.png";
    

      var coinGeometry = new THREE.CylinderGeometry( radiusTop, radiusBottom, height, segments );
      
      var coinMaterialSide = new THREE.MeshStandardMaterial({
        color: 0x593011,  
        metalness:1,
        roughness: 0.2 
      });
   
      Coin.materialsArray.push( coinMaterialSide );  
  
      const texLoader = new THREE.TextureLoader();
      texLoader.load( headsImage, function ( texture ) { 
  
        const coinMaterialTop = new THREE.MeshStandardMaterial( {
          map: texture,
          metalness:0.8,
          roughness: 0.3
        } );
  
        Coin.materialsArray.push(coinMaterialTop);  //(materialindex = 1)
      });
  
    
      texLoader.load( tailsImage, function ( texture ) { 
        var coinMaterialTails =  new THREE.MeshStandardMaterial({ 
          map: texture , 
          metalness:0.8,
          roughness: 0.3
        });
        Coin.materialsArray.push(coinMaterialTails);  //(materialind
      });  
  

      Coin.mesh = new THREE.Mesh( coinGeometry, Coin.materialsArray);  //(last parameter is mass)
      Coin.mesh.rotation.set( 0, 1.57, 0 ); // heads up on thumb
      Coin.mesh.castShadow = true;
      Coin.mesh.receiveShadow = true;
  }

  static spawn(physics,scene){

    var newCoin = Coin.mesh.clone();
    // raise coin 
    const stateFace =  Math.random() >= 0.5 ? 1 : 0
    newCoin.rotation.set( stateFace * Math.PI, 1.57, 0 ); // heads/tails up on thumb
    newCoin.position.y = randRange(15,7,true);

    newCoin.hasCollided = false;
    physics.add.existing(newCoin);
    newCoin.body.setAngularVelocity(
      randRange(20,40), 
      randRange(5,15), //in plane rotation
      randRange(5,20)
    );
    newCoin.body.setCollisionFlags(0); // make it kinematic
    newCoin.body.checkCollisions = true; // set checkCollisions to true
    newCoin.body.on.collision((otherObject, event) => {
      newCoin.hasCollided = true;
    });
    newCoin.body.setFriction(0.5);
    newCoin.body.setRestitution(0.9);
    newCoin.body.setDamping(0.1,0.3);
    scene.add(newCoin);

    Coin.sceneObjects.push(newCoin);
    Coin.history.push(0);

    return newCoin;   
  }

  static clearAll(physics, scene){
    for (var coin of Coin.sceneObjects){
      coin.traverse(function(child){ 
        physics.destroy(child);
        scene.remove(child);}
      );
      physics.destroy(coin);
      scene.remove(coin);
    }
    
    Coin.sceneObjects = [];
    Coin.history = [];
  }

  static tally(scene){
    var change = false;
    var changed = [];
    Coin.sceneObjects.forEach(function (p, i) {
      if (Coin.history[i]==0){
        var av  = p.body.angularVelocity;
        var v = p.body.velocity;
        var av1 = new THREE.Vector3(av.x,av.y,av.z);
        var v1 =  new THREE.Vector3(v.x,v.y,v.z);

        if (v1.length()<0.1 && av1.length()<0.1 && p.hasCollided){
         
          const matrix = new THREE.Matrix4();
          matrix.extractRotation( p.matrix );
          const dir = new THREE.Vector3( 0,1, 0 );
          matrix.multiplyVector3( dir );


          //normalize the direction vector (convert to vector of length 1)
          dir.normalize();
          const angle = UP.angleTo(dir);

          if (angle<halfPI){
            Coin.history[i]= 1; //heads
          } else {
            Coin.history[i]= -1; //tails
          }
          change = true;
          changed.push(i);
        }
    }
    });
    return [change,changed,Coin.history];
  }
}