import EventEmitter from 'event-emitter'

export default class Video {
    constructor (options) {
        this.ev = ['start', 'play', 'pause', 'ended']
        this.currentTime = 0
        this.timer = null
        this.total = options.total
        this.update = options.update
        this.bEnd = false
        EventEmitter(this)
        this.initEvent()
    }

    initEvent () {
        this.ev.map(ev => {
            let handler = `on${ev.charAt(0).toUpperCase() + ev.slice(1)}`
            this[['start', 'ended'].includes(ev) ? 'once' : 'on'](ev, this[handler])
        })
    }

    onStart () {
        this.timer = setInterval(this.playing.bind(this), 1000)
    }

    onPlay () {
        if (this.bEnd) return
        this.timer = setInterval(this.playing.bind(this), 1000)
    }
    onPause () {
        clearInterval(this.timer)
    }

    onEnded () {
        this.bEnd = true
        clearInterval(this.timer)
        this.timer = null
    }

    playing () {
        this.currentTime++
        this.update(this.currentTime)
        if (this.currentTime >= this.total) {
            this.emit('ended')
        }
    }

}