AFRAME.registerComponent('terrain-grass-generator', {
    dependencies: ['terrain-generator'],

    schema: {
        grassCount: { type: 'number', default: 2000 },
        grassRange: { type: 'number', default: 88 },
        minHeight: { type: 'number', default: 0.5 },
        maxHeight: { type: 'number', default: 8.5 }
    },

    init: function() {
        this.terrainGenerator = this.el.components['terrain-generator'];
        this.grassInstances = new Map();
    },

    update: function() {
        // Listen for chunk generation events
        this.el.addEventListener('chunk-generated', this.onChunkGenerated.bind(this));
        
    },

    onChunkGenerated: function(event) {
        const { chunkX, chunkZ } = event.detail;
        this.generateGrassForChunk(chunkX, chunkZ);
        console.log('new chunk...');
    },

    generateGrassForChunk: function(chunkX, chunkZ) {
        // Create grass entity for this chunk
        const grassEntity = document.createElement('a-entity');
        grassEntity.setAttribute('grass-system', {
            count: this.data.grassCount,
            range: this.data.grassRange,
            windStrength: 0.1,
            windTurbulence: 0.05
        });

        // Position grass entity at chunk location
        const chunkSize = this.terrainGenerator.chunkSize;
        const offsetX = chunkX * (chunkSize - 1);
        const offsetZ = chunkZ * (chunkSize - 1);
        grassEntity.object3D.position.set(offsetX, 0, offsetZ);

        // Modify getTerrainHeight to respect min/max height
        // const originalGetTerrainHeight = window.getTerrainHeight;
        // window.getTerrainHeight = (x, z) => {
        //     const height = originalGetTerrainHeight(x, z);
        //     return Math.max(
        //         this.data.minHeight, 
        //         Math.min(height, this.data.maxHeight)
        //     );
        // };

        // Add grass entity to scene
        this.el.sceneEl.appendChild(grassEntity);

        // Store reference to clean up later
        const key = `${chunkX},${chunkZ}`;
        this.grassInstances.set(key, grassEntity);
    },

    tick: function() {
        const player = document.querySelector('#player').object3D;
        const chunkSize = this.terrainGenerator.chunkSize;
        
        // Calculate current chunk
        const chunkX = Math.floor(player.position.x / chunkSize);
        const chunkZ = Math.floor(player.position.z / chunkSize);
        
        // Remove far grass chunks
        for (const [key, grassEntity] of this.grassInstances.entries()) {
            const [x, z] = key.split(',').map(Number);
            if (Math.abs(x - chunkX) > 3 || Math.abs(z - chunkZ) > 3) {
                grassEntity.parentNode.removeChild(grassEntity);
                this.grassInstances.delete(key);
            }
        }
    },

    remove: function() {
        // Restore original terrain height function
        //window.getTerrainHeight = originalGetTerrainHeight;

        // Remove all grass instances
        for (const grassEntity of this.grassInstances.values()) {
            grassEntity.parentNode.removeChild(grassEntity);
        }
        this.grassInstances.clear();
    }
});