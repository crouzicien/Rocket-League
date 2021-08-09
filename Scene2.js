
class Scene2 extends Phaser.Scene {
    constructor() {
        super("theOverlay")
    }

    preload() {
    }

    create() {
        this.add.text(20, 20, 'Bienvenue', { fill: "blue" })
    }

    update() {

    }
}
