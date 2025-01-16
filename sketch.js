let player = {

	stats : {
		bateau: {
			vie: 100,
			vitesse: 2.50,
			maniabilite: 1.50,
			collision: 1.00,
			taille: 1.00, // Taille doit être la valeur qu'on donnera à scale
			resistance: { // Les résistances sont des pourcentages (1 = 100% de dégâts subis)
				feu: 1.00,
				degats: 1.00
			},
			niveau: 1,
			experience: 0,
			expMax:100,
			expMult: 1,
		},
		arme: {
			degats: {
				base: 10.00,
				feu: 0.00, // La quantité de dégâts qu'inflige le feu chaque seconde
				dureeFeu: 5000, // En millisecondes
			},
			recharge: 0, // En millisecondes
			vitesse: 5, 
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
		vagues: [],
		functions: {
			createVague: function(X, Y){
				let vague = new Sprite(X, Y);
				vague.width = 64;
				vague.height = 64;
				vague.image = loadImage('assets/ripple.png');
				vague.collider = 'none';
				vague.layer = -1;
				vague.opacity = 1;
				player.utility.vagues.push(vague);
			}
		}
	},

	functions: {
		runAll : function(){
			player.functions.inputs();
			player.functions.mouvement();
			player.functions.rotation();
			player.functions.vagues();
			player.functions.fixRotation();
			player.functions.checkStats();
			player.functions.expstat();
		},

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
				if (player.utility.sensMouvement == 0){
					player.sprite.speed = player.stats.bateau.vitesse/2;
				}
				else {
					player.sprite.speed = player.stats.bateau.vitesse;
				}
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
		},

		vagues: function(){
			for (let i=0; i<player.utility.vagues.length; i++){
				let vague = player.utility.vagues[i];
				vague.opacity -= 0.02;
				vague.scale += 0.02;
				if (vague.opacity <= 0){
					player.utility.vagues.splice(i, 1);
					vague.remove();
				}
			}
			if (frameCount % 10 == 0 && player.sprite.speed > 0){
				player.utility.functions.createVague(player.sprite.x, player.sprite.y);
			}
		},

		fixRotation: function(){
			if (player.utility.direction > 360){
				player.utility.direction = 0;
			}
			else if (player.utility.direction < 0){
				player.utility.direction = 360;
			}
		},

		checkStats: function() {
			player.sprite.scale = player.stats.bateau.taille;
			
		},
		expstat: function(){
			if (player.stats.bateau.experience >= player.stats.bateau.expMax){
				player.stats.bateau.experience = 0;
				player.stats.bateau.niveau += 1;
				player.stats.bateau.expMax = player.stats.bateau.expMax * 1.5;
			}
		},

		
	}

};

let viseur = {
	utility : {
		direction: 0,
	},

	functions: {
		runAll : function(){
			viseur.functions.rotation();
			viseur.functions.fixRotation();
			viseur.functions.mouvement();
			viseur.functions.checkAngle();
		},

		fixRotation: function(){
			if (viseur.utility.direction > 360){
				viseur.utility.direction = 0;
			}
			else if (viseur.utility.direction < 0){
				viseur.utility.direction = 360;
			}
		},

		rotation : function(){
			viseur.sprite.rotateTowards(mouse, 1, 0);
			viseur.utility.direction = floor((viseur.sprite.rotation % 360 + 360) % 360);
		},

		mouvement : function(){
			viseur.sprite.x = player.sprite.x;
			viseur.sprite.y = player.sprite.y;
		},

		checkAngle : function(){	
			// Calculate relative angle between player and viseur
			let relativeAngle = (viseur.utility.direction - player.utility.direction + 360) % 360;
		
			// Determine if viseur is in the "left" or "right" zone of player
			if (relativeAngle >= 180 && relativeAngle <= 360) {
				arme.utility.visee = "left"; // Left zone
			} else {
				arme.utility.visee = "right"; // Right zone
			}
		}
	}
};

let arme = {
	utility : {
		visee: "left", // left ou right
		recharge: 0,
		functions: {
			createProjectile: function(){
				let boulet = new Sprite(player.sprite.x, player.sprite.y);

				boulet.source = "player";
				boulet.origine = {
					x: player.sprite.x,
					y: player.sprite.y,
				}
				boulet.vie = player.stats.arme.degats.base;
				boulet.ennemisPerces = 0;
				boulet.rebonds = 0;
				boulet.porteeMax = player.stats.arme.portee + random(-10, 10);

				boulet.diameter = 10;
				boulet.collider = 'none';
				boulet.color = 'black';
				boulet.scale = player.stats.arme.taille;
				if (arme.utility.visee == "left"){
					boulet.direction = player.utility.direction - 90;
					boulet.direction += random(-player.stats.arme.dispersion/2, player.stats.arme.dispersion/2);
				}
				else {
					boulet.direction = player.utility.direction + 90;
					boulet.direction += random(-player.stats.arme.dispersion/2, player.stats.arme.dispersion/2);
				}
				
				if (player.stats.arme.projectiles > 1){
					boulet.speed = player.stats.arme.vitesse + random(-1, 1);
				}
				else {
					boulet.speed = player.stats.arme.vitesse;					
				}

				projectile.utility.projectiles.push(boulet);
			}
		},
	},

	functions: {
		runAll : function(){
			arme.functions.rotation();
			arme.functions.mouvement();
			arme.functions.tir();
		},

		rotation : function(){
			if (arme.utility.visee == "left"){
				arme.sprite.rotation = player.utility.direction - 90;
			}
			else {
				arme.sprite.rotation = player.utility.direction + 90;
			}
		},

		mouvement : function(){
			arme.sprite.x = player.sprite.x;
			arme.sprite.y = player.sprite.y;
		},

		tir : function(){
			if (mouse.pressed()){
				if (arme.utility.recharge == 0){
					arme.utility.recharge = player.stats.arme.recharge;
					for (let i=0; i<player.stats.arme.projectiles; i++){
						arme.utility.functions.createProjectile();
					}
				}
			}
		},
	}
}

