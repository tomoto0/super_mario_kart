// Track generation and management

class Track {
    constructor(scene) {
        this.scene = scene;
        this.trackGroup = new THREE.Group();
        this.scene.add(this.trackGroup);
        
        // コースタイプ取得
        this.courseType = window.gameSettings?.courseType || 'grassland';
        
        // Track properties
        this.trackWidth = 25;
        this.wallHeight = 3;
        
        // Track path waypoints - コース別に生成
        this.waypoints = this.generateWaypoints();
        this.trackLength = 0;
        
        // Collision boundaries
        this.innerBoundary = [];
        this.outerBoundary = [];
        
        // 3D衝突オブジェクト
        this.collidableObjects = [];
        
        // Track features
        this.boostPads = [];
        this.itemBoxes = [];
        this.hazards = [];
        
        // Checkpoints for lap counting
        this.checkpoints = [];
        this.finishLine = null;
        
        // 敵キャラクター（ドッスン、ノコノコ）
        this.enemies = [];
        
        // Build the track
        this.buildTrack();
        this.addEnvironment();
        // this.addBoostPads();  // ブーストパッドは無効化
        this.addItemBoxes();
        this.addEnemies();  // 敵キャラクターを追加
    }
    
    generateWaypoints() {
        // コースタイプ別にレイアウトを分岐
        switch (this.courseType) {
            case 'snow':
                return this.generateSnowWaypoints();
            case 'castle':
                return this.generateCastleWaypoints();
            default:
                return this.generateGrasslandWaypoints();
        }
    }
    
    // === MARIO CIRCUIT (草原コース) - 広いループコース ===
    generateGrasslandWaypoints() {
        return [
            // スタート/フィニッシュ直線（南側）- 広い
            { x: -140, y: 0, z: -160, width: 45 },
            { x: -70, y: 0, z: -160, width: 45 },
            { x: 0, y: 0, z: -160, width: 45 },
            { x: 70, y: 0, z: -160, width: 45 },
            { x: 140, y: 0, z: -160, width: 45 },
            
            // 東側の大きな右カーブ
            { x: 200, y: 0, z: -140, width: 40 },
            { x: 240, y: 0, z: -80, width: 40 },
            { x: 250, y: 0, z: 0, width: 40 },
            { x: 240, y: 0, z: 80, width: 40 },
            { x: 200, y: 0, z: 140, width: 40 },
            
            // 北側ストレート
            { x: 140, y: 0, z: 180, width: 42 },
            { x: 60, y: 0, z: 200, width: 42 },
            { x: -20, y: 0, z: 210, width: 42 },
            { x: -100, y: 0, z: 200, width: 42 },
            { x: -180, y: 0, z: 170, width: 42 },
            
            // 西側の大きな左カーブ
            { x: -230, y: 0, z: 120, width: 40 },
            { x: -250, y: 0, z: 40, width: 40 },
            { x: -240, y: 0, z: -40, width: 40 },
            { x: -210, y: 0, z: -100, width: 40 },
            { x: -160, y: 0, z: -140, width: 42 },
            { x: -100, y: 0, z: -160, width: 45 },
        ];
    }
    
    // === FRAPPE SNOWLAND (雪山コース) - 広大な氷原と急カーブ ===
    generateSnowWaypoints() {
        return [
            // スタート直線（氷上・滑りやすい）
            { x: -100, y: 0, z: -220, width: 45 },
            { x: -20, y: 0, z: -220, width: 45 },
            { x: 60, y: 0, z: -220, width: 45 },
            { x: 140, y: 0, z: -220, width: 45 },
            
            // 第1コーナー（雪山の麓、緩やかに右へ）
            { x: 200, y: 0, z: -200, width: 40 },
            { x: 260, y: 0, z: -160, width: 40 },
            { x: 300, y: 0, z: -100, width: 40 },
            
            // 氷の湖エリア（非常に広い）
            { x: 320, y: 0, z: -20, width: 50 },
            { x: 320, y: 0, z: 60, width: 50 },
            { x: 300, y: 0, z: 140, width: 50 },
            
            // シケイン（緩やかなS字）
            { x: 240, y: 0, z: 180, width: 38 },
            { x: 180, y: 0, z: 160, width: 38 },
            { x: 140, y: 0, z: 200, width: 38 },
            { x: 80, y: 0, z: 220, width: 38 },
            
            // ペンギンゾーン（広い通路）
            { x: 0, y: 0, z: 240, width: 35 },
            { x: -80, y: 0, z: 260, width: 35 },
            { x: -160, y: 0, z: 260, width: 35 },
            
            // 雪崩エリア
            { x: -220, y: 0, z: 240, width: 38 },
            { x: -280, y: 0, z: 200, width: 38 },
            { x: -320, y: 0, z: 140, width: 38 },
            
            // 西側大回り
            { x: -340, y: 0, z: 60, width: 40 },
            { x: -340, y: 0, z: -20, width: 40 },
            { x: -320, y: 0, z: -100, width: 40 },
            
            // 雪だるまゾーン
            { x: -280, y: 0, z: -160, width: 38 },
            { x: -220, y: 0, z: -200, width: 38 },
            
            // 最終コーナー（氷の上を滑る）
            { x: -160, y: 0, z: -220, width: 42 },
        ];
    }
    
    // === BOWSER CASTLE (城コース) - 溶岩と直角カーブの迷宮 ===
    generateCastleWaypoints() {
        return [
            // 城門（スタート）
            { x: -80, y: 0, z: -200, width: 38 },
            { x: 0, y: 0, z: -200, width: 38 },
            { x: 80, y: 0, z: -200, width: 38 },
            
            // 第1直角カーブ（右90度）
            { x: 140, y: 0, z: -200, width: 34 },
            { x: 180, y: 0, z: -180, width: 34 },
            { x: 180, y: 0, z: -140, width: 34 },
            { x: 180, y: 0, z: -100, width: 34 },
            
            // 溶岩エリア1
            { x: 180, y: 0, z: -40, width: 32 },
            { x: 180, y: 0, z: 20, width: 32 },
            
            // 第2直角カーブ（左90度）
            { x: 180, y: 0, z: 80, width: 34 },
            { x: 160, y: 0, z: 120, width: 34 },
            { x: 100, y: 0, z: 120, width: 34 },
            
            // ドッスンゾーン
            { x: 40, y: 0, z: 120, width: 34 },
            { x: -40, y: 0, z: 120, width: 34 },
            { x: -100, y: 0, z: 120, width: 34 },
            
            // 第3直角カーブ（右90度）
            { x: -160, y: 0, z: 120, width: 34 },
            { x: -200, y: 0, z: 100, width: 34 },
            { x: -200, y: 0, z: 40, width: 34 },
            
            // ジグザグ通路
            { x: -200, y: 0, z: -20, width: 34 },
            { x: -160, y: 0, z: -60, width: 34 },
            { x: -200, y: 0, z: -100, width: 34 },
            
            // 第4直角カーブ（左90度）
            { x: -200, y: 0, z: -140, width: 34 },
            { x: -180, y: 0, z: -180, width: 34 },
            { x: -140, y: 0, z: -200, width: 36 },
        ];
    }
    
    buildTrack() {
        // Generate smooth track path using splines
        const trackPoints = [];
        const resolution = 20; // Points between each waypoint
        
        for (let i = 0; i < this.waypoints.length; i++) {
            for (let t = 0; t < resolution; t++) {
                const point = Utils.getSplinePoint(this.waypoints, (i + t / resolution) / this.waypoints.length);
                trackPoints.push(point);
            }
        }
        
        // Store track points for AI and minimap
        this.trackPoints = trackPoints;
        
        // Calculate track length
        for (let i = 1; i < trackPoints.length; i++) {
            this.trackLength += Utils.distance2D(
                trackPoints[i-1].x, trackPoints[i-1].z,
                trackPoints[i].x, trackPoints[i].z
            );
        }
        
        // Create track surface
        this.createTrackSurface(trackPoints);
        
        // Create boundaries
        this.createBoundaries(trackPoints);
        
        // Create checkpoints
        this.createCheckpoints(trackPoints);
        
        // Create finish line
        this.createFinishLine();
    }
    
    createTrackSurface(points) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const uvs = [];
        const colors = [];
        
        let totalDist = 0;
        
        // コースタイプ別の色を決定
        const surfaceType = this.getSurfaceType();
        let trackColor;
        if (surfaceType === 'ice') {
            trackColor = { r: 0.7, g: 0.85, b: 0.95 }; // 氷の青白
        } else if (surfaceType === 'cobblestone') {
            trackColor = { r: 0.35, g: 0.35, b: 0.35 }; // 石畳のダークグレー
        } else {
            trackColor = { r: 0.72, g: 0.55, b: 0.3 }; // 土のダートブラウン
        }
        
        for (let i = 0; i < points.length; i++) {
            const curr = points[i];
            const next = points[(i + 1) % points.length];
            
            // Calculate direction
            const dx = next.x - curr.x;
            const dz = next.z - curr.z;
            const len = Math.sqrt(dx * dx + dz * dz);
            
            // Perpendicular direction for width
            const perpX = -dz / len;
            const perpZ = dx / len;
            
            const width = (curr.width || this.trackWidth) / 2;
            const nextWidth = (next.width || this.trackWidth) / 2;
            
            // Inner and outer points
            const innerX = curr.x + perpX * width;
            const innerZ = curr.z + perpZ * width;
            const outerX = curr.x - perpX * width;
            const outerZ = curr.z - perpZ * width;
            
            // Store boundaries
            this.innerBoundary.push({ x: innerX, z: innerZ, y: curr.y || 0 });
            this.outerBoundary.push({ x: outerX, z: outerZ, y: curr.y || 0 });
            
            if (i < points.length) {
                const nextInnerX = next.x + perpX * nextWidth;
                const nextInnerZ = next.z + perpZ * nextWidth;
                const nextOuterX = next.x - perpX * nextWidth;
                const nextOuterZ = next.z - perpZ * nextWidth;
                
                // Triangle 1 - コースを芝より上に
                const trackHeight = 0.25;
                vertices.push(innerX, (curr.y || 0) + trackHeight, innerZ);
                vertices.push(outerX, (curr.y || 0) + trackHeight, outerZ);
                vertices.push(nextInnerX, (next.y || 0) + trackHeight, nextInnerZ);
                
                // Triangle 2
                vertices.push(outerX, (curr.y || 0) + trackHeight, outerZ);
                vertices.push(nextOuterX, (next.y || 0) + trackHeight, nextOuterZ);
                vertices.push(nextInnerX, (next.y || 0) + trackHeight, nextInnerZ);
                
                // 頂点カラー（微妙な変化を加える）
                for (let v = 0; v < 6; v++) {
                    const variation = 0.95 + Math.random() * 0.1;
                    colors.push(
                        trackColor.r * variation,
                        trackColor.g * variation,
                        trackColor.b * variation
                    );
                }
                
                // UVs for road texture pattern
                const u = totalDist / 20;
                uvs.push(0, u, 1, u, 0, u + len/20);
                uvs.push(1, u, 1, u + len/20, 0, u + len/20);
                
                totalDist += len;
            }
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.computeVertexNormals();
        
        // コースタイプ別にマテリアルを作成
        let material;
        
        if (surfaceType === 'ice') {
            // 雪コース：氷の青白い表面（不透明で球体メッシュが見えないようにする）
            material = new THREE.MeshBasicMaterial({
                vertexColors: true,
                side: THREE.DoubleSide,
            });
        } else if (surfaceType === 'cobblestone') {
            // 城コース：暗い石畳（現状維持）
            material = new THREE.MeshBasicMaterial({
                vertexColors: true,
                side: THREE.DoubleSide,
            });
        } else {
            // 草原コース：茶色のダート
            material = new THREE.MeshBasicMaterial({
                vertexColors: true,
                side: THREE.DoubleSide,
            });
        }
        
        material.depthTest = true;
        material.depthWrite = true;
        material.polygonOffset = true;
        material.polygonOffsetFactor = -4;
        material.polygonOffsetUnits = -4;
        
        const trackMesh = new THREE.Mesh(geometry, material);
        trackMesh.receiveShadow = true;
        trackMesh.renderOrder = 5;
        this.trackGroup.add(trackMesh);
        
        // Add road markings
        this.addRoadMarkings(points);
    }
    
    // コースタイプからサーフェスタイプを取得
    getSurfaceType() {
        if (this.courseType === 'snow') {
            return 'ice';
        } else if (this.courseType === 'castle') {
            return 'cobblestone';
        } else {
            return 'dirt';  // grassland default
        }
    }
    
    // 土テクスチャ生成（テクスチャのみ）
    createDirtTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // ベース色（茶色の土）
        ctx.fillStyle = '#C8A070';
        ctx.fillRect(0, 0, 256, 256);
        
        // 土の粒子
        for (let i = 0; i < 600; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 3 + 1;
            const shade = Math.floor(Math.random() * 50) - 25;
            ctx.fillStyle = `rgb(${200 + shade}, ${160 + shade}, ${112 + shade})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 小石
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 4 + 2;
            ctx.fillStyle = `rgba(${130 + Math.random() * 40}, ${110 + Math.random() * 30}, ${90 + Math.random() * 20}, 0.6)`;
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // タイヤ跡
        ctx.strokeStyle = 'rgba(100, 80, 60, 0.25)';
        ctx.lineWidth = 4;
        for (let i = 0; i < 3; i++) {
            const y = Math.random() * 256;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(64, y + Math.random() * 15 - 7, 192, y + Math.random() * 15 - 7, 256, y);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(8, 8);
        return texture;
    }
    
    // 氷テクスチャ生成
    createIceTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // ベース色（青白い氷）
        const gradient = ctx.createLinearGradient(0, 0, 256, 256);
        gradient.addColorStop(0, '#C8E0F0');
        gradient.addColorStop(0.5, '#B0D4E8');
        gradient.addColorStop(1, '#98C8E0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        // ひび割れパターン
        ctx.strokeStyle = 'rgba(180, 210, 230, 0.6)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 12; i++) {
            const startX = Math.random() * 256;
            const startY = Math.random() * 256;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            let x = startX, y = startY;
            for (let j = 0; j < 4; j++) {
                x += Math.random() * 40 - 20;
                y += Math.random() * 40 - 20;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        
        // 光の反射スポット
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = Math.random() * 12 + 5;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(x - size, y - size, size * 2, size * 2);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(6, 6);
        return texture;
    }
    
    // 石畳テクスチャ生成
    createCobblestoneTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#444444';
        ctx.fillRect(0, 0, 256, 256);
        
        const stoneSize = 32;
        const stoneColors = ['#505050', '#585858', '#484848', '#525252', '#555555'];
        
        for (let row = 0; row < 8; row++) {
            const offset = (row % 2) * (stoneSize / 2);
            for (let col = -1; col < 9; col++) {
                const x = col * stoneSize + offset;
                const y = row * stoneSize;
                const padding = 2;
                
                ctx.fillStyle = stoneColors[Math.floor(Math.random() * stoneColors.length)];
                ctx.fillRect(x + padding, y + padding, stoneSize - padding * 2, stoneSize - padding * 2);
                
                // ハイライト
                ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
                ctx.fillRect(x + padding, y + padding, stoneSize - padding * 2, 2);
                
                // 影
                ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                ctx.fillRect(x + padding, y + stoneSize - padding - 2, stoneSize - padding * 2, 2);
            }
        }
        
        // 目地
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 2;
        for (let row = 0; row <= 8; row++) {
            ctx.beginPath();
            ctx.moveTo(0, row * stoneSize);
            ctx.lineTo(256, row * stoneSize);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
        return texture;
    }
    
    addRoadMarkings(points) {
        // Center dashed line
        const dashGeometry = new THREE.PlaneGeometry(0.5, 3);
        const dashMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        for (let i = 0; i < points.length; i += 8) {
            const curr = points[i];
            const next = points[(i + 1) % points.length];
            
            const angle = Math.atan2(next.z - curr.z, next.x - curr.x);
            
            const dash = new THREE.Mesh(dashGeometry, dashMaterial);
            dash.rotation.x = -Math.PI / 2;
            dash.rotation.z = -angle;
            dash.position.set(curr.x, (curr.y || 0) + 0.15, curr.z);
            this.trackGroup.add(dash);
        }
        
        // Edge stripes (red and white)
        this.addEdgeStripes(points);
    }
    
    addEdgeStripes(points) {
        // コース端の縁石を太くして視認性向上
        const stripeWidth = 2.5;  // 1 → 2.5に拡大
        
        for (let i = 0; i < points.length; i += 3) {  // 4 → 3に変更（より密に）
            const inner = this.innerBoundary[i];
            const outer = this.outerBoundary[i];
            
            if (!inner || !outer) continue;
            
            const isRed = Math.floor(i / 3) % 2 === 0;
            const color = isRed ? 0xff2200 : 0xffffff;  // より鮮やかな赤
            
            // Inner stripe（縁石）
            const innerGeom = new THREE.PlaneGeometry(stripeWidth, 3);
            const innerMat = new THREE.MeshBasicMaterial({ color });
            const innerStripe = new THREE.Mesh(innerGeom, innerMat);
            innerStripe.rotation.x = -Math.PI / 2;
            innerStripe.position.set(inner.x, (inner.y || 0) + 0.13, inner.z);
            this.trackGroup.add(innerStripe);
            
            // Outer stripe（縁石）
            const outerStripe = new THREE.Mesh(innerGeom.clone(), innerMat.clone());
            outerStripe.rotation.x = -Math.PI / 2;
            outerStripe.position.set(outer.x, (outer.y || 0) + 0.13, outer.z);
            this.trackGroup.add(outerStripe);
        }
        
        // コースの白いライン（連続した白線で境界を強調）
        this.addContinuousEdgeLine();
    }
    
    addContinuousEdgeLine() {
        // 内側と外側に連続した白線を追加
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
        
        // Inner line
        const innerPoints = [];
        for (let i = 0; i < this.innerBoundary.length; i += 2) {
            const p = this.innerBoundary[i];
            innerPoints.push(new THREE.Vector3(p.x, (p.y || 0) + 0.14, p.z));
        }
        const innerGeom = new THREE.BufferGeometry().setFromPoints(innerPoints);
        const innerLine = new THREE.Line(innerGeom, lineMaterial);
        this.trackGroup.add(innerLine);
        
        // Outer line
        const outerPoints = [];
        for (let i = 0; i < this.outerBoundary.length; i += 2) {
            const p = this.outerBoundary[i];
            outerPoints.push(new THREE.Vector3(p.x, (p.y || 0) + 0.14, p.z));
        }
        const outerGeom = new THREE.BufferGeometry().setFromPoints(outerPoints);
        const outerLine = new THREE.Line(outerGeom, lineMaterial);
        this.trackGroup.add(outerLine);
    }
    
    createBoundaries(points) {
        // 見えない壁は追加しない（柵のみで境界を表現）
        // タイヤバリアは急カーブのみに配置
        this.addTireBarriers();
    }
    
    addTireBarriers() {
        const tireGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.6, 8);
        const tireMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const redMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
        
        // Place tire barriers at sharp corners
        const cornerIndices = [15, 30, 45, 75, 100, 130, 160, 200, 240, 280];
        
        cornerIndices.forEach((idx, ci) => {
            if (idx >= this.outerBoundary.length) return;
            
            for (let j = -3; j <= 3; j++) {
                const i = (idx + j + this.outerBoundary.length) % this.outerBoundary.length;
                const point = this.outerBoundary[i];
                if (!point) continue;
                
                const tire = new THREE.Mesh(tireGeometry, j % 3 === 0 ? redMaterial : tireMaterial);
                tire.rotation.x = Math.PI / 2;
                tire.position.set(point.x, (point.y || 0) + 0.3, point.z);
                tire.castShadow = true;
                this.trackGroup.add(tire);
            }
        });
    }
    
    createCheckpoints(points) {
        // Create checkpoints at regular intervals
        const numCheckpoints = 8;
        const interval = Math.floor(points.length / numCheckpoints);
        
        for (let i = 0; i < numCheckpoints; i++) {
            const idx = i * interval;
            const point = points[idx];
            const nextPoint = points[(idx + 1) % points.length];
            
            const angle = Math.atan2(nextPoint.z - point.z, nextPoint.x - point.x);
            
            this.checkpoints.push({
                index: i,
                position: { x: point.x, y: point.y || 0, z: point.z },
                angle: angle,
                width: this.trackWidth
            });
        }
    }
    
    createFinishLine() {
        // フィニッシュライン - コースを横断するように配置（Z軸方向に長く）
        // コースはX軸方向（東向き）に進むので、ラインはZ軸方向に伸びる
        const finishGeometry = new THREE.PlaneGeometry(8, this.trackWidth + 4);
        const finishZ = this.waypoints[0]?.z ?? -160;
        
        // チェッカーパターン
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        const squareSize = 16;
        for (let x = 0; x < canvas.width; x += squareSize) {
            for (let y = 0; y < canvas.height; y += squareSize) {
                ctx.fillStyle = ((x + y) / squareSize) % 2 === 0 ? '#ffffff' : '#000000';
                ctx.fillRect(x, y, squareSize, squareSize);
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        
        const finishMaterial = new THREE.MeshBasicMaterial({ map: texture });
        
        const finishLine = new THREE.Mesh(finishGeometry, finishMaterial);
        finishLine.rotation.x = -Math.PI / 2;
        // スタート地点（コース上）に配置 - ゴールゲートの真下
        finishLine.position.set(0, 0.55, finishZ);
        this.trackGroup.add(finishLine);
        
        // ゴールゲート
        this.createFinishGate(finishZ);
        
        this.finishLine = {
            position: { x: 0, y: 0, z: finishZ },
            width: this.trackWidth,
            direction: 'x'  // X軸方向に走行
        };
    }
    
    createFinishGate(finishZ) {
        // マリオカート風ゴールゲート - より派手なデザイン
        const gateWidth = this.trackWidth / 2 + 3;
        const gateZ = finishZ;  // フィニッシュラインと同じZ位置（コース上）
        
        // === 柱（青と黄色のストライプ）===
        const pillarGeometry = new THREE.CylinderGeometry(1.2, 1.2, 14, 16);
        
        // ストライプパターンを作成
        const stripeCanvas = document.createElement('canvas');
        stripeCanvas.width = 64;
        stripeCanvas.height = 256;
        const stripeCtx = stripeCanvas.getContext('2d');
        for (let i = 0; i < 16; i++) {
            stripeCtx.fillStyle = i % 2 === 0 ? '#0047AB' : '#FFDD00';
            stripeCtx.fillRect(0, i * 16, 64, 16);
        }
        const stripeTexture = new THREE.CanvasTexture(stripeCanvas);
        stripeTexture.wrapS = THREE.RepeatWrapping;
        stripeTexture.wrapT = THREE.RepeatWrapping;
        
        const pillarMaterial = new THREE.MeshStandardMaterial({ 
            map: stripeTexture,
            roughness: 0.5
        });
        
        // 南側の柱
        const southPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        southPillar.position.set(0, 7, gateZ - gateWidth);
        southPillar.castShadow = true;
        this.trackGroup.add(southPillar);
        
        // 北側の柱
        const northPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        northPillar.position.set(0, 7, gateZ + gateWidth);
        northPillar.castShadow = true;
        this.trackGroup.add(northPillar);
        
        // === 上部バナー（赤いアーチ）===
        const bannerGeometry = new THREE.BoxGeometry(2, 3, gateWidth * 2 + 2);
        const bannerMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xEE1C25,
            emissive: 0x440000,
            emissiveIntensity: 0.2
        });
        const banner = new THREE.Mesh(bannerGeometry, bannerMaterial);
        banner.position.set(0, 13, gateZ);
        banner.castShadow = true;
        this.trackGroup.add(banner);
        
        // 黄色の縁取り
        const borderGeo = new THREE.BoxGeometry(2.2, 0.3, gateWidth * 2 + 2.2);
        const borderMat = new THREE.MeshStandardMaterial({ color: 0xFFDD00 });
        const topBorder = new THREE.Mesh(borderGeo, borderMat);
        topBorder.position.set(0, 14.6, gateZ);
        this.trackGroup.add(topBorder);
        const bottomBorder = new THREE.Mesh(borderGeo, borderMat);
        bottomBorder.position.set(0, 11.4, gateZ);
        this.trackGroup.add(bottomBorder);
        
        // === GOAL text ===
        const textCanvas = document.createElement('canvas');
        textCanvas.width = 512;
        textCanvas.height = 128;
        const textCtx = textCanvas.getContext('2d');
        textCtx.fillStyle = '#FFDD00';
        textCtx.font = 'bold 100px Arial';
        textCtx.textAlign = 'center';
        textCtx.strokeStyle = '#000';
        textCtx.lineWidth = 8;
        textCtx.strokeText('GOAL', 256, 95);
        textCtx.fillText('GOAL', 256, 95);
        
        const textTexture = new THREE.CanvasTexture(textCanvas);
        const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true, side: THREE.DoubleSide });
        
        const textGeometry = new THREE.PlaneGeometry(14, 3.5);
        
        // 西向き（スタートから見える面：進行方向から正しく読めるように）
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-1.2, 13, gateZ);
        textMesh.rotation.y = -Math.PI / 2;
        this.trackGroup.add(textMesh);
        
        // 東向き（ゴールを通過した後に見える面）
        const textMesh2 = new THREE.Mesh(textGeometry, textMaterial);
        textMesh2.position.set(1.2, 13, gateZ);
        textMesh2.rotation.y = Math.PI / 2;
        this.trackGroup.add(textMesh2);
        
        // === 装飾旗 ===
        const flagColors = [0xEE1C25, 0xFFDD00, 0x00B800, 0x0047AB];
        const flagGeo = new THREE.PlaneGeometry(1.5, 2);
        
        for (let i = 0; i < 8; i++) {
            const flagMat = new THREE.MeshBasicMaterial({ 
                color: flagColors[i % 4],
                side: THREE.DoubleSide
            });
            const flag = new THREE.Mesh(flagGeo, flagMat);
            const t = i / 7;
            flag.position.set(0, 15.5, gateZ - gateWidth + t * gateWidth * 2);
            flag.rotation.x = Math.PI / 6;
            this.trackGroup.add(flag);
        }
    }
    
    addBoostPads() {
        // 新コースに合わせたブーストパッド位置
        const boostLocations = [
            { x: 0, y: 0, z: 50, angle: 0 },             // ホームストレート
            { x: -80, y: 0, z: 185, angle: Math.PI },   // 第1コーナー後
            { x: -165, y: 2, z: 90, angle: -Math.PI/2 }, // バックストレート
            { x: -80, y: 0, z: -15, angle: 0 }           // 第2コーナー後
        ];
        
        boostLocations.forEach(loc => {
            this.createBoostPad(loc.x, loc.y, loc.z, loc.angle);
        });
    }
    
    createBoostPad(x, y, z, angle) {
        const geometry = new THREE.PlaneGeometry(8, 4);
        
        // Create boost pad texture
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Arrows
        ctx.fillStyle = '#ffff00';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(20 + i * 35, 52);
            ctx.lineTo(40 + i * 35, 32);
            ctx.lineTo(20 + i * 35, 12);
            ctx.lineTo(30 + i * 35, 32);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true,
            opacity: 0.9
        });
        
        const boostPad = new THREE.Mesh(geometry, material);
        boostPad.rotation.x = -Math.PI / 2;
        boostPad.rotation.z = -angle;
        boostPad.position.set(x, y + 0.15, z);
        
        boostPad.userData.isBoostPad = true;
        boostPad.userData.boostStrength = 1.5;
        
        this.trackGroup.add(boostPad);
        this.boostPads.push({
            mesh: boostPad,
            position: { x, y, z },
            radius: 4,
            strength: 1.5
        });
    }
    
    addItemBoxes() {
        const courseType = window.gameSettings?.courseType || 'grassland';
        let itemLocations = [];
        
        switch(courseType) {
            case 'snow':
                // フラッペスノーランド - 広いエリアに配置
                itemLocations = [
                    { x: 60, y: 2, z: -220 },
                    { x: 280, y: 2, z: -140 },
                    { x: 320, y: 2, z: 20 },
                    { x: 260, y: 2, z: 180 },
                    { x: 80, y: 2, z: 220 },
                    { x: -80, y: 2, z: 260 },
                    { x: -280, y: 2, z: 200 },
                    { x: -340, y: 2, z: 20 },
                    { x: -220, y: 2, z: -200 },
                ];
                break;
            case 'castle':
                // クッパ城 - コース中央に配置
                itemLocations = [
                    { x: 0, y: 2, z: -200 },
                    { x: 180, y: 2, z: -120 },
                    { x: 180, y: 2, z: 50 },
                    { x: 100, y: 2, z: 120 },
                    { x: -40, y: 2, z: 120 },
                    { x: -200, y: 2, z: 70 },
                    { x: -180, y: 2, z: -80 },
                    { x: -140, y: 2, z: -200 },
                ];
                break;
            default:
                // マリオサーキット - コース上に配置
                itemLocations = [
                    { x: 0, y: 2, z: -160 },      // スタート直線
                    { x: 200, y: 2, z: -140 },     // 東カーブ入口
                    { x: 240, y: 2, z: 0 },        // 東カーブ中央
                    { x: 200, y: 2, z: 140 },      // 東カーブ出口
                    { x: 60, y: 2, z: 200 },       // 北側ストレート
                    { x: -100, y: 2, z: 200 },     // 北側西寄り
                    { x: -230, y: 2, z: 120 },     // 西カーブ上部
                    { x: -240, y: 2, z: -40 },     // 西カーブ下部
                    { x: -100, y: 2, z: -160 },    // ゴール手前
                ];
                break;
        }
        
        itemLocations.forEach((loc, index) => {
            this.createItemBox(loc.x, loc.y, loc.z, index);
        });
    }
    
    createItemBox(x, y, z, index) {
        const group = new THREE.Group();
        
        // === マリオカート64風の「?」ブロック ===
        const boxSize = 3.8;
        const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
        
        // 「?」マーク付きテクスチャを各面に作成
        const createQuestionTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            // 背景（鮮やかな黄色〜オレンジのグラデーション）
            const gradient = ctx.createLinearGradient(0, 0, 0, 256);
            gradient.addColorStop(0, '#FFE135');
            gradient.addColorStop(0.3, '#FFD000');
            gradient.addColorStop(0.7, '#FFA500');
            gradient.addColorStop(1, '#FF8C00');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 256, 256);
            
            // 立体感のある内側（ハイライト）
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(12, 12, 116, 116);
            
            // 影（右下）
            ctx.fillStyle = 'rgba(139, 69, 19, 0.5)';
            ctx.fillRect(128, 128, 116, 116);
            
            // 中間影
            ctx.fillStyle = 'rgba(180, 100, 20, 0.3)';
            ctx.fillRect(128, 12, 116, 116);
            ctx.fillRect(12, 128, 116, 116);
            
            // 枠線（濃い茶色）
            ctx.strokeStyle = '#5C3317';
            ctx.lineWidth = 8;
            ctx.strokeRect(4, 4, 248, 248);
            
            // ボルト装飾（四隅・金属風）
            const boltPositions = [[24, 24], [232, 24], [24, 232], [232, 232]];
            boltPositions.forEach(([px, py]) => {
                // 外側リング
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.arc(px, py, 16, 0, Math.PI * 2);
                ctx.fill();
                
                // 内側（金属光沢）
                const boltGrad = ctx.createRadialGradient(px - 3, py - 3, 0, px, py, 12);
                boltGrad.addColorStop(0, '#FFD700');
                boltGrad.addColorStop(0.5, '#DAA520');
                boltGrad.addColorStop(1, '#8B4513');
                ctx.fillStyle = boltGrad;
                ctx.beginPath();
                ctx.arc(px, py, 12, 0, Math.PI * 2);
                ctx.fill();
                
                // ボルトの十字溝
                ctx.strokeStyle = '#5C3317';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(px - 6, py);
                ctx.lineTo(px + 6, py);
                ctx.moveTo(px, py - 6);
                ctx.lineTo(px, py + 6);
                ctx.stroke();
            });
            
            // 「?」マーク - 大きく太く
            ctx.font = 'bold 140px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 影（立体感）
            ctx.fillStyle = '#5C3317';
            ctx.fillText('?', 134, 138);
            
            // 本体（白）
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText('?', 128, 132);
            
            // 輪郭（黒）
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 5;
            ctx.strokeText('?', 128, 132);
            
            // 光沢ハイライト
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = 'bold 100px Arial';
            ctx.fillText('?', 118, 120);
            
            return new THREE.CanvasTexture(canvas);
        };
        
        // 6面すべてに「?」テクスチャ
        const materials = [];
        for (let i = 0; i < 6; i++) {
            materials.push(new THREE.MeshStandardMaterial({
                map: createQuestionTexture(),
                emissive: 0xFFAA00,
                emissiveIntensity: 0.35,
                roughness: 0.25,
                metalness: 0.15
            }));
        }
        
        const box = new THREE.Mesh(boxGeometry, materials);
        box.castShadow = true;
        group.add(box);
        
        // 茶色の枠線（エッジ）- より太く
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x5C3317, linewidth: 4 });
        const edgeSize = boxSize + 0.2;
        const edgeGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(edgeSize, edgeSize, edgeSize));
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        group.add(edges);
        
        // 内側の光るコア（depthWriteをfalseにして外部から見えないように）
        const coreGeo = new THREE.SphereGeometry(boxSize * 0.35, 12, 12);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0xFFFF00,
            transparent: true,
            opacity: 0.4,
            depthWrite: false
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.renderOrder = -1;
        group.add(core);
        
        group.position.set(x, y + 1.5, z);
        group.userData.isItemBox = true;
        group.userData.active = true;
        group.userData.respawnTime = 0;
        group.userData.index = index;
        group.userData.rotationSpeed = 0.025 + Math.random() * 0.01;
        group.userData.floatOffset = Math.random() * Math.PI * 2;
        
        this.trackGroup.add(group);
        this.itemBoxes.push({
            mesh: group,
            position: { x, y: y + 1.5, z },
            radius: 2.8,
            active: true,
            respawnTime: 0
        });
    }
    
    addEnvironment() {
        // コースタイプを取得（デフォルトは草原）
        const courseType = window.gameSettings?.courseType || 'grassland';
        
        // コースタイプ別の環境を構築
        switch(courseType) {
            case 'snow':
                this.addSnowEnvironment();
                break;
            case 'castle':
                this.addCastleEnvironment();
                break;
            case 'grassland':
            default:
                this.addGrasslandEnvironment();
                break;
        }
        
        // マリオカート風の装飾を追加（共通）
        this.addMarioKartDecorations();
        
        // カーブ部分の柵（ショートカット防止）
        this.addCornerFences();
        
        // コース境界のバリア
        this.addTrackBarriers();
        
        // Clouds
        this.addClouds();
        
        // Skybox effect
        this.createSky();
    }
    
    // === 草原コースの環境 ===
    addGrasslandEnvironment() {
        // Ground plane (textured grass)
        this.createDetailedGround();
        
        // 芝生と花畑
        this.addGrassAndFlowers();
        
        // 木と茂み
        this.addTreesAndBushes();
        
        // Palm trees
        this.addPalmTrees();
        
        // Grandstands and buildings
        this.addGrandstands();
        
        // Mountains in background
        this.addBackgroundMountains();
        
        // コース外側の装飾（山・岩）
        this.addSceneryMountains();
        
        // 木製フェンス（草原コース用）
        this.addGrasslandFences();
    }
    
    // === 雪コースの環境 ===
    addSnowEnvironment() {
        // 雪の地面
        this.createSnowGround();
        
        // 雪山（大きな背景）
        this.addSnowMountains();
        
        // 雪だるま（マリオ風）
        this.addSnowmen();
        
        // 氷の結晶・つらら
        this.addIceDecorations();
        
        // 雪が積もった針葉樹
        this.addSnowTrees();
        
        // コース両側の雪の壁（スノーバンク）
        this.addSnowBanks();
        
        // 凍った池
        this.addFrozenPonds();
        
        // 雪の結晶エフェクト用の装飾
        this.addSnowDecorations();
        
        // 吹雪エフェクト
        this.createBlizzardEffect();
    }
    
    createBlizzardEffect() {
        // 吹雪のパーティクルシステム（軽量化）
        const blizzardGroup = new THREE.Group();
        blizzardGroup.name = 'blizzard';
        
        // 雪の粒子（数を削減）
        const particleCount = 1500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        
        const areaSize = 600;
        const heightRange = 100;
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * areaSize;
            positions[i3 + 1] = Math.random() * heightRange;
            positions[i3 + 2] = (Math.random() - 0.5) * areaSize;
            
            // 風に吹かれる速度（斜め横方向）
            velocities[i3] = 0.5 + Math.random() * 1;      // X方向（風）
            velocities[i3 + 1] = -0.3 - Math.random() * 0.3; // 下落
            velocities[i3 + 2] = 0.2 + Math.random() * 0.4;  // Z方向
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.userData.velocities = velocities;
        
        const material = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 1.5,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
        });
        
        const particles = new THREE.Points(geometry, material);
        particles.userData.velocities = velocities;
        particles.userData.areaSize = areaSize;
        particles.userData.heightRange = heightRange;
        blizzardGroup.add(particles);
        
        // 吹雪の霧効果
        const fogMaterial = new THREE.MeshBasicMaterial({
            color: 0xDDE8F0,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
        });
        
        // 遠くに霧の壁を配置
        for (let i = 0; i < 4; i++) {
            const fogGeo = new THREE.PlaneGeometry(800, 120);
            const fog = new THREE.Mesh(fogGeo, fogMaterial);
            fog.position.y = 40;
            fog.rotation.y = (i / 4) * Math.PI * 2;
            fog.position.x = Math.cos(fog.rotation.y) * 350;
            fog.position.z = Math.sin(fog.rotation.y) * 350;
            fog.lookAt(0, 40, 0);
            blizzardGroup.add(fog);
        }
        
        this.trackGroup.add(blizzardGroup);
        this.blizzardParticles = particles;
    }
    
    updateBlizzard(deltaTime) {
        if (!this.blizzardParticles) return;
        
        const positions = this.blizzardParticles.geometry.attributes.position.array;
        const velocities = this.blizzardParticles.userData.velocities;
        const areaSize = this.blizzardParticles.userData.areaSize;
        const heightRange = this.blizzardParticles.userData.heightRange;
        
        const dt = deltaTime * 60; // 60FPSベース
        
        for (let i = 0; i < positions.length / 3; i++) {
            const i3 = i * 3;
            
            positions[i3] += velocities[i3] * dt;
            positions[i3 + 1] += velocities[i3 + 1] * dt;
            positions[i3 + 2] += velocities[i3 + 2] * dt;
            
            // 範囲外に出たらリセット
            if (positions[i3] > areaSize / 2) {
                positions[i3] = -areaSize / 2;
            }
            if (positions[i3 + 2] > areaSize / 2) {
                positions[i3 + 2] = -areaSize / 2;
            }
            if (positions[i3 + 1] < 0) {
                positions[i3 + 1] = heightRange;
                positions[i3] = (Math.random() - 0.5) * areaSize;
                positions[i3 + 2] = (Math.random() - 0.5) * areaSize;
            }
        }
        
        this.blizzardParticles.geometry.attributes.position.needsUpdate = true;
    }
    
    // === 城コースの環境（溶岩の上を走る石畳） ===
    addCastleEnvironment() {
        // 溶岩の海（地面全体）
        this.createLavaOcean();
        
        // 石畳のコース（溶岩の上に浮く）
        this.createCastleStonePath();
        
        // 城内部の壁と柱
        this.addCastleInteriorWalls();
        
        // 松明
        this.addTorches();
        
        // コース両側の低い石壁
        this.addCastleTrackWalls();
        
        // クッパ像
        this.addBowserStatues();
        
        // 城内部の背景
        this.addCastleInteriorBackground();
    }
    
    // 溶岩の海
    createLavaOcean() {
        const lavaGeo = new THREE.PlaneGeometry(800, 800, 50, 50);
        
        // 赤い煮えたぎる溶岩マテリアル
        const lavaMat = new THREE.MeshStandardMaterial({
            color: 0xCC0000,
            emissive: 0xAA0000,
            emissiveIntensity: 1.2,
            roughness: 0.2
        });
        
        const lava = new THREE.Mesh(lavaGeo, lavaMat);
        lava.rotation.x = -Math.PI / 2;
        lava.position.y = -5;  // コースより下
        lava.userData.isLava = true;
        this.trackGroup.add(lava);
        this.lavaOcean = lava;
        this.hasLava = true;  // 溶岩があることを記録
        
        // 溶岩の泡（赤色に変更）
        this.lavaBubbles = [];
        for (let i = 0; i < 50; i++) {
            const bubbleGeo = new THREE.SphereGeometry(1.5 + Math.random() * 3, 12, 12);
            const bubbleMat = new THREE.MeshBasicMaterial({
                color: Math.random() > 0.5 ? 0xFF3300 : 0xFFAA00,
                transparent: true,
                opacity: 0.8
            });
            const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
            bubble.position.set(
                (Math.random() - 0.5) * 600,
                -4 + Math.random() * 2,
                (Math.random() - 0.5) * 600
            );
            bubble.userData.isBubble = true;
            bubble.userData.baseY = bubble.position.y;
            bubble.userData.phase = Math.random() * Math.PI * 2;
            this.lavaBubbles.push(bubble);
            this.trackGroup.add(bubble);
        }
        
        // 溶岩の赤い光源
        const lavaLight1 = new THREE.PointLight(0xFF2200, 2, 300);
        lavaLight1.position.set(0, 10, 0);
        this.trackGroup.add(lavaLight1);
        
        const lavaLight2 = new THREE.PointLight(0xFF4400, 1.5, 250);
        lavaLight2.position.set(150, 5, 150);
        this.trackGroup.add(lavaLight2);
        
        const lavaLight3 = new THREE.PointLight(0xFF4400, 1.5, 250);
        lavaLight3.position.set(-150, 5, -150);
        this.trackGroup.add(lavaLight3);
    }
    
    // 石畳のコース（溶岩の上に浮く）
    createCastleStonePath() {
        // コースに沿って石畳を配置
        const stoneMat = new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            roughness: 0.9
        });
        
        const edgeMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.85
        });
        
        // コースポイントに沿って石畳プラットフォームを配置
        for (let i = 0; i < this.trackPoints.length; i++) {
            const point = this.trackPoints[i];
            const nextPoint = this.trackPoints[(i + 1) % this.trackPoints.length];
            
            const dx = nextPoint.x - point.x;
            const dz = nextPoint.z - point.z;
            const length = Math.sqrt(dx * dx + dz * dz) + 5;
            const angle = Math.atan2(dz, dx);
            const width = point.width || 25;
            
            // 石畳プラットフォーム
            const platformGeo = new THREE.BoxGeometry(length, 2, width);
            const platform = new THREE.Mesh(platformGeo, stoneMat);
            platform.position.set(
                (point.x + nextPoint.x) / 2,
                0,
                (point.z + nextPoint.z) / 2
            );
            platform.rotation.y = -angle;
            platform.receiveShadow = true;
            this.trackGroup.add(platform);
            
            // 石畳の模様
            const tileSize = 4;
            for (let tx = -length/2 + 2; tx < length/2 - 2; tx += tileSize) {
                for (let tz = -width/2 + 2; tz < width/2 - 2; tz += tileSize) {
                    const tileGeo = new THREE.BoxGeometry(tileSize - 0.3, 0.1, tileSize - 0.3);
                    const tileMat = new THREE.MeshStandardMaterial({
                        color: Math.random() > 0.5 ? 0x555555 : 0x3a3a3a,
                        roughness: 0.95
                    });
                    const tile = new THREE.Mesh(tileGeo, tileMat);
                    
                    // プラットフォームのローカル座標で配置
                    const localX = tx;
                    const localZ = tz;
                    const worldX = (point.x + nextPoint.x) / 2 + Math.cos(-angle) * localX - Math.sin(-angle) * localZ;
                    const worldZ = (point.z + nextPoint.z) / 2 + Math.sin(-angle) * localX + Math.cos(-angle) * localZ;
                    
                    tile.position.set(worldX, 1.05, worldZ);
                    tile.rotation.y = -angle + (Math.random() - 0.5) * 0.1;
                    this.trackGroup.add(tile);
                }
            }
        }
    }
    
    // 城内部の壁と柱
    addCastleInteriorWalls() {
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.85
        });
        
        const wallHeight = 60;
        const wallDistance = 300;
        
        // 四方を囲む壁
        const wallPositions = [
            { x: 0, z: -wallDistance, rotY: 0 },
            { x: 0, z: wallDistance, rotY: 0 },
            { x: -wallDistance, z: 0, rotY: Math.PI / 2 },
            { x: wallDistance, z: 0, rotY: Math.PI / 2 }
        ];
        
        wallPositions.forEach(pos => {
            const wallGeo = new THREE.BoxGeometry(wallDistance * 2, wallHeight, 10);
            const wall = new THREE.Mesh(wallGeo, wallMat);
            wall.position.set(pos.x, wallHeight / 2, pos.z);
            wall.rotation.y = pos.rotY;
            wall.userData.isCollidable = true;
            wall.userData.wallType = 'castle_wall';
            this.trackGroup.add(wall);
            this.collidableObjects.push(wall);
            
            // 壁の装飾（レンガ模様）
            for (let i = 0; i < 10; i++) {
                const pillarGeo = new THREE.BoxGeometry(8, wallHeight, 12);
                const pillarMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
                const pillar = new THREE.Mesh(pillarGeo, pillarMat);
                const offset = (i - 4.5) * 60;
                if (pos.rotY === 0) {
                    pillar.position.set(offset, wallHeight / 2, pos.z);
                } else {
                    pillar.position.set(pos.x, wallHeight / 2, offset);
                }
                pillar.rotation.y = pos.rotY;
                this.trackGroup.add(pillar);
            }
        });
        
        // 巨大な柱（城内部）
        const pillarPositions = [
            { x: -150, z: -150 }, { x: 150, z: -150 },
            { x: -150, z: 150 }, { x: 150, z: 150 },
            { x: 0, z: 0 },  // 中央
        ];
        
        pillarPositions.forEach(pos => {
            const pillarGeo = new THREE.CylinderGeometry(8, 10, wallHeight, 16);
            const pillarMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.7 });
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.set(pos.x, wallHeight / 2, pos.z);
            pillar.userData.isCollidable = true;
            pillar.userData.wallType = 'pillar';
            this.trackGroup.add(pillar);
            this.collidableObjects.push(pillar);
            
            // 柱の土台
            const baseGeo = new THREE.CylinderGeometry(12, 14, 5, 16);
            const base = new THREE.Mesh(baseGeo, pillarMat);
            base.position.set(pos.x, 2.5, pos.z);
            this.trackGroup.add(base);
        });
    }
    
    // クッパ像
    addBowserStatues() {
        const statuePositions = [
            { x: -80, z: -200, rotY: 0 },
            { x: 80, z: -200, rotY: 0 },
            { x: 180, z: 0, rotY: -Math.PI / 2 },
            { x: -200, z: 0, rotY: Math.PI / 2 },
        ];
        
        statuePositions.forEach(pos => {
            this.createBowserStatue(pos.x, pos.z, pos.rotY);
        });
    }
    
    createBowserStatue(x, z, rotY) {
        const group = new THREE.Group();
        const stoneMat = new THREE.MeshStandardMaterial({ 
            color: 0x555555, 
            roughness: 0.8,
            metalness: 0.2
        });
        
        // 台座
        const baseGeo = new THREE.BoxGeometry(8, 4, 8);
        const base = new THREE.Mesh(baseGeo, stoneMat);
        base.position.y = 2;
        group.add(base);
        
        // 胴体
        const bodyGeo = new THREE.SphereGeometry(4, 16, 16);
        const body = new THREE.Mesh(bodyGeo, stoneMat);
        body.position.y = 8;
        body.scale.set(1, 1.2, 0.9);
        group.add(body);
        
        // 頭
        const headGeo = new THREE.SphereGeometry(3, 16, 16);
        const head = new THREE.Mesh(headGeo, stoneMat);
        head.position.y = 14;
        group.add(head);
        
        // 角
        const hornGeo = new THREE.ConeGeometry(0.8, 3, 8);
        [-1.5, 1.5].forEach(xPos => {
            const horn = new THREE.Mesh(hornGeo, stoneMat);
            horn.position.set(xPos, 16, -1);
            horn.rotation.x = -0.3;
            group.add(horn);
        });
        
        // 甲羅のトゲ
        for (let i = 0; i < 5; i++) {
            const spikeGeo = new THREE.ConeGeometry(0.6, 2.5, 6);
            const spike = new THREE.Mesh(spikeGeo, stoneMat);
            spike.position.set(0, 10 + i * 1.5, -3);
            spike.rotation.x = Math.PI / 4;
            group.add(spike);
        }
        
        group.position.set(x, 0, z);
        group.rotation.y = rotY;
        this.trackGroup.add(group);
        
        // 距離ベースの衝突判定（プレイヤー専用 - barrierシステム）
        if (!this.barriers) this.barriers = [];
        this.barriers.push({ x, z, radius: 7 });
    }
    
    // 城内部の背景
    addCastleInteriorBackground() {
        // 天井（暗い）
        const ceilingGeo = new THREE.PlaneGeometry(600, 600);
        const ceilingMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 1
        });
        const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 80;
        this.trackGroup.add(ceiling);
        
        // 鎖
        for (let i = 0; i < 15; i++) {
            this.createHangingChain(
                (Math.random() - 0.5) * 400,
                (Math.random() - 0.5) * 400
            );
        }
    }
    
    createHangingChain(x, z) {
        const chainMat = new THREE.MeshStandardMaterial({ 
            color: 0x666666, 
            metalness: 0.7, 
            roughness: 0.3 
        });
        
        const chainLength = 30 + Math.random() * 20;
        for (let i = 0; i < chainLength / 3; i++) {
            const linkGeo = new THREE.TorusGeometry(0.5, 0.15, 8, 16);
            const link = new THREE.Mesh(linkGeo, chainMat);
            link.position.set(x, 80 - i * 3, z);
            link.rotation.x = i % 2 === 0 ? 0 : Math.PI / 2;
            this.trackGroup.add(link);
        }
    }
    
    // 草原コース用の木と茂み
    addTreesAndBushes() {
        // 落葉樹
        const treePositions = [
            { x: -280, z: -100 }, { x: -260, z: 50 },
            { x: 280, z: -80 }, { x: 260, z: 100 },
            { x: -150, z: 280 }, { x: 100, z: 260 },
            { x: -50, z: -300 }, { x: 150, z: -280 },
        ];
        
        treePositions.forEach(pos => {
            this.createTree(pos.x, pos.z);
        });
        
        // 茂み
        const bushPositions = [
            { x: -270, z: -50 }, { x: -240, z: 80 },
            { x: 270, z: -40 }, { x: 240, z: 120 },
            { x: -120, z: 260 }, { x: 80, z: 240 },
        ];
        
        bushPositions.forEach(pos => {
            this.createBush(pos.x, pos.z);
        });
    }
    
    createTree(x, z) {
        const group = new THREE.Group();
        
        // 幹
        const trunkGeo = new THREE.CylinderGeometry(1.5, 2, 15, 12);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 7.5;
        group.add(trunk);
        
        // 葉（複数の球体で構成）
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.8 });
        const leafPositions = [
            { y: 18, r: 8 },
            { y: 14, r: 6 },
            { y: 22, r: 5 },
        ];
        
        leafPositions.forEach(lp => {
            const leafGeo = new THREE.SphereGeometry(lp.r, 12, 12);
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.y = lp.y;
            leaf.position.x = (Math.random() - 0.5) * 3;
            leaf.position.z = (Math.random() - 0.5) * 3;
            group.add(leaf);
        });
        
        group.position.set(x, 0, z);
        this.trackGroup.add(group);
    }
    
    createBush(x, z) {
        const group = new THREE.Group();
        
        const bushMat = new THREE.MeshStandardMaterial({ color: 0x2E8B57, roughness: 0.8 });
        
        // 複数の球体で茂みを作成
        for (let i = 0; i < 5; i++) {
            const size = 2 + Math.random() * 2;
            const bushGeo = new THREE.SphereGeometry(size, 10, 10);
            const bush = new THREE.Mesh(bushGeo, bushMat);
            bush.position.set(
                (Math.random() - 0.5) * 4,
                size * 0.8,
                (Math.random() - 0.5) * 4
            );
            group.add(bush);
        }
        
        group.position.set(x, 0, z);
        this.trackGroup.add(group);
    }
    
    addGrassAndFlowers() {
        // 花畑
        const flowerColors = [0xFF69B4, 0xFFFF00, 0xFF4500, 0x9932CC, 0xFFFFFF];
        
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 280 + Math.random() * 100;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            
            this.createFlower(x, z, flowerColors[Math.floor(Math.random() * flowerColors.length)]);
        }
    }
    
    createFlower(x, z, color) {
        const group = new THREE.Group();
        
        // 茎
        const stemGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 6);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.75;
        group.add(stem);
        
        // 花びら
        const petalMat = new THREE.MeshStandardMaterial({ color: color });
        for (let i = 0; i < 5; i++) {
            const petalGeo = new THREE.SphereGeometry(0.3, 8, 8);
            const petal = new THREE.Mesh(petalGeo, petalMat);
            const angle = (i / 5) * Math.PI * 2;
            petal.position.set(
                Math.cos(angle) * 0.4,
                1.6,
                Math.sin(angle) * 0.4
            );
            petal.scale.set(1, 0.5, 1);
            group.add(petal);
        }
        
        // 中心
        const centerGeo = new THREE.SphereGeometry(0.2, 8, 8);
        const centerMat = new THREE.MeshStandardMaterial({ color: 0xFFFF00 });
        const center = new THREE.Mesh(centerGeo, centerMat);
        center.position.y = 1.6;
        group.add(center);
        
        group.position.set(x, 0, z);
        group.scale.set(2, 2, 2);
        this.trackGroup.add(group);
    }
    
    // === 雪コース用の環境関数 ===
    createSnowGround() {
        // 雪の地面
        const groundGeo = new THREE.PlaneGeometry(1000, 1000, 100, 100);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0xF0F8FF,
            roughness: 0.9
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        ground.receiveShadow = true;
        this.trackGroup.add(ground);
    }
    
    addSnowMountains() {
        // より大きくリアルな雪山
        const positions = [
            { x: -380, z: -280, h: 180, r: 100 },
            { x: 380, z: -200, h: 160, r: 90 },
            { x: -350, z: 280, h: 170, r: 95 },
            { x: 360, z: 250, h: 150, r: 85 },
            { x: 0, z: -380, h: 200, r: 110 },
            { x: 0, z: 380, h: 140, r: 80 },
        ];
        
        positions.forEach((pos, idx) => {
            const group = new THREE.Group();
            
            // 山本体（複数層でリアルに）
            const baseColor = 0x5a6a7a;  // 岩の色
            const baseMat = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.9 });
            
            // メインの山
            const mountainGeo = new THREE.ConeGeometry(pos.r, pos.h, 12);
            const mountain = new THREE.Mesh(mountainGeo, baseMat);
            mountain.position.y = pos.h / 2;
            group.add(mountain);
            
            // 山の起伏（周囲に小さな山）
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const subMountainGeo = new THREE.ConeGeometry(pos.r * 0.5, pos.h * 0.6, 8);
                const subMountain = new THREE.Mesh(subMountainGeo, baseMat);
                subMountain.position.set(
                    Math.cos(angle) * pos.r * 0.7,
                    pos.h * 0.25,
                    Math.sin(angle) * pos.r * 0.7
                );
                group.add(subMountain);
            }
            
            // 雪の層（複数段階）
            const snowMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.5 });
            
            // 頂上の雪
            const snowCapGeo = new THREE.ConeGeometry(pos.r * 0.45, pos.h * 0.35, 12);
            const snowCap = new THREE.Mesh(snowCapGeo, snowMat);
            snowCap.position.y = pos.h * 0.75;
            group.add(snowCap);
            
            // 中腹の雪（斑点状）
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + (idx * 0.5);
                const snowPatchGeo = new THREE.SphereGeometry(pos.r * 0.15, 8, 8);
                const snowPatch = new THREE.Mesh(snowPatchGeo, snowMat);
                snowPatch.position.set(
                    Math.cos(angle) * pos.r * 0.4,
                    pos.h * (0.45 + Math.random() * 0.15),
                    Math.sin(angle) * pos.r * 0.4
                );
                snowPatch.scale.set(1, 0.3, 1);
                group.add(snowPatch);
            }
            
            group.position.set(pos.x, 0, pos.z);
            this.trackGroup.add(group);
        });
    }
    
    addSnowmen() {
        const positions = [
            { x: -260, z: -50 }, { x: 260, z: 80 },
            { x: -100, z: 250 }, { x: 150, z: -260 },
        ];
        
        positions.forEach(pos => {
            this.createSnowman(pos.x, pos.z);
        });
    }
    
    createSnowman(x, z) {
        const group = new THREE.Group();
        const snowMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.7 });
        
        // 下の球
        const bottomGeo = new THREE.SphereGeometry(4, 16, 16);
        const bottom = new THREE.Mesh(bottomGeo, snowMat);
        bottom.position.y = 4;
        group.add(bottom);
        
        // 真ん中の球
        const middleGeo = new THREE.SphereGeometry(3, 16, 16);
        const middle = new THREE.Mesh(middleGeo, snowMat);
        middle.position.y = 10;
        group.add(middle);
        
        // 頭
        const headGeo = new THREE.SphereGeometry(2, 16, 16);
        const head = new THREE.Mesh(headGeo, snowMat);
        head.position.y = 14.5;
        group.add(head);
        
        // 目（石炭）
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        [-0.6, 0.6].forEach(xPos => {
            const eyeGeo = new THREE.SphereGeometry(0.3, 8, 8);
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(xPos, 15, 1.5);
            group.add(eye);
        });
        
        // ニンジンの鼻
        const noseGeo = new THREE.ConeGeometry(0.4, 2, 8);
        const noseMat = new THREE.MeshStandardMaterial({ color: 0xFF6600 });
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0, 14.5, 2);
        nose.rotation.x = -Math.PI / 2;
        group.add(nose);
        
        // 帽子
        const hatMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const hatBrimGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.3, 16);
        const hatBrim = new THREE.Mesh(hatBrimGeo, hatMat);
        hatBrim.position.y = 16.5;
        group.add(hatBrim);
        
        const hatTopGeo = new THREE.CylinderGeometry(1.5, 1.5, 3, 16);
        const hatTop = new THREE.Mesh(hatTopGeo, hatMat);
        hatTop.position.y = 18;
        group.add(hatTop);
        
        // 枝の腕
        const armMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        [-1, 1].forEach(dir => {
            const armGeo = new THREE.CylinderGeometry(0.2, 0.2, 5, 6);
            const arm = new THREE.Mesh(armGeo, armMat);
            arm.position.set(dir * 4.5, 10, 0);
            arm.rotation.z = dir * Math.PI / 4;
            group.add(arm);
        });
        
        group.position.set(x, 0, z);
        this.trackGroup.add(group);
    }
    
    addIceDecorations() {
        // 氷の結晶
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 280 + Math.random() * 80;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            
            this.createIceCrystal(x, z);
        }
    }
    
    createIceCrystal(x, z) {
        const group = new THREE.Group();
        const iceMat = new THREE.MeshStandardMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.8,
            roughness: 0.1,
            metalness: 0.5
        });
        
        // メインの結晶
        const crystalGeo = new THREE.OctahedronGeometry(3, 0);
        const crystal = new THREE.Mesh(crystalGeo, iceMat);
        crystal.position.y = 4;
        crystal.scale.set(1, 2, 1);
        group.add(crystal);
        
        // 小さな結晶
        for (let i = 0; i < 3; i++) {
            const smallGeo = new THREE.OctahedronGeometry(1.5, 0);
            const small = new THREE.Mesh(smallGeo, iceMat);
            const angle = (i / 3) * Math.PI * 2;
            small.position.set(
                Math.cos(angle) * 2,
                2,
                Math.sin(angle) * 2
            );
            small.scale.set(1, 1.5, 1);
            group.add(small);
        }
        
        group.position.set(x, 0, z);
        this.trackGroup.add(group);
    }
    
    addSnowTrees() {
        // より多くの雪の積もった松の木
        const positions = [
            { x: -280, z: -120 }, { x: -250, z: 100 },
            { x: 270, z: -60 }, { x: 250, z: 150 },
            { x: -120, z: 280 }, { x: 100, z: -280 },
            { x: -300, z: 50 }, { x: 300, z: -100 },
            { x: -200, z: 200 }, { x: 200, z: -200 },
            { x: -150, z: -250 }, { x: 150, z: 250 },
            { x: -320, z: 180 }, { x: 320, z: -180 },
        ];
        
        positions.forEach((pos, idx) => {
            this.createSnowPineTree(pos.x, pos.z, 0.8 + Math.random() * 0.4);
        });
    }
    
    createSnowPineTree(x, z, scale = 1) {
        const group = new THREE.Group();
        
        // 幹（太くて茶色）
        const trunkGeo = new THREE.CylinderGeometry(0.8 * scale, 1.2 * scale, 10 * scale, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3D2314, roughness: 0.95 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 5 * scale;
        group.add(trunk);
        
        // 松の葉（濃い緑）
        const pineMat = new THREE.MeshStandardMaterial({ color: 0x0D3B1E, roughness: 0.85 });
        const snowMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 });
        
        // 複数層の枝
        const layers = [
            { y: 12, r: 10, h: 6 },
            { y: 17, r: 8, h: 5 },
            { y: 21, r: 6, h: 4 },
            { y: 24, r: 4, h: 3 },
            { y: 26, r: 2, h: 2 },
        ];
        
        layers.forEach((l, idx) => {
            // 松の枝（下向きに垂れる形状）
            const layerGeo = new THREE.ConeGeometry(l.r * scale, l.h * scale, 12);
            const layer = new THREE.Mesh(layerGeo, pineMat);
            layer.position.y = l.y * scale;
            group.add(layer);
            
            // 雪の積もり（上面に）
            const snowGeo = new THREE.ConeGeometry(l.r * 0.85 * scale, l.h * 0.25 * scale, 12);
            const snow = new THREE.Mesh(snowGeo, snowMat);
            snow.position.y = (l.y + l.h * 0.35) * scale;
            group.add(snow);
            
            // 横に積もった雪
            if (idx < 3) {
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const snowPileGeo = new THREE.SphereGeometry(l.r * 0.2 * scale, 6, 6);
                    const snowPile = new THREE.Mesh(snowPileGeo, snowMat);
                    snowPile.position.set(
                        Math.cos(angle) * l.r * 0.7 * scale,
                        (l.y - l.h * 0.2) * scale,
                        Math.sin(angle) * l.r * 0.7 * scale
                    );
                    snowPile.scale.y = 0.4;
                    group.add(snowPile);
                }
            }
        });
        
        group.position.set(x, 0, z);
        this.trackGroup.add(group);
    }
    
    // 古いcreateSnowTreeを削除して新しいものに統合
    createSnowTree(x, z) {
        this.createSnowPineTree(x, z, 1);
    }
    
    // 雪のバンク（コース両側の雪の壁）
    addSnowBanks() {
        // 氷壁のテクスチャを作成（真っ白ではなく氷っぽく）
        const iceCanvas = document.createElement('canvas');
        iceCanvas.width = 128;
        iceCanvas.height = 128;
        const ctx = iceCanvas.getContext('2d');
        
        // ベース：薄い青白
        const gradient = ctx.createLinearGradient(0, 0, 128, 128);
        gradient.addColorStop(0, '#D8EAF4');
        gradient.addColorStop(0.3, '#C4DEF0');
        gradient.addColorStop(0.7, '#B0D2E8');
        gradient.addColorStop(1, '#D0E6F2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
        
        // 氷のひび割れ
        ctx.strokeStyle = 'rgba(160, 200, 220, 0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            let x = Math.random() * 128;
            let y = Math.random() * 128;
            ctx.moveTo(x, y);
            for (let j = 0; j < 3; j++) {
                x += Math.random() * 30 - 15;
                y += Math.random() * 30 - 15;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        
        // 光沢スポット
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * 128;
            const y = Math.random() * 128;
            const r = Math.random() * 8 + 3;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
        
        const iceTexture = new THREE.CanvasTexture(iceCanvas);
        iceTexture.wrapS = THREE.RepeatWrapping;
        iceTexture.wrapT = THREE.RepeatWrapping;
        iceTexture.repeat.set(4, 2);
        
        const snowMat = new THREE.MeshStandardMaterial({ 
            map: iceTexture,
            color: 0xC8E0F0,
            roughness: 0.3,
            metalness: 0.2
        });
        
        const bankHeight = 3;
        const bankWidth = 4;
        
        const totalSegs = this.innerBoundary.length;
        
        // 雪原コースの氷壁に少数の隙間を設ける（コース進行率で判定）
        const isSnowGap = (i) => {
            const t = i / totalSegs;
            // 隙間1: コース中盤のカーブ付近（内外共通）
            if (t > 0.35 && t < 0.40) return true;
            // 隙間2: 後半の直線区間
            if (t > 0.72 && t < 0.76) return true;
            return false;
        };
        
        // 内側のスノーバンク
        for (let i = 0; i < this.innerBoundary.length - 1; i += 4) {
            if (isSnowGap(i)) continue;
            
            const curr = this.innerBoundary[i];
            const next = this.innerBoundary[Math.min(i + 4, this.innerBoundary.length - 1)];
            
            if (!curr || !next) continue;
            
            const dx = next.x - curr.x;
            const dz = next.z - curr.z;
            const length = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(dz, dx);
            
            const bankGeo = new THREE.BoxGeometry(length, bankHeight, bankWidth);
            const bank = new THREE.Mesh(bankGeo, snowMat);
            bank.position.set(
                (curr.x + next.x) / 2,
                bankHeight / 2,
                (curr.z + next.z) / 2
            );
            bank.rotation.y = -angle;
            bank.castShadow = true;
            bank.receiveShadow = true;
            
            bank.userData.isCollidable = true;
            bank.userData.wallType = 'snow_inner';
            this.trackGroup.add(bank);
            this.collidableObjects.push(bank);
        }
        
        // 外側のスノーバンク
        for (let i = 0; i < this.outerBoundary.length - 1; i += 4) {
            if (isSnowGap(i)) continue;
            
            const curr = this.outerBoundary[i];
            const next = this.outerBoundary[Math.min(i + 4, this.outerBoundary.length - 1)];
            
            if (!curr || !next) continue;
            
            const dx = next.x - curr.x;
            const dz = next.z - curr.z;
            const length = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(dz, dx);
            
            const bankGeo = new THREE.BoxGeometry(length, bankHeight, bankWidth);
            const bank = new THREE.Mesh(bankGeo, snowMat);
            bank.position.set(
                (curr.x + next.x) / 2,
                bankHeight / 2,
                (curr.z + next.z) / 2
            );
            bank.rotation.y = -angle;
            bank.castShadow = true;
            bank.receiveShadow = true;
            
            bank.userData.isCollidable = true;
            bank.userData.wallType = 'snow_outer';
            this.trackGroup.add(bank);
            this.collidableObjects.push(bank);
        }
    }
    
    // 凍った池
    addFrozenPonds() {
        const pondPositions = [
            { x: -180, z: 50, size: 25 },
            { x: 200, z: -100, size: 30 },
            { x: -50, z: 250, size: 20 },
        ];
        
        pondPositions.forEach(pos => {
            this.createFrozenPond(pos.x, pos.z, pos.size);
        });
    }
    
    createFrozenPond(x, z, size) {
        const group = new THREE.Group();
        
        // 凍った水面
        const iceGeo = new THREE.CircleGeometry(size, 24);
        const iceMat = new THREE.MeshStandardMaterial({
            color: 0xADD8E6,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,
            metalness: 0.3
        });
        const ice = new THREE.Mesh(iceGeo, iceMat);
        ice.rotation.x = -Math.PI / 2;
        ice.position.y = -0.2;
        group.add(ice);
        
        // 氷の縁（雪）
        const rimGeo = new THREE.RingGeometry(size - 1, size + 2, 24);
        const rimMat = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.8
        });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = -Math.PI / 2;
        rim.position.y = 0;
        group.add(rim);
        
        // 氷の亀裂模様
        const crackMat = new THREE.LineBasicMaterial({ color: 0x87CEEB });
        for (let i = 0; i < 5; i++) {
            const points = [];
            const startAngle = Math.random() * Math.PI * 2;
            const startR = Math.random() * size * 0.3;
            points.push(new THREE.Vector3(
                Math.cos(startAngle) * startR,
                0.01,
                Math.sin(startAngle) * startR
            ));
            
            for (let j = 0; j < 3; j++) {
                const angle = startAngle + (Math.random() - 0.5) * 1;
                const r = startR + (j + 1) * size * 0.25;
                points.push(new THREE.Vector3(
                    Math.cos(angle) * r,
                    0.01,
                    Math.sin(angle) * r
                ));
            }
            
            const crackGeo = new THREE.BufferGeometry().setFromPoints(points);
            const crack = new THREE.Line(crackGeo, crackMat);
            group.add(crack);
        }
        
        group.position.set(x, 0, z);
        this.trackGroup.add(group);
    }
    
    // 雪の装飾
    addSnowDecorations() {
        // 雪の積もった岩
        const rockPositions = [
            { x: -300, z: -150 }, { x: 300, z: 100 },
            { x: -280, z: 180 }, { x: 280, z: -200 },
        ];
        
        rockPositions.forEach(pos => {
            this.createSnowRock(pos.x, pos.z);
        });
        
        // 追加の雪だるま（より多く）
        const extraSnowmanPositions = [
            { x: -320, z: 50 }, { x: 320, z: -80 },
            { x: -50, z: 320 }, { x: 100, z: -320 },
        ];
        
        extraSnowmanPositions.forEach(pos => {
            this.createSnowman(pos.x, pos.z);
        });
    }
    
    createSnowRock(x, z) {
        const group = new THREE.Group();
        
        // 岩
        const rockMat = new THREE.MeshStandardMaterial({ 
            color: 0x5a5a5a, 
            roughness: 0.9 
        });
        const snowMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF, 
            roughness: 0.7 
        });
        
        // 大きな岩
        const rockGeo = new THREE.DodecahedronGeometry(8, 1);
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.y = 4;
        rock.scale.set(1, 0.7, 1);
        group.add(rock);
        
        // 雪のキャップ
        const snowCapGeo = new THREE.SphereGeometry(7, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.4);
        const snowCap = new THREE.Mesh(snowCapGeo, snowMat);
        snowCap.position.y = 7;
        group.add(snowCap);
        
        group.position.set(x, 0, z);
        this.trackGroup.add(group);
        
        // 衝突判定
        group.userData.isCollidable = true;
        this.collidableObjects.push(group);
    }

    // === 城コース用の環境関数 ===
    createCobblestoneGround() {
        // 石畳のテクスチャを作成
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // 暗いグレーの背景
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(0, 0, 512, 512);
        
        // 石畳パターン
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const x = i * 64 + (j % 2) * 32;
                const y = j * 64;
                ctx.fillStyle = `rgb(${50 + Math.random() * 30}, ${50 + Math.random() * 30}, ${50 + Math.random() * 30})`;
                ctx.fillRect(x + 2, y + 2, 60, 60);
                ctx.strokeRect(x, y, 64, 64);
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 20);
        
        const groundGeo = new THREE.PlaneGeometry(1000, 1000);
        const groundMat = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.9
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        ground.receiveShadow = true;
        this.trackGroup.add(ground);
    }
    
    addCastleWalls() {
        const wallPositions = [
            { x: -300, z: 0, rot: 0 },
            { x: 300, z: 0, rot: 0 },
            { x: 0, z: -300, rot: Math.PI / 2 },
            { x: 0, z: 300, rot: Math.PI / 2 },
        ];
        
        wallPositions.forEach(pos => {
            this.createCastleWall(pos.x, pos.z, pos.rot);
        });
    }
    
    createCastleWall(x, z, rotation) {
        const group = new THREE.Group();
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9 });
        
        // メインの壁
        const wallGeo = new THREE.BoxGeometry(200, 40, 10);
        const wall = new THREE.Mesh(wallGeo, stoneMat);
        wall.position.y = 20;
        group.add(wall);
        
        // 塔（両端）
        [-90, 90].forEach(offset => {
            const towerGeo = new THREE.CylinderGeometry(12, 14, 60, 12);
            const tower = new THREE.Mesh(towerGeo, stoneMat);
            tower.position.set(offset, 30, 0);
            group.add(tower);
            
            // 塔の屋根
            const roofGeo = new THREE.ConeGeometry(15, 20, 12);
            const roofMat = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
            const roof = new THREE.Mesh(roofGeo, roofMat);
            roof.position.set(offset, 70, 0);
            group.add(roof);
        });
        
        // 胸壁（クレネル）
        for (let i = -8; i <= 8; i++) {
            const crenelGeo = new THREE.BoxGeometry(8, 6, 12);
            const crenel = new THREE.Mesh(crenelGeo, stoneMat);
            crenel.position.set(i * 10, 43, 0);
            group.add(crenel);
        }
        
        group.position.set(x, 0, z);
        group.rotation.y = rotation;
        this.trackGroup.add(group);
    }
    
    addTorches() {
        const torchPositions = [
            { x: -250, z: -100 }, { x: -250, z: 100 },
            { x: 250, z: -100 }, { x: 250, z: 100 },
            { x: -100, z: -250 }, { x: 100, z: -250 },
            { x: -100, z: 250 }, { x: 100, z: 250 },
        ];
        
        torchPositions.forEach(pos => {
            this.createTorch(pos.x, pos.z);
        });
    }
    
    createTorch(x, z) {
        const group = new THREE.Group();
        
        // 松明の棒
        const stickGeo = new THREE.CylinderGeometry(0.3, 0.4, 6, 8);
        const stickMat = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
        const stick = new THREE.Mesh(stickGeo, stickMat);
        stick.position.y = 3;
        group.add(stick);
        
        // 炎のホルダー
        const holderGeo = new THREE.CylinderGeometry(0.6, 0.5, 1, 8);
        const holderMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.5 });
        const holder = new THREE.Mesh(holderGeo, holderMat);
        holder.position.y = 6;
        group.add(holder);
        
        // 炎（アニメーション用に複数の球体）
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xFF6600 });
        const flameGeo = new THREE.SphereGeometry(0.6, 8, 8);
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.y = 7;
        flame.scale.set(1, 1.5, 1);
        group.add(flame);
        
        // ポイントライト
        const light = new THREE.PointLight(0xFF6600, 1, 30);
        light.position.y = 7;
        group.add(light);
        
        group.position.set(x, 0, z);
        this.trackGroup.add(group);
    }
    
    // コース両側の低い石壁を追加（城コース専用）
    addCastleTrackWalls() {
        const stoneMat = new THREE.MeshStandardMaterial({ 
            color: 0x3a3a3a, 
            roughness: 0.9 
        });
        const darkStoneMat = new THREE.MeshStandardMaterial({ 
            color: 0x2a2a2a, 
            roughness: 0.95 
        });
        
        const wallHeight = 2.5;
        const wallWidth = 1.5;
        const totalSegments = this.innerBoundary.length;
        
        // 壁を配置するかどうかを判定する関数
        // コースの約半分にのみ壁を配置し、危険な区間を作る
        // 城コースは矩形: スタート(z=-200)→右辺(x=180)→上辺(z=120)→左辺(x=-200ジグザグ)→戻る
        const shouldPlaceInnerWall = (i) => {
            const t = i / totalSegments;  // 0〜1のコース進行率
            // 壁あり区間（約50%）:
            // - スタート〜第1カーブ手前 (0〜0.12): 壁あり（初心者保護）
            // - 右辺の直線中盤 (0.18〜0.30): 壁なし（溶岩エリア1 - 内側落下危険）
            // - 第2カーブ周辺 (0.30〜0.42): 壁あり（カーブ保護）
            // - ドッスンゾーン (0.42〜0.55): 壁なし（ドッスン回避で落下リスク）
            // - 第3カーブ〜左辺前半 (0.55〜0.70): 壁あり
            // - ジグザグ通路 (0.70〜0.85): 壁なし（ジグザグで落ちやすい）
            // - 第4カーブ〜ゴール (0.85〜1.0): 壁あり
            if (t < 0.12) return true;
            if (t < 0.18) return true;
            if (t < 0.30) return false;  // 溶岩エリア - 危険
            if (t < 0.42) return true;
            if (t < 0.55) return false;  // ドッスンゾーン - 危険
            if (t < 0.70) return true;
            if (t < 0.85) return false;  // ジグザグ - 危険
            return true;
        };
        
        const shouldPlaceOuterWall = (i) => {
            const t = i / totalSegments;
            // 外側は内側と異なる箇所を開ける
            // - スタート付近 (0〜0.10): 壁あり
            // - 第1カーブ (0.10〜0.20): 壁なし（カーブ外側落下危険）
            // - 右辺直線 (0.20〜0.35): 壁あり
            // - 第2カーブ外側 (0.35〜0.45): 壁なし（カーブ外側落下危険）
            // - ドッスンゾーン (0.45〜0.58): 壁あり
            // - 第3カーブ (0.58〜0.68): 壁なし（カーブ外側落下危険）
            // - 左辺〜ジグザグ (0.68〜0.80): 壁あり
            // - 第4カーブ (0.80〜0.90): 壁なし（最終カーブ外側危険）
            // - ゴール手前 (0.90〜1.0): 壁あり
            if (t < 0.10) return true;
            if (t < 0.20) return false;
            if (t < 0.35) return true;
            if (t < 0.45) return false;
            if (t < 0.58) return true;
            if (t < 0.68) return false;
            if (t < 0.80) return true;
            if (t < 0.90) return false;
            return true;
        };
        
        // 内側の壁
        for (let i = 0; i < this.innerBoundary.length - 1; i += 3) {
            if (!shouldPlaceInnerWall(i)) continue;
            
            const curr = this.innerBoundary[i];
            const next = this.innerBoundary[Math.min(i + 3, this.innerBoundary.length - 1)];
            if (!curr || !next) continue;
            
            const dx = next.x - curr.x;
            const dz = next.z - curr.z;
            const length = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(dz, dx);
            
            const innerWallGeo = new THREE.BoxGeometry(length, wallHeight, wallWidth);
            const innerWall = new THREE.Mesh(innerWallGeo, stoneMat);
            innerWall.position.set(
                (curr.x + next.x) / 2,
                wallHeight / 2,
                (curr.z + next.z) / 2
            );
            innerWall.rotation.y = -angle;
            innerWall.castShadow = true;
            innerWall.receiveShadow = true;
            innerWall.userData.isCollidable = true;
            innerWall.userData.wallType = 'castle_inner';
            this.trackGroup.add(innerWall);
            this.collidableObjects.push(innerWall);
            
            if (i % 9 === 0) {
                const topGeo = new THREE.BoxGeometry(2, 1, wallWidth + 0.5);
                const top = new THREE.Mesh(topGeo, darkStoneMat);
                top.position.set(
                    (curr.x + next.x) / 2,
                    wallHeight + 0.5,
                    (curr.z + next.z) / 2
                );
                top.rotation.y = -angle;
                this.trackGroup.add(top);
            }
        }
        
        // 外側の壁
        for (let i = 0; i < this.outerBoundary.length - 1; i += 3) {
            if (!shouldPlaceOuterWall(i)) continue;
            
            const curr = this.outerBoundary[i];
            const next = this.outerBoundary[Math.min(i + 3, this.outerBoundary.length - 1)];
            if (!curr || !next) continue;
            
            const dx = next.x - curr.x;
            const dz = next.z - curr.z;
            const length = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(dz, dx);
            
            const outerWallGeo = new THREE.BoxGeometry(length, wallHeight, wallWidth);
            const outerWall = new THREE.Mesh(outerWallGeo, stoneMat);
            outerWall.position.set(
                (curr.x + next.x) / 2,
                wallHeight / 2,
                (curr.z + next.z) / 2
            );
            outerWall.rotation.y = -angle;
            outerWall.castShadow = true;
            outerWall.receiveShadow = true;
            outerWall.userData.isCollidable = true;
            outerWall.userData.wallType = 'castle_outer';
            this.trackGroup.add(outerWall);
            this.collidableObjects.push(outerWall);
            
            if (i % 9 === 0) {
                const topGeo = new THREE.BoxGeometry(2, 1, wallWidth + 0.5);
                const top = new THREE.Mesh(topGeo, darkStoneMat);
                top.position.set(
                    (curr.x + next.x) / 2,
                    wallHeight + 0.5,
                    (curr.z + next.z) / 2
                );
                top.rotation.y = -angle;
                this.trackGroup.add(top);
            }
        }
    }
    
    // 溶岩の池を追加（城コース）
    addLavaPools() {
        const lavaPositions = [
            { x: 200, z: -100, size: 30 },
            { x: -150, z: 100, size: 25 },
            { x: 50, z: -50, size: 20 },
            { x: -200, z: -50, size: 35 },
        ];
        
        lavaPositions.forEach(pos => {
            this.createLavaPool(pos.x, pos.z, pos.size);
        });
    }
    
    createLavaPool(x, z, size) {
        const group = new THREE.Group();
        
        // 溶岩テクスチャを作成
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // 溶岩のグラデーション
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, '#FF6600');
        gradient.addColorStop(0.3, '#FF4400');
        gradient.addColorStop(0.6, '#CC2200');
        gradient.addColorStop(1, '#881100');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        // 泡のような模様
        for (let i = 0; i < 20; i++) {
            const bx = Math.random() * 256;
            const by = Math.random() * 256;
            const br = 5 + Math.random() * 15;
            ctx.beginPath();
            ctx.arc(bx, by, br, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, ${Math.random() * 100 + 100}, 0, 0.5)`;
            ctx.fill();
        }
        
        const lavaTexture = new THREE.CanvasTexture(canvas);
        
        // 溶岩の池
        const lavaGeo = new THREE.CircleGeometry(size, 24);
        const lavaMat = new THREE.MeshBasicMaterial({
            map: lavaTexture,
            transparent: true,
            opacity: 0.95
        });
        const lava = new THREE.Mesh(lavaGeo, lavaMat);
        lava.rotation.x = -Math.PI / 2;
        lava.position.y = -0.3;
        group.add(lava);
        
        // 溶岩の縁（暗い岩）
        const rimGeo = new THREE.RingGeometry(size - 2, size + 3, 24);
        const rimMat = new THREE.MeshStandardMaterial({
            color: 0x2a1a0a,
            roughness: 0.95
        });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = -Math.PI / 2;
        rim.position.y = -0.2;
        group.add(rim);
        
        // 発光効果（ポイントライト）
        const light = new THREE.PointLight(0xFF4400, 0.8, size * 2);
        light.position.y = 2;
        group.add(light);
        
        group.position.set(x, 0, z);
        this.trackGroup.add(group);
        
        // 溶岩を危険エリアとして登録
        this.hazards.push({
            type: 'lava',
            position: { x, z },
            radius: size,
            damage: true
        });
    }
    
    addCastleBackground() {
        // 暗い霧の効果
        // シーンに直接追加するので、ここではスキップ
    }
    
    // === ユーティリティ: アウトライン追加（トゥーンレンダリング風） ===
    addOutline(object, scale = 1.05, color = 0x000000) {
        // 先にすべてのメッシュを収集（traverse中に追加すると無限ループになるため）
        const meshes = [];
        object.traverse((child) => {
            if (child.isMesh && child.geometry && !child.userData.isOutline) {
                // 半透明オブジェクトには適用しない
                if (child.material && (child.material.transparent || child.material.opacity < 1)) return;
                meshes.push(child);
            }
        });
        
        // 収集したメッシュにアウトラインを追加
        meshes.forEach(child => {
            // アウトライン用マテリアル（裏面描画）
            const outlineMaterial = new THREE.MeshBasicMaterial({ 
                color: color, 
                side: THREE.BackSide 
            });
            
            // 元のジオメトリを複製して少し大きくする
            const outlineMesh = new THREE.Mesh(child.geometry.clone(), outlineMaterial);
            outlineMesh.scale.multiplyScalar(scale);
            outlineMesh.userData.isOutline = true; // マーカーを付ける
            
            child.add(outlineMesh);
        });
    }

    // ドッスンとノコノコを追加
    addEnemies() {
        // 敵キャラクター配列を初期化
        this.enemies = [];
        
        // コースタイプを取得（デフォルトは草原）
        const courseType = window.gameSettings?.courseType || 'grassland';
        
        // コース別に敵を配置
        switch(courseType) {
            case 'snow':
                this.addSnowEnemies();
                break;
            case 'castle':
                this.addCastleEnemies();
                break;
            default:
                this.addGrasslandEnemies();
                break;
        }
    }
    
    // === 草原コースの敵（マリオサーキット） ===
    addGrasslandEnemies() {
        // パックンフラワー（コース上に配置 - 土管なし）
        const piranhaLocations = [
            { x: 50, z: -160 },    // スタート直線
            { x: 240, z: -30 },    // 東カーブ
            { x: 100, z: 190 },    // 北ストレート
            { x: -150, z: 185 },   // 北西
            { x: -245, z: 0 },     // 西カーブ
        ];
        piranhaLocations.forEach((loc, index) => {
            this.createPiranhaPlant(loc.x, loc.z, index);
        });
        
        // ノコノコ（コース上を横断 - 広く配置）
        const koopaLocations = [
            { x: 230, z: 50, patrolAxis: 'z', patrolRange: 50 },
            { x: -60, z: 200, patrolAxis: 'x', patrolRange: 60 },
            { x: -230, z: 80, patrolAxis: 'z', patrolRange: 50 },
            { x: -180, z: -130, patrolAxis: 'x', patrolRange: 50 },
        ];
        koopaLocations.forEach((loc, index) => {
            this.createKoopa(loc.x, loc.z, loc.patrolAxis, loc.patrolRange, index);
        });
        
        // クリボー（コース各所に配置）
        const goombaLocations = [
            { x: -50, z: -160, patrolAxis: 'x', patrolRange: 40 },
            { x: 200, z: 130, patrolAxis: 'z', patrolRange: 40 },
            { x: 30, z: 205, patrolAxis: 'x', patrolRange: 50 },
            { x: -240, z: -60, patrolAxis: 'z', patrolRange: 40 },
            { x: 120, z: -155, patrolAxis: 'x', patrolRange: 45 },
        ];
        goombaLocations.forEach((loc, index) => {
            this.createGoomba(loc.x, loc.z, loc.patrolAxis, loc.patrolRange, index);
        });
        
        // ワンワン（草原コースにも追加）
        const grasslandChompLocations = [
            { x: 240, z: -80 },    // 東カーブ（コースセンターライン上）
            { x: -230, z: 120 },   // 西カーブ（コースセンターライン上）
        ];
        grasslandChompLocations.forEach((loc, index) => {
            this.createChainChomp(loc.x, loc.z, index);
        });
        
        // ジュゲム（空中から甲羅を落とす）- コース上を巡回
        this.createLakitu(200, -140, 0);
    }
    
    // === 雪コースの敵（フラッペスノーランド） ===
    addSnowEnemies() {
        // ペンギン（氷の上を滑る）- 広く分散
        const penguinLocations = [
            { x: 310, z: 30, patrolAxis: 'z', patrolRange: 80 },
            { x: 40, z: 250, patrolAxis: 'x', patrolRange: 100 },
            { x: 230, z: -170, patrolAxis: 'x', patrolRange: 70 },
            { x: -330, z: 50, patrolAxis: 'z', patrolRange: 90 },
            { x: -110, z: 260, patrolAxis: 'x', patrolRange: 80 },
        ];
        penguinLocations.forEach((loc, index) => {
            this.createPenguin(loc.x, loc.z, loc.patrolAxis, loc.patrolRange, index);
        });
        
        // 歩く雪だるま（動く障害物）- 広く配置
        const snowmanEnemyLocations = [
            { x: 200, z: 180, patrolAxis: 'x', patrolRange: 60 },
            { x: -260, z: 210, patrolAxis: 'z', patrolRange: 50 },
            { x: 310, z: -60, patrolAxis: 'z', patrolRange: 70 },
            { x: -330, z: -80, patrolAxis: 'z', patrolRange: 60 },
        ];
        snowmanEnemyLocations.forEach((loc, index) => {
            this.createWalkingSnowman(loc.x, loc.z, loc.patrolAxis, loc.patrolRange, index);
        });
        
        // アイスブロス（氷を投げる敵）
        const iceBrosLocations = [
            { x: 280, z: 110 },
            { x: -300, z: -130 },
        ];
        iceBrosLocations.forEach((loc, index) => {
            this.createIceBros(loc.x, loc.z, index);
        });
        
        // 凍った池でスリップエリア
        const icePatchLocations = [
            { x: 310, z: 50 },
            { x: -335, z: -30 },
            { x: -50, z: 250 },
        ];
        icePatchLocations.forEach((loc, index) => {
            this.createIcePatch(loc.x, loc.z, index);
        });
    }
    
    // === 城コースの敵（クッパ城） ===
    addCastleEnemies() {
        // ドッスン（通路を塞ぐ）- 広く配置
        const thwompLocations = [
            { x: 175, z: -60 },
            { x: -40, z: 120 },
            { x: -195, z: 60 },
        ];
        thwompLocations.forEach((loc, index) => {
            this.createThwomp(loc.x, loc.z, index);
        });
        
        // テレサ（暗い場所に多め）- 広く
        const booLocations = [
            { x: 130, z: 120 },
            { x: -100, z: 120 },
            { x: -180, z: -60 },
            { x: 40, z: -200 },
        ];
        booLocations.forEach((loc, index) => {
            this.createBoo(loc.x, loc.z, index);
        });
        
        // ワンワン（危険エリア）
        const chompLocations = [
            { x: -50, z: -170 },
            { x: -195, z: 90 },
        ];
        chompLocations.forEach((loc, index) => {
            this.createChainChomp(loc.x, loc.z, index);
        });
        
        // カロン（ガイコツ亀）- 広く配置
        const dryBonesLocations = [
            { x: 70, z: 120, patrolAxis: 'x', patrolRange: 50 },
            { x: -160, z: -165, patrolAxis: 'x', patrolRange: 40 },
            { x: 175, z: 40, patrolAxis: 'z', patrolRange: 50 },
        ];
        dryBonesLocations.forEach((loc, index) => {
            this.createDryBones(loc.x, loc.z, loc.patrolAxis, loc.patrolRange, index);
        });
        
        // ファイアバー（回転する炎）- コース中央に配置
        const fireBarLocations = [
            { x: 175, z: -140 },   // 第1コーナー後
            { x: 130, z: 120 },    // 第2コーナー付近
            { x: -195, z: 70 },    // 第3コーナー付近
            { x: -175, z: -70 },   // ジグザグ通路
        ];
        fireBarLocations.forEach((loc, index) => {
            this.createFireBar(loc.x, loc.z, index);
        });
        
        // 炎の柱（溶岩エリア）
        const fireLocations = [
            { x: 180, z: 40 },
            { x: -200, z: -40 },
        ];
        fireLocations.forEach((loc, index) => {
            this.createFirePillar(loc.x, loc.z, index);
        });
    }
    
    // === 新しい敵：歩く雪だるま ===
    createWalkingSnowman(x, z, patrolAxis, patrolRange, index) {
        const group = new THREE.Group();
        
        // === マテリアル ===
        const snowMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF, 
            roughness: 0.6,
            metalness: 0.05
        });
        const snowShadowMat = new THREE.MeshStandardMaterial({ 
            color: 0xE8E8F8, 
            roughness: 0.7 
        });
        const snowSpeckleMat = new THREE.MeshStandardMaterial({ 
            color: 0xDDDDEE, 
            roughness: 0.75 
        });
        
        // === 体（下段・大きな雪球） ===
        const bottomGeo = new THREE.SphereGeometry(3.5, 28, 24);
        const bottom = new THREE.Mesh(bottomGeo, snowMat);
        bottom.position.y = 3.2;
        group.add(bottom);
        
        // 下段の陰影（立体感）
        const bottomShadeGeo = new THREE.SphereGeometry(3, 20, 16, 0, Math.PI * 2, Math.PI * 0.4, Math.PI * 0.5);
        const bottomShade = new THREE.Mesh(bottomShadeGeo, snowShadowMat);
        bottomShade.position.y = 3.2;
        bottomShade.rotation.x = Math.PI;
        group.add(bottomShade);
        
        // 雪の粒感（表面のテクスチャ）
        for (let i = 0; i < 40; i++) {
            const speckleGeo = new THREE.SphereGeometry(0.15 + Math.random() * 0.1, 6, 6);
            const speckle = new THREE.Mesh(speckleGeo, snowSpeckleMat);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.5;
            speckle.position.set(
                Math.sin(phi) * Math.cos(theta) * 3.4,
                3.2 + Math.cos(phi) * 3.4 - 1.5,
                Math.sin(phi) * Math.sin(theta) * 3.4
            );
            group.add(speckle);
        }
        
        // === 体（中段・ミドルサイズ） ===
        const middleGeo = new THREE.SphereGeometry(2.6, 24, 20);
        const middle = new THREE.Mesh(middleGeo, snowMat);
        middle.position.y = 7.8;
        group.add(middle);
        
        // 中段の影
        const middleShadeGeo = new THREE.SphereGeometry(2.2, 16, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.4);
        const middleShade = new THREE.Mesh(middleShadeGeo, snowShadowMat);
        middleShade.position.y = 7.8;
        middleShade.rotation.x = Math.PI;
        group.add(middleShade);
        
        // === 頭（小さな雪球） ===
        const headGeo = new THREE.SphereGeometry(1.9, 24, 20);
        const head = new THREE.Mesh(headGeo, snowMat);
        head.position.y = 11.5;
        group.add(head);
        
        // === 帽子（シルクハット風・マリオ風） ===
        const hatMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a2a, 
            roughness: 0.4, 
            metalness: 0.2 
        });
        const hatBandMat = new THREE.MeshStandardMaterial({ 
            color: 0xCC2222, 
            roughness: 0.5 
        });
        
        // 帽子のつば
        const brimGeo = new THREE.CylinderGeometry(2.8, 2.8, 0.25, 24);
        const brim = new THREE.Mesh(brimGeo, hatMat);
        brim.position.y = 13.2;
        group.add(brim);
        
        // 帽子の本体（シルクハット）
        const hatTopGeo = new THREE.CylinderGeometry(2.0, 2.2, 2.8, 20);
        const hatTop = new THREE.Mesh(hatTopGeo, hatMat);
        hatTop.position.y = 14.7;
        group.add(hatTop);
        
        // 帽子のバンド（赤いリボン）
        const bandGeo = new THREE.CylinderGeometry(2.22, 2.22, 0.4, 20);
        const band = new THREE.Mesh(bandGeo, hatBandMat);
        band.position.y = 13.5;
        group.add(band);
        
        // リボンの飾り（バックル風）
        const buckleMat = new THREE.MeshStandardMaterial({ color: 0xFFDD00, metalness: 0.5, roughness: 0.3 });
        const buckleGeo = new THREE.BoxGeometry(0.6, 0.35, 0.1);
        const buckle = new THREE.Mesh(buckleGeo, buckleMat);
        buckle.position.set(0, 13.5, 2.15);
        group.add(buckle);
        
        // === 顔 ===
        // 目（大きな石炭・怒り目）
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.7 });
        const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        [-0.8, 0.8].forEach(xPos => {
            // 目の本体
            const eyeGeo = new THREE.SphereGeometry(0.5, 16, 16);
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(xPos, 11.9, 1.65);
            eye.scale.set(1, 1.2, 0.8);
            group.add(eye);
            
            // 目のハイライト
            const highlightGeo = new THREE.SphereGeometry(0.15, 10, 10);
            const highlight = new THREE.Mesh(highlightGeo, eyeHighlightMat);
            highlight.position.set(xPos + 0.12, 12.05, 1.9);
            group.add(highlight);
        });
        
        // 怒り眉（氷の結晶風）
        const browMat = new THREE.MeshStandardMaterial({ color: 0x88CCFF, roughness: 0.2, metalness: 0.4 });
        [-0.8, 0.8].forEach(xPos => {
            const browGeo = new THREE.BoxGeometry(1.0, 0.25, 0.2);
            const brow = new THREE.Mesh(browGeo, browMat);
            brow.position.set(xPos, 12.55, 1.7);
            brow.rotation.z = xPos > 0 ? 0.45 : -0.45;
            group.add(brow);
        });
        
        // ほっぺ（雪に埋もれたピンク）
        const cheekMat = new THREE.MeshBasicMaterial({ 
            color: 0xFF9999, 
            transparent: true, 
            opacity: 0.35 
        });
        [-1.4, 1.4].forEach(xPos => {
            const cheekGeo = new THREE.CircleGeometry(0.45, 16);
            const cheek = new THREE.Mesh(cheekGeo, cheekMat);
            cheek.position.set(xPos, 11.4, 1.55);
            group.add(cheek);
        });
        
        // === にんじんの鼻（詳細） ===
        const noseMat = new THREE.MeshStandardMaterial({ 
            color: 0xFF6600, 
            roughness: 0.55 
        });
        const noseTipMat = new THREE.MeshStandardMaterial({ 
            color: 0xFF4400, 
            roughness: 0.5 
        });
        
        // 鼻の本体
        const noseGeo = new THREE.ConeGeometry(0.4, 2.2, 12);
        const nose = new THREE.Mesh(noseGeo, noseMat);
        nose.position.set(0, 11.5, 2.0);
        nose.rotation.x = -Math.PI / 2;
        group.add(nose);
        
        // 鼻のリング（自然な線）
        for (let i = 0; i < 4; i++) {
            const ringGeo = new THREE.TorusGeometry(0.35 - i * 0.06, 0.03, 8, 16);
            const ringMat = new THREE.MeshStandardMaterial({ 
                color: i % 2 === 0 ? 0xFF5500 : 0xFF7700, 
                roughness: 0.6 
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.set(0, 11.5, 2.0 + i * 0.4);
            group.add(ring);
        }
        
        // === 口（石炭の笑顔→怒り顔） ===
        for (let i = -3; i <= 3; i++) {
            const mouthGeo = new THREE.SphereGeometry(0.18, 10, 10);
            const mouth = new THREE.Mesh(mouthGeo, eyeMat);
            const angle = i * 0.2;
            mouth.position.set(
                Math.sin(angle) * 1.4,
                10.6 + Math.abs(i) * 0.12,  // 上向きカーブ（怒り）
                Math.cos(angle) * 0.4 + 1.65
            );
            group.add(mouth);
        }
        
        // === ボタン（木の実風） ===
        const buttonMat = new THREE.MeshStandardMaterial({ 
            color: 0x3D2817, 
            roughness: 0.7 
        });
        [9.0, 7.2, 5.4].forEach(yPos => {
            const buttonGeo = new THREE.SphereGeometry(0.35, 12, 12);
            const button = new THREE.Mesh(buttonGeo, buttonMat);
            button.position.set(0, yPos, 2.45);
            button.scale.set(1, 0.8, 0.6);
            group.add(button);
        });
        
        // === 腕（木の枝・詳細） ===
        const branchMat = new THREE.MeshStandardMaterial({ 
            color: 0x4a3728, 
            roughness: 0.85 
        });
        const branchDarkMat = new THREE.MeshStandardMaterial({ 
            color: 0x3a2718, 
            roughness: 0.9 
        });
        
        [-1, 1].forEach(side => {
            const armGroup = new THREE.Group();
            
            // 腕の本体（太い枝）
            const armGeo = new THREE.CylinderGeometry(0.2, 0.28, 3.5, 10);
            const arm = new THREE.Mesh(armGeo, branchMat);
            arm.rotation.z = Math.PI / 2;
            armGroup.add(arm);
            
            // 小枝（指）
            for (let i = 0; i < 3; i++) {
                const twiGeo = new THREE.CylinderGeometry(0.06, 0.1, 0.9 + Math.random() * 0.3, 6);
                const twig = new THREE.Mesh(twiGeo, branchDarkMat);
                twig.position.set(side * 1.5, 0.1 + i * 0.15, (i - 1) * 0.25);
                twig.rotation.z = side * (0.4 + i * 0.15);
                twig.rotation.x = (i - 1) * 0.3;
                armGroup.add(twig);
            }
            
            // 節（コブ）
            for (let i = 0; i < 2; i++) {
                const knotGeo = new THREE.SphereGeometry(0.2, 8, 8);
                const knot = new THREE.Mesh(knotGeo, branchDarkMat);
                knot.position.set(side * (0.5 + i * 0.8), 0.1, 0);
                knot.scale.set(1, 0.7, 1);
                armGroup.add(knot);
            }
            
            armGroup.position.set(side * 4.0, 7.5, 0.5);
            armGroup.rotation.z = side * 0.35;
            armGroup.rotation.y = side * 0.2;
            group.add(armGroup);
        });
        
        // === マフラー（詳細なストライプ） ===
        const scarfMat1 = new THREE.MeshStandardMaterial({ color: 0xDD2222, roughness: 0.55 });
        const scarfMat2 = new THREE.MeshStandardMaterial({ color: 0x22AA22, roughness: 0.55 });
        const scarfWhiteMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 });
        
        // 首周り
        const scarfNeckGeo = new THREE.TorusGeometry(2.35, 0.5, 14, 28);
        const scarfNeck = new THREE.Mesh(scarfNeckGeo, scarfMat1);
        scarfNeck.rotation.x = Math.PI / 2;
        scarfNeck.position.y = 9.6;
        group.add(scarfNeck);
        
        // ストライプ（巻き付き）
        for (let i = 0; i < 4; i++) {
            const stripeGeo = new THREE.TorusGeometry(2.38, 0.12, 8, 16);
            const stripe = new THREE.Mesh(stripeGeo, i % 2 === 0 ? scarfWhiteMat : scarfMat2);
            stripe.rotation.x = Math.PI / 2;
            stripe.position.y = 9.3 + i * 0.2;
            group.add(stripe);
        }
        
        // 垂れている部分（2本）
        const createScarfTail = (xOffset, zOffset, rotZ) => {
            const tailGroup = new THREE.Group();
            
            // メイン部分
            const tailMainGeo = new THREE.BoxGeometry(0.9, 3.0, 0.35);
            const tailMain = new THREE.Mesh(tailMainGeo, scarfMat1);
            tailMain.position.y = -1.5;
            tailGroup.add(tailMain);
            
            // ストライプ
            for (let i = 0; i < 3; i++) {
                const tailStripeGeo = new THREE.BoxGeometry(0.92, 0.3, 0.36);
                const tailStripe = new THREE.Mesh(tailStripeGeo, i % 2 === 0 ? scarfWhiteMat : scarfMat2);
                tailStripe.position.set(0, -0.5 - i * 0.8, 0);
                tailGroup.add(tailStripe);
            }
            
            // フリンジ（端の房）
            for (let i = -2; i <= 2; i++) {
                const fringeGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.5, 6);
                const fringe = new THREE.Mesh(fringeGeo, scarfMat1);
                fringe.position.set(i * 0.18, -3.2, 0);
                fringe.rotation.x = Math.random() * 0.3 - 0.15;
                tailGroup.add(fringe);
            }
            
            tailGroup.position.set(xOffset, 9.0, zOffset);
            tailGroup.rotation.z = rotZ;
            return tailGroup;
        };
        
        group.add(createScarfTail(2.0, 1.8, 0.35));
        group.add(createScarfTail(2.5, 1.2, 0.5));
        
        // 黒い縁取り
        this.addOutline(group, 1.05);

        group.position.set(x, 0, z);
        this.trackGroup.add(group);
        
        this.enemies.push({
            type: 'snowman',
            mesh: group,
            baseX: x,
            baseZ: z,
            patrolAxis: patrolAxis,
            patrolRange: patrolRange,
            speed: 0.6,
            direction: 1,
            radius: 4,
            index: index
        });
    }
    
    // === 新しい敵：氷のパッチ（スリップエリア） ===
    createIcePatch(x, z, index) {
        const iceGeo = new THREE.CircleGeometry(15, 32);
        const iceMat = new THREE.MeshStandardMaterial({
            color: 0xADD8E6,
            transparent: true,
            opacity: 0.5,
            roughness: 0.1,
            metalness: 0.3
        });
        const ice = new THREE.Mesh(iceGeo, iceMat);
        ice.rotation.x = -Math.PI / 2;
        ice.position.set(x, 0.1, z);
        this.trackGroup.add(ice);
        
        ice.userData.isIcePatch = true;
        ice.userData.position = { x, z };
        ice.userData.radius = 15;
    }
    
    // === 新しい敵：炎の柱 ===
    createFirePillar(x, z, index) {
        const group = new THREE.Group();
        
        // 基部
        const baseGeo = new THREE.CylinderGeometry(2, 2.5, 2, 16);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 1;
        group.add(base);
        
        // 炎（複数の円錐）
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xFF4500 });
        const flameInnerMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
        
        for (let i = 0; i < 3; i++) {
            const flameGeo = new THREE.ConeGeometry(1.5 - i * 0.3, 4 + i * 2, 8);
            const flame = new THREE.Mesh(flameGeo, i === 2 ? flameInnerMat : flameMat);
            flame.position.y = 4 + i * 2;
            group.add(flame);
        }
        
        // 点光源
        const light = new THREE.PointLight(0xFF4500, 1, 30);
        light.position.y = 6;
        group.add(light);
        
        group.position.set(x, 0, z);
        group.userData.baseHeight = 0;
        group.userData.activeHeight = 12;
        this.trackGroup.add(group);
        
        this.enemies.push({
            type: 'fire',
            mesh: group,
            baseX: x,
            baseZ: z,
            state: 'dormant',
            timer: index * 0.5,
            radius: 3,
            index: index
        });
    }
    
    // === ジュゲム（空中を飛ぶ雲に乗った敵） ===
    createLakitu(x, z, index) {
        const group = new THREE.Group();
        
        // === ジュゲム雲（マリオカート64風・表情豊かな雲） ===
        const cloudGroup = new THREE.Group();
        
        // 雲のマテリアル（ふわふわ感）
        const cloudMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF, 
            roughness: 0.95,
            emissive: 0x222222,
            emissiveIntensity: 0.1
        });
        const cloudShadowMat = new THREE.MeshStandardMaterial({ 
            color: 0xEEEEFF, 
            roughness: 0.9 
        });
        
        // 雲のメイン構造（より立体的に）
        const cloudParts = [
            { x: 0, y: 0, z: 0, r: 3.2, scale: [1, 0.85, 1] },
            { x: -2.8, y: 0.2, z: 0, r: 2.4, scale: [1, 0.9, 1] },
            { x: 2.8, y: 0.2, z: 0, r: 2.4, scale: [1, 0.9, 1] },
            { x: -1.5, y: 1.5, z: 0.3, r: 2.0, scale: [1, 0.95, 1] },
            { x: 1.5, y: 1.5, z: 0.3, r: 2.0, scale: [1, 0.95, 1] },
            { x: 0, y: 2.0, z: 0.2, r: 1.8, scale: [1.1, 0.85, 1] },
            { x: -2.0, y: -0.6, z: 0.6, r: 1.6, scale: [1, 0.8, 1] },
            { x: 2.0, y: -0.6, z: 0.6, r: 1.6, scale: [1, 0.8, 1] },
            { x: -3.5, y: -0.3, z: -0.3, r: 1.3, scale: [1, 0.85, 1] },
            { x: 3.5, y: -0.3, z: -0.3, r: 1.3, scale: [1, 0.85, 1] },
            { x: 0, y: -0.8, z: 0.8, r: 2.2, scale: [1.2, 0.7, 0.9] },
        ];
        cloudParts.forEach(part => {
            const cloudGeo = new THREE.SphereGeometry(part.r, 20, 16);
            const cloud = new THREE.Mesh(cloudGeo, cloudMat);
            cloud.position.set(part.x, part.y, part.z);
            cloud.scale.set(...part.scale);
            cloudGroup.add(cloud);
        });
        
        // 雲の底面（影）
        const cloudBottomGeo = new THREE.SphereGeometry(3.5, 16, 8, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
        const cloudBottom = new THREE.Mesh(cloudBottomGeo, cloudShadowMat);
        cloudBottom.position.set(0, -1.2, 0);
        cloudBottom.scale.set(1.3, 0.4, 1);
        cloudGroup.add(cloudBottom);
        
        // === 雲の顔（キノピオ雲風の愛らしい表情） ===
        // 目（大きくてキュート）
        const cloudEyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const cloudEyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        [-1.5, 1.5].forEach(xPos => {
            // 白目
            const eyeWhiteGeo = new THREE.SphereGeometry(0.55, 14, 14);
            const eyeWhite = new THREE.Mesh(eyeWhiteGeo, cloudEyeWhiteMat);
            eyeWhite.position.set(xPos, 0.4, 2.8);
            eyeWhite.scale.set(0.9, 1.1, 0.5);
            cloudGroup.add(eyeWhite);
            
            // 黒目
            const eyeGeo = new THREE.SphereGeometry(0.28, 12, 12);
            const eye = new THREE.Mesh(eyeGeo, cloudEyeMat);
            eye.position.set(xPos, 0.35, 3.05);
            cloudGroup.add(eye);
            
            // 目のハイライト
            const highlightGeo = new THREE.SphereGeometry(0.1, 8, 8);
            const highlightMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const highlight = new THREE.Mesh(highlightGeo, highlightMat);
            highlight.position.set(xPos + 0.1, 0.45, 3.15);
            cloudGroup.add(highlight);
        });
        
        // まぶた風の影
        [-1.5, 1.5].forEach(xPos => {
            const lidGeo = new THREE.CircleGeometry(0.4, 12, 0, Math.PI);
            const lidMat = new THREE.MeshBasicMaterial({ color: 0xDDDDEE, transparent: true, opacity: 0.6 });
            const lid = new THREE.Mesh(lidGeo, lidMat);
            lid.position.set(xPos, 0.75, 2.95);
            lid.rotation.x = 0.2;
            cloudGroup.add(lid);
        });
        
        // 雲のほっぺ（ピンクの丸）
        const cloudCheekMat = new THREE.MeshBasicMaterial({ 
            color: 0xFFAAAA, 
            transparent: true, 
            opacity: 0.5 
        });
        [-2.3, 2.3].forEach(xPos => {
            const cheekGeo = new THREE.CircleGeometry(0.5, 16);
            const cheek = new THREE.Mesh(cheekGeo, cloudCheekMat);
            cheek.position.set(xPos, 0.1, 2.6);
            cloudGroup.add(cheek);
        });
        
        // 雲の口（にっこり）
        const smileMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
        const smileGeo = new THREE.TorusGeometry(0.4, 0.08, 8, 16, Math.PI);
        const smile = new THREE.Mesh(smileGeo, smileMat);
        smile.position.set(0, -0.3, 2.9);
        smile.rotation.x = -0.2;
        cloudGroup.add(smile);
        
        group.add(cloudGroup);
        
        // === ジュゲム本体（マリオカート64風の詳細なノコノコ） ===
        const lakituGroup = new THREE.Group();
        
        // === 甲羅（緑・光沢のある六角形模様） ===
        const shellMat = new THREE.MeshStandardMaterial({ 
            color: 0x22BB22, 
            roughness: 0.3,
            metalness: 0.1
        });
        const shellGeo = new THREE.SphereGeometry(2.0, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const shell = new THREE.Mesh(shellGeo, shellMat);
        // ドームが上向き（回転なし）
        shell.position.y = 2.8;
        lakituGroup.add(shell);
        
        // 甲羅の底面
        const shellBtmGeo = new THREE.CircleGeometry(2.0, 24);
        const shellBtmMat2 = new THREE.MeshStandardMaterial({ color: 0xFFF8DC, roughness: 0.5 });
        const shellBtm = new THREE.Mesh(shellBtmGeo, shellBtmMat2);
        shellBtm.rotation.x = -Math.PI / 2;
        shellBtm.position.y = 2.81;
        lakituGroup.add(shellBtm);
        
        // 甲羅の白い縁
        const shellEdgeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFEE, roughness: 0.4 });
        const shellEdgeGeo = new THREE.TorusGeometry(1.95, 0.15, 10, 28);
        const shellEdge = new THREE.Mesh(shellEdgeGeo, shellEdgeMat);
        shellEdge.rotation.x = Math.PI / 2;
        shellEdge.position.y = 2.8;
        lakituGroup.add(shellEdge);
        
        // 甲羅の六角形模様（3層・黒い溝線付き）
        const lkHexLineMat = new THREE.MeshStandardMaterial({ color: 0x003300, roughness: 0.9 });
        const lkHexFillMat = new THREE.MeshStandardMaterial({ color: 0x33CC33, roughness: 0.3 });
        const lkHexDarkMat = new THREE.MeshStandardMaterial({ color: 0x118811, roughness: 0.35 });
        const lkR = 2.0;
        
        // 中央六角形
        (() => {
            const phi = 0.15;
            const nx = Math.sin(phi), ny = Math.cos(phi), nz = 0;
            const px = nx * lkR, py = ny * lkR + 2.8, pz = 0;
            const oGeo = new THREE.CircleGeometry(0.55, 6);
            const outline = new THREE.Mesh(oGeo, lkHexLineMat);
            outline.position.set(px, py + 0.01, pz);
            outline.lookAt(px + nx, py + ny + 0.01, pz + nz);
            lakituGroup.add(outline);
            const fGeo = new THREE.CircleGeometry(0.42, 6);
            const fill = new THREE.Mesh(fGeo, lkHexFillMat);
            fill.position.set(px, py + 0.02, pz);
            fill.lookAt(px + nx, py + ny + 0.02, pz + nz);
            lakituGroup.add(fill);
        })();
        
        // 内側リング（6個）
        for (let li = 0; li < 6; li++) {
            const theta = (li / 6) * Math.PI * 2;
            const phi = 0.45;
            const nx = Math.sin(phi) * Math.cos(theta);
            const ny = Math.cos(phi);
            const nz = Math.sin(phi) * Math.sin(theta);
            const px = nx * lkR, py = ny * lkR + 2.8, pz = nz * lkR;
            const oGeo = new THREE.CircleGeometry(0.42, 6);
            const outline = new THREE.Mesh(oGeo, lkHexLineMat);
            outline.position.set(px, py + 0.01, pz);
            outline.lookAt(px + nx, py + ny + 0.01, pz + nz);
            lakituGroup.add(outline);
            const fGeo = new THREE.CircleGeometry(0.32, 6);
            const fill = new THREE.Mesh(fGeo, li % 2 === 0 ? lkHexFillMat : lkHexDarkMat);
            fill.position.set(px, py + 0.02, pz);
            fill.lookAt(px + nx, py + ny + 0.02, pz + nz);
            lakituGroup.add(fill);
        }
        
        // 外側リング（10個）
        for (let li = 0; li < 10; li++) {
            const theta = (li / 10) * Math.PI * 2 + 0.3;
            const phi = 0.9;
            const nx = Math.sin(phi) * Math.cos(theta);
            const ny = Math.cos(phi);
            const nz = Math.sin(phi) * Math.sin(theta);
            const px = nx * lkR, py = ny * lkR + 2.8, pz = nz * lkR;
            const oGeo = new THREE.CircleGeometry(0.35, 6);
            const outline = new THREE.Mesh(oGeo, lkHexLineMat);
            outline.position.set(px, py + 0.01, pz);
            outline.lookAt(px + nx, py + ny + 0.01, pz + nz);
            lakituGroup.add(outline);
            const fGeo = new THREE.CircleGeometry(0.26, 6);
            const fill = new THREE.Mesh(fGeo, li % 3 === 0 ? lkHexDarkMat : lkHexFillMat);
            fill.position.set(px, py + 0.02, pz);
            fill.lookAt(px + nx, py + ny + 0.02, pz + nz);
            lakituGroup.add(fill);
        }
        
        // === 体（クリーム色のお腹） ===
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xFFF8DC, roughness: 0.5 });
        const bodyGeo = new THREE.SphereGeometry(1.5, 18, 18);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.set(0, 2.5, 0.6);
        body.scale.set(0.9, 0.85, 0.6);
        lakituGroup.add(body);
        
        // === 頭（黄色・マリオ風の丸い頭） ===
        const headGeo = new THREE.SphereGeometry(1.5, 24, 24);
        const headMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFDD00, 
            roughness: 0.4 
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 4.8;
        lakituGroup.add(head);
        
        // ほっぺ（ピンク）
        const cheekMat = new THREE.MeshBasicMaterial({ 
            color: 0xFFAAAA, 
            transparent: true, 
            opacity: 0.55 
        });
        [-1.0, 1.0].forEach(xPos => {
            const cheekGeo = new THREE.CircleGeometry(0.4, 16);
            const cheek = new THREE.Mesh(cheekGeo, cheekMat);
            cheek.position.set(xPos, 4.5, 1.35);
            lakituGroup.add(cheek);
        });
        
        // === メガネ（ジュゲム特有のゴーグル風メガネ） ===
        const glassesMat = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a, 
            metalness: 0.7, 
            roughness: 0.2 
        });
        const glassLensMat = new THREE.MeshStandardMaterial({ 
            color: 0x6699FF, 
            transparent: true, 
            opacity: 0.5,
            roughness: 0.1,
            metalness: 0.3
        });
        
        // メガネフレーム
        [-0.6, 0.6].forEach(xPos => {
            // 丸いフレーム
            const frameGeo = new THREE.TorusGeometry(0.6, 0.12, 12, 24);
            const frame = new THREE.Mesh(frameGeo, glassesMat);
            frame.position.set(xPos, 5.0, 1.25);
            lakituGroup.add(frame);
            
            // レンズ
            const lensGeo = new THREE.CircleGeometry(0.55, 20);
            const lens = new THREE.Mesh(lensGeo, glassLensMat);
            lens.position.set(xPos, 5.0, 1.3);
            lakituGroup.add(lens);
            
            // レンズのハイライト
            const lensHighlightGeo = new THREE.CircleGeometry(0.2, 12);
            const lensHighlightMat = new THREE.MeshBasicMaterial({ 
                color: 0xFFFFFF, 
                transparent: true, 
                opacity: 0.4 
            });
            const lensHighlight = new THREE.Mesh(lensHighlightGeo, lensHighlightMat);
            lensHighlight.position.set(xPos - 0.15, 5.15, 1.32);
            lakituGroup.add(lensHighlight);
        });
        
        // ブリッジ（鼻当て）
        const bridgeGeo = new THREE.BoxGeometry(0.5, 0.12, 0.18);
        const bridge = new THREE.Mesh(bridgeGeo, glassesMat);
        bridge.position.set(0, 5.0, 1.2);
        lakituGroup.add(bridge);
        
        // テンプル（つる）
        [-1.05, 1.05].forEach(xPos => {
            const templeGeo = new THREE.BoxGeometry(0.1, 0.1, 1.1);
            const temple = new THREE.Mesh(templeGeo, glassesMat);
            temple.position.set(xPos, 5.1, 0.7);
            lakituGroup.add(temple);
        });
        
        // 目（メガネの奥に小さく見える）
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        [-0.55, 0.55].forEach(xPos => {
            const eyeGeo = new THREE.SphereGeometry(0.2, 12, 12);
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(xPos, 4.95, 1.35);
            lakituGroup.add(eye);
        });
        
        // === 髪の毛（3本のツンツン髪） ===
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
        for (let i = -1; i <= 1; i++) {
            const hairGeo = new THREE.ConeGeometry(0.12, 1.0, 8);
            const hair = new THREE.Mesh(hairGeo, hairMat);
            hair.position.set(i * 0.45, 6.2, 0);
            hair.rotation.z = i * 0.25;
            lakituGroup.add(hair);
        }
        
        // === 口（にっこり） ===
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x331111 });
        const mouthGeo = new THREE.TorusGeometry(0.25, 0.06, 8, 12, Math.PI);
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, 4.25, 1.4);
        mouth.rotation.x = -0.1;
        lakituGroup.add(mouth);
        
        // === 釣り竿（パイポを落とすための棒） ===
        const rodMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 });
        const rodGeo = new THREE.CylinderGeometry(0.08, 0.1, 3.5, 8);
        const rod = new THREE.Mesh(rodGeo, rodMat);
        rod.position.set(0.8, 3.5, 1.5);
        rod.rotation.x = 0.4;
        rod.rotation.z = -0.3;
        lakituGroup.add(rod);
        
        // 釣り糸
        const lineMat = new THREE.LineBasicMaterial({ color: 0x888888 });
        const linePoints = [
            new THREE.Vector3(0.4, 2.0, 2.8),
            new THREE.Vector3(0.3, 1.0, 2.5),
            new THREE.Vector3(0, 0.3, 2.2)
        ];
        const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
        const line = new THREE.Line(lineGeo, lineMat);
        lakituGroup.add(line);
        
        // === パイポ（トゲゾー - 赤い甲羅にトゲ） ===
        const spinyGroup = new THREE.Group();
        
        // パイポの甲羅（赤・光沢）
        const spinyShellMat = new THREE.MeshStandardMaterial({ 
            color: 0xDD2222, 
            roughness: 0.25,
            metalness: 0.15
        });
        const spinyShellGeo = new THREE.SphereGeometry(1.0, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const spinyShell = new THREE.Mesh(spinyShellGeo, spinyShellMat);
        // ドームが上向き（回転なし）
        spinyGroup.add(spinyShell);
        
        // パイポの甲羅底面
        const spinyBtmGeo = new THREE.CircleGeometry(1.0, 18);
        const spinyBtmMat = new THREE.MeshStandardMaterial({ color: 0xFFEECC, roughness: 0.5 });
        const spinyBtm = new THREE.Mesh(spinyBtmGeo, spinyBtmMat);
        spinyBtm.rotation.x = -Math.PI / 2;
        spinyBtm.position.y = 0.01;
        spinyGroup.add(spinyBtm);
        
        // パイポの六角形パターン（黒い溝線 + 赤セル）
        const spinyHexLineMat = new THREE.MeshStandardMaterial({ color: 0x660000, roughness: 0.9 });
        const spinyHexFillMat = new THREE.MeshStandardMaterial({ color: 0xFF4444, roughness: 0.3 });
        const spinyHexDarkMat = new THREE.MeshStandardMaterial({ color: 0xBB1111, roughness: 0.35 });
        const sR = 1.0;
        
        // 中央六角形
        (() => {
            const phi = 0.2;
            const nx = Math.sin(phi), ny = Math.cos(phi), nz = 0;
            const px = nx * sR, py = ny * sR, pz = 0;
            const oGeo = new THREE.CircleGeometry(0.32, 6);
            const outline = new THREE.Mesh(oGeo, spinyHexLineMat);
            outline.position.set(px, py + 0.01, pz);
            outline.lookAt(px + nx, py + ny + 0.01, pz + nz);
            spinyGroup.add(outline);
            const fGeo = new THREE.CircleGeometry(0.24, 6);
            const fill = new THREE.Mesh(fGeo, spinyHexFillMat);
            fill.position.set(px, py + 0.02, pz);
            fill.lookAt(px + nx, py + ny + 0.02, pz + nz);
            spinyGroup.add(fill);
        })();
        
        // 内側リング（6個）
        for (let si = 0; si < 6; si++) {
            const theta = (si / 6) * Math.PI * 2;
            const phi = 0.55;
            const nx = Math.sin(phi) * Math.cos(theta);
            const ny = Math.cos(phi);
            const nz = Math.sin(phi) * Math.sin(theta);
            const px = nx * sR, py = ny * sR, pz = nz * sR;
            const oGeo = new THREE.CircleGeometry(0.26, 6);
            const outline = new THREE.Mesh(oGeo, spinyHexLineMat);
            outline.position.set(px, py + 0.01, pz);
            outline.lookAt(px + nx, py + ny + 0.01, pz + nz);
            spinyGroup.add(outline);
            const fGeo = new THREE.CircleGeometry(0.19, 6);
            const fill = new THREE.Mesh(fGeo, si % 2 === 0 ? spinyHexFillMat : spinyHexDarkMat);
            fill.position.set(px, py + 0.02, pz);
            fill.lookAt(px + nx, py + ny + 0.02, pz + nz);
            spinyGroup.add(fill);
        }
        
        // 外側リング（10個）
        for (let si = 0; si < 10; si++) {
            const theta = (si / 10) * Math.PI * 2 + 0.3;
            const phi = 1.05;
            const nx = Math.sin(phi) * Math.cos(theta);
            const ny = Math.cos(phi);
            const nz = Math.sin(phi) * Math.sin(theta);
            const px = nx * sR, py = ny * sR, pz = nz * sR;
            const oGeo = new THREE.CircleGeometry(0.22, 6);
            const outline = new THREE.Mesh(oGeo, spinyHexLineMat);
            outline.position.set(px, py + 0.01, pz);
            outline.lookAt(px + nx, py + ny + 0.01, pz + nz);
            spinyGroup.add(outline);
            const fGeo = new THREE.CircleGeometry(0.16, 6);
            const fill = new THREE.Mesh(fGeo, si % 3 === 0 ? spinyHexDarkMat : spinyHexFillMat);
            fill.position.set(px, py + 0.02, pz);
            fill.lookAt(px + nx, py + ny + 0.02, pz + nz);
            spinyGroup.add(fill);
        }
        
        // パイポの白い縁
        const spinyEdgeGeo = new THREE.TorusGeometry(0.95, 0.1, 8, 20);
        const spinyEdgeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.4 });
        const spinyEdge = new THREE.Mesh(spinyEdgeGeo, spinyEdgeMat);
        spinyEdge.rotation.x = Math.PI / 2;
        spinyGroup.add(spinyEdge);
        
        // パイポのトゲ（大きく鋭い）
        const spikeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.3 });
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const spikeGeo = new THREE.ConeGeometry(0.18, 0.7, 8);
            const spike = new THREE.Mesh(spikeGeo, spikeMat);
            spike.position.set(
                Math.sin(angle) * 0.65,
                0.5,
                Math.cos(angle) * 0.65
            );
            spike.rotation.x = -Math.PI * 0.25;
            spike.rotation.z = Math.sin(angle) * 0.4;
            spinyGroup.add(spike);
        }
        // 頂上のトゲ
        const topSpikeGeo = new THREE.ConeGeometry(0.2, 0.8, 8);
        const topSpike = new THREE.Mesh(topSpikeGeo, spikeMat);
        topSpike.position.set(0, 0.9, 0);
        spinyGroup.add(topSpike);
        
        // パイポの顔（お腹側）
        const spinyFaceMat = new THREE.MeshStandardMaterial({ color: 0xFFEECC, roughness: 0.5 });
        const spinyFaceGeo = new THREE.SphereGeometry(0.6, 14, 14);
        const spinyFace = new THREE.Mesh(spinyFaceGeo, spinyFaceMat);
        spinyFace.position.set(0, -0.3, 0.5);
        spinyFace.scale.set(1, 0.7, 0.5);
        spinyGroup.add(spinyFace);
        
        // パイポの目
        const spinyEyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        [-0.2, 0.2].forEach(xPos => {
            const spinyEyeGeo = new THREE.SphereGeometry(0.12, 10, 10);
            const spinyEye = new THREE.Mesh(spinyEyeGeo, spinyEyeMat);
            spinyEye.position.set(xPos, -0.15, 0.8);
            spinyGroup.add(spinyEye);
        });
        
        spinyGroup.position.set(0, -0.5, 2.2);
        spinyGroup.scale.set(0.9, 0.9, 0.9);
        lakituGroup.add(spinyGroup);
        
        lakituGroup.position.y = 2.5;
        group.add(lakituGroup);
        
        // 黒い縁取り
        this.addOutline(group, 1.05);

        group.position.set(x, 25, z);
        this.trackGroup.add(group);
        
        this.enemies.push({
            type: 'lakitu',
            mesh: group,
            baseX: x,
            baseZ: z,
            baseY: 25,
            trackIndex: -1,       // トラックポイントのインデックス（-1で初期化待ち）
            angle: 0,
            speed: 50,            // 移動速度（units/sec）
            radius: 4,
            index: index,
            throwTimer: 8,        // 次の亀投下までの時間
            throwInterval: 12,    // 投下間隔（秒）
            thrownTurtles: []     // 投げた亀のリスト
        });
    }
    
    // === ドカン（ワープパイプ - 装飾用） ===
    createWarpPipe(x, z, index) {
        const group = new THREE.Group();
        
        // パイプ本体
        const pipeGeo = new THREE.CylinderGeometry(4, 4, 8, 24);
        const pipeMat = new THREE.MeshStandardMaterial({
            color: 0x228B22,
            roughness: 0.4,
            metalness: 0.2
        });
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pipe.position.y = 4;
        group.add(pipe);
        
        // パイプのリム（上部）
        const rimGeo = new THREE.TorusGeometry(4.3, 0.6, 12, 24);
        const rim = new THREE.Mesh(rimGeo, pipeMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 8;
        group.add(rim);
        
        // パイプの内側（暗い）
        const innerGeo = new THREE.CircleGeometry(3.5, 24);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        inner.rotation.x = -Math.PI / 2;
        inner.position.y = 8.1;
        group.add(inner);
        
        // 光沢ハイライト
        const highlightGeo = new THREE.BoxGeometry(0.3, 6, 0.1);
        const highlightMat = new THREE.MeshBasicMaterial({ color: 0x44DD44, transparent: true, opacity: 0.5 });
        const highlight = new THREE.Mesh(highlightGeo, highlightMat);
        highlight.position.set(3, 4, 0);
        group.add(highlight);
        
        group.position.set(x, 0, z);
        group.userData.isCollidable = true;
        group.userData.wallType = 'pipe';
        this.trackGroup.add(group);
        this.collidableObjects.push(group);
    }
    
    // === カロン（ガイコツノコノコ） ===
    // カロン作成（Super Mario風 - Dry Bones）
    createDryBones(x, z, patrolAxis, patrolRange, index) {
        const group = new THREE.Group();
        
        // === マテリアル（マリオ公式カラー準拠） ===
        const boneMat = new THREE.MeshStandardMaterial({ 
            color: 0xF5F0E0,  // 明るいクリーム白の骨
            roughness: 0.55,
            metalness: 0.08
        });
        const boneHighlightMat = new THREE.MeshStandardMaterial({
            color: 0xFFFBEE,  // ハイライト用白
            roughness: 0.4,
            metalness: 0.1
        });
        const boneShadowMat = new THREE.MeshStandardMaterial({
            color: 0xD8D0BB,  // 少し暗めの骨
            roughness: 0.65
        });
        const shellMat = new THREE.MeshStandardMaterial({ 
            color: 0x808878,  // 灰緑の甲羅（マリオ風カロン甲羅色）
            roughness: 0.6,
            metalness: 0.1
        });
        const shellDarkMat = new THREE.MeshStandardMaterial({ 
            color: 0x5A6058,  // 甲羅の溝
            roughness: 0.7
        });
        const shellRimMat = new THREE.MeshStandardMaterial({
            color: 0xE8E0CC,
            roughness: 0.45
        });
        
        // === 甲羅（マリオ風ノコノコの甲羅、ボロボロ感あり） ===
        const shellGroup = new THREE.Group();
        
        // 甲羅本体（ドーム型 - 上向き）
        const shellGeo = new THREE.SphereGeometry(2.4, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
        const shell = new THREE.Mesh(shellGeo, shellMat);
        // ドームが上向き（回転なし）
        shell.position.y = 0;
        shellGroup.add(shell);
        
        // 甲羅の底面（白い腹部分）
        const shellBtmGeo = new THREE.CircleGeometry(2.35, 24);
        const shellBtm = new THREE.Mesh(shellBtmGeo, boneHighlightMat);
        shellBtm.rotation.x = -Math.PI / 2;
        shellBtm.position.y = 0.01;
        shellGroup.add(shellBtm);
        
        // 甲羅の六角形パターン（3層・黒い溝線付き）
        const hexLineMat = new THREE.MeshStandardMaterial({ color: 0x2A2E28, roughness: 0.9 }); // 黒い溝
        const hexFillMat = new THREE.MeshStandardMaterial({ color: 0x8A9080, roughness: 0.55 }); // 明るいセル
        const hexCrackMat = new THREE.MeshStandardMaterial({ color: 0x6A7068, roughness: 0.65 }); // 暗めセル
        const R = 2.4;
        
        // 中央の大きな六角形
        (() => {
            const phi = 0.15;
            const theta = 0;
            const nx = Math.sin(phi) * Math.cos(theta);
            const ny = Math.cos(phi);
            const nz = Math.sin(phi) * Math.sin(theta);
            const px = nx * R, py = ny * R, pz = nz * R;
            // 溝線（アウトライン）
            const oGeo = new THREE.CircleGeometry(0.72, 6);
            const outline = new THREE.Mesh(oGeo, hexLineMat);
            outline.position.set(px, py + 0.01, pz);
            outline.lookAt(px + nx, py + ny + 0.01, pz + nz);
            shellGroup.add(outline);
            // 塗りつぶし
            const fGeo = new THREE.CircleGeometry(0.58, 6);
            const fill = new THREE.Mesh(fGeo, hexFillMat);
            fill.position.set(px, py + 0.02, pz);
            fill.lookAt(px + nx, py + ny + 0.02, pz + nz);
            shellGroup.add(fill);
        })();
        
        // 内側リング（6つ）
        for (let i = 0; i < 6; i++) {
            const theta = (i / 6) * Math.PI * 2;
            const phi = 0.45;
            const nx = Math.sin(phi) * Math.cos(theta);
            const ny = Math.cos(phi);
            const nz = Math.sin(phi) * Math.sin(theta);
            const px = nx * R, py = ny * R, pz = nz * R;
            const oGeo = new THREE.CircleGeometry(0.55, 6);
            const outline = new THREE.Mesh(oGeo, hexLineMat);
            outline.position.set(px, py + 0.01, pz);
            outline.lookAt(px + nx, py + ny + 0.01, pz + nz);
            shellGroup.add(outline);
            const fGeo = new THREE.CircleGeometry(0.42, 6);
            const fill = new THREE.Mesh(fGeo, i % 2 === 0 ? hexFillMat : hexCrackMat);
            fill.position.set(px, py + 0.02, pz);
            fill.lookAt(px + nx, py + ny + 0.02, pz + nz);
            shellGroup.add(fill);
        }
        
        // 外側リング（12個）
        for (let i = 0; i < 12; i++) {
            const theta = (i / 12) * Math.PI * 2 + 0.26;
            const phi = 0.85;
            const nx = Math.sin(phi) * Math.cos(theta);
            const ny = Math.cos(phi);
            const nz = Math.sin(phi) * Math.sin(theta);
            const px = nx * R, py = ny * R, pz = nz * R;
            const oGeo = new THREE.CircleGeometry(0.48, 6);
            const outline = new THREE.Mesh(oGeo, hexLineMat);
            outline.position.set(px, py + 0.01, pz);
            outline.lookAt(px + nx, py + ny + 0.01, pz + nz);
            shellGroup.add(outline);
            const fGeo = new THREE.CircleGeometry(0.35, 6);
            const fill = new THREE.Mesh(fGeo, i % 3 === 0 ? hexCrackMat : hexFillMat);
            fill.position.set(px, py + 0.02, pz);
            fill.lookAt(px + nx, py + ny + 0.02, pz + nz);
            shellGroup.add(fill);
        }
        
        // 甲羅の稜線（六角形セル間の溝を強調）
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const ridgeGeo = new THREE.BoxGeometry(0.05, 0.03, 1.8);
            const ridge = new THREE.Mesh(ridgeGeo, hexLineMat);
            ridge.position.set(Math.sin(angle) * 0.9, 1.0, Math.cos(angle) * 0.9);
            ridge.rotation.y = angle;
            ridge.rotation.x = -0.55;
            shellGroup.add(ridge);
        }
        
        // 甲羅の縁取り（白い骨のリム）
        const shellRimGeo = new THREE.TorusGeometry(2.35, 0.18, 10, 28);
        const shellRim = new THREE.Mesh(shellRimGeo, shellRimMat);
        shellRim.rotation.x = Math.PI / 2;
        shellRim.position.y = 0;
        shellGroup.add(shellRim);
        
        // 甲羅のひび割れ（カロンらしさ）
        for (let i = 0; i < 4; i++) {
            const crackGeo = new THREE.BoxGeometry(0.06, 0.03, 1.0 + Math.random() * 0.8);
            const crackMat = new THREE.MeshStandardMaterial({ color: 0x3A3A35, roughness: 0.9 });
            const crack = new THREE.Mesh(crackGeo, crackMat);
            const angle = (i / 4) * Math.PI * 2 + 0.3;
            crack.position.set(Math.sin(angle) * 0.8, 0.4, Math.cos(angle) * 0.8);
            crack.rotation.y = angle;
            crack.rotation.x = -0.5;
            shellGroup.add(crack);
        }
        
        // 甲羅のスパイク（4本、マリオ風のトゲ付き甲羅）
        const spikeMat = new THREE.MeshStandardMaterial({ color: 0xF5F0E0, roughness: 0.5 });
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
            const spikeGeo = new THREE.ConeGeometry(0.22, 0.8, 8);
            const spike = new THREE.Mesh(spikeGeo, spikeMat);
            spike.position.set(
                Math.sin(angle) * 1.4,
                0.6,
                Math.cos(angle) * 1.4
            );
            spike.rotation.x = 0;
            shellGroup.add(spike);
        }
        
        shellGroup.position.y = 2.8;
        group.add(shellGroup);
        
        // === 胴体（肋骨と背骨） ===
        const bodyGroup = new THREE.Group();
        
        // 背骨
        for (let i = 0; i < 5; i++) {
            const vertGeo = new THREE.SphereGeometry(0.2, 8, 8);
            const vert = new THREE.Mesh(vertGeo, boneMat);
            vert.position.set(0, i * 0.38, -0.15);
            vert.scale.set(0.9, 1.4, 0.9);
            bodyGroup.add(vert);
        }
        
        // 肋骨（左右対称のアーチ）
        for (let i = 0; i < 4; i++) {
            const y = 0.3 + i * 0.4;
            const ribRadius = 0.95 - i * 0.08;
            // 左右の肋骨
            [-1, 1].forEach(side => {
                const ribGeo = new THREE.TorusGeometry(ribRadius, 0.1, 6, 12, Math.PI * 0.45);
                const rib = new THREE.Mesh(ribGeo, boneMat);
                rib.position.set(side * 0.1, y, 0.3);
                rib.rotation.set(Math.PI / 2, 0, side * -0.3);
                bodyGroup.add(rib);
            });
        }
        
        // 骨盤
        const pelvisGeo = new THREE.TorusGeometry(1.2, 0.18, 8, 20);
        const pelvis = new THREE.Mesh(pelvisGeo, boneShadowMat);
        pelvis.rotation.x = Math.PI / 2;
        pelvis.position.set(0, 0.1, 0.15);
        bodyGroup.add(pelvis);
        
        bodyGroup.position.y = 1.0;
        group.add(bodyGroup);
        
        // === 尻尾（カロンの小さなしっぽ骨） ===
        for (let i = 0; i < 5; i++) {
            const tailGeo = new THREE.SphereGeometry(0.14 - i * 0.02, 8, 8);
            const tail = new THREE.Mesh(tailGeo, boneMat);
            const curve = i * 0.12;
            tail.position.set(0, 1.0 - i * 0.15 - curve, -0.9 - i * 0.32);
            group.add(tail);
        }

        // === 頭蓋骨（マリオ風カロン - 丸くて可愛い頭蓋骨） ===
        const skullGroup = new THREE.Group();
        
        // 頭蓋骨本体（マリオ風の丸い頭）
        const skullGeo = new THREE.SphereGeometry(1.4, 20, 20);
        const skull = new THREE.Mesh(skullGeo, boneMat);
        skull.scale.set(1.05, 0.95, 1.0);
        skullGroup.add(skull);
        
        // 頭頂部のハイライト
        const skullTopGeo = new THREE.SphereGeometry(0.5, 12, 12);
        const skullTop = new THREE.Mesh(skullTopGeo, boneHighlightMat);
        skullTop.position.set(0.2, 0.6, 0.2);
        skullTop.scale.set(1.5, 0.6, 1);
        skullGroup.add(skullTop);
        
        // くちばし/マズル（カロンのノコノコ的な口元）
        const muzzleGeo = new THREE.SphereGeometry(0.75, 14, 14);
        const muzzle = new THREE.Mesh(muzzleGeo, boneMat);
        muzzle.position.set(0, -0.15, 1.0);
        muzzle.scale.set(1.1, 0.7, 0.9);
        skullGroup.add(muzzle);
        
        // 下顎（開閉アニメーション用に別グループ）
        const jawGroup = new THREE.Group();
        const jawGeo = new THREE.SphereGeometry(0.6, 12, 12, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65);
        const jaw = new THREE.Mesh(jawGeo, boneShadowMat);
        jaw.position.set(0, -0.1, 0.2);
        jaw.scale.set(1.3, 0.6, 1.1);
        jawGroup.add(jaw);
        jawGroup.position.set(0, -0.65, 0.3);
        skullGroup.add(jawGroup);
        
        // 目のソケット（大きな黒い空洞 - カロンの特徴）
        const eyeHoleMat = new THREE.MeshBasicMaterial({ color: 0x0A0A0A });
        [-0.5, 0.5].forEach(xPos => {
            // 外側の穴
            const socketOuterGeo = new THREE.CircleGeometry(0.42, 16);
            const socketOuter = new THREE.Mesh(socketOuterGeo, eyeHoleMat);
            socketOuter.position.set(xPos, 0.25, 1.2);
            skullGroup.add(socketOuter);
            
            // 奥行きのある穴
            const socketDepthGeo = new THREE.CylinderGeometry(0.3, 0.38, 0.5, 14);
            const socketDepth = new THREE.Mesh(socketDepthGeo, eyeHoleMat);
            socketDepth.position.set(xPos, 0.22, 0.95);
            socketDepth.rotation.x = Math.PI / 2;
            skullGroup.add(socketDepth);
        });
        
        // 鼻孔（逆三角形の穴）
        const noseGeo = new THREE.CircleGeometry(0.15, 3);
        const nose = new THREE.Mesh(noseGeo, eyeHoleMat);
        nose.position.set(0, -0.05, 1.35);
        nose.rotation.z = Math.PI;
        skullGroup.add(nose);
        
        // 目（不気味に光る青白い炎 - マリオ風カロンの特徴）
        const eyeMat = new THREE.MeshStandardMaterial({ 
            color: 0x88CCFF,
            emissive: 0x4488FF,
            emissiveIntensity: 1.0
        });
        [-0.5, 0.5].forEach(xPos => {
            const eyeGeo = new THREE.SphereGeometry(0.22, 12, 12);
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(xPos, 0.28, 1.22);
            eye.userData.isEye = true;
            skullGroup.add(eye);
            
            // 瞳（小さな白い点）
            const pupilGeo = new THREE.SphereGeometry(0.08, 8, 8);
            const pupilMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const pupil = new THREE.Mesh(pupilGeo, pupilMat);
            pupil.position.set(xPos, 0.3, 1.38);
            skullGroup.add(pupil);
        });
        
        // 目の上の青い炎エフェクト（カロン特有の幽霊感）
        [-0.5, 0.5].forEach(xPos => {
            const flameGeo = new THREE.ConeGeometry(0.18, 0.5, 8);
            const flameMat = new THREE.MeshStandardMaterial({
                color: 0x6699FF,
                emissive: 0x3366CC,
                emissiveIntensity: 0.8,
                transparent: true,
                opacity: 0.7
            });
            const flame = new THREE.Mesh(flameGeo, flameMat);
            flame.position.set(xPos, 0.75, 1.15);
            flame.userData.isFlame = true;
            skullGroup.add(flame);
        });
        
        // 歯（上下にギザギザの骨歯）
        for (let i = -3; i <= 3; i++) {
            // 上の歯
            const topToothGeo = new THREE.ConeGeometry(0.07, 0.2, 5);
            const topTooth = new THREE.Mesh(topToothGeo, boneHighlightMat);
            topTooth.position.set(i * 0.16, -0.35, 1.4);
            topTooth.rotation.x = Math.PI;
            skullGroup.add(topTooth);
            // 下の歯
            if (i % 2 === 0) {
                const bottomToothGeo = new THREE.ConeGeometry(0.06, 0.18, 5);
                const bottomTooth = new THREE.Mesh(bottomToothGeo, boneHighlightMat);
                bottomTooth.position.set(i * 0.16, -0.55, 1.38);
                skullGroup.add(bottomTooth);
            }
        }
        
        // 怒り眉（骨でできた太い眉）
        [-0.5, 0.5].forEach(xPos => {
            const browGeo = new THREE.BoxGeometry(0.65, 0.18, 0.18);
            const brow = new THREE.Mesh(browGeo, boneShadowMat);
            brow.position.set(xPos, 0.72, 1.15);
            brow.rotation.z = xPos > 0 ? 0.35 : -0.35;
            skullGroup.add(brow);
        });
        
        // 頭蓋骨のひび割れ
        const skullCrackGeo = new THREE.BoxGeometry(0.04, 0.6, 0.04);
        const skullCrackMat = new THREE.MeshStandardMaterial({ color: 0x999080, roughness: 0.9 });
        const skullCrack = new THREE.Mesh(skullCrackGeo, skullCrackMat);
        skullCrack.position.set(0.7, 0.5, 0.6);
        skullCrack.rotation.z = 0.3;
        skullGroup.add(skullCrack);

        skullGroup.position.set(0, 3.8, 0.5);
        group.add(skullGroup);
        
        // === 足の骨（マリオ風にデフォルメ） ===
        const createBoneLeg = (xPos) => {
            const legGroup = new THREE.Group();
            legGroup.userData.isLeg = true;
            
            // 大腿骨（太め）
            const thighGeo = new THREE.CylinderGeometry(0.22, 0.28, 1.4, 8);
            const thigh = new THREE.Mesh(thighGeo, boneMat);
            thigh.position.y = 0.7;
            legGroup.add(thigh);
            
            // 膝関節（球）
            const kneeGeo = new THREE.SphereGeometry(0.28, 10, 10);
            const knee = new THREE.Mesh(kneeGeo, boneHighlightMat);
            knee.position.y = 0;
            legGroup.add(knee);
            
            // すね骨
            const shinGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.1, 8);
            const shin = new THREE.Mesh(shinGeo, boneMat);
            shin.position.set(0, -0.55, 0.25);
            shin.rotation.x = -0.35;
            legGroup.add(shin);
            
            // 足の骨（ノコノコ風の丸い靴型）
            const footGeo = new THREE.SphereGeometry(0.4, 10, 10);
            const foot = new THREE.Mesh(footGeo, boneShadowMat);
            foot.position.set(0, -1.05, 0.55);
            foot.scale.set(0.8, 0.5, 1.3);
            legGroup.add(foot);
            
            legGroup.position.set(xPos, 1.3, 0.25);
            return legGroup;
        };
        
        const leftLeg = createBoneLeg(-1.0);
        const rightLeg = createBoneLeg(1.0);
        group.add(leftLeg);
        group.add(rightLeg);
        
        // === 腕の骨（前に突き出したゾンビポーズ） ===
        const createBoneArm = (xPos, side) => {
            const armGroup = new THREE.Group();
            armGroup.userData.isArm = true;
            
            // 肩の球関節
            const shoulderGeo = new THREE.SphereGeometry(0.22, 8, 8);
            const shoulder = new THREE.Mesh(shoulderGeo, boneHighlightMat);
            armGroup.add(shoulder);
            
            // 上腕骨
            const upperArmGeo = new THREE.CylinderGeometry(0.14, 0.18, 1.1, 8);
            const upperArm = new THREE.Mesh(upperArmGeo, boneMat);
            upperArm.position.set(side * 0.5, 0, 0.2);
            upperArm.rotation.z = side * 0.8;
            upperArm.rotation.x = -0.3;
            armGroup.add(upperArm);
            
            // 肘関節
            const elbowGeo = new THREE.SphereGeometry(0.18, 8, 8);
            const elbow = new THREE.Mesh(elbowGeo, boneHighlightMat);
            elbow.position.set(side * 0.9, -0.15, 0.4);
            armGroup.add(elbow);
            
            // 前腕骨
            const forearmGeo = new THREE.CylinderGeometry(0.11, 0.14, 0.9, 8);
            const forearm = new THREE.Mesh(forearmGeo, boneMat);
            forearm.position.set(side * 0.9, -0.4, 0.8);
            forearm.rotation.x = 0.9;
            armGroup.add(forearm);
            
            // 手の骨（3本指 - マリオキャラ風）
            const handBase = new THREE.Group();
            for (let f = -1; f <= 1; f++) {
                const fingerGeo = new THREE.CylinderGeometry(0.04, 0.06, 0.3, 6);
                const finger = new THREE.Mesh(fingerGeo, boneMat);
                finger.position.set(f * 0.1, 0, 0.1);
                finger.rotation.x = 0.5;
                handBase.add(finger);
            }
            handBase.position.set(side * 0.95, -0.55, 1.2);
            armGroup.add(handBase);
            
            armGroup.position.set(xPos, 2.6, 0.4);
            return armGroup;
        };
        
        const leftArm = createBoneArm(-1.7, -1);
        const rightArm = createBoneArm(1.7, 1);
        group.add(leftArm);
        group.add(rightArm);
        
        // ゴースト的な青い光（足元）
        const ghostLight = new THREE.PointLight(0x4488FF, 0.6, 12);
        ghostLight.position.set(0, 0.5, 0);
        group.add(ghostLight);

        // 黒い縁取り（マリオ風）
        this.addOutline(group, 1.06);

        group.position.set(x, 1.2, z);
        group.scale.set(1.5, 1.5, 1.5);
        this.trackGroup.add(group);
        
        this.enemies.push({
            type: 'dry_bones',
            mesh: group,
            skullGroup: skullGroup,
            leftArm: leftArm,
            rightArm: rightArm,
            leftLeg: leftLeg,
            rightLeg: rightLeg,
            baseX: x,
            baseZ: z,
            patrolAxis: patrolAxis,
            patrolRange: patrolRange,
            direction: 1,
            speed: 12,
            radius: 4,
            index: index,
            state: 'patrol',
            cooldownTimer: 0,
            cooldownDuration: 5.0,  // クラッシュ後5秒間は追跡しない
            wanderAngle: Math.random() * Math.PI * 2,
            wanderChangeTimer: 0
        });
    }
    
    // === ファイアバー（完全な縦回転 - コースを横切って下を通過可能） ===
    createFireBar(x, z, index) {
        const group = new THREE.Group();
        
        // 中央の支柱（回転軸）
        const pillarGeo = new THREE.CylinderGeometry(1.2, 1.5, 6, 8);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.7, metalness: 0.3 });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.y = 3;
        group.add(pillar);
        
        // 回転する炎のバー（グループ）
        const fireBarGroup = new THREE.Group();
        
        // バーの長さ（片方だけ伸びる1本バー）
        const barLength = 30;
        const numFireBalls = 10;
        
        for (let i = 0; i < numFireBalls; i++) {
            // 中心から片方向のみに配置（1本バー）
            const distance = ((i + 1) / numFireBalls) * barLength;
            
            // 外側の炎（先端に行くほど少し大きく）
            const scale = 0.9 + (i / numFireBalls) * 0.4;
            const fireGeo = new THREE.SphereGeometry(1.2 * scale, 12, 12);
            const fireMat = new THREE.MeshBasicMaterial({ color: 0xFF4500 });
            const fire = new THREE.Mesh(fireGeo, fireMat);
            fire.position.x = distance;
            fireBarGroup.add(fire);
            
            // 内側の明るい炎
            const innerGeo = new THREE.SphereGeometry(0.6 * scale, 8, 8);
            const innerMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
            const inner = new THREE.Mesh(innerGeo, innerMat);
            inner.position.x = distance;
            fireBarGroup.add(inner);
        }
        
        // 炎のバーは支柱の中心から回転
        fireBarGroup.position.y = 0;
        group.add(fireBarGroup);

        // コースに対して直角になるように向きを自動補正
        let barYaw = 0;
        const boundary = (this.outerBoundary && this.outerBoundary.length > 1)
            ? this.outerBoundary
            : this.innerBoundary;
        if (boundary && boundary.length > 1) {
            let nearestIndex = 0;
            let minDistSq = Infinity;
            for (let i = 0; i < boundary.length; i += 5) {
                const dx = boundary[i].x - x;
                const dz = boundary[i].z - z;
                const distSq = dx * dx + dz * dz;
                if (distSq < minDistSq) {
                    minDistSq = distSq;
                    nearestIndex = i;
                }
            }
            const nextIndex = Math.min(nearestIndex + 5, boundary.length - 1);
            const curr = boundary[nearestIndex];
            const next = boundary[nextIndex];
            if (curr && next) {
                const dx = next.x - curr.x;
                const dz = next.z - curr.z;
                if (dx * dx + dz * dz > 0.0001) {
                    const tangent = Math.atan2(dz, dx);
                    barYaw = tangent + Math.PI / 2; // 走行方向に対して直角
                }
            }
        }
        group.rotation.y = barYaw;
        
        // 点光源（先端に1つ）
        const light1 = new THREE.PointLight(0xFF4500, 2.0, 30);
        light1.position.set(barLength, 0, 0);
        fireBarGroup.add(light1);
        
        group.position.set(x, 6, z);  // 支柱を高く
        this.trackGroup.add(group);
        
        this.enemies.push({
            type: 'fire_bar',
            mesh: group,
            fireBar: fireBarGroup,
            baseX: x,
            baseZ: z,
            angle: 0,
            rotationSpeed: 0.5,
            barLength: barLength,
            radius: barLength + 2,  // 1本バーの先端までの当たり判定
            index: index
        });
    }
    
    // === アイスブロス（氷を投げる敵 - Hammer Bros風） ===
    createIceBros(x, z, index) {
        const group = new THREE.Group();
        
        // === マテリアル ===
        const bodyBlueMat = new THREE.MeshStandardMaterial({ 
            color: 0x55AAFF, 
            roughness: 0.4 
        });
        const shellBlueMat = new THREE.MeshStandardMaterial({ 
            color: 0x2266DD, 
            roughness: 0.3,
            metalness: 0.15
        });
        const shellDarkMat = new THREE.MeshStandardMaterial({ 
            color: 0x1144AA, 
            roughness: 0.35 
        });
        const bellyMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFF8E0, 
            roughness: 0.5 
        });
        const skinMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFDD55, 
            roughness: 0.45 
        });
        const helmetMat = new THREE.MeshStandardMaterial({ 
            color: 0x2266EE, 
            roughness: 0.2,
            metalness: 0.3
        });
        
        // === 体（青いカメ） ===
        const bodyGeo = new THREE.SphereGeometry(1.7, 22, 20);
        const body = new THREE.Mesh(bodyGeo, bodyBlueMat);
        body.position.y = 2.0;
        body.scale.set(1, 0.82, 1);
        group.add(body);
        
        // お腹（クリーム色）
        const bellyGeo = new THREE.SphereGeometry(1.35, 18, 16);
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.position.set(0, 1.75, 0.85);
        belly.scale.set(0.9, 0.85, 0.45);
        group.add(belly);
        
        // お腹の模様（横線）
        for (let i = 0; i < 4; i++) {
            const lineGeo = new THREE.CylinderGeometry(0.8 - i * 0.12, 0.8 - i * 0.12, 0.05, 16);
            const lineMat = new THREE.MeshStandardMaterial({ color: 0xEEE5C8, roughness: 0.55 });
            const line = new THREE.Mesh(lineGeo, lineMat);
            line.position.set(0, 1.3 + i * 0.35, 1.15);
            line.rotation.x = Math.PI / 2;
            line.scale.set(1, 0.4, 1);
            group.add(line);
        }
        
        // === 甲羅（詳細な青い甲羅 - ドーム上向き） ===
        const shellGeo = new THREE.SphereGeometry(2.1, 22, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const shell = new THREE.Mesh(shellGeo, shellBlueMat);
        // ドームが上向き（回転なし）
        shell.position.y = 2.7;
        group.add(shell);
        
        // 甲羅の底面
        const ibShellBtmGeo = new THREE.CircleGeometry(2.1, 22);
        const ibShellBtmMat = new THREE.MeshStandardMaterial({ color: 0xFFF8E0, roughness: 0.5 });
        const ibShellBtm = new THREE.Mesh(ibShellBtmGeo, ibShellBtmMat);
        ibShellBtm.rotation.x = -Math.PI / 2;
        ibShellBtm.position.y = 2.71;
        group.add(ibShellBtm);
        
        // 甲羅の中央盛り上がり
        const shellTopGeo = new THREE.SphereGeometry(0.7, 14, 10);
        const shellTop = new THREE.Mesh(shellTopGeo, shellDarkMat);
        shellTop.position.set(0, 2.7 + 2.1 * 0.85, 0);
        shellTop.scale.set(1.2, 0.6, 1.2);
        group.add(shellTop);
        
        // 甲羅の六角形模様（3層・黒溝線付き）
        const ibHexLineMat = new THREE.MeshStandardMaterial({ color: 0x0A1155, roughness: 0.9 });
        const ibHexFillMat = new THREE.MeshStandardMaterial({ color: 0x4488FF, roughness: 0.3 });
        const ibHexDarkMat = new THREE.MeshStandardMaterial({ color: 0x1144AA, roughness: 0.35 });
        const ibR = 2.1;
        
        // 中央六角形
        (() => {
            const phi = 0.15;
            const nx = Math.sin(phi), ny = Math.cos(phi), nz = 0;
            const px = nx * ibR, py = ny * ibR + 2.7, pz = 0;
            const oGeo = new THREE.CircleGeometry(0.5, 6);
            const outline = new THREE.Mesh(oGeo, ibHexLineMat);
            outline.position.set(px, py + 0.01, pz);
            outline.lookAt(px + nx, py + ny + 0.01, pz + nz);
            group.add(outline);
            const fGeo = new THREE.CircleGeometry(0.38, 6);
            const fill = new THREE.Mesh(fGeo, ibHexFillMat);
            fill.position.set(px, py + 0.02, pz);
            fill.lookAt(px + nx, py + ny + 0.02, pz + nz);
            group.add(fill);
        })();
        
        // 内側リング（7個）
        for (let ib = 0; ib < 7; ib++) {
            const theta = (ib / 7) * Math.PI * 2;
            const phi = 0.45;
            const nx = Math.sin(phi) * Math.cos(theta);
            const ny = Math.cos(phi);
            const nz = Math.sin(phi) * Math.sin(theta);
            const px = nx * ibR, py = ny * ibR + 2.7, pz = nz * ibR;
            const oGeo = new THREE.CircleGeometry(0.4, 6);
            const outline = new THREE.Mesh(oGeo, ibHexLineMat);
            outline.position.set(px, py + 0.01, pz);
            outline.lookAt(px + nx, py + ny + 0.01, pz + nz);
            group.add(outline);
            const fGeo = new THREE.CircleGeometry(0.3, 6);
            const fill = new THREE.Mesh(fGeo, ib % 2 === 0 ? ibHexFillMat : ibHexDarkMat);
            fill.position.set(px, py + 0.02, pz);
            fill.lookAt(px + nx, py + ny + 0.02, pz + nz);
            group.add(fill);
        }
        
        // 外側リング（12個）
        for (let ib = 0; ib < 12; ib++) {
            const theta = (ib / 12) * Math.PI * 2 + 0.26;
            const phi = 0.85;
            const nx = Math.sin(phi) * Math.cos(theta);
            const ny = Math.cos(phi);
            const nz = Math.sin(phi) * Math.sin(theta);
            const px = nx * ibR, py = ny * ibR + 2.7, pz = nz * ibR;
            const oGeo = new THREE.CircleGeometry(0.32, 6);
            const outline = new THREE.Mesh(oGeo, ibHexLineMat);
            outline.position.set(px, py + 0.01, pz);
            outline.lookAt(px + nx, py + ny + 0.01, pz + nz);
            group.add(outline);
            const fGeo = new THREE.CircleGeometry(0.24, 6);
            const fill = new THREE.Mesh(fGeo, ib % 3 === 0 ? ibHexDarkMat : ibHexFillMat);
            fill.position.set(px, py + 0.02, pz);
            fill.lookAt(px + nx, py + ny + 0.02, pz + nz);
            group.add(fill);
        }
        
        // 甲羅の白い縁
        const shellEdgeGeo = new THREE.TorusGeometry(2.05, 0.18, 10, 28);
        const shellEdgeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.4 });
        const shellEdge = new THREE.Mesh(shellEdgeGeo, shellEdgeMat);
        shellEdge.rotation.x = Math.PI / 2;
        shellEdge.position.y = 2.7;
        group.add(shellEdge);
        
        // === 頭（黄色い肌） ===
        const headGeo = new THREE.SphereGeometry(1.2, 20, 18);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 4.3;
        group.add(head);
        
        // 頭の下部（首との接続）
        const neckGeo = new THREE.CylinderGeometry(0.65, 0.8, 0.5, 14);
        const neck = new THREE.Mesh(neckGeo, skinMat);
        neck.position.set(0, 3.3, 0.3);
        group.add(neck);
        
        // ほっぺ（赤いかわいいほっぺ）
        const cheekMat = new THREE.MeshBasicMaterial({ 
            color: 0xFF8888, 
            transparent: true, 
            opacity: 0.45 
        });
        [-0.8, 0.8].forEach(xPos => {
            const cheekGeo = new THREE.CircleGeometry(0.28, 14);
            const cheek = new THREE.Mesh(cheekGeo, cheekMat);
            cheek.position.set(xPos, 4.05, 1.05);
            group.add(cheek);
        });
        
        // === ヘルメット（詳細な青いヘルメット） ===
        const helmetBaseGeo = new THREE.SphereGeometry(1.35, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
        const helmetBase = new THREE.Mesh(helmetBaseGeo, helmetMat);
        helmetBase.position.y = 4.5;
        group.add(helmetBase);
        
        // ヘルメットの縁（白いライン）
        const helmetEdgeGeo = new THREE.TorusGeometry(1.28, 0.14, 10, 24);
        const helmetEdgeMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.35 });
        const helmetEdge = new THREE.Mesh(helmetEdgeGeo, helmetEdgeMat);
        helmetEdge.rotation.x = Math.PI / 2;
        helmetEdge.position.y = 4.5;
        group.add(helmetEdge);
        
        // ヘルメットの白いライン（縦）
        for (let i = 0; i < 4; i++) {
            const lineAngle = (i / 4) * Math.PI * 2;
            const lineGeo = new THREE.BoxGeometry(0.1, 1.1, 0.08);
            const line = new THREE.Mesh(lineGeo, helmetEdgeMat);
            line.position.set(
                Math.sin(lineAngle) * 1.1,
                5.0,
                Math.cos(lineAngle) * 1.1
            );
            line.rotation.z = Math.sin(lineAngle) * 0.4;
            line.rotation.x = Math.cos(lineAngle) * 0.4;
            group.add(line);
        }
        
        // ヘルメットのトップ飾り
        const helmetTopGeo = new THREE.SphereGeometry(0.25, 12, 12);
        const helmetTop = new THREE.Mesh(helmetTopGeo, helmetEdgeMat);
        helmetTop.position.set(0, 5.75, 0);
        group.add(helmetTop);
        
        // === 目（大きな目・マリオ風） ===
        const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const eyeBlackMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
        const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        
        [-0.45, 0.45].forEach(xPos => {
            // 白目
            const eyeWhiteGeo = new THREE.SphereGeometry(0.4, 14, 14);
            const eyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
            eyeWhite.position.set(xPos, 4.4, 1.0);
            eyeWhite.scale.set(0.85, 1.15, 0.55);
            group.add(eyeWhite);
            
            // 黒目
            const eyeGeo = new THREE.SphereGeometry(0.2, 12, 12);
            const eye = new THREE.Mesh(eyeGeo, eyeBlackMat);
            eye.position.set(xPos, 4.35, 1.15);
            group.add(eye);
            
            // ハイライト
            const highlightGeo = new THREE.SphereGeometry(0.08, 8, 8);
            const highlight = new THREE.Mesh(highlightGeo, eyeHighlightMat);
            highlight.position.set(xPos + 0.08, 4.42, 1.22);
            group.add(highlight);
        });
        
        // 怒り眉（氷の結晶風）
        const browMat = new THREE.MeshStandardMaterial({ 
            color: 0x88DDFF, 
            roughness: 0.2,
            metalness: 0.4
        });
        [-0.45, 0.45].forEach(xPos => {
            const browGeo = new THREE.BoxGeometry(0.55, 0.18, 0.12);
            const brow = new THREE.Mesh(browGeo, browMat);
            brow.position.set(xPos, 4.8, 1.0);
            brow.rotation.z = xPos > 0 ? 0.4 : -0.4;
            group.add(brow);
        });
        
        // くちばし（口）
        const beakGeo = new THREE.ConeGeometry(0.35, 0.6, 10);
        const beakMat = new THREE.MeshStandardMaterial({ color: 0xEEBB33, roughness: 0.5 });
        const beak = new THREE.Mesh(beakGeo, beakMat);
        beak.position.set(0, 3.85, 1.2);
        beak.rotation.x = -Math.PI / 2 + 0.3;
        group.add(beak);
        
        // === 足（黄色い足） ===
        [-0.7, 0.7].forEach(xPos => {
            // 太もも
            const thighGeo = new THREE.SphereGeometry(0.5, 12, 12);
            const thigh = new THREE.Mesh(thighGeo, skinMat);
            thigh.position.set(xPos, 0.9, 0.4);
            thigh.scale.set(1, 1.3, 1);
            group.add(thigh);
            
            // 足（靴っぽい形）
            const footGeo = new THREE.SphereGeometry(0.55, 14, 12);
            const footMat = new THREE.MeshStandardMaterial({ color: 0xFFCC22, roughness: 0.5 });
            const foot = new THREE.Mesh(footGeo, footMat);
            foot.position.set(xPos, 0.3, 0.65);
            foot.scale.set(0.9, 0.55, 1.4);
            group.add(foot);
        });
        
        // === 腕（詳細） ===
        // 右腕（氷を投げる準備）
        const rightArmGroup = new THREE.Group();
        
        const rightUpperArmGeo = new THREE.CylinderGeometry(0.28, 0.35, 1.3, 12);
        const rightUpperArm = new THREE.Mesh(rightUpperArmGeo, skinMat);
        rightUpperArm.rotation.z = -0.8;
        rightArmGroup.add(rightUpperArm);
        
        const rightElbowGeo = new THREE.SphereGeometry(0.3, 10, 10);
        const rightElbow = new THREE.Mesh(rightElbowGeo, skinMat);
        rightElbow.position.set(0.55, 0, 0);
        rightArmGroup.add(rightElbow);
        
        const rightForearmGeo = new THREE.CylinderGeometry(0.22, 0.28, 1.0, 10);
        const rightForearm = new THREE.Mesh(rightForearmGeo, skinMat);
        rightForearm.position.set(0.55, 0.5, 0.3);
        rightForearm.rotation.x = 0.8;
        rightArmGroup.add(rightForearm);
        
        // 右手（グローブ風）
        const rightHandGeo = new THREE.SphereGeometry(0.35, 12, 12);
        const gloveMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.4 });
        const rightHand = new THREE.Mesh(rightHandGeo, gloveMat);
        rightHand.position.set(0.6, 0.95, 0.65);
        rightHand.scale.set(1, 0.9, 1.1);
        rightArmGroup.add(rightHand);
        
        rightArmGroup.position.set(1.7, 2.8, 0.5);
        group.add(rightArmGroup);
        
        // 左腕
        const leftArmGeo = new THREE.CylinderGeometry(0.25, 0.32, 1.3, 10);
        const leftArm = new THREE.Mesh(leftArmGeo, skinMat);
        leftArm.position.set(-1.5, 2.5, 0.4);
        leftArm.rotation.z = 0.6;
        group.add(leftArm);
        
        const leftHandGeo = new THREE.SphereGeometry(0.32, 12, 12);
        const leftHand = new THREE.Mesh(leftHandGeo, gloveMat);
        leftHand.position.set(-2.0, 2.0, 0.4);
        group.add(leftHand);
        
        // === 手に持っている氷の結晶（詳細） ===
        const iceGroup = new THREE.Group();
        
        // メインの氷結晶
        const iceGeo = new THREE.OctahedronGeometry(1.0, 0);
        const iceMat = new THREE.MeshStandardMaterial({ 
            color: 0xAAEEFF, 
            transparent: true, 
            opacity: 0.7,
            roughness: 0.02,
            metalness: 0.35
        });
        const ice = new THREE.Mesh(iceGeo, iceMat);
        iceGroup.add(ice);
        
        // 氷の内部光（エミッシブ）
        const iceCoreGeo = new THREE.OctahedronGeometry(0.4, 0);
        const iceCoreMat = new THREE.MeshBasicMaterial({ 
            color: 0xDDFFFF, 
            transparent: true, 
            opacity: 0.6
        });
        const iceCore = new THREE.Mesh(iceCoreGeo, iceCoreMat);
        iceGroup.add(iceCore);
        
        // 氷の突起（クリスタル風）
        for (let i = 0; i < 6; i++) {
            const spikeAngle = (i / 6) * Math.PI * 2;
            const spikeGeo = new THREE.ConeGeometry(0.15, 0.6, 6);
            const spike = new THREE.Mesh(spikeGeo, iceMat);
            spike.position.set(
                Math.sin(spikeAngle) * 0.7,
                0,
                Math.cos(spikeAngle) * 0.7
            );
            spike.rotation.x = Math.PI / 2;
            spike.rotation.z = spikeAngle;
            spike.scale.set(1, 1, 0.6);
            iceGroup.add(spike);
        }
        
        // 氷のきらめき（小さな光点）
        const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        for (let i = 0; i < 5; i++) {
            const sparkleGeo = new THREE.SphereGeometry(0.08, 6, 6);
            const sparkle = new THREE.Mesh(sparkleGeo, sparkleMat);
            sparkle.position.set(
                (Math.random() - 0.5) * 1.2,
                (Math.random() - 0.5) * 1.2,
                (Math.random() - 0.5) * 1.2
            );
            iceGroup.add(sparkle);
        }
        
        // 氷の霜エフェクト（周囲の細かい粒）
        for (let i = 0; i < 8; i++) {
            const frostGeo = new THREE.OctahedronGeometry(0.12, 0);
            const frost = new THREE.Mesh(frostGeo, iceMat);
            const frostAngle = (i / 8) * Math.PI * 2;
            frost.position.set(
                Math.sin(frostAngle) * 1.3,
                Math.cos(frostAngle * 2) * 0.3,
                Math.cos(frostAngle) * 1.3
            );
            frost.rotation.set(Math.random(), Math.random(), Math.random());
            iceGroup.add(frost);
        }
        
        iceGroup.position.set(2.45, 4.0, 0.9);
        iceGroup.rotation.set(0.3, 0.2, 0.4);
        group.add(iceGroup);
        
        // 黒い縁取り
        this.addOutline(group, 1.06);

        group.position.set(x, 0, z);
        group.scale.set(2, 2, 2);
        this.trackGroup.add(group);
        
        this.enemies.push({
            type: 'ice_bros',
            mesh: group,
            baseX: x,
            baseZ: z,
            currentX: x,
            currentZ: z,
            state: 'wander',   // 'wander' / 'chase'
            timer: 0,
            radius: 4,
            index: index,
            // 歩行パラメータ
            walkAngle: Math.random() * Math.PI * 2,
            walkSpeed: 6,
            wanderRadius: 40,  // 歩き回る範囲
            chaseRange: 50,    // カートを追いかけ始める距離
            walkPhase: 0,      // 歩行アニメーション位相
            dirChangeTimer: 2 + Math.random() * 3  // 方向転換タイマー
        });
    }
    
    // ドッスン作成（Mario Kart 64風 - より忠実なデザイン）
    createThwomp(x, z, index) {
        const group = new THREE.Group();
        
        // メインボディ（青みがかったグレーの直方体）
        const bodyGeo = new THREE.BoxGeometry(9, 11, 9);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x6B7B8C,  // 青みがかったグレー
            roughness: 0.8,
            metalness: 0.2
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);
        
        // 石のテクスチャ風に少し凹凸を追加
        const bumpGeo = new THREE.BoxGeometry(9.2, 11.2, 9.2);
        const bumpMat = new THREE.MeshStandardMaterial({
            color: 0x5A6A7A,
            transparent: true,
            opacity: 0.3,
            roughness: 1
        });
        const bumpLayer = new THREE.Mesh(bumpGeo, bumpMat);
        group.add(bumpLayer);
        
        // 棘（上部 - より大きく目立つ）
        const spikeGeo = new THREE.ConeGeometry(1.8, 4, 4);
        const spikeMat = new THREE.MeshStandardMaterial({
            color: 0x4A5A6A,
            roughness: 0.6
        });
        const spikePositions = [
            { x: 3, z: 3 }, { x: -3, z: 3 },
            { x: 3, z: -3 }, { x: -3, z: -3 }
        ];
        spikePositions.forEach(pos => {
            const spike = new THREE.Mesh(spikeGeo, spikeMat);
            spike.position.set(pos.x, 7.5, pos.z);
            group.add(spike);
        });
        
        // 底面の棘
        spikePositions.forEach(pos => {
            const spike = new THREE.Mesh(spikeGeo, spikeMat);
            spike.position.set(pos.x, -7.5, pos.z);
            spike.rotation.x = Math.PI;
            group.add(spike);
        });
        
        // === 顔（マリオカート64風 - より可愛くて怒った顔）===
        
        // 目 - 大きな白い部分と黒い瞳
        const eyeGeo = new THREE.SphereGeometry(1.2, 16, 16);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const pupilGeo = new THREE.SphereGeometry(0.6, 12, 12);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        // 左目
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-2, 1.5, 4.6);
        leftEye.scale.set(1, 1.2, 0.5);
        group.add(leftEye);
        const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
        leftPupil.position.set(-2, 1.2, 5);
        group.add(leftPupil);
        
        // 右目
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(2, 1.5, 4.6);
        rightEye.scale.set(1, 1.2, 0.5);
        group.add(rightEye);
        const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
        rightPupil.position.set(2, 1.2, 5);
        group.add(rightPupil);
        
        // 怒り眉毛（黒くて太い）
        const browGeo = new THREE.BoxGeometry(2.5, 0.5, 0.3);
        const browMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const leftBrow = new THREE.Mesh(browGeo, browMat);
        leftBrow.position.set(-2, 3, 4.7);
        leftBrow.rotation.z = 0.35;
        group.add(leftBrow);
        const rightBrow = new THREE.Mesh(browGeo, browMat);
        rightBrow.position.set(2, 3, 4.7);
        rightBrow.rotation.z = -0.35;
        group.add(rightBrow);
        
        // 口（ジグザグの怒った口）
        const mouthShape = new THREE.Shape();
        mouthShape.moveTo(-2.5, 0);
        mouthShape.lineTo(-1.5, -0.5);
        mouthShape.lineTo(-0.5, 0);
        mouthShape.lineTo(0.5, -0.5);
        mouthShape.lineTo(1.5, 0);
        mouthShape.lineTo(2.5, -0.5);
        mouthShape.lineTo(2.5, -1.2);
        mouthShape.lineTo(-2.5, -1.2);
        mouthShape.closePath();
        
        const mouthGeo = new THREE.ShapeGeometry(mouthShape);
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, -2.2, 4.7);
        group.add(mouth);
        
        // 歯（ジグザグの上に白い部分）
        const toothGeo = new THREE.BoxGeometry(0.6, 0.4, 0.2);
        const toothMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        [-2, -0.5, 1, 2.3].forEach((xPos, i) => {
            const tooth = new THREE.Mesh(toothGeo, toothMat);
            tooth.position.set(xPos, -1.6 + (i % 2) * 0.3, 4.75);
            group.add(tooth);
        });
        
        // 黒い縁取り
        this.addOutline(group, 1.05);

        // 初期位置を設定
        const startY = 30;  // 高い位置から開始
        group.position.set(x, startY, z);
        this.trackGroup.add(group);
        
        // 各ドッスンは異なるタイミングで開始
        // index 0: すぐに落下、index 1: 1秒後、index 2: 2秒後
        const initialTimer = index * 1.0;
        
        this.enemies.push({
            type: 'thwomp',
            mesh: group,
            baseX: x,
            baseZ: z,
            baseY: startY,
            lowY: 3,  // 地面近く（カートの高さ）
            state: 'waiting',  // 全員待機状態から開始
            timer: initialTimer,  // 時間差で落下開始
            radius: 6,
            index: index
        });
    }
    
    // ノコノコ作成（Super Mario Bros / Mario Kart 64風）
    createKoopa(x, z, patrolAxis, patrolRange, index) {
        const group = new THREE.Group();
        
        // === 甲羅（緑色・ドーム型） ===
        const shellGeo = new THREE.SphereGeometry(2.5, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2);
        const shellMat = new THREE.MeshStandardMaterial({ 
            color: 0x00AA00, 
            roughness: 0.25, 
            metalness: 0.15 
        });
        const shell = new THREE.Mesh(shellGeo, shellMat);
        // ドームが上向き（回転なし）
        shell.position.y = 2.2;
        group.add(shell);
        
        // 甲羅の底面（クリーム色）
        const shellBottomGeo = new THREE.CircleGeometry(2.5, 32);
        const shellBottomMat = new THREE.MeshStandardMaterial({ color: 0xFFF5E1, roughness: 0.5 });
        const shellBottom = new THREE.Mesh(shellBottomGeo, shellBottomMat);
        shellBottom.rotation.x = -Math.PI / 2;
        shellBottom.position.y = 2.21;
        group.add(shellBottom);
        
        // 甲羅の縁（クリーム色）
        const rimGeo = new THREE.TorusGeometry(2.3, 0.35, 12, 32);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xFFF5E1, roughness: 0.6 });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 2.25;
        group.add(rim);
        
        // === 甲羅の精緻な六角形模様 ===
        const hexLineMat = new THREE.MeshStandardMaterial({ color: 0x003300, roughness: 0.4 });
        const hexFillMat = new THREE.MeshStandardMaterial({ color: 0x008800, roughness: 0.3 });
        const hexDarkMat = new THREE.MeshStandardMaterial({ color: 0x006600, roughness: 0.35 });
        
        // 中央の六角形（黒輪郭付き）
        const centerHexOutline = new THREE.Mesh(
            new THREE.CircleGeometry(0.85, 6), hexLineMat
        );
        centerHexOutline.position.set(0, 4.65, 0);
        centerHexOutline.rotation.x = -Math.PI / 2;
        group.add(centerHexOutline);
        
        const centerHexFill = new THREE.Mesh(
            new THREE.CircleGeometry(0.7, 6), hexFillMat
        );
        centerHexFill.position.set(0, 4.66, 0);
        centerHexFill.rotation.x = -Math.PI / 2;
        group.add(centerHexFill);
        
        // 周囲の六角形（6個、黒輪郭付き）
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const r = 1.4;
            const hx = Math.cos(angle) * r;
            const hz = Math.sin(angle) * r;
            // 球面に沿った高さ
            const hy = 2.2 + Math.sqrt(Math.max(0, 2.5*2.5 - hx*hx - hz*hz)) - 0.02;
            
            // 黒輪郭
            const hexOutline = new THREE.Mesh(
                new THREE.CircleGeometry(0.6, 6), hexLineMat
            );
            hexOutline.position.set(hx, hy, hz);
            hexOutline.lookAt(hx * 2, hy + (hy - 2.2) * 2, hz * 2);
            group.add(hexOutline);
            
            // 内側填め
            const hexFill = new THREE.Mesh(
                new THREE.CircleGeometry(0.48, 6), hexDarkMat
            );
            hexFill.position.set(hx, hy + 0.01, hz);
            hexFill.lookAt(hx * 2, hy + 0.01 + (hy - 2.2) * 2, hz * 2);
            group.add(hexFill);
        }
        
        // 外側リングの六角形（12個、小さめ）
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2 + Math.PI / 12;
            const r = 2.0;
            const hx = Math.cos(angle) * r;
            const hz = Math.sin(angle) * r;
            const hy = 2.2 + Math.sqrt(Math.max(0, 2.5*2.5 - hx*hx - hz*hz)) - 0.02;
            
            const hexOutline = new THREE.Mesh(
                new THREE.CircleGeometry(0.35, 6), hexLineMat
            );
            hexOutline.position.set(hx, hy, hz);
            hexOutline.lookAt(hx * 2, hy + (hy - 2.2) * 2, hz * 2);
            group.add(hexOutline);
            
            const hexFill = new THREE.Mesh(
                new THREE.CircleGeometry(0.25, 6), hexFillMat
            );
            hexFill.position.set(hx, hy + 0.01, hz);
            hexFill.lookAt(hx * 2, hy + 0.01 + (hy - 2.2) * 2, hz * 2);
            group.add(hexFill);
        }
        
        // === 甲羅の背骨（縦線） ===
        const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x005500, roughness: 0.3 });
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI;
            const ridgeGeo = new THREE.BoxGeometry(0.08, 0.08, 4.5);
            const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
            ridge.position.set(0, 3.5, 0);
            ridge.rotation.y = angle;
            // 球面に沿うように曲げる
            ridge.rotation.x = 0.15;
            group.add(ridge);
        }
        
        // === 頭（黄色） ===
        const headGeo = new THREE.SphereGeometry(1.2, 20, 20);
        const headMat = new THREE.MeshStandardMaterial({ color: 0xFFDD44, roughness: 0.4 });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0, 2.8, 2.4);
        head.scale.set(0.9, 1.1, 0.9);
        group.add(head);
        
        // 目（大きな白目＋黒目）
        const eyeWhiteGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const pupilGeo = new THREE.SphereGeometry(0.25, 12, 12);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        [-0.45, 0.45].forEach(xPos => {
            const eyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
            eyeWhite.position.set(xPos, 3.2, 3.2);
            eyeWhite.scale.set(0.9, 1.2, 0.7);
            group.add(eyeWhite);
            const pupil = new THREE.Mesh(pupilGeo, pupilMat);
            pupil.position.set(xPos, 3.15, 3.5);
            group.add(pupil);
        });
        
        // くちばし（オレンジ）
        const beakGeo = new THREE.ConeGeometry(0.35, 0.6, 8);
        const beakMat = new THREE.MeshStandardMaterial({ color: 0xFF8800 });
        const beak = new THREE.Mesh(beakGeo, beakMat);
        beak.position.set(0, 2.6, 3.5);
        beak.rotation.x = -Math.PI / 2;
        group.add(beak);
        
        // === お腹（クリーム色・扁平な楕円体） ===
        const bellyGeo = new THREE.SphereGeometry(2.2, 20, 20);
        const bellyMat = new THREE.MeshStandardMaterial({ color: 0xFFF5E1, roughness: 0.5 });
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.position.y = 1.8;
        belly.scale.set(1, 0.35, 1);
        group.add(belly);
        
        // === 足（オレンジ色の靴 - 低く横広） ===
        const footGeo = new THREE.SphereGeometry(0.7, 14, 14);
        const footMat = new THREE.MeshStandardMaterial({ color: 0xFF8800, roughness: 0.6 });
        [{ x: -1.4, z: 1.3 }, { x: 1.4, z: 1.3 }, { x: -1.4, z: -0.9 }, { x: 1.4, z: -0.9 }].forEach(pos => {
            const foot = new THREE.Mesh(footGeo, footMat);
            foot.position.set(pos.x, 0.35, pos.z);
            foot.scale.set(1.4, 0.4, 1.6);
            group.add(foot);
        });

        // 黒い縁取り
        this.addOutline(group, 1.06);

        group.position.set(x, 2, z);
        group.scale.set(2, 2, 2);
        this.trackGroup.add(group);
        this.enemies.push({
            type: 'koopa',
            mesh: group,
            baseX: x,
            baseZ: z,
            patrolAxis: patrolAxis,
            patrolRange: patrolRange,
            direction: 1,
            speed: 15,
            radius: 4,
            index: index
        });
    }
    
    // 植木鉢作成（コース上の静的障害物）
    createPottedPlant(x, z, index) {
        const group = new THREE.Group();
        
        // === 植木鉢（茶色の素焼き鉢） ===
        // 鉢本体（円錐台形）
        const potGeo = new THREE.CylinderGeometry(3, 2.2, 5, 16);
        const potMat = new THREE.MeshStandardMaterial({
            color: 0xcc6633,  // テラコッタ色
            roughness: 0.8,
            metalness: 0.1
        });
        const pot = new THREE.Mesh(potGeo, potMat);
        pot.position.y = 2.5;
        group.add(pot);
        
        // 鉢の縁（リム）
        const rimGeo = new THREE.TorusGeometry(3.1, 0.4, 8, 24);
        const rim = new THREE.Mesh(rimGeo, potMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 5;
        group.add(rim);
        
        // 土の部分
        const soilGeo = new THREE.CylinderGeometry(2.7, 2.7, 0.5, 16);
        const soilMat = new THREE.MeshStandardMaterial({
            color: 0x3d2817,  // 濃い茶色
            roughness: 1.0
        });
        const soil = new THREE.Mesh(soilGeo, soilMat);
        soil.position.y = 4.7;
        group.add(soil);
        
        // === 植物（緑の観葉植物） ===
        // 茎
        const stemGeo = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
        const stemMat = new THREE.MeshStandardMaterial({
            color: 0x2d5a27,
            roughness: 0.7
        });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 7;
        group.add(stem);
        
        // 葉っぱ（複数枚を扇状に配置）
        const leafMat = new THREE.MeshStandardMaterial({
            color: 0x228b22,  // フォレストグリーン
            roughness: 0.6,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const leafHeight = 7 + Math.random() * 3;
            
            // 葉の形状（楕円形）
            const leafShape = new THREE.Shape();
            leafShape.moveTo(0, 0);
            leafShape.quadraticCurveTo(0.8, 1.5, 0, 4);
            leafShape.quadraticCurveTo(-0.8, 1.5, 0, 0);
            
            const leafGeo = new THREE.ShapeGeometry(leafShape);
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            
            leaf.position.set(
                Math.cos(angle) * 1.5,
                leafHeight,
                Math.sin(angle) * 1.5
            );
            leaf.rotation.x = -Math.PI / 4 - Math.random() * 0.3;
            leaf.rotation.y = angle;
            leaf.scale.set(1.5, 1.5, 1.5);
            group.add(leaf);
        }
        
        // 中央の大きな葉
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + Math.PI / 10;
            
            const bigLeafShape = new THREE.Shape();
            bigLeafShape.moveTo(0, 0);
            bigLeafShape.quadraticCurveTo(1.2, 2, 0, 5);
            bigLeafShape.quadraticCurveTo(-1.2, 2, 0, 0);
            
            const bigLeafGeo = new THREE.ShapeGeometry(bigLeafShape);
            const bigLeaf = new THREE.Mesh(bigLeafGeo, leafMat);
            
            bigLeaf.position.set(
                Math.cos(angle) * 0.5,
                9,
                Math.sin(angle) * 0.5
            );
            bigLeaf.rotation.x = -Math.PI / 6;
            bigLeaf.rotation.y = angle;
            bigLeaf.scale.set(2, 2, 2);
            group.add(bigLeaf);
        }
        
        // 花（赤いアクセント）- オプション
        const flowerMat = new THREE.MeshStandardMaterial({
            color: 0xff4444,
            roughness: 0.5
        });
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const flowerGeo = new THREE.SphereGeometry(0.5, 8, 8);
            const flower = new THREE.Mesh(flowerGeo, flowerMat);
            flower.position.set(
                Math.cos(angle) * 2,
                10 + Math.random() * 2,
                Math.sin(angle) * 2
            );
            group.add(flower);
        }
        
        // 配置
        group.position.set(x, 0, z);
        this.trackGroup.add(group);
        
        // enemiesリストに追加（衝突判定用）
        this.enemies.push({
            type: 'plant',
            mesh: group,
            radius: 4,  // 当たり判定半径
            isStatic: true,  // 静的オブジェクト
            index: index
        });
    }
    
    // クリボー作成（Super Mario Bros風 - 精緻なGoomba）
    createGoomba(x, z, patrolAxis, patrolRange, index) {
        const group = new THREE.Group();
        
        // === 頭部（茶色のキノコ型） ===
        const headGeo = new THREE.SphereGeometry(2.2, 24, 24);
        const headMat = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513, 
            roughness: 0.7,
            metalness: 0.05
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 3.2;
        head.scale.set(1, 0.8, 1);
        group.add(head);
        
        // 頭のハイライト（上部を明るく）
        const highlightGeo = new THREE.SphereGeometry(1.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 3);
        const highlightMat = new THREE.MeshStandardMaterial({ 
            color: 0xA06030, 
            roughness: 0.8 
        });
        const highlight = new THREE.Mesh(highlightGeo, highlightMat);
        highlight.position.y = 4.0;
        group.add(highlight);
        
        // === 顔（クリーム色・前面） ===
        const faceGeo = new THREE.SphereGeometry(1.8, 20, 20, -Math.PI / 2, Math.PI, Math.PI * 0.25, Math.PI * 0.5);
        const faceMat = new THREE.MeshStandardMaterial({ color: 0xFFF5E1, roughness: 0.6 });
        const face = new THREE.Mesh(faceGeo, faceMat);
        face.position.set(0, 2.5, 0.6);
        face.rotation.y = Math.PI;
        group.add(face);
        
        // === 眉毛（怒り眉・黒色・太い） ===
        const browGeo = new THREE.BoxGeometry(1.4, 0.35, 0.25);
        const browMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        [-0.7, 0.7].forEach((xPos) => {
            const brow = new THREE.Mesh(browGeo, browMat);
            brow.position.set(xPos, 3.3, 1.7);
            brow.rotation.z = xPos > 0 ? 0.45 : -0.45;
            group.add(brow);
        });
        
        // === 目（大きな白目＋黒目） ===
        const eyeWhiteGeo = new THREE.SphereGeometry(0.55, 16, 16);
        const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const pupilGeo = new THREE.SphereGeometry(0.28, 12, 12);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        [-0.6, 0.6].forEach(xPos => {
            const eye = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
            eye.position.set(xPos, 2.9, 1.7);
            eye.scale.set(0.85, 1.1, 0.65);
            group.add(eye);
            const pupil = new THREE.Mesh(pupilGeo, pupilMat);
            pupil.position.set(xPos, 2.8, 1.95);
            group.add(pupil);
        });
        
        // === 口（ギザギザの牙付き） ===
        // 口の開口部
        const mouthGeo = new THREE.TorusGeometry(0.6, 0.15, 8, 16, Math.PI);
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, 1.9, 1.8);
        mouth.rotation.x = Math.PI / 2;
        group.add(mouth);
        
        // 牙（2本の白い三角）
        const fangGeo = new THREE.ConeGeometry(0.22, 0.55, 6);
        const fangMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        [-0.45, 0.45].forEach(xPos => {
            const fang = new THREE.Mesh(fangGeo, fangMat);
            fang.position.set(xPos, 1.65, 1.75);
            fang.rotation.x = Math.PI;
            group.add(fang);
        });
        
        // === 足（茶色の丸い靴） ===
        const footGeo = new THREE.SphereGeometry(0.75, 14, 14);
        const footMat = new THREE.MeshStandardMaterial({ color: 0x5C3317, roughness: 0.7 });
        [-0.9, 0.9].forEach(xPos => {
            const foot = new THREE.Mesh(footGeo, footMat);
            foot.position.set(xPos, 0.55, 0);
            foot.scale.set(1.3, 0.55, 1.5);
            group.add(foot);
        });

        // 黒い縁取り
        this.addOutline(group, 1.06);

        group.position.set(x, 0, z);
        group.scale.set(1.5, 1.5, 1.5);
        this.trackGroup.add(group);
        this.enemies.push({
            type: 'goomba',
            mesh: group,
            baseX: x,
            baseZ: z,
            patrolAxis: patrolAxis,
            patrolRange: patrolRange,
            direction: 1,
            speed: 12,
            radius: 2.5,
            index: index
        });
    }
    
    // パックンフラワー作成（Super Mario Bros風 - 精緻な土管＋花）
    createPiranhaPlant(x, z, index) {
        const group = new THREE.Group();
        
        // === 土管（緑色・マリオスタイル） ===
        const pipeBodyGeo = new THREE.CylinderGeometry(2.8, 2.8, 5, 32);
        const pipeMat = new THREE.MeshStandardMaterial({ 
            color: 0x00AA00, 
            roughness: 0.35, 
            metalness: 0.15 
        });
        const pipeBody = new THREE.Mesh(pipeBodyGeo, pipeMat);
        pipeBody.position.y = 2.5;
        group.add(pipeBody);
        
        // 土管の上部リップ（太い縁）
        const pipeTopGeo = new THREE.CylinderGeometry(3.2, 3.2, 1.2, 32);
        const pipeTop = new THREE.Mesh(pipeTopGeo, pipeMat);
        pipeTop.position.y = 5.4;
        group.add(pipeTop);
        
        // 土管の内側（黒）
        const pipeInnerGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.5, 24);
        const pipeInnerMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const pipeInner = new THREE.Mesh(pipeInnerGeo, pipeInnerMat);
        pipeInner.position.y = 5.6;
        group.add(pipeInner);
        
        // 土管のハイライト（明るい緑のライン）
        const highlightMat = new THREE.MeshStandardMaterial({ color: 0x44DD44 });
        const highlightGeo = new THREE.TorusGeometry(3.1, 0.15, 8, 32);
        const highlight = new THREE.Mesh(highlightGeo, highlightMat);
        highlight.rotation.x = Math.PI / 2;
        highlight.position.y = 5.9;
        group.add(highlight);
        
        // === パックンフラワー本体 ===
        const plantGroup = new THREE.Group();
        
        // 茎（緑・節あり）
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        for (let i = 0; i < 3; i++) {
            const stemGeo = new THREE.CylinderGeometry(0.55 - i * 0.05, 0.65 - i * 0.05, 1.5, 12);
            const stemSeg = new THREE.Mesh(stemGeo, stemMat);
            stemSeg.position.y = 0.75 + i * 1.4;
            plantGroup.add(stemSeg);
        }
        
        // === 頭部（赤と白の斑点模様） ===
        const headMat = new THREE.MeshStandardMaterial({ 
            color: 0xDD0000, 
            roughness: 0.5 
        });
        
        // 頭の上部（球状）
        const headTopGeo = new THREE.SphereGeometry(2.2, 24, 18);
        const headTop = new THREE.Mesh(headTopGeo, headMat);
        headTop.position.y = 6;
        headTop.scale.set(1, 0.75, 1);
        plantGroup.add(headTop);
        
        // 白い斑点（より多く、ランダム配置）
        const spotMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const spotCount = 12;
        for (let i = 0; i < spotCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 0.6;
            const radius = 1.9;
            const spotGeo = new THREE.SphereGeometry(0.28 + Math.random() * 0.15, 8, 8);
            const spot = new THREE.Mesh(spotGeo, spotMat);
            spot.position.set(
                Math.sin(phi) * Math.cos(theta) * radius,
                6.2 + Math.cos(phi) * radius * 0.5,
                Math.sin(phi) * Math.sin(theta) * radius
            );
            plantGroup.add(spot);
        }
        
        // === 口（開いた状態・牙付き） ===
        // 上顎
        const upperJawGeo = new THREE.SphereGeometry(1.6, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const lipMat = new THREE.MeshStandardMaterial({ color: 0xFFEECC });
        const upperJaw = new THREE.Mesh(upperJawGeo, lipMat);
        upperJaw.position.set(0, 6.2, 1.2);
        upperJaw.rotation.x = 0.3;
        upperJaw.scale.set(1, 0.5, 1);
        plantGroup.add(upperJaw);
        
        // 下顎
        const lowerJaw = new THREE.Mesh(upperJawGeo, lipMat);
        lowerJaw.position.set(0, 5.2, 1.2);
        lowerJaw.rotation.x = Math.PI + 0.3;
        lowerJaw.scale.set(1, 0.5, 1);
        plantGroup.add(lowerJaw);
        
        // 口の中（暗い）
        const mouthInnerGeo = new THREE.SphereGeometry(1.2, 12, 12);
        const mouthInnerMat = new THREE.MeshBasicMaterial({ color: 0x330000 });
        const mouthInner = new THREE.Mesh(mouthInnerGeo, mouthInnerMat);
        mouthInner.position.set(0, 5.7, 1.3);
        plantGroup.add(mouthInner);
        
        // 牙（鋭い三角形）
        const fangMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const fangPositions = [
            { x: -0.8, y: 5.9, z: 1.8, rot: 0.3 },
            { x: 0.8, y: 5.9, z: 1.8, rot: -0.3 },
            { x: -0.4, y: 5.5, z: 2.0, rot: 0.2 },
            { x: 0.4, y: 5.5, z: 2.0, rot: -0.2 },
        ];
        fangPositions.forEach(pos => {
            const fangGeo = new THREE.ConeGeometry(0.18, 0.6, 6);
            const fang = new THREE.Mesh(fangGeo, fangMat);
            fang.position.set(pos.x, pos.y, pos.z);
            fang.rotation.x = Math.PI;
            fang.rotation.z = pos.rot;
            plantGroup.add(fang);
        });
        
        // === 目（大きな白目＋黒目） ===
        const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        [-0.9, 0.9].forEach(xPos => {
            const eyeGeo = new THREE.SphereGeometry(0.5, 14, 14);
            const eye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
            eye.position.set(xPos, 7.0, 1.4);
            eye.scale.set(0.9, 1.1, 0.7);
            plantGroup.add(eye);
            
            const pupilGeo = new THREE.SphereGeometry(0.25, 10, 10);
            const pupil = new THREE.Mesh(pupilGeo, pupilMat);
            pupil.position.set(xPos, 6.95, 1.75);
            plantGroup.add(pupil);
        });
        
        // 葉っぱ（茎から出る）
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x228B22, side: THREE.DoubleSide });
        [-1, 1].forEach((side, i) => {
            const leafShape = new THREE.Shape();
            leafShape.moveTo(0, 0);
            leafShape.quadraticCurveTo(0.8 * side, 0.5, 0.5 * side, 1.5);
            leafShape.quadraticCurveTo(0, 0.8, 0, 0);
            const leafGeo = new THREE.ShapeGeometry(leafShape);
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.set(0.5 * side, 2 + i * 1.5, 0.3);
            leaf.rotation.y = side * 0.5;
            plantGroup.add(leaf);
        });
        
        plantGroup.position.y = -5;  // 最初は隠れている
        group.add(plantGroup);
        
        // 黒い縁取り
        this.addOutline(group, 1.06);

        group.position.set(x, 0, z);
        // 衝突判定
        const colliderGeo = new THREE.CylinderGeometry(2.5, 2.5, 6, 12);
        const colliderMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
        const collider = new THREE.Mesh(colliderGeo, colliderMat);
        collider.position.y = 3;
        collider.userData.isCollidable = true;
        collider.userData.wallType = 'piranha';
        collider.userData.forceCollide = true;
        group.add(collider);
        this.collidableObjects.push(collider);
        this.trackGroup.add(group);
        this.enemies.push({
            type: 'piranha',
            mesh: group,
            plantGroup: plantGroup,
            baseY: 0,
            state: 'hidden',    // 隠れた状態から開始
            timer: Math.random() * 3,  // ランダムな遅延で開始
            radius: 3.5,
            index: index
        });
    }
    
    // ペンギン作成（雪コース用）
    createPenguin(x, z, patrolAxis, patrolRange, index) {
        const group = new THREE.Group();
        
        // === 体（青みがかった黒・楕円） ===
        const bodyGeo = new THREE.SphereGeometry(1.7, 20, 20);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a3e,
            roughness: 0.65
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 2;
        body.scale.set(1, 1.35, 0.85);
        group.add(body);
        
        // お腹（白・ふわふわ）
        const bellyGeo = new THREE.SphereGeometry(1.35, 18, 18);
        const bellyMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.6 });
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.position.set(0, 2, 0.5);
        belly.scale.set(0.9, 1.25, 0.45);
        group.add(belly);
        
        // === 頭 ===
        const headGeo = new THREE.SphereGeometry(1.15, 18, 18);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.y = 3.9;
        group.add(head);
        
        // 頭の白い部分（顔周り）
        const faceWhiteGeo = new THREE.SphereGeometry(0.85, 14, 14);
        const faceWhite = new THREE.Mesh(faceWhiteGeo, bellyMat);
        faceWhite.position.set(0, 3.85, 0.55);
        faceWhite.scale.set(0.9, 0.9, 0.4);
        group.add(faceWhite);
        
        // === 目（大きくてキュート） ===
        const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        [-0.38, 0.38].forEach(xPos => {
            // 白目
            const eyeGeo = new THREE.SphereGeometry(0.32, 12, 12);
            const eye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
            eye.position.set(xPos, 4.05, 0.85);
            eye.scale.set(0.9, 1.1, 0.6);
            group.add(eye);
            
            // 黒目
            const pupilGeo = new THREE.SphereGeometry(0.16, 10, 10);
            const pupil = new THREE.Mesh(pupilGeo, pupilMat);
            pupil.position.set(xPos, 4.0, 1.0);
            group.add(pupil);
            
            // 目のハイライト
            const highlightGeo = new THREE.SphereGeometry(0.06, 6, 6);
            const highlightMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const highlight = new THREE.Mesh(highlightGeo, highlightMat);
            highlight.position.set(xPos + 0.05, 4.05, 1.05);
            group.add(highlight);
        });
        
        // ほっぺ（ピンク）
        const cheekMat = new THREE.MeshBasicMaterial({ color: 0xFFAAAA, transparent: true, opacity: 0.45 });
        [-0.6, 0.6].forEach(xPos => {
            const cheekGeo = new THREE.CircleGeometry(0.2, 10);
            const cheek = new THREE.Mesh(cheekGeo, cheekMat);
            cheek.position.set(xPos, 3.75, 0.9);
            group.add(cheek);
        });
        
        // === くちばし（オレンジ・詳細） ===
        const beakMat = new THREE.MeshStandardMaterial({ color: 0xFF8800, roughness: 0.4 });
        
        // 上くちばし
        const upperBeakGeo = new THREE.ConeGeometry(0.28, 0.7, 10);
        const upperBeak = new THREE.Mesh(upperBeakGeo, beakMat);
        upperBeak.position.set(0, 3.7, 1.1);
        upperBeak.rotation.x = -Math.PI / 2;
        group.add(upperBeak);
        
        // 下くちばし
        const lowerBeakGeo = new THREE.ConeGeometry(0.2, 0.4, 8);
        const lowerBeak = new THREE.Mesh(lowerBeakGeo, beakMat);
        lowerBeak.position.set(0, 3.5, 1.0);
        lowerBeak.rotation.x = -Math.PI / 2 + 0.2;
        group.add(lowerBeak);
        
        // === 翼（詳細） ===
        const wingMat = new THREE.MeshStandardMaterial({ color: 0x1a1a3e, roughness: 0.65 });
        [-1, 1].forEach(side => {
            const wingGroup = new THREE.Group();
            
            // 翼本体
            const wingGeo = new THREE.SphereGeometry(0.6, 12, 12);
            const wing = new THREE.Mesh(wingGeo, wingMat);
            wing.scale.set(0.45, 1.3, 0.85);
            wingGroup.add(wing);
            
            // 翼の先
            const wingTipGeo = new THREE.SphereGeometry(0.35, 10, 10);
            const wingTip = new THREE.Mesh(wingTipGeo, wingMat);
            wingTip.position.set(0, -0.6, 0.1);
            wingTip.scale.set(0.5, 0.8, 0.7);
            wingGroup.add(wingTip);
            
            wingGroup.position.set(side * 1.4, 2.2, 0);
            wingGroup.rotation.z = side * 0.25;
            group.add(wingGroup);
        });
        
        // === 足（オレンジ・詳細） ===
        const footMat = new THREE.MeshStandardMaterial({ color: 0xFF8800, roughness: 0.45 });
        [-0.5, 0.5].forEach(xPos => {
            const footGroup = new THREE.Group();
            
            // 足本体
            const footGeo = new THREE.SphereGeometry(0.45, 10, 10);
            const foot = new THREE.Mesh(footGeo, footMat);
            foot.scale.set(1.6, 0.45, 1.4);
            footGroup.add(foot);
            
            // 足の指（3本）
            for (let i = -1; i <= 1; i++) {
                const toeGeo = new THREE.SphereGeometry(0.15, 8, 8);
                const toe = new THREE.Mesh(toeGeo, footMat);
                toe.position.set(i * 0.25, 0, 0.5);
                toe.scale.set(1, 0.8, 1.5);
                footGroup.add(toe);
            }
            
            footGroup.position.set(xPos, 0.35, 0.35);
            group.add(footGroup);
        });
        
        // 黒い縁取り
        this.addOutline(group, 1.06);

        group.position.set(x, 0, z);
        group.scale.set(2, 2, 2);
        this.trackGroup.add(group);
        
        this.enemies.push({
            type: 'penguin',
            mesh: group,
            baseX: x,
            baseZ: z,
            patrolAxis: patrolAxis,
            patrolRange: patrolRange,
            direction: 1,
            speed: 18,
            radius: 4,
            index: index
        });
    }
    
    // テレサ作成（Super Mario 64風 - Boo）
    createBoo(x, z, index) {
        const group = new THREE.Group();
        
        // === 体（丸い白い幽霊） ===
        const bodyGeo = new THREE.SphereGeometry(3, 24, 24);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.2,
            transparent: true,
            opacity: 0.92
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 4;
        body.scale.set(1, 1.05, 0.85);
        group.add(body);
        
        // 体の頬（ピンク）
        const cheekMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFCCDD, 
            roughness: 0.4,
            transparent: true,
            opacity: 0.7
        });
        [-1.8, 1.8].forEach(xPos => {
            const cheekGeo = new THREE.SphereGeometry(0.6, 12, 12);
            const cheek = new THREE.Mesh(cheekGeo, cheekMat);
            cheek.position.set(xPos, 3.5, 2);
            cheek.scale.set(1.2, 0.8, 0.5);
            group.add(cheek);
        });
        
        // === 尻尾（幽霊らしく細くなる） ===
        const tailGeo = new THREE.ConeGeometry(1.8, 4, 16);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.position.y = 1.2;
        tail.rotation.x = Math.PI;
        group.add(tail);
        
        // 尻尾の先端（もっと細く）
        const tailTipGeo = new THREE.ConeGeometry(0.5, 1.5, 8);
        const tailTip = new THREE.Mesh(tailTipGeo, bodyMat);
        tailTip.position.y = -0.5;
        tailTip.rotation.x = Math.PI;
        group.add(tailTip);
        
        // === 腕（短い手） ===
        const armMat = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            roughness: 0.3,
            transparent: true,
            opacity: 0.9
        });
        [-2.8, 2.8].forEach((xPos, i) => {
            const armGeo = new THREE.SphereGeometry(1.0, 14, 14);
            const arm = new THREE.Mesh(armGeo, armMat);
            arm.position.set(xPos, 4.2, 0.8);
            arm.scale.set(1.4, 0.7, 0.75);
            group.add(arm);
        });
        
        // === 目（大きな黒い目・縦長） ===
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        [-1.0, 1.0].forEach(xPos => {
            const eyeGeo = new THREE.SphereGeometry(0.75, 16, 16);
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(xPos, 4.8, 2.3);
            eye.scale.set(0.9, 1.4, 0.55);
            group.add(eye);
        });
        
        // === 眉毛（怒り眉） ===
        const browMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        [-1.0, 1.0].forEach(xPos => {
            const browGeo = new THREE.BoxGeometry(1.0, 0.25, 0.2);
            const brow = new THREE.Mesh(browGeo, browMat);
            brow.position.set(xPos, 5.6, 2.3);
            brow.rotation.z = xPos > 0 ? 0.35 : -0.35;
            group.add(brow);
        });
        
        // === 口（大きく開いた口・牙付き） ===
        const mouthGeo = new THREE.SphereGeometry(1.2, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, 3.3, 1.8);
        mouth.rotation.x = Math.PI * 0.75;
        group.add(mouth);
        
        // 舌（赤・丸い）
        const tongueGeo = new THREE.SphereGeometry(0.55, 12, 12);
        const tongueMat = new THREE.MeshStandardMaterial({ color: 0xFF5555, roughness: 0.5 });
        const tongue = new THREE.Mesh(tongueGeo, tongueMat);
        tongue.position.set(0, 3.0, 2.5);
        tongue.scale.set(1.2, 0.5, 1.3);
        group.add(tongue);
        
        // 牙（白い三角・4本）
        const fangMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const fangPositions = [
            { x: -0.7, y: 3.9, z: 2.3 },
            { x: 0.7, y: 3.9, z: 2.3 },
            { x: -0.35, y: 2.9, z: 2.4, bottom: true },
            { x: 0.35, y: 2.9, z: 2.4, bottom: true },
        ];
        fangPositions.forEach(pos => {
            const fangGeo = new THREE.ConeGeometry(0.18, 0.5, 6);
            const fang = new THREE.Mesh(fangGeo, fangMat);
            fang.position.set(pos.x, pos.y, pos.z);
            fang.rotation.x = pos.bottom ? 0 : Math.PI;
            group.add(fang);
        });

        group.position.set(x, 6, z);
        // 黒い縁取り（テレサ用）
        this.addOutline(group, 1.06);
        this.trackGroup.add(group);
        
        this.enemies.push({
            type: 'boo',
            mesh: group,
            baseX: x,
            baseY: 6,
            baseZ: z,
            floatOffset: Math.random() * Math.PI * 2,
            radius: 4,
            index: index
        });
    }
    
    // ワンワン作成（Super Mario 64風 - Chain Chomp）
    createChainChomp(x, z, index) {
        const group = new THREE.Group();
        
        // === 杭（木製・縞模様） ===
        const stakeMat = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.85
        });
        const stakeGeo = new THREE.CylinderGeometry(0.6, 0.9, 4, 12);
        const stake = new THREE.Mesh(stakeGeo, stakeMat);
        stake.position.y = 2;
        group.add(stake);
        
        // 杭の頭（金属）
        const stakeTopGeo = new THREE.CylinderGeometry(0.8, 0.7, 0.6, 12);
        const stakeTopMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.6 });
        const stakeTop = new THREE.Mesh(stakeTopGeo, stakeTopMat);
        stakeTop.position.y = 4.2;
        group.add(stakeTop);
        
        // === 鎖（リアルな鎖リンク - 動的に追従） ===
        const chainMat = new THREE.MeshStandardMaterial({
            color: 0x555555,
            metalness: 0.85,
            roughness: 0.25
        });
        const chainLinks = [];
        for (let i = 0; i < 12; i++) {
            const linkGeo = new THREE.TorusGeometry(0.5, 0.18, 10, 14);
            const link = new THREE.Mesh(linkGeo, chainMat);
            link.position.set(i * 1.0 + 1.2, 4, 0);
            link.rotation.y = i % 2 === 0 ? 0 : Math.PI / 2;
            link.rotation.z = (i % 2 === 0 ? 0.15 : -0.15);
            group.add(link);
            chainLinks.push(link);
        }
        
        // === ワンワンの頭（大きな黒い球） ===
        const chompGroup = new THREE.Group();
        
        const headGeo = new THREE.SphereGeometry(3.5, 28, 28);
        const headMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2a,
            roughness: 0.35,
            metalness: 0.4
        });
        const head = new THREE.Mesh(headGeo, headMat);
        chompGroup.add(head);
        
        // 頭のハイライト（光沢感）
        const highlightGeo = new THREE.SphereGeometry(1.2, 12, 12);
        const highlightMat = new THREE.MeshBasicMaterial({ 
            color: 0x444455,
            transparent: true,
            opacity: 0.5
        });
        const highlight = new THREE.Mesh(highlightGeo, highlightMat);
        highlight.position.set(-1.5, 2, 1);
        chompGroup.add(highlight);
        
        // === 目（大きな白目＋黒目・怒り眉） ===
        const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        [-1.2, 1.2].forEach(xPos => {
            const eyeGeo = new THREE.SphereGeometry(1.0, 16, 16);
            const eye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
            eye.position.set(xPos, 1.2, 2.8);
            eye.scale.set(0.9, 1.15, 0.6);
            chompGroup.add(eye);
            
            const pupilGeo = new THREE.SphereGeometry(0.5, 12, 12);
            const pupil = new THREE.Mesh(pupilGeo, pupilMat);
            pupil.position.set(xPos, 1.0, 3.3);
            chompGroup.add(pupil);
        });
        
        // 怒り眉
        const browMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        [-1.2, 1.2].forEach(xPos => {
            const browGeo = new THREE.BoxGeometry(1.4, 0.35, 0.25);
            const brow = new THREE.Mesh(browGeo, browMat);
            brow.position.set(xPos, 2.3, 2.9);
            brow.rotation.z = xPos > 0 ? 0.4 : -0.4;
            chompGroup.add(brow);
        });
        
        // === 口（赤い大きな口・金色の歯） ===
        const mouthGeo = new THREE.SphereGeometry(2.2, 20, 16, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.5);
        const mouthMat = new THREE.MeshStandardMaterial({ color: 0xCC0000, roughness: 0.5 });
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, -0.8, 1.8);
        mouth.rotation.x = Math.PI * 0.55;
        chompGroup.add(mouth);
        
        // 歯（金色の大きな三角）
        const toothMat = new THREE.MeshStandardMaterial({ color: 0xFFDD44, metalness: 0.3, roughness: 0.5 });
        // 上の歯
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI - Math.PI / 2;
            const toothGeo = new THREE.ConeGeometry(0.35, 0.9, 6);
            const tooth = new THREE.Mesh(toothGeo, toothMat);
            tooth.position.set(
                Math.sin(angle) * 1.6,
                0.3,
                Math.cos(angle) * 1.0 + 2.5
            );
            tooth.rotation.x = -0.3;
            chompGroup.add(tooth);
        }
        // 下の歯
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI - Math.PI / 2 + Math.PI / 8;
            const toothGeo = new THREE.ConeGeometry(0.3, 0.75, 6);
            const tooth = new THREE.Mesh(toothGeo, toothMat);
            tooth.position.set(
                Math.sin(angle) * 1.5,
                -1.6,
                Math.cos(angle) * 0.9 + 2.3
            );
            tooth.rotation.x = Math.PI + 0.2;
            chompGroup.add(tooth);
        }
        
        chompGroup.position.set(14, 4, 0);
        group.add(chompGroup);
        
        // 黒い縁取り
        this.addOutline(group, 1.06);

        group.position.set(x, 0, z);
        this.trackGroup.add(group);
        
        this.enemies.push({
            type: 'chainChomp',
            mesh: group,
            chompGroup: chompGroup,
            chainLinks: chainLinks,
            baseX: x,
            baseZ: z,
            anchorX: 12,
            angle: 0,
            radius: 5,
            chainLength: 18,
            index: index,
            // モード管理: 'roaming'(自由徘徊) / 'attacking'(カート襲撃)
            mode: 'roaming',
            modeTimer: 5 + Math.random() * 2, // 5〜7秒で切り替え
            modeDuration: 5,  // 各モードの持続時間（秒）
            roamAngle: Math.random() * Math.PI * 2,
            roamTargetAngle: Math.random() * Math.PI * 2,
            roamRadius: 8,
            attackTarget: null
        });
    }
    
    // 敵キャラクターの更新
    updateEnemies(deltaTime) {
        if (!this.enemies || this.enemies.length === 0) {
            return;
        }
        
        this.enemies.forEach((enemy, idx) => {
            if (enemy.type === 'thwomp') {
                this.updateThwomp(enemy, deltaTime);
            } else if (enemy.type === 'koopa') {
                this.updateKoopa(enemy, deltaTime);
            } else if (enemy.type === 'goomba') {
                this.updateGoomba(enemy, deltaTime);
            } else if (enemy.type === 'piranha') {
                this.updatePiranhaPlant(enemy, deltaTime);
            } else if (enemy.type === 'penguin') {
                this.updatePenguin(enemy, deltaTime);
            } else if (enemy.type === 'boo') {
                this.updateBoo(enemy, deltaTime);
            } else if (enemy.type === 'chainChomp') {
                this.updateChainChomp(enemy, deltaTime);
            } else if (enemy.type === 'lakitu') {
                this.updateLakitu(enemy, deltaTime);
            } else if (enemy.type === 'dry_bones') {
                this.updateDryBones(enemy, deltaTime);
            } else if (enemy.type === 'fire_bar') {
                this.updateFireBar(enemy, deltaTime);
            } else if (enemy.type === 'ice_bros') {
                this.updateIceBros(enemy, deltaTime);
            } else if (enemy.type === 'snowman') {
                this.updateWalkingSnowman(enemy, deltaTime);
            }
        });
    }
    
    updateThwomp(thwomp, deltaTime) {
        const mesh = thwomp.mesh;
        
        switch (thwomp.state) {
            case 'waiting':
                thwomp.timer -= deltaTime;
                // 少し揺れる（待機中のアニメーション）
                mesh.position.y = thwomp.baseY + Math.sin(Date.now() * 0.008) * 1;
                if (thwomp.timer <= 0) {
                    thwomp.state = 'falling';
                }
                break;
                
            case 'falling':
                mesh.position.y -= 60 * deltaTime;  // 高速落下
                if (mesh.position.y <= thwomp.lowY) {
                    mesh.position.y = thwomp.lowY;
                    thwomp.state = 'grounded';
                    thwomp.timer = 1.0;  // 地面で待機
                }
                break;
                
            case 'grounded':
                thwomp.timer -= deltaTime;
                // 地面で少し振動
                mesh.position.y = thwomp.lowY + Math.sin(Date.now() * 0.02) * 0.2;
                if (thwomp.timer <= 0) {
                    thwomp.state = 'rising';
                }
                break;
                
            case 'rising':
                mesh.position.y += 20 * deltaTime;  // ゆっくり上昇
                if (mesh.position.y >= thwomp.baseY) {
                    mesh.position.y = thwomp.baseY;
                    thwomp.state = 'waiting';
                    thwomp.timer = 1.5 + Math.random() * 1.5;  // 1.5〜3秒のランダムな待機時間
                }
                break;
        }
    }
    
    updateKoopa(koopa, deltaTime) {
        const mesh = koopa.mesh;
        const speed = koopa.speed * deltaTime;
        
        if (koopa.patrolAxis === 'x') {
            mesh.position.x += koopa.direction * speed;
            if (Math.abs(mesh.position.x - koopa.baseX) > koopa.patrolRange) {
                koopa.direction *= -1;
                mesh.rotation.y = koopa.direction > 0 ? 0 : Math.PI;
            }
        } else {
            mesh.position.z += koopa.direction * speed;
            if (Math.abs(mesh.position.z - koopa.baseZ) > koopa.patrolRange) {
                koopa.direction *= -1;
                mesh.rotation.y = koopa.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
            }
        }
        
        // 歩行アニメーション（上下に揺れる）
        mesh.position.y = 1 + Math.sin(Date.now() * 0.01) * 0.1;
    }
    
    // クリボーの更新（ノコノコと同様のパトロール）
    updateGoomba(goomba, deltaTime) {
        const mesh = goomba.mesh;
        const speed = goomba.speed * deltaTime;
        
        if (goomba.patrolAxis === 'x') {
            mesh.position.x += goomba.direction * speed;
            if (Math.abs(mesh.position.x - goomba.baseX) > goomba.patrolRange) {
                goomba.direction *= -1;
                mesh.rotation.y = goomba.direction > 0 ? 0 : Math.PI;
            }
        } else {
            mesh.position.z += goomba.direction * speed;
            if (Math.abs(mesh.position.z - goomba.baseZ) > goomba.patrolRange) {
                goomba.direction *= -1;
                mesh.rotation.y = goomba.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
            }
        }
        
        // 歩行アニメーション
        mesh.position.y = 0.1 + Math.abs(Math.sin(Date.now() * 0.012)) * 0.3;
    }
    
    // パックンフラワーの更新（土管から出入り）
    updatePiranhaPlant(piranha, deltaTime) {
        piranha.timer -= deltaTime;
        
        switch (piranha.state) {
            case 'hidden':
                piranha.plantGroup.position.y = -5;
                if (piranha.timer <= 0) {
                    piranha.state = 'rising';
                }
                break;
                
            case 'rising':
                piranha.plantGroup.position.y += 8 * deltaTime;
                if (piranha.plantGroup.position.y >= 5) {
                    piranha.plantGroup.position.y = 5;
                    piranha.state = 'attacking';
                    piranha.timer = 2.0;
                }
                // 口を開閉
                break;
                
            case 'attacking':
                // 攻撃中は口をパクパク
                piranha.plantGroup.rotation.y += 2 * deltaTime;
                if (piranha.timer <= 0) {
                    piranha.state = 'lowering';
                }
                break;
                
            case 'lowering':
                piranha.plantGroup.position.y -= 6 * deltaTime;
                if (piranha.plantGroup.position.y <= -5) {
                    piranha.plantGroup.position.y = -5;
                    piranha.state = 'hidden';
                    piranha.timer = 2.0 + Math.random() * 2;
                }
                break;
        }
    }
    
    // ペンギンの更新（よちよち歩き - スライドではなく歩行）
    updatePenguin(penguin, deltaTime) {
        const mesh = penguin.mesh;
        const speed = penguin.speed * deltaTime;
        
        // パトロール移動
        if (penguin.patrolAxis === 'x') {
            mesh.position.x += penguin.direction * speed;
            if (Math.abs(mesh.position.x - penguin.baseX) > penguin.patrolRange) {
                penguin.direction *= -1;
                // 向きを変える時に少しジャンプ
                penguin.jumpTimer = 0.2;
            }
            // 移動方向を向く
            mesh.rotation.y = penguin.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else {
            mesh.position.z += penguin.direction * speed;
            if (Math.abs(mesh.position.z - penguin.baseZ) > penguin.patrolRange) {
                penguin.direction *= -1;
                penguin.jumpTimer = 0.2;
            }
            mesh.rotation.y = penguin.direction > 0 ? 0 : Math.PI;
        }
        
        // よちよち歩きアニメーション
        penguin.walkPhase = (penguin.walkPhase || 0) + deltaTime * 8;
        
        // 左右に体を揺らす（よちよち感）
        mesh.rotation.z = Math.sin(penguin.walkPhase) * 0.2;
        
        // 足踏み感のある上下動
        mesh.position.y = 0.8 + Math.abs(Math.sin(penguin.walkPhase * 2)) * 0.15;
        
        // 向き変更時の小ジャンプ
        if (penguin.jumpTimer && penguin.jumpTimer > 0) {
            penguin.jumpTimer -= deltaTime;
            mesh.position.y += Math.sin(penguin.jumpTimer * Math.PI / 0.2) * 0.5;
        }
        
        // === プレイヤーがいたら少し近づく ===
        const playerKart = window.game?.playerKart;
        if (playerKart && playerKart.mesh) {
            const playerPos = playerKart.mesh.position;
            const dx = playerPos.x - mesh.position.x;
            const dz = playerPos.z - mesh.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            
            // 近くにいたらそっちを向く
            if (dist < 30) {
                const targetAngle = Math.atan2(dx, dz);
                mesh.rotation.y = targetAngle;
            }
        }
    }
    
    // テレサの更新（浮遊、プレイヤーを追いかける）- 改善版
    updateBoo(boo, deltaTime) {
        const mesh = boo.mesh;
        
        // テレサ固有のオフセットを初期化（初回のみ）
        if (boo.wanderAngle === undefined) {
            boo.wanderAngle = Math.random() * Math.PI * 2;
            boo.wanderSpeed = 0.08 + Math.random() * 0.06;    // 角速度（ゆっくり大きく周回）
            boo.wanderRadius = 35 + Math.random() * 20;        // 大きな周回半径（35〜55）
            boo.driftPhaseX = Math.random() * Math.PI * 2;
            boo.driftPhaseZ = Math.random() * Math.PI * 2;
            boo.bobPhase = Math.random() * Math.PI * 2;
            boo.swayPhase = Math.random() * Math.PI * 2;
            boo.zigzagPhase = Math.random() * Math.PI * 2;     // ジグザグ横移動用
        }
        
        // ゆらゆら浮遊タイマー
        boo.floatOffset += deltaTime * 1.5;
        boo.wanderAngle += boo.wanderSpeed * deltaTime;
        boo.driftPhaseX += deltaTime * 0.5;
        boo.driftPhaseZ += deltaTime * 0.35;
        boo.bobPhase += deltaTime * 1.8;
        boo.swayPhase += deltaTime * 0.6;
        boo.zigzagPhase += deltaTime * 0.25;
        
        // === デフォルト動作：走行コース上を大きくフラフラと浮遊 ===
        // 大きな周回軌道（コースを横断するような広い円運動）
        const orbitX = Math.sin(boo.wanderAngle) * boo.wanderRadius;
        const orbitZ = Math.cos(boo.wanderAngle) * boo.wanderRadius;
        
        // 大きな不規則ドリフト（走行コースを横切るような横移動）
        const driftX = Math.sin(boo.driftPhaseX) * 15 + Math.sin(boo.driftPhaseX * 1.7) * 8;
        const driftZ = Math.cos(boo.driftPhaseZ) * 12 + Math.cos(boo.driftPhaseZ * 2.3) * 6;
        
        // ジグザグ横移動（コース上を蛇行）
        const zigzagX = Math.sin(boo.zigzagPhase) * 10 * Math.cos(boo.zigzagPhase * 0.4);
        const zigzagZ = Math.cos(boo.zigzagPhase * 1.3) * 8 * Math.sin(boo.zigzagPhase * 0.6);
        
        // 目標位置（周回＋ドリフト＋ジグザグ → コース上を大きく横移動）
        const targetX = boo.baseX + orbitX + driftX + zigzagX;
        const targetZ = boo.baseZ + orbitZ + driftZ + zigzagZ;
        
        // 現在位置から目標へ緩慢に補間（急に動かない）
        const lerpFactor = 1.5 * deltaTime;
        mesh.position.x += (targetX - mesh.position.x) * lerpFactor;
        mesh.position.z += (targetZ - mesh.position.z) * lerpFactor;
        
        // Y方向：ゆっくりとした上下ボビング
        const baseFloatY = boo.baseY + Math.sin(boo.bobPhase) * 2.5 + Math.sin(boo.bobPhase * 0.6) * 1.2;
        mesh.position.y += (baseFloatY - mesh.position.y) * lerpFactor;
        
        // 左右にゆるく傾く（体の揺れ）
        mesh.rotation.z = Math.sin(boo.swayPhase) * 0.12;
        mesh.rotation.x = Math.sin(boo.swayPhase * 0.7) * 0.06;
        
        // 進行方向をゆるやかに向く
        const moveAngle = Math.atan2(targetX - mesh.position.x, targetZ - mesh.position.z);
        const angleDiff = moveAngle - mesh.rotation.y;
        let adj = angleDiff;
        while (adj > Math.PI) adj -= Math.PI * 2;
        while (adj < -Math.PI) adj += Math.PI * 2;
        mesh.rotation.y += adj * 0.5 * deltaTime;
        
        // 透明度の揺らぎ（幽霊らしく明滅）
        const opacity = 0.5 + Math.sin(boo.floatOffset * 1.2) * 0.2 + Math.sin(boo.floatOffset * 2.7) * 0.1;
        mesh.traverse(child => {
            if (child.isMesh && child.material && child.material.transparent) {
                child.material.opacity = opacity;
            }
        });
    }
    
    // ワンワンの更新（鎖追従＋徘徊/襲撃モード切替）
    updateChainChomp(chomp, deltaTime) {
        const chainLength = chomp.chainLength; // 18
        
        // === モードタイマー管理 ===
        chomp.modeTimer -= deltaTime;
        if (chomp.modeTimer <= 0) {
            // モード切替
            if (chomp.mode === 'roaming') {
                chomp.mode = 'attacking';
            } else {
                chomp.mode = 'roaming';
                chomp.roamTargetAngle = Math.random() * Math.PI * 2;
            }
            chomp.modeTimer = chomp.modeDuration + Math.random() * 2;
        }
        
        if (chomp.mode === 'roaming') {
            // === 徘徊モード: 鎖の半径内を自由にうろつく ===
            // ランダムに方向転換
            chomp.roamAngle += (Math.sin(Date.now() * 0.001 + chomp.index * 3) * 1.5) * deltaTime;
            // ゆっくりターゲット角度に近づく
            const angleDiff = chomp.roamTargetAngle - chomp.roamAngle;
            let adj = angleDiff;
            while (adj > Math.PI) adj -= Math.PI * 2;
            while (adj < -Math.PI) adj += Math.PI * 2;
            chomp.roamAngle += adj * deltaTime * 0.5;
            
            // 半径を変動させる（鎖の長さ以内）
            chomp.roamRadius = 6 + Math.sin(Date.now() * 0.0008 + chomp.index * 5) * 5;
            chomp.roamRadius = Math.min(chomp.roamRadius, chainLength);
            
            chomp.angle = chomp.roamAngle;
            const radius = chomp.roamRadius;
            chomp.chompGroup.position.x = Math.cos(chomp.angle) * radius;
            chomp.chompGroup.position.z = Math.sin(chomp.angle) * radius;
            chomp.chompGroup.position.y = 4 + Math.abs(Math.sin(chomp.angle * 2)) * 1.5;
            
            // 時々方向転換（3秒ごと）
            if (Math.random() < deltaTime * 0.3) {
                chomp.roamTargetAngle = Math.random() * Math.PI * 2;
            }
        } else {
            // === 襲撃モード: 近くのカートに襲いかかる ===
            let nearestKart = null;
            let nearestDist = Infinity;
            const anchorPos = chomp.mesh.position;
            
            // 全カートから最も近いものを探す
            const allKarts = window.game?.karts || [];
            allKarts.forEach(kart => {
                if (kart.isSpunOut) return;
                const dx = kart.position.x - anchorPos.x;
                const dz = kart.position.z - anchorPos.z;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < nearestDist && dist < 60) {
                    nearestDist = dist;
                    nearestKart = kart;
                }
            });
            
            if (nearestKart) {
                // カートの方向に突進
                const dx = nearestKart.position.x - anchorPos.x;
                const dz = nearestKart.position.z - anchorPos.z;
                const targetAngle = Math.atan2(dz, dx);
                
                let angleDiff = targetAngle - chomp.angle;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                
                chomp.angle += angleDiff * deltaTime * 4; // 素早く方向転換
                
                // 射程内に入ると鎖いっぱいまで伸びる
                const agitation = 1 + (1 - Math.min(nearestDist, 60) / 60) * 3;
                const radius = Math.min(chainLength, 4 + agitation * 4);
                
                chomp.chompGroup.position.x = Math.cos(chomp.angle) * radius;
                chomp.chompGroup.position.z = Math.sin(chomp.angle) * radius;
                chomp.chompGroup.position.y = 4 + Math.abs(Math.sin(chomp.angle * agitation * 2)) * 3;
            } else {
                // 近くにカートがいない場合は暴れる
                chomp.angle += deltaTime * 4;
                const radius = 10 + Math.sin(chomp.angle * 3) * 4;
                chomp.chompGroup.position.x = Math.cos(chomp.angle) * Math.min(radius, chainLength);
                chomp.chompGroup.position.z = Math.sin(chomp.angle) * Math.min(radius, chainLength);
                chomp.chompGroup.position.y = 4 + Math.abs(Math.sin(chomp.angle * 4)) * 3;
            }
        }
        
        // ワンワンが動く方向を向く
        chomp.chompGroup.rotation.y = chomp.angle + Math.PI;
        
        // 噛みつきアニメーション（襲撃モードは激しく）
        const biteSpeed = chomp.mode === 'attacking' ? 8 : 3;
        chomp.chompGroup.rotation.x = Math.sin(chomp.angle * biteSpeed) * (chomp.mode === 'attacking' ? 0.35 : 0.15);
        
        // === 鎖リンクをワンワンの位置に沿って配置 ===
        if (chomp.chainLinks && chomp.chainLinks.length > 0) {
            const chompLocalX = chomp.chompGroup.position.x;
            const chompLocalZ = chomp.chompGroup.position.z;
            const chompLocalY = chomp.chompGroup.position.y;
            const numLinks = chomp.chainLinks.length;
            
            for (let i = 0; i < numLinks; i++) {
                const t = (i + 1) / (numLinks + 1); // 杭(0)からワンワン(1)の間
                const link = chomp.chainLinks[i];
                // 杭の先端(0, 4.2, 0)からワンワンの位置まで補間
                link.position.x = chompLocalX * t;
                link.position.z = chompLocalZ * t;
                // Y座標: 少し垂れ下がるカテナリー風カーブ
                const sag = Math.sin(t * Math.PI) * -1.5; // 真ん中が垂れる
                link.position.y = 4.2 + (chompLocalY - 4.2) * t + sag;
                // リンクの向きを次のリンク方向に
                link.rotation.y = Math.atan2(chompLocalZ, chompLocalX);
                link.rotation.z = (i % 2 === 0 ? 0.15 : -0.15);
            }
        }
    }
    
    // ジュゲムの更新（トラックに沿って巡回、たまに小亀を投下）
    updateLakitu(lakitu, deltaTime) {
        const mesh = lakitu.mesh;
        const points = this.trackPoints;
        if (!points || points.length === 0) return;
        
        // 初回：最も近いトラックポイントを探す
        if (lakitu.trackIndex < 0) {
            let minDist = Infinity;
            for (let i = 0; i < points.length; i++) {
                const d = Math.pow(points[i].x - mesh.position.x, 2) + Math.pow(points[i].z - mesh.position.z, 2);
                if (d < minDist) {
                    minDist = d;
                    lakitu.trackIndex = i;
                }
            }
        }
        
        // トラックポイントに沿って移動
        const target = points[lakitu.trackIndex];
        const dx = target.x - mesh.position.x;
        const dz = target.z - mesh.position.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        
        if (dist < 5) {
            // 次のポイントへ進む（ループ）
            lakitu.trackIndex = (lakitu.trackIndex + 1) % points.length;
        } else {
            // ターゲットに向かって移動
            const moveSpeed = lakitu.speed * deltaTime;
            mesh.position.x += (dx / dist) * moveSpeed;
            mesh.position.z += (dz / dist) * moveSpeed;
        }
        
        // 進行方向を向く
        mesh.rotation.y = Math.atan2(dx, dz);
        
        // 浮遊アニメーション
        lakitu.angle += deltaTime * 2;
        mesh.position.y = lakitu.baseY + Math.sin(lakitu.angle) * 3;
        
        // === 亀を定期的にコース上に投下 ===
        lakitu.throwTimer -= deltaTime;
        if (lakitu.throwTimer <= 0) {
            lakitu.throwTimer = lakitu.throwInterval;
            this.lakituThrowTurtle(lakitu);
        }
        
        // 投げた亀を更新
        this.updateThrownTurtles(lakitu, deltaTime);
    }
    
    // ジュゲムが小さなカメを投下（改良版デザイン）
    lakituThrowTurtle(lakitu) {
        const turtleGroup = new THREE.Group();
        
        // === 甲羅（緑・立体感のあるドーム） ===
        const shellMainMat = new THREE.MeshStandardMaterial({ 
            color: 0x22AA22, 
            roughness: 0.3,
            metalness: 0.1
        });
        const shellGeo = new THREE.SphereGeometry(1.2, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55);
        const shell = new THREE.Mesh(shellGeo, shellMainMat);
        // ドームが上向き（回転なし）
        shell.position.y = 0.4;
        turtleGroup.add(shell);
        
        // 甲羅の底面
        const shellBtmGeo = new THREE.CircleGeometry(1.1, 18);
        const shellBtmMat = new THREE.MeshStandardMaterial({ color: 0xFFF8DC, roughness: 0.6 });
        const shellBtm = new THREE.Mesh(shellBtmGeo, shellBtmMat);
        shellBtm.rotation.x = -Math.PI / 2;
        shellBtm.position.y = 0.41;
        turtleGroup.add(shellBtm);
        
        // 甲羅の六角形模様（黒輪郭付き）
        const hexLineMat2 = new THREE.MeshStandardMaterial({ color: 0x003300, roughness: 0.4 });
        const hexFillMat2 = new THREE.MeshStandardMaterial({ color: 0x118811, roughness: 0.35 });
        
        // 中心の六角形
        const cHexOut = new THREE.Mesh(new THREE.CircleGeometry(0.35, 6), hexLineMat2);
        cHexOut.position.set(0, 1.05, 0);
        cHexOut.rotation.x = -Math.PI / 2;
        turtleGroup.add(cHexOut);
        const cHexIn = new THREE.Mesh(new THREE.CircleGeometry(0.28, 6), hexFillMat2);
        cHexIn.position.set(0, 1.06, 0);
        cHexIn.rotation.x = -Math.PI / 2;
        turtleGroup.add(cHexIn);
        
        // 周囲の六角形
        for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            const hr = 0.6;
            const hx2 = Math.sin(a) * hr;
            const hz2 = Math.cos(a) * hr;
            const hy2 = 0.4 + Math.sqrt(Math.max(0, 1.2*1.2 - hx2*hx2 - hz2*hz2)) - 0.02;
            
            const hexOut = new THREE.Mesh(new THREE.CircleGeometry(0.22, 6), hexLineMat2);
            hexOut.position.set(hx2, hy2, hz2);
            hexOut.lookAt(hx2 * 3, hy2 + (hy2 - 0.4) * 3, hz2 * 3);
            turtleGroup.add(hexOut);
            
            const hexIn = new THREE.Mesh(new THREE.CircleGeometry(0.16, 6), hexFillMat2);
            hexIn.position.set(hx2, hy2 + 0.01, hz2);
            hexIn.lookAt(hx2 * 3, hy2 + 0.01 + (hy2 - 0.4) * 3, hz2 * 3);
            turtleGroup.add(hexIn);
        }
        
        // 甲羅の白い縁（リング）
        const rimGeo = new THREE.TorusGeometry(1.1, 0.1, 8, 20);
        const rimMat = new THREE.MeshStandardMaterial({ color: 0xFFFFF0, roughness: 0.5 });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.45;
        turtleGroup.add(rim);
        
        // お腹（クリーム色の底面）
        const bellyGeo = new THREE.CircleGeometry(1.0, 18);
        const bellyMat = new THREE.MeshStandardMaterial({ color: 0xFFF8DC, roughness: 0.6 });
        const belly = new THREE.Mesh(bellyGeo, bellyMat);
        belly.rotation.x = Math.PI / 2;
        belly.position.y = 0.42;
        turtleGroup.add(belly);
        
        // === 頭（黄緑色、丸い） ===
        const headMat = new THREE.MeshStandardMaterial({ color: 0x66CC33, roughness: 0.5 });
        const headGeo = new THREE.SphereGeometry(0.55, 12, 12);
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.set(0, 0.5, 1.15);
        turtleGroup.add(head);
        
        // 頬（ピンク）
        const cheekMat = new THREE.MeshStandardMaterial({ color: 0xFF9999, roughness: 0.6 });
        [-0.35, 0.35].forEach(xPos => {
            const cheekGeo = new THREE.SphereGeometry(0.12, 8, 8);
            const cheek = new THREE.Mesh(cheekGeo, cheekMat);
            cheek.position.set(xPos, 0.38, 1.45);
            turtleGroup.add(cheek);
        });
        
        // 目（白目＋黒目）
        const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const eyeBlackMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
        [-0.2, 0.2].forEach(xPos => {
            // 白目
            const whiteGeo = new THREE.SphereGeometry(0.16, 10, 10);
            const white = new THREE.Mesh(whiteGeo, eyeWhiteMat);
            white.position.set(xPos, 0.58, 1.5);
            turtleGroup.add(white);
            // 黒目
            const pupilGeo = new THREE.SphereGeometry(0.09, 8, 8);
            const pupil = new THREE.Mesh(pupilGeo, eyeBlackMat);
            pupil.position.set(xPos, 0.58, 1.63);
            turtleGroup.add(pupil);
        });
        
        // 口（にっこり）
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x331111 });
        const mouthGeo = new THREE.TorusGeometry(0.12, 0.03, 6, 8, Math.PI);
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, 0.38, 1.58);
        mouth.rotation.x = 0.15;
        turtleGroup.add(mouth);
        
        // === 足（4本、丸みのある黄色い足） ===
        const footMat = new THREE.MeshStandardMaterial({ color: 0xFFCC22, roughness: 0.5 });
        const footPositions = [
            { x: -0.7, z: 0.7 },   // 左前
            { x: 0.7, z: 0.7 },    // 右前
            { x: -0.6, z: -0.5 },  // 左後
            { x: 0.6, z: -0.5 }    // 右後
        ];
        footPositions.forEach(fp => {
            const footGeo = new THREE.SphereGeometry(0.28, 10, 10);
            const foot = new THREE.Mesh(footGeo, footMat);
            foot.position.set(fp.x, 0.12, fp.z);
            foot.scale.set(1, 0.5, 1.3);
            turtleGroup.add(foot);
        });
        
        // === しっぽ（短い三角） ===
        const tailMat = new THREE.MeshStandardMaterial({ color: 0x66CC33, roughness: 0.5 });
        const tailGeo = new THREE.ConeGeometry(0.15, 0.6, 8);
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.position.set(0, 0.35, -1.0);
        tail.rotation.x = Math.PI / 2.5;
        turtleGroup.add(tail);
        
        this.addOutline(turtleGroup, 1.06);
        
        // 投下位置（ジュゲムの真下）
        const startX = lakitu.mesh.position.x;
        const startZ = lakitu.mesh.position.z;
        const startY = lakitu.mesh.position.y;
        
        turtleGroup.position.set(startX, startY, startZ);
        turtleGroup.scale.set(1.5, 1.5, 1.5);
        this.trackGroup.add(turtleGroup);
        
        // 投げた亀データ
        const turtle = {
            mesh: turtleGroup,
            x: startX,
            z: startZ,
            y: startY,
            velocityY: 2,       // 初期上昇速度
            landed: false,
            lifetime: 12,       // 生存時間（秒）
            patrolAngle: Math.random() * Math.PI * 2,
            patrolSpeed: 15 + Math.random() * 10,
            radius: 2.5
        };
        
        if (!lakitu.thrownTurtles) lakitu.thrownTurtles = [];
        lakitu.thrownTurtles.push(turtle);
    }
    
    // 投げた亀を更新
    updateThrownTurtles(lakitu, deltaTime) {
        if (!lakitu.thrownTurtles) return;
        
        for (let i = lakitu.thrownTurtles.length - 1; i >= 0; i--) {
            const turtle = lakitu.thrownTurtles[i];
            
            if (!turtle.landed) {
                // 落下中（放物線）
                turtle.velocityY -= 30 * deltaTime; // 重力
                turtle.y += turtle.velocityY * deltaTime;
                
                if (turtle.y <= 1.5) {
                    turtle.y = 1.5;
                    turtle.landed = true;
                }
                turtle.mesh.position.y = turtle.y;
                turtle.mesh.rotation.x += deltaTime * 5;
            } else {
                // 着地後：コース上を歩き回る
                turtle.patrolAngle += deltaTime * 1.5;
                turtle.x += Math.cos(turtle.patrolAngle) * turtle.patrolSpeed * deltaTime;
                turtle.z += Math.sin(turtle.patrolAngle) * turtle.patrolSpeed * deltaTime;
                
                turtle.mesh.position.x = turtle.x;
                turtle.mesh.position.z = turtle.z;
                turtle.mesh.position.y = 1.5;
                turtle.mesh.rotation.y = turtle.patrolAngle + Math.PI / 2;
            }
            
            // 寿命管理
            turtle.lifetime -= deltaTime;
            if (turtle.lifetime <= 0) {
                this.trackGroup.remove(turtle.mesh);
                lakitu.thrownTurtles.splice(i, 1);
                continue;
            }
            
            // プレイヤーとの当たり判定
            if (turtle.landed) {
                const player = window.game?.playerKart;
                if (player) {
                    const dx = player.position.x - turtle.x;
                    const dz = player.position.z - turtle.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist < turtle.radius) {
                        // ヒット！カートをスピンアウト
                        if (typeof player.spinOut === 'function') {
                            player.spinOut();
                        }
                        this.trackGroup.remove(turtle.mesh);
                        lakitu.thrownTurtles.splice(i, 1);
                    }
                }
            }
        }
    }
    
    // カロン（ガイコツノコノコ）の更新
    updateDryBones(dryBones, deltaTime) {
        const mesh = dryBones.mesh;
        
        // クールダウンタイマー更新
        if (dryBones.cooldownTimer > 0) {
            dryBones.cooldownTimer -= deltaTime;
            if (dryBones.cooldownTimer <= 0) {
                dryBones.cooldownTimer = 0;
                dryBones.state = 'patrol';
            }
        }
        
        // プレイヤー追尾ロジック（クールダウン中は追跡しない）
        const player = window.game?.playerKart;
        let chase = false;
        
        if (player && dryBones.state !== 'cooldown') {
            const dx = player.position.x - mesh.position.x;
            const dz = player.position.z - mesh.position.z;
            const distSq = dx * dx + dz * dz;
            
            // 55ユニット以内なら追跡
            if (distSq < 55 * 55) {
                chase = true;
                dryBones.state = 'chase';
                const angle = Math.atan2(dx, dz);
                
                // 向きをプレイヤーの方へ
                mesh.lookAt(player.position);
                
                // 前進（追跡は少し速い）
                const speed = dryBones.speed * deltaTime * 1.1;
                mesh.position.x += Math.sin(angle) * speed;
                mesh.position.z += Math.cos(angle) * speed;
            }
        }
        
        // 追跡していない時はうろうろ歩き回る
        if (!chase) {
            if (dryBones.state !== 'cooldown') {
                dryBones.state = 'patrol';
            }
            
            // ランダム方向転換タイマー
            dryBones.wanderChangeTimer -= deltaTime;
            if (dryBones.wanderChangeTimer <= 0) {
                dryBones.wanderAngle += (Math.random() - 0.5) * Math.PI * 0.8;
                dryBones.wanderChangeTimer = 1.5 + Math.random() * 2.5;
            }
            
            const speed = dryBones.speed * deltaTime * 0.4;
            mesh.position.x += Math.sin(dryBones.wanderAngle) * speed;
            mesh.position.z += Math.cos(dryBones.wanderAngle) * speed;
            
            // 基地から離れすぎたら戻る
            const distFromBase = Math.sqrt(
                (mesh.position.x - dryBones.baseX) ** 2 +
                (mesh.position.z - dryBones.baseZ) ** 2
            );
            if (distFromBase > dryBones.patrolRange * 1.5) {
                dryBones.wanderAngle = Math.atan2(
                    dryBones.baseX - mesh.position.x,
                    dryBones.baseZ - mesh.position.z
                );
            }
            
            // 歩く方向に顔を向ける
            mesh.lookAt(
                mesh.position.x + Math.sin(dryBones.wanderAngle) * 10,
                mesh.position.y,
                mesh.position.z + Math.cos(dryBones.wanderAngle) * 10
            );
        }
        
        // ガクガクした歩きアニメーション（カロン特有のカタカタ動き）
        const walkCycle = Date.now() * 0.008;
        // Y位置: ベース高さ（地面より少し浮く） + 歩行バウンス
        const baseY = 1.2;
        const bounce = Math.abs(Math.sin(walkCycle * 2)) * 0.35;
        mesh.position.y = baseY + bounce;
        
        // カタカタした体の揺れ
        mesh.rotation.z = Math.sin(walkCycle) * 0.06;
        mesh.rotation.x = Math.sin(walkCycle * 1.3 + 0.5) * 0.03;
        
        // 頭蓋骨のカタカタ（顎の開閉・首のガクガク）
        if (dryBones.skullGroup) {
            dryBones.skullGroup.rotation.x = Math.sin(walkCycle * 1.5) * 0.1;
            dryBones.skullGroup.rotation.z = Math.sin(walkCycle * 0.9) * 0.04;
            
            // 追跡中は目が明るく
            dryBones.skullGroup.children.forEach(child => {
                if (child.material && child.material.emissive) {
                    child.material.emissiveIntensity = chase ? 2.5 : 0.8;
                }
                // 炎エフェクトの揺らぎ
                if (child.userData && child.userData.isFlame) {
                    child.scale.y = 0.8 + Math.sin(walkCycle * 4 + child.position.x * 3) * 0.3;
                    child.scale.x = 0.85 + Math.sin(walkCycle * 3) * 0.15;
                }
            });
        }
        
        // 足のアニメーション（グループ内の脚パーツを揺らす）
        let childIdx = 0;
        mesh.children.forEach(child => {
            if (child.userData && child.userData.isLeg) {
                const phase = childIdx * Math.PI;  // 左右で逆位相
                child.rotation.x = Math.sin(walkCycle * 2 + phase) * 0.3;
                childIdx++;
            }
        });
        
        // 腕の揺れアニメーション
        let armIdx = 0;
        mesh.children.forEach(child => {
            if (child.userData && child.userData.isArm) {
                const phase = armIdx * Math.PI + Math.PI * 0.5;
                child.rotation.x = Math.sin(walkCycle * 2 + phase) * 0.15;
                child.rotation.z = Math.sin(walkCycle * 1.2 + armIdx * 2) * 0.05;
                armIdx++;
            }
        });
    }
    
    // カロンがカートをクラッシュさせた後に呼ぶ
    startDryBonesCooldown(dryBones) {
        dryBones.state = 'cooldown';
        dryBones.cooldownTimer = dryBones.cooldownDuration;
    }
    
    // ファイアバーの更新（完全な縦回転 - 下を通過可能）
    updateFireBar(fireBar, deltaTime) {
        fireBar.angle = (fireBar.angle + fireBar.rotationSpeed * deltaTime) % (Math.PI * 2);
        
        // バー全体をZ軸周りに回転（縦回転）
        if (fireBar.fireBar) {
            fireBar.fireBar.rotation.z = fireBar.angle;
        }
        
        // 炎の明滅効果
        const intensity = 1.2 + Math.sin(fireBar.angle * 4) * 0.5;
        fireBar.fireBar.children.forEach(child => {
            if (child.type === 'PointLight') {
                child.intensity = intensity;
            }
        });
    }
    
    // アイスブロスの更新（歩き回り＋カート接近時に追跡）
    updateIceBros(iceBros, deltaTime) {
        const mesh = iceBros.mesh;
        iceBros.timer = (iceBros.timer || 0) + deltaTime;
        iceBros.walkPhase = (iceBros.walkPhase || 0) + deltaTime;
        
        // === カート検出（最寄りのカートを探す）===
        let nearestKart = null;
        let nearestDist = Infinity;
        const allKarts = window.game?.karts || [];
        allKarts.forEach(kart => {
            if (kart.isSpunOut) return;
            const dx = kart.position.x - mesh.position.x;
            const dz = kart.position.z - mesh.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestKart = kart;
            }
        });
        
        const chaseRange = iceBros.chaseRange || 50;
        const walkSpeed = iceBros.walkSpeed || 6;
        const wanderRadius = iceBros.wanderRadius || 40;
        
        if (nearestKart && nearestDist < chaseRange) {
            // === 追跡モード: カートにゆっくり近づく ===
            iceBros.state = 'chase';
            const dx = nearestKart.position.x - mesh.position.x;
            const dz = nearestKart.position.z - mesh.position.z;
            const targetAngle = Math.atan2(dx, dz);
            
            // 向きをゆっくりカート方向に
            let angleDiff = targetAngle - iceBros.walkAngle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            iceBros.walkAngle += angleDiff * deltaTime * 2;
            
            // ゆっくり接近（通常速度の0.8倍）
            const chaseSpeed = walkSpeed * 0.8;
            mesh.position.x += Math.sin(iceBros.walkAngle) * chaseSpeed * deltaTime;
            mesh.position.z += Math.cos(iceBros.walkAngle) * chaseSpeed * deltaTime;
        } else {
            // === 彷徨いモード: ランダムに歩き回る ===
            iceBros.state = 'wander';
            
            // 方向転換タイマー
            iceBros.dirChangeTimer -= deltaTime;
            if (iceBros.dirChangeTimer <= 0) {
                iceBros.walkAngle += (Math.random() - 0.5) * Math.PI * 1.2;
                iceBros.dirChangeTimer = 2 + Math.random() * 4;
            }
            
            // 前進
            mesh.position.x += Math.sin(iceBros.walkAngle) * walkSpeed * deltaTime;
            mesh.position.z += Math.cos(iceBros.walkAngle) * walkSpeed * deltaTime;
            
            // 基点からの距離制限（wanderRadius以内に留める）
            const distFromBase = Math.sqrt(
                Math.pow(mesh.position.x - iceBros.baseX, 2) +
                Math.pow(mesh.position.z - iceBros.baseZ, 2)
            );
            if (distFromBase > wanderRadius) {
                // 基点に向かって方向転換
                const toBaseAngle = Math.atan2(
                    iceBros.baseX - mesh.position.x,
                    iceBros.baseZ - mesh.position.z
                );
                iceBros.walkAngle = toBaseAngle + (Math.random() - 0.5) * 0.6;
            }
        }
        
        // 現在座標を記録
        iceBros.currentX = mesh.position.x;
        iceBros.currentZ = mesh.position.z;
        
        // === 歩行アニメーション ===
        const walkCycle = iceBros.walkPhase * 3.5;
        // 体を左右に揺らす（歩行感）
        mesh.rotation.z = Math.sin(walkCycle) * 0.08;
        // 足踏みアニメーション（上下に小さく弾む）
        mesh.position.y = Math.abs(Math.sin(walkCycle * 2)) * 0.6;
        // 腕を振る動き
        const armSwing = Math.sin(walkCycle) * 0.2;
        mesh.rotation.x = armSwing * 0.05;
        
        // 向きを進行方向に
        mesh.rotation.y = iceBros.walkAngle;
        
        // 追跡中は少し前傾姿勢
        if (iceBros.state === 'chase') {
            mesh.rotation.x = 0.08;
        }
    }
    
    // 歩く雪だるまの更新
    updateWalkingSnowman(snowman, deltaTime) {
        const mesh = snowman.mesh;
        const speed = snowman.speed || 8;
        
        // パトロール移動
        if (snowman.patrolAxis === 'x') {
            mesh.position.x += snowman.direction * speed * deltaTime;
            if (Math.abs(mesh.position.x - snowman.baseX) > snowman.patrolRange) {
                snowman.direction *= -1;
            }
            mesh.rotation.y = snowman.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else {
            mesh.position.z += snowman.direction * speed * deltaTime;
            if (Math.abs(mesh.position.z - snowman.baseZ) > snowman.patrolRange) {
                snowman.direction *= -1;
            }
            mesh.rotation.y = snowman.direction > 0 ? 0 : Math.PI;
        }
        
        // ゆらゆら歩きアニメーション
        mesh.rotation.z = Math.sin(Date.now() * 0.005) * 0.08;
        mesh.position.y = Math.abs(Math.sin(Date.now() * 0.008)) * 0.3;
    }
    
    // 敵との衝突判定
    checkEnemyCollision(kartPosition) {
        for (const enemy of this.enemies) {
            const enemyPos = enemy.mesh.position;
            let dx = kartPosition.x - enemyPos.x;
            let dz = kartPosition.z - enemyPos.z;
            let dist = Math.sqrt(dx * dx + dz * dz);
            
            // ドッスンは落下中・地面にいる時のみ当たり判定
            if (enemy.type === 'thwomp') {
                if ((enemy.state === 'falling' || enemy.state === 'grounded') && 
                    dist < enemy.radius && Math.abs(kartPosition.y - enemyPos.y) < 8) {
                    return enemy;
                }
            } else if (enemy.type === 'koopa' || enemy.type === 'goomba' || enemy.type === 'penguin' || enemy.type === 'dry_bones' || enemy.type === 'ice_bros' || enemy.type === 'snowman') {
                if (dist < enemy.radius) {
                    return enemy;
                }
            } else if (enemy.type === 'piranha') {
                // パックンフラワーは出ている時のみ
                if (enemy.state === 'attacking' || enemy.state === 'rising') {
                    if (dist < enemy.radius) {
                        return enemy;
                    }
                }
            } else if (enemy.type === 'boo') {
                if (dist < enemy.radius) {
                    return enemy;
                }
            } else if (enemy.type === 'chainChomp') {
                // ワンワンの位置を計算
                const chompWorldX = enemyPos.x + enemy.chompGroup.position.x;
                const chompWorldZ = enemyPos.z + enemy.chompGroup.position.z;
                dx = kartPosition.x - chompWorldX;
                dz = kartPosition.z - chompWorldZ;
                dist = Math.sqrt(dx * dx + dz * dz);
                if (dist < enemy.radius) {
                    return enemy;
                }
            } else if (enemy.type === 'lakitu') {
                // ジュゲムは空中なので高さも考慮
                const dy = kartPosition.y - enemyPos.y;
                const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (dist3D < enemy.radius) {
                    return enemy;
                }
            } else if (enemy.type === 'fire_bar') {
                // ファイアバーは実際の炎の位置に沿った線分当たり判定
                if (kartPosition.y < 8 && enemy.fireBar) {
                    const barAngle = enemy.angle;
                    const barLength = enemy.barLength || 30;
                    const parentYaw = enemy.mesh.rotation.y || 0;
                    
                    // バーの回転角度から現在の端点を計算
                    // 縦回転(Z軸)なので、バーの先端のXローカル = cos(barAngle)*barLength
                    // バーの先端のYローカル = sin(barAngle)*barLength
                    const tipLocalX = Math.cos(barAngle) * barLength;
                    const tipLocalY = Math.sin(barAngle) * barLength;
                    
                    // 炎が低い位置にある時のみ当たる（カートの高さ付近）
                    const barCenterY = enemyPos.y; // 支柱の中心Y
                    const tipWorldY = barCenterY + tipLocalY;
                    
                    // バーの各炎珠をチェック（線分に沿ってサンプリング）
                    const numChecks = 8;
                    for (let ci = 1; ci <= numChecks; ci++) {
                        const t = ci / numChecks;
                        const checkLocalX = Math.cos(barAngle) * barLength * t;
                        const checkLocalY = Math.sin(barAngle) * barLength * t;
                        const checkWorldY = barCenterY + checkLocalY;
                        
                        // 炎がカート高度付近（Y座標差が4以内）の時のみ判定
                        if (Math.abs(checkWorldY - kartPosition.y) < 4) {
                            // ローカルXをワールド座標に変換（parentYawで回転）
                            const worldCheckX = enemyPos.x + Math.cos(parentYaw) * checkLocalX;
                            const worldCheckZ = enemyPos.z + Math.sin(parentYaw) * checkLocalX;
                            
                            const cdx = kartPosition.x - worldCheckX;
                            const cdz = kartPosition.z - worldCheckZ;
                            const checkDist = Math.sqrt(cdx * cdx + cdz * cdz);
                            
                            // 炎珠の半径 (~1.5) とカートの半径で判定
                            if (checkDist < 3.0) {
                                return enemy;
                            }
                        }
                    }
                }
            }
        }
        return null;
    }

    addSceneryMountains() {
        // コース外側に装飾用の山を配置（コースを塞がない位置）
        const mountainGroup = new THREE.Group();
        
        const baseColors = [0x4a8a4a, 0x5aa65a, 0x3f7a3f];
        
        // 山脈 - コースの外側に配置
        const mountains = [
            // 南西エリア（コース外側）
            { x: -300, z: -280, radius: 60, height: 90 },
            { x: -350, z: -200, radius: 45, height: 65 },
            
            // 北西エリア（コース外側）
            { x: -300, z: 280, radius: 55, height: 80 },
            { x: -280, z: 350, radius: 40, height: 55 },
            
            // 北東エリア（コース外側）
            { x: 300, z: 280, radius: 50, height: 70 },
            { x: 350, z: 200, radius: 35, height: 50 },
            
            // 南東エリア（コース外側）
            { x: 320, z: -280, radius: 55, height: 75 },
        ];
        
        mountains.forEach((m, idx) => {
            const mountainGeo = new THREE.ConeGeometry(m.radius, m.height, 8);
            const mountainMat = new THREE.MeshStandardMaterial({
                color: baseColors[idx % baseColors.length],
                roughness: 0.9
            });
            const mountain = new THREE.Mesh(mountainGeo, mountainMat);
            mountain.position.set(m.x, m.height / 2, m.z);
            mountain.castShadow = true;
            
            // 山への衝突判定を追加
            mountain.userData.isCollidable = true;
            mountain.userData.wallType = 'mountain';
            this.collidableObjects.push(mountain);
            
            mountainGroup.add(mountain);
            
            // 雪をかぶった頂上（高い山のみ）
            if (m.height > 60) {
                const snowGeo = new THREE.ConeGeometry(m.radius * 0.3, m.height * 0.25, 8);
                const snowMat = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.8
                });
                const snow = new THREE.Mesh(snowGeo, snowMat);
                snow.position.set(m.x, m.height * 0.9, m.z);
                mountainGroup.add(snow);
            }
            
            // 山の裾に丸い丘を追加（マリオ風の柔らかいシルエット）
            const hillGeo = new THREE.SphereGeometry(m.radius * 0.6, 8, 6);
            const hillMat = new THREE.MeshStandardMaterial({
                color: 0x5fbf5f,
                roughness: 0.95
            });
            const hill = new THREE.Mesh(hillGeo, hillMat);
            hill.position.set(m.x + (idx % 2 === 0 ? 20 : -20), m.height * 0.15, m.z + (idx % 2 === 0 ? -25 : 25));
            hill.scale.y = 0.35;
            mountainGroup.add(hill);
        });
        
        this.trackGroup.add(mountainGroup);
        
        // 装飾用の岩（コース外側）- 衝突判定付き
        this.addSceneryRocks();
    }
    
    addSceneryRocks() {
        // コース外側に装飾用の岩を配置
        const rocks = [
            // コース外周の装飾岩
            { x: -280, z: -100, size: 12, type: 'large' },
            { x: 300, z: 50, size: 14, type: 'large' },
            { x: -250, z: 150, size: 10, type: 'large' },
            { x: 280, z: -150, size: 11, type: 'large' },
            
            { x: -260, z: 50, size: 7, type: 'medium' },
            { x: 280, z: 150, size: 8, type: 'medium' },
            { x: -240, z: -180, size: 7, type: 'medium' },
            { x: 260, z: -50, size: 6, type: 'medium' },
            
            { x: -270, z: 0, size: 4, type: 'small' },
            { x: 290, z: 100, size: 5, type: 'small' },
            { x: -250, z: 250, size: 4, type: 'small' },
            { x: 270, z: -100, size: 5, type: 'small' },
        ];
        
        rocks.forEach(rock => {
            const rockGeo = new THREE.DodecahedronGeometry(rock.size, 1);
            const rockMat = new THREE.MeshStandardMaterial({
                color: rock.type === 'large' ? 0x555555 : 
                       rock.type === 'medium' ? 0x666666 : 0x777777,
                roughness: 1.0
            });
            const rockMesh = new THREE.Mesh(rockGeo, rockMat);
            rockMesh.position.set(rock.x, rock.size * 0.6, rock.z);
            rockMesh.rotation.set(Math.random() * 0.5, Math.random() * Math.PI * 2, Math.random() * 0.5);
            rockMesh.castShadow = true;
            
            // 岩への衝突判定を追加
            rockMesh.userData.isCollidable = true;
            rockMesh.userData.wallType = 'rock';
            this.collidableObjects.push(rockMesh);
            
            this.trackGroup.add(rockMesh);
        });
    }
    
    // 草原コース用の木製フェンス（コース両側に沿って配置）
    addGrasslandFences() {
        const woodMat = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513, 
            roughness: 0.9 
        });
        const postMat = new THREE.MeshStandardMaterial({ 
            color: 0x654321, 
            roughness: 0.85 
        });
        
        const fenceHeight = 2.0;
        const postRadius = 0.25;
        const fenceOffset = 8; // コースからの距離
        
        // ゴール付近（Z座標が-200〜-100の範囲）をスキップするための判定関数
        const isNearGoal = (z) => z > -210 && z < -90;
        
        // 内側のフェンス（コース全周）
        for (let i = 0; i < this.innerBoundary.length - 1; i += 15) {
            const curr = this.innerBoundary[i];
            const next = this.innerBoundary[Math.min(i + 15, this.innerBoundary.length - 1)];
            if (!curr || !next) continue;
            
            // ゴール付近はフェンスをスキップ（バッテン形状を防止）
            if (isNearGoal(curr.z) || isNearGoal(next.z)) continue;
            
            // コース内側方向にオフセット
            const midX = (curr.x + next.x) / 2;
            const midZ = (curr.z + next.z) / 2;
            const toCenter = Math.atan2(midZ, midX);
            const offsetX = Math.cos(toCenter) * fenceOffset;
            const offsetZ = Math.sin(toCenter) * fenceOffset;
            
            const dx = next.x - curr.x;
            const dz = next.z - curr.z;
            const length = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(dz, dx);
            
            // フェンスポスト
            const postGeo = new THREE.CylinderGeometry(postRadius, postRadius * 1.2, fenceHeight + 0.5, 6);
            const post = new THREE.Mesh(postGeo, postMat);
            post.position.set(curr.x + offsetX * 0.5, fenceHeight / 2, curr.z + offsetZ * 0.5);
            this.trackGroup.add(post);
            
            // 横木
            const railGeo = new THREE.BoxGeometry(length, 0.15, 0.12);
            const rail1 = new THREE.Mesh(railGeo, woodMat);
            rail1.position.set(
                (curr.x + next.x) / 2 + offsetX * 0.5,
                fenceHeight * 0.7,
                (curr.z + next.z) / 2 + offsetZ * 0.5
            );
            rail1.rotation.y = -angle;
            this.trackGroup.add(rail1);
            
            const rail2 = new THREE.Mesh(railGeo.clone(), woodMat);
            rail2.position.set(
                (curr.x + next.x) / 2 + offsetX * 0.5,
                fenceHeight * 0.35,
                (curr.z + next.z) / 2 + offsetZ * 0.5
            );
            rail2.rotation.y = -angle;
            this.trackGroup.add(rail2);
        }
        
        // 外側のフェンス（コース全周）
        for (let i = 0; i < this.outerBoundary.length - 1; i += 15) {
            const curr = this.outerBoundary[i];
            const next = this.outerBoundary[Math.min(i + 15, this.outerBoundary.length - 1)];
            if (!curr || !next) continue;
            
            // ゴール付近はフェンスをスキップ（バッテン形状を防止）
            if (isNearGoal(curr.z) || isNearGoal(next.z)) continue;
            
            // コース外側方向にオフセット
            const midX = (curr.x + next.x) / 2;
            const midZ = (curr.z + next.z) / 2;
            const toOutside = Math.atan2(midZ, midX);
            const offsetX = -Math.cos(toOutside) * fenceOffset;
            const offsetZ = -Math.sin(toOutside) * fenceOffset;
            
            const dx = next.x - curr.x;
            const dz = next.z - curr.z;
            const length = Math.sqrt(dx * dx + dz * dz);
            const angle = Math.atan2(dz, dx);
            
            // フェンスポスト
            const postGeo = new THREE.CylinderGeometry(postRadius, postRadius * 1.2, fenceHeight + 0.5, 6);
            const post = new THREE.Mesh(postGeo, postMat);
            post.position.set(curr.x + offsetX * 0.5, fenceHeight / 2, curr.z + offsetZ * 0.5);
            this.trackGroup.add(post);
            
            // 横木
            const railGeo = new THREE.BoxGeometry(length, 0.15, 0.12);
            const rail1 = new THREE.Mesh(railGeo, woodMat);
            rail1.position.set(
                (curr.x + next.x) / 2 + offsetX * 0.5,
                fenceHeight * 0.7,
                (curr.z + next.z) / 2 + offsetZ * 0.5
            );
            rail1.rotation.y = -angle;
            this.trackGroup.add(rail1);
            
            const rail2 = new THREE.Mesh(railGeo.clone(), woodMat);
            rail2.position.set(
                (curr.x + next.x) / 2 + offsetX * 0.5,
                fenceHeight * 0.35,
                (curr.z + next.z) / 2 + offsetZ * 0.5
            );
            rail2.rotation.y = -angle;
            this.trackGroup.add(rail2);
        }
        
        // 追加の装飾フェンス（コーナー部分のみ）
        const fenceSegments = [];
        
        fenceSegments.forEach(segment => {
            for (let i = segment.start; i < Math.min(segment.end, this.outerBoundary.length - 1); i += 12) {
                const curr = this.outerBoundary[i];
                const next = this.outerBoundary[Math.min(i + 12, this.outerBoundary.length - 1)];
                
                if (!curr || !next) continue;
                
                const dx = next.x - curr.x;
                const dz = next.z - curr.z;
                const length = Math.sqrt(dx * dx + dz * dz);
                const angle = Math.atan2(dz, dx);
                
                // フェンスポスト
                const postGeo = new THREE.CylinderGeometry(postRadius, postRadius * 1.2, fenceHeight + 0.5, 6);
                const post = new THREE.Mesh(postGeo, postMat);
                post.position.set(curr.x, fenceHeight / 2, curr.z);
                this.trackGroup.add(post);
                
                // 横木
                const railGeo = new THREE.BoxGeometry(length, 0.2, 0.15);
                const rail1 = new THREE.Mesh(railGeo, woodMat);
                rail1.position.set(
                    (curr.x + next.x) / 2,
                    fenceHeight * 0.7,
                    (curr.z + next.z) / 2
                );
                rail1.rotation.y = -angle;
                this.trackGroup.add(rail1);
                
                const rail2 = new THREE.Mesh(railGeo.clone(), woodMat);
                rail2.position.set(
                    (curr.x + next.x) / 2,
                    fenceHeight * 0.35,
                    (curr.z + next.z) / 2
                );
                rail2.rotation.y = -angle;
                this.trackGroup.add(rail2);
            }
        });
        
        // === フェンス衝突判定用データを生成 ===
        this.fenceSegments = [];
        
        // 内側フェンスのセグメント
        for (let i = 0; i < this.innerBoundary.length - 1; i += 15) {
            const curr = this.innerBoundary[i];
            const next = this.innerBoundary[Math.min(i + 15, this.innerBoundary.length - 1)];
            if (!curr || !next) continue;
            
            // ゴール付近は衝突判定もスキップ
            if (isNearGoal(curr.z) || isNearGoal(next.z)) continue;
            
            const midX = (curr.x + next.x) / 2;
            const midZ = (curr.z + next.z) / 2;
            const toCenter = Math.atan2(midZ, midX);
            const offsetX = Math.cos(toCenter) * fenceOffset * 0.5;
            const offsetZ = Math.sin(toCenter) * fenceOffset * 0.5;
            
            this.fenceSegments.push({
                x1: curr.x + offsetX,
                z1: curr.z + offsetZ,
                x2: next.x + offsetX,
                z2: next.z + offsetZ,
                side: 'inner'
            });
        }
        
        // 外側フェンスのセグメント
        for (let i = 0; i < this.outerBoundary.length - 1; i += 15) {
            const curr = this.outerBoundary[i];
            const next = this.outerBoundary[Math.min(i + 15, this.outerBoundary.length - 1)];
            if (!curr || !next) continue;
            
            // ゴール付近は衝突判定もスキップ
            if (isNearGoal(curr.z) || isNearGoal(next.z)) continue;
            
            const midX = (curr.x + next.x) / 2;
            const midZ = (curr.z + next.z) / 2;
            const toOutside = Math.atan2(midZ, midX);
            const offsetX = -Math.cos(toOutside) * fenceOffset * 0.5;
            const offsetZ = -Math.sin(toOutside) * fenceOffset * 0.5;
            
            this.fenceSegments.push({
                x1: curr.x + offsetX,
                z1: curr.z + offsetZ,
                x2: next.x + offsetX,
                z2: next.z + offsetZ,
                side: 'outer'
            });
        }
        
        // === フェンスに沿った透明な衝突ボックスを追加（甲羅の反射用） ===
        const collisionMat = new THREE.MeshBasicMaterial({ visible: false });
        
        this.fenceSegments.forEach(seg => {
            const dx = seg.x2 - seg.x1;
            const dz = seg.z2 - seg.z1;
            const length = Math.sqrt(dx * dx + dz * dz);
            if (length < 1) return;
            
            const angle = Math.atan2(dz, dx);
            const midX = (seg.x1 + seg.x2) / 2;
            const midZ = (seg.z1 + seg.z2) / 2;
            
            // フェンスの法線方向（フェンスに垂直）
            const normalX = -Math.sin(angle);  // perpendicular to fence
            const normalZ = Math.cos(angle);
            
            // フェンスに沿った細長い衝突ボックス
            const colliderGeo = new THREE.BoxGeometry(length, fenceHeight, 1.5);
            const collider = new THREE.Mesh(colliderGeo, collisionMat);
            collider.position.set(midX, fenceHeight / 2, midZ);
            collider.rotation.y = -angle;
            collider.userData.isCollidable = true;
            collider.userData.isFence = true;
            collider.userData.fenceNormalX = normalX;
            collider.userData.fenceNormalZ = normalZ;
            this.trackGroup.add(collider);
            this.collidableObjects.push(collider);
        });
    }

    addCornerFences() {
        // カーブ部分のフェンスは削除済み
        // 走行を妨げる要素はコース境界の addGrasslandFences() のみで十分
        return;
    }
    
    addTrackBarriers() {
        // コースの両側にバリアを配置
        const spacing = 15; // バリア間隔
        
        // 外側バリア
        for (let i = 0; i < this.outerBoundary.length; i += spacing) {
            const outer = this.outerBoundary[i];
            if (!outer) continue;
            this.createTireBarrier(outer.x, outer.z, i);
        }
        
        // ショートカット防止用の内側壁とフェンス
        this.addShortcutBlockers();
    }
    
    createTireBarrier(x, z, index) {
        const isRed = Math.floor(index / 15) % 2 === 0;
        const color = isRed ? 0xdd0000 : 0xffffff;
        
        const barrierMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.8
        });
        
        // タイヤ風のバリア
        const barrierGeo = new THREE.CylinderGeometry(1.5, 1.5, 2, 8);
        const barrier = new THREE.Mesh(barrierGeo, barrierMat);
        barrier.position.set(x, 1, z);
        this.trackGroup.add(barrier);
        
        // 衝突判定用にバリアリストに追加
        if (!this.barriers) this.barriers = [];
        this.barriers.push({ x, z, radius: 2 });
    }
    
    addShortcutBlockers() {
        // ショートカット防止用の障害物をコース中央エリアに配置
        // 注意: コース上ではなく、コースで囲まれた内側の芝生エリアに配置
        if (!this.barriers) this.barriers = [];
        
        // コース中央の芝生エリアに木を配置してショートカット防止
        this.addTreesInCenter();
    }
    
    addTreesInCenter() {
        // コース外側（芝生）に木を配置（装飾用）
        const treePositions = [
            // コースの外周に散らばる木（コース外側の装飾）
            { x: -300, z: -150, scale: 1.2 },
            { x: -280, z: 50, scale: 1.0 },
            { x: -270, z: 200, scale: 1.1 },
            { x: 300, z: -150, scale: 1.0 },
            { x: 290, z: 50, scale: 1.2 },
            { x: 250, z: 280, scale: 1.0 },
            { x: -200, z: 300, scale: 1.1 },
            { x: 100, z: 300, scale: 0.9 },
            { x: -100, z: -280, scale: 1.0 },
            { x: 150, z: -280, scale: 1.1 },
            // コース中央（囲まれた芝生エリア）に木
            { x: 0, z: 0, scale: 1.3 },
            { x: 50, z: 50, scale: 1.0 },
            { x: -50, z: -50, scale: 1.0 },
            { x: 80, z: -30, scale: 0.9 },
            { x: -80, z: 30, scale: 0.9 },
        ];
        
        treePositions.forEach(pos => {
            this.createTree(pos.x, pos.z, pos.scale);
        });
    }
    
    createTree(x, z, scale = 1) {
        const treeGroup = new THREE.Group();
        
        // 幹
        const trunkGeo = new THREE.CylinderGeometry(1.5 * scale, 2 * scale, 8 * scale, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 4 * scale;
        trunk.castShadow = true;
        treeGroup.add(trunk);
        
        // 葉（複数の球体で構成）
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        
        const leafPositions = [
            { y: 10, r: 6 },
            { y: 14, r: 5 },
            { y: 17, r: 3.5 },
        ];
        
        leafPositions.forEach(lp => {
            const leafGeo = new THREE.SphereGeometry(lp.r * scale, 8, 6);
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.y = lp.y * scale;
            leaf.castShadow = true;
            treeGroup.add(leaf);
        });
        
        treeGroup.position.set(x, 0, z);
        this.trackGroup.add(treeGroup);
    }
    
    createDetailedGround() {
        // 平坦な芝生地（拡大）
        const groundGeometry = new THREE.PlaneGeometry(1200, 1200, 10, 10);
        
        // 芝のテクスチャ
        const grassTexture = window.textureManager ? window.textureManager.getTexture('grass') : null;
        
        // 芝の色を明るい緑に
        const groundMaterial = new THREE.MeshBasicMaterial({ 
            map: grassTexture,
            color: 0x4cb84c,
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.1;  // トラック(0.1)のすぐ下に
        ground.receiveShadow = true;
        ground.renderOrder = 0;  // 最初に描画
        this.trackGroup.add(ground);
    }
    
    addGrassTufts() {
        const grassMat = new THREE.MeshBasicMaterial({ 
            color: 0x3da83d,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < 500; i++) {
            const x = (Math.random() - 0.5) * 600;
            const z = (Math.random() - 0.5) * 600;
            
            // Skip if on track
            if (this.isOnTrack(x, z)) continue;
            
            const grassGroup = new THREE.Group();
            
            for (let j = 0; j < 5; j++) {
                const bladeGeo = new THREE.PlaneGeometry(0.3, 1 + Math.random() * 0.5);
                const blade = new THREE.Mesh(bladeGeo, grassMat);
                blade.position.set((Math.random() - 0.5) * 0.5, 0.5, (Math.random() - 0.5) * 0.5);
                blade.rotation.y = Math.random() * Math.PI;
                blade.rotation.x = Math.random() * 0.2;
                grassGroup.add(blade);
            }
            
            grassGroup.position.set(x, 0, z);
            this.trackGroup.add(grassGroup);
        }
    }
    
    createOcean() {
        // Animated water plane with better texture
        const waterGeometry = new THREE.PlaneGeometry(3000, 3000, 100, 100);
        
        // Use texture manager for water
        const waterTexture = window.textureManager ? window.textureManager.getTexture('water') : null;
        const waterNormal = window.textureManager ? window.textureManager.getTexture('waterNormal') : null;
        
        if (waterTexture) {
            waterTexture.wrapS = THREE.RepeatWrapping;
            waterTexture.wrapT = THREE.RepeatWrapping;
            waterTexture.repeat.set(20, 20);
        }
        if (waterNormal) {
            waterNormal.wrapS = THREE.RepeatWrapping;
            waterNormal.wrapT = THREE.RepeatWrapping;
            waterNormal.repeat.set(30, 30);
        }
        
        const waterMaterial = new THREE.MeshStandardMaterial({
            map: waterTexture,
            normalMap: waterNormal,
            normalScale: new THREE.Vector2(0.8, 0.8),
            color: 0x0088cc,
            transparent: true,
            opacity: 0.9,
            roughness: 0.05,
            metalness: 0.4,
            envMapIntensity: 1.0
        });
        
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = -4;
        water.receiveShadow = true;
        this.trackGroup.add(water);
        this.waterMesh = water;
        this.waterMaterial = waterMaterial;
        
        // Add foam/waves at shore
        this.addWaveFoam();
    }
    
    addWaveFoam() {
        const foamMat = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.6 
        });
        
        // Create foam rings around the island
        const foamGeo = new THREE.RingGeometry(280, 290, 64);
        const foam = new THREE.Mesh(foamGeo, foamMat);
        foam.rotation.x = -Math.PI / 2;
        foam.position.y = -3.8;
        this.trackGroup.add(foam);
    }
    
    createBeachAreas() {
        // Sand beaches around edges with texture
        const sandTexture = window.textureManager ? window.textureManager.getTexture('sand') : null;
        
        const sandMat = new THREE.MeshStandardMaterial({
            map: sandTexture,
            color: 0xf4d090,
            roughness: 1.0,
            metalness: 0
        });
        
        const beachPositions = [
            { x: -200, z: 100, r: 80 },
            { x: 200, z: 150, r: 60 },
            { x: 0, z: -200, r: 100 },
            { x: 150, z: -150, r: 70 }
        ];
        
        beachPositions.forEach(beach => {
            const sandGeo = new THREE.CircleGeometry(beach.r, 32);
            const sand = new THREE.Mesh(sandGeo, sandMat.clone());
            sand.rotation.x = -Math.PI / 2;
            sand.position.set(beach.x, -2, beach.z);
            sand.receiveShadow = true;
            this.trackGroup.add(sand);
        });
    }
    
    // マリオカート風の装飾を追加
    addMarioKartDecorations() {
        // キノコを配置
        this.addMushrooms();
        // 緑パイプを配置
        this.addWarpPipes();
        // コース看板を配置
        this.addTrackSigns();
    }
    
    // マリオカート風キノコ
    addMushrooms() {
        const mushroomPositions = [
            { x: -150, z: -150, scale: 1.2 },
            { x: 180, z: -120, scale: 1.0 },
            { x: -180, z: 100, scale: 1.4 },
            { x: 100, z: 150, scale: 0.8 },
            { x: -50, z: -250, scale: 1.1 },
            { x: 270, z: 50, scale: 1.3 },
        ];
        
        mushroomPositions.forEach(pos => {
            if (!this.isOnTrack(pos.x, pos.z)) {
                this.createMushroom(pos.x, pos.z, pos.scale);
            }
        });
    }
    
    createMushroom(x, z, scale = 1) {
        const group = new THREE.Group();
        
        // 茎（白）
        const stemGeo = new THREE.CylinderGeometry(2 * scale, 2.5 * scale, 6 * scale, 16);
        const stemMat = new THREE.MeshStandardMaterial({
            color: 0xFFF8E7,
            roughness: 0.6
        });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 3 * scale;
        group.add(stem);
        
        // かさ（赤と白の水玉）
        const capGeo = new THREE.SphereGeometry(5 * scale, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const capMat = new THREE.MeshStandardMaterial({
            color: 0xEE1C25,
            roughness: 0.4
        });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.rotation.x = Math.PI;
        cap.position.y = 6 * scale;
        group.add(cap);
        
        // 白い水玉
        const spotGeo = new THREE.CircleGeometry(1.2 * scale, 16);
        const spotMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        
        const spotPositions = [
            { phi: 0.3, theta: 0 },
            { phi: 0.3, theta: Math.PI * 0.5 },
            { phi: 0.3, theta: Math.PI },
            { phi: 0.3, theta: Math.PI * 1.5 },
            { phi: 0.6, theta: Math.PI * 0.25 },
            { phi: 0.6, theta: Math.PI * 0.75 },
            { phi: 0.6, theta: Math.PI * 1.25 },
            { phi: 0.6, theta: Math.PI * 1.75 },
        ];
        
        spotPositions.forEach(pos => {
            const spot = new THREE.Mesh(spotGeo, spotMat);
            const radius = 4.8 * scale;
            spot.position.set(
                Math.sin(pos.phi * Math.PI / 2) * Math.cos(pos.theta) * radius,
                6 * scale + Math.cos(pos.phi * Math.PI / 2) * radius * 0.5,
                Math.sin(pos.phi * Math.PI / 2) * Math.sin(pos.theta) * radius
            );
            const normal = spot.position.clone().sub(new THREE.Vector3(0, 6 * scale, 0)).normalize();
            spot.lookAt(spot.position.clone().add(normal));
            group.add(spot);
        });
        
        // 目（可愛い顔）
        const eyeGeo = new THREE.SphereGeometry(0.6 * scale, 12, 12);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const eyeWhiteGeo = new THREE.SphereGeometry(0.8 * scale, 12, 12);
        const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        
        [-1.2, 1.2].forEach(xOffset => {
            const eyeWhite = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat);
            eyeWhite.position.set(xOffset * scale, 4 * scale, 2 * scale);
            eyeWhite.scale.set(1, 1.2, 0.6);
            group.add(eyeWhite);
            
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(xOffset * scale, 3.8 * scale, 2.3 * scale);
            group.add(eye);
        });
        
        group.position.set(x, 0, z);
        group.castShadow = true;
        this.trackGroup.add(group);
    }
    
    // マリオ風ワープパイプ
    addWarpPipes() {
        const pipePositions = [
            { x: -170, z: -220, scale: 1.0 },
            { x: 260, z: -160, scale: 1.2 },
            { x: -250, z: 60, scale: 1.0 },
            { x: 180, z: 220, scale: 0.9 },
        ];
        
        pipePositions.forEach(pos => {
            if (!this.isOnTrack(pos.x, pos.z)) {
                this.createWarpPipe(pos.x, pos.z, pos.scale);
            }
        });
    }
    
    createWarpPipe(x, z, scale = 1) {
        const group = new THREE.Group();
        
        // パイプ本体（緑）
        const pipeGeo = new THREE.CylinderGeometry(4 * scale, 4 * scale, 10 * scale, 24);
        const pipeMat = new THREE.MeshStandardMaterial({
            color: 0x00AA00,
            roughness: 0.4,
            metalness: 0.2
        });
        const pipe = new THREE.Mesh(pipeGeo, pipeMat);
        pipe.position.y = 5 * scale;
        group.add(pipe);
        
        // パイプの縁（太いリング）
        const rimGeo = new THREE.TorusGeometry(4.5 * scale, 0.8 * scale, 12, 24);
        const rimMat = new THREE.MeshStandardMaterial({
            color: 0x00BB00,
            roughness: 0.3
        });
        const rim = new THREE.Mesh(rimGeo, rimMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 10 * scale;
        group.add(rim);
        
        // 上部の蓋（暗い緑）
        const topGeo = new THREE.CylinderGeometry(4 * scale, 4.5 * scale, 1.5 * scale, 24);
        const topMat = new THREE.MeshStandardMaterial({
            color: 0x008800,
            roughness: 0.5
        });
        const top = new THREE.Mesh(topGeo, topMat);
        top.position.y = 10.5 * scale;
        group.add(top);
        
        // 黒い内側
        const innerGeo = new THREE.CircleGeometry(3.5 * scale, 24);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
        const inner = new THREE.Mesh(innerGeo, innerMat);
        inner.rotation.x = -Math.PI / 2;
        inner.position.y = 11.2 * scale;
        group.add(inner);
        
        // ハイライトストライプ
        const stripeGeo = new THREE.BoxGeometry(0.3 * scale, 8 * scale, 0.1);
        const stripeMat = new THREE.MeshBasicMaterial({ 
            color: 0x44FF44,
            transparent: true,
            opacity: 0.5
        });
        const stripe = new THREE.Mesh(stripeGeo, stripeMat);
        stripe.position.set(3.5 * scale, 5 * scale, 2 * scale);
        stripe.rotation.y = -0.2;
        group.add(stripe);
        
        group.position.set(x, 0, z);
        group.castShadow = true;
        this.trackGroup.add(group);
    }
    
    // コース看板を追加
    addTrackSigns() {
        const signPositions = [
            { x: 0, z: -240, text: 'MARIO CIRCUIT', color: 0xEE1C25 },
            { x: -100, z: -220, text: 'LAP 1', color: 0xFFDD00 },
            { x: 265, z: -50, text: '↺', color: 0x00B800 },
            { x: -230, z: 0, text: '⚡ DANGER', color: 0xFF6600 },
        ];
        
        signPositions.forEach(pos => {
            this.createTrackSign(pos.x, pos.z, pos.text, pos.color);
        });
    }
    
    createTrackSign(x, z, text, color) {
        const group = new THREE.Group();
        
        // 支柱（銀色）
        const poleGeo = new THREE.CylinderGeometry(0.3, 0.4, 12, 12);
        const poleMat = new THREE.MeshStandardMaterial({
            color: 0xAAAAAA,
            metalness: 0.7,
            roughness: 0.3
        });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 6;
        group.add(pole);
        
        // 看板本体
        const signGeo = new THREE.BoxGeometry(10, 5, 0.5);
        const signMat = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.5
        });
        const sign = new THREE.Mesh(signGeo, signMat);
        sign.position.y = 14;
        group.add(sign);
        
        // 枠（白）
        const borderGeo = new THREE.BoxGeometry(10.5, 5.5, 0.4);
        const borderMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.position.y = 14;
        border.position.z = -0.1;
        group.add(border);
        
        // テキスト
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 64px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeText(text, 256, 128);
        ctx.fillText(text, 256, 128);
        
        const textTexture = new THREE.CanvasTexture(canvas);
        const textGeo = new THREE.PlaneGeometry(9, 4.5);
        const textMat = new THREE.MeshBasicMaterial({
            map: textTexture,
            transparent: true
        });
        const textMesh = new THREE.Mesh(textGeo, textMat);
        textMesh.position.y = 14;
        textMesh.position.z = 0.3;
        group.add(textMesh);
        
        // 背面にも
        const textMeshBack = textMesh.clone();
        textMeshBack.rotation.y = Math.PI;
        textMeshBack.position.z = -0.3;
        group.add(textMeshBack);
        
        group.position.set(x, 0, z);
        this.trackGroup.add(group);
    }
    
    addPalmTrees() {
        // パフォーマンス改善のためツリー数を減らす
        const treePositions = [];
        
        // 少数のツリーをコース周辺に配置
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 80 + Math.random() * 150;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist + 50;
            
            if (!this.isOnTrack(x, z)) {
                treePositions.push({ x, z, scale: 0.8 + Math.random() * 0.4 });
            }
        }
        
        treePositions.forEach(pos => {
            this.createPalmTree(pos.x, pos.z, pos.scale || 1);
        });
    }
    
    createPalmTree(x, z, scale = 1) {
        const group = new THREE.Group();
        
        // Curved trunk segments
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b5a2b,
            roughness: 0.9
        });
        
        const trunkHeight = 10 * scale;
        const segments = 5;
        
        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            const radius = (0.6 - t * 0.3) * scale;
            const segHeight = trunkHeight / segments;
            
            const segGeo = new THREE.CylinderGeometry(radius * 0.9, radius, segHeight, 8);
            const seg = new THREE.Mesh(segGeo, trunkMaterial);
            seg.position.y = segHeight * i + segHeight / 2;
            seg.rotation.z = Math.sin(t * Math.PI) * 0.1;
            seg.castShadow = true;
            group.add(seg);
        }
        
        // Palm leaves (fronds)
        const leafMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x228b22,
            side: THREE.DoubleSide,
            roughness: 0.8
        });
        
        const numLeaves = 8;
        for (let i = 0; i < numLeaves; i++) {
            const leafGroup = new THREE.Group();
            
            // Create elongated leaf shape
            const leafShape = new THREE.Shape();
            leafShape.moveTo(0, 0);
            leafShape.quadraticCurveTo(2, 0.5, 5, 0);
            leafShape.quadraticCurveTo(2, -0.5, 0, 0);
            
            const leafGeo = new THREE.ExtrudeGeometry(leafShape, { depth: 0.05, bevelEnabled: false });
            const leaf = new THREE.Mesh(leafGeo, leafMaterial);
            leaf.scale.set(scale, scale, scale);
            leaf.castShadow = true;
            leafGroup.add(leaf);
            
            leafGroup.rotation.y = (i / numLeaves) * Math.PI * 2;
            leafGroup.rotation.x = 0.3 + Math.random() * 0.3;
            leafGroup.position.y = trunkHeight;
            group.add(leafGroup);
        }
        
        // Coconuts
        const coconutGeo = new THREE.SphereGeometry(0.3 * scale, 8, 8);
        const coconutMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
        
        for (let i = 0; i < 3; i++) {
            const coconut = new THREE.Mesh(coconutGeo, coconutMat);
            coconut.position.set(
                Math.cos(i * 2.1) * 0.5 * scale,
                trunkHeight - 0.5,
                Math.sin(i * 2.1) * 0.5 * scale
            );
            coconut.castShadow = true;
            group.add(coconut);
        }
        
        group.position.set(x, 0, z);
        group.rotation.y = Math.random() * Math.PI * 2;
        this.trackGroup.add(group);
    }
    
    addVegetation() {
        // Tropical flowers
        const flowerColors = [0xff69b4, 0xff4500, 0xffff00, 0xff1493, 0xffa500];
        
        for (let i = 0; i < 200; i++) {
            const x = (Math.random() - 0.5) * 500;
            const z = (Math.random() - 0.5) * 500;
            
            if (this.isOnTrack(x, z)) continue;
            
            const flowerGroup = new THREE.Group();
            
            // Stem
            const stemGeo = new THREE.CylinderGeometry(0.05, 0.08, 1, 6);
            const stemMat = new THREE.MeshBasicMaterial({ color: 0x228b22 });
            const stem = new THREE.Mesh(stemGeo, stemMat);
            stem.position.y = 0.5;
            flowerGroup.add(stem);
            
            // Petals
            const petalColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            const petalMat = new THREE.MeshBasicMaterial({ color: petalColor });
            
            for (let p = 0; p < 5; p++) {
                const petalGeo = new THREE.SphereGeometry(0.15, 8, 8);
                const petal = new THREE.Mesh(petalGeo, petalMat);
                petal.scale.set(1, 0.3, 1);
                petal.position.set(
                    Math.cos(p * Math.PI * 2 / 5) * 0.2,
                    1.1,
                    Math.sin(p * Math.PI * 2 / 5) * 0.2
                );
                flowerGroup.add(petal);
            }
            
            // Center
            const centerGeo = new THREE.SphereGeometry(0.1, 8, 8);
            const centerMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            const center = new THREE.Mesh(centerGeo, centerMat);
            center.position.y = 1.1;
            flowerGroup.add(center);
            
            flowerGroup.position.set(x, 0, z);
            flowerGroup.scale.setScalar(0.5 + Math.random() * 0.5);
            this.trackGroup.add(flowerGroup);
        }
        
        // Bushes
        this.addBushes();
    }
    
    addBushes() {
        const bushMat = new THREE.MeshStandardMaterial({ 
            color: 0x2e8b2e,
            roughness: 0.9
        });
        
        for (let i = 0; i < 100; i++) {
            const x = (Math.random() - 0.5) * 500;
            const z = (Math.random() - 0.5) * 500;
            
            if (this.isOnTrack(x, z)) continue;
            
            const bushGroup = new THREE.Group();
            
            // Multiple spheres for bush shape
            for (let j = 0; j < 5; j++) {
                const size = 1 + Math.random();
                const bushGeo = new THREE.SphereGeometry(size, 8, 8);
                const bush = new THREE.Mesh(bushGeo, bushMat);
                bush.position.set(
                    (Math.random() - 0.5) * 2,
                    size * 0.8,
                    (Math.random() - 0.5) * 2
                );
                bush.castShadow = true;
                bushGroup.add(bush);
            }
            
            bushGroup.position.set(x, 0, z);
            this.trackGroup.add(bushGroup);
        }
    }
    
    addRocksAndDecorations() {
        // Various rock formations
        const rockMat = new THREE.MeshStandardMaterial({ 
            color: 0x696969,
            roughness: 0.95
        });
        
        for (let i = 0; i < 50; i++) {
            const x = (Math.random() - 0.5) * 600;
            const z = (Math.random() - 0.5) * 600;
            
            if (this.isOnTrack(x, z)) continue;
            
            const rockGroup = new THREE.Group();
            const numRocks = 1 + Math.floor(Math.random() * 3);
            
            for (let j = 0; j < numRocks; j++) {
                const size = 0.5 + Math.random() * 2;
                const rockGeo = new THREE.DodecahedronGeometry(size, 0);
                const rock = new THREE.Mesh(rockGeo, rockMat);
                rock.position.set(
                    (Math.random() - 0.5) * 2,
                    size * 0.6,
                    (Math.random() - 0.5) * 2
                );
                rock.rotation.set(Math.random(), Math.random(), Math.random());
                rock.castShadow = true;
                rockGroup.add(rock);
            }
            
            rockGroup.position.set(x, 0, z);
            this.trackGroup.add(rockGroup);
        }
    }
    
    addGrandstands() {
        // コースの外側に客席配置
        const standPositions = [
            { x: 0, z: -270, rotation: 0 },                // スタート/ゴール後方（南側）
            { x: 290, z: -80, rotation: -Math.PI / 2 },    // 第1コーナー外（東側）
            { x: 200, z: 260, rotation: Math.PI },         // 北側（第2コーナー付近）
            { x: -270, z: 100, rotation: Math.PI / 2 },    // 西側
        ];
        
        standPositions.forEach(pos => {
            const stand = this.createGrandstand();
            stand.position.set(pos.x, 0, pos.z);
            stand.rotation.y = pos.rotation;
            this.trackGroup.add(stand);
        });
    }
    
    createGrandstand() {
        const group = new THREE.Group();
        
        // Base structure
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const baseGeo = new THREE.BoxGeometry(60, 8, 15);
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.set(0, 4, 0);
        base.castShadow = true;
        group.add(base);
        
        // Stepped seating
        const seatColors = [0xff0000, 0x0000ff, 0xffff00, 0x00ff00];
        for (let i = 0; i < 4; i++) {
            const seatMat = new THREE.MeshStandardMaterial({ color: seatColors[i] });
            const seatGeo = new THREE.BoxGeometry(58, 1.5, 3);
            const seat = new THREE.Mesh(seatGeo, seatMat);
            seat.position.set(0, 8.5 + i * 1.8, -5 + i * 3);
            seat.castShadow = true;
            group.add(seat);
        }
        
        // Roof
        const roofMat = new THREE.MeshStandardMaterial({ color: 0xcc0000 });
        const roofGeo = new THREE.BoxGeometry(65, 0.5, 20);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(0, 18, 2);
        roof.castShadow = true;
        group.add(roof);
        
        // Support pillars
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x404040 });
        [-28, 28].forEach(x => {
            const pillarGeo = new THREE.CylinderGeometry(0.5, 0.5, 18, 8);
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.set(x, 9, 10);
            pillar.castShadow = true;
            group.add(pillar);
        });
        
        // Crowd (simple colored dots)
        const crowdColors = [0xffcccc, 0xccffcc, 0xccccff, 0xffffcc, 0xffccff];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 20; col++) {
                const personMat = new THREE.MeshBasicMaterial({ 
                    color: crowdColors[Math.floor(Math.random() * crowdColors.length)] 
                });
                const personGeo = new THREE.SphereGeometry(0.5, 6, 6);
                const person = new THREE.Mesh(personGeo, personMat);
                person.position.set(
                    -25 + col * 2.6 + Math.random() * 0.5,
                    9.5 + row * 1.8,
                    -5 + row * 3
                );
                group.add(person);
            }
        }
        
        return group;
    }
    
    addBillboards() {
        // 新しい楕円コースに合わせたビルボード配置（コース外側のみ）
        const billboardTexts = [
            'SPEED!', 'TURBO', 'NITRO', 'GO GO!', 'DRIFT!', 'BOOST', 'WIN!', 'RACE'
        ];
        const billboardColors = [0xff0000, 0x0066ff, 0x00cc00, 0xff9900, 0xff00ff, 0x00ffff, 0xffff00, 0xff0066];
        
        const billboardPositions = [
            { x: -50, z: -230, rot: Math.PI },            // スタート手前
            { x: 200, z: 20, rot: -Math.PI / 3 },         // 第1コーナー外
            { x: 220, z: 280, rot: -Math.PI / 2 },        // 北側ストレート外
            { x: 30, z: 420, rot: 0 },                    // 北端
            { x: -220, z: 320, rot: Math.PI / 2 },        // 西側上部
            { x: -220, z: 100, rot: Math.PI / 2 },        // 西側中央
            { x: -200, z: -50, rot: Math.PI * 0.7 },      // S字カーブ外
            { x: -100, z: -230, rot: Math.PI * 0.9 }      // 最終コーナー外
        ];
        
        billboardPositions.forEach((pos, i) => {
            const billboard = this.createBillboard(
                billboardTexts[i % billboardTexts.length],
                billboardColors[i % billboardColors.length]
            );
            billboard.position.set(pos.x, 0, pos.z);
            billboard.rotation.y = pos.rot;
            this.trackGroup.add(billboard);
        });
    }
    
    createBillboard(text, bgColor) {
        const group = new THREE.Group();
        
        // Pole
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x404040 });
        const poleGeo = new THREE.CylinderGeometry(0.3, 0.4, 12, 8);
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.y = 6;
        pole.castShadow = true;
        group.add(pole);
        
        // Board
        const boardGeo = new THREE.BoxGeometry(10, 4, 0.3);
        const boardMat = new THREE.MeshStandardMaterial({ color: bgColor });
        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.y = 14;
        board.castShadow = true;
        group.add(board);
        
        // Text
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 256, 128);
        
        const textTexture = new THREE.CanvasTexture(canvas);
        const textMat = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
        const textGeo = new THREE.PlaneGeometry(9, 3.5);
        
        const textMeshFront = new THREE.Mesh(textGeo, textMat);
        textMeshFront.position.set(0, 14, 0.2);
        group.add(textMeshFront);
        
        const textMeshBack = new THREE.Mesh(textGeo, textMat);
        textMeshBack.position.set(0, 14, -0.2);
        textMeshBack.rotation.y = Math.PI;
        group.add(textMeshBack);
        
        return group;
    }
    
    addFloatingCoins() {
        // Decorative floating coins along the track
        const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
        const coinMat = new THREE.MeshStandardMaterial({ 
            color: 0xffd700,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x664400
        });
        
        this.coins = [];
        
        // Place coins along track
        for (let i = 0; i < this.trackPoints.length; i += 15) {
            const point = this.trackPoints[i];
            
            const coin = new THREE.Mesh(coinGeo, coinMat);
            coin.position.set(point.x, (point.y || 0) + 3, point.z);
            coin.rotation.x = Math.PI / 2;
            coin.castShadow = true;
            this.trackGroup.add(coin);
            this.coins.push(coin);
        }
    }
    
    addBackgroundMountains() {
        const mountainMat = new THREE.MeshStandardMaterial({ 
            color: 0x4a7a4a,
            roughness: 0.9
        });
        const snowMat = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.5
        });
        const ridgeMat = new THREE.MeshStandardMaterial({
            color: 0x6abf6a,
            roughness: 0.85
        });
        
        const mountainPositions = [
            { x: -400, z: 300, scale: 80 },
            { x: -200, z: 400, scale: 60 },
            { x: 100, z: 450, scale: 100 },
            { x: 350, z: 350, scale: 70 },
            { x: 450, z: 150, scale: 90 }
        ];
        
        mountainPositions.forEach(pos => {
            const mountainGroup = new THREE.Group();
            
            // Main mountain cone
            const mountainGeo = new THREE.ConeGeometry(pos.scale, pos.scale * 1.5, 8);
            const mountain = new THREE.Mesh(mountainGeo, mountainMat);
            mountain.position.y = pos.scale * 0.5;
            mountainGroup.add(mountain);
            
            // Ridge (side peaks)
            for (let i = 0; i < 3; i++) {
                const ridgeGeo = new THREE.ConeGeometry(pos.scale * 0.45, pos.scale * 0.7, 6);
                const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
                ridge.position.set((i - 1) * pos.scale * 0.25, pos.scale * 0.25, -pos.scale * 0.15);
                mountainGroup.add(ridge);
            }
            
            // Snow cap
            const snowGeo = new THREE.ConeGeometry(pos.scale * 0.3, pos.scale * 0.4, 6);
            const snow = new THREE.Mesh(snowGeo, snowMat);
            snow.position.y = pos.scale * 1.1;
            mountainGroup.add(snow);
            
            mountainGroup.position.set(pos.x, 0, pos.z);
            this.trackGroup.add(mountainGroup);
        });
    }
    
    addClouds() {
        // Fluffy stylized clouds - reduced for performance
        this.clouds = [];
        
        for (let i = 0; i < 8; i++) {
            const cloudGroup = new THREE.Group();
            
            // Create gradient cloud material
            const cloudCanvas = document.createElement('canvas');
            cloudCanvas.width = 64;
            cloudCanvas.height = 64;
            const ctx = cloudCanvas.getContext('2d');
            
            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);
            
            const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
            const cloudMat = new THREE.SpriteMaterial({ 
                map: cloudTexture,
                transparent: true,
                opacity: 0.85,
                depthWrite: false
            });
            
            // Multiple sprites per cloud for fluffy look - reduced
            const numPuffs = 3;
            for (let j = 0; j < numPuffs; j++) {
                const puff = new THREE.Sprite(cloudMat.clone());
                const size = 40 + Math.random() * 30;
                puff.scale.set(size, size * 0.6, 1);
                puff.position.set(
                    (Math.random() - 0.5) * 40,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 20
                );
                cloudGroup.add(puff);
            }
            
            cloudGroup.position.set(
                (Math.random() - 0.5) * 800,
                70 + Math.random() * 50,
                (Math.random() - 0.5) * 800
            );
            
            this.trackGroup.add(cloudGroup);
            this.clouds.push(cloudGroup);
        }
    }
    
    createSky() {
        const courseType = window.gameSettings?.courseType || 'grassland';
        
        // コースタイプに応じたスカイボックス
        switch(courseType) {
            case 'snow':
                this.createSnowySky();
                break;
            case 'castle':
                this.createDarkSky();
                break;
            default:
                this.createSunnySky();
                break;
        }
    }
    
    // === 草原コース用：晴れた青空 ===
    createSunnySky() {
        const skyGeometry = new THREE.SphereGeometry(1000, 64, 64);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x1e90ff) },      // Dodger blue
                horizonColor: { value: new THREE.Color(0x87ceeb) },  // Sky blue
                bottomColor: { value: new THREE.Color(0xffd4a6) },   // Warm horizon
                sunColor: { value: new THREE.Color(0xffffcc) },      // Sun glow
                sunPosition: { value: new THREE.Vector3(0.5, 0.3, 0.8) },
                offset: { value: 30 },
                exponent: { value: 0.5 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 horizonColor;
                uniform vec3 bottomColor;
                uniform vec3 sunColor;
                uniform vec3 sunPosition;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    
                    vec3 skyColor;
                    if (h > 0.0) {
                        skyColor = mix(horizonColor, topColor, pow(h, exponent));
                    } else {
                        skyColor = mix(horizonColor, bottomColor, pow(-h, 0.5));
                    }
                    
                    vec3 sunDir = normalize(sunPosition);
                    vec3 viewDir = normalize(vWorldPosition);
                    float sunDot = max(dot(viewDir, sunDir), 0.0);
                    float sunGlow = pow(sunDot, 32.0) * 0.5 + pow(sunDot, 8.0) * 0.3;
                    skyColor = mix(skyColor, sunColor, sunGlow);
                    
                    gl_FragColor = vec4(skyColor, 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.trackGroup.add(sky);
        this.createSun();
    }
    
    // === 雪コース用：淡いオーロラの空 ===
    createSnowySky() {
        const skyGeometry = new THREE.SphereGeometry(1000, 64, 64);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x1a1a40) },      // 深い紺色
                horizonColor: { value: new THREE.Color(0x4a6fa5) },  // 氷の青
                bottomColor: { value: new THREE.Color(0xd4e7f7) },   // 白い雪原
                auroraColor1: { value: new THREE.Color(0x00ff88) },  // オーロラ緑
                auroraColor2: { value: new THREE.Color(0x88ff00) },  // オーロラ黄緑
                time: { value: 0 },
                offset: { value: 30 },
                exponent: { value: 0.4 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 horizonColor;
                uniform vec3 bottomColor;
                uniform vec3 auroraColor1;
                uniform vec3 auroraColor2;
                uniform float time;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    
                    vec3 skyColor;
                    if (h > 0.0) {
                        skyColor = mix(horizonColor, topColor, pow(h, exponent));
                        
                        // オーロラエフェクト
                        float aurora = sin(vWorldPosition.x * 0.01 + time) * 
                                      cos(vWorldPosition.z * 0.015 + time * 0.7) * 0.5 + 0.5;
                        aurora = pow(aurora, 3.0) * h * 0.4;
                        vec3 auroraColor = mix(auroraColor1, auroraColor2, sin(time * 0.5) * 0.5 + 0.5);
                        skyColor = mix(skyColor, auroraColor, aurora);
                    } else {
                        skyColor = mix(horizonColor, bottomColor, pow(-h, 0.3));
                    }
                    
                    gl_FragColor = vec4(skyColor, 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        sky.userData.isSnowySky = true;
        this.trackGroup.add(sky);
        
        // 弱い太陽（冬の太陽）
        this.createWinterSun();
    }
    
    createWinterSun() {
        const sunGeo = new THREE.SphereGeometry(25, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({
            color: 0xffffe0,
            transparent: true,
            opacity: 0.7
        });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.set(-400, 100, 200);
        this.trackGroup.add(sun);
    }
    
    // === 城コース用：暗い赤黒い空 ===
    createDarkSky() {
        const skyGeometry = new THREE.SphereGeometry(1000, 64, 64);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0a0a0a) },      // 漆黒
                horizonColor: { value: new THREE.Color(0x2a1010) },  // 暗い赤
                bottomColor: { value: new THREE.Color(0x1a0505) },   // 暗い茶色
                fireGlow: { value: new THREE.Color(0xff4500) },      // 溶岩の光
                time: { value: 0 },
                offset: { value: 30 },
                exponent: { value: 0.3 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 horizonColor;
                uniform vec3 bottomColor;
                uniform vec3 fireGlow;
                uniform float time;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    
                    vec3 skyColor;
                    if (h > 0.0) {
                        skyColor = mix(horizonColor, topColor, pow(h, exponent));
                    } else {
                        skyColor = mix(horizonColor, bottomColor, pow(-h, 0.5));
                        
                        // 地平線付近の溶岩の光
                        float glow = (1.0 - abs(h)) * 0.3;
                        glow *= sin(vWorldPosition.x * 0.02 + time) * 0.5 + 0.5;
                        skyColor = mix(skyColor, fireGlow, glow);
                    }
                    
                    gl_FragColor = vec4(skyColor, 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        sky.userData.isDarkSky = true;
        this.trackGroup.add(sky);
        
        // 月を追加
        this.createMoon();
    }
    
    createMoon() {
        const moonGeo = new THREE.SphereGeometry(35, 32, 32);
        const moonMat = new THREE.MeshBasicMaterial({
            color: 0xffffcc,
            transparent: true,
            opacity: 0.8
        });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(300, 250, -400);
        this.trackGroup.add(moon);
        
        // 月のクレーター
        const craterMat = new THREE.MeshBasicMaterial({ color: 0xccccaa });
        for (let i = 0; i < 5; i++) {
            const craterGeo = new THREE.CircleGeometry(3 + Math.random() * 4, 16);
            const crater = new THREE.Mesh(craterGeo, craterMat);
            crater.position.set(
                300 + (Math.random() - 0.5) * 20,
                250 + (Math.random() - 0.5) * 20,
                -399
            );
            this.trackGroup.add(crater);
        }
    }
    
    createSun() {
        // Glowing sun
        const sunGeo = new THREE.SphereGeometry(30, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({
            color: 0xffff99,
            transparent: true,
            opacity: 0.9
        });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.set(300, 180, 480);
        this.trackGroup.add(sun);
        
        // Sun glow sprite
        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = 256;
        glowCanvas.height = 256;
        const ctx = glowCanvas.getContext('2d');
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 150, 0.4)');
        gradient.addColorStop(0.6, 'rgba(255, 200, 100, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        const glowTexture = new THREE.CanvasTexture(glowCanvas);
        const glowMat = new THREE.SpriteMaterial({
            map: glowTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const glowSprite = new THREE.Sprite(glowMat);
        glowSprite.scale.set(200, 200, 1);
        glowSprite.position.copy(sun.position);
        this.trackGroup.add(glowSprite);
    }
    
    // Get height at position
    getHeightAt(x, z) {
        // 最寄りのトラックポイントの高さを基準にする
        let minDist = Infinity;
        let height = 1.0;
        
        for (const point of this.trackPoints) {
            const dist = Utils.distance2D(x, z, point.x, point.z);
            if (dist < minDist) {
                minDist = dist;
                height = (point.y || 0) + 1.0;
            }
        }
        
        if (this.isOnTrack(x, z)) {
            return height;
        } else {
            // 城コースではコース外は溶岩（高さは急激に変えない）
            if (this.hasLava) {
                return height;  // コースと同じ高さを返し、溶岩チェックは別処理
            }
            // 通常コースでは芝（コースより少し低い）
            return height - 0.5;
        }
    }
    
    // Check if position is on track
    isOnTrack(x, z) {
        // Check distance to track center line
        let minDist = Infinity;
        let closestPoint = null;
        
        for (const point of this.trackPoints) {
            const dist = Utils.distance2D(x, z, point.x, point.z);
            if (dist < minDist) {
                minDist = dist;
                closestPoint = point;
            }
        }
        
        const trackHalfWidth = (closestPoint && closestPoint.width) ? closestPoint.width / 2 : this.trackWidth / 2;
        return minDist < trackHalfWidth + 2;
    }
    
    // Check if on grass (for slowdown)
    isOnGrass(x, z) {
        return !this.isOnTrack(x, z);
    }
    
    // 最も近いトラックポイントを取得（甲羅の跳ね返り用）
    getClosestTrackPoint(x, z) {
        let minDist = Infinity;
        let closestPoint = null;
        
        for (const point of this.trackPoints) {
            const dist = Utils.distance2D(x, z, point.x, point.z);
            if (dist < minDist) {
                minDist = dist;
                closestPoint = point;
            }
        }
        
        return closestPoint;
    }
    
    // Get track direction at position
    getTrackDirection(x, z) {
        let minDist = Infinity;
        let bestIdx = 0;
        
        for (let i = 0; i < this.trackPoints.length; i++) {
            const point = this.trackPoints[i];
            const dist = Utils.distance2D(x, z, point.x, point.z);
            if (dist < minDist) {
                minDist = dist;
                bestIdx = i;
            }
        }
        
        const curr = this.trackPoints[bestIdx];
        const next = this.trackPoints[(bestIdx + 1) % this.trackPoints.length];
        
        // カートのrotationは Math.atan2(x, z) 形式なので合わせる
        return Math.atan2(next.x - curr.x, next.z - curr.z);
    }
    
    // Get progress along track (0-1)
    getTrackProgress(x, z) {
        let minDist = Infinity;
        let secondMinDist = Infinity;
        let bestIdx = 0;
        let secondBestIdx = 0;
        
        for (let i = 0; i < this.trackPoints.length; i++) {
            const point = this.trackPoints[i];
            const dist = Utils.distance2D(x, z, point.x, point.z);
            if (dist < minDist) {
                secondMinDist = minDist;
                secondBestIdx = bestIdx;
                minDist = dist;
                bestIdx = i;
            } else if (dist < secondMinDist) {
                secondMinDist = dist;
                secondBestIdx = i;
            }
        }
        
        // 隣接する2つのトラックポイント間での補間で精密な進行度を計算
        const total = this.trackPoints.length;
        const idxDiff = Math.abs(bestIdx - secondBestIdx);
        
        // 隣接ポイント同士の場合のみ補間（離れたポイントは無視）
        if (idxDiff === 1 || idxDiff === total - 1) {
            const lowerIdx = bestIdx < secondBestIdx ? bestIdx : secondBestIdx;
            const upperIdx = bestIdx < secondBestIdx ? secondBestIdx : bestIdx;
            const lowerDist = bestIdx < secondBestIdx ? minDist : secondMinDist;
            const upperDist = bestIdx < secondBestIdx ? secondMinDist : minDist;
            
            // ラップアラウンド処理
            if (idxDiff === total - 1) {
                const t = upperDist / (lowerDist + upperDist);
                // 0とtotal-1の間
                if (lowerIdx === 0) {
                    return t * 0 + (1 - t) * ((total - 1) / total);
                }
            }
            
            const t = lowerDist / (lowerDist + upperDist);
            return (lowerIdx + t) / total;
        }
        
        return bestIdx / total;
    }
    
    // Update item boxes (respawn logic)
    update(deltaTime) {
        const time = Date.now() * 0.001;
        
        // Rotate item boxes (N64風の回転と浮遊)
        this.itemBoxes.forEach((itemBox, index) => {
            if (itemBox.active) {
                // 回転（各ボックスで少しずつ速度が違う）
                const rotSpeed = itemBox.mesh.userData.rotationSpeed || 0.02;
                itemBox.mesh.rotation.y += rotSpeed + deltaTime * 1.5;
                itemBox.mesh.rotation.x = Math.sin(time + index) * 0.1;
                
                // 浮遊アニメーション
                const floatOffset = itemBox.mesh.userData.floatOffset || 0;
                itemBox.mesh.position.y = itemBox.position.y + Math.sin(time * 2 + floatOffset) * 0.5;
                
                // 虹色エフェクト（色相を少しずつ変化）
                if (itemBox.mesh.children[0] && itemBox.mesh.children[0].material) {
                    const materials = itemBox.mesh.children[0].material;
                    if (Array.isArray(materials)) {
                        materials.forEach((mat, i) => {
                            mat.emissiveIntensity = 0.2 + Math.sin(time * 3 + i) * 0.15;
                        });
                    }
                }
            } else {
                itemBox.respawnTime -= deltaTime;
                if (itemBox.respawnTime <= 0) {
                    itemBox.active = true;
                    itemBox.mesh.visible = true;
                    itemBox.mesh.userData.active = true;
                }
            }
        });
        
        // Animate boost pads
        this.boostPads.forEach(pad => {
            pad.mesh.material.opacity = 0.7 + Math.sin(time * 5) * 0.2;
        });
        
        // Animate floating coins
        if (this.coins) {
            this.coins.forEach((coin, i) => {
                coin.rotation.z += deltaTime * 3;
                coin.position.y += Math.sin(time * 3 + i) * 0.01;
            });
        }
        
        // Move clouds slowly
        if (this.clouds) {
            this.clouds.forEach((cloud, i) => {
                cloud.position.x += deltaTime * (5 + i * 0.5);
                if (cloud.position.x > 600) {
                    cloud.position.x = -600;
                }
            });
        }
        
        // Animate water (gentle waves)
        if (this.waterMesh) {
            const positions = this.waterMesh.geometry.attributes.position;
            for (let i = 0; i < positions.count; i++) {
                const x = positions.getX(i);
                const y = positions.getY(i);
                const wave = Math.sin(x * 0.02 + time) * Math.cos(y * 0.02 + time) * 0.5;
                positions.setZ(i, wave);
            }
            positions.needsUpdate = true;
        }
        
        // スカイボックスのアニメーション（オーロラや溶岩）
        this.trackGroup.traverse(child => {
            if (child.userData.isSnowySky || child.userData.isDarkSky) {
                if (child.material && child.material.uniforms && child.material.uniforms.time) {
                    child.material.uniforms.time.value = time;
                }
            }
        });
        
        // 吹雪エフェクトのアニメーション
        if (this.blizzardParticles) {
            this.updateBlizzard(deltaTime);
        }
    }
    
    // Get start positions for racers
    getStartPositions(numRacers) {
        const positions = [];
        const finishX = this.finishLine?.position?.x ?? 0;
        const finishZ = this.finishLine?.position?.z ?? (this.waypoints[0]?.z ?? -160);
        const startX = finishX - 30;   // フィニッシュライン(X=0)の後方（西側）
        const startZ = finishZ;  // フィニッシュラインのZ位置（コース上）
        const rowSpacing = 12;    // 前後の間隔
        const laneOffset = 6; // 左右の間隔
        const startRotation = Math.PI / 2;  // 東を向く（+X方向）
        
        // AI Kartsを前方に配置（先頭から）
        for (let i = 0; i < numRacers - 1; i++) {
            const row = Math.floor(i / 2);
            const col = i % 2;
            
            positions.push({
                x: startX - row * rowSpacing,  // 西側に並ぶ（スタートライン後方）
                y: 1.5,
                z: startZ + (col === 0 ? -laneOffset : laneOffset),
                rotation: startRotation  // 東を向く（+X方向）
            });
        }
        
        // プレイヤーKartは最後列（最も後方）に配置
        const playerRow = Math.floor((numRacers - 1) / 2);
        positions.push({
            x: startX - playerRow * rowSpacing - rowSpacing,  // 最後列
            y: 1.5,
            z: startZ,  // 中央レーン
            rotation: startRotation  // 東を向く（+X方向）
        });
        
        return positions;
    }
}

window.Track = Track;
