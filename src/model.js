import * as T from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { building, corridor, parking, rooms, site, walls, zones } from './layout.js'

const palette = {
  ivory: '#f3eee5', wall: '#e6dfd4', oak: '#b4895e', dark: '#363636',
  clay: '#665044', sage: '#768c72', mustard: '#bc9b51', mint: '#a2b6a3',
  plum: '#a98e91', steel: '#92979b', glass: '#748b94', stone: '#a6a09a',
  asphalt: '#565b5e', grass: '#737d62', screen: '#23353e', ceramic: '#ebe8e1',
  planter: '#71645a', bark: '#675345', leaf: '#4d6544',
}
const materials = new Map()
const cube = new T.BoxGeometry()
const rounded = new RoundedBoxGeometry(1, 1, 1, 3, .06)
const cylinder = new T.CylinderGeometry(.5, .5, 1, 16)
const sphere = new T.SphereGeometry(.5, 14, 10)
const grout = new T.LineBasicMaterial({ color: '#716257', transparent: true, opacity: .17, depthWrite: false })

function mat(color) {
  const value = palette[color] ?? color
  if (!materials.has(value)) materials.set(value, new T.MeshStandardMaterial({ color: value, roughness: .83 }))
  return materials.get(value)
}

function part(parent, geometry, color, x, y, z, w, h, d) {
  const mesh = new T.Mesh(geometry, mat(color))
  mesh.position.set(x, y, z)
  mesh.scale.set(w, h, d)
  mesh.castShadow = true
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

const box = (p, c, x, y, z, w, h, d) => part(p, cube, c, x, y, z, w, h, d)
const soft = (p, c, x, y, z, w, h, d) => part(p, rounded, c, x, y, z, w, h, d)
const round = (p, c, x, y, z, w, h, d = w) => part(p, cylinder, c, x, y, z, w, h, d)

function group(parent, x, z, angle = 0) {
  const g = new T.Group()
  g.position.set(x, 0, z)
  g.rotation.y = angle
  parent.add(g)
  return g
}

function sign(p, title, sub, x, y, z, width, height, background = 'clay') {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = Math.round(768 * height / width)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = palette[background]
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#fff4df'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = Math.round(canvas.height * (sub ? .46 : .63)) + 'px Georgia'
  ctx.fillText(title, 384, canvas.height * (sub ? .36 : .51), 692)
  if (sub) {
    ctx.font = 'bold ' + Math.round(canvas.height * .16) + 'px sans-serif'
    ctx.fillText(sub, 384, canvas.height * .75, 680)
  }
  const map = new T.CanvasTexture(canvas)
  map.colorSpace = T.SRGBColorSpace
  const plate = new T.Mesh(new T.PlaneGeometry(width, height), new T.MeshBasicMaterial({ map }))
  plate.position.set(x, y, z)
  p.add(plate)
}

function queueDisplay(parent) {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 432
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#172632'
  ctx.fillRect(0, 0, 768, 432)
  ctx.fillStyle = '#253b4c'
  ctx.fillRect(0, 0, 768, 79)
  ctx.fillStyle = '#e8f3fb'
  ctx.font = 'bold 29px sans-serif'
  ctx.fillText('Dental House', 36, 50)
  ctx.textAlign = 'right'
  ctx.font = '22px sans-serif'
  ctx.fillText('SIMULASI ANTREAN', 734, 50)
  ctx.textAlign = 'left'
  ctx.fillStyle = '#c0ddec'
  ctx.fillRect(487, 101, 251, 301)
  ctx.font = 'bold 24px sans-serif'
  ctx.fillText('SEDANG DIPANGGIL', 36, 154)
  ctx.fillStyle = '#e8f3fb'
  ctx.font = 'bold 142px sans-serif'
  ctx.fillText('B-021', 31, 287, 427)
  ctx.font = 'bold 36px sans-serif'
  ctx.fillText('Ruang Praktik Umum 1', 37, 354, 417)
  ctx.fillStyle = '#172632'
  ctx.font = 'bold 24px sans-serif'
  ctx.fillText('BERIKUTNYA', 515, 154)
  ctx.font = 'bold 55px sans-serif'
  ctx.fillText('B-022', 515, 236, 192)
  ctx.fillText('B-023', 515, 328, 192)
  ctx.fillStyle = '#7498ae'
  ctx.fillRect(517, 266, 192, 2)

  const map = new T.CanvasTexture(canvas)
  map.colorSpace = T.SRGBColorSpace
  const screen = new T.Mesh(new T.PlaneGeometry(1.193, .666), new T.MeshBasicMaterial({ map }))
  screen.position.set(2.36, 1.101, .501)
  parent.add(screen)
}

function plant(p, x, z, size = 1) {
  const g = group(p, x, z)
  g.scale.setScalar(size)
  const pot = new T.CylinderGeometry(.235, .17, .37, 20)
  part(g, pot, 'planter', 0, .185, 0, 1, 1, 1)
  round(g, 'bark', 0, .373, 0, .45, .016)
  const leafCount = 36
  const foliage = new T.InstancedMesh(sphere, mat('leaf'), leafCount)
  const leaf = new T.Object3D()
  const shades = ['#86a270', '#9fb189', '#708a58'].map((color) => new T.Color(color))
  for (let branch = 0; branch < 6; branch++) {
    const angle = branch * 2.39996 + x
    const end = new T.Vector3(Math.cos(angle) * .22, .87 + branch * .048, Math.sin(angle) * .22)
    const start = new T.Vector3(0, .37, 0)
    const axis = end.clone().sub(start)
    const mid = start.lerp(end, .5)
    const stem = round(g, 'bark', mid.x, mid.y, mid.z, .021, axis.length())
    stem.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), axis.normalize())
    for (let i = 0; i < 6; i++) {
      const a = angle + (i % 2 ? 1.06 : -1.06)
      const length = .2 + .04 * (i % 3)
      leaf.position.copy(end).multiplyScalar(.45 + i * .1)
      leaf.position.y += .19
      leaf.position.x += Math.cos(a) * length * .45
      leaf.position.z += Math.sin(a) * length * .45
      leaf.rotation.set(.18 * (i % 3), -a, -.15 + i * .12)
      leaf.scale.set(length, .025, length * .5)
      leaf.updateMatrix()
      foliage.setMatrixAt(branch * 6 + i, leaf.matrix)
      foliage.setColorAt(branch * 6 + i, shades[(i + branch) % shades.length])
    }
  }
  foliage.castShadow = true
  foliage.receiveShadow = true
  g.add(foliage)
}

