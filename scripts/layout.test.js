import assert from 'node:assert/strict'
import test from 'node:test'
import { building, corridor, rooms, site, walls, zones } from '../src/layout.js'

const area = ([, , width, depth]) => width * depth

test('Setiap ruang punya ID unik, zona dan petak yang tidak tumpang tindih', () => {
  assert.equal(new Set(rooms.map(({ id }) => id)).size, rooms.length)
  const [left, back, width, depth] = site
  for (const [index, room] of rooms.entries()) {
    const [x, z, w, d] = room.rect
    assert.ok(w > 0 && d > 0 && x >= left && z >= back && x + w <= left + width && z + d <= back + depth, room.name)
    assert.ok(zones[room.zone], room.name)
    for (const { rect: [a, b, c, e], name } of rooms.slice(index + 1)) {
      const intersectionX = Math.min(x + w, a + c) - Math.max(x, a)
      const intersectionZ = Math.min(z + d, b + e) - Math.max(z, b)
      assert.ok(intersectionX < 1e-8 || intersectionZ < 1e-8, room.name + ' / ' + name)
    }
  }
})

test('Denah utama mengisi tapak bangunan dan tiga ruang perawatan punya bukaan koridor', () => {
  const interior = rooms.filter(({ kind }) => kind !== 'parking' && kind !== 'utility')
  assert.ok(Math.abs(interior.reduce((sum, { rect }) => sum + area(rect), area(corridor)) - area(building)) < 1e-8)
  const clinical = rooms.filter(({ zone }) => zone === 'clinical')
  assert.equal(clinical.length, 3)
  for (const { rect: [x, z, w, d], name } of clinical) {
    const doorCenter = x + w - 1.275
    const wallOverDoor = walls.some(([x1, z1, x2, z2]) => z1 === z + d && z2 === z1 && x1 < doorCenter && x2 > doorCenter)
    assert.equal(wallOverDoor, false, name)
  }
})
