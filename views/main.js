
const socket = io();
const btnPlay = document.querySelector('.btnPlay');
const casesEl = Array.from(document.querySelectorAll('.case'));
const btns = Array.from(document.querySelectorAll('.btn'));
const count = document.querySelector('.count');
const LeftScore = document.querySelector('.scores .left');
const container = document.querySelector('.mainTable');
const topContainer = document.querySelector('.topContainer');
const RightScore = document.querySelector('.scores .right');
const tbody = document.querySelector('.tbod');
const containerGame = document.querySelector('.container');
const roomName = document.querySelector('#roomName')
const btnStart = document.querySelector('#start')
const SoundCorrect = new Audio('correct.mp3');
const SoundIncorrect = new Audio('incorrect.mp3');
const SoundTurn = new Audio('turn.mp3');
const loader = document.querySelector('.loader');
const background = document.querySelector('.background');
const rootCss = document.querySelector(':root');
let owner = false;
const colors =  ['#00ff0887','#ff98009e','#ffeb3b','#fd79a8ba','#fdcb6e','#9783a1c7','#b53471d1'];
const Min_Max = (Min,Max)=>{
    return Math.floor(Math.random() * (Max)) + Min;
}


if(window.innerWidth < window.innerHeight){


    containerGame.style.width = window.innerWidth + "px";
    containerGame.style.height = window.innerWidth+ "px";

  
 
}else{
    
        topContainer.style.height = '100vh';    
    containerGame.style.width = window.innerHeight+ "px";
    containerGame.style.height = window.innerHeight  + "px";
 
}

const GenerateBackground = (num)=>{
    background.innerHTML = '';
/*  
  left: 65%;
    width: 178px;
    height: 178px;
    bottom: -178px;
    animation-delay: 1s;

*/
for(let i = 0; i < num; i++){
    const size  = Min_Max(15,20) + "px";
    const li = document.createElement('li');
    li.style.background = colors[Math.floor(Math.random() * colors.length - 1)];
    li.style.width = size;
    li.style.height = size;
    li.style.bottom = -1 * Min_Max(150,170) + "px";
    li.style.left =  Min_Max(0,100) + "%";
    li.style.animationDelay = i + "s";
    li.innerHTML = Min_Max(1,9);
    li.style.textAlign = "center";
    li.style.fontFamily = "Poppins, sans-serif"
    li.style.fontWeight = "bold";
    li.style.lineHeight = size;
    li.style.fontSize = size + "px"
    li.style.color = "#FFF";

    background.append(li);
}


}

GenerateBackground(3);
let Turn;
let roomX;


LeftScore.innerText = 0;
RightScore.innerText = 0;

const leftLoad = document.querySelector('.left');
const leftLoadCont = document.querySelector('.leftCont');
const RightLoad = document.querySelector('.right');
let selecteds = [];
let starting = [];
let commenting = false;


socket.on('rooms', rooms =>{
    tbody.innerHTML = '';
  rooms.forEach(room =>{
    if(room.roomId != null){

   
    tbody.innerHTML += `   <tr>
    <td data-room='${room.roomId}'>
      ${room.roomId}
    </td>
    <td data-title='E-mail'>
    ${room.slots}
    </td>
    <td class='select'>
      <a onclick= "join('${room.roomId}')" class='button' href='#'>
        join
      </a>
    </td>
  </tr>`;
}
  })
})
const join = (roomName)=>{
    socket.emit('join',roomName);
    roomX = roomName;
    container.style.display = 'none';
    topContainer.style.display = 'flex';
    
}
btnStart.addEventListener('click',()=>{
    owner = true;
    join(roomName.value);
    
    loader.style.display = 'flex';
    topContainer.classList.add('blurFilter');
})


const playx = (numc,indexc,indc,roomX)=>{
    socket.emit('play',player =  {
        index : indexc,
        ind : indc,
        room : roomX,
        num : numc
    })
   
}

const commentTrigger = (el)=>{
    
    if(commenting == true){
        btns.forEach(btn=> {
            btn.classList.remove('comment');
            commenting = false;
            el.classList.remove('activeBtn');
            
        })
        
    }else{
        
        btns.forEach(btn=> {
            btn.classList.add('comment');
            el.classList.add('activeBtn');
            
        })
       commenting = true; 
    }

}