function counter(p, x, z, width, color = 'oak', depth = .65) {
  const face = depth / 2 - .029
  box(p, 'dark', x, .466, z - .024, width - .035, .91, depth - .08)
  box(p, 'ceramic', x, .929, z, width + .045, .042, depth)
  const panels = Math.max(1, Math.round(width / .5))
  const panel = width / panels
  for (let i = 0; i < panels; i++) {
    const dx = -width / 2 + (i + .5) * panel
    box(p, color, x + dx, .485, z + face, panel - .012, .82, .024)
    box(p, 'steel', x + dx, .77, z + face + .022, .12, .014, .021)
  }
}

function sink(p, x, z, y = .96) {
  soft(p, 'steel', x, y, z, .49, .06, .35)
  soft(p, 'screen', x, y + .033, z, .36, .018, .23)
  round(p, 'steel', x, y + .1, z - .15, .035, .2)
  box(p, 'steel', x, y + .19, z - .09, .035, .035, .14)
}

function ultrasonic(p, x, z) {
  soft(p, 'steel', x, 1.063, z, .36, .222, .3)
  soft(p, 'dark', x, 1.185, z, .361, .024, .298)
  box(p, 'steel', x, 1.216, z, .087, .038, .024)
  box(p, 'screen', x, 1.105, z + .153, .165, .057, .01)
  box(p, 'mustard', x + .056, 1.105, z + .159, .027, .016, .004)
}

