let player = {
    stats: {
        bateau: {
            vie: 100,
            vitesse: 2.5,
            maniabilite: 1.5,
            collision: 1.0,
            taille: 1.0, // Taille doit être la valeur qu'on donnera à scale
            resistance_feu: 1.0,
            resistance_degats: 1.0,
        },
        arme: {
            degats_base: 10.0,
            degats_feu: 0.0, // La quantité de dégâts qu'inflige le feu chaque seconde
            dureeFeu: 5, // En secondes
            recharge: 2, // En secondes
            vitesse: 5,
            dispersion: 10, // En degrés
            portee: 500, // En pixels
            projectiles: 1,
            taille: 1, // Taille doit être la valeur qu'on donnera à scale
            penetration: 0, // Nombre de cibles que peut traverser un projectile
            ricochets: 0, // Nombre de fois qu'un projectile peut rebondir
        },
    },

    xp: {        
        niveau: 1,
        experience: 0,
        expMax: 100,
        expMult: 1,
    },

    // "Quelle différence avec stats ?"
    // baseStats est modifié par l'équipement.
    // stats est modifié par les améliorations.
    // on part donc des stats de base pour calculer les stats finales.
    baseStats: {
        bateau: {
            vie: 100,
            vitesse: 2.5,
            maniabilite: 1.5,
            collision: 1.0,
            taille: 1.0, // Taille doit être la valeur qu'on donnera à scale
            resistance_feu: 1.0,
            resistance_degats: 1.0,
            niveau: 1,
        },
        arme: {
            degats_base: 10.0,
            degats_feu: 0.0, // La quantité de dégâts qu'inflige le feu chaque seconde
            recharge: 2, // En secondes
            vitesse: 5,
            dispersion: 10, // En degrés
            portee: 500, // En pixels
            projectiles: 1,
            taille: 1, // Taille doit être la valeur qu'on donnera à scale
            penetration: 0, // Nombre de cibles que peut traverser un projectile
            ricochets: 0, // Nombre de fois qu'un projectile peut rebondir
        },
    },

    utility: {
        sensMouvement: 1, // 0 = recule, 1 = arrêté, 2 = avance
        boutonMouvement: false,
        direction: 0, // En degrés
        vagues: [],
        interniveaucheck: false,
        functions: {
            createVague: function (X, Y) {
                let vague = new Sprite(X, Y);
                vague.width = 64;
                vague.height = 64;
                vague.image = loadImage("assets/ripple.png");
                vague.collider = "none";
                vague.layer = -1;
                vague.opacity = 1;
                player.utility.vagues.push(vague);
            },
        },
        degats_subits: 0,
    },

    functions: {
        runAll: function () {
            player.functions.inputs();
            player.functions.mouvement();
            player.functions.rotation();
            player.functions.vagues();
            player.functions.fixRotation();
            player.functions.checkStats();
            player.functions.expstat();
            player.functions.checktouch();
            player.functions.checkAmeliorations();
        },

        inputs: function () {
            if (kb.pressing("w") && player.utility.boutonMouvement == false) {
                player.utility.boutonMouvement = true;
                if (player.utility.sensMouvement < 2) {
                    player.utility.sensMouvement += 1;
                }
            } else if (
                kb.pressing("s") &&
                player.utility.boutonMouvement == false
            ) {
                player.utility.boutonMouvement = true;
                if (player.utility.sensMouvement > 0) {
                    player.utility.sensMouvement -= 1;
                }
            } else if (!kb.pressing("w") && !kb.pressing("s")) {
                player.utility.boutonMouvement = false;
            }
        },

        mouvement: function () {
            if (player.utility.sensMouvement == 1) {
                player.sprite.speed = 0;
            } else {
                if (player.utility.sensMouvement == 0) {
                    player.sprite.speed = player.stats.bateau.vitesse / 2;
                } else {
                    player.sprite.speed = player.stats.bateau.vitesse;
                }
            }
        },

        rotation: function () {
            if (kb.pressing("a")) {
                if (player.utility.sensMouvement == 1) {
                    player.utility.direction -=
                        player.stats.bateau.maniabilite * 0.5;
                } else {
                    player.utility.direction -= player.stats.bateau.maniabilite;
                }
            } else if (kb.pressing("d")) {
                if (player.utility.sensMouvement == 1) {
                    player.utility.direction +=
                        player.stats.bateau.maniabilite * 0.5;
                } else {
                    player.utility.direction += player.stats.bateau.maniabilite;
                }
            }
            if (player.utility.sensMouvement == 0) {
                player.sprite.direction =
                    (player.utility.direction + 180) % 360;
                player.sprite.rotation = player.utility.direction;
            } else {
                player.sprite.direction = player.utility.direction;
                player.sprite.rotation = player.utility.direction;
            }
        },

        vagues: function () {
            for (let i = 0; i < player.utility.vagues.length; i++) {
                let vague = player.utility.vagues[i];
                vague.opacity -= 0.02;
                vague.scale += 0.02;
                if (vague.opacity <= 0) {
                    player.utility.vagues.splice(i, 1);
                    vague.remove();
                }
            }
            if (frameCount % 10 == 0 && player.sprite.speed > 0) {
                player.utility.functions.createVague(
                    player.sprite.x,
                    player.sprite.y
                );
            }
        },

        fixRotation: function () {
            if (player.utility.direction > 360) {
                player.utility.direction = 0;
            } else if (player.utility.direction < 0) {
                player.utility.direction = 360;
            }
        },

        checkStats: function () {
            player.sprite.scale = player.stats.bateau.taille;
        },

        expstat: function () {
            if (player.xp.experience >= player.xp.expMax) {
                player.xp.experience = 0;
                player.xp.niveau += 1;
                player.xp.expMax = player.xp.expMax + 50;
                interniveaucheck = true;
                interniveau.initialize();
            }
        },

        checktouch: function () {
            for (let boulet of projectile.utility.projectiles.filter(
                (b) => b.tireur == "ennemi"
            )) {
                if (player.sprite.overlaps(boulet)) {
                    if (player.stats.bateau.vie >= boulet.vie) {
                        player.utility.degats_subits += boulet.vie * player.stats.bateau.resistance_degats;
                        boulet.vie = 0;
                    } else {
                        let vieavant = player.stats.bateau.vie;
                        player.utility.degats_subits += boulet.vie * player.stats.bateau.resistance_degats;
                        boulet.vie -= vieavant;
                    }
                    if (boulet.vie <= 0) {
                        projectile.functions.createExplosion(
                            boulet.x,
                            boulet.y
                        );
                        boulet.remove();
                        projectile.utility.projectiles.splice(
                            projectile.utility.projectiles.indexOf(boulet),
                            1
                        );
                    }
                }
            }
        },

        checkAmeliorations: function () {
            let ameliorationsMult = [];
            let ameliorationsFixe = JSON.parse(
                JSON.stringify(player.baseStats)
            );

            // Initialiser les valeurs fixes à 0
            for (let type in ameliorationsFixe) {
                for (let stat in ameliorationsFixe[type]) {
                    ameliorationsFixe[type][stat] = 0;
                }
            }

            for (let id of ameliorations.equipees) {
                let amelioration = ameliorations.functions.getAmelioration(id);
                // on ne vérifie que les améliorations
                if (amelioration.type == "amelioration") {
                    for (let effet of amelioration.effets) {
                        if (effet.operation == "fixe") {
                            ameliorationsFixe[effet.type][effet.stat] +=
                                effet.valeur;
                        } else if (effet.operation == "mult") {
                            ameliorationsMult.push(effet);
                        }
                    }
                }
            }

            if (ameliorationsMult.length > 0) {
                // juste pour avoir la structure
                let multipliers = JSON.parse(JSON.stringify(player.baseStats));
                // on passe tout à 1. en fait chaque stat va avoir son multiplicateur
                for (let type in multipliers) {
                    for (let stat in multipliers[type]) {
                        multipliers[type][stat] = 1;
                    }
                }
                for (let effet of ameliorationsMult) {
                    multipliers[effet.type][effet.stat] *= effet.valeur;
                }

                for (let type in multipliers) {
                    for (let stat in multipliers[type]) {
                        player.stats[type][stat] =
                            player.baseStats[type][stat] +
                            ameliorationsFixe[type][stat];
                        if (multipliers[type][stat] > 1) {
                            player.stats[type][stat] *= multipliers[type][stat];
                        }
                    }
                }
            } else {
                for (let type in ameliorationsFixe) {
                    for (let stat in ameliorationsFixe[type]) {
                        player.stats[type][stat] =
                            player.baseStats[type][stat] +
                            ameliorationsFixe[type][stat];
                    }
                }
            }

            // on applique les dégâts subits par le joueur
            // (sinon on se resoigne instantanément)
            player.stats.bateau.vie -= player.utility.degats_subits;
        },

        initialize: function () {
            player.sprite = new Sprite(windowWidth / 2, windowHeight / 2);
            player.sprite.width = 64;
            player.sprite.height = 32;
            player.sprite.scale = 1.2;
            player.sprite.collider = "dynamic";
            player.sprite.image = loadImage("assets/player.png");
            player.sprite.image.direction = 90;
            player.sprite.mass = 10;
            player.sprite.layer = 5;
        },
    },
};

