let starting  = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    []
];
let table = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    []
 

    

   
]
const Min_Max = (Min,Max)=>{
    return Math.floor(Math.random() * (Max)) + Min;
}

const GameDraw = ()=>{
    starting  = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ];

    table = [

        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
     
    
        
    
       
    ]
let completed = true;

    table.forEach( (box,index) =>{
        const Grow = Math.floor(index / 3);
      
            for(let i = 0; i< 9; i++){
                let ind = 0;
                let Gxcol = 0;
                let dd = [1,2,3,4,5,6,7,8,9];
                let rand = Min_Max(1,9);
                let row = [];
                let col = [];
                let bb = 0;
                const pRow = Math.floor(i/3);

                let Gcol;
                let Pcol;

                if([0,3,6].includes(index)){
                    Gcol = 0;
                }else if([1,4,7].includes(index)){
                    Gcol = 1;
                }else{
                    Gcol = 2;
                }
               
                if([0,3,6].includes(i)){
                    Pcol = 0;
                }else if([1,4,7].includes(i)){
                    Pcol = 1;
                }else{
                    Pcol = 2;
                } 

                table.forEach((cace,indexz)=>{      
                    if([0,3,6].includes(indexz)){
                        Gxcol = 0;
                        ind = [0,3,6].indexOf(indexz);
                    }else if([1,4,7].includes(indexz)){
                        Gxcol = 1;
                        ind = [1,4,7].indexOf(indexz);
                    }else{
                        Gxcol = 2;
                        ind = [2,5,8].indexOf(indexz);
                    }
                    if(Gxcol == Gcol){
                        table[Gxcol + (ind * 3)].forEach((nn,indeeex)=>{
                            if([0,3,6].includes(indeeex)){
                                Pxcol = 0;
                            }else if([1,4,7].includes(indeeex)){
                                Pxcol = 1;
                            }else{
                                Pxcol = 2;
                            }
                            if(Pxcol == Pcol){
                                col.push(nn);
                            }
                        })
                    }
                    if(Grow == Math.floor(indexz/3)){
                        table[Grow].forEach((nr,indexr)=>{
                            if(pRow == Math.floor(indexr/3)){
                                row.push(cace[indexr]);
                            }
                        })
                    }
                    
                })
         
                
                
                while(box.includes(rand) || row.includes(rand) || col.includes(rand)){

                            bb++;

                        rand = Min_Max(1,9);
                    
                      
                      if(dd.indexOf(rand) != -1){

                        dd.splice(dd.indexOf(rand) ,1)
                      }  
                    if(dd.length == 0 && bb > 150){
                        completed = false;
                        return false;

                    }
                }
             
                box[i] = rand;

                
       
               
             
            }

    }) 
return completed;
}


const newCombination = ()=>{

    while(!GameDraw()){
    
        GameDraw();
    }
return table;    
}
const startComb = (tab)=>{
let NewTab = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    []
    ]

tab.forEach((casex,index) =>{
        casex.forEach((num,i)=>{
                if(Math.random() < 0.7){
                    NewTab[index][i] = '';
                }else{
                    NewTab[index][i] = tab[index][i]
                }
        })
    })
    
    return NewTab;

}
const restartGame = (channel,room)=>{
    clearInterval(room.intervalRoom);
    room.tab = newCombination();
    room.tabStart = startComb(room.tab);
    room.turnTime(room);
    channel.to(room.roomId).emit('finish',{
        tab : room.tabStart,
        luckyNumber : room.luckyNumber
    
    });
}
const playerResulatBack = (channel,room,player,IsTrue,playerSocket)=>{
    console.log(room.partners.indexOf(playerSocket));
    console.log(room.colors);
    channel.to(room.roomId).emit('played', 
        played = {
        res : IsTrue,
        num : player.num,
        index : player.index,
        ind : player.ind,
        idPlayer : room.curentPlayer,
        lucky : room.luckyNumber,
        color : room.colors[room.partners.indexOf(playerSocket)],
        score : room.scores[room.partners.indexOf(playerSocket)]
  }
    )
    room.luckyNumber = {
        indexBox : null,
        indexNum : null
     }

}
const isFinish = (roomStartTab)=>{
    let fusionedTabs = [];
    roomStartTab.forEach(box=>{
        fusionedTabs = fusionedTabs.concat(box);
    })
    const emmptyBoxs = fusionedTabs.filter(num => num == '');
return  emmptyBoxs.length == 0 ? true : false;
 }

 
 const emitedRooms = (rooms)=>{
    rooms.filter(room=> room.roomId != null);
    if(rooms.length == 0) return;
    const emitedrooms = [];

    rooms.forEach(room=>{
        
        emitedrooms.push({
                    roomId : room.roomId,
                    slots : room.partners.length
            })
    })
    return emitedrooms;
}
module.exports =  {
    newCombination,
    startComb,
    Min_Max,
    restartGame,
    playerResulatBack,
    isFinish,
    emitedRooms
};