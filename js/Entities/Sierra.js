SierraClass = function(enemyJson){
	EntityClass.call(this);
	this.currSpriteName = 'sierra';
	this.energy = 1;
	this.speed = 40;
	this.damage = 3;
    this.isDead = false;

    var iniPos = new b2Vec2(enemyJson.xIni, enemyJson.yIni);

	this.dir = new b2Vec2(GE.personaje.pos.x, GE.personaje.pos.y);
	this.dir.Subtract(iniPos);
	this.dir.Normalize();

	// Create our physics body;
    var entityDef = {
        id: "Enemy",
        type: 'dynamic',
        x: iniPos.x,
        y: iniPos.y,
        forma: "circulo",
        radio: 10,
        damping: 0,
        angle: 0,
        filterGroupIndex:1,
        categories: ['enemies'],
        collidesWith: ['player', 'projectile'],
        userData: {
            "id": "Enemy",
            "ent": this
        }
    };

    this.physBody = gPhysicsEngine.addBody(entityDef);
    this.physBody.SetLinearVelocity(new b2Vec2(this.dir.x * this.speed, this.dir.y * this.speed));

}

SierraClass.prototype = Object.create(EntityClass.prototype);

SierraClass.prototype.constructor = SierraClass;

SierraClass.prototype.update = function(){

    //"AI"
	if(this.physBody !== null) {
        this.pos = this.physBody.GetPosition();
        this.dir = new b2Vec2(GE.personaje.pos.x, GE.personaje.pos.y);
        this.dir.Subtract(this.pos);
        this.dir.Normalize();
        this.physBody.SetLinearVelocity(new b2Vec2(this.dir.x * this.speed, this.dir.y * this.speed));
    }
    
}

SierraClass.prototype.onTouch = function(otherBody, point, impulse){
    if(!this.physBody) return false;
    if(!otherBody.GetUserData()) return false;

    var physOwner = otherBody.GetUserData().ent;
    

    if(physOwner !== null) {
        if(!this.physBody) 
        if(physOwner.energy !== null) {
            physOwner.energy -=10;
        }

        if(!this.physBody)  this.isDead = true;
    }

    return true;
}