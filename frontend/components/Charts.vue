<template>

</template>

<script>
import echarts from 'echarts'

export default {
name: 'chartDisplay',
mounted () {
  this.initChart()
},
methods: {
  initChart (xData,yData, zData) {
  const colors = ['#5793f3', '#d14a61', '#675bba']
  var chartDom = document.getElementById('main');
  var myChart = echarts.init(chartDom)

  myChart.setOption({
    color: colors,
    xAxis: {
      type: 'category',
    },
    yAxis: {
      type: 'value',
      min: -5,
      max: 5
    },
    series: [
      {
        name: 'X',
        type: 'line',
        data: xData
      },
      {
        name: 'Y',
        type: 'line',
        data: yData
      },
      {
        name: 'Z',
        type: 'line',
        data: zData
      }
    ]
  })
  }
}
}
</script>

<style>

</style>
