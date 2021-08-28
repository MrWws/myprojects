function Mine(tr,td,mineNum){
  this.tr=tr;
  this.td=td;
  this.mineNum=mineNum;

  this.squres=[];//存储所有方块的信息，是一个二维数组，用行列表示
  this.tds=[];//存储所有的单元格的dom（二维数组）
  this.surplusMine=mineNum;//剩余雷数
  this.allRight=0;

  this.parent=document.querySelector('.gameBox');
}

//生成n个不重复的数字
Mine.prototype.randomNum=function(){
  var square=new Array(this.tr*this.td);
  for (let i = 0; i < square.length; i++) {
    square[i]=i;
  }
  square.sort(function(){return 0.5-Math.random()});//随机排序
  // console.log(square);
  return square.slice(0,this.mineNum);
}

//初始化
Mine.prototype.init=function(){
  var rn = this.randomNum();
  var n=0;
  for(var i=0;i<this.tr;i++){
   this.squres[i]=[];
   for(var j=0;j<this.td;j++){
    // n++;
    if (rn.indexOf(n++)!=-1) {
      this.squres[i][j]={type:'mine',x:i,y:j};
    } else {
      this.squres[i][j]={type:'number',x:i,y:j,value:0};
    }
   }
  }
  

  this.updateNum();
  this.createDom();

  this.parent.oncontextmenu=function(){
    return false;
  }

  this.mineNumDom=document.querySelector('.mineNum');
  this.mineNumDom.innerHTML=this.surplusMine;
}

//创建表格
Mine.prototype.createDom=function(){
  var This=this;
  var table=document.createElement('table');
  
  for(var i=0;i<this.tr;i++){
    var domTr=document.createElement('tr');
    this.tds[i]=[];

    for(var j=0;j<this.td;j++){
      var domTd=document.createElement('td');
      // domTd.innerHTML=0;
      domTd.pos=[i,j];//把格子对应的行列存储在格子身上，为了下面通过这个值去数组里取对应的数据
      domTd.onmousedown=function(){
        This.play(event,this);//This指的是实例对象，this指的是点击的那个td
      }

      this.tds[i][j]=domTd;
      // if(this.squres[i][j].type=='mine'){
      //   domTd.className='mine';
      // }
      // if(this.squres[i][j].type=='number'){
      //   domTd.innerHTML=this.squres[i][j].value;
      // }

      domTr.appendChild(domTd);
    }
    table.appendChild(domTr);
  }
  this.parent.innerHTML='';
  this.parent.appendChild(table);
}

//找一个格子周围的8个格子
Mine.prototype.getAround=function(square){
  var x=square.x;
  var y=square.y;
  var result=[];//把找到的格子的坐标返回出去，二维数组

//通过行列去循环九宫格 
  for(var i=x-1;i<=x+1;i++){
    for(var j=y-1;j<=y+1;j++){
      if(
        i<0 || j<0 || i>this.tr-1 || j>this.td-1 || (i==x && j==y) || 
        this.squres[i][j].type=='mine'
      ){
        continue;
      }
      result.push([i,j]);//行列形式返回
    }
  }
  return result;
}

//更新所有的数字
Mine.prototype.updateNum=function(){
  for(var i=0;i<this.tr;i++){
    for(var j=0;j<this.td;j++){
      //只更新雷周围的数字
      if(this.squres[i][j].type=='number'){
        continue;
      }
      var num=this.getAround(this.squres[i][j]);//获取每一个雷周围的数字,二维数组
      for(var k=0;k<num.length;k++){
        this.squres[num[k][0]][num[k][1]].value+=1;
      }
    }
  }

  // console.log(this.squres);
}

Mine.prototype.play=function(ev,obj){
    This=this;
    if(ev.which==1 && obj.className!='flag'){
  //   点击的是左键
    // console.log(obj);
    var curSquare=this.squres[obj.pos[0]][obj.pos[1]];//当前点击的格子
    var cl=['zero','one','two','three','four','five','six','seven','eight'];
    // console.log(curSquare);
    if(curSquare.type=='number'){
      obj.innerHTML=curSquare.value;
      obj.className=cl[curSquare.value];
      if(curSquare.value==0){
        obj.innerHTML='';

        function getAllZero(square){
          var around=This.getAround(square);//二维数组
          for(var i=0;i<around.length;i++){
            var x=around[i][0];
            var y=around[i][1];

            This.tds[x][y].className=cl[This.squres[x][y].value];

            if(This.squres[x][y].value==0){
              if(!This.tds[x][y].check){
                This.tds[x][y].check=true;
                getAllZero(This.squres[x][y]);//为0才递归
              }
            }else{
              This.tds[x][y].innerHTML=This.squres[x][y].value;
            }
          }
        }
        getAllZero(curSquare);
      }
    }else{
      this.gameover(obj);
    }
  }
  if (ev.which==3){
    if(obj.className && obj.className!='flag'){
      return;
    }
    obj.className=obj.className=='flag'?'':'flag';//切换类名

    if(this.squres[obj.pos[0]][obj.pos[1]].type=='mine'){
      this.allRight+=1;
    }else{
     
    }

    if(obj.className=='flag'){
      this.mineNumDom.innerHTML=--this.surplusMine;
    }else{
      this.mineNumDom.innerHTML=++this.surplusMine;
    }

    if(this.surplusMine==0){
      //插够10个旗子
      if(this.allRight==this.mineNum){
        alert('恭喜你，游戏通过');
      }else{
        alert('游戏失败');
        this.gameover();
      }
    }
  }
}

Mine.prototype.gameover=function(clickTd){
  /*
  1.显示所有的雷
  2.取消所有格子的点击事件
  3.给点中的那个雷标上一个红
  */
  for(var i=0;i<this.tr;i++){
    for(var j=0;j<this.td;j++){
      if(this.squres[i][j].type=='mine'){
        this.tds[i][j].className='mine';
      }
      this.tds[i][j].onmousedown=null;
    }
  }
  if(clickTd){
    clickTd.style.backgroundColor='#f00';
  }
}

//上边button的功能
  var btns=document.querySelectorAll('.level button');
  var mine=null;
  var index=0;
  var arr=[[10,10,10],[20,20,20],[30,30,30]];

  for(let i=0;i<btns.length-1;i++){
    // console.log(i);
    btns[i].onclick=function(){
      btns[index].className='';
      btns[i].className='active';

      mine=new Mine(...arr[i]);
      mine.init();

      index=i;//使用let后变成 0 1 2 
      // console.log(i);
    }
  }

  btns[btns.length-1].onclick=function(){
    mine.init();
  }
// var mine=new Mine(8,8,8);
// mine.init();



