// Utility functions for the racing game

// Math utilities
const Utils = {
    // Clamp value between min and max
    clamp: function(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    // Linear interpolation
    lerp: function(a, b, t) {
        return a + (b - a) * t;
    },
    
    // Smooth interpolation
    smoothLerp: function(a, b, t) {
        t = t * t * (3 - 2 * t);
        return a + (b - a) * t;
    },
    
    // Convert degrees to radians
    degToRad: function(degrees) {
        return degrees * Math.PI / 180;
    },
    
    // Convert radians to degrees
    radToDeg: function(radians) {
        return radians * 180 / Math.PI;
    },
    
    // Get random value in range
    random: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    // Get random integer in range
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Distance between two points (2D)
    distance2D: function(x1, z1, x2, z2) {
        const dx = x2 - x1;
        const dz = z2 - z1;
        return Math.sqrt(dx * dx + dz * dz);
    },
    
    // Distance between two Vector3 points
    distance3D: function(p1, p2) {
        return p1.distanceTo(p2);
    },
    
    // Angle between two points (returns radians)
    angleBetween: function(x1, z1, x2, z2) {
        return Math.atan2(z2 - z1, x2 - x1);
    },
    
    // Normalize angle to -PI to PI
    normalizeAngle: function(angle) {
        while (angle > Math.PI) angle -= 2 * Math.PI;
        while (angle < -Math.PI) angle += 2 * Math.PI;
        return angle;
    },
    
    // Check if point is inside polygon (2D)
    pointInPolygon: function(x, z, polygon) {
        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, zi = polygon[i].z;
            const xj = polygon[j].x, zj = polygon[j].z;
            
            if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) {
                inside = !inside;
            }
        }
        return inside;
    },
    
    // Get closest point on line segment
    closestPointOnLine: function(px, pz, x1, z1, x2, z2) {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const len2 = dx * dx + dz * dz;
        
        if (len2 === 0) return { x: x1, z: z1 };
        
        let t = ((px - x1) * dx + (pz - z1) * dz) / len2;
        t = Math.max(0, Math.min(1, t));
        
        return {
            x: x1 + t * dx,
            z: z1 + t * dz
        };
    },
    
    // Catmull-Rom spline interpolation
    catmullRom: function(p0, p1, p2, p3, t) {
        const t2 = t * t;
        const t3 = t2 * t;
        
        return 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t3
        );
    },
    
    // Get point on spline path (closed loop)
    getSplinePoint: function(points, t) {
        // 閉ループ用: points.length * t を使用
        // これにより最後のウェイポイント→最初のウェイポイント間も生成される
        const p = points.length * t;
        const intPoint = Math.floor(p);
        const weight = p - intPoint;
        
        const p0 = points[(intPoint - 1 + points.length) % points.length];
        const p1 = points[intPoint % points.length];
        const p2 = points[(intPoint + 1) % points.length];
        const p3 = points[(intPoint + 2) % points.length];
        
        return {
            x: this.catmullRom(p0.x, p1.x, p2.x, p3.x, weight),
            y: p1.y !== undefined ? this.catmullRom(p0.y || 0, p1.y || 0, p2.y || 0, p3.y || 0, weight) : 0,
            z: this.catmullRom(p0.z, p1.z, p2.z, p3.z, weight),
            width: p1.width !== undefined ? this.catmullRom(p0.width || 25, p1.width || 25, p2.width || 25, p3.width || 25, weight) : undefined
        };
    },
    
    // Format time as MM:SS.ms
    formatTime: function(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
    },
    
    // Get ordinal suffix (1st, 2nd, 3rd, etc.)
    getOrdinal: function(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    },
    
    // Get ordinal suffix only
    getOrdinalSuffix: function(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    },
    
    // Shuffle array
    shuffleArray: function(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    // Deep clone object
    deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Ease in out quad
    easeInOutQuad: function(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    },
    
    // Ease out elastic
    easeOutElastic: function(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 :
            Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    
    // Ease out bounce
    easeOutBounce: function(t) {
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }
};

// Color palette for karts - N64 Mario Kart style with character-specific features
const KartColors = [
    { 
        name: 'Mario', 
        primary: 0xEE1C25, 
        secondary: 0x0D5AC1, 
        accent: 0xFFFFFF, 
        skinTone: 0xFFCC99, 
        hatColor: 0xEE1C25,
        characterType: 'human',
        hasMustache: true,
        mustacheColor: 0x4A2810,
        emblem: 'M',
        kartStyle: 'standard'
    },
    { 
        name: 'Luigi', 
        primary: 0x00B800, 
        secondary: 0x0047AB, 
        accent: 0xFFFFFF, 
        skinTone: 0xFFCC99, 
        hatColor: 0x00B800,
        characterType: 'human',
        hasMustache: true,
        mustacheColor: 0x4A2810,
        emblem: 'L',
        kartStyle: 'standard'
    },
    { 
        name: 'Peach', 
        primary: 0xFF69B4, 
        secondary: 0xFFFFFF, 
        accent: 0xFFD700, 
        skinTone: 0xFFE4CC, 
        hatColor: 0xFFD700,
        characterType: 'princess',
        hasCrown: true,
        hairColor: 0xFFDD44,
        emblem: '♥',
        kartStyle: 'elegant'
    },
    { 
        name: 'Toad', 
        primary: 0xFFFFFF, 
        secondary: 0x1E90FF, 
        accent: 0xEE1C25, 
        skinTone: 0xFFE8D0, 
        hatColor: 0xFFFFFF,
        characterType: 'toad',
        mushroomSpots: 0xEE1C25,
        emblem: '🍄',
        kartStyle: 'compact'
    },
    { 
        name: 'Yoshi', 
        primary: 0x7FD13B, 
        secondary: 0xFFFFFF, 
        accent: 0xFF6347, 
        skinTone: 0x7FD13B, 
        hatColor: 0xEE1C25,
        characterType: 'yoshi',
        shellColor: 0xEE1C25,
        noseColor: 0x7FD13B,
        emblem: '🥚',
        kartStyle: 'sporty'
    },
    { 
        name: 'Wario', 
        primary: 0xFFDD00, 
        secondary: 0x800080, 
        accent: 0xFFFFFF, 
        skinTone: 0xFFCC66, 
        hatColor: 0xFFDD00,
        characterType: 'human',
        hasMustache: true,
        mustacheColor: 0x2A2A2A,
        mustacheStyle: 'zigzag',
        emblem: 'W',
        kartStyle: 'heavy'
    },
    { 
        name: 'DK', 
        primary: 0x8B4513, 
        secondary: 0xFFDD00, 
        accent: 0xEE1C25, 
        skinTone: 0x8B4513, 
        hatColor: 0x8B4513,
        characterType: 'dk',
        furColor: 0x6B3510,
        tieColor: 0xEE1C25,
        emblem: 'DK',
        kartStyle: 'heavy'
    },
    { 
        name: 'Bowser', 
        primary: 0x4B7C0F, 
        secondary: 0xFF8C00, 
        accent: 0xFFFF00, 
        skinTone: 0x7FA84F, 
        hatColor: 0xFF0000,
        characterType: 'bowser',
        shellColor: 0x4B7C0F,
        spikeColor: 0xFFFFCC,
        maneColor: 0xFF6600,
        emblem: '🔥',
        kartStyle: 'monster'
    }
];

// Item definitions - Mario Kart Style
const ItemTypes = {
    MUSHROOM: {
        id: 'mushroom',
        name: 'Super Mushroom',
        description: 'Speed boost',
        rarity: { '1-3': 0.15, '4-5': 0.2, '6-8': 0.2 }
    },
    TRIPLE_MUSHROOM: {
        id: 'triple_mushroom',
        name: 'Triple Mushroom',
        description: 'Three speed boosts',
        rarity: { '1-3': 0, '4-5': 0.1, '6-8': 0.2 }
    },
    GOLDEN_MUSHROOM: {
        id: 'golden_mushroom',
        name: 'Golden Mushroom',
        description: 'Unlimited boosts for a short time',
        rarity: { '1-3': 0, '4-5': 0, '6-8': 0.1 }
    },
    BANANA: {
        id: 'banana',
        name: 'Banana',
        description: 'Drop behind to spin out others',
        rarity: { '1-3': 0.30, '4-5': 0.20, '6-8': 0.05 }
    },
    GREEN_SHELL: {
        id: 'green_shell',
        name: 'Green Shell',
        description: 'Fires straight, bounces off walls',
        rarity: { '1-3': 0.20, '4-5': 0.20, '6-8': 0.10 }
    },
    RED_SHELL: {
        id: 'red_shell',
        name: 'Red Shell',
        description: 'Homing shell that targets nearest rival',
        rarity: { '1-3': 0, '4-5': 0.10, '6-8': 0.20 }
    },
    STAR: {
        id: 'star',
        name: 'Super Star',
        description: 'Invincibility and speed boost',
        rarity: { '1-3': 0, '4-5': 0.05, '6-8': 0.15 }
    },
    LIGHTNING: {
        id: 'lightning',
        name: 'Lightning Bolt',
        description: 'Shrinks and slows all opponents',
        rarity: { '1-3': 0, '4-5': 0, '6-8': 0.10 }
    },
    BOB_OMB: {
        id: 'bob_omb',
        name: 'Bob-omb',
        description: 'Throw to create explosion',
        rarity: { '1-3': 0.15, '4-5': 0.10, '6-8': 0.05 }
    },
    BLOOPER: {
        id: 'blooper',
        name: 'Blooper',
        description: 'Sprays ink on your own screen',
        rarity: { '1-3': 0.15, '4-5': 0.08, '6-8': 0 }
    },
    BULLET_BILL: {
        id: 'bullet_bill',
        name: 'Bullet Bill',
        description: 'Transform into Bullet Bill and auto-drive',
        rarity: { '1-3': 0, '4-5': 0, '6-8': 0.10 }
    },
    SPINY_SHELL: {
        id: 'spiny_shell',
        name: 'Spiny Shell',
        description: 'Targets 1st place and causes big explosion',
        rarity: { '1-3': 0, '4-5': 0.02, '6-8': 0.08 }
    }
};

// Get random item based on position
function getRandomItem(position) {
    const posGroup = position <= 3 ? '1-3' : position <= 5 ? '4-5' : '6-8';
    const items = Object.values(ItemTypes);
    const weights = items.map(item => item.rarity[posGroup]);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    
    let random = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return items[i];
        }
    }
    return items[0];
}

// Racer names - Mario Kart characters
const RacerNames = [
    'Mario',
    'Luigi',
    'Peach',
    'Toad',
    'Yoshi',
    'Wario',
    'Donkey Kong',
    'Koopa'
];

// Export for use in other modules
window.Utils = Utils;
window.KartColors = KartColors;
window.ItemTypes = ItemTypes;
window.getRandomItem = getRandomItem;
window.RacerNames = RacerNames;