function monitor(p, x, y, z) {
  box(p, 'dark', x, y + .09, z, .055, .18, .075)
  soft(p, 'dark', x, y + .29, z, .48, .3, .062)
  box(p, 'screen', x, y + .29, z + .035, .41, .24, .01)
  box(p, 'mint', x, y + .33, z + .045, .29, .018, .01)
}

function seat(p, x, z, width, color, angle = 0) {
  const g = group(p, x, z, angle)
  for (const dx of [-width / 2 + .13, width / 2 - .13]) for (const dz of [-.3, .29]) {
    const leg = round(g, 'oak', dx, .092, dz, .052, .184)
    leg.rotation.z = Math.sign(dx) * .1
  }
  soft(g, color, 0, .25, 0, width, .16, .83)
  soft(g, color, 0, .58, -.345, width, .59, .15).rotation.x = .075
  const cushions = Math.max(1, Math.round((width - .28) / .74))
  const cushion = (width - .24) / cushions
  for (let i = 0; i < cushions; i++) {
    const dx = (i - (cushions - 1) / 2) * cushion
    soft(g, color, dx, .377, .043, cushion - .024, .13, .671)
    soft(g, color, dx, .634, -.255, cushion - .022, .425, .16).rotation.x = .12
  }
  for (const side of [-1, 1]) {
    soft(g, color, side * (width / 2 - .065), .48, 0, .13, .34, .82)
  }
}

function placeModel(parent, asset, x, y, z, yaw = 0) {
  const placement = group(parent, x, z, yaw)
  placement.position.y = y
  placement.add(asset.clone())
}

function dental(p, asset, x, z) {
  placeModel(p, asset, x, .05, z, Math.PI - .12)
  for (const [dx, dz] of [[-.95, -.63], [.97, .52]]) {
    const stool = group(p, x + dx, z + dz, dz)
    round(stool, 'steel', 0, .27, 0, .055, .43)
    round(stool, 'dark', 0, .51, 0, .36, .09)
    for (let i = 0; i < 5; i++) {
      const leg = group(stool, 0, 0, i * Math.PI * 2 / 5)
      box(leg, 'steel', .12, .085, 0, .25, .027, .035)
      round(leg, 'dark', .235, .052, 0, .082, .04).rotation.x = Math.PI / 2
    }
  }
}

function prayerCarpet(parent) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 672
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#74614d'
  ctx.fillRect(0, 0, 512, 672)
  ctx.fillStyle = '#ad9570'
  ctx.fillRect(14, 14, 484, 644)
  ctx.fillStyle = '#827354'
  ctx.fillRect(25, 25, 462, 622)
  ctx.strokeStyle = '#d6bf96'
  ctx.lineWidth = 2
  for (let row = 0; row < 2; row++) for (let column = 0; column < 3; column++) {
    const x = 33 + column * 150
    const y = 42 + row * 306
    ctx.strokeRect(x, y, 146, 286)
    ctx.beginPath()
    ctx.moveTo(x + 13, y + 266)
    ctx.lineTo(x + 13, y + 82)
    ctx.quadraticCurveTo(x + 16, y + 45, x + 73, y + 17)
    ctx.quadraticCurveTo(x + 130, y + 45, x + 133, y + 82)
    ctx.lineTo(x + 133, y + 266)
    ctx.closePath()
    ctx.stroke()
  }
  ctx.globalAlpha = .15
  ctx.strokeStyle = '#e3cca6'
  ctx.lineWidth = 1
  for (let y = 0; y < 672; y += 3) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(512, y)
    ctx.stroke()
  }
  const map = new T.CanvasTexture(canvas)
  map.colorSpace = T.SRGBColorSpace
  map.anisotropy = 4
  box(parent, '#74614d', 1.46, .058, 3.5, 2.58, .016, 3.38)
  const surface = new T.Mesh(new T.PlaneGeometry(2.58, 3.38), new T.MeshStandardMaterial({ map, roughness: 1 }))
  surface.rotation.x = -Math.PI / 2
  surface.position.set(1.46, .067, 3.5)
  surface.receiveShadow = true
  parent.add(surface)
}

