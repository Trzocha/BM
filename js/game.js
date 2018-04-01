// Inicjuję grę dopiero po załadowaniu całej strony
window.onload = function(){
	Game.spr = new Image();
    Game.spr.onload = Game.init;
    Game.spr.src = 'bombe3.png';
}
// Obiekt, w którym będą przechowywane „podręczne” wartości
VAR = {
	fps:15,// animacja w Bombermenie nie była tak płynna jak we współczesnych grach
	W:0,// szerokość okna
	H:0,// wysokość okna
	scale:2,// elementy gry będą wklejane w odpowiedniej skali
	//
	lastTime:0,
    enemy:3,
    crate:1,
    
	rand:function(min,max){
		return Math.floor(Math.random()*(max-min+1))+min;
    
	},
    shuffle:function(arr){  //funkcja tasujaca
        var counter = arr.length;
        var tmp;
        var index;
        
        while(counter>0){
            counter--;
            index = Math.floor(Math.random()*counter);
            tmp = arr[counter];
            arr[counter] = arr[index];
            arr[index] = tmp;
        }
        return arr;
    }
}
// Obiekt zawierający bazowe funckje związane z grą.
// Game nie ma konstruktora, jest jedynie obiektem grupującym funkcje.
Game = {
	// init zostanie odpalone raz po załadowaniu strony.
	init:function(){
		// Tworzę canvas
		Game.canvas = document.createElement('canvas');
		// Przypisuję kontekst 2D do zmiennej ctx, która jest właściwością obiektu Game
		Game.ctx = Game.canvas.getContext('2d');
        
        Game.board = new Board();
		// odpalam metodę obiektu Game
		Game.layout();
		// metoda layout odpali się przy każdej zmianie wielkości okna
		window.addEventListener('resize', Game.layout, false);
		// Canvas zostaje dodany do DOM
		document.body.appendChild(Game.canvas);
        
        Game.toDraw = {};  //obiekt w którym wrzucane są obrazki do animowania
        Game.hero = new Hero();
        
        var tmp_enemy;
        for(var i=0;i<VAR.enemy;i++){
            tmp_enemy = Game.board.getEmptySpace();
            new Enemy(tmp_enemy.x*Game.board.fW,tmp_enemy.y*Game.board.fH);
        }
        
        window.addEventListener('keydown',Game.onKey,false);
        window.addEventListener('keyup',Game.onKey,false);
		
        // rozpoczęcie pętli gry
		Game.animationLoop();
	},
    stop:function(){
        window.removeEventListener('keydown',Game.onKey);
        window.removeEventListener('keyup',Game.onKey);
    },
	// Ta metoda będzie odpalana przy każdej zmianie wielkości okna
    onKey:function(ev){
      if(ev.keyCode>=37 && ev.keyCode<=40 || ev.keyCode==32){
          ev.preventDefault();
          if(ev.type == 'keydown' || !Game['key_'+ev.keyCode]){
              Game['key_'+ev.keyCode] = true;
              if(ev.keyCode>=37 && ev.keyCode<=40){
                  for(i=37;i<=40;i++){
                      if(i!=ev.keyCode){
                          Game['key_'+i] = false;
                      }
                  }
                  Game.hero.updateState();
              }else {
                  new Bomb(Game.hero.column,Game.hero.row);    //umieszczanie bomby przez bohatera
                  
              }
          }else if(ev.type == 'keyup'){
              Game['key_'+ev.keyCode] = false;
              Game.hero.updateState();
          }
      }  
    },
	layout:function(ev){
		// Dla łatwiejszego pisania wielkość okna zostaje przypisana do właściwości W i H obiektu VAR
		VAR.W = window.innerWidth;
		VAR.H = window.innerHeight;
        
        VAR.scale = Math.max(1,Math.min(  //scalowanie mapy, nie moze byc mniejsza niz 1:1, zawsze ostra ze zwgledu na wielokrotnosc wielkosci obiektów*ilosc obiektów
            Math.floor(VAR.W/(Game.board.fW*Game.board.b[0].length)), //kolumny
            Math.floor(VAR.H/(Game.board.fH*Game.board.b.length)) //rzedy
        ));
        
		// Chwilowo do canvas przypiszemy wielkość okna
		Game.canvas.width = VAR.scale*Game.board.fW*Game.board.b[0].length;
		Game.canvas.height = VAR.scale*Game.board.fH*Game.board.b.length;
        //
        Game.canvas.style[Modernizr.prefixed('transform')] = 'translate('+Math.round((VAR.W-Game.canvas.width)/2)+'px,'+Math.round((VAR.H-Game.canvas.height)/2)+'px)'
        
        Game.ctx.imageSmoothingEnabled = false;
        Game.ctx.mozImageSmoothingEnabled = false;
        Game.ctx.mozImageSmoothingEnabled = false;
        Game.ctx.webKitImageSmoothingEnabled = false;
	},
	// Funkcja, która odpala się 60 razy na sekundę
	animationLoop:function(time){
		requestAnimationFrame( Game.animationLoop );
		// ograniczenie do ilości klatek zdefiniowanych w właściwości obiektu VAR (nie więcej niż VAR.fps)
		if(time-VAR.lastTime>=1000/VAR.fps){
			VAR.lastTime = time;
			//
			// oczyszczenie canvas
			//Game.ctx.clearRect(16,16,VAR.W-16, VAR.H-16);
            Game.board.draw();  //rysowanie calej mapy
			for(var o in Game.toDraw){
                Game.toDraw[o].draw();
            }
		}
	}
}