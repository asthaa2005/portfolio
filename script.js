// ---------- Mobile nav toggle ----------
  const navToggle = document.getElementById('navToggle');
  const navList = document.getElementById('navList');
  navToggle.addEventListener('click', () => navList.classList.toggle('open'));
  navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navList.classList.remove('open')));

  // ---------- Scroll reveal ----------
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach(el => io.observe(el));

  // ---------- Three.js hero scene ----------
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('hero-canvas');
  const heroSection = document.getElementById('home');

  let scene, camera, renderer, coreMesh, nodesGroup, mouseX = 0, mouseY = 0;

  function initThree(){
    scene = new THREE.Scene();

    const width = heroSection.clientWidth;
    const height = heroSection.clientHeight;

    camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 100);
    camera.position.set(0, 0, 7);

    renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const group = new THREE.Group();
    group.position.set(2.1, 0, 0);
    scene.add(group);

    // Core wireframe icosahedron — "the build"
    const coreGeo = new THREE.IcosahedronGeometry(1.7, 1);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xff3d6e, wireframe:true, transparent:true, opacity:0.75 });
    coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // inner faint solid core for depth
    const innerGeo = new THREE.IcosahedronGeometry(1.2, 0);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x241a2c, transparent:true, opacity:0.5 });
    group.add(new THREE.Mesh(innerGeo, innerMat));

    // Orbiting nodes — "the ideas / skills"
    nodesGroup = new THREE.Group();
    group.add(nodesGroup);
    const nodeGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xf0b429 });
    const nodeCount = 16;
    for(let i=0;i<nodeCount;i++){
      const node = new THREE.Mesh(nodeGeo, nodeMat.clone());
      const radius = 2.5 + Math.random()*0.9;
      const theta = Math.random()*Math.PI*2;
      const phi = Math.acos((Math.random()*2)-1);
      node.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );
      node.userData.speed = 0.002 + Math.random()*0.004;
      node.userData.axis = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
      nodesGroup.add(node);
    }

    // faint connecting lines from a few nodes to core
    const lineMat = new THREE.LineBasicMaterial({ color: 0xff3d6e, transparent:true, opacity:0.12 });
    for(let i=0;i<nodesGroup.children.length;i+=3){
      const n = nodesGroup.children[i];
      const points = [new THREE.Vector3(0,0,0), n.position.clone()];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      nodesGroup.add(new THREE.Line(geo, lineMat));
    }

    window.__heroGroup = group;

    window.addEventListener('resize', onResize);
    heroSection.addEventListener('mousemove', onMouseMove);

    animate();
  }

  function onResize(){
    const width = heroSection.clientWidth;
    const height = heroSection.clientHeight;
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function onMouseMove(e){
    const rect = heroSection.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  function animate(){
    requestAnimationFrame(animate);
    if(!prefersReducedMotion){
      coreMesh.rotation.x += 0.0022;
      coreMesh.rotation.y += 0.0032;

      nodesGroup.children.forEach(child => {
        if(child.userData.axis){
          child.position.applyAxisAngle(child.userData.axis, child.userData.speed);
        }
      });

      const group = window.__heroGroup;
      group.rotation.y += ( (mouseX*0.35) - group.rotation.y ) * 0.04;
      group.rotation.x += ( (-mouseY*0.25) - group.rotation.x ) * 0.04;
    }
    renderer.render(scene, camera);
  }

  if(typeof THREE !== 'undefined'){
    initThree();
  }