let projectile = {
	utility : {
		projectiles: [],
	},

	functions: {
		runAll : function(){
			projectile.functions.update();
		},

		update : function(){
			for (let boulet of projectile.utility.projectiles){
				if (boulet.source = "player"){
					if (dist(boulet.origine.x, boulet.origine.y, boulet.x, boulet.y) >= boulet.porteeMax){
						player.utility.functions.createVague(boulet.x, boulet.y);
						boulet.remove();
						projectile.utility.projectiles.splice(projectile.utility.projectiles.indexOf(boulet), 1);
					}
				}
			}
		}
	}
}

let reticule = {
	functions: {
		runAll : function(){
			reticule.functions.mouvement();
			reticule.functions.rotation();
		},

		mouvement : function(){
			reticule.sprite.x = mouse.x;
			reticule.sprite.y = mouse.y;
		},

		rotation : function(){
			reticule.sprite.rotateTowards(player.sprite, 1, 0);
			if (arme.utility.visee == "left"){
				reticule.sprite.image = loadImage('assets/retigauche.png');
			}
			else {
				reticule.sprite.image = loadImage('assets/retidroite.png');
			}
		},
	}
}

let expblock = {
	utility : {
		expblock: [],
	},

	functions: {
		runAll : function(){
			expblock.functions.update();
		},

		update : function(){
			for (let i = expblock.utility.expblock.length - 1; i >= 0; i--) {
				let expBlock = expblock.utility.expblock[i];
				if (player.sprite.collides(expBlock)) {
					player.stats.bateau.experience += expBlock.experience;
					expBlock.remove();
					expblock.utility.expblock.splice(i, 1);
				}
			}
		},

		createExpBlock : function(type, x, y) {
			let expBlock = new Sprite(x, y);
			expBlock.shape = "circle";
			expBlock.collider = "static";
			expBlock.color = type.color;
			expBlock.scale = type.scale;
			expBlock.experience = type.experience;
			expblock.utility.expblock.push(expBlock);
		}
	},

	types: {
		lightGreen: { color: "lightgreen", scale: 0.5, experience: 10 },
		green: { color: "green", scale: 1, experience: 50 },
		darkGreen: { color: "darkgreen", scale: 1.5, experience: 100 }
	}
}
	






function setup() {
	frameRate(60);

	new Canvas(windowWidth, windowHeight);
	displayMode('centered', 'pixelated', 8);
 	background("skyblue")

	timermillieseconde=0;
	timerseconde=0;
	timerminute=0;  

	//start..........................
	

	player.sprite = new Sprite(windowWidth/2, windowHeight/2);
	player.sprite.width = 64;
	player.sprite.height = 32;
	player.sprite.scale = 1.2;
	player.sprite.collider = 'dynamic';
	player.sprite.image = loadImage('assets/player.png');
	player.sprite.image.direction = 90;

	time = new Sprite(player.sprite.x-(windowWidth/2)+180, player.sprite.y-(windowHeight/2)+50, 0, 0);
	time.textSize = 40;
	time.text = "Time : " +timerminute+ "min" + timermillieseconde+"s";
	time.collider = "none";
	time.textColor = "white";
	time.layer=1000000;

	reload= new Sprite(player.sprite.x-(windowWidth/2)+180, player.sprite.y-(windowHeight/2)+100, 0, 0);
	reload.textSize = 40;
	reload.text = "Reload : " + arme.utility.recharge;
	reload.collider = "none";
	reload.textColor = "white";
	reload.layer=1000000;

	niveautext= new Sprite(player.sprite.x-(windowWidth/2)+180, player.sprite.y-(windowHeight/2)+150, 0, 0);
	niveautext.textSize = 40;
	niveautext.text = "Niveau : " + player.stats.bateau.niveau;
	niveautext.collider = "none";
	niveautext.textColor = "white";
	niveautext.layer=1000000;

	exptext= new Sprite(player.sprite.x-(windowWidth/2)+180, player.sprite.y-(windowHeight/2)+200, 0, 0);
	exptext.textSize = 40;
	exptext.text = "Exp : " + player.stats.bateau.experience;
	exptext.collider = "none";
	exptext.textColor = "white";
	exptext.layer=1000000;

	expblock.sprite = new Sprite((windowWidth/2)+50, (windowHeight/2)+250,50,50);
	expblock.sprite.shape = "circle";
	
	
	viseur.sprite = new Sprite(player.sprite.x, player.sprite.y);
	viseur.sprite.width = 64;
	viseur.sprite.height = 8;
	viseur.sprite.offset.x = 32;
	viseur.sprite.collider = 'none';
	viseur.sprite.opacity = 0;

	arme.sprite = new Sprite(player.sprite.x, player.sprite.y);
	arme.sprite.width = 32;
	arme.sprite.height = 8;
	arme.sprite.offset.x = 16;
	arme.sprite.collider = 'none';

	let reference = new Sprite(windowWidth/2+100, windowHeight/2);
	reference.collider = 'static';

	reticule.sprite = new Sprite(mouseX, mouseY);
	reticule.sprite.collider = 'none';
	reticule.sprite.image = loadImage('assets/crosshair.png');

    backup.functions.initialize();
}


