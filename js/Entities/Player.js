PlayerClass = function(playerJson){		//Heredamos de la clase entidad
	EntityClass.call(this);
	
	this.pos.x=playerJson.xIni;
	this.pos.y=playerJson.yIni;
	this.currSpriteName = 'ABX';
	this.movimiento = 50;				//Cantidad de movimiento por cada tick
	//Indica el tiempo que debe esperar, para disparar nuevamente
	this.weponColdown = 30;
	//Indica si el arma está lista para disparar, 0: listo, >0 enfriando
	this.weponReadyCountdown = 0;
	//TRUE indica que cada click es un disparo, FALSE que mientras este presionado el mouse, dispara si se ha cumplido el cold down del arma
	this.discreteShoot = true;
	//Vida del jugador
	this.energy = 1;
	if(playerJson.damage){
		this.damage = playerJson.damage;
	}else{
		this.damage = 5;
	}

	this.w=2;
	this.h=2;

	this.puedeMoverse = true;

	// Create our physics body;
    var entityDef = {
        id: "Player",
        type: 'dynamic',
        x: this.pos.x,
        y: this.pos.y,
        halfHeight: (64/this.w) * 0.5,
        halfWidth: (64/this.h) * 0.5,
        damping: 0,
        angle: 0,
        filterGroupIndex:-1,
        categories: ['player'],
        collidesWith: ['enemies'],
        userData: {
            "id": "Player",
            "ent": this
        }
    };

    this.physBody = gPhysicsEngine.addBody(entityDef);
}

PlayerClass.prototype = Object.create(EntityClass.prototype);
PlayerClass.prototype.constructor = PlayerClass;

PlayerClass.prototype.update = function(){

	this.puedeMoverse=true;

	if(this.energy<1){
		this.isDead=true;
		return;
	}

	if(this.weponReadyCountdown>0){
		this.weponReadyCountdown--;
	}

	this.isMoviendo=false;
	var dirX=0;
	var dirY=0;

	if(this.puedeMoverse==true){
		//Validamos si hay acciones pendientes por ejecutar
		if(gInputEngine.actions[MOV_IZQUIERDA]){
			dirX = - this.movimiento;
			this.isMoviendo=true;
		}
		if(gInputEngine.actions[MOV_DERECHA]){
			dirX = this.movimiento;
			this.isMoviendo=true;
		}
		if(gInputEngine.actions[MOV_ARRIBA]){
			dirY = - this.movimiento;
			this.isMoviendo=true;
		}
		if(gInputEngine.actions[MOV_ABAJO]){
			dirY = this.movimiento;
			this.isMoviendo=true;
		}

		if(this.isMoviendo==false){
			this.physBody.SetLinearVelocity(new b2Vec2(0, 0));
		}else{
			this.physBody.SetLinearVelocity(new b2Vec2(dirX, dirY));
		}
	}
	//this.physBody.SetPosition(this.pos);
	this.pos=this.physBody.GetPosition();

	this.physBody.SetPosition(this.pos);

	//Validamos si esta activa la accion de disparar
	if(gInputEngine.actions[CLICK] && this.weponReadyCountdown==0){
		
		if(this.discreteShoot){
			this.weponReadyCountdown=this.weponColdown;
		}
		var disparo = new BulletClass(this.pos, GE.marcaMouse.pos);
		disparo.calcularSteps();
		GE.entities.push(disparo);
		
	}

}