function furnish(p, { kind, rect: [x, z, w] }, assets) {
  const g = group(p, x, z)
  if (kind === 'reception') {
    placeModel(g, assets.desk, 3.27, .05, 3.57)
    placeModel(g, assets.chair, 3.02, .05, 2.62)
    placeModel(g, assets.receptionist, 3.02, .05, 2.79)
    placeModel(g, assets.visitor, 3.45, .05, 4.75, Math.PI + .22)
    const computer = group(g, 3.04, 3.38, Math.PI)
    monitor(computer, 0, .82, 0)
    box(computer, 'dark', 0, .832, .177, .34, .017, .095)
    soft(computer, 'dark', .24, .838, .171, .057, .025, .084)
    soft(g, 'ceramic', 4.03, .918, 3.39, .37, .187, .32)
    box(g, 'dark', 4.03, .93, 3.557, .25, .026, .012)
    box(g, 'sage', 3.27, .77, 4.027, 1.14, .23, .016)
    sign(g, 'Dental House', 'PENDAFTARAN', 3.27, .77, 4.036, 1.12, .21, 'sage')
    plant(g, .44, 5.44, .9)
  } else if (kind === 'lounge') {
    placeModel(g, assets.sofa, 2.46, .05, 5.1, Math.PI)
    seat(g, .66, 2.1, .78, 'sage', Math.PI / 2)
    placeModel(g, assets.waitingVisitor, .74, .05, 3.35, Math.PI / 2)
    round(g, 'ivory', 2.22, .4, 3.67, .98, .08)
    round(g, 'oak', 2.22, .21, 3.67, .39, .37)
    box(g, 'oak', 2.36, .345, .47, 1.69, .59, .47)
    box(g, 'dark', 2.36, .652, .47, 1.73, .03, .5)
    placeModel(g, assets.tv, 2.36, .667, .46)
    queueDisplay(g)
    soft(g, 'ivory', 3.8, .48, .42, .33, .96, .37)
    box(g, 'screen', 3.8, .727, .611, .175, .135, .01)
    round(g, 'dark', 3.81, .217, 1.07, .24, .33)
    round(g, 'steel', 3.81, .396, 1.07, .247, .03)
    box(g, 'ivory', 3.33, .33, .086, .15, .085, .021)
    for (const offset of [-.036, .036]) box(g, 'dark', 3.33 + offset, .33, .098, .021, .02, .005)
    plant(g, 3.37, .91, .8)
  } else if (kind === 'play') {
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
      box(g, (row + col) % 2 ? '#b8b5a4' : '#a4a995', 1.13 + col * .93, .047, 2.27 + row * .93, .925, .025, .925)
    }
    round(g, 'oak', 1.56, .48, 3.18, .82, .048)
    for (let i = 0; i < 4; i++) {
      const corner = group(g, 1.56, 3.18, i * Math.PI / 2 + .78)
      round(corner, 'oak', .28, .245, 0, .043, .46)
      round(corner, i % 2 ? 'sage' : 'oak', .72, .29, 0, .29, .055)
      for (const dz of [-.085, .085]) {
        round(corner, 'oak', .8, .158, dz, .036, .265)
        round(corner, 'oak', .64, .158, dz, .036, .265)
      }
    }
    for (const [i, color] of ['mustard', 'plum', 'clay'].entries()) {
      box(g, color, 1.36 + i * .15, .537, 3.11, .09, .064, .09).rotation.y = .17 * i
    }
    counter(g, 2.05, .52, 2.9)
    for (const [i, color] of ['mustard', 'sage', 'plum'].entries()) {
      box(g, color, 2.81, .966 + .027 * i, .54, .19, .027, .24).rotation.y = .08 * i
    }
    box(g, 'mint', 2.02, 1.26, .095, 2.72, .6, .17)
    sign(g, 'Gigi Sehat', 'SIKAT GIGI PAGI DAN MALAM', 2.02, 1.27, .184, 2.35, .37, 'sage')
  } else if (kind === 'general' || kind === 'kids') {
    dental(g, assets.dental, 2.3, 3.05)
    counter(g, w / 2, .52, w - .85, 'oak', .82)
    sink(g, 1.2, .56)
    ultrasonic(g, 1.97, .53)
    placeModel(g, assets.autoclave, 2.66, .95, .52)
    monitor(g, w - 1.02, .96, .57)
    round(g, 'clay', .46, .26, 1.4, .32, .52)
    if (kind === 'kids') {
      seat(g, .65, 3.45, .9, 'plum', Math.PI / 2)
      box(g, 'mint', 2.56, 1.27, .095, 3.25, .64, .17)
      sign(g, 'Little Brave Smile', '', 2.56, 1.28, .185, 2.74, .29)
    } else {
      soft(g, 'steel', w - .62, .39, 2.15, .48, .78, .61)
      soft(g, 'ivory', w - .62, .87, 2.15, .28, .23, .27)
    }
  } else if (kind === 'prayer') {
    prayerCarpet(g)
    box(g, 'oak', 1.68, .4, .47, 2.24, .73, .5)
    for (let i = 0; i < 2; i++) box(g, 'dark', 1.68, .26 + i * .29, .727, 2.05, .23, .013)
    for (const [i, color] of ['ivory', 'sage', '#9d896f', 'ivory'].entries()) {
      soft(g, color, .98 + (i % 2) * 1.1, .79 + Math.floor(i / 2) * .048, .47, .44, .043, .28)
    }
  } else if (kind === 'wc') {
    soft(g, 'ivory', .59, .22, 2.31, .42, .41, .64)
    soft(g, 'ivory', .59, .51, 2.58, .49, .48, .23)
    soft(g, 'steel', .59, .44, 2.21, .32, .023, .37)
    counter(g, 2.24, 2.53, .82)
    sink(g, 2.24, 2.54)
  } else if (kind === 'wash') {
    box(g, 'stone', 1.49, .12, 2.42, 2.54, .24, .65)
    for (const dx of [.61, 1.44, 2.27]) {
      round(g, 'steel', dx, .41, 2.62, .04, .38)
      box(g, 'steel', dx, .57, 2.53, .04, .04, .19)
      round(g, 'oak', dx, .14, 1.75, .34, .28)
    }
  } else if (kind === 'sterile') {
    counter(g, w / 2, .52, w - .5, 'sage', .82)
    sink(g, .65, .55)
    ultrasonic(g, 1.38, .55)
    placeModel(g, assets.autoclave, 2.63, .95, .52)
    for (let i = 0; i < 3; i++) box(g, 'ivory', 1.9, .98 + i * .06, .51, .33, .05, .26)
    counter(group(g, .55, 2.65, Math.PI / 2), 0, 0, 2.6, 'sage')
  } else if (kind === 'storage') {
    for (const dx of [.57, 1.4, 2.23, 3.06]) {
      box(g, 'oak', dx, .83, .47, .78, 1.66, .62)
      box(g, 'ivory', dx, 1.31, .79, .2, .072, .018)
    }
    counter(g, w / 2, 3.15, 1.53)
  } else if (kind === 'staff') {
    counter(g, w / 2, 2.82, 2.27)
    monitor(g, 1.88, .95, 2.78)
    seat(g, 1.77, 1.98, .68, 'plum', Math.PI)
    seat(g, .43, 1.24, .87, 'sage', Math.PI / 2)
  } else if (kind === 'ppe') {
    box(g, 'oak', .48, .85, 1.88, .57, 1.7, .85)
    box(g, 'glass', .79, 1.17, 1.88, .03, .64, .47)
    box(g, 'wall', 1.38, .49, 2.1, .12, .98, .72)
    counter(g, 2.31, 2.12, .81)
    sink(g, 2.31, 2.12)
    round(g, 'clay', 2.54, .26, 1.48, .34, .52)
  } else if (kind === 'utility') {
    for (const dx of [.72, 1.62]) {
      round(g, 'steel', dx, .54, 1.15, .57, .99)
      round(g, 'dark', dx, 1.06, 1.15, .39, .18)
      box(g, 'steel', dx, 1.14, .63, .07, .07, 1.02)
    }
    soft(g, 'sage', 2.7, .39, 2.15, .69, .76, .62)
  }
}

