// Item system - handles all power-ups and projectiles

class ItemManager {
    constructor(scene, track) {
        this.scene = scene;
        this.track = track;
        
        // Active projectiles and hazards
        this.projectiles = [];
        this.hazards = [];
        
        // Projectile meshes container
        this.itemGroup = new THREE.Group();
        this.scene.add(this.itemGroup);
    }
    
    useItem(kart, itemType) {
        switch (itemType.id) {
            case 'mushroom':
                this.useMushroom(kart);
                break;
            case 'triple_mushroom':
                this.useTripleMushroom(kart);
                break;
            case 'golden_mushroom':
                this.useGoldenMushroom(kart);
                break;
            case 'banana':
                this.dropBanana(kart);
                break;
            case 'green_shell':
                this.fireGreenShell(kart);
                break;
            case 'red_shell':
                this.fireRedShell(kart);
                break;
            case 'star':
                this.useStar(kart);
                break;
            case 'lightning':
                this.useLightning(kart);
                break;
            case 'bob_omb':
                this.throwBobOmb(kart);
                break;
            case 'blooper':
                this.useBlooper(kart);
                break;
            case 'bullet_bill':
                this.useBulletBill(kart);
                break;
            case 'spiny_shell':
                this.fireSpinyShell(kart);
                break;
            // Legacy support
            case 'rocket_boost':
                this.useMushroom(kart);
                break;
            case 'triple_boost':
                this.useTripleMushroom(kart);
                break;
            case 'oil_slick':
                this.dropBanana(kart);
                break;
            case 'shield':
                this.activateShield(kart);
                break;
            case 'teleport':
                this.useTeleport(kart);
                break;
            case 'time_freeze':
                this.useTimeFreeze(kart);
                break;
            case 'homing_missile':
                this.fireRedShell(kart);
                break;
        }
    }
    
    // === きのこ系アイテム ===
    useMushroom(kart) {
        kart.applyBoost(1.0, 1.3);  // 1秒、1.3倍速
        if (window.audioManager) {
            window.audioManager.playSound('boost');
        }
    }
    
    useTripleMushroom(kart) {
        kart.tripleBoostCharges = 3;
        this.applyMushroomCharge(kart);
    }
    
    applyMushroomCharge(kart) {
        if (kart.tripleBoostCharges > 0) {
            kart.tripleBoostCharges--;
            kart.applyBoost(0.8, 1.25);
            if (window.audioManager) {
                window.audioManager.playSound('boost');
            }
            
            // 次のチャージを自動使用
            if (kart.tripleBoostCharges > 0) {
                setTimeout(() => this.applyMushroomCharge(kart), 1200);
            }
        }
    }
    
    useGoldenMushroom(kart) {
        // 5秒間、連続ブースト可能（タイマーベースに変更、setTimeout不使用）
        kart.goldenMushroomActive = true;
        kart.goldenMushroomEnd = Date.now() + 5000;
        kart.goldenMushroomNextBoost = Date.now();
        // 初回ブースト
        kart.applyBoost(0.5, 1.2);
        if (window.audioManager) {
            window.audioManager.playSound('boost');
        }
    }
    
    // === ボム系アイテム ===
    throwBobOmb(kart) {
        const bomb = this.createBobOmb(kart);
        this.projectiles.push(bomb);
        if (window.audioManager) {
            window.audioManager.playSound('throw');
        }
    }
    
    createBobOmb(kart) {
        const group = new THREE.Group();
        
        // ボブオムボディ（黒い球体）
        const bodyGeo = new THREE.SphereGeometry(1.2, 16, 16);
        const bodyMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            roughness: 0.8
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);
        