let viseur = {
    utility: {
        direction: 0,
    },

    functions: {
        runAll: function () {
            viseur.functions.rotation();
            viseur.functions.fixRotation();
            viseur.functions.mouvement();
            viseur.functions.checkAngle();
        },

        fixRotation: function () {
            if (viseur.utility.direction > 360) {
                viseur.utility.direction = 0;
            } else if (viseur.utility.direction < 0) {
                viseur.utility.direction = 360;
            }
        },

        rotation: function () {
            viseur.sprite.rotateTowards(mouse, 1, 0);
            viseur.utility.direction = floor(
                ((viseur.sprite.rotation % 360) + 360) % 360
            );
        },

        mouvement: function () {
            viseur.sprite.x = player.sprite.x;
            viseur.sprite.y = player.sprite.y;
        },

        checkAngle: function () {
            // Calculate relative angle between player and viseur
            let relativeAngle =
                (viseur.utility.direction - player.utility.direction + 360) %
                360;

            // Determine if viseur is in the "left" or "right" zone of player
            if (relativeAngle >= 180 && relativeAngle <= 360) {
                arme.utility.visee = "left"; // Left zone
            } else {
                arme.utility.visee = "right"; // Right zone
            }
        },

        initialize: function () {
            viseur.sprite = new Sprite(player.sprite.x, player.sprite.y);
            viseur.sprite.width = 64;
            viseur.sprite.height = 8;
            viseur.sprite.offset.x = 32;
            viseur.sprite.collider = "none";
            viseur.sprite.opacity = 0;
        },
    },
};

let arme = {
    utility: {
        visee: "left", // left ou right
        recharge: 0,
        functions: {
            createProjectile: function () {
                let boulet = new Sprite(player.sprite.x, player.sprite.y);

                boulet.source = "player";
                boulet.origine = {
                    x: player.sprite.x,
                    y: player.sprite.y,
                };
                boulet.vie = player.stats.arme.degats_base;
                boulet.ennemisPerces = 0;
                boulet.rebonds = 0;
                boulet.porteeMax = player.stats.arme.portee + random(-10, 10);
                boulet.layer = 0;
                boulet.tireur = "player";
                boulet.diameter = 10;
                boulet.collider = "none";
                boulet.color = "black";
                boulet.image = loadImage("assets/boulet.png");
                boulet.image.scale = player.stats.arme.taille / 5;
                boulet.scale = player.stats.arme.taille;
                if (arme.utility.visee == "left") {
                    boulet.direction = player.utility.direction - 90;
                    boulet.direction += random(
                        -player.stats.arme.dispersion / 2,
                        player.stats.arme.dispersion / 2
                    );
                } else {
                    boulet.direction = player.utility.direction + 90;
                    boulet.direction += random(
                        -player.stats.arme.dispersion / 2,
                        player.stats.arme.dispersion / 2
                    );
                }

                if (player.stats.arme.projectiles > 1) {
                    boulet.speed = player.stats.arme.vitesse + random(-1, 1);
                } else {
                    boulet.speed = player.stats.arme.vitesse;
                }

                projectile.utility.projectiles.push(boulet);
            },
        },
    },

    functions: {
        runAll: function () {
            arme.functions.rotation();
            arme.functions.mouvement();
            arme.functions.tir();
        },

        rotation: function () {
            if (arme.utility.visee == "left") {
                arme.sprite.rotation = player.utility.direction - 90;
            } else {
                arme.sprite.rotation = player.utility.direction + 90;
            }
        },

        mouvement: function () {
            arme.sprite.x = player.sprite.x;
            arme.sprite.y = player.sprite.y;
        },

        tir: function () {
            if (mouse.pressed()) {
                if (arme.utility.recharge == 0) {
                    arme.utility.recharge = player.stats.arme.recharge;
                    for (let i = 0; i < player.stats.arme.projectiles; i++) {
                        arme.utility.functions.createProjectile();
                    }
                }
            }
        },

        initialize: function () {
            arme.sprite = new Sprite(player.sprite.x, player.sprite.y);
            arme.sprite.width = 32;
            arme.sprite.height = 8;
            arme.sprite.offset.x = 16;
            arme.sprite.collider = "none";
        },
    },
};

let projectile = {
    utility: {
        projectiles: [],
        explosions: [],
    },

    functions: {
        runAll: function () {
            projectile.functions.update();
        },

        explosion: function () {
            for (
                let i = projectile.utility.explosions.length - 1;
                i >= 0;
                i--
            ) {
                let explosion = projectile.utility.explosions[i];
                explosion.opacity -= 0.02;
                explosion.scale += 0.02;
                if (explosion.opacity <= 0) {
                    projectile.utility.explosions.splice(i, 1);
                    explosion.remove();
                }
            }
        },

        createExplosion: function (x, y) {
            let explosion = new Sprite(x, y);
            explosion.width = 64;
            explosion.height = 64;
            explosion.image = loadImage("assets/explosion.png");
            explosion.collider = "none";
            explosion.layer = 1;
            explosion.opacity = 1;
            explosion.scale = player.stats.arme.taille;
            projectile.utility.explosions.push(explosion);
        },

        checkDistance: function (boulet) {
            if ((boulet.source = "player")) {
                if (
                    dist(
                        boulet.origine.x,
                        boulet.origine.y,
                        boulet.x,
                        boulet.y
                    ) >= boulet.porteeMax
                ) {
                    player.utility.functions.createVague(boulet.x, boulet.y);

                    boulet.remove();
                    projectile.utility.projectiles.splice(
                        projectile.utility.projectiles.indexOf(boulet),
                        1
                    );
                }
            }
        },

        update: function () {
            for (let boulet of projectile.utility.projectiles) {
                projectile.functions.checkDistance(boulet);
            }
            projectile.functions.explosion();
        },
    },
};

let reticule = {
    functions: {
        runAll: function () {
            reticule.functions.mouvement();
            reticule.functions.rotation();
        },

        mouvement: function () {
            reticule.sprite.x = mouse.x;
            reticule.sprite.y = mouse.y;
        },

        rotation: function () {
            reticule.sprite.rotateTowards(player.sprite, 1, 0);
            if (arme.utility.visee == "left") {
                reticule.sprite.image = loadImage("assets/retigauche.png");
            } else {
                reticule.sprite.image = loadImage("assets/retidroite.png");
            }
        },

        initialize: function () {
            reticule.sprite = new Sprite(mouseX, mouseY);
            reticule.sprite.collider = "none";
            reticule.sprite.image = loadImage("assets/crosshair.png");
        },
    },
};

let expblock = {
    utility: {
      expblock: [],
    },

    functions: {
        runAll: function () {
            expblock.functions.update();
        },

        update: function () {
            for (let i = expblock.utility.expblock.length - 1; i >= 0; i--) {
                let expBlock = expblock.utility.expblock[i];
                if (player.sprite.overlaps(expBlock)) {
                    player.xp.experience += expBlock.experience;
                    expBlock.remove();
                    expblock.utility.expblock.splice(i, 1);
                }

                if (expBlock.timer === undefined) {
                    expBlock.timer = 0;
                } else {
                    expBlock.timer++;
                }

                let randomexp = random(300, 50000);

                if (expBlock.timer >= randomexp) {
                    // 5 à 10 secondes

                    expBlock.remove();
                    expblock.utility.expblock.splice(i, 1);
                }
            }
        },

        dropEXP: function (amount, x, y) {
            while (amount > 0) {
                let offsetX = random(-50, 50);
                let offsetY = random(-50, 50);
                if (amount >= expblock.types.darkGreen.experience) {
                    expblock.functions.createExpBlock(
                        expblock.types.darkGreen,
                        x + offsetX,
                        y + offsetY
                    );
                    amount -= expblock.types.darkGreen.experience;
                } else if (amount >= expblock.types.green.experience) {
                    expblock.functions.createExpBlock(
                        expblock.types.green,
                        x + offsetX,
                        y + offsetY
                    );
                    amount -= expblock.types.green.experience;
                } else {
                    expblock.functions.createExpBlock(
                        expblock.types.lightGreen,
                        x + offsetX,
                        y + offsetY
                    );
                    amount -= expblock.types.lightGreen.experience;
                }
            }
        },

        createExpBlock: function (type, x, y) {
            let expBlock = new Sprite(x, y);
            expBlock.shape = "circle";
            expBlock.collider = "static";
            expBlock.color = type.color;
            expBlock.scale = type.scale;
            expBlock.experience = type.experience;
            expBlock.overlaps = false;
            expBlock.collider = "none";
            expBlock.layer = -1;
            if (type.image) {
                expBlock.image = loadImage(type.image);
            }
            expblock.utility.expblock.push(expBlock);
        },
    },

    types: {
      lightGreen: { color: "lightgreen", scale: 0.4, experience: 10, image: "assets/exp-2.png" },
      green: { color: "green", scale: 0.6, experience: 50, image: "assets/exp2-2.png" },
      darkGreen: { color: "cyan", scale: 0.8, experience: 100, image: "assets/exp3-2.png" },
    },
};

