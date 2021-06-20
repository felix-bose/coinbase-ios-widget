// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// Version 1.0.0
// icon-color: red; icon-glyph: copyright;

/**
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * AUTHOR: https://github.com/felix-schaipp - https://github.com/felix-schaipp/coinbase-ios-widget/
 * ISSUES: https://github.com/felix-schaipp/coinbase-ios-widget/issues
 *
 */

const ENV = {
  theme: 'light', // default is light will be set according to iOS
  themes: {
    light: {
      mainBackgroundColor: '#1652f0',
      secondaryBackgroundColor: '#7192eb',
      graphColor: '#5e5e5e',
      titleTextColor: '#fefefe',
      dateTextColor: '#e6e8fa',
      grey: '#888888',
      red: '#d68186',
      green: '#81d697',
    },
    dark: {
      mainBackgroundColor: '#1652f0',
      secondaryBackgroundColor: '#7192eb',
      graphColor: '#5e5e5e',
      titleTextColor: '#fefefe',
      dateTextColor: '#e6e8fa',
      grey: '#888888',
      red: '#d68186',
      green: '#81d697',
    },
  },
  portfolioDevelopment: {
    red: { limit: 50, color: 'red' },
    green: { limit: 1, color: 'green' },
    gray: { limit: 0, color: 'gray' },
  },
  fonts: {
    xxlarge: Font.boldSystemFont(35),
    xlarge: Font.boldSystemFont(26),
    large: Font.mediumSystemFont(20),
    medium: Font.mediumSystemFont(14),
    normal: Font.mediumSystemFont(12),
    small: Font.boldSystemFont(11),
    small2: Font.boldSystemFont(10),
    xsmall: Font.boldSystemFont(9),
  },
  status: {
    offline: 418,
    notfound: 404,
    error: 500,
    ok: 200,
    fromcache: 418,
  },
  graphShowDays: 21, // show days in graph
  isMediumWidget: config.widgetFamily === 'medium',
  isSameState: false,
  cache: {},
  coinbaseApiKey: '', // will be set as input of the widget
  coinbaseApiSecret: '', // will be set as input of the widget
  currency: 'EUR', // default, will be overwritten by the coinbase api
  coinbaseId: null, // your coinbase user id
  language: 'en',
  isDevelopment: true,
  script: {
    filename: this.module.filename.replace(/^.*[\\\/]/, ''),
    updateStatus: '',
    refreshInterval: 60, // refresh after 1min (in seconds)
    selfUpdate: true,
  },
}

class Theme {
  static getCurrentTheme() {
    let theme = 'light'
    if (ENV.theme === 'dark') {
      theme = 'dark'
    }
    return theme
  }
  static getColor(colorName) {
    const theme = Theme.getCurrentTheme()
    return new Color(ENV.themes[theme][colorName])
  }
  static setColor(object, propertyName, colorName) {
    const theme = Theme.getCurrentTheme()
    object[propertyName] = new Color(ENV.themes[theme][colorName])
  }
  static setGradient(object, lightColor, darkColor) {
    let gradient = new LinearGradient()
    gradient.colors = [lightColor, darkColor]
    gradient.locations = [0, 1]
    object.backgroundGradient = gradient
  }
}

