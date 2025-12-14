let btn=document.querySelector('button');
let div=document.querySelector('div');
let h3=document.querySelector('h3');

btn.addEventListener("click", ()=>{
    randomColor=getRandomColor();
    h3.innerText=randomColor;
    div.style.backgroundColor=randomColor;
    console.log("Colour Updated");
});

function getRandomColor(){
    let red=Math.floor(Math.random()*255);
    let green=Math.floor(Math.random()*255);
    let blue=Math.floor(Math.random()*255);

    let color=`rgb(${red},${green},${blue})`;
    return color;
}

div.addEventListener('mouseenter',()=>console.log('Mouse inside box'));
div.addEventListener('mouseleave',()=>console.log('Mouse outside box'));
h3.addEventListener('click',function(){
    console.log('Heading clicked');
    console.log(this);
    console.dir(this)
    console.dir(this.innerText);
});

