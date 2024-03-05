import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

const element = document.querySelector('.antonin');
const scrolltoexplore = document.querySelector('.scroll-to-explore');

// Scene
const scene = new THREE.Scene()

//particles
const particlesCount = 20000
const positionRandom = new Float32Array(particlesCount * 3)
const positionSphere = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount * 3; i+=3) {
    positionRandom[i] =  Math.random() - 0.5
    positionRandom[i + 1] = Math.random() - 0.5
    positionRandom[i + 2] = Math.random() - 0.5
}

// demandez à chatGPT une fonction pour placer un point sur une sphère en 3D en javascript
// boucle for pour chaque particule, comme pour les pos random
// utilisez cette fonction pour placer les particules sur la sphere en x, y, z
// set Attribute pour les positions de la sphère avec les positionsSphere au lieu de positionRandom ligne 31

function getRandomPointOnSphere(radius) {
    var vector = new THREE.Vector3()
    var phi = Math.random() * 2 * Math.PI
    var theta = Math.random() * Math.PI

    vector.x = radius * Math.sin(theta) * Math.cos(phi)
    vector.y = radius * Math.sin(theta) * Math.sin(phi)
    vector.z = radius * Math.cos(theta)

    return vector
}

for (let i = 0; i < particlesCount * 3; i+=3) {
    const randomPoint = getRandomPointOnSphere(0.5)
    positionSphere[i] = randomPoint.x
    positionSphere[i + 1] = randomPoint.y
    positionSphere[i + 2] = randomPoint.z
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positionRandom, 3))

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.004,
    sizeAttenuation: true,
    // color: 0x8639ac,
    color: 0x1113DB,
    transparent: true,
    depthWrite: false,
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)

scene.add(particles)

const textureLoader = new THREE.TextureLoader()
const starTexture = textureLoader.load('/textures/particles/1.png')
particlesMaterial.map = starTexture
particlesMaterial.alphaMap = starTexture


// Animations
const particlesInfos = []
for (let i = 0; i < particlesCount; i++) {
    const particuleIndex = i * 3
    const particle = {
        randomPos: {
            x: positionRandom[particuleIndex],
            y: positionRandom[particuleIndex + 1],
            z: positionRandom[particuleIndex + 2]
        },
        currentPos: {
            x: positionRandom[particuleIndex],
            y: positionRandom[particuleIndex + 1],
            z: positionRandom[particuleIndex + 2]
        },
        spherePos: {
            x: positionSphere[particuleIndex],
            y: positionSphere[particuleIndex + 1],
            z: positionSphere[particuleIndex + 2]
        },
    }
    particlesInfos.push(particle)
}

// boucle for sur particulesInfos
// gsap.to on scroll pour chaque particule
// gsap.to(particle.currentPos) x: particlesInfos[i].spherePos.x, y: particlesInfos[i].spherePos.y, z: particlesInfos[i].spherePos.z

for (let i = 0; i < particlesCount; i++) {
    const particleIndex = i * 3
    gsap.to(particlesInfos[i].currentPos, {
        x: particlesInfos[i].spherePos.x,
        y: particlesInfos[i].spherePos.y,
        z: particlesInfos[i].spherePos.z,
        duration: 2,
        delay: Math.random(),
        ease: 'power3.out',
        onUpdate: () => {
            positionRandom[particleIndex] = particlesInfos[i].currentPos.x
            positionRandom[particleIndex + 1] = particlesInfos[i].currentPos.y
            positionRandom[particleIndex + 2] = particlesInfos[i].currentPos.z
            particlesGeometry.attributes.position.needsUpdate = true
        }
    })
}



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */

// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 1
scene.add(camera)

gsap.to(camera.position, {
    z: 0.5, 
    duration: 15,
    delay: 1,
    ease: 'power3.out'
})

gsap.to(element, {
    opacity: 0,
    duration: 2,
    delay: 5.8,
    ease: 'power3.out'
})

gsap.to(".scroll-to-explore", {
    opacity: 1,
    duration: 2,
    delay: 5.8,
    ease: 'power3.out',
    onComplete: () => {
        gsap.to(".scroll-to-explore", 
  {
    opacity: 0,
    duration: 2,
    scrollTrigger: {
      trigger: ".antonin",
      start: "10%", 
      end: "100%", 
      scrub: 1, 
    }
  }
);
    }
})

gsap.registerPlugin(ScrollTrigger);

// Controls

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0xffffff)


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime() 

    particles.rotation.y = elapsedTime * 0.1

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()