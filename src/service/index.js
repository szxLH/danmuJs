import axios from 'axios';

axios.defaults.timeout = 50000
axios.defaults.baseURL = ''
axios.defaults.transformRequest = [(data) => {
  let str = []
  for (let i in data) {
    str.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]))
  }
  return str.join('&')
}]

// http request 拦截器
axios.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  })

// http response 拦截器
axios.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    return Promise.reject(error.response.data)
  })

export const doFetch = (_start = 0, _limit = 10) => {
    return axios({
        url: '/bullet',
        params: {
            _start, _limit
        }
    })
}
