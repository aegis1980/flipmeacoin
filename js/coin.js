const halfPI = Math.PI/2;
const PI2 = Math.PI*2;
const UP = new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );

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
          bumpMap: texture,
        } );
  
        Coin.materialsArray.push(coinMaterialTop);  //(materialindex = 1)
      });
    
      //declares a new loader for the tails image, assigns it to a material, and pushes to the materials array
      var tailsLoader = new THREE.TextureLoader();
      texLoader.load( tailsImage, function ( texture ) { 
        var coinMaterialBottom =  new THREE.MeshStandardMaterial({ 
          map: texture , 
         // bumpMap: texture,
          metalness:1,
        roughness: 0.2 
        });
        Coin.materialsArray.push(coinMaterialBottom);  //(materialind
      });  
  

      Coin.mesh = new THREE.Mesh( coinGeometry, Coin.materialsArray);  //(last parameter is mass)
      Coin.mesh.rotation.set( 0, 1.57, 0 ); // heads up on thumb
      Coin.mesh.castShadow = true;
      Coin.mesh.receiveShadow = true;
     
      // raise coin 
      Coin.mesh.position.y = 20;

      scene.add(Coin.mesh);

  }

  static spawn(physics,scene){

    var newCoin = Coin.mesh.clone();
    newCoin.hasCollided = false;
    newCoin.rotation.set(0, 0, 0 );
    physics.add.existing(newCoin);
    newCoin.body.setAngularVelocity(
      (Math.random()*40 + 10)-25, 
      Math.random()*30-15, //in plane rotation
      (Math.random()*40 + 10)-25
    );
    newCoin.body.setCollisionFlags(0); // make it kinematic
    newCoin.body.checkCollisions = true; // set checkCollisions to true
    newCoin.body.on.collision((otherObject, event) => {
      newCoin.hasCollided = true;
    });
    newCoin.body.setFriction(0.9);
    newCoin.body.setRestitution(0.6);
    newCoin.body.setDamping(0.3,0.3);
    scene.add(newCoin);

    Coin.sceneObjects.push(newCoin);
    Coin.history.push(0);

    return newCoin;   
  }

  static clearAll(physics, scene){
    for (var coin of Coin.sceneObjects){
        coin.traverse(function(child){ scene.remove(child);});
      physics.destroy(coin.body);
      scene.remove(coin);
    }
    
    Coin.sceneObjects.length = 0;
    Coin.sceneObjects.history = 0;
  }

  static tally(){
    var change = false;
    var changed = [];
    Coin.sceneObjects.forEach(function (p, i) {
      if (Coin.history[i]==0){
        var av  = p.body.angularVelocity;
        var v = p.body.velocity;
        var av1 = new THREE.Vector3(av.x,av.y,av.z);
        var v1 =  new THREE.Vector3(v.x,v.y,v.z);

        if (v1.length()<0.1 && av1.length()<0.1 && p.hasCollided){
          var q = new THREE.Quaternion().setFromEuler(p.rotation);
          var angle = Math.abs(UP.angleTo(q));
          console.log(angle)
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