        // 導火線
        const fuseGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8);
        const fuseMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
        const fuse = new THREE.Mesh(fuseGeo, fuseMat);
        fuse.position.y = 1.5;
        group.add(fuse);
        
        // 導火線の火花
        const sparkGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const sparkMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
        const spark = new THREE.Mesh(sparkGeo, sparkMat);
        spark.position.y = 1.9;
        spark.name = 'spark';
        group.add(spark);
        
        // 目
        const eyeGeo = new THREE.SphereGeometry(0.25, 8, 8);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.4, 0.3, 1);
        group.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.4, 0.3, 1);
        group.add(rightEye);
        
        // 瞳
        const pupilGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
        leftPupil.position.set(-0.4, 0.3, 1.2);
        group.add(leftPupil);
        const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
        rightPupil.position.set(0.4, 0.3, 1.2);
        group.add(rightPupil);
        
        // 足
        const footGeo = new THREE.SphereGeometry(0.4, 8, 8);
        const footMat = new THREE.MeshStandardMaterial({ color: 0xff6600 });
        const leftFoot = new THREE.Mesh(footGeo, footMat);
        leftFoot.position.set(-0.5, -1, 0);
        group.add(leftFoot);
        const rightFoot = new THREE.Mesh(footGeo, footMat);
        rightFoot.position.set(0.5, -1, 0);
        group.add(rightFoot);
        
        // 前方に投げる方向
        const forward = new THREE.Vector3(
            Math.sin(kart.rotation),
            0,
            Math.cos(kart.rotation)
        );
        
        group.position.copy(kart.position);
        group.position.add(forward.clone().multiplyScalar(3));
        group.position.y = kart.position.y + 3;
        
        this.itemGroup.add(group);
        
        return {
            type: 'bob_omb',
            mesh: group,
            position: group.position.clone(),
            velocity: new THREE.Vector3(
                forward.x * 30,
                12,  // 上方向に投げ上げる
                forward.z * 30
            ),
            owner: kart,
            timer: 3.0,  // 3秒後に爆発
            explosionRadius: 15,
            active: true,
            lifetime: 10,
            landed: false,
            gravity: -30
        };
    }
    
    // ボムへいの更新処理（放物線＋タイマー爆発）
    updateBobOmb(proj, deltaTime, karts) {
        proj.timer -= deltaTime;
        
        // 重力を適用した放物線移動
        proj.velocity.y += proj.gravity * deltaTime;
        proj.position.x += proj.velocity.x * deltaTime;
        proj.position.y += proj.velocity.y * deltaTime;
        proj.position.z += proj.velocity.z * deltaTime;
        
        // 地面にバウンドまたは着地
        const groundHeight = this.track.getHeightAt(proj.position.x, proj.position.z) + 1.2;
        if (proj.position.y <= groundHeight) {
            proj.position.y = groundHeight;
            if (Math.abs(proj.velocity.y) > 3) {
                // バウンド（速度を減衰させて跳ね返る）
                proj.velocity.y = -proj.velocity.y * 0.35;
                proj.velocity.x *= 0.6;
                proj.velocity.z *= 0.6;
            } else {
                // 着地 - 速度をゼロに
                proj.velocity.set(0, 0, 0);
                proj.landed = true;
            }
        }
        
        // メッシュ位置を更新
        proj.mesh.position.copy(proj.position);
        
        // 飛行中は回転
        if (!proj.landed) {
            proj.mesh.rotation.x += deltaTime * 5;
            proj.mesh.rotation.z += deltaTime * 3;
        }
        
        // 導火線の火花点滅
        const spark = proj.mesh.getObjectByName('spark');
        if (spark) {
            spark.material.color.setHex(Math.random() > 0.5 ? 0xff4400 : 0xffdd00);
            spark.scale.setScalar(0.8 + Math.random() * 0.6);
        }
        
        // タイマーで爆発、または着地後にカートが接触しても爆発
        let shouldExplode = proj.timer <= 0;
        
        // 着地後の接触判定
        if (proj.landed && !shouldExplode) {
            for (const kart of karts) {
                const dist = proj.position.distanceTo(kart.position);
                if (dist < 4) {
                    shouldExplode = true;
                    break;
                }
            }
        }
        
        if (shouldExplode) {
            // 爆発！範囲内のカートにダメージ
            this.explodeBobOmb(proj, karts);
            proj.active = false;
            return false;
        }
        
        // 爆発間際は点滅（残り1秒）
        if (proj.timer < 1.0) {
            const flash = Math.sin(proj.timer * 30) > 0;
            proj.mesh.children.forEach(child => {
                if (child.material && child.material.color && child.name !== 'spark') {
                    if (flash) {
                        child.material.emissive = new THREE.Color(0xff2200);
                        child.material.emissiveIntensity = 0.8;
                    } else {
                        child.material.emissive = new THREE.Color(0x000000);
                        child.material.emissiveIntensity = 0;
                    }
                }
            });
        }
        
        return true;
    }
    
    // ボムへい爆発処理
    explodeBobOmb(proj, karts) {
        // 爆発エフェクト
        this.createBobOmbExplosion(proj.position);
        
        // 範囲内の全カートにダメージ
        for (const kart of karts) {
            const dist = proj.position.distanceTo(kart.position);
            if (dist < proj.explosionRadius) {
                // 無敵は除外
                if (kart.invincibilityTimer > 0 || kart.starActive) continue;
                kart.spinOut();
            }
        }
        
        // 爆発音
        if (window.audioManager) {
            window.audioManager.playSound('explosion');
        }
        
        // メッシュ除去
        this.itemGroup.remove(proj.mesh);
    }
    
    // ボムへい専用の大爆発エフェクト
    createBobOmbExplosion(position) {
        const explosionGroup = new THREE.Group();
        
        // 火球（中心）
        const fireGeo = new THREE.SphereGeometry(4, 16, 16);
        const fireMat = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.9
        });
        const fire = new THREE.Mesh(fireGeo, fireMat);
        explosionGroup.add(fire);
        
        // 外側の爆風
        const blastGeo = new THREE.SphereGeometry(7, 16, 16);
        const blastMat = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.5
        });
        const blast = new THREE.Mesh(blastGeo, blastMat);
        explosionGroup.add(blast);
        
        // 煙リング
        const smokeGeo = new THREE.TorusGeometry(5, 1.5, 8, 16);
        const smokeMat = new THREE.MeshBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.6
        });
        const smoke = new THREE.Mesh(smokeGeo, smokeMat);
        smoke.rotation.x = Math.PI / 2;
        explosionGroup.add(smoke);
        
        explosionGroup.position.copy(position);
        this.itemGroup.add(explosionGroup);
        
        // アニメーション
        let elapsed = 0;
        const duration = 1.0;
        const animate = () => {
            elapsed += 0.016;
            const t = elapsed / duration;
            if (t >= 1) {
                this.itemGroup.remove(explosionGroup);
                return;
            }
            
            // 拡大しながらフェードアウト
            const scale = 1 + t * 2;
            fire.scale.setScalar(scale);
            fire.material.opacity = 0.9 * (1 - t);
            blast.scale.setScalar(scale * 1.3);
            blast.material.opacity = 0.5 * (1 - t);
            smoke.scale.setScalar(scale * 0.8);
            smoke.position.y = t * 8;
            smoke.material.opacity = 0.6 * (1 - t * 0.7);
            
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        
        // パーティクルシステムも使用
        this.createExplosion(position);
    }
    
    // === ゲッソー（イカ）=== 自分の画面にインクがかかる不利アイテム
    useBlooper(kart) {
        // 自分の画面にインク効果（不利アイテム）
        if (window.game && window.game.uiManager) {
            window.game.uiManager.showInkEffect();
        }
        if (window.audioManager) {
            window.audioManager.playSound('blooper');
        }
    }
    
    // === バレットビル ===
    useBulletBill(kart) {
        kart.bulletBillActive = true;
        kart.bulletBillEnd = Date.now() + 4000;  // 4秒間
        kart.applyBoost(3.0, 1.3);  // ブースト（安全な範囲）
        kart.invincibilityTimer = 4.0;
        
        if (window.audioManager) {
            window.audioManager.playSound('bullet_bill');
        }
    }
    
    useRocketBoost(kart) {
        // レガシー対応 - きのことして扱う
        this.useMushroom(kart);
    }
    
    useTripleBoost(kart) {
        // レガシー対応 - トリプルきのことして扱う
        this.useTripleMushroom(kart);
    }
    
    fireHomingMissile(kart) {
        const missile = this.createMissile(kart, true);
        this.projectiles.push(missile);
        
        if (window.audioManager) {
            window.audioManager.playSound('missile_fire');
        }
    }
    
    fireStraightMissile(kart) {
        const missile = this.createMissile(kart, false);
        this.projectiles.push(missile);
        
        if (window.audioManager) {
            window.audioManager.playSound('missile_fire');
        }
    }
    
    createMissile(kart, isHoming) {
        // Create missile mesh
        const geometry = new THREE.ConeGeometry(0.3, 1.5, 8);
        const material = new THREE.MeshStandardMaterial({
            color: isHoming ? 0xff0000 : 0x00ff00,
            emissive: isHoming ? 0x440000 : 0x004400
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = Math.PI / 2;
        
        // Position in front of kart
        const forward = new THREE.Vector3(
            Math.sin(kart.rotation),
            0,
            Math.cos(kart.rotation)
        );
        
        mesh.position.copy(kart.position);
        mesh.position.add(forward.multiplyScalar(3));
        mesh.position.y += 0.5;
        
        this.itemGroup.add(mesh);
        
        return {
            type: 'missile',
            mesh: mesh,
            owner: kart,
            isHoming: isHoming,
            position: mesh.position.clone(),
            direction: forward.clone(),
            speed: 120,
            target: null,
            lifetime: 5,
            active: true
        };
    }
    
    dropBanana(kart) {
        // マリオカート風のバナナを作成
        const bananaGroup = new THREE.Group();
        
        // バナナ本体（湾曲した形状）
        const bananaShape = new THREE.Shape();
        bananaShape.moveTo(0, 0);
        bananaShape.quadraticCurveTo(0.3, 0.8, 0, 1.6);
        bananaShape.quadraticCurveTo(-0.15, 0.8, 0, 0);
        
        const extrudeSettings = {
            steps: 1,
            depth: 0.25,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.08,
            bevelSegments: 3
        };
        
        const bananaGeo = new THREE.ExtrudeGeometry(bananaShape, extrudeSettings);
        const bananaMat = new THREE.MeshStandardMaterial({
            color: 0xffe135,  // 鮮やかな黄色
            emissive: 0x332200,
            emissiveIntensity: 0.2,
            roughness: 0.5
        });
        const banana = new THREE.Mesh(bananaGeo, bananaMat);
        banana.rotation.z = Math.PI / 2;  // 横向きに
        banana.rotation.y = Math.PI / 2;
        banana.scale.set(0.8, 0.8, 0.8);
        bananaGroup.add(banana);
        
        // バナナの両端（茶色の部分）
        const tipGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const tipMat = new THREE.MeshStandardMaterial({ color: 0x4a3000 });
        
        const tip1 = new THREE.Mesh(tipGeo, tipMat);
        tip1.position.set(0, 0.65, 0);
        bananaGroup.add(tip1);
        
        const tip2 = new THREE.Mesh(tipGeo, tipMat);
        tip2.position.set(0, -0.65, 0);
        tip2.scale.set(0.8, 1.2, 0.8);
        bananaGroup.add(tip2);
        
        // 茎の部分
        const stemGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.2, 6);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x2d1f00 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.set(0, 0.75, 0);
        bananaGroup.add(stem);
        
        // Drop behind kart
        const behind = new THREE.Vector3(
            -Math.sin(kart.rotation),
            0,
            -Math.cos(kart.rotation)
        );
        
        bananaGroup.position.copy(kart.position);
        bananaGroup.position.add(behind.multiplyScalar(3));
        bananaGroup.position.y = this.track.getHeightAt(bananaGroup.position.x, bananaGroup.position.z) + 0.5;
        bananaGroup.rotation.x = Math.PI / 2;  // 地面に寝かせる
        bananaGroup.rotation.z = Math.random() * Math.PI * 2;  // ランダムな向き
        
        this.itemGroup.add(bananaGroup);
        
        this.hazards.push({
            type: 'banana',
            mesh: bananaGroup,
            owner: kart,
            position: bananaGroup.position.clone(),
            radius: 1.5,
            active: true,
            lifetime: 30
        });
        
        if (window.audioManager) {
            window.audioManager.playSound('banana_drop');
        }
    }
    
    dropOilSlick(kart) {
        // リアルなオイル溜まりを作成
        const oilGroup = new THREE.Group();
        
        // メインのオイル溜まり（不規則な形状）
        const mainOilGeo = new THREE.CircleGeometry(2, 24);
        // 頂点を少し変形させて不規則な形に
        const positions = mainOilGeo.attributes.position;
        for (let i = 1; i < positions.count; i++) {
            const angle = Math.atan2(positions.getY(i), positions.getX(i));
            const dist = Math.sqrt(positions.getX(i) ** 2 + positions.getY(i) ** 2);
            const variation = 0.8 + Math.sin(angle * 5) * 0.2 + Math.random() * 0.1;
            positions.setX(i, positions.getX(i) * variation);
            positions.setY(i, positions.getY(i) * variation);
        }
        positions.needsUpdate = true;
        
        const oilMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,  // 深い紫がかった黒
            transparent: true,
            opacity: 0.85,
            roughness: 0.1,  // 光沢のある表面
            metalness: 0.3,
            side: THREE.DoubleSide
        });
        
        const mainOil = new THREE.Mesh(mainOilGeo, oilMat);
        mainOil.rotation.x = -Math.PI / 2;
        oilGroup.add(mainOil);
        
        // 虹色の光沢エフェクト（オイルの特徴的な模様）
        const sheenGeo = new THREE.CircleGeometry(1.8, 24);
        const sheenMat = new THREE.MeshStandardMaterial({
            color: 0x4444ff,
            transparent: true,
            opacity: 0.15,
            roughness: 0,
            metalness: 0.8,
            side: THREE.DoubleSide
        });
        const sheen = new THREE.Mesh(sheenGeo, sheenMat);
        sheen.rotation.x = -Math.PI / 2;
        sheen.position.y = 0.02;
        oilGroup.add(sheen);
        
        // 小さな油滴を周囲に追加
        for (let i = 0; i < 5; i++) {
            const dropGeo = new THREE.CircleGeometry(0.3 + Math.random() * 0.3, 12);
            const drop = new THREE.Mesh(dropGeo, oilMat);
            drop.rotation.x = -Math.PI / 2;
            const angle = Math.random() * Math.PI * 2;
            const dist = 2.2 + Math.random() * 0.5;
            drop.position.set(
                Math.cos(angle) * dist,
                0.01,
                Math.sin(angle) * dist
            );
            oilGroup.add(drop);
        }
        
        // Drop behind kart
        const behind = new THREE.Vector3(
            -Math.sin(kart.rotation),
            0,
            -Math.cos(kart.rotation)
        );
        
        oilGroup.position.copy(kart.position);
        oilGroup.position.add(behind.multiplyScalar(3));
        oilGroup.position.y = this.track.getHeightAt(oilGroup.position.x, oilGroup.position.z) + 0.05;
        
        this.itemGroup.add(oilGroup);
        
        this.hazards.push({
            type: 'oil',
            mesh: oilGroup,
            owner: kart,
            position: oilGroup.position.clone(),
            radius: 2.5,
            active: true,
            lifetime: 20
        });
    }
    
    activateShield(kart) {
        kart.activateShield();
    }
    
    useLightning(kart) {
        // 自分以外の全員をクラッシュさせる（無敵状態とシールド持ちを除く）
        // 注意：使用者には何の効果もない
        
        if (window.game && window.game.karts) {
            window.game.karts.forEach(otherKart => {
                // 自分自身は完全にスキップ
                if (otherKart === kart) {
                    return;
                }
                
                // 無敵状態（スター）は除外
                if (otherKart.invincibilityTimer > 0 || otherKart.starActive) {
                    return;
                }
                
                // シールド持ちは除外
                if (otherKart.hasShield) {
                    return;
                }
                
                // クラッシュさせる
                otherKart.spinOut();
            });
        }
        
        // Visual effect - 画面全体に稲妻エフェクト
        const effect = document.getElementById('item-effect');
        if (effect) {
            effect.className = 'lightning-effect';
            effect.style.display = 'block';
            effect.style.background = 'rgba(255, 255, 0, 0.6)';
            setTimeout(() => {
                effect.style.background = 'rgba(255, 255, 255, 0.8)';
            }, 100);
            setTimeout(() => {
                effect.style.display = 'none';
                effect.className = '';
                effect.style.background = '';
            }, 400);
        }
        
        if (window.audioManager) {
            window.audioManager.playSound('lightning');
        }
    }
    
    useTeleport(kart) {
        // Teleport forward along track
        const currentProgress = this.track.getTrackProgress(kart.position.x, kart.position.z);
        const teleportDistance = 0.05; // 5% of track
        const newProgress = (currentProgress + teleportDistance) % 1;
        
        // Find new position
        const targetPoint = Utils.getSplinePoint(this.track.waypoints, newProgress);
        
        // Animate teleport
        const startPos = kart.position.clone();
        const endPos = new THREE.Vector3(targetPoint.x, targetPoint.y || 0 + 0.5, targetPoint.z);
        
        // Flash effect
        kart.mesh.visible = false;
        setTimeout(() => {
            kart.position.copy(endPos);
            kart.mesh.visible = true;
        }, 200);
        
        if (window.audioManager) {
            window.audioManager.playSound('teleport');
        }
    }
    
    useTimeFreeze(kart) {
        // Freeze all other karts
        if (window.game && window.game.karts) {
            window.game.karts.forEach(otherKart => {
                if (otherKart !== kart) {
                    otherKart.freeze(3);
                }
            });
        }
        
        // Visual effect - blue tint
        const effect = document.getElementById('item-effect');
        if (effect) {
            effect.style.background = 'rgba(0, 100, 255, 0.2)';
            effect.style.display = 'block';
            setTimeout(() => {
                effect.style.display = 'none';
                effect.style.background = '';
            }, 3000);
        }
    }
    
    // スター - 無敵状態とスピードアップ
    useStar(kart) {
        const starDuration = 16; // 16秒間（2倍に延長）
        kart.invincibilityTimer = starDuration;
        kart.starActive = true;
        
        // スピードブースト（控えめに調整 - 1.15倍）
        kart.applyBoost(starDuration, 1.15);
        
        // 虹色エフェクト開始
        this.startStarEffect(kart);
        
        if (window.audioManager) {
            window.audioManager.playSound('star');
        }
        
        // スター終了時にエフェクトをクリア
        setTimeout(() => {
            kart.starActive = false;
            this.stopStarEffect(kart);
        }, starDuration * 1000);
    }
    
    startStarEffect(kart) {
        // 元のマテリアルを保存（色・エミッシブ両方）
        kart._starOriginalMaterials = new Map();
        const saveMaterials = (obj) => {
            if (obj.material) {
                const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                const saved = mats.map(m => ({
                    color: m.color ? m.color.clone() : null,
                    emissive: m.emissive ? m.emissive.clone() : null,
                    emissiveIntensity: m.emissiveIntensity || 0
                }));
                kart._starOriginalMaterials.set(obj.uuid, saved);
            }
            if (obj.children) obj.children.forEach(c => saveMaterials(c));
        };
        if (kart.mesh) saveMaterials(kart.mesh);
        
        // 虹色オーラ用のポイントライト
        const auraLight = new THREE.PointLight(0xffffff, 3, 15);
        auraLight.position.set(0, 2, 0);
        auraLight.name = 'starAuraLight';
        if (kart.mesh) kart.mesh.add(auraLight);
        kart._starAuraLight = auraLight;
        
        // 虹色パーティクルリング
        const particleGroup = new THREE.Group();
        particleGroup.name = 'starParticles';
        const sparkCount = 12;
        const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
        for (let i = 0; i < sparkCount; i++) {
            const sparkGeo = new THREE.SphereGeometry(0.15, 8, 8);
            const spark = new THREE.Mesh(sparkGeo, sparkMat.clone());
            spark.position.set(0, 1.5, 0);
            spark.userData.sparkIndex = i;
            particleGroup.add(spark);
        }
        if (kart.mesh) kart.mesh.add(particleGroup);
        kart._starParticles = particleGroup;
        
        // 高速で七色に変化する派手なエフェクト
        kart.starEffectInterval = setInterval(() => {
            if (!kart.starActive) {
                clearInterval(kart.starEffectInterval);
                return;
            }
            const t = Date.now();
            // 非常に高速な虹色サイクル
            const hue1 = (t / 30) % 360;
            const hue2 = (hue1 + 120) % 360;
            const hue3 = (hue1 + 240) % 360;
            
            // パルス効果（明滅）
            const pulse = 0.7 + 0.3 * Math.sin(t / 80);
            const intensity = 1.2 * pulse;
            
            const color1 = new THREE.Color(`hsl(${hue1}, 100%, 60%)`);
            const color2 = new THREE.Color(`hsl(${hue2}, 100%, 60%)`);
            const color3 = new THREE.Color(`hsl(${hue3}, 100%, 60%)`);
            
            // 全ての子メッシュを再帰的に七色に
            let childIdx = 0;
            const applyRainbow = (obj) => {
                if (obj.material) {
                    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                    mats.forEach(mat => {
                        if (mat.emissive) {
                            // 各パーツで色相をずらして虹色に
                            const shift = (childIdx * 37) % 360;
                            const h = (hue1 + shift) % 360;
                            mat.emissive.setHSL(h / 360, 1.0, 0.5);
                            mat.emissiveIntensity = intensity;
                        }
                        if (mat.color && mat.isMeshBasicMaterial !== true) {
                            // 元の色に七色の光を重ねる
                            const shift = (childIdx * 53) % 360;
                            const h = (hue1 + shift) % 360;
                            const c = new THREE.Color();
                            c.setHSL(h / 360, 1.0, 0.65);
                            mat.color.lerp(c, 0.35 * pulse);
                        }
                    });
                    childIdx++;
                }
                if (obj.children) {
                    obj.children.forEach(c => {
                        if (c.name !== 'starAuraLight' && c.name !== 'starParticles') {
                            applyRainbow(c);
                        }
                    });
                }
            };
            if (kart.mesh) applyRainbow(kart.mesh);
            
            // オーラライト更新
            if (kart._starAuraLight) {
                kart._starAuraLight.color.copy(color1);
                kart._starAuraLight.intensity = 2 + 2 * Math.sin(t / 100);
            }
            
            // パーティクルを回転・虹色に
            if (kart._starParticles) {
                kart._starParticles.rotation.y = t / 200;
                kart._starParticles.children.forEach((spark, i) => {
                    const angle = (i / sparkCount) * Math.PI * 2 + t / 300;
                    const radius = 1.8 + 0.3 * Math.sin(t / 150 + i);
                    const yOff = 1.0 + 0.8 * Math.sin(t / 200 + i * 0.8);
                    spark.position.set(
                        Math.cos(angle) * radius,
                        yOff,
                        Math.sin(angle) * radius
                    );
                    const sparkHue = (hue1 + i * 30) % 360;
                    spark.material.color.setHSL(sparkHue / 360, 1.0, 0.7);
                    spark.material.opacity = 0.6 + 0.4 * Math.sin(t / 100 + i * 2);
                    spark.scale.setScalar(0.8 + 0.5 * Math.sin(t / 120 + i));
                });
            }
        }, 25); // 25msで更新（よりスムーズ）
    }
    
    stopStarEffect(kart) {
        if (kart.starEffectInterval) {
            clearInterval(kart.starEffectInterval);
        }
        // 元のマテリアルを復元（色・エミッシブ両方）
        const originals = kart._starOriginalMaterials;
        const restoreMaterials = (obj) => {
            if (obj.material && originals && originals.has(obj.uuid)) {
                const saved = originals.get(obj.uuid);
                const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                mats.forEach((mat, i) => {
                    const s = saved[i];
                    if (!s) return;
                    if (s.color && mat.color) mat.color.copy(s.color);
                    if (s.emissive && mat.emissive) mat.emissive.copy(s.emissive);
                    mat.emissiveIntensity = s.emissiveIntensity;
                });
            }
            if (obj.children) {
                obj.children.forEach(c => {
                    if (c.name !== 'starAuraLight' && c.name !== 'starParticles') {
                        restoreMaterials(c);
                    }
                });
            }
        };
        if (kart.mesh) restoreMaterials(kart.mesh);
        
        // オーラライト除去
        if (kart._starAuraLight && kart.mesh) {
            kart.mesh.remove(kart._starAuraLight);
            kart._starAuraLight.dispose();
            kart._starAuraLight = null;
        }
        
        // パーティクル除去
        if (kart._starParticles && kart.mesh) {
            kart._starParticles.children.forEach(s => {
                s.geometry.dispose();
                s.material.dispose();
            });
            kart.mesh.remove(kart._starParticles);
            kart._starParticles = null;
        }
        
        // 元のマテリアル情報クリア
        kart._starOriginalMaterials = null;
    }
    
    // 緑甲羅 - まっすぐ飛んで壁で跳ね返る
    fireGreenShell(kart) {
        const shell = this.createTurtleShell(kart, 0x00aa00, false); // 緑色
        this.projectiles.push(shell);
        
        if (window.audioManager) {
            window.audioManager.playSound('shell_fire');
        }
    }
    
    // スパイニー甲羅（トゲゾー甲羅/青甲羅）- 1位を追尾して爆発
    fireSpinyShell(kart) {
        const shell = this.createSpinyShell(kart);
        this.projectiles.push(shell);
        
        if (window.audioManager) {
            window.audioManager.playSound('shell_fire');
        }
    }
    
    // スパイニー甲羅のメッシュ作成（緑/赤甲羅ベースにトゲ追加）
    createSpinyShell(kart) {
        const shellGroup = new THREE.Group();
        
        // === 甲羅のメインドーム（上部）- 緑/赤甲羅と同サイズ ===
        const domeGeo = new THREE.SphereGeometry(1.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const mainColor = 0x1155ee;  // 鮮やかな青
        const shellMat = new THREE.MeshStandardMaterial({
            color: mainColor,
            roughness: 0.25,
            metalness: 0.15,
            emissive: 0x0044aa,
            emissiveIntensity: 0.3
        });
        const dome = new THREE.Mesh(domeGeo, shellMat);
        dome.rotation.x = Math.PI;  // ドームを上向きに
        dome.position.y = 0;
        shellGroup.add(dome);
        
        // === 甲羅の模様（六角形パターン - 青色系）===
        const darkColor = 0x0033aa;
        const patternMat = new THREE.MeshStandardMaterial({
            color: darkColor,
            roughness: 0.4,
            emissive: 0x001155,
            emissiveIntensity: 0.3
        });
        
        // 中心の六角形
        const centerHexGeo = new THREE.CircleGeometry(0.35, 6);
        const centerHex = new THREE.Mesh(centerHexGeo, patternMat);
        centerHex.position.set(0, -0.6, 0);
        centerHex.rotation.x = -Math.PI / 2;
        shellGroup.add(centerHex);
        
        // 周囲の六角形
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const hexGeo = new THREE.CircleGeometry(0.25, 6);
            const hex = new THREE.Mesh(hexGeo, patternMat);
            const radius = 0.65;
            hex.position.set(
                Math.cos(angle) * radius,
                -0.45,
                Math.sin(angle) * radius
            );
            hex.rotation.x = -Math.PI / 2 + 0.3;
            hex.rotation.z = angle;
            shellGroup.add(hex);
        }
        
        // === 甲羅の縁（白いリング）===
        const rimGeo = new THREE.TorusGeometry(1.15, 0.15, 8, 24);
        const rimMat = new THREE.MeshStandardMaterial({
            color: 0xffffee,
            roughness: 0.5
        });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.05;
        shellGroup.add(rim);
        
        // === 底面（クリーム色）===
        const bottomGeo = new THREE.CircleGeometry(1.1, 24);
        const bottomMat = new THREE.MeshStandardMaterial({
            color: 0xffffd0,
            roughness: 0.6
        });
        const bottom = new THREE.Mesh(bottomGeo, bottomMat);
        bottom.rotation.x = Math.PI / 2;
        bottom.position.y = 0.1;
        shellGroup.add(bottom);
        
        // === トゲ（甲羅の上に白いスパイク）===
        const spikeMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.5,
            emissive: 0xcccccc,
            emissiveIntensity: 0.1
        });
        
        const spikePositions = [
            { x: 0, y: -0.7, z: 0, size: 0.2, height: 0.6 },      // 中央頂上
            { x: 0.6, y: -0.45, z: 0, size: 0.15, height: 0.45 },   // 右
            { x: -0.6, y: -0.45, z: 0, size: 0.15, height: 0.45 },  // 左
            { x: 0, y: -0.45, z: 0.6, size: 0.15, height: 0.45 },   // 前
            { x: 0, y: -0.45, z: -0.6, size: 0.15, height: 0.45 },  // 後
            { x: 0.42, y: -0.45, z: 0.42, size: 0.12, height: 0.35 },
            { x: -0.42, y: -0.45, z: 0.42, size: 0.12, height: 0.35 },
            { x: 0.42, y: -0.45, z: -0.42, size: 0.12, height: 0.35 },
            { x: -0.42, y: -0.45, z: -0.42, size: 0.12, height: 0.35 },
        ];
        
        spikePositions.forEach(pos => {
            const spikeGeo = new THREE.ConeGeometry(pos.size, pos.height, 6);
            const spike = new THREE.Mesh(spikeGeo, spikeMat);
            spike.position.set(pos.x, pos.y, pos.z);
            // トゲを外向きに傾ける
            const dirLen = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
            if (dirLen > 0.01) {
                spike.rotation.z = -Math.atan2(pos.x, 1) * 0.4;
                spike.rotation.x = -Math.atan2(pos.z, 1) * 0.4;
            }
            shellGroup.add(spike);
        });
        
        // === ハイライト ===
        const highlightGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const highlightMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6
        });
        const highlight = new THREE.Mesh(highlightGeo, highlightMat);
        highlight.position.set(0.3, -0.7, 0.3);
        shellGroup.add(highlight);
        
        // 位置設定
        const forward = new THREE.Vector3(
            Math.sin(kart.rotation),
            0,
            Math.cos(kart.rotation)
        );
        
        shellGroup.position.copy(kart.position);
        shellGroup.position.add(forward.clone().multiplyScalar(4));
        shellGroup.position.y = 1.5;
        
        // スケール調整（緑/赤甲羅と同じ）
        shellGroup.scale.set(1.2, 0.8, 1.2);
        
        this.itemGroup.add(shellGroup);
        
        return {
            type: 'spiny_shell',
            mesh: shellGroup,
            owner: kart,
            position: shellGroup.position.clone(),
            direction: forward.clone(),
            speed: 110,        // 通常甲羅より少し速い
            target: null,
            lifetime: 30,      // 長寿命（1位に届くまで）
            active: true,
            phase: 'running',  // コース上を走行
            bounceCount: 0,
            maxBounces: 999,   // 壁に当たっても消えない
            isSpiny: true      // トゲゾーフラグ
        };
    }
    
    // 赤甲羅 - 近くのライバルを自動追尾
    fireRedShell(kart) {
        const shell = this.createTurtleShell(kart, 0xcc0000, true); // 赤色、ホーミング
        this.projectiles.push(shell);
        
        if (window.audioManager) {
            window.audioManager.playSound('shell_fire');
        }
    }
    
    // 亀の甲羅メッシュを作成（マリオカート風のデザイン）
    createTurtleShell(kart, color, isHoming) {
        const shellGroup = new THREE.Group();
        
        // === 甲羅のメインドーム（上部） ===
        const domeGeo = new THREE.SphereGeometry(1.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const mainColor = isHoming ? 0xee1111 : 0x22bb22;  // 鮮やかな赤 or 緑
        const shellMat = new THREE.MeshStandardMaterial({
            color: mainColor,
            roughness: 0.25,
            metalness: 0.15,
            emissive: mainColor,
            emissiveIntensity: isHoming ? 0.35 : 0.15  // 赤甲羅はより光る
        });
        const dome = new THREE.Mesh(domeGeo, shellMat);
        dome.rotation.x = Math.PI;  // ドームを上向きに
        dome.position.y = 0;
        shellGroup.add(dome);
        
        // === 甲羅の模様（六角形パターン） ===
        const darkColor = isHoming ? 0xaa0000 : 0x116611;  // 赤甲羅は濃い赤
        const patternMat = new THREE.MeshStandardMaterial({
            color: darkColor,
            roughness: 0.4,
            emissive: isHoming ? 0x330000 : 0x000000,
            emissiveIntensity: 0.3
        });
        
        // 中心の六角形
        const centerHexGeo = new THREE.CircleGeometry(0.35, 6);
        const centerHex = new THREE.Mesh(centerHexGeo, patternMat);
        centerHex.position.set(0, -0.6, 0);
        centerHex.rotation.x = -Math.PI / 2;
        shellGroup.add(centerHex);
        
        // 周囲の六角形
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const hexGeo = new THREE.CircleGeometry(0.25, 6);
            const hex = new THREE.Mesh(hexGeo, patternMat);
            const radius = 0.65;
            hex.position.set(
                Math.cos(angle) * radius,
                -0.45,
                Math.sin(angle) * radius
            );
            hex.rotation.x = -Math.PI / 2 + 0.3;  // 少し傾ける
            hex.rotation.z = angle;
            shellGroup.add(hex);
        }
        
        // === 甲羅の縁（白いリング） ===
        const rimGeo = new THREE.TorusGeometry(1.15, 0.15, 8, 24);
        const rimMat = new THREE.MeshStandardMaterial({
            color: 0xffffee,
            roughness: 0.5
        });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.05;
        shellGroup.add(rim);
        
        // === 底面（クリーム色） ===
        const bottomGeo = new THREE.CircleGeometry(1.1, 24);
        const bottomMat = new THREE.MeshStandardMaterial({
            color: 0xffffd0,
            roughness: 0.6
        });
        const bottom = new THREE.Mesh(bottomGeo, bottomMat);
        bottom.rotation.x = Math.PI / 2;
        bottom.position.y = 0.1;
        shellGroup.add(bottom);
        
        // === 甲羅のハイライト ===
        const highlightGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const highlightMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6
        });
        const highlight = new THREE.Mesh(highlightGeo, highlightMat);
        highlight.position.set(0.3, -0.7, 0.3);
        shellGroup.add(highlight);
        
        // 位置設定
        const forward = new THREE.Vector3(
            Math.sin(kart.rotation),
            0,
            Math.cos(kart.rotation)
        );
        
        shellGroup.position.copy(kart.position);
        shellGroup.position.add(forward.clone().multiplyScalar(4));
        shellGroup.position.y = 1.5;
        
        // スケール調整
        shellGroup.scale.set(1.2, 0.8, 1.2);
        
        this.itemGroup.add(shellGroup);
        
        return {
            type: 'shell',
            mesh: shellGroup,
            owner: kart,
            isHoming: isHoming,
            position: shellGroup.position.clone(),
            direction: forward.clone(),
            speed: isHoming ? 80 : 100, // 赤はやや遅いがホーミング
            target: null,
            lifetime: 8,
            active: true,
            bounceCount: 0,
            maxBounces: isHoming ? 0 : 5 // 緑は5回まで壁反射
        };
    }
    
    update(deltaTime, karts) {
        // === ゴールデンキノコのタイマーベース更新（setTimeout廃止） ===
        const now = Date.now();
        karts.forEach(kart => {
            if (kart.goldenMushroomActive) {
                if (now >= kart.goldenMushroomEnd) {
                    kart.goldenMushroomActive = false;
                } else if (now >= kart.goldenMushroomNextBoost) {
                    kart.applyBoost(0.5, 1.2);
                    kart.goldenMushroomNextBoost = now + 500; // 500ms間隔
                }
            }
        });
        
        // Update projectiles
        this.projectiles = this.projectiles.filter(proj => {
            if (!proj.active) {
                this.itemGroup.remove(proj.mesh);
                return false;
            }
            
            proj.lifetime -= deltaTime;
            if (proj.lifetime <= 0) {
                proj.active = false;
                return false;
            }
            
            // === スパイニー甲羅（青甲羅）の特殊処理 ===
            if (proj.type === 'spiny_shell') {
                return this.updateSpinyShell(proj, deltaTime, karts);
            }
            
            // === ボムへいの特殊処理（放物線＋タイマー爆発） ===
            if (proj.type === 'bob_omb') {
                return this.updateBobOmb(proj, deltaTime, karts);
            }
            
            // Move projectile
            if (proj.isHoming && !proj.target) {
                // Find target (closest kart ahead of owner)
                let closestDist = Infinity;
                karts.forEach(kart => {
                    if (kart !== proj.owner && kart.totalProgress > proj.owner.totalProgress) {
                        const dist = proj.position.distanceTo(kart.position);
                        if (dist < closestDist) {
                            closestDist = dist;
                            proj.target = kart;
                        }
                    }
                });
                
                // If no target ahead, find closest overall
                if (!proj.target) {
                    karts.forEach(kart => {
                        if (kart !== proj.owner) {
                            const dist = proj.position.distanceTo(kart.position);
                            if (dist < closestDist) {
                                closestDist = dist;
                                proj.target = kart;
                            }
                        }
                    });
                }
            }
            
            if (proj.isHoming && proj.target) {
                // Home towards target
                const toTarget = new THREE.Vector3()
                    .subVectors(proj.target.position, proj.position)
                    .normalize();
                
                proj.direction.lerp(toTarget, 0.1);
                proj.direction.normalize();
                
                // 赤甲羅の追尾エフェクト - 点滅して光る
                if (proj.mesh && proj.mesh.children) {
                    const glowIntensity = 0.35 + Math.sin(Date.now() * 0.015) * 0.2;
                    proj.mesh.children.forEach(child => {
                        if (child.material && child.material.emissive) {
                            child.material.emissiveIntensity = glowIntensity;
                        }
                    });
                }
            }
            
            // Update position
            const movement = proj.direction.clone().multiplyScalar(proj.speed * deltaTime);
            proj.position.add(movement);
            proj.mesh.position.copy(proj.position);
            
            // 甲羅の壁バウンス処理（緑甲羅のみ）
            if (proj.type === 'shell' && !proj.isHoming) {
                let bounced = false;
                
                // バウンスクールダウン（連続バウンス防止）
                if (!proj.bounceCooldown) proj.bounceCooldown = 0;
                proj.bounceCooldown = Math.max(0, proj.bounceCooldown - deltaTime);
                
                if (proj.bounceCooldown <= 0) {
                    // 1) collidableObjects（柵、壁、障害物）との衝突反射
                    if (this.track.collidableObjects && this.track.collidableObjects.length > 0) {
                        for (const obj of this.track.collidableObjects) {
                            if (!obj.userData || !obj.userData.isCollidable) continue;
                            if (!obj.visible && !obj.userData.forceCollide) continue;
                            
                            const objBox = new THREE.Box3().setFromObject(obj);
                            // 甲羅の位置で小さなボックスを作成
                            const shellBox = new THREE.Box3(
                                new THREE.Vector3(proj.position.x - 1.2, proj.position.y - 1.2, proj.position.z - 1.2),
                                new THREE.Vector3(proj.position.x + 1.2, proj.position.y + 1.2, proj.position.z + 1.2)
                            );
                            
                            if (shellBox.intersectsBox(objBox)) {
                                if (proj.bounceCount < proj.maxBounces) {
                                    let wallNormal;
                                    
                                    // フェンスの場合、保存された法線を使用（回転対応）
                                    if (obj.userData.isFence && obj.userData.fenceNormalX !== undefined) {
                                        const nx = obj.userData.fenceNormalX;
                                        const nz = obj.userData.fenceNormalZ;
                                        // 甲羅がフェンスのどちら側にいるかで法線方向を決定
                                        const relX = proj.position.x - obj.position.x;
                                        const relZ = proj.position.z - obj.position.z;
                                        const side = relX * nx + relZ * nz;
                                        wallNormal = new THREE.Vector3(
                                            side >= 0 ? nx : -nx,
                                            0,
                                            side >= 0 ? nz : -nz
                                        );
                                    } else {
                                        // 通常のAABB壁：壁面に対する正確な反射を計算
                                        const objCenter = new THREE.Vector3();
                                        objBox.getCenter(objCenter);
                                        const objSize = new THREE.Vector3();
                                        objBox.getSize(objSize);
                                        
                                        // 甲羅から壁中心への相対位置
                                        const relX = proj.position.x - objCenter.x;
                                        const relZ = proj.position.z - objCenter.z;
                                        
                                        // どの軸で壁を越えたかで法線を決定
                                        const overlapX = (objSize.x / 2 + 1.2) - Math.abs(relX);
                                        const overlapZ = (objSize.z / 2 + 1.2) - Math.abs(relZ);
                                        
                                        if (overlapX < overlapZ) {
                                            wallNormal = new THREE.Vector3(relX > 0 ? 1 : -1, 0, 0);
                                        } else {
                                            wallNormal = new THREE.Vector3(0, 0, relZ > 0 ? 1 : -1);
                                        }
                                    }
                                    
                                    // 反射ベクトル: r = d - 2(d·n)n
                                    const dot = proj.direction.dot(wallNormal);
                                    if (dot < 0) {
                                        // 壁に向かっている場合のみ反射
                                        proj.direction.x -= 2 * dot * wallNormal.x;
                                        proj.direction.z -= 2 * dot * wallNormal.z;
                                        proj.direction.y = 0;
                                        proj.direction.normalize();
                                    }
                                    
                                    // 壁から十分に押し出す（法線方向に押し出し）
                                    proj.position.x += wallNormal.x * 3;
                                    proj.position.z += wallNormal.z * 3;
                                    proj.mesh.position.copy(proj.position);
                                    
                                    proj.bounceCount++;
                                    proj.bounceCooldown = 0.15; // 150ms クールダウン
                                    bounced = true;
                                    
                                    if (window.audioManager) {
                                        window.audioManager.playSound('shell_bounce');
                                    }
                                } else {
                                    // 最大バウンス到達：点滅して消滅
                                    this.shellBlinkAndRemove(proj);
                                    proj.active = false;
                                    bounced = true;
                                }
                                break;
                            }
                        }
                    }
                    
                    // 2) コース外に出た場合の反射（従来のロジック）
                    if (!bounced && !this.track.isOnTrack(proj.position.x, proj.position.z)) {
                        if (proj.bounceCount < proj.maxBounces) {
                            // 跳ね返り - 進行方向を反転して真っすぐ戻す
                            const trackCenter = this.track.getClosestTrackPoint(proj.position.x, proj.position.z);
                            if (trackCenter) {
                                // コース中心への方向を計算して反射
                                const toCenter = new THREE.Vector3(
                                    trackCenter.x - proj.position.x,
                                    0,
                                    trackCenter.z - proj.position.z
                                ).normalize();
                                
                                // 入射方向と壁法線から反射を計算
                                const dot = proj.direction.dot(toCenter);
                                if (dot < 0) {
                                    proj.direction.x -= 2 * dot * toCenter.x;
                                    proj.direction.z -= 2 * dot * toCenter.z;
                                    proj.direction.y = 0;
                                    proj.direction.normalize();
                                } else {
                                    // すでにコース内に向いている場合はそのまま
                                    proj.direction.copy(toCenter);
                                }
                                
                                // コース内に押し戻す
                                proj.position.x += toCenter.x * 3;
                                proj.position.z += toCenter.z * 3;
                                proj.mesh.position.copy(proj.position);
                                
                                proj.bounceCount++;
                                proj.bounceCooldown = 0.15;
                                
                                if (window.audioManager) {
                                    window.audioManager.playSound('shell_bounce');
                                }
                            }
                        } else {
                            // 最大バウンス到達：点滅して消滅
                            this.shellBlinkAndRemove(proj);
                            proj.active = false;
                        }
                    }
                }
            }
            
            // Rotate to face direction
            proj.mesh.rotation.y = Math.atan2(proj.direction.x, proj.direction.z);
            
            // 甲羅は回転させる
            if (proj.type === 'shell') {
                proj.mesh.rotation.z += deltaTime * 15;
            }
            
            // Check collision with karts（プレイヤー含む全員）
            for (let i = 0; i < karts.length; i++) {
                const kart = karts[i];
                if (kart === proj.owner) continue;  // 発射した本人だけスキップ
                if (!proj.active) break;
                
                const dist = proj.position.distanceTo(kart.position);
                if (dist < 4) {  // 当たり判定を少し広く
                    // 無敵状態（スター）なら甲羅を破壊
                    if (kart.invincibilityTimer > 0 || kart.starActive) {
                        proj.active = false;
                        this.createExplosion(proj.position);
                        if (window.audioManager) {
                            window.audioManager.playSound('shell_break');
                        }
                        continue;
                    }
                    
                    // シールドがあれば防ぐ
                    if (kart.hasShield) {
                        kart.hasShield = false;
                        kart.shieldTimer = 0;
                        kart.shieldMesh.material.opacity = 0;
                        proj.active = false;
                        this.createExplosion(proj.position);
                        if (window.audioManager) {
                            window.audioManager.playSound('shield_break');
                        }
                        continue;
                    }
                    
                    // Hit! クラッシュ
                    kart.spinOut();
                    proj.active = false;
                    
                    if (window.audioManager) {
                        window.audioManager.playSound('missile_hit');
                    }
                    
                    // Create explosion effect
                    this.createExplosion(proj.position);
                    break;
                }
            }
            
            return proj.active;
        });
        
        // Update hazards
        this.hazards = this.hazards.filter(hazard => {
            if (!hazard.active) {
                this.itemGroup.remove(hazard.mesh);
                return false;
            }
            
            hazard.lifetime -= deltaTime;
            if (hazard.lifetime <= 0) {
                hazard.active = false;
                this.itemGroup.remove(hazard.mesh);
                return false;
            }
            
            // 寿命が残り少ないハザードを点滅・フェードアウトさせる
            const fadeTime = 3; // 最後の3秒間でフェードアウト
            if (hazard.lifetime < fadeTime) {
                const opacity = hazard.lifetime / fadeTime;
                // 点滅エフェクト（残り時間が少ないほど速く点滅）
                const blinkSpeed = 4 + (1 - opacity) * 12;
                const blink = Math.sin(Date.now() * 0.001 * blinkSpeed * Math.PI) > 0 ? opacity : opacity * 0.3;
                hazard.mesh.traverse(child => {
                    if (child.material) {
                        child.material.transparent = true;
                        child.material.opacity = blink;
                    }
                });
            }
            
            // Rotate banana
            if (hazard.type === 'banana') {
                hazard.mesh.rotation.y += deltaTime * 2;
            }
            
            // Check collision with karts（プレイヤー含む全員）
            for (let i = 0; i < karts.length; i++) {
                const kart = karts[i];
                if (!hazard.active || hazard._blinking) break;
                
                // 置いた直後の0.5秒間だけオーナーは免除（通過するため）
                const maxLifetime = hazard.type === 'banana' ? 30 : 20;
                const timeSinceDrop = maxLifetime - hazard.lifetime;
                if (kart === hazard.owner && timeSinceDrop < 0.5) continue;
                
                // すでにスピンアウト中ならスキップ
                if (kart.isSpunOut) continue;
                
                const dist = Utils.distance2D(
                    kart.position.x, kart.position.z,
                    hazard.position.x, hazard.position.z
                );
                
                if (dist < hazard.radius + 1) {  // 当たり判定を少し広く
                    // 無敵状態（スター）のカートはハザードを破壊する
                    if (kart.invincibilityTimer > 0 || kart.starActive) {
                        hazard.active = false;
                        this.createExplosion(hazard.position);
                        if (window.audioManager) {
                            window.audioManager.playSound('shell_break');
                        }
                        continue;
                    }
                    
                    // シールドがあれば防ぐ
                    if (kart.hasShield) {
                        kart.hasShield = false;
                        kart.shieldTimer = 0;
                        if (kart.shieldMesh) kart.shieldMesh.material.opacity = 0;
                        hazard.active = false;
                        continue;
                    }
                    
                    if (hazard.type === 'banana') {
                        kart.spinOut();
                        // 点滅してから消える
                        this.hazardBlinkAndRemove(hazard);
                    } else if (hazard.type === 'oil') {
                        // スピンアウト（自分のオイルでも同様）
                        kart.spinOut();
                        // オイルは踏んでも消えない（複数回使える）
                    } else if (hazard.type === 'dropped_shell') {
                        kart.spinOut();
                        // 点滅してから消える
                        this.hazardBlinkAndRemove(hazard);
                        if (window.audioManager) {
                            window.audioManager.playSound('shell_break');
                        }
                    }
                }
            }
            
            return hazard.active;
        });
    }
    
    // === スパイニー甲羅（青甲羅）の更新処理 ===
    updateSpinyShell(proj, deltaTime, karts) {
        // 1位のカートを探す（発射者含む全カートから）
        let firstPlaceKart = null;
        let bestProgress = -Infinity;
        
        karts.forEach(kart => {
            if (kart.totalProgress > bestProgress) {
                bestProgress = kart.totalProgress;
                firstPlaceKart = kart;
            }
        });
        
        proj.target = firstPlaceKart;
        
        // メッシュの可視性を確実に維持
        if (proj.mesh) {
            proj.mesh.visible = true;
        }
        
        // === コース上を走行して1位を追いかけるロジック ===
        if (proj.target) {
            // トラックに沿って1位の方向へ進む
            const toTarget = new THREE.Vector3(
                proj.target.position.x - proj.position.x,
                0,
                proj.target.position.z - proj.position.z
            );
            
            // ターゲットへの方向を向く（コース上を走るためスムーズに追尾）
            toTarget.normalize();
            proj.direction.lerp(toTarget, 0.08);
            proj.direction.y = 0;
            proj.direction.normalize();
        }
        
        // 移動
        const movement = proj.direction.clone().multiplyScalar(proj.speed * deltaTime);
        proj.position.add(movement);
        proj.position.y = 1.5;  // 地面の高さを維持
        proj.mesh.position.copy(proj.position);
        
        // 回転アニメーション
        proj.mesh.rotation.y = Math.atan2(proj.direction.x, proj.direction.z);
        proj.mesh.rotation.z += deltaTime * 15;  // スピン
        
        // 甲羅の光り方（青く脈動）
        if (proj.mesh && proj.mesh.children[0] && proj.mesh.children[0].material) {
            const glowIntensity = 0.3 + Math.sin(Date.now() * 0.008) * 0.2;
            proj.mesh.children[0].material.emissiveIntensity = glowIntensity;
        }
        
        // === 壁バウンス処理（緑甲羅と同じシステム） ===
        if (!proj.bounceCooldown) proj.bounceCooldown = 0;
        proj.bounceCooldown = Math.max(0, proj.bounceCooldown - deltaTime);
        
        if (proj.bounceCooldown <= 0) {
            let bounced = false;
            
            // collidableObjectsとの衝突反射
            if (this.track.collidableObjects && this.track.collidableObjects.length > 0) {
                for (const obj of this.track.collidableObjects) {
                    if (!obj.userData || !obj.userData.isCollidable) continue;
                    if (!obj.visible && !obj.userData.forceCollide) continue;
                    
                    const objBox = new THREE.Box3().setFromObject(obj);
                    const shellBox = new THREE.Box3(
                        new THREE.Vector3(proj.position.x - 1.2, proj.position.y - 1.2, proj.position.z - 1.2),
                        new THREE.Vector3(proj.position.x + 1.2, proj.position.y + 1.2, proj.position.z + 1.2)
                    );
                    
                    if (shellBox.intersectsBox(objBox)) {
                        let wallNormal;
                        
                        if (obj.userData.isFence && obj.userData.fenceNormalX !== undefined) {
                            const nx = obj.userData.fenceNormalX;
                            const nz = obj.userData.fenceNormalZ;
                            const relX = proj.position.x - obj.position.x;
                            const relZ = proj.position.z - obj.position.z;
                            const side = relX * nx + relZ * nz;
                            wallNormal = new THREE.Vector3(
                                side >= 0 ? nx : -nx, 0, side >= 0 ? nz : -nz
                            );
                        } else {
                            const objCenter = new THREE.Vector3();
                            objBox.getCenter(objCenter);
                            const objSize = new THREE.Vector3();
                            objBox.getSize(objSize);
                            const relX = proj.position.x - objCenter.x;
                            const relZ = proj.position.z - objCenter.z;
                            const overlapX = (objSize.x / 2 + 1.2) - Math.abs(relX);
                            const overlapZ = (objSize.z / 2 + 1.2) - Math.abs(relZ);
                            if (overlapX < overlapZ) {
                                wallNormal = new THREE.Vector3(relX > 0 ? 1 : -1, 0, 0);
                            } else {
                                wallNormal = new THREE.Vector3(0, 0, relZ > 0 ? 1 : -1);
                            }
                        }
                        
                        const dot = proj.direction.dot(wallNormal);
                        if (dot < 0) {
                            proj.direction.x -= 2 * dot * wallNormal.x;
                            proj.direction.z -= 2 * dot * wallNormal.z;
                            proj.direction.y = 0;
                            proj.direction.normalize();
                        }
                        proj.position.x += wallNormal.x * 3;
                        proj.position.z += wallNormal.z * 3;
                        proj.mesh.position.copy(proj.position);
                        proj.bounceCooldown = 0.15;
                        bounced = true;
                        
                        if (window.audioManager) {
                            window.audioManager.playSound('shell_bounce');
                        }
                        break;
                    }
                }
            }
            
            // コース外の反射
            if (!bounced && !this.track.isOnTrack(proj.position.x, proj.position.z)) {
                const trackCenter = this.track.getClosestTrackPoint(proj.position.x, proj.position.z);
                if (trackCenter) {
                    const toCenter = new THREE.Vector3(
                        trackCenter.x - proj.position.x, 0,
                        trackCenter.z - proj.position.z
                    ).normalize();
                    
                    const dot = proj.direction.dot(toCenter);
                    if (dot < 0) {
                        proj.direction.x -= 2 * dot * toCenter.x;
                        proj.direction.z -= 2 * dot * toCenter.z;
                        proj.direction.y = 0;
                        proj.direction.normalize();
                    } else {
                        proj.direction.copy(toCenter);
                    }
                    proj.position.x += toCenter.x * 3;
                    proj.position.z += toCenter.z * 3;
                    proj.mesh.position.copy(proj.position);
                    proj.bounceCooldown = 0.15;
                }
            }
        }
        
        // === カートとの衝突判定 ===
        for (let i = 0; i < karts.length; i++) {
            const kart = karts[i];
            if (kart === proj.owner && proj.lifetime > 28) continue; // 発射直後だけオーナー免除
            if (!proj.active) break;
            
            const dist = proj.position.distanceTo(kart.position);
            if (dist < 5) {
                // 無敵状態（スター）なら跳ね返す
                if (kart.invincibilityTimer > 0 || kart.starActive) {
                    continue;  // トゲゾーはスター相手でも消えない、ただしダメージなし
                }
                
                // シールドがあれば防ぐ（トゲゾーは消えない）
                if (kart.hasShield) {
                    kart.hasShield = false;
                    kart.shieldTimer = 0;
                    if (kart.shieldMesh) kart.shieldMesh.material.opacity = 0;
                    if (window.audioManager) {
                        window.audioManager.playSound('shield_break');
                    }
                    continue;
                }
                
                // カートをクラッシュさせる
                kart.spinOut();
                
                if (window.audioManager) {
                    window.audioManager.playSound('missile_hit');
                }
                this.createExplosion(proj.position);
                
                // 1位のカートにヒットしたら消滅、それ以外は貫通
                if (kart === firstPlaceKart) {
                    proj.active = false;
                    return false;
                }
                // 1位以外にヒットしても消えずに突き進む
            }
        }
        
        return proj.active;
    }
    
    // スパイニー甲羅の爆発処理
    explodeSpinyShell(proj, karts) {
        // 爆発エフェクト（大きめ）
        this.createSpinyExplosion(proj.position);
        
        // 範囲内の全カートにダメージ
        karts.forEach(kart => {
            const dist = proj.position.distanceTo(kart.position);
            
            if (dist < proj.explosionRadius) {
                // 無敵状態（スター）なら回避
                if (kart.invincibilityTimer > 0 || kart.starActive) {
                    return;
                }
                
                // シールドがあれば防ぐ
                if (kart.hasShield) {
                    kart.hasShield = false;
                    kart.shieldTimer = 0;
                    if (kart.shieldMesh) kart.shieldMesh.material.opacity = 0;
                    return;
                }
                
                kart.spinOut();
            }
        });
        
        if (window.audioManager) {
            window.audioManager.playSound('explosion');
        }
    }
    
    // スパイニー甲羅専用の大爆発エフェクト
    createSpinyExplosion(position) {
        // 青い爆発エフェクト
        const explosionGroup = new THREE.Group();
        
        // 中心の青い球
        const coreGeo = new THREE.SphereGeometry(3, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x0088ff,
            transparent: true,
            opacity: 0.8
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        explosionGroup.add(core);
        
        // 外側のリング
        const ringGeo = new THREE.RingGeometry(4, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00aaff,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        explosionGroup.add(ring);
        
        explosionGroup.position.copy(position);
        explosionGroup.position.y = 1;
        
        this.itemGroup.add(explosionGroup);
        
        // アニメーション
        let scale = 1;
        const animate = () => {
            scale += 0.15;
            core.scale.set(scale, scale, scale);
            ring.scale.set(scale * 1.5, scale * 1.5, 1);
            coreMat.opacity -= 0.05;
            ringMat.opacity -= 0.03;
            
            if (coreMat.opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.itemGroup.remove(explosionGroup);
            }
        };
        requestAnimationFrame(animate);
        
        // 通常のパーティクル爆発も
        if (window.game && window.game.particleSystem) {
            window.game.particleSystem.createExplosion(position);
        }
    }
    
    // 飛んでいる甲羅を地面の障害物として設置
    // 甲羅を点滅させてフィールドから消す
    shellBlinkAndRemove(proj) {
        const mesh = proj.mesh;
        if (!mesh) return;
        
        // 速度を0にして停止
        proj.speed = 0;
        
        let blinkCount = 0;
        const maxBlinks = 8;
        const blinkInterval = 120; // ms
        
        const blinkTimer = setInterval(() => {
            if (!mesh.parent) {
                clearInterval(blinkTimer);
                return;
            }
            blinkCount++;
            mesh.visible = !mesh.visible;
            
            if (blinkCount >= maxBlinks * 2) {
                clearInterval(blinkTimer);
                this.itemGroup.remove(mesh);
            }
        }, blinkInterval);
    }
    
    // ハザード（バナナ・落ちた甲羅）を点滅させてから消す
    hazardBlinkAndRemove(hazard) {
        const mesh = hazard.mesh;
        if (!mesh) return;
        
        // 当たり判定を無効化（二重ヒット防止）
        hazard.radius = 0;
        hazard._blinking = true;
        
        let blinkCount = 0;
        const maxBlinks = 8;
        const blinkInterval = 100; // ms
        
        const blinkTimer = setInterval(() => {
            if (!mesh.parent) {
                clearInterval(blinkTimer);
                return;
            }
            blinkCount++;
            mesh.visible = !mesh.visible;
            
            if (blinkCount >= maxBlinks * 2) {
                clearInterval(blinkTimer);
                hazard.active = false;
            }
        }, blinkInterval);
    }
    
    convertShellToHazard(proj) {
        // 新しい甲羅メッシュを作成（小さくして地面に置く）
        const shellGroup = new THREE.Group();
        
        // 甲羅の色を取得（赤か緑）
        const shellColor = proj.isHoming ? 0xff2222 : 0x22cc22;
        
        // === 甲羅の甲（上部） ===
        const shellGeo = new THREE.SphereGeometry(0.8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const shellMat = new THREE.MeshStandardMaterial({
            color: shellColor,
            roughness: 0.3,
            metalness: 0.2
        });
        const shellTop = new THREE.Mesh(shellGeo, shellMat);
        shellTop.position.y = 0.2;
        shellTop.rotation.x = Math.PI;
        shellGroup.add(shellTop);
        
        // === 底面 ===
        const bottomGeo = new THREE.CircleGeometry(0.7, 16);
        const bottomMat = new THREE.MeshStandardMaterial({
            color: 0xffffd0,
            roughness: 0.6
        });
        const bottom = new THREE.Mesh(bottomGeo, bottomMat);
        bottom.rotation.x = -Math.PI / 2;
        bottom.position.y = 0.1;
        shellGroup.add(bottom);
        
        // 位置設定
        shellGroup.position.copy(proj.position);
        shellGroup.position.y = 0.5;
        
        this.itemGroup.add(shellGroup);
        
        // ハザードとして登録
        this.hazards.push({
            type: 'dropped_shell',
            mesh: shellGroup,
            owner: proj.owner,
            position: shellGroup.position.clone(),
            radius: 2.5,
            active: true,
            lifetime: 20  // 20秒間地面に残る
        });
    }
    
    createExplosion(position) {
        // Simple explosion effect using particles
        if (window.game && window.game.particleSystem) {
            window.game.particleSystem.createExplosion(position);
        }
    }
    
    // Clean up all items
    clear() {
        this.projectiles.forEach(proj => {
            this.itemGroup.remove(proj.mesh);
        });
        this.projectiles = [];
        
        this.hazards.forEach(hazard => {
            this.itemGroup.remove(hazard.mesh);
        });
        this.hazards = [];
    }
    
    // メモリクリーンアップ - 非アクティブなアイテムを解放
    cleanupInactiveItems() {
        // 非アクティブなprojectilesのジオメトリとマテリアルを解放
        this.projectiles = this.projectiles.filter(proj => {
            if (!proj.active) {
                this.disposeObject(proj.mesh);
                this.itemGroup.remove(proj.mesh);
                return false;
            }
            return true;
        });
        
        // 非アクティブなhazardsのジオメトリとマテリアルを解放
        this.hazards = this.hazards.filter(hazard => {
            if (!hazard.active) {
                this.disposeObject(hazard.mesh);
                this.itemGroup.remove(hazard.mesh);
                return false;
            }
            return true;
        });
    }
    
    // Three.jsオブジェクトのメモリ解放
    disposeObject(object) {
        if (!object) return;
        
        object.traverse(child => {
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
}

window.ItemManager = ItemManager;
