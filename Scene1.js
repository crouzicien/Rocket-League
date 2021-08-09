
const configScene1 = {
    car: {
        active: true,
        maxSpeed: 700
    },
    ball: {
        active: true
    }
}

var cursors;
var ball;
var car;
var platforms;
var carOnGround = false
var firstJump = false
var secondJump = false
var secondJumpInProgress = false
var secondJumpDirection = ""
var keyJump
var ARelache = true
var pad1
var text
let dirPress = false
var carWeels = {
    left: false,
    right: false
}
let timeVelocity = []

class Scene1 extends Phaser.Scene {
    constructor() {
        super("theGame")

    }


    preload() {
        this.load.image('ball', "assets/ball.png")
        this.load.image('car', "assets/car.png")
        this.load.atlas('space', 'assets/space.png', 'assets/space.json');

    }

    create() {

        this.matter.world.setBounds();
        // let cell = this.matter.add.rectangle(600, 590, config.width, 1, { isStatic: true });
        let ground = this.matter.add.rectangle(config.width / 2, config.height - 100, config.width, 1, { isStatic: true, label: 'ground' });

        // Usefull add physic to rectangle
        // car = this.matter.add.sprite(250, 50, 'player');
        // car.setExistingBody(body1)




        ball = this.matter.add.image(400, 200, 'ball')
            .setScale(0.22)

            .setCircle(170 * 0.23, 200 * 0.23, 150)
            .setBounce(0.7, 0.7)
            .setFrictionAir(0.001)
            .setFriction(0.01)
            .setMass(50)
            .setPosition(config.width / 2, config.height - 400)
            .setScale(0.40)




        car = this.matter.add.sprite(0, 0, "car", 0)

        const { Body, Bodies } = Phaser.Physics.Matter.Matter; // Native Matter modules
        const { width: w, height: h } = car;

        // OLD
        const mainBody = Bodies.rectangle(0, 0 + 10, w, h - 4, { chamfer: { radius: 10 } });
        this.sensors = {
            downL: Bodies.rectangle(-115, 62, 50, 2, { isSensor: true }),
            downR: Bodies.rectangle(110, 62, 50, 2, { isSensor: true }),
        };
        const compoundBody = Body.create({
            parts: [mainBody, this.sensors.downL, this.sensors.downR],
            frictionStatic: 0,
            frictionAir: 0.02,
            friction: 0.1
        });

        car
            .setExistingBody(compoundBody)
            .setScale(0.50)

            .setOrigin(0.5)
            .setBounce(0.2, 0.2)
            .setMass(10000)

            .setFrictionAir(0.001)
            .setFriction(0.01)
            .setPosition(config.width - 100, config.height - 200)

        this.matterCollision.addOnCollideActive({
            objectA: [this.sensors.downL, this.sensors.downR],
            callback: this.onSensorCollide,
            context: this
        });




        // console.log(this.input.gamepad)



        this.input.gamepad.once('down', function (pad, button, index) {
            pad1 = pad;
        }, this);





        text = this.add.text(10, 30, '', { font: '16px Courier', fill: '#ffffff' });

    }




