// https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_terrain_fog.html
// https://github.com/mrdoob/three.js/blob/master/examples/canvas_geometry_birds.html

if ( ! Detector.webgl ) {

				Detector.addGetWebGLMessage();
				document.getElementById( 'interactives' ).innerHTML = "";

}

var container;

var camera, controls, scene, renderer;

var mesh, texture;

var worldWidth = 256, worldDepth = 256,
worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;

var clock = new THREE.Clock();

var SCREEN_WIDTH = window.innerWidth,
		SCREEN_HEIGHT = window.innerHeight,
		SCREEN_WIDTH_HALF = SCREEN_WIDTH  / 2,
		SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;

var birds, bird;

var boid, boids;

init();
animate();

function init() {

	container = document.getElementById( 'interactives' );

	camera = new THREE.PerspectiveCamera( 60, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );

	controls = new THREE.FirstPersonControls( camera );
	controls.movementSpeed = 150;
	controls.lookSpeed = 0.1;

	scene = new THREE.Scene();
  //set terrain color
	scene.fog = new THREE.FogExp2( 0xc6bbf7, 0.0025 );

	data = generateHeight( worldWidth, worldDepth );

	camera.position.y = data[ worldHalfWidth + worldHalfDepth * worldWidth ] * 10 + 500;

	var geometry = new THREE.PlaneBufferGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
	geometry.rotateX( - Math.PI / 2 );

	var vertices = geometry.attributes.position.array;

	for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

		vertices[ j + 1 ] = data[ i ] * 10;

	}

	texture = new THREE.CanvasTexture( generateTexture( data, worldWidth, worldDepth ) );
	texture.wrapS = THREE.ClampToEdgeWrapping;
	texture.wrapT = THREE.ClampToEdgeWrapping;

	mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
	scene.add( mesh );

	renderer = new THREE.WebGLRenderer();
  //set bg color
	renderer.setClearColor( 0x0c6bbf7 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

	container.innerHTML = "";

	container.appendChild( renderer.domElement );


	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	camera.updateProjectionMatrix();

	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

	controls.handleResize();

}

function generateHeight( width, height ) {

	var size = width * height, data = new Uint8Array( size ),
	perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;

	for ( var j = 0; j < 4; j ++ ) {

		for ( var i = 0; i < size; i ++ ) {

			var x = i % width, y = ~~ ( i / width );
			data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

		}

		quality *= 5;

	}

	return data;

}

function generateTexture( data, width, height ) {

	var canvas, canvasScaled, context, image, imageData,
	level, diff, vector3, sun, shade;

	vector3 = new THREE.Vector3( 0, 0, 0 );

	sun = new THREE.Vector3( 1, 1, 1 );
	sun.normalize();

	canvas = document.createElement( 'canvas' );
	canvas.width = width;
	canvas.height = height;

	context = canvas.getContext( '2d' );
	context.fillStyle = '#000';
	context.fillRect( 0, 0, width, height );

	image = context.getImageData( 0, 0, canvas.width, canvas.height );
	imageData = image.data;

	for ( var i = 0, j = 0, l = imageData.length; i < l; i += 4, j ++ ) {

		vector3.x = data[ j - 2 ] - data[ j + 2 ];
		vector3.y = 2;
		vector3.z = data[ j - width * 2 ] - data[ j + width * 2 ];
		vector3.normalize();

		shade = vector3.dot( sun );

		imageData[ i ] = ( 96 + shade * 128 ) * ( 0.5 + data[ j ] * 0.007 );
		imageData[ i + 1 ] = ( 32 + shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );
		imageData[ i + 2 ] = ( shade * 96 ) * ( 0.5 + data[ j ] * 0.007 );

	}

	context.putImageData( image, 0, 0 );

	// Scaled 4x

	canvasScaled = document.createElement( 'canvas' );
	canvasScaled.width = width * 4;
	canvasScaled.height = height * 4;

	context = canvasScaled.getContext( '2d' );
	context.scale( 4, 4 );
	context.drawImage( canvas, 0, 0 );

	image = context.getImageData( 0, 0, canvasScaled.width, canvasScaled.height );
	imageData = image.data;

	for ( var i = 0, l = imageData.length; i < l; i += 4 ) {

		var v = ~~ ( Math.random() * 5 );

		imageData[ i ] += v;
		imageData[ i + 1 ] += v;
		imageData[ i + 2 ] += v;

	}

	context.putImageData( image, 0, 0 );

	return canvasScaled;

}

//

function animate() {

	requestAnimationFrame( animate );

	render();

}


function render() {

	controls.update( clock.getDelta() );
	renderer.render( scene, camera );

}

// Based on http://www.openprocessing.org/visuals/?visualID=6910

