import Phaser from 'phaser';
import { soundSystem } from '../../utils/audioSystem';

export default class SpaceScene extends Phaser.Scene {
  constructor() {
    super('SpaceScene');
  }

  init(data) {
    this.mission = data.mission || null;
    this.shipConfig = data.shipConfig || null;
    this.upgrades = data.upgrades || {};
    this.callbacks = data.callbacks || {};

    // Gameplay runtime state
    this.score = 0;
    this.creditsCollected = 0;
    this.energyCoresCollected = 0;
    this.enemiesDefeated = 0;
    this.bossDefeated = false;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.damageTaken = 0;
    this.startTime = Date.now();
    this.isGameOver = false;
    this.isVictory = false;
    this.isPaused = false;

    // Arcade 3-Lives System
    this.playerLives = 3;

    // Player combat attributes calculated from base + upgrades
    const baseStats = this.shipConfig?.stats || {
      health: 100, shield: 50, speed: 320, damage: 20, fireRate: 0.2, specialCooldown: 15
    };
    
    // Apply upgrade modifiers
    const dmgBonus = (this.upgrades.weaponDamage || 1) * 3;
    const hpBonus = (this.upgrades.maxHealth || 1) * 15;
    const shieldBonus = (this.upgrades.shieldCapacity || 1) * 10;
    const speedBonus = (this.upgrades.moveSpeed || 1) * 15;
    const fireRateReduction = ((this.upgrades.fireRate || 1) - 1) * 0.015;

    this.maxHealth = baseStats.health + hpBonus;
    this.currentHealth = this.maxHealth;
    this.maxShield = baseStats.shield + shieldBonus;
    this.currentShield = this.maxShield;
    this.playerSpeed = baseStats.speed + speedBonus;
    this.playerDamage = baseStats.damage + dmgBonus;
    this.baseFireInterval = Math.max(0.08, baseStats.fireRate - fireRateReduction) * 1000;
    this.currentFireInterval = this.baseFireInterval;

    // Power-up active states
    this.activePowerups = {
      shield_pulse: false,
      rapid_fire: false,
      spread_shot: false,
      overdrive: false,
    };

    // Invulnerability frames & timers
    this.isInvulnerable = false;
    this.lastFireTime = 0;

    // Wave & Boss management
    this.currentWaveIndex = 0;
    this.waveSpawnTimer = null;
    this.activeEnemies = [];
    this.activeBoss = null;
    this.bossMaxHealth = 1000;
    this.bossCurrentHealth = 1000;
    this.bossSpiralAngle = 0;
    this.minionsSpawned = false;
  }

  create() {
    const { width, height } = this.scale;

    // 1. Procedural Particle Textures Generation
    this.generateProceduralTextures();

    // 2. Parallax Nebulae & Cosmic Starfield
    this.createParallaxEnvironment(width, height);

    // 3. Physics Groups
    this.playerProjectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.pickups = this.physics.add.group();
    this.asteroids = this.physics.add.group();

    // 4. Create Player Ship
    const shipSpriteKey = `ship_${this.shipConfig?.id || 'interceptor'}`;
    this.player = this.physics.add.sprite(width / 2, height - 90, shipSpriteKey);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(48, 48);
    this.player.setDepth(10);

    // 5. Engine Exhaust Particle Trail
    this.createEngineExhaustEmitter();

    // 6. Shield Aura Visual Graphic
    this.shieldAura = this.add.circle(this.player.x, this.player.y, 44, 0x06b6d4, 0.35);
    this.shieldAura.setStrokeStyle(2, 0x38bdf8);
    this.shieldAura.setVisible(this.currentShield > 0);
    this.shieldAura.setDepth(11);

    // 7. Graphics Layers for Laser Telegraphs & Shockwaves
    this.telegraphGraphics = this.add.graphics({ depth: 8 });

    // 8. Desktop Keyboard Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 9. Mobile Touch & Drag Controls
    this.input.on('pointermove', (pointer) => {
      if (pointer.isDown && !this.isGameOver && !this.isPaused) {
        this.player.x = Phaser.Math.Clamp(pointer.x, 30, width - 30);
        this.player.y = Phaser.Math.Clamp(pointer.y, 60, height - 40);
      }
    });

    // 10. Setup Collisions
    this.physics.add.overlap(this.playerProjectiles, this.enemies, this.handleProjectileHitEnemy, null, this);
    this.physics.add.overlap(this.enemyProjectiles, this.player, this.handleEnemyProjectileHitPlayer, null, this);
    this.physics.add.overlap(this.enemies, this.player, this.handleEnemyRamPlayer, null, this);
    this.physics.add.overlap(this.player, this.pickups, this.handlePickupCollection, null, this);
    this.physics.add.overlap(this.playerProjectiles, this.asteroids, this.handleProjectileHitAsteroid, null, this);
    this.physics.add.overlap(this.player, this.asteroids, this.handlePlayerHitAsteroid, null, this);

    // 11. Start Periodic Space Asteroid Hazard Spawner
    this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => this.spawnSpaceAsteroid(),
    });

    // 12. Start Wave Progression
    this.startNextWave();

    // 13. Notify React UI & Ambient Audio
    this.emitStatsUpdate();
    soundSystem.startAmbientMusic();
  }

  // --- PROCEDURAL TEXTURES & PARTICLES ---
  generateProceduralTextures() {
    // 1. Thruster Particle
    if (!this.textures.exists('particle_thruster')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x38bdf8, 1);
      g.fillCircle(8, 8, 8);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(8, 8, 4);
      g.generateTexture('particle_thruster', 16, 16);
      g.destroy();
    }

    // 2. Fire Debris
    if (!this.textures.exists('particle_fire')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xf97316, 1);
      g.fillCircle(6, 6, 6);
      g.fillStyle(0xfacc15, 1);
      g.fillCircle(6, 6, 3);
      g.generateTexture('particle_fire', 12, 12);
      g.destroy();
    }

    // 3. Electric Spark
    if (!this.textures.exists('particle_spark')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x67e8f9, 1);
      g.fillRect(0, 3, 10, 2);
      g.fillRect(4, 0, 2, 8);
      g.generateTexture('particle_spark', 10, 8);
      g.destroy();
    }

    // 4. Asteroid Rock
    if (!this.textures.exists('asteroid_texture')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x475569, 1);
      g.beginPath();
      g.moveTo(16, 2);
      g.lineTo(28, 8);
      g.lineTo(32, 22);
      g.lineTo(24, 32);
      g.lineTo(10, 30);
      g.lineTo(2, 18);
      g.lineTo(6, 6);
      g.closePath();
      g.fillPath();
      g.fillStyle(0x64748b, 1);
      g.fillCircle(14, 14, 5);
      g.fillCircle(22, 20, 3);
      g.generateTexture('asteroid_texture', 34, 34);
      g.destroy();
    }
  }

  createEngineExhaustEmitter() {
    this.exhaustEmitter = this.add.particles(this.player.x, this.player.y + 20, 'particle_thruster', {
      speed: { min: 80, max: 180 },
      angle: { min: 80, max: 100 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 220,
      blendMode: 'ADD',
      frequency: 25,
    });
    this.exhaustEmitter.setDepth(9);
  }

  createParallaxEnvironment(width, height) {
    // Glowing Nebula clouds in background
    this.nebula1 = this.add.circle(width * 0.25, height * 0.3, 160, 0x1e1b4b, 0.25);
    this.nebula2 = this.add.circle(width * 0.8, height * 0.7, 180, 0x083344, 0.22);
    this.nebula1.setDepth(1);
    this.nebula2.setDepth(1);

    // 3-layer parallax starfield
    this.stars = [];
    for (let i = 0; i < 90; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.FloatBetween(0.8, 2.5),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.95)
      );
      star.speed = star.radius * 0.85;
      star.setDepth(2);
      this.stars.push(star);
    }
  }

  update(time, delta) {
    if (this.isGameOver || this.isPaused) return;

    const { width, height } = this.scale;

    // Scroll parallax stars and nebulae
    for (const star of this.stars) {
      star.y += star.speed;
      if (star.y > height) {
        star.y = 0;
        star.x = Phaser.Math.Between(0, width);
      }
    }

    if (this.nebula1) {
      this.nebula1.y += 0.2;
      if (this.nebula1.y > height + 200) this.nebula1.y = -200;
    }
    if (this.nebula2) {
      this.nebula2.y += 0.25;
      if (this.nebula2.y > height + 200) this.nebula2.y = -200;
    }

    // Keyboard Movement
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.keyA.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.keyD.isDown) vx += 1;
    if (this.cursors.up.isDown || this.keyW.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.keyS.isDown) vy += 1;

    // Normalize diagonal velocity
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    const currentSpeed = this.activePowerups.overdrive ? this.playerSpeed * 1.35 : this.playerSpeed;
    this.player.setVelocity(vx * currentSpeed, vy * currentSpeed);

    // Dynamic Banking Tilt on lateral movement
    this.player.setRotation(vx * 0.12);

    // Update Shield Aura & Engine Trail Position
    if (this.shieldAura) {
      this.shieldAura.setPosition(this.player.x, this.player.y);
      this.shieldAura.setVisible(this.currentShield > 0 || this.activePowerups.shield_pulse);
    }

    if (this.exhaustEmitter) {
      this.exhaustEmitter.setPosition(this.player.x, this.player.y + 20);
      if (this.activePowerups.overdrive) {
        this.exhaustEmitter.setScale({ start: 1.0, end: 0 });
        this.exhaustEmitter.setLifespan(320);
      } else {
        this.exhaustEmitter.setScale({ start: 0.6, end: 0 });
        this.exhaustEmitter.setLifespan(220);
      }
    }

    // Continuous weapon firing
    if (time > this.lastFireTime + this.currentFireInterval) {
      this.firePlayerWeapon();
      this.lastFireTime = time;
    }

    // Update Boss AI if active
    if (this.activeBoss && this.activeBoss.active) {
      this.updateBossBehavior(time);
    }

    // Clean up out-of-bounds projectiles & pickups
    this.playerProjectiles.children.each((proj) => {
      if (proj && proj.y < -30) proj.destroy();
    });
    this.enemyProjectiles.children.each((proj) => {
      if (proj && (proj.y > height + 30 || proj.y < -30 || proj.x < -30 || proj.x > width + 30)) proj.destroy();
    });
    this.pickups.children.each((pick) => {
      if (pick && pick.y > height + 40) pick.destroy();
    });
    this.asteroids.children.each((ast) => {
      if (ast && ast.y > height + 50) ast.destroy();
    });

    // Check survive_time objective
    if (this.mission?.objective?.type === 'survive_time') {
      const elapsedSec = (Date.now() - this.startTime) / 1000;
      if (elapsedSec >= this.mission.objective.durationSeconds) {
        this.triggerVictory();
      }
    }
  }

  // --- WEAPONS & FIRING ---
  firePlayerWeapon() {
    const px = this.player.x;
    const py = this.player.y - 24;

    const damage = this.activePowerups.overdrive ? this.playerDamage * 1.5 : this.playerDamage;
    soundSystem.playLaser('player');
    this.shotsFired++;

    if (this.activePowerups.spread_shot) {
      // 5-way spread
      const angles = [-25, -12, 0, 12, 25];
      for (const ang of angles) {
        const rad = Phaser.Math.DegToRad(ang - 90);
        const bullet = this.playerProjectiles.create(px, py, 'proj_laser_player');
        bullet.damage = damage * 0.85;
        bullet.setVelocity(Math.cos(rad) * 620, Math.sin(rad) * 620);
      }
    } else {
      // Standard twin lasers
      const b1 = this.playerProjectiles.create(px - 14, py, 'proj_laser_player');
      const b2 = this.playerProjectiles.create(px + 14, py, 'proj_laser_player');
      b1.damage = damage;
      b2.damage = damage;
      b1.setVelocityY(-640);
      b2.setVelocityY(-640);
    }
  }

  // --- FLOATING COMBAT TEXT & SCREEN JUICE ---
  spawnCombatText(x, y, text, color = '#38bdf8') {
    const label = this.add.text(x, y, text, {
      fontFamily: 'Orbitron, Rajdhani, monospace',
      fontSize: '13px',
      fontStyle: 'bold',
      fill: color,
      stroke: '#030712',
      strokeThickness: 3,
    });
    label.setOrigin(0.5);
    label.setDepth(25);

    this.tweens.add({
      targets: label,
      y: y - 35,
      alpha: 0,
      duration: 900,
      ease: 'Power1',
      onComplete: () => label.destroy(),
    });
  }

  // --- DESTRUCTIBLE SPACE ASTEROIDS ---
  spawnSpaceAsteroid() {
    if (this.isGameOver || this.isPaused) return;

    const { width } = this.scale;
    const x = Phaser.Math.Between(40, width - 40);
    const ast = this.asteroids.create(x, -35, 'asteroid_texture');
    ast.health = 40;
    ast.setVelocityY(Phaser.Math.Between(60, 110));
    ast.setVelocityX(Phaser.Math.Between(-25, 25));
    ast.setAngularVelocity(Phaser.Math.Between(-40, 40));
    ast.setDepth(7);
  }

  handleProjectileHitAsteroid(bullet, asteroid) {
    bullet.destroy();
    asteroid.health -= bullet.damage || 20;
    soundSystem.playExplosion('small');

    if (asteroid.health <= 0) {
      const ax = asteroid.x;
      const ay = asteroid.y;
      asteroid.destroy();
      this.score += 75;
      this.spawnCombatText(ax, ay, '+75', '#94a3b8');

      // Chance to drop credit cache
      if (Math.random() < 0.35) {
        this.spawnRandomPickup(ax, ay, false);
      }
    }
  }

  handlePlayerHitAsteroid(player, asteroid) {
    asteroid.destroy();
    if (this.isInvulnerable || this.activePowerups.shield_pulse) return;
    this.applyPlayerDamage(25);
  }

  // --- ENEMY SPAWNING & WAVES ---
  startNextWave() {
    if (this.isGameOver) return;

    const waves = this.mission?.waves || [];
    if (this.currentWaveIndex >= waves.length) {
      if (this.mission?.isBossMission && !this.activeBoss && !this.bossDefeated) {
        this.spawnBoss();
      } else if (!this.mission?.isBossMission) {
        this.triggerVictory();
      }
      return;
    }

    const currentWave = waves[this.currentWaveIndex];
    this.currentWaveIndex++;

    if (this.callbacks.onWaveStart) {
      this.callbacks.onWaveStart(this.currentWaveIndex, waves.length);
    }

    let delay = 0;
    currentWave.enemies.forEach((group) => {
      for (let i = 0; i < group.count; i++) {
        this.time.delayedCall(delay, () => {
          if (!this.isGameOver) {
            this.spawnEnemy(group.type);
          }
        });
        delay += Phaser.Math.Between(400, 1100);
      }
    });

    this.time.delayedCall(delay + 3000, () => {
      this.checkWaveProgress();
    });
  }

  checkWaveProgress() {
    if (this.isGameOver) return;

    const aliveEnemies = this.enemies.getChildren().filter(e => e.active);
    if (aliveEnemies.length === 0) {
      this.time.delayedCall(1200, () => {
        this.startNextWave();
      });
    } else {
      this.time.delayedCall(1500, () => {
        this.checkWaveProgress();
      });
    }
  }

  spawnEnemy(type) {
    if (this.isGameOver) return;

    const { width } = this.scale;
    const startX = Phaser.Math.Between(40, width - 40);
    const startY = -40;

    let spriteKey = 'enemy_scout';
    let hp = 30;
    let speed = 120;
    let scoreVal = 100;

    if (type === 'interceptor') {
      spriteKey = 'enemy_interceptor';
      hp = 45;
      speed = 160;
      scoreVal = 150;
    } else if (type === 'cruiser') {
      spriteKey = 'enemy_cruiser';
      hp = 120;
      speed = 70;
      scoreVal = 300;
    } else if (type === 'gunship') {
      spriteKey = 'enemy_gunship';
      hp = 80;
      speed = 90;
      scoreVal = 250;
    } else if (type === 'elite') {
      spriteKey = 'enemy_elite';
      hp = 220;
      speed = 110;
      scoreVal = 600;
    }

    const enemy = this.enemies.create(startX, startY, spriteKey);
    enemy.type = type;
    enemy.health = hp;
    enemy.maxHealth = hp;
    enemy.scoreVal = scoreVal;
    enemy.spawnTime = this.time.now;
    enemy.setDepth(9);

    if (type === 'scout') {
      enemy.setVelocityY(speed);
      this.setupEnemyFiring(enemy, 1600, 'proj_laser_enemy');
    } else if (type === 'interceptor') {
      enemy.setVelocityY(speed);
      enemy.sinePhase = Math.random() * Math.PI * 2;
      this.setupEnemyFiring(enemy, 1400, 'proj_laser_enemy');
    } else if (type === 'cruiser') {
      enemy.setVelocityY(speed);
      this.setupEnemyFiring(enemy, 1800, 'proj_plasma_ball', true);
    } else if (type === 'gunship') {
      this.tweens.add({
        targets: enemy,
        y: Phaser.Math.Between(70, 160),
        duration: 1800,
        ease: 'Power2',
        onComplete: () => {
          this.setupTargetedEnemyFiring(enemy, 2000);
        }
      });
    } else if (type === 'elite') {
      this.tweens.add({
        targets: enemy,
        y: Phaser.Math.Between(80, 180),
        duration: 2000,
        ease: 'Cubic.out',
        onComplete: () => {
          this.tweens.add({
            targets: enemy,
            x: width - 60,
            yoyo: true,
            repeat: -1,
            duration: 3000,
            ease: 'Sine.easeInOut'
          });
          this.setupEliteBurstFiring(enemy);
        }
      });
    }
  }

  setupEnemyFiring(enemy, interval, projKey, isHeavy = false) {
    const timer = this.time.addEvent({
      delay: interval,
      loop: true,
      callback: () => {
        if (!enemy.active || this.isGameOver) {
          timer.destroy();
          return;
        }
        if (enemy.y > 0 && enemy.y < this.scale.height - 80) {
          const bullet = this.enemyProjectiles.create(enemy.x, enemy.y + 20, projKey);
          bullet.damage = isHeavy ? 25 : 12;
          bullet.setVelocityY(isHeavy ? 240 : 320);
          soundSystem.playLaser('enemy');
        }
      }
    });
  }

  setupTargetedEnemyFiring(enemy, interval) {
    const timer = this.time.addEvent({
      delay: interval,
      loop: true,
      callback: () => {
        if (!enemy.active || this.isGameOver || !this.player.active) {
          timer.destroy();
          return;
        }
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const bullet = this.enemyProjectiles.create(enemy.x, enemy.y + 20, 'proj_laser_enemy');
        bullet.damage = 18;
        bullet.setRotation(angle - Math.PI / 2);
        this.physics.velocityFromRotation(angle, 350, bullet.body.velocity);
        soundSystem.playLaser('enemy');
      }
    });
  }

  setupEliteBurstFiring(enemy) {
    const timer = this.time.addEvent({
      delay: 2400,
      loop: true,
      callback: () => {
        if (!enemy.active || this.isGameOver) {
          timer.destroy();
          return;
        }
        [-20, 0, 20].forEach((ang) => {
          const rad = Phaser.Math.DegToRad(ang + 90);
          const b = this.enemyProjectiles.create(enemy.x, enemy.y + 24, 'proj_plasma_ball');
          b.damage = 18;
          b.setVelocity(Math.cos(rad) * 280, Math.sin(rad) * 280);
        });
        soundSystem.playLaser('enemy');
      }
    });
  }

  // --- BOSS ENCOUNTERS & ADVANCED PATTERNS ---
  spawnBoss() {
    const { width } = this.scale;
    const bossKey = this.mission.bossId || 'boss_warden';
    
    // 1. Play Boss Siren & Camera Shake
    soundSystem.playBossWarning();
    this.cameras.main.shake(400, 0.018);
    this.cameras.main.flash(400, 225, 29, 72);

    // 2. Announce Boss to React HUD
    if (this.callbacks.onBossSpawn) {
      this.callbacks.onBossSpawn(this.mission.bossName || 'FLAGSHIP COMMANDER');
    }

    // 3. On-screen Tactical Warning Banner
    this.spawnBossWarningBanner();

    this.bossMaxHealth = 900 + (this.mission.sequence * 90);
    this.bossCurrentHealth = this.bossMaxHealth;

    this.activeBoss = this.physics.add.sprite(width / 2, -120, bossKey);
    this.activeBoss.body.setSize(130, 95);
    this.activeBoss.isBoss = true;
    this.activeBoss.setDepth(15);

    // Entry Tween
    this.tweens.add({
      targets: this.activeBoss,
      y: 115,
      duration: 3200,
      ease: 'Power2',
      onComplete: () => {
        this.initBossCombatPatterns();
      }
    });

    this.physics.add.overlap(this.playerProjectiles, this.activeBoss, this.handleProjectileHitBoss, null, this);
    this.physics.add.overlap(this.activeBoss, this.player, this.handleEnemyRamPlayer, null, this);
  }

  spawnBossWarningBanner() {
    const { width, height } = this.scale;
    const warning = this.add.text(width / 2, height * 0.35, '⚠️ CRITICAL ALERT: CAPITAL SHIP DETECTED ⚠️', {
      fontFamily: 'Orbitron, monospace',
      fontSize: '14px',
      fontStyle: 'bold',
      fill: '#f43f5e',
      stroke: '#000000',
      strokeThickness: 4,
    });
    warning.setOrigin(0.5);
    warning.setDepth(30);

    this.tweens.add({
      targets: warning,
      alpha: 0.2,
      scale: 1.1,
      yoyo: true,
      repeat: 4,
      duration: 250,
      onComplete: () => warning.destroy(),
    });
  }

  initBossCombatPatterns() {
    const { width } = this.scale;

    // Movement: Left & Right Hover
    this.tweens.add({
      targets: this.activeBoss,
      x: width - 80,
      yoyo: true,
      repeat: -1,
      duration: 4000,
      ease: 'Sine.easeInOut'
    });

    // Firing Loop based on Boss Phase
    this.bossTimer = this.time.addEvent({
      delay: 1600,
      loop: true,
      callback: () => {
        if (!this.activeBoss || !this.activeBoss.active || this.isGameOver) {
          if (this.bossTimer) this.bossTimer.destroy();
          return;
        }

        const hpPercent = this.bossCurrentHealth / this.bossMaxHealth;

        if (hpPercent > 0.65) {
          // Phase 1: Dual Heavy Cannons + Rapid Spread
          [-40, 40].forEach((offset) => {
            const b = this.enemyProjectiles.create(this.activeBoss.x + offset, this.activeBoss.y + 45, 'proj_boss_bullet');
            b.damage = 22;
            b.setVelocityY(320);
          });
          soundSystem.playLaser('enemy');
        } else if (hpPercent > 0.35) {
          // Phase 2: Rotating Spiral Bullet Hell
          this.fireBossSpiralBarrage();
        } else {
          // Phase 3 (Enraged): Telegraphed Heavy Laser Beam + Aimed Volleys
          this.fireBossTelegraphedBeam();

          // Summon 2 escort minions once in enrage phase
          if (!this.minionsSpawned) {
            this.minionsSpawned = true;
            this.spawnEnemy('interceptor');
            this.spawnEnemy('interceptor');
            this.spawnCombatText(this.activeBoss.x, this.activeBoss.y, 'ESCORTS SUMMONED!', '#f43f5e');
          }
        }
      }
    });
  }

  fireBossSpiralBarrage() {
    this.bossSpiralAngle += 35;
    for (let i = 0; i < 6; i++) {
      const angle = this.bossSpiralAngle + (i * 60);
      const rad = Phaser.Math.DegToRad(angle);
      const b = this.enemyProjectiles.create(this.activeBoss.x, this.activeBoss.y + 35, 'proj_plasma_ball');
      b.damage = 18;
      b.setVelocity(Math.cos(rad) * 230, Math.sin(rad) * 230);
    }
    soundSystem.playLaser('enemy');
  }

  fireBossTelegraphedBeam() {
    if (!this.player.active || !this.activeBoss.active) return;

    const bx = this.activeBoss.x;
    const by = this.activeBoss.y + 40;
    const px = this.player.x;
    const py = this.player.y;

    // Draw red targeting guide line for 450ms
    this.telegraphGraphics.clear();
    this.telegraphGraphics.lineStyle(2, 0xf43f5e, 0.8);
    this.telegraphGraphics.lineBetween(bx, by, px, py);

    this.time.delayedCall(450, () => {
      this.telegraphGraphics.clear();
      if (!this.activeBoss || !this.activeBoss.active) return;

      const angle = Phaser.Math.Angle.Between(bx, by, px, py);
      [-0.15, 0, 0.15].forEach((offset) => {
        const b = this.enemyProjectiles.create(bx, by, 'proj_boss_bullet');
        b.damage = 28;
        this.physics.velocityFromRotation(angle + offset, 440, b.body.velocity);
      });
      soundSystem.playLaser('enemy');
    });
  }

  updateBossBehavior(time) {
    if (this.callbacks.onBossHealthUpdate) {
      this.callbacks.onBossHealthUpdate({
        current: this.bossCurrentHealth,
        max: this.bossMaxHealth,
        percent: Math.max(0, this.bossCurrentHealth / this.bossMaxHealth)
      });
    }
  }

  // --- COLLISION HANDLERS ---
  handleProjectileHitEnemy(bullet, enemy) {
    bullet.destroy();
    this.shotsHit++;
    enemy.health -= bullet.damage || 20;

    // Hit flash effect
    enemy.setTint(0xffffff);
    this.time.delayedCall(60, () => {
      if (enemy.active) enemy.clearTint();
    });

    if (enemy.health <= 0) {
      this.destroyEnemy(enemy);
    }
  }

  handleProjectileHitBoss(boss, bullet) {
    bullet.destroy();
    this.shotsHit++;
    boss.health = (boss.health || this.bossCurrentHealth) - (bullet.damage || 20);
    this.bossCurrentHealth = Math.max(0, this.bossCurrentHealth - (bullet.damage || 20));

    // Flash boss crimson
    boss.setTint(0xff0055);
    this.time.delayedCall(70, () => {
      if (boss.active) boss.clearTint();
    });

    if (this.bossCurrentHealth <= 0) {
      this.destroyBoss(boss);
    }
  }

  handleEnemyProjectileHitPlayer(player, bullet) {
    bullet.destroy();
    if (this.isInvulnerable || this.activePowerups.shield_pulse) {
      soundSystem.playShieldDeflect();
      this.spawnCombatText(player.x, player.y - 20, 'SHIELD DEFLECT!', '#38bdf8');
      return;
    }

    this.applyPlayerDamage(bullet.damage || 15);
  }

  handleEnemyRamPlayer(player, enemy) {
    if (this.isInvulnerable || this.activePowerups.shield_pulse) return;

    this.applyPlayerDamage(30);
    if (!enemy.isBoss) {
      enemy.y -= 30;
    }
  }

  handlePickupCollection(player, pickup) {
    const kind = pickup.kind;
    pickup.destroy();
    soundSystem.playPickup(kind === 'energy' || kind === 'weapon' ? 'powerup' : 'credit');

    if (kind === 'credit') {
      this.creditsCollected += 50;
      this.score += 250;
      this.spawnCombatText(player.x, player.y - 15, '+50 CR', '#f59e0b');
    } else if (kind === 'energy') {
      this.energyCoresCollected += 1;
      this.score += 500;
      this.spawnCombatText(player.x, player.y - 15, '+1 CORE!', '#a855f7');
    } else if (kind === 'shield') {
      this.currentShield = Math.min(this.maxShield, this.currentShield + 35);
      if (this.shieldAura) this.shieldAura.setVisible(true);
      this.spawnCombatText(player.x, player.y - 15, '+35 SHIELD', '#38bdf8');
    } else if (kind === 'repair') {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 30);
      this.spawnCombatText(player.x, player.y - 15, '+30 HULL', '#10b981');
    } else if (kind === 'weapon') {
      this.triggerPowerup('spread_shot', 8);
      this.spawnCombatText(player.x, player.y - 15, 'SPREAD WEAPON!', '#eab308');
    } else if (kind === 'rapid') {
      this.triggerPowerup('rapid_fire', 8);
      this.spawnCombatText(player.x, player.y - 15, 'RAPID FIRE!', '#06b6d4');
    }

    if (this.callbacks.onPickup) {
      this.callbacks.onPickup(kind);
    }
    this.emitStatsUpdate();
  }

  destroyEnemy(enemy) {
    const ex = enemy.x;
    const ey = enemy.y;
    const scoreVal = enemy.scoreVal || 100;

    enemy.destroy();
    this.enemiesDefeated++;
    this.score += scoreVal;
    soundSystem.playExplosion('small');
    this.cameras.main.shake(80, 0.006);

    this.spawnCombatText(ex, ey, `+${scoreVal}`, '#38bdf8');

    // Chance to drop combat pickup
    const dropRoll = Math.random();
    if (enemy.type === 'elite' || dropRoll < 0.25) {
      this.spawnRandomPickup(ex, ey, enemy.type === 'elite');
    }

    // Check kill objective
    if (this.mission?.objective?.type === 'destroy_enemies') {
      if (this.enemiesDefeated >= this.mission.objective.targetCount) {
        this.triggerVictory();
      }
    }

    this.emitStatsUpdate();
  }

  destroyBoss(boss) {
    boss.destroy();
    this.bossDefeated = true;
    this.score += 5000;
    this.creditsCollected += 300;
    this.energyCoresCollected += 2;
    soundSystem.playExplosion('boss');

    // Dramatic Cascading Explosions sequence
    this.cameras.main.shake(700, 0.035);
    this.cameras.main.flash(500, 255, 255, 255);

    for (let i = 0; i < 8; i++) {
      this.time.delayedCall(i * 140, () => {
        soundSystem.playExplosion('large');
        const rx = boss.x + Phaser.Math.Between(-60, 60);
        const ry = boss.y + Phaser.Math.Between(-40, 40);
        this.spawnCombatText(rx, ry, '💥 BOOM', '#f97316');
      });
    }

    // High value loot cache burst
    this.time.delayedCall(600, () => {
      for (let j = 0; j < 3; j++) {
        this.spawnRandomPickup(boss.x + (j - 1) * 35, boss.y, true);
      }
    });

    this.time.delayedCall(1600, () => {
      this.triggerVictory();
    });
  }

  spawnRandomPickup(x, y, isElite = false) {
    const types = ['credit', 'credit', 'shield', 'repair', 'weapon', 'rapid'];
    if (isElite) types.push('energy');

    const chosen = Phaser.Utils.Array.GetRandom(types);
    const spriteKey = `pickup_${chosen}`;

    const pick = this.pickups.create(x, y, spriteKey);
    pick.kind = chosen;
    pick.setVelocityY(90);
    pick.setDepth(8);
  }

  applyPlayerDamage(amount) {
    this.damageTaken += amount;
    soundSystem.playExplosion('small');
    this.cameras.main.shake(140, 0.012);

    // Shield Absorption first
    if (this.currentShield > 0) {
      if (this.currentShield >= amount) {
        this.currentShield -= amount;
        amount = 0;
      } else {
        amount -= this.currentShield;
        this.currentShield = 0;
      }
    }

    if (amount > 0) {
      this.currentHealth -= amount;
    }

    // Temporary Invulnerability & Flashing
    this.isInvulnerable = true;
    this.tweens.add({
      targets: this.player,
      alpha: 0.2,
      yoyo: true,
      repeat: 4,
      duration: 120,
      onComplete: () => {
        this.player.setAlpha(1);
        this.isInvulnerable = false;
      }
    });

    // Check Hull Depletion & 3-Lives Arcade Rule
    if (this.currentHealth <= 0) {
      this.handlePlayerLifeLost();
    } else {
      this.emitStatsUpdate();
    }
  }

  handlePlayerLifeLost() {
    this.playerLives--;

    if (this.playerLives > 0) {
      // Deduct 1 reserve life, clear nearby bullets, warp back in!
      soundSystem.playLifeLost();
      this.cameras.main.shake(400, 0.025);
      this.cameras.main.flash(300, 56, 189, 248);

      // Clear all enemy projectiles in screen to give breathing room
      this.enemyProjectiles.clear(true, true);

      // Display Reserve Ship warp banner
      this.spawnCombatText(
        this.scale.width / 2,
        this.scale.height - 110,
        `RESERVE SHIP ENGAGED! 🚀 (${this.playerLives} LEFT)`,
        '#38bdf8'
      );

      // Restore hull & full shield
      this.currentHealth = this.maxHealth;
      this.currentShield = this.maxShield;
      this.player.setPosition(this.scale.width / 2, this.scale.height - 90);

      // 3 seconds of invulnerability shield
      this.isInvulnerable = true;
      soundSystem.playReserveShip();

      this.tweens.add({
        targets: this.player,
        alpha: 0.3,
        yoyo: true,
        repeat: 8,
        duration: 150,
        onComplete: () => {
          this.player.setAlpha(1);
          this.isInvulnerable = false;
        }
      });

      this.emitStatsUpdate();
    } else {
      // 0 lives left: Defeat
      this.currentHealth = 0;
      this.triggerDefeat();
    }
  }

  // --- POWER-UP ACTIVATIONS ---
  triggerPowerup(powerupId, duration = 8) {
    soundSystem.playPowerupActivate();

    if (powerupId === 'shield_pulse') {
      this.activePowerups.shield_pulse = true;
      if (this.shieldAura) this.shieldAura.setVisible(true);
      this.spawnCombatText(this.player.x, this.player.y - 30, 'SHIELD OVERCHARGE!', '#38bdf8');
      this.time.delayedCall(duration * 1000, () => {
        this.activePowerups.shield_pulse = false;
        if (this.shieldAura && this.currentShield <= 0) this.shieldAura.setVisible(false);
      });
    } else if (powerupId === 'rapid_fire') {
      this.activePowerups.rapid_fire = true;
      this.currentFireInterval = this.baseFireInterval * 0.45;
      this.spawnCombatText(this.player.x, this.player.y - 30, 'HYPER DRIVE FIRING!', '#06b6d4');
      this.time.delayedCall(duration * 1000, () => {
        this.activePowerups.rapid_fire = false;
        this.currentFireInterval = this.baseFireInterval;
      });
    } else if (powerupId === 'spread_shot') {
      this.activePowerups.spread_shot = true;
      this.spawnCombatText(this.player.x, this.player.y - 30, 'PENTA-SPREAD ENGAGED!', '#eab308');
      this.time.delayedCall(duration * 1000, () => {
        this.activePowerups.spread_shot = false;
      });
    } else if (powerupId === 'homing_missiles') {
      const enemies = this.enemies.getChildren().filter(e => e.active);
      this.spawnCombatText(this.player.x, this.player.y - 30, 'MISSILE SWARM LAUNCHED!', '#f43f5e');
      for (let i = 0; i < 8; i++) {
        const target = enemies[i % enemies.length] || this.activeBoss;
        const missile = this.playerProjectiles.create(this.player.x + (i - 3.5) * 12, this.player.y, 'proj_homing_missile');
        missile.damage = 38;
        if (target && target.active) {
          this.physics.moveToObject(missile, target, 500);
        } else {
          missile.setVelocityY(-520);
        }
      }
    } else if (powerupId === 'emp_blast') {
      // Clear all active enemy projectiles and shock enemies
      soundSystem.playSmartBomb();
      this.enemyProjectiles.clear(true, true);
      this.cameras.main.flash(500, 129, 140, 248);
      this.cameras.main.shake(300, 0.02);
      this.spawnCombatText(this.scale.width / 2, this.scale.height / 2, '⚡ EMP SHOCKWAVE SCREEN CLEAR ⚡', '#a855f7');
      this.enemies.getChildren().forEach((e) => {
        if (e.active) {
          e.health -= 60;
          if (e.health <= 0) this.destroyEnemy(e);
        }
      });
      if (this.activeBoss && this.activeBoss.active) {
        this.bossCurrentHealth = Math.max(0, this.bossCurrentHealth - 80);
      }
    } else if (powerupId === 'repair_drone') {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + this.maxHealth * 0.45);
      this.spawnCombatText(this.player.x, this.player.y - 30, 'NANITE REPAIR +45%!', '#10b981');
      this.emitStatsUpdate();
    } else if (powerupId === 'overdrive') {
      this.activePowerups.overdrive = true;
      this.spawnCombatText(this.player.x, this.player.y - 30, '⚡ OVERDRIVE ACTIVE ⚡', '#f97316');
      this.time.delayedCall(duration * 1000, () => {
        this.activePowerups.overdrive = false;
      });
    } else if (powerupId === 'emergency_warp') {
      this.player.setPosition(this.scale.width / 2, this.scale.height - 80);
      this.isInvulnerable = true;
      this.spawnCombatText(this.scale.width / 2, this.scale.height - 80, 'WARP JUMP!', '#38bdf8');
      this.time.delayedCall(1600, () => {
        this.isInvulnerable = false;
      });
    }
  }

  // --- REVIVE FROM CHECKPOINT ---
  revivePlayer() {
    this.isGameOver = false;
    this.playerLives = 1;
    this.currentHealth = Math.floor(this.maxHealth * 0.7);
    this.currentShield = this.maxShield;
    this.player.setActive(true).setVisible(true);
    this.player.setPosition(this.scale.width / 2, this.scale.height - 90);
    this.isInvulnerable = true;
    soundSystem.playReserveShip();
    this.time.delayedCall(2800, () => {
      this.isInvulnerable = false;
    });
    this.emitStatsUpdate();
    soundSystem.startAmbientMusic();
  }

  // --- OUTCOME TRIGGERS ---
  triggerVictory() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.isVictory = true;
    soundSystem.playVictory();

    let stars = 1;
    if (this.currentHealth >= this.maxHealth * 0.5) stars++;
    if (this.score >= (this.mission?.targetScore || 3000) && this.damageTaken < 100) stars++;

    const durationSec = Math.floor((Date.now() - this.startTime) / 1000);
    const accuracy = this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 100;

    const results = {
      status: 'VICTORY',
      score: this.score,
      stars,
      duration: durationSec,
      enemiesDefeated: this.enemiesDefeated,
      bossDefeated: this.bossDefeated,
      creditsEarned: (this.mission?.rewards?.credits || 100) + this.creditsCollected,
      xpEarned: this.mission?.rewards?.xp || 50,
      energyCoresEarned: (this.mission?.rewards?.energyCores || 0) + this.energyCoresCollected,
      accuracy,
      damageTaken: this.damageTaken,
    };

    if (this.callbacks.onMissionEnd) {
      this.callbacks.onMissionEnd(results);
    }
  }

  triggerDefeat() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.isVictory = false;
    soundSystem.playDefeat();

    const durationSec = Math.floor((Date.now() - this.startTime) / 1000);
    const results = {
      status: 'DEFEAT',
      score: this.score,
      stars: 0,
      duration: durationSec,
      enemiesDefeated: this.enemiesDefeated,
      bossDefeated: false,
      creditsEarned: Math.floor(this.creditsCollected * 0.5),
      xpEarned: 25,
      energyCoresEarned: 0,
      accuracy: this.shotsFired > 0 ? Math.round((this.shotsHit / this.shotsFired) * 100) : 0,
      damageTaken: this.damageTaken,
    };

    if (this.callbacks.onMissionEnd) {
      this.callbacks.onMissionEnd(results);
    }
  }

  emitStatsUpdate() {
    if (this.callbacks.onStatsUpdate) {
      this.callbacks.onStatsUpdate({
        health: this.currentHealth,
        maxHealth: this.maxHealth,
        shield: this.currentShield,
        maxShield: this.maxShield,
        score: this.score,
        credits: this.creditsCollected,
        energyCores: this.energyCoresCollected,
        enemiesDefeated: this.enemiesDefeated,
        lives: this.playerLives,
      });
    }
  }
}