let ennemi = {
    stats: {
        type0: {
            bateau: {
                name: "normal",
                image: "assets/ennemi-moyen.png",
                color: "red",
                vie: 20,
                vitesse: 1,
                maniabilite: 1,
                collision: 1.0,
                taille: 1.8,
                resistance: {
                    feu: 1.0,
                    degats: 1.0,
                },
                xpDrop: 50,
            },
            arme: {
                degats: {
                    base: 5.0,
                    feu: 0.0,
                    dureeFeu: 0,
                },
                recharge: 3,
                vitesse: 5,
                precision: 30,
                dispersion: 0,
                portee: 500,
                projectiles: 1,
                taille: 1,
                penetration: 0,
                ricochets: 0,
            },
        },
        type1: {
            bateau: {
                name: "leger",
                image: "assets/ennemi-leger.png",
                color: "blue",
                vie: 10,
                vitesse: 2,
                maniabilite: 1.5,
                collision: 1.0,
                taille: 1.5,
                resistance: {
                    feu: 1.0,
                    degats: 0.8,
                },
                xpDrop: 100,
            },
            arme: {
                degats: {
                    base: 3,
                    feu: 0.0,
                    dureeFeu: 0,
                },
                recharge: 1,
                vitesse: 5,
                precision: 30,
                dispersion: 0,
                portee: 500,
                projectiles: 1,
                taille: 1,
                penetration: 0,
                ricochets: 0,
            },
        },
        type2: {
            bateau: {
                name: "lourd",
                image: "assets/ennemi-lourd.png",
                color: "yellow",
                vie: 40,
                vitesse: 0.8,
                maniabilite: 0.8,
                collision: 1.0,
                taille: 2.5,
                resistance: {
                    feu: 0.8,
                    degats: 0.9,
                },
                xpDrop: 150,
            },
            arme: {
                degats: {
                    base: 20.0,
                    feu: 0.0,
                    dureeFeu: 0,
                },
                recharge: 8,
                vitesse: 6,
                precision: 20,
                dispersion: 5,
                portee: 600,
                projectiles: 1,
                taille: 1.5,
                penetration: 1,
                ricochets: 1,
            },
        },
        type3: {
            bateau: {
                name: "barque",
                image: "assets/ennemi-barque.png",
                color: "purple",
                vie: 5,
                vitesse: 1.8,
                maniabilite: 1.5,
                collision: 1.0,
                taille: 1,
                resistance: {
                    feu: 0.9,
                    degats: 0.95,
                },
                xpDrop: 150,
            },
            arme: {
                degats: {
                    base: 2.0,
                    feu: 0.0,
                    dureeFeu: 0,
                },
                recharge: 4,
                vitesse: 5.5,
                precision: 20,
                dispersion: 200,
                portee: 550,
                projectiles: 5,
                taille: 0.8,
                penetration: 0,
                ricochets: 0,
            },
        },
    },

    utility: {
        mobcount: 0,
    },

    functions: {
        spawn: function () {
            let randomValue = random(0, 100);
            let typeIndex;
            if (randomValue < 80) {
                typeIndex = 0;
            } else if (randomValue < 90) {
                typeIndex = 1;
            } else if (randomValue < 97) {
                typeIndex = 2;
            } else {
                typeIndex = 3;
            }
            let typeKey = `type${typeIndex}`;
            let mobStats = JSON.parse(JSON.stringify(ennemi.stats[typeKey]));

            let mob = new Sprite(
                random(
                    player.sprite.x - windowWidth,
                    player.sprite.x + windowWidth
                ),
                random(
                    player.sprite.y - windowHeight,
                    player.sprite.y + windowHeight
                )
            );

            mob.stats = mobStats;
            mob.sensRotation = floor(random(0, 2));
            mob.distanceCible = floor(random(200, 400));
            mob.touche = false;
            mob.id = ennemi.utility.mobcount++;
            mob.detectionObstacle = false;

            /*
            mob.detecmobright = new Sprite(mob.x + 100, mob.y + 35);
            mob.detecmobright.width = 120;
            mob.detecmobright.height = 35;
            mob.detecmobright.collider = "none";
            mob.detecmobright.color = "red";
            mob.detecmobright.opacity = 0.25;
            mob.detecmobright.offset.x = 60;
            mob.detecmobright.offset.y = 17.5;

            mob.detecmobleft = new Sprite(mob.x + 100, mob.y - 35);
            mob.detecmobleft.width = 120;
            mob.detecmobleft.height = 35;
            mob.detecmobleft.collider = "none";
            mob.detecmobleft.color = "green";
            mob.detecmobleft.opacity = 0.25;
            mob.detecmobleft.offset.x = 60;
            mob.detecmobleft.offset.y = -17.5;
            */

            mob.functions = {
                mouvement: function () {
                    let distance = dist(
                        mob.x,
                        mob.y,
                        player.sprite.x,
                        player.sprite.y
                    );

                    // détection des iles
                    for (let ile of iles.utility.iles) {
                        for (let sprite of ile) {
                            let distance = dist(mob.x, mob.y, sprite.x, sprite.y);      
                            if (distance < 200) {
                                mob.detectionObstacle = true;
                                if (mob.sensRotation == 0) {
                                    mob.rotation += 1;
                                }
                                else {
                                    mob.rotation -= 1;
                                }
                            }

                            else {
                                mob.detectionObstacle = false;
                            }
                        }
                    }
                

                    // aller vers le joueur si il n'y a pas d'obstacle
                    if (!mob.detectionObstacle) {
                        if (distance > mob.distanceCible) {
                            mob.rotateTowards(player.sprite, 0.1, 0);
                        } else {
                            if (mob.sensRotation == 0) {
                                if (distance < mob.distanceCible * 0.75) {
                                    mob.rotateTowards(player.sprite, 0.1, 120);
                                } else {
                                    mob.rotateTowards(player.sprite, 0.1, 90);
                                }
                                mob.direction = mob.rotation;
                            } else {
                                if (distance < mob.distanceCible * 0.75) {
                                    mob.rotateTowards(player.sprite, 0.1, -120);
                                } else {
                                    mob.rotateTowards(player.sprite, 0.1, -90);
                                }
                                mob.direction = mob.rotation;
                            }
                        }
                    }

                    mob.direction = mob.rotation;
                    mob.speed = mob.stats.bateau.vitesse;

                    /*
                    mob.detecmobright.x = mob.x;
                    mob.detecmobright.y = mob.y;
                    mob.detecmobright.rotation = mob.rotation;

                    mob.detecmobleft.x = mob.x;
                    mob.detecmobleft.y = mob.y;
                    mob.detecmobleft.rotation = mob.rotation;
                    */
                },

                update: function () {
                    mob.functions.mouvement();

                    if (frameCount % 15 == 0) {
                        spawnRoutine.utility.functions.createVague(
                            mob.x,
                            mob.y
                        );
                    }

                    if (mob.stats.bateau.vie <= 0) {
                        mob.functions.die();
                    }

                    mob.functions.checkHit();
                    mob.functions.tir();
                },

                checkHit: function () {
                    let check = false;
                    for (let boulet of projectile.utility.projectiles.filter(
                        (b) => b.tireur == "player"
                    )) {
                        if (mob.overlaps(boulet)) {
                            check = true;
                            if (!mob.touche) {
                                if (mob.stats.bateau.vie >= boulet.vie) {
                                    mob.stats.bateau.vie -= boulet.vie;
                                    boulet.vie = 0;
                                } else {
                                    let vieavant = mob.stats.bateau.vie;
                                    mob.stats.bateau.vie -= boulet.vie;
                                    boulet.vie -= vieavant;
                                }
                                if (boulet.vie <= 0) {
                                    projectile.functions.createExplosion(
                                        boulet.x,
                                        boulet.y
                                    );
                                    boulet.remove();
                                    projectile.utility.projectiles.splice(
                                        projectile.utility.projectiles.indexOf(
                                            boulet
                                        ),
                                        1
                                    );
                                }
                            }
                        }
                    }
                    if (check) {
                        mob.touche = true;
                    } else {
                        mob.touche = false;
                    }
                },

                die: function () {
                    expblock.functions.dropEXP(
                        mob.stats.bateau.xpDrop,
                        mob.x,
                        mob.y
                    );
                    spawnRoutine.utility.functions.killMob(mob.id);
                },

                tir: function () {
                    let distance = dist(
                        mob.x,
                        mob.y,
                        player.sprite.x,
                        player.sprite.y
                    );
                    if (
                        frameCount % (60 * mob.stats.arme.recharge) == 0 &&
                        distance < mob.stats.arme.portee
                    ) {
                        for (let i = 0; i < mob.stats.arme.projectiles; i++) {
                            let boulet = new Sprite(mob.x, mob.y);
                            boulet.source = "ennemi";
                            boulet.origine = {
                                x: mob.x,
                                y: mob.y,
                            };
                            boulet.vie = mob.stats.arme.degats.base;
                            boulet.ennemisPerces = mob.stats.arme.penetration;
                            boulet.rebonds = mob.stats.arme.ricochets;
                            boulet.tireur = "ennemi";
                            boulet.porteeMax =
                                mob.stats.arme.portee + random(-10, 10);
                            boulet.layer = 1;
                            boulet.collider = "none";
                            boulet.color = "black";
                            boulet.image = loadImage("assets/boulet.png");
                            boulet.image.scale = mob.stats.arme.taille / 5;
                            boulet.scale = mob.stats.arme.taille;
                            boulet.projectiles = mob.stats.arme.projectiles;
                            boulet.degatsbase = mob.stats.arme.degats.base;
                            boulet.recharge = mob.stats.arme.recharge;
                            boulet.vitesse = mob.stats.arme.vitesse;

                            boulet.direction = mob.angleTo(player.sprite);
                            boulet.direction += random(
                                -mob.stats.arme.dispersion / 2,
                                mob.stats.arme.dispersion / 2
                            );
                            boulet.direction += random(
                                -mob.stats.arme.precision,
                                mob.stats.arme.precision
                            );
                            boulet.speed = mob.stats.arme.vitesse;
                            projectile.utility.projectiles.push(boulet);
                        }
                    }
                },
            };

            mob.width = 64;
            mob.height = 32;
            mob.collider = "dynamic";
            mob.drag = 10;
            mob.rotationDrag = 1;
            mob.mass = 1;
            mob.scale = mob.stats.bateau.taille;
            mob.speed = mob.stats.bateau.vitesse;

            mob.image = mob.stats.bateau.image;
            mob.color = mob.stats.bateau.color;
            mob.layer = 1;

            spawnRoutine.utility.ennemis.push(mob);
        },
    },
};

