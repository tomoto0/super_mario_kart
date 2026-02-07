// AI Controller for computer-controlled karts

class AIController {
    constructor(kart, track, difficulty = 'normal') {
        this.kart = kart;
        this.track = track;
        this.difficulty = difficulty;
        
        // Difficulty settings
        this.difficultySettings = {
            easy: {
                maxSpeedMultiplier: 0.85,
                reactionTime: 0.3,
                turnAccuracy: 0.7,
                itemUseProbability: 0.5,
                rubberBandStrength: 0.3,
                mistakeProbability: 0.15
            },
            normal: {
                maxSpeedMultiplier: 0.95,
                reactionTime: 0.15,
                turnAccuracy: 0.85,
                itemUseProbability: 0.7,
                rubberBandStrength: 0.5,
                mistakeProbability: 0.08
            },
            hard: {
                maxSpeedMultiplier: 1.0,
                reactionTime: 0.08,
                turnAccuracy: 0.95,
                itemUseProbability: 0.9,
                rubberBandStrength: 0.7,
                mistakeProbability: 0.03
            }
        };
        
        this.settings = this.difficultySettings[difficulty];
        
        // Racing line waypoints
        this.waypoints = this.generateRacingLine();
        this.currentWaypointIndex = 0;
        this.lookaheadDistance = 12;  // 短めに設定してコースを外れにくくする
        
        // AI state
        this.targetPoint = null;
        this.stuckTimer = 0;
        this.lastPosition = kart.position.clone();
        this.recoveryMode = false;
        this.recoveryTimer = 0;
        this.avoidanceDirection = 0;  // 障害物回避方向
        
        // Decision timers
        this.itemDecisionTimer = 0;
        this.driftDecisionTimer = 0;
        
        // Personality variations
        this.aggression = Math.random() * 0.4 + 0.3; // 0.3 - 0.7
        this.consistency = Math.random() * 0.3 + 0.7; // 0.7 - 1.0
        
        // Rubber-banding state
        this.rubberBandBoost = 0;
    }
    
    generateRacingLine() {
        // Use track points but optimize for racing line
        const waypoints = [];
        
        // trackPointsが存在しない場合は空配列を返す
        if (!this.track.trackPoints || this.track.trackPoints.length === 0) {
            console.warn('Track points not available for AI');
            return waypoints;
        }
        
        const step = Math.max(1, Math.floor(this.track.trackPoints.length / 100));
        
        for (let i = 0; i < this.track.trackPoints.length; i += step) {
            const point = this.track.trackPoints[i];
            waypoints.push({
                x: point.x,
                y: point.y || 0,
                z: point.z,
                optimalSpeed: this.calculateOptimalSpeed(i)
            });
        }
        
        return waypoints;
    }
    
    calculateOptimalSpeed(index) {
        // Calculate optimal speed based on upcoming turns
        const points = this.track.trackPoints;
        const lookahead = 10;
        
        let maxTurnAngle = 0;
        
        for (let i = 0; i < lookahead && index + i + 1 < points.length; i++) {
            const curr = points[index + i];
            const next = points[(index + i + 1) % points.length];
            const nextNext = points[(index + i + 2) % points.length];
            
            const angle1 = Math.atan2(next.z - curr.z, next.x - curr.x);
            const angle2 = Math.atan2(nextNext.z - next.z, nextNext.x - next.x);
            const turnAngle = Math.abs(Utils.normalizeAngle(angle2 - angle1));
            
            maxTurnAngle = Math.max(maxTurnAngle, turnAngle);
        }
        
        // Slower for sharper turns
        const speedFactor = 1 - (maxTurnAngle / Math.PI) * 0.5;
        return this.kart.maxSpeed * speedFactor * this.settings.maxSpeedMultiplier;
    }
    
