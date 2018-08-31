import html2canvas from 'html2canvas'
import Canvas2Image from './canvas2image'

const convert2canvas = function (targetDom, callback) {

    var shareContent = targetDom 
    var width = shareContent.offsetWidth 
    var height = shareContent.offsetHeight 
    var canvas = document.createElement('canvas') 
    var scale = 2 

    canvas.width = width * scale 
    canvas.height = height * scale 
    canvas.getContext('2d').scale(scale, scale) 

    var opts = {
        scale: scale, 
        canvas: canvas, 
        logging: true, 
        width: width, 
        height: height 
    }
    html2canvas(shareContent, opts).then(function (canvas) {
        callback()
        // var context = canvas.getContext('2d');
        var img = Canvas2Image.convertToImage(canvas, canvas.width, canvas.height)
        img.className = 'canvasImg'
        document.body.appendChild(img)
        img.style.cssText = `width: ${canvas.width / 2}px; height: ${canvas.height / 2}px;`
    })
}

export default convert2canvas
