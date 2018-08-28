<template>
  <div id="app" class="page">
    <div class="container">
      <div class="video" @click="togglePlay">{{playTime}}</div>
      <div class="danmu" v-show="bDanmu" @click="togglePlay"></div>
      <div class="control" @click="toggleDanmu">{{`点我${bDanmu ? '隐藏' : '显示'}弹幕`}}</div>
    </div>
  </div>
</template>
<script>
import Video from './assets/js/video';
import Danmu from './assets/js/danmu';
import { doFetch } from './service';

const LIMIT = 100

export default {
  name: 'home',
  data() {
    return {
      bDanmu: false,
      bPlay: false,
      bStart: false,
      playTime: 0,
      video: null,
      danmu: null,
      bEnd: false,
      danmuTxt: ''
    }
  },
  mounted() {
    const oDanmuWrap = document.querySelector('.danmu')
    this.video = new Video({
      total: 20, // 播放总时长
      update: (val) => {
        this.playTime = val
      }
    })
    this.danmu = new Danmu(this.video, {
      el: oDanmuWrap,
      fontSize: 14,
      fetch: this.fetch,
      delay: 1000
    })
    this.video.on('ended', this.onEnded)
  },
  methods: {
    togglePlay() {
      if (this.bEnd) return

      this.bPlay = !this.bPlay
      if (!this.bStart) {
        this.bStart = true
        this.bDanmu = true
        this.$nextTick(() => {
          this.danmu.emit('start')
          this.video.emit('start')
        })
        return
      }
      if (this.bPlay) {
        this.danmu.emit('play')
        this.video.emit('play')
      }
      if (!this.bPlay) {
        this.danmu.emit('pause')
        this.video.emit('pause')
      }
    },

    toggleDanmu() {
      if (this.bEnd) return
      this.bDanmu = !this.bDanmu
      if (!this.bDanmu) {
        this.danmu.emit('clear')
      } else {
        this.danmu.emit('play')
      }
    },

    async fetch(start) {
      return await doFetch(start, LIMIT)
    },

    onEnded() {
      this.bEnd = true
    }
  }
}
</script>

<style lang='scss'>
.container {
  position: relative;
  border: 1px solid #ccc;
  width: 600px;
  height: 380px;
  margin: 50px auto 0;
  overflow: hidden;
}
.video {
  height: 100%;
  font-size: 30px;
  text-align: center;
  color: #ccc;
}
.danmu {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 30px;
  z-index: 5;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  font-size: 14px;
  span {
    position: absolute;
  }
}
.control {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 10;
  width: 100%;
  height: 30px;
  text-align: center;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.75);
}
</style>
