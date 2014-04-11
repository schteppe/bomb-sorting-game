define([
	'goo/math/Vector3',
	'goo/scripts/Scripts',
	'goo/scripts/ScriptUtils',
	'goo/renderer/Renderer',
	'goo/math/Plane',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
], function (
	Vector3,
	Scripts,
	ScriptUtils,
	Renderer,
	Plane,
	Material,
	ShaderLib
) {
	'use strict';

	var CANNON = window.CANNON;
	var maxAge = 10000;
	var warningAge = 5000;
	var warningAge2 = 8000;

	function getColoredMaterial (r, g, b, a) {
		var material = new Material(ShaderLib.simpleLit);
		if (arguments.length === 0) {
			material.uniforms.materialDiffuse = [Math.random(),Math.random(),Math.random(),1];
		} else {
			material.uniforms.materialDiffuse = [r, g, b, a || 1];
		}
		return material;
	}

	var warningMaterialA = getColoredMaterial(1,0.4,0.4);
	var warningMaterialB = getColoredMaterial(0.4,1,0.4);
	var warningMaterialA2 = getColoredMaterial(1,0.6,0.6);
	var warningMaterialB2 = getColoredMaterial(0.6,1,0.6);

	function DieScript() {
		var cannonSystem;
		var points = 0;
		var died = false;

		function setup(params, env) {
		}

		function update(params, env) {
			if(died) return;
			var cannonSystem = env.world.getSystem("CannonSystem");

			// Find entities in the contact
			var entities = env.world.by.system("CannonSystem").toArray();
			for(var j=0; j<entities.length; j++){
				var e = entities[j];

				if(e.gameType === GameTypes.BOMB_A || e.gameType === GameTypes.BOMB_B){
					if(Date.now() - e.spawnTime > warningAge && !e.warned){
						e.meshRendererComponent.materials[0] = e.gameType === GameTypes.BOMB_A ? warningMaterialA : warningMaterialB;
						e.warned = true;
					}
					if(Date.now() - e.spawnTime > warningAge2 && !e.warned2){
						e.meshRendererComponent.materials[0] = e.gameType === GameTypes.BOMB_A ? warningMaterialA2 : warningMaterialB2;
						e.warned2 = true;
					}
					if(Date.now() - e.spawnTime > maxAge){
						die(params.goo, jQuery);
						//die(params, env);
					}
				}
			}
		}

		function cleanup(params, environment) {
		}

		return {
			setup: setup,
			update: update,
			cleanup: cleanup
		};
	}

	DieScript.externals = {
		name: 'DieScript',
		description: 'Removes bombs from containers and counts points',
		parameters: [{
			key: 'whenUsed',
			type: 'boolean',
			'default': true
		}]
	};

	return DieScript;
});