    update(deltaTime, allKarts) {
        if (this.kart.isSpunOut || this.kart.isFrozen || this.kart.finished) {
            return;
        }
        
        // リカバリーモード中は特別な処理
        if (this.recoveryMode) {
            this.handleRecovery(deltaTime);
            return;
        }
        
        // Update rubber-banding
        this.updateRubberBanding(allKarts);
        
        // 障害物チェックと回避
        this.checkObstacleAvoidance(allKarts);
        
        // Find target waypoint
        this.updateTargetWaypoint();
        
        // Calculate steering
        this.calculateSteering(deltaTime);
        
        // Handle acceleration
        this.handleAcceleration(deltaTime);
        
        // Decide on drifting
        this.decideDrift(deltaTime);
        
        // Decide on item usage
        this.decideItemUsage(deltaTime, allKarts);
        
        // Check if stuck
        this.checkIfStuck(deltaTime);
        
        // Apply random mistakes based on difficulty
        this.applyMistakes(deltaTime);
    }
    
    // 障害物回避チェック
    checkObstacleAvoidance(allKarts) {
        this.avoidanceDirection = 0;
        
        // 敵キャラクター（ドッスン、ノコノコ）をチェック
        if (this.track.enemies) {
            for (const enemy of this.track.enemies) {
                const dist = Utils.distance2D(
                    this.kart.position.x, this.kart.position.z,
                    enemy.mesh.position.x, enemy.mesh.position.z
                );
                
                // 前方の障害物のみチェック
                const angleToEnemy = Math.atan2(
                    enemy.mesh.position.x - this.kart.position.x,
                    enemy.mesh.position.z - this.kart.position.z
                );
                const angleDiff = Math.abs(Utils.normalizeAngle(angleToEnemy - this.kart.rotation));
                
                if (dist < 25 && angleDiff < Math.PI / 3) {
                    // 障害物が前方にある - 回避
                    const crossProduct = Math.sin(angleToEnemy - this.kart.rotation);
                    this.avoidanceDirection = crossProduct > 0 ? -1 : 1;
                    break;
                }
            }
        }
        
        // 他のカートもチェック
        for (const other of allKarts) {
            if (other === this.kart) continue;
            
            const dist = Utils.distance2D(
                this.kart.position.x, this.kart.position.z,
                other.position.x, other.position.z
            );
            
            if (dist < 8 && dist > 0) {
                const angleToKart = Math.atan2(
                    other.position.x - this.kart.position.x,
                    other.position.z - this.kart.position.z
                );
                const angleDiff = Math.abs(Utils.normalizeAngle(angleToKart - this.kart.rotation));
                
                if (angleDiff < Math.PI / 4) {
                    const crossProduct = Math.sin(angleToKart - this.kart.rotation);
                    this.avoidanceDirection = crossProduct > 0 ? -1 : 1;
                    break;
                }
            }
        }
    }
    
    // リカバリーモード処理
    handleRecovery(deltaTime) {
        this.recoveryTimer -= deltaTime;
        
        if (this.recoveryTimer > 1.0) {
            // フェーズ1: バックしながら曲がる
            this.kart.input.forward = false;
            this.kart.input.backward = true;
            this.kart.input.left = this.avoidanceDirection > 0;
            this.kart.input.right = this.avoidanceDirection <= 0;
        } else if (this.recoveryTimer > 0.3) {
            // フェーズ2: 反対方向に旋回しながら前進
            this.kart.input.forward = true;
            this.kart.input.backward = false;
            this.kart.input.left = this.avoidanceDirection <= 0;
            this.kart.input.right = this.avoidanceDirection > 0;
        } else {
            // フェーズ3: まっすぐ加速して脱出
            this.kart.input.forward = true;
            this.kart.input.backward = false;
            this.kart.input.left = false;
            this.kart.input.right = false;
        }
        
        if (this.recoveryTimer <= 0) {
            this.recoveryMode = false;
            this.stuckTimer = 0;
        }
    }
    
    updateRubberBanding(allKarts) {
        // Find player position and calculate rubber-banding
        const playerKart = allKarts.find(k => k.isPlayer);
        if (!playerKart) return;
        
        const positionDiff = playerKart.racePosition - this.kart.racePosition;
        
        if (positionDiff > 0) {
            // AI is ahead of player - slow down slightly
            this.rubberBandBoost = -this.settings.rubberBandStrength * 0.3 * positionDiff;
        } else if (positionDiff < 0) {
            // AI is behind player - speed up
            this.rubberBandBoost = this.settings.rubberBandStrength * 0.5 * Math.abs(positionDiff);
        } else {
            this.rubberBandBoost = 0;
        }
        
        // Clamp rubber band boost
        this.rubberBandBoost = Utils.clamp(this.rubberBandBoost, -0.2, 0.3);
    }
    
