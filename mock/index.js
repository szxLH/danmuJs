var Mock = require('mockjs')
var fs = require('fs')
var schedule = require('node-schedule')

var rule = new schedule.RecurrenceRule()

var times = []
for(var i=0; i<60; i+=2){
    times.push(i)
}
rule.second = times

let startId = 1

let list = []

var j = schedule.scheduleJob(rule, function(){
    const data = mockBullet(startId)
    fs.writeFile('./db.json', JSON.stringify({bullet: list}, null, 2))
})

function mockBullet (start_id) {
    const data = new Mock.mock({
        'bullet|50': [
            {
                'id|+1': start_id,
                'txt': '@cword(3, 10)',
                // 'duration|1-2.1': 1,
                'duration|5': 1,
                'color': '@color',
                'scale|1':[1, 1.5, 2],
                // 'scale|1':1,
                // 'start'
            }
        ]
    })
    list = list.concat(data.bullet)
    startId += data.bullet.length
    return data
}

