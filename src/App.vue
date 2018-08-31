<template>
  <div id="app" :class="isCommon?'common':''" v-longtap="{fn:vuetouch,name:'长按'}">
    <div class="main" v-show="main">
      <div class="hy">测测你在大学会遇到的五件事</div>
      <div class="top">
        <div class="top-wrap">
          <div class="top-title">在{{isCommon ? '大学' : '新华学院'}}<br/>会遇到的<span>5</span>件事</div>
          <img src="./assets/img/abook.png" alt="">
        </div>
      </div>
      <div class="bottom">
        <div class="form">
          <ul class="form-group">
            <li>
              <div>姓名</div>
              <div>
                <input placeholder="请输入姓名" v-model="name" />
              </div>
            </li>
            <li>
              <div>性别</div>
              <div>
                <span v-for="(item, index) in sex" :key="index" @click="activeIndex = item.id" :class="item.id === activeIndex ? 'active' : ''">{{item.name}}</span>
              </div>
            </li>
          </ul>
          <div class="submit" :class="disable?'disable':''" @click="submit">提交</div>
        </div>
      </div>
    </div>
    <div class="loading" v-show="loading">
      <div class="middle">
        <div class="progress">
          <span class="bar"></span>
        </div>
        <div class="dot">Loading
          <span></span>
        </div>
      </div>
    </div>
    <div class="share" v-show="share" :class="opacity?'transparent':''">
      <div class="logo" v-if="!isCommon">
        <img src="./assets/img/clogo.png" alt="">
      </div>
      <div class="list">
        <div class="list-title"><em>{{name}}</em>在{{isCommon ? '大学' : '新华学院'}}<br />会遇到的<span>五</span>件事</div>
        <ul>
          <li v-for="(value, index) in list" :key="index">{{`${index+1}. ${value}`}}</li>
        </ul>
        <div class="share-btn" v-show="shareBtn">长按保存图片，分享至朋友圈</div>
      </div>
      <div class="code">
        <div class="code-icon" v-if="isCommon">
          <div class="code-txt">长按识别二维码<br />测测你在大学会遇到的五件事</div>
          <img src="./assets/img/ccode-common.png" alt="">
        </div>
        <div class="code-icon" v-else>
          <img src="./assets/img/ccode.png" alt="">
          <div class="code-txt">长按识别二维码<br />测测你在新华学院会遇到的五件事</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import convert2canvas from './assets/js/c2c'
import { onprogress } from './assets/js/load'
import { TEXT, TEXT_COMMON } from './constants'

export default {
  name: 'app',
  data() {
    return {
      name: '',
      activeIndex: 1,
      bsubmit: false,
      main: true,
      loading: false,
      share: false,
      shareBtn: false,
      codeUrl: '',
      isCommon: false,
      opacity: true,
      list: []
    }
  },
  computed: {
    sex() {
      return [
        { id: 1, name: '男' },
        { id: 2, name: '女' }
      ]
    },
    disable() {
      return this.bsubmit || this.name.length < 1
    }
  },
  mounted() {
    const type = this.getUrlParams('type')
    const from = this.getUrlParams('from')
    if (type === 'common') {
      this.isCommon = true
    }
    if (from === 'share') {
      _hmt.push(['_trackPageview', location.pathname + location.search]);
    }

    const title = this.isCommon ? '测测你在大学会遇到的五件事' : '测测你在新华学院会遇到的五件事'
    this.changeDomTitle(title)
    this.list = this.getRandText() || []
  },
  methods: {
    vuetouch (option, evt) {
      if (evt.target.className === 'canvasImg') {
        this.stat('share-image', 'longtap')
      }
    },
    getRandText () {
      let text = this.isCommon ? TEXT_COMMON : TEXT
      let createT = () => {
        return text.sort(() => Math.random() > 0.5 ? -1 : 1).slice(0, 5)
      }
      if (this.isCommon) {
        let flag = true
        let list
        while (flag) {
          list = createT()
          let suffix = list.map(v => v.split('-')[1]).filter(_=>_)
          if (suffix.length) {
            if (suffix.length === Array.from(new Set(suffix)).length) {
              flag = false
              return list.map(v => v.replace(/-\d$/, ''))
            }
          } else {
            return list
          }
        }
      } else {
        return createT()
      }
    },
    getUrlParams(name) {
      var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)'),
        r = window.location.search.substr(1).match(reg)

      if (r != null) {
        return decodeURIComponent(r[2])
      } else {
        return null
      }
    },
    stat(category, action) {
      _hmt.push(['_trackEvent', category, action])
    },
    changeDomTitle(title) {
      // 利用iframe的onload事件刷新页面
      document.title = title

      var iframe = document.createElement('iframe')
      iframe.style.visibility = 'hidden'
      iframe.style.width = '1px'
      iframe.style.height = '1px'

      iframe.onload = function() {
          setTimeout(function() {
              document.body.removeChild(iframe)
          }, 0)
      }
      document.body.appendChild(iframe)
    },
    submit() {
      if (this.disable) return
      this.main = false
      this.bsubmit = true
      this.loading = true
      this.share = true
      this.stat('userinfo', 'click')
      onprogress(document.querySelector('.bar'), () => {
        this.loading = false
        this.opacity = false
        convert2canvas(document.querySelector('body'), () => {
          this.shareBtn = true
        })
      })
    }
  }
}
</script>