    updateTargetWaypoint() {
        // waypointsがない場合は何もしない
        if (!this.waypoints || this.waypoints.length === 0) {
            // waypointsがなければ再生成を試みる
            this.waypoints = this.generateRacingLine();
            if (this.waypoints.length === 0) return;
        }
        
        // Find closest waypoint
        let closestDist = Infinity;
        let closestIdx = 0;
        
        for (let i = 0; i < this.waypoints.length; i++) {
            const wp = this.waypoints[i];
            const dist = Utils.distance2D(
                this.kart.position.x, this.kart.position.z,
                wp.x, wp.z
            );
            
            if (dist < closestDist) {
                closestDist = dist;
                closestIdx = i;
            }
        }
        
        // Look ahead for target
        const lookaheadWaypoints = Math.floor(this.lookaheadDistance / 8);
        this.currentWaypointIndex = (closestIdx + lookaheadWaypoints) % this.waypoints.length;
        this.targetPoint = this.waypoints[this.currentWaypointIndex];
        
        // コース中心への補正 - 最寄りのwaypointから離れすぎている場合は中心に寄せる
        const nearestWp = this.waypoints[closestIdx];
        const distFromCenter = Utils.distance2D(
            this.kart.position.x, this.kart.position.z,
            nearestWp.x, nearestWp.z
        );
        
        // コース幅の半分（約14）を超えたら中心に向かう補正を入れる
        if (distFromCenter > 10) {
            const blendFactor = Math.min(1, (distFromCenter - 10) / 10);
            this.targetPoint = {
                x: this.targetPoint.x * (1 - blendFactor * 0.5) + nearestWp.x * blendFactor * 0.5,
                z: this.targetPoint.z * (1 - blendFactor * 0.5) + nearestWp.z * blendFactor * 0.5,
                optimalSpeed: this.targetPoint.optimalSpeed * (1 - blendFactor * 0.2)  // 外れている時は減速
            };
        }
    }
    
    calculateSteering(deltaTime) {
        if (!this.targetPoint) return;
        
        // Calculate angle to target
        const angleToTarget = Math.atan2(
            this.targetPoint.x - this.kart.position.x,
            this.targetPoint.z - this.kart.position.z
        );
        
        // Calculate angle difference
        let angleDiff = Utils.normalizeAngle(angleToTarget - this.kart.rotation);
        
        // Apply turn accuracy (lower = more wobbly steering)
        angleDiff *= this.settings.turnAccuracy;
        
        // Apply reaction time delay
        angleDiff *= Math.min(1, deltaTime / this.settings.reactionTime);
        
        // 障害物回避を適用
        if (this.avoidanceDirection !== 0) {
            angleDiff += this.avoidanceDirection * 0.5;  // 回避方向に曲がる
        }
        
        // Set input based on angle difference
        const turnThreshold = 0.05;
        
        if (angleDiff > turnThreshold) {
            this.kart.input.left = true;
            this.kart.input.right = false;
        } else if (angleDiff < -turnThreshold) {
            this.kart.input.left = false;
            this.kart.input.right = true;
        } else {
            this.kart.input.left = false;
            this.kart.input.right = false;
        }
    }
    
    handleAcceleration(deltaTime) {
        const targetSpeed = this.targetPoint ? this.targetPoint.optimalSpeed : this.kart.maxSpeed * 0.8;
        const adjustedMaxSpeed = targetSpeed * (1 + this.rubberBandBoost);
        
        // Always accelerate unless going too fast
        if (this.kart.speed < adjustedMaxSpeed) {
            this.kart.input.forward = true;
            this.kart.input.backward = false;
        } else {
            // Ease off throttle
            this.kart.input.forward = Math.random() > 0.3;
            this.kart.input.backward = false;
        }
        
        // Brake for sharp turns
        if (this.shouldBrake()) {
            this.kart.input.forward = false;
            this.kart.input.backward = true;
        }
        
        // コース外にいる場合は減速して戻りやすくする
        if (this.isOffTrack()) {
            this.kart.input.forward = this.kart.speed < 30;  // 低速維持
        }
    }
    
