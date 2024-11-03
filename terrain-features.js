// Tree and arch generation utilities
const terrainFeatures = {
    // Tree parameters
    treeSettings: {
        minHeight: 5,
        maxHeight: 12,
        trunkRadius: 0.4,
        canopyRadius: 3,
        minSpacing: 15, // Minimum distance between trees
        density: 0.02   // Chance of tree spawning at each valid position
    },

    // Arch parameters
    archSettings: {
        minWidth: 8,
        maxWidth: 15,
        minHeight: 6,
        maxHeight: 12,
        thickness: 3,
        spacing: 80,    // Minimum distance between arches
        noise: 0.3      // Amount of noise/irregularity in arch shape
    },

    // Determine if a position is suitable for a tree
    canPlaceTree: function(x, z, existingTrees) {
        // Check distance from other trees
        for (const tree of existingTrees) {
            const dx = x - tree.position.x;
            const dz = z - tree.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            if (distance < this.treeSettings.minSpacing) return false;
        }

        // Check terrain steepness
        const slope = this.calculateSlope(x, z);
        return slope < 0.3; // Only place trees on relatively flat ground
    },

    // Calculate terrain slope at a point
    calculateSlope: function(x, z) {
        const h1 = getTerrainHeight(x, z);
        const h2 = getTerrainHeight(x + 1, z);
        const h3 = getTerrainHeight(x, z + 1);
        const dx = Math.abs(h2 - h1);
        const dz = Math.abs(h3 - h1);
        return Math.max(dx, dz);
    },

    // Generate a single tree mesh
    createTree: function(x, y, z) {
        const height = this.treeSettings.minHeight + 
            Math.random() * (this.treeSettings.maxHeight - this.treeSettings.minHeight);

        // Create trunk
        const trunkGeometry = new THREE.CylinderGeometry(
            this.treeSettings.trunkRadius,
            this.treeSettings.trunkRadius * 1.2,
            height,
            8
        );
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

        // Create canopy (multiple spheres for more natural look)
        const canopyMaterial = new THREE.MeshStandardMaterial({
            color: 0x2E8B57,
            roughness: 0.8
        });
        const canopy = new THREE.Group();
        
        for (let i = 0; i < 3; i++) {
            const sphereGeometry = new THREE.SphereGeometry(
                this.treeSettings.canopyRadius * (0.8 + Math.random() * 0.4),
                8,
                8
            );
            const sphere = new THREE.Mesh(sphereGeometry, canopyMaterial);
            sphere.position.set(
                (Math.random() - 0.5) * 2,
                height - this.treeSettings.canopyRadius + i * 2,
                (Math.random() - 0.5) * 2
            );
            canopy.add(sphere);
        }

        // Combine trunk and canopy
        const tree = new THREE.Group();
        trunk.position.y = height / 2;
        tree.add(trunk);
        tree.add(canopy);
        tree.position.set(x, y, z);
        return tree;
    },

    // Generate a single arch mesh
    createArch: function(x, y, z, noiseFunc, rotation = 0) {
        const width = this.archSettings.minWidth + 
            Math.random() * (this.archSettings.maxWidth - this.archSettings.minWidth);
        const height = this.archSettings.minHeight +
            Math.random() * (this.archSettings.maxHeight - this.archSettings.minHeight);

        // Create arch shape
        const points = [];
        const segments = 20;
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI;
            const xPos = Math.cos(theta) * width / 2;
            const yPos = Math.sin(theta) * height;
            
            // Add some noise to make it look more natural
            const noiseVal = (noiseFunc(xPos * 0.1, yPos * 0.1, 0) * 2 - 1) * this.archSettings.noise;
            points.push(new THREE.Vector2(xPos + noiseVal, yPos + noiseVal));
        }

        // Create the arch geometry
        const archShape = new THREE.Shape(points);
        const extrudeSettings = {
            steps: 1,
            depth: this.archSettings.thickness,
            bevelEnabled: true,
            bevelThickness: 2,
            bevelSize: 1,
            bevelSegments: 3
        };

        const archGeometry = new THREE.ExtrudeGeometry(archShape, extrudeSettings);
        const archMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.9,
            metalness: 0.1
        });

        const arch = new THREE.Mesh(archGeometry, archMaterial);
        arch.position.set(x, y, z);
        arch.rotation.y = rotation;
        return arch;
    }
};

