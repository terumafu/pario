class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }
    
    init() {
        // variables and settings
        this.ACCELERATION = 900;
        this.MAXVELX = 400;
        this.DRAG = 3000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -750;
        this.toggle = false;
        this.ballx = 200;
        this.bally = 600;
        this.direction = 1;
        
        this.stroke = 0;
        this.gameover = false;
        this.slow = 0.5;
    }
    preload(){
        this.load.setPath("./assets/");
        this.load.image("background", "skyblue.png");
        this.load.image("backgroundtiled","background.png");
        this.load.image("backgroundtiled2","background2.png");
        this.load.image("golfclubhead", "tile_0071.png");
        this.load.image("golfclubhandle", "tile_0058.png");
        this.load.atlasXML("balls", "rollingBall_sheet.png", "rollingBall_sheet.xml");
        this.load.image("coin", "tile_0151.png");
    }
    create() {
        
        this.bg = this.add.image(0, 0, "background").setOrigin(0, 0);
        this.bg.setScale(SCALE);
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        

        this.background = this.add.image((1440*2 -200)/2,900/2,"backgroundtiled");
        this.background.setScale(SCALE);
        this.background2 = this.add.image((1440*2 -200)/2,900/2,"backgroundtiled2");
        this.background2.setScale(SCALE);
        this.background3 = this.map.createLayer("background 3", this.tileset, 0, 0);
        this.background3.setScale(SCALE);

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setScale(SCALE);
        
        this.coinLayer = this.map.getObjectLayer('Coin Layer')['objects'];

        this.holeLayer = this.map.getObjectLayer('hole')['objects'];

        console.log(this.coinLayer);
        this.coins = this.physics.add.staticGroup()
        this.coinLayer.forEach(object => {
            let obj = this.coins.create(object.x * 2 * 1.8/2, object.y* 2 *1.8/2-20, "coin"); 
               obj.setScale(SCALE); 
               //obj.setOrigin(0); 
               obj.body.width = object.width; 
               obj.body.height = object.height; 
        });
        console.log(this.holeLayer);
        
        
        this.holes = this.physics.add.staticGroup();

        this.holeLayer.forEach(object => {
            let obj = this.holes.create(object.x * 2 * 1.8/2, object.y* 2 *1.8/2, "coin"); 
                obj.visible = false;
               obj.setScale(SCALE); 
               //obj.setOrigin(0); 
               obj.body.width = object.width; 
               obj.body.height = object.height; 
        });
       
        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(200, 700 , "platformer_characters", "tile_0000.png").setScale(SCALE)
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.body.setMaxVelocityX(this.MAXVELX);
        // Enable collision handling
        

        this.golfclub = {head:{},handle:{}}
        
        this.golfclub.handle = this.add.image(my.sprite.player.x, my.sprite.player.y,"golfclubhandle");
        this.golfclub.handle.setScale(0.8);
        
        this.golfclub.head = this.add.image(my.sprite.player.x, my.sprite.player.y+16 * 0.8,"golfclubhead");
        this.golfclub.head.setScale(0.8);
        
       
        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        
       
       

        this.cameras.main.setBounds(0, 0, 1440*2-225, 900*1.8/2);
        this.cameras.main.width = 1440 + 100;
        this.cameras.main.height = 900*1.8/2    ;
        this.cameras.main.startFollow(my.sprite.player, false, 0.1, 0.1);
        //this.cameras.main.setFollowOffset(0, 50);

        this.input.keyboard.on('keydown-SPACE', () => {
            
            this.golfclub.head.x = my.sprite.player.x + 30 *0.8*Math.cos(this.golfclub.head.rotation + Math.PI/2);
            this.golfclub.head.y = my.sprite.player.y + 30*0.8*Math.sin(this.golfclub.head.rotation+ Math.PI/2);
            
            this.golfclub.handle.x = my.sprite.player.x + 10 *Math.cos(this.golfclub.head.rotation + Math.PI/2);
            this.golfclub.handle.y = my.sprite.player.y + 10 *Math.sin(this.golfclub.head.rotation+ Math.PI/2);
            
            
        }, this);
        
        this.ball = this.physics.add.sprite(200, 700 , "balls", "ball_blue_small.png").setScale(0.8);
        this.ball.score = 0;
        this.physics.add.collider(this.ball, this.groundLayer);
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.physics.add.overlap(this.ball, this.coins, this.collectCoin);

        this.physics.add.overlap(this.ball, this.holes, this.wingame);
        this.gameovertext = this.add.text(2200, 500, "YES", { font: '40px "Press Start 2P"' });
        this.gameovertext.visible = false;
        this.startingtext = this.add.text(200, 750, "Welcome to Pario, arrow keys to move, space to charge up your swing",{ font: '40px "Press Start 2P"' } );
    }

    update() {
        console.log(this.ball)
        if(my.sprite.player.body.y >= 750){
            this.slow = 0.5;
            my.sprite.player.body.setMaxVelocityX(this.MAXVELX * this.slow);

        }else{
            this.slow = 1;
            my.sprite.player.body.setMaxVelocityX(this.MAXVELX);

        }

        if(this.ball.body.y >= 650 && this.ball.body.x >= 2400 && this.ball.body.x < 2520){
            this.gameover = true;
        }
        if(this.gameover){
            let finalscore = 15 - this.stroke + this.ball.score;
            console.log(finalscore);
            this.gameovertext.setText("You Win, Score: " + finalscore);
            this.gameovertext.visible = true;
            console.log("WIN");
        }
        //this.ball.body.velocity.x == 0 && this.ball.body.velocity.y == 0
        if(this.ball.body.velocity.x == 0 && Math.abs(this.ball.body.velocity.y + 8.333333) >= 0.001 && this.ball.body.blocked.down && this.ball.body.y < 850){
            this.ballx = this.ball.body.x ;
            this.bally = this.ball.body.y -20;
            
        }
        /*
        if(cursors.down.isDown){
            this.ball.body.x = my.sprite.player.x;
            this.ball.body.y = my.sprite.player.y;
        }*/

        //current version has cheats active but it doesnt apply for some reason


        //console.log(this.ball.body.velocity.x);
        //console.log(this.ball.body.velocity.y);
        this.ball.body.bounce.set(0.5);
        if(this.ball.body.y >= 900){
            this.ball.body.y = this.bally;
            this.ball.body.x = this.ballx
            this.ball.body.setVelocityX(0);
            this.ball.body.setVelocityY(0);
        }

        if(this.ball.body.acceleration.x >= 0){
            this.ball.body.setDragX(600);
        }
        //console.log(this.cameras.main.x);
        //console.log(this.cameras.main.y);
        //console.log(this.golfclub.head.rotation);
        //console.log(my.sprite.player.body.newVelocity);
        if(this.golfclub.head.rotation <= Math.PI/8){
            this.toggle = true;
        }
        else if(this.golfclub.head.rotation >= Math.PI * 7/8){
            this.toggle = false;
        }
        
        this.golfclub.head.rotation = Math.atan((this.golfclub.head.y - my.sprite.player.y)/(this.golfclub.head.x-my.sprite.player.x)) + Math.PI/2;
        
        this.golfclub.handle.rotation = Math.atan((this.golfclub.handle.y - my.sprite.player.y)/(this.golfclub.handle.x-my.sprite.player.x)) + Math.PI/2;
        if(this.toggle){
            Phaser.Math.RotateAround(this.golfclub.head,my.sprite.player.x,my.sprite.player.y,0.1);
            Phaser.Math.RotateAround(this.golfclub.handle,my.sprite.player.x,my.sprite.player.y,0.1);
        }else{
            Phaser.Math.RotateAround(this.golfclub.head,my.sprite.player.x,my.sprite.player.y,-0.1);
            Phaser.Math.RotateAround(this.golfclub.handle,my.sprite.player.x,my.sprite.player.y,-0.1);
        }

        if(my.sprite.player.x >= (1440)/2+ 50 && my.sprite.player.x <= 1440*2-225- (1440)/2- 50){
        this.background.x = (1440*2 -200)/2 + (my.sprite.player.x-(1440)/2 - 50) * 0.1;
        this.background2.x = (1440*2 -200)/2 + (my.sprite.player.x-(1440)/2 - 50) * 0.1;

        }

        if(cursors.space.isDown && my.sprite.player.body.blocked.down && !cursors.left.isDown && !cursors.right.isDown && Math.abs(my.sprite.player.body.newVelocity.x) ==0){
            
            this.golfclub.head.visible = true;
            this.golfclub.handle.visible = true;
        }else{
            this.golfclub.head.visible = false;
            this.golfclub.handle.visible = false;
        }
        
        
        
        if(Phaser.Input.Keyboard.JustUp(cursors.space) && my.sprite.player.x >= this.ball.x-40 && my.sprite.player.x <= this.ball.x + 40 && my.sprite.player.y >= this.ball.y - 20 && my.sprite.player.y <= this.ball.y + 20){
            this.ball.setVelocityX(Math.sqrt(this.golfclub.head.rotation,2) * 500 * this.direction);
            this.ball.setVelocityY(-Math.sqrt(this.golfclub.head.rotation,2) * 500);
            this.stroke++;
            
        }
        
        if(cursors.left.isDown &&!cursors.space.isDown ) {
            // TODO: have the player accelerate to the left
            my.sprite.player.body.setAccelerationX(-this.ACCELERATION * this.slow);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            this.direction = -1;

        } else if(cursors.right.isDown && !cursors.space.isDown) {
            // TODO: have the player accelerate to the right
            my.sprite.player.body.setAccelerationX(this.ACCELERATION * this.slow);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            this.direction = 1;

        } else {
            // TODO: set acceleration to 0 and have DRAG take over
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
        }
    //console.log(this.ball.body.x);
    //console.log(this.ball.body.y);
        //console.log(this.direction);
console.log(this.ball.score);
        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down ) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up) && !cursors.space.isDown) {
            // TODO: set a Y velocity to have the player "jump" upwards (negative Y direction)
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);

        }
        
    }
    collectCoin(ball, coin) {
        ball.score+=2;
        
        coin.destroy(coin.x, coin.y); // remove the tile/coin
        return;
    }
    wingame(ball, hole){
        this.gameover = true;
        return;
    }
}
