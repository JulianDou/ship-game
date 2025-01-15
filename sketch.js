// This project uses P5Play.

let player = {

	stats : {
		bateau: {
			vie: 100,
			vitesse: 5,
			maniabilite: 5,
			collision: 1,
			taille: 1, // Taille doit être la valeur qu'on donnera à scale
			resistance: { // Les résistances sont des pourcentages (1 = 100% de dégâts subis)
				feu: 1,
				degats: 1
			},
			niveau: 1,
			experience: 0,
		},
		arme: {
			degats: {
				base: 10,
				feu: 0, // La quantité de dégâts qu'inflige le feu chaque seconde
			},
			recharge: 1000, // En millisecondes
			vitesse: 20, 
			dispersion: 10, // En degrés
			portee: 500, // En pixels
			projectiles: 1,
			taille: 1, // Taille doit être la valeur qu'on donnera à scale
			penetration: 0, // Nombre de cibles que peut traverser un projectile
			ricochets: 0, // Nombre de fois qu'un projectile peut rebondir
		}
	},

	utility : {
		sensMouvement: 1, // 0 = recule, 1 = arrêté, 2 = avance
		boutonMouvement: false,
		direction: 0, // En degrés
	},

	functions: {
		inputs : function(){
			if (kb.pressing('w') && player.utility.boutonMouvement == false) {
				player.utility.boutonMouvement = true;
				if (player.utility.sensMouvement < 2){
					player.utility.sensMouvement += 1;
				}
			}
			else if (kb.pressing('s') && player.utility.boutonMouvement == false) {
				player.utility.boutonMouvement = true;
				if (player.utility.sensMouvement > 0){
					player.utility.sensMouvement -= 1;
				}
			}
			else if (!kb.pressing('w') && !kb.pressing('s')){
				player.utility.boutonMouvement = false;
			}
			console.log(player.utility.sensMouvement);
		},
	
		mouvement : function(){
			if (player.utility.sensMouvement == 1){
				player.sprite.speed = 0;
			}
			else {
				player.sprite.speed = player.stats.bateau.vitesse;
			}
		},

		rotation : function(){
			if (kb.pressing('a')){
				if (player.utility.sensMouvement == 1){
					player.utility.direction -= player.stats.bateau.maniabilite*0.5;
				}
				else {
					player.utility.direction -= player.stats.bateau.maniabilite;
				}
			}
			else if (kb.pressing('d')){
				if (player.utility.sensMouvement == 1){
					player.utility.direction += player.stats.bateau.maniabilite*0.5;
				}
				else {
					player.utility.direction += player.stats.bateau.maniabilite;
				}
			}
			if (player.utility.sensMouvement == 0){
				player.sprite.direction = (player.utility.direction + 180) % 360;
				player.sprite.rotation = player.utility.direction;
			}
			else {
				player.sprite.direction = player.utility.direction;
				player.sprite.rotation = player.utility.direction;
			}
		}
	}

};

function setup() {
	new Canvas(500, 500);
	displayMode('centered');

	player.sprite = new Sprite(64, 64);
	player.sprite.color = 'brown';
}


function draw() {
	background('skyblue');

	player.functions.inputs();
	player.functions.mouvement();
	player.functions.rotation();
}
