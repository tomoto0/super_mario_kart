// Texture Manager - Loads free textures from CDNs and creates procedural textures

class TextureManager {
    constructor() {
        this.textures = {};
        this.loader = new THREE.TextureLoader();
        this.cubeLoader = new THREE.CubeTextureLoader();
        this.loadingManager = new THREE.LoadingManager();
        
        // Free texture sources (Public Domain / CC0)
        this.textureSources = {
            // Using placeholder services and procedural generation
            // Real textures from free sources
            grass: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=512&h=512&fit=crop',
            asphalt: 'https://images.unsplash.com/photo-1546146830-2cca9512c68e?w=512&h=512&fit=crop',
            sand: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=512&h=512&fit=crop',
            water: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=512&h=512&fit=crop',
            sky: 'https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=1024&h=512&fit=crop',
            wood: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=512&h=512&fit=crop',
            metal: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=512&h=512&fit=crop',
            brick: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=512&h=512&fit=crop'
        };
        
        // Initialize with procedural textures as fallback
        this.createProceduralTextures();
    }
    
    createProceduralTextures() {
        // High-quality procedural road texture
        this.textures.road = this.createRoadTexture();
        this.textures.roadNormal = this.createRoadNormalMap();
        
        // Grass texture
        this.textures.grass = this.createGrassTexture();
        this.textures.grassNormal = this.createGrassNormalMap();
        
        // Sand texture
        this.textures.sand = this.createSandTexture();
        
        // Water texture
        this.textures.water = this.createWaterTexture();
        this.textures.waterNormal = this.createWaterNormalMap();
        
        // Checkered pattern for finish line
        this.textures.checker = this.createCheckerTexture();
        
        // Metal/chrome texture
        this.textures.metal = this.createMetalTexture();
        
        // Tire texture
        this.textures.tire = this.createTireTexture();
        
        // Carbon fiber
        this.textures.carbon = this.createCarbonFiberTexture();
        
        // Noise texture for various effects
        this.textures.noise = this.createNoiseTexture();
        
        // Cartoon sky gradient
        this.textures.skyGradient = this.createSkyGradient();
        
        // Track markings
        this.textures.trackMarkings = this.createTrackMarkings();
        
        // Boost pad
        this.textures.boostPad = this.createBoostPadTexture();
        
        // Item box
        this.textures.itemBox = this.createItemBoxTexture();
    }
    
    createRoadTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // マリオカート風の明るめのアスファルト
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(0, 0, 512, 512);
        
