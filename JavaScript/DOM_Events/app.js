let btn=document.querySelector('button');
console.dir(btn);

function sayHello(){
    console.log("Hello");
}

function sayName(){
    console.log("Sahitya");
}

btn.addEventListener('click',sayHello);
btn.addEventListener('click',sayName);
btn.addEventListener('dblclick',()=>console.log("Double Clicked Button 1"));

let btns=document.querySelectorAll('.box');
for(item of btns){
    item.onclick=sayHello;
    item.onmouseenter=()=>console.log("Mouse entered.")
}

