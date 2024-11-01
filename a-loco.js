// Player movement component with terrain following.
AFRAME.registerComponent('terrain-movement', {
    schema: {
        height: {type: 'number', default: 2} // Height above ground.
    },

    init: function() {
        this.velocity = new THREE.Vector3();
        this.targetY = 0;
        
        this.fov=80;
        this.cam=document.querySelector("#cam").object3D;
        this.rig=document.querySelector("#player").object3D;
        
        // Setup key listeners for smoother movement
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            s: false,
            a: false,
            d: false,
            ShiftLeft: false
        };
        
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
        // Also listen for shift key...
        document.addEventListener('keydown', (e) => {
            if (e.code === 'ShiftLeft') {
                this.keys.ShiftLeft = true;
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.code === 'ShiftLeft') {
                this.keys.ShiftLeft = false;
            }
        });
    },

    tick: function(time, delta) {
        if (!delta) return;

        delta = delta * 0.001; // Convert to seconds
        
        const position = this.el.object3D.position;
        //const rotation = document.querySelector('[camera]').object3D.rotation;
        const rotation = this.cam.rotation;
        
        // Camera controls testing, for VR.
        let moveZ=0;
        let moveX=0;
        if(AFRAME.utils.device.isMobile()){
            const pitch=this.cam.rotation.x;
            //console.log(pitch)
            if (pitch < -0.33 && pitch > -0.47){
                moveZ=1;
            } else moveZ=0;
        }

        /*
        // First, determine direction
        // from camera.
        const theta=this.cam.rotation.y;
        // NB these two reversed.
        const pitch=this.cam.rotation.x;
        this.rig.position.y += pitch*1;
        */
        
        // Calculate movement direction.
        // Have negated sign of 1 here -- before, inverted movement bug.
        if(!AFRAME.utils.device.isMobile()){
            moveX = (this.keys.a || this.keys.ArrowLeft ? -1 : 0) + 
                    (this.keys.d || this.keys.ArrowRight ? 1 : 0);
            moveZ = (this.keys.w || this.keys.ArrowUp ? 1 : 0) + 
                    (this.keys.s || this.keys.ArrowDown ? -1 : 0);
        }
        
        // Apply movement in camera direction.
        if (moveX !== 0 || moveZ !== 0) {
            const angle = rotation.y;
            let run_speed=1;
            document.querySelector("#cam").setAttribute("fov",`${this.fov-=0.5}`);
            // Light change test.
            document.querySelector("#blinky").setAttribute("intensity",'0.8');
            if (this.fov<80)this.fov=80;
            if (this.keys.ShiftLeft) { run_speed = 5;
                document.querySelector("#cam").setAttribute("fov",`${this.fov+=0.6}`);
                if (this.fov>120)this.fov=120;
                // Light change test.
                document.querySelector("#blinky").setAttribute("intensity",'0.1');
            } 
            const speed = 5 * run_speed;
            this.velocity.x = (-moveZ * Math.sin(angle) + moveX * Math.cos(angle)) * speed;
            this.velocity.z = (-moveZ * Math.cos(angle) - moveX * Math.sin(angle)) * speed;
        } else {
            this.velocity.x *= 0.9;
            this.velocity.z *= 0.9;
        }
        
        // Update position.
        position.x += this.velocity.x * delta;
        position.z += this.velocity.z * delta;
        
        // Get terrain height at current position.
        const terrainY = getTerrainHeight(position.x, position.z);
        this.targetY = terrainY + this.data.height;
        
        // Smoothly interpolate to target height.
        position.y += (this.targetY - position.y) * 0.1;
    }
});