        // Add subtle noise/grain
        const imageData = ctx.getImageData(0, 0, 512, 512);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 20;
            imageData.data[i] += noise;
            imageData.data[i + 1] += noise;
            imageData.data[i + 2] += noise;
        }
        ctx.putImageData(imageData, 0, 0);
        
        // Add some darker patches
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
            ctx.beginPath();
            ctx.ellipse(
                Math.random() * 512,
                Math.random() * 512,
                Math.random() * 30 + 10,
                Math.random() * 20 + 5,
                Math.random() * Math.PI,
                0, Math.PI * 2
            );
            ctx.fill();
        }
        
        // Add center line dashes
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.setLineDash([40, 30]);
        ctx.beginPath();
        ctx.moveTo(256, 0);
        ctx.lineTo(256, 512);
        ctx.stroke();
        
        // Edge lines (solid)
        ctx.setLineDash([]);
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(30, 0);
        ctx.lineTo(30, 512);
        ctx.moveTo(482, 0);
        ctx.lineTo(482, 512);
        ctx.stroke();
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 10);
        return texture;
    }
    
    createRoadNormalMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Base normal (pointing up)
        ctx.fillStyle = '#8080ff';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add bump details
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const r = Math.random() * 5 + 2;
            
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
            gradient.addColorStop(0, '#9090ff');
            gradient.addColorStop(1, '#8080ff');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createGrassTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // マリオカート風の鮮やかな緑の芝生
        const gradient = ctx.createLinearGradient(0, 0, 512, 512);
        gradient.addColorStop(0, '#2ECC40');
        gradient.addColorStop(0.5, '#3DD556');
        gradient.addColorStop(1, '#2ECC40');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Draw grass blades (brighter)
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const length = Math.random() * 12 + 4;
            const angle = (Math.random() - 0.5) * 0.4;
            
            ctx.strokeStyle = `hsl(${110 + Math.random() * 30}, ${60 + Math.random() * 25}%, ${35 + Math.random() * 20}%)`;
            ctx.lineWidth = 1.5 + Math.random();
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x + angle * 8, y - length / 2, x + angle * 4, y - length);
            ctx.stroke();
        }
        
        // Fewer, brighter flowers
        const flowerColors = ['#FF6B6B', '#FFDD00', '#FF69B4', '#FFFFFF'];
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            ctx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            ctx.beginPath();
            ctx.arc(x, y, 2.5 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(25, 25);
        return texture;
    }
    
    createGrassNormalMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#8080ff';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add grass blade bumps
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const angle = Math.random() * Math.PI * 2;
            
            ctx.strokeStyle = `rgb(${128 + Math.cos(angle) * 30}, ${128 + Math.sin(angle) * 30}, 255)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * 5, y + Math.sin(angle) * 5);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createSandTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Base sand color
        ctx.fillStyle = '#e8d5a3';
        ctx.fillRect(0, 0, 512, 512);
        
        // Add grain
        const imageData = ctx.getImageData(0, 0, 512, 512);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 40;
            imageData.data[i] += noise;
            imageData.data[i + 1] += noise * 0.9;
            imageData.data[i + 2] += noise * 0.7;
        }
        ctx.putImageData(imageData, 0, 0);
        
        // Add some shells/pebbles
        for (let i = 0; i < 50; i++) {
            ctx.fillStyle = `hsl(${30 + Math.random() * 20}, ${20 + Math.random() * 20}%, ${70 + Math.random() * 20}%)`;
            ctx.beginPath();
            ctx.ellipse(
                Math.random() * 512,
                Math.random() * 512,
                2 + Math.random() * 4,
                1 + Math.random() * 3,
                Math.random() * Math.PI,
                0, Math.PI * 2
            );
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
        return texture;
    }
    
    createWaterTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Gradient blue water
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 400);
        gradient.addColorStop(0, '#0099cc');
        gradient.addColorStop(0.5, '#006699');
        gradient.addColorStop(1, '#003366');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        
        // Add caustics/light patterns
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = 20 + Math.random() * 60;
            
            const causticGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
            causticGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
            causticGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = causticGradient;
            ctx.fillRect(x - size, y - size, size * 2, size * 2);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createWaterNormalMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#8080ff';
        ctx.fillRect(0, 0, 512, 512);
        
        // Create wave patterns
        for (let y = 0; y < 512; y += 2) {
            for (let x = 0; x < 512; x += 2) {
                const wave1 = Math.sin(x * 0.05) * Math.cos(y * 0.05);
                const wave2 = Math.sin(x * 0.1 + y * 0.1) * 0.5;
                const combined = (wave1 + wave2) * 0.5;
                
                const r = 128 + combined * 40;
                const g = 128 + combined * 40;
                
                ctx.fillStyle = `rgb(${r}, ${g}, 255)`;
                ctx.fillRect(x, y, 2, 2);
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createCheckerTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        const squareSize = 32;
        for (let y = 0; y < 256; y += squareSize) {
            for (let x = 0; x < 256; x += squareSize) {
                ctx.fillStyle = ((x + y) / squareSize) % 2 === 0 ? '#ffffff' : '#000000';
                ctx.fillRect(x, y, squareSize, squareSize);
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createMetalTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Brushed metal gradient
        const gradient = ctx.createLinearGradient(0, 0, 256, 0);
        gradient.addColorStop(0, '#999999');
        gradient.addColorStop(0.2, '#cccccc');
        gradient.addColorStop(0.4, '#aaaaaa');
        gradient.addColorStop(0.6, '#dddddd');
        gradient.addColorStop(0.8, '#bbbbbb');
        gradient.addColorStop(1, '#999999');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        // Brushed lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let y = 0; y < 256; y += 2) {
            ctx.beginPath();
            ctx.moveTo(0, y + Math.random());
            ctx.lineTo(256, y + Math.random());
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createTireTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Black rubber base
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 256, 256);
        
        // Tread pattern
        ctx.fillStyle = '#0d0d0d';
        for (let i = 0; i < 8; i++) {
            const y = i * 32;
            ctx.fillRect(0, y, 256, 16);
            
            // Grooves
            for (let j = 0; j < 8; j++) {
                ctx.fillStyle = '#2a2a2a';
                ctx.fillRect(j * 32 + 8, y + 4, 16, 8);
            }
            ctx.fillStyle = '#0d0d0d';
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createCarbonFiberTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Base dark color
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 64, 64);
        
        // Weave pattern
        ctx.fillStyle = '#2a2a2a';
        for (let y = 0; y < 64; y += 8) {
            for (let x = 0; x < 64; x += 8) {
                if ((x + y) % 16 === 0) {
                    ctx.fillRect(x, y, 4, 4);
                    ctx.fillRect(x + 4, y + 4, 4, 4);
                }
            }
        }
        
        // Slight shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let y = 0; y < 64; y += 8) {
            ctx.fillRect(0, y, 64, 1);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }
    
    createNoiseTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        const imageData = ctx.createImageData(256, 256);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const value = Math.random() * 255;
            imageData.data[i] = value;
            imageData.data[i + 1] = value;
            imageData.data[i + 2] = value;
            imageData.data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }
    
    createSkyGradient() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#1e3c72');
        gradient.addColorStop(0.3, '#2a5298');
        gradient.addColorStop(0.5, '#5b9bd5');
        gradient.addColorStop(0.7, '#87ceeb');
        gradient.addColorStop(0.9, '#e0f4ff');
        gradient.addColorStop(1, '#ffffff');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1, 512);
        
        return new THREE.CanvasTexture(canvas);
    }
    
    createTrackMarkings() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Transparent background
        ctx.clearRect(0, 0, 512, 128);
        
        // Racing stripes (red and white)
        for (let i = 0; i < 16; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#ff0000' : '#ffffff';
            ctx.fillRect(i * 32, 0, 32, 128);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
    }
    
    createBoostPadTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Glowing orange background
        const gradient = ctx.createLinearGradient(0, 0, 256, 0);
        gradient.addColorStop(0, '#ff4400');
        gradient.addColorStop(0.5, '#ff8800');
        gradient.addColorStop(1, '#ff4400');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 128);
        
        // Arrow pattern
        ctx.fillStyle = '#ffff00';
        for (let i = 0; i < 4; i++) {
            const x = 20 + i * 60;
            ctx.beginPath();
            ctx.moveTo(x, 100);
            ctx.lineTo(x + 40, 64);
            ctx.lineTo(x, 28);
            ctx.lineTo(x + 20, 64);
            ctx.closePath();
            ctx.fill();
        }
        
        // Glow effect
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.fillRect(0, 0, 256, 128);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    createItemBoxTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Yellow-orange gradient
        const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 90);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.5, '#ffaa00');
        gradient.addColorStop(1, '#ff6600');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 128, 128);
        
        // Question mark
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 5;
        ctx.fillText('?', 64, 68);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 6;
        ctx.strokeRect(10, 10, 108, 108);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    getTexture(name) {
        return this.textures[name] || null;
    }
    
    // Create environment map for reflections
    createEnvMap() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Simple sky reflection
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(0.5, '#e0f4ff');
        gradient.addColorStop(1, '#228b22');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        return texture;
    }
}

// Global texture manager instance
window.textureManager = new TextureManager();
