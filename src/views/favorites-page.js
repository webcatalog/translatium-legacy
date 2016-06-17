import React from "react"
import ReactWinJS from "react-winjs"
import PouchDB from "pouchdb"
import Animation from "views/animation.js"
import LanguageUtils from "utils/language.js"
import TranslationActions from "actions/translation.js"
import SettingActions from "actions/setting.js"

class FavoritesPage extends React.Component {
  static contextTypes = {
    getString: React.PropTypes.func,
    settings: React.PropTypes.object,
    history: React.PropTypes.object
  }

  constructor(props) {
    super(props)
    this.state = {
      list: new WinJS.Binding.List([]),
      loading: true
    }
    this.db = new PouchDB("favorites")
  }

  handleDeleteButtonClick(toBeDeletedDoc) {

    this.state.list.every((doc, i) => {
      if (doc._id == toBeDeletedDoc._id) {
        this.state.list.splice(i, 1)
        return false
      }
      return true
    })

    this.db.remove(toBeDeletedDoc)
      .then(() => {
        if (this.state.list.length == 0) {
          this.loadData()
        }
      })
  }

  itemRenderer = ReactWinJS.reactRenderer(item => {
    return (
      <div className="app-item">
        <div className="app-control-container">
          <div className="win-h5 app-language-title">
            {this.context.getString(`/languages/${item.data.inputObj.inputLang}`)}
            <span> > </span>
            {this.context.getString(`/languages/${item.data.inputObj.outputLang}`)}
          </div>
          <div className="app-toolbar-container win-interactive">
            <ReactWinJS.ToolBar>
              <ReactWinJS.ToolBar.Button
                key="delete"
                icon=""
                label={this.context.getString("remove-from-favorites")}
                onClick={this.handleDeleteButtonClick.bind(this, item.data)}/>
            </ReactWinJS.ToolBar>
          </div>
        </div>
        <h4 className="win-h4 app-input-text">
          {item.data.outputObj.outputText}
        </h4>
        <h6 className="win-h6 app-input-text">
          {item.data.inputObj.inputText}
        </h6>
      </div>
    )
  })

  loadData() {
    let options = { include_docs: true, descending : true, limit: 10 }

    let l = this.state.list.length
    if (l > 0) {
      options.startkey = this.state.list.getAt(l - 1)._id
      options.skip = 1
    }

    this.db.allDocs(options)
      .then(response => {
        response.rows.forEach(row => {
          this.state.list.push(row.doc)
        })
        if (response.total_rows == 0) {
          this.setState({ loading: false, empty: true })
        }
        if (response.total_rows > 0) {
          if (!this.refs.listView) this.setState({ loading: false, empty: false })
          this.refs.listView.winControl._footer.style.display = (this.state.list.length == response.total_rows) ? "none" : ""
        }
      })
  }

  componentDidMount() {
    this.loadData()
  }

  handleItemInvoked(e) {
    let data = this.state.list.getAt(e.detail.itemIndex)
    TranslationActions.loadTranslation({
      inputObj: data.inputObj,
      outputObj: data.outputObj,
      favoriteId: data._id,
      loadedFrom: "favorites"
    })
    this.context.history.goBack()
  }

  handleLoadMoreButton() {
    this.loadData()
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.loading != nextState.loading || this.state.empty != nextState.empty) {
      return true
    }
    return false
  }

  render() {
    let footerComponent = (
      <div className="app-footer">
        <button
          className="win-button"
          style={{ backgroundColor: this.context.settings.primaryColor.light, color: "#fff" }}
          onClick={this.handleLoadMoreButton.bind(this)}>
          {this.context.getString("load-more")}
        </button>
      </div>
    )

    return (
      <Animation name="enterPage" className="app-history-page">
        {(() => {
          if (this.state.loading == true) {
            return (
              <progress className="win-progress-ring win-large app-ring" />
            )
          }

          if (this.state.empty == true) {
            return (
              <div className="app-empty-box">
                <div className="app-big-icon"></div>
                <h2 className="win-h2">{this.context.getString("no-favorites")}</h2>
              </div>
            )
          }

          return (
            <ReactWinJS.ListView
              ref="listView"
              className="app-list"
              style={{ height: "100%" }}
              itemDataSource={this.state.list.dataSource}
              itemTemplate={this.itemRenderer}
              layout={{ type: WinJS.UI.ListLayout }}
              tapBehavior="invokeOnly"
              onItemInvoked={this.handleItemInvoked.bind(this)}
              footerComponent={footerComponent} />
          )
        })()}
      </Animation>
    )
  }
}
export default FavoritesPage