let spawnRoutine = {
    utility: {
        ennemis: [],
        intervalle: 2,
        ennemisMax: 8,
        vagues: [],
        functions: {
            createVague: function (X, Y) {
                let vague = new Sprite(X, Y);
                vague.width = 64;
                vague.height = 64;
                vague.image = loadImage("assets/ripple.png");
                vague.collider = "none";
                vague.layer = -1;
                vague.opacity = 1;
                vague.scale = 0.8;
                spawnRoutine.utility.vagues.push(vague);
            },

            killMob: function (id) {
                let indexToRemove = -1;
                for (let i = 0; i < spawnRoutine.utility.ennemis.length; i++) {
                    if (spawnRoutine.utility.ennemis[i].id == id) {
                        spawnRoutine.utility.ennemis[i].remove();
                        /*
                        spawnRoutine.utility.ennemis[i].detecmobright.remove();
                        spawnRoutine.utility.ennemis[i].detecmobleft.remove();
                        */
                        indexToRemove = i;
                        break;
                    }
                }
                if (indexToRemove !== -1) {
                    spawnRoutine.utility.ennemis.splice(indexToRemove, 1);
                }
            },
        },
    },

    functions: {
        runAll: function () {
            spawnRoutine.functions.spawn();
            spawnRoutine.functions.update();
            spawnRoutine.functions.vagues();
            spawnRoutine.functions.removeEnnemi();
        },

        spawn: function () {
            if (frameCount % (spawnRoutine.utility.intervalle * 60) == 0) {
                if (
                    spawnRoutine.utility.ennemis.length <
                    spawnRoutine.utility.ennemisMax
                ) {
                    ennemi.functions.spawn();
                }
            }
        },

        update: function () {
            for (let mob of spawnRoutine.utility.ennemis) {
                mob.functions.update();
            }

            if (
                timerminute % 3 === 0 &&
                timerminute !== 0 &&
                timerseconde === 0 &&
                !spawnRoutine.utility.increased
            ) {
                spawnRoutine.utility.ennemisMax += 2;
                spawnRoutine.utility.increased = true;
            } else if (timerseconde !== 0) {
                spawnRoutine.utility.increased = false;
            }
        },

        vagues: function () {
            for (let i = 0; i < spawnRoutine.utility.vagues.length; i++) {
                let vague = spawnRoutine.utility.vagues[i];
                vague.opacity -= 0.02;
                vague.scale += 0.02;
                if (vague.opacity <= 0) {
                    spawnRoutine.utility.vagues.splice(i, 1);
                    vague.remove();
                }
            }
        },

        removeEnnemi: function () {
            for (let i = spawnRoutine.utility.ennemis.length - 1; i >= 0; i--) {
                let ennemi = spawnRoutine.utility.ennemis[i];
                let distance = dist(
                    ennemi.x,
                    ennemi.y,
                    player.sprite.x,
                    player.sprite.y
                );
                if (distance > max(windowWidth * 1.5, windowHeight * 1.5)) {
                    ennemi.remove();
                    spawnRoutine.utility.ennemis.splice(i, 1);
                }
            }
        },
    },
};

let iles = {
    utility: {
        iles: [],
        timerseconde: 0,
    },

    functions: {
        runAll: function () {
            iles.functions.removeile();
            iles.functions.checkcollision();
        },

        create: function () {
            let numbermaxiles = 5;
            while (iles.utility.iles.length <= numbermaxiles) {
                let x, y;
                let validPosition = false;
                while (!validPosition) {
                    x = random(
                        player.sprite.x - windowWidth,
                        player.sprite.x + windowWidth + 200
                    );
                    y = random(
                        player.sprite.y - windowHeight,
                        player.sprite.y + windowHeight + 200
                    );
                    validPosition = iles.functions.isValidPosition(x, y);
                }
                let ile = iles.functions.createIle(x, y);

                iles.utility.iles.push(ile);
            }
        },

        isValidPosition: function (x, y) {
            let minDistance = 500; // Minimum distance between islands
            for (let ile of iles.utility.iles) {
                for (let sprite of ile) {
                    if (dist(x, y, sprite.x, sprite.y) < minDistance) {
                        return false;
                    }
                }
            }
            return true;
        },

        createIle: function (x, y) {
            let ile = [];
            let directions = [
                { x: 64, y: 0 },
                { x: -64, y: 0 },
                { x: 0, y: 64 },
                { x: 0, y: -64 },
            ];

            let currentX = x;
            let currentY = y;

            let numberIle = floor(random(15, 40));

            for (let i = 0; i < numberIle; i++) {
                let sprite = new Sprite(currentX, currentY);
                sprite.width = 64;
                sprite.height = 64;
                sprite.collider = "static";
                sprite.layer = -1;
                sprite.color = "green";
                sprite.stroke = "0";
                ile.push(sprite);

                let direction = random(directions);
                currentX += direction.x;
                currentY += direction.y;
            }

            for (let sprite of ile) {
                let surroundingSprites = 0;
                for (let direction of directions) {
                    let neighborX = sprite.x + direction.x;
                    let neighborY = sprite.y + direction.y;
                    for (let otherSprite of ile) {
                        if (
                            otherSprite.x === neighborX &&
                            otherSprite.y === neighborY
                        ) {
                            surroundingSprites++;
                            break;
                        }
                    }
                }

                let hasTop = false;
                let hasRight = false;
                let hasBottom = false;
                let hasLeft = false;

                for (let direction of directions) {
                    let neighborX = sprite.x + direction.x;
                    let neighborY = sprite.y + direction.y;
                    for (let otherSprite of ile) {
                        if (
                            otherSprite.x === neighborX &&
                            otherSprite.y === neighborY
                        ) {
                            if (direction.x === 0 && direction.y === -64)
                                hasTop = true;
                            if (direction.x === 64 && direction.y === 0)
                                hasRight = true;
                            if (direction.x === 0 && direction.y === 64)
                                hasBottom = true;
                            if (direction.x === -64 && direction.y === 0)
                                hasLeft = true;
                        }
                    }
                }

                if (hasTop && hasRight && hasBottom && hasLeft) {
                    sprite.image = loadImage("assets/ile-0.png");
                } else if (
                    (hasTop && hasRight && hasBottom) ||
                    (hasTop && hasRight && hasLeft) ||
                    (hasTop && hasBottom && hasLeft) ||
                    (hasRight && hasBottom && hasLeft)
                ) {
                    sprite.image = loadImage("assets/ile-1.png");

                    if (hasTop && hasRight && hasBottom) {
                        sprite.rotation = 90;
                    }
                    if (hasBottom && hasRight && hasLeft) {
                        sprite.rotation = 180;
                    }
                    if (hasTop && hasBottom && hasLeft) {
                        sprite.rotation = -90;
                    }
                } else if (
                    (hasTop && hasRight) ||
                    (hasTop && hasBottom) ||
                    (hasTop && hasLeft) ||
                    (hasRight && hasBottom) ||
                    (hasRight && hasLeft) ||
                    (hasBottom && hasLeft)
                ) {
                    if (hasRight && hasTop) {
                        sprite.rotation = 90;
                        sprite.image = loadImage("assets/ile-2.png");
                    } else if (hasRight && hasBottom) {
                        sprite.rotation = 180;
                        sprite.image = loadImage("assets/ile-2.png");
                    } else if (hasLeft && hasBottom) {
                        sprite.rotation = -90;
                        sprite.image = loadImage("assets/ile-2.png");
                    } else if (hasRight && hasLeft) {
                        sprite.image = loadImage("assets/ile-5.png");
                    } else if (hasBottom && hasTop) {
                        sprite.rotation = 90;
                        sprite.image = loadImage("assets/ile-5.png");
                    } else {
                        sprite.image = loadImage("assets/ile-2.png");
                    }
                } else if (hasTop || hasRight || hasBottom || hasLeft) {
                    sprite.image = loadImage("assets/ile-3.png");
                    if (hasTop) {
                        sprite.rotation = 90;
                    }
                    if (hasRight) {
                        sprite.rotation = 180;
                    }
                    if (hasBottom) {
                        sprite.rotation = -90;
                    }
                } else {
                    sprite.image = loadImage("assets/ile-4.png");
                }
            }

            return ile;
        },

        removeile: function () {
            for (let i = iles.utility.iles.length - 1; i >= 0; i--) {
                let ile = iles.utility.iles[i];
                let allSpritesOutOfScreen = true;
                for (let sprite of ile) {
                    let distance = dist(
                        sprite.x,
                        sprite.y,
                        player.sprite.x,
                        player.sprite.y
                    );
                    if (
                        distance <= max(windowWidth * 1.5, windowHeight * 1.5)
                    ) {
                        allSpritesOutOfScreen = false;
                        break;
                    }
                }
                if (allSpritesOutOfScreen) {
                    for (let sprite of ile) {
                        sprite.remove();
                        iles.functions.create();
                    }
                    iles.utility.iles.splice(i, 1);
                    iles.utility.timerseconde = 0; // Reset timer when an island is removed
                }
            }
        },

        checkcollision: function () {
            for (let boulet of projectile.utility.projectiles) {
                if (
                    iles.utility.iles.some((ile) =>
                        ile.some((sprite) => sprite.overlaps(boulet))
                    )
                ) {
                    projectile.functions.createExplosion(boulet.x, boulet.y);
                    boulet.remove();
                    projectile.utility.projectiles.splice(
                        projectile.utility.projectiles.indexOf(boulet),
                        1
                    );
                }
            }
        },
    },
};