class Widget {
  constructor() {
    this.loadConfig()
    if (args.widgetParameter && args.widgetParameter.length == 2)
      // TODO get and parse input
      ENV.coinbaseApiKey = Parse.input(args.widgetParameter[0])
    ENV.coinbaseApiSecret = Parse.input(args.widgetParameter[1])
    if (typeof ENV.coinbaseApiKey == null) Helper.log('No api key provided')
    if (typeof ENV.coinbaseApiSecret == null)
      Helper.log('No api secret provided')
    ENV.isMediumWidget = false
    Helper.log('Current Theme:', Theme.getCurrentTheme())
    // this.selfUpdate()
  }
  async init() {
    this.widget = await this.createWidget()
    this.widget.setPadding(0, 0, 0, 0)

    if (!config.runsInWidget) {
      ENV.isMediumWidget
        ? await this.widget.presentMedium()
        : await this.widget.presentSmall()
    }
    Script.setWidget(this.widget)
    Script.complete()
  }
  async createWidget() {
    const list = new ListWidget()

    Theme.setGradient(
      list,
      Theme.getColor('secondaryBackgroundColor'),
      Theme.getColor('mainBackgroundColor')
    )

    let balance = 190.2
    // if (ENV.coinbaseApiKey && ENV.coinbaseApiSecret) {
    //   const coinbaseApi = new CoinbaseApi()
    //   balance = await coinbaseApi.getCurrentBalance()
    // }

    // UI ===============
    let topBar = new UI(list).stack('h')
    // graph
    let leftTopBar = new UI(topBar).stack('v')
    UIComponent.graph(leftTopBar)
    // name -> coinbase
    let rightTopBar = new UI(topBar).stack('v')
    rightTopBar.text('Coinbase', ENV.fonts.small2)

    let middleContainer = new UI(list).stack('h', [20, 0, 20, 0])
    let leftMiddleContainer = new UI(middleContainer).stack('v')
    // balance
    const formatedBalance = Format.number(balance)
    leftMiddleContainer.text(`${formatedBalance}€`, ENV.fonts.xxlarge)
    leftMiddleContainer.textColor = UIComponent.getBalanceColor()

    // time since refresh
    let bottomContainer = new UI(list).stack('h')
    let leftBottomContainer = new UI(bottomContainer).stack('v')

    // TODO add cache date
    const lastUpdate = 60 * 1000
    const timeSinceUpdate = Helper.getTimeSince(
      new Date(Date.now() - lastUpdate)
    )
    leftBottomContainer.text(
      `${timeSinceUpdate} ago`,
      ENV.fonts.xsmall,
      Theme.getColor('dateTextColor')
    )

    // error handling
    // if (statusPos0 === ENV.status.error || statusPos1 === ENV.status.error) {
    //   topBar.space()
    //   list.addSpacer()
    //   let statusError = new UI(list).stack('v', [4, 6, 4, 6])
    //   statusError.text('⚡️', ENV.fonts.medium)
    //   statusError.text(
    //     'Could not connect to coinbase. \nNo cache available. \n\nTry again later.',
    //     ENV.fonts.small,
    //     Theme.getColor('titleTextColor')
    //   )
    //   list.addSpacer(4)
    //   list.refreshAfterDate = new Date(
    //     Date.now() + (ENV.script.refreshInterval / 2) * 1000
    //   )
    //   return list
    // }

    // automatically refresh the widget in seconds
    this.refreshWidget(list, ENV.script.refreshInterval)

    return list
  }
  refreshWidget(widget, refreshTime) {
    const date = new Date()
    widget.refreshAfterDate = new Date(date.getSeconds() + refreshTime)
  }
  async selfUpdate() {
    if (!ENV.script.selfUpdate) return
    Helper.log('script selfUpdate', 'running')
    let url =
      'https://raw.githubusercontent.com/felix-schaipp/coinbase-ios-widget/main/portfolio.js'
    let request = new Request(url)
    let filenameBak = ENV.script.filename.replace('.js', '.bak.js')
    try {
      let script = await request.loadString()
      if (script !== '') {
        if (cfm.fm.fileExists(filenameBak)) await cfm.fm.remove(filenameBak)
        cfm.copy(ENV.script.filename, filenameBak)
        script = script.replace(
          'scriptSelfUpdate: false',
          'scriptSelfUpdate: true'
        )
        cfm.save(script, ENV.script.filename)
        ENV.script.updateStatus = 'updated'
        Helper.log('script selfUpdate', ENV.script.updateStatus)
      }
    } catch (e) {
      console.warn(e)
      if (cfm.fm.fileExists(filenameBak)) {
        // await cfm.fm.copy(filenameBak, ENV.script.filename)
        // await cfm.fm.remove(filenameBak)
        ENV.script.updateStatus = 'loading failed, rollback?'
        Helper.log('script selfUpdate', ENV.script.updateStatus)
      }
    }
  }
  async loadConfig() {
    let path = cfm.fm.joinPath(cfm.configPath, 'config.json')
    if (cfm.fm.fileExists(path)) {
      Helper.log('Loading config.json (defaults will be overwritten)')
      const config = await cfm.read('config')
      if (
        typeof config.data.themes !== 'undefined' &&
        typeof config.data.themes.dark !== 'undefined'
      ) {
        ENV.themes.dark = Object.assign(
          ENV.themes.dark,
          config.data.themes.dark
        )
      }
      Object.keys(ENV.themes).forEach((theme) => {
        if (
          typeof config.data.themes !== 'undefined' &&
          typeof config.data.themes[theme] !== 'undefined'
        ) {
          Helper.log('Loading custom theme from config.json: ' + theme)
          ENV.themes[theme] = Object.assign(
            ENV.themes[theme],
            config.data.themes[theme]
          )
        }
      })
      if (config.status === ENV.status.ok) ENV = Object.assign(ENV, config.data)
    }
  }
}

class DataResponse {
  constructor(data, status = ENV.status.ok) {
    this.data = data
    this.status = status
  }
}

class CustomFilemanager {
  constructor() {
    try {
      this.fm = FileManager.iCloud()
      this.fm.documentsDirectory()
    } catch (e) {
      this.fm = FileManager.local()
    }
    this.configDirectory = 'coinbasePortfolioWidget'
    this.configPath = this.fm.joinPath(
      this.fm.documentsDirectory(),
      '/' + this.configDirectory
    )
    if (!this.fm.isDirectory(this.configPath))
      this.fm.createDirectory(this.configPath)
  }
  async copy(oldFilename, newFilename) {
    let oldPath = this.fm.joinPath(this.configPath, oldFilename)
    let newPath = this.fm.joinPath(this.configPath, newFilename)
    this.fm.copy(oldPath, newPath)
  }
  async save(data, filename = '') {
    let path
    let dataStr
    if (filename === '') {
      path = this.fm.joinPath(
        this.configPath,
        'coinbaseWidget_' + data.dataId + '.json'
      )
      dataStr = JSON.stringify(data)
    } else {
      path = this.fm.joinPath(this.fm.documentsDirectory(), filename)
      dataStr = data
    }
    this.fm.writeString(path, dataStr)
  }
  async read(filename) {
    let path = this.fm.joinPath(this.configPath, filename + '.json')
    let type = 'json'
    if (filename.includes('.')) {
      path = this.fm.joinPath(this.fm.documentsDirectory(), filename)
      type = 'string'
    }
    if (this.fm.isFileStoredIniCloud(path) && !this.fm.isFileDownloaded(path))
      await this.fm.downloadFileFromiCloud(path)
    if (this.fm.fileExists(path)) {
      try {
        let resStr = await this.fm.readString(path)
        let res = type === 'json' ? JSON.parse(resStr) : resStr
        return new DataResponse(res)
      } catch (e) {
        console.error(e)
        return new DataResponse('', ENV.status.error)
      }
    }
    return new DataResponse('', ENV.status.notfound)
  }
}

