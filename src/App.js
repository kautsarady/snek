import React from 'react';

const COLUMNS = 10
const ROWS = 10
const SNAKE_CRAWL_INTERVAL = 500
const FOOD_SPAWN_INTERVAL = 5000

class App extends React.Component {

  spawnFoodTickerTimeout = null
  snakeCrawlTickerTimeout = null

  state = {
    foodPos: Math.floor(Math.random() * ((COLUMNS * ROWS) - 1)),
    snake: [{ pos: 0, dir: 68 }],
  }

  componentDidMount() {
    // Set keyboard listener
    document.addEventListener("keydown", this.controller)
    // Start food spawner ticker
    this.spawnFoodTicker()
    // Start snake crawl ticker
    this.snakeCrawlTicker()
  }

  // Clear listener
  componentWillUnmount() {
    document.removeEventListener("keydown", this.controller)
  }

  controller = (event) => {
    // W, A, S, D, Arrows (Up, Left, Down, Right)
    if (event.isComposing || ![87, 65, 83, 68, 38, 37, 40, 39].includes(event.keyCode)) return
    clearTimeout(this.snakeCrawlTickerTimeout)
    this.setState(prev => {
      prev.snake[0].dir = event.keyCode
      return prev
    }, () => this.snakeCrawl(this.snakeCrawlTicker))
  }

  // Snake crawl ticker
  snakeCrawlTicker = () => {
    const { foodPos, snake } = this.state

    // Check if snake reach / eat the food
    if (foodPos === snake[0].pos) this.incerementScore()
    // Check if snake hit its own pods
    if (snake.find(({ pos }, i, arr) => (i !== 0 && i !== arr.length - 1) && pos === arr[0].pos)) this.handleCollide()

    const snakeCrawlTickerTimeout = setTimeout(() => this.snakeCrawl(this.snakeCrawlTicker), SNAKE_CRAWL_INTERVAL)
    this.snakeCrawlTickerTimeout = snakeCrawlTickerTimeout
  }

  // On collide event handler
  handleCollide = () => this.setState(prev => Object.assign(prev, { snake: prev.snake.slice(0, 1) }), () => this.spawnFood(this.spawnFoodTicker))

  // Food spawner ticker
  spawnFoodTicker = () => {
    const spawnFoodTickerTimeout = setTimeout(() => this.spawnFood(this.spawnFoodTicker), FOOD_SPAWN_INTERVAL)
    this.spawnFoodTickerTimeout = spawnFoodTickerTimeout
  }

  snakeCrawl = (callback = null) => this.setState(prev => {
    // List all digested food to prevent pod crawl
    const disgestedFoodIndex = prev.snake.map(({ pos }) => pos).reduce((prevArr, pos, i, arr) => {
      if (arr.lastIndexOf(pos) !== i) prevArr.push(i + 1)
      return prevArr
    }, [])

    // Modify pod position
    const crawler = ({ pos, dir }) => {
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

    // Change pod direction
    const redirect = (pod, prev) => {
      if (!prev) return pod
      pod.dir = prev.dir
      return pod
    }

    prev.snake = prev.snake.map((pod, i, arr) => {
      // Prevent pod crawl while digesting food
      if (disgestedFoodIndex.includes(i)) return redirect(pod, arr[i - 1])
      // Set new pod position and change direction
      return redirect(crawler(pod), arr[i - 1])
    })
    return prev
  }, callback)

  // Food spawner
  spawnFood = (callback = null) => this.setState({ foodPos: Math.floor(Math.random() * ((COLUMNS * ROWS) - 1)) }, () => {
    clearTimeout(this.spawnFoodTickerTimeout)
    callback && callback()
  })

  // Add new pod into beginning of snake array (state)
  // Then spawn new food
  incerementScore = () => this.setState(prev => Object.assign(prev, { snake: [prev.snake[0]].concat(prev.snake) }), () => this.spawnFood(this.spawnFoodTicker))

  render() {
    const { foodPos, snake } = this.state
    const snakePodPos = snake.map(({ pos }) => pos)
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
        <p><b>Control:</b> W, A, S, D, Arrows (Up, Left, Down, Right)</p>
        <a href="https://github.com/kautsarady/snek">Source Code</a>
        <h3>Score: {(snake.length - 1) * 100}</h3>
        <div style={{
          width: "60vw",
          height: "80vh",
          background: "#e6e6e6",
          display: "grid",
          gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`
        }}>
          {
            // Create grid
            new Array(COLUMNS * ROWS).fill(0).map((_, i) => {
              const _isPod = snakePodPos.includes(i)
              return (
                <div key={i} id={i} onClick={this.handleClick} style={{
                  border: "1px solid black",
                  width: "100%",
                  height: "100%",
                  background:
                  // Head color
                  snakePodPos[0] === i ? "cyan" :
                  // Food and pod intersect
                  foodPos === i && _isPod ? "red" :
                  // Food color
                  foodPos === i ? "yellow" :
                  // Pod color
                  _isPod ? "orange" : "",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}/>
              )
            })
          }
        </div>
      </div>
    )
  }
}

export default App;
