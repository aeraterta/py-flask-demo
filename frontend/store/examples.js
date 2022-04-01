export const state = () => ({
  sensorData: '',
  sensorList: []
})

export const mutations = {
  SET_PROGRESS (state, progress) {
    state.progress = progress
  },

  SET_SOMEOBJ (state, someObj) {
    Object.assign(state, { someObj })
  }
}
