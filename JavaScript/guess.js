const max= prompt("Enter max number:");
console.log(max);

const random=Math.floor(Math.random()*max)+1;
let guess=prompt("Enter number to guess or 'quit' to exit");
while(true){
    if(guess=="quit"){
        break;
    }
    if(guess==random){
        console.log("Congrats! Right answer.");
        break;
    }else if(guess>random){
        guess=prompt("Enter a smaller number.")
    }else{
        guess=prompt("Enter a larger number.")
    }
    
}