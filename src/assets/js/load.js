
// 初始进度，1%
let progress = 1

// 生成随机数
// let random = function(min, max){
//     return Math.floor(Math.random() * (max - min + 1) + min)
// }

// 跑进度
export const onprogress = function (dom, callback) {
    let timer
    clearInterval(timer)
    timer = setInterval(function () {
        // 随机进度
        progress += 1

        if(progress >= 100){
            progress = 100
            clearInterval(timer)
            callback()
        }
        dom.style.width = progress + '%'
        
    }, 30)
}