let interniveau = {
    utility: {
      smallDiamond: [],
      largeDiamond: null,
      smallDiamondtext: [],
      ecran: null,
      buttonpast: null,
	  textamelioration: [],
    },

    runAll: function () {
      for (let text of interniveau.utility.textamelioration) {
        text.x = player.sprite.x - windowWidth / 2 + 200;
        text.y = player.sprite.y - windowHeight / 2 + 300 + (interniveau.utility.textamelioration.indexOf(text) * 50);
      }
    },

    run: function () {

        for (let text of interniveau.utility.textamelioration) {
            text.x = player.sprite.x - windowWidth / 2 + 200;
            text.y =
                player.sprite.y -
                windowHeight / 2 +
                300 +
                interniveau.utility.textamelioration.indexOf(text) * 50;
        }

        for (let i = 0; i < interniveau.utility.smallDiamond.length; i++) {
            let dataAmelioration = ameliorations.functions.getAmelioration(interniveau.utility.smallDiamond[i].idAmelioration);

            if (interniveau.utility.smallDiamond[i].mouse.pressed()) {

                // affichage
                interniveau.createtext(
                    dataAmelioration.nom
                );
                interniveau.utility.smallDiamond.forEach((diamond) =>
                    diamond.remove()
                );
                interniveau.utility.largeDiamond.remove();
                interniveau.utility.smallDiamondtext.forEach((text) =>
                    text.remove()
                );

                // application de l'amélioration
                ameliorations.functions.equiper(dataAmelioration.id);

                // fermeture du menu
                interniveau.utility.ecran.remove();
                interniveau.utility.buttonpast.remove();

                world.timeScale = 1;
                break;
            }
            /*
            let distButton = dist(mouse.x, mouse.y, interniveau.utility.smallDiamond[i].x, interniveau.utility.smallDiamond[i].y);
            console.log(interniveau.utility.smallDiamond[i].text, distButton);
            if (distButton < 200) {
                interniveau.utility.smallDiamond[i].scale = 1.1;
                interniveau.utility.smallDiamond[i].text = dataAmelioration.description;
            }
            else {
                interniveau.utility.smallDiamond[i].scale = 1;
                interniveau.utility.smallDiamond[i].text = "";
            }
            */
        }
        if (
            interniveau.utility.buttonpast &&
            interniveau.utility.buttonpast.mouse.pressed()
        ) {
            interniveau.utility.smallDiamond.forEach((diamond) =>
                diamond.remove()
            );
            interniveau.utility.largeDiamond.remove();
            interniveau.utility.smallDiamondtext.forEach((text) =>
                text.remove()
            );
            interniveau.utility.ecran.remove();
            interniveau.utility.buttonpast.remove();
            world.timeScale = 1;
            player.utility.degats_subits = 0;
        }
    },

    initialize: function () {
        world.timeScale = 0;
        let centerX = player.sprite.x;
        let centerY = player.sprite.y;
        let size = 800; // Size of the large diamond

        let ecran = new Sprite(centerX, centerY, 0, 0);
        ecran.width = windowWidth;
        ecran.height = windowHeight;
        ecran.color = "black";
        ecran.opacity = 0.5;
        ecran.collider = "none";
        ecran.layer = 100000000;
        interniveau.utility.ecran = ecran;

        let buttonpast = new Sprite(
            player.sprite.x + windowWidth / 2 - 200,
            player.sprite.y + windowHeight / 2 - 100,
            300,
            500
        );
        buttonpast.width = 350;
        buttonpast.height = 50;
        buttonpast.color = "gray";
        buttonpast.image = "assets/panc.png";

        buttonpast.layer = 100000000;
        /*buttonpast.text = "Regagnez vos PV";
        buttonpast.textSize = 40;
        buttonpast.textColor = "white";*/
        interniveau.utility.buttonpast = buttonpast;

        // Create the large diamond
        let largeDiamond = new Sprite(centerX, centerY);
        largeDiamond.width = size;
        largeDiamond.height = size;
        largeDiamond.rotation = 45;
        largeDiamond.color = "black";
        largeDiamond.collider = "none";
        largeDiamond.layer = 100000000;
        largeDiamond.collider = "none";
        largeDiamond.image= "assets/planche.png";
        largeDiamond.image.scale=1.2;

        interniveau.utility.largeDiamond = largeDiamond;

        // Create the four smaller diamonds
        let smallSize = size / 2.7;
        let offsets = [
            { x: 230, y: 0 },
            { x: -230, y: 0 },
            { x: 0, y: 230 },
            { x: 0, y: -230 },
        ];

        let ids = ameliorations.functions.chooseRandom(4);

        let i = 0;
        for (let offset of offsets) {

            // éviter un crash quand on a moins de 4 améliorations disponibles
            if (ids[i] === undefined){
                break;
            }
            
            let dataAmelioration = ameliorations.functions.getAmelioration(ids[i]);

            let smallDiamond = new Sprite(
                centerX + offset.x,
                centerY + offset.y
            );
            smallDiamond.width = smallSize;
            smallDiamond.height = smallSize;
            smallDiamond.rotation = -45;
            smallDiamond.layer = 100000000;
            smallDiamond.color = "gray";
            smallDiamond.image = "assets/parchemin.png";
            smallDiamond.image.scale= 1.1;
            interniveau.utility.smallDiamond.push(smallDiamond);
            smallDiamond.idAmelioration = ids[i];

            let smallDiamondtext = new Sprite(
                centerX + offset.x,
                centerY + offset.y,
                0,
                0
            );
            smallDiamondtext.text = dataAmelioration.nom;
            smallDiamondtext.textSize = 50;
            smallDiamondtext.textColor = "white";

            interniveau.utility.smallDiamondtext.push(smallDiamondtext);
            i++;
        }

    },

    createtext: function (texte) {
        if (interniveau.utility.textamelioration.length === 0) {
            let textamelioration = new Sprite(
                player.sprite.x - windowWidth / 2 + 200,
                player.sprite.y - windowHeight / 2 + 300,
                0,
                0
            );
            textamelioration.textSize = 40;
            textamelioration.text = texte;
            textamelioration.collider = "none";
            textamelioration.textColor = "white";
            textamelioration.layer = 100000000;
            interniveau.utility.textamelioration.push(textamelioration);
        } else {
            let lastText =
                interniveau.utility.textamelioration[
                    interniveau.utility.textamelioration.length - 1
                ];
            let textamelioration = new Sprite(
                lastText.x,
                lastText.y + 50,
                0,
                0
            );
            textamelioration.textSize = 40;
            textamelioration.text = texte;
            textamelioration.collider = "none";
            textamelioration.textColor = "white";
            textamelioration.layer = 100000000;
            interniveau.utility.textamelioration.push(textamelioration);
        }
    },
};