    update() {
        if (pad1 == undefined) return
        // Touching ground

        if (carWeels.left && !carWeels.right || !carWeels.left && carWeels.right) {
            console.log('la')
            car
                .setBounce(0.1, 0.1)
                .setMass(1000000)
        }
        else if (carWeels.left && carWeels.right) {
            car
                .setBounce(0.2, 0.2)
                .setMass(10000)
            carOnGround = true

        } else {
            car
                .setBounce(0.2, 0.2)
                .setMass(10000)
            carOnGround = false
        }




        // Jumps 
        if (carOnGround) {
            firstJump = true
            secondJump = false
        }
        else {
            firstJump = false
        }

        if (secondJump == false) secondJumpInProgress = false
        if (!pad1.A) ARelache = true


        // Patch bug
        if (car.body.speed == 0) car.thrust(0.00000001);
        if (ball.body.speed == 0) ball.thrust(0.00000001);

        // Car Max speed
        let maxSpeed = false
        if (car.body.speed > 5) maxSpeed = false

        // Init direction press
        dirPress = false

        // Au sol
        if (carOnGround) {



            // Accelerate
            if (pad1.buttons[7].value > 0 && !maxSpeed) {

                car.thrust(-5 * pad1.buttons[7].value);
            }

            // Frein
            if (pad1.buttons[6].value > 0) {

                if (car.body.speed > 0 && car.body.velocity.x < 0) {
                    car.thrust(car.body.speed * (pad1.buttons[6].value * 4));
                }
                if (car.body.speed.toFixed(0) == 0 || car.body.velocity.x >= 0) {
                    car.thrust(+5 * pad1.buttons[6].value);
                }

                // car.thrust(5 * pad1.buttons[6].value);
            }

            // First Jump
            if (pad1.A && ARelache) {
                car.setVelocityY(-2.5)
                carWeels.left = false
                carWeels.right = false
                firstJump = false
                ARelache = false
                // Second Jump reset
                setTimeout(() => {
                    secondJump = true
                    setTimeout(() => {
                        secondJump = false
                    }, 1500)
                }, 200)

            }
        }





        // En l'air
        else {

            // Rotate
            if (pad1.axes[1].value.toString().substring(0, 3) != '0.0' && !secondJumpInProgress) {
                dirPress = true
                // car.angle += 1.8 * pad1.axes[1].value
                let valueToCalc = Math.abs(pad1.axes[1].value)
                let value = Math.pow(Math.exp(valueToCalc - 1), 4) * 0.0006
                if (pad1.axes[1].value < 0) value = 0 - value

                car.setAngularVelocity(car.body.angularVelocity + value)
                if (timeVelocity.length > 0) {
                    timeVelocity.forEach(time => clearTimeout(time))
                }


                for (let i = 0; i < 10; i++) {
                    timeVelocity.push(
                        setTimeout(() => {
                            if (!dirPress) car.setAngularVelocity(car.body.angularVelocity * (0.85 - (i / 10)))
                            if (dirPress) car.setAngularVelocity(car.body.angularVelocity * (0.995 - (i / 10)))
                        }, 100 * i)
                    )
                }

            }

            // Second Jump
            if (secondJump && !firstJump) {
                if (!secondJumpInProgress) {

                    // Si direction 
                    if (pad1.A && ARelache && pad1.axes[1].value.toString().substring(0, 3) != '0.0') {
                        secondJumpInProgress = true


                        // Vers la droite
                        if (pad1.axes[1].value > 0) {
                            secondJumpDirection = "RIGHT"
                        }
                        // Vers la gauche
                        else if (pad1.axes[1].value < 0) {
                            secondJumpDirection = "LEFT"
                        }
                        setTimeout(() => {
                            secondJumpInProgress = false
                        }, 300)
                        ARelache = false
                    }


                    // Si a vide
                    else if (pad1.A && ARelache && pad1.axes[1].value.toString().substring(0, 3) == '0.0') {
                        secondJumpInProgress = true
                        secondJumpDirection = ""
                        car.setVelocityY(-1.5)
                        secondJumpInProgress = false
                        secondJump = false
                        ARelache = false
                    }


                }

                if (secondJumpInProgress) {
                    if (secondJumpDirection == "RIGHT") {
                        car.angle += 7.9
                        car.setVelocityX(car.body.velocity.x += 0.05);

                    } else if (secondJumpDirection == "LEFT") {
                        car.angle -= 7.9
                        car.setVelocityX(car.body.velocity.x -= 0.1);
                    }

                }
            }
        }




        // Turbo
        if (pad1.B && !maxSpeed) {
            car.thrust(-1.38);
        }







        this.debugControles()
    }





    onSensorCollide({ bodyA, bodyB, pair }) {
        // console.log('Colision')

        if (bodyB.isSensor) return; // We only care about collisions with physical objects
        if (bodyA === this.sensors.downL) {
            carWeels.left = true
        }

        if (bodyA === this.sensors.downR) {
            carWeels.right = true
        }
    }


    debugControles() {
        ///////////////////////////////////////////////////////////
        if (this.input.gamepad.total === 0) {
            return;
        }

        var debug = [];
        var pads = this.input.gamepad.gamepads;
        // var pads = this.input.gamepad.getAll();
        // var pads = navigator.getGamepads();

        for (var i = 0; i < pads.length; i++) {
            var pad = pads[i];

            if (!pad) {
                continue;
            }

            //  Timestamp, index. ID
            debug.push(pad.id);
            debug.push('Index: ' + pad.index + ' Timestamp: ' + pad.timestamp);

            //  Buttons

            var buttons = '';

            for (var b = 0; b < pad.buttons.length; b++) {
                var button = pad.buttons[b];

                buttons = buttons.concat('B' + button.index + ': ' + button.value + '  ');
                // buttons = buttons.concat('B' + b + ': ' + button.value + '  ');

                if (b === 8) {
                    debug.push(buttons);
                    buttons = '';
                }
            }

            debug.push(buttons);

            //  Axis

            var axes = '';

            for (var a = 0; a < pad.axes.length; a++) {
                var axis = pad.axes[a];

                axes = axes.concat('A' + axis.index + ': ' + axis.getValue() + '  ');
                // axes = axes.concat('A' + a + ': ' + axis + '  ');

                if (a === 1) {
                    debug.push(axes);
                    axes = '';
                }
            }

            debug.push(axes);
            debug.push('BallSpeed : ' + ball.body.speed)
            debug.push('CarOnGround : ' + carOnGround + '  Left : ' + carWeels.left + '  Right : ' + carWeels.right)
            debug.push('CarSpeed : ' + car.body.speed)
            debug.push('Fist jump : ' + firstJump)
            debug.push('Second jump : ' + secondJump)
            debug.push('Second jump in progress : ' + secondJumpInProgress)
            debug.push('Second jump direction : ' + secondJumpDirection)
            debug.push('car angular velocity : ' + car.body.angularVelocity.toFixed(2))
            debug.push('dirpress : ' + dirPress)
            debug.push('')

        }
        text.setText(debug);
    }
}
