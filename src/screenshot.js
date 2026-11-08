const svgStyles = ['display', 'fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline']

export async function capturePlan(plan, background) {
  const svg = plan.querySelector('svg')
  const bounds = svg.getBoundingClientRect()
  const viewport = plan.getBoundingClientRect()
  const copy = svg.cloneNode(true)
  copy.setAttribute('width', bounds.width)
  copy.setAttribute('height', bounds.height)
  const sourceNodes = svg.querySelectorAll('*')
  copy.querySelectorAll('*').forEach((node, i) => {
    const style = getComputedStyle(sourceNodes[i])
    for (const name of svgStyles) node.style.setProperty(name, style.getPropertyValue(name))
  })

  const image = new Image()
  image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(copy))
  const output = document.createElement('canvas')
  const scale = Math.min(window.devicePixelRatio || 1, 1.65)
  output.width = Math.round(viewport.width * scale)
  output.height = Math.round(viewport.height * scale)
  await image.decode()
  const ctx = output.getContext('2d')
  ctx.fillStyle = background
  ctx.fillRect(0, 0, output.width, output.height)
  ctx.scale(output.width / viewport.width, output.height / viewport.height)
  ctx.drawImage(image, bounds.left - viewport.left, bounds.top - viewport.top, bounds.width, bounds.height)
  return output
}

export function captureModel(canvas, markers) {
  if (markers.hidden) return canvas
  const output = document.createElement('canvas')
  output.width = canvas.width
  output.height = canvas.height
  const ctx = output.getContext('2d')
  ctx.drawImage(canvas, 0, 0)
  const viewport = canvas.getBoundingClientRect()
  ctx.scale(output.width / viewport.width, output.height / viewport.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const badges = [...markers.querySelectorAll('.marker:not([hidden])')]
  badges.sort((a, b) => Number(a.getAttribute('aria-pressed') === 'true') - Number(b.getAttribute('aria-pressed') === 'true'))
  for (const button of badges) {
    const badge = button.firstElementChild
    const { left, top, width, height } = badge.getBoundingClientRect()
    const style = getComputedStyle(badge)
    const x = left - viewport.left
    const y = top - viewport.top
    ctx.beginPath()
    ctx.roundRect(x + .5, y + .5, width - 1, height - 1, parseFloat(style.borderRadius))
    ctx.fillStyle = style.backgroundColor
    ctx.fill()
    ctx.strokeStyle = style.borderColor
    ctx.stroke()
    ctx.fillStyle = style.color
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    ctx.fillText(badge.textContent, x + width / 2, y + height / 2)
  }
  return output
}

export function downloadPng(canvas, filename) {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  if (link.href === 'data:,') throw new Error('Empty screenshot')
  link.click()
}