let ameliorations = {
    equipees: [],

    bannies: [],

    disponibles: [],

    liste:[

        // Structure d'une amélioration
        // {
        //     id: int,
        //     nom: string,
        //     type: "amelioration" || "equipement",
        //     emplacement: undefined || "armePrincipale" || "armeSecondaire" || [...],
        //     description: string,
        //     initiale: true || false, // Définit si l'amélioration est débloquée dès le début.
        //     effets: [
        //         {
        //             type: "bateau" || "arme",
        //             stat: "vie" || "vitesse" || [...],
        //             operation: "fixe" || "mult",
        //             valeur: int || float,
        //         },
        //     ],
        //     debloque: [Liste des IDS débloquées],
        //     bannit: [Liste des IDS bannies],
        // },

        { // 1 - Boulets en plomb
            id: 1,
            nom: "Boulets en plomb",
            type: "amelioration",
            emplacement: undefined,
            description: "Dommage d'avoir mis notre tailleur de pierre au chômage. Mais bon, ça fait plus de dégâts.",
            initiale: true,
            effets: [
                {
                    type: "arme",
                    stat: "degats_base",
                    operation: "fixe",
                    valeur: 5,
                },
                {
                    type: "arme",
                    stat: "portee",
                    operation: "fixe",
                    valeur: -50,
                }
            ],
            debloque: [5],
            bannit: [],
        },

        { // 2 - Boulets légers
            id: 2,
            nom: "Boulets légers",
            type: "amelioration",
            emplacement: undefined,
            description: "On s'est dit qu'avec des boulets plus légers, on pourrait en emporter plus.",
            initiale: true,
            effets: [
                {
                    type: "arme",
                    stat: "degats_base",
                    operation: "fixe",
                    valeur: -3,
                },
                {
                    type: "arme",
                    stat: "recharge",
                    operation: "fixe",
                    valeur: -0.1,
                }
            ],
            debloque: [6, 7],
            bannit: [11],
        },

        { // 3 - Boulets taillés
            id: 3,
            nom: "Boulets taillés",
            type: "amelioration",
            emplacement: undefined,
            description: "On a donné encore plus de travail au tailleur de pierre ! Comment ça, on l'a viré ?...",
            initiale: true,
            effets: [
                {
                    type: "arme",
                    stat: "vitesse",
                    operation: "fixe",
                    valeur: 1,
                },
                {
                    type: "arme",
                    stat: "degats_base",
                    operation: "fixe",
                    valeur: -5,
                },
                {
                    type: "arme",
                    stat: "penetration",
                    operation: "fixe",
                    valeur: 1,
                }
            ],
            debloque: [8],
            bannit: [],
        },

        { // 4 - Inspection du charpentier
            id: 4,
            nom: "Inspection du charpentier",
            type: "amelioration",
            emplacement: undefined,
            description: "Si on en croit le charpentier, le bateau est au top de la forme...",
            initiale: true,
            effets: [
                {
                    type: "bateau",
                    stat: "vie",
                    operation: "fixe",
                    valeur: 10,
                }
            ],
            debloque: [9,10],
            bannit: [],
        },

        { // 5 - Gros calibre
            id: 5,
            nom: "Gros calibre",
            type: "amelioration",
            emplacement: undefined,
            description: "Des boulets plus gros = des trous plus gros. Logique ! Et ne me dites pas 'mais c'est lourd'.",
            initiale: false,
            effets: [
                {
                    type: "arme",
                    stat: "degats_base",
                    operation: "fixe",
                    valeur: 5,
                },
                {
                    type: "arme",
                    stat: "recharge",
                    operation: "fixe",
                    valeur: 0.1,
                },
                {
                    type: "arme",
                    stat: "portee",
                    operation: "fixe",
                    valeur: -50,
                },
                {
                    type: "arme",
                    stat: "taille",
                    operation: "fixe",
                    valeur: 0.2,
                }
            ],
            debloque: [11],
            bannit: [],
        },

        { // 6 - Sacs de poudre
            id: 6,
            nom: "Sacs de poudre",
            type: "amelioration",
            emplacement: undefined,
            description: "Tiens, eh, et si on préparait la poudre AVANT d'en avoir besoin ?",
            initiale: false,
            effets: [
                {
                    type: "arme",
                    stat: "recharge",
                    operation: "fixe",
                    valeur: -0.1,
                },
                {
                    type: "arme",
                    stat: "portee",
                    operation: "fixe",
                    valeur: -50,
                }
            ],
            debloque: [12],
            bannit: [],
        },

        { // 7 - Tireurs déchaînés
            id: 7,
            nom: "Tireurs déchaînés",
            type: "amelioration",
            emplacement: undefined,
            description: "Le capitaine a donné un sacré discours à l'équipage, mais maintenant ils sont surexcités !",
            initiale: false,
            effets: [
                {
                    type: "arme",
                    stat: "dispersion",
                    operation: "fixe",
                    valeur: 10,
                },
                {
                    type: "arme",
                    stat: "recharge",
                    operation: "fixe",
                    valeur: -0.2,
                }
            ],
            debloque: [12],
            bannit: [8, 16],
        },

        { // 8 - Tireurs attentionnés
            id: 8,
            nom: "Tireurs attentionnés",
            type: "amelioration",
            emplacement: undefined,
            description: "On a entraîné les tireurs à être plus précis. Ils ont même arrêté de tirer sur les mouettes !",
            initiale: false,
            effets: [
                {
                    type: "arme",
                    stat: "dispersion",
                    operation: "fixe",
                    valeur: -5,
                },
                {
                    type: "arme",
                    stat: "recharge",
                    operation: "fixe",
                    valeur: +0.2,
                }
            ],
            debloque: [13],
            bannit: [7],
        },

        { // 9 - Pièces de rechange
            id: 9,
            nom: "Pièces de rechange",
            type: "amelioration",
            emplacement: undefined,
            description: "Le contremaître a eu l'idée d'emporter des pièces en plus, 'au cas où'. Mouais...",
            initiale: false,
            effets: [
                {
                    type: "bateau",
                    stat: "vie",
                    operation: "fixe",
                    valeur: 20,
                },
                {
                    type: "bateau",
                    stat: "vitesse",
                    operation: "fixe",
                    valeur: -0.2,
                }
            ],
            debloque: [14],
            bannit: [18, 19],
        },

        { // 10 - Coque épaisse
            id: 10,
            nom: "Coque épaisse",
            type: "amelioration",
            emplacement: undefined,
            description: "On s'est dit qu'une coque ça protégeait bien. Du coup, on s'est dit : eh, pourquoi pas deux ?",
            initiale: false,
            effets: [
                {
                    type: "bateau",
                    stat: "resistance_degats",
                    operation: "fixe",
                    valeur: -0.1,
                },
                {
                    type: "bateau",
                    stat: "vitesse",
                    operation: "fixe",
                    valeur: -0.2,
                },
                {
                    type: "bateau",
                    stat: "maniabilite",
                    operation: "fixe",
                    valeur: -0.1,
                }
            ],
            debloque: [15],
            bannit: [],
        },

        { // 11 - Boulets XL
            id: 11,
            nom: "Boulets XL",
            type: "amelioration",
            emplacement: undefined,
            description: "A deux doigts d'inventer la Grosse Bertha.",
            initiale: false,
            effets: [
                {
                    type: "arme",
                    stat: "degats_base",
                    operation: "fixe",
                    valeur: 8,
                },
                {
                    type: "arme",
                    stat: "vitesse",
                    operation: "fixe",
                    valeur: -1,
                },
                {
                    type: "arme",
                    stat: "portee",
                    operation: "fixe",
                    valeur: -50,
                },
                {
                    type: "arme",
                    stat: "taille",
                    operation: "fixe",
                    valeur: 0.3,
                }
            ],
            debloque: [],
            bannit: [2],
        },

        { // 12 - Barils de rhum
            id: 12,
            nom: "Barils de rhum",
            type: "amelioration",
            emplacement: undefined,
            description: "Le capitaine a eu une idée de génie : il a dit 'et si on buvait un coup ?' !",
            initiale: false,
            effets: [
                {
                    type: "bateau",
                    stat: "resistance_feu",
                    operation: "fixe",
                    valeur: 0.2,
                },
                {
                    type: "arme",
                    stat: "recharge",
                    operation: "fixe",
                    valeur: -0.2,
                },
                {
                    type: "arme",
                    stat: "dispersion",
                    operation: "fixe",
                    valeur: 5,
                }
            ],
            debloque: [],
            bannit: [],
        },

        { // 13 - Double dose de poudre
            id: 13,
            nom: "Double dose de poudre",
            type: "amelioration",
            emplacement: undefined,
            description: "Bon, normalement, les canons devraient tenir. Normalement.",
            initiale: false,
            effets: [
                {
                    type: "arme",
                    stat: "vitesse",
                    operation: "fixe",
                    valeur: 3,
                },
                {
                    type: "arme",
                    stat: "recharge",
                    operation: "mult",
                    valeur: 1.5,
                },
                {
                    type: "arme",
                    stat: "portee",
                    operation: "fixe",
                    valeur: 200,
                }
            ],
            debloque: [],
            bannit: [],
        },

        { // 14 - Charpentier de bord
            id: 14,
            nom: "Charpentier de bord",
            type: "amelioration",
            emplacement: undefined,
            description: "Le charpentier a dit 'je vais réparer le bateau'. On s'est dit qu'au final il avait qu'à venir avec nous.",
            initiale: false,
            effets: [
                {
                    type: "bateau",
                    stat: "vie",
                    operation: "fixe",
                    valeur: 20,
                },
                {
                    type: "arme",
                    stat: "recharge",
                    operation: "fixe",
                    valeur: 0.2,
                },
            ],
            debloque: [16],
            bannit: [20, 15],
        },

        { // 15 - Charpentier expert
            id: 15,
            nom: "Charpentier expert",
            type: "amelioration",
            emplacement: undefined,
            description: "Ca fait quand même 50 ans qu'il est là, non ? MAIS COMMENT IL FAIT ??",
            initiale: false,
            effets: [
                {
                    type: "bateau",
                    stat: "vie",
                    operation: "fixe",
                    valeur: 10,
                },
                {
                    type: "bateau",
                    stat: "resistance_degats",
                    operation: "fixe",
                    valeur: -0.1,
                },
            ],
            debloque: [17],
            bannit: [14],
        },

        { // 16 - Réparations en mer
            id: 16,
            nom: "Réparations en mer",
            type: "amelioration",
            emplacement: undefined,
            description: "On a dit au charpentier 'tu répares le bateau'. Il a dit 'maintenant ?'. Bah oui, maintenant. Tu veux couler ?",
            initiale: false,
            effets: [
                {
                    type: "bateau",
                    stat: "vie",
                    operation: "fixe",
                    valeur: 30,
                },
                {
                    type: "arme",
                    stat: "recharge",
                    operation: "fixe",
                    valeur: 0.1,
                },
            ],
            debloque: [],
            bannit: [7],
        },

        { // 17 - Plaques de fer
            id: 17,
            nom: "Plaques de fer",
            type: "amelioration",
            emplacement: undefined,
            description: "On a remarqué que quand le capitaine d'avant s'est pris un boulet, il restait que le métal. Super, l'idée !",
            initiale: false,
            effets: [
                {
                    type: "bateau",
                    stat: "resistance_degats",
                    operation: "fixe",
                    valeur: -0.1,
                },
                {
                    type: "bateau",
                    stat: "vitesse",
                    operation: "fixe",
                    valeur: -0.2,
                },
                {
                    type: "bateau",
                    stat: "maniabilite",
                    operation: "fixe",
                    valeur: -0.2,
                }
            ],
            debloque: [],
            bannit: [],
        },

        { // 18 - Fraude fiscale
            id: 18,
            nom: "Fraude fiscale",
            type: "amelioration",
            emplacement: undefined,
            description: "Vous êtes vraiment en train de nous dire que c'est illégal ? ON EST DES PIRATES !",
            initiale: false,
            effets: [
                {
                    type: "bateau",
                    stat: "vie",
                    operation: "fixe",
                    valeur: -10,
                },
                {
                    type: "bateau",
                    stat: "vitesse",
                    operation: "fixe",
                    valeur: 0.1,
                }
            ],
            debloque: [20, 19],
            bannit: [9],
        },

        { // 19 - Planches 'économisées'
            id: 19,
            nom: "Planches 'économisées'",
            type: "amelioration",
            emplacement: undefined,
            description: "Non non, je te PROMETS, y'en a vraiment pas besoin. Promis juré.",
            initiale: false,
            effets: [
                {
                    type: "bateau",
                    stat: "vie",
                    operation: "fixe",
                    valeur: -15,
                },
                {
                    type: "bateau",
                    stat: "vitesse",
                    operation: "fixe",
                    valeur: 0.2,
                },
                {
                    type: "bateau",
                    stat: "maniabilite",
                    operation: "fixe",
                    valeur: 0.1,
                }
            ],
            debloque: [22],
            bannit: [9],
        },

        { // 20 - Equipage barbare
            id: 20,
            nom: "Equipage barbare",
            type: "amelioration",
            emplacement: undefined,
            description: "Demandez pas ce qui est arrivé à l'équipage précédent. On a dit 'barbare', on a pas dit 'gentil'.",
            initiale: false,
            effets: [
                {
                    type: "bateau",
                    stat: "vie",
                    operation: "fixe",
                    valeur: -10,
                },
                {
                    type: "bateau",
                    stat: "vitesse",
                    operation: "fixe",
                    valeur: 0.1,
                },
                {
                    type: "bateau",
                    stat: "collision",
                    operation: "fixe",
                    valeur: 0.5,
                }
            ],
            debloque: [21],
            bannit: [14],
        },

        { // 21 - Boucliers viking
            id: 21,
            nom: "Boucliers viking",
            type: "amelioration",
            emplacement: undefined,
            description: "C'est joli et en plus ça nous protège. De toute façon on a pas le choix, on a plus de planches.",
            initiale: false,
            effets: [
                {
                    type: "bateau",
                    stat: "resistance_degats",
                    operation: "fixe",
                    valeur: -0.1,
                },
                {
                    type: "arme",
                    stat: "portee",
                    operation: "fixe",
                    valeur: -50,
                }
            ],
            debloque: [],
            bannit: [],
        },

        { // 22 - Mini rations
            id: 22,
            nom: "Mini rations",
            type: "amelioration",
            emplacement: undefined,
            description: "Bon, alors, certes, on est plus légers, mais du coup l'équipage est pas super content.",
            initiale: false,
            effets: [
                {
                    type: "bateau",
                    stat: "vie",
                    operation: "fixe",
                    valeur: -10,
                },
                {
                    type: "bateau",
                    stat: "vitesse",
                    operation: "fixe",
                    valeur: 0.3,
                },
                {
                    type: "bateau",
                    stat: "maniabilite",
                    operation: "fixe",
                    valeur: 0.2,
                },
                {
                    type: "arme",
                    stat: "recharge",
                    operation: "fixe",
                    valeur: 0.2,
                }
            ],
            debloque: [],
            bannit: [],
        },

    ],

    functions:{
        chooseRandom: function(nombre){
            let propositions = [];

            // pour éviter un while infini
            if (nombre > ameliorations.disponibles.length){
                nombre = ameliorations.disponibles.length;
            }

            while (propositions.length < nombre){
                let randomIndex = Math.floor(Math.random() * ameliorations.disponibles.length);

                // choisir une autre amélioration si elle est déjà présente
                while (propositions.includes(ameliorations.disponibles[randomIndex])){
                    randomIndex = Math.floor(Math.random() * ameliorations.disponibles.length);
                }

                let randomProposition = ameliorations.disponibles[randomIndex];

                propositions.push(randomProposition);
            }
            return propositions;
        },

        initialiserDisponibles: function(){
            for (let amelioration of ameliorations.liste){
                if (amelioration.initiale){
                    ameliorations.disponibles.push(amelioration.id);
                }
            }
        },

        getAmelioration: function(id){
            for (let amelioration of ameliorations.liste){
                if (amelioration.id == id){
                    return amelioration;
                }
            }
        },

        bannir: function(id){
            ameliorations.bannies.push(parseInt(id));

            // Retirer l'amélioration bannie des améliorations disponibles
            let index = ameliorations.disponibles.indexOf(parseInt(id));
            if (index > -1) {
                ameliorations.disponibles.splice(index, 1);
            }
        },

        debloquer: function(id){
            ameliorations.disponibles.push(parseInt(id));
        },

        equiper: function(id){
            ameliorations.equipees.push(parseInt(id));

            let data = ameliorations.functions.getAmelioration(id);
            
            if (data.debloque.length > 0){
                for (let id of data.debloque){
                    // si l'amélioration n'est pas bannie ou débloquée
                    if (!ameliorations.bannies.includes(id)){
                        if (!ameliorations.disponibles.includes(id)){
                        ameliorations.functions.debloquer(id);
                        }
                    }
                }
            }

            if (data.bannit.length > 0){
                for (let id of data.bannit){
                    ameliorations.functions.bannir(id);
                }
            }

            // Retirer l'amélioration équipée des améliorations disponibles
            let index = ameliorations.disponibles.indexOf(parseInt(id));
            if (index > -1) {
                ameliorations.disponibles.splice(index, 1);
            }
        },
    }
};

