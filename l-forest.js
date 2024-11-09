/*
<a-scene>
  <!-- Single detailed tree -->
  <a-entity l-system-tree="
    iterations: 4;
    angle: 25;
    initialLength: 2;
    initialWidth: 0.15;
    lengthReduction: 0.7;
    widthReduction: 0.6;
    randomness: 0.1"
  ></a-entity>

  <!-- Or generate a varied forest -->
  <a-entity forest-generator="
    count: 20;
    spread: 30;
    randomRotation: true"
  ></a-entity>
</a-scene>


*/


// Modified tree pool system to handle deep cloning
AFRAME.registerSystem('tree-pool', {
    init: function() {
      this.templates = {};
      this.pool = {};
    },
  
    addTreeTemplate: function(template) {
      const id = 'tree-' + Object.keys(this.templates).length;
      this.templates[id] = template;
      this.pool[id] = [];
      return id;
    },
  
    createTree: function(templateId, position) {
      let tree;
      if (this.pool[templateId] && this.pool[templateId].length > 0) {
        tree = this.pool[templateId].pop();
        tree.setAttribute('position', position);
        tree.setAttribute('visible', true);
      } else {
        // Deep clone the template including all children
        const template = this.templates[templateId];
        tree = template.cloneNode(false); // Clone the entity without children
        
        // Manually clone all child elements to ensure full tree structure
        const children = template.children;
        for (let i = 0; i < children.length; i++) {
          const childClone = children[i].cloneNode(true);
          tree.appendChild(childClone);
        }
        
        tree.setAttribute('position', position);
      }
      return tree;
    },
  
    returnToPool: function(templateId, tree) {
      if (this.pool[templateId]) {
        tree.setAttribute('visible', false);
        this.pool[templateId].push(tree);
      }
    }
  });
  
  // Rest of the component code remains the same as the previous version
  // ... (L-system tree component code) ...
  AFRAME.registerComponent('l-system-tree', {
    schema: {
      iterations: { type: 'number', default: 4 },
      angle: { type: 'number', default: 25 },
      lengthReduction: { type: 'number', default: 0.7 },
      initialLength: { type: 'number', default: 2 },
      initialWidth: { type: 'number', default: 0.15 },
      widthReduction: { type: 'number', default: 0.6 },
      randomness: { type: 'number', default: 0.1 },
      color: { type: 'color', default: '#3A2A1A'}
    },
  
    init: function() {
      // Enhanced rule set for 3D branching
      // & and ^ control pitch (up/down)
      // + and - control yaw (left/right)
      // < and > control roll (twist)
      this.rules = {
        'F': 'FF[&>F][^<F][->F][+<F]'  // Create branches in different 3D directions
      };
      
      if (this.el.sceneEl.hasLoaded) {
        this.generateTree();
      } else {
        this.el.sceneEl.addEventListener('loaded', this.generateTree.bind(this));
      }
    },
  
    generateLSystem: function(axiom, iterations) {
      let result = axiom;
      for (let i = 0; i < iterations; i++) {
        let newResult = '';
        for (let char of result) {
          newResult += this.rules[char] || char;
        }
        result = newResult;
      }
      return result;
    },
  
    random: function(min, max) {
      return Math.random() * (max - min) + min;
    },
  
    generateTree: function() {
      const system = this.generateLSystem('F', this.data.iterations);
      const branchStack = [];
      
      // Create matrices for tracking position and rotation
      const matrix = new THREE.Matrix4();
      matrix.identity();
      
      // Start with trunk pointing up
      matrix.multiply(new THREE.Matrix4().makeTranslation(0, 0, 0));
      
      let currentLength = this.data.initialLength;
      let currentWidth = this.data.initialWidth;
  
      const treeGroup = document.createElement('a-entity');
      this.el.appendChild(treeGroup);
  
      for (let char of system) {
        switch(char) {
          case 'F':
            // Create branch matrix
            const branchMatrix = matrix.clone();
            const randomScale = this.random(1 - this.data.randomness, 1 + this.data.randomness);
            
            // Calculate end point
            const startVec = new THREE.Vector3();
            const endVec = new THREE.Vector3(0, currentLength * randomScale, 0);
            startVec.setFromMatrixPosition(branchMatrix);
            endVec.applyMatrix4(branchMatrix);
            
            // Create branch
            const branch = document.createElement('a-cylinder');
            branch.setAttribute('radius', currentWidth);
            branch.setAttribute('height', currentLength * randomScale);
            
            // Position at midpoint
            const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
            branch.setAttribute('position', `${midPoint.x} ${midPoint.y} ${midPoint.z}`);
            
            // Extract rotation from matrix
            const rotationEuler = new THREE.Euler().setFromRotationMatrix(branchMatrix);
            branch.setAttribute('rotation', 
              `${THREE.MathUtils.radToDeg(rotationEuler.x)} 
               ${THREE.MathUtils.radToDeg(rotationEuler.y)} 
               ${THREE.MathUtils.radToDeg(rotationEuler.z)}`
            );
            
            branch.setAttribute('color', this.data.color);
            treeGroup.appendChild(branch);
            
            // Move to end of branch for next segment
            matrix.multiply(new THREE.Matrix4().makeTranslation(0, currentLength * randomScale, 0));
            break;
  
          case '+': // Yaw right
            matrix.multiply(new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(-this.data.angle)));
            break;
            
          case '-': // Yaw left
            matrix.multiply(new THREE.Matrix4().makeRotationZ(THREE.MathUtils.degToRad(this.data.angle)));
            break;
            
          case '&': // Pitch down
            matrix.multiply(new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(this.data.angle)));
            break;
            
          case '^': // Pitch up
            matrix.multiply(new THREE.Matrix4().makeRotationX(THREE.MathUtils.degToRad(-this.data.angle)));
            break;
            
          case '>': // Roll clockwise
            matrix.multiply(new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(this.data.angle)));
            break;
            
          case '<': // Roll counter-clockwise
            matrix.multiply(new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(-this.data.angle)));
            break;
  
          case '[': // Save state
            branchStack.push({
              matrix: matrix.clone(),
              length: currentLength,
              width: currentWidth
            });
            currentLength *= this.data.lengthReduction;
            currentWidth *= this.data.widthReduction;
            break;
  
          case ']': // Restore state
            const stored = branchStack.pop();
            matrix.copy(stored.matrix);
            currentLength = stored.length;
            currentWidth = stored.width;
            break;
        }
      }
  
      // Store the complete tree in the pool
      const templateId = this.el.sceneEl.systems['tree-pool'].addTreeTemplate(treeGroup.cloneNode(true));
      this.templateId = templateId;
    }
  });
  
  // Modified forest generator to ensure proper template usage
  AFRAME.registerComponent('forest-generator', {
    schema: {
      count: { type: 'number', default: 10 },
      spread: { type: 'number', default: 20 },
      randomRotation: { type: 'boolean', default: true },
      waitForTemplate: { type: 'number', default: 500 } // ms to wait for template
    },
  
    init: function() {
      if (this.el.sceneEl.hasLoaded) {
        this.waitAndGenerate();
      } else {
        this.el.sceneEl.addEventListener('loaded', () => this.waitAndGenerate());
      }
    },
  
    waitAndGenerate: function() {
      // Wait a brief moment for the template tree to be generated and added to pool
      setTimeout(() => {
        this.generateForest();
      }, this.data.waitForTemplate);
    },
  
    generateForest: function() {
      const treeSystem = this.el.sceneEl.systems['tree-pool'];
      const templateIds = Object.keys(treeSystem.templates);
      
      if (templateIds.length === 0) {
        console.warn('No tree templates available for forest generation');
        return;
      }
      
      const templateId = templateIds[0];
      
      for (let i = 0; i < this.data.count; i++) {
        const x = (Math.random() - 0.5) * this.data.spread;
        const z = (Math.random() - 0.5) * this.data.spread;
        
        const tree = treeSystem.createTree(templateId, `${x} 0 ${z}`);
        
        if (this.data.randomRotation) {
          const randomRotation = Math.random() * 360;
          tree.setAttribute('rotation', `0 ${randomRotation} 0`);
        }
        
        this.el.appendChild(tree);
      }
    }
  });


  /*
    // Previous version...


// Tree pool system remains the same
AFRAME.registerSystem('tree-pool', {
    init: function() {
      this.templates = {};
      this.pool = {};
    },
  
    addTreeTemplate: function(template) {
      const id = 'tree-' + Object.keys(this.templates).length;
      this.templates[id] = template;
      this.pool[id] = [];
      return id;
    },
  
    createTree: function(templateId, position) {
      let tree;
      if (this.pool[templateId] && this.pool[templateId].length > 0) {
        tree = this.pool[templateId].pop();
        tree.setAttribute('position', position);
        tree.setAttribute('visible', true);
      } else {
        tree = this.templates[templateId].cloneNode(true);
        tree.setAttribute('position', position);
      }
      return tree;
    },
  
    returnToPool: function(templateId, tree) {
      if (this.pool[templateId]) {
        tree.setAttribute('visible', false);
        this.pool[templateId].push(tree);
      }
    }
  });

 


  
  
  
  
  AFRAME.registerComponent('forest-generator', {
    schema: {
      count: { type: 'number', default: 10 },
      spread: { type: 'number', default: 20 },
      randomRotation: { type: 'boolean', default: true }
    },
  
    init: function() {
      if (this.el.sceneEl.hasLoaded) {
        this.generateForest();
      } else {
        this.el.sceneEl.addEventListener('loaded', this.generateForest.bind(this));
      }
    },
  
    generateForest: function() {
      const treeSystem = this.el.sceneEl.systems['tree-pool'];
      
      for (let i = 0; i < this.data.count; i++) {
        const x = (Math.random() - 0.5) * this.data.spread;
        const z = (Math.random() - 0.5) * this.data.spread;
        
        const templateId = Object.keys(treeSystem.templates)[0];
        if (templateId) {
          const tree = treeSystem.createTree(templateId, `${x} 0 ${z}`);
          
          // Add random rotation around Y axis for variety
          if (this.data.randomRotation) {
            const randomRotation = Math.random() * 360;
            tree.setAttribute('rotation', `0 ${randomRotation} 0`);
          }
          
          this.el.appendChild(tree);
        }
      }
    }
  });

  */