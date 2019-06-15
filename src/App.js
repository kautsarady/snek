import React from 'react';

const COLUMNS = 10
const ROWS = 10

class App extends React.Component {

  spawnFoodTickerTimeout = null

  snakeCrawlTickerTimeout = null

  state = {
    foodPos: Math.floor(Math.random() * ((COLUMNS * ROWS) - 1)),
    snake: [{ pos: 0, dir: 68 }],
    route: {}
  }

  componentDidMount() {
    this.spawnFoodTicker()
    this.snakeCrawlTicker()
    document.addEventListener("keydown", this.controller)
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.controller)
  }

  controller = (event) => {
    if (event.isComposing || ![87, 65, 83, 68, 38, 37, 40, 39].includes(event.keyCode)) return
    this.setState(prev => {
      if (prev.snake[0].dir !== event.keyCode) prev.route[prev.snake[0].pos] = event.keyCode
      prev.snake[0].dir = event.keyCode
      return prev
    }, () => this.snakeCrawl(this.snakeCrawlTicker))
  }

  snakeCrawlTicker = () => {
    const { foodPos, snake } = this.state
    if (foodPos === snake[0].pos) this.incerementScore(() => this.spawnFood(this.spawnFoodTicker))
    const snakeCrawlTickerTimeout = setTimeout(() => this.snakeCrawl(this.snakeCrawlTicker), 500)
    this.snakeCrawlTickerTimeout = snakeCrawlTickerTimeout
  }

  spawnFoodTicker = () => {
    const spawnFoodTickerTimeout = setTimeout(() => this.spawnFood(this.spawnFoodTicker), 5000)
    this.spawnFoodTickerTimeout = spawnFoodTickerTimeout
  }

  snakeCrawl = (callback = null) => this.setState(prev => {
    const _isDigesting = !!prev.snake.find(({ pos }, i, arr) => i !== arr.length - 1 && pos === arr[arr.length - 1].pos)
    const crawler = ({ pos, dir }, route = {}) => {
      if (route.hasOwnProperty(pos)) dir = route[pos]
      switch (dir) {
        // UP
        case 38:
        case 87: pos = pos - COLUMNS < 0 ? pos + ((COLUMNS * ROWS) - COLUMNS) : pos - COLUMNS; break;
        // LEFT
        case 37:
        case 65: pos = pos % ROWS === 0 ? pos + (ROWS - 1) : pos - 1; break;
        // DOWN
        case 40:
        case 83: pos = pos + COLUMNS >= (COLUMNS * ROWS) ? pos - ((COLUMNS * ROWS) - COLUMNS) : pos + COLUMNS; break;
        // RIGHT
        case 39:
        case 68: pos = (pos + 1) % ROWS === 0 ? pos - (ROWS - 1) : pos + 1; break;
        // DEFAULT
        default: ; break;
      }
      return { pos, dir }
    }
    prev.snake = prev.snake.map((pod, i, arr) => {
      if (_isDigesting && i === arr.length - 1) return pod
      return crawler(pod, i !== 0 ? prev.route : {})
    })
    return prev
  }, () => {
    clearTimeout(this.snakeCrawlTickerTimeout)
    callback && callback()
  })

  spawnFood = (callback = null) => this.setState({ foodPos: Math.floor(Math.random() * ((COLUMNS * ROWS) - 1)) }, () => {
    clearTimeout(this.spawnFoodTickerTimeout)
    callback && callback()
  })

  incerementScore = (callback = null) => this.setState(prev => Object.assign(prev, { snake: prev.snake.concat(prev.snake[0]) }), callback)

  render() {
    const { foodPos, snake } = this.state
    const snakeaPodPos = snake.map(({ pos }) => pos)
    return (
      <div style={{
        height: "100vh",
        width: "100vw",
        background: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <h3>Score: {snake.length}</h3>
        <div style={{
          width: "60vw",
          height: "80vh",
          background: "#e6e6e6",
          display: "grid",
          gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`
        }}>
          {
            new Array(COLUMNS * ROWS).fill(0).map((_, i) => {
              const _isPod = snakeaPodPos.includes(i)
              return (
                <div id={i} onClick={this.handleClick} style={{
                  border: "1px solid black",
                  width: "100%",
                  height: "100%",
                  background: snakeaPodPos[0] === i ? "indigo" : foodPos === i && _isPod ? "red" : foodPos === i ? "yellow" : _isPod ? "black" : ""
                }} />
              )
            })
          }
        </div>
      </div>
    )
  }
}

export default App;
