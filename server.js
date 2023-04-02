const express = require('express');
const path = require('path');
const app = express();
const socket = require('socket.io')
const PORT = 3000 || process.inv.PORT;
const http = require('http')
const server = http.createServer(app);
const socketio = socket(server);
const cors = require('cors');
app.use(express.static(path.join(__dirname,'views')));
app.use(cors());
app.set('view engine','ejs');
const {newCombination,startComb,Min_Max,restartGame,playerResulatBack,isFinish,emitedRooms} = require('./module/gameMaster');

app.get('/',(req,res)=>{
    res.render('index');
})

const findRoom = (rooms,roomOn)=>{
  const room =   rooms.filter(room => room.roomId == roomOn);

  if(room.length > 0){

      return room[0];
  }else{
    return false;
  }
}
const colors =  ['#cd84f1','#ffcccc','#ff4d4d','#ffaf40','#fff200','#3ae374','#67e6dc','#7158e2','#3d3d3d','#f5f6fa','#4cd137'];
const RoomManger = [{
    roomId : null,
    partners : [],
    tab : [],
    curentPlayer : null
}]





socketio.on('connection',socket=>{

    const emitedrooms = emitedRooms(RoomManger);
    socket.emit('rooms',emitedrooms);
    
    socket.on('join',room=>{
        
        let roomSender = findRoom(RoomManger,room);

    
        if(!roomSender){
            socket.join(room)
            const playerColor = colors[Math.floor(Math.random() * (colors.length - 1)) ]
         
            console.log(playerColor);
           
const NewTab = newCombination();

    RoomManger.push({
        roomId : room,
        partners : [socket.id],
        tab : NewTab,
        isFinish : false,
        tabStart : startComb(NewTab),
        curentPlayer : socket.id,
        intervalRoom : null,
        lucky : (room)=>{
            
       

            let boxIndex = null;
            let NumIndex = null;
            room.tabStart.forEach((box,index)=>{
                               
                    if(Math.random() > 0.7){
                          box.forEach((num,ind) => {
                            if(num == ''){
                                boxIndex = index;
                                NumIndex = ind;
                            }
                          })
                    }
            })
        
         if(NumIndex != null && boxIndex != null){
    room.luckyNumber.indexBox =  boxIndex;
            room.luckyNumber.indexNum = NumIndex;
            socketio.to(room.roomId).emit('lucky',room.luckyNumber);
         }
            
           

            
            
        },
        turnTime : (roomMa)=>{
     
      roomMa.intervalRoom =  setInterval(()=>{
        
                roomMa.curentPlayer = roomMa.partners.filter(partner => partner != roomMa.curentPlayer)[0];
               
                
                roomMa.lucky(roomMa);

                socketio.to(roomMa.curentPlayer).emit('ready',roomMa.luckyNumber);
       
            },30000)
        },
        colors : [playerColor],
        scores : [0,0],
        
        luckyNumber : {
            indexBox : null,
            indexNum : null
        }
    })
  
    roomSender = findRoom(RoomManger,room);
    
   roomSender.lucky(roomSender);

   socketio.emit('rooms',emitedrooms);
  

}else {
    if(roomSender.partners.length < 2 && !roomSender.partners.includes(socket.id)){
        socket.join(room)
        const SecondColor = colors.filter(color => color != roomSender.colors[0])[Math.floor(Math.random() *  (colors.length - 2))];
        roomSender.partners.push(socket.id);
        console.log(SecondColor);
        roomSender.colors.push(SecondColor);

      roomSender.turnTime(roomSender);
        
     roomSender= findRoom(RoomManger,room);
    


      

        
       
    
       

        socketio.to(room).emit('join',{
            tab : roomSender.tabStart,
            luckyNumber : roomSender.luckyNumber,
            colors : roomSender.colors
        });
        socket.to(roomSender.curentPlayer).emit('warning','your turn');
        socket.to(roomSender.curentPlayer).emit('ready','ready to play');
    }else{
        if(roomSender.partners.includes(socket.id)){
        socket.join(room)
     
        }else{
           
            socket.emit('warning',"Game Already Started");
                       return;
        }
    }
}
    





});

socket.on('play',player=>{
    
    roomSender = findRoom(RoomManger,player.room);

   

  if(roomSender.partners.length < 2){
    socket.emit('warning',{msg : "wait your partner to join the game"});
    return;
  }
    const isExist =  roomSender.partners.includes(socket.id);
    const isHisTurn = roomSender.curentPlayer == socket.id;
    
    if(isExist && isHisTurn){
        const luckyExist = roomSender.luckyNumber.indexBox != null;
     const IsTrue = roomSender.tab[player.index][player.ind] == player.num ? true : false;

     if(IsTrue){
        
        if(luckyExist){
            const isLucky  = roomSender.luckyNumber.indexBox == player.index && roomSender.luckyNumber.indexNum == player.ind;
            if(isLucky){
               
                roomSender.scores[roomSender.partners.indexOf(socket.id)]+= Min_Max(1,9);
            }else{
    
                roomSender.scores[roomSender.partners.indexOf(socket.id)]++;
            }
        }else{
            roomSender.scores[roomSender.partners.indexOf(socket.id)]++;
        }
    roomSender.tabStart[player.index][player.ind] = player.num;


 

     }else{
        const luckyExist = roomSender.luckyNumber.indexBox != null;
        const isLucky  = roomSender.luckyNumber.indexBox == player.index && roomSender.luckyNumber.indexNum == player.ind;
        if(luckyExist){
            if(isLucky){
              
                roomSender.scores[roomSender.partners.indexOf(socket.id)]-= Min_Max(1,9);
            }else{
    
                roomSender.scores[roomSender.partners.indexOf(socket.id)]--;
            }   
        }else{
            roomSender.scores[roomSender.partners.indexOf(socket.id)]--;
        }
    
       
     }
  //emit back result after playing to all players on that room 
    playerResulatBack(socketio,roomSender,player,IsTrue,socket.id);
   
  


  




if(isFinish(roomSender.tabStart)){

    restartGame(socketio,roomSender);
  
}
   
    }else{
         socket.emit("warning", {msg : "wait your turn please"});
    }
  
 })
})


server.listen(PORT,()=> console.log(`Server Is Now Listenning On  ${PORT} `));