var Boid = function() {

	var vector = new THREE.Vector3(),
	_acceleration, _width = 500, _height = 500, _depth = 200, _goal, _neighborhoodRadius = 100,
	_maxSpeed = 4, _maxSteerForce = 0.1, _avoidWalls = false;

	this.position = new THREE.Vector3();
	this.velocity = new THREE.Vector3();
	_acceleration = new THREE.Vector3();

	this.setGoal = function ( target ) {

		_goal = target;

	};

	this.setAvoidWalls = function ( value ) {

		_avoidWalls = value;

	};

	this.setWorldSize = function ( width, height, depth ) {

		_width = width;
		_height = height;
		_depth = depth;

	};

	this.run = function ( boids ) {

		if ( _avoidWalls ) {

			vector.set( - _width, this.position.y, this.position.z );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.add( vector );

			vector.set( _width, this.position.y, this.position.z );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.add( vector );

			vector.set( this.position.x, - _height, this.position.z );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.add( vector );

			vector.set( this.position.x, _height, this.position.z );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.add( vector );

			vector.set( this.position.x, this.position.y, - _depth );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.add( vector );

			vector.set( this.position.x, this.position.y, _depth );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.add( vector );

		}/* else {

			this.checkBounds();

		}
		*/

		if ( Math.random() > 0.5 ) {

			this.flock( boids );

		}

		this.move();

	};

	this.flock = function ( boids ) {

		if ( _goal ) {

			_acceleration.add( this.reach( _goal, 0.005 ) );

		}

		_acceleration.add( this.alignment( boids ) );
		_acceleration.add( this.cohesion( boids ) );
		_acceleration.add( this.separation( boids ) );

	};

	this.move = function () {

		this.velocity.add( _acceleration );

		var l = this.velocity.length();

		if ( l > _maxSpeed ) {

			this.velocity.divideScalar( l / _maxSpeed );

		}

		this.position.add( this.velocity );
		_acceleration.set( 0, 0, 0 );

	};

	this.checkBounds = function () {

		if ( this.position.x >   _width ) this.position.x = - _width;
		if ( this.position.x < - _width ) this.position.x =   _width;
		if ( this.position.y >   _height ) this.position.y = - _height;
		if ( this.position.y < - _height ) this.position.y =  _height;
		if ( this.position.z >  _depth ) this.position.z = - _depth;
		if ( this.position.z < - _depth ) this.position.z =  _depth;

	};

	//

	this.avoid = function ( target ) {

		var steer = new THREE.Vector3();

		steer.copy( this.position );
		steer.sub( target );

		steer.multiplyScalar( 1 / this.position.distanceToSquared( target ) );

		return steer;

	};

	this.repulse = function ( target ) {

		var distance = this.position.distanceTo( target );

		if ( distance < 150 ) {

			var steer = new THREE.Vector3();

			steer.subVectors( this.position, target );
			steer.multiplyScalar( 0.5 / distance );

			_acceleration.add( steer );

		}

	};

	this.reach = function ( target, amount ) {

		var steer = new THREE.Vector3();

		steer.subVectors( target, this.position );
		steer.multiplyScalar( amount );

		return steer;

	};

	this.alignment = function ( boids ) {

		var boid, velSum = new THREE.Vector3(),
		count = 0;

		for ( var i = 0, il = boids.length; i < il; i++ ) {

			if ( Math.random() > 0.6 ) continue;

			boid = boids[ i ];

			distance = boid.position.distanceTo( this.position );

			if ( distance > 0 && distance <= _neighborhoodRadius ) {

				velSum.add( boid.velocity );
				count++;

			}

		}

		if ( count > 0 ) {

			velSum.divideScalar( count );

			var l = velSum.length();

			if ( l > _maxSteerForce ) {

				velSum.divideScalar( l / _maxSteerForce );

			}

		}

		return velSum;

	};

	this.cohesion = function ( boids ) {

		var boid, distance,
		posSum = new THREE.Vector3(),
		steer = new THREE.Vector3(),
		count = 0;

		for ( var i = 0, il = boids.length; i < il; i ++ ) {

			if ( Math.random() > 0.6 ) continue;

			boid = boids[ i ];
			distance = boid.position.distanceTo( this.position );

			if ( distance > 0 && distance <= _neighborhoodRadius ) {

				posSum.add( boid.position );
				count++;

			}

		}

		if ( count > 0 ) {

			posSum.divideScalar( count );

		}

		steer.subVectors( posSum, this.position );

		var l = steer.length();

		if ( l > _maxSteerForce ) {

			steer.divideScalar( l / _maxSteerForce );

		}

		return steer;

	};

	this.separation = function ( boids ) {

		var boid, distance,
		posSum = new THREE.Vector3(),
		repulse = new THREE.Vector3();

		for ( var i = 0, il = boids.length; i < il; i ++ ) {

			if ( Math.random() > 0.6 ) continue;

			boid = boids[ i ];
			distance = boid.position.distanceTo( this.position );

			if ( distance > 0 && distance <= _neighborhoodRadius ) {

				repulse.subVectors( this.position, boid.position );
				repulse.normalize();
				repulse.divideScalar( distance );
				posSum.add( repulse );

			}

		}

		return posSum;

	}

}