let backup = {
  functions: {
    initialize: function() {
      let yOffset = 80;
      let ySpacing = 100;
      let xOffSet = player.sprite.x + (windowWidth/2) -200;

      this.textspeed = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
      this.textspeed.textSize = 30;
      this.textspeed.text = "Speed : " + player.stats.bateau.vitesse;
      this.textspeed.collider = "static";
      this.textspeed.textColor = "white";
      this.textspeed.layer = 100000000;

      this.buttonmore = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
      this.buttonmore.text = "+";
      this.buttonmore.textSize = 30;
      this.buttonmore.color = "white";
      this.buttonmore.collider = "static";
      this.buttonmore.layer = 100000000;

      this.buttonless = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
      this.buttonless.text = "-";
      this.buttonless.textSize = 30;
      this.buttonless.color = "white";
      this.buttonless.collider = "static";
      this.buttonless.layer = 100000000;

      yOffset += ySpacing;

      this.textVie = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
      this.textVie.textSize = 30;
      this.textVie.text = "Vie : " + player.stats.bateau.vie;
      this.textVie.collider = "static";
      this.textVie.textColor = "white";
      this.textVie.layer = 100000000;

      this.buttonMoreVie = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
      this.buttonMoreVie.text = "+";
      this.buttonMoreVie.textSize = 30;
      this.buttonMoreVie.color = "white";
      this.buttonMoreVie.collider = "static";
      this.buttonMoreVie.layer = 100000000;

      this.buttonLessVie = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
      this.buttonLessVie.text = "-";
      this.buttonLessVie.textSize = 30;
      this.buttonLessVie.color = "white";
      this.buttonLessVie.collider = "static";
      this.buttonLessVie.layer = 100000000;

      yOffset += ySpacing;

      this.textManiabilite = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
      this.textManiabilite.textSize = 30;
      this.textManiabilite.text = "Maniabilité : " + player.stats.bateau.maniabilite;
      this.textManiabilite.collider = "static";
      this.textManiabilite.textColor = "white";
      this.textManiabilite.layer = 100000000;

      this.buttonMoreManiabilite = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
      this.buttonMoreManiabilite.text = "+";
      this.buttonMoreManiabilite.textSize = 30;
      this.buttonMoreManiabilite.color = "white";
      this.buttonMoreManiabilite.collider = "static";
      this.buttonMoreManiabilite.layer = 100000000;

      this.buttonLessManiabilite = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
      this.buttonLessManiabilite.text = "-";
      this.buttonLessManiabilite.textSize = 30;
      this.buttonLessManiabilite.color = "white";
      this.buttonLessManiabilite.collider = "static";
      this.buttonLessManiabilite.layer = 100000000;

      yOffset += ySpacing;

      this.textTaille = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
      this.textTaille.textSize = 30;
      this.textTaille.text = "Taille : " + player.stats.bateau.taille;
      this.textTaille.collider = "static";
      this.textTaille.textColor = "white";
      this.textTaille.layer = 100000000;

      this.buttonMoreTaille = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
      this.buttonMoreTaille.text = "+";
      this.buttonMoreTaille.textSize = 30;
      this.buttonMoreTaille.color = "white";
      this.buttonMoreTaille.collider = "static";
      this.buttonMoreTaille.layer = 100000000;

      this.buttonLessTaille = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
      this.buttonLessTaille.text = "-";
      this.buttonLessTaille.textSize = 30;
      this.buttonLessTaille.color = "white";
      this.buttonLessTaille.collider = "static";
      this.buttonLessTaille.layer = 100000000;

      yOffset += ySpacing;

      this.textResistance = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
      this.textResistance.textSize = 30;
      this.textResistance.text = "Résistance : " + player.stats.bateau.resistance.degats;
      this.textResistance.collider = "static";
      this.textResistance.textColor = "white";
      this.textResistance.layer = 100000000;

      this.buttonMoreResistance = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
      this.buttonMoreResistance.text = "+";
      this.buttonMoreResistance.textSize = 30;
      this.buttonMoreResistance.color = "white";
      this.buttonMoreResistance.collider = "static";
      this.buttonMoreResistance.layer = 100000000;

      this.buttonLessResistance = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
      this.buttonLessResistance.text = "-";
      this.buttonLessResistance.textSize = 30;
      this.buttonLessResistance.color = "white";
      this.buttonLessResistance.collider = "static";
      this.buttonLessResistance.layer = 100000000;

      yOffset += ySpacing;

      this.textResistanceFeu = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
      this.textResistanceFeu.textSize = 30;
      this.textResistanceFeu.text = "Résistance Feu : " + player.stats.bateau.resistance.feu;
      this.textResistanceFeu.collider = "static";
      this.textResistanceFeu.textColor = "white";
      this.textResistanceFeu.layer = 100000000;

      this.buttonMoreResistanceFeu = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
      this.buttonMoreResistanceFeu.text = "+";
      this.buttonMoreResistanceFeu.textSize = 30;
      this.buttonMoreResistanceFeu.color = "white";
      this.buttonMoreResistanceFeu.collider = "static";
      this.buttonMoreResistanceFeu.layer = 100000000;

      this.buttonLessResistanceFeu = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
      this.buttonLessResistanceFeu.text = "-";
      this.buttonLessResistanceFeu.textSize = 30;
      this.buttonLessResistanceFeu.color = "white";
      this.buttonLessResistanceFeu.collider = "static";
      this.buttonLessResistanceFeu.layer = 100000000;


	yOffset += ySpacing;

	this.textDegatsBase = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	this.textDegatsBase.textSize = 30;
	this.textDegatsBase.text = "Dégâts Base : " + player.stats.arme.degats.base;
	this.textDegatsBase.collider = "static";
	this.textDegatsBase.textColor = "white";
	this.textDegatsBase.layer = 100000000;

	this.buttonMoreDegatsBase = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonMoreDegatsBase.text = "+";
	this.buttonMoreDegatsBase.textSize = 30;
	this.buttonMoreDegatsBase.color = "white";
	this.buttonMoreDegatsBase.collider = "static";
	this.buttonMoreDegatsBase.layer = 100000000;

	this.buttonLessDegatsBase = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonLessDegatsBase.text = "-";
	this.buttonLessDegatsBase.textSize = 30;
	this.buttonLessDegatsBase.color = "white";
	this.buttonLessDegatsBase.collider = "static";
	this.buttonLessDegatsBase.layer = 100000000;

	yOffset += ySpacing;

	this.textDegatsFeu = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	this.textDegatsFeu.textSize = 30;
	this.textDegatsFeu.text = "Dégâts Feu : " + player.stats.arme.degats.feu;
	this.textDegatsFeu.collider = "static";
	this.textDegatsFeu.textColor = "white";
	this.textDegatsFeu.layer = 100000000;

	this.buttonMoreDegatsFeu = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonMoreDegatsFeu.text = "+";
	this.buttonMoreDegatsFeu.textSize = 30;
	this.buttonMoreDegatsFeu.color = "white";
	this.buttonMoreDegatsFeu.collider = "static";
	this.buttonMoreDegatsFeu.layer = 100000000;

	this.buttonLessDegatsFeu = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonLessDegatsFeu.text = "-";
	this.buttonLessDegatsFeu.textSize = 30;
	this.buttonLessDegatsFeu.color = "white";
	this.buttonLessDegatsFeu.collider = "static";
	this.buttonLessDegatsFeu.layer = 100000000;

	

	//ligne 2
	xOffSet= xOffSet-300;
	yOffset = 80;

	this.textRecharge = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	this.textRecharge.textSize = 30;
	this.textRecharge.text = "Recharge : " + player.stats.arme.recharge;
	this.textRecharge.collider = "static";
	this.textRecharge.textColor = "white";
	this.textRecharge.layer = 100000000;

	this.buttonMoreRecharge = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonMoreRecharge.text = "+";
	this.buttonMoreRecharge.textSize = 30;
	this.buttonMoreRecharge.color = "white";
	this.buttonMoreRecharge.collider = "static";
	this.buttonMoreRecharge.layer = 100000000;

	this.buttonLessRecharge = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonLessRecharge.text = "-";
	this.buttonLessRecharge.textSize = 30;
	this.buttonLessRecharge.color = "white";
	this.buttonLessRecharge.collider = "static";
	this.buttonLessRecharge.layer = 100000000;

	yOffset += ySpacing;

	this.textVitesse = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	this.textVitesse.textSize = 30;
	this.textVitesse.text = "Vitesse : " + player.stats.arme.vitesse;
	this.textVitesse.collider = "static";
	this.textVitesse.textColor = "white";
	this.textVitesse.layer = 100000000;

	this.buttonMoreVitesse = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonMoreVitesse.text = "+";
	this.buttonMoreVitesse.textSize = 30;
	this.buttonMoreVitesse.color = "white";
	this.buttonMoreVitesse.collider = "static";
	this.buttonMoreVitesse.layer = 100000000;

	this.buttonLessVitesse = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonLessVitesse.text = "-";
	this.buttonLessVitesse.textSize = 30;
	this.buttonLessVitesse.color = "white";
	this.buttonLessVitesse.collider = "static";
	this.buttonLessVitesse.layer = 100000000;

	yOffset += ySpacing;

	this.textDispersion = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	this.textDispersion.textSize = 30;
	this.textDispersion.text = "Dispersion : " + player.stats.arme.dispersion;
	this.textDispersion.collider = "static";
	this.textDispersion.textColor = "white";
	this.textDispersion.layer = 100000000;

	this.buttonMoreDispersion = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonMoreDispersion.text = "+";
	this.buttonMoreDispersion.textSize = 30;
	this.buttonMoreDispersion.color = "white";
	this.buttonMoreDispersion.collider = "static";
	this.buttonMoreDispersion.layer = 100000000;

	this.buttonLessDispersion = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonLessDispersion.text = "-";
	this.buttonLessDispersion.textSize = 30;
	this.buttonLessDispersion.color = "white";
	this.buttonLessDispersion.collider = "static";
	this.buttonLessDispersion.layer = 100000000;

	yOffset += ySpacing;

	this.textPortee = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	this.textPortee.textSize = 30;
	this.textPortee.text = "Portée : " + player.stats.arme.portee;
	this.textPortee.collider = "static";
	this.textPortee.textColor = "white";
	this.textPortee.layer = 100000000;

	this.buttonMorePortee = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonMorePortee.text = "+";
	this.buttonMorePortee.textSize = 30;
	this.buttonMorePortee.color = "white";
	this.buttonMorePortee.collider = "static";
	this.buttonMorePortee.layer = 100000000;

	this.buttonLessPortee = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonLessPortee.text = "-";
	this.buttonLessPortee.textSize = 30;
	this.buttonLessPortee.color = "white";
	this.buttonLessPortee.collider = "static";
	this.buttonLessPortee.layer = 100000000;

	yOffset += ySpacing;

	this.textProjectiles = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	this.textProjectiles.textSize = 30;
	this.textProjectiles.text = "Projectiles : " + player.stats.arme.projectiles;
	this.textProjectiles.collider = "static";
	this.textProjectiles.textColor = "white";
	this.textProjectiles.layer = 100000000;

	this.buttonMoreProjectiles = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonMoreProjectiles.text = "+";
	this.buttonMoreProjectiles.textSize = 30;
	this.buttonMoreProjectiles.color = "white";
	this.buttonMoreProjectiles.collider = "static";
	this.buttonMoreProjectiles.layer = 100000000;

	this.buttonLessProjectiles = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonLessProjectiles.text = "-";
	this.buttonLessProjectiles.textSize = 30;
	this.buttonLessProjectiles.color = "white";
	this.buttonLessProjectiles.collider = "static";
	this.buttonLessProjectiles.layer = 100000000;

	yOffset += ySpacing;

	this.textTailleArme = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	this.textTailleArme.textSize = 30;
	this.textTailleArme.text = "Taille Arme : " + player.stats.arme.taille;
	this.textTailleArme.collider = "static";
	this.textTailleArme.textColor = "white";
	this.textTailleArme.layer = 100000000;

	this.buttonMoreTailleArme = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonMoreTailleArme.text = "+";
	this.buttonMoreTailleArme.textSize = 30;
	this.buttonMoreTailleArme.color = "white";
	this.buttonMoreTailleArme.collider = "static";
	this.buttonMoreTailleArme.layer = 100000000;

	this.buttonLessTailleArme = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonLessTailleArme.text = "-";
	this.buttonLessTailleArme.textSize = 30;
	this.buttonLessTailleArme.color = "white";
	this.buttonLessTailleArme.collider = "static";
	this.buttonLessTailleArme.layer = 100000000;

	yOffset += ySpacing;

	this.textPenetration = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	this.textPenetration.textSize = 30;
	this.textPenetration.text = "Pénétration : " + player.stats.arme.penetration;
	this.textPenetration.collider = "static";
	this.textPenetration.textColor = "white";
	this.textPenetration.layer = 100000000;

	this.buttonMorePenetration = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonMorePenetration.text = "+";
	this.buttonMorePenetration.textSize = 30;
	this.buttonMorePenetration.color = "white";
	this.buttonMorePenetration.collider = "static";
	this.buttonMorePenetration.layer = 100000000;

	this.buttonLessPenetration = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonLessPenetration.text = "-";
	this.buttonLessPenetration.textSize = 30;
	this.buttonLessPenetration.color = "white";
	this.buttonLessPenetration.collider = "static";
	this.buttonLessPenetration.layer = 100000000;

	yOffset += ySpacing;

	this.textRicochets = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	this.textRicochets.textSize = 30;
	this.textRicochets.text = "Ricochets : " + player.stats.arme.ricochets;
	this.textRicochets.collider = "static";
	this.textRicochets.textColor = "white";
	this.textRicochets.layer = 100000000;

	this.buttonMoreRicochets = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonMoreRicochets.text = "+";
	this.buttonMoreRicochets.textSize = 30;
	this.buttonMoreRicochets.color = "white";
	this.buttonMoreRicochets.collider = "static";
	this.buttonMoreRicochets.layer = 100000000;

	this.buttonLessRicochets = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	this.buttonLessRicochets.text = "-";
	this.buttonLessRicochets.textSize = 30;
	this.buttonLessRicochets.color = "white";
	this.buttonLessRicochets.collider = "static";
	this.buttonLessRicochets.layer = 100000000;
    }

  }
}
 


