const entity = document.createElement('a-entity');
entity.setAttribute('asteroid-nursery', '');
document.querySelector('a-scene').appendChild(entity);

AFRAME.registerComponent('asteroid-nursery', {
    init: function() {
        // Create asteroid mesh
        const geometry = createAsteroidGeometry(2, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.9,
            metalness: 0.1,
            wireframe: false // Set to true to debug triangles
        });
        const asteroid = new THREE.Mesh(geometry, material);
        
        asteroid.position.set(0, 10, -20);
        this.el.object3D.add(asteroid);
        
        this.asteroid = asteroid;
        this.rotationSpeed = new THREE.Vector3(
            Math.random() * 0.5,
            Math.random() * 0.5,
            Math.random() * 0.5
        );
    },
    
    tick: function(time, delta) {
        this.asteroid.rotation.x += this.rotationSpeed.x * (delta/1000);
        this.asteroid.rotation.y += this.rotationSpeed.y * (delta/1000);
        this.asteroid.rotation.z += this.rotationSpeed.z * (delta/1000);
    }
});

function createAsteroidGeometry(radius = 1, craterCount = 5) {
    // Create base geometry with higher detail
    const baseGeometry = new THREE.IcosahedronGeometry(radius, 2);
    
    // Create new geometry
    const geometry = new THREE.BufferGeometry();
    
    // Copy position attribute
    const positions = new Float32Array(baseGeometry.attributes.position.array);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Calculate indices for triangles
    const vertexCount = positions.length / 3;
    const indices = [];
    
    // Create triangles - every three consecutive vertices form a triangle
    for (let i = 0; i < vertexCount; i += 3) {
        indices.push(i, i + 1, i + 2);
    }
    
    // Set the index buffer
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));
    
    // Basic noise distortion
    for (let i = 0; i < positions.length; i += 3) {
        const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
        const noise = 0.1 * radius * (Math.random() - 0.5);
        const distance = vertex.length();
        const factor = (1 + noise) / distance;
        
        positions[i] = vertex.x * factor;
        positions[i + 1] = vertex.y * factor;
        positions[i + 2] = vertex.z * factor;
    }

    // Add craters
    for (let c = 0; c < craterCount; c++) {
        const craterPos = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        ).normalize();
        
        const craterSize = radius * (0.1 + Math.random() * 0.1);
        
        for (let i = 0; i < positions.length; i += 3) {
            const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
            const distance = vertex.clone().normalize()
                .sub(craterPos)
                .length() * radius;
                
            if (distance < craterSize) {
                const depth = Math.cos(distance / craterSize * Math.PI) * 0.1;
                vertex.multiplyScalar(1 - depth);
                positions[i] = vertex.x;
                positions[i + 1] = vertex.y;
                positions[i + 2] = vertex.z;
            }
        }
    }
    
    // Ensure normals are computed correctly
    geometry.computeVertexNormals();
    return geometry;
}