function buildSite(scene, assets) {
  const [x, z, w, d] = site
  box(scene, 'stone', x + w / 2, -.37, z + d / 2, w, .52, d)
  const [bx, bz, bw, bd] = building
  box(scene, 'wall', bx + bw / 2, -.1, bz + bd / 2, bw, .22, bd)
  box(scene, 'wall', corridor[2] / 2, .017, 7, corridor[2], .06, 2)
  box(scene, 'ivory', 11.3, -.025, 16.85, 3, .18, 7)
  box(scene, 'asphalt', 4.82, -.04, 17.25, 9.28, .17, 6.48)
  box(scene, 'asphalt', 18.02, -.04, 17.25, 9.94, .17, 6.48)
  for (const [[px, pz, pw, pd], count, model, occupied] of [
    [parking.cars, 3, assets.car, [0, 1]],
    [parking.scooters, 5, assets.scooter, [0, 1, 3]],
  ]) {
    const bay = pw / count
    box(scene, 'ivory', px + pw / 2, .048, pz, pw, .006, .062)
    for (let i = 0; i <= count; i++) box(scene, 'ivory', px + i * bay, .049, pz + pd / 2, .061, .008, pd)
    for (const i of occupied) placeModel(scene, model, px + (i + .5) * bay, .045, pz + pd / 2, i % 2 ? 0 : Math.PI)
  }
  for (let i = 0; i < 6; i++) box(scene, 'stone', 11.3, .073, 15.5 + i * .69, 2.48, .008, .034)
  const [dx, dz, dw, dd] = parking.dropOff
  for (const bx of [dx, dx + dw]) for (let i = 0; i < 6; i++) {
    box(scene, 'mustard', bx, .052, dz + (i + .5) * dd / 6, .062, .009, .52)
  }
  const dropOff = group(scene, dx + dw / 2, dz + dd / 2)
  dropOff.rotation.x = -Math.PI / 2
  dropOff.position.y = .07
  sign(dropOff, 'DROP-OFF', '', 0, 0, 0, 1.46, .38)
  for (const [px, pz] of [[-.95, 13.8], [-.95, 18.8], [24.05, 14.5], [24.05, 19.1], [8.6, 14.86], [14, 14.8], [3, -1.3]]) {
    box(scene, 'grass', px, -.01, pz, 1.1, .16, 1.25)
    plant(scene, px, pz, px < 0 || px > 23 ? 1.42 : 1)
  }
}

