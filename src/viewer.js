import * as T from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { loadAssets } from './assets.js'
import { rooms } from './layout.js'
import { buildModel } from './model.js'

export async function createViewer(host, markers, onRoom) {
  const scene = new T.Scene()
  scene.background = new T.Color('#242f3a')
  const renderer = new T.WebGLRenderer({ antialias: true })
  const canvas = renderer.domElement
  try {
    const assets = await loadAssets()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.autoUpdate = false
    renderer.shadowMap.type = T.PCFShadowMap
    renderer.toneMapping = T.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1

    const studio = new RoomEnvironment()
    const reflections = new T.PMREMGenerator(renderer)
    scene.environment = reflections.fromScene(studio, .06).texture
    scene.environmentIntensity = .65
    studio.dispose()
    reflections.dispose()

    const camera = new T.OrthographicCamera(-1, 1, 1, -1, .1, 180)
    const controls = new OrbitControls(camera, canvas)
    controls.minZoom = .64
    controls.maxZoom = 4
    controls.minPolarAngle = .13
    controls.maxPolarAngle = Math.PI / 2 - .09
    controls.enablePan = true
    const { cutaway, exterior, highlights, pickables } = buildModel(scene, assets)

    const fill = new T.HemisphereLight('#f1f6fb', '#919fa9', 1.03)
    const sunlight = new T.DirectionalLight('#fff5e9', 2.1)
    sunlight.position.set(-11, 32, 15)
    sunlight.target.position.set(11.5, 0, 7)
    sunlight.castShadow = true
    sunlight.shadow.mapSize.set(2048, 2048)
    Object.assign(sunlight.shadow.camera, { left: -23, right: 23, top: 23, bottom: -23, near: 1, far: 85 })
    sunlight.shadow.normalBias = .035
    sunlight.shadow.bias = -.00018
    const table = new T.Mesh(new T.PlaneGeometry(220, 220), new T.MeshStandardMaterial({ color: '#283642', roughness: 1 }))
    table.rotation.x = -Math.PI / 2
    table.position.y = -.642
    table.receiveShadow = true
    scene.add(fill, sunlight, sunlight.target, table)

    const labels = rooms.map((room) => {
      const [x, z, w, d] = room.rect
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'marker'
      button.dataset.room = room.id
      button.setAttribute('aria-label', room.id + ' ' + room.name)
      button.setAttribute('aria-pressed', 'false')
      button.title = room.name
      const number = document.createElement('span')
      number.textContent = room.id
      button.append(number)
      button.addEventListener('click', () => onRoom(room.id))
      markers.append(button)
      const anchor = new T.Vector3(x + w / 2, room.kind === 'parking' ? .45 : 1.32, z + d / 2)
      if (room.zone === 'clinical') anchor.set(x + w * .64, .35, z + d * .78)
      if (room.kind === 'reception') anchor.set(x + 1.2, .35, z + 3.4)
      if (room.kind === 'lounge') anchor.set(x + 3.57, .35, z + 3.55)
      return { button, anchor }
    })

    let mode = 'model'
    let active = false
    let selected = null
    let frame = 0
    let width = 0
    let height = 0
    const projected = new T.Vector3()

    function render() {
      frame = 0
      if (!active || !width || !height) return
      renderer.render(scene, camera)
      if (mode === 'facade') return
      const occupied = []
      const ordered = selected ? [...labels].sort((a, b) => Number(b.button.dataset.room === selected) - Number(a.button.dataset.room === selected)) : labels
      for (const { button, anchor } of ordered) {
        projected.copy(anchor).project(camera)
        const x = (projected.x + 1) * width / 2
        const y = (1 - projected.y) * height / 2
        const clear = occupied.every(([px, py]) => Math.hypot(x - px, y - py) >= (width < 600 ? 26 : 23))
        button.hidden = !clear || x < 16 || x > width - 16 || y < 16 || y > height - 16
        if (button.hidden) continue
        occupied.push([x, y])
        button.style.left = x + 'px'
        button.style.top = y + 'px'
      }
    }

    function requestRender() {
      if (active && !frame) frame = requestAnimationFrame(render)
    }

    function resize() {
      if (!active) return
      width = host.clientWidth
      height = host.clientHeight
      if (!width || !height) return
      const aspect = width / height
      const halfHeight = Math.max(mode === 'facade' ? 11.8 : 13.8, 17.8 / aspect)
      Object.assign(camera, { left: -halfHeight * aspect, right: halfHeight * aspect, top: halfHeight, bottom: -halfHeight })
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      requestRender()
    }

    function reset() {
      controls.target.set(11.5, 0, 8.6)
      camera.zoom = 1
      if (mode === 'facade') camera.position.set(26, 16, 43)
      else camera.position.set(29, 32, 34)
      camera.updateProjectionMatrix()
      controls.update()
      requestRender()
    }

    function zoom(factor) {
      camera.zoom = T.MathUtils.clamp(camera.zoom * factor, controls.minZoom, controls.maxZoom)
      camera.updateProjectionMatrix()
      requestRender()
    }

    function focus(room) {
      const [x, z, w, d] = room.rect
      const target = new T.Vector3(x + w / 2, 0, z + d / 2)
      camera.position.add(target.clone().sub(controls.target))
      controls.target.copy(target)
      camera.zoom = room.kind === 'parking' ? 1.2 : 2.55
      camera.updateProjectionMatrix()
      controls.update()
      requestRender()
    }

    controls.addEventListener('change', requestRender)
    canvas.tabIndex = 0
    canvas.setAttribute('aria-label', 'Maket 3D. Gunakan tombol panah untuk memutar kamera, + dan − untuk memperbesar atau memperkecil.')
    canvas.addEventListener('keydown', (event) => {
      if (event.key === '+' || event.key === '=') zoom(1.2)
      else if (event.key === '-') zoom(1 / 1.2)
      else if (event.key.startsWith('Arrow')) {
        const offset = camera.position.clone().sub(controls.target)
        const spherical = new T.Spherical().setFromVector3(offset)
        const azimuth = { ArrowLeft: -.14, ArrowRight: .14 }[event.key] ?? 0
        const elevation = { ArrowUp: -.12, ArrowDown: .12 }[event.key] ?? 0
        spherical.theta += azimuth
        spherical.phi = T.MathUtils.clamp(spherical.phi + elevation, controls.minPolarAngle, controls.maxPolarAngle)
        camera.position.setFromSpherical(spherical).add(controls.target)
        controls.update()
      } else return
      event.preventDefault()
    })

    let pointerStart
    const ray = new T.Raycaster()
    canvas.addEventListener('pointerdown', (event) => {
      if (event.isPrimary && event.button === 0) pointerStart = [event.clientX, event.clientY]
    })
    canvas.addEventListener('pointercancel', () => { pointerStart = null })
    canvas.addEventListener('pointerup', (event) => {
      if (!event.isPrimary || !pointerStart) return
      const [x, y] = pointerStart
      pointerStart = null
      if (mode === 'facade' || Math.hypot(x - event.clientX, y - event.clientY) > 6) return
      const bounds = canvas.getBoundingClientRect()
      ray.setFromCamera(new T.Vector2((x - bounds.left) / width * 2 - 1, 1 - (y - bounds.top) / height * 2), camera)
      const hit = ray.intersectObjects(pickables, false)[0]
      if (hit) onRoom(hit.object.userData.roomId)
    })
    host.append(canvas)
    new ResizeObserver(resize).observe(host)

    return {
      show(view) {
        active = view !== 'plan'
        if (!active) return
        mode = view
        cutaway.visible = mode === 'model'
        exterior.visible = mode === 'facade'
        renderer.shadowMap.needsUpdate = true
        resize()
        reset()
      },
      select(id) {
        if (selected) highlights.get(selected).visible = false
        selected = id
        highlights.get(id).visible = true
        requestRender()
      },
      zoom, reset, focus,
    }
  } catch (error) {
    renderer.dispose()
    throw error
  }
}
