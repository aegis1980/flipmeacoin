const { AmmoPhysics, PhysicsLoader } = ENABLE3D;


const MainScene = () => {

  const sceneObjects = [];
  let currentCoin;


  // scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xffffff)

  // camera
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(5, 10, 10)

  // renderer
  const renderer = new THREE.WebGLRenderer();


  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.body.appendChild(renderer.domElement);

  // dpr
  const DPR = window.devicePixelRatio;
  renderer.setPixelRatio(Math.min(2, DPR))

  // orbit controls
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  
  ///lighting & shadows
  var lightA1 = new THREE.AmbientLight(0xFFFFFF,0.7);
  scene.add(lightA1);
  var lightD1 = new THREE.DirectionalLight( 0xFFFFFF);
  lightD1.position.set(5, 15,5 );
  lightD1.castShadow = true;
  lightD1.shadow.camera.near = 0.5;
  lightD1.shadow.camera.far = 500;
  lightD1.shadow.camera.left = -15;
  lightD1.shadow.camera.top = -15
  lightD1.shadow.camera.right = 15;
  lightD1.shadow.camera.bottom = 15;
  lightD1.shadow.mapSize.height = lightD1.shadow.mapSize.width = 512;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.add( lightD1 );

  // physics
  const physics = new AmmoPhysics(scene);
   physics.debug.enable(true);

  // extract the object factory from physics
  // the factory will make/add object without physics
  const { factory } = physics;

  // static ground
  const platformMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,   
  });
  const gnd = physics.add.ground({ width: 200, height: 200 },platformMaterial);
  gnd.castShadow = false;

  const clearScene = () => {
      Coin.clearAll(physics, scene);
      reset('#heads-score');
      reset('#tails-score');
  };


  // Coin

  Coin.init(physics,scene);
  const flipaCoin = () => {
    currentCoin = Coin.spawn(physics,scene);
  };


  // clock
  const clock = new THREE.Clock();

  // loop
  const animate = () => {
   
    physics.update(clock.getDelta() * 1000);
    //physics.updateDebugger()

    t = Coin.tally(scene);

    if (t[0]){ //a coin has restwes
      const restedCoins = t[1]; //likely just one in an array 
      restedCoins.forEach(function(coin_index){
        var state = t[2][coin_index];  
        if (state == 1){
          score('#heads-score');
        } else if (state == -1) {
          score('#tails-score');
        }
      });
  
    }

    if (typeof currentCoin !== 'undefined'){
      //camera.lookAt( currentCoin.position );
    }
    

    renderer.render(scene, camera);

    requestAnimationFrame(animate);
  };

  flipaCoin();
  requestAnimationFrame(animate);


  const onWindowResize = () => {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  
    renderer.setSize( window.innerWidth, window.innerHeight );
  
  };

  document.getElementById('penny_icon').addEventListener('click', flipaCoin);
  document.getElementById('clear_icon').addEventListener('click', clearScene);
  window.addEventListener( 'resize', onWindowResize );

}

PhysicsLoader('./lib/ammo/kripken', () => MainScene());


