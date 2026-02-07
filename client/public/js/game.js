// Main Game Controller

class Game {
    constructor() {
        // Three.js setup
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Game objects
        this.track = null;
        this.karts = [];
        this.playerKart = null;
        this.aiControllers = [];
        
        // Managers
        this.itemManager = null;
        this.particleSystem = null;
        this.uiManager = null;
        
        // Game state
        this.gameState = 'loading'; // loading, menu, countdown, racing, paused, finished
        this.difficulty = 'normal';
        this.totalLaps = 3;
        this.numRacers = 8;
        
        // Race state
        this.raceTime = 0;
        this.raceStartTime = 0;
        
        // Input state
        this.keys = {};
        
        // Camera settings
        this.cameraDistance = 15;
        this.cameraHeight = 6;
        this.cameraLookAhead = 8;
        
        // Performance
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.fpsUpdateTimer = 0;
        
        // メモリ管理
        this.memoryCleanupTimer = 0;
        this.memoryCleanupInterval = 30;  // 30秒ごとにクリーンアップ
        this.performanceMode = false;
        
        // Initialize
        this.init();
    }
    
    async init() {
        // Create UI manager
        this.uiManager = new UIManager();
        this.uiManager.updateLoading(10, 'Initializing...');
        
        // Setup Three.js
        this.setupRenderer();
        this.uiManager.updateLoading(20, 'Setting up renderer...');
        
        this.setupScene();
        this.uiManager.updateLoading(30, 'Creating scene...');
        
        this.setupCamera();
        this.uiManager.updateLoading(40, 'Setting up camera...');
        
        this.setupLights();
        this.uiManager.updateLoading(50, 'Adding lights...');
        
        // Track will be created when race starts (based on course selection)
        this.track = null;
        this.uiManager.updateLoading(70, 'Preparing track system...');
        
        // Create particle system
        this.particleSystem = new ParticleSystem(this.scene);
        this.uiManager.updateLoading(80, 'Setting up effects...');
        
        // Create item manager (track will be set when race starts)
        this.itemManager = new ItemManager(this.scene, null);
        this.uiManager.updateLoading(85, 'Loading items...');
        
        // Setup input
        this.setupInput();
        this.uiManager.updateLoading(90, 'Configuring controls...');
        
        // Initialize audio
        await window.audioManager.init();
        this.uiManager.updateLoading(95, 'Loading audio...');
        
        // Setup resize handler
        window.addEventListener('resize', () => this.onResize());
        
        // Done loading
        this.uiManager.updateLoading(100, 'Ready!');
        
        setTimeout(() => {
            this.uiManager.hideLoading();
            this.uiManager.showMainMenu();
            this.gameState = 'menu';
            
            // Start background music
            window.audioManager.playLocalMusic('audio/01_Opening_Theme.mp3');
        }, 500);
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: false,  // アンチエイリアスを完全に無効化（パフォーマンス向上）
            powerPreference: 'high-performance',
            stencil: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(1);  // 常に1（パフォーマンス最優先）
        this.renderer.shadowMap.enabled = false;  // シャドウを無効化（大幅なパフォーマンス向上）
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        // Optimization: frustum culling is on by default
        this.renderer.sortObjects = true;
        
        document.getElementById('game-container').appendChild(this.renderer.domElement);
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        
        // デフォルトの背景色（後でコース選択時に変更）
        this.scene.background = new THREE.Color(0x5BC0F8);
        this.scene.fog = new THREE.Fog(0x5BC0F8, 400, 900);
    }
    
