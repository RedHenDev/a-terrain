// For us with A-Frame.
async function autoGalleryGo() {
    const imageFiles = ['drawing_1.jpg'];
    const scene = document.querySelector('a-scene');
    const assets = document.createElement('a-assets');

    console.log('scrape complete...' + ' ' + imageFiles.length + ' files scarped.');
    
    imageFiles.forEach(file => {
        const img = document.createElement('img');
        img.id = file.split('.')[0];
        img.src = file;
        assets.appendChild(img);

        console.log('generating image object in scene...');

        // Optional: create planes for the images
        const plane = document.createElement('a-plane');
        plane.setAttribute('src', `#${img.id}`);
        plane.setAttribute('position', `${Math.random() * 100 - 50} 
                                        ${Math.random() * 200}
                                        ${Math.random() * 100 - 50}`);
        plane.setAttribute('rotation', `0 ${Math.random() * 359} 0`);
        plane.setAttribute('width', '200');
        plane.setAttribute('height', '200');
        plane.setAttribute('material', 'side: double');
        plane.setAttribute('crossorigin', 'local');
        scene.appendChild(plane);
    });

    scene.appendChild(assets);
}

// Run when scene is loaded.
document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.addEventListener('loaded', autoGalleryGo);
    }
});