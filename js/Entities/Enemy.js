EnemyClass = function(enemyJson){
    EntityClass.call(this);
    this.energy = 1;
    this.speed = 40;
    this.damage = 3;
    this.isDead = false;
    this.radioVision = 60;

    //Tiempo que estara transformado el enemigo
    this.tiempoTotalTransformacion = 5000;
    //Numero de milisegundos que ha estado transformado
    this.tiempoConversion = 5000;
    //Milisegundos en los que inició la conversión
    this.inicioConversion = 0;

    //Velocidad de absorcion del vortice
    this.velocidadAbsorcion=80;

    this.tipo = "Sierra";

    if(enemyJson.tipoEnemigo){
        this.tipo = enemyJson.tipoEnemigo;
    }

    this.tipoActual = this.tipo;

    if(this.tipo == "Sierra"){
        this.currSpriteName = 'sierra';
    }else{
        this.currSpriteName = 'vortice';
    }

    var iniPos = new b2Vec2(enemyJson.xIni, enemyJson.yIni);
    this.pos.x = iniPos.x;
    this.pos.y = iniPos.y;
/*
    this.dir = new b2Vec2(GE.personaje.pos.x, GE.personaje.pos.y);
    this.dir.Subtract(iniPos);
    this.dir.Normalize();
*/
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
        categories: ['Enemy'],
        collidesWith: ['player', 'projectile', 'Enemy'],
        userData: {
            "id": "Enemy",
            "ent": this
        }
    };

    this.physBody = gPhysicsEngine.addBody(entityDef);
    
    //this.physBody.SetLinearVelocity(new b2Vec2(this.dir.x * this.speed, this.dir.y * this.speed));

}

EnemyClass.prototype = Object.create(EntityClass.prototype);

EnemyClass.prototype.constructor = EnemyClass;

EnemyClass.prototype.update = function(){

    if(this.energy<1){
        console.log("miEnergia es: "+this.energy);
        this.isDead=true;
        return;
    }

    if (this.tiempoConversion<this.tiempoTotalTransformacion){
        var objDate = new Date();
        this.tiempoConversion = (objDate.getTime()-this.inicioConversion);
        console.log("tiempoConversion: "+this.tiempoConversion);
    }else{
        this.tipoActual=this.tipo;
    }

    if(this.tipoActual == "Sierra"){
        this.currSpriteName = 'sierra';
        this.radioVision = 60;
    }else{
        this.currSpriteName = 'vortice';
        this.radioVision = 80;
    }

    //"AI"
    if(this.physBody !== null) {

        this.pos = this.physBody.GetPosition();

        if(this.tipoActual == "Sierra"){

            if( Math.pow(this.radioVision, 2) > (Math.pow(this.pos.x - GE.personaje.pos.x, 2) + Math.pow(this.pos.y - GE.personaje.pos.y, 2) ) ){
                
                this.dir = new b2Vec2(GE.personaje.pos.x, GE.personaje.pos.y);
                this.dir.Subtract(this.pos);
                this.dir.Normalize();
                this.physBody.SetLinearVelocity(new b2Vec2(this.dir.x * this.speed, this.dir.y * this.speed));

            }else{
                this.physBody.SetLinearVelocity(new b2Vec2(0, 0));
            }

        }else{      //Acciones del vortice

            this.physBody.SetLinearVelocity(new b2Vec2(0, 0));

            objShape = new CircleShape();
            objShape.SetLocalPosition(new b2Vec2(this.pos.x, this.pos.y));
            objShape.SetRadius(this.radioVision);

            var transform = null;

            gPhysicsEngine.world.QueryShape(this.entidadEncontrada, objShape, transform);

        }

        this.pos = this.physBody.GetPosition();
    }
    
}

EnemyClass.prototype.onTouch = function(otherBody, point, impulse){
    if(!this.physBody) return false;
    if(!otherBody.GetUserData()) return false;
    //console.log("Enemigo tocando a: "+otherBody.GetUserData().id);

    var physOwner = otherBody.GetUserData().ent;

    if(physOwner !== null && otherBody.GetUserData().id != 'Bala') {

        if(physOwner.energy) {
            physOwner.energy -=10;
        }

    }else if( otherBody.GetUserData().id == 'Bala' && this.tipoActual==this.tipo){

        if(this.tipoActual == "Vortice"){
            this.tipoActual = 'Sierra';
        }else{
            this.tipoActual = 'Vortice';
        }

        //console.log("Transformando de: "+this.tipo+" a:"+this.tipoActual);

        this.tiempoConversion = 0;
        var objDate = new Date();
        this.inicioConversion = objDate.getTime();

    }

    return true;
}

EnemyClass.prototype.draw = function() { 

        GE.ctx.beginPath();
        GE.ctx.arc(this.pos.x, this.pos.y, this.radioVision, 0, 2 * Math.PI, false);
        GE.ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        GE.ctx.fill();
        GE.ctx.lineWidth = 1;
        GE.ctx.strokeStyle = '#003300';
        GE.ctx.stroke();

        pintarSpriteCustom(this.currSpriteName, this.pos.x, this.pos.y, this.w, this.h, this.angulo);
}

EnemyClass.prototype.entidadEncontrada = function(fixture){

    if(fixture.GetBody().GetUserData()){
        if(fixture.GetBody().GetUserData().ent){
            if(fixture.GetBody().GetUserData().ent.tipoActual != "Vortice" && fixture.GetBody().GetUserData().ent.tipoActual != "Bala"){
                var tmpObj = fixture.GetBody().GetUserData().ent;
                //console.log("Entidad: "+fixture.GetBody().GetUserData().id);

                //var dirObj =new b2Vec2(tmpObj.physBody.GetPosition().x, tmpObj.physBody.GetPosition().y);
                var limiteInf = fixture.GetAABB().lowerBound;
                var limiteSup = fixture.GetAABB().upperBound;

                /*dirObj.Subtract(new b2Vec2( limiteInf.x+(limiteSup.x-limiteInf.x),  limiteInf.y+(limiteSup.y-limiteInf.y)));
                dirObj.Normalize();
                console.log(tmpObj.physBody.GetWorldCenter().x+" - "+tmpObj.physBody.GetWorldCenter().y);
                fixture.GetBody().GetUserData().ent.physBody.ApplyForce( new b2Vec2(dirObj.x*800,dirObj.y*800), tmpObj.physBody.GetWorldCenter());
                */

                var dirObj = new b2Vec2(tmpObj.physBody.GetPosition().x, tmpObj.physBody.GetPosition().y);
                dirObj.Subtract(new b2Vec2( limiteInf.x+((limiteSup.x-limiteInf.x)/2),  limiteInf.y+((limiteSup.y-limiteInf.y)/2)));
                dirObj.Normalize();
                tmpObj.physBody.SetLinearVelocity(new b2Vec2(dirObj.x * 80, dirObj.y * 80));

            }
        }
    }
    //console.log("se encontro una entidad"+fixture.GetBody().GetUserData().id);

}



            