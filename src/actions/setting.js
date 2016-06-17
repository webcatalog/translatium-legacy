import alt from "flalt.js"

class SettingActions {
  setValue({ name, value }) {
    return { name, value }
  }
  setValues(obj) {
    return obj
  }
}

export default alt.createActions(SettingActions)
