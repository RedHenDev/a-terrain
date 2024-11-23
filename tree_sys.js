AFRAME.registerComponent('forest-system', {
    schema: {
        count: { type: 'number', default: 200 },
        range: { type: 'number', default: 150 },
        minHeight: { type: 'number', default: 15 },
        maxHeight: { type: 'number', default: 25 },
        minRadius: { type: 'number', default: 0.4 },
        maxRadius: { type: 'number', default: 1.2 },
        canopySize: { type: 'number', default: 8 }
    },

    init: function() {
        this.transforms = [];
        const treeGeometry = this.createTreeGeometry();

        // Create materials for trunk and canopy
        const trunkMaterial = new THREE.MeshPhongMaterial({
            color: '#3b2507',
            vertexColors: true,
            flatShading: true
        });

        const canopyMaterial = new THREE.MeshPhongMaterial({
            color: '#1a4314',
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            flatShading: true
        });

        // Create instanced meshes for trunks and canopies
        this.instancedTrunks = new THREE.InstancedMesh(
            treeGeometry.trunkGeo,
            trunkMaterial,
            this.data.count
        );

        this.instancedCanopies = new THREE.InstancedMesh(
            treeGeometry.canopyGeo,
            canopyMaterial,
            this.data.count
        );

        this.el.setObject3D('trunks', this.instancedTrunks);
        this.el.setObject3D('canopies', this.instancedCanopies);

        this.populateForest();
    },

    createTreeGeometry: function() {
        // Create trunk geometry with detailed bark-like segments
        const createTrunkGeometry = () => {
            const geometry = new THREE.BufferGeometry();
            const positions = [];
            const normals = [];
            const colors = [];
            const segments = 12; // Number of sides for the trunk
            const heightSegments = 8; // Vertical segments for bark detail
            const baseRadius = 1; // Will be scaled by instance matrix
            const barkRoughness = 0.1; // How much the bark "juts out"

            for (let h = 0; h < heightSegments; h++) {
                const heightRatio = h / heightSegments;
                const nextHeightRatio = (h + 1) / heightSegments;
                const radius = baseRadius * (1 - heightRatio * 0.2); // Slight taper
                const nextRadius = baseRadius * (1 - nextHeightRatio * 0.2);

                for (let i = 0; i < segments; i++) {
                    const angle = (i / segments) * Math.PI * 2;
                    const nextAngle = ((i + 1) / segments) * Math.PI * 2;
                    
                    // Add random displacement for bark texture
                    const barkOffset = Math.sin(heightRatio * 20 + angle * 4) * barkRoughness;
                    const nextBarkOffset = Math.sin(heightRatio * 20 + nextAngle * 4) * barkRoughness;
                    const upperBarkOffset = Math.sin(nextHeightRatio * 20 + angle * 4) * barkRoughness;
                    
                    // Calculate vertices
                    const vertices = [
                        // Bottom vertices
                        [
                            (radius + barkOffset) * Math.cos(angle),
                            heightRatio * 10,
                            (radius + barkOffset) * Math.sin(angle)
                        ],
                        [
                            (radius + nextBarkOffset) * Math.cos(nextAngle),
                            heightRatio * 10,
                            (radius + nextBarkOffset) * Math.sin(nextAngle)
                        ],
                        // Top vertices
                        [
                            (nextRadius + upperBarkOffset) * Math.cos(angle),
                            nextHeightRatio * 10,
                            (nextRadius + upperBarkOffset) * Math.sin(angle)
                        ]
                    ];

                    // Add triangles
                    positions.push(...vertices[0], ...vertices[1], ...vertices[2]);
                    
                    // Calculate normal
                    const normal = calculateNormal(vertices[0], vertices[1], vertices[2]);
                    normals.push(...normal, ...normal, ...normal);

                    // Add colors with variation for bark texture
                    const colorVariation = Math.random() * 0.2;
                    const barkColor = [
                        0.23 + colorVariation,
                        0.15 + colorVariation,
                        0.08 + colorVariation
                    ];
                    colors.push(...barkColor, ...barkColor, ...barkColor);
                }
            }

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            return geometry;
        };

        // Create canopy geometry as a collection of overlapping shapes
        const createCanopyGeometry = () => {
            const geometry = new THREE.BufferGeometry();
            const positions = [];
            const normals = [];
            const colors = [];

            // Create multiple layers of canopy
            const layers = 5;
            const shapesPerLayer = 8;
            
            for (let layer = 0; layer < layers; layer++) {
                const heightRatio = layer / layers;
                const layerRadius = 4 * (1 - Math.pow(heightRatio - 0.5, 2));
                
                for (let shape = 0; shape < shapesPerLayer; shape++) {
                    const angle = (shape / shapesPerLayer) * Math.PI * 2;
                    const offsetX = Math.cos(angle) * layerRadius * 0.7;
                    const offsetZ = Math.sin(angle) * layerRadius * 0.7;
                    
                    // Create a roughly circular shape
                    const points = [];
                    const segments = 6;
                    for (let i = 0; i <= segments; i++) {
                        const segmentAngle = (i / segments) * Math.PI * 2;
                        const radius = 2 + Math.random() * 0.5;
                        points.push([
                            offsetX + Math.cos(segmentAngle) * radius,
                            8 + layer * 2 + Math.random(),
                            offsetZ + Math.sin(segmentAngle) * radius
                        ]);
                    }

                    // Create triangles fan from center
                    const centerPoint = [offsetX, 8 + layer * 2, offsetZ];
                    for (let i = 0; i < points.length - 1; i++) {
                        positions.push(
                            ...centerPoint,
                            ...points[i],
                            ...points[i + 1]
                        );

                        // Calculate and add normals
                        const normal = calculateNormal(centerPoint, points[i], points[i + 1]);
                        normals.push(...normal, ...normal, ...normal);

                        // Add colors with variation
                        const green = 0.3 + Math.random() * 0.2;
                        const color = [
                            0.1 + Math.random() * 0.1,
                            green,
                            0.1 + Math.random() * 0.1
                        ];
                        colors.push(...color, ...color, ...color);
                    }
                }
            }

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            return geometry;
        };

        // Helper function to calculate normal for a triangle
        const calculateNormal = (p1, p2, p3) => {
            const v1 = [
                p2[0] - p1[0],
                p2[1] - p1[1],
                p2[2] - p1[2]
            ];
            
            const v2 = [
                p3[0] - p1[0],
                p3[1] - p1[1],
                p3[2] - p1[2]
            ];
            
            const normal = [
                v1[1] * v2[2] - v1[2] * v2[1],
                v1[2] * v2[0] - v1[0] * v2[2],
                v1[0] * v2[1] - v1[1] * v2[0]
            ];
            
            const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
            return normal.map(n => n / length);
        };

        return {
            trunkGeo: createTrunkGeometry(),
            canopyGeo: createCanopyGeometry()
        };
    },

    populateForest: function() {
        const dummy = new THREE.Object3D();
        const chunkOffsetX = this.el.object3D.position.x;
        const chunkOffsetZ = this.el.object3D.position.z;

        for (let i = 0; i < this.data.count; i++) {
            const localX = (Math.random() - 0.5) * this.data.range;
            const localZ = (Math.random() - 0.5) * this.data.range;
            
            const worldX = localX + chunkOffsetX;
            const worldZ = localZ + chunkOffsetZ;
            
            let y;
            try {
                y = getTerrainHeight(worldX, worldZ);
            } catch (e) {
                y = 0;
            }

            // Create slightly different transforms for trunk and canopy
            const height = this.data.minHeight + Math.random() * (this.data.maxHeight - this.data.minHeight);
            const radius = this.data.minRadius + Math.random() * (this.data.maxRadius - this.data.minRadius);
            
            const baseTransform = {
                position: new THREE.Vector3(localX, y, localZ),
                rotation: new THREE.Euler(
                    (Math.random() - 0.5) * 0.2,
                    Math.random() * Math.PI * 2,
                    0
                ),
                scale: new THREE.Vector3(radius, height, radius)
            };

            // Set trunk instance
            dummy.position.copy(baseTransform.position);
            dummy.rotation.copy(baseTransform.rotation);
            dummy.scale.copy(baseTransform.scale);
            dummy.updateMatrix();
            this.instancedTrunks.setMatrixAt(i, dummy.matrix);

            // Set canopy instance with slight variation
            const canopyScale = this.data.canopySize * (0.8 + Math.random() * 0.4);
            dummy.scale.set(canopyScale, canopyScale, canopyScale);
            dummy.updateMatrix();
            this.instancedCanopies.setMatrixAt(i, dummy.matrix);
        }

        this.instancedTrunks.instanceMatrix.needsUpdate = true;
        this.instancedCanopies.instanceMatrix.needsUpdate = true;
    },

    remove: function() {
        if (this.instancedTrunks) {
            this.instancedTrunks.geometry.dispose();
            this.instancedTrunks.material.dispose();
            this.el.removeObject3D('trunks');
        }
        if (this.instancedCanopies) {
            this.instancedCanopies.geometry.dispose();
            this.instancedCanopies.material.dispose();
            this.el.removeObject3D('canopies');
        }
    }
});