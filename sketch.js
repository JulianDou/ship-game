let player = {
    stats: {
        bateau: {
            vie: 100,
            vieMax: 100,
            vitesse: 2.5,
            maniabilite: 1.5,
            collision: 1.0,
            taille: 1.0, // Taille doit être la valeur qu'on donnera à scale
            resistance: {
                // Les résistances sont des pourcentages (1 = 100% de dégâts subis)
                feu: 1.0,
                degats: 1.0,
            },
            niveau: 1,
            experience: 0,
            expMax: 100,
            expMult: 1,
        },
        arme: {
            degats: {
                base: 40.0,
                feu: 0.0, // La quantité de dégâts qu'inflige le feu chaque seconde
                dureeFeu: 5, // En secondes
            },
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
            if (player.stats.bateau.experience >= player.stats.bateau.expMax) {
                player.stats.bateau.experience = 0;
                player.stats.bateau.niveau += 1;
                player.stats.bateau.expMax = player.stats.bateau.expMax + 50;
                interniveaucheck= true;
                interniveau.initialize();
                
            }
        },
  
        checktouch: function () {
              for (let boulet of projectile.utility.projectiles.filter(b => b.tireur == "ennemi")) {
                  if (player.sprite.overlaps(boulet)) {
                      if (player.stats.bateau.vie >= boulet.vie) {
                          player.stats.bateau.vie -= boulet.vie;
                          boulet.vie = 0;
                      } else {
                          let vieavant = player.stats.bateau.vie;
                          player.stats.bateau.vie -= boulet.vie;
                          boulet.vie -= vieavant;
                      }
                      if (boulet.vie <= 0) {
                          projectile.functions.createExplosion(boulet.x, boulet.y);
                          boulet.remove();
                          projectile.utility.projectiles.splice(
                              projectile.utility.projectiles.indexOf(boulet),
                              1
                          );
                      }
                  }
              }
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
                boulet.vie = player.stats.arme.degats.base;
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
                    player.stats.bateau.experience += expBlock.experience;
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
        lightGreen: {
            color: "lightgreen",
            scale: 0.4,
            experience: 10,
            image: "assets/exp-2.png",
        },
        green: {
            color: "green",
            scale: 0.6,
            experience: 50,
            image: "assets/exp2-2.png",
        },
        darkGreen: {
            color: "cyan",
            scale: 0.8,
            experience: 100,
            image: "assets/exp3-2.png",
        },
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
                      base: 10.0,
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
                      base: 5.0,
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
                  vie: 20,
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
                      base: 5.0,
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
                  random(player.sprite.x - windowWidth, player.sprite.x + windowWidth),
                  random(player.sprite.y - windowHeight, player.sprite.y + windowHeight)
              );
  
              mob.stats = mobStats;
              mob.sensRotation = floor(random(0, 2));
              mob.distanceCible = floor(random(200, 400));
              mob.touche = false;
              mob.id = ennemi.utility.mobcount++;
  
              mob.detecmobright = new Sprite(mob.x + 100, mob.y + 35);
              mob.detecmobright.width = 120;
              mob.detecmobright.height = 35;
              mob.detecmobright.collider = "none";
              mob.detecmobright.color = "red";
              mob.detecmobright.opacity = 0;
              mob.detecmobright.offset.x = 60;
              mob.detecmobright.offset.y = 17.5;
  
              mob.detecmobleft = new Sprite(mob.x + 100, mob.y - 35);
              mob.detecmobleft.width = 120;
              mob.detecmobleft.height = 35;
              mob.detecmobleft.collider = "none";
              mob.detecmobleft.color = "green";
              mob.detecmobleft.opacity = 0;
              mob.detecmobleft.offset.x = 60;
              mob.detecmobleft.offset.y = -17.5;
  
              mob.functions = {
                  mouvement: function () {
                      let distance = dist(mob.x, mob.y, player.sprite.x, player.sprite.y);
                      if (distance > mob.distanceCible) {
                          mob.rotateTowards(player.sprite, 0.1, 0);
                          mob.direction = mob.rotation;
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
                      mob.speed = mob.stats.bateau.vitesse;
  
                      mob.detecmobright.x = mob.x;
                      mob.detecmobright.y = mob.y;
                      mob.detecmobright.rotation = mob.rotation;
  
                      mob.detecmobleft.x = mob.x;
                      mob.detecmobleft.y = mob.y;
                      mob.detecmobleft.rotation = mob.rotation;
                  },
  
                  update: function () {
                      mob.functions.mouvement();
  
                      if (frameCount % 15 == 0) {
                          spawnRoutine.utility.functions.createVague(mob.x, mob.y);
                      }
  
                      if (mob.stats.bateau.vie <= 0) {
                          mob.functions.die();
                      }
  
                      mob.functions.checkHit();
                      mob.functions.tir();
                      mob.functions.checkcollision();
                  },
  
                  checkHit: function () {
                      let check = false;
                      for (let boulet of projectile.utility.projectiles.filter(b => b.tireur == "player")) {
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
                                      projectile.functions.createExplosion(boulet.x, boulet.y);
                                      boulet.remove();
                                      projectile.utility.projectiles.splice(
                                          projectile.utility.projectiles.indexOf(boulet),
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
                      expblock.functions.dropEXP(mob.stats.bateau.xpDrop, mob.x, mob.y);
                      spawnRoutine.utility.functions.killMob(mob.id);
                  },
  
                  checkcollision: function () {
                      for (let ile of iles.utility.iles) {
                          for (let sprite of ile) {
                              if (mob.detecmobright.overlaps(sprite)) {
                                  mob.rotation += 45;
                              } else if (mob.detecmobleft.overlaps(sprite)) {
                                  mob.rotation -= 45;
                              }
                          }
                      }
                  },
  
                  tir: function () {
                      let distance = dist(mob.x, mob.y, player.sprite.x, player.sprite.y);
                      if ((frameCount % (60 * mob.stats.arme.recharge)) == 0 && distance < mob.stats.arme.portee) {
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
                              boulet.porteeMax = mob.stats.arme.portee + random(-10, 10);
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
                              boulet.direction += random(-mob.stats.arme.dispersion / 2, mob.stats.arme.dispersion / 2);
                              boulet.direction += random(-mob.stats.arme.precision, mob.stats.arme.precision);
                              boulet.speed = mob.stats.arme.vitesse;
                              projectile.utility.projectiles.push(boulet);
                          }
                      }
                      }
                  }
              
  
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
        ennemisMax: 5,
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
                        spawnRoutine.utility.ennemis[i].detecmobright.remove();
                        spawnRoutine.utility.ennemis[i].detecmobleft.remove();
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
  
            if (timerminute % 3 === 0 && timerminute !== 0 && timerseconde === 0 && !spawnRoutine.utility.increased) {
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
                    ennemi.detecmobright.remove();
                    ennemi.detecmobleft.remove();
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
            text.y =
                player.sprite.y -
                windowHeight / 2 +
                300 +
                interniveau.utility.textamelioration.indexOf(text) * 50;
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
            if (interniveau.utility.smallDiamond[i].mouse.pressed()) {
                console.log(interniveau.utility.smallDiamondtext[i].text);
                interniveau.createtext(
                    interniveau.utility.smallDiamondtext[i].text
                );
                player.stats.bateau.experience += 10;
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
                break;
            }
        }
      if (interniveau.utility.buttonpast && interniveau.utility.buttonpast.mouse.pressed()) {
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
          player.stats.bateau.vie = player.stats.bateau.vieMax;
      }
    },
  
    initialize: function () {
        world.timeScale = 0;
        let centerX = player.sprite.x;
        let centerY = player.sprite.y;
        let size = 600; // Size of the large diamond
  
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
  
        buttonpast.layer = 100000000;
        buttonpast.text = "Regagnez vos PV";
        buttonpast.textSize = 40;
        buttonpast.textColor = "white";
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
  
        interniveau.utility.largeDiamond = largeDiamond;
  
        // Create the four smaller diamonds
        let smallSize = size / 2.2;
        let offsets = [
            { x: 215, y: 0 },
            { x: -215, y: 0 },
            { x: 0, y: 215 },
            { x: 0, y: -215 },
        ];
  
        let words = [
            "yes",
            "youpe",
            "gabriel",
            "gerad",
            "abricot",
            "pomme",
            "poire",
            "banane",
            "fraise",
            "framboise",
            "mure",
            "cassis",
            "cerise",
            "peche",
            "abricot",
            "raisin",
            "melon",
            "pasteque",
            "ananas",
            "kiwi",
            "mangue",
            "papaye",
            "avocat",
            "citron",
            "orange",
            "mandarine",
            "pamplemousse",
            "grenade",
            "figue",
            "prune",
            "mirabelle",
            "reine-claude",
            "noix",
            "noisette",
            "amande",
            "pistache",
            "cacahuete",
            "chataigne",
            "noix de coco",
            "cacao",
            "vanille",
            "cannelle",
            "gingembre",
            "curcuma",
            "moutarde",
            "paprika",
            "piment",
            "poivre",
            "sel",
            "sucre",
            "miel",
            "sirop",
            "confiture",
            "compote",
            "gelée",
            "marmelade",
            "pate",
            "pate de fruit",
        ];
  
        for (let offset of offsets) {
            let smallDiamond = new Sprite(
                centerX + offset.x,
                centerY + offset.y
            );
            smallDiamond.width = smallSize;
            smallDiamond.height = smallSize;
            smallDiamond.rotation = 45;
            smallDiamond.layer = 100000000;
            smallDiamond.color = "gray";
            interniveau.utility.smallDiamond.push(smallDiamond);
            let textrandom = random(words);
  
            let smallDiamondtext = new Sprite(
                centerX + offset.x,
                centerY + offset.y,
                0,
                0
            );
            smallDiamondtext.text = textrandom;
            smallDiamondtext.textSize = 50;
            smallDiamondtext.textColor = "white";
  
            interniveau.utility.smallDiamondtext.push(smallDiamondtext);
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
                      if (player.stats.bateau.vie + vieBlock.vie > player.stats.bateau.vieMax) {
                          player.stats.bateau.vie = player.stats.bateau.vieMax;
                          vieBlock.remove();
                      vieblock.utility.vieblock.splice(i, 1);
                      } else{
                      player.stats.bateau.vie += vieBlock.vie;
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
          }
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
    niveautext.text = "Niveau : " + player.stats.bateau.niveau;
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
    exptext.text = "Exp : " + player.stats.bateau.experience;
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
  
    backup.utility.functions.initialize();
  
    iles.functions.create();
  }
  
  let backup = {
    utility: {
        collid: "static",
        opa: 0,
        menu: false,
        situaworld: false,
  
        functions: {
            initialize: function () {
                let yOffset = 80;
                let ySpacing = 100;
                let xOffSet = player.sprite.x + windowWidth / 2 - 200;
  
                collid = backup.utility.collid;
                opa = backup.utility.opa;
  
                this.textspeed = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textspeed.textSize = 30;
                this.textspeed.text = "Speed : " + player.stats.bateau.vitesse;
                this.textspeed.collider = collid;
                this.textspeed.textColor = "white";
                this.textspeed.layer = 100000000;
                this.textspeed.opacity = opa;
  
                this.buttonmore = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonmore.text = "+";
                this.buttonmore.textSize = 30;
                this.buttonmore.color = "white";
                this.buttonmore.collider = collid;
                this.buttonmore.layer = 100000000;
                this.buttonmore.opacity = opa;
  
                this.buttonless = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonless.text = "-";
                this.buttonless.textSize = 30;
                this.buttonless.color = "white";
                this.buttonless.collider = collid;
                this.buttonless.layer = 100000000;
                this.buttonless.opacity = opa;
  
                yOffset += ySpacing;
  
                this.textVie = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textVie.textSize = 30;
                this.textVie.text = "Vie Max : " + player.stats.bateau.vieMax;
                this.textVie.collider = collid;
                this.textVie.textColor = "white";
                this.textVie.layer = 100000000;
                this.textVie.opacity = opa;
  
                this.buttonMoreVie = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonMoreVie.text = "+";
                this.buttonMoreVie.textSize = 30;
                this.buttonMoreVie.color = "white";
                this.buttonMoreVie.collider = collid;
                this.buttonMoreVie.layer = 100000000;
                this.buttonMoreVie.opacity = opa;
  
                this.buttonLessVie = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonLessVie.text = "-";
                this.buttonLessVie.textSize = 30;
                this.buttonLessVie.color = "white";
                this.buttonLessVie.collider = collid;
                this.buttonLessVie.layer = 100000000;
                this.buttonLessVie.opacity = opa;
  
                yOffset += ySpacing;
  
                this.textManiabilite = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textManiabilite.textSize = 30;
                this.textManiabilite.text =
                    "Maniabilité : " + player.stats.bateau.maniabilite;
                this.textManiabilite.collider = collid;
                this.textManiabilite.textColor = "white";
                this.textManiabilite.layer = 100000000;
                this.textManiabilite.opacity = opa;
  
                this.buttonMoreManiabilite = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonMoreManiabilite.text = "+";
                this.buttonMoreManiabilite.textSize = 30;
                this.buttonMoreManiabilite.color = "white";
                this.buttonMoreManiabilite.collider = collid;
                this.buttonMoreManiabilite.layer = 100000000;
                this.buttonMoreManiabilite.opacity = opa;
  
                this.buttonLessManiabilite = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonLessManiabilite.text = "-";
                this.buttonLessManiabilite.textSize = 30;
                this.buttonLessManiabilite.color = "white";
                this.buttonLessManiabilite.collider = collid;
                this.buttonLessManiabilite.layer = 100000000;
                this.buttonLessManiabilite.opacity = opa;
  
                yOffset += ySpacing;
  
                this.textTaille = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textTaille.textSize = 30;
                this.textTaille.text = "Taille : " + player.stats.bateau.taille;
                this.textTaille.collider = collid;
                this.textTaille.textColor = "white";
                this.textTaille.layer = 100000000;
                this.textTaille.opacity = opa;
  
                this.buttonMoreTaille = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonMoreTaille.text = "+";
                this.buttonMoreTaille.textSize = 30;
                this.buttonMoreTaille.color = "white";
                this.buttonMoreTaille.collider = collid;
                this.buttonMoreTaille.layer = 100000000;
                this.buttonMoreTaille.opacity = opa;
  
                this.buttonLessTaille = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonLessTaille.text = "-";
                this.buttonLessTaille.textSize = 30;
                this.buttonLessTaille.color = "white";
                this.buttonLessTaille.collider = collid;
                this.buttonLessTaille.layer = 100000000;
                this.buttonLessTaille.opacity = opa;
  
                yOffset += ySpacing;
  
                this.textResistance = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textResistance.textSize = 30;
                this.textResistance.text =
                    "Résistance : " + player.stats.bateau.resistance.degats;
                this.textResistance.collider = collid;
                this.textResistance.textColor = "white";
                this.textResistance.layer = 100000000;
                this.textResistance.opacity = opa;
  
                this.buttonMoreResistance = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonMoreResistance.text = "+";
                this.buttonMoreResistance.textSize = 30;
                this.buttonMoreResistance.color = "white";
                this.buttonMoreResistance.collider = collid;
                this.buttonMoreResistance.layer = 100000000;
                this.buttonMoreResistance.opacity = opa;
  
                this.buttonLessResistance = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonLessResistance.text = "-";
                this.buttonLessResistance.textSize = 30;
                this.buttonLessResistance.color = "white";
                this.buttonLessResistance.collider = collid;
                this.buttonLessResistance.layer = 100000000;
                this.buttonLessResistance.opacity = opa;
  
                yOffset += ySpacing;
  
                this.textResistanceFeu = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textResistanceFeu.textSize = 30;
                this.textResistanceFeu.text =
                    "Résistance Feu : " + player.stats.bateau.resistance.feu;
                this.textResistanceFeu.collider = collid;
                this.textResistanceFeu.textColor = "white";
                this.textResistanceFeu.layer = 100000000;
                this.textResistanceFeu.opacity = opa;
  
                this.buttonMoreResistanceFeu = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonMoreResistanceFeu.text = "+";
                this.buttonMoreResistanceFeu.textSize = 30;
                this.buttonMoreResistanceFeu.color = "white";
                this.buttonMoreResistanceFeu.collider = collid;
                this.buttonMoreResistanceFeu.layer = 100000000;
                this.buttonMoreResistanceFeu.opacity = opa;
  
                this.buttonLessResistanceFeu = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonLessResistanceFeu.text = "-";
                this.buttonLessResistanceFeu.textSize = 30;
                this.buttonLessResistanceFeu.color = "white";
                this.buttonLessResistanceFeu.collider = collid;
                this.buttonLessResistanceFeu.layer = 100000000;
                this.buttonLessResistanceFeu.opacity = opa;
  
                yOffset += ySpacing;
  
                this.textDegatsBase = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textDegatsBase.textSize = 30;
                this.textDegatsBase.text =
                    "Dégâts Base : " + player.stats.arme.degats.base;
                this.textDegatsBase.collider = collid;
                this.textDegatsBase.textColor = "white";
                this.textDegatsBase.layer = 100000000;
                this.textDegatsBase.opacity = opa;
  
                this.buttonMoreDegatsBase = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonMoreDegatsBase.text = "+";
                this.buttonMoreDegatsBase.textSize = 30;
                this.buttonMoreDegatsBase.color = "white";
                this.buttonMoreDegatsBase.collider = collid;
                this.buttonMoreDegatsBase.layer = 100000000;
                this.buttonMoreDegatsBase.opacity = opa;
  
                this.buttonLessDegatsBase = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonLessDegatsBase.text = "-";
                this.buttonLessDegatsBase.textSize = 30;
                this.buttonLessDegatsBase.color = "white";
                this.buttonLessDegatsBase.collider = collid;
                this.buttonLessDegatsBase.layer = 100000000;
                this.buttonLessDegatsBase.opacity = opa;
  
                yOffset += ySpacing;
  
                this.textDegatsFeu = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textDegatsFeu.textSize = 30;
                this.textDegatsFeu.text =
                    "Dégâts Feu : " + player.stats.arme.degats.feu;
                this.textDegatsFeu.collider = collid;
                this.textDegatsFeu.textColor = "white";
                this.textDegatsFeu.layer = 100000000;
                this.textDegatsFeu.opacity = opa;
  
                this.buttonMoreDegatsFeu = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonMoreDegatsFeu.text = "+";
                this.buttonMoreDegatsFeu.textSize = 30;
                this.buttonMoreDegatsFeu.color = "white";
                this.buttonMoreDegatsFeu.collider = collid;
                this.buttonMoreDegatsFeu.layer = 100000000;
                this.buttonMoreDegatsFeu.opacity = opa;
  
                this.buttonLessDegatsFeu = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonLessDegatsFeu.text = "-";
                this.buttonLessDegatsFeu.textSize = 30;
                this.buttonLessDegatsFeu.color = "white";
                this.buttonLessDegatsFeu.collider = collid;
                this.buttonLessDegatsFeu.layer = 100000000;
                this.buttonLessDegatsFeu.opacity = opa;
  
                //ligne 2
                xOffSet = xOffSet - 300;
                yOffset = 80;
  
                this.textRecharge = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textRecharge.textSize = 30;
                this.textRecharge.text =
                    "Recharge : " + player.stats.arme.recharge;
                this.textRecharge.collider = collid;
                this.textRecharge.textColor = "white";
                this.textRecharge.layer = 100000000;
                this.textRecharge.opacity = opa;
  
                this.buttonMoreRecharge = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonMoreRecharge.text = "+";
                this.buttonMoreRecharge.textSize = 30;
                this.buttonMoreRecharge.color = "white";
                this.buttonMoreRecharge.collider = collid;
                this.buttonMoreRecharge.layer = 100000000;
                this.buttonMoreRecharge.opacity = opa;
  
                this.buttonLessRecharge = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonLessRecharge.text = "-";
                this.buttonLessRecharge.textSize = 30;
                this.buttonLessRecharge.color = "white";
                this.buttonLessRecharge.collider = collid;
                this.buttonLessRecharge.layer = 100000000;
                this.buttonLessRecharge.opacity = opa;
  
                yOffset += ySpacing;
  
                this.textVitesse = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textVitesse.textSize = 30;
                this.textVitesse.text =
                    "Vitesse : " + player.stats.arme.vitesse;
                this.textVitesse.collider = collid;
                this.textVitesse.textColor = "white";
                this.textVitesse.layer = 100000000;
                this.textVitesse.opacity = opa;
  
                this.buttonMoreVitesse = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonMoreVitesse.text = "+";
                this.buttonMoreVitesse.textSize = 30;
                this.buttonMoreVitesse.color = "white";
                this.buttonMoreVitesse.collider = collid;
                this.buttonMoreVitesse.layer = 100000000;
                this.buttonMoreVitesse.opacity = opa;
  
                this.buttonLessVitesse = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonLessVitesse.text = "-";
                this.buttonLessVitesse.textSize = 30;
                this.buttonLessVitesse.color = "white";
                this.buttonLessVitesse.collider = collid;
                this.buttonLessVitesse.layer = 100000000;
                this.buttonLessVitesse.opacity = opa;
  
                yOffset += ySpacing;
  
                this.textDispersion = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textDispersion.textSize = 30;
                this.textDispersion.text =
                    "Dispersion : " + player.stats.arme.dispersion;
                this.textDispersion.collider = collid;
                this.textDispersion.textColor = "white";
                this.textDispersion.layer = 100000000;
                this.textDispersion.opacity = opa;
  
                this.buttonMoreDispersion = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonMoreDispersion.text = "+";
                this.buttonMoreDispersion.textSize = 30;
                this.buttonMoreDispersion.color = "white";
                this.buttonMoreDispersion.collider = collid;
                this.buttonMoreDispersion.layer = 100000000;
                this.buttonMoreDispersion.opacity = opa;
  
                this.buttonLessDispersion = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonLessDispersion.text = "-";
                this.buttonLessDispersion.textSize = 30;
                this.buttonLessDispersion.color = "white";
                this.buttonLessDispersion.collider = collid;
                this.buttonLessDispersion.layer = 100000000;
                this.buttonLessDispersion.opacity = opa;
  
                yOffset += ySpacing;
  
                this.textPortee = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textPortee.textSize = 30;
                this.textPortee.text = "Portée : " + player.stats.arme.portee;
                this.textPortee.collider = collid;
                this.textPortee.textColor = "white";
                this.textPortee.layer = 100000000;
                this.textPortee.opacity = opa;
  
                this.buttonMorePortee = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonMorePortee.text = "+";
                this.buttonMorePortee.textSize = 30;
                this.buttonMorePortee.color = "white";
                this.buttonMorePortee.collider = collid;
                this.buttonMorePortee.layer = 100000000;
                this.buttonMorePortee.opacity = opa;
  
                this.buttonLessPortee = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonLessPortee.text = "-";
                this.buttonLessPortee.textSize = 30;
                this.buttonLessPortee.color = "white";
                this.buttonLessPortee.collider = collid;
                this.buttonLessPortee.layer = 100000000;
                this.buttonLessPortee.opacity = opa;
  
                yOffset += ySpacing;
  
                this.textProjectiles = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textProjectiles.textSize = 30;
                this.textProjectiles.text =
                    "Projectiles : " + player.stats.arme.projectiles;
                this.textProjectiles.collider = collid;
                this.textProjectiles.textColor = "white";
                this.textProjectiles.layer = 100000000;
                this.textProjectiles.opacity = opa;
  
                this.buttonMoreProjectiles = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonMoreProjectiles.text = "+";
                this.buttonMoreProjectiles.textSize = 30;
                this.buttonMoreProjectiles.color = "white";
                this.buttonMoreProjectiles.collider = collid;
                this.buttonMoreProjectiles.layer = 100000000;
                this.buttonMoreProjectiles.opacity = opa;
  
                this.buttonLessProjectiles = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonLessProjectiles.text = "-";
                this.buttonLessProjectiles.textSize = 30;
                this.buttonLessProjectiles.color = "white";
                this.buttonLessProjectiles.collider = collid;
                this.buttonLessProjectiles.layer = 100000000;
                this.buttonLessProjectiles.opacity = opa;
  
                yOffset += ySpacing;
  
                this.textTailleArme = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textTailleArme.textSize = 30;
                this.textTailleArme.text =
                    "Taille Arme : " + player.stats.arme.taille;
                this.textTailleArme.collider = collid;
                this.textTailleArme.textColor = "white";
                this.textTailleArme.layer = 100000000;
                this.textTailleArme.opacity = opa;
  
                this.buttonMoreTailleArme = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonMoreTailleArme.text = "+";
                this.buttonMoreTailleArme.textSize = 30;
                this.buttonMoreTailleArme.color = "white";
                this.buttonMoreTailleArme.collider = collid;
                this.buttonMoreTailleArme.layer = 100000000;
                this.buttonMoreTailleArme.opacity = opa;
  
                this.buttonLessTailleArme = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonLessTailleArme.text = "-";
                this.buttonLessTailleArme.textSize = 30;
                this.buttonLessTailleArme.color = "white";
                this.buttonLessTailleArme.collider = collid;
                this.buttonLessTailleArme.layer = 100000000;
                this.buttonLessTailleArme.opacity = opa;
  
                yOffset += ySpacing;
  
                this.textPenetration = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textPenetration.textSize = 30;
                this.textPenetration.text =
                    "Pénétration : " + player.stats.arme.penetration;
                this.textPenetration.collider = collid;
                this.textPenetration.textColor = "white";
                this.textPenetration.layer = 100000000;
                this.textPenetration.opacity = opa;
  
                this.buttonMorePenetration = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonMorePenetration.text = "+";
                this.buttonMorePenetration.textSize = 30;
                this.buttonMorePenetration.color = "white";
                this.buttonMorePenetration.collider = collid;
                this.buttonMorePenetration.layer = 100000000;
                this.buttonMorePenetration.opacity = opa;
  
                this.buttonLessPenetration = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonLessPenetration.text = "-";
                this.buttonLessPenetration.textSize = 30;
                this.buttonLessPenetration.color = "white";
                this.buttonLessPenetration.collider = collid;
                this.buttonLessPenetration.layer = 100000000;
                this.buttonLessPenetration.opacity = opa;
  
                yOffset += ySpacing;
  
                this.textRicochets = new Sprite(
                    xOffSet,
                    player.sprite.y - windowHeight / 2 + yOffset,
                    0,
                    0
                );
                this.textRicochets.textSize = 30;
                this.textRicochets.text =
                    "Ricochets : " + player.stats.arme.ricochets;
                this.textRicochets.collider = collid;
                this.textRicochets.textColor = "white";
                this.textRicochets.layer = 100000000;
                this.textRicochets.opacity = opa;
  
                this.buttonMoreRicochets = new Sprite(
                    xOffSet + 50,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonMoreRicochets.text = "+";
                this.buttonMoreRicochets.textSize = 30;
                this.buttonMoreRicochets.color = "white";
                this.buttonMoreRicochets.collider = collid;
                this.buttonMoreRicochets.layer = 100000000;
                this.buttonMoreRicochets.opacity = opa;
  
                this.buttonLessRicochets = new Sprite(
                    xOffSet + 100,
                    player.sprite.y - windowHeight / 2 + yOffset + 50,
                    50,
                    50
                );
                this.buttonLessRicochets.text = "-";
                this.buttonLessRicochets.textSize = 30;
                this.buttonLessRicochets.color = "white";
                this.buttonLessRicochets.collider = collid;
                this.buttonLessRicochets.layer = 100000000;
                this.buttonLessRicochets.opacity = opa;
  
                this.buttonmenu = new Sprite(
                    player.sprite.x - windowWidth / 2 + 180,
                    player.sprite.y + windowHeight / 2 - 100,
                    150,
                    50
                );
                this.buttonmenu.textSize = 40;
                this.buttonmenu.text = "Menu";
                this.buttonmenu.collider = collid;
                this.buttonmenu.textColor = "white";
                this.buttonmenu.color = "skyblue";
                this.buttonmenu.layer = 100000000;
                this.buttonmenu.stroke = "white";
                this.buttonmenu.strokeWeight = 2;
            },
  
            run() {
                let xOffSet = player.sprite.x + windowWidth / 2 - 200;
                let back = backup.utility.functions;
  
                // Update button positions
  
                back.textspeed.x = xOffSet;
                back.textspeed.y = player.sprite.y - windowHeight / 2 + 80;
  
                back.textVie.x = xOffSet;
                back.textVie.y = player.sprite.y - windowHeight / 2 + 180;
  
                back.textManiabilite.x = xOffSet;
                back.textManiabilite.y =
                    player.sprite.y - windowHeight / 2 + 280;
  
                back.textTaille.x = xOffSet;
                back.textTaille.y = player.sprite.y - windowHeight / 2 + 380;
  
                back.textResistance.x = xOffSet;
                back.textResistance.y =
                    player.sprite.y - windowHeight / 2 + 480;
  
                back.textResistanceFeu.x = xOffSet;
                back.textResistanceFeu.y =
                    player.sprite.y - windowHeight / 2 + 580;
  
                back.buttonmore.x = xOffSet + 100;
                back.buttonmore.y = player.sprite.y - windowHeight / 2 + 130;
  
                back.buttonless.x = xOffSet + 50;
                back.buttonless.y = player.sprite.y - windowHeight / 2 + 130;
  
                back.buttonMoreVie.x = xOffSet + 100;
                back.buttonMoreVie.y = player.sprite.y - windowHeight / 2 + 230;
  
                back.buttonLessVie.x = xOffSet + 50;
                back.buttonLessVie.y = player.sprite.y - windowHeight / 2 + 230;
  
                back.buttonMoreManiabilite.x = xOffSet + 100;
                back.buttonMoreManiabilite.y =
                    player.sprite.y - windowHeight / 2 + 330;
  
                back.buttonLessManiabilite.x = xOffSet + 50;
                back.buttonLessManiabilite.y =
                    player.sprite.y - windowHeight / 2 + 330;
  
                back.buttonMoreTaille.x = xOffSet + 100;
                back.buttonMoreTaille.y =
                    player.sprite.y - windowHeight / 2 + 430;
  
                back.buttonLessTaille.x = xOffSet + 50;
                back.buttonLessTaille.y =
                    player.sprite.y - windowHeight / 2 + 430;
  
                back.buttonMoreResistance.x = xOffSet + 100;
                back.buttonMoreResistance.y =
                    player.sprite.y - windowHeight / 2 + 530;
  
                back.buttonLessResistance.x = xOffSet + 50;
                back.buttonLessResistance.y =
                    player.sprite.y - windowHeight / 2 + 530;
  
                back.buttonMoreResistanceFeu.x = xOffSet + 100;
                back.buttonMoreResistanceFeu.y =
                    player.sprite.y - windowHeight / 2 + 630;
  
                back.buttonLessResistanceFeu.x = xOffSet + 50;
                back.buttonLessResistanceFeu.y =
                    player.sprite.y - windowHeight / 2 + 630;
  
                back.textDegatsBase.x = xOffSet + 50;
                back.textDegatsBase.y =
                    player.sprite.y - windowHeight / 2 + 700;
  
                back.buttonMoreDegatsBase.x = xOffSet + 100;
                back.buttonMoreDegatsBase.y =
                    player.sprite.y - windowHeight / 2 + 750;
  
                back.buttonLessDegatsBase.x = xOffSet + 50;
                back.buttonLessDegatsBase.y =
                    player.sprite.y - windowHeight / 2 + 750;
  
                back.textDegatsFeu.x = xOffSet + 50;
                back.textDegatsFeu.y = player.sprite.y - windowHeight / 2 + 800;
  
                back.buttonMoreDegatsFeu.x = xOffSet + 100;
                back.buttonMoreDegatsFeu.y =
                    player.sprite.y - windowHeight / 2 + 850;
  
                back.buttonLessDegatsFeu.x = xOffSet + 50;
                back.buttonLessDegatsFeu.y =
                    player.sprite.y - windowHeight / 2 + 850;
  
                xOffSet2 = xOffSet - 300;
                yOffset2 = 80;
  
                back.textRecharge.x = xOffSet2;
                back.textRecharge.y = player.sprite.y - windowHeight / 2 + 80;
  
                back.buttonMoreRecharge.x = xOffSet2 + 100;
                back.buttonMoreRecharge.y =
                    player.sprite.y - windowHeight / 2 + 130;
  
                back.buttonLessRecharge.x = xOffSet2 + 50;
                back.buttonLessRecharge.y =
                    player.sprite.y - windowHeight / 2 + 130;
  
                back.textVitesse.x = xOffSet2;
                back.textVitesse.y = player.sprite.y - windowHeight / 2 + 180;
  
                back.buttonMoreVitesse.x = xOffSet2 + 100;
                back.buttonMoreVitesse.y =
                    player.sprite.y - windowHeight / 2 + 230;
  
                back.buttonLessVitesse.x = xOffSet2 + 50;
                back.buttonLessVitesse.y =
                    player.sprite.y - windowHeight / 2 + 230;
  
                back.textDispersion.x = xOffSet2;
                back.textDispersion.y =
                    player.sprite.y - windowHeight / 2 + 280;
  
                back.buttonMoreDispersion.x = xOffSet2 + 100;
                back.buttonMoreDispersion.y =
                    player.sprite.y - windowHeight / 2 + 330;
  
                back.buttonLessDispersion.x = xOffSet2 + 50;
                back.buttonLessDispersion.y =
                    player.sprite.y - windowHeight / 2 + 330;
  
                back.textPortee.x = xOffSet2;
                back.textPortee.y = player.sprite.y - windowHeight / 2 + 380;
  
                back.buttonMorePortee.x = xOffSet2 + 100;
                back.buttonMorePortee.y =
                    player.sprite.y - windowHeight / 2 + 430;
  
                back.buttonLessPortee.x = xOffSet2 + 50;
                back.buttonLessPortee.y =
                    player.sprite.y - windowHeight / 2 + 430;
  
                back.textProjectiles.x = xOffSet2;
                back.textProjectiles.y =
                    player.sprite.y - windowHeight / 2 + 480;
  
                back.buttonMoreProjectiles.x = xOffSet2 + 100;
                back.buttonMoreProjectiles.y =
                    player.sprite.y - windowHeight / 2 + 530;
  
                back.buttonLessProjectiles.x = xOffSet2 + 50;
                back.buttonLessProjectiles.y =
                    player.sprite.y - windowHeight / 2 + 530;
  
                back.textTailleArme.x = xOffSet2;
                back.textTailleArme.y =
                    player.sprite.y - windowHeight / 2 + 580;
  
                back.buttonMoreTailleArme.x = xOffSet2 + 100;
                back.buttonMoreTailleArme.y =
                    player.sprite.y - windowHeight / 2 + 630;
  
                back.buttonLessTailleArme.x = xOffSet2 + 50;
                back.buttonLessTailleArme.y =
                    player.sprite.y - windowHeight / 2 + 630;
  
                back.textPenetration.x = xOffSet2;
                back.textPenetration.y =
                    player.sprite.y - windowHeight / 2 + 680;
  
                back.buttonMorePenetration.x = xOffSet2 + 100;
                back.buttonMorePenetration.y =
                    player.sprite.y - windowHeight / 2 + 730;
  
                back.buttonLessPenetration.x = xOffSet2 + 50;
                back.buttonLessPenetration.y =
                    player.sprite.y - windowHeight / 2 + 730;
  
                back.textRicochets.x = xOffSet2;
                back.textRicochets.y = player.sprite.y - windowHeight / 2 + 780;
  
                back.buttonMoreRicochets.x = xOffSet2 + 100;
                back.buttonMoreRicochets.y =
                    player.sprite.y - windowHeight / 2 + 830;
  
                back.buttonLessRicochets.x = xOffSet2 + 50;
                back.buttonLessRicochets.y =
                    player.sprite.y - windowHeight / 2 + 830;
  
                back.buttonmenu.x = player.sprite.x - windowWidth / 2 + 180;
                back.buttonmenu.y = player.sprite.y + windowHeight / 2 - 100;
  
                menu = false;
                situaworld = false;
  
                if (
                    back.buttonmenu.mouse.pressed() &&
                    backup.utility.menu === true
                ) {
                    opa = 0;
                    collid = "none";
                    backup.utility.menu = false;
                    back.buttonmenu.color = "skyblue";
                    world.timeScale = 1;
                } else if (
                    back.buttonmenu.mouse.pressed() &&
                    backup.utility.menu === false
                ) {
                    backup.utility.menu = true;
                    opa = 1;
                    collid = "static";
                    back.buttonmenu.color = "blue";
                    world.timeScale = 0;
                }
  
                if (backup.utility.menu === false) {
                    collid = "none";
                }
  
                back.buttonmore.opacity = opa;
                back.buttonmore.collider = collid;
                back.buttonless.opacity = opa;
                back.buttonless.collider = collid;
                back.buttonMoreVie.opacity = opa;
                back.buttonMoreVie.collider = collid;
                back.buttonLessVie.opacity = opa;
                back.buttonLessVie.collider = collid;
                back.buttonMoreManiabilite.opacity = opa;
                back.buttonMoreManiabilite.collider = collid;
                back.buttonLessManiabilite.opacity = opa;
                back.buttonLessManiabilite.collider = collid;
                back.buttonMoreTaille.opacity = opa;
  
                back.buttonMoreTaille.collider = collid;
                back.buttonLessTaille.opacity = opa;
                back.buttonLessTaille.collider = collid;
                back.buttonMoreResistance.opacity = opa;
                back.buttonMoreResistance.collider = collid;
                back.buttonLessResistance.opacity = opa;
                back.buttonLessResistance.collider = collid;
                back.buttonMoreResistanceFeu.opacity = opa;
                back.buttonMoreResistanceFeu.collider = collid;
                back.buttonLessResistanceFeu.opacity = opa;
                back.buttonLessResistanceFeu.collider = collid;
                back.buttonMoreDegatsBase.opacity = opa;
                back.buttonMoreDegatsBase.collider = collid;
                back.buttonLessDegatsBase.opacity = opa;
                back.buttonLessDegatsBase.collider = collid;
                back.buttonMoreDegatsFeu.opacity = opa;
                back.buttonMoreDegatsFeu.collider = collid;
                back.buttonLessDegatsFeu.opacity = opa;
                back.buttonLessDegatsFeu.collider = collid;
                back.buttonMoreRecharge.opacity = opa;
                back.buttonMoreRecharge.collider = collid;
                back.buttonLessRecharge.opacity = opa;
                back.buttonLessRecharge.collider = collid;
                back.buttonMoreVitesse.opacity = opa;
                back.buttonMoreVitesse.collider = collid;
                back.buttonLessVitesse.opacity = opa;
                back.buttonLessVitesse.collider = collid;
                back.buttonMoreDispersion.opacity = opa;
                back.buttonMoreDispersion.collider = collid;
                back.buttonLessDispersion.opacity = opa;
                back.buttonLessDispersion.collider = collid;
                back.buttonMorePortee.opacity = opa;
                back.buttonMorePortee.collider = collid;
                back.buttonLessPortee.opacity = opa;
                back.buttonLessPortee.collider = collid;
                back.buttonMoreProjectiles.opacity = opa;
                back.buttonMoreProjectiles.collider = collid;
                back.buttonLessProjectiles.opacity = opa;
                back.buttonLessProjectiles.collider = collid;
                back.buttonMoreTailleArme.opacity = opa;
                back.buttonMoreTailleArme.collider = collid;
                back.buttonLessTailleArme.opacity = opa;
                back.buttonLessTailleArme.collider = collid;
                back.buttonMorePenetration.opacity = opa;
                back.buttonMorePenetration.collider = collid;
  
                back.buttonLessPenetration.opacity = opa;
                back.buttonLessPenetration.collider = collid;
                back.buttonMoreRicochets.opacity = opa;
                back.buttonMoreRicochets.collider = collid;
                back.buttonLessRicochets.opacity = opa;
                back.buttonLessRicochets.collider = collid;
                back.textspeed.opacity = opa;
                back.textspeed.collider = collid;
                back.textVie.opacity = opa;
                back.textVie.collider = collid;
                back.textManiabilite.opacity = opa;
                back.textManiabilite.collider = collid;
                back.textTaille.opacity = opa;
                back.textTaille.collider = collid;
                back.textResistance.opacity = opa;
                back.textResistance.collider = collid;
                back.textResistanceFeu.opacity = opa;
                back.textResistanceFeu.collider = collid;
                back.textDegatsBase.opacity = opa;
                back.textDegatsBase.collider = collid;
                back.textDegatsFeu.opacity = opa;
                back.textDegatsFeu.collider = collid;
                back.textRecharge.opacity = opa;
                back.textRecharge.collider = collid;
                back.textVitesse.opacity = opa;
                back.textVitesse.collider = collid;
                back.textDispersion.opacity = opa;
                back.textDispersion.collider = collid;
                back.textPortee.opacity = opa;
                back.textPortee.collider = collid;
                back.textProjectiles.opacity = opa;
                back.textProjectiles.collider = collid;
                back.textTailleArme.opacity = opa;
                back.textTailleArme.collider = collid;
                back.textPenetration.opacity = opa;
                back.textPenetration.collider = collid;
                back.textRicochets.opacity = opa;
                back.textRicochets.collider = collid;
  
                if (back.buttonmore.mouse.pressed()) {
                    player.stats.bateau.vitesse += 0.1;
                    player.stats.bateau.vitesse = parseFloat(
                        player.stats.bateau.vitesse.toFixed(2)
                    );
                    back.textspeed.text =
                        "Speed : " + player.stats.bateau.vitesse;
                } else if (back.buttonless.mouse.pressed()) {
                    player.stats.bateau.vitesse -= 0.1;
                    player.stats.bateau.vitesse = parseFloat(
                        player.stats.bateau.vitesse.toFixed(2)
                    );
                    back.textspeed.text =
                        "Speed : " + player.stats.bateau.vitesse;
                }
  
                if (back.buttonMoreVie.mouse.pressed()) {
                    player.stats.bateau.vieMax += 10;
                    back.textVie.text = "Vie Max : " + player.stats.bateau.vieMax;
                } else if (back.buttonLessVie.mouse.pressed()) {
                    player.stats.bateau.vieMax -= 10;
                    back.textVie.text = "Vie Max : " + player.stats.bateau.vieMax;
                }
  
                if (back.buttonMoreManiabilite.mouse.pressed()) {
                    player.stats.bateau.maniabilite += 0.1;
                    player.stats.bateau.maniabilite = parseFloat(
                        player.stats.bateau.maniabilite.toFixed(2)
                    );
                    back.textManiabilite.text =
                        "Maniabilité : " + player.stats.bateau.maniabilite;
                } else if (back.buttonLessManiabilite.mouse.pressed()) {
                    player.stats.bateau.maniabilite -= 0.1;
                    player.stats.bateau.maniabilite = parseFloat(
                        player.stats.bateau.maniabilite.toFixed(2)
                    );
                    back.textManiabilite.text =
                        "Maniabilité : " + player.stats.bateau.maniabilite;
                }
  
                if (back.buttonMoreTaille.mouse.pressed()) {
                    player.stats.bateau.taille += 0.1;
                    player.stats.bateau.taille = parseFloat(
                        player.stats.bateau.taille.toFixed(2)
                    );
                    back.textTaille.text =
                        "Taille : " + player.stats.bateau.taille;
                } else if (back.buttonLessTaille.mouse.pressed()) {
                    player.stats.bateau.taille -= 0.1;
                    player.stats.bateau.taille = parseFloat(
                        player.stats.bateau.taille.toFixed(2)
                    );
                    back.textTaille.text =
                        "Taille : " + player.stats.bateau.taille;
                }
  
                if (back.buttonMoreResistance.mouse.pressed()) {
                    player.stats.bateau.resistance.degats += 0.1;
                    player.stats.bateau.resistance.degats = parseFloat(
                        player.stats.bateau.resistance.degats.toFixed(2)
                    );
                    back.textResistance.text =
                        "Résistance : " + player.stats.bateau.resistance.degats;
                } else if (back.buttonLessResistance.mouse.pressed()) {
                    player.stats.bateau.resistance.degats -= 0.1;
                    player.stats.bateau.resistance.degats = parseFloat(
                        player.stats.bateau.resistance.degats.toFixed(2)
                    );
                    back.textResistance.text =
                        "Résistance : " + player.stats.bateau.resistance.degats;
                }
  
                if (back.buttonMoreResistanceFeu.mouse.pressed()) {
                    player.stats.bateau.resistance.feu += 0.1;
                    player.stats.bateau.resistance.feu = parseFloat(
                        player.stats.bateau.resistance.feu.toFixed(2)
                    );
                    back.textResistanceFeu.text =
                        "Résistance Feu : " +
                        player.stats.bateau.resistance.feu;
                } else if (back.buttonLessResistanceFeu.mouse.pressed()) {
                    player.stats.bateau.resistance.feu -= 0.1;
                    player.stats.bateau.resistance.feu = parseFloat(
                        player.stats.bateau.resistance.feu.toFixed(2)
                    );
                    back.textResistanceFeu.text =
                        "Résistance Feu : " +
                        player.stats.bateau.resistance.feu;
                }
  
                if (back.buttonMoreDegatsBase.mouse.pressed()) {
                    player.stats.arme.degats.base += 1;
                    back.textDegatsBase.text =
                        "Dégâts Base : " + player.stats.arme.degats.base;
                } else if (back.buttonLessDegatsBase.mouse.pressed()) {
                    player.stats.arme.degats.base -= 1;
                    back.textDegatsBase.text =
                        "Dégâts Base : " + player.stats.arme.degats.base;
                }
  
                if (back.buttonMoreDegatsFeu.mouse.pressed()) {
                    player.stats.arme.degats.feu += 1;
                    back.textDegatsFeu.text =
                        "Dégâts Feu : " + player.stats.arme.degats.feu;
                } else if (back.buttonLessDegatsFeu.mouse.pressed()) {
                    player.stats.arme.degats.feu -= 1;
                    back.textDegatsFeu.text =
                        "Dégâts Feu : " + player.stats.arme.degats.feu;
                }
  
                if (back.buttonMoreRecharge.mouse.pressed()) {
                    player.stats.arme.recharge += 1;
                    back.textRecharge.text =
                        "Recharge : " + player.stats.arme.recharge;
                } else if (back.buttonLessRecharge.mouse.pressed()) {
                    player.stats.arme.recharge -= 1;
                    back.textRecharge.text =
                        "Recharge : " + player.stats.arme.recharge;
                }
  
                if (back.buttonMoreVitesse.mouse.pressed()) {
                    player.stats.arme.vitesse += 1;
                    back.textVitesse.text =
                        "Vitesse : " + player.stats.arme.vitesse;
                } else if (back.buttonLessVitesse.mouse.pressed()) {
                    player.stats.arme.vitesse -= 1;
                    back.textVitesse.text =
                        "Vitesse : " + player.stats.arme.vitesse;
                }
  
                if (back.buttonMoreDispersion.mouse.pressed()) {
                    player.stats.arme.dispersion += 1;
                    back.textDispersion.text =
                        "Dispersion : " + player.stats.arme.dispersion;
                } else if (back.buttonLessDispersion.mouse.pressed()) {
                    player.stats.arme.dispersion -= 1;
                    back.textDispersion.text =
                        "Dispersion : " + player.stats.arme.dispersion;
                }
  
                if (back.buttonMorePortee.mouse.pressed()) {
                    player.stats.arme.portee += 10;
                    back.textPortee.text =
                        "Portée : " + player.stats.arme.portee;
                } else if (back.buttonLessPortee.mouse.pressed()) {
                    player.stats.arme.portee -= 10;
                    back.textPortee.text =
                        "Portée : " + player.stats.arme.portee;
                }
  
                if (back.buttonMoreProjectiles.mouse.pressed()) {
                    player.stats.arme.projectiles += 1;
                    back.textProjectiles.text =
                        "Projectiles : " + player.stats.arme.projectiles;
                } else if (back.buttonLessProjectiles.mouse.pressed()) {
                    player.stats.arme.projectiles -= 1;
                    back.textProjectiles.text =
                        "Projectiles : " + player.stats.arme.projectiles;
                }
  
                if (back.buttonMoreTailleArme.mouse.pressed()) {
                    player.stats.arme.taille += 0.1;
                    player.stats.arme.taille = parseFloat(
                        player.stats.arme.taille.toFixed(2)
                    );
                    back.textTailleArme.text =
                        "Taille Arme : " + player.stats.arme.taille;
                } else if (back.buttonLessTailleArme.mouse.pressed()) {
                    player.stats.arme.taille -= 0.1;
                    player.stats.arme.taille = parseFloat(
                        player.stats.arme.taille.toFixed(2)
                    );
                    back.textTailleArme.text =
                        "Taille Arme : " + player.stats.arme.taille;
                }
  
                if (back.buttonMorePenetration.mouse.pressed()) {
                    player.stats.arme.penetration += 1;
                    back.textPenetration.text =
                        "Pénétration : " + player.stats.arme.penetration;
                } else if (back.buttonLessPenetration.mouse.pressed()) {
                    player.stats.arme.penetration -= 1;
                    back.textPenetration.text =
                        "Pénétration : " + player.stats.arme.penetration;
                }
  
                if (back.buttonMoreRicochets.mouse.pressed()) {
                    player.stats.arme.ricochets += 1;
                    back.textRicochets.text =
                        "Ricochets : " + player.stats.arme.ricochets;
                } else if (back.buttonLessRicochets.mouse.pressed()) {
                    player.stats.arme.ricochets -= 1;
                    back.textRicochets.text =
                        "Ricochets : " + player.stats.arme.ricochets;
                }
            },
        },
    },
  };
  
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
  
        if (frameCount % 60 == 0 && arme.utility.recharge > 0) {
            arme.utility.recharge--;
            reload.text = "Reload : " + arme.utility.recharge;
        }
  
        time.x = player.sprite.x - windowWidth / 2 + 180;
        time.y = player.sprite.y - windowHeight / 2 + 50;
  
        reload.x = player.sprite.x - windowWidth / 2 + 180;
        reload.y = player.sprite.y - windowHeight / 2 + 100;
  
        niveautext.text = "Niveau : " + player.stats.bateau.niveau;
        exptext.text = "Exp : " + player.stats.bateau.experience;
  
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
        
  
        backup.utility.functions.run();
  
        player.sprite.layer = 100;
        viseur.sprite.layer = 101;
    } else {
      backup.utility.functions.run();
  
    interniveau.run(); 
  
        
        
    }
  }
  