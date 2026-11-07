import './style.css'
import { corridor, parking, rooms, site, walls, zones } from './layout.js'

const get = (id) => document.getElementById(id)
const stage = get('stage')
const viewport = get('viewport')
const markers = get('markers')
const plan = get('plan')
const status = get('status')
const focusButton = get('focus-room')
const viewButtons = [...document.querySelectorAll('[data-view]')]
const captions = { model: 'Potongan bangunan', plan: 'Tampak atas', facade: 'Eksterior dan parkir' }
let viewer
let view = 'model'
let selected
let failed = false

function updateStatus() {
  if (failed) status.textContent = 'Maket 3D tidak tersedia. Denah tetap bisa dipilih.'
  else if (selected && view !== 'facade') status.textContent = selected.id + ' · ' + selected.name
  else if (view === 'plan') status.textContent = 'Pilih ruang pada denah.'
  else status.textContent = 'Seret untuk memutar · Gulir atau cubit untuk zoom'
}

function setView(next) {
  view = next
  plan.hidden = next !== 'plan'
  viewport.hidden = next === 'plan'
  markers.hidden = next !== 'model'
  get('camera-tools').hidden = next === 'plan'
  get('view-caption').textContent = captions[next]
  for (const button of viewButtons) button.setAttribute('aria-pressed', String(button.dataset.view === next))
  viewer?.show(next)
  updateStatus()
}

function selectRoom(id) {
  selected = rooms.find((room) => room.id === id)
  if (!selected) return
  get('detail-meta').textContent = id + ' / ' + zones[selected.zone].label
  get('detail-title').textContent = selected.name
  get('detail-text').textContent = selected.description
  focusButton.hidden = false
  for (const element of document.querySelectorAll('[data-room]')) {
    const pressed = element.dataset.room === id
    element.setAttribute('aria-pressed', String(pressed))
    if (element.classList.contains('plan-room')) element.classList.toggle('selected', pressed)
  }
  viewer?.select(id)
  updateStatus()
}

function svgElement(tag, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag)
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value)
  return element
}

function drawPlan() {
  const [sx, sz, sw, sd] = site
  const svg = svgElement('svg', { viewBox: [sx - .55, sz - .55, sw + 1.1, sd + 1.1].join(' '), role: 'group', 'aria-label': 'Denah Dental House, pintu masuk di bawah' })
  const rect = ([x, y, width, height], fill, extra = {}) => svgElement('rect', { x, y, width, height, fill, ...extra })
  svg.append(rect(site, '#cad3da', { stroke: '#6e8a9c', 'stroke-width': '.07' }), rect(corridor, '#e9edef'))
  const corridorText = svgElement('text', { x: 11.5, y: 7.13, class: 'plan-text' })
  corridorText.textContent = 'KORIDOR'
  svg.append(corridorText)
  for (const { id, name, short, rect: bounds, zone } of rooms) {
    const [x, z, w, d] = bounds
    const room = rect(bounds, zones[zone].floor, { class: 'plan-room', tabindex: '0', role: 'button', 'aria-label': id + ' ' + name, 'aria-pressed': 'false', 'data-room': id })
    room.addEventListener('click', () => selectRoom(id))
    room.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        selectRoom(id)
      }
    })
    svg.append(room)
    if (id === '15') {
      svg.append(rect([9.8, 14, 3, 6.5], '#e9edef', { 'pointer-events': 'none' }))
      svg.append(rect(parking.dropOff, 'none', { stroke: '#304c64', 'stroke-width': '.09', 'stroke-dasharray': '.29 .18', 'pointer-events': 'none' }))
      const dropOff = svgElement('text', { x: 15.3, y: 17.5, class: 'plan-text' })
      dropOff.textContent = 'DROP-OFF'
      svg.append(dropOff)
      for (const [[x, z, w, d], count] of [[parking.cars, 3], [parking.scooters, 5]]) {
        for (let i = 0; i < count; i++) {
          svg.append(rect([x + i * w / count, z, w / count, d], 'none', { stroke: '#8b7462', 'stroke-width': '.055', 'pointer-events': 'none' }))
        }
      }
    }
    const center = x + w / 2
    const label = svgElement('text', { x: center, y: z + d / 2, class: 'plan-text', 'aria-hidden': 'true' })
    const number = svgElement('tspan', { class: 'number', x: center, dy: '-.13' })
    const title = svgElement('tspan', { class: 'room-title', x: center, dy: '.62' })
    number.textContent = id
    title.textContent = short
    label.append(number, title)
    svg.append(label)
  }
  for (const [x1, y1, x2, y2, kind] of walls) {
    svg.append(svgElement('line', { x1, y1, x2, y2, stroke: kind === 'glass' ? '#487b99' : '#263642', 'stroke-width': kind === 'low' ? '.085' : '.14', 'pointer-events': 'none' }))
  }
  const entry = svgElement('text', { x: 11.3, y: 14.9, class: 'plan-text' })
  entry.textContent = '↑ MASUK'
  const scale = svgElement('path', { d: 'M.5 -2.4v.2h5v-.2', fill: 'none', stroke: '#263642', 'stroke-width': '.08' })
  const scaleText = svgElement('text', { x: 3, y: -2.7, class: 'plan-text scale-text' })
  scaleText.textContent = '5 m'
  svg.append(entry, scale, scaleText)
  plan.append(svg)
}

function drawDirectory() {
  for (const [key, zone] of Object.entries(zones)) {
    const section = document.createElement('section')
    section.className = 'room-group ' + key
    const title = document.createElement('h3')
    title.textContent = zone.label
    section.append(title)
    for (const room of rooms.filter(({ zone }) => zone === key)) {
      const button = document.createElement('button')
      button.type = 'button'
      button.dataset.room = room.id
      button.setAttribute('aria-pressed', 'false')
      const number = document.createElement('span')
      number.textContent = room.id
      button.append(number, room.name)
      button.addEventListener('click', () => selectRoom(room.id))
      section.append(button)
    }
    get('room-groups').append(section)
  }
}

drawPlan()
drawDirectory()
for (const button of viewButtons) button.addEventListener('click', () => setView(button.dataset.view))
get('zoom-in').addEventListener('click', () => viewer?.zoom(1.23))
get('zoom-out').addEventListener('click', () => viewer?.zoom(1 / 1.23))
get('reset').addEventListener('click', () => viewer?.reset())
focusButton.addEventListener('click', () => {
  if (!selected) return
  setView(viewer ? 'model' : 'plan')
  viewer?.focus(selected)
  const selector = '[data-room="' + selected.id + '"]'
  const target = viewer ? viewport.querySelector('canvas') : plan.querySelector(selector)
  stage.scrollIntoView({ block: 'center' })
  target.focus({ preventScroll: true })
})

try {
  const { createViewer } = await import('./viewer.js')
  viewer = await createViewer(viewport, markers, selectRoom)
  viewport.querySelector('canvas').addEventListener('webglcontextlost', () => {
    failed = true
    viewer = undefined
    for (const button of viewButtons) button.disabled = button.dataset.view !== 'plan'
    setView('plan')
  })
  for (const button of viewButtons) button.disabled = false
  if (selected) selectRoom(selected.id)
  setView(view)
} catch (error) {
  console.warn('Dental House: maket 3D tidak tersedia.', error)
  failed = true
  setView('plan')
}
