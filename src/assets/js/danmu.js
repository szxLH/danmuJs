import EventEmitter from 'event-emitter'
import requestFrame from 'request-frame';

let status = 'idle'
let seekStatus = 'idle'

export default class Controller {
    constructor (Video, options) {
        this.video = Video
        this.el = options.el
        this.ev = ['start', 'play', 'pause', 'remove', 'clear', 'seek']
        this.options = options
        this.fetchTimer = null
        this.renderTimer = null
        this.offset = 0 // 请求弹幕接口偏移值
        this.remainList = [] // 用于存储还未渲染的弹幕
        this.queue = [] // 用于存储所有已渲染但未删除的弹幕
        this.channel = []
        EventEmitter(this)
        this.init()
    }

    init () {
        this.ev.map(ev => {
            let handler = `on${ev.charAt(0).toUpperCase() + ev.slice(1)}`
            this[['start'].includes(ev) ? 'once' : 'on'](ev, this[handler])
        })
        this.video.on('ended', this.onEnded)
        let span = document.createElement('span')
        span.style.cssText = 'position:fixed;top:0;left:0;color:#f00;visibility:hidden;'
        this.txtDom = span
        document.body.appendChild(span)
    }

    onStart () {
        // 初始化轨道
        this.channel = new Channel(this, this.options)
        clearInterval(this.fetchTimer)
        this.fetchData()
        this.fetchTimer = setInterval(() => {
            this.fetchData()
        }, this.options.delay || 2000)
        status = 'play'
    }

    onPlay () {
        clearInterval(this.fetchTimer)
        status = 'play'
        this.fetchData()
        this.fetchTimer = setInterval(() => {
            this.fetchData()
        }, this.options.delay || 2000)
    }

    onPause () {
        let cancel = requestFrame('cancel')
        cancel(this.renderTimer)
        status = 'pause'
        clearInterval(this.fetchTimer)
    }

    onEnded () {
        let cancel = requestFrame('cancel')
        cancel(this.renderTimer)
        status = 'end'
        clearInterval(this.fetchTimer)
    }
    
    onClear () {
        clearInterval(this.fetchTimer)
        status = 'end'
        let cancel = requestFrame('cancel')
        cancel(this.renderTimer)
        this.remainList = this.queue = []
        var childs = this.el.childNodes
        this.channel.initChannel()
        for (let i = childs.length - 1; i >= 0; i--) {
            this.el.removeChild(childs.item(0))
        }
    }

    onRemove (bullet) {
        this.queue.some((v, i) => {
            if (v.id === bullet.id) {
                this.queue.splice(i, 1)
                return true
            }
        })
    }

    // 某条channel'空闲'（队列数据均已出现在视窗中），遍历缓存弹幕列表，如有合适的添加至该channel中
    onSeek () {
        if (seekStatus === 'idle') {
            seekStatus = 'seeking'
            this.remainList.some((bullet, index) => {
                const result = this.channel.createBullet(bullet)
                if (result) {
                    this.queue.push(result)
                    this.remainList.splice(index, 1)
                    return true
                }
            })
            seekStatus = 'idle'
        }
    }

    async fetchData () {
        let list
        if (this.remainList.length) {
            list = this.remainList
        }  else {
            const data = await this.options.fetch(this.offset)
            this.offset += (data.length || 0)
            list = this.remainList = data
        }

        if (list && list.length) {
            this.handleData(list)
            this.renderBullet()
        }
    }

    handleData (list) {
        let txtContent, size
        const container = this.options.el && this.options.el.getBoundingClientRect()
        let data = list.map(v => {
            txtContent = v.txt.slice(0, 40)

            this.txtDom.style.fontSize = `${v.scale * (this.options.fontSize || 14)}px`
            this.txtDom.textContent = txtContent
            size = this.txtDom.getBoundingClientRect()

            return {
                id: v.id,
                txt: txtContent,
                duration: v.duration * 1,
                color: v.color,
                scale: v.scale * 1,
                width: size.width,
                height: size.height,
                step: ((container.width + size.width) / v.duration / 60).toFixed(2) * 1
            }
        })
        data = this.channel.addBullet(data)
        this.remainList = data.fail || []
        this.queue = this.queue.concat(data.success || [])
    }