// Extend the terrain-generator component
AFRAME.registerComponent('terrain-features', {
    dependencies: ['terrain-generator'],
    
    init: function() {
        this.features = new Map();
        this.lastPlayerChunk = { x: 0, z: 0 };
        
        // Get noise function from terrain generator
        const terrainGenerator = this.el.components['terrain-generator'];
        if (terrainGenerator) {
            this.noise = window.noise;  // Use the global noise object
            if (!this.noise) {
                console.warn('Noise function not found, initializing...');
                this.noise = {
                    noise: function(x, y, z) {
                        return Math.random(); // Fallback if noise isn't available
                    }
                };
            }
        }
    },

    tick: function() {
        if (!this.noise) return; // Skip if noise isn't initialized

        const player = document.querySelector('#player').object3D;
        const chunkSize = this.el.components['terrain-generator'].chunkSize;
        
        // Calculate current chunk
        const chunkX = Math.floor(player.position.x / chunkSize);
        const chunkZ = Math.floor(player.position.z / chunkSize);
        
        // Only update features when player moves to a new chunk
        if (chunkX !== this.lastPlayerChunk.x || chunkZ !== this.lastPlayerChunk.z) {
            this.updateFeatures(chunkX, chunkZ, chunkSize);
            this.lastPlayerChunk = { x: chunkX, z: chunkZ };
        }
    },

    updateFeatures: function(chunkX, chunkZ, chunkSize) {
        // Remove distant features
        this.removeDistantFeatures(chunkX, chunkZ, chunkSize);
        
        // Generate new features for surrounding chunks
        for (let z = chunkZ - 1; z <= chunkZ + 1; z++) {
            for (let x = chunkX - 1; x <= chunkX + 1; x++) {
                const key = `${x},${z}`;
                if (!this.features.has(key)) {
                    this.generateFeaturesForChunk(x, z, chunkSize);
                }
            }
        }
    },

    generateFeaturesForChunk: function(chunkX, chunkZ, chunkSize) {
        const features = new THREE.Group();
        const existingTrees = [];
        
        // Generate trees
        for (let z = 0; z < chunkSize; z += 5) {
            for (let x = 0; x < chunkSize; x += 5) {
                const worldX = x + chunkX * (chunkSize - 1);
                const worldZ = z + chunkZ * (chunkSize - 1);
                
                if (Math.random() < terrainFeatures.treeSettings.density &&
                    terrainFeatures.canPlaceTree(worldX, worldZ, existingTrees)) {
                    const height = getTerrainHeight(worldX, worldZ);
                    const tree = terrainFeatures.createTree(worldX, height, worldZ);
                    features.add(tree);
                    existingTrees.push({ position: { x: worldX, z: worldZ } });
                }
            }
        }
        
        // Generate arches
        const archNoise = this.noise.noise(chunkX * 0.2, 0, chunkZ * 0.2);
        if (archNoise > 0.7) {
            const centerX = chunkX * (chunkSize - 1) + chunkSize / 2;
            const centerZ = chunkZ * (chunkSize - 1) + chunkSize / 2;
            const height = getTerrainHeight(centerX, centerZ);
            const rotation = Math.random() * Math.PI * 2;
            
            const arch = terrainFeatures.createArch(centerX, height, centerZ, this.noise.noise.bind(this.noise), rotation);
            features.add(arch);
            console.log('Creating rock arch!');
        }
        
        this.el.object3D.add(features);
        this.features.set(`${chunkX},${chunkZ}`, features);
    },

    removeDistantFeatures: function(chunkX, chunkZ) {
        for (const [key, features] of this.features.entries()) {
            const [x, z] = key.split(',').map(Number);
            if (Math.abs(x - chunkX) > 2 || Math.abs(z - chunkZ) > 2) {
                this.el.object3D.remove(features);
                this.features.delete(key);
            }
        }
    }
});