export const state = () => ({
  sensorDatas: ''
})

export const mutations = {
  SET_MESSAGE (state, sensorDatas) {
    state.sensorDatas += sensorDatas
  }
}

export const actions = {
  FORMAT_MESSAGE ({ commit }, sensorData) {
    const sensorDataFmt = `${new Date().toLocaleString()}: ${sensorData}\r\n`
    commit('SET_MESSAGE', sensorDataFmt)
  }
}