const select = (e)=>{
    let numbers = Array.from(document.querySelectorAll('.numb'));
    numbers.forEach(num =>{
        num.classList.remove('active');
        num.classList.remove('selected');
        num.classList.remove('activeComment');
        num.querySelector('span').classList.remove('u--slideRight');
        num.querySelector('span').classList.remove('u--swing');
        num.classList.remove('caseComment');
        num.querySelector('span').classList.remove('u--fadeInUp');
    })
selecteds =     numbers.filter(number => number.innerText.includes(e.innerText) && e.innerText != '');
selected = {
    box : Number(e.dataset.box),
    boxindex : Number(e.dataset.boxi),
    htmlElement : e
};
selecteds.forEach((sel,index)=>{
    if(sel != e ){
       
        if(sel.innerText != '' && !sel.querySelector('span').classList.contains('comentSpan') && !sel.classList.contains('incorrect')){
            sel.classList.add('active');
            sel.querySelector('span').classList.add('u--fadeInUp');
        }else if(sel.querySelector('span').classList.contains('comentSpan')){
            sel.classList.add('activeComment');
            sel.querySelector('span').classList.add('u--swing');
            sel.classList.add('caseComment');
        }

    }else  {
        
        sel.classList.add('selected')
        sel.classList.add('active');

    }

})

}

const play = async(btn)=>{

    const clickedNumber = Number(btn.value);
    const keys = [1,2,3,4,5,6,7,8,9];
    if(!keys.includes(clickedNumber)){
        return;
    }
   
  const   Exist  =   starting[selected.box][selected.boxindex];

  if(!commenting && Exist == ''){
      
      playx(clickedNumber,selected.box,selected.boxindex,roomX);

        
     
    }else {
        if(Exist) {
            return;
        }
      
        if(selected.htmlElement.classList.contains('incorrect')){
            selected.htmlElement.querySelector('span').innerText = '';
            selected.htmlElement.classList.remove('incorrect');
        }
        if(selected.htmlElement.querySelector('span').innerText.includes(clickedNumber)) {
          selected.htmlElement.querySelector('span').innerHTML =  selected.htmlElement.querySelector('span').innerText.split(' ').filter(numComment=> Number(numComment) != clickedNumber).join(' ');
          return;
        }
    
        selected.htmlElement.querySelector('span').classList.add('comentSpan');
        selected.htmlElement.querySelector('span').innerHTML+= ' ' +clickedNumber;
            
    }
}




socket.on('played',resultBack =>{
    
    let numberx = Array.from(document.querySelectorAll('.numb'));
   const luckyBox = resultBack.lucky.indexBox;
   const luckyNum = resultBack.lucky.indexNum;

const boxPlayed = resultBack.index;

const NumIndex = resultBack.ind;
const color  = resultBack.color;
console.log(color);
const Num = resultBack.num;
const htmlElement = numberx[boxPlayed * 9  + NumIndex];
if(boxPlayed == luckyBox && luckyNum == NumIndex){
    
    htmlElement.classList.remove('lucky');
    if(resultBack.res){
            const span = document.createElement('span');
           const cord =  htmlElement.getBoundingClientRect();
        span.style.position = 'absolute';
        span.style.top = 50+"%";
        span.style.right = 50 +"%";
        span.innerText = '⛏';
        span.style.width = 40 +'px';
        span.style.height = 40 +'px';
        span.style.backgroundColor = '#000'; 
        
        container.append(span);
setTimeout(()=>{
span.remove();
},15000)
    }else{
        const span = document.createElement('span');
        span.classList.add('fly');
           const cord =  htmlElement.getBoundingClientRect();
 
        span.innerText = '⛏';

        container.append(span);
        setTimeout(()=>{
            span.classList.add('animation');
            setTimeout(()=>{
span.remove();
            },2000)
            },50)
    }
}
if(resultBack.idPlayer == socket.id){
  
    LeftScore.innerText = resultBack.score;
}else{
    
    RightScore.innerText = resultBack.score;
}

    if(resultBack.res){

        SoundCorrect.play();
    
        if(htmlElement.classList.contains('incorrect')){
            htmlElement.classList.remove('incorrect')
        }
        htmlElement.classList.add('correct');
        htmlElement.classList.add('u--slideUp');
  
     
        starting[boxPlayed][NumIndex] = Num;
        htmlElement.innerHTML= `<span>${Num}</span>`;
        const span = document.createElement('span');
        span.style.background = color;
        span.classList.add('correctSpan');
        htmlElement.append(span);
    }else{
        SoundIncorrect.play();
        htmlElement.classList.add('incorrect');
        htmlElement.classList.add('animate__hinge');
        setTimeout(()=>{
htmlElement.classList.remove('animate__hinge');
        },2000)
      
        htmlElement.innerHTML= `<span >${Num}</span>`;
    }
 
    });
