/*
 * v1.0RC
 * Geometry: Circle
 *
 *
 *  A game by Benjamin Kästner
 *  For more information please visist http://gc.quadda.de
 *  ~ Geometry: Circle is free to play and comes without any costs or warranties.
 *  ~ Feel free to dive into the source code. This is NOT free software, so don't copy and paste. Read, learn and do it yourself better than I did ^___^.
 *  ~ If you want to play this game offline you need to download index.html, geometryCircle.js and the sound files. But I guess you know this already...
 *    However: do NOT distribute this game! Again, this is NOT free software or open source. Please give the link (http://gc.quadda.de) to other people.
 * !! Please notice: CPU usage will explode in Firefox 6.0.2 when using an audio source with a high bitrate.
 *  ~ I tried to kill all bugs, but like in any software... You never know. Enjoy the game!
 *  ~ PS: I bundled allmost all options at the beginning in "constants". Feel free to modify them. Again: do not distribute the game, share the link!
 *
 * Thank you for playing Geometry: Circle :)
 *
 ***************************************************************************************************
 *
 * Geometry: Circle
 *
 *  Ein Spiel von Benjamin Kästner.
 *  Besuche http://gc.quadda.de für mehr Informationen.
 *  ~ Geometry: Circle ist kostenlos verfügbar ohne jegliche Ansprüche auf Fehlerfreiheit.
 *  ~ Du kannst dir gerne denn Quellcode ansehen und aus diversen Fehlern lernen. Geometry: Circle ist aber NICHT freie Software oder Opensource, also nicht den Quellcode für eigene Projekte verwenden!
 *  ~ Falls du das Spiel offline spielen willst, sollte dein Webbrowser über "Webseite komplett speichern" wissen, wie es am Besten geht.
 *   Bitte verteile das heruntergeladene Spiel NICHT weiter. Gebe stattdessen den Link an deine Freunde.
 * !! Firefox verwendet in der Version 6.0.2 eindeutig zu viele Systemresourcen falls eine Audio-Datei mit hohen Bitraten abgespielt wird.
 *  ~ Ich habe versucht, alle Bugs zu beseitigen. Nichtsdestoweniger könnten noch ein paar drin sein. Dennoch viel Spaß!
 *  ~ PS: Fast alle Optionen sind am Anfang in "constants" zu finden. Ändere sie nach deinen Wünschen.
 *
 * Danke, dass du Geometry: Circle spielst :)
 *
 */
var constants = {
    width: 800,
    height: 450,
    maxWidth: 1600,
    timePerLoop: 25,
    playerDefaultX: 20,
    playerDefaultY: 225,
    playerDefaultSpeed: 3,
    playerDefaultSpeedX: 5,
    playerDefaultSpeedY: 3,
    playerDefaultRadius: 20,
    playerDefaultReload: 40,
    playerDefaultExtraLifes: 1,
    playerMaxShownExtraLifes: 12,
    defaultExtraLifeGap: 10000,
    playerTimeInvincible: 200,
    playerDefaultExplodeParticles: 64,
    circloidsDefaultNiceExplodeParticles: 32,
    defaultFont: "'Passero One'",
    defaultDifficulty: 1,
    defaultBulletLifetime: 1000,
    margin: 10,

    minG: 5,
    toSlowThreshold: 20
};

String.prototype.trim = function() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
};

constants.playerDefaultX = constants.playerDefaultRadius;
constants.playerDefaultY = constants.height / 2;
constants.marginRight = (constants.width - constants.margin);
constants.marginBottom = (constants.height - constants.margin);

window.dev = {
    active: false,
    logData: 0,
    log: function(str) {
        var now = new Date();
        if (window.dev.active)
            logData.push(Array(now, str));
        return str;
    },
    enable: function() {
        window.dev.active = true;
    },
    disable: function() {
        window.dev.active = false;
    }
};

window.requestAnimation = window.requestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame || function(e) {
    setTimeout(e, 10);
};

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var particles = [];
var gravityModifier = [];
var circloids = [];
var niceParticles = [];
var backgrounds = [];
var blinkingTexts = [];

