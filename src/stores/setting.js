import alt from "flalt.js"
import SettingActions from "actions/setting.js"

const settingsConfig = {
  inputLang: "en",
  outputLang: "zh",
  theme: "light",
  primaryColor: {
    light: "#43A047",
    dark: "#2E7D32"
  },
  statusBar: true,
  chinaMode: false,
  preferredProvider: "google",
  realTime: true,
  bigTextFontSize: 50,
  recentLangList: [],
  enterKeyBehavior: "translate-and-save",
  preventingScreenLock: false,
  favoritesImported: false,
  historyImported: false,
  displayLanguage: ""
}


class SettingStore {
  constructor() {
    this.bindListeners({
      setValue: SettingActions.setValue,
      setValues: SettingActions.setValues
    })

    let initialState = {}
    Object.keys(settingsConfig).forEach(key => {
      initialState[key] = this.getInitialValue(key)
    })

    this.state = initialState

  }

  getInitialValue(name) {
    let localValue = Windows.Storage.ApplicationData.current.localSettings.values[name]
    if (typeof localValue === "undefined" || localValue == "default") {
      return settingsConfig[name]
    }
    try {
      return JSON.parse(localValue)
    }
    catch(err) {
       Windows.Storage.ApplicationData.current.localSettings.values.clear()
       Windows.Storage.ApplicationData.current.roamingSettings.values.clear()
       return settingsConfig[name]
    }
  }

  setValue({ name, value }) {
    let obj = {}
    obj[name] = value
    this.setState(obj)
    Windows.Storage.ApplicationData.current.localSettings.values[name] = JSON.stringify(value)

    if (["inputLang", "outputLang"].indexOf(name) > -1) this.updateRecentLangList(value)
  }

  setValues(obj) {
    this.setState(obj)
    Object.keys(obj).forEach(key => {
      Windows.Storage.ApplicationData.current.localSettings.values[key] = JSON.stringify(obj[key])
    })
  }

  updateRecentLangList(lang) {
    let { recentLangList } = this.state

    if ((recentLangList.indexOf(lang) < 0) && (lang != "auto")) {
      recentLangList.push(lang)
    }

    recentLangList.splice(0, recentLangList.length - 3)
    this.setValue({ name: "recentLangList", value: recentLangList })
  }

}

export default alt.createStore(SettingStore, "SettingStore")