let vieblock = {
    utility: {
        vieblock: [],
    },

    functions: {
        runAll: function () {
            vieblock.functions.update();
        },

        update: function () {
            for (let i = vieblock.utility.vieblock.length - 1; i >= 0; i--) {
                let vieBlock = vieblock.utility.vieblock[i];
                if (player.sprite.overlaps(vieBlock)) {
                    if (player.utility.degats_subits - vieBlock.vie <= 0) {
                        player.utility.degats_subits = 0;
                        vieBlock.remove();
                        vieblock.utility.vieblock.splice(i, 1);
                    } else {
                        player.utility.degats_subits -= vieBlock.vie;
                        vieBlock.remove();
                        vieblock.utility.vieblock.splice(i, 1);
                    }
                }
            }

            if (vieblock.utility.vieblock.length < 5) {
                if (frameCount % (5 * 60) == 0) {
                    vieblock.functions.spawn();
                }
            }

            vieblock.functions.removevieblock();
        },

        isValidPosition: function (x, y) {
            let minDistance = 100; // Minimum distance between vie blocks
            for (let vieBlock of vieblock.utility.vieblock) {
                if (Math.hypot(x - vieBlock.x, y - vieBlock.y) < minDistance) {
                    return false;
                }
            }
            for (let ile of iles.utility.iles) {
                for (let sprite of ile) {
                    if (Math.hypot(x - sprite.x, y - sprite.y) < minDistance) {
                        return false;
                    }
                }
            }

            return true;
        },

        spawn: function () {
            let x, y;
            do {
                x = random(
                    player.sprite.x - windowWidth - 500,
                    player.sprite.x + windowWidth + 50
                );
                y = random(
                    player.sprite.y - windowHeight - 500,
                    player.sprite.y + windowHeight + 500
                );
            } while (!vieblock.functions.isValidPosition(x, y));

            let randomValue = random(0, 100);
            let type;
            if (randomValue < 85) {
                type = vieblock.types.lightGreen;
            } else if (randomValue < 95) {
                type = vieblock.types.green;
            } else {
                type = vieblock.types.darkGreen;
            }
            vieblock.functions.createVieBlock(type, x, y);
        },

        createVieBlock: function (type, x, y) {
            let vieBlock = new Sprite(x, y);
            vieBlock.shape = "circle";
            vieBlock.collider = "static";
            vieBlock.color = type.color;
            vieBlock.scale = type.scale;
            vieBlock.vie = type.vie;
            vieBlock.overlaps = false;
            vieBlock.collider = "none";
            vieBlock.layer = -1;
            if (type.image) {
                vieBlock.image = loadImage(type.image);
            }
            vieblock.utility.vieblock.push(vieBlock);
        },

        removevieblock: function () {
            for (let i = vieblock.utility.vieblock.length - 1; i >= 0; i--) {
                let vieBlock = vieblock.utility.vieblock[i];
                let distance = dist(
                    vieBlock.x,
                    vieBlock.y,
                    player.sprite.x,
                    player.sprite.y
                );
                if (distance > max(windowWidth * 1.5, windowHeight * 1.5)) {
                    vieBlock.remove();
                    vieblock.utility.vieblock.splice(i, 1);
                }
            }
        },
    },

    types: {
        lightGreen: {
            color: "lightgreen",
            scale: 1,
            vie: 10,
            image: "assets/vie-1.png",
        },
        green: {
            color: "green",
            scale: 1.15,
            vie: 50,
            image: "assets/vie-2.png",
        },
        darkGreen: {
            color: "cyan",
            scale: 1.3,
            vie: 100,
            image: "assets/vie-3.png",
        },
    },
};

