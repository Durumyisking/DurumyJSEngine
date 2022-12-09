

const Obj_Type = {
    Floor: 0,
    Player: 1,
    END: 2,
}




var Scene = (function (exports) {
    'use strict';
    this.arrGameObj = Array.from(new Array(Obj_Type.END), () => new Array(0));
    this.Wintexture = PIXI.Texture.from('/DurumyJSEngine/images/bg/thekingsleap/Background/Windows/windows.png');
    this.Farbgtexture = PIXI.Texture.from('/DurumyJSEngine/images/bg/thekingsleap/Background/Far/far_bg.png');
    //[Obj_Type.END][255];

    this.update = function() 
    {
        for(var i =0; i< this.arrGameObj.length; ++i)
        {
            for(var j =0; j< this.arrGameObj[i].length; ++j)
            {
                if(this.arrGameObj[i][j] != null)
                    this.arrGameObj[i][j].update();

                if(null != this.arrGameObj[i][j].Collider)
                    this.arrGameObj[i][j].Collider.update();
            }
        }
    }
    this.render = function(container) 
    {
        container.addChild(this.Farbgtexture);
        container.addChild(this.Wintexture);

        for(var i =0; i< this.arrGameObj.length; ++i)
        {            
            for(var j =0; j< this.arrGameObj[i].length; ++j)
            {
                if(this.arrGameObj[i][j] != null)
                    this.arrGameObj[i][j].render(container);


                if(null != this.arrGameObj[i][j].Collider)
                    this.arrGameObj[i][j].Collider.render(container);
            }
        }
    }
})