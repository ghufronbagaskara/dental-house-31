import { Box3, Group, Vector3 } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'

export async function loadAssets() {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  const files = {
    dental: 'dental-unit', car: 'hatchback', scooter: 'scooter', autoclave: 'autoclave',
    desk: 'reception-desk', chair: 'task-chair', tv: 'tv', sofa: 'lounge-sofa',
    receptionist: 'receptionist', visitor: 'visitor', waitingVisitor: 'waiting-visitor',
  }
  return Object.fromEntries(await Promise.all(Object.entries(files).map(async ([kind, file]) => {
    const { scene } = await loader.loadAsync(import.meta.env.BASE_URL + 'models/' + file + '.glb')
    scene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true
        node.receiveShadow = true
      }
    })
    const bounds = new Box3().setFromObject(scene, true)
    const size = bounds.getSize(new Vector3())
    const center = bounds.getCenter(new Vector3())
    const model = new Group()
    scene.position.sub(new Vector3(center.x, bounds.min.y, center.z))
    model.add(scene)
    if (['dental', 'car', 'scooter'].includes(kind) && size.x > size.z) model.rotation.y = -Math.PI / 2
    return [kind, model]
  })))
}
