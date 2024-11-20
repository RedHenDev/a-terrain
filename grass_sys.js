AFRAME.registerComponent('grass-system', {
    schema: {
        count: { type: 'number', default: 2000 },
        range: { type: 'number', default: 88 },
        bladeHeight: { type: 'number', default: 8.5 },
        bladeWidth: { type: 'number', default: 0.4 },
        windStrength: { type: 'number', default: 0.2 },
        windTurbulence: { type: 'number', default: 0.05 },
        lodDistances: { type: 'array', default: [50, 200, 1000] },
        debug: { type: 'boolean', default: false }
    },

    init: function() {
        this.camera = document.querySelector('#player').object3D;
        this.transforms = [];
        this.lodLevels = [];

        // Create grass blade geometry with more complex vertex structure
        const bladeGeometry = this.createBladeGeometry();
        
        const material = new THREE.MeshPhongMaterial({
            color: 0x3b7f3b,
            side: THREE.DoubleSide,
            vertexColors: true
        });

        // Create multiple LOD meshes
        this.createLODMeshes(bladeGeometry, material);

        this.time = 0;
    },

    createBladeGeometry: function() {
        // More complex blade geometry with more vertices for better wind simulation
        const bladeGeometry = new THREE.PlaneGeometry(
            this.data.bladeWidth, 
            this.data.bladeHeight,
            5, // More segments for more natural bending
            3
        );
        bladeGeometry.translate(0, this.data.bladeHeight / 2, 0);

        // Advanced vertex color gradient
        const colors = new Float32Array(bladeGeometry.attributes.position.count * 3);
        for (let i = 0; i < bladeGeometry.attributes.position.count; i++) {
            const y = bladeGeometry.attributes.position.array[i * 3 + 1];
            const intensity = 0.8 + (y / this.data.bladeHeight) * 0.2;
            colors[i * 3] = 0.23 * intensity;
            colors[i * 3 + 1] = 0.5 * intensity;
            colors[i * 3 + 2] = 0.23 * intensity;
        }
        bladeGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        return bladeGeometry;
    },

    createLODMeshes: function(baseGeometry, material) {
        this.data.lodDistances.forEach((distance, index) => {
            const instanceCount = this.data.count * Math.pow(0.5, index);
            const instancedGrass = new THREE.InstancedMesh(
                baseGeometry,
                material,
                Math.floor(instanceCount)
            );
            this.lodLevels.push(instancedGrass);
            this.el.setObject3D(`grass-system-lod-${index}`, instancedGrass);
        });

        this.populateGrassMeshes();
    },

    populateGrassMeshes: function() {
        const dummy = new THREE.Object3D();

        // Get the current entity's position (chunk offset)
        const chunkOffsetX = this.el.object3D.position.x;
        const chunkOffsetZ = this.el.object3D.position.z;

        for (let i = 0; i < this.data.count; i++) {
            // Generate local coordinates within the chunk range
            const localX = (Math.random() - 0.5) * this.data.range;
            const localZ = (Math.random() - 0.5) * this.data.range;
            
            // Calculate world coordinates by adding chunk offset
            const worldX = localX + chunkOffsetX;
            const worldZ = localZ + chunkOffsetZ;
            
            let y;
            try {
                y = getTerrainHeight(worldX, worldZ);
            } catch (e) {
                y = 0;
            }

            const transform = {
                position: new THREE.Vector3(localX, y, localZ),
                rotation: new THREE.Euler(
                    (Math.random() - 0.5) * 0.2,
                    Math.random() * Math.PI * 2,
                    0
                ),
                scale: new THREE.Vector3(
                    0.7 + Math.random() * 0.6,
                    0.8 + Math.random() * 0.4,
                    1
                )
            };

            this.transforms.push(transform);

            // Populate LOD meshes
            this.lodLevels.forEach((instancedGrass, lodIndex) => {
                if (i < instancedGrass.count) {
                    dummy.position.copy(transform.position);
                    dummy.rotation.copy(transform.rotation);
                    dummy.scale.copy(transform.scale);
                    dummy.updateMatrix();
                    instancedGrass.setMatrixAt(i, dummy.matrix);
                    instancedGrass.instanceMatrix.needsUpdate = true;
                }
            });
        }
    },

    tick: function(t, dt) {
        this.time += dt * 0.001;
        const dummy = new THREE.Object3D();
        const cameraPosition = this.camera.position;

        this.lodLevels.forEach((instancedGrass, lodIndex) => {
            const maxDistance = this.data.lodDistances[lodIndex];
            
            for (let i = 0; i < instancedGrass.count; i++) {
                const transform = this.transforms[i];
                
                // Check distance for LOD
                const distanceToCamera = transform.position.distanceTo(cameraPosition);
                if (distanceToCamera > maxDistance) {
                    instancedGrass.visible = false;
                    continue;
                }
                instancedGrass.visible = true;

                dummy.position.copy(transform.position);
                dummy.rotation.copy(transform.rotation);
                dummy.scale.copy(transform.scale);

                // Advanced wind simulation with turbulence
                const windFrequency = 2;
                const xOffset = transform.position.x * 0.1;
                const zOffset = transform.position.z * 0.1;

                const windAngle = 
                    Math.sin(this.time * windFrequency + xOffset) * 
                    Math.cos(this.time * windFrequency + zOffset) * 
                    this.data.windStrength;

                // Add turbulence
                const turbulence = 
                    Math.sin(this.time * 3 + xOffset) * 
                    Math.cos(this.time * 3 + zOffset) * 
                    this.data.windTurbulence;

                dummy.rotation.z = windAngle + turbulence;

                dummy.updateMatrix();
                instancedGrass.setMatrixAt(i, dummy.matrix);
            }
            instancedGrass.instanceMatrix.needsUpdate = true;
        });
    },

    remove: function() {
        this.lodLevels.forEach(instancedGrass => {
            instancedGrass.geometry.dispose();
            instancedGrass.material.dispose();
        });
        this.el.removeObject3D('grass-system');
    }
});