    shouldBrake() {
        if (!this.targetPoint) return false;
        
        // Calculate turn sharpness
        const angleToTarget = Math.atan2(
            this.targetPoint.x - this.kart.position.x,
            this.targetPoint.z - this.kart.position.z
        );
        
        const angleDiff = Math.abs(Utils.normalizeAngle(angleToTarget - this.kart.rotation));
        
        // Brake if turn is sharp and going fast
        return angleDiff > Math.PI / 4 && this.kart.speed > 40;  // より早めにブレーキ
    }
    
    // コース外判定
    isOffTrack() {
        if (!this.waypoints || this.waypoints.length === 0) return false;
        
        // 最寄りのwaypointとの距離でコース外判定
        let minDist = Infinity;
        for (const wp of this.waypoints) {
            const dist = Utils.distance2D(
                this.kart.position.x, this.kart.position.z,
                wp.x, wp.z
            );
            minDist = Math.min(minDist, dist);
        }
        
        // コース幅の半分（約14）より外ならコース外
        return minDist > 14;
    }
    
    decideDrift(deltaTime) {
        this.driftDecisionTimer -= deltaTime;
        
        if (this.driftDecisionTimer > 0) return;
        
        this.driftDecisionTimer = 0.2;
        
        if (!this.targetPoint) {
            this.kart.input.drift = false;
            return;
        }
        
        // Calculate upcoming turn
        const nextIdx = (this.currentWaypointIndex + 5) % this.waypoints.length;
        const nextPoint = this.waypoints[nextIdx];
        
        const currentAngle = Math.atan2(
            this.targetPoint.x - this.kart.position.x,
            this.targetPoint.z - this.kart.position.z
        );
        
        const nextAngle = Math.atan2(
            nextPoint.x - this.targetPoint.x,
            nextPoint.z - this.targetPoint.z
        );
        
        const turnAmount = Math.abs(Utils.normalizeAngle(nextAngle - currentAngle));
        
        // Drift on sharp turns
        if (turnAmount > Math.PI / 6 && this.kart.speed > 40) {
            this.kart.input.drift = true;
        } else if (this.kart.driftLevel >= 2) {
            // Keep drifting if we have a good boost built up
            this.kart.input.drift = true;
        } else {
            this.kart.input.drift = false;
        }
    }
    
    decideItemUsage(deltaTime, allKarts) {
        this.itemDecisionTimer -= deltaTime;
        
        if (this.itemDecisionTimer > 0) return;
        if (!this.kart.currentItem) return;
        
        this.itemDecisionTimer = 0.5 + Math.random() * 0.5;
        
        // Probability check
        if (Math.random() > this.settings.itemUseProbability) return;
        
        const item = this.kart.currentItem;
        const position = this.kart.racePosition;
        
        let shouldUse = false;
        
        switch (item.id) {
            case 'rocket_boost':
            case 'triple_boost':
                // Use on straights
                shouldUse = this.isOnStraight();
                break;
                
            case 'homing_missile':
            case 'green_shell':
                // Use when there's a target ahead
                shouldUse = this.hasTargetAhead(allKarts);
                break;
                
            case 'banana':
            case 'oil_slick':
                // Use when someone is close behind
                shouldUse = this.hasPursuer(allKarts) || Math.random() < 0.3;
                break;
                
            case 'shield':
                // Use when in danger or randomly
                shouldUse = position <= 3 || Math.random() < 0.5;
                break;
                
            case 'lightning':
                // Use when far behind
                shouldUse = position >= 4;
                break;
                
            case 'teleport':
                // Use immediately
                shouldUse = true;
                break;
                
            case 'time_freeze':
                // Use when close to others
                shouldUse = this.hasNearbyKarts(allKarts);
                break;
        }
        
        if (shouldUse && window.game) {
            this.kart.useItem(window.game);
        }
    }
    
