BulletClass = function(iniPos, endPos) {
	EntityClass.call(this);
	
	var vecIni = new b2Vec2(iniPos.x, iniPos.y);
	//var vecDest = new b2Vec2(endPos.x, endPos.y);

	this.dir = new b2Vec2(endPos.x, endPos.y);
	this.dir.Subtract(vecIni);
	this.dir.Normalize();
	this.inicio={x:iniPos.x, y:iniPos.y};
	this.destino={x:endPos.x, y:endPos.y};
	this.step=1;
	this.totalSteps=1;
	this.velBullet=1000;
	this.currSpriteName= 'bala';

	this.pos.x = iniPos.x;
	this.pos.y = iniPos.y;

	this.last.x = iniPos.x;
	this.last.y = iniPos.y;

	this.isDead=false;

	// Create our physics body;
    var entityDef = {
        id: "Bullet",
        type: 'dynamic',
        x: iniPos.x,
        y: iniPos.y,
        forma: "circulo",
        radio: 8,
        damping: 0,
        angle: 0,
        filterGroupIndex:-1,
        categories: ['projectile'],
        collidesWith: ['enemies'],
        userData: {
            "id": "Bala",
            "ent": this
        }
    };

    this.physBody = gPhysicsEngine.addBody(entityDef);
    this.physBody.SetLinearVelocity(new b2Vec2(this.dir.x * this.velBullet, this.dir.y * this.velBullet));

}

BulletClass.prototype = Object.create(EntityClass.prototype);

BulletClass.prototype.constructor = BulletClass;

BulletClass.prototype.update = function(){

    if(this.physBody !== null) {
        this.pos = this.physBody.GetPosition();
        this.physBody.SetLinearVelocity(new b2Vec2(this.dir.x * this.velBullet, this.dir.y * this.velBullet));
    }

	if(!this.isDead) {
		if(this.pos.x < -10 || this.pos.y < -10 || this.pos.x > GE.canvasSize.w + 10 || this.pos.y > GE.canvasSize.h + 10){
			this.isDead=true;
		}
	}

	this.last.x=this.pos.x;
    this.last.y=this.pos.y;

	if(!this.isDead) {
		this.physBody.SetLinearVelocity(new b2Vec2(this.dir.x * this.velBullet, this.dir.y * this.velBullet));
	}else{
		this.physBody.SetLinearVelocity(new b2Vec2(0,0));
		//GE.entities.push(new SplashClass(this.pos));
	}
	
}

BulletClass.prototype.onTouch = function(otherBody, point, impulse){
    if(!this.physBody) return false;
    if(!otherBody.GetUserData()) return false;
    this.isDead=true;
    //console.log("Bala tocando a: "+otherBody.GetUserData().id);

    var physOwner = otherBody.GetUserData().ent;
    /*
    if(physOwner !== null) {
        if(!this.physBody) 
        if(physOwner.energy !== null) {
            physOwner.energy -=10;
        }

        if(!this.physBody)  this.isDead = true;
    }
*/
    return true;
}

/*
	draw : function() { 
        pintarSprite(this.currSpriteName, this.pos.x, this.pos.y);
    },
*/

BulletClass.prototype.calcularSteps = function(){
	var distanciaCuadrado = Math.pow( Math.abs(this.destino.x-this.inicio.x), 2) + Math.pow( Math.abs(this.destino.y-this.inicio.y), 2)
	this.totalSteps = distanciaCuadrado / Math.pow(this.velBullet, 2);
}