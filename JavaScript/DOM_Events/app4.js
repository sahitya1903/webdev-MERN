let btn=document.querySelector('button');
let input=document.querySelector('input');

btn.addEventListener('click',function(event){
    console.log(event);
    console.log("Button Clicked")
});

input.addEventListener("keydown",(event)=>{
    console.log(`Key ${event.key} pressed`);        //displayed output
    console.log(`Key Code: ${event.code}`);         //Key Code
    if(event.code=="ArrowUp" || event.code=="KeyW"){
        console.log("Character moves forward.")
    } else if(event.code=="ArrowDown" || event.code=="KeyS"){
        console.log("Character moves backward.")
    } else if(event.code=="ArrowLeft" || event.code=="KeyA"){
        console.log("Character moves left.")
    } else if(event.code=="ArrowRight" || event.code=="KeyD"){
        console.log("Character moves right.")
    }

});

input.addEventListener("keyup",()=>console.log("Key released"));

input.addEventListener("change",()=>{
    console.log("Change Event");
    console.log("Final Value=",this.value);
});

input.addEventListener("input",()=>{
    console.log("Input Event");
    console.log("Final Value=",this.value);
});