define([
	'goo/math/Vector3',
	'goo/scripts/Scripts',
	'goo/scripts/ScriptUtils',
	'goo/renderer/Renderer',
	'goo/math/Plane',
], function (
	Vector3,
	Scripts,
	ScriptUtils,
	Renderer,
	Plane
) {
	'use strict';

	var CANNON = window.CANNON;

	function KaChingScript() {
		var cannonSystem;
		var points = 0;

		function setup(params, env) {
			var el = params.domElement;
			el.innerHTML = "";
		}

		function update(params, env) {
			var el = params.domElement;
			el.innerHTML = points;

			var cannonSystem = env.world.getSystem("CannonSystem");
			for(var i=0; i<cannonSystem.world.contacts.length; i++){
				var c = cannonSystem.world.contacts[i];
				var entityA, entityB;
				// Find entities in the contact
				var entities = env.world.by.system("CannonSystem").toArray();
				for(var j=0; j<entities.length; j++){
					var e = entities[j];
					var body = e.cannonRigidbodyComponent.body;
					if(c.bi === body){
						entityA = e;
					}
					if(c.bj === body){
						entityB = e;
					}
				}

				if(
					entityA &&
					entityB &&
					typeof entityA.gameType != "undefined" &&
					typeof entityB.gameType != "undefined"
				){
					if(
						(entityA.gameType === GameTypes.BOMB_A && entityB.gameType === GameTypes.TRIGGER_A) ||
						(entityA.gameType === GameTypes.BOMB_B && entityB.gameType === GameTypes.TRIGGER_B) ||
						(entityB.gameType === GameTypes.BOMB_A && entityA.gameType === GameTypes.TRIGGER_A) ||
						(entityB.gameType === GameTypes.BOMB_B && entityA.gameType === GameTypes.TRIGGER_B)
					){
						// Remove the body and count point
						points++;
						el.innerHTML = points;

						if(entityA.gameType === GameTypes.BOMB_A || entityA.gameType === GameTypes.BOMB_B){
							// OK!
							entityA.removeFromWorld();
						} else if(entityB.gameType === GameTypes.BOMB_A || entityB.gameType === GameTypes.BOMB_B) {
							// OK!
							entityB.removeFromWorld();
						}
					} else if(
						(entityA.gameType === GameTypes.BOMB_A && entityB.gameType === GameTypes.TRIGGER_B) ||
						(entityA.gameType === GameTypes.BOMB_B && entityB.gameType === GameTypes.TRIGGER_A) ||
						(entityB.gameType === GameTypes.BOMB_A && entityA.gameType === GameTypes.TRIGGER_B) ||
						(entityB.gameType === GameTypes.BOMB_B && entityA.gameType === GameTypes.TRIGGER_A) ){
							die(params.goo, jQuery);
							/*("#container").hide();
							jQuery("#description").hide();
							jQuery("#gameover1").text("GAME OVER (refresh to retry)");
							params.goo.stopGameLoop();*/

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

	KaChingScript.externals = {
		name: 'KaChingScript',
		description: 'Removes bombs from containers and counts points',
		parameters: [{
			key: 'whenUsed',
			type: 'boolean',
			'default': true
		}]
	};

	return KaChingScript;
});