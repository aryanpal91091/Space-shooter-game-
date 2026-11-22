import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Load Player Ships
    this.load.svg('ship_interceptor', '/assets/ships/interceptor.svg', { width: 64, height: 64 });
    this.load.svg('ship_striker', '/assets/ships/striker.svg', { width: 64, height: 64 });
    this.load.svg('ship_guardian', '/assets/ships/guardian.svg', { width: 68, height: 68 });
    this.load.svg('ship_support', '/assets/ships/support.svg', { width: 64, height: 64 });
    this.load.svg('ship_experimental', '/assets/ships/experimental.svg', { width: 64, height: 64 });

    // Load Enemies
    this.load.svg('enemy_scout', '/assets/enemies/scout.svg', { width: 44, height: 44 });
    this.load.svg('enemy_interceptor', '/assets/enemies/interceptor.svg', { width: 48, height: 48 });
    this.load.svg('enemy_cruiser', '/assets/enemies/cruiser.svg', { width: 60, height: 60 });
    this.load.svg('enemy_gunship', '/assets/enemies/gunship.svg', { width: 56, height: 56 });
    this.load.svg('enemy_elite', '/assets/enemies/elite.svg', { width: 64, height: 64 });

    // Load Bosses
    this.load.svg('boss_warden', '/assets/bosses/boss_warden.svg', { width: 140, height: 120 });
    this.load.svg('boss_serpent', '/assets/bosses/boss_serpent.svg', { width: 140, height: 120 });
    this.load.svg('boss_solar', '/assets/bosses/boss_solar.svg', { width: 140, height: 120 });
    this.load.svg('boss_carrier', '/assets/bosses/boss_carrier.svg', { width: 150, height: 120 });
    this.load.svg('boss_emperor', '/assets/bosses/boss_emperor.svg', { width: 160, height: 130 });

    // Load Projectiles
    this.load.svg('proj_laser_player', '/assets/projectiles/laser_player.svg', { width: 12, height: 28 });
    this.load.svg('proj_laser_enemy', '/assets/projectiles/laser_enemy.svg', { width: 12, height: 28 });
    this.load.svg('proj_plasma_ball', '/assets/projectiles/plasma_ball.svg', { width: 20, height: 20 });
    this.load.svg('proj_boss_bullet', '/assets/projectiles/boss_bullet.svg', { width: 26, height: 26 });
    this.load.svg('proj_homing_missile', '/assets/projectiles/homing_missile.svg', { width: 14, height: 28 });

    // Load Pickups
    this.load.svg('pickup_credit', '/assets/pickups/credit_cache.svg', { width: 28, height: 28 });
    this.load.svg('pickup_energy', '/assets/pickups/energy_core.svg', { width: 28, height: 28 });
    this.load.svg('pickup_shield', '/assets/pickups/shield_orb.svg', { width: 28, height: 28 });
    this.load.svg('pickup_repair', '/assets/pickups/repair_orb.svg', { width: 28, height: 28 });
    this.load.svg('pickup_weapon', '/assets/pickups/weapon_up.svg', { width: 28, height: 28 });
    this.load.svg('pickup_rapid', '/assets/pickups/rapid_module.svg', { width: 28, height: 28 });
  }

  create() {
    this.scene.start('SpaceScene');
  }
}
