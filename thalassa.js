const entity = document.createElement('a-entity');
entity.setAttribute('the-sea', '');
document.querySelector('a-scene').appendChild(entity);

AFRAME.registerComponent('the-sea', {
    init: function() {

        const bud = document.createElement('a-box');
        bud.setAttribute('position', '0 -12 0');
        bud.setAttribute('scale','1000 2 1000');
        bud.setAttribute('color','#00108A');
        document.querySelector('a-scene').appendChild(bud);
        //console.log('building sea');

    },
    
    tick: function(time, delta) {
        //console.log('tn');
    }
});
