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
	new Canvas(windowWidth, windowHeight);
	displayMode('centered', 'pixelated', 8);

	player.sprite = new Sprite(windowWidth/2, windowHeight/2);
	player.sprite.width = 64;
	player.sprite.height = 32;
	player.sprite.scale = 1.2;
	player.sprite.collider = 'dynamic';
	player.sprite.image = loadImage('assets/player.png');
	player.sprite.image.direction = 90;

	let ennemi = {};
	ennemi.sprite = new Sprite(windowWidth/2 + 100, windowHeight/2 + 45, 'rectangle');
	ennemi.sprite.collider = 'static';
	ennemi.sprite.drag = 2;
	ennemi.sprite.rotationDrag = 2;
	ennemi.sprite.text = ennemi.sprite.collider;

	let ennemi2 = {};
	ennemi2.sprite = new Sprite(windowWidth/2 + 100, windowHeight/2 - 45, 'rectangle');
	ennemi2.sprite.collider = 'dynamic';
	ennemi2.sprite.drag = 2;
	ennemi2.sprite.rotationDrag = 2;
	ennemi2.sprite.text = ennemi2.sprite.collider;
	
}


function draw() {
	background('skyblue');
	camera.x = player.sprite.x;
	camera.y = player.sprite.y;

	player.functions.inputs();
	player.functions.mouvement();
	player.functions.rotation();
}