function floorFinish(parent, { kind, rect: [x, z, w, d] }) {
  const joints = []
  const y = .051
  if (kind === 'reception' || kind === 'lounge' || kind === 'play' || kind === 'prayer') {
    for (let row = 1; row * .23 < d; row++) {
      const dz = z + row * .23
      joints.push(x, y, dz, x + w, y, dz)
      for (let dx = .52 * (row % 3 + 1); dx < w; dx += 1.56) {
        joints.push(x + dx, y, dz - .23, x + dx, y, dz)
      }
    }
  } else {
    for (let dx = .6; dx < w; dx += .6) joints.push(x + dx, y, z, x + dx, y, z + d)
    for (let dz = .6; dz < d; dz += .6) joints.push(x, y, z + dz, x + w, y, z + dz)
  }
  const geometry = new T.BufferGeometry()
  geometry.setAttribute('position', new T.Float32BufferAttribute(joints, 3))
  parent.add(new T.LineSegments(geometry, grout))
}

export function buildModel(scene, assets) {
  const cutaway = new T.Group()
  const exterior = new T.Group()
  const pickables = []
  const highlights = new Map()
  buildSite(scene, assets)
  scene.add(cutaway, exterior)

  for (const room of rooms) {
    const [x, z, w, d] = room.rect
    const center = [x + w / 2, z + d / 2]
    if (room.kind !== 'parking') {
      box(scene, room.kind === 'kids' ? '#b3c4ad' : zones[room.zone].floor, center[0], .014, center[1], w - .045, .07, d - .045)
      floorFinish(cutaway, room)
      furnish(cutaway, room, assets)
    }
    const highlight = box(scene, '#367aaa', center[0], .057, center[1], w - .18, .015, d - .18)
    highlight.material = highlight.material.clone()
    highlight.material.transparent = true
    highlight.material.opacity = .37
    highlight.material.depthWrite = false
    highlight.visible = false
    highlight.castShadow = false
    highlights.set(room.id, highlight)
    const hit = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshBasicMaterial({ visible: false }))
    hit.rotation.x = -Math.PI / 2
    hit.position.set(center[0], .075, center[1])
    hit.userData.roomId = room.id
    hit.updateMatrixWorld()
    pickables.push(hit)
  }

  for (const [x, z, x2, z2, kind] of walls) {
    const length = Math.hypot(x2 - x, z2 - z)
    const g = group(cutaway, (x + x2) / 2, (z + z2) / 2, -Math.atan2(z2 - z, x2 - x))
    const h = kind === 'low' ? .42 : kind === 'glass' ? .49 : .97
    box(g, kind === 'glass' ? 'glass' : 'wall', 0, h / 2, 0, length + .08, h, .15)
    box(g, 'ivory', 0, h + .022, 0, length + .11, .052, .19)
  }

  box(exterior, 'wall', 11.5, 1.55, 0, 23, 3.1, .2)
  for (const x of [0, 23]) box(exterior, 'wall', x, 1.55, 7, .23, 3.1, 14)
  box(exterior, 'wall', 18.4, 1.55, 14, 9.2, 3.1, .2)
  box(exterior, 'glass', 5.075, 1.35, 14, 10.15, 2.7, .11)
  box(exterior, 'glass', 13.13, 1.35, 14, 1.35, 2.7, .11)
  box(exterior, '#b6d0c2', 11.3, 1.26, 14.03, 2.3, 2.5, .055)
  for (const x of [0, 1.75, 3.45, 5.15, 6.85, 8.55, 10.15, 11.3, 12.45, 13.8]) {
    box(exterior, 'dark', x, 1.28, 14.08, .07, 2.56, .09)
  }
  box(exterior, 'ivory', 11.5, 3.17, 7, 23.52, .42, 14.55)
  box(exterior, 'stone', 11.5, 3.39, 7, 22.72, .065, 13.74)
  for (const x of [3.3, 6.6, 9.9, 13.2, 16.5, 19.8]) box(exterior, 'wall', x, 3.44, 7, .05, .043, 13.7)
  box(exterior, 'clay', 11.5, 2.87, 14.17, 23.15, .61, .19)
  box(exterior, 'oak', 11.3, 2.52, 14.78, 4.85, .16, 1.44)
  box(exterior, 'wall', 21.2, 1.27, -1.5, 3.56, 2.54, 2.98)
  box(exterior, 'dark', 23.01, 1, -1.55, .07, 2, 1.22)
  box(exterior, 'ivory', 21.2, 2.58, -1.5, 3.75, .2, 3.18)
  for (let i = 0; i < 18; i++) box(exterior, 'oak', 15.34 + i * .39, 1.27, 14.15, .11, 2.55, .13)
  sign(exterior, 'Dental House', 'FAMILY DENTAL CLINIC', 6.45, 2.87, 14.29, 5.4, .61)
  exterior.visible = false
  return { cutaway, exterior, highlights, pickables }
}
