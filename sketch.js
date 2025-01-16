// This project uses P5Play.
let buttonmore;
let buttonless;
let textspeed;
let textVie;
let buttonMoreVie;
let buttonLessVie;
let textManiabilite;
let buttonMoreManiabilite;
let buttonLessManiabilite;
let textPuissance;
let buttonMorePuissance;
let buttonLessPuissance;
let textTaille;
let buttonMoreTaille;
let buttonLessTaille;
let textResistance;
let buttonMoreResistance;
let buttonLessResistance;
let textResistanceFeu;
let buttonMoreResistanceFeu;
let buttonLessResistanceFeu;


let player = {

	stats : {
		bateau: {
			vie: 100,
			vitesse: 2.5,
			maniabilite: 1.5,
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
		vagues: [],
		functions: {
			createVague: function(){
				let vague = new Sprite(player.sprite.x, player.sprite.y);
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
				player.utility.functions.createVague();
			}
		},

		fixRotation: function(){
			if (player.utility.direction > 360){
				player.utility.direction = 0;
			}
			else if (player.utility.direction < 0){
				player.utility.direction = 360;
			}
		}
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
		visee: "left" // left ou right
	},

	functions: {
		runAll : function(){
			arme.functions.rotation();
			arme.functions.mouvement();
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

function setup() {
	frameRate(60);

	new Canvas(windowWidth, windowHeight);
	displayMode('centered', 'pixelated', 8);

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

	reticule.sprite = new Sprite(mouseX, mouseY);
	reticule.sprite.collider = 'none';
	reticule.sprite.image = loadImage('assets/crosshair.png');

	backup();
}



function backup() {

	let yOffset = 80;
	let ySpacing = 100;
	let xOffSet = windowWidth - 250;
	
	textspeed = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	textspeed.textSize = 30;
	textspeed.text = "Speed : " + player.stats.bateau.vitesse;
	textspeed.collider = "none";
	textspeed.textColor = "white";
	textspeed.layer = 100000000;
	
	buttonmore = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	buttonmore.text = "+";
	buttonmore.textSize = 30;
	buttonmore.color = "white";
	buttonmore.collider = "noned";
	buttonmore.layer = 100000000;
	
	buttonmore.onMousePressed = function() {
	  player.stats.bateau.vitesse += 0.5;
	  textspeed.text = "Speed : " + player.stats.bateau.vitesse;
	}
	
	buttonless = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	buttonless.text = "-";
	buttonless.textSize = 30;
	buttonless.color = "white";
	buttonless.collider = "noned";
	buttonless.layer = 100000000;
	
	buttonless.onMousePressed = function() {
	  player.stats.bateau.vitesse -= 0.5;
	  textspeed.text = "Speed : " + player.stats.bateau.vitesse;
	}
	
	yOffset += ySpacing;
	
	textVie = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	textVie.textSize = 30;
	textVie.text = "Vie : " + player.stats.bateau.vie;
	textVie.collider = "none";
	textVie.textColor = "white";
	textVie.layer = 100000000;
	
	buttonMoreVie = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	buttonMoreVie.text = "+";
	buttonMoreVie.textSize = 30;
	buttonMoreVie.color = "white";
	buttonMoreVie.collider = "noned";
	buttonMoreVie.layer = 100000000;
	
	buttonMoreVie.onMousePressed = function() {
	  player.stats.bateau.vie += 10;
	  textVie.text = "Vie : " + player.stats.bateau.vie;
	}
	
	buttonLessVie = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	buttonLessVie.text = "-";
	buttonLessVie.textSize = 30;
	buttonLessVie.color = "white";
	buttonLessVie.collider = "noned";
	buttonLessVie.layer = 100000000;
	
	buttonLessVie.onMousePressed = function() {
	  player.stats.bateau.vie -= 10;
	  textVie.text = "Vie : " + player.stats.bateau.vie;
	}
	
	yOffset += ySpacing;
	
	textManiabilite = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	textManiabilite.textSize = 30;
	textManiabilite.text = "Maniabilité : " + player.stats.bateau.maniabilite;
	textManiabilite.collider = "none";
	textManiabilite.textColor = "white";
	textManiabilite.layer = 100000000;
	
	buttonMoreManiabilite = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	buttonMoreManiabilite.text = "+";
	buttonMoreManiabilite.textSize = 30;
	buttonMoreManiabilite.color = "white";
	buttonMoreManiabilite.collider = "noned";
	buttonMoreManiabilite.layer = 100000000;
	
	buttonMoreManiabilite.onMousePressed = function() {
	  player.stats.bateau.maniabilite += 0.1;
	  textManiabilite.text = "Maniabilité : " + player.stats.bateau.maniabilite;
	}
	
	buttonLessManiabilite = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	buttonLessManiabilite.text = "-";
	buttonLessManiabilite.textSize = 30;
	buttonLessManiabilite.color = "white";
	buttonLessManiabilite.collider = "noned";
	buttonLessManiabilite.layer = 100000000;
	
	buttonLessManiabilite.onMousePressed = function() {
	  player.stats.bateau.maniabilite -= 0.1;
	  textManiabilite.text = "Maniabilité : " + player.stats.bateau.maniabilite;
	}
	
	yOffset += ySpacing;
	
	textTaille = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	textTaille.textSize = 30;
	textTaille.text = "Taille : " + player.stats.bateau.taille;
	textTaille.collider = "none";
	textTaille.textColor = "white";
	textTaille.layer = 100000000;
	
	buttonMoreTaille = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	buttonMoreTaille.text = "+";
	buttonMoreTaille.textSize = 30;
	buttonMoreTaille.color = "white";
	buttonMoreTaille.collider = "noned";
	buttonMoreTaille.layer = 100000000;
	
	buttonMoreTaille.onMousePressed = function() {
	  player.stats.bateau.taille += 0.1;
	  textTaille.text = "Taille : " + player.stats.bateau.taille;
	}
	
	buttonLessTaille = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	buttonLessTaille.text = "-";
	buttonLessTaille.textSize = 30;
	buttonLessTaille.color = "white";
	buttonLessTaille.collider = "noned";
	buttonLessTaille.layer = 100000000;
	
	buttonLessTaille.onMousePressed = function() {
	  player.stats.bateau.taille -= 0.1;
	  textTaille.text = "Taille : " + player.stats.bateau.taille;
	}
	
	yOffset += ySpacing;
	
	textResistance = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	textResistance.textSize = 30;
	textResistance.text = "Résistance : " + player.stats.bateau.resistance.degats;
	textResistance.collider = "none";
	textResistance.textColor = "white";
	textResistance.layer = 100000000;
	
	buttonMoreResistance = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	buttonMoreResistance.text = "+";
	buttonMoreResistance.textSize = 30;
	buttonMoreResistance.color = "white";
	buttonMoreResistance.collider = "noned";
	buttonMoreResistance.layer = 100000000;
	
	buttonMoreResistance.onMousePressed = function() {
	  player.stats.bateau.resistance.degats += 0.1;
	  textResistance.text = "Résistance : " + player.stats.bateau.resistance.degats;
	}
	
	buttonLessResistance = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	buttonLessResistance.text = "-";
	buttonLessResistance.textSize = 30;
	buttonLessResistance.color = "white";
	buttonLessResistance.collider = "noned";
	buttonLessResistance.layer = 100000000;
	
	buttonLessResistance.onMousePressed = function() {
	  player.stats.bateau.resistance.degats -= 0.1;
	  textResistance.text = "Résistance : " + player.stats.bateau.resistance.degats;
	}
	
	yOffset += ySpacing;
	
	textResistanceFeu = new Sprite(xOffSet, player.sprite.y - (windowHeight / 2) + yOffset, 0, 0);
	textResistanceFeu.textSize = 30;
	textResistanceFeu.text = "Résistance Feu : " + player.stats.bateau.resistance.feu;
	textResistanceFeu.collider = "none";
	textResistanceFeu.textColor = "white";
	textResistanceFeu.layer = 100000000;
	
	buttonMoreResistanceFeu = new Sprite(xOffSet + 50, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	buttonMoreResistanceFeu.text = "+";
	buttonMoreResistanceFeu.textSize = 30;
	buttonMoreResistanceFeu.color = "white";
	buttonMoreResistanceFeu.collider = "noned";
	buttonMoreResistanceFeu.layer = 100000000;
	
	buttonMoreResistanceFeu.onMousePressed = function() {
	  player.stats.bateau.resistance.feu += 0.1;
	  textResistanceFeu.text = "Résistance Feu : " + player.stats.bateau.resistance.feu;
	}
	
	buttonLessResistanceFeu = new Sprite(xOffSet + 100, player.sprite.y - (windowHeight / 2) + yOffset + 50, 50, 50);
	buttonLessResistanceFeu.text = "-";
	buttonLessResistanceFeu.textSize = 30;
	buttonLessResistanceFeu.color = "white";
	buttonLessResistanceFeu.collider = "noned";
	buttonLessResistanceFeu.layer = 100000000;
	
	buttonLessResistanceFeu.onMousePressed = function() {
	  player.stats.bateau.resistance.feu -= 0.1;
	  textResistanceFeu.text = "Résistance Feu : " + player.stats.bateau.resistance.feu;
	}
}




function draw() {
	background('skyblue');

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
			time.x= player.sprite.x-(windowWidth/2)+180;
			time.y= player.sprite.y-(windowHeight/2)+50;
        }
    }

	camera.x = player.sprite.x;
	camera.y = player.sprite.y;

	player.functions.runAll();
	viseur.functions.runAll();
	arme.functions.runAll();
	reticule.functions.runAll();

	player.sprite.layer = 100;
	viseur.sprite.layer = 101;


	
    if (buttonmore.mouse.pressed()) {
		player.stats.bateau.vitesse += 0.5;
		textspeed.text = "Speed : " + player.stats.bateau.vitesse;
	  } else if (buttonless.mouse.pressed()) {
		player.stats.bateau.vitesse -= 0.5;
		textspeed.text = "Speed : " + player.stats.bateau.vitesse;
	  }
  
	  if (buttonMoreVie.mouse.pressed()) {
		player.stats.bateau.vie += 10;
		textVie.text = "Vie : " + player.stats.bateau.vie;
	  } else if (buttonLessVie.mouse.pressed()) {
		player.stats.bateau.vie -= 10;
		textVie.text = "Vie : " + player.stats.bateau.vie;
	  }
  
	  if (buttonMoreManiabilite.mouse.pressed()) {
		player.stats.bateau.maniabilite += 0.1;
		textManiabilite.text = "Maniabilité : " + player.stats.bateau.maniabilite;
	  } else if (buttonLessManiabilite.mouse.pressed()) {
		player.stats.bateau.maniabilite -= 0.1;
		textManiabilite.text = "Maniabilité : " + player.stats.bateau.maniabilite;
	  }
  
	  if (buttonMoreTaille.mouse.pressed()) {
		player.stats.bateau.taille += 0.1;
		textTaille.text = "Taille : " + player.stats.bateau.taille;
	  } else if (buttonLessTaille.mouse.pressed()) {
		player.stats.bateau.taille -= 0.1;
		textTaille.text = "Taille : " + player.stats.bateau.taille;
	  }
  
	  if (buttonMoreResistance.mouse.pressed()) {
		player.stats.bateau.resistance.degats += 0.1;
		textResistance.text = "Résistance : " + player.stats.bateau.resistance.degats;
	  } else if (buttonLessResistance.mouse.pressed()) {
		player.stats.bateau.resistance.degats -= 0.1;
		textResistance.text = "Résistance : " + player.stats.bateau.resistance.degats;
	  }
  
	  if (buttonMoreResistanceFeu.mouse.pressed()) {
		player.stats.bateau.resistance.feu += 0.1;
		textResistanceFeu.text = "Résistance Feu : " + player.stats.bateau.resistance.feu;
	  } else if (buttonLessResistanceFeu.mouse.pressed()) {
		player.stats.bateau.resistance.feu -= 0.1;
		textResistanceFeu.text = "Résistance Feu : " + player.stats.bateau.resistance.feu;
	  }
  
	  // Update button positions
	 /* buttonmore.x = xOffSet + 50;
	  buttonmore.y = player.sprite.y - (windowHeight / 2) + 130;
  
	  buttonless.x = xOffSet + 100;
	  buttonless.y = player.sprite.y - (windowHeight / 2) + 130;
  
	  buttonMoreVie.x = xOffSet + 50;
	  buttonMoreVie.y = player.sprite.y - (windowHeight / 2) + 230;
  
	  buttonLessVie.x = xOffSet + 100;
	  buttonLessVie.y = player.sprite.y - (windowHeight / 2) + 230;
  
	  buttonMoreManiabilite.x = xOffSet + 50;
	  buttonMoreManiabilite.y = player.sprite.y - (windowHeight / 2) + 330;
  
	  buttonLessManiabilite.x = xOffSet + 100;
	  buttonLessManiabilite.y = player.sprite.y - (windowHeight / 2) + 330;
  
	  buttonMoreTaille.x = xOffSet + 50;
	  buttonMoreTaille.y = player.sprite.y - (windowHeight / 2) + 430;
  
	  buttonLessTaille.x = xOffSet + 100;
	  buttonLessTaille.y = player.sprite.y - (windowHeight / 2) + 430;
  
	  buttonMoreResistance.x = xOffSet + 50;
	  buttonMoreResistance.y = player.sprite.y - (windowHeight / 2) + 530;
  
	  buttonLessResistance.x = xOffSet + 100;
	  buttonLessResistance.y = player.sprite.y - (windowHeight / 2) + 530;
  
	  buttonMoreResistanceFeu.x = xOffSet + 50;
	  buttonMoreResistanceFeu.y = player.sprite.y - (windowHeight / 2) + 630;
  
	  buttonLessResistanceFeu.x = xOffSet + 100;
	  buttonLessResistanceFeu.y = player.sprite.y - (windowHeight / 2) + 630;
  
  */
}
