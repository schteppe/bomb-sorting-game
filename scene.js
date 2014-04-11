require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/shapes/Sphere',
	'goo/shapes/Cylinder',
	'goo/shapes/Box',
	'goo/shapes/Quad',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/World',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/addons/cannon/CannonSystem',
	'goo/addons/cannon/CannonRigidBodyComponent',
	'goo/addons/cannon/CannonBoxColliderComponent',
	'goo/addons/cannon/CannonSphereColliderComponent',
	'goo/addons/cannon/CannonPlaneColliderComponent',
	'goo/addons/cannon/CannonDistanceJointComponent',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent',
	'goo/scripts/Scripts',
	'CannonPickScript',
	'KaChingScript',
	'DieScript'
], function (
	GooRunner,
	Material,
	Camera,
	CameraComponent,
	Sphere,
	Cylinder,
	Box,
	Quad,
	TextureCreator,
	ScriptComponent,
	ShaderLib,
	World,
	OrbitCamControlScript,
	Vector3,
	CannonSystem,
	CannonRigidbodyComponent,
	CannonBoxColliderComponent,
	CannonSphereColliderComponent,
	CannonPlaneColliderComponent,
	CannonDistanceJointComponent,
	PointLight,
	LightComponent,
	Scripts,
	CannonPickScript,
	KaChingScript,
	DieScript
) {
	'use strict';

	$("#gameover1, #description, #points")
		.attr('unselectable', 'on')
		.css('user-select', 'none')
		.on('selectstart', false);

	var areaWidth = 30;
	var areaDepth = 20;
	var Nboxes = 20;
	var containerWidth = areaWidth / 4;

	function getColoredMaterial (r, g, b, a) {
		var material = new Material(ShaderLib.simpleLit);
		if (arguments.length === 0) {
			material.uniforms.materialDiffuse = [Math.random(),Math.random(),Math.random(),1];
		} else {
			material.uniforms.materialDiffuse = [r, g, b, a || 1];
		}
		return material;
	}

	function createEntity(meshData,material) {
		if(!material){
			material = getColoredMaterial();
		}
		return world.createEntity(meshData, material);
	}

	var goo = new GooRunner({
		//showStats: true,
		logo: {
			position: 'bottomright',
			color: '#fff'
		}
	});
	goo.renderer.domElement.id = 'goo';
	document.getElementById("container").appendChild(goo.renderer.domElement);

	goo.renderer.setClearColor(103 / 255, 115 / 255, 129 / 255, 1.0); // dark blue-grey

	var world = goo.world;

	var cannonSystem = new CannonSystem({
		gravity: new Vector3(0,-20,0),
	});
	world.setSystem(cannonSystem);

	var materialA = getColoredMaterial(1,0,0);
	var materialB = getColoredMaterial(0,1,0);

	function spawnBox(){
		var x = (Math.random()-0.5) * areaDepth * 0.5;
		var y = 8;
		var z = (Math.random()-0.5) * (areaWidth - containerWidth*2);
		var gameType = GameTypes.BOMB_A;
		var material = materialA;
		if(Math.random() > 0.5){
			material = materialB;
			gameType = GameTypes.BOMB_B;
		}

		var rigidBodyComponent = new CannonRigidbodyComponent();
		var radius = 2 + Math.random();
		var sphere = new Sphere(8,8,radius*0.5);

		var box = new Box(radius,radius,radius);
		var entity = createEntity(sphere, material).set([x, y, z]);
		var boxColliderComponent = new CannonBoxColliderComponent({
			halfExtents:new Vector3(radius*0.5,radius*0.5,radius*0.5)
		});
		entity.setComponent(rigidBodyComponent);
		entity.setComponent(boxColliderComponent);
		entity.addToWorld();

		var cylinder = new Cylinder(8,radius*0.22);
		var grayMat = getColoredMaterial(0.5,0.5,0.5);
		var blackMat = getColoredMaterial(0,0,0);
		var cylinderEntity = createEntity(cylinder, grayMat).set([0,radius*0.5,0]);
		cylinderEntity.setRotation([Math.PI/2,0,0]);
		cylinderEntity.setScale([1,1,radius*0.35]);
		entity.attachChild(cylinderEntity);
		cylinderEntity.addToWorld();

		var offset = radius*0.35;

		var miniSphere = new Sphere(8,8,radius*0.2);
		var miniSphereEntity1 = createEntity(miniSphere, grayMat).set([-offset,-offset,-offset]);
		entity.attachChild(miniSphereEntity1);
		miniSphereEntity1.addToWorld();

		var miniSphereEntity2 = createEntity(miniSphere, grayMat).set([-offset,-offset,offset]);
		entity.attachChild(miniSphereEntity2);
		miniSphereEntity2.addToWorld();

		var miniSphereEntity3 = createEntity(miniSphere, grayMat).set([offset,-offset,offset]);
		entity.attachChild(miniSphereEntity3);
		miniSphereEntity3.addToWorld();

		var miniSphereEntity4 = createEntity(miniSphere, grayMat).set([offset,-offset,-offset]);
		entity.attachChild(miniSphereEntity4);
		miniSphereEntity4.addToWorld();

		var eye1 = createEntity(miniSphere, blackMat).set([radius*0.45,0,radius*0.2]);
		entity.attachChild(eye1);
		eye1.setScale([0.2,0.8,0.2]);
		eye1.addToWorld();

		var eye2 = createEntity(miniSphere, blackMat).set([radius*0.45,0,-radius*0.2]);
		entity.attachChild(eye2);
		eye2.setScale([0.2,0.8,0.2]);
		eye2.addToWorld();

		entity.gameType = gameType;
		entity.spawnTime = Date.now();
	}

	function createGround(){
		var groundEntity = createEntity(new Quad(1000, 1000, 100, 100), getColoredMaterial(0.7,0.7,0.7))
			.set([0, -10, 0])
			.setRotation(-Math.PI / 2, 0, 0);
		var rigidBodyComponent = new CannonRigidbodyComponent({
			mass : 0 // static
		});
		var planeColliderComponent = new CannonPlaneColliderComponent();
		groundEntity.setComponent(rigidBodyComponent);
		groundEntity.setComponent(planeColliderComponent);
		groundEntity.addToWorld();
	}

	function createInvisibleWall(position, rotation){
		var entity = world.createEntity()
			.set(position)
			.setRotation(rotation[0],rotation[1],rotation[2]);
		var rigidBodyComponent = new CannonRigidbodyComponent({
			mass : 0 // static
		});
		var planeColliderComponent = new CannonPlaneColliderComponent();
		entity.setComponent(rigidBodyComponent);
		entity.setComponent(planeColliderComponent);
		entity.addToWorld();
	}

	function createStaticBox(x,y,z,w,d,h, material, gameType){
		var e = createEntity(new Box(w, d, h), material)
			.set([x, y, z])
			.setComponent(new CannonRigidbodyComponent({ mass: 0 }))
			.setComponent(new CannonBoxColliderComponent({
				halfExtents: new Vector3(w/2,d/2,h/2)
			}))
			.addToWorld();
		e.gameType = gameType;
		return e;
	}

	function createContainer(x,y,z, material, length, width, gameType){
		var w = 0.5;
		var a = width/2;
		var b = length / 2;
		var h = 5;
		createStaticBox(x + 0, y - 7.5, z + a + w/2, 2*b+w, h,  w, material);
		createStaticBox(x + 0, y - 7.5, z - a - w/2, 2*b+w, h,  w, material);

		createStaticBox(x + b, y - 7.5, z+         0,    w, h, 2*a, material);
		createStaticBox(x+ -b, y - 7.5, z+         0,    w, h, 2*a, material);

		// Bottom
		createStaticBox(x, y - 7.5 - h + 0.1, z,    b*2, h, 2*a,   material, gameType);
	}

	createGround();
	var timeOut = 5000;
	function spawnBoxLoop(){
		spawnBox();
		if(timeOut > 500){
			timeOut *= 0.95;
		}
		if(!goo.manuallyPaused){
			setTimeout(spawnBoxLoop,timeOut);
		}
	}
	spawnBoxLoop();

	var forcefieldEnabled = false;


	document.addEventListener('keydown', function(evt){
		switch(evt.keyCode){
		case 32:
			// Add force field
			forcefieldEnabled = true;
			break;
		default:
			//addBoxes();
			break;
		}
	}, false);

	document.addEventListener('keyup', function(evt){
		switch(evt.keyCode){
		case 32:
			// Add force field
			forcefieldEnabled = false;
			break;
		}
	}, false);

	createContainer(0,0, areaWidth / 2 +containerWidth/2, materialA, areaDepth, containerWidth, GameTypes.TRIGGER_A);
	createContainer(0,0,-areaWidth / 2 -containerWidth/2, materialB, areaDepth, containerWidth, GameTypes.TRIGGER_B);
	createInvisibleWall([  0, 0, -23],[0,0,0]);
	createInvisibleWall([  0, 0,  23],[0,Math.PI,0]);
	createInvisibleWall([-10, 0,   0],[0,Math.PI/2,0]);
	createInvisibleWall([ 10, 0,   0],[0,-Math.PI/2,0]);

	var force = new Vector3();
	goo.callbacks.push(function(){
		if(forcefieldEnabled){
			// Add some force to all bodies
			var physicsEntities = world.by.system("CannonSystem").toArray();

			for(var i=0; i<physicsEntities.length; i++){
				var entity = physicsEntities[i];

				// Force is directed to the origin
				force.copy(entity.getTranslation(force)).mul(-1);

				// Set a proper length of it
				force.normalize();
				force.mul(700);

				// Apply it to the entity
				entity.setForce(force);
			}
		}
	});

	// Add some lights
	world.createEntity(new PointLight(), [ 100, 100, 100]).addToWorld();
	world.createEntity(new PointLight(), [-100, -100, -100]).addToWorld();
	world.createEntity(new PointLight(), [-100, 100, -100]).addToWorld();

	Scripts.register(CannonPickScript);
	var cannonPickScript = Scripts.create("CannonPickScript",{
		whenUsed:true,
		pickButton:'Any',
		useForceNormal:true,
		forceNormal : [1,0,0]
	});
	var camera = new Camera();

	Scripts.register(KaChingScript);
	var kaChingScript = Scripts.create("KaChingScript",{
		whenUsed:true,
		domElement:document.getElementById('points'),
		goo:goo
	});

	var gameoverEl = document.getElementById('gameover');
	Scripts.register(DieScript);
	var dieScript = Scripts.create("DieScript",{
		whenUsed:true,
		domElement:gameoverEl,
		goo:goo
	});

	var cameraEntity = goo.world.createEntity(camera, [30, 10, 0], cannonPickScript, kaChingScript, dieScript, 'CameraEntity').addToWorld();
	cameraEntity.transformComponent.lookAt(new Vector3(0,0,0), new Vector3(0,1,0));

});
