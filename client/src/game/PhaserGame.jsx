import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import SpaceScene from './scenes/SpaceScene';

export default function PhaserGame({
  mission,
  shipConfig,
  upgrades,
  onStatsUpdate,
  onBossHealthUpdate,
  onMissionEnd,
  onWaveStart,
  onBossSpawn,
  gameInstanceRef,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 480,
      height: 720,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: [BootScene, SpaceScene],
      backgroundColor: '#030712',
    };

    const game = new Phaser.Game(config);
    if (gameInstanceRef) {
      gameInstanceRef.current = game;
    }

    // Pass parameters to SpaceScene when Boot finishes
    game.events.once('ready', () => {
      const spaceScene = game.scene.getScene('SpaceScene');
      if (spaceScene) {
        spaceScene.scene.start('SpaceScene', {
          mission,
          shipConfig,
          upgrades,
          callbacks: {
            onStatsUpdate,
            onBossHealthUpdate,
            onMissionEnd,
            onWaveStart,
            onBossSpawn,
          },
        });
      }
    });

    return () => {
      if (game) {
        game.destroy(true);
      }
    };
  }, [mission?.id, shipConfig?.id]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] bg-[#030712]"
    />
  );
}
