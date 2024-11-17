const hudParent = document.createElement('a-entity');
hudParent.setAttribute('generate-hud', '');
document.querySelector('a-scene').appendChild(hudParent);

AFRAME.registerComponent('generate-hud', {
  init: function() {
    // Create main HUD entity
    const hudEntity = document.createElement('a-entity');
    hudEntity.setAttribute('id', 'hud');
    hudEntity.setAttribute('follow-camera', '');

    // Create background panel (plane)
    const panel = document.createElement('a-plane');
    panel.setAttribute('position', '0 4 -2');
    panel.setAttribute('rotation', '70 0 0');
    panel.setAttribute('width', '4');
    panel.setAttribute('height', '2');
    panel.setAttribute('material', {
      color: '#088',
      opacity: 0.8,
      depthTest: true
    });

    // Create title text
    const titleText = document.createElement('a-text');
    titleText.setAttribute('id', 'hud-text');
    titleText.setAttribute('value', 'settings');
    titleText.setAttribute('position', '0 0.75 0.01');
    titleText.setAttribute('scale', '1 1 1');
    titleText.setAttribute('align', 'center');
    titleText.setAttribute('color', '#0FF');
    panel.appendChild(titleText);

    // Function to create buttons
    const createButton = (id, position, textValue, handler) => {
      const button = document.createElement('a-box');
      button.setAttribute('id', id);
      button.setAttribute('position', position);
      button.setAttribute('scale', '0.5 0.5 0.005');
      button.setAttribute('toggle-button', {
        label: 'Speed Mode',
        initialState: false
      });

      const buttonText = document.createElement('a-text');
      buttonText.setAttribute('value', textValue);
      buttonText.setAttribute('position', '0 0 1');
      buttonText.setAttribute('scale', '1 1 1');
      buttonText.setAttribute('align', 'center');
      buttonText.setAttribute('color', '#fff');
      
      button.appendChild(buttonText);

      // Add event listener right after creating the button
      button.addEventListener('statechanged', handler);
      
      return button;
    };

    // Create the three buttons with their respective handlers
    const button1 = createButton('b1', '-1 0 0', 'speed \nmode', (event) => {
      console.log('Button state:', event.detail.state);
      const playerEl = document.querySelector('#player');
      const tmc = playerEl.components['terrain-movement'];
      tmc.running = event.detail.state;
    });

    const button2 = createButton('b2', '0 0 0', 'fly \nmode', (event) => {
      console.log('Button state:', event.detail.state);
      const playerEl = document.querySelector('#player');
      const tmc = playerEl.components['terrain-movement'];
      tmc.flying = event.detail.state;
    });

    const button3 = createButton('b3', '1 0 0', 'luna \nbounce', (event) => {
      console.log('Button state:', event.detail.state);
      const playerEl = document.querySelector('#player');
      const tmc = playerEl.components['terrain-movement'];
      tmc.lunaBounce = event.detail.state;
    });

    // Add buttons to panel
    panel.appendChild(button1);
    panel.appendChild(button2);
    panel.appendChild(button3);

    // Add panel to HUD
    hudEntity.appendChild(panel);

    // Add HUD to scene
    const sceneEl = document.querySelector('a-scene');
    sceneEl.appendChild(hudEntity);
  }
});

// Component to make an entity follow the camera
AFRAME.registerComponent('follow-camera', {
  tick: function () {
    const camera = document.querySelector('#player');
    if (!camera) return;
    
    // Get camera world position
    const worldPos = new THREE.Vector3();
    camera.object3D.getWorldPosition(worldPos);
    
    // Position HUD in front of camera
    const distance = -0.5; // Distance from camera
    const cameraDirection = new THREE.Vector3();
    camera.object3D.getWorldDirection(cameraDirection);
    
    this.el.object3D.position.copy(worldPos).add(cameraDirection.multiplyScalar(distance));
    
    // Make HUD face camera
    this.el.object3D.lookAt(worldPos);
  }
});

// Component to handle button states
AFRAME.registerComponent('toggle-button', {
  schema: {
    label: {type: 'string', default: 'Button'},
    initialState: {type: 'boolean', default: false}
  },
  
  init: function () {
    this.state = this.data.initialState;
    this.el.setAttribute('class', 'clickable');

    // For checking whether active (visible or not)
    this.hud = document.querySelector("#hud").object3D;
    
    // Set initial colors
    this.updateVisuals();
    
    // Add click handler
    this.el.addEventListener('click', () => {
      // Disable if not active (i.e. not visible)
      if (!this.hud.visible) return;
      this.state = !this.state;
      this.updateVisuals();
      // Emit event with new state
      this.el.emit('statechanged', { state: this.state });
    });
  },
  
  updateVisuals: function () {
    const activeColor = '#4CAF50';
    const inactiveColor = '#f44336';
    this.el.setAttribute('material', 'color', this.state ? activeColor : inactiveColor);
  }
});

/*
<!-- HUD Interface -->
        <a-entity id="hud" follow-camera>
            <!-- Background panel -->
             <!-- 0 2.6 -2 and 15, not 5 and 90. -->
            <a-plane position="0 4 -2" rotation="70 0 0"
                    width="4" height="2" 
                    material="color: #088; opacity: 0.8; depthTest: true">
                
                <!-- Button 1 -->
                <a-box id="b1" position="-1 0 0" 
                    scale="0.5 0.5 0.005"
                    toggle-button="label: Speed Mode; initialState: false">
                    <a-text value="speed \nmode" 
                            position="0 0 1" 
                            scale="1 1 1" 
                            align="center"
                            color="#fff"></a-text>
                </a-box>
                
                <!-- Button 2 -->
                <a-box id="b2" position="0 0 0" 
                    scale="0.5 0.5 0.005"
                    toggle-button="label: Speed Mode; initialState: false">
                    <a-text value="fly \nmode" 
                            position="0 0 1" 
                            scale="1 1 1" 
                            align="center"
                            color="#fff"></a-text>
                </a-box>
                
                <!-- Button 3 -->
                <a-box id="b3" position="1 0 0" 
                    scale="0.5 0.5 0.005"
                    toggle-button="label: Speed Mode; initialState: false">
                    <a-text value="luna \nbounce" 
                            position="0 0 1" 
                            scale="1 1 1" 
                            align="center"
                            color="#fff"></a-text>
                </a-box>
                
                <!-- Title -->
                <a-text id="hud-text" value="settings" 
                        position="0 0.75 0.01" 
                        scale="1 1 1" 
                        align="center" 
                        color="#0FF"></a-text>
            </a-plane>
        </a-entity>
*/