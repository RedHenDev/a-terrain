AFRAME.registerComponent('ai-locomotion', {
    schema: {
        speed: {type: 'number', default: 0.6},
        height: {type: 'number', default: 0.6},
        wiggle: {type: 'boolean', default: true},
        flee: {type: 'boolean', default: true},
        target: {type: 'string', default: '#player'},
        aidrive: {type: 'boolean', default: false},
        targetID: {type: 'string', default: '#player'},
        rSpeed: {type: 'number', default: 1},
        clampY: {type: 'boolean', default: true}

    },

    init: function() {
        this.rig = this.el.object3D;
        this.target = document.querySelector(this.data.target).object3D;

        // These below taken from LookAt. Have changed
        // this.target to this.targetID to avoid clash above.
        this.targetID = document.querySelector(this.data.targetID).object3D;
        this.object = this.el.object3D;
        this.origRotX = this.el.object3D.rotation.x;
        this.origRotZ = this.el.object3D.rotation.z;
    },

    turn: function() {
        this.rig.lookAt(this.target.position);
    },

    tick: function(time, delta) {
        
        if (!delta) return;
        delta = delta * 0.001; // Convert to seconds.
        
        // Experiment. Can we move the armadillo?
        const radCon = Math.PI / 180;
        
        const mx = this.rig.position.x;
        const mz = this.rig.position.z;
        const my = getTerrainHeight(mx,mz);
        this.rig.position.y = my+this.data.height;

        if (this.data.aidrive){
            this.turn();
            if (this.data.flee){
                this.rig.rotation.y+=180;
            }
        }

        this.rig.position.x += 
                Math.sin(this.rig.rotation.y)*this.data.speed * delta;
            this.rig.position.z += 
                Math.cos(this.rig.rotation.y)*this.data.speed * delta;

        /*
        if (this.data.flee){
            this.rig.position.x += 
                Math.sin(this.rig.rotation.y)*this.data.speed * delta;
            this.rig.position.z += 
                Math.cos(this.rig.rotation.y)*this.data.speed * delta;
        } else {
            this.rig.position.x += 
                Math.sin(this.rig.rotation.y)*this.data.speed * delta;
            this.rig.position.z += 
                Math.cos(this.rig.rotation.y)*this.data.speed * delta;
        }
        */

        if (!this.data.wiggle) return;
        // Wiggle?
        this.rig.rotation.z = Math.sin((Math.abs(this.rig.position.z) + 
                            Math.abs(this.rig.position.x)) *8) * 0.16;

    }
});