    isOnStraight() {
        if (!this.targetPoint) return false;
        
        // Check if next few waypoints are relatively straight
        let totalTurn = 0;
        
        for (let i = 0; i < 5; i++) {
            const curr = this.waypoints[(this.currentWaypointIndex + i) % this.waypoints.length];
            const next = this.waypoints[(this.currentWaypointIndex + i + 1) % this.waypoints.length];
            const nextNext = this.waypoints[(this.currentWaypointIndex + i + 2) % this.waypoints.length];
            
            const angle1 = Math.atan2(next.z - curr.z, next.x - curr.x);
            const angle2 = Math.atan2(nextNext.z - next.z, nextNext.x - next.x);
            
            totalTurn += Math.abs(Utils.normalizeAngle(angle2 - angle1));
        }
        
        return totalTurn < Math.PI / 4;
    }
    
    hasTargetAhead(allKarts) {
        for (const other of allKarts) {
            if (other === this.kart) continue;
            
            // Check if other is ahead
            if (other.totalProgress > this.kart.totalProgress) {
                const dist = this.kart.position.distanceTo(other.position);
                if (dist < 50) {
                    // Check if roughly in front
                    const toOther = Math.atan2(
                        other.position.x - this.kart.position.x,
                        other.position.z - this.kart.position.z
                    );
                    const angleDiff = Math.abs(Utils.normalizeAngle(toOther - this.kart.rotation));
                    
                    if (angleDiff < Math.PI / 4) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    hasPursuer(allKarts) {
        for (const other of allKarts) {
            if (other === this.kart) continue;
            
            const dist = this.kart.position.distanceTo(other.position);
            if (dist < 20) {
                // Check if behind
                const toOther = Math.atan2(
                    other.position.x - this.kart.position.x,
                    other.position.z - this.kart.position.z
                );
                const angleDiff = Math.abs(Utils.normalizeAngle(toOther - this.kart.rotation));
                
                if (angleDiff > Math.PI * 0.6) {
                    return true;
                }
            }
        }
        return false;
    }
    
    hasNearbyKarts(allKarts) {
        let nearbyCount = 0;
        
        for (const other of allKarts) {
            if (other === this.kart) continue;
            
            const dist = this.kart.position.distanceTo(other.position);
            if (dist < 30) {
                nearbyCount++;
            }
        }
        
        return nearbyCount >= 2;
    }
    
    checkIfStuck(deltaTime) {
        const moved = this.kart.position.distanceTo(this.lastPosition);
        this.lastPosition.copy(this.kart.position);
        
        // スピードが低いか、ほとんど動いていない場合
        if ((moved < 0.3 && this.kart.input.forward) || this.kart.speed < 3) {
            this.stuckTimer += deltaTime;
        } else {
            this.stuckTimer = Math.max(0, this.stuckTimer - deltaTime * 3);  // 回復を速く
        }
        
        // 1.0秒以上スタックしていたらリカバリーモードに入る
        if (this.stuckTimer > 1.0) {
            this.recoveryMode = true;
            this.recoveryTimer = 1.5;  // 1.5秒間リカバリー（長めに取る）
            // 最寄りのwaypointの方向に基づいて回避方向を決める
            if (this.targetPoint) {
                const angleToTarget = Math.atan2(
                    this.targetPoint.x - this.kart.position.x,
                    this.targetPoint.z - this.kart.position.z
                );
                const angleDiff = Utils.normalizeAngle(angleToTarget - this.kart.rotation);
                this.avoidanceDirection = angleDiff > 0 ? 1 : -1;
            } else {
                this.avoidanceDirection = Math.random() > 0.5 ? 1 : -1;
            }
            this.stuckTimer = 0;
            return;
        }
        
        // 軽微なスタック（0.6秒以上）- 少しバック
        if (this.stuckTimer > 0.6) {
            this.kart.input.backward = true;
            this.kart.input.forward = false;
        }
    }
    
    applyMistakes(deltaTime) {
        // Random mistakes based on difficulty
        if (Math.random() < this.settings.mistakeProbability * deltaTime) {
            // Brief wrong input
            if (Math.random() < 0.5) {
                this.kart.input.left = !this.kart.input.left;
                this.kart.input.right = !this.kart.input.right;
            } else {
                // Briefly let off throttle
                this.kart.input.forward = false;
            }
        }
    }
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.settings = this.difficultySettings[difficulty];
        
        // Regenerate racing line with new difficulty
        this.waypoints = this.generateRacingLine();
    }
}

window.AIController = AIController;