    // コースタイプに応じたシーン設定を更新
    updateSceneForCourse() {
        const courseType = window.gameSettings?.courseType || 'grassland';
        
        let bgColor, fogColor;
        switch(courseType) {
            case 'snow':
                bgColor = 0xE0FFFF;  // 明るい水色（雪空）
                fogColor = 0xCCE0FF;
                break;
            case 'castle':
                bgColor = 0x2F2F4F;  // 暗い紫がかったグレー
                fogColor = 0x1F1F3F;
                break;
            case 'grassland':
            default:
                bgColor = 0x5BC0F8;  // マリオカート風の明るい青空
                fogColor = 0x5BC0F8;
                break;
        }
        
        this.scene.background = new THREE.Color(bgColor);
        this.scene.fog = new THREE.Fog(fogColor, 400, 900);

        // コースごとのパフォーマンス設定
        // すべてのコースで負荷軽減を有効化
        this.performanceMode = true;
        this.memoryCleanupInterval = 10;
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            1500  // 遠くまで見えるように
        );
        this.camera.position.set(0, 10, -20);
    }
    
    setupLights() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);
        
        // Directional light (sun)
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(100, 100, 50);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 10;
        sun.shadow.camera.far = 400;
        sun.shadow.camera.left = -150;
        sun.shadow.camera.right = 150;
        sun.shadow.camera.top = 150;
        sun.shadow.camera.bottom = -150;
        this.scene.add(sun);
        
        // Hemisphere light for sky color
        const hemi = new THREE.HemisphereLight(0x87CEEB, 0x228B22, 0.3);
        this.scene.add(hemi);
    }
    
    setupInput() {
        // Keyboard input
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Pause toggle
            if (e.code === 'KeyP' || e.code === 'Escape') {
                if (this.gameState === 'racing') {
                    this.pauseRace();
                } else if (this.gameState === 'paused') {
                    this.resumeRace();
                }
            }
            
            // Resume audio context on first input
            window.audioManager.resume();
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    updatePlayerInput() {
        if (!this.playerKart) return;
        
        const input = this.playerKart.input;
        
        input.forward = this.keys['ArrowUp'] || this.keys['KeyW'];
        input.backward = this.keys['ArrowDown'] || this.keys['KeyS'];
        input.left = this.keys['ArrowLeft'] || this.keys['KeyA'];
        input.right = this.keys['ArrowRight'] || this.keys['KeyD'];
        input.drift = this.keys['Space'];
        
        // Item use (Shift or Z/X key)
        // ルーレット回転中はアイテム使用を禁止
        const isRouletteSpinning = this.uiManager && this.uiManager.isRouletteRunning;
        if (this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.keys['KeyZ'] || this.keys['KeyX']) {
            if (this.playerKart.currentItem && !isRouletteSpinning) {
                this.playerKart.useItem(this);
            }
        }
    }
    
    async startRace(difficulty = 'normal') {
        this.difficulty = difficulty;
        this.gameState = 'countdown';
        
        // CC別速度倍率を設定（50cc=1.0, 100cc=1.3, 150cc=1.6）
        this.ccSpeedMultiplier = difficulty === 'easy' ? 1.0 : difficulty === 'normal' ? 1.3 : 1.6;
        
        // Clear any existing karts and track
        this.clearRace();
        
        // Create new track based on selected course type
        this.track = new Track(this.scene);
        
        // Update item manager with new track
        if (this.itemManager) {
            this.itemManager.track = this.track;
        }
        
        // Update scene background based on course type
        this.updateSceneForCourse();
        
        // Create karts
        this.createKarts();
        
        // Position karts at start
        this.positionKartsAtStart();
        
        // Show HUD
        this.uiManager.showHUD();
        
        // Start race music
        window.audioManager.stopMusic();
        // コースごとにBGM切り替え
        let bgm = 'audio/02_Moo_Moo_Farm.mp3';
        if (window.gameSettings?.courseType === 'snow') bgm = 'audio/03_Frappe_Snowland.mp3';
        else if (window.gameSettings?.courseType === 'castle') bgm = 'audio/04_Bowser_Castle.mp3';
        window.audioManager.playLocalMusic(bgm);
        
        // Start engine sounds
        window.audioManager.startEngine();
        
        // Show countdown
        await this.uiManager.showCountdown();
        
        // Start race
        this.gameState = 'racing';
        this.raceStartTime = performance.now();
        this.raceTime = 0;
        
        // Set race start time for each kart (to prevent false lap count at start)
        this.karts.forEach(kart => {
            kart.raceStartTime = this.raceStartTime;
        });
    }
    
    createKarts() {
        // Create player kart
        this.playerKart = new Kart(this.scene, 0, true, 'Player');
        // CC別速度倍率を適用
        if (this.ccSpeedMultiplier) {
            this.playerKart.maxSpeed *= this.ccSpeedMultiplier;
            this.playerKart.acceleration *= this.ccSpeedMultiplier;
        }
        this.karts.push(this.playerKart);
        
        // Create AI karts
        for (let i = 1; i < this.numRacers; i++) {
            const aiKart = new Kart(this.scene, i, false, RacerNames[i]);
            // CC別速度倍率をAIにも適用
            if (this.ccSpeedMultiplier) {
                aiKart.maxSpeed *= this.ccSpeedMultiplier;
                aiKart.acceleration *= this.ccSpeedMultiplier;
            }
            this.karts.push(aiKart);
            
            const aiController = new AIController(aiKart, this.track, this.difficulty);
            this.aiControllers.push(aiController);
        }
    }
    
    positionKartsAtStart() {
        const startPositions = this.track.getStartPositions(this.numRacers);
        
        // Shuffle positions for AI variety (player always in back)
        this.karts.forEach((kart, index) => {
            const pos = startPositions[index];
            kart.setPosition(pos.x, pos.y, pos.z, pos.rotation);
            kart.lap = 0;
            kart.checkpoint = 0;
            kart.lastCheckpoint = -1;
            kart.finished = false;
            kart.finishTime = 0;
            kart.totalProgress = 0;
            kart.speed = 0;
            kart.currentItem = null;
            kart.hasShield = false;
            kart.isShrunken = false;
            kart.isFrozen = false;
            kart.isSpunOut = false;
            kart.isDrifting = false;
            kart.driftLevel = 0;
            kart.driftTime = 0;
            kart.boostTime = 0;
            kart.finalLapShown = false;
        });
    }
    
    clearRace() {
        // Remove all karts with geometry/material disposal
        this.karts.forEach(kart => {
            this.disposeObject(kart.mesh);
            this.scene.remove(kart.mesh);
        });
        this.karts = [];
        this.aiControllers = [];
        this.playerKart = null;
        
        // Clear items
        if (this.itemManager) {
            this.itemManager.clear();
        }
        
        // Clear particles
        if (this.particleSystem) {
            this.particleSystem.clear();
        }
        
        // Remove old track with full disposal
        if (this.track) {
            // Remove all enemies
            if (this.track.enemies) {
                this.track.enemies.forEach(enemy => {
                    this.disposeObject(enemy.mesh);
                    this.scene.remove(enemy.mesh);
                });
            }
            this.disposeObject(this.track.trackGroup);
            this.scene.remove(this.track.trackGroup);
            this.track = null;
        }
    }
    
    // メモリ解放用ヘルパー
    disposeObject(obj) {
        if (!obj) return;
        obj.traverse(child => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                        if (mat.map) mat.map.dispose();
                        mat.dispose();
                    });
                } else {
                    if (child.material.map) child.material.map.dispose();
                    child.material.dispose();
                }
            }
        });
    }
    
    pauseRace() {
        if (this.gameState !== 'racing' && this.gameState !== 'countdown') return;
        
        this.gameState = 'paused';
        this.uiManager.showPauseMenu();
        window.audioManager.stopEngine();
    }
    
    resumeRace() {
        if (this.gameState !== 'paused') return;
        
        this.gameState = 'racing';
        this.uiManager.hidePauseMenu();
        window.audioManager.startEngine();
    }
    
    restartRace() {
        this.gameState = 'menu';
        this.uiManager.hideAllScreens();
        this.clearRace();
        
        // Start new race
        this.startRace(this.difficulty);
    }
    
    returnToMenu() {
        this.gameState = 'menu';
        this.clearRace();
        this.uiManager.showMainMenu();
        
        window.audioManager.stopEngine();
        window.audioManager.stopMusic();
        window.audioManager.playMusic('menu');
    }
    
    // 定期的なメモリクリーンアップ
    performMemoryCleanup() {
        // 非アクティブなアイテムのメッシュを解放
        if (this.itemManager) {
            this.itemManager.cleanupInactiveItems();
        }
        
        // パーティクルシステムのクリーンアップ
        if (this.particleSystem) {
            this.particleSystem.cleanup();
        }

        // レンダーリストの解放は不要（フレームドロップの原因になる）
        // renderer.info.resetもカウンターリセットのみなので不要
    }
    
    finishRace() {
        this.gameState = 'finished';
        
        window.audioManager.stopEngine();
        window.audioManager.stopMusic();
        window.audioManager.playVictoryFanfare();
        
        // Build results
        const results = this.karts
            .sort((a, b) => {
                if (a.finished && b.finished) {
                    return a.finishTime - b.finishTime;
                }
                if (a.finished) return -1;
                if (b.finished) return 1;
                return b.totalProgress - a.totalProgress;
            })
            .map((kart, index) => ({
                name: kart.name,
                time: kart.finishTime || this.raceTime,
                isPlayer: kart.isPlayer,
                position: index + 1
            }));
        
        this.uiManager.showResults(results);
    }
    
    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());
        
        const currentTime = performance.now();
        this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        
        // Update FPS counter
        this.fpsUpdateTimer += this.deltaTime;
        if (this.fpsUpdateTimer >= 0.5) {
            this.fps = Math.round(1 / this.deltaTime);
            this.fpsUpdateTimer = 0;
        }
        
        // Update based on game state
        if (this.gameState === 'racing') {
            this.updateRace();
        } else if (this.gameState === 'countdown') {
            this.updateCountdown();
        }
        
        // Always render
        this.render();
    }
    
    updateRace() {
        try {
            // Update race time
            this.raceTime = performance.now() - this.raceStartTime;
            
            // Update player input FIRST
            this.updatePlayerInput();
            
            // Update AI inputs BEFORE updating karts (critical fix!)
            this.aiControllers.forEach(ai => {
                ai.update(this.deltaTime, this.karts);
            });
            
            // Now update all karts with their inputs set
            this.karts.forEach(kart => {
                kart.update(this.deltaTime, this.track);
            });
            
            // Handle kart collisions
            this.handleKartCollisions();
            
            // 敵キャラクター（ドッスン、ノコノコ）の更新と衝突判定
            this.track.updateEnemies(this.deltaTime);
            this.checkEnemyCollisions();
            
            // Update items
            this.itemManager.update(this.deltaTime, this.karts);
            
            // Update track (item box respawns, etc.)
            this.track.update(this.deltaTime);
            
            // Update particles
            this.updateParticles();
            this.particleSystem.update(this.deltaTime);
            
            // Update positions
            this.updateRacePositions();
            
            // Check for lap completion and race finish
            this.checkLapCompletion();
            
            // Update camera
            this.updateCamera();
            
            // Update audio
            this.updateAudio();
            
            // Update UI
            this.updateUI();
            
            // 定期的なメモリクリーンアップ
            this.memoryCleanupTimer += this.deltaTime;
            if (this.memoryCleanupTimer >= this.memoryCleanupInterval) {
                this.memoryCleanupTimer = 0;
                this.performMemoryCleanup();
            }
        } catch (e) {
            console.error('Error in updateRace:', e);
        }
    }
    
    updateCountdown() {
        // カウントダウン中はプレイヤーの背後に即座に移動
        if (!this.playerKart) return;
        
        const kart = this.playerKart;
        const baseCameraDistance = 10;
        const baseCameraHeight = 6;
        
        const cameraOffset = new THREE.Vector3(
            -Math.sin(kart.rotation) * baseCameraDistance,
            baseCameraHeight,
            -Math.cos(kart.rotation) * baseCameraDistance
        );
        
        const targetPos = kart.position.clone().add(cameraOffset);
        this.camera.position.lerp(targetPos, 0.6);
        
        const lookAhead = 6;
        const lookTarget = kart.position.clone();
        lookTarget.x += Math.sin(kart.rotation) * lookAhead;
        lookTarget.z += Math.cos(kart.rotation) * lookAhead;
        lookTarget.y += 2;
        
        this.camera.lookAt(lookTarget);
        
        // カメラスムージング状態を初期化（レース開始時にジャンプしないように）
        this.lastCameraTarget = this.camera.position.clone();
        this.lastCameraRotation = kart.rotation;
        this.smoothCameraPos = this.camera.position.clone();
        this.smoothLookTarget = lookTarget.clone();
    }
    
    handleKartCollisions() {
        for (let i = 0; i < this.karts.length; i++) {
            for (let j = i + 1; j < this.karts.length; j++) {
                if (this.karts[i].checkCollision(this.karts[j])) {
                    const kartA = this.karts[i];
                    const kartB = this.karts[j];
                    
                    // スター状態のカートが体当たりした場合、相手をクラッシュさせる
                    if (kartA.starActive && !kartB.starActive) {
                        if (!kartB.isSpunOut && kartB.invincibilityTimer <= 0) {
                            kartB.spinOut();
                            if (window.audioManager) {
                                window.audioManager.playSound('crash');
                            }
                        }
                    } else if (kartB.starActive && !kartA.starActive) {
                        if (!kartA.isSpunOut && kartA.invincibilityTimer <= 0) {
                            kartA.spinOut();
                            if (window.audioManager) {
                                window.audioManager.playSound('crash');
                            }
                        }
                    } else {
                        // 通常の衝突処理
                        kartA.handleCollision(kartB);
                    }
                }
            }
        }
    }
    
    // 敵キャラクター（ドッスン、ノコノコ）との衝突判定
    checkEnemyCollisions() {
        this.karts.forEach(kart => {
            // 無敵状態やスピンアウト中はスキップ
            if (kart.invincibilityTimer > 0 || kart.isSpunOut || kart.starActive) return;
            
            const enemy = this.track.checkEnemyCollision(kart.position);
            if (enemy) {
                // AIカートはワンワン・炎バー・ペンギン・テレサ（ゴースト）ではクラッシュしない
                if (!kart.isPlayer && (enemy.type === 'chainChomp' || enemy.type === 'fire_bar' || enemy.type === 'penguin' || enemy.type === 'boo')) {
                    return;
                }
                // シールドがあれば防ぐ
                if (kart.hasShield) {
                    kart.hasShield = false;
                    if (window.audioManager) {
                        window.audioManager.playSound('shield_break');
                    }
                } else {
                    // クラッシュ
                    kart.spinOut();
                    if (window.audioManager) {
                        window.audioManager.playSound('crash');
                    }
                    // カロンはクラッシュさせた後、一定時間追跡モード解除
                    if (enemy.type === 'dry_bones' && this.track.startDryBonesCooldown) {
                        this.track.startDryBonesCooldown(enemy);
                    }
                }
            }
        });
    }
    
    updateRacePositions() {
        // ゴール済みAIはfixedPositionを使い、未ゴールは進行度で順位を決定
        // まず未ゴールカートのみ進行度でソート
        const unfinished = this.karts.filter(k => !k.finished);
        unfinished.forEach(kart => {
            kart._sortProgress = kart.totalProgress;
        });
        const sortedUnfinished = [...unfinished].sort((a, b) => b._sortProgress - a._sortProgress);

        // ゴール済みAIカートの順位はfixedPositionを使う
        this.karts.forEach(kart => {
            if (kart.finished && !kart.isPlayer && typeof kart.fixedPosition === 'number') {
                kart.racePosition = kart.fixedPosition;
            }
        });

        // プレイヤーと未ゴールAIの順位を再計算
        // 1. ゴール済みAIの数をカウント
        const finishedAICount = this.karts.filter(k => k.finished && !k.isPlayer).length;
        // 2. 未ゴールカートを進行度順に順位付け（ゴール済みAIの数を加算）
        sortedUnfinished.forEach((kart, idx) => {
            kart.racePosition = finishedAICount + idx + 1;
        });
    }
    
    checkLapCompletion() {
        this.karts.forEach(kart => {
            if (kart.finished) return;
            // Check if crossed finish line (lap 3 completed)
            if (kart.lap >= this.totalLaps) {
                kart.finished = true;
                kart.finishTime = this.raceTime;
                // ゴール時点で順位を確定（AIのみ）
                if (!kart.isPlayer) {
                    // ゴール済みカート数+1が順位
                    const finishedCount = this.karts.filter(k => k.finished && typeof k.fixedPosition === 'number').length;
                    kart.fixedPosition = finishedCount + 1;
                }
                if (kart.isPlayer) {
                    // Player finished!
                    window.audioManager.playSound('race_finish');
                    setTimeout(() => this.finishRace(), 2000);
                }
            }
            
            // Final lap notification
            if (kart.isPlayer && kart.lap === this.totalLaps - 1 && !kart.finalLapShown) {
                kart.finalLapShown = true;
                this.uiManager.showFinalLap();
            }
        });
        
        // Check if all karts finished
        const allFinished = this.karts.every(k => k.finished);
        if (allFinished && this.gameState === 'racing') {
            this.finishRace();
        }
    }
    
    updateParticles() {
        if (!this.playerKart) return;

        const perf = this.performanceMode;
        
        // Drift sparks
        if (this.playerKart.isDrifting && this.playerKart.driftLevel >= 1) {
            if (!perf || Math.random() < 0.25) {
                this.particleSystem.createDriftSparks(this.playerKart);
            }
        }
        
        // Boost flames（パーティクル生成を大幅に制限）
        if (this.playerKart.boostTime > 0) {
            const boostParticleChance = perf ? 0.1 : 0.15;
            if (Math.random() < boostParticleChance) {
                this.particleSystem.createBoostFlame(this.playerKart);
            }
        }
        
        // Grass dust
        if (this.playerKart.onGrass && this.playerKart.speed > 20) {
            const dustChance = perf ? 0.1 : 0.3;
            if (Math.random() < dustChance) {
                this.particleSystem.createDust(this.playerKart.position, this.playerKart.speed / 50);
            }
        }
        
        // Speed lines at high speed（頻度を制限）
        const speedRatio = this.playerKart.speed / this.playerKart.maxSpeed;
        if (!perf && speedRatio > 0.8 && Math.random() < 0.2) {
            this.particleSystem.createSpeedLines(this.playerKart, speedRatio);
        }
        
        // AI particles (less frequent for performance)
        this.karts.forEach(kart => {
            if (kart.isPlayer) return;
            
            const aiChance = perf ? 0.08 : 0.3;
            if (kart.isDrifting && kart.driftLevel >= 2 && Math.random() < aiChance) {
                this.particleSystem.createDriftSparks(kart);
            }
        });
    }
    
    updateCamera() {
        if (!this.playerKart) return;
        
        const kart = this.playerKart;
        
        // NaN チェック
        if (isNaN(kart.position.x) || isNaN(kart.position.y) || isNaN(kart.position.z)) {
            console.error('Kart position is NaN, skipping camera update');
            return;
        }
        
        // === 安定カメラ追従 ===
        if (!this.lastCameraTarget) {
            this.lastCameraTarget = kart.position.clone();
            this.lastCameraRotation = kart.rotation;
            this.smoothCameraPos = this.camera.position.clone();
            this.smoothLookTarget = kart.position.clone();
        }
        
        // ジュゲム救出時はカメラを即座に追従させる
        const isRescue = kart.isBeingRescued;
        const isStartPhase = this.raceTime < 1.5;
        const fastFollow = isStartPhase || isRescue;
        
        // カメラ距離と高さ（より近く背後に密着）
        const baseCameraDistance = 10;
        const baseCameraHeight = 6;
        
        // ===== 回転のスムージング（高速追従）=====
        const rotSmoothFactor = fastFollow ? 0.3 : 0.12;
        const targetRotation = kart.rotation;
        let smoothRotation = this.lastCameraRotation;
        
        let rotDiff = targetRotation - smoothRotation;
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
        
        const maxRotSpeed = fastFollow ? 0.2 : 0.08;
        rotDiff = Math.max(-maxRotSpeed, Math.min(maxRotSpeed, rotDiff * rotSmoothFactor / 0.04));
        smoothRotation += rotDiff;
        this.lastCameraRotation = smoothRotation;
        
        // ===== カメラ位置 =====
        const cameraOffset = new THREE.Vector3(
            -Math.sin(smoothRotation) * baseCameraDistance,
            baseCameraHeight,
            -Math.cos(smoothRotation) * baseCameraDistance
        );
        const targetPos = kart.position.clone().add(cameraOffset);
        
        // FOV
        const speedFactor = Math.abs(kart.speed) / kart.maxSpeed;
        const targetFov = 68 + speedFactor * 4;
        this.camera.fov = Utils.lerp(this.camera.fov, targetFov, 0.02);
        this.camera.updateProjectionMatrix();
        
        // ===== カメラ位置を直接高速追従 =====
        const posSmoothXZ = fastFollow ? 0.5 : 0.2;
        const posSmoothY = fastFollow ? 0.4 : 0.15;
        
        if (!this.smoothCameraPos) {
            this.smoothCameraPos = targetPos.clone();
        }
        this.smoothCameraPos.x = Utils.lerp(this.smoothCameraPos.x, targetPos.x, posSmoothXZ);
        this.smoothCameraPos.z = Utils.lerp(this.smoothCameraPos.z, targetPos.z, posSmoothXZ);
        this.smoothCameraPos.y = Utils.lerp(this.smoothCameraPos.y, targetPos.y, posSmoothY);
        
        // カメラ実位置（2段目のスムージングも高速化）
        const camSmooth = fastFollow ? 0.6 : 0.35;
        this.camera.position.x = Utils.lerp(this.camera.position.x, this.smoothCameraPos.x, camSmooth);
        this.camera.position.z = Utils.lerp(this.camera.position.z, this.smoothCameraPos.z, camSmooth);
        this.camera.position.y = Utils.lerp(this.camera.position.y, this.smoothCameraPos.y, fastFollow ? 0.5 : 0.25);
        
        // 急激なジャンプ防止（救出テレポート時は制限を緩和）
        const maxMove = isRescue ? 8.0 : 2.5;
        const cameraDelta = this.camera.position.clone().sub(this.lastCameraTarget);
        if (cameraDelta.length() > maxMove) {
            this.camera.position.copy(this.lastCameraTarget.clone().add(
                cameraDelta.normalize().multiplyScalar(maxMove)
            ));
        }
        this.lastCameraTarget.copy(this.camera.position);
        
        // ===== 視点ターゲット =====
        const lookAhead = 6;
        const rawLookTarget = kart.position.clone();
        rawLookTarget.x += Math.sin(smoothRotation) * lookAhead;
        rawLookTarget.z += Math.cos(smoothRotation) * lookAhead;
        rawLookTarget.y += 1.5;
        
        if (!this.smoothLookTarget) {
            this.smoothLookTarget = rawLookTarget.clone();
        }
        const lookSmooth = fastFollow ? 0.4 : 0.25;
        this.smoothLookTarget.x = Utils.lerp(this.smoothLookTarget.x, rawLookTarget.x, lookSmooth);
        this.smoothLookTarget.z = Utils.lerp(this.smoothLookTarget.z, rawLookTarget.z, lookSmooth);
        this.smoothLookTarget.y = Utils.lerp(this.smoothLookTarget.y, rawLookTarget.y, fastFollow ? 0.3 : 0.2);
        
        this.camera.lookAt(this.smoothLookTarget);
        
        // ドリフト傾き
        if (kart.isDrifting) {
            this.camera.rotation.z = Utils.lerp(
                this.camera.rotation.z,
                kart.driftDirection * -0.004,
                0.015
            );
        } else {
            this.camera.rotation.z = Utils.lerp(this.camera.rotation.z, 0, 0.02);
        }
    }
    
    updateAudio() {
        if (!this.playerKart) return;
        
        window.audioManager.updateEngine(
            Math.abs(this.playerKart.speed),
            this.playerKart.maxSpeed,
            this.playerKart.isDrifting
        );
    }
    
    updateUI() {
        if (!this.playerKart) return;
        
        try {
            const kart = this.playerKart;
            
            this.uiManager.updatePosition(kart.racePosition);
            this.uiManager.updateLap(Math.min(kart.lap + 1, this.totalLaps), this.totalLaps);
            this.uiManager.updateTimer(this.raceTime);
            this.uiManager.updateItem(kart.currentItem);
            this.uiManager.updateSpeed(kart.speed, kart.maxSpeed);
            this.uiManager.updateBoostMeter(kart.driftLevel, kart.driftTime, kart.boostTime);
            this.uiManager.showWrongWay(kart.wrongWay);
            this.uiManager.updateMinimap(this.karts, this.track);
        } catch (e) {
            console.error('Error in updateUI:', e);
        }
    }
    
    render() {
        try {
            // カメラ位置がNaNの場合はリセット
            if (isNaN(this.camera.position.x) || isNaN(this.camera.position.y) || isNaN(this.camera.position.z)) {
                console.error('Camera position is NaN, resetting');
                this.camera.position.set(0, 10, -20);
                if (this.playerKart) {
                    this.camera.lookAt(this.playerKart.position);
                }
            }
            this.renderer.render(this.scene, this.camera);
        } catch (e) {
            console.error('Error in render:', e);
        }
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