var sPlayer = {
    posX: constants.playerDefaultX,
    posY: constants.playerDefaultY,
    radius: constants.playerDefaultRadius,
    extraLifes: -1,
    extraRotation: 0,
    invincible: 0,
    speed: {
        x: constants.playerDefaultSpeedX,
        y: constants.playerDefaultSpeedY
    },
    loadingTime: 0,
    reloadTime: constants.playerDefaultReload,
    gainLife: function() {
        this.extraLifes++;
        blinkingTexts.push({
            t: "+1 flight unit",
            f: "24px " + constants.defaultFont,
            l: 99,
            x: constants.width / 2,
            y: constants.height / 2,
            s: 1
        });
    },
    looseLife: function() {
        this.invincible = constants.playerTimeInvincible;
        this.extraLifes--;
        if (this.extraLifes < 0) {
            lC.gameOver();
        }
        var k = constants.playerDefaultExplodeParticles / 2;
        for (var j = 0; j < constants.playerDefaultExplodeParticles; ++j)
            particles.push({
                x: Math.sin(j * Math.PI / k) * this.radius + this.posX,
                y: Math.cos(j * Math.PI / k) * this.radius + this.posY,
                speed: {
                    x: Math.sin(j * Math.PI / k),
                    y: Math.cos(j * Math.PI / k)
                },
                life: 150
            });
    },
    draw: function() {
        if (this.extraLifes < 0)
            return;
        if (this.invincible > 0 && this.invincible % 24 < 12)
            return;
        lC.ctx.beginPath();
        lC.ctx.moveTo(this.posX, this.posY);
        lC.ctx.arc(this.posX, this.posY, this.radius, 0, 2 * Math.PI, false);
        lC.ctx.fillStyle = "#fff";
        lC.ctx.closePath();
        lC.ctx.fill();
        lC.ctx.stroke();
        lC.ctx.fillStyle = "#000";
        lC.ctx.strokeStyle = "#000";

        lC.ctx.beginPath();
        lC.ctx.lineTo(this.radius + this.posX, this.posY);
        lC.ctx.lineTo(Math.sin(Math.PI * 1.2) * this.radius + this.posX, this.posY + Math.cos(Math.PI * 1.2) * this.radius);
        lC.ctx.quadraticCurveTo(this.posX, this.posY, Math.sin(Math.PI * (-1.2 + 1)) * this.radius + this.posX, this.posY + Math.cos(Math.PI * (-1.2 + 1)) * this.radius);
        lC.ctx.fill();
        lC.ctx.closePath();
        this.extraRotation += .05;
        lC.ctx.fillStyle = "#fff";
        var k = (2 * Math.PI) / Math.min(this.extraLifes, constants.playerMaxShownExtraLifes);
        for (var i = 0; i < this.extraLifes && i < constants.playerMaxShownExtraLifes; ++i) {
            lC.ctx.beginPath();
            var tv = (i + 1) * k + this.extraRotation;
            var tsin = Math.sin(tv) * this.radius + this.posX;
            var tcos = Math.cos(tv) * this.radius + this.posY;
            lC.ctx.moveTo(tsin, tcos);
            lC.ctx.arc(tsin, tcos, this.radius * .2, 0, 2 * Math.PI, false);
            lC.ctx.stroke();
        }
    },
    reset: function() {
        this.posX = constants.playerDefaultX;
        this.posY = constants.playerDefaultY;
        this.loadingTime = 0;
        this.reloadTime = constants.playerDefaultReload;
        this.extraLifes = constants.playerDefaultExtraLifes;
        this.invincible = 0;
    },

    moveLeft: function() {
        this.posX = (this.posX -= this.speed.x) < constants.margin ? constants.margin : this.posX
    },
    moveRight: function() {
        this.posX = (this.posX += this.speed.x) > constants.marginRight ? constants.marginRight : this.posX
    },
    moveUp: function() {
        this.posY = (this.posY -= this.speed.y) < constants.margin ? constants.margin : this.posY;
    },
    moveDown: function() {
        this.posY = (this.posY += this.speed.y) > constants.marginBottom ? constants.marginBottom : this.posY
    },
    shoot: function() {
        if (this.extraLifes < 0)
            return;
        var now = (new Date()).getTime();
        if (this.reload !== null && this.reloadTime < now - this.loadingTime) {
            particles.push({
                x: this.posX + 20,
                y: this.posY,
                speed: {
                    x: 2 * constants.playerDefaultSpeed,
                    y: 0
                },
                life: constants.defaultBulletLifetime
            });
            this.loadingTime = now;
        }
    }
};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
var lC = {
    canvas: null,
    ctx: null,
    bgsound: null,
    keys: 0,
    ticks: 0,
    score: 0,
    highScore: 0,
    debug: false,
    paused: false,
    times: {
        update: 0,
        draw: 0,
        lastLoop: 0,
        lastBuffer: 0
    },
    nextExtra: constants.defaultExtraLifeGap,
    kindOfDifficulty: constants.defaultDifficulty,
    toSlow: 0,
    deactivateBackground: false,
    deactivateNiceParticles: false,
    options: {
        color: false,
        mute: false,
        fullsize: false
    },
    pressKey: function(e) {
        lC.keys[e.keyCode] = true;
        switch (e.keyCode) {
            case 37:
            case 39:
            case 38:
            case 40: // arrow keys
            case 32:
                e.preventDefault();
                break; // spaaaaace!
            case 17:
                lC.keys[32] = true;
                break; // ctrl ~ autofiring laz0rz?
            case 77:
                lC.toggleSound();
                break; // m
            case 67:
                lC.toggleOption("color");
                break; // c
            case 80:
            case 27:
                lC.togglePause();
                break; // p & esc
            case 82:
                lC.restartGame();
                break; // r
            case 114:
                lC.toggleDebug();
                e.preventDefault();
                break; // F3
            default:
                break; // i'm in space!?
        }
    },
    releaseKey: function(e) {
        lC.keys[e.keyCode] = false;
    },
    toggleSound: function() {
        if (lC.bgsound.paused) {
            lC.bgsound.play();
            lC.removeOption("mute");
        } else {
            lC.bgsound.pause();
            lC.setOption("mute");
        }
    },
    toggleDebug: function() {
        lC.debug = !lC.debug;
    },
    startGame: function(e) {
        lC.restartGame();
        window.removeEventListener("keydown", lC.preStartGame, false);
        window.addEventListener("keydown", lC.pressKey, false);
    },
    socialScore: function(e) {
        var tx = e.offsetX ? e.offsetX : e.pageX - lC.canvas.offsetLeft;
        var ty = e.offsetY ? e.offsetY : e.pageY - lC.canvas.offsetTop;
        if (Math.abs(tx - constants.width / 2) < 100 && Math.abs(ty - constants.height / 1.2) < 20)
            window.open("https://twitter.com/intent/tweet?text=" + encodeURI("\"Geometry: Circle\": " + Math.floor(lC.score) + " points (highscore: " + Math.floor(lC.highScore) + " points). Try to beat it! http://gc.quadda.de"));

    },
    gameOver: function(e) {
        document.cookie = "highscore=" + Math.floor(lC.highScore) + ";";
        blinkingTexts.push({
            t: "Your Score: " + Math.floor(lC.score),
            f: "24px " + constants.defaultFont,
            x: constants.width / 2,
            y: ((constants.height / 2) - 48),
            b: false
        });
        blinkingTexts.push({
            t: "Press r to restart",
            f: "24px " + constants.defaultFont,
            x: constants.width / 2,
            y: constants.height / 2,
            s: 0
        });

        blinkingTexts.push({
            t: "Tweet your score!",
            c: "#00f",
            f: "24px " + constants.defaultFont,
            b: false,
            x: constants.width / 2,
            y: constants.height / 1.2,
            s: 0
        });

        window.addEventListener("keydown", lC.preStartGame, false);
        lC.canvas.addEventListener("click", lC.socialScore, false);
    },
    preStartGame: function(e) {
        if (e.keyCode > 48 && e.keyCode < 58) // 1-9
            blinkingTexts.push({
                t: "Difficulty set to " + (lC.kindOfDifficulty = e.keyCode - 48),
                l: 100,
                f: "24px " + constants.defaultFont,
                x: constants.width / 2,
                y: constants.height / 4,
                s: 0,
                a: "center"
            });
        if (e.keyCode === 32) {
            if (lC.ticks > 0) lC.restartGame();
            else lC.startGame();
            e.preventDefault();
        } else if (e.keyCode === 88 && lC.ticks > 0)
            lC.restartGame();
        else if (e.keyCode === 77 && lC.ticks === 0) {
            lC.toggleSound();
            e.preventDefault();
        } else if (e.keyCode === 114) {
            lC.toggleDebug();
            e.preventDefault();
        }
    },
    restartGame: function(e) {
        window.removeEventListener("keydown", lC.preStartGame, false);
        lC.canvas.removeEventListener("click", lC.socialScore, false);
        delete particles;
        delete circloids;
        delete backgrounds;
        delete gravityModifier;
        delete blinkingTexts;
        particles = [];
        circloids = [];
        niceParticles = [];
        backgrounds = [];
        gravityModifier = [];
        blinkingTexts = [];
        sPlayer.reset();
        sPlayer.extraLifes = constants.playerDefaultExtraLifes + lC.kindOfDifficulty - 1;
        lC.ticks = (lC.kindOfDifficulty - 1) * constants.defaultExtraLifeGap;
        lC.score = 0;
        lC.nextExtra = lC.kindOfDifficulty * constants.defaultExtraLifeGap;
        if (lC.paused)
            lC.resumeGame();
    },
    drawTitleScreen: function() {
        sPlayer.extraLifes = -1;
        blinkingTexts.push({
            t: "Geometry: Circle",
            f: "48px " + constants.defaultFont,
            b: false,
            x: constants.width / 2,
            y: constants.height / 2 - 64,
            a: "center"
        });
        blinkingTexts.push({
            t: "Press SPACE to START",
            f: "24px " + constants.defaultFont,
            b: 0,
            x: constants.width / 2,
            y: constants.height / 2,
            a: "center"
        });
        blinkingTexts.push({
            t: "m: mute",
            f: "24px " + constants.defaultFont,
            b: false,
            x: constants.width / 4,
            y: constants.height / 1.5,
            a: "left"
        });
        blinkingTexts.push({
            t: "r:  restart",
            f: "24px " + constants.defaultFont,
            b: false,
            x: constants.width / 4,
            y: constants.height / 1.25,
            a: "left"
        });
        blinkingTexts.push({
            t: "arrows:  move",
            f: "24px " + constants.defaultFont,
            b: false,
            x: constants.width / 1.6,
            y: constants.height / 1.5,
            a: "left"
        });
        blinkingTexts.push({
            t: "space:     shoot",
            f: "24px " + constants.defaultFont,
            b: false,
            x: constants.width / 1.6,
            y: constants.height / 1.25,
            a: "left"
        });
        blinkingTexts.push({
            t: "Music: Ochen Priyatno [Pleased to Meetcha] by Hyphen Jones",
            f: "14px " + constants.defaultFont,
            b: false,
            x: constants.margin,
            y: constants.height - 40,
            a: "left"
        });
        blinkingTexts.push({
            t: "Font: \"Passero One\" by Viktoriya Grabowskay",
            f: "14px " + constants.defaultFont,
            b: false,
            x: constants.width - constants.margin,
            y: constants.height - 40,
            a: "right"
        });
        blinkingTexts.push({
            t: "© Benjamin Kästner 2011",
            f: "10px " + constants.defaultFont,
            b: false,
            x: constants.width / 2,
            y: constants.height - 10,
            a: "center"
        });
        lC.gameLoop();
    },
    blackScreenWithText: function(text) {
        lC.ctx.fillStyle = "rgba(0,0,0,0.8)";
        lC.ctx.fillRect(0, 0, constants.width, constants.height);
        lC.ctx.fillStyle = "#fff";
        lC.ctx.textAlign = "center";
        lC.ctx.font = "24px " + constants.defaultFont;
        lC.ctx.textBaseline = "middle";
        lC.ctx.fillText(text, constants.width / 2, constants.height / 2);
    },
    togglePause: function() {
        if (lC.paused) lC.resumeGame();
        else lC.pauseGame();
    },
    pauseGame: function() {
        if (lC.paused)
            return;
        if (sPlayer.extraLifes < 0)
            return;
        lC.paused = true;
        lC.blackScreenWithText("~ Paused ~ ");
    },
    resumeGame: function() {
        lC.paused = false;
        lC.gameLoop();
    },
    addScore: function(points, pos) {
        if (sPlayer.extraLifes < 0)
            return;
        if ((lC.score += points) > lC.nextExtra) {
            lC.nextExtra += constants.defaultExtraLifeGap;
            sPlayer.gainLife();
        }
        if (lC.score > lC.highScore) {
            lC.highScore = lC.score; // dingdingding :D
        }
        if (pos && pos.x && pos.y) {
            var tf = Math.floor(points);
            blinkingTexts.push({
                x: pos.x,
                y: pos.y,
                l: 30,
                s: -1,
                t: "+ " + tf,
                f: tf + "px " + constants.defaultFont,
                b: false
            });
        }
    },
    controlMovement: function() {
        if (lC.keys[37] || lC.keys[65])
            sPlayer.moveLeft();
        if (lC.keys[39] || lC.keys[68])
            sPlayer.moveRight();
        if (lC.keys[38] || lC.keys[87])
            sPlayer.moveUp();
        if (lC.keys[40] || lC.keys[83])
            sPlayer.moveDown();
        if (lC.keys[32]) {
            sPlayer.shoot();
        }
    },
    createCircloid: function() {
        var tr = Math.random() * (10 + lC.ticks * 0.0001) + 5;
        var tx = constants.width + tr;
        var ty = Math.random() * (constants.height - 2 * constants.margin - tr) + constants.margin;
        var tl = tr;
        var tdeltax = constants.playerDefaultSpeed * (0.2 * (Math.random() - .5 / lC.kindOfDifficulty) + 1) + Math.random() * .5 * lC.kindOfDifficulty;
        var tdeltay = Math.random() - 0.5;
        circloids.push({
            r: tr,
            x: tx,
            y: ty,
            life: tl,
            speed: {
                x: -tdeltax,
                y: -tdeltay
            },
            rot: 0,
            rand: Math.random() * 0.3
        });
    },
    createGravityModifier: function() {
        var tg = Math.random() * 10 + constants.minG;
        var tx = constants.width + tg;
        var ty = Math.random() * constants.height;
        var ts = -(Math.random() + constants.playerDefaultSpeed * .25);
        var ta = "well";
        tx -= ts;
        if (Math.random() > .5) {
            ta = "pulse";
            tg *= -1;
        }
        gravityModifier.push({
            x: tx,
            y: ty,
            g: tg,
            s: ts,
            r: 0,
            a: ta
        });
    },
    updateGame: function() {
        if (lC.paused)
            return;
        var t_time = (new Date()).getTime();

        lC.controlMovement();

        /* create new objects */
        if (Math.random() > 0.90 - 0.05 * Math.abs(Math.sin(0.0001 * lC.ticks))) {
            lC.createCircloid();
        }
        if (Math.random() > 0.999 - lC.ticks * 0.00000002 - 0.001 / (gravityModifier.length + 1)) {
            lC.createGravityModifier();
        }

        /* clean old objects - goodbye my old friends :( */
        for (var i = 0; i < backgrounds.length; ++i) {
            if ((backgrounds[i].x += backgrounds[i].s) + backgrounds[i].w < 0) {
                delete backgrounds.splice(i--, 1);
                continue;
            }
        }
        for (var i = 0; i < gravityModifier.length; ++i) {
            if ((gravityModifier[i].x += gravityModifier[i].s) + gravityModifier[i].g < 0) {
                lC.addScore(Math.abs(gravityModifier[i].g) + Math.abs(constants.width / gravityModifier[i].s));
                delete gravityModifier.splice(i--, 1);
                continue;
            }
        }
        for (var i = 0; i < circloids.length; ++i) {
            if (circloids[i].x + circloids[i].r < 0 || circloids[i].y + circloids[i].r < 0 || circloids[i].y - circloids[i].r > constants.height) {
                delete circloids.splice(i--, 1);
                continue;
            }
            if (circloids[i].life < 0) {
                var k = constants.circloidsDefaultNiceExplodeParticles / 2;
                for (var j = 0; j < constants.circloidsDefaultNiceExplodeParticles; ++j)
                    niceParticles.push({
                        x: Math.sin(j * Math.PI / k) * circloids[i].r + circloids[i].x,
                        y: Math.cos(j * Math.PI / k) * circloids[i].r + circloids[i].y,
                        speed: {
                            x: Math.sin(j * Math.PI / k) + circloids[i].speed.x,
                            y: Math.cos(j * Math.PI / k) + circloids[i].speed.y
                        },
                        life: 100
                    });

                if (circloids[i].r < sPlayer.radius * .45) // some people complained about the tiny circloids. happy?
                    circloids[i].r = 1.45 * sPlayer.radius - circloids[i].r;
                lC.addScore(circloids[i].r, {
                    x: circloids[i].x,
                    y: circloids[i].y
                });
                delete circloids.splice(i--, 1);
                continue;
            }
            circloids[i].x += circloids[i].speed.x;
            circloids[i].y += circloids[i].speed.y;
        }

        /* particles */
        for (var i = 0; i < particles.length; ++i) {
            if (particles[i].x > constants.width || particles[i].x < 0 || particles[i].y < 0 || particles[i].y > constants.height || particles[i].life === 0) {
                delete particles.splice(i--, 1);
                continue;
            }
            var collision = false;
            for (var j = 0; j < circloids.length; ++j) {
                var tmp_x = circloids[j].x - particles[i].x;
                var tmp_y = circloids[j].y - particles[i].y;
                var delta = tmp_x * tmp_x + tmp_y * tmp_y;
                if (delta < (circloids[j].r + 2) * (circloids[j].r + 2)) {
                    circloids[j].life -= 4;
                    delete particles.splice(i--, 1);
                    collision = true;
                    break;
                }
            }
            if (collision)
                continue;
            for (var j = 0; j < gravityModifier.length; ++j) {
                var tmp_x = gravityModifier[j].x - particles[i].x;
                var tmp_y = gravityModifier[j].y - particles[i].y;
                var delta = (tmp_x * tmp_x + tmp_y * tmp_y);
                particles[i].speed.x += tmp_x * gravityModifier[j].g / delta;
                particles[i].speed.y += tmp_y * gravityModifier[j].g / delta;
            }
            particles[i].x += particles[i].speed.x;
            particles[i].y += particles[i].speed.y;
            if (particles[i].life)
                particles[i].life--;
        }

        /* nice Particles */
        for (var i = 0; i < niceParticles.length; ++i) {
            if (niceParticles[i].life-- < 0) {
                delete niceParticles.splice(i--, 1);
                continue;
            }
            for (var j = 0; j < gravityModifier.length; ++j) {
                var tmp_x = gravityModifier[j].x - niceParticles[i].x;
                var tmp_y = gravityModifier[j].y - niceParticles[i].y;
                var delta = (tmp_x * tmp_x + tmp_y * tmp_y);
                niceParticles[i].speed.x += tmp_x * gravityModifier[j].g / delta;
                niceParticles[i].speed.y += tmp_y * gravityModifier[j].g / delta;
            }
            niceParticles[i].x += niceParticles[i].speed.x;
            niceParticles[i].y += niceParticles[i].speed.y;
        }
        if (sPlayer.invincible === 0 && sPlayer.extraLifes >= 0)
            for (var i = 0; i < circloids.length; ++i) {
                var deltax = circloids[i].x - sPlayer.posX;
                var deltay = circloids[i].y - sPlayer.posY;
                var sumr = circloids[i].r + sPlayer.radius;
                var delta = Math.sqrt(deltax * deltax + deltay * deltay);
                if (delta < sumr)
                    sPlayer.looseLife();
            }
        else
            sPlayer.invincible--;
        if (!(sPlayer.extraLifes < 0)) {
            lC.ticks++;
            lC.addScore(1);
        }
        lC.times.update = ((new Date()).getTime() - t_time);
    },
    clear: function() {
        //lC.ctx.clearRect(0,0,lC.canvas.width,lC.canvas.height);
        lC.ctx.fillStyle = "#fff";
        lC.ctx.fillRect(0, 0, lC.canvas.width, lC.canvas.height);
    },
    drawBackground: function(p) {
        if (p.c)
            lC.ctx.fillStyle = p.c
        lC.ctx.fillRect(p.x, p.y, p.w, p.h);
        lC.ctx.strokeRect(p.x, p.y, p.w, p.h + 5);
    },
    drawCircloid: function(p) {
        lC.ctx.fillStyle = "#fff";
        lC.ctx.beginPath();
        lC.ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI, false);
        lC.ctx.fill();
        lC.ctx.stroke();
        lC.ctx.beginPath();
        lC.ctx.arc(p.x, p.y, 0.5 * p.r, p.rot, Math.PI + (p.rot += p.rand), false);
        lC.ctx.closePath();
        lC.ctx.fillStyle = "#000";
        lC.ctx.fill();
    },
    drawGravityModifier: function(p) {
        if (p.a === "well") lC.drawGravityWell(p);
        else lC.drawGravityPulser(p);
    },
    drawGravityWell: function(p) {
        lC.ctx.fillStyle = "#a0a";
        lC.ctx.beginPath();
        lC.ctx.moveTo(p.x + p.g * Math.sin(p.r -= 0.1), p.y + p.g * Math.cos(p.r));
        lC.ctx.lineTo(p.x + p.g * Math.sin(Math.PI * 0.5 + p.r), p.y + p.g * Math.cos(Math.PI * 0.5 + p.r));
        lC.ctx.lineTo(p.x + p.g * Math.sin(Math.PI + p.r), p.y + p.g * Math.cos(Math.PI + p.r));
        lC.ctx.lineTo(p.x + p.g * Math.sin(Math.PI * 1.5 + p.r), p.y + p.g * Math.cos(Math.PI * 1.5 + p.r));
        lC.ctx.closePath();
        lC.ctx.fill();
    },
    drawGravityPulser: function(p) {
        lC.ctx.fillStyle = "#f80";
        lC.ctx.beginPath();
        lC.ctx.moveTo(p.x + p.g * Math.sin(p.r -= 0.1), p.y + p.g * Math.cos(p.r));
        lC.ctx.lineTo(p.x + p.g * Math.sin(Math.PI * 0.66 + p.r), p.y + p.g * Math.cos(Math.PI * 0.66 + p.r));
        lC.ctx.lineTo(p.x + p.g * Math.sin(Math.PI * 1.33 + p.r), p.y + p.g * Math.cos(Math.PI * 1.33 + p.r));
        lC.ctx.closePath();
        lC.ctx.fill();
    },
    drawParticle: function(p) {
        lC.ctx.fillStyle = "rgba(0,0,0," + ((p.life / 200)) + ")";
        lC.ctx.strokeStyle = "rgba(255,255,255," + ((p.life / 200)) + ")";
        lC.ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        lC.ctx.strokeRect(p.x - 2, p.y - 2, 4, 4);
    },
    drawNiceParticle: function(p) {
        lC.ctx.fillStyle = "rgba(0,0,0," + ((p.life / 200)) + ")";
        lC.ctx.fillRect(p.x - 3, p.y - 3, 3, 3);
    },
    drawBlinkingText: function(p) {
        if (typeof p.b !== "boolean") {
            if (!p.b) p.b = 0;
            if (p.b++ % 50 > 25) return;
        }
        if (p.f)
            lC.ctx.font = p.f;
        if (p.a)
            lC.ctx.textAlign = p.a;
        if (p.c)
            lC.ctx.fillStyle = p.c;
        lC.ctx.fillText(p.t, p.x, p.y += (p.s ? p.s : 0));
    },
    drawDebugInformation: function() {
        var i = 1;
        lC.ctx.fillStyle = "#0f0";
        if (lC.times.update + lC.times.loopDiff + lC.times.draw > constants.timePerLoop)
            lC.ctx.fillStyle = "#f00";
        lC.ctx.fillText(lC.times.update + 'ms updating', constants.width, 14 * ++i);
        lC.ctx.fillText(lC.times.draw + 'ms drawing', constants.width, 14 * ++i);
        lC.ctx.fillText(lC.times.loopDiff + ' loop difference', constants.width, ++i * 14);
        lC.ctx.fillStyle = "#444";
        lC.ctx.fillText(particles.length + ' particles', constants.width, ++i * 14);
        lC.ctx.fillText(circloids.length + ' circloids', constants.width, ++i * 14);
        lC.ctx.fillText(gravityModifier.length + ' gravity modifier', constants.width, ++i * 14);
        lC.ctx.fillText(niceParticles.length + ' nice particles', constants.width, ++i * 14);
        lC.ctx.fillText(backgrounds.length + ' backgrounds', constants.width, ++i * 14);
        ++i;
        lC.ctx.fillText(blinkingTexts.length + ' text messages', constants.width, ++i * 14);
        lC.ctx.fillText(lC.toSlow + ' frames were to slow', constants.width, ++i * 14);
    },
    drawScore: function() {
        lC.ctx.font = "1em " + constants.defaultFont;
        lC.ctx.textAlign = "right";
        lC.ctx.textBaseline = "top";
        lC.ctx.fillStyle = "#000";
        lC.ctx.fillText('Score: ' + Math.floor(lC.score), constants.width, 0);
        lC.ctx.fillText('Highscore: ' + Math.floor(lC.highScore), constants.width - 120, 0);
    },
    draw: function() {
        if (lC.paused)
            return;
        var t_time = (new Date()).getTime();
        lC.clear();

        /* backgrounds ~ they are not really a part of the game, so.... */
        lC.ctx.lineWidth = 3;
        lC.ctx.fillStyle = "#fff";
        lC.ctx.strokeStyle = "#000";
        if (!lC.deactivateBackground && Math.random() > 0.95) {
            var tw = Math.random() * constants.width * 0.2 + constants.width * .05;
            var th = Math.random() * constants.height * 0.45;
            var tx = constants.width + tw;
            var ty = constants.height - th;
            var ts = -((Math.random() * 2 + 1) * constants.playerDefaultSpeed);
            tx -= ts;
            backgrounds.push({
                x: tx,
                y: ty,
                h: th,
                w: tw,
                s: ts
            });
            if (lC.options.color)
                backgrounds[backgrounds.length - 1].c = "rgba(" + Math.floor(Math.random() * 120) + "," + Math.floor(Math.random() * 120) + "," + Math.floor(Math.random() * 120) + "," + (Math.random() * .5 + .5) + ")";
        }
        backgrounds.forEach(lC.drawBackground);
        lC.ctx.lineWidth = 1;
        gravityModifier.forEach(lC.drawGravityModifier);

        circloids.forEach(lC.drawCircloid);

        sPlayer.draw();

        particles.forEach(lC.drawParticle);

        if (!lC.deactivateNiceParticles)
            niceParticles.forEach(lC.drawNiceParticle);

        lC.ctx.fillStyle = "#000";
        lC.ctx.strokeStyle = "#fff";
        lC.ctx.textAlign = "center";

        for (var i = 0; i < blinkingTexts.length; ++i) {
            if (typeof blinkingTexts[i].l === "number" && blinkingTexts[i].l-- < 0) {
                delete blinkingTexts.splice(i--, 1);
                continue;
            }
            lC.drawBlinkingText(blinkingTexts[i]);
        }
        /* Score */
        lC.drawScore();

        if (lC.debug) lC.drawDebugInformation();
        lC.times.draw = ((new Date()).getTime() - t_time);
    },
    gameLoop: function() {
        if (lC.paused)
            return;
        lC.times.loopDiff = (new Date()).getTime() - lC.times.lastLoop;
        lC.updateGame();
        lC.draw();
        lC.times.lastLoop = (new Date()).getTime();
        var t_buffer = constants.timePerLoop - (lC.times.update + lC.times.loopDiff + lC.times.draw) - 1;
        t_buffer = t_buffer * .75 + lC.times.lastBuffer * .25;
        if (t_buffer < 0) {
            lC.toSlow++;
            if (lC.toSlow < constants.toSlowThreshold)
                lC.deactivateBackground = lC.deactivateNiceParticles = true;
            t_buffer = 1;
        } else
            lC.toSlow = 0;
        lC.times.lastBuffer = t_buffer;
        setTimeout(lC.gameLoop, t_buffer);
    },
    resizeGame: function() {
        constants.width = Math.min(document.documentElement.clientWidth - 4 * constants.margin, constants.maxWidth);
        constants.marginRight = constants.width - constants.margin;
        lC.canvas.width = constants.width;
    },
    updateOptions: function() {
        lC.options.color = lC.getOption("color");
        lC.options.mute = lC.getOption("mute");
        lC.options.fullsize = lC.getOption("fullsize");
    },
    setOption: function(k) {
        if (lC.getOption(k) === true)
            return;
        window.location.hash += k + ";";
    },
    removeOption: function(k) {
        if (lC.getOption(k) !== true)
            return;
        window.location.hash = window.location.hash.replace(k + ";", "");
        window.location.hash = window.location.hash.replace(k, "");
    },
    toggleOption: function(k) {
        if (lC.getOption(k) === true)
            lC.removeOption(k);
        else
            lC.setOption(k);
    },
    getOption: function(name) {
        if (!window.location.hash)
            return undefined;
        if (window.location.hash.indexOf(name) !== -1)
            return true;
        return false;
    },
    init: function() {
        lC.reload = (new Date()).getTime();
        lC.keys = new Array;
        lC.canvas = document.getElementById('renderCanvas');
        lC.ctx = lC.canvas.getContext("2d");
        lC.updateOptions();

        if (document.cookie) {
            var k = document.cookie.split(";");
            for (var i = 0; i < k.length; ++i) {
                var t = k[i].split("=");
                if (t[0].trim() === "highscore")
                    lC.highScore = t[1];
            }
        }
        lC.canvas.width = constants.width;
        lC.canvas.height = constants.height;
        lC.ctx.textAlign = "center";
        lC.ctx.textBaseline = "middle";
        lC.canvas.addEventListener("contextmenu", function(e) {
            e.preventDefault();
            return false;
        }, false);
        if (document.getElementById("bgsound")) {
            lC.bgsound = document.getElementById("bgsound");
            lC.bgsound.addEventListener("ended", function(e) {
                this.currentTime = 0;
                this.play();
            }, false);
            lC.setOption("mute");
            if (!lC.getOption("mute"))
                lC.bgsound.play();
        }
        if (lC.options.fullsize)
            lC.resizeGame();

        window.addEventListener("hashchange", lC.updateOptions, false);

        window.addEventListener("keydown", lC.preStartGame, false);
        window.addEventListener("keyup", lC.releaseKey, false);
        lC.drawTitleScreen();
    }
};
window.addEventListener("DOMContentLoaded", lC.init, true);
