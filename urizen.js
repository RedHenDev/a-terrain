// Procedural terrain generation.
let ridges=false;

// Perlin noise implementation.
const noise = {
    p: new Uint8Array(512),
    permutation: [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],
    init: function() {
        for(let i=0; i < 256; i++) {
            this.p[i] = this.p[i + 256] = this.permutation[i];
        }
    },
    fade: function(t) { return t * t * t * (t * (t * 6 - 15) + 10); },
    lerp: function(t, a, b) { return a + t * (b - a); },
    grad: function(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    },
    noise: function(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.p[X] + Y;
        const AA = this.p[A] + Z;
        const AB = this.p[A + 1] + Z;
        const B = this.p[X + 1] + Y;
        const BA = this.p[B] + Z;
        const BB = this.p[B + 1] + Z;

        return this.lerp(w,
            this.lerp(v,
                this.lerp(u,
                    this.grad(this.p[AA], x, y, z),
                    this.grad(this.p[BA], x-1, y, z)
                ),
                this.lerp(u,
                    this.grad(this.p[AB], x, y-1, z),
                    this.grad(this.p[BB], x-1, y-1, z)
                )
            ),
            this.lerp(v,
                this.lerp(u,
                    this.grad(this.p[AA+1], x, y, z-1),
                    this.grad(this.p[BA+1], x-1, y, z-1)
                ),
                this.lerp(u,
                    this.grad(this.p[AB+1], x, y-1, z-1),
                    this.grad(this.p[BB+1], x-1, y-1, z-1)
                )
            )
        );
    }
};

/*
// Auxiliary function to get terrain height at any point.
function getTerrainHeight(x, z) {
    const xCoord = x * 0.05;
    const zCoord = z * 0.05;
    
    let height = 0;
    height += noise.noise(xCoord * 1, 0, zCoord * 1) * 10;
    height += noise.noise(xCoord * 2, 0, zCoord * 2) * 5;
    height += noise.noise(xCoord * 4, 0, zCoord * 4) * 2.5;
    
    // Rare mountains.
    if (noise.noise(xCoord * 0.5, 0, zCoord * 0.5) > 0.5) {
        height *= 5;
    }
    
    return height;
}*/

function getTerrainHeight(x, z) {
    // Default 0.05.
    const xCoord = x * 0.06;  // Base frequency - try 0.03 for wider features or 0.08 for tighter
    const zCoord = z * 0.06;
    
    // Base terrain with multiple layers
    let height = 0;
    
    // Large features (mountains and valleys)
    // Original values 0.5 and 24.
    height += noise.noise(xCoord * 0.1, 0, zCoord * 0.1) * 48;  // Increased from 10
    
    // Medium features (hills)
    height += noise.noise(xCoord * 1, 0, zCoord * 1) * 12;  // New medium scale
    
    // Small features (rough terrain)
    height += noise.noise(xCoord * 2, 0, zCoord * 2) * 6;
    
    // Micro features (texture)
    height += noise.noise(xCoord * 4, 0, zCoord * 4) * 3;
    
    // Mountain generation with more variation
    const mountainNoise = noise.noise(xCoord * 0.25, 0, zCoord * 0.25);
    if (mountainNoise > 0.5) {
        // Create more varied mountains.
        // Default 40, not 160.
        const mountainHeight = (mountainNoise - 0.5) * 2; // 0 to 1
        const mountainScale = 160 + noise.noise(xCoord * 0.1, 0, zCoord * 0.1) * 20;
        height += mountainHeight * mountainScale;
    }
    
    // Add plateaus.
    const plateauNoise = noise.noise(xCoord * 0.15, 0, zCoord * 0.15);
    if (plateauNoise > 0.7) {
        // Default 15, not 150.
        const plateauHeight = 15;
        const plateauBlend = (plateauNoise - 0.7) * 3.33; // 0 to 1
        height = height * (1 - plateauBlend) + plateauHeight * plateauBlend;
    }
    
    // Add valleys/canyons.
    const valleyNoise = noise.noise(xCoord * 0.2, 0, zCoord * 0.2);
    if (valleyNoise < 0.2) {
        const valleyDepth = -10;
        const valleyBlend = (0.2 - valleyNoise) * 5; // 0 to 1
        height *= (1 - valleyBlend * 0.8);
    }

    //let ridges=false;
    let biomes=true;
    let erosion=true;
    // Add biomes.
    if (biomes){
        height += getBiomeHeight(x,z)
    }
    // Add ridges.
    if (ridges){
        const ridgeNoise = getRidgeNoise(xCoord * 0.5, zCoord * 0.5);
        // Ridge strength default 30, not 12.
        height += ridgeNoise * ridgeNoise * 12; // Square it for sharper ridges.
    }
    // Add erosion.
    if (erosion){
        height += getErosionNoise(xCoord,zCoord);
    }
    
    return height;
}

