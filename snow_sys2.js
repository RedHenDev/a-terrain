AFRAME.registerComponent('snow-system', {
    schema: {
      count: { type: 'number', default: 1000 },
      range: { type: 'number', default: 25 },
      height: { type: 'number', default: 30 }
    },
  
    init: function() {
      const flakeGeometry = new THREE.PlaneGeometry(2, 2);
      const instancedGeometry = new THREE.InstancedBufferGeometry().copy(flakeGeometry);
      const instanceCount = this.data.count;
      
      const positions = new Float32Array(instanceCount * 3);
      const rotations = new Float32Array(instanceCount);
      const rotationSpeeds = new Float32Array(instanceCount);
      const fallSpeeds = new Float32Array(instanceCount);
      
      for (let i = 0; i < instanceCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * this.data.range;
        positions[i * 3 + 1] = Math.random() * this.data.height;
        positions[i * 3 + 2] = (Math.random() - 0.5) * this.data.range;
        rotations[i] = Math.random() * Math.PI * 2;
        rotationSpeeds[i] = (Math.random() - 0.5) * 2;
        fallSpeeds[i] = Math.random() * 1 + 0.5;
      }
      
      instancedGeometry.setAttribute(
        'instancePosition',
        new THREE.InstancedBufferAttribute(positions, 3)
      );
      instancedGeometry.setAttribute(
        'instanceRotation',
        new THREE.InstancedBufferAttribute(rotations, 1)
      );
      instancedGeometry.setAttribute(
        'instanceRotationSpeed',
        new THREE.InstancedBufferAttribute(rotationSpeeds, 1)
      );
      instancedGeometry.setAttribute(
        'instanceFallSpeed',
        new THREE.InstancedBufferAttribute(fallSpeeds, 1)
      );
  
      // Create magical-looking material with corrected shaders
      const material = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true, 
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,  
        uniforms: {
          time: { value: 0 },
          snowflakeTexture: { 
            value: new THREE.TextureLoader().load(
              'flake_1.png')
          }
        },
        vertexShader: `
          attribute vec3 instancePosition;
          attribute float instanceRotation;
          attribute float instanceRotationSpeed;
          attribute float instanceFallSpeed;
          
          uniform float time;
          
          varying vec2 vUv;
          varying float vSparkle;
          
          void main() {
            vUv = uv;
            
            // Calculate current rotation
            float rotation = instanceRotation + instanceRotationSpeed * time;
            
            // Rotate position
            vec2 rotated = vec2(
              position.x * cos(rotation) - position.y * sin(rotation),
              position.x * sin(rotation) + position.y * cos(rotation)
            );
            
            // Calculate final position
            vec3 finalPosition = instancePosition;
            finalPosition.y -= mod(instanceFallSpeed * time, ${this.data.height}.0);
            
            // Add subtle wave motion
            finalPosition.x += sin(time + instancePosition.y) * 0.5;
            
            vec4 mvPosition = modelViewMatrix * vec4(
              finalPosition + vec3(rotated, 0.0),
              1.0
            );
            
            gl_Position = projectionMatrix * mvPosition;
            
            // Calculate sparkle based on position and time
            vSparkle = sin(time * 2.0 + instancePosition.x + instancePosition.y) * 0.5 + 0.5;
          }
        `,
        fragmentShader: `
          uniform sampler2D snowflakeTexture;
          uniform float time;
          
          varying vec2 vUv;
          varying float vSparkle;
          
          void main() {
            vec4 texColor = texture2D(snowflakeTexture, vUv);
            
            // Create magical glow effect
            vec3 color = mix(
              vec3(0.8, 0.9, 1.0),  // Light blue base
              vec3(1.0),            // White sparkle
              vSparkle * 0.5
            );
            
            // Final color with sparkle and transparency
            gl_FragColor = vec4(color * texColor.rgb, texColor.a * 0.8);
          }
        `
      });
  
      this.snow = new THREE.Mesh(instancedGeometry, material);
      this.el.setObject3D('snow', this.snow);
    },
  
    tick: function(time, deltaTime) {



      if (this.snow && this.snow.material) {
        console.log('Snow system ticking:', time * 0.001); 
  
        this.snow.material.uniforms.time.value = time * 0.001;
      }
    },
  
    remove: function() {
      this.el.removeObject3D('snow');
    }
  });