<template>
 <div>
 <div id="main" style="width: 600px;height: 400px;"></div>
 <div class="container">
   <div class="row">
     <div class="col-sm">
       One of three columns
     </div>
     <div class="col-sm">
       One of three columns
     </div>
     <div class="col-sm">
       One of three columns
     </div>
   </div>
 </div>
 </div>
</template>

<script>
import { mapState } from 'vuex'
import chartDisplay from '~/components/Charts.vue'

export default {
  name: 'IndexPage',
  data () {
    return {
      activeSensors: [],
      cbmBoards: [],
      connStatus: false,
      devicesCount: 0,
      xData: [],
      yData: [],
      zData: [],
      batteryData: [],
      temperatureData: [],
      modulePacketLength: []
    }
   },
   computed: mapState(['sensorDatas']),
   mounted () {
       this.openSocketListeners()
   },
  methods: {
    openSocketListeners () {
      this.socket = this.$nuxtSocket({
        // channel: '/'
      })
      this.socket.on('connect', () => {
         this.connStatus = true
        //this.activeSensors = []
        //chartDisplay.methods.initChart()
        console.log('Index: Socket Connected')
      })
      this.socket.on('disconnect', () => {
        console.log('Index: Socket Disconnected')
        this.connStatus = false
        this.openSocketListeners()
        //this.activeSensors = []
      })
      this.socket.on('sensorData', (sensorData) => {
        this.processData(sensorData)
        chartDisplay.methods.initChart(this.xData, this.yData, this.zData)
      })
    },
    countActiveSensors (cbmBoard) {
      let total = 0
      for (let i = 0; i < cbmBoard.length; i++) {
        total = total + cbmBoard[i].sensors.length
      }
      this.devicesCount = total
      // this.$emit('update-sensors', this.activeSensors)
      this.$emit('update-counts', this.devicesCount)
    },
    addNewDevice (device, cbmBoard) {
          for (let i = 0; i < cbmBoard.length; i++) {
            if (cbmBoard[i].moduleId === device.moduleId) {
              this.cbmBoards[i].sensors.push(device.sensorId)
            }
          }
    },
    // Check if board already in cbm board list
    searchCBMBoard (nameKey, myArray) {
      for (let i = 0; i < myArray.length; i++) {
        if (myArray[i].moduleId === nameKey.moduleId) {
          return true // moduleId is already in the moduleSensorList
        }
      }
    },
    // Check if CBM has defined total Packet Length
    searchCBMPacketLength (nameKey, myArray) {
      for (let i = 0; i < myArray.length; i++) {
        if (myArray[i].moduleId === nameKey.moduleId) {
          return true // moduleId is already in the moduleSensorList
        }
      }
    },
    searchDeviceInBoard (device, boardlist) {
      for (let i = 0; i < boardlist.length; i++) {
        if (boardlist[i].moduleId === device.moduleId) {
          // loop the sensors inside
          for (let j = 0; j < boardlist[i].sensors.length; j++) {
            if (boardlist[i].sensors[j] === device.sensorId) {
              return true
            }
          }
        }
      }
      return false
    },
    appendDeviceData(data){
    //console.log('current activeSensors', data)
      if(data.moduleId === '0423456789' && data.sensor !== 'battery' && data.sensor !== 'temperature'){
        //console.log('current activeSensors', data)
        if ( this.xData.length < 2048 || this.yData.length < 2048 || this.zData.length < 2048){
            for (let i = 0; i < 8; i++) {
              this.xData.push(data.data.x[i])
            }
            for (let i = 0; i < 8; i++) {
              this.yData.push(data.data.y[i])
            }
            for (let i = 0; i < 8; i++) {
              this.zData.push(data.data.z[i])
            }
        }
        else{
          this.xData.splice(0,8)
          this.yData.splice(0,8)
          this.zData.splice(0,8)
          for (let i = 0; i < 8; i++) {
            this.xData.push(data.data.x[i])
          }
          for (let i = 0; i < 8; i++) {
            this.yData.push(data.data.y[i])
          }
          for (let i = 0; i < 8; i++) {
            this.zData.push(data.data.z[i])
          }
        }
        //console.log('current boardNumber', data.moduleId)
        //console.log('MessageNumber', data.data.MessageNumber)
        //console.log('x', data.data.x)
        //console.log('y', data.data.y)
        //console.log('z', data.data.z)
        //console.log('x', this.xData)
        //console.log('y', this.yData)
        //console.log('z', this.zData)
      }
    },
    processData (sensorData) {
        const data = JSON.parse(sensorData)
        //console.log('data', data)
        if (data.sensor) {
          if (!this.searchCBMBoard(data, this.cbmBoards)) {
            this.cbmBoards.push({ moduleId: data.moduleId, sensors: [data.sensorId] })
          } else if (!this.searchDeviceInBoard(data, this.cbmBoards)) {
            // add the device to the cbmBoards object
            this.addNewDevice(data, this.cbmBoards)
          }
          this.countActiveSensors(this.cbmBoards)
          // Format sensor data
          if (data.sensor === 'temperature' || data.sensor === 'battery') {
            this.activeSensors = { data: JSON.parse(data.data), moduleId: data.moduleId, sensor: data.sensor, sensorId: data.sensorId }
          } else {
            this.activeSensors = data
          }
          this.$emit('update-sensors', this.activeSensors)
          this.$emit('update-modules', this.cbmBoards)
        }
        if(data.totalPacket){
          if (!this.searchCBMPacketLength(data, this.modulePacketLength)) {
            this.modulePacketLength.push({ moduleId: data.moduleId, totalPacket: [data.totalPacket] })
            console.log('module PacketLength', this.modulePacketLength)
          }
          else {
            for (let i = 0; i < this.modulePacketLength.length; i++) {
              if (this.modulePacketLength[i].totalPacket !== data.totalPacket && data.moduleId === this.modulePacketLength.moduleId){
                this.modulePacketLength.splice(i,1)
                this.modulePacketLength.push({ moduleId: data.moduleId, totalPacket: [data.totalPacket] })
                console.log('module PacketLength', this.modulePacketLength)
              }
            }
          }
        }
        this.appendDeviceData(this.activeSensors)

        //console.log('current cbmBoards', this.cbmBoards)
        //console.log('current activeSensors', this.activeSensors)
    }
 }//methods end
}//export end
</script>