function draw() {

	background("skyblue")
 
	if (timerseconde == 60 ) {
        timermillieseconde = 0;
        timerseconde = 0;
        timerminute++;
    } else {
        if (timermillieseconde == 60) {
            timermillieseconde = 0;
            timerseconde++;
        } else {
            timermillieseconde++;
            time.text = "Time : " + timerminute + "min " + timerseconde + "s";
			
        }
    }
	
	if (frameCount % 60 == 0 && arme.utility.recharge > 0) {
		arme.utility.recharge--;
		reload.text = "Reload : " + arme.utility.recharge;
	}
	
	time.x= player.sprite.x-(windowWidth/2)+180;
	time.y= player.sprite.y-(windowHeight/2)+50;

	reload.x = player.sprite.x - (windowWidth / 2) + 180;
	reload.y = player.sprite.y - (windowHeight / 2) + 100;
	
	player.stats.bateau.experience=player.stats.bateau.experience+1;

	niveautext.text = "Niveau : " + player.stats.bateau.niveau;
	exptext.text = "Exp : " + player.stats.bateau.experience;

	niveautext.x=player.sprite.x-(windowWidth/2)+180;
	niveautext.y=player.sprite.y-(windowHeight/2)+150;

	exptext.x=player.sprite.x-(windowWidth/2)+180;
	exptext.y=player.sprite.y-(windowHeight/2)+200;

	

		
		
		
	camera.x = player.sprite.x;
	camera.y = player.sprite.y;

	player.functions.runAll();
	viseur.functions.runAll();
	arme.functions.runAll();
	reticule.functions.runAll();
	projectile.functions.runAll();

	player.sprite.layer = 100;
	viseur.sprite.layer = 101;


	

  
  let xOffSet = player.sprite.x + (windowWidth/2) -200;

  // Update button positions

  backup.functions.textspeed.x = xOffSet;
  backup.functions.textspeed.y = player.sprite.y - (windowHeight / 2) + 80;
  
  backup.functions.textVie.x = xOffSet;
  backup.functions.textVie.y = player.sprite.y - (windowHeight / 2) + 180;
  
  backup.functions.textManiabilite.x = xOffSet;
  backup.functions.textManiabilite.y = player.sprite.y - (windowHeight / 2) + 280;
  
  backup.functions.textTaille.x = xOffSet;
  backup.functions.textTaille.y = player.sprite.y - (windowHeight / 2) + 380;
  
  backup.functions.textResistance.x = xOffSet;
  backup.functions.textResistance.y = player.sprite.y - (windowHeight / 2) + 480;
  
  backup.functions.textResistanceFeu.x = xOffSet;
  backup.functions.textResistanceFeu.y = player.sprite.y - (windowHeight / 2) + 580;
	  
  backup.functions.buttonmore.x = xOffSet + 100;
  backup.functions.buttonmore.y = player.sprite.y - (windowHeight / 2) + 130;
  
  backup.functions.buttonless.x = xOffSet + 50;
  backup.functions.buttonless.y = player.sprite.y - (windowHeight / 2) + 130;
  
  backup.functions.buttonMoreVie.x = xOffSet + 100;
  backup.functions.buttonMoreVie.y = player.sprite.y - (windowHeight / 2) + 230;
  
  backup.functions.buttonLessVie.x = xOffSet + 50;
  backup.functions.buttonLessVie.y = player.sprite.y - (windowHeight / 2) + 230;
  
  backup.functions.buttonMoreManiabilite.x = xOffSet + 100;
  backup.functions.buttonMoreManiabilite.y = player.sprite.y - (windowHeight / 2) + 330;
  
  backup.functions.buttonLessManiabilite.x = xOffSet + 50;
  backup.functions.buttonLessManiabilite.y = player.sprite.y - (windowHeight / 2) + 330;
  
  backup.functions.buttonMoreTaille.x = xOffSet + 100;
  backup.functions.buttonMoreTaille.y = player.sprite.y - (windowHeight / 2) + 430;
  
  backup.functions.buttonLessTaille.x = xOffSet + 50;
  backup.functions.buttonLessTaille.y = player.sprite.y - (windowHeight / 2) + 430;
  
  backup.functions.buttonMoreResistance.x = xOffSet + 100;
  backup.functions.buttonMoreResistance.y = player.sprite.y - (windowHeight / 2) + 530;
  
  backup.functions.buttonLessResistance.x = xOffSet + 50;
  backup.functions.buttonLessResistance.y = player.sprite.y - (windowHeight / 2) + 530;
  
  backup.functions.buttonMoreResistanceFeu.x = xOffSet + 100;
  backup.functions.buttonMoreResistanceFeu.y = player.sprite.y - (windowHeight / 2) + 630;
  
  backup.functions.buttonLessResistanceFeu.x = xOffSet + 50;
  backup.functions.buttonLessResistanceFeu.y = player.sprite.y - (windowHeight / 2) + 630;
  
  backup.functions.textDegatsBase.x = xOffSet + 50;
  backup.functions.textDegatsBase.y = player.sprite.y - (windowHeight / 2) + 700;
  
  backup.functions.buttonMoreDegatsBase.x = xOffSet + 100;
  backup.functions.buttonMoreDegatsBase.y = player.sprite.y - (windowHeight / 2) + 750;
  
  backup.functions.buttonLessDegatsBase.x = xOffSet + 50;
  backup.functions.buttonLessDegatsBase.y = player.sprite.y - (windowHeight / 2) + 750;
  
  backup.functions.textDegatsFeu.x = xOffSet + 50;
  backup.functions.textDegatsFeu.y = player.sprite.y - (windowHeight / 2) + 800;
  
  backup.functions.buttonMoreDegatsFeu.x = xOffSet + 100;
  backup.functions.buttonMoreDegatsFeu.y = player.sprite.y - (windowHeight / 2) + 850;
  
  backup.functions.buttonLessDegatsFeu.x = xOffSet + 50;
  backup.functions.buttonLessDegatsFeu.y = player.sprite.y - (windowHeight / 2) + 850;
  
  xOffSet2 = xOffSet - 300;
  yOffset2 = 80;
  
  backup.functions.textRecharge.x = xOffSet2;
  backup.functions.textRecharge.y = player.sprite.y - (windowHeight / 2) + 80;
  
  backup.functions.buttonMoreRecharge.x = xOffSet2 + 100;
  backup.functions.buttonMoreRecharge.y = player.sprite.y - (windowHeight / 2) + 130;
  
  backup.functions.buttonLessRecharge.x = xOffSet2 + 50;
  backup.functions.buttonLessRecharge.y = player.sprite.y - (windowHeight / 2) + 130;
  
  backup.functions.textVitesse.x = xOffSet2;
  backup.functions.textVitesse.y = player.sprite.y - (windowHeight / 2) + 180;
  
  backup.functions.buttonMoreVitesse.x = xOffSet2 + 100;
  backup.functions.buttonMoreVitesse.y = player.sprite.y - (windowHeight / 2) + 230;
  
  backup.functions.buttonLessVitesse.x = xOffSet2 + 50;
  backup.functions.buttonLessVitesse.y = player.sprite.y - (windowHeight / 2) + 230;
  
  backup.functions.textDispersion.x = xOffSet2;
  backup.functions.textDispersion.y = player.sprite.y - (windowHeight / 2) + 280;
  
  backup.functions.buttonMoreDispersion.x = xOffSet2 + 100;
  backup.functions.buttonMoreDispersion.y = player.sprite.y - (windowHeight / 2) + 330;
  
  backup.functions.buttonLessDispersion.x = xOffSet2 + 50;
  backup.functions.buttonLessDispersion.y = player.sprite.y - (windowHeight / 2) + 330;
  
  backup.functions.textPortee.x = xOffSet2;
  backup.functions.textPortee.y = player.sprite.y - (windowHeight / 2) + 380;
  
  backup.functions.buttonMorePortee.x = xOffSet2 + 100;
  backup.functions.buttonMorePortee.y = player.sprite.y - (windowHeight / 2) + 430;
  
  backup.functions.buttonLessPortee.x = xOffSet2 + 50;
  backup.functions.buttonLessPortee.y = player.sprite.y - (windowHeight / 2) + 430;
  
  backup.functions.textProjectiles.x = xOffSet2;
  backup.functions.textProjectiles.y = player.sprite.y - (windowHeight / 2) + 480;
  
  backup.functions.buttonMoreProjectiles.x = xOffSet2 + 100;
  backup.functions.buttonMoreProjectiles.y = player.sprite.y - (windowHeight / 2) + 530;
  
  backup.functions.buttonLessProjectiles.x = xOffSet2 + 50;
  backup.functions.buttonLessProjectiles.y = player.sprite.y - (windowHeight / 2) + 530;
  
  backup.functions.textTailleArme.x = xOffSet2;
  backup.functions.textTailleArme.y = player.sprite.y - (windowHeight / 2) + 580;
  
  backup.functions.buttonMoreTailleArme.x = xOffSet2 + 100;
  backup.functions.buttonMoreTailleArme.y = player.sprite.y - (windowHeight / 2) + 630;
  
  backup.functions.buttonLessTailleArme.x = xOffSet2 + 50;
  backup.functions.buttonLessTailleArme.y = player.sprite.y - (windowHeight / 2) + 630;
  
  backup.functions.textPenetration.x = xOffSet2;
  backup.functions.textPenetration.y = player.sprite.y - (windowHeight / 2) + 680;
  
  backup.functions.buttonMorePenetration.x = xOffSet2 + 100;
  backup.functions.buttonMorePenetration.y = player.sprite.y - (windowHeight / 2) + 730;
  
  backup.functions.buttonLessPenetration.x = xOffSet2 + 50;
  backup.functions.buttonLessPenetration.y = player.sprite.y - (windowHeight / 2) + 730;
  
  backup.functions.textRicochets.x = xOffSet2;
  backup.functions.textRicochets.y = player.sprite.y - (windowHeight / 2) + 780;
  
  backup.functions.buttonMoreRicochets.x = xOffSet2 + 100;
  backup.functions.buttonMoreRicochets.y = player.sprite.y - (windowHeight / 2) + 830;
  
  backup.functions.buttonLessRicochets.x = xOffSet2 + 50;
  backup.functions.buttonLessRicochets.y = player.sprite.y - (windowHeight / 2) + 830;
  
  
	
	  if (backup.functions.buttonmore.mouse.pressed()) {
		  console.log("buttonmore pressed");
		  player.stats.bateau.vitesse += 0.1;
		  player.stats.bateau.vitesse = parseFloat(player.stats.bateau.vitesse.toFixed(2));
		  backup.functions.textspeed.text = "Speed : " + player.stats.bateau.vitesse;
	  } else if (backup.functions.buttonless.mouse.pressed()) {
		  player.stats.bateau.vitesse -= 0.1;
		  player.stats.bateau.vitesse = parseFloat(player.stats.bateau.vitesse.toFixed(2));
		  backup.functions.textspeed.text = "Speed : " + player.stats.bateau.vitesse;
	  }
	  
	  if (backup.functions.buttonMoreVie.mouse.pressed()) {
		  player.stats.bateau.vie += 10;
		  backup.functions.textVie.text = "Vie : " + player.stats.bateau.vie;
	  } else if (backup.functions.buttonLessVie.mouse.pressed()) {
		  player.stats.bateau.vie -= 10;
		  backup.functions.textVie.text = "Vie : " + player.stats.bateau.vie;
	  }
	  
	  if (backup.functions.buttonMoreManiabilite.mouse.pressed()) {
		  player.stats.bateau.maniabilite += 0.1;
		  player.stats.bateau.maniabilite = parseFloat(player.stats.bateau.maniabilite.toFixed(2));
		  backup.functions.textManiabilite.text = "Maniabilité : " + player.stats.bateau.maniabilite;
	  } else if (backup.functions.buttonLessManiabilite.mouse.pressed()) {
		  player.stats.bateau.maniabilite -= 0.1;
		  player.stats.bateau.maniabilite = parseFloat(player.stats.bateau.maniabilite.toFixed(2));
		  backup.functions.textManiabilite.text = "Maniabilité : " + player.stats.bateau.maniabilite;
	  }
	  
	  if (backup.functions.buttonMoreTaille.mouse.pressed()) {
		  player.stats.bateau.taille += 0.1;
		  player.stats.bateau.taille = parseFloat(player.stats.bateau.taille.toFixed(2));
		  backup.functions.textTaille.text = "Taille : " + player.stats.bateau.taille;
	  } else if (backup.functions.buttonLessTaille.mouse.pressed()) {
		  player.stats.bateau.taille -= 0.1;
		  player.stats.bateau.taille = parseFloat(player.stats.bateau.taille.toFixed(2));
		  backup.functions.textTaille.text = "Taille : " + player.stats.bateau.taille;
	  }
	  
	  if (backup.functions.buttonMoreResistance.mouse.pressed()) {
		  player.stats.bateau.resistance.degats += 0.1;
		  player.stats.bateau.resistance.degats = parseFloat(player.stats.bateau.resistance.degats.toFixed(2));
		  backup.functions.textResistance.text = "Résistance : " + player.stats.bateau.resistance.degats;
	  } else if (backup.functions.buttonLessResistance.mouse.pressed()) {
		  player.stats.bateau.resistance.degats -= 0.1;
		  player.stats.bateau.resistance.degats = parseFloat(player.stats.bateau.resistance.degats.toFixed(2));
		  backup.functions.textResistance.text = "Résistance : " + player.stats.bateau.resistance.degats;
	  }
	  
	  if (backup.functions.buttonMoreResistanceFeu.mouse.pressed()) {
		  player.stats.bateau.resistance.feu += 0.1;
		  player.stats.bateau.resistance.feu = parseFloat(player.stats.bateau.resistance.feu.toFixed(2));
		  backup.functions.textResistanceFeu.text = "Résistance Feu : " + player.stats.bateau.resistance.feu;
	  } else if (backup.functions.buttonLessResistanceFeu.mouse.pressed()) {
		  player.stats.bateau.resistance.feu -= 0.1;
		  player.stats.bateau.resistance.feu = parseFloat(player.stats.bateau.resistance.feu.toFixed(2));
		  backup.functions.textResistanceFeu.text = "Résistance Feu : " + player.stats.bateau.resistance.feu;
	  }
  
	  if (backup.functions.buttonMoreDegatsBase.mouse.pressed()) {
		  player.stats.arme.degats.base += 1;
		  backup.functions.textDegatsBase.text = "Dégâts Base : " + player.stats.arme.degats.base;
	  } else if (backup.functions.buttonLessDegatsBase.mouse.pressed()) {
		  player.stats.arme.degats.base -= 1;
		  backup.functions.textDegatsBase.text = "Dégâts Base : " + player.stats.arme.degats.base;
	  }
  
	  if (backup.functions.buttonMoreDegatsFeu.mouse.pressed()) {
		  player.stats.arme.degats.feu += 1;
		  backup.functions.textDegatsFeu.text = "Dégâts Feu : " + player.stats.arme.degats.feu;
	  } else if (backup.functions.buttonLessDegatsFeu.mouse.pressed()) {
		  player.stats.arme.degats.feu -= 1;
		  backup.functions.textDegatsFeu.text = "Dégâts Feu : " + player.stats.arme.degats.feu;
	  }
  
	  if (backup.functions.buttonMoreRecharge.mouse.pressed()) {
		  player.stats.arme.recharge += 1;
		  backup.functions.textRecharge.text = "Recharge : " + player.stats.arme.recharge;
	  } else if (backup.functions.buttonLessRecharge.mouse.pressed()) {
		  player.stats.arme.recharge -= 1;
		  backup.functions.textRecharge.text = "Recharge : " + player.stats.arme.recharge;
	  }
  
	  if (backup.functions.buttonMoreVitesse.mouse.pressed()) {
		  player.stats.arme.vitesse += 1;
		  backup.functions.textVitesse.text = "Vitesse : " + player.stats.arme.vitesse;
	  } else if (backup.functions.buttonLessVitesse.mouse.pressed()) {
		  player.stats.arme.vitesse -= 1;
		  backup.functions.textVitesse.text = "Vitesse : " + player.stats.arme.vitesse;
	  }
  
	  if (backup.functions.buttonMoreDispersion.mouse.pressed()) {
		  player.stats.arme.dispersion += 1;
		  backup.functions.textDispersion.text = "Dispersion : " + player.stats.arme.dispersion;
	  } else if (backup.functions.buttonLessDispersion.mouse.pressed()) {
		  player.stats.arme.dispersion -= 1;
		  backup.functions.textDispersion.text = "Dispersion : " + player.stats.arme.dispersion;
	  }
  
	  if (backup.functions.buttonMorePortee.mouse.pressed()) {
		  player.stats.arme.portee += 10;
		  backup.functions.textPortee.text = "Portée : " + player.stats.arme.portee;
	  } else if (backup.functions.buttonLessPortee.mouse.pressed()) {
		  player.stats.arme.portee -= 10;
		  backup.functions.textPortee.text = "Portée : " + player.stats.arme.portee;
	  }
  
	  if (backup.functions.buttonMoreProjectiles.mouse.pressed()) {
		  player.stats.arme.projectiles += 1;
		  backup.functions.textProjectiles.text = "Projectiles : " + player.stats.arme.projectiles;
	  } else if (backup.functions.buttonLessProjectiles.mouse.pressed()) {
		  player.stats.arme.projectiles -= 1;
		  backup.functions.textProjectiles.text = "Projectiles : " + player.stats.arme.projectiles;
	  }
  
	  if (backup.functions.buttonMoreTailleArme.mouse.pressed()) {
		  player.stats.arme.taille += 0.1;
		  player.stats.arme.taille = parseFloat(player.stats.arme.taille.toFixed(2));
		  backup.functions.textTailleArme.text = "Taille Arme : " + player.stats.arme.taille;
	  } else if (backup.functions.buttonLessTailleArme.mouse.pressed()) {
		  player.stats.arme.taille -= 0.1;
		  player.stats.arme.taille = parseFloat(player.stats.arme.taille.toFixed(2));
		  backup.functions.textTailleArme.text = "Taille Arme : " + player.stats.arme.taille;
	  }
  
	  if (backup.functions.buttonMorePenetration.mouse.pressed()) {
		  player.stats.arme.penetration += 1;
		  backup.functions.textPenetration.text = "Pénétration : " + player.stats.arme.penetration;
	  } else if (backup.functions.buttonLessPenetration.mouse.pressed()) {
		  player.stats.arme.penetration -= 1;
		  backup.functions.textPenetration.text = "Pénétration : " + player.stats.arme.penetration;
	  }
  
	  if (backup.functions.buttonMoreRicochets.mouse.pressed()) {
		  player.stats.arme.ricochets += 1;
		  backup.functions.textRicochets.text = "Ricochets : " + player.stats.arme.ricochets;
	  } else if (backup.functions.buttonLessRicochets.mouse.pressed()) {
		  player.stats.arme.ricochets -= 1;
		  backup.functions.textRicochets.text = "Ricochets : " + player.stats.arme.ricochets;
	  }
  
}