const clearMap = ()=>{
    casesEl.forEach(casexx=> casexx.innerHTML = '');
}
const setStartTab = (table,lucky)=>{
    clearMap();
        const LuckyBox = lucky.indexBox;
        const LuckyNum = lucky.indexNum;
    table.forEach((box,index)=>{
        
        box.forEach((casex,i) =>{
            if(index == LuckyBox && i == LuckyNum){

                casesEl[index].innerHTML+=`<div data-box = '${index}' data-boxi = '${i}' onclick='select(this)' class="numb lucky"><span></span></div>`;
            }else{

                casesEl[index].innerHTML+=`<div data-box = '${index}' data-boxi = '${i}' onclick='select(this)' class="numb"><span>${casex}</span></div>`;
            }
        })
      })
}
let intervalTimer;
socket.on('join',roomManger =>{
    starting = roomManger.tab;
    setStartTab(starting,roomManger.luckyNumber);
    TimerTurn(30,false);
    loader.style.display = 'none';
    topContainer.classList.remove('blurFilter');

    if(owner){
        rootCss.style.setProperty('--myColor', roomManger.colors[0]);
        rootCss.style.setProperty('--adColor', roomManger.colors[1]);
    }else{
        rootCss.style.setProperty('--myColor', roomManger.colors[1]);
        rootCss.style.setProperty('--adColor', roomManger.colors[0]);
    }
    
    
})


socket.on('warning',msg=>{
    console.log(msg);
})
let IsCounting = false;
const  colorsx = ['blue','red'];
let colorBar;
const TimerTurn = (startTime,ownerx)=>{
 
   if(colorBar == undefined){

       colorBar = ownerx  ? colorsx[0] : colorsx[1] ;
   }else{
    colorBar = colorsx.filter(color=> color != colorBar)[0];
   }
    

    intervalTimer =  setInterval(()=>{
    
    count.innerHTML = startTime;
    leftLoad.style.animationName = 'Turn';
    leftLoad.style.animationDuration = '30s'
    RightLoad.style.animationName = 'TurnX';
    RightLoad.style.animationDuration = '30s';

        leftLoadCont.style.backgroundColor = colorBar; 
        RightLoad.style.backgroundColor = colorBar;
   


        if(startTime < 1){
            clearInterval(intervalTimer);
            
            TimerTurn(30,false);
            IsCounting = false;
            let numberx = Array.from(document.querySelectorAll('.numb'));
            const luckyBoxs =   numberx.filter(num => num.classList.contains('lucky') == true);
          
            luckyBoxs.forEach(num=>{
                      num.classList.remove('lucky');
              })
            startTime = 31;
            leftLoad.style.animationName = 'none';
            RightLoad.style.animationName = 'none';
     
         
        }
    startTime--;
        

       
    },1000)
return intervalTimer;
}


const setLucky = (luckyNumber)=>{
    let numberx = Array.from(document.querySelectorAll('.numb'));
  const luckyBoxs =   numberx.filter(num => num.classList.contains('lucky') == true);

  luckyBoxs.forEach(num=>{
            num.classList.remove('lucky');
    })
const LuckyBox = luckyNumber.indexBox;
const LuckyIndex = luckyNumber.indexNum;

numberx[LuckyBox * 9  + LuckyIndex].classList.add('lucky');
}

socket.on('ready',msg=>{
    clearInterval(intervalTimer);
    TimerTurn(30,true)
        
    SoundTurn.play();
    
   

 
    setLucky(msg);


})






socket.on('finish',roomManger=> {


    starting = roomManger.tab;
    setStartTab(starting,roomManger.luckyNumber);
});