class Format {
  static dateStr(timestamp, showYear = true) {
    let date = new Date(timestamp)
    let dateStr = `${('' + date.getDate()).padStart(2, '0')}.${(
      '' +
      (date.getMonth() + 1)
    ).padStart(2, '0')}`
    if (showYear) dateStr += `.${date.getFullYear()}`
    return dateStr
  }
  static getFormattedDate(date) {
    if (!date) return
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${date.getDate()}`
  }
  static number(number, fractionDigits = 0, placeholder = null, limit = false) {
    if (!!placeholder && number === 0) return placeholder
    if (limit !== false && Math.round(number) >= limit) fractionDigits = 0
    return Number(number).toLocaleString('de-DE', {
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    })
  }
  static timestamp(dateStr) {
    const regex = /([\d]+)\.([\d]+)\.([\d]+),\ ([0-2]?[0-9]):([0-5][0-9])/g
    let m = regex.exec(dateStr)
    return new Date(m[3], m[2] - 1, m[1], m[4], m[5]).getTime()
  }
}

class CoinbaseApi {
  constructor() {
    this.rootURI = 'https://api.coinbase.com/'
    this.method = 'GET'
    this.body = ''
  }

  createOptions({ endpoint, signature, timestamp }) {
    // TODO change with new middleware
    return {
      baseURL: this.rootURI,
      url: endpoint,
      method: this.method,
      headers: {
        'CB-ACCESS-SIGN': signature,
        'CB-ACCESS-TIMESTAMP': timestamp,
        'CB-ACCESS-KEY': ENV.coinbaseApiKey,
        'CB-VERSION': '2015-07-22',
        'Content-Type': 'application/json',
        'Accept-Language': ENV.language,
      },
    }
  }

  createError(errors) {
    // handle middleware errors
    if (!errors || errors?.length == 0) {
      return {
        message: 'No error present.',
      }
    }
    const error = errors[0]
    const { errodId, message, code } = ENV.coinbaseErrorCodes.find(
      (coinbaseErrorCode) => (coinbaseErrorCode.errorId = error.id)
    )
    return {
      message,
      errodId,
      code,
      url: error.url ? error.url : '',
    }
  }

  getOptions(endpoint) {
    const timestamp = Math.floor(Date.now() / 1000)
    const message = this.createMessage({ timestamp, endpoint })
    const signature = this.createSignature(message)
    return this.createOptions({ timestamp, endpoint, signature })
  }

  async request(options) {
    const url = `${options.baseURL}${options.endpoint}`
    let request = new Request(url)
    request.method = options.method
    request.headers = options.headers
    let response = await request.loadJSON()
    return response.status == ENV.status.ok ? response.body : null
  }
}

class Helper {
  static getDateBefore(days) {
    let offsetDate = new Date()
    offsetDate.setDate(new Date().getDate() - days)
    return offsetDate.toISOString().split('T').shift()
  }
  static log(...data) {
    console.log(data.map(JSON.stringify).join(' | '))
  }
  static getWeek(timestamp) {
    const date = new Date(timestamp)
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
    var week1 = new Date(date.getFullYear(), 0, 4)
    return (
      1 +
      Math.round(
        ((date.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7
      )
    )
  }
  static getLastThreeDays() {
    const today = new Date()
    const yesterday = new Date(today.setDate(today.getDate() - 1))
    const twoDaysAgo = new Date(today.setDate(today.getDate() - 2))
    const threeDaysAgo = new Date(today.setDate(today.getDate() - 3))
    return [yesterday, twoDaysAgo, threeDaysAgo].map((d) =>
      Format.getFormattedDate(d)
    )
  }
  static getTimeSince(date) {
    let seconds = Math.floor((new Date() - date) / 1000)

    let interval = seconds / 31536000

    if (interval > 1) {
      return Math.floor(interval) + ' years'
    }
    interval = seconds / 2592000
    if (interval > 1) {
      return Math.floor(interval) + ' months'
    }
    interval = seconds / 86400
    if (interval > 1) {
      return Math.floor(interval) + ' days'
    }
    interval = seconds / 3600
    if (interval > 1) {
      return Math.floor(interval) + ' hrs'
    }
    interval = seconds / 60
    if (interval > 1) {
      return Math.floor(interval) + ' min'
    }
    return Math.floor(seconds) + ' seconds'
  }
}

class UIComponent {
  static graph(view) {
    let r = new UI(view).stack('h', [0, 0, 0, 10], false, 12)
    const graphImg = UI.generateGraph(
      [190, 200, 203, 177, 188, 109],
      58,
      10,
      false
    ).getImage()
    r.image(graphImg, 0.9)
  }

  static getGraphColor() {
    const theme = Theme.getCurrentTheme()
    return new Color(ENV.themes[theme].graphColor)
  }
  static getBalanceColor() {
    const theme = Theme.getCurrentTheme()
    return new Color(ENV.themes[theme].titleTextColor)
  }
  static statusBlock(view, status) {
    let icon
    let iconText
    switch (status) {
      case ENV.status.offline:
        icon = '⚡️'
        iconText = 'Offline'
        break
    }
    if (icon && iconText) {
      let topStatusStack = new UI(view).stack('v')
      topStatusStack.text(icon, ENV.fonts.small)
    }
  }
}

class UI {
  constructor(view) {
    if (view instanceof UI) {
      this.view = this.elem = view.elem
    } else {
      this.view = this.elem = view
    }
  }
  // TODO generate line instead of rect
  static generateGraph(data, width, height, alignLeft = true) {
    let graphData = data.slice(Math.max(data.length - ENV.graphShowDays, 1))
    let context = new DrawContext()
    context.size = new Size(width, height)
    context.opaque = false
    context.respectScreenScale = true
    let max = Math.max.apply(
      Math,
      graphData.map(function (d) {
        return d
      })
    )
    max = max <= 0 ? 10 : max
    let w = Math.max(
      2,
      Math.round((width - graphData.length * 2) / graphData.length)
    )
    let xOffset = !alignLeft ? width - graphData.length * (w + 1) : 0
    for (let i = 0; i < ENV.graphShowDays; i++) {
      let value = graphData[i]
      if (value === -1 && i == 0) value = 10
      let h = Math.max(2, (Math.abs(value) / max) * height)
      let x = xOffset + (w + 1) * i
      let rect = new Rect(x, height - h, w, h)
      context.setFillColor(UIComponent.getGraphColor())
      context.fillRect(rect)
    }
    return context
  }
  stack(
    type = 'h',
    padding = false,
    borderBgColor = false,
    radius = false,
    borderWidth = false,
    size = false
  ) {
    this.elem = this.view.addStack()
    if (radius) this.elem.cornerRadius = radius
    if (borderWidth !== false) {
      this.elem.borderWidth = borderWidth
      this.elem.borderColor = borderBgColor
    } else if (borderBgColor) {
      this.elem.backgroundColor = borderBgColor
    }
    if (padding) this.elem.setPadding(...padding)
    if (size) this.elem.size = new Size(size[0], size[1])
    if (type === 'h') {
      this.elem.layoutHorizontally()
    } else {
      this.elem.layoutVertically()
    }
    this.elem.centerAlignContent()
    return this
  }
  text(text, font = false, color = false, maxLines = 0, minScale = 0.9) {
    let t = this.elem.addText(text)
    if (color)
      t.textColor = typeof color === 'string' ? new Color(color) : color
    t.font = font ? font : ENV.fonts.normal
    t.lineLimit = maxLines > 0 && minScale < 1 ? maxLines + 1 : maxLines
    t.minimumScaleFactor = minScale
    return this
  }
  image(image, imageOpacity = 1.0) {
    let i = this.elem.addImage(image)
    i.resizable = false
    i.imageOpacity = imageOpacity
  }
  space(size) {
    this.elem.addSpacer(size)
    return this
  }
  static getTrendUpArrow(now, prev) {
    if (now < 0 && prev < 0) {
      now = Math.abs(now)
      prev = Math.abs(prev)
    }
    return now < prev ? '↗' : now > prev ? '↑' : '→'
  }
  static getTrendArrow(value1, value2) {
    return value1 < value2 ? '↓' : value1 > value2 ? '↑' : '→'
  }
  static getTrendColor(value1, value2, altColorUp = null, altColorDown = null) {
    let colorUp = altColorUp
      ? new Color(altColorUp)
      : Theme.getColor(ENV.incidenceColors.red.color, true)
    let colorDown = altColorDown
      ? new Color(altColorDown)
      : Theme.getColor(ENV.incidenceColors.green.color, true)
    return value1 < value2
      ? colorDown
      : value1 > value2
      ? colorUp
      : Theme.getColor(ENV.incidenceColors.gray.color, true)
  }
}

// const cfm = new CustomFilemanager()

await new CoinbaseWidget().init()