// Terrain generator component.
AFRAME.registerComponent('terrain-generator', {
    schema: {
        chunk: {type: 'vec2'} // Current chunk coordinates.
    },

    init: function() {
        noise.init();
        this.chunks = new Map(); // Store generated chunks.
        // Start at -99,999 not 0,0, else gap behind subject.
        this.generateChunk(-99, 999);
        // Chunksize default 50, not 88.
        this.chunkSize=128;
        // Default number of chunks to gen in one go is 1, not 4.
        this.chunksToGen=4;
    },

    generateChunk: function(chunkX, chunkZ) {
        const chunkSize = this.chunkSize;
        const resolution = 1;
        const vertices = [];
        const indices = [];
        
        // Gaps between chunks. Attempting to fix by subtracting 10. NOPE
        // let's subtract some amount from chunkSize. Ah! Off-by-1 error :D
        const offsetX = chunkX * (chunkSize - 1);
        const offsetZ = chunkZ * (chunkSize - 1);
        
        for (let z = 0; z < chunkSize; z += resolution) {
            for (let x = 0; x < chunkSize; x += resolution) {
                const worldX = x + offsetX;
                const worldZ = z + offsetZ;
                const height = getTerrainHeight(worldX, worldZ);
                vertices.push(worldX, height, worldZ);
            }
        }

        // Generate indices.
        const verticesPerRow = chunkSize / resolution;
        for (let z = 0; z < verticesPerRow - 1; z++) {
            for (let x = 0; x < verticesPerRow - 1; x++) {
                const topLeft = z * verticesPerRow + x;
                const topRight = topLeft + 1;
                const bottomLeft = (z + 1) * verticesPerRow + x;
                const bottomRight = bottomLeft + 1;

                indices.push(topLeft, bottomLeft, topRight);
                indices.push(bottomLeft, bottomRight, topRight);
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();

        const chunk = new THREE.Mesh(
            geometry,
            new THREE.MeshStandardMaterial({
                color: '#4CAF50',
                roughness: 0.8,
                metalness: 0.2,
                flatShading: true
            })
        );

        this.el.object3D.add(chunk);
        this.chunks.set(`${chunkX},${chunkZ}`, chunk);
    },

    tick: function() {
        const player = document.querySelector('#player').object3D;
        const chunkSize = this.chunkSize;
        
        // Calculate current chunk.
        const chunkX = Math.floor(player.position.x / chunkSize);
        const chunkZ = Math.floor(player.position.z / chunkSize);
        
        // Generate surrounding chunks if they don't exist.
        // Default is 1, not 4.
        for (let z = chunkZ - this.chunksToGen; z <= chunkZ + this.chunksToGen; z++) {
            for (let x = chunkX - this.chunksToGen; x <= chunkX + this.chunksToGen; x++) {
                const key = `${x},${z}`;
                if (!this.chunks.has(key)) {
                    this.generateChunk(x, z);
                }
            }
        }

        // Remove far chunks. Default value us 2, not 5.
        for (const [key, chunk] of this.chunks.entries()) {
            const [x, z] = key.split(',').map(Number);
            if (    Math.abs(x - chunkX) > (this.chunksToGen+1) || 
                    Math.abs(z - chunkZ) > (this.chunksToGen+1)) {
                this.el.object3D.remove(chunk);
                this.chunks.delete(key);
            }
        }
    }
});

function getBiomeHeight(x, z) {
    const xCoord = x * 0.05;
    const zCoord = z * 0.05;
    
    // Biome selection
    const biomeNoise = noise.noise(xCoord * 0.02, 0, zCoord * 0.02);
    
    let height = 0;
    
    if (biomeNoise < 0.3) {
        // Plains biome
        height += noise.noise(xCoord * 1, 0, zCoord * 1) * 8;
        height += noise.noise(xCoord * 2, 0, zCoord * 2) * 4;
        
    } else if (biomeNoise < 0.6) {
        // Hills biome
        height += noise.noise(xCoord * 0.5, 0, zCoord * 0.5) * 20;
        height += noise.noise(xCoord * 1, 0, zCoord * 1) * 10;
        
    } else {
        // Mountains biome
        height += noise.noise(xCoord * 0.3, 0, zCoord * 0.3) * 35;
        height += noise.noise(xCoord * 0.8, 0, zCoord * 0.8) * 15;
        
        // Sharp peaks
        const peakNoise = noise.noise(xCoord * 1.5, 0, zCoord * 1.5);
        if (peakNoise > 0.7) {
            height += Math.pow(peakNoise - 0.7, 2) * 60;
        }
    }
    
    return height;
}

function getRidgeNoise(x, z) {
    const n = noise.noise(x, 0, z);
    return 1 - Math.abs(n); // Creates sharp ridges
}

function getErosionNoise(xCoord,zCoord){
    // Erosion effect.
    const erosionNoise = noise.noise(xCoord * 3, 0, zCoord * 3);
    const slope = Math.abs(
        noise.noise(xCoord + 0.1, 0, zCoord) - 
        noise.noise(xCoord - 0.1, 0, zCoord)
    );
    
    // More erosion on steeper slopes.
    // Strength default is 10, not 20.
    const erosionStrength=20;
    if (slope > 0.2) {
        return -erosionNoise * slope * erosionStrength;
    } else return 0;
}