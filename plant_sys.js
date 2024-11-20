AFRAME.registerComponent('plant-system', {
    schema: {
        count: { type: 'number', default: 512 },
        range: { type: 'number', default: 88 },
        minHeight: { type: 'number', default: 0.5 },
        maxHeight: { type: 'number', default: 2 },
        windStrength: { type: 'number', default: 0.2 },
        windTurbulence: { type: 'number', default: 0.05 }
    },

    init: function() {
        this.camera = document.querySelector('#player').object3D;
        this.transforms = [];

        // Create a more complex plant geometry 
        const plantGeometry = this.createPlantGeometry();

        // Material for plants
        const material = new THREE.MeshPhongMaterial({
            color: '#556B2F', // Dark olive green
            side: THREE.DoubleSide,
            vertexColors: true
        });

        // Create instanced mesh for plants
        this.instancedPlants = new THREE.InstancedMesh(
            plantGeometry,
            material,
            this.data.count
        );
        this.el.setObject3D('plants', this.instancedPlants);

        this.populatePlantMeshes();
        this.time = 0;
    },

    createPlantGeometry: function() {
        // Create trunk
        const trunkGeometry = new THREE.CylinderGeometry(
            0.1, // top radius
            0.2, // bottom radius
            1.5, // height
            6    // radial segments
        );

        // Branch and leaf offsets
        const branchOffsets = [
            { x: 0.3, y: 1.2, z: 0.2, rotX: 0.5, rotY: 0.3 },
            { x: -0.3, y: 1.2, z: -0.2, rotX: -0.4, rotY: -0.3 }
        ];

        const leafOffsets = [
            { x: 0.4, y: 1.5, z: 0.3, rotX: 0.5, rotY: 0 },
            { x: -0.4, y: 1.5, z: -0.3, rotX: -0.5, rotY: Math.PI }
        ];

        // Create branches
        const branchGeometry = new THREE.CylinderGeometry(
            0.05, // top radius
            0.1,  // bottom radius
            1,    // height
            4     // radial segments
        );

        // Create leaves
        const leafGeometry = new THREE.ConeGeometry(
            0.3,  // radius
            0.5,  // height
            4     // radial segments
        );

        // Create a buffer geometry to combine meshes
        const combinedGeometry = new THREE.BufferGeometry();
        
        // Arrays to hold all geometries
        const geometries = [trunkGeometry];
        const positions = [];
        const normals = [];
        const colors = [];

        // Add branches and leaves
        [branchGeometry, ...branchOffsets.map(offset => {
            const branchClone = branchGeometry.clone();
            branchClone.translate(offset.x, offset.y, offset.z);
            return branchClone;
        }), leafGeometry, ...leafOffsets.map(offset => {
            const leafClone = leafGeometry.clone();
            leafClone.translate(offset.x, offset.y, offset.z);
            return leafClone;
        })].forEach(geo => geometries.push(geo));

        // Merge geometries
        geometries.forEach(geometry => {
            const posAttr = geometry.attributes.position;
            const normAttr = geometry.attributes.normal;
            
            for (let i = 0; i < posAttr.count; i++) {
                positions.push(
                    posAttr.getX(i),
                    posAttr.getY(i),
                    posAttr.getZ(i)
                );
                
                normals.push(
                    normAttr.getX(i),
                    normAttr.getY(i),
                    normAttr.getZ(i)
                );

                // Add vertex colors
                const y = posAttr.getY(i);
                const intensity = 0.8 + (y / 2) * 0.2;
                colors.push(
                    0.3 * intensity,   // Red
                    0.6 * intensity,   // Green
                    0.3 * intensity    // Blue
                );
            }
        });

        // Set attributes for combined geometry
        combinedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        combinedGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        combinedGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        return combinedGeometry;
    },

    populatePlantMeshes: function() {
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
                    0.7 + Math.random() * 0.6
                )
            };

            this.transforms.push(transform);

            // Set instance matrix
            dummy.position.copy(transform.position);
            dummy.rotation.copy(transform.rotation);
            dummy.scale.copy(transform.scale);
            dummy.updateMatrix();
            this.instancedPlants.setMatrixAt(i, dummy.matrix);
        }
        this.instancedPlants.instanceMatrix.needsUpdate = true;
    },

    tick: function(t, dt) {
        this.time += dt * 0.001;
        const dummy = new THREE.Object3D();

        for (let i = 0; i < this.data.count; i++) {
            const transform = this.transforms[i];

            dummy.position.copy(transform.position);
            dummy.rotation.copy(transform.rotation);
            dummy.scale.copy(transform.scale);

            // Wind simulation
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
            this.instancedPlants.setMatrixAt(i, dummy.matrix);
        }
        this.instancedPlants.instanceMatrix.needsUpdate = true;
    },

    remove: function() {
        // Cleanup instanced plants
        if (this.instancedPlants) {
            this.instancedPlants.geometry.dispose();
            this.instancedPlants.material.dispose();
            this.el.removeObject3D('plants');
        }
    }
});