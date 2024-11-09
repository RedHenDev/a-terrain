const entity = document.createElement('a-entity');
entity.setAttribute('the-sea', '');
document.querySelector('a-scene').appendChild(entity);

AFRAME.registerComponent('the-sea', {
    init: function() {

        const bud = document.createElement('a-box');
        bud.setAttribute('position', '0 -12 0');
        bud.setAttribute('scale','1000 0.3 1000');
        bud.setAttribute('color','#009F9F');
        bud.setAttribute('transparent', 'true');
        bud.setAttribute('opacity', '0.5');
        document.querySelector('a-scene').appendChild(bud);
        //console.log('building sea');

    },
    
    tick: function(time, delta) {
        //console.log('tn');
    }
});