    renderBullet () {
        if (!['pause', 'end'].includes(status) && this.queue.length) {
            let cancel = requestFrame('cancel')
            cancel(this.renderTimer)
            this.queue.map(item => {
                if (!this.remainList.some(v => v.id === item.id)) {
                    item.move()
                }
            })
            let request = requestFrame('request')
            this.renderTimer = request(this.renderBullet.bind(this))
        }
    }
}

class Channel {
    constructor (Controller, options) {
        this.controller = Controller
        this.options = options
        this.channelHeight = options.fontSize || 14
        this.channels = []
        this.initChannel()
        this.controller.on('remove', this.removeBullet.bind(this))
    }

    initChannel () {
        const options = this.options
        const container = options.el && options.el.getBoundingClientRect()
        const rows = container.height / this.channelHeight
        let channel = []
        for (let i = 0; i < rows; i++) {
            channel[i] = {
                id: i + 1,
                step: 9999,
                queue: [],
                restSpace: 0
            }
        }
        this.channels = channel
    }

    // 添加新增弹幕，返回添加成功的弹幕列表
    addBullet (bullets) {
        let success = []
        let result
        let fail = bullets.filter(but => {
            result = this.createBullet(but)
            if (result) {
                success.push(result)
            } else {
                return true
            }
        })
        return {success, fail} // success: 成功渲染的弹幕“实例”， fail: 渲染失败的弹幕原型
    }

    // 放置弹幕，即给弹幕分行
    createBullet (bullet) {
        let occupy = Math.ceil(bullet.scale)
        let maxRows = this.channels.length
        let posY = -1
        let channel, flag = true
        let result
        for (let i = 0; i <= maxRows - occupy; i++) {
            flag = true
            for (let j = i; j < i + occupy; j++) {
                channel = this.channels[j]
                if (channel.restSpace < 0) {
                    flag = false
                    break
                }
            }
            if (flag) {
                posY = i
                break
            }
        }
        if (posY >= 0) {
            result = new Bullet(this.controller, this, Object.assign(bullet, this.options))
            
            for (let i = posY; i < posY + occupy; i++) {
                this.channels[i].queue.push(result)
                this.channels[i].step = result.step
                this.channels[i].restSpace -= result.width
            }
            result.channel_id = [posY, occupy]
            result.top = posY * this.channelHeight
            result.el.style.top = result.top + 'px'
        }
        return result
    }

    removeBullet (bullet) {
        let occupy = bullet.channel_id, channel
        for (let i = occupy[0]; i < occupy[0] + occupy[1]; i++) {
            channel = this.channels[i]
            channel.queue.some((v, i) => {
                if (v.id === bullet.id) {
                    if ( i === channel.queue.length - 1) {
                        this.updateChannel(bullet, true)
                    }
                    channel.queue.splice(i, 1)
                    return true
                }
            })
        }
    }

    updateChannel (bullet, remove) {
        const channels = this.channels
        const posY = bullet.channel_id[0]
        const occupy = bullet.channel_id[1]
        const size = this.options.el && this.options.el.getBoundingClientRect()
        let channel, lastBullet
        for (let i = posY; i < posY + occupy; i++) {
            channel = channels[i]
            lastBullet = channel.queue[channel.queue.length - 1]
            if (remove) {
                channel.restSpace = 0
                channel.step = 9999
            } else {
                channel.restSpace = size.width - (lastBullet.width + lastBullet.left)
                if (channel.restSpace > 20) {
                    // 触发缓存队列弹幕生成
                    this.controller.emit('seek')
                }
            }
        }
    }
}

class Bullet {
    constructor (Controller, Channel, options) {
        const size = options.el && options.el.getBoundingClientRect()
        let el = document.createElement('span')

        this.controller = Controller
        this.channel = Channel
        this.options = options
        this.id = options.id
        this.el = el
        this.left = size.width
        this.width = options.width
        this.height = options.height
        this.scale = options.scale
        this.step = options.step
        this.end = -this.width
        
        el.textContent = options.txt
        this.el.style.color = options.color
        this.el.style.width = this.width + 'px'
        this.el.style.fontSize = options.scale + 'em'
        this.el.style.left = this.left + 'px'
        this.remove = false
        options.el.appendChild(el)
    }

    move () {
        this.left -= this.step
        this.el.style.left = this.left + 'px'
        if (this.left <= this.end && !this.remove) {
            this.remove = true
            this.options.el.removeChild(this.el)
            this.controller.emit('remove', this)
        } else {
            this.channel.updateChannel(this)
        }
    }
}
