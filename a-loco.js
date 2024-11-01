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
        this.timeStamp=Date.now();
        this.moveZ=0;
        this.moveX=0;
        
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

        delta = delta * 0.001; // Convert to seconds.
        
        const position = this.el.object3D.position;
        //const rotation = document.querySelector('[camera]').object3D.rotation;
        const rotation = this.cam.rotation;
        
        // Camera controls testing, for VR (and mobile).
        // let moveZ=0;
        // let moveX=0;
        //if(AFRAME.utils.device.isMobile()){
            const pitch=this.cam.rotation.x;
            const roll=this.cam.rotation.z;
            //console.log(roll + ' ' + pitch);
            // if (pitch < -0.33 && pitch > -0.47){
            //     moveZ=1;
            // } else moveZ=0;

            // Let's try a toggle.
            const minZ=0.3;  // Default 0.2.
			const maxZ=0.5; // Default 0.4.
                if ((roll > minZ && roll < maxZ)){
                    console.log('rooling?');
            // Log time stamp. This will be for
            // toggling via head z rotations.
            // Have 2s elapsed?
            let cTime = Date.now();
            if (cTime-this.timeStamp > 2000){
                //toggleAttempt=false;
                //this.hark.components.sound.playSound();
                //this.engineOn=!this.engineOn;
                //this.data.engine=!this.data.engine;
                // Update to sort reticle colour.
                //this.update();
                // Toggle locomotion.
                this.timeStamp=Date.now();
                if(this.moveZ==1) this.moveZ=0;
                else this.moveZ=1;
                
            }
        //}
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
            
            this.moveX =    (this.keys.a || this.keys.ArrowLeft ? -1 : 0) + 
                            (this.keys.d || this.keys.ArrowRight ? 1 : 0);
            this.moveZ =    (this.keys.w || this.keys.ArrowUp ? 1 : 0) + 
                            (this.keys.s || this.keys.ArrowDown ? -1 : 0);
        }
        
        // Return fov to normal, i.e. not running.
        if (this.fov<80){this.fov=80;}
        else {document.querySelector("#cam").setAttribute("fov",`${this.fov-=0.5}`);}

        // Apply movement in camera direction.
        if (this.moveX !== 0 || this.moveZ !== 0) {
            const angle = rotation.y;
            let run_speed=1;
            
            // Light change test.
            document.querySelector("#blinky").setAttribute("intensity",'0.8');
            
            // Running!
            if (this.keys.ShiftLeft) { run_speed = 5;
                document.querySelector("#cam").setAttribute("fov",`${this.fov+=0.6}`);
                if (this.fov>120)this.fov=120;
                // Light change test.
                document.querySelector("#blinky").setAttribute("intensity",'0.1');
            } 
            const speed = 5 * run_speed;
            this.velocity.x = (-this.moveZ * Math.sin(angle) + this.moveX * Math.cos(angle)) * speed;
            this.velocity.z = (-this.moveZ * Math.cos(angle) - this.moveX * Math.sin(angle)) * speed;
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