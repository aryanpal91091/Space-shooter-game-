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

    // Invulnerability frames
    this.isInvulnerable = false;
    this.lastFireTime = 0;

    // Wave management
    this.currentWaveIndex = 0;
    this.waveSpawnTimer = null;
    this.activeEnemies = [];
    this.activeBoss = null;
    this.bossMaxHealth = 1000;
    this.bossCurrentHealth = 1000;
  }

  create() {
    const { width, height } = this.scale;

    // Create 3-layer parallax starfield
    this.stars = [];
    for (let i = 0; i < 75; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.FloatBetween(0.8, 2.2),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 0.9)
      );
      star.speed = star.radius * 0.9;
      this.stars.push(star);
    }

    // Physics Groups
    this.playerProjectiles = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.pickups = this.physics.add.group();

    // Create Player Ship
    const shipSpriteKey = `ship_${this.shipConfig?.id || 'interceptor'}`;
    this.player = this.physics.add.sprite(width / 2, height - 90, shipSpriteKey);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(48, 48);

    // Shield Aura Visual Graphic
    this.shieldAura = this.add.circle(this.player.x, this.player.y, 42, 0x06b6d4, 0.35);
    this.shieldAura.setStrokeStyle(2, 0x38bdf8);
    this.shieldAura.setVisible(this.currentShield > 0);

    // Setup Desktop Keyboard Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Mobile touch pointer drag controls
    this.input.on('pointermove', (pointer) => {
      if (pointer.isDown && !this.isGameOver && !this.isPaused) {
        this.player.x = Phaser.Math.Clamp(pointer.x, 30, width - 30);
        this.player.y = Phaser.Math.Clamp(pointer.y, 60, height - 40);
      }
    });

    // Setup Collisions
    // 1. Player Projectiles hitting Enemies
    this.physics.add.overlap(this.playerProjectiles, this.enemies, this.handleProjectileHitEnemy, null, this);

    // 2. Enemy Projectiles hitting Player
    this.physics.add.overlap(this.enemyProjectiles, this.player, this.handleEnemyProjectileHitPlayer, null, this);

    // 3. Enemy ramming Player
    this.physics.add.overlap(this.enemies, this.player, this.handleEnemyRamPlayer, null, this);

    // 4. Player collecting Pickups
    this.physics.add.overlap(this.player, this.pickups, this.handlePickupCollection, null, this);

    // Start wave spawner
    this.startNextWave();

    // Notify React initial stats
    this.emitStatsUpdate();
    soundSystem.startAmbientMusic();
  }

  update(time, delta) {
    if (this.isGameOver || this.isPaused) return;

    const { width, height } = this.scale;

    // Scroll parallax stars
    for (const star of this.stars) {
      star.y += star.speed;
      if (star.y > height) {
        star.y = 0;
        star.x = Phaser.Math.Between(0, width);
      }
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

    const currentSpeed = this.activePowerups.overdrive ? this.playerSpeed * 1.3 : this.playerSpeed;
    this.player.setVelocity(vx * currentSpeed, vy * currentSpeed);

    // Update Shield Aura position
    if (this.shieldAura) {
      this.shieldAura.setPosition(this.player.x, this.player.y);
      this.shieldAura.setVisible(this.currentShield > 0 || this.activePowerups.shield_pulse);
    }

    // Continuous weapon firing (automatic or space/pointer held)
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
        bullet.setVelocity(Math.cos(rad) * 600, Math.sin(rad) * 600);
      }
    } else {
      // Standard twin lasers
      const b1 = this.playerProjectiles.create(px - 14, py, 'proj_laser_player');
      const b2 = this.playerProjectiles.create(px + 14, py, 'proj_laser_player');
      b1.damage = damage;
      b2.damage = damage;
      b1.setVelocityY(-620);
      b2.setVelocityY(-620);
    }
  }

  // --- ENEMY SPAWNING & WAVES ---
  startNextWave() {
    if (this.isGameOver) return;

    const waves = this.mission?.waves || [];
    if (this.currentWaveIndex >= waves.length) {
      // All waves cleared: If boss mission, spawn boss!
      if (this.mission?.isBossMission && !this.activeBoss && !this.bossDefeated) {
        this.spawnBoss();
      } else if (!this.mission?.isBossMission) {
        // Normal mission complete!
        this.triggerVictory();
      }
      return;
    }

    const currentWave = waves[this.currentWaveIndex];
    this.currentWaveIndex++;

    if (this.callbacks.onWaveStart) {
      this.callbacks.onWaveStart(this.currentWaveIndex, waves.length);
    }

    // Spawn enemies with staggered delays
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

    // Check wave completion after delay
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
      // Check again shortly
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

    // Movement & AI behaviors
    if (type === 'scout') {
      enemy.setVelocityY(speed);
      this.setupEnemyFiring(enemy, 1600, 'proj_laser_enemy');
    } else if (type === 'interceptor') {
      enemy.setVelocityY(speed);
      // Sine wave oscillation
      enemy.sinePhase = Math.random() * Math.PI * 2;
      this.setupEnemyFiring(enemy, 1400, 'proj_laser_enemy');
    } else if (type === 'cruiser') {
      enemy.setVelocityY(speed);
      this.setupEnemyFiring(enemy, 1800, 'proj_plasma_ball', true);
    } else if (type === 'gunship') {
      // Enters and hovers in upper screen
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
      // Dynamic strafing
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
        // 3-way burst
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

  // --- BOSS ENCOUNTERS ---
  spawnBoss() {
    const { width } = this.scale;
    const bossKey = this.mission.bossId || 'boss_warden';
    
    // Announce boss
    if (this.callbacks.onBossSpawn) {
      this.callbacks.onBossSpawn(this.mission.bossName);
    }

    this.bossMaxHealth = 800 + (this.mission.sequence * 80);
    this.bossCurrentHealth = this.bossMaxHealth;

    this.activeBoss = this.physics.add.sprite(width / 2, -100, bossKey);
    this.activeBoss.body.setSize(120, 90);
    this.activeBoss.isBoss = true;

    // Boss Entry Tween
    this.tweens.add({
      targets: this.activeBoss,
      y: 110,
      duration: 3000,
      ease: 'Power2',
      onComplete: () => {
        this.initBossCombatPatterns();
      }
    });

    // Overlap collision with player projectiles
    this.physics.add.overlap(this.playerProjectiles, this.activeBoss, this.handleProjectileHitBoss, null, this);
    this.physics.add.overlap(this.activeBoss, this.player, this.handleEnemyRamPlayer, null, this);
  }

  initBossCombatPatterns() {
    const { width } = this.scale;

    // Movement: Left & Right Hover
    this.tweens.add({
      targets: this.activeBoss,
      x: width - 80,
      yoyo: true,
      repeat: -1,
      duration: 4500,
      ease: 'Sine.easeInOut'
    });

    // Firing Loop based on Boss Phase
    this.bossTimer = this.time.addEvent({
      delay: 1800,
      loop: true,
      callback: () => {
        if (!this.activeBoss || !this.activeBoss.active || this.isGameOver) {
          if (this.bossTimer) this.bossTimer.destroy();
          return;
        }

        const hpPercent = this.bossCurrentHealth / this.bossMaxHealth;

        if (hpPercent > 0.6) {
          // Phase 1: Dual Gatling Pulses
          [-35, 35].forEach((offset) => {
            const b = this.enemyProjectiles.create(this.activeBoss.x + offset, this.activeBoss.y + 45, 'proj_boss_bullet');
            b.damage = 22;
            b.setVelocityY(320);
          });
          soundSystem.playLaser('enemy');
        } else if (hpPercent > 0.3) {
          // Phase 2: Circular Bullet Spread
          for (let a = 0; a < 360; a += 45) {
            const rad = Phaser.Math.DegToRad(a);
            const b = this.enemyProjectiles.create(this.activeBoss.x, this.activeBoss.y + 30, 'proj_plasma_ball');
            b.damage = 20;
            b.setVelocity(Math.cos(rad) * 220, Math.sin(rad) * 220);
          }
          soundSystem.playLaser('enemy');
        } else {
          // Phase 3 (Enraged): Rapid Aimed Volleys
          if (this.player.active) {
            const angle = Phaser.Math.Angle.Between(this.activeBoss.x, this.activeBoss.y, this.player.x, this.player.y);
            [-0.2, 0, 0.2].forEach((spread) => {
              const b = this.enemyProjectiles.create(this.activeBoss.x, this.activeBoss.y + 40, 'proj_boss_bullet');
              b.damage = 26;
              this.physics.velocityFromRotation(angle + spread, 380, b.body.velocity);
            });
            soundSystem.playLaser('enemy');
          }
        }
      }
    });
  }

  updateBossBehavior(time) {
    // Notify React of boss HP
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
    this.bossCurrentHealth -= bullet.damage || 20;

    // Flash boss red
    boss.setTint(0xff0055);
    this.time.delayedCall(80, () => {
      if (boss.active) boss.clearTint();
    });

    if (this.bossCurrentHealth <= 0) {
      this.destroyBoss(boss);
    }
  }

  handleEnemyProjectileHitPlayer(player, bullet) {
    bullet.destroy();
    if (this.isInvulnerable || this.activePowerups.shield_pulse) return;

    this.applyPlayerDamage(bullet.damage || 15);
  }

  handleEnemyRamPlayer(player, enemy) {
    if (this.isInvulnerable || this.activePowerups.shield_pulse) return;

    this.applyPlayerDamage(30);
    // Knock enemy back
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
    } else if (kind === 'energy') {
      this.energyCoresCollected += 1;
      this.score += 500;
    } else if (kind === 'shield') {
      this.currentShield = Math.min(this.maxShield, this.currentShield + 35);
      if (this.shieldAura) this.shieldAura.setVisible(true);
    } else if (kind === 'repair') {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + 30);
    } else if (kind === 'weapon') {
      this.triggerPowerup('spread_shot', 8);
    } else if (kind === 'rapid') {
      this.triggerPowerup('rapid_fire', 8);
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

    // Chance to drop combat pickup (elite has 100% chance)
    const dropRoll = Math.random();
    if (enemy.type === 'elite' || dropRoll < 0.22) {
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

    // Trigger multiple explosion ripples
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 180, () => {
        soundSystem.playExplosion('large');
      });
    }

    this.time.delayedCall(1500, () => {
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
  }

  applyPlayerDamage(amount) {
    this.damageTaken += amount;
    soundSystem.playExplosion('small');

    // Absorb through shield first
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

    if (this.currentHealth <= 0) {
      this.currentHealth = 0;
      this.triggerDefeat();
    }

    this.emitStatsUpdate();
  }

  // --- POWER-UP ACTIVATIONS ---
  triggerPowerup(powerupId, duration = 8) {
    soundSystem.playPowerupActivate();

    if (powerupId === 'shield_pulse') {
      this.activePowerups.shield_pulse = true;
      if (this.shieldAura) this.shieldAura.setVisible(true);
      this.time.delayedCall(duration * 1000, () => {
        this.activePowerups.shield_pulse = false;
        if (this.shieldAura && this.currentShield <= 0) this.shieldAura.setVisible(false);
      });
    } else if (powerupId === 'rapid_fire') {
      this.activePowerups.rapid_fire = true;
      this.currentFireInterval = this.baseFireInterval * 0.45;
      this.time.delayedCall(duration * 1000, () => {
        this.activePowerups.rapid_fire = false;
        this.currentFireInterval = this.baseFireInterval;
      });
    } else if (powerupId === 'spread_shot') {
      this.activePowerups.spread_shot = true;
      this.time.delayedCall(duration * 1000, () => {
        this.activePowerups.spread_shot = false;
      });
    } else if (powerupId === 'homing_missiles') {
      // Launch 6 micro missiles immediately
      const enemies = this.enemies.getChildren().filter(e => e.active);
      for (let i = 0; i < 6; i++) {
        const target = enemies[i % enemies.length] || this.activeBoss;
        const missile = this.playerProjectiles.create(this.player.x + (i - 2.5) * 12, this.player.y, 'proj_homing_missile');
        missile.damage = 35;
        if (target && target.active) {
          this.physics.moveToObject(missile, target, 480);
        } else {
          missile.setVelocityY(-500);
        }
      }
    } else if (powerupId === 'emp_blast') {
      // Clear all active enemy projectiles and shock enemies
      this.enemyProjectiles.clear(true, true);
      this.cameras.main.flash(400, 129, 140, 248);
      this.enemies.getChildren().forEach((e) => {
        if (e.active) {
          e.health -= 50;
          if (e.health <= 0) this.destroyEnemy(e);
        }
      });
    } else if (powerupId === 'repair_drone') {
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + this.maxHealth * 0.4);
      this.emitStatsUpdate();
    } else if (powerupId === 'overdrive') {
      this.activePowerups.overdrive = true;
      this.time.delayedCall(duration * 1000, () => {
        this.activePowerups.overdrive = false;
      });
    } else if (powerupId === 'emergency_warp') {
      // Teleport safely to bottom center
      this.player.setPosition(this.scale.width / 2, this.scale.height - 80);
      this.isInvulnerable = true;
      this.time.delayedCall(1500, () => {
        this.isInvulnerable = false;
      });
    }
  }

  // --- REVIVE FROM CHECKPOINT ---
  revivePlayer() {
    this.isGameOver = false;
    this.currentHealth = Math.floor(this.maxHealth * 0.6);
    this.currentShield = this.maxShield;
    this.player.setActive(true).setVisible(true);
    this.player.setPosition(this.scale.width / 2, this.scale.height - 90);
    this.isInvulnerable = true;
    this.time.delayedCall(2500, () => {
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

    // Calculate 3-star rating
    let stars = 1; // Completed
    if (this.currentHealth >= this.maxHealth * 0.5) stars++; // High health
    if (this.score >= (this.mission?.targetScore || 3000) && this.damageTaken < 100) stars++; // Mastery

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
      creditsEarned: Math.floor(this.creditsCollected * 0.5), // Partial salvage
      xpEarned: 20,
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
      });
    }
  }
}
