import Player     from './player/index'
import Enemy      from './npc/enemy'
import BackGround from './runtime/background'
import GameInfo   from './runtime/gameinfo'
import Music      from './runtime/music'
import DataBus    from './databus'

let ctx = canvas.getContext('2d')
let databus = new DataBus()

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    // 维护当前requestAnimationFrame的id
    this.aniId    = 0

    this.restart()
  }

  restart() {
    databus.reset()

    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )

    this.bg       = new BackGround(ctx)
    this.player   = new Player(ctx)
    this.gameinfo = new GameInfo()
    this.music    = new Music()

    this.bindLoop     = this.loop.bind(this)
    this.hasEventBind = false

    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId);

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {
    if ( databus.frame % 30 === 0 ) {
      let enemy = databus.pool.getItemByClass('enemy', Enemy)
      enemy.init(6)
      databus.enemys.push(enemy)
    }
  }

  // 全局碰撞检测
  collisionDetection() {
    let that = this

    databus.bullets.forEach((bullet) => {

      // 子弹相撞也消失
      if (bullet.owner instanceof Player) {
        for (let i = 0, il = databus.bullets.length; i < il; i++) {
          let theBullet = databus.bullets[i]
          if (theBullet.owner instanceof Enemy && theBullet.isCollideWith(bullet)){
            theBullet.visible = false
            bullet.visible = false
            //databus.removeBullets(theBullet)
            
            break
          }
        }
      }

      for ( let i = 0, il = databus.enemys.length; i < il;i++ ) {
        let enemy = databus.enemys[i]

        /*
        if ( !enemy.isPlaying && enemy.isCollideWith(bullet) ) {
          enemy.playAnimation()
          that.music.playExplosion()

          bullet.visible = false
          databus.score  += 1

          break
        }*/

        if (bullet.owner instanceof Enemy) {
          if (this.player.isCollideWith(bullet)) {
            databus.gameOver = true
            that.music.playExplosion();
          } 
        } else if (!enemy.isPlaying && enemy.isCollideWith(bullet)) {
          enemy.playAnimation();
          that.music.playExplosion();

          bullet.visible = false;
          databus.score += 1;

          break;
        }
      }
    })

    for ( let i = 0, il = databus.enemys.length; i < il;i++ ) {
      let enemy = databus.enemys[i]

      //if ( this.player.isCollideWith(enemy) ) {
      if (this.player.isCollideWith(enemy)) {
        databus.gameOver = true

        break
      }
    }
  }

  // 游戏结束后的触摸事件处理逻辑
  touchEventHandler(e) {
     e.preventDefault()

    let x = e.touches[0].clientX
    let y = e.touches[0].clientY

    let area = this.gameinfo.btnArea

    if (   x >= area.startX
        && x <= area.endX
        && y >= area.startY
        && y <= area.endY  )
      this.restart()
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.bg.render(ctx)

    databus.bullets
          .concat(databus.enemys)
          .forEach((item) => {
              item.drawToCanvas(ctx)
            })

    this.player.drawToCanvas(ctx)

    databus.animations.forEach((ani) => {
      if ( ani.isPlaying ) {
        ani.aniRender(ctx)
      }
    })

    this.gameinfo.renderGameScore(ctx, databus.score)
    this.gameinfo.renderGameLevel(ctx, databus.level)

    // 游戏结束停止帧循环
    if ( databus.gameOver ) {
      this.gameinfo.renderGameOver(ctx, databus.score)

      if ( !this.hasEventBind ) {
        this.hasEventBind = true
        this.touchHandler = this.touchEventHandler.bind(this)
        canvas.addEventListener('touchstart', this.touchHandler)
      }
    }
  }

  // 游戏逻辑更新主函数
  update() {
    if ( databus.gameOver )
      return;

    this.bg.update()

    databus.bullets
           .concat(databus.enemys)
           .forEach((item) => {
              item.update()
            })

    this.enemyGenerate()

    // aad1：每击落22架敌机升一级
    databus.level = Math.max(1, Math.ceil(databus.score / 22));
    
    this.collisionDetection()

    if ( databus.frame % 15 === 0 ) {
      this.player.shoot()
      this.music.playShoot()
    }
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++

    this.update()
    this.render()

    databus.enemys.forEach(enemy => {
      const enemyShootPositions = [
        -enemy.height + 6 * 5,
        -enemy.height + 6 * 60
      ];
      
      if (enemyShootPositions.indexOf(enemy.y) !== -1) {
        if (enemy.visible === true && databus.level>1){
          enemy.shoot();
          this.music.playShoot();
        }
      }
    });

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
}

// 支持转发
wx.onShareAppMessage(function () {
  // 用户点击了“转发”按钮
  return {
    title: '一起打飞机'
  }
})

wx.showShareMenu({
  withShareTicket: true
})