function setup() {
    frameRate(60);

    new Canvas(windowWidth, windowHeight);
    displayMode("centered", "pixelated", 8);
    background("skyblue");

    timermillieseconde = 0;
    timerseconde = 0;
    timerminute = 0;

    //start..........................

    player.functions.initialize();
    viseur.functions.initialize();
    arme.functions.initialize();
    reticule.functions.initialize();
    ameliorations.functions.initialiserDisponibles();

    time = new Sprite(
        player.sprite.x - windowWidth / 2 + 180,
        player.sprite.y - windowHeight / 2 + 50,
        0,
        0
    );
    time.textSize = 40;
    time.text = "Time : " + timerminute + "min" + timermillieseconde + "s";
    time.collider = "none";
    time.textColor = "white";
    time.layer = 1000000;

    reload = new Sprite(
        player.sprite.x - windowWidth / 2 + 180,
        player.sprite.y - windowHeight / 2 + 100,
        0,
        0
    );
    reload.textSize = 40;
    reload.text = "Reload : " + arme.utility.recharge;
    reload.collider = "none";
    reload.textColor = "white";
    reload.layer = 1000000;

    niveautext = new Sprite(
        player.sprite.x - windowWidth / 2 + 180,
        player.sprite.y - windowHeight / 2 + 150,
        0,
        0
    );
    niveautext.textSize = 40;
    niveautext.text = "Niveau : " + player.xp.niveau;
    niveautext.collider = "none";
    niveautext.textColor = "white";
    niveautext.layer = 1000000;

    exptext = new Sprite(
        player.sprite.x - windowWidth / 2 + 180,
        player.sprite.y - windowHeight / 2 + 200,
        0,
        0
    );
    exptext.textSize = 40;
    exptext.text = "Exp : " + player.xp.experience;
    exptext.collider = "none";
    exptext.textColor = "white";
    exptext.layer = 1000000;

    textvie = new Sprite(
        player.sprite.x + windowWidth / 2 - 180,
        player.sprite.y - windowHeight / 2 + 50,
        0,
        0
    );
    textvie.textSize = 40;
    textvie.text = "Vie : " + player.stats.bateau.vie;
    textvie.collider = "none";
    textvie.textColor = "white";
    textvie.layer = 1000000;

    coordonneX = player.sprite.x;
    coordonneY = player.sprite.y;

    coordoneetext = new Sprite(
        player.sprite.x - windowWidth / 2 + 1000,
        player.sprite.y - windowHeight / 2 + 500,
        0,
        0
    );
    coordoneetext.textSize = 40;
    coordoneetext.text = "Coordonee:" + coordonneX + " , " + coordonneY;
    coordoneetext.collider = "none";
    coordoneetext.textColor = "white";
    coordoneetext.layer = 1000000;

    let reference = new Sprite(windowWidth / 2 + 100, windowHeight / 2);
    reference.collider = "static";



    iles.functions.create();
}



function draw() {
    background("skyblue");

    if (world.timeScale === 1) {
        if (timerseconde == 60) {
            timermillieseconde = 0;
            timerseconde = 0;
            timerminute++;
        } else {
            if (timermillieseconde == 60) {
                timermillieseconde = 0;
                timerseconde++;
            } else {
                timermillieseconde++;
                time.text =
                    "Time : " + timerminute + "min " + timerseconde + "s";
            }
        }

        if (frameCount % 6 == 0 && arme.utility.recharge > 0.0) {
            console.log(arme.utility.recharge);
            arme.utility.recharge -= 0.1;
            arme.utility.recharge = Math.round(arme.utility.recharge * 10) / 10;
            reload.text = "Reload : " + arme.utility.recharge.toFixed(1);
        }

        time.x = player.sprite.x - windowWidth / 2 + 180;
        time.y = player.sprite.y - windowHeight / 2 + 50;

        reload.x = player.sprite.x - windowWidth / 2 + 180;
        reload.y = player.sprite.y - windowHeight / 2 + 100;

        niveautext.text = "Niveau : " + player.xp.niveau;
        exptext.text = "Exp : " + player.xp.experience;

        niveautext.x = player.sprite.x - windowWidth / 2 + 180;
        niveautext.y = player.sprite.y - windowHeight / 2 + 150;

        exptext.x = player.sprite.x - windowWidth / 2 + 180;
        exptext.y = player.sprite.y - windowHeight / 2 + 200;

        textvie.text = "Vie : " + player.stats.bateau.vie;
        textvie.x = player.sprite.x + windowWidth / 2 - 180;
        textvie.y = player.sprite.y - windowHeight / 2 + 50;

        coordonneX = Math.floor(player.sprite.x);
        coordonneY = Math.floor(player.sprite.y);
        coordoneetext.text = "X:" + coordonneX + " , Y:" + coordonneY;
        coordoneetext.x = player.sprite.x;
        coordoneetext.y = player.sprite.y - windowHeight / 2 + 50;

        camera.x = player.sprite.x;
        camera.y = player.sprite.y;

        player.functions.runAll();
        viseur.functions.runAll();
        arme.functions.runAll();
        reticule.functions.runAll();
        projectile.functions.runAll();
        spawnRoutine.functions.runAll();
        expblock.functions.runAll();
        iles.functions.runAll();
        interniveau.runAll();
        vieblock.functions.runAll();

        player.sprite.layer = 100;
        viseur.sprite.layer = 101;
    } else {

        interniveau.run();
    }
}
