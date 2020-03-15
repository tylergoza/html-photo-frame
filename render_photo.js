(function () {
  let config = {
    timer:10000,
    fps:60
  }
  let canvas = document.getElementById('photoGallery')
  let context = canvas.getContext('2d')
  let imageInIndex = 1
  let imageOutIndex = 0
  let imageOut = {}
  let imageIn = {}
  let imgs = []
  let animateComplete = 0
  let width = window.innerWidth - 15
  let height = window.innerHeight - 20
  const socket = new WebSocket(`ws://${window.location.host}/updates`)
  context.canvas.width = width
  context.canvas.height = height
  
  socket.addEventListener('message', data => {
    if (data.data && data.data === 'refresh') {
      window.location.reload()
    }
  })

  function imgPos(img, width, height) {
    let pos = {
      imgWidth: 0,
      imgHeight: 0,
      x: 0,
      y: 0
    }
    
    let scale = Math.min(width/img.naturalWidth, height/img.naturalHeight)

    pos.imgWidth = img.naturalWidth * scale
    pos.imgHeight = img.naturalHeight * scale
    
    pos.x = (width/2) - (img.naturalWidth/2) * scale
    pos.y = (height/2) - (img.naturalHeight/2) * scale
    
    return pos
  }
  function loadAllImages() {
    for (let i=0; i<config.images.length; i++) {
      let img = new Image()
      imgs.push(img)
      img.onload = () => {
        let pos = imgPos(imgs[0], context.canvas.width, context.canvas.height)
        
        context.drawImage(imgs[0], pos.x, pos.y, pos.imgWidth, pos.imgHeight)
      }
      img.onerror = _ => console.error(`image load failed for ${config.images[i]}`)
      img.src = config.images[i]
    }
  }
  
  fetch('/config.json')
    .then(r => r.json())
    .then(json => {
      config = Object.assign(config, json)
      return Promise.resolve()
    })
    .then(_ => {
      loadAllImages()
      return Promise.resolve()
    })
    .then(_ => {
      setTimeout(_ => {
        imageOut = {
          pos: imgPos(imgs[imageOutIndex], context.canvas.width, context.canvas.height),
          img: imgs[imageOutIndex]
        }
        imageIn = {
          pos: imgPos(imgs[imageInIndex], context.canvas.width, context.canvas.height),
          img: imgs[imageInIndex]
        }
      }, 1000)
      setInterval(animate, config.timer)
    })

  function animate () {
    if (animateComplete >= 100) {
      imageInIndex = imageInIndex >= imgs.length - 1 ? 0 : imageInIndex + 1
      imageOutIndex = imageOutIndex >= imgs.length - 1 ? 0 : imageOutIndex + 1
      animateComplete = 0
      imageOut = {
        pos: imgPos(imgs[imageOutIndex], context.canvas.width, context.canvas.height),
        img: imgs[imageOutIndex]
      }
      imageIn = {
        pos: imgPos(imgs[imageInIndex], context.canvas.width, context.canvas.height),
        img: imgs[imageInIndex]
      }
      return 
    }
    setTimeout(() => {
      window.requestAnimationFrame(animate)
      context.clearRect(0,0,context.canvas.width,context.canvas.height)
      draw(imageOut, (1-animateComplete/100))
      draw(imageIn,animateComplete/100)
      animateComplete++
    }, 1000/config.fps)
  }

  function draw(img, opacity) {
    //let pos = imgPos(img, context.canvas.width, context.canvas.height)
    context.save()
    context.globalAlpha = opacity
    context.drawImage(img.img,img.pos.x,img.pos.y,img.pos.imgWidth,img.pos.imgHeight)
    context.restore()
  }

})()