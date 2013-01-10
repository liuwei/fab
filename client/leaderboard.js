Template.leaderboard.geometries = function () {
    return Geometries.find();
};

Template.leaderboard.selected_name = function () {
    var geometry = Geometries.findOne(Session.get("selected_name"));
    return geometry && geometry.name;
};

Template.geometry.selected = function () {
    return Session.equals("selected_name", this._id) ? "selected" : '';
};

Template.geometry.events({
    'click':function () {
        Session.set("selected_name", this._id);
        var geometry = Geometries.findOne(Session.get("selected_name"));
        var json1 = new Object();
        json1.urlBaseType = "relativeToHTML";
        json1.objects = {};
        json1.geometries = {};
        json1.objects[geometry.name] = {
            "geometry" : geometry.name,
            "position" : [ 0, -25, 0 ],
            "rotation" : [ 0, 0, 0 ],
            "scale"	   : [ 4, 4, 4 ],
            "visible"  : true
        };
        json1.objects["light1"] = {
            "type"		 : "DirectionalLight",
            "direction"	 : [ 0, 1, 1 ],
            "color" 	 : 16777215,
            "intensity"	 : 1
        };
        json1.objects["camera1"] = {
            "type"  : "PerspectiveCamera",
            "fov"   : 50,
            "aspect": 1.33333,
            "near"  : 1,
            "far"   : 1000,
            "position": [ 0, 0, 100 ],
            "target"  : [ 0, 0, 0 ]
        };
        json1.geometries[geometry.name] = {
            "type": geometry.type,
            "url" : geometry.url
        };
        json1.defaults = {
            "bgcolor": [255,255,255],
            "bgalpha": 1,
            "camera": "camera1"
        };
        var loader = new THREE.SceneLoader();
        loader.parse(json1, callbackFinished, "a/b");

    }
});

var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var container;

var camera, scene, loaded, json1;
var renderer;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var rotatingObjects = [];
var morphAnimatedObjects = [];

var clock = new THREE.Clock();

document.addEventListener( 'mousemove', onDocumentMouseMove, false );

init();

function $( id ) {

    return document.getElementById( id );

}

function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    renderer.domElement.style.position = "relative";
    container.appendChild( renderer.domElement );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.physicallyBasedShading = true;



    loader = new THREE.SceneLoader();

    json1 = new Object();

    window.addEventListener( 'resize', onWindowResize, false );

}

function callbackFinished( result ) {
    $( "message" ).style.display = "none";

    camera = result.currentCamera;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    scene = result.scene;

    renderer.setClearColor( result.bgColor, result.bgAlpha );

    scene.traverse( function ( object ) {

        if ( object.properties.rotating === true ) {

            rotatingObjects.push( object );

        }

        if ( object instanceof THREE.MorphAnimMesh ) {

            morphAnimatedObjects.push( object );

        }

        if ( object instanceof THREE.SkinnedMesh ) {

            if ( object.geometry.animation ) {

                THREE.AnimationHandler.add( object.geometry.animation );

                var animation = new THREE.Animation( object, object.geometry.animation.name );
                animation.JITCompile = false;
                animation.interpolationType = THREE.AnimationHandler.LINEAR;

                animation.play();

            }

        }

    } );
    animate();
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

    mouseX = ( event.clientX - windowHalfX );
    mouseY = ( event.clientY - windowHalfY );

}

function animate() {

    requestAnimationFrame( animate );

    render();
}

function render() {

    var delta = clock.getDelta();

    camera.position.x += ( mouseX - camera.position.x ) * .001;
    camera.position.y += ( - mouseY - camera.position.y ) * .001;

    camera.lookAt( scene.position );

    // update skinning

    THREE.AnimationHandler.update( delta * 1 );

    for ( var i = 0; i < rotatingObjects.length; i ++ ) {

        var object = rotatingObjects[ i ];

        if ( object.properties.rotateX ) object.rotation.x += 1 * delta;
        if ( object.properties.rotateY ) object.rotation.y += 0.5 * delta;

    }

    for ( var i = 0; i < morphAnimatedObjects.length; i ++ ) {

        var object = morphAnimatedObjects[ i ];

        object.updateAnimation( 1000 * delta );

    }

    renderer.render( scene, camera );

}
