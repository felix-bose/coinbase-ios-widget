# Coinbase widget for ios (scribtable)

Get direct information about your portfolio value on the homescreen.

Took [this](https://raw.githubusercontent.com/rphl/corona-widget/master) widget as a starting point and inspiration.

# TODOs

This widget is still WIP. Here is what needs to be done to get everything working:
- [ ] Add authentication to the middleware
- [ ] Add logger to middleware
- [ ] Check implementation of middleware
- [ ] Rebuild widget without the api functionality
- [ ] Add cache to the widget
- [ ] Test the widget on the iphone



# features

- iCloud Sync (Optional)
- Dark/Lighmode (_config_)
- Autoupdate
- **"Themes"**: Colors. (_config_)
- ...

# installation/update

**manual**

- open browser: https://raw.githubusercontent.com/felix-schaipp/coinbase-ios-widget/main/widget.js
- copy script
- open scribtable and paste the copied text as a new scriptable script

**update**

- If `scriptSelfUpdate: true ` the script autoupdates itself to newer version (You can unsubsribe by setting `scriptSelfUpdate: false`)

# config

- Data will be saved under **Files (App)** > **iCloud** > **Scriptable** > **coinbasePortfolioWidget** > \*.json
- General config can be set via **WidgetParameter**:

**light theme**

```json
{
  "themes": {
    "light": {
      "mainBackgroundColor": "#1652f0",
      "stackBackgroundColor": "#99999920",
      "stackBackgroundColorSmall": "#99999915",
      "stackBackgroundColorSmallTop": "#99999900",
      "areaIconBackgroundColor": "#99999930",
      "titleTextColor": new Color("#113353", 0.3),
      "dateTextColor": "#777777",
      "dateTextColor2": "#777777",
      "graphTextColor": "#888888",
    }
  }
}
```

**dark theme:**

```json
{
    "themes": {
        "dark": {
          "mainBackgroundColor": "#1652f0",
          "stackBackgroundColor": "#99999920",
          "stackBackgroundColorSmall": "#99999915",
          "stackBackgroundColorSmallTop": "#99999900",
          "areaIconBackgroundColor": "#99999930",
          "titleTextColor": new Color("#113353", 0.3),
          "dateTextColor": "#777777",
          "dateTextColor2": "#777777",
          "graphTextColor": "#888888",